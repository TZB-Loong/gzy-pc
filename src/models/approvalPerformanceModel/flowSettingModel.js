/*eslint-disable*/
import {} from '../../services/api';

export default {
  namespace: 'flowSettingModel',

  state: {
    data: '流程设计器',
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
