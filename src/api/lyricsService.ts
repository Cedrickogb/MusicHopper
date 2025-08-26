export class LyricsService {
  static async fetchLyrics(artist: string, title: string) {
    try {
      // Nettoyer les noms d'artiste et titre
      const cleanArtist = this.cleanSearchTerm(artist);
      const cleanTitle = this.cleanSearchTerm(title);
      
      // Essayer avec Lyrics.ovh
      const lyricsOvh = await this.fetchFromLyricsOvh(cleanArtist, cleanTitle);
      if (lyricsOvh) return lyricsOvh;
      
      // Fallback vers d'autres APIs si nécessaire
      // const genius = await this.fetchFromGenius(cleanArtist, cleanTitle);
      // if (genius) return genius;
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des paroles:', error);
      return null;
    }
  }

  static async fetchFromLyricsOvh(artist: string, title: string) {
    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
      // const url = `https://api.lyrics.ovh/v1/${artist}/${title}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.lyrics) {
        return {
          lyrics: data.lyrics,
          source: 'lyrics.ovh'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur Lyrics.ovh:', error);
      return null;
    }
  }

  static cleanSearchTerm(term: string): string {
    return term
      .replace(/\([^)]*\)/g, '') // Supprimer les parenthèses et leur contenu
      .replace(/\[[^\]]*\]/g, '') // Supprimer les crochets et leur contenu
      .replace(/feat\.?\s+.*/i, '') // Supprimer les "feat."
      .replace(/ft\.?\s+.*/i, '') // Supprimer les "ft."
      .trim();
  }
}