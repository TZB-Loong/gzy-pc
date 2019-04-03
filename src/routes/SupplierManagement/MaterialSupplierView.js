import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Modal, List, Col } from 'antd';
import styles from './style.less';
import FileView from '../Common/FileView';
import { isfalse } from '../../Tools/util_tools';
const ListItem = List.Item;

export default class MaterialSupplierView extends React.Component {
  state = {};
  componentDidMount() {}
  closeModalVisible(s_modalVisible) {
    this.props.that.setState({ s_modalVisible });
  }

  // 查看页每项数据
  itemView(ctrlName, customerFields) {
    let theData = [];
    theData = eval('(' + customerFields + ')') ? eval('(' + customerFields + ')') : [];

    return theData.map((item, index) => {
      if (item.fieldname == ctrlName) {
        return <span key={index}>{item.value}</span>;
      }
    });
  }
  render() {
    let _this = this;
    let that = this.props.that;
    let { m_detail, listData, s_modalVisible } = this.props;
    return (
      <Modal
        bodyStyle={{ maxHeight: 650, overflowY: 'scroll' }}
        title="查看材料供应商信息 "
        centered
        destroyOnClose={true} //关闭时销毁 Modal 里的子元素
        visible={that.state.s_modalVisible}
        onOk={() => this.closeModalVisible(false)}
        onCancel={() => this.closeModalVisible(false)}
        width={600}
        footer={null}
      >
        <List bordered style={{ width: '100%' }} className={styles.Detaillist}>
          <ListItem>
            <Col span={6}>
              <span>供应商编码：</span>
            </Col>
            <span>{m_detail.supplierCode}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>供应商名称：</span>
            </Col>
            <span>{m_detail.name}</span>
          </ListItem>
          {(!isfalse(m_detail.supplierContactList)
            ? JSON.parse(m_detail.supplierContactList)
            : [1]
          ).map(function(item, index) {
            return (
              <ListItem key={index}>
                <Col span={6}>
                  <span>
                    联系人
                    {index > 0 ? index : ''}：
                  </span>
                </Col>
                <span>{item.contactName}</span>
                <span style={{ marginLeft: 20 }}>{item.phone}</span>
              </ListItem>
            );
          })}
          <ListItem>
            <Col span={6}>
              <span>主营材料分类：</span>
            </Col>
            <span>{m_detail.materialType}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>主营材料名称：</span>
            </Col>
            <span>{m_detail.materialName}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>经营品牌：</span>
            </Col>
            <span>{m_detail.brand}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>承包类型：</span>
            </Col>
            <span>{m_detail.contractType}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>供应区域：</span>
            </Col>
            <span>{m_detail.supplyArea}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>厂家地址：</span>
            </Col>
            <span>{m_detail.address}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>邮箱：</span>
            </Col>
            <span>{m_detail.email}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>付款方式：</span>
            </Col>
            <span>{m_detail.payWays}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>评价等级：</span>
            </Col>
            <span>{m_detail.evaluateLevel}</span>
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>合作项目：</span>
            </Col>
            <span dangerouslySetInnerHTML={{ __html: m_detail.jointProject }} />
          </ListItem>

          <ListItem>
            <Col span={6}>
              <span>考察报告：</span>
            </Col>
            <FileView
              type={'REPORT_INCESTIGATION'}
              attachmentVOList={this.props.attachmentVOList}
            />
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>供应商历史合同：</span>
            </Col>
            <FileView
              type={'HISTORICAL_CONTRACT'}
              imgView={'view'}
              attachmentVOList={this.props.attachmentVOList}
            />
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>备注：</span>
            </Col>
            <span dangerouslySetInnerHTML={{ __html: m_detail.remark }} />
          </ListItem>
          <ListItem>
            <Col span={6}>
              <span>其他附件：</span>
            </Col>
            <FileView
              type={'OTHER_ACCESSORIES'}
              imgView={'view'}
              attachmentVOList={this.props.attachmentVOList}
            />
          </ListItem>
          {listData.map(function(item, index) {
            return (
              <ListItem key={index}>
                <Col span={6}>
                  <span>{item.chnName}：</span>
                </Col>
                {_this.itemView(item.ctrlName, m_detail.customerFields)}
              </ListItem>
            );
          })}
        </List>
      </Modal>
    );
  }
}
