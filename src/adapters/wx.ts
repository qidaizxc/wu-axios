export default (function (config:any) {
  return new Promise((resolve, reject) => {
    wx.request(Object.assign({}, config, {success: resolve, fail: reject}));
  })
}) as Adapter