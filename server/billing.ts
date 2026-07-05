import crypto from "crypto";
import fs from "fs";
import path from "path";
import Razorpay from "razorpay";

// -------------------------------------------------------------
// SECURE COGNITIVE BILLING TYPES & SCHEMAS
// -------------------------------------------------------------

export interface TokenWallet {
  id: string;
  user_id: string;
  organization_id: string | null;
  monthly_tokens_total: number;
  monthly_tokens_used: number;
  topup_tokens_total: number;
  topup_tokens_used: number;
  reserved_tokens: number;
  available_tokens: number;
  billing_cycle_start: string;
  billing_cycle_end: string;
  updated_at: string;
}

export interface TokenLedgerEntry {
  id: string;
  user_id: string;
  organization_id: string | null;
  request_id: string;
  transaction_type: "reserve" | "bill" | "refund" | "topup" | "credit" | "reset";
  source: string;
  tokens_reserved: number;
  tokens_billed: number;
  tokens_refunded: number;
  balance_before: number;
  balance_after: number;
  reason: string;
  created_at: string;
}

export interface UsageEvent {
  id: string;
  user_id: string;
  organization_id: string | null;
  request_id: string;
  parent_request_id: string | null;
  module_name: string;
  feature_name: string;
  provider: string;
  model: string;
  agent_name: string;
  api_key_alias: string;
  input_tokens: number;
  output_tokens: number;
  reasoning_tokens: number;
  citation_tokens: number;
  search_queries: number;
  image_count: number;
  video_seconds: number;
  audio_minutes: number;
  tts_characters: number;
  conversion_credits: number;
  third_party_request_count: number;
  estimated_raw_cost_usd: number;
  actual_raw_cost_usd: number;
  reserved_platform_tokens: number;
  billed_platform_tokens: number;
  refunded_platform_tokens: number;
  status: "reserved" | "completed" | "failed" | "stopped";
  retry_count: number;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ProviderCost {
  id: string;
  provider: string;
  model_or_service: string;
  input_price_per_million: number;
  output_price_per_million: number;
  reasoning_price_per_million: number;
  image_price: number;
  video_price_per_second: number;
  audio_price_per_minute: number;
  tts_price_per_million_characters: number;
  search_price_per_1000: number;
  conversion_credit_price: number;
  third_party_request_price: number;
  currency: "USD" | "INR";
  active: boolean;
  updated_at: string;
}

export interface RazorpayOrderRecord {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  plan_id: string | null;
  topup_pack_id: string | null;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  signature_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookEventLog {
  id: string;
  provider: "razorpay" | "stripe";
  event_id: string;
  event_type: string;
  payload_hash: string;
  processed: boolean;
  processed_at: string | null;
  created_at: string;
}

export interface JobRecord {
  id: string;
  user_id: string;
  module_name: string;
  feature_name: string;
  status: "pending" | "processing" | "completed" | "failed" | "stopped";
  priority: "standard" | "high";
  reserved_tokens: number;
  billed_tokens: number;
  progress: number;
  input_metadata: string | null;
  output_metadata: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// -------------------------------------------------------------
// PRICING PLANS AND EXPLICIT LIMITATION METRICS
// -------------------------------------------------------------

export interface PricingPlan {
  id: string;
  name: string;
  monthly_price_inr: number;
  monthly_price_usd: number;
  included_tokens: number;
  max_daily_tokens: number;
  max_concurrent_jobs: number;
  max_file_size_mb: number;
  seats_included: number;
  premium_models_allowed: boolean;
  video_allowed: boolean;
  hd_video_allowed: boolean;
  bulk_conversion_allowed: boolean;
  priority_queue: boolean;
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  free_trial: {
    id: "free_trial",
    name: "Free Trial",
    monthly_price_inr: 0,
    monthly_price_usd: 0,
    included_tokens: 150,
    max_daily_tokens: 30, // matches daily cap: 30 quick messages / approx 30 tokens
    max_concurrent_jobs: 1,
    max_file_size_mb: 10,
    seats_included: 1,
    premium_models_allowed: false,
    video_allowed: false,
    hd_video_allowed: false,
    bulk_conversion_allowed: false,
    priority_queue: false
  },
  starter: {
    id: "starter",
    name: "Starter Workspace",
    monthly_price_inr: 699, // ₹699/mo
    monthly_price_usd: 9,   // $9/mo
    included_tokens: 1200,  // 1,200 tokens
    max_daily_tokens: 250,  // daily cap: 250 tokens
    max_concurrent_jobs: 2,
    max_file_size_mb: 50,   // file cap 50MB
    seats_included: 1,
    premium_models_allowed: false,
    video_allowed: true,
    hd_video_allowed: false,
    bulk_conversion_allowed: false,
    priority_queue: false
  },
  pro: {
    id: "pro", // serves as Creator/Pro
    name: "Pro Developer",
    monthly_price_inr: 1499, // ₹1,499/mo
    monthly_price_usd: 19,   // $19/mo
    included_tokens: 2800,  // 2,800 tokens
    max_daily_tokens: 700,  // daily cap: 700 tokens
    max_concurrent_jobs: 3,
    max_file_size_mb: 200,  // file cap 200MB
    seats_included: 1,
    premium_models_allowed: true,
    video_allowed: true,
    hd_video_allowed: false,
    bulk_conversion_allowed: true,
    priority_queue: true
  },
  ultra: {
    id: "ultra", // serves as Growth/Ultra
    name: "Ultra Workstation",
    monthly_price_inr: 3999, // ₹3,999/mo
    monthly_price_usd: 49,   // $49/mo
    included_tokens: 8000,  // 8,000 tokens
    max_daily_tokens: 2000, // daily cap: 2,000 tokens
    max_concurrent_jobs: 5,
    max_file_size_mb: 1000, // file cap 1GB
    seats_included: 1,
    premium_models_allowed: true,
    video_allowed: true,
    hd_video_allowed: true,
    bulk_conversion_allowed: true,
    priority_queue: true
  },
  custom_individual: {
    id: "custom_individual",
    name: "Custom Individual",
    monthly_price_inr: 2400, // starting
    monthly_price_usd: 29,
    included_tokens: 15000,
    max_daily_tokens: 5000,
    max_concurrent_jobs: 5,
    max_file_size_mb: 1000,
    seats_included: 1,
    premium_models_allowed: true,
    video_allowed: true,
    hd_video_allowed: true,
    bulk_conversion_allowed: true,
    priority_queue: true
  },
  school: {
    id: "school",
    name: "School & Academy",
    monthly_price_inr: 8200, // approx $99
    monthly_price_usd: 99,
    included_tokens: 20000,
    max_daily_tokens: 5000,
    max_concurrent_jobs: 10,
    max_file_size_mb: 2000, // 2GB
    seats_included: 50,     // 50 student seats
    premium_models_allowed: true,
    video_allowed: true,
    hd_video_allowed: false,
    bulk_conversion_allowed: true,
    priority_queue: true
  },
  company: {
    id: "company",
    name: "Company & SaaS",
    monthly_price_inr: 16500, // approx $199
    monthly_price_usd: 199,
    included_tokens: 50000,
    max_daily_tokens: 15000,
    max_concurrent_jobs: 15,
    max_file_size_mb: 2000, // 2GB
    seats_included: 15,     // 15 pooled seats
    premium_models_allowed: true,
    video_allowed: true,
    hd_video_allowed: true,
    bulk_conversion_allowed: true,
    priority_queue: true
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise SLA",
    monthly_price_inr: 75000, // ₹75,000/mo
    monthly_price_usd: 999,   // $999/mo
    included_tokens: 500000, // 500k tokens
    max_daily_tokens: 100000, // daily cap 100k
    max_concurrent_jobs: 100,
    max_file_size_mb: 10000, // 10GB file
    seats_included: 200,    // 200 pooled seats
    premium_models_allowed: true,
    video_allowed: true,
    hd_video_allowed: true,
    bulk_conversion_allowed: true,
    priority_queue: true
  }
};

export interface TopupPack {
  id: string;
  name: string;
  price_inr: number;
  tokens_credited: number;
  validity_days: number;
}

export const TOPUP_PACKS: Record<string, TopupPack> = {
  micro: {
    id: "micro",
    name: "Micro Pack",
    price_inr: 299,
    tokens_credited: 500,
    validity_days: 90
  },
  creator: {
    id: "creator",
    name: "Creator Pack",
    price_inr: 999,
    tokens_credited: 2500,
    validity_days: 120
  },
  agency: {
    id: "agency",
    name: "Agency Pack",
    price_inr: 2999,
    tokens_credited: 7000,
    validity_days: 180
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Top-Up",
    price_inr: 9999,
    tokens_credited: 25000,
    validity_days: 365
  }
};

// -------------------------------------------------------------
// TOKEN ACTION BASE RATES CARD
// -------------------------------------------------------------

export interface FeatureRate {
  min_tokens: number;
  multiplier_per_unit?: number; // e.g. per page, per sec, per min, etc.
}

export const RATE_CARD: Record<string, Record<string, FeatureRate>> = {
  intelligence_core: {
    quick_chat: { min_tokens: 2 },
    long_answer: { min_tokens: 5 },
    document_summary: { min_tokens: 8 },
    coding_standard: { min_tokens: 10 },
    coding_premium: { min_tokens: 30 },
    research_brief: { min_tokens: 150 },
    deep_research: { min_tokens: 400 },
    memory_search: { min_tokens: 2 },
    web_search: { min_tokens: 5 } // per tool batch
  },
  imagine_studio: {
    story_generation: { min_tokens: 5 },
    image_1k: { min_tokens: 30 },
    image_2k: { min_tokens: 45 },
    image_edit: { min_tokens: 35 },
    background_removal: { min_tokens: 10 },
    logo_generation: { min_tokens: 20 },
    audio_transcription: { min_tokens: 2, multiplier_per_unit: 2 }, // per minute
    realtime_transcription: { min_tokens: 8, multiplier_per_unit: 8 }, // per minute
    text_to_speech: { min_tokens: 7, multiplier_per_unit: 7 }, // per 1000 chars
    video_5s_720p: { min_tokens: 220 },
    video_10s_720p: { min_tokens: 440 },
    video_5s_1080p: { min_tokens: 1500 },
    video_10s_1080p: { min_tokens: 3000 },
    lipsync_generation: { min_tokens: 150 } // plus video seconds and audio minutes
  },
  trend_intelligence: {
    simple_scan: { min_tokens: 20 },
    opportunity_report: { min_tokens: 60 },
    deep_report: { min_tokens: 150 },
    niche_analysis: { min_tokens: 100 },
    competitor_comparison: { min_tokens: 80 },
    combined_report: { min_tokens: 200 }
  },
  content_analyzer: {
    youtube_audit: { min_tokens: 15 },
    seo_rewrite: { min_tokens: 25 },
    suggestion_report: { min_tokens: 20 },
    competitor_comparison: { min_tokens: 50 },
    oauth_analytics: { min_tokens: 75 },
    deep_strategy: { min_tokens: 150 }
  },
  live_intel: {
    cached_news: { min_tokens: 1 },
    personalized_news: { min_tokens: 10 },
    business_brief: { min_tokens: 15 },
    youtube_trending: { min_tokens: 10 },
    market_brief: { min_tokens: 15 },
    live_report: { min_tokens: 75 }
  },
  indian_airspace: {
    map_view: { min_tokens: 0 },
    aircraft_brief: { min_tokens: 10 },
    session_filters: { min_tokens: 20 }, // per session
    historical_route: { min_tokens: 5 }
  },
  file_transfer: {
    basic_conversion: { min_tokens: 5 },
    office_to_pdf: { min_tokens: 10 },
    pdf_to_office: { min_tokens: 20 },
    video_conversion: { min_tokens: 20 },
    audio_conversion: { min_tokens: 10 },
    bulk_conversion: { min_tokens: 30 } // with 30% buffer
  }
};

// -------------------------------------------------------------
// SEEDED PROVIDER RAW COSTS (PER 1M TOKENS OR PER UNIT) IN USD
// -------------------------------------------------------------

export const PROVIDER_RAW_COSTS: Record<string, Record<string, Partial<ProviderCost>>> = {
  gemini: {
    "gemini-3.5-flash": {
      input_price_per_million: 0.075,
      output_price_per_million: 0.30
    },
    "gemini-2.5-pro": {
      input_price_per_million: 1.25,
      output_price_per_million: 5.00
    },
    "gemini-embedding-2-preview": {
      input_price_per_million: 0.02
    }
  },
  openai: {
    "gpt-4o-mini": {
      input_price_per_million: 0.150,
      output_price_per_million: 0.60
    },
    "gpt-4o": {
      input_price_per_million: 2.50,
      output_price_per_million: 10.00
    },
    "dall-e-3": {
      image_price: 0.02 // $0.02 per image
    }
  },
  anthropic: {
    "claude-3-5-sonnet": {
      input_price_per_million: 3.00,
      output_price_per_million: 15.00
    }
  },
  deepseek: {
    "deepseek-coder": {
      input_price_per_million: 0.14,
      output_price_per_million: 0.28
    }
  },
  grok: {
    "grok-2": {
      input_price_per_million: 2.00,
      output_price_per_million: 10.00,
      search_price_per_1000: 1.00
    }
  },
  higgsfield: {
    "video-generator": {
      video_price_per_second: 0.05
    }
  },
  cloudconvert: {
    "file-converter": {
      conversion_credit_price: 0.015
    }
  }
};

// Helper to determine raw provider costs dynamically
export function calculateRawProviderCost(
  provider: string,
  model: string,
  metrics: {
    inputTokens?: number;
    outputTokens?: number;
    searchQueries?: number;
    imagesCount?: number;
    videoSeconds?: number;
  }
): number {
  const prov = provider.toLowerCase();
  const mdl = model.toLowerCase();
  
  // Find match in configuration
  let rates: Partial<ProviderCost> | null = null;
  
  for (const pKey in PROVIDER_RAW_COSTS) {
    if (pKey.toLowerCase() === prov) {
      for (const mKey in PROVIDER_RAW_COSTS[pKey]) {
        if (mKey.toLowerCase() === mdl || mdl.includes(mKey.toLowerCase())) {
          rates = PROVIDER_RAW_COSTS[pKey][mKey];
          break;
        }
      }
    }
  }
  
  if (!rates) {
    // Return standard generic cost if model matches none
    return ((metrics.inputTokens || 0) * 0.0000005) + ((metrics.outputTokens || 0) * 0.0000015);
  }
  
  let costUsd = 0;
  if (rates.input_price_per_million && metrics.inputTokens) {
    costUsd += (metrics.inputTokens / 1000000) * rates.input_price_per_million;
  }
  if (rates.output_price_per_million && metrics.outputTokens) {
    costUsd += (metrics.outputTokens / 1000000) * rates.output_price_per_million;
  }
  if (rates.image_price && metrics.imagesCount) {
    costUsd += metrics.imagesCount * rates.image_price;
  }
  if (rates.video_price_per_second && metrics.videoSeconds) {
    costUsd += metrics.videoSeconds * rates.video_price_per_second;
  }
  if (rates.search_price_per_1000 && metrics.searchQueries) {
    costUsd += (metrics.searchQueries / 1000) * rates.search_price_per_1000;
  }
  
  return costUsd;
}

// -------------------------------------------------------------
// CORE BILLING AND RESOURCE GATE STATE MANAGER
// -------------------------------------------------------------

export class TokenBillingSystem {
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  private readDB(): any {
    try {
      if (!fs.existsSync(this.dbPath)) {
        return {};
      }
      return JSON.parse(fs.readFileSync(this.dbPath, "utf-8"));
    } catch (e) {
      console.error("Billing readDB error:", e);
      return {};
    }
  }

