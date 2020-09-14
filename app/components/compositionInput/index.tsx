import * as React from 'react';
import { Manager, Popper, Reference } from 'react-popper';

import {
  Editor,
  EditorState,
  CompositeDecorator,
  DraftEditorCommand,
  DraftHandleValue,
  ContentState,
  getDefaultKeyBinding,
  Modifier,
  SelectionState,
  EditorChangeType,
} from 'draft-js';
import emojiRegex from 'emoji-regex';
import { Emoji } from '../emoji/Emoji';
import { get, head, trimEnd } from 'lodash';
import { convertShortName, EmojiData, search } from '../emoji/lib';
import { EmojiPickDataType } from '../emoji/EmojiPicker';

const MAX_LENGTH = 64 * 1024;
const colonsRegex = /(?:^|\s):[a-z0-9-_+]+:?/gi;
const triggerEmojiRegex = /^(?:[-+]\d|[a-z]{2})/i;

export type Props = {
  readonly editorRef?: React.RefObject<Editor>;
  readonly startingText?: string;
  readonly skinTone?: EmojiPickDataType['skinTone'];
  onTextTooLong(): unknown;
  onPickEmoji(o: EmojiPickDataType): unknown;
  onSubmit(message: string): unknown;
  getQuotedMessage(): unknown;
  clearQuotedMessage(): unknown;
};

export type CompositionInputEditorCommand =
  | DraftEditorCommand
  | ('enter-emoji' | 'next-emoji' | 'prev-emoji' | 'submit');

function getTrimmedMatchAtIndex(str: string, index: number, pattern: RegExp) {
  let match;

  // Reset regex state
  pattern.exec('');

  // tslint:disable-next-line no-conditional-assignment
  while ((match = pattern.exec(str))) {
    const matchStr = match.toString();
    const start = match.index + (matchStr.length - matchStr.trimLeft().length);
    const end = match.index + matchStr.trimRight().length;

    if (index >= start && index <= end) {
      return match.toString();
    }
  }

  return null;
}

function getLengthOfSelectedText(state: EditorState): number {
  const currentSelection = state.getSelection();
  let length = 0;

  const currentContent = state.getCurrentContent();
  const startKey = currentSelection.getStartKey();
  const endKey = currentSelection.getEndKey();
  const startBlock = currentContent.getBlockForKey(startKey);
  const isStartAndEndBlockAreTheSame = startKey === endKey;
  const startBlockTextLength = startBlock.getLength();
  const startSelectedTextLength =
    startBlockTextLength - currentSelection.getStartOffset();
  const endSelectedTextLength = currentSelection.getEndOffset();
  const keyAfterEnd = currentContent.getKeyAfter(endKey);

  if (isStartAndEndBlockAreTheSame) {
    length +=
      currentSelection.getEndOffset() - currentSelection.getStartOffset();
  } else {
    let currentKey = startKey;

    while (currentKey && currentKey !== keyAfterEnd) {
      if (currentKey === startKey) {
        length += startSelectedTextLength + 1;
      } else if (currentKey === endKey) {
        length += endSelectedTextLength;
      } else {
        length += currentContent.getBlockForKey(currentKey).getLength() + 1;
      }

      currentKey = currentContent.getKeyAfter(currentKey);
    }
  }

  return length;
}

function getWordAtIndex(
  str: string,
  index: number
): { start: number; end: number; word: string } {
  const start = str
    .slice(0, index + 1)
    .replace(/\s+$/, '')
    .search(/\S+$/);

  let end =
    str
      .slice(index)
      .split('')
      .findIndex((c) => /[^a-z0-9-_]/i.test(c) || c === ':') + index;

  const endChar = str[end];

  if (/\w|:/.test(endChar)) {
    end += 1;
  }

  const word = str.slice(start, end);

  if (word === ':' && index + 1 <= str.length) {
    return getWordAtIndex(str, index + 1);
  }

  return {
    start,
    end,
    word,
  };
}

