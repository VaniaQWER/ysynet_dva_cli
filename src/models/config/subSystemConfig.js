import * as configService from '../../services/configMgt/subSystemConfig';
import { message } from 'antd';

export default {
  namespace: 'subSystemConfig',
  state: {
    
  },
  reducers: {
    
  },
  effects: {
    *subSystemList({ payload, callback },{ call }){
      const data = yield call(configService.findSubSystemSelector);
      if(data.length === 0){
        message.warning('暂无子系统,请添加')
      }
      if(callback) callback(data)
    },
    //保存子系统配置 ,新建子系统
    *saveConfig({ payload, callback },{ call }){
      const data = yield call(configService.saveSubSystemConfig, payload);
      if(data.status){
        message.success('保存成功');
      }else{
        message.error(data.msg|| '保存失败');
      }
      if(callback) callback() 
    },
    
    *deleteRecord({ payload, callback },{ call }){
      const data = yield call(configService.deleteSubSystemConfig, payload);
      if(data.status){
        message.success('删除成功');
      }else{
        message.error(data.msg|| '删除失败');
      }
      if (callback) callback()
    },
  },
  subscriptions: {
    
  }
}