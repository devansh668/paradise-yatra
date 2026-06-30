"use client";

import { Loader2, Clock, MapPin, Users, Calendar, Award, Shield, ArrowRight, ChevronDown, User, Phone, Mail, MessageSquare, Plus, Minus, Check, X, Plane, Utensils, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { normalizeRichTextHtml, preserveRichTextSpacing } from "@/lib/richText";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import CarouselArrows from "@/components/ui/CarouselArrows";
import { getImageUrl, getPackagePriceLabel, cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/context/AuthContext";
import PhoneInput from "react-phone-input-international";

interface DayItinerary {
  day: number;
  title: string;
  activities: string[];
  accommodation: string;
  meals: string;
  image: string;
}

interface Package {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  priceType?: "per_person" | "per_couple";
  originalPrice?: number;
  discount: number;
  duration: string;
  destination: string;
  category: string;
  images: string[];
  imageAlt?: string;
  highlights: string[];
  itinerary: DayItinerary[];
  inclusions: string[];
  exclusions: string[];
  rating: number;
  reviews: unknown[];
  isActive: boolean;
  isFeatured: boolean;
  holidayType?: string | {
    _id?: string;
    title?: string;
    slug?: string;
  };
  tags?: Array<string | {
    _id?: string;
    name?: string;
    slug?: string;
  }>;
  tourType?: "international" | "india";
  country?: string;
  state?: string;
  location?: string;
}

interface ItineraryPageClientProps {
  packageData: Package;
  slug: string;
}

const LeadCaptureForm = dynamic(() => import("@/components/LeadCaptureForm"), { ssr: false });
const LoginAlertModal = dynamic(() => import("@/components/LoginAlertModal"), { ssr: false });
const PackageCard = dynamic(() => import("@/components/ui/PackageCard"), { ssr: false });


const stripHtmlTags = (value: string = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const containsHtml = (value: string = ""): boolean => /<\/?[a-z][\s\S]*>/i.test(value);

interface BreadcrumbSource {
  label: string;
  href: string;
}

const toSlug = (value: string = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getDestinationBreadcrumb = (pkg: Package): BreadcrumbSource => {
  const locationValue = pkg.destination || pkg.location || pkg.state || pkg.country || "";
  const primaryLocation = locationValue.split(",")[0].trim();

  if (!primaryLocation) {
    return {
      label: "Packages",
      href: "/package",
    };
  }

  const areaSlug = toSlug(primaryLocation);
  const areaType = pkg.tourType === "international" ? "international" : "india";

  return {
    label: primaryLocation,
    href: `/package/${areaType}/${areaSlug}`,
  };
};

const getFallbackBreadcrumb = (pkg: Package): BreadcrumbSource => {
  if (pkg.category) {
    return {
      label: pkg.category,
      href: "/package",
    };
  }

  return getDestinationBreadcrumb(pkg);
};

const ItineraryPageClient = ({ packageData, slug }: ItineraryPageClientProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [otherPackages, setOtherPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [dynamicDescription, setDynamicDescription] = useState<string | null>(null);
  const [dynamicImage, setDynamicImage] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneDialCode, setPhoneDialCode] = useState('+91');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [numberOfDays, setNumberOfDays] = useState<number>(1);
  const [message, setMessage] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'includes' | 'highlights' | 'faqs' | 'guideline'>('overview');
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [breadcrumbSource, setBreadcrumbSource] = useState<BreadcrumbSource>(() => getFallbackBreadcrumb(packageData));
  const [stickyTop, setStickyTop] = useState(120);
  const [isPackageSaved, setIsPackageSaved] = useState(false);
  
  const toggleWishlist = (id: string) => {
    // Basic local state toggle. To persist, add API call here.
    setIsPackageSaved(prev => !prev);
  };

  const router = useRouter();
  const { user } = useAuth();
  
  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (!shareUrl) {
      setActionMessage({ type: "error", text: "Unable to copy the link right now." });
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setActionMessage({ type: "success", text: "Link copied. You can now share this package with ease." });
    } catch {
      setActionMessage({ type: "error", text: "Could not copy the link right now. Please try again in a moment." });
    }
  };

  const handleSave = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    toggleWishlist(packageData._id);
    setActionMessage({
      type: "success",
      text: isPackageSaved ? "Removed from your saved packages." : "Saved to your wishlist.",
    });
  };

  useEffect(() => {
    if (!actionMessage) return;
    const timeout = setTimeout(() => setActionMessage(null), 2600);
    return () => clearTimeout(timeout);
  }, [actionMessage]);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const updateStickyTop = () => {
      const height = header.getBoundingClientRect().height || 0;
      setStickyTop(Math.round(height + 16));
    };

    updateStickyTop();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateStickyTop);
      resizeObserver.observe(header);
    }

    window.addEventListener("resize", updateStickyTop);
    return () => {
      window.removeEventListener("resize", updateStickyTop);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const handleSubmitEnquiry = async () => {
    if (!fullName || !email || !phoneNumber || !message) {
      toast.error('Please fill in your name, email, phone number, and message.');
      return;
    }

    setIsSubmittingEnquiry(true);

    const travelDateStr = date ? format(date, "MMM dd, yyyy") : "Not specified";
    const enhancedMessage = `Travel Date: ${travelDateStr}\nDuration: ${numberOfDays} Days\nTravelers: ${adults} Adults, ${children} Children\n\nMessage:\n${message}`;
    const dialCodeDigits = phoneDialCode.replace(/\D/g, "");
    const formattedPhone = dialCodeDigits ? `${dialCodeDigits}${phoneNumber}` : phoneNumber;

    try {
      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone: formattedPhone,
          destination: packageData.destination?.split(',')[0].trim() || "Not specified",
          budget: packageData.price ? formatPrice(packageData.price) : "Not specified",
          message: enhancedMessage,
          packageTitle: packageData.title || "",
          packagePrice: packageData.price ? formatPrice(packageData.price) : "",
          newsletterConsent: false,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Enquiry sent successfully! We'll contact you soon.");
        setFullName('');
        setEmail('');
        setPhoneNumber('');
        setPhoneDialCode('+91');
        setMessage('');
        setDate(undefined);
        setAdults(2);
        setChildren(0);
        setNumberOfDays(1);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send enquiry. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while sending your enquiry.");
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const heroImageOptions = {
    width: 1400,
    height: 788,
    crop: "fill",
    gravity: "auto",
    quality: "good",
  } as const;

  const baseGalleryImages = packageData?.images && packageData.images.length > 0
    ? packageData.images.map((img: string) => getImageUrl(img, heroImageOptions) || img)
    : ["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"];
  // If admin uploaded a dynamic image via Page Content, use it as the first gallery image
  const galleryImages = dynamicImage ? [dynamicImage, ...baseGalleryImages.slice(1)] : baseGalleryImages;

  const inclusions = Array.isArray(packageData?.inclusions) ? packageData.inclusions : [];
  const exclusions = Array.isArray(packageData?.exclusions) ? packageData.exclusions : [];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Fetch dynamic page content for this package (from admin Page Content section)
  useEffect(() => {
    const fetchDynamicContent = async () => {
      try {
        const contentKey = slug.toLowerCase().replace(/\s+/g, '-');
        const contentResponse = await fetch(`/api/page-content/${contentKey}`);
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          if (contentData.success && contentData.data) {
            if (contentData.data.content) setDynamicDescription(contentData.data.content);
            if (contentData.data.image) setDynamicImage(contentData.data.image);
          }
        }
      } catch (e) {
        console.error("Failed to fetch dynamic package content", e);
      }
    };
    fetchDynamicContent();
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    const resolveBreadcrumbSource = async () => {
      const fallback = getFallbackBreadcrumb(packageData);

      const firstTag = Array.isArray(packageData.tags) ? packageData.tags[0] : null;
      if (firstTag) {
        if (typeof firstTag === "object" && firstTag.name && firstTag.slug) {
          if (isMounted) {
            setBreadcrumbSource({
              label: firstTag.name,
              href: `/package/theme/${firstTag.slug}`,
            });
          }
          return;
        }

        if (typeof firstTag === "string") {
          try {
            const response = await fetch(`/api/tags/${firstTag}`, { cache: "no-store" });
            if (response.ok) {
              const data = await response.json();
              const tag = data?.data;
              if (tag?.name && tag?.slug && isMounted) {
                setBreadcrumbSource({
                  label: tag.name,
                  href: `/package/theme/${tag.slug}`,
                });
                return;
              }
            }
          } catch (error) {
            console.error("Error fetching tag for breadcrumb:", error);
          }
        }
      }

      const holidayType = packageData.holidayType;
      if (holidayType) {
        if (typeof holidayType === "object" && holidayType.title && holidayType.slug) {
          if (isMounted) {
            setBreadcrumbSource({
              label: holidayType.title,
              href: `/holiday-types/${holidayType.slug}`,
            });
          }
          return;
        }

        if (typeof holidayType === "string") {
          try {
            const response = await fetch(`/api/holiday-types/${holidayType}`, { cache: "no-store" });
            if (response.ok) {
              const data = await response.json();
              if (data?.title && data?.slug && isMounted) {
                setBreadcrumbSource({
                  label: data.title,
                  href: `/holiday-types/${data.slug}`,
                });
                return;
              }
            }
          } catch (error) {
            console.error("Error fetching holiday type for breadcrumb:", error);
          }
        }
      }

      if (isMounted) {
        setBreadcrumbSource(fallback);
      }
    };

    resolveBreadcrumbSource();

    return () => {
      isMounted = false;
    };
  }, [packageData]);

  useEffect(() => {
    const fetchOtherPackages = async () => {
      try {
        setPackagesLoading(true);
        const response = await fetch('/api/all-packages?limit=12&isActive=true', { cache: 'no-store' });
        const data = await response.json();

        // Extract array from possible response formats
        let packagesArray = [];
        if (Array.isArray(data)) packagesArray = data;
        else if (data.data && Array.isArray(data.data)) packagesArray = data.data;
        else if (data.packages && Array.isArray(data.packages)) packagesArray = data.packages;

        setOtherPackages(
          packagesArray
            .filter((pkg: any) => pkg?._id !== packageData._id && (pkg?.isActive ?? true))
            .slice(0, 9)
        );
      } catch (error) {
        console.error('Error fetching other packages:', error);
      } finally {
        setPackagesLoading(false);
      }
    };
    fetchOtherPackages();
  }, [packageData._id]);

  const updateScrollState = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", updateScrollState);
      window.addEventListener("resize", updateScrollState);
      setTimeout(updateScrollState, 500);
      return () => {
        carousel.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      };
    }
  }, [otherPackages]);

  const scrollByStep = (direction: number) => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector("article");
      const gap = 24;
      const cardWidth = card ? card.getBoundingClientRect().width : 290;
      const step = cardWidth + gap;
      carouselRef.current.scrollBy({ left: direction * step, behavior: "smooth" });
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const discount = packageData.originalPrice && packageData.originalPrice > packageData.price
    ? Math.round(((packageData.originalPrice - packageData.price) / packageData.originalPrice) * 100)
    : packageData.discount || 0;
  const shortDescriptionText = stripHtmlTags(
    packageData.shortDescription || packageData.description || ""
  );
  const shortDescriptionPreview = shortDescriptionText
    ? shortDescriptionText.length > 180
      ? `${shortDescriptionText.slice(0, 180)}...`
      : shortDescriptionText
    : "Tour details coming soon.";

  return (
    <div className="min-h-screen bg-slate-50/30 [&_button]:cursor-pointer [&_a]:cursor-pointer [&_select]:cursor-pointer [&_[role=button]]:cursor-pointer [&_label]:cursor-pointer [&_input:not([type='checkbox']):not([type='radio'])]:cursor-text [&_textarea]:cursor-text relative">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-6 pt-2 md:pt-4 lg:pt-4 pb-28 lg:pb-10 relative">
        {/* Background Decorative Gradient */}
        <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-[#eef2ff] via-white to-transparent -z-10 opacity-70 pointer-events-none" />
        
        {/* Breadcrumbs */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] text-[#000945]">
          <Link href="/" className="hover:underline transition-all">Home</Link>
          <ChevronDown className="h-3 w-3 -rotate-90" />
          <Link
            href={breadcrumbSource.href}
            className="hover:underline transition-all"
          >
            {breadcrumbSource.label}
          </Link>
          <ChevronDown className="h-3 w-3 -rotate-90" />
          <span className="truncate max-w-[200px] md:max-w-none">{packageData.title}</span>
        </div>

        {/* Header Section */}
        <div className="mb-4 md:mb-8">
          <div className="flex flex-col gap-4">
            <h1 style={{ fontWeight: 800 }} className="text-3xl tracking-tight text-[#000945] md:text-4xl lg:!text-[44px] leading-tight">
              {packageData.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-base font-medium flex flex-wrap items-center gap-1.5">
                <span className="text-[#000945]">{packageData.duration}</span>
                <span className="text-[#000945] font-normal">|</span>
                <span className="flex items-center gap-1 text-[#000945]">
                  <MapPin className="h-[18px] w-[18px] text-[#000945]" />
                  {packageData.destination?.split(',')[0].trim()}
                </span>
              </p>
              <div className="flex flex-col items-start sm:items-end gap-1.5">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex items-center gap-2 !rounded-[6px] border !border-[#dfe1df] !shadow-none bg-white px-4 py-2 text-sm font-semibold text-[#000945] hover:bg-slate-50 hover:text-[#000945]"
                  >
                    <ArrowRight className="h-5 w-5 rotate-45" />
                    Share
                  </Button>
                </div>
                <div
                  className={`min-h-[18px] text-[12px] font-medium transition-all duration-300 ${actionMessage
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-1 pointer-events-none"
                    } text-[#16a34a]`}
                  style={{ color: "#16a34a", fontWeight: 500 }}
                >
                  {actionMessage?.text || ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
          {/* Left Column (Content) */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Tour Gallery & Quick Facts */}
            <div className="bg-white rounded-[6px] border border-[#dfe1df] shadow-none">
              <div className="p-5 border-b border-[#dfe1df]">
                <h3 style={{ fontWeight: 700 }} className="text-[20px] text-[#000945] flex items-center gap-2">
                  <span className="text-[#155dfc] text-xl">Tour Gallery</span>
                </h3>
              </div>
              
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Hero Image */}
                <div className="relative overflow-hidden rounded-[6px] shadow-none">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[6px] bg-slate-200">
                    <Image
                      src={galleryImages[selectedImage]}
                      alt={packageData.imageAlt || packageData.title || packageData.destination || "Package image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                      priority={selectedImage === 0}
                      fetchPriority={selectedImage === 0 ? "high" : "auto"}
                      quality={70}
                    />
                    {/* Overlay text on image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                      <h4 className="text-white font-bold text-lg md:text-xl leading-tight">
                        {packageData.title}
                      </h4>
                    </div>
                  </div>
                  {galleryImages.length > 1 && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        onClick={() => setSelectedImage((prev) => (prev + 1) % galleryImages.length)}
                        className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-black/70"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quick Facts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-[#e8f1fc] shadow-[0_4px_20px_rgba(0,9,69,0.03)] hover:shadow-[0_8px_30px_rgba(0,9,69,0.06)] transition-all duration-300 group">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-5 w-5 text-[#155dfc]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Tour Name</p>
                      <p className="text-[12px] sm:text-[13px] font-bold text-[#000945] leading-tight line-clamp-2">{packageData.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-[#e8f1fc] shadow-[0_4px_20px_rgba(0,9,69,0.03)] hover:shadow-[0_8px_30px_rgba(0,9,69,0.06)] transition-all duration-300 group">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-5 w-5 text-[#155dfc]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Duration</p>
                      <p className="text-[12px] sm:text-[13px] font-bold text-[#000945] leading-tight line-clamp-2">{packageData.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-[#e8f1fc] shadow-[0_4px_20px_rgba(0,9,69,0.03)] hover:shadow-[0_8px_30px_rgba(0,9,69,0.06)] transition-all duration-300 group">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Plane className="h-5 w-5 text-[#155dfc]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Vehicle Type</p>
                      <p className="text-[12px] sm:text-[13px] font-bold text-[#000945] leading-tight line-clamp-2">Sedan / SUV / Traveller</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-[#e8f1fc] shadow-[0_4px_20px_rgba(0,9,69,0.03)] hover:shadow-[0_8px_30px_rgba(0,9,69,0.06)] transition-all duration-300 group">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-5 w-5 text-[#155dfc]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Start & End</p>
                      <p className="text-[12px] sm:text-[13px] font-bold text-[#000945] leading-tight line-clamp-2">{packageData.destination?.split(',')[0].trim() || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 mb-2">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'itinerary', label: 'Itinerary' },
                { id: 'includes', label: 'Includes' },
                { id: 'highlights', label: 'Highlights' },
                { id: 'guideline', label: 'Guideline' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 text-[15px] font-bold rounded-full transition-all duration-300 whitespace-nowrap",
                    activeTab === tab.id 
                      ? "text-white bg-gradient-to-r from-[#000945] to-[#155dfc] shadow-md shadow-[#155dfc]/20" 
                      : "text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:text-[#000945] hover:shadow-sm"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Tour Overview Card */}
                {(dynamicDescription || packageData.description) && (
                  <div className="bg-white rounded-[6px] border border-[#dfe1df] p-5 shadow-none">
                    <h3 style={{ fontWeight: 700 }} className="text-[20px] text-[#000945] mb-4 flex items-center gap-2">
                      <span className="text-[#155dfc] text-xl">Tour Overview</span>
                    </h3>
                    <div className={cn("text-justify transition-all duration-300", !isOverviewExpanded && "line-clamp-3 overflow-hidden")}>
                      <div
                        suppressHydrationWarning
                        className="text-[14px] md:text-base leading-relaxed text-black overflow-x-auto [&_h1]:!m-0 [&_h1]:!text-2xl [&_h1]:!font-extrabold [&_h1]:!text-black [&_h2]:!m-0 [&_h2]:!text-xl [&_h2]:!font-bold [&_h2]:!text-black [&_h3]:!m-0 [&_h3]:!text-lg [&_h3]:!font-bold [&_h3]:!text-black [&_p]:!m-0 [&_p]:!text-base [&_p]:!text-black [&_ul]:!m-0 [&_ul]:!list-disc [&_ul]:!pl-6 [&_ol]:!m-0 [&_ol]:!list-decimal [&_ol]:!pl-6 [&_li]:!m-0 [&_li]:!text-black [&_li_p]:!m-0 [&_ul_li::marker]:!text-[#155dfc] [&_ol_li::marker]:!text-[#155dfc] [&_a]:!text-blue-600 [&_a]:!underline"
                        dangerouslySetInnerHTML={{ __html: normalizeRichTextHtml(dynamicDescription || packageData.description) }}
                      />
                    </div>
                    <button
                      onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                      className="mt-3 text-[14px] font-bold text-[#155dfc] hover:underline"
                    >
                      {isOverviewExpanded ? "See Less" : "See More"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ITINERARY TAB */}
            {activeTab === 'itinerary' && (
              <div className="bg-white rounded-[6px] border border-[#dfe1df] p-5 shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6 mb-6 pb-6 border-b border-[#dfe1df]">
                  {[
                    { icon: Plane, title: "All Transfers" },
                    { icon: Utensils, title: "Local Meals" },
                    { icon: Camera, title: "Photo Stops" },
                    { icon: Shield, title: "24/7 Support" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center justify-center gap-3 min-w-[120px]">
                      <item.icon className="h-7 w-7 text-[#155dfc]" strokeWidth={1.5} />
                      <span className="text-[15px] font-bold text-[#155dfc]">{item.title}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 style={{ fontWeight: 700 }} className="text-[20px] text-[#000945]">Detailed Itinerary</h3>
                </div>

                <Accordion type="multiple" className="space-y-3">
                  {packageData.itinerary?.map((day, index) => (
                    <AccordionItem key={index} value={`day-${index}`} className="!border border-[#dfe1df] rounded-[6px] bg-white overflow-hidden shadow-none focus-within:ring-0 focus-within:outline-none">
                      <AccordionTrigger className="!p-5 !bg-white hover:!bg-slate-50 transition-colors !no-underline focus:!outline-none focus-visible:!outline-none focus:!ring-0 data-[state=open]:[&_.day-badge]:bg-[#155dfc] data-[state=open]:[&_.day-title]:text-[#155dfc]">
                        <div className="flex items-center gap-3 overflow-hidden text-left">
                          <span
                            style={{ fontWeight: 700 }}
                            className="day-badge text-[11px] md:text-xs shrink-0 text-white bg-[#000945] px-2.5 md:px-3 py-1 rounded-[4px] uppercase tracking-wider"
                          >
                            Day {day.day}
                          </span>
                          <span style={{ fontWeight: 600 }} className="day-title text-[16px] md:text-[18px] text-[#000945] truncate">
                            {day.title}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="!px-5 !pb-5 !pt-0">
                        <div className="space-y-3">
                          {day.activities?.map((activity, actIndex) => (
                            containsHtml(activity) ? (
                              <div
                                key={actIndex}
                                className="!text-[#000945] text-sm [&_p]:!m-0 [&_*]:!text-[#000945] [&_p]:!text-[#000945]"
                                dangerouslySetInnerHTML={{ __html: preserveRichTextSpacing(activity) }}
                              />
                            ) : (
                              <p key={actIndex} className="!text-[#000945] text-[15px] leading-relaxed">
                                {activity}
                              </p>
                            )
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* INCLUDES TAB */}
            {activeTab === 'includes' && (
              <div className="bg-white rounded-[6px] border border-[#dfe1df] p-5 shadow-none">
                <h3 style={{ fontWeight: 700 }} className="mb-6 !text-[24px] md:!text-[28px] text-[#000945]">Inclusions & Exclusions</h3>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Inclusions */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-100">
                        <Check className="h-5 w-5" />
                      </div>
                      <h4 className="text-[20px] font-bold text-[#000945]">What's Included</h4>
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {inclusions.map((item, index) => (
                        <li key={index} className="flex items-start gap-4 text-[#000945]">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-[15px] leading-relaxed text-black" dangerouslySetInnerHTML={{ __html: item }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Exclusions */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100">
                        <X className="h-5 w-5" />
                      </div>
                      <h4 className="text-[20px] font-bold text-[#000945]">What's Excluded</h4>
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {exclusions.map((item, index) => (
                        <li key={index} className="flex items-start gap-4 text-[#000945]">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <X className="h-3.5 w-3.5 text-red-500" />
                          </div>
                          <span className="text-[15px] leading-relaxed text-black" dangerouslySetInnerHTML={{ __html: item }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* HIGHLIGHTS TAB */}
            {activeTab === 'highlights' && (
              <div className="bg-white rounded-[6px] border border-[#dfe1df] p-5 shadow-none">
                <div className="mb-4">
                  <h3 style={{ fontWeight: 700 }} className="!text-[24px] md:!text-[28px] text-[#000945]">Experience Highlights</h3>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {packageData.highlights?.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-full border border-[#dfe1df] bg-slate-50 px-3.5 py-1.5 shadow-none">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#000945]">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-[14px] font-medium text-black">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GUIDELINE TAB */}
            {activeTab === 'guideline' && (
              <div className="bg-white rounded-[6px] border border-[#dfe1df] p-5 shadow-none">
                <h3 style={{ fontWeight: 700 }} className="!text-[24px] md:!text-[28px] text-[#000945] mb-4">Booking Information & Guidelines</h3>
                <Accordion type="single" collapsible className="space-y-0">
                  {[
                    { title: "Booking and Payment", content: ["A deposit of 30% is required to confirm your booking", "Full payment must be completed 30 days before departure", "All prices are in INR and include taxes", "Payment via credit card, bank transfer, or UPI"] },
                    { title: "Cancellation Policy", content: ["Cancellation 60+ days: Full refund minus fee", "Cancellation 30-59 days: 75% refund", "Cancellation 15-29 days: 50% refund", "Less than 15 days: No refund"] },
                    { title: "Travel Documents", content: ["Valid passport required (min 6 months)", "Visa requirements vary by destination", "Travel insurance strongly recommended", "Accurate personal details required"] }
                  ].map((item, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="!border-b !border-[#dfe1df] !border-x-0 !border-t-0 !bg-transparent !shadow-none !rounded-none focus-within:ring-0 focus-within:outline-none">
                      <AccordionTrigger
                        id={`package-terms-item-${idx}-trigger`}
                        className="!py-4 hover:!bg-transparent transition-colors !no-underline focus:!outline-none focus-visible:!outline-none focus:!ring-0"
                      >
                        <h3 style={{ fontSize: '18px', fontWeight: 700 }} className="text-[#000945] text-left !m-0">{item.title}</h3>
                      </AccordionTrigger>
                      <AccordionContent className="!pb-4 !pt-0">
                        <ul className="flex flex-col gap-1.5 text-[15px] text-[#000945] !mb-0">
                          {item.content.map((point, pIdx) => <li key={pIdx} className="flex gap-2 leading-snug"><span className="text-[#ff4e00] shrink-0 font-bold">•</span> <span className="text-black">{point}</span></li>)}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
            
          </div>

          {/* Right Column (Sticky Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-6 relative z-10">
            {/* Pricing Card */}
            <div
              id="booking-sidebar"
              className="lg:sticky w-full overflow-hidden scroll-mt-[100px] rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
              style={{ top: stickyTop }}
            >
                <div className="bg-gradient-to-r from-[#000945] via-[#0a1860] to-[#155dfc] p-4 text-center border-b border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <span className="relative text-[15px] font-bold text-white tracking-wide uppercase">Package Starting From</span>
                </div>
                <div className="p-5">
                  <div className="mb-4 flex flex-col items-center justify-center gap-1 border-b border-slate-100 pb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[40px] leading-none font-medium tracking-tight text-[#155dfc]">{formatPrice(packageData.price)}</span>
                      <span className="text-[14px] text-slate-500">per {packageData.priceType === 'per_couple' ? 'couple' : 'person'}</span>
                    </div>
                    {discount > 0 && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 mt-2">
                        {discount}% OFF Early Bird
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-[#155dfc] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[14px] font-bold !text-black mb-1">Full Name</p>
                          <input
                            type="text"
                            placeholder="Enter your name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-white border border-[#e5e7eb] rounded-[4px] h-9 px-3 text-[13px] !text-black shadow-none outline-none focus:border-[#155dfc] transition-colors placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-[#155dfc] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[14px] font-bold !text-black mb-1">Email</p>
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border border-[#e5e7eb] rounded-[4px] h-9 px-3 text-[13px] !text-black shadow-none outline-none focus:border-[#155dfc] transition-colors placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-[#155dfc] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[14px] font-bold !text-black mb-1">Phone Number</p>
                          <div className="flex bg-white border border-[#e5e7eb] rounded-[4px] overflow-hidden focus-within:border-[#155dfc] transition-colors">
                            <div className="w-[80px] shrink-0 h-9 flex items-center px-1 bg-slate-50 border-r border-[#e5e7eb]">
                              <PhoneInput
                                country="in"
                                onChange={(value, data) => {
                                  if (data && typeof data === "object" && "dialCode" in data) {
                                    const dialCode = (data as { dialCode?: string }).dialCode;
                                    if (dialCode) setPhoneDialCode(`+${dialCode}`);
                                  }
                                }}
                                preferredCountries={["in", "ae", "us", "gb"]}
                                enableSearch={false}
                                disableSearchIcon
                                inputStyle={{ display: 'none' }}
                                buttonStyle={{
                                  position: 'relative',
                                  border: 'none',
                                  background: 'transparent',
                                  width: '100%',
                                  height: '100%',
                                  padding: '0 4px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}
                              />
                            </div>
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="Enter your number"
                              className="flex-1 h-9 px-3 text-[13px] !text-black shadow-none outline-none placeholder:text-slate-400 bg-transparent"
                              required
                              autoComplete="tel"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-[#155dfc] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[14px] font-bold !text-black mb-1">Travel Date</p>
                          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal bg-white !border-[#e5e7eb] !rounded-[4px] h-9 px-3 text-[13px] !text-black !shadow-none hover:bg-slate-50 hover:!text-black transition-colors",
                                  !date && "!text-slate-400"
                                )}
                              >
                                {date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 !border-[#dfe1df] !rounded-[6px] z-[9999]" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={date}
                                onSelect={(d) => { setDate(d); setTimeout(() => setCalendarOpen(false), 150); }}
                                disabled={{ before: new Date() }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-[#155dfc] shrink-0 mt-0.5" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[14px] font-bold !text-black">Number of Days</p>
                            <div className="flex items-center bg-white border border-[#e5e7eb] rounded-[4px] overflow-hidden">
                              <button onClick={() => setNumberOfDays(Math.max(1, numberOfDays - 1))} className="w-8 h-8 flex items-center justify-center !text-black hover:bg-slate-50 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="text-[13px] font-semibold !text-black w-8 flex items-center justify-center border-x border-[#e5e7eb] h-8">{numberOfDays}</span>
                              <button onClick={() => setNumberOfDays(numberOfDays + 1)} className="w-8 h-8 flex items-center justify-center !text-black hover:bg-slate-50 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-[#155dfc] shrink-0 mt-0.5" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[14px] font-bold !text-black">Adults</p>
                            <div className="flex items-center bg-white border border-[#e5e7eb] rounded-[4px] overflow-hidden">
                              <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 flex items-center justify-center !text-black hover:bg-slate-50 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="text-[13px] font-semibold !text-black w-8 flex items-center justify-center border-x border-[#e5e7eb] h-8">{adults}</span>
                              <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 flex items-center justify-center !text-black hover:bg-slate-50 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[14px] font-bold !text-black">Children</p>
                            <div className="flex items-center bg-white border border-[#e5e7eb] rounded-[4px] overflow-hidden">
                              <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 flex items-center justify-center !text-black hover:bg-slate-50 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="text-[13px] font-semibold !text-black w-8 flex items-center justify-center border-x border-[#e5e7eb] h-8">{children}</span>
                              <button onClick={() => setChildren(children + 1)} className="w-8 h-8 flex items-center justify-center !text-black hover:bg-slate-50 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-5 w-5 text-[#155dfc] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[14px] font-bold !text-black mb-1">Message</p>
                          <textarea
                            placeholder="Any special requests?"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-white border border-[#e5e7eb] rounded-[4px] px-3 py-2 text-[13px] !text-black shadow-none outline-none focus:border-[#155dfc] transition-colors placeholder:text-slate-400 min-h-[60px] resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex gap-3">
                      <Button
                        onClick={handleSubmitEnquiry}
                        disabled={isSubmittingEnquiry}
                        className="flex-1 flex h-10 items-center justify-center rounded-[6px] bg-gradient-to-r from-[#155dfc] to-[#000945] text-[15px] font-bold text-white shadow-lg shadow-[#155dfc]/20 transition-all hover:shadow-[#155dfc]/40 hover:-translate-y-0.5 border-none disabled:opacity-70"
                      >
                        {isSubmittingEnquiry ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {isSubmittingEnquiry ? 'Sending...' : 'Send Enquiry'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

            {/* Trust Indicators */}
            <div className="rounded-[6px] border border-[#dfe1df] bg-white p-6 shadow-none">
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#000945]">Best Price Guaranteed</span>
                    <span className="text-xs text-slate-500">Unbeatable value for your journey.</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#000945]">24/7 Expert Support</span>
                    <span className="text-xs text-slate-500">Live assistance during your trip.</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#000945]">Verified Reviews</span>
                    <span className="text-xs text-slate-500">4.4/5 based on 160+ reviews.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-8">

        </div>

        {/* Other Packages Section */}
        {otherPackages.length > 0 && (
          <section className="!bg-white py-8 text-gray-900 relative z-20">
            <div className="mx-auto flex flex-col gap-6 relative z-10">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-2">
                <div className="flex flex-col gap-1">
                  <h3 className="!text-[24px] md:!text-[36px] !font-bold !text-[#000945] !leading-tight tracking-tight">
                    You Might Also Like
                  </h3>
                  <p className="!text-sm !text-slate-500 md:!text-base !max-w-2xl !font-medium">
                    Explore more amazing packages and create unforgettable memories
                  </p>
                </div>
              </div>

              <div className="relative -mx-4 px-4 md:mx-0 md:px-0 group/carousel">
                <CarouselArrows
                  onPrevious={() => scrollByStep(-1)}
                  onNext={() => scrollByStep(1)}
                  canScrollLeft={canScrollLeft}
                  canScrollRight={canScrollRight}
                />
                <div
                  ref={carouselRef}
                  className="flex gap-6 overflow-x-auto scroll-smooth pb-8 pt-2 scrollbar-hide px-2"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    scrollSnapType: "x mandatory",
                  }}
                >
                  {otherPackages.map((pkg, index) => (
                    <PackageCard
                      key={`${pkg._id}-${index}`}
                      id={pkg._id}
                      destination={pkg.location || pkg.destination}
                      duration={pkg.duration}
                      title={pkg.name || pkg.title}
                      price={pkg.price || 0}
                      image={getImageUrl(pkg.image || pkg.images?.[0]) || `https://picsum.photos/800/500?random=${index + 50}`}
                      imageAlt={pkg.imageAlt || pkg.name || pkg.title}
                      slug={pkg.slug || pkg._id}
                      hrefPrefix="/package"
                      themeColor="#005beb"
                      priceLabel={getPackagePriceLabel(pkg.priceType)}
                      showDestination={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#dfe1df] p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden flex items-center justify-between gap-3">
        <div className="flex flex-col flex-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Starting From</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[20px] font-bold text-[#155dfc] leading-none">{formatPrice(packageData.price)}</span>
            <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">per {packageData.priceType === 'per_couple' ? 'couple' : 'person'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end max-w-[220px]">
          <Button
            onClick={() => {
              const element = document.getElementById('booking-sidebar');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex-1 h-10 px-0 items-center justify-center rounded-[6px] bg-[#000945] text-[13px] font-bold text-white shadow-none hover:bg-[#000945]/90"
          >
            Enquire
          </Button>
        </div>
      </div>

      {isLeadFormOpen && (
        <LeadCaptureForm
          isOpen={isLeadFormOpen}
          onClose={() => setIsLeadFormOpen(false)}
          packageTitle={packageData?.title}
          packagePrice={formatPrice(packageData.price)}
        />
      )}
      {isLoginModalOpen && (
        <LoginAlertModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          theme="blue"
        />
      )}
    </div>
  );
};

export default ItineraryPageClient;
