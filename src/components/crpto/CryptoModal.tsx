import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTheme } from "next-themes";
import {
  coinGeckoAPI,
  type CoinPriceHistory,
  type CryptoCoin,
} from "../../lib/api";
import { WatchlistManager } from "../../lib/watchlist";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../ui/Tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";

interface CryptoModalProps {
  coin: CryptoCoin | null;
  isOpen: boolean;
  onClose: () => void;
  onWatchlistChange?: () => void;
}

export function CryptoModal({
  coin,
  isOpen,
  onClose,
  onWatchlistChange,
}: CryptoModalProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [priceHistory, setPriceHistory] = useState<CoinPriceHistory | null>(
    null
  );
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const chartColors = {
    dark: {
      text: "#f8fafc",
      background: "#0f172a",
      cardBg: "#1e293b",
      border: "#334155",
      grid: "#2d3748",
      line: "#4ade80",
      tooltipBg: "#1e293b",
      tooltipBorder: "#3b82f6",
      tooltipText: "#f8fafc",
      positive: "#4ade80",
      negative: "#f87171"
    },
    light: {
      text: "#1e293b",
      background: "#ffffff",
      cardBg: "#f8fafc",
      border: "#e2e8f0",
      grid: "#e2e8f0",
      line: "#10b981",
      tooltipBg: "#ffffff",
      tooltipBorder: "#e2e8f0",
      tooltipText: "#1e293b",
      positive: "#10b981",
      negative: "#ef4444"
    },
  };

  const currentColors = chartColors[theme === "dark" ? "dark" : "light"];
  const isPositive = coin?.price_change_percentage_24h ? coin.price_change_percentage_24h >= 0 : false;

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
    } catch (error: any) {

      const samplePrices = Array.from({ length: 24 }, (_, i) => [
        Date.now() - (24 - i) * 3600000,
        Math.random() * 10000 + 50000,
      ]) as [number, number][];

      setPriceHistory({
        prices: samplePrices,
        market_caps: samplePrices.map(([time, price]) => [
          time,
          price * 1000000,
        ]),
        total_volumes: samplePrices.map(([time, price]) => [
          time,
          price * 50000,
        ]),
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
    toast.success(`${coin.name} has been ${
      newStatus ? "added to" : "removed from"
    } your watchlist`);
  };

  if (!coin) return null;

  const chartData =
  priceHistory?.prices.map((price) => {
    const dateObj = new Date(price[0]);
    let formattedDate;

    if (selectedPeriod === 1) {
      formattedDate = dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (selectedPeriod <= 7) {
      formattedDate = dateObj.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    } else {
      formattedDate = dateObj.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    return {
      date: formattedDate,
      price: price[1],
    };
  }) || [];


  interface ChartDataPoint {
    date: string;
    price: number;
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ChartDataPoint }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div 
        className="p-3 rounded-lg shadow-lg border"
        style={{
          backgroundColor: currentColors.tooltipBg,
          borderColor: currentColors.tooltipBorder,
          color: currentColors.tooltipText
        }}
      >
        <p className="font-medium text-sm">{data.date}</p>
        <p className="mt-1">
          <span className="opacity-80">Price: </span>
          <span className="font-semibold">
            $
            {data.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })}
          </span>
        </p>
      </div>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-[700px] p-0 overflow-hidden"
        style={{
          backgroundColor: currentColors.background,
          borderColor: currentColors.border
        }}
        onInteractOutside={onClose}
      >
        <DialogHeader 
          className="px-6 pt-6 pb-4 border-b"
          style={{ borderColor: currentColors.border }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src={coin.image}
                alt={coin.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {coin.name}{" "}
                  <span className="text-muted-foreground">
                    ({coin.symbol.toUpperCase()})
                  </span>
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    $
                    {coin.current_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm flex items-center px-2 py-1 rounded"
                      style={{
                        backgroundColor: isPositive 
                          ? `${currentColors.positive}20` 
                          : `${currentColors.negative}20`,
                        color: isPositive 
                          ? currentColors.positive 
                          : currentColors.negative
                      }}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 mr-1" />
                      )}
                      {Math.abs(
                        coin.price_change_percentage_24h
                      ).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWatchlistToggle}
                className={cn(
                  "h-9 w-9 rounded-full",
                  isInWatchlist
                    ? "text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Star
                  className={cn(
                    "h-5 w-5",
                    isInWatchlist && "fill-current"
                  )}
                />
                {isInWatchlist ? "Remove" : "Add"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs
            defaultValue="7"
            onValueChange={(value) => setSelectedPeriod(Number(value))}
            className="mb-6"
          >
            <TabsList 
              className="grid w-full grid-cols-4 p-1 h-auto"
              style={{
                backgroundColor: `${currentColors.cardBg}80`,
                borderColor: currentColors.border
              }}
            >
              <TabsTrigger value="1">24h</TabsTrigger>
              <TabsTrigger value="7">7d</TabsTrigger>
              <TabsTrigger value="30">30d</TabsTrigger>
              <TabsTrigger value="90">90d</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="priceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={currentColors.line}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="100%"
                        stopColor={currentColors.line}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={currentColors.grid}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={currentColors.text}
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    stroke={currentColors.text}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={currentColors.line}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      stroke: currentColors.line,
                      strokeWidth: 2,
                      fill: currentColors.background,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div 
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: currentColors.cardBg,
                borderColor: currentColors.border
              }}
            >
              <div className="text-sm opacity-80 mb-1">Market Cap</div>
              <div className="font-semibold">
                ${coin.market_cap.toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </div>
            </div>
            <div 
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: currentColors.cardBg,
                borderColor: currentColors.border
              }}
            >
              <div className="text-sm opacity-80 mb-1">24h Trading Volume</div>
              <div className="font-semibold">
                ${coin.total_volume.toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
