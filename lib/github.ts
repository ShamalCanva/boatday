// Commits trip JSON files to this site's GitHub repo via the Contents API.
// Vercel apps can't write to their own filesystem at runtime, so the admin
// form publishes a new trip the same way you would by hand: a commit to
// main, which Vercel's existing GitHub integration auto-deploys.
//
// Server-only — never import this from a client component.

const API_BASE = "https://api.github.com";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — see .env.example.`);
  return value;
}

function repoConfig() {
  return {
    token: requireEnv("GITHUB_TOKEN"),
    owner: requireEnv("GITHUB_OWNER"),
    repo: requireEnv("GITHUB_REPO"),
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

async function githubFetch(url: string, token: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
}

/** Lists existing data/trips/*.json slugs straight from GitHub — more
 *  trustworthy than this instance's own checkout, which could be a slightly
 *  stale deploy relative to what's actually on the branch. */
export async function listTripSlugsFromGitHub(): Promise<string[]> {
  const { token, owner, repo, branch } = repoConfig();
  const res = await githubFetch(
    `${API_BASE}/repos/${owner}/${repo}/contents/data/trips?ref=${branch}`,
    token
  );
  if (res.status === 404) return []; // folder doesn't exist yet on that branch
  if (!res.ok) throw new Error(`GitHub list failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as Array<{ name: string }>;
  return data.filter((f) => f.name.endsWith(".json")).map((f) => f.name.replace(/\.json$/, ""));
}

/** Creates or updates data/trips/{slug}.json on the branch. */
export async function commitTripFile(slug: string, jsonContent: string, message: string): Promise<void> {
  const { token, owner, repo, branch } = repoConfig();
  const path = `data/trips/${slug}.json`;

  // Updating a file requires its current sha; creating a new one doesn't.
  const existing = await githubFetch(
    `${API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    token
  );
  const sha = existing.ok ? ((await existing.json()) as { sha: string }).sha : undefined;

  const res = await githubFetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(jsonContent, "utf-8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub commit failed: ${res.status} ${await res.text()}`);
  }
}
