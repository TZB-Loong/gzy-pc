import React, { Component } from 'react';
import { connect } from 'dva';
import {
  Card,
  Spin,
  Form,
  Button,
  Row,
  Col,
  Input,
  message,
} from 'antd';
import CreatForm from './common/creatForm';
import { isfalse, isJSON } from '../../Tools/util_tools';
import { getUrlParamBySearch } from '../../utils/utils'
import FlowStep from '../Common/flowStep';
import FlowRecordList from '../ApprovalPerformance/flowRecordList';
import { routerRedux } from 'dva/router';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
  },
};
const submitFormLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 20 },
    sm: { span: 12, offset: 12 },
  },
};

@Form.create() //链接到form
@connect(({ submForm, loading, common }) => ({
  submForm,
  filesPath: common.filesPath,
  loading: loading.effects['submForm/bizObjectMetadataCustomList'],
  send: loading.effects['submForm/send'],
  back: loading.effects['submForm/back'],
  report: loading.effects['submForm/customFormSave']
}))
export default class DesignFormWrite extends Component {
  state = {
    listData: [], //form 表单list
    bizCode: '',
    param: {
      id:getUrlParamBySearch(this.props.location.search, 'bizObjId'),
      bizCode: getUrlParamBySearch(window.location.href, 'bizCode'),
      bizName: decodeURI(getUrlParamBySearch(window.location.href, 'bizName')),
      taskId: getUrlParamBySearch(this.props.location.search, 'taskId'),
      orderId: getUrlParamBySearch(this.props.location.search, 'orderId'),
      attachParams: null
    },
    type: '',
    filesPath: [],//查询到附件的数据
    clickType: 0
  };

  componentDidMount() {
    this.setState({
      bizCode: getUrlParamBySearch(this.props.location.search, 'bizCode'),
      bizObjId: getUrlParamBySearch(this.props.location.search, 'bizObjId'),
      type: getUrlParamBySearch(this.props.location.search, 'type'),
      taskId: getUrlParamBySearch(this.props.location.search, 'taskId'),
      projectId: getUrlParamBySearch(this.props.location.search, 'projectId'),
      orderId: getUrlParamBySearch(this.props.location.search, 'orderId'),
      bizName:decodeURI(getUrlParamBySearch(window.location.href, 'bizName')),
    }, () => {
      const { bizCode } = this.state;
      this.bizObjectMetadataCustomList({ bizCode });
    })
  }

  bizObjectMetadataCustomList = (params) => {
    //查询设计后的表单数据,生成表单
    const { dispatch } = this.props;
    dispatch({
      type: 'submForm/bizObjectMetadataCustomList',
      payload: params,
    }).then(() => {
      const { submForm } = this.props;
      const { type, bizObjId, bizCode } = this.state;
      if (!isfalse(submForm.listData)) {
        this.setState({
          listData: submForm.listData,
        }, () => {
          if (!isfalse(bizObjId)) { //这个是不是不需要限制?--TODO
            this.customFormView({ collectionName: bizCode, params: JSON.stringify({ id: bizObjId }) });
          }
        });
      }
    });
  };

  setdefaultValue = () => { //修改默认值
    const { submForm } = this.props;
    let listData = this.state.listData, customFormViewData = submForm.customFormViewData;
    listData.map(item => {
      if (!isfalse(customFormViewData[item.ctrlName])) {
        let extentionProps = JSON.parse(item.extentionProps);
        if (item.ctrlType == "subfrom") { //处理子表单的数据
          let subformOptions = isJSON(extentionProps.options) ? JSON.parse(extentionProps.options) : extentionProps.options;
          subformOptions.map(sOption => {
            customFormViewData[item.ctrlName].map(defV => {

              // if(sOption.ctrlType=='attach'){//子表单附件显示默认值处理
              //   let attachCode = JSON.parse(item.extentionProps).attachCode;
              //   let attachDefault = []
              //   this.state.filesPath.map(files => {
              //     if (files.ctrlName == attachCode) {
              //       attachDefault.push(files)
              //     }
              //   })
              //   // console.log(attachDefault,'attachDefault')

              //   let subExtentionProps = JSON.parse(sOption.extentionProps)
              //   subExtentionProps.defaultValue = attachDefault;
              //   sOption.extentionProps = JSON.stringify(subExtentionProps);
              //   console.log(sOption.extentionProps,'sOption.extentionProps')

              // }else
              if (!isfalse(defV[sOption.ctrlName])) {
                let subExtentionProps = JSON.parse(sOption.extentionProps)
                subExtentionProps.defaultValue = defV[sOption.ctrlName];
                sOption.extentionProps = JSON.stringify(subExtentionProps);
              }
            })
          })
          extentionProps.options = isJSON(extentionProps.options) ? JSON.stringify(subformOptions) : subformOptions;
          console.log(extentionProps.options,'0000')
        }

        // if (item.ctrlType == 'attach') { //附件默认值处理
        //   let attachCode = JSON.parse(item.extentionProps).attachCode;
        //   let attachDefault = []
        //   this.state.filesPath.map(files => {
        //     if (files.ctrlName == attachCode) {
        //       attachDefault.push(files)
        //     }
        //   })

        //   extentionProps.defaultValue = attachDefault;
        //   item.extentionProps = JSON.stringify(extentionProps);

        // } else {
          extentionProps.defaultValue = customFormViewData[item.ctrlName];
          item.extentionProps = JSON.stringify(extentionProps);
        // }
      }
    })
    this.setState({
      listData
    })
  }


