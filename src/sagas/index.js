import {
  fork,
  take,
  call,
  put,
  delay,
  takeLatest,
  select,
} from 'redux-saga/effects';
import * as taskTypes from '../constants/task';
import { getList } from '../apis/task';
import { STATUS_CODE } from '../constants';
import {
  fetchListTaskSuccess,
  fetchListTaskFailed,
  filterTaskSuccess,
} from '../actions/task';
import { showLoading, hideLoading } from '../actions/ui';

function* watchFetchListTaskAction() {
  while (true) {
    yield take(taskTypes.FETCH_TASK);
    yield put(showLoading());
    // ===== block ===== //
    const res = yield call(getList);
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
  const list = yield select(state => state.task.listTask);
  const filteredTask = list.filter(task =>
    task.title
      .trim()
      .toLowerCase()
      .includes(keyword.trim().toLowerCase()),
  );
  yield put(filterTaskSuccess(filteredTask));
}

function* rootSaga() {
  yield fork(watchFetchListTaskAction);
  yield takeLatest(taskTypes.FILTER_TASK, filterTaskSaga);
}

export default rootSaga;