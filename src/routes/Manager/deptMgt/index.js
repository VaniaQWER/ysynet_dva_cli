import React, { PureComponent } from 'react';
import { Row, Col, Form, Input, Button, Select, Modal, Table, Popconfirm, Checkbox, message,Tooltip, Badge } from 'antd';
import RemoteTable from '../../../components/TableGrid';
import jxh from '../../../api/jxh';
import { connect } from 'dva';
import { formItemLayout } from '../../../utils/commonStyles';
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea, Search } = Input;

const EditableCell = ({ editable, value, onChange }) => (
  <div>
  {editable
      ? <Input style={{ margin: '-3px 0' }} value={value} onChange={e => onChange(e.target.value)} />
      : value
  }
  </div>
);
const managerModalColumns = [{
  title: '管理员',
  dataIndex: 'userName'
}];
class SearchForm extends PureComponent{
  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.props.query(values);
    });
  }
  render(){
    const { getFieldDecorator } = this.props.form;
    return (
      <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row >
          <Col span={10} key={1}>
            <FormItem {...formItemLayout} label={'科室名称'}>
              {getFieldDecorator('searchName',{
                initialValue: ''
              })(
                <Input placeholder="请输入" style={{ width: 248 }}/>
              )}
            </FormItem>
          </Col>
            <Col span={10} key={6}>
              <FormItem {...formItemLayout} label={'状态'}>
                {getFieldDecorator('fstate',{
                  initialValue: '-1'
                })(
                  <Select placeholder="请选择" style={{ width: 248 }}>
                    <Option value="-1">全部</Option>
                    <Option value="00">停用</Option>
                    <Option value="01">启用</Option>
                  </Select>
                )}
              </FormItem>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}
const WrapperForm = Form.create()(SearchForm);

class AddForm extends PureComponent{
  handleSubmit = (e) =>{
    e.preventDefault();
    this.props.form.validateFields((err,values)=>{
      if(!err){
        if(this.props.isEdit){
          //编辑
          values.deptGuid = this.props.data.deptGuid;
          this.props.cb(values);
          console.log(values,'values')
        }else{
          //新增
          console.log(values,'values')
          this.props.cb(values);
        }
      }
    })
  }
  render(){
    const { getFieldDecorator } = this.props.form;
    const { data, isEdit, loading } = this.props;
    return (
      <Form className="ant-advanced-search-form" onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label={`科室名称`}>
          {
            getFieldDecorator(`deptName`,{
              initialValue: isEdit ? data.deptName: '',
              rules: [{ required: true,message: '请输入科室名称' }]
            })(
              <Input placeholder='请输入'/>
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={`科室编码`}>
          {
            getFieldDecorator(`deptCode`,{
              initialValue: isEdit ? data.deptCode: '',
              rules: [{ required: true,message: '请输入科室编码' }]
            })(
              <Input placeholder='请输入'/>
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={`状态`}>
          {
            getFieldDecorator(`fstate`,{
              initialValue: isEdit ? data.fstate: null,
            })(
              <Select placeholder='请选择'>
                <Option key={-1} value='01'>启用</Option>
                <Option key={-1} value='00'>停用</Option>
              </Select>
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={`简码`}>
          {
            getFieldDecorator(`fqun`,{
              initialValue: isEdit ? data.fqun: '',
            })(
              <Input placeholder='请输入'/>
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={`备注`}>
          {
            getFieldDecorator(`tfRemark`,{
              initialValue: isEdit ? data.tfRemark: '',
            })(
              <TextArea rows={4} placeholder='请输入'/>
            )
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 22,offset: 2 }}>
          <Button type='primary' style={{ width: '100%' }} loading={loading} htmlType='submit'>确定</Button>
        </FormItem>
      </Form>
    )
  }
}
const WrapperAddForm = Form.create()(AddForm);
class DeptMgt extends PureComponent{
  state = {
    query: {},
    title: '添加',
    visible: false,
    loading: false,
    addressVisible: false,
    managerVisible: false,
    record: {},
    count: 0,
    addressData: [],
    LeftIndeterminate: true,
    leftCheckAll: false,
    rightIndeterminate: true,
    rightCheckAll: false,
    leftDataSource: [],
    leftCacheData: [],
    leftSelected: [],
    leftLoading: false,
    addLoading: false,
    removeLoading: false,
    rightDataSource: [],
    rightCacheData: [],
    rightSelected: [],
    selected: [], // 系统菜单选中key
    selectedRows: [], //系统菜单选中项
    systemMenuList: [],
    dirtyClick: false,
    ModalColumns: [{
        title: '联系人',
        dataIndex: 'linkman',
        width:'15%',
        render: (text, record, index) => this.renderColumns(text, record, 'linkman')
    },{
        title: '联系电话',
        dataIndex: 'linktel',
        width:'25%',
        render: (text, record, index) => this.renderColumns(text, record, 'linktel')
    },{
        title: '地址',
        dataIndex: 'tfAddress',
        width:'35%',
        render: (text, record, index) => this.renderColumns(text, record, 'tfAddress')
    },{
      title: '是否默认地址',
      dataIndex: 'isDefault',
      render: (text, row, index) => 
        <Checkbox
          disabled={row.editable? false : true}
          dataIndex={index}
          checked={row.isDefault==='01'?true:false}
          defaultChecked={text==='01'? true: false}
          onChange={this.onCheckChanage}
        />
    },{
      title: '操作',
      dataIndex: 'actions',
      width: 150,
      render: (text,record,index) => {
        const { editable } = record;
          return (
            <span>
              <Popconfirm title={record.isDefault==='01' ? "该项是默认地址，是否删除？" : "是否删除？"} onConfirm={() => this.onDelete(record,index)}>
                  <a style={{ marginRight: 30 }}>删除</a>
              </Popconfirm>
              <a onClick={() => this.update(record.key)}>{editable?'保存':'修改'}</a>
            </span>
          )
      }
    }]
  }
  queryHandle = (query) => {
    this.refs.table.fetch(query);
    this.setState({ query })
  }
  edit = (record) =>{
    this.setState({ record,visible: true,title: '编辑',isEdit: true })
  }
  address = (record) =>{
    this.setState({ addressVisible: true, record })
    this.fetchAddressData(record.deptGuid);
  }
  // 获取科室地址列表
  fetchAddressData = (value) =>{
    this.setState({ tableLoading: true });
    this.props.dispatch({
      type: 'deptMgt/searchDeptAddress',
      payload: { deptGuid: value || this.state.record.deptGuid },
      callback: (data)=>this.setState({ addressData: data, tableLoading: false, count: data.length })
    })
  }
  submit = (value) =>{
    this.setState({ loading: true });
    let type = this.state.isEdit ? 'deptMgt/updateOrgDept': 'deptMgt/insertOrgDept';
    this.props.dispatch({
      type: type,
      payload: value,
      callback: () =>{
        this.setState({ visible: false,loading: false });
        this.modalForm.resetFields();
        this.refs.table.fetch();
      }
    })
  }
  handleChange(value, key, column) {
    let len = (column === 'linkman' || column === 'linktel') ? 25: 50;
    let text = column === 'linkman'? '联系人': column === 'linktel'?'联系电话': '地址';
    if(value.length > len){
      return message.warning(`${text}的长度不能超过${len}`);
    }
    const newData = [...this.state.addressData];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      target[column] = value;
      this.setState({ dataSource: newData });
    }
  }
  onCheckChanage = (e) => {
    var index = e.target.dataIndex;
    const dataSource = [ ...this.state.addressData ];
    dataSource.map((item,idx) => {
      if(index === idx){
        e.target.checked = true;
        dataSource[idx]['isDefault'] = '01';
      }else{
        e.target.checked = false;
        dataSource[idx]['isDefault'] = '00';
      }
      return null;
    });
    this.setState({dataSource});
  }
  renderColumns(text, record, column) {
    return (
      <EditableCell
        editable={record.editable}
        value={text}
        onChange={value => this.handleChange(value, record.key, column)}
      />
    );
  }
  // 修改科室地址信息
  update(key) {
    const newData = [...this.state.addressData];
    const target = newData.filter(item => key === item.key)[0];
    console.log(target,'target')
    if (target) {
      target.editable = !target.editable
      if(!target.editable){
        let flag = false;
        newData.map(item => {
          if(item.isDefault === '01'){
            flag = true;
          }
          return null;
        });
        if(flag){
          let postData = {
            tfAddress: target.tfAddress,
            linkman: target.linkman,
            linktel: target.linktel,
            isDefault: target.isDefault,
            addrGuid: target.addrGuid,
            tfCloGuid: this.state.record.deptGuid
          }
          console.log(postData,'postData');
          this.setState({ tableLoading: true });
          this.props.dispatch({
            type: 'deptMgt/modifyAddress',
            payload: postData,
            callback: () => {
              this.fetchAddressData()
              this.setState({ tableLoading: false })
            }
          })
        }else{
          message.warning('您没有设置默认地址,请设置默认地址')
        }
      }else{
        let index = newData.findIndex(item => item.addrGuid === target.addrGuid);
        newData[index] = target;
        this.setState({ addressData: newData });
      }
    }
  }
  // 删除科室地址
  onDelete = (record,index) =>{
    const newData = [ ...this.state.addressData];
    if(record.addrGuid){
      this.props.dispatch({
        type: 'deptMgt/deleteAddress',
        payload: { addrGuid: record.addrGuid },
        callback: ()=> this.fetchAddressData()
      })
    }else{
      // 删除页面上地址，无交互
      newData.splice(index,1);
      this.setState({ addressData: newData, count: this.state.count -1  });
    }
  }
  // 添加科室地址
  handleAdd = () =>{
    const { count } = this.state;
    if(count >= 10){
      return message.warning('科室地址只能添加10条记录');
    }
    const newData = {
      key: count,
      linkman: '',
      linktel: '',
      tfAddress: '',
      isDefault: '00'
    };
    this.setState({ addressData: [ ...this.state.addressData, newData],count: this.state.count + 1 });
  }
  // 分配管理员
  manager = (record) =>{
    this.setState({ record });
    this.props.dispatch({
      type: 'subSystemMgt/getSubSystemsManager',
      payload: { deptGuid: record.deptGuid },
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
        this.setState({ managerVisible: true, leftDataSource, leftCacheData: leftDataSource,
           rightDataSource,rightCacheData: rightDataSource })
      }
    })
  }
  // 系统菜单
  systemMenu = (record) =>{ 
    this.setState({ record });
    this.props.dispatch({
      type: 'deptMgt/genDeptMenus',
      payload: { deptGuid: record.deptGuid },
      callback: (data) =>{
        let selected = [];
        data.map((item,index)=>{
          if(item.isSelected === "1"){
            selected.push(item.id);
            if(item.children.length){
              item.children.map((child,idx)=>{
                selected.push(child.id);
                return null;
              });
            }
          }else{
            if(item.children.length){
              item.children.map((child,idx)=>{
                if(child.isSelected === "1"){
                  selected.push(child.id);
                }
                return null
              })
            }
          }
          return null;
        });
        this.setState({ menuVisible: true, systemMenuList: data, selected })
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
      payload: { userIds: this.state.rightSelected, deptGuid: this.state.record.deptGuid },
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
      payload: { userIds: this.state.leftSelected, deptGuid: this.state.record.deptGuid },
      callback: ()=>this.setState({ removeLoading: false,leftSelected: [],leftCheckAll: false,
        leftDataSource: newLeftData,leftCacheData: newLeftData,rightDataSource: newRightData,rightCacheData: newRightData
       })
    })
  }
  saveDeptMenus = () =>{
    let { selectedRows, record } = this.state;
    let postData = {}, menuIds = [];
    postData.deptGuid = record.deptGuid;
    let newSelectRow = selectedRows.filter(item => item.level === 1);
    newSelectRow.map(item => menuIds.push(item.id));
    if(newSelectRow.length === 0){
      return message.warning('请至少勾选一项子菜单')
    }
    postData.menuIds = menuIds;
    this.setState({ dirtyClick: true });
    this.props.dispatch({
      type: 'deptMgt/saveDeptMenus',
      payload: postData,
      callback: () =>{
        this.setState({ dirtyClick: false, menuVisible: false });
      }
    })
  }
  render(){
    const { visible, title, record, isEdit, loading, addressVisible, managerVisible, menuVisible,
      tableLoading, ModalColumns, addressData,leftDataSource,rightDataSource,leftLoading,rightLoading,addLoading,removeLoading,dirtyClick,systemMenuList,selected } = this.state;
      const menuColumns = [{
        title: '菜单名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },{
        title: '路径',
        dataIndex: 'routerName',
        key: 'routerName'
      },{
        title: '备注',
        dataIndex: 'tfRemark',
        key: 'tfRemark',
        width: 200,
      }]
    const columns = [{
        title: '科室名称',
        dataIndex: 'deptName'
    },{
        title : '状态',
        dataIndex : 'fstate',
        width: '80',
        render:  FSTATE => {
          return <Badge status={FSTATE==='01'?'success':'error'} text={FSTATE==="01" ? "启用" :"停用"}/>
        }
    },{
        title : '编码',
        dataIndex : 'deptCode',
        width: '15%',
    },{
        title: '简码',
        dataIndex: 'fqun'
    },{
        title : '默认地址',
        width: 270,
        className: 'ellipsis',
        dataIndex : 'defaultAddress',
        render: (text,record) =>
        <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
    },{
        title: '操作',
        dataIndex: 'actions',
        width: 250,
        fixed: 'right',
        render: (text,record,index) =>{
          return (
            <span>
              <a onClick={this.edit.bind(null,record)}>编辑</a>
              <a style={{ margin: '0 8px' }} onClick={this.address.bind(null,record)}>地址</a>
              <a style={{ margin: '0 8px' }} onClick={this.manager.bind(null,record)}>管理员</a>
              <a onClick={this.systemMenu.bind(null,record)}>系统菜单</a>
            </span>
          )
        }
    }]
    return (
      <div>
        <Row>
          <Col span={4}>
            <Button type='primary' onClick={()=>{
              if(this.modalForm){
                this.modalForm.resetFields();
              }
              this.setState({ visible: true,title: '新增',isEdit: false })
            }}>添加</Button>
          </Col>
          <Col span={15} offset={5} style={{ textAlign: 'right' }}>
            <WrapperForm  query={this.queryHandle}/>
          </Col>
        </Row>
        <Modal
          className='ysynet-ant-modal'
          title='管理员'
          visible={managerVisible}
          width={1100}
          onCancel={()=>this.setState({ managerVisible: false })}
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
                  <span style={{ marginLeft: 16 }}>{'已添加人员'}</span>
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
                      columns={managerModalColumns}
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
                    columns={managerModalColumns}
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
          onCancel={()=>this.setState({ menuVisible: false })}
          footer={[
            <Button key="submit" type='primary' loading={dirtyClick} onClick={this.saveDeptMenus}>
              确认
            </Button>,
            <Button key="back"  type='default' onClick={()=>this.setState({ menuVisible: false })}>取消</Button>
          ]}
        >
          <Table 
            rowKey='id'
            columns={menuColumns}
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
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selected: selectedRowKeys, selectedRows: selectedRows})
              }
            }}
          
          />
        </Modal>
        <Modal
          title={title}
          visible={visible}
          width={460}
          onCancel={()=>this.setState({ visible: false })}
          footer={null}
        >
          <WrapperAddForm 
            data={record}
            isEdit={isEdit}
            loading={loading}
            cb={value=>this.submit(value)}
            ref={(form)=>this.modalForm = form}
          />
        </Modal>
        <Modal
          title='科室地址'
          width={1100}
          visible={addressVisible}
          onCancel={()=>this.setState({ addressVisible: false })}
          footer={null}
        >
          <div>
            <div>
              <Button type='primary' icon='plus' onClick={this.handleAdd}>添加地址</Button>
            </div>
            <Table 
              bordered
              loading={tableLoading}
              columns={ModalColumns}
              dataSource={addressData}
              style={{ marginTop: 10 }}
              pagination={false}
              rowKey='key'
              size='small'
            />
          </div>
        </Modal>
        <RemoteTable 
          ref='table'
          url={jxh.DEPT_LIST}
          rowKey={'deptGuid'}
          scroll={{ x:'100%' }}
          query={this.state.query}
          columns={columns}
          showHeader={true}
        />
      </div>
    )
  }
}
export default connect(state =>  state)(DeptMgt);