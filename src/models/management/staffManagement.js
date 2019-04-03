/*eslint-disable*/
import { message } from 'antd';
import { queryCorpUsersAndRoles, modifyCorpMemberRole } from '../../services/staffManagement';

export default {
  namespace: 'staffManagement',

  state: {
    staff: [],
  },

  effects: {
    *queryCorpUsersAndRoles({ payload }, { call, put }) {
      const response = yield call(queryCorpUsersAndRoles, payload);

      if (response.status == 200) {
        yield put({
          type: 'queryCorpUsersAndRolesSave',
          payload: response.data,
        });
      } else {
        message.warning(response.msg);
      }
    },
    *modifyCorpMemberRole({ payload }, { call, put }) {
      const response = yield call(modifyCorpMemberRole, payload);
      if (response.status != 200) {
        message.warning(response.msg);
      }
    },
  },
  reducers: {
    queryCorpUsersAndRolesSave(state, { payload }) {
      return {
        ...state,
        staff: payload,
      };
    },
  },
};
