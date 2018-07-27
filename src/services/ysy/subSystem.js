import request from '../../utils/request';
import { _local } from '../../api/local';

export function searchSubSystemTrees(options) {
  return request(`${_local}/subSystem/searchSubSystemTreeTis`, { //查询子系统列表
    method: 'POST',
    type: 'formData',
    body: options
  });
}
export function addSubSystem(options) {
  return request(`${_local}/subSystem/addSubSystem`, { //新建子系统
    method: 'POST',
    type: 'formData',
    body: options
  }); 
}

export function updateSubSystem(options) {
  return request(`${_local}/subSystem/updateSubSystem`, { //编辑子系统
    method: 'POST',
    type: 'formData',
    body: options
  }); 
}

export function deleteSubSystem(options) {
  return request(`${_local}/subSystem/deleteSubSystem`, {  //删除子系统
    method: 'POST',
    type: 'formData',
    body: options
  });
}

export function searchMenuListBySubSystem(options) {
  return request(`${_local}/subSystem/searchMenuListBySubSystem`, {//查询子系统下的菜单列表
    method: 'POST',
    type: 'formData',
    body: options
  }); 
}

export function findMenuById(options) {
  return request(`${_local}/menu/findMenuById`, { //根据输入id 查询菜单信息
    method: 'POST',
    type: 'formData',
    body: options
  }); 
}

export function addMenu(options) {
  return request(`${_local}/subSystem/addMenu`, { //子系统下添加新菜单
    method: 'POST',
    type: 'formData',
    body: options
  }); 
}