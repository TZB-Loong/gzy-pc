import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Card, Row, Col, Tree, List, Spin, Input, Icon } from 'antd';
import { isfalse } from '../../Tools/util_tools';

const TreeNode = Tree.TreeNode;
@connect(({ staffManagement, loading }) => ({
  staffManagement,
  loading: loading.effects['staffManagement/queryCorpUsersAndRoles'],
}))

/**
 * 参数说明
 * @param {string} companyName  公司名称 在只选择角色时,不需要传入(选择人员时必须传入)
 * @param {string} modalTitle 弹出框title 必需
 * @param {object} defaultValues 默认选中的值 其中 roleId,userId 必需为string
 * @param {function} onOk  弹框确定时响应的函数
 * @param {string} type 显示类别 users roles
 * @param {boolean} radio true单选 false 多选
 * @param {string} projectId 项目Id(只选择公司人员)
 * @param {string} placeholder 提示文字
 * @param {object} default //自定义表单默认值
 */
export default class StaffChange extends Component {
  state = {
    visible: false,
    ListData: [], //列表里面的数据
    checkedKeys: [], //选中
    userTreeData: [], //人员数据源
    rolesTreeData: [], //角色数据源
    current: 'users', //人员 角色视图切换
    userscheckable: [], //人员选中key
    rolescheckable: [], //角色选中key
    defaultValue: '', //默认值
    isUpdata:true,
    tabListNoTitle: [
      {
        key: 'users',
        tab: '人员',
      },
      {
        key: 'roles',
        tab: '角色',
      },
    ],
    companyName: '公司名称',
  };

  componentDidMount() {
    //默认值与要显示的值
    let defaultValue = isfalse(this.props.defaultValues) ? [] : this.props.defaultValues;
    let defaultValueUsers = isfalse(defaultValue.users) ? [] : defaultValue.users;
    let defaultValueRoles = isfalse(defaultValue.roles) ? [] : defaultValue.roles;
    let ListData = [],
      userscheckable = [],
      rolescheckable = []; //默认列表里的值
    let source = defaultValueUsers.concat(defaultValueRoles);

    if (!isfalse(source)) {
      source.map(defSource => {
        ListData.push({
          title: isfalse(defSource.roleName) ? defSource.nickName : defSource.roleName,
          key: isfalse(defSource.roleId) ? defSource.userId : defSource.roleId,
        });
        if (!isfalse(defSource.userId)) {
          userscheckable.push(defSource.userId);
        }
        if (!isfalse(defSource.roleId)) {
          rolescheckable.push(defSource.roleId);
        }
      });
    }

    this.setState(
      {
        ListData,
        userscheckable,
        rolescheckable,
        current: isfalse(this.props.type) ? 'users' : this.props.type,
      },
      () => this.inputValue(this.state.ListData)
    );
  }

  inputValue = ListData => {
    //修改输入框里面的值
    let showText = [];

    ListData.map(list => {
      showText.push(list.title);
    });

    this.setState({
      defaultValue: isfalse(showText) ? (isfalse(this.props.placeholder)?'暂无设置,请进行人员权限调整':this.props.placeholder) : showText.toString(),
    });
  };

  componentWillUpdate(nextProps) {
    //当请求完成之后再次渲染视图

    if (nextProps.loading != this.props.loading) {
      const { staffManagement } = this.props;
      if (!isfalse(staffManagement.staff)) {
        let roles = staffManagement.staff.roles,
          users = staffManagement.staff.users;

        let userTreeData = [
            // {
            //   title: isfalse(this.props.companyName)
            //     ? this.state.companyName
            //     : this.props.companyName,
            //   key: isfalse(this.props.companyName)
            //     ? this.state.companyName
            //     : this.props.companyName,
            //   children: [],
            // },
          ],
          rolesTreeData = [];
        if (!isfalse(users)) {
          users.map(user => {
            //角色数据格式
            // userTreeData[0].children.push({
            //   title: user.displayName,
            //   key: user.userId,
            // });
            userTreeData.push({
              title: user.displayName,
              key: user.userId,
            })
          });
        }
        if (!isfalse(roles)) {
          roles.map(role => {
            rolesTreeData.push({
              title: role.roleName,
              key: role.roleId,
            });
          });
        }

        this.setState(
          {
            userTreeData,
            rolesTreeData,
          },
          () =>
            this.setState({
              checkedKeys:
                this.state.current == 'roles'
                  ? this.state.rolescheckable
                  : this.state.userscheckable,
            })
        );
      }
    }
  }

