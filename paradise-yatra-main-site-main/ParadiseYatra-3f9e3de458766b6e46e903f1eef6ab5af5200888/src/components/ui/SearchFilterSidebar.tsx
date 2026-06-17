"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SearchFilterSidebarProps {
    durationFilter: string;
    setDurationFilter: (value: string) => void;
    priceFilter: string;
    setPriceFilter: (value: string) => void;
    onClearFilters: () => void;
    onClose?: () => void;
    onApply?: () => void;
}

const SearchFilterSidebar: React.FC<SearchFilterSidebarProps> = ({
    durationFilter,
    setDurationFilter,
    priceFilter,
    setPriceFilter,
    onClearFilters,
    onClose,
    onApply,
}) => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-6 pb-4 flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="!text-xl !font-bold !text-[#000945]">Filters</h2>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto px-6">
                {/* Duration Filter */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-5 bg-gradient-to-b from-[#155dfc] to-[#000945] rounded-full"></div>
                        <Label className="!text-base !font-bold !text-slate-800 !tracking-wide">Duration</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: "any", value: "all", label: "Any" },
                            { id: "1-3", value: "1-3", label: "1-3 Days" },
                            { id: "4-6", value: "4-6", label: "4-6 Days" },
                            { id: "7-9", value: "7-9", label: "7-9 Days" },
                            { id: "10-12", value: "10-12", label: "10-12 Days" },
                            { id: "13+", value: "13+", label: "13+ Days" },
                        ].map((opt) => {
                            const isActive = durationFilter === opt.value;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setDurationFilter(opt.value)}
                                    className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-300 border ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-[#155dfc] to-[#005beb] text-white border-transparent shadow-md shadow-[#155dfc]/30' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#155dfc] hover:text-[#155dfc] hover:bg-blue-50/50'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price Filter */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-5 bg-gradient-to-b from-[#155dfc] to-[#000945] rounded-full"></div>
                        <Label className="!text-base !font-bold !text-slate-800 !tracking-wide">Price</Label>
                    </div>
                    <div className="flex flex-col gap-2">
                        {[
                            { id: "any", value: "all", label: "Any" },
                            { id: "0-10000", value: "0-10000", label: "₹ 0 - ₹ 10,000" },
                            { id: "10000-20000", value: "10000-20000", label: "₹ 10,000 - ₹ 20,000" },
                            { id: "20000-35000", value: "20000-35000", label: "₹ 20,000 - ₹ 35,000" },
                            { id: "35000-50000", value: "35000-50000", label: "₹ 35,000 - ₹ 50,000" },
                            { id: "50000+", value: "50000+", label: "₹ 50,000+" },
                        ].map((opt) => {
                            const isActive = priceFilter === opt.value;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setPriceFilter(opt.value)}
                                    className={`px-5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all duration-300 border ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-[#155dfc] to-[#005beb] text-white border-transparent shadow-md shadow-[#155dfc]/30 pl-6' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#155dfc] hover:text-[#155dfc] hover:bg-blue-50/50 hover:pl-6'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="p-6 pt-4 flex-shrink-0 border-t border-slate-200 flex flex-col gap-3">
                <Button
                    variant="outline"
                    className="w-full !text-sm !text-[#155dfc] !font-bold !border !border-[#dfe1df] !shadow-none hover:!bg-slate-50 transition-colors !cursor-pointer"
                    onClick={onClearFilters}
                >
                    Clear All Filters
                </Button>
                {onApply && (
                    <Button
                        className="w-full !text-sm !font-bold bg-[#314594] hover:bg-[#253675] text-white lg:hidden rounded-[6px] shadow-none"
                        onClick={onApply}
                    >
                        Apply Filters
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SearchFilterSidebar;
