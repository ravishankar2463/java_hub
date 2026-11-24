export const SITE_URL = "https://ravishankar2463.github.io/java_hub";

export function getSiteUrl(pathname = "/") {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, "");
  return normalizedPath ? `${SITE_URL}/${normalizedPath}` : `${SITE_URL}/`;
}
