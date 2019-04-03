/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import styles from './style.less';
import { Card, Button, Popover, Transfer } from 'antd';

@connect(({ flowSettingModel, loading }) => ({
  flowSettingModel,
  loading,
  Transfer,
}))
export default class flowSetting extends Component {
  state = {};

  componentDidMount() {
    // console.log(this.props);
  }

  componentWillUnmount() {}

  render() {
    const { flowSettingModel } = this.props;
    const text = <span>角色设置</span>;
    const content = (
      <ul>
        <li>项目经理</li>
        <li>项目经理</li>
        <li>项目经理</li>
        <li>项目经理</li>
      </ul>
    );

    return (
      <Card title={flowSettingModel.data}>
        <div className={styles.approveWorkflow}>
          <ul>
            <Popover placement="right" title={text} content={content} trigger="click">
              <li>
                <div className={styles.operation}>
                  <span>
                    <img alt="example" src="/img/arrow_t.png" />
                  </span>
                  <span>
                    <img alt="example" src="/img/arrow_d.png" />
                  </span>
                  <span>
                    <img alt="example" src="/img/delete.png" />
                  </span>
                </div>
                <div className={styles.setBorder}>
                  <strong>1</strong>
                  <h4>《--新节点--》</h4>
                  <span>处理角色:</span>
                </div>
              </li>
            </Popover>
            <li>
              <div className={styles.setBorder}>
                <strong>2</strong>
              </div>
            </li>
            <li>
              <div className={styles.setBorder}>
                <strong>3</strong>
              </div>
            </li>

            <li className={styles.trem}>
              <div className={styles.setBorder}>
                <strong>条件</strong>
                <div>
                  <h4>申请金额</h4>
                  <p>
                    <span />
                  </p>
                </div>
                <div style={{ width: '60px', height: '60px', background: '#43acf7' }}>
                  <div className={styles.triangleBorderRight} />
                </div>
              </div>
              <div className={styles.operation}>
                <span>
                  <img alt="example" src="/img/arrow_t.png" />
                </span>
                <span>
                  <img alt="example" src="/img/arrow_d.png" />
                </span>
                <span>
                  <img alt="example" src="/img/delete.png" />
                </span>
              </div>
            </li>
          </ul>
          <div>
            <Button type="dashed" className={styles.margin20}>
              添加节点
            </Button>
            <br />
            <Button type="dashed" className={styles.margin20}>
              添加条件
            </Button>
            <br />
            <Button type="primary" className={styles.margin20}>
              保存
            </Button>
            <br />
            <Button className={styles.margin20}>取消</Button>
          </div>
        </div>
      </Card>
    );
  }
}
