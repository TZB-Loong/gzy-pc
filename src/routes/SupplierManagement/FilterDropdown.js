import React, { Component } from 'react';
import { Checkbox, Row, Col, Card } from 'antd';
import { isfalse } from '../../Tools/util_tools';
const CheckboxGroup = Checkbox.Group;
export default class FilterDropdown extends Component {
  /**
   * 参数说明  //没有用到可以放弃使用
   * 需求说明 (要筛选多个字段并列的)
   * @param {function} confirm  关闭弹框.0000
   * @param {function} screenOnClick 改变父组件的状态并发起列表数据请求
   *
   */

  state = {
    checkValue: [],
  };

  onCancel = () => {
    //取消置空点击事件
    this.setState(
      {
        //清空已选择的数据
        checkValue: [],
      },
      () => {
        this.optionScreen();
        this.props.clearFilters();
      }
    );
  };

  static defaultProps = {
    options: ['材料', '石材', '复合石材', '文化石', '优秀'],
  };

  //Promise 具有兼容问题(IE无法兼容))

  // screenOnClick = () => {
  //   let queryConditions = [];
  //   queryConditions.push({
  //     fieldName: this.props.titleData.ctrlName,
  //     fieldValue: this.state.checkValue,
  //     fieldType: this.props.titleData.fieldType
  //   });
  //   return new Promise((resolve, reject) => {

  //     /**
  //      * @param {function} resolve  当函数执行成功时调用
  //      * @param {function } reject  当你要调用的函数调用失败时调用
  //      */

  //     this.props.screenOnClick({ queryConditions: JSON.stringify(queryConditions) });

  //     resolve('200 OK')
  //   })
  // }

  optionScreen = () => {
    //下拉式筛选确定响应函数

    let queryConditions = {};
    let checkValue = this.state.checkValue;
    (queryConditions.fieldName = this.props.titleData.ctrlName),
      (queryConditions.fieldValue = checkValue.toString()),
      (queryConditions.fieldType = this.props.titleData.fieldType);
    this.props.screenOnClick(queryConditions);
  };

  dropDown = data => {
    return (
      <Card style={{ width: 200, maxHeight: 250, overflow: 'auto' }}>
        <CheckboxGroup
          style={{ width: '100%' }}
          onChange={this.onChange.bind(this)}
          value={this.state.checkValue}
        >
          {data.map((item, index) => {
            return (
              <Row key={index}>
                {' '}
                <Checkbox  value={item}>{item}</Checkbox>
              </Row>
            );
          })}
        </CheckboxGroup>
        <Row style={{ marginTop: '10px' }}>
          <Col span={16}>
            <a onClick={this.onCancel.bind(this)}> 重置</a>
          </Col>
          <Col>
            <a onClick={this.onOk.bind(this)}>确定</a>
          </Col>
        </Row>
      </Card>
    );
  };

  onOk = () => {
    //确定按钮点击事件
    this.optionScreen();
    this.props.confirm();
  };

  onChange(checked) {
    //选中是变化的事件
    this.props.setSelectedKeys(checked);
    this.setState({
      checkValue: checked,
    });
  }

  render() {
    return <div>{this.dropDown(this.props.options)}</div>;
  }
}
