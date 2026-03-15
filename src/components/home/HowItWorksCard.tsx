"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline, IoChevronDownOutline } from "react-icons/io5";
import { FaTimes } from "react-icons/fa";
import Image from "next/image";

const DISMISS_KEY = "howItWorksCardDismissed";

interface HowItWorksSlide {
    id: number;
    image: string;
    title: string;
    description: string;
}

const baseSlides: HowItWorksSlide[] = [
    {
        id: 1,
        image: "/Card1.png",
        title: "Send a Fan Meet Request",
        description: "Request a fan meet with your favourite creator.",
    },
    {
        id: 2,
        image: "/Card2.png",
        title: "Secure Payment",
        description:
            "Once you send a fan meet request, your payment is processed right away and safely held by the platform.",
    },
    {
        id: 3,
        image: "/Card3.png",
        title: "24 Hour Window",
        description:
            "Creators have 24 hours to respond. If they decline or don't reply, payment is refunded. If they accept, the booking is confirmed and final.",
    },
    {
        id: 4,
        image: "/Card8.png",
        title: "Complete the Meet",
        description:
            'Click "Mark as complete" after the fan meet and the payment is securely released to the creator.',
    },
    {
        id: 5,
        image: "/Card4.png",
        title: "Share Your Experience",
        description: "Leave an honest review to help others and support your creator.",
    },
    {
        id: 6,
        image: "/Card5.png",
        title: "Full Fan Protection",
        description:
            "Your payment is safe, if the creator doesn't show up, it's refunded to you automatically.",
    },
    {
        id: 7,
        image: "/Card6.png",
        title: "Full Creator Protection",
        description:
            "If a fan doesn’t mark the meetup as complete or fails to attend, contact Support. Our team will review the situation and release the payment accordingly.",
    },
    {
        id: 8,
        image: "/Card7.png",
        title: "Keep Chat In-Platform",
        description: "All communication stays on the platform, ensuring smooth support, easy verification, and secure dispute resolution.",
    },
    {
        id: 9,
        image: "/Card9.png",
        title: "Safe Payments Only",
        description: "Always process payments through the platform. Any request to pay outside (Telegram, WhatsApp, etc.) could put your money at risk."
    },
];

type TutorialType = "Fan meet" | "Fan date" | "Fan call";

const HowItWorksCard: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [tutorialType, setTutorialType] = useState<TutorialType>("Fan meet");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check if user has dismissed the card
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const dismissed = localStorage.getItem(DISMISS_KEY);
            setVisible(!dismissed);
        } catch {
            setVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        try {
            localStorage.setItem(DISMISS_KEY, "true");
            setVisible(false);
        } catch {
            setVisible(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Generate slides based on tutorial type
    const getSlides = (): HowItWorksSlide[] => {
        if (tutorialType === "Fan meet") return baseSlides;

        if (tutorialType === "Fan call") {
            return [
                {
                    id: 1,
                    image: "/call1.png",
                    title: "Send a Fan Call Request",
                    description: "Request a fan call with your favourite creator.",
                },
                {
                    id: 2,
                    image: "/call2.png",
                    title: "24 Hour Window",
                    description:
                        "Creators have 24 hours to respond. If they decline or don't reply, payment is refunded. If they accept, the booking is confirmed and final.",
                },
                {
                    id: 3,
                    image: "/call3.png",
                    title: "Start Call",
                    description: "Once call begins, billing starts per minute.",
                },
                {
                    id: 4,
                    image: "/Card7.png",
                    title: "Keep Chat In-Platform",
                    description: "All communication stays on the platform, ensuring smooth support, easy verification, and secure dispute resolution.",
                },
                {
                    id: 5,
                    image: "/Card9.png",
                    title: "Safe Payments Only",
                    description: "Always process payments through the platform. Any request to pay outside (Telegram, WhatsApp, etc.) could put your money at risk.",
                },
            ];
        }

        // Fan date
        return baseSlides.map(slide => ({
            ...slide,
            title: slide.title.replace(/Meet/g, "Date").replace(/meet/g, "date"),
            description: slide.description.replace(/fan meet/g, "fan date").replace(/meet/g, "date")
        }));
    };

    const slides = getSlides();

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            const slideWidth = scrollContainerRef.current.offsetWidth;
            scrollContainerRef.current.scrollTo({
                left: slideWidth * currentSlide,
                behavior: "smooth",
            });
        }
    }, [currentSlide]);

    const handleTypeSelect = (type: TutorialType) => {
        setTutorialType(type);
        setIsDropdownOpen(false);
        setCurrentSlide(0); // Reset to first slide when changing type
    };

    if (!visible) return null;

    return (
        <div className="w-full bg-gradient-to-br from-purple-900/30 via-gray-800/50 to-blue-900/30 rounded-xl overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-900/20 relative">
            {/* Dismiss button */}
            <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
                aria-label="Close How it works"
            >
                <FaTimes size={20} />
            </button>
            {/* Header */}
            <div className="p-4 md:p-6 pb-3 relative">
                <div className="flex items-start justify-between">

                    <div className="flex items-center gap-2 mr-8 md:mr-10">
                        {/* More Tutorial Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs md:text-sm font-medium rounded-full transition-all border border-purple-500/30"
                            >
                                More tutorial
                                <IoChevronDownOutline className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-gray-900 border border-purple-500/20 rounded-xl shadow-xl z-20 overflow-hidden backdrop-blur-xl">
                                    <div className="py-1">
                                        {(["Fan meet", "Fan date", "Fan call"] as TutorialType[]).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => handleTypeSelect(type)}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${tutorialType === type
                                                        ? "bg-purple-600/20 text-purple-300 font-medium"
                                                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation arrows - Desktop */}
                        <div className="hidden md:flex gap-2 ml-2">
                            <button
                                onClick={prevSlide}
                                className="p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-white transition-colors"
                                aria-label="Previous slide"
                            >
                                <IoChevronBackOutline className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-white transition-colors"
                                aria-label="Next slide"
                            >
                                <IoChevronForwardOutline className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Slide counter and Title update */}
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-purple-300 text-xs md:text-sm font-medium">
                        Step {currentSlide + 1} of {slides.length}
                    </span>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-400 text-xs md:text-sm font-medium">
                        {tutorialType}
                    </span>
                </div>
            </div>

            {/* Carousel Container */}
            <div className="relative px-4 md:px-6 pb-4">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-hidden snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="flex-shrink-0 w-full snap-center"
                        >
                            <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 group">
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] bg-gray-900/50 overflow-hidden">
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        fill
                                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                                        priority={index === 0}
                                    />
                                    {/* Number Badge */}
                                    <div className="absolute top-3 left-3 w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg">
                                        {slide.id}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 md:p-5">
                                    <h4 className="text-white font-semibold text-sm md:text-base mb-2">
                                        {slide.title}
                                    </h4>
                                    <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                                        {slide.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-2 mt-4">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? "w-8 bg-purple-500"
                                : "w-2 bg-gray-600 hover:bg-gray-500"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Mobile Navigation Arrows */}
                <div className="flex md:hidden items-center justify-center gap-4 mt-4">
                    <button
                        onClick={prevSlide}
                        className="p-3 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-white transition-colors"
                        aria-label="Previous slide"
                    >
                        <IoChevronBackOutline className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="p-3 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-white transition-colors"
                        aria-label="Next slide"
                    >
                        <IoChevronForwardOutline className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-600/10 rounded-full blur-[60px] pointer-events-none"></div>
        </div>
    );
};

export default HowItWorksCard;