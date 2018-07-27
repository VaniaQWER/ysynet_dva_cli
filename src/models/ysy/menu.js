import * as menuService from '../../services/ysy/menu';
import { message } from 'antd';

export default {
  namespace: 'menu',
  state: {

  },
  reducers: {
    
  },
  effects: {
    // 与后台交互改菜单信息
    *modifyMenu({ payload, callback },{ call }){
      const data = yield call(menuService.modifyMenu,payload);
      if(data.status){
        message.success('修改成功');
        if (callback) callback()
      }else{
        message.error(data.msg|| '修改失败');
      }
    }
  },
  subscriptions: {
    
  }
}