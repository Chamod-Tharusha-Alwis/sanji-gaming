import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

export default function TagInput({ tags = [], onChange, suggestions = [] }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(s)
  );

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-cyan/10 border 
                         border-accent-cyan/20 rounded-lg text-sm text-accent-cyan"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-red-400 transition-colors"
              >
                <HiX className="text-xs" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter to add..."
        className="input-gaming"
      />

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-1 bg-gaming-card border border-gaming-border 
                       rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-accent-cyan/10 
                           hover:text-accent-cyan transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
