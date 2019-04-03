/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Spin,
  Layout,
  Table,
  Button,
  Checkbox,
  List,
  Popover,
  Icon,
  Input,
  message,
} from 'antd';
import styles from './style.less';
import Empty from '../Common/Empty';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
const { Header, Footer, Sider } = Layout;
const CheckboxGroup = Checkbox.Group;
@connect(({ authoritySettings, loading }) => ({
  authoritySettings,
  loading: loading.effects['authoritySettings/queryRoles'],
}))
export default class MyAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      header: '',
      plainOptions: [
        {
          title: '项目管理',
          menuId: [],
          author: ['创建项目', '删除项目', '申请审核', '权限设置'],
          checkedList: [],
          selectMenuIds: [],
          checkAll: false,
        },
      ],
      columns: [
        {
          title: '操作对象',
          width: 180,
          dataIndex: 'operation',
          render: text => <span style={{ color: '#1890ff' }}>{text}</span>,
        },
        {
          title: '权限',
          dataIndex: 'authority',
          // width:380,
          render: text => <span>{text}</span>,
        },
        /*{
          title: '全选',
          dataIndex: 'allSelect',
        },*/
      ],
      count: 0,
      addRole: false,
      menuData: [],
    };
  }

  componentDidMount() {
    this.initTable();
    this.initRoles();
  }

  //初始化部门列表 this.author.map((item,index)=>{this.checkedList[index]})
  initRoles() {
    const { dispatch } = this.props;
    dispatch({
      type: 'authoritySettings/queryRoles',
      payload: this.state.params,
    }).then(() => {
      const {
        authoritySettings: { Roles },
      } = this.props;
      let newMenuData = [];
      if (Roles.length > 0) {
        Roles.map(item => {
          newMenuData.push({
            title: item.roleName,
            id: item.roleId,
            isRemove: item.roleCode=='admin'||item.roleCode=='boss'||item.roleCode=='normalPerson',
            isRename: false,
            edit: true,
          });
        });
        this.initAuthority(Roles[0].roleId);
        this.setState({
          header: Roles.length > 0 ? Roles[0].roleName : '',
          roleId: Roles.length > 0 ? Roles[0].roleId : '',
          menuData: newMenuData,
        });
      }
    });
  }

  //初始化表格
  initTable() {
    let sourceData = [],
      data = this.state.plainOptions;
    const {header} = this.state;
    data.map((item, index) => {
      sourceData.push({
        key: index + 1,
        operation: item.title,
        authority: (
          <div>
            <CheckboxGroup
              disabled={header=='管理员'}
              options={item.author}
              value={item.checkedList}
              onChange={list => this.onChange(list, index)}
            />
          </div>
        ),
        allSelect: (
          <Checkbox checked={item.checkAll} onChange={e => this.onCheckAllChange(e, index)} />
        ),
      });
    });
    this.setState({
      data: sourceData,
    });
  }

  //初始化权限列表
  initAuthority = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'authoritySettings/queryRoleMenus',
      payload: {
        roleId: id,
      },
    }).then(() => {
      const {
        authoritySettings: { roleAuthority },
      } = this.props;
      let arrays = [];
      roleAuthority.roleMenus.map(item => {
        let childrenArray = [],
          checkedList = [],
          ids = [],
          selectIds = [];
        item.children.map(childrenItem => {
          childrenArray.push(childrenItem.name);
          ids.push(childrenItem.menuId);
          if (childrenItem.checked) {
            selectIds.push(childrenItem.menuId);
            checkedList.push(childrenItem.name);
          }
        });
        arrays.push({
          title: item.name,
          author: childrenArray,
          checkedList: checkedList,
          selectMenuIds: selectIds,
          menuId: ids,
          parentId: item.menuId,
          checkAll:
            childrenArray.length === 0 ? false : childrenArray.length === checkedList.length,
        });
      });
      this.setState(
        {
          plainOptions: arrays,
          count: roleAuthority.userCount,
        },
        () => {
          this.initTable();
        }
      );
    });
  };
  onChange = (checkedLists, index) => {
    let listIndex = this.state.plainOptions,
      MenuIds = [];
    listIndex[index].author.map((item, _index) => {
      checkedLists.map(checkedItem => {
        if (item === checkedItem) {
          MenuIds.push(listIndex[index].menuId[_index]);
        }
      });
    });
    listIndex[index] = Object.assign({}, listIndex[index], {
      checkedList: checkedLists,
      selectMenuIds: MenuIds,
      checkAll: checkedLists.length === listIndex[index].author.length,
    });
    this.setState(
      {
        plainOptions: listIndex,
      },
      () => {
        this.initTable();
      }
    );
  };
  //全选
  onCheckAllChange = (e, index) => {
    let listIndex = this.state.plainOptions,
      MenuIds = [];
    listIndex[index] = Object.assign({}, listIndex[index], {
      checkedList: e.target.checked ? listIndex[index].author : [],
      checkAll: e.target.checked,
      selectMenuIds: e.target.checked ? listIndex[index].menuId : [],
    });
    this.setState(
      {
        plainOptions: listIndex,
      },
      () => {
        // console.log(this.state.plainOptions);
        this.initTable();
      }
    );
  };
  //改变状态编辑
  changeStatus = index => {
    let listIndex = this.state.menuData;
    listIndex[index] = Object.assign({}, listIndex[index], {
      isRename: !listIndex[index].isRename,
    });
    return listIndex;
  };
  //获取对应权限
  onChangeRole = (title, id) => {
    this.setState({
      header: title,
      roleId: id,
    });

    this.initAuthority(id);
  };
  //
  //点击重命名
  reName = index => {
    this.setState(
      {
        menuData: this.changeStatus(index),
        addRole: false,
      },
      () => {
        const { input } = this.inputRef;
        input.focus();
      }
    );
  };
  //保存修改
  saveRole = index => {
    const { input } = this.inputRef,
      that = this,
      { dispatch } = this.props,
      { menuData } = this.state;
    let id = '';
    if (input.value === '') {
      message.warning('角色名称不能为空!');
      input.focus();
      return false;
    }
    for (let i = 0; menuData.length > i; i++) {
      if (menuData[i].title === input.value && i !== index) {
        message.warning('该角色已存在!');
        input.focus();
        return false;
      }
    }
    if (index) {
      this.setState({
        menuData: this.changeStatus(index),
      });
      if (input.value === menuData[index].title) {
        return false;
      }
      id = this.state.menuData[index].id;
    } else {
      this.setState({
        addRole: false,
      });
    }
    dispatch({
      type: 'authoritySettings/saveRole',
      payload: {
        roleName: input.value,
        roleId: id,
      },
    }).then(() => {
      const {
        authoritySettings: { saveStatus },
      } = this.props;
      if (saveStatus) {
        that.initRoles();
        message.success('保存成功!');
      }
    });
  };
  deleteRole = index => {
    const that = this,
      { dispatch } = this.props,
      { menuData } = this.state;
    let id = menuData[index].id;
    dispatch({
      type: 'authoritySettings/deleteRole',
      payload: {
        roleId: id,
      },
    }).then(() => {
      const {
        authoritySettings: { saveStatus },
      } = this.props;
      if (saveStatus) {
        that.initRoles();
        that.changeStatus(index);
        message.success('删除成功!');
      }
    });
  };
  save = () => {
    const that = this,
      { dispatch } = this.props,
      { plainOptions, roleId } = this.state;
    let selectArray = [];
    plainOptions.map(item => {
      selectArray = selectArray.concat(item.selectMenuIds);
      if (item.selectMenuIds.length > 0) {
        selectArray.push(item.parentId);
      }
    });
    dispatch({
      type: 'authoritySettings/saveAuthority',
      payload: {
        roleId: roleId,
        menuIds: selectArray.toString(),
      },
    }).then(() => {
      const {
        authoritySettings: { saveStatus },
      } = this.props;
      if (saveStatus) {
        // that.initRoles();
        message.success('保存成功!');
      }
    });
  };

  render() {
    const { authoritySettings, loading } = this.props;
    const { menuData, count, header, roleId } = this.state;
    return (
      <PageHeaderLayout>
        <Spin spinning={loading}>
          <Card title={authoritySettings.title}>
            {authoritySettings.Roles.length > 0 ? (
              <Layout style={{ backgroundColor: '#fff' }}>
                <Sider style={{ backgroundColor: '#fff' }}>
                  <List
                    size="large"
                    header={<div>角色</div>}
                    bordered
                    dataSource={menuData}
                    renderItem={(item, index) => (
                      <List.Item
                        className={roleId === item.id ? styles.active : ''}
                        onClick={() => this.onChangeRole(item.title, item.id)}
                      >
                        {item.edit ? (
                          <div className={styles.branch}>
                            {item.isRename ? (
                              <Input
                                ref={input => {
                                  this.inputRef = input;
                                }}
                                onBlur={() => this.saveRole(index)}
                                defaultValue={item.title}
                              />
                            ) : (
                              item.title
                            )}
                            {!item.isRename&&!item.isRemove ? (
                              <Popover
                                placement="rightTop"
                                title={'操作'}
                                className={styles.customList}
                                content={
                                  <div>
                                    <p onClick={() => this.reName(index)}>重命名</p>
                                    <p onClick={() => this.deleteRole(index)}>删除</p>
                                  </div>
                                }
                                trigger="click"
                              >
                                <Icon type="caret-down" />
                              </Popover>
                            ) : null}
                          </div>
                        ) : (
                          item.title + index
                        )}
                      </List.Item>
                    )}
                  />

                  {this.state.addRole ? (
                    <div className={styles.addRole}>
                      <Input
                        ref={input => {
                          this.inputRef = input;
                        }}
                      />
                      <div className={styles.buttons}>
                        <Button type="primary" onClick={() => this.saveRole(null)}>
                          确认
                        </Button>
                        <Button
                          onClick={() => {
                            this.setState({ addRole: false });
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="dashed"
                      onClick={() => {
                        this.setState({ addRole: !this.state.addRole });
                      }}
                      style={{ width: '100%' }}
                    >
                      <Icon type="plus" /> 添加角色
                    </Button>
                  )}
                </Sider>
                <Layout style={{ backgroundColor: '#fff', marginLeft: '40px' }}>
                  <Header>
                    {header}
                    <span style={{ float: 'right' }}>
                      部门角色（
                      {count}
                      人）
                    </span>
                  </Header>

                  <Table
                    columns={this.state.columns}
                    bordered
                    rowKey={(re, index) => index}
                    dataSource={this.state.data}
                    pagination={false}
                  />
                  {this.state.header!='管理员'?
                    <Footer style={{ textAlign: 'center', backgroundColor: '#fff' }}>
                      <Button type="primary" size="large" onClick={this.save}>
                        保存
                      </Button>
                    </Footer>:null}
                </Layout>
              </Layout>
            ) : (
              <Empty msg="角色" />
            )}
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
