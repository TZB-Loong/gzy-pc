/*eslint-disable*/
import moment from 'moment';
import React, { Component } from 'react';
import {
  Modal,
  Table,
  Button,
  Icon,
  Input,
  Select,
  Checkbox,
  DatePicker,
  Form,
  Row,
  Col,
  InputNumber,
  Radio,
  Upload,
  Cascader,
} from 'antd';
import styles from './style.less';
import { connect } from 'dva';
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

@Form.create()
@connect(({ common }) => ({
  common,
}))
export default class ControlView extends Component {
  state = {};

  componentDidMount() {}
  control(value, propsName) {
    let html = (
      <div>
        {value.ctrlType == 'text' ? (
          <Input
            style={{ width: '60%' }}
            placeholder={value[propsName] ? value[propsName].placeholder : ''}
          />
        ) : value.ctrlType == 'textarea' ? (
          <TextArea
            style={{ width: '60%' }}
            placeholder={value[propsName] ? value[propsName].placeholder : ''}
          />
        ) : value.ctrlType == 'number' ? (
          <InputNumber
            style={{ width: '60%' }}
            placeholder={value[propsName] ? value[propsName].placeholder : ''}
          />
        ) : value.ctrlType == 'money' ? (
          <InputNumber
            style={{ width: '60%' }}
            placeholder={value[propsName] ? value[propsName].placeholder : ''}
          />
        ) : value.ctrlType == 'radio' ? (
          <RadioGroup>
            {(value[propsName] && value[propsName].options ? value[propsName].options : []).map(
              (item, index) => {
                return (
                  <Radio key={index} value={item.value} checked={item.checked}>
                    {item.value}
                  </Radio>
                );
              }
            )}
          </RadioGroup>
        ) : value.ctrlType == 'checkbox' ? (
          <CheckboxGroup
            defaultValue={
              value[propsName] && value[propsName].defaultValue ? value[propsName].defaultValue : []
            }
          >
            {(value[propsName] && value[propsName].options ? value[propsName].options : []).map(
              (item, index) => {
                return (
                  <Checkbox key={index} value={item.value}>
                    {item.value}
                  </Checkbox>
                );
              }
            )}
          </CheckboxGroup>
        ) : value.ctrlType == 'dropdown' ? (
          <Select
            style={{ width: '60%' }}
            defaultValue={
              value[propsName] && value[propsName].defaultValue
                ? value[propsName].defaultValue
                : '请选择'
            }
          >
            {(value[propsName] && value[propsName].options ? value[propsName].options : []).map(
              (item, index) => {
                return (
                  <Option key={index} value={item.value}>
                    {item.value}
                  </Option>
                );
              }
            )}
          </Select>
        ) : value.ctrlType == 'date' ? (
          value[propsName].showTime ? (
            <DatePicker
              format={'YYYY-MM-DD HH:mm'}
              defaultValue={
                value[propsName].defaultValue == 'none' ? '' : moment(value[propsName].defaultValue)
              }
            />
          ) : (
            <DatePicker
              format={'YYYY-MM-DD'}
              defaultValue={
                value[propsName].defaultValue == 'none' ? '' : moment(value[propsName].defaultValue)
              }
            />
          )
        ) : value.ctrlType == 'datearea' ? (
          value[propsName].showTime ? (
            <RangePicker
              format={'YYYY-MM-DD HH:mm'}
              defaultValue={
                value[propsName].defaultValue && value[propsName].defaultValue[0]
                  ? [
                      moment(value[propsName].defaultValue[0]),
                      moment(value[propsName].defaultValue[1]),
                    ]
                  : null
              }
            />
          ) : (
            <RangePicker
              format={'YYYY-MM-DD'}
              defaultValue={
                value[propsName].defaultValue && value[propsName].defaultValue[0]
                  ? [
                      moment(value[propsName].defaultValue[0]),
                      moment(value[propsName].defaultValue[1]),
                    ]
                  : null
              }
            />
          )
        ) : value.ctrlType == 'attach' ? (
          <Upload>
            <Button>
              <Icon type="upload" /> 上传
            </Button>
          </Upload>
        ) : value.ctrlType == 'phone' ? (
          <Input
            style={{ width: '60%' }}
            type="number"
            placeholder={value[propsName] ? value[propsName].placeholder : ''}
          />
        ) : value.ctrlType == 'www' ? (
          <Input
            style={{ width: '60%' }}
            placeholder={value[propsName] ? value[propsName].placeholder : ''}
          />
        ) : value.ctrlType == 'email' ? (
          <Input
            style={{ width: '60%' }}
            placeholder={value[propsName] ? value[propsName].placeholder : ''}
          />
        ) : value.ctrlType == 'user' ? (
          <div>
            <Icon
              style={{
                padding: 4,
                fontWeight: 'bold',
                border: '1px dashed #999',
                borderRadius: '50%',
              }}
              type="plus"
              theme="outlined"
            />
          </div>
        ) : value.ctrlType == 'material' ? (
          <Select style={{ width: '60%' }} placeholder="请选择" />
        ) : value.ctrlType == 'area' ? (
          <Cascader placeholder="请选择" />
        ) : value.ctrlType == 'applyPerson' ? (
          <div style={{ color: '#999' }}>张三(只读)</div>
        ) : value.ctrlType == 'applyTime' ? (
          <div style={{ color: '#999' }}>2018-11-11（只读）</div>
        ) : value.ctrlType == 'chooseProject' ? (
          <Button type="primary">选择项目</Button>
        ) : value.ctrlType == 'chooseMaterialTender' ? (
          <Button type="primary">选择材料招标</Button>
        ) : value.ctrlType == 'chooseLabourTender' ? (
          <Button type="primary">选择劳务招标</Button>
        ) : value.ctrlType == 'chooseMaterialSupplier' ? (
          <Button type="primary">选择材料供应商</Button>
        ) : value.ctrlType == 'chooseLabourSupplier' ? (
          <Button type="primary">选择劳务供应商</Button>
        ) : (
          ''
        )}
        {value[propsName] && value[propsName].unit ? (
          <span className="ant-form-text">{value[propsName].unit}</span>
        ) : null}
      </div>
    );
    return html;
  }
  render() {
    let { value, sortIndex } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 3 },
        md: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
        md: { span: 17 },
      },
    };

    return (
      <div className={styles.controlView}>
        <FormItem
          style={{ display: value.ctrlType == 'subfrom' ? 'none' : null }}
          {...formItemLayout}
          label={
            <span style={{ color: '#303557' }}>
              {value.props && value.props.required ? (
                <span style={{ color: '#EC684C', marginRight: 4, fontFamily: 'SimSun' }}>*</span>
              ) : null}
              {value.chnName}
            </span>
          }
        >
          {this.control(value, 'props')}
        </FormItem>
        {value.ctrlType == 'subfrom' ? (
          <Row style={{ padding: 10 }}>
            <Col span={22}>
              <div style={{ color: '#666666', fontWeight: 'Bold' }}>{value.chnName}</div>
              <table className={styles.payTaxRateTable}>
                <tbody>
                  {(value.props && value.props.options ? value.props.options : []).map(
                    (item, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            {item.extentionProps && item.extentionProps.required ? (
                              <span
                                style={{
                                  color: '#EC684C',
                                  marginRight: 4,
                                  fontWeight: '300',
                                  fontFamily: 'SimSun',
                                }}
                              >
                                *
                              </span>
                            ) : null}
                            {item.chnName}
                          </td>
                          <td>{this.control(item, 'extentionProps')}</td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </Col>
          </Row>
        ) : (
          ''
        )}
      </div>
    );
  }
}
