import {deepMerge, forEach, isObject} from "../utils/commonUtils";

const normalMerge: Array<string> = ['url', 'method', 'params', 'data'];

const deepMergeArr: Array<string> = ['headers', 'auth', 'proxy'];

const coverProp: Array<string> = [
  'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
  'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
  'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'maxContentLength',
  'validateStatus', 'maxRedirects', 'httpAgent', 'httpsAgent', 'cancelToken',
  'socketPath'
]

export default function mergeConfig(config1:any, config2:any ) {
  config2 = config2 || {};
  const config:any = {};
  forEach(normalMerge, function (prop: string) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    }
  });
  // 深度覆盖
  forEach(deepMergeArr, function (prop: string) {
    if(isObject(config2[prop])){
      config[prop] = deepMerge(config1[prop], config2[prop])
    }else if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (isObject(config1[prop])) {
      config[prop] = deepMerge(config1[prop]);
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  })
  // 覆盖
  forEach(coverProp, function (prop: any) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  })
  return config;
}