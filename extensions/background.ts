// popup on show
// content script get the package.json or the package.json url
// send to background
// background get the package.json or fetch the package.json by the url

import mem from "mem"
import advancedFetch, { advancedFetchText } from "../shared/advancedFetch"

let currentActiveInfo: chrome.tabs.TabActiveInfo | null = null

const store: Record<number, { contentScriptQueryedPackageJson: any; starsCount: number }> = {}

function setBadge(tabId: number) {
  const cached = store[tabId]
  if (cached) {
    chrome.action.setBadgeBackgroundColor({ color: "#F00" }, () => {
      chrome.action.setBadgeText({ text: cached.contentScriptQueryedPackageJson.name })
    })
  } else {
    chrome.action.setBadgeText({ text: "" })
  }
}

chrome.runtime.onInstalled.addListener((message) => {
  // console.log("oi", message)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("ou", tabId, changeInfo, tab)
  if (currentActiveInfo?.tabId === tabId && changeInfo.status === "complete") {
    setBadge(tabId)
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

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("or", tabId)
  if (store[tabId]) {
    delete store[tabId]
  }
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
