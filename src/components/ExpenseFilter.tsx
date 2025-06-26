
import { useState } from 'react';
import { Search, Filter, Calendar, Tag, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Expense } from '@/types/Expense';

interface ExpenseFilterProps {
  expenses: Expense[];
  onFilteredExpenses: (filtered: Expense[]) => void;
}

export const ExpenseFilter = ({ expenses, onFilteredExpenses }: ExpenseFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'category' | 'tag' | 'date'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const categories = [...new Set(expenses.map(e => e.category))];
  const allTags = [...new Set(expenses.flatMap(e => e.tags || []))];

  const applyFilters = () => {
    let filtered = expenses;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(expense =>
        expense.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (activeFilter === 'category' && selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Tag filter
    if (activeFilter === 'tag' && selectedTag) {
      filtered = filtered.filter(expense => expense.tags?.includes(selectedTag));
    }

    // Date filter
    if (activeFilter === 'date' && (dateRange.start || dateRange.end)) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;
        
        if (start && end) {
          return expenseDate >= start && expenseDate <= end;
        } else if (start) {
          return expenseDate >= start;
        } else if (end) {
          return expenseDate <= end;
        }
        return true;
      });
    }

    onFilteredExpenses(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setSelectedCategory('');
    setSelectedTag('');
    setDateRange({ start: '', end: '' });
    onFilteredExpenses(expenses);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Apply search immediately
    setTimeout(applyFilters, 300);
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setActiveFilter('all');
            setTimeout(applyFilters, 100);
          }}
        >
          All
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilter === 'category' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('category')}
            >
              <Tag className="w-3 h-3 mr-1" />
              Category
              {selectedCategory && <Badge className="ml-1 px-1 py-0 text-xs">{selectedCategory}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedCategory('');
                  setTimeout(applyFilters, 100);
                }}
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedCategory(category);
                    setTimeout(applyFilters, 100);
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilter === 'tag' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('tag')}
            >
              <Filter className="w-3 h-3 mr-1" />
              Tags
              {selectedTag && <Badge className="ml-1 px-1 py-0 text-xs">{selectedTag}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedTag('');
                  setTimeout(applyFilters, 100);
                }}
              >
                All Tags
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedTag(tag);
                    setTimeout(applyFilters, 100);
                  }}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilter === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('date')}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">From</label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, start: e.target.value }));
                    setTimeout(applyFilters, 100);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium">To</label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, end: e.target.value }));
                    setTimeout(applyFilters, 100);
                  }}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {(searchQuery || activeFilter !== 'all' || selectedCategory || selectedTag || dateRange.start || dateRange.end) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
