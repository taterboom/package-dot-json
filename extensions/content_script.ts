import {
  getPackageJson,
  getPackageJsonUrl,
  getStarsCount,
  isPackageJsonUrl,
} from "../shared/githubDom"
import { fetchGithubDocument } from "../utils/github"

console.log("cs!")

// @ts-ignore
window.__pdj_content_script_installed__ = true

let cached: {
  contentScriptQueryedPackageJson: any
  starsCount: number | null
} | null = null

async function queryPackageJson() {
  if (!isPackageJsonUrl(location.href)) {
    const packageJsonUrl = getPackageJsonUrl(document)
    if (!packageJsonUrl) throw new Error("no package.json url")
    const dom = await fetchGithubDocument(packageJsonUrl)
    return getPackageJson(dom)
  } else {
    return getPackageJson(document)
  }
}

let _finished = false
async function githubPjaxFinished() {
  console.log("1", _finished)
  if (_finished) return
  // wait github pjax
  const ajaxFiles = document.querySelector('#files ~ include-fragment[src*="/file-list/"]')
  console.log("2", ajaxFiles)
  if (ajaxFiles?.parentNode) {
    await new Promise((resolve) => {
      new MutationObserver(resolve).observe(ajaxFiles.parentNode!, {
        childList: true,
      })
    })
    _finished = true
    console.log("3")
  }
}

async function queryPackageJsonAndBroadcast() {
  await githubPjaxFinished()
  if (cached) {
    chrome.runtime.sendMessage(cached)
    return
  }
  try {
    const packageJson = await queryPackageJson()
    const starsCount = getStarsCount(document)
    cached = { contentScriptQueryedPackageJson: packageJson, starsCount }
    console.log("send")
    chrome.runtime.sendMessage(cached)
  } catch (err) {
    console.log("4", err)
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
  if (message.contentScriptQueryPackageJson) {
    queryPackageJsonAndBroadcast()
  }
  return true
})
