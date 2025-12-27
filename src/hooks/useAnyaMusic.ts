import { useEffect, useRef, useState } from 'react';

const ANYA_SOUNDTRACKS = [
    '/mmeko.mpeg',
    '/mmeko1.mpeg',
    '/mmeko2.mpeg',
    '/mmeko3.mpeg',
    '/mmeko4.mpeg',
    '/mmeko5.mpeg',
];

/**
 * Custom hook to play random background music for Anya pages
 * Automatically selects a random track on mount and handles playback
 */
export function useAnyaMusic() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<string>('');

    useEffect(() => {
        // Select a random track
        const randomTrack = ANYA_SOUNDTRACKS[Math.floor(Math.random() * ANYA_SOUNDTRACKS.length)];
        setCurrentTrack(randomTrack);

        // Create audio element
        const audio = new Audio(randomTrack);
        audio.loop = true;
        audio.volume = 0.3; // Set to 30% volume for background music
        audioRef.current = audio;

        // Try to play (browsers may block autoplay)
        const playAudio = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (error) {
                console.log('Audio autoplay blocked. User interaction required.');
                setIsPlaying(false);
            }
        };

        playAudio();

        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(console.error);
                setIsPlaying(true);
            }
        }
    };

    const setVolume = (volume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    };

    return {
        isPlaying,
        togglePlayPause,
        setVolume,
        currentTrack,
    };
}
