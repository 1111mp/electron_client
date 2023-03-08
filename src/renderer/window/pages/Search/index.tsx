import './styles.scss';

import { Input } from 'antd';

const Search: React.FC = () => {
  return (
    <div className="module-search">
      <p id="window-drag-wrapper"></p>
      <div className="module-search-header">
        <Input.Search
          placeholder="input search text"
          allowClear
          enterButton="Search"
          size="large"
          // onSearch={onSearch}
        />
      </div>
    </div>
  );
};

export default Search;
