import Quill from 'quill';
import Delta from 'quill-delta';
import { debounce } from 'lodash';

import {
  EmojiData,
  search,
  convertShortName,
  isShortName,
  convertShortNameToData,
} from 'Components/EmojiWidgets/lib';
import { Emoji } from 'Components/EmojiWidgets/Emoji';
import { EmojiPickDataType } from 'Components/EmojiWidgets/EmojiPicker';
import { getBlotTextPartitions, matchBlotTextPartitions } from '../utils';

interface EmojiPickerOptions {
  onPickEmoji: (emoji: EmojiPickDataType) => void;
  setEmojiPickerElement: (element: JSX.Element | null) => void;
  skinTone: number;
}

const Keyboard = Quill.import('modules/keyboard');

export class EmojiCompletion {
  results: Array<EmojiData>;

  index: number;

  options: EmojiPickerOptions;

  quill: Quill;

  constructor(quill: Quill, options: EmojiPickerOptions) {
    this.results = [];
    this.index = 0;
    this.options = options;
    this.quill = quill;

    const clearResults = () => {
      if (this.results.length) {
        this.reset();
      }

      return true;
    };

    const changeIndex = (by: number) => (): boolean => {
      if (this.results.length) {
        this.changeIndex(by);
        return false;
      }

      return true;
    };

    this.quill.keyboard.addBinding({ key: Keyboard.keys.LEFT }, clearResults); // 37 = Left
    this.quill.keyboard.addBinding({ key: Keyboard.keys.UP }, changeIndex(-1)); // 38 = Up
    this.quill.keyboard.addBinding({ key: Keyboard.keys.RIGHT }, clearResults); // 39 = Right
    this.quill.keyboard.addBinding({ key: Keyboard.keys.DOWN }, changeIndex(1)); // 40 = Down
    this.quill.keyboard.addBinding(
      {
        // 186 + Shift = Colon
        key: 186,
        shiftKey: true,
      },
      () => this.onTextChange(true)
    );
    this.quill.keyboard.addBinding(
      {
        // 58 = Also Colon
        key: 58,
      },
      () => this.onTextChange(true)
    );

    this.quill.on(
      'text-change',
      debounce(() => this.onTextChange(), 100)
    );
    this.quill.on('selection-change', this.onSelectionChange.bind(this));
  }

  changeIndex(by: number) {
    // debugger
    this.index = (this.index + by + this.results.length) % this.results.length;
    this.render();
  }

  getCurrentLeafTextPartitions(): [string, string] {
    const range = this.quill.getSelection();
    const [blot, index] = this.quill.getLeaf(range ? range.index : -1);

    return getBlotTextPartitions(blot, index);
  }

  onSelectionChange() {
    // Selection should never change while we're editing an emoji
    this.reset();
  }

  onTextChange(justPressedColon = false): boolean {
    const PASS_THROUGH = true;
    const INTERCEPT = false;

    const range = this.quill.getSelection();

    if (!range) return PASS_THROUGH;

    const [blot, index] = this.quill.getLeaf(range.index);
    const [leftTokenTextMatch, rightTokenTextMatch] = matchBlotTextPartitions(
      blot,
      index,
      /(?<=^|\s):([-+0-9a-zA-Z_]*)(:?)$/,
      /^([-+0-9a-zA-Z_]*):/
    );

    if (leftTokenTextMatch) {
      const [, leftTokenText, isSelfClosing] = leftTokenTextMatch;

      if (isSelfClosing || justPressedColon) {
        if (isShortName(leftTokenText)) {
          const emojiData = convertShortNameToData(
            leftTokenText,
            this.options.skinTone
          );

          const numberOfColons = isSelfClosing ? 2 : 1;

          if (emojiData) {
            this.insertEmoji(
              emojiData,
              range.index - leftTokenText.length - numberOfColons,
              leftTokenText.length + numberOfColons
            );
            return INTERCEPT;
          }
        } else {
          this.reset();
          return PASS_THROUGH;
        }
      }

      if (rightTokenTextMatch) {
        const [, rightTokenText] = rightTokenTextMatch;
        const tokenText = leftTokenText + rightTokenText;

        if (isShortName(tokenText)) {
          const emojiData = convertShortNameToData(
            tokenText,
            this.options.skinTone
          );

          if (emojiData) {
            this.insertEmoji(
              emojiData,
              range.index - leftTokenText.length - 1,
              tokenText.length + 2
            );
            return INTERCEPT;
          }
        }
      }

      if (leftTokenText.length < 2) {
        this.reset();
        return PASS_THROUGH;
      }

      const showEmojiResults = search(leftTokenText, 10);

      if (showEmojiResults.length > 0) {
        this.results = showEmojiResults;
        this.render();
      } else if (this.results.length !== 0) {
        this.reset();
      }
    } else if (this.results.length !== 0) {
      this.reset();
    }

    return PASS_THROUGH;
  }

  completeEmoji() {
    const range = this.quill.getSelection();

    if (range === null) return;

    const emoji = this.results[this.index];
    const [leafText] = this.getCurrentLeafTextPartitions();

    const tokenTextMatch = /:([-+0-9a-z_]*)(:?)$/.exec(leafText);

    if (tokenTextMatch === null) return;

    const [, tokenText] = tokenTextMatch;

    this.insertEmoji(
      emoji,
      range.index - tokenText.length - 1,
      tokenText.length + 1,
      true
    );
  }

  insertEmoji(
    emojiData: EmojiData,
    index: number,
    range: number,
    withTrailingSpace = false
  ) {
    const emoji = convertShortName(emojiData.short_name, this.options.skinTone);

    const delta = new Delta().retain(index).delete(range).insert({ emoji });

    if (withTrailingSpace) {
      this.quill.updateContents(delta.insert(' '), 'user');
      this.quill.setSelection(index + 2, 0, 'user');
    } else {
      this.quill.updateContents(delta, 'user');
      this.quill.setSelection(index + 1, 0, 'user');
    }

    this.options.onPickEmoji &&
      this.options.onPickEmoji({
        shortName: emojiData.short_name,
        skinTone: this.options.skinTone,
      });

    this.reset();
  }

  reset() {
    if (this.results.length) {
      this.results = [];
      this.index = 0;

      this.render();
    }
  }

  render() {
    const { results: emojiResults, index: emojiResultsIndex } = this;

    if (emojiResults.length === 0) {
      this.options.setEmojiPickerElement(null);
      return;
    }

    const element = (
      <div
        className="module-composition-input__suggestions"
        role="listbox"
        aria-expanded
        aria-activedescendant={`emoji-result--${
          emojiResults.length ? emojiResults[emojiResultsIndex].short_name : ''
        }`}
        tabIndex={0}
      >
        {emojiResults.map((emoji, index) => (
          <button
            type="button"
            key={emoji.short_name}
            id={`emoji-result--${emoji.short_name}`}
            role="option button"
            aria-selected={emojiResultsIndex === index}
            onClick={() => {
              this.index = index;
              this.completeEmoji();
            }}
            className={
              'module-composition-input__suggestions__row' +
              (emojiResultsIndex === index
                ? ' module-composition-input__suggestions__row--selected'
                : '')
            }
          >
            <Emoji
              shortName={emoji.short_name}
              size={16}
              skinTone={this.options.skinTone}
            />
            <div className="module-composition-input__suggestions__row__short-name">
              :{emoji.short_name}:
            </div>
          </button>
        ))}
      </div>
    );

    this.options.setEmojiPickerElement(element);
  }
}
