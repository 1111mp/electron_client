import * as React from 'react';

const categories = [
  'recents',
  'emoji',
  'animal',
  'food',
  'activity',
  'travel',
  'object',
  'symbol',
  'flag',
];

type Props = {
  style: React.HTMLProps<'style'>;
};

export const EmojiPicker = React.memo(
  React.forwardRef<HTMLDivElement, Props>(({ style }, ref) => {
    return (
      <div ref={ref} style={style}>
        sss
      </div>
    );
  })
);
