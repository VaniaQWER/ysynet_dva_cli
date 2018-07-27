import React, { PureComponent } from 'react';
import { List, Input, Button, Spin, Menu, Row, Col, Modal, message  } from 'antd';
import { connect } from 'dva';
const { Search } = Input;
class Accredit extends PureComponent{
  constructor(props){
    super(props)
    this.state = {
      dataSource: [],
      treeLoading: false,
      selectedSystemInfo: {},// 选中的授权 或 子系统 信息
      subLoading: false, // 授权子系统loading
      baseData: {},
      selectedSubSystem: [], // 已授权的子系统
      modalSubSystemList: [], // 模态框子系统列表
      visible: false,
    }
  }
  componentDidMount = () =>{
    this.genDeployList();
  }
  genDeployList = (value) =>{
    this.setState({ treeLoading: true })
    this.props.dispatch({
      type: 'accredit/deployList',
      payload: { flag: '00', searchLike: value ? value: '' },
      callback: (data) => this.setState({ dataSource: data,treeLoading: false })
    });
  }
  onSearch = (value) =>{
    this.genDeployList(value);
  }
  handleClick = (e) => {
    let deployId = e.item.props.deployid;
    let { dataSource } = this.state;
    let target = dataSource.filter(item=> item.deployId === deployId)[0];
    this.setState({ baseData: target  });
    let orgId = e.key;
    let deployName = e.item.props.deployname;
    this.setState({ subLoading: true });
    let values = {};
    values.deployId = deployId;
    if(deployId && deployName){
      values.orgId = orgId;
    }
    this.setState({ selectedSystemInfo: values });
    // 异步获取授权子系统
    this.searchSubSystemList(values)
  }
  searchSubSystemList = (values) =>{
    this.props.dispatch({
      type: 'accredit/searchSubSystemList',
      payload: values,
      callback: (data)=>{
        let selectedSubSystem = data.filter(item => item.relFlag === '01');
        this.setState({ subSystemList: data, modalSubSystemList: data, subLoading: false, selectedSubSystem });
      }
    })
  }
  edit = () =>{
    if(this.state.selectedSystemInfo.deployId){
      this.setState({ visible: true });
    }else{
      message.warning('请选择一个部署或子系统')
    }
  }
  flagChange = (item) =>{
    let { relFlag, synFlag } = item;
    if(relFlag === '01'&& synFlag === '01'){
      return;
    }
    let { modalSubSystemList } = this.state;
    let newData = [...modalSubSystemList ];
    let index = newData.findIndex(list=> list.subSystemId === item.subSystemId);
    newData[index].relFlag = newData[index].relFlag === '00'? '01': '00';
    this.setState({ modalSubSystemList: newData });
  }
  modifySystem = () =>{
    this.setState({ dirtyClick: true });
    const { modalSubSystemList,selectedSystemInfo } = this.state;
    let subSystemIds = [];
    modalSubSystemList.map(item => {
      if(item.relFlag === '01'){
        subSystemIds.push(item.subSystemId);
      }
      return null;
    });
    let values = { ...selectedSystemInfo };
    values.subSystemIds = subSystemIds; 
    console.log(values,'values')
    this.props.dispatch({
      type: 'accredit/modifySubSystem',
      payload: values,
      callback: (data)=>{
        this.setState({ dirtyClick: false, visible: false });
        this.searchSubSystemList(selectedSystemInfo)
      }
    })
  }
  render(){
    const { dataSource, treeLoading, baseData, subLoading, selectedSubSystem, 
      modalSubSystemList, visible, dirtyClick } = this.state;
    return (
      <div className='ysynet-siderMenu-noborder'>
        <div style={{ background: '#fff',display: 'flex' }}>
          <div style={{ background: '#fff',borderRight: 'dashed 1px #ccc',padding: '0 10px' }}>
            <Search 
              style={{ marginBottom: 16 }}
              placeholder='部署/机构名称'
              onSearch={this.onSearch}
            />
            <Spin spinning={treeLoading}>
              <List
                itemLayout='vertical'
                dataSource={dataSource}
                pagination={{
                  onChange: (page) => {
                    console.log(page);
                  },
                  size: 'small',
                  pageSize: 1,
                }}
                renderItem={item=>(
                    <Menu
                      mode="inline"
                      onClick={this.handleClick}
                    >
                      <Menu.Item deployid={item.deployId} key={item.orgId}>
                        <span style={{ fontWeight: 'bold' }}> { item.deployName } </span>
                      </Menu.Item>
                      {
                        item.orgList.length
                        &&
                        item.orgList.map((menu,index)=>{
                          return <Menu.Item className='ysysnet-accredit-subMenu' 
                            parentorgid={item.orgId} 
                            deployid={item.deployId}
                            deployname={item.deployName} 
                            key={menu.orgId}>{menu.orgName}
                          </Menu.Item>
                        })
                      }
                    </Menu>
                )
                }
              >
              </List>
            </Spin>
          </div>
          <div style={{ padding: '0 16px',flex: 1 }}>
            <div>
              <h3>部署信息</h3>
                <Row style={{ padding: '0 20px' }}>
                  <Col className="ant-col-8">
                    <div className="ant-row">
                      <div className="ant-col-6 ant-form-item-label-left">
                        <label>部署名称</label>
                      </div>
                      <div className="ant-col-15">
                        <div className="ant-form-item-control">
                          { baseData.deployName ? baseData.deployName: '' }
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col className="ant-col-8">
                    <div className="ant-row">
                      <div className="ant-col-6 ant-form-item-label-left">
                        <label>授权码</label>
                      </div>
                      <div className="ant-col-15">
                        <div className="ant-form-item-control">
                          { baseData.keyCode ? baseData.keyCode: ''  }
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col className="ant-col-8">
                    <div className="ant-row">
                      <div className="ant-col-8 ant-form-item-label-left">
                        <label>授权有效期</label>
                      </div>
                      <div className="ant-col-15">
                        <div className="ant-form-item-control">
                          { baseData.usefulDate ? baseData.usefulDate: ''  }
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col className="ant-col-8">
                    <div className="ant-row">
                      <div className="ant-col-8 ant-form-item-label-left">
                        <label>最后编辑时间</label>
                      </div>
                      <div className="ant-col-15">
                        <div className="ant-form-item-control">
                          { baseData.modifyTime ? baseData.modifyTime: ''  }
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex',justifyContent: 'space-between' }}>
                  <h3>授权子系统</h3>
                  <Button type='primary' onClick={this.edit} style={{ marginRight: 16 }}>编辑</Button>
                </div>
                <Spin spinning={subLoading} style={{ marginTop: 24 }}>
                  {
                    selectedSubSystem.length ?
                    <List
                      style={{ marginTop: 24 }}
                      className='ysy-accredit-list'
                      grid={{ gutter: 16, column: 4 }}
                      dataSource={selectedSubSystem}
                      renderItem={item => (
                        <List.Item>
                          <div className='ysy-accredit-card'>
                              <img src={require('../../../assets/ysyFlag.png')} alt='flag' style={{ width: 38,height: 45 }}/>
                              <p style={{ marginTop: 12 }}>{ item.subSystemName}</p>
                          </div>
                        </List.Item>
                      )}
                    />
                    :
                    <div style={{ textAlign: 'center',marginTop: 16 }}>暂无数据</div>
                  }
                </Spin>
                <Modal
                  visible={visible}
                  onCancel={()=>this.setState({ visible:false })}
                  title='编辑'
                  width={726}
                  footer={[
                    <Button key="submit" type='primary' loading={dirtyClick} onClick={this.modifySystem}>
                        确认
                    </Button>,
                    <Button key="back"  type='default' onClick={()=>this.setState({ visible:false })}>取消</Button>
                  ]}
                >
                  <List
                    style={{ marginTop: 24 }}
                    className='ysy-accredit-list'
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={modalSubSystemList}
                    renderItem={item => (
                      <List.Item>
                        <div className='ysy-accredit-card' onClick={()=>this.flagChange(item)}>
                          <img src={require('../../../assets/ysyFlag.png')} alt='flag' style={{ width: 38,height: 45 }}/>
                          <p style={{ marginTop: 12 }}>{ item.subSystemName}</p>
                          {
                            (item.relFlag === '01' && item.synFlag === '01')
                            ?
                            <div className='ysy-triangle ysy-triangle-disabled'></div>
                            :
                            item.relFlag === '01'?
                            <div className='ysy-triangle'></div>
                            :
                            null
                          }
                        </div>
                      </List.Item>
                    )}
                  />
                </Modal>
              </div>
          </div>
        </div>
      </div>
    )
  }
}
export default connect(state =>  state)(Accredit);