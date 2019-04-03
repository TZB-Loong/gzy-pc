import fetch from 'dva/fetch';
import { notification } from 'antd';
import { routerRedux } from 'dva/router';
import store from '../index';
import { apiURL,returnUrlBoot,softUrl } from '../../configPath';
import { getCookie,clearCookie,getPurchased } from '../utils/utils';
import { message } from 'antd';
const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '缺少请求参数或者无效的请求参数',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器处理异常',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
  10010: '请求查询条件格式错误',
  10020: '用户不存在',
  10021: '请求Token验证失败',
  10022: '当前用户未登录',
  10001: '当前登录企业没有购买采购云服务',
  10002: '购买的服务已被停用',
  10003: '购买的服务已过期',
  10023: '用户登录超时',
  10024: '该账号已在其他地方登录',
};

function checkStatus(response) {
  //系统错误(检测系统错误)
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const errortext = codeMessage[response.status] || response.statusText;
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: errortext,
  });
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const defaultOptions = {
    credentials: 'include',
    // mode: 'cors',
  };
  const newOptions = { ...defaultOptions, ...options };
  newOptions.headers = {
    'X-Requested-With': 'XMLHttpRequest',
    'gzy-token': getCookie(),
    'authCompanyName':getPurchased('authCompanyName')||getPurchased('userName'),
  };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }
  // console.log(newOptions,'newOptions')
  // url = apiURL + url;
  return fetch(url, newOptions)
    .then(checkStatus)
    .then(response => {
      if (newOptions.method === 'DELETE' || response.status === 204) {
        response
          .clone()
          .text()
          .then(text => {
            let status = text.status;
            console.log(status,'status')
            // message.warning( codeMessage[status] );
            if (status == 10023) {
              setTimeout(()=>{window.top.location.href = returnUrlBoot},2000); //跳转登录界面()
              return;
            }

            if (
              status == 401 ||
              status == 10020 ||
              status == 10021 ||
              status == 10022 ||
              status == 10002 ||
              status == 10003 ||
              status == 10024
            ) {
              // message.warning( codeMessage[status] );
              setTimeout(()=>{window.top.location.href = returnUrlBoot;},2000)//跳转登录界面
              return;
            }
            if( status == 10001 ){
              clearCookie();
              setTimeout(()=>{window.top.location.href = softUrl;},2000)//跳转登录界面
              return
            }
          });

        return response.text();
      }

      response
        .clone()
        .json()
        .then(json => {
          let status = json.status;
          if (status == 10023) {
            setTimeout(()=>{window.top.location.href = returnUrlBoot;},2000)//跳转登录界面()
            return;
          }
          if (
            status == 401 ||
            status == 10020 ||
            status == 10021 ||
            status == 10022 ||
            status == 10002 ||
            status == 10003 ||
            status == 10024
          ) {
            // message.warning(codeMessage[status]);
            setTimeout(()=>{window.top.location.href = returnUrlBoot;},2000)//跳转登录界面
            // window.location.href ='http://test.gzy360.com/?ReturnURL=http://192.168.1.130:8000'; //跳转登录界面
            return;
          }
          if( status == 10001 ){
            clearCookie();
            setTimeout(()=>{window.top.location.href = softUrl;},2000)//跳转登录界面
            return
          }
        });

      return response.json();
    })
    .catch(e => {
      const { dispatch } = store;
      const status = e.name;

      if (status === 403) {
        dispatch(routerRedux.push('/exception/403'));
        return;
      }
      if (status <= 504 && status >= 500) {
        dispatch(routerRedux.push('/exception/500'));
        return;
      }
      if (status >= 404 && status < 422) {
        dispatch(routerRedux.push('/exception/404'));
      }
    });
}
