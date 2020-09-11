import './button.styl';

import * as React from 'react';

import { Manager, Popper, Reference } from 'react-popper';
import { EmojiPicker } from './EmojiPicker';

type Props = {};

export const EmojiButton = React.memo(({}: Props) => {
  const [open, setOpen] = React.useState(false);

  const handleClickButton = React.useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <li
            ref={ref}
            className="action-content__emoji"
            onClick={handleClickButton}
          >
            <span className={'iconfont iconemoji'}></span>
          </li>
        )}
      </Reference>
      {open ? (
        <Popper placement="top-start">
          {({ ref, style }) => <EmojiPicker ref={ref} style={style} />}
        </Popper>
      ) : null}
    </Manager>
  );
});
