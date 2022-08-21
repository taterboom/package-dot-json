import { NextApiHandler } from "next"
import { JSDOM } from "jsdom"
import { getPackageJson, getPackageJsonUrl, isPackageJsonUrl } from "../../shared/githubDom"

async function fetchGithubDom(url: string) {
  const response = await fetch(url)
  const dom = new JSDOM(await response.text())
  return dom.window.document
}

async function fetchGithubPackageJsonUrl(url: string) {
  const dom = await fetchGithubDom(url)
  return getPackageJsonUrl(dom)
}

async function fetchGithubPackageJson(url: string) {
  const dom = await fetchGithubDom(url)
  return getPackageJson(dom)
}

const api: NextApiHandler = async (req, res) => {
  const path = req.query.path
  if (typeof path !== "string") return res.status(404)
  let packageJsonUrl: string
  if (!isPackageJsonUrl(path)) {
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
