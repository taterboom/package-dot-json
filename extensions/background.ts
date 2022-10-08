// popup on show
// content script get the package.json or the package.json url
// send to background
// background get the package.json or fetch the package.json by the url

import mem from "mem"
import advancedFetch, { advancedFetchText } from "../shared/advancedFetch"

let currentActiveInfo: chrome.tabs.TabActiveInfo | null = null

// TODO
// cache by tabid and url and then remove tabid when onRemoved
// tabid: {[url]: message}
const store: Record<number, { contentScriptQueryedPackageJson: any; starsCount: number }> = {}

// @ts-ignore
globalThis.store = store
// @ts-ignore
globalThis.currentActiveInfo = currentActiveInfo

function removeBadge() {
  chrome.action.setBadgeText({ text: "" })
}

function setBadge(tabId: number) {
  if (currentActiveInfo?.tabId !== tabId) return
  const cached = store[tabId]
  if (cached) {
    chrome.action.setBadgeBackgroundColor({ color: "#C00" }, () => {
      chrome.action.setBadgeText({ text: "1" })
    })
  } else {
    removeBadge()
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
  console.log("ou", tabId, changeInfo, tab)
  // the first loading event
  if (changeInfo.status === "loading" && changeInfo.url) {
    removeStoreTab(tabId)
    removeBadge()
  }
})

chrome.tabs.onCreated.addListener((tab, ...args) => {
  console.log("oc", tab, args)
})

chrome.tabs.onActivated.addListener((activeInfo, ...args) => {
  console.log("oa", activeInfo, args)
  currentActiveInfo = activeInfo
  setBadge(activeInfo.tabId)
})

// remove store and badge when remove a tab
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("or", tabId)
  removeStoreTab(tabId)
  removeBadge()
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
    if (sender.tab?.id) {
      store[sender.tab.id] = message
      setBadge(sender.tab.id)
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
