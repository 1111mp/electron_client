import { createRef } from 'react';
import classNames from 'classnames';
import Quill, { DeltaStatic } from 'quill';
import Delta from 'quill-delta';
import { Avatar } from 'antd';
import { debounce } from 'lodash';
import { MemberRepository } from '../memberRepository';
import { matchBlotTextPartitions } from '../utils';

export interface MentionCompletionOptions {
  // i18n: LocalizerType;
  memberRepositoryRef: React.RefObject<MemberRepository>;
  setMentionPickerElement: (element: JSX.Element | null) => void;
  me?: DB.UserWithFriendSetting;
}

declare global {
  interface HTMLElement {
    // Webkit-specific
    scrollIntoViewIfNeeded: (bringToCenter: boolean) => void;
  }
}

const Keyboard = Quill.import('modules/keyboard');
const MENTION_REGEX = /(?:^|\W)@([-+\w]*)$/;

export class MentionCompletion {
  results: Array<DB.UserWithFriendSetting>;

  index: number;

  quill: Quill;

  options: MentionCompletionOptions;

  suggestionListRef: React.RefObject<HTMLDivElement>;

  constructor(quill: Quill, options: MentionCompletionOptions) {
    this.results = [];
    this.index = 0;
    this.options = options;
    this.quill = quill;
    this.suggestionListRef = createRef<HTMLDivElement>();

    const clearResults = () => {
      if (this.results.length) {
        this.clearResults();
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

    this.quill.keyboard.addBinding({ key: Keyboard.keys.LEFT }, clearResults); // Left Arrow
    this.quill.keyboard.addBinding({ key: Keyboard.keys.UP }, changeIndex(-1)); // Up Arrow
    this.quill.keyboard.addBinding({ key: Keyboard.keys.RIGHT }, clearResults); // Right Arrow
    this.quill.keyboard.addBinding({ key: Keyboard.keys.DOWN }, changeIndex(1)); // Down Arrow

    this.quill.on('text-change', debounce(this.onTextChange.bind(this), 0));
    this.quill.on('selection-change', this.onSelectionChange.bind(this));
  }

  changeIndex(by: number): void {
    this.index = (this.index + by + this.results.length) % this.results.length;
    this.render();
    const suggestionList = this.suggestionListRef.current;
    if (suggestionList) {
      const selectedElement = suggestionList.querySelector<HTMLElement>(
        '[aria-selected="true"]'
      );
      if (selectedElement) {
        selectedElement.scrollIntoViewIfNeeded(false);
      }
    }
  }

  onSelectionChange() {
    // Selection should never change while we're editing a mention
    this.clearResults();
  }

  possiblyShowMemberResults(): Array<DB.UserWithFriendSetting> {
    const range = this.quill.getSelection();

    if (range) {
      const [blot, index] = this.quill.getLeaf(range.index);

      const [leftTokenTextMatch] = matchBlotTextPartitions(
        blot,
        index,
        MENTION_REGEX
      );

      if (leftTokenTextMatch) {
        const [, leftTokenText] = leftTokenTextMatch;

        let results: Array<DB.UserWithFriendSetting> = [];

        const memberRepository = this.options.memberRepositoryRef.current;

        if (memberRepository) {
          if (leftTokenText === '') {
            results = memberRepository.getMembers(this.options.me);
          } else {
            const fullMentionText = leftTokenText;
            results = memberRepository.search(fullMentionText, this.options.me);
          }
        }

        return results;
      }
    }

    return [];
  }

  onTextChange() {
    const showMemberResults = this.possiblyShowMemberResults();

    if (showMemberResults.length > 0) {
      this.results = showMemberResults;
      this.index = 0;
      this.render();
    } else if (this.results.length !== 0) {
      this.clearResults();
    }
  }

  completeMention(resultIndexArg?: number) {
    const resultIndex = resultIndexArg || this.index;

    const range = this.quill.getSelection();

    if (range === null) return;

    const member = this.results[resultIndex];

    const [blot, index] = this.quill.getLeaf(range.index);

    const [leftTokenTextMatch] = matchBlotTextPartitions(
      blot,
      index,
      MENTION_REGEX
    );

    if (leftTokenTextMatch) {
      const [, leftTokenText] = leftTokenTextMatch;

      this.insertMention(
        member,
        range.index - leftTokenText.length - 1,
        leftTokenText.length + 1,
        true
      );
    }
  }

  insertMention(
    mention: DB.UserWithFriendSetting,
    index: number,
    range: number,
    withTrailingSpace = false
  ) {
    const delta = new Delta()
      .retain(index)
      .delete(range)
      .insert({
        mention: {
          id: mention.id,
          title: mention.remark ? mention.remark : mention.account,
        },
      }) as unknown as DeltaStatic;

    if (withTrailingSpace) {
      this.quill.updateContents(delta.insert(' '), 'user');
      this.quill.setSelection(index + 2, 0, 'user');
    } else {
      this.quill.updateContents(delta, 'user');
      this.quill.setSelection(index + 1, 0, 'user');
    }

    this.clearResults();
  }

  clearResults() {
    this.results = [];
    this.index = 0;

    this.render();
  }

  render() {
    // this.options.setMentionPickerElement(this.results.length ? true : null);
    // return;
    const { results: memberResults, index: memberResultsIndex } = this;

    if (!memberResults.length) {
      this.options.setMentionPickerElement(null);
      return;
    }

    const element = (
      <div
        className="module-composition-input__suggestions"
        role="listbox"
        aria-expanded
        aria-activedescendant={`mention-result--${
          memberResults.length ? memberResults[memberResultsIndex].account : ''
        }`}
        tabIndex={0}
      >
        <div
          ref={this.suggestionListRef}
          className="module-composition-input__suggestions--scroller"
        >
          {memberResults.map((member, index) => {
            const title = member.remark ? member.remark : member.account;
            return (
              <button
                type="button"
                key={member.id}
                id={`mention-result--${title}`}
                role="option button"
                aria-selected={memberResultsIndex === index}
                onClick={() => {
                  this.completeMention(index);
                }}
                className={classNames(
                  'module-composition-input__suggestions__row',
                  'module-composition-input__suggestions__row--mention',
                  memberResultsIndex === index
                    ? 'module-composition-input__suggestions__row--selected'
                    : null
                )}
              >
                <Avatar
                  src={member.avatar}
                  shape="circle"
                  // i18n={this.options.i18n}
                  size={28}
                  alt={title}
                />
                <div className="module-composition-input__suggestions__title">
                  {title}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );

    this.options.setMentionPickerElement(element);
  }
}
