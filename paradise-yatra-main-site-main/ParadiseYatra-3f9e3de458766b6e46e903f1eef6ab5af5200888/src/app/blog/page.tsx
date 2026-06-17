"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import BlogLandingHero from "@/components/blog/BlogLandingHero";
import { BLOG_CARD_IMAGE_OPTIONS, BLOG_HERO_IMAGE_OPTIONS } from "@/lib/blogImageOptions";
import { getImageUrl as getOptimizedImageUrl } from "@/lib/utils";

interface BlogPost {
  _id: string;
  slug?: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image: string;
  category: string;
  readTime: number;
  views: number;
  likes: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  publishDate?: string;
  updatedAt?: string;
}

interface HeroSearchResult {
  id: string;
  href: string;
  title: string;
  excerpt: string;
}

const HERO_FALLBACK_IMAGE = "/images/placeholder-travel.jpg";
const HERO_BACKGROUND_IMAGE = "/Blog/Hero/brandon-atchison-ySt4U0bnDO0-unsplash.jpg";

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const getPostSlug = (post: BlogPost): string => {
  return post.slug || generateSlug(post.title);
};

type BlogImageVariant = "hero" | "card";

const getImageUrl = (
  image: string | undefined,
  variant: BlogImageVariant = "card"
): string =>
  getOptimizedImageUrl(
    image || null,
    variant === "hero" ? BLOG_HERO_IMAGE_OPTIONS : BLOG_CARD_IMAGE_OPTIONS
  ) || HERO_FALLBACK_IMAGE;

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, " ");

