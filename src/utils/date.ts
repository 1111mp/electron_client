import moment from 'moment';

/** 判断两个日期是否是同一天 */
export function isSameDay(currentTime: number, diffTime: number) {
  if (!diffTime) {
    return false;
  }

  const currentCreatedAt = moment(currentTime);
  const diffCreatedAt = moment(diffTime);

  if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
    return false;
  }

  return currentCreatedAt.isSame(diffCreatedAt, 'day');
}

/** 时间格式化 */
export function showTime(msgDate: number | Date) {
  msgDate = new Date(msgDate);
  let nowDate = new Date();
  let result = '';
  let startTime = nowDate.getTime();
  let endTime = msgDate.getTime();
  let dates = Math.abs(startTime - endTime) / (1000 * 60 * 60 * 24);
  // let d = moment.duration(moment(nowDate, 'YYYYMMDD').diff(moment(msgDate, "YYYYMMDD")));
  // let dates = d.asDays();
  if (dates < 1) {
    //小于24小时
    if (nowDate.getDate() === msgDate.getDate()) {
      //同一天,显示时间
      result = 'TODAY';
    } else {
      result = 'YESTERDAY';
    }
  } else if (dates < 2) {
    //昨天
    let yesterday = new Date(
      new Date(new Date().toLocaleDateString()).getTime() - 1
    );
    if (msgDate.getDate() === yesterday.getDate()) {
      result = 'YESTERDAY';
    } else {
      result = moment(msgDate).locale('en').format('M-D');
    }
  }
  // else if (dates <= 2) //前天
  // {
  //  result = moment(msgDate).format("前天 HH:mm");
  // }
  else if (dates < 7) {
    //一周内
    result = moment(msgDate).locale('en').format('M-D');
  } //显示日期
  else {
    result = moment(msgDate).locale('en').format('YYYY-MM-DD');
  }
  return result;
}
