import './styles.scss';

import { Outlet } from 'react-router-dom';
import { Conversations } from './Conversations';

export function Component() {
  return (
    <div className="module-index_page">
      <div className="module-index_page-sider">
        <Conversations />
      </div>
      <div className="module-index_page-content">
        <Outlet />
      </div>
    </div>
  );
}

Component.displayName = 'IndexPage';
