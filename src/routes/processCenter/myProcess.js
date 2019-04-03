/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Table,
  List,
  Avatar,
  Button,
  Input,
  Spin,
  Row,
  Col,
  Radio,
  Divider,
  Pagination,
} from 'antd';
import styles from './style.less';
import Empty from '../Common/Empty';
import { isfalse } from '../../Tools/util_tools';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

function onChange(pagination, filters, sorter) {
  // console.log('params', pagination, filters, sorter);
}
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Search = Input.Search;

var newDate = new Date();

const approvalSearch = (
  <Search
    placeholder="请输入审核事项或发起人"
    enterButton="搜索"
    style={{ width: 300 }}
    onSearch={value => console.log(value)}
  />
);

@connect(({ myProcessModel, loading }) => ({
  myProcessModel,
  Table,
  List,
  Avatar,
  Button,
  Input,
  Spin,
  Row,
  Col,
  Radio,
  Divider,
  Pagination,
  loading: loading.effects['myProcessModel/fetch'],

  // loading: loading.effects['authoritySettings/queryRoles'],
}))
export default class myProcess extends Component {
  state = {
    searchText: '',
    currentTaskName: '',
    arriveTime: '',
    loading: false,
    currentStatus: 0,
    totalPages: 0,
    params: {
      processName: '', // 关键字查询
      // processState: '', //审核状态
      current: 1, // 当前页数
      size: 10, // 每页显示记录条数
    },
  };

