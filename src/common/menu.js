/*eslint-disable*/ //作用是文件关闭eslint检查
import {message} from 'antd'
import { isUrl,getPurchased } from '../utils/utils';
import { isfalse } from '../Tools/util_tools';
import request from '../utils/request';
import {pathPurchase} from '../../configPath'
import { setSession } from '../utils/authority';
let menuData = [];
//商城详情页面时候阻止初始化菜单请求
if(getPurchased('already_purchased')=='true'){
  if(isfalse(sessionStorage.getItem('menuData'))){
    request(pathPurchase + `/ucenter/user/initConfig`).then((res)=>{
      if(res!=undefined){
        if(res.status=='200'){
          let result = res.data;
          menuData = result.menuViews;
          setSession('authbusiness',JSON.stringify(result.authbusiness));
          setSession('menuData',JSON.stringify(result.menuViews));
          setSession('user',JSON.stringify(result.user));
          setSession('menuOperations',result.menuOperations);
          window.location.reload();
        }else {
          message.info(res.msg)
        }
      }else {
        message.info('数据请求失败!')
      }
    });
  }else{
    menuData = JSON.parse(sessionStorage.getItem('menuData'));
  }
}
function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}
export let getMenuData = () => formatter(menuData);

