import React, { PureComponent } from 'react';
import { Form, Button, Checkbox, Input, Icon, message } from 'antd';
import { connect } from 'dva';
import sha1 from 'sha1';
import md5 from 'md5';
import styles from './style.css';
const FormItem = Form.Item;

class Login extends PureComponent{
  state = {
    loading: false,
    orgName: ''
  }
  componentDidMount = () =>{
    this.props.dispatch({
      type: 'users/getOrgName',
      payload: {},
      callback: (data) => this.setState({ orgName: data  })
    })
  }
  handleSubmit = (e) =>{
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({ loading: true });
        const { userName, password } = values;
        let arr = [md5(password.toString()).substring(2, md5(password.toString()).length).toUpperCase(), 'vania']
        let pwd = '';
        arr.sort().map( (item, index) => {
          return pwd += item;
        })
        const userInfo = {
          userNo: userName, 
          pwd: sha1(pwd),
          token: 'vania'
        }
        this.props.dispatch({
          type: 'users/userLogin',
          payload: userInfo,
          callback: (data) =>{
            this.setState({ loading: false });
          if(!data.result.userInfo){
            message.error(data.result.loginResult)
          }else{
            this.props.dispatch({
              type: 'users/setUserInfo',
              payload: data.result.userInfo
            });
            let userInfo = data.result.userInfo;
            userInfo.subSystemFlag = data.result.subSystemFlag;
            localStorage.setItem('subSystemUser', JSON.stringify(userInfo));
            if(data.result.subSystemFlag === undefined){
              // undefined  没有subSystemFlag  标识 请求3.0 接口
              this.props.dispatch({
                type: 'users/getUserM',
                payload: {},
                callback: (data)=>{
                  let path = data[0].subMenus[0].path;
                  this.props.history.push({ pathname: path });
                }
              })
            }else{
              if(!data.result.subSystemFlag){
                // 跳转到选择子系统页面
                this.props.dispatch({
                  type: 'users/getSubSystem',
                  payload: {},
                  callback: () => {
                    this.props.history.push({ pathname: '/subSystem' })
                  }
                })
              }else{
                let { subSystemId, deptGuid } = data.result.userInfo
                this.props.dispatch({
                  type: 'users/findMenusByUser',
                  payload: { subSystemId, deptGuid },
                  callback: (data)=>{
                    let path = data[0].subMenus[0].path;
                    this.props.history.push({ pathname: path });
                    this.props.dispatch({
                      type: 'users/subsystemInfo',
                      payload: { subSystemId, deptGuid }
                    })
                  }
                });
              }
            }
          }
          }
        })
      }
    })
  }
  render(){
    const { getFieldDecorator } = this.props.form;
    // const { orgName } = this.state;
    const wrapperLayout = {
      wrapperCol:{ span: 15, offset: 5 }
    }
    return (
      <div className={styles['container']}>
         <div className={styles['ysy-Login-bg']} style={{ width: '62%' }}></div>
         <div className={styles['ysy-Login-form']} style={{ width: '38%' }}>
            <div className={styles['ysy-Login-form-top']}>
              {/* <span className={styles['ysy-orgName']}>{orgName}</span> */}
              <span className={styles['ysy-lgo']}></span>
              {/* <span className={styles['ysy-login-logo']}></span> */}
            </div>
            <Form onSubmit={this.handleSubmit}>
              <FormItem {...wrapperLayout}>
                {getFieldDecorator('userName', {
                  rules: [{required: true, message: '请输入用户名!'}],
                  })(
                    <Input addonBefore={<Icon type='user'/>} placeholder='用户名'/>
                )}
              </FormItem>
              <FormItem {...wrapperLayout}>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: '请输入密码!' }],
                })(
                  <Input addonBefore={<Icon type="lock" />} type="password" placeholder="密码" />
                )}
              </FormItem>
              <FormItem  {...wrapperLayout}>
                {getFieldDecorator('remember', {
                  valuePropName: 'checked',
                  initialValue: true,
                  })(
                    <Checkbox>记住用户名和密码</Checkbox>
                  )}
                  <Button type="primary" htmlType="submit" className={styles["login-form-button"]} loading={this.state.loading}>
                    登录
                  </Button>
              </FormItem>
            </Form>
            <div style={{ textAlign:'center',fontSize: 12,height: 70,paddingTop: 50  }}>
              <span>版权所有&nbsp;@普华信联&nbsp;( 武汉 )&nbsp;科技有限公司&nbsp;保留一切权力</span>
            </div>
         </div>
      </div>
    )
  }
}
export default connect( state => state)(Form.create()(Login));

