export async function shareLink(title = "HalalMap Korea", url = window.location.href) {
  if (navigator.share) {
    try { await navigator.share({ title, url }); return "Ulashildi"; } catch (error) { if ((error as Error).name === "AbortError") return "Bekor qilindi"; }
  }
  await navigator.clipboard.writeText(url);
  return "Havola nusxalandi";
}
