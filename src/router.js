import React from 'react';
import { routerRedux, Route, Switch } from 'dva/router';
import { getCookie, getPurchased,getQueryPath,clearCookie } from './utils/utils';
import { isfalse } from './Tools/util_tools';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized';
import Interceptor from './interceptor';              //跳转链接显示的页面
import { returnUrlBoot ,softUrl} from '../configPath';
import mallBidMaterial from './routes/Mall/Material'
import mallBidLabour from './routes/Mall/Labour'
import LabourDetail from './routes/Mall/LabourDetail'
import MaterialDetail from './routes/Mall/MaterialDetail'

const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute } = Authorized;
function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);

  const pathname = history.location.pathname;

  function interceptorRouter(zhCN, history) { //没有权限时的路由

    return (
      <LocaleProvider locale={zhCN}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route path="/" component={Interceptor} />
          </Switch>
        </ConnectedRouter>
      </LocaleProvider>
    )
  }

  function purchasedRouter(zhCN, history) { //有权限时的路由
    const BasicLayout = routerData['/'].component;
    return (
      <LocaleProvider locale={zhCN}>
        <ConnectedRouter history={history}>
          <Switch>
            {/*<Route path="/user" component={UserLayout} />*/}
            <Route path="/bidMaterial" component={mallBidMaterial} />        /**商城发布材料招标页面**/
            <Route path="/bidLabour" component={mallBidLabour} />            /**商城发布劳务招标页面**/
            <Route path="/materialDetail" component={MaterialDetail} />      /**商城发布劳务招标页面**/
            <Route path="/labourDetail" component={LabourDetail} />          /**商城发布劳务招标页面**/
            <Route path="/interceptor" component={Interceptor} />
            <AuthorizedRoute
              path="/"
              render={props => <BasicLayout {...props} />}
              authority={['admin', 'user']}
              redirectPath={getQueryPath('/account/mine', {
                redirect: window.location.href,
              })}
            />
          </Switch>
        </ConnectedRouter>
      </LocaleProvider>)
  }
  if (isfalse(getCookie())) { //未登录
    if (pathname == '/materialDetail' || pathname == '/labourDetail') {
      return purchasedRouter(zhCN, history)
    } else {
      window.top.location.href = returnUrlBoot;
      return interceptorRouter(zhCN, history);
    }
  } else {
    if (getPurchased('already_purchased') == 'true') {
      return purchasedRouter(zhCN, history)
    } else {
      if (
        pathname == '/materialDetail'||
        pathname == '/labourDetail'||
        pathname == '/bid/LabourView' ||
        pathname == '/bid/MaterialView' ||
        pathname == '/bid/labour' ||
        pathname == '/bid/material'||
        pathname == '/bidMaterial'||
        pathname == '/bidLabour') {
        return purchasedRouter(zhCN, history)
      } else {
        clearCookie();
        window.top.location.href = softUrl;
        return interceptorRouter(zhCN, history);
      }
    }
  }
}

export default RouterConfig;
