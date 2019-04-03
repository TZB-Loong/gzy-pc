/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Card,
  Pagination,
  Icon,
  List,
  Button,
  Modal,
  Spin,
  Col,
  Table,
  Row,
  Breadcrumb,
  Radio,
  message,
} from 'antd';
import styles from './style.less';
import { url2params, isfalse } from '../../Tools/util_tools';
import FileView from '../Common/FileView';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getCookie, getPurchased } from '../../utils/utils';
import { pathPurchase, pathTender, pathRequest, returnUrlBoot } from '../../../configPath';
import ModifyLog from './ModifyLog'; // 变更记录
import QuestionRecords from './QuestionRecords'; // 答疑
import TenderList from './TenderList'; // 招标清单
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const ListItem = List.Item;

@connect(({ material, loading, common }) => ({
  material,
  loading: loading.effects['material/getMaterialTender'],
  common,
}))
export default class MaterialView extends Component {
  state = {
    isLogin: !isfalse(getCookie()), // 是否登录
    goodsAddress: true, // 发货地显示隐藏
    bidList: false, // 招标清单显示隐藏
    isrReqCompleted: true,
    getTender: {}, //详情数据
    bidListData: [], //投标单位列表数据
    params: {
      tenderId: url2params(window.location.href).tenderId
        ? url2params(window.location.href).tenderId
        : null,
    },
    bidParams: {},
    columnsBid: [
      {
        title: '投标单位',
        key: 'materialBidId',
        width: 250,
        fixed: 'left',
        render: record => {
          return record.bidAuthbusinessId == -1 ? (
            <Row>
              <Col span={6} style={{ paddingRight: 5 }}>
                <span className={styles.zhongbiao}>中标</span>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: '#e3e3e3',
                    textAlign: 'center',
                    lineHeight: '50px',
                    borderRadius: 5,
                  }}
                >
                  线下
                </div>
              </Col>
              <Col span={18}>
                <div style={{ width: 150 }} className={styles.text_d}>
                  <a>{record.companyName}</a>
                </div>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col span={6} style={{ paddingRight: 5 }}>
                {record.isBid == 1 ? <span className={styles.zhongbiao}>中标</span> : null}
                <img src={record.logo} style={{ width: 50, height: 50 }} />
              </Col>
              <Col span={18}>
                <div style={{ width: 150 }} className={styles.text_d}>
                  <a>{record.companyName}</a>
                </div>
                <div style={{ width: 150 }} className={styles.text_d}>
                  主营类别：
                  {record.typeSellText}
                </div>
                <div style={{ width: 150 }} className={styles.text_d}>
                  地址：
                  {record.provinceText}
                  {record.cityText}
                  {record.districtText}
                  {record.address}
                </div>
              </Col>
            </Row>
          );
        },
      },
      {
        title: '供货周期',
        dataIndex: '',
        key: '',
        render: record => {
          return record.bidAuthbusinessId == -1 ? '--' : <span>{record.cyle}天</span>;
        },
      },
      {
        title: '质量',
        dataIndex: '',
        key: '',
        render: record => {
          return record.bidAuthbusinessId == -1 ? (
            '--'
          ) : (
            <span>{record.isAgree == 1 ? '响应' : ''}</span>
          );
        },
      },
      {
        title: '投标金额(元)',
        dataIndex: 'price',
        key: 'price',
        render: txt => {
          return <span>{txt}元</span>;
        },
      },
      {
        title: '价格排名',
        dataIndex: '',
        key: '',
        render: record => {
          return record.bidAuthbusinessId == -1 ? (
            '--'
          ) : this.state.getTender.qulifiedViewEvalScore ? (
            <span>
              第<span style={{ color: '#4B85F8' }}>{record.ranking}</span>名
            </span>
          ) : (
            '--'
          );
        },
      },
      {
        title: '综合得分',
        dataIndex: '',
        key: '',
        render: record => {
          return record.bidAuthbusinessId == -1 ? (
            '--'
          ) : this.state.getTender.qulifiedViewEvalScore ? (
            <span>{record.totalScore}</span>
          ) : (
            '--'
          );
        },
      },
      {
        title: '综合排名',
        dataIndex: '',
        key: '',
        render: record => {
          return record.bidAuthbusinessId == -1 ? (
            '--'
          ) : this.state.getTender.qulifiedViewEvalScore ? (
            <span>第{record.totalRanking}名</span>
          ) : (
            '--'
          );
        },
      },
      {
        title: '竞争性付款条款',
        dataIndex: '',
        key: '',
        render: record => {
          return record.bidAuthbusinessId == -1 ? (
            '--'
          ) : (
            <div>
              <div>
                预付款支付合同金额的
                {record.advance}%
              </div>
              <div>
                进度款付至到货总价的
                {record.progress}%
              </div>
            </div>
          );
        },
      },
      {
        title: '操作',
        key: '',
        width: 120,
        fixed: 'right',
        render: record => {
          return record.bidAuthbusinessId == -1 ? (
            '--'
          ) : (
            <div>
              {/*{this.state.getTender.qulifiedOpenTender ? (
                <Button className={styles.btn_b} type="primary">
                  确认中标
                </Button>
              ) : null}*/}
              <div style={{ marginLeft: 10 }}>
                <a
                  href={pathTender + '/user/materialbid/details/' + record.materialBidId}
                  target="_blank"
                >
                  投标详情
                </a>
              </div>
              <div>
                {/*<a href={record.detailList}>下载招标清单</a>*/}
                <a href={record.detailList}>下载投标清单</a>
              </div>
            </div>
          );
        },
      },
    ],
    attachmentVOList: [],
    eventStatus: true,
  };

  // 招标详情查询
  materialTender() {
    const { dispatch } = this.props,
      that = this;
    dispatch({
      type: 'material/getMaterialTender',
      payload: this.state.params,
    }).then(() => {
      let { materialTender } = this.props.material;
      this.setState({
        getTender: materialTender ? materialTender : {},
        bidListData: materialTender && materialTender.bidList ? materialTender.bidList : [],
        tenderReqCompleted: true,
      });
    });
  }

  componentDidMount() {
    // document.domain='gzy360.com';
    // console.log(window.name)
    let that = this,
      oldId = this.state.params;
    that.materialTender();
    that.queryAttachList();
    /*
    if (isfalse(this.state.params.tenderId)) {
      // window.location.reload();
      window.addEventListener(
        'message',
        function(e) {
          oldId.tenderId = e.data;
          that.setState(
            {
              params: oldId,
            },() => that.materialTender(),
            that.queryAttachList()
          );
        },
        false
      );
    } else {
      if (that.state.eventStatus) {
        that.setState({ eventStatus: false });
        that.materialTender();
        that.queryAttachList();
      }
    }*/
  }
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'material/clear',
    });
  }
  // 请求附件
  queryAttachList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/queryAttachList',
      payload: { bizCode: 'MATERIAL_TENDER', bizId: this.state.params.tenderId },
    }).then(() => {
      let { filesPath } = this.props.common;
      if (filesPath) {
        let data = filesPath.data;
        this.setState({
          attachmentVOList: data && data.attachmentVOList ? filesPath.data.attachmentVOList : [],
          attachReqCompleted: true,
        });
      }
    });
  }
  // 投标单位筛选,发货地
  onChangeAddress(e) {
    let bidParams = Object.assign({}, this.state.params, { area: e.target.value });
    this.setState({ params: bidParams }, () => {
      this.materialTender();
    });
  }
  // 投标单位筛选,注册资本
  onSelectChange(e) {
    let bidParams = Object.assign({}, this.state.params, { registCapital: e.target.value });
    this.setState({ params: bidParams }, () => {
      this.materialTender();
    });
  }
  tenderListSrc() {
    return this.state.attachmentVOList.map((item, i) => {
      if (item.ctrlName == 'MATERIAL_TENDER_LIST_FILE') {
        return (
          <a style={{ fontSize: 14, marginLeft: 20 }} key={i} href={item.fullFilename}>
            招标清单.xlsx（点击下载）
          </a>
        );
      }
    });
  }

  stateText(state, stateText) {
    return (
      <span style={{ fontSize: 14, marginRight: 80 }}>
        <span style={{ color: '#333757' }}>招标状态：</span>
        <span style={{ color: '#3685FC' }}>{stateText}</span>
      </span>
    );
  }
  // 锚点
  scrollToAnchor = anchorName => {
    if (anchorName) {
      let anchorElement = document.getElementById(anchorName);
      if (anchorElement) {
        anchorElement.scrollIntoView();
      }
    }
  };
  //立即投标
  tender(getTender) {
    let authCompanyType = getCookie('authCompanyType');
    //能否投标
    if (getTender.qualifiedBid) {
      window.open(pathTender + '/material/tobid/' + getTender.materialTenderId);
      return;
    }
    // 2.1 未登录，提示“请先登录”；
    if (isfalse(this.state.isLogin)) {
      message.warning('请先登录');
      return;
    }
    // 2.2 登录,没有auth, 提示 "认证的材料商才能投标" [去认证].
    if (isfalse(authCompanyType)) {
      Modal.confirm({
        title: '认证的材料商才能投标',
        content: '',
        cancelText: '取消',
        okText: '确定',
        iconType: 'exclamation-circle',
        onOk() {
          window.open(pathTender + '/user/authbusiness/index');
        },
        onCancel() {
          // console.log('Cancel');
        },
      });
      return;
    }
    // 2.3 标的状态,如果已经截止则提示"当前标的已经截止,不能再进行投标".
    if (!getTender.tenderProgressing) {
      message.warning('当前标的已经截止,不能再进行投标');
      return;
    }
    // 2.4 登录的，看是authType是否正确，提示“您是施工单位（劳务商），只有材料商才能参与材料投标。”
    if (authCompanyType != 1) {
      let name =
        authCompanyType == 2
          ? '您是施工单位，'
          : authCompanyType == 3 || authCompanyType == 4
            ? '您是劳务商，'
            : '';
      message.warning(name + '只有材料商才能参与材料投标。');
      return;
    }
    //2.5 自己是否投过标了,投过则提示"您已经投过此标的"
    if (getTender.bidOwner) {
      message.warning('您已经投过此标的');
      return;
    }

    // 2.6.1 平台全公开,用户登录但未认证的，提示"只有认证的材料商才能参与投标" [去认证].
    if (
      getTender.isInvitationBid == 1 &&
      getTender.isInvitationPrivateBid != 1 &&
      getCookie('authAuditStatus') != 2
    ) {
      Modal.confirm({
        title: '只有认证的材料商才能参与投标',
        content: '',
        cancelText: '取消',
        okText: '确定',
        iconType: 'exclamation-circle',
        onOk() {
          window.open(pathTender + '/user/authbusiness/index');
        },
        onCancel() {
          // console.log('Cancel');
        },
      });
      return;
    }
    //isOwe  true  欠费   false 不欠费
    if (getTender.isOwe) {
      Modal.confirm({
        title: '你有未支付的佣金,点击确定前往查看',
        content: '',
        cancelText: '取消',
        okText: '确定',
        iconType: 'exclamation-circle',
        onOk() {
          window.open(pathTender + '/payment/tender/list');
        },
        onCancel() {
          // console.log('Cancel');
        },
      });
      return;
    }

    //能否投标
    if (!getTender.qualifiedBid) {
      message.warning('本标的是定向邀请招标，您不在邀请名单');
      return;
    }
  }
  render() {
    let _this = this;
    let { getTender, isLogin, bidListData } = this.state;
    const { loading } = this.props;
    return (
      <Spin spinning={loading}>
        <PageHeaderLayout contentTitle={'招标详情'}>
          <div className={styles.MaterialView}>
            {/*<Card className={styles.mb_30}>
              <span style={{ fontSize: 16, fontWeight: 'bold' }}>招标详情</span>
              <span style={{ color: '#EE7356', fontSize: 14 }}>
                <Icon style={{ color: 'orange', margin: 10 }} type="exclamation-circle" />
                注意:如本页面内容与招标方提供的招标文件内容有冲突，请以招标文为准
              </span>
            </Card>*/}
            <Card
              id="setHeight"
              className={styles.mb_15}
              title={
                <span>
                  <span style={{ color: '#333757', fontWeight: 'bold' }}>
                    {getTender.projectName}
                  </span>
                  <span>({getTender.isInvitationBid == 1 ? '公开招标' : '定向招标'})</span>
                </span>
              }
              extra={
                <span style={{}}>
                  {this.stateText(getTender.state, getTender.stateText)}
                  <span>投标数量：</span>
                  <span style={{ color: '#3C63C5' }}>
                    {getTender.bidCount ? getTender.bidCount : '0'}
                  </span>
                </span>
              }
            >
              <div>
                <Col span={20}>
                  <Row className={styles.pb_10}>
                    <Col span={8} style={{ paddingRight: 5, display: 'flex' }}>
                      <span style={{ whiteSpace: 'nowrap' }} className={styles.lable_z}>
                        招标单位：
                      </span>
                      <span style={{ wordBreak: 'break-all' }}>{getTender.tenderCompanyName}</span>
                    </Col>
                    <Col span={8} style={{ paddingRight: 5, display: 'flex' }}>
                      <span style={{ whiteSpace: 'nowrap' }} className={styles.lable_z}>
                        联系人：
                      </span>
                      {isLogin ? (
                        <span style={{ wordBreak: 'break-all' }}>
                          <span style={{ marginRight: 10 }}>{getTender.contact}</span>
                          {getTender.isPublic == 1 ? <span>{getTender.phone}</span> : null}
                        </span>
                      ) : (
                        <a href={returnUrlBoot}>
                          <Icon style={{ fontSize: 16, marginRight: 5 }} type="lock" />
                          登录可查看更多
                        </a>
                      )}
                    </Col>
                    <Col span={8} style={{ display: 'flex' }}>
                      <span style={{ whiteSpace: 'nowrap' }} className={styles.lable_z}>
                        项目地址：
                      </span>
                      {isLogin ? (
                        <span style={{ wordBreak: 'break-all' }}>
                          {getTender.provinceText}
                          {getTender.cityText}
                        </span>
                      ) : (
                        <a href={returnUrlBoot}>
                          <Icon style={{ fontSize: 16, marginRight: 5 }} type="lock" />
                          登录可查看更多
                        </a>
                      )}
                    </Col>
                  </Row>
                  <Row className={styles.pb_10}>
                    <Col style={{ paddingRight: 5, display: 'flex' }} span={8}>
                      <span style={{ whiteSpace: 'nowrap' }} className={styles.lable_z}>
                        投标截止日期：
                      </span>
                      {getTender.endDate ? (
                        <span>
                          {moment(getTender.endDate).format('YYYY-MM-DD')} {getTender.endHour}
                          :00
                        </span>
                      ) : null}
                    </Col>
                    <Col style={{ display: 'flex' }} span={8}>
                      <span style={{ whiteSpace: 'nowrap' }} className={styles.lable_z}>
                        开标日期：
                      </span>
                      {getTender.openDate ? (
                        <span>{moment(getTender.openDate).format('YYYY-MM-DD')}</span>
                      ) : null}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <span className={styles.lable_z}>发布时间：</span>
                      {getTender.releaseTime ? (
                        <span>{moment(getTender.releaseTime).format('YYYY-MM-DD HH:mm')}</span>
                      ) : null}
                    </Col>
                  </Row>
                </Col>
                {/*{getTender.qulifiedOpenTender ? (
                  <Col span={4}>
                    {getTender.isCalibration == 0 ? (
                      <Button
                        href={
                          '#/performance/bidApproval?tenderType=1&saveType=1&tenderId=' +
                          getTender.materialTenderId +
                          '&projectId=' +
                          getTender.projectId
                        }
                        className={styles.btn_b}
                        type="primary"
                      >
                        定标
                      </Button>
                    ) : null}
                    {getTender.isCalibration == 1 ? (
                      <Button
                        className={styles.btn_b}
                        type="primary"
                        href={
                          '#/performance/bidApprovalView?tenderType=1&tenderId=' +
                          getTender.materialTenderId +
                          '&type=view' +
                          '&projectId=' +
                          getTender.projectId
                        }
                      >
                        查看定标审批
                      </Button>
                    ) : null}
                  </Col>
                ) : (*/}
                <Col span={4}>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.tender(getTender);
                    }}
                  >
                    立即投标
                  </Button>
                  {/*是否显示查看变更*/}
                  {getTender.hadChangeNum > 0 ? (
                    <div style={{ paddingLeft: 15, marginTop: 5 }}>
                      <a onClick={() => this.scrollToAnchor('hadChange')}>查看变更</a>
                    </div>
                  ) : null}
                </Col>
                {/*)}*/}
              </div>
            </Card>
            <Card className={styles.mb_15} title="招标要求">
              <List style={{ width: '100%' }}>
                <ListItem>
                  <span className={styles.lable_z}>招标类型：</span>
                  <span>{getTender.tenderTypeText}</span>
                </ListItem>
                <ListItem>
                  <span className={styles.lable_z}>招标材料：</span>
                  <span>{getTender.categoryText}</span>
                </ListItem>
                <ListItem>
                  <span className={styles.lable_z}>招标规模：</span>
                  <span className={styles.weightText}>{getTender.scaleText}</span>
                </ListItem>
                <ListItem>
                  <span style={{ minWidth: 70 }} className={styles.lable_z}>
                    付款条款：
                  </span>
                  <div>
                    <span>
                      预付款支付合同金额的
                      <span className={styles.weightText}>{getTender.prePaymentRatio}%</span>
                    </span>
                    <span style={{ marginLeft: 30 }}>
                      进度款支付已到货金额的
                      <span className={styles.weightText}>{getTender.progressPaymentRatio}%</span>
                      ，同时扣除预付款
                    </span>
                    <span style={{ marginLeft: 30 }}>
                      分包竣工后支付至合同金额的
                      <span className={styles.weightText}>
                        {getTender.completePaymentRatio ? getTender.completePaymentRatio : 0}%
                      </span>
                    </span>
                    <span style={{ marginLeft: 30 }}>
                      结算款支付至结算金额的
                      <span className={styles.weightText}>{getTender.finalPaymentRatio}%</span>
                    </span>
                    <span style={{ marginLeft: 30 }}>
                      质保金为结算金额的
                      <span className={styles.weightText}>{getTender.quality}%</span>
                    </span>
                  </div>
                </ListItem>
                <ListItem>
                  <span className={styles.lable_z}>投标得分权重设置：</span>
                  <span>
                    价格权重
                    <span className={styles.weightText}>{getTender.scorePrice}%</span>
                  </span>
                  <span style={{ marginLeft: 30 }}>
                    供货周期权重
                    <span className={styles.weightText}>{getTender.scoreLeadTime}%</span>
                  </span>
                  <span style={{ marginLeft: 30 }}>
                    竞争性付款条款权重
                    <span className={styles.weightText}>{getTender.scoreCompeteClause}%</span>
                  </span>
                  <span style={{ marginLeft: 30 }}>
                    近三年5大工程业绩权重
                    <span className={styles.weightText}>{getTender.scoreAchievement}%</span>
                  </span>
                </ListItem>
                <ListItem>
                  <span className={styles.lable_z}>供货周期：</span>
                  <span>
                    自招标合同签订日期起
                    <span className={styles.weightText}>{getTender.supplyCycle}天</span>
                    供货完毕
                  </span>
                </ListItem>
                {getTender.allWork == 1 ? (
                  <div>
                    <ListItem>
                      <span className={styles.lable_z}>是否总价包干：</span>
                      <span>是</span>
                    </ListItem>
                    <p
                      style={{
                        color: '#ff4646',
                        fontStyle: 'normal',
                        marginBottom: '10px',
                        display: 'block',
                        width: '100%',
                        marginTop: '-10px',
                      }}
                    >
                      注意！本招标采取总价包干模式！投标方在交标前，必须仔细阅读和充分理解发标方的所有资料和需求，交标后不得以漏项为理由增加投标总价。
                    </p>
                  </div>
                ) : null}
                <ListItem>
                  <span className={styles.lable_z}>是否允许缺项报价：</span>
                  <span>{getTender.allowPartialBid == 1 ? '是' : '否'}</span>
                </ListItem>
                <ListItem>
                  <span className={styles.lable_z}>开票类型：</span>
                  <span>{getTender.ticketTypeText}</span>
                </ListItem>
                <ListItem>
                  <span className={styles.lable_z}>是否让投标方修改条款：</span>
                  <span>{getTender.isAllowBidUpdate == 1 ? '是' : '否'}</span>
                </ListItem>
                {/*tenderOwner 判断是否是自己的招标 true 为自己的 isInvitationBid 是否为定向招标 0是*/}
                {getTender.tenderOwner ? (
                  getTender.isInvitationBid == 0 || getTender.isInvitationPrivateBid == 0 ? (
                    <ListItem>
                      <span style={{ minWidth: 98 }} className={styles.lable_z}>
                        应邀投标单位：
                      </span>
                      {/*<BiddersModal />*/}
                      <div>
                        <div>
                          <div
                            style={{
                              display: getTender.isInvitationPrivateBid == null ? 'none' : null,
                            }}
                          >
                            {getTender.isInvitationPrivateBid == 0 &&
                            !getTender.privateAuthbusinessJson ? (
                              ''
                            ) : (
                              <div style={{ color: '#333757', marginBottom: 10 }}>个人供应商库</div>
                            )}
                            {getTender.isInvitationPrivateBid == 0 ? (
                              <div>
                                {(getTender.privateAuthbusinessJson
                                  ? JSON.parse(getTender.privateAuthbusinessJson)
                                  : []
                                ).map(function(item, index) {
                                  return (
                                    <span
                                      key={index}
                                      style={{
                                        display: 'inline-block',
                                        paddingRight: 20,
                                        paddingBottom: 5,
                                      }}
                                    >
                                      {item.name}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <div>面向所有个人供应商</div>
                            )}
                          </div>
                          <div
                            style={{ display: getTender.isInvitationBid == null ? 'none' : null }}
                          >
                            {getTender.isInvitationBid == 0 && !getTender.authbusinessJson ? (
                              ''
                            ) : (
                              <div style={{ color: '#333757', marginBottom: 10 }}>平台供应商库</div>
                            )}
                            {getTender.isInvitationBid == 0 ? (
                              <div>
                                {(getTender.authbusinessJson
                                  ? JSON.parse(getTender.authbusinessJson)
                                  : []
                                ).map(function(item, index) {
                                  return (
                                    <span
                                      key={index}
                                      style={{
                                        display: 'inline-block',
                                        paddingRight: 20,
                                        paddingBottom: 5,
                                      }}
                                    >
                                      {item.name}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <div>面向所有平台供应商</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </ListItem>
                  ) : null
                ) : null}
                <ListItem>
                  <span className={styles.lable_z}>材料样板图片：</span>
                  {isLogin ? (
                    <FileView
                      type={'MATERIAL_TENDER_SAMPLE'}
                      attachmentVOList={this.state.attachmentVOList}
                    />
                  ) : (
                    <a href={returnUrlBoot}>
                      <Icon style={{ fontSize: 16, marginRight: 5 }} type="lock" />
                      登录可查看更多
                    </a>
                  )}
                </ListItem>
              </List>
            </Card>
            {/*招标清单*/}
            <Card
              className={styles.mb_15}
              title={
                <div>
                  招标清单
                  {this.tenderListSrc()}
                </div>
              }
            >
              <TenderList type={'bidView'} tenderListJsonData={getTender.tenderListJsonData} />
            </Card>

            <Card className={styles.mb_15} title="招标附件">
              <List style={{ width: '100%' }}>
                <ListItem>
                  <span>招标文件：</span>
                  {isLogin ? (
                    <FileView
                      type={'MATERIAL_TENDER_FILE'}
                      attachmentVOList={this.state.attachmentVOList}
                    />
                  ) : (
                    <a href={returnUrlBoot}>
                      <Icon style={{ fontSize: 16, marginRight: 5 }} type="lock" />
                      登录后可见
                    </a>
                  )}
                </ListItem>
                <ListItem>
                  <span>其它附件：</span>
                  {isLogin ? (
                    <FileView
                      type={'MATERIAL_TENDER_OTHER_FILES'}
                      imgView={'view'}
                      attachmentVOList={this.state.attachmentVOList}
                    />
                  ) : (
                    <a href={returnUrlBoot}>
                      <Icon style={{ fontSize: 16, marginRight: 5 }} type="lock" />
                      登录后可见
                    </a>
                  )}
                </ListItem>
                <ListItem>
                  <span>施工图纸下载地址：</span>
                  {isLogin ? (
                    <a target="_blank" href={getTender.thirdPartyDownloadUrl}>
                      {getTender.thirdPartyDownloadUrl ? getTender.thirdPartyDownloadUrl : ''}
                    </a>
                  ) : (
                    <a href={returnUrlBoot}>
                      <Icon style={{ fontSize: 16, marginRight: 5 }} type="lock" />
                      登录后可见
                    </a>
                  )}
                </ListItem>
                <ListItem>
                  <span style={{ minWidth: 50 }}>备注：</span>
                  <span
                    style={{ wordBreak: 'break-all' }}
                    dangerouslySetInnerHTML={{ __html: getTender.remark }}
                  />
                </ListItem>
              </List>
              {/*{isLogin && getTender.qualifiedBid ? (
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <Button className={styles.btn_b} type="primary">
                    立即投标
                  </Button>
                </div>
              ) : null}*/}
            </Card>
            <Card
              style={{
                marginBottom: 15,
                display: isLogin
                  ? getTender.qulifiedOpenTender || getTender.qulifiedTenderAgain || bidListData
                    ? null
                    : 'none'
                  : 'none',
              }}
              title={
                <span>
                  <span style={{ color: '#333757' }}>投标单位</span>
                  {bidListData.length > 0 && getTender.tenderOwner ? (
                    <a
                      href={
                        pathPurchase +
                        '/materialtender/createfile?tenderId=' +
                        getTender.materialTenderId
                      }
                      style={{ fontSize: 14, marginLeft: 20 }}
                    >
                      材料报价清单汇总对比表.xlsx（点击下载）
                    </a>
                  ) : null}
                </span>
              }
            >
              {/*qulifiedOpenTender 是否可以进行定标操作*/}
              <div style={{ display: getTender.qulifiedOpenTender ? null : 'none' }}>
                <div style={{ backgroundColor: '#FFF3EB', color: '#FE4646', padding: 10 }}>
                  <div>
                    1、本投标排名仅根据投标方的总价、进度及质量、收款等资料进行排序，并不能对其提供真实的产品和服务的质量进行保证。
                  </div>
                  <div>
                    2、本投标的结果，仅供发标方进行参考，招标方可根据实际情况自行选择中标方。
                  </div>
                </div>
                {/*qulifiedTenderAgain 用户是否可以二次招标*/}
                <div
                  style={{
                    marginTop: 20,
                    display: getTender.qulifiedTenderAgain ? null : 'none',
                  }}
                >
                  <span>对招标结果不满意？</span>
                  <Button
                    style={{
                      backgroundColor: '#3685FC',
                      color: '#FFFFFF',
                      borderColor: '#3685FC',
                      marginLeft: 20,
                    }}
                    type="primary"
                  >
                    <a
                      href={
                        '#/bid/material?action=secondTender&tenderId=' + this.state.params.tenderId
                      }
                    >
                      二次招标
                    </a>
                  </Button>
                  <span style={{ marginLeft: 20 }}>
                    注：如需二次招标，请在招标时确定的开标日期当天
                    {getTender.openDate ? (
                      <span style={{ color: '#FE4646' }}>
                        {moment(getTender.openDate).format('YYYY-MM-DD ')}
                        23:59
                      </span>
                    ) : null}
                    前完成二次招标发布。
                  </span>
                </div>
                <List
                  style={{ marginTop: 20, marginBottom: 20 }}
                  bordered
                  className={styles.project}
                >
                  <ListItem style={{ backgroundColor: '#FAFAFA' }}>筛选投标信息</ListItem>
                  <ListItem>
                    <span style={{ minWidth: 100 }}>发货地</span>
                    <div className={this.state.goodsAddress ? styles.goodsAddress : ''}>
                      <RadioGroup defaultValue="">
                        <RadioButton value="" onClick={e => _this.onChangeAddress(e)}>
                          全国
                        </RadioButton>
                        {(getTender.deliverPlace ? getTender.deliverPlace : []).map(function(
                          item,
                          index
                        ) {
                          return (
                            <RadioButton
                              key={index}
                              value={item.areaId}
                              onClick={e => _this.onChangeAddress(e)}
                            >
                              {item.areaName}
                            </RadioButton>
                          );
                        })}
                      </RadioGroup>
                    </div>
                    <a
                      onClick={() => {
                        this.setState({ goodsAddress: !this.state.goodsAddress });
                      }}
                      style={{ minWidth: 50 }}
                    >
                      更多
                      {this.state.goodsAddress ? (
                        <Icon type="down" theme="outlined" />
                      ) : (
                        <Icon type="up" theme="outlined" />
                      )}
                    </a>
                  </ListItem>
                  <ListItem style={{ borderBottom: '0px solid #e8e8e8' }}>
                    <span style={{ minWidth: 100 }}>投标方注册资本</span>
                    <RadioGroup defaultValue="">
                      <RadioButton value="" onClick={e => _this.onSelectChange(e)}>
                        全部
                      </RadioButton>
                      {(getTender.registAssets ? getTender.registAssets : []).map(function(
                        item,
                        index
                      ) {
                        return (
                          <RadioButton
                            key={index}
                            value={item.dictionaryValue}
                            onClick={e => _this.onSelectChange(e)}
                          >
                            {item.dictionaryName}
                          </RadioButton>
                        );
                      })}
                    </RadioGroup>
                  </ListItem>
                </List>
              </div>
              {/*bidListViewAble 投标列表是否可见*/}
              {/*{getTender.bidListViewAble ? (*/}
              <Table
                dataSource={bidListData}
                columns={this.state.columnsBid}
                pagination={false}
                scroll={{ x: bidListData.length > 0 ? 1100 : null }}
              />
              {/*) : null}*/}
            </Card>
            <span id="hadChange"> </span>
            <ModifyLog tenderId={this.state.params.tenderId} type={'1'} />
            {!isfalse(this.state.params.tenderId) ? (
              <QuestionRecords
                tenderId={this.state.params.tenderId}
                tenderType={'1'}
                qualifiedBid={getTender.qualifiedBid}
              />
            ) : (
              <div />
            )}
          </div>
        </PageHeaderLayout>
      </Spin>
    );
  }
}
