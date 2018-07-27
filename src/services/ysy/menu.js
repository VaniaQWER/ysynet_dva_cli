import request from '../../utils/request';
import { _local } from '../../api/local';

export function queryMenuList(options){
  return request(`${_local}/menu/queryMenuList`,{ //查询菜单列表
    methods: 'POST',
    type: 'formData',
    body: options
  })
}


export function modifyMenu(options){
  return request(`${_local}/menu/modifyMenu`,{ //编辑菜单
    methods: 'POST',
    type: 'formData',
    body: options
  })
}