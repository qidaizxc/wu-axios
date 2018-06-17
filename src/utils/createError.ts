export function enhanceError(error:any, config:any, code:any, request:any, response:any) {
  return Object.assign({}, error, {
    config,
    code,
    request,
    response,
  });
}
// todo
export default function createError() {

}
