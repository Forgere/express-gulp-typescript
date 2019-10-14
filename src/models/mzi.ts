import async from 'async';
import cheerio from 'cheerio';
import fs from "fs";
import path from "path";
import redis from "redis";
import request from "request";
import * as superagent from 'superagent';

const db: redis.RedisClient = redis.createClient();

interface IRequestOption {
    method: string;
    url: string;
    timeout: number;
    headers: object;
}

export interface IImg {
    name: string;
    path: string;
}

// tslint:disable-next-line: completed-docs
export function downloadSingleImage(url: string, name: string, cb: Function): void {
    const location:string = path.join(__dirname, '../public/images')
    const options: IRequestOption = {
        method: 'GET',
        url: url,
        timeout: 5000,
        headers:
        {
            'postman-token': 'f4b7a0fc-9ef4-e7ea-d4b7-f4132fb87380',
            'cache-control': 'no-cache',
            referer: `http${':'}//www.mzitu.com`,
        }
    };

    fs.exists(`${location}/${name}.jpg`, (exist: boolean) => {
        if (exist) {
            cb(new Error('已经存在'))
        } else {
            request(options.url, options, (error: Error): void => {
                if (error !== null) {
                    cb(error);
                }
                const direcIsExist: boolean = fs.existsSync(`${location}`)
        
                if (!direcIsExist) {
                    fs.mkdirSync(location)
                }
            })
                .pipe(
                    fs.createWriteStream(`${location}/${name}.jpg`, { encoding: 'base64' })
                )
                .on('close', () => {
                    const result: IImg = {
                        name,
                        path: `${location}/${name}.jpg`,
                    }
                    db.sadd('imgs', JSON.stringify(result), (err: Error | null, reply: any) => {
                        cb(null, result);
                    })
                })
            }
    })
}

export function downloadGroup(urls: string[], title: string, callback: Function): void{
    let a: number = 0;
    const vv: Date = new Date();

    const q: async.AsyncQueue<unknown> = async.queue((url: string, cb: Function) => {
        downloadSingleImage(url, title+a.toString(), (err: Error | null, reply: any) => {
            a = a + 1
            if (err !== null) {
                cb(err)
            } else {
                cb(null ,reply)
            }
        });
    }, 1);
    
    urls.forEach((element: string) => {
        q.push(element);
    });

    q.drain(() => {
        const useTime: number =  new Date().getTime() - vv.getTime();
        console.log(`图集${title}-${a}张-用时${useTime}ms`);
        callback(null, `图集${title}-${a}张-用时${useTime}ms`);
    });

}

export function downloadSinglePage(url: string, callback: Function): void {
    superagent.get(url)
        .end((err: superagent.ResponseError, res: superagent.Response) => {
            if (res !== undefined && res.text !== undefined) {
                const $: CheerioStatic = cheerio.load(res.text);
                const src: string = $('.main-image a img').attr('src')
                const title: string = $('.main-image a img').attr('alt')

                const navs: Cheerio = $(".pagenavi a span");
                const page: string | null= $(navs[navs.length-2]).html();
                const content: string = page === null ? '0' : page.toString();
                if (!(src !== undefined && src.slice !== undefined)) {
                    callback(`${url}有问题`)

                } else {
                    const pre: string = src.slice(0,src.length-6)
                    const numb: number = parseInt(content, 10)
                    const arr: string[] = []

                    for (let index: number = 1; index < numb+1; index+= 1) {
                        const locate: string = index < 10 ? `0${index.toString()}` : index.toString()
                        arr.push(`${pre}${locate}.jpg`);
                    }
                    downloadGroup(arr,title,callback)
                }

            } else {
                downloadSinglePage(url,callback)
            }
        })
}

export function downloadServalPage(index: string, callback: Function): void {
    let a = 0;
    const q: async.AsyncQueue<unknown> = async.queue((url: string, cb: Function) => {
        a = a + 1
        downloadSinglePage(url, cb);
    }, 2);
    
    q.empty(() => { 
        console.log('no more tasks wating'); 
    })
    
    q.drain(() => {
      // 完成了队列中的所有任务
      console.log(`完成所有${a}套下载`)
    });
    
    let url: string = `http://www.mzitu.com/page/${index}/`
    if (parseInt(index, 10) === 1) {
        url = 'http://www.mzitu.com/'
    }
    const urls: string[] = []
    superagent.get(url)
        .end((err: superagent.ResponseError, res: superagent.Response) => {
            if (res !== undefined && res.text !== undefined) {
                const $: CheerioStatic = cheerio.load(res.text);
                const imgs: Cheerio = $('#pins li span a')

                imgs.each((i: number,element: CheerioElement) => {
                    urls.push($(element).attr('href'))
                    q.push($(element).attr('href'))
                });

                callback(null, urls.length)
            }
        })
}