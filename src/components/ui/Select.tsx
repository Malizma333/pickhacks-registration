"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
}

const MAX_VISIBLE_OPTIONS = 50;

export function Select({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  className = "",
  disabled = false,
  searchable = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Filter and limit options for performance
  const displayOptions = useMemo(() => {
    if (!searchable) {
      return options.slice(0, MAX_VISIBLE_OPTIONS);
    }

    if (!searchTerm) {
      // Show first N options when no search term
      return options.slice(0, MAX_VISIBLE_OPTIONS);
    }

    // Filter by search term and limit results
    const searchLower = searchTerm.toLowerCase();
    const filtered: SelectOption[] = [];

    for (const opt of options) {
      if (opt.label.toLowerCase().includes(searchLower)) {
        filtered.push(opt);
        if (filtered.length >= MAX_VISIBLE_OPTIONS) break;
      }
    }

    return filtered;
  }, [options, searchTerm, searchable]);

  const hasMoreOptions = useMemo(() => {
    if (!searchTerm) {
      return options.length > MAX_VISIBLE_OPTIONS;
    }
    // Check if there are more filtered results
    const searchLower = searchTerm.toLowerCase();
    let count = 0;
    for (const opt of options) {
      if (opt.label.toLowerCase().includes(searchLower)) {
        count++;
        if (count > MAX_VISIBLE_OPTIONS) return true;
      }
    }
    return false;
  }, [options, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (e.key === "Enter" && displayOptions.length > 0) {
      e.preventDefault();
      handleSelect(displayOptions[0]!.value);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input for form validation */}
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
      />

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-base transition-all duration-200 focus:border-[#44ab48] focus:outline-none focus:ring-4 focus:ring-[#44ab48]/10 focus:bg-white hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen ? "border-[#44ab48] ring-4 ring-[#44ab48]/10 bg-white" : ""
        }`}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <svg
          className={`absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search..."
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#44ab48] focus:outline-none focus:ring-2 focus:ring-[#44ab48]/20"
              />
            </div>
          )}

          {/* Options list */}
          <ul className="max-h-60 overflow-y-auto py-1">
            {displayOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">
                No options found
              </li>
            ) : (
              <>
                {displayOptions.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                        option.value === value
                          ? "bg-[#e8f4e5] text-[#44ab48] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
                {hasMoreOptions && (
                  <li className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
                    Type to search for more options...
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
