export default function settle(resolve: Function, reject: Function, response: ResponseData):void {
  const validateStatus:any = response.config.validateStatus;
  if(!response.status || !validateStatus || validateStatus(response.status)){
    resolve(response);
  }else {
    reject()
  }
}
