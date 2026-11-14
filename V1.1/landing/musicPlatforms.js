export const musicPlatforms = [
  ["spotify", "Spotify"], ["applemusic", "Apple Music"], ["youtube", "YouTube"],
  ["youtubemusic", "YouTube Music"], ["audiomack", "Audiomack"],
  ["soundcloud", "SoundCloud"], ["tidal", "TIDAL"], ["deezer", "Deezer"], ["amazonmusic", "Amazon Music"]
];
export const musicPlatformLabels = Object.fromEntries(musicPlatforms);
export function musicActions(links = {}) {
  return musicPlatforms.map(([platform, label]) => ({id:platform, kind:"social", platform, label, url:links[platform] || "", style:"outline", visible:true}));
}
