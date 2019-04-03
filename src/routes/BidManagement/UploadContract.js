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
  Spin,
  Col,
  Table,
  Row,
  Breadcrumb,
  Radio,
  InputNumber,
  Upload,
  Input,
  message,
  Form,
} from 'antd';
import { Link } from 'dva/router';
import styles from './style.less';
import { url2params, isfalse } from '../../Tools/util_tools';
import FileView from '../Common/FileView';
import Empty from '../Common/Empty';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getCookie } from '../../utils/utils';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';
import { pathPurchase } from '../../../configPath';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const ListItem = List.Item;
const FormItem = Form.Item;

@Form.create()
@connect(({ bidContract, loading, common }) => ({
  bidContract,
  //   loading: loading.effects['labour/getLabourTender'],
  common,
}))
export default class LabourView extends Component {
  state = {
    previewVisible: false,
    previewImage: '',
    contractImg: [],
    tenderType: url2params(this.props.location.search).tenderType
      ? url2params(this.props.location.search).tenderType
      : '', // 1材料 2/ 劳务
    type: url2params(this.props.location.search).type
      ? url2params(this.props.location.search).type
      : 'view', // edit编辑  view查看
    params: {
      tenderId: url2params(this.props.location.search).tenderId
        ? url2params(this.props.location.search).tenderId
        : '',
      tenderType: url2params(this.props.location.search).tenderType
        ? url2params(this.props.location.search).tenderType
        : '',
    },
    contractList: [
      {
        agreementWinbidName: null,
        tenderId: null,
        bidId: null,
        sumMoney: null,
        pictureFile: null,
        pictureSignFile: null,
      },
    ],
    columns: [
      {
        title: '中标单位名称',
        dataIndex: 'bidAuthbusinessName',
        key: 'bidAuthbusinessName',
        render: (text, record, index) => {
          return this.state.type == 'edit' ? (
            <span>
              {this.state.tenderType == '1' ? record.bidAuthbusinessName : record.bidCompanyName}
            </span>
          ) : (
            <span>{record.agreementWinbidName}</span>
          );
        },
      },
      {
        title: '中标金额（元）',
        dataIndex: '',
        key: '',
        render: (text, record, index) => {
          let oldObj = this.state.contractList;
          oldObj[index] = oldObj[index] ? oldObj[index] : {};
          oldObj[index].tenderId =
            this.state.tenderType == '1' ? record.materialTenderId : record.labourTenderId;
          oldObj[index].bidId =
            this.state.tenderType == '1' ? record.materialBidId : record.labourBidId;
          oldObj[index].agreementWinbidName =
            this.state.tenderType == '1' ? record.bidAuthbusinessName : record.bidCompanyName;
          oldObj[index].aUserId =
            this.state.tenderType == '1' ? record.bidAuthbusinessId : record.bidCompanyId;
          return this.state.type == 'edit' ? (
            <Form>
              <FormItem>
                {this.props.form.getFieldDecorator('sumMoney' + index, {
                  rules: [
                    {
                      pattern: /^(\d{0,8})(\d{0,8}\.\d{1,2})?$/,
                      message: '请输入亿位以下数字金额',
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    //max={99999999.99}
                    step={0.01}
                    precision={2}
                    onChange={value => {
                      if (value) {
                        this.setState({
                          ['sumMoney' + index]: false,
                        });
                      }
                      oldObj[index].sumMoney = value;
                      this.setState({
                        contractList: oldObj,
                      });
                    }}
                  />
                )}
              </FormItem>
              {this.state['sumMoney' + index] ? (
                <div style={{ color: 'red' }}>请输入中标金额!</div>
              ) : null}
            </Form>
          ) : (
            <span>{record.sumMoney}</span>
          );
        },
      },
      {
        title: '合同金额页',
        dataIndex: '',
        key: '',
        render: (text, record, index) => {
          let oldObj = this.state.contractList;
          oldObj[index] = oldObj[index] ? oldObj[index] : {};
          oldObj[index].tenderId =
            this.state.tenderType == '1' ? record.materialTenderId : record.labourTenderId;
          oldObj[index].bidId =
            this.state.tenderType == '1' ? record.materialBidId : record.labourBidId;
          oldObj[index].agreementWinbidName =
            this.state.tenderType == '1' ? record.bidAuthbusinessName : record.bidCompanyName;
          oldObj[index].aUserId =
            this.state.tenderType == '1' ? record.bidAuthbusinessId : record.bidCompanyId;
          return this.state.type == 'edit' ? (
            <div>
              <PicturesTable that={this} index={index} img={'pictureFile'} />
              {this.state['pictureFile' + index] ? (
                <div style={{ color: 'red' }}>合同金额页不能为空!</div>
              ) : null}
            </div>
          ) : (
            <div>{this.seeImg(record.pictureFile, 'p_File' + index)}</div>
          );
        },
      },
      {
        title: '合同签章页',
        dataIndex: '',
        key: '',
        render: (text, record, index) => {
          let oldObj = this.state.contractList;
          oldObj[index] = oldObj[index] ? oldObj[index] : {};
          oldObj[index].tenderId =
            this.state.tenderType == '1' ? record.materialTenderId : record.labourTenderId;
          oldObj[index].bidId =
            this.state.tenderType == '1' ? record.materialBidId : record.labourBidId;
          oldObj[index].agreementWinbidName =
            this.state.tenderType == '1' ? record.bidAuthbusinessName : record.bidCompanyName;
          oldObj[index].aUserId =
            this.state.tenderType == '1' ? record.bidAuthbusinessId : record.bidCompanyId;
          return this.state.type == 'edit' ? (
            <div>
              <PicturesTable that={this} index={index} img={'pictureSignFile'} />
              {this.state['pictureSignFile' + index] ? (
                <div style={{ color: 'red' }}>合同签章页不能为空!</div>
              ) : null}
            </div>
          ) : (
            <div>{this.seeImg(record.pictureSignFile, 'p_SignFile' + index)}</div>
          );
        },
      },
    ],
    BidList: [],
  };

  // 显示图片样式
  seeImg(seeImg, index) {
    return (
      <div
        onClick={() => {
          this.handlePreview(seeImg);
        }}
        style={{
          width: 80,
          height: 100,
          overflow: 'hidden',
          float: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onMouseOver={() => {
          this.setState({ ['previewImg' + index]: true });
        }}
        onMouseOut={() => {
          this.setState({ ['previewImg' + index]: false });
        }}
      >
        <div
          style={{
            display: this.state['previewImg' + index] ? null : 'none',
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
            src={seeImg + '?x-oss-process=image/resize,w_100'}
          />
        </span>
      </div>
    );
  }

  //上传合同列表
  getBidList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidContract/getBidList',
      payload: this.state.params,
    }).then(() => {
      let { BidList } = this.props.bidContract;
      console.log(BidList);

      this.setState({
        BidList: BidList ? BidList : [],
      });
    });
  }
  //合同列表
  getAgreements() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidContract/getAgreements',
      payload: this.state.params,
    }).then(() => {
      let { Agreements } = this.props.bidContract;
      console.log(Agreements);

      this.setState({
        BidList: Agreements ? Agreements : [],
      });
    });
  }
  componentDidMount() {
    if (this.state.type == 'edit') {
      this.getBidList();
    } else {
      this.getAgreements();
    }
  }

  // 上传合同
  batchUploadAgreement() {
    const { dispatch } = this.props;
    let agreements = this.state.contractList;

    console.log(agreements);
    for (var i in agreements) {
      let reg = /^(\d{0,8})(\d{0,8}\.\d{1,2})?$/;
      if (isfalse(agreements[i].sumMoney)) {
        console.log('sumMoney' + i);
        this.setState({ ['sumMoney' + i]: true });
        message.error('中标金额不能为空!');
        return;
      } else if (isfalse(reg.test(agreements[i].sumMoney))) {
        //this.setState({ ['sumMoney' + i]: true });
        message.error('请输入亿位以下数字金额!');
        return;
      } else {
        this.setState({ ['sumMoney' + i]: false });
      }
      if (isfalse(agreements[i].pictureFile)) {
        this.setState({ ['pictureFile' + i]: true });
        message.error('合同金额页不能为空!');
        return;
      } else {
        this.setState({ ['pictureFile' + i]: false });
      }
      if (isfalse(agreements[i].pictureSignFile)) {
        this.setState({ ['pictureSignFile' + i]: true });
        message.error('合同签章页不能为空!');
        return;
      } else {
        this.setState({ ['pictureSignFile' + i]: false });
      }
    }

    let bodyData = {
      tenderType: this.state.tenderType,
      agreements: agreements,
    };
    dispatch({
      type: 'bidContract/batchUploadAgreement',
      payload: bodyData,
    }).then(() => {
      let { saveStatus } = this.props.bidContract;
      console.log(saveStatus);

      if (saveStatus) {
        message.success('上传成功');
        this.setState(
          {
            type: 'view',
          },
          () => {
            this.getAgreements();
          }
        );
      }
    });
  }
  // 预览图片
  handlePreview = url => {
    this.setState({
      previewImage: url,
      previewVisible: true,
    });
  };
  handleCancel = () => this.setState({ previewVisible: false });

  render() {
    let _this = this;
    let { previewVisible, previewImage, contractImg, BidList } = this.state;

    return (
      <PageHeaderLayout>
        <div className={styles.MaterialView}>
          <Card title={<span>上传合同</span>}>
            <Table
              className={styles.UploadContract}
              dataSource={BidList}
              columns={this.state.columns}
              pagination={false}
              rowKey={(record, i) => i}
            />
            <div
              style={{
                marginTop: 20,
                textAlign: 'center',
                display: this.state.type == 'edit' ? null : 'none',
              }}
            >
              <Button
                className={styles.btn_b}
                type="primary"
                onClick={() => {
                  this.batchUploadAgreement();
                }}
              >
                确认上传
              </Button>
            </div>
            {/*<PicturesTable that={this} index="0" img={'pictureFile'} />*/}
          </Card>
        </div>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </PageHeaderLayout>
    );
  }
}

// 图片上传
class PicturesTable extends React.Component {
  state = {
    previewVisible: false,
    previewImage: '',
    fileList: [],
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };
  backData() {}
  handleChange = ({ fileList }) => {
    let { that } = this.props;
    this.setState({ fileList });
    let fileData = '';
    console.log(fileList);
    if (fileList) {
      fileList.map(item => {
        if (item.status === 'done') {
          fileData = item.response.data ? item.response.data.id : '';
        }
      });
    }

    let newcontractList = that.state.contractList;
    let index = this.props.index;
    let img = this.props.img;
    console.log(img);
    if (img == 'pictureFile') {
      newcontractList[index].pictureFile = fileData;
    }
    if (img == 'pictureSignFile') {
      newcontractList[index].pictureSignFile = fileData;
    }
    that.setState({ contractList: newcontractList });
    console.log(this.props);
  };

  render() {
    let that = this.props.that;
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div className="clearfix">
        <Upload
          uid="-1"
          action={pathPurchase + '/base/attach/upload'}
          name="file"
          headers={{ 'X-Requested-With': 'XMLHttpRequest', 'gzy-token': getCookie() }}
          listType="picture-card"
          multiple={true}
          showUploadList={true}
          defaultFileList={this.state.fileList}
          onRemove={file => {
            {
              /*图片删除*/
            }
            console.log(file, 'file');
            console.log(this.state.fileList);
            let fileUid = file.uid;
            if (file.response && file.status == 'removed') {
              fileUid = file.response.data.id;
            }
            console.log(fileUid);
            that.props
              .dispatch({
                type: 'common/deleteAttachList',
                payload: {
                  id: fileUid,
                },
              })
              .then(() => {
                console.log(this.state.fileList);
              });
          }}
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          accept="image/gif,image/jpeg,image/jpg,image/png,image/svg,image/tif"
        >
          {fileList.length >= 1 ? null : <Icon type="upload" />}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}
