/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { Link } from 'dva/router';
import { connect } from 'dva';
import { Card, Icon, Tabs, Table, Radio } from 'antd';
import StaffChange from '../Common/StaffChange'; //选人组件
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const columns = [
  {
    title: '标题内容',
    dataIndex: 'title',
    key: 'title',
    render: (tex, record) => (
      <Link
        style={{ color: record.messageStatus == 1 ? '#333757' : '' }}
        to={
          '/InformationView?messageId=' +
          record.messageId +
          '&messageStatus=' +
          record.messageStatus
        }
      >
        {tex}
      </Link>
    ),
  },
  {
    title: '状态',
    dataIndex: 'messageStatus',
    key: 'messageStatus',
    render: messageStatus => {
      let status = <span>未阅读</span>;
      if (messageStatus == 1) {
        status = <span>已阅读</span>;
      }
      return status;
    },
  },
  {
    title: '提交时间',
    dataIndex: 'createTime',
    key: 'createTime',
    render: createTime => {
      return <span>{moment(createTime).format('YYYY-MM-DD HH:mm')}</span>;
    },
  },
];

function onChange(pagination, filters, sorter) {
  // console.log('params', pagination, filters, sorter);
}

@connect(({ informationCenterModel, loading }) => ({
  informationCenterModel,
  loading,
}))
export default class InformationCenter extends Component {
  state = {
    params: {
      type: '',
      current: 1, // 当前页数
      size: 10, // 每页显示记录条数
    },
  };
  messageList() {
    const { dispatch } = this.props;

    dispatch({
      type: 'informationCenterModel/messageList',
      payload: this.state.params,
    }).then(() => {
      // console.log(this.props.informationCenterModel.messageList);
    });
  }
  componentDidMount() {
    this.messageList();
  }

  onSelectChange = status => {
    let oldParams = Object.assign({}, this.state.params, {
      type: status,
      current: 1,
    });
    this.setState({ params: oldParams }, () => {
      this.messageList();
    });
  };
  // 分页事件
  onPageChange = currPage => {
    let params = Object.assign({}, this.state.params, { current: currPage });
    this.setState(
      {
        params: params,
      },
      () => {
        this.messageList();
      }
    );
  };
  render() {
    const { informationCenterModel } = this.props;
    let { messageList } = informationCenterModel;
    const TabPane = Tabs.TabPane;
    return (
      <PageHeaderLayout>
        <Card title="消息中心">
          <Tabs defaultActiveKey="" onChange={this.onSelectChange}>
            <TabPane tab="全部消息" key="" />
            <TabPane tab="系统消息" key="1" />
            <TabPane tab="招标消息" key="2" />
            <TabPane tab="审批消息" key="3" />
          </Tabs>
          <Table
            bordered
            columns={columns}
            dataSource={messageList.records}
            onChange={onChange}
            pagination={{
              total: messageList.total,
              onChange: value => {
                this.onPageChange(value);
              },
              pageSize: this.state.params.size,
              current: this.state.params.current,
            }}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}
