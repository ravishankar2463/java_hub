export function getStaticBasePath(
  env?: Pick<NodeJS.ProcessEnv, "GITHUB_ACTIONS" | "GITHUB_REPOSITORY">
): string;
