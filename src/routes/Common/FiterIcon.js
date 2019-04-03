import React, { Component } from 'react';
import { Popover, Icon, DatePicker, Button, Row, Checkbox, Col, Spin } from 'antd';
import { isfalse } from '../../Tools/util_tools';
import styles from './style.less';
import { connect } from 'dva';
const { RangePicker } = DatePicker;

/**
 * 参数说明
 * @param {function} screenOnClick //确定与重置响应的回调函数
 * @param {Object} titleData //对应字段
 * @param {string} type  分为time,dropDown 对应为选中时间组件与下拉框组件
 * @param {array} options 下拉框要显示的内容
 */
@connect(({ common, loading }) => ({
  common,
  loading: loading.effects['common/filterData'],
}))
class FiterIcon extends Component {
  state = {
    visible: false, //气泡卡片的显示
    filtered: false, //是否已经筛选
    timeChecked: [], //选中的时间 标准时间格式
    dateString: [], //选中的时间 string 格式
    checkValue: [], //下拉框选中的内容
    filterData: [],
  };

  componentDidMount() {
    // console.log('this.props', this.props);
  }

  /*   componentWillUpdate(nextProps){

      if(nextProps.type=='dropDown'&&nextProps.referedKey!=this.props.referedKey){
        this.filterData();
      }
    } */

  filterData = () => {
    //当为字典类型时 查询数据

    const { dispatch } = this.props;
    dispatch({
      type: 'common/filterData',
      payload: { referedKey: this.props.referedKey },
    }).then(() => {
      const { common } = this.props;
      if (!isfalse(common.filterData)) {
        this.setState({
          filterData: common.filterData,
        });
      }
    });
  };

  hide = () => {
    this.setState({
      visible: false,
    });
  };

  handleVisibleChange = visible => {
    this.setState(
      {
        visible: visible,
      },
      () => {
        if (this.state.visible) {
          if (this.props.type == 'dropDown') {
            this.filterData();
          }
        }
      }
    );
  };

  setTimeContent = () => {
    let _this = this;
    function onChange(date, dateString) {
      //选中时间变化时
      _this.setState({
        timeChecked: date,
        dateString: dateString,
      });
    }
    function onCancel() {
      //重置
      _this.setState(
        {
          timeChecked: [],
          dateString: [],
          visible: false,
          filtered: false,
        },
        () => {
          let titleData = Object.keys(_this.props.titleData);
          let queryConditions = [];
          titleData.splice(titleData.indexOf('fieldType'), 1);
          titleData.map((item, index) => {
            queryConditions.push({
              fieldName: item,
              fieldType: _this.props.titleData.fieldType,
              fieldValue: isfalse(_this.state.dateString) ? null : _this.state.dateString[index],
            });
          });
          _this.props.screenOnClick(queryConditions);
        }
      );
    }

    function onOk() {
      //确定
      _this.setState(
        {
          visible: false,
          filtered: isfalse(_this.state.timeChecked) ? false : true,
        },
        () => {
          let titleData = Object.keys(_this.props.titleData);
          let queryConditions = [];
          titleData.splice(titleData.indexOf('fieldType'), 1);
          titleData.map((item, index) => {
            queryConditions.push({
              fieldName: item,
              fieldType: _this.props.titleData.fieldType,
              fieldValue: isfalse(_this.state.timeChecked) ? null : _this.state.dateString[index],
            });
          });
          _this.props.screenOnClick(queryConditions);
        }
      );
    }

    function onCalendarChange() {
      //第一次选中时间时
      _this.setState({ visible: true });
    }

    return (
      <div>
        <RangePicker
          onChange={onChange}
          value={_this.state.timeChecked}
          onCalendarChange={onCalendarChange}
        />
        <Row style={{ marginTop: '10px', textAlign: 'right' }}>
          <Button onClick={onCancel} type="primary" size="small" style={{ marginRight: '20px' }}>
            重置
          </Button>
          <Button onClick={onOk} type="primary" size="small">
            确定
          </Button>
        </Row>
      </div>
    );
  };

  setDropDownConent = () => {
    //字典形式的筛选组件
    let _this = this;
    function onCancel() {
      //重置
      _this.setState(
        {
          visible: false,
          checkValue: [],
          filtered: false,
        },
        () =>
          _this.props.screenOnClick({
            fieldName: _this.props.titleData.ctrlName,
            fieldType: _this.props.titleData.fieldType,
            fieldValue: _this.state.checkValue.toString(),
          })
      );
    }
    function onOk() {
      //确定
      _this.setState(
        {
          visible: false,
          filtered: isfalse(_this.state.checkValue) ? false : true,
        },
        () =>
          _this.props.screenOnClick({
            fieldName: _this.props.titleData.ctrlName,
            fieldType: _this.props.titleData.fieldType,
            fieldValue: _this.state.checkValue.toString(),
          })
      );
    }

    function onChange(value) {
      //选中时
      _this.setState({
        checkValue: value,
      });
    }

    return (
      <div>
        <Spin spinning={this.props.loading}>
          <div style={{ maxHeight: '200px', overflowX: 'auto', position: 'relative' }}>
            <Checkbox.Group
              style={{ width: '100%' }}
              onChange={onChange}
              value={this.state.checkValue}
            >
              <Row>
                {isfalse(_this.state.filterData)
                  ? null
                  : _this.state.filterData.map((item, index) => {
                      return (
                        <Col key={index} className={styles.nodeMargin}>
                          <Checkbox value={item.value}>{item.text}</Checkbox>
                        </Col>
                      );
                    })}
              </Row>
            </Checkbox.Group>
          </div>
          <div>
            <Row type="flex" justify="space-between" style={{ marginTop: '15px' }}>
              <Button
                onClick={onCancel}
                type="primary"
                size="small"
                style={{ marginRight: '40px' }}
              >
                重置
              </Button>
              <Button onClick={onOk} type="primary" size="small">
                确定
              </Button>
            </Row>
          </div>
        </Spin>
      </div>
    );
  };

  render() {
    return (
      <Popover
        content={
          this.props.type == 'time'
            ? this.setTimeContent()
            : this.props.type == 'dropDown'
              ? this.setDropDownConent()
              : '暂无'
        }
        title={this.props.type == 'time' ? '设置发布时间段' : null}
        trigger="click"
        placement="bottom"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <Icon type="filter" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />
      </Popover>
    );
  }
}

export default FiterIcon;
