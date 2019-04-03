/*eslint-disable*/
import {
  queryRoleUsers,
  queryRoles,
  queryRoleMenus,
  saveRole,
  deleteRole,
  saveAuthority
} from '../../services/user';
import {message} from 'antd';
export default {
  namespace: 'authoritySettings',
  state: {
    title: '权限管理',
    Roles: [],
    roleAuthority: [],
    saveStatus:false,
  },
  effects: {
    *queryRoles({ payload }, { call, put }) {
      const response = yield call(queryRoles, payload);
      if(response.status==='200'){
        yield put({
          type: 'saveRoles',
          payload: response,
        });
      }else {
        message.warning(response.msg);
      }
    },
    *queryRoleUsers({ payload }, { call, put }) {
      const response = yield call(queryRoleUsers, payload);
      if(response.status==='200'){
        yield put({
          type: 'saveRoles',
          payload: response,
        });
      }else {
        message.warning(response.msg);
      }
    },
    *deleteRole({ payload }, { call, put }) {
      const response = yield call(deleteRole, payload);
      if(response.status==='200'){
        yield put({
          type: 'saveStatus',
          payload: response,
        });
      }else {
        message.warning(response.msg);
      }
    },
    *queryRoleMenus({ payload }, { call, put }) {
      const response = yield call(queryRoleMenus, payload);
      if(response.status==='200') {
        yield put({
          type: 'saveRoleMenus',
          payload: response,
        });
      }else {
        message.warning(response.msg);
      }
    },
    *saveRole({ payload }, { call, put }) {
      const response = yield call(saveRole, payload);
      if(response.status==='200'){
        yield put({
          type: 'saveStatus',
          payload: response,
        });
      }else {
        message.warning(response.msg);
      }
    },
    *saveAuthority({ payload }, { call, put }) {
      const response = yield call(saveAuthority, payload);
      if(response.status==='200'){
        yield put({
          type: 'saveStatus',
          payload: response,
        });
      }else {
        message.warning(response.msg);
      }
    },
  },

  reducers: {
    saveRoles(state, {payload}) {
      return {
        ...state,
        Roles: payload.data,
      };
    },
    saveStatus(state, {payload}) {
      return {
        ...state,
        saveStatus: true,
      };
    },
    saveRoleMenus(state, {payload}) {
      return {
        ...state,
        roleAuthority: payload.data,
      };
    }
  },
};
