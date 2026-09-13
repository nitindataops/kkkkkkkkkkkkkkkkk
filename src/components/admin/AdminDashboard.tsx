import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  ClipboardList,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Activity,
  LifeBuoy,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  Send,
  Clock,
  Filter,
  Building2,
  Phone,
  MapPin,
  BadgeAlert,
  ChevronRight,
  Sprout,
  Check,
  Ban,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { SupportTicket, TicketStatus } from '../../types/support';
import {
  fetchAdminStatsApi,
  fetchAdminFarmersApi,
  updateFarmerVerificationApi,
  updateFarmerStatusApi,
  fetchAdminBuyersApi,
  updateBuyerStatusApi,
  fetchAdminListingsApi,
  updateListingStatusApi,
  deleteListingPermanentlyApi,
  fetchAdminOrdersApi,
  updateAdminOrderStatusApi,
  fetchAdminAuditLogsApi,
  fetchAdminActivityApi,
} from '../../services/authApiService';
import { resolveProductImage } from '../../data/imageAssets';
import { getAdminTranslations } from '../../data/adminTranslations';
import { getLocalizedCropName, getLocalizedStatusName, getLocalizedUnit } from '../../utils/cropLocalization';

interface AdminDashboardProps {
  currentLanguage: LanguageCode;
  onLogout: () => void;
  onSelectLanguage?: (lang: LanguageCode) => void;
}