/** 自定义block规则 */
const compositeDecorator = new CompositeDecorator([
  {
    /** type匹配规则 */
    strategy: (block, cb) => {
      const pat = emojiRegex();
      const text = block.getText();
      let match, index;

      while ((match = pat.exec(text))) {
        index = match.index;
        cb(index, index + match[0].length);
      }
    },
    /** 指定component去展示 */
    component: ({
      children,
      contentState,
      entityKey,
    }: {
      children: React.ReactNode;
      contentState: ContentState;
      entityKey: string;
    }) => {
      entityKey ? (
        <Emoji
          shortName={contentState.getEntity(entityKey).getData().shortName}
          skinTone={contentState.getEntity(entityKey).getData().skinTone}
          inline={true}
          size={20}
        >
          {children}
        </Emoji>
      ) : (
        children
      );
    },
  },
]);

/** 获取初始内容 */
const getInitialEditorState = (startingText?: string) => {
  if (!startingText) {
    return EditorState.createEmpty(compositeDecorator);
  }

  const end = startingText.length;
  const state = EditorState.createWithContent(
    ContentState.createFromText(startingText),
    compositeDecorator
  );
  const selection = state.getSelection();
  const selectionAtEnd = selection.merge({
    anchorOffset: end,
    focusOffset: end,
  }) as SelectionState;

  return EditorState.forceSelection(state, selectionAtEnd);
};

