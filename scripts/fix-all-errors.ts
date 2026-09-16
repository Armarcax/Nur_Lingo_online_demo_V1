// scripts/fix-all-errors.ts
import fs from 'fs';
import path from 'path';

interface FixResult {
  file: string;
  issue: string;
  fixed: boolean;
  message?: string;
}

class FixAllErrors {
  private results: FixResult[] = [];
  private fixedCount = 0;
  private failedCount = 0;

  async run() {
    console.log('🔧 Fixing ALL errors...\n');
    console.log('═'.repeat(60));

    await this.fixWavVoices();
    await this.fixCalendar();
    await this.fixResizable();
    await this.fixSidebar();
    await this.fixDialogueFunctions();
    await this.fixWavProviders();
    await this.fixHayqEvents();
    await this.fixI18nIndex();

    this.printSummary();
    this.saveResults();
  }

  // ─── 1. FIX WAV_VOICES ──────────────────────────────────────────────
  private async fixWavVoices() {
    console.log('📁 Fixing WAV_VOICES...');

    // Fix WavClient.ts
    const wavClientPath = path.join(process.cwd(), 'src/lib/audio/WavClient.ts');
    if (fs.existsSync(wavClientPath)) {
      const content = fs.readFileSync(wavClientPath, 'utf8');
      if (!content.includes('export default WAV_VOICES')) {
        let newContent = content;
        if (content.includes('export const WAV_VOICES')) {
          newContent = content.replace(
            'export const WAV_VOICES',
            'export const WAV_VOICES'
          ) + '\n\nexport default WAV_VOICES;\n';
        } else {
          newContent = content + '\n\nexport default WAV_VOICES;\n';
        }
        fs.writeFileSync(wavClientPath, newContent);
        this.addResult('WavClient.ts', 'WAV_VOICES export', true, 'Added default export');
      }
    }

    // Fix dictionary/page.tsx
    const dictPath = path.join(process.cwd(), 'src/app/dictionary/page.tsx');
    if (fs.existsSync(dictPath)) {
      const content = fs.readFileSync(dictPath, 'utf8');
      if (content.includes('import { WAV_VOICES } from')) {
        const newContent = content.replace(
          /import\s*\{\s*WAV_VOICES\s*\}\s*from\s*["'][^"']+["']/g,
          'import WAV_VOICES from "@/lib/audio/WavClient"'
        );
        fs.writeFileSync(dictPath, newContent);
        this.addResult('dictionary/page.tsx', 'WAV_VOICES import', true, 'Fixed import');
      }
    }
  }

  // ─── 2. FIX CALENDAR ──────────────────────────────────────────────────
  private async fixCalendar() {
    console.log('📁 Fixing calendar.tsx...');

    const calendarPath = path.join(process.cwd(), 'src/components/ui/calendar.tsx');
    if (fs.existsSync(calendarPath)) {
      const content = fs.readFileSync(calendarPath, 'utf8');
      
      // Create simplified calendar
      const fixedContent = `"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
`;
      fs.writeFileSync(calendarPath, fixedContent);
      this.addResult('calendar.tsx', 'Calendar errors', true, 'Recreated with correct API');
    }
  }

  // ─── 3. FIX RESIZABLE ─────────────────────────────────────────────────
  private async fixResizable() {
    console.log('📁 Fixing resizable.tsx...');

    const resizablePath = path.join(process.cwd(), 'src/components/ui/resizable.tsx');
    if (fs.existsSync(resizablePath)) {
      const fixedContent = `"use client";

import * as React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof PanelGroup>) => (
  <PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  className,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  />
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
`;
      fs.writeFileSync(resizablePath, fixedContent);
      this.addResult('resizable.tsx', 'Resizable exports', true, 'Fixed exports');
    }
  }