  queryCorpUsersAndRoles = () => {
    //进行数据请求
    const { dispatch } = this.props;
    dispatch({
      type: 'staffManagement/queryCorpUsersAndRoles',
      payload: { projectId: this.props.projectId },
    });
  };

  showModal = () => {
    //显示弹框
    this.queryCorpUsersAndRoles();
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    //弹框确定按钮响应函数

    let roleIds = this.state.rolescheckable,
      userIds = this.state.userscheckable,
      displayName = [];

    this.state.ListData.map(name => {
      displayName.push(name.title);
    });
    // console.log('userIds');
    // console.log(userIds);
    let returnData;
    if (isfalse(this.props.type)) {
      returnData = {
        roleIds: roleIds.toString(),
        userIds: userIds.toString(),
        displayName: displayName.toString(),
      };
    } else {
      if (this.props.type == 'users') {
        returnData = {
          userIds: userIds.toString(),
          displayName: displayName.toString(),
        };
      } else if (this.props.type == 'roles') {
        returnData = {
          roleIds: roleIds.toString(),
          displayName: displayName.toString(),
        };
      }
    }

    if (!isfalse(this.props.onOk)) {
      //返回到父组件的参数(执行传过来的函数)
      this.props.onOk(JSON.stringify(returnData));
    }

    this.setState(
      {
        visible: false,
      },
      () => this.inputValue(this.state.ListData)
    );
  };

  handleCancel = e => {
    //取消按钮响应函数

    this.setState({
      visible: false,
    });
  };

  onCheck = (checkedKeys, info) => {
    //复选框选中 响应函数

    let userscheckable = this.state.userscheckable,
      rolescheckable = this.state.rolescheckable;
    let oldcheckedKeys = this.state.checkedKeys,
      newcheckedKeys = [];

    if (isfalse(this.props.radio)) {
      newcheckedKeys = checkedKeys;
    } else {
      if (this.props.radio) {
        checkedKeys.map(item => {
          if (oldcheckedKeys.indexOf(item) == -1) {
            newcheckedKeys.push(item);
          }
        });
      } else {
        newcheckedKeys = checkedKeys;
      }
    }

    if (this.state.current == 'users') {
      if (checkedKeys.indexOf(this.props.companyName) >= 0) {
        newcheckedKeys.splice(checkedKeys.indexOf(this.props.companyName), 1);
      }

      userscheckable = newcheckedKeys;
      this.setState({
        userscheckable: newcheckedKeys,
      });
    } else {
      rolescheckable = newcheckedKeys;
      this.setState({
        rolescheckable: newcheckedKeys,
      });
    }

    let source = [];
    // this.state.userTreeData[0].children.map(item => {
    //   for (var j in userscheckable) {
    //     if (item.key == userscheckable[j]) {
    //       source.push({
    //         title: item.title,
    //         key: item.key,
    //       });
    //     }
    //   }
    // });
    this.state.userTreeData.map(item => {
      for (var j in userscheckable) {
        if (item.key == userscheckable[j]) {
          source.push({
            title: item.title,
            key: item.key,
          });
        }
      }
    })

    this.state.rolesTreeData.map(role => {
      for (var i in rolescheckable) {
        if (role.key == rolescheckable[i]) {
          source.push({
            title: role.title,
            key: role.key,
          });
        }
      }
    });

    this.setState({
      //更新选中状态以及列表数据
      checkedKeys: newcheckedKeys,
      ListData: source,
    });
  };

  handleClick = key => {
    //切换table 响应函数
    this.setState({
      current: key,
      checkedKeys: key == 'roles' ? this.state.rolescheckable : this.state.userscheckable,
    });
  };

