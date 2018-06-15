class BtoaErr extends Error {
  public message = 'String contains an invalid character';
  public code = 5;
  name = 'InvalidCharacterError';
}
const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const isSupport: boolean = typeof window !== 'undefined' && !!window.btoa;

export default (function (bool: boolean) {
  const fn = bool ? window.btoa.bind(window) : btoa;
    return function (str: string | number) {
      return fn(escapeStr(str));
    }
})(isSupport);

function escapeStr(str: string | number): string {
  return encodeURIComponent(String(str)).replace(/%([0-9A-F]{2})/g, function(_, p1: any) {
    const code: any = '0x' + p1;
    return String.fromCharCode(code);
  })
}

function btoa(input: string): string {
  let output: string = '';
  for (let block:any, charCode:any, idx = 0, map = chars;
       input.charAt(idx | 0) || (map = '=', idx % 1);
       output += map.charAt(63 & block >> 8 - idx % 1 * 8)
       ) {
    charCode = input.charAt(idx += 3 / 4);
    // 模拟超出8位ASCII编码的字符范围时抛错
    if(charCode > 0xFF){
      throw new BtoaErr();
    }
    block = block << 8 || charCode;
  }
  return output;
}

// 只支持 支持atob的
export function b64DecodeUnicode(str: string) {
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}