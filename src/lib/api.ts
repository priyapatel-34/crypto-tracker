import axios from 'axios';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  total_volume: number;
  circulating_supply: number;
  max_supply: number | null;
}

export interface CoinPriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

class CoinGeckoAPI {
  async getTopCoins(limit: number = 50): Promise<CryptoCoin[]> {
    try {
      const response = await axios.get(
        `${COINGECKO_API_BASE}/coins/markets`,
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: limit,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h,7d,30d'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching top coins:', error);
      throw new Error('Failed to fetch cryptocurrency data');
    }
  }

  async searchCoins(query: string): Promise<CryptoCoin[]> {
    try {
      if (!query.trim()) return [];
      
      const response = await axios.get(
        `${COINGECKO_API_BASE}/coins/markets`,
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h,7d,30d'
          }
        }
      );
      
      const coins: CryptoCoin[] = response.data;
      return coins.filter(coin => 
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching coins:', error);
      throw new Error('Failed to search cryptocurrencies');
    }
  }

  async getCoinHistory(coinId: string, days: number = 7): Promise<CoinPriceHistory> {
    try {
      const response = await axios.get(
        `${COINGECKO_API_BASE}/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: days,
            interval: days <= 7 ? 'hourly' : 'daily'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching coin history:', error);
      throw new Error('Failed to fetch price history');
    }
  }

  async getCoinDetails(coinId: string): Promise<CryptoCoin> {
    try {
      const response = await axios.get(
        `${COINGECKO_API_BASE}/coins/markets`,
        {
          params: {
            vs_currency: 'usd',
            ids: coinId,
            order: 'market_cap_desc',
            per_page: 1,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h,7d,30d'
          }
        }
      );
      return response.data[0];
    } catch (error) {
      console.error('Error fetching coin details:', error);
      throw new Error('Failed to fetch coin details');
    }
  }
}

export const coinGeckoAPI = new CoinGeckoAPI();