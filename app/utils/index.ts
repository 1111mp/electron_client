/**
 * 将当前访问的search附加至传入的url上
 */
export function addUrlQuery(url: string, query?: IAnyObject) {
  let queryStr = '';
  if (query) {
    Object.keys(query).forEach(key => {
      queryStr += `${queryStr ? '&' : ''}${key}=${query[key]}`;
    });
  }

  const hashReg = /#/;
  const addHandler = () => {
    if (hashReg.test(url)) {
      return url.replace(hashReg, `${/\?/.test(url) ? '&' : '?'}${queryStr.substr(1, queryStr.length)}#`);
    } else {
      return /\?/.test(url) ? `${url}&${queryStr.substr(1, queryStr.length)}` : url + queryStr;
    }
  };

  queryStr = queryStr ? '?' + queryStr : '';
  return queryStr ? addHandler() : url;
}
