import { stringify } from 'qs';
import request from '../utils/request';
import { pathPurchase } from '../../configPath';

// 审核列表
//export async function queryProcessByPage(params) {
// return request(pathBid + `/project/queryProjectByPage?${stringify(params)}`);
//}

// 待办流程列表
export async function queryProcessByPage(params) {
  return request(pathPurchase + `/workflow/queryTodoTaskList?${stringify(params)}`);
}

// 已办流程列表
export async function queryDoneProcessByPage(params) {
  return request(pathPurchase + `/workflow/queryDoneTaskList?${stringify(params)}`);
}
// 我发起流程列表
export async function queryMyProcessByPage(params) {
  // return request( 'http://192.168.1.114:8081'   + `/workflow/queryLaunchedTaskList?${stringify(params)}`);
  return request( pathPurchase   + `/workflow/queryLaunchedTaskList?${stringify(params)}`);
}
// 支付审批详情
export async function queryPaymentDetails(params) {
  return request(pathPurchase + `/payment/queryPayment?${stringify(params)}`);
}
//  审批支付(同意)
export async function sendApproval(params) {
  return request(pathPurchase + `/payment/sendPayment?${stringify(params)}`);
}

//  审批支付(不同意)
export async function sendApprovalNo(params) {
  return request(pathPurchase + `/payment/backPayment?${stringify(params)}`);
}

//  定标审批列表
export async function bidApprovalList(params) {
  return request(pathPurchase + `/calibration/queryBidList?${stringify(params)}`);
}

//  待开标招标列表
export async function queryAwaitOpenTenderList(params) {
  return request(pathPurchase + `/calibration/queryAwaitOpenTenderList?${stringify(params)}`);
}

//自定义审批发起列表
export async function bizObjectList(params) {
  return request(pathPurchase+ `/web/base/bizObject/bizObjectList?${stringify(params)}`);
  // return request('http://192.168.1.116:8082'+ `/web/base/bizObject/bizObjectList?${stringify(params)}`);
  // return request('http://192.168.1.114:8081'+ `/web/base/bizObject/bizObjectList?${stringify(params)}`);
}
//自定义审批删除
export async function removeForm(params) {
  return request(pathPurchase+ `/web/base/bizObject/delete?${stringify(params)}`);
  // return request('http://192.168.1.116:8082'+ `/web/base/bizObject/delete?${stringify(params)}`);
  // return request('http://192.168.1.114:8081'+ `/web/base/bizObject/delete?${stringify(params)}`);
}
//自定义审批提交获取控件
export async function bizObjectMetadataCustomList(params){
   return request(pathPurchase+ `/web/base/bizObject/bizObjectMetadataCustomList?${stringify(params)}`);
   // return request('http://192.168.1.116:8082'+ `/web/base/bizObject/bizObjectMetadataCustomList?${stringify(params)}`);
   // return request('http://192.168.1.114:8081'+ `/web/base/bizObject/bizObjectMetadataCustomList?${stringify(params)}`);
}

//自定义审批表单提交
export async function customFormSave(params) {
  // return request(pathPurchase + '/web/base/bizObject/customFormSave', {
  // return request(pathPurchase + '/web/base/bizObject/customFormSave', {
  return request(pathPurchase+'/workflow/bizObject/report', {
    method: 'POST',
    body: params,
  })
  // return request('http://192.168.1.114:8081'+`/workflow/bizObject/report?${stringify(params)}`)
  // return request(pathPurchase+`/workflow/bizObject/report?${stringify(params)}`)
}


//自定义审批列表查看详情
export async function customFormView(params){
  return request(pathPurchase+`/web/base/bizObject/customFormView?${stringify(params)}`)
}
//自定义审批列表 发起审批
export async function send(params){
  return request(pathPurchase+`/workflow/bizObject/send?${stringify(params)}`)
}
//自定义审批列表 回退
export async function back(params) {
  return request(pathPurchase+`/workflow/bizObject/back?${stringify(params)}`)
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
