import moment from 'moment';
import {fixedZero} from '../utils/utils'
/**
 * 公共方法，用于时间格式化
 * **/
export function format(date, fmt = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    return '';
  }
  if (typeof date === 'string') {
    date = new Date(date.replace(/-/g, '/'));
  }
  if (typeof date === 'number') {
    date = new Date(date);
  }
  let o = {
    'M+': date.getMonth() + 1,
    'D+': date.getDate(),
    'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
    'H+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  let week = {
    '0': '\u65e5',
    '1': '\u4e00',
    '2': '\u4e8c',
    '3': '\u4e09',
    '4': '\u56db',
    '5': '\u4e94',
    '6': '\u516d',
  };
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? '\u661f\u671f' : '\u5468') : '') +
      week[date.getDay() + '']
    );
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }
  return fmt;
}

export function getPreDay(date) {
  const oneDay = 1000 * 60 * 60 * 24;
  const now = new Date(moment(date, 'YYYY-MM-DD').valueOf());
  return moment(now.getTime() - oneDay).format('YYYY-MM-DD');
}

export function getNextDay(date) {
  const oneDay = 1000 * 60 * 60 * 24;
  const now = new Date(moment(date, 'YYYY-MM-DD').valueOf());
  return moment(now.getTime() + oneDay).format('YYYY-MM-DD');
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'lastday') {
    var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [moment(lastDay), moment(lastDay.getTime() + (oneDay - 1000))];
  }

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [
      moment(now),
      moment(now.getTime() + (oneDay - 1000)),
      moment(now.getTime() - oneDay),
      moment(now.getTime() + oneDay),
    ];
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
      moment(`${year}-${fixedZero(month)}-01 00:00:00`),
    ];
  }
  if (type === 'nextMonth') {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month() + 1;

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

export async function  timestampToTime (timestamp, HMS) {  //时间戳转换为时间格式
  /** 参数格式说明
   * |参数名称|参数类型|参数说明|是否必须
   * |timestamp|string或者number|时间戳或者时间格式|是
   * |HMS|string|返回的时间格式{
   *                              underfind:返回 年-月-日
   *                              HMS:返回 年-月-日  时:分:秒
   *                              HM:返回 年-月-日  时:分
   *                              H: 返回 年-月-日  时
   *                          }   |否
   */
  if (typeof timestamp == 'string') { //兼容ios

    timestamp = timestamp.replace(/\-/g, "/");
  }
  if (timestamp == null) {
    return ''
  }

  var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate() + ' ';
  if (HMS == 'HMS') { //返回年月日,时分秒
    var h = date.getHours() < 10 ? '0' + date.getHours() + ":" : date.getHours() + ":";
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':';
    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + M + D + ' ' + h + m + s
  }
  if (HMS == 'HM') { //返回年月日,时分
    var h = date.getHours() < 10 ? '0' + date.getHours() + ":" : date.getHours() + ":";
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return Y + M + D + ' ' + h + m;
  }
  if (HMS == 'H') { //返回年月日,时
    var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    return Y + M + D + ' ' + h + ':00'
  }

  return Y + M + D    //只返回年月日
}
