import './styles.scss';

import * as React from 'react';

// import DropEmitter from 'components/dropEmitter';
import { EmojiButton } from 'components/emoji/EmojiButton';
import { CompositionInput } from 'app/components/compositionInput';
import { EmojiPickDataType } from 'app/components/emoji/EmojiPicker';
import { Editor } from 'draft-js';

type Props = {};

/** https://juejin.im/post/6844904112882974728#heading-10 */
export const Transmitter = React.memo(() => {
  const editorRef = React.useRef<Editor>(null);
  // const inputApiRef = React.useRef<InputApi | undefined>();

  const insertEmoji = React.useCallback(
    (e: EmojiPickDataType) => {
      // if (inputApiRef.current) {
      //   inputApiRef.current.insertEmoji(e);
      //   // onPickEmoji(e);
      // }
    },
    []
  );

  return (
    <div className="module-transmitter">
      <ul className="module-transmitter-actions">
        <EmojiButton onPickEmoji={insertEmoji} />
        <li className="module-transmitter-actions-content">
          <span className="iconfont iconwenjian"></span>
        </li>
      </ul>
      <div className="module-transmitter-textarea">
        <CompositionInput
          // editorRef={editorRef}
          // inputApi={inputApiRef}
          // startingText={''}
          // onPickEmoji={onPickEmoji}
        />
      </div>
    </div>
  );
});
