/*eslint-disable*/
import { queryMessagesByPage, showMessageDetails } from '../../services/user';
import { message } from 'antd';
export default {
  namespace: 'informationCenterModel',

  state: {
    data: '消息中心',
    loading: false,
    messageList: {},
    messageDetails: {},
  },

  effects: {
    *messageList({ payload }, { call, put }) {
      const response = yield call(queryMessagesByPage, payload);
      if (response.status === '200') {
        yield put({
          type: 'messagesByPage',
          payload: response.data,
        });
      } else {
        message.error(response.msg);
      }
    },
    *messageDetails({ payload }, { call, put }) {
      const response = yield call(showMessageDetails, payload);
      if (response.status === '200') {
        yield put({
          type: 'showMessageDetails',
          payload: response.data,
        });
      } else {
        message.error(response.msg);
      }
    },
  },

  reducers: {
    messagesByPage(state, { payload }) {
      return {
        ...state,
        messageList: payload,
      };
    },
    showMessageDetails(state, { payload }) {
      return {
        ...state,
        messageDetails: payload,
      };
    },
  },
};