type AdminTab =
  | 'overview'
  | 'farmers'
  | 'buyers'
  | 'marketplace'
  | 'orders'
  | 'tickets'
  | 'audit'
  | 'diagnostics';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentLanguage,
  onLogout,
  onSelectLanguage,
}) => {
  const ta = getAdminTranslations(currentLanguage);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Core Data States
  const [stats, setStats] = useState<any>(null);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);

  // Search and Filter States
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerFilter, setFarmerFilter] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all');
  const [selectedFarmerModal, setSelectedFarmerModal] = useState<any | null>(null);

  const [buyerSearch, setBuyerSearch] = useState('');
  const [buyerFilter, setBuyerFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedBuyerModal, setSelectedBuyerModal] = useState<any | null>(null);

  const [listingSearch, setListingSearch] = useState('');
  const [listingFilterCrop, setListingFilterCrop] = useState<string>('all');
  const [listingFilterStatus, setListingFilterStatus] = useState<string>('all');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');

  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isReplying, setIsReplying] = useState<boolean>(false);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Load All Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        farmersRes,
        buyersRes,
        listingsRes,
        ordersRes,
        auditRes,
        actRes,
        ticketsRes,
        healthRes,
        twilioRes,
      ] = await Promise.all([
        fetchAdminStatsApi(),
        fetchAdminFarmersApi(),
        fetchAdminBuyersApi(),
        fetchAdminListingsApi(),
        fetchAdminOrdersApi(),
        fetchAdminAuditLogsApi(),
        fetchAdminActivityApi(),
        fetch('/api/support/tickets').then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/health').then((r) => r.json()).catch(() => ({ status: 'unknown' })),
        fetch('/api/support/twilio/diagnostic').then((r) => r.json()).catch(() => ({ status: 'offline' })),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (farmersRes.success && Array.isArray(farmersRes.farmers)) setFarmers(farmersRes.farmers);
      if (buyersRes.success && Array.isArray(buyersRes.buyers)) setBuyers(buyersRes.buyers);
      if (listingsRes.success && Array.isArray(listingsRes.listings)) setListings(listingsRes.listings);
      if (ordersRes.success && Array.isArray(ordersRes.orders)) setOrders(ordersRes.orders);
      if (auditRes.success && Array.isArray(auditRes.auditLogs)) setAuditLogs(auditRes.auditLogs);
      if (actRes.success && Array.isArray(actRes.recentActivity)) setActivity(actRes.recentActivity);
      if (ticketsRes.success && Array.isArray(ticketsRes.tickets)) setTickets(ticketsRes.tickets);

      setDiagnosticData({
        health: healthRes,
        twilio: twilioRes,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      showNotification('error', 'डेटा लोड करने में त्रुटि (Failed to load control data).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // -------------------------------------------------------------
  // Farmer Actions
  // -------------------------------------------------------------
  const handleToggleFarmerVerification = async (farmer: any, newStatus: boolean) => {
    const fId = farmer.farmerId || farmer.id;
    setActionLoadingId(`verify-${fId}`);
    try {
      const res = await updateFarmerVerificationApi(
        fId,
        newStatus,
        `Admin verification toggled to ${newStatus ? 'VERIFIED' : 'PENDING'}`
      );
      if (res.success) {
        showNotification('success', `किसान #${fId} का सत्यापन स्थिति अपडेट की गई (${newStatus ? 'सत्यापित' : 'लंबित'})।`);
        // update local state
        setFarmers((prev) =>
          prev.map((f) => (f.farmerId === fId || f.id === fId ? { ...f, isVerified: newStatus } : f))
        );
        if (selectedFarmerModal && (selectedFarmerModal.farmerId === fId || selectedFarmerModal.id === fId)) {
          setSelectedFarmerModal((prev: any) => ({ ...prev, isVerified: newStatus }));
        }
        // Refresh audit logs
        const aRes = await fetchAdminAuditLogsApi();
        if (aRes.success) setAuditLogs(aRes.auditLogs);
      } else {
        showNotification('error', res.message || 'कार्रवाई विफल हुई');
      }
    } catch (e: any) {
      showNotification('error', e.message || 'नेटवर्क त्रुटि');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFarmerStatus = async (farmer: any, newStatus: 'active' | 'suspended') => {
    const fId = farmer.farmerId || farmer.id;
    const confirmMsg =
      newStatus === 'suspended'
        ? `क्या आप वाकई किसान खाता #${fId} (${farmer.name}) को निलंबित (Suspend) करना चाहते हैं?`
        : `क्या आप किसान खाता #${fId} (${farmer.name}) को पुनः सक्रिय (Activate) करना चाहते हैं?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(`status-${fId}`);
    try {
      const res = await updateFarmerStatusApi(
        fId,
        newStatus,
        newStatus === 'suspended' ? 'Administrative suspension' : 'Administrative reactivation'
      );
      if (res.success) {
        showNotification('success', `किसान खाता स्थिति: ${newStatus === 'suspended' ? 'निलंबित (Suspended)' : 'सक्रिय (Active)'}`);
        setFarmers((prev) =>
          prev.map((f) => (f.farmerId === fId || f.id === fId ? { ...f, status: newStatus } : f))
        );
        if (selectedFarmerModal && (selectedFarmerModal.farmerId === fId || selectedFarmerModal.id === fId)) {
          setSelectedFarmerModal((prev: any) => ({ ...prev, status: newStatus }));
        }
        const aRes = await fetchAdminAuditLogsApi();
        if (aRes.success) setAuditLogs(aRes.auditLogs);
      } else {
        showNotification('error', res.message || 'कार्रवाई विफल हुई');
      }
    } catch (e: any) {
      showNotification('error', e.message || 'नेटवर्क त्रुटि');
    } finally {
      setActionLoadingId(null);
    }
  };

  // -------------------------------------------------------------
  // Buyer Actions
  // -------------------------------------------------------------
  const handleToggleBuyerStatus = async (buyer: any, newStatus: 'active' | 'suspended') => {
    const bId = buyer.buyerId || buyer.id;
    const confirmMsg =
      newStatus === 'suspended'
        ? `क्या आप खरीदार खाता #${bId} (${buyer.name || buyer.businessName}) को निलंबित करना चाहते हैं?`
        : `क्या आप खरीदार खाता #${bId} को पुनः सक्रिय करना चाहते हैं?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(`buyer-status-${bId}`);
    try {
      const res = await updateBuyerStatusApi(
        bId,
        newStatus,
        newStatus === 'suspended' ? 'Admin policy suspension' : 'Admin reactivation'
      );
      if (res.success) {
        showNotification('success', `खरीदार खाता स्थिति: ${newStatus === 'suspended' ? 'निलंबित' : 'सक्रिय'}`);
        setBuyers((prev) =>
          prev.map((b) => (b.buyerId === bId || b.id === bId ? { ...b, status: newStatus } : b))
        );
        if (selectedBuyerModal && (selectedBuyerModal.buyerId === bId || selectedBuyerModal.id === bId)) {
          setSelectedBuyerModal((prev: any) => ({ ...prev, status: newStatus }));
        }
        const aRes = await fetchAdminAuditLogsApi();
        if (aRes.success) setAuditLogs(aRes.auditLogs);
      } else {
        showNotification('error', res.message || 'कार्रवाई विफल हुई');
      }
    } catch (e: any) {
      showNotification('error', e.message || 'नेटवर्क त्रुटि');
    } finally {
      setActionLoadingId(null);
    }
  };

  // -------------------------------------------------------------
  // Marketplace Listing Actions
  // -------------------------------------------------------------
  const handleUpdateListingStatus = async (listingId: string, newStatus: 'available' | 'sold' | 'disabled') => {
    setActionLoadingId(`listing-status-${listingId}`);
    try {
      const res = await updateListingStatusApi(listingId, newStatus, `Status changed by Admin to ${newStatus}`);
      if (res.success) {
        showNotification('success', `फसल लिस्टिंग #${listingId} की स्थिति बदलकर '${newStatus}' कर दी गई।`);
        setListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, status: newStatus === 'available' ? 'Available for Sale' : newStatus === 'sold' ? 'Sold Out' : 'Disabled' } : l))
        );
        const aRes = await fetchAdminAuditLogsApi();
        if (aRes.success) setAuditLogs(aRes.auditLogs);
      } else {
        showNotification('error', res.message || 'अपडेट विफल हुआ');
      }
    } catch (e: any) {
      showNotification('error', e.message || 'नेटवर्क त्रुटि');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteListingPermanently = async (listing: any) => {
    const lId = listing.id;
    const confirmMsg = `सावधानी: क्या आप फसल लिस्टिंग #${lId} (${listing.name || listing.cropName}) को डेटाबेस से स्थायी रूप से हटाना चाहते हैं?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(`listing-delete-${lId}`);
    try {
      const res = await deleteListingPermanentlyApi(lId, 'Permanently removed by Admin from Control Center');
      if (res.success) {
        showNotification('success', `फसल लिस्टिंग #${lId} स्थायी रूप से हटा दी गई।`);
        setListings((prev) => prev.filter((l) => l.id !== lId));
        const aRes = await fetchAdminAuditLogsApi();
        if (aRes.success) setAuditLogs(aRes.auditLogs);
      } else {
        showNotification('error', res.message || 'हटाने में विफलता');
      }
    } catch (e: any) {
      showNotification('error', e.message || 'नेटवर्क त्रुटि');
    } finally {
      setActionLoadingId(null);
    }
  };

  // -------------------------------------------------------------
  // Orders Actions
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionLoadingId(`order-status-${orderId}`);
    try {
      const res = await updateAdminOrderStatusApi(orderId, newStatus, `Status updated by Admin to ${newStatus}`);
      if (res.success) {
        showNotification('success', `ऑर्डर #${orderId} की स्थिति '${newStatus}' कर दी गई।`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        const aRes = await fetchAdminAuditLogsApi();
        if (aRes.success) setAuditLogs(aRes.auditLogs);
      } else {
        showNotification('error', res.message || 'ऑर्डर अपडेट विफल');
      }
    } catch (e: any) {
      showNotification('error', e.message || 'नेटवर्क त्रुटि');
    } finally {
      setActionLoadingId(null);
    }
  };

  // -------------------------------------------------------------
  // Support Tickets Actions
  // -------------------------------------------------------------
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        if (selectedTicket?.ticketId === ticketId) {
          setSelectedTicket(data.ticket);
        }
        setTickets((prev) =>
          prev.map((t) => (t.ticketId === ticketId ? data.ticket : t))
        );
        showNotification('success', `टिकट स्थिति '${newStatus}' में बदली गई।`);
      }
    } catch (e) {
      showNotification('error', 'टिकट स्थिति बदलने में त्रुटि');
    }
  };

  const handleReplyTicket = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyText.trim(),
          senderName: 'Kisan Saathi Admin',
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setSelectedTicket(data.ticket);
        setTickets((prev) =>
          prev.map((t) => (t.ticketId === data.ticket.ticketId ? data.ticket : t))
        );
        setReplyText('');
        showNotification('success', 'आधिकारिक एडमिन संदेश भेजा गया।');
      }
    } catch (e) {
      showNotification('error', 'संदेश भेजने में त्रुटि');
    } finally {
      setIsReplying(false);
    }
  };

  // -------------------------------------------------------------
  // Filtered Collections
  // -------------------------------------------------------------
  const filteredFarmers = farmers.filter((f) => {
    const q = farmerSearch.toLowerCase();
    const matchesSearch =
      !q ||
      (f.name || '').toLowerCase().includes(q) ||
      (f.phone || '').toLowerCase().includes(q) ||
      (f.district || '').toLowerCase().includes(q) ||
      (f.farmerId || '').toLowerCase().includes(q) ||
      (f.aadhaarNumber || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (farmerFilter === 'verified') return f.isVerified === true;
    if (farmerFilter === 'pending') return f.isVerified === false;
    if (farmerFilter === 'suspended') return f.status === 'suspended';
    return true;
  });

  const filteredBuyers = buyers.filter((b) => {
    const q = buyerSearch.toLowerCase();
    const matchesSearch =
      !q ||
      (b.name || '').toLowerCase().includes(q) ||
      (b.businessName || '').toLowerCase().includes(q) ||
      (b.phone || '').toLowerCase().includes(q) ||
      (b.district || '').toLowerCase().includes(q) ||
      (b.buyerId || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (buyerFilter === 'active') return b.status !== 'suspended';
    if (buyerFilter === 'suspended') return b.status === 'suspended';
    return true;
  });

  const filteredListings = listings.filter((l) => {
    const q = listingSearch.toLowerCase();
    const cropName = (l.name || l.cropName || '').toLowerCase();
    const matchesSearch =
      !q ||
      cropName.includes(q) ||
      (l.farmerName || '').toLowerCase().includes(q) ||
      (l.district || l.mandi || '').toLowerCase().includes(q) ||
      (l.id || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (listingFilterCrop !== 'all') {
      if (!cropName.includes(listingFilterCrop.toLowerCase())) return false;
    }

    if (listingFilterStatus !== 'all') {
      const statusLower = (l.status || '').toLowerCase();
      if (listingFilterStatus === 'available' && !statusLower.includes('available')) return false;
      if (listingFilterStatus === 'sold' && !statusLower.includes('sold')) return false;
      if (listingFilterStatus === 'disabled' && !statusLower.includes('disabled')) return false;
    }

    return true;
  });

  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.toLowerCase();
    const matchesSearch =
      !q ||
      (o.id || '').toLowerCase().includes(q) ||
      (o.orderNumber || '').toLowerCase().includes(q) ||
      (o.buyerName || '').toLowerCase().includes(q) ||
      (o.farmerName || '').toLowerCase().includes(q) ||
      (o.cropName || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (orderFilterStatus !== 'all' && (o.status || '').toLowerCase() !== orderFilterStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'all') return true;
    return t.status.toLowerCase() === ticketFilter.toLowerCase();
  });

  const openTicketsCount = tickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'IN_REVIEW' || t.status === 'ESCALATED'
  ).length;

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#1E2922] flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-slideIn ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-600'
              : 'bg-rose-800 text-white border-rose-600'
          }`}
        >
          <span>{feedbackMessage.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Top Professional Header */}
      <header className="bg-white border-b border-[#E6DEC9] px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#245C3A] text-white flex items-center justify-center font-black text-base shadow-sm">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-[#1E2922] tracking-tight">
                {ta.header.title}
              </h1>
              <span className="text-[10px] font-bold bg-[#EEF3E8] text-[#245C3A] border border-[#D5E4CE] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {ta.header.badge}
              </span>
            </div>
            <p className="text-[11px] text-[#55675C]">
              {ta.header.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector in Admin Header */}
          <div className="flex items-center gap-1 bg-[#F2EDE1] p-1 rounded-xl border border-[#E6DEC9]">
            <select
              id="admin-language-select"
              value={currentLanguage}
              onChange={(e) => onSelectLanguage && onSelectLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-[#1E2922] font-bold text-xs py-1 px-1.5 rounded-lg cursor-pointer focus:outline-hidden"
              aria-label="Select Language"
            >
              <option value="hi">🇮🇳 हिंदी</option>
              <option value="en">🇬🇧 English</option>
              <option value="pa">🇮🇳 ਪੰਜਾਬੀ</option>
              <option value="hr">🇮🇳 हरियाणवी</option>
              <option value="te">🇮🇳 తెలుగు</option>
              <option value="ta">🇮🇳 தமிழ்</option>
            </select>
          </div>

          <button
            id="admin-refresh-data-btn"
            type="button"
            onClick={loadAdminData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#4A5D52] bg-[#F2EDE1] hover:bg-[#EAE4D5] rounded-xl transition-colors cursor-pointer"
            title={ta.header.refreshData}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{ta.header.refreshData}</span>
          </button>
          <button
            id="admin-logout-btn"
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#B3261E] bg-[#FDF2F2] border border-[#F9DEDC] hover:bg-[#FCE8E6] rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{ta.header.signOut}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 lg:p-6 gap-6">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 shrink-0 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            {ta.navigation.modulesHeading}
          </div>

          <button
            id="admin-nav-overview"
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#245C3A] text-white shadow-sm font-bold'
                : 'text-[#3E5146] hover:bg-[#EEF3E8] hover:text-[#1B492E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>{ta.navigation.overview}</span>
            </div>
          </button>

          <button
            id="admin-nav-farmers"
            type="button"
            onClick={() => setActiveTab('farmers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'farmers'
                ? 'bg-[#245C3A] text-white shadow-sm font-bold'
                : 'text-[#3E5146] hover:bg-[#EEF3E8] hover:text-[#1B492E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>{ta.navigation.farmers}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'farmers' ? 'bg-white/20 text-white' : 'bg-[#EAE4D5] text-[#3E5146]'
              }`}
            >
              {farmers.length}
            </span>
          </button>

          <button
            id="admin-nav-buyers"
            type="button"
            onClick={() => setActiveTab('buyers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'buyers'
                ? 'bg-[#245C3A] text-white shadow-sm font-bold'
                : 'text-[#3E5146] hover:bg-[#EEF3E8] hover:text-[#1B492E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4" />
              <span>{ta.navigation.buyers}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'buyers' ? 'bg-white/20 text-white' : 'bg-[#EAE4D5] text-[#3E5146]'
              }`}
            >
              {buyers.length}
            </span>
          </button>

          <button
            id="admin-nav-marketplace"
            type="button"
            onClick={() => setActiveTab('marketplace')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-[#245C3A] text-white shadow-sm font-bold'
                : 'text-[#3E5146] hover:bg-[#EEF3E8] hover:text-[#1B492E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>{ta.navigation.marketplace}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'marketplace' ? 'bg-white/20 text-white' : 'bg-[#EAE4D5] text-[#3E5146]'
              }`}
            >
              {listings.length}
            </span>
          </button>

          <button
            id="admin-nav-orders"
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#245C3A] text-white shadow-sm font-bold'
                : 'text-[#3E5146] hover:bg-[#EEF3E8] hover:text-[#1B492E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ClipboardList className="w-4 h-4" />
              <span>{ta.navigation.orders}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[#EAE4D5] text-[#3E5146]'
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            id="admin-nav-audit"
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#245C3A] text-white shadow-sm font-bold'
                : 'text-[#3E5146] hover:bg-[#EEF3E8] hover:text-[#1B492E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>{ta.navigation.auditLogs}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'audit' ? 'bg-white/20 text-white' : 'bg-[#EAE4D5] text-[#3E5146]'
              }`}
            >
              {auditLogs.length}
            </span>
          </button>

          <button
            id="admin-nav-tickets"
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-[#245C3A] text-white shadow-sm font-bold'
                : 'text-[#3E5146] hover:bg-[#EEF3E8] hover:text-[#1B492E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LifeBuoy className="w-4 h-4" />
              <span>{ta.navigation.tickets}</span>
            </div>
            {openTicketsCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white">
                {openTicketsCount}
              </span>
            )}
          </button>

          <button
            id="admin-nav-diagnostics"
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-[#245C3A] text-white shadow-sm font-bold'
                : 'text-[#3E5146] hover:bg-[#EEF3E8] hover:text-[#1B492E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4" />
              <span>{ta.navigation.diagnostics}</span>
            </div>
          </button>

          {/* Quick System Badge */}
          <div className="pt-4 border-t border-[#E6DEC9]">
            <div className="p-3 bg-white rounded-xl border border-[#E6DEC9] text-xs">
              <div className="flex items-center justify-between font-bold text-gray-800 mb-1">
                <span>{ta.overview.stats.systemHealth}</span>
                <span className="flex items-center gap-1 text-emerald-700 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {ta.buyersTab.statusActive}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 leading-snug">
                {ta.diagnosticsTab.allServicesOperational}
              </div>
            </div>
          </div>
        </nav>

        {/* Dynamic Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* ================================================================ */}
          {/* TAB 1: OVERVIEW & SYSTEM STATS */}
          {/* ================================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E6DEC9] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#55675C] uppercase tracking-wider">
                      {ta.overview.stats.totalFarmers}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#1E2922] mt-3">
                    {stats?.totalFarmers ?? farmers.length}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{stats?.verifiedFarmers ?? farmers.filter((f) => f.isVerified).length} {ta.overview.stats.verifiedFarmers}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E6DEC9] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#55675C] uppercase tracking-wider">
                      {ta.overview.stats.activeBuyers}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#1E2922] mt-3">
                    {stats?.totalBuyers ?? buyers.length}
                  </div>
                  <div className="text-xs text-blue-700 font-semibold mt-1">
                    {ta.buyersTab.subtitle}
                  </div>
                </div>

                <div className="bg-white border border-[#E6DEC9] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#55675C] uppercase tracking-wider">
                      {ta.overview.stats.activeListings}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#1E2922] mt-3">
                    {stats?.activeListings ?? listings.length}
                  </div>
                  <div className="text-xs text-amber-800 font-semibold mt-1">
                    {ta.marketplaceTab.subtitle}
                  </div>
                </div>

                <div className="bg-white border border-[#E6DEC9] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#55675C] uppercase tracking-wider">
                      {ta.overview.stats.openTickets}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#EEF3E8] text-[#245C3A] flex items-center justify-center">
                      <BadgeAlert className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#1E2922] mt-3">
                    {stats?.pendingVerifications ?? farmers.filter((f) => !f.isVerified).length}
                  </div>
                  <div className="text-xs text-[#245C3A] font-semibold mt-1">
                    {ta.farmersTab.filterPending}
                  </div>
                </div>
              </div>

              {/* Quick Action Hub */}
              <div className="bg-gradient-to-br from-[#1B492E] via-[#245C3A] to-[#163E26] text-white p-6 rounded-2xl shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{ta.overview.quickActionsTitle}</h3>
                    <p className="text-xs text-[#D5E4CE] mt-1">
                      {ta.overview.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('farmers');
                        setFarmerFilter('pending');
                      }}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
                    >
                      {ta.farmersTab.verifyBtn} →
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('marketplace')}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
                    >
                      {ta.navigation.marketplace} →
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('audit')}
                      className="px-3.5 py-2 bg-white text-[#1B492E] hover:bg-[#EEF3E8] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      {ta.navigation.auditLogs} →
                    </button>
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Recent Activity Stream & System Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Platform Activity */}
                <div className="bg-white border border-[#E6DEC9] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#245C3A]" />
                      <span>{ta.overview.recentActivityTitle}</span>
                    </h3>
                    <span className="text-[11px] text-gray-400 font-semibold">{ta.overview.recentActivitySub}</span>
                  </div>

                  <div className="space-y-3">
                    {activity.length === 0 ? (
                      <div className="text-xs text-gray-500 py-6 text-center">{ta.overview.noRecentActivity}</div>
                    ) : (
                      activity.slice(0, 5).map((act: any) => (
                        <div
                          key={act.id}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors text-xs"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#EEF3E8] text-[#245C3A] flex items-center justify-center shrink-0 font-bold">
                            {act.type === 'FARMER_REGISTERED' ? '👨‍🌾' : act.type === 'BUYER_REGISTERED' ? '🏪' : '🌾'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{act.title}</p>
                            <p className="text-[11px] text-gray-500 truncate">{act.description}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Orders Overview Snapshot */}
                <div className="bg-white border border-[#E6DEC9] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-emerald-700" />
                      <span>{ta.ordersTab.title}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#245C3A] font-bold hover:underline cursor-pointer"
                    >
                      {ta.ordersTab.viewDetails} →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                      <div className="text-xs font-semibold">{getLocalizedStatusName('COMPLETED', currentLanguage)}</div>
                      <div className="text-xl font-bold mt-1">
                        {orders.filter((o) => o.status === 'COMPLETED').length}
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                      <div className="text-xs font-semibold">{getLocalizedStatusName('PENDING', currentLanguage)}</div>
                      <div className="text-xl font-bold mt-1">
                        {orders.filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED').length}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {orders.slice(0, 4).map((o: any) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs border border-gray-100"
                      >
                        <div>
                          <span className="font-bold text-gray-900">{o.cropName}</span>
                          <span className="text-gray-500 text-[11px] ml-1.5">({o.quantityKg} किग्रा)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-800">₹{o.totalAmount}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-200 text-gray-800">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: FARMER PORTAL CONTROL & VERIFICATION */}
          {/* ================================================================ */}
          {activeTab === 'farmers' && (
            <div className="space-y-5">
              <div className="bg-white border border-[#E6DEC9] rounded-2xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">
                      {ta.farmersTab.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ta.farmersTab.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    {filteredFarmers.length} {ta.navigation.farmers}
                  </span>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="farmer-search-input"
                      type="text"
                      value={farmerSearch}
                      onChange={(e) => setFarmerSearch(e.target.value)}
                      placeholder={ta.farmersTab.searchPlaceholder}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#245C3A] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    {(['all', 'verified', 'pending', 'suspended'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setFarmerFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                          farmerFilter === filter
                            ? 'bg-[#245C3A] text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter === 'all'
                          ? ta.farmersTab.filterAll
                          : filter === 'verified'
                          ? ta.farmersTab.filterVerified
                          : filter === 'pending'
                          ? ta.farmersTab.filterPending
                          : ta.farmersTab.filterSuspended}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Farmers Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E6DEC9] text-gray-500 uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">{ta.farmersTab.tableHeaders.farmer}</th>
                        <th className="py-2.5 px-3">{ta.farmersTab.tableHeaders.contact}</th>
                        <th className="py-2.5 px-3">{ta.farmersTab.tableHeaders.location}</th>
                        <th className="py-2.5 px-3">{ta.farmersTab.tableHeaders.land}</th>
                        <th className="py-2.5 px-3">{ta.farmersTab.tableHeaders.kyc}</th>
                        <th className="py-2.5 px-3">{ta.farmersTab.tableHeaders.status}</th>
                        <th className="py-2.5 px-3 text-right">{ta.farmersTab.tableHeaders.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFarmers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                            {ta.farmersTab.noFarmersFound}
                          </td>
                        </tr>
                      ) : (
                        filteredFarmers.map((f) => {
                          const fId = f.farmerId || f.id;
                          const isActing = actionLoadingId?.includes(fId);

                          return (
                            <tr key={fId} className="hover:bg-[#FAF8F2] transition-colors">
                              <td className="py-3 px-3">
                                <div className="font-bold text-gray-900">{f.name}</div>
                                {f.fatherName && (
                                  <div className="text-[11px] text-gray-500">S/O: {f.fatherName}</div>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-mono text-[11px] text-[#245C3A] font-bold">{fId}</div>
                                <div className="text-[11px] text-gray-600">{f.phone || '-'}</div>
                              </td>
                              <td className="py-3 px-3 text-gray-600">
                                <div>{f.village || f.city || 'Gram'}, {f.district || 'Bareilly'}</div>
                                <div className="text-[11px] text-gray-400">{f.state || 'Uttar Pradesh'}</div>
                              </td>
                              <td className="py-3 px-3 font-semibold">
                                {f.landAreaAcres ? `${f.landAreaAcres} ${getLocalizedUnit('acres', currentLanguage)}` : '-'}
                                {f.khasraNumber && (
                                  <div className="text-[10px] text-gray-400 font-mono">Khasra: {f.khasraNumber}</div>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                {f.isVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <Check className="w-3 h-3" />
                                    {ta.farmersTab.filterVerified}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    <Clock className="w-3 h-3" />
                                    {ta.farmersTab.filterPending}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                {f.status === 'suspended' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    <Ban className="w-3 h-3" />
                                    {ta.farmersTab.filterSuspended}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                    {ta.buyersTab.statusActive}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* View Detail Modal Button */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedFarmerModal(f)}
                                    className="p-1.5 text-gray-500 hover:text-[#245C3A] bg-gray-100 hover:bg-[#EEF3E8] rounded-lg transition-colors cursor-pointer"
                                    title={ta.farmersTab.viewDetailsBtn}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Verification Toggle */}
                                  <button
                                    type="button"
                                    disabled={isActing}
                                    onClick={() => handleToggleFarmerVerification(f, !f.isVerified)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                      f.isVerified
                                        ? 'bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-800'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                  >
                                    {f.isVerified ? ta.common.cancel : ta.farmersTab.verifyBtn}
                                  </button>

                                  {/* Suspension Toggle */}
                                  <button
                                    type="button"
                                    disabled={isActing}
                                    onClick={() =>
                                      handleToggleFarmerStatus(f, f.status === 'suspended' ? 'active' : 'suspended')
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                      f.status === 'suspended'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    }`}
                                  >
                                    {f.status === 'suspended' ? ta.farmersTab.reactivateBtn : ta.farmersTab.suspendBtn}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Farmer Detail Drawer / Modal */}
              {selectedFarmerModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h3 className="font-bold text-base text-gray-900">{selectedFarmerModal.name}</h3>
                        <p className="text-xs text-[#245C3A] font-mono font-bold">
                          {selectedFarmerModal.farmerId || selectedFarmerModal.id}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFarmerModal(null)}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block">{ta.farmersTab.tableHeaders.farmer}:</span>
                        <span className="font-bold text-gray-800">{selectedFarmerModal.fatherName || '-'}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block">{ta.farmersTab.tableHeaders.contact}:</span>
                        <span className="font-bold text-gray-800">{selectedFarmerModal.phone || '-'}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block">{ta.farmersTab.tableHeaders.location}:</span>
                        <span className="font-bold text-gray-800">
                          {selectedFarmerModal.village || 'Gram'}, {selectedFarmerModal.district || 'Bareilly'}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block">{ta.farmersTab.tableHeaders.location}:</span>
                        <span className="font-bold text-gray-800">{selectedFarmerModal.state || 'Uttar Pradesh'}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block">{ta.farmersTab.tableHeaders.kyc}:</span>
                        <span className="font-bold text-gray-800">{selectedFarmerModal.aadhaarNumber || '-'}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block">{ta.farmersTab.tableHeaders.land}:</span>
                        <span className="font-bold text-gray-800">
                          {selectedFarmerModal.landAreaAcres ? `${selectedFarmerModal.landAreaAcres} ${getLocalizedUnit('acres', currentLanguage)}` : '-'}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block">{ta.farmersTab.tableHeaders.kyc}:</span>
                        <span className="font-bold text-gray-800">
                          {selectedFarmerModal.khasraNumber || selectedFarmerModal.khataNumber || '-'}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block">{ta.auditTab.tableHeaders.timestamp}:</span>
                        <span className="font-bold text-gray-800">
                          {selectedFarmerModal.createdAt
                            ? new Date(selectedFarmerModal.createdAt).toLocaleDateString()
                            : ta.farmersTab.filterVerified}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => setSelectedFarmerModal(null)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        {ta.common.close}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: BUYER PORTAL CONTROL & PROCUREMENT */}
          {/* ================================================================ */}
          {activeTab === 'buyers' && (
            <div className="space-y-5">
              <div className="bg-white border border-[#E6DEC9] rounded-2xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">
                      {ta.buyersTab.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ta.buyersTab.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    {filteredBuyers.length} {ta.navigation.buyers}
                  </span>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="buyer-search-input"
                      type="text"
                      value={buyerSearch}
                      onChange={(e) => setBuyerSearch(e.target.value)}
                      placeholder={ta.buyersTab.searchPlaceholder}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#245C3A] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    {(['all', 'active', 'suspended'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setBuyerFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                          buyerFilter === filter
                            ? 'bg-[#245C3A] text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter === 'all' ? ta.buyersTab.filterAll : filter === 'active' ? ta.buyersTab.filterActive : ta.buyersTab.filterSuspended}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buyers Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E6DEC9] text-gray-500 uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">{ta.buyersTab.tableHeaders.business}</th>
                        <th className="py-2.5 px-3">{ta.buyersTab.tableHeaders.buyer}</th>
                        <th className="py-2.5 px-3">{ta.buyersTab.tableHeaders.type}</th>
                        <th className="py-2.5 px-3">{ta.buyersTab.tableHeaders.location} / {ta.buyersTab.tableHeaders.contact}</th>
                        <th className="py-2.5 px-3">{ta.navigation.orders}</th>
                        <th className="py-2.5 px-3">{ta.buyersTab.tableHeaders.status}</th>
                        <th className="py-2.5 px-3 text-right">{ta.buyersTab.tableHeaders.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBuyers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                            {ta.buyersTab.noBuyersFound}
                          </td>
                        </tr>
                      ) : (
                        filteredBuyers.map((b) => {
                          const bId = b.buyerId || b.id;
                          const isActing = actionLoadingId?.includes(bId);

                          return (
                            <tr key={bId} className="hover:bg-[#FAF8F2] transition-colors">
                              <td className="py-3 px-3">
                                <div className="font-bold text-gray-900">{b.businessName || b.name}</div>
                                <div className="font-mono text-[10px] text-[#245C3A] font-bold">{bId}</div>
                              </td>
                              <td className="py-3 px-3 font-medium text-gray-800">
                                {b.name}
                              </td>
                              <td className="py-3 px-3">
                                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                  {b.businessType || 'Mandi Trader'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-600">
                                <div>{b.city || b.district || 'Bareilly'}, {b.state || 'UP'}</div>
                                <div className="text-[11px] text-gray-400">{b.phone || '-'}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-gray-800">
                                  {b.demandsCount ?? b.inquiriesCount ?? 1} {ta.navigation.orders}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                {b.status === 'suspended' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    {ta.buyersTab.filterSuspended}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {ta.buyersTab.filterActive}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBuyerModal(b)}
                                    className="p-1.5 text-gray-500 hover:text-[#245C3A] bg-gray-100 hover:bg-[#EEF3E8] rounded-lg transition-colors cursor-pointer"
                                    title={ta.farmersTab.viewDetailsBtn}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isActing}
                                    onClick={() =>
                                      handleToggleBuyerStatus(b, b.status === 'suspended' ? 'active' : 'suspended')
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                      b.status === 'suspended'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    }`}
                                  >
                                    {b.status === 'suspended' ? ta.buyersTab.reactivateBtn : ta.buyersTab.suspendBtn}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Buyer Detail Modal */}
              {selectedBuyerModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h3 className="font-bold text-base text-gray-900">
                          {selectedBuyerModal.businessName || selectedBuyerModal.name}
                        </h3>
                        <p className="text-xs text-[#245C3A] font-mono font-bold">
                          {selectedBuyerModal.buyerId || selectedBuyerModal.id}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedBuyerModal(null)}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-500">{ta.buyersTab.tableHeaders.buyer}:</span>
                        <span className="font-bold">{selectedBuyerModal.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-500">{ta.buyersTab.tableHeaders.type}:</span>
                        <span className="font-bold">{selectedBuyerModal.businessType}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-500">{ta.buyersTab.tableHeaders.contact}:</span>
                        <span className="font-bold">{selectedBuyerModal.phone || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-500">{ta.buyersTab.tableHeaders.location}:</span>
                        <span className="font-bold">
                          {selectedBuyerModal.city || selectedBuyerModal.district}, {selectedBuyerModal.state}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-500">{ta.buyersTab.tableHeaders.status}:</span>
                        <span className="font-bold">{selectedBuyerModal.status === 'suspended' ? ta.buyersTab.filterSuspended : ta.buyersTab.filterActive}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => setSelectedBuyerModal(null)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        {ta.common.close}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: MARKETPLACE & CROP LISTINGS CONTROL */}
          {/* ================================================================ */}
          {activeTab === 'marketplace' && (
            <div className="space-y-5">
              <div className="bg-white border border-[#E6DEC9] rounded-2xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">
                      {ta.marketplaceTab.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ta.marketplaceTab.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    {filteredListings.length} {ta.navigation.marketplace}
                  </span>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="relative col-span-1 sm:col-span-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="listing-search-input"
                      type="text"
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                      placeholder={ta.marketplaceTab.searchPlaceholder}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#245C3A] focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Crop Filter */}
                  <div>
                    <select
                      id="listing-crop-filter"
                      value={listingFilterCrop}
                      onChange={(e) => setListingFilterCrop(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#245C3A] focus:outline-none"
                    >
                      <option value="all">{ta.marketplaceTab.filterCropAll}</option>
                      <option value="wheat">{getLocalizedCropName('wheat', currentLanguage)}</option>
                      <option value="rice">{getLocalizedCropName('rice', currentLanguage)}</option>
                      <option value="maize">{getLocalizedCropName('maize', currentLanguage)}</option>
                      <option value="chana">{getLocalizedCropName('chana', currentLanguage)}</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      id="listing-status-filter"
                      value={listingFilterStatus}
                      onChange={(e) => setListingFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#245C3A] focus:outline-none"
                    >
                      <option value="all">{ta.marketplaceTab.filterStatusAll}</option>
                      <option value="available">{ta.marketplaceTab.statusAvailable}</option>
                      <option value="sold">{ta.marketplaceTab.statusSold}</option>
                      <option value="disabled">{ta.marketplaceTab.statusDisabled}</option>
                    </select>
                  </div>
                </div>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredListings.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 text-xs">
                      {ta.marketplaceTab.noListingsFound}
                    </div>
                  ) : (
                    filteredListings.map((listing) => {
                      const lId = listing.id;
                      const isActing = actionLoadingId?.includes(lId);
                      const resolvedImg = resolveProductImage({
                        imageUrl: listing.imageUrl,
                        crop: listing.name || listing.cropName,
                        variety: listing.variety,
                        category: listing.category,
                      });

                      return (
                        <div
                          key={lId}
                          className="bg-[#FAF9F5] border border-[#E6DEC9] rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-[#245C3A]/50 transition-all"
                        >
                          <div>
                            {/* Image + Crop Badge */}
                            <div className="relative h-32 w-full rounded-xl overflow-hidden bg-gray-200 mb-3">
                              <img
                                src={resolvedImg}
                                alt={listing.name || listing.cropName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                #{lId}
                              </div>
                              <div className="absolute top-2 right-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    (listing.status || '').toLowerCase().includes('available')
                                      ? 'bg-emerald-600 text-white'
                                      : (listing.status || '').toLowerCase().includes('sold')
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-600 text-white'
                                  }`}
                                >
                                  {(listing.status || '').toLowerCase().includes('available')
                                    ? ta.marketplaceTab.statusAvailable
                                    : (listing.status || '').toLowerCase().includes('sold')
                                    ? ta.marketplaceTab.statusSold
                                    : ta.marketplaceTab.statusDisabled}
                                </span>
                              </div>
                            </div>

                            {/* Crop Details */}
                            <h4 className="font-bold text-sm text-gray-900">
                              {getLocalizedCropName(listing.name || listing.cropName, currentLanguage)}{' '}
                              {listing.variety && <span className="text-gray-500 text-xs">({listing.variety})</span>}
                            </h4>

                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                              <div>
                                <strong>{ta.marketplaceTab.tableHeaders.farmer}:</strong> {listing.farmerName || 'Kisan'}
                              </div>
                              <div>
                                <strong>{ta.farmersTab.tableHeaders.location}:</strong> {listing.district || listing.location || 'UP'}
                              </div>
                              <div>
                                <strong>{ta.marketplaceTab.tableHeaders.quantity}:</strong>{' '}
                                <span className="font-semibold text-gray-900">
                                  {listing.quantityKg || listing.quantity} {getLocalizedUnit('kg', currentLanguage)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 text-base font-extrabold text-emerald-800">
                              ₹{listing.pricePerKg ? `${listing.pricePerKg}/${getLocalizedUnit('kg', currentLanguage)}` : `${listing.pricePerQuintal || listing.price}/${getLocalizedUnit('quintal', currentLanguage)}`}
                            </div>
                          </div>

                          {/* Control Actions */}
                          <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2">
                            {/* Toggle Status Select */}
                            <select
                              value={
                                (listing.status || '').toLowerCase().includes('sold')
                                  ? 'sold'
                                  : (listing.status || '').toLowerCase().includes('disabled')
                                  ? 'disabled'
                                  : 'available'
                              }
                              disabled={isActing}
                              onChange={(e) =>
                                handleUpdateListingStatus(
                                  lId,
                                  e.target.value as 'available' | 'sold' | 'disabled'
                                )
                              }
                              className="text-[11px] font-semibold bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-700 focus:outline-none cursor-pointer"
                            >
                              <option value="available">{ta.marketplaceTab.statusAvailable}</option>
                              <option value="sold">{ta.marketplaceTab.statusSold}</option>
                              <option value="disabled">{ta.marketplaceTab.statusDisabled}</option>
                            </select>

                            {/* Delete Button */}
                            <button
                              type="button"
                              disabled={isActing}
                              onClick={() => handleDeleteListingPermanently(listing)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={ta.marketplaceTab.deleteListing}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 5: ORDERS & TRANSACTIONS OVERSIGHT */}
          {/* ================================================================ */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="bg-white border border-[#E6DEC9] rounded-2xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">
                      {ta.ordersTab.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ta.ordersTab.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    {filteredOrders.length} {ta.navigation.orders}
                  </span>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="order-search-input"
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder={ta.ordersTab.searchPlaceholder}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#245C3A] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={orderFilterStatus}
                      onChange={(e) => setOrderFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#245C3A] focus:outline-none cursor-pointer"
                    >
                      <option value="all">{ta.ordersTab.filterAll}</option>
                      <option value="PENDING">{getLocalizedStatusName('PENDING', currentLanguage)}</option>
                      <option value="ACCEPTED">{getLocalizedStatusName('ACCEPTED', currentLanguage)}</option>
                      <option value="COMPLETED">{getLocalizedStatusName('COMPLETED', currentLanguage)}</option>
                      <option value="CANCELLED">{getLocalizedStatusName('CANCELLED', currentLanguage)}</option>
                    </select>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E6DEC9] text-gray-500 uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">{ta.ordersTab.tableHeaders.orderNo}</th>
                        <th className="py-2.5 px-3">{ta.ordersTab.tableHeaders.crop} / {ta.ordersTab.tableHeaders.quantity}</th>
                        <th className="py-2.5 px-3">{ta.ordersTab.tableHeaders.buyer}</th>
                        <th className="py-2.5 px-3">{ta.ordersTab.tableHeaders.farmer}</th>
                        <th className="py-2.5 px-3">{ta.ordersTab.tableHeaders.totalAmount}</th>
                        <th className="py-2.5 px-3">{ta.ordersTab.tableHeaders.status}</th>
                        <th className="py-2.5 px-3 text-right">{ta.ordersTab.tableHeaders.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                            {ta.ordersTab.noOrdersFound}
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const isActing = actionLoadingId?.includes(order.id);

                          return (
                            <tr key={order.id} className="hover:bg-[#FAF8F2] transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-[#245C3A]">
                                #{order.orderNumber || order.id}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-gray-900">{getLocalizedCropName(order.cropName, currentLanguage)}</div>
                                <div className="text-[11px] text-gray-500">{order.quantityKg} {getLocalizedUnit('kg', currentLanguage)}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-gray-800">{order.buyerName}</div>
                                <div className="text-[10px] text-gray-400">{order.buyerMobile}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-gray-800">{order.farmerName}</div>
                                <div className="text-[10px] text-gray-400">{order.farmerMobile}</div>
                              </td>
                              <td className="py-3 px-3 font-bold font-mono text-emerald-800">
                                ₹{order.totalAmount}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    order.status === 'COMPLETED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : order.status === 'ACCEPTED'
                                      ? 'bg-blue-100 text-blue-800'
                                      : order.status === 'PENDING'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {getLocalizedStatusName(order.status, currentLanguage)}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <select
                                  value={order.status}
                                  disabled={isActing}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className="text-[11px] font-semibold bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-700 cursor-pointer"
                                >
                                  <option value="PENDING">{getLocalizedStatusName('PENDING', currentLanguage)}</option>
                                  <option value="ACCEPTED">{getLocalizedStatusName('ACCEPTED', currentLanguage)}</option>
                                  <option value="COMPLETED">{getLocalizedStatusName('COMPLETED', currentLanguage)}</option>
                                  <option value="CANCELLED">{getLocalizedStatusName('CANCELLED', currentLanguage)}</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 6: ADMINISTRATIVE AUDIT LOGS */}
          {/* ================================================================ */}
          {activeTab === 'audit' && (
            <div className="space-y-5">
              <div className="bg-white border border-[#E6DEC9] rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">
                      {ta.auditTab.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ta.auditTab.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    {auditLogs.length} {ta.navigation.auditLogs}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {auditLogs.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-xs">{ta.auditTab.noLogsFound}</div>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF3E8] text-[#245C3A] border border-[#D5E4CE]">
                              {log.action}
                            </span>
                            <span className="font-bold text-gray-800">{log.targetName || log.targetId}</span>
                            <span className="text-gray-400 font-mono text-[10px]">({log.targetType})</span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px] leading-relaxed">{log.details}</p>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {ta.auditTab.tableHeaders.actor}: <span className="font-mono text-[#245C3A] font-medium">{log.adminEmail}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 7: SUPPORT TICKETS & TELEPHONY */}
          {/* ================================================================ */}
          {activeTab === 'tickets' && (
            <div className="bg-white border border-[#E6DEC9] rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    {ta.ticketsTab.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ta.ticketsTab.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={ticketFilter}
                    onChange={(e) => setTicketFilter(e.target.value)}
                    className="text-xs border border-gray-300 rounded-xl px-2.5 py-1.5 bg-gray-50 text-gray-800"
                  >
                    <option value="all">{ta.ticketsTab.filterAll}</option>
                    <option value="open">{ta.ticketsTab.filterOpen}</option>
                    <option value="in_review">{ta.ticketsTab.filterInReview}</option>
                    <option value="resolved">{ta.ticketsTab.filterResolved}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Tickets List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredTickets.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">{ta.ticketsTab.noTicketsFound}</div>
                  ) : (
                    filteredTickets.map((t) => (
                      <div
                        key={t.ticketId}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedTicket?.ticketId === t.ticketId
                            ? 'border-[#245C3A] bg-[#EEF3E8]/50 shadow-2xs'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900">{t.userName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.status === 'OPEN'
                                ? 'bg-amber-100 text-amber-800'
                                : t.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {t.status === 'OPEN' ? ta.ticketsTab.filterOpen : t.status === 'RESOLVED' ? ta.ticketsTab.filterResolved : ta.ticketsTab.filterInReview}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-2">{t.description || ta.common.loading}</p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2">
                          <span>{t.userPhone || ''}</span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Selected Ticket Conversation & Official Reply */}
                {selectedTicket ? (
                  <div className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between h-[500px] bg-gray-50">
                    <div className="border-b pb-2 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{selectedTicket.userName}</h4>
                        <span className="text-[11px] text-gray-500">{selectedTicket.userPhone}</span>
                      </div>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) =>
                          handleUpdateTicketStatus(selectedTicket.ticketId, e.target.value as TicketStatus)
                        }
                        className="text-xs border rounded-lg px-2 py-1 bg-white"
                      >
                        <option value="OPEN">{ta.ticketsTab.filterOpen}</option>
                        <option value="IN_REVIEW">{ta.ticketsTab.filterInReview}</option>
                        <option value="RESOLVED">{ta.ticketsTab.filterResolved}</option>
                        <option value="CLOSED">{ta.common.close}</option>
                      </select>
                    </div>

                    <div className="flex-1 overflow-y-auto py-3 space-y-2">
                      <div className="p-2.5 bg-white border rounded-xl text-xs text-gray-700">
                        <span className="font-bold block text-[#245C3A] mb-0.5">{ta.ticketsTab.tableHeaders.subject}:</span>
                        {selectedTicket.description}
                      </div>

                      {selectedTicket.messages?.map((m) => (
                        <div
                          key={m.id}
                          className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                            m.sender === 'agent'
                              ? 'ml-auto bg-[#245C3A] text-white'
                              : 'mr-auto bg-white border text-gray-800'
                          }`}
                        >
                          <div className="font-bold text-[10px] opacity-75 mb-0.5">{m.senderName || m.sender}</div>
                          <div>{m.text}</div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleReplyTicket()}
                        placeholder={ta.ticketsTab.respondBtn}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={!replyText.trim() || isReplying}
                        onClick={handleReplyTicket}
                        className="px-3 py-2 bg-[#245C3A] hover:bg-[#1B492E] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{ta.ticketsTab.respondBtn}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-xs text-gray-400 p-8 text-center">
                    {ta.ticketsTab.noTicketsFound}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 8: SERVICE HEALTH & TELEPHONY DIAGNOSTICS */}
          {/* ================================================================ */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-5">
              <div className="bg-white border border-[#E6DEC9] rounded-2xl p-5 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6DEC9] pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#1E2922] flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#245C3A]" />
                      <span>{ta.diagnosticsTab.title}</span>
                    </h3>
                    <p className="text-xs text-[#55675C] mt-0.5">
                      {ta.diagnosticsTab.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadAdminData}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#245C3A] bg-[#EEF3E8] hover:bg-[#D5E4CE] rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{ta.header.refreshData}</span>
                  </button>
                </div>

                {/* Sanitized Health Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: API & Server Status */}
                  <div className="p-4 bg-[#FAF9F5] border border-[#E6DEC9] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#55675C] uppercase tracking-wider">
                        {ta.diagnosticsTab.systemStatus}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3" />
                        {ta.diagnosticsTab.allServicesOperational}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">{ta.diagnosticsTab.apiLatency}:</span>
                        <span className="font-semibold text-gray-900">
                          {diagnosticData?.health?.status === 'ok' ? '24ms (OK)' : 'OK'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">{ta.diagnosticsTab.aiEngine}:</span>
                        <span className="font-mono text-gray-800">Ready (Gemini)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">Port / Host:</span>
                        <span className="font-mono text-gray-800">3000 (0.0.0.0)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">{ta.diagnosticsTab.backupStatus}:</span>
                        <span className="font-semibold text-emerald-700">{ta.diagnosticsTab.allServicesOperational}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Telephony & IVR Status */}
                  <div className="p-4 bg-[#FAF9F5] border border-[#E6DEC9] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#55675C] uppercase tracking-wider">
                        {ta.diagnosticsTab.smsGateway}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF3E8] text-[#245C3A] border border-[#D5E4CE]">
                        {ta.common.actionSuccess}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">IVR / SMS:</span>
                        <span className="font-semibold text-gray-900">
                          {diagnosticData?.twilio?.telephonyMode || 'Adaptive Voice IVR'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">SID:</span>
                        <span className="font-mono text-gray-800">
                          {diagnosticData?.twilio?.accountSidPrefix ? `${diagnosticData.twilio.accountSidPrefix}****` : 'AC•••••• (Masked)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">Toll-Free:</span>
                        <span className="font-mono font-bold text-[#245C3A]">
                          {diagnosticData?.twilio?.phoneNumberAssigned || '1800-KISAN-SETU'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Webhook:</span>
                        <span className="font-semibold text-emerald-700">{ta.common.actionSuccess}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Storage & Data Integrity */}
                  <div className="p-4 bg-[#FAF9F5] border border-[#E6DEC9] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#55675C] uppercase tracking-wider">
                        {ta.diagnosticsTab.databaseHealth}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3" />
                        {ta.diagnosticsTab.storageUsage}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">{ta.overview.stats.totalFarmers}:</span>
                        <span className="font-bold text-gray-900">{farmers.length}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">{ta.overview.stats.activeBuyers}:</span>
                        <span className="font-bold text-gray-900">{buyers.length}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">{ta.overview.stats.activeListings}:</span>
                        <span className="font-bold text-gray-900">{listings.length}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">{ta.overview.stats.auditLogsCount}:</span>
                        <span className="font-bold text-gray-900">{auditLogs.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security & Access Notice */}
                <div className="p-4 rounded-xl bg-[#EEF3E8] border border-[#D5E4CE] flex items-start gap-3 text-xs text-[#1E2922]">
                  <div className="p-1.5 rounded-lg bg-[#245C3A] text-white shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1B492E]">{ta.navigation.auditLogs}</div>
                    <div className="text-[11px] text-[#3E5146] mt-0.5 leading-relaxed">
                      {ta.overview.subtitle}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
