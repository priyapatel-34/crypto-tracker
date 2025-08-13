import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { coinGeckoAPI, type CryptoCoin } from "../../lib/api";
import { cn } from "../../lib/utils";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

interface SearchBarProps {
  onSelectCoin: (coin: CryptoCoin) => void;
  className?: string;
}

export function SearchBar({ onSelectCoin, className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CryptoCoin[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCoins = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await coinGeckoAPI.searchCoins(query);
        setResults(searchResults.slice(0, 8));
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchCoins, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectCoin = (coin: CryptoCoin) => {
    onSelectCoin(coin);
    setQuery("");
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={query}
          onChange={(e:any) => setQuery(e.target.value)}
          className="pl-10 pr-10 bg-secondary border-border/50 focus:border-primary/50 transition-all duration-300"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto bg-card border-border/50 shadow-lg">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-border/30">
              {results.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => handleSelectCoin(coin)}
                  className="w-full p-4 text-left hover:bg-accent/50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={coin.image} 
                        alt={coin.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {coin.name}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground text-sm">
                        {formatPrice(coin.current_price)}
                      </p>
                      <p className={cn(
                        "text-xs",
                        coin.price_change_percentage_24h >= 0 
                          ? "text-crypto-green" 
                          : "text-crypto-red"
                      )}>
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}