import $fetch, { $fetchText } from "./appFetch"

const GITHUB_API = "https://api.github.com"

export const fetchGithubStarCount = (owner: string, repoName: string) => {
  return $fetch(`${GITHUB_API}/repos/${owner}/${repoName}`).then((data) => data.stargazers_count)
}

export const fetchGithubPackageJson = (path: string) => {
  return $fetch(`/api/packagejson?path=${encodeURIComponent(path)}`)
}

// cors, only for chrome extension
export const fetchGithubDocument = (path: string) => {
  return $fetchText(path).then((domString) => {
    return new DOMParser().parseFromString(domString as string, "text/html")
  })
}