export const CompositionInput = React.memo(
  ({
    editorRef,
    onTextTooLong,
    onPickEmoji,
    onSubmit,
    skinTone,
    startingText,
    getQuotedMessage,
    clearQuotedMessage,
  }: Props) => {
    const [editorRenderState, setEditorRenderState] = React.useState(
      getInitialEditorState(startingText)
    );
    const [searchText, setSearchText] = React.useState<string>('');
    const [emojiResults, setEmojiResults] = React.useState<Array<EmojiData>>(
      []
    );
    const [emojiResultsIndex, setEmojiResultsIndex] = React.useState<number>(0);

    const focusRef = React.useRef(false);
    const editorStateRef = React.useRef<EditorState>(editorRenderState);

    const setAndTrackEditorState = React.useCallback(
      (newState: EditorState) => {
        setEditorRenderState(newState);
        editorStateRef.current = newState;
      },
      [setEditorRenderState, editorStateRef]
    );

    const resetEmojiResults = React.useCallback(() => {
      setEmojiResults([]);
      setEmojiResultsIndex(0);
      setSearchText('');
    }, [setEmojiResults, setEmojiResultsIndex, setSearchText]);

    const handleEditorStateChange = React.useCallback(
      (newState: EditorState) => {
        const selection = newState.getSelection();
        const caretLocation = selection.getStartOffset();
        const content = newState
          .getCurrentContent()
          .getBlockForKey(selection.getAnchorKey())
          .getText();
        const match = getTrimmedMatchAtIndex(
          content,
          caretLocation,
          colonsRegex
        );

        const newSearchText = match ? match.trim().substr(1) : '';
        if (newSearchText.endsWith(':')) {
          const bareText = trimEnd(newSearchText, ':');
          const emoji = head(search(bareText));

          if (emoji && bareText === emoji.short_name) {
            handleEditorCommand('enter-emoji', newState, emoji);

            // Prevent inserted colon from persisting to state
            return;
          } else {
            resetEmojiResults();
          }
        } else if (triggerEmojiRegex.test(newSearchText) && focusRef.current) {
          setEmojiResults(search(newSearchText, 10));
          setSearchText(newSearchText);
          setEmojiResultsIndex(0);
        } else {
          resetEmojiResults();
        }

        // 更新editor的state
        setAndTrackEditorState(newState);
      },
      [
        focusRef,
        resetEmojiResults,
        setAndTrackEditorState,
        setSearchText,
        setEmojiResults,
      ]
    );

    const getWordAtCaret = React.useCallback(
      (state = editorStateRef.current) => {
        const selection = state.getSelection();
        const index = selection.getAnchorOffset();

        return getWordAtIndex(
          state
            .getCurrentContent()
            .getBlockForKey(selection.getAnchorKey())
            .getText(),
          index
        );
      },
      []
    );

    const submit = React.useCallback(() => {
      const { current: state } = editorStateRef;
      const trimmedText = state.getCurrentContent().getPlainText().trim();
      onSubmit(trimmedText);
    }, [editorStateRef, onSubmit]);

    const selectEmojiResult = React.useCallback(
      (dir: 'next' | 'prev', e?: React.KeyboardEvent) => {
        if (emojiResults.length > 0) {
          if (e) {
            e.preventDefault();
          }

          if (dir === 'next') {
            setEmojiResultsIndex((index) => {
              const next = index + 1;

              if (next >= emojiResults.length) {
                return 0;
              }

              return next;
            });
          }

          if (dir === 'prev') {
            setEmojiResultsIndex((index) => {
              const next = index - 1;

              if (next < 0) {
                return emojiResults.length - 1;
              }

              return next;
            });
          }
        }
      },
      [emojiResultsIndex, emojiResults]
    );

    const insertEmoji = React.useCallback(
      (e: EmojiPickDataType, replaceWord: boolean = false) => {
        const { current: state } = editorStateRef;
        const selection = state.getSelection();
        const oldContent = state.getCurrentContent();
        const emojiContent = convertShortName(e.shortName, e.skinTone);
        const emojiEntityKey = oldContent
          .createEntity('emoji', 'IMMUTABLE', {
            shortName: e.shortName,
            skinTone: e.skinTone,
          })
          .getLastCreatedEntityKey();
        const word = getWordAtCaret();

        let newContent = Modifier.replaceText(
          oldContent,
          replaceWord
            ? (selection.merge({
                anchorOffset: word.start,
                focusOffset: word.end,
              }) as SelectionState)
            : selection,
          emojiContent,
          undefined,
          emojiEntityKey
        );

        const afterSelection = newContent.getSelectionAfter();

        if (
          afterSelection.getAnchorOffset() ===
          newContent.getBlockForKey(afterSelection.getAnchorKey()).getLength()
        ) {
          newContent = Modifier.insertText(newContent, afterSelection, ' ');
        }

        const newState = EditorState.push(
          state,
          newContent,
          'insert-emoji' as EditorChangeType
        );

        setAndTrackEditorState(newState);
        resetEmojiResults();
      },
      [editorStateRef, setAndTrackEditorState, resetEmojiResults]
    );

    const handleBeforeInput = React.useCallback((): DraftHandleValue => {
      if (!editorStateRef.current) {
        return 'not-handled';
      }

      const editorState = editorStateRef.current;
      const plainText = editorState.getCurrentContent().getPlainText();
      const selectedTextLength = getLengthOfSelectedText(editorState);

      if (plainText.length - selectedTextLength > MAX_LENGTH - 1) {
        onTextTooLong();

        return 'handled';
      }

      return 'not-handled';
    }, [onTextTooLong, editorStateRef]);

    const handlePastedText = React.useCallback(
      (pastedText: string): DraftHandleValue => {
        if (!editorStateRef.current) {
          return 'not-handled';
        }

        const editorState = editorStateRef.current;
        const plainText = editorState.getCurrentContent().getPlainText();
        const selectedTextLength = getLengthOfSelectedText(editorState);

        if (
          plainText.length + pastedText.length - selectedTextLength >
          MAX_LENGTH
        ) {
          onTextTooLong();

          return 'handled';
        }

        return 'not-handled';
      },
      [onTextTooLong, editorStateRef]
    );

    const handleEditorCommand = React.useCallback(
      (
        command: CompositionInputEditorCommand,
        state: EditorState,
        emojiOverride?: EmojiData
      ): DraftHandleValue => {
        if (command === 'enter-emoji') {
          const { short_name: shortName } =
            emojiOverride || emojiResults[emojiResultsIndex];

          const content = state.getCurrentContent();
          const selection = state.getSelection();
          const word = getWordAtCaret(state);
          const emojiContent = convertShortName(shortName, skinTone);
          const emojiEntityKey = content
            .createEntity('emoji', 'IMMUTABLE', {
              shortName,
              skinTone,
            })
            .getLastCreatedEntityKey();

          const replaceSelection = selection.merge({
            anchorOffset: word.start,
            focusOffset: word.end,
          });

          let newContent = Modifier.replaceText(
            content,
            replaceSelection as SelectionState,
            emojiContent,
            undefined,
            emojiEntityKey
          );

          const afterSelection = newContent.getSelectionAfter();

          if (
            afterSelection.getAnchorOffset() ===
            newContent.getBlockForKey(afterSelection.getAnchorKey()).getLength()
          ) {
            newContent = Modifier.insertText(newContent, afterSelection, ' ');
          }

          const newState = EditorState.push(
            state,
            newContent,
            'insert-emoji' as EditorChangeType
          );
          setAndTrackEditorState(newState);
          resetEmojiResults();
          onPickEmoji({ shortName });

          return 'handled';
        }

        if (command === 'submit') {
          submit();

          return 'handled';
        }

        if (command === 'next-emoji') {
          selectEmojiResult('next');
        }

        if (command === 'prev-emoji') {
          selectEmojiResult('prev');
        }

        return 'not-handled';
      },
      [
        emojiResults,
        emojiResultsIndex,
        resetEmojiResults,
        selectEmojiResult,
        setAndTrackEditorState,
        skinTone,
        submit,
      ]
    );

    const handleEditorArrowKey = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
          selectEmojiResult('prev', e);
        }

        if (e.key === 'ArrowDown') {
          selectEmojiResult('next', e);
        }
      },
      [selectEmojiResult]
    );

    const handleEscapeKey = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (emojiResults.length > 0) {
          e.preventDefault();
          resetEmojiResults();
        } else if (getQuotedMessage()) {
          clearQuotedMessage();
        }
      },
      [resetEmojiResults, emojiResults]
    );

    const onTab = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.shiftKey || emojiResults.length === 0) {
          return;
        }

        e.preventDefault();
        handleEditorCommand('enter-emoji', editorStateRef.current);
      },
      [emojiResults, editorStateRef, handleEditorCommand, resetEmojiResults]
    );

    const editorKeybindingFn = React.useCallback(
      // tslint:disable-next-line cyclomatic-complexity
      (e: React.KeyboardEvent): CompositionInputEditorCommand | null => {
        const commandKey = get(window, 'platform') === 'darwin' && e.metaKey;
        const controlKey = get(window, 'platform') !== 'darwin' && e.ctrlKey;

        if (e.key === 'Enter' && emojiResults.length > 0) {
          e.preventDefault();

          return 'enter-emoji';
        }

        if (e.key === 'Enter' && !e.shiftKey) {
          if (/** large &&  */ !(controlKey || commandKey)) {
            return getDefaultKeyBinding(e);
          }

          e.preventDefault();

          return 'submit';
        }

        if (e.key === 'n' && e.ctrlKey) {
          e.preventDefault();

          return 'next-emoji';
        }

        if (e.key === 'p' && e.ctrlKey) {
          e.preventDefault();

          return 'prev-emoji';
        }

        // Get rid of default draft.js ctrl-m binding which interferes with Windows minimize
        if (e.key === 'm' && e.ctrlKey) {
          return null;
        }

        if (get(window, 'platform') === 'linux') {
          // Get rid of default draft.js shift-del binding which interferes with Linux cut
          if (e.key === 'Delete' && e.shiftKey) {
            return null;
          }
        }

        // Get rid of Ctrl-Shift-M, which by default adds a newline
        if ((e.key === 'm' || e.key === 'M') && e.shiftKey && e.ctrlKey) {
          e.preventDefault();

          return null;
        }

        // Get rid of Ctrl-/, which on GNOME is bound to 'select all'
        if (e.key === '/' && !e.shiftKey && e.ctrlKey) {
          e.preventDefault();

          return null;
        }

        return getDefaultKeyBinding(e);
      },
      [emojiResults /** large */]
    );

    return (
      <div>
        <Editor
          ref={editorRef}
          editorState={editorRenderState}
          onChange={handleEditorStateChange}
          placeholder="send message"
          onUpArrow={handleEditorArrowKey}
          onDownArrow={handleEditorArrowKey}
          onEscape={handleEscapeKey}
          onTab={onTab}
          handleKeyCommand={handleEditorCommand}
          handleBeforeInput={handleBeforeInput}
          handlePastedText={handlePastedText}
          keyBindingFn={editorKeybindingFn}
          spellCheck={true}
          stripPastedStyles={true}
        />
      </div>
    );
  }
);
