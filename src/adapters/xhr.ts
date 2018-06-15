import {isFormData} from "../utils/commonUtils";
import {btoa} from '../utils/btoa'
import buildURL from "../utils/buildURL";
export default (function xhrAdapter(config: any) {
  return new Promise((resolve, reject) => {
    const requestData:any = config.data,
      requestHeaders = config.headers,
      request: XMLHttpRequest = new XMLHttpRequest(),
      xDomin:boolean = false;
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
    // todo
    request.onreadystatechange = function () {

    }
  })
} as Adapter)