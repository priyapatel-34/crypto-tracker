const WATCHLIST_KEY = 'crypto-watchlist';

export class WatchlistManager {
  static getWatchlist(): string[] {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading watchlist:', error);
      return [];
    }
  }

  static addToWatchlist(coinId: string): void {
    try {
      const current = this.getWatchlist();
      if (!current.includes(coinId)) {
        const updated = [...current, coinId];
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  }

  static removeFromWatchlist(coinId: string): void {
    try {
      const current = this.getWatchlist();
      const updated = current.filter(id => id !== coinId);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  }

  static isInWatchlist(coinId: string): boolean {
    return this.getWatchlist().includes(coinId);
  }

  static toggleWatchlist(coinId: string): boolean {
    const isInWatchlist = this.isInWatchlist(coinId);
    if (isInWatchlist) {
      this.removeFromWatchlist(coinId);
    } else {
      this.addToWatchlist(coinId);
    }
    return !isInWatchlist;
  }
}