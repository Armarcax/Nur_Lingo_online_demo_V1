// src/app/diagnose/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';

export default function DiagnosePage() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runDiagnose() {
      try {
        const response = await fetch('/api/diagnose');
        if (!response.ok) throw new Error('Failed to diagnose');
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    runDiagnose();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-2xl font-bold mb-4">🔍 {t("diagnose_title_loading")}</div>
        <div className="animate-pulse">{t("diagnose_loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-2xl font-bold text-red-600 mb-4">❌ {t("diagnose_error_title")}</div>
        <div className="bg-red-100 p-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🔍 {t("diagnose_title")}</h1>
        <div className={`px-4 py-2 rounded ${data.summary.status === '✅ OK' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {data.summary.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <div className="text-sm text-blue-600">{t("diagnose_errors")}</div>
          <div className="text-2xl font-bold text-red-600">{data.summary.totalErrors}</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <div className="text-sm text-yellow-600">{t("diagnose_warnings")}</div>
          <div className="text-2xl font-bold text-yellow-600">{data.summary.totalWarnings}</div>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <div className="text-sm text-green-600">{t("diagnose_date")}</div>
          <div className="text-sm font-bold">{new Date(data.timestamp).toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Errors */}
      {data.errors.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">❌ {t("diagnose_errors")}</h2>
          <div className="bg-red-50 p-4 rounded border border-red-200">
            {data.errors.map((err: string, i: number) => (
              <div key={i} className="py-1 text-red-700 font-mono text-sm">{err}</div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {data.warnings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-yellow-600 mb-2">⚠️ {t("diagnose_warnings")}</h2>
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            {data.warnings.map((warn: string, i: number) => (
              <div key={i} className="py-1 text-yellow-700 font-mono text-sm">{warn}</div>
            ))}
          </div>
        </div>
      )}

      {/* Directories */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">📁 {t("diagnose_audio_directories")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(data.checks.directories || {}).map(([path, info]: [string, any]) => (
            <div key={path} className={`p-3 rounded border ${info.exists ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <div className="font-mono text-sm">{path}</div>
              <div className="text-sm">
                {info.exists ? `✅ ${info.fileCount} ${t("diagnose_files")}` : `❌ ${t("diagnose_missing")}`}
              </div>
              {info.sampleFiles?.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {t("diagnose_samples")}: {info.sampleFiles.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audio Resolution */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">🔊 {t("diagnose_audio_results")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(data.checks.audioResolution || {}).map(([key, result]: [string, any]) => (
            <div key={key} className={`p-2 rounded text-sm border ${result.found ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <div className="font-mono">{result.key}</div>
              <div className="text-xs text-gray-500">{result.lang}</div>
              <div className={result.found ? 'text-green-600' : 'text-red-600'}>
                {result.found ? `✅ ${result.audioId}` : `❌ ${t("diagnose_not_found")}`}
              </div>
              {result.url && <div className="text-xs text-gray-400 truncate">{result.url}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">📊 {t("diagnose_summary")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data.summary).filter(([k]) => !['totalErrors', 'totalWarnings', 'status'].includes(k)).map(([key, value]: [string, any]) => (
            <div key={key} className="bg-gray-100 p-3 rounded">
              <div className="text-xs text-gray-500">{key}</div>
              <div className="font-bold">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Data */}
      <details className="mt-6">
        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">📄 {t("diagnose_full_data")}</summary>
        <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded overflow-auto max-h-96 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}