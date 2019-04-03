import React, { Component } from 'react';
import { Card, Spin, Table, Row, Popconfirm, Pagination, Radio } from 'antd';
import { connect } from 'dva';
import { isfalse, timestampToTime } from '../../Tools/util_tools';
import styles from './style.less';
import LabourDraftList from './labourDraftList';
import {getUrlParamBySearch} from '../../utils/utils'
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

@connect(({ materialList, loading }) => ({
  materialList,
  loading: loading.effects['materialList/getMaterialTenderDraftList'],
}))
class materialDraftList extends Component {
  state = {
    params: {
      current: 1,
      size: 10,
    },
    deleteDraftParams: {
      tenderId: '',
      tenderType: 1,
    },
    dataSource: [],
    total: 0,
    radioValue: '1',
    dataCanhge: false,
  };

  componentWillMount = () => {
    this.getMaterialTenderDraftList();
    this.setState({
      radioValue:getUrlParamBySearch(this.props.location.search, 'radioValue')?getUrlParamBySearch(this.props.location.search, 'radioValue'):'1'
    })
  };

  getMaterialTenderDraftList = () => {
    // 获取材料招标列表
    const { dispatch } = this.props;

    dispatch({
      type: 'materialList/getMaterialTenderDraftList',
      payload: this.state.params,
    }).then(() => {
      const { materialList } = this.props;
      // console.log(this.p)
      let source = [];
      if (!isfalse(materialList.materialTenderDraftList)) {
        if (!isfalse(materialList.materialTenderDraftList.records)) {
          materialList.materialTenderDraftList.records.map((item, index) => {
            source.push({
              key: index + 1,
              id: item.materialTenderId,
              name: '招:' + item.materialCategoryNames,
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
              () => this.getMaterialTenderDraftList()
            );
          }
        }

        this.setState({
          dataSource: source,
          total: materialList.materialTenderDraftList.total,
          dataCanhge: true,
        });
      }
    });
  };

  deleteDraft = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'materialList/deleteDraft',
      payload: this.state.deleteDraftParams,
    }).then(() => {
      this.getMaterialTenderDraftList();
    });
  };

  confirm = data => {
    this.setState(
      {
        deleteDraftParams: {
          tenderId: data,
          tenderType: 1,
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
            <a href={'#/bid/material?action=draft&tenderId=' + record.id}>编辑</a>
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
      () => this.getMaterialTenderDraftList()
    );
  };

  onShowSizeChange = (current, size) => {
    //修改页码的函数
    this.setState(
      {
        params: Object.assign({}, this.state.params, { current, size }),
      },
      () => this.getMaterialTenderDraftList()
    );
  };

  radioChange = e => {
    this.setState({
      radioValue: e.target.value,
    });
  };

  render() {
    const { loading } = this.props;

    return (
    <PageHeaderLayout>
      <Spin spinning={false}>
        <Card title={'草稿箱'} loading={!this.state.dataCanhge}>
          <Radio.Group value={this.state.radioValue} onChange={this.radioChange.bind(this)}>
            <Radio.Button value="1">材料草稿列表</Radio.Button>
            <Radio.Button value="2">劳务草稿列表</Radio.Button>
          </Radio.Group>
          {this.state.radioValue == '1' ? (
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
          ) : (
            <LabourDraftList />
          )}
        </Card>
      </Spin>
    </PageHeaderLayout>
    );
  }
}

export default materialDraftList;
