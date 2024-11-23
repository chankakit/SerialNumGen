chrome.action.onClicked.addListener(() => {
    const extensionUrl = chrome.runtime.getURL("index.html");
    chrome.tabs.create({ url: extensionUrl });
  });