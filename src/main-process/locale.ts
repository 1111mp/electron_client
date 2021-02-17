import { join } from 'path';
import { readFileSync } from 'fs';
import { merge } from 'lodash';
import { setup } from '../i18n';

function normalizeLocaleName(locale: string) {
  if (/^en-/.test(locale)) {
    return 'en';
  }

  return locale;
}

function getLocaleMessages(locale: string) {
  const onDiskLocale = locale.replace('-', '_');

  const targetFile = join(
    __dirname,
    '../..',
    '_locales',
    onDiskLocale,
    'messages.json'
  );

  return JSON.parse(readFileSync(targetFile, 'utf-8'));
}

function load({ appLocale }: { appLocale?: string } = {}) {
  if (!appLocale) {
    throw new TypeError('`appLocale` is required');
  }

  const english = getLocaleMessages('en');

  // Load locale - if we can't load messages for the current locale, we
  // default to 'en'
  //
  // possible locales:
  // https://github.com/electron/electron/blob/master/docs/api/locales.md
  let localeName = normalizeLocaleName(appLocale);
  let messages;

  try {
    messages = getLocaleMessages(localeName);

    // We start with english, then overwrite that with anything present in locale
    messages = merge(english, messages);
  } catch (e) {
    console.log(`Problem loading messages for locale ${localeName} ${e.stack}`);
    console.log('Falling back to en locale');

    localeName = 'en';
    messages = english;
  }

  const i18n = setup(appLocale, messages);

  return {
    i18n,
    name: localeName,
    messages,
  };
}

export default load;
