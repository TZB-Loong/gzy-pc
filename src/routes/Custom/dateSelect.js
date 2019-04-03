/*eslint-disable*/
import moment from 'moment';
import React, { Component } from 'react';
import { Icon, Input, Select, Checkbox, DatePicker, Form, Row, Col, List, Radio } from 'antd';
import styles from './style.less';
import { connect } from 'dva';
const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;

@Form.create()
@connect(({ common }) => ({
  common,
}))
export default class DateSelect extends Component {
  constructor(props) {
    super(props);
  }
  state = {};
  // 监听props变化
  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  render() {
    let _this = this;
    let { checkboxValue, checkboxIndex } = this.props;
    let propsName = this.props.propsName;
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

    return (
      <div>
        {checkboxValue.ctrlType == 'date' ? (
          <FormItem {...formItemLayout} label="默认项：">
            <Row>
              <Col span={11}>
                <Select
                  defaultValue={
                    checkboxValue && checkboxValue[propsName] && checkboxValue[propsName].dateValue
                      ? checkboxValue[propsName].dateValue
                      : 'none'
                  }
                  onSelect={value => {
                    this.props.changePropsData('dateValue', value);
                    if (value == 'none') {
                      this.props.changePropsData('defaultValue', 'none');
                    } else if (value == 'today') {
                      this.props.changePropsData('defaultValue', undefined);
                    }
                  }}
                >
                  <Option value="none">不设置</Option>
                  <Option value="today">当日</Option>
                  {/*<Option value="nextDay">下一天</Option>*/}
                  <Option value="designationDate">指定日期</Option>
                </Select>
              </Col>
              <Col span={1} />
              {checkboxValue &&
              checkboxValue[propsName] &&
              checkboxValue[propsName].dateValue == 'designationDate' ? (
                <Col span={12}>
                  {checkboxValue &&
                  checkboxValue[propsName] &&
                  checkboxValue[propsName].showTime ? (
                    <DatePicker
                      style={{ width: 170 }}
                      showTime={{ format: 'HH:mm' }}
                      format="YYYY-MM-DD HH:mm"
                      defaultValue={
                        checkboxValue[propsName].defaultValue == 'none'
                          ? ''
                          : moment(checkboxValue[propsName].defaultValue)
                      }
                      onChange={value => {
                        this.props.changePropsData(
                          'defaultValue',
                          moment(value).format('YYYY-MM-DD HH:mm')
                        );
                      }}
                    />
                  ) : (
                    <DatePicker
                      format="YYYY-MM-DD"
                      defaultValue={
                        checkboxValue[propsName].defaultValue == 'none'
                          ? ''
                          : moment(checkboxValue[propsName].defaultValue)
                      }
                      onChange={value => {
                        this.props.changePropsData(
                          'defaultValue',
                          moment(value).format('YYYY-MM-DD')
                        );
                      }}
                    />
                  )}
                </Col>
              ) : null}
            </Row>
          </FormItem>
        ) : null}
        {checkboxValue.ctrlType == 'datearea' ? (
          <FormItem {...formItemLayout} label="默认项：">
            <Row>
              <Col span={11}>
                <Select
                  defaultValue={
                    checkboxValue && checkboxValue[propsName] && checkboxValue[propsName].dateValue
                      ? checkboxValue[propsName].dateValue
                      : 'none'
                  }
                  onSelect={value => {
                    this.props.changePropsData('dateValue', value);
                    if (value == 'none') {
                      this.props.changePropsData('defaultValue', null);
                    } else if (value == 'today') {
                      this.props.changePropsData('defaultValue', undefined);
                    }
                  }}
                >
                  <Option value="none">不设置</Option>
                  {/*<Option value="today">当日</Option>*/}
                  {/*<Option value="nextDay">下一天</Option>*/}
                  <Option value="designationDate">指定日期</Option>
                </Select>
              </Col>
            </Row>
            {checkboxValue &&
            checkboxValue[propsName] &&
            checkboxValue[propsName].dateValue == 'designationDate' ? (
              <div>
                {checkboxValue && checkboxValue[propsName] && checkboxValue[propsName].showTime ? (
                  <RangePicker
                    style={{ width: 280 }}
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    defaultValue={
                      checkboxValue[propsName].defaultValue &&
                      checkboxValue[propsName].defaultValue[0]
                        ? [
                            moment(checkboxValue[propsName].defaultValue[0]),
                            moment(checkboxValue[propsName].defaultValue[1]),
                          ]
                        : null
                    }
                    onChange={value => {
                      this.props.changePropsData('defaultValue', [
                        moment(value[0]).format('YYYY-MM-DD HH:mm'),
                        moment(value[1]).format('YYYY-MM-DD HH:mm'),
                      ]);
                    }}
                  />
                ) : (
                  <RangePicker
                    format="YYYY-MM-DD"
                    defaultValue={
                      checkboxValue[propsName].defaultValue &&
                      checkboxValue[propsName].defaultValue[0]
                        ? [
                            moment(checkboxValue[propsName].defaultValue[0]),
                            moment(checkboxValue[propsName].defaultValue[1]),
                          ]
                        : null
                    }
                    onChange={value => {
                      this.props.changePropsData('defaultValue', [
                        moment(value[0]).format('YYYY-MM-DD'),
                        moment(value[1]).format('YYYY-MM-DD'),
                      ]);
                    }}
                  />
                )}
              </div>
            ) : null}
          </FormItem>
        ) : null}
      </div>
    );
  }
}
