import {isStream, isArrayBuffer, isString} from "../utils/commonUtils";
import createError, {enhanceError} from "../utils/createError";
import * as url from 'url';
import * as http from 'http';
import * as https from 'https';
import buildURL from "../utils/buildURL";
import {UrlWithStringQuery} from "url";
import {ClientRequest, IncomingMessage} from "http";
import * as zlib from 'zlib';
import settle from "../utils/settle";

const httpFollow = require('follow-redirects').http;
const httpsFollow = require('follow-redirects').https;

const httpAdapter: Adapter = function (config: any) {
  return new Promise((resolvePromise, rejectPromise) => {
    let timer: any = null;
    const resolve = (value: any) => {
      timer && clearTimeout(timer);
      resolvePromise(value);
    }
    const reject = (value: any) => {
      timer && clearTimeout(timer);
      rejectPromise(value);
    }
    let {data, headers} = config;
    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = 'wu-axios/' + '1.0.0';
    }
    // 将数据格式化为buffer
    if (data && !isStream(data)) {
      if (Buffer.isBuffer(data)) {

      } else if (isArrayBuffer(data)) {
        data = new Buffer(new Uint8Array(data));
      } else if (isString(data)) {
        data = new Buffer(data, 'utf-8');
      } else {
        reject(
          createError('Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
            config,
            null,
            null,
            null
          ));
        return;
      }
      headers['Content-Length'] = data.length;
    }

    let auth: any = undefined;
    if (config.auth) {
      const username = config.auth.username || '';
      const password = config.auth.password || '';
      auth = username + ':' + password;
    }
    const parsed: any = url.parse(config.url);
    const protocol: string = parsed.protocol || 'http:';
    if (!auth && parsed.auth) {
      const urlAuth: string[] = parsed.auth.split(':');
      const urlUsername = urlAuth[0] || '';
      const urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }
    if (auth) {
      delete headers.Authorization;
    }
    const isHttps: boolean = protocol === 'https:';
    const agent = isHttps ? config.httpsAgent : config.httpAgent;
    const options: any = {
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method,
      headers,
      auth,
      agent,
    };
    if (config.socketPath) {
      options.socketPath = config.socketPath
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }
    let proxy = config.proxy;
    if (!proxy && proxy !== false) {
      const proxyEnv: string = protocol.slice(0, -1) + '_proxy';
      const proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        const parsedProxyUrl: UrlWithStringQuery = url.parse(proxyUrl);
        proxy = {
          host: parsedProxyUrl.hostname,
          port: parsedProxyUrl.port
        };
        if (parsedProxyUrl.auth) {
          const proxyUrlAuth = parsedProxyUrl.auth.split(':');
          proxy.auth = {
            username: proxyUrlAuth[0],
            password: proxyUrlAuth[1]
          };
        }
      }
    }

    if (proxy) {
      options.hostname = proxy.host;
      options.host = proxy.host;
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      options.port = proxy.port;
      options.path = protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path;
      if (proxy.auth) {
        const base64 = new Buffer(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
        options.headers['Proxy-Authorization'] = 'Basic ' + base64;
      }
    }
    let transport: any;
    if(config.transport){
      transport = config.transport;
    }else if(config.maxRedirects){
      transport = isHttps ? https : http;
    }else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      transport = isHttps ? httpsFollow : httpFollow;
    }
    if(config.maxContentLength && config.maxContentLength > -1) {
      options.maxBodyLength = config.maxContentLength;
    }

    const req: ClientRequest = createReq(transport, options, config, resolve, reject);
    timer = createReqListener(req, config, timer, reject, data)
  });
}

/**
 * 创建请求 和 回调
 * @param transport
 * @param options
 * @param config
 * @param {Function} resolve
 * @param {Function} reject
 * @returns {module:http.ClientRequest}
 */
function createReq(
  transport:any,
  options:any,
  config:any,
  resolve: Function,
  reject: Function
):ClientRequest {
  const req:ClientRequest = transport.request(options, function (res: IncomingMessage) {
    if(req.aborted) return;
    let stream:any = res;
    switch (res.headers['content-encoding']) {
      case 'gzip':
      case 'compress':
      case 'deflate':
        stream = stream.pipe(zlib.createUnzip());
        delete res.headers['content-encoding'];
        break;
    }
    const lastRequest:any = (<any>res).req || req;
    const response:any = {
      status: res.statusCode,
      statusText: res.statusMessage,
      headers: res.headers,
      config: config,
      request: lastRequest
    };
    if(config.responseType === 'stream'){
      response.data = stream;
      settle(resolve, reject, response);
    }else {
      const responseBuffer:Uint8Array[] = [];
      stream.on('data', function handleStreamData(chunk:any) {
        responseBuffer.push(chunk);

        if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
          reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
            config, null, lastRequest));
        }
      });

      stream.on('error', function handleStreamError(err: string) {
        if (req.aborted) return;
        reject(enhanceError(err, config, null, lastRequest));
      });

      stream.on('end', function handleStreamEnd() {
        let responseData:any = Buffer.concat(responseBuffer);
        if (config.responseType !== 'arraybuffer') {
          responseData = responseData.toString(config.responseEncoding);
        }
        response.data = responseData;
        settle(resolve, reject, response);
      });
    }
  });
  return req;
}

/**
 * 监听事件
 * @param {module:http.ClientRequest} req
 * @param config
 * @param timer
 * @param {Function} reject
 * @param data
 * @returns {any}
 */
function createReqListener(
  req: ClientRequest,
  config: any,
  timer: any,
  reject: Function,
  data:any
) : any{
  // 监听错误
  req.on('error', function handleRequestError(err) {
    if (req.aborted) return;
    reject(enhanceError(err, config, null, req));
  });

  // 超时
  if (config.timeout) {
    timer = setTimeout(function handleRequestTimeout() {
      req.abort();
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
    }, config.timeout);
  }

  if (config.cancelToken) {
    config.cancelToken.promise.then(function onCanceled(cancel:any) {
      if (req.aborted) return;

      req.abort();
      reject(cancel);
    });
  }

  // 发送
  if (isStream(data)) {
    data.on('error', function handleStreamError(err:string) {
      reject(enhanceError(err, config, null, req));
    }).pipe(req);
  } else {
    req.end(data);
  }
  return timer;
}


export default httpAdapter;
