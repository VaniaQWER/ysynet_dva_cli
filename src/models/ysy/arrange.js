import * as arrangeService from '../../services/ysy/arrange';
import { message } from 'antd';

export default {
  namespace: 'arrange',
  state: {
   
  },
  reducers: {
   
  },
  effects: {
    //新建部署/编辑部署
    *saveArrange({ payload, callback },{ put, call }){
      const data = yield call(arrangeService.saveDeploy,{ ...payload });
      if(data.status){
        message.success('操作成功');
        if (callback) callback()
      }else{
        message.error(data.msg||'操作失败')
      }
    },
    // 模态框表格搜索
    *search({ payload,callback },{ put, call }){
      const data = yield call(arrangeService.findDeployOrgList,{ ...payload });
        if(data.status){
          if(callback && payload.flag === '00'){
            callback({ rightDataSource: data.result.rows, rightTableLoading: false })
          }else{
            let leftSelected = [];
            data.result.rows.map(item => leftSelected.push(item.orgId))
            callback({ leftDataSource: data.result.rows, leftDataCache: data.result.rows, leftTableLoading: false, leftSelected});
          }
        }else{
          message.error(data.msg||'搜索失败');
        }
    },
    *modifyOrg({ payload, callback },{ put, call }){
      const data = yield call(arrangeService.deployModifyOrg, {...payload });
      if(data.status){
        message.success('编辑成功');
      }else{
        message.error(data.msg||'操作失败')
      }
      if(callback) callback();
    },
  },
  subscriptions: {
    
  }
}