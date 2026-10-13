/** Public assets must also resolve when the game is hosted below a repository path. */
export const assetPath = (path: string) => `${import.meta.env?.BASE_URL ?? '/'}${path.replace(/^\/+/, '')}`;
