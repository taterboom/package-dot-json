import {
  getPackageJson,
  getPackageJsonUrl,
  getStarsCount,
  isPackageJsonUrl,
} from "../shared/githubDom"
import { fetchGithubDocument } from "../utils/github"

// @ts-ignore
window.__pdj_content_script_installed__ = true

// TODO loading check
let store: Record<
  string,
  {
    contentScriptQueryedPackageJson: any
    starsCount: number | null
  }
> = {}

async function queryPackageJson() {
  if (isPackageJsonUrl(location.href)) {
    // TODO
    // await elementready
    return getPackageJson(document)
  } else {
    // TODO
    // await elemetready
    const packageJsonUrl = getPackageJsonUrl(document)
    if (!packageJsonUrl) throw new Error("no package.json url")
    const dom = await fetchGithubDocument(packageJsonUrl)
    return getPackageJson(dom)
  }
}

async function githubPjaxFinished() {
  // wait github pjax
  const ajaxFiles = document.querySelector('#files ~ include-fragment[src*="/file-list/"]')
  console.log("2", ajaxFiles)
  if (ajaxFiles?.parentNode) {
    await new Promise((resolve) => {
      new MutationObserver(resolve).observe(ajaxFiles.parentNode!, {
        childList: true,
      })
    })
    console.log("3")
  }
}

async function queryPackageJsonAndBroadcast() {
  const key = window.location.pathname
  const cached = store[key]
  if (cached) {
    chrome.runtime.sendMessage(cached)
    return
  }
  await githubPjaxFinished()
  try {
    const packageJson = await queryPackageJson()
    const starsCount = getStarsCount(document)
    const result = { contentScriptQueryedPackageJson: packageJson, starsCount }
    store = {
      ...store,
      [key]: result,
    }
    // console.log("send")
    chrome.runtime.sendMessage(result)
  } catch (err) {
    // console.log("4", err)
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
  console.log("[om]", message)

  if (message.contentScriptQueryPackageJson) {
    queryPackageJsonAndBroadcast()
  } else if (message.historyStateUpdatedInfo) {
    if (message.historyStateUpdatedInfo.url === window.location.href) {
      queryPackageJsonAndBroadcast()
    }
  }
})
