/*eslint-disable*/
import React, { PureComponent } from 'react';
import { Popover, Icon, Tabs, Badge, Spin } from 'antd';
import classNames from 'classnames';
import List from './NoticeList';
import styles from './index.less';
import Information from '../../routes/InformationCenter/Information';
import { connect } from 'dva';

const { TabPane } = Tabs;
@connect(({ informationCenterModel }) => ({
  informationCenterModel,
}))
export default class NoticeIcon extends PureComponent {
  static Tab = TabPane;

  static defaultProps = {
    onItemClick: () => {},
    onPopupVisibleChange: () => {},
    onTabChange: () => {},
    onClear: () => {},
    loading: false,
    locale: {
      emptyText: '暂无数据',
      clear: '清空',
    },
    emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
  };

  constructor(props) {
    super(props);
    this.state = {
      countStatus: false,
    };
    if (props.children && props.children[0]) {
      this.state.tabType = props.children[0].props.title;
    }
  }
  // 消息数据请求
  messageList() {
    const { dispatch } = this.props;
    let _this = this;

    dispatch({
      type: 'informationCenterModel/messageList',
      payload: {
        type: '',
        current: 1,
        size: 10,
      },
    }).then(() => {
      let { messageList } = this.props.informationCenterModel;
      if (messageList && messageList.records) {
        messageList.records.map((item, index) => {
          if (item.messageStatus != 1) {
            _this.countStatus();
            return;
          }
        });
      }
    });
  }
  componentDidMount() {
    this.messageList();
  }

  onItemClick = (item, tabProps) => {
    const { onItemClick } = this.props;
    onItemClick(item, tabProps);
  };

  onTabChange = tabType => {
    this.setState({ tabType });
    const { onTabChange } = this.props;
    onTabChange(tabType);
  };

  getNotificationBox() {
    const { children, loading, locale, onClear } = this.props;
    if (!children) {
      return null;
    }
    const panes = React.Children.map(children, child => {
      const title =
        child.props.list && child.props.list.length > 0
          ? `${child.props.title} (${child.props.list.length})`
          : child.props.title;
      return (
        <TabPane tab={title} key={child.props.title}>
          <List
            {...child.props}
            data={child.props.list}
            onClick={item => this.onItemClick(item, child.props)}
            onClear={() => onClear(child.props.title)}
            title={child.props.title}
            locale={locale}
          />
        </TabPane>
      );
    });
    return (
      <Spin spinning={loading} delay={0}>
        <Tabs className={styles.tabs} onChange={this.onTabChange}>
          {panes}
        </Tabs>
      </Spin>
    );
  }
  countStatus() {
    this.setState({
      countStatus: true,
    });
  }
  countStatusFalse() {
    this.setState({
      countStatus: false,
    });
  }

  render() {
    const { className, count, popupAlign, onPopupVisibleChange, popupVisible } = this.props;
    const noticeButtonClass = classNames(className, styles.noticeButton);
    const notificationBox = this.getNotificationBox();
    const trigger = (
      <span className={noticeButtonClass}>
        <Badge style={{ backgroundColor: '#EF9D37' }} count={count} className={styles.badge}>
          <Badge dot={this.state.countStatus}>
            <Icon type="bell" className={styles.icon} />
          </Badge>
        </Badge>
      </span>
    );
    if (!notificationBox) {
      return trigger;
    }
    const popoverProps = {};
    if ('popupVisible' in this.props) {
      popoverProps.visible = popupVisible;
    }
    return (
      <Popover
        placement="bottomRight"
        //content={notificationBox}
        content={
          <Information
            countStatus={this.countStatus.bind(this)}
            countStatusFalse={this.countStatusFalse.bind(this)}
          />
        }
        popupClassName={styles.popover}
        trigger="click"
        arrowPointAtCenter
        popupAlign={popupAlign}
        onVisibleChange={onPopupVisibleChange}
        {...popoverProps}
      >
        {trigger}
      </Popover>
    );
  }
}
