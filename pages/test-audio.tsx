// pages/test-audio.tsx - Թարմացված ամբողջական թեստային էջ

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OfflineAudioPlayer } from '../src/components/OfflineAudioPlayer';

interface TestResult {
    id: string;
    language: 'hy' | 'en' | 'ru';
    status: 'pending' | 'success' | 'error';
    error?: string;
    duration?: number;
}

export default function TestAudioPage() {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isTesting, setIsTesting] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<'hy' | 'en' | 'ru'>('hy');
    const [audioId, setAudioId] = useState('000001');

    const testAudioIds = ['000001', '000002', '000003', '000004', '000005'];
    const languages: Array<'hy' | 'en' | 'ru'> = ['hy', 'en', 'ru'];

    const runTests = useCallback(async () => {
        setIsTesting(true);
        const results: TestResult[] = [];
        
        for (const id of testAudioIds) {
            for (const lang of languages) {
                results.push({
                    id,
                    language: lang,
                    status: 'pending'
                });
            }
        }
        
        setTestResults(results);
        
        // Test each audio
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            try {
                const url = `/audio/offline/${getLanguageFolder(result.language)}/${result.id}.mp3`;
                const response = await fetch(url, { method: 'HEAD' });
                
                if (response.ok) {
                    const contentLength = response.headers.get('content-length');
                    results[i].status = 'success';
                    results[i].duration = contentLength ? parseInt(contentLength) : 0;
                } else {
                    results[i].status = 'error';
                    results[i].error = `HTTP ${response.status}`;
                }
            } catch (error) {
                results[i].status = 'error';
                results[i].error = error instanceof Error ? error.message : 'Unknown error';
            }
            
            // Update UI gradually
            if (i % 3 === 0) {
                setTestResults([...results]);
            }
        }
        
        setTestResults([...results]);
        setIsTesting(false);
    }, [testAudioIds, languages]);

    const getLanguageFolder = (lang: 'hy' | 'en' | 'ru'): string => {
        const map = {
            hy: 'hy_Ani',
            en: 'en_female',
            ru: 'ru_female'
        };
        return map[lang];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return '✅';
            case 'error': return '❌';
            default: return '⏳';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            default: return 'text-yellow-600';
        }
    };

    const getStats = () => {
        const total = testResults.length;
        const success = testResults.filter(r => r.status === 'success').length;
        const errors = testResults.filter(r => r.status === 'error').length;
        const pending = testResults.filter(r => r.status === 'pending').length;
        return { total, success, errors, pending };
    };

    const stats = getStats();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold mb-2">🎵 Աուդիոհամակարգի թեստ</h1>
                    <p className="text-gray-600">
                        Ստուգում է օֆլայն աուդիո ֆայլերի առկայությունը և նվագարկումը
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <button
                            onClick={runTests}
                            disabled={isTesting}
                            className={`
                                px-6 py-2 rounded-lg font-medium transition-all
                                ${isTesting 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }
                            `}
                        >
                            {isTesting ? '🔄 Թեստավորում...' : '🚀 Գործարկել թեստերը'}
                        </button>

                        <div className="flex gap-2">
                            {languages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setSelectedLanguage(lang)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${selectedLanguage === lang
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                        }
                                    `}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <label className="text-sm text-gray-600">Audio ID:</label>
                            <input
                                type="text"
                                value={audioId}
                                onChange={(e) => setAudioId(e.target.value)}
                                className="px-3 py-1 border rounded-lg text-sm w-24"
                                placeholder="000001"
                            />
                            <button
                                onClick={() => {
                                    const player = document.querySelector(`[data-audio-id="${audioId}"]`);
                                    if (player) {
                                        (player as any)?.play?.();
                                    }
                                }}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                            >
                                ▶ Play
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {testResults.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                            <div className="text-sm text-gray-600">Total Tests</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                            <div className="text-sm text-gray-600">✅ Success</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                            <div className="text-sm text-gray-600">❌ Errors</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-sm text-gray-600">⏳ Pending</div>
                        </div>
                    </div>
                )}

                {/* Audio Players Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {languages.map(lang => (
                        <div key={lang} className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                {lang.toUpperCase()}
                                <span className="text-sm font-normal text-gray-500">
                                    ({lang === 'hy' ? 'Հայերեն' : lang === 'en' ? 'English' : 'Русский'})
                                </span>
                            </h2>
                            
                            <div className="space-y-4">
                                {testAudioIds.map(id => (
                                    <div key={`${lang}-${id}`} className="border-b pb-3 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-mono text-gray-500 w-16">
                                                {id}
                                            </span>
                                            <OfflineAudioPlayer
                                                audioId={id}
                                                language={lang}
                                                size="sm"
                                                className="flex-1"
                                                onPlay={() => console.log(`Playing: ${id} (${lang})`)}
                                                onEnd={() => console.log(`Ended: ${id} (${lang})`)}
                                                onError={(error) => {
                                                    console.error(`Error: ${id} (${lang})`, error);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Test Results Table */}
                {testResults.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4">📊 Թեստի արդյունքներ</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">ID</th>
                                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Language</th>
                                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Status</th>
                                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Size</th>
                                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testResults.map((result, index) => (
                                        <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-2 px-3 font-mono text-sm">{result.id}</td>
                                            <td className="py-2 px-3 text-sm">{result.language.toUpperCase()}</td>
                                            <td className="py-2 px-3">
                                                <span className={`${getStatusColor(result.status)} font-medium`}>
                                                    {getStatusIcon(result.status)} {result.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-sm text-gray-600">
                                                {result.duration ? `${(result.duration / 1024).toFixed(1)}KB` : '-'}
                                            </td>
                                            <td className="py-2 px-3 text-sm text-red-600">
                                                {result.error || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>© 2026 NurLingo Audio System Test</p>
                    <p className="text-xs">
                        Total audio files: hy: 25089, en: 25099, ru: 20627
                    </p>
                </div>
            </div>
        </div>
    );
}