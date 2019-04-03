/*eslint-disable*/
import { message } from 'antd';
import {
  queryProjectByPage,
  queryProjectById,
  saveProject,
  deleteProject,
  queryCompanyName,
  queryProjectMemberList,
  saveProjectMember,
} from '../../services/project';
export default {
  namespace: 'myProjectModel',
  state: {
    title: '项目管理',
    delProject: {},
    CompanyName: '',
    projectList: {},
    projectDetails: {},
    saveProject: {},
    total: 0,
    ProjectMemberList: {},
    ProjectMemberStatus: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryProjectByPage, payload);
      if (response.status === '200') {
        yield put({
          type: 'projectList',
          payload: {
            projectList: response,
          },
        });
      } else {
        message.error(response.msg);
      }
    },
    *details({ payload }, { call, put }) {
      const response = yield call(queryProjectById, payload);
      if (response.status == '200') {
        yield put({
          type: 'projectDetails',
          payload: {
            projectDetails: response,
          },
        });
      } else {
        message.error(response.msg);
      }
    },
    *getCompanyName({}, { call, put }) {
      const response = yield call(queryCompanyName);

      if (response.status == '200') {
        yield put({
          type: 'CompanyName',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    *addProject({ payload, callback }, { call, put }) {
      const response = yield call(saveProject, payload);
      if (response.status == '200') {
        yield put({
          type: 'saveProject',
          payload: response,
        });
        if (callback) callback();
      } else {
        yield put({
          type: 'saveProject',
          payload: response,
        });
        if (callback) callback();
        message.error(response.msg);
      }
    },
    *delProject({ payload, callback }, { call, put }) {
      const response = yield call(deleteProject, payload.delProject);
      if (response.status == '200') {
        yield put({
          type: 'fetch',
          payload: payload.fetch,
        });
      } else {
        message.error(response.msg);
      }
      yield put({
        type: 'delProjectRe',
        payload: {
          deleteProject: response,
        },
      });
      if (callback) callback();
    },
    *ProjectMember({ payload }, { call, put }) {
      const response = yield call(queryProjectMemberList, payload);
      if (response.status === '200') {
        yield put({
          type: 'ProjectMemberList',
          payload: response,
        });
      } else {
        message.error(response.msg);
      }
    },
    *saveProjectMember({ payload }, { call, put }) {
      const response = yield call(saveProjectMember, payload);
      if (response.status === '200') {
        yield put({
          type: 'saveProjectMemberType',
          payload: response,
        });
      } else {
        yield put({
          type: 'saveProjectMemberType',
          payload: response,
        });
        message.error(response.msg);
      }
    },
  },

  reducers: {
    projectList(
      state,
      {
        payload: { projectList },
      }
    ) {
      return {
        ...state,
        projectList: projectList.data,
        total: projectList.data ? projectList.data.total : 0,
      };
    },
    projectDetails(
      state,
      {
        payload: { projectDetails },
      }
    ) {
      return {
        ...state,
        projectDetails: projectDetails,
      };
    },
    saveProject(state, { payload }) {
      return {
        ...state,
        saveProject: payload,
      };
    },
    delProjectRe(
      state,
      {
        payload: { deleteProject },
      }
    ) {
      return {
        ...state,
        delProject: deleteProject,
      };
    },
    CompanyName(state, { payload }) {
      return {
        ...state,
        CompanyName: payload,
      };
    },
    ProjectMemberList(state, { payload }) {
      return {
        ...state,
        ProjectMemberList: payload,
      };
    },
    saveProjectMemberType(state, { payload }) {
      return {
        ...state,
        ProjectMemberStatus: payload,
      };
    },
  },
};
