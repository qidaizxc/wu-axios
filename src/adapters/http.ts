import {isStream, isArrayBuffer, isString} from "../utils/commonUtils";
import createError from "../utils/createError";
import * as url from 'url';

const httpAdapter: Adapter = function (config: any) {
  return new Promise((resolvePromise, rejectPromise) => {
    let timer: any;
    const resolve = (value: any)=>{
      clearTimeout(timer);
      resolvePromise(value);
    }
    const reject = (value: any)=>{
      clearTimeout(timer);
      rejectPromise(value);
    }
    let {data, headers} = config;
    if(!headers['User-Agent'] && !headers['user-agent']){
      headers['User-Agent'] = 'wu-axios/' + '1.0.0';
    }
    // 将数据格式化为buffer
    if(data && !isStream(data)){
      if(Buffer.isBuffer(data)){

      }else if(isArrayBuffer(data)){
        data = new Buffer(new Uint8Array(data));
      }else if(isString(data)){
        data = new Buffer(data, 'utf-8');
      }else {
        reject(
          createError('Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          config,
            null,
            null,
            null
            ));
        return;
      }
      headers['Content-Length'] = data.length;
    }

    let auth:any = undefined;
    if(config.auth){
      const username = config.auth.username || '';
      const password = config.auth.password || '';
      auth = username + ':' + password;
    }
    const parsed = url.parse(config.url);
    const protocol:string = parsed.protocol || 'http:';
    if(!auth && parsed.auth){
      const urlAuth:string[] = parsed.auth.split(':');
      const urlUsername = urlAuth[0] || '';
      const urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }
    if (auth) {
      delete headers.Authorization;
    }
    const isHttps = protocol === 'https:';
  //  todo
  })
}


export default httpAdapter;
