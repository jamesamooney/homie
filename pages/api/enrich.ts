import type { NextApiRequest, NextApiResponse } from "next";

interface EnrichData {
  title: string;
  address: string;
  imageUrl: string;
  bedrooms?: number;
  price?: string;
  listedDate?: string;
  sellingAgent?: string;
}

type EnrichResponse =
  | { success: true; data: EnrichData }
  | { success: false; error: string };

const ALLOWED_HOST_SUFFIX = "rightmove.co.uk";
const FETCH_TIMEOUT_MS = 5000;

function isAllowedRightmoveUrl(candidate: URL): boolean {
  if (candidate.protocol !== "https:") return false;
  const host = candidate.hostname.toLowerCase();
  return host === ALLOWED_HOST_SUFFIX || host.endsWith(`.${ALLOWED_HOST_SUFFIX}`);
}

function extractMetaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return undefined;
}

/**
 * Best-effort extraction of listing facts beyond the core og: tags. Rightmove doesn't
 * offer an API, so this reads whatever public page content is available — JSON-LD first
 * (most stable), falling back to regex over the raw HTML/embedded page-model JSON.
 * Every field is optional; a miss here never blocks adding the property (FR-02).
 */
function extractBedrooms(html: string, title?: string): number | undefined {
  const source = title ?? html;
  const match = source.match(/(\d+)\s*bed/i);
  return match ? Number(match[1]) : undefined;
}

function extractPrice(html: string): string | undefined {
  const jsonLdMatch = html.match(/"price"\s*:\s*"?([\d,]{4,})"?/i);
  if (jsonLdMatch) return `£${jsonLdMatch[1]}`;
  const match = html.match(/£[\d,]{4,}/);
  return match?.[0];
}

function extractListedDate(html: string): string | undefined {
  const match = html.match(/(?:Added|Reduced) on (\d{2}\/\d{2}\/\d{4})/i);
  return match?.[1];
}

function extractSellingAgent(html: string): string | undefined {
  const match = html.match(/"branchDisplayName"\s*:\s*"([^"]+)"/i);
  return match?.[1];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnrichResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { url } = req.body ?? {};
  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ success: false, error: "A Rightmove URL is required" });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ success: false, error: "That doesn't look like a valid URL" });
  }

  // Guard against SSRF: only ever fetch real Rightmove listing pages over HTTPS,
  // and never follow a redirect off that host.
  if (!isAllowedRightmoveUrl(parsed)) {
    return res
      .status(400)
      .json({ success: false, error: "Only rightmove.co.uk links are supported" });
  }

  try {
    const response = await fetch(parsed.toString(), {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HomieBot/1.0)",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      return res
        .status(200)
        .json({ success: false, error: "Couldn't read that listing page" });
    }

    const html = await response.text();
    const title = extractMetaContent(html, "og:title");
    const description = extractMetaContent(html, "og:description");
    const imageUrl = extractMetaContent(html, "og:image");

    if (!title) {
      return res
        .status(200)
        .json({ success: false, error: "Couldn't find listing details on that page" });
    }

    return res.status(200).json({
      success: true,
      data: {
        title,
        address: description ?? title,
        imageUrl: imageUrl ?? "",
        bedrooms: extractBedrooms(html, title),
        price: extractPrice(html),
        listedDate: extractListedDate(html),
        sellingAgent: extractSellingAgent(html),
      },
    });
  } catch {
    return res
      .status(200)
      .json({ success: false, error: "Couldn't reach that listing right now" });
  }
}