const getSearchExcerpt = (post: BlogPost): string =>
  stripHtml(post.excerpt || post.content || "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const handleImageError = (
    postId: string,
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = event.target as HTMLImageElement;
    target.src = HERO_FALLBACK_IMAGE;
    setImageErrors((prev) => new Set(prev).add(postId));
  };

  const handleHeroImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = event.target as HTMLImageElement;
    target.src = HERO_FALLBACK_IMAGE;
  };

  const getSafeImageUrl = (
    post: BlogPost | null,
    variant: BlogImageVariant = "card"
  ): string => {
    if (!post) {
      return HERO_FALLBACK_IMAGE;
    }

    if (imageErrors.has(post._id)) {
      return HERO_FALLBACK_IMAGE;
    }

    return getImageUrl(post.image, variant);
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const fetchBlogs = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);

        let response;
        try {
          response = await fetch("/api/blogs?published=true&limit=24", {
            signal: controller.signal,
            cache: "no-store",
          });
          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            if (isMounted) {
              console.warn("Blog fetch timed out");
              setError("Request timeout - please refresh the page");
              setBlogPosts([]);
              setLoading(false);
            }
            return;
          }
          throw fetchError;
        }

        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();

        let blogsArray: BlogPost[] = [];
        if (Array.isArray(data)) {
          blogsArray = data;
        } else if (data.blogs && Array.isArray(data.blogs)) {
          blogsArray = data.blogs;
        }

        blogsArray.sort((a, b) => {
          const dateA = new Date(
            a.publishDate || a.createdAt || a.updatedAt || 0
          ).getTime();
          const dateB = new Date(
            b.publishDate || b.createdAt || b.updatedAt || 0
          ).getTime();
          return dateB - dateA;
        });

        if (isMounted) {
          setBlogPosts(blogsArray);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError("Failed to load blogs");
          setBlogPosts([]);
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const query = normalizeText(deferredSearchQuery);

    return blogPosts.filter((post) => {
      if (!query) return true;

      const searchableText = normalizeText([post.title, getSearchExcerpt(post)].join(" "));

      return searchableText.includes(query);
    });
  }, [blogPosts, deferredSearchQuery]);

  const heroSearchResults = useMemo<HeroSearchResult[]>(() => {
    const query = normalizeText(deferredSearchQuery);
    if (!query) return [];

    return filteredPosts.slice(0, 6).map((post) => ({
      id: post._id,
      href: `/blog/${getPostSlug(post)}`,
      title: post.title,
      excerpt: getSearchExcerpt(post),
    }));
  }, [deferredSearchQuery, filteredPosts]);

  const latestPost = blogPosts[0] ?? null;
  const popularPosts = filteredPosts.slice(0, 4);
  const popularLeadPost = popularPosts[0] ?? null;
  const popularSidePosts = popularPosts.slice(1, 4);
  const featuredStripPosts = filteredPosts.filter(
    (post) => !popularPosts.some((popularPost) => popularPost._id === post._id)
  );

  const scrollToResults = () => {
    const resultsSection = document.getElementById("blog-results");
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) return <Loading size="lg" className="min-h-[400px]" />;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pb-16">
        <BlogLandingHero
          post={latestPost}
          imageSrc={HERO_BACKGROUND_IMAGE}
          searchQuery={searchQuery}
          searchResults={heroSearchResults}
          resultCount={filteredPosts.length}
          onSearchChange={setSearchQuery}
          onSearchSubmit={scrollToResults}
          onImageError={handleHeroImageError}
        />

        <section id="blog-results" className="relative z-10 pt-10 md:pt-14">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            {error && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {error}
              </div>
            )}

            {popularLeadPost ? (
              <section className="py-3 md:py-4">
                <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
                  <div className="md:pb-0.5">
                    <h2 className="font-unbounded !m-0 !text-[28px] !font-bold !leading-none tracking-tight text-[#000945] md:!text-[40px]">
                      Popular Articles
                    </h2>
                  </div>
                  <div className="max-w-[340px] md:pt-1.5">
                    <p className="!text-[14px] !leading-relaxed text-slate-500">
                      Browse standout stories, planning tips, and destination features curated from the Paradise Yatra journal.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-6 md:gap-10">
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="group"
                  >
                    <Link href={`/blog/${getPostSlug(popularLeadPost)}`} prefetch className="relative block aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-900 md:aspect-[21/9]">
                      {/* Blurred background to fill empty space without black bars */}
                      <Image
                        src={getSafeImageUrl(popularLeadPost, "hero")}
                        alt=""
                        fill
                        className="object-cover opacity-40 blur-2xl transition-transform duration-700 group-hover:scale-105"
                        sizes="100vw"
                      />
                      {/* Main image fully contained so text never gets cut off */}
                      <Image
                        src={getSafeImageUrl(popularLeadPost, "hero")}
                        alt={popularLeadPost.title}
                        fill
                        className="object-contain transition-transform duration-700 group-hover:scale-105"
                        sizes="100vw"
                        priority
                        onError={(event) =>
                          handleImageError(popularLeadPost._id, event)
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000945]/90 via-[#000945]/30 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-5 md:p-8 lg:p-12">
                        <div className="mb-3 md:mb-4">
                          <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] md:px-4 md:py-1.5 md:text-[13px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                            {popularLeadPost.category || "Featured"}
                          </span>
                        </div>
                        <h3 className="max-w-4xl !text-[22px] !font-bold !leading-[1.2] tracking-tight text-white drop-shadow-md md:!text-[36px] lg:!text-[44px]">
                          {popularLeadPost.title}
                        </h3>
                        <p className="mt-2 md:mt-4 max-w-2xl line-clamp-2 !text-[14px] md:!text-[16px] !leading-relaxed text-white/90 drop-shadow-sm lg:!text-[18px]">
                          {popularLeadPost.excerpt}
                        </p>
                      </div>
                    </Link>
                  </motion.article>
  
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
                    {popularSidePosts.map((post, index) => (
                      <motion.article
                        key={post._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.35 }}
                        className="group flex h-full flex-col"
                      >
                        <Link
                          href={`/blog/${getPostSlug(post)}`}
                          prefetch
                          className="flex flex-row lg:flex-col h-full rounded-2xl border border-slate-200 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 items-center lg:items-stretch gap-4 lg:gap-0"
                        >
                          <div className="relative aspect-square w-[100px] shrink-0 lg:mb-4 lg:aspect-[4/3] lg:w-full overflow-hidden rounded-xl bg-slate-100">
                            <Image
                              src={getSafeImageUrl(post)}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              sizes="(max-width: 1024px) 100px, 33vw"
                              onError={(event) => handleImageError(post._id, event)}
                            />
                            <div className="absolute left-3 top-3 hidden lg:block">
                              <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#000945] backdrop-blur-sm">
                                {post.category || "Travel"}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col lg:px-2 lg:pb-2">
                            <div className="mb-1 lg:hidden">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                                {post.category || "Travel"}
                              </span>
                            </div>
                            <h4 className="line-clamp-2 !text-[16px] lg:!text-[18px] !font-bold !leading-[1.3] lg:!leading-[1.4] text-[#000945] transition-colors group-hover:text-emerald-700">
                              {post.title}
                            </h4>
                            <p className="mt-1 lg:mt-2 line-clamp-2 !text-[13px] lg:!text-[14px] !leading-relaxed text-slate-500">
                              {post.excerpt}
                            </p>
                          </div>
                        </Link>
                      </motion.article>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#d9cfbb] bg-[#fbf8f1] px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2de]">
                  <Search className="h-8 w-8 text-[#718441]" />
                </div>
                <p className="!text-lg !font-medium text-[#2a301d]">
                  No articles found
                </p>
                <p className="mt-2 !text-sm text-[#7b705f]">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            {featuredStripPosts.length > 0 && (
              <section className="pt-12 md:pt-16">
                <div className="mb-6 md:mb-10">
                  <h3 className="font-unbounded !text-[28px] !font-bold !leading-none tracking-tight text-[#000945] md:!text-[40px]">
                    More Stories
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {featuredStripPosts.map((post, index) => (
                    <motion.article
                      key={post._id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.35 }}
                      className="group flex h-full flex-col"
                    >
                      <Link href={`/blog/${getPostSlug(post)}`} prefetch className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5">
                        <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                          <Image
                            src={getSafeImageUrl(post)}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            onError={(event) => handleImageError(post._id, event)}
                          />
                          <div className="absolute left-3 top-3">
                            <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#000945] backdrop-blur-sm">
                              {post.category || "Travel"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col px-1 pb-2">
                          <h4 className="line-clamp-2 !text-[18px] !font-bold !leading-[1.4] text-[#000945] transition-colors group-hover:text-emerald-700">
                            {post.title}
                          </h4>
                          
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500">
                              {new Date(
                                post.createdAt ||
                                  post.publishDate ||
                                  post.updatedAt ||
                                  new Date().toISOString()
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="flex items-center text-[13px] font-bold text-[#155dfc] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              Read <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </section>
            )}

          </div>
        </section>
      </main>
    </div>
  );
};

export default BlogPage;
