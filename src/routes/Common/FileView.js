import React, { Component } from 'react';
import { Card, Modal, Table, Button, Icon } from 'antd';
import styles from './style.less';
import { connect } from 'dva';
@connect(({ common }) => ({
  common,
}))
export default class ViewResult extends Component {
  state = {
    filesList: [],
    previewVisible: false,
    previewImage: '',
  };
  componentWillReceiveProps(nextProps) {
    const { type } = this.props;
    let fileList = [];
    (nextProps.attachmentVOList ? nextProps.attachmentVOList : []).map((item, i) => {
      if (item.ctrlName == type) {
        fileList.push({
          name:
            item.originalFilename.indexOf(item.extention) > -1
              ? item.originalFilename
              : item.originalFilename + '.' + item.extention,
          url: item.fullFilename,
          uid: item.id,
          fileType: item.fileType || '',
        });
      }
    });
    this.setState({
      filesList: fileList,
    });
  }
  componentDidMount() {}
  handlePreview = url => {
    this.setState({
      previewImage: url,
      previewVisible: true,
    });
  };
  handleCancel = () => this.setState({ previewVisible: false });
  render() {
    const { previewVisible, previewImage, filesList } = this.state;
    let that = this;
    return (
      <div>
        {filesList.map(function(item, i) {
          if (item.fileType.indexOf('image') > -1) {
            return that.props.imgView == 'view' ? (
              <div
                key={i}
                style={{ padding: '0px 12px 0px 4px' }}
                onClick={() => {
                  that.handlePreview(item.url);
                }}
              >
                <a>
                  <Icon style={{ color: '#00000073', paddingRight: 5 }} type="paper-clip" />
                  {item.name}
                </a>
              </div>
            ) : (
              <div
                key={i}
                onClick={() => {
                  that.handlePreview(item.url);
                }}
                style={{
                  width: 100,
                  height: 130,
                  marginRight: 20,
                  marginTop: 5,
                  overflow: 'hidden',
                  float: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onMouseOver={() => {
                  that.setState({ ['previewImg' + i]: true });
                }}
                onMouseOut={() => {
                  that.setState({ ['previewImg' + i]: false });
                }}
              >
                <div
                  style={{
                    display: that.state['previewImg' + i] ? null : 'none',
                    position: 'absolute',
                    width: 100,
                    height: 130,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    textAlign: 'center',
                    lineHeight: '150px',
                  }}
                >
                  <Icon style={{ color: '#fff', fontSize: 20 }} type="eye-o" theme="outlined" />
                </div>
                <span style={{ display: 'block' }}>
                  <img
                    style={{ width: '100%', height: '100%' }}
                    src={item.url + '?x-oss-process=image/resize,w_100'}
                  />
                </span>
              </div>
            );
          } else {
            return (
              <div
                key={i}
                style={{
                  padding: '0px 12px 0px 4px',
                  // marginRight: 20,
                  //overflow: 'hidden',
                  //float: 'left',
                }}
              >
                <a href={item.url} style={{ display: 'block' }} target="_blank">
                  <Icon style={{ color: '#00000073', paddingRight: 5 }} type="paper-clip" />
                  {item.name}
                </a>
              </div>
            );
          }
        })}
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%', padding: 20 }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}
