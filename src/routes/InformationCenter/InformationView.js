/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, Tabs, Table, Radio } from 'antd';
import StaffChange from '../Common/StaffChange'; //选人组件
import moment from 'moment';
import { url2params } from '../../Tools/util_tools';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

@connect(({ informationCenterModel }) => ({
  informationCenterModel,
}))
export default class InformationView extends Component {
  state = {
    params: {
      messageId: url2params(this.props.location.search).messageId,
      messageStatus: url2params(this.props.location.search).messageStatus,
    },
  };
  messageDetails() {
    const { dispatch } = this.props;

    dispatch({
      type: 'informationCenterModel/messageDetails',
      payload: this.state.params,
    });
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log(this.state.params.messageId);
    console.log(url2params(nextProps.location.search).messageId);
    if (url2params(nextProps.location.search).messageId != this.state.params.messageId) {
      this.setState({
        params: {
          messageId: url2params(this.props.location.search).messageId,
          messageStatus: url2params(this.props.location.search).messageStatus,
        },
      });
      this.messageDetails();
    }
  }
  componentDidMount() {
    this.messageDetails();
  }

  render() {
    const { informationCenterModel } = this.props;
    let { messageDetails } = informationCenterModel;
    return (
      <PageHeaderLayout>
        <Card title="消息详情">
          <div style={{ width: '80%', marginLeft: '10%', textAlign: 'center', paddingBottom: 100 }}>
            <div style={{ color: '#333757', fontSize: 18, marginBottom: 10 }}>
              {messageDetails.title}
            </div>
            <div style={{ color: '#333757', marginBottom: 50 }}>
              {moment(messageDetails.createTime).format('YYYY-MM-DD HH:mm')}
            </div>
            <div style={{ textAlign: 'left' }}>
              <span dangerouslySetInnerHTML={{ __html: messageDetails.content }} />
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
