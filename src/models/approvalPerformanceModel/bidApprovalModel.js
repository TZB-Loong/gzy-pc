/*eslint-disable*/
import { message } from 'antd';
import { bidApprovalList } from '../../services/process';
export default {
  namespace: 'bidApprovalModel',
  state: {
    title: '定标审批列表',
    total: 0,
  },

  effects: {
    *bidApprovalList({ payload }, { call, put }) {
      const response = yield call(bidApprovalList, payload);
      if (response.status === '200') {
        yield put({
          type: 'bidApproval',
          payload: {
            bidApproval: response,
          },
        });
      } else {
        message.error(response.msg);
      }
    },
  },

  reducers: {
    bidApproval(
      state,
      {
        payload: { bidApprovalDetailsl },
      }
    ) {
      return {
        ...state,
        bidApproval: bidApprovalDetails.data,
        total: bidApprovalDetails.data ? bidApprovalDetails.data.total : 0,
      };
    },
  },
};
