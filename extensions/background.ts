// popup on show
// content script get the package.json or the package.json url
// send to background
// background get the package.json or fetch the package.json by the url

import mem from "mem"
import advancedFetch, { advancedFetchText } from "../shared/advancedFetch"

/**
 * 1. activate a tab => resetIcon
 * 2. remove a tab => removeStore resetIcon
 * 3. udpate a tab => resetIcon
 * 4. receive pdj query => addStore resetIcon
 */

let currentActiveInfo: chrome.tabs.TabActiveInfo | null = null

// cache by tabid and url and then remove tabid when onRemoved
const store: Record<
  number,
  Record<string, { contentScriptQueryedPackageJson: any; starsCount: number }>
> = {}

// // @ts-ignore
// globalThis.store = store
// // @ts-ignore
// globalThis.currentActiveInfo = currentActiveInfo

function removeIcon(tabId: number) {
  setIcon(tabId, "inactive")
}

function setIcon(tabId: number, type: "active" | "inactive") {
  chrome.action.setIcon({
    tabId,
    path: {
      "16": chrome.runtime.getURL(`images/${type}-16.png`),
      "48": chrome.runtime.getURL(`images/${type}-48.png`),
      "128": chrome.runtime.getURL(`images/${type}-128.png`),
    },
  })
}

async function resetIcon(tabId: number, url?: string) {
  if (currentActiveInfo?.tabId !== tabId) return
  let cached
  if (url) {
    cached = store?.[tabId]?.[url]
  } else {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!(activeTab && activeTab.id && activeTab.url)) return
    if (tabId !== activeTab.id) return
    cached = store?.[activeTab.id]?.[activeTab.url]
  }
  if (cached) {
    setIcon(tabId, "active")
  } else {
    removeIcon(tabId)
  }
}

function removeStoreTab(id: number) {
  if (store[id]) {
    delete store[id]
  }
}

chrome.runtime.onInstalled.addListener((message) => {
  // console.log("oi", message)
})

// remove store and badge when loading new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.log("ou", tabId, changeInfo, tab)
  if (tab.id && tab.url) {
    resetIcon(tab.id, tab.url)
  }
})

chrome.tabs.onActivated.addListener((activeInfo, ...args) => {
  // console.log("oa", activeInfo, args)
  currentActiveInfo = activeInfo
  resetIcon(activeInfo.tabId)
})

// remove store and badge when remove a tab
chrome.tabs.onRemoved.addListener((tabId) => {
  // console.log("or", tabId)
  removeStoreTab(tabId)
  removeIcon(tabId)
})

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  // console.log("ohsu", details)
  chrome.tabs.sendMessage(details.tabId, {
    historyStateUpdatedInfo: {
      tabId: details.tabId,
      url: details.url,
    },
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[om]", message)

  if (message.backgroundFetch) {
    // @ts-ignore
    bgFetch(...message.backgroundFetch)
      .then((data) => {
        sendResponse([null, data])
      })
      .catch((err) => {
        sendResponse([err, null])
      })
    return true
  } else if (message.backgroundFetchText) {
    // @ts-ignore
    bgFetchText(...message.backgroundFetchText)
      .then((data) => {
        sendResponse([null, data])
      })
      .catch((err) => {
        sendResponse([err, null])
      })
    return true
  } else if (message.contentScriptQueryedPackageJson) {
    // store cache and show badge when receive content_script contentScriptQueryedPackageJson event
    if (sender.tab?.id && sender.tab.url) {
      store[sender.tab.id] = {
        ...store[sender.tab.id],
        [sender.tab.url]: message,
      }
      resetIcon(sender.tab.id)
    }
  }
})

const bgFetch = mem(advancedFetch, {
  cacheKey: JSON.stringify,
  maxAge: 8 * 60 * 60 * 1000,
})

const bgFetchText = mem(advancedFetchText, {
  cacheKey: JSON.stringify,
  maxAge: 8 * 60 * 60 * 1000,
})
