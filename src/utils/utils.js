import moment from 'moment';
import { Input, Button, Icon } from 'antd';
import { pathPurchase } from '../../configPath';
import styles from './utils.less';
import { parse, stringify } from 'qs';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}
export function getCookie(type) {
  let typeData = 'gzy-token';
  if (type) {
    typeData = type;
  }
  let gzyToken = 'gPLplmVNo7n0ndfYAOHSbsi_tCrHFdPaQEvuDSLDx7rmZvII6xWQIgAHkDFMCxqzeqUCNYKOP94s8-uUbR0E';
  // let gzyToken = 'gPLplmVNo7n0ndfYAOHSbsi_tCrHFdPaQEvuDSXLwLnnZvsA7xqTIgAHkDFMCxqzeqUCNYKOP94s8-ufbx0E';
  const strcookie = document.cookie; //获取cookie字符串
  let arrcookie = strcookie.split(';'); //分割
  for (var i = 0; i < arrcookie.length; i++) {
    var arr = arrcookie[i].split('=')[0];
    if (arr == typeData || arr == ' ' + typeData) {
      gzyToken = arrcookie[i].replace(arr + '=', '');
    }
  }
  return gzyToken;
}
//获取采购状态（防止与获取token冲突单独写一个函数）
export function getPurchased(type) {
  let alreadyPurchased = 'true';
  const strcookie = document.cookie; //获取cookie字符串
  let arrcookie = strcookie.split(';'); //分割
  for (let i = 0; i < arrcookie.length; i++) {
    let arr = arrcookie[i].split('=')[0];
    if (arr == type || arr == ' ' + type) {
      alreadyPurchased = arrcookie[i].replace(arr + '=', '');
    }
  }
  return alreadyPurchased;
}
//清除cookies
export function clearCookie() {
  let keys = document.cookie.match(/[^ =;]+(?=\=)/g);
  if (keys) {
    for (let i = keys.length; i--; )
      document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
  }
}
// 判断权限
export function isAuth(status) {
  let authority = sessionStorage.getItem('menuOperations') || '';
  return authority.indexOf(status) > -1;
}
//生成随机数
export function uuid() {
  let s = [];
  let hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23];

  let uuid = s.join('');
  return uuid;
}
export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}
//阿拉伯数字转中文
export function SectionToChinese(section) {
  let chnNumChar = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  let chnUnitSection = ['', '万', '亿', '万亿', '亿亿'];
  let chnUnitChar = ['', '十', '百', '千'];
  let strIns = '',
    chnStr = '';
  let unitPos = 0;
  let zero = true;
  while (section > 0) {
    let v = section % 10;
    if (v === 0) {
      if (!zero) {
        zero = true;
        chnStr = chnNumChar[v] + chnStr;
      }
    } else {
      zero = false;
      strIns = chnNumChar[v];
      strIns += chnUnitChar[unitPos];
      chnStr = strIns + chnStr;
    }
    unitPos++;
    section = Math.floor(section / 10);
  }
  //替换以“一十”开头的，为“十”
  if (chnStr.indexOf('一十') == 0) {
    chnStr = chnStr.substr(1);
  }
  //替换以“零”结尾的，为“”
  if (chnStr.lastIndexOf('零') == chnStr.length - 1) {
    chnStr = chnStr.substr(0, chnStr.length - 1);
  }
  return chnStr;
}
function accMul(arg1, arg2) {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();
  m += s1.split('.').length > 1 ? s1.split('.')[1].length : 0;
  m += s2.split('.').length > 1 ? s2.split('.')[1].length : 0;
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / 10 ** m;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟', '万']];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(accMul(num, 10 * 10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}
/**
 * 获取请求参数
 * @param name
 * @returns {*}
 */
export function getUrlParamBySearch(url, name) {
  url = url+ "";
  let regstr = "/(\\?|\\&)" + name + "=([^\\&]+)/";
  let reg = eval(regstr);
  //eval可以将 regstr字符串转换为 正则表达式
  let result = url.match(reg);
  if (result && result[2]) {
    return result[2];
  }
}


/**
 * 获取下载标签
 * @param path 文件全路径
 * @returns {*}
 */
/*export function getDownloadUrl(path) {
  let fileName = '';
  if (!path) {
    return '';
  } else {
    if (path.lastIndexOf('/') > 0) {
      fileName = path.substring(path.lastIndexOf('/') + 1);
    } else if (path.lastIndexOf('\\') > 0) {
      fileName = path.substring(path.lastIndexOf('\\') + 1);
    }
  }
  return apiURL + '/download?path=' + encodeURIComponent(path);
}*/
export function getDownloadUrl(path) {
  let fileName = '';
  if (!path) {
    return '';
  } else {
    if (path.lastIndexOf('/') > 0) {
      fileName = path.substring(path.lastIndexOf('/') + 1);
    } else if (path.lastIndexOf('\\') > 0) {
      fileName = path.substring(path.lastIndexOf('\\') + 1);
    }
  }
  return pathPurchase + path + '?gzy-token=' + getCookie();
}
/*
* 表格筛选条件
*
* */

export function filterProps(keyWord, keyPlaceholder, that) {
  let handleSearch = (selectedKeys, confirm) => () => {
    confirm();
    that.setState({ searchText: selectedKeys[0] });
  };
  let handleReset = clearFilters => () => {
    clearFilters();
    that.setState({ searchText: '' });
  };
  let filters = {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className={styles.customFilterDropdown}>
        <Input
          ref={ele => (that.searchInput = ele)}
          placeholder={keyPlaceholder}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={handleSearch(selectedKeys, confirm)}
        />
        <Button type="primary" onClick={handleSearch(selectedKeys, confirm)}>
          搜索
        </Button>
        <Button onClick={handleReset(clearFilters)}>重置</Button>
      </div>
    ),
    filterIcon: filtered => <Icon type="filter" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
    onFilter: (value, record) =>
      record[keyWord]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          that.searchInput.focus();
        });
      }
    },
    render: text => {
      const { searchText } = that.state;
      //搜索手机号码时需转换数据类型为string;
      text = text.toString();
      return searchText ? (
        <span>
          {text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map(
            (fragment, i) =>
              fragment.toLowerCase() === searchText.toLowerCase() ? (
                <span key={i} className={styles.highlight}>
                  {fragment}
                </span>
              ) : (
                fragment
              ) // eslint-disable-line
          )}
        </span>
      ) : (
        text
      );
    },
  };
  return filters;
}
