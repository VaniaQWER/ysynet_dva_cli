import React, { PureComponent } from 'react';
import { Menu, Icon, message, Spin } from 'antd';
import { connect } from 'dva';
import styles from './style.css';
// import { getMenuData } from '../../utils/utils'
const SubMenu = Menu.SubMenu;
// 使用递归创建菜单
const createMenu = menuList => {
  return (
    Array.isArray(menuList) ? menuList.map((menu, index) => {
      return (
        menu.subMenus && menu.name ? (
          <SubMenu
            className='ysy-menu-Item'
            key={menu.key} 
            title={<span><Icon type={menu.icon} /><span>{menu.name}</span></span>}
          >
            { createMenu(menu.subMenus) }
          </SubMenu>
        ) : (
          menu.name ? 
          <Menu.Item name={menu.name} key={menu.key} className='ysy-subMneu-Item'>
            <Icon type={menu.icon} />
            <span> { menu.name } </span>
          </Menu.Item> : null
        )
      )
    }) : (
      <Menu.Item name={menuList.name} key={menuList.key}>
        <Icon type={menuList.icon} />
        <span> { menuList.name } </span>
      </Menu.Item>
    )
  )
}

class SiderMenu extends PureComponent{
  constructor(props){
    super(props)
    this.state = {
      menuList: [],
      selectedKeys: [],
      openKeys: [],
      recordKeys: []//修复官方hover bug
    }
  }
  
  setSubTitle = (menuList,path) =>{
    let pathname = path ? path : window.location.href.split('#')[1];
    let menuName = '';
    if(menuList.length){
      menuList.map((item,index)=>{
        let { subMenus } = item;
        subMenus.map((menu,idx)=>{
          if(menu.subMenus&& menu.subMenus.length){
              let childMenu = menu.subMenus;
              childMenu.map(d=>{
                if(d.path === pathname){
                  menuName = d.name
                }
                return null;
              })
          }else{
            if(menu.path === pathname){
              menuName = menu.name
            }
          }
          return null;
        });
        return null;
      });
    };
    this.props.cb(menuName)
  }
  changeActiveKeys = () => {
    const href = window.location.href;
    const pathname = href.split('#')[1];
    const { openKeys } = this.state;
    const keys = pathname.split('/');
    let selectedKeys = '', newOpenKeys = [];
    selectedKeys = pathname;
    newOpenKeys = openKeys.length ? openKeys : [ keys.slice(0, 2).join('') ];
    this.setState({selectedKeys, openKeys: newOpenKeys});
  }
  componentDidMount = () => {
    this.genMenuData();
    this.changeActiveKeys();
  }
  genMenuData = () =>{
    const { menuList } = this.props.users;
    // 页面刷新 redux 数据清空 重新获取菜单
    if(!menuList.length){
      if(localStorage.getItem('subSystemUser')){
        let userInfo = JSON.parse(localStorage.getItem('subSystemUser'));
        this.props.dispatch({
          type: 'users/setUserInfo',
          payload: userInfo
        });
        if(userInfo.subSystemFlag === undefined){
          this.props.dispatch({
            type: 'users/getUserM',
            payload: {},
            callback: (data)=>{
              this.setState({ menuList: data });
              this.setSubTitle(data)
            }
          })
        }else{
          // if(userInfo.subSystemFlag){
            let { subSystemId, deptGuid } = userInfo;
            this.props.dispatch({
              type: 'users/findMenusByUser',
              payload: { subSystemId, deptGuid },
              callback: (data)=>{
                this.setState({ menuList: data });
                this.setSubTitle(data)
                this.props.dispatch({
                  type: 'users/subsystemInfo',
                  payload: { subSystemId, deptGuid }
                })
              }
            });
          // }
        }
      }
    }else{
      this.setState({ menuList: this.props.users.menuList })
    }
  }
  onOpenChange = openKeys => {
    let changeKey = openKeys.length ? openKeys[openKeys.length - 1] : [];
    if (changeKey.length) {
      let changeKeyArr = changeKey.split('/');
      if (changeKeyArr.length > 2) {
        if (openKeys.length === 1) {
          changeKey = [];
        } else {
          changeKey = [changeKeyArr.slice(0, 2).join(''), changeKeyArr.slice(0, 3).join('') ];
        }
      } else {
        changeKey = [ changeKeyArr.slice(0, 2).join('') ]
      }
    } else {
      changeKey = [];
    }
    this.setState({
      openKeys: changeKey
    })
  }
  static getDerivedStateFromProps(nextProps, prevState){
    if(nextProps.collapsed){
      return {
        openKeys: []
      }
    }
    const pathname = window.location.href.split('#')[1];
    if(nextProps.users.menuList.length && nextProps.users.menuList[0].subMenus[0].path !== pathname){
      return {
        menuList: nextProps.users.menuList,
      }
    }
    return null;
  }
  componentDidUpdate(prevProps, prevState){
    const pathname = window.location.href.split('#')[1];
    let keys = window.location.href.split('#')[1].split('/')[1];
    if(prevState.selectedKeys !== pathname){
      this.setState({ selectedKeys: pathname,openKeys: [ keys+''] })
    }
  }
  render(){
    const { history } = this.props;
    const { menuList } = this.state;
    const { selectedKeys, openKeys } = this.state;
    return (
    <div>
      <div className='logoWrapper'>
        <img src={require('../../assets/img/logo.png')} alt='logo' className='logo'/>
        <h1 className='logoDesc'>P H X L</h1>
        {/* <div className='logo'></div> */}
      </div>
      {
        menuList && menuList.length ?
        <Menu 
          className={styles.fullscreen}
          theme="dark" 
          mode="inline"
          selectedKeys={[selectedKeys+'']}
          onOpenChange={this.onOpenChange}
          openKeys={openKeys}
          onClick={item => {
            this.changeActiveKeys();
            const { pathname } = this.props.history.location;
            if (pathname !== item.key){
              this.props.cb( item.item.props.name )
              history.push({pathname: `${item.key}`})
            }else{
              message.info('您正位于该页面')
            }
          }}
        >
          {
            createMenu(this.state.menuList)
            // createMenu(getMenuData(history.location.pathname.split('/')[1], menu))
            // createMenu(getMenuData(history.location.pathname.split('/')[1], this.props.users.menuList))
          }
          </Menu> :
          <Spin tip="数据加载中" style={{width: '100%', height: 200, marginTop: 200}}/>
        } 
    </div>
    )
  }
}
export default connect(state => state)(SiderMenu)