import { NextApiHandler } from "next"
import { JSDOM } from "jsdom"

async function fetchGithubDom(url: string, selector: string) {
  const response = await fetch(url)
  const dom = new JSDOM(await response.text())
  return dom.window.document.querySelector(selector)
}

async function fetchGithubPackageJsonUrl(url: string) {
  const packageJsonAnchorEl = await fetchGithubDom(
    url,
    [
      '#files ~ div [title="package.json"]', // GitHub
      '.files [title="package.json"]', // GitHub before "Repository refresh"
    ].toString()
  )
  if (!packageJsonAnchorEl) return null
  return (packageJsonAnchorEl as HTMLAnchorElement).href
}

async function fetchGithubPackageJson(url: string) {
  const packageJsonEl = await fetchGithubDom(url, ".blob-wrapper table")
  if (!packageJsonEl || !packageJsonEl.textContent) return null
  return JSON.parse(packageJsonEl.textContent) as Record<string, any>
}

const api: NextApiHandler = async (req, res) => {
  const path = req.query.path
  if (typeof path !== "string") return res.status(404)
  const isPackageJsonUrl = path.endsWith("package.json")
  let packageJsonUrl: string
  if (!isPackageJsonUrl) {
    const packageJsonUrlRes = await fetchGithubPackageJsonUrl(path)
    if (!packageJsonUrlRes) {
      return res.status(404)
    }
    packageJsonUrl = packageJsonUrlRes
  } else {
    packageJsonUrl = path
  }
  const packageJson = await fetchGithubPackageJson(packageJsonUrl)
  return packageJson ? res.status(200).json(packageJson) : res.status(404)
}

export default api
