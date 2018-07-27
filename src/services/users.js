import request from '../utils/request';
import { _local } from '../api/local'

// 获取3.0 菜单
export function getUserM(options){
  return request(`${_local}/login/getUserM`,{ 
    methods: 'POST',
    type: 'formData',
    body: options
  })
}

export function login(options){
  return request(`${_local}/login/subSystemLogin`,{ //用户登陆
    methods: 'POST',
    type: 'formData',
    body: options
  })
}
export function getDeployOrgName(options){
  return request(`${_local}/login/getDeployOrgName`,{ //获取机构名称
    methods: 'POST',
    type: 'formData',
    body: options
  })
}

export function getUserSubSystem(options){
  return request(`${_local}/login/getUserSubSystem`,{ //获取子系统
    methods: 'POST',
    type: 'formData',
    body: options
  })
}

export function findMenusByUser(options){
  return request(`${_local}/login/findMenusByUser`,{ // 获取用户模块和权限
    methods: 'POST',
    type: 'formData',
    body: options
  })
}