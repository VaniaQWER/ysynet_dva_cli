import request from '../../utils/request';
import { _local } from '../../api/local'

export function searchDeployList(options){
  return request(`${_local}/deploy/searchDeployList`,{ //部署管理列表查询
    methods: 'POST',
    type: 'formData',
    body: options
  })
}

export function searchSubSystemList(options){
  return request(`${_local}/subSystem/searchSubSystemList`,{ //查询子系统列表
    methods: 'POST',
    type: 'formData',
    body: options
  })
}

export function modifySubSystemList(options){
  return request(`${_local}/deploy/modifySubSystemList`,{ //部署或机构编辑子系统
    methods: 'POST',
    type: 'formData',
    body: options
  })
}
