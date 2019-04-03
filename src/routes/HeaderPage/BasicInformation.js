/*eslint-disable*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Icon, Avatar, List, Modal, Upload, Form, Button, message } from 'antd';
import { isfalse } from '../../Tools/util_tools';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';
import { pathPurchase, pathModify } from '../../../configPath';
import { getCookie } from '../../utils/utils';
import { setSession } from '../../utils/authority';
import { url2params } from '../../Tools/util_tools';
import request from '../../utils/request';

const FormItem = Form.Item;

@Form.create()
@connect(({ common }) => ({
  common,
}))
export default class ApprovalProgress extends Component {
  state = {
    userId: '',
    username: '',
    userPhone: '',
    email: '',
    userPic: '',
    modalVisible: false,
    fileList: [],
    previewVisible: false,
    previewImage: '',
    attachParams: {
      attachCode: 'USER_PIC',
      attachIds: '',
    },
    fileId: '',
  };

  componentDidMount() {
    if (url2params(this.props.location.search).refresh) {
      let urls = window.location.href;
      console.log(urls.split('?'));
      this.getUser(urls.split('?')[0]);
    }
    let user = JSON.parse(sessionStorage.getItem('user'));
    if (!isfalse(user)) {
      this.setState({
        userId: user.userId,
        username: user.username,
        userPhone: user.userPhone,
        email: user.email,
        userPic: user.userPic,
      });
    }
  }

  componentWillUnmount() {}
  closeModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }
  // 预览图片
  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };
  handleChange = ({ fileList }) => {
    this.setState({ fileList });
    let fileData = '';
    if (fileList) {
      fileList.map(item => {
        if (item.status === 'done') {
          fileData = item.response.data ? item.response.data.id : '';
          this.setState({ fileId: fileData });
        }
      });
    }
  };
  // 修改邮箱回来修改session
  getUser(urls) {
    request(pathPurchase + `/ucenter/user/initConfig`).then(res => {
      if (res.status == '200') {
        let result = res.data;
        setSession('user', JSON.stringify(result.user));
        window.location.href = urls;
        window.location.reload();
      } else {
        message.info(res.msg);
      }
    });
  }

  updateUserPic() {
    let { dispatch } = this.props;

    if (isfalse(this.state.fileId)) {
      message.warning('请上传头像');
      return;
    }
    let data = [],
      attachParams = this.state.attachParams;
    attachParams.attachIds = this.state.fileId;
    data.push(attachParams);
    let bodyData = JSON.stringify(data);
    dispatch({
      type: 'common/updateUserPic',
      payload: { attachParams: bodyData },
    }).then(() => {
      let { updateUserPicData } = this.props.common;
      if (updateUserPicData) {
        setSession('user', JSON.stringify(updateUserPicData));
        window.location.reload();
        this.setState({ modalVisible: false });
      }
    });
  }
  render() {
    const {
      userId,
      username,
      userPhone,
      email,
      userPic,
      fileList,
      previewVisible,
      previewImage,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    let that = this;
    return (
      <Card title="基本信息">
        <div>
          <p>
            <span style={{ verticalAlign: 'top' }}>用户头像：</span>
            <Avatar
              style={{ border: '1px solid #e0e0e0' }}
              shape="square"
              size={64}
              icon="user"
              src={userPic}
            />
          </p>
          <a
            onClick={() => {
              this.setState({ modalVisible: true });
            }}
            style={{ marginLeft: 70 }}
          >
            修改头像
          </a>
        </div>
        <List.Item
          actions={[
            <span>
              {!userPhone ? (
                <a
                  href={
                    pathModify +
                    '/modify/toBindNewMobileOrEmail.html?from=editMobile&returnUrl=' +
                    encodeURIComponent(window.location.href)
                  }
                >
                  绑定手机
                </a>
              ) : (
                <a
                  href={
                    pathModify +
                    '/modify/toEditPassWord.html?from=editMobile&returnUrl=' +
                    encodeURIComponent(window.location.href)
                  }
                >
                  编辑手机号
                </a>
              )}
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <a
                href={
                  pathModify +
                  '/modify/toEditPassWord.html?from=editPassWord&returnUrl=' +
                  encodeURIComponent(window.location.href)
                }
              >
                修改密码
              </a>
            </span>,
          ]}
        >
          <List.Item.Meta
            title={
              <span>
                登陆账号：
                {username}
              </span>
            }
          />
        </List.Item>
        <List.Item
          actions={[
            <span>
              {!email ? (
                <a
                  href={
                    pathModify +
                    '/modify/toBindNewMobileOrEmail.html?from=editEmail&returnUrl=' +
                    encodeURIComponent(window.location.href)
                  }
                >
                  绑定邮箱
                </a>
              ) : (
                <a
                  href={
                    pathModify +
                    '/modify/toEditPassWord.html?from=editEmail&returnUrl=' +
                    encodeURIComponent(window.location.href)
                  }
                >
                  修改邮箱
                </a>
              )}
            </span>,
          ]}
        >
          <List.Item.Meta
            title={
              <span>
                绑定邮箱：
                {!email ? <span style={{ color: '#959595' }}>没有绑定邮箱</span> : email}
              </span>
            }
          />
        </List.Item>
        {/*<List.Item actions={[<a href="/modify/toEditPassWord.html?form=editPassWord">修改密码</a>]}>*/}
        {/*<List.Item.Meta title={<span>密码：******</span>} />*/}
        {/*</List.Item>*/}

        <Modal
          title="上传头像"
          centered
          destroyOnClose={true} //关闭时销毁 Modal 里的子元素
          visible={this.state.modalVisible}
          onOk={() => this.closeModalVisible(false)}
          onCancel={() => this.closeModalVisible(false)}
          maskClosable={false}
          width={600}
          footer={null}
        >
          <div>
            <div style={{ height: 130 }}>
              <Upload
                uid="-1"
                action={pathPurchase + '/base/attach/upload'}
                name="file"
                headers={{ 'X-Requested-With': 'XMLHttpRequest', 'gzy-token': getCookie() }}
                listType="picture-card"
                multiple={true}
                showUploadList={true}
                defaultFileList={this.state.fileList}
                onRemove={file => {
                  {
                    /*图片删除*/
                  }
                  let fileUid = file.uid;
                  if (file.response && file.status == 'removed') {
                    fileUid = file.response.data.id;
                  }
                  that.props
                    .dispatch({
                      type: 'common/deleteAttachList',
                      payload: {
                        id: fileUid,
                      },
                    })
                    .then(() => {
                      that.setState({ fileId: '' });
                    });
                }}
                fileList={fileList}
                onPreview={this.handlePreview}
                onChange={this.handleChange}
                accept="image/gif,image/jpeg,image/jpg,image/png,image/svg,image/tif"
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <Icon type="upload" />
                    <br />
                    上传头像
                  </div>
                )}
              </Upload>
            </div>
            <Button
              onClick={() => {
                this.updateUserPic();
              }}
            >
              确定
            </Button>
            <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
              <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </div>
        </Modal>
      </Card>
    );
  }
}
