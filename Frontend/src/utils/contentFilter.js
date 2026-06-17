/**
 * filterContents — matches a content item against a search query by
 * name, type, or date (multiple formats: "jun 2026", "2026-06-16", "june").
 *
 * Used by every section component to implement in-section search.
 */
export function filterContents(files, query) {
  if (!query || !query.trim()) return files;
  const q = query.trim().toLowerCase();

  return files.filter((file) => {
    // Match name
    if (file.name?.toLowerCase().includes(q)) return true;

    // Match type (image, video, folder, message, link, code, audio, document)
    if (file.type?.toLowerCase().includes(q)) return true;

    // Match extension (pdf, docx, jpg, etc.)
    if (file.extension?.toLowerCase().includes(q)) return true;

    // Match date — multiple representations so "jun", "2026", "16/06" all work
    const d = new Date(file.createdAt || file.updatedAt);
    if (!isNaN(d)) {
      const long  = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toLowerCase();
      const short = d.toLocaleDateString("en-US").toLowerCase(); // m/d/yyyy
      const iso   = d.toISOString().slice(0, 10);                // yyyy-mm-dd
      const month = d.toLocaleDateString("en-US", { month: "long" }).toLowerCase();
      if (long.includes(q) || short.includes(q) || iso.includes(q) || month.includes(q)) return true;
    }

    return false;
  });
}