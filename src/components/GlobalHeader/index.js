/*eslint-disable*/
import React, { PureComponent } from 'react';
import { Menu, Icon, Spin, Tag, Dropdown, Avatar, Divider, Tooltip } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import groupBy from 'lodash/groupBy';
import Debounce from 'lodash-decorators/debounce';
import { Link } from 'dva/router';
import NoticeIcon from '../NoticeIcon';
import { returnUrlBoot, pathTender, resourceUrl } from '../../../configPath';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';
import { isAuth } from '../../utils/utils';
@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/logout'],
}))
export default class GlobalHeader extends PureComponent {
  state = {
    username: '',
    userPic: '',
  };
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }
  componentDidMount() {
    let user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      this.setState({
        username: user.username,
        userPic: user.userPic,
      });
    }
  }
  getNoticeData() {
    const { notices } = this.props;
    if (notices == null || notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };
  /* eslint-disable*/
  @Debounce(600)
  triggerResizeEvent() {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  loginOut() {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/logout',
      payload: this.state.paramsAsk,
    }).then(() => {
      const { loginOutStatus } = this.props.login;
      if (loginOutStatus) {
        sessionStorage.clear();
        let keys = document.cookie.match(/[^ =;]+(?=\=)/g);
        if (keys) {
          for (let i = keys.length; i--; )
            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
        }
        window.location.href = returnUrlBoot;
      }
    });
  }
  render() {
    const {
      currentUser = {},
      collapsed,
      fetchingNotices,
      isMobile,
      logo,
      onNoticeVisibleChange,
      onMenuClick,
      onNoticeClear,
    } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item>
          <Link to="/account/companyInformation">
            <img
              src={require('../../assets/company.png')}
              alt="logo"
              style={{ width: 14, marginRight: 8 }}
            />
            公司信息
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/account/basicInformation">
            <img
              src={require('../../assets/user.png')}
              alt="logo"
              style={{ width: 14, marginRight: 8 }}
            />
            基本信息
          </Link>
        </Menu.Item>
        {/*<Menu.Item key="triggerError">*/}
        <Menu.Item>
          <Link to="/account/child">
            <img
              src={require('../../assets/child.png')}
              alt="logo"
              style={{ width: 14, marginRight: 8 }}
            />
            账号管理
          </Link>
        </Menu.Item>
        {isAuth('account_setting') ? (
          <Menu.Item>
            <Link to="/account/seetings">
              <Icon style={{ color: '#000' }} type="setting" />
              权限管理
            </Link>
          </Menu.Item>
        ) : null}
        <Menu.Divider />
        <Menu.Item onClick={e => this.loginOut()}>
          <Icon type="logout" />
          退出登录
        </Menu.Item>
      </Menu>
    );
    const noticeData = this.getNoticeData();
    return (
      <div className={styles.header}>
        {isMobile && [
          <Link to="/" className={styles.logo} key="logo">
            <img src={logo} alt="logo" width="32" />
          </Link>,
          <Divider type="vertical" key="line" />,
        ]}
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        <div className={styles.right}>
          <a style={{ fontSize: 16 }} className={styles.action} href={pathTender} target="_black">
            公装云首页
          </a>
          <a className={styles.action} style={{ fontSize: 16 }} href={resourceUrl} target="_blank">
            支持与服务
          </a>
          {/*<HeaderSearch
            className={`${styles.action} ${styles.search}`}
            placeholder="站内搜索"
            dataSource={['搜索提示一', '搜索提示二', '搜索提示三']}
            onSearch={value => {
              console.log('input', value); // eslint-disable-line
            }}
            onPressEnter={value => {
              console.log('enter', value); // eslint-disable-line
            }}
          />*/}
          {/*<Tooltip title="使用文档">
            <a
              target="_blank"
              href="http://pro.ant.design/docs/getting-started"
              rel="noopener noreferrer"
              className={styles.action}
            >
              <Icon type="question-circle-o" />
            </a>
          </Tooltip>*/}
          <NoticeIcon
            className={styles.action}
            //count={currentUser.notifyCount}
            onItemClick={(item, tabProps) => {
              console.log(item, tabProps); // eslint-disable-line
            }}
            onClear={onNoticeClear}
            onPopupVisibleChange={onNoticeVisibleChange}
            popupAlign={{ offset: [20, -16] }}
          >
            <NoticeIcon.Tab
              list={noticeData['通知']}
              title="通知"
              emptyText="你已查看所有通知"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
            />
            <NoticeIcon.Tab
              list={noticeData['消息']}
              title="消息"
              emptyText="您已读完所有消息"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
            />
            <NoticeIcon.Tab
              list={noticeData['待办']}
              title="待办"
              emptyText="你已完成所有待办"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg"
            />
          </NoticeIcon>
          {/* {currentUser.name ?  */}

          <Dropdown overlay={menu}>
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar size="large" className={styles.avatar} src={this.state.userPic} />
              <span className={styles.name}>{this.state.username}</span>
              <Icon style={{ fontSize: 20, marginLeft: 5 }} type="down" />
            </span>
          </Dropdown>

          {/* : (
            <Spin size="small" style={{ marginLeft: 8 }} />
          )} */}
        </div>
      </div>
    );
  }
}
