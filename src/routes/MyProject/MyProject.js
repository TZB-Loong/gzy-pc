/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { Link } from 'dva/router';
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
  Popover,
  Badge,
  Dropdown,
  Menu,
  Icon,
} from 'antd';
import Empty from '../Common/Empty';
import { isfalse } from '../../Tools/util_tools';
import { isAuth } from '../../utils/utils';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import styles from './style.less';
const Search = Input.Search;
@connect(({ myProjectModel, loading }) => ({
  myProjectModel,
  loading: loading.effects['myProjectModel/fetch'],
}))
export default class MyProject extends Component {
  state = {
    searchText: '',
    loading: false,
    currentStatus: 0, //采购分类
    totalPages: 0,
    params: {
      projectName: '', // 关键字查询
      auditState: '', //审核状态
      current: 1, // 当前页数
      size: 10, // 每页显示记录条数
    },
    searchName: '', // 搜索框
    columns: [
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
        width: 200,
        render: (tex, record) => <Link to={'/project/details?id=' + record.id}>{tex}</Link>,
      },
      {
        title: '审核状态',
        dataIndex: 'auditState',
        key: 'auditState',
        width: 150,
        render: text => (
          <div>
            {text == 0 ? (
              <Badge status="default" text="未审核" />
            ) : text == 1 ? (
              <Badge status="success" text="审核通过" />
            ) : text == 2 ? (
              <Badge status="error" text="审核不通过" />
            ) : text == 3 ? (
              <Badge status="processing" text="审核中" />
            ) : (
              ''
            )}
          </div>
        ),
      },
      {
        title: '发标数量（个）',
        dataIndex: 'tenderNum',
        key: 'tenderNum',
        width: 150,
      },
      {
        title: '创建时间',
        dataIndex: 'addTime',
        key: 'addTime',
        width: 200,
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        width: 320,
        render: (tex, record) => {
          let params =
            '&projectName=' +
            record.projectName +
            '&tenderNum=' +
            record.tenderNum +
            '&addTime=' +
            record.addTime;
          return (
            <div>
              {record.auditState == 0 ? (
                <span>
                  <a
                    onClick={() => {
                      this.review(record);
                    }}
                    href="javascript:;"
                  >
                    提交审核
                  </a>
                  <Divider type="vertical" />
                </span>
              ) : (
                ''
              )}
              {isAuth('account_setting') ? (
                <span>
                  <Link to={'/project/ProjectSetting?id=' + record.id + params}>项目设置</Link>
                  <Divider type="vertical" />
                </span>
              ) : null}
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    <Menu.Item>
                      <a
                        style={{ color: '#333' }}
                        href={
                          '#/bid/material?projectId=' +
                          record.id +
                          '&auditState=' +
                          record.auditState
                        }
                      >
                        材料招标
                      </a>
                    </Menu.Item>
                    <Menu.Item>
                      <a
                        style={{ color: '#333' }}
                        href={
                          '#/bid/labour?projectId=' + record.id + '&auditState=' + record.auditState
                        }
                      >
                        劳务招标
                      </a>
                    </Menu.Item>
                  </Menu>
                }
              >
                <a href="javascript:;">发布招标</a>
              </Dropdown>
              {record.auditState == 0 || record.auditState == 2 || record.auditState == 3 ? (
                <span>
                  <Divider type="vertical" />
                  <a href="javascript:;" onClick={this.deletcClick.bind(this, tex, record)}>
                    删除
                  </a>
                </span>
              ) : (
                ''
              )}
            </div>
          );
        },
      },
    ],
  };

  deletcClick = (tex, record) => {
    if (record.tenderNum > 0) {
      Modal.warning({
        title: '删除项目信息',
        content: '选中的项目有已经发布的招标或者招标草稿。不能删除！',
        okText: '确定',
        maskClosable: true,
      });
      return;
    }
    const { dispatch } = this.props;
    let that = this;
    Modal.confirm({
      title: '确认删除选中的项目信息？',
      content: <span style={{ color: 'red' }}>删除成功之后，该操作将无法恢复。</span>,
      cancelText: '取消',
      okText: '确定',
      iconType: 'exclamation-circle',
      onOk() {
        dispatch({
          type: 'myProjectModel/delProject',
          payload: { delProject: { action: 'del', projectId: tex }, fetch: that.state.params },
        });
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  review(record) {
    let { dispatch, history } = this.props;

    // if(isfalse(record.projectContractFilesAttachIds)){
    //     Modal.confirm({
    //       title: '提交审核需要先完善项目信息！',
    //       content: <span style={{ color: 'red' }}>点击确定去完善信息页面。</span>,
    //       cancelText: '取消',
    //       okText: '确定',
    //       iconType: 'exclamation-circle',
    //       onOk() {
    //         history.push('/project/add?id=' + record.id)
    //       },
    //       onCancel() {
    //         console.log('Cancel');
    //       },
    //     });
    //     return
    // }

    dispatch({
      type: 'myProjectModel/delProject',
      payload: { delProject: { action: 'audit', projectId: record.id }, fetch: this.state.params },
      callback: () => {
        if (this.props.myProjectModel.delProject.status == '5002') {
          const reviewContent = <span style={{ color: 'red' }}>点击确定去完善信息页面。</span>;
          Modal.confirm({
            title: this.props.myProjectModel.delProject.msg,
            content: reviewContent,
            cancelText: '取消',
            okText: '确定',
            iconType: 'exclamation-circle',
            onOk() {
              history.push('/project/add?id=' + record.id);
            },
            onCancel() {
              console.log('Cancel');
            },
          });
        }
        if (this.props.myProjectModel.delProject.status == '5001') {
          Modal.warning({
            title: this.props.myProjectModel.delProject.msg,
            okText: '确定',
          });
        }
        if (this.props.myProjectModel.delProject.status == '200') {
          message.success('提交审核成功');
        }
      },
    });
  }

  // 请求列表数据
  getProjectList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'myProjectModel/fetch',
      payload: this.state.params,
    }).then(() => {
      const { myProjectModel } = this.props;
      if (!isfalse(myProjectModel.projectList)) {
        let projectList = myProjectModel.projectList;
        // console.log(projectList);
        this.setState({
          totalPages: projectList.total ? projectList.total : 1,
        });
      }
    });
  }
  componentDidMount() {
    this.getProjectList();
  }

  handleSearch = value => {
    let oldParams = Object.assign({}, this.state.params, { projectName: value, current: 1 });
    this.setState({ params: oldParams }, () => {
      this.getProjectList();
    });
  };

  onSelectChange = status => {
    let oldParams = Object.assign({}, this.state.params, {
      auditState: status,
      current: 1,
    });
    this.setState({ params: oldParams }, () => {
      this.getProjectList();
    });
  };
  // 分页事件
  onPageChange = currPage => {
    let params = Object.assign({}, this.state.params, { current: currPage });
    this.setState({ params: params }, () => {
      this.getProjectList();
    });
  };
  onSizeChange = (current, pageSize) => {
    // console.log(current, pageSize);
    let params = Object.assign({}, this.state.params, { current: current, size: pageSize });
    this.setState({ params: params }, () => {
      this.getProjectList();
    });
  };

  // 搜索框清空
  emitEmpty = () => {
    this.userNameInput.focus();
    // console.log(this.state.searchName);
    this.handleSearch('');
    this.setState({ searchName: '' });
  };
  render() {
    let { myProjectModel, loading } = this.props;
    let { currentStatus, columns, searchName } = this.state;

    const suffix = searchName ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;
    return (
      <PageHeaderLayout>
        <Spin spinning={loading}>
          <Card title={'项目管理'}>
            {myProjectModel.projectList ? (
              <div>
                <Row>
                  <Col span={24}>
                    {isAuth('project_setting') ? (
                      <Button type="primary" href={'#/project/add'}>
                        创建项目
                      </Button>
                    ) : null}
                  </Col>
                </Row>
                <Row style={{ marginTop: '15px' }}>
                  <Col span={12} style={{ marginTop: '7px' }}>
                    <div>
                      <RadioGroup defaultValue={currentStatus}>
                        <RadioButton value={0} onClick={value => this.onSelectChange('')}>
                          全部
                        </RadioButton>
                        <RadioButton value={1} onClick={value => this.onSelectChange(0)}>
                          未审核
                        </RadioButton>
                        <RadioButton value={2} onClick={value => this.onSelectChange(1)}>
                          审核通过
                        </RadioButton>
                        <RadioButton value={3} onClick={value => this.onSelectChange(2)}>
                          审核不通过
                        </RadioButton>
                        <RadioButton value={4} onClick={value => this.onSelectChange(3)}>
                          审核中
                        </RadioButton>
                      </RadioGroup>
                    </div>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right', marginTop: '7px' }}>
                    <Search
                      placeholder="请输入项目关键字"
                      enterButton="搜索"
                      style={{ width: '300px', marginLeft: '20px' }}
                      onSearch={value => this.handleSearch(value)}
                      suffix={suffix}
                      ref={node => (this.userNameInput = node)}
                      value={searchName}
                      onChange={e => {
                        this.setState({ searchName: e.target.value });
                      }}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 15 }}>
                  <Row>
                    <Col span={24}>
                      <Table
                        bordered
                        rowKey={(re, index) => index}
                        dataSource={
                          myProjectModel.projectList.records
                            ? myProjectModel.projectList.records
                            : []
                        }
                        columns={columns}
                        pagination={false}
                        scroll={{ y: 600 }}
                      />
                    </Col>
                  </Row>
                </div>
              </div>
            ) : (
              <div>
                <Empty msg="项目" />
                <div style={{ textAlign: 'center' }}>
                  <Button type="primary">
                    <Link to="/project/add">立即添加</Link>
                  </Button>
                  {/*&nbsp;&nbsp;
              <Button type="primary" href="/">
                批量导入
              </Button>*/}
                </div>
              </div>
            )}
            {this.state.totalPages > 10 ? (
              <div style={{ margin: '20px 0', textAlign: 'right' }}>
                <Row>
                  {/*<Col span={12} style={{ textAlign: 'left' }} />
                <Col span={12}>*/}
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
                  {/*</Col>*/}
                </Row>
              </div>
            ) : null}
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
