const query = require('query-string');

const QUERY_REGEXP = /[?&]([^=&#]+)=([^&#]*)/g;
const SPLIT_QUERY_REGEXP = /[?&]([^=&#]+)=([^&#]*)/;

/**
 * 获取url上的query字段
 * @param url
 */
export function getLocationSearch(url?: string) {
  if (typeof window === 'undefined') return '';
  return queryMergeToStr(url || window.location.href || '');
}

/**
 * merge query字符串返回对象
 * @param search
 * @param target
 */
export function queryMergeToObj(search: string, target: string = '') {
  const matchQuery = search.match(QUERY_REGEXP);
  const matchTarget = target.match(QUERY_REGEXP);
  const getQueryObj = (match?: string[] | null) => {
    const obj: any = {};

    match &&
      match.forEach((str) => {
        const v = str.match(SPLIT_QUERY_REGEXP);
        v && (obj[v[1]] = v[2]);
      });

    return obj;
  };

  return Object.assign(getQueryObj(matchTarget), getQueryObj(matchQuery));
}

/**
 * merge query字符串返回search字符串（?xxx=xxx&xxx=xxx）
 * @param search
 * @param target
 */
export function queryMergeToStr(search: string, target: string = '') {
  const obj: any = queryMergeToObj(search, target);

  let queryStr = '';
  Object.keys(obj).forEach((key) => {
    queryStr += `${queryStr ? '&' : ''}${key}=${obj[key]}`;
  });

  return queryStr ? '?' + queryStr : '';
}

/**
 * 格式化query
 * @param search
 */
export function queryParse(search?: string): IAnyObject {
  if (search) {
    return query.parse(search);
  } else if (typeof window === 'undefined') {
    return {};
  } else {
    return query.parse(getLocationSearch());
  }
}

/**
 * 获取query值
 * @param key
 */
export function queryString(key?: string): any {
  if (typeof window === 'undefined') return '';

  const queryObj = query.parse(getLocationSearch());
  return key ? queryObj[key] || '' : queryObj;
}

export type Message = {
  message: string;
  description: string;
};

/** 获取国际化之后的指定key的文字 */
export function getMessage(
  // messages: {
  //   [key: string]: Message;
  // },
  messages: Record<string, string | any>,
  key: string
): string {
  return messages[key] ? messages[key].message : '';
}

/** 从数据库获取theme */
export async function getThemeFromDatabase() {
  try {
    let user = await (window as any).sequelize.models.User.findOne({
      attributes: { exclude: ['id'] },
    });
    return user.toJSON();
  } catch (error) {
    return { theme: (window as any).systemTheme || 'system' };
  }
}

/** 设置主题 */
function applyTheme(theme: string) {
  theme = theme !== 'system' ? theme : (window as any).systemTheme;

  if (window.document.body.classList.contains(`${theme}-theme`)) return;

  window.document.body.classList.remove('dark-theme');
  window.document.body.classList.remove('light-theme');
  window.document.body.classList.add(`${theme}-theme`);
}

export { applyTheme };

export function loadImg(url: string, cb?: () => void) {
  if (!url) return;

  let img: any = new Image();

  img.onload = () => {
    img = null;
    cb && cb();
  };

  img.src = url;
}
