// 不需要data参数
import InterceptorManager, {Handler} from "./InterceptorManager";
import mergeConfig from "./mergeConfig";
import dispatchRequest from "./dispatchRequest";

const methods: string[] = ['delete', 'get', 'head', 'options'];
// 需要data参数
const methodsWithData:string[] = ['post', 'put', 'patch'];

export interface RequestConfig {
  method?: string;
  url?: string;
  data?: any;

}

export interface AxiosConfig {
  // 请求发送器
  adapter: Adapter;
  headers?: Headers;
}


export interface Headers {
  [key:string]: any;
}


export interface Interceptors {
  request: InterceptorManager;
  response: InterceptorManager;
}


class Axios {
  // 初始化config
  private defaults: AxiosConfig;
  // 加载 请求、响应 处理器
  public interceptors:Interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager(),
  };
  constructor(instanceConfig: AxiosConfig){
    this.defaults = instanceConfig;
  }

  /**
   * ```js
   *  request(url, config)、request(config) 两种都可以
   * ```
   * @param url
   * @param _config
   */
  public request(url: string | any, _config?: any): Promise<any> {
    let config:any;
    if(typeof url === 'string'){
      config = {..._config, url};
    }else {
      config = {...url};
    }
    config = mergeConfig(this.defaults, config);
    let promise: Promise<any> = Promise.resolve(config);
    const chain: Array<any> = [dispatchRequest,undefined];
    /**
     * 形成数据处理流 初始化promise对象 使用.then函数链接每一步 包括处理请求数据 以及 处理响应数据
     * 处理请求的塞在请求前面
     * 处理响应的塞在请求后面  !!漂亮!!
     */
    this.interceptors.request.forEach(function (interceptor: Handler) {
      if(interceptor){
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      }
    });
    this.interceptors.response.forEach(function (interceptor: Handler) {
      if(interceptor){
        chain.push(interceptor.fulfilled, interceptor.rejected);
      }
    });
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }
    return promise;
  }
}

/**
 * 混入方法 统一调request
 */
methods.forEach(method => {
  Object.defineProperty(Axios.prototype, method, {
    value(url: any, config: any) {
      return this.request(url, Object.assign({}, config, {url, method}));
    }
  })
});

methodsWithData.forEach(method => {
  Object.defineProperty(Axios.prototype, method, {
    value(url: any, data:any, config: any) {
      return this.request(url, Object.assign({}, config, {url, method, data}));
    }
  })
});

export default Axios