  edit = (data, index) => {
    //右侧列表删除响应函数

    /**
     * 删除单条已选中的数据
     * 清除选中的标记
     */

    let chageListData = [...this.state.ListData],
      userscheckable = [...this.state.userscheckable],
      rolescheckable = [...this.state.rolescheckable];

    chageListData.splice(index, 1); // 清除列表的数据源(删除对应的那条数据)

    if (userscheckable.indexOf(data.key + '') != -1) {
      userscheckable.splice(userscheckable.indexOf(data.key + ''), 1);
    }

    if (rolescheckable.indexOf(data.key + '') != -1) {
      rolescheckable.splice(rolescheckable.indexOf(data.key + ''), 1);
    }

    this.setState({
      checkedKeys: this.state.current == 'roles' ? rolescheckable : userscheckable,
      ListData: chageListData,
      rolescheckable: rolescheckable,
      userscheckable: userscheckable,
    });
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode
          title={item.title}
          key={item.key}
          dataRef={item}
          disableCheckbox={this.props.radio?this.props.radio:false}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  };

  tabListNoTitle = () => {
    // 头部标签
    let defaultTabListNoTitle = this.state.tabListNoTitle;

    if (isfalse(this.props.type)) {
      return defaultTabListNoTitle;
    } else {
      let children = [];
      defaultTabListNoTitle.map((item, index) => {
        if (this.props.type == item.key) {
          children.push(defaultTabListNoTitle[index]);
        }
      });
      return children;
    }
  };

  setfileList = (data) => {
    if (this.state.isUpdata) {
      let defaultValue = data;

      let defaultValueUsers = isfalse(defaultValue.users) ? [] : defaultValue.users;
      let defaultValueRoles = isfalse(defaultValue.roles) ? [] : defaultValue.roles;
      let ListData = [],
        userscheckable = [],
        rolescheckable = []; //默认列表里的值
      let source = defaultValueUsers.concat(defaultValueRoles);
      if (!isfalse(source)) {
        source.map(defSource => {
          ListData.push({
            title: isfalse(defSource.roleName) ? defSource.nickName : defSource.roleName,
            key: isfalse(defSource.roleId) ? defSource.userId : defSource.roleId,
          });
          if (!isfalse(defSource.userId)) {
            userscheckable.push(defSource.userId);
          }
          if (!isfalse(defSource.roleId)) {
            rolescheckable.push(defSource.roleId);
          }
        });
      }
      this.setState(
        {
          ListData,
          userscheckable,
          rolescheckable,
          isUpdata:false,
          current: isfalse(this.props.type) ? 'users' : this.props.type,
        },
        () => this.inputValue(this.state.ListData)
      );
    }
  }

  render() {
    let _this = this;
    if (!isfalse(this.props.default)) {
      this.setfileList(this.props.default)
    }
    const { loading } = this.props;
    return (
      <div>
        <div onClick={this.showModal}>
        <Input
          addonAfter={<Icon type="setting" />}
          value={this.state.defaultValue}
          disabled={true}
        />
        </div>
        <Modal
          title={this.props.modalTitle}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={700}
        >
          <Spin spinning={loading}>
            <Row>
              <Col span={12}>
                <Card
                  style={{ width: 300, height: 400, overflowX: 'auto' }}
                  tabList={this.tabListNoTitle()}
                  activeTabKey={this.state.current}
                  onTabChange={this.handleClick}
                >
                  <Tree
                    checkable
                    // defaultExpandAll={true}
                    onCheck={this.onCheck}
                    checkedKeys={this.state.checkedKeys}
                    // defaultExpandParent={false}
                  >
                    {this.state.current == 'users'
                      ? this.renderTreeNodes(this.state.userTreeData)
                      : this.renderTreeNodes(this.state.rolesTreeData)}
                  </Tree>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  title={
                    <span>
                      已选
                      {isfalse(this.state.ListData) ? null : '(' + this.state.ListData.length + ')'}
                    </span>
                  }
                  extra={
                    <a
                      onClick={e =>
                        this.setState({
                          ListData: [],
                          userscheckable: [],
                          rolescheckable: [],
                          checkedKeys: [],
                        })
                      }
                    >
                      清空
                    </a>
                  }
                  style={{ width: 310, height: 400, overflowX: 'auto' }}
                >
                  <List
                    size="small"
                    dataSource={this.state.ListData}
                    renderItem={(item, index) => (
                      <List.Item actions={[<a onClick={e => _this.edit(item, index)}>删除</a>]}>
                        <List.Item.Meta title={<span>{item.title}</span>} />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </Spin>
        </Modal>
      </div>
    );
  }
}
