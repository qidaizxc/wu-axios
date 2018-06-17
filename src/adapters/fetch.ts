import {isFormData} from "../utils/commonUtils";
import btoa from "../utils/btoa";
import buildURL from "../utils/buildURL";

export default function fetchAdapter(config: any) {
  let requestData:any = config.data,
    requestHeaders:any = config.headers;
  if(isFormData(requestData)){
    delete requestHeaders['Content-Type']
  }
  if(config.auth){
    const username = config.auth.username || '',
      password = config.auth.password || '';
    requestHeaders.Authorization = 'Basic' + btoa(username + ':' + password);
  }
  // 使fetch可以携带cookie
  requestHeaders.credientials = 'include';
  const url = buildURL(config.url, config.params, config.paramsSerializer);
  return new Promise((resolve, reject) => {
    fetch(url, createInitData(config, requestData, requestHeaders))
  })
}

function createInitData(config:any, requestData:any, requestHeaders: any): RequestInit{
  // AbortController todo
  const initData: RequestInit = {
    body: requestData,
    method: config.method.toUpperCase(),
    headers: requestHeaders,
    // todo
    mode: 'no-cors'
  }
  if(config.cache){
    initData.cache = config.cache;
  }
  if(config.credentials){
    initData.credentials = config.credentials;
  }
  if('integrity' in config){
    initData.integrity = config.integrity;
  }
  if('keepalive' in config){
    initData['keepalive'] = config['keepalive'];
  }
  // todo
  if (config.withCredentials) {
    initData.mode = ''
  }
  return initData;
}
