import {
  getPackageJson,
  getPackageJsonUrl,
  getStarsCount,
  isPackageJsonUrl,
  PACKAGEJSON_SELECTOR,
  PACKAGEJSON_URL_SELECTOR,
} from "../shared/githubDom"
import { fetchGithubDocument } from "../utils/github"

// @ts-ignore
window.__pdj_content_script_installed__ = true

// TODO loading check
let store: Record<
  string,
  {
    loading: boolean
    result?: {
      contentScriptQueryedPackageJson: any
      starsCount: number | null
    }
  }
> = {}

const jumpBus = {
  listeners: [] as any[],
  onceJump(listener: () => void) {
    this.listeners.push(listener)
  },
  emitJump() {
    this.listeners.forEach((listener) => {
      listener()
    })
    this.listeners = []
  },
}

new MutationObserver((mutationList) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      // @ts-ignore
      for (const addedNode of mutation.addedNodes) {
        if ((addedNode as HTMLElement)?.classList.contains("turbo-progress-bar")) {
          jumpBus.emitJump()
          break
        }
      }
    }
  }
}).observe(document.documentElement, {
  childList: true,
})

async function elementReady(selector: string) {
  if (document.querySelector(selector)) return
  return new Promise<void>((res, rej) => {
    let end = false
    const observer = new MutationObserver((mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          query()
        }
      }
    })
    jumpBus.onceJump(() => {
      if (end) return
      observer.disconnect()
      end = true
      rej("discard cause of jump")
    })
    let querying = false
    const query = () => {
      if (querying || end) return
      setTimeout(() => {
        if (querying || end) return
        if (document.querySelector(selector)) {
          observer.disconnect()
          end = true
          res()
        }
        querying = false
      }, 0)
    }
    observer.observe(document.body, {
      subtree: true,
      childList: true,
    })
  })
}

async function queryPackageJson() {
  if (isPackageJsonUrl(location.href)) {
    await elementReady(PACKAGEJSON_SELECTOR)
    return getPackageJson(document)
  } else {
    await elementReady(PACKAGEJSON_URL_SELECTOR)
    const packageJsonUrl = getPackageJsonUrl(document)
    if (!packageJsonUrl) throw new Error("no package.json url")
    const dom = await fetchGithubDocument(packageJsonUrl)
    return getPackageJson(dom)
  }
}

// async function githubPjaxFinished() {
//   // wait github pjax
//   const ajaxFiles = document.querySelector('#files ~ include-fragment[src*="/file-list/"]')
//   console.log("2", ajaxFiles)
//   if (ajaxFiles?.parentNode) {
//     await new Promise((resolve) => {
//       new MutationObserver(resolve).observe(ajaxFiles.parentNode!, {
//         childList: true,
//       })
//     })
//     console.log("3")
//   }
// }

async function queryPackageJsonAndBroadcast() {
  const key = window.location.pathname
  const cached = store[key]
  if (cached?.loading) {
    return
  }
  if (cached?.result) {
    chrome.runtime.sendMessage(cached.result)
    return
  }
  try {
    store[key] = {
      ...store[key],
      loading: true,
    }
    const packageJson = await queryPackageJson()
    if (key !== window.location.pathname) {
      throw new Error("discard cause of different location")
    }
    const starsCount = getStarsCount(document)
    const result = { contentScriptQueryedPackageJson: packageJson, starsCount }
    store[key] = {
      ...store[key],
      result,
    }
    // console.log("send")
    chrome.runtime.sendMessage(result)
  } catch (err) {
    // console.log("4", err)
  } finally {
    store[key] = {
      ...store[key],
      loading: false,
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    queryPackageJsonAndBroadcast()
  })
} else {
  queryPackageJsonAndBroadcast()
}

chrome.runtime.onMessage.addListener((message) => {
  // console.log("[om]", message)

  if (message.contentScriptQueryPackageJson) {
    queryPackageJsonAndBroadcast()
  } else if (message.historyStateUpdatedInfo) {
    if (message.historyStateUpdatedInfo.url === window.location.href) {
      queryPackageJsonAndBroadcast()
    } else {
      // console.log("---jump", message.historyStateUpdatedInfo.url, window.location.href)
      jumpBus.emitJump()
    }
  }
})
