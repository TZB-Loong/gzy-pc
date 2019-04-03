import React, { Component } from 'react';
import {
  Form,
  Modal,
  Button,
  Row,
  Col,
  Radio,
  message,
  Input,
  Checkbox,
  Pagination,
  Icon,
  Spin
} from 'antd';
import Styles from '../../Common/style.less';
import { connect } from 'dva/index';
import { PurchaseBoot } from '../../../../configPath'
import { isfalse } from '../../../Tools/util_tools';
const Search = Input.Search;
const CheckboxGroup = Checkbox.Group;
@connect(({ loading, common }) => ({
  common,
  privateLoading: loading.effects['common/getSupplierList'],
  allLoading: loading.effects['common/getAuthbusinessList']
}))
/**
 * 参数说明
 *  @param {number} tenderType - 供应商类别 0-->劳务 1-->材料
 *  @param {string} type  all, pingtai - 平台供应商库 , 个人供应商
 *  @param {function} onOk  响应确定的函数
 *  @param {Object} defaultValue 默认选中的值
 *  @param {boolean} isAuthentication  true/false 是否认证(平台供应商是否可选)
 *  @param {boolean} isPurchased  true/false 是否购买了采购云(个人供应商是否可选)
 */
export default class SelectSupplier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpdata:true,
      visible: false,
      validResultVisible: false,
      isAllArea: false,
      isAllClassify: false,
      CollapseArea: true,
      CollapseClass: true,
      selectResult: [],
      bank: 'all',
      area: [],
      classify: [],
      pingtaiParams: {
        provinceIds: '',
        types: '',
        name: '',
        size: 12,
        current: 1,
      },
      allParams: {
        provinceIds: '',
        types: '',
        companyName: '',
        size: 12,
        current: 1,
      },
      dataSource: [],
      allParamsCheckedList: [], //部分选择平台供应商
      pingtaiParamsCheckdList: [], //部分选择私人供应商
      allCheckedAll: [], //平台供应商全选时
      pingtaiChecAll: [], //私人供应商全选时
      allChecked: true, //平台供应商全选标识
      pingtaiChecked: false, //私人供应商全选标识
      showWarning: false,
      total: 0,
      action: 1,
      isImplement: false,
      privateTotal: 0,
      id: '',//跳转认证的id
      returnData: '',//显示的值(返回到父组件的值)
    };

    this.getSupplierList = this.getSupplierList.bind(this);
    this.getAuthbusinessList = this.getAuthbusinessList.bind(this);
  }

  componentDidMount() {
    // console.log('this.props.id',this.props.id)
    //默认设置的值(初始化的时候)
    const { tenderType } = this.props;
    const { visible } = this.state;
    this.initialization();
    this.setState({
      validResultVisible: visible,
      pingtaiParams: isfalse(tenderType)
        ? this.state.pingtaiParams
        : Object.assign({}, this.state.pingtaiParams, { tenderType: tenderType }),
      allParams: isfalse(tenderType)
        ? this.state.allParams
        : Object.assign({}, this.state.allParams, { tenderType: tenderType }),
      allChecked: this.props.isAuthentication
    });
  }
  componentWillUpdate(nextProps) {
    //请求完成之后再次渲染
    const { defaultValue, isAuthentication, isPurchased, id } = this.props;
    if (nextProps.defaultValue != defaultValue) {
      //设置初始化的值
      this.initialization();
    }
    if (nextProps.isAuthentication != isAuthentication) {
      console.log(nextProps.isAuthentication, 'nextProps')
      this.setState({
        allChecked: nextProps.isAuthentication
      })
    }
    if (nextProps.id != id) {
      this.setState({
        id: nextProps.id
      })
    }
    if (nextProps.isPurchased != isPurchased) { //当修改时
      this.setState({
        isPurchased: nextProps.isPurchased
      })
    }
  }

  changeModal = (data) => {

    if (data) {
      const { defaultValue, tenderType, isAuthentication, isPurchased } = this.props;
      this.getProAndType({ tenderType: tenderType }); //省份类别查询
      if (this.state.bank == 'all') {
        if (isAuthentication) {
          this.getAuthbusinessList(); //获取公共平台供应商数据
        }
      } else {
        if (isPurchased == 'true') { //采购云用户
          this.getSupplierList(); //获取私人供应商数据
        }
      }


    }

    this.setState({
      visible: data
    })
  }

  initialization = (data) => {
    //设置初始化值(函数)
    // const { defaultValue, isAuthentication } = this.props;
    let defaultValue = this.props.defaultValue,isAuthentication = this.props.isAuthentication
    if(!isfalse(data)){
      defaultValue= data;
    }
    let allParamsCheckedList = [],
      pingtaiParamsCheckdList = [];
    if (!isfalse(defaultValue)) {
      //设置默认选择值
      // console.log(isAuthentication,'default---Value')

      if (defaultValue.platformSupplier == -1) {
        this.setState({
          allChecked: true,
        });
      } else {
        if (!isfalse(defaultValue.platformSupplier)) {
          defaultValue.platformSupplier.map(item => {
            allParamsCheckedList.push(item.id + ',' + item.name);
          });
        }
        this.setState({
          allParamsCheckedList,
        });
      }
      if (defaultValue.privateSupplier == -1) {
        this.setState({
          pingtaiChecked: true,
        });
      } else {
        if (!isfalse(defaultValue.privateSupplier)) {
          defaultValue.privateSupplier.map(item => {
            pingtaiParamsCheckdList.push(item.id + ',' + item.name);
          });
        }
        this.setState({
          pingtaiChecked: false,
          pingtaiParamsCheckdList,
        });
      }
    }
    this.setState({
      isPurchased: this.props.isPurchased
    },
      // console.log(this.state.allChecked, 'this.state.allChecked')
    )
  };

  getSupplierList = () => {
    // 获取私人供应商数据
    const { dispatch, common } = this.props;
    let source = [],
      allCheckedList = [];
    dispatch({
      type: 'common/getSupplierList',
      payload: this.state.pingtaiParams,
    }).then(() => {
      const { common } = this.props;
      if (!isfalse(common.supplierList)) {
        if (!isfalse(common.supplierList.records)) {
          common.supplierList.records.map(item => {
            source.push({
              id: item.authId,
              corpId: item.corpId,
              name: item.name,
            });

            if (this.state.pingtaiChecAll) {
              //全选的状态处理(待修改)
              allCheckedList.push(item.authId + ',' + item.name);
            }
          });
        }
      }
      this.setState({
        dataSource: source,
        pingtaiChecAll: this.state.pingtaiChecAll ? allCheckedList:[],
        privateTotal: isfalse(common.supplierList) ? this.state.privateTotal : common.supplierList.total
      });
    });
  };

  getAuthbusinessList = () => {
    //获取公共平台供应商数据
    const { dispatch } = this.props;
    let source = [],
      checkedList = [];
    dispatch({
      type: 'common/getAuthbusinessList',
      payload: this.state.allParams,
    }).then(() => {
      const { common } = this.props;
      if (!isfalse(common.AuthbusinessList)) {
        if (!isfalse(common.AuthbusinessList.records)) {
          common.AuthbusinessList.records.map(item => {
            source.push({
              id: item.authenId,
              name: item.companyName,
            });

            if (this.state.allChecked) {
              //全选的状态处理(待修改)
              checkedList.push(item.authenId + ',' + item.companyName);
            }
          });
        }
        this.setState({
          dataSource: source,
          allCheckedAll: this.state.allChecked?checkedList:[],
          total: common.AuthbusinessList.total,
        });
      }
    });
  };

  getProAndType = data => {
    //获取省份和分类
    const { dispatch } = this.props;
    let source = [],
      area = [];
    dispatch({
      type: 'common/getProAndType',
      payload: data,
    }).then(() => {
      const { common } = this.props;
      if (!isfalse(common.proAndType)) {
        if (!isfalse(common.proAndType.allArea)) {
          common.proAndType.allArea.map(item => {
            area.push(Object.assign({}, item, { isActive: false }));
          });
        }
        if (!isfalse(common.proAndType.type)) {
          common.proAndType.type.map(item => {
            source.push(Object.assign({}, item, { isActive: false }));
          });
        }
      }
      this.setState({
        classify: source,
        area: area,
      });
    });
  };

  createList = data => {
    const { pingtaiParams } = this.state;
    if (isfalse(data)) {
      return <div style={{ textAlign: 'center', width: '100%', height: "100%", lineHeight: '200px' }}>
        {this.state.bank == 'all' ? "暂无数据" : <span>
          <span>
            暂无 {isfalse(pingtaiParams.types) && isfalse(pingtaiParams.name) && isfalse(pingtaiParams.provinceIds) ? '' : '该类'}个人供应商,点击
              <a href="javascript:void(0)" onClick={() => { pingtaiParams.tenderType == 1 ? window.location.href = PurchaseBoot + "#/supplierManagement/material" : window.parent.top.location.href = PurchaseBoot + '#/supplierManagement/labour' }}>添加供应商</a>
          </span>
        </span>}
      </div>;
    } else {
      return data.map((item, index) => {
        return (
          <Col
            span={8}
            style={{
              padding: '10px',
              // overflow: 'hidden',
              // textOverflow: 'ellipsis',
              // whiteSpace: 'nowrap',
            }}
            key={index}
          >
            <Checkbox value={item.id + ',' + item.name}>{item.name}</Checkbox>
          </Col>
        );
      });
    }
  };

  inputSearch = value => {
    //输入框筛选
    const { allParams, pingtaiParams } = this.state;
    //需要分类别
    if (this.state.bank == 'all') {
      this.setState(
        {
          allParams: Object.assign({}, allParams, { companyName: value }),
        },
        () => { if (this.props.isAuthentication) { this.getAuthbusinessList() } }
      );
    } else {
      this.setState(
        {
          pingtaiParams: Object.assign({}, pingtaiParams, { name: value }),
        },
        () => { if (this.state.isPurchased == 'true') { this.getSupplierList() } }
      );
    }
  };

  //清理选中的状态(第二次打开页面时)
  isClear = () => {
    //在点击确定与取消时都要被清理
    // console.log(this.state.pingtaiParams.tenderType,'pingtaiParams')

    const { dispatch } = this.props;
    dispatch({
      type: 'common/clear',
      payload: {}
    })

    this.setState({
      pingtaiParams: {
        provinceIds: '',
        types: '',
        name: '',
        tenderType: this.state.pingtaiParams.tenderType, //劳务供应商(默认)
        size: 12,
        current: 1,
      },
      allParams: {
        provinceIds: '',
        types: '',
        companyName: '',
        size: 12,
        current: 1,
        tenderType: this.state.pingtaiParams.tenderType,
      }
    })
  }



  Ok = () => {
    //响应确定函数
    this.changeModal(false); // 关闭modal(弹框)
    const {
      pingtaiParamsCheckdList,
      allParamsCheckedList,
      pingtaiChecked,
      allChecked,
    } = this.state;
    // console.log(allChecked, 'allChecked', pingtaiParamsCheckdList, allParamsCheckedList, pingtaiChecked, allChecked)

    let returnData = {};
    if (pingtaiChecked) {
      returnData.privateSupplier = -1;
    } else {
      if (!isfalse(pingtaiParamsCheckdList)) {
        let privateParams = [];
        pingtaiParamsCheckdList.map(item => {
          privateParams.push({
            id: item.split(',')[0],
            name: item.split(',')[1],
          });
        });
        returnData.privateSupplier = privateParams;
      } else {
        returnData.privateSupplier = [];
      }
    }
    if (allChecked) {
      returnData.platformSupplier = -1;
    } else {
      if (!isfalse(allParamsCheckedList)) {
        let platformParams = [];
        allParamsCheckedList.map(item => {
          platformParams.push({
            id: item.split(',')[0],
            name: item.split(',')[1],
          });
        });
        returnData.platformSupplier = platformParams;
      } else {
        returnData.platformSupplier = [];
      }
    }
    if (!isfalse(this.props.onOk)) {
      // console.log(returnData, 'returnData')
      // if (returnData.privateSupplier.length != 0 || returnData.platformSupplier.length != 0) {
      this.props.onOk(returnData);
      this.setState({
        returnData
      })
      // }
    }
    this.isClear();
  };
  selectALL = type => {
    //全选的处理
    const { pingtaiParams, allParams } = this.state;
    this.state[type].map(item => {
      item.isActive = false;
    });
    if (type === 'area') {
      //省份全选
      this.setState(
        {
          isAllArea: !this.state.isAllArea,
        },
        () => {
          // 全选时的处理(就是筛选参数都不传)
          this.setState(
            {
              pingtaiParams: Object.assign({}, pingtaiParams, { provinceIds: null }),
              allParams: Object.assign({}, allParams, { provinceIds: null }),
            },
            () => {
              if (this.state.bank == 'all') {
                if (this.props.isAuthentication) {
                  this.getAuthbusinessList();
                }
              } else {
                if (this.state.isPurchased == 'true') {

                  this.getSupplierList();
                }
              }
            }
          );
        }
      );
    }
    if (type === 'classify') {
      //类别全选
      this.setState(
        {
          //样式处理
          isAllClassify: !this.state.isAllClassify,
        },
        () => {
          //数据处理
          this.setState(
            {
              pingtaiParams: Object.assign({}, pingtaiParams, { types: null }),
              allParams: Object.assign({}, allParams, { types: null }),
            },
            () => {
              if (this.state.bank == 'all') {
                if (this.props.isAuthentication) {
                  this.getAuthbusinessList();
                }
              } else {
                if (this.state.isPurchased == 'true') {
                  this.getSupplierList();
                }
              }
            }
          );
        }
      );
    }
  };

  handleBankChange = e => {
    //tab 切换(数据切换处理)
    let source = [], checkedList = [], allCheckedList = [];
    const { common } = this.props;
    this.setState(
      {
        bank: e.target.value,
      },
      () => {
        if (this.state.bank == 'all') {
          if (!isfalse(common.AuthbusinessList)) {  //当请求过之后的数据不在进行请求
            if (!isfalse(common.AuthbusinessList.records)) {
              common.AuthbusinessList.records.map(item => {
                source.push({
                  id: item.authenId,
                  name: item.companyName,
                });

                if (this.state.allChecked) {
                  //全选的状态处理(待修改)
                  checkedList.push(item.authenId + ',' + item.companyName);
                }
              });
            }
            this.setState({
              dataSource: source,
              allCheckedAll: isfalse(checkedList) ? this.state.allChecked : checkedList,
              total: common.AuthbusinessList.total,
            });
          } else {
            if (this.props.isAuthentication) {
              this.getAuthbusinessList();
            }
          }
        } else {
          if (!isfalse(common.supplierList)) { //当请求过的数据不在进行请求
            if (!isfalse(common.supplierList.records)) {
              common.supplierList.records.map(item => {
                source.push({
                  id: item.authId,
                  corpId: item.corpId,
                  name: item.name,
                });

                if (this.state.pingtaiChecAll) {
                  //全选的状态处理(待修改)
                  allCheckedList.push(item.authId + ',' + item.name);
                }
              });
            }
            this.setState({
              dataSource: source,
              pingtaiChecAll: isfalse(allCheckedList) ? this.state.pingtaiChecAll : allCheckedList,
              privateTotal: common.supplierList.total
            });
          } else {
            if (this.state.isPurchased == 'true') {
              this.getSupplierList();
            }
          }

        }
      }
    );
  };
  selectCondition = (index, type) => {
    //按照省份筛选
    const { area, classify, pingtaiParams, allParams } = this.state;
    let classifyTypes = [],
      areaTypes = [];
    if (type === 'area') {
      area[index].isActive = !area[index].isActive;
      this.setState(
        {
          area,
          isAllArea: false,
        },
        () => {
          area.map(item => {
            if (item.isActive) {
              areaTypes.push(item.areaId);
            }
          });
          this.setState(
            {
              pingtaiParams: Object.assign({}, pingtaiParams, {
                provinceIds: areaTypes.toString(),
              }),
              allParams: Object.assign({}, allParams, { provinceIds: areaTypes.toString() }),
            },
            () => {
              if (this.state.bank == 'all') {
                if (this.props.isAuthentication) {
                  this.getAuthbusinessList();
                }
              } else {
                if (this.state.isPurchased == 'true') {

                  this.getSupplierList();
                }
              }
            }
          );
        }
      );
    }
    if (type === 'classify') {
      //按照类别筛选
      classify[index].isActive = !classify[index].isActive;
      this.setState(
        {
          classify,
          isAllClassify: false,
        },
        () => {
          classify.map(item => {
            if (item.isActive) {
              let ids = this.props.tenderType == '0' ? 'dvalue' : 'id';
              classifyTypes.push(item[ids]);
            }
          });
          this.setState(
            {
              pingtaiParams: Object.assign({}, pingtaiParams, { types: classifyTypes.toString() }),
              allParams: Object.assign({}, allParams, { types: classifyTypes.toString() }),
            },
            () => {
              if (this.state.bank == 'all') {
                if (this.props.isAuthentication) {
                  this.getAuthbusinessList();
                }
              } else {
                if (this.state.isPurchased == 'true') {

                  this.getSupplierList();
                }
              }
            }
          );
        }
      );
    }
  };

  checkChange = checkedList => {
    //多选框change情况 (分为个人与平台)
    if (this.state.bank == 'all') {
      this.setState(
        {
          allParamsCheckedList: checkedList.length > 19 ? checkedList.slice(0, 20) : checkedList,
          showWarning: checkedList.length > 19 ? true : false,
        },
        () => {
          setTimeout(() => {
            this.setState({
              showWarning: false,
            });
          }, 1000);
        }
      );
    } else {
      this.setState(
        {
          pingtaiParamsCheckdList: checkedList.length > 19 ? checkedList.slice(0, 20) : checkedList,
          showWarning: checkedList.length > 19 ? true : false,
        },
        () => {
          setTimeout(() => {
            this.setState({
              showWarning: false,
            });
          }, 1000);
        }
      );
    }
  };

  checkedAll = checkedAll => {
    //选择全部供应商
    let checkedData = [];
    if (this.state.bank == 'all') {
      this.setState(
        {
          allChecked: checkedAll.target.checked,
        },
        () => {
          this.state.dataSource.map(item => {
            checkedData.push(item.id + ',' + item.name);
          });
          this.setState({
            allCheckedAll: checkedData,
          });
        }
      );
    } else {
      this.setState(
        {
          pingtaiChecked: checkedAll.target.checked,
        },
        () => {
          this.state.dataSource.map(item => {
            checkedData.push(item.id + ',' + item.name);
          });
          this.setState({
            pingtaiChecAll: checkedData,
          });
        }
      );
    }

    // console.log(this.state.allCheckedAll, this.state.pingtaiChecAll, 'opopop')

  };

  pageChange = (page, pageSize) => { //平台供应商页码改变
    //页码改变响应
    this.setState(
      {
        allParams: Object.assign({}, this.state.allParams, { current: page, size: pageSize }),
      },
      () => { if (this.props.isAuthentication) { this.getAuthbusinessList() } }
    );
  };

  pingtaiPaggeChange = (page, pageSize) => { //个人供应商 页码改变
    this.setState({
      pingtaiParams: Object.assign({}, this.state.pingtaiParams, { current: page, size: pageSize })
    }, () => { if (this.state.isPurchased == 'true') { this.getSupplierList() } })
  }

  setfileList = (data) => {
    if (this.state.isUpdata) {
      this.setState({
        returnData: data,
        isUpdata: false
      }, () => {
        this.initialization(this.state.returnData)
      })
    }
  }
  render() {
    if (!isfalse(this.props.default) && !this.props.isView) {
      this.setfileList(this.props.default)
    }
    // console.log(this.props.onOk,isfalse(this.props.onOk))
    const { area,
      classify,
      CollapseArea,
      CollapseClass,
      isAllArea,
      isAllClassify,
      pingtaiParams,
      returnData
    } = this.state;
    return (
      <div>
        <Button type="primary" onClick={this.changeModal.bind(this, true)}>
          选择供应商
        </Button>
        {isfalse(returnData) ? null : (returnData.privateSupplier == -1 && returnData.platformSupplier == -1 ? (
          <div>已选择全部供应商</div>
        ) : (
            <div>
              <div>
                <span>
                  {isfalse(returnData.privateSupplier)
                    ? null
                    : returnData.privateSupplier == -1
                      ? '已选择全部个人供应商'
                      : '已选择个人供应商(' + returnData.privateSupplier.length + ')'}
                </span>
                {!isfalse(returnData.privateSupplier) && returnData.privateSupplier != -1 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {returnData.privateSupplier.map((item, index) => {
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
                  {isfalse(returnData.platformSupplier)
                    ? null
                    : returnData.platformSupplier == -1
                      ? '已选择全部平台供应商'
                      : '已选择平台供应商库(' + returnData.platformSupplier.length + ')'}
                </span>
                {returnData.platformSupplier != -1 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {returnData.platformSupplier.map((item, index) => {
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
        )}
        <Modal
          visible={this.state.visible}
          title={'选择供应商'}
          width="1000px"
          centered
          maskClosable={true}
          destroyOnClose={true}
          onCancel={() => {
            this.isClear();
            this.changeModal(false);
          }}
          footer={
            <Row>
              <Col span={16} style={{ textAlign: 'left', marginLeft: '15px' }}>
                {this.state.bank == 'all' ? (
                  this.props.isAuthentication ? (
                    <span>
                      <Checkbox
                        onChange={this.checkedAll}
                        value="all"
                        checked={this.state.allChecked}
                      >
                        面向全部平台供应商
                      </Checkbox>
                      <span
                        style={{
                          display:
                            isfalse(this.state.allParamsCheckedList) || this.state.allChecked
                              ? 'none'
                              : null,
                        }}
                      >
                        已选
                        <span style={{ color: '#108ee9' }}>
                          {this.state.allParamsCheckedList.length}
                          /20
                        </span>
                        家
                      </span>
                      <span
                        style={{
                          display: this.state.showWarning ? null : 'none',
                          color: 'red',
                        }}
                      >
                        最多可选20家供应商
                      </span>
                    </span>
                  ) : null
                ) : (

                    this.state.isPurchased == 'true' ? (
                      <span>
                        <Checkbox
                          onChange={this.checkedAll}
                          value="pingtai"
                          checked={this.state.pingtaiChecked}
                          style={{
                            display:
                              (isfalse(this.state.dataSource)) ? 'none' : null
                          }}
                        >
                          面向全部个人供应商
                  </Checkbox>
                        <span
                          style={{
                            display:
                              isfalse(this.state.pingtaiParamsCheckdList) || this.state.pingtaiChecked
                                ? 'none'
                                : null,
                          }}
                        >
                          已选
                    <span style={{ color: '#108ee9' }}>
                            {this.state.pingtaiParamsCheckdList.length}
                            /20
                    </span>
                          家
                  </span>
                        <span style={{ display: this.state.showWarning ? null : 'none', color: 'red' }}>
                          最多可选20家供应商
                  </span>
                      </span>
                    ) : null
                  )}
              </Col>
              <Col>
                <Button key="submit" type="primary" onClick={() => this.Ok()}>
                  确认
                </Button>
                <Button key="back" onClick={() => {
                  this.isClear();
                  this.changeModal(false)
                }}>
                  取消
                </Button>
              </Col>
            </Row>
          }
        >
          <Form onSubmit={this.onSubmit} className={Styles.Condition}>
            <Row
              className={Styles.ConditionCont}
              style={{
                display: isfalse(this.props.tenderType)
                  ? null
                  : this.props.tenderType == 0
                    ? 'none'
                    : null,
              }}
            >
              <Col span={3}>
                <span>地区：</span>
              </Col>
              <Col span={18} className={CollapseArea ? Styles.moreCon : ''}>
                <span
                  onClick={() => {
                    this.selectALL('area');
                  }}
                  className={isAllArea ? Styles.active : ''}
                >
                  全国
                </span>
                {area.map((item, index) => {
                  if (item.areaId != 0) {
                    return (
                      <span
                        key={index}
                        onClick={() => {
                          this.selectCondition(index, 'area');
                        }}
                        className={item.isActive ? Styles.active : ''}
                      >
                        {item.areaName}
                      </span>
                    );
                  }
                })}
              </Col>
              <Col
                span={3}
                className={Styles.more}
                onClick={() => {
                  this.setState({ CollapseArea: !CollapseArea });
                }}
              >
                <span>{CollapseArea ? '更多' : '收起'}</span>
              </Col>
            </Row>
            <Row className={Styles.ConditionCont}>
              <Col span={3}>
                <span>分类：</span>
              </Col>
              <Col span={18} className={CollapseClass ? Styles.moreCon : ''}>
                <span
                  onClick={() => {
                    this.selectALL('classify');
                  }}
                  className={isAllClassify ? Styles.active : ''}
                >
                  全部
                </span>
                {classify.map((item, index) => {
                  return (
                    <span
                      key={index}
                      onClick={() => {
                        this.selectCondition(index, 'classify');
                      }}
                      className={item.isActive ? Styles.active : ''}
                    >
                      {this.props.tenderType == 0 ? item.dkey : item.name}
                    </span>
                  );
                })}
              </Col>
              <Col
                span={3}
                className={Styles.more}
                onClick={() => {
                  this.setState({ CollapseClass: !CollapseClass });
                }}
              >
                <span>{CollapseClass ? '更多' : '收起'}</span>
              </Col>
            </Row>
            <Row className={Styles.search}>
              <Col span={12}>
                <Radio.Group value={this.state.bank} onChange={this.handleBankChange}>
                  <Radio.Button value="pingtai">个人供应商库</Radio.Button>
                  <Radio.Button value="all">平台供应商</Radio.Button>
                </Radio.Group>
              </Col>
              {
                this.state.bank == 'all' ? null : <Col span={12} style={{ textAlign: 'right' }}>
                  <Search
                    placeholder="请输入公司名称"
                    onSearch={value => this.inputSearch(value)}
                    style={{ width: 200 }}
                  />

                </Col>
              }
            </Row>
            <Row className={Styles.list}>
              {this.state.bank == 'all' ? (
                this.props.isAuthentication ? (
                  <Spin spinning={this.props.allLoading}>
                    <CheckboxGroup
                      onChange={this.checkChange}
                      value={
                        this.state.allChecked
                          ? this.state.allCheckedAll
                          : this.state.allParamsCheckedList
                      }
                      disabled={this.state.allChecked}
                      style={{ width: '100%', minHeight: "250px" }}
                    >
                      {this.props.allLoading ? null : this.createList(this.state.dataSource)}
                      <Col span={24} style={{ textAlign: 'right', padding: '15px 15px 0px 0px', position: "absolute", bottom: '10px' }}>
                        <Pagination
                          total={this.state.total}
                          onChange={(page, pageSize) => this.pageChange(page, pageSize)}
                          pageSize={this.state.allParams.size}
                          current={this.state.allParams.current}
                        />
                      </Col>
                    </CheckboxGroup>
                  </Spin>

                ) : (
                    <Col style={{ height: '250px', textAlign: 'center', color: '#999', paddingTop: '100px', fontSize: 16 }}>
                      <Icon
                        type="exclamation-circle"
                        theme="outlined"
                        style={{ color: 'gold', fontSize: '20px', verticalAlign: 'middle' }}
                      />
                      &nbsp;&nbsp;由于该项目未完成认证，为保证供应商利益，该项目只能对您个人供应商库内供应商招标。 <br /> 如您希望对外招标，请完成项目认证 !
                    <div style={{ marginTop: '55px' }}>
                        {/* {console.log(this.props.id,'this.state.id',this.state.id)} */}
                        <Button type="primary" >
                          <a
                            href={'#/project/add?id=' + this.state.id}
                            target="_blank"
                            style={{
                              textDecoration: 'none',
                            }}
                          >前往认证</a>
                        </Button>
                      </div>
                    </Col>
                  )
              ) : (
                  this.state.isPurchased == 'true' ? (<Spin spinning={this.props.privateLoading}>
                    <CheckboxGroup
                      onChange={this.checkChange}
                      value={
                        this.state.pingtaiChecked
                          ? this.state.pingtaiChecAll
                          : this.state.pingtaiParamsCheckdList
                      }
                      disabled={this.state.pingtaiChecked}
                      style={{ width: '100%', minHeight: "250px" }}
                    >
                      {this.props.privateLoading ? null : this.createList(this.state.dataSource)}
                      <Col span={24}
                        style={{
                          textAlign: 'right',
                          padding: '15px 15px 0px 0px',
                          position: "absolute",
                          bottom: '10px',
                          display: this.state.privateTotal == 0 ? 'none' : null
                        }}>
                        <Pagination
                          total={this.state.privateTotal}
                          onChange={(page, pageSize) => this.pingtaiPaggeChange(page, pageSize)}
                          pageSize={this.state.pingtaiParams.size}
                          current={this.state.pingtaiParams.current}
                        />
                      </Col>
                    </CheckboxGroup>
                  </Spin>) : (
                      <Col style={{ height: '250px', textAlign: 'center', color: '#999', paddingTop: '100px', fontSize: 16 }}>
                        <Icon
                          type="exclamation-circle"
                          theme="outlined"
                          style={{ color: 'gold', fontSize: '20px', verticalAlign: 'middle' }}
                        />
                        &nbsp;&nbsp;升级成为采购云用户才能进行个人供应商库的管理和选择。 <br /> 了解详情请拨打客服电话4001011718!
                    <div style={{ marginTop: '55px' }}>
                        </div>
                      </Col>
                    )
                )}
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}
