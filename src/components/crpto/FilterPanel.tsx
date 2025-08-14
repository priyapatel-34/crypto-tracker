import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Lable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";

export interface FilterOptions {
  priceMin?: number;
  priceMax?: number;
  rankMin?: number;
  rankMax?: number;
  marketCapMin?: number;
  marketCapMax?: number;
  sortBy: "rank" | "price" | "market_cap";
  sortOrder: "asc" | "desc";
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  activeFilterCount: number;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  activeFilterCount,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const updateLocalFilter = (key: keyof FilterOptions, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const clearAllFilters = () => {
    const reset: FilterOptions = {
      sortBy: "rank",
      sortOrder: "asc",
    };
    setLocalFilters(reset);
    onFiltersChange(reset);
    setOpen(false);
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters & Sorting
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-4">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Field</Label>
              <Select
                value={localFilters.sortBy}
                onValueChange={(value) => updateLocalFilter("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900">
                  <SelectItem value="rank">Market Cap Rank</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="market_cap">Market Cap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Order</Label>
              <Select
                value={localFilters.sortOrder}
                onValueChange={(value) => updateLocalFilter("sortOrder", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900">
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Min Price</Label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.priceMin || ""}
                onChange={(e) =>
                  updateLocalFilter("priceMin", parseFloat(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Max Price</Label>
              <Input
                type="number"
                placeholder="∞"
                value={localFilters.priceMax || ""}
                onChange={(e) =>
                  updateLocalFilter("priceMax", parseFloat(e.target.value))
                }
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={applyFilters}
              className="bg-green-500 dark:bg-green-600 text-white flex-1  font-medium rounded-lg transition-colors "
            >
              Apply
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="bg-red-500 dark:bg-red-600 text-white flex-1  font-medium rounded-lg transition-colors "
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
