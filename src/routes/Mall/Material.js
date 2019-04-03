import React, { Component } from 'react';
import Bid from '../BidManagement/BidMaterial'
import Common from './Common'
export default class Material extends Component {
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
      <Common><Bid/></Common>
    );
  }
}
