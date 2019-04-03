/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, Button, Popover, Form, Input, Checkbox, Modal, Select, message } from 'antd';
import styles from './style.less';
import { swapItems, isfalse } from '../../Tools/util_tools';
import { SectionToChinese, uuid,getUrlParamBySearch } from '../../utils/utils';
import { routerRedux } from 'dva/router';
import StaffChange from '../Common/StaffChange'; //选人组件
const confirm = Modal.confirm;
const Option = Select.Option;
const FormItem = Form.Item;
@Form.create()
@connect(({ performanceProgressModel, loading }) => ({
  performanceProgressModel,
  loading,
}))
export default class  PerformanceProgress extends Component {
  state = {
    currentFlow: null,
    visible: false,
    isMore: true,
    initFlow: [],
    processId: '',
    defaultVal: {
      // roles: [{ roleId: '2', roleName: '普通成员' }], //默认选中的rolesId,与值
      // users: [{ userId: '', nickName: '' }], //默认选中的 usersId
    },
    dataFlow: [
      {
        key: '1',
        node: ['John', 'Brown'],
        symbol: ['大于', '小于', '等于'],
        value: null,
      },
    ],
  };

  componentDidMount() {
    const {  projectId, code } = this.props;
    if(this.props.onRef){
      this.props.onRef(this)
    }
    let states = {},
      path = {},
      getFlow = [],
      lineArray = [];
    /* dispatch({
      type: 'performanceProgressModel/workflowList',
      payload: {
        from: '审核流程',
        projectId: -1,
      },
    }).then(() => {
      console.log(this.props)
    });*/
    if(projectId!=''){
      this.props.dispatch({
        type: 'performanceProgressModel/workflowDetail',
        payload: {
          processCode: code,
          projectId: projectId,
        },
      }).then(() => {
        const {performanceProgressModel: { details, processId }} = this.props;
        if (details != '') {
          states = eval('(' + details + ')').states;
          path = eval('(' + details + ')').paths;
          for (let i in states) {
            // let Prop = states[i];
            if (i !== 'start' && i !== 'end') {
              for (let j in path) {
                if (path[j].from !== 'start' && path[j].from !== 'end')
                  if (i === path[j].from && states[i].type === 'decision') {
                    lineArray.push({
                      value: path[j].text.text,
                      to: path[j].to,
                    });
                  }
              }
              let createObj = Object.assign({}, states[i], {
                lineData: states[i].type === 'decision' ? lineArray : [],
              });
              getFlow.push(createObj);
            }
          }
          this.setState({ initFlow: getFlow, processId: processId });
        }
      });
    }
  }
  setNodeName = e => {
    let changeVal = this.state.initFlow;
    changeVal[this.state.currentFlow].props.displayName.value = e.target.value;
    this.setState({
      initFlow: changeVal,
    });
  };
  operation = (type, index) => {
    let moveArr = [],
      that = this;
    if (type === 'down') {
      moveArr = swapItems(this.state.initFlow, index, index + 1);
      that.setState({ initFlow: moveArr });
    }
    if (type === 'up') {
      moveArr = swapItems(this.state.initFlow, index, index - 1);
      that.setState({ initFlow: moveArr });
    }
    if (type === 'del') {
      // moveArr = this.state.initFlow;
      confirm({
        title: '提示信息?',
        content: '确认删除该节点吗?',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          moveArr = that.state.initFlow;
          moveArr.splice(index, 1);
          that.setState({
            initFlow: moveArr,
          });
        },
        onCancel() {
          return;
        },
      });
    }
  };
  //添加节点
  addNode = () => {
    let newNode = this.state.initFlow;
    newNode.push({
      type: 'null',
      text: {
        text: '《新节点》',
      },
      attr: {
        x: 491,
        y: 172,
        width: 100,
        height: 50,
      },
      props: {
        displayName: {
          value: '《新节点》',
        },
        performType: {
          value: 'ANY',
        },
        taskType: {
          value: 'Major',
        },
        layout: {
          value: '311,172,100,50',
        },
        assigneeDisplay: {
          value: '',
        },
        name: {
          value: 'code' + uuid(),
        },
        assignee: {
          value: '',
        },
        assignmentHandler: {
          value: 'com.jianke.workflow.utils.AssignTaskActor',
        },
      },
    });
    this.setState(
      {
        initFlow: newNode,
      },
      () => {
        // console.log(this.state.initFlow);
      }
    );
  };
  onOk = data => {
    let selectData = JSON.parse(data);
    const { initFlow, currentFlow } = this.state;
    let rolesName = document.getElementsByClassName('roles')[currentFlow].innerHTML;
    initFlow[currentFlow].props.displayName.value = rolesName;
    initFlow[currentFlow].props.assignee.value = selectData.userIds;
    initFlow[currentFlow].props.assigneeDisplay.value = selectData.displayName;
    initFlow[currentFlow].text.text = selectData.displayName;
    this.setState(
      {
        initFlow,
      },
    );
  };
  //添加条件
  addCondition = () => {};

  //保存
  save = () => {
    let caretData = '', state = this.state.initFlow;
    const { projectId, code, dispatch } = this.props;
    // console.log(state)
    state.map((item, index, arr) => {
      caretData +=
        '<task ' +
        'layout="608,241,100,50" ' +
        'name="' +
        item.props.name.value +
        '" autocc="" ' +
        'displayname="' +
        item.props.displayName.value +
        '" ' +
        'assignee="' +
        item.props.assignee.value +
        '" ' +
        'assigneedisplay="' +
        item.props.assigneeDisplay.value +
        '" ' +
        'assignmenthandler="com.jianke.workflow.utils.AssignTaskActor" ' +
        'tasktype="Major" ' +
        'performtype="ANY">' +
        '<transition offset="0,-10" to="' +
        (index + 1 < arr.length ? arr[index + 1].props.name.value : 'end') +
        '" name="path' +
        (index + 1) +
        '" displayname="path' +
        (index + 1) +
        '" />' +
        '</task>';
    });
    for(let i = 0;i<state.length;i++){
      document.getElementsByClassName('isEmpty')[i].firstElementChild.style.borderColor='#dedede';
      if(state[i].text.text=='《新节点》'||state[i].text.text==''){
        message.warning('审批节点名称不能为空!');
        document.getElementsByClassName('isEmpty')[i].firstElementChild.style.borderColor='red';
        return;
      }
    }
    if(state.length<2){
      message.warning('审批节点至少有两项!');
      return;
    }
    caretData =
      '<process name="'+code+'" displayName="'+(code.indexOf('customForm')>-1?decodeURI(getUrlParamBySearch(window.location.href,'bizName')):code=='payment'?"支付审批流程":"定标审批流程")+'">' +
      '<start layout="85,203,50,50" name="start">' +
      '<transition offset="0,-10" to="' +
      state[0].props.name.value +
      '" name="path0" displayname="path0" />' +
      '</start>' +
      caretData +
      '<end layout="1085,451,50,50" name="end"></end>' +
      '</process>';
    caretData = caretData
      .replace(new RegExp('displayname', 'g'), 'displayName')
      .replace(new RegExp('assigneedisplay', 'g'), 'assigneeDisplay')
      .replace(new RegExp('assignmenthandler', 'g'), 'assignmentHandler')
      .replace(new RegExp('tasktype', 'g'), 'taskType')
      .replace(new RegExp('performtype', 'g'), 'performType')
      .replace(new RegExp('autocc', 'g'), 'autoCC');

    if(getUrlParamBySearch(window.location.href,'bizCode')){
      dispatch({
        type: 'performanceProgressModel/saveCustomFlow',
        payload: {
          bizCode: getUrlParamBySearch(window.location.href,'bizCode'),
          bizName: decodeURI(getUrlParamBySearch(window.location.href,'bizName')),
          convertXml: caretData,
        },
      }).then(() => {
        const {
          performanceProgressModel: { saveStatus },
        } = this.props;
        if (saveStatus) {
          message.success('流程设置成功!');
          dispatch(
            routerRedux.push(`/processCenter/ProcessStart`)
          );
        }
      });
    }else {
      dispatch({
        type: 'performanceProgressModel/saveFlow',
        payload: {
          id: this.state.processId,
          processCode: code,
          projectId: projectId,
          convertXml: caretData,
        },
      }).then(() => {
        const {
          performanceProgressModel: { saveStatus },
        } = this.props;
        if (saveStatus) {
          message.success('保存成功!');
        }
      });
    }

  };
  //取消
  cancel = () => {};
  //选中节点
  selectWorkFlow = (type, index) => {
    let defaultVal= {
      users: [],
    };
    let propsObj = [];
    let currentVal = this.state.initFlow[index];
    let assignee = (currentVal.props.assignee.value).split(',');
    let assigneeDisplay = (currentVal.props.assigneeDisplay.value).split(',');
    if(!isfalse(assignee[0])){
      assignee.map((item,_index)=>{
        propsObj.push({ userId: item, nickName: assigneeDisplay[_index] })
      });
    }
    defaultVal.users = propsObj;
    if (type === 'flow') {
      this.props.form.setFieldsValue({
        nodeNames: currentVal.props.displayName.value,
        dispose: currentVal.props.assigneeDisplay.value,
        copy: ``,
      });
      this.setState({ currentFlow: index, isMore:!index==0, defaultVal:defaultVal},()=>console.log(this.state));
    } else {
      this.setState({
        visible: true,
        currentFlow: index,
      });
    }
  };

  onChangeChecked = () => {};
  handleOk = () => {
    const { visible } = this.state;
    this.setState({
      visible: false,
    });
  };
  //设置流程金额节点
  selectCondition = (e, value, index) => {
    // console.log(e);
    // console.log(`selected ${value}`);
    // console.log(`selected ${index}`);
  };
  //选择条件
  handleCondition = value => {
    const { initFlow, currentFlow } = this.state;
    initFlow[currentFlow].text.text = value;
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { title } = this.props;
    const { initFlow, isMore, dataFlow } = this.state;
    const columns = [
      {
        title: '跳转节点',
        dataIndex: 'node',
        render: (text, row, index) => {
          return (
            <Select
              defaultValue="请选择跳转节点"
              style={{ width: 150 }}
              onChange={e => this.selectCondition(e, 'node', index)}
            >
              {text.map((item, index) => {
                return (
                  <Option key={index} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          );
        },
      },
      {
        title: '运算符号',
        dataIndex: 'symbol',
        render: (text, row, index) => {
          return (
            <Select
              defaultValue="请选择符号"
              style={{ width: 120 }}
              onChange={e => this.selectCondition(e, 'symbol', index)}
            >
              {text.map((item, index) => {
                return (
                  <Option key={index} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          );
        },
      },
      {
        title: '值',
        dataIndex: 'value',
        render: (text, row, index) => {
          return (
            <Input
              type="text"
              placeholder="请输入数值"
              defaultValue={text}
              onChange={e => this.selectCondition(e, 'value', index)}
            />
          );
        },
      },
    ];
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    // console.log(initFlow)
    const content = (
      <div>
        {/* <FormItem {...formItemLayout} label="节点名称">
          {getFieldDecorator('nodeNames', {
            rules: [{ required: true, message: '请输入节点名称!' }],
          })(<Input type="text" placeholder="请输入节点名称" onChange={this.setNodeName} />)}
        </FormItem>*/}
        <FormItem {...formItemLayout} label="处理人">
          {getFieldDecorator('dispose', {
            rules: [{ required: true, message: '请输入处理人!' }],
          })(
            <StaffChange
              onOk={this.onOk}
              // companyName={'公司名称'}
              modalTitle={'选择角色'}
              type="users"
              projectId={''}
              radio={isMore}
              defaultValues={this.state.defaultVal}
            />
          )}
        </FormItem>
        {/*<FormItem {...formItemLayout} label="抄送角色">
          {getFieldDecorator('copy', { rules: [{ required: true, message: '请输入抄送角色!' }] })(
            <Input type="text" placeholder="请输入抄送角色" />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="会签">
          {getFieldDecorator('countersign', {
            rules: [{ required: true, message: '请选择会签!' }],
          })(<Checkbox onChange={this.onChangeChecked()}>是否会签</Checkbox>)}
        </FormItem>*/}
      </div>
    );
    //条件设计
    return (
      <Card title={this.props.title}>
        <div className={styles.flowsDesigns} style={{margin:title=='审批流程设置'?'0 auto':'inherit'}}>
          <ul>
            {initFlow.length > 0
              ? initFlow.map((item, index) => {
                  if (item.type !== 'decision') {
                    return (
                      <li key={index} className="isEmpty" onClick={() => this.selectWorkFlow('flow', index)}>
                        <Popover
                          placement="rightTop"
                          style={{ zIndex: 8 }}
                          title={'属性'}
                          content={content}
                          trigger="click"
                        >
                          <div className={styles.setBorder}>
                            <strong>{index + 1}</strong>
                            <div className={styles.nameExamine}>
                              <h4
                                style={{
                                  lineHeight: '26px',
                                  marginBottom: 0,
                                }}
                              >
                                处理人：{item.props.assigneeDisplay.value}
                              </h4>
                              <p className="roles">{index == 0 ? '发起人' : SectionToChinese(index) + '级审批人'}</p>
                              {/* <p>
                              处理人:
                              <span>{item.props.assigneeDisplay.value}</span>
                            </p>*/}
                            </div>
                          </div>
                        </Popover>
                        <div className={styles.operation}>
                          {/*{parseFloat(index) !== 0 ? (
                            <span className={styles.up} onClick={() => this.operation('up', index)}>
                              <img src={require('../../assets/arrow_t.png')} alt="" />
                            </span>
                          ) : null}
                          {parseFloat(index) !== initFlow.length - 1 ? (
                            <span
                              className={styles.down}
                              onClick={() => this.operation('down', index)}
                            >
                              <img src={require('../../assets/arrow_d.png')} alt="" />
                            </span>
                          ) : null}*/}
                          <span className={styles.del} onClick={() => this.operation('del', index)}>
                            <img src={require('../../assets/delete.png')} alt="" />
                          </span>
                        </div>
                      </li>
                    );
                  } else {
                    return (
                      <li key={index}  className="isEmpty" onClick={() => this.selectWorkFlow('decision', index)}>
                        <div className={styles.setBorder} style={{ borderColor: '#1890ff' }}>
                          <strong>{index + 1}</strong>
                          <div className={styles.nameExamine}>
                            <h4>{item.text.text}</h4>
                          </div>
                          <div className={styles.setLine}>
                            <div className={styles.triangleRight} />
                          </div>
                        </div>
                        {/*{item.lineData.map((itemLine,indexLine)=>{
                      return <div key={indexLine} className={styles.arrowLine}><span>{itemLine.value}</span></div>
                    })}*/}
                        <div className={styles.operation}>
                          {parseFloat(index) !== 0 ? (
                            <span className={styles.up} onClick={() => this.operation('up', index)}>
                              <img src={require('../../assets/arrow_t.png')} alt="" />
                            </span>
                          ) : null}
                          {parseFloat(index) !== initFlow.length - 1 ? (
                            <span
                              className={styles.down}
                              onClick={() => this.operation('down', index)}
                            >
                              <img src={require('../../assets/arrow_d.png')} alt="" />
                            </span>
                          ) : null}
                          <span className={styles.del} onClick={() => this.operation('del', index)}>
                            <img src={require('../../assets/delete.png')} alt="" />
                          </span>
                        </div>
                      </li>
                    );
                  }
                })
              : null}
          </ul>
          <Button type="dashed" block onClick={() => this.addNode()}>
            <Icon type="plus" /> 添加节点
          </Button>
          {/* <Button type="dashed" block onClick={() => this.addCondition()}>
            <Icon type="plus" /> 添加条件
          </Button>*/}
          {title!='审批流程设置'?<Button type="primary" block onClick={() => this.save()}>
           保存
          </Button>:null}
          {/*<Button type="default" block onClick={() => this.cancel()}>
            <Icon type="plus" /> 取消
          </Button>*/}
        </div>
        {/*<Modal
          title="条件设置"
          width={600}
          visible={visible}
          onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false })}
        >
          <div style={{ marginBottom: 20 }}>
            <Select
              defaultValue="请选择条件"
              style={{ width: 120 }}
              onChange={this.handleCondition}
            >
              <Option value="申请金额1">申请金额1</Option>
              <Option value="申请金额2">申请金额2</Option>
            </Select>
          </div>
          <Table bordered pagination={false} columns={columns} dataSource={dataFlow} />,
        </Modal>*/}
      </Card>
    );
  }
}
