import * as arrangeService from '../../services/ysy/arrange';
import { message } from 'antd';

export default {
  namespace: 'arrange',
  state: {
    dataSource: [],
    leftDataSource: [],
    rightDataSource: [],
  },
  reducers: {
    // 已添加机构/未添加机构
    leftDataSource(state,action){
      let data = action.payload;
      return {
        ...state,
        leftDataSource: data
      }
    },
    rightTarget(state,action){
      return {
        ...state,
        rightDataSource: action.payload
      }
    },
    //部署 添加
    transferData(state,action){
      return {
        ...state,
        leftDataSource: action.payload.leftDataSource,
        rightDataSource: action.payload.rightDataSource,
      }
    },
    clearTables(state,action){
      return {
        ...state,
        leftDataSource: [],
        rightDataSource: []
      }
    },
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
            callback({ leftDataSource: data.result.rows, leftDataCache: data.result.row, leftTableLoading: false});
          }
        }else{
          message.error(data.msg||'搜索失败');
        }
    },
    // 模态框部署机构 添加移除  同步方法
    *transfer({ payload },{ put, select }){
      let transferData = payload.data;
      const stateData = yield select(state => state.arrange);
      let { leftDataSource, rightDataSource } = stateData;
      let data = payload.key === 'add'? rightDataSource: leftDataSource;
      let newTarget = [];
      data.map(item => {
        let flag = true;
        transferData.map((list,idx)=>{
          if(item.orgId === list.orgId){
            flag = false;
          }
          return null;
        });
        if(flag){
          newTarget.push(item)
        }
        return null;
      })
      if(payload.key === 'add'){
        yield put({ type: 'transferData',payload: { leftDataSource: [...leftDataSource,...transferData], rightDataSource: [...newTarget]} })
      }else{
        yield put({ type: 'transferData',payload: { leftDataSource: [...newTarget], rightDataSource: []} })
      }
    },

    *modifyOrg({ payload, callback },{ put, call }){
      const data = yield call(arrangeService.deployModifyOrg, {...payload });
      if(data.status){
        message.success('编辑成功');
        if(callback) callback();
      }else{
        message.error(data.msg||'操作失败')
      }
    },
    *clearTable({ payload },{ put }){
      yield put({ type: 'clearTables' })
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/arrange') {
          //监听路由变化 触发 effect 
          console.log('arrange')
        }
      });
    },
  }
}