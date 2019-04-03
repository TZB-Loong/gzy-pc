import React, { Component } from 'react';
import {  Modal, Table,Button } from 'antd';
import styles from './style.less'
export default class ValidResult extends Component {
  state = {
    columns:[
      {
        title: '错误行号',
        width:100,
        dataIndex: 'row',
        key: 'row',
        fixed: 'left',
      },
      {
        title: '错误描述',
        dataIndex: 'description',
        key: 'description',
      },
    ],
    dataSource: [],
  };

  componentDidMount() {
    const { validRecords} = this.props;
    let source = [];
    validRecords.map((item,index)=>{
      source.push({
        key: index,
        row: item.rowNum,
        description: item.message.toString(),
      })
    });
    this.setState({
      dataSource:source,
    })
  }

  render() {
    const { visible, onCancel} = this.props;
    const { columns, dataSource } = this.state;
    return (
      <Modal visible={visible} title="数据校验" width="50%" onCancel={onCancel} onOk={onCancel} mask={true} footer={[
        <Button key="back" onClick={onCancel} type="primary">返回</Button>,
      ]}>
        <Table
          className={styles.errorInfo}
          dataSource={dataSource}
          scroll={{ y: 378 }}
          pagination={false}
          columns={columns}
          bordered
        />
      </Modal>
    );
  }
}
