/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Card,
  Pagination,
  Icon,
  List,
  Button,
  Modal,
  Col,
  Table,
  Row,
  Input,
  Upload,
  Checkbox,
  message,
  Form,
} from 'antd';
import { Link } from 'dva/router';
import styles from './style.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { url2params, isfalse, bubbleSort } from '../../Tools/util_tools';
import Empty from '../Common/Empty';
import { getCookie } from '../../utils/utils';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';

const ListItem = List.Item;
const { TextArea } = Input;
@Form.create()
@connect(({ bidContract, loading, common }) => ({
  bidContract,
  loading,
  common,
}))
export default class AnswerList extends Component {
  state = {
    totalPages: 0,
    params: {
      current: 1, // 当前页数
      size: 5, // 每页显示记录条数
      tenderId: url2params(this.props.location.search).tenderId
        ? url2params(this.props.location.search).tenderId
        : '',
      tenderType: url2params(this.props.location.search).tenderType
        ? url2params(this.props.location.search).tenderType
        : '',
    },
    fileList: [],
    previewVisible: false,
    previewImage: '',
  };

  // 请求列表数据
  queryTenderQuestionByPage() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidContract/queryTenderQuestionByPage',
      payload: this.state.params,
    }).then(() => {
      const { questionByPage } = this.props.bidContract;
      if (!isfalse(questionByPage)) {
        this.setState({
          totalPages: questionByPage.total ? questionByPage.total : 1,
        });
      }
    });
  }

  componentDidMount() {
    this.queryTenderQuestionByPage();
  }
  answerSubmit(id, fileListId, TextAreaId, isOpenId) {
    const { dispatch } = this.props;
    if (isfalse(this.state[TextAreaId])) {
      message.warn('回复不能为空!');
      return;
    }
    let answerPicAttachIds = '',
      answerPic = '',
      fileData = [],
      fileImgData = [];
    if (this.state[fileListId]) {
      this.state[fileListId].map(item => {
        if (item.status === 'done') {
          fileData.push(item.response.data ? item.response.data.id : '');
          fileImgData.push(item.response.data ? item.response.data.fullFilename : '');
        }
      });
      //
      answerPicAttachIds = fileData.toString();
      answerPic = fileImgData.toString();
    }
    let bodyData = {
      answerForId: id,
      answerContent: this.state[TextAreaId],
      answerPicAttachIds: answerPicAttachIds,
      isOpen: this.state[isOpenId] ? 1 : 0,
      answerPic: answerPic,
    };
    dispatch({
      type: 'bidContract/saveReply',
      payload: bodyData,
    }).then(() => {
      const { saveAnswer } = this.props.bidContract;
      if (saveAnswer) {
        this.queryTenderQuestionByPage();
        this.setState({
          ['questionRecords' + id]: false,
          [TextAreaId]: null,
          [fileListId]: null,
          [isOpenId]: false,
        });
      }
    });
  }

  //   回答问题
  answerQuestion(id) {
    //   图片
    let fileListId = 'fileList' + id;
    // 回复内容
    let TextAreaId = 'TextArea' + id;
    // 是否公开
    let isOpenId = 'isOpen' + id;
    return (
      <div style={{ marginBottom: 30, marginTop: 30, border: '1px solid #E0E0E0', padding: 10 }}>
        <TextArea
          style={{ minHeight: 32, marginBottom: 10 }}
          placeholder=""
          onChange={e => {
            this.setState({ [TextAreaId]: e.target.value });
          }}
          rows={4}
        />
        <div style={{ minHeight: 100 }}>
          <Upload
            {...upLoadInit(
              'file',
              this.state[fileListId],
              'picture-card',
              fileListId,
              true,
              true,
              this,
              '/base/attach/upload'
            )}
            fileList={this.state[fileListId]}
            onChange={e => uploadChange(e, fileListId, this)}
            onPreview={this.handlePreview}
            beforeUpload={e => beforeUpload(e, ['img'], 5)}
          >
            {(this.state[fileListId] ? this.state[fileListId].length : 0) >= 6 ? null : (
              <Icon type="upload" />
            )}
          </Upload>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Checkbox
            onChange={e => {
              this.setState({ [isOpenId]: e.target.checked });
            }}
          >
            在招标页面公开此问题及答复
          </Checkbox>
          <div>
            <Button
              className={styles.btn_b}
              onClick={() => {
                this.answerSubmit(id, fileListId, TextAreaId, isOpenId);
              }}
              type="primary"
            >
              回复
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 显示图片样式
  seeImg(imgFile, index) {
    let _this = this;
    let answerPic = (imgFile ? imgFile : '').split(';');
    return answerPic.map(function(item, i) {
      return (
        <div
          key={i}
          onClick={() => {
            _this.showPreview(item);
          }}
          style={{
            width: 80,
            height: 100,
            overflow: 'hidden',
            float: 'left',
            cursor: 'pointer',
            marginRight: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onMouseOver={() => {
            _this.setState({ ['previewImg' + index + '_' + i]: true });
          }}
          onMouseOut={() => {
            _this.setState({ ['previewImg' + index + '_' + i]: false });
          }}
        >
          <div
            style={{
              display: _this.state['previewImg' + index + '_' + i] ? null : 'none',
              position: 'absolute',
              width: 80,
              height: 100,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              textAlign: 'center',
              lineHeight: '100px',
            }}
          >
            <Icon style={{ color: '#fff', fontSize: 20 }} type="eye-o" theme="outlined" />
          </div>
          <span style={{ display: 'block' }}>
            <img
              style={{ width: '100%', height: '100%' }}
              src={item + '?x-oss-process=image/resize,w_100'}
            />
          </span>
        </div>
      );
    });
  }
  //   答复块
  records(records) {
    let _this = this;
    return records.map(function(item, index) {
      return (
        <div key={index} style={{ marginBottom: 20 }}>
          <div style={{ padding: 10, backgroundColor: '#E6F7FF', marginBottom: 20 }}>
            <span style={{ color: '#999999' }}>
              {moment(item.answerTime).format('MM月DD日 HH:mm')}
            </span>
            <span style={{ color: '#4B85F8', marginLeft: 10 }}>{item.nickName}</span>
          </div>
          <div>{item.answerContent}</div>
          {item.answerPic ? (
            <div style={{ minHeight: 100, marginTop: 20 }}>
              {_this.seeImg(item.answerPic, index)}
            </div>
          ) : null}
        </div>
      );
    });
  }

  //   问题块
  questionRecords(questionRecords) {
    let _this = this;
    return questionRecords.map(function(item, index) {
      return (
        <div
          key={index}
          style={{
            marginBottom: 30,
            borderBottom: '1px solid #E0E0E0',
            display: item.type == 0 ? null : 'none',
          }}
        >
          <Row>
            <Col span={1} style={{ maxWidth: 35 }}>
              <span style={{ fontWeight: 'Bold', fontSize: 20 }}>Q:</span>
            </Col>
            <Col span={23}>
              <div style={{ marginBottom: 30 }}>
                <div>
                  <span>{item.questionContent}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#4B85F8', marginRight: 10 }}>
                      {item.questionNickName}
                      {item.id}
                    </span>
                    <span>{moment(item.questionTime).format('MM月DD日 HH:mm')}</span>
                  </div>
                  <div
                    onClick={() => {
                      _this.edit(item.id);
                      {
                        /*_this.setState({
                        ['questionRecords' + index]: !_this.state['questionRecords' + index],
                      });*/
                      }
                    }}
                  >
                    <Icon type="message" theme="outlined" style={{ marginRight: 5 }} />
                    回复
                  </div>
                </div>
              </div>
              {_this.records(item.records)}
              {_this.state['questionRecords' + item.id] ? _this.answerQuestion(item.id) : null}
            </Col>
          </Row>
        </div>
      );
    });
  }
  edit(id) {
    this.setState({ ['questionRecords' + id]: !this.state['questionRecords' + id] });
  }

  //   项目块
  answerItem(item) {
    return (
      <div>
        <div style={{ border: '1px solid #D5D5D5', padding: 10, fontSize: 16, marginBottom: 30 }}>
          <span style={{ color: '#333757' }}>招:</span>
          <span>{item.tenderTitle}</span>
          <span style={{ color: '#333757', marginLeft: 30 }}>
            项目名称：
            {item.projectName}
          </span>
          <span style={{ color: '#6BBE39', marginLeft: 30 }}>{item.stateText}</span>
        </div>
        {item.questionRecords && item.questionRecords.length > 0 ? (
          this.questionRecords(item.questionRecords)
        ) : (
          <Empty msg="答疑" />
        )}
      </div>
    );
  }

  // 分页事件
  onPageChange = currPage => {
    let params = Object.assign({}, this.state.params, { current: currPage });
    this.setState({ params: params }, () => {
      this.queryTenderQuestionByPage();
    });
  };
  onSizeChange = (current, pageSize) => {
    let params = Object.assign({}, this.state.params, { current: current, size: pageSize });
    this.setState({ params: params }, () => {
      this.queryTenderQuestionByPage();
    });
  };
  // 预览图片
  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  showPreview = url => {
    this.setState({
      previewImage: url,
      previewVisible: true,
    });
  };
  render() {
    let _this = this;
    let { totalPages, previewVisible, previewImage } = this.state;
    let { bidContract, loading } = this.props;
    let { questionByPage } = bidContract;
    const dataSource = [
      {
        projectName: '苏州上东区项目售楼处及样板房精装修工程',
        questionRecords: [
          {
            id: 1,
            records: [{ answerContent: '1' }],
          },
        ],
        tenderType: 0,
        tenderTitle: '大米酒',
      },
    ];

    return (
      <PageHeaderLayout>
        <Card title="招标答疑">
          {/*{dataSource && dataSource.length > 0 ? (*/}
          <List
            dataSource={questionByPage.records}
            pagination={false}
            renderItem={item => this.answerItem(item)}
          />
          {this.state.totalPages > 10 ? (
            <div style={{ margin: '20px 0', textAlign: 'right' }}>
              <Row>
                <Pagination
                  pageSize={this.state.params.size}
                  current={this.state.params.current}
                  onChange={value => this.onPageChange(value)}
                  onShowSizeChange={(current, pageSize) => this.onSizeChange(current, pageSize)}
                  total={37}
                  showQuickJumper
                />
              </Row>
            </div>
          ) : null}
          {/*) : (
          <Empty msg="答疑" />
        )}*/}
          <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </Card>
      </PageHeaderLayout>
    );
  }
}
