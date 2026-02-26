"use client";
import { useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

/**
 * Simple search input that debounces user input to avoid too many state
 * updates. When the value changes the parent is notified via onChange.
 */
export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [internal, setInternal] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => {
      onChange(internal);
    }, 300);
    return () => clearTimeout(id);
  }, [internal]);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  return (
    <input
      type="search"
      className="w-full p-2 border rounded mt-4"
      placeholder="Search transcript..."
      value={internal}
      onChange={(e) => setInternal(e.target.value)}
    />
  );
}