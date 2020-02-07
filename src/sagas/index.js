import {
  fork,
  take,
  call,
  put,
  delay,
  takeLatest,
  takeEvery,
} from 'redux-saga/effects';
import * as taskTypes from '../constants/task';
import { getList, addTask } from '../apis/task';
import { STATUS_CODE, STATUSES } from '../constants';
import {
  fetchListTaskSuccess,
  fetchListTaskFailed,
  addTaskSuccess,
  addTaskFailed,
  fetchListTask,
} from '../actions/task';
import { showLoading, hideLoading } from '../actions/ui';
import { hideModal } from '../actions/modal';

function* watchFetchListTaskAction() {
  while (true) {
    const action = yield take(taskTypes.FETCH_TASK);
    yield put(showLoading());
    const { params } = action.payload;
    const res = yield call(getList, params);
    // ===== block cho đến khi call xong ===== //
    const { status, data } = res;
    if (status === STATUS_CODE.SUCCESS) {
      // dispatch action fetch list success
      yield put(fetchListTaskSuccess(data));
    } else {
      // dispatch action fetch list task failed
      yield put(fetchListTaskFailed(data));
    }
    yield delay(1000);
    yield put(hideLoading());
  }
}

function* filterTaskSaga({ payload }) {
  yield delay(500);
  const { keyword } = payload;
  yield put(fetchListTask({ q: keyword }));
}

function* addTaskSaga({ payload }) {
  const { title, description } = payload;
  yield put(showLoading());
  const res = yield call(addTask, {
    title,
    description,
    status: STATUSES[0].value,
  });

  const { data, status } = res;
  if (status === STATUS_CODE.CREATED) {
    yield put(addTaskSuccess(data));
    yield put(hideModal());
  } else {
    yield put(addTaskFailed(data));
  }
  yield delay(1000);
  yield put(hideLoading());
}

function* rootSaga() {
  yield fork(watchFetchListTaskAction);
  yield takeLatest(taskTypes.FILTER_TASK, filterTaskSaga);
  yield takeEvery(taskTypes.ADD_TASK, addTaskSaga);
}

export default rootSaga;
