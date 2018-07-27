import request from '../../utils/request';
import { _local } from '../../api/local';

export function searchAdminList(options) {
  return request(`${_local}/user/searchAdminList`, {//查询管理员列表
    method: 'POST',
    type: 'formData',
    body: options
  });
}

export function modifyAdminInfo(options) {
  return request(`${_local}/user/modifyAdminInfo`, {//编辑管理员信息
    method: 'POST',
    type: 'formData',
    body: options
  });
}

