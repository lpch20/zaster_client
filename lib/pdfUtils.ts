// Helper para cargar el logo desde /public y devolverlo como data URL
export type LogoResult = { dataUrl: string; mime: string } | null;

export async function getLogoDataUrl(): Promise<LogoResult> {
  try {
    // Intentar distintos nombres comunes
    const candidates = ['/logo.jpg', '/logo.jpeg', '/logo.png'];
    let resp: Response | null = null;
    let url: string | null = null;
    for (const c of candidates) {
      try {
        const r = await fetch(c);
        if (r.ok) {
          resp = r;
          url = c;
          break;
        }
      } catch (e) {
        // ignore and try next
      }
    }
    if (!resp || !url) return null;
    const blob = await resp.blob();
    const mime = blob.type || (url.endsWith('.png') ? 'image/png' : 'image/jpeg');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { dataUrl, mime };
  } catch (err) {
    console.error('Error cargando logo para PDF:', err);
    return null;
  }
}


