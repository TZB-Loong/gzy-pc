/*eslint-disable*/
import {} from '../../services/api';

export default {
  namespace: 'approvalSettingModel',

  state: {
    data: '空白页面approvalSettingModel',
    loading: false,
  },

  effects: {
    // *fetch(_, { call, put }) {
    //   const response = yield call(fakeChartData);
    //   yield put({
    //     type: 'save',
    //     payload: response,
    //   });
    // }
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {
        data: '',
      };
    },
  },
};
