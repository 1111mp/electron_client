export interface LoadFileOption {
  hash: string,
  search?: string,
  query?: object
}

/**
 * 获取electron的loadFile方法的options
 * https://electronjs.org/docs/api/web-contents#contentsloadfilefilepath-options
 */
export function getOptions(url: string, search?: IAnyObject): LoadFileOption {
  let searchStr = '';
  if (search) {
    Object.keys(search).forEach(key => {
      searchStr += `${searchStr ? '&' : ''}${key}=${search[key]}`;
    });
  }

  return {
    hash: url,
    search: searchStr
  }
}
