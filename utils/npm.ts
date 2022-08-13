import $fetch from "./advancedFetch"

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

export async function fetchNpmPackageJson(name: string, version = "latest"): Promise<PackageJSON> {
  return $fetch(`${NPM_REGISTRY}/${name.replace("/", "%2F")}/${version}`)
}

const REGEXP_GITHUB_REPOSITORY = /git\+(.+)(\.git)?/
export function parseNpmPackageJsonRepository(repository: PackageJSON["repository"]) {
  if (repository.type === "git") {
    const res = REGEXP_GITHUB_REPOSITORY.exec(repository.url)
    if (res === null) return null
    let repositoryUrl = res[1]
    if (repositoryUrl.endsWith(".git")) {
      repositoryUrl = repositoryUrl.slice(0, -4)
    }
    const repositoryUrlObj = new URL(repositoryUrl)
    const [_, owner, name] = repositoryUrlObj.pathname.split("/")
    return {
      url: repositoryUrl,
      owner,
      name,
    }
  }
}

export async function fetchNpmPackageDownloadsLastWeek(name: string): Promise<number> {
  return $fetch(`${NPM_API}/downloads/point/last-week/${name}`).then((json) => json.downloads)
}
