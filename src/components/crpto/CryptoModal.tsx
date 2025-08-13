import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useToast } from "../../hooks/use-toast";
import { coinGeckoAPI, type CoinPriceHistory, type CryptoCoin } from "../../lib/api";
import { WatchlistManager } from "../../lib/watchlist";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { cn } from "../../lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../ui/Tabs";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "../ui/Dialog";

interface CryptoModalProps {
  coin: CryptoCoin | null;
  isOpen: boolean;
  onClose: () => void;
  onWatchlistChange?: () => void;
}

export function CryptoModal({ coin, isOpen, onClose, onWatchlistChange }: CryptoModalProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [priceHistory, setPriceHistory] = useState<CoinPriceHistory | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (coin) {
      setIsInWatchlist(WatchlistManager.isInWatchlist(coin.id));
      fetchPriceHistory(coin.id, selectedPeriod);
    }
  }, [coin, selectedPeriod]);

  const fetchPriceHistory = async (coinId: string, days: number) => {
    setLoading(true);
    try {
      const history = await coinGeckoAPI.getCoinHistory(coinId, days);
      setPriceHistory(history);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch price history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    if (!coin) return;
    const newStatus = WatchlistManager.toggleWatchlist(coin.id);
    setIsInWatchlist(newStatus);
    onWatchlistChange?.();
    toast({
      title: newStatus ? "Added to Watchlist" : "Removed from Watchlist",
      description: `${coin.name} has been ${newStatus ? 'added to' : 'removed from'} your watchlist`,
    });
  };

  if (!coin) return null;

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

  const chartData = priceHistory?.prices.map(([timestamp, price]) => ({
    timestamp,
    price,
    date: new Date(timestamp).toLocaleDateString(),
  })) || [];

  const isPositive = coin.price_change_percentage_24h >= 0;
  const lineColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img 
              src={coin.image} 
              alt={coin.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-xl">{coin.name}</span>
            <span className="text-muted-foreground text-base uppercase">
              {coin.symbol}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Price Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(coin.current_price)}
              </span>
              <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                isPositive 
                  ? "bg-crypto-green/10 text-crypto-green" 
                  : "bg-crypto-red/10 text-crypto-red"
              )}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatPercentage(coin.price_change_percentage_24h)}
              </div>
            </div>
            
            <Button
              onClick={handleWatchlistToggle}
              className={cn(
                "gap-2",
                isInWatchlist
                  ? "bg-crypto-orange hover:bg-crypto-orange/80"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <Star className={cn("w-4 h-4", isInWatchlist && "fill-current")} />
              {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            </Button>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-card">
              <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
              <p className="text-lg font-semibold text-foreground">
                {formatMarketCap(coin.market_cap)}
              </p>
            </Card>
            <Card className="p-4 bg-gradient-card">
              <p className="text-xs text-muted-foreground mb-1">Volume (24h)</p>
              <p className="text-lg font-semibold text-foreground">
                {formatMarketCap(coin.total_volume)}
              </p>
            </Card>
            <Card className="p-4 bg-gradient-card">
              <p className="text-xs text-muted-foreground mb-1">Circulating Supply</p>
              <p className="text-lg font-semibold text-foreground">
                {coin.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}
              </p>
            </Card>
            <Card className="p-4 bg-gradient-card">
              <p className="text-xs text-muted-foreground mb-1">Rank</p>
              <p className="text-lg font-semibold text-foreground">
                #{coin.market_cap_rank}
              </p>
            </Card>
          </div>

          {/* Price Chart */}
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Price Chart</h3>
              <Tabs value={selectedPeriod.toString()} onValueChange={(value:any) => setSelectedPeriod(parseInt(value))}>
                <TabsList className="bg-secondary">
                  <TabsTrigger value="7">7D</TabsTrigger>
                  <TabsTrigger value="30">30D</TabsTrigger>
                  <TabsTrigger value="90">90D</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      domain={['dataMin * 0.95', 'dataMax * 1.05']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                      formatter={(value: number) => [formatPrice(value), 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={lineColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, stroke: lineColor, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}