import React, { Component } from 'react';
export default class Empty extends Component {
  state = {
    msg:'',
  };
  componentDidMount() {
    this.setState({
      msg:this.props.msg,
    })
  }
  render() {
    return (
        <div className="emptyData">
          <img src={require('../../assets/empty.png')} alt="" />
          {this.props.isView?"暂无权限查看":"暂无"+this.state.msg+"数据..."}
        </div>
    );
  }
}
