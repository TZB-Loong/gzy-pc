/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Pagination, Icon, List, Button, Modal, Col, Table, Row, message, Input } from 'antd';
import { Link } from 'dva/router';
import styles from './style.less';
import { url2params, isfalse } from '../../Tools/util_tools';
import Empty from '../Common/Empty';
import { pathRequest } from '../../../configPath';

const ListItem = List.Item;
const { TextArea } = Input;

@connect(({ material, loading, bidContract }) => ({
  material,
  loading,
  bidContract,
}))
export default class QuestionRecords extends Component {
  state = {
    getTender: {}, //详情数据
    params: {
      tenderId: this.props.tenderId,
      tenderType: this.props.tenderType,
    },
    paramsAsk: {
      businessId: this.props.tenderId,
      businessType: this.props.tenderType,
      questionContent: '',
    },
    previewVisible: false,
    isrReqCompleted: true,
    previewImage: '',
    modalVisible: false,
    textSize: 0,
    textValue: '',
    questionRecords:[], //答疑列表
  };
  // 提问
  saveAsk() {
    if (isfalse(this.state.textValue)) {
      message.error('请填写问题');
      return;
    }
    this.state.paramsAsk.questionContent = this.state.textValue;
    const { dispatch } = this.props;
    dispatch({
      type: 'bidContract/saveAsk',
      payload: this.state.paramsAsk,
    }).then(() => {
      const { saveAskStatus } = this.props.bidContract;
      if (saveAskStatus) {
        this.setState({ modalVisible: false });
        message.success('提交成功!');
      }
    });
  }
  // 招标答疑
  questionRecords() {
    const { dispatch } = this.props;
    let that = this;
    dispatch({
      type: 'material/questionRecords',
      payload: this.state.params,
    }).then(()=>{
      let { questionRecords } = this.props.material;
      this.setState({
        questionRecords:questionRecords
      })
    });
  }
  componentDidMount() {
    let that = this;
    this.questionRecords();
  }
  answerPic(answerPic) {
    let imgData = answerPic ? answerPic.split(';') : [];
    // console.log(imgData);
    return imgData.map((item, index) => {
      return (
        <img
          style={{ width: 150, height: 85, padding: 5 }}
          src={item}
          key={index}
          onClick={() => {
            this.handlePreview(item);
          }}
        />
      );
    });
  }
  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
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
    const { previewVisible, previewImage,questionRecords } = this.state;

    return questionRecords ? (
      <Card
        className={styles.mb_30}
        title="招标答疑"
        extra={
          this.props.qualifiedBid ? (
            <Button
              type="primary"
              onClick={() => {
                this.setState({ modalVisible: true });
              }}
            >
              向招标方提问
            </Button>
          ) : null
        }
      >
        {questionRecords && questionRecords.length > 0 ? (
          <div>
            {(questionRecords ? questionRecords : []).map(function(item, index) {
              return (
                <div key={index}>
                  <div
                    style={{ color: '#333757', fontSize: 16, paddingBottom: 10, paddingTop: 10 }}
                  >
                    {item.nickName ? item.nickName : 'Q'}：{item.questionContent}
                  </div>
                  {(item.records ? item.records : []).map(function(items, i) {
                    return (
                      <div key={i}>
                        <div>
                          {items.nickName ? item.nickName : 'A'}：{items.answerContent}
                        </div>
                        <div style={{ paddingTop: 10, paddingLeft: 10 }}>
                          {_this.answerPic(items.answerPic)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <Empty msg="答疑" />
        )}
        <Modal
          title={'请输入问题'}
          centered
          destroyOnClose={true} //关闭时销毁 Modal 里的子元素
          maskClosable={false}
          visible={this.state.modalVisible}
          onOk={() => this.saveAsk()}
          onCancel={() => this.setModalVisible(false)}
          width={600}
        >
          <TextArea
            style={{ minHeight: 32 }}
            placeholder="请输入..."
            rows={8}
            onKeyUp={e => {
              this.setState({ textSize: e.target.value.length });
            }}
            onChange={e => {
              this.setState({ textValue: e.target.value });
            }}
          />
          <div style={{ float: 'right' }}>
            {this.state.textSize}
            /500
          </div>
        </Modal>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </Card>
    ) : null;
  }
}
