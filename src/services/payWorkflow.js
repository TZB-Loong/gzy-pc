import { stringify } from 'qs';
import request from '../utils/request';
import { pathPurchase } from '../../configPath';

// 支付审批列表
export async function queryPayByPage(params) {
  return request(pathPurchase + `/project/queryProjectByPage?${stringify(params)}`);
}

// 支付详情
export async function queryPayById(params) {
  return request(pathPurchase + `/project/queryProjectById?${stringify(params)}`);
}
// 支付审批
export async function queryPayName() {
  return request(pathPurchase + `/project/queryCompanyName`);
}
// 发起支付审批
export async function savePay(params) {
  return request(pathPurchase + '/payment/reportPayment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      ...params,
    },
  });
}
//删除审批
export async function deletePay(params) {
  return request(pathPurchase + `/project/operation?${stringify(params)}`);
}
// 发起支付审批意见
export async function sendApproval(params) {
  return request(pathPurchase + '/payment/sendPayment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      ...params,
    },
  });
}
