module.exports = {
  /**发布线上测试环境启用**/
  pathRequest: '*',
  //DEMO环境
 /*  PurchaseBoot: 'http://demo.gzy360.com',                       //采购云首页地址
  pathPurchase: 'http://demo.purchase.gzy360.com:8082',           //采购云接口地址
  pathInquiry: 'http://demo.inquiry.gzy360.com:8081',             //询价接口地址
  pathTender: 'http://demo.mall.gzy360.com:8081',                 //商城首页
  pathModify: 'http://demo.sso.gzy360.com',                       //基本信息接口地址
  returnUrlBoot: 'http://demo.sso.gzy360.com/?ReturnURL=' + encodeURIComponent("http://demo.mall.gzy360.com:8081/user/login/valid?url=" + encodeURIComponent(window.location.href)),
  returnUrlRegister: 'http://demo.sso.gzy360.com/sso/register.html?ReturnURL=' + encodeURIComponent(window.location.href),
  softUrl: 'http://soft.gzy360.com/portfolioPage.html',          //没有购买采购云跳转的路由
  resourceUrl: 'https://resources.gzy360.com/resource/file/采购云支持与服务.pdf', */

  //测试环境
  PurchaseBoot: 'http://purchase.test.gzy360.com/index.html',                    //采购云
  pathPurchase: 'http://purchase.cloud.gzy360.com:9999',                         //采购云
  // pathPurchase: 'http://192.168.1.114:8081',                         //采购云
  pathInquiry: 'http://purchase.inquirys.gzy360.com:8081',                       //询价
  pathTender: 'http://tmall.gzy360.com',                                         //投标
  pathModify: 'http://test.gzy360.com',                                          //基本信息接口地址
  returnUrlBoot: 'http://test.gzy360.com/?ReturnURL=' + encodeURIComponent("http://tmall.gzy360.com/user/login/valid?url=" + encodeURIComponent(window.location.href)) ,
  returnUrlRegister: 'http://test.gzy360.com/sso/register.html?ReturnURL=' + encodeURIComponent(window.location.href),
  softUrl:'http://soft.gzy360.com/portfolioPage.html',                           //没有购买采购云跳转的路由
  resourceUrl:'https://resources.gzy360.com/resource/file/采购云支持与服务.pdf',   //支持与服务的下载链接

  //正式环境定版-发布版本-
  /*PurchaseBoot: 'https://purchase.gzy360.com/index.html',       //采购云
  pathPurchase: 'https://pservice.gzy360.com',                //采购云
  pathInquiry: 'https://enquiry.gzy360.com',                    //询价
  pathTender: 'https://www.gzy360.com',                         //投标
  pathModify: 'http://auth.gzy360.com',                         //基本信息修改
  returnUrlBoot: 'http://auth.gzy360.com/?ReturnURL=' + encodeURIComponent("https://www.gzy360.com/user/login/valid?url=" + encodeURIComponent(window.location.href)),
  returnUrlRegister: 'http://auth.gzy360.com/sso/register.html?ReturnURL=' + encodeURIComponent(window.location.href),
  softUrl:  'http://soft.gzy360.com/portfolioPage.html',
  resourceUrl:'https://resources.gzy360.com/resource/file/采购云支持与服务.pdf',   //支持与服务的下载链接*/


  //正式环境2
  /*PurchaseBoot: 'http://purchase.gzy360.com/index.html',      //采购云
  pathPurchase: 'http://purchase.api.gzy360.com',             //采购云
  pathInquiry: 'http://enquiry.gzy360.com',                   //询价
  pathTender: 'http://www.gzy360.com',                        //投标
  pathModify: 'http://test.gzy360.com',                       //基本信息修改
  returnUrlBoot: 'http://test.gzy360.com' + '/?ReturnURL=' + encodeURIComponent(window.location.href),
  returnUrlRegister: 'http://test.gzy360.com/sso/register.html?ReturnURL=' + encodeURIComponent(window.location.href),
  softUrl:  'http://soft.gzy360.com/portfolioPage.html',
  resourceUrl:'https://resources.gzy360.com/resource/file/采购云支持与服务.pdf',
  */
};

