import {forEach} from "./commonUtils";

const ignoreDuplicateOf:string[] = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

export default function parseHeaders(headers: string): ParseHeader {
  const parsed: ParseHeader = {};
  if(!headers){
    return parsed;
  }
  forEach(headers.split('\n'), function (line: string) {
    const i = line.indexOf(':'),
      key:string = line.substr(0, i).trim().toLowerCase(),
      val = line.substr(i + 1).trim();
    if(key){
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });
  return parsed;
}
