import {isStandardBrowserEnv, isNumber, isString} from "./commonUtils";

/*export interface CookieHelper {
  write: (name?:string, value?:string, expires?: number, path?:string, domain?:string, secure?:boolean)=>void;
  read: (name?:string)=> string | null;
  remove: (name?: string)=> void;
}*/

type CookieUtil = ()=> CookieHelper;

class CookieHelper {
  // isStandardBrowserEnv
  static isStandardBrowserEnv:boolean = isStandardBrowserEnv();

  write(name:string, value:string, expires?: number, path?:string, domain?:string, secure?:boolean) {
    if(CookieHelper.isStandardBrowserEnv){
      return;
    }
    const cookie:string[] = [];
    cookie.push(name + '=' + encodeURIComponent(value));
    if(expires && isNumber(expires)){
      cookie.push('expires=' + (<any>new Date(expires)).toGMTString());
    }
    if(isString(path)){
      cookie.push('path=' + path);
    }
    if(isString(domain)){
      cookie.push('domain=' + domain);
    }
    if(secure === true){
      cookie.push('secure');
    }
    document.cookie = cookie.join('; ');
  }

  read(name: string): string | null {
    if(CookieHelper.isStandardBrowserEnv){
      return null;
    }
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return (match ? decodeURIComponent(match[3]) : null);
  }

  remove(name:string) {
    if(CookieHelper.isStandardBrowserEnv){
      return;
    }
    this.write(name, '', Date.now() - 86400000);
  }
}




export default (function standardBrowserEnv() {
  return new CookieHelper();
} as CookieUtil)
