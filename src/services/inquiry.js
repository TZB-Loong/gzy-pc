import { stringify } from 'qs';
import { pathInquiry, pathPurchase } from '../../configPath';
import request from '../utils/request';

//询价列表
export async function queryInquiryByPage(params) {
  return request(pathInquiry + `/inquiry/queryInquiryByPage?${stringify(params)}`);
}
//提前结束询价理由
export async function getDictionaryByParentId(params) {
  return request(pathPurchase + `/common/getDictionaryByParentId?${stringify(params)}`);
}
//询价列表操作
export async function operation(params) {
  return request(pathInquiry + `/inquiry/operation?${stringify(params)}`);
}
