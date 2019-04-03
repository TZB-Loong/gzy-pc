/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { Link } from 'dva/router';
import { connect } from 'dva';
import { Card, Icon, Tabs, Table, Radio, List } from 'antd';
import StaffChange from '../Common/StaffChange'; //选人组件
import moment from 'moment';

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
    let _this = this;
    dispatch({
      type: 'informationCenterModel/messageList',
      payload: this.state.params,
    }).then(() => {
      let { messageList } = this.props.informationCenterModel;
      if (messageList && messageList.records) {
        messageList.records.map((item, index) => {
          if (item.messageStatus != 1) {
            _this.props.countStatus();
            return;
          } else {
            _this.props.countStatusFalse();
          }
        });
      }
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
  render() {
    const { informationCenterModel } = this.props;
    let { messageList } = informationCenterModel;
    const TabPane = Tabs.TabPane;
    return (
      <div>
        <Tabs defaultActiveKey="1" onChange={this.onSelectChange}>
          <TabPane tab="系统消息" key="1" />
          <TabPane tab="招标消息" key="2" />
          <TabPane tab="审批消息" key="3" />
        </Tabs>
        <List
          style={{ maxHeight: 300, overflowY: 'scroll', paddingBottom: 10 }}
          itemLayout="horizontal"
          dataSource={
            messageList.records && messageList.records.length > 0 ? messageList.records : []
          }
          renderItem={item => (
            <List.Item style={{}}>
              <div style={{ padding: '0px 15px', width: '100%' }}>
                <Link
                  style={{ color: item.messageStatus == 1 ? '#999' : '' }}
                  to={
                    '/InformationView?messageId=' +
                    item.messageId +
                    '&messageStatus=' +
                    item.messageStatus
                  }
                >
                  {item.title}
                  <div>
                    <span style={{ color: item.messageStatus == 1 ? '#999' : '' }}>
                      {moment(item.createTime).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                </Link>
              </div>
            </List.Item>
          )}
        />
        {messageList.records && messageList.records.length > 9 ? (
          <a
            style={{
              display: 'inline-block',
              width: '100%',
              textAlign: 'right',
              paddingBottom: 5,
              paddingRight: 20,
            }}
            href={'#/informationCenter'}
          >
            更多>>
          </a>
        ) : null}
      </div>
    );
  }
}
