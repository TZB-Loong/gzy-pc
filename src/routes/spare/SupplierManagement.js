/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Table,
  Spin,
  Pagination,
  Icon,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Modal,
  Form,
  Select,
  Upload,
} from 'antd';
// import style from 'style.less'
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;
@Form.create()
@connect(({ supplierManagementModel, loading }) => ({
  supplierManagementModel,
  loading,
}))
export default class SupplierManagement extends Component {
  state = {
    searchText: '',
    params: {
      keyword: '', // 关键字查询
      current: 1, // 当前页数
      size: 10, // 每页显示记录条数
    },

    modalVisible: false,
    previewVisible: false,
    previewImage: '',
    fileList: [],
  };
  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }

  componentDidMount() {
    // console.log(this.props);
  }

  componentWillUnmount() {}

  handleSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => () => {
    clearFilters();
    this.setState({ searchText: '' });
  };
  // 分页事件
  onPageChange = currPage => {
    let params = Object.assign({}, this.state.params, { current: currPage });
    this.setState(
      {
        params: params,
      },
      () => {
        const { dispatch } = this.props;
        /* dispatch({
          type: 'supplierManagementModel/tableList',
          payload: this.state.params,
        });*/
      }
    );
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let fileData = [];
        if (values.uploadImg) {
          values.uploadImg.fileList.map(item => {
            if (item.status === 'done') {
              fileData.push(item.response.obj.path);
            }
          });
          values.uploadImg = fileData.toString();
        }
      }
    });
  };
  normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    let imgSrc = file.url;
    if (imgSrc && imgSrc.indexOf('?') > -1) {
      imgSrc = file.url.split('?')[0];
    }
    this.setState({
      previewImage: imgSrc || file.thumbUrl,
      previewVisible: true,
    });
  };
  handleChange = ({ fileList }) => this.setState({ fileList });
  render() {
    const { supplierManagementModel } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
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
    const dataSource = [
      {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
      },
      {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
      },
      {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
      },
      {
        key: '4',
        name: 'Jim Red',
        age: 32,
        address: 'London No. 2 Lake Park',
      },
    ];

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => (this.searchInput = ele)}
              placeholder="Search name"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={this.handleSearch(selectedKeys, confirm)}
            />
            <Button type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>
              Search
            </Button>
            <Button onClick={this.handleReset(clearFilters)}>Reset</Button>
          </div>
        ),
        filterIcon: filtered => (
          <Icon type="filter" style={{ color: filtered ? '#108ee9' : '#aaa' }} />
        ),
        onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              this.searchInput.focus();
            });
          }
        },
        render: text => {
          const { searchText } = this.state;
          return searchText ? (
            <span>
              {text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map(
                (fragment, i) =>
                  fragment.toLowerCase() === searchText.toLowerCase() ? (
                    <span key={i} className="highlight">
                      {fragment}
                    </span>
                  ) : (
                    fragment
                  ) // eslint-disable-line
              )}
            </span>
          ) : (
            text
          );
        },
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        sorter: (a, b) => a.age - b.age,
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        filters: [
          {
            text: 'London',
            value: 'London',
          },
          {
            text: 'New York',
            value: 'New York',
          },
        ],
        sorter: (a, b) => a.address.length - b.address.length,
        onFilter: (value, record) => record.address.indexOf(value) === 0,
      },
    ];
    return (
      <Spin spinning={supplierManagementModel.loading}>
        <Card title={supplierManagementModel.data}>
          <Row>
            <Col span={12} />
            <Col span={11} style={{ textAlign: 'right' }}>
              <a
                onClick={() => {
                  this.setState({ modalVisible: true });
                }}
                href="javascript:void(0)"
              >
                <Icon type="plus" />
                &nbsp;添加供应商
              </a>
              <Divider type="vertical" />
              <a href="javascript:void(0)">
                <Icon type="folder-add" />
                &nbsp;&nbsp;批量导入供应商
              </a>
            </Col>
          </Row>
          <div style={{ marginTop: 15 }}>
            <Row>
              <Col span={23}>
                <Table bordered dataSource={dataSource} columns={columns} pagination={false} />
              </Col>
              <Col span={1} style={{ textAlign: 'center' }}>
                <a href="javascript:void(0)">
                  <Icon type="setting" style={{ fontSize: '26px', lineHeight: '55px' }} />
                </a>
              </Col>
            </Row>
          </div>
          <div style={{ margin: '20px 0', textAlign: 'right' }}>
            <Row>
              <Col span={23}>
                {(() => {
                  if (1 > 0) {
                    return (
                      <Pagination
                        pageSize={this.state.params.size}
                        current={this.state.params.current}
                        onChange={value => this.onPageChange(value)}
                        total={15}
                      />
                    );
                  }
                })()}
              </Col>
            </Row>
          </div>
        </Card>
        <Modal
          bodyStyle={{ maxHeight: 650, overflowY: 'scroll', paddingBottom: 0 }}
          title="编辑材料供应商信息 "
          centered
          visible={this.state.modalVisible}
          onOk={() => this.setModalVisible(false)}
          onCancel={() => this.setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="序号：">
              <Input disabled value="CL0001" />
            </FormItem>
            <FormItem {...formItemLayout} label="供应商名称：">
              {getFieldDecorator('title', {
                rules: [
                  {
                    required: true,
                    message: '请输入供应商名称',
                  },
                  {
                    max: 50,
                    message: '最多输入50个字符',
                  },
                ],
              })(<Input placeholder="请输入供应商名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="联系人：">
              {getFieldDecorator('userName', {
                rules: [
                  {
                    required: true,
                    message: '请输入联系人',
                  },
                  {
                    max: 10,
                    message: '最多输入10个字',
                  },
                ],
              })(<Input placeholder="请输入联系人" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="手机号码：">
              {getFieldDecorator('phone', {
                rules: [
                  {
                    pattern: /^[1][3,4,5,7,8][0-9]{9}$/,
                    message: '请输入正确格式的手机号码',
                  },
                  {
                    required: true,
                    message: '请输入手机号码',
                  },
                ],
              })(<Input placeholder="请输入手机号码" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="主营材料分类：">
              {getFieldDecorator('sort', {
                rules: [
                  {
                    max: 80,
                    message: '最多输入80个字符',
                  },
                ],
              })(<Input placeholder="请填写主营材料分类" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="主营材料名称：">
              {getFieldDecorator('materialName', {
                rules: [
                  {
                    max: 80,
                    message: '最多输入80个字符',
                  },
                ],
              })(<Input placeholder="请填写主营材料名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="经营品牌：">
              {getFieldDecorator('brand', {
                rules: [
                  {
                    max: 80,
                    message: '最多输入80个字符',
                  },
                ],
              })(<Input placeholder="请填写经营品牌" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="供应商类型：">
              {getFieldDecorator('type', {
                rules: [
                  {
                    max: 80,
                    message: '最多输入80个字符',
                  },
                ],
              })(<Input placeholder="请填写供应商类型" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="经营产品范围：">
              {getFieldDecorator('range', {
                rules: [
                  {
                    max: 80,
                    message: '最多输入80个字符',
                  },
                ],
              })(<Input placeholder="请填写经营产品范围" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="供货区域：">
              {getFieldDecorator('area_p', {})(
                <Select placeholder="请选择" style={{ width: 120, marginRight: 20 }}>
                  <Option value="jack">Jack</Option>
                </Select>
              )}
              {getFieldDecorator('area_c', {})(
                <Select placeholder="请选择" style={{ width: 120 }}>
                  <Option value="jack">Jack</Option>
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="厂家地址：">
              {getFieldDecorator('address', {
                rules: [
                  {
                    max: 100,
                    message: '最多输入100个字符',
                  },
                ],
              })(<Input placeholder="请填写厂家地址" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="邮箱">
              {getFieldDecorator('email', {
                rules: [
                  {
                    type: 'email',
                    message: '邮箱格式错误',
                  },
                ],
              })(<Input placeholder="请填写邮箱" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="付款方式：">
              {getFieldDecorator('payment', {
                rules: [
                  {
                    max: 80,
                    message: '最多输入80个字符',
                  },
                ],
              })(<Input placeholder="请填写付款方式" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="评价等级：">
              {getFieldDecorator('level', {
                rules: [
                  {
                    max: 10,
                    message: '最多输入10个字符',
                  },
                ],
              })(<Input placeholder="请填写评价等级" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="合作项目：">
              {getFieldDecorator('project', {
                rules: [],
              })(<TextArea style={{ minHeight: 32 }} placeholder="请填写合作项目" rows={4} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="考察报告：">
              {/*<div className="clearfix">
                  <Upload
                    action="//jsonplaceholder.typicode.com/posts/"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    accept={'image/gif,image/jpeg,image/jpg,image/png,image/svg'}
                  >
                    {fileList.length >= 3 ? null : uploadButton}
                  </Upload>
                  <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                  </Modal>
                </div>*/}
              {getFieldDecorator('uploadImg', {})(
                <Upload
                  {...upLoadInit('file', [], 'picture-card', 'bidFile', true, true, this)}
                  fileList={this.state.fileList}
                  onChange={e => uploadChange(e, 'fileList', this)}
                  onPreview={this.handlePreview}
                  beforeUpload={e => beforeUpload(e, ['img'], 2)}
                  accept={'image/gif,image/jpeg,image/jpg,image/png,image/svg'}
                >
                  {fileList.length >= 3 ? null : <Icon type="upload" />}
                </Upload>
              )}
              <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
              </Modal>
            </FormItem>
            <FormItem {...formItemLayout} label="备注：">
              {getFieldDecorator('remark', {
                rules: [],
              })(<TextArea style={{ minHeight: 32 }} placeholder="请填写备注" rows={4} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="其他附件：">
              {getFieldDecorator('file', {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
              })(
                <Upload name="logo" action="/upload.do" listType="picture">
                  <Button>
                    <Icon type="upload" /> Click to upload
                  </Button>
                </Upload>
              )}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
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
    );
  }
}
