export function enhanceError(error:any, config:any, code:any, request:any, response:any = null) {
  return Object.assign({}, error, {
    config,
    code,
    request,
    response,
  });
}

export default function createError(message:string, config: any, code: any, request: any, response: ResponseData | null = null) {
  const error:Error = new Error(message);
  return enhanceError(error, config, code, request, response);
}
