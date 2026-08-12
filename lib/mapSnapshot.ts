import crypto from "crypto";

export interface SnapshotAnnotation {
  lat: number;
  lon: number;
  /** Hex color without the leading '#', e.g. "D97A62". */
  color: string;
  markerStyle?: "dot" | "balloon" | "large";
}

/**
 * Apple Maps Web Snapshots use a raw ES256 signature over the request path
 * — not a JWT like WeatherKit. The signature must be IEEE P1363 (raw r||s),
 * not the DER encoding Node's crypto produces by default, or Apple rejects
 * it with 401. See: developer.apple.com/documentation/snapshots
 */
function signPath(path: string, pem: string): string {
  const signer = crypto.createSign("SHA256");
  signer.update(path);
  signer.end();
  return signer.sign({ key: pem, dsaEncoding: "ieee-p1363" }).toString("base64url");
}

/**
 * Builds a signed Apple Maps Web Snapshot URL, or returns null if the Maps
 * credentials aren't configured yet — callers should fall back to a
 * non-photographic view in that case (same "not connected yet" pattern used
 * for WeatherKit elsewhere in this app).
 *
 * Reuses APPLE_WEATHERKIT_TEAM_ID for the team ID since it's the same Apple
 * Developer account either way — only the Maps-specific key is new.
 */
export function getMapSnapshotUrl(
  annotations: SnapshotAnnotation[],
  opts?: { width?: number; height?: number; scale?: number; colorScheme?: "light" | "dark" }
): string | null {
  const teamId = process.env.APPLE_WEATHERKIT_TEAM_ID;
  const keyId = process.env.APPLE_MAPS_KEY_ID;
  const rawKey = process.env.APPLE_MAPS_PRIVATE_KEY;
  if (!teamId || !keyId || !rawKey || annotations.length === 0) return null;

  const pem = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;
  const { width = 640, height = 320, scale = 2, colorScheme = "dark" } = opts ?? {};

  const params = new URLSearchParams();
  params.set("center", annotations.length > 1 ? "auto" : `${annotations[0].lat},${annotations[0].lon}`);
  if (annotations.length === 1) params.set("z", "16");
  params.set("size", `${width}x${height}`);
  params.set("scale", String(scale));
  params.set("colorScheme", colorScheme);
  params.set("poi", "0");
  params.set(
    "annotations",
    JSON.stringify(
      annotations.map((a) => ({
        point: `${a.lat},${a.lon}`,
        color: a.color,
        markerStyle: a.markerStyle ?? "balloon",
      }))
    )
  );

  const path = `/api/v1/snapshot?${params.toString()}&teamId=${teamId}&keyId=${keyId}`;
  const signature = signPath(path, pem);
  return `https://snapshot.apple-mapkit.com${path}&signature=${signature}`;
}
