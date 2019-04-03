import React, { Component } from 'react';
import { Input, Cascader } from 'antd';
import cnCity from '../../../utils/area.json';
import { isfalse } from '../../../Tools/util_tools';
/**
 * 参数说明
 * @param {function} onOk  接收选中的参数
 *
 */


export default class SelectCity extends Component {
  state = {
    isUpdata: true,
    defaultValue: []
  }
  onAreaChange = (e, value) => {
    if (!isfalse(value)) {
      let returnData = {
        provinceName: value[0].name,
        provinceId: value[0].code,
        cityName: value[1].name,
        cityId: value[1].code,
        districtName: value[2] ? value[2].name : '',
        districtId: value[2] ? value[2].code : ''
      }

      this.setState({
        defaultValue:[returnData.provinceId, returnData.cityId, returnData.districtId]
      })

      if (!isfalse(this.props.onOk)) {
        this.props.onOk(returnData)
      }
    }
  };

  setfileList = (data) => {
    if (this.state.isUpdata) {
      this.setState({
        isUpdata: false,
        defaultValue: [data.provinceId, data.cityId, data.districtId],
      }, () => {
        console.log(this.state.defaultValue)
      })
    }
  }

  render() {
    if (!isfalse(this.props.default)) {
      this.setfileList(this.props.default)
    }
    const Car = ()=>{
      return <Cascader
      fieldNames={{ label: 'name', value: 'code', children: 'sub' }}
      options={cnCity}
      onChange={this.onAreaChange}
      placeholder="请选择地址"
      value={this.state.defaultValue}
    />
    }

    return (
      <div>
        <Car />
      </div>
    )
  }
}
