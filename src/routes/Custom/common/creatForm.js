import React, { Component } from 'react'
import moment from 'moment'
import {
  Form,
  Select,
  Input,
  Radio,
  Checkbox,
  DatePicker,
  Button,
  Row,
  Icon,
  InputNumber,
} from 'antd';
import { isJSON, currentTime, isfalse } from '../../../Tools/util_tools';
import { getPurchased } from '../../../utils/utils';
import styles from '../../ApprovalPerformance/style.less';
import Styles from '../../Common/style.less';
import ProjectSelection from './projectSelection';  //选择项目组件
import SelectSupplier from './selectSupplier'; //选择供应商组件
import SelectCalibration from './selectCalibration'; //选择标组件
import StaffChange from '../../Common/StaffChange';  //选择人员组件
import SelectCity from './selectCity'; //选择省份、城市、地区 组件
import MaterialSort from './materialSort'; //选择材料分类 组件
import UploadAttach from './Upload';  //附件上传组件
import Subform from './subform';  //子表单组件

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const { RangePicker } = DatePicker;
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

/**
 * 参数说明
 * @param  {array}  formData  生成与form 表单像关联的数据
 * @param {obj}  form  与父组件创建的form 相关联
 * @param {function} getAttachParams 获取附件相关数据(附件特殊处理)
 * @param {string} type  页面显示类型 view => 查看  approval=>审批页面
 */


export default class CreatForm extends Component {
  state = {
    attachParams: [],
    defaultFileList:false//附件默认值
  }

