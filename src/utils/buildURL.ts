import {forEach, isDate, isObject, isURLSearchParams} from "./commonUtils";

export default function  buildURL(url: string, params?: any, paramSerializer?: Function): string {
  if(!params){
    return url;
  }
  let serializedParams: string;
  if(paramSerializer){
    serializedParams = paramSerializer(params);
  }else if(isURLSearchParams(params)){
    serializedParams = params.toString();
  }else {
    const parts: string[] = [];
    forEach(params, function (val: any, key:any) {
      formatVal(val, key, parts);
    })
    serializedParams = parts.join('&');
  }
  if(serializedParams){
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }
  return url;
}

function formatVal(val: any,key:any, parts: string[]) {
  if (val === null || typeof val === 'undefined') {
    return;
  }
  if(Array.isArray(val)){
    key = key + '[]';
  }else {
    val = [val];
  }
  forEach(val, function (v) {
    if(isDate(v)){
      v = v.toISOString();
    }else if(isObject(v)){
      v = JSON.stringify(v);
    }
    parts.push(encode(key) + '=' + encode(v));
  })
}

function encode(val: string) {
  return encodeURIComponent(val).
  replace(/%40/gi, '@').
  replace(/%3A/gi, ':').
  replace(/%24/g, '$').
  replace(/%2C/gi, ',').
  replace(/%20/g, '+').
  replace(/%5B/gi, '[').
  replace(/%5D/gi, ']');
}