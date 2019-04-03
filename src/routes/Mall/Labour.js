import React, { Component } from 'react';
import Bid from '../BidManagement/BidLabour'
import Common from './Common'
export default class Labour extends Component {
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
