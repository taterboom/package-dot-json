import { isPackageJsonUrl, getPackageJsonUrl, getPackageJson } from "../shared/githubDom"
import { fetchGithubDocument } from "../utils/github"

console.log("cs inject")

async function queryPackageJson() {
  console.log(isPackageJsonUrl(location.href))
  if (!isPackageJsonUrl(location.href)) {
    const packageJsonUrl = getPackageJsonUrl(document)
    if (!packageJsonUrl) throw new Error("no package.json url")
    const dom = await fetchGithubDocument(packageJsonUrl)
    return getPackageJson(dom)
  } else {
    return getPackageJson(document)
  }
}

async function queryPackageJsonAndBroacast() {
  try {
    const packageJson = await queryPackageJson()
    console.log("3", packageJson)
    chrome.runtime.sendMessage({ contentScriptQueryedPackageJson: packageJson })
  } catch (err) {
    console.log("4", err)
  }
}

if (document.readyState === "complete") {
  console.log(1)
  queryPackageJsonAndBroacast()
} else {
  document.addEventListener("DOMContentLoaded", () => {
    console.log(2)
    queryPackageJsonAndBroacast()
  })
}

chrome.runtime.onMessage.addListener((message) => {
  console.log(5, message)
  if (message.contentScriptQueryPackageJson) {
    queryPackageJsonAndBroacast()
  }
  return true
})

// @ts-ignore
window.__pdj_content_script_installed__ = true
