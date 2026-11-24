export function filterOfflineSearchItems(items, isOnline, offlineAvailable) {
  if (isOnline) {
    return items;
  }
  if (!offlineAvailable) {
    return [];
  }
  return items.filter((item) => item.url.startsWith("/roadmap/level-"));
}
