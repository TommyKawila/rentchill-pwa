export function isDevToolsEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_DEV_TOOLS === "true"
  );
}

export function assertDevToolsEnabled() {
  if (!isDevToolsEnabled()) {
    throw new Error("DEV_TOOLS_DISABLED");
  }
}
