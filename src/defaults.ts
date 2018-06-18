import xhr from "./adapters/xhr";
import http from './adapters/http';
import fetchAdapter from "./adapters/fetch";
// 根据环境获取当前请求方法
function getDefaultAdapter():Adapter {
  let adapter: Adapter = (config: any) => {return config};
  // node.js 端
  if(typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]'){
    adapter = http;
    // fetch 请求
  }else if(typeof window !== 'undefined' && typeof window.fetch !== 'undefined'){
    adapter = fetchAdapter;
  // ajax请求
  } else if(typeof XMLHttpRequest !== 'undefined'){
    adapter = xhr;
  // 微信请求
  }else if(typeof wx !== 'undefined' && wx.request){

  }
  return adapter;
}
// todo
const defaults:any = {
  adapter: getDefaultAdapter(),

};


export default defaults;
