import React, { PureComponent } from 'react';
import { Button, Row, Col, Form, Input, Table, DatePicker, Modal, Checkbox,message } from 'antd';
import RemoteTable from '../../../components/TableGrid';
import  FetchSelect from '../../../components/FetchSelect'
import ysy from '../../../api/ysy'
import { connect } from 'dva';
import moment from 'moment';
const { Search,TextArea } = Input;
const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },//5
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 15 },
  },
};

class ModalForm extends PureComponent{
  render(){
    const { getFieldDecorator } = this.props.form;
    const { data, isEdit } = this.props;
    return (
      <Form className="ant-advanced-search-form">
        {
          isEdit ? 
          <FormItem {...formItemLayout} label={`部署名称`}>
            {
              getFieldDecorator(`orgId`,{
                initialValue: isEdit ? data.deployName: ''
              })(
                <Input  disabled/>
              )
            }
          </FormItem>
          :
          <FormItem {...formItemLayout} label={`部署名称`}>
            {
              <FetchSelect url={`/orgInfoController/findOrgs`} query={{flag: '00'}} cb={(orgId)=>this.props.cb({ orgId })}/>
            }
          </FormItem>
        }
        <FormItem {...formItemLayout} label={`授权码`}>
          {
            getFieldDecorator(`keyCode`,{
              initialValue: isEdit ? data.keyCode: ''
            })(
              <Input  disabled/>
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={`授权有效期`}>
          {
            getFieldDecorator(`usefulDate`,{
              initialValue: isEdit? [moment(data.usefulDate,'YYYY-MM-DD'),moment(data.usefulDate,'YYYY-MM-DD')]:'',
              rules: [{ required: true,message: '请选择授权日期' }]
            })(
              <RangePicker format="YYYY-MM-DD"/>
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={`备注`}>
          {
            getFieldDecorator(`tfRemark`,{
              initialValue: isEdit ? data.tfRemark:''
            })(
              <TextArea rows={4}/>
            )
          }
        </FormItem>
      </Form>
    )
  }
}
const WrapperModalForm = Form.create()(ModalForm);


const ModalColumns = [{
  title: '机构名称',
  dataIndex: 'orgName'
}]
class Arrange extends PureComponent{
  state = {
    addVisible: false,
    arrangeVisible: false,
    saveLoading: false,
    isEdit: false,
    leftDataSource: [],
    leftDataCache: [],// 左侧缓存数据
    leftTableLoading: false,
    leftSelected: [],
    leftSelectedRows: [],
    rightDataSource: [],
    rightSelected: [],
    rightSelectedRows: [],
    LeftIndeterminate: true,
    rightTableLoading: false,
    leftCheckAll: false,
    rightIndeterminate: true,
    rightCheckAll: false,
    title: '新建部署',
    record: {},
    query: {},
  }
  /* 
    获取所有机构列表
  */
  searchLeftOrgList = (record) =>{
    this.search('left','',record);
  }
  saveDeploy = () =>{
    this.AddOrEditforms.validateFields((err,values)=>{
      if(!err){
        values.orgId = this.state.orgId;
        if(this.state.isEdit){
          values.deployId = this.state.record.deployId;
        }
        values.startTime = values.usefulDate[0].format('YYYY-DD-MM');
        values.endTime = values.usefulDate[1].format('YYYY-DD-MM');
        delete values.usefulDate;
        this.setState({ saveLoading: true });
        console.log(values,'values');
        this.props.dispatch({
          type: 'arrange/saveArrange',
          payload: values,
          callback: ()=>{
            this.setState({ saveLoading: false, addVisible: false });
            this.refs.table.fetch();
          }
        })
      }
    })
  }
  onLeftCheckAllChange = (e) => {
    let allOrgIdList = [];
    let { leftDataSource } = this.state;
    leftDataSource.map(item => allOrgIdList.push(item.orgId));
    this.setState({
      leftSelected: e.target.checked ? allOrgIdList : [],
      leftSelectedRows: e.target.checked ? leftDataSource: [],
      LeftIndeterminate: false,
      leftCheckAll: e.target.checked,
    });
  }
  onRightCheckAllChange = (e) => {
    let rightOrgIdList = [];
    let { rightDataSource } = this.state;
    rightDataSource.map(item => rightOrgIdList.push(item.orgId));
    this.setState({
      rightSelected: e.target.checked ? rightOrgIdList : [],
      rightSelectedRows: e.target.checked ? rightDataSource: [],
      rightIndeterminate: false,
      rightCheckAll: e.target.checked,
    });
  }
  // 左侧搜索 
  leftSearch = (value) =>{
    this.setState({ leftTableLoading: true });
    let { leftDataCache,leftDataSource } = this.state;
    if(value){
      let newData = leftDataSource.filter(item=> item.orgName.includes(value));
      this.setState({ leftDataSource: newData,leftTableLoading: false });
    }else{
      this.setState({ leftDataSource: leftDataCache, leftTableLoading: false })
    }
  }
  // 右侧搜索
  rightSearch = (value) =>{
    this.setState({ rightTableLoading: true });
    this.search('right',value)
  }
  search = (dir,value,record) =>{
    let values = {};
    values.deployId = this.state.record.deployId || record.deployId;
    values.flag = dir === 'right'? '00': '01';
    values.searchName = value;
    this.props.dispatch({
      type: 'arrange/search',
      payload: { ...values },
      callback: (searchData)=>{
        console.log(searchData,'search')
        this.setState(searchData)
      }
    })
  }
  //添加机构
  addOrg = () =>{
    let { rightSelectedRows, leftDataSource, rightDataSource } = this.state;
    let newLeftData = [...leftDataSource, ...rightSelectedRows];
    let newRightData = [];
    rightDataSource.map(item => {
      let flag = true;
      rightSelectedRows.map((list,idx)=>{
        if(item.orgId === list.orgId){
          flag = false;
        }
        return null;
      });
      if(flag){
        newRightData.push(item)
      }
      return null;
    });
    console.log(newRightData,'newRightData')
    this.setState({ leftDataSource: newLeftData,leftDataCache: newLeftData, rightDataSource: newRightData,
      rightSelected: [], rightSelectedRows: [],rightCheckAll: false 
    });
  }
  //移除机构
  removeOrg = () =>{
    let { leftSelectedRows, leftDataSource, rightDataSource } = this.state;
    let newRightData = [...rightDataSource, ...leftSelectedRows];
    let newLeftData = [];
    leftDataSource.map(item => {
      let flag = true;
      leftSelectedRows.map((list,idx)=>{
        if(item.orgId === list.orgId){
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
    this.setState({ leftDataSource: newLeftData, leftDataCache: newLeftData, rightDataSource: newRightData,
      leftSelected: [], leftSelectedRows: [], leftCheckAll: false
    })
  }
  // 编辑部署 确定保存
  modifyOrg = () =>{
    if(this.state.leftSelected.length === 0){
      return message.warning('已添加机构中请至少勾选一项');
    }
    let addOrgIds = [];
    this.state.leftDataSource.map(item => addOrgIds.push(item.orgId));
    let values = {};
    values.deployId = this.state.record.deployId;
    values.addOrgIds = addOrgIds;
    this.setState({ saveLoading: true });
    this.props.dispatch({
      type: 'arrange/modifyOrg',
      payload: values,
      callback: ()=>{
        this.setState({ saveLoading: false,arrangeVisible: false });
        this.refs.table.fetch();
      }
    })
  }
  //清空模态框部署机构表格
  clearTable = () =>{
    this.props.dispatch({
      type: 'arrange/clearTable',
      payload: {}
    })
  }
  render(){
    const { record, isEdit, addVisible, arrangeVisible, 
      title, leftDataSource, rightDataSource,leftTableLoading, rightTableLoading } = this.state;
    const columns = [{
      title:'部署名称',
      dataIndex: 'deployName',
      width: 280
    },{
      title:'授权码',
      dataIndex: 'keyCode'
    },{
      title:'授权有效期',
      dataIndex: 'usefulDate',
      width: 200
    },{
      title:'管理员账号',
      dataIndex: 'userNo',
      width: 150
    },{
      title:'最后编辑时间',
      dataIndex: 'modifyTime',
      width: 180
    },{
      title:'机构数量',
      dataIndex: 'orgCount',
      width: 120
    },{
      title:'备注',
      dataIndex: 'tfRemark'
    },{
      title: '操作',
      dataIndex: 'action',
      width: 150,
      fixed: 'right',
      render:(text,record)=>{
        return <span>
          <a onClick={()=>{
            this.setState({ title: '编辑部署', record,isEdit: true,addVisible: true })
          }}>编辑</a>
          <a style={{ marginLeft: 8 }} onClick={()=>{
            this.setState({ record,arrangeVisible: true, rightDataSource: [],rightSearchValue: '',leftSearchValue: '' })
            this.clearTable();
            this.searchLeftOrgList(record);
          }}>部署机构</a>
        </span>
      }
    }]
    return (
    <div>
      <Row className='ant-row-bottom'>
        <Col span={4}>
          <Button type='primary' icon='plus' onClick={()=>{
              if(this.AddOrEditforms){
                this.AddOrEditforms.resetFields();
              }
              this.setState({ title: '新建部署',record: {},isEdit: false,addVisible: true })
            }}>添加
          </Button>
        </Col>
        <Col span={20} style={{ textAlign:'right' }}>
          <Search 
            style={{ width: 300 }}
            placeholder='部署名称/授权码/管理员账号'
            onSearch={value =>  this.refs.table.fetch({ searchName: value })}
          />
        </Col>
      </Row>
      <Modal
        title={title}
        style={{ top: 20 }}
        width={800}
        className='ant-modal-center-footer'
        visible={addVisible}
        onCancel={()=>this.setState({ addVisible: false })}
        footer={[
          <Button key="submit" type='primary' loading={this.state.saveLoading} onClick={this.saveDeploy}>
            保存
          </Button>,
          <Button key="back"  type='default' onClick={()=>this.setState({ addVisible: false })}>关闭</Button>
        ]}
      >
        <WrapperModalForm 
          cb={(orgId)=>this.setState(orgId)}
          ref={(form) => this.AddOrEditforms = form}
          data={record}
          isEdit={isEdit}
        />
      </Modal>
      <Modal
        className='ysynet-ant-modal'
        title='部署机构'
        width={1100}
        style={{ top: 20 }}
        visible={arrangeVisible}
        onCancel={()=>this.setState({ arrangeVisible: false })}
        footer={[
          <Button key="submit" type='primary' loading={this.state.saveLoading} onClick={this.modifyOrg}>
            保存
          </Button>,
          <Button key="back"  type='default' onClick={()=>this.setState({ arrangeVisible: false })}>取消</Button>
        ]}
      >
        <h3 style={{ padding: '10px 0 10px 10px',background:'#fff' }}>{ record.deployName}</h3>
        <Row className='ysynet-transfer'>
          <Col span={11}>
            <div className='ysynet-transfer-header'>
              <div>
                <Checkbox 
                  disabled={leftDataSource.length === 0? true: false}
                  indeterminate={this.state.LeftIndeterminate}
                  onChange={this.onLeftCheckAllChange}
                  checked={this.state.leftCheckAll}
                />
                <span style={{ marginLeft: 16 }}>已添加机构</span>
              </div>
              <div>
                <span><span>{this.state.leftSelected.length ? `${this.state.leftSelected.length}/`:'' }</span>{leftDataSource.length}</span>
              </div>
            </div>
            <div style={{ height: 412}}>
              <Search 
                onChange={value =>this.setState({ leftSearchValue: value })}
                style={{ margin: '10px 0' }}
                placeholder='请输入搜索内容'
                onSearch={this.leftSearch}
              />
              <div style={{ height: 380,maxHeight: 380, overflow: 'auto' }}>
                <Table 
                  dataSource={leftDataSource}
                  columns={ModalColumns}
                  loading={leftTableLoading}
                  pagination={false}
                  showHeader={false}
                  size={'small'}
                  rowKey={'orgId'}
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
            <Button type='primary'disabled={this.state.rightSelected.length === 0? true : false} onClick={this.addOrg}>添加</Button>
            <Button type='primary' style={{ marginTop: 16 }} disabled={this.state.leftSelected.length === 0 ? true : false} onClick={this.removeOrg}>移除</Button>
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
                <span style={{ marginLeft: 16 }}>未添加机构</span>
              </div>
            </div>
            <div style={{ height: 412}}>
              <Search 
                onChange={value =>this.setState({ rightSearchValue: value })}
                style={{ margin: '10px 0' }}
                onSearch={this.rightSearch}
                placeholder='请输入搜索内容'
              />
              <div style={{ height: 380,maxHeight: 380, overflow: 'auto' }}>
                <Table 
                  columns={ModalColumns}
                  pagination={false}
                  showHeader={false}
                  loading={rightTableLoading}
                  dataSource={rightDataSource}
                  size={'small'}
                  rowKey={'orgId'}
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
      <RemoteTable 
        ref='table'
        url={ysy.SEARCHDEPLOYLIST}
        columns={columns}
        scroll={{ x: '150%' }}
        query={this.state.query}
        rowKey={'deployId'}
        size={'small'}
        showHeader={true}
      />
    </div>
    )
  }
}
export default connect(state =>  state)(Arrange);
