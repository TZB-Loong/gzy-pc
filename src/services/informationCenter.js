import { stringify } from 'qs';
import request from '../utils/request';
import { pathPurchase } from '../../configPath';

// 审核列表
//export async function queryProcessByPage(params) {
// return request(pathBid + `/project/queryProjectByPage?${stringify(params)}`);
//}

// 审核列表
export async function queryInformationByPage(params) {
  return request(pathPurchase + `/workflow/queryTodoTaskList?${stringify(params)}`);
}

// 项目详情
//export async function queryProjectById(params) {
//  return request(pathBid+`/project/queryProjectById?${stringify(params)}`);
//}
// 获取单位名称
// export async function queryCompanyName() {
//  return request(pathBid+`/project/queryCompanyName`);
//}
// 添加/编辑项目
//export async function saveProject(params) {
//  return request(pathBid+'/project/saveProject', {
//   method: 'POST',
//  headers: {
//     'Content-Type': 'application/json; charset=utf-8',
//  },
//   body: {
//    ...params,
//   },
// });
//}
//(我的项目) 删除项目
//export async function deleteProject(params) {
// return request(pathBid+`/project/operation?${stringify(params)}`);
//}
