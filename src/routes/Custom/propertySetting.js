/*eslint-disable*/
import moment from 'moment';
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
  List,
  Radio,
} from 'antd';
import styles from './style.less';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
const confirm = Modal.confirm;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { TextArea } = Input;
const ListItem = List.Item;
const RadioGroup = Radio.Group;
import SubformSetting from './subformSetting';
import DateSelect from './dateSelect';
import ControlType from './controlType.json';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

//操作区域样式
const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  background: isDragging ? '#e2f3ff' : 'transparent',
  ...draggableStyle,
});

@Form.create()
@connect(({ common }) => ({
  common,
}))
export default class propertySetting extends Component {
  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
  }
  state = {
    changeItems:
      this.props.checkboxValue.props && this.props.checkboxValue.props.options
        ? this.props.checkboxValue.props.options
        : [],
    all_ctrlType: [
      { type: 'text', typeName: '单行文本' },
      { type: 'textarea', typeName: '多行文本' },
      { type: 'number', typeName: '数字' },
      { type: 'money', typeName: '金额' },
      { type: 'radio', typeName: '单选框' },
      { type: 'checkbox', typeName: '多选框' },
      { type: 'dropdown', typeName: '下拉列表' },
      { type: 'date', typeName: '日期' },
      { type: 'datearea', typeName: '日期区间' },
      { type: 'attach', typeName: '附件' },
      { type: 'subfrom', typeName: '子表单' },
      { type: 'phone', typeName: '电话号码' },
      { type: 'www', typeName: '网址' },
      { type: 'email', typeName: '邮箱' },
      { type: 'user', typeName: '人员选择' },
      { type: 'material', typeName: '选择材料分类' },
      { type: 'area', typeName: '地区' },
      { type: 'applyPerson', typeName: '申请人' },
      { type: 'applyTime', typeName: '申请时间' },
      { type: 'chooseProject', typeName: '选择项目' },
      //{ type: 'chooseMaterialTender', typeName: '选择材料招标' },
      //{ type: 'chooseLabourTender', typeName: '选择劳务招标' },
      { type: 'chooseMaterialSupplier', typeName: '选择材料供应商' },
      { type: 'chooseLabourSupplier', typeName: '选择劳务供应商' },
    ],
    selected: [],
    checkboxIndex: this.props.checkboxIndex ? this.props.checkboxIndex : null,
    previewVisible: false,
    subitems: [],
    subvalue: {},
    sortIndex: null,
  };
  // 监听props变化
  UNSAFE_componentWillReceiveProps(nextProps) {
    // console.log(nextProps.selected);
    if (
      nextProps.checkboxValue.props &&
      nextProps.checkboxValue.props.options != this.state.changeItems
    ) {
      // console.log(nextProps.checkboxValue);
      console.log(nextProps.checkboxIndex);
      // console.log(nextProps.selected);
      this.setState(
        {
          changeItems: nextProps.checkboxValue.props.options || [],
        },
        () => {
          // console.log(this.state);
        }
      );
    }
  }

  eachType(type) {
    let typeName = '';
    this.state.all_ctrlType.map((item, index) => {
      if (item.type == type) {
        typeName = item.typeName;
        return;
      }
    });
    return typeName;
  }
  // 移动
  onDragEnd(result) {
    if (!result.destination) {
      return;
    }
    const changeItems = reorder(
      this.state.changeItems,
      result.source.index,
      result.destination.index
    );

    this.setState({
      changeItems,
    });
    this.changePropsData('options', this.state.changeItems);
  }
  //   options添加一项
  addItem(type) {
    let theItems = this.state.changeItems;
    if (type == 'subfrom') {
      theItems.push({
        ctrlType: '',
        chnName: '',
        ctrlName: '',
        extentionProps: {
          required: false,
          placeholder: '',
          options: null,
          format: null,
          maxLength: 0,
          defaultValue: '',
          rule: '',
          unit: null,
          readonly: false,
        },
      });
    } else {
      theItems.push({ value: '选项' + (theItems.length + 1) });
    }
    this.setState({
      changeItems: theItems,
    });

    this.changePropsData('options', this.state.changeItems);
  }
  //   options移除一项
  removeItem(sortIndex) {
    let theItems = this.state.changeItems;
    theItems.splice(sortIndex, 1);
    this.setState({
      changeItems: theItems,
    });
    this.changePropsData('options', this.state.changeItems);
  }

  //设置label
  changeData(type, value) {
    let theItems = this.props.items;
    let checkboxIndex = this.props.checkboxIndex;
    let selected = this.props.that.state.selected;
    selected[checkboxIndex][type] = value;
    this.props.that.setState({ selected });
    // 更新父组件数据
    // this.props.changeState(theItems);
  }
  // 设置props属性
  changePropsData(type, value) {
    let checkboxIndex = this.props.checkboxIndex;
    let checkboxValue = this.props.checkboxValue;
    // 更新父组件数据
    let selected = this.props.that.state.selected;
    selected[checkboxIndex].props = Object.assign(selected[checkboxIndex].props, { [type]: value });
    // selected[checkboxIndex].props[type] = value;
    this.props.that.setState({ selected });
    // this.props.changeState(theItems);
  }

  //   移除父组件数据一项
  removeparentItem(index, name) {
    // let theItems = this.props.items;
    let selected = this.props.that.state.selected,
      self = this;
    confirm({
      title: '确认要删除"' + name + '"控件么?',
      // content: '确认要删除此控件么?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        selected.splice(index, 1);
        self.props.that.setState({ selected, checkboxIndex: null });
        // this.props.changeState(theItems);
      },
      onCancel() {
        //
      },
    });
  }
  // 修改options选项
  changeItemsData(type, value, index) {
    let itemData = this.state.changeItems;
    if (type == 'subfrom') {
      let data;
      // 子表单选择控件
      ControlType.map((item, index) => {
        if (item.ctrlType == value) {
          data = item;
          return;
        }
      });

      itemData[index] = data;
    } else if (
      (type == 'checked' && this.props.checkboxValue.ctrlType == 'radio') ||
      (type == 'checked' && this.props.checkboxValue.ctrlType == 'dropdown')
    ) {
      // 单选
      itemData.map((item, i) => {
        itemData[i].checked = false;
      });
      itemData[index].checked = true;
      this.changePropsData('defaultValue', itemData[index].value);
    } else if (type == 'checked' && this.props.checkboxValue.ctrlType == 'checkbox') {
      // 多选
      itemData[index][type] = value;
      console.log(itemData);
      let defaultValue = [];
      itemData.map((item, index) => {
        if (item.checked == true) {
          defaultValue.push(item.value);
        }
      });
      this.changePropsData('defaultValue', defaultValue);
    } else {
      itemData[index][type] = value;
    }
    this.setState({
      changeItems: itemData,
    });
    this.changePropsData('options', this.state.changeItems);
  }

  changeOption(value) {
    let checkboxIndex = this.props.checkboxIndex;
    let selected = this.props.that.state.selected;
    selected[checkboxIndex].props.options = value;
    this.props.that.setState({ selected });
  }
  DragItem() {
    let { checkboxValue, items, selected, checkboxIndex } = this.props;
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div ref={provided.innerRef}>
              {this.state.changeItems.map((value, sortIndex) => (
                <Draggable
                  key={sortIndex + 'form'}
                  draggableId={sortIndex + 'form'}
                  index={sortIndex}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                    >
                      <div
                        style={{
                          paddingBottom: 5,
                          display: 'flex',
                          alignItems: 'center',
                          border: sortIndex == this.state.checkboxIndex ? '2px solid #1890ff' : '',
                        }}
                      >
                        <div style={{ padding: '5px 5px 0' }}>
                          <Icon
                            type="retweet"
                            theme="outlined"
                            style={{ fontSize: '20px', verticalAlign: 'midden' }}
                          />
                        </div>
                        <div style={{ width: '60%', paddingRight: 5 }}>
                          {checkboxValue.ctrlType == 'subfrom' ? (
                            <Select
                              value={value.chnName || '请选择'}
                              placeholder={value.chnName || '请选择'}
                              onSelect={value => {
                                this.changeItemsData('subfrom', value, sortIndex);
                              }}
                            >
                              {this.state.all_ctrlType.map((item, index) => {
                                return (
                                  <Option
                                    key={index}
                                    value={item.type}
                                    style={{ display: item.type == 'subfrom' ? 'none' : null }}
                                  >
                                    {item.typeName}
                                  </Option>
                                );
                              })}
                            </Select>
                          ) : (
                            <Input
                              defaultValue={value.value}
                              value={value.value}
                              onChange={e => {
                                this.changeItemsData('value', e.target.value, sortIndex);
                              }}
                            />
                          )}
                        </div>
                        {checkboxValue.ctrlType == 'subfrom' ? (
                          <Icon
                            type="edit"
                            theme="outlined"
                            onClick={() => {
                              this.setState({
                                previewVisible: true,
                                subitems: checkboxValue.props.options,
                                subvalue: value,
                                sortIndex: sortIndex,
                              });
                            }}
                            style={{ cursor: 'pointer', padding: '0 10px' }}
                          />
                        ) : (
                          <Checkbox
                            onChange={e => {
                              {
                                this.changeItemsData('checked', e.target.checked, sortIndex);
                              }
                            }}
                            checked={value.checked ? value.checked : false}
                          />
                        )}
                        <Icon
                          onClick={() => {
                            this.removeItem(sortIndex);
                          }}
                          type="delete"
                          theme="outlined"
                          style={{ padding: 10, cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
  render() {
    let _this = this;
    let { checkboxValue, items, selected, checkboxIndex } = this.props;
    const { getFieldDecorator } = this.props.form;
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
      <div>
        <p
          style={{
            display: checkboxIndex != null ? 'none' : 'block',
            textAlign: 'center',
            marginTop: '80px',
            color: '#bdbdbd',
          }}
        >
          当前没有选中任何控件
        </p>
        <Form
          style={{ marginTop: 8, padding: 10, display: checkboxIndex == null ? 'none' : 'block' }}
        >
          <FormItem {...formItemLayout} label="控件设置">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                控件类型“
                {this.eachType(selected[checkboxIndex] ? selected[checkboxIndex].ctrlType : '')}”
              </span>
              <Icon
                onClick={() => {
                  this.removeparentItem(
                    checkboxIndex,
                    this.eachType(selected[checkboxIndex] ? selected[checkboxIndex].ctrlType : '')
                  );
                }}
                style={{ fontSize: 18, padding: 10, cursor: 'pointer' }}
                type="delete"
                theme="filled"
              />
            </div>
          </FormItem>
          {checkboxValue.ctrlType == 'date' || checkboxValue.ctrlType == 'datearea' ? (
            <FormItem {...formItemLayout} label="类型：">
              <RadioGroup
                onChange={e => {
                  if (e.target.value == 'dateTime') {
                    this.changePropsData('showTime', true);
                    this.changePropsData('format', 'YYYY-MM-DD HH:mm');
                  } else {
                    this.changePropsData('showTime', false);
                    this.changePropsData('format', 'YYYY-MM-DD');
                  }
                }}
              >
                <Radio
                  value="date"
                  checked={
                    selected[checkboxIndex] &&
                    selected[checkboxIndex].props &&
                    selected[checkboxIndex].props.showTime != true
                  }
                >
                  日期
                </Radio>
                <Radio
                  value="dateTime"
                  checked={
                    selected[checkboxIndex] &&
                    selected[checkboxIndex].props &&
                    selected[checkboxIndex].props.showTime == true
                  }
                >
                  日期和时间
                </Radio>
              </RadioGroup>
            </FormItem>
          ) : null}

          <FormItem {...formItemLayout} label="名称：">
            <Input
              onChange={e => {
                this.changeData('chnName', e.target.value);
              }}
              value={selected[checkboxIndex] ? selected[checkboxIndex].chnName : ''}
              placeholder="请输入名称"
            />
          </FormItem>
          {checkboxValue.ctrlType == 'text' ||
          checkboxValue.ctrlType == 'textarea' ||
          checkboxValue.ctrlType == 'phone' ||
          checkboxValue.ctrlType == 'www' ||
          checkboxValue.ctrlType == 'email' ||
          checkboxValue.ctrlType == 'number' ||
          checkboxValue.ctrlType == 'money' ? (
            <FormItem {...formItemLayout} label="引导文字：">
              <Input
                onChange={e => {
                  this.changePropsData('placeholder', e.target.value);
                }}
                value={
                  selected[checkboxIndex] && selected[checkboxIndex].props
                    ? selected[checkboxIndex].props.placeholder
                    : ''
                }
                placeholder="填写引导文字"
              />
            </FormItem>
          ) : null}
          {checkboxValue.ctrlType == 'text' || checkboxValue.ctrlType == 'textarea' ? (
            <FormItem {...formItemLayout} label="文本长度：">
              <InputNumber
                min={0}
                onChange={e => {
                  this.changePropsData('maxLength', e);
                }}
                value={
                  selected[checkboxIndex] && selected[checkboxIndex].props
                    ? selected[checkboxIndex].props.maxLength
                    : ''
                }
              />
            </FormItem>
          ) : null}
          {checkboxValue.ctrlType == 'phone' ? (
            <FormItem {...formItemLayout} label="类型：">
              <RadioGroup
                defaultValue="mobile"
                onChange={e => {
                  this.changePropsData('phoneType', e.target.value);
                }}
              >
                <Radio
                  checked={
                    selected[checkboxIndex] &&
                    selected[checkboxIndex].props &&
                    selected[checkboxIndex].props.phoneType != 'landline'
                  }
                  value="mobile"
                >
                  手机
                </Radio>
                <Radio
                  checked={
                    selected[checkboxIndex] &&
                    selected[checkboxIndex].props &&
                    selected[checkboxIndex].props.phoneType == 'landline'
                  }
                  value="landline"
                >
                  座机
                </Radio>
              </RadioGroup>
            </FormItem>
          ) : null}

          {checkboxValue.ctrlType == 'number' || checkboxValue.ctrlType == 'money' ? (
            <div>
              <FormItem {...formItemLayout} label="单位：">
                <Input
                  onChange={e => {
                    this.changePropsData('unit', e.target.value);
                  }}
                  value={
                    selected[checkboxIndex] && selected[checkboxIndex].props
                      ? selected[checkboxIndex].props.unit
                      : ''
                  }
                  placeholder="填写单位"
                />
              </FormItem>
              <FormItem {...formItemLayout} label="小数点：">
                <InputNumber
                  min={0}
                  max={10}
                  onChange={e => {
                    this.changePropsData('point', e);
                  }}
                  value={
                    selected[checkboxIndex] && selected[checkboxIndex].props
                      ? selected[checkboxIndex].props.point
                      : '2'
                  }
                  defaultValue={2}
                />
              </FormItem>
            </div>
          ) : null}

          {checkboxValue.ctrlType == 'dropdown' ||
          checkboxValue.ctrlType == 'checkbox' ||
          checkboxValue.ctrlType == 'radio' ? (
            <FormItem {...formItemLayout} label="选项：">
              <div>{_this.DragItem()}</div>
              <div>
                <span
                  onClick={() => {
                    this.addItem();
                  }}
                  style={{ color: '#4B85F8', cursor: 'pointer' }}
                >
                  &nbsp;+添加一项
                </span>
              </div>
            </FormItem>
          ) : null}
          {checkboxValue.ctrlType ? (
            <DateSelect
              checkboxValue={checkboxValue}
              checkboxIndex={checkboxIndex}
              propsName={'props'}
              changePropsData={this.changePropsData.bind(this)}
            />
          ) : null}

          {/*{checkboxValue.ctrlType == 'area' ? (
            <FormItem {...formItemLayout} label="默认项：">
              <Select
                defaultValue="请选择"
                onSelect={e => {
                  this.changePropsData('format', e);
                }}
              >
                <Option value="province">省</Option>
                <Option value="city">省-市</Option>
                <Option value="district">省-市-县</Option>
              </Select>
            </FormItem>
          ) : null}*/}
          {checkboxValue.ctrlType == 'subfrom' ? (
            <FormItem {...formItemLayout} label="明细项：">
              <div>{_this.DragItem()}</div>

              <div>
                <span
                  onClick={() => {
                    this.addItem('subfrom');
                  }}
                  style={{ color: '#4B85F8', cursor: 'pointer' }}
                >
                  +增加明细项
                </span>
              </div>
            </FormItem>
          ) : null}
          {checkboxValue.ctrlType == 'subfrom' ? null : (
            <FormItem {...formItemLayout} label="是否必填">
              {/*{checkboxValue.ctrlType == 'phone' ? (
                <div>
                  <Checkbox>提交时验证格式：数字组成</Checkbox>
                </div>
              ) : null}*/}
              <Checkbox
                onChange={e => {
                  this.changePropsData('required', e.target.checked);
                }}
                checked={
                  selected[checkboxIndex] && selected[checkboxIndex].props
                    ? selected[checkboxIndex].props.required
                    : false
                }
              >
                必填项
              </Checkbox>
            </FormItem>
          )}
        </Form>
        <SubformSetting
          items={this.state.subitems}
          previewVisible={this.state.previewVisible}
          checkboxIndex={this.state.sortIndex}
          checkboxValue={this.state.subvalue}
          changeOption={this.changeOption.bind(this)}
          that={this}
        />
      </div>
    );
  }
}
