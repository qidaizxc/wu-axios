import {forEach} from "../utils/commonUtils";

export interface Handler {
  fulfilled: Function,
  rejected?: Function,
}

export default class InterceptorManager {
  private handlers: Array<null | Handler> = [];

  /**
   * 将处理函数加入handler中 并返回当前所处位置 作为id在移除时可以使用
   * @param {Function} fulfilled
   * @param {Function} rejected
   * @returns {number}
   */
  use(fulfilled: Function, rejected?: Function): number{
    this.handlers.push({rejected, fulfilled});
    return this.handlers.length - 1;
  }

  /**
   * 取消处理 用use函数返回的id
   * @param {number} id
   */
  eject(id: number){
    if(this.handlers[id]){
      this.handlers[id] = null;
    }
  }
  forEach(fn: Function){
    forEach(this.handlers, function (h) {
      if(h !== null){
        fn(h);
      }
    })
  }
}