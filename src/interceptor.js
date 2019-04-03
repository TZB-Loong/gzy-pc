import React, { Component } from 'react';
import {Spin} from 'antd';

export default class Interceptor extends Component {

  state={
    height: document.documentElement.clientHeight
  }

  componentDidMount() {
    console.log(this.state.height)
  }
  render() {
    return (
      <Spin spinning={true} style={{height:"100%"}}>
        <div style={{width:"100%",height:this.state.height,textAlign:'center',marginTop:'250px'}}>
        跳转中...
        </div>
      </Spin>

    )
  }
}
