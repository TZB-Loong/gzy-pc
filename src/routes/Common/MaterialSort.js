import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { TreeSelect, Form, Cascader } from 'antd';
import styles from './style.less';

const FormItem = Form.Item;
const TreeNode = TreeSelect.TreeNode;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

@Form.create()
@connect(({ common }) => ({
  common,
}))
export default class MaterialSort extends React.Component {
  state = {
    value: [],
    isd: true, // 是否显示默认值
  };
  componentDidMount() {
    const { dispatch, materialInitialValue } = this.props;
    dispatch({
      type: 'common/getMaterialCategoryData',
    });

    // 打开编辑/新增时清空
    this.props.that.setState({ sort: '' });
  }

  onChange = (value, label, extra) => {
    // console.log(value, label, extra);
    this.props.that.setState({
      sort: value,
      sortName: label,
    });
    this.props.that.props.form.setFieldsValue({
      category: value,
      categoryText: label,
    });
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
