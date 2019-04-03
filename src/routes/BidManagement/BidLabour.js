/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { routerRedux } from 'dva/router';
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
  Radio,
  DatePicker,
  Checkbox,
  TimePicker,
  message,
  InputNumber,
} from 'antd';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';
import Styles from './style.less';
import moment from 'moment';
import { format } from '../../utils/dateFormat';
import { getUrlParamBySearch, getCookie,getPurchased } from '../../utils/utils';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SelectSupplier from '../Common/SelectSupplier';
import Protocl from '../Common/Protocl';
import ProjectSelection from './ProjectSelection';
import { pathPurchase } from '../../../configPath';
import ValidResult from '../Common/ValidResult';
import { isfalse } from '../../Tools/util_tools';
import TenderList from './TenderList'; // 招标清单
import {pathRequest,pathTender} from '../../../configPath';

const { TextArea } = Input;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;
const FormItem = Form.Item;
@Form.create()
@connect(({ labour, myProjectModel, common, loading }) => ({
  labour,
  myProjectModel,
  common,
  loading,
}))
export default class BidLabour extends Component {
  state = {
    closingDate: moment()
      .subtract(-3, 'days')
      .format('YYYY-MM-DD'),
    isDraft: true, //必填验证
    showModal: false,
    closeTimePicker: false,
    showProtoclModal: false,
    openDate: null,
    scenePic: [], //现场图片
    otherFiles: [], //其它附件
    clarifyFiles: [], //澄清文件
    tenderListFile: [], //清单
    tenderFile: [], //招标文件
    agreementBidnoticePic: [], //通知书
    isAgreement: false,
    isEndHour: false,
    checkedList: [],
    plainOptions: [],
    checkAll: false,
    validatorScore: false,
    progressPayment: false,
    sumPayment: false,
    validatorCont: '',
    previewVisible: false,
    ProjectSelectionVisible: false,
    previewImage: '',
    userId: null,
    projectObj: {
      id: null,
      tenderCompanyId: null,
      tenderCompanyName: '',
      projectName: '',
      projectClass: null,
      province: null,
      city: null,
      projectStartDay: null,
      projectEndDay: null,
      projectId: null,
      key: null,
      auditState: 0,
    },
    actionType: getUrlParamBySearch(window.location.href, 'action')||'release',
    validResultVisible: false,
    validResult: [],
    TenderListVisible: false,
    tenderListJsonData: {},
    platformSupplier: [],
    privateSupplier: [],
  };
  componentDidMount() {
    const { form, dispatch } = this.props;
    let that = this;
    let id = getUrlParamBySearch(window.location.href, 'tenderId');
    const projectId = getUrlParamBySearch(window.location.href, 'projectId');
    if (projectId) {
      dispatch({
        type: 'myProjectModel/details',
        payload: { projectId: projectId },
      }).then(() => {
        const {
          myProjectModel: { projectDetails },
        } = this.props;
        let projectData = {
          auditState: projectDetails.data.auditState,
          city: projectDetails.data.city,
          cityName: projectDetails.data.cityName,
          key: projectDetails.data.key,
          projectClass: projectDetails.data.projectClass,
          projectContractFiles: projectDetails.data.projectContractFiles,
          projectId: projectDetails.data.id,
          projectName: projectDetails.data.projectName,
          projectStartDay: projectDetails.data.validDateStart,
          projectEndDay: projectDetails.data.validDateEnd,
          province: projectDetails.data.province,
          provinceName: projectDetails.data.provinceName,
          tenderCompanyName: projectDetails.data.bidCompany,
        };
        that.ProjectSelectionOK(projectData);
      });
    }
    //初始化配置
    dispatch({
      type: 'labour/labourInitConfig',
      payload: '',
    }).then(() => {
      const {
        labour: { initData },
      } = this.props;
      this.setState({
        plainOptions: initData.workType || [],
        // checkAll:initData.workType.length===this.state.plainOptions.length,
      });
    });
    if (id) {
      dispatch({
        type: 'labour/getLabourTender',
        payload: { tenderId: id },
      }).then(() => {
        const {
          labour: { detail },
        } = this.props;
        let project = this.state.projectObj;
        project.id = detail.project.id;
        project.projectName = detail.projectName;
        project.projectClass = detail.projectClass;
        project.auditState = detail.project.auditState;
        project.cityName = detail.cityText;
        project.city = detail.city;
        project.projectStartDay = detail.validDateStart;
        project.projectEndDay = detail.validDateEnd;
        (project.tenderCompanyName = detail.tenderCompanyName),
          (project.provinceName = detail.provinceText);
        project.projectStartDay = format(detail.projectStartDay, 'YYYY-MM-DD');
        project.projectEndDay = format(detail.projectEndDay, 'YYYY-MM-DD');
        this.setState({
          ...project,
          userId: detail.addUserId,
          privateSupplier:
            detail.isInvitationPrivateBid == null
              ? []
              : detail.isInvitationPrivateBid == 0
                ? detail.privateAuthbusinessJson
                  ? JSON.parse(detail.privateAuthbusinessJson)
                  : []
                : -1,
          platformSupplier:
            detail.tenderType == null
              ? []
              : detail.tenderType == 0
                ? detail.inviteCompanyJson
                  ? JSON.parse(detail.inviteCompanyJson)
                  : []
                : -1,
          agreementBidnoticePic: detail.agreementBidnoticePics || [],
          tenderListJsonData: detail.tenderListJsonData,
          checkAll: detail.workTypeList
            ? detail.workTypeList.length === this.state.plainOptions.length
            : false,
        });
        this.props.form.setFieldsValue({
          projectId: detail.projectId,
          tenderCompanyName: detail.tenderCompanyName,
          workType: detail.workTypeList || [],
          workTypeName: detail.workTypeName,
          tenderType: detail.tenderType,
          inviteCompanyIds: detail.inviteCompanyIds,
          isInvitationPrivateBid: detail.isInvitationPrivateBid,
          privateAuthbusinessIds: detail.privateAuthbusinessIds,
        });
      });
      dispatch({
        type: 'common/queryAttachList',
        payload: { bizCode: 'LABOUR_TENDER', bizId: id },
      }).then(() => {
        let fileData = [],
          tenderFileData = [],
          otherFilesData = [],
          ListFileData = [];
        (this.props.common.filesPath.data
          ? this.props.common.filesPath.data.attachmentVOList
          : []
        ).map((item, i) => {
          if (item.ctrlName == 'LABOUR_TENDER_SCENEPIC') {
            fileData.push({
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
              uid: item.id,
              fileType: item.fileType,
              status: 'result',
            });
          }
          if (item.ctrlName == 'LABOUR_TENDER_FILE') {
            tenderFileData.push({
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
              uid: item.id,
              fileType: item.fileType,
              status: 'result',
            });
          }
          if (item.ctrlName == 'LABOUR_TENDER_OTHER_FILES') {
            otherFilesData.push({
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
              uid: item.id,
              fileType: item.fileType,
              status: 'result',
            });
          }
          if (item.ctrlName == 'LABOUR_TENDER_LIST_FILE') {
            ListFileData.push({
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
              uid: item.id,
              fileType: item.fileType,
              status: 'result',
            });
          }
        });
        this.setState({
          scenePic: fileData, //现场图片
          otherFiles: otherFilesData, //其它附件
          tenderListFile: ListFileData, //清单
          tenderFile: tenderFileData, //招标文件
        });
      });
    }
  }
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'labour/clear',
    });
  }
  handleSubmit = (e, type) => {
    e.preventDefault();
    if (type == 'draft') {
      this.setState(
        {
          isDraft: false,
        },
        () => {
          this.props.form.validateFields(
            [
              'contractWay',
              'advancePayment',
              'processPayment',
              'endPayment',
              'qualityPayment',
              'isAllowBidUpdate',
              'scorePrice',
              'scoreAchievement',
              'tenderListFile',
              'closingDate',
              'endHour',
              'openDate',
              'contactName',
              'cellphoneNumber',
              'allWork',
            ],
            { force: true }
          );
          this.formValidate(type);
        }
      );
    } else {
      this.setState(
        {
          isDraft: true,
        },
        () => {
          this.props.form.validateFields(
            [
              'contractWay',
              'advancePayment',
              'processPayment',
              'endPayment',
              'qualityPayment',
              'isAllowBidUpdate',
              'scorePrice',
              'scoreAchievement',
              'tenderListFile',
              'closingDate',
              'endHour',
              'openDate',
              'contactName',
              'cellphoneNumber',
              'allWork',
            ],
            { force: true }
          );
          this.Ratio('prepay'); //验证付款条款
          this.Ratio('accounts'); //验证付款条款
          this.formValidate(type);
        }
      );
    }
  };
  formValidate = type => {
    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      values.action = type;
      if (type != 'draft') {
        if (!values.closingHour) {
          this.setState({ isEndHour: true });
        } else {
          this.setState({ isEndHour: false });
        }
      }
      if (!err) {
        let fileData = [],
          tenderFileData = [],
          otherFilesData = [],
          ListFileData = [];
        values.scenePic.fileList
          ? values.scenePic.fileList.map(item => {
              //现场图片
              if (item.status === 'done' && item.response.status == '200') {
                fileData.push(item.response.data.id);
              }
              if (item.status === 'result') {
                fileData.push(item.uid);
              }
            })
          : values.scenePic.map(item => {
              if (item.status === 'result') {
                fileData.push(item.uid);
              }
            });
        values.tenderFile.map(item => {
          //招标文件
          if (item.status === 'done') {
            tenderFileData.push(item.response.data.id);
          }
          if (item.status === 'result') {
            tenderFileData.push(item.uid);
          }
        });
        values.otherFiles.map(item => {
          //其它附件
          if (item.status === 'done' && !isfalse(item.response)) {
            otherFilesData.push(item.response.data.id);
          }
          if (item.status === 'result') {
            otherFilesData.push(item.uid);
          }
        });
        values.tenderListFile.map(item => {
          //招标清单
          if (item.status === 'done') {
            ListFileData.push(item.response.data.attach.id);
            values.tenderListJsonData = JSON.stringify({
              tenderList: item.response.data.tenderList,
              tableHeaders: item.response.data.tableHeaders,
            });
          }
          if (item.status === 'result') {
            ListFileData.push(item.uid);
            values.tenderListJsonData = this.state.tenderListJsonData;
          }
        });
        values.attachParams = JSON.stringify([
          { attachCode: 'LABOUR_TENDER_SCENEPIC', attachIds: fileData.toString() }, //材料样板
          { attachCode: 'LABOUR_TENDER_FILE', attachIds: tenderFileData.toString() }, //招标文件
          { attachCode: 'LABOUR_TENDER_OTHER_FILES', attachIds: otherFilesData.toString() }, //其它附件
          { attachCode: 'LABOUR_TENDER_LIST_FILE', attachIds: ListFileData.toString() }, //清单
        ]);

        values.workType = values.workType.toString();
        values.agreementBidnoticePic = values.agreementBidnoticePic.toString();
        values.workTypeName = values.workTypeName.toString();
        values.remark = values.remark
          ? values.remark.replace(/\r{0,}\n/g, '<br/>').replace(/\s/g, '&nbsp;')
          : null;
        values.oldLabourTenderId =
          getUrlParamBySearch(window.location.href, 'tenderId') || '';
        values.addUserId = this.state.userId;
        values.projectName = this.state.projectObj.projectName;
        values.labourTenderId = getUrlParamBySearch(window.location.href, 'tenderId') || '';
        values.closingHour = values.closingHour ? moment(values.closingHour).format('HH') : null; // 九月
        dispatch({
          type: 'labour/saveLabourTender',
          payload: values,
        }).then(() => {
          const { labour } = this.props;
          if (labour.saveStatus) {
            message.success(type == 'draft' ? '保存草稿成功!' : '发布成功!');
            if(getPurchased('already_purchased')!='true'){
              /*already_purchased 是否购买采购云*/
              window.location.href= pathTender+(type=='draft'?'/user/tender/draftpage':'/ltender/ultpage');
            }else {
              dispatch(
                routerRedux.push(type=='draft'?'/bid/materialDraft?radioValue=2':'/bid/labourList')
              );
            }
          } else {
            // message.info(type == 'draft' ? '保存草稿失败!' : '发布失败!');
          }
        });
      }
    });
  };
  // 点击预览
  handlePreview = (file, type) => {
    let Url = '';
    if (type == 'contract') {
      Url = file;
    } else {
      Url = file.url;
    }
    this.setState({
      previewImage: Url,
      previewVisible: true,
    });
  };
  changeShowModal = status => {
    this.setState({ showModal: status });
  };

  //截止日期
  disabledStartDate = closingDate => {
    const openDate =
      this.state.openDate ||
      moment()
        .add('days', 3)
        .calendar();
    const { actionType } = this.state;
    const {
      labour: { initData },
    } = this.props;
    if (!closingDate || !openDate) {
      return false;
    }
    //限制可选日期范围--3天之后的10天内
    return actionType == 'change'
      ? closingDate.isBefore(moment(Date.now()).add(initData.tenderCloseDate.minDays, 'days')) ||
          closingDate.isAfter(
            moment(Date.now()).add(
              initData.tenderCloseDate.maxDays + initData.tenderCloseDate.minDays,
              'days'
            )
          )
      : closingDate.isBefore(moment(Date.now()).add('days', 1));
    // return closingDate && closingDate < moment().add('day', 3);
  };

  disabledEndDate = openDate => {
    const closingDate = this.state.closingDate;
    if (!openDate || !closingDate) {
      return false;
    }
    return openDate.valueOf() < closingDate.valueOf();
  };
  onChangeWorkType = checkedList => {
    const { plainOptions } = this.state;
    let selectName = [];
    plainOptions.map(item => {
      checkedList.map((itemID, index) => {
        if (item.value == checkedList[index]) {
          selectName.push(item.label);
        }
      });
    });
    this.setState({
      checkAll: checkedList.length === plainOptions.length,
    });
    this.props.form.setFieldsValue({
      workType: checkedList,
      workTypeName: selectName,
    });
  };
  onCheckAllChange = e => {
    const { plainOptions } = this.state;
    let checkedALL = [],
      checkedALLName = [];
    plainOptions.map(item => {
      checkedALL.push(item.value);
      checkedALLName.push(item.label);
    });
    this.setState({ checkedList: e.target.checked ? checkedALL : [], checkAll: e.target.checked });
    this.props.form.setFieldsValue({
      workType: e.target.checked ? checkedALL.toString() : '',
      workTypeName: e.target.checked ? checkedALLName.toString() : '',
    });
  };
  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
    this.props.form.setFieldsValue({
      [field]: value,
    });
  };

  onStartChange = value => {
    this.onChange('closingDate', value);
    this.props.form.setFieldsValue({
      openDate: null,
    });
  };
  onEndChange = value => {
    this.onChange('openDate', value);
  };
  tenderWeight = (e, type) => {
    this.props.form.setFieldsValue(
      {
        scoreCompeteClause:
          parseFloat(this.props.form.getFieldValue(type) || 0) + parseFloat(e || 0),
      },
      () => {
        if (this.props.form.getFieldValue('scoreCompeteClause') !== 100) {
          this.setState({ validatorScore: true });
        } else {
          this.setState({ validatorScore: false });
        }
      }
    );
  };
  ProjectSelectionIsShow = isShow => {
    //传入ProjectSelection 对话框显示与关闭
    this.setState({
      platformSupplier: [],
      privateSupplier: [],
      ProjectSelectionVisible: isShow,
    });
    this.props.form.setFieldsValue({
      tenderType: '',
    });
  };
  ProjectSelectionOK = data => {
    //选中项目 确定时响应的函数
    this.setState({
      projectObj: Object.assign({}, data, { id: data.projectId }),
      agreementBidnoticePic: data.projectContractFiles!=""?(data.projectContractFiles).split(';'):[],
    });
    this.props.form.setFieldsValue({
      projectName: data.projectName,
      tenderCompanyName: data.tenderCompanyName,
      city: data.city,
      cityName: data.cityName,
      province: data.province,
      projectClass: data.projectClass,
      projectStartDay: data.projectStartDay,
      projectEndDay: data.projectEndDay,
      projectId: data.projectId,
    });
  };
  isDisabled = type => {
    const {
      labour: { initData, saveStatus },
    } = this.props;
    const { actionType } = this.state;
    let labourTender = {},
      isChange = false;
    if (actionType === 'change' && saveStatus) {
      labourTender = initData.labourTenderFields;
    }
    if (actionType === 'secondTender' && saveStatus) {
      labourTender = initData.labourTenderAgainFields;
    }
    for (let i in labourTender) {
      if (i == type) {
        isChange = labourTender[i] == 0;
      }
    }
    return isChange;
  };
  Ratio = type => {
    const { form } = this.props;
    let processPayment = parseFloat(form.getFieldValue('processPayment')); //进度款
    let advancePayment = parseFloat(form.getFieldValue('advancePayment')); //预付款
    let endPayment = parseFloat(form.getFieldValue('endPayment')); //进度款
    let qualityPayment = parseFloat(form.getFieldValue('qualityPayment') || 0); //质保金

    if (type == 'prepay') {
      if (advancePayment > processPayment || processPayment == advancePayment) {
        this.setState({ progressPayment: true, validatorCont: '进度款需大于预付款' });
        return false;
      }
      if (processPayment > 100) {
        this.setState({ progressPayment: true, validatorCont: '请输入小于100的合法数字' });
        return false;
      } else {
        this.setState({ progressPayment: false });
      }
    }
    if (type == 'accounts') {
      if (endPayment + qualityPayment != 100 && qualityPayment != 0) {
        this.setState({ sumPayment: true, validatorCont: '结算款和质保金之和需为100%' });
        return false;
      } else {
        this.setState({ sumPayment: false });
      }
    }
  };
  changeUploadStatus = (type)=>{
    let Files = this.state[type];
    Files.map((item)=>{
      item.status='done'
    });
    this.setState({
      [type]:Files,
    });
  };
  uploadTenderList = () => {
    this.state.tenderListFile.map(item => {
      //招标清单
      if (item.status == 'done') {
        if (!item.response.data.isvalid) {
          this.setState({
            validResultVisible: true,
            validResult: item.response.data.invalids,
          });
          this.props.form.setFieldsValue({
            tenderListFile: [],
          });
        } else {
          this.setState({
            tenderListJsonData: JSON.stringify({
              tableHeaders: item.response.data.tableHeaders,
              tenderList: item.response.data.tenderList,
            }),
          });
          message.success('清单上传成功!')
        }
      }
    });
  };

  getSelectSupplier = data => {
    //选择供应商(确定时)
    this.setState({
      platformSupplier: data.platformSupplier,
      privateSupplier: data.privateSupplier,
    });
    let privateIds = [],
      platformIds = [];
    if (data.privateSupplier != -1) {
      data.privateSupplier.map(item => {
        privateIds.push(item.id);
      });
    }
    if (data.platformSupplier != -1) {
      data.platformSupplier.map(item => {
        platformIds.push(item.id);
      });
    }
    this.props.form.setFieldsValue({
      //如果两项都为空时候将验证字段设置为空(tenderType:表单验证的字段)
      tenderType: data.platformSupplier == -1 ? 1 :data.platformSupplier.toString()==''?null: 0, //如果两项都为空时候将验证字段设置为空
      inviteCompanyIds: platformIds.toString(),
      isInvitationPrivateBid: data.privateSupplier == -1 ? 1 :data.privateSupplier.toString()==''?null: 0,
      privateAuthbusinessIds: privateIds.toString(),
    });
  };
  render() {
    const that = this;
    const { getFieldDecorator } = this.props.form;
    const {
      labour: { detail },
    } = this.props;
    const {
      scenePic,
      isAgreement,
      actionType,
      tenderListFile,
      previewVisible,
      showProtoclModal,
      previewImage,
      plainOptions,
      validatorScore,
      progressPayment,
      sumPayment,
      validatorCont,
      projectObj,
      isDraft,
      agreementBidnoticePic,
      showModal,
      platformSupplier,
      privateSupplier,
      isEndHour,
    } = this.state;
    const SaveBtn = actionType => {
      let btnDom;
      switch (actionType) {
        case 'change':
          btnDom = (
            <Button type="primary" htmlType="submit" onClick={e => this.handleSubmit(e, 'change')}>
              保存变更
            </Button>
          );
          break;
        case 'secondTender':
          btnDom = (
            <Button
              type="primary"
              onClick={e => this.handleSubmit(e, 'secondTender')}
              htmlType="submit"
              disabled={isAgreement}
            >
              二次招标
            </Button>
          );
          break;
        default:
          btnDom = (
            <div>
              <Button
                type="primary"
                onClick={e => this.handleSubmit(e, 'release')}
                htmlType="submit"
                disabled={isAgreement}
              >
                发布招标
              </Button>
              <Button
                type="default"
                htmlType="submit"
                onClick={e => this.handleSubmit(e, 'draft')}
                style={{ marginLeft: 15 }}
              >
                保存草稿
              </Button>
            </div>
          );
      }
      return btnDom;
    };
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        md: { span: 16 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 16 },
        sm: { span: 16, offset: 6 },
      },
    };
    return (
      <PageHeaderLayout>
        <Form
          onSubmit={this.handleSubmit}
          hideRequiredMark={false}
          style={{ marginTop: 8 }}
          className={Styles.bidMaterial}
        >
          <Card title={'填写劳务招标信息'} bordered={false}>
            <FormItem {...formItemLayout} label="项目名称">
              {getFieldDecorator('projectId', {
                initialValue: projectObj.projectId || null,
                rules: [
                  {
                    required: true,
                    message: '请选择项目!',
                  },
                ],
              })(
                <Button
                  type="primary"
                  hidden={actionType == 'change'}
                  onClick={this.ProjectSelectionIsShow.bind(this, true)}
                >
                  选择项目
                </Button>
              )}
              <div className={Styles.selectData}>
                {actionType != 'change' && projectObj.projectName ? (
                  <span>
                    {projectObj.projectName || null}{' '}
                    {/*<Icon
                      type="close"
                      onClick={() => {
                        this.setState({ projectObj: {} });
                        this.props.form.setFieldsValue({
                          projectId: '',
                        });
                      }}
                    />*/}
                  </span>
                ) : (
                  projectObj.projectName
                )}
              </div>
            </FormItem>
            <FormItem {...formItemLayout} label="招标单位">
              {getFieldDecorator('tenderCompanyName', {
                initialValue: projectObj.tenderCompanyName || null,
              })(<div>{projectObj.tenderCompanyName || '请选择项目'}</div>)}
            </FormItem>
            <FormItem {...formItemLayout} label="项目地址">
              {getFieldDecorator('province', {
                initialValue: projectObj.province || null,
              })(
                <div>
                  {projectObj.provinceName}
                  {projectObj.cityName || '请选择项目'}
                </div>
              )}
              {getFieldDecorator('city', {
                initialValue: projectObj.city || null,
              })(<Input type="hidden" />)}
              {getFieldDecorator('projectClass', {
                initialValue: projectObj.projectClass || null,
              })(<Input type="hidden" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="项目工期">
              {getFieldDecorator('projectStartDay', {
                initialValue: projectObj.projectStartDay || null,
              })(
                <div>
                  {projectObj.projectStartDay}
                  {!projectObj.projectEndDay || '~'}
                  {projectObj.projectEndDay || '请选择项目'}
                </div>
              )}
              {getFieldDecorator('projectEndDay', {
                initialValue: projectObj.projectEndDay || null,
              })(<Input type="hidden" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="中标通知书/施工合同">
              {getFieldDecorator('agreementBidnoticePic', {
                initialValue: agreementBidnoticePic,
              })(
                <div>
                  {agreementBidnoticePic.length > 0
                    ? agreementBidnoticePic.map((item, index) => {
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              this.handlePreview(item, 'contract');
                            }}
                            style={{
                              width: 100,
                              height: 100,
                              marginRight: 20,
                              marginTop: 5,
                              overflow: 'hidden',
                              float: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            <span style={{ display: 'block' }}>
                              <img
                                style={{ width: '100%', height: '100%' }}
                                src={item + '?x-oss-process=image/resize,w_100'}
                              />
                            </span>
                          </div>
                        );
                      })
                    : projectObj.tenderCompanyName==''?'请选择项目':'未上传'}
                </div>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="承包方式">
              {getFieldDecorator('contractWay', {
                initialValue: detail.contractWay || 0,
                rules: [
                  {
                    required: isDraft,
                    message: '请选择承包方式!',
                  },
                ],
              })(
                <RadioGroup disabled={this.isDisabled('contractWay')}>
                  <Radio value={0}>包清工</Radio>
                  <Radio value={1}>清工加辅料</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="工种">
              <div className="setBorder">
                <div style={{ borderBottom: '1px solid #E9E9E9' }}>
                  <Checkbox
                    onChange={this.onCheckAllChange}
                    disabled={this.isDisabled('workType')}
                    checked={this.state.checkAll}
                  >
                    全选
                  </Checkbox>
                </div>
                {getFieldDecorator('workType', {
                  initialValue: [],
                  rules: [
                    {
                      required: true,
                      message: '请选择工种!',
                    },
                  ],
                })(
                  <CheckboxGroup
                    options={plainOptions}
                    disabled={this.isDisabled('workType')}
                    // value={this.state.checkedList}
                    onChange={this.onChangeWorkType}
                  />
                )}
                {getFieldDecorator('workTypeName', {
                  initialValue: detail.workTypeName || null,
                })(<Input type="hidden" />)}
              </div>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="上传现场图片"
              extra={
                <div style={{ color: '#999' }}>注意：仅支持jpg、jpeg、gif、png格式,且不超过5M</div>
              }
            >
              {getFieldDecorator('scenePic', {
                initialValue: scenePic,
              })(
                <Upload
                  {...upLoadInit(
                    'file',
                    scenePic,
                    'picture-card',
                    'scenePic',
                    false,
                    true,
                    this,
                    '/base/attach/upload',
                    'LABOUR_TENDER_SCENEPIC'
                  )}
                  disabled={this.isDisabled('scenePic')}
                  fileList={this.state.scenePic}
                  onChange={e => uploadChange(e, 'scenePic', this)}
                  onPreview={this.handlePreview}
                  beforeUpload={e => beforeUpload(e, ['img'], 5)}
                  accept={'image/gif,image/jpeg,image/jpg,image/png,image/svg,image/tif'}
                >
                  {scenePic.length >= 3 ? null : <Icon type="upload" />}
                </Upload>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="招标文件"
              extra={<div style={{ color: '#999' }}>注意：仅支持doc、docx、pdf格式,且不超过5M</div>}
            >
              {getFieldDecorator('tenderFile', {
                initialValue: this.state.tenderFile || [],
              })(
                <div className={Styles.uploadBtn}>
                  <Upload
                    {...upLoadInit(
                      'file',
                      this.state.tenderFile,
                      'text',
                      'tenderFile',
                      true,
                      true,
                      this,
                      '/base/attach/upload',
                      'LABOUR_TENDER_FILE'
                    )}
                    accept={'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
                    onChange={e => uploadChange(e, 'tenderFile', this, true,()=>this.changeUploadStatus('tenderFile'))}
                    fileList={this.state.tenderFile}
                    data={{ name: 'tenderFile' }}
                    beforeUpload={e => beforeUpload(e, ['doc','pdf'], 5)}

                  >
                    <Button disabled={this.isDisabled('tenderFile')}>
                      <Icon type="upload" /> 选择文件
                    </Button>
                  </Upload>
                  <span>
                    可下载{' '}
                    <a href={pathPurchase + '/file/download/template?path=劳务招标文件.docx'}>
                      招标文件模板
                    </a>
                  </span>
                </div>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="招标清单"
              extra={
                <div style={{ color: '#999' }}>
                  提示：请使用平台招标清单模板，可生成报价清单汇总对比表
                </div>
              }
            >
              {getFieldDecorator('tenderListFile', {
                initialValue: this.state.tenderListFile || [],
                rules: [
                  {
                    required: isDraft,
                    message: '请选择上传招标清单',
                  },
                ],
              })(
                <div className={Styles.uploadBtn}>
                  <Upload
                    uid="-1"
                    action={pathPurchase + '/tenderBidList/uploadTenderList'}
                    name="file"
                    headers={{ 'X-Requested-With': 'XMLHttpRequest', 'gzy-token': getCookie() }}
                    multiple={true}
                    showUploadList={true}
                    defaultFileList={this.state.tenderListFile}
                    accept={'accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
                    onRemove={file => {
                      let id = null;
                      that.state.tenderListFile.map((item, i) => {
                        if (item.uid == file.uid) {
                          if (getUrlParamBySearch(window.location.href, 'tenderId')) {
                            id = item.uid;
                          } else {
                            id = item.response.data.attach.id;
                          }
                        } else {
                          return;
                        }
                      });
                      this.props
                        .dispatch({
                          type: 'common/deleteAttachList',
                          payload: {
                            buzId: 'LABOUR_TENDER_TENDER_LIST_FILE',
                            id: id,
                          },
                        })
                        .then(() => {
                          // 页面删除显示
                          let _index = null;
                          let newFileList = this.state.tenderListFile;
                          const {
                            common: { DeleteStatus },
                          } = this.props;

                          if (DeleteStatus) {
                            newFileList.splice(_index, 1);
                            return this.setState({
                              tenderListFile: newFileList,
                            });
                          }
                        });
                    }}
                    onChange={e => uploadChange(e, 'tenderListFile', this, true, this.uploadTenderList)}
                    fileList={this.state.tenderListFile}
                    data={{ name: 'tenderListFile', attachCode: 'LABOUR_TENDER_TENDER_LIST_FILE' }}
                    beforeUpload={e => beforeUpload(e, ['xls'], 5)}
                  >
                    <Button disabled={this.isDisabled('tenderListFile')}>
                      <Icon type="upload" /> 选择文件
                    </Button>
                  </Upload>
                  <span>
                    可下载{' '}
                    <a href={pathPurchase + '/file/download/template?path=劳务招投标清单.xlsx'}>
                      招标清单模板
                    </a>
                  </span>
                  <span style={{ display: isfalse(tenderListFile) ? 'none' : null }}>
                    <a
                      href="javascript:void(0)"
                      onClick={() => this.setState({ TenderListVisible: true })}
                    >
                      预览
                    </a>
                  </span>
                </div>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="其它附件"
              extra={<div style={{ color: '#999' }}>注意：可上传多个任意格式文件,且不超过50M</div>}
            >
              {getFieldDecorator('otherFiles', {
                initialValue: this.state.otherFiles || [],
                rules: [
                  {
                    required: false,
                    message: '请选择上传其它附件',
                  },
                ],
              })(
                <div className={Styles.uploadBtn}>
                  <Upload
                    {...upLoadInit(
                      'file',
                      this.state.otherFiles,
                      '',
                      'otherFiles',
                      true,
                      true,
                      this,
                      '/base/attach/upload',
                      'LABOUR_TENDER_OTHER_FILES'
                    )}
                    fileList={this.state.otherFiles}
                    onChange={e => uploadChange(e, 'otherFiles', this,false,()=>this.changeUploadStatus('otherFiles'))}
                    data={{ name: 'otherFiles' }}
                    beforeUpload={e => beforeUpload(e, ['all'], 50)}
                  >
                    <Button disabled={this.isDisabled('otherFiles')}>
                      <Icon type="upload" /> 选择文件
                    </Button>
                  </Upload>
                </div>
              )}
            </FormItem>
            {(() => {
              if (actionType == 'change') {
                return (
                  <FormItem
                    {...formItemLayout}
                    label="澄清文件"
                    extra={<div style={{ color: '#999' }}>提示：变更记录</div>}
                  >
                    {getFieldDecorator('clarifyFiles', {
                      initialValue: this.state.clarifyFiles || [],
                      rules: [
                        {
                          required: true,
                          message: '请上传澄清文件!',
                        },
                      ],
                    })(
                      <div className={Styles.uploadBtn}>
                        <Upload
                          {...upLoadInit(
                            'file',
                            this.state.clarifyFiles,
                            '',
                            'clarifyFiles',
                            false,
                            true,
                            this,
                            '/base/attach/upload',
                            'LABOUR_TENDER_CLARIFY_FILES'
                          )}
                          onChange={e => uploadChange(e, 'clarifyFiles', this, true,()=>this.changeUploadStatus('clarifyFiles'))}
                          fileList={this.state.clarifyFiles}
                          data={{ name: 'clarifyFiles' }}
                          beforeUpload={e => beforeUpload(e, ['all'], 5)}
                        >
                          <Button disabled={this.isDisabled('clarifyFiles')}>
                            <Icon type="upload" /> 选择文件
                          </Button>
                        </Upload>
                        <span />
                      </div>
                    )}
                  </FormItem>
                );
              } else {
                return null;
              }
            })()}
            <FormItem {...formItemLayout} label="施工图纸下载地址">
              {getFieldDecorator('constructionDrawings', {
                initialValue: detail.constructionDrawings || null,
                rules: [
                  {
                    pattern: /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/,
                    message: '请输入正确的下载地址!',
                  },
                ],
              })(
                <Input
                  style={{ width: 350 }}
                  disabled={this.isDisabled('constructionDrawings')}
                  placeholder="请输入下载地址"
                />
              )}
            </FormItem>
          </Card>
          <br />
          <Card title={'招标设置'} bordered={false}>
            <FormItem {...formItemLayout} label="是否让投标方修改条款">
              {getFieldDecorator('isAllowBidUpdate', {
                initialValue: detail.isAllowBidUpdate || 0,
                rules: [
                  {
                    required: isDraft,
                    message: '请选是否允许修改条款!',
                  },
                ],
              })(
                <RadioGroup disabled={this.isDisabled('isAllowBidUpdate')}>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={<span>{privateSupplier.length>0||privateSupplier==-1?<span style={{ color: 'red', marginRight: 4, fontFamily: 'SimSun' }}>*</span>:null}邀请投标单位</span>}>
              {getFieldDecorator('tenderType', {
                initialValue: detail.tenderType || null,
                rules: [
                  {
                    required: privateSupplier.length>0||privateSupplier==-1?false:isDraft,
                    message: '请选择供应商',
                  },
                ],
              })(
                <Button
                  type="primary"
                  disabled={isfalse(projectObj.tenderCompanyName)}
                  onClick={() => {
                    this.setState({ showModal: true });
                  }}
                >
                  选择供应商
                </Button>
              )}
              {privateSupplier == -1 && platformSupplier == -1 ? (
                <div>已选择全部供应商,公开招标</div>
              ) : (
                <div>
                  <div>
                    <span>
                      {isfalse(privateSupplier)
                        ? null
                        : privateSupplier == -1
                          ? '已选择全部个人供应商,公开招标'
                          : '已选择个人供应商,定向招标(' + privateSupplier.length + ')'}
                    </span>
                    {!isfalse(privateSupplier) && privateSupplier != -1 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {privateSupplier.map((item, index) => {
                          return (
                            <div className={Styles.selectData} key={index}>
                              <span>
                                {/* {item.name}<Icon type="close" /> */}
                                {item.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <span>
                      {isfalse(platformSupplier)
                        ? null
                        : platformSupplier == -1
                          ? '已选择全部平台供应商,公开招标'
                          : '已选择平台供应商库,定向招标(' + platformSupplier.length + ')'}
                    </span>
                    {platformSupplier != -1 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {platformSupplier.map((item, index) => {
                          return (
                            <div className={Styles.selectData} key={index}>
                              <span>{item.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
              {getFieldDecorator('privateAuthbusinessIds')(<Input type="hidden" />)}
              {getFieldDecorator('isInvitationPrivateBid')(<Input type="hidden" />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="截止日期"
              validateStatus={isEndHour ? 'error' : null}
              help={isEndHour ? '截止时间不能为空' : ''}
            >
              {getFieldDecorator('closingDate', {
                initialValue: detail.closingDate
                  ? moment(format(detail.closingDate, 'YYYY-MM-DD'), 'YYYY-MM-DD')
                  : null,
                rules: [
                  {
                    required: isDraft,
                    message: '请选择截止日期!',
                  },
                ],
              })(
                <DatePicker
                  disabledDate={this.disabledStartDate}
                  format="YYYY-MM-DD"
                  //disabled={this.isDisabled('closingDate')}
                  placeholder="请选择截止日期"
                  onChange={this.onStartChange}
                />
              )}
              <span style={{ marginLeft: 10 }}>
                {getFieldDecorator('closingHour', {
                  initialValue: detail.closingHour ? moment(detail.closingHour, 'HH:00') : null,
                  rules: [
                    {
                      required: isDraft,
                      message: '选择截止时间',
                    },
                  ],
                })(
                  <TimePicker
                    format="HH:00"
                    showTime
                    open={this.state.closeTimePicker}
                    onOpenChange={open => this.setState({ closeTimePicker: open })}
                    onChange={() => this.setState({ closeTimePicker: false })}
                    placeholder="选择截止时间"
                  />
                )}
              </span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="开标日期"
              extra={<div style={{ color: '#999' }}>提示：开标日期为上传合同的最晚日期</div>}
            >
              {getFieldDecorator('openDate', {
                initialValue: detail.openDate
                  ? moment(format(detail.openDate, 'YYYY-MM-DD'), 'YYYY-MM-DD')
                  : null,
                rules: [
                  {
                    required: isDraft,
                    message: '请选择开标日期!',
                  },
                ],
              })(
                <DatePicker
                  disabledDate={this.disabledEndDate}
                  format="YYYY-MM-DD"
                  disabled={this.isDisabled('openDate')}
                  placeholder="请选择开标日期"
                  onChange={this.onEndChange}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="是否总价包干"
                      extra={<div style={{ color: '#999' }}>注意！本招标采取总价包干模式！投标方在交标前，必须仔细阅读和充分理解发标方的所有资料和需求，交标后不得以漏项为理由增加投标总价。</div>}
            >
              {getFieldDecorator('allWork', {
                initialValue: detail.allWork || 1,
                rules: [
                  {
                    required: isDraft,
                    message: '请选择!',
                  },
                ],
              })(
                <RadioGroup  disabled={this.isDisabled('allWork')}>
                  <Radio value={1}>是</Radio>
                  <Radio value={2}>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="付款条款">
              <i
                className="ant-form-item-required"
                style={{
                  position: 'absolute',
                  left: '-80px',
                  display: 'block',
                  fontStyle: 'inherit',
                }}
              >
                {' '}
              </i>
              <FormItem style={{ marginBottom: 0, display: 'inline-block',marginRight:15 }}>
                预付款支付合同金额的
                {getFieldDecorator('advancePayment', {
                  initialValue: detail.advancePayment || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入付款条款',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 160, margin: '0 5px' }}
                    max={100}
                    min={1}
                    precision={0}
                    addonAfter="%"
                    parser={value => value.replace('-', '')}
                    onKeyUp={e => this.Ratio('prepay')}
                    placeholder="请输入百分比"
                  />
                )}{' '}
                %<br />
              </FormItem>
              <FormItem
                style={{ marginBottom: 0, display: 'inline-block' }}
                validateStatus={progressPayment ? 'error' : null}
                help={progressPayment ? validatorCont : ''}
              >
                进度款支付已完成工作量价格的
                {getFieldDecorator('processPayment', {
                  initialValue: detail.processPayment || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入付款条款',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 160, margin: '0 5px' }}
                    max={100}
                    min={1}
                    precision={0}
                    addonAfter="%"
                    parser={value => value.replace('-', '')}
                    onKeyUp={e => this.Ratio('prepay')}
                    placeholder="请输入百分比"
                  />
                )}{' '}
                %
              </FormItem>
              <FormItem style={{ marginBottom: 0, display: 'inline-block',marginRight:15 }}>
                结算款付至结算金额的
                {getFieldDecorator('endPayment', {
                  initialValue: detail.endPayment || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入付款条款',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 160, margin: '0 5px' }}
                    addonAfter="%"
                    max={100}
                    min={1}
                    precision={0}
                    parser={value => value.replace('-', '')}
                    onKeyUp={e => this.Ratio('accounts')}
                    placeholder="请输入百分比"
                  />
                )}{' '}
                %<br />
              </FormItem>
              <FormItem
                style={{ marginBottom: 0, display: 'inline-block' }}
                validateStatus={sumPayment ? 'error' : ''}
                help={sumPayment ? validatorCont : ''}
              >
                质保金款为结算金额的
                {getFieldDecorator('qualityPayment', {
                  initialValue: detail.qualityPayment || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入付款条款',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 160, margin: '0 5px' }}
                    addonAfter="%"
                    max={100}
                    min={1}
                    precision={0}
                    parser={value => value.replace('-', '')}
                    onKeyUp={e => this.Ratio('accounts')}
                    placeholder="请输入百分比"
                  />
                )}{' '}
                %
              </FormItem>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="投标得分权重设置"
              validateStatus={validatorScore ? 'error' : null}
              help={validatorScore ? '得分权重两项相加之和须为100' : ''}
              extra={!validatorScore?<div style={{ color: '#999' }}>注意：两项相加之和须为100%</div>:''}
            >
              {getFieldDecorator('scorePrice', {
                initialValue: detail.scorePrice || null,
                rules: [
                  {
                    required: isDraft,
                    message: '请输入付款条款',
                  },
                ],
              })(
                <InputNumber
                  style={{ width: 160 }}
                  onChange={e => this.tenderWeight(e, 'scoreAchievement')}
                  max={100}
                  min={1}
                  precision={0}
                  placeholder="价格权重"
                  parser={value => value.replace('-', '')}
                  disabled={this.isDisabled('scoreWeight')}
                />
              )}{' '}
              %
              <span>
                <Icon type="plus" />
                {getFieldDecorator('scoreAchievement', {
                  initialValue: detail.scoreAchievement || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入付款条款',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 160 }}
                    onChange={e => this.tenderWeight(e, 'scorePrice')}
                    max={100}
                    min={1}
                    precision={0}
                    parser={value => value.replace('-', '')}
                    placeholder="近三年5大工程业绩权重"
                    disabled={this.isDisabled('scoreWeight')}
                  />
                )}{' '}
                %
              </span>
              <span>
                <Icon type="pause" />
                {getFieldDecorator('scoreCompeteClause', {
                  initialValue: detail.scoreAchievement?(detail.scoreAchievement + detail.scorePrice):null,
                })(
                  <Input disabled={true} style={{ width: 160 }} type="number" placeholder="总和" />
                )}{' '}
                %
              </span>
            </FormItem>
            <FormItem {...formItemLayout} label="最高限价">
              {getFieldDecorator('priceCeiling', {
                initialValue: detail.priceCeiling || null,
              })(
                <InputNumber
                  placeholder="请输入最高限价"
                  style={{ width: 160 }}
                  max={1000000000}
                />
              )} 元
            </FormItem>
            <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                initialValue: detail.remark
                  ? detail.remark.replace(/<br\/>/g, '\n').replace(/\&nbsp\;/g, ' ')
                  : null,
                rules: [
                  {
                    required: false,
                    message: '请输入备注!',
                  },
                ],
              })(
                <TextArea
                  disabled={this.isDisabled('remark')}
                  style={{ width: '350px' }}
                  placeholder="请输入备注"
                  rows={4}
                />
              )}
            </FormItem>
          </Card>
          <br />
          <Card title={'联系方式'} bordered={false}>
            <FormItem {...formItemLayout} label="联系人">
              {getFieldDecorator('contactName', {
                initialValue: detail.contactName || null,
                rules: [
                  {
                    required: isDraft,
                    message: '请输入联系人',
                  },
                ],
              })(
                <Input
                  disabled={this.isDisabled('contactName')}
                  placeholder="请输入联系人"
                  style={{ width: 350 }}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="手机号">
              {getFieldDecorator('cellphoneNumber', {
                initialValue: detail.cellphoneNumber || null,
                rules: [
                  {
                    required: isDraft,
                    message: '请输入手机号',
                  },
                  {
                    pattern: /^[1][3,4,5,7,8][0-9]{9}$/,
                    message: '请输入正确格式的手机号码',
                  },
                ],
              })(
                <Input
                  placeholder="请输入手机号"
                  disabled={this.isDisabled('cellphoneNumber')}
                  style={{ width: 350 }}
                />
              )}
              {getFieldDecorator('showPhone', {
                initialValue: detail.showPhone || 0,
              })(
                <RadioGroup style={{ marginLeft: 30 }} disabled={this.isDisabled('showPhone')}>
                  <Radio value={1}>公开</Radio>
                  <Radio value={0}>隐藏</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="QQ">
              {getFieldDecorator('qqNumber', {
                initialValue: detail.qqNumber || null,
                rules: [
                  {
                    required: false,
                    message: '请输入QQ号',
                  },
                ],
              })(
                <Input
                  disabled={this.isDisabled('qqNumber')}
                  placeholder="请输入QQ号"
                  style={{ width: 350 }}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="邮箱">
              {getFieldDecorator('email', {
                initialValue: detail.email || null,
                rules: [
                  {
                    type: 'email',
                    message: '请输入正确的邮箱地址!',
                  },
                  {
                    required: false,
                    message: '请输入邮箱',
                  },
                ],
              })(
                <Input
                  disabled={this.isDisabled('email')}
                  placeholder="请输入邮箱"
                  style={{ width: 350 }}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="微信号">
              {getFieldDecorator('wechat', {
                initialValue: detail.wechat || null,
                rules: [
                  {
                    required: false,
                    message: '请输入微信号',
                  },
                ],
              })(
                <Input
                  disabled={this.isDisabled('wechat')}
                  placeholder="请输入微信号"
                  style={{ width: 350 }}
                />
              )}
            </FormItem>
            <FormItem {...submitFormLayout}>
              {getFieldDecorator('agreement', {
                initialValue: true,
                valuePropName: 'checked',
              })(
                <p>
                  <Checkbox
                    checked={!isAgreement}
                    onClick={e => {
                      this.setState({ isAgreement: !e.target.checked });
                    }}
                  >
                    我已阅读
                  </Checkbox>
                  <a
                    onClick={() => {
                      this.setState({ showProtoclModal: true });
                    }}
                  >
                    《公装云招投标交易协议》
                  </a>
                  ,并同意此交易条款
                </p>
              )}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              {SaveBtn(actionType)}
            </FormItem>
          </Card>
        </Form>
        <ProjectSelection
          isShow={this.ProjectSelectionIsShow}
          onOK={this.ProjectSelectionOK}
          auditState={projectObj.auditState}
          visible={this.state.ProjectSelectionVisible}
        />
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => this.setState({ previewVisible: false })}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
        <Modal
          title={'公装云招投标交易协议'}
          visible={showProtoclModal}
          onCancel={() => this.setState({ showProtoclModal: false })}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={() => this.setState({ showProtoclModal: false })}
            >
              确认
            </Button>,
          ]}
        >
          <Protocl />
        </Modal>
        {this.state.validResultVisible ? (
          <ValidResult
            visible={this.state.validResultVisible}
            onCancel={() => {
              this.setState({ validResultVisible: false, tenderListFile: [] });
            }}
            validRecords={this.state.validResult}
          />
        ) : null}

        <Modal
          title={'查看材料清单'}
          visible={this.state.TenderListVisible}
          // onOk={()=>this.setState({TenderListVisible:false})}
          onCancel={() => this.setState({ TenderListVisible: false })}
          footer={null}
          destroyOnClose={true}
          width={800}
        >
          <TenderList tenderListJsonData={this.state.tenderListJsonData} />
        </Modal>
        <SelectSupplier
          visible={showModal}
          isAuthentication={projectObj.auditState == 1}
          id={projectObj.id}
          changeModal={status => this.changeShowModal(status)}
          defaultValue={{
            platformSupplier: this.state.platformSupplier,
            privateSupplier: this.state.privateSupplier,
          }}
          tenderType="0"
          onOk={this.getSelectSupplier}
          isPurchased={getPurchased('already_purchased')}
        />
      </PageHeaderLayout>
    );
  }
}
