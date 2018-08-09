import { notification, message } from 'antd';
import { hashHistory } from 'dva/router';
import querystring from 'querystring';
import fetch from 'dva/fetch';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: response.statusText,
  });
  const error = new Error(response.statusText);
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
    mode: 'cors',
    method: 'POST'
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    if(newOptions.type === 'formData'){
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        ...newOptions.headers,
      }
    }else{
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
    }
    // newOptions.body = JSON.stringify(newOptions.body);
    newOptions.body = newOptions.type ? querystring.stringify(newOptions.body) : JSON.stringify(newOptions.body);
  }
  return fetch(url, newOptions)
    .then(response=> checkStatus(response))
    .then(response =>{
      switch (response.status){
        case 996:
          hashHistory.push({pathname: '/login'});
          return message.warn('会话失效，请重新登录');
        case 997:
          hashHistory.push({pathname: '/login'});
          return message.warn('非法访问，请重新登录');
        case 998:
          hashHistory.push({pathname: '/login'});
          return message.warn('会话失效，请重新登录');
        case 999:
          hashHistory.push({pathname: '/login'});
          return message.warn('登录失效，请重新登录');
        default:
          return response.json();
      }
    })
    // .then(response => response.json())
    .catch((error) => {
      if (error.code) {
        notification.error({
          message: error.name,
          description: error.message,
        });
      }
      if ('stack' in error && 'message' in error) {
        notification.error({
          message: `请求错误: ${url}`,
          description: error.message,
        });
      }
      return error;
    });
}
