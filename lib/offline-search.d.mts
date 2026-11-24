export type OfflineSearchItem = {
  id: string;
  title: string;
  url: string;
  group: string;
};

export function filterOfflineSearchItems(
  items: OfflineSearchItem[],
  isOnline: boolean,
  offlineAvailable: boolean
): OfflineSearchItem[];
