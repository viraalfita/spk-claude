"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Vendor {
  vendor_name: string;
  vendor_email: string | null;
  vendor_phone: string | null;
}

interface VendorAutocompleteProps {
  value: string;
  onChange: (vendor: Vendor) => void;
  vendors: Vendor[];
}

export function VendorAutocomplete({
  value,
  onChange,
  vendors,
}: VendorAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
    // If value is set externally and matches a vendor, mark as selected
    if (value) {
      const matchedVendor = vendors.find(v => v.vendor_name === value);
      if (matchedVendor) {
        setIsSelected(true);
        setSelectedVendor(matchedVendor);
      }
    }
  }, [value, vendors]);

  useEffect(() => {
    // Only filter and show dropdown when not selected
    if (!isSelected && inputValue) {
      const filtered = vendors.filter((v) =>
        v.vendor_name.toLowerCase().includes(inputValue.toLowerCase()),
      );
      setFilteredVendors(filtered);
      setIsOpen(filtered.length > 0 && inputValue.length > 0);
    } else {
      setFilteredVendors([]);
      setIsOpen(false);
    }
  }, [inputValue, vendors, isSelected]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsSelected(false);
    setSelectedVendor(null);
    // Notify parent of name change only
    onChange({
      vendor_name: newValue,
      vendor_email: null,
      vendor_phone: null,
    });
  };

  const handleSelectVendor = (vendor: Vendor) => {
    setInputValue(vendor.vendor_name);
    setIsOpen(false);
    setIsSelected(true);
    setSelectedVendor(vendor);
    onChange(vendor);
  };

  const handleClearSelection = () => {
    setInputValue("");
    setIsSelected(false);
    setSelectedVendor(null);
    onChange({
      vendor_name: "",
      vendor_email: null,
      vendor_phone: null,
    });
  };

  // Show selected vendor display when a vendor is selected
  if (isSelected && selectedVendor) {
    return (
      <div ref={wrapperRef}>
        <Label htmlFor="vendorName">Vendor Name *</Label>
        <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex-1">
            <div className="font-medium">{selectedVendor.vendor_name}</div>
            {selectedVendor.vendor_email && (
              <div className="text-sm text-gray-600">
                {selectedVendor.vendor_email}
              </div>
            )}
            {selectedVendor.vendor_phone && (
              <div className="text-xs text-gray-500">
                {selectedVendor.vendor_phone}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear selection</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Label htmlFor="vendorName">
        Vendor Name *
        <span className="text-xs text-gray-500 font-normal ml-2">
          (Type to search history)
        </span>
      </Label>
      <Input
        id="vendorName"
        name="vendorName"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (inputValue && filteredVendors.length > 0) {
            setIsOpen(true);
          }
        }}
        required
        placeholder="PT Vendor Jaya"
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen && filteredVendors.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredVendors.map((vendor, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectVendor(vendor)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              <div className="font-medium">{vendor.vendor_name}</div>
              {vendor.vendor_email && (
                <div className="text-sm text-gray-600">
                  {vendor.vendor_email}
                </div>
              )}
              {vendor.vendor_phone && (
                <div className="text-xs text-gray-500">
                  {vendor.vendor_phone}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Show hint if no results */}
      {isOpen && filteredVendors.length === 0 && inputValue && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-2 text-sm text-gray-500">
          No previous vendors found. New vendor will be created.
        </div>
      )}
    </div>
  );
}
