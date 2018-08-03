import * as subMgtService from '../../services/manager/subSystemMgt';
import { message } from 'antd';

export default {
  namespace: 'subSystemMgt',
  state: {
    
  },
  reducers: {
    
  },
  effects: {
    // 修改 系统别名  备注 
    *updateSubSystems({ payload, callback },{ call }){
      const data = yield call(subMgtService.updateSubSystems, payload);
      if(data.status){
        message.success('编辑成功');
        if (callback) callback();
      }else{
        message.error(data.msg|| '编辑失败')
      }
    },
    // 获取管理员关联列表 
    *getSubSystemsManager({ payload,callback },{ put, call }){
      const data = yield call(subMgtService.getSubSystemsManager, payload);
      if(!data.status){
        message.error(data.msg||'获取管理员关联列表失败')
      }
      if (callback) callback(data.result);
    },
    // 管理员添加人员
    *addUser({ payload,callback },{ put, call }){
      const data = yield call(subMgtService.addUser,payload);
      if(data.status){
        message.success('添加人员成功');
        let values = {};
        if(payload.deployOrgSubSystemGuid){
          values.deployOrgSubSystemGuid = payload.deployOrgSubSystemGuid
        }else{
          values.deptGuid = payload.deptGuid
        }
        yield put({ type: 'getSubSystemsManager', payload: values });
        if (callback) callback();
      }else{
        message.error(data.msg||'添加人员失败');
      }
    },
    // 管理人员移除
    *removeUser({ payload,callback },{ put,call }){
      const data = yield call(subMgtService.removeUser, payload);
      if(data.status){
        message.success('移除人员成功');
        let values = {};
        if(payload.deployOrgSubSystemGuid){
          values.deployOrgSubSystemGuid = payload.deployOrgSubSystemGuid
        }else{
          values.deptGuid = payload.deptGuid
        }
        yield put({ type: 'getSubSystemsManager', payload: values });
        if (callback) callback();
      }else{
        message.error(data.msg||'移除人员失败');
      }
    },
    // 系统菜单
    *getSubsystemMenu({ payload,callback },{ put,call }){
      const data = yield call(subMgtService.getSubSystemsMenus, payload);
      if(data.status){
        if(callback) callback(data.result)
      }else{
        message.error(data.msg||'获取系统菜单失败')
      }
    },
    // 编辑系统菜单
    *updateSystemMenu({ payload , callback },{ call }){
      const data = yield call( subMgtService.updateSubSystemsMenus, payload);
      if(data.status){
        message.success('修改成功');
      }else{
        message.error(data.msg);
      }
      if(callback) callback();
    }
  },
  subscriptions: {
   
  }
}