  private writeDB(db: any): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), "utf-8");
    } catch (e) {
      console.error("Billing writeDB error:", e);
    }
  }

  // Ensure user wallet is initialized
  public ensureWallet(userId: string, planId: string = "free_trial"): TokenWallet {
    const db = this.readDB();
    if (!db.token_wallets) db.token_wallets = [];
    
    let wallet = db.token_wallets.find((w: any) => w.user_id === userId);
    const plan = PRICING_PLANS[planId] || PRICING_PLANS.free_trial;
    
    if (!wallet) {
      wallet = {
        id: `wallet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: userId,
        organization_id: db.organizationAccount?.id || null,
        monthly_tokens_total: plan.included_tokens,
        monthly_tokens_used: 0,
        topup_tokens_total: 0,
        topup_tokens_used: 0,
        reserved_tokens: 0,
        available_tokens: plan.included_tokens,
        billing_cycle_start: new Date().toISOString(),
        billing_cycle_end: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };
      db.token_wallets.push(wallet);
      
      // Log welcome token credit in Ledger
      if (!db.token_ledger) db.token_ledger = [];
      db.token_ledger.push({
        id: `led-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: userId,
        organization_id: wallet.organization_id,
        request_id: "init",
        transaction_type: "credit",
        source: "system",
        tokens_reserved: 0,
        tokens_billed: 0,
        tokens_refunded: 0,
        balance_before: 0,
        balance_after: plan.included_tokens,
        reason: `Initial credit for subscription plan: ${plan.name}`,
        created_at: new Date().toISOString()
      });
      
      this.writeDB(db);
    }
    
    return wallet;
  }

  // Hard gating: daily usage ceiling, concurrency limits, plan level lockchecks
  public verifyLimitsAndAccess(
    userId: string,
    moduleName: string,
    featureName: string,
    options?: {
      fileSizeMb?: number;
      isPremiumModel?: boolean;
      isVideoRequest?: boolean;
    }
  ): { allowed: boolean; reason?: string } {
    const db = this.readDB();
    const sub = db.subscription || { planId: "free_trial", status: "active" };
    const planId = sub.planId || "free_trial";
    const plan = PRICING_PLANS[planId] || PRICING_PLANS.free_trial;
    
    // Ensure wallet exists
    const wallet = this.ensureWallet(userId, planId);
    
    // 1. Check if user is over daily burn cap
    const todayStr = new Date().toISOString().split("T")[0];
    if (!db.usage_events) db.usage_events = [];
    const dailyBilled = db.usage_events
      .filter((e: any) => e.user_id === userId && e.created_at.startsWith(todayStr))
      .reduce((acc: number, cur: any) => acc + (cur.billed_platform_tokens || 0), 0);
    
    if (dailyBilled >= plan.max_daily_tokens) {
      return {
        allowed: false,
        reason: `Daily Limit Reached: You have consumed ${dailyBilled} tokens today. Your plan allows a maximum of ${plan.max_daily_tokens} tokens per day. Upgrade your plan or purchase top-ups to lift limits.`
      };
    }

    // 2. Check if total tokens are empty
    if (wallet.available_tokens <= 0) {
      return {
        allowed: false,
        reason: "Insufficient Tokens: Your platform token balance is 0. Please purchase a Top-up Pack or upgrade your subscription plan to continue."
      };
    }

    // 3. Check file size limits
    if (options?.fileSizeMb && options.fileSizeMb > plan.max_file_size_mb) {
      return {
        allowed: false,
        reason: `File Limit Exceeded: The uploaded file is ${options.fileSizeMb}MB. Your current plan [${plan.name}] has a maximum file limit of ${plan.max_file_size_mb}MB. Please upgrade your plan.`
      };
    }

    // 4. Premium models access locks
    if (options?.isPremiumModel && !plan.premium_models_allowed) {
      return {
        allowed: false,
        reason: `Engine Locked: Advanced Reasoning and Specialist models (Claude, Grok, etc.) are locked on your current plan [${plan.name}]. Please upgrade to a Pro or higher subscription.`
      };
    }

    // 5. Video generation locks
    if (options?.isVideoRequest && !plan.video_allowed) {
      return {
        allowed: false,
        reason: `Creative Locked: Video generation capabilities are locked on your current plan [${plan.name}]. Please upgrade to Starter or higher.`
      };
    }

    // 6. Concurrency job limit gate
    if (!db.jobs) db.jobs = [];
    const activeJobs = db.jobs.filter((j: any) => j.user_id === userId && j.status === "processing").length;
    if (activeJobs >= plan.max_concurrent_jobs) {
      return {
        allowed: false,
        reason: `Concurrency Limit Engaged: You have ${activeJobs} active creation requests processing in parallel. Your current plan allows a maximum of ${plan.max_concurrent_jobs} concurrent job. Please wait for previous tasks to complete.`
      };
    }

    return { allowed: true };
  }

  // Pre-expensive job: Estimate and reserve tokens inside wallet
  public reserveTokensForAction(
    userId: string,
    moduleName: string,
    featureName: string,
    customEstimatedAmount?: number
  ): { success: boolean; requestId: string; error?: string; reservedAmount: number } {
    const db = this.readDB();
    const sub = db.subscription || { planId: "free_trial", status: "active" };
    const planId = sub.planId || "free_trial";
    const wallet = this.ensureWallet(userId, planId);
    const plan = PRICING_PLANS[planId] || PRICING_PLANS.free_trial;

    // Compute expected reservation amount
    let estimatedTokens = 10; // generic fallback
    const moduleRates = RATE_CARD[moduleName];
    if (moduleRates && moduleRates[featureName]) {
      estimatedTokens = moduleRates[featureName].min_tokens;
    }
    if (customEstimatedAmount !== undefined) {
      estimatedTokens = customEstimatedAmount;
    }

    // Strict validation: do they have enough tokens?
    if (wallet.available_tokens < estimatedTokens) {
      return {
        success: false,
        requestId: "",
        reservedAmount: 0,
        error: `Insufficient Wallet Balance: This action requires an estimated ${estimatedTokens} platform tokens, but you only have ${wallet.available_tokens} available. Please purchase a top-up pack to proceed.`
      };
    }

    // Reserve tokens
    wallet.reserved_tokens += estimatedTokens;
    wallet.available_tokens -= estimatedTokens;
    wallet.updated_at = new Date().toISOString();

    const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Update wallet index
    const wIndex = db.token_wallets.findIndex((w: any) => w.user_id === userId);
    if (wIndex >= 0) db.token_wallets[wIndex] = wallet;

    // Log reservation in ledger
    if (!db.token_ledger) db.token_ledger = [];
    db.token_ledger.push({
      id: `led-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      organization_id: wallet.organization_id,
      request_id: requestId,
      transaction_type: "reserve",
      source: `${moduleName}/${featureName}`,
      tokens_reserved: estimatedTokens,
      tokens_billed: 0,
      tokens_refunded: 0,
      balance_before: wallet.available_tokens + estimatedTokens,
      balance_after: wallet.available_tokens,
      reason: `Pre-flight hold for ${moduleName} - ${featureName}`,
      created_at: new Date().toISOString()
    });

    // Create a pending usage event
    if (!db.usage_events) db.usage_events = [];
    db.usage_events.push({
      id: `use-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      organization_id: wallet.organization_id,
      request_id: requestId,
      parent_request_id: null,
      module_name: moduleName,
      feature_name: featureName,
      provider: "unknown",
      model: "unknown",
      agent_name: "unknown",
      api_key_alias: "unknown",
      input_tokens: 0,
      output_tokens: 0,
      reasoning_tokens: 0,
      citation_tokens: 0,
      search_queries: 0,
      image_count: 0,
      video_seconds: 0,
      audio_minutes: 0,
      tts_characters: 0,
      conversion_credits: 0,
      third_party_request_count: 0,
      estimated_raw_cost_usd: 0,
      actual_raw_cost_usd: 0,
      reserved_platform_tokens: estimatedTokens,
      billed_platform_tokens: 0,
      refunded_platform_tokens: 0,
      status: "reserved",
      retry_count: 0,
      error_code: null,
      error_message: null,
      created_at: new Date().toISOString(),
      completed_at: null
    });

    // Create a job tracking entry
    if (!db.jobs) db.jobs = [];
    db.jobs.push({
      id: requestId,
      user_id: userId,
      module_name: moduleName,
      feature_name: featureName,
      status: "processing",
      priority: plan.priority_queue ? "high" : "standard",
      reserved_tokens: estimatedTokens,
      billed_tokens: 0,
      progress: 10,
      input_metadata: null,
      output_metadata: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null
    });

    this.writeDB(db);
    return { success: true, requestId, reservedAmount: estimatedTokens };
  }

  // After job complete: settle billed amount with 2x markup model and 20% owner margin
  public billAndReleaseTokens(
    userId: string,
    requestId: string,
    usageDetails: {
      provider: string;
      model: string;
      agentName: string;
      apiKeyAlias: string;
      inputTokens?: number;
      outputTokens?: number;
      searchQueries?: number;
      imageCount?: number;
      videoSeconds?: number;
      audioMinutes?: number;
      ttsCharacters?: number;
      conversionCredits?: number;
      thirdPartyRequests?: number;
    },
    isFailed: boolean = false,
    errorMessage?: string
  ): { success: boolean; billed: number; refunded: number; currentBalance: number } {
    const db = this.readDB();
    
    // Find matching usage event and wallet
    if (!db.usage_events) db.usage_events = [];
    const uEvent = db.usage_events.find((e: any) => e.request_id === requestId);
    const wallet = db.token_wallets?.find((w: any) => w.user_id === userId);
    const job = db.jobs?.find((j: any) => j.id === requestId);

    if (!uEvent || !wallet) {
      console.error(`[Billing] Missing event or wallet for request: ${requestId}`);
      return { success: false, billed: 0, refunded: 0, currentBalance: wallet?.available_tokens || 0 };
    }

    const reservedAmount = uEvent.reserved_platform_tokens;
    let tokensBilled = 0;
    let tokensRefunded = 0;

    // Retrieve feature rates card
    let rateCardMin = 10;
    const mRates = RATE_CARD[uEvent.module_name];
    if (mRates && mRates[uEvent.feature_name]) {
      rateCardMin = mRates[uEvent.feature_name].min_tokens;
    }

    // Process failed job
    if (isFailed) {
      // Failed job: refund reserved tokens unless real provider costs were incurred
      tokensRefunded = reservedAmount;
      tokensBilled = 0;
      
      wallet.reserved_tokens = Math.max(0, wallet.reserved_tokens - reservedAmount);
      wallet.available_tokens += tokensRefunded;
      
      uEvent.status = "failed";
      uEvent.error_message = errorMessage || "Creation process timed out.";
      uEvent.refunded_platform_tokens = tokensRefunded;
      uEvent.billed_platform_tokens = 0;
      uEvent.completed_at = new Date().toISOString();

      if (job) {
        job.status = "failed";
        job.billed_tokens = 0;
        job.progress = 100;
        job.completed_at = new Date().toISOString();
        job.updated_at = new Date().toISOString();
      }

      // Log refund in ledger
      db.token_ledger.push({
        id: `led-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: userId,
        organization_id: wallet.organization_id,
        request_id: requestId,
        transaction_type: "refund",
        source: `${uEvent.module_name}/${uEvent.feature_name}`,
        tokens_reserved: 0,
        tokens_billed: 0,
        tokens_refunded: tokensRefunded,
        balance_before: wallet.available_tokens - tokensRefunded,
        balance_after: wallet.available_tokens,
        reason: `Refund due to execution failure: ${errorMessage || "Internal error"}`,
        created_at: new Date().toISOString()
      });

      this.writeDB(db);
      return { success: true, billed: 0, refunded: tokensRefunded, currentBalance: wallet.available_tokens };
    }

    // Calculate actual raw provider cost in USD
    const rawCostUsd = calculateRawProviderCost(
      usageDetails.provider,
      usageDetails.model,
      {
        inputTokens: usageDetails.inputTokens,
        outputTokens: usageDetails.outputTokens,
        searchQueries: usageDetails.searchQueries,
        imagesCount: usageDetails.imageCount,
        videoSeconds: usageDetails.videoSeconds
      }
    );

    // Apply profitable billing model: 1 platform token equals INR 1.5, raw USD is mapped to tokens at 2x provider markup + 20% final markup.
    // Base rule: actual tokens billed is max of (rateCardMin, 2x raw cost converted to tokens).
    const rawCostInr = rawCostUsd * 83; // exchange rate standard
    const profitCostInr = rawCostInr * 2.5; // includes markup and safe buffer margins
    
    // Convert INR cost to platform tokens (approx ₹1.5 per token or relative scale)
    const costBasedTokens = Math.ceil(profitCostInr / 1.5);
    tokensBilled = Math.max(rateCardMin, costBasedTokens);

    // Handle differences
    if (tokensBilled > reservedAmount) {
      // Over-burn: if it cost more than reserved, bill actual and settle wallet (can result in brief debt)
      const diff = tokensBilled - reservedAmount;
      wallet.reserved_tokens = Math.max(0, wallet.reserved_tokens - reservedAmount);
      wallet.available_tokens = Math.max(0, wallet.available_tokens - diff); // debt protector
      tokensRefunded = 0;
    } else {
      // Under-burn: refund the remainder
      tokensRefunded = reservedAmount - tokensBilled;
      wallet.reserved_tokens = Math.max(0, wallet.reserved_tokens - reservedAmount);
      wallet.available_tokens += tokensRefunded;
    }

    // Deduct from monthly credits or top-ups proportionally
    let monthlyTokensToBurn = Math.min(wallet.monthly_tokens_total - wallet.monthly_tokens_used, tokensBilled);
    let topupTokensToBurn = tokensBilled - monthlyTokensToBurn;

    wallet.monthly_tokens_used += monthlyTokensToBurn;
    wallet.topup_tokens_used += topupTokensToBurn;
    wallet.updated_at = new Date().toISOString();

    // Settle usage event
    uEvent.status = "completed";
    uEvent.provider = usageDetails.provider;
    uEvent.model = usageDetails.model;
    uEvent.agent_name = usageDetails.agentName;
    uEvent.api_key_alias = usageDetails.apiKeyAlias;
    uEvent.input_tokens = usageDetails.inputTokens || 0;
    uEvent.output_tokens = usageDetails.outputTokens || 0;
    uEvent.search_queries = usageDetails.searchQueries || 0;
    uEvent.image_count = usageDetails.imageCount || 0;
    uEvent.video_seconds = usageDetails.videoSeconds || 0;
    uEvent.actual_raw_cost_usd = rawCostUsd;
    uEvent.estimated_raw_cost_usd = rawCostUsd * 2.5;
    uEvent.billed_platform_tokens = tokensBilled;
    uEvent.refunded_platform_tokens = tokensRefunded;
    uEvent.completed_at = new Date().toISOString();

    // Settle job
    if (job) {
      job.status = "completed";
      job.billed_tokens = tokensBilled;
      job.progress = 100;
      job.completed_at = new Date().toISOString();
      job.updated_at = new Date().toISOString();
    }

    // Save logs in legacy systems as well to prevent app regressions
    if (!db.apiCostLogs) db.apiCostLogs = [];
    db.apiCostLogs.push({
      id: `cost-${Date.now()}`,
      user_id: userId,
      agent_key: usageDetails.model,
      section_key: uEvent.module_name,
      feature_key: uEvent.feature_name,
      provider: usageDetails.provider,
      estimated_cost: rawCostUsd,
      request_metadata: `Platform Tokens Billed: ${tokensBilled}`,
      created_at: new Date().toISOString()
    });

    // Update estimated sandbox tracker
    if (db.usageTracking) {
      db.usageTracking.estimatedApiCost = (db.usageTracking.estimatedApiCost || 0) + rawCostUsd;
      // Increment appropriate specific categories
      if (uEvent.module_name === "intelligence_core") db.usageTracking.aiMessages = (db.usageTracking.aiMessages || 0) + 1;
      if (uEvent.module_name === "imagine_studio") db.usageTracking.creativeUnits = (db.usageTracking.creativeUnits || 0) + 1;
      if (uEvent.module_name === "file_transfer") db.usageTracking.fileConversions = (db.usageTracking.fileConversions || 0) + 1;
    }

    // Ledger record
    db.token_ledger.push({
      id: `led-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      organization_id: wallet.organization_id,
      request_id: requestId,
      transaction_type: "bill",
      source: `${uEvent.module_name}/${uEvent.feature_name}`,
      tokens_reserved: 0,
      tokens_billed: tokensBilled,
      tokens_refunded: tokensRefunded,
      balance_before: wallet.available_tokens + tokensBilled,
      balance_after: wallet.available_tokens,
      reason: `Billed ${tokensBilled} tokens (refunded ${tokensRefunded}) for ${uEvent.module_name} execution`,
      created_at: new Date().toISOString()
    });

    this.writeDB(db);
    return { success: true, billed: tokensBilled, refunded: tokensRefunded, currentBalance: wallet.available_tokens };
  }

  // Handle top-up pack additions
  public creditTopup(userId: string, packId: string): { success: boolean; credited: number; total: number } {
    const db = this.readDB();
    const pack = TOPUP_PACKS[packId];
    if (!pack) return { success: false, credited: 0, total: 0 };

    const wallet = this.ensureWallet(userId);
    wallet.topup_tokens_total += pack.tokens_credited;
    wallet.available_tokens += pack.tokens_credited;
    wallet.updated_at = new Date().toISOString();

    // Settle index
    const wIndex = db.token_wallets.findIndex((w: any) => w.user_id === userId);
    if (wIndex >= 0) db.token_wallets[wIndex] = wallet;

    // Record in ledger
    if (!db.token_ledger) db.token_ledger = [];
    db.token_ledger.push({
      id: `led-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      organization_id: wallet.organization_id,
      request_id: `topup-${Date.now()}`,
      transaction_type: "topup",
      source: "razorpay_pack",
      tokens_reserved: 0,
      tokens_billed: 0,
      tokens_refunded: 0,
      balance_before: wallet.available_tokens - pack.tokens_credited,
      balance_after: wallet.available_tokens,
      reason: `Purchased Top-up Pack: ${pack.name} (+${pack.tokens_credited} tokens)`,
      created_at: new Date().toISOString()
    });

    this.writeDB(db);
    return { success: true, credited: pack.tokens_credited, total: wallet.available_tokens };
  }

  // Apply real signature checks for Razorpay webhooks
  public verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    try {
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(body);
      const digest = shasum.digest("hex");
      return digest === signature;
    } catch (e) {
      console.error("[Webhook Signature Error]", e);
      return false;
    }
  }
}
