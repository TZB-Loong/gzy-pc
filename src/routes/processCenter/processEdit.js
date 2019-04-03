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
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import PropertySetting from './propertySetting';
import ControlView from '../Custom/controlView';
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

export default class processEdit extends Component {
  state = {
    items: [
      { ctrlType: 'text', chnName: '单行文本', props: { placeholder: 'text' } },
      { ctrlType: 'textarea', chnName: '多行文本', props: { placeholder: 'textarea' } },
      { ctrlType: 'number', chnName: '数字', props: { placeholder: '' } },
      { ctrlType: 'money', chnName: '金额', props: { placeholder: '' } },
      { ctrlType: 'radio', chnName: '单选框', props: { placeholder: 'radio' } },
      { ctrlType: 'checkbox', chnName: '多选框', props: { placeholder: 'checkbox' } },
      { ctrlType: 'dropdown', chnName: '下拉列表', props: { placeholder: 'dropdown' } },
      { ctrlType: 'date', chnName: '日期', props: { placeholder: 'date' } },
      { ctrlType: 'datearea', chnName: '日期区间', props: { placeholder: 'datearea' } },
      { ctrlType: 'phone', chnName: '电话号码', props: { placeholder: 'phone' } },
      { ctrlType: 'attach', chnName: '附件', props: { placeholder: 'attach' } },
      {
        ctrlType: 'subfrom',
        chnName: '子表单',
        props: { placeholder: 'subfrom', options: [{ value: '选项1' }] },
      },
      { ctrlType: 'www', chnName: '网址', props: { placeholder: 'www' } },
      { ctrlType: 'email', chnName: '邮箱', props: { placeholder: 'email' } },
      { ctrlType: 'user', chnName: '人员选择', props: { placeholder: 'user' } },
      { ctrlType: 'area', chnName: '地区', props: { placeholder: 'area' } },
      { ctrlType: 'applyPerson', chnName: '申请人', props: { placeholder: 'applyPerson' } },
      { ctrlType: 'applyTime', chnName: '申请日期', props: { placeholder: 'applyTime' } },
      { ctrlType: 'chooseProject', chnName: '选择项目', props: { placeholder: 'chooseProject' } },
    ],
    checkboxIndex: 0,
    checkboxValue: {},
  };

  componentDidMount() {}
  //   移动
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      items: arrayMove(this.state.items, oldIndex, newIndex),
      checkboxIndex: newIndex,
    });
    console.log(this.state.items);
  };
  //   添加一项
  addItem(type) {
    let theItems = this.state.items;
    theItems.push({ ctrlType: type, chnName: type, props: {} });
    this.setState({
      items: theItems,
    });
    console.log(theItems);
  }
  //   移除一项
  removeItem(sortIndex) {
    let theItems = this.state.items;
    theItems.splice(sortIndex, 1);
    this.setState({
      items: theItems,
    });
  }

  changeState(theItems) {
    this.setState({
      items: theItems,
    });
  }
  render() {
    let { checkboxValue } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
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
    const SortableItem = SortableElement(({ value, sortIndex }) => (
      <div
        style={{
          padding: 10,
          background: '#fff',
          position: 'relative',
          border: sortIndex == this.state.checkboxIndex ? '2px solid #1890ff' : '',
        }}
        onClick={() => {
          this.setState({ checkboxIndex: sortIndex, checkboxValue: value });
        }}
      >
        {/*控件显示*/}
        <ControlView value={value} />
        {/*<FormItem
          {...formItemLayout}
          label={value.chnName + '：'}
          onClick={() => {
            this.setState({ checkboxIndex: sortIndex, checkboxValue: value });
          }}
        >
          {value.ctrlType == 'text' ? (
            <Input placeholder={value.props ? value.props.placeholder : ''} />
          ) : value.ctrlType == 'textarea' ? (
            <TextArea placeholder={value.props ? value.props.placeholder : ''} />
          ) : value.ctrlType == 'number' ? (
            <InputNumber placeholder={value.props ? value.props.placeholder : ''} />
          ) : value.ctrlType == 'money' ? (
            <InputNumber placeholder={value.props ? value.props.placeholder : ''} />
          ) : value.ctrlType == 'radio' ? (
            <RadioGroup>
              {(value.props && value.props.options ? value.props.options : []).map(
                (item, index) => {
                  return (
                    <Radio key={index} value={item.value} checked={item.checked}>
                      {item.value}
                    </Radio>
                  );
                }
              )}
            </RadioGroup>
          ) : value.ctrlType == 'dropdown' ? (
            <Select>
              {(value.props && value.props.options ? value.props.options : []).map(
                (item, index) => {
                  return (
                    <Option key={index} value={item.value} checked={item.checked}>
                      {item.value}
                    </Option>
                  );
                }
              )}
            </Select>
          ) : value.ctrlType == 'checkbox' ? (
            //<CheckboxGroup>
            (value.props && value.props.options ? value.props.options : []).map((item, index) => {
              return (
                <Checkbox key={index} value={item.value} checked={item.checked}>
                  {item.value}
                </Checkbox>
              );
            })
          ) : //</CheckboxGroup>
          value.ctrlType == 'date' ? (
            <DatePicker />
          ) : value.ctrlType == 'datearea' ? (
            <RangePicker />
          ) : value.ctrlType == 'phone' ? (
            <Input type="number" placeholder={value.props ? value.props.placeholder : ''} />
          ) : (
            ''
          )}
          {value.props && value.props.unit ? (
            <span className="ant-form-text">{value.props.unit}</span>
          ) : null}
        </FormItem>*/}
        <Button
          onClick={() => {
            this.removeItem(sortIndex);
          }}
          style={{ position: 'absolute', right: 10, top: 5 }}
        >
          删除
        </Button>
      </div>
    ));
    const SortableList = SortableContainer(({ items }) => {
      return (
        <Form>
          {items.map((value, index) => (
            <SortableItem key={`item-${index}`} index={index} sortIndex={index} value={value} />
          ))}
        </Form>
      );
    });
    return (
      <Row style={{ marginTop: 100 }}>
        <Col span={4}>
          <Button
            onClick={() => {
              this.addItem('text');
            }}
          >
            添加输入
          </Button>
          <Button
            onClick={() => {
              this.addItem('dropdown');
            }}
          >
            添加select
          </Button>
          <Button
            onClick={() => {
              this.addItem('checkbox');
            }}
          >
            添加Checkbox
          </Button>
          <Button
            onClick={() => {
              this.addItem('number');
            }}
          >
            添加InputNumber
          </Button>
        </Col>

        <Col span={14}>
          {/*pressDelay: 延时0.3秒移动*/}
          <SortableList items={this.state.items} pressDelay={300} onSortEnd={this.onSortEnd} />
        </Col>

        <Col span={6} style={{ background: '#fff' }}>
          {/*设置属性*/}
          <PropertySetting
            items={this.state.items}
            checkboxIndex={this.state.checkboxIndex}
            checkboxValue={this.state.checkboxValue}
            changeState={this.changeState.bind(this)}
          />
        </Col>
      </Row>
    );
  }
}
