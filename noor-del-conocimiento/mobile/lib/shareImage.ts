import { Platform } from "react-native";
import type { View } from "react-native";

let htmlToImage: typeof import("html-to-image") | null = null;

async function getHtmlToImage() {
  if (!htmlToImage) {
    htmlToImage = await import("html-to-image");
  }
  return htmlToImage;
}

// Captures a View as a PNG data URI. On web it rasterizes the underlying DOM
// node via html-to-image; on native it defers to react-native-view-shot.
// useRef<View>(null) produces RefObject<View | null>, so accept the nullable.
export async function captureViewAsImage(
  ref: React.RefObject<View | null>,
): Promise<string> {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    const html2img = await getHtmlToImage();
    const node = ref.current as unknown as HTMLElement | null;
    if (!node) throw new Error("View ref is null");
    return html2img.toPng(node, { quality: 1, pixelRatio: 2 });
  }
  if (!ref.current) throw new Error("View ref is null");
  const { captureRef } = await import("react-native-view-shot");
  return captureRef(ref, { format: "png", quality: 1 });
}

// Web-only download helper (triggers a browser download). No-ops off web so it
// never crashes when called on native, where Sharing.shareAsync is used instead.
export async function downloadImage(uri: string, filename: string): Promise<void> {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const blob = await (await fetch(uri)).blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
