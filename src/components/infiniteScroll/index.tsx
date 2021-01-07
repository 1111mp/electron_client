import * as React from 'react';

import ReactIScroll from 'react-iscroll';
import iScroll from 'iscroll/build/iscroll-probe';

type Props = {
  loadMore?: VoidFunction;
  children: React.ReactNode;
  options: IScrollOptions;
  threshold?: number;
};

export const InfiniteScroll = React.memo(
  ({ loadMore, children, options, threshold = 75 }: Props) => {
    const scrollEndHandler = React.useCallback((iScrollInstance: any) => {
      const { y } = iScrollInstance;
      if (y > threshold) {
        loadMore && loadMore();
      }
    }, []);

    return (
      <ReactIScroll options={{ ...options }} onScrollEnd={scrollEndHandler}>
        {children}
      </ReactIScroll>
    );
  }
);