  FormItemList = data => {
    //动态表单里面的标签
    let _this = this;
    const { type } = this.props;
    function subtag(item, getFieldDecorator,isShow) {
      const props = isfalse(item.extentionProps) ? null : (isJSON(item.extentionProps) ? JSON.parse(item.extentionProps) : item.extentionProps);
      switch (item.ctrlType) {
        case 'text':
          if (type == 'view' || type == 'approval') {
            return <div style={{'wordBreak':'break-all'}}>{props.defaultValue}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue: isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },{
                    max: props.maxLength,
                    message: `最多可输入${props.maxLength}个字`,
                  },
                ],
              })(
                <Input placeholder={props.placeholder} disabled={props.readonly} />
              )
            );
          }

          break;
        case 'textarea':
          if (type == 'view' || type == 'approval') {
            return <div style={{'wordBreak':'break-all'}}>{props.defaultValue}</div>
          } else {
            return (

              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                  {
                    max: props.maxLength,
                    message: `最多可输入${props.maxLength}个字`,
                  },
                ],
              })(
                <TextArea rows={4} placeholder={props.placeholder} disabled={props.readonly} />
              )
            );
          }
          break;
        case 'number':
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue}{props.unit}</div>
          } else {
            return <div>
              {
                getFieldDecorator(item.ctrlName, {
                  initialValue:isShow? props.defaultValue:'',
                  rules: [
                    {
                      required: props.required,
                      // pattern:props.rules,
                      message: item.chnName + '为必填选项',
                    },
                  ],
                })(
                  <InputNumber min={props.min}  precision={props.point} style={{width:173}} placeholder={item.placeholder} max={1000000000} disabled={props.readonly} />
                )
              }<span>&nbsp;{props.unit}</span>
              </div>;
          }
          break;
        case 'money':
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue}{props.unit}</div>
          } else {
            return <div>{
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    // pattern:props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <InputNumber
                  min={props.min}
                  max={1000000000}
                  parser={value => value.replace('-', '')}  precision={props.point}
                  disabled={props.readonly}
                  placeholder={props.placeholder}
                  style={{ width: 173 }}
                  // formatter={value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  // parser={value => value.replace(/￥\s?|(,*)/g, '')}
                />
              )}<span>&nbsp;{props.unit}</span>
            </div>;
          }
          break;
        case 'radio':
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <RadioGroup disabled={props.readonly} >
                  {props.options.map((optionItem, optionIndex) => {
                    return <Radio value={optionItem.value} key={optionIndex}>{optionItem.value}</Radio>
                  })}
                </RadioGroup>
              )
            );
          }
          break;
        case 'checkbox':
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue.length>0?props.defaultValue.map((item,index)=>{if(index+1<props.defaultValue.length){
              return item+'、'
            }  else return item}):null}</div>
          } else {
            let options = props.options;
            options.map((item) => {
              item.label = item.value;
            });
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue: isShow?( isfalse(props.defaultValue) ? [] : props.defaultValue):[],
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <CheckboxGroup options={options} disabled={props.readonly} />
              )
            );
          }
          break;
        case 'dropdown':
          console.log(props)
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue}</div>
          } else {

            return (
              getFieldDecorator(item.ctrlName, {
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <Select  style={{width:200}} placeholder={"请选择"+item.chnName}>
                  {props.options.map((optionItem, optionIndex) => {
                    return <Option key={optionIndex} value={optionItem.value}>{optionItem.value}</Option>
                  })}
                </Select>
              )
            );
          }
          break;
        case 'date':
          if (type == 'view' || type == 'approval') {
            return <div>{
              props.defaultValue == 'none' ? '' :
                moment(props.defaultValue).format(props.format)}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
                initialValue:isShow?( props.defaultValue == 'none' ? null : moment(props.defaultValue)):'',
              })(
                <DatePicker
                  showTime={isfalse(props.showTime) ? false : props.showTime}
                  format={props.format}
                  disabled={props.readonly} />
              )
            );
          }
          break;
        case 'datearea':
          if (type == 'view' || type == 'approval') {
            return <div>{isfalse(props.defaultValue) ? '' : moment(props.defaultValue[0]).format(props.format) + ' 至 '+ moment(props.defaultValue[1]).format(props.format)}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                rules: [
                  {
                    required: props.required,
                    message: item.chnName + '为必填选项',
                  },
                ],
                initialValue:isShow?( isfalse(props.defaultValue) ? null : [moment(props.defaultValue[0]), moment(props.defaultValue[1])]):'',
              })(
                <RangePicker
                  showTime={isfalse(props.showTime) ? false : props.showTime}
                  format={props.format}
                  disabled={props.readonly} />
              )
            )
          }
          break;
        case 'attach':  //附件
          if (type == 'view' || type == 'approval') {
            console.log(props.defaultValue,'props.defaultValue')
            return <div>
              {isfalse(props.defaultValue) ? '' : props.defaultValue.map((attactitem, i) => {
                return <div key={i}><Icon type="paper-clip" /><a href={attactitem.fullFilename} target="_blank">{attactitem.originalFilename + '.' + attactitem.extention}</a></div>
              })}
            </div>
          } else {

            console.log(props.defaultValue,'--props.defaultValue')
            return (getFieldDecorator(item.ctrlName, {
              initialValue:isShow?( isfalse(props.defaultValue) ? null : props.defaultValue):'',
              rules: [
                {
                  required: props.required,
                  message: item.chnName + '为必填选项',
                }
              ],
            })(
                <UploadAttach
                onOk={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType, props.attachCode)}
                fileList={isShow? props.defaultValue:null} />
            ))
          }
          break;
        case 'subfrom':
          return (
            getFieldDecorator(item.ctrlName, {
              initialValue:isShow?( isfalse(props.defaultValue) ? '' : props.defaultValue):'',
              rules: [
                {
                  required: props.required,
                  message: item.chnName + '为必填选项'
                }
              ]
            })(
              <Subform
                subtag={subtag}
                options={props.options}
                onOk={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType)}
                isView={type == 'view' || type == 'approval'}
                default={props.defaultValue}
                form={_this.props.form}
              />
            )
          )
          break;
        case 'phone':
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    message:'请输入电话号码'
                  },
                  {
                    required: props.required,
                    validator: (rule, value, callback) => {
                      if (!isfalse(value)) {
                        if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(value) && props.phoneType != "landline") {
                          callback(new Error('请输入正确格式的手机号码!'));
                        } else {
                          if (!/\d{3}-\d{8}|\d{4}-\d{7}/.test(value) && props.phoneType == "landline") {
                            callback(new Error('请输入正确格式的座机号码(例：010-12345678)!'));
                          } else {
                            callback();
                          }
                        }

                      } else {
                        callback();
                      }
                    }
                  },
                ],
              })(
                <Input placeholder={props.placeholder} disabled={props.readonly} />
              )
            );
          }
          break;
        case 'www':
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    message:'请输入网址'
                  },
                  {
                    required: props.required,
                    validator: (rule, value, callback) => {
                      if (!isfalse(value)) {
                        if (!/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(value)) {
                          callback(new Error('请输入正确格式网址!'));
                        } else {
                          callback();
                        }
                      } else {
                        callback();
                      }
                    }
                  },
                ],
              })(
                <Input placeholder={props.placeholder} disabled={props.readonly} />
              )
            );
          }
          break;
        case 'email':
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    message:'请输入邮箱'
                  },
                  {
                    required: props.required,
                    // pattern:/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
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

                ]
              })(
                <Input placeholder={props.placeholder} disabled={props.readonly} />
              )
            );
          }
          break;
        case "chooseProject":
          if (type == 'view' || type == 'approval') {
            // console.log(props.defaultValue,'props-defaultValue')
            return <div>{props.defaultValue.projectName}</div>
          } else {
            return (
              <span>
                {getFieldDecorator(item.ctrlName, {
                  initialValue: isShow?props.defaultValue:'',
                  rules: [
                    {
                      required: props.required,
                      // pattern: props.rules,
                      message: item.chnName + '为必填选项',
                    },
                  ],
                })(
                  <ProjectSelection
                    onOK={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType)}
                    default={ isShow ?props.defaultValue:''}
                  // processType="payment"  //检测其是否有权限发起审批
                  />
                )}
              </span>
            )
          }
          break;
        case "chooseMaterialTender":
          if (type == 'view' || type == 'approval') {
            console.log(props.defaultValue.projectName,'props-defaultValue')
            return <div><span>{props.defaultValue.projectName}</span><div>{props.defaultValue.tenderCategory ? '招：' + props.defaultValue.tenderCategory : ''}</div></div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <SelectCalibration default={isShow? props.defaultValue:null} onOk={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType)} tenderType="1" />
              )
            )
          }
          break;
        case "chooseLabourTender":
          if (type == 'view' || type == 'approval') {
            // console.log(props.defaultValue.projectName,'props-defaultValue')
            return <div><span>{props.defaultValue.projectName}</span><div>{props.defaultValue.tenderCategory ? '招：' + props.defaultValue.tenderCategory : ''}</div></div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <SelectCalibration default={isShow? props.defaultValue:null} onOk={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType)} tenderType="2" />
              )
            )
          }
          break;
        case "chooseMaterialSupplier":
          if (type == 'view' || type == 'approval') {
            // console.log(props.defaultValue, 'props-defaultValue')
            let returnData = props.defaultValue;
            return <div>
              {isfalse(returnData) ? null : (returnData.privateSupplier == -1 && returnData.platformSupplier == -1 ? (
                <div>已选择全部供应商,公开招标</div>
              ) : (
                  <div>
                    <div>
                      <span>
                        {isfalse(returnData.privateSupplier)
                          ? null
                          : returnData.privateSupplier == -1
                            ? '已选择全部个人供应商'
                            : '已选择个人供应商(' + returnData.privateSupplier.length + ')'}
                      </span>
                      {!isfalse(returnData.privateSupplier) && returnData.privateSupplier != -1 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {returnData.privateSupplier.map((item, index) => {
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
                        {isfalse(returnData.platformSupplier)
                          ? null
                          : returnData.platformSupplier == -1
                            ? '已选择全部平台供应商'
                            : '已选择平台供应商库(' + returnData.platformSupplier.length + ')'}
                      </span>
                      {returnData.platformSupplier != -1 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {returnData.platformSupplier.map((item, index) => {
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
                )
              )}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue: isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <SelectSupplier
                  tenderType="1"
                  isPurchased={getPurchased('already_purchased')}
                  isAuthentication={true}
                  onOk={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType)}
                  default={isShow? props.defaultValue:null}
                />
              )
            )
          }
          break;
        case "chooseLabourSupplier":
          if (type == 'view' || type == 'approval') {
            // console.log(props.defaultValue, 'props-defaultValue')
            let returnData = props.defaultValue;
            return <div>
              {isfalse(returnData) ? null : (returnData.privateSupplier == -1 && returnData.platformSupplier == -1 ? (
                <div>已选择全部供应商,公开招标</div>
              ) : (
                  <div>
                    <div>
                      <span>
                        {isfalse(returnData.privateSupplier)
                          ? null
                          : returnData.privateSupplier == -1
                            ? '已选择全部个人供应商'
                            : '已选择个人供应商(' + returnData.privateSupplier.length + ')'}
                      </span>
                      {!isfalse(returnData.privateSupplier) && returnData.privateSupplier != -1 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {returnData.privateSupplier.map((item, index) => {
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
                        {isfalse(returnData.platformSupplier)
                          ? null
                          : returnData.platformSupplier == -1
                            ? '已选择全部平台供应商'
                            : '已选择平台供应商库,(' + returnData.platformSupplier.length + ')'}
                      </span>
                      {returnData.platformSupplier != -1 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {returnData.platformSupplier.map((item, index) => {
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
                )
              )}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <SelectSupplier
                  tenderType="0"
                  isPurchased={getPurchased('already_purchased')}
                  onOk={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType)}
                  isAuthentication={true}
                  default={isShow? props.defaultValue:null}
                />
              )
            )
          }
          break;
        case "user":

          let defValue ={};
          let  users = [];
          if (type == 'view' || type == 'approval') {
            return <div>{isfalse(props.defaultValue) ? null : (isJSON(props.defaultValue) ? JSON.parse(props.defaultValue).displayName : props.defaultValue.displayName)}</div>
          } else {
            if(!isfalse(props.defaultValue)){
              let defaultValue = isJSON(props.defaultValue)?JSON.parse(props.defaultValue):props.defaultValue;
              let useId =  (defaultValue.userIds).split(',');
              let nickName = (defaultValue.displayName).split(',')
              useId.map((user,index)=>{
                users.push({
                  userId:user,
                  nickName:nickName[index]
                })
              })
              defValue.users=users;
            }
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <StaffChange
                modalTitle="人员"
                type="users"
                onOk={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType)}
                placeholder={props.placeholder}
                default={ isShow?defValue:null}
                />
              )
            )
          }
          break;
        case "area":
        console.log(props.defaultValue, 'area')
          if (type == 'view' || type == 'approval') {

            return <div>{isfalse(props.defaultValue) ? '' : (props.defaultValue.provinceName + '/'+
              props.defaultValue.cityName +'/'+ props.defaultValue.districtName)}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <SelectCity onOk={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType)} default={isShow? props.defaultValue:null}/>
              )
            )
          }
          break;
        case "material":
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue.categoryText}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? props.defaultValue:'',
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <MaterialSort
                initialValue={ isShow?(props.defaultValue ? props.defaultValue.category:[]):[]}
                onOk={_this.onOkClick.bind(_this, item.ctrlName, item.ctrlType)} />
              )
            )
          }
          break;
        case "applyPerson":
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue}</div>
          } else {
            return (
              getFieldDecorator(item.ctrlName, {
                initialValue:isShow? JSON.parse(sessionStorage.getItem('user')).username:'',
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <Input disabled={props.readonly} />
              )
            )
          }
          break;
        case "applyTime":
          if (type == 'view' || type == 'approval') {
            return <div>{props.defaultValue}</div>
          } else {
            return (
              // currentTime("YHMS")
              getFieldDecorator(item.ctrlName, {
                initialValue: currentTime("YHMS") ,
                rules: [
                  {
                    required: props.required,
                    // pattern: props.rules,
                    message: item.chnName + '为必填选项',
                  },
                ],
              })(
                <Input disabled={props.readonly} />
              )
            )
          }
          break;
        default:
          return null;
      }
    }
    return data.map((item, index) => {
      return (
        <FormItem {...formItemLayout} label={item.chnName} key={index} >
          {subtag(item, _this.props.form.getFieldDecorator,true)}
        </FormItem>)
    });
  };

  attachClick = (data, attachData) => { //附件数据处理
    let attachParams = this.state.attachParams;
    let uidArray = [];
    if (!isfalse(attachData)) {
      attachData.map(item => {
        if (!isfalse(item.response)) {
          uidArray.push(item.response.data.id)
        } else {
          uidArray.push(item.uid)
        }
      })
    }
    if (isfalse(attachParams)) { //当为空的时候
      attachParams.push({
        attachCode: data,
        attachIds: isfalse(uidArray) ? null : uidArray.toString()
      })
    } else {
      let attachCodeArray = [];
      attachParams.map(item => {
        attachCodeArray.push(item.attachCode)
      });
      if (attachCodeArray.indexOf(data) == -1) {
        attachParams.push({
          attachCode: data,
          attachIds: isfalse(uidArray) ? null : uidArray.toString()
        })
      } else {
        attachParams.splice(attachCodeArray.indexOf(data), 1, {
          attachCode: data,
          attachIds: isfalse(uidArray) ? null : uidArray.toString()
        })
      }
    }
    this.setState({
      attachParams,
      defaultFileList:attachData
    }, () => {
      this.props.getAttachParams(this.state.attachParams)
    })
  }


  onOkClick = (type, ctrlType, data, attachData) => { // 业务组件确定事件

    let ctryData = data;
    let _this = this;
    if (ctrlType == 'attach') { //当为附件的时间,data标识的是attachCode,attachData是上传完附件之后的返回的数据
      ctryData = attachData;
    }
    if (isJSON(data)||ctrlType=='material') { //当返回的数据为对象或者json的字符串时,处理设置的值
      let  empty  = true;
      let obj = isJSON(data) ? JSON.parse(data) : data;
      Object.keys(obj).map(item => {
        if (!isfalse(obj[item])) {
          ctryData=obj
        }else{
          ctryData =[]
        }
      })
    }
    if(ctrlType=='chooseMaterialSupplier'||ctrlType=='chooseLabourSupplier'){

      if(!isfalse(data)){
        if(isfalse(data.platformSupplier)&&isfalse(data.privateSupplier)){
          ctryData = []
        }
      }

      // console.log(data,'chooseMaterialSupplier')


    }
    _this.props.form.setFieldsValue({
      [type]:ctryData
    })
  }

  render() {

    return (this.FormItemList(this.props.formData))
  }
}

