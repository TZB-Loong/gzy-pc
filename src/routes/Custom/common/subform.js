
import React, { Component } from 'react'
import moment from 'moment'
import { Form, Modal, Button, Table } from 'antd';
import { isfalse,isJSON } from '../../../Tools/util_tools';
import Styles from '../../Common/style.less';

/**
 * @param {function}  subtag  循环生成form 表单里面的控件
 * @param {array} options 生成子表单的数据
 * @param {function} onOk 接收提交上去的数据
 * @param {boolean} isView 是否只是展示
 * @param {object} default 默认值
 *
 * 将显示与输入全部的组装到这一个组件上来
 *
 */
const FormItem = Form.Item;
const formItemLayout = {
  //form表单的样式
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 10 },
  },
};

export default class Subform extends Component {
  state = {
    visible: false,
    returnData: [], //需要提交到后面的数据
    dataSource: [], //Table的数据源
    columns: [], //表头的信息
    isUpdata: true
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  clearState = () => {
    this.setState({
      returnData: [],
    })
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }

  createFormItem = (data) => { //form表单里面的标签
    return data.map((item, index) => {
      return <FormItem key={index} label={item.chnName} {...formItemLayout}>
        {this.props.subtag(item, this.props.form.getFieldDecorator,false)}
      </FormItem>
    })
  }

  createTable = (returnData) => { //显示的Table表格
    let { columns } = this.state;
    let dataSource = [];
    returnData.map((item, i) => {
      dataSource.push({
        key: i,
        [Object.keys(item)[i]]: item
      })
    })
    if (isfalse(columns)) {
      this.props.options.map((item, index) => {
        columns.push({
          title: item.chnName,
          dataIndex: item.ctrlName,
          width: 250,
          render: (text, record) => {
            let showData = record[Object.keys(record)[1]]
            let textData = showData[item.ctrlName];
            if (item.ctrlType == 'number' || item.ctrlType == 'money') {
              textData = textData + JSON.parse(item.extentionProps).unit
            }
            if (item.ctrlType == 'area') {
              textData = isfalse(textData) ? '' : textData.provinceName + textData.cityName + textData.districtName
            }
            if (item.ctrlType == 'date') {
              textData = isfalse(showData[item.ctrlName]) ? '' : moment(showData[item.ctrlName]).format(JSON.parse(item.extentionProps).format)
            }
            if (item.ctrlType == 'datearea') {
              textData = isfalse(showData[item.ctrlName]) ? '' : [moment(showData[item.ctrlName][0]).format(JSON.parse(item.extentionProps).format), '至', moment(showData[item.ctrlName][1]).format(JSON.parse(item.extentionProps).format)]
            }
            if (item.ctrlType == 'attach') { //附件显示
              if (!isfalse(textData)) {
                return textData.map((attactitem, i) => {
                  return <div key={i}><a href={attactitem.fullFilename} target="_blank">{attactitem.originalFilename + '.' + attactitem.extention}</a></div>
                })
              }
            }
            if (item.ctrlType == 'user') {
              if (!isfalse(textData)) {

                let showData = isJSON(textData)? JSON.parse(textData):textData
                textData = showData.displayName
              }
            }
            if (item.ctrlType == 'chooseProject') {
              if (!isfalse(textData)) {
                textData = textData.projectName
              }
            }
            if(item.ctrlType=='chooseMaterialTender'){
              if(!isfalse(textData)){
                return (
                  <div>
                    <div>{textData.projectName}</div>
                    <div>招：{textData.tenderCategory}</div>
                  </div>
                );
              }
            }
            if(item.ctrlType=='chooseLabourTender'){
              if(!isfalse(textData)){
                return (
                  <div>
                    <div>{textData.projectName}</div>
                    <div>招：{textData.tenderCategory}</div>
                  </div>
                );
              }
            }
            if (item.ctrlType == 'material') {
              if (!isfalse(textData)) {
                console.log(textData, 'textData')
                textData = textData.categoryText
              }
            }
            if (item.ctrlType == 'chooseMaterialSupplier') {
              if (!isfalse(textData)) {
                return <div>
                  {isfalse(textData) ? null : (textData.privateSupplier == -1 && textData.platformSupplier == -1 ? (
                    <div>已选择全部供应商,公开招标</div>
                  ) : (
                      <div>
                        <div>
                          <span>
                            {isfalse(textData.privateSupplier)
                              ? null
                              : textData.privateSupplier == -1
                                ? '已选择全部个人供应商'
                                : '已选择个人供应商(' + textData.privateSupplier.length + ')'}
                          </span>
                          {!isfalse(textData.privateSupplier) && textData.privateSupplier != -1 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                              {textData.privateSupplier.map((item, index) => {
                                return (
                                  <div className={Styles.selectData} key={index}>
                                    <span>
                                      {/* {item.name}<Icon type="close" /> */}
                                      {item.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <span>
                            {isfalse(textData.platformSupplier)
                              ? null
                              : textData.platformSupplier == -1
                                ? '已选择全部平台供应商'
                                : '已选择平台供应商库(' + textData.platformSupplier.length + ')'}
                          </span>
                          {textData.platformSupplier != -1 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                              {textData.platformSupplier.map((item, index) => {
                                return (
                                  <div className={Styles.selectData} key={index}>
                                    <span>{item.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  )}</div>
              }
            }
            if (item.ctrlType == 'chooseLabourSupplier') {
              if (!isfalse(textData)) {
                return <div>
                  {isfalse(textData) ? null : (textData.privateSupplier == -1 && textData.platformSupplier == -1 ? (
                    <div>已选择全部供应商,公开招标</div>
                  ) : (
                      <div>
                        <div>
                          <span>
                            {isfalse(textData.privateSupplier)
                              ? null
                              : textData.privateSupplier == -1
                                ? '已选择全部个人供应商'
                                : '已选择个人供应商(' + textData.privateSupplier.length + ')'}
                          </span>
                          {!isfalse(textData.privateSupplier) && textData.privateSupplier != -1 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                              {textData.privateSupplier.map((item, index) => {
                                return (
                                  <div className={Styles.selectData} key={index}>
                                    <span>
                                      {/* {item.name}<Icon type="close" /> */}
                                      {item.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <span>
                            {isfalse(textData.platformSupplier)
                              ? null
                              : textData.platformSupplier == -1
                                ? '已选择全部平台供应商'
                                : '已选择平台供应商库(' + textData.platformSupplier.length + ')'}
                          </span>
                          {textData.platformSupplier != -1 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                              {textData.platformSupplier.map((item, index) => {
                                return (
                                  <div className={Styles.selectData} key={index}>
                                    <span>{item.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  )}</div>
              }
            }
            return <span>{textData}</span>
          }
        })
      })
      columns.push({
        title: '操作',
        dataIndex: 'action',
        width: 250,
        render: (text, record) => {
          return <span onClick={() => { //在移除项时的操作
            let newReturnDta = this.state.returnData;
            let newdataSource = this.state.dataSource;
            newReturnDta.splice(record.key, 1);
            newdataSource.splice(record.key, 1);
            this.setState({
              returnData: newReturnDta,
              dataSource: newdataSource
            }, () => {

              console.log(this.state.returnData, 'returnData')

              if (!isfalse(this.props.onOk)) {
                this.props.onOk(this.state.returnData)
              }
            })
          }}><a>移除</a></span>
        }
      })
    }
    this.setState({
      dataSource: dataSource,
      columns: columns,
    })
  }

  handleSubmit = (e) => { //对话框确定时对数据的处理
    e.preventDefault();

    // console.log(this.props.options,'value--values')
    let checkData = [];
    this.props.options.map(item => {
      checkData.push(item.ctrlName)
    })
    this.props.form.validateFields(checkData, (err, values) => {
      if (!err) {
        let { returnData } = this.state;
        returnData.push(values); //返回到父组件的数据
        this.setState({
          returnData,
          visible: false,
        }, () => {
          this.createTable(this.state.returnData); //创建显示的Table
          if (!isfalse(this.props.onOk)) {
            this.props.onOk(this.state.returnData)
          }
        });
      }
    });
  }
  viewTable = (Data) => { //查看时的table

    let dataSource = [], columns = [];
    Data.map((item, i) => {
      dataSource.push({
        key: i,
        [Object.keys(item)[i]]: item
      })
    })
    this.props.options.map((item, index) => {
      columns.push({
        title: item.chnName,
        width: 250,
        dataIndex: item.ctrlName,
        render: (text, record) => {
          let showData = record[Object.keys(record)[1]]
          let textData = showData[item.ctrlName];
          if (item.ctrlType == 'number' || item.ctrlType == 'money') {
            textData = textData + JSON.parse(item.extentionProps).unit
          }
          if (item.ctrlType == 'area') {
            textData = isfalse(textData) ? '' : textData.provinceName + textData.cityName + textData.districtName
          }
          if (item.ctrlType == 'date') {
            textData = isfalse(showData[item.ctrlName]) ? '' : moment(showData[item.ctrlName]).format(JSON.parse(item.extentionProps).format)
          }
          if (item.ctrlType == 'datearea') {
            textData = isfalse(showData[item.ctrlName]) ? '' : [moment(showData[item.ctrlName][0]).format(JSON.parse(item.extentionProps).format), '至', moment(showData[item.ctrlName][1]).format(JSON.parse(item.extentionProps).format)]
          }
          if (item.ctrlType == 'attach') { //附件显示
            if (!isfalse(textData)) {
              return textData.map((attactitem, i) => {
                return <div key={i}><a href={attactitem.fullFilename} target="_blank">{attactitem.originalFilename + '.' + attactitem.extention}</a></div>
              })
            }
          }
          if (item.ctrlType == 'user') {
            if (!isfalse(textData)) {

              let showData = isJSON(textData)? JSON.parse(textData):textData
              textData = showData.displayName
            }
          }
          if (item.ctrlType == 'chooseProject') {
            if (!isfalse(textData)) {
              textData = textData.projectName
            }
          }
          if(item.ctrlType=='chooseMaterialTender'){
            if(!isfalse(textData)){
              return (
                <div>
                  <div>{textData.projectName}</div>
                  <div>招：{textData.tenderCategory}</div>
                </div>
              );
            }
          }
          if(item.ctrlType=='chooseLabourTender'){
            if(!isfalse(textData)){
              return (
                <div>
                  <div>{textData.projectName}</div>
                  <div>招：{textData.tenderCategory}</div>
                </div>
              );
            }
          }
          if (item.ctrlType == 'material') {
            if (!isfalse(textData)) {
              console.log(textData, 'textData')
              textData = textData.categoryText
            }
          }
          if (item.ctrlType == 'chooseMaterialSupplier') {
            if (!isfalse(textData)) {
              return <div>
                {isfalse(textData) ? null : (textData.privateSupplier == -1 && textData.platformSupplier == -1 ? (
                  <div>已选择全部供应商,公开招标</div>
                ) : (
                    <div>
                      <div>
                        <span>
                          {isfalse(textData.privateSupplier)
                            ? null
                            : textData.privateSupplier == -1
                              ? '已选择全部个人供应商'
                              : '已选择个人供应商(' + textData.privateSupplier.length + ')'}
                        </span>
                        {!isfalse(textData.privateSupplier) && textData.privateSupplier != -1 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {textData.privateSupplier.map((item, index) => {
                              return (
                                <div className={Styles.selectData} key={index}>
                                  <span>
                                    {/* {item.name}<Icon type="close" /> */}
                                    {item.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <span>
                          {isfalse(textData.platformSupplier)
                            ? null
                            : textData.platformSupplier == -1
                              ? '已选择全部平台供应商'
                              : '已选择平台供应商库(' + textData.platformSupplier.length + ')'}
                        </span>
                        {textData.platformSupplier != -1 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {textData.platformSupplier.map((item, index) => {
                              return (
                                <div className={Styles.selectData} key={index}>
                                  <span>{item.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                )}</div>
            }
          }
          if (item.ctrlType == 'chooseLabourSupplier') {
            if (!isfalse(textData)) {
              return <div>
                {isfalse(textData) ? null : (textData.privateSupplier == -1 && textData.platformSupplier == -1 ? (
                  <div>已选择全部供应商,公开招标</div>
                ) : (
                    <div>
                      <div>
                        <span>
                          {isfalse(textData.privateSupplier)
                            ? null
                            : textData.privateSupplier == -1
                              ? '已选择全部个人供应商'
                              : '已选择个人供应商(' + textData.privateSupplier.length + ')'}
                        </span>
                        {!isfalse(textData.privateSupplier) && textData.privateSupplier != -1 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {textData.privateSupplier.map((item, index) => {
                              return (
                                <div className={Styles.selectData} key={index}>
                                  <span>
                                    {/* {item.name}<Icon type="close" /> */}
                                    {item.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <span>
                          {isfalse(textData.platformSupplier)
                            ? null
                            : textData.platformSupplier == -1
                              ? '已选择全部平台供应商'
                              : '已选择平台供应商库(' + textData.platformSupplier.length + ')'}
                        </span>
                        {textData.platformSupplier != -1 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {textData.platformSupplier.map((item, index) => {
                              return (
                                <div className={Styles.selectData} key={index}>
                                  <span>{item.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                )}</div>
            }
          }


          return <span>{textData}</span>
        }
      })
    })


    return  <Table
    columns={columns}
    dataSource={dataSource}
    pagination={false}
    bordered={true}
    scroll={{ x: columns.length > 5 ? columns.length*20+1000 : null }}
  />
  }

  setfileList = (data) => {
    if (this.state.isUpdata) {
      this.setState({
        returnData: data,
        isUpdata: false
      }, () => {
        this.createTable(this.state.returnData)
      })
    }
  }

  render() {

    if (!isfalse(this.props.default) && !this.props.isView) {
      this.setfileList(this.props.default)
    }

    return (
      <div>
        {this.props.isView ? (isfalse(this.props.default) ? null : this.viewTable(this.props.default)) :
          <Button type="primary" onClick={this.showModal}>
            添加一项
          </Button>
        }

        <Modal
          title="添加子表单"
          visible={this.state.visible}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
          width={800}
        >
          <Form onSubmit={this.handleSubmit}>
            {isfalse(this.props.options) ? null : this.createFormItem(this.props.options)}
          </Form>
        </Modal>
        {isfalse(this.state.dataSource) ? null : <Table
          columns={this.state.columns}
          dataSource={this.state.dataSource}
          pagination={false}
          bordered={true}
          scroll={{ x: this.state.columns.length > 5 ? 1000 : null }}
        />
        }
      </div>
    )
  }
}
