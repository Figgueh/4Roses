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
  // Removes any parameters if there are any.
  var lastPart = path?.split("/").at(-1);
  if (lastPart.includes("?")) {
    lastPart = lastPart.split("?")[0];
  }
  const pathSplit = path?.split("/").at(-2) + "/" + lastPart;
  if (pathSplit != "undefined/undefined") return pathSplit;
  else return undefined;
}

export const ROOM_OPTIONS = {
  first: [
    { value: "f1b4", label: "Bedroom 4", color: "#943E3B" },
    { value: "f1b5", label: "Bedroom 5", color: "#0084A9" },
    { value: "f1k", label: "Kitchen", color: "#CEEDF3" },
    { value: "f1l", label: "Living room", color: "#FFDF8F" },
    { value: "f1w", label: "Washroom", color: "#18dd11" },
    { value: "f1h", label: "Hallway", color: "#FFE699" },
    { value: "g", label: "Garage", color: "#acd418" },
  ],
  second: [
    { value: "f2b1", label: "Bedroom 1", color: "#8A383C" },
    { value: "f2b2", label: "Bedroom 2", color: "#94C97E" },
    { value: "f2b3", label: "Bedroom 3", color: "#FBCB43" },
    { value: "f2w1", label: "Washroom 1", color: "#4F66AB" },
    { value: "f2w2", label: "Washroom 2", color: "#2F5472" },
    { value: "f2w3", label: "Washroom 3", color: "#579AB9" },
    { value: "f2w4", label: "Washroom 4", color: "#006F89" },
    { value: "f2k", label: "Kitchen", color: "#CE5D39" },
    { value: "f2l", label: "Living room", color: "#FFBF6D" },
    { value: "f2h", label: "Hallway", color: "#1b9690" },
    { value: "f2s", label: "Storage", color: "#777777" },
    { value: "f2p", label: "Pantry", color: "#CCB799" },
  ],
};

export const getFloorFromRoomId = (roomId) => {
  if (!roomId) return "";
  if (roomId.startsWith("f2")) return "second";
  return "first";
};

export const getFloorLabel = (roomId) => {
  return roomId?.startsWith("f2") ? "Second floor" : "First floor";
};

export const getRoomLabel = (roomId) => {
  const all = [...ROOM_OPTIONS.first, ...ROOM_OPTIONS.second];
  return all.find((r) => r.value === roomId)?.label ?? null;
};

export const getRoomColor = (roomId) => {
  const all = [...ROOM_OPTIONS.first, ...ROOM_OPTIONS.second];
  return all.find((r) => r.value === roomId)?.color ?? null;
};
