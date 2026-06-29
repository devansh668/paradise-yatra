"use client";

import Image from "next/image";
import Link from "next/link";

interface FestivalDestination {
    id: number;
    name: string;
    price: number;
    image: string;
    href: string;
}

const FESTIVAL_DESTINATIONS: FestivalDestination[] = [
    {
        id: 1,
        name: "Rio Carnival",
        price: 45000,
        image: "https://images.unsplash.com/photo-1522008629172-0c17aa47d1ee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
    },
    {
        id: 2,
        name: "Cherry Blossom",
        price: 35000,
        image: "https://images.unsplash.com/photo-1526344966-89049886b28d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
    },
    {
        id: 3,
        name: "Lantern Festival",
        price: 25000,
        image: "https://images.unsplash.com/photo-1523296066596-7ff8bb6e6d29?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
    },
    {
        id: 4,
        name: "Oktoberfest",
        price: 28000,
        image: "https://images.unsplash.com/photo-1729467067923-78d629125e3e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
    },
    {
        id: 5,
        name: "Day of the Dead",
        price: 32000,
        image: "https://images.unsplash.com/photo-1667090762902-bd8ee938d3d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
    },
    {
        id: 6,
        name: "Loy Krathong",
        price: 18000,
        image: "https://images.unsplash.com/photo-1763818693963-bac021e7b739?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
    },
];

const FixedDepartureCarousel = () => {
    return (
        <section className="bg-white py-14 px-4 text-gray-900 md:px-8 overflow-hidden">
            <div className="mx-auto max-w-[1200px]">
                {/* Header Style matching India Tour Package */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <span className="text-[#005beb] !font-black uppercase tracking-wider text-xs flex items-center gap-2">
                            <span className="h-px w-8 bg-[#005beb]"></span>
                            Cultural Joy
                        </span>
                        <h2 className="!text-2xl !font-bold text-slate-900 md:text-3xl">
                            Celebrations Across the World
                        </h2>
                        <p className="!text-sm !text-slate-600 md:text-base font-semibold mt-1 leading-relaxed">
                            Immerse yourself in vibrant global traditions and iconic celebrations with our curated cultural tour packages.
                        </p>
                    </div>
                    <Link href="/all-packages" className="text-[#005beb] font-bold text-sm flex items-center gap-1 hover:underline whitespace-nowrap pb-1">
                        View All Packages &rarr;
                    </Link>
                </div>

                {/* Premium Horizontal Carousel */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {FESTIVAL_DESTINATIONS.map((destination) => (
                        <Link
                            key={destination.id}
                            href={destination.href}
                            className="snap-start shrink-0 w-[280px] md:w-[340px] group cursor-pointer block"
                        >
                            <div className="relative overflow-hidden rounded-2xl h-[400px] w-full mb-4 shadow-sm group-hover:shadow-2xl transition-all duration-500 ring-1 ring-black/5">
                                <Image
                                    src={destination.image}
                                    alt={destination.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute bottom-6 left-6 text-white z-10 pr-6">
                                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                                        {destination.name}
                                    </h3>
                                    <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                                        <p className="text-xs text-white font-semibold flex items-center gap-1 uppercase tracking-wider">
                                            From ₹{destination.price.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FixedDepartureCarousel;

