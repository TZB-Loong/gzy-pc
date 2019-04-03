import React, { Component } from 'react';

import { Card, Spin, Table, Row, Popconfirm, Pagination } from 'antd';
import { connect } from 'dva';
import { isfalse, timestampToTime } from '../../Tools/util_tools';
import styles from './style.less';
@connect(({ labourList, loading }) => ({
  labourList,
  loading: loading.effects['labourList/getLabourTenderDraftList'],
}))
export default class LabourDraftList extends Component {
  state = {
    params: {
      current: 1,
      size: 10,
    },
    dataSource: [],
    total: 0,
    radioValue: '',
    dataCanhge: false,
  };

  componentWillMount = () => {
    this.getLabourTenderDraftList();
  };

  getLabourTenderDraftList = () => {
    // 获取材料招标列表
    const { dispatch } = this.props;

    dispatch({
      type: 'labourList/getLabourTenderDraftList',
      payload: this.state.params,
    }).then(() => {
      const { labourList } = this.props;
      let source = [];
      if (!isfalse(labourList.labourListDraftList)) {
        if (!isfalse(labourList.labourListDraftList.records)) {
          labourList.labourListDraftList.records.map((item, index) => {
            source.push({
              key: index + 1,
              id: item.labourTenderId,
              name: '招:' + item.workTypeName,
              projectId: item.projectName,
              releaseTime: timestampToTime(item.addTime, 'HM'),
            });
          });
        } else {
          let current = this.state.params.current;
          if (current > 1) {
            current = current - 1;
            this.setState(
              {
                params: Object.assign({}, this.state.params, { current: current }),
              },
              () => this.getLabourTenderDraftList()
            );
          }
        }
        this.setState({
          dataSource: source,
          total: labourList.labourListDraftList.total,
          dataCanhge: true,
        });
      }
    });
  };

  deleteDraft = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'labourList/deleteDraft',
      payload: this.state.deleteDraftParams,
    }).then(() => this.getLabourTenderDraftList());
  };

  confirm = data => {
    this.setState(
      {
        deleteDraftParams: {
          tenderId: data,
          tenderType: 2,
        },
      },
      () => this.deleteDraft()
    );
  };

  getColumnsData = () => {
    return [
      {
        title: '招标信息',
        dataIndex: 'name',
        key: 'name',
        width:400,
      },
      {
        title: '所属项目',
        dataIndex: 'projectId',
        key: 'projectId',
        render: text => (
          <div
            style={{
              // width: '130px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'releaseTime',
        key: 'releaseTime',
      },
      {
        title: '操作',
        dataIndex: 'options',
        key: 'options',
        width: 150,
        // textAlgin:"center",
        render: (text, record) => (
          <span style={{ display: 'flex', justifyContent: 'space-around' }}>
            <a href={'#/bid/labour?action=draft&tenderId=' + record.id}>编辑</a>
            <Popconfirm
              placement="bottom"
              title={'是否删除及相关数据'}
              onConfirm={this.confirm.bind(this, record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a>删除</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
  };

  pageChange = (page, pageSize) => {
    //页码发生变化时

    let oldParams = this.state.params;

    this.setState(
      {
        params: Object.assign({}, oldParams, { current: page, size: pageSize }),
      },
      () => this.getLabourTenderDraftList()
    );
  };

  onShowSizeChange = (current, size) => {
    //修改页码的函数
    this.setState(
      {
        params: Object.assign({}, this.state.params, { current, size }),
      },
      () => this.getLabourTenderDraftList()
    );
  };
  render() {
    const { loading } = this.props;

    return (
      <Spin spinning={false}>
        {/* <Card title={'劳务招标草稿'} loading={!this.state.dataCanhge}> */}
        <span>
          <Table
            bordered
            columns={this.getColumnsData()}
            dataSource={this.state.dataSource}
            style={{ marginTop: '20px' }}
            pagination={false}
            rowKey={record => record.key}
            className={styles.resizeTable}
            loading={loading}
          />
          <div style={{ marginTop: '20px',textAlign:'right' }}>
            <Row>
              <Pagination
                current={this.state.params.current}
                pageSize={this.state.params.size}
                total={this.state.total}
                onChange={(page, pageSize) => this.pageChange(page, pageSize)}
                onShowSizeChange={(current, size) => this.onShowSizeChange(current, size)}
                showQuickJumper
                showSizeChanger
              />
            </Row>
          </div>
        </span>

        {/* </Card> */}
      </Spin>
    );
  }
}
