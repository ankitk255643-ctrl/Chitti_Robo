import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  X, 
  TrendingUp, 
  Users, 
  Layers, 
  DollarSign, 
  CreditCard, 
  ShieldAlert, 
  Sliders, 
  HelpCircle, 
  RefreshCw, 
  UserCheck, 
  Coins, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  Building, 
  Briefcase, 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  Database, 
  Cpu, 
  Zap, 
  Lock,
  ArrowRight,
  Gift
} from "lucide-react";

interface SubscriptionBillingHubProps {
  currentTab: string;
  onNavigate?: (tab: string) => void;
  onRefreshStats?: () => void;
  globalProfile?: any;
  onProfileUpdate?: (profile: any) => void;
}

export default function SubscriptionBillingHub({ 
  currentTab, 
  onNavigate, 
  onRefreshStats,
  globalProfile,
  onProfileUpdate
}: SubscriptionBillingHubProps) {
  // Global states
  const [loading, setLoading] = useState(true);
  const [localProfile, setLocalProfile] = useState<any>(null);
  
  const profile = globalProfile || localProfile;
  const setProfile = (newProfile: any) => {
    setLocalProfile(newProfile);
    if (onProfileUpdate) {
      onProfileUpdate(newProfile);
    }
  };
  const [subscription, setSubscription] = useState<any>(null);
  const [usageTracking, setUsageTracking] = useState<any>({});
  const [billingEvents, setBillingEvents] = useState<any[]>([]);
  const [organization, setOrganization] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [apiCostLogs, setApiCostLogs] = useState<any[]>([]);
  
  // UI preferences
  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [activeTab, setActiveTab] = useState<"pricing" | "dashboard" | "admin">("pricing");
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  
  // Organization form state
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Contributor");

  // Admin sandbox form overrides
  const [adminOverridingKey, setAdminOverridingKey] = useState("aiMessages");
  const [adminOverrideValue, setAdminOverrideValue] = useState("0");
  const [rawDbView, setRawDbView] = useState<any>(null);
  const [showRawDb, setShowRawDb] = useState(false);

  // Custom Individual Slider Values
  const [customMsgLimit, setCustomMsgLimit] = useState(15000);
  const [customCreativeLimit, setCustomCreativeLimit] = useState(1500);
  const [customConversionLimit, setCustomConversionLimit] = useState(8000);

  // School Student Seats
  const [schoolSeats, setSchoolSeats] = useState(50);
  // Company Team Seats
  const [companySeats, setCompanySeats] = useState(15);

  // Mock checkout credit card states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paymentStep, setPaymentStep] = useState<"form" | "otp" | "success">("form");
  const [otpValue, setOtpValue] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  const [razorpayStatus, setRazorpayStatus] = useState<"idle" | "creating_order" | "opening_gateway" | "verifying_payment" | "success" | "failed" | "cancelled">("idle");
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  // SECURE PLATFORM TOKEN STATES
  const [tokenWallet, setTokenWallet] = useState<any>(null);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [redeemCodeTargetPlan, setRedeemCodeTargetPlan] = useState("pro");
  const [mainRedeemError, setMainRedeemError] = useState("");
  const [mainRedeemSuccess, setMainRedeemSuccess] = useState("");

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // @ts-ignore
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (planId: string) => {
    setRazorpayStatus("creating_order");
    setCheckoutError("");
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingCycle: isYearly ? "yearly" : "monthly",
          isYearly: isYearly,
          options: {
            customMsgLimit,
            customCreativeLimit,
            customConversionLimit,
            schoolSeats,
            companySeats
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.error === "RAZORPAY_KEYS_MISSING") {
          throw new Error("Razorpay keys are missing in the backend. Please paste your real keys inside your .env file.");
        }
        throw new Error(data.message || "Order creation failed on backend");
      }
      return data; // contains order_id, amount, currency, planDetails
    } catch (err: any) {
      console.error("createRazorpayOrder failed:", err);
      setRazorpayStatus("failed");
      setCheckoutError(err.message || "Order creation failed. Check backend configuration.");
      throw err;
    }
  };

  const openRazorpayCheckout = async (orderData: any, planData: any) => {
    setRazorpayStatus("opening_gateway");
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setRazorpayStatus("failed");
      setCheckoutError("Payment popup failed. Razorpay SDK could not be loaded. Check your internet connection.");
      return;
    }

    // Fetch the public Key ID from config
    let keyId = "";
    try {
      const configRes = await fetch("/api/payment/config");
      const configData = await configRes.json();
      if (configData.success && configData.keyId) {
        keyId = configData.keyId;
      }
    } catch (e) {
      console.warn("Failed to fetch Razorpay public key from backend endpoint, trying env fallback", e);
    }

    // Fallback to Vite env if config endpoint is missing
    if (!keyId) {
      const meta = import.meta as any;
      keyId = (meta.env?.VITE_NEXT_PUBLIC_RAZORPAY_KEY_ID || meta.env?.NEXT_PUBLIC_RAZORPAY_KEY_ID || "") as string;
    }

    if (!keyId) {
      setRazorpayStatus("failed");
      setCheckoutError("Razorpay Keys Missing. Please configure NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment.");
      return;
    }

    const options = {
      key: keyId,
      amount: orderData.amount,
      currency: "INR",
      name: "Chitti-Robo Mega Command",
      description: planData.name,
      order_id: orderData.order_id,
      handler: async (response: any) => {
        try {
          await verifyRazorpayPayment(response, orderData.planDetails);
        } catch (err: any) {
          setRazorpayStatus("failed");
          setCheckoutError(err.message || "Signature verification failed.");
        }
      },
      prefill: {
        name: profile?.name || "",
        email: profile?.email || "",
        contact: ""
      },
      theme: {
        color: "#A855F7" // Match neon purple theme
      },
      modal: {
        ondismiss: () => {
          setRazorpayStatus("cancelled");
          setCheckoutError("Payment cancelled by user.");
        }
      }
    };

    try {
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        console.error("Payment failed event:", resp.error);
        setRazorpayStatus("failed");
        setCheckoutError(resp.error?.description || "Payment gateway reported a failure.");
      });
      rzp.open();
    } catch (err) {
      console.error("Failed to launch Razorpay instance:", err);
      setRazorpayStatus("failed");
      setCheckoutError("Payment popup failed. Please try again.");
    }
  };

  const verifyRazorpayPayment = async (paymentResponse: any, planDetails: any) => {
    setRazorpayStatus("verifying_payment");
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          planDetails: planDetails
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Signature verification failed on backend");
      }

      // Success! Activate subscription locally
      await activateUserSubscription(profile?.id || "user-1", planDetails.planId, data);
    } catch (err: any) {
      console.error("verifyRazorpayPayment failed:", err);
      setRazorpayStatus("failed");
      setCheckoutError(err.message || "Subscription activation failed.");
      throw err;
    }
  };

  const activateUserSubscription = async (userId: string, planId: string, paymentData: any) => {
    setRazorpayStatus("success");
    
    // Update user subscription state locally
    setSubscription(paymentData.subscription);
    setOrganization(paymentData.organizationAccount);
    
    // Refresh components and dashboard
    setTimeout(() => {
      setCheckoutPlan(null);
      setRazorpayStatus("idle");
      setActiveTab("dashboard");
      fetchSubscriptionData();
      if (onRefreshStats) onRefreshStats();
    }, 2000);
  };

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subscription");
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setSubscription(data.subscription);
        setUsageTracking(data.usageTracking);
        setBillingEvents(data.billingEvents);
        setOrganization(data.organizationAccount);
        setTeamMembers(data.teamMembers);
        setTokenWallet(data.tokenWallet);
      }
      
      // If admin, load extra diagnostics
      if (data.profile?.role === "owner_admin") {
        const costRes = await fetch("/api/admin/api-cost-logs");
        const costData = await costRes.json();
        if (costData.success) {
          setApiCostLogs(costData.apiCostLogs);
        }

        const dbRes = await fetch("/api/admin/db");
        const dbData = await dbRes.json();
        if (dbData.success) {
          setRawDbView(dbData.db);
        }
      }
    } catch (err) {
      console.error("Failed to fetch subscription metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  // Sync admin overriding state defaults
  useEffect(() => {
    if (usageTracking && usageTracking[adminOverridingKey] !== undefined) {
      setAdminOverrideValue(String(usageTracking[adminOverridingKey]));
    }
  }, [adminOverridingKey, usageTracking]);

  const handleRoleToggle = async () => {
    try {
      const targetRole = profile?.role === "owner_admin" ? "user" : "owner_admin";
      const res = await fetch("/api/profile/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        if (targetRole === "user" && activeTab === "admin") {
          setActiveTab("pricing");
        }
        fetchSubscriptionData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error("Failed to toggle profile role:", err);
    }
  };

  const handleResetUsages = async () => {
    try {
      const res = await fetch("/api/subscription/reset-usage", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setUsageTracking(data.usageTracking);
        fetchSubscriptionData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error("Failed to reset sandbox usage stats:", err);
    }
  };

  const handleAdminOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/set-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminOverridingKey, value: adminOverrideValue })
      });
      const data = await res.json();
      if (data.success) {
        setUsageTracking(data.usageTracking);
        fetchSubscriptionData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error("Failed to execute admin override command:", err);
    }
  };

  const handleAddOrgMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    try {
      const res = await fetch("/api/admin/org/add-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMemberName, email: newMemberEmail, role: newMemberRole })
      });
      const data = await res.json();
      if (data.success) {
        setTeamMembers(data.teamMembers);
        setNewMemberName("");
        setNewMemberEmail("");
        setNewMemberRole("Contributor");
      } else {
        alert(data.error || "Failed to add member");
      }
    } catch (err) {
      console.error("Failed to add pooled seat:", err);
    }
  };

  const handleRemoveOrgMember = async (memberId: string) => {
    try {
      const res = await fetch("/api/admin/org/remove-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId })
      });
      const data = await res.json();
      if (data.success) {
        setTeamMembers(data.teamMembers);
      }
    } catch (err) {
      console.error("Failed to remove pooled seat:", err);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your premium subscription auto-renewal?")) return;
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription);
        fetchSubscriptionData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error("Failed to request cancellation:", err);
    }
  };

  const initiateCheckout = (plan: any) => {
    let finalPrice = plan.basePrice;
    
    // Compute dynamic interactive pricing
    if (plan.id === "custom_individual") {
      // 3x API cost + margins
      const computedCost = (customMsgLimit * 0.0002) + (customCreativeLimit * 0.002) + (customConversionLimit * 0.0001);
      const computedPriceUsd = computedCost * 3 + 5; // adding base server/storage overhead
      finalPrice = currency === "INR" ? Math.round(computedPriceUsd * 83) : Math.round(computedPriceUsd);
    } else if (plan.id === "school") {
      const schoolBaseUsd = 99;
      const excessSeats = Math.max(0, schoolSeats - 50);
      const computedPriceUsd = schoolBaseUsd + (excessSeats * 1);
      finalPrice = currency === "INR" ? Math.round(computedPriceUsd * 83) : Math.round(computedPriceUsd);
    } else if (plan.id === "company") {
      const companyBaseUsd = 199;
      const excessSeats = Math.max(0, companySeats - 15);
      const computedPriceUsd = companyBaseUsd + (excessSeats * 3);
      finalPrice = currency === "INR" ? Math.round(computedPriceUsd * 83) : Math.round(computedPriceUsd);
    } else {
      // Standard static plans
      const rawPrice = currency === "INR" ? plan.priceInr : plan.priceUsd;
      finalPrice = isYearly ? Math.round(rawPrice * 12 * 0.8) : rawPrice; // 20% yearly discount
    }

    setCheckoutPlan({
      ...plan,
      computedPrice: finalPrice,
      cycle: isYearly ? "yearly" : "monthly"
    });
    setPaymentStep("form");
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setOtpValue("");
    setCheckoutError("");
  };

  const executeCheckout = async () => {
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      setCheckoutError("Please complete all credit card fields.");
      return;
    }
    setPaymentStep("otp");
  };

  const verifyOtpAndUpgrade = async () => {
    if (otpValue !== "1234" && otpValue.trim() !== "") {
      // Standard easy sandbox OTP code = 1234, or anything if empty
      setCheckoutError("Invalid OTP. For demonstration, use 1234.");
      return;
    }

    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: checkoutPlan.id,
          billingCycle: checkoutPlan.cycle,
          price: checkoutPlan.computedPrice,
          currency: currency,
          paymentProvider: currency === "INR" ? "Razorpay Gateway Emulator" : "Stripe Elements Simulator"
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription);
        setOrganization(data.organizationAccount);
        setPaymentStep("success");
        setTimeout(() => {
          setCheckoutPlan(null);
          setActiveTab("dashboard");
          fetchSubscriptionData();
          if (onRefreshStats) onRefreshStats();
        }, 1500);
      } else {
        setCheckoutError(data.error || "Upgrade failed");
      }
    } catch (err) {
      setCheckoutError("Failed to verify transaction with core server.");
    }
  };

  // Hardcoded valid redeem codes (client-side fallback for Vercel/serverless deployments
  // where the Express API server may not be reachable).
  const VALID_REDEEM_CODES: Record<string, { planId: string; description: string }> = {
    "1413914":          { planId: "pro",        description: "Universal Chitti Promo Core Key" },
    "CHITTI-ENTERPRISE":{ planId: "enterprise", description: "Enterprise Promo Access Code" },
    "CHITTI-ULTRA":     { planId: "ultra",      description: "Ultra Multi-Agent License Key" },
    "STUDENT-FREE":     { planId: "school",     description: "Academic Research Free Sandbox Key" },
    "CHITTI-PRO":       { planId: "pro",        description: "Chitti Pro Promo Key" },
    "CHITTI-STARTER":   { planId: "starter",    description: "Chitti Starter Promo Key" },
  };

  const handleRedeemCode = async (targetPlanId: string, customCode?: string) => {
    const codeToUse = customCode !== undefined ? customCode : redeemCode;
    if (!codeToUse) {
      setCheckoutError("Please enter a redeem code.");
      setMainRedeemError("Please enter a redeem code.");
      return;
    }
    
    setIsRedeeming(true);
    setCheckoutError("");
    setMainRedeemError("");
    setMainRedeemSuccess("");

    const normalizedCode = codeToUse.trim().toUpperCase();

    // ── Helper: activate subscription locally (client-side fallback) ──
    const activateLocally = (finalPlanId: string) => {
      const now = new Date();
      const renewsAt = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
      const newSub = {
        planId: finalPlanId,
        status: "active",
        billingCycle: "monthly" as const,
        startedAt: now.toISOString(),
        renewsAt: renewsAt.toISOString(),
        paymentProvider: `Redeem Code (${normalizedCode})`,
        paymentCustomerId: `cust_redeem_${Date.now().toString().slice(-5)}`,
        paymentSubscriptionId: `sub_redeem_${Date.now().toString().slice(-6)}`
      };
      setSubscription(newSub);
      setOrganization(null);
      setMainRedeemSuccess(`✅ Code applied! Plan ${finalPlanId.toUpperCase()} is now active!`);

      if (checkoutPlan) {
        setRazorpayStatus("success");
        setTimeout(() => {
          setCheckoutPlan(null);
          setRazorpayStatus("idle");
          setActiveTab("dashboard");
          fetchSubscriptionData();
          if (onRefreshStats) onRefreshStats();
        }, 1500);
      } else {
        setTimeout(() => {
          setMainRedeemSuccess("");
          setActiveTab("dashboard");
          fetchSubscriptionData();
          if (onRefreshStats) onRefreshStats();
        }, 3000);
      }
    };
    
    try {
      const res = await fetch("/api/subscription/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: targetPlanId,
          code: codeToUse
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscription(data.subscription);
        setOrganization(data.organizationAccount);
        setMainRedeemSuccess(`Success! Code applied. Plan ${targetPlanId.toUpperCase()} has been activated!`);
        
        if (checkoutPlan) {
          setRazorpayStatus("success");
          setTimeout(() => {
            setCheckoutPlan(null);
            setRazorpayStatus("idle");
            setActiveTab("dashboard");
            fetchSubscriptionData();
            if (onRefreshStats) onRefreshStats();
          }, 1500);
        } else {
          setTimeout(() => {
            setMainRedeemSuccess("");
            setActiveTab("dashboard");
            fetchSubscriptionData();
            if (onRefreshStats) onRefreshStats();
          }, 3000);
        }
      } else {
        const errorMsg = data.error || "Failed to redeem code.";
        setCheckoutError(errorMsg);
        setMainRedeemError(errorMsg);
      }
    } catch (err) {
      // ── Server unreachable (Vercel static deploy, network issue, etc.) ──
      // Fall back to client-side validation using the hardcoded codes map.
      console.warn("[Redeem] Server API unreachable, using client-side fallback validation.");
      const codeEntry = VALID_REDEEM_CODES[normalizedCode];
      if (codeEntry) {
        const finalPlanId = codeEntry.planId;
        activateLocally(finalPlanId);
      } else {
        const errorMsg = "Invalid redeem code. Please try again with a valid promo key.";
        setCheckoutError(errorMsg);
        setMainRedeemError(errorMsg);
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  // Static Details of available plans
  const PLANS_LIST = [
    {
      id: "free_trial",
      name: "Free Trial",
      priceInr: 0,
      priceUsd: 0,
      icon: Cpu,
      description: "Basic features with low-rate direct model clusters.",
      features: [
        "10 Intelligent AI Messages",
        "5 Creative Studio Units",
        "10 Media File Conversions",
        "3 URL Domain Analyses",
        "No Trend or Alpha reports",
        "Direct direct Gemini routing only"
      ]
    },
    {
      id: "starter",
      name: "Starter Workspace",
      priceInr: 149,
      priceUsd: 3,
      icon: Zap,
      description: "Standard pack for everyday text processing and converters.",
      features: [
        "500 Intelligent AI Messages",
        "50 Creative Studio Units",
        "100 Media File Conversions",
        "25 URL Domain Analyses",
        "5 Trend Prediction Reports",
        "5 Alpha Asset Reports",
        "100 Voice Command analyses",
        "Standard Chat + basic embeds"
      ]
    },
    {
      id: "pro",
      name: "Pro Developer",
      priceInr: 399,
      priceUsd: 7,
      isPopular: true,
      icon: Sparkles,
      description: "Supercharged limits with deep reasoning model capabilities.",
      features: [
        "3,000 Intelligent AI Messages",
        "250 Creative Studio Units",
        "1,000 Media File Conversions",
        "150 URL Domain Analyses",
        "30 Trend Prediction Reports",
        "30 Alpha Asset Reports",
        "500 Voice Command analyses",
        "300 WhatsApp Rule Events",
        "Pro embeddings allowed"
      ]
    },
    {
      id: "ultra",
      name: "Ultra Workstation",
      priceInr: 899,
      priceUsd: 15,
      isBestValue: true,
      icon: Layers,
      description: "Infinite sandbox creativity with priority compute queuing.",
      features: [
        "10,000 Intelligent AI Messages",
        "1,000 Creative Studio Units",
        "5,000 Media File Conversions",
        "700 URL Domain Analyses",
        "150 Trend Prediction Reports",
        "100 Alpha Asset Reports",
        "3,000 Voice Command analyses",
        "2,000 WhatsApp Rule Events",
        "All model clusters unlocked"
      ]
    },
    {
      id: "custom_individual",
      name: "Custom Individual",
      isCustom: true,
      icon: Sliders,
      description: "Scale limits individually based on actual team requirements.",
      features: [
        "Interactive Adjustable Limits",
        "Tailored for heavy specific workflows",
        "Custom API cost multiplier metrics",
        "Dedicated diagnostic tracing logs"
      ]
    },
    {
      id: "school",
      name: "School & Academy",
      isOrg: true,
      orgType: "school",
      icon: BookOpen,
      description: "Unified classroom hubs with shared pooled balances.",
      features: [
        "Pooled limits starting at 20,000 msgs",
        "Interactive Student seat licensing",
        "Coursework workspace templates",
        "Strict cost controls per student account"
      ]
    },
    {
      id: "company",
      name: "Company & SaaS",
      isOrg: true,
      orgType: "company",
      icon: Building,
      description: "Power collaborative team tasks with isolated developer scopes.",
      features: [
        "Pooled limits starting at 50,000 msgs",
        "Adjustable seat assignments",
        "Team shared API key injection options",
        "Comprehensive user logs auditor"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise SLA",
      isOrg: true,
      priceInr: 75000,
      priceUsd: 999,
      icon: Briefcase,
      description: "Maximum bandwidth, dedicated node isolation and SLA protection.",
      features: [
        "500,000 Pool Intelligent Messages",
        "50,000 Creative Studio Units",
        "Dedicated fallback route priority",
        "White-label corporate branding",
        "Direct custom database bridge options"
      ]
    }
  ];

  // Helper limits map for dashboard progress rendering
  const LIMITS_LABELS: Record<string, { label: string; limitKey: string; maxKey: string }> = {
    aiMessages: { label: "Intelligent Messages", limitKey: "aiMessages", maxKey: "aiMessages" },
    creativeUnits: { label: "Creative Studio Units", limitKey: "creativeUnits", maxKey: "creativeUnits" },
    fileConversions: { label: "Media File Conversions", limitKey: "fileConversions", maxKey: "fileConversions" },
    urlAnalyses: { label: "URL Domain Analyses", limitKey: "urlAnalyses", maxKey: "urlAnalyses" },
    trendReports: { label: "Trend Prediction Reports", limitKey: "trendReports", maxKey: "trendReports" },
    assetReports: { label: "Alpha Asset Reports", limitKey: "assetReports", maxKey: "assetReports" },
    voiceCommands: { label: "Voice Control Analyses", limitKey: "voiceCommands", maxKey: "voiceCommands" },
    whatsappMessages: { label: "WhatsApp Rule Events", limitKey: "whatsappMessages", maxKey: "whatsappMessages" },
    memoryItems: { label: "Cognitive Memories Stored", limitKey: "memoryItems", maxKey: "memoryItems" },
    embedUsage: { label: "Widget Code Embeds", limitKey: "embedUsage", maxKey: "embedUsage" },
  };

  const getActivePlanMax = (key: string) => {
    const activePlanId = subscription?.planId || "free_trial";
    const limits = {
      free_trial: { aiMessages: 10, creativeUnits: 5, fileConversions: 10, urlAnalyses: 3, trendReports: 0, assetReports: 0, voiceCommands: 0, whatsappMessages: 0, memoryItems: 0, embedUsage: 0 },
      starter: { aiMessages: 500, creativeUnits: 50, fileConversions: 100, urlAnalyses: 25, trendReports: 5, assetReports: 5, voiceCommands: 100, whatsappMessages: 0, memoryItems: 50, embedUsage: 0 },
      pro: { aiMessages: 3000, creativeUnits: 250, fileConversions: 1000, urlAnalyses: 150, trendReports: 30, assetReports: 30, voiceCommands: 500, whatsappMessages: 300, memoryItems: 500, embedUsage: 1 },
      ultra: { aiMessages: 10000, creativeUnits: 1000, fileConversions: 5000, urlAnalyses: 700, trendReports: 150, assetReports: 100, voiceCommands: 3000, whatsappMessages: 2000, memoryItems: 3000, embedUsage: 2 },
      custom_individual: { aiMessages: customMsgLimit, creativeUnits: customCreativeLimit, fileConversions: customConversionLimit, urlAnalyses: 1500, trendReports: 350, assetReports: 250, voiceCommands: 7000, whatsappMessages: 4000, memoryItems: 7000, embedUsage: 2 },
      school: { aiMessages: 20000 + (Math.max(0, schoolSeats - 50) * 100), creativeUnits: 2000 + (Math.max(0, schoolSeats - 50) * 10), fileConversions: 10000, urlAnalyses: 1000, trendReports: 50, assetReports: 10, voiceCommands: 2000, whatsappMessages: 100, memoryItems: 2000, embedUsage: 2 },
      company: { aiMessages: 50000 + (Math.max(0, companySeats - 15) * 500), creativeUnits: 5000 + (Math.max(0, companySeats - 15) * 30), fileConversions: 15000, urlAnalyses: 2000, trendReports: 150, assetReports: 100, voiceCommands: 5000, whatsappMessages: 5000, memoryItems: 5000, embedUsage: 2 },
      enterprise: { aiMessages: 500000, creativeUnits: 50000, fileConversions: 150000, urlAnalyses: 20000, trendReports: 1500, assetReports: 1000, voiceCommands: 50000, whatsappMessages: 50000, memoryItems: 50000, embedUsage: 3 }
    };
    return (limits as any)[activePlanId]?.[key] || 0;
  };

  // Profit Guard Diagnostics Logic
  const planPriceUsd = subscription?.planId === "free_trial" ? 1.5 : (subscription?.planId === "starter" ? 3 : (subscription?.planId === "pro" ? 7 : (subscription?.planId === "ultra" ? 15 : (subscription?.planId === "custom_individual" ? 29 : (subscription?.planId === "school" ? 99 : (subscription?.planId === "company" ? 199 : 999))))));
  const currentApiCostTotal = usageTracking?.estimatedApiCost || 0;
  const profitMarginPercent = currentApiCostTotal > 0 ? Math.max(0, Math.round(((planPriceUsd - currentApiCostTotal) / planPriceUsd) * 100)) : 100;
  const apiCostPercentTotal = (currentApiCostTotal / planPriceUsd) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 selection:bg-purple-500 selection:text-white" id="sub-billing-portal">
      {/* 1. Header Banner */}
      <div className="max-w-7xl mx-auto mb-8 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6" id="hub-header">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full uppercase tracking-wider shadow-sm">
              Premium Portal
            </span>
            {profile?.role === "owner_admin" && (
              <span className="px-3 py-1 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Owner-Admin Sandbox
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Plan, Billing & Core Allocations
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Audit API profit margins, scale workstation limits, and unlock multi-agent deployment clusters instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center" id="hub-actions">
          <button 
            onClick={() => fetchSubscriptionData()}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 rounded-lg transition-all shadow"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Primary Navigation */}
      <div className="max-w-7xl mx-auto mb-8 flex border-b border-slate-800" id="hub-nav">
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "pricing" 
              ? "border-purple-500 text-purple-400 bg-purple-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <Coins className="w-4 h-4" /> Pricing & Model Tiers
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "dashboard" 
              ? "border-purple-500 text-purple-400 bg-purple-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Active Billing Dashboard
        </button>
        {profile?.role === "owner_admin" && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "admin" 
                ? "border-rose-500 text-rose-400 bg-rose-500/5" 
                : "border-transparent text-slate-400 hover:text-rose-400 hover:bg-slate-800/30"
            }`}
          >
            <Database className="w-4 h-4" /> System Profit Diagnostics
          </button>
        )}
      </div>

      {/* 3. Tab Contents */}
      <div className="max-w-7xl mx-auto" id="hub-main-content">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PRICING PLANS CATALOG */}
          {activeTab === "pricing" && (
            <motion.div
              key="pricing-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Yearly & Currency Selectors */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-800/30 p-4 rounded-xl border border-slate-800/80" id="pricing-selectors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-300">Billing Currency:</span>
                  <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex gap-1">
                    <button
                      onClick={() => setCurrency("INR")}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                        currency === "INR" 
                          ? "bg-purple-600 text-white shadow" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ₹ INR (Local)
                    </button>
                    <button
                      onClick={() => setCurrency("USD")}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                        currency === "USD" 
                          ? "bg-purple-600 text-white shadow" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      $ USD (Global)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">Monthly</span>
                  <button
                    onClick={() => setIsYearly(!isYearly)}
                    className="w-12 h-6 bg-slate-700 rounded-full p-1 transition-colors duration-200 focus:outline-none relative"
                  >
                    <div 
                      className={`w-4 h-4 bg-purple-400 rounded-full transition-all duration-200 shadow ${
                        isYearly ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-200 font-semibold flex items-center gap-1.5">
                    Yearly <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 rounded">Save 20%</span>
                  </span>
                </div>
              </div>

              {/* Redeem Coupon Card */}
              <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-5 mb-8 shadow-xl" id="redeem-code-section">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-100">Unlock Premium Workstation Access</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Have a subscriber key or promo code? Activate any subscription package instantly.</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Select Target Plan</span>
                      <select
                        value={redeemCodeTargetPlan}
                        onChange={(e) => setRedeemCodeTargetPlan(e.target.value)}
                        className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                      >
                        {PLANS_LIST.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 sm:w-60">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Redeem Code</span>
                      <div className="relative flex items-center">
                        <input
                          type="password"
                          placeholder="Enter promo code"
                          value={redeemCode}
                          onChange={(e) => setRedeemCode(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-3 pr-20 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        />
                        <button
                          onClick={() => handleRedeemCode(redeemCodeTargetPlan)}
                          disabled={isRedeeming}
                          className="absolute right-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                        >
                          {isRedeeming ? "Applying" : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Alerts */}
                {mainRedeemError && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {mainRedeemError}
                  </div>
                )}
                {mainRedeemSuccess && (
                  <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4" /> {mainRedeemSuccess}
                  </div>
                )}

                <div className="mt-3 text-[10px] text-slate-500 text-center md:text-left">
                  🌟 Enter your corporate/promotional license key to claim complimentary subscription benefits securely.
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" id="plans-grid">
                {PLANS_LIST.map((plan) => {
                  const Icon = plan.icon;
                  const isCurrent = subscription?.planId === plan.id;
                  
                  // Price Calculation (incorporating dynamic toggles)
                  let displayPrice = "";
                  if (plan.id === "custom_individual") {
                    const computedCost = (customMsgLimit * 0.0002) + (customCreativeLimit * 0.002) + (customConversionLimit * 0.0001);
                    const computedPriceUsd = computedCost * 3 + 5;
                    const finalPrice = currency === "INR" ? Math.round(computedPriceUsd * 83) : Math.round(computedPriceUsd);
                    displayPrice = currency === "INR" ? `₹${finalPrice.toLocaleString()}` : `$${finalPrice}`;
                  } else if (plan.id === "school") {
                    const schoolBaseUsd = 99;
                    const excessSeats = Math.max(0, schoolSeats - 50);
                    const computedPriceUsd = schoolBaseUsd + (excessSeats * 1);
                    const finalPrice = currency === "INR" ? Math.round(computedPriceUsd * 83) : Math.round(computedPriceUsd);
                    displayPrice = currency === "INR" ? `₹${finalPrice.toLocaleString()}` : `$${finalPrice}`;
                  } else if (plan.id === "company") {
                    const companyBaseUsd = 199;
                    const excessSeats = Math.max(0, companySeats - 15);
                    const computedPriceUsd = companyBaseUsd + (excessSeats * 3);
                    const finalPrice = currency === "INR" ? Math.round(computedPriceUsd * 83) : Math.round(computedPriceUsd);
                    displayPrice = currency === "INR" ? `₹${finalPrice.toLocaleString()}` : `$${finalPrice}`;
                  } else if (plan.id === "enterprise") {
                    displayPrice = "Custom";
                  } else {
                    const rawPrice = currency === "INR" ? plan.priceInr : plan.priceUsd;
                    const priceVal = isYearly ? Math.round(rawPrice * 12 * 0.8) : rawPrice;
                    displayPrice = currency === "INR" ? `₹${priceVal.toLocaleString()}` : `$${priceVal}`;
                  }

                  return (
                    <div 
                      key={plan.id}
                      className={`relative bg-slate-800/40 backdrop-blur-sm rounded-2xl border p-6 flex flex-col justify-between shadow-lg overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl ${
                        isCurrent 
                          ? "border-purple-500 shadow-purple-500/10 ring-2 ring-purple-500/25 bg-slate-800/80" 
                          : plan.isPopular 
                            ? "border-indigo-500/60 shadow-indigo-500/5 bg-gradient-to-b from-slate-800/80 to-slate-800/40" 
                            : "border-slate-700/60"
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold bg-indigo-500 text-white rounded uppercase tracking-wider">
                          Popular
                        </div>
                      )}
                      {plan.isBestValue && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold bg-purple-500 text-white rounded uppercase tracking-wider">
                          Best Value
                        </div>
                      )}

                      <div>
                        {/* Title and Icon */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${plan.isPopular ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-700/60 text-slate-300"}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-lg text-slate-100">{plan.name}</h3>
                        </div>

                        {/* Price Banner */}
                        <div className="mb-4">
                          {plan.id === "enterprise" ? (
                            <div className="text-2xl font-black text-white">Custom SLA</div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-extrabold text-white">{displayPrice}</span>
                              <span className="text-xs text-slate-400 font-medium">
                                /{isYearly ? "yr" : "mo"}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-2 min-h-[32px]">{plan.description}</p>
                        </div>

                        {/* Plan Custom Configuration Controllers */}
                        {plan.id === "custom_individual" && (
                          <div className="my-4 p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-3">
                            <div>
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>AI Messages</span>
                                <span className="text-purple-400 font-semibold">{customMsgLimit.toLocaleString()}</span>
                              </div>
                              <input 
                                type="range" 
                                min="1000" 
                                max="50000" 
                                step="1000"
                                value={customMsgLimit} 
                                onChange={(e) => setCustomMsgLimit(Number(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Creative Units</span>
                                <span className="text-purple-400 font-semibold">{customCreativeLimit.toLocaleString()}</span>
                              </div>
                              <input 
                                type="range" 
                                min="50" 
                                max="5000" 
                                step="50"
                                value={customCreativeLimit} 
                                onChange={(e) => setCustomCreativeLimit(Number(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Conversions</span>
                                <span className="text-purple-400 font-semibold">{customConversionLimit.toLocaleString()}</span>
                              </div>
                              <input 
                                type="range" 
                                min="100" 
                                max="20000" 
                                step="100"
                                value={customConversionLimit} 
                                onChange={(e) => setCustomConversionLimit(Number(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                            </div>
                          </div>
                        )}

                        {plan.id === "school" && (
                          <div className="my-4 p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>Student/Teacher Seats</span>
                              <span className="text-purple-400 font-semibold">{schoolSeats} seats</span>
                            </div>
                            <input 
                              type="range" 
                              min="10" 
                              max="500" 
                              step="5"
                              value={schoolSeats} 
                              onChange={(e) => setSchoolSeats(Number(e.target.value))}
                              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="text-[9px] text-slate-500 text-center leading-tight">
                              Includes 50 basic student seats. +{currency === "INR" ? "₹83" : "$1"}/seat beyond.
                            </div>
                          </div>
                        )}

                        {plan.id === "company" && (
                          <div className="my-4 p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>Co-worker Seats</span>
                              <span className="text-purple-400 font-semibold">{companySeats} seats</span>
                            </div>
                            <input 
                              type="range" 
                              min="5" 
                              max="100" 
                              step="1"
                              value={companySeats} 
                              onChange={(e) => setCompanySeats(Number(e.target.value))}
                              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="text-[9px] text-slate-500 text-center leading-tight">
                              Includes 15 basic staff seats. +{currency === "INR" ? "₹249" : "$3"}/seat beyond.
                            </div>
                          </div>
                        )}

                        {/* Divider */}
                        <div className="h-[1px] bg-slate-750 my-4" />

                        {/* Features List */}
                        <ul className="space-y-2 mb-6" id={`features-${plan.id}`}>
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Buttons */}
                      <div className="mt-auto">
                        {isCurrent ? (
                          <div className="w-full py-2.5 px-4 bg-slate-700 text-slate-300 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 border border-slate-600">
                            <Check className="w-4 h-4 text-emerald-400" /> Active Plan
                          </div>
                        ) : plan.id === "enterprise" ? (
                          <button
                            onClick={() => {
                              // We can trigger direct redemption of enterprise plan too!
                              const inputEl = document.getElementById(`card-redeem-input-${plan.id}`) as HTMLInputElement;
                              const code = inputEl ? inputEl.value : "";
                              handleRedeemCode(plan.id, code);
                            }}
                            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                          >
                            Redeem Enterprise Promo <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => initiateCheckout(plan)}
                            className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1 ${
                              plan.isPopular 
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white" 
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
                          >
                            Upgrade Plan <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Quick-Redeem Code Box for each Subscription Card */}
                        {!isCurrent && (
                          <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-col gap-1.5">
                            <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                              <Gift className="w-3 h-3 text-purple-400 shrink-0" /> Redeem Promo Code
                            </span>
                            <div className="flex gap-1">
                              <input
                                type="password"
                                placeholder="Enter code"
                                className="flex-1 min-w-0 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                                id={`card-redeem-input-${plan.id}`}
                              />
                              <button
                                onClick={() => {
                                  const inputEl = document.getElementById(`card-redeem-input-${plan.id}`) as HTMLInputElement;
                                  const code = inputEl ? inputEl.value : "";
                                  handleRedeemCode(plan.id, code);
                                }}
                                disabled={isRedeeming}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 shrink-0"
                              >
                                {isRedeeming ? "Applying" : "Apply"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comprehensive Feature Comparisons Table */}
              <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-6 shadow-md mb-12" id="comparison-matrices">
                <h3 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-400" /> Granular Workspace Permission Matrix
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700/60 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Workspace Area</th>
                        <th className="py-3 px-4">Free Trial</th>
                        <th className="py-3 px-4">Starter</th>
                        <th className="py-3 px-4">Pro Developer</th>
                        <th className="py-3 px-4">Ultra / Custom / Org</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-300">Central Router & Intelligence Chat</td>
                        <td className="py-3 px-4 text-slate-400 flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-400" /> Basic direct Gemini</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Direct Gemini + Llama</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Unlocked DeepSeek / GPT</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> All Models + Custom</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-300">Imagine Studio (Art Design)</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> 5 Creative Units</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> 50 Creative Units</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> 250 Creative Units</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Up to 5,000 Units</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-300">System Diagnostics & Logs</td>
                        <td className="py-3 px-4 text-slate-400 text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Full Health Logs</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Advanced API Analytics</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Real-time node monitors</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-300">WhatsApp Automation webhook rules</td>
                        <td className="py-3 px-4 text-slate-400 text-slate-500"><Lock className="w-3 h-3 inline" /> Locked</td>
                        <td className="py-3 px-4 text-slate-400 text-slate-500"><Lock className="w-3 h-3 inline" /> Locked</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> 300 Rule Events</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Unlimited Webhooks</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-300">Indian Airspace flight simulation</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Standard Proxy</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Live OpenSky stream</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Custom flight tracking</td>
                        <td className="py-3 px-4 text-slate-400"><Check className="w-3.5 h-3.5 text-green-400 inline" /> Pooled live stream updates</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-300">Admin Control Console</td>
                        <td className="py-3 px-4 text-rose-400 font-medium">Excluded</td>
                        <td className="py-3 px-4 text-rose-400 font-medium">Excluded</td>
                        <td className="py-3 px-4 text-rose-400 font-medium">Excluded</td>
                        <td className="py-3 px-4 text-rose-400 font-medium flex items-center gap-1"><Lock className="w-3 h-3" /> Excluded (Owner-Admin strictly only)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ACTIVE BILLING DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
              id="billing-dashboard-view"
            >
              {/* Platform Token Wallet Banner */}
              <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl shadow-purple-500/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 shadow-inner">
                      <Coins className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        Cognitive Token Balance <span className="text-xs px-2.5 py-0.5 font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full">Metered Wallet</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md">
                        AI chains, premium models, search loops, and file operations consume metered platform tokens. Top-up tokens never expire.
                      </p>
                      
                      <div className="flex items-center gap-6 mt-4">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Available Balance</div>
                          <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5 mt-0.5 font-mono">
                            {tokenWallet ? tokenWallet.available_tokens.toLocaleString() : "150"} <span className="text-xs text-slate-400 font-medium font-sans">tokens</span>
                          </div>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-800" />
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reserved Hold</div>
                          <div className="text-base font-extrabold text-amber-400 mt-1 flex items-center gap-1 font-mono">
                            {tokenWallet?.reserved_tokens || 0} tokens
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 max-w-md bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Subscription Tokens</span>
                          <span className="font-semibold text-slate-200">
                            {tokenWallet ? (tokenWallet.monthly_tokens_total - tokenWallet.monthly_tokens_used).toLocaleString() : "150"} / {tokenWallet ? tokenWallet.monthly_tokens_total.toLocaleString() : "150"} left
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                            style={{ width: `${tokenWallet ? Math.max(0, Math.min(100, ((tokenWallet.monthly_tokens_total - tokenWallet.monthly_tokens_used) / tokenWallet.monthly_tokens_total) * 100)) : 100}%` }}
                          />
                        </div>
                      </div>
                      
                      {tokenWallet?.topup_tokens_total > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Top-up Token Credits</span>
                            <span className="font-semibold text-slate-200">
                              {(tokenWallet.topup_tokens_total - tokenWallet.topup_tokens_used).toLocaleString()} / {tokenWallet.topup_tokens_total.toLocaleString()} left
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.max(0, Math.min(100, (((tokenWallet.topup_tokens_total - tokenWallet.topup_tokens_used) / tokenWallet.topup_tokens_total) * 100)))}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setShowTopupModal(true)}
                      className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      <Coins className="w-3.5 h-3.5" /> Purchase Token Top-up Packs
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-summary-cards">
                <div className="bg-slate-800/40 rounded-xl border border-slate-700/60 p-5 shadow flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Current Assigned Workstation Plan</div>
                    <div className="text-xl font-bold uppercase text-slate-100 mt-1">
                      {profile?.role === "owner_admin" ? "Enterprise Admin (All Free)" : (subscription?.planId ? subscription.planId.replace("_", " ") : "Free Trial")}
                      {subscription?.paymentProvider?.includes("Redeem") && <span className="text-emerald-400 text-xs ml-1.5 font-bold animate-pulse">(FREE PROMO)</span>}
                    </div>
                    <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
                      ● Status: {profile?.role === "owner_admin" ? "Active (Unlimited Admin Bypass)" : (subscription?.paymentProvider?.includes("Redeem") ? "Active Promo (100% Free)" : "Active Auto-Renewal")}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/40 rounded-xl border border-slate-700/60 p-5 shadow flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Monthly renewal & customer info</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">
                      {subscription?.paymentProvider?.includes("Redeem") ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1"><Gift className="w-4 h-4 shrink-0" /> Cost: ₹0 / $0 (100% Free Promo)</span>
                      ) : (
                        `Renews: ${subscription?.renewsAt ? new Date(subscription.renewsAt).toLocaleDateString() : "30 days from signup"}`
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Cycle: {subscription?.billingCycle || "Monthly"} ({subscription?.paymentProvider || "Internal Sandbox"})
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/40 rounded-xl border border-slate-700/60 p-5 shadow flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Estimated Raw API expenditure</div>
                    <div className="text-xl font-bold text-slate-100 mt-1">
                      ${usageTracking?.estimatedApiCost ? usageTracking.estimatedApiCost.toFixed(4) : "0.0000"}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                      Budget buffer percentage: <span className="text-emerald-400 font-bold">{Math.round(apiCostPercentTotal)}% used</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Allocation Meters */}
              <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-6 shadow-md" id="usage-meters-panel">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-purple-400" /> Active Plan Resource Consumption Gauges
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Allocated values reset monthly. Approaching maximum margins blocks action queues.
                    </p>
                  </div>
                  <button
                    onClick={() => handleResetUsages()}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-all flex items-center gap-1 shadow"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Tracker (Sandbox)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="usage-meters-grid">
                  {Object.entries(LIMITS_LABELS).map(([key, config]) => {
                    const current = usageTracking?.[config.limitKey] || 0;
                    const max = getActivePlanMax(config.maxKey);
                    const isAdmin = profile?.role === "owner_admin";
                    const percentage = isAdmin ? 0 : (max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0);
                    
                    // Gauge Color level indicator
                    let barColor = "bg-purple-500";
                    let textColor = "text-purple-400";
                    if (!isAdmin && percentage >= 85) {
                      barColor = "bg-red-500";
                      textColor = "text-red-400";
                    } else if (!isAdmin && percentage >= 50) {
                      barColor = "bg-amber-500";
                      textColor = "text-amber-400";
                    }

                    return (
                      <div key={key} className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-300">{config.label}</span>
                          <span className={`font-mono font-bold ${textColor}`}>
                            {isAdmin ? `${current.toLocaleString()} / Unlimited` : (max === 0 ? "Blocked (0)" : `${current.toLocaleString()} / ${max.toLocaleString()}`)}
                          </span>
                        </div>
                        
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                            style={{ width: `${isAdmin ? 0 : (max === 0 ? 0 : percentage)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{isAdmin ? "0% Consumed (Admin Free Plan)" : (max === 0 ? "Plan restricted" : `${percentage}% Consumed`)}</span>
                          {!isAdmin && max > 0 && current >= max && (
                            <span className="text-red-400 flex items-center gap-0.5 font-bold animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Limits Exceeded
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Organization and Pooled seat section (Conditional) */}
              {organization && (
                <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-6 shadow-md" id="org-pooled-section">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/25">
                      <Users className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">
                        {organization.name} Workspace Member Roster
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Active Tiers: {organization.type.toUpperCase()} pooled workstation model. Seat limits: {teamMembers.length} of {organization.max_users} occupied.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Member Form */}
                    <div className="lg:col-span-1 p-5 bg-slate-900/50 rounded-xl border border-slate-800/80">
                      <h4 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-purple-400" /> Allocate Pooled Seat
                      </h4>
                      <form onSubmit={handleAddOrgMember} className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                          <input 
                            type="text"
                            placeholder="e.g. Rachel Dawes"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-850 border border-slate-700/60 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                          <input 
                            type="email"
                            placeholder="rachel@gotham.org"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-850 border border-slate-700/60 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Workspace Assignment Role</label>
                          <select 
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-850 border border-slate-700/60 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                          >
                            <option value="Contributor">Contributor</option>
                            <option value="Developer">Developer</option>
                            <option value="Billing Manager">Billing Manager</option>
                          </select>
                        </div>
                        <button 
                          type="submit"
                          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-all shadow-md"
                        >
                          Confirm & Issue Seat
                        </button>
                      </form>
                    </div>

                    {/* Member List Table */}
                    <div className="lg:col-span-2 bg-slate-900/20 rounded-xl border border-slate-800/80 p-4 overflow-hidden">
                      <h4 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-purple-400" /> Unified Member Registry
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="pb-2">User details</th>
                              <th className="pb-2">Assigned role</th>
                              <th className="pb-2">Simulation Status</th>
                              <th className="pb-2 text-right">Seat Control</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {teamMembers.map((member) => (
                              <tr key={member.id} className="hover:bg-slate-850/20">
                                <td className="py-2.5">
                                  <div className="font-medium text-slate-200">{member.name}</div>
                                  <div className="text-[10px] text-slate-400">{member.email}</div>
                                </td>
                                <td className="py-2.5 text-slate-300">{member.role}</td>
                                <td className="py-2.5">
                                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-[9px] font-semibold border border-green-500/20">
                                    {member.status}
                                  </span>
                                </td>
                                <td className="py-2.5 text-right">
                                  {member.user_id !== profile?.id ? (
                                    <button 
                                      onClick={() => handleRemoveOrgMember(member.id)}
                                      className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                                      title="Revoke Seat Allocation"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 pr-2">Workspace Owner</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing History and Mock Invoices */}
              <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-6 shadow-md" id="billing-history-panel">
                <h3 className="text-xl font-bold mb-4 text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Historical Sandbox Billing Receipts
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Verify mock transactions, dates, generated receipt references, and transaction codes.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Transaction Reference</th>
                        <th className="py-2 px-3">Tier Assignment</th>
                        <th className="py-2 px-3">Amount Charged</th>
                        <th className="py-2 px-3">Mock payment provider</th>
                        <th className="py-2 px-3">Receipt status</th>
                        <th className="py-2 px-3 text-right">Audit Copy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {billingEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-slate-850/10">
                          <td className="py-3 px-3">{new Date(event.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-3 font-mono text-[10px] text-slate-400">{event.id}</td>
                          <td className="py-3 px-3 font-bold text-slate-200 uppercase">{event.plan_id.replace("_", " ")}</td>
                          <td className="py-3 px-3 font-semibold">
                            {event.currency === "INR" ? "₹" : "$"}{event.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-slate-400">{event.metadata || "Sandbox simulated credit card"}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-[9px] font-semibold border border-green-500/20">
                              {event.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => alert(`Simulated Invoice Downloaded! Saved reference: INVOICE_${event.id}.pdf`)}
                              className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-all inline-flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" /> Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {subscription?.planId !== "free_trial" && (
                  <div className="mt-8 pt-4 border-t border-slate-850 flex justify-end">
                    <button
                      onClick={() => handleCancelSubscription()}
                      className="px-4 py-2 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all"
                    >
                      Cancel Subscription Auto-Renewal
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: SYSTEM PROFIT DIAGNOSTICS (Owner-Admin Only) */}
          {activeTab === "admin" && profile?.role === "owner_admin" && (
            <motion.div
              key="admin-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
              id="admin-diagnostics-view"
            >
              {/* Profit Guard Diagnostics and Alerts Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="diagnostics-summary-grid">
                
                {/* Profit Gauge Card */}
                <div className="lg:col-span-1 bg-slate-800/40 rounded-xl border border-slate-700/60 p-5 shadow space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">System Profit Margin Guard</h4>
                      <p className="text-[10px] text-slate-400">Calculated as: 3x API cost safety ratio.</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-xl border border-slate-850">
                    <div className="relative flex items-center justify-center">
                      {/* SVG Gauge Circle */}
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle 
                          cx="64" cy="64" r="50" 
                          className="stroke-slate-800" strokeWidth="8" fill="transparent" 
                        />
                        <circle 
                          cx="64" cy="64" r="50" 
                          className="stroke-purple-500 transition-all duration-1000" 
                          strokeWidth="8" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 50}
                          strokeDashoffset={(2 * Math.PI * 50) * (1 - profitMarginPercent / 100)}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-slate-100">{profitMarginPercent}%</span>
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Margin Buffer</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] leading-relaxed text-slate-400">
                    Calculated Intake: <strong className="text-slate-200">${planPriceUsd.toFixed(2)}</strong>. 
                    Simulated API Outflow: <strong className="text-slate-200">${currentApiCostTotal.toFixed(4)}</strong>. 
                    Target profit margin remains protected.
                  </div>
                </div>

                {/* API Safety Alerts Indicator Controls */}
                <div className="lg:col-span-1 bg-slate-800/40 rounded-xl border border-slate-700/60 p-5 shadow space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Cost-Safety Indicator Alert Panel</h4>
                      <p className="text-[10px] text-slate-400">Threshold alarms protecting compute resources.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Warning status 35% */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-850 text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">35% Cost Margin Alert</div>
                        <p className="text-[9px] text-slate-400">Internal warning banner displays in workspace logs.</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        apiCostPercentTotal >= 35 
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" 
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {apiCostPercentTotal >= 35 ? "TRIGGERED" : "NOMINAL"}
                      </span>
                    </div>

                    {/* Throttle status 50% */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-850 text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">50% Priority Throttling</div>
                        <p className="text-[9px] text-slate-400">Throttles heavy bulk tasks; forces standard priority queue.</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        apiCostPercentTotal >= 50 
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse" 
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {apiCostPercentTotal >= 50 ? "TRIGGERED" : "NOMINAL"}
                      </span>
                    </div>

                    {/* Safe Limit status 80% */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-850 text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">80% Core Safeguard Lockout</div>
                        <p className="text-[9px] text-slate-400">Strictly blocks heavy model operations. Requires upgrade.</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        apiCostPercentTotal >= 80 
                          ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {apiCostPercentTotal >= 80 ? "TRIGGERED" : "NOMINAL"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sandbox Emulator Panel Controls */}
                <div className="lg:col-span-1 bg-slate-800/40 rounded-xl border border-slate-700/60 p-5 shadow space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Manual Usage Override Sandbox</h4>
                      <p className="text-[10px] text-slate-400">Simulate limit triggers instantly.</p>
                    </div>
                  </div>

                  <form onSubmit={handleAdminOverride} className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Select Limit Parameter</label>
                      <select
                        value={adminOverridingKey}
                        onChange={(e) => setAdminOverridingKey(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        {Object.entries(LIMITS_LABELS).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                        <option value="estimatedApiCost">Estimated API Cost ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Set Value</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          value={adminOverrideValue}
                          onChange={(e) => setAdminOverrideValue(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </form>
                  <button
                    onClick={() => handleResetUsages()}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 rounded border border-slate-800 font-semibold transition-all text-center"
                  >
                    Set All Usages to Zero (0)
                  </button>
                </div>
              </div>

              {/* API Expenditure History Logger */}
              <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-6 shadow-md" id="api-cost-logger">
                <h3 className="text-xl font-bold mb-4 text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-rose-400" /> Granular API Cost Outflow History Logs
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Every message routing processes an automated estimated price deduction, recorded live inside database log rows.
                </p>

                <div className="max-h-64 overflow-y-auto border border-slate-800/80 rounded-xl">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">Agent Key</th>
                        <th className="py-2 px-3">Model provider</th>
                        <th className="py-2 px-3">Section Area</th>
                        <th className="py-2 px-3">Simulation Metadata</th>
                        <th className="py-2 px-3 text-right">Computed Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {apiCostLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-850/10 font-mono text-[11px]">
                          <td className="py-2 px-3 text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</td>
                          <td className="py-2 px-3 text-purple-300">{log.agent_key}</td>
                          <td className="py-2 px-3 text-indigo-300">{log.provider}</td>
                          <td className="py-2 px-3">{log.section_key}</td>
                          <td className="py-2 px-3 text-slate-400 truncate max-w-[200px]">{log.request_metadata}</td>
                          <td className="py-2 px-3 text-right font-bold text-red-300">${log.estimated_cost.toFixed(5)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Accordion Dump database JSON */}
              <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-6 shadow-md" id="admin-raw-json">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" /> Live database.json Raw Schema Inspector
                  </h3>
                  <button
                    onClick={() => setShowRawDb(!showRawDb)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 rounded hover:bg-slate-800 transition-all"
                  >
                    {showRawDb ? "Hide Schema" : "Inspect Raw Rows"}
                  </button>
                </div>

                {showRawDb && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 overflow-x-auto">
                    <pre className="text-[10px] text-emerald-400 font-mono leading-tight whitespace-pre">
                      {JSON.stringify(rawDbView, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 4. MODAL: Stripe & Razorpay Checkout Portal Simulator */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="checkout-overlay">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-850 shadow-2xl overflow-hidden p-6"
            id="checkout-modal"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-400 rounded uppercase border border-purple-500/30">
                  Secure Checkout
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Upgrade Workstation Allocation</h3>
              </div>
              <button 
                onClick={() => setCheckoutPlan(null)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {checkoutError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {checkoutError}
              </div>
            )}

            {/* Content Switcher */}
            {razorpayStatus !== "idle" ? (
              <div className="space-y-6 text-center py-6" id="razorpay-loading-status">
                <div className="p-4 bg-purple-500/10 text-purple-400 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-purple-500/20">
                  {razorpayStatus === "success" ? (
                    <Check className="w-8 h-8 text-emerald-400" />
                  ) : razorpayStatus === "failed" ? (
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  ) : razorpayStatus === "cancelled" ? (
                    <X className="w-8 h-8 text-slate-400" />
                  ) : (
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    {razorpayStatus === "creating_order" && "Initiating Secure Transaction..."}
                    {razorpayStatus === "opening_gateway" && "Launching Razorpay Portal..."}
                    {razorpayStatus === "verifying_payment" && "Confirming Signature Verification..."}
                    {razorpayStatus === "success" && "Subscription Activated!"}
                    {razorpayStatus === "failed" && "Transaction Failed"}
                    {razorpayStatus === "cancelled" && "Transaction Cancelled"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                    {razorpayStatus === "creating_order" && "Contacting secure server nodes to initialize your unique Razorpay subscription key..."}
                    {razorpayStatus === "opening_gateway" && "Opening secure payment gateway wrapper. Complete the checkout on screen..."}
                    {razorpayStatus === "verifying_payment" && "We are validating the cryptographic signature returned by Razorpay to activate your limits..."}
                    {razorpayStatus === "success" && "Success! Your workstation limit allocations have been successfully expanded on the backend."}
                    {razorpayStatus === "failed" && (checkoutError || "We encountered an error processing your payment configuration.")}
                    {razorpayStatus === "cancelled" && "The payment flow was cancelled. No money was deducted from your account."}
                  </p>
                </div>
                {(razorpayStatus === "failed" || razorpayStatus === "cancelled") && (
                  <button
                    onClick={() => setRazorpayStatus("idle")}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4" id="razorpay-intro">
                {/* Plan Summary */}
                <div className="p-3 bg-slate-850/80 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400">Selected Allocation Tier</span>
                    <div className="font-bold text-slate-200">{checkoutPlan.name}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Charged</span>
                    <div className="font-extrabold text-purple-400 text-lg">
                      ₹{checkoutPlan.computedPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-850/40 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-purple-400" /> Secure Payment Gateway (India)
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You are updating your account allocations. Transactions are fully secured and handled by Razorpay. Supports UPI, NetBanking, Credit/Debit cards, and popular mobile wallets.
                  </p>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3 text-emerald-400" /> Cryptographically secured session
                  </div>
                </div>

                {/* Promo / Redeem Code Block */}
                <div className="p-4 bg-purple-950/25 border border-purple-500/20 rounded-xl space-y-2">
                  <label className="text-xs font-semibold text-purple-300 block">
                    Have a Redeem Code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter promo code"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                    <button
                      onClick={() => handleRedeemCode(checkoutPlan.id)}
                      disabled={isRedeeming}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {isRedeeming ? "Applying" : "Apply"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Enter a promotional coupon or license key to redeem subscription instantly.
                  </p>
                </div>

                <button 
                  onClick={async () => {
                    try {
                      const order = await createRazorpayOrder(checkoutPlan.id);
                      await openRazorpayCheckout(order, checkoutPlan);
                    } catch (err) {
                      // Error handled gracefully in function
                    }
                  }}
                  className="w-full py-3 mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" /> Pay {currency === "INR" ? `₹${checkoutPlan.computedPrice.toLocaleString()}` : `$${checkoutPlan.computedPrice}`} with Razorpay
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* 5. TOP-UP PACKS CHECKOUT MODAL */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="topup-packs-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowTopupModal(false);
                setCheckoutError("");
                setRazorpayStatus("idle");
              }}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-full transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 relative">
              <Coins className="text-purple-400 w-6 h-6 shrink-0" />
              <h3 className="text-xl font-bold text-slate-100">Cognitive Token Top-up Packs</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed relative">
              Low on balance? Instantly recharge your workstation with non-expiring premium platform token packs.
            </p>

            {checkoutError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {checkoutError}
              </div>
            )}

            {razorpayStatus !== "idle" ? (
              <div className="space-y-6 text-center py-6" id="topup-loading-status">
                <div className="p-4 bg-purple-500/10 text-purple-400 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-purple-500/20">
                  {razorpayStatus === "success" ? (
                    <Check className="w-8 h-8 text-emerald-400" />
                  ) : razorpayStatus === "failed" ? (
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  ) : razorpayStatus === "cancelled" ? (
                    <X className="w-8 h-8 text-slate-400" />
                  ) : (
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    {razorpayStatus === "creating_order" && "Initiating Secure Top-up Order..."}
                    {razorpayStatus === "opening_gateway" && "Launching Razorpay Checkout..."}
                    {razorpayStatus === "verifying_payment" && "Confirming Secure Token Credit..."}
                    {razorpayStatus === "success" && "Top-up Applied Successfully!"}
                    {razorpayStatus === "failed" && "Transaction Failed"}
                    {razorpayStatus === "cancelled" && "Transaction Cancelled"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed font-sans">
                    {razorpayStatus === "creating_order" && "Creating your secure Razorpay top-up pack reference on our backend..."}
                    {razorpayStatus === "opening_gateway" && "Launching the secure payment frame. Complete checkout on screen..."}
                    {razorpayStatus === "verifying_payment" && "Validating signature hashes to apply your tokens directly..."}
                    {razorpayStatus === "success" && "Success! Your metered wallet has been successfully credited with the new tokens."}
                    {razorpayStatus === "failed" && (checkoutError || "We encountered an error processing your payment.")}
                    {razorpayStatus === "cancelled" && "The checkout flow was cancelled. No money was deducted."}
                  </p>
                </div>
                {(razorpayStatus === "failed" || razorpayStatus === "cancelled" || razorpayStatus === "success") && (
                  <button
                    onClick={() => {
                      setRazorpayStatus("idle");
                      setCheckoutError("");
                      if (razorpayStatus === "success") {
                        setShowTopupModal(false);
                      }
                    }}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all"
                  >
                    Close & Return
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "micro", name: "Micro Pack", tokens: 500, price: 299, desc: "Standard pack for everyday text processing and converters." },
                  { id: "creator", name: "Creator Pack", tokens: 2500, price: 999, desc: "Ideal for video scripts, multi-agent runs, and media generations." },
                  { id: "agency", name: "Agency Pack", tokens: 7000, price: 2999, desc: "Built for active development and automated WhatsApp loops." },
                  { id: "enterprise", name: "Enterprise Top-Up", tokens: 25000, price: 9999, desc: "Dedicated scaling buffer for high-volume corporate systems." }
                ].map((pack) => (
                  <div
                    key={pack.id}
                    className="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-200 text-sm">{pack.name}</h4>
                        <span className="text-xs px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold rounded-full">
                          +{pack.tokens.toLocaleString()} tokens
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{pack.desc}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-900">
                      <span className="text-base font-black text-white">₹{pack.price.toLocaleString()}</span>
                      <button
                        onClick={async () => {
                          setRazorpayStatus("creating_order");
                          setCheckoutError("");
                          try {
                            const res = await fetch("/api/payment/create-order", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ topupPackId: pack.id })
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              throw new Error(data.message || "Order creation failed on backend");
                            }
                            
                            // Open Razorpay frame
                            await openRazorpayCheckout(data, { name: pack.name });
                          } catch (err: any) {
                            console.error("Top-up initiation failed:", err);
                            setRazorpayStatus("failed");
                            setCheckoutError(err.message || "Top-up order creation failed. Please check your keys.");
                          }
                        }}
                        className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-md animate-pulse"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Buy Pack
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
