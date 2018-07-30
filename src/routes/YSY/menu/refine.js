/* 
  精细化平台 Tab
*/
import React from 'react';
import { Input, Select,Modal } from 'antd';
import RemoteTable from '../../../components/TableGrid';
import EditableCell from '../../../components/EditableCell';
import ysy from '../../../api/ysy'
import { connect } from 'dva';
const { Search } = Input;
const { Option } = Select;

class Refine extends React.Component{
  state = {
    record: {},
    flag: true
  }
  onCellChange = (value,record,) => {
    let values = {};
    values.menuId = record.menuId;
    values.tfRemark = value;
    this.props.dispatch({
      type: 'menu/modifyMenu',
      payload: values,
      callback: () => this.refs.table.fetch()
    })
  }
  optionSelect = (value) =>{
    console.log(value,'value')
    let content= value === '00'? '是否确认关闭?': '是否确认开启?';
    const that = this;
    Modal.confirm({
      title: '确认',
      content: content,
      onOk(){
        let values = {};
        values.menuId = that.state.record.menuId;
        values.fstate = value;
        console.log(values,'values')
        that.props.dispatch({
          type: 'menu/modifyMenu',
          payload: values,
          callback: () => that.refs.table.fetch()
        })
      },
      onCancel(){

      }
    })
  }
  onFocus = (record) =>{
    this.setState({ record, flag: true });
  }
  onBlur = () =>{
    console.log('onBlur')
    this.setState({ flag: false });
  }
  shouldComponentUpdate = () =>{
    if(!this.state.flag){
      return true;
    }
    return false;
  }
  render(){
    const columns = [{
      title: '菜单名称',
      width: '20%',
      dataIndex: 'menuName'
    },{
      title:'菜单编号',
      width: '15%',
      dataIndex: 'menuId'
    },{
      title:'路径',
      width: '20%',
      dataIndex: 'url'
    },{
      title:'状态',
      dataIndex: 'fstate',
      width: 100,
      render:(text,record,index) =>{
        return (
          <div>
            <Select
              style={{ width: 80 }} 
              value={text}
              onFocus={()=>this.onFocus(record)}
              onSelect={this.optionSelect}
            >
              <Option key={-1} value='00'>关闭</Option>
              <Option key={1} value='01'>开启</Option>
            </Select>
          </div>
        )
      }
    },{
      title:'备注',
      dataIndex: 'tfRemark',
      width: 300,
      render: (text,record,index)=>{
        return (
          <EditableCell
            value={ text }
            record={record}
            index={index}
            max='250'
            cb={(record)=>this.setState({ record })}
            onEditChange={(index,record,editable)=>this.onCellChange(index, record, editable)}
          />
        )
      }
    }]

    return (
    <div>
      <Search 
        style={{ width: 300,marginBottom: 24 }}
        placeholder='请输入菜单名称/路径/编号'
        onSearch={value=> this.refs.table.fetch({ searchName: value })}
      />
        <RemoteTable 
          ref='table'
          url={ysy.QUERYMENULIST}
          size={'small'}
          scroll={{ x: '100%' }}
          columns={columns}
          rowKey={'menuId'}
          showHeader={true}
        />
    </div>
    )
  }
}
export default connect(state => state)(Refine);