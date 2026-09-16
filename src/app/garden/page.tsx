// src/app/garden/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNuri } from "@/hooks/useNuri";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Shield,
  Bell,
  Clock,
  Coins,
  Sparkles,
  Gift,
  TrendingUp,
  CheckCircle,
  Zap,
  Leaf,
  Sun,
  Droplets,
  Flower,
  Sprout,
  TreePine,
  Gem,
  Crown,
  Award,
  Star,
  Rocket,
  Target,
  Flame,
  BookOpen,
  Users,
  MessageSquare,
  Music,
  Mic,
  Volume2,
  Settings,
  ChevronDown,
  ChevronUp,
  Gift as GiftIcon,
  Package,
  Store,
  BadgeCheck,
  AlertCircle,
  Loader2,
  ArrowUp,
  X,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Wallet,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import {
  loadRewards,
  buyStreakFreeze,
  buyHeartRefill,
  syncHearts,
  type UserRewards,
  addRewards,
} from "@/lib/rewards/seeds";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import {
  getNotificationTime,
  saveNotificationTime,
  requestNotificationPermission,
  getNotificationPermissionState,
} from "@/lib/notifications";
import { useI18n } from "@/hooks/useI18n";

// ─── TYPES ────────────────────────────────────────────────────────────

interface ShopItem {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  price: number;
  maxOwned?: number;
  owned?: number;
  color: string;
  bgGradient: string;
  badge: string;
  category: "consumable" | "permanent" | "cosmetic";
  discount?: number;
  limitedTime?: boolean;
  expiresIn?: number;
}

interface InventoryItem {
  id: string;
  nameKey: string;
  icon: string;
  quantity: number;
  type: "streak_freeze" | "heart_refill" | "cosmetic";
  acquiredAt: string;
}

interface SaleItem {
  id: string;
  itemId: string;
  discount: number;
  expiresIn: number;
}

// ─── SHOP ITEMS ──────────────────────────────────────────────────────

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "streak-freeze",
    nameKey: "garden_item_streak_freeze",
    descriptionKey: "garden_item_streak_freeze_desc",
    icon: <Shield size={28} />,
    price: 50,
    maxOwned: 2,
    owned: 0,
    color: "text-blue-400",
    bgGradient: "from-blue-500/20 to-blue-600/10",
    badge: "🛡️",
    category: "consumable",
  },
  {
    id: "heart-refill",
    nameKey: "garden_item_heart_refill",
    descriptionKey: "garden_item_heart_refill_desc",
    icon: <Heart size={28} />,
    price: 100,
    maxOwned: 5,
    owned: 0,
    color: "text-red-400",
    bgGradient: "from-red-500/20 to-red-600/10",
    badge: "❤️",
    category: "consumable",
  },
  {
    id: "double-xp",
    nameKey: "garden_item_double_xp",
    descriptionKey: "garden_item_double_xp_desc",
    icon: <Zap size={28} />,
    price: 80,
    maxOwned: 1,
    owned: 0,
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/20 to-yellow-600/10",
    badge: "⚡",
    category: "consumable",
  },
  {
    id: "golden-flower",
    nameKey: "garden_item_golden_flower",
    descriptionKey: "garden_item_golden_flower_desc",
    icon: <Flower size={28} />,
    price: 200,
    maxOwned: 1,
    owned: 0,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-amber-600/10",
    badge: "🌻",
    category: "cosmetic",
  },
  {
    id: "crown",
    nameKey: "garden_item_crown",
    descriptionKey: "garden_item_crown_desc",
    icon: <Crown size={28} />,
    price: 300,
    maxOwned: 1,
    owned: 0,
    color: "text-purple-400",
    bgGradient: "from-purple-500/20 to-purple-600/10",
    badge: "👑",
    category: "cosmetic",
  },
];

// ─── SALES ───────────────────────────────────────────────────────────

