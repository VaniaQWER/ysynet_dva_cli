import React, { PureComponent } from 'react';
import { Input, Row, Col, Button, Modal,Table, Checkbox, message } from 'antd';
import RemoteTable from '../../../components/TableGrid';
import EditableCell from '../../../components/EditableCell';
import { connect } from 'dva';
import jxh from '../../../api/jxh';

const { Search } = Input;
const ModalColumns = [{
  title: '管理员',
  dataIndex: 'userName'
}];
let rules = {
  rule: /^\d{1,2}$/,
  errorMsg: '请输入不大于2位数的正整数'
}
class SubSystemMgt extends PureComponent{
  state = {
    query: {},
    record: {},
    addVisible: false,
    menuVisible: false,
    addLoading: false,
    removeLoading: false,
    leftSelected: [],
    leftSelectedRows: [],
    rightSelected: [],
    rightSelectedRows: [],
    LeftIndeterminate: true,
    leftCheckAll: false,
    rightIndeterminate: true,
    rightCheckAll: false,
    leftLoading: false, // 搜索左边 表格loading 
    rightLoading: false,  // 右边 loading
    selected: [], // 系统菜单选中 keys
    selectedRows: [],
    leftDataSource: [],// 模态框管理员关联列表 左侧列表  已选
    rightDataSource: [], // 右侧列表  未选 
    leftSearchData: [],
    leftCacheData: [],
    rightCacheData: [],
    systemMenuList: [],
    systemMenuRecord: {}// 系统菜单模态框 record
  }
  manager = (record) =>{
    this.setState({ record });
    this.props.dispatch({
      type: 'subSystemMgt/getSubSystemsManager',
      payload: { deployOrgSubSystemGuid: record.deployOrgSubSystemGuid },
      callback: (data) => {
        let leftDataSource = [], rightDataSource = []; 
        data.map(item => {
          if(item.isSelected === 1){
            leftDataSource.push(item);
          }else{
            rightDataSource.push(item);
          }
          return null;
        })
        this.setState({ visible: true, leftDataSource, leftCacheData: leftDataSource,
           rightDataSource,rightCacheData: rightDataSource })
      }
    })
  }
  leftSearch = (value) =>{
    this.setState({ leftLoading: true });
    let { leftCacheData,leftDataSource } = this.state;
    if(value){
      let newData = leftDataSource.filter(item=> item.userName.includes(value));
      this.setState({ leftDataSource: newData,leftLoading: false });
    }else{
      this.setState({ leftDataSource: leftCacheData, leftLoading: false })
    }
  }
  rightSearch = (value) =>{
    console.log(value,'value')
    this.setState({ rightLoading: true });
    let { rightCacheData, rightDataSource } = this.state;
    if(value){
      let newData = rightDataSource.filter(item=> item.userName.includes(value));
      this.setState({ rightDataSource: newData, rightLoading: false });
    }else{
      this.setState({ rightDataSource: rightCacheData, rightLoading: false })
    }
  }
  addUser = () =>{
    this.setState({ addLoading: true });
    let { leftDataSource, rightDataSource, rightSelectedRows } = this.state;
    let newLeftData = [ ...leftDataSource, ...rightSelectedRows];
    let  newRightData = [];
    rightDataSource.map(item => {
      let flag = true;
      rightSelectedRows.map((list,idx)=>{
        if(item.userId === list.userId){
          flag = false;
        }
        return null;
      });
      if(flag){
        newRightData.push(item)
      }
      return null;
    });
    this.props.dispatch({
      type: 'subSystemMgt/addUser',
      payload: { userIds: this.state.rightSelected, deployOrgSubSystemGuid: this.state.record.deployOrgSubSystemGuid },
      callback: ()=>this.setState({ addLoading: false,rightSelected: [],rightCheckAll: false,
        leftDataSource: newLeftData, leftCacheData: newLeftData, rightDataSource: newRightData,rightCacheData: newRightData })
    })
  }
  removeUser = () =>{
    let { leftDataSource, rightDataSource, leftSelectedRows, leftSelected } = this.state;
    if(leftDataSource.length === leftSelected.length){
      return message.warning('请保留至少一个子系统管理员')
    }
    let newRightData = [...rightDataSource, ...leftSelectedRows];
    let newLeftData = [];
    leftDataSource.map(item => {
      let flag = true;
      leftSelectedRows.map((list,idx)=>{
        if(item.userId === list.userId){
          flag = false;
        }
        return null;
      });
      if(flag){
        newLeftData.push(item)
      }
      return null;
    });
    console.log(newLeftData,'newLeftData')
    this.setState({ removeLoading: true });
    this.props.dispatch({
      type: 'subSystemMgt/removeUser',
      payload: { userIds: this.state.leftSelected, deployOrgSubSystemGuid: this.state.record.deployOrgSubSystemGuid },
      callback: ()=>this.setState({ removeLoading: false,leftSelected: [],leftCheckAll: false,
        leftDataSource: newLeftData,leftCacheData: newLeftData,rightDataSource: newRightData,rightCacheData: newRightData
       })
    })
  }
  onLeftCheckAllChange = (e) => {
    let allOrgIdList = [];
    let { leftDataSource } = this.props.subSystemMgt;
    leftDataSource.map(item => allOrgIdList.push(item.userId));
    this.setState({
      leftSelected: e.target.checked ? allOrgIdList : [],
      leftSelectedRows: e.target.checked ? leftDataSource: [],
      LeftIndeterminate: false,
      leftCheckAll: e.target.checked,
    });
  }
  onRightCheckAllChange = (e) => {
    let rightOrgIdList = [];
    let { rightDataSource } = this.props.subSystemMgt;
    rightDataSource.map(item => rightOrgIdList.push(item.userId));
    this.setState({
      rightSelected: e.target.checked ? rightOrgIdList : [],
      rightSelectedRows: e.target.checked ? rightDataSource: [],
      rightIndeterminate: false,
      rightCheckAll: e.target.checked,
    });
  }
  systemMenu = (record) =>{
    this.setState({ record });
    this.props.dispatch({
      type: 'subSystemMgt/getSubsystemMenu',
      payload: { deployOrgSubSystemGuid: record.deployOrgSubSystemGuid },
      callback: (data) =>{
        let selected = [], selectedRows = [];
        data.map((item,index)=>{
          if(item.isSelected === 1){
            selected.push(item.id);
            selectedRows.push(item)
            if(item.children.length){
              item.children.map((child,idx)=>{
                selected.push(child.id);
                selectedRows.push(child);
                return null;
              });
            }
          }else{
            if(item.children.length){
              item.children.map((child,idx)=>{
                if(child.isSelected === 1){
                  selected.push(child.id);
                  selectedRows.push(child);
                }
                return null
              })
            }
          }
          return null;
        });
        this.setState({ menuVisible: true, systemMenuList: data, selected, selectedRows })
      }
    })
  }
  onCellChange = (value,record,columns) => {
    let values = {};
    values.deployOrgSubSystemGuid = record.deployOrgSubSystemGuid;
    values[columns] = value;
    console.log(values,'vaues')
    this.props.dispatch({
      type: 'subSystemMgt/updateSubSystems',
      payload: values,
      callback: () => this.refs.table.fetch()
    })
  }
  modalonCellChange = (value,record,columns) =>{
    record[columns] = value;
    let newSystemMenuList = [...this.state.systemMenuList];
    let targetIndex ;
    newSystemMenuList.map((item,index)=>{
      if(item.id === record.id){
        targetIndex = `${index}`;
        return null;
      }else{
        if(item.children){
          item.children.map((child,idx) =>{
            if(child.id  === record.id){
              targetIndex = `${index}/${idx}`;
            }
            return null
          })
        }
      }
      return null
    });
    if(targetIndex.includes('/')){
      let arr = targetIndex.split('/');
      newSystemMenuList[Number(arr[0])].children[Number(arr[1])] = record;
    }else{
      newSystemMenuList[Number(targetIndex)] = record;
    }
    newSystemMenuList.map(item=>{
      let parentFsort = item.fsort;
      item.children.map(child=>{
        child.parentFsort = parentFsort;
        return null;
      })
      return null;
    });
    this.setState({ systemMenuList: newSystemMenuList })
  };
  // 编辑菜单排序
  modifySystemMenu = () =>{
    let { selectedRows, record } = this.state;
    let newSelectRow = selectedRows.filter(item => item.level === 1);
    if(newSelectRow.length === 0){
      return message.warning('请至少勾选一项子集菜单')
    }
    if(document.querySelectorAll('.editable-cell-input-wrapper').length){
      return message.warning('当前编辑表格有未保存的项,请先保存')
    }
    let postData = {}, subMenus = [];
    postData.deployOrgSubSystemGuid = record.deployOrgSubSystemGuid;
    newSelectRow.map(item=>{
      return subMenus.push({
        menuId: item.id,
        menuAlias: item.menuAlias,
        fsort: `${item.parentFsort}${item.fsort}`,
        tfRemark: item.tfRemark
      })
    });
    postData.subMenus = subMenus;
    this.setState({ dirtyClick: true });
    console.log(postData,'postData')
    this.props.dispatch({
      type: 'subSystemMgt/updateSystemMenu',
      payload: postData,
      callback: () =>{
        this.setState({ dirtyClick: false, menuVisible: false });
      }
    })

  }
  render(){
    
    const { visible, menuVisible, leftLoading, rightLoading, addLoading, removeLoading, 
      leftDataSource, rightDataSource, systemMenuList, selected, dirtyClick } = this.state;
    const columns = [{
      title: '系统名称',
      dataIndex: 'subSystemName'
    },{
      title: '系统别名',
      width: '35%',
      dataIndex: 'subSystemAlias',
      render: (text,record,index)=>{
        return (
          <EditableCell
            value={ text }
            record={record}
            index={index}
            columns={'subSystemAlias'}
            max='50'
            cb={(record)=>this.setState({ record })}
            onEditChange={(index,record,editable)=>this.onCellChange(index, record, editable,'subSystemAlias')}
          />
        )
      }
    },{
      title: '备注',
      width: '35%',
      dataIndex: 'tfRemark',
      render: (text,record,index)=>{
        return (
          <EditableCell
            value={ text }
            record={record}
            index={index}
            columns={'tfRemark'}
            max='50'
            cb={(record)=>this.setState({ record })}
            onEditChange={(index,record,editable,colums)=>this.onCellChange(index, record, editable,'tfRemark')}
          />
        )
      }
    },{
      title: '操作',
      dataIndex: 'actions',
      width: 180,
      render: (text,record,index)=>{
        return <span>
          {
            record.subSystemId !== '02' &&
            <a onClick={this.manager.bind(null,record)}>管理员</a>
          }
          <a style={{ marginLeft: record.subSystemId === '02' ? 50: 8 }} onClick={this.systemMenu.bind(null,record)}>系统菜单</a>
        </span>
      }
    }];
    const menuColumns = [{
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },{
      title: '菜单别名',
      dataIndex: 'menuAlias',
      key: 'menuAlias',
      width: 200,
      render: (text,record,index)=>{
        if(!record.children){
          return (
            <EditableCell 
              value={ text }
              width={'70%'}
              record={record}
              columns={'menuAlias'}
              index={index}
              cb={(record)=>this.setState({ systemMenuRecord: record })}
              onEditChange={(index,record,editable,colums)=>this.modalonCellChange(index, record, editable,'menuAlias')}
            />
          )
        }
        return text;
      }
    },{
      title: '排序',
      dataIndex: 'fsort',
      key: 'fsort',
      width: 200,
      render: (text,record,index)=>{
        return (
          <EditableCell 
            value={ text }
            width={'70%'}
            record={record}
            validate={true}
            rules={rules}
            columns={'fsort'}
            index={index}
            cb={(record)=>this.setState({ systemMenuRecord: record })}
            onEditChange={(index,record,editable,colums)=>this.modalonCellChange(index, record, editable,'fsort')}
          />
        )
      }
    },{
      title: '路径',
      dataIndex: 'routerName',
      key: 'routerName'
    },{
      title: '备注',
      dataIndex: 'tfRemark',
      key: 'tfRemark',
      width: 200,
      render: (text,record,index)=>{
        if(!record.children){
          return (
            <EditableCell 
              value={ text }
              width={'70%'}
              record={record}
              columns={'tfRemark'}
              index={index}
              cb={(record)=>this.setState({ systemMenuRecord: record })}
              onEditChange={(index,record,editable,colums)=>this.modalonCellChange(index, record, editable,'tfRemark')}
          />
          )
        }
        return text
      }
    }]
    return (
      <div>
        <Modal
          className='ysynet-ant-modal'
          title='管理员'
          centered={true}
          visible={visible}
          width={1100}
          onCancel={()=>this.setState({ visible: false })}
          footer={null}
        >
          <Row className='ysynet-transfer'>
            <Col span={11} >
              <div className='ysynet-transfer-header'>
                <div>
                  <Checkbox 
                    disabled={leftDataSource.length === 0? true: false}
                    indeterminate={this.state.LeftIndeterminate}
                    onChange={this.onLeftCheckAllChange}
                    checked={this.state.leftCheckAll}
                  />
                  <span style={{ marginLeft: 16 }}>已添加人员</span>
                </div>
                <div>
                  <span><span>{this.state.leftSelected.length ? `${this.state.leftSelected.length}/`:'' }</span>{leftDataSource.length}</span>
                </div>
              </div>
              <div style={{ height: 412 }}>
                <Search 
                  style={{ margin: '10px 0' }}
                  placeholder='请输入搜索内容'
                  onSearch={this.leftSearch}
                />
                 <div style={{ height: 380,maxHeight: 380, overflow: 'auto' }}>
                  <Table 
                      dataSource={leftDataSource}
                      columns={ModalColumns}
                      loading={leftLoading}
                      pagination={false}
                      showHeader={false}
                      size={'small'}
                      rowKey={'userId'}
                      rowSelection={{
                        selectedRowKeys: this.state.leftSelected,
                        onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({
                          leftSelected: selectedRowKeys,
                          leftSelectedRows: selectedRows,
                          LeftIndeterminate: !!selectedRowKeys.length && (selectedRowKeys.length < leftDataSource.length),
                          leftCheckAll: selectedRowKeys.length === leftDataSource.length,
                          })
                        }
                      }}
                    />
                 </div>
              </div>
            </Col>
            <Col span={2} style={{ textAlign:'center',alignSelf:'center' }}>
              <Button type='primary'
                loading={addLoading}
                disabled={this.state.rightSelected.length === 0? true : false} 
                onClick={this.addUser}>添加</Button>
              <Button type='primary'
                loading={removeLoading} 
                style={{ marginTop: 16 }} 
                disabled={this.state.leftSelected.length === 0 ? true : false} 
                onClick={this.removeUser}>移除</Button>
            </Col>
            <Col span={11}>
              <div className='ysynet-transfer-header'>
                <div>
                  <Checkbox 
                    disabled={rightDataSource.length === 0? true: false}
                    indeterminate={this.state.rightIndeterminate}
                    onChange={this.onRightCheckAllChange}
                    checked={this.state.rightCheckAll}
                  />
                  <span style={{ marginLeft: 16 }}>未添加人员</span>
                </div>
              </div>
              <div style={{ height: 412}}>
                <Search 
                  style={{ margin: '10px 0' }}
                  onSearch={this.rightSearch}
                  placeholder='请输入搜索内容'
                />
                <div style={{ height: 380,maxHeight: 380, overflow: 'auto' }}>
                  <Table 
                    columns={ModalColumns}
                    pagination={false}
                    showHeader={false}
                    loading={rightLoading}
                    dataSource={rightDataSource}
                    size={'small'}
                    rowKey={'userId'}
                    rowSelection={{
                      selectedRowKeys: this.state.rightSelected,
                      onChange: (selectedRowKeys, selectedRows) => {
                      this.setState({
                        rightSelected: selectedRowKeys, 
                        rightSelectedRows: selectedRows,
                        rightIndeterminate: !!selectedRowKeys.length && (selectedRowKeys.length < rightDataSource.length),
                        rightCheckAll: selectedRowKeys.length === rightDataSource.length,
                        })
                      }
                    }}
                  />
                </div> 
              </div>
            </Col>
          </Row>
        </Modal>
        <Modal
          title='系统菜单'
          visible={menuVisible}
          width={1100}
          centered={true}
          onCancel={()=>this.setState({ menuVisible: false })}
          footer={[
            <Button key="submit" type='primary' loading={dirtyClick} onClick={this.modifySystemMenu}>
              确认
            </Button>,
            <Button key="back"  type='default' onClick={()=>this.setState({ menuVisible: false })}>取消</Button>
          ]}
        >
          <Table 
            rowKey='id'
            columns={menuColumns}
            defaultExpandAllRows={true}
            dataSource={systemMenuList}
            scroll={{ x: '100%' }}
            pagination={false}
            bordered
            size='small'
            rowSelection={{
              getCheckboxProps: record => ({
                defaultChecked: record.isSelected === 1
              }),
              selectedRowKeys: selected,
              onSelect: (record, selected, onSelectedRows,e) => {
                if(selected){
                  if(record.children){
                    // 点击勾选 父项
                    let childSelected = [record.id],childSelectRows = [];
                    record.children.map(item=> {
                      childSelected.push(item.id);
                      childSelectRows.push(item);
                      return null
                    });
                    let totalSelectedRow = [...onSelectedRows,...childSelectRows ];
                    let totalSelectd = [...this.state.selected,...childSelected ];
                    let uniqueSelected = Array.from(new Set(totalSelectd)) ;
                    let hash = {};
                    totalSelectedRow = totalSelectedRow.reduce((item, next)=>{
                      if(!hash[next.id]){
                        hash[next.id] = true;
                        item.push(next)
                      }
                      return item
                    },[]);
                    this.setState({ selected: uniqueSelected,selectedRows: totalSelectedRow })
                  }else{
                    // 点击勾选 子项
                    let selected = [], selectedRows = [];
                    let { parentId } = record;
                    let subSelectedRow = onSelectedRows.filter(item => item.parentId === parentId)
                    let newData = [...systemMenuList];
                    let target = newData.filter(item => item.id === parentId)[0];
                    let flag =  subSelectedRow.length === target.children.length;
                    selected = [ ...this.state.selected,record.id ];
                    selectedRows = [...this.state.selectedRows, record];
                    if(flag){
                      selected.push(target.id);
                      delete target.record;
                      selectedRows.push(target);
                    }
                    this.setState({ selected, selectedRows })
                  }
                }else{
                  if(record && record.children){
                    // 取消勾选 父项
                    let newSelected = [], newSelectedRows = [];
                    onSelectedRows.map((item,index)=>{
                      record.children.map((list,idx)=>{
                        if(record.id !== item.parentId){
                          newSelected.push(item.id);
                          newSelectedRows.push(item);
                        }
                        return null;
                      });
                      return null;
                    });
                    this.setState({ selected: newSelected,selectedRows: newSelectedRows })
                  }else{
                    // 取消勾选 子项
                    let { parentId } = record;
                    let newSelectedRows =  onSelectedRows.filter(item => item.id!== parentId);
                    let newSelected = [];
                    newSelectedRows.map(item=> newSelected.push(item.id));
                    this.setState({ selected: newSelected, selectedRows: newSelectedRows })
                  }
                }
              }
            }}
          
          />
        </Modal>
        <div style={{ padding: '8px 0',borderBottom: 'solid 1px #ccc',marginBottom: 16 }}>
          <Button type='primary' onClick={()=>this.refs.table.fetch()}>更新数据</Button>
        </div>
        <Row className='ant-row-bottom'>
          <Col>
            <Search 
              style={{ width: 256 }}
              placeholder='系统名称/系统别名'
              onSearch={value=>this.refs.table.fetch({ searchName: value })}
            />
          </Col>
        </Row>
        <RemoteTable
          query={this.state.query} 
          columns={columns}
          ref='table'
          url={jxh.GETSUBSYSTEMS}
          rowKey='deployOrgSubSystemGuid'
          size='small'
          scroll={{ x: '100%' }}
          showHeader={true}

        />
      </div>
    )
  }
}
export default connect(state =>  state)(SubSystemMgt);