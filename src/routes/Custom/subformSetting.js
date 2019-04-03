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
import BasicSetting from '../Custom/basicSetting';
import DateSelect from './dateSelect';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { TextArea } = Input;
const ListItem = List.Item;
const RadioGroup = Radio.Group;

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
export default class subformSetting extends Component {
  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
  }
  state = {
    changeItems:
      this.props.checkboxValue.extentionProps && this.props.checkboxValue.extentionProps.options
        ? this.props.checkboxValue.extentionProps.options
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
    previewVisible: this.props.previewVisible,
    items: this.props.items ? this.props.items : [],
  };
  // 监听props变化
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.previewVisible == true) {
      console.log(nextProps.items);
      this.setState({
        changeItems: nextProps.checkboxValue.extentionProps.options || [],
        items: nextProps.items ? nextProps.items : [],
        olditems: JSON.stringify(nextProps.items),
      });
    }
  }
  componentDidMount() {
    console.log(this.state.items);
  }
  // 控件设置控件类型“单行文本”
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
  }
  //   options添加一项
  addItem(type) {
    let theItems = this.state.changeItems;
    if (type == 'subfrom') {
      theItems.push({ ctrlType: '', chnName: '', ctrlName: '', extentionProps: {} });
    } else {
      theItems.push({ value: '选项' + (theItems.length + 1) });
    }
    this.setState({
      changeItems: theItems,
    });
  }
  //   options移除一项
  removeItem(sortIndex) {
    let theItems = this.state.changeItems;
    theItems.splice(sortIndex, 1);
    this.setState({
      changeItems: theItems,
    });
  }

  // 修改[]数据
  changeData(type, value) {
    let items = this.state.items;
    let checkboxIndex = this.props.checkboxIndex;
    items[checkboxIndex][type] = value;
    this.setState({ items });
  }
  // 修改[extentionProps:{}]的数据
  changePropsData(type, value) {
    let items = this.state.items;
    let checkboxIndex = this.props.checkboxIndex;
    items[checkboxIndex].extentionProps[type] = value;
    this.setState({ items });
  }

  // 修改options选项
  changeItemsData(type, value, index) {
    let itemData = this.state.changeItems;
    if (type == 'subfrom') {
      let data = {
        ctrlType: value,
        chnName: this.eachType(value),
        ctrlName: this.eachType(value),
        extentionProps: {},
      };
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
  }
  addOption() {
    let items = this.state.items;
    this.changePropsData('options', this.state.changeItems);

    this.props.changeOption(items);
    this.props.that.setState({
      previewVisible: false,
    });
  }
  handleCancel = () => {
    console.log(JSON.parse(this.state.olditems));
    // 取消时数据还原
    this.props.changeOption(JSON.parse(this.state.olditems));
    this.props.that.setState({
      previewVisible: false,
    });
  };
  subDragItem() {
    let { checkboxValue, checkboxIndex, previewVisible } = this.props;
    let { items } = this.state;
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
                              onSelect={value => {
                                this.changeItemsData('subfrom', value, sortIndex);
                              }}
                            >
                              {this.state.all_ctrlType.map((item, index) => {
                                return (
                                  <Option key={index} value={item.type}>
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
                          <Icon type="edit" theme="outlined" />
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
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
  render() {
    let { checkboxValue, checkboxIndex, previewVisible } = this.props;
    const { getFieldDecorator } = this.props.form;
    let { items } = this.state;
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
        <Modal
          title={'设置' + this.eachType(items[checkboxIndex] ? items[checkboxIndex].ctrlType : '')}
          visible={previewVisible}
          onCancel={this.handleCancel}
          destroyOnClose={true}
          onOk={() => {
            this.addOption();
          }}
        >
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8, padding: 10 }}>
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
                      items[checkboxIndex] &&
                      items[checkboxIndex].extentionProps &&
                      items[checkboxIndex].extentionProps.showTime != true
                    }
                  >
                    日期
                  </Radio>
                  <Radio
                    value="dateTime"
                    checked={
                      items[checkboxIndex] &&
                      items[checkboxIndex].extentionProps &&
                      items[checkboxIndex].extentionProps.showTime == true
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
                value={items[checkboxIndex] ? items[checkboxIndex].chnName : ''}
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
                    items[checkboxIndex] && items[checkboxIndex].extentionProps
                      ? items[checkboxIndex].extentionProps.placeholder
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
                    items[checkboxIndex] && items[checkboxIndex].extentionProps
                      ? items[checkboxIndex].extentionProps.maxLength
                      : ''
                  }
                />
              </FormItem>
            ) : null}
            {checkboxValue.ctrlType == 'phone' ? (
              <FormItem {...formItemLayout} label="类型：">
                <RadioGroup
                  defaultValue={
                    (items[checkboxIndex] &&
                      items[checkboxIndex].extentionProps &&
                      items[checkboxIndex].extentionProps.phoneType) ||
                    'mobile'
                  }
                  onChange={e => {
                    this.changePropsData('phoneType', e.target.value);
                  }}
                >
                  <Radio value="mobile">手机</Radio>
                  <Radio value="landline">座机</Radio>
                </RadioGroup>
              </FormItem>
            ) : null}

            {checkboxValue.ctrlType == 'number' || checkboxValue.ctrlType == 'money' ? (
              <Row>
                <Col span={24}>
                  <FormItem {...formItemLayout} label="单位：">
                    <Input
                      onChange={e => {
                        this.changePropsData('unit', e.target.value);
                      }}
                      value={
                        items[checkboxIndex] && items[checkboxIndex].extentionProps
                          ? items[checkboxIndex].extentionProps.unit
                          : ''
                      }
                      placeholder="填写单位"
                    />
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem {...formItemLayout} label="小数点">
                    <InputNumber
                      min={0}
                      max={10}
                      onChange={e => {
                        this.changePropsData('point', e);
                      }}
                      value={
                        items[checkboxIndex] && items[checkboxIndex].extentionProps
                          ? items[checkboxIndex].extentionProps.point
                          : '2'
                      }
                      defaultValue={2}
                    />
                  </FormItem>
                </Col>
              </Row>
            ) : null}

            {checkboxValue.ctrlType == 'dropdown' ||
            checkboxValue.ctrlType == 'checkbox' ||
            checkboxValue.ctrlType == 'radio' ? (
              <FormItem {...formItemLayout} label="选项：">
                <div>{this.subDragItem()}</div>
                <div>
                  <span
                    onClick={() => {
                      this.addItem();
                    }}
                    style={{ color: '#4B85F8' }}
                  >
                    +添加一项
                  </span>
                </div>
              </FormItem>
            ) : null}
            {checkboxValue.ctrlType ? (
              <DateSelect
                checkboxValue={checkboxValue}
                checkboxIndex={checkboxIndex}
                propsName={'extentionProps'}
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
                  items[checkboxIndex] && items[checkboxIndex].extentionProps
                    ? items[checkboxIndex].extentionProps.required
                    : false
                }
              >
                必填项
              </Checkbox>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
