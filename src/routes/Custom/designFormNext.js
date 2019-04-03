import React, { Component } from 'react';
import { connect } from 'dva';

import {
  Card,
  Spin,
  Form,
  Button,
  Row,
  Col,
  message,
} from 'antd';
import CreatForm from './common/creatForm';
import { isfalse } from '../../Tools/util_tools';
import {getUrlParamBySearch} from '../../utils/utils'
import styles from './style.less'
import { routerRedux } from 'dva/router';
import PerformanceProgress from '../ApprovalPerformance/PerformanceProgress';
@Form.create() //链接到form
@connect(({ submForm, loading }) => ({
  submForm,
  loading: loading.effects['submForm/bizObjectMetadataCustomList'],
}))
export default class DesignFormWrite extends Component {
  state = {
    listData: [], //form 表单list
    bizCode:'',
    type:getUrlParamBySearch(window.location.href, 'type'),
    param:{
      params:"",
      collectionName:''
    }
  };
  componentDidMount() {
    this.setState({
      bizCode:getUrlParamBySearch(this.props.location.search, 'bizCode')
    },()=>{this.queryForm()})
  }
  queryForm = () => {
    //查询数据,生成表单
    const { dispatch } = this.props;
    console.log('this.props', this.props,this.state.bizCode);
    dispatch({
      type: 'submForm/bizObjectMetadataCustomList',
      payload: {bizCode:this.state.bizCode},
    }).then(() => {
      const { submForm } = this.props;
      if (!isfalse(submForm.listData)) {
        this.setState({
          listData: submForm.listData,
        });
      }
    });
  };
  saveProgress(){
    this.child.save()
  }
  onRef = (ref) => {
    this.child = ref
  };
  render() {
    const { submForm, loading } = this.props;
    const {type,bizCode} = this.state;
    return (
      <Spin spinning={loading}>
        <Card title={'审批模板—流程'+type=='EIDT'?'编辑':'设置'}
              // className={styles.designForm}
              extra={
                <div>
                  <Button type="default" style={{margin:'-10px 15px -10px'}} onClick={()=>{
                    let dataObj = "/processCenter/addTemplate?bizCode="+bizCode+
                      '&bizName='+ getUrlParamBySearch(window.location.href, 'bizName')+
                      '&bizDesc='+ (getUrlParamBySearch(window.location.href, 'bizDesc')||'')+
                      '&bizType='+ getUrlParamBySearch(window.location.href, 'bizType');
                    if(getUrlParamBySearch(window.location.href, 'id')){
                      dataObj += '&id='+getUrlParamBySearch(window.location.href, 'id')
                    }
                    this.props.dispatch(
                      routerRedux.push(dataObj));
                  }}>上一步</Button>
                  <Button type="primary"　 style={{margin:'-10px 0'}} onClick={()=>this.saveProgress()}>保存</Button>
                </div>
              }
        >
          <Row gutter={24}>
            <Col span={16}>
              <div className={styles.readonly}>
              <Form>
                <CreatForm formData={this.state.listData} form={this.props.form}/>
                {/*<div style={{ textAlign: 'center' }}>
                  <Button type="primary" htmlType="submit">
                    提交审批
                  </Button>
                </div>*/}
              </Form>
              </div>
            </Col>
            <Col span={8}>
              {this.state.bizCode!=''?<PerformanceProgress
                code={bizCode}
                title="审批流程设置"
                projectId={type=='EIDT'?'-1':''}
                onRef={this.onRef}
              />:null}
            </Col>
          </Row>
        </Card>
      </Spin>
    );
  }
}
