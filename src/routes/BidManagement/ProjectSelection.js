/**
 * 参数说明
 * @param {function} isShow 控制弹框的显示
 * @param {function} onOK 点击确定时响应函数
 * @param {boole}  visible 弹框默认的显示状态
 * @param {string} processType 流程类型(支付审批pyment,定标审批approval)
 *
 */

import React, { Component } from 'react';
import { Modal, Button, Table, Row, Col, Spin, Radio,message } from 'antd';
import { connect } from 'dva';
import { isfalse } from '../../Tools/util_tools';
import { getPurchased } from '../../utils/utils';
import {pathTender,PurchaseBoot} from '../../../configPath'
const RadioGroup = Radio.Group;

@connect(({ common, loading }) => ({
  common,
  loading: loading.effects['common/getCurrentUserCorpProjectList'], //项目列表数据请求
}))
export default class ProjectSelection extends Component {
  state = {
    columns: [
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
        width: 150,
        render: (text, record) => (
          <Radio
            value={record}
            style={{
              width: '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </Radio>
        ),
      },
      {
        title: '项目地址',
        dataIndex: 'address',
        key: 'address',
        width: 200,
      },
      {
        title: '项目工期',
        dataIndex: 'timeLimit',
        key: 'timeLimit',
        width: 220,
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (text, record) => (
          <span>

            {/* <a href={pathTender+'/project/getProjectView?id='+ record.projectId} target="_blank">查看详情</a> */}
            <a href={getPurchased('already_purchased')=='true'?'#/project/details?id='+record.projectId:pathTender+'/project/getProjectView?id='+ record.projectId} target="_blank">
              查看详情
            </a>
          </span>
        ),
      },
    ],
    warningText: '', //提示语
    dataSource: [], //table数据源
    radioValue: {}, //选中的值
    params: {
      //发送请求的参数
      current: '1',
      size: '8',
    },
    checkParams:{
      projectId:'', //项目ID
      processType:'', //流程类型(支付审批pyment,定标审批approval
    },
    total: '', //数据的总数目
  };

  componentDidMount() {
    this.getCurrentUserCorpProjectList(); //第一次获取数据
    this.setState({
      checkParams:Object.assign({},this.state.checkParams,{processType:this.props.processType}),
    })
  }

  handleOk = () => {
    if (isfalse(this.state.radioValue)) {
      this.setState(
        {
          warningText: '请选择一个项目!',
        },
        () =>
          setTimeout(() => {
            //会有一个BUG:当出现提示后立刻关闭再打开,提示语还会在
            this.setState({
              warningText: '',
            });
          }, 1500)
      );
    } else {

      let {checkParams,radioValue} = this.state;
      if(isfalse( checkParams.processType)){ //不需要进行检测时
          this.props.onOK(radioValue);
          this.props.isShow(false);
      }else{
        this.setState({
          checkParams:Object.assign({},checkParams,{projectId:radioValue.projectId}),
        },()=>this.initiatorCheck())
      }
    }
  };

  handleCancel = () => {
    //关闭弹框
    this.props.isShow(false);
  };

  getCurrentUserCorpProjectList = () => {
    //获取项目列表
    const { dispatch } = this.props;
    dispatch({
      type: 'common/getCurrentUserCorpProjectList',
      payload: this.state.params,
    }).then(() => {
      const { common } = this.props;
      if (!isfalse(common.projectList)) {
        let source = [];
        common.projectList.records.map(item => {
          source.push({
            projectName: item.projectName,
            projectClass: item.projectClass,
            cityName: item.cityName,
            city: item.city,
            provinceName: item.provinceName,
            province: item.province,
            projectStartDay: item.validDateStart,
            projectEndDay: item.validDateEnd,
            projectId: item.id,
            tenderCompanyName: item.bidCompany,
            key: item.id,
            auditState: item.auditState,
            projectContractFiles: item.projectContractFiles,
            address: item.provinceName + item.cityName,
            timeLimit: item.validDateStart + '-' + item.validDateEnd,
          });
        });
        this.setState({
          dataSource: source,
          total: common.projectList.total,
        });
      }
    });
  };

  initiatorCheck = ()=>{ //审批发起人检测
    const {dispatch} = this.props;
    dispatch({
      type:'common/initiatorCheck',
      payload:this.state.checkParams
    }).then(()=>{
      const {common} = this.props;
      if(!isfalse(common.initiatorCheck)){
        if(common.initiatorCheck.flag==1){
          this.props.onOK(this.state.radioValue);
          this.props.isShow(false);
        }else if(common.initiatorCheck.flag==0){
          message.warning('您没有该项目的审批发起权限')
        }
      }
    })
  }

  pageChange = (page, pageSize) => {
    //页面发生改变时
    this.setState(
      {
        radioValue: {},
        params: {
          current: page,
          size: pageSize,
        },
      },
      () => this.getCurrentUserCorpProjectList()
    );
  };

  onChange = e => {
    //单选框发生改变时
    this.setState({
      radioValue: e.target.value,
    });
  };

  render() {
    const { loading } = this.props;
    return (
      <div>
        <Modal
          title="项目信息汇总"
          visible={this.props.visible}
          onOk={this.handleOk.bind(this)}
          onCancel={this.handleCancel}
          width={780}
        >
          <Spin spinning={loading}>
            <Row type="flex" justify="space-between">
              <Col style={{ color: 'red' }}>{this.state.warningText}</Col>{' '}
              <Col>
                  <Button
                    style={{ marginBottom: 20 }}
                    type="primary"
                    href={getPurchased('already_purchased')=='true'?'#/project/add':pathTender+'/project/gotoEdit'}>
                  创建新的项目
                </Button>
              </Col>
            </Row>
            <RadioGroup onChange={this.onChange} value={this.state.radioValue}>
              <Table
                columns={this.state.columns}
                dataSource={this.state.dataSource}
                pagination={{
                  total: this.state.total,
                  onChange: (page, pageSize) => this.pageChange(page, pageSize),
                  defaultPageSize: 8,
                }}
              />
            </RadioGroup>
          </Spin>
        </Modal>
      </div>
    );
  }
}