  // 请求列表数据
  LaunchedTaskList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'myProcessModel/fetch',
      payload: this.state.params,
    }).then(() => {
      const { myProcessModel } = this.props;
      if (!isfalse(myProcessModel.LaunchedTaskList)) {
        let LaunchedTaskList = myProcessModel.LaunchedTaskList;
        this.setState({
          totalPages: LaunchedTaskList.total ? LaunchedTaskList.total : 1,
        });
      }
    });
  }

  componentDidMount() {
    this.LaunchedTaskList();
  }
  handleSearch = value => {
    let searchParams = [{ fieldName: 'keyword', fieldValue: value, fieldType: 5 }];
    let oldParams = Object.assign({}, this.state.params, {
      queryConditions: JSON.stringify(searchParams),
      current: 1,
    });
    this.setState(
      {
        params: oldParams,
      },
      () => {
        this.LaunchedTaskList();
      }
    );
  };

  onSelectChange = status => {
    let oldParams = Object.assign({}, this.state.params, {
      processName: status,
      current: 1,
    });
    this.setState(
      {
        params: oldParams,
      },
      () => {
        this.LaunchedTaskList();
      }
    );
  };
  // 分页事件
  onPageChange = currPage => {
    let params = Object.assign({}, this.state.params, { current: currPage });
    this.setState(
      {
        params: params,
      },
      () => {
        this.LaunchedTaskList();
      }
    );
  };
  onSizeChange = (current, pageSize) => {
    // console.log(current, pageSize);
    let params = Object.assign({}, this.state.params, { current: current, size: pageSize });
    this.setState(
      {
        params: params,
      },
      () => {
        this.LaunchedTaskList();
      }
    );
  };

  static defaultProps = {};

  componentWillUnmount() { }
  // 获取当前时间距指定时间间隔时间
  getDate(time) {
    return (newDate.valueOf() - moment(time).valueOf()) / 1000 / 3600;
  }
  render() {
    let _this = this;
    function callback(key) {
      // console.log(key);
    }
    function ApprovalProcess() {
      return <span className={styles.flowProceed}>审批中</span>;
    }
    function SucceedProcess() {
      return <span className={styles.flowSucceed}>已完成</span>;
    }
    function GoBackProcess() {
      return <span className={styles.flowError}>被驳回</span>;
    }

    // function flowState(props) {
    //   const showState = props.showState;
    //   if (showState) {
    //     return <approvalProcess />;
    //   }
    //   return <ErrorProcess />;
    // }

    const { myProcessModel, loading } = this.props;
    let { currentStatus } = this.state;
    return (
      <Spin spinning={loading}>
        <PageHeaderLayout>
          <Card title={myProcessModel.data}>
            {/*<Button type="primary">发起审批</Button>*/}
            {/*<Row style={{ marginTop: '20px' }}>*/}
            <Row>
              <Col span={12}>
                <div>
                  <RadioGroup defaultValue={currentStatus}>
                    <RadioButton value={0} onClick={value => this.onSelectChange('')}>
                      全部
                    </RadioButton>
                    <RadioButton
                      value="支付审批"
                      onClick={value => this.onSelectChange('支付审批')}
                    >
                      支付审批
                    </RadioButton>
                    <RadioButton
                      value="定标审批"
                      onClick={value => this.onSelectChange('定标审批')}
                    >
                      定标审批
                    </RadioButton>
                  </RadioGroup>
                </div>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Search
                  placeholder="请输入审核事项或发起人"
                  enterButton="搜索"
                  style={{ width: '300px', marginLeft: '20px' }}
                  onSearch={value => this.handleSearch(value)}
                />
              </Col>
            </Row>
            <Divider />
            <List
              itemLayout="horizontal"
              dataSource={
                myProcessModel.LaunchedTaskList.records
                  ? myProcessModel.LaunchedTaskList.records
                  : []
              }
              renderItem={item =>
                item.processName == '定标审批' ? (
                  <a
                    href={
                      '#/performance/bidApprovalView?calibrationId=' +
                      item.bizObjId +
                      '&orderId=' +
                      item.processInstId +
                      '&taskId=' +
                      item.currentTaskId +
                      '&projectId=' +
                      item.projectId +
                      '&processCode=' +
                      item.processCode +
                      '&type=view'
                    }
                  >
                    <List.Item className={styles['ant-list-item']}>
                      <List.Item.Meta
                        avatar={
                          <div style={{ position: 'relative', top: '15px' }}>
                            <Avatar
                              size="large"
                              style={{ color: '#FFF', backgroundColor: '#4B85F8', fontSize: 16 }}
                            >
                              定
                            </Avatar>
                          </div>
                        }
                        title={
                          <span>
                            <span style={{ color: '#4B85F8' }}>{item.processName}</span>
                            <br />
                            {item.projectName}
                          </span>
                        }
                        description={<span className={styles.textW}>{item.title}</span>}
                      />

                      <List.Item.Meta
                        description={
                          <div style={{ textAlign: 'center' }}>
                            {item.isTurnDown == 1 ? (
                              <GoBackProcess />
                            ) : item.processState == 1 ? (
                              <ApprovalProcess />
                            ) : item.processState == 2 ? (
                              <SucceedProcess />
                            ) : (
                                    ''
                                  )}
                          </div>
                        }
                      />
                      <div style={{ color: 'rgba(0, 0, 0, 0.45)', marginRight: '15px' }}>
                        {/*{item.processName == '支付审批' ? '到达时间：' : '预估开标时间：'}
                        {item.arriveTime}*/}
                        {item.processName == '支付审批'|| item.projectId == -1  ? '到达时间：' : item.processName != '支付审批' && item.processState == 1 ? '到达时间：' : item.processState == 1 ? '预估开标时间：' : '实际开标时间：'}
                        {item.processName == '支付审批' || item.projectId == -1 ? item.arriveTime : item.bizObjContent ? moment(JSON.parse(item.bizObjContent).openDate).format('YYYY-MM-DD HH:mm:ss') : ''}
                        <br />
                        {console.log(item, 'item')}
                        {item.isTurnDown != 1 && item.processName == '定标审批' ? (
                          <p
                            style={{
                              color: '#EE7356',
                              fontSize: 12,
                              display: item.processState == 1 ? null : 'none',
                            }}
                          >
                            {_this.getDate(JSON.parse(item.bizObjContent).openDate) < 0
                              ? '剩余'
                              : '超过'}

                            {Math.abs(
                              Math.floor(
                                _this.getDate(JSON.parse(item.bizObjContent).openDate) / 24
                              )
                            ) > 0
                              ? Math.abs(
                                Math.floor(
                                  _this.getDate(JSON.parse(item.bizObjContent).openDate) / 24
                                )
                              ) + '天'
                              : Math.abs(
                                Math.floor(_this.getDate(JSON.parse(item.bizObjContent).openDate))
                              ) + '小时'}
                          </p>
                        ) : (
                            ''
                          )}
                      </div>
                    </List.Item>
                  </a>
                ) : (
                    <a
                      href={
                        item.projectId == -1 ? ('#/processCenter/designFormWrite?type=view&bizCode=' + item.bizObjCode +
                          '&taskId=' + item.currentTaskId +
                          '&orderId=' + item.processInstId +
                          '&processCode=' + item.processCode +
                          '&projectId=' + item.projectId +
                          '&bizObjId=' + item.bizObjId+'&bizName='+item.title
                        ) :
                          (
                            '#/processCenter/processDetails?aprvId=' +
                            item.bizObjId +
                            '&orderId=' +
                            item.processInstId +
                            '&taskId=' +
                            item.currentTaskId +
                            '&projectId=' +
                            item.projectId +
                            '&processCode=' +
                            item.processCode)
                      }
                    >
                      <List.Item className={styles['ant-list-item']}>
                        <List.Item.Meta
                          avatar={
                            <div style={{ position: 'relative', top: item.projectId == -1 ? '3px' : '15px' }}>
                              {item.processName == '支付审批' ? (
                                <Avatar
                                  size="large"
                                  style={{ color: '#FFF', backgroundColor: '#F29D39', fontSize: 16 }}
                                >
                                  支
                              </Avatar>
                              ) : (
                                  ''
                                )}
                              {item.processName == '定标审批' ? (
                                <Avatar
                                  size="large"
                                  style={{ color: '#FFF', backgroundColor: '#4B85F8', fontSize: 16 }}
                                >
                                  定
                              </Avatar>
                              ) : (
                                  ''
                                )}
                              {
                                item.projectId == -1 ? (
                                  <Avatar
                                    size="large"
                                    style={{ color: '#FFF', backgroundColor: '#4B85F8', fontSize: 16 }}
                                  >
                                    {item.title.slice(0,1)}
                              </Avatar>
                                ) : (
                                    ''
                                  )}
                            </div>
                          }
                          title={
                            <span>
                              <span style={{ color: '#4B85F8' }}>{item.processName}</span>
                              <br />
                              {item.projectName}
                            </span>
                          }
                          description={<span className={styles.textW}>{item.title}</span>}
                        />

                        <List.Item.Meta
                          description={
                            <div style={{ textAlign: 'center' }}>
                              {item.isTurnDown == 1 ? (
                                <GoBackProcess />
                              ) : item.processState == 1 ? (
                                <ApprovalProcess />
                              ) : item.processState == 2 ? (
                                <SucceedProcess />
                              ) : (
                                      ''
                                    )}
                            </div>
                          }
                        />

                        <div style={{ color: 'rgba(0, 0, 0, 0.45)', marginRight: '15px' }}>
                          {/*{item.processName == '支付审批' ? '到达时间：' : '预估开标时间：'}
                        {item.arriveTime}*/}
                          {item.processName == '支付审批'|| item.projectId == -1
                            ? '到达时间：'
                            : item.processState == 1
                              ? '预估开标时间：'
                              : '实际开标时间：'}
                          {item.processName == '支付审批' || item.projectId == -1
                            ? item.arriveTime
                            : item.bizObjContent
                              ? moment(JSON.parse(item.bizObjContent).openDate).format(
                                'YYYY-MM-DD HH:mm:ss'
                              )
                              : ''}
                          <br />
                          {item.isTurnDown != 1 && item.processName == '定标审批' ? (
                            <p
                              style={{
                                color: '#EE7356',
                                fontSize: 12,
                                display: item.processState == 1 ? null : 'none',
                              }}
                            >
                              {_this.getDate(JSON.parse(item.bizObjContent).openDate) < 0
                                ? '剩余'
                                : '超过'}

                              {Math.abs(
                                Math.floor(
                                  _this.getDate(JSON.parse(item.bizObjContent).openDate) / 24
                                )
                              ) > 0
                                ? Math.abs(
                                  Math.floor(
                                    _this.getDate(JSON.parse(item.bizObjContent).openDate) / 24
                                  )
                                ) + '天'
                                : Math.abs(
                                  Math.floor(_this.getDate(JSON.parse(item.bizObjContent).openDate))
                                ) + '小时'}
                            </p>
                          ) : (
                              ''
                            )}
                        </div>
                      </List.Item>
                    </a>
                  )
              }
            />
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
        </PageHeaderLayout>
      </Spin>
    );
  }
}
