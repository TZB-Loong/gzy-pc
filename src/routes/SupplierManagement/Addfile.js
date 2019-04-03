/*eslint-disable*/
import React, { Component } from 'react';
import { Link } from 'dva/router';
import { connect } from 'dva';
import { Card, Spin, Input, Row, Col, List, Modal, message, Form, Breadcrumb } from 'antd';
import { isfalse } from '../../Tools/util_tools';
import { trim } from '../../Tools/Verification'; //去掉输入框中的空格

const confirm = Modal.confirm;
@connect(({ materialSupplier, loading }) => ({
  materialSupplier,
  loading: loading.effects['materialSupplier/bizObjectList'],
}))
class Addfile extends Component {
  state = {
    listData: [], //列表数据
    visible1: false, //弹框显示
    value: '',
    show: '', // add (添加的弹框) edit (编辑的弹框) dele (删除弹框)
    editIndex: '', //编辑的是哪条记录
  };

  componentDidMount() {
    this.bizObjectList(); //获取自定义字段列表
  }

  bizObjectList = () => {
    //获取自定义字段列表
    const { dispatch, materialSupplier } = this.props;
    dispatch({
      type: 'materialSupplier/bizObjectList',
      payload: { bizId: materialSupplier.bizId, bizCode: materialSupplier.bizCode },
    }).then(() => {
      let { materialSupplier, loading } = this.props;
      if (!loading) {
        let bizObjectList = materialSupplier.bizObjectList;
        this.setState({
          listData: bizObjectList.data,
        });
      }
    });
  };
  bizObjectEdit = data => {
    //添加/编辑自定义字段
    let _this = this;
    const { dispatch } = this.props;

    dispatch({
      type: 'materialSupplier/bizObjectMetadataEdit',
      payload: data,
    }).then(() => {
      _this.bizObjectList();
    });
  };

  bizObjectDelete = data => {
    //自定义字段删除
    const { dispatch } = this.props;
    dispatch({
      type: 'materialSupplier/bizObjectMetadataDelete',
      payload: { id: data },
    }).then(() => {
      this.bizObjectList();
    });
  };

  handleCancel = e => {
    //对话框的取消按钮(两个弹出框共用)
    this.setState({
      visible: false,
    });
    this.props.form.resetFields();
  };

  showModal = (type, index) => {
    //对话框的显示
    if (type == 'add') {
      if (this.state.listData.length > 9) {
        message.warning('最多添加10个自定义字段');
        return;
      }
      this.setState({
        show: type,
        visible: true,
      });
    } else {
      let oldVal = '';
      this.state.listData.map(item => {
        item.id === index ? (oldVal = item.chnName) : null;
      });
      this.props.form.setFieldsValue({
        input: oldVal,
      });
      this.setState({
        show: type,
        visible: true,
        editIndex: isfalse(index) ? '' : index,
      });
    }
  };
  showConfirm = item => {
    let _this = this;
    confirm({
      title:
        '删除' +
        '“' +
        item.chnName +
        '”' +
        '会删除相关数据，请慎重操作，确定要删除' +
        '“' +
        item.chnName +
        '”' +
        '吗',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        _this.bizObjectDelete(item.id);
      },
    });
  };
  handleSubmit = e => {
    let _this = this;
    const { materialSupplier } = this.props;
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }

      if (_this.state.show == 'add') {
        //添加
        let resquestData = { chnName: trim(values.input, 'g'), bizId: materialSupplier.bizId };
        _this.bizObjectEdit(resquestData);
      } else {
        //编辑
        let resquestData = {
          id: _this.state.editIndex,
          chnName: trim(values.input, 'g'),
          bizId: materialSupplier.bizId,
        };
        _this.bizObjectEdit(resquestData);
      }
      _this.setState(
        {
          visible: false,
        },
        () => _this.props.form.resetFields()
      );
    });
  };
  checkMention = (rule, value, callback) => {
    //输入框验证
    if (isfalse(value)) {
      callback(new Error('输入不能为空 !'));
    } else {
      this.state.listData.map(item => {
        if (item.chnName == trim(value, 'g')) {
          callback(new Error('该字段已存在,请重新输入 !'));
          return false;
        }
      });

      if (isfalse(trim(value, 'g'))) {
        callback(new Error('输入不能为空 !'));
      } else if (trim(value, 'g').length > 10) {
        callback(new Error('最多输入10个字符 !'));
      } else {
        callback();
      }
    }
  };

  formCar = () => {
    const { getFieldDecorator } = this.props.form;
    const FormItem = Form.Item;
    return (
      <Form>
        <FormItem label="字段名称" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          {getFieldDecorator('input', {
            rules: [{ validator: this.checkMention }],
          })(<Input placeholder="最多输入10个汉字" />)}
        </FormItem>
      </Form>
    );
  };

  render() {
    const { materialSupplier, loading } = this.props;
    const FormDemo = this.formCar();
    let _this = this;

    return (
      <Spin spinning={loading}>
        <Card
          title={
            <Breadcrumb>
              <Breadcrumb.Item>{materialSupplier.data}</Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link to="/supplierManagement/material">材料供应商首页</Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          }
        >
          <Row>
            <Col span={12}>
              <div>字段管理(最多添加10个自定义字段)</div>
            </Col>
            <Col span={11} style={{ textAlign: 'right', marginTop: '7px' }} />
          </Row>
          <Row style={{ marginTop: '10px' }}>
            <Col span={12}>
              <a href="javascript:void(0)" onClick={this.showModal.bind(this, 'add')}>
                添加字段
              </a>
            </Col>
            <Col span={11} style={{ textAlign: 'right', marginTop: '7px' }} />
          </Row>
          <div style={{ marginTop: 15 }}>
            <List
              header={
                <Row style={{ marginTop: '10px' }}>
                  <Col span={22}>字段名称</Col>
                  <Col span={2} style={{ textAlign: 'center', marginTop: '7px' }}>
                    操作
                  </Col>
                </Row>
              }
              dataSource={_this.state.listData}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <a
                      href="javascript:void(0)"
                      onClick={this.showModal.bind(this, 'edit', item.id)}
                    >
                      编辑
                    </a>,
                    <a href="javascript:void(0)" onClick={this.showConfirm.bind(_this, item)}>
                      删除
                    </a>,
                  ]}
                >
                  <List.Item.Meta title={<span>{item.chnName}</span>} />
                </List.Item>
              )}
            />
            <Modal
              title={
                <span>
                  {this.state.show == 'add' ? '添加' : '编辑'}
                  供应商字段
                </span>
              }
              visible={this.state.visible}
              onOk={this.handleSubmit}
              onCancel={this.handleCancel}
              width={600}
            >
              {FormDemo}
            </Modal>
          </div>
        </Card>
      </Spin>
    );
  }
}

export default Form.create()(Addfile);
