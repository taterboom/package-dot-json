import $fetch from "./advancedFetch"

const GITHUB_API = "https://api.github.com"

export const fetchGithubStarCount = (owner: string, repoName: string) => {
  return $fetch(`${GITHUB_API}/repos/${owner}/${repoName}`).then((data) => data.stargazers_count)
}
