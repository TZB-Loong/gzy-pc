import { stringify } from 'qs';
import {  pathPurchase } from '../../configPath';
import request from '../utils/request';

// 材料招标详情
export async function getTender(params) {
  return request(pathPurchase + `/materialtender/getTender?${stringify(params)}`);
}
//初始化材料数据
export async function materialInitConfig() {
  return request(pathPurchase + `/materialtender/initConfig`);
}

//保存材料数据
export async function saveMaterialTender(params) {
  return request(pathPurchase + '/materialtender/saveTender', {
    method: 'POST',
    body: params,
  });
}
//材料招标列表
export async function getMaterialTenderList(params) {
  return request(pathPurchase + `/materialtender/getMaterialTenderList?${stringify(params)}`);
}

// 劳务招标详情
export async function getLabourTender(params) {
  return request(pathPurchase + `/labourtender/getTender?${stringify(params)}`);
}
//保存劳务数据
export async function saveLabourTender(params) {
  return request(pathPurchase + '/labourtender/saveLabourTender', {
    method: 'POST',
    body: params,
  });
}
// 材料招标变更
export async function getChangeList(params) {
  return request(pathPurchase + `/materialtender/getChangeList?${stringify(params)}`);
}
// 材料招标答疑
export async function questionRecords(params) {
  return request(pathPurchase + `/materialtender/questionRecords?${stringify(params)}`);
}

//初始化劳务数据
export async function labourInitConfig() {
  return request(pathPurchase + `/labourtender/initConfig`);
}
//劳务招标列表
export async function getLabourTenderList(params) {
  return request(pathPurchase + `/labourtender/getLabourTenderList?${stringify(params)}`);
}

//材料招标草稿列表
export async function getMaterialTenderDraftList(params) {
  return request(pathPurchase + `/materialtender/getMaterialTenderDraftList?${stringify(params)}`);
}

//劳务招标草稿列表
export async function getLabourTenderDraftList(params) {
  return request(pathPurchase + `/labourtender/getLabourTenderDraftList?${stringify(params)}`);
}

//草稿删除
export async function deleteDraft(params) {
  return request(pathPurchase + `/materialtender/deleteDraft?${stringify(params)}`);
}
//上传合同列表
export async function getBidList(params) {
  return request(pathPurchase + `/agreement/getBidList?${stringify(params)}`);
}
//查询合同列表
export async function getAgreements(params) {
  return request(pathPurchase + `/agreement/getAgreements?${stringify(params)}`);
}
//上传合同
export async function batchUploadAgreement(params) {
  return request(pathPurchase + '/agreement/batchUploadAgreement', {
    method: 'POST',
    body: params,
  });
}
//答疑列表
export async function queryTenderQuestionByPage(params) {
  return request(pathPurchase + `/question/queryTenderQuestionByPage?${stringify(params)}`);
}
//提交答疑
export async function saveAsk(params) {
  return request(pathPurchase + `/question/saveAsk?${stringify(params)}`);
}
//回复答疑
export async function saveReply(params) {
  return request(pathPurchase + '/question/saveReply', {
    method: 'POST',
    body: params,
  });
}
