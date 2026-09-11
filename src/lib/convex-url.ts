export function resolveConvexUrl({
  convexUrl,
  siteUrl,
}: {
  convexUrl?: string;
  siteUrl?: string;
} = {}): string | undefined {
  const direct = convexUrl?.trim();
  if (direct) return direct;

  const site = siteUrl?.trim();
  if (!site) return undefined;

  try {
    const url = new URL(site);
    if (url.port === "3211") {
      url.port = "3210";
      return stripTrailingSlash(url);
    }
    if (url.hostname.endsWith(".convex.site")) {
      url.hostname = url.hostname.replace(/\.convex\.site$/, ".convex.cloud");
      return stripTrailingSlash(url);
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function stripTrailingSlash(url: URL): string {
  return url.toString().replace(/\/$/, "");
}

export function convexUrlFromEnv(): string | undefined {
  return resolveConvexUrl({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
    siteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  });
}
