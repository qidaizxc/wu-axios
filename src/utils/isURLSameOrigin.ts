import {isStandardBrowserEnv, isString} from "./commonUtils";
export default isStandardBrowserEnv() ? (function () {
    const msie:boolean = /(msie|trident)/i.test(navigator.userAgent);
    const urlParsingNode = document.createElement('a');
    let originURL:any = resolveURL(window.location.href);
    return function (requestURL:any):boolean {
      const parsed:any = isString(requestURL) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
        parsed.host === originURL.host);
    }

    function resolveURL(url:string) {
      let href = url;
      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }
      urlParsingNode.setAttribute('href', href);
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
          urlParsingNode.pathname :
          '/' + urlParsingNode.pathname
      };
    }
  })():
  function ():boolean {
    return true
  }
