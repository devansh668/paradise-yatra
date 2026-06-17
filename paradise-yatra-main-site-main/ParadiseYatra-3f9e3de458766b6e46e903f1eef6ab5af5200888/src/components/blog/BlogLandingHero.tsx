"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readTime: number;
  createdAt?: string;
  publishDate?: string;
  updatedAt?: string;
}

interface BlogLandingHeroProps {
  post: BlogPost | null;
  imageSrc: string;
  searchQuery: string;
  searchResults: Array<{
    id: string;
    href: string;
    title: string;
    excerpt: string;
  }>;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export default function BlogLandingHero({
  post,
  imageSrc,
  searchQuery,
  searchResults,
  resultCount,
  onSearchChange,
  onSearchSubmit,
  onImageError,
}: BlogLandingHeroProps) {
  const title = "Explore. Plan. Travel Better.";
  const excerpt =
    "Discover expert tips, local insights, and guides to make your journey unforgettable.";
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <section className="relative z-20 overflow-visible bg-white text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={post?.title || "Travel blog hero background"}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            onError={onImageError}
          />
          {/* New cleaner, subtle dark overlay */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>

      <div className="relative mx-auto flex min-h-[500px] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center md:min-h-[580px] md:px-6 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex w-full max-w-4xl flex-col items-center"
        >
          <h1 className="font-unbounded max-w-4xl !text-4xl !font-extrabold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-emerald-100 drop-shadow-lg md:!text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl !text-[16px] !font-medium !leading-[1.6] text-white drop-shadow-md md:!text-[18px]">
            {excerpt}
          </p>

          <div className="relative mt-10 w-full max-w-2xl">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSearchSubmit();
              }}
            >
              <label className="relative block w-full transition-all duration-300 focus-within:scale-[1.02]">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search articles, guides, and inspiration..."
                  className="h-14 w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-14 pr-24 text-[15px] text-white placeholder-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)] outline-none transition-all focus:border-white/40 focus:bg-white/20 focus:outline-none focus:ring-0"
                />
                {hasQuery && (
                  <span className="pointer-events-none absolute right-4 top-1/2 inline-flex -translate-y-1/2 rounded-full border border-white/20 bg-white/20 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
                    {resultCount} result{resultCount === 1 ? "" : "s"}
                  </span>
                )}
              </label>
            </form>

            {hasQuery && (
              <div className="absolute left-0 right-0 top-full z-20 mt-3 overflow-hidden rounded-[20px] border border-white/70 bg-white/95 text-[#000945] shadow-[0_20px_60px_rgba(0,9,69,0.15)] backdrop-blur-2xl text-left">
                {searchResults.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between border-b border-[#e8ecf6] px-5 py-4">
                      <p className="!m-0 !text-[12px] !font-bold uppercase tracking-[0.15em] text-[#4a5b88]">
                        Matching Articles
                      </p>
                      <button
                        type="button"
                        onClick={onSearchSubmit}
                        className="cursor-pointer text-[12px] font-bold uppercase tracking-[0.1em] text-[#155dfc] transition hover:text-[#000945]"
                      >
                        View all &rarr;
                      </button>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto p-2">
                      {searchResults.map((result) => (
                        <Link
                          key={result.id}
                          href={result.href}
                          className="block rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-[#f5f7ff] hover:pl-5"
                        >
                          <h3 className="line-clamp-2 !text-[15px] !font-semibold !leading-[1.4] !text-[#000945]">
                            {result.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 !text-[13px] !leading-relaxed !text-[#556381]">
                            {result.excerpt}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="!m-0 !text-[15px] !font-semibold !text-[#000945]">
                      No matching articles found.
                    </p>
                    <p className="mt-2 !text-[13px] !leading-relaxed !text-[#556381]">
                      Try adjusting your keywords to find what you're looking for.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
