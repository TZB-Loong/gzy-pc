/*eslint-disable*/
import React, { Component } from 'react';
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
  Dropdown,
  Menu,
  Cascader,
} from 'antd';
import { Link } from 'dva/router';
import { Resizable } from 'react-resizable';
import ImportExcel from '../Common/ImportExcel';
import { upLoadInit, beforeUpload, uploadChange } from '../../utils/upLoad';
import { getDownloadUrl, isAuth } from '../../utils/utils';
import { isfalse, timestampToTime, bubbleSort } from '../../Tools/util_tools';
import Empty from '../Common/Empty';
import styles from './style.less';
import Setup from './Setup';
import FiterIcon from '../Common/FiterIcon';
import MaterialSort from '../Common/MaterialSort';
import MaterialSupplierView from './MaterialSupplierView';
import cnCity from '../../utils/area.json';
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
@connect(({ materialSupplier, loading, common }) => ({
  materialSupplier,
  loading: loading.effects['materialSupplier/queryMaterialList'],
  headerLoading: loading.effects['materialSupplier/bizObjectListSettingList'],
  common,
}))
export default class MaterialSupplier extends Component {
  state = {
    searchText: '',
    loadingDownLoad: false,
    importVisible: false,
    modalVisible: false,
    previewVisible: false,
    previewImage: '',
    selectedRowKeys: [],
    fileList: [],
    fileListView: [], // 查看考察报告
    otherFile: [], // 其他附件
    otherFileView: [], // 查看其他附件
    historicalFile: [], // 历史附件
    historicalFileView: [], // 查看历史附件
    filteredInfo: {},
    listCode: 'materialSuppliersObject',
    filtersClass: [], //采购分类
    totalPages: 0, //总页数
    params: {
      current: 1, // 当前页数
      size: 10, // 每页显示记录条数
    },
    SetupVisible: false,
    searchKey: '',
    selectLists: [],
    dataSource: [],
    dataCanhge: false,
    searchName: '', // 搜索框
    columns: [
      //默认的两个表头
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
    columnsKeys: [], //变动的表头(key)
    isEdit: false, //是否编辑
    m_detail: {}, // 行数据
    s_modalVisible: false, // 查看modal
    listData: [],
    provinceName: '',
    cityName: '',
    districtName: '',
    areaDisabled: false,
    remarkSize: 0, // 备注字数
    jointProjectSize: 0, // 合作项目字数
    contact: [
      {
        contactName: '',
        phone: '',
      },
    ],
    supplyValue: [],
    btnStatus: false, //按钮点击状态
  };
  components = {
    header: {
      cell: ResizeableTitle,
    },
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
      type: 'materialSupplier/bizObjectListSettingShow',
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
      type: 'materialSupplier/bizObjectListSettingEdit',
      payload: headerData,
    }).then(() => {
      this.rerequest();
    });
  };

  queryMaterialListTitle = listCode => {
    //需要在表头显示的字段
    const { dispatch } = this.props;
    dispatch({
      type: 'materialSupplier/bizObjectListSettingList',
      payload: listCode,
    }).then(() => {
      if (!isfalse(this.props.materialSupplier.bizObjectListSettingList)) {
        const { materialSupplier } = this.props;

        if (materialSupplier.bizObjectListSettingList.data !== null) {
          let materialTitleData = materialSupplier.bizObjectListSettingList.data.fieldSetting;

          materialTitleData = bubbleSort(JSON.parse(materialTitleData));
          let columns = this.state.columns; //表头格式
          for (var i in materialTitleData) {
            let titleData = materialTitleData[i]; //表头的内容
            let options = materialTitleData[i].options; //筛选下拉菜单里面的内容
            let allowFilter = materialTitleData[i].allowFilter; //是否允许筛选
            // console.log(materialTitleData[i],'-0-0-')
            let InsertData = {
              title: materialTitleData[i].chnName,
              width: isfalse(materialTitleData[i].width) ? 200 : materialTitleData[i].width,
              dataIndex: materialTitleData[i].ctrlName,
              key: materialTitleData[i].ctrlName,
              fieldType: materialTitleData[i].fieldType,
              sorter: materialTitleData[i].allowSort,
              // filtered: true,
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
              // allowFilter
              //   ? filtered => (
              //       <FiterIcon
              //         titleData={titleData}
              //         options={options}
              //         screenOnClick={this.screenOnClick}
              //       />
              //     )
              //   : null,
              // filterDropdown:({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => <div>{null}</div>,
              // !isfalse(options) && allowFilter
              //   ? ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => <div>{null}</div>
              //   : null,
              render:
                materialTitleData[i].ctrlName == 'name'
                  ? (tex, record) => {
                      // console.log(record,'record')
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
      }
    });
  };
  // table-row-group

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
    // let queryConditions = params

    this.setState(
      {
        params: newParams,
      },
      () => {
        this.queryMaterialList();
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
      if (column.key == 'name') {
        orderBy = 'firstLetter';
      }
      if (column.key == 'materialType') {
        orderBy = 'materialTypeId';
      }
      if (column.key == 'supplyArea') {
        orderBy = 'supplyAreaId';
      }
      if (column.key == 'contractType') {
        orderBy = 'contractTypeId';
      }
      if (column.key == 'evaluateLevel') {
        orderBy = 'evaluateLevelId';
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
        this.queryMaterialList();
      }
    );
  };

  rerequest = () => {
    const { materialSupplier } = this.props;
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
      () => this.queryMaterialListTitle({ listCode: materialSupplier.listCode })
    ); // 重新请求表头数据)
  };

  queryMaterialList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'materialSupplier/queryMaterialList',
      payload: this.state.params,
    }).then(() => {
      const { materialSupplier } = this.props;

      if (!isfalse(materialSupplier.materialList)) {
        let materialList = materialSupplier.materialList,
          source = [];

        materialList.records.map((item, index) => {
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
          item.addressFirst = item.address; // 厂家详细地址
          item.address = [item.provinceName, item.cityName, item.districtName, item.address]; //
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
          totalPages: materialList.total,
          dataSource: source,
          dataCanhge: true,
        });
      }
    });
  };

  bizObjectMetadataList = () => {
    //获取自定义字段列表
    const { dispatch, materialSupplier } = this.props;
    dispatch({
      type: 'materialSupplier/bizObjectList',
      payload: { bizId: materialSupplier.bizId, bizCode: materialSupplier.bizCode },
    }).then(() => {
      let { materialSupplier } = this.props;
      let bizObjectMetadataList = materialSupplier.bizObjectList
        ? materialSupplier.bizObjectList
        : {};
      this.queryMaterialList();

      if (!isfalse(bizObjectMetadataList.data)) {
        this.setState({
          listData: bizObjectMetadataList.data, //自定义添加字段数据
        });
      }
    });
  };

  multipleType = () => {
    // 字典查询
    const { dispatch } = this.props;
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
    const { materialSupplier, dispatch } = this.props;

    this.bizObjectMetadataList(); //获取自定义字段列表
    this.queryMaterialListTitle({ listCode: materialSupplier.listCode });

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
    //字典查询
    this.multipleType();

    // 材料分类
    dispatch({
      type: 'common/getMaterialCategoryData',
    }).then(() => {
      // console.log(this.props.common.materialCategoryData);
    });
  }
  handleFilter(value, record, type, header) {
    return record[type].indexOf(value) === 0;
  }
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
          // delete values[item.ctrlName];
        });
        values.customerFields = JSON.stringify(moreData);

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

        let otherData = [];
        if (values.otherAttachIds) {
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
        // 材料类别
        if (this.state.sort) {
          values.category = this.state.sort;
        }
        // 材料类别name
        if (this.state.sortName) {
          values.materialType = this.state.sortName.toString();
        }
        // 联系人
        if (this.state.contact) {
          values.supplierContactList = JSON.stringify(this.state.contact);
        }
        // 供货区域
        if (this.state.supplyValue) {
          values.supplyAreaId = this.state.supplyValue.toString();
        }
        // if (values.supplyAreaId) {
        //   values.supplyAreaId = values.supplyAreaId.toString();
        // }
        //地址转换
        if (values.provinceId) {
          values.provinceName = this.state.provinceName;
          values.cityName = this.state.cityName;
          values.districtName = this.state.districtName;
          values.jointProject = values.jointProject
            ? values.jointProject.replace(/\r{0,}\n/g, '<br/>').replace(/\s/g, '&nbsp;')
            : null;
          values.remark = values.remark
            ? values.remark.replace(/\r{0,}\n/g, '<br/>').replace(/\s/g, '&nbsp;')
            : null;
          values.cityId = values.provinceId[1];
          values.districtId = values.provinceId[2];
          values.provinceId = values.provinceId[0];
        }
        const { dispatch } = that.props;
        this.setState({ btnStatus: true });
        dispatch({
          type: 'materialSupplier/saveMaterialList',
          payload: values,
        }).then(() => {
          const {
            materialSupplier: { saveStatus },
          } = that.props;
          this.setState({ btnStatus: false });
          if (saveStatus) {
            this.queryMaterialList();
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
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };
  handleSearch = value => {
    let searchParams = [{ fieldName: 'keyword', fieldValue: value, fieldType: 5 }];

    // let oldParams = Object.assign({}, this.state.params, { serchName: value });
    let oldParams = Object.assign({}, this.state.params, {
      queryConditions: JSON.stringify(searchParams),
      current: 1,
    });
    this.setState({ params: oldParams }, () => {
      this.queryMaterialList();
    });
  };

  // 分页事件
  onPageChange = currPage => {
    let params = Object.assign({}, this.state.params, { current: currPage });
    this.setState(
      {
        params: params,
      },
      () => {
        this.queryMaterialList();
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
        this.queryMaterialList();
      }
    );
  };
  // 查询附件
  getReportAttachIds(id) {
    this.props
      .dispatch({
        type: 'common/queryAttachList',
        payload: { bizCode: 'SUPPLIER_MATERIAL', bizId: id },
      })
      .then(() => {
        let fileList = [],
          otherfileList = [],
          historicalFileList = [];
        (this.props.common.filesPath.data
          ? this.props.common.filesPath.data.attachmentVOList
          : []
        ).map((item, i) => {
          if (item.ctrlName == 'REPORT_INCESTIGATION') {
            // 考察报告
            fileList.push({
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
              uid: item.id,
              fileType: item.fileType,
            });
          } else if (item.ctrlName == 'OTHER_ACCESSORIES') {
            // 其它附件
            otherfileList.push({
              uid: item.id,
              fileType: item.fileType,
              name: item.originalFilename + '.' + item.extention,
              url: item.fullFilename,
            });
          } else if (item.ctrlName == 'HISTORICAL_CONTRACT') {
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

  operation = (key, type) => {
    let that = this;
    if (type === 'delete') {
      confirm({
        title: '您选择了从您的供应商库中删除该供应商信息?',
        content: '删除后，该供应商信息将被您的供应商库中移除，并无法恢复。您确定删除吗?',
        cancelText: '取消',
        okText: '确认',
        onOk() {
          const { dispatch } = that.props;
          dispatch({
            type: 'materialSupplier/deleteMaterialSupplier',
            payload: { id: key.id },
          }).then(() => {
            const { materialSupplier } = that.props;
            let status = materialSupplier.deleteStatus;
            if (status) {
              message.success('删除成功!');
              that.queryMaterialList();
            } else {
              message.error('删除失败!');
            }
          });
        },
      });
    }
    if (type === 'edit') {
      // 编辑时默认附件
      that.getReportAttachIds(key.id);
      that.setState({
        isEdit: true,
        m_detail: key,
        modalVisible: true,
        remarkSize: key.remark ? key.remark.length : 0,
        jointProjectSize: key.jointProject ? key.jointProject.length : 0,
      });
      // 编辑时默认省市区名称   联系人

      that.setState({
        provinceName: key.provinceName,
        cityName: key.cityName,
        districtName: key.districtName,
        supplyValue: key.supplyAreaId ? key.supplyAreaId.split(',') : [],
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
  // 选择省市区是除id外要传的名称处理
  onAreaChange = (e, value) => {
    if (!isfalse(value)) {
      this.setState({
        provinceName: value[0].name,
        cityName: value[1].name,
        districtName: value[2] ? value[2].name : '',
      });
    }
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
  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }
  // closeModalVisible(s_modalVisible) {
  //   this.setState({ s_modalVisible });
  // }

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
    const { materialSupplier, loading, common } = this.props;
    let { multipleTypeData } = common;
    const { getFieldDecorator } = this.props.form;
    let {
      selectedRowKeys,
      dataSource,
      dataCanhge,
      columns,
      fileList,
      previewVisible,
      previewImage,
      isEdit,
      m_detail,
      loadingDownLoad,
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
              listCode: materialSupplier.listCode,
            })}
          >
            设置显示字段
          </a>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to="/addfile">添加自定义字段</Link>
        </Menu.Item>
      </Menu>
    );
    const suffix = searchName ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;

    return (
      <PageHeaderLayout>
        <Spin spinning={loading}>
          <Card title={materialSupplier.data} loading={!dataCanhge}>
            {!dataCanhge ? null : dataSource.length > 0 ||
            !isfalse(this.state.params.queryConditions) ? (
              <div>
                <Row>
                  <Col span={12}>
                    <Button
                      onClick={() => {
                        this.setState({
                          isEdit: false,
                          m_detail: {},
                          fileList: [],
                          otherFile: [],
                          historicalFile: [],
                          modalVisible: true,
                          provinceName: '',
                          cityName: '',
                          districtName: '',
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
                      type="primary"
                      style={{ marginRight: 30 }}
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
                <div
                    style={{ marginTop: 15 }}
                    >
                  <Row>
                    <Col span={23}>
                      {/* loading={this.props.loading} */}
                      <Table
                        // style={{Maxwidth:'4000px'}}
                        dataSource={dataSource}
                        columns={columns}
                        rowKey={record => record.id}
                        // rowSelection={rowSelection}
                        onChange={this.handleTableChange}
                        bordered
                        className={styles.resizeTable}
                        components={this.components}
                        scroll={{ x: 1400, y: this.state.params.size > 10 ? 600 : null }}
                        pagination={false}
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
                          request={this.rerequest}
                          visible={this.state.SetupVisible}
                          visibleChange={this.SetupVisibleChange}
                          materialSupplier={this.props.materialSupplier}
                          onOk={this.saveBizObjectList}
                        />
                      ) : null}
                    </Col>
                  </Row>
                </div>
                <div style={{ margin: '20px 0', textAlign: 'right' }}>
                  <Row>
                    <Col span={12} style={{ textAlign: 'left' }}>
                      {isAuth('supplier_export') ? (
                        <Button
                          // type="primary"
                          // onClick={()=>this.exportExl(1)}
                          href={getDownloadUrl('/supplier/excel/exportSupplierMaterial')}
                        >
                          导出全部供应商
                        </Button>
                      ) : null}
                    </Col>
                    <Col span={11}>
                      {this.state.totalPages > 10 ? (
                        <div style={{ textAlign: 'right' }}>
                          <Row>
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
                          </Row>
                        </div>
                      ) : null}
                    </Col>
                  </Row>
                </div>
              </div>
            ) : (
              <div>
                <Empty msg="材料供应商" />
                <div style={{ textAlign: 'center' }}>
                  <div>
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
              </div>
            )}
            {this.state.importVisible ? (
              <ImportExcel
                visible={true}
                onCancel={() => {
                  this.setState({ importVisible: false });
                }}
                reload={() => {
                  let params = Object.assign({}, this.state.params, { current: 1 });
                  this.setState({ params: params }, () => {
                    this.queryMaterialList();
                    this.multipleType();
                  });
                }}
                modalTitle="批量导入供应商"
                downLoadUrl="/supplier/download/materialTemplate"
                importUrl="/supplier/excel/importSupplierMaterial"
              />
            ) : null}
            <Modal
              bodyStyle={{ maxHeight: 650, overflowY: 'scroll', paddingBottom: 0 }}
              title={isEdit ? '编辑材料供应商信息 ' : '添加材料供应商信息 '}
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
                <FormItem {...formItemLayout} label="主营材料分类：">
                  {getFieldDecorator('category', {
                    rules: [],
                    initialValue: isEdit ? m_detail.category : [],
                  })(
                    <MaterialSort
                      initialValue={isEdit && m_detail.category ? m_detail.category : []}
                      that={this}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="主营材料名称：">
                  {getFieldDecorator('materialName', {
                    rules: [
                      {
                        max: 80,
                        message: '最多输入80个字符',
                      },
                    ],
                    initialValue: isEdit ? m_detail.materialName : '',
                  })(<Input placeholder="请填写主营材料名称" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="经营品牌：">
                  {getFieldDecorator('brand', {
                    rules: [
                      {
                        max: 80,
                        message: '最多输入80个字符',
                      },
                    ],
                    initialValue: isEdit ? m_detail.brand : '',
                  })(<Input placeholder="请填写经营品牌" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="承包类型：">
                  {getFieldDecorator('contractTypeId', {
                    rules: [],
                    initialValue:
                      isEdit && m_detail.contractTypeId ? m_detail.contractTypeId : undefined,
                  })(
                    <Select placeholder="请选择承包类型">
                      {(multipleTypeData.contractType ? multipleTypeData.contractType : []).map(
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
                {/*<FormItem {...formItemLayout} label="供货区域：">
                {getFieldDecorator('supplyAreaId', {
                  rules: [],
                  initialValue:
                    isEdit && m_detail.supplyAreaId ? m_detail.supplyAreaId.split(',') : [],
                })(
                  <Select mode="tags" placeholder="请选择供货区域">
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
                <FormItem {...formItemLayout} label="供货区域：">
                  <Select
                    mode="tags"
                    placeholder="请选择供货区域"
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

                <FormItem label="厂家地址：" {...formItemLayout}>
                  <Col span={24}>
                    <FormItem>
                      {getFieldDecorator('provinceId', {
                        rules: [],
                        initialValue:
                          isEdit && m_detail.provinceId
                            ? [m_detail.provinceId, m_detail.cityId, m_detail.districtId]
                            : [],
                      })(
                        <Cascader
                          fieldNames={{ label: 'name', value: 'code', children: 'sub' }}
                          options={cnCity}
                          onChange={this.onAreaChange}
                          placeholder="请选择地址"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={24} style={{ marginTop: 24, marginBottom: 24 }}>
                    <FormItem>
                      {getFieldDecorator('address', {
                        rules: [
                          {
                            max: 100,
                            message: '最多输入100个字符',
                          },
                        ],
                        initialValue: isEdit ? m_detail.addressFirst : '',
                      })(<Input placeholder="请输入详细地址" />)}
                    </FormItem>
                  </Col>
                </FormItem>
                <FormItem {...formItemLayout} label="邮箱">
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
                <FormItem {...formItemLayout} label="评价等级：">
                  {getFieldDecorator('evaluateLevelId', {
                    rules: [
                      {
                        max: 10,
                        message: '最多输入10个字符',
                      },
                    ],
                    initialValue:
                      isEdit && m_detail.evaluateLevelId ? m_detail.evaluateLevelId : undefined,
                  })(
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
            {/*查看详情*/}
            <MaterialSupplierView
              m_detail={m_detail}
              attachmentVOList={this.state.attachmentVOList}
              listData={this.state.listData}
              that={this}
            />
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
