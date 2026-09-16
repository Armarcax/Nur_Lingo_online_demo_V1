// src/components/OfflineAudioPlayer.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { resolveOfflineAudio } from '@/lib/offline/offline-audio-resolver';
import { useI18n } from "@/hooks/useI18n";
interface OfflineAudioPlayerProps {
    audioId: string;
    language: 'hy' | 'en' | 'ru';
    autoPlay?: boolean;
    onPlay?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    showControls?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const OfflineAudioPlayer: React.FC<OfflineAudioPlayerProps> = ({
    audioId,
    language,
    autoPlay = false,
    onPlay,
    onEnd,
    onError,
    className = '',
    showControls = true,
    size = 'md'
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animationRef = useRef<number | null>(null);

    // Size mappings
    const sizeClasses = {
        sm: {
            button: 'w-8 h-8 text-sm',
            icon: 'text-sm',
            text: 'text-xs'
        },
        md: {
            button: 'w-10 h-10 text-base',
            icon: 'text-base',
            text: 'text-sm'
        },
        lg: {
            button: 'w-12 h-12 text-lg',
            icon: 'text-lg',
            text: 'text-base'
        }
    };

    const getAudioUrl = useCallback(() => {
        return resolveOfflineAudio(audioId, language)?.url || null;
    }, [audioId, language]);

    useEffect(() => {
        // Initialize audio element
        const audio = new Audio();
        audioRef.current = audio;
        audio.preload = 'metadata';

        // Event listeners
        const handlePlay = () => {
            setIsPlaying(true);
            setIsLoading(false);
            onPlay?.();
            updateProgress();
        };

        const handlePause = () => {
            setIsPlaying(false);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            onEnd?.();
        };

        const handleError = (e: Event) => {
            const audioError = new Error(`Failed to load audio: ${audioId}`);
            setError(audioError.message);
            setIsLoading(false);
            onError?.(audioError);
        };

        const handleLoadedMetadata = () => {
            if (audio.duration) {
                setDuration(audio.duration);
            }
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.pause();
            audio.src = '';
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [audioId, onPlay, onEnd, onError]);

    useEffect(() => {
        if (autoPlay && audioId) {
            playAudio();
        }
    }, [autoPlay, audioId]);

    const updateProgress = () => {
        if (audioRef.current) {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 1;
            setProgress((currentTime / duration) * 100);
            
            if (audioRef.current.paused) {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                    animationRef.current = null;
                }
                return;
            }
            
            animationRef.current = requestAnimationFrame(updateProgress);
        }
    };

    const playAudio = useCallback(async () => {
        if (!audioRef.current || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const url = getAudioUrl();
            if (!url) throw new Error(`Audio mapping not found: ${audioId}`);
            audioRef.current.src = url;
            
            // Check if file exists before playing
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`Audio file not found: ${audioId}`);
            }
            
            await audioRef.current.play();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to play audio';
            setError(errorMessage);
            setIsLoading(false);
            onError?.(err as Error);
            
            // Try silent fallback
            try {
                await playSilent();
            } catch (silentError) {
                console.warn('Silent playback failed:', silentError);
            }
        }
    }, [audioId, getAudioUrl, isLoading, onError]);

    const playSilent = useCallback(async () => {
        // Create a silent audio context as fallback
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.001);
            onEnd?.();
        } catch (err) {
            console.warn('Silent fallback failed:', err);
        }
    }, [onEnd]);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setProgress(0);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            stopAudio();
        } else {
            playAudio();
        }
    }, [isPlaying, playAudio, stopAudio]);

    const formatTime = (seconds: number): string => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentTime = audioRef.current?.currentTime || 0;

    return (
        <div className={`offline-audio-player ${className}`}>
            <div className="flex items-center gap-3 w-full">
                {/* Play/Stop Button */}
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className={`
                        ${sizeClasses[size].button}
                        rounded-full
                        border-0
                        transition-all
                        duration-200
                        flex items-center justify-center
                        ${isPlaying 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }
                        ${isLoading ? 'bg-yellow-500 animate-pulse' : ''}
                        text-white
                        shadow-md
                        hover:scale-105
                        active:scale-95
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    `}
                    aria-label={isPlaying ? 'Stop' : 'Play'}
                    title={isPlaying ? 'Դադարեցնել' : 'Նվագարկել'}
                >
                    {isLoading ? (
                        <span className={`${sizeClasses[size].icon} animate-spin`}>⟳</span>
                    ) : isPlaying ? (
                        <span className={sizeClasses[size].icon}>⏹</span>
                    ) : (
                        <span className={sizeClasses[size].icon}>▶</span>
                    )}
                </button>

                {/* Progress Bar */}
                {showControls && (
                    <div className="flex-1 flex items-center gap-3">
                        <span className={`text-gray-500 ${sizeClasses[size].text} font-mono min-w-[40px]`}>
                            {formatTime(currentTime)}
                        </span>
                        
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-150 rounded-full"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                            {/* Click to seek */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setProgress(value);
                                    if (audioRef.current && audioRef.current.duration) {
                                        audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={!audioRef.current?.duration}
                            />
                        </div>
                        
                        <span className={`text-gray-500 ${sizeClasses[size].text} font-mono min-w-[40px]`}>
                            {formatTime(duration)}
                        </span>
                    </div>
                )}

                {/* Language Label */}
                <span className={`text-gray-400 ${sizeClasses[size].text} ml-1`}>
                    {language === 'hy' ? 'Հայերեն' : language === 'en' ? 'Անգլերեն' : 'Ռուսերեն'}
                </span>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-1 text-red-500 text-xs flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button
                        onClick={() => playAudio()}
                        className="text-blue-500 hover:underline ml-2"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Audio ID */}
            <div className="mt-1 text-gray-400 text-xs font-mono">
                ID: {audioId}
            </div>

            <style jsx>{`
                .offline-audio-player {
                    display: flex;
                    flex-direction: column;
                    padding: 4px 0;
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default OfflineAudioPlayer;