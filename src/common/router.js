/*eslint-disable*/ //作用是文件关闭eslint检查
import React, { createElement } from 'react';
import { Spin } from 'antd';
import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { getMenuData } from './menu';

let routerDataCache;
const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // register models
  models.forEach(model => {
    if (modelNotExisted(app, model)) {
      // eslint-disable-next-line
      app.model(require(`../models/${model}`).default);
    }
  });

  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return Loadable({
    loader: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
    loading: () => {
      return <Spin size="large" className="global-spin" />;
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/homepage': {
      component: dynamicWrapper(
        app,
        ['accountManagementModel/myAccountModel', 'accountManagementModel/homepageModel'],
        () => import('../routes/AccountManagement/Homepage')
      ),
      name: '主页',
    },
    '/account/mine': {
      component: dynamicWrapper(app, ['accountManagementModel/myAccountModel'], () =>
        import('../routes/AccountManagement/MyAccount')
      ),
      name: '我的账户',
    },
    '/account/companyInformation': {
      component: dynamicWrapper(app, ['accountManagementModel/companyInformation', 'common'], () =>
        import('../routes/HeaderPage/CompanyInformation')
      ),
      name: '公司信息',
    },
    '/account/basicInformation': {
      component: dynamicWrapper(app, [], () => import('../routes/HeaderPage/BasicInformation')),
      name: '基本信息',
    },
    '/account/child': {
      component: dynamicWrapper(
        app,
        ['accountManagementModel/authoritySettings', 'accountManagementModel/accountChildModel'],
        () => import('../routes/AccountManagement/AccountChild')
      ),
      name: '权限设置',
    },
    '/account/seetings': {
      component: dynamicWrapper(app, ['accountManagementModel/authoritySettings'], () =>
        import('../routes/AccountManagement/PermissionsSettings')
      ),
      name: '企业子账号',
    },
    '/projectManagement': {
      component: dynamicWrapper(app, ['myProjectModel/myProjectModel'], () =>
        import('../routes/MyProject/MyProject')
      ),
      name: '我的项目',
    },
    '/project/add': {
      component: dynamicWrapper(app, ['myProjectModel/myProjectModel', 'common'], () =>
        import('../routes/MyProject/AddProject')
      ),
      name: '添加项目',
    },
    '/project/details': {
      component: dynamicWrapper(app, ['myProjectModel/myProjectModel', 'common'], () =>
        import('../routes/MyProject/ProjectDetails')
      ),
      name: '项目详情',
    },
    '/project/ProjectSetting': {
      component: dynamicWrapper(app, ['myProjectModel/myProjectModel', 'common'], () =>
        import('../routes/MyProject/ProjectSetting')
      ),
      name: '项目设置',
    },
    '/processCenter/waitProcess': {
      component: dynamicWrapper(app, ['processCenterModel/waitProcessModel'], () =>
        import('../routes/processCenter/waitProcess')
      ),
      name: '待审批',
    },
    '/processCenter/doneProcess': {
      component: dynamicWrapper(app, ['processCenterModel/doneProcessModel'], () =>
        import('../routes/processCenter/doneProcess')
      ),
      name: '已审批',
    },
    '/processCenter/myProcess': {
      component: dynamicWrapper(app, ['processCenterModel/myProcessModel'], () =>
        import('../routes/processCenter/myProcess')
      ),
      name: '我发起',
    },
    '/processCenter/ProcessStart': {
      component: dynamicWrapper(app, ['processCenterModel/processStartModel'], () =>
        import('../routes/processCenter/processStart')
      ),
      name: '审批管理-发起审批',
    },
    '/processCenter/processApproval': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/payApprovalModel'], () =>
        import('../routes/ApprovalPerformance/payApproval')
      ),
      name: '审批管理-支付审批',
    },
    '/processCenter/processDetails': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/payDetailsModel'], () =>
        import('../routes/ApprovalPerformance/payDetails')
      ),
      name: '审批管理-支付详情',
    },

    '/processCenter/flowRecordList': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/flowRecordListModel'], () =>
        import('../routes/ApprovalPerformance/flowRecordList')
      ),
      name: '审批管理-记录',
    },
    '/processCenter/flowStep': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/flowStepModel'], () =>
        import('../routes/Common/flowStep')
      ),
      name: '审批管理-步骤',
    },
    '/performance/setting': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/approvalSettingModel'], () =>
        import('../routes/ApprovalPerformance/ApprovalSetting')
      ),
      name: '项目审批设置',
    },
    '/performance/bidApproval': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/approvalExamine'], () =>
        import('../routes/ApprovalPerformance/bidApproval')
      ),
      name: '审批管理-定标详情',
    },
    '/performance/bidApprovalView': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/approvalExamine'], () =>
        import('../routes/ApprovalPerformance/bidApprovalView')
      ),
      name: '审批管理-定标详情',
    },
    '/performance/progress': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/approvalProgressModel'], () =>
        import('../routes/ApprovalPerformance/ApprovalProgress')
      ),
      name: '项目审批进度',
    },
    '/performance/performanceProgress': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/performanceProgressModel'], () =>
        import('../routes/ApprovalPerformance/PerformanceProgress')
      ),
      name: '履约进度',
    },
    '/processCenter/payWorkflow': {
      component: dynamicWrapper(app, ['approvalPerformanceModel/payWorkflowModel'], () =>
        import('../routes/ApprovalPerformance/payWorkflow')
      ),
      name: '发起支付审批',
    },
    '/informationCenter': {
      component: dynamicWrapper(
        app,
        ['informationCenterModel/informationCenterModel', 'management/staffManagement'],
        () => import('../routes/InformationCenter/InformationCenter')
      ),
      name: '消息中心',
    },
    '/InformationView': {
      component: dynamicWrapper(app, ['informationCenterModel/informationCenterModel'], () =>
        import('../routes/InformationCenter/InformationView')
      ),
      name: '消息详情',
    },
    '/supplierManagement/material': {
      component: dynamicWrapper(app, ['supplierManagementModel/materialSupplier', 'common'], () =>
        import('../routes/SupplierManagement/MaterialSupplier')
      ),
      name: '材料供应商',
    },

    '/supplierManagement/labour': {
      component: dynamicWrapper(app, ['supplierManagementModel/labourSupplier', 'common'], () =>
        import('../routes/SupplierManagement/LabourSupplier')
      ),
      name: '劳务供应商',
    },

    '/s_Management': {
      component: dynamicWrapper(app, ['supplierManagementModel/materialSupplier'], () =>
        import('../routes/spare/SupplierManagement')
      ),
    },
    '/addfile': {
      component: dynamicWrapper(app, ['supplierManagementModel/materialSupplier'], () =>
        import('../routes/SupplierManagement/Addfile')
      ),
      name: '材料字段管理',
    },
    '/addfilelabour': {
      component: dynamicWrapper(app, ['supplierManagementModel/labourSupplier'], () =>
        import('../routes/SupplierManagement/AddfileLabour')
      ),
      name: '劳务自定义字段管理',
    },
    '/bid/material': {
      component: dynamicWrapper(
        app,
        ['bid/material', 'myProjectModel/myProjectModel', 'common'],
        () => import('../routes/BidManagement/BidMaterial')
      ),
      name: '发布材料招标',
    },
    '/bid/labour': {
      component: dynamicWrapper(app, ['bid/labour', 'myProjectModel/myProjectModel'], () =>
        import('../routes/BidManagement/BidLabour')
      ),
      name: '发布劳务招标',
    },
    '/bid/materialList': {
      component: dynamicWrapper(app, ['bid/materialList'], () =>
        import('../routes/BidManagement/materialList')
      ),
      name: '材料招标管理',
    },
    '/bid/labourList': {
      component: dynamicWrapper(app, ['bid/labourList'], () =>
        import('../routes/BidManagement/labourList')
      ),
      name: '劳务招标管理',
    },
    '/bid/PurchaseList': {
      component: dynamicWrapper(app, ['InquiryManagement/Inquiry'], () =>
        import('../routes/InquiryManagement/PurchaseList')
      ),
      name: '询价管理',
    },
    '/inquiry/releaseInquiry': {
      component: dynamicWrapper(app, ['InquiryManagement/Inquiry'], () =>
        import('../routes/InquiryManagement/ReleaseInquiry')
      ),
      name: '发布询价',
    },
    '/inquiry/PurchaseView': {
      component: dynamicWrapper(app, ['InquiryManagement/Inquiry'], () =>
        import('../routes/InquiryManagement/PurchaseView')
      ),
      name: '报价详情',
    },
    '/bid/MaterialView': {
      component: dynamicWrapper(app, ['bid/material'], () =>
        import('../routes/BidManagement/MaterialView')
      ),
      name: '材料招标详情',
    },

    '/bid/LabourView': {
      component: dynamicWrapper(app, ['bid/labour'], () =>
        import('../routes/BidManagement/LabourView')
      ),
      name: '劳务招标详情',
    },
    '/bid/materialDraft': {
      component: dynamicWrapper(app, ['bid/materialList'], () =>
        import('../routes/BidManagement/materialDraftList')
      ),
      name: '草稿箱',
    },
    '/bid/labourDraft': {
      component: dynamicWrapper(app, ['bid/labourList'], () =>
        import('../routes/BidManagement/labourDraftList')
      ),
      name: '草稿箱',
    },
    '/bid/UploadContract': {
      component: dynamicWrapper(app, ['bid/bidContract', 'common'], () =>
        import('../routes/BidManagement/UploadContract')
      ),
      name: '上传合同',
    },
    '/bid/AnswerList': {
      component: dynamicWrapper(app, ['bid/bidContract', 'common'], () =>
        import('../routes/BidManagement/AnswerList')
      ),
      name: '答疑列表',
    },

   /* '/designTest': {
      component: dynamicWrapper(app, [], () => import('../routes/Custom/SortableComponent')),
      name: '流程设计',
    },*/
    '/processCenter/processEdit': {
      component: dynamicWrapper(app, ['common'], () =>
        import('../routes/processCenter/processEdit')
      ),
      name: '编辑审批',
    },

    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import('../routes/Exception/triggerException')
      ),
    },
    // '/user': {
    //   component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    // },
    // '/user/login': {
    //   component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    // },
    // '/user/register': {
    //   component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    // },
    // '/user/register-result': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    // },
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
    '/view/material': {
      component: dynamicWrapper(app, ['bid/material'], () =>
        import('../routes/BidManagement/MaterialView')
      ),
    },
    '/view/labour': {
      component: dynamicWrapper(app, ['bid/labour'], () =>
        import('../routes/BidManagement/LabourView')
      ),
    },
    '/view/MaterialView': {
      component: dynamicWrapper(app, ['bid/material'], () =>
        import('../routes/BidManagement/MaterialView')
      ),
      name: '材料招标详情',
    },
    '/processCenter/designFormWrite':{
      component:dynamicWrapper(app,['designForm/submForm'],()=>
        import('../routes/Custom/designFormWrite')
    ),
      name:'提交审批'
    },
    '/processCenter/designFormNext':{
      component:dynamicWrapper(app,['designForm/submForm'],()=>
        import('../routes/Custom/designFormNext')
      ),
      name:'提交审批'
    },
    '/processCenter/addTemplate': {
      component: dynamicWrapper(app, ['custom','designForm/submForm'], () => import('../routes/Custom/DesignForms')),
      name: '新建审批模板',
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
