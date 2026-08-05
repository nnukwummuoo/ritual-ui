'use client';

import { StoryProvider } from '@/contexts/StoryContext';

export default function RitualLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StoryProvider>
            <div className="w-full h-full">
                {children}
            </div>
        </StoryProvider>
    );
}
