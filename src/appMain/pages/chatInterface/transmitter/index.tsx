import './styles.scss';

import * as React from 'react';

// import DropEmitter from 'components/dropEmitter';
import { EmojiButton } from 'components/emoji/EmojiButton';
import { InputApi, CompositionInput } from 'components/compositionInput';
import { Props as EmojiButtonProps } from 'components/emoji/EmojiButton';
import { EmojiPickDataType } from 'components/emoji/EmojiPicker';
// import { Editor } from 'draft-js';

type Props = Pick<EmojiButtonProps, 'onPickEmoji'>;

/** https://juejin.im/post/6844904112882974728#heading-10 */
export const Transmitter: React.ComponentType<Props> = React.memo(
  ({ onPickEmoji }) => {
    // const editorRef = React.useRef<Editor>(null);
    const inputApiRef = React.useRef<InputApi | undefined>();

    const focusInput = React.useCallback(() => {
      if (inputApiRef.current) {
        inputApiRef.current.focus();
      }
    }, [inputApiRef]);

    const insertEmoji = React.useCallback(
      (e: EmojiPickDataType) => {
        if (inputApiRef.current) {
          inputApiRef.current.insertEmoji(e);
          // onPickEmoji(e);
        }
      },
      [inputApiRef, onPickEmoji]
    );

    React.useEffect(() => {
      focusInput();
    }, [focusInput]);

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
            inputApi={inputApiRef}
            // draftText={draftText}
            // draftBodyRanges={draftBodyRanges}
            // startingText={''}
            onPickEmoji={onPickEmoji}
          />
        </div>
      </div>
    );
  }
);
