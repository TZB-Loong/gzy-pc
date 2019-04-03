import { stringify } from 'qs';
import {pathPurchase} from '../../configPath'
import request from '../utils/request';

export async function queryCorpUsersAndRoles(params) {
  return request(pathPurchase+`/ucenter/user/queryCorpUsersAndRoles?${stringify(params)}`);
}

export async function modifyCorpMemberRole(params) {
  return request(pathPurchase+'/ucenter/user/modifyCorpMemberRole', {
    method: 'POST',
    body: params,
  });
}
