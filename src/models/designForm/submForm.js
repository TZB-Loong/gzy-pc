// import { queryTags } from '../services/api';
import {
  customFormSave,
  bizObjectMetadataCustomList,
  customFormView,
  send,
  back
} from '../../services/process';
import { message } from 'antd';
export default {
  namespace: 'submForm',

  state: {
    title: "提交审批",
    listData: [],
    customFormSaveOk: [],
    customFormViewData: [],
    customFormSaveStatus: false,
    sendStatus:false,
    backStatus:false,
    basic:{},
  },

  effects: {
    *bizObjectMetadataCustomList({ payload }, { call, put }) {
      // console.log(payload,'payload')
      const response = yield call(bizObjectMetadataCustomList, payload);
      if (response.status == '200') {
        yield put({
          type: 'bizObjectMetadataCustomListSave',
          payload: response.data,
        });
        // message.success(response.msg)
      } else {
        message.warning(response.msg)
      }
    },
    *customFormSave({ payload }, { call, put }) {
      const response = yield call(customFormSave, payload);
      if (response.status == '200') {
        // message.success(response.msg)
        yield put({
          type: 'customForm_save',
          payload: response,
        })
      } else {
        message.warning(response.msg)
      }
    },
    *customFormView({ payload }, { call, put }) {
      //查询发起审批的数据
      const response = yield call(customFormView, payload);
      if (response.status == '200') {
        yield put({
          type: 'customFormViewSave',
          payload: response.data
        })
      } else {
        message.warning(response.msg)
      }
    },
    *send({ payload }, { call, put }) {
      const response = yield call(send, payload);
      if (response.status == '200') {
        //审批成功后处理的事件
        yield put  ({
          type:'sendSave',
          payload:response
        })
      } else {
        message.warning(response.msg)
      }
    },
    *back({payload},{call,put}){
      const response = yield call(back,payload);
      if(response.status =='200'){
        //回退成功时
        yield put ({
          type:'backSave',
          payload:response
        })
      }else{
        message.warning(response.msg)
      }
    }
  },

  reducers: {
    customForm_save(state, { payload }) {
      console.log(payload,'payload')
      return {
        ...state,
        customFormSaveOk: payload.data,
        customFormSaveStatus: payload.status == '200',
      }
    },
    bizObjectMetadataCustomListSave(state, { payload }) {
      return {
        ...state,
        listData: payload
      }
    },
    customFormViewSave(state, { payload }) {
      return {
        ...state,
        customFormViewData: payload
      }
    },
    sendSave(state,{payload}){
      return {
        ...state,
        sendStatus:payload.status == '200'
      }
    },
    backSave(state,{payload}){
      return {
        ...state,
        backStatus:payload.status == '200'
      }
    }
  },
};
