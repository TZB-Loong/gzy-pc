/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Select,
  Input,
  Icon,
  Upload,
  Modal,
  Button,
  InputNumber,
  Row,
  Col,
} from 'antd';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';
import styles from './style.less';
import { DatePicker, message } from 'antd/lib/index';
import ProjectSelection from '../BidManagement/ProjectSelection';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FlowStep from '../Common/flowStep';

import { getUrlParamBySearch } from '../../utils/utils';
// import ProjectSelection from '../BidManagement/ProjectSelection'

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
@connect(({ payWorkflowModel, loading, common, payDetailsModel }) => ({
  payWorkflowModel,
  loading,
  common,
  payDetailsModel,
}))
export default class payWorkflow extends Component {
  state = {
    ProjectSelectionVisible: false,
    isShow: false,
    otherFile: [],
    projectObj: {
      id: null,
      tenderCompanyId: null,
      tenderCompanyName: null,
      projectName: '',
      projectClass: null,
      province: null,
      city: null,
      projectStartDay: null,
      projectEndDay: null,
      projectId: null,
      key: null,
    },
    actionType: getUrlParamBySearch(this.props.location.search, 'action'),
    detail: {},
  };

  queryPayment() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payDetailsModel/queryPayment',
      payload: {
        aprvId: getUrlParamBySearch(this.props.location.search, 'aprvId'),
        orderId: getUrlParamBySearch(this.props.location.search, 'processInstId'),
      },
    }).then(() => {
      let payDetails = this.props.payDetailsModel.payDetails;
      this.setState({
        detail: payDetails.payment,
      });
      if (
        payDetails.payment &&
        payDetails.payment.payCertificate &&
        (payDetails.payment.payCertificate == 1 || payDetails.payment.payCertificate == 2)
      ) {
        this.setState({
          isShow: true,
        });
      }
      console.log(this.state.detail);
    });
  }
  componentDidMount() {
    console.log(this.props);
    if (getUrlParamBySearch(this.props.location.search, 'aprvId')) {
      this.queryPayment();
      this.getReportAttachIds();
    }
  }
  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      console.log(values, 'values');
      // values.action = type;
      if (!err) {
        let otherFiles = [];
        values.projectName =
          this.state.projectObj.projectName ||
          (this.state.detail ? this.state.detail.projectName : null);
        values.projectId =
          this.state.projectObj.projectId ||
          (this.state.detail ? this.state.detail.projectId : null);
        if (values.otherFile) {
          values.otherFile.fileList.map(item => {
            if (item.status === 'done') {
              otherFiles.push(item.response.data ? item.response.data.id : '');
            }
          });
        }
        // 价税总额
        if (values.priceAssessment && values.taxAssessment) {
          values.adValorem = (
            Number(values.priceAssessment) + Number(values.taxAssessment)
          ).toFixed(2);
        }
        // 驳回的
        if (getUrlParamBySearch(this.props.location.search, 'aprvId') && this.state.otherFile) {
          this.state.otherFile.map(item => {
            otherFiles.push(item.uid);
          });
        }
        if (getUrlParamBySearch(this.props.location.search, 'aprvId')) {
          values.aprvId = getUrlParamBySearch(this.props.location.search, 'aprvId');
        }
        if (getUrlParamBySearch(this.props.location.search, 'orderId')) {
          values.orderId = getUrlParamBySearch(this.props.location.search, 'orderId');
        }
        if (getUrlParamBySearch(this.props.location.search, 'taskId')) {
          values.taskId = getUrlParamBySearch(this.props.location.search, 'taskId');
        }

        console.log(otherFiles);
        values.otherFile = otherFiles.toString();
        console.log(values);
        dispatch({
          type: 'payWorkflowModel/addPay',
          payload: values,
          callback: () => {
            console.log(this.props.payWorkflowModel.savePay.status);
            if (this.props.payWorkflowModel.savePay.status == '200') {
              message.success('提交成功');
              this.props.history.replace('/processCenter/myProcess');
            } else {
              message.error(this.props.payWorkflowModel.savePay.msg);
            }
          },
        });
      }
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  componentWillUnmount() {}
  selectCertificate = e => {
    console.log(e);
    if (e == '1' || e == '2') {
      this.setState({
        isShow: true,
      });
    } else {
      this.setState({
        isShow: false,
      });
    }
  };

  ProjectSelectionIsShow = data => {
    this.setState({
      ProjectSelectionVisible: data,
    });
  };
  ProjectSelectionOK = data => {
    console.log(data);
    this.setState({
      projectObj: data,
    });
    this.props.form.setFieldsValue({
      projectName: data.projectName,
      tenderCompanyName: data.tenderCompanyName,
      projectClass: data.projectClass,
      projectId: data.projectId,
    });

    // this.props.form.projectId = data.projectId;
    // this.props.form.projectName = data.projectName;
    // console.log(this.props.form.projectName)
    // console.log(data)
  };

  // 查询附件
  getReportAttachIds() {
    this.props
      .dispatch({
        type: 'common/queryAttachList',
        payload: {
          bizCode: 'PAYMENT_FILE',
          bizId: getUrlParamBySearch(this.props.location.search, 'aprvId'),
        },
      })
      .then(() => {
        let fileList = [],
          otherfileList = [];
        (this.props.common.filesPath.data
          ? this.props.common.filesPath.data.attachmentVOList
          : []
        ).map((item, i) => {
          if (item.ctrlName == 'PAYMENT_OTHER_FILE') {
            // 其它附件
            otherfileList.push({
              uid: item.id,
              fileType: item.fileType,
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
            });
          }
        });
        this.setState({
          otherFile: otherfileList,
        });
      });
  }
  render() {
    const { submitting, form } = this.props;
    const { previewImage, isShow, previewVisible, projectObj, detail } = this.state;
    //let that = this;
    const { payWorkflowModel } = this.props;

    const { TextArea } = Input;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    return (
      <PageHeaderLayout>
        <Card title={payWorkflowModel.data} bordered={false}>
          <Row>
            <Col span={18}>
              <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
                <FormItem {...formItemLayout} label="项目名称">
                  {getFieldDecorator('projectId', {
                    initialValue:
                      projectObj.projectId || (detail ? detail.projectId : null) || null,

                    rules: [
                      {
                        required: true,
                        message: '请选择项目',
                      },
                    ],
                  })(
                    <Button
                      type="primary"
                      // hidden={actionType == 'change'}
                      onClick={this.ProjectSelectionIsShow.bind(this, true)}
                    >
                      选择项目
                    </Button>
                  )}
                  <div className={styles.selectData}>
                    {projectObj.projectName || (detail && detail.projectName) ? (
                      <span>
                        {projectObj.projectName || (detail ? detail.projectName : null) || null}{' '}
                        <Icon
                          type="close"
                          onClick={() => {
                            this.setState({ projectObj: {} });
                          }}
                        />
                      </span>
                    ) : (
                      projectObj.projectName || (detail ? detail.projectName : null)
                    )}
                  </div>
                </FormItem>

                <FormItem {...formItemLayout} label="支出类型">
                  {getFieldDecorator('bizType', {
                    initialValue: detail && detail.bizType ? detail.bizType.toString() : undefined,
                    rules: [
                      {
                        required: true,
                        message: '请选择支出类型',
                      },
                    ],
                  })(
                    <Select placeholder="请选择">
                      <Option value="1">材料支出</Option>
                      <Option value="2">劳务支出</Option>
                      <Option value="3">其它</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="费用类型">
                  {getFieldDecorator('moneyType', {
                    initialValue:
                      detail && detail.moneyType ? detail.moneyType.toString() : undefined,
                    rules: [
                      {
                        required: true,
                        message: '请选择费用类型',
                      },
                    ],
                  })(
                    <Select placeholder="请选择">
                      <Option value="1">预付款</Option>
                      <Option value="2">进度款</Option>
                      <Option value="3">结算款</Option>
                      <Option value="4">质保金</Option>
                      <Option value="5">完工款</Option>
                      <Option value="6">零星费用</Option>
                      <Option value="7">其它</Option>
                    </Select>
                  )}
                </FormItem>

                <FormItem {...formItemLayout} label="支付金额">
                  {getFieldDecorator('payMoney', {
                    initialValue: detail && detail.payMoney ? detail.payMoney : null,
                    rules: [
                      {
                        required: true,
                        message: '请输入支付金额',
                      },
                      {
                        pattern: /^(\d{0,8})(\d{0,8}\.\d{1,2})?$/,
                        message: '请输入亿位以下数字金额',
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      step={1.0}
                      precision={2}
                      placeholder="请输入支付金额"
                      style={{ width: ['100%'] }}
                      formatter={value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/￥\s?|(,*)/g, '')}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="付款凭证">
                  {getFieldDecorator('payCertificate', {
                    initialValue:
                      detail && detail.payCertificate
                        ? detail.payCertificate.toString()
                        : undefined,
                    rules: [
                      {
                        required: true,
                        message: '请选择付款凭证',
                      },
                    ],
                  })(
                    <Select placeholder="请选择" onChange={this.selectCertificate}>
                      <Option value="1">增值税专用发票</Option>
                      <Option value="2">增值税普通发票</Option>
                      <Option value="3">收据</Option>
                      <Option value="4">其它</Option>
                    </Select>
                  )}
                </FormItem>

                {isShow ? (
                  <FormItem {...formItemLayout} label="本次收到发票">
                    <table className={styles.payTaxRateTable}>
                      <tbody>
                        <tr>
                          <td>税率</td>
                          <td>
                            {' '}
                            <FormItem style={{ marginBottom: 0, marginLeft: 10 }}>
                              {getFieldDecorator('taxRate', {
                                initialValue: detail && detail.taxRate ? detail.taxRate : null,
                                rules: [
                                  {
                                    required: true,
                                    message: '请输入税率',
                                  },
                                  {
                                    pattern: /^(\d{0,3})(\d{0,3}\.\d{1,2})?$/,
                                    message: '请输入合法数字',
                                  },
                                ],
                              })(
                                <InputNumber
                                  className={styles.noBorder}
                                  placeholder="请输入税率"
                                  min={0}
                                  max={100}
                                  formatter={value => `${value}`}
                                  parser={value => value.replace('%', '')}
                                />
                              )}

                              <div className={styles.lableRight}>%</div>
                            </FormItem>
                          </td>
                        </tr>
                        <tr>
                          <td>发票价额</td>
                          <td>
                            <FormItem style={{ marginBottom: 0, marginLeft: 10 }}>
                              {getFieldDecorator('priceAssessment', {
                                initialValue:
                                  detail && detail.priceAssessment ? detail.priceAssessment : null,
                                rules: [
                                  {
                                    required: true,
                                    message: '请输入发票价额',
                                  },
                                  {
                                    pattern: /^(\d{0,8})(\d{0,8}\.\d{1,2})?$/,
                                    message: '请输入亿位以下数字金额',
                                  },
                                ],
                              })(
                                <InputNumber
                                  className={styles.noBorder}
                                  min={0}
                                  step={1.0}
                                  precision={2}
                                  placeholder="请输入发票价额"
                                  formatter={value =>
                                    `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                  }
                                  parser={value => value.replace(/￥\s?|(,*)/g, '')}
                                />
                              )}

                              <div className={styles.lableRight}>元</div>
                            </FormItem>
                          </td>
                        </tr>
                        <tr>
                          <td>发票税额</td>
                          <td>
                            <FormItem style={{ marginBottom: 0, marginLeft: 10 }}>
                              {getFieldDecorator('taxAssessment', {
                                initialValue:
                                  detail && detail.taxAssessment ? detail.taxAssessment : null,
                                rules: [
                                  {
                                    required: true,
                                    message: '请输入发票税额',
                                  },
                                  {
                                    pattern: /^(\d{0,8})(\d{0,8}\.\d{1,2})?$/,
                                    message: '请输入亿位以下数字金额',
                                  },
                                ],
                              })(
                                <InputNumber
                                  className={styles.noBorder}
                                  min={0}
                                  step={1.0}
                                  precision={2}
                                  placeholder="请输入发票税额"
                                  formatter={value =>
                                    `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                  }
                                  parser={value => value.replace(/￥\s?|(,*)/g, '')}
                                />
                              )}

                              <div className={styles.lableRight}>元</div>
                            </FormItem>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <b>价税合计</b>
                          </td>
                          <td>
                            <FormItem style={{ marginBottom: 0, marginLeft: 10 }}>
                              {/*{getFieldDecorator('adValorem', {
                                initialValue:
                                  Number(form.getFieldValue('priceAssessment')) +
                                  Number(form.getFieldValue('taxAssessment')),
                                rules: [
                                  {
                                    required: true,
                                    message: '请输入价税合计',
                                  },
                                  {
                                    pattern: /^(\d{0,8})(\d{0,8}\.\d{1,2})?$/,
                                    message: '请输入亿位以下数字金额',
                                  },
                                ],
                              })(
                                <InputNumber
                                  className={styles.noBorder}
                                  min={0}
                                  step={1.0}
                                  precision={2}
                                  placeholder="请输入价税合计"
                                  formatter={value =>
                                    `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                  }
                                  parser={value => value.replace(/￥\s?|(,*)/g, '')}
                                  disabled={true}
                                />
                              )}*/}
                              <InputNumber
                                className={styles.noBorder}
                                min={0}
                                step={1.0}
                                precision={2}
                                placeholder="请输入价税合计"
                                formatter={value =>
                                  `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                }
                                parser={value => value.replace(/￥\s?|(,*)/g, '')}
                                disabled={true}
                                value={(
                                  Number(form.getFieldValue('priceAssessment') || 0) +
                                  Number(form.getFieldValue('taxAssessment') || 0)
                                ).toFixed(2)}
                              />
                              <div className={styles.lableRight}>元</div>
                            </FormItem>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </FormItem>
                ) : null}

                <FormItem {...formItemLayout} label="收款单位名称">
                  {getFieldDecorator('companyName', {
                    initialValue: detail && detail.companyName ? detail.companyName : null,
                    rules: [
                      {
                        required: true,
                        message: '请输入收款单位名称',
                      },
                    ],
                  })(<Input placeholder="请输入收款单位名称" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="开户行名称">
                  {getFieldDecorator('bankName', {
                    initialValue: detail && detail.bankName ? detail.bankName : null,
                    rules: [
                      {
                        required: true,
                        message: '请输入开户行名称',
                      },
                    ],
                  })(<Input placeholder="请输入开户行名称" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="银行账号">
                  {getFieldDecorator('bankAccount', {
                    initialValue: detail && detail.bankAccount ? detail.bankAccount : null,
                    rules: [
                      {
                        required: true,
                        message: '请输入银行账号',
                      },
                    ],
                  })(<Input placeholder="请输入银行账号" />)}
                </FormItem>

                <FormItem {...formItemLayout} label="上传">
                  {getFieldDecorator('otherFile', {
                    rules: [
                      // {
                      //   // required: true,
                      //   message: '请上传文件',
                      // },
                    ],
                  })(
                    <Upload
                      {...upLoadInit(
                        'file',
                        this.state.otherFile,
                        // 'picture-card',
                        '',
                        'otherFile',
                        true,
                        true,
                        this,
                        '/base/attach/upload'
                      )}
                      fileList={this.state.otherFile}
                      data={{ name: 'otherAttachment' }}
                      beforeUpload={e => beforeUpload(e, ['all'], 5)}
                      onChange={e => uploadChange(e, 'otherFile', this, false)}
                    >
                      <Button>
                        <Icon type="upload" />
                        上传附件
                      </Button>
                    </Upload>
                  )}
                  <Modal
                    visible={previewVisible}
                    width={'55%'}
                    footer={null}
                    onCancel={this.handleCancel}
                  >
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                  </Modal>
                </FormItem>
                <FormItem {...formItemLayout} label="备注">
                  {getFieldDecorator('remark', {
                    initialValue: detail && detail.remark ? detail.remark : null,
                  })(<TextArea style={{ minHeight: 32 }} placeholder="请输入备注内容" rows={4} />)}
                </FormItem>
                <div style={{ textAlign: 'center' }}>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    提交审批
                  </Button>
                </div>
              </Form>
              <ProjectSelection
                isShow={this.ProjectSelectionIsShow}
                onOK={this.ProjectSelectionOK}
                ispayWorkflow={true}
                visible={this.state.ProjectSelectionVisible}
                processType="payment"
              />
            </Col>
            <Col span={6}>
              {this.state.projectObj.projectId || (detail && detail.projectId) ? (
                <FlowStep
                  processCode="payment"
                  orderId=""
                  projectId={this.state.projectObj.projectId || (detail ? detail.projectId : null)}
                />
              ) : (
                ''
              )}
            </Col>
          </Row>
        </Card>
      </PageHeaderLayout>
    );
  }
}
