
type callback = (value?:any,index?: string | number)=>void;

const toString = Object.prototype.toString;


export function isNumber(val:any) {
  return typeof val === 'number';
}

export function isString(val: any):boolean {
  return typeof val === 'string';
}

export function isArrayBuffer(val: any) {
  return toString.call(val) === '[object ArrayBuffer]';
}

export function isObject(val: any):boolean {
  return val !== null && typeof val === 'object';
}

export function isFunction(val: any):boolean {
  return toString.call(val) === '[object Function]';
}

/**
 * 有pipe方法
 * @param val
 * @returns {boolean}
 */
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
export function trimStr(str: string):string {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

export function isStandardBrowserEnv(): boolean {
  if(typeof navigator !== 'undefined' && navigator.product === 'ReactNative'){
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
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

/**
 * 深度复制、合并 函数 只深复制了object
 * @param objs
 */
export function deepMerge(...objs:any[]) {
  const result:any = {};
  objs.forEach(function (obj: any) {
    forEach(obj, function (val:any, key:any) {
      if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = deepMerge(result[key], val);
      } else if (typeof val === 'object') {
        result[key] = deepMerge({}, val);
      } else {
        result[key] = val;
      }
    })
  })
}

export function merge(...objs: any[]) {
  const result:any = {};
  objs.forEach(function (obj: any) {
    forEach(obj, function (val: any, key: any) {
      if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = merge(result[key], val);
      } else {
        result[key] = val;
      }
    })
  });
  return result;
}