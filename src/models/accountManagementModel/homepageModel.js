/*eslint-disable*/
import {
  getQuantityStatistics,
  getTodoTaskList,
  getWaitOpenTenderList,
  getSupplierBannerList,
  getThisYearProjectStatistics,
  getHomePanel,
  saveHomePanel,
  queryOperateDynamicInfo,
} from '../../services/api';
import { message } from 'antd';
export default {
  namespace: 'homepageModel',

  state: {
    data: '主页',
    quantityStatistics: {},
    todoTaskList: [],
    waitOpenTenderList: [],
    supplierBannerList: [],
    thisYearProjectStatistics: [],
    getHomePanelData: {},
    saveHomePanelData: {},
    dynamicList: [],
  },

  effects: {
    *getQuantityStatistics({ payload }, { call, put }) {
      const response = yield call(getQuantityStatistics, payload);
      if (response.status === '200') {
        yield put({
          type: 'quantityStatistics',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getTodoTaskList({ payload }, { call, put }) {
      const response = yield call(getTodoTaskList, payload);
      if (response.status === '200') {
        yield put({
          type: 'todoTaskList',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getWaitOpenTenderList({ payload }, { call, put }) {
      const response = yield call(getWaitOpenTenderList, payload);
      if (response.status === '200') {
        yield put({
          type: 'waitOpenTenderList',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getSupplierBannerList({ payload }, { call, put }) {
      const response = yield call(getSupplierBannerList, payload);
      if (response.status === '200') {
        yield put({
          type: 'supplierBannerList',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getThisYearProjectStatistics({ payload }, { call, put }) {
      const response = yield call(getThisYearProjectStatistics, payload);
      if (response.status === '200') {
        yield put({
          type: 'thisYearProjectStatistics',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getHomePanel({ payload }, { call, put }) {
      const response = yield call(getHomePanel, payload);
      if (response.status === '200') {
        yield put({
          type: 'getHomePanelData',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *saveHomePanel({ payload }, { call, put }) {
      const response = yield call(saveHomePanel, payload);
      if (response.status === '200') {
        yield put({
          type: 'saveHomePanelData',
          payload: response,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *queryOperateDynamicInfo({ payload }, { call, put }) {
      const response = yield call(queryOperateDynamicInfo, payload);
      if (response.status === '200') {
        yield put({
          type: 'dynamicList',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
  },

  reducers: {
    quantityStatistics(state, { payload }) {
      return {
        ...state,
        quantityStatistics: payload,
      };
    },
    todoTaskList(state, { payload }) {
      return {
        ...state,
        todoTaskList: payload,
      };
    },
    waitOpenTenderList(state, { payload }) {
      return {
        ...state,
        waitOpenTenderList: payload,
      };
    },
    supplierBannerList(state, { payload }) {
      return {
        ...state,
        supplierBannerList: payload,
      };
    },
    thisYearProjectStatistics(state, { payload }) {
      return {
        ...state,
        thisYearProjectStatistics: payload,
      };
    },
    getHomePanelData(state, { payload }) {
      return {
        ...state,
        getHomePanelData: payload,
      };
    },
    saveHomePanelData(state, { payload }) {
      return {
        ...state,
        saveHomePanelData: payload,
      };
    },
    dynamicList(state, { payload }) {
      return {
        ...state,
        dynamicList: payload,
      };
    },
  },
};
