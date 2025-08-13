
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { WatchlistManager } from "../../lib/watchlist";
import type { CryptoCoin } from "../../lib/api";
import { cn } from "../../lib/utils";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface CryptoCardProps {
  coin: CryptoCoin;
  onClick: () => void;
  onWatchlistChange?: () => void;
}

export function CryptoCard({ coin, onClick, onWatchlistChange }: CryptoCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(
    WatchlistManager.isInWatchlist(coin.id)
  );

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = WatchlistManager.toggleWatchlist(coin.id);
    setIsInWatchlist(newStatus);
    onWatchlistChange?.();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const isPositive = coin.price_change_percentage_24h >= 0;

  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-card-hover hover:scale-[1.02] transform-gpu"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={coin.image} 
                alt={coin.name}
                className="w-10 h-10 rounded-full ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-300"
              />
              <div className="absolute -inset-1 bg-gradient-primary rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors duration-300">
                {coin.name}
              </h3>
              <p className="text-muted-foreground text-sm uppercase tracking-wider">
                {coin.symbol}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWatchlistToggle}
            className={cn(
              "h-8 w-8 p-0 rounded-full transition-all duration-300",
              isInWatchlist
                ? "text-crypto-orange hover:text-crypto-orange/80"
                : "text-muted-foreground hover:text-crypto-orange"
            )}
          >
            <Star className={cn("h-4 w-4", isInWatchlist && "fill-current")} />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(coin.current_price)}
            </span>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium transition-all duration-300",
              isPositive 
                ? "bg-crypto-green/10 text-crypto-green" 
                : "bg-crypto-red/10 text-crypto-red"
            )}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {formatPercentage(coin.price_change_percentage_24h)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
              <p className="text-sm font-medium text-foreground">
                {formatMarketCap(coin.market_cap)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rank</p>
              <p className="text-sm font-medium text-foreground">
                #{coin.market_cap_rank}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
}