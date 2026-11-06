export function downloadJson(raw: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
  const revoke = URL.revokeObjectURL.bind(URL);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  } finally {
    window.setTimeout(() => revoke(url), 1000);
  }
}
