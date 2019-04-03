import React, { Component } from 'react';
export default class Empty extends Component {
  state = {
    msg:'',
  };
  componentDidMount() {
   /* this.setState({
      msg:this.props.msg,
    })*/
  }
  render() {
    return (
      <div className="protocl" style={{padding:'10px 15px'}}>
        <ol>
          <li style={{marginBottom:'10px'}}>平台免费向发标方（施工单位、建设方）提供发布招标(包括但不限于材料招标、分包招标、劳务招标)的功能；</li>
          <li style={{marginBottom:'10px'}}>平台免费向投标方（材料供应商、分包商、劳务供应商）提供给投标的功能；</li>
          <li style={{marginBottom:'10px'}}>招标方需按照发布招标时设定的开标日期内确定并公布中标方，若同一发标方没及时确定并公布中标方的次数>=3时，平台有权取消招标方的发标资格、进行冻结账号处理；</li>
          <li style={{marginBottom:'10px'}}>招标方确定中标方后，平台即获得向发标方收取签约合同额千分之三，及向中标方收取签约合同额千分之五的服务费的权利；</li>
          <li>平台在招标方或者发标方上传交易合同时，收取上述第4点的交易服务费；若其中一方延期缴纳或拒绝缴纳，平台有权采取冻结账号、诉诸法律等措施维护平台权益。</li>
        </ol>
      </div>
    );
  }
}
