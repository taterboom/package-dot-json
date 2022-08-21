export const isPackageJsonUrl = (path: string) => path.endsWith("package.json")

export function getPackageJsonUrl(dom: Document) {
  const packageJsonAnchorEl = dom.querySelector(
    ['#files ~ div [title="package.json"]', '.files [title="package.json"]'].toString()
  )
  if (!packageJsonAnchorEl) return null
  return (packageJsonAnchorEl as HTMLAnchorElement).href
}

export function getPackageJson(dom: Document) {
  const packageJsonEl = dom.querySelector(".blob-wrapper table")
  if (!packageJsonEl || !packageJsonEl.textContent) return null
  return JSON.parse(packageJsonEl.textContent) as Record<string, any>
}