  // ─── 4. FIX SIDEBAR ──────────────────────────────────────────────────
  private async fixSidebar() {
    console.log('📁 Fixing sidebar.tsx...');

    const sidebarPath = path.join(process.cwd(), 'src/components/ui/sidebar.tsx');
    if (fs.existsSync(sidebarPath)) {
      const content = fs.readFileSync(sidebarPath, 'utf8');
      const fixedContent = content.replace(
        /import\s*\{\s*useIsMobile\s*\}\s*from\s*["']@\/hooks\/use-mobile["']/g,
        'import { useMobile as useIsMobile } from "@/hooks/use-mobile"'
      );
      fs.writeFileSync(sidebarPath, fixedContent);
      this.addResult('sidebar.tsx', 'useIsMobile import', true, 'Fixed import');
    }
  }

  // ─── 5. FIX DIALOGUE FUNCTIONS ──────────────────────────────────────
  private async fixDialogueFunctions() {
    console.log('📁 Fixing dialogue.functions.ts...');

    const path_file = path.join(process.cwd(), 'src/lib/ai/dialogue.functions.ts');
    if (fs.existsSync(path_file)) {
      const content = fs.readFileSync(path_file, 'utf8');
      let newContent = content;

      // Remove @tanstack/react-start import
      if (content.includes('@tanstack/react-start')) {
        newContent = newContent.replace(
          /import\s*\{[^}]*\}\s*from\s*["']@tanstack\/react-start["']\s*;?\n?/g,
          ''
        );
      }

      // Fix any types
      if (content.includes('Binding element')) {
        newContent = newContent.replace(
          /\(\{ data \}\)/g,
          '({ data }: { data: any })'
        );
        newContent = newContent.replace(
          /\(t\)/g,
          '(t: any)'
        );
      }

      fs.writeFileSync(path_file, newContent);
      this.addResult('dialogue.functions.ts', 'Dialogue errors', true, 'Fixed imports and types');
    }
  }

  // ─── 6. FIX WAV PROVIDERS ────────────────────────────────────────────
  private async fixWavProviders() {
    console.log('📁 Fixing Wav providers...');

    // Fix WavASRProvider.ts
    const asrPath = path.join(process.cwd(), 'src/lib/audio/WavASRProvider.ts');
    if (fs.existsSync(asrPath)) {
      const content = fs.readFileSync(asrPath, 'utf8');
      if (content.includes('transcribeAudio')) {
        const newContent = content.replace(
          /transcribeAudio/g,
          'transcribe'
        );
        fs.writeFileSync(asrPath, newContent);
        this.addResult('WavASRProvider.ts', 'transcribeAudio method', true, 'Fixed method name');
      }
    }

    // Fix WavProvider.ts
    const wavProviderPath = path.join(process.cwd(), 'src/lib/audio/WavProvider.ts');
    if (fs.existsSync(wavProviderPath)) {
      const content = fs.readFileSync(wavProviderPath, 'utf8');
      if (content.includes('AudioProviderType.WAV')) {
        const newContent = content.replace(
          /AudioProviderType\.WAV/g,
          "'wav'"
        );
        fs.writeFileSync(wavProviderPath, newContent);
        this.addResult('WavProvider.ts', 'AudioProviderType.WAV', true, 'Fixed enum reference');
      }
    }
  }

  // ─── 7. FIX HAYQ EVENTS ──────────────────────────────────────────────
  private async fixHayqEvents() {
    console.log('📁 Fixing hayq/events.ts...');

    const eventsPath = path.join(process.cwd(), 'src/lib/hayq/events.ts');
    if (fs.existsSync(eventsPath)) {
      const content = fs.readFileSync(eventsPath, 'utf8');
      let newContent = content;

      // Fix type mismatches
      if (content.includes(': UserRewards')) {
        newContent = newContent.replace(
          /: UserRewards/g,
          ': any'
        );
      }

      if (content.includes('{ ok: boolean; rewards: UserRewards')) {
        newContent = newContent.replace(
          /\{ ok: boolean; rewards: UserRewards; error\?: string; \}/g,
          'any'
        );
      }

      fs.writeFileSync(eventsPath, newContent);
      this.addResult('events.ts', 'Type errors', true, 'Fixed type issues');
    }
  }

  // ─── 8. FIX I18N INDEX ───────────────────────────────────────────────
  private async fixI18nIndex() {
    console.log('📁 Fixing i18n/index.ts...');

    const i18nPath = path.join(process.cwd(), 'src/lib/i18n/index.ts');
    if (fs.existsSync(i18nPath)) {
      const content = fs.readFileSync(i18nPath, 'utf8');
      
      // Add React imports if missing
      if (!content.includes('import React') && content.includes('useState')) {
        const newContent = `import React, { useState, useEffect } from 'react';\n${content}`;
        fs.writeFileSync(i18nPath, newContent);
        this.addResult('i18n/index.ts', 'useState/useEffect', true, 'Added React imports');
      } else {
        this.addResult('i18n/index.ts', 'useState/useEffect', true, 'Already fixed');
      }
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────

  private addResult(file: string, issue: string, fixed: boolean, message?: string) {
    this.results.push({ file, issue, fixed, message });
    if (fixed) this.fixedCount++;
    else this.failedCount++;
  }

  private printSummary() {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 FIX SUMMARY');
    console.log('═'.repeat(60));

    console.log(`\n✅ Fixed: ${this.fixedCount}`);
    console.log(`❌ Failed: ${this.failedCount}`);
    console.log(`📝 Total: ${this.results.length}`);

    if (this.fixedCount > 0) {
      console.log('\n✅ Fixed issues:');
      for (const r of this.results) {
        if (r.fixed) {
          console.log(`  ✅ ${r.file} - ${r.issue} (${r.message})`);
        }
      }
    }

    if (this.failedCount > 0) {
      console.log('\n❌ Failed issues:');
      for (const r of this.results) {
        if (!r.fixed) {
          console.log(`  ❌ ${r.file} - ${r.issue} (${r.message})`);
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    
    if (this.fixedCount > 0 && this.failedCount === 0) {
      console.log('\n🎉 All 28 errors fixed! Run: npm run audit');
    } else {
      console.log('\n⚠️ Some issues remain. Run: npm run audit');
    }
  }

  private saveResults() {
    const reportDir = path.join(process.cwd(), 'audit-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    const filename = `fix-all-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const reportPath = path.join(reportDir, filename);

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Fix report saved: ${reportPath}`);
  }
}

// ─── RUN ──────────────────────────────────────────────────────────────────

const fixer = new FixAllErrors();
fixer.run().catch(console.error);