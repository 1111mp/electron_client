import * as React from 'react';
import { SkinToneKey } from './lib';

export const EmojiSizes = [16, 18, 20, 24, 28, 32, 48, 64, 66] as const;

export type EmojiSizeType = typeof EmojiSizes[number];

export type OwnProps = {
  inline?: boolean;
  emoji?: string;
  shortName?: string;
  skinTone?: SkinToneKey | number;
  size?: EmojiSizeType;
  children?: React.ReactNode;
};

export type Props = OwnProps &
  Pick<React.HTMLProps<HTMLDivElement>, 'style' | 'className'>;

export const Emoji = React.memo(() => {
  return <div>aaa</div>;
});
