import './polyfill';
import dva from 'dva';
import { message } from 'antd';
import createHistory from 'history/createHashHistory';
// user BrowserHistory
// import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading';
import 'moment/locale/zh-cn';
import './rollbar';

import './index.less';
// 1. Initialize
const app = dva({
  history: createHistory(),
});

// 2. Plugins
app.use(createLoading());

// 3. Register global model
app.model(require('./models/global').default);
// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');
message.config({
  top: 100,
  duration: 2,
  maxCount: 1,
});

export default app._store; // eslint-disable-line
