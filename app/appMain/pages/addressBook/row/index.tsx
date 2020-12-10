import './styles.scss';

import React from 'react';

type Props = {
  style: React.CSSProperties;
  row: any;
};

const Row: React.ComponentType<Props> = React.memo(({ style, row }) => {
  if (row.type) {
    return <div style={style}>{row.title}</div>;
  }
  return (
    <div className="module-row" style={style}>
      {row.name}
    </div>
  );
});

export default Row;
