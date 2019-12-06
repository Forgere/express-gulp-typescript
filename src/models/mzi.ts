import async from 'async';
import cheerio from 'cheerio';
import fs from "fs";
import path from "path";
import request from "request";
import * as superagent from 'superagent';

const DOWNTAOTU: number = 1;
const DOWNIMAGE: number = 2;

interface IRequestOption {
    method: string;
    url: string;
    timeout: number;
    headers: object;
}

interface ITaotu {
    id: string;
    first: string;
    name: string;
}

interface IOptions {
    method: string;
    url: string;
    headers: {
        'cache-control': string;
        Connection: string;
        'Content-Length': string;
        'Accept-Encoding': string;
        Host: string;
        'Postman-Token': string;
        'Cache-Control': string;
        Accept: string;
        'User-Agent': string;
        'Content-Type': string;
    };
    form: any;
}

export interface IImg {
    name: string;
    path: string;
}

// tslint:disable-next-line: completed-docs
export function downloadSingleImage(url: string, _id: string, name: string, cb: Function): void {
    const location: string = path.join(__dirname, `../public/images`)
    const options: IRequestOption = {
        method: 'GET',
        url: url,
        timeout: 5000,
        headers:
        {
            'postman-token': 'f4b7a0fc-9ef4-e7ea-d4b7-f4132fb87380',
            'cache-control': 'no-cache',
            referer: `https://www.mzitu.com`,
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
                    cb(null, result);
                })
                .on('error', () => {
                    console.log('error')
                })
        }
    })
}

export function downloadGroup(urls: string[], title: string, id: string, callback: Function): void {
    let a: number = 0;
    const vv: Date = new Date();

    const q: async.AsyncQueue<unknown> = async.queue((url: string, cb: Function) => {
        downloadSingleImage(url, id, title + a.toString(), (_err: Error | null, _reply: any) => {
            a = a + 1
            cb()
        });
    }, DOWNIMAGE);

    urls.forEach((element: string) => {
        q.push(element);
    });

    q.drain(() => {
        const useTime: number = new Date().getTime() - vv.getTime();
        console.log(`图集${title}-${a}张-用时${useTime}ms`);
        callback(null, `图集${title}-${a}张-用时${useTime}ms`);
    });
}

export function downloadSinglePage(url: string, callback: Function): void {
    const id: string = url.split('com/')[1];
    superagent.get(url)
        .set('Host', 'www.mzitu.com')
        .set('User-Agent', 'PostmanRuntime/7.20.1')
        .set('Accept', '*/*')
        .end((_err: superagent.ResponseError, res: superagent.Response) => {
            if (res !== undefined && res.text !== undefined) {
                const $: CheerioStatic = cheerio.load(res.text);
                const src: string = $('.main-image a img').attr('src')
                const title: string = $('.main-image a img').attr('alt')

                const navs: Cheerio = $(".pagenavi a span");
                const page: string | null = $(navs[navs.length - 2]).html();
                const content: string = page === null ? '0' : page.toString();
                if (!(src !== undefined && src.slice !== undefined)) {
                    callback(`${url}有问题`)

                } else {
                    const pre: string = src.slice(0, src.length - 6)
                    const numb: number = parseInt(content, 10)
                    const arr: string[] = []

                    for (let index: number = 1; index < numb + 1; index += 1) {
                        const locate: string = index < 10 ? `0${index.toString()}` : index.toString()
                        arr.push(`${pre}${locate}.jpg`);
                    }
                    downloadGroup(arr, title, id, callback)
                }

            } else {
                downloadSinglePage(url, callback)
            }
        })
}

export function downloadServalPage(index: string, callback: Function): void {
    console.log("downloadServalPage" + index)
    let a: number = 0;
    const urls: string[] = []
    const q: async.AsyncQueue<unknown> = async.queue((uri: string, cb: Function) => {
        downloadSinglePage(uri, () => {
            a = a + 1
            if (a === urls.length) {
                console.info(`page:${index},taotu:${urls.length}`)
                callback(null, urls.length)
            }
            cb()
        });
    }, DOWNTAOTU);

    q.empty(() => {
        console.log('no more tasks wating');
    })

    q.drain(() => {
        // 完成了队列中的所有任务
        console.info(`完成所有${a}套下载`)
    });

    let url: string = `https://www.mzitu.com/page/${index}/`
    if (parseInt(index, 10) === 1) {
        url = 'https://www.mzitu.com/'
    }

    const options: IOptions = {
        method: 'GET',
        url: url,
        headers:
        {
            'cache-control': 'no-cache',
            Connection: 'keep-alive',
            'Content-Length': '39',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'www.mzitu.com',
            'Postman-Token': 'e861b50c-cc31-4f9b-9043-059138618560,8c96a487-097a-4249-a189-6e26193d7d25',
            'Cache-Control': 'no-cache',
            Accept: '*/*',
            'User-Agent': 'PostmanRuntime/7.20.1',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: { novel_title: '11212', novel_desc: '1313dasdad' }
    };

    superagent.get(url)
        .set('Host', 'www.mzitu.com')
        .set('User-Agent', 'PostmanRuntime/7.20.1')
        .set('Accept', '*/*')
        .end((_err: superagent.ResponseError, res: superagent.Response) => {
            if (res !== undefined && res.text !== undefined) {
                const $: CheerioStatic = cheerio.load(res.text);
                const imgs: Cheerio = $('#pins li span a')

                imgs.each((_i: number, element: CheerioElement) => {
                    urls.push($(element).attr('href'))
                    q.push($(element).attr('href'))
                });
            } else {
                downloadServalPage(index, callback);
            }
        })
}