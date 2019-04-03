/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Form, Select, Input, Icon, Upload, Modal, Button } from 'antd';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';

const FormItem = Form.Item;

const Option = Select.Option;

@Form.create()
@connect(({ Inquiry, loading }) => ({
  Inquiry,
  loading,
}))
export default class BidMaterial extends Component {
  state = {};

  componentDidMount() {}

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;

    form.validateFieldsAndScroll((err, values) => {
      console.log(values);
      if (!err) {
      }
    });
  };

  componentWillUnmount() {}

  render() {
    let that = this;
    const { Inquiry } = this.props;
    // const { form } = this.props;
    const { TextArea } = Input;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };
    return (
      <Card title={Inquiry.title} bordered={false}>
        <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
          <FormItem {...formItemLayout} label="项目名称">
            {getFieldDecorator('name', {
              rules: [
                {
                  type: 'name',
                  message: '项目名称',
                },
                {
                  required: true,
                  message: '请输入项目项目名称',
                },
              ],
            })(<Input placeholder="请输入项目名称" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="询价单位">
            {getFieldDecorator('authenName', {
              rules: [
                {
                  type: 'authenName',
                  message: '询价单位',
                },
                {
                  required: true,
                  message: '询价单位不能为空',
                },
              ],
            })(<Input placeholder="自带公司名称并可编辑" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="材料清单">
            <label>{'测试'}</label>
          </FormItem>
          {/* <Row>询价</Row> */}
          <FormItem {...formItemLayout} label="截止时间">
            <label>{'测试'}</label>
          </FormItem>
          <FormItem {...formItemLayout} label="是否允许缺项报价">
            <label>{'测试'}</label>
          </FormItem>
          <FormItem {...formItemLayout} label="项目地点">
            <label>{'测试'}</label>
          </FormItem>
          <FormItem {...formItemLayout} label="招标文件">
            <label>{'测试'}</label>
          </FormItem>
          <FormItem {...formItemLayout} label="备注">
            <label>{'测试'}</label>
          </FormItem>
          <FormItem {...formItemLayout} label="联系人">
            <label>{'测试'}</label>
          </FormItem>
          <FormItem {...formItemLayout} label="手机号码">
            <label>{'测试'}</label>
          </FormItem>
        </Form>
      </Card>
    );
  }
}
