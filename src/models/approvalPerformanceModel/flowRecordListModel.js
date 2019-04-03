/*eslint-disable*/
import { message } from 'antd';
import { queryProcessTracking } from '../../services/flowRecordList';
export default {
  namespace: 'flowRecordListModel',
  state: {
    title: '审批记录',
    total: 0,
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryProcessTracking, payload);
      if (response.status === '200') {
        yield put({
          type: 'flowRecordList',
          payload: {
            flowRecordList: response,
          },
        });
      } else {
        message.error(response.msg);
      }
    },
    // *details({ payload }, { call, put }) {
    //   const response = yield call(queryProjectById, payload);
    //   if (response.status == '200') {
    //     yield put({
    //       type: 'projectDetails',
    //       payload: {
    //         projectDetails: response,
    //       },
    //     });
    //   } else {
    //     message.error(response.msg);
    //   }
    // },
    // *getCompanyName({}, { call, put }) {
    //   const response = yield call(queryCompanyName);
    //
    //   if (response.status == '200') {
    //     yield put({
    //       type: 'CompanyName',
    //       payload: response,
    //     });
    //   } else {
    //     message.error(response.msg);
    //   }
    // },
    // *addProject({ payload, callback }, { call, put }) {
    //   const response = yield call(saveProject, payload);
    //   if (response.status == '200') {
    //     yield put({
    //       type: 'saveProject',
    //       payload: {
    //         saveProject: response,
    //       },
    //     });
    //     if (callback) callback();
    //   } else {
    //     message.error(response.msg);
    //   }
    // },
    // *delProject({ payload, callback }, { call, put }) {
    //   const response = yield call(deleteProject, payload.delProject);
    //   if (response.status == '200') {
    //     yield put({
    //       type: 'fetch',
    //       payload: payload.fetch,
    //     });
    //   } else {
    //     message.error(response.msg);
    //   }
    //   yield put({
    //     type: 'delProjectRe',
    //     payload: {
    //       deleteProject: response,
    //     },
    //   });
    //   if (callback) callback();
    // },
    // *ProjectMember({ payload }, { call, put }) {
    //   const response = yield call(queryProjectMemberList, payload);
    //   if (response.status === '200') {
    //     yield put({
    //       type: 'ProjectMemberList',
    //       payload: response,
    //     });
    //   } else {
    //     message.error(response.msg);
    //   }
    // },
    // *saveProjectMember({ payload }, { call, put }) {
    //   const response = yield call(saveProjectMember, payload);
    //   if (response.status === '200') {
    //     yield put({
    //       type: 'saveProjectMemberType',
    //     });
    //   } else {
    //     message.error(response.msg);
    //   }
    // },
  },

  reducers: {
    flowRecordList(
      state,
      {
        payload: { flowRecordList },
      }
    ) {
      return {
        ...state,
        flowRecordList: flowRecordList.data,
        total: flowRecordList.data ? flowRecordList.data.total : 0,
      };
    },
    // projectDetails(
    //   state,
    //   {
    //     payload: { projectDetails },
    //   }
    // ) {
    //   return {
    //     ...state,
    //     projectDetails: projectDetails,
    //   };
    // },
    // saveProject(
    //   state,
    //   {
    //     payload: { saveProject },
    //   }
    // ) {
    //   return {
    //     ...state,
    //     saveProject: saveProject,
    //   };
    // },
    // delProjectRe(
    //   state,
    //   {
    //     payload: { deleteProject },
    //   }
    // ) {
    //   return {
    //     ...state,
    //     delProject: deleteProject,
    //   };
    // },
    // CompanyName(state, { payload }) {
    //   return {
    //     ...state,
    //     CompanyName: payload,
    //   };
    // },
    // ProjectMemberList(state, { payload }) {
    //   return {
    //     ...state,
    //     ProjectMemberList: payload,
    //   };
    // },
    // saveProjectMemberType(state) {
    //   return {
    //     ...state,
    //     ProjectMemberStatus: true,
    //   };
    // },
  },
};
