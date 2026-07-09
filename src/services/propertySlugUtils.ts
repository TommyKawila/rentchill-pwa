export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function slugFromPropertyName(name: string) {
  return slugify(name.trim()) || "project";
}
