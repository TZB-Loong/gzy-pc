/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Table,
  Spin,
  Pagination,
  Icon,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Modal,
  Form,
  List,
  Select,
  message,
  Upload,
  Menu,
  Dropdown,
} from 'antd';
import { Link } from 'dva/router';
import { Resizable } from 'react-resizable';
import ImportExcel from '../Common/ImportExcel';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';
import { getDownloadUrl, isAuth } from '../../utils/utils';
import { isfalse, timestampToTime, bubbleSort, pick } from '../../Tools/util_tools';
import Empty from '../Common/Empty';
import FileView from '../Common/FileView';
import styles from './style.less';
import Setup from './Setup';
import cnCity from '../../utils/area.json';
import FiterIcon from '../Common/FiterIcon';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
const ListItem = List.Item;
const Search = Input.Search;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;
const confirm = Modal.confirm;

const ResizeableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable width={width} height={0} onResize={onResize}>
      <th {...restProps} />
    </Resizable>
  );
};

@Form.create()
@connect(({ labourSupplier, loading, common }) => ({
  labourSupplier,
  headerLoading: loading.effects['labourSupplier/bizObjectListSettingList'],
  loading: loading.effects['labourSupplier/queryLabourList'],
  common,
}))
export default class LabourSupplier extends Component {
  state = {
    searchText: '',
    loadingDownLoad: false,
    importVisible: false,
    modalDetailVisible: false,
    selectedRowKeys: [],
    filteredInfo: {},
    filtersClass: [], //采购分类
    totalPages: 0, //总页数
    params: {
      keyword: '', // 关键字查询
      current: 1, // 当前页数
      size: 10, // 每页显示记录条数
    },
    selectLists: [],
    dataSource: [], //Table数据源
    dataCahge: false, //dataSource 本地发送变化时
    SetupVisible: false, //控制自定义字段显示问题
    searchName: '', // 搜索框
    columns: [
      //Table 表头数据
      // {
      //   title: '编号',
      //   width: 80,
      //   dataIndex: 'key',
      //   key: 'key',
      //   fixed: 'left',
      // },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 100,
        render: (record, index) => {
          return (
            <div>
              <a href="javascript:;" onClick={() => this.operation(record, 'edit')}>
                编辑
              </a>
              <Divider type="vertical" />
              <a href="javascript:;" onClick={() => this.operation(record, 'delete')}>
                删除
              </a>
            </div>
          );
        },
      },
    ],
    isEdit: false, //是否编辑
    m_detail: {}, // 行数据
    modalVisible: false,
    s_modalVisible: false, // 查看modal
    fileList: [],
    fileListView: [], // 查看考察报告
    otherFile: [], // 其他附件
    otherFileView: [], // 查看其他附件
    historicalFile: [], // 历史附件
    historicalFileView: [], // 查看历史附件
    previewVisible: false,
    previewImage: '',
    listData: [],
    remarkSize: 0, // 备注字数
    jointProjectSize: 0, // 合作项目字数
    contact: [
      {
        contactName: '',
        phone: '',
      },
    ],
    supplyValue: [], // 供货区域
    btnStatus: false, //按钮点击状态
  };
  components = {
    header: {
      cell: ResizeableTitle,
    },
  };
  bizObjectMetadataList = () => {
    //获取自定义字段列表
    const { dispatch, labourSupplier } = this.props;
    dispatch({
      type: 'labourSupplier/bizObjectList',
      payload: { bizId: labourSupplier.bizId, bizCode: labourSupplier.bizCode },
    }).then(() => {
      let { labourSupplier } = this.props;
      let bizObjectMetadataList = labourSupplier.bizObjectList;

      if (bizObjectMetadataList && !isfalse(bizObjectMetadataList.data)) {
        this.setState({
          listData: bizObjectMetadataList.data,
        });
      }
    });
  };

  //字典查询
  multipleType = () => {
    const { dispatch } = this.props;
    // 字典查询
    let typeCodes = ['contractType', 'evaluateLevel', 'workType', 'scale'];
    let bodyData = {};
    bodyData.typeCodes = typeCodes.toString();
    // const { dispatch } = this.props;
    dispatch({
      type: 'common/multipleType',
      payload: bodyData,
    }).then(() => {
      // console.log(this.props.common.multipleTypeData);
    });
  };

  componentDidMount() {
    this.bizObjectMetadataList(); //获取自定义字段列表
    const { labourSupplier } = this.props;
    this.queryLaoburListTitle({ listCode: labourSupplier.listCode });

    this.multipleType();
  }

  rerequest = () => {
    const { labourSupplier } = this.props;
    this.setState(
      {
        columns: [
          //默认的两个表头
          {
            title: '编号',
            width: 80,
            dataIndex: 'key',
            key: 'key',
            fixed: 'left',
          },
          {
            title: '操作',
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (record, index) => {
              return (
                <div>
                  <a href="javascript:;" onClick={() => this.operation(record, 'edit')}>
                    编辑
                  </a>
                  <Divider type="vertical" />
                  <a href="javascript:;" onClick={() => this.operation(record, 'delete')}>
                    删除
                  </a>
                </div>
              );
            },
          },
        ],
      },
      () => this.queryLaoburListTitle({ listCode: labourSupplier.listCode })
    ); // 重新请求表头数据)
  };

  SetupVisibleChange = visible => {
    //改变Setup 里面 Modal的状态
    this.setState({
      SetupVisible: visible,
    });
  };

  bizObjectListSettingShow = headerData => {
    //所有表头的字段 //(在点击弹出的时候调用)

    /**
     * headerData:请求参数
     */

    const { dispatch } = this.props;

    dispatch({
      type: 'labourSupplier/bizObjectListSettingShow',
      payload: headerData,
    }).then(() => {
      this.SetupVisibleChange(true);
    });
  };

  saveBizObjectList = headerData => {
    //保存修改后的字段
    /**
     * headerData:保存时提交的参数
     */
    const { dispatch } = this.props;
    dispatch({
      //保存
      type: 'labourSupplier/bizObjectListSettingEdit',
      payload: headerData,
    }).then(() => {
      this.rerequest();
    });
  };

  queryLaoburListTitle = listCode => {
    //表头的显示
    const { dispatch } = this.props;
    dispatch({
      type: 'labourSupplier/bizObjectListSettingList',
      payload: listCode,
    }).then(() => {
      this.queryLabourList();
      if (!isfalse(this.props.labourSupplier.bizObjectListSettingList)) {
        let materialTitleData = this.props.labourSupplier.bizObjectListSettingList.data
          .fieldSetting;
        materialTitleData = bubbleSort(JSON.parse(materialTitleData));
        let columns = this.state.columns; //表头格式

        for (var i in materialTitleData) {
          let titleData = materialTitleData[i]; //表头的内容
          let options = materialTitleData[i].options; //筛选下拉菜单里面的内容
          let allowFilter = materialTitleData[i].allowFilter; //是否允许筛选

          let InsertData = {
            title: materialTitleData[i].chnName,
            width: isfalse(materialTitleData[i].width) ? 200 : materialTitleData[i].width,
            dataIndex: materialTitleData[i].ctrlName,
            key: materialTitleData[i].ctrlName,
            fieldType: materialTitleData[i].fieldType,
            sorter: materialTitleData[i].allowSort,
            filterIcon: materialTitleData[i].allowFilter
              ? filtered => (
                  <FiterIcon
                    screenOnClick={this.screenOnClick}
                    referedKey={titleData.referedDicKey}
                    titleData={titleData}
                    type="dropDown"
                  />
                )
              : null,
            filterDropdown: materialTitleData[i].allowFilter ? () => <div>{null}</div> : null,
            render:
              materialTitleData[i].ctrlName == 'name'
                ? (tex, record) => {
                    return (
                      <a href="javascript:;" onClick={() => this.operation(record, 'detail')}>
                        {tex}
                      </a>
                    );
                  }
                : materialTitleData[i].ctrlName == 'editTime'
                  ? (tex, record) => {
                      // console.log(record,'record',(materialTitleData[i]))
                      return (
                        <div>
                          <div style={{ textAlign: 'center' }}>{record.modifierName}</div>
                          <div style={{ textAlign: 'center' }}>
                            {timestampToTime(record.modifyTime, 'HM')}
                          </div>
                        </div>
                      );
                    }
                  : null,
          };
          columns.splice(columns.length - 1, 0, InsertData);
        }

        this.setState({
          columns: columns,
        });
      }
    });
  };

  //自定的filtersDom 筛选
  screenOnClick = params => {
    let oldParams = this.state.params;
    let newParams = {};
    if (isfalse(oldParams.queryConditions)) {
      //当没有筛选过的时候(第一次进行筛选)
      newParams = Object.assign({}, this.state.params, {
        queryConditions: JSON.stringify([params]),
      });
    } else {
      //第二次进行筛选
      let firstQueryConditions = JSON.parse(oldParams.queryConditions);

      firstQueryConditions.map((item, index) => {
        if (item.fieldName == params.fieldName) {
          firstQueryConditions.splice(index, 1);
        }
      });
      firstQueryConditions.push(params);
      newParams = Object.assign({}, this.state.params, {
        queryConditions: JSON.stringify(firstQueryConditions),
      });
    }

    this.setState(
      {
        params: newParams,
      },
      () => {
        this.queryLabourList();
      }
    );
  };

  handleTableChange = (pagination, filters, sorter) => {
    //表头筛选
    let oldParams;
    if (!isfalse(sorter)) {
      let materialName = filters.materialName,
        column = sorter.column;

      for (var i in materialName) {
        materialName = materialName[i] + (materialName.length - 1 <= i ? ',' : null);
      }
      let orderBy = column.key;
      if (column.key == 'scale') {
        orderBy = 'scaleId';
      }
      if (column.key == 'serviceArea') {
        orderBy = 'serviceAreaId';
      }
      if (column.key == 'evaluateLevel') {
        orderBy = 'evaluateLevelId';
      }
      if (column.key == 'workType') {
        orderBy = 'workTypeId';
      }
      oldParams = {
        orderBy: orderBy,
        orderType: sorter.order == 'ascend' ? 'ASC' : 'DESC',
      };
    }

    this.setState(
      {
        params: Object.assign({}, this.state.params, oldParams),
      },
      () => {
        this.queryLabourList();
      }
    );
  };

  queryLabourList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'labourSupplier/queryLabourList',
      payload: this.state.params,
    }).then(() => {
      const { labourSupplier } = this.props;
      if (!isfalse(labourSupplier.labourList)) {
        let labourList = labourSupplier.labourList,
          source = [];
        labourList.records.map((item, index) => {
          if (!isfalse(item.customerFields)) {
            JSON.parse(item.customerFields).map(customerField => {
              item[customerField.fieldname] = isfalse(customerField.value)
                ? null
                : customerField.value;
            });
          }
          // item.key = index + 1;
          item.key = index + 1 + (this.state.params.current - 1) * this.state.params.size;
          item.createTime = timestampToTime(item.createTime); //时间戳转换为时间格式
          item.remark = item.remark
            ? item.remark.replace(/<br\/>/g, '\n').replace(/\&nbsp\;/g, ' ')
            : null; //
          item.jointProject = item.jointProject ? item.jointProject.replace(/<br\/>/g, '\n') : null; //
          if (item.supplierContactList && JSON.parse(item.supplierContactList).length > 0) {
            let supplierContactList = JSON.parse(item.supplierContactList);
            item.contactName = supplierContactList[0].contactName;
            item.phone = supplierContactList[0].phone;
          }
          source.push(item);
        });
        this.setState({
          totalPages: labourList.total,
          dataSource: source,
          dataCahge: true,
        });
      }
    });
    const columns = this.state.columns.map((col, index) => ({
      ...col,
      onHeaderCell: column => ({
        width: column.width,
        onResize: this.handleResize(index),
      }),
    }));
    this.setState({
      columns: columns,
    });
  };
  handleFilter(value, record, type, header) {
    return record[type].indexOf(value) === 0;
  }
  handleSearch = value => {
    let searchParams = [{ fieldName: 'keyword', fieldValue: value, fieldType: 5 }];

    // let oldParams = Object.assign({}, this.state.params, { serchName: value });
    let oldParams = Object.assign({}, this.state.params, {
      queryConditions: JSON.stringify(searchParams),
      current: 1,
    });
    this.setState({ params: oldParams }, () => {
      this.queryLabourList();
    });
  };
  handleSubmit = e => {
    e.preventDefault();
    let that = this;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // 自定义的选项
        let moreData = [];
        that.state.listData.map(item => {
          let customize = {};
          customize.fieldname = item.ctrlName;
          customize.value = values[item.ctrlName];
          moreData.push(customize);
          delete values[item.ctrlName];
        });
        values.customerFields = JSON.stringify(moreData);
        values.remark = values.remark
          ? values.remark.replace(/\r{0,}\n/g, '<br/>').replace(/\s/g, '&nbsp;')
          : null;
        values.jointProject = values.jointProject
          ? values.jointProject.replace(/\r{0,}\n/g, '<br/>').replace(/\s/g, '&nbsp;')
          : null;
        let fileData = [];
        if (values.reportAttachIds) {
          values.reportAttachIds.fileList.map(item => {
            if (item.status === 'done') {
              fileData.push(item.response.data ? item.response.data.id : '');
            }
          });
          //考察报告
          values.reportAttachIds = fileData.toString();
        }

        if (values.otherAttachIds) {
          let otherData = [];
          values.otherAttachIds.fileList.map(item => {
            if (item.status === 'done') {
              otherData.push(item.response.data ? item.response.data.id : '');
            }
          });
          //其他附件
          values.otherAttachIds = otherData.toString();
        }
        let historicalData = [];
        if (values.historicalContractIds) {
          values.historicalContractIds.fileList.map(item => {
            if (item.status === 'done') {
              historicalData.push(item.response.data ? item.response.data.id : '');
            }
          });
          //历史附件
          values.historicalContractIds = historicalData.toString();
        }
        // 编辑
        if (that.state.isEdit) {
          values.id = that.state.m_detail.id;
        }
        // 联系人
        if (this.state.contact) {
          values.supplierContactList = JSON.stringify(this.state.contact);
        }
        // 服务区域
        if (this.state.supplyValue) {
          values.serviceAreaId = this.state.supplyValue.toString();
        }
        // // 服务区域
        // if (values.serviceAreaId) {
        //   values.serviceAreaId = values.serviceAreaId.toString();
        // }
        // 工种
        if (values.workTypeId) {
          values.workTypeId = values.workTypeId.toString();
        }
        const { dispatch } = that.props;
        this.setState({ btnStatus: true });
        dispatch({
          type: 'labourSupplier/saveLabourlList',
          payload: values,
        }).then(() => {
          const {
            labourSupplier: { saveStatus },
          } = that.props;
          this.setState({ btnStatus: false });
          if (saveStatus) {
            this.queryLabourList();
            this.setState({
              modalVisible: false,
            });
            if (that.state.isEdit) {
              message.success('编辑成功');
            } else {
              message.success('添加成功');
            }
          }
        });
      }
    });
  };
  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }
  closeModalVisible(s_modalVisible) {
    this.setState({ s_modalVisible });
  }
  // 查询考察报告图片文件
  getReportAttachIds(id) {
    this.props
      .dispatch({
        type: 'common/queryAttachList',
        payload: { bizCode: 'SUPPLIER_LABOUR', bizId: id },
      })
      .then(() => {
        let fileList = [],
          otherfileList = [],
          historicalFileList = [];
        (this.props.common.filesPath.data
          ? this.props.common.filesPath.data.attachmentVOList
          : []
        ).map((item, i) => {
          if (item.ctrlName == 'REPORT_INCESTIGATION_LABOUR') {
            // 考察报告
            fileList.push({
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
              uid: item.id,
              fileType: item.fileType,
            });
          } else if (item.ctrlName == 'OTHER_ACCESSORIES_LABOUR') {
            // 其它附件
            otherfileList.push({
              uid: item.id,
              fileType: item.fileType,
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
            });
          } else if (item.ctrlName == 'LABOUR_HISTORICAL_CONTRACT') {
            // 历史附件
            historicalFileList.push({
              uid: item.id,
              fileType: item.fileType,
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
            });
          }
        });
        this.setState({
          attachmentVOList: this.props.common.filesPath.data
            ? this.props.common.filesPath.data.attachmentVOList
            : [],
          fileList: fileList,
          fileListView: fileList,
          otherFile: otherfileList,
          otherFileView: otherfileList,
          historicalFile: historicalFileList,
          historicalFileView: historicalFileList,
        });
      });
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
  // 编辑时预览图片及文件
  fileType(fileUrl, fileType) {
    if (fileType.indexOf('image') > -1) {
      this.setState({
        previewImage: fileUrl,
        previewVisible: true,
      });
    } else {
      window.open(fileUrl);
    }
  }
  // 点击预览
  handlePreview = file => {
    if (file.url) {
      this.fileType(file.url, file.fileType);
    } else {
      if (file.status === 'done' && file.response.data) {
        this.fileType(file.response.data.fullFilename, file.response.data.fileType);
      } else {
        message.error('文件错误');
        return;
      }
    }
  };
  handleCancel = () => this.setState({ previewVisible: false });
  operation = (key, type) => {
    let that = this;
    if (type === 'delete') {
      confirm({
        title: '您选择了从您的供应商库中删除该供应商信息?',
        content: '删除后，该供应商信息将被您的供应商库中移除，并无法恢复。您确定删除吗?',
        bodyStyle: 'styles',
        onOk() {
          const { dispatch } = that.props;
          dispatch({
            type: 'labourSupplier/deleteLabourSupplier',
            payload: { supplierLabourId: key.id },
          }).then(() => {
            const { labourSupplier } = that.props;
            let status = labourSupplier.deleteStatus;
            if (status) {
              message.success('删除成功!');
              that.queryLabourList();
            } else {
              message.error('删除失败!');
            }
          });
        },
        onCancel() {
          // console.log('Cancel');
        },
      });
    }
    if (type === 'edit') {
      // 编辑时默认考察报告及其他附件
      that.getReportAttachIds(key.id);
      that.setState({
        isEdit: true,
        m_detail: key,
        modalVisible: true,
        remarkSize: key.remark ? key.remark.length : 0,
        jointProjectSize: key.jointProject ? key.jointProject.length : 0,
        supplyValue: key.serviceAreaId ? key.serviceAreaId.split(',') : [],
        contact:
          key.supplierContactList && JSON.parse(key.supplierContactList).length > 0
            ? JSON.parse(key.supplierContactList)
            : [
                {
                  contactName: '',
                  phone: '',
                },
              ],
      });
    }
    if (type === 'detail') {
      // 查看附件
      that.getReportAttachIds(key.id);
      that.setState({
        isEdit: false,
        m_detail: key,
        s_modalVisible: true,
        contact:
          key.supplierContactList && JSON.parse(key.supplierContactList).length > 0
            ? JSON.parse(key.supplierContactList)
            : [
                {
                  contactName: '',
                  phone: '',
                },
              ],
      });
    }
  };
  // 打开导入窗口
  openImport = () => {
    this.setState({
      importVisible: true,
    });
  };
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };
  // 分页事件
  onPageChange = currPage => {
    let params = Object.assign({}, this.state.params, { current: currPage });
    this.setState(
      {
        params: params,
      },
      () => {
        this.queryLabourList();
      }
    );
  };
  onSizeChange = (current, pageSize) => {
    let params = Object.assign({}, this.state.params, { current: current, size: pageSize });
    this.setState(
      {
        params: params,
      },
      () => {
        this.queryLabourList();
      }
    );
  };
  handleResize = index => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return { columns: nextColumns };
    });
  };

  // 添加联系人
  addContact() {
    let newNode = this.state.contact;
    if (newNode.length >= 3) {
      return;
    }
    newNode.push({
      contactName: '',
      phone: '',
    });
    this.setState({ contact: newNode });
  }
  // 删除一行联系人
  deleteContact(index) {
    let moveArr = this.state.contact;
    moveArr.splice(index, 1);
    this.setState({ contact: moveArr });
    // 删除时对输入框重新赋值
    moveArr.map((item, index) => {
      this.props.form.setFieldsValue({
        ['contactName' + (index > 0 ? index : '')]: item.contactName,
        ['phone' + (index > 0 ? index : '')]: item.phone,
      });
    });
  }
  // 联系人输入框输入时
  changeContact(e, index, type) {
    let contact = this.state.contact;
    // contact.map((item,i)=>{
    //     if(i != index){
    //       if(e.target.value == item.phone){
    //         message.error('手机号码重复')
    //       }
    //     }
    //   })
    contact[index][type] = e.target.value;
    this.setState({
      contact: contact,
    });
    let contactData = type + (index > 0 ? index : '');
    this.props.form.setFieldsValue({
      [contactData]: e.target.value,
    });
  }
  // 搜索框清空
  emitEmpty = () => {
    this.userNameInput.focus();
    this.handleSearch('');
    this.setState({ searchName: '' });
  };

  onDeselect(value) {
    let newSupplyValue = this.state.supplyValue;
    let index = newSupplyValue.indexOf(value);
    if (index > -1) {
      newSupplyValue.splice(index, 1);
    }
    this.setState({
      supplyValue: newSupplyValue,
    });
  }
  onSelect(value) {
    let newSupplyValue = this.state.supplyValue;
    newSupplyValue.push(value);
    if (value == '0') {
      newSupplyValue = ['0'];
    } else {
      let index = newSupplyValue.indexOf('0');
      if (index > -1) {
        newSupplyValue.splice(index, 1);
      }
    }
    this.setState({
      supplyValue: newSupplyValue,
    });
  }

  compareToFirstPhone = (rule, value, callback) => {
    const form = this.props.form;
    let phones = ['phone', 'phone1', 'phone2'];
    phones.map(item => {
      if (rule.field != item) {
        if (value && value == form.getFieldValue(item)) {
          callback('手机号码重复');
        }
      }
    });

    callback();
  };
  render() {
    let that = this;
    const { getFieldDecorator } = this.props.form;
    const { labourSupplier, loading } = this.props;
    let { multipleTypeData } = this.props.common;
    let {
      selectedRowKeys,
      dataSource,
      dataCahge,
      columns,
      loadingDownLoad,
      isEdit,
      fileList,
      previewVisible,
      previewImage,
      m_detail,
      contact,
      searchName,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      fixed: true,
    };
    const formItemLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
        md: { span: 14 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 6 },
      },
    };
    const hasSelected = selectedRowKeys.length > 0;

    const menu = (
      <Menu>
        <Menu.Item key="0">
          <a
            href="javascript:void(0)"
            onClick={this.bizObjectListSettingShow.bind(this, {
              listCode: labourSupplier.listCode,
            })}
          >
            设置显示字段
          </a>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to="/addfilelabour">添加自定义字段</Link>
        </Menu.Item>
      </Menu>
    );
    const suffix = searchName ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;

    return (
      <PageHeaderLayout>
        <Spin spinning={loading}>
          <Card title={labourSupplier.data} loading={!dataCahge}>
            {!dataCahge ? null : dataSource.length > 0 ||
            !isfalse(this.state.params.queryConditions) ? (
              <div>
                <Row>
                  <Col span={12}>
                    <Button
                      onClick={() => {
                        this.setState({
                          isEdit: false,
                          modalVisible: true,
                          m_detail: {},
                          fileList: [],
                          otherFile: [],
                          historicalFile: [],
                          remarkSize: 0, // 备注字数
                          jointProjectSize: 0,
                          supplyValue: [],
                          contact: [
                            {
                              contactName: '',
                              phone: '',
                            },
                          ],
                        });
                      }}
                      style={{ marginRight: 30 }}
                      type="primary"
                    >
                      &nbsp;添加供应商
                    </Button>
                    <Button onClick={this.openImport} type="primary">
                      &nbsp;&nbsp;批量导入供应商
                    </Button>
                  </Col>
                  <Col span={11} style={{ textAlign: 'right' }}>
                    <Search
                      placeholder="请输入公司、联系人、手机号查询"
                      enterButton="搜索"
                      style={{ width: '300px' }}
                      onSearch={value => this.handleSearch(value)}
                      suffix={suffix}
                      ref={node => (this.userNameInput = node)}
                      value={searchName}
                      onChange={e => {
                        this.setState({ searchName: e.target.value });
                      }}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 15 }}>
                  <Row>
                    <Col span={23}>
                      <Table
                        dataSource={dataSource}
                        columns={columns}
                        bordered
                        rowKey={record => record.id}
                        // rowSelection={rowSelection}
                        className={styles.resizeTable}
                        components={this.components}
                        scroll={{ x: 1400, y: this.state.params.size > 10 ? 600 : null }}
                        pagination={false}
                        onChange={this.handleTableChange}
                      />
                    </Col>
                    <Col span={1} style={{ textAlign: 'center' }}>
                      <Dropdown overlay={menu} trigger={['click']}>
                        <a href="javascript:void(0)">
                          <Icon type="setting" style={{ fontSize: '26px', lineHeight: '55px' }} />
                        </a>
                      </Dropdown>
                      {this.state.SetupVisible ? (
                        <Setup
                          visible={this.state.SetupVisible}
                          visibleChange={this.SetupVisibleChange}
                          materialSupplier={this.props.labourSupplier}
                          onOk={this.saveBizObjectList}
                        />
                      ) : null}
                    </Col>
                  </Row>
                </div>
                <div style={{ margin: '20px 0', textAlign: 'right' }}>
                  <Row>
                    <Col span={12} style={{ textAlign: 'left' }}>
                      {/*<Button
                      type="primary"
                      onClick={() => {
                        this.setState({ loadingDownLoad: true });
                        setTimeout(() => {
                          this.setState({
                            loadingDownLoad: false,
                          });
                        }, 2000);
                      }}
                      href={getDownloadUrl(
                        '/supplier/excel/exportSupplierLabour?supplierIds=' +
                          selectedRowKeys.toString()
                      )}
                      disabled={!hasSelected}
                      loading={loadingDownLoad}
                    >
                      导出选中供应商
                    </Button>*/}
                      &nbsp;&nbsp;&nbsp;
                      {isAuth('supplier_export') ? (
                        <Button
                          // type="primary"
                          // onClick={()=>this.exportExl(1)}
                          href={getDownloadUrl('/supplier/excel/exportSupplierLabour')}
                        >
                          导出全部供应商
                        </Button>
                      ) : null}
                    </Col>
                    <Col span={11}>
                      {this.state.totalPages > 10 ? (
                        <div style={{ textAlign: 'right' }}>
                          <Row>
                            {/*<Col span={12} style={{ textAlign: 'left' }} />
                          <Col span={12}>*/}
                            <Pagination
                              pageSize={this.state.params.size}
                              current={this.state.params.current}
                              onChange={value => this.onPageChange(value)}
                              onShowSizeChange={(current, pageSize) =>
                                this.onSizeChange(current, pageSize)
                              }
                              total={this.state.totalPages}
                              showQuickJumper
                              showSizeChanger
                              pageSizeOptions={['10', '20', '50', '100']}
                            />
                            {/*</Col>*/}
                          </Row>
                        </div>
                      ) : null}
                    </Col>
                  </Row>
                </div>
              </div>
            ) : (
              <div>
                <Empty msg="劳务供应商" />
                <div style={{ textAlign: 'center' }}>
                  <Button type="primary">
                    <a
                      onClick={() => {
                        this.setState({ isEdit: false, modalVisible: true });
                      }}
                    >
                      立即添加
                    </a>
                  </Button>
                  &nbsp;&nbsp;
                  <Button type="primary" onClick={this.openImport}>
                    批量导入
                  </Button>
                </div>
              </div>
            )}
            <Modal
              bodyStyle={{ maxHeight: 650 }}
              title="供应商信息 "
              centered
              visible={this.state.modalDetailVisible}
              onCancel={() => this.setState({ modalDetailVisible: false })}
              width={600}
            >
              <Row>
                <Col span={4}>公司名称</Col>
                <Col />
              </Row>
            </Modal>
            {this.state.importVisible ? (
              <ImportExcel
                visible={true}
                onCancel={() => {
                  this.setState({ importVisible: false });
                }}
                importType={'labour'}
                reload={() => {
                  let params = Object.assign({}, this.state.params, { current: 1 });
                  this.setState({ params: params }, () => {
                    this.queryLabourList();
                    this.multipleType();
                  });
                }}
                modalTitle="批量导入供应商"
                downLoadUrl="/supplier/download/labourTemplate"
                importUrl="/supplier/excel/importSupplierLabour"
              />
            ) : null}
            <Modal
              bodyStyle={{ maxHeight: 650, overflowY: 'scroll', paddingBottom: 0 }}
              title={isEdit ? '编辑劳务供应商信息 ' : '添加劳务供应商信息 '}
              centered
              destroyOnClose={true} //关闭时销毁 Modal 里的子元素
              maskClosable={false}
              visible={this.state.modalVisible}
              onOk={() => this.setModalVisible(false)}
              onCancel={() => this.setModalVisible(false)}
              footer={null}
              width={700}
            >
              <Form
                onSubmit={this.handleSubmit}
                style={{ marginTop: 8 }}
                className={styles.FormLabel}
              >
                <FormItem
                  style={{ display: isEdit ? null : 'none' }}
                  {...formItemLayout}
                  label="供应商编码："
                >
                  <Input disabled value={m_detail.supplierCode} />
                </FormItem>
                <FormItem {...formItemLayout} label="供应商名称：">
                  {getFieldDecorator('name', {
                    rules: [
                      {
                        required: true,
                        message: '请输入供应商名称',
                      },
                      {
                        max: 50,
                        message: '最多输入50个字符',
                      },
                    ],
                    initialValue: isEdit ? m_detail.name : '',
                  })(<Input placeholder="请输入供应商名称" />)}
                </FormItem>
                {contact.length > 0
                  ? contact.map((item, index) => {
                      return (
                        <FormItem
                          key={index}
                          label={
                            <span>
                              <span style={{ color: 'red', marginRight: 4, fontFamily: 'SimSun' }}>
                                *
                              </span>
                              联系人
                              {index > 0 ? index : null}
                            </span>
                          }
                          {...formItemLayout}
                        >
                          <Col span={11}>
                            <FormItem>
                              {getFieldDecorator('contactName' + [index > 0 ? index : null], {
                                rules: [
                                  {
                                    required: true,
                                    message: '请输入联系人',
                                  },
                                  {
                                    max: 10,
                                    message: '最多输入10个字',
                                  },
                                ],
                                initialValue: isEdit ? item.contactName : null,
                              })(
                                <Input
                                  placeholder="请输入联系人"
                                  onChange={e => {
                                    that.changeContact(e, index, 'contactName');
                                  }}
                                />
                              )}
                            </FormItem>
                          </Col>
                          <Col span={1} />
                          <Col span={11} style={{ display: 'inline-block' }}>
                            <FormItem>
                              {getFieldDecorator('phone' + [index > 0 ? index : null], {
                                rules: [
                                  {
                                    pattern: /^[1][3,4,5,7,8][0-9]{9}$/,
                                    message: '请输入正确格式的手机号码',
                                  },
                                  {
                                    required: true,
                                    message: '请输入手机号码',
                                  },
                                  {
                                    validator: that.compareToFirstPhone,
                                  },
                                ],
                                initialValue: isEdit ? item.phone : null,
                              })(
                                <Input
                                  placeholder="请输入手机号码"
                                  onChange={e => {
                                    that.changeContact(e, index, 'phone');
                                  }}
                                />
                              )}
                            </FormItem>
                          </Col>
                          <Col span={1}>
                            {index == 0 ? (
                              <Icon
                                style={{ fontSize: 18, padding: 5, color: '#4B85F8' }}
                                type="plus"
                                theme="outlined"
                                onClick={() => {
                                  this.addContact();
                                }}
                              />
                            ) : (
                              <Icon
                                style={{ fontSize: 18, padding: 5, color: '#4B85F8' }}
                                type="minus"
                                theme="outlined"
                                onClick={() => {
                                  this.deleteContact(index);
                                }}
                              />
                            )}
                          </Col>
                        </FormItem>
                      );
                    })
                  : null}
                {/*<FormItem {...formItemLayout} label="联系人：">
                {getFieldDecorator('contactName', {
                  rules: [
                    {
                      required: true,
                      message: '请输入联系人',
                    },
                    {
                      max: 10,
                      message: '最多输入10个字',
                    },
                  ],
                  initialValue: isEdit ? m_detail.contactName : '',
                })(<Input placeholder="请输入联系人" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="手机号码：">
                {getFieldDecorator('phone', {
                  rules: [
                    {
                      pattern: /^[1][3,4,5,7,8][0-9]{9}$/,
                      message: '请输入正确格式的手机号码',
                    },
                    {
                      required: true,
                      message: '请输入手机号码',
                    },
                  ],
                  initialValue: isEdit ? m_detail.phone : '',
                })(<Input placeholder="请输入手机号码" />)}
              </FormItem>*/}
                <FormItem {...formItemLayout} label="工种：">
                  {getFieldDecorator('workTypeId', {
                    rules: [],
                    initialValue:
                      isEdit && m_detail.workTypeId ? m_detail.workTypeId.split(',') : [],
                  })(
                    // <Input placeholder="请填写工种" />
                    <Select mode="tags" placeholder="请选择工种">
                      {(multipleTypeData.workType ? multipleTypeData.workType : []).map(function(
                        item,
                        index
                      ) {
                        return (
                          <Option key={index} value={item.dvalue}>
                            {item.dkey}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="规模：">
                  {getFieldDecorator('scaleId', {
                    rules: [],
                    initialValue: isEdit && m_detail.scaleId ? m_detail.scaleId : undefined,
                  })(
                    // <Input placeholder="请填写规模" />
                    <Select placeholder="请选择规模">
                      {(multipleTypeData.scale ? multipleTypeData.scale : []).map(function(
                        item,
                        index
                      ) {
                        return (
                          <Option key={index} value={item.dvalue}>
                            {item.dkey}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
                {/*<FormItem {...formItemLayout} label="服务区域：">
                {getFieldDecorator('serviceAreaId', {
                  rules: [],
                  initialValue:
                    isEdit && m_detail.serviceAreaId ? m_detail.serviceAreaId.split(',') : [],
                })(
                  <Select mode="tags" placeholder="请选择服务区域">
                    {cnCity.map(function(item, index) {
                      return (
                        <Option key={item.code} value={item.code.toString()}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>*/}
                <FormItem {...formItemLayout} label="服务区域：">
                  <Select
                    mode="tags"
                    placeholder="请选择服务区域"
                    value={this.state.supplyValue}
                    onDeselect={value => {
                      that.onDeselect(value);
                    }}
                    onSelect={value => {
                      that.onSelect(value);
                    }}
                  >
                    <Option value="0">全国</Option>
                    {cnCity.map(function(item, index) {
                      return (
                        <Option key={item.code} value={item.code.toString()}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                </FormItem>
                <FormItem {...formItemLayout} label="评价等级：">
                  {getFieldDecorator('evaluateLevelId', {
                    rules: [],
                    initialValue:
                      isEdit && m_detail.evaluateLevelId ? m_detail.evaluateLevelId : undefined,
                  })(
                    // <Input placeholder="请填写评价等级" />
                    <Select placeholder="请选择评价等级">
                      {(multipleTypeData.evaluateLevel ? multipleTypeData.evaluateLevel : []).map(
                        function(item, index) {
                          return (
                            <Option key={index} value={item.dvalue}>
                              {item.dkey}
                            </Option>
                          );
                        }
                      )}
                    </Select>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="付款方式：">
                  {getFieldDecorator('payWays', {
                    rules: [
                      {
                        max: 80,
                        message: '最多输入80个字符',
                      },
                    ],
                    initialValue: isEdit ? m_detail.payWays : '',
                  })(<Input placeholder="请填写付款方式" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="邮箱：">
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        type: 'email',
                        message: '邮箱格式错误',
                      },
                    ],
                    initialValue: isEdit ? m_detail.email : '',
                  })(<Input placeholder="请填写邮箱" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="施工强项：">
                  {getFieldDecorator('workStrengths', {
                    rules: [
                      {
                        max: 80,
                        message: '最多输入80个字符',
                      },
                    ],
                    initialValue: isEdit ? m_detail.workStrengths : '',
                  })(<Input placeholder="请填写施工强项" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="合作项目：">
                  {getFieldDecorator('jointProject', {
                    rules: [
                      {
                        max: 500,
                        message: '最多输入500个字',
                      },
                    ],
                    initialValue:
                      isEdit && m_detail.jointProject
                        ? m_detail.jointProject.replace(/<br\/>/g, '\n').replace(/\&nbsp\;/g, ' ')
                        : '',
                  })(
                    <TextArea
                      style={{ minHeight: 32 }}
                      placeholder="请填写合作项目"
                      rows={4}
                      onKeyUp={e => {
                        this.setState({ jointProjectSize: e.target.value.length });
                      }}
                    />
                  )}
                  <div style={{ float: 'right',marginBottom:'-35px' }}>
                    {this.state.jointProjectSize}
                    /500
                  </div>
                </FormItem>
                <FormItem {...formItemLayout} label="考察报告：">
                  {getFieldDecorator('reportAttachIds', {})(
                    <Upload
                      {...upLoadInit(
                        'file',
                        this.state.fileList,
                        'picture-card',
                        'fileList',
                        true,
                        true,
                        this,
                        '/base/attach/upload'
                      )}
                      fileList={this.state.fileList}
                      onChange={e => uploadChange(e, 'fileList', this)}
                      onPreview={this.handlePreview}
                      beforeUpload={e => beforeUpload(e, ['img'], 5)}
                    >
                      {fileList.length >= 6 ? null : <Icon type="upload" />}
                    </Upload>
                  )}
                  <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                  </Modal>
                </FormItem>
                <FormItem {...formItemLayout} label="供应商历史合同：">
                  {getFieldDecorator('historicalContractIds', {
                    valuePropName: 'historicalContractIds',
                    getValueFromEvent: this.normFile,
                  })(
                    <Upload
                      {...upLoadInit(
                        'file',
                        this.state.historicalFile,
                        '',
                        'historicalFile',
                        true,
                        true,
                        this,
                        '/base/attach/upload'
                      )}
                      fileList={this.state.historicalFile}
                      onChange={e => uploadChange(e, 'historicalFile', this)}
                      onPreview={this.handlePreview}
                      beforeUpload={e => beforeUpload(e, ['all'], 10)}
                    >
                      {this.state.historicalFile.length >= 20 ? null : (
                        <Button>
                          <Icon type="upload" /> 上传
                        </Button>
                      )}
                    </Upload>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="备注：">
                  {getFieldDecorator('remark', {
                    rules: [
                      {
                        max: 500,
                        message: '最多输入500个字',
                      },
                    ],
                    initialValue:
                      isEdit && m_detail.remark
                        ? m_detail.remark.replace(/<br\/>/g, '\n').replace(/\&nbsp\;/g, ' ')
                        : '',
                  })(
                    <TextArea
                      style={{ minHeight: 32 }}
                      placeholder="请填写备注"
                      rows={4}
                      onKeyUp={e => {
                        this.setState({ remarkSize: e.target.value.length });
                      }}
                    />
                  )}
                  <div style={{ float: 'right',marginBottom:'-35px' }}>
                    {this.state.remarkSize}
                    /500
                  </div>
                </FormItem>
                <FormItem {...formItemLayout} label="其他附件：">
                  {getFieldDecorator('otherAttachIds', {
                    valuePropName: 'otherAttachIds',
                    getValueFromEvent: this.normFile,
                  })(
                    <Upload
                      {...upLoadInit(
                        'file',
                        this.state.otherFile,
                        '',
                        'otherFile',
                        true,
                        true,
                        this,
                        '/base/attach/upload'
                      )}
                      fileList={this.state.otherFile}
                      onChange={e => uploadChange(e, 'otherFile', this)}
                      onPreview={this.handlePreview}
                      beforeUpload={e => beforeUpload(e, ['all'], 5)}
                    >
                      {this.state.otherFile.length >= 1 ? null : (
                        <Button>
                          <Icon type="upload" /> 上传
                        </Button>
                      )}
                    </Upload>
                  )}
                </FormItem>
                {this.state.listData.map(function(item, index) {
                  return (
                    <FormItem key={index} {...formItemLayout} label={item.chnName + '：'}>
                      {getFieldDecorator(item.ctrlName, {
                        rules: [
                          {
                            max: 80,
                            message: '最多输入80个字符',
                          },
                        ],
                        initialValue: isEdit ? m_detail[item.ctrlName] : '',
                      })(<Input placeholder={'请填写' + item.chnName} />)}
                    </FormItem>
                  );
                })}
                <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={this.state.btnStatus ? true : false}
                  >
                    保存
                  </Button>
                  <Button
                    onClick={() => {
                      this.setState({ modalVisible: false });
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    取消
                  </Button>
                </FormItem>
              </Form>
            </Modal>

            <Modal
              bodyStyle={{ maxHeight: 650, overflowY: 'scroll' }}
              title="查看材料供应商信息 "
              centered
              destroyOnClose={true} //关闭时销毁 Modal 里的子元素
              visible={this.state.s_modalVisible}
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
                    <span>工种：</span>
                  </Col>
                  <span>{m_detail.workType}</span>
                </ListItem>
                <ListItem>
                  <Col span={6}>
                    <span>规模：</span>
                  </Col>
                  <span>{m_detail.scale}</span>
                </ListItem>
                <ListItem>
                  <Col span={6}>
                    <span>服务区域：</span>
                  </Col>
                  <span>{m_detail.serviceArea}</span>
                </ListItem>
                <ListItem>
                  <Col span={6}>
                    <span>评价等级：</span>
                  </Col>
                  <span>{m_detail.evaluateLevel}</span>
                </ListItem>
                <ListItem>
                  <Col span={6}>
                    <span>付款方式：</span>
                  </Col>
                  <span>{m_detail.payWays}</span>
                </ListItem>
                <ListItem>
                  <Col span={6}>
                    <span>邮箱：</span>
                  </Col>
                  <span>{m_detail.email}</span>
                </ListItem>
                <ListItem>
                  <Col span={6}>
                    <span>施工强项：</span>
                  </Col>
                  <span>{m_detail.workStrengths}</span>
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
                    type={'REPORT_INCESTIGATION_LABOUR'}
                    attachmentVOList={this.state.attachmentVOList}
                  />
                </ListItem>
                <ListItem>
                  <Col span={6}>
                    <span>供应商历史合同：</span>
                  </Col>
                  <FileView
                    type={'LABOUR_HISTORICAL_CONTRACT'}
                    imgView={'view'}
                    attachmentVOList={this.state.attachmentVOList}
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
                    type={'OTHER_ACCESSORIES_LABOUR'}
                    imgView={'view'}
                    attachmentVOList={this.state.attachmentVOList}
                  />
                </ListItem>
                {this.state.listData.map(function(item, index) {
                  return (
                    <ListItem key={index}>
                      <Col span={6}>
                        <span>{item.chnName}：</span>
                      </Col>
                      {that.itemView(item.ctrlName, m_detail.customerFields)}
                    </ListItem>
                  );
                })}
              </List>
            </Modal>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
