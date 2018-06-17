import {isFormData} from "../utils/commonUtils";
import {btoa} from '../utils/btoa'
import buildURL from "../utils/buildURL";
import parseHeaders from "../utils/parseHeaders";
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
    const url = buildURL(config.url, config.params, config.paramsSerializer)
    request.open(config.method.toUpperCase(), url, true);
    // 设置延时
    request.timeout = config.timeout;

    request.onreadystatechange = function handleLoad() {
      if(!checkReqListener(request, xDomin)) return;

    }
  })
} as Adapter);

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

