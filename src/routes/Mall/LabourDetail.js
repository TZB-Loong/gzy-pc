import React, { Component } from 'react';
import Detail from '../BidManagement/LabourView'
import Common from './Common'
export default class LabourDetail extends Component {
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
