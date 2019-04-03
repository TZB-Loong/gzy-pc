/*eslint-disable*/
import moment from 'moment';
import React, { Component, Fragment } from 'react';
import { pathInquiry } from '../../../configPath';
import { connect } from 'dva';
import {
  Card,
  Table,
  Spin,
  Pagination,
  Radio,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Modal,
  message,
  Form,
  DatePicker,
} from 'antd';
import Empty from '../Common/Empty';
import { isfalse } from '../../Tools/util_tools';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import styles from './style.less';
const Search = Input.Search;
const FormItem = Form.Item;
const confirm = Modal.confirm;
const { TextArea } = Input;

@Form.create()
@connect(({ Inquiry, loading }) => ({
  Inquiry,
  loading: loading.effects['Inquiry/queryInquiryByPage'],
}))
export default class PurchaseList extends Component {
  state = {
    searchText: '',
    loading: false,
    currentStatus: 0, //采购分类
    totalPages: 0,
    params: {
      status: '', //审核状态
      current: 1, // 当前页数
      size: 10, // 每页显示记录条数
    },
    columns: [
      {
        title: '询价单ID',
        dataIndex: 'purchaseNo',
        key: 'purchaseNo',
        width: 150,
        render: (tex, record) => (
          <a href={pathInquiry + '/purchase/info/' + record.purchaseId} target="_blank">
            {tex}
          </a>
        ),
      },
      {
        title: '询价信息',
        dataIndex: 'projectName',
        key: 'projectName',
        width: 150,
        render: (tex, record) => (
          <a href={pathInquiry + '/purchase/info/' + record.purchaseId} target="_blank">
            <div>{tex}</div>
            <div>
              询：
              {record.materialName}
            </div>
          </a>
        ),
      },
      {
        title: '发布时间',
        dataIndex: 'publishTime',
        key: 'publishTime',
        width: 150,
      },
      {
        title: '截止时间',
        dataIndex: 'deadlineDay',
        key: 'deadlineDay',
        width: 150,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: text => (
          <div>{text == 0 ? '待发布' : text == 1 ? '进行中' : text == 2 ? '已截止' : ''}</div>
        ),
      },
      {
        title: '报价数量(家)	',
        dataIndex: 'count',
        key: 'count',
        width: 100,
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        width: 200,
        render: (tex, record) => {
          return record.status == 0 ? (
            <div style={{ textAlign: 'left' }}>
              <a href={pathInquiry + '/purchase/edit?pid=' + record.purchaseId} target="_blank">
                编辑
              </a>
              <Divider type="vertical" />
              <a href="javascript:;" onClick={() => this.operation(record.purchaseId, 'del')}>
                删除
              </a>
            </div>
          ) : record.status == 1 ? (
            <div style={{ textAlign: 'left' }}>
              <a href="javascript:;" onClick={() => this.operation(record.purchaseId, 'end')}>
                提前结束
              </a>
              <Divider type="vertical" />
              <a href="javascript:;" onClick={() => this.operation(record.purchaseId, 'delay')}>
                延长询价
              </a>
              {/*<Divider type="vertical" />*/}
              <div>
                <a href={pathInquiry + '/purchase/edit?sid=' + record.purchaseId} target="_blank">
                  发布相似询价
                </a>
              </div>
            </div>
          ) : record.status == 2 ? (
            <div style={{ textAlign: 'left' }}>
              <a href={pathInquiry + '/purchase/edit?sid=' + record.purchaseId} target="_blank">
                发布相似询价
              </a>
            </div>
          ) : null;
        },
      },
    ],
    startValue: null, // 开始日期
    endValue: null, // 结束日期
    endOpen: false,
    modalVisible: false,
    remarkSize: 0,
  };

