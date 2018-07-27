import * as usersService from '../services/users';
import { message } from 'antd';

export default {
  namespace: 'users',
  state:{
    menuList: [],
    userInfo: {},
    subSystemList: [],
    subSystem: {}
  },
  reducers: {
    userMenu(state,action){
      return {
        ...state,
        menuList: action.payload
      }
    },
    userInfo(state,action){
      return {
        ...state,
        userInfo: action.payload
      }
    },
    subSystem(state,action){
      return {
        ...state,
        subSystemList: action.payload
      }
    },
    setSubSystemInfo(state,action){
      return {
        ...state,
        subSystem: action.payload
      }
    }
  },
  effects:{
    *getUserM({ payload,callback },{ call,put }){
      const data = yield call(usersService.getUserM, payload);
      if(data.status){
        yield put({ type: 'userMenu',payload: data.result });
        if(callback) callback(data.result);
      }else{
        message.error(data.msg||'获取3.0菜单失败')
      }
    },
    // 获取机构名称
    *getOrgName({ payload, callback },{ call, put }){
      const data = yield call(usersService.getDeployOrgName);
      if(data.status){
        if(callback) callback(data.result);
      }else{
        message.error(data.msg||'获取机构名称失败')
      }
    },
    
    // 登陆保存用户信息
    *setUserInfo({ payload },{ put }){
      yield put({ type: 'userInfo', payload })
    },
    
    // 获取子系统
    *getSubSystem({ payload, callback },{ put,call }){
      const data = yield call(usersService.getUserSubSystem, payload );
      if(data.status){
        if (callback) callback(data.result);
        yield put({ type: 'subSystem',payload: data.result })
      }
    },
    // 获取用户 模块和 权限 
    *findMenusByUser({ payload, callback },{ call, put }){
      const data = yield call(usersService.findMenusByUser, payload);
      if(data.status){
        yield put({ type: 'userMenu',payload: data.result })
        if (callback) callback(data.result);
      }else{
        message.error(data.msg||'获取用户模块和权限失败')
      }
    },
    *subsystemInfo({ payload },{ put }){
      yield put({ type: 'setSubSystemInfo',payload })
    }
    
  },
  subscriptions: {
    
  }
}