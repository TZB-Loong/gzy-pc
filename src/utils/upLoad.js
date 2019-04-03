/**
 * Created by sean on 2018/8/8.
 */
import { pathPurchase } from '../../configPath';
import { getCookie } from '../utils/utils';
import { message } from 'antd';
import { isfalse } from '../Tools/util_tools';
let upLoadUrl = pathPurchase;
// let upLoadUrl = 'http://192.168.1.141:8010';
export function upLoadInit(fileName, fileList, type, val, isMore, isShow, that, api, buzId) {
  let props = {
    uid: '-1',
    action: upLoadUrl + api,
    name: fileName,
    headers: { 'X-Requested-With': 'XMLHttpRequest', 'gzy-token': getCookie() },
    data: { name: val },
    listType: type, //文件类型
    multiple: isMore, //是否支持多次上传
    showUploadList: isShow, //是否显示预览
    defaultFileList: fileList, //默认文件列表
    onRemove: file => {
      console.log(file, '123');
      let fileUid = file.uid;
      if (file.response && file.status == 'removed') {
        fileUid = file.response.data.id;
      }

      that.props
        .dispatch({
          type: 'common/deleteAttachList',
          payload: {
            buzId: buzId,
            id: fileUid,
          },
        })
        .then(() => {
          // 页面删除显示
          let _index = null;
          let newFileList = that.state[val];
          const {
            common: { DeleteStatus },
          } = that.props;
          that.state[val].map((item, i) => {
            if (item.uid == file.uid) {
              _index = i;
            }
          });
          console.log(DeleteStatus);
          if (DeleteStatus) {
            newFileList.splice(_index, 1);
            return that.setState({
              [val]: newFileList,
            });
            message.success('删除成功!');
          }
        });
    },
  };
  return props;
}
export function upLoadInitImport(fileName, fileList, type, val, isMore, isShow, that, api) {
  let props = {
    uid: '-1',
    // action: 'http://192.168.1.140:8081' + api,
    action: pathPurchase + api,
    headers: { 'X-Requested-With': 'XMLHttpRequest', 'gzy-token': getCookie() },
    name: fileName,
    data: { name: val },
    listType: type, //文件类型
    multiple: isMore, //是否支持多次上传
    showUploadList: isShow, //是否显示预览
    defaultFileList: fileList, //默认文件列表
    onRemove: file => {
      that.setState(({ fileList }) => {
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);
        return {
          fileList: newFileList,
        };
      });
    },
    onChange(info) {
      let fileLists = [];
      fileLists = !isMore
        ? info.fileList.length > 1
          ? info.fileList.slice(1)
          : info.fileList
        : info.fileList;
      let filePath = '';
      if (info.file.status !== 'uploading') {
        console.log(info, '--');
      }
      if (info.file.status === 'uploading') {
        that.setState({
          fileList: fileLists,
        });
      }
      if (info.file.status === 'removed') {
        that.setState({
          fileList: fileLists,
        });
        message.success(`${info.file.name} 文件删除成功!`);
      }
      if (info.file.status === 'done') {
        // filePath = info.file.response.data.path;
        if (info.file.response.status === '200') {
          message.success(`${info.file.name} 文件上传成功!`);
        } else {
          that.setState({
            fileList: [],
          });
          message.error(`${info.file.response.msg}`);
        }
      } else if (info.file.status === 'error') {
        that.setState({
          fileList: [],
        });
        message.error(`${info.file.name} 文件上传失败，请检查网络连接是否正常!`);
      }
      return filePath;
    },
  };
  return props;
}
export function beforeUpload(file, fileType, fileSize) {
  let typeApplication = '',
    type,
    msg = '';
  //循环type
  fileType.map(item => {
    if (item == 'xls') {
      typeApplication +=
        'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      msg = '文件类型错误，请重新选择excel格式文件!';
    }
    if (item == 'doc') {
      typeApplication +=
        'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      msg = '文件类型错误，请重新选择word格式文件!';
    }
    if (item == 'img') {
      typeApplication += 'image/gif,image/jpeg,image/jpg,image/png,image/svg,image/tif';
      msg = '文件类型错误，请重新选择图片格式文件!';
    }
    if (item == 'pdf') {
      typeApplication += 'application/pdf';
      msg = '文件类型错误，请重新选择pdf格式文件!';
    }
    if (item == 'txt') {
      typeApplication += 'text/plain';
      msg = '文件类型错误，请重新选择文件!';
    }
  });
  const isBig = file.size / 1024 / 1024 < fileSize;
  if (fileType && fileType[0] != 'all') {
    type = typeApplication.indexOf(file.type) > -1;
    if (!type) {
      message.error(msg);
      return false;
    }
  } else {
    type = typeApplication;
  }
  if (!isBig) {
    message.error('文件大小不能超过' + fileSize + 'M!');
    return false;
  }
  return type && isBig;
}
export function uploadChange(info, stateKey, that, isMore, callBack) {
  let fileLists = [], id = '';
  console.log(info);
  if (info.fileList.length > 0) {
    if(!isfalse(info.fileList[0].response)){
      if (typeof callBack == 'function') {
        if (info.fileList[0].status == 'done') {
          console.log(info.fileList[0].response);
          // id = info.fileList[0].id;
          // console.log(info.fileList[0].);
          if (info.fileList[0].response.status != '200') {
            message.error(info.fileList[0].response.msg);
            that.props.form.setFieldsValue({
              [stateKey]: [],
            });
            that.setState({
              [stateKey]: [],
            });
            return;
          }
        } else {
          if(info.fileList[0].status == 'done'){
            /*id =
             info.fileList[0].uid.toString().indexOf('rc-') > -1
             ? info.fileList[0].response.data.id
             : info.fileList[0].id;*/
          }
        }
      } else {
        if (info.fileList[0].status == 'done') {
          if (info.fileList[0].response.status != '200') {
            message.error(info.fileList[0].response.msg);
            that.props.form.setFieldsValue({
              [stateKey]: [],
            });
            that.setState({
              [stateKey]: [],
            });
            return;
          } else {
            /*id =
             info.fileList[0].uid.toString().indexOf('rc-') > -1 && info.fileList[0].status == 'done'
             ? info.fileList[0].response.data.id
             : info.fileList[0].uid;*/
          }
        }
      }
    }

  } else {
    return;
  }
/*  if (info.fileList.length > 1 && isMore) {
    that.props.dispatch({
      type: 'common/deleteAttachList',
      payload: {
        id: id,
      },
    });
  }*/
  fileLists = isMore
    ? info.fileList.length > 1
      ? info.fileList.slice(1)
      : info.fileList
    : info.fileList;
  let filePath = '';

  if (info.file.status !== 'uploading') {
    // console.log(info.file, info.fileList);
  }
  if (info.file.status === 'uploading') {
    that.props.form.setFieldsValue({
      [stateKey]: fileLists,
    });
    that.setState({
      [stateKey]: fileLists,
    });
  }

  if (info.file.status === 'done') {
    if(!isfalse(info.file.response)){
      if (info.file.response.status == '200') {
        if (typeof callBack == 'function') {
          callBack();
        }
        if (stateKey != 'tenderListFile' || stateKey != 'tenderList') {
          message.success(`${info.file.name} 文件上传成功!`);
        }
      } else {
        message.error(`${info.file.response.msg}`);
        that.props.form.setFieldsValue({
          [stateKey]: fileLists,
        });
        that.setState(
          {
            [stateKey]: info.fileList.slice(0, info.fileList.length - 1),
          },
          () => console.log(that.state)
        );
        return false;
      }
    }

  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} 文件上传失败，请检查网络连接是否正常!`);
  }
  return filePath;
}
