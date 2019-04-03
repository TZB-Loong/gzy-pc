/**
 * 材料清单
 *
 * 需求:
 *  1,动态的添加项与删减项
 *  2,新添加的项需要验证
 *  3,将所有项的值传回到父组件
 *  4,这个需求好像失败了
 *
 */

import React, { PureComponent } from 'react';
import { Form, Input, Icon, Button, Row, Col } from 'antd';
import styles from './style.less';
const FormItem = Form.Item;
let uuid = 0;
@Form.create()
export default class MaterialList extends PureComponent {
  state = { expand: false };

  remove = k => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    if (keys.length === 1) {
      return;
    }
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  add = () => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    uuid++;
    form.setFieldsValue({
      keys: nextKeys,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);
      }
    });
  };

  getFields = () => {
    const count = this.state.expand ? 10 : 6;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 14 },
      },
    };

    return (
      <Col span={18} offset={5}>
        <Col span={6} className={styles.materialCol}>
          <FormItem label="材料名称" {...formItemLayout} style={{ marmarginBottom: '0px' }}>
            {getFieldDecorator('MaterialName', {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder="请填写材料名称" />)}
          </FormItem>
          <FormItem label="材料类型" {...formItemLayout}>
            {getFieldDecorator('MaterialType', {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder="请填写材料编号" />)}
          </FormItem>
          <FormItem label="数量" {...formItemLayout}>
            {getFieldDecorator('MaterialNumber', {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder="请填写数量" />)}
          </FormItem>
          {/* </Col> */}

          <FormItem label="单位" {...formItemLayout}>
            {getFieldDecorator('MaterialCompany2', {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder="如: 个, 套, 件等" />)}
          </FormItem>
        </Col>
        <Col span={8} className={styles.materialCol}>
          <FormItem label="材料名称" {...formItemLayout}>
            {getFieldDecorator('MaterialName2', {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder="请填写材料名称" />)}
          </FormItem>
          <FormItem label="材料类型" {...formItemLayout}>
            {getFieldDecorator('MaterialType2', {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder="请填写材料编号" />)}
          </FormItem>
          <FormItem label="数量" {...formItemLayout}>
            {getFieldDecorator('MaterialNumber2', {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder="请填写数量" />)}
          </FormItem>
          <FormItem label="单位" {...formItemLayout}>
            {getFieldDecorator('MaterialCompany2', {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder="如: 个, 套, 件等" />)}
          </FormItem>
        </Col>
        <Col span={8} className={styles.materialCol}>
          <FormItem label="材料名称" {...formItemLayout}>
            <Input />
          </FormItem>
        </Col>
      </Col>
    );
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      return (
        <FormItem
          {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
          label={index === 0 ? 'Passengers' : ''}
          required={false}
          key={k}
        >
          {getFieldDecorator(`names[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: "Please input passenger's name or delete this field.",
              },
            ],
          })(<Input placeholder="passenger name" style={{ width: '60%', marginRight: 8 }} />)}
          {keys.length > 1 ? (
            <Icon
              className="dynamic-delete-button"
              type="minus-circle-o"
              disabled={keys.length === 1}
              onClick={() => this.remove(k)}
            />
          ) : null}
        </FormItem>
      );
    });
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem style={{ width: '100' }}>
            {' '}
            <Row>{this.getFields()}</Row>
          </FormItem>
          {formItems}
          <FormItem>
            <Button type="dashed" onClick={this.add} style={{ width: '100%', height: '120px' }}>
              <Icon type="plus" /> Add field
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
