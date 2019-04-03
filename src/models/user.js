import { query as queryUsers, queryCurrent, fetchMenu } from '../services/user';
import { setSession } from '../utils/authority';
import {message} from 'antd';
export default {
  namespace: 'user',
  state: {
    list: [],
    currentUser: { key: 456 },
    userMenu: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      /*const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });*/
    },
    *fetchMenu(_, { call, put }) {
      const response = yield call(fetchMenu);
      if (response.status === '200') {
        yield put({
          type: 'saveSession',
          payload: response.data,
        });
      } else {
        message.info(response.msg);
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveSession(state, action) {
      setSession('authbusiness',JSON.stringify(action.payload.authbusiness));
      setSession('user',JSON.stringify(action.payload.user));
      setSession('menuData',JSON.stringify(action.payload.menuViews));
      setSession('menuOperations',JSON.stringify(action.payload.menuOperations));
      return {
        ...state,
        userMenu: action.payload.menuViews,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
