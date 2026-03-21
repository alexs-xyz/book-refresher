export async function openReaderPage() {
  const url = chrome.runtime.getURL('reader.html');
  await chrome.tabs.create({ url });
}
