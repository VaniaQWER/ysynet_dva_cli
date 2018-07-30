import * as subMgtService from '../../services/manager/subSystemMgt';
import { message } from 'antd';

export default {
  namespace: 'deptMgt',
  state: {
    
  },
  reducers: {
   
  },
  effects: {
    // 新增科室
    *insertOrgDept({ payload,callback },{ call }){
      const data = yield call(subMgtService.insertOrgDept, payload);
      if(data.status){
        message.success('操作成功');
        if (callback) callback();
      }else{
        message.error(data.msg||'操作失败')
      }
    },
    // 编辑科室
    *updateOrgDept({ payload,callback },{ call }){
      const data = yield call(subMgtService.updateOrgDept, payload);
      if(data.status){
        message.success('操作成功');
        if (callback) callback();
      }else{
        message.error(data.msg||'操作失败')
      }
    },
    // 科室地址列表
    *searchDeptAddress({ payload, callback },{ put, call }){
      const data = yield call(subMgtService.searchDeptAddress, payload);
      let addressData = data.result;
      if(data.status){
        if(addressData.length){
          addressData.map((item,index) =>{
            return addressData[index]['key'] = item.addrGuid;
          })
          yield put({ type: 'deptAddress', payload: addressData });
        }
      }else{
        message.error(data.msg||'获取科室地址失败')
      }
      if (callback) callback(addressData);
    },
    // 修改科室地址 保存
    *modifyAddress({ payload,callback },{ call }){
      const data = yield call(subMgtService.saveDeptAddress, payload);
      if(data.status){
        message.success('修改成功');
        if (callback) callback();
      }else{
        message.error(data.msg||'修改失败')
      }
    },
    // 删除科室地址
    *deleteAddress({ payload,callback },{ call }){
      const data = yield call(subMgtService.deleteDeptAddress, payload);
      if(data.status){
        message.success('删除成功');
        if (callback) callback();
      }else{
        message.error(data.msg||'删除失败')
      }
    },
  },
  subscriptions: {
    
  }
}