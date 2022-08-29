import $fetch, { $fetchText } from "./appFetch"

const GITHUB_API = "https://api.github.com"

export const fetchGithubStarsCount = (owner: string, repoName: string) => {
  return $fetch(`${GITHUB_API}/repos/${owner}/${repoName}`).then((data) => data.stargazers_count)
}

export const fetchGithubPackageJson = (path: string) => {
  return $fetch(`/api/packagejson?path=${encodeURIComponent(path)}`)
}

export const fetchGithubStarsCountProxy = (owner: string, repo: string) => {
  return $fetch(`/api/stars?owner=${owner}&repo=${repo}`)
}

// cors, only for chrome extension
export const fetchGithubDocument = (path: string) => {
  return $fetchText(path).then((domString) => {
    return new DOMParser().parseFromString(domString as string, "text/html")
  })
}
