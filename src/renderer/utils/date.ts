import dayjs from 'dayjs';

/** 判断两个日期是否是同一天 */
export function isSameDay(currentTime: string, diffTime: string) {
  if (!diffTime) {
    return false;
  }

  const currentCreatedAt = dayjs(parseInt(currentTime));
  const diffCreatedAt = dayjs(parseInt(diffTime));

  if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
    return false;
  }

  return currentCreatedAt.isSame(diffCreatedAt, 'day');
}

/** 时间格式化 */
export function showTime(timer: string) {
  const date = dayjs(parseInt(timer)).locale('zh-cn');
  const nowDate = dayjs();
  const diffDay = nowDate.diff(date, 'day');

  if (diffDay < 1) {
    // 小于24小时
    return nowDate.isSame(date, 'day')
      ? date.format('HH:mm')
      : date.format('[昨天] HH:mm');
  }

  if (diffDay < 2) {
    // 昨天
    return date.isSame(nowDate.subtract(1, 'day'))
      ? date.format('[昨天] HH:mm')
      : date.format('dddd HH:mm');
  }

  if (diffDay < 7) {
    return date.format('dddd HH:mm');
  }

  return date.format('YYYY-MM-DD');
}
