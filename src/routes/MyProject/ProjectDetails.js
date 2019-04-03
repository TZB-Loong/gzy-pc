/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Pagination, Icon, List, Button, Modal, Spin, Col, Dropdown, Menu } from 'antd';
import { Link } from 'dva/router';
import styles from './style.less';
import { url2params } from '../../Tools/util_tools';
import ViewResult from '../Common/viewFiles';
import Empty from '../Common/Empty';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { pathInquiry } from '../../../configPath';

const ListItem = List.Item;
@connect(({ myProjectModel, loading, common }) => ({
  myProjectModel,
  loading: loading.effects['myProjectModel/details'],
  common,
}))
export default class ProjectDetails extends Component {
  state = {
    previewVisible: false,
    previewImage: '',
    params: {
      projectId: url2params(this.props.location.search).id,
    },
    auditRemark: '',
  };
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'myProjectModel/details',
      payload: this.state.params,
    }).then(() => {
      let projectDetails = this.props.myProjectModel.projectDetails;
      if (projectDetails.data && projectDetails.data.auditState == 2) {
        let theData = [];
        theData = eval('(' + projectDetails.data.auditRemark + ')')
          ? eval('(' + projectDetails.data.auditRemark + ')')
          : [];
        this.setState({
          auditRemark: theData.length > 0 ? theData[theData.length - 1].auditRemark : '',
        });
      }
    });
    // console.log(this.props);
    // console.log(url2params(this.props.location.search));
    // let params= {
    //   bizCode: 'ATTACH_PROJECT_BID',
    //   bizId: url2params(this.props.location.search).id
    // };
    // this.props.dispatch({
    //   type: 'common/queryAttachList',
    //   payload: params,
    // }).then(()=>{
    //   console.log(this.props)
    // })
  }

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview(url) {
    this.setState({
      previewImage: url,
      previewVisible: true,
    });
  }

  cancelApply(id) {
    const { dispatch } = this.props;
    dispatch({
      type: 'myProjectModel/delProject',
      payload: { delProject: { action: 'revoke', projectId: id } },
      callback: () => {
        // console.log(this.props)
        // this.props.history.goBack()
        this.props.history.replace('/project/add?id=' + id);
      },
    });
    // console.log(id);
  }
  render() {
    const { previewVisible, previewImage, auditRemark } = this.state;
    var { myProjectModel, loading } = this.props;
    var { projectDetails } = myProjectModel;
    // console.log(projectDetails);
    return (
      <PageHeaderLayout>
        {projectDetails.data ? (
          <Spin spinning={loading}>
            <Card loading={loading} title="项目审核详情">
              <b style={{ fontSize: 20 }} />
              <div
                style={{ display: projectDetails.data.auditState == 2 ? null : 'none' }}
                className={`${styles.ReviewCard}`}
              >
                <div>
                  <b style={{ color: '#EE7356' }}>审核状态：审核未通过</b>
                  <div>
                    <span className={styles.t_c}>未通过原因：</span>
                    {auditRemark}
                  </div>
                  <div>
                    <span className={styles.t_c}>申请时间：</span>
                    {projectDetails.data ? projectDetails.data.auditApplyTime : ''}
                  </div>
                  <div style={{ paddingBottom: 10 }}>
                    <span className={styles.t_c}>审核时间：</span>
                    {projectDetails.data ? projectDetails.data.auditTime : ''}
                  </div>
                  <Button
                    style={{
                      backgroundColor: '#4B85F8',
                      color: '#FFFFFF',
                      borderColor: '#4B85F8',
                      marginBottom: 30,
                    }}
                    type="primary"
                    onClick={() => {
                      this.props.history.push('/project/add?id=' + projectDetails.data.id);
                    }}
                  >
                    重新申请审核
                  </Button>
                </div>
              </div>
              <div
                style={{ display: projectDetails.data.auditState == 3 ? null : 'none' }}
                className={`${styles.ReviewCard}`}
              >
                <div>
                  <b>审核状态：审核进行中</b>
                  <div>
                    审核进行中，请您耐心等待，我们的工作人员会在12小时内完成审核，审核完成之前，若信息有误请撤回修改！
                  </div>
                  <div style={{ paddingBottom: 10 }}>
                    <span className={styles.t_c}>申请时间：</span>
                    {projectDetails.data ? projectDetails.data.auditApplyTime : ''}
                  </div>

                  <Button
                    style={{
                      backgroundColor: '#4B85F8',
                      color: '#FFFFFF',
                      borderColor: '#4B85F8',
                      marginBottom: 30,
                    }}
                    type="primary"
                    onClick={() => {
                      this.cancelApply(projectDetails.data.id);
                    }}
                  >
                    撤回并修改
                  </Button>
                </div>
              </div>
              <div
                style={{ display: projectDetails.data.auditState == 1 ? null : 'none' }}
                className={`${styles.ReviewCard}`}
              >
                <div>
                  <b style={{ color: '#70C040' }}>审核状态：审核通过</b>
                  <div>恭喜您！该项目已通过审核，您已可以进行对外招标。 </div>
                  <div>
                    <span className={styles.t_c}>申请审核时间：</span>
                    {projectDetails.data ? projectDetails.data.auditApplyTime : ''}
                  </div>
                  <div style={{ paddingBottom: 10 }}>
                    <span className={styles.t_c}>审核时间：</span>
                    {projectDetails.data ? projectDetails.data.auditTime : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 30 }}>
                    <Button
                      style={{
                        backgroundColor: '#4B85F8',
                        color: '#FFFFFF',
                        borderColor: '#4B85F8',
                        marginRight: 30,
                      }}
                      type="primary"
                    >
                      <Dropdown
                        trigger={['click']}
                        overlay={
                          <Menu>
                            <Menu.Item>
                              <a
                                style={{ color: '#333' }}
                                href={
                                  '#/bid/material?projectId=' +
                                  projectDetails.data.id +
                                  '&auditState=' +
                                  projectDetails.data.auditState
                                }
                              >
                                材料招标
                              </a>
                            </Menu.Item>
                            <Menu.Item>
                              <a
                                style={{ color: '#333' }}
                                href={
                                  '#/bid/labour?projectId=' +
                                  projectDetails.data.id +
                                  '&auditState=' +
                                  projectDetails.data.auditState
                                }
                              >
                                劳务招标
                              </a>
                            </Menu.Item>
                          </Menu>
                        }
                      >
                        <a href="javascript:;">发布招标</a>
                      </Dropdown>
                    </Button>
                    <a
                      href={
                        pathInquiry +
                        '/purchase/publish?projectName=' +
                        encodeURIComponent(projectDetails.data.projectName)
                      }
                      target="_blank"
                    >
                      <Button>发布询价</Button>
                    </a>
                  </div>
                </div>
              </div>
              <div
                style={{ display: projectDetails.data.auditState == 0 ? null : 'none' }}
                className={styles.ReviewCard}
              >
                <div />
                <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: 30 }}>
                  <Button
                    style={{
                      backgroundColor: '#4B85F8',
                      color: '#FFFFFF',
                      borderColor: '#4B85F8',
                      marginLeft: 20,
                    }}
                    type="primary"
                    /*onClick={() => {
                      this.props.history.replace('/project/add?id=' + projectDetails.data.id);
                    }}*/
                    href={'#/project/add?id=' + projectDetails.data.id}
                  >
                    编辑
                  </Button>
                </div>
              </div>
              <List className={styles.projectList} style={{ width: '80%', marginLeft: '10%' }}>
                <ListItem>
                  <Col span={4}>
                    <span>项目名称：</span>
                  </Col>
                  <span>{projectDetails.data ? projectDetails.data.projectName : ''}</span>
                </ListItem>
                <ListItem>
                  <Col span={4}>
                    <span>项目地址：</span>
                  </Col>
                  <span>
                    {projectDetails.data ? projectDetails.data.provinceName : ''}
                    {projectDetails.data ? projectDetails.data.cityName : ''}
                  </span>
                </ListItem>
                <ListItem>
                  <Col span={4}>
                    <span>项目类型：</span>
                  </Col>
                  <span>{projectDetails.data ? projectDetails.data.projectClassText : ''}</span>
                </ListItem>
                <ListItem>
                  <Col span={4}>
                    <span>中标单位：</span>
                  </Col>
                  <span>{projectDetails.data ? projectDetails.data.bidCompany : ''}</span>
                </ListItem>
                <ListItem>
                  <Col span={4}>
                    <span>项目工期：</span>
                  </Col>
                  <span>
                    {projectDetails.data ? projectDetails.data.validDateStart : ''}至
                    {projectDetails.data ? projectDetails.data.validDateEnd : ''}
                  </span>
                </ListItem>
                <ListItem>
                  <Col span={4}>
                    <span style={{ minWidth: 42 }}>备注：</span>
                  </Col>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: projectDetails.data ? projectDetails.data.remark : '',
                    }}
                  />
                </ListItem>
                <ListItem>
                  <Col span={4}>
                    <div style={{ whiteSpace: 'nowrap' }}>
                      中标通知书/施工合同/开工令/承包协议书：
                    </div>
                  </Col>
                  <div style={{ marginTop: 25 }}>
                    <ViewResult
                      type={'ATTACH_PROJECT_BID'}
                      sourceData={{
                        bizCode: 'PROJECT_GROUP',
                        bizId: url2params(this.props.location.search).id,
                      }}
                    />
                  </div>
                </ListItem>
              </List>
              <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
              </Modal>
            </Card>
          </Spin>
        ) : (
          <Empty msg="项目详情" />
        )}
      </PageHeaderLayout>
    );
  }
}
