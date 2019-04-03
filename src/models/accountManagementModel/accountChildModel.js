/*eslint-disable*/ //作用是文件关闭eslint检查
import { message } from 'antd';
import {
  saveSubUser,
  showCorpMembers,
  updateSubUserStatus,
  serchSameUserName,
} from '../../services/user';

export default {
  namespace: 'accountChildModel',

  state: {
    data: '子账号管理',
    loading: false,
    updateStatus: false,
    saveStatus: false,
    membersList: {},
    SameUserName: {},
  },

  effects: {
    *showCorpMembers({ payload }, { call, put }) {
      const response = yield call(showCorpMembers, payload);
      if (response.status === '200') {
        yield put({
          type: 'CorpMembersList',
          payload: {
            membersList: response,
          },
        });
      } else {
        message.warning(response.msg);
      }
    },
    *updateSubUserStatus({ payload }, { call, put }) {
      const response = yield call(updateSubUserStatus, payload);
      if (response.status === '200') {
        yield put({
          type: 'updateStatus',
          payload: true,
        });
      } else {
        yield put({
          type: 'updateStatus',
          payload: false,
        });
        message.warning(response.msg);
      }
    },
    *serchSameUserName({ payload }, { call, put }) {
      const response = yield call(serchSameUserName, payload);
      if (response.status === '200') {
        yield put({
          type: 'SameUserName',
          payload: {
            SameUserName: response,
          },
        });
      } else {
        message.warning(response.msg);
      }
    },

    *saveSubUser({ payload }, { call, put }) {
      const response = yield call(saveSubUser, payload);
      if (response.status === '200') {
        yield put({
          type: 'saveUser',
          payload: true,
        });
      } else {
        yield put({
          type: 'saveUser',
          payload: false,
        });
        message.warning(response.msg);
      }
    },
  },

  reducers: {
    CorpMembersList(state, { payload }) {
      console.log(payload);
      return {
        ...state,
        membersList: payload.membersList,
      };
    },
    SameUserName(state, { payload }) {
      console.log(payload);
      return {
        ...state,
        SameUserName: payload.SameUserName,
      };
    },
    saveUser(state, { payload }) {
      return {
        ...state,
        saveStatus: payload,
      };
    },
    updateStatus(state, { payload }) {
      return {
        ...state,
        updateStatus: payload,
      };
    },
  },
};
