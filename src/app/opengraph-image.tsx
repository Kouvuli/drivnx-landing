// CFX-WEB-landing AC-18: 1200×630 share image with the headline.
import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = "Understand your data before you use it.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#000000",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700 }}>{site.name}</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>{alt}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#a3a3a3" }}>
          <div style={{ width: 120, height: 6, background: "#fe7f2d" }} />
          From raw data to trusted data products.
        </div>
      </div>
    ),
    size,
  );
}
