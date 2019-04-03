import React, { Component } from 'react';
import { Modal, Card, Steps, Table, Row, Col, Spin, Radio, Avatar, Icon } from 'antd';
import { connect } from 'dva';
import { isfalse } from '../../Tools/util_tools';
import Styles from '../ApprovalPerformance/style.less';
import { getUrlParamBySearch } from '../../utils/utils';

// const RadioGroup = Radio.Group;
const Step = Steps.Step;

@connect(({ common, loading }) => ({
  common,
  loading: loading.effects['common/queryProcessTracking'], //审批意见列表数据请求
}))
export default class flowStep extends Component {
  state = {
    dataSource: [], //数据源
    processClass: '审批步骤',
    params: {
      //发送请求的参数
      orderId: '',
      processCode: '',
      projectId: '',
      bizObjCode: '',
      bizObjId: '',
    },
    total: '', //数据的总数目
  };
  // 选择项目时
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.projectId != this.state.projectId) {
      this.setState({ projectId: nextProps.projectId }, () => {
        this.queryProcessTracking();
      });
    }
  }
  componentDidMount() {
    setTimeout(() => {
      this.queryProcessTracking(); //第一次获取数据
    }, 600);
  }
  /*  componentWillUpdate(nextPros){
     if(!isfalse(nextPros.type)){
       if(nextPros.type!=this.props.type&&nextPros.type=='view'){
         this.queryProcessTracking(); //第一次获取数据
       }
     }
   } */

  queryProcessTracking = () => {
    //获取审批流程列表
    const { dispatch } = this.props;
    dispatch({
      type: 'common/queryProcessTracking',
      payload: {
        processCode: this.props.processCode,
        orderId: this.props.orderId,
        projectId: this.props.projectId,
        bizObjId: this.props.bizObjId,
        bizObjCode: this.props.bizObjCode,
      },
      // payload: this.state.params,
    }).then(() => {
      const { common } = this.props;
      if (!isfalse(common.flowRecordList)) {
        let source = [],
          _index = 0;
        common.flowRecordList.nodes.map((_item, i) => {
          if (_item.currTask) {
            _index = i;
          }
        });
        common.flowRecordList.nodes.map((item, index) => {
          source.push({
            taskName: item.taskName, // 节点显示名称
            taskCode: item.taskCode, // 节点名称 (manager,boss)
            currTask: item.currTask, // 是否为当前流程所处节点(true为当前节点)
            userDisplayName: item.userDisplayName, //处理人名字
            nodeStatus: _index > index,
          });
        });
        this.setState(
          {
            dataSource: source,
            total: common.flowRecordList.length,
          }
        );
      }
    });
  };

  render() {
    const { loading } = this.props;
    const { dataSource } = this.state;

    return (
      <Card style={{ background: '#F3FBFF' }} className={Styles.noBorder}>
        <Spin spinning={loading}>
          <Steps direction="vertical" size="small">
            {dataSource.map((item, index) => {
              let endStep = item.currTask;
              /*if(endStep){

              }*/
              return (
                <Step
                  key={index}
                  title={item.taskName}
                  description={item.userDisplayName}
                  status={item.currTask == true || item.nodeStatus ? 'finish' : 'wait'}
                  icon={item.currTask != true ? '' : <Icon type="clock-circle" />}
                />
              );
            })}
          </Steps>
        </Spin>
      </Card>
    );
  }
}
