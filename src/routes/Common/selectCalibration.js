/**
 * @param {function} onOk 点击确定时响应的函数
 * @param {string} tenderType  1 材料 2为劳务
 */

import React, { Component } from 'react';
import { Modal, Button, Table, Spin, Radio,message  } from 'antd';
import { connect } from 'dva';
import { isfalse, timestampToTime } from '../../Tools/util_tools';

const RadioGroup = Radio.Group;

@connect(({ loading, common }) => ({
  common,
  loading: loading.effects['common/queryAwaitOpenTenderList'],
}))
export default class SelectCalibration extends Component {
  state = {
    visible: false,
    columns: [
      {
        title: '招标信息',
        dataIndex: 'projectName',
        key: 'projectName',
        width: 190,
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
        title: '招标类型',
        dataIndex: 'tenderCategory',
        key: 'tenderCategory',
        width: 250,
      },
      {
        title: '截止时间',
        dataIndex: 'closingDate',
        key: 'closingDate',
        width: 150,
        render: (text, record) => (
          <span>{timestampToTime(record.openDate) + record.closingHour + ':' + '00'}</span>
        ),
      },
      {
        title: '开标时间',
        key: 'openDate',
        dataIndex: 'openDate',
        width: 150,
        render: (text, record) => <span>{timestampToTime(record.openDate, 'HM')}</span>,
      },
    ],
    dataSource: [],
    radioGroupValue: {},
    waringShow:false,
    checkParams:{
      projectId:'',//项目ID
      processType:''//流程类型(支付审批payment,定标审批approval)
    },
  };

  componentDidMount() {
      this.setState({
        checkParams:Object.assign({},this.state.checkParams,{processType:this.props.processType})
      })
  }
  componentDidUpdate(netxtProps){
    if(netxtProps.processType!=this.props.processType){
      this.setState({
        checkParams:Object.assign({},this.state.checkParams,{processType:this.props.processType})
      })
    }
  }


  queryAwaitOpenTenderList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'common/queryAwaitOpenTenderList',
      payload:{tenderType:this.props.tenderType}
    }).then(() => {
      const { common } = this.props;
      if (!isfalse(common.awaitOpenTenderList)) {
        this.setState({
          dataSource: common.awaitOpenTenderList,
        });
      }
    });
  };

  showModal = () => {
    this.queryAwaitOpenTenderList();
    this.setState({
      visible: true,
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
          if (!isfalse(this.props.onOk)) {
            this.props.onOk(this.state.radioGroupValue);
          }
          this.setState({
            visible: false,
            waringShow:false
          });
        }else if(common.initiatorCheck.flag==0){
          message.warning('您没有该项目的审批发起权限')
        }
      }
    })
  }


  handleOk = e => {
    if(isfalse(this.state.radioGroupValue)){
      this.setState({
        waringShow:true
      },()=>setTimeout(()=>{
        this.setState({
          waringShow:false
        })
      },1500))
    }else{

      let {checkParams,radioGroupValue} = this.state;
      if (isfalse(checkParams.processType)) { //不需要进行检测时
        if (!isfalse(this.props.onOk)) {
          this.props.onOk(this.state.radioGroupValue);
        }
        this.setState({
          visible: false,
          waringShow:false
        });
      } else {
        this.setState({
          checkParams: Object.assign({}, checkParams, { projectId: radioGroupValue.projectId })
        }, () => this.initiatorCheck())
      }


    }


  };

  handleCancel = e => {
    // console.log(e);
    this.setState({
      visible: false,
      waringShow:false,
    });
  };

  onChange = e => {
    this.setState({
      radioGroupValue: e.target.value,
    });
  };

  render() {
    const { loading } = this.props;
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          选择/修改
        </Button>
        <Modal
          title={<span>选择定标对象
            <span style={{display:this.state.waringShow?null:'none',color:'red'}}>
            &nbsp;&nbsp;(请选择一个项目)</span>
            </span>}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={800}
          style={{ height: '400px' }}
        >
          <Spin spinning={loading}>
            <RadioGroup onChange={this.onChange} value={this.state.radioGroupValue}>
              <Table
                rowKey={record => record.tenderId}
                columns={this.state.columns}
                dataSource={this.state.dataSource}
                onRow={record => {
                  return {
                    onClick: () => this.setState({ radioGroupValue: record }),
                  };
                }}
                scroll={{ y: 340 }}
              />
            </RadioGroup>
          </Spin>
        </Modal>
      </div>
    );
  }
}
