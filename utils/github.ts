import $fetch from "./advancedFetch"

const GITHUB_API = "https://api.github.com"

export const fetchGithubStarCount = (owner: string, repoName: string) => {
  return $fetch(`${GITHUB_API}/repos/${owner}/${repoName}`).then((data) => data.stargazers_count)
}

export const fetchGithubPackageJson = (path: string) => {
  return $fetch(`/api/packagejson?path=${encodeURIComponent(path)}`)
}
