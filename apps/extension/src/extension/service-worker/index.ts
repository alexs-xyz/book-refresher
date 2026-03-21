import { openReaderPage } from '../runtime/open-reader';

const OPEN_READER_MENU_ID = 'book-refresher:open-reader';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: OPEN_READER_MENU_ID,
    title: 'Open Book Refresher Reader',
    contexts: ['action']
  });
});

chrome.action.onClicked.addListener(async () => {
  await openReaderPage();
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === OPEN_READER_MENU_ID) {
    await openReaderPage();
  }
});
