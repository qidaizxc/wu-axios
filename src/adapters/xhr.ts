import {forEach, isFormData, isStandardBrowserEnv} from "../utils/commonUtils";
import btoa from '../utils/btoa'
import buildURL from "../utils/buildURL";
import parseHeaders from "../utils/parseHeaders";
import settle from "../utils/settle";
import createError from "../utils/createError";
import cookiesUtil from "../utils/cookies";
import isURLSameOrigin from "../utils/isURLSameOrigin";

export default (function xhrAdapter(config: any) {
  return new Promise((resolve, reject) => {
    let requestData:any = config.data,
      requestHeaders = config.headers,
      request: XMLHttpRequest = new XMLHttpRequest();
    let xDomin:boolean = false;
    // formData浏览器会自动去设置Content-Type
    if(isFormData(requestData)){
      delete requestHeaders['Content-Type']
    }
    // HTTP basic authentication
    if(config.auth){
      const username = config.auth.username || '',
            password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic' + btoa(username + ':' + password);
    }
    // 格式化URL成查询字符串格式
    const url = buildURL(config.url, config.params, config.paramsSerializer)

    request.open(config.method.toUpperCase(), url, true);
    // 设置延时
    request.timeout = config.timeout;
    // 添加监听事件
    addRequestEvent( request, config, xDomin, resolve, reject);

    if(isStandardBrowserEnv()){
      const cookies = cookiesUtil();
      const xsrfValue: string | null = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) : null;
      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    if('setRequestHeader' in request){
      forEach(requestHeaders, function (val:any, key:any) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      })
    }

    if (config.withCredentials) {
      request.withCredentials = true;
    }
    // 格式化返回值
    if(config.responseType){
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }
    // 取消
    if (config.cancelToken) {
      config.cancelToken.promise.then(function onCanceled(cancel:any) {
        if (!request) {
          return;
        }
        request.abort();
        reject(cancel);
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }
    // 开始发送response
    request.send(requestData);
  })
} as Adapter);

/**
 * 监听事件的判断
 * @param {XMLHttpRequest} request
 * @param {boolean} xDomin
 * @returns {boolean}
 */
function checkReqListener(request: XMLHttpRequest, xDomin: boolean):boolean {
  if(!request || (request.readyState !== 4 && !xDomin)){
    return false;
  }
  const responseURL = request.responseURL;
  if(request.status === 0 && !(responseURL && responseURL.indexOf('file:') === 0)){
    return false;
  }
  return true;
}

/**
 * 格式化返回response
 * @param {XMLHttpRequest} request
 * @param config
 * @returns {ResponseData}
 */
function prepareResponese(request: XMLHttpRequest, config:any): ResponseData {
  const responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
  const responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
  return {
    data: responseData,
    status: request.status === 1223 ? 204 : request.status,
    statusText: request.status === 1223 ? 'No Content' : request.statusText,
    headers: responseHeaders,
    config,
    request,
  }
}

/**
 * 添加监听事件
 * @param {XMLHttpRequest} request
 * @param config
 * @param {boolean} xDomin
 * @param {Function} resolve
 * @param {Function} reject
 */
function addRequestEvent(
  request: XMLHttpRequest,
  config:any,
  xDomin:boolean,
  resolve: Function,
  reject: Function,
) {
  // 请求readystate改变
  request.onreadystatechange = function handleLoad() {
    if (!checkReqListener(request, xDomin)) return;
    const response: ResponseData = prepareResponese(request, config);
    settle(resolve, reject, response);
  }
  // 中断
  request.onabort = function handleAbort() {
    if (!request) return;
    reject(createError('Request aborted', config, 'ECONNABORTED', request, null));
  }
  // 发生错误
  request.onerror = function () {
    reject(createError('Network Error', config, null, request, null))
  }
  // 超时
  request.ontimeout = function handleTimeout() {
    reject(createError('timeout of ' + config.timeout + 'ms exceeded',
      config,
      'ECONNABORTED',
      request,
      null
    ));
    // 处理progress
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // 上传的进程 但是有的浏览器不支持
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }
  }
}

