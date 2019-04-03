import { stringify } from 'qs';
import request from '../utils/request';
import { pathPurchase } from '../../configPath';
export async function queryLabourList(params) {
  return request(pathPurchase + `/supplier/querySupplierLabourByPage?${stringify(params)}`);
}
//材料列表请求
export async function queryMaterialList(params) {
  return request(pathPurchase + `/supplier/queryMaterialSupplierList?${stringify(params)}`);
}
export async function deleteMaterialSupplier(params) {
  return request(pathPurchase + `/supplier/deleteMaterialSupplierById?${stringify(params)}`);
}
export async function deleteLabourSupplier(params) {
  return request(pathPurchase + `/supplier/deleteSupplierLabourById?${stringify(params)}`);
}
export async function saveMaterialList(params) {
  // return request(pathSupplier+`/supplier/saveMaterialSupplier?${stringify(params)}`);
  return request(pathPurchase + '/supplier/saveMaterialSupplier', {
    method: 'POST',
    body: params,
  });
}
// 劳务编辑
export async function saveLabourlList(params) {
  // return request(pathSupplier+`/supplier/saveSupplierLabour?${stringify(params)}`);
  return request(pathPurchase + '/supplier/saveSupplierLabour', {
    method: 'POST',
    body: params,
  });
}

//(自定义字段管理) 列出所有的自定义字段
export async function bizObjectMetadataList(params) {
  return request(pathPurchase + `/web/base/bizObject/bizObjectMetadataList?${stringify(params)}`);
}

//(自定义字段管理) 删除字段
export async function bizObjectMetadataDelete(params) {
  return request(pathPurchase + `/web/base/bizObject/bizObjectMetadataDelete?${stringify(params)}`);
}

//(自定义字段管理) 添加或者编辑自定义字段
export async function bizObjectMetadataEdit(params) {
  return request(pathPurchase + `/web/base/bizObject/bizObjectMetadataEdit?${stringify(params)}`);
}

//所有字段列表
export async function bizObjectListSettingShow(params) {
  return request(pathPurchase + `/web/base/bizObject/bizObjectListSettingShow?${stringify(params)}`);
}

//修改显示字段列表
export async function bizObjectListSettingEdit(params) {
  return request(pathPurchase + '/web/base/bizObject/bizObjectListSettingEdit', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function bizObjectListSettingList(params) {
  return request(pathPurchase + `/web/base/bizObject/bizObjectListSettingList?${stringify(params)}`);
}
