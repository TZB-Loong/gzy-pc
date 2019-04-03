import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { TreeSelect, Form, Cascader } from 'antd';
import {isfalse} from '../../../Tools/util_tools';
import Styles from '../../Common/style.less';

const FormItem = Form.Item;
const TreeNode = TreeSelect.TreeNode;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

@Form.create()
@connect(({ common }) => ({
  common,
}))
/**
 * 参数说明
 *
 * @param {function}  onOk 接收选中的数据
 * @param {array} initialValue 默认值
 *
 */
export default class MaterialSort extends React.Component {
  state = {
    value: [],
    isd: true, // 是否显示默认值
  };
  componentDidMount() { //数据请求只是请求一次,这个是个问题
    const { dispatch, materialInitialValue } = this.props;
    dispatch({
      type: 'common/getMaterialCategoryData',
    });

    // 打开编辑/新增时清空
    // this.props.that.setState({ sort: '' });
  }

  onChange = (value, label, extra) => {
    // console.log(value, label, extra,'0000');
    let returnData ={
      category:value,
      categoryText:label
    }
    if(!isfalse(this.props.onOk)){
      this.props.onOk(returnData)
    }
    this.setState({ value, isd: false });
  };

  renderTreeNodesChild(childrenList, parentId, parentName) {
    if (childrenList) {
      return childrenList.map(item => {
        return (
          <TreeNode
            title={parentName + '>' + item.name}
            value={(parentId + ',' + item.id).toString()}
            key={item.id}
            dataRef={item}
          />
        );
      });
    }
  }
  renderTreeNodes = data => {
    return data.map(item => {
      if (item.childrenList) {
        return (
          <TreeNode
            title={item.name}
            disabled={this.props.type == 'bid' ? true : false}
            value={item.id.toString()}
            key={item.id}
            dataRef={item}
            className={this.props.type == 'bid'?styles.setBtnArea:''}
          >
            {this.props.type == 'bid'
              ? this.renderTreeNodesChild(item.childrenList, item.id, item.name)
              : this.renderTreeNodesChild(item.childrenList, item.id, item.name)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          title={item.name}
          disabled={this.props.type == 'bid' ? true : false}
          value={item.id.toString()}
          key={item.id}
          dataRef={item}
        />
      );
    });
  };

  render() {
    const { common, initialValue, materialInitialValue } = this.props;
    // 默认值
    let defaultValue = materialInitialValue
      ? materialInitialValue
      : initialValue
        ? initialValue
        : [];
    const tProps = {
      // treeData,
      onChange: this.onChange,
      multiple:true,
      treeCheckable: this.props.type == 'bid' ? false : true,
      showCheckedStrategy: this.props.type == 'bid' ? TreeSelect.SHOW_ALL : TreeSelect.SHOW_CHILD,
      searchPlaceholder: '请选择材料分类',
      dropdownStyle: { maxHeight: 400 },
      // defaultValue: materialInitialValue?materialInitialValue:initialValue ? initialValue.split(',') : [],
      value: this.state.isd ? defaultValue : this.state.value,
      treeNodeFilterProp: 'title', // 查询字段
      dropdownClassName: 'childUl',
      searchValue: '', //搜索框禁止输入
    };
    return <TreeSelect {...tProps}>{this.renderTreeNodes(common.materialCategoryData)}</TreeSelect>;
  }
}
