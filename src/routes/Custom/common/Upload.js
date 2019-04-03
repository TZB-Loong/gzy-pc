import React, { Component } from 'react';
import { Upload, Button, Icon, message } from 'antd';
import { beforeUpload } from '../../../utils/upLoad';
import { getCookie } from '../../../utils/utils';
import { pathPurchase } from '../../../../configPath';
import { connect } from 'dva';
import { isfalse } from '../../../Tools/util_tools';
let upLoadUrl = pathPurchase;

/**
 * 参数
 * @param {function} onOk  接收子组件的数据
 * @param {array} fileList 默认值 //待处理(bug)
 */


//上传附件的组件(还是需要重新修改这个组件)
@connect(({ loading, common }) => ({
  common,
  loading
}))
export default class UploadAttach extends Component {
  state = {
    fileList: [], //已经上传
    isUpdata: true,
  }

  remove = (file) => { //删除
    let fileList = this.state.fileList;
    let fileUid = file.uid;
    if (file.response && file.status == 'removed' && file.response.status == '200') {
      fileUid = file.response.data.id;
    }
    this.props.dispatch({
      //接口删除以及页面删除
      type: 'common/deleteAttachList',
      payload: {
        id: fileUid,
      },
    })
      .then(() => {
        //页面显示删除
        fileList.map((item, index) => {
          if (item.uid == file.uid) {
            fileList.splice(index, 1);
          }
        })
        this.setState({
          fileList: fileList
        }, () => {
          if (!isfalse(this.props.onOk)) {
            let returnData =[];
            this.state.fileList.map((item, index) => {
              returnData.push(item.response.data)
            })
            this.props.onOk(returnData) //将数据传到父组件
          }
        })
      });
  }

  initProps = (record) => {
    let _this = this;
    return {
      action: upLoadUrl + '/base/attach/upload',
      name: 'file',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'gzy-token': getCookie() },
      onChange(info) {
        console.log(info)
        if (info.file.status) {

          if (info.file.status !== 'uploading') { //上传中

          }
          if (info.file.status === 'done') {
            if (info.file.response.status == 200) {
              message.success(`${info.file.name} 上传成功`);
            } else {
              info.fileList.map((item, index) => {
                if (item.uid == info.file.uid) {
                  info.fileList.splice(index, 1)

                }
              })
              message.warning(info.file.response.msg); //在上传错误时,应该自动的去除掉一个
            }
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }

          _this.setState({
            fileList: info.fileList
          }, () => {
            if (!isfalse(_this.props.onOk)) {
              let returnData = [];
              _this.state.fileList.map((item, index) => {
                if (item.status == 'done') {
                  returnData.push(item.response.data)
                }

              })
              _this.props.onOk(returnData) //将数据传到父组件
            }
          })
        }
      },
      defaultFileList: _this.state.fileList,
      onRemove: file => _this.remove(file),
      showUploadList: "false"
    };
  }

  setfileList = (data) => {
    if (this.state.isUpdata) {

      let fileList = [];
      data.map(item => {
        fileList.push({
          uid: item.id,
          name: item.originalFilename + '.' + item.extention,
          status: 'done',
          url: item.fullFilename,
          response: { data: item }
        })
      })

      this.setState({
        fileList: fileList,
        isUpdata: false
      }, () => { console.log(this.state.fileList, 'this') })
    }
  }

  render() {

    if (!isfalse(this.props.fileList)) {
      this.setfileList(this.props.fileList)
    }

    return (
      <div>
        <Upload
          {...this.initProps()}
          multiple={false}
          fileList={this.state.fileList}
          beforeUpload={e => beforeUpload(e, ['xls', 'img', 'pdf', 'doc', 'txt'], 5)}
        >
          <Button>
            <Icon type="upload" />
            上传附件
          </Button>
        </Upload>
      </div>
    )
  }
}
