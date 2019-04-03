/*eslint-disable*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Spin, Input, Button, Cascader, Upload, Icon, Modal } from 'antd';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';
import { isfalse } from '../../Tools/util_tools';
import {isAuth} from '../../utils/utils'
import cnCity from '../../utils/area.json';
import { call } from '../../../node_modules/redux-saga/effects';
import ViewResult from '../Common/viewFiles';
const FormItem = Form.Item;

@Form.create()
@connect(({ companyInformation, loading, common }) => ({
  companyInformation,
  loading: loading.effects['companyInformation/queryAuthbusinessById'],
  common,
}))
export default class ApprovalProgress extends Component {
  state = {
    companyData: [],
    fileList: [],
    previewVisible: false,
    previewImage: '',
    Edit: false, // 编辑
    authenId:'',
  };

  static defaultProps = {
    //需要传入的数据
    authenId: 139,
  };

  componentDidMount() {

    this.queryAuthbusinessById();
  }

  componentWillUpdate(nextProps) {
    const { loading } = this.props;
    if (nextProps.loading != this.props.loading) {
      const { companyInformation } = this.props;
      if (!isfalse(companyInformation.informationData)) {
        this.setState({
          companyData: companyInformation.informationData,
        });
      }
    }
  }

  queryAuthbusinessById = () => {
    //查询数据
    const { dispatch } = this.props;
    dispatch({
      type: 'companyInformation/queryAuthbusinessById',
      // payload: authenId,
    }).then(()=>{
      // console.log(this)
      const {companyInformation} = this.props;
      if(!isfalse(companyInformation.informationData)){
        this.setState({
          authenId:companyInformation.informationData.authenId
        },()=> this.getReportAttachIds(this.state.authenId))
      }
    });
  };

  saveAuthbusiness = bodyData => {
    //保存修改的数据
    const { dispatch } = this.props;
    dispatch({
      type: 'companyInformation/saveAuthbusiness',
      payload: bodyData,
    }).then(() => {
      this.queryAuthbusinessById();
      this.setState({ Edit: false });
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let fileData = [];
        if (values.licenseAttachIds) {
          values.licenseAttachIds.fileList.map(item => {
            if (item.status === 'done') {
              fileData.push(item.response.data ? item.response.data.id : '');
            }
          });
          values.licenseAttachIds = fileData.toString();
        }
        if (!isfalse(values.province)) {
          values.city = values.province[1];
          values.district = values.province[2];
          values.province = values.province[0];
        }
        values.authenId = this.state.authenId;
        this.saveAuthbusiness(values);
      }
    });
  };
  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };
  handleCancel = () => this.setState({ previewVisible: false });

  // 查询公司信息
  getReportAttachIds(id) {
    this.props
      .dispatch({
        type: 'common/queryAttachList',
        payload: { bizCode: 'COMPANY_IMFORMATION', bizId: id },
      })
      .then(() => {
        let fileList = [];
        (this.props.common.filesPath.data
          ? this.props.common.filesPath.data.attachmentVOList
          : []
        ).map((item, i) => {
          fileList.push({
            name: item.originalFilename,
            url:item.fullFilename,
            uid: item.id,
          });
        });
        // console.log(this.props.common.filesPath.data.attachmentVOList,'this.props.common',fileList)
        this.setState({
          fileList: fileList,
        });
      });
  }

  // 通过省市区id查name
  getAddress(province, city, district) {
    let addr = [];
    cnCity.map(item => {
      if (item.code == province) {
        addr.push(item.name);
        item.sub.map(item1 => {
          if (item1.code == city) {
            addr.push(item1.name);
            item1.sub.map(item2 => {
              if (item2.code == district) {
                addr.push(item2.name);
              }
            });
          }
        });
      }
    });
    return addr;
  }

  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 12 } },
    };

    const { companyInformation } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { fileList, previewVisible, previewImage, companyData, Edit } = this.state;
    return (
      <Spin spinning={this.props.loading}>
        <Card
          title={companyInformation.data}
          extra={
            isAuth('account_setting')?<Button
              type="primary"
              onClick={() => {
                this.setState({ Edit: true });
              }}
            >编辑</Button>:null
          }
        >
          {Edit ? (
            <Form onSubmit={this.handleSubmit}>
              <FormItem {...formItemLayout} label="公司类型：">
                <span>
                  {this.state.companyData.companyType == 1
                    ? '材料供应商'
                    : this.state.companyData.companyType == 2
                      ? '施工单位'
                      : this.state.companyData.companyType == 3
                        ? '劳务供应商'
                        : this.state.companyData.companyType == 3
                          ? '劳务队伍'
                          : ''}
                </span>
              </FormItem>
              <FormItem {...formItemLayout} label="公司名称：">
                <span>{this.state.companyData.companyName}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="法人代表：">
                {getFieldDecorator('legalPerson', {
                  rules: [],
                  initialValue: this.state.companyData.legalPerson,
                })(<Input placeholder="请输入法人代表" />)}
              </FormItem>

              <FormItem {...formItemLayout} label="公司地址：">
                {getFieldDecorator('province', {
                  initialValue: [
                    this.state.companyData.province,
                    this.state.companyData.city,
                    this.state.companyData.district,
                  ],
                })(
                  <Cascader
                    fieldNames={{ label: 'name', value: 'code', children: 'sub' }}
                    options={cnCity}
                    placeholder="请选择公司地址"
                  />
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="公司详细地址：">
                {getFieldDecorator('address', {
                  initialValue: this.state.companyData.address,
                })(<Input placeholder="请输入公司详细地址" />)}
              </FormItem>
              {/*<FormItem {...formItemLayout} label="公司证件：">
              {getFieldDecorator('licenseAttachIds', {
                initialValue: this.state.companyData.licenseAttachIds
              })(<span>{this.state.companyData.licenseAttachIds}</span>)}
            </FormItem>*/}

              <FormItem {...formItemLayout} label="公司证件：">
                {getFieldDecorator('licenseAttachIds', {})(
                  <Upload
                    {...upLoadInit(
                      'file',
                      this.state.fileList,
                      'picture-card',
                      'fileList',
                      true,
                      true,
                      this,
                      '/base/attach/upload'
                    )}
                    fileList={this.state.fileList}
                    onChange={e => uploadChange(e, 'fileList', this)}
                    onPreview={this.handlePreview}
                    beforeUpload={e => beforeUpload(e, ['img'], 5)}
                  >
                    {fileList.length >= 6 ? null : <Icon type="upload" />}
                  </Upload>
                )}
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
              </FormItem>

              <FormItem {...formItemLayout} label="纳税人识别号：">
                {getFieldDecorator('identificationNumber', {
                  initialValue: this.state.companyData.identificationNumber,
                })(<Input placeholder="请输入纳税人识别号" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="开户银行：">
                {getFieldDecorator('openAccount', {
                  initialValue: this.state.companyData.openAccount,
                })(<Input placeholder="请输入公司账户开户银行" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="银行账户：">
                {getFieldDecorator('bankAccount', {
                  initialValue: this.state.companyData.bankAccount,
                })(<Input placeholder="请输入公司账银行账户" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="发票邮寄信息：">
                {getFieldDecorator('invoiceMailingInformation', {
                  initialValue: this.state.companyData.invoiceMailingInformation,
                })(<Input placeholder="请输入收件人姓名、联系电话、收件地址" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="公司联系人：">
                {getFieldDecorator('contactUserName', {
                  initialValue: this.state.companyData.contactUserName,
                })(<Input placeholder="请输入公司联系人姓名" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="联系方式：">
                {getFieldDecorator('contact', {
                  //电话号码有效性验证
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (!isfalse(value)) {
                          if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(value)) {
                            if (!/\d{3}-\d{8}|\d{4}-\d{7}/.test(value)) {
                              callback(new Error('请输入正确格式的电话号码!'));
                            } else {
                              callback();
                            }
                          } else {
                            callback();
                          }
                        } else {
                          callback();
                        }
                      },
                      required: false,
                    },

                    // {pattern:/\d{3}-\d{8}|\d{4}-\d{7}/,message:'请输入正确格式的电话号码'}
                  ],
                  initialValue: this.state.companyData.contact,
                })(<Input placeholder="请输入公司联系人手机号码" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="联系邮箱：">
                {getFieldDecorator('contactMail', {
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        //邮箱有效性验证
                        if (!isfalse(value)) {
                          if (
                            !/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(
                              value
                            )
                          ) {
                            callback(new Error('请输入正确格式的邮箱地址'));
                          } else {
                            callback();
                          }
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                  initialValue: this.state.companyData.contactMail,
                })(<Input placeholder="请输入公司联系人邮箱地址" />)}
              </FormItem>
              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
              </FormItem>
            </Form>
          ) : (
            <Form>
              <FormItem {...formItemLayout} label="公司类型：">
                <span>
                  {companyData.companyType == 1
                    ? '材料供应商'
                    : companyData.companyType == 2
                      ? '施工单位'
                      : companyData.companyType == 3
                        ? '劳务供应商'
                        : companyData.companyType == 3
                          ? '劳务队伍'
                          : ''}
                </span>
              </FormItem>
              <FormItem {...formItemLayout} label="公司名称：">
                <span>{companyData.companyName}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="法人代表：">
                <span>{companyData.legalPerson}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="公司地址：">
                {/*{getFieldDecorator('province', {
                initialValue: [
                  companyData.province,
                  companyData.city,
                  companyData.district,
                ],
              })(
                <Cascader
                  fieldNames={{ label: 'name', value: 'code', children: 'sub' }}
                  options={cnCity}
                  placeholder="请选择公司地址"
                  disabled
                />
              )}*/}
                <span>
                  {this.getAddress(companyData.province, companyData.city, companyData.district)}
                </span>
              </FormItem>
              <FormItem {...formItemLayout} label="公司详细地址：">
                <span>{companyData.address}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="公司证件：">
                {
                  isfalse(this.state.authenId)?null:<ViewResult
                  type={'AUTHBUSINESS_LICENSE'}
                  sourceData={{ bizCode: 'COMPANY_IMFORMATION', bizId: this.state.authenId }}
                />
                }
              </FormItem>
              <FormItem {...formItemLayout} label="纳税人识别号：">
                <span>{companyData.identificationNumber}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="开户银行：">
                <span>{companyData.openAccount}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="银行账户：">
                <span>{companyData.bankAccount}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="发票邮寄信息：">
                <span>{companyData.invoiceMailingInformation}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="公司联系人：">
                <span>{companyData.contactUserName}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="联系方式：">
                <span>{companyData.contact}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="联系邮箱：">
                <span>{companyData.contactMail}</span>
              </FormItem>
            </Form>
          )}
        </Card>
      </Spin>
    );
  }
}
