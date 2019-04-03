/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Avatar, Row, Col, Tabs, Icon,Button,Popconfirm,message } from 'antd';
import styles from './style.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';
import { routerRedux } from 'dva/router';
const TabPane = Tabs.TabPane;
//自定义ICON
const MenusIcon = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_897614_kq0huhizlxe.js', // 在 iconfont.cn 自定义
});
@connect(({ processStartModel,loading }) => ({
  processStartModel,
  loading:loading.effects['processStartModel/bizObjectList']
}))
export default class processStart extends Component {
  state = {};
  componentDidMount() {

    this.bizObjectList(); //获取自定义表单数据

  }

  bizObjectList = () => { //获取自定义表单的数据
    const { dispatch } = this.props;
    dispatch({
      type: "processStartModel/bizObjectList",
      payload: {}
    }).then(() => {
      const { processStartModel } = this.props;
      console.log('this.props', processStartModel)
    })
  }
  removeForm=(id)=>{    //删除当前自定义表单
    const { dispatch } = this.props,self = this;
    dispatch({
      type: "processStartModel/removeForm",
      payload: {bizCode:id}
    }).then(() => {
      const { processStartModel:{removeStatus} } = this.props;
      console.log('this.props', this.props.processStartModel)
      if(removeStatus){
        message.success('删除成功!');
        self.bizObjectList();
      }else {
        message.error('删除失败!');
      }
    })
  }
  creatList = (data) => { //自定义表单列表

    return data.map((item, index) => {
      return <Col span={6} key={index}  className={styles.customList}>
            <div className={styles.customForm}>
              <div className={styles.operationBtn}>
                <a
                  href={item.bizStatus==0?
                    "#/processCenter/addTemplate?bizCode="+item.bizCode+'&bizName='+item.bizName+'&bizType='+item.bizType+'&id='+item.id+'&type=ADD':
                      "#/processCenter/addTemplate?bizCode="+item.bizCode+'&bizName='+item.bizName+'&id='+item.id+'&bizDesc='+item.bizDesc+'&bizType='+item.bizType+'&type=EIDT'
                  }>
                  <Icon  type="edit" theme="filled" /></a>
                <Popconfirm placement="top" title={'确认要删除审批模板么？'} onConfirm={()=>this.removeForm(item.bizCode)} okText="确定" cancelText="取消">
                  <Icon type="delete" theme="filled" />
                </Popconfirm>
              </div>
              {item.bizStatus===0?<MenusIcon type={`icon-draft`}/>:null}
              <div
                 onClick={()=>{item.bizStatus==0?message.info('您还未设置流程请继续完善流程设置!'):this.props.dispatch(routerRedux.push("/processCenter/designFormWrite?bizCode="+item.bizCode+'&bizName='+item.bizName))}}
                 className={styles.cardBox}>
                  <Row>
                    <Col span={6}>
                      <Avatar
                        size="large"
                        style={{
                          marginTop: 10,
                          fontSize: 16,
                          backgroundColor: ['#F29D39'],
                        }}
                      >
                        {item.bizName.slice(0,1)}
                    </Avatar>
                    </Col>
                    <Col span={18}>
                      <h5 style={{ fontWeight: 600,WebkitBoxOrient: 'vertical' }}>{item.bizName}</h5>
                      <p  style={{ WebkitBoxOrient: 'vertical'}}>{item.bizDesc}</p>
                    </Col>
                  </Row>
              </div>
            </div>
      </Col>
    })
  }

  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };
    const { processStartModel ,loading } = this.props;
    return (
      <PageHeaderLayout>
        <Card title={processStartModel.data} className={styles.formList} bordered={false} style={{ minWidth: 1080 }} loading={loading}>
          <Button type="primary" style={{margin:'0 10px 15px 0'}}><Link to="/processCenter/addTemplate">添加审批模板</Link></Button>
          <div className={styles.title}>
            <span>
             <MenusIcon type={`icon-business`}/>
              <b>业务</b>
            </span>
          </div>
          <Row>
            <Col span={6}>
              <div className={styles.customForm}>
              <Link to="/performance/bidApproval?tenderType=1&saveType=1"  className={styles.cardBox}>
                  <Row>
                    <Col span={6}>
                      <Avatar
                        size="large"
                        style={{ marginTop: 10, fontSize: 16, backgroundColor: ['#4B85F8'] }}
                      >
                        定
                      </Avatar>
                    </Col>
                    <Col span={18}>
                      <h5 style={{ fontWeight: 600,WebkitBoxOrient: 'vertical' }}>材料定标审批</h5>
                      <p style={{ WebkitBoxOrient: 'vertical'}}>适用于材料员向管理上级汇报投标情况并定标</p>
                    </Col>
                  </Row>
              </Link>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.customForm}>
              <Link to="/performance/bidApproval?tenderType=2&saveType=1">
                <div className={styles.cardBox}>
                  <Row>
                    <Col span={6}>
                      <Avatar
                        size="large"
                        style={{ marginTop: 10, fontSize: 16, backgroundColor: ['#4B85F8'] }}
                      >
                        定
                      </Avatar>
                    </Col>
                    <Col span={18}>
                      <h5 style={{ fontWeight: 600,WebkitBoxOrient: 'vertical' }}>劳务定标审批</h5>
                      <p  style={{ WebkitBoxOrient: 'vertical'}}>适用于材料员向管理上级汇报投标情况并定标</p>
                    </Col>
                  </Row>
                </div>
              </Link>
              </div>
            </Col>
          </Row>
          <div className={styles.title}>
            <span>
             <MenusIcon type={`icon-finance`}/>
              <b>财务</b>
            </span>
          </div>
          <Row>
            <Col span={6}>
              <div className={styles.customForm}>
              <Link to="/processCenter/payWorkflow" className={styles.cardBox}>
                  <Row>
                    <Col span={6}>
                      <Avatar
                        size="large"
                        style={{
                          marginTop: 10,
                          fontSize: 16,
                          backgroundColor: ['#F29D39'],
                        }}
                      >
                        支
                      </Avatar>
                    </Col>
                    <Col span={18}>
                      <h5 style={{ fontWeight: 600,WebkitBoxOrient: 'vertical' }}>支付审批</h5>
                      <p  style={{ WebkitBoxOrient: 'vertical'}}>适用于项目各种支出的费用申请</p>
                    </Col>
                  </Row>
              </Link>
              </div>
            </Col>
          </Row>
          {processStartModel.bizObjectList.length>0?<div className={styles.title}>
            <span >
                 <MenusIcon type={`icon-custom`}/>
                <b>自定义表单</b>
              </span>
          </div>:null}
          <Row>
          {this.creatList(processStartModel.bizObjectList)}
          </Row>
        </Card>
      </PageHeaderLayout>
    );
  }
}
