import {isFormData} from "../utils/commonUtils";
import btoa from "../utils/btoa";
import buildURL from "../utils/buildURL";
import createError from "../utils/createError";

const isSupportAbortController: boolean = typeof AbortController !== 'undefined';
/**
 * fetch 请求 由于api并不完整 除了promise完美支持之外 其它
 * @param config
 * @returns {Promise<any>}
 */
export default function fetchAdapter(config: any) {
  let requestData: any = config.data,
    requestHeaders: any = config.headers,
    timer: any = null, controller: any;
  if (isFormData(requestData)) {
    delete requestHeaders['Content-Type']
  }
  if (config.auth) {
    const username = config.auth.username || '',
      password = config.auth.password || '';
    requestHeaders.Authorization = 'Basic' + btoa(username + ':' + password);
  }
  // url
  const url = buildURL(config.url, config.params, config.paramsSerializer);
  // 配置信息
  const initObj = createInitData(config, requestData, requestHeaders);
  return new Promise((promiseResolve, promiseReject) => {
    const resolve = (value: any) => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      promiseResolve(value);
    };
    const reject = (value: any) => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      promiseReject(value);
    };
    // 设置超时
    /**
     * AbortController 兼容性并不好 在最新的浏览器才会有支持
     * 如果不支持不再调用原生停止 而只是将promise状态改为reject
     */
    if (config.timeout) {
      if (isSupportAbortController) {
        controller = new AbortController();
        initObj.signal = controller.signal;
      }
      timer = setTimeout(() => {
        timer = null;
        controller ? controller.abort() : reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', null))
      }, config.timeout);
    }
    fetch(url, initObj)
      .then((response: Response) => {
        // todo 对返回数据格式化 根据responseType

      }).catch(e => {
      reject(createError(e, config, 'FETCHERROR', null))
    })
  })
}

function createInitData(config: any, requestData: any, requestHeaders: any): RequestInit {
  //
  const initData: RequestInit = {
    body: requestData,
    method: config.method.toUpperCase(),
    headers: requestHeaders,
  }
  if (config.withCredentials) {
    // 使fetch可以携带cookie 跨域可以携带凭证
    requestHeaders.credientials = 'include';
  }
  if (config.cache) {
    initData.cache = config.cache;
  }
  if (config.credentials) {
    initData.credentials = config.credentials;
  }
  if ('integrity' in config) {
    initData.integrity = config.integrity;
  }
  if ('keepalive' in config) {
    initData['keepalive'] = config['keepalive'];
  }
  // todo  未找到mode的详细介绍的相关资料
  if (config.fetchMode) {
    initData.mode = config.fetchMode;
  }
  return initData;
}

/** 手动实现progress todo
 * ```js
 * // fetch() returns a promise that resolves once headers have been received
 fetch(url).then(response => {
      // response.body is a readable stream.
      // Calling getReader() gives us exclusive access to the stream's content
      var reader = response.body.getReader();
      var bytesReceived = 0;

      // read() returns a promise that resolves when a value has been received
      reader.read().then(function processResult(result) {
          // Result objects contain two properties:
          // done  - true if the stream has already given you all its data.
          // value - some data. Always undefined when done is true.
          if (result.done) {
            console.log("Fetch complete");
            return;
          }

          // result.value for fetch streams is a Uint8Array
          bytesReceived += result.value.length;
          console.log('Received', bytesReceived, 'bytes of data so far');

          // Read some more, and call this function again
          return reader.read().then(processResult);
      });
   });
 ```
 */