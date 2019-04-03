/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Pagination, Icon, List, Button, Modal, Spin, Col, Table } from 'antd';
import { Link } from 'dva/router';
import styles from './style.less';
import { url2params } from '../../Tools/util_tools';
import Empty from '../Common/Empty';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const ListItem = List.Item;
@connect(({ Inquiry, loading }) => ({
  Inquiry,
  loading,
}))
export default class PurchaseView extends Component {
  state = {
    columns: [
      {
        title: '序号',
        dataIndex: 'key',
        key: 'key',
      },
      {
        title: '材料类别',
        dataIndex: 'materialType',
        key: 'materialType',
      },
      {
        title: '数量',
        dataIndex: 'number',
        key: 'number',
      },
      {
        title: '单位',
        dataIndex: 'unit',
        key: 'unit',
      },
      {
        title: '材料编号',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '材料品牌',
        dataIndex: 'brand',
        key: 'brand',
      },
      {
        title: '材料型号',
        dataIndex: 'model',
        key: 'model',
      },
      {
        title: '材料规格',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: '材料图片',
        dataIndex: 'img',
        key: 'img',
      },
    ],
    inquiryColumns: [
      {
        title: '报价单位',
        key: 'authenName',
        render: record => {
          return (
            <div>
              <div>
                <a>{record.authenName}</a>
              </div>
              <div>{record.address}</div>
            </div>
          );
        },
      },
      {
        title: '联系方式',
        key: 'contactPhone',
        render: record => {
          return (
            <div>
              <div>{record.contactName}</div>
              <div>{record.contactPhone}</div>
            </div>
          );
        },
      },
      {
        title: '总报价（元）',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        render: totalPrice => {
          return (
            <div>
              <Icon style={{ fontSize: 16, marginRight: 5 }} type="lock" />
              <span>授权后可见</span>
            </div>
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'key',
        key: 'key',
        render: key => {
          return (
            <div>
              <Button
                style={{
                  backgroundColor: '#4B85F8',
                  color: '#FFFFFF',
                  borderColor: '#4B85F8',
                }}
                type="primary"
              >
                采纳报价
              </Button>
              <div>
                <a>查看单项报价</a>
              </div>
            </div>
          );
        },
      },
    ],
  };
  componentDidMount() {}

  render() {
    const dataSource = [
      {
        key: '1',
        materialType: '胡彦斌',
        number: 32,
        unit: 'g',
        code: '123',
        brand: '1',
        model: 'q',
        address: '西湖区湖底公园1号',
        img: '',
      },
      {
        key: '2',
        materialType: '胡彦祖',
        number: 42,
        unit: 'g',
        code: '124',
        brand: '2',
        model: 'w',
        address: '西湖区湖底公园1号',
        img: '',
      },
    ];
    const inquirydataSource = [
      {
        key: '1',
        authenName: '沈倩MMM的材料商',
        address: '广东省深圳市',
        contactName: '谢某某',
        contactPhone: '18912213344',
        totalPrice: 32,
      },
      {
        key: '2',
        authenName: '沈倩MMM的材料商',
        address: '广东省深圳市',
        contactName: '谢某某',
        contactPhone: '18912213344',
        totalPrice: 42,
      },
    ];

    return (
      <PageHeaderLayout>
        <div className={styles.PurchaseView}>
          {/*<Card style={{ marginBottom: 30 }}>
          <span style={{ fontSize: 16, fontWeight: 'bold' }}>报价详情</span>
        </Card>*/}
          <Card
            style={{ marginBottom: 30 }}
            title="福州中海锦城花园项目采购大理石"
            extra={
              <div>
                <span>报价状态：</span>
                <span style={{ color: '#3C63C5' }}>已成交</span>
              </div>
            }
          >
            <List style={{ width: '100%' }}>
              <ListItem>
                <Col span={4}>
                  <span>询价单ID</span>
                </Col>
                <Col span={15}>
                  <span>2018554665</span>
                </Col>
                <Col span={5}>
                  <span>报价数量：</span>
                  <span style={{ color: '#3C63C5' }}>2</span>
                </Col>
              </ListItem>
              <ListItem>
                <Col span={4}>
                  <span>发布时间</span>
                </Col>
                <span>2018-06-01 17:36:27</span>
              </ListItem>
              <ListItem>
                <Col span={4}>
                  <span>询价单位</span>
                </Col>
                <span>深圳市金凤凰装饰工程有限公司</span>
              </ListItem>
              <ListItem>
                <Col span={4}>
                  <span>截止时间</span>
                </Col>
                <span>2018-06-01 17:36:27</span>
              </ListItem>
              <ListItem>
                <Col span={4}>
                  <span>是否允许缺项报价</span>
                </Col>
                <span>是</span>
              </ListItem>
              <ListItem>
                <Col span={4}>
                  <span>所在地要求</span>
                </Col>
                <span>华中-湖北省-武汉</span>
              </ListItem>
              <ListItem>
                <Col span={4}>
                  <span>联系人</span>
                </Col>
                <span>王志成</span>
              </ListItem>
              <ListItem>
                <Col span={4}>
                  <span>手机号</span>
                </Col>
                <span>18613169581</span>
              </ListItem>
            </List>
          </Card>
          <Card style={{ marginBottom: 30 }} title="询价清单">
            <Table dataSource={dataSource} columns={this.state.columns} pagination={false} />
            <div style={{ marginTop: 20 }}>
              <span>附件下载</span>
              <div style={{ colro: '#999999' }}>
                注意：如本页面内容与采购方提供的采购文件内容有冲突，请以采购文件为准。
              </div>
            </div>
          </Card>
          <Card title="报价单位列表">
            <Table
              dataSource={inquirydataSource}
              columns={this.state.inquiryColumns}
              pagination={false}
            />
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}
