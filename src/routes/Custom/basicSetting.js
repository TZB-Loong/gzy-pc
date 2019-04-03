/*eslint-disable*/
import React, { Component } from 'react';
import {
  Card,
  Modal,
  Table,
  Button,
  Icon,
  Input,
  Select,
  Checkbox,
  Form,
  Row,
  Col,
  List,
  message,
} from 'antd';
import styles from './style.less';
import { connect } from 'dva';
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;
const ListItem = List.Item;

@connect(({ custom }) => ({
  custom,
}))
class BasicSetting extends Component {
  state = {
    previewVisible: false,
    basicData: this.props.data,
    jointProjectSize: 0,
    optionData: [],
    errorInfo: '',
  };
  // 监听props变化
  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log(JSON.stringify(nextProps.data));
    if (JSON.stringify(nextProps.data) != '{}') {
      this.setState({
        basicData: nextProps.data,
      });
    }
  }

  // handleSubmit = (e, type) => {
  //   e.preventDefault();
  //   console.log('value');
  //   const { form, dispatch } = this.props;
  //   form.validateFieldsAndScroll((err, values) => {
  //     console.log('基础信息');
  //     console.log(values);
  //     if (!err) {
  //       // return values;
  //     }
  //   });
  // };
  componentDidMount() {
    console.log(this.props);
    this.queryTypeList();
  }
  queryTypeList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'custom/typeList',
    }).then(() => {
      const { custom } = this.props;
      if (custom.typeList) {
        if (custom.typeList.length > 0) {
          this.setState({
            optionData: custom.typeList,
          });
        }
      }
    });
  };
  changeData(type, value) {
    let basicData = this.state.basicData;
    basicData[type] = value;
    this.setState({
      basicData,
    });
  }
  addOption() {
    let optionData = this.state.optionData;
    if (this.state.addOptionValue) {
      if (this.state.optionValueRequire == true) {
        return;
      }
      optionData.push(this.state.addOptionValue);
    } else {
      message.error('模板名称不能为空!');
      return;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'custom/addType',
      payload: {
        bizObjectType: this.state.addOptionValue,
      },
    }).then(() => {
      const {
        custom: { addStatus },
      } = this.props;
      console.log(this.props);
      if (addStatus) {
        this.setState({ previewVisible: false, optionData, addOptionValue: '' });
      }
    });
  }
  handleCancel = () =>
    this.setState({ previewVisible: false, addOptionValue: '', optionValueRequire: false });
  render() {
    let { checkboxValue, items, checkboxIndex } = this.props;
    const { getFieldDecorator } = this.props.form;
    let { basicData, previewVisible, optionData } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        md: { span: 16 },
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

    return (
      <div style={{ borderBottom: '1px solid #E0E0DF', padding: 10 }}>
        <Form onSubmit={e => this.handleSubmit(e)} style={{ marginTop: 8 }}>
          <div style={{ color: '#313232', fontSize: 16, padding: '10px 0px' }}>基本设置</div>
          <FormItem
            {...formItemLayout}
            label={
              <span style={{ color: '#303557' }}>
                {/*<span style={{ color: '#EC684C', marginRight: 4, fontFamily: 'SimSun' }}>*</span>*/}
                审批类型
              </span>
            }
          >
            <Row>
              <Col span={12}>
                {getFieldDecorator('bizType', {
                  initialValue: basicData.bizType ? decodeURI(basicData.bizType) : undefined,
                  rules: [
                    {
                      required: true,
                      message: '请选择类型',
                    },
                  ],
                })(
                  <Select placeholder="请选择">
                    {this.state.optionData.map((item, index) => {
                      return (
                        <Option key={index} value={item}>
                          {item}
                        </Option>
                      );
                    })}
                  </Select>
                )}
                {/*<Select
                  placeholder="请选择类型"
                  onSelect={value => {
                    this.changeData('type_name', value);
                  }}
                >
                  {this.state.optionData.map((item, index) => {
                    return (
                      <Option key={index} value={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>*/}
              </Col>
              <span
                onClick={() => {
                  this.setState({ previewVisible: true });
                }}
                style={{ color: '#4476BB', paddingLeft: 20, cursor: 'pointer' }}
              >
                添加类型
              </span>
            </Row>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={
              <span style={{ color: '#303557' }}>
                {/*<span style={{ color: '#EC684C', marginRight: 4, fontFamily: 'SimSun' }}>*</span>*/}
                模板名称
              </span>
            }
          >
            {getFieldDecorator('bizName', {
              initialValue: basicData.bizName ? decodeURI(basicData.bizName) : null,
              rules: [
                {
                  required: true,
                  message: '请输入模板名称',
                },
                {
                  max: 20,
                  message: '最多可输入20个字',
                },
              ],
            })(<Input placeholder="请输入模板名称" />)}
            {/*<Input
              onChange={e => {
                this.changeData('chnName', e.target.value);
              }}
              value={basicData.chnName || ''}
              placeholder="请输入模板名称"
            />*/}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={
              <span style={{ color: '#303557' }}>
                {/*<span style={{ color: '#EC684C', marginRight: 4, fontFamily: 'SimSun' }}>*</span>*/}
                模板说明
              </span>
            }
          >
            {getFieldDecorator('bizDesc', {
              initialValue: basicData.bizDesc ? decodeURI(basicData.bizDesc) : '',
              rules: [
                {
                  required: false,
                  message: '请输入模板说明',
                },
                {
                  max: 50,
                  message: '最多可输入50个字',
                },
              ],
            })(
              <TextArea
                rows={4}
                placeholder="请输入模板说明"
                onChange={e => {
                  // console.log(e.target.value)
                  this.setState({ jointProjectSize: e.target.value.length });
                  if (e.target.value.length > 50) {
                    // this.setState({ jointProjectSize: e.target.value.length });
                    return;
                  }
                  //this.setState({ jointProjectSize: e.target.value.length });
                }}
              />
            )}
            {/*<TextArea
              rows={4}
              placeholder="请输入模板说明"
              onChange={e => {
                if (e.target.value.length > 50) {
                  return;
                }
                this.setState({ jointProjectSize: e.target.value.length });
                this.changeData('remark', e.target.value);
              }}
              value={basicData.remark || ''}
            />*/}
            <div style={{ position: 'absolute', top: -5, right: 5 }}>
              {this.state.jointProjectSize}
              /50
            </div>
          </FormItem>
        </Form>
        <Modal
          title="添加类型"
          width={350}
          visible={previewVisible}
          onCancel={this.handleCancel}
          destroyOnClose={true}
          onOk={() => {
            this.addOption();
          }}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label={
                <span style={{ color: '#303557' }}>
                  <span style={{ color: '#EC684C', marginRight: 4, fontFamily: 'SimSun' }}>*</span>
                  类型名称
                </span>
              }
              extra={
                this.state.optionValueRequire ? (
                  <span style={{ color: '#f5222d' }}>{this.state.errorInfo}</span>
                ) : null
              }
            >
              <Input
                style={{ borderColor: this.state.optionValueRequire ? '#f5222d' : '#d9d9d9' }}
                onChange={e => {
                  console.log(e.target.value.length);
                  if (e.target.value.length > 20) {
                    this.setState({ optionValueRequire: true, errorInfo: '最多可输入20个字' });
                  } else {
                    this.setState({ optionValueRequire: false });
                  }
                  for (let i = 0; optionData.length > i; i++) {
                    if (optionData[i] == e.target.value) {
                      this.setState({
                        optionValueRequire: true,
                        errorInfo: '该分类已存在',
                      });
                      return false;
                    } else {
                      this.setState({ optionValueRequire: false });
                    }
                  }
                  this.setState({ addOptionValue: e.target.value });
                }}
                placeholder="请输入类型名称"
              />
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default BasicSetting;
