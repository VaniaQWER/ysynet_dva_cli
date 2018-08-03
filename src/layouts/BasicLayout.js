import React, { PureComponent } from 'react';
import { Route, Switch, Redirect } from 'dva/router';
import { Layout, Icon, Row, Col, Tooltip  } from 'antd';
import { connect } from 'dva';
import Profile from '../components/profile'
import SiderMenu from '../components/SiderMenu';
import styles from './style.css';
const { Header, Content, Sider } = Layout;
class BasicLayout extends PureComponent {
  state = {
    collapsed: false,
    menuName: '',
    subSystemList: [], // 子系统下拉框
    dropDownToggle: false
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  SystemToggle = () =>{
    this.setState({ dropDownToggle : !this.state.dropDownToggle})
  }
  componentDidMount = () =>{
    // console.log(this.props.users,'propsUsers');
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
  render() {
    const { getRouteData } = this.props;
    let { userInfo, subSystem } = this.props.users;
    let subSystemName = userInfo.subSystemName ? userInfo.subSystemName: subSystem.name
    let {  userName } = userInfo;
    const { menuName, subSystemList, dropDownToggle } = this.state;
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
                { subSystemName }
                  {
                    subSystemList && subSystemList.length ?
                    <Tooltip title='子系统切换'>
                      <Icon type={ dropDownToggle ? "up-circle-o": "down-circle-o" } style={{ marginLeft: 8 }} onClick={this.SystemToggle}/>
                    </Tooltip>
                    :
                    null
                  }
              </Col>
              <Col span={20} style={{textAlign: 'right'}}>
                <div className={styles.profile}>
                  <div>
                    <Tooltip title="子系统切换">
                      <Icon type="sync" className={styles.icon} onClick={() => this.props.history.push({
                        pathname: '/subSystem'
                      })}/> 
                    </Tooltip>
                  </div>
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