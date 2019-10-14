import async from 'async';
import fs from "fs";
import path from "path";
import redis from "redis";
import request from "request";

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
            if (a === urls.length) {
                callback(null, `图集${title}-${a}张-用时${new Date().getTime() - vv.getTime()}ms`);
            }
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
        callback(null, `图集${title}-${a}张-用时${useTime}ms`);
    });

}