const SALES: SaleItem[] = [
  { id: "sale-1", itemId: "streak-freeze", discount: 20, expiresIn: 48 },
  { id: "sale-2", itemId: "double-xp", discount: 30, expiresIn: 72 },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function GardenPage() {
  const { setPage } = useNuri();
  const { t } = useI18n();
  
  // ─── LOCAL TOAST ──────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  
  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);
  
  useEffect(() => setPage("garden"), [setPage]);
  
  // ─── STATE ──────────────────────────────────────────────────────────
  
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [notifTime, setNotifTime] = useState("09:00");
  const [notifState, setNotifState] = useState<NotificationPermission>("default");
  const [nuriMood, setNuriMood] = useState<NuriMood>("happy");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmItemId, setConfirmItemId] = useState<string | null>(null);
  const [dailyDeal, setDailyDeal] = useState<SaleItem | null>(null);
  
  const topRef = useRef<HTMLDivElement>(null);

  // ─── LOAD DATA ──────────────────────────────────────────────────────

  useEffect(() => {
    setRewards(syncHearts());
    setNotifTime(getNotificationTime());
    setNotifState(getNotificationPermissionState());
    loadInventory();
    loadDailyDeal();
  }, []);

  // ─── SCROLL EVENT ──────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── LOAD INVENTORY ───────────────────────────────────────────────

  const loadInventory = useCallback(() => {
    try {
      const saved = localStorage.getItem("nurlingo_inventory");
      if (saved) {
        setInventory(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  // ─── SAVE INVENTORY ───────────────────────────────────────────────

  const saveInventory = useCallback((items: InventoryItem[]) => {
    try {
      localStorage.setItem("nurlingo_inventory", JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, []);

  // ─── LOAD DAILY DEAL ──────────────────────────────────────────────

  const loadDailyDeal = useCallback(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("nurlingo_daily_deal");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        setDailyDeal(data.deal);
        return;
      }
    }
    if (SALES.length > 0) {
      const deal = SALES[Math.floor(Math.random() * SALES.length)];
      setDailyDeal(deal);
      localStorage.setItem("nurlingo_daily_deal", JSON.stringify({
        date: today,
        deal,
      }));
    }
  }, []);

  // ─── BUY STREAK FREEZE ─────────────────────────────────────────────

  const handleBuyFreeze = useCallback(() => {
    const res = buyStreakFreeze();
    if (res.success) {
      setRewards(res.rewards);
      addToInventory("streak_freeze");
      showToast(t("garden_streak_freeze_purchased"), "success");
    } else {
      showToast(res.error || t("garden_purchase_failed"), "error");
    }
  }, [showToast, t]);

  // ─── BUY HEARTS ────────────────────────────────────────────────────

  const handleBuyHearts = useCallback(() => {
    const res = buyHeartRefill();
    if (res.success) {
      setRewards(res.rewards);
      showToast(t("garden_hearts_refilled"), "success");
    } else {
      showToast(res.error || t("garden_purchase_failed"), "error");
    }
  }, [showToast, t]);

  // ─── ADD TO INVENTORY ─────────────────────────────────────────────

  const addToInventory = useCallback((itemId: string) => {
    const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
    if (!shopItem) return;
    
    setInventory(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        const updated = prev.map(i => 
          i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
        );
        saveInventory(updated);
        return updated;
      }
      const newItem: InventoryItem = {
        id: itemId,
        nameKey: shopItem.nameKey,
        icon: shopItem.badge || "🎁",
        quantity: 1,
        type: shopItem.category === "consumable" ? "heart_refill" : "cosmetic",
        acquiredAt: new Date().toISOString(),
      };
      const updated = [...prev, newItem];
      saveInventory(updated);
      return updated;
    });
  }, [saveInventory]);

  // ─── HANDLE BUY ────────────────────────────────────────────────────

  const handleBuy = useCallback((itemId: string) => {
    setConfirmItemId(itemId);
    setShowConfirmModal(true);
  }, []);

  // ─── CONFIRM BUY ──────────────────────────────────────────────────

  const confirmBuy = useCallback(() => {
    if (!confirmItemId) return;
    
    setIsProcessing(true);
    
    const item = SHOP_ITEMS.find(i => i.id === confirmItemId);
    if (!item) {
      showToast(t("garden_item_not_found"), "error");
      setIsProcessing(false);
      setShowConfirmModal(false);
      return;
    }
    
    const owned = inventory.find(i => i.id === confirmItemId)?.quantity || 0;
    if (item.maxOwned !== undefined && owned >= item.maxOwned) {
      showToast(t("garden_max_owned"), "error");
      setIsProcessing(false);
      setShowConfirmModal(false);
      return;
    }
    
    let price = item.price;
    if (dailyDeal?.itemId === item.id) {
      price = Math.round(price * (1 - dailyDeal.discount / 100));
    }
    
    if (!rewards || rewards.totalHAYQ < price) {
      showToast(t("garden_not_enough_hayq", { price }), "error");
      setIsProcessing(false);
      setShowConfirmModal(false);
      return;
    }
    
    setTimeout(() => {
      const updated = addRewards(price * -1, 0);
      setRewards(updated);
      addToInventory(confirmItemId);
      
      if (confirmItemId === "heart-refill") {
        const res = buyHeartRefill();
        if (res.success) setRewards(res.rewards);
      }
      
      showToast(t("garden_purchased", { name: t(item.nameKey) }), "success");
      setIsProcessing(false);
      setShowConfirmModal(false);
      setConfirmItemId(null);
      setSelectedItem(null);
    }, 500);
  }, [confirmItemId, inventory, rewards, dailyDeal, addToInventory, showToast, t]);

  // ─── TOGGLE CART ──────────────────────────────────────────────────

  const toggleCart = useCallback(() => {
    setShowCart(prev => !prev);
  }, []);

  // ─── ADD TO CART ──────────────────────────────────────────────────

  const addToCart = useCallback((itemId: string) => {
    setCartItems(prev => {
      if (prev.includes(itemId)) {
        showToast(t("garden_already_in_cart"), "info");
        return prev;
      }
      const updated = [...prev, itemId];
      showToast(t("garden_added_to_cart"), "success");
      return updated;
    });
  }, [showToast, t]);

  // ─── REMOVE FROM CART ─────────────────────────────────────────────

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(id => id !== itemId));
  }, []);

  // ─── CHECKOUT ─────────────────────────────────────────────────────

  const checkout = useCallback(() => {
    if (cartItems.length === 0) {
      showToast(t("garden_cart_empty"), "error");
      return;
    }
    
    let totalPrice = 0;
    const itemsToBuy: string[] = [];
    
    for (const itemId of cartItems) {
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) continue;
      
      const owned = inventory.find(i => i.id === itemId)?.quantity || 0;
      if (item.maxOwned !== undefined && owned >= item.maxOwned) {
        showToast(t("garden_max_owned_item", { name: t(item.nameKey) }), "error");
        return;
      }
      
      let price = item.price;
      if (dailyDeal?.itemId === item.id) {
        price = Math.round(price * (1 - dailyDeal.discount / 100));
      }
      totalPrice += price;
      itemsToBuy.push(itemId);
    }
    
    if (!rewards || rewards.totalHAYQ < totalPrice) {
      showToast(t("garden_not_enough_hayq_total", { price: totalPrice }), "error");
      return;
    }
    
    const updated = addRewards(totalPrice * -1, 0);
    setRewards(updated);
    
    for (const itemId of itemsToBuy) {
      addToInventory(itemId);
      if (itemId === "heart-refill") {
        const res = buyHeartRefill();
        if (res.success) setRewards(res.rewards);
      }
    }
    
    setCartItems([]);
    setShowCart(false);
    showToast(t("garden_checkout_success", { count: itemsToBuy.length }), "success");
  }, [cartItems, inventory, rewards, dailyDeal, addToInventory, showToast, t]);

  // ─── SCROLL TO TOP ─────────────────────────────────────────────────

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─── GET ITEM PRICE ──────────────────────────────────────────────

  const getItemPrice = useCallback((itemId: string): number => {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return 0;
    let price = item.price;
    if (dailyDeal?.itemId === itemId) {
      price = Math.round(price * (1 - dailyDeal.discount / 100));
    }
    return price;
  }, [dailyDeal]);

  // ─── GET ITEM OWNED ──────────────────────────────────────────────

  const getItemOwned = useCallback((itemId: string): number => {
    return inventory.find(i => i.id === itemId)?.quantity || 0;
  }, [inventory]);

  if (!rewards) return null;

  const filteredItems = SHOP_ITEMS.filter(item => {
    if (activeCategory === "all") return true;
    return item.category === activeCategory;
  });

  // ─── RENDER ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-24">
      <div ref={topRef} />
      
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border-b border-white/20 dark:border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xl shadow-glow">
                🌿
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-gray-900 dark:text-white">
                  <span className="text-gradient">{t("garden_title")}</span> {t("garden_shop")}
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                  {t("garden_subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-xl bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:bg-white/50 dark:hover:bg-gray-800/80 transition-all"
              >
                <ShoppingCart size={18} className="text-gray-600 dark:text-gray-400" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              
              <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <Coins size={16} className="text-yellow-500" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {rewards.totalHAYQ}
                </span>
              </div>
              <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <Heart size={16} className="text-red-500" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {rewards.hearts}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <div className="container-main py-6">
        
        {/* ─── NURI SECTION ─── */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Nuri mood={nuriMood} size={120} glow={nuriMood === "excited"} />
          <NuriSpeech
            text={
              nuriMood === "excited"
                ? t("garden_nuri_excited")
                : nuriMood === "sad"
                ? t("garden_nuri_sad")
                : t("garden_nuri_idle")
            }
            mood={nuriMood}
          />
        </div>

        {/* ─── DAILY DEAL ─── */}
        {dailyDeal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-yellow-400">{t("garden_daily_deal")}</p>
                <p className="text-xs text-gray-300">
                  {t(SHOP_ITEMS.find(i => i.id === dailyDeal.itemId)?.nameKey || "")} — {t("garden_percent_off", { discount: dailyDeal.discount })}
                </p>
                <p className="text-[10px] text-gray-400">{t("garden_expires_in", { hours: dailyDeal.expiresIn })}</p>
              </div>
              <span className="text-2xl font-bold text-yellow-400">
                -{dailyDeal.discount}%
              </span>
            </div>
          </motion.div>
        )}

        {/* ─── STATS ROW ─── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl p-3 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Zap size={16} />
              <span className="text-lg font-bold text-gray-900 dark:text-white">{rewards.streak}</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("garden_streak")}</p>
          </div>
          <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl p-3 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              <Coins size={16} />
              <span className="text-lg font-bold text-gray-900 dark:text-white">{rewards.totalHAYQ}</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">HAYQ</p>
          </div>
          <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl p-3 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-center gap-1 text-emerald-500">
              <Package size={16} />
              <span className="text-lg font-bold text-gray-900 dark:text-white">{inventory.length}</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("garden_items")}</p>
          </div>
        </div>

        {/* ─── CATEGORY FILTER ─── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === "all"
                ? "bg-red-600 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            }`}
          >
            📚 {t("garden_all")}
          </button>
          <button
            onClick={() => setActiveCategory("consumable")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === "consumable"
                ? "bg-red-600 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            }`}
          >
            ⚡ {t("garden_consumable")}
          </button>
          <button
            onClick={() => setActiveCategory("permanent")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === "permanent"
                ? "bg-red-600 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            }`}
          >
            👑 {t("garden_permanent")}
          </button>
          <button
            onClick={() => setActiveCategory("cosmetic")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === "cosmetic"
                ? "bg-red-600 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            }`}
          >
            🌸 {t("garden_cosmetic")}
          </button>
        </div>

        {/* ─── SHOP ITEMS ─── */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const owned = getItemOwned(item.id);
            const isMaxed = item.maxOwned !== undefined && owned >= item.maxOwned;
            const price = getItemPrice(item.id);
            const canAfford = rewards.totalHAYQ >= price;
            const isDiscounted = dailyDeal?.itemId === item.id;
            const isSelected = selectedItem === item.id;
            const inCart = cartItems.includes(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border p-5 rounded-xl transition-all shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
                  isSelected
                    ? "border-red-500/50 shadow-[0_8px_32px_rgba(239,68,68,0.15)]"
                    : isDiscounted
                    ? "border-yellow-500/30"
                    : "border-white/20 dark:border-white/5 hover:border-white/30 dark:hover:border-white/10"
                }`}
                style={{
                  background: isDiscounted 
                    ? `linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,200,0,0.05))`
                    : `linear-gradient(135deg, rgba(255,255,255,0.4), ${item.bgGradient})`,
                }}
                onClick={() => setSelectedItem(isSelected ? null : item.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                      item.color
                    } bg-gradient-to-br ${item.bgGradient}`}
                  >
                    {item.badge}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t(item.nameKey)}
                      </h3>
                      {isMaxed && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          {t("garden_max")}
                        </span>
                      )}
                      {isDiscounted && (
                        <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                          🔥 {t("garden_sale_badge")}
                        </span>
                      )}
                      {inCart && (
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                          🛒
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(item.descriptionKey)}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Coins size={14} className="text-yellow-500" />
                        <span className={isDiscounted ? "line-through text-gray-400 mr-1" : "text-gray-900 dark:text-white"}>
                          {item.price}
                        </span>
                        {isDiscounted && (
                          <span className="text-red-500 font-bold">{price}</span>
                        )}
                      </div>
                      {item.maxOwned !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <span>📦</span>
                          <span>{owned} / {item.maxOwned}</span>
                        </div>
                      )}
                      <span className="text-[10px] text-gray-400 px-2 py-0.5 rounded-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm">
                        {t(item.category === "consumable" ? "garden_consumable" : item.category === "permanent" ? "garden_permanent" : "garden_cosmetic")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!inCart ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item.id);
                        }}
                        disabled={isMaxed}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isMaxed
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20"
                        }`}
                      >
                        <ShoppingCart size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.id);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 transition"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuy(item.id);
                      }}
                      disabled={isMaxed || !canAfford}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        isMaxed || !canAfford
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                      }`}
                    >
                      {isMaxed ? t("garden_owned") : `${price} 🪙`}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-white/20 dark:border-white/5 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        {item.id === "streak-freeze" && (
                          <p>
                            🛡️ {t("garden_streak_freeze_detail")}
                          </p>
                        )}
                        {item.id === "heart-refill" && (
                          <p>
                            ❤️ {t("garden_heart_refill_detail")}
                          </p>
                        )}
                        {item.id === "double-xp" && (
                          <p>
                            ⚡ {t("garden_double_xp_detail")}
                          </p>
                        )}
                        {item.id === "golden-flower" && (
                          <p>
                            🌻 {t("garden_golden_flower_detail")}
                          </p>
                        )}
                        {item.id === "crown" && (
                          <p>
                            👑 {t("garden_crown_detail")}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <TrendingUp size={12} />
                          <span>{t("garden_price")}: {price} HAYQ</span>
                          {isDiscounted && (
                            <span className="text-yellow-500">({dailyDeal?.discount}% off)</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ─── INVENTORY ─── */}
        {inventory.length > 0 && (
          <div className="mt-8 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Package size={18} className="text-emerald-500" />
              {t("garden_my_items")} ({inventory.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/40 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                >
                  <span>{item.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{t(item.nameKey)}</span>
                  {item.quantity > 1 && (
                    <span className="text-xs text-gray-500">×{item.quantity}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── NOTIFICATIONS SETTINGS ─── */}
        <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl p-5 mt-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-2xl">
              🔔
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("garden_daily_reminders")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("garden_daily_reminders_desc")}
              </p>

              {notifState !== "granted" ? (
                <button
                  onClick={async () => {
                    const granted = await requestNotificationPermission();
                    setNotifState(granted ? "granted" : "denied");
                    if (granted) {
                      showToast(t("garden_notifications_enabled"), "success");
                    } else {
                      showToast(t("garden_notifications_denied"), "error");
                    }
                  }}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-colors shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                >
                  <Bell size={16} />
                  {t("garden_enable_notifications")}
                </button>
              ) : (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={16} />
                    <span>{t("garden_reminder_time")}</span>
                  </div>
                  <input
                    type="time"
                    value={notifTime}
                    onChange={(e) => {
                      setNotifTime(e.target.value);
                      saveNotificationTime(e.target.value);
                      showToast(t("garden_time_updated"), "success");
                    }}
                    className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 px-4 py-2 rounded-xl font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                  />
                  <span className="text-xs text-emerald-500 flex items-center gap-1">
                    <CheckCircle size={14} />
                    {t("garden_active")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── TOAST MESSAGE ─── */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border px-6 py-3 max-w-sm rounded-xl text-center shadow-xl ${
                toastType === "success"
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : toastType === "error"
                  ? "border-red-500/30 text-red-600 dark:text-red-400"
                  : "border-blue-500/30 text-blue-600 dark:text-blue-400"
              }`}
            >
              <p className="text-sm font-medium">{toastMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── CONFIRM MODAL ─── */}
        <AnimatePresence>
          {showConfirmModal && confirmItemId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl p-6 max-w-sm w-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">
                    {SHOP_ITEMS.find(i => i.id === confirmItemId)?.badge || "🎁"}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("garden_confirm_purchase")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("garden_buy_confirm", { name: t(SHOP_ITEMS.find(i => i.id === confirmItemId)?.nameKey || "") })}
                  </p>
                  <p className="text-lg font-bold text-yellow-500 mt-2">
                    {getItemPrice(confirmItemId)} 🪙
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 dark:border-gray-700 font-bold text-sm hover:bg-white/10 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                  >
                    {t("garden_cancel")}
                  </button>
                  <button
                    onClick={confirmBuy}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t("garden_processing")}
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        {t("garden_buy")}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── CART MODAL ─── */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              className="fixed inset-0 z-[90] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-6 overflow-y-auto"
            >
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingCart size={24} className="text-red-500" />
                    {t("garden_cart")}
                  </h2>
                  <button
                    onClick={toggleCart}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                    <p>{t("garden_cart_empty")}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {cartItems.map((itemId) => {
                        const item = SHOP_ITEMS.find(i => i.id === itemId);
                        if (!item) return null;
                        const price = getItemPrice(itemId);
                        return (
                          <div
                            key={itemId}
                            className="flex items-center gap-3 p-3 bg-white/40 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/5"
                          >
                            <span className="text-2xl">{item.badge}</span>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 dark:text-white">{t(item.nameKey)}</p>
                              <p className="text-sm text-gray-500">{price} 🪙</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(itemId)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-white/20 dark:border-white/5 pt-4">
                      <div className="flex justify-between text-lg font-bold mb-4">
                        <span className="text-gray-900 dark:text-white">{t("garden_total")}</span>
                        <span className="text-yellow-500">
                          {cartItems.reduce((sum, id) => sum + getItemPrice(id), 0)} 🪙
                        </span>
                      </div>
                      <button
                        onClick={checkout}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                      >
                        <CreditCard size={18} />
                        {t("garden_checkout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── SCROLL TO TOP ─── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-50 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 p-3.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all"
          >
            <ArrowUp size={20} className="text-gray-900 dark:text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}