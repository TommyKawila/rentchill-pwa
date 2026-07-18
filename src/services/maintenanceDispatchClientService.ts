export async function shareMaintenanceDispatch(input: {
  message: string;
  lineUrl?: string | null;
}): Promise<"shared" | "copied" | "fallback"> {
  const { message, lineUrl } = input;

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ text: message });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw err;
      }
      console.error("[shareMaintenanceDispatch.share]", {}, err);
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
      if (lineUrl) {
        window.open(lineUrl, "_blank", "noopener,noreferrer");
      }
      return "copied";
    }
  } catch (err) {
    console.error("[shareMaintenanceDispatch.clipboard]", {}, err);
  }

  if (lineUrl) {
    window.open(lineUrl, "_blank", "noopener,noreferrer");
  }
  return "fallback";
}
