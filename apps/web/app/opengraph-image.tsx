import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Gullak: learn money, practise with play money";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social preview card: Gullu beside the wordmark, on the brand paper.
export default async function OpenGraphImage() {
  const gullu = await readFile(join(process.cwd(), "app/icon.svg"), "utf8");
  const src = `data:image/svg+xml;base64,${Buffer.from(gullu).toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 56,
        padding: "0 96px",
        background: "#f7f3e8",
        color: "#171717",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: ImageResponse renders plain img only */}
      <img src={src} width={380} height={380} alt="" />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>Gullak</div>
        <div style={{ fontSize: 44, lineHeight: 1.2, maxWidth: 600 }}>
          Learn money. Practise with play money on real markets.
        </div>
        <div style={{ display: "flex" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              padding: "10px 22px",
              borderRadius: 999,
              background: "#dfff3f",
              border: "3px solid #171717",
            }}
          >
            All money is virtual · Classes 6–12
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
