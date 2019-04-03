import { getBreadcrumb } from './index';
import { urlToList } from '../_utils/pathTools';

const routerData = {

  '/userinfo': {
    name: '用户列表',
  },
  '/userinfo/:id': {
    name: '用户信息',
  },
  '/userinfo/:id/addr': {
    name: '收货订单',
  },
};
describe('test getBreadcrumb', () => {

  it('Parameters url', () => {
    expect(getBreadcrumb(routerData, '/userinfo/2144').name).toEqual('用户信息');
  });
  it('The middle parameter url', () => {
    expect(getBreadcrumb(routerData, '/userinfo/2144/addr').name).toEqual('收货订单');
  });
  it('Loop through the parameters', () => {
    const urlNameList = urlToList('/userinfo/2144/addr').map(url => {
      return getBreadcrumb(routerData, url).name;
    });
    expect(urlNameList).toEqual(['用户列表', '用户信息', '收货订单']);
  });

  it('a path', () => {
    const urlNameList = urlToList('/userinfo').map(url => {
      return getBreadcrumb(routerData, url).name;
    });
    expect(urlNameList).toEqual(['用户列表']);
  });
  it('Secondary path', () => {
    const urlNameList = urlToList('/userinfo/2144').map(url => {
      return getBreadcrumb(routerData, url).name;
    });
    expect(urlNameList).toEqual(['用户列表', '用户信息']);
  });
});
