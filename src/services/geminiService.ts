function getTenantId(): string {
  try {
    const url = new URL(window.location.href);

    // 1️⃣ 先讀 path
    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    if (path) return path;

    // 2️⃣ 再讀 query
    const fromQuery =
      url.searchParams.get("t") ||
      url.searchParams.get("tenant");

    if (fromQuery) return fromQuery;

  } catch {}

  // 3️⃣ fallback env
  return (import.meta as any).env?.VITE_TENANT_ID || "";
}
