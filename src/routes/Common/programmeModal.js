/**
 * 中标方案modal弹框
 * @param {string} title  '标题文字'
 * @param {string} tenderId  招标Id
 * @param {string} tenderType 1为材料 2为劳务
 */

import React, { Component } from 'react';
import { Modal, Table } from 'antd';
import { connect } from 'dva';
import { isfalse } from '../../Tools/util_tools';
import { pathTender } from '../../../configPath';

@connect(({ common, loading }) => ({
  common,
  loading: loading.effects['common/getTenderCaseList'],
}))
export default class ProgrammeModal extends Component {
  state = {
    visible: false,
    columns: [
      {
        title: '中标单位',
        dataIndex: 'bidCompanyName',
        key: 'bidCompanyName',
      },
      {
        title: '金额(单位:元)',
        dataIndex: this.props.tenderType == 1 ? 'price' : 'projectPrice',
        key: this.props.tenderType == 1 ? 'price' : 'projectPrice',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => {
          if (this.props.tenderType == 1) {
            //材料
            if (record.bidAuthbusinessId != -1) {
              return (
                <a href={pathTender + '/user/materialbid/details/' + record.id} target="_blank">
                  查看中标方案
                </a>
              );
            }
          } else {
            //劳务
            if (record.bidCompanyId != -1) {
              return (
                <a href={pathTender + '/lbid/' + record.id + '/toultbview'} target="_blank">
                  查看中标方案
                </a>
              );
            }
          }
        },
      },
    ],
    dataSource: [],
    params: {
      tenderId: '',
      tenderType: '',
    },
  };

  componentDidMount() {
    this.setState({
      params: {
        tenderId: this.props.tenderId,
        tenderType: this.props.tenderType,
      },
    });
  }
  getTenderCaseList = () => {
    // 获取数据
    const { dispatch } = this.props;
    dispatch({
      type: 'common/getTenderCaseList',
      payload: this.state.params,
    }).then(() => {
      const { common } = this.props;
      if (!isfalse(common.tenderCaseList)) {
        const source = [];
        common.tenderCaseList.map(item => {
          source.push({
            ...item,
            id: isfalse(item.materialBidId) ? item.labourBidId : item.materialBidId,
            bidCompanyName: item.bidCompanyName,
          });
        });
        this.setState({
          dataSource: source,
        });
      }
    });
  };

  showModal = () => {
    this.setState(
      {
        visible: true,
      },
      () => this.getTenderCaseList()
    );
  };

  handleOk = e => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { common } = this.props;
    return (
      <div>
        <a onClick={this.showModal}>{this.props.title}</a>
        <Modal visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Table
            style={{ marginTop: 15 }}
            columns={this.state.columns}
            dataSource={this.state.dataSource}
            pagination={false}
            rowKey={record => record.id}
          />
        </Modal>
      </div>
    );
  }
}
