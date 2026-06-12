"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart, ArrowRight } from "lucide-react";
import React from "react";
import { getImageUrl } from "@/lib/utils";

interface PackageCardProps {
    id: string | number;
    destination: string;
    duration: string;
    title: string;
    price: number;
    image: string;
    imageAlt?: string;
    slug: string;
    hrefPrefix: string;
    themeColor: string; // e.g., "#ff1493" or "#005beb"
    priceLabel: string; // e.g., "Per Couple" or "Per Person"
    isInWishlist: boolean;
    onWishlistToggle: (e: React.MouseEvent, pkgId: string) => void;
    showDestination?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({
    id,
    destination,
    duration,
    title,
    price,
    image,
    imageAlt,
    slug,
    hrefPrefix,
    themeColor,
    priceLabel,
    isInWishlist,
    onWishlistToggle,
    showDestination = true
}) => {
    const optimizedImage =
        getImageUrl(image, {
            width: "auto",
            height: 600,
            crop: "fill",
            gravity: "auto",
            quality: "good",
        }) || image;
    const altText = imageAlt?.trim() || title || destination || "Package image";

    return (
        <Link href={`${hrefPrefix}/${slug}`} className="block flex-shrink-0">
            <article
                className="group relative w-[280px] h-[420px] rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 cursor-pointer"
                style={{ "--theme-color": themeColor } as React.CSSProperties}
            >
                {/* Background Image */}
                <Image
                    src={optimizedImage}
                    alt={altText}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Dark Gradient Overlay for Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Wishlist Button */}
                <button
                    onClick={(e) => onWishlistToggle(e, String(id))}
                    className="absolute top-4 right-4 z-40 p-2.5 rounded-full backdrop-blur-md bg-white/20 border border-white/30 hover:bg-white/40 transition-all shadow-lg group/heart"
                >
                    <Heart
                        className="w-4 h-4 transition-transform group-hover/heart:scale-110"
                        style={{
                            color: "white",
                            fill: isInWishlist ? themeColor : "none"
                        }}
                    />
                </button>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                    {/* Header */}
                    <div className="transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                        {showDestination && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full backdrop-blur-sm bg-white/10 border border-white/20">
                                <MapPin className="h-3 w-3 text-white" />
                                <span className="text-[10px] font-bold tracking-widest uppercase text-white">{destination}</span>
                            </div>
                        )}
                        <h4 className="text-xl font-bold leading-tight text-white mb-4 line-clamp-2 drop-shadow-md">
                            {title}
                        </h4>
                    </div>

                    {/* Glass Details Pane */}
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 transform transition-all duration-500 translate-y-4 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-white/15">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Duration</span>
                                <span className="text-sm font-semibold text-white flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}></div>
                                    {duration}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Price</span>
                                <span className="text-lg font-black text-white mt-0.5 drop-shadow-lg">
                                    ₹{price.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/70 tracking-wide font-medium">{priceLabel}</span>
                            <div 
                                className="text-xs font-bold text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
                                style={{ backgroundColor: `${themeColor}cc` }}
                            >
                                Explore <ArrowRight className="h-3 w-3" />
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default PackageCard;

