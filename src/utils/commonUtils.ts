
type callback = (value?:any,index?: string | number)=>void;

const toString = Object.prototype.toString;


export function isObject(val: any):boolean {
  return val !== null && typeof val === 'object';
}

export function isFunction(val: any):boolean {
  return toString.call(val) === '[object Function]';
}

export function isStream(val: any):boolean {
  return isObject(val) && isFunction(val.pipe);
}

export function isDate(val: any) {
  return toString.call(val) === '[object Date]';
}

export function isBlob(val: any):boolean {
  return toString.call(val) === '[object Blob]';
}

export function isURLSearchParams(val: any):boolean {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

export function isFormData(val: any): boolean {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

// 匹配一个空白字符，包括空格、制表符、换页符和换行符。
export function trim(str: string):string {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

export function forEach(obj:any,fn:callback):void {
  if(obj === null || typeof obj === 'undefined' || !fn){
    return;
  }
  if(typeof obj !== 'object'){
    obj = [obj];
  }
  if(Array.isArray(obj)){
    obj.forEach(fn)
  }else {
    for (const key in obj){
      if(Object.prototype.hasOwnProperty.call(obj, key)){
        fn.call(null, obj[key], key);
      }
    }
  }
}