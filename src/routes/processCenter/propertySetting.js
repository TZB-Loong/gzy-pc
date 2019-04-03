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
  List,
  Radio,
} from 'antd';
import styles from './style.less';
import { connect } from 'dva';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import BasicSetting from '../Custom/basicSetting';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { TextArea } = Input;
const ListItem = List.Item;
const RadioGroup = Radio.Group;

@Form.create()
@connect(({ common }) => ({
  common,
}))
export default class propertySetting extends Component {
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
      { type: 'relation', typeName: '关联其它表单' },
      { type: 'phone', typeName: '电话号码' },
      { type: 'www', typeName: '网址' },
      { type: 'email', typeName: '邮箱' },
      { type: 'user', typeName: '人员选择' },
      { type: 'material', typeName: '选择材料分类' },
      { type: 'area', typeName: '地区' },
      { type: 'applyPerson', typeName: '申请人' },
      { type: 'applyTime', typeName: '申请时间' },
      { type: 'chooseProject', typeName: '选择项目' },
      { type: 'chooseMaterialTender', typeName: '选择材料招标' },
      { type: 'chooseLabourTender', typeName: '选择劳务招标' },
      { type: 'chooseMaterialSupplier', typeName: '选择材料供应商' },
      { type: 'chooseLabourSupplier', typeName: '选择劳务供应商' },
    ],
  };
  // 监听props变化
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.checkboxValue.props &&
      nextProps.checkboxValue.props.options != this.state.changeItems
    ) {
      console.log(nextProps.checkboxValue.options);
      this.setState({
        changeItems: nextProps.checkboxValue.props.options || [],
      });
    }
  }
  componentDidMount() {}
  // 控件设置控件类型“单行文本”
  eachType(type) {
    console.log(type);
    let typeName = '';
    this.state.all_ctrlType.map((item, index) => {
      if (item.type == type) {
        console.log(item.typeName);
        typeName = item.typeName;
        return;
      }
    });
    return typeName;
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      changeItems: arrayMove(this.state.changeItems, oldIndex, newIndex),
      //changeIndex: newIndex,
    });
    this.changePropsData('options', this.state.changeItems);
    console.log(this.state.changeItems);
  };
  //   options添加一项
  addItem(type) {
    let theItems = this.state.changeItems;
    if (type == 'subfrom') {
      theItems.push({ ctrlType: '', chnName: '', props: {} });
    } else {
      theItems.push({ value: '选项' + (theItems.length + 1) });
    }
    console.log(theItems);
    this.setState({
      changeItems: theItems,
    });
    this.changePropsData('options', this.state.changeItems);
    console.log(theItems);
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

  // 修改[]数据
  changeData(type, value) {
    let theItems = this.props.items;
    let checkboxIndex = this.props.checkboxIndex;
    theItems[checkboxIndex][type] = value;
    // console.log(theItems[checkboxIndex][type])
    // 更新父组件数据
    this.props.changeState(theItems);
  }
  // 修改[props:{}]的数据
  changePropsData(type, value) {
    let theItems = this.props.items;
    let checkboxIndex = this.props.checkboxIndex;
    theItems[checkboxIndex].props[type] = value;
    // console.log(theItems[checkboxIndex][type])
    // 更新父组件数据
    console.log(theItems);
    this.props.changeState(theItems);
  }

  //   移除父组件数据一项
  removeparentItem(index) {
    let theItems = this.props.items;
    theItems.splice(index, 1);
    this.props.changeState(theItems);
  }
  // 修改options选项
  changeItemsData(type, value, index) {
    let itemData = this.state.changeItems;
    if (type == 'subfrom') {
      let data = { ctrlType: value, chnName: this.eachType(value), props: {} };
      itemData[index] = data;
    } else if (type == 'checked' && this.props.checkboxValue.ctrlType == 'radio') {
      // 单选
      itemData.map((item, i) => {
        itemData[i].checked = false;
      });
      itemData[index].checked = true;
      console.log(itemData);
    } else {
      itemData[index][type] = value;
    }
    this.setState({
      changeItems: itemData,
    });
    this.changePropsData('options', this.state.changeItems);
  }
  render() {
    let { checkboxValue, items, checkboxIndex } = this.props;
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

    const SortableItem = SortableElement(({ value, sortIndex }) => (
      <div
        style={{
          padding: 10,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          border: sortIndex == this.state.checkboxIndex ? '2px solid #1890ff' : '',
        }}
      >
        <Icon style={{ marginRight: 5, fontSize: 20 }} type="bars" theme="outlined" />
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
              onPressEnter={e => {
                this.changeItemsData('value', e.target.value, sortIndex);
              }}
            />
          )}
        </div>
        {/*<Input
          defaultValue={value}
          value={this.state.changeItems[sortIndex]}
          onChange={e => {
            this.changeItemsData('value',e.target.value, sortIndex);
          }}
        />*/}
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
          style={{ padding: 10 }}
        />
      </div>
    ));
    const SortableList = SortableContainer(({ items }) => {
      return (
        <ul>
          {items.map((value, index) => (
            <SortableItem key={`item-${index}`} index={index} sortIndex={index} value={value} />
          ))}
        </ul>
      );
    });

    return (
      <div>
        <BasicSetting />
        <Form onSubmit={this.handleSubmit} style={{ marginTop: 8, padding: 10 }}>
          <FormItem {...formItemLayout} label="控件设置">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                控件类型“
                {this.eachType(items[checkboxIndex] ? items[checkboxIndex].ctrlType : '')}”
              </span>
              <Icon
                onClick={() => {
                  this.removeparentItem(checkboxIndex);
                }}
                style={{ fontSize: 18, padding: 10 }}
                type="delete"
                theme="filled"
              />
            </div>
          </FormItem>

          {checkboxValue.ctrlType == 'date' || checkboxValue.ctrlType == 'datearea' ? (
            <FormItem {...formItemLayout} label="类型：">
              <RadioGroup defaultValue="日期">
                <Radio value="日期">日期</Radio>
                <Radio value="日期和时间">日期和时间</Radio>
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
                  items[checkboxIndex] && items[checkboxIndex].props
                    ? items[checkboxIndex].props.placeholder
                    : ''
                }
                placeholder="填写引导文字"
              />
            </FormItem>
          ) : null}

          {checkboxValue.ctrlType == 'phone' ? (
            <FormItem {...formItemLayout} label="类型：">
              <RadioGroup defaultValue="手机">
                <Radio value="手机">手机</Radio>
                <Radio value="座机">座机</Radio>
              </RadioGroup>
            </FormItem>
          ) : null}

          {checkboxValue.ctrlType == 'number' || checkboxValue.ctrlType == 'money' ? (
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="单位：">
                  <Input
                    onChange={e => {
                      this.changePropsData('unit', e.target.value);
                    }}
                    value={
                      items[checkboxIndex] && items[checkboxIndex].props
                        ? items[checkboxIndex].props.unit
                        : ''
                    }
                    placeholder="填写单位"
                  />
                </FormItem>
              </Col>
              <Col span={12}>
                <Row>
                  <span>小数点：</span>
                  <InputNumber min={0} defaultValue="2" />
                </Row>
              </Col>
            </Row>
          ) : null}

          {checkboxValue.ctrlType == 'dropdown' ||
          checkboxValue.ctrlType == 'checkbox' ||
          checkboxValue.ctrlType == 'radio' ? (
            <FormItem {...formItemLayout} label="选项：">
              <div>
                <SortableList
                  items={this.state.changeItems}
                  pressDelay={200}
                  onSortEnd={this.onSortEnd}
                />
              </div>

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

          {checkboxValue.ctrlType == 'date' || checkboxValue.ctrlType == 'datearea' ? (
            <FormItem {...formItemLayout} label="默认项：">
              <Select defaultValue="不设置">
                <Option value="不设置">不设置</Option>
                <Option value="当日">当日</Option>
                <Option value="下一天">下一天</Option>
                <Option value="指定日期">指定日期</Option>
              </Select>
            </FormItem>
          ) : null}
          {checkboxValue.ctrlType == 'area' ? (
            <FormItem {...formItemLayout} label="默认项：">
              <Select defaultValue="请选择">
                <Option value="0">省</Option>
                <Option value="1">省-市</Option>
                <Option value="2">省-市-县</Option>
              </Select>
            </FormItem>
          ) : null}
          {/*{(this.state.changeItems? this.state.changeItems : []).map((value, index) => (
            <div key={index}>
              <Input
                defaultValue={value}
                value={this.state.changeItems[index]}
                onChange={e => {
                  this.changeItemsData('value', e.target.value, index);
                }}
              />
            </div>
          ))}*/}
          {checkboxValue.ctrlType == 'subfrom' ? (
            <FormItem {...formItemLayout} label="明细项：">
              <div>
                <SortableList
                  items={this.state.changeItems}
                  pressDelay={200}
                  onSortEnd={this.onSortEnd}
                />
              </div>

              <div>
                <span
                  onClick={() => {
                    this.addItem('subfrom');
                  }}
                  style={{ color: '#4B85F8' }}
                >
                  +增加明细项
                </span>
              </div>
            </FormItem>
          ) : null}

          <FormItem>
            {checkboxValue.ctrlType == 'phone' ? (
              <div>
                <Checkbox>提交时验证格式：数字组成</Checkbox>
              </div>
            ) : null}
            <Checkbox
              onChange={e => {
                this.changePropsData('required', e.target.checked);
              }}
              checked={
                items[checkboxIndex] && items[checkboxIndex].props
                  ? items[checkboxIndex].props.required
                  : false
              }
            >
              必填项
            </Checkbox>
          </FormItem>
        </Form>
        {/*<List>
          <ListItem>
            <Col span={6}>
              <span>控件设置</span>
            </Col>

            <Col span={18}>
              <span>控件类型“”</span>
            </Col>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>名称</span>
            </Col>
            <Col span={18}>
              <Input placeholder="请输入名称" />
            </Col>
          </ListItem>
        </List>*/}
      </div>
    );
  }
}
