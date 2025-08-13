import { useState } from "react";
import { Card } from "../ui/Card";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Lable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/Collapsible";

export interface FilterOptions {
  priceMin?: number;
  priceMax?: number;
  rankMin?: number;
  rankMax?: number;
  marketCapMin?: number;
  marketCapMax?: number;
  sortBy: 'rank' | 'price' | 'market_cap' | 'change_24h' | 'volume';
  sortOrder: 'asc' | 'desc';
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  activeFilterCount: number;
}

export function FilterPanel({ filters, onFiltersChange, activeFilterCount }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sortBy: 'rank',
      sortOrder: 'asc'
    });
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Card className="bg-gradient-card border-border/50">
       <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters & Sorting</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-6">
            {/* Sorting */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Sort By</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Field</Label>
                  <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rank">Market Cap Rank</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="market_cap">Market Cap</SelectItem>
                      <SelectItem value="change_24h">24h Change</SelectItem>
                      <SelectItem value="volume">24h Volume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Order</Label>
                  <Select value={filters.sortOrder} onValueChange={(value: any) => updateFilter('sortOrder', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Price Range (USD)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Min Price</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin || ''}
                    onChange={(e: { target: { value: string; }; }) => updateFilter('priceMin', parseFloat(e.target.value))}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Max Price</Label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.priceMax || ''}
                    onChange={(e: { target: { value: string; }; }) => updateFilter('priceMax', parseFloat(e.target.value))}
                    className="bg-input"
                  />
                </div>
              </div>
            </div>  

            {/* Rank Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Market Cap Rank</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Min Rank</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={filters.rankMin || ''}
                    onChange={(e: { target: { value: string; }; }) => updateFilter('rankMin', parseInt(e.target.value))}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Max Rank</Label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.rankMax || ''}
                    onChange={(e: { target: { value: string; }; }) => updateFilter('rankMax', parseInt(e.target.value))}
                    className="bg-input"
                  />
                </div>
              </div>
            </div> 

            {/* Market Cap Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Market Cap (USD)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Min Market Cap</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.marketCapMin || ''}
                    onChange={(e: { target: { value: string; }; }) => updateFilter('marketCapMin', parseFloat(e.target.value))}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Max Market Cap</Label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.marketCapMax || ''}
                    onChange={(e: { target: { value: string; }; }) => updateFilter('marketCapMax', parseFloat(e.target.value))}
                    className="bg-input"
                  />
                </div>
              </div>
            </div>  

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            )}    
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}