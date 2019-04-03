/*eslint-disable*/
import moment from 'moment';
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Table,
  Spin,
  Pagination,
  Icon,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Modal,
  Form,
  Select,
  Upload,
  DatePicker,
  Cascader,
  message,
  LocaleProvider,
} from 'antd';
import styles from './style.less';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';
import { isfalse, url2params } from '../../Tools/util_tools';
import cnCity from '../../utils/area.json';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

@Form.create()
@connect(({ myProjectModel, loading, common, Inquiry }) => ({
  myProjectModel,
  loading,
  common,
  Inquiry,
}))
export default class AddProject extends Component {
  state = {
    modalVisible: false,
    previewVisible: false,
    previewImage: '',
    fileList: [],
    fileimg: [],
    Agreement: false, // 是否显示承包协议书,false显示
    auditState: 0,
    projectId: url2params(this.props.location.search).id,
    CompanyName: '',
    startValue: null,
    endValue: null,
    endOpen: false,
    remarkSize: 0,
    dictionaryByParentId: [],
    btnStatus: false, //按钮点击状态
  };

  cnCityData = () => {
    //项目选择地址数据
    let cnCityData = [];
    cnCity.map((item, index) => {
      let subD = [];
      cnCityData.push({
        code: item.code,
        name: item.name,
      });
      item.sub.map(subData => {
        subD.push({
          name: subData.name,
          code: subData.code,
        });
      });
      cnCityData[index].sub = subD;
    });
    return cnCityData;
  };

  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }
  componentWillMount() {
    const { dispatch } = this.props;
    // // 获取单位名称
    // dispatch({
    //   type: 'myProjectModel/getCompanyName',
    // });
    // this.setState({
    //   CompanyName: this.props.myProjectModel.CompanyName
    //     ? this.props.myProjectModel.CompanyName.data
    //     : '',
    // });
  }

  // 工程类型
  getDictionaryByParentId() {
    const { dispatch } = this.props;
    dispatch({
      type: 'Inquiry/getDictionaryByParentId',
      payload: { parentId: 4 },
    }).then(() => {
      const { Inquiry } = this.props;
      if (!isfalse(Inquiry.dictionaryByParentId)) {
        let dictionaryByParentId = Inquiry.dictionaryByParentId;
        this.setState({ dictionaryByParentId: dictionaryByParentId });
      }
    });
  }
  componentDidMount() {
    this.getDictionaryByParentId();
    // 编辑请求数据
    const { dispatch } = this.props;
    if (!isfalse(this.state.projectId)) {
      this.setState({ auditState: 3 });
      dispatch({
        type: 'myProjectModel/details',
        payload: { projectId: this.state.projectId },
      }).then(() => {
        let { projectDetails } = this.props.myProjectModel;
        this.setState({
          remarkSize:
            projectDetails && projectDetails.data && projectDetails.data.remark
              ? projectDetails.data.remark.length
              : 0,
        });
      });

      // 编辑时默认附件
      dispatch({
        type: 'common/queryAttachList',
        payload: {
          bizCode: 'PROJECT_GROUP',
          bizId: url2params(this.props.location.search).id,
        },
      }).then(() => {
        let fileList = [],
          otherfileList = [];
        (this.props.common.filesPath.data
          ? this.props.common.filesPath.data.attachmentVOList
          : []
        ).map((item, i) => {
          if (item.ctrlName == 'ATTACH_PROJECT_BID') {
            fileList.push({
              name: item.originalFilename,
              url: item.fullFilename + '?x-oss-process=image/resize,w_90',
              uid: item.id,
            });
          } else if (item.ctrlName == 'ATTACH_PROJECT_CONTRACT') {
            otherfileList.push({
              uid: item.id,
              name: item.originalFilename,
              url: item.fullFilename + '?x-oss-process=image/resize,w_90',
            });
          }
        });
        this.setState({
          fileList: fileList,
          fileimg: otherfileList,
        });
      });
    }
  }

  componentWillUnmount() {}

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      // console.log(values);
      if (!err) {
        if (this.state.fileList.length == 0 && this.state.auditState == 3) {
          message.error('请上传中标通知书/施工合同/开工令/承包协议书');
          return;
        }
        let fileData = [],
          fileDataId = [];
        if (values.projectContractFiles) {
          values.projectContractFiles.fileList.map(item => {
            if (item.status === 'done') {
              fileData.push(item.response.data ? item.response.data.fullFilename : '');
              fileDataId.push(item.response.data ? item.response.data.id : '');
            }
            if (item.url) {
              fileData.push(item.url ? item.url : '');
              fileDataId.push(item.uid ? item.uid : '');
            }
          });
          //中标通知书
          values.projectContractFiles = fileData.toString();
          // 中标通知书AttachIds
          values.projectContractFilesAttachIds = fileDataId.toString();
        }
        // if (values.contractAgreeFiles) {
        //   let imgData = [],
        //     imgDataId = [];
        //   values.contractAgreeFiles.fileList.map(item => {
        //     if (item.status === 'done') {
        //       imgData.push(item.response.data ? item.response.data.fullFilename : '');
        //       imgDataId.push(item.response.data ? item.response.data.id : '');
        //     }
        //   });
        //   // 承包协议书
        //   values.contractAgreeFiles = imgData.toString();
        //   // 承包协议书AttachIds
        //   values.contractAgreeFilesAttachIds = imgDataId.toString();
        // }
        //地址转换
        if (values.province) {
          values.city = values.province[1];
          values.province = values.province[0];
        }

        if (values.validDateStart) {
          values.validDateEnd = moment(values.validDateStart[1]).format('YYYY-MM-DD');
          values.validDateStart = moment(values.validDateStart[0]).format('YYYY-MM-DD');
        }
        // // 项目工期开始时间
        // values.validDateStart = moment(values.validDateStart).format('YYYY-MM-DD');
        // // 项目工期结束时间
        // values.validDateEnd = moment(values.validDateEnd).format('YYYY-MM-DD');
        // 项目id(编辑才有值)
        if (this.state.projectId) {
          values.id = this.state.projectId;
        }
        // 提交状态
        values.auditState = this.state.auditState;
        values.remark = values.remark
          ? values.remark.replace(/\r{0,}\n/g, '<br/>').replace(/\s/g, '&nbsp;')
          : null;
        const { dispatch } = this.props;
        this.setState({ btnStatus: true });
        dispatch({
          type: 'myProjectModel/addProject',
          payload: values,
          callback: () => {
            if (this.props.myProjectModel.saveProject.status == '200') {
              this.setState({ btnStatus: false });
              if (this.state.projectId && this.state.auditState != 3) {
                message.success('保存成功');
              } else if (this.state.projectId && this.state.auditState == 3) {
                message.success('提交成功');
              } else {
                message.success('创建成功');
              }
              this.props.history.replace('/projectManagement');
            } else {
              this.setState({ btnStatus: false });
              // message.error(this.props.myProjectModel.saveProject.msg);
            }
          },
        });
      }
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    let imgSrc = file.url;
    if (imgSrc && imgSrc.indexOf('?') > -1) {
      imgSrc = file.url.split('?')[0];
    }
    this.setState({
      previewImage: imgSrc || file.thumbUrl,
      previewVisible: true,
    });
  };

  onChange(value) {
    // console.log(value);
  }

  titleText() {
    return (
      <div style={{ display: 'flex' }}>
        <b style={{ width: 100 }}>项目信息</b>
        <div style={{ fontSize: 14, color: '#EE7356' }}>
          {/*<span style={{ color: 'red' }}>*</span>{' '}*/}
          注：如该项目需进行对外招标采购，为确保项目的真实性，项目需提供中标通知书并申请平台审核。
        </div>
      </div>
    );
  }
  // // 中标单位名称一致性校验
  // compareBidCompany = (rule, value, callback) => {
  //   const form = this.props.form;
  //   this.setState({
  //     Agreement:
  //       value &&
  //       value ==
  //         (this.props.myProjectModel.CompanyName ? this.props.myProjectModel.CompanyName.data : ''),
  //   });

  //   callback();
  // };
  // 工期选择相关
  disabledStartDate = startValue => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = endValue => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = value => {
    this.onChange('startValue', value);
  };

  onEndChange = value => {
    this.onChange('endValue', value);
  };
  handleStartOpenChange = open => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = open => {
    this.setState({ endOpen: open });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { previewVisible, previewImage, fileList, fileimg } = this.state;
    var { myProjectModel } = this.props;
    var { projectDetails } = myProjectModel;

    const formItemLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
      },
    };
    const fileLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 12, offset: 6 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 12, offset: 6 },
      },
    };

    return (
      <LocaleProvider locale={zh_CN}>
        <PageHeaderLayout>
          <Card title={this.titleText()}>
            <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
              <FormItem {...formItemLayout} label="项目名称：">
                {getFieldDecorator('projectName', {
                  rules: [
                    {
                      required: true,
                      message: '请输入项目名称',
                    },
                    {
                      max: 100,
                      message: '最多输入100个字符',
                    },
                  ],
                  initialValue:
                    projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                      ? projectDetails.data.projectName
                      : '',
                })(<Input placeholder="请输入项目名称" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="项目地址：">
                {getFieldDecorator('province', {
                  rules: [
                    {
                      required: true,
                      message: '请选择项目地址',
                    },
                  ],
                  initialValue:
                    projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                      ? [projectDetails.data.province, projectDetails.data.city]
                      : [],
                })(
                  <Cascader
                    fieldNames={{ label: 'name', value: 'code', children: 'sub' }}
                    options={this.cnCityData()}
                    onChange={this.onChange}
                    placeholder="请选择项目地址"
                  />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="工程类型：">
                {getFieldDecorator('projectClass', {
                  rules: [
                    {
                      required: true,
                      message: '请选择工程类型',
                    },
                  ],
                  initialValue:
                    projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                      ? projectDetails.data.projectClass
                      : undefined,
                })(
                  <Select placeholder="请选择工程类型">
                    {this.state.dictionaryByParentId.map(function(item, index) {
                      return (
                        <Option key={index} value={item.dictionaryId}>
                          {item.dictionaryName}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
              {/*<FormItem
            label={
              <span>
                <span style={{ color: 'red', marginRight: 4, fontFamily: 'SimSun' }}>*</span>
                项目工期
              </span>
            }
            {...formItemLayout}
          >
            <Col span={11}>
              <FormItem>
                {getFieldDecorator('validDateStart', {
                  rules: [
                    {
                      required: true,
                      message: '请选择项目开始工期',
                    },
                  ],
                  initialValue:
                    projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                      ? moment(projectDetails.data.validDateStart, 'YYYY-MM-DD')
                      : null,
                })(
                  <DatePicker
                    disabledDate={this.disabledStartDate}
                    onChange={this.onStartChange}
                    onOpenChange={this.handleStartOpenChange}
                    placeholder="请选择开始工期"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={2}>
              <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                至
              </span>
            </Col>
            <Col span={11} style={{ display: 'inline-block' }}>
              <FormItem>
                {getFieldDecorator('validDateEnd', {
                  rules: [
                    {
                      required: true,
                      message: '请选择项目结束工期',
                    },
                  ],
                  initialValue:
                    projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                      ? moment(projectDetails.data.validDateEnd, 'YYYY-MM-DD')
                      : null,
                })(
                  <DatePicker
                    disabledDate={this.disabledEndDate}
                    onChange={this.onStartChange}
                    open={this.state.endOpen}
                    onOpenChange={this.handleEndOpenChange}
                    placeholder="请选择结束工期"
                  />
                )}
              </FormItem>
            </Col>
          </FormItem>*/}
              <FormItem {...formItemLayout} label="项目工期">
                {getFieldDecorator('validDateStart', {
                  rules: [
                    {
                      required: true,
                      message: '请选择项目工期',
                    },
                  ],
                  initialValue:
                    projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                      ? [
                          moment(projectDetails.data.validDateStart, 'YYYY-MM-DD'),
                          moment(projectDetails.data.validDateEnd, 'YYYY-MM-DD'),
                        ]
                      : [],
                })(
                  <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="项目中标单位：">
                {getFieldDecorator('bidCompany', {
                  rules: [
                    {
                      required: true,
                      message: '请输入项目中标单位',
                    },
                    {
                      max: 100,
                      message: '最多输入100个字',
                    },
                    {
                      /*{
                  validator: this.compareBidCompany,
                },*/
                    },
                  ],
                  initialValue:
                    projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                      ? projectDetails.data.bidCompany
                      : '',
                })(<Input placeholder="请输入项目中标单位" />)}
              </FormItem>
              <Row>
                <Col span={6}>
                  <div
                    style={{
                      color: '#111',
                      lineHeight: '40px',
                      whiteSpace: 'nowrap',
                      textAlign: 'right',
                    }}
                  >
                    中标通知书/施工合同/开工令/承包协议书：
                  </div>
                </Col>
              </Row>
              <FormItem
                {...fileLayout}
                extra={
                  <div style={{ fontSize: 13, lineHeight: '16px' }}>
                    <Icon style={{ color: 'red', marginRight: 10 }} type="exclamation-circle" />
                    注：仅支持jpg、jpeg、gif、png、pdf格式，此消息仅作为公装云平台确认招标项目真实性审核的依据，不会对其他任何用户公开
                  </div>
                }
              >
                {getFieldDecorator('projectContractFiles', {
                  rules: [],
                  initialValue: this.state.fileList ? { fileList: this.state.fileList } : null,
                })(
                  <Upload
                    {...upLoadInit(
                      'file',
                      this.state.fileList,
                      'picture-card',
                      'fileList',
                      true,
                      true,
                      this,
                      '/base/attach/upload',
                      projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                        ? projectDetails.data.id
                        : null
                    )}
                    fileList={this.state.fileList}
                    onChange={e => uploadChange(e, 'fileList', this, false)}
                    onPreview={this.handlePreview}
                    beforeUpload={e => beforeUpload(e, ['img'], 5)}
                  >
                    {fileList.length >= 6 ? null : <Icon type="upload" />}
                  </Upload>
                )}
              </FormItem>
              <FormItem {...submitFormLayout}>
                {this.state.auditState == 3 ? (
                  fileList.length > 0 ? null : (
                    <div style={{ color: 'red' }}>
                      请上传承中标通知书/施工合同/开工令/承包协议书
                    </div>
                  )
                ) : null}
              </FormItem>
              {/*{this.state.auditState == 3 ? (
            this.state.Agreement ? null : (
              <FormItem {...formItemLayout} label="承包协议书/管理责任书：">
                {getFieldDecorator('contractAgreeFiles', {
                  rules: [
                    {
                      required: true,
                      message: '请上传承包协议书/管理责任书',
                    },
                  ],
                })(
                  <Upload
                    {...upLoadInit(
                      'file',
                      this.state.fileimg,
                      'picture-card',
                      'fileimg',
                      true,
                      true,
                      this,
                      '/base/attach/upload',
                      projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                        ? projectDetails.data.id
                        : null
                    )}
                    fileList={this.state.fileimg}
                    beforeUpload={e => beforeUpload(e, ['img'], 5)}
                    onChange={e => uploadChange(e, 'fileimg', this, false)}
                    onPreview={this.handlePreview}
                  >
                    {this.state.fileimg.length >= 6 ? null : <Icon type="upload" />}
                  </Upload>
                )}
              </FormItem>
            )
          ) : null}
          {this.state.auditState == 3 ? (
            this.state.Agreement ? null : (
              <FormItem {...submitFormLayout}>
                <div style={{ fontSize: 13, lineHeight: '16px' }}>
                  <Icon style={{ color: 'red', marginRight: 10 }} type="exclamation-circle" />
                  注：仅支持jpg、jpeg、gif、png、pdf格式，此消息仅作为公装云平台确认招标项目真实性审核的依据，不会对其他任何用户公开
                </div>
              </FormItem>
            )
          ) : null}*/}
              <FormItem {...formItemLayout} label="备注：">
                {getFieldDecorator('remark', {
                  rules: [
                    {
                      max: 500,
                      message: '最多输入500个字',
                    },
                  ],
                  initialValue:
                    projectDetails && projectDetails.data && !isfalse(this.state.projectId)
                      ? projectDetails.data.remark
                        ? projectDetails.data.remark
                            .replace(/<br\/>/g, '\n')
                            .replace(/\&nbsp\;/g, ' ')
                        : null
                      : '',
                })(
                  <TextArea
                    style={{ minHeight: 32 }}
                    placeholder=""
                    rows={4}
                    onKeyUp={e => {
                      this.setState({ remarkSize: e.target.value.length });
                    }}
                  />
                )}
                <div style={{ float: 'right', marginTop: 0 }}>
                  {this.state.remarkSize}
                  /500
                </div>
              </FormItem>
              <FormItem style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => {
                    this.setState({ auditState: 0 });
                  }}
                  disabled={this.state.btnStatus ? true : false}
                >
                  {projectDetails && !isfalse(this.state.projectId) ? '保存项目' : '创建项目'}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginLeft: '10%' }}
                  onClick={() => {
                    this.setState({ auditState: 3 });
                  }}
                  disabled={this.state.btnStatus ? true : false}
                >
                  申请审核项目
                </Button>
              </FormItem>
            </Form>
            <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
              <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </Card>
        </PageHeaderLayout>
      </LocaleProvider>
    );
  }
}
