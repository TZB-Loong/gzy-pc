import React, { Component } from 'react';
import {
  Card,
  Spin,
  Table,
  Row,
  Col,
  Input,
  Button,
  Radio,
  Pagination,
  Badge,
  message,
} from 'antd';
import { connect } from 'dva';
import FiterIcon from '../Common/FiterIcon'; //筛选组件
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { isfalse, timestampToTime } from '../../Tools/util_tools';
import styles from './style.less';
import ProgrammeModal from '../Common/programmeModal';
const Search = Input.Search;

@connect(({ labourList, loading, common }) => ({
  labourList,
  loading: loading.effects['labourList/getLabourTenderList'],
  common,
}))
export default class labourList extends Component {
  state = {
    radioValue: '',
    params: {
      current: 1,
      size: 10,
    },
    windowSize: 1780,
    dataSource: [],
    total: 0,
    dataCanhge: false,
    checkParams: {
      projectId: '', //项目ID
      processType: '', //流程类型(支付审批pyment,定标审批approval)
    },
  };

  componentDidMount() {
    this.getLabourTenderList(); //初始化获取数据
    this.screenChange();
    this.resize();
  }
  screenChange() {
    window.addEventListener('resize', this.resize);
  }
  resize = () => {
    this.setState({
      windowSize: window.outerWidth,
    });
  };
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  initiatorCheck = record => {
    //审批发起人检测
    const { dispatch } = this.props;
    dispatch({
      type: 'common/initiatorCheck',
      payload: this.state.checkParams,
    }).then(() => {
      const { common } = this.props;
      if (!isfalse(common.initiatorCheck)) {
        if (common.initiatorCheck.flag == 1) {
          window.location.href =
            '#/performance/bidApproval?tenderType=2&saveType=1&tenderId=' +
            record.labourTenderId +
            '&projectId=' +
            record.id;
        } else if (common.initiatorCheck.flag == 0) {
          message.warning('您没有该项目的审批发起权限');
        }
      }
    });
  };

  getLabourTenderList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'labourList/getLabourTenderList',
      payload: this.state.params,
    }).then(() => {
      const { labourList } = this.props;
      let source = [],
        total = 0;
      if (!isfalse(labourList.labourList)) {
        if (!isfalse(labourList.labourList.records)) {
          labourList.labourList.records.map((item, index) => {
            source.push({
              key: index + 1,
              id: item.projectId,
              labourTenderId: item.labourTenderId,
              name: '招:' + item.workTypeName,
              projectId: item.projectName,
              number: item.bidCount,
              state:
                item.state == 0 ? (
                  <Badge status="processing" text="进行中" />
                ) : item.state == 1 ? (
                  <Badge status="warning" text="待开标" />
                ) : item.state == 2 ? (
                  <Badge status="success" text="已定标" />
                ) : item.state == 3 ? (
                  <Badge status="error" text="流标" />
                ) : item.state == 4 ? (
                  <Badge status="default" text="待发布" />
                ) : item.state == 5 ? (
                  <Badge status="default" text="已二次招标" />
                ) : (
                  <Badge status="default" text="暂无" />
                ),
              releaseTime: timestampToTime(item.releaseTime, 'HM'),
              closingDate: timestampToTime(item.closingDate) + ' ' + item.closingHour + ':00',
              openingTime: timestampToTime(item.openDate),
              money: isfalse(item.openMoney) ? item.openMoney : Number(item.openMoney).toFixed(2),
              isShowQA: item.isShowQA,
              isShowTenderChange: item.isShowTenderChange,
              isShowSecondTender: item.isShowSecondTender,
              isShowUploadAgreement: item.isShowUploadAgreement,
              isShowOpenTender: item.isShowOpenTender,
              isShowOpenTenderAudit: item.isShowOpenTenderAudit,
              isShowOpenTenderView: item.isShowOpenTenderView,
              isShowAgreementView: item.isShowAgreementView,
              buttonState: item.state,
            });
          });
        }
        total = labourList.labourList.total;
      }
      this.setState({
        dataSource: source,
        total: total,
        dataCanhge: true,
      });
    });
  };

  getColumnsData = () => {
    return [
      {
        title: '招标信息',
        dataIndex: 'name',
        key: 'name',
        width: 250,
        render: (text, record) => (
          <div
            style={{
              width: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <a title={text} href={'#/bid/LabourView?tenderId=' + record.labourTenderId}>
              {text}
            </a>
          </div>
        ),
      },
      {
        title: '所属项目',
        dataIndex: 'projectId',
        key: 'projectId',
        width: 120,
        sorter: true,
        render: (text, record) => (
          <div
            style={{
              width: '120px',
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
        title: '投标数',
        dataIndex: 'number',
        key: 'number',
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
      },
      {
        title: '发布时间',
        dataIndex: 'releaseTime',
        sorter: true,
        key: 'releaseTime',
        filterIcon: filtered => (
          <FiterIcon
            screenOnClick={this.screenOnClick}
            titleData={{
              releaseBeginDate: 'releaseBeginDate',
              fieldType: '5',
              releaseEndDate: 'releaseEndDate',
            }}
            type="time"
          />
        ),
        filterDropdown: () => <div>{null}</div>,
        filterDropdownVisible: false,
      },
      {
        title: '截止时间',
        dataIndex: 'closingDate',
        sorter: true,
        key: 'closingDate',
        filterIcon: filtered => (
          <FiterIcon
            screenOnClick={this.screenOnClick}
            titleData={{
              closeBeginDate: 'closeBeginDate',
              fieldType: '5',
              closeEndDate: 'closeEndDate',
            }}
            type="time"
            filtered={filtered}
          />
        ),
        filterDropdown: () => <div>{null}</div>,
      },
      {
        title: '开标日期',
        dataIndex: 'openingTime',
        key: 'openingTime',
      },
      {
        title: '开标金额(元)',
        dataIndex: 'money',
        key: 'money',
      },
      {
        title: '操作',
        dataIndex: 'options',
        width: 220,
        key: 'options',
        render: (text, record) => {
          return (
            <span style={{ display: 'flex', justifyContent: 'space-around' }}>
              {record.buttonState == 2 ? (
                <ProgrammeModal title="中标方案" tenderId={record.labourTenderId} tenderType="2" />
              ) : null}
              {record.isShowOpenTenderView ? (
                <a
                  href={
                    '#/performance/bidApprovalView?tenderType=2&tenderId=' +
                    record.labourTenderId +
                    '&type=view' +
                    '&projectId=' +
                    record.id
                  }
                >
                  查看定标审批
                </a>
              ) : null}
              {record.isShowSecondTender ? (
                <a href={'#/bid/labour?action=secondTender&tenderId=' + record.labourTenderId}>
                  二次招标
                </a>
              ) : null}
              {record.isShowOpenTenderAudit ? (
                <a
                  onClick={() => {
                    this.setState(
                      {
                        checkParams: {
                          projectId: record.id,
                          processType: 'approval',
                        },
                      },
                      () => this.initiatorCheck(record)
                    );
                  }}
                >
                  发起定标审批
                </a>
              ) : null}
              {record.isShowUploadAgreement ? (
                <a
                  href={
                    '#/bid/UploadContract?tenderType=2&type=edit&tenderId=' + record.labourTenderId
                  }
                >
                  上传合同
                </a>
              ) : null}
              {record.isShowTenderChange ? (
                <a href={'#/bid/labour?action=change&tenderId=' + record.labourTenderId}>
                  招标变更
                </a>
              ) : null}
              {record.isShowQA ? (
                <a href={'#/bid/AnswerList?tenderType=1&tenderId=' + record.labourTenderId}>
                  查看答疑
                </a>
              ) : null}
              {record.isShowOpenTender ? (
                <a
                  href={
                    '#/performance/bidApproval?tenderType=2&saveType=2&tenderId=' +
                    record.labourTenderId +
                    '&projectId=' +
                    record.id
                  }
                >
                  定标
                </a>
              ) : null}
              {record.isShowAgreementView ? (
                <a
                  href={
                    '#/bid/UploadContract?tenderType=2&type=view&tenderId=' + record.labourTenderId
                  }
                >
                  查看合同
                </a>
              ) : null}
            </span>
          );
        },
      },
    ];
  };

  screenOnClick = params => {
    //自定义筛选
    let oldParams = this.state.params;
    let newParams = {};
    // console.log(params,'params')

    if (isfalse(oldParams.queryConditions)) {
      //当没有筛选过的时候(第一次进行筛选)
      newParams = Object.assign({}, this.state.params, {
        queryConditions: JSON.stringify(params),
      });
    } else {
      //第二次进行筛选
      let firstQueryConditions = JSON.parse(oldParams.queryConditions);
      params.map(param => {
        firstQueryConditions.map((item, index) => {
          if (item.fieldName == param.fieldName) {
            firstQueryConditions.splice(index, 1);
          }
        });
      });

      let newQueryConditions = firstQueryConditions.concat(params);
      newParams = Object.assign({}, this.state.params, {
        queryConditions: JSON.stringify(newQueryConditions),
      });
    }

    this.setState(
      {
        params: newParams,
      },
      () => this.getLabourTenderList()
    );
  };

  radioChange = e => {
    //单选的变化
    let value = e.target.value;
    let oldParams = this.state.params;
    let newParams = {};
    if (isfalse(oldParams.queryConditions)) {
      //当没有搜索过的时候(第一次进行搜索)
      newParams = Object.assign({}, this.state.params, {
        queryConditions: JSON.stringify([{ fieldName: 'state', fieldValue: value, fieldType: 5 }]),
      });
    } else {
      //第二次进行搜索
      let firstQueryConditions = JSON.parse(oldParams.queryConditions);
      firstQueryConditions.map((item, index) => {
        if (item.fieldName == 'state') {
          firstQueryConditions.splice(index, 1);
        }
      });
      firstQueryConditions.push({ fieldName: 'state', fieldValue: value, fieldType: 5 });
      newParams = Object.assign({}, this.state.params, {
        queryConditions: JSON.stringify(firstQueryConditions),
      });
    }
    this.setState(
      {
        radioValue: e.target.value,
        params: newParams,
      },
      () => this.getLabourTenderList()
    );
  };

  pageChange = (page, pageSize) => {
    //页码发生变化时
    let oldParams = this.state.params;
    this.setState(
      {
        params: Object.assign({}, oldParams, { current: page, size: pageSize }),
      },
      () => this.getLabourTenderList()
    );
  };

  inputSearch = value => {
    //搜索
    let oldParams = this.state.params;
    let newParams = {};
    if (isfalse(oldParams.queryConditions)) {
      //当没有搜索过的时候(第一次进行搜索)
      newParams = Object.assign({}, this.state.params, {
        queryConditions: JSON.stringify([
          { fieldName: 'keyword', fieldValue: value, fieldType: 5 },
        ]),
        current: 1,
      });
    } else {
      //第二次进行搜索
      let firstQueryConditions = JSON.parse(oldParams.queryConditions);
      firstQueryConditions.map((item, index) => {
        if (item.fieldName == 'keyword') {
          firstQueryConditions.splice(index, 1);
        }
      });
      firstQueryConditions.push({ fieldName: 'keyword', fieldValue: value, fieldType: 5 });
      newParams = Object.assign({}, this.state.params, {
        queryConditions: JSON.stringify(firstQueryConditions),
        current: 1,
      });
    }
    this.setState(
      {
        params: newParams,
      },
      () => this.getLabourTenderList()
    );
  };

  handleTableChange = (pagination, filters, sorter) => {
    //排序
    let oldParams;
    if (!isfalse(sorter)) {
      oldParams = {
        orderBy: sorter.column.key,
        orderType: sorter.order == 'ascend' ? 'ASC' : 'DESC',
      };
    }
    this.setState(
      {
        params: Object.assign({}, this.state.params, oldParams),
      },
      () => {
        this.getLabourTenderList();
      }
    );
  };
  onShowSizeChange = (current, size) => {
    //修改页码的函数
    this.setState(
      {
        params: Object.assign({}, this.state.params, { current, size }),
      },
      () => this.getLabourTenderList()
    );
  };

  render() {
    const { labourList, loading } = this.props;
    const { dataSource } = this.state;
    return (
      <PageHeaderLayout>
        <Spin spinning={false}>
          <Card title={labourList.titleData} loading={!this.state.dataCanhge}>
            <div>
              <Row>
                <Col span={12}>
                  <Button type="primary" href={'#/bid/labour?action=release'}>
                    发布劳务招标
                  </Button>
                </Col>
                <Col span={11} />
              </Row>
              <Row style={{ marginTop: '20px' }}>
                <Col span={12}>
                  <Radio.Group value={this.state.radioValue} onChange={this.radioChange.bind(this)}>
                    <Radio.Button value="">全部</Radio.Button>
                    <Radio.Button value="0">进行中</Radio.Button>
                    <Radio.Button value="1">待开标</Radio.Button>
                    <Radio.Button value="2">已定标</Radio.Button>
                    <Radio.Button value="3">流标</Radio.Button>
                  </Radio.Group>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Search
                    placeholder="请输入招标信息或者项目关键字"
                    enterButton="搜索"
                    style={{ width: '300px' }}
                    onSearch={value => this.inputSearch(value)}
                  />
                </Col>
              </Row>
              <Table
                bordered
                columns={this.getColumnsData()}
                dataSource={this.state.dataSource}
                style={{ marginTop: '20px' }}
                pagination={false}
                rowKey={record => record.key}
                onChange={this.handleTableChange}
                className={styles.resizeTable}
                loading={loading}
                scroll={{
                  x:
                    this.state.dataSource.length > 0
                      ? this.state.windowSize < 1770
                        ? 1500
                        : null
                      : null,
                }}
              />
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <Row>
                  <Pagination
                    defaultCurrent={1}
                    total={this.state.total}
                    onChange={(page, pageSize) => this.pageChange(page, pageSize)}
                    onShowSizeChange={(current, size) => this.onShowSizeChange(current, size)}
                    showQuickJumper
                    showSizeChanger
                    style={{ display: this.state.total == 0 ? 'none' : null }}
                  />
                </Row>
              </div>
            </div>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
