/*eslint-disable*/
import {} from '../../services/api';

import { queryPaymentDetails } from '../../services/process';

export default {
  namespace: 'payDetailsModel',

  state: {
    data: '审批详情',
    loading: false,
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
  },

  reducers: {
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
  },
};
