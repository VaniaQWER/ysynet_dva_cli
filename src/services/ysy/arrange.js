import request from '../../utils/request';
import { _local } from '../../api/local';
export function saveDeploy(options) {
  return request(`${_local}/deploy/saveDeploy`, {//添加或编辑部署
    method: 'POST',
    type: 'formData',
    body: options
  });
}

export function findDeployOrgList(options) {
  return request(`${_local}/deploy/findDeployOrgList`, {//查询部署机构(已部署/未部署)
    method: 'POST',
    type: 'formData',
    body: options
  });
}

export function deployModifyOrg(options) {
  return request(`${_local}/deploy/deployModifyOrg`, {//部署编辑机构
    method: 'POST',
    type: 'formData',
    body: options
  });
}

export function findOrgs(options) {
  return request(`${_local}/orgInfoController/findOrgs`, {//查询所有机构下拉列表
    method: 'POST',
    type: 'formData',
    body: options
  });
}

export function searchDeployList(options) {
  return request(`${_local}/deploy/searchDeployList`, {//部署列表查询
    method: 'POST',
    type: 'formData',
    body: options
  });
}