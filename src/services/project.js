import { stringify } from 'qs';
import request from '../utils/request';
import { pathPurchase } from '../../configPath';

// 项目列表
export async function queryProjectByPage(params) {
  return request(pathPurchase + `/project/queryProjectByPage?${stringify(params)}`);
}

// 项目详情
export async function queryProjectById(params) {
  return request(pathPurchase + `/project/queryProjectById?${stringify(params)}`);
}
// 获取单位名称
export async function queryCompanyName() {
  return request(pathPurchase + `/project/queryCompanyName`);
}
// 添加/编辑项目
export async function saveProject(params) {
  return request(pathPurchase + '/project/saveProject', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      ...params,
    },
  });
}
//(我的项目) 删除项目
export async function deleteProject(params) {
  return request(pathPurchase + `/project/operation?${stringify(params)}`);
}
//项目人员列表
export async function queryProjectMemberList(params) {
  return request(pathPurchase + `/project/queryProjectMemberList?${stringify(params)}`);
}
//项目人员设置
export async function saveProjectMember(params) {
  // return request(pathBid + `/project/saveProjectMember?${stringify(params)}`);
  return request(pathPurchase + `/project/saveProjectMember?${stringify(params)}`, {
    method: 'POST',
  });
}
