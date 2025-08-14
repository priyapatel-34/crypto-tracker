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

export function CryptoCard({
  coin,
  onClick,
  onWatchlistChange,
}: CryptoCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(
    WatchlistManager.isInWatchlist(coin.id)
  );

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = WatchlistManager.toggleWatchlist(coin.id);
    setIsInWatchlist(newStatus);
    onWatchlistChange?.();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) =>
    `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;

  const isPositive = coin.price_change_percentage_24h >= 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border transition-all duration-300 cursor-pointer",
        "bg-white border-gray-200 text-gray-900 hover:border-green-400/40 hover:ring-1 hover:ring-green-400/30 hover:bg-green-500/5 active:scale-[0.99] transform transition-transform",
        "dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:border-green-400/40 dark:hover:ring-1 dark:hover:ring-green-400/30 dark:hover:bg-green-500/5"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-10 h-10 rounded-full ring-2 ring-gray-600 group-hover:ring-green-400/40 transition-all"
            />
            <div>
              <h3 className="font-semibold text-lg group-hover:text-green-400 transition-colors">
                {coin.name}
              </h3>
              <p className="text-sm uppercase text-gray-400">{coin.symbol}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWatchlistToggle}
            className={cn(
              "h-8 w-8 p-0 rounded-full transition-colors",
              isInWatchlist
                ? "text-yellow-400 hover:text-yellow-300"
                : "text-gray-400 hover:text-yellow-400"
            )}
          >
            <Star className={cn("h-4 w-4", isInWatchlist && "fill-current")} />
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold">
            {formatPrice(coin.current_price)}
          </span>
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
              isPositive
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {formatPercentage(coin.price_change_percentage_24h)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-700">
          <div>
            <p className="text-xs text-gray-400 mb-1">Market Cap</p>
            <p className="text-sm font-medium">
              {formatMarketCap(coin.market_cap)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Rank</p>
            <p className="text-sm font-medium">#{coin.market_cap_rank}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
