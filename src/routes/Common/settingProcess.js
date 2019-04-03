/**
 * 在提交审批返回 2100 设置审批流程的人
 */

/**
 * code={'approval'||'payment'}   @param {string} code  定标审批人员设置  支付审批人员设置
 * projectId=''                   @param {string} projectId 中标ID
 *  visible=true                  @param {string} visible 弹框是否显示
 */

import { Modal, Button, Icon, Col } from 'antd';
import React, { Component } from 'react';
import PerformanceProgress from '../ApprovalPerformance/PerformanceProgress';
import { isfalse } from '../../Tools/util_tools';
export default class SettingProcess extends Component {
  state = {
    visible: false,
    projectId: '',
    progress: false, //流程设置内容是否显示
  };
  showModal = () => {
    let that = this.props.that;
    that.setState({
      visible: true,
    });
  };
  componentDidMount() {
    console.log(this.props);
    // this.setState({
    //   projectId:this.props.projectId,
    //   visible:isfalse(this.props.visible)?false:this.props.visible,
    //   code:isfalse(this.props.code)?'approval':this.props.code
    // })
  }
  // componentWillReceiveProps(nextProps) {
  //   console.log(nextProps)
  //   this.setState({
  //     projectId:nextProps.projectId,
  //     visible:isfalse(nextProps.visible)?false:nextProps.visible,
  //     code:isfalse(nextProps.code)?'approval':nextProps.code,
  //   })
  // }
  handleOk = e => {
    let that = this.props.that;
    /**
     * 区分类型  第一次确定时:打开设置的流程
     *   第二次确定时:关闭modal
     *
     */
    console.log(e);
    if (that.state.progress) {
      that.setState(
        {
          visible: false,
        },
        () =>
          that.setState({
            progress: false,
          })
      );
    } else {
      that.setState({
        progress: true,
      });
    }
  };

  handleCancel = e => {
    let that = this.props.that;
    console.log(e);
    that.setState(
      {
        visible: false,
      },
      () =>
        that.setState({
          progress: false,
        })
    );
  };

  render() {
    console.log(this.state.visible, 'Modal-this.state.visible');
    let that = this.props.that;
    return (
      <div>
        {/* <Button type="primary" onClick={this.showModal}>
          Open Modal
        </Button> */}
        <Modal
          // title="Basic Modal"
          visible={that.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={800}
          zIndex={7}
          okText={that.state.progress ? '确定' : '去设置'}
        >
          {that.state.progress ? (
            <PerformanceProgress code={'approval'} title="" projectId={that.state.projectId} />
          ) : (
            <Col
              style={{
                height: '300px',
                textAlign: 'center',
                color: '#999',
                paddingTop: '100px',
                fontSize: 16,
              }}
            >
              <Icon
                type="exclamation-circle"
                theme="outlined"
                style={{ color: 'gold', fontSize: '20px', verticalAlign: 'middle' }}
              />
              &nbsp;&nbsp;流程未定义或者节点没有有效的处理人。
              <br /> 是否现在去设置？
            </Col>
          )}
        </Modal>
      </div>
    );
  }
}
