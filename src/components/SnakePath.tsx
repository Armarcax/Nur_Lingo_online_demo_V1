
// src/components/SnakePath.tsx
"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { LangCode } from "@/lib/i18n/index";

/**
 * Localized title supports missing translations.
 * Both old and new lock property names are supported.
 */
export interface SnakeNode {
  id: string;
  title: Partial<Record<LangCode, string>> | string;
  icon?: string;

  /** Supports both legacy and current lock properties. */
  isLocked?: boolean;
  locked?: boolean;

  /** 0 = not done, 1..3 = star/crown count. */
  crownLevel?: number;

  isReview?: boolean;
  isCurrent?: boolean;

  /** Small badge shown under the node. */
  subtitle?: string;

  /** Small badge on the right edge. */
  badge?: string;

  onClick?: () => void;
}

interface SnakePathProps {
  nodes: SnakeNode[];
  native: LangCode;
  colorFrom?: string;
  colorTo?: string;
  unlockAll?: boolean;
}

/**
 * Safely resolves a title using the selected language.
 * Falls back to English, Armenian, Russian, or any available translation.
 */
function getNodeTitle(
  title: SnakeNode["title"],
  native: LangCode
): string {
  if (typeof title === "string") {
    return title;
  }

  return (
    title[native] ??
    title.en ??
    title.hy ??
    title.ru ??
    Object.values(title).find(
      (value): value is string =>
        typeof value === "string" && value.length > 0
    ) ??
    ""
  );
}

export function SnakePath({
  nodes,
  native,
  colorFrom = "#D90012",
  colorTo = "#F2A800",
  unlockAll = false,
}: SnakePathProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState(400);

  // Responsive container measurement
  useEffect(() => {
    const measure = () => {
      const element = wrapperRef.current;

      if (!element || !element.parentElement) return;

      const available = element.parentElement.clientWidth - 48;

      setContainerWidth(
        Math.max(260, Math.min(400, available))
      );
    };

    const timeout = window.setTimeout(measure, 0);

    window.addEventListener("resize", measure);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Responsive dimensions
  const WIDTH = containerWidth;
  const scale = WIDTH / 400;

  const STEP_Y = 130 * scale;
  const AMPLITUDE = 140 * scale;
  const centerX = WIDTH / 2;

  const height = Math.max(
    160 * scale,
    nodes.length * STEP_Y + 40
  );

  const NODES_PER_SWING = 3.5;

  // Snake path coordinates
  const nodeX = (index: number) =>
    centerX +
    Math.sin((index / NODES_PER_SWING) * Math.PI) *
      AMPLITUDE;

  const nodeY = (index: number) =>
    50 + index * STEP_Y;

  // Generate connecting SVG path
  const pathD = useMemo(() => {
    return nodes.reduce((acc, _, index) => {
      const x = nodeX(index);
      const y = nodeY(index);

      if (index === 0) {
        return `M ${x} ${y}`;
      }

      const previousX = nodeX(index - 1);
      const previousY = nodeY(index - 1);

      const middleY = (previousY + y) / 2;

      return (
        `${acc} C ${previousX} ${middleY}, ` +
        `${x} ${middleY}, ${x} ${y}`
      );
    }, "");
  }, [nodes, centerX, STEP_Y, AMPLITUDE]);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto"
      style={{
        width: WIDTH,
        height,
      }}
    >
      {/* Connecting path */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={WIDTH}
        height={height}
        aria-hidden="true"
      >
        <path
          d={pathD}
          fill="none"
          stroke={colorFrom}
          strokeOpacity={0.35}
          strokeWidth={4}
          strokeDasharray="8 10"
          strokeLinecap="round"
        />
      </svg>

      {/* Learning nodes */}
      {nodes.map((node, index) => {
        const crownLevel = Math.max(
          0,
          Math.min(3, node.crownLevel ?? 0)
        );

        const done = crownLevel > 0;

        // Backward compatibility:
        // isLocked takes priority when explicitly provided.
        const isLocked =
          node.isLocked ?? node.locked ?? false;

        const unlocked = !isLocked || unlockAll;

        const title = getNodeTitle(
          node.title,
          native
        );

        return (
          <motion.button
            key={node.id}
            type="button"
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: index * 0.05,
            }}
            whileHover={
              unlocked ? { scale: 1.1 } : {}
            }
            whileTap={
              unlocked ? { scale: 0.95 } : {}
            }
            onClick={() => {
              if (unlocked) {
                node.onClick?.();
              }
            }}
            disabled={!unlocked}
            aria-label={title || node.id}
            aria-disabled={!unlocked}
            className={`absolute -translate-x-1/2 -translate-y-1/2 group ${
              node.isCurrent ? "animate-bob" : ""
            }`}
            style={{
              left: nodeX(index),
              top: nodeY(index),
            }}
          >
            {/* Achievement stars */}
            {done && (
              <div className="absolute -top-2 -right-2 flex gap-0.5 z-10">
                {[1, 2, 3].map((level) => (
                  <motion.div
                    key={level}
                    initial={{ scale: 0 }}
                    animate={{
                      scale:
                        crownLevel >= level ? 1 : 0,
                    }}
                    className="w-5 h-5 text-[9px] bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border border-yellow-600"
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
            )}

            {/* Locked indicator */}
            {!unlocked && !done && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-600">
                  <Lock
                    size={12}
                    className="text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Optional badge */}
            {node.badge && (
              <div className="absolute -top-1 -left-1 z-10">
                <div className="px-1.5 py-0.5 text-[8px] bg-blue-500 rounded-full text-white font-bold shadow-lg">
                  {node.badge}
                </div>
              </div>
            )}

            {/* Main node */}
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-[35%_65%_70%_30%/30%_30%_70%_70%] flex items-center justify-center text-3xl shadow-2xl border-4 transition-all ${
                !unlocked
                  ? "border-white/10 opacity-40 grayscale"
                  : done
                    ? "border-yellow-400 shadow-glow"
                    : node.isReview
                      ? "border-purple-400/60"
                      : "border-white/20"
              }`}
              style={{
                background: unlocked
                  ? `linear-gradient(135deg, ${
                      node.isReview
                        ? "#9333ea"
                        : colorFrom
                    }, ${
                      node.isReview
                        ? "#581c87"
                        : colorTo
                    })`
                  : "rgba(255,255,255,0.05)",
              }}
            >
              <span className="drop-shadow-lg">
                {!unlocked
                  ? "🔒"
                  : node.isReview
                    ? "🏆"
                    : node.icon || "📚"}
              </span>
            </div>

            {/* Node title */}
            <p className="mt-2 text-[10px] font-bold text-white/70 max-w-[90px] truncate text-center">
              {title}
            </p>

            {/* Node subtitle */}
            {node.subtitle && (
              <p className="text-[9px] text-white/50 max-w-[90px] truncate text-center">
                {node.subtitle}
              </p>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
