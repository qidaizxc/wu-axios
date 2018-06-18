import {combineURLs, isAbsoluteURL} from "../utils/isAbsoluteURL";
import transformData from "./transformData";
import {forEach, merge} from "../utils/commonUtils";
import defaults from "../defaults";
import isCancel from "../cancel/isCancel";

const needDelHeaders: Array<string> =  ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'];
/**
 * 格式化config 并调用adapter 将请求的promise对象返回
 * @param config
 */
export default function dispatchRequest(config:any): Promise<any> {
  throwIfCancellationRequested(config);
  const {headers, baseURL, url, data} = config;
  if(baseURL && !isAbsoluteURL(url)){
    config.url = combineURLs(baseURL, url);
  }
  config.headers = headers || {};
  /**
   * 调用transformRequest 处理data
   */
  config.data = transformData(data, config.headers, config.transformRequest);

  config.headers = merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );
  /**
   * 删除头信息对应的method
   */
  forEach(needDelHeaders, function (method: string) {
    delete config.headers[method];
  });

  const adapter:Adapter = config.adapter || defaults.adapter;
  return adapter(config).then(function (response: any) {
    throwIfCancellationRequested(config);
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  },function (reason:any) {
    if(!isCancel(reason)){
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }
    return Promise.reject(reason);
  })

}

/**
 * Throws a `Cancel` if cancellation has been requested. todo 未研究
 * @param config
 * @returns {Promise}
 */
function throwIfCancellationRequested(config:any) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}