  // 请求列表数据
  getInquiryData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'Inquiry/queryInquiryByPage',
      payload: this.state.params,
    }).then(() => {
      const { Inquiry } = this.props;
      if (!isfalse(Inquiry.inquiryData)) {
        let inquiryData = Inquiry.inquiryData;
        console.log(inquiryData);
        this.setState({
          totalPages: inquiryData.total ? inquiryData.total : 1,
        });
      }
    });
  }
  // 请求提前结束原因
  getDictionaryByParentId() {
    const { dispatch } = this.props;
    dispatch({
      type: 'Inquiry/getDictionaryByParentId',
      payload: { parentId: 254 },
    }).then(() => {
      const { Inquiry } = this.props;
      if (!isfalse(Inquiry.dictionaryByParentId)) {
        let dictionaryByParentId = Inquiry.dictionaryByParentId;
        console.log(dictionaryByParentId);
      }
    });
  }
  componentDidMount() {
    this.getDictionaryByParentId();
    this.getInquiryData();

    // 跳转页面发布后刷新数据
    let _this = this;
    window.addEventListener(
      'message',
      function(e) {
        console.log(e.data);
        _this.getInquiryData();
      },
      false
    );
  }
  //   操作
  operation = (purchaseId, type) => {
    let that = this;
    console.log(purchaseId);
    if (type === 'del') {
      confirm({
        title: '删除询价',
        content: '删除后无法恢复。您确定删除吗?',
        cancelText: '取消',
        okText: '确认',
        onOk() {
          const { dispatch } = that.props;
          dispatch({
            type: 'Inquiry/operation',
            payload: { action: type, purchaseId: purchaseId },
          }).then(() => {
            const { Inquiry } = that.props;
            let status = Inquiry.operationStatus;
            if (status) {
              message.success('删除成功!');
              that.getInquiryData();
            } else {
              message.error('删除失败!');
            }
          });
        },
      });
    }
    if (type === 'delay') {
      confirm({
        title: '延长询价时间',
        content: '点击确认延长询价单的截止时间,将有更多的时间来接受报价,每次延长天数为7天!',
        cancelText: '取消',
        okText: '确认',
        onOk() {
          const { dispatch } = that.props;
          dispatch({
            type: 'Inquiry/operation',
            payload: { action: type, purchaseId: purchaseId },
          }).then(() => {
            const { Inquiry } = that.props;
            let status = Inquiry.operationStatus;
            if (status) {
              message.success('延长成功!');
              that.getInquiryData();
            } else {
              message.error('延长失败!');
            }
          });
        },
      });
    }
    if (type === 'end') {
      this.setState({ modalVisible: true, purchaseId: purchaseId });
    }
  };

  onSelectChange = status => {
    let oldParams = Object.assign({}, this.state.params, {
      status: status,
      current: 1,
    });
    this.setState({ params: oldParams }, () => {
      this.getInquiryData();
    });
  };
  // 分页事件
  onPageChange = currPage => {
    let params = Object.assign({}, this.state.params, { current: currPage });
    this.setState({ params: params }, () => {
      this.getInquiryData();
    });
  };
  onSizeChange = (current, pageSize) => {
    console.log(current, pageSize);
    let params = Object.assign({}, this.state.params, { current: current, size: pageSize });
    this.setState({ params: params }, () => {
      this.getInquiryData();
    });
  };
  //   搜索
  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, values) => {
      if (err) return;
      if (values.publishBeginTime) {
        values.publishBeginTime = moment(values.publishBeginTime).format('YYYY-MM-DD');
      }
      if (values.publishEndTime) {
        values.publishEndTime = moment(values.publishEndTime).format('YYYY-MM-DD');
      }

      const searchValues = {
        ...values,
        current: 1,
      };

      this.setState({
        formValues: searchValues,
      });
      console.log(values);
      let oldParams = Object.assign({}, this.state.params, searchValues);
      this.setState({ params: oldParams }, () => {
        this.getInquiryData();
      });
    });
  };

  // 日期选择相关
  disabledStartDate = startValue => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = endValue => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = value => {
    this.onChange('startValue', value);
  };

  onEndChange = value => {
    this.onChange('endValue', value);
  };
  handleStartOpenChange = open => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = open => {
    this.setState({ endOpen: open });
  };
  //   搜索
  renderForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row>
          <a href={pathInquiry + '/purchase/publish'} target="_blank">
            <Button type="primary">发布询价</Button>
          </a>
        </Row>
        <Row style={{ lineHeight: '39px', marginTop: 20 }}>
          <FormItem label="询价ID：">
            {getFieldDecorator('purchaseNo')(<Input placeholder="请输入询价ID" />)}
          </FormItem>
          <FormItem label="项目名称：">
            {getFieldDecorator('projectName')(<Input placeholder="请输入项目名称" />)}
          </FormItem>
          <FormItem label="发布时间：">
            {getFieldDecorator('publishBeginTime')(
              <DatePicker
                disabledDate={this.disabledStartDate}
                onChange={this.onStartChange}
                onOpenChange={this.handleStartOpenChange}
                placeholder="请选择开始日期"
              />
            )}
          </FormItem>
          <span style={{ paddingRight: 11 }}>至</span>
          <FormItem label="">
            {getFieldDecorator('publishEndTime')(
              <DatePicker
                disabledDate={this.disabledEndDate}
                onChange={this.onStartChange}
                open={this.state.endOpen}
                onOpenChange={this.handleEndOpenChange}
                placeholder="请选择结束日期"
              />
            )}
          </FormItem>
          {/*<div style={{ float: 'right' }}>*/}
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          {/*</div>*/}
        </Row>
      </Form>
    );
  }
  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }
  //   提前结束询价表单提交
  handleSubmit = e => {
    e.preventDefault();
    let that = this;
    this.props.form.validateFieldsAndScroll((err, values) => {
      console.log(values);
      if (!err) {
        console.log(values);
        let end = { action: 'end', purchaseId: this.state.purchaseId };
        if (values.endReasonId) {
          end.endReasonId = values.endReasonId;
          end.dictionaryName = this.state.dictionaryName;
        } else {
          message.error('请选择提前结束询价的原因');
          return;
        }
        if (values.endReasonRemark) {
          end.endReasonRemark = values.endReasonRemark;
        }
        console.log(end);

        const { dispatch } = that.props;
        dispatch({
          type: 'Inquiry/operation',
          payload: end,
        }).then(() => {
          const { Inquiry } = that.props;
          let status = Inquiry.operationStatus;
          this.setState({ modalVisible: false });
          if (status) {
            message.success('提前结束成功!');
            that.getInquiryData();
          } else {
            message.error('提前结束失败!');
          }
        });
      }
    });
  };

  radioChange = (name, e) => {
    console.log('radio checked', name, e.target.value);
    this.setState({
      dictionaryName: name,
    });
  };
  render() {
    let _this = this;
    let { Inquiry, loading, form } = this.props;
    let { currentStatus, columns } = this.state;
    const { getFieldDecorator } = form;

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    return (
      <PageHeaderLayout>
        <Spin spinning={loading}>
          <Card title={'询价列表'}>
            <div>
              <Row>
                <Col span={24}>{this.renderForm()}</Col>
              </Row>
              <Row style={{ marginTop: '20px' }}>
                <Col span={12} style={{ marginTop: '7px' }}>
                  <div>
                    <RadioGroup defaultValue={currentStatus}>
                      <RadioButton value={0} onClick={value => this.onSelectChange('')}>
                        全部
                      </RadioButton>
                      <RadioButton value={1} onClick={value => this.onSelectChange(0)}>
                        待发布
                      </RadioButton>
                      <RadioButton value={2} onClick={value => this.onSelectChange(1)}>
                        进行中
                      </RadioButton>
                      <RadioButton value={3} onClick={value => this.onSelectChange(2)}>
                        已截止
                      </RadioButton>
                    </RadioGroup>
                  </div>
                </Col>
                <Col span={12} />
              </Row>
              <div style={{ marginTop: 15 }}>
                <Row>
                  <Col span={24}>
                    <Table
                      bordered
                      rowKey={(re, index) => index}
                      dataSource={Inquiry.inquiryData.records ? Inquiry.inquiryData.records : []}
                      columns={columns}
                      pagination={false}
                      scroll={{ y: 600 }}
                    />
                  </Col>
                </Row>
              </div>
            </div>
            {this.state.totalPages > 10 ? (
              <div style={{ margin: '20px 0', textAlign: 'right' }}>
                <Row>
                  <Pagination
                    pageSize={this.state.params.size}
                    current={this.state.params.current}
                    onChange={value => this.onPageChange(value)}
                    onShowSizeChange={(current, pageSize) => this.onSizeChange(current, pageSize)}
                    total={this.state.totalPages}
                    showQuickJumper
                    showSizeChanger
                    pageSizeOptions={['10', '20', '50', '100']}
                  />
                </Row>
              </div>
            ) : null}
          </Card>
          <Modal
            bodyStyle={{ maxHeight: 650, paddingBottom: 0 }}
            title={'提前结束询价'}
            centered
            destroyOnClose={true} //关闭时销毁 Modal 里的子元素
            maskClosable={false}
            visible={this.state.modalVisible}
            onOk={() => this.setModalVisible(false)}
            onCancel={() => this.setModalVisible(false)}
            footer={null}
            width={500}
          >
            <div>
              提前结束询价后，本条询价单状态将变为已截止，并不再接收到新报价，截止时间变为当前时间。
            </div>
            {/*<div>请选择提前结束询价的原因(必填)：</div>*/}
            <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
              <FormItem label="请选择提前结束询价的原因(必填)：">
                {getFieldDecorator('endReasonId', {
                  rules: [
                    {
                      /*{
                      required: true,
                      message: '请选择提前结束询价的原因',
                    },*/
                    },
                  ],
                })(
                  <RadioGroup>
                    {this.props.Inquiry.dictionaryByParentId.map(function(item, index) {
                      return (
                        <Radio
                          key={index}
                          style={radioStyle}
                          onClick={_this.radioChange.bind(_this, item.dictionaryName)}
                          value={item.dictionaryId.toString()}
                        >
                          {item.dictionaryName}
                        </Radio>
                      );
                    })}
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="">
                {getFieldDecorator('endReasonRemark', {
                  rules: [
                    {
                      max: 500,
                      message: '最多输入500个字',
                    },
                  ],
                })(
                  <TextArea
                    style={{ minHeight: 32 }}
                    placeholder="补充说明(选填)"
                    rows={4}
                    onKeyUp={e => {
                      this.setState({ remarkSize: e.target.value.length });
                    }}
                  />
                )}
                <div style={{ float: 'right' }}>
                  {this.state.remarkSize}
                  /500
                </div>
              </FormItem>
              <FormItem style={{ textAlign: 'center', paddingBottom: 20 }}>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ modalVisible: false });
                  }}
                  style={{ marginLeft: 8 }}
                >
                  取消
                </Button>
              </FormItem>
            </Form>
          </Modal>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
