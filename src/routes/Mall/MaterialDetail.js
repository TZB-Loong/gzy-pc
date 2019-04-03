import React, { Component } from 'react';
import Detail from '../BidManagement/MaterialView'
import Common from './Common'
export default class MaterialDetail extends Component {
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
      <Common><Detail/></Common>
    );
  }
}
