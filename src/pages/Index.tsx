import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Star, RefreshCw } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { coinGeckoAPI, type CryptoCoin } from "../lib/api";
import { FilterOptions, FilterPanel } from "../components/crpto/FilterPanel";
import { WatchlistManager } from "../lib/watchlist";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SearchBar } from "../components/crpto/SearchBar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";
import { CryptoCard } from "../components/crpto/CryptoCard";
import { WatchlistPanel } from "../components/crpto/WatchlisPanel";
import { CryptoModal } from "../components/crpto/CryptoModal";
import { ThemeToggle } from "../components/ThemeToggle";
import { FullPageLoader } from "../components/ui/FullPageLoader";

const Index = () => {
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [watchlistCoins, setWatchlistCoins] = useState<CryptoCoin[]>([]);
  const [activeTab, setActiveTab] = useState("market");
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleCoinClick = useCallback((coin: CryptoCoin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  }, []);
  
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "rank",
    sortOrder: "asc",
  });
 

  const debouncedSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setIsSearching(!!query);
    },
    []
  );

  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSearching]);

  const {
    data: topCoins,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["topCoins"],
    queryFn: () => coinGeckoAPI.getTopCoins(100), 
    refetchInterval: 60000,
    retry: 3,
  });

  const filteredAndSortedCoins = useMemo(() => {
    if (!topCoins) return [];

    let filtered = topCoins;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
    }

    filtered = filtered.filter((coin: {
        current_price: number;
        market_cap_rank: number;
        market_cap: number;
        price_change_percentage_24h: number;
      }) => {
        if (
          filters.priceMin !== undefined &&
          coin.current_price < filters.priceMin
        )
          return false;
        if (
          filters.priceMax !== undefined &&
          coin.current_price > filters.priceMax
        )
          return false;

        if (
          filters.rankMin !== undefined &&
          coin.market_cap_rank < filters.rankMin
        )
          return false;
        if (
          filters.rankMax !== undefined &&
          coin.market_cap_rank > filters.rankMax
        )
          return false;

        if (
          filters.marketCapMin !== undefined &&
          coin.market_cap < filters.marketCapMin
        )
          return false;
        if (
          filters.marketCapMax !== undefined &&
          coin.market_cap > filters.marketCapMax
        )
          return false;

        return true;
      }
    );

    filtered.sort(
      (
        a: {
          current_price: number;
          market_cap: number;
          total_volume: number;
          market_cap_rank: number;
        },
        b: {
          current_price: number;
          market_cap: number;
          total_volume: number;
          market_cap_rank: number;
        }
      ) => {
        let aValue: number, bValue: number;

        switch (filters.sortBy) {
          case "price":
            aValue = a.current_price;
            bValue = b.current_price;
            break;
          case "market_cap":
            aValue = a.market_cap;
            bValue = b.market_cap;
            break;
          case "volume":
            aValue = a.total_volume;
            bValue = b.total_volume;
            break;
          default: 
            aValue = a.market_cap_rank;
            bValue = b.market_cap_rank;
        }

        return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
    );

    return filtered;
  }, [topCoins, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceMin !== undefined) count++;
    if (filters.priceMax !== undefined) count++;
    if (filters.rankMin !== undefined) count++;
    if (filters.rankMax !== undefined) count++;
    if (filters.marketCapMin !== undefined) count++;
    if (filters.marketCapMax !== undefined) count++;
    if (filters.sortBy !== "rank" || filters.sortOrder !== "asc") count++;
    return count;
  }, [filters]);

  useEffect(() => {
    loadWatchlistCoins();
  }, [filteredAndSortedCoins]);

  const loadWatchlistCoins = async () => {
    if (!filteredAndSortedCoins.length) return;

    const watchlistIds = WatchlistManager.getWatchlist();
    const watchlist = filteredAndSortedCoins.filter((coin: { id: any }) =>
      watchlistIds.includes(coin.id)
    );
    setWatchlistCoins(watchlist);
  };



  const handleCloseModal = useCallback(() => {
    setSelectedCoin(null);
    setIsModalOpen(false);
  }, []);

  const handleWatchlistChange = () => {
    loadWatchlistCoins();
    toast({
      title: "Watchlist Updated",
      description: "Your watchlist has been updated successfully",
    });
  };

  const handleRemoveFromWatchlist = (coinId: string) => {
    setWatchlistCoins((prev) => prev.filter((coin) => coin.id !== coinId));
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Data",
      description: "Cryptocurrency data is being updated",
    });
  };

  const handleFilterChange = async (newFilters: FilterOptions) => {
    setIsFiltering(true);
    setFilters(newFilters);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsFiltering(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center bg-gradient-card">
          <div className="text-destructive mb-4">
            <TrendingUp className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Unable to Load Data
          </h2>
          <p className="text-muted-foreground mb-4">
            There was an error fetching cryptocurrency data. Please try again.
          </p>
          <Button onClick={handleRefresh} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const showLoader = isLoading || isFiltering;

  if (showLoader) {
    return (
      <FullPageLoader
        text={
          isLoading ? "Loading market data..." : 
          isFiltering ? "Applying filters..." : 
          "Searching..."
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  CryptoTracker
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                  Real-time cryptocurrency dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <SearchBar
                onSelectCoin={handleCoinClick}
                className="w-64 lg:w-80 hidden md:block"
              />
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2 hidden sm:flex"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden lg:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="sm:hidden p-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <SearchBar onSelectCoin={handleCoinClick} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-secondary border border-border/50 w-full sm:w-auto">
            <TabsTrigger
              value="market"
              className="gap-2 flex-1 sm:flex-initial"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Market Overview</span>
              <span className="sm:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger
              value="watchlist"
              className="gap-2 flex-1 sm:flex-initial"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">
                Watchlist ({watchlistCoins.length})
              </span>
              <span className="sm:hidden">Watch ({watchlistCoins.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-4">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
            />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedCoins.length} of{" "}
                {topCoins?.length || 0} cryptocurrencies
              </p>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card
                    key={i}
                    className="p-4 sm:p-6 bg-gradient-card animate-pulse"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="w-24 h-3 sm:h-4 bg-secondary rounded"></div>
                          <div className="w-16 h-2 sm:h-3 bg-secondary rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-32 h-5 sm:h-6 bg-secondary rounded"></div>
                        <div className="w-20 h-3 sm:h-4 bg-secondary rounded"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedCoins.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No cryptocurrencies match your current filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ sortBy: 'rank', sortOrder: 'asc' })}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredAndSortedCoins.map((coin: CryptoCoin) => (
                  <CryptoCard
                    key={coin.id}
                    coin={coin}
                    onClick={() => handleCoinClick(coin)}
                    onWatchlistChange={handleWatchlistChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="watchlist">
            <WatchlistPanel
              watchlistCoins={watchlistCoins}
              onCoinClick={handleCoinClick}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
            />
          </TabsContent>
        </Tabs>
      </main>

      {selectedCoin && (
        <CryptoModal
          coin={selectedCoin} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          onWatchlistChange={handleWatchlistChange}
        />
      )}
    </div>
  );
};

export default Index;
