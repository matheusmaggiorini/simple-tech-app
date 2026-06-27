/** Public assets — use BASE_URL so paths work on GitHub Pages (/simple-tech-app/). */
export function assetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${clean}`;
}

export const LOGO_SIMPLE_URL = assetUrl("logo-simple-reduzida.png");
export const LOGO_HERO_URL = assetUrl("lovable-uploads/384369b9-e59e-4a5b-b053-e7ff4f9462a8.png");
export const LOGO_FOOTER_URL = assetUrl("lovable-uploads/46ca89a7-72fc-479a-bd07-4512df57ce75.png");
