import { stringify } from 'qs';
import request from '../utils/request';
import { pathPurchase } from '../../configPath';

// 审批记录列表
export async function queryProcessTracking(params) {
  return request(pathPurchase + `/workflow/queryProcessTracking?${stringify(params)}`);
}

// // 支付详情
// export async function queryPayById(params) {
//   return request(pathBid + `/project/queryProjectById?${stringify(params)}`);
// }
// // 支付审批
// export async function queryPayName() {
//   return request(pathBid + `/project/queryCompanyName`);
// }
// // 发起支付审批
// export async function savePay(params) {
//   return request(pathBid + '/payment/reportPayment', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json; charset=utf-8',
//     },
//     body: {
//       ...params,
//     },
//   });
// }
// //删除审批
// export async function deletePay(params) {
//   return request(pathBid + `/project/operation?${stringify(params)}`);
// }
