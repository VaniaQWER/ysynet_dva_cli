import * as managerService from '../../services/ysy/managerMgt';
import { message } from 'antd';

export default {
  namespace: 'managerMgt',
  state: {
    dataSource: [],
    tableLoading: false,
  },
  reducers: {
   
  },
  effects: {
    //重置密码
    *resetPwd({ payload, callback },{ call }){
      const data = yield call(managerService.modifyAdminInfo,{ ...payload });
      if(data.status){
        message.success('重置密码成功');
      }else{
        message.error(data.msg||'重置密码失败')
      }
      if (callback) callback()
    },
    // 修改用户信息
    *modifyAdmin({ payload,callback },{ call }){
      const data = yield call(managerService.modifyAdminInfo, payload);
      if(data.status){
        message.success('修改成功！');
      }else{
        message.error(data.msg);
      }
      if (callback) callback();
    },
  },
  subscriptions: {
    
  }
}