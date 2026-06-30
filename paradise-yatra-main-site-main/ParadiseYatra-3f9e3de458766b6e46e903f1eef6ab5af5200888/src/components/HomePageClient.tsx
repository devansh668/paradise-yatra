"use client";

import { memo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import HeroSection from "./HeroSection";
import {
  LazyBlogSectionNew,
  LazyFestivalSection,
  LazyHoneymoonPackages,
  LazyIndiaTourPackagesSection,
  LazyInternationalTourPackagesSection,
  LazyLuxuryPackagesSection,
  LazySpiritualJourneysSection,
  LazyTestimonialsSection,
  LazyTrendingPackagesSection,
  LazyWhyChooseParadiseYatra,
  LazyAboutUsSection,
} from "@/components/lazy-components";



const ShutdownPopup = dynamic(() => import("@/components/ShutdownPopup"), {
  ssr: false,
});

const PerformanceMonitor = dynamic(
  () => import("@/components/ui/PerformanceMonitor"),
  { ssr: false }
);

const HomePageClient = memo(() => {
  const [showShutdownPopup, setShowShutdownPopup] = useState(false);
  const [renderBelowFold, setRenderBelowFold] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const enableBelowFold = () => {
      if (!cancelled) {
        setRenderBelowFold(true);
      }
    };

    if ("requestIdleCallback" in window) {
      const id = (window as Window & { requestIdleCallback: Function }).requestIdleCallback(
        enableBelowFold,
        { timeout: 1500 }
      );
      return () => {
        cancelled = true;
        (window as Window & { cancelIdleCallback: Function }).cancelIdleCallback(id);
      };
    }

    const timeoutId = setTimeout(enableBelowFold, 800);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-background overflow-x-hidden w-full"
      role="main"
      aria-label="Paradise Yatra - Travel Packages and Destinations"
    >
      <Header />
      {/* <NewHero2 /> */}
      {/* <NewHero /> */}
      {/* <div className="min-h-72 bg-gray-100 w-full"></div> */}
      <HeroSection />
      {/* <LazyFixedDepartureCarousel /> */}
      <div className="home-nonhero-radius">
        {renderBelowFold ? (
          <>
            <LazyTrendingPackagesSection />
            <LazyHoneymoonPackages />
            <LazyWhyChooseParadiseYatra />
            <LazyIndiaTourPackagesSection />
            <LazyInternationalTourPackagesSection />
            <LazySpiritualJourneysSection />
            <LazyLuxuryPackagesSection />

            <LazyFestivalSection />
            <LazyTestimonialsSection />
            <LazyAboutUsSection />
            <LazyBlogSectionNew />

            {/* Performance monitoring - only visible in development */}
            {process.env.NODE_ENV !== "production" && (
              <PerformanceMonitor showInProduction={false} />
            )}
          </>
        ) : (
          <div className="min-h-[600px]" aria-hidden="true" />
        )}
      </div>

      {/* Shutdown Popup - you can control this with state */}
      {showShutdownPopup && <ShutdownPopup isOpen={showShutdownPopup} />}

    </div>
  );
});

HomePageClient.displayName = "HomePageClient";

export default HomePageClient;

