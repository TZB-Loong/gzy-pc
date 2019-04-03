/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { pathRequest, returnUrlBoot } from '../../../configPath';
import { Card, Pagination, Icon, List, Button, Modal, Col, Table, Row } from 'antd';
import { Link } from 'dva/router';
import styles from './style.less';
import Empty from '../Common/Empty';

const ListItem = List.Item;

@connect(({ material, loading }) => ({
  material,
  loading,
}))
export default class TenderList extends Component {
  state = {
    isLogin: true, // 是否登录
    getTender: {}, //详情数据
    bidList: false, // 招标清单显示隐藏
    tenderColumns: [],
    tenderListData: [],
  };

  tableData(nextProps) {
    // 招标清单数据处理
    let tenderList = {},
      tenderColumns = [],
      tenderListData = [];
    if (nextProps.tenderListJsonData) {
      tenderList = JSON.parse(nextProps.tenderListJsonData);
      let tableHeaders = tenderList.tableHeaders ? JSON.parse(tenderList.tableHeaders) : [];

      if (tableHeaders) {
        tableHeaders.map(item => {
          tenderColumns.push({
            title: item.fieldChName,
            dataIndex: item.fieldEngName,
          });
        });
      }

      tenderListData = tenderList.tenderList ? tenderList.tenderList : [];
    }
    this.setState({
      tenderColumns: tenderColumns,
      tenderListData: tenderListData,
    });
  }
  componentDidMount() {
    this.tableData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.type == 'bidView') {
      this.tableData(nextProps);
    }
  }
  render() {
    let _this = this;
    let dataSource = this.state.tenderListData;
    let { isLogin, tenderColumns } = this.state;
    return (
      <div>
        {dataSource && dataSource.length > 0 ? (
          <div className={styles.tenderList}>
            <Table
              dataSource={
                this.state.bidList
                  ? dataSource
                  : isLogin
                    ? dataSource.slice(0, 9)
                    : dataSource.slice(0, 2)
              }
              columns={this.state.tenderColumns}
              pagination={false}
              rowKey={(record, i) => i}
              scroll={{ x: dataSource.length > 0 && tenderColumns.length > 5 ? 1100 : null }}
            />
            {this.state.bidList ? (
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <Button
                  onClick={() => {
                    this.setState({ bidList: false });
                  }}
                >
                  收起
                </Button>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 10,
                  display: dataSource.length > 9 ? null : 'none',
                }}
              >
                {isLogin ? (
                  <Button
                    onClick={() => {
                      this.setState({ bidList: true });
                    }}
                  >
                    展开更多
                  </Button>
                ) : (
                  <a href={returnUrlBoot}>
                    <Icon style={{ fontSize: 16, marginRight: 5 }} type="lock" />
                    登录可查看更多
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <Empty msg="清单" />
        )}
      </div>
    );
  }
}
