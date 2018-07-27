/*
 * @Author: wwb 
 * @Date: 2018-07-26 10:05:37 
 * @Last Modified by: wwb
 * @Last Modified time: 2018-07-26 12:06:02
 */

import React, { PureComponent } from 'react';
import { List, Input, Spin, Row, Col, Button, Menu, Table, message  } from 'antd';
import { connect } from 'dva';
const { Search } = Input;

class DeptPower extends PureComponent{
  state = {
    deptList: [],
    selected: [],
    selectedRows: [],
    dataSource: [],
    deptGuid: '',
    dirtyClick: false,
    tableLoading: false
    
  }
  componentDidMount =() =>{
    let values = {
      flag: '01'
    }
    this.genDeptList(values)
  }
  genDeptList = (value) =>{
    this.setState({ deptList: [] })
    this.props.dispatch({
      type: 'clinicalSystem/searchDeptList',
      payload: value,
      callback: (data)=>{
        this.setState({ deptList: data,dataSource: [],selected: [] })
      }
    })
  }
  searchDept = (value) =>{
    let values = {
      flag: '01',
      deptName: value
    }
    this.genDeptList(values)
  }
  search = (value) =>{
    if(!this.state.deptGuid){
      return  message.warning('请先选中左侧某个菜单树');
    }
    let values = {
      flag: '01',
      menuName: value,
      deptGuid: this.state.deptGuid
    };
    this.searchMenu(values);
  }
  searchMenu = (values) =>{
    this.setState({ tableLoading: true });
    this.props.dispatch({
      type: 'clinicalSystem/genDeptMenus',
      payload: values,
      callback: (data) =>{
        let selected = [];
        data.map(item=>{
          if(item.children.length){
            item.children.map(child=>{
              if(child.isSelected === 1){
                selected.push(child.id)
              }
              return null
            });
            return null
          }
          if(item.isSelected === 1){
            selected.push(item.id);
          }
          return null
        });
        this.setState({ dataSource: data, tableLoading: false, selected });
      }
    })
  }
  handleClick = (e) =>{
    let values = {
      deptGuid: e.key
    }
    this.setState({ deptGuid: e.key });
    this.searchMenu(values)
  }
  save = () =>{
    this.setState({ dirtyClick: true });
    const { selected, deptGuid } = this.state;
    let postData = {};
    postData.deptGuid = deptGuid;
    postData.userId = this.props.users.userInfo.userId;
    postData.menuIds = selected;
    this.props.dispatch({
      type: 'clinicalSystem/saveUserMenu',
      payload: postData,
      callback: () => {
        this.setState({ dirtyClick: false });
      }
    })
  }
  render(){
    const { deptList, dataSource, tableLoading, dirtyClick } = this.state;
    const columns = [{
      title: '菜单名称',
      width: '30%',
      dataIndex: 'name',
      key: 'name'
    },{
      title:'路径',
      width: '30%',
      dataIndex: 'routerName',
      key: 'routerName'
    },{
      title:'备注',
      dataIndex: 'tfRemark',
      width: '40%',
      key: 'tfRemark'
    }]
    return (
      <div className='ysynet-siderMenu-noborder'>
        <div style={{ background: '#fff',display: 'flex' }}>
          <div style={{ background: '#fff',borderRight: 'dashed 1px #ccc',padding: '0 10px',width: 256 }}>
            <Search 
              style={{ marginBottom: 16 }}
              placeholder='请输入科室名称'
              onSearch={value=>this.searchDept(value)}
            />
            {
              deptList && deptList.length ?
              <List
                itemLayout='vertical'
                dataSource={deptList}
                pagination={{
                  onChange: (page) => {
                    console.log(page);
                  },
                  size: 'small',
                  pageSize: 10,
                }}
                renderItem={item=>(
                  <Menu
                    mode="inline"
                    onClick={this.handleClick}
                  >
                    <Menu.Item key={item.value}>
                        { item.text }
                    </Menu.Item>
                  </Menu>
                )
                }
              >
              </List>
              :
              <Spin tip="数据加载中" style={{width: '100%', height: 200, marginTop: 200}}/>
            }
          </div>
          <div style={{ padding: '0 16px',flex: 1 }}>
            <Row className='ant-row-bottom'>
              <Col span={10}>
                <span>权限菜单：</span>
                  <Search 
                    style={{ width: 256 }}
                    placeholder='请输入权限菜单名称'
                    onSearch={value=>this.search(value)}
                  />
              </Col>
              <Col span={14} style={{textAlign: 'right'}}>
                <Button type='primary' onClick={this.save} loading={dirtyClick}>确定</Button>
              </Col>
            </Row>
            <Table 
              columns={columns}
              pagination={false}
              loading={tableLoading}
              dataSource={dataSource}
              size='small'
              rowKey='id'
              scroll={{ x: '100%' }}
              rowSelection={{
                selectedRowKeys: this.state.selected,
                onChange: (selectedRowKeys, selectedRows) => {
                  this.setState({selected: selectedRowKeys, selectedRows: selectedRows})
                }
              }}
            
            />
          </div>
        </div>
      </div>
    )
  }
}
export default connect(state =>  state)(DeptPower);