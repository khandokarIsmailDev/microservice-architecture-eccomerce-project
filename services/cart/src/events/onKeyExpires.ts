import {Redis} from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "../config";


const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT 
})

const CHANNEL_KEY = '__keyevent@0__:expired' ; // redis channel name , ja redis default channel name; 
redis.config('SET','notify-keyspace-events','Ex');
redis.subscribe(CHANNEL_KEY);


redis.on('message',async(ch,message) =>{
    if(ch === CHANNEL_KEY){
        console.log('key expired: ',message)
    }
})

// AGew ekta redis channel create kora hoise, but seta use kora jabe na; amader alada kore redis connection create korte hobe, ekhan thekei amra pub-sub dekbo
// 2 mint e product expire hoye jabe(jodi user product checkout na kore); 2 mint por product add-to-cart theke delete hoye jabe; and sei delete howa item ta abar jate inventory te add hoy setar jonno amra ai event use korbo;