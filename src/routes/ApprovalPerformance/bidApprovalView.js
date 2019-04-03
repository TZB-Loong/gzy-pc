/*eslint-disable*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Input, Button, Row, Col, Table, Upload } from 'antd';
import { beforeUpload } from '../../utils/upLoad';
import { pathPurchase, pathTender } from '../../../configPath';
import { isfalse, timestampToTime, dateDiff, currentTime } from '../../Tools/util_tools';
import { getCookie, getUrlParamBySearch } from '../../utils/utils';
import FlowRecordList from './flowRecordList';
import FlowStep from '../Common/flowStep';
import styles from './style.less';

let upLoadUrl = pathPurchase;
const { TextArea } = Input;
@connect(({ approvalExamine, loading, common }) => ({
  approvalExamine,
  loading: loading.effects['approvalExamine/queryBidList'],
  common,
}))
export default class bidApproval extends Component {
  state = {
    queryBidListParams: {
      calibrationId: '',
      tenderId: '',
      tenderType: '',
    },
    dataSource: [],
    tenderCategory: '',
    remark: '',
    parameters: {
      taskId: '', //流程ID
      content: '', //审批意见
      calibrationId: '', //定标表主键ID
      orderId: '',
    },
    content: '', //审批意见
    tenderType: '',
    tenderId: '',
    type: '',
    processCode: '',
    projectId: '',
    orderId: '',
    bidCount: 0,
    FlowStep: true,
    FlowRecordList: true,
    calibrationId:null
  };

  /**
   * 传入的参数
   * 1,calibrationId 2,taskId,3,processCode
   * 4,orderId,5projectId
   */

  componentDidMount() {
    this.setState(
      {
        queryBidListParams: Object.assign({}, this.state.queryBidListParams, {
          calibrationId: getUrlParamBySearch(this.props.location.search, 'calibrationId'),
          tenderId: getUrlParamBySearch(this.props.location.search, 'tenderId'),
          tenderType: getUrlParamBySearch(this.props.location.search, 'tenderType'),
        }),
        parameters: Object.assign({}, this.state.parameters, {
          taskId: getUrlParamBySearch(this.props.location.search, 'taskId'),
          calibrationId: getUrlParamBySearch(this.props.location.search, 'calibrationId'),
          orderId: getUrlParamBySearch(this.props.location.search, 'orderId'),
        }),
        type: getUrlParamBySearch(this.props.location.search, 'type'),
        processCode: getUrlParamBySearch(this.props.location.search, 'processCode'),
        projectId: getUrlParamBySearch(this.props.location.search, 'projectId'),
        orderId: getUrlParamBySearch(this.props.location.search, 'orderId'),
      },
      () => this.queryBidList()
    );
  }

  getColumns = () => {
    let _this = this;

    function initProps(record) {
      return {
        action: upLoadUrl + '/base/attach/upload',
        name: 'file',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'gzy-token': getCookie() },
        defaultFileList: record.enclosure,
      };
    }

    let columns = [
      {
        title: '投标单位(' + this.state.bidCount + ')',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 180,
        render: (text, record) => {
          return (
            <div
              style={{
                position: 'relative',
                width: 180,
              }}
            >
              <Col
                style={{
                  position: record.bidAuthbusinessId == -1 ? 'absolute' : null,
                  top: record.bidAuthbusinessId == -1 ? '-30px' : null,
                  backgroundColor: '#EE7356',
                  borderBottomRightRadius: '15px',
                  borderTopRightRadius: '15px',
                  color: '#fff',
                  padding: '2px 8px 2px 2px',
                  display: record.proposal == 0 ? 'none' : null,
                  width: '66px',
                }}
              >
                建议中标
              </Col>
              <Col className={styles.textFormat} style={{ marginTop: '10px' }}>
                <a>{record.companyName}</a>
              </Col>
              <Col
                className={styles.textFormat}
                style={{ display: record.bidAuthbusinessId == -1 ? 'none' : null }}
              >
                主营类别: {record.typeSellText}
              </Col>
              <Col
                className={styles.textFormat}
                style={{ display: record.bidAuthbusinessId == -1 ? 'none' : null }}
              >
                {record.address}
              </Col>
            </div>
          );
        },
      },
      {
        title: '供货周期',
        dataIndex: 'cyle',
        key: 'cyle',
        render: (text, record) => {
          return <span> {isfalse(text) ? null : text + '天'}</span>;
        },
      },
      {
        title: '投标金额(元)',
        dataIndex: 'price',
        key: 'price',
        render: (text, record) => {
          return <span>{text}</span>;
        },
      },
      {
        title: '价格排名',
        dataIndex: 'ranking',
        key: 'ranking',
        render: (text, record) => {
          return (
            <span>
              {isfalse(text) ? null : (
                <span>
                  第<span style={{ color: '#4B85F8', fontSize: '24px' }}>{text}</span>名
                </span>
              )}
            </span>
          );
        },
      },
      {
        title: '综合得分',
        dataIndex: 'totalScore',
        key: 'totalScore',
        render: (text, record) => {
          return <span>{isfalse(text) ? null : <span>{text}分</span>}</span>;
        },
      },
      {
        title: '综合排名',
        dataIndex: 'totalRanking',
        key: 'totalRanking',
        render: (text, record) => {
          return (
            <span>
              {isfalse(text) ? null : (
                <span>
                  第<span style={{ color: '#4B85F8', fontSize: '24px' }}>{text}</span>名
                </span>
              )}
            </span>
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => {
          if (record.bidAuthbusinessId == -1) {
            return null;
          } else {
            return (
              <span>
                <Col>
                  {' '}
                  {this.state.tenderType == 2 ? (
                    <a
                      href={pathTender + '/lbid/' + record.labourBidId + '/toultbview'}
                      target="_blank"
                    >
                      投标详情
                    </a>
                  ) : (
                    <a
                      href={pathTender + '/user/materialbid/details/' + record.materialBidId}
                      target="_blank"
                    >
                      投标详情
                    </a>
                  )}
                </Col>
                <Col>
                  {this.state.tenderType == 1 ? (
                    <a
                      href={pathPurchase + '/file/download/template?path=材料采购招标文件-模板.doc'}
                    >
                      下载招标清单
                    </a>
                  ) : (
                    <a href={pathPurchase + '/file/download/template?path=劳务招投标清单.xlsx'}>
                      下载招标清单
                    </a>
                  )}
                </Col>
              </span>
            );
          }
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 150,
        key: '',
        render: (text, record) => {
          return <TextArea rows={3} defaultValue={text} disabled />;
        },
      },
      {
        title: '附件',
        dataIndex: 'enclosure',
        key: 'enclosure',
        width: 100,
        render: (text, record) => {
          return (
            <Upload
              {...initProps(record)}
              multiple={false}
              beforeUpload={e => beforeUpload(e, ['all'], 5)}
            >
              {/* <a>
              上传附件
            </a> */}
            </Upload>
          );
        },
      },
    ];

    if (this.state.tenderType == 2) {
      columns.map((item, index) => {
        if (item.dataIndex == 'cyle') {
          columns.splice(index, 1);
        }
      });
    }
    return columns;
  };

  queryBidList = () => {
    //查询投标列表
    const { dispatch } = this.props;
    dispatch({
      type: 'approvalExamine/queryBidList',
      payload: this.state.queryBidListParams,
    }).then(() => {
      const { approvalExamine } = this.props;
      let source = [];
      if (!isfalse(approvalExamine)) {
        const { examineList } = approvalExamine;
        if (!isfalse(examineList)) {
          if (!isfalse(examineList.bidList)) {
            examineList.bidList.map((item, index) => {
              source.push({
                companyName: item.companyName,
                address: item.provinceText + item.cityText + item.districtText,
                typeSellText: item.typeSellText,
                cyle: item.cyle,
                price: item.price,
                ranking: item.ranking,
                totalScore: item.totalScore,
                totalRanking: item.totalRanking,
                labourBidId: item.labourBidId,
                materialBidId: item.materialBidId,
                key: index + 1,
                proposal: isfalse(item.bidApproval) ? 0 : item.bidApproval.proposal,
                remark: isfalse(item.bidApproval) ? null : item.bidApproval.remark,
                enclosure: isfalse(item.attachmentPojos)
                  ? []
                  : [
                      {
                        url: item.attachmentPojos[0].fullFilename,
                        uid: item.attachmentPojos[0].id,
                        name: item.attachmentPojos[0].originalFilename,
                        status: 'done',
                      },
                    ],
                bidAuthbusinessId: item.bidAuthbusinessId,
              });
            });
          }

          this.setState({
            // dataSource:source,
            remark: isfalse(examineList.calibration) ? null : examineList.calibration.remark,
            tenderType: isfalse(examineList.calibration)
              ? null
              : examineList.calibration.tenderType,
            tenderId: isfalse(examineList.calibration) ? null : examineList.calibration.tenderId,
            calibrationId: isfalse(examineList.calibration)
              ? null
              : examineList.calibration.calibrationId,
            bidCount: isfalse(examineList.bidCount) ? 0 : examineList.bidCount,
          });
        }
      }
      this.setState({
        dataSource: source,
      });
    });
  };

  sendCalibration = () => {
    //批准定标审批
    const { dispatch } = this.props;
    dispatch({
      type: 'approvalExamine/sendCalibration',
      payload: this.state.parameters,
    }).then(() => {
      const { approvalExamine } = this.props;
      if (approvalExamine.sendCalibrationSuccess) {
        window.location.href = '#/processCenter/waitProcess';
      }
    });
  };

  backCalibration = () => {
    //驳回定标审批
    const { dispatch } = this.props;
    dispatch({
      type: 'approvalExamine/backCalibration',
      payload: this.state.parameters,
    }).then(() => {
      const { approvalExamine } = this.props;
      if (approvalExamine.sendCalibrationSuccess) {
        this.props.history.replace('/processCenter/waitProcess');
      }
    });
  };

  calibrationChange = e => {
    //总的备注的内容修改
    this.setState({
      parameters: Object.assign({}, this.state.parameters, { content: e.target.value }),
    });
  };

  submission = type => {
    //提交审批
    if (type == 'Yes') {
      this.sendCalibration();
    } else {
      if (this.state.parameters.content) {
        this.backCalibration();
      } else {
        message.error('请填写审批意见');
        return;
      }
    }
  };
  downloadList = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'approvalExamine/createfile',
      payload: { tenderId: data },
    });
  };
  render() {
    const { dataSource, parameters } = this.state;
    const { loading, approvalExamine } = this.props;
    let examineList = [];
    if (!isfalse(approvalExamine.examineList)) {
      examineList = approvalExamine.examineList;
    }
    return (
      <Card title={'定标审批'} bordered={false} loading={loading}>
        <Row style={{ zIndex: '0' }}>
          <Col span={18}>
            <Row>
              <Col>
                审批发起人：
                <span>{examineList.nickName}</span>
              </Col>
              <Col>
                审批发起时间：
                {timestampToTime(examineList.createTime, 'HM')}
              </Col>
              <div style={{ width: '400px' }}>
                <Col className={styles.textFormat}>
                  定标对象：{' '}
                  <a>
                    {examineList.projectName} 招:{' '}
                    {this.state.tenderType == 1
                      ? examineList.materialCategoryNames
                      : examineList.labourWorkType}
                  </a>
                </Col>
              </div>

              <Col>截止时间： {timestampToTime(examineList.endDate, 'HM')}</Col>
              <Col>开标剩余时间： {examineList.leftTime} 天</Col>
            </Row>
            <Row>
              <Col style={{ marginTop: '20px', marginBottom: '20px' }}>
                <Table columns={this.getColumns()} dataSource={dataSource} pagination={false} />
              </Col>
              <Col>
                {this.state.tenderType == 2 ? null : (
                  <span>
                    {/*{console.log(this.state.parameters.tenderId)}*/}
                    <a>材料报价清单汇总对比表.xlsx</a>
                    <a
                      href={
                        pathPurchase + '/materialtender/createfile?tenderId=' + this.state.tenderId
                      }
                    >
                      <Button type="primary" style={{ marginLeft: '10px' }}>
                        点击下载
                      </Button>
                    </a>
                  </span>
                )}
              </Col>
              <Col style={{ margin: '20px 0px' }}>
                备注：
                {this.state.remark}
              </Col>
              <div style={{ display: this.state.type == 'view' ? 'none' : null }}>
                <Col>
                  <p>审批意见：</p>
                  <TextArea
                    rows={6}
                    placeholder="请填写备注内容"
                    value={this.state.parameters.content}
                    onChange={this.calibrationChange}
                  />
                </Col>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Col
                    style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around' }}
                    span={6}
                  >
                    <Button type="primary" onClick={this.submission.bind(this, 'Yes')}>
                      同意
                    </Button>
                    <Button type="primary" onClick={this.submission.bind(this, 'NO')}>
                      不同意
                    </Button>
                  </Col>
                </div>
              </div>
            </Row>
          </Col>

          {loading == false ? (
            <Col span={5} style={{ marginLeft: '60px' }}>
            {!isfalse( this.state.calibrationId)||!isfalse(parameters.calibrationId)? <FlowStep
                processCode={isfalse(this.state.processCode) ? 'approval' : this.state.processCode}
                orderId={this.state.orderId}
                projectId={this.state.projectId}
                bizObjId={parameters.calibrationId||this.state.calibrationId}
                bizObjCode={
                  this.state.queryBidListParams.tenderType == 1 ? 'material' : 'labour'
                }
                type={this.state.type}
              />:null}
            </Col>
          ) : null}

          {/*{loading == false ? (
            this.state.type == 'view' ? (
              <Col span={24}>
                <FlowRecordList
                  processCode={
                    isfalse(this.state.processCode) ? 'approval' : this.state.processCode
                  }
                  orderId={this.state.orderId}
                  projectId={this.state.projectId}
                  bizObjId={parameters.calibrationId}
                  bizObjectCode={
                    this.state.queryBidListParams.tenderType == 1 ? 'material' : 'labour'
                  }
                  title="定标审批"
                  type={this.state.type}
                />
              </Col>
            ) : null
          ) : null}*/}

          {this.state.orderId ? (
            <Col span={24}>
                {!isfalse( this.state.calibrationId)||!isfalse(parameters.calibrationId)?
                   <FlowRecordList
                   processCode={isfalse(this.state.processCode) ? 'approval' : this.state.processCode}
                   orderId={this.state.orderId}
                   projectId={this.state.projectId}
                   bizObjId={parameters.calibrationId||this.state.calibrationId}
                   bizObjCode={
                     this.state.queryBidListParams.tenderType == 1 ? 'material' : 'labour'
                   }
                   title="定标审批"
                   type={this.state.type}
                 />:null
              }
              {/* <FlowRecordList
                processCode={isfalse(this.state.processCode) ? 'approval' : this.state.processCode}
                orderId={this.state.orderId}
                projectId={this.state.projectId}
                bizObjId={parameters.calibrationId}
                bizObjectCode={
                  this.state.queryBidListParams.tenderType == 1 ? 'material' : 'labour'
                }
                title="定标审批"
                type={this.state.type}
              /> */}
            </Col>
          ) : null}
        </Row>
      </Card>
    );
  }
}
