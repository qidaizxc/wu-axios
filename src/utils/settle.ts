import createError from "./createError";

export default function settle(resolve: Function, reject: Function, response: ResponseData):void {
  const validateStatus:any = response.config.validateStatus;
  if(!response.status || !validateStatus || validateStatus(response.status)){
    resolve(response);
  }else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
}
