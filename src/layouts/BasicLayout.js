import React, { PureComponent } from 'react';
import { Route, Switch, Redirect } from 'dva/router';
import { Layout, Icon, Row, Col, Tooltip, Dropdown, Menu, Modal } from 'antd';
import { connect } from 'dva';
import Profile from '../components/profile'
import SiderMenu from '../components/SiderMenu';
import styles from './style.css';

const { Header, Content, Sider } = Layout;
let subSystemId = JSON.parse(localStorage.getItem('subSystemUser')).subSystemId;
class BasicLayout extends PureComponent {
  state = {
    collapsed: false,
    menuName: '',
    subSystemList: [], // 子系统下拉框
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  componentDidMount = () =>{
    if(this.props.users.subSystemList.length){
      let subSystemList = this.props.users.subSystemList;
      this.setState({ subSystemList });
    }else{
      this.props.dispatch({
        type: 'users/getSubSystem',
        payload: {},
        callback: (data) => this.setState({ subSystemList: data })
      })
    }
  }
  handleClick = (e) =>{
    console.log(e,'e')
    let subSystemId = e.key;
    let name = e.item.props.name;
    let deptGuid = e.item.props.deptguid;
    const that = this;
    Modal.confirm({
      title: '确认',
      content: '是否确认切换子系统？',
      onOk(){
        let values = {
          subSystemId,
          deptGuid
        }
        that.props.dispatch({
          type: 'users/findMenusByUser',
          payload: values,
          callback: (data) => {
            let path = data[0].subMenus[0].path;
            if(path === window.location.hash.split('#')[1]){
              window.location.hash = `#${path}`;
              window.location.reload();
            }else{
              that.props.history.push({ pathname: path });
            }
            let userInfo = JSON.parse(localStorage.getItem('subSystemUser'));
            userInfo.deptGuid = deptGuid;
            userInfo.subSystemId = subSystemId;
            userInfo.subSystemName = name;
            localStorage.setItem('subSystemUser',JSON.stringify(userInfo));
            that.props.dispatch({
              type: 'users/setUserInfo',
              payload: userInfo
            });
            // 保存选中的子系统 subSystemId deptGuid 
            that.props.dispatch({
              type: 'users/subsystemInfo',
              payload: { ...values, name }
            })
          }
        })
      },
      onCancel(){

      }
    })
  }
  menu = (subSystemList) => (
    <Menu 
      selectable
      onClick={this.handleClick}
      defaultSelectedKeys={[subSystemId.toString()]}
    >
      {
        subSystemList.map((item,index) =>{
          return <Menu.Item key={item.subSystemId} name={item.name} deptguid={item.deptGuid}>{ item.name }</Menu.Item>
        })
      }
    </Menu>
  );
  render() {
    const { getRouteData } = this.props;
    let { userInfo, subSystem } = this.props.users;
    let subSystemName = userInfo.subSystemName ? userInfo.subSystemName: subSystem.name
    let {  userName } = userInfo;
    const { menuName, subSystemList } = this.state;
    
    return (
      <Layout>
        <Sider
          width={232}
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
        >
          <SiderMenu 
            history={this.props.history}
            cb={(title)=> this.setState({ menuName: title })}
          />
          <div className={styles.triggerWrapp} style={{ width: this.state.collapsed ? 80: 232 }}>
            <Icon
              style={{ color: '#fff',fontSize: 18 }}
              className={styles.trigger}
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
              />
          </div>
        </Sider>
        <Content>
          <Header className={`${styles.header}`} style={{ marginBottom: 3,padding: 0 }}>
            <Row>
              <Col span={4} style={{ paddingLeft: 16 }}>
                <Dropdown overlay={this.menu(subSystemList)} trigger={['click']}>
                  <Tooltip title='子系统切换' placement='right'>
                    <span className="ant-dropdown-link">
                      {subSystemName} <Icon type="down" style={{ marginLeft: 8 }}/>
                    </span>
                  </Tooltip>
                </Dropdown>
              </Col>
              <Col span={20} style={{textAlign: 'right'}}>
                <div className={styles.profile}>
                  {/* <div>
                    <Tooltip title="子系统切换">
                      <Icon type="sync" className={styles.icon} onClick={() => this.props.history.push({
                        pathname: '/subSystem'
                      })}/> 
                    </Tooltip>
                  </div> */}
                  <Profile userName={userName}/>
                </div>
              </Col>
            </Row>
          </Header>
          <Header className={`${styles.subHeader}`}>
            {/* <Tooltip title='返回' placement='bottom'>
              <a onClick={()=>this.props.history.go(-1)}>
                <Icon type="arrow-left"  style={{ fontSize: 18, marginRight: 16 }}/>
              </a>
            </Tooltip> */}
            <span>{menuName}</span>
          </Header>
          <Content className={`${styles.content}`}>
            <Switch>
              <Redirect from="/" to="/login" exact={true}/>
              {
                getRouteData('BasicLayout').map(item =>
                  (
                    <Route
                      exact={item.exact}
                      key={item.path}
                      path={item.path}
                      component={item.component}
                    />
                  )
                )
              }
              <Route component={() => <div>404</div>} />
            </Switch>
          </Content>
        </Content>
      </Layout>  
    )
  }
}
export default connect(state => state)(BasicLayout);