// 不需要data参数
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

}


class Axios {
  private config: AxiosConfig;
  constructor(config: AxiosConfig){
    this.config = config;
  }
  public request() {

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