import React, { Component } from 'react';
import ReactDocumentTitle from '../Common/ReactDocumentTitle';
import {getCookie,getPurchased} from '../../utils/utils'
import { isfalse } from '../../Tools/util_tools';
import {pathTender,pathInquiry,returnUrlBoot,returnUrlRegister} from '../../../configPath'
import styles from './style.less'
import { connect } from 'dva';
@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/logout'],
}))
export default class Common extends Component {
  state = {
    keyword:'请输入材料、工种或者项目关键字',
    keywordValue:'',
    userName:'',
    current:1,
    already:false,
    isLogin: !isfalse(getCookie()), // 是否登录
  };
  componentDidMount() {
    if(this.state.isLogin){
      let authName = getPurchased('authCompanyName')||getPurchased('userName');
      let already = getPurchased('already_purchased')=='true';
      this.setState({
        userName:decodeURI(authName),
        already,
      })
    }
  }
  search=()=>{
    let current = this.state.current,types='';
    if(current===1){
      types = 'bid'
    }if(current ===2){
      types = 'material'
    }if(current==3){
      types = 'mateiralShop'
    }
    window.location.href=pathTender+`/material/search?type=${types}&searchKeyword=`+ this.state.keywordValue;
  };
  logout=(e)=>{
    const { dispatch } = this.props;
    dispatch({
      type: 'login/logout',
      payload: this.state.paramsAsk,
    }).then(() => {
      const { loginOutStatus } = this.props.login;
      if (loginOutStatus) {
        sessionStorage.clear();
        let keys = document.cookie.match(/[^ =;]+(?=\=)/g);
        if (keys) {
          for (let i = keys.length; i--; )
            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
        }
        window.location.href = pathTender;
      }
    });
  };
  render() {
    const {children} = this.props;
    const {keyword,userName,current,already} = this.state;
    return (
      <ReactDocumentTitle title="公装云">
          <div className={styles.warp}>
            <div className={`${styles.top} ${styles.box1920}`}>
              <div className={`${styles.topNav}`}>
                <div className={`${styles.box1200} ${styles.wp} ${styles.clearfix}`}>
                  <div className={styles.fl}>您好，{userName+' '}欢迎来到建科公装 &nbsp;
                    {isfalse(getCookie())?
                    <span>
                      <a rel="nofollow" href={returnUrlBoot}><i className={`${styles.iconLogin}`}> </i>登录</a>
                      <span className={styles.pipe}></span>
                      <a rel="nofollow" href={returnUrlRegister}><i className={styles.iconRegister}> </i>注册</a>
                    </span>:
                      <a rel="nofollow" href="javascript:void(0);" onClick={()=>this.logout()}><i className={styles.iconLoginout}> </i>退出
                      </a>
                    }
                  </div>
                  <div className={styles.fr}>
                    <span className={`${styles.pipe}`}>
                      <a ref="nofollow" className="management_title" href="http://saas.gzy360.com" target="_blank">
                        <span className="management_icons"></span>公装云项目管理平台
                      </a>
                    </span>
                    {!isfalse(getCookie())?<span className={`${styles.pipe}`}>
                        <a href={already?"#/":pathTender+"/user/mytender"}>会员中心</a>
                    </span>:null}
                    <span className={`${styles.pipe}`}>
                       <a href={pathTender+"/column/Authentication/help"} target="_blank" ref="nofollow">帮助中心</a>
                    </span>
                    <span  className={`${styles.pipe}`}>
                        <a href={pathTender+"/article/articlelist/28"}>新闻资讯</a>
                    </span>
                    <span >
                      <span>公装云热线：&nbsp;</span>
                    </span>
                    <strong>400-101-1718</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${styles.slogan} ${styles.slogan} ${styles.clearfix} ${styles.box1200}`}>
              <a className={`${styles.logo} ${styles.navbarLogoM} ${styles.fl}`} href={pathTender}><img src={require('../../assets/mallLogo.png')} alt=""/></a>
              <div className={`${styles.inputSearchBox} ${styles.fr}`}>
                <div className={`${styles.search_key} ${styles.fr}`}>
                  <form className={`${styles.formSearch} ${styles.clearfix}`} method="post" action="">
                    <div className={`${styles.searchType}`}>
                      <span className={`${current==1?styles.current:''} ${styles.pipe}`} onClick={()=>{this.setState({keyword:'请输入材料、工种或者项目关键字',current:1})}}>招投标</span>
                      <span className={`${current==2?styles.current:''} ${styles.pipe}`} onClick={()=>{this.setState({keyword:'请输入材料关键字',current:2})}}>材料</span>
                      <span className={`${current==3?styles.current:''}`} onClick={()=>{this.setState({keyword:'请输入商家公司名',current:3})}}>商家</span>
                    </div>
                    <div className={styles.searchKeyword} style={{display:'inline-block'}}>
                      <input name="searchKeyword" className={`${styles.inputText}`} onChange={(e)=>{this.setState({
                        keywordValue:e.target.value,
                      })}} placeholder={'请输入'+keyword}/>
                      <img src={require("../../assets/icon/search.png")} onClick={()=>this.search()} width={24} height={24} alt=""/>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <header className={`${styles.navbarWrapper} ${styles.boxl920}`}>
              <div className={styles.navbarNav}>
                    <ul className={styles.cl}>
                      <li><a href={pathTender}>首页</a></li>
                      <li className={styles.current}><a href={pathTender+"/bid"}>招投标</a></li>
                      <li><a href={pathInquiry+"/inquiry"}>询价宝</a></li>
                      <li><a href={pathTender+"/marketmaterials"}>找材料</a></li>
                      <li><a href={pathTender+"/labour"}>找劳务</a></li>
                      <li><a href="http://saas.gzy360.com">项目管理</a></li>
                    </ul>
              </div>
            </header>
            <div className={`${styles.box1200} ${styles.container}`}>{children}</div>
            <div style={{borderTop:'1px solid #f5f5f5',marginTop:20,paddingTop:20}} className={styles.blogroll}>
              <div className={styles.box1200}>
                <h5><b>友情链接</b></h5>
                <p style={{marginBottom:10,marginTop:10}}>
                  <a href="http://www.cqdarui.com/" target="_blank" className="va-m mr-5" title="重庆装修公司">重庆装修公司</a>
                  <a href="http://www.028xfmf.cn/" target="_blank" className="va-m mr-5" title="成都装修公司">成都装修公司</a>
                  <a href="http://qinzhou.zxdyw.com/" target="_blank" className="va-m mr-5" title="钦州装修公司">钦州装修公司</a>
                  <a href="http://cz.leju.com/" target="_blank" className="va-m mr-5" title="常州房产">常州房产</a>
                  <a href="http://www.goaldou.com/" target="_blank" className="va-m mr-5" title="佛山装修公司">佛山装修公司</a>
                  <a href="http://www.chinajcw.com/" target="_blank" className="va-m mr-5" title="建材网">建材网</a>
                  <a href="http://www.mhwy2.com/" target="_blank" className="va-m mr-5" title="成都店铺装修">成都店铺装修</a>
                  <a href="http://www.szxcvr.cn/" target="_blank" className="va-m mr-5" title="成都动画制作公司">成都动画制作公司</a>
                  <a href="https://www.hbltjz.cn/" target="_blank" className="va-m mr-5" title="武汉家装公司">武汉家装公司</a>
                  <a href="http://www.zfju.com/" target="_blank" className="va-m mr-5" title="造福居装修网">造福居装修网</a>
                  <a href="http://www.xjzx0471.com/" target="_blank" className="va-m mr-5" title="呼和浩特装修网">呼和浩特装修网</a>
                  <a href="http://www.4d01.com/" target="_blank" className="va-m mr-5" title="北京三维动画公司">北京三维动画公司</a>
                  <a href="http://www.htkdszm.com/" target="_blank" className="va-m mr-5" title="航天康达树脂门">航天康达树脂门</a>
                  <a href="http://www.68shw.com/" target="_blank" className="va-m mr-5" title="顺德装修信息网">顺德装修信息网</a>
                  <a href="http://www.0451zxw.cn/" target="_blank" className="va-m mr-5" title="哈尔滨装修">哈尔滨装修</a>
                  <a href="http://www.yklangjun.com/" target="_blank" className="va-m mr-5" title="食堂餐桌椅">食堂餐桌椅</a>
                  <a href="http://hxfy888.com/" target="_blank" className="va-m mr-5" title="小产权房">小产权房</a>
                  <a href="http://www.ppzhome.com/" target="_blank" className="va-m mr-5" title="成都装修套餐">成都装修套餐</a>
                  <a href="http://www.gljt88.com/" target="_blank" className="va-m mr-5" title="热水锅炉">热水锅炉</a>
                  <a href="http://www.gulanfa.com/" target="_blank" className="va-m mr-5" title="装修公司">装修公司</a>
                  <a href="http://www.xiuyanol.com/" target="_blank" className="va-m mr-5" title="岫岩网">岫岩网</a>
                  <a href="http://www.cddrzs.com/" target="_blank" className="va-m mr-5" title="公司装修">公司装修</a>
                  <a href="http://shidian.qizuang.com/" target="_blank" className="va-m mr-5" title="施甸装修公司">施甸装修公司</a>
                  <a href="http://www.cdxfmf.com/" target="_blank" className="va-m mr-5" title="成都装修公司推荐">成都装修公司推荐</a>
                  <a href="http://www.passont.com/" target="_blank" className="va-m mr-5" title="门窗十大品牌">门窗十大品牌</a>
                  <a href="http://www.lndy.net/" target="_blank" className="va-m mr-5" title="沈阳室内装修">沈阳室内装修</a>
                  <a href="http://www.czbsgs.com/" target="_blank" className="va-m mr-5" title="碳钢弯头">碳钢弯头</a>
                  <a href="http://xa.xhj.com/" target="_blank" className="va-m mr-5" title="西安房产网">西安房产网</a>
                  <a href="http://www.njsrjc.com/" target="_blank" className="va-m mr-5" title="透水混凝土">透水混凝土</a>
                  <a href="http://www.gongzhuangcn.cn/" target="_blank" className="va-m mr-5" title="合肥装修公司">合肥装修公司</a>
                  <a href="http://www.91quming.cn/" target="_blank" className="va-m mr-5" title="长沙装饰公司">长沙装饰公司</a>
                  <a href="http://www.xmzshi.com/" target="_blank" className="va-m mr-5" title="深圳办公室装修">深圳办公室装修</a>
                  <a href="http://www.hxfy888.com/" target="_blank" className="va-m mr-5" title="深圳小产权房">深圳小产权房</a>
                  <a href="https://www.1688.com/" target="_blank" className="va-m mr-5" title="阿里巴巴">阿里巴巴</a>
                </p>
              </div>
            </div>
            <div className={styles.links}>
              <div className={`${styles.box1200} ${styles.clearfix}`}>
                <dl className={styles.fl}>
                  <dt><img src={require("../../assets/zhaobiao.png")} width={40} height={40} alt=""/>我是招标方</dt>
                  <dd><a href={pathTender+"/column/Authentication/help"} ref="nofollow">如何认证</a></dd>
                  <dd><a href={pathTender+"/column/tend/help"} ref="nofollow">如何发标</a></dd>
                  <dd><a href={pathTender+"/column/tend schedule/help"} ref="nofollow">招标进程查询</a></dd>
                </dl>
                <dl className={styles.fl}>
                  <dt><img src={require("../../assets/toubiao.png")} width={40} height={40} alt=""/>我是投标方</dt>
                  <dd><a href={pathTender+"/column/zongze/help"} ref="nofollow">云服务总则</a></dd>
                  <dd><a href={pathTender+"/column/zhengce/help"} ref="nofollow">服务政策</a></dd>
                </dl>
                <dl className={styles.fl}>
                  <dt><img src={require("../../assets/xieyi.png")} width={40} height={40} alt=""/>协议</dt>
                  <dd><a href={pathTender+"/column/userAgreement/help"} ref="nofollow">用户协议</a></dd>
                  <dd><a href={pathTender+"/column/item/help"} ref="nofollow">招投标交易条款</a></dd>
                </dl>
                <dl className={styles.fl}>
                  <dt><img src={require("../../assets/saomiao.png")} width={40} height={40} alt=""/>扫描二维码关注公装云和招投标</dt>
                  <dd>
                    <img src={require("../../assets/weixin_code.jpg")} alt=""/>
                    <img src={require("../../assets/weixin_code_dingyue.jpg")} alt=""/>
                  </dd>
                </dl>
              </div>
            </div>
            <footer className={styles.footerBox}>
              <div className={styles.container}>
                <nav className={styles.footerNav}>
                  <a target="_blank" href={pathTender+"/column/contact"} className={styles.pipe}>联系公装云</a>
                  <a target="_blank" href={pathTender+"/column/about"} className={styles.pipe}>关于公装云</a>
                  <a target="_blank" href={pathTender+"/column/law"}>法律声明</a>
                </nav>
                <p>Copyright © 深圳建科网络科技有限公司 2015-2018 All rights reserved</p>
                <p>备案号：粤ICP备16112703号－2</p>
                <div style={{marginTop:15}}>
                  <a rel="nofollow" target="_blank" href="http://szcert.ebs.org.cn/Default.aspx?id=1c332719-d187-4d7a-9237-2975b01ff001" title="工商网监">
                    <img src={require("../../assets/out7.jpg")} alt=""/></a>
                  {/*<a rel="nofollow" target="_blank" href="http://www.cyberpolice.cn/wfjb/" title="上海网警">
                    <img src={require("../../assets/out_2.jpg")} alt=""/></a>
                  <a rel="nofollow" target="_blank" href="http://www.zx110.org/" title="网络社会征信网">
                    <img src={require("../../assets/out_3.jpg")} alt=""/></a>
                  <a rel="nofollow" target="_blank" href="http://www.cecdc.com/" title="诚信网站">
                    <img src={require("../../assets/out_4.jpg")} alt=""/></a>
                  <a rel="nofollow" target="_blank" href="http://cctv.creditbrand.org/" title="中国信用企业">
                    <img src={require("../../assets/out_5.jpg")} alt=""/></a>
                  <a rel="nofollow" target="_blank" href="http://www.yujie.org.cn" title="行业验证">
                    <img src={require("../../assets/out_6.jpg")} alt=""/></a>*/}
                </div>
              </div>
            </footer>
          </div>
      </ReactDocumentTitle>
    );
  }
}
