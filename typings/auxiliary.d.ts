declare type Decorator = (target?:any, property?: string, description?:any) => void

declare var wx: any;

declare type Adapter = (config:any)=>any;


declare interface ResponseData {
  data: any;
  status: number;
  statusText: string;
  headers: ParseHeader | null;
  config: any;
  request: XMLHttpRequest | null;
}


declare interface ParseHeader {
  [key:string]: any;
}


declare module 'follow-redirects';
