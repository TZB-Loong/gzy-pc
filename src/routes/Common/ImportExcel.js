import React, { Component } from 'react';
import { Form, Modal, Button, Icon, Upload, Row, Col,Card,Spin } from 'antd';
import { message } from 'antd/lib/index';
import { connect } from 'dva/index';
import { getDownloadUrl } from '../../utils/utils';
import { upLoadInitImport, beforeUpload, uploadChange } from '../../utils/upLoad';
import ValidResult from './ValidResult';
@Form.create()
@connect(({ importExcel, loading, common }) => ({
  importExcel,
  common,
  loading: loading.effects['common/impExcel'],
}))
export default class Import extends Component {
  state = {
    fileList: [],
    validResultVisible: false,
    validResult: [],
    uploadStatus:false,
    Importing:false,
  };
  componentDidMount() {
    this.props.dispatch({
      type:'common/clearData',
    })
  }
  // 数据导入
  doImport = () => {
    let filename = this.props.form.getFieldValue('importFile');
    let that = this;
    const { dispatch, importType } = this.props;
    if (!filename || this.state.fileList.length == 0) {
      message.warn('请选择数据文件!');
      return;
    }
    if (filename.file.status === 'error') {
      message.warn('文件上传失败无法导入!');
      return;
    }
    // let params = Object.assign({}, this.state.fileList[0].response.data.datas || {}, { filename: filename });
    if(this.state.fileList[0].status=='done'){
      let result = this.state.fileList[0].response.data;
      let params = result.datas;
      let isValid = result.isvalid;
      console.log(!isValid)

      if (!isValid) {
        this.setState({
          validResult: result.invalids,
          validResultVisible: true,
        });
      } else {
        this.setState({
          Importing: true,
        });
        //导入供应商（劳务、材料）请求
        let queryType = 'common/';
        importType === 'labour'
          ? (queryType += 'addBatchSupplierLabour')
          : (queryType += 'addBatchSupplierMaterial');
        dispatch({
          type: queryType,
          payload: params,
        }).then(() => {
          const { common } = that.props;
          console.log(common)
          if (common.importStatus == '200') {
            message.success('文件导入成功!')
            this.setState({
              Importing: false,
            });
            that.props.onCancel();
            that.props.reload();
          }
          if (common.importStatus == '500') {
            message.error('文件导入失败!')
            that.setState({
              Importing: false,
              validResult: common.invalids,
              validResultVisible: true,
            });
          }
        });
      }
    }else {
      message.warn('文件上传中!');
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, onCancel, importUrl, downLoadUrl } = this.props;
    const { validResult,Importing } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    };
    return (
      <div>
        <Modal
          visible={visible}
          title={this.props.modalTitle || '导入数据'}
          width="550px"
          keyboard={false}
          maskClosable={false}
          destroyOnClose={true}
          onCancel={onCancel}
          footer={[
            <Button key="back" disabled={Importing} onClick={onCancel}>
              关闭
            </Button>,
            <Button key="submit" disabled={Importing} type="primary" onClick={this.doImport}>
              导入
            </Button>,
          ]}
        >
          <Spin spinning={Importing} tip="数据导入中..." delay={500}>
            <Form onSubmit={this.onSubmit}>
              <Row style={{ marginBottom: '25px' }}>
                <Col span={4} style={{ textAlign: 'right' }}>
                  温馨提示：
                </Col>
                <Col span={20}>
                  为保证上传数据的正确性，请按导入模板编辑表格，导入的数据文件仅支持.xls
                  或.xlsx格式的文件。
                  <a href={getDownloadUrl(downLoadUrl)} style={{ color: 'red' }}>
                    点击下载导入模板
                  </a>
                </Col>
              </Row>
              <Form.Item {...formItemLayout} label="请选择将要导入的数据文件">
                {getFieldDecorator('importFile', {
                  initialValue: null,
                  rules: [{ required: true, message: '请选择将要导入的数据文件' }],
                })(
                  <Upload
                    {...upLoadInitImport('file', [], 'text', 'file', false, true, this, importUrl)}
                    fileList={this.state.fileList}
                    data={{ name: 'importFile' }}
                    beforeUpload={e => beforeUpload(e, ['xls'], 5)}
                  >
                    <Button>
                      <Icon type="upload" /> 选择文件
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
        {this.state.validResultVisible ? (
          <ValidResult
            visible={this.state.validResultVisible}
            onCancel={() => {
              this.setState({ validResultVisible: false });
            }}
            validRecords={validResult}
          />
        ) : null}
      </div>
    );
  }
}
