import untypedData from 'emoji-datasource';
import emojiRegex from 'emoji-regex';
import {
  compact,
  flatMap,
  get,
  groupBy,
  isNumber,
  keyBy,
  map,
  mapValues,
  sortBy,
  take,
} from 'lodash';
import Fuse from 'fuse.js';
import is from '@sindresorhus/is';
import { getOwn } from 'components/quill/getOwn';

export const skinTones = ['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF'];

export type SkinToneKey = '1F3FB' | '1F3FC' | '1F3FD' | '1F3FE' | '1F3FF';
export type SizeClassType = '' | 'small' | 'medium' | 'large' | 'jumbo';

export type EmojiSkinVariation = {
  unified: string;
  non_qualified: null;
  image: string;
  sheet_x: number;
  sheet_y: number;
  added_in: string;
  has_img_apple: boolean;
  has_img_google: boolean;
  has_img_twitter: boolean;
  has_img_emojione: boolean;
  has_img_facebook: boolean;
  has_img_messenger: boolean;
};

export type EmojiData = {
  name: string;
  unified: string;
  non_qualified: string | null;
  docomo: string | null;
  au: string | null;
  softbank: string | null;
  google: string | null;
  image: string;
  sheet_x: number;
  sheet_y: number;
  short_name: string;
  short_names: Array<string>;
  text: string | null;
  texts: Array<string> | null;
  category: string;
  sort_order: number;
  added_in: string;
  has_img_apple: boolean;
  has_img_google: boolean;
  has_img_twitter: boolean;
  has_img_emojione: boolean;
  has_img_facebook: boolean;
  has_img_messenger: boolean;
  skin_variations?: {
    [key: string]: EmojiSkinVariation;
  };
};

const data = (untypedData as Array<EmojiData>)
  .filter((emoji) => emoji.has_img_apple)
  .map((emoji) =>
    // Why this weird map?
    // the emoji dataset has two separate categories for Emotions and People
    // yet in our UI we display these as a single merged category. In order
    // for the emojis to be sorted properly we're manually incrementing the
    // sort_order for the People & Body emojis so that they fall below the
    // Smiley & Emotions category.
    emoji.category === 'People & Body'
      ? { ...emoji, sort_order: emoji.sort_order + 1000 }
      : emoji
  );

const dataByShortName = keyBy(data, 'short_name');

const imageByEmoji: { [key: string]: string } = {};

const ROOT_PATH = get(
  // tslint:disable-next-line no-typeof-undefined
  typeof window !== 'undefined' ? window : null,
  'ROOT_PATH',
  ''
);

const makeImagePath = (src: string) => {
  return `${ROOT_PATH}node_modules/emoji-datasource-apple/img/apple/64/${src}`;
};

const dataByEmoji: { [key: string]: EmojiData } = {};

export function getEmojiData(
  shortName: keyof typeof dataByShortName,
  skinTone?: SkinToneKey | number
): EmojiData | EmojiSkinVariation {
  const base = dataByShortName[shortName];

  if (skinTone && base.skin_variations) {
    const variation = isNumber(skinTone) ? skinTones[skinTone - 1] : skinTone;

    if (base.skin_variations[variation]) {
      return base.skin_variations[variation];
    }

    // For emojis that have two people in them which can have diff skin tones
    // the Map is of SkinTone-SkinTone. If we don't find the correct skin tone
    // in the list of variations then we assume it is one of those double skin
    // emojis and we default to both people having same skin.
    return base.skin_variations[`${variation}-${variation}`];
  }

  return base;
}

export function getImagePath(
  shortName: keyof typeof dataByShortName,
  skinTone?: SkinToneKey | number
): string {
  const emojiData = getEmojiData(shortName, skinTone);

  return makeImagePath(emojiData.image);
}

const fuse = new Fuse(data, {
  shouldSort: true,
  threshold: 0.2,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  tokenize: true,
  tokenSeparator: /[-_\s]+/,
  keys: ['name', 'short_name', 'short_names'],
});

export function search(query: string, count = 0): Array<EmojiData> {
  const results = fuse.search(query.substr(0, 32));

  if (count) {
    return take(results, count);
  }

  return results;
}

const shortNames = new Set([
  ...map(data, 'short_name'),
  ...compact<string>(flatMap(data, 'short_names')),
]);

export function isShortName(name: string): boolean {
  return shortNames.has(name);
}

export function unifiedToEmoji(unified: string): string {
  return unified
    .split('-')
    .map((c) => String.fromCodePoint(parseInt(c, 16)))
    .join('');
}

export function convertShortNameToData(
  shortName: string,
  skinTone: number | SkinToneKey = 0
): EmojiData | undefined {
  const base = dataByShortName[shortName];

  if (!base) {
    return undefined;
  }

  const toneKey = is.number(skinTone) ? skinTones[skinTone - 1] : skinTone;

  if (skinTone && base.skin_variations) {
    const variation = base.skin_variations[toneKey];
    if (variation) {
      return {
        ...base,
        ...variation,
      };
    }
  }

  return base;
}

export function convertShortName(
  shortName: string,
  skinTone: number | SkinToneKey = 0
): string {
  const emojiData = convertShortNameToData(shortName, skinTone);

  if (!emojiData) {
    return '';
  }

  return unifiedToEmoji(emojiData.unified);
}

export function emojiToImage(emoji: string): string | undefined {
  return getOwn(imageByEmoji, emoji);
}

export function emojiToData(emoji: string): EmojiData | undefined {
  return getOwn(dataByEmoji, emoji);
}

export const dataByCategory = mapValues(
  groupBy(data, ({ category }) => {
    if (category === 'Activities') {
      return 'activity';
    }

    if (category === 'Animals & Nature') {
      return 'animal';
    }

    if (category === 'Flags') {
      return 'flag';
    }

    if (category === 'Food & Drink') {
      return 'food';
    }

    if (category === 'Objects') {
      return 'object';
    }

    if (category === 'Travel & Places') {
      return 'travel';
    }

    if (category === 'Smileys & Emotion') {
      return 'emoji';
    }

    if (category === 'People & Body') {
      return 'emoji';
    }

    if (category === 'Symbols') {
      return 'symbol';
    }

    return 'misc';
  }),
  (arr) => sortBy(arr, 'sort_order')
);

function getCountOfAllMatches(str: string, regex: RegExp) {
  let match = regex.exec(str);
  let count = 0;

  if (!regex.global) {
    return match ? 1 : 0;
  }

  while (match) {
    count += 1;
    match = regex.exec(str);
  }

  return count;
}

export function getSizeClass(str: string): SizeClassType {
  // Do we have non-emoji characters?
  if (str.replace(emojiRegex(), '').trim().length > 0) {
    return '';
  }

  const emojiCount = getCountOfAllMatches(str, emojiRegex());

  if (emojiCount > 8) {
    return '';
  }
  if (emojiCount > 6) {
    return 'small';
  }
  if (emojiCount > 4) {
    return 'medium';
  }
  if (emojiCount > 2) {
    return 'large';
  }
  return 'jumbo';
}

data.forEach((emoji) => {
  const { short_name, short_names, skin_variations, image } = emoji;

  if (short_names) {
    short_names.forEach((name) => {
      dataByShortName[name] = emoji;
    });
  }

  imageByEmoji[convertShortName(short_name)] = makeImagePath(image);
  dataByEmoji[convertShortName(short_name)] = emoji;

  if (skin_variations) {
    Object.entries(skin_variations).forEach(([tone, variation]) => {
      imageByEmoji[
        convertShortName(short_name, tone as SkinToneKey)
      ] = makeImagePath(variation.image);
      dataByEmoji[convertShortName(short_name, tone as SkinToneKey)] = emoji;
    });
  }
});
