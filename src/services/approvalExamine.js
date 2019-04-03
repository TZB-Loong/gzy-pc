import { stringify } from 'qs';
import request from '../utils/request';
import { pathPurchase } from '../../configPath';

//查询投标列表
export async function queryBidList(params) {
  return request(pathPurchase + `/calibration/queryBidList?${stringify(params)}`);
}

//提交定标审批
export async function reportCalibration(params){
  return request(pathPurchase + `/calibration/reportCalibration?${stringify(params)}`)
  // return request('http://192.168.1.116:8081/' + `/calibration/reportCalibration?${stringify(params)}`)
}

//批准定标审批
export async function sendCalibration(params){
  return request(pathPurchase + `/calibration/sendCalibration?${stringify(params)}`)
  // return request('http://192.168.1.116:8081/' + `/calibration/sendCalibration?${stringify(params)}`)
}

//驳回定标审批
export async function backCalibration(params){
  return request(pathPurchase + `/calibration/backCalibration?${stringify(params)}`)
  // return request('http://192.168.1.116:8081/' + `/calibration/backCalibration?${stringify(params)}`)
}
//下载招标清单
export async function createfile(params){
  return request(pathPurchase + `/materialtender/createfile?${stringify(params)}`)
  // return request('http://192.168.1.116:8081/' + `/calibration/backCalibration?${stringify(params)}`)
}
