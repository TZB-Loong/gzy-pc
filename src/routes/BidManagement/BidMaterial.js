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
  Button,
  TimePicker,
  Radio,
  DatePicker,
  Checkbox,
  Row,
  Col,
  message,
  InputNumber,
  Modal,
} from 'antd';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';
import { getUrlParamBySearch, getCookie,getPurchased } from '../../utils/utils';
import {  pathPurchase,PurchaseBoot } from '../../../configPath';
import moment from 'moment';
import Styles from './style.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SupplierList from '../Common/SelectSupplier';
import MaterialSort from '../Common/MaterialSort';
import { format } from '../../utils/dateFormat';
import TenderList from './TenderList'; // 招标清单
import { isfalse } from '../../Tools/util_tools';
import ValidResult from '../Common/ValidResult';
import Protocl from '../Common/Protocl';
import ProjectSelection from './ProjectSelection';
import {pathRequest,pathTender} from '../../../configPath';

const { TextArea } = Input;
const RadioGroup = Radio.Group;
const Search = Input.Search;
const Option = Select.Option;
const FormItem = Form.Item;

@Form.create()
@connect(({ material, myProjectModel, common, loading }) => ({
  material,
  myProjectModel,
  common,
  loading,
}))
export default class BidMaterial extends Component {
  state = {
    endDate: moment()
      .subtract(-3, 'days')
      .format('YYYY-MM-DD'),
    showModal: false,
    closeTimePicker: false,
    showProtoclModal: false,
    validResultVisible: false,
    validResult: [],
    TenderListVisible: false,
    validatorScore: false,
    sumPayment: false,
    progressPayment: false,
    validatorCont: '',
    previewVisible: false,
    isAgreement: false,
    isEndHour: false,
    isDraft: true, //必填验证
    openDate: null,
    fileList: [],
    materialSamples: [],
    contractImg: [],
    otherAttachment: [],
    materialScales: [],
    tenderFile: [],
    tenderList: [],
    clarifyFiles: [], //澄清文件
    noteList: [],
    sort: [],
    sortName: [],
    previewImage: '',
    tenderType: 1,
    projectObj: {
      id: null,
      tenderCompanyId: null,
      tenderCompanyName: '',
      projectName: '',
      projectClass: null,
      province: '',
      city: '',
      projectStartDay: null,
      projectEndDay: null,
      projectId: '',
      key: null,
      projectContractFiles: '',
    },
    platformSupplier: [],
    privateSupplier: [],
    ProjectSelectionVisible: false, //项目选择弹框显示
    actionType: getUrlParamBySearch(window.location.href, 'action')||'',
    mallUrl: getUrlParamBySearch(window.location.href, 'jumpPath'),
  };
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'material/clear',
    });
  }

  componentDidMount() {
    const { dispatch, material } = this.props;
    let id = getUrlParamBySearch(window.location.href, 'tenderId'),that=this;
    const projectId = getUrlParamBySearch(window.location.href, 'projectId');

    //初始化配置
    dispatch({
      type: 'material/materialInitConfig',
    }).then(() => {
      const {
        material: { initData },
      } = this.props;
      this.setState({
        materialScales: initData.materialScales || [],
        // checkAll:initData.workType.length===this.state.plainOptions.length,
      });
    });
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
    if (id) {
      dispatch({
        type: 'material/getMaterialTender',
        payload: { tenderId: id },
      }).then(() => {
        const {
          material: { detail },
        } = this.props;
        let project = this.state.projectObj;
        project.id = detail.project.id;
        project.projectName = detail.projectName;
        project.cityName = detail.cityText;
        project.auditState = detail.project.auditState;
        project.city = detail.city;
        project.province = detail.province;
        project.tenderCompanyName = detail.tenderCompanyName;
        project.provinceName = detail.provinceText;
        project.projectStartDay = format(detail.projectStartDay, 'YYYY-MM-DD');
        project.projectEndDay = format(detail.projectEndDay, 'YYYY-MM-DD');
        this.setState({
          ...project,
          userId: detail.addUserId,
          tenderType:detail.tenderType,
          tenderListJsonData: detail.tenderListJsonData,
          contractImg: detail.project.projectContractFiles!=""?(detail.project.projectContractFiles).split(';'):[],
          privateSupplier:
            detail.isInvitationPrivateBid == null
              ? []
              : detail.isInvitationPrivateBid == 0
                ? detail.privateAuthbusinessJson
                  ? JSON.parse(detail.privateAuthbusinessJson)
                  : []
                : -1,
          platformSupplier:
            detail.isInvitationBid == null
              ? []
              : detail.isInvitationBid == 0
                ? detail.authbusinessJson
                  ? JSON.parse(detail.authbusinessJson)
                  : []
                : -1,
        });
        this.props.form.setFieldsValue({
          projectId: detail.projectId,
          tenderCompanyName: detail.tenderCompanyName,
          isInvitationPrivateBid: detail.isInvitationPrivateBid,
          isInvitationBid: detail.isInvitationBid,
          authbusinessIds: detail.authbusinessIds,
          privateAuthbusinessIds: detail.privateAuthbusinessIds,
        });
      });
      dispatch({
        type: 'common/queryAttachList',
        payload: { bizCode: 'MATERIAL_TENDER', bizId: id },
      }).then(() => {
        let fileData = [],
          tenderFileData = [],
          otherFilesData = [],
          ListFileData = [];
        (this.props.common.filesPath.data
          ? this.props.common.filesPath.data.attachmentVOList
          : []
        ).map((item, i) => {
          if (item.ctrlName == 'MATERIAL_TENDER_SAMPLE') {
            fileData.push({
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
              uid: item.id,
              fileType: item.fileType,
              status: 'result',
            });
          }
          if (item.ctrlName == 'MATERIAL_TENDER_FILE') {
            tenderFileData.push({
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
              uid: item.id,
              fileType: item.fileType,
              status: 'result',
            });
          }
          if (item.ctrlName == 'MATERIAL_TENDER_OTHER_FILES') {
            otherFilesData.push({
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
              uid: item.id,
              fileType: item.fileType,
              status: 'result',
            });
          }
          if (item.ctrlName == 'MATERIAL_TENDER_LIST_FILE') {
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
          materialSamples: fileData, //现场图片
          otherAttachment: otherFilesData, //其它附件
          tenderList: ListFileData, //清单
          tenderFile: tenderFileData, //招标文件
        });
      });
    }
  }
  //招标类型
  tenderType = e => {
    this.setState({ tenderType: e.target.value });
  };

  ProjectSelectionIsShow = isShow => {
    //传入ProjectSelection 对话框显示与关闭
    this.setState({
      ProjectSelectionVisible: isShow,
    });
  };
  ProjectSelectionOK = data => {
    //选中项目 确定时响应的函数
    this.setState({
      projectObj: Object.assign({}, data, { id: data.projectId }),
      platformSupplier: [],
      privateSupplier: [],
      contractImg: data.projectContractFiles!=''?data.projectContractFiles.split(';'):[],
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
      isInvitationBid: '',
    });
  };
  getSelectSupplier = data => {
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
    console.log(data)
    console.log(data.platformSupplier.toString()==''&&data.privateSupplier.toString()=='')
    this.props.form.setFieldsValue({
      //如果两项都为空时候将验证字段设置为空(isInvitationBid:表单验证的字段)
      isInvitationBid: data.platformSupplier == -1 ? 1 :data.platformSupplier.toString()==''?null: 0,
      authbusinessIds: platformIds.toString(),
      isInvitationPrivateBid: data.privateSupplier == -1 ? 1 :data.privateSupplier.toString()==''?null: 0,
      privateAuthbusinessIds: privateIds.toString(),
    });
  };
  // 点击预览
  handlePreview = (file, type) => {
    let Url = '';
    if (type == 'contract') {
      Url = file;
    } else {
      Url = file.response.data.fullFilename;
    }
    this.setState({
      previewImage: Url,
      previewVisible: true,
    });
  };
  formValidate = type => {
    const { form, dispatch } = this.props;
    const { actionType } = this.state;
    /*form.getFieldValue({
     sort:this.state.sort,
     });*/
    form.validateFieldsAndScroll((err, values) => {
      // values.sort = this.state.sort;
      console.log(values)
      // console.log('type:'+type)
      values.action = type;
      if (type != 'draft') {
        if (!values.endHour) {
          this.setState({ isEndHour: true });
        } else {
          this.setState({ isEndHour: false });
        }
      }
      if (!err) {
        values.attachments = [];
        let fileData = [],
          tenderFileData = [],
          otherFilesData = [],
          ListFileData = [],
          clarifyFilesData = [];
        values.materialSamples
          ? values.materialSamples.map(item => {
              //现场图片
              if (item.status === 'done') {
                if(item.response.status=='200'){
                  fileData.push(item.response.data.id);
                }
              }
              if (item.status === 'result') {
                fileData.push(item.uid);
              }
            })
          : values.materialSamples.map(item => {
              if (item.status === 'result') {
                fileData.push(item.uid);
              }
            });
        {
          actionType == 'change'
            ? values.clarifyFiles.map(item => {
                //澄清文件
                if (item.status === 'done') {
                  clarifyFilesData.push(item.response.data.id);
                }
                if (item.status === 'result') {
                  clarifyFilesData.push(item.uid);
                }
              })
            : null;
        }
        values.tenderFile.map(item => {
          //招标文件
          if (item.status === 'done') {
            tenderFileData.push(item.response.data.id);
          }
          if (item.status === 'result') {
            tenderFileData.push(item.uid);
          }
        });
        values.otherAttachment.map(item => {
          //其它附件
          if (item.status === 'done' && !isfalse(item.response)) {
            otherFilesData.push(item.response.data.id);
          }
          if (item.status === 'result') {
            otherFilesData.push(item.uid);
          }
        });
        values.tenderList.map(item => {
          //招标清单MATERIAL_TENDER_TENDER_LIST_FILE
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
        values.projectName = this.state.projectObj.projectName;
        values.materialTenderId = getUrlParamBySearch(window.location.href, 'tenderId') || '';
        values.categoryText = values.categoryText.toString();
        values.contractImg = values.contractImg.toString();
        values.remark = values.remark
          ? values.remark.replace(/\r{0,}\n/g, '<br/>').replace(/\s/g, '&nbsp;')
          : null;
        values.endHour = values.endHour ? moment(values.endHour).format('HH') : null; // 九月
        values.attachParams = JSON.stringify([
          { attachCode: 'MATERIAL_TENDER_SAMPLE', attachIds: fileData.toString() }, //材料样板
          { attachCode: 'MATERIAL_TENDER_FILE', attachIds: tenderFileData.toString() }, //招标文件
          { attachCode: 'MATERIAL_TENDER_OTHER_FILES', attachIds: otherFilesData.toString() }, //其它附件
          { attachCode: 'MATERIAL_TENDER_LIST_FILE', attachIds: ListFileData.toString() }, //清单
          { attachCode: 'MATERIAL_TENDER_CLARIFY_FILES', attachIds: clarifyFilesData.toString() }, //澄清文件
        ]);
        dispatch({
          type: 'material/saveMaterialTender',
          payload: values,
        }).then(() => {
          const { material } = this.props;
          if (material.saveStatus) {
            message.success(type === 'draft' ? '保存草稿成功!' :type === 'release'? '发布成功!':'变更成功!');
            if(getPurchased('already_purchased')!='true'){
              /*already_purchased 是否购买采购云*/
              window.location.href= pathTender+(type=='draft'?'/user/tender/draftpage':'/user/mytender');
            }else {
              dispatch(
                routerRedux.push(type == 'draft' ? `/bid/materialDraft` : `/bid/materialList`)
              );
            }
          } else {
            // message.info(type=='draft'?'保存草稿失败!':'发布失败!')
          }
        });
      }
    });
  };
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
              'tenderList',
              'allowPartialBid',
              'contractImg',
              'mainMaterial',
              'endDate',
              'endHour',
              'openDate',
              'supplyCycle',
              'prePaymentRatio',
              'progressPaymentRatio',
              'scale',
              'finalPaymentRatio',
              'quality',
              'scorePrice',
              'scoreLeadTime',
              'scoreCompeteClause',
              'scoreAchievement',
              'completePaymentRatio',
              'contact',
              'ticketType',
              'phone',
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
              'tenderList',
              'allowPartialBid',
              'contractImg',
              'mainMaterial',
              'endDate',
              'endHour',
              'openDate',
              'supplyCycle',
              'prePaymentRatio',
              'progressPaymentRatio',
              'scale',
              'finalPaymentRatio',
              'quality',
              'scorePrice',
              'ticketType',
              'scoreLeadTime',
              'scoreCompeteClause',
              'scoreAchievement',
              'completePaymentRatio',
              'contact',
              'phone',
              'allWork',
            ],
            { force: true }
          );
          this.Ratio('prepay'); //验证付款条款
          this.Ratio('accounts'); //验证付款条款
          this.formValidate(type);
          this.tenderWeight();
        }
      );
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
    this.state.tenderList.map(item => {
      //招标清单
      if (item.status == 'done') {
        if (!item.response.data.isvalid) {
          this.setState({
            validResultVisible: true,
            validResult: item.response.data.invalids,
          });
        } else {
          this.setState({
            tenderListJsonData: JSON.stringify({
              tableHeaders: item.response.data.tableHeaders,
              tenderList: item.response.data.tenderList,
            }),
          });

          message.success(`文件上传成功!`);
        }
      }
    });
  };
  //截止日期
  disabledStartDate = endDate => {
    const openDate =
      this.state.openDate ||
      moment()
        .add('days', 3)
        .calendar();
    const { actionType } = this.state;
    const {
      material: { initData },
    } = this.props;
    if (!endDate || !openDate) {
      return false;
    }
    return actionType == 'change'
      ? endDate.isBefore(moment(Date.now()).add(initData.tenderCloseDate.minDays, 'days')) ||
          endDate.isAfter(
            moment(Date.now()).add(
              initData.tenderCloseDate.maxDays + initData.tenderCloseDate.minDays,
              'days'
            )
          )
      : endDate.isBefore(moment(Date.now()).add('days', 1));
    // return endDate && endDate < moment().add('day', 3);
  };
  disabledEndDate = openDate => {
    const endDate = this.state.endDate;
    if (!openDate || !endDate) {
      return false;
    }
    // return openDate && endDate < moment().endOf('day');
    return openDate.valueOf() <= endDate.valueOf();
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
    this.onChange('endDate', value);
    this.props.form.setFieldsValue({
      openDate: null,
    });
  };

  onEndChange = value => {
    this.onChange('openDate', value);
  };

  changeShowModal = status => {
    this.setState({ showModal: status });
  };
  tenderWeight = () => {
    const { form } = this.props;
    setTimeout(() => {
      form.setFieldsValue(
        {
          subScore:
            parseFloat(form.getFieldValue('scorePrice') || 0) +
            parseFloat(form.getFieldValue('scoreAchievement') || 0) +
            parseFloat(form.getFieldValue('scoreCompeteClause') || 0) +
            parseFloat(form.getFieldValue('scoreLeadTime') || 0),
        },
        () => {
          if (form.getFieldValue('subScore') !== 100) {
            this.setState({ validatorScore: true });
          } else {
            this.setState({ validatorScore: false });
          }
        }
      );
    }, 100);
  };
  Ratio = type => {
    const { form } = this.props;
    let progressPaymentRatio = parseFloat(form.getFieldValue('progressPaymentRatio')); //进度款
    let prePaymentRatio = parseFloat(form.getFieldValue('prePaymentRatio')); //预付款
    let finalPaymentRatio = parseFloat(form.getFieldValue('finalPaymentRatio')); //进度款
    let quality = parseFloat(form.getFieldValue('quality') || 0);

    if (type == 'prepay') {
      if (progressPaymentRatio < prePaymentRatio || progressPaymentRatio == prePaymentRatio) {
        this.setState({ progressPayment: true, validatorCont: '进度款需大于预付款' });
        return false;
      }
      if (progressPaymentRatio > 100) {
        this.setState({ progressPayment: true, validatorCont: '请输入小于100的合法数字' });
        return false;
      } else {
        this.setState({ progressPayment: false });
      }
    }
    if (type == 'accounts') {
      if (finalPaymentRatio + quality != 100 && quality != 0) {
        this.setState({ sumPayment: true, validatorCont: '结算款和质保金之和需为100%' });
        return false;
      } else {
        this.setState({ sumPayment: false });
      }
    }
  };
  isDisabled = type => {
    const {
      material: { initData },
    } = this.props;
    const { actionType } = this.state;
    let materialTender = {},
      isChange = false;
    if (actionType === 'change') {
      materialTender = initData.materialTenderFields;
    }
    if (actionType === 'secondTender') {
      materialTender = initData.materialTenderAgainFields;
    }
    for (let i in materialTender) {
      if (i == type) {
        isChange = materialTender[i] == 0;
      }
    }
    return isChange;
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      material: { detail, initData },
    } = this.props;
    const {
      contractImg,
      materialSamples,
      tenderFile,
      showProtoclModal,
      tenderList,
      validatorScore,
      sumPayment,
      validatorCont,
      actionType,
      previewImage,
      previewVisible,
      otherAttachment,
      isAgreement,
      projectObj,
      isDraft,
      materialScales,
      showModal,
      platformSupplier,
      privateSupplier,
      isEndHour,
      progressPayment,
    } = this.state;
    let that = this;
    console.log(this.props.material)
    console.log(detail)
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
          onSubmit={e => this.handleSubmit(e, '')}
          hideRequiredMark={false}
          style={{ marginTop: 8 }}
          className={Styles.bidMaterial}
        >
          <Card title={'填写材料招标信息'} bordered={false} id="setHeight">
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
              {getFieldDecorator('contractImg', {
                initialValue: contractImg,
              })(
                <div>
                  {contractImg.length > 0
                    ? contractImg.map((item, index) => {
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
            <FormItem {...formItemLayout} label="招标材料">
              {getFieldDecorator('category', {
                initialValue: detail.category || null,
                rules: [
                  {
                    required: true,
                    message: '请选择招标材料!',
                  },
                ],
              })(
                <div style={{ width: '350px' }}>
                  <MaterialSort
                    materialInitialValue={detail.category || []}
                    type={'bid'}
                    that={this}
                  />
                </div>
              )}
              {getFieldDecorator('categoryText', {
                initialValue: detail.categoryText || null,
              })(
                <div style={{ width: '350px' }}>
                  <Input type="hidden" />
                </div>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="主要材料">
              {getFieldDecorator('materialClassThree', {
                initialValue: detail.materialClassThree || null,
                rules: [
                  {
                    required: false,
                    message: '请输入主要材料!',
                  },
                ],
              })(<Input style={{ width: '350px' }} placeholder="请输入主要材料" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="招标类型">
              {getFieldDecorator('tenderType', {
                initialValue: detail.tenderType || 1,
                rules: [
                  {
                    required: true,
                    message: '请输入主要材料!',
                  },
                ],
              })(
                <RadioGroup onChange={this.tenderType} disabled={this.isDisabled('tenderType')}>
                  <Radio value={1}>材料</Radio>
                  <Radio value={2}>分包</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="招标规模">
              {getFieldDecorator('scale', {
                initialValue: detail.scale,
                rules: [
                  {
                    required: isDraft,
                    message: '请选择招标规模!',
                  },
                ],
              })(
                <Select
                  style={{ width: 180 }}
                  disabled={this.isDisabled('scale')}
                  placeholder="请选择招标规模"
                >
                  {materialScales.map((item, index) => {
                    return (
                      <Option key={index} value={item.value}>
                        {item.label}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="上传材料样板">
              {getFieldDecorator('materialSamples', {
                initialValue: materialSamples,
              })(
                <div>
                  <Upload
                    {...upLoadInit(
                      'file',
                      materialSamples,
                      'picture-card',
                      'materialSamples',
                      false,
                      true,
                      this,
                      '/base/attach/upload'
                    )}
                    disabled={this.isDisabled('materialSamples')}
                    fileList={materialSamples}
                    onChange={e => uploadChange(e, 'materialSamples', this,false,()=>this.changeUploadStatus('materialSamples'))}
                    onPreview={this.handlePreview}
                    beforeUpload={e => beforeUpload(e, ['img'], 5)}
                    accept={'image/gif,image/jpeg,image/jpg,image/png,image/svg,image/tif'}
                  >
                    {materialSamples.length >= 6 ? null : <Icon type="upload" />}
                  </Upload>
                </div>
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
                      '',
                      'tenderFile',
                      true,
                      true,
                      this,
                      '/base/attach/upload',
                      'MATERIAL_TENDER_FILE'
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
                    <a
                      href={pathPurchase + '/file/download/template?path=材料采购招标文件-模板.doc'}
                    >
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
              {getFieldDecorator('tenderList', {
                initialValue: this.state.tenderList || [],
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
                    multiple={false}
                    showUploadList={true}
                    defaultFileList={this.state.tenderList}
                    onRemove={file => {
                      let id = null;
                      that.state.tenderList.map((item, i) => {
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
                            buzId: 'MATERIAL_TENDER_LIST_FILE',
                            id: id,
                          },
                        })
                        .then(() => {
                          // 页面删除显示
                          let _index = null;
                          let newFileList = this.state.tenderList;
                          const {
                            common: { DeleteStatus },
                          } = this.props;

                          if (DeleteStatus) {
                            newFileList.splice(_index, 1);
                            return this.setState({
                              tenderList: newFileList,
                            });
                          }
                        });
                    }}
                    onChange={e => uploadChange(e, 'tenderList', this, true, this.uploadTenderList)}
                    fileList={this.state.tenderList}
                    data={{ name: 'tenderList', attachCode: 'MATERIAL_TENDER_TENDER_LIST_FILE' }}
                    beforeUpload={e => beforeUpload(e, ['xls'], 5)}
                  >
                    <Button disabled={this.isDisabled('tenderList')}>
                      <Icon type="upload" /> 选择文件
                    </Button>
                  </Upload>
                  <span>
                    可下载{' '}
                    <a
                      href={pathPurchase + '/file/download/template?path=材料及分包招投标清单.xlsx'}
                    >
                      招标清单模板
                    </a>
                  </span>
                  <span style={{ display: isfalse(this.state.tenderList) ? 'none' : null }}>
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
              {getFieldDecorator('otherAttachment', {
                initialValue: this.state.otherAttachment || [],
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
                      this.state.otherAttachment,
                      '',
                      'otherAttachment',
                      true,
                      true,
                      this,
                      '/base/attach/upload',
                      'MATERIAL_TENDER_OTHER_FILES'
                    )}
                    fileList={this.state.otherAttachment}
                    onChange={e => uploadChange(e, 'otherAttachment', this,false,()=>this.changeUploadStatus('otherAttachment'))}
                    data={{ name: 'otherAttachment' }}
                    beforeUpload={e => beforeUpload(e, ['all'], 50)}
                  >
                    <Button disabled={this.isDisabled('otherAttachment')}>
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
                            'MATERIAL_TENDER_CLARIFY_FILES'
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
              {getFieldDecorator('thirdPartyDownloadUrl', {
                initialValue: detail.thirdPartyDownloadUrl || null,
                rules: [
                  {
                    pattern: /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/,
                    message: '请输入正确的下载地址!',
                  },
                ],
              })(<Input style={{ width: 350 }} placeholder="请输入下载地址" />)}
            </FormItem>
          </Card>
          <br />
          <Card title={'招标设置'} bordered={false}>
            <FormItem {...formItemLayout} label="是否允许缺项报价">
              {getFieldDecorator('allowPartialBid', {
                initialValue: detail.allowPartialBid || 1,
                rules: [
                  {
                    required: isDraft,
                    message: '请选是否允许缺项报价!',
                  },
                ],
              })(
                <RadioGroup disabled={this.isDisabled('allowPartialBid')}>
                  <Radio value={1}>是</Radio>
                  <Radio value={2}>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="开票类型">
              {getFieldDecorator('ticketType', {
                initialValue: detail.ticketType || null,
                rules: [
                  {
                    required: isDraft,
                    message: '请选开票类型',
                  },
                ],
              })(
                <RadioGroup>
                  {initData.ticket
                    ? initData.ticket.map((item, index) => {
                        return (
                          <Radio value={item.value} key={index}>
                            {item.label}
                          </Radio>
                        );
                      })
                    : null}
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={<span>{privateSupplier.length>0||privateSupplier==-1?<span style={{ color: 'red', marginRight: 4, fontFamily: 'SimSun' }}>*</span>:null}投标单位</span>}>
              {getFieldDecorator('isInvitationBid', {
                initialValue: detail.isInvitationBid || null,
                rules: [
                  {
                    required: privateSupplier.length>0||privateSupplier==-1?false:isDraft,
                    message: '请选择投标单位',
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
                  选择投标单位
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
              {getFieldDecorator('authbusinessIds')(<Input type="hidden" />)}
              {getFieldDecorator('privateAuthbusinessIds')(<Input type="hidden" />)}
              {getFieldDecorator('isInvitationPrivateBid')(<Input type="hidden" />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="截止日期"
              validateStatus={isEndHour ? 'error' : null}
              help={isEndHour ? '截止时间不能为空' : ''}
            >
              <span style={{ marginRight: 10 }}>
                {getFieldDecorator('endDate', {
                  initialValue: detail.endDate
                    ? moment(format(detail.endDate, 'YYYY-MM-DD'), 'YYYY-MM-DD')
                    : null,
                  rules: [
                    {
                      required: isDraft,
                      message: '选择截止日期!',
                    },
                  ],
                })(
                  <DatePicker

                    disabledDate={this.disabledStartDate}
                    format="YYYY-MM-DD"
                    disabled={this.isDisabled('endDate')}
                    placeholder="选择截止时间"
                    onChange={this.onStartChange}
                  />
                )}
              </span>
              <span>
                {getFieldDecorator('endHour', {
                  initialValue: detail.endHour ? moment(detail.endHour, 'HH:00') : null,
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
                    disabled={this.isDisabled('endHour')}
                    placeholder="选择截止时间"
                  />
                )}
              </span>
            </FormItem>
            <FormItem {...formItemLayout} label="开标日期">
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
            <FormItem {...formItemLayout} label="供货周期"  extra={<div style={{ color: '#999' }}>提示：供货周期最多180天</div>}>
              <div>
                自招标合同签订日期起
                {getFieldDecorator('supplyCycle', {
                  initialValue: detail.supplyCycle || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入供货周期!',
                    },
                    {
                      pattern: /^[1-9][0-9]*$/,
                      message: '请输入合法数字',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 150, margin: '0 5px' }}
                    parser={value => value.replace('-', '')}
                    max={180}
                    min={0}
                    precision={0}
                    placeholder="请输入供货周期"
                  />
                )}
                天供货完毕
              </div>
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
              <FormItem style={{ marginBottom: 0, display: 'inline-block',marginRight:33}}>
                预付款支付合同金额的
                {getFieldDecorator('prePaymentRatio', {
                  initialValue: detail.prePaymentRatio || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入预付款百分比',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 150, margin: '0 5px' }}
                    max={100}
                    min={1}
                    precision={0}
                    parser={value => value.replace('-', '')}
                    addonAfter="%"
                    onKeyUp={e => this.Ratio('prepay')}
                    placeholder="请输入百分比"
                  />
                )}%
              </FormItem>
              <FormItem
                style={{ marginBottom: 0, display: 'inline-block', marginRight: 40 }}
                validateStatus={progressPayment ? 'error' : null}
                help={progressPayment ? validatorCont : ''}
              >
                进度款支付已到货金额的
                {getFieldDecorator('progressPaymentRatio', {
                  initialValue: detail.progressPaymentRatio || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入进度款百分比',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 150, margin: '0 5px' }}
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
              {this.state.tenderType === 2 ? (
                <div style={{ display: 'inline-block' }}>
                  <FormItem style={{ marginBottom: 0 }}>
                    分包竣工后支付至合同金额的
                    {getFieldDecorator('completePaymentRatio', {
                      initialValue: detail.completePaymentRatio || null,
                      rules: [
                        {
                          required: isDraft,
                          message: '请输入合同金额百分比',
                        },
                      ],
                    })(
                      <InputNumber
                        style={{ width: 150, margin: '0 5px' }}
                        max={100}
                        min={1}
                        precision={0}
                        parser={value => value.replace('-', '')}
                        addonAfter="%"
                        placeholder="请输入百分比"
                      />
                    )}{' '}
                    %
                  </FormItem>
                </div>
              ) : null}
              <FormItem style={{ marginBottom: 0, display: 'inline-block',marginRight:15 }}>
                结算款支付至结算金额的
                {getFieldDecorator('finalPaymentRatio', {
                  initialValue: detail.finalPaymentRatio || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入结算款百分比',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 150, margin: '0 5px' }}
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
              <FormItem
                style={{ marginBottom: 0, display: 'inline-block' }}
                validateStatus={sumPayment ? 'error' : ''}
                help={sumPayment ? validatorCont : ''}
              >
                质保金为结算金额的
                {getFieldDecorator('quality', {
                  initialValue: detail.quality || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入百分比',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 150, margin: '0 5px' }}
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
            <FormItem {...formItemLayout} label="是否让投标方修改条款">
              {getFieldDecorator('isAllowBidUpdate', {
                initialValue: detail.isAllowBidUpdate || 0,
                rules: [
                  {
                    required: isDraft,
                  },
                ],
              })(
                <RadioGroup>
                  <Radio value={0}>否</Radio>
                  <Radio value={1}>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="投标得分权重设置"
              validateStatus={validatorScore ? 'error' : null}
              help={validatorScore ? '得分权重四项相加之和须为100' : ''}
              extra={!validatorScore?<div style={{ color: '#999' }}>注意：四项相加之和须为100%</div>:''}
            >
              <span>
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
                    max={100}
                    min={1}
                    precision={0}
                    parser={value => value.replace('-', '')}
                    placeholder="价格权重"
                    onChange={e => this.tenderWeight(e)}
                  />
                )}{' '}
                %<Icon type="plus" />
              </span>
              <span>
                {getFieldDecorator('scoreLeadTime', {
                  initialValue: detail.scoreLeadTime || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入付款条款',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 160 }}
                    max={100}
                    min={1}
                    precision={0}
                    parser={value => value.replace('-', '')}
                    placeholder="供货周期权重"
                    onChange={e => this.tenderWeight(e)}
                  />
                )}{' '}
                %<Icon type="plus" />
              </span>
              <span>
                {getFieldDecorator('scoreCompeteClause', {
                  initialValue: detail.scoreCompeteClause || null,
                  rules: [
                    {
                      required: isDraft,
                      message: '请输入付款条款',
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 160 }}
                    max={100}
                    min={1}
                    precision={0}
                    parser={value => value.replace('-', '')}
                    placeholder="付款条款权重"
                    onChange={e => this.tenderWeight(e)}
                  />
                )}{' '}
                %<Icon type="plus" />
              </span>
              <span>
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
                    max={100}
                    min={1}
                    precision={0}
                    parser={value => value.replace('-', '')}
                    placeholder="工程业绩权重"
                    onChange={e => this.tenderWeight(e)}
                  />
                )}{' '}
                %<Icon type="pause" />
              </span>
              {getFieldDecorator('subScore', {
                initialValue: detail.scorePrice
                  ? detail.scorePrice +
                    detail.scoreAchievement +
                    detail.scoreCompeteClause +
                    detail.scoreLeadTime
                  : 0,
              })(<Input style={{ width: 100 }} disabled={true} placeholder="" />)}{' '}
              %
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
              {getFieldDecorator('contact', {
                initialValue: detail.contact || null,
                rules: [
                  {
                    required: isDraft,
                    message: '请输入联系人',
                  },
                ],
              })(
                <Input
                  placeholder="请输入联系人"
                  disabled={this.isDisabled('contact')}
                  style={{ width: 350 }}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="手机号">
              {getFieldDecorator('phone', {
                initialValue: detail.phone || null,
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
                  disabled={this.isDisabled('phone')}
                  style={{ width: 350 }}
                />
              )}
              {getFieldDecorator('isPublic', {
                initialValue: detail.isPublic || 0,
              })(
                <RadioGroup style={{ marginLeft: 30 }} disabled={this.isDisabled('isPublic')}>
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
                  placeholder="请输入QQ号"
                  disabled={this.isDisabled('qqNumber')}
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
                  placeholder="请输入邮箱"
                  disabled={this.isDisabled('email')}
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
                  placeholder="请输入微信号"
                  disabled={this.isDisabled('wechat')}
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
          visible={this.state.ProjectSelectionVisible}
        />
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => this.setState({ previewVisible: false })}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
        {this.state.validResultVisible ? (
          <ValidResult
            visible={this.state.validResultVisible}
            onCancel={() => {
              this.setState({ validResultVisible: false, tenderList: [] });
            }}
            validRecords={this.state.validResult}
          />
        ) : null}
        <Modal
          title={'查看材料清单'}
          visible={this.state.TenderListVisible}
          onCancel={() => this.setState({ TenderListVisible: false })}
          footer={null}
          destroyOnClose={true}
          width={800}
        >
          <TenderList tenderListJsonData={this.state.tenderListJsonData} />
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
        <SupplierList
          isAuthentication={projectObj.auditState == 1}
          id={projectObj.id}
          onOk={val => this.getSelectSupplier(val)}
          visible={showModal}
          defaultValue={{
            platformSupplier: this.state.platformSupplier,
            privateSupplier: this.state.privateSupplier,
          }}
          changeModal={status => this.changeShowModal(status)}
          tenderType="1"
          isPurchased={getPurchased('already_purchased')}
        />
      </PageHeaderLayout>
    );
  }
}
