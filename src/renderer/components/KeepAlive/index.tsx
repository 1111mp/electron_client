import { memo, useRef } from 'react';

interface Props {
  activeName: string;
  children?: React.ReactNode;
}

function KeepAliveOutlet({ activeName, children }: Props) {
  const cache = useRef<Record<string, React.ReactNode>>({});

  if (
    activeName &&
    ['/index', '/addressbook'].includes(activeName) &&
    cache.current[activeName] === void 0
  ) {
    cache.current[activeName] = children;
  }

  return (
    <>
      {Object.entries(cache.current).map(([name, ele]) => (
        <div
          key={name}
          style={{ display: name === activeName ? 'block' : 'none' }}
        >
          {ele}
        </div>
      ))}
    </>
  );
}
export default memo(KeepAliveOutlet);
