import mem from "mem"

const GITHUB_API = "https://api.github.com"

export const fetchGithubStarCount = mem(
  (owner: string, repoName: string) => {
    return fetch(`${GITHUB_API}/repos/${owner}/${repoName}`)
      .then((res) => res.json())
      .then((data) => data.stargazers_count)
  },
  {
    maxAge: 1000 * 60 * 60 * 8,
  }
)
