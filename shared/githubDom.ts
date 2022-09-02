export const isPackageJsonUrl = (path: string) => path.endsWith("package.json")

export function getPackageJsonUrl(dom: Document) {
  const packageJsonAnchorEl = dom.querySelector(
    ['#files ~ div [title="package.json"]', '.files [title="package.json"]'].toString()
  )
  if (!packageJsonAnchorEl) return null
  const href = (packageJsonAnchorEl as HTMLAnchorElement).href
  return href.startsWith("/") ? `https://github.com${href}` : href
}

export function getPackageJson(dom: Document) {
  const packageJsonEl = dom.querySelector(".blob-wrapper table")
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
