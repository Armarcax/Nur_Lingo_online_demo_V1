/**
 * Future blockchain readiness — stub layer.
 * Today everything is off-chain via wallet.ts. Tomorrow these interfaces
 * can be backed by Ethereum/Polygon/Solana without changing learning code.
 * 
 * NUR Lingo — HAYQ Blockchain Ready Layer
 * This is a stub for future blockchain integration.
 * Currently all operations are off-chain via wallet.ts.
 */

import { wallet } from "./wallet";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface WalletConnector {
  isConnected(): boolean;
  connect(): Promise<{ address: string }>;
  disconnect(): Promise<void>;
  address(): string | null;
  network?: string;
  chainId?: number;
}

export interface TokenService {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply(): Promise<bigint>;
  getBalance(address: string): Promise<bigint>;
}

export interface BalanceService {
  balanceOf(address: string | null): Promise<number>;
  getUsdValue?(amount: number): Promise<number>;
}

export interface TransactionService {
  transfer(to: string, amount: number, memo?: string): Promise<{ txId: string; hash?: string }>;
  getTransaction(txId: string): Promise<{ status: "pending" | "confirmed" | "failed"; data?: unknown }>;
  estimateGas?(from: string, to: string, amount: number): Promise<number>;
}

export interface BlockchainConfig {
  network: "mainnet" | "testnet" | "devnet" | "local";
  provider: "ethereum" | "polygon" | "solana" | "offchain";
  rpcUrl?: string;
}

// ─── OFF-CHAIN REFERENCE IMPLEMENTATIONS ────────────────────────────────────

export const offchainWalletConnector: WalletConnector = {
  isConnected: () => true,
  async connect() { return { address: "offchain:self" }; },
  async disconnect() {},
  address: () => "offchain:self",
  network: "local",
  chainId: 0,
};

export const hayqTokenService: TokenService = {
  symbol: "HAYQ",
  name: "Haykakan Aktiv Yuratsman Qanak",
  decimals: 0,
  async totalSupply() { return BigInt(1000000000); },
  async getBalance(address: string) {
    if (address === "offchain:self") {
      return BigInt(wallet.balance());
    }
    return BigInt(0);
  },
};

export const offchainBalanceService: BalanceService = {
  async balanceOf() { return wallet.balance(); },
  async getUsdValue(amount: number) {
    // Mock price: 1 HAYQ = $0.01
    return amount * 0.01;
  },
};

export const offchainTransactionService: TransactionService = {
  async transfer(to, amount, memo) {
    const result = wallet.debit(amount, "transfer", { to, memo });
    if (!result.ok) {
      throw new Error("Insufficient HAYQ balance");
    }
    return {
      txId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      hash: `0x${Math.random().toString(36).slice(2, 10)}`,
    };
  },
  async getTransaction(txId) {
    return {
      status: "confirmed",
      data: { txId, confirmedAt: new Date().toISOString() },
    };
  },
  async estimateGas() {
    return 21000;
  },
};

// ─── CONFIG ─────────────────────────────────────────────────────────────────

export const BLOCKCHAIN_CONFIG: BlockchainConfig = {
  network: "local",
  provider: "offchain",
  rpcUrl: undefined,
};

// ─── PROVIDER REGISTRY ──────────────────────────────────────────────────────

export interface BlockchainProvider {
  name: string;
  connector: WalletConnector;
  balance: BalanceService;
  token: TokenService;
  transaction: TransactionService;
}

export const OFFCHAIN_PROVIDER: BlockchainProvider = {
  name: "Offchain",
  connector: offchainWalletConnector,
  balance: offchainBalanceService,
  token: hayqTokenService,
  transaction: offchainTransactionService,
};

// ─── FUTURE PROVIDERS (stubs) ──────────────────────────────────────────────

export const ethereumProvider: BlockchainProvider = {
  name: "Ethereum",
  connector: {
    isConnected: () => false,
    async connect() { throw new Error("Not implemented"); },
    async disconnect() {},
    address: () => null,
    network: "mainnet",
    chainId: 1,
  },
  balance: {
    async balanceOf() { throw new Error("Not implemented"); },
  },
  token: {
    symbol: "HAYQ",
    name: "HAYQ Token",
    decimals: 18,
    async totalSupply() { throw new Error("Not implemented"); },
    async getBalance() { throw new Error("Not implemented"); },
  },
  transaction: {
    async transfer() { throw new Error("Not implemented"); },
    async getTransaction() { throw new Error("Not implemented"); },
  },
};

export const polygonProvider: BlockchainProvider = {
  name: "Polygon",
  connector: {
    isConnected: () => false,
    async connect() { throw new Error("Not implemented"); },
    async disconnect() {},
    address: () => null,
    network: "mainnet",
    chainId: 137,
  },
  balance: {
    async balanceOf() { throw new Error("Not implemented"); },
  },
  token: {
    symbol: "HAYQ",
    name: "HAYQ Token",
    decimals: 18,
    async totalSupply() { throw new Error("Not implemented"); },
    async getBalance() { throw new Error("Not implemented"); },
  },
  transaction: {
    async transfer() { throw new Error("Not implemented"); },
    async getTransaction() { throw new Error("Not implemented"); },
  },
};

// ─── ACTIVE PROVIDER ────────────────────────────────────────────────────────

let activeProvider: BlockchainProvider = OFFCHAIN_PROVIDER;

export function getActiveProvider(): BlockchainProvider {
  return activeProvider;
}

export function setActiveProvider(provider: BlockchainProvider): void {
  activeProvider = provider;
}

export function setProviderByName(name: "offchain" | "ethereum" | "polygon"): void {
  const providers: Record<string, BlockchainProvider> = {
    offchain: OFFCHAIN_PROVIDER,
    ethereum: ethereumProvider,
    polygon: polygonProvider,
  };
  if (providers[name]) {
    activeProvider = providers[name];
  }
}

// ─── HEALTH CHECK ───────────────────────────────────────────────────────────

export async function checkBlockchainHealth(): Promise<{
  healthy: boolean;
  provider: string;
  error?: string;
}> {
  try {
    const provider = getActiveProvider();
    const connected = provider.connector.isConnected();
    return {
      healthy: connected,
      provider: provider.name,
      error: connected ? undefined : "Provider is not connected",
    };
  } catch (error) {
    return {
      healthy: false,
      provider: getActiveProvider().name,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export default {
  OFFCHAIN_PROVIDER,
  ethereumProvider,
  polygonProvider,
  getActiveProvider,
  setActiveProvider,
  setProviderByName,
  checkBlockchainHealth,
  BLOCKCHAIN_CONFIG,
};