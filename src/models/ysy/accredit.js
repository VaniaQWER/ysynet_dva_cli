import * as accreditService from '../../services/ysy/accredit';
import { message } from 'antd';


export default {
  namespace: 'accredit',
  state: {
   
  },
  reducers: {
    
  },
  effects: {
    *deployList({ payload, callback },{ put,call }){
      const data = yield call(accreditService.searchDeployList,{ ...payload });
      if(data.status){
        if(callback) callback(data.result.rows)
      }else{
        message.error(data.msg||'获取部署列表失败')
      }
    },
    // 查询子系统列表
    *searchSubSystemList({ payload, callback },{ call }){
      const data = yield call(accreditService.searchSubSystemList, {...payload});
      if(data.status){
        if(callback) callback(data.result);
      }else{
        message.error(data.msg||'查询子系统失败')
      }
    },
    *modifySubSystem({ payload,callback },{ call }){
      const data = yield call(accreditService.modifySubSystemList,{ ...payload });
      if(data.status){
        message.success('编辑成功');
        if(callback) callback();
      }else{
        message.error(data.msg || '编辑失败');
      }
    },
  },
  subscriptions: {
    
  }
}