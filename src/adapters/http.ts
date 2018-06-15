const httpAdapter: Adapter = function (config: any) {
  return new Promise((resolvePromise, rejectPromise) => {
    let timer: any;
    const resolve = (value: any)=>{
      clearTimeout(timer);
      resolvePromise(value);
    }
    const reject = (value: any)=>{
      clearTimeout(timer);
      rejectPromise(value);
    }
    const {data, headers} = config;
    if(!headers['User-Agent'] && !headers['user-agent']){
      headers['User-Agent'] = 'wu-axios/' + '1.0.0';
    }
    if(data &&)
  })
}


export default httpAdapter;