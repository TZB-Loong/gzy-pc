import { stringify } from 'qs';
import request from '../utils/request';
import { pathPurchase } from '../../configPath';

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function queryTags() {
  return request('/api/tags');
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}
export async function logOut() {
  return request(pathPurchase+'/login/logout');
}

//附件查询
export async function queryAttachList(params) {
  // return request('/base/attach/queryAttachList', {
  //   method: 'POST',
  //   body: params,
  // });
  return request(pathPurchase + `/base/attach/queryAttachList?${stringify(params)}`);
}
//附件删除
export async function deleteAttachList(params) {
  return request(pathPurchase + `/base/attach/deleteAttach?${stringify(params)}`);
}

//导入材料文件校验
export async function importExcel(params) {
  return request(pathPurchase + '/supplier/excel/importSupplierLabour', {
    method: 'POST',
    body: params,
  });
}
//导入劳务供应商
export async function importSupplierLabours(params) {
  return request(pathPurchase + '/supplier/addBatchSupplierLabour', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
//导入材料供应商
export async function importSupplierMaterial(params) {
  return request(pathPurchase + '/supplier/saveMaterialSupplierbatch', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

//我的账户
export async function queryCorpService(params) {
  return request(pathPurchase + `/ucenter/corpService/queryCorpService?${stringify(params)}`); //连接测试
  // return request(`/ucenter/corpService/queryCorpService?${stringify(params)}`) //连接本地
}

//公司信息
export async function queryAuthbusinessById(params) {
  return request(pathPurchase + `/ucenter/Authbusiness/queryAuthbusinessById?${stringify(params)}`); //连接测试
  // return request(`/ucenter/Authbusiness/queryAuthbusinessById?${stringify(params)}`)  //连接本地
}

//修改公司信息
export async function saveAuthbusiness(params) {
  /*  return request(pathSupplier+'/ucenter/Authbusiness/saveAuthbusiness', { //连接测试
    method: 'POST',
    body: JSON.stringify(params),
  });
 */

  return request(pathPurchase + `/ucenter/Authbusiness/saveAuthbusiness?${stringify(params)}`); //连接本地
  // return request('/ucenter/Authbusiness/saveAuthbusiness', { //连接本地
  //   method: 'POST',
  //   body: JSON.stringify(params),
  // });
}
//材料分类查询
export async function getMaterialCategoryData() {
  return request(pathPurchase + `/base/materialCategory/getMaterialCategoryData`);
}
//字典查询
export async function multipleType(params) {
  return request(
    pathPurchase + `/web/base/dictionary/dictionaryList/multipleType?${stringify(params)}`
  );
}
// 项目选择
export async function getCurrentUserCorpProjectList(params) {
  // console.log(params,'--params')
  return request(pathPurchase + `/project/getCurrentUserCorpProjectList?${stringify(params)}`);
}

// 审批记录
export async function queryProcessTracking(params) {
  // console.log(params,'--params')
  return request(pathPurchase + `/workflow/queryProcessTracking?${stringify(params)}`);
  // return request('http://192.168.1.114:8081' + `/workflow/queryProcessTracking?${stringify(params)}`);
}

//供应商选择 (私人供应商)
export async function getSupplierList(params) {
  // return request(pathSupplier + `/supplier/getSupplierList?${stringify(params)}`);
  return request(pathPurchase + `/supplier/getSupplierList?${stringify(params)}`);
}

//供应商选择(公共平台供应商)

export async function getAuthbusinessList(params) {
  // return request(pathSupplier + `/supplier/getAuthbusinessList?${stringify(params)}`);
  return request(pathPurchase + `/supplier/getAuthbusinessList?${stringify(params)}`);
}

//省份和分类查询(选择供应商组件)
export async function getProAndType(params) {
  // return request(pathSupplier + `/supplier/getProAndType?${stringify(params)}`);
  return request(pathPurchase + `/supplier/getProAndType?${stringify(params)}`);
}

//获取所有待开标招标列表
export async function queryAwaitOpenTenderList(params) {
  return request(pathPurchase + `/calibration/queryAwaitOpenTenderList?${stringify(params)}`);
}

//中标方案
export async function getTenderCaseList(params) {
  return request(pathPurchase + `/materialtender/getTenderCaseList?${stringify(params)}`);
}
// 首页数量统计
export async function getQuantityStatistics(params) {
  return request(pathPurchase + `/ucenter/user/getQuantityStatistics?${stringify(params)}`);
}
// 首页待审批流程列表
export async function getTodoTaskList(params) {
  return request(pathPurchase + `/index/getTodoTaskList?${stringify(params)}`);
}
// 首页待定标招标列表
export async function getWaitOpenTenderList(params) {
  return request(pathPurchase + `/index/getWaitOpenTenderList?${stringify(params)}`);
}
// 首页供应商广告列表
export async function getSupplierBannerList(params) {
  return request(pathPurchase + `/index/getSupplierBannerList?${stringify(params)}`);
}
// 首页本年项目图表统计
export async function getThisYearProjectStatistics(params) {
  return request(pathPurchase + `/index/getThisYearProjectStatistics?${stringify(params)}`);
}
// 首页用户自定义排版详情
export async function getHomePanel(params) {
  return request(pathPurchase + `/index/getHomePanel?${stringify(params)}`);
}
// 首页用户自定义排版保存
export async function saveHomePanel(params) {
  return request(pathPurchase + `/index/saveHomePanel?${stringify(params)}`);
}
// 修改用户头像
export async function updateUserPic(params) {
  console.log(params);
  return request(pathPurchase + `/ucenter/user/updateUserPic?${stringify(params)}`);
}
//自定义字段筛选
export async function filterData(params) {
  return request(pathPurchase + `/web/base/bizObject/filterData?${stringify(params)}`);
}
//  首页动态内容展示
export async function queryOperateDynamicInfo(params) {
  return request(pathPurchase + `/web/operateDynamic/queryOperateDynamicInfo?${stringify(params)}`);
}
//项目审批发起人检测
export async function initiatorCheck(params){
  return request(pathPurchase + `/project/initiatorCheck?${stringify(params)}`);
}
//控件列表
export async function getControlList(params){
  return request(pathPurchase + `/web/base/bizObject/controlList`);
  // return request('http://192.168.1.116:8082' + `/web/base/bizObject/controlList`);
  // return request('http://192.168.1.114:8081' + `/web/base/bizObject/controlList`);
}
//保存表单数据
export async function saveFormData(params){
  // return request('http://192.168.1.114:8081' + '/web/base/bizObject/bizObjectMetadataSave', {
  return request(pathPurchase + '/web/base/bizObject/bizObjectMetadataSave', {
    method: 'POST',
    body: params,
  });
  //return request(pathPurchase + `/web/base/bizObject/bizObjectMetadataSave?${stringify(params)}`);
}
// 审批类型查询
export async function queryTypeList(params){
  return request(pathPurchase + `/web/base/config/configTypeAll`);
  // return request('http://192.168.1.116:8082' + `/web/base/config/configTypeAll`);
  // return request('http://192.168.1.114:8081' + `/web/base/config/configTypeAll`);
}
// 审批类型新增
export async function allFormType(params){
  return request(pathPurchase + `/web/base/config/configTypeEdit?${stringify(params)}`);
  // return request('http://192.168.1.116:8082' + `/web/base/config/configTypeEdit?${stringify(params)}`);
  // return request('http://192.168.1.114:8081' + `/web/base/config/configTypeAll`);
}
