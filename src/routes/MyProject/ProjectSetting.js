/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Table,
  List,
  Avatar,
  Button,
  Input,
  Spin,
  Row,
  Col,
  Radio,
  Divider,
  Pagination,
  Tabs,
  message,
} from 'antd';
import styles from './style.less';
import Empty from '../Common/Empty';
import PerformanceProgress from '../ApprovalPerformance/PerformanceProgress';
import { isfalse } from '../../Tools/util_tools';
import { url2params } from '../../Tools/util_tools';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const ListItem = List.Item;

@connect(({ myProjectModel }) => ({
  myProjectModel,
}))
export default class ProjectSetting extends Component {
  state = {
    searchText: '',
    loading: false,
    currentStatus: 0,
    totalPages: 0,
    action: '1',
    params: {
      projectId: url2params(this.props.location.search).id || '',
    },
    memberList: [],
  };

  // 请求列表数据
  getProjectMemberList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'myProjectModel/ProjectMember',
      payload: this.state.params,
    }).then(() => {
      let { ProjectMemberList } = this.props.myProjectModel;
      if (ProjectMemberList.data) {
        // console.log(ProjectMemberList);
        this.setState({ memberList: ProjectMemberList.data });
      }
    });
  }

  componentDidMount() {
    this.getProjectMemberList();
  }
  saveProjectMember(item) {
    // console.log(item);
    const { dispatch } = this.props;
    // let bodyData = {
    //   projectId: 269,
    //   userId: 747,
    //   action: 'add'
    // }
    let bodyData = {
      projectId: Number(url2params(this.props.location.search).id),
      userId: item.userId,
      action: item.isPermissions == 1 ? 'revoke' : 'add',
    };
    dispatch({
      type: 'myProjectModel/saveProjectMember',
      payload: bodyData,
    }).then(() => {
      // console.log(this.props.myProjectModel.ProjectMemberStatus.status);
      if (this.props.myProjectModel.ProjectMemberStatus.status == '200') {
        this.getProjectMemberList();
        if (item.isPermissions == 1) {
          message.warning('移除项目成功，该成员不能再操作本项目！');
        } else {
          message.success('成功加入项目，该成员已拥有操作本项目的权限');
        }
      }
    });
  }
  tabChange = key => {
    this.setState({
      action: key,
    });
  };
  render() {
    let _this = this;
    const { myProjectModel } = this.props;
    let { ProjectMemberList } = myProjectModel;
    let { currentStatus, memberList, params } = this.state;
    return (
      <PageHeaderLayout>
        <Card title="项目设置">
          <div style={{ width: '80%', marginLeft: '5%' }} className={styles.projectFlow}>
            <div style={{ padding: 15, border: '1px solid #E0E0E0', marginBottom: 40 }}>
              <div>
                <span className={styles.t_c}>项目名称：</span>
                <span>{url2params(this.props.location.search).projectName}</span>
              </div>
              <div>
                <span className={styles.t_c}>发标数量：</span>
                <span>{url2params(this.props.location.search).tenderNum}</span>
              </div>
              <div>
                <span className={styles.t_c}>创建时间：</span>
                <span>{url2params(this.props.location.search).addTime}</span>
              </div>
            </div>
            <Tabs type="card" onChange={this.tabChange}>
              <TabPane tab="项目人员设置" key="1">
                <Card>
                  {memberList.length > 0 ? (
                    <List>
                      {memberList.map(function(item, index) {
                        return (
                          <ListItem key={index}>
                            <Col span={12}>
                              <span>
                                {item.nickName}
                                &nbsp;
                              </span>
                              (
                              {item.mainAccount == 1 ? (
                                <span style={{ color: '#333333' }}>主账号</span>
                              ) : item.postStatus == 0 ? (
                                <span style={{ color: '#70C040' }}>启用</span>
                              ) : (
                                <sapn style={{ color: '#EE7356' }}>禁用</sapn>
                              )}
                              )
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              {item.mainAccount == 1 ? null : item.isPermissions == 1 ? (
                                <a
                                  onClick={() => {
                                    _this.saveProjectMember(item);
                                  }}
                                >
                                  移除
                                </a>
                              ) : item.postStatus == 0 ? (
                                <a
                                  onClick={() => {
                                    _this.saveProjectMember(item);
                                  }}
                                >
                                  加入
                                </a>
                              ) : null}
                            </Col>
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Empty msg={'项目人员'} />
                  )}
                </Card>
              </TabPane>
              <TabPane tab="定标审批设置" key="2" forceRender={false}>
                {this.state.action == '2' ? (
                  <PerformanceProgress
                    code={'approval'}
                    title=""
                    actionTab={this.state.action}
                    projectId={params.projectId}
                  />
                ) : null}
              </TabPane>
              <TabPane tab="支付审批设置" key="3" forceRender={false}>
                {this.state.action == '3' ? (
                  <PerformanceProgress
                    code={'payment'}
                    title=""
                    actionTab={this.state.action}
                    projectId={params.projectId}
                  />
                ) : null}
              </TabPane>
            </Tabs>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
