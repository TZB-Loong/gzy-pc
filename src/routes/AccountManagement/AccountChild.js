/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Icon,
  Button,
  Divider,
  Row,
  Col,
  Table,
  Modal,
  Form,
  List,
  Select,
  Spin,
} from 'antd';
import { Input, message } from 'antd/lib/index';
import Empty from '../Common/Empty';
import { isAuth } from '../../utils/utils';
const FormItem = Form.Item;
const { TextArea } = Input;
const ListItem = List.Item;
const Option = Select.Option;
const confirm = Modal.confirm;
import styles from './style.less';

@Form.create()
@connect(({ accountChildModel, loading, authoritySettings }) => ({
  accountChildModel,
  loading: loading.effects['accountChildModel/showCorpMembers'],
  authoritySettings,
}))
export default class AccountChild extends Component {
  state = {
    modalVisible: false,
    s_modalVisible: false, // 查看modal
    m_detail: {},
    idEdit: false,
    confirmDirty: false,
    datasource: [],
    Roles: [],
    SameUserName: '1',
    Same: false,
    isEdit: true,
    sameName: false, // 用户名重复
    remarkSize: 0,
    columns: [
      {
        title: '登陆账号',
        render: (text, record) => (
          <a href="javascript:;" onClick={() => this.operation(record, 'detail')}>
            {text}
          </a>
        ),
        dataIndex: 'userName',
        key: 'userName',
      },
      {
        title: '姓名',
        dataIndex: 'nickName',
        key: 'nickName',
      },
      {
        title: '手机号码',
        dataIndex: 'mobile',
        key: 'mobile',
      },
      {
        title: '职位',
        dataIndex: 'roleName',
        key: 'roleName',
      },
      {
        title: '操作',
        key: 'postStatus',
        width: 160,
        fixed: 'right',
        render: (record, index) => {
          return record.mainAccount == 1 ? null : (
            <div>
              <a href="javascript:;" onClick={() => this.operation(record, 'edit')}>
                编辑
              </a>
              <Divider type="vertical" />
              <a href="javascript:;" onClick={() => this.operation(record, 'update')}>
                {record.postStatus == 1 ? '启用' : '禁用'}
              </a>
            </div>
          );
        },
      },
    ],
  };
  showCorpMembersList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'accountChildModel/showCorpMembers',
    }).then(() => {
      let { membersList } = this.props.accountChildModel;
      this.setState({
        datasource: membersList && membersList.data ? membersList.data : [],
      });
    });
  }
  componentDidMount() {
    this.showCorpMembersList();
    let columns = this.state.columns;
    if (!isAuth('account_setting')) {
      columns.splice(columns.length - 1, 1);
      this.setState({
        columns,
      });
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'authoritySettings/queryRoles',
      payload: this.state.params,
    }).then(() => {
      const {
        authoritySettings: { Roles },
      } = this.props;
      this.setState({
        Roles: Roles,
      });
    });
  }

  operation = (key, type) => {
    let that = this;
    if (type === 'update') {
      const { dispatch } = this.props;
      dispatch({
        type: 'accountChildModel/updateSubUserStatus',
        payload: { userId: key.userId, postStatus: key.postStatus },
      }).then(() => {
        const { accountChildModel } = that.props;
        let status = accountChildModel.updateStatus;
        if (status) {
          // message.success('操作成功!');
          that.showCorpMembersList();
          let title = (
            <span style={{ color: '#169bd5' }}>
              {key.postStatus == 0 ? '禁用成功' : '启用成功'}
            </span>
          );
          let content =
            key.postStatus == 0
              ? '现在【' + key.userName + '】' + '不能再进行登录。'
              : '现在可使用【' + key.userName + '】' + '进行登录。';
          Modal.success({
            title: title,
            content: content,
            bodyStyle: 'styles',
            okText: '我知道了',
            maskClosable: true,
          });
        } else {
          // message.error('操作失败!');
        }
      });
    }
    if (type === 'edit') {
      that.setState({ isEdit: true, m_detail: key }, () =>
        that.setState({
          modalVisible: true,
          remarkSize: key.remark ? key.remark.length : 0,
        })
      );
    }
    if (type === 'detail') {
      that.setState({ isEdit: false, m_detail: key, s_modalVisible: true });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    let that = this;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (!that.state.isEdit && this.state.sameName) {
          message.error('登录账户已存在!');
          return;
        }
        // 编辑
        if (that.state.isEdit) {
          values.userId = that.state.m_detail.userId;
        }
        delete values.password;
        const { dispatch } = that.props;
        dispatch({
          type: 'accountChildModel/saveSubUser',
          payload: values,
        }).then(() => {
          const {
            accountChildModel: { saveStatus },
          } = that.props;
          if (saveStatus) {
            this.showCorpMembersList();
            this.setState({
              modalVisible: false,
            });
            if (that.state.isEdit) {
              message.success('编辑成功!');
            } else {
              message.success('提交成功!');
            }
          }
        });
      }
    });
  };
  SameUserName(username) {
    const { dispatch } = this.props;
    let usernames = username.trim();
    if (usernames) {
      let that = this;
      dispatch({
        type: 'accountChildModel/serchSameUserName',
        payload: { username: username },
      }).then(() => {
        const {
          accountChildModel: { SameUserName },
        } = that.props;
        if (SameUserName && SameUserName.msg == '用户名重复') {
          message.error('登录账户已存在!');
          that.setState({ sameName: true });
        } else {
          that.setState({ sameName: false });
        }
      });
    }
  }

  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }
  closeModalVisible(s_modalVisible) {
    this.setState({ s_modalVisible });
  }

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次密码不一致');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { accountChildModel, loading } = this.props;
    const Search = Input.Search;
    let { isEdit, m_detail, datasource, Roles } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 6 },
      },
    };
    return (
      <Spin spinning={loading}>
        <Card title={accountChildModel.data}>
          <div>
            <Row>
              <Col span={12}>
                {/*<span>账号名称：</span>
                <Search
                  placeholder="请输入账号名称"
                  enterButton="搜索"
                  style={{ width: '300px' }}
                />*/}
              </Col>
            </Row>
          </div>
          {datasource.length > 0 ? (
            <div>
              <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                  {isAuth('account_setting') ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        this.setState({ isEdit: false, modalVisible: true, remarkSize: 0 });
                      }}
                    >
                      添加子账号
                    </Button>
                  ) : null}
                </Col>
              </Row>
              <Table
                rowKey={record => record.userId}
                style={{ marginTop: '20px' }}
                dataSource={datasource}
                columns={this.state.columns}
                bordered
              />
            </div>
          ) : (
            <div>
              <Empty msg="子账号" />
              <Col span={24} style={{ textAlign: 'center' }}>
                {isAuth('account_setting') ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      this.setState({ isEdit: false, modalVisible: true, remarkSize: 0 });
                    }}
                  >
                    添加子账号
                  </Button>
                ) : null}
              </Col>
            </div>
          )}

          <Modal
            bodyStyle={{ maxHeight: 650, paddingBottom: 0 }}
            title={'子账号编辑 '}
            centered
            destroyOnClose={true} //关闭时销毁 Modal 里的子元素
            maskClosable={false}
            visible={this.state.modalVisible}
            onOk={this.handleSubmit}
            onCancel={() => this.setModalVisible(false)}
            width={600}
          >
            <Form
              onSubmit={this.handleSubmit}
              style={{ marginTop: 8 }}
              className={styles.FormLabel}
            >
              <FormItem {...formItemLayout} label="登录账户：">
                {getFieldDecorator('username', {
                  rules: [
                    {
                      required: true,
                      message: '请输入登录账户',
                    },
                    {
                      min: 6,
                      max: 20,
                      message: '请输入6-20位',
                    },
                    {
                      pattern: /^[0-9a-zA-Z]*$/,
                      message: '请输入字母或数字',
                    },
                  ],
                  initialValue: isEdit ? m_detail.userName : '',
                })(
                  <Input
                    onBlur={e => {
                      this.SameUserName(e.target.value);
                    }}
                    disabled={isEdit}
                    placeholder="请输入登录账户"
                  />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="姓名：">
                {getFieldDecorator('realname', {
                  rules: [
                    {
                      required: true,
                      message: '请输入姓名',
                    },
                    {
                      max: 20,
                      message: '最多输入20个字符',
                    },
                  ],
                  initialValue: isEdit ? m_detail.nickName : '',
                })(<Input placeholder="请输入员工姓名" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="手机号码：">
                {getFieldDecorator('mobile', {
                  rules: [
                    {
                      pattern: /^[1][3,4,5,7,8][0-9]{9}$/,
                      message: '请输入正确格式的手机号码',
                    },
                  ],
                  initialValue: isEdit ? m_detail.mobile : '',
                })(<Input placeholder="请输入员工手机号码" />)}
              </FormItem>
              {isEdit ? (
                <FormItem style={{ display: 'none' }} {...formItemLayout} label="登录密码：">
                  {getFieldDecorator('password', {
                    rules: [
                      {
                        min: 6,
                        max: 20,
                        message: '长度为6-20个字符',
                      },
                      {
                        validator: this.validateToNextPassword,
                      },
                    ],
                  })(<Input type="password" placeholder="请设置密码" />)}
                </FormItem>
              ) : (
                <FormItem {...formItemLayout} label="登录密码：">
                  {getFieldDecorator('password', {
                    rules: [
                      {
                        required: true,
                        message: '请设置密码',
                      },
                      {
                        min: 6,
                        max: 20,
                        message: '长度为6-20个字符',
                      },
                      {
                        validator: this.validateToNextPassword,
                      },
                    ],
                  })(<Input type="password" placeholder="请设置密码" />)}
                </FormItem>
              )}
              {isEdit ? (
                <FormItem style={{ display: 'none' }} {...formItemLayout} label="确认密码：">
                  {getFieldDecorator('pwd', {
                    rules: [
                      {
                        min: 6,
                        max: 20,
                        message: '长度为6-20个字符',
                      },
                      {
                        validator: this.compareToFirstPassword,
                      },
                    ],
                  })(<Input type="password" placeholder="请设置密码" />)}
                </FormItem>
              ) : (
                <FormItem {...formItemLayout} label="确认密码：">
                  {getFieldDecorator('pwd', {
                    rules: [
                      {
                        required: true,
                        message: '请设置密码',
                      },
                      {
                        min: 6,
                        max: 20,
                        message: '长度为6-20个字符',
                      },
                      {
                        validator: this.compareToFirstPassword,
                      },
                    ],
                  })(
                    <Input
                      type="password"
                      placeholder="请设置密码"
                      onBlur={this.handleConfirmBlur}
                    />
                  )}
                </FormItem>
              )}
              <FormItem {...formItemLayout} label="账号角色">
                {getFieldDecorator('roleId', {
                  rules: [
                    {
                      required: true,
                      message: '请选择账号角色',
                    },
                  ],
                  initialValue: isEdit ? m_detail.roleId : '',
                })(
                  <Select>
                    {Roles.map(function(item, index) {
                      return (
                        <Option key={index} value={item.roleId}>
                          {item.roleName}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="公司职务：">
                {getFieldDecorator('position', {
                  rules: [
                    {
                      max: 80,
                      message: '最多输入80个字符',
                    },
                  ],
                  initialValue: isEdit ? m_detail.position : '',
                })(<Input placeholder="请输入员工的公司职务" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="备注：">
                {getFieldDecorator('remark', {
                  rules: [
                    {
                      max: 500,
                      message: '最多输入500个字',
                    },
                  ],
                  initialValue: isEdit ? m_detail.remark : '',
                })(
                  <TextArea
                    style={{ minHeight: 32 }}
                    placeholder="请填写备注"
                    rows={4}
                    onKeyUp={e => {
                      this.setState({ remarkSize: e.target.value.length });
                    }}
                  />
                )}
                <div style={{ float: 'right', marginTop: 0 }}>
                  {this.state.remarkSize}
                  /500
                </div>
              </FormItem>
              {/*<FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                <Button type="primary" htmlType="submit">
                  确定
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ modalVisible: false });
                  }}
                  style={{ marginLeft: 8 }}
                >
                  取消
                </Button>
              </FormItem>*/}
            </Form>
          </Modal>

          <Modal
            bodyStyle={{ maxHeight: 650, overflowY: 'scroll' }}
            title="查看子账号信息 "
            centered
            destroyOnClose={true} //关闭时销毁 Modal 里的子元素
            visible={this.state.s_modalVisible}
            onOk={() => this.closeModalVisible(false)}
            onCancel={() => this.closeModalVisible(false)}
            width={600}
            footer={null}
          >
            <List bordered style={{ width: '100%' }} className={styles.Detaillist}>
              <ListItem>
                <Col span={6}>
                  <span>登陆账户：</span>
                </Col>
                <span>{m_detail.userName}</span>
              </ListItem>
              <ListItem>
                <Col span={6}>
                  <span>姓名：</span>
                </Col>
                <span>{m_detail.nickName}</span>
              </ListItem>
              <ListItem>
                <Col span={6}>
                  <span>手机号码：</span>
                </Col>
                <span>{m_detail.mobile}</span>
              </ListItem>
              <ListItem>
                <Col span={6}>
                  <span>账号角色：</span>
                </Col>
                <span>{m_detail.roleName}</span>
              </ListItem>
              <ListItem>
                <Col span={6}>
                  <span>公司职务：</span>
                </Col>
                <span>{m_detail.position}</span>
              </ListItem>
              <ListItem>
                <Col span={6}>
                  <span>备注：</span>
                </Col>
                <span>{m_detail.remark}</span>
              </ListItem>
            </List>
          </Modal>
        </Card>
      </Spin>
    );
  }
}
