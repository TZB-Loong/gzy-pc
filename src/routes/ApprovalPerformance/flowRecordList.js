import React, { Component } from 'react';
import { Modal, Card, Steps, Table, Row, Col, Spin, Radio, Avatar } from 'antd';
import { connect } from 'dva';
import { isfalse } from '../../Tools/util_tools';
import Styles from './style.less';
import { getUrlParamBySearch } from '../../utils/utils';

// const RadioGroup = Radio.Group;
const Step = Steps.Step;

@connect(({ common, loading }) => ({
  common,
  loading: loading.effects['common/queryProcessTracking'], //审批意见列表数据请求
}))
export default class FlowRecordList extends Component {
  state = {
    dataSource: [], //数据源
    processClass: '支付审批',
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

  componentDidMount() {
    this.setState({
      processClass: isfalse(this.props.title) ? '审批记录（支付审批）' : this.props.title,
    });
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
        let source = [];
        (common.flowRecordList.approvals ? common.flowRecordList.approvals : []).map(item => {
          source.push({
            operator: item.operator, //审批人
            portrait: item.portrait, //审批人头像
            operateTime: item.operateTime, //审批时间
            result: item.result == 0 ? '同意' : '', //审批结果 0同意 1不同意
            resultNo: item.result == 1 ? '不同意' : '', //审批结果 0同意 1不同意
            resultsInt: item.result,
            content: item.content, //审批意见
            taskName: item.taskName, //节点显示名称
            taskCode: item.taskCode, //节点名称 (manager,boss)
            isStart: item.isStart,
          });
        });
        this.setState({
          dataSource: source,
          total: common.flowRecordList.length,
        });
      }
    });
  };

  render() {
    const { loading } = this.props;
    const { dataSource } = this.state;
    return (
      <Card title={this.state.processClass} className={Styles.flowCard}>
        <Spin spinning={loading}>
          <Steps direction="vertical" size="default" current={1} className={Styles.avatorHeight}>
            {dataSource.map((item, index) => {
              console.log(item)
              if(item.operateTime!=null){
                return (
                  <Step
                    key={index}
                    title={
                      <div className={Styles.flowRecord}>
                        <label>{item.operator}</label>
                        {item.resultsInt == 0 && index > 0 ? (
                          item.isStart == 1 ? (
                            <span className={Styles.flowStart}>重新发起</span>
                          ) : (
                            <span className={Styles.flowOk} >{item.result}</span>
                          )
                        ) : (
                          ''
                        )}
                        {item.resultsInt == 0 && index == 0 ? (
                          <span className={Styles.flowStart}>发起</span>
                        ) : (
                          ''
                        )}
                        {item.resultsInt == 1 && index > 0 ? (
                          <span className={Styles.flowNo}>{item.resultNo}</span>
                        ) : (
                          ''
                        )}

                        {/*{item.operateTime ? '' : <span className={Styles.flowStart}>待审批</span>}*/}
                        <span className={Styles.flowTime}>{item.operateTime}</span>
                      </div>
                    }
                    description={
                      <div className={Styles.flowRecord}>
                        {index > 0 && item.resultsInt == 1 ? <label>意见：</label> : ''}
                        {index > 0 && item.resultsInt == 0 ? (
                          item.isStart == 1 ? (
                            ''
                          ) : (
                            <label>意见：</label>
                          )
                        ) : (
                          ''
                        )}
                        <span style={{width:"calc(100% - 105px)"}}>{item.content}</span>
                      </div>
                    }
                    icon={<Avatar style={{ backgroundColor: 'RGBA(75, 133, 248, 1)', verticalAlign: 'middle' }}>{item.operator.split('')[0]}</Avatar>}
                    status={item.currTask == true ? 'finish' : 'wait'}
                  />
                );
              }
            })}
          </Steps>
        </Spin>
      </Card>
    );
  }
}
