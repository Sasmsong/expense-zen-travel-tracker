
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
}

const DEFAULT_TAGS = [
  "Business", "Personal", "Client Dinner", "Refund Pending", 
  "Reimbursable", "Tax Deductible", "Conference", "Team Lunch"
];

export const TagInput = ({ tags, onTagsChange, suggestions = DEFAULT_TAGS }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      !tags.includes(suggestion) && 
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X 
              className="w-3 h-3 cursor-pointer" 
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyPress={handleKeyPress}
          placeholder="Add tags..."
          onFocus={() => setShowSuggestions(true)}
        />
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto">
            {filteredSuggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {inputValue && (
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={() => addTag(inputValue)}
          className="w-full"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add "{inputValue}"
        </Button>
      )}
    </div>
  );
};