  customFormView = (params) => {
    //查看提交过审批的数据,生成form
    const { dispatch } = this.props;
    dispatch({
      type: "submForm/customFormView",
      payload: params
    }).then(() => {
      const { submForm } = this.props;
      if (!isfalse(submForm.customFormViewData)) {
        this.setdefaultValue();
        // this.queryAttachList({ bizCode: this.state.bizCode, bizId: submForm.customFormViewData.id }) //获取附件的值
      }
    })
  }

  // queryAttachList = (data) => { //获取到附件的值
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'common/queryAttachList',
  //     payload: data
  //   }).then(() => {
  //     const { filesPath } = this.props;
  //     console.log(filesPath,'filesPath--filesPath')
  //     if (!isfalse(filesPath)) {
  //       if (!isfalse(filesPath.data)) {
  //         if(!isfalse(filesPath.data.attachmentVOList)){
  //           this.setState({
  //             filesPath: filesPath.data.attachmentVOList
  //           }, () => {
  //             this.setdefaultValue();
  //           })
  //         }
  //       }else{
  //         this.setdefaultValue();
  //       }
  //     }
  //   })
  // }

  send = (params) => { //发起审批(流程发起)
    const { dispatch } = this.props;
    dispatch({
      type: "submForm/send",
      payload: params
    }).then(() => {
      const { submForm: { sendStatus } } = this.props;
      if (sendStatus) {
        dispatch(
          routerRedux.push(`/processCenter/waitProcess`)
        );
      }
    })
  }
  back = (params) => { //流程回退
    const { dispatch } = this.props;
    dispatch({
      type: "submForm/back",
      payload: params
    }).then(() => {
      const { submForm: { backStatus } } = this.props;
      // console.log('thijia', backStatus)
      if (backStatus) {
        dispatch(
          routerRedux.push(`/processCenter/waitProcess`)
        );
      }
    })
  }

  report = (params) => { //流程启动时
    const { dispatch } = this.props;
    dispatch({
      type: 'submForm/customFormSave',
      payload: params
    }).then(() => {
      const { submForm: { customFormSaveStatus } } = this.props;
      if (customFormSaveStatus) {
        dispatch(
          routerRedux.push(`/processCenter/myProcess`)
        );
      }
    })
  }

  getAttachParams = (data) => { //获取附件参数
    // console.log(data,'attachData')
    this.setState({
      param: Object.assign(this.state.param, { attachParams: JSON.stringify(data) })
    })
  }

  handleSubmit = (e, clickType) => {
    //点击提交时的函数
    e.preventDefault();
    const { form } = this.props;
    const { type, bizObjId, taskId, bizCode, orderId } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (type == 'approval') { //发起审批(带审批意见的)
          let params = {
            id: bizObjId,
            bizCode: bizCode,
            taskId: taskId,
            orderId: orderId,
            content: values['content']
          }
          if (clickType == 0) { //同意
            this.send(params);
          } else { //不同意
            if (isfalse(params.content)) {
              message.warning('审批意见不能为空')
            } else {
              this.back(params)
            }
          }
        } else { //提交审批

          let params = Object.assign(this.state.param, { bizContent: JSON.stringify(values) })
          this.report(params);

        }
      }else{
        console.log(values,'values--values')
      }
    });
  };

  render() {
    const { submForm, loading, send, back, report } = this.props;
    const { getFieldDecorator } = this.props.form
    const { type, taskId, bizCode, projectId, orderId,bizName } = this.state;
    return (
      <Spin spinning={loading}>
        <Card title={submForm.title}>
          <Row gutter={24}>
            <Col className="gutter-row" span={16}>
              <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }} hideRequiredMark={type == 'view' || type == 'approval'}>
                <CreatForm
                  formData={this.state.listData}
                  form={this.props.form}
                  type={type}
                  getAttachParams={this.getAttachParams}
                />
                {type == 'approval' ?
                  <span>
                    <FormItem {...formItemLayout} label="审批意见">
                      {getFieldDecorator('content', {
                        rules: [
                          {
                            required: false,
                            message: '请输入审批意见',
                            whitespace: true
                          },
                        ],
                      })(
                        <TextArea
                          style={{ minHeight: 32 }}
                          placeholder="请输入审批意见"
                          rows={4}
                        />
                      )}
                    </FormItem>
                    <FormItem {...submitFormLayout}>
                      <Button
                        type="primary"
                        loading={send}
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
                        loading={back}
                      >
                        不同意
                </Button>
                    </FormItem>
                  </span> : (type != 'view' ? <div style={{ textAlign: 'center' }}>
                    <Button type="primary" htmlType="submit" loading={report}>
                      提交审批
                  </Button>
                  </div> : null)
                }


              </Form>
            </Col>
            <Col className="gutter-row" span={8}>
              <FlowStep
                processCode={bizCode}
                orderId={orderId}
                projectId={isfalse(projectId) ? '-1' : projectId}
                taskId={taskId}
              />
            </Col>
            {type == 'view' || type == "approval" ||!isfalse(orderId)? <div>
              <Col span={15} offset={4}>
                <FlowRecordList
                  processCode={bizCode}
                  orderId={orderId}
                  projectId={projectId}
                  taskId={taskId}
                  title={bizName}
                />
              </Col>
            </div> : null}

          </Row>
        </Card>
      </Spin>
    );
  }
}
