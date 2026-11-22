export const hasSavedNote = (storageKey) => {
  if (!storageKey) return false;
  try {
    const val = localStorage.getItem(storageKey);
    return Boolean(val && val.trim().length > 0);
  } catch {
    return false;
  }
};
