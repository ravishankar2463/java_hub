export function getStaticBasePath(env = process.env) {
  if (!env.GITHUB_ACTIONS) {
    return "";
  }

  const repositoryName = env.GITHUB_REPOSITORY?.split("/").filter(Boolean).at(-1);
  return repositoryName ? `/${repositoryName}` : "";
}
