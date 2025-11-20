export interface ParsedLine {
  time: number; // Temps en secondes
  text: string;
}

export interface LyricsResult {
  lyrics: string;        // Le texte brut (pour affichage simple)
  parsedLyrics: ParsedLine[]; // Le tableau synchronisé
  source: string;
  isSynced: boolean;     // Est-ce qu'on a les temps ?
}

export class LyricsService {
  
  // URL de l'API Lrclib
  private static API_URL = 'https://lrclib.net/api';

  /**
   * Récupère les paroles (Synchronisées ou Simples)
   */
  static async fetchLyrics(artist: string, title: string, album?: string, duration?: number): Promise<LyricsResult | null> {
    try {
      const cleanArtist = this.cleanSearchTerm(artist);
      const cleanTitle = this.cleanSearchTerm(title);
      
      // 1. Construction des paramètres pour la recherche exacte
      const params = new URLSearchParams({
        artist_name: cleanArtist,
        track_name: cleanTitle,
      });

      if (album && album !== "Inconnu") params.append("album_name", album);
      if (duration && duration > 0) params.append("duration", duration.toString());

      // 2. Tentative de récupération directe (GET)
      const response = await fetch(`${this.API_URL}/get?${params.toString()}`);

      if (!response.ok) {
        // Si pas de match exact (404), on tente une recherche plus large
        if (response.status === 404) {
          return await this.searchFallback(cleanArtist, cleanTitle);
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return this.processResponse(data);

    } catch (error) {
      console.error('Erreur lors de la récupération des paroles:', error);
      return null;
    }
  }

  /**
   * Recherche large si le match exact échoue
   */
  static async searchFallback(artist: string, title: string): Promise<LyricsResult | null> {
    try {
      const params = new URLSearchParams({ q: `${artist} ${title}` });
      const response = await fetch(`${this.API_URL}/search?${params.toString()}`);
      const data = await response.json();

      // On prend le premier résultat pertinent
      if (Array.isArray(data) && data.length > 0) {
        // On préfère un résultat avec syncedLyrics s'il y en a un
        const bestMatch = data.find((item: any) => item.syncedLyrics) || data[0];
        return this.processResponse(bestMatch);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Traite la réponse de l'API pour déterminer si on a du sync ou du plain
   */
  private static processResponse(data: any): LyricsResult | null {
    // Cas 1 : Paroles synchronisées disponibles
    if (data.syncedLyrics) {
      return {
        lyrics: data.syncedLyrics,
        parsedLyrics: this.parseLRC(data.syncedLyrics),
        source: 'Lrclib.net (Sync)',
        isSynced: true
      };
    } 
    // Cas 2 : Seulement paroles simples (plainLyrics)
    else if (data.plainLyrics) {
      return {
        lyrics: data.plainLyrics,
        // On crée un faux tableau "parsed" pour que l'affichage fonctionne pareil
        parsedLyrics: data.plainLyrics.split('\n').map((line: string) => ({ time: 0, text: line })),
        source: 'Lrclib.net (Texte)',
        isSynced: false
      };
    }

    return null;
  }

  /**
   * Transforme "[00:12.50] Bla bla" en { time: 12.5, text: "Bla bla" }
   */
  private static parseLRC(lrc: string): ParsedLine[] {
    const lines = lrc.split('\n');
    const result: ParsedLine[] = [];
    // Regex pour capturer [mm:ss.xx]
    const timeRegExp = /\[(\d{2}):(\d{2})(?:\.|:)(\d{2,3})\]/;

    for (const line of lines) {
      const match = timeRegExp.exec(line);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3].padEnd(3, '0')); // Normalise ms
        
        const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
        const text = line.replace(timeRegExp, '').trim();

        // On garde même les lignes vides pour l'espacement visuel
        result.push({ time: timeInSeconds, text });
      }
    }
    return result;
  }

  static cleanSearchTerm(term: string): string {
    if (!term) return '';
    return term
      .replace(/\([^)]*\)/g, '') // Supprimer les parenthèses
      .replace(/\[[^\]]*\]/g, '') // Supprimer les crochets
      .replace(/feat\.?\s+.*/i, '') 
      .replace(/ft\.?\s+.*/i, '')
      .trim();
  }
}