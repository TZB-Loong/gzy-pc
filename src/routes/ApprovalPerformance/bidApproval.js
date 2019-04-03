/*eslint-disable*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Input, Icon, Button, Row, Col, Table, Upload, InputNumber, message } from 'antd';
import { beforeUpload } from '../../utils/upLoad';
import SelectCalibration from '../Common/selectCalibration';
import { pathPurchase, pathTender } from '../../../configPath';
import { isfalse, timestampToTime } from '../../Tools/util_tools';
import { pointTwo } from '../../Tools/Verification';
import { getCookie, getUrlParamBySearch } from '../../utils/utils';
import FlowStep from '../Common/flowStep';
import styles from './style.less';
import SettingProcess from '../Common/settingProcess'; //流程设置
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
      //查询列表的参数集合
      tenderId: '',
      tenderType: '',
      calibrationId: '', //(走流程时需要这个)
    },
    parameters: {
      //提交的参数集合
      remark: '', //总的备注
      calibrationId: '', //定标Id
      tenderId: '', //招标id
      // projectId:'',//项目ID
      tenderType: '',
      saveType: '1',
      taskId: '',
      bidDatas: '',
    },
    endDate: '',
    leftTime: '',
    tenderCategory: '',
    projectName: '',
    projectId: '',
    visible: false,
    bidCount: 0,
    priceLimitation: 0,
    priceLimitationData: 0,
  };

  componentDidMount() {
    this.setState(
      {
        queryBidListParams: Object.assign({}, this.state.queryBidListParams, {
          tenderType: getUrlParamBySearch(this.props.location.search, 'tenderType'),
          tenderId: getUrlParamBySearch(this.props.location.search, 'tenderId'),
          calibrationId: getUrlParamBySearch(this.props.location.search, 'calibrationId'),
        }),
        parameters: Object.assign({}, this.state.parameters, {
          tenderType: getUrlParamBySearch(this.props.location.search, 'tenderType'),
          saveType: getUrlParamBySearch(this.props.location.search, 'saveType'),

          tenderId: getUrlParamBySearch(this.props.location.search, 'tenderId'),
        }),
        projectId: getUrlParamBySearch(this.props.location.search, 'projectId'),
        orderId: getUrlParamBySearch(this.props.location.search, 'orderId'),
      },
      () => {
        if (
          !(
            isfalse(this.state.queryBidListParams.tenderId) &&
            isfalse(this.state.queryBidListParams.calibrationId)
          )
        ) {
          this.queryBidList();
        }
      }
    );
  }

  enclosureChange = (index, data) => {
    let dataSource = this.state.dataSource;
    dataSource[index - 1].enclosure = [
      {
        name: data.originalFilename,
        url: data.fullFilename,
        uid: data.id,
        status: 'done',
      },
    ];

    this.setState({
      dataSource: dataSource,
    });
  };

  getColumns = () => {
    let _this = this;
    function initProps(record) {
      return {
        action: upLoadUrl + '/base/attach/upload',
        name: 'file',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'gzy-token': getCookie() },
        onChange(info) {
          if (info.file.status !== 'uploading') {
            if (info.fileList.length > 1) {
              let newfile = info.fileList.splice(0, 1);
              remove({
                name: newfile[0].response.data.originalFilename,
                url: newfile[0].response.data.fullFilename,
                uid: newfile[0].response.data.id,
              }); //自动删除一张
            }
          }
          if (info.file.status === 'done') {
            if (info.file.response.status == 200) {
              _this.enclosureChange(record.key, info.file.response.data);
              message.success(`${info.file.name} 上传成功`);
            } else {
              info.fileList.splice(0, 1);
              message.warning(info.file.response.msg);
            }
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        },
        defaultFileList: record.enclosure,
        onRemove: file => remove(file),
      };
    }

    function remove(file) {
      let fileUid = file.uid;
      if (file.response && file.status == 'removed') {
        fileUid = file.response.data.id;
      }
      _this.props
        .dispatch({
          //接口删除以及页面删除
          type: 'common/deleteAttachList',
          payload: {
            id: fileUid,
          },
        })
        .then(() => {
          //页面显示删除
        });
    }

    const columns = [
      {
        title: '投标单位(' + this.state.bidCount + ')',
        dataIndex: 'companyName',
        key: 'companyName',
        render: (text, record) => {
          if (record.bidAuthbusinessId == -1) {
            return (
              <div style={{ position: 'relative' }}>
                <Col
                  style={{
                    position: 'absolute',
                    top: '-30px',
                    backgroundColor: '#EE7356',
                    borderBottomRightRadius: '15px',
                    borderTopRightRadius: '15px',
                    color: '#fff',
                    padding: '2px 8px 2px 2px',
                    display: record.proposal == 0 ? 'none' : null,
                    //  width:'82px'
                  }}
                >
                  建议中标
                </Col>
                <div
                  style={{ display: 'flex' }}
                  className={record.companyNameFalse ? styles.inputPlaceholder : ''}
                >
                  <div
                    style={{
                      textAlign: 'center',
                      height: '100%',
                      marginRight: '15px',
                      marginTop: '5px',
                    }}
                    onClick={this.deleteRow.bind(this, record.key)}
                  >
                    <Icon type="minus-circle" />
                  </div>
                  <span style={{ color: 'red', padding: '5px' }}>*</span>
                  <Input
                    placeholder={record.companyNameFalse ? '投标单位不能为空' : '请输入投标单位'}
                    onChange={this.modifyingData.bind(this, record, 'companyName')}
                    value={text}
                    style={{ borderColor: record.companyNameFalse ? 'red' : '#d9d9d9' }}
                  />
                </div>
              </div>
            );
          } else {
            return (
              <div
                style={{
                  position: 'relative',
                  width: 180,
                }}
              >
                <Col
                  style={{
                    // position: 'absolute',
                    // top: '-20px',
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
                <Col className={styles.textFormat}>主营类别: {record.typeSellText}</Col>
                <Col className={styles.textFormat}>{record.address}</Col>
              </div>
            );
          }
        },
      },
      {
        title: '供货周期',
        dataIndex: 'cyle',
        key: 'cyle',
        render: (text, record) => {
          if (record.bidAuthbusinessId == -1) {
            return (
              <InputNumber
                parser={value => value.replace('-', '')}
                max={180}
                min={0}
                precision={0}
                placeholder="供货周期"
                onChange={this.modifyingData.bind(this, record, 'cyle')}
                value={text}
              />
            );
          } else {
            return <span> {isfalse(text) ? null : text + '天'}</span>;
          }
        },
      },
      {
        title: '投标金额(元)',
        dataIndex: 'price',
        key: 'price',
        render: (text, record) => {
          if (record.bidAuthbusinessId == -1) {
            return (
              <span>
                <span style={{ color: 'red', padding: '5px' }}>*</span>
                <span className={record.priceFalse ? styles.inputPlaceholder : ''}>
                  <InputNumber
                    step={0.01}
                    precision={2}
                    min={0}
                    //max={99999999.99}
                    placeholder={record.priceFalse ? '投标金额不能为空' : '投标金额'}
                    onChange={this.modifyingData.bind(this, record, 'price')}
                    value={record.price}
                    style={{
                      borderColor: record.priceFalse || record.priceNumFalse ? 'red' : '#d9d9d9',
                    }}
                    parser={value => pointTwo(value)}
                  />
                </span>
              </span>
            );
          } else {
            return <span>{text}</span>;
          }
        },
      },
      {
        title: '价格排名',
        dataIndex: 'ranking',
        key: 'ranking',
        render: (text, record) => {
          if (record.bidAuthbusinessId == -1) {
            return <Input disabled value={text} />;
          } else {
            return (
              <span>
                {isfalse(text) ? null : (
                  <span>
                    第<span style={{ color: '#4B85F8', fontSize: '24px' }}>{text}</span>名
                  </span>
                )}
              </span>
            );
          }
        },
      },
      {
        title: '综合得分',
        dataIndex: 'totalScore',
        key: 'totalScore',
        render: (text, record) => {
          if (record.bidAuthbusinessId == -1) {
            return <Input disabled value={text} />;
          } else {
            return <span>{isfalse(text) ? null : <span>{text}分</span>}</span>;
          }
        },
      },
      {
        title: '综合排名',
        dataIndex: 'totalRanking',
        key: 'totalRanking',
        render: (text, record) => {
          if (record.bidAuthbusinessId == -1) {
            return <Input disabled value={text} />;
          } else {
            return (
              <span>
                {isfalse(text) ? null : (
                  <span>
                    第<span style={{ color: '#4B85F8', fontSize: '24px' }}>{text}</span>名
                  </span>
                )}
              </span>
            );
          }
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => {
          if (record.bidAuthbusinessId == -1) {
            return (
              <Button
                type={record.proposal == 0 ? 'primary' : 'dashed'}
                onClick={this.modifyingData.bind(this, record, 'proposal')}
              >
                {record.proposal == 0 ? '建议中标' : '取消建议'}
              </Button>
            );
          } else {
            return (
              <span>
                <Col>
                  <Button
                    type={record.proposal == 0 ? 'primary' : 'dashed'}
                    onClick={this.modifyingData.bind(this, record, 'proposal')}
                  >
                    {record.proposal == 0 ? '建议中标' : '取消建议'}
                  </Button>
                </Col>
                <Col>
                  {this.state.queryBidListParams.tenderType == 2 ? (
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
                  {this.state.queryBidListParams.tenderType == 1 ? (
                    <a
                      href={pathPurchase + '/file/download/template?path=材料采购招标文件-模板.doc'}
                    />
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
          return (
            <TextArea
              rows={3}
              defaultValue={text}
              onChange={this.modifyingData.bind(this, record, 'remark')}
            />
          );
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
              <a>上传附件</a>
            </Upload>
          );
        },
      },
    ];

    if (this.state.queryBidListParams.tenderType == 2) {
      columns.map((item, index) => {
        if (item.dataIndex == 'cyle') {
          columns.splice(index, 1);
        }
      });
    }
    if (this.state.parameters.saveType == 2) {
      columns.map((item, index) => {
        if (item.dataIndex == 'remark') {
          columns.splice(index, 2);
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
                bidId:
                  this.state.queryBidListParams.tenderType == 1
                    ? item.materialBidId
                    : item.labourBidId,
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
                priceFalse: false,
                companyNameFalse: false,
              });
            });
          }
          this.setState({
            parameters: Object.assign({}, this.state.parameters, {
              calibrationId: isfalse(examineList.calibration)
                ? null
                : examineList.calibration.calibrationId,
              taskId: isfalse(examineList.calibration) ? null : examineList.calibration.taskId,
              remark: isfalse(examineList.calibration) ? null : examineList.calibration.remark,
              tenderType: this.state.queryBidListParams.tenderType,
              tenderId: isfalse(this.state.parameters.tenderId)
                ? isfalse(examineList.calibration)
                  ? null
                  : examineList.calibration.tenderId
                : this.state.parameters.tenderId,
            }),
            endDate: examineList.endDate,
            leftTime: examineList.leftTime,
            projectName: examineList.projectName,
            tenderCategory:
              this.state.queryBidListParams.tenderType == 2
                ? examineList.labourWorkType
                : examineList.materialCategoryNames,
            bidCount: isfalse(examineList.bidCount) ? 0 : examineList.bidCount,
            priceLimitation: examineList.priceLimitation,
          });
        }
        this.setState({
          dataSource: isfalse(source) ? [] : source,
        });
      }
    });
  };
  reportCalibration = data => {
    //提交定标审批
    const { dispatch } = this.props;
    dispatch({
      type: 'approvalExamine/reportCalibration',
      payload: data,
    }).then(() => {
      // this.queryBidList(); //查询一次列表
      const { approvalExamine } = this.props;
      if (approvalExamine.sendCalibrationSuccess) {
        if (this.state.parameters.saveType == 2) {
          if (this.state.queryBidListParams.tenderType == 1) {
            window.location.href = '#/bid/materialList';
          } else {
            window.location.href = '#/bid/labourList';
          }
        } else {
          window.location.href = '#/processCenter/myProcess';
        }
      }
      this.setState({
        visible: approvalExamine.visible,
      });
    });
  };

  deleteRow = index => {
    //删除指定的一行
    let dataSource = this.state.dataSource;
    let priceLimitation = this.state.priceLimitation;
    let priceLimitationData = 0;
    dataSource.splice(index - 1, 1);
    dataSource.map((item, index) => {
      item.key = index + 1;
      if (item.proposal == 1) {
        priceLimitationData = priceLimitationData + item.price * 1;
      }
    });

    this.setState({
      dataSource: dataSource,
      priceLimitationData,
    });
  };

  modifyingData = (record, type, value) => {
    //列表里面的内容修改

    let dataSource = this.state.dataSource;
    let priceLimitation = this.state.priceLimitation,
      priceLimitationData = 0;
    if (type == 'proposal') {
      //修改是否建议中标
      dataSource[record.key - 1][type] = dataSource[record.key - 1][type] == 0 ? 1 : 0; //是1就改成0,0就改成1
      //计算现有的金额总和来进行验证
      dataSource.map(item => {
        if (item.proposal == 1) {
          priceLimitationData = priceLimitationData + item.price * 1;
        }
      });
    } else {
      if (typeof value == 'object') {
        // console.log(record,'9090',type)
        dataSource[record.key - 1][type] = value.target.value;
      } else {
        // console.log(type,'type',dataSource[record.key - 1],dataSource,record)
        dataSource[record.key - 1][type] = value;
      }

      if (type == 'price') {
        dataSource.map(item => {
          if (item.proposal == 1) {
            priceLimitationData = priceLimitationData + item.price * 1;
          }
        });
      }
    }

    this.setState({
      dataSource: dataSource,
      priceLimitationData,
    });
  };

  calibrationChange = e => {
    //总的备注的内容修改
    this.setState({
      parameters: Object.assign({}, this.state.parameters, { remark: e.target.value }),
    });
  };

  onOk = data => {
    //选择项目组建响应函数
    this.setState(
      {
        parameters: Object.assign({}, this.state.parameters, {
          tenderId: data.tenderId,
        }),
        queryBidListParams: Object.assign({}, this.state.queryBidListParams, {
          tenderId: data.tenderId,
        }),
        projectId: data.projectId,
        // tenderCategory:data.tenderCategory,
        // projectName:data.projectName
      },
      () => this.queryBidList()
    );
  };

  handleAdd = () => {
    //添加一行(动态添加)
    let dataSource = this.state.dataSource;
    let isAdd = true;
    if (!isfalse(dataSource)) {
      dataSource.map((item, index) => {
        //必填校验
        if (item.bidAuthbusinessId == -1) {
          if (isfalse(item.companyName)) {
            isAdd = false;
            dataSource[index].companyNameFalse = true;
            this.setState({ dataSource });
            setTimeout(() => {
              dataSource[index].companyNameFalse = false;
              this.setState({ dataSource });
            }, 1500);
          }
          if (isfalse(item.price)) {
            isAdd = false;
            dataSource[index].priceFalse = true;
            this.setState({ dataSource });
            setTimeout(() => {
              dataSource[index].priceFalse = false;
              this.setState({ dataSource });
            }, 1500);
          }
          let reg = /^(\d{0,8})(\d{0,8}\.\d{1,2})?$/;
          if (isfalse(reg.test(item.price))) {
            message.error('请输入亿位以下投标金额!');
            isAdd = false;
            dataSource[index].priceNumFalse = true;
            this.setState({ dataSource });
            setTimeout(() => {
              dataSource[index].priceNumFalse = false;
              this.setState({ dataSource });
            }, 1500);
          }
        }
      });
    }

    if (isAdd) {
      dataSource.push({
        companyName: '',
        cyle: '',
        price: '',
        ranking: '',
        totalScore: '',
        totalRanking: '',
        action: '',
        remark: '',
        enclosure: '',
        bidAuthbusinessId: -1,
        key: dataSource.length + 1,
        proposal: 0,
        enclosure: null,
      });
    }

    this.setState({ dataSource });
  };
  submission = () => {
    //提交审批
    let dataSource = this.state.dataSource; //将拿到的数据进行数据处理
    let params = this.state.parameters;
    let platformData = [],
      extraData = [],
      parameters = {},
      isAdd = true;
    if (!isfalse(dataSource)) {
      dataSource.map((item, index) => {
        if (item.bidAuthbusinessId == -1) {
          if (isfalse(item.companyName)) {
            //提交时的验证
            isAdd = false;
            dataSource[index].companyNameFalse = true;
            this.setState({ dataSource });
            setTimeout(() => {
              dataSource[index].companyNameFalse = false;
              this.setState({ dataSource });
            }, 1500);
          }
          if (isfalse(item.price)) {
            isAdd = false;
            dataSource[index].priceFalse = true;
            this.setState({ dataSource });
            setTimeout(() => {
              dataSource[index].priceFalse = false;
              this.setState({ dataSource });
            }, 1500);
          }
          let reg = /^(\d{0,8})(\d{0,8}\.\d{1,2})?$/;
          if (isfalse(reg.test(item.price))) {
            message.error('请输入亿位以下投标金额!');
            isAdd = false;
            dataSource[index].priceNumFalse = true;
            this.setState({ dataSource });
            setTimeout(() => {
              dataSource[index].priceNumFalse = false;
              this.setState({ dataSource });
            }, 1500);
          }

          extraData.push({
            bidCompany: item.companyName,
            supplyCycle: item.cyle,
            bidPrice: item.price,
            proposal: item.proposal,
            remark: item.remark,
            fileIds: isfalse(item.enclosure) ? null : item.enclosure[0].uid.toString(),
          });
        } else {
          platformData.push({
            bidId: item.bidId,
            proposal: item.proposal,
            remark: item.remark,
            fileIds: isfalse(item.enclosure) ? null : item.enclosure[0].uid.toString(),
          });
        }
      });
    }

    let newParams = {
      platform: platformData,
      extra: extraData,
    };
    parameters = {
      ...params,
      bidDatas: JSON.stringify(newParams),
    };
    if (getUrlParamBySearch(this.props.location.search, 'orderId')) {
      parameters = Object.assign({}, parameters, {
        orderId: getUrlParamBySearch(this.props.location.search, 'orderId'),
      });
    }
    if (getUrlParamBySearch(this.props.location.search, 'taskId')) {
      parameters = Object.assign({}, parameters, {
        taskId: getUrlParamBySearch(this.props.location.search, 'taskId'),
      });
    }

    if (isAdd) {
      if (isfalse(newParams.extra) && isfalse(newParams.platform)) {
        message.warning('请选择或者添加中标单位');
      } else {
        this.reportCalibration(parameters); //提交审批
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
    const { approvalExamine, loading } = this.props;
    const {
      dataSource,
      projectName,
      tenderCategory,
      endDate,
      leftTime,
      queryBidListParams,
      parameters,
      projectId,
      priceLimitation,
    } = this.state;
    return (
      <Card title={'发起定标审批'} bordered={false}>
        <Row style={{ zIndex: '0' }}>
          <Col span={18} style={{ marginBottom: '10px' }}>
            <Row>
              <Col style={{ textAlign: 'left', lineHeight: '32px' }}>
                定标对象：
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: '12px',
                    width: '200px',
                    display:
                      isfalse(queryBidListParams.calibrationId) &&
                      isfalse(queryBidListParams.tenderId)
                        ? 'none'
                        : 'inline-block',
                  }}
                >
                  {' '}
                  <a>
                    {projectName} 招：
                    {tenderCategory}
                  </a>
                </span>
                <span style={{ display: 'inline-block' }}>
                  <SelectCalibration
                    onOk={this.onOk}
                    tenderType={queryBidListParams.tenderType}
                    processType={parameters.saveType == 2 ? '' : 'approval'}
                  />
                </span>
              </Col>
            </Row>
            <Row
              style={{
                display:
                  isfalse(queryBidListParams.calibrationId) && isfalse(queryBidListParams.tenderId)
                    ? 'none'
                    : null,
              }}
            >
              <Row>
                <Col style={{ textAlign: 'left' }}>
                  截止时间：
                  {isfalse(endDate) ? null : timestampToTime(endDate, 'HM')}
                </Col>
                {/* <Col>{isfalse(endDate) ? null : timestampToTime(endDate, 'HM')}</Col> */}
              </Row>
              <Row style={{ lineHeight: '32px' }}>
                <Col style={{ textAlign: 'left' }}>
                  开标剩余时间：
                  {leftTime} 天
                </Col>
              </Row>
              <Row style={{ lineHeight: '32px' }}>
                {isfalse(priceLimitation) ? (
                  <Col style={{ textAlign: 'left' }}>
                    最高限额：
                    <span>暂无</span>
                  </Col>
                ) : (
                  <Col
                    style={{
                      textAlign: 'left',
                      color:
                        this.state.priceLimitationData > this.state.priceLimitation
                          ? 'red'
                          : 'rgb(102, 102, 102)',
                    }}
                  >
                    最高限额：
                    <span>{priceLimitation}元</span>
                  </Col>
                )}
              </Row>
              <Col style={{ marginTop: '20px' }}>
                <Table columns={this.getColumns()} dataSource={dataSource} pagination={false} />
              </Col>
              <Col style={{ marginTop: '20px' }}>
                <Button
                  type="dashed"
                  onClick={this.handleAdd}
                  style={{ width: '100%', marginBottom: 16 }}
                >
                  <Icon type="plus" /> 添加
                </Button>
              </Col>
              <Col>
                {this.state.queryBidListParams.tenderType == 2 ? null : (
                  <span>
                    <a>材料报价清单汇总对比表.xlsx</a>
                    <a
                      href={
                        pathPurchase +
                        '/materialtender/createfile?tenderId=' +
                        this.state.parameters.tenderId
                      }
                    >
                      <Button type="primary" style={{ marginLeft: '10px' }}>
                        点击下载
                      </Button>
                    </a>
                  </span>
                )}
              </Col>
              <Col style={{ display: parameters.saveType == 2 ? 'none' : null }}>
                <p>备注：</p>
                <TextArea
                  rows={6}
                  placeholder="请填写备注内容"
                  value={parameters.remark}
                  onChange={this.calibrationChange}
                />
              </Col>
              <Col style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button type="primary" onClick={this.submission}>
                  {parameters.saveType == 1 ? '提交审批' : '确定定标'}
                </Button>
              </Col>
            </Row>
          </Col>
          <Col span={5} style={{ marginBottom: '10px' }}>
            {loading == false ? (
              isfalse(queryBidListParams.calibrationId) &&
              isfalse(queryBidListParams.tenderId) ? null : parameters.saveType == 2 ? null : (
                <FlowStep processCode="approval" projectId={projectId} />
              )
            ) : null}
          </Col>
        </Row>

        {this.state.visible ? (
          <SettingProcess
            that={this}
            projectId={this.state.projectId}
            code="approval"
            visible={this.state.visible}
          />
        ) : null}
      </Card>
    );
  }
}
