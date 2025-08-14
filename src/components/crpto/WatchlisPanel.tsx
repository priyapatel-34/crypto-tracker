import { Star, Trash2 } from "lucide-react";
import type { CryptoCoin } from "../../lib/api";
import { Card } from "../ui/Card";
import { cn } from "../../lib/utils";
import { WatchlistManager } from "../../lib/watchlist";
import { Button } from "../ui/Button";

interface WatchlistPanelProps {
  watchlistCoins: CryptoCoin[];
  onCoinClick: (coin: CryptoCoin) => void;
  onRemoveFromWatchlist: (coinId: string) => void;
  className?: string;
}

export function WatchlistPanel({
  watchlistCoins,
  onCoinClick,
  onRemoveFromWatchlist,
  className,
}: WatchlistPanelProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
  };

  const handleRemove = (e: React.MouseEvent, coinId: string) => {
    e.stopPropagation();
    WatchlistManager.removeFromWatchlist(coinId);
    onRemoveFromWatchlist(coinId);
  };

  if (watchlistCoins.length === 0) {
    return (
      <Card className={cn("p-6 bg-gradient-card border-border/50", className)}>
        <div className="text-center">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Your Watchlist is Empty
          </h3>
          <p className="text-muted-foreground text-sm">
            Add cryptocurrencies to your watchlist to track their performance
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 bg-gradient-card border-border/50", className)}>
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-crypto-orange fill-current" />
        <h3 className="text-lg font-semibold text-foreground">
          Watchlist ({watchlistCoins.length})
        </h3>
      </div>

      <div className="space-y-3">
        {watchlistCoins.map((coin) => {
          const isPositive = coin.price_change_percentage_24h >= 0;

          return (
            <div
              key={coin.id}
              onClick={() => onCoinClick(coin)}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg border border-border/50",
                "transition-transform duration-200 cursor-pointer hover:border-green-400/40 hover:ring-1 hover:ring-green-400/30 hover:bg-green-500/5"
              )}
            >
              <div className="flex items-center gap-3">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium text-foreground text-sm transition-colors">
                    {coin.name}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase">
                    {coin.symbol}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium text-foreground text-sm">
                    {formatPrice(coin.current_price)}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      isPositive ? "text-crypto-green" : "text-crypto-red"
                    )}
                  >
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: any) => handleRemove(e, coin.id)}
                  className="h-8 w-8 p-0 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
