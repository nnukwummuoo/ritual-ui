"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import Image from "next/image";

interface HowItWorksSlide {
    id: number;
    image: string;
    title: string;
    description: string;
}

const slides: HowItWorksSlide[] = [
    {
        id: 1,
        image: "/Card1.png",
        title: "Send a Fan Meet Request",
        description: "Send a Fan meet request to your favourite creator",
    },
    {
        id: 2,
        image: "/Card2.png",
        title: "Payment Processed",
        description:
            "Once a fan meet request is sent, Payment is processed immediately and held by the platform",
    },
    {
        id: 3,
        image: "/Card3.png",
        title: "24 Hour Window",
        description:
            "Creator has 24 hours to accept or decline request or else payment will be automatically refunded to the fan. If the creator accepts the request within 24 hours, The fan can't cancel anymore",
    },
    {
        id: 4,
        image: "/Card8.png",
        title: "Complete the Meet",
        description:
            'During the meet-up, Click "Mark as complete" and the payment will automatically be released to the Creator.',
    },
    {
        id: 5,
        image: "/Card4.png",
        title: "Leave a Review",
        description: "Leave a honest review of your fan meet experience",
    },
    {
        id: 6,
        image: "/Card5.png",
        title: "Full Protection",
        description:
            "If the creator doesn't show up, The payment is automatically refunded to the fan, So you are protected too",
    },
    {
        id: 7,
        image: "/Card7.png",
        title: "Keep Chat In-Platform",
        description: "Always keep chat in the platform for evidence and smooth dispute",
    },
    {
        id: 8,
        image: "/Card6.png",
        title: "Contact Support",
        description:
            "Contact Support immediately and we will investigate before releasing the payment to the creator.",
    },
];

const HowItWorksCard: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    // Auto scroll to current slide
    useEffect(() => {
        if (scrollContainerRef.current) {
            const slideWidth = scrollContainerRef.current.offsetWidth;
            scrollContainerRef.current.scrollTo({
                left: slideWidth * currentSlide,
                behavior: "smooth",
            });
        }
    }, [currentSlide]);

    // Touch/drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    return (
        <div className="w-full bg-gradient-to-br from-purple-900/30 via-gray-800/50 to-blue-900/30 rounded-xl overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-900/20">
            {/* Header */}
            <div className="p-4 md:p-6 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-semibold text-lg md:text-xl">
                            How it works
                        </h3>
                        <p className="text-gray-400 text-xs md:text-sm mt-1">
                            Your complete guide to fan requests
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Navigation arrows - Desktop */}
                        <button
                            onClick={prevSlide}
                            className="hidden md:flex p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-white transition-colors"
                            aria-label="Previous slide"
                        >
                            <IoChevronBackOutline className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="hidden md:flex p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-white transition-colors"
                            aria-label="Next slide"
                        >
                            <IoChevronForwardOutline className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Slide counter */}
                <div className="text-purple-300 text-xs md:text-sm font-medium mt-3">
                    Step {currentSlide + 1} of {slides.length}
                </div>
            </div>

            {/* Carousel Container */}
            <div className="relative px-4 md:px-6 pb-4">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="flex-shrink-0 w-full snap-center"
                            onClick={() => goToSlide(index)}
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
