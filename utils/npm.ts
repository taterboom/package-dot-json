import mem from "mem"

const NPM_REGISTRY = "https://registry.npmjs.org"
const NPM_API = "https://api.npmjs.org"

type Dependencies = {
  [x in string]: string
}

export type PackageJSON = {
  name: string
  version: string
  description: string
  homepage: string
  repository: {
    type: string // "git"
    url: string // "git+https://github.com/vercel/next.js.git"
  }
  dependencies: Dependencies
  devDependencies: Dependencies
  peerDependencies: Dependencies
  optionalDependencies: Dependencies
}

export async function fetchNpmPackageJsonImpl(
  name: string,
  version = "latest"
): Promise<PackageJSON> {
  return fetch(`${NPM_REGISTRY}/${name.replace("/", "%2F")}/${version}`).then((res) => res.json())
}
export const fetchNpmPackageJson = mem(fetchNpmPackageJsonImpl, { maxAge: 1000 * 60 * 60 * 8 })

const REGEXP_GITHUB_REPOSITORY = /git\+(.+)\.git/
export function parseNpmPackageJsonRepository(repository: PackageJSON["repository"]) {
  if (repository.type === "git") {
    const res = REGEXP_GITHUB_REPOSITORY.exec(repository.url)
    if (res === null) return null
    const repositoryUrl = res[1]
    const repositoryUrlObj = new URL(repositoryUrl)
    const [_, owner, name] = repositoryUrlObj.pathname.split("/")
    return {
      url: repositoryUrl,
      owner,
      name,
    }
  }
}

export async function fetchNpmPackageDownloadsLastWeekImpl(name: string): Promise<number> {
  return fetch(`${NPM_API}/downloads/point/last-week/${name}`)
    .then((res) => res.json())
    .then((json) => json.downloads)
}
export const fetchNpmPackageDownloadsLastWeek = mem(fetchNpmPackageDownloadsLastWeekImpl, {
  maxAge: 1000 * 60 * 60 * 8,
})
