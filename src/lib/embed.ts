export function getLoaderScriptUrl({
  baseUrl,
}: {
  baseUrl: string;
}): string {
  return `${baseUrl.replace(/\/$/, '')}/loader.js`;
}

export function buildOneLineEmbedSnippet({
  loaderScriptUrl,
  apiUrl,
  apiKey,
}: {
  loaderScriptUrl: string;
  apiUrl: string;
  apiKey: string;
}): { title: string; snippet: string } {
  return {
    title: 'Dán vào <head> hoặc trước </body>',
    snippet: `<script async src="${loaderScriptUrl}" data-api-url="${apiUrl.replace(/\/$/, '')}" data-api-key="${apiKey}"></script>`,
  };
}
