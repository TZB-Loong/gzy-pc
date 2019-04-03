/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Divider, Table, Spin } from 'antd';
import { isfalse, timestampToTime, currentTime, dateDiff } from '../../Tools/util_tools';
import Empty from '../Common/Empty';

@connect(({ myAccountModel, loading }) => ({
  myAccountModel,
  loading: loading.effects['myAccountModel/queryCorpService'],
}))
export default class MyAccount extends Component {
  state = {
    dataSource: [],
    columns: [
      {
        title: '交易时间',
        dataIndex: 'buyTime',
        key: 'buyTime',
      },
      {
        title: '交易单号',
        dataIndex: 'orderNo',
        key: 'orderNo',
      },
      {
        title: '交易金额',
        dataIndex: 'price',
        key: 'price',
      },
      {
        title: '交易状态',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: '交易备注',
        dataIndex: 'remark',
        key: 'remark',
      },
    ],
    effectiveTime: '',
    periodDay: '',
    showEmpty: false,
  };

  // static defaultProps = {
  //   //参数需要传入(或者说从最高级的dva中传入)
  //   corpId: 666,
  // };

  componentDidMount() {
    this.queryCorpService();
  }
  componentWillUpdate(nextProps) {
    if (nextProps.loading != this.props.loading) {
      const { myAccountModel } = this.props;
      let accountData = myAccountModel.accountData,
        source = [];
      if (!isfalse(myAccountModel.accountData)) {
        if (!isfalse(accountData.corpServiceBuyRecords)) {
          accountData.corpServiceBuyRecords.map((item, index) => {
            source.push({
              key: index + 1,
              buyTime: timestampToTime(item.buyTime),
              orderNo: item.orderNo,
              price: item.price,
              remark: item.remark,
              status: item.status,
            });
          });
          let expireTime = timestampToTime(accountData.service.expireTime);
          let newCurrentTime = currentTime();
          this.setState({
            dataSource: source,
            effectiveTime: expireTime,
            periodDay: dateDiff(expireTime, newCurrentTime),
            showEmpty: true,
          });
        }
      } else {
        // console.log('我的账户信息数据为空')
      }
    }
  }

  queryCorpService = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'myAccountModel/queryCorpService',
    }).then(() => {
      // console.log(this.props,'--this.props')
    });
  };

  render() {
    const { myAccountModel, loading } = this.props;

    return (
      <Spin spinning={loading}>
        <Card title={myAccountModel.data} loading={loading}>
          {isfalse(this.state.dataSource) ? (
            <Empty msg="账号" />
          ) : (
            <div style={{ textAlign: 'left' }}>
              <span>
                帐号有效期：
                {this.state.effectiveTime}
                ,有效期还剩
                <b style={{ color: 'red' }}>{this.state.periodDay}</b>
                天。
                <b style={{ marginLeft: '20px', color: 'blue' }}>
                  {' '}
                  <a href="javascript:void(0)">立即续费</a>
                </b>
              </span>

              <Divider orientation="left">账号记录</Divider>
              <Table dataSource={this.state.dataSource} columns={this.state.columns} bordered />
            </div>
          )}
        </Card>
      </Spin>
    );
  }
}
