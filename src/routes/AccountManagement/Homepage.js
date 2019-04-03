/*eslint-disable*/
import moment from 'moment';
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Divider,
  Table,
  Spin,
  Row,
  Col,
  Tabs,
  Icon,
  Modal,
  List,
  Avatar,
  message,
} from 'antd';
import { isfalse, timestampToTime, currentTime, dateDiff } from '../../Tools/util_tools';
import Empty from '../Common/Empty';
import styles from './style.less';

import { yuan, Pie } from 'components/Charts';

const TabPane = Tabs.TabPane;
const ListItem = List.Item;
const Yuan = ({ children }) => (
  <span>
    <span
      dangerouslySetInnerHTML={{
        __html: children.toFixed(2),
      }} /* eslint-disable-line react/no-danger */
    />
    元
  </span>
);
var newDate = new Date();

@connect(
  ({ homepageModel, loading, waitProcessModel, accountChildModel, informationCenterModel }) => ({
    homepageModel,
    loading,
    waitProcessModel,
    accountChildModel,
    informationCenterModel,
  })
)
export default class Homepage extends Component {
  state = {
    currentTime: moment(newDate).format('LLLL'),
    modalVisible: false,
    panelCode: {
      panelAwaitApprove: 1, //待审批
      panelSupplierRecommend: 1, //优质供应商推荐
      panelAwaitConfirmWinner: 1, //待定标
      panelTenderContractStatistics: 1, //当年项目数据统计
    },
    saveCode: {
      panelAwaitApprove: 1, //待审批
      panelSupplierRecommend: 1, //优质供应商推荐
      panelAwaitConfirmWinner: 1, //待定标
      panelTenderContractStatistics: 1, //当年项目数据统计
    },
    thisYearProject: [], //统计饼图数据
    projectTenderAgreementList: [], //项目统计列表
    hoverId: 0,
    columns: [
      {
        title: '招标信息',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (text, record) => {
          let view = record.tenderType == 1 ? 'MaterialView' : 'LabourView';
          return (
            <div
              style={{
                width: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <a href={'#/bid/' + view + '?tenderId=' + record.tenderId}>
                招：
                {record.tenderCategory}
              </a>
              <div>
                参与投标单位：
                {record.bidCount}
              </div>
            </div>
          );
        },
      },
      {
        title: '所属项目',
        dataIndex: 'projectName',
        key: 'projectName',
        sorter: true,
      },
      {
        title: '操作',
        dataIndex: 'options',
        key: 'options',
        width: 150,
        render: (text, record) =>
          record.tenderType == 1 ? (
            <span style={{ display: 'flex', justifyContent: 'space-around' }}>
              <a
                href={
                  '#/performance/bidApproval?tenderType=1&saveType=2&tenderId=' +
                  record.tenderId +
                  '&projectId=' +
                  record.projectId
                }
              >
                定标
              </a>
              <a
                href={
                  '#/performance/bidApproval?tenderType=1&saveType=1&tenderId=' +
                  record.tenderId +
                  '&projectId=' +
                  record.projectId
                }
              >
                定标审批
              </a>
            </span>
          ) : (
            <span style={{ display: 'flex', justifyContent: 'space-around' }}>
              <a
                href={
                  '#/performance/bidApproval?tenderType=2&saveType=2&tenderId=' +
                  record.tenderId +
                  '&projectId=' +
                  record.projectId
                }
              >
                定标
              </a>
              <a
                href={
                  '#/performance/bidApproval?tenderType=2&saveType=1&tenderId=' +
                  record.tenderId +
                  '&projectId=' +
                  record.projectId
                }
              >
                定标审批
              </a>
            </span>
          ),
      },
    ],
    pieColumns: [
      {
        title: '合同数据统计',
        colSpan: 2,
        dataIndex: 'x',
      },
      {
        title: '1',
        colSpan: 0,
        dataIndex: 'y',
      },
    ],
    projectColumns: [
      {
        title: '招标信息',
        colSpan: 3,
        dataIndex: 'tenderCategory',
        key: 'tenderCategory',
        width: 150,
        render: (text, record) => {
          return (
            <div
              style={{
                width: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <a
                href={
                  record.tenderType == 2
                    ? '#/bid/MaterialView?tenderId=' + record.tenderId
                    : '#/bid/LabourView?tenderId=' + record.tenderId
                }
                target="_blank"
              >
                招：
                {text}
              </a>
            </div>
          );
        },
      },
      {
        title: '所属项目',
        colSpan: 0,
        dataIndex: 'projectName',
        key: 'projectName',
        sorter: true,
        render: text => (
          <div
            style={{
              width: '130px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
        ),
      },
      {
        title: '金额',
        colSpan: 0,
        dataIndex: 'sumMoney',
        key: 'sumMoney',
      },
    ],
    selectId: '',
    changeData: {},
  };
  //  首页用户自定义排版
  getHomePanel() {
    const { dispatch } = this.props;
    dispatch({
      type: 'homepageModel/getHomePanel',
    }).then(() => {
      const { getHomePanelData } = this.props.homepageModel;
      if (getHomePanelData && getHomePanelData.panelContent) {
        let panelContent = JSON.parse(getHomePanelData.panelContent);

        this.setState({
          panelCode: panelContent,
        });
      }
    });
  }
  //  首页用户自定义排版保存
  saveHomePanel(bodyData) {
    let data = JSON.stringify(bodyData);
    const { dispatch } = this.props;
    dispatch({
      type: 'homepageModel/saveHomePanel',
      payload: { panelContent: data },
    }).then(() => {
      const { saveHomePanelData } = this.props.homepageModel;
      if (saveHomePanelData && saveHomePanelData.status == 200) {
        message.success('修改版块成功');
        this.getHomePanel();
      }
    });
  }
  // 首页数量统计
  getQuantityStatistics() {
    const { dispatch } = this.props;
    dispatch({
      type: 'homepageModel/getQuantityStatistics',
      payload: this.state.params,
    }).then(() => {});
  }
  // 首页待审批流程列表
  getTodoTaskList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'homepageModel/getTodoTaskList',
      payload: { top: 5 },
    }).then(() => {});
  }
  // 首页待定标招标列表
  getWaitOpenTenderList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'homepageModel/getWaitOpenTenderList',
      payload: { top: 8 },
    }).then(() => {});
  }
  // 首页供应商广告列表
  getSupplierBannerList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'homepageModel/getSupplierBannerList',
    }).then(() => {});
  }
  // 首页本年项目图表统计
  getThisYearProjectStatistics() {
    const { dispatch } = this.props;
    dispatch({
      type: 'homepageModel/getThisYearProjectStatistics',
    }).then(() => {
      let { thisYearProjectStatistics } = this.props.homepageModel;
      if (thisYearProjectStatistics && thisYearProjectStatistics.length > 0) {
        thisYearProjectStatistics.map(item => {
          item.x = item.projectName;
          item.y = item.sumMoney;
        });
        this.setState({
          thisYearProject: thisYearProjectStatistics,
          projectTenderAgreementList: thisYearProjectStatistics[0].tenderAgreementList,
        });
      }
    });
  }
  // 首页本年项目招标合同详细列表
  getProjectTenderAgreementList(id) {
    this.state.thisYearProject.map(item => {
      if (item.projectId == id) {
        this.setState({ projectTenderAgreementList: item.tenderAgreementList });
      }
    });
  }
  // 定时器
  currentTime() {
    let theDate = new Date();
    this.setState({
      currentTime: moment(theDate).format('LLLL'),
    });
  }
  // 消息中心 系统公告
  messageList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'informationCenterModel/messageList',
      payload: { type: '1', current: 1, size: 10 },
    });
  }
  // 首页动态内容展示
  queryOperateDynamicInfo() {
    const { dispatch } = this.props;
    dispatch({
      type: 'homepageModel/queryOperateDynamicInfo',
    }).then(() => {});
  }
  componentDidMount() {
    this.getQuantityStatistics();
    this.getTodoTaskList();
    this.getWaitOpenTenderList();
    // this.getSupplierBannerList();
    this.getThisYearProjectStatistics();
    //this.messageList();
    this.queryOperateDynamicInfo();

    this.getHomePanel();

    let user = JSON.parse(sessionStorage.getItem('user'));
    let authbusiness = JSON.parse(sessionStorage.getItem('authbusiness'));
    if (!isfalse(user)) {
      this.setState({
        username: user.username,
        purchaseCompanyName: authbusiness.companyName,
        isAdmin: user.isAdmin,
      });
    }
    setInterval(() => {
      this.currentTime();
    }, 60000);
  }

  closeModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }

  // 饼图点击块
  clickId(e) {
    if (e.data) {
      let projectId = e.data._origin.projectId;
      this.getProjectTenderAgreementList(projectId);
      this.state.thisYearProject.map((item, index) => {
        if (item.projectId == projectId) {
          this.setState({ hoverId: index });
        }
      });
    }
  }
  // 饼图hover块
  changeId(e) {
    let _this = this;
    let changeId =
      e.items[0] && e.items[0].point && e.items[0].point._origin
        ? e.items[0].point._origin.projectId
        : '';
    this.state.thisYearProject.map(item => {
      if (item.projectId == changeId) {
        // console.log(_this);
        // console.log(item);
        // _this.setState({changeData: item})
        return;
      }
    });
  }
  save(code, type) {
    let oldParams = Object.assign({}, this.state.saveCode, { [code]: type });
    this.setState({ saveCode: oldParams });
  }
  delete(code) {
    let oldParams = Object.assign({}, this.state.panelCode, { [code]: 0 });
    this.saveHomePanel(oldParams);
  }
  okModalVisible(modalVisible) {
    this.saveHomePanel(this.state.saveCode);
    this.setState({ modalVisible });
  }

  goApproval(item, content) {
    let bizCode;
    let goUrl = '';
    let bidurl =
      (item.bizObjCode == 'material' ? (bizCode = 1) : (bizCode = 2)) +
      '&saveType=1' +
      '&orderId=' +
      item.processInstId +
      '&taskId=' +
      item.currentTaskId +
      '&projectId=' +
      item.projectId +
      '&processCode=' +
      item.processCode +
      '&calibrationId=' +
      item.bizObjId;
    let payUrl =
      item.bizObjId +
      '&orderId=' +
      item.processInstId +
      '&taskId=' +
      item.currentTaskId +
      '&projectId=' +
      item.projectId +
      '&processCode=' +
      item.processCode;
    if (item.isTurnDown == 1 && item.processName == '定标审批') {
      if (item.firstTask == true) {
        goUrl = '#/performance/bidApproval?tenderType=' + bidurl;
      } else {
        goUrl = '#/performance/bidApprovalView?tenderType=' + bidurl;
      }
    } else if (item.isTurnDown != 1 && item.processName == '定标审批') {
      goUrl = '#/performance/bidApprovalView?tenderType=' + bidurl;
    } else if (item.isTurnDown == 1 && item.processName == '支付审批') {
      if (item.firstTask == true) {
        goUrl = '#/processCenter/payWorkflow?aprvId=' + payUrl;
      } else {
        goUrl = '#/processCenter/processApproval?aprvId=' + payUrl;
      }
    } else if (item.isTurnDown != 1 && item.processName == '支付审批') {
      goUrl = '#/processCenter/processApproval?aprvId=' + payUrl;
    } else {
      // 自定义审批
      if (item.projectId == -1) {
        if (item.isTurnDown == 1 && item.firstTask == true) {
          goUrl =
            '#/processCenter/designFormWrite?bizCode=' +
            item.bizObjCode +
            '&bizName=' +
            item.processName +
            '&bizObjId=' +
            item.bizObjId +
            '&taskId=' +
            item.currentTaskId +
            '&orderId=' +
            item.processInstId;
        } else {
          goUrl =
            '#/processCenter/designFormWrite?type=approval&bizCode=' +
            item.bizObjCode +
            '&taskId=' +
            item.currentTaskId +
            '&orderId=' +
            item.processInstId +
            '&processCode=' +
            item.processCode +
            '&projectId=' +
            item.projectId +
            '&bizObjId=' +
            item.bizObjId +
            '&bizName=' +
            item.title;
        }
      }
    }
    return (
      <a style={{ color: '#1890ff' }} href={goUrl}>
        {content}
      </a>
    );
  }
  // 获取当前时间距指定时间间隔时间
  getDate(time) {
    return (newDate.valueOf() - moment(time).valueOf()) / 1000 / 3600;
  }
  render() {
    let _this = this;
    const { waitProcessModel, loading } = this.props;
    let {
      quantityStatistics,
      todoTaskList,
      waitOpenTenderList,
      supplierBannerList,
      thisYearProjectStatistics,
      dynamicList,
    } = this.props.homepageModel;

    let { messageList } = this.props.informationCenterModel;
    let { thisYearProject, projectTenderAgreementList, hoverId } = this.state;

    let bizCode;

    return (
      <Spin spinning={false} className={styles.homepage}>
        <Card>
          <Row style={{ fontSize: 22, color: '#333757' }}>
            <Col span={12}>
              {moment().format('a')}
              好，
              {this.state.isAdmin == 1 ? this.state.purchaseCompanyName : this.state.username}
            </Col>

            <Col span={12} style={{ textAlign: 'right' }}>
              {/*深圳市*/}
            </Col>
          </Row>
          <Row style={{ fontSize: 16, color: '#666666' }}>
            <span>{this.state.currentTime}</span>
          </Row>
        </Card>

        <Row gutter={20}>
          <Col span={5} className={styles.topBox}>
            <div className={styles.topCard} style={{ borderTop: '5px solid #FFA131' }}>
              <Row
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Col span={12} style={{ textAlign: 'center' }}>
                  <div className={styles.itemTitle}>待审批</div>
                  <div>
                    <a
                      href={'#/processCenter/waitProcess'}
                      className={styles.itemBottomLine}
                      style={{ color: '#EE7356', fontSize: 22 }}
                    >
                      {quantityStatistics ? quantityStatistics.todoTaskCount : 0}
                    </a>
                    <span>个</span>
                  </div>
                </Col>
                <div className={styles.itemLine}>&nbsp;</div>
                <Col span={12} style={{ textAlign: 'center' }}>
                  <div className={styles.itemTitle}>待定标</div>
                  <div>
                    <a
                      href={'#/bid/materialList?radioValue=1'}
                      className={styles.itemBottomLine}
                      style={{ color: '#EE7356', fontSize: 22 }}
                    >
                      {quantityStatistics ? quantityStatistics.waitOpenTenderCount : 0}
                    </a>
                    <span>个</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
          <Col span={5} className={styles.topBox}>
            <div className={styles.topCard} style={{ borderTop: '5px solid #4A85F8' }}>
              <Row
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Col span={12} style={{ textAlign: 'center' }}>
                  <div className={styles.itemTitle}>招标</div>
                  <div>
                    <span>进行中 </span>
                    <a
                      href={'#/bid/materialList?radioValue=0'}
                      className={styles.itemBottomLine}
                      style={{ color: '#333757', fontSize: 20 }}
                    >
                      {quantityStatistics ? quantityStatistics.underWayTenderCount : 0}
                    </a>
                    <span>个</span>
                  </div>
                </Col>
                <div className={styles.itemLine}>&nbsp;</div>
                <Col span={12} style={{ textAlign: 'center' }}>
                  <div className={styles.itemTitle}>询价</div>
                  <div>
                    <span>进行中 </span>
                    <a
                      href={'#/bid/purchaseList'}
                      className={styles.itemBottomLine}
                      style={{ color: '#333757', fontSize: 20 }}
                    >
                      {quantityStatistics ? quantityStatistics.underWayInquiryCount : 0}
                    </a>
                    <span>个</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
          <Col span={5} className={styles.topBox}>
            <div className={styles.topCard} style={{ borderTop: '5px solid #57BFC0' }}>
              <Row
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Col span={12} style={{ textAlign: 'center' }}>
                  <div className={styles.itemTitle}>材料供应商</div>
                  <div>
                    <a
                      href={'#/supplierManagement/material'}
                      className={styles.itemBottomLine}
                      style={{ color: '#333757', fontSize: 22 }}
                    >
                      {quantityStatistics ? quantityStatistics.materialSupplierCount : 0}
                    </a>
                    <span>个</span>
                  </div>
                </Col>
                <div className={styles.itemLine}>&nbsp;</div>
                <Col span={12} style={{ textAlign: 'center' }}>
                  <div className={styles.itemTitle}>劳务供应商</div>
                  <div>
                    <a
                      href={'#/supplierManagement/labour'}
                      className={styles.itemBottomLine}
                      style={{ color: '#333757', fontSize: 22 }}
                    >
                      {quantityStatistics ? quantityStatistics.labourSupplierCount : 0}
                    </a>
                    <span>个</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
          <Col span={9} className={styles.topBox}>
            {/*<div className={styles.topCard}>*/}
            <Tabs
              size="small"
              className={styles.topCard}
              defaultActiveKey="1"
              style={{ background: '#fff' }}
            >
              {/* <TabPane tab="公告" key="1">
                <div>
                  {(messageList && messageList.records ? messageList.records.slice(0, 5) : []).map(
                    function(item, index) {
                      return (
                        <div key={index} className={styles.announcement} onClick={() => {}}>
                          <a
                            style={{ color: '#333' }}
                            href={
                              '#/InformationView?messageId=' +
                              item.messageId +
                              '&messageStatus=' +
                              item.messageStatus
                            }
                          >
                            【{item.title}】{item.content}
                          </a>
                        </div>
                      );
                    }
                  )}
                </div>
                {messageList && messageList.total > 5 ? (
                  <div style={{ textAlign: 'right' }}>
                    <a href={'#/informationCenter'}>&nbsp;更多>></a>
                  </div>
                ) : null}
              </TabPane>
              <TabPane tab="新闻头条" key="2">
                <div>
                  {dataSource.map(function(item, index) {
                    return (
                      <div key={index} className={styles.announcement}>
                        【{item.title}】{item.text}
                      </div>
                    );
                  })}
                </div>
                {dataSource.length > 3 ? <a>&nbsp;更多>></a> : null}
              </TabPane> */}
              <TabPane tab="会员权限" key="3">
                <div className={styles.memberRights} style={{ height: 160, overflowY: 'scroll' }}>
                  <Row>
                    <Col span={8} style={{ padding: 5 }}>
                      <div className={styles.theTitle}>企业账号</div>
                      <div className={styles.f_12}>企业子账号4个起</div>
                      <div className={styles.f_12}>赠送一个企业子账号</div>
                    </Col>
                    <Col span={8} style={{ padding: 5 }}>
                      <div className={styles.theTitle}>平台供应商</div>
                      <div className={styles.f_12}>无限制查看平台供应商信息</div>
                      <div className={styles.f_12}>申请采购助手实地考察供应商</div>
                    </Col>
                    <Col span={8} style={{ padding: 5 }}>
                      <div className={styles.theTitle}>私有供应商</div>
                      <div className={styles.f_12}>拥有私有供应商管理库</div>
                      <div className={styles.f_12}>发起私有供应商招标</div>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8} style={{ padding: 5 }}>
                      <div className={styles.theTitle}>招投标</div>
                      <div className={styles.f_12}>平台公开招标数量不受限制</div>
                      <div className={styles.f_12}>申请采购助手协助发布招标</div>
                    </Col>
                    <Col span={8} style={{ padding: 5 }}>
                      <div className={styles.theTitle}>询价</div>
                      <div className={styles.f_12}>免费发布50条询价</div>
                    </Col>
                    <Col span={8} style={{ padding: 5 }}>
                      <div className={styles.theTitle}>审批</div>
                      <div className={styles.f_12}>发起与管理企业审批</div>
                    </Col>
                  </Row>
                </div>
              </TabPane>
              <TabPane tab="动态中心" key="4">
                {/*<marquee behavior="scroll" scrollamount="3" direction="up" height="160">*/}
                <div style={{ padding: 5 }}>
                  {(dynamicList ? dynamicList.slice(0, 5) : []).map(function(item, index) {
                    return (
                      <div key={index} className={styles.announcement}>
                        <span dangerouslySetInnerHTML={{ __html: item.content }} />
                      </div>
                    );
                  })}
                </div>
                {/*</marquee>*/}
              </TabPane>
            </Tabs>
            {/*</div>*/}
          </Col>
        </Row>
        <Row gutter={20} type="flex" justify="space-between">
          <Col
            style={{ display: this.state.panelCode.panelAwaitApprove == 1 ? null : 'none' }}
            span={12}
            className={styles.topBox}
          >
            <Tabs
              defaultActiveKey="1"
              style={{ background: '#fff' }}
              tabBarExtraContent={
                <span
                  onClick={() => {
                    this.delete('panelAwaitApprove');
                  }}
                >
                  <Icon
                    style={{ fontSize: 20, marginRight: 10, color: '#EE7356' }}
                    type="minus-circle"
                    theme="outlined"
                  />
                </span>
              }
            >
              <TabPane tab="待审批" key="1">
                <List
                  style={{ borderBottom: '1px solid #e8e8e8' }}
                  itemLayout="horizontal"
                  dataSource={todoTaskList && todoTaskList.length > 0 ? todoTaskList : []}
                  renderItem={item => (
                    <List.Item
                      style={{ paddingLeft: 15, paddingRight: 5, cursor: 'default' }}
                      actions={[_this.goApproval(item, '开始审批')]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div>
                            {item.processName == '支付审批' ? (
                              <Avatar
                                size="large"
                                style={{
                                  color: '#FFF',
                                  backgroundColor: '#F29D39',
                                  fontSize: '16',
                                }}
                              >
                                支
                              </Avatar>
                            ) : (
                              ''
                            )}
                            {item.processName == '定标审批' ? (
                              <Avatar
                                size="large"
                                style={{
                                  color: '#FFF',
                                  backgroundColor: '#4B85F8',
                                  fontSize: '16',
                                }}
                              >
                                定
                              </Avatar>
                            ) : (
                              ''
                            )}
                            {item.projectId == -1 ? (
                              <Avatar
                                size="large"
                                style={{ color: '#FFF', backgroundColor: '#4B85F8', fontSize: 16 }}
                              >
                                {(item.processName ? item.processName : '').substring(0, 1)}
                              </Avatar>
                            ) : (
                              ''
                            )}
                          </div>
                        }
                        title={
                          item.projectId == -1
                            ? _this.goApproval(item, item.processName)
                            : _this.goApproval(item, item.projectName)
                        }
                        description={
                          <span
                            style={{
                              display: 'inline-block',
                              minwidth: '130px',
                              //overflow: 'hidden',
                              //textOverflow: 'ellipsis',
                              //whiteSpace: 'nowrap',
                            }}
                          >
                            {item.title}
                          </span>
                        }
                        style={{ flex: 2 }}
                      />

                      <List.Item.Meta
                        description={
                          <div style={{ textAlign: 'center' }}>
                            {item.isTurnDown == 1 ? (
                              <span style={{ color: '#ee7356' }}>被驳回</span>
                            ) : item.processState == 1 ? (
                              <span style={{ color: '#70c040' }}>审批中</span>
                            ) : item.processState == 2 ? (
                              <span style={{ color: '#4e86ff' }}>已完成</span>
                            ) : (
                              ''
                            )}
                          </div>
                        }
                      />
                      <List.Item.Meta
                        description={
                          <span>
                            {/*{item.arriveTime}*/}
                            {item.processName == '支付审批' || item.projectId == -1
                              ? item.arriveTime
                              : item.bizObjContent
                                ? moment(
                                    JSON.parse(item.bizObjContent).openDate || undefined
                                  ).format('YYYY-MM-DD HH:mm:ss')
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
                                      Math.floor(
                                        _this.getDate(JSON.parse(item.bizObjContent).openDate)
                                      )
                                    ) + '小时'}
                              </p>
                            ) : (
                              ''
                            )}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
                <div
                  style={{ width: '100%', textAlign: 'right', paddingBottom: 10, paddingRight: 10 }}
                >
                  {todoTaskList && todoTaskList.length > 4 ? (
                    <a href={'#/processCenter/waitProcess'}>更多>></a>
                  ) : null}
                </div>
              </TabPane>
            </Tabs>
          </Col>
          <Col
            style={{ display: this.state.panelCode.panelSupplierRecommend == 1 ? null : 'none' }}
            span={12}
            className={styles.topBox}
          >
            <Tabs
              defaultActiveKey="1"
              style={{ background: '#fff' }}
              tabBarExtraContent={
                <span
                  onClick={() => {
                    this.delete('panelSupplierRecommend');
                  }}
                >
                  <Icon
                    style={{ fontSize: 20, marginRight: 10, color: '#EE7356' }}
                    type="minus-circle"
                    theme="outlined"
                  />
                </span>
              }
            >
              <TabPane tab="优质供应商推荐" key="1">
                {/*<List
                  itemLayout="horizontal"
                  dataSource={
                    supplierBannerList && supplierBannerList.length > 0 ? supplierBannerList : []
                  }
                  renderItem={item => (
                    <List.Item style={{ borderBottom: '0px solid' }}>
                      <div style={{ width: '100%' }}>
                        <img style={{ width: '100%' }} src={item} />
                      </div>
                    </List.Item>
                  )}
                />*/}
                <List>
                  <List.Item style={{ borderBottom: '0px solid' }}>
                    <div style={{ width: '100%' }}>
                      <a href="https://www.gzy360.com/shop/material/product/4380" target="_blank">
                        <img
                          style={{ width: '100%' }}
                          src="https://gzy-mall.oss-cn-shenzhen.aliyuncs.com/formal/shopbanner/%E8%85%BE%E9%80%9A350.png"
                        />
                      </a>
                    </div>
                  </List.Item>
                  <List.Item style={{ borderBottom: '0px solid' }}>
                    <div style={{ width: '100%' }}>
                      <a href="https://www.gzy360.com/shop/material/product/18403" target="_blank">
                        <img
                          style={{ width: '100%' }}
                          src="https://gzy-mall.oss-cn-shenzhen.aliyuncs.com/formal/shopbanner/%E5%9C%A3%E5%A5%A5.jpg"
                        />
                      </a>
                    </div>
                  </List.Item>
                  <List.Item style={{ borderBottom: '0px solid' }}>
                    <div style={{ width: '100%' }}>
                      <a href="https://www.gzy360.com/shop/material/product/14786" target="_blank">
                        <img
                          style={{ width: '100%' }}
                          src="https://gzy-mall.oss-cn-shenzhen.aliyuncs.com/formal/shopbanner/%E7%8E%AF%E7%90%83%E7%9F%B3%E6%9D%90banner350.jpg"
                        />
                      </a>
                    </div>
                  </List.Item>
                </List>
                <div style={{ paddingBottom: 10 }} />
              </TabPane>
            </Tabs>
          </Col>

          <Col
            style={{ display: this.state.panelCode.panelAwaitConfirmWinner == 1 ? null : 'none' }}
            span={12}
            className={styles.topBox}
          >
            <Tabs
              defaultActiveKey="1"
              style={{ background: '#fff' }}
              tabBarExtraContent={
                <span
                  onClick={() => {
                    this.delete('panelAwaitConfirmWinner');
                  }}
                >
                  <Icon
                    style={{ fontSize: 20, marginRight: 10, color: '#EE7356' }}
                    type="minus-circle"
                    theme="outlined"
                  />
                </span>
              }
            >
              <TabPane tab="待定标" key="1" className={styles.waitBid}>
                <Table
                  columns={this.state.columns}
                  dataSource={waitOpenTenderList}
                  pagination={false}
                  rowKey={(record, i) => i}
                  showHeader={false}
                  // loading={loading}
                />
                <div style={{ width: '100%', textAlign: 'right', padding: 10 }}>
                  {waitOpenTenderList && waitOpenTenderList.length > 7 ? (
                    <a href={'#/bid/materialList?radioValue=1'}>更多>></a>
                  ) : null}
                </div>
              </TabPane>
            </Tabs>
          </Col>
          <Col
            style={{
              display: this.state.panelCode.panelTenderContractStatistics == 1 ? null : 'none',
            }}
            span={12}
            className={styles.topBox}
          >
            <Tabs
              defaultActiveKey="1"
              style={{ background: '#fff' }}
              tabBarExtraContent={
                <span
                  onClick={() => {
                    this.delete('panelTenderContractStatistics');
                  }}
                >
                  <Icon
                    style={{ fontSize: 20, marginRight: 10, color: '#EE7356' }}
                    type="minus-circle"
                    theme="outlined"
                  />
                </span>
              }
            >
              <TabPane tab="当年项目数据统计" key="1">
                <Pie
                  hasLegend
                  subTitle="合同金额总计"
                  total={() => (
                    <Yuan>{this.state.thisYearProject.reduce((pre, now) => now.y + pre, 0)}</Yuan>
                  )}
                  data={this.state.thisYearProject}
                  valueFormat={value => <Yuan>{value}</Yuan>}
                  height={248}
                  lineWidth={0}
                  clickId={this.clickId.bind(this)}
                  changeId={this.changeId.bind(this)}
                  projectName={
                    thisYearProject && thisYearProject.length > 0
                      ? thisYearProject[hoverId].projectName
                      : ''
                  }
                  rightTitle={
                    <div>
                      <div style={{ color: '#333757' }}>
                        {thisYearProject && thisYearProject.length > 0
                          ? thisYearProject[hoverId].projectName
                          : ''}
                      </div>
                      <div>
                        共计发标数
                        <span
                          style={{
                            color: '#333757',
                            paddingLeft: 10,
                            fontSize: 16,
                            fontWeight: 900,
                          }}
                        >
                          {thisYearProject && thisYearProject.length > 0
                            ? thisYearProject[hoverId].tenderCount
                            : 0}
                          个
                        </span>
                      </div>
                      <div>
                        签订合同数
                        <span
                          style={{
                            color: '#333757',
                            paddingLeft: 10,
                            fontSize: 16,
                            fontWeight: 900,
                          }}
                        >
                          {thisYearProject && thisYearProject.length > 0
                            ? thisYearProject[hoverId].agreementCount
                            : 0}
                          个
                        </span>
                      </div>
                      <div>
                        合同总额
                        <span
                          style={{
                            color: '#333757',
                            paddingLeft: 10,
                            fontSize: 16,
                            fontWeight: 900,
                          }}
                        >
                          {thisYearProject && thisYearProject.length > 0
                            ? Number(thisYearProject[hoverId].sumMoney).toFixed(2)
                            : 0}
                          元
                        </span>
                      </div>
                    </div>
                  }
                />
                {/*<div style={{ fontSize: 16, color: '#333757', padding: 10 }}>
                  本年合同额排名前十项目
                </div>*/}
                <Table
                  dataSource={projectTenderAgreementList}
                  columns={this.state.projectColumns}
                  pagination={false}
                  rowKey={(record, i) => i}
                  scroll={{ y: projectTenderAgreementList.length > 5 ? 400 : null }}
                />
              </TabPane>
            </Tabs>
          </Col>
        </Row>

        <div
          style={{
            textAlign: 'center',
            background: '#fff',
            padding: 10,
            marginTop: 30,
            color: '#4B85F8',
            fontSize: 16,
          }}
          onClick={() => {
            this.setState({ modalVisible: true, saveCode: this.state.panelCode });
          }}
        >
          <Icon style={{ marginRight: 10 }} type="plus-circle" theme="twoTone" />
          添加
        </div>
        <Modal
          title="自定义首页展示内容"
          centered
          destroyOnClose={true} //关闭时销毁 Modal 里的子元素
          visible={this.state.modalVisible}
          onOk={() => this.okModalVisible(false)}
          onCancel={() => this.closeModalVisible(false)}
          width={500}
        >
          <div>
            <Row style={{ paddingBottom: 20 }}>
              <Col span={12} style={{ color: '#323757' }}>
                待审批
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                {this.state.saveCode.panelAwaitApprove == 1 ? (
                  <a
                    onClick={() => {
                      this.save('panelAwaitApprove', 0);
                    }}
                  >
                    移除
                  </a>
                ) : (
                  <a
                    onClick={() => {
                      this.save('panelAwaitApprove', 1);
                    }}
                  >
                    添加
                  </a>
                )}
              </Col>
            </Row>
            <Row style={{ paddingBottom: 20 }}>
              <Col span={12} style={{ color: '#323757' }}>
                待开标
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                {this.state.saveCode.panelAwaitConfirmWinner == 1 ? (
                  <a
                    onClick={() => {
                      this.save('panelAwaitConfirmWinner', 0);
                    }}
                  >
                    移除
                  </a>
                ) : (
                  <a
                    onClick={() => {
                      this.save('panelAwaitConfirmWinner', 1);
                    }}
                  >
                    添加
                  </a>
                )}
              </Col>
            </Row>
            <Row style={{ paddingBottom: 20 }}>
              <Col span={12} style={{ color: '#323757' }}>
                优质供应商推荐
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                {this.state.saveCode.panelSupplierRecommend == 1 ? (
                  <a
                    onClick={() => {
                      this.save('panelSupplierRecommend', 0);
                    }}
                  >
                    移除
                  </a>
                ) : (
                  <a
                    onClick={() => {
                      this.save('panelSupplierRecommend', 1);
                    }}
                  >
                    添加
                  </a>
                )}
              </Col>
            </Row>
            <Row style={{ paddingBottom: 20 }}>
              <Col span={12} style={{ color: '#323757' }}>
                当年项目数据统计
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                {this.state.saveCode.panelTenderContractStatistics == 1 ? (
                  <a
                    onClick={() => {
                      this.save('panelTenderContractStatistics', 0);
                    }}
                  >
                    移除
                  </a>
                ) : (
                  <a
                    onClick={() => {
                      this.save('panelTenderContractStatistics', 1);
                    }}
                  >
                    添加
                  </a>
                )}
              </Col>
            </Row>
          </div>
        </Modal>
      </Spin>
    );
  }
}
