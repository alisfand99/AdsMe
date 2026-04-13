/** Build a `File` from an image data URL (browser). */
export async function dataUrlToFile(
  dataUrl: string,
  filename: string
): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const type = blob.type || "image/jpeg";
  return new File([blob], filename, { type });
}
