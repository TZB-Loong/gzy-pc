/*eslint-disable*/
import {} from '../../services/api';
import { message } from 'antd';
import { queryPaymentDetails, sendApproval,sendApprovalNo } from '../../services/process';

export default {
  namespace: 'payApprovalModel',

  state: {
    data: '审批详情',
    loading: false,
    sendStatus: false,
    payDetails: {},
  },

  effects: {
    *queryPayment({ payload }, { call, put }) {
      const response = yield call(queryPaymentDetails, payload);
      if (response.status === '200') {
        yield put({
          type: 'payDetails',
          payload: {
            payDetails: response,
          },
        });
      } else {
        message.error(response.msg);
      }
    },
    *sendApproval({ payload }, { call, put }) {
      const response = yield call(sendApproval, payload);
      if (response.status === '200') {
        yield put({
          type: 'sendStatus',
          payload: true,
        });
      } else {
        message.error(response.msg);
      }
    },
    *sendApprovalNo({ payload }, { call, put }) {
      const response = yield call(sendApprovalNo, payload);
      if (response.status === '200') {
        yield put({
          type: 'sendStatus',
          payload: true,
        });
      } else {
        message.error(response.msg);
      }
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    sendStatus(state, { payload }) {
      return {
        sendStatus: true,
      };
    },
    payDetails(
      state,
      {
        payload: { payDetails },
      }
    ) {
      return {
        ...state,
        payDetails: payDetails.data,
        total: payDetails.data ? payDetails.data.total : 0,
      };
    },
    clear() {
      return {
        data: '',
      };
    },
  },
};
