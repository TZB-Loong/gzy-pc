/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Pagination, Icon, List, Button, Modal, Col, Table, Row } from 'antd';
import { Link } from 'dva/router';
import styles from './style.less';
import { url2params, isfalse } from '../../Tools/util_tools';
import Empty from '../Common/Empty';
import { getCookie } from '../../utils/utils';

const ListItem = List.Item;

@connect(({ material, loading }) => ({
  material,
  loading,
}))
export default class ModifyLog extends Component {
  state = {
    isLogin: !isfalse(getCookie()), // 是否登录
    getTender: {}, //详情数据
    previewVisible: false,
    previewImage: '',
    params: {
      tenderId: this.props.tenderId,
      type: this.props.type,
    },
  };

  // 招标变更
  getChangeList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'material/getChangeList',
      payload: this.state.params,
    }).then(() => {
      console.log(4);
    });
  }
  componentDidMount() {
    this.getChangeList();
  }

  modifyList(content) {
    let theData = [];
    theData = eval('(' + content + ')') ? eval('(' + content + ')') : [];
    return theData.map((item, i) => {
      return (
        <Row
          style={{
            borderLeft: '1px solid #e8e8e8',
            borderBottom: i + 1 < theData.length ? '1px solid #e8e8e8' : '',
            display: 'flex',
            alignItems: 'center',
          }}
          key={i}
        >
          <Col style={{ padding: 16 }} span={8}>
            {item.field}
          </Col>
          <Col style={{ padding: 16 }} span={8}>
            {item.type == 'img' ? (
              <img
                src={item.before}
                style={{ width: 50 }}
                onClick={() => {
                  this.handlePreview(item.before);
                }}
              />
            ) : item.type == 'file' ? (
              <a href={item.before}>{item.field}</a>
            ) : (
              <span style={{ wordBreak: 'break-all' }}>{item.before}</span>
            )}
          </Col>
          <Col style={{ padding: 16 }} span={8}>
            {item.type == 'img' ? (
              <img
                src={item.after}
                style={{ width: 50 }}
                onClick={() => {
                  this.handlePreview(item.after);
                }}
              />
            ) : item.type == 'file' ? (
              <a href={item.after}>{item.field}</a>
            ) : (
              <span style={{ wordBreak: 'break-all' }}>{item.after}</span>
            )}
          </Col>
        </Row>
      );
    });
  }
  handlePreview = url => {
    this.setState({
      previewImage: url,
      previewVisible: true,
    });
  };
  handleCancel = () => this.setState({ previewVisible: false });

  render() {
    let _this = this;
    let { getTender, isLogin, previewVisible, previewImage } = this.state;
    let { getChangeList } = this.props.material;

    return (
      <div>
        {getChangeList && getChangeList.length > 0 ? (
          <Card className={styles.mb_15} title="变更记录">
            <div style={{ width: '100%' }}>
              <Row style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
                <Col style={{ padding: 16 }} span={6}>
                  变更时间
                </Col>
                <Col style={{ padding: 16 }} span={6}>
                  变更记录
                </Col>
                <Col style={{ padding: 16 }} span={6}>
                  变更前
                </Col>
                <Col style={{ padding: 16 }} span={6}>
                  变更后
                </Col>
              </Row>
              <div>
                {(getChangeList ? getChangeList : []).map(function(item, index) {
                  return (
                    <Row
                      style={{
                        width: '100%',
                        borderBottom: '1px solid #e8e8e8',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      key={index}
                    >
                      <Col style={{ padding: 16 }} span={6}>
                        {moment(item.changeTime).format('YYYY-MM-DD HH:mm:ss')}
                      </Col>
                      <Col span={18}>{_this.modifyList(item.content)}</Col>
                    </Row>
                  );
                })}
              </div>
            </div>
          </Card>
        ) : null}
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}
