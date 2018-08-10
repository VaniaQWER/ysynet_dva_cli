import React, { PureComponent } from 'react';
import { Form, Row, Col, Button, Input, Select, Popconfirm, Badge, Modal, Table, message  } from 'antd';
import { singleFormItemLayout } from '../../../utils/commonStyles'
import RemoteTable from '../../../components/TableGrid';
import user from '../../../api/user';
import { connect } from 'dva';
const FormItem = Form.Item;

const { TextArea,Search } = Input;
const { Option } = Select;
const powerColumns = [{
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
}];
// subSystemId === '02'  科室工作站 deptGuid: 决定是临床子系统还是非临床子系统
// let { deptGuid, subSystemId, subSystemName } = JSON.parse(localStorage.getItem('subSystemUser'));
// let flag = deptGuid && subSystemId ==='02'? true: false;// flag  true: 临床科室子系统 false 非临床
class UserMgt extends PureComponent{
  state = {
    query: {
      fstate: '01',
      subSystemId: this.props.users.userInfo.subSystemId || JSON.parse(localStorage.getItem('subSystemUser')).subSystemId,
      deptGuid: this.props.users.userInfo.deptGuid || JSON.parse(localStorage.getItem('subSystemUser')).deptGuid,
    },
    
    title: '添加用户',
    record: {},
    deptGuid: '',
    subSystemId: '',
    subSystemName: '',
    visible: false,
    isEdit: false,
    dirtyClick: false,
    powerVisible: false,
    loading: false ,// 权限菜单列表 loading 
    buttonLoading: false,
    powerData: [],
    powerCacheData: [],// 缓存用户权限data
    selected: [],
    selectedRows: []
  }
  componentDidMount = () =>{
    console.log(this.props.users,'users')
    let { deptGuid, subSystemId, subSystemName } = this.props.users.userInfo || JSON.parse(localStorage.getItem('subSystemUser'));
    console.log(deptGuid,subSystemId,subSystemName,'DidMount')
    let flag = (deptGuid && subSystemId ==='02')? true: false;// flag  true: 临床科室子系统 false 非临床
    this.setState({ flag, deptGuid, subSystemId, subSystemName });
  } 
  queryHandle = (query)=>{
    this.setState({ query });
    this.refs.table.fetch(query);
  }
  resetPwd = (record) =>{
    this.props.dispatch({
      type: 'userSystem/resetPwd',
      payload: { userId: record.userId },
      callback: () => this.refs.table.fetch()
    })
  }
  edit = (record) =>{
    this.props.form.resetFields();
    this.setState({ record,isEdit: true,title: '编辑',visible: true });
  }
  // 新建 编辑提交
  handSubmit = (e) =>{
    e.preventDefault();
    this.props.form.validateFields((err,values)=>{
      this.setState({ dirtyClick: true })
      values.birthDay = values.birthDay === undefined || values.birthDay === null ? "" : values.birthDay.format('YYYY-MM-DD');
      values.userLevel = '03';
      if(this.state.isEdit){
        // 编辑
        values.userId = this.state.record.userId;
      }
      this.props.dispatch({
        type:'userSystem/addOrUpdateUser',
        payload: values,
        callback: () =>{
          this.setState({ visible: false,dirtyClick: false });
          this.refs.table.fetch();
        }
      })
    })
  }
  power = (record) =>{
    this.setState({ record,powerVisible: true });
    let values = {};
    values.userId = record.userId;
    if(this.state.flag){
      values.deptGuid = this.state.deptGuid;
    }
    this.genPowerMenu(values);
  }
  genPowerMenu = (values) =>{
    this.setState({ loading: true });
    this.props.dispatch({
      type: 'userSystem/getPowerMenu',
      // payload: { userId: record.userId,searchName: value ? value: '' },
      payload: values,
      callback: (data) => {
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
        console.log(selected,'selected')
        this.setState({ loading: false, powerData: data, powerCacheData: data, selected })
      }
    })
  }
  search = (value) =>{
    let { powerData, powerCacheData } = this.state;
    if(value){
      let newPowerData = [];
      powerData.map(item=>{
         item.children.map(child=>{
           if(child.name.includes(value)){
             newPowerData.push(child);
           }
           return null
         })
         return null
      });
      this.setState({ powerData: newPowerData });
    }else{
      this.setState({ powerData: powerCacheData });
    }
  }
  updateUserMenus = () =>{
    let { selectedRows, record } = this.state;
    let newSelectRow = selectedRows.filter(item => item.level === 1);
    if(newSelectRow.length === 0){
      return message.warning('请至少勾选一项子菜单')
    }
    this.setState({ buttonLoading: true })
    let postData = {},menuIds = [];
    newSelectRow.map(item => menuIds.push(item.id));
    postData.menuIds = menuIds;
    postData.userId = record.userId;
    if(this.state.flag){
      postData.deptGuid = this.state.deptGuid;
    }
    this.props.dispatch({
      type: 'userSystem/updateUserMenus',
      payload: postData,
      callback: ()=>{
        this.setState({ powerVisible: false, buttonLoading: false })
      }
    })
  }
  handleSubmit = (e) =>{
    e.preventDefault();
    this.props.form.validateFields((err,values)=>{
      this.setState({ dirtyClick: true })
      values.userLevel = '03';
      if(this.state.isEdit){
        // 编辑
        values.userId = this.state.record.userId;
      }
      this.props.dispatch({
        type:'userSystem/addOrUpdateUser',
        payload: values,
        callback: () =>{
          this.setState({ visible: false,dirtyClick: false });
          this.refs.table.fetch();
        }
      })
    })
  }
  genData = (value,key) =>{
    let { query } = this.state;
    let newQuery = Object.assign(query,{ [key]: value });
    this.refs.table.fetch(newQuery);
    this.setState({ query: newQuery });
  }
  render(){
    const { query, title, visible, isEdit, dirtyClick, record, flag, subSystemName, deptGuid, subSystemId,
      powerVisible, powerData, loading, buttonLoading } = this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = [{
      title: '账号',
      dataIndex: 'userNo',
      fixed: 'left',
      width: 150
    },{
      title: '用户名',
      dataIndex: 'userName'
    },{
      title: '用户类型',
      dataIndex: 'userType',
      render:() => '普通操作员'
    },{
      title: '状态',
      dataIndex: 'fstate',
      width: 90,
      render: (text,record)=>{
        return <Badge status={text==='01'?'success':'error'} text={text==="01" ? "启用" :"停用"}/>
      }
    },{
      title: '工号',
      width: 130,
      dataIndex: 'jobNum'
    },{
      title: flag ?  '科室名称': '子系统名称',
      dataIndex: flag ?  'ownDeptName': 'ownSubSystemName',
    },{
      title: '最后编辑时间',
      dataIndex: 'modifyTime'
    },{
      title: '操作',
      dataIndex: 'action',
      width: 180,
      fixed: 'right',
      render: (text,record) =>{
        return <span>
            <Popconfirm title="是否确认重置该用户密码?" onConfirm={this.resetPwd.bind(null, record)} okText="是" cancelText="否">
              <a>重置密码</a>
            </Popconfirm>
            <a onClick={this.edit.bind(null,record)} style={{ margin: '0 16px' }}>编辑</a>
            <a onClick={this.power.bind(null,record)}>权限</a>
        </span>
      }
    }]
    return (
    <div>
      <Row className='ant-row-bottom'>
        <Col span={2}>
          <Button type='primary' onClick={()=>{
              this.props.form.resetFields();
              this.setState({ visible: true,isEdit: false,title: '添加用户' })}
            }>
            添加用户
          </Button>
        </Col>
        <Col span={16} style={{ paddingLeft: 12 }}>
          <Row type='flex'>
            <Col span={9}>
              <label style={{ padding: '0 5px' }}>状态: </label>
                <Select 
                  onChange={(value) => this.genData(value,'fstate') }
                  defaultValue={'01'}
                  style={{ width: 200 }}
                >
                  <Option key={0} value='01'>启用</Option>
                  <Option key={1} value='00'>停用</Option>
                </Select>
            </Col>
            <Col span={12}>
              {
                flag ? 
                <div>
                  {
                    deptGuid &&
                    <div>
                      <label style={{ padding: '0 5px' }}>科室: </label>
                      <Select 
                        onSelect={(value) => this.genData(value,'deptGuid')}
                        value={deptGuid}
                        style={{ width: 200 }}
                      >
                        <Option key={0} value="">全部</Option>
                        <Option key={1} value={deptGuid}>{subSystemName}</Option>
                      </Select>
                    </div>
                  }
                </div>
                :
                <div>
                  {
                    subSystemId &&
                    <div>
                      <label style={{ padding: '0 5px' }}>子系统: </label>
                      <Select 
                        onSelect={(value) => this.genData(value,'subSystemId')}
                        defaultValue={subSystemId}
                        style={{ width: 200 }}
                      >
                        <Option value="">全部</Option>
                        <Option value={subSystemId}>{subSystemName}</Option>
                      </Select>
                    </div>
                  }
                </div>
              }
            </Col>
          </Row>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Search 
            style={{ width: 200 }}
            placeholder='请输入账号/用户名'
            onSearch={value => {
              let { query } = this.state;
              query.searchName = value;
              this.refs.table.fetch(query)
            }}
          />
        </Col>
      </Row>
      <Modal 
        title={title}
        visible={visible}
        width={738}
        style={{ height: 540 }}
        onCancel={()=>this.setState({ visible: false })}
        footer={[
          <Button key="submit" type='primary' htmlType='submit' loading={dirtyClick} onClick={this.handleOk}>确认</Button>,
          <Button key="back" onClick={() => this.setState({ visible: false })}>取消</Button>
        ]}
        >
          <Form onSubmit={this.handleSubmit}>
            <Row>
              <Col span={12}>
                <FormItem {...singleFormItemLayout} label={`账号`}>
                  {
                    getFieldDecorator(`userNo`,{
                      initialValue: isEdit ? record.userNo: '',
                      rules: [{required: true,message: '请输入账号'}]
                    })(
                      <Input placeholder='请输入' disabled={isEdit ? true: false}/>
                    )
                  }
                </FormItem>
                <FormItem {...singleFormItemLayout} label={`用户名`}>
                  {
                    getFieldDecorator(`userName`,{
                      initialValue: isEdit ? record.userName: '',
                      rules: [{required: true,message: '请输入用户名'}]
                    })(
                      <Input placeholder='请输入'/>
                    )
                  }
                </FormItem>
                <FormItem {...singleFormItemLayout} label={`手机号`}>
                  {
                    getFieldDecorator(`mobilePhone`,{
                      initialValue: isEdit ? record.mobilePhone: '',
                      rules: [{required: true,message: '请输入手机号'}]
                    })(
                      <Input placeholder='请输入'/>
                    )
                  }
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...singleFormItemLayout} label={`状态`}>
                  {
                    getFieldDecorator(`fstate`,{
                      initialValue: isEdit ? record.fstate: null,
                      rules: [{required: true,message: '请选择状态'}]
                    })(
                      <Select placeholder='请选择'>
                        <Option key={-1} value='00'>{'禁用'}</Option>
                        <Option key={1} value='01'>{'启用'}</Option>
                        <Option key={2} value='02'>{'注销'}</Option>
                      </Select>
                    )
                  }
                </FormItem>
                <FormItem {...singleFormItemLayout} label={`工号`}>
                  {
                    getFieldDecorator(`jobNum`,{
                      initialValue: isEdit ? record.jobNum: '',
                      rules: [{required: true,message: '请输入用工号'}]
                    })(
                      <Input placeholder='请输入'/>
                    )
                  }
                </FormItem>
                <FormItem {...singleFormItemLayout} label={`邮箱`}>
                  {
                    getFieldDecorator(`eMail`,{
                      initialValue: isEdit ? record.eMail: '',
                      rules: [{required: true,message: '请输入邮箱'}]
                    })(
                      <Input placeholder='请输入'/>
                    )
                  }
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 21 }} label={`备注`}>
                  {
                    getFieldDecorator(`tfRemark`,{
                      initialValue: isEdit ? record.tfRemark: '',
                    })(
                      <TextArea placeholder='请输入' rows={4}/>
                    )
                  }
                </FormItem>
              </Col>
            </Row>
            {/* <FormItem wrapperCol={{ span: 22,offset: 2 }}>
              <Button type='primary' htmlType='submit' size='large' loading={dirtyClick} style={{ width: '95%' }}>{ isEdit ? '保存': '确认'}</Button>
            </FormItem> */}
          </Form>
        </Modal>
      <Modal
        title='用户权限'
        width={1100}
        style={{ height: 630 }}
        visible={powerVisible}
        onCancel={()=>this.setState({ powerVisible: false })}
        footer={[
          <Button key="submit" type='primary' loading={buttonLoading} onClick={this.updateUserMenus}>
              确认
          </Button>,
          <Button key="back"  type='default' onClick={()=>this.setState({ powerVisible: false })}>取消</Button>
        ]}
      >
      <div style={{ height: '100%' ,overflowY: 'auto' }}>
        <div className='ant-row-bottom'>
          <Search 
            style={{ width: 256 }}
            placeholder='请输入菜单名称'
            onSearch={value=>this.search(value)}
          />
        </div>
        <Table 
          columns={powerColumns}
          dataSource={powerData}
          pagination={false}
          loading={loading}
          bordered
          rowKey='id'
          scroll={{ x: '100%' }}
          size='small'
          rowSelection={{
            selectedRowKeys: this.state.selected,
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({selected: selectedRowKeys, selectedRows: selectedRows})
            }
          }}
        />
      </div>
      </Modal>
      <RemoteTable 
        ref='table'
        url={user.FINDORGUSERS}
        rowKey={'userId'}
        scroll={{ x:'120%' }}
        query={query}
        columns={columns}
        showHeader={true}
      />
    </div>
    )
  }
}
export default connect(state =>  state)(Form.create()(UserMgt));