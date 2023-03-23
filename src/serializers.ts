import {DELAY_MOCK_KEY, ENABLE_MOCK_SYSTEM_KEY, MOCK_PREFIX} from './constants';
import {getLocalStorageKeyValue, makeDelayPromise} from './utils';

const COPY_PASTE_DELAY = 2000; // 2 seconds to switch focus on document

const isKeyFromMockSystem = (key: string) =>
  [ENABLE_MOCK_SYSTEM_KEY, MOCK_PREFIX, DELAY_MOCK_KEY].some(x => key.startsWith(x));

export const snapshot = (copyToClipboard = false): string | undefined => {
  const keyValuePairs: {key: string; value: string}[] = [];

  for (const [key, value] of getLocalStorageKeyValue()) {
    if (!isKeyFromMockSystem(key)) {
      continue;
    }
    keyValuePairs.push({key, value});
  }

  const result = encodeURIComponent(JSON.stringify(keyValuePairs));
  if (copyToClipboard) {
    makeDelayPromise(COPY_PASTE_DELAY, null)
      .then(() => copyText(result))
      .then(() => console.log('Mocks have been copied to buffer'));

    return;
  }

  return result;
};

export const applySnapshot = async (value: string | true): Promise<void> => {
  try {
    let keyValuePairs;
    if (value === true) {
      await makeDelayPromise(COPY_PASTE_DELAY, null);
      const text = await readText();
      if (!text) {
        throw new Error('Content from buffer have not been read');
      }
      keyValuePairs = JSON.parse(decodeURIComponent(text));
      console.log('Mocks have been successfully parsed');
    } else {
      keyValuePairs = await Promise.resolve(JSON.parse(decodeURIComponent(value)));
    }

    for (const {key, value} of keyValuePairs) {
      if (!isKeyFromMockSystem(key)) {
        throw new Error(`Keys except ${MOCK_PREFIX}, ${DELAY_MOCK_KEY} and ${ENABLE_MOCK_SYSTEM_KEY} are unacceptable`);
      }
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.error('Serialization failed');
    throw e;
  }
};

const copyText = async (text: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  document.querySelector('div').focus();
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.log('Did not manage to copy serialized content');
  }
};

const readText = async (): Promise<string | undefined> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  document.querySelector('div').focus();
  try {
    return await navigator.clipboard.readText();
  } catch (e) {
    console.log('Did not manage to read serialized content');
  }
  return;
};
