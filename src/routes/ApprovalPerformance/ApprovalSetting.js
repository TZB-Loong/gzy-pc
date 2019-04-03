/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon } from 'antd';

@connect(({ approvalSettingModel, loading }) => ({
  approvalSettingModel,
  loading,
}))
export default class ApprovalSetting extends Component {
  state = {};

  componentDidMount() {
    // console.log(this.props);
  }

  componentWillUnmount() {}

  render() {
    const { approvalSettingModel } = this.props;

    return (
      <Card title={approvalSettingModel.data}>
        <div style={{ textAlign: 'center' }}>
          <Icon style={{ fontSize: 22 }} type="frown-o" />
        </div>
      </Card>
    );
  }
}
