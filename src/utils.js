export function slugify(title) {
  if (!title) return "";
  return title
    .toString()
    .trim()
    .replace(/&/g, "and") // Replace & with 'and'
    .replace(/[^\w\s-]+/g, "") // Remove other symbols (except letters, numbers, hyphens)
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
}

export function unslugify(slug) {
  if (!slug) return "";
  return slug.toString().trim().replace(/[-_]+/g, " ");
}

// https://fignet.imgix.net/interior/bedroom1A_4032x3024.jpg
// returns bedroom1A_4032x3024.jpg
export function trimImagePath(path) {
  return path?.split("/")[3] + "/" + path?.split("/")[4];
}
// https://ywkadgkdgycsjuhllfau.supabase.co/storage/v1/object/images/articles/testimonial-6-3.jpg
// returns articles/testimonial-6-3.jpg
export function trimImagePathNoSize(path) {
  const pathSplit = path?.split("/")[8] + "/" + path?.split("/")[9];
  if (pathSplit != "undefined/undefined") return pathSplit;
  else return undefined;
}
