/*eslint-disable*/
import { message } from 'antd';
import {
  getBidList,
  batchUploadAgreement,
  queryTenderQuestionByPage,
  getAgreements,
  saveReply,
  saveAsk,
} from '../../services/tender';

export default {
  namespace: 'bidContract',
  state: {
    BidList: [],
    Agreements: [],
    saveStatus: false,
    saveAnswer: false,
    saveAskStatus: false,
    questionByPage: {},
  },

  effects: {
    *getBidList({ payload }, { call, put }) {
      console.log(payload);
      const response = yield call(getBidList, payload);
      if (response.status == '200') {
        yield put({
          type: 'BidList',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *getAgreements({ payload }, { call, put }) {
      console.log(payload);
      const response = yield call(getAgreements, payload);
      if (response.status == '200') {
        yield put({
          type: 'Agreements',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *batchUploadAgreement({ payload }, { call, put }) {
      const response = yield call(batchUploadAgreement, payload);
      if (response.status == '200') {
        yield put({
          type: 'saveStatus',
          payload: true,
        });
      } else {
        yield put({
          type: 'saveStatus',
          payload: false,
        });
        message.warning(response.msg);
      }
    },
    *queryTenderQuestionByPage({ payload }, { call, put }) {
      const response = yield call(queryTenderQuestionByPage, payload);

      if (response.status == 200) {
        yield put({
          type: 'questionByPage',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *saveReply({ payload }, { call, put }) {
      const response = yield call(saveReply, payload);
      if (response.status == '200') {
        yield put({
          type: 'saveAnswer',
          payload: true,
        });
      } else {
        yield put({
          type: 'saveAnswer',
          payload: false,
        });
        message.warning(response.msg);
      }
    },
    *saveAsk({ payload }, { call, put }) {
      const response = yield call(saveAsk, payload);
      if (response.status == '200') {
        yield put({
          type: 'saveAskStatus',
          payload: true,
        });
      } else {
        yield put({
          type: 'saveAskStatus',
          payload: false,
        });
        message.warning(response.msg);
      }
    },
  },
  reducers: {
    BidList(state, { payload }) {
      return {
        ...state,
        BidList: payload,
      };
    },
    Agreements(state, { payload }) {
      return {
        ...state,
        Agreements: payload,
      };
    },
    saveStatus(state, { payload }) {
      return {
        ...state,
        saveStatus: payload,
      };
    },
    saveAnswer(state, { payload }) {
      return {
        ...state,
        saveAnswer: payload,
      };
    },
    saveAskStatus(state, { payload }) {
      return {
        ...state,
        saveAskStatus: payload,
      };
    },
    questionByPage(state, { payload }) {
      return {
        ...state,
        questionByPage: payload,
      };
    },
  },
};
