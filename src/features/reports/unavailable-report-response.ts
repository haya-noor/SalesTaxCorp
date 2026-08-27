import "server-only";

import { NextResponse } from "next/server";

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

export function createUnavailableReportResponse(
  message: string,
  status: number,
) {
  const safeMessage = escapeHtml(message);
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Report unavailable</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f8fafc; color: #0f172a; font-family: Arial, sans-serif; }
      main { max-width: 36rem; padding: 2rem; text-align: center; }
      h1 { margin: 0 0 .75rem; font-size: 1.5rem; }
      p { margin: 0; color: #475569; font-size: 1rem; line-height: 1.6; }
    </style>
  </head>
  <body><main><h1>Report temporarily unavailable</h1><p>${safeMessage}</p></main></body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
