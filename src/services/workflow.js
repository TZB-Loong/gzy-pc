import { stringify } from 'qs';
import request from '../utils/request';
import { pathPurchase } from '../../configPath';

// 保存流程
export async function saveWorkflow(params) {
  console.log(params);
  return request(pathPurchase + `/workflow/process/deployXml`, {
    method: 'POST',
    body: params,
  });
}
// 保存自定义流程
export async function saveCustomWorkflow(params) {
  return request('http://192.168.1.116:8082' + `/workflow/process/deployXmlBiz`, {
  // return request(pathPurchase + `/workflow/process/deployXmlBiz`, {
    method: 'POST',
    body: params,
  });
}
// 流程定义列表
export async function workflowList(params) {
  return request(pathPurchase + `/workflow/process/list2`, {
    method: 'POST',
    body: params,
  });
}
// 流程定义详情
export async function workflowDetails(params) {
  return request(pathPurchase + `/workflow/process/designer2?${stringify(params)}`);
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
