import request from '../utils/request';
import { stringify } from 'qs';
import { pathPurchase } from '../../configPath';
export async function query() {
  return request('/api/users');
}
export async function queryCurrent() {
  return request('/api/currentUser');
}
//获取菜单列表
export async function fetchMenu() {
  // return request(pathPurchase + `/ucenter/user/initConfig`);
  return request(pathPurchase + `/ucenter/user/initConfig`);
}
//获取成员角色
export async function queryRoleUsers(params) {
  return request(pathPurchase + `/ucenter/userRole/queryRoleUsers?${stringify(params)}`);
}
//获取角色列表
export async function queryRoles() {
  return request(pathPurchase + `/ucenter/role/queryRoles`);
}
//获取角色权限列表
export async function queryRoleMenus(params) {
  return request(pathPurchase + `/ucenter/role/queryRoleMenus?${stringify(params)}`);
}
//保存部门
export async function saveRole(params) {
  return request(pathPurchase + `/ucenter/role/saveRole?${stringify(params)}`);
}
//删除部门
export async function deleteRole(params) {
  return request(pathPurchase + `/ucenter/role/deleteRoleById?${stringify(params)}`);
}
//保存权限
export async function saveAuthority(params) {
  return request(pathPurchase + `/ucenter/role/changeRoleMenus?${stringify(params)}`);
  /* return request(pathPurchase+'/ucenter/role/changeRoleMenus', {
    method: 'POST',
    body: params,
  });*/
}

//获取子账号列表
export async function showCorpMembers() {
  return request(pathPurchase + `/ucenter/corpMember/showCorpMembers`);
}
//获取成员角色
export async function updateSubUserStatus(params) {
  return request(pathPurchase + `/ucenter/corpMember/updateSubUserStatus?${stringify(params)}`);
}
//查询重复名
export async function serchSameUserName(params) {
  return request(pathPurchase + `/ucenter/corpMember/serchSameUserName?${stringify(params)}`);
}
// 添加/编辑子账号
export async function saveSubUser(params) {
  return request(pathPurchase + '/ucenter/corpMember/saveSubUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      ...params,
    },
  });
}
//消息中心
export async function queryMessagesByPage(params) {
  return request(pathPurchase + `/web/base/message/queryMessagesByPage?${stringify(params)}`);
}
//消息详情
export async function showMessageDetails(params) {
  return request(pathPurchase + `/web/base/message/showMessageDetails?${stringify(params)}`);
}
//获取菜单详情
export async function getUserMenus(params) {
  return request(pathPurchase + `/ucenter/role/getUserMenus?${stringify(params)}`);
}
