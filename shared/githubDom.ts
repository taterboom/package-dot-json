export const isPackageJsonUrl = (path: string) => path.endsWith("package.json")

export const PACKAGEJSON_URL_SELECTOR = [
  '#files ~ div [title="package.json"]',
  '.files [title="package.json"]',
].toString()

export function getPackageJsonUrl(dom: Document) {
  const packageJsonAnchorEl = dom.querySelector(PACKAGEJSON_URL_SELECTOR)
  if (!packageJsonAnchorEl) return null
  const href = (packageJsonAnchorEl as HTMLAnchorElement).href
  return href.startsWith("/") ? `https://github.com${href}` : href
}

export const NEW_VERSION_BLOB_SELECTOR = "#read-only-cursor-text-area"
export const PACKAGEJSON_SELECTOR = `.blob-wrapper table, ${NEW_VERSION_BLOB_SELECTOR}`

export function getPackageJson(dom: Document) {
  const packageJsonEl = dom.querySelector(PACKAGEJSON_SELECTOR)
  if (!packageJsonEl || !packageJsonEl.textContent) return null
  return JSON.parse(packageJsonEl.textContent) as Record<string, any>
}

export function getStarsCount(dom: Document) {
  const starsCountEl = dom.querySelector("#repo-stars-counter-star")
  if (!starsCountEl) return null
  const labelContainsNumber = starsCountEl.getAttribute("aria-label") || ""
  return parseInt(labelContainsNumber) || 0
}

export function isGithubRepoPath(url: string) {
  return /.*github\.com\/[^/]+\/[^/]+/.test(url)
}
