import { isObj, isStr } from "./util.js";

function isRequestBodyInit(
  bodyInit,
){
  return !isObj(bodyInit);
}

export function formatConfig(config){
  if (typeof config.url === "string") {
    const { url, body, agent_id, account_id, ...rest } = config;
    const headers = new Headers();
    let transformUrl = url;
    let transformBody;
    headers.append('accountid',account_id )
    headers.append('agentid',agent_id )
    headers.append('content-type', 'application/json')
    headers.append('accept-language', 'en-US')
    if (body) {
      if (!isRequestBodyInit(body)) {
        switch (config.method) {
          case "get":
          case "GET": {
            const searchParam = new URLSearchParams(
              body,
            );
            if (/\/[^?]+\?.*/.test(transformUrl)) {
              transformUrl += `&${searchParam.toString()}`;
            } else {
              transformUrl += `?${searchParam.toString()}`;
            }
            break;
          }
          case "post":
          case "POST":
          default:
            transformBody = JSON.stringify(body);
            break;
        }
      } else {
        transformBody = body;
      }
    }
    const req = new Request(transformUrl, { ...rest, body: transformBody, headers });
    return req;
  } else {
    throw new Error(`request config.url仅支持string类型,当前为${typeof config.url}`);
  }
}

async function request(config){
  const res = await fetch(formatConfig(config));
  if(res){
    const result = await res.json();
    if(result.result === 1){
      return result.data
    }else {
      throw new Error(`快手接口报错：${result.err_msg}`)
    }
  }
  return undefined
}

request.get = (url) => {
  if (isStr(url)) {
    return request({ url, method: "get" });
  } else {
    return request({ ...url, method: "get" });
  }
};

request.post = (config) => {
  return request({ ...config, method: "post" });
};

export default request;
