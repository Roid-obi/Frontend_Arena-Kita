"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Cari..." }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="flex items-center border rounded-md px-3 py-2 bg-white">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 ml-2 outline-none text-sm"
        />
        {value && (
          <button onClick={() => onChange("")} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
