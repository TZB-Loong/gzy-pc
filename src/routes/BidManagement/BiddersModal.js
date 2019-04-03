/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, List, Button, Modal, Spin, Col, Table, Row } from 'antd';
import { Link } from 'dva/router';
import styles from './style.less';
import { url2params, isfalse } from '../../Tools/util_tools';
import Empty from '../Common/Empty';
import cnCity from '../../utils/area.json';
import { getCookie } from '../../utils/utils';

const ListItem = List.Item;

@connect(({ material, loading }) => ({
  material,
  loading,
}))
export default class BiddersModal extends Component {
  state = {
    modalVisible: false, // 投标单位modal
    personShow: false,
    allShow: false,
  };
  constructor(props) {
    super(props);

    this.personRef = ref => {
      this.personDom = ref;
    };
    this.allRef = ref => {
      this.allDom = ref;
    };
  }

  componentDidMount() {
    this.setState({
      personShow: this.personDom.clientHeight >= 75 ? true : false,
      allShow: this.allDom.clientHeight >= 75 ? true : false,
    });
  }

  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }
  render() {
    let _this = this;

    const capital = ['50万以下', '50-100万', '100-500万', '500-1000万', '1000万以上'];

    return (
      <div>
        <div>
          <div>
            <div style={{ color: '#333757', marginBottom: 10 }}>个人供应商库（67）</div>
            <div ref={this.personRef} style={{ maxHeight: 75, overflow: 'hidden' }}>
              {cnCity.map(function(item, index) {
                return (
                  <span
                    key={index}
                    style={{ display: 'inline-block', paddingRight: 20, paddingBottom: 5 }}
                  >
                    深圳大脚丫科技有限公司
                  </span>
                );
              })}
            </div>
            <div
              style={{
                width: '100%',
                textAlign: 'right',
                paddingRight: 20,
                display: this.state.personShow ? null : 'none',
              }}
            >
              <a
                onClick={() => {
                  this.setState({ modalVisible: true });
                }}
              >
                查看更多>
              </a>
            </div>
          </div>
          <div>
            <div style={{ color: '#333757', marginBottom: 10 }}>平台供应商库（67）</div>
            <div ref={this.allRef} style={{ maxHeight: 75, overflow: 'hidden' }}>
              {capital.map(function(item, index) {
                return (
                  <span
                    key={index}
                    style={{ display: 'inline-block', paddingRight: 20, paddingBottom: 5 }}
                  >
                    深圳大脚丫科技有限公司
                  </span>
                );
              })}
            </div>
            <div
              style={{
                width: '100%',
                textAlign: 'right',
                paddingRight: 20,
                display: this.state.allShow ? null : 'none',
              }}
            >
              <a
                onClick={() => {
                  this.setState({ modalVisible: true });
                }}
              >
                查看更多>
              </a>
            </div>
          </div>
        </div>

        <Modal
          bodyStyle={{ height: 600, overflowY: 'scroll', paddingBottom: 0 }}
          title="应邀投标单位"
          centered
          destroyOnClose={true} //关闭时销毁 Modal 里的子元素
          visible={this.state.modalVisible}
          onOk={() => this.setModalVisible(false)}
          onCancel={() => this.setModalVisible(false)}
          footer={null}
          width={700}
        >
          <div style={{ color: '#333757', marginBottom: 20 }}>个人供应商库（67）</div>
          <div>
            {cnCity.map(function(item, index) {
              return (
                <span
                  key={index}
                  style={{ display: 'inline-block', paddingRight: 20, paddingBottom: 5 }}
                >
                  深圳大脚丫科技有限公司
                </span>
              );
            })}
          </div>
          <div style={{ color: '#333757', marginBottom: 20, marginTop: 20 }}>
            平台供应商库（67）
          </div>
          <div>
            {cnCity.map(function(item, index) {
              return (
                <span
                  key={index}
                  style={{ display: 'inline-block', paddingRight: 20, paddingBottom: 5 }}
                >
                  深圳大脚丫科技有限公司
                </span>
              );
            })}
          </div>
        </Modal>
      </div>
    );
  }
}
