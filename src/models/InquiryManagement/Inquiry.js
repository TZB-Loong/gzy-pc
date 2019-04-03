/*eslint-disable*/

import { message } from 'antd';
import { queryInquiryByPage, operation, getDictionaryByParentId } from '../../services/inquiry';

export default {
  namespace: 'Inquiry', //所有的询价共用一个namespace
  state: {
    title: '发布询价',
    inquiryData: {},
    operationStatus: false,
    dictionaryByParentId: [],
  },

  effects: {
    *queryInquiryByPage({ payload }, { call, put }) {
      const response = yield call(queryInquiryByPage, payload);

      if (response.status == 200) {
        yield put({
          type: 'inquiryByPage',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getDictionaryByParentId({ payload }, { call, put }) {
      const response = yield call(getDictionaryByParentId, payload);

      if (response.status == 200) {
        yield put({
          type: 'dictionaryByParentId',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *operation({ payload }, { call, put }) {
      const response = yield call(operation, payload);

      if (response.status == 200) {
        yield put({
          type: 'operationList',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
  },
  reducers: {
    inquiryByPage(state, { payload }) {
      return {
        ...state,
        inquiryData: payload,
      };
    },
    dictionaryByParentId(state, { payload }) {
      return {
        ...state,
        dictionaryByParentId: payload,
      };
    },
    operationList(state) {
      return {
        ...state,
        operationStatus: true,
      };
    },
  },
};
