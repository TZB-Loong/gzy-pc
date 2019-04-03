/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Form, Select, Input, Icon, Upload, Modal, Button, Row, Col, message } from 'antd';
import { getUrlParamBySearch } from '../../utils/utils';
import { url2params } from '../../Tools/util_tools';
import styles from './style.less';
import FlowRecordList from './flowRecordList';
import FlowStep from '../Common/flowStep';
import moment from 'moment';
import ViewResult from '../Common/viewFiles';

const FormItem = Form.Item;

const Option = Select.Option;

@Form.create()
@connect(({ payApprovalModel, loading }) => ({
  payApprovalModel,
  loading,
  Form,
  Input,
  Select,
  Icon,
  Upload,
  Modal,
  Button,
  Row,
  Col,
}))
export default class payDetails extends Component {
  state = {
    detail: { creator: '' },
    data: {
      content: null, //审批意见
      result: 0, //结论 0：同意 1：不同意
      taskName: '测试', //流程名
      projectId: null,
      taskId: null,
      orderId: null,
      aprvId: null,
    },
  };

  handleSubmit = (e, type) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    let api = type == 0 ? 'payApprovalModel/sendApproval' : 'payApprovalModel/sendApprovalNo';
    form.validateFieldsAndScroll([type == 0 ? '' : 'content'], (err, values) => {
      if (!err) {
        dispatch({
          type: api,
          payload: {
            aprvId: getUrlParamBySearch(this.props.location.search, 'aprvId'),
            orderId: getUrlParamBySearch(this.props.location.search, 'orderId'),
            projectId: getUrlParamBySearch(this.props.location.search, 'projectId'),
            taskId: getUrlParamBySearch(this.props.location.search, 'taskId'),
            result: type,
            content: this.props.form.getFieldValue('content'),
          },
          // payload:values,
          // payload:this.state.data
        }).then(() => {
          const {
            payApprovalModel: { sendStatus },
          } = this.props;
          if (sendStatus) {
            message.success('提交成功');
            this.props.history.replace('/processCenter/waitProcess');
          }
        });
      }
    });
  };

  componentDidMount() {
    // console.log(getUrlParamBySearch(this.props.location.search,'aprvId'))
    // console.log(getUrlParamBySearch(this.props.location.search,'processInstId'))
    const { dispatch } = this.props;
    let newData = this.state.data;
    dispatch({
      type: 'payApprovalModel/queryPayment',
      payload: {
        aprvId: getUrlParamBySearch(this.props.location.search, 'aprvId'),
        orderId: getUrlParamBySearch(this.props.location.search, 'orderId'),
      },
    }).then(() => {
      let payDetails = this.props.payApprovalModel.payDetails;
      (newData.projectId = getUrlParamBySearch(this.props.location.search, 'projectId')),
        (newData.aprvId = getUrlParamBySearch(this.props.location.search, 'aprvId')),
        (newData.taskId = getUrlParamBySearch(this.props.location.search, 'taskId')),
        (newData.orderId = getUrlParamBySearch(this.props.location.search, 'orderId')),
        (newData.taskName = payDetails.payment.taskName || ''),
        this.setState({
          newData,
          detail: payDetails.payment,
        });
    });
  }

  render() {
    const { submitting, form } = this.props;
    const { TextArea } = Input;
    const { getFieldDecorator } = this.props.form;
    const { detail } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 20 },
        sm: { span: 12, offset: 12 },
      },
    };

    return (
      <Card title={'审批详情'} bordered={false}>
        <Row>
          <Col span={18}>
            <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginBottom: 0 }}>
              <FormItem {...formItemLayout} label="审批发起人" style={{ marginBottom: 0 }}>
                <label>{detail.userName}</label>
              </FormItem>
              <FormItem {...formItemLayout} label="审批发起时间" style={{ marginBottom: 0 }}>
                <label>{moment(detail.createTime).format('YYYY-MM-DD  hh:mm:ss')}</label>
              </FormItem>
              <FormItem {...formItemLayout} label="项目名称" style={{ marginBottom: 0 }}>
                <label>{detail.projectName}</label>
              </FormItem>
              <FormItem {...formItemLayout} label="支出类型" style={{ marginBottom: 0 }}>
                <label>
                  {detail.moneyType == 1 ? '材料支出' : ''}
                  {detail.moneyType == 2 ? '劳务支出' : ''}
                  {detail.moneyType == 3 ? '其它' : ''}
                </label>
              </FormItem>
              <FormItem {...formItemLayout} label="费用类型" style={{ marginBottom: 0 }}>
                <label>
                  {detail.bizType == 1 ? '预付款' : ''}
                  {detail.bizType == 2 ? '进度款' : ''}
                  {detail.bizType == 3 ? '结算款' : ''}
                  {detail.bizType == 4 ? '质保金' : ''}
                  {detail.bizType == 5 ? '完工款' : ''}
                  {detail.bizType == 6 ? '零星费用' : ''}
                  {detail.bizType == 7 ? '其它' : ''}
                </label>
              </FormItem>
              <FormItem {...formItemLayout} label="支付金额" style={{ marginBottom: 0 }}>
                <label>{detail.payMoney}元</label>
              </FormItem>
              <FormItem {...formItemLayout} label="付款凭证" style={{ marginBottom: 0 }}>
                <label>
                  {detail.payCertificate == 1 ? '增值税专用发票' : ''}
                  {detail.payCertificate == 2 ? '增值税普通发票' : ''}
                  {detail.payCertificate == 3 ? '收据' : ''}
                  {detail.payCertificate == 4 ? '其它' : ''}
                </label>
              </FormItem>
              {detail.payCertificate == 1 || detail.payCertificate == 2 ? (
                <FormItem {...formItemLayout} label="本次收到发票" style={{ marginBottom: 0 }}>
                  <table style={{ width: 420 }}>
                    <tbody>
                      <tr>
                        <td>税率</td>
                        <td>{detail.taxRate}%</td>
                      </tr>
                      <tr>
                        <td>发票价额</td>
                        <td>{detail.priceAssessment}元</td>
                      </tr>
                      <tr>
                        <td>发票税额</td>
                        <td>{detail.taxAssessment}元</td>
                      </tr>
                      <tr>
                        <td>
                          <b>价税合计</b>
                        </td>
                        <td>{detail.adValorem}元</td>
                      </tr>
                    </tbody>
                  </table>
                </FormItem>
              ) : (
                ''
              )}
              <FormItem {...formItemLayout} label="收款方" style={{ marginBottom: 0 }}>
                <label>{detail.companyName}</label>
              </FormItem>
              <FormItem {...formItemLayout} label="其他附件：" style={{ marginBottom: 0 }}>
                <label>
                  {detail.aprvId ? (
                    <ViewResult
                      type={'PAYMENT_OTHER_FILE'}
                      sourceData={{
                        bizCode: 'PAYMENT_FILE',
                        bizId: detail.aprvId,
                      }}
                    />
                  ) : null}
                </label>
              </FormItem>
              <FormItem {...formItemLayout} label="备注" style={{ marginBottom: 0 }}>
                <label>{detail.remark}</label>
              </FormItem>
              <FormItem {...formItemLayout} label="审批意见">
                {getFieldDecorator('content', {
                  rules: [
                    {
                      required: true,
                      message: '请输入审批意见',
                    },
                  ],
                })(
                  <TextArea
                    style={{ minHeight: 32 }}
                    onChange={e => {
                      this.state.data.content = e.target.value;
                    }}
                    placeholder="请输入审批意见"
                    rows={4}
                  />
                )}
              </FormItem>
              <FormItem {...submitFormLayout}>
                <Button
                  type="primary"
                  loading={submitting}
                  style={{ marginRight: 20 }}
                  onClick={e => {
                    this.handleSubmit(e, 0);
                  }}
                >
                  同意
                </Button>
                <Button
                  type="default"
                  htmlType="submit"
                  onClick={e => {
                    this.handleSubmit(e, 1);
                  }}
                  loading={submitting}
                >
                  不同意
                </Button>
              </FormItem>
            </Form>
            <Col span={6} />
            <Col span={18}>
              <FlowRecordList
                processCode={getUrlParamBySearch(this.props.location.search, 'processCode')}
                orderId={getUrlParamBySearch(this.props.location.search, 'orderId')}
                projectId={getUrlParamBySearch(this.props.location.search, 'projectId')}
              />
            </Col>
          </Col>
          <Col span={6}>
            <FlowStep
              processCode={getUrlParamBySearch(this.props.location.search, 'processCode')}
              orderId={getUrlParamBySearch(this.props.location.search, 'orderId')}
              projectId={getUrlParamBySearch(this.props.location.search, 'projectId')}
            />
          </Col>
        </Row>
      </Card>
    );
  }
}
