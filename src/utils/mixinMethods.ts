export function mixinRequest(methods: string[]): Decorator {
  return function (target) {
    const obj:any = target.prototype ? target.prototype : target;
    methods.forEach(method=>{
      Object.defineProperty(obj, method, {
        value(){
          return this.request(method, arguments)
        }
      })
    })
  }
}