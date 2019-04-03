import { message } from 'antd';
import {
  importExcel,
  queryAttachList,
  deleteAttachList,
  importSupplierLabours,
  importSupplierMaterial,
  getMaterialCategoryData,
  multipleType,
  getCurrentUserCorpProjectList,
  queryProcessTracking,
  getSupplierList,
  getAuthbusinessList,
  getProAndType,
  queryAwaitOpenTenderList,
  getTenderCaseList,
  updateUserPic,
  filterData,
  initiatorCheck
} from '../services/api';
export default {
  namespace: 'common',
  state: {
    importResult: [],
    filesPath: [],
    importStatus: null,
    materialCategoryData: [],
    multipleTypeData: [],
    DeleteStatus: false,
    invalids: [],
    projectList: [],
    recordList: [],
    supplierList: [],
    AuthbusinessList: [],
    proAndType: [],
    awaitOpenTenderList: [],
    updateUserPicData: {},
    tenderCaseList: [],
    filterData: [],
    initiatorCheck: {}
  },
  effects: {
    *clear({ payload }, { put }) {
      yield put({
        type: 'clearData',
        payload,
      });
    },
    //导入文件校验
    *impExcel({ payload }, { call, put }) {
      const response = yield call(importExcel, payload);
      yield put({
        type: 'importExcel',
        payload: response,
      });
    },
    //导入劳务供应商列表
    *addBatchSupplierLabour({ payload }, { call, put }) {
      const response = yield call(importSupplierLabours, payload);
      yield put({
        type: 'saveStatus',
        payload: response,
      });
    },
    //导入材料供应商列表
    *addBatchSupplierMaterial({ payload }, { call, put }) {
      const response = yield call(importSupplierMaterial, payload);
      yield put({
        type: 'saveStatus',
        payload: response,
      });
    },
    //查询文件
    *queryAttachList({ payload }, { call, put }) {
      const response = yield call(queryAttachList, payload);
      yield put({
        type: 'saveFilesPath',
        payload: response,
      });
    },
    //查询材料分类
    *getMaterialCategoryData({ payload }, { call, put }) {
      const response = yield call(getMaterialCategoryData, payload);
      if (response.status === '200') {
        yield put({
          type: 'materialCategoryData',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    //查询字典数据
    *multipleType({ payload }, { call, put }) {
      const response = yield call(multipleType, payload);
      if (response.status === '200') {
        yield put({
          type: 'multipleTypeData',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    //删除文件
    *deleteAttachList({ payload }, { call, put }) {
      const response = yield call(deleteAttachList, payload);
      if (response.status === '200') {
        yield put({
          type: 'saveDeleteStatus',
          payload: true,
        });
      } else {
        yield put({
          type: 'saveDeleteStatus',
          payload: false,
        });
        message.error(response.msg);
      }
    },
    *getCurrentUserCorpProjectList({ payload }, { call, put }) {
      const response = yield call(getCurrentUserCorpProjectList, payload);

      if (response.status == 200) {
        yield put({
          type: 'projectList',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },

    *queryProcessTracking({ payload }, { call, put }) {
      // console.log(payload,'-payload')
      const response = yield call(queryProcessTracking, payload);

      if (response.status == 200) {
        yield put({
          type: 'flowRecordList',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    //供应商选择(私人供应商)
    *getSupplierList({ payload }, { call, put }) {
      const response = yield call(getSupplierList, payload);

      if (response.status == 200) {
        yield put({
          type: 'getSupplierListSave',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    //供应商选择(公共平台供应商)
    *getAuthbusinessList({ payload }, { call, put }) {
      const response = yield call(getAuthbusinessList, payload);
      if (response.status == 200) {
        yield put({
          type: 'getAuthbusinessListSave',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    // 省份和分类查询(供应商选择组件)
    *getProAndType({ payload }, { call, put }) {
      const response = yield call(getProAndType, payload);
      if (response.status == 200) {
        yield put({
          type: 'getProAndTypeSave',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    //获取所有待开标招标列表
    *queryAwaitOpenTenderList({ payload }, { call, put }) {
      const response = yield call(queryAwaitOpenTenderList, payload);
      if (response.status == 200) {
        yield put({
          type: 'queryAwaitOpenTenderListSave',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    //中标方案链接
    *getTenderCaseList({ payload }, { call, put }) {
      const response = yield call(getTenderCaseList, payload);
      if (response.status == 200) {
        yield put({
          type: 'getTenderCaseListSave',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    //修改用户头像
    *updateUserPic({ payload }, { call, put }) {
      const response = yield call(updateUserPic, payload);
      if (response.status == 200) {
        yield put({
          type: 'updateUserPicData',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *filterData({ payload }, { call, put }) {
      //列表筛选下拉数据
      const response = yield call(filterData, payload);
      if (response.status == 200) {
        yield put({
          type: 'filterDataSvae',
          payload: response
        })
      } else {
        message.warning(response.msg)
      }
    },
    *initiatorCheck({ payload }, { call, put }) {
      //审批发起人检测
      const response = yield call(initiatorCheck, payload);
      if (response.status == 200) {
        yield put({
          type: 'initiatorCheckSave',
          payload: response
        })
      } else {
        message.warning(response.msg)
      }
    }
  },

  reducers: {
    importExcel(state, { payload }) {
      return {
        ...state,
        importResult: payload.data.attachmentVOList,
      };
    },
    saveFilesPath(state, { payload }) {
      return {
        ...state,
        filesPath: payload ? payload : [],
      };
    },
    saveStatus(state, { payload }) {
      return {
        ...state,
        importStatus: payload.status,
        invalids: payload.status == '200' ? [] : payload.data.invalids,
      };
    },
    saveDeleteStatus(state, { payload }) {
      return {
        ...state,
        DeleteStatus: payload,
      };
    },
    materialCategoryData(state, { payload }) {
      return {
        ...state,
        materialCategoryData: payload.data,
      };
    },
    multipleTypeData(state, { payload }) {
      return {
        ...state,
        multipleTypeData: payload.data,
      };
    },
    projectList(state, { payload }) {
      return {
        ...state,
        projectList: payload.data,
      };
    },
    flowRecordList(state, { payload }) {
      return {
        ...state,
        flowRecordList: payload.data,
      };
    },
    flowStep(state, { payload }) {
      return {
        ...state,
        flowStep: payload.data,
      };
    },
    getSupplierListSave(state, { payload }) {
      return {
        ...state,
        supplierList: payload.data,
      };
    },
    getAuthbusinessListSave(state, { payload }) {
      return {
        ...state,
        AuthbusinessList: payload.data,
      };
    },
    getProAndTypeSave(state, { payload }) {
      return {
        ...state,
        proAndType: payload.data,
      };
    },
    queryAwaitOpenTenderListSave(state, { payload }) {
      return {
        ...state,
        awaitOpenTenderList: payload.data,
      };
    },
    getTenderCaseListSave(state, { payload }) {
      return {
        ...state,
        tenderCaseList: payload.data,
      };
    },
    updateUserPicData(state, { payload }) {
      return {
        ...state,
        updateUserPicData: payload,
      };
    },
    filterDataSvae(state, { payload }) {
      return {
        ...state,
        filterData: payload.data
      }
    },
    initiatorCheckSave(state, { payload }) {
      return {
        ...state,
        initiatorCheck: payload.data
      }
    },
    clearData(state) {
      console.log(state)
      return {
        importResult: [],
        filesPath: [],
        importStatus: null,
        materialCategoryData: state.materialCategoryData,
        multipleTypeData: [],
        DeleteStatus: false,
        invalids: [],
        projectList: [],
        recordList: [],
        supplierList: [],
        AuthbusinessList: [],
        proAndType: [],
        awaitOpenTenderList: [],
        updateUserPicData: {},
        tenderCaseList: [],
        filterData: [],
        initiatorCheck: {}
      };
    },
  },
};

