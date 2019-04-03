/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon } from 'antd';

@connect(({ approvalProgressModel, loading }) => ({
  approvalProgressModel,
  loading,
}))
export default class ApprovalProgress extends Component {
  state = {};

  componentDidMount() {
    // console.log(this.props);
  }

  componentWillUnmount() {}

  render() {
    const { approvalProgressModel } = this.props;

    return (
      <Card title={approvalProgressModel.data}>
        <div style={{ textAlign: 'center' }}>
          <Icon style={{ fontSize: 22 }} type="frown-o" />
        </div>
      </Card>
    );
  }
}
