import { LanguageCode } from '../types';

export interface AdminTranslationsDict {
  header: {
    title: string;
    badge: string;
    subtitle: string;
    refreshData: string;
    signOut: string;
  };
  navigation: {
    modulesHeading: string;
    overview: string;
    farmers: string;
    buyers: string;
    marketplace: string;
    orders: string;
    tickets: string;
    auditLogs: string;
    diagnostics: string;
  };
  overview: {
    title: string;
    subtitle: string;
    stats: {
      totalFarmers: string;
      verifiedFarmers: string;
      activeBuyers: string;
      activeListings: string;
      totalOrders: string;
      openTickets: string;
      systemHealth: string;
      auditLogsCount: string;
    };
    quickActionsTitle: string;
    recentActivityTitle: string;
    recentActivitySub: string;
    noRecentActivity: string;
  };
  farmersTab: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    filterVerified: string;
    filterPending: string;
    filterSuspended: string;
    tableHeaders: {
      farmer: string;
      contact: string;
      location: string;
      land: string;
      kyc: string;
      status: string;
      actions: string;
    };
    verifyBtn: string;
    suspendBtn: string;
    reactivateBtn: string;
    viewDetailsBtn: string;
    noFarmersFound: string;
    kycVerified: string;
    kycPending: string;
    statusActive: string;
    statusSuspended: string;
  };
  buyersTab: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    filterActive: string;
    filterSuspended: string;
    tableHeaders: {
      buyer: string;
      business: string;
      contact: string;
      location: string;
      type: string;
      status: string;
      actions: string;
    };
    suspendBtn: string;
    reactivateBtn: string;
    viewProfileBtn: string;
    noBuyersFound: string;
    statusActive: string;
    statusSuspended: string;
  };
  marketplaceTab: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterCropAll: string;
    filterStatusAll: string;
    statusAvailable: string;
    statusSold: string;
    statusDisabled: string;
    tableHeaders: {
      id: string;
      crop: string;
      farmer: string;
      quantity: string;
      expectedRate: string;
      mandiRate: string;
      grade: string;
      status: string;
      actions: string;
    };
    setAvailable: string;
    setSold: string;
    setDisabled: string;
    deleteListing: string;
    noListingsFound: string;
  };
  ordersTab: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    tableHeaders: {
      orderNo: string;
      buyer: string;
      farmer: string;
      crop: string;
      quantity: string;
      totalAmount: string;
      status: string;
      date: string;
      actions: string;
    };
    viewDetails: string;
    noOrdersFound: string;
  };
  ticketsTab: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterOpen: string;
    filterInReview: string;
    filterEscalated: string;
    filterResolved: string;
    tableHeaders: {
      ticketId: string;
      subject: string;
      user: string;
      category: string;
      priority: string;
      status: string;
      date: string;
      actions: string;
    };
    resolveBtn: string;
    escalateBtn: string;
    respondBtn: string;
    noTicketsFound: string;
  };
  auditTab: {
    title: string;
    subtitle: string;
    tableHeaders: {
      timestamp: string;
      actor: string;
      role: string;
      action: string;
      details: string;
    };
    noLogsFound: string;
  };
  diagnosticsTab: {
    title: string;
    subtitle: string;
    systemStatus: string;
    allServicesOperational: string;
    apiLatency: string;
    databaseHealth: string;
    smsGateway: string;
    aiEngine: string;
    storageUsage: string;
    backupStatus: string;
  };
  common: {
    loading: string;
    refreshSuccess: string;
    actionSuccess: string;
    actionError: string;
    confirmAction: string;
    close: string;
    save: string;
    cancel: string;
    filter: string;
    search: string;
    showing: string;
    records: string;
    rupeeSymbol: string;
  };
}

// 1. HINDI (हिन्दी)
const hi: AdminTranslationsDict = {
  header: {
    title: 'किसान साथी प्रशासनिक नियंत्रण कक्ष',
    badge: 'पूर्ण नियंत्रण',
    subtitle: 'प्रशासनिक नियंत्रण कक्ष · किसान व खरीदार दोनों पोर्टल्स की निगरानी और संचालन',
    refreshData: 'डेटा रीफ्रेश',
    signOut: 'लॉगआउट',
  },
  navigation: {
    modulesHeading: 'कंट्रोल मॉड्यूल',
    overview: 'कंट्रोल ओवरव्यू',
    farmers: 'किसान व सत्यापन',
    buyers: 'खरीदार व व्यापारी',
    marketplace: 'फसल लिस्टिंग नियंत्रण',
    orders: 'ऑर्डर व लेनदेन',
    tickets: 'सपोर्ट टिकट्स',
    auditLogs: 'ऑडिट व सुरक्षा लॉग',
    diagnostics: 'सिस्टम स्थिति व जांच',
  },
  overview: {
    title: 'प्लेटफॉर्म अवलोकन',
    subtitle: 'किसान साथी मंच की वर्तमान स्थिति, सक्रिय उपयोगकर्ता और परिचालन मेट्रिक्स',
    stats: {
      totalFarmers: 'कुल पंजीकृत किसान',
      verifiedFarmers: 'सत्यापित किसान',
      activeBuyers: 'सक्रिय खरीदार / व्यापारी',
      activeListings: 'सक्रिय फसल लिस्टिंग',
      totalOrders: 'कुल पूर्ण ऑर्डर',
      openTickets: 'खुले सपोर्ट टिकट',
      systemHealth: 'सिस्टम स्थिति',
      auditLogsCount: 'कुल ऑडिट लॉग',
    },
    quickActionsTitle: 'त्वरित प्रशासनिक कार्य',
    recentActivityTitle: 'हालिया प्लेटफॉर्म गतिविधियां',
    recentActivitySub: 'किसानों, खरीदारों और सौदों के नवीनतम रीयल-टाइम अपडेट',
    noRecentActivity: 'फिलहाल कोई हालिया गतिविधि दर्ज नहीं है।',
  },
  farmersTab: {
    title: 'किसान प्रबंधन व सत्यापन',
    subtitle: 'पंजीकृत किसानों की सूची, आधार सत्यापन स्थिति और खाता नियंत्रण',
    searchPlaceholder: 'नाम, मोबाइल, ज़िला या किसान आईडी खोजें...',
    filterAll: 'सभी किसान',
    filterVerified: 'केवल सत्यापित',
    filterPending: 'लंबित सत्यापन',
    filterSuspended: 'निलंबित खाते',
    tableHeaders: {
      farmer: 'किसान का नाम',
      contact: 'संपर्क विवरण',
      location: 'स्थान / ज़िला',
      land: 'कृषि भूमि',
      kyc: 'ई-केवाईसी स्थिति',
      status: 'खाता स्थिति',
      actions: 'कार्रवाई',
    },
    verifyBtn: 'सत्यापित करें',
    suspendBtn: 'निलंबित करें',
    reactivateBtn: 'सक्रिय करें',
    viewDetailsBtn: 'विवरण देखें',
    noFarmersFound: 'कोई किसान खाता नहीं मिला।',
    kycVerified: 'सत्यापित',
    kycPending: 'लंबित',
    statusActive: 'सक्रिय',
    statusSuspended: 'निलंबित',
  },
  buyersTab: {
    title: 'खरीदार व व्यापारी प्रबंधन',
    subtitle: 'पंजीकृत व्यापारियों, थोक खरीदारों और मिलों की सूची व स्थिति',
    searchPlaceholder: 'व्यापारी का नाम, व्यवसाय, मोबाइल या आईडी खोजें...',
    filterAll: 'सभी खरीदार',
    filterActive: 'सक्रिय खरीदार',
    filterSuspended: 'निलंबित खरीदार',
    tableHeaders: {
      buyer: 'खरीदार / कंपनी',
      business: 'व्यवसाय का प्रकार',
      contact: 'मोबाइल नंबर',
      location: 'मंडी / पता',
      type: 'श्रेणी',
      status: 'स्थिति',
      actions: 'कार्रवाई',
    },
    suspendBtn: 'निलंबित करें',
    reactivateBtn: 'सक्रिय करें',
    viewProfileBtn: 'प्रोफ़ाइल देखें',
    noBuyersFound: 'कोई खरीदार खाता नहीं मिला।',
    statusActive: 'सक्रिय',
    statusSuspended: 'निलंबित',
  },
  marketplaceTab: {
    title: 'फसल लिस्टिंग नियंत्रण',
    subtitle: 'मार्केटप्लेस में उपलब्ध सभी फसलों की निगरानी, मूल्य व स्थिति प्रबंधन',
    searchPlaceholder: 'फसल, किसान का नाम या लिस्टिंग आईडी खोजें...',
    filterCropAll: 'सभी फसलें',
    filterStatusAll: 'सभी स्थितियां',
    statusAvailable: 'बिक्री हेतु उपलब्ध',
    statusSold: 'बिक चुकी',
    statusDisabled: 'निष्क्रिय',
    tableHeaders: {
      id: 'लिस्टिंग आईडी',
      crop: 'फसल व किस्म',
      farmer: 'किसान',
      quantity: 'मात्रा',
      expectedRate: 'किसान का भाव',
      mandiRate: 'मंडी भाव',
      grade: 'ग्रेड',
      status: 'स्थिति',
      actions: 'कार्रवाई',
    },
    setAvailable: 'उपलब्ध करें',
    setSold: 'बिकी मार्क करें',
    setDisabled: 'निष्क्रिय करें',
    deleteListing: 'स्थायी हटाएं',
    noListingsFound: 'कोई फसल लिस्टिंग नहीं मिली।',
  },
  ordersTab: {
    title: 'ऑर्डर व लेनदेन निगरानी',
    subtitle: 'किसान एवं खरीदार के बीच के सभी ऑर्डर, वाहन स्थिति व भुगतान ट्रैक करें',
    searchPlaceholder: 'ऑर्डर संख्या, खरीदार या फसल खोजें...',
    filterAll: 'सभी ऑर्डर',
    tableHeaders: {
      orderNo: 'ऑर्डर सं.',
      buyer: 'खरीदार',
      farmer: 'किसान',
      crop: 'फसल',
      quantity: 'मात्रा',
      totalAmount: 'कुल राशि',
      status: 'स्थिति',
      date: 'दिनांक',
      actions: 'विवरण',
    },
    viewDetails: 'ऑर्डर विवरण',
    noOrdersFound: 'कोई ऑर्डर दर्ज नहीं है।',
  },
  ticketsTab: {
    title: 'सपोर्ट टिकट्स एवं समाधान',
    subtitle: 'किसानों और खरीदारों की समस्याएं, शिकायतें व एस्केलेशन प्रबंधन',
    filterAll: 'सभी टिकट्स',
    filterOpen: 'खुले',
    filterInReview: 'समीक्षा में',
    filterEscalated: 'एस्केलेटेड',
    filterResolved: 'समाधान हो चुका',
    tableHeaders: {
      ticketId: 'टिकट सं.',
      subject: 'विषय',
      user: 'उपयोगकर्ता',
      category: 'श्रेणी',
      priority: 'प्राथमिकता',
      status: 'स्थिति',
      date: 'समय',
      actions: 'कार्रवाई',
    },
    resolveBtn: 'समाधान मार्क करें',
    escalateBtn: 'एस्केलेट करें',
    respondBtn: 'जवाब दें',
    noTicketsFound: 'कोई टिकट नहीं मिला।',
  },
  auditTab: {
    title: 'सिस्टम ऑडिट व सुरक्षा लॉग्स',
    subtitle: 'प्रशासनिक परिवर्तनों, सुरक्षा घटनाओं और डेटाबेस कार्यों का स्थायी रिकॉर्ड',
    tableHeaders: {
      timestamp: 'समय',
      actor: 'कर्ता',
      role: 'भूमिका',
      action: 'कार्रवाई',
      details: 'विवरण',
    },
    noLogsFound: 'कोई ऑडिट लॉग उपलब्ध नहीं है।',
  },
  diagnosticsTab: {
    title: 'सिस्टम डायग्नोस्टिक्स व स्वास्थ्य',
    subtitle: 'सर्वर रिस्पांस, डेटाबेस लेटेंसी और बाहरी एपीआई स्थिति',
    systemStatus: 'सिस्टम स्वास्थ्य स्थिति',
    allServicesOperational: 'सभी सेवाएं सामान्य रूप से कार्यरत हैं',
    apiLatency: 'एपीआई लेटेंसी',
    databaseHealth: 'डेटाबेस स्थिति',
    smsGateway: 'एसएमएस गेटवे',
    aiEngine: 'एआई विश्लेषण इंजन',
    storageUsage: 'स्टोरेज उपयोग',
    backupStatus: 'बैकअप स्थिति',
  },
  common: {
    loading: 'डेटा लोड हो रहा है...',
    refreshSuccess: 'डेटा सफलतापूर्वक रीफ्रेश किया गया।',
    actionSuccess: 'कार्रवाई सफल रही।',
    actionError: 'कार्रवाई में त्रुटि हुई।',
    confirmAction: 'क्या आप इस कार्रवाई को पूरा करना चाहते हैं?',
    close: 'बंद करें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    filter: 'फ़िल्टर',
    search: 'खोजें',
    showing: 'दिखा रहे हैं',
    records: 'रिकॉर्ड',
    rupeeSymbol: '₹',
  },
};

// 2. ENGLISH
const en: AdminTranslationsDict = {
  header: {
    title: 'Kisan Saathi Admin Control Center',
    badge: 'Full Oversight',
    subtitle: 'Administrative Control Center · Complete Oversight of Farmer & Buyer Portals',
    refreshData: 'Refresh Data',
    signOut: 'Sign Out',
  },
  navigation: {
    modulesHeading: 'Control Modules',
    overview: 'Overview',
    farmers: 'Farmers & Verification',
    buyers: 'Buyers & Traders',
    marketplace: 'Marketplace Listings',
    orders: 'Orders & Settlements',
    tickets: 'Support Tickets',
    auditLogs: 'Audit & Security Logs',
    diagnostics: 'System Diagnostics',
  },
  overview: {
    title: 'Platform Overview',
    subtitle: 'Current operational metrics, active user activity, and platform health',
    stats: {
      totalFarmers: 'Total Farmers',
      verifiedFarmers: 'Verified Farmers',
      activeBuyers: 'Active Buyers / Traders',
      activeListings: 'Active Crop Listings',
      totalOrders: 'Total Orders',
      openTickets: 'Open Support Tickets',
      systemHealth: 'System Health',
      auditLogsCount: 'Total Audit Logs',
    },
    quickActionsTitle: 'Quick Administrative Actions',
    recentActivityTitle: 'Recent Platform Activity',
    recentActivitySub: 'Live updates from farmers, buyers, and order settlements',
    noRecentActivity: 'No recent activity recorded.',
  },
  farmersTab: {
    title: 'Farmer Management & Verification',
    subtitle: 'List of registered farmers, verification status, and account controls',
    searchPlaceholder: 'Search by name, phone, district, or Farmer ID...',
    filterAll: 'All Farmers',
    filterVerified: 'Verified Only',
    filterPending: 'Pending Verification',
    filterSuspended: 'Suspended Accounts',
    tableHeaders: {
      farmer: 'Farmer Name',
      contact: 'Contact Info',
      location: 'District / State',
      land: 'Cultivated Land',
      kyc: 'e-KYC Status',
      status: 'Account Status',
      actions: 'Actions',
    },
    verifyBtn: 'Verify Account',
    suspendBtn: 'Suspend',
    reactivateBtn: 'Reactivate',
    viewDetailsBtn: 'View Details',
    noFarmersFound: 'No farmer accounts found.',
    kycVerified: 'Verified',
    kycPending: 'Pending',
    statusActive: 'Active',
    statusSuspended: 'Suspended',
  },
  buyersTab: {
    title: 'Buyer & Trader Management',
    subtitle: 'Manage verified institutional buyers, food processors, and mandi traders',
    searchPlaceholder: 'Search buyer name, company, phone, or Buyer ID...',
    filterAll: 'All Buyers',
    filterActive: 'Active Only',
    filterSuspended: 'Suspended',
    tableHeaders: {
      buyer: 'Buyer / Company',
      business: 'Business Type',
      contact: 'Phone Number',
      location: 'Mandi / Location',
      type: 'Category',
      status: 'Status',
      actions: 'Actions',
    },
    suspendBtn: 'Suspend Account',
    reactivateBtn: 'Reactivate',
    viewProfileBtn: 'View Profile',
    noBuyersFound: 'No buyer accounts found.',
    statusActive: 'Active',
    statusSuspended: 'Suspended',
  },
  marketplaceTab: {
    title: 'Marketplace Listing Oversight',
    subtitle: 'Manage agricultural harvest listings, quality grades, pricing, and availability',
    searchPlaceholder: 'Search crop, variety, farmer name, or listing ID...',
    filterCropAll: 'All Crops',
    filterStatusAll: 'All Statuses',
    statusAvailable: 'Available for Sale',
    statusSold: 'Sold Out',
    statusDisabled: 'Disabled',
    tableHeaders: {
      id: 'Listing ID',
      crop: 'Crop & Variety',
      farmer: 'Farmer',
      quantity: 'Quantity',
      expectedRate: 'Farmer Price',
      mandiRate: 'Mandi Price',
      grade: 'Grade',
      status: 'Status',
      actions: 'Actions',
    },
    setAvailable: 'Set Available',
    setSold: 'Mark Sold',
    setDisabled: 'Disable',
    deleteListing: 'Delete Permanently',
    noListingsFound: 'No crop listings found matching your search.',
  },
  ordersTab: {
    title: 'Orders & Settlements Oversight',
    subtitle: 'Track order progression, logistics pickup, escrow payments, and bank payouts',
    searchPlaceholder: 'Search by Order Number, Buyer, Farmer, or Crop...',
    filterAll: 'All Orders',
    tableHeaders: {
      orderNo: 'Order No.',
      buyer: 'Buyer',
      farmer: 'Farmer',
      crop: 'Crop',
      quantity: 'Quantity',
      totalAmount: 'Total Amount',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
    },
    viewDetails: 'View Order Details',
    noOrdersFound: 'No orders recorded yet.',
  },
  ticketsTab: {
    title: 'Support Tickets & Resolution Desk',
    subtitle: 'Manage user inquiries, technical issues, and senior desk escalations',
    filterAll: 'All Tickets',
    filterOpen: 'Open',
    filterInReview: 'In Review',
    filterEscalated: 'Escalated',
    filterResolved: 'Resolved',
    tableHeaders: {
      ticketId: 'Ticket ID',
      subject: 'Subject',
      user: 'User',
      category: 'Category',
      priority: 'Priority',
      status: 'Status',
      date: 'Logged At',
      actions: 'Actions',
    },
    resolveBtn: 'Mark Resolved',
    escalateBtn: 'Escalate to Desk',
    respondBtn: 'Send Reply',
    noTicketsFound: 'No support tickets found.',
  },
  auditTab: {
    title: 'Audit & Security Event Logs',
    subtitle: 'Immutable log of administrative operations, policy changes, and access events',
    tableHeaders: {
      timestamp: 'Timestamp',
      actor: 'Actor',
      role: 'Role',
      action: 'Operation',
      details: 'Details',
    },
    noLogsFound: 'No audit records found.',
  },
  diagnosticsTab: {
    title: 'System Diagnostics & Health',
    subtitle: 'Operational health checks, external API gateways, and response latencies',
    systemStatus: 'System Status',
    allServicesOperational: 'All services operating normally',
    apiLatency: 'API Latency',
    databaseHealth: 'Database Health',
    smsGateway: 'SMS Gateway',
    aiEngine: 'AI Engine',
    storageUsage: 'Storage Capacity',
    backupStatus: 'Automated Backup',
  },
  common: {
    loading: 'Loading system data...',
    refreshSuccess: 'All data refreshed successfully.',
    actionSuccess: 'Action completed successfully.',
    actionError: 'Failed to complete action.',
    confirmAction: 'Are you sure you want to proceed with this action?',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    filter: 'Filter',
    search: 'Search',
    showing: 'Showing',
    records: 'records',
    rupeeSymbol: '₹',
  },
};

// 3. PUNJABI (ਪੰਜਾਬੀ)
const pa: AdminTranslationsDict = {
  header: {
    title: 'ਕਿਸਾਨ ਸਾਥੀ ਪ੍ਰਬੰਧਕੀ ਕੰਟਰੋਲ ਕੇਂਦਰ',
    badge: 'ਪੂਰਾ ਕੰਟਰੋਲ',
    subtitle: 'ਪ੍ਰਬੰਧਕੀ ਨਿਗਰਾਨੀ · ਕਿਸਾਨ ਅਤੇ ਖਰੀਦਦਾਰ ਪੋਰਟਲ ਦੋਵਾਂ ਦਾ ਸੰਚਾਲਨ',
    refreshData: 'ਡਾਟਾ ਰੀਫ੍ਰੈਸ਼ ਕਰੋ',
    signOut: 'ਲਾਗ ਆਊਟ',
  },
  navigation: {
    modulesHeading: 'ਕੰਟਰੋਲ ਮੋਡੀਊਲ',
    overview: 'ਕੰਟਰੋਲ ਸੰਖੇਪ',
    farmers: 'ਕਿਸਾਨ ਤੇ ਤਸਦੀਕ',
    buyers: 'ਖਰੀਦਦਾਰ ਤੇ ਵਪਾਰੀ',
    marketplace: 'ਫਸਲ ਸੂਚੀ ਕੰਟਰੋਲ',
    orders: 'ਆਰਡਰ ਤੇ ਭੁਗਤਾਨ',
    tickets: 'ਸਹਾਇਤਾ ਟਿਕਟਾਂ',
    auditLogs: 'ਸੁਰੱਖਿਆ ਤੇ ਆਡਿਟ ਲਾਗ',
    diagnostics: 'ਸਿਸਟਮ ਸਥਿਤੀ ਤੇ ਜਾਂਚ',
  },
  overview: {
    title: 'ਪਲੇਟਫਾਰਮ ਸੰਖੇਪ',
    subtitle: 'ਕਿਸਾਨ ਸਾਥੀ ਪਲੇਟਫਾਰਮ ਦੀ ਮੌਜੂਦਾ ਸਥਿਤੀ, ਸਰਗਰਮ ਉਪਭੋਗਤਾ ਤੇ ਮੈਟ੍ਰਿਕਸ',
    stats: {
      totalFarmers: 'ਕੁੱਲ ਰਜਿਸਟਰਡ ਕਿਸਾਨ',
      verifiedFarmers: 'ਤਸਦੀਕਸ਼ੁਦਾ ਕਿਸਾਨ',
      activeBuyers: 'ਸਰਗਰਮ ਖਰੀਦਦਾਰ',
      activeListings: 'ਸਰਗਰਮ ਫਸਲ ਸੂਚੀਆਂ',
      totalOrders: 'ਕੁੱਲ ਆਰਡਰ',
      openTickets: 'ਖੁੱਲ੍ਹੀਆਂ ਸਹਾਇਤਾ ਟਿਕਟਾਂ',
      systemHealth: 'ਸਿਸਟਮ ਸਥਿਤੀ',
      auditLogsCount: 'ਕੁੱਲ ਆਡਿਟ ਲਾਗ',
    },
    quickActionsTitle: 'ਜ਼ਰੂਰੀ ਪ੍ਰਬੰਧਕੀ ਕਾਰਵਾਈਆਂ',
    recentActivityTitle: 'ਹਾਲੀਆ ਪਲੇਟਫਾਰਮ ਗਤੀਵਿਧੀ',
    recentActivitySub: 'ਕਿਸਾਨਾਂ, ਖਰੀਦਦਾਰਾਂ ਤੇ ਆਰਡਰਾਂ ਦੇ ਤਾਜ਼ਾ ਅੱਪਡੇਟ',
    noRecentActivity: 'ਕੋਈ ਹਾਲੀਆ ਗਤੀਵਿਧੀ ਦਰਜ ਨਹੀਂ ਹੈ।',
  },
  farmersTab: {
    title: 'ਕਿਸਾਨ ਪ੍ਰਬੰਧਨ ਤੇ ਤਸਦੀਕ',
    subtitle: 'ਕਿਸਾਨਾਂ ਦੀ ਸੂਚੀ, ਆਧਾਰ ਤਸਦੀਕ ਅਤੇ ਖਾਤਾ ਕੰਟਰੋਲ',
    searchPlaceholder: 'ਨਾਮ, ਮੋਬਾਈਲ, ਜ਼ਿਲ੍ਹਾ ਜਾਂ ਕਿਸਾਨ ਆਈਡੀ ਖੋਜੋ...',
    filterAll: 'ਸਾਰੇ ਕਿਸਾਨ',
    filterVerified: 'ਸਿਰਫ਼ ਤਸਦੀਕਸ਼ੁਦਾ',
    filterPending: 'ਬਾਕੀ ਤਸਦੀਕ',
    filterSuspended: 'ਮੁਅੱਤਲ ਖਾਤੇ',
    tableHeaders: {
      farmer: 'ਕਿਸਾਨ ਦਾ ਨਾਮ',
      contact: 'ਸੰਪਰਕ ਵੇਰਵਾ',
      location: 'ਜ਼ਿਲ੍ਹਾ / ਸੂਬਾ',
      land: 'ਖੇਤੀਬਾੜੀ ਜ਼ਮੀਨ',
      kyc: 'ਈ-ਕੇਵਾਈਸੀ ਸਥਿਤੀ',
      status: 'ਖਾਤਾ ਸਥਿਤੀ',
      actions: 'ਕਾਰਵਾਈ',
    },
    verifyBtn: 'ਤਸਦੀਕ ਕਰੋ',
    suspendBtn: 'ਮੁਅੱਤਲ ਕਰੋ',
    reactivateBtn: 'ਮੁੜ ਸਰਗਰਮ ਕਰੋ',
    viewDetailsBtn: 'ਵੇਰਵਾ ਦੇਖੋ',
    noFarmersFound: 'ਕੋਈ ਕਿਸਾਨ ਖਾਤਾ ਨਹੀਂ ਮਿਲਿਆ।',
    kycVerified: 'ਤਸਦੀਕਸ਼ੁਦਾ',
    kycPending: 'ਬਾਕੀ',
    statusActive: 'ਸਰਗਰਮ',
    statusSuspended: 'ਮੁਅੱਤਲ',
  },
  buyersTab: {
    title: 'ਖਰੀਦਦਾਰ ਤੇ ਵਪਾਰੀ ਪ੍ਰਬੰਧਨ',
    subtitle: 'ਸੰਸਥਾਗਤ ਖਰੀਦਦਾਰਾਂ, ਮਿੱਲਾਂ ਤੇ ਵੱਡੇ ਵਪਾਰੀਆਂ ਦਾ ਪ੍ਰਬੰਧਨ',
    searchPlaceholder: 'ਖਰੀਦਦਾਰ ਦਾ ਨਾਮ, ਕੰਪਨੀ, ਫ਼ੋਨ ਜਾਂ ਆਈਡੀ ਖੋਜੋ...',
    filterAll: 'ਸਾਰੇ ਖਰੀਦਦਾਰ',
    filterActive: 'ਸਰਗਰਮ ਖਰੀਦਦਾਰ',
    filterSuspended: 'ਮੁਅੱਤਲ ਖਰੀਦਦਾਰ',
    tableHeaders: {
      buyer: 'ਖਰੀਦਦਾਰ / ਕੰਪਨੀ',
      business: 'ਵਪਾਰ ਦੀ ਕਿਸਮ',
      contact: 'ਫ਼ੋਨ ਨੰਬਰ',
      location: 'ਮੰਡੀ / ਸਥਾਨ',
      type: 'ਸ਼੍ਰੇਣੀ',
      status: 'ਸਥਿਤੀ',
      actions: 'ਕਾਰਵਾਈ',
    },
    suspendBtn: 'ਮੁਅੱਤਲ ਕਰੋ',
    reactivateBtn: 'ਮੁੜ ਸਰਗਰਮ ਕਰੋ',
    viewProfileBtn: 'ਪ੍ਰੋਫਾਈਲ ਦੇਖੋ',
    noBuyersFound: 'ਕੋਈ ਖਰੀਦਦਾਰ ਖਾਤਾ ਨਹੀਂ ਮਿਲਿਆ।',
    statusActive: 'ਸਰਗਰਮ',
    statusSuspended: 'ਮੁਅੱਤਲ',
  },
  marketplaceTab: {
    title: 'ਮਾਰਕਿਟਪਲੇਸ ਫਸਲ ਕੰਟਰੋਲ',
    subtitle: 'ਫਸਲਾਂ ਦੀਆਂ ਸੂਚੀਆਂ, ਗੁਣਵੱਤਾ ਗ੍ਰੇਡ, ਭਾਅ ਅਤੇ ਉਪਲਬਧਤਾ ਸੰਭਾਲੋ',
    searchPlaceholder: 'ਫਸਲ, ਕਿਸਮ, ਕਿਸਾਨ ਜਾਂ ਸੂਚੀ ਆਈਡੀ ਖੋਜੋ...',
    filterCropAll: 'ਸਾਰੀਆਂ ਫਸਲਾਂ',
    filterStatusAll: 'ਸਾਰੀਆਂ ਸਥਿਤੀਆਂ',
    statusAvailable: 'ਵਿਕਰੀ ਲਈ ਉਪਲਬਧ',
    statusSold: 'ਵਿਕ ਗਈ',
    statusDisabled: 'ਅਯੋਗ',
    tableHeaders: {
      id: 'ਸੂਚੀ ਆਈਡੀ',
      crop: 'ਫਸਲ ਤੇ ਕਿਸਮ',
      farmer: 'ਕਿਸਾਨ',
      quantity: 'ਮਾਤਰਾ',
      expectedRate: 'ਕਿਸਾਨ ਭਾਅ',
      mandiRate: 'ਮੰਡੀ ਭਾਅ',
      grade: 'ਗ੍ਰੇਡ',
      status: 'ਸਥਿਤੀ',
      actions: 'ਕਾਰਵਾਈ',
    },
    setAvailable: 'ਉਪਲਬਧ ਕਰੋ',
    setSold: 'ਵਿਕ ਗਈ ਦਰਜ ਕਰੋ',
    setDisabled: 'ਅਯੋਗ ਕਰੋ',
    deleteListing: 'ਪੱਕੇ ਤੌਰ ਤੇ ਹਟਾਓ',
    noListingsFound: 'ਕੋਈ ਫਸਲ ਸੂਚੀ ਨਹੀਂ ਮਿਲੀ।',
  },
  ordersTab: {
    title: 'ਆਰਡਰ ਤੇ ਭੁਗਤਾਨ ਨਿਗਰਾਨੀ',
    subtitle: 'ਆਰਡਰਾਂ ਦੀ ਪ੍ਰਗਤੀ, ਗੱਡੀ ਦੀ ਟਰੈਕਿੰਗ ਤੇ ਐਸਕਰੋ ਭੁਗਤਾਨ ਦੇਖੋ',
    searchPlaceholder: 'ਆਰਡਰ ਨੰਬਰ, ਖਰੀਦਦਾਰ ਜਾਂ ਫਸਲ ਖੋਜੋ...',
    filterAll: 'ਸਾਰੇ ਆਰਡਰ',
    tableHeaders: {
      orderNo: 'ਆਰਡਰ ਨੰ.',
      buyer: 'ਖਰੀਦਦਾਰ',
      farmer: 'ਕਿਸਾਨ',
      crop: 'ਫਸਲ',
      quantity: 'ਮਾਤਰਾ',
      totalAmount: 'ਕੁੱਲ ਰਕਮ',
      status: 'ਸਥਿਤੀ',
      date: 'ਮਿਤੀ',
      actions: 'ਵੇਰਵਾ',
    },
    viewDetails: 'ਵੇਰਵਾ ਦੇਖੋ',
    noOrdersFound: 'ਕੋਈ ਆਰਡਰ ਦਰਜ ਨਹੀਂ ਹੈ।',
  },
  ticketsTab: {
    title: 'ਸਹਾਇਤਾ ਟਿਕਟਾਂ ਤੇ ਹੱਲ',
    subtitle: 'ਉਪਭੋਗਤਾਵਾਂ ਦੀਆਂ ਸ਼ਿਕਾਇਤਾਂ ਤੇ ਸਮੱਸਿਆਵਾਂ ਦਾ ਪ੍ਰਬੰਧਨ',
    filterAll: 'ਸਾਰੀਆਂ ਟਿਕਟਾਂ',
    filterOpen: 'ਖੁੱਲ੍ਹੀਆਂ',
    filterInReview: 'ਜਾਂਚ ਅਧੀਨ',
    filterEscalated: 'ਐਸਕੇਲੇਟਿਡ',
    filterResolved: 'ਹੱਲ ਹੋ ਚੁੱਕੀਆਂ',
    tableHeaders: {
      ticketId: 'ਟਿਕਟ ਨੰ.',
      subject: 'ਵਿਸ਼ਾ',
      user: 'ਉਪਭੋਗਤਾ',
      category: 'ਸ਼੍ਰੇਣੀ',
      priority: 'ਤਰਜੀਹ',
      status: 'ਸਥਿਤੀ',
      date: 'ਸਮਾਂ',
      actions: 'ਕਾਰਵਾਈ',
    },
    resolveBtn: 'ਹੱਲ ਮਾਰਕ ਕਰੋ',
    escalateBtn: 'ਐਸਕੇਲੇਟ ਕਰੋ',
    respondBtn: 'ਜਵਾਬ ਭੇਜੋ',
    noTicketsFound: 'ਕੋਈ ਟਿਕਟ ਨਹੀਂ ਮਿਲੀ।',
  },
  auditTab: {
    title: 'ਸਿਸਟਮ ਆਡਿਟ ਤੇ ਸੁਰੱਖਿਆ ਲਾਗ',
    subtitle: 'ਪ੍ਰਬੰਧਕੀ ਕਾਰਵਾਈਆਂ ਅਤੇ ਡਾਟਾਬੇਸ ਤਬਦੀਲੀਆਂ ਦਾ ਪੱਕਾ ਰਿਕਾਰਡ',
    tableHeaders: {
      timestamp: 'ਸਮਾਂ',
      actor: 'ਕਰਤਾ',
      role: 'ਭੂਮਿਕਾ',
      action: 'ਕਾਰਵਾਈ',
      details: 'ਵੇਰਵਾ',
    },
    noLogsFound: 'ਕੋਈ ਆਡਿਟ ਲਾਗ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
  },
  diagnosticsTab: {
    title: 'ਸਿਸਟਮ ਜਾਂਚ ਤੇ ਸਿਹਤ',
    subtitle: 'ਸਰਵਰ ਸਥਿਤੀ, ਡਾਟਾਬੇਸ ਅਤੇ ਏਪੀਆਈ ਕਨੈਕਸ਼ਨ ਜਾਂਚ',
    systemStatus: 'ਸਿਸਟਮ ਸਿਹਤ ਸਥਿਤੀ',
    allServicesOperational: 'ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ ਸੁਚਾਰੂ ਢੰਗ ਨਾਲ ਚੱਲ ਰਹੀਆਂ ਹਨ',
    apiLatency: 'ਏਪੀਆਈ ਲੇਟੈਂਸੀ',
    databaseHealth: 'ਡਾਟਾਬੇਸ ਸਥਿਤੀ',
    smsGateway: 'ਐਸਐਮਐਸ ਗੇਟਵੇ',
    aiEngine: 'ਏਆਈ ਇੰਜਣ',
    storageUsage: 'ਸਟੋਰੇਜ ਸਮਰੱਥਾ',
    backupStatus: 'ਬੈਕਅੱਪ ਸਥਿਤੀ',
  },
  common: {
    loading: 'ਡਾਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    refreshSuccess: 'ਸਾਰਾ ਡਾਟਾ ਸਫਲਤਾਪੂਰਵਕ ਰੀਫ੍ਰੈਸ਼ ਹੋ ਗਿਆ।',
    actionSuccess: 'ਕਾਰਵਾਈ ਸਫਲ ਰਹੀ।',
    actionError: 'ਕਾਰਵਾਈ ਅਸਫਲ ਰਹੀ।',
    confirmAction: 'ਕੀ ਤੁਸੀਂ ਇਹ ਕਾਰਵਾਈ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
    close: 'ਬੰਦ ਕਰੋ',
    save: 'ਸਾਂਭੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    filter: 'ਫਿਲਟਰ',
    search: 'ਖੋਜੋ',
    showing: 'ਦਿਖਾ ਰਹੇ ਹਾਂ',
    records: 'ਰਿਕਾਰਡ',
    rupeeSymbol: '₹',
  },
};

// 4. HARYANVI (हरियाणवी)
const hr: AdminTranslationsDict = {
  header: {
    title: 'किसान साथी प्रशासनिक कंट्रोल सेंटर',
    badge: 'पूरा कंट्रोल',
    subtitle: 'प्रशासनिक कंट्रोल सेंटर · किसान अर खरीदार दोन्नों पोर्टलां की निगरानी अर संचालन',
    refreshData: 'डेटा रीफ्रेश',
    signOut: 'लॉगआउट',
  },
  navigation: {
    modulesHeading: 'कंट्रोल मॉड्यूल',
    overview: 'कंट्रोल ओवरव्यू',
    farmers: 'किसान अर सत्यापन',
    buyers: 'खरीदार अर व्यापारी',
    marketplace: 'फसल लिस्टिंग कंट्रोल',
    orders: 'ऑर्डर अर लेनदेन',
    tickets: 'सपोर्ट टिकट्स',
    auditLogs: 'ऑडिट अर सुरक्षा लॉग',
    diagnostics: 'सिस्टम जांच अर हाल',
  },
  overview: {
    title: 'प्लेटफॉर्म का हाल',
    subtitle: 'किसान साथी मंच की ताज़ा स्थिति, चालते किसान-व्यापारी अर हिसाब-किताब',
    stats: {
      totalFarmers: 'सारे रजिस्टर्ड किसान',
      verifiedFarmers: 'जांचे होए किसान',
      activeBuyers: 'चालते खरीदार / व्यापारी',
      activeListings: 'बिक्री खातर फसलें',
      totalOrders: 'सारे पूरे ऑर्डर',
      openTickets: 'खुले सपोर्ट टिकट',
      systemHealth: 'सिस्टम का हाल',
      auditLogsCount: 'सारे ऑडिट लॉग',
    },
    quickActionsTitle: 'ज़रूरी प्रशासनिक काम',
    recentActivityTitle: 'ताज़ा प्लेटफॉर्म काम',
    recentActivitySub: 'किसानां, खरीदारां अर सौद्यां की ताज़ा जानकारी',
    noRecentActivity: 'इब कोई ताज़ा काम दर्ज कोन्या।',
  },
  farmersTab: {
    title: 'किसान संभाल अर जांच',
    subtitle: 'रजिस्टर्ड किसानां की लिस्ट, आधार जांच अर खाता कंट्रोल',
    searchPlaceholder: 'नाम, फोन, ज़िला या किसान आईडी ढूंढो...',
    filterAll: 'सारे किसान',
    filterVerified: 'सत्यापित किसान',
    filterPending: 'जांच बाकी',
    filterSuspended: 'रोके होए खाते',
    tableHeaders: {
      farmer: 'किसान का नाम',
      contact: 'फोन नंबर',
      location: 'ज़िला / गाम',
      land: 'खेती की ज़मीन',
      kyc: 'ई-केवाईसी स्थिति',
      status: 'खाते का हाल',
      actions: 'कार्रवाई',
    },
    verifyBtn: 'जांच पक्की करो',
    suspendBtn: 'खाता रोको',
    reactivateBtn: 'दोबारा चालू करो',
    viewDetailsBtn: 'पूरी बात देखो',
    noFarmersFound: 'कोई किसान खाता कोन्या मिल्या।',
    kycVerified: 'जांच पक्की',
    kycPending: 'बाकी',
    statusActive: 'चालू',
    statusSuspended: 'रोक राख्या',
  },
  buyersTab: {
    title: 'खरीदार अर व्यापारी संभाल',
    subtitle: 'व्यापारियां, थोक खरीदारां अर मिल वाल्यां की लिस्ट',
    searchPlaceholder: 'व्यापारी का नाम, धंधा, फोन या आईडी ढूंढो...',
    filterAll: 'सारे खरीदार',
    filterActive: 'चालते खरीदार',
    filterSuspended: 'रोके होए खरीदार',
    tableHeaders: {
      buyer: 'खरीदार / कंपनी',
      business: 'व्यापार का काम',
      contact: 'फोन नंबर',
      location: 'मंडी / पता',
      type: 'श्रेणी',
      status: 'स्थिति',
      actions: 'कार्रवाई',
    },
    suspendBtn: 'खाता रोको',
    reactivateBtn: 'दोबारा चालू करो',
    viewProfileBtn: 'प्रोफाइल देखो',
    noBuyersFound: 'कोई खरीदार खाता कोन्या मिल्या।',
    statusActive: 'चालू',
    statusSuspended: 'रोक राख्या',
  },
  marketplaceTab: {
    title: 'मंडी फसल लिस्टिंग कंट्रोल',
    subtitle: 'बाज़ार म बिकण आली सारी फसळां की देखभाल, भाव अर स्थिति',
    searchPlaceholder: 'फसल, किसान का नाम या आईडी ढूंढो...',
    filterCropAll: 'सारी फसलें',
    filterStatusAll: 'सारे हाल',
    statusAvailable: 'बिकण खातर तैय्यार',
    statusSold: 'बिक गी',
    statusDisabled: 'बंद',
    tableHeaders: {
      id: 'लिस्टिंग आईडी',
      crop: 'फसल अर किस्म',
      farmer: 'किसान',
      quantity: 'मात्रा',
      expectedRate: 'किसान का भाव',
      mandiRate: 'मंडी का भाव',
      grade: 'ग्रेड',
      status: 'हाल',
      actions: 'कार्रवाई',
    },
    setAvailable: 'बिक्री खातर खोलो',
    setSold: 'बिकी मार्क करो',
    setDisabled: 'बंद करो',
    deleteListing: 'पक्का हटाओ',
    noListingsFound: 'कोई फसल लिस्टिंग कोन्या मिली।',
  },
  ordersTab: {
    title: 'ऑर्डर अर सौदे की निगरानी',
    subtitle: 'किसान अर व्यापारी कै बीच चालते सारे आर्डर, गाड़ी अर पेमेंट देखो',
    searchPlaceholder: 'ऑर्डर नंबर, खरीदार या फसल ढूंढो...',
    filterAll: 'सारे ऑर्डर',
    tableHeaders: {
      orderNo: 'ऑर्डर सं.',
      buyer: 'खरीदार',
      farmer: 'किसान',
      crop: 'फसल',
      quantity: 'मात्रा',
      totalAmount: 'कुल रुपये',
      status: 'हाल',
      date: 'तारीख',
      actions: 'विवरण',
    },
    viewDetails: 'ऑर्डर देखो',
    noOrdersFound: 'कोई ऑर्डर दर्ज कोन्या।',
  },
  ticketsTab: {
    title: 'सपोर्ट टिकट अर समाधान',
    subtitle: 'किसानां अर खरीदारां की शिकायतां का निपटारा',
    filterAll: 'सारे टिकट्स',
    filterOpen: 'खुले',
    filterInReview: 'जांच म',
    filterEscalated: 'आगे भेजे',
    filterResolved: 'निपटगे',
    tableHeaders: {
      ticketId: 'टिकट सं.',
      subject: 'मुद्दा',
      user: 'यूजर',
      category: 'श्रेणी',
      priority: 'ज़रूरी',
      status: 'हाल',
      date: 'तारीख',
      actions: 'कार्रवाई',
    },
    resolveBtn: 'निपट गया करो',
    escalateBtn: 'आगे भेजो',
    respondBtn: 'जवाब देवो',
    noTicketsFound: 'कोई टिकट कोन्या मिल्या।',
  },
  auditTab: {
    title: 'सिस्टम सुरक्षा अर ऑडिट लॉग',
    subtitle: 'सारे प्रशासनिक कामां का पक्का रिकॉर्ड',
    tableHeaders: {
      timestamp: 'टेम',
      actor: 'करण आला',
      role: 'पद',
      action: 'काम',
      details: 'पूरी बात',
    },
    noLogsFound: 'कोई ऑडिट लॉग कोन्या।',
  },
  diagnosticsTab: {
    title: 'सिस्टम जांच अर सेहत',
    subtitle: 'सर्वर, डेटाबेस अर कनेक्शन की जांच',
    systemStatus: 'सिस्टम सेहत',
    allServicesOperational: 'सारे काम बढ़िया चाल रहे सैं',
    apiLatency: 'एपीआई लेटेंसी',
    databaseHealth: 'डेटाबेस का हाल',
    smsGateway: 'एसएमएस गेटवे',
    aiEngine: 'एआई इंजन',
    storageUsage: 'स्टोरेज नाप',
    backupStatus: 'बैकअप स्थिति',
  },
  common: {
    loading: 'डेटा लोड होवै सै...',
    refreshSuccess: 'सारा डेटा ताज़ा हो ग्या।',
    actionSuccess: 'काम पूरा हो ग्या।',
    actionError: 'काम म अड़चन आई।',
    confirmAction: 'के थाम सच म यो काम करना चाहो सो?',
    close: 'बंद करो',
    save: 'संजोवो',
    cancel: 'रद्द करो',
    filter: 'छांटो',
    search: 'ढूंढो',
    showing: 'दिखा रहे सां',
    records: 'रिकॉर्ड',
    rupeeSymbol: '₹',
  },
};

// 5. TELUGU (తెలుగు)
const te: AdminTranslationsDict = {
  header: {
    title: 'కిసాన్ సాథੀ పరిపాలనా నియంత్రణ కేంద్రం',
    badge: 'పూర్తి పర్యవేక్షణ',
    subtitle: 'అడ్మినిస్ట్రేటివ్ కంట్రోల్ సెంటర్ · రైతు మరియు కొనుగోలుదారు పోర్టల్స్ పూర్తి పర్యవేక్షణ',
    refreshData: 'డేటా రిఫ్రెష్',
    signOut: 'లాగ్ అవుట్',
  },
  navigation: {
    modulesHeading: 'కంట్రోల్ మాడ్యూల్స్',
    overview: 'ఓవర్‌వ్యూ',
    farmers: 'రైతులు & ధృవీకరణ',
    buyers: 'కొనుగోలుదారులు & వ్యాపారులు',
    marketplace: 'పంట జాబితాల నియంత్రణ',
    orders: 'ఆర్డర్లు & చెల్లింపులు',
    tickets: 'సహాయక టిక్కెట్లు',
    auditLogs: 'భద్రతా & ఆడిట్ లాగ్‌లు',
    diagnostics: 'సిస్టమ్ విశ్లేషణ',
  },
  overview: {
    title: 'వేదిక సమీక్ష',
    subtitle: 'కిసాన్ సాథੀ వేదిక ప్రస్తుత స్థితి, క్రియాశీల వినియోగదారులు మరియు కొలమానాలు',
    stats: {
      totalFarmers: 'మొత్తం నమోదైన రైతులు',
      verifiedFarmers: 'ధృవీకరించబడిన రైతులు',
      activeBuyers: 'క్రియాశీల కొనుగోలుదారులు',
      activeListings: 'క్రియాశీల పంట జాబితాలు',
      totalOrders: 'మొత్తం ఆర్డర్లు',
      openTickets: 'ఓపెన్ సపోర్ట్ టిక్కెట్లు',
      systemHealth: 'సిస్టమ్ ఆరోగ్యం',
      auditLogsCount: 'మొత్తం ఆడిట్ లాగ్‌లు',
    },
    quickActionsTitle: 'త్వరిత పరిపాలనా చర్యలు',
    recentActivityTitle: 'ఇటీవలి ప్లాట్‌ఫారమ్ కార్యకలాపాలు',
    recentActivitySub: 'రైతులు, కొనుగోలుదారులు మరియు ఆర్డర్ల ప్రత్యక్ష నవీకరణలు',
    noRecentActivity: 'ఇటీవలి కార్యకలాపాలు ఏవీ నమోదు కాలేదు.',
  },
  farmersTab: {
    title: 'రైతుల నిర్వహణ & ధృవీకరణ',
    subtitle: 'నమోదైన రైతుల జాబితా, ఆధార్ ధృవీకరణ స్థితి మరియు ఖాతా నియంత్రణ',
    searchPlaceholder: 'పేరు, మొబైల్, జిల్లా లేదా రైతు ID ద్వారా వెతకండి...',
    filterAll: 'రైతులందరూ',
    filterVerified: 'ధృవీకరించబడినవారు మాత్రమే',
    filterPending: 'ధృవీకరణ పెండింగ్‌లో ఉంది',
    filterSuspended: 'తాత్కాలికంగా నిలిపివేయబడిన ఖాతాలు',
    tableHeaders: {
      farmer: 'రైతు పేరు',
      contact: 'సంప్రదింపు వివరాలు',
      location: 'జిల్లా / రాష్ట్రం',
      land: 'వ్యవసాయ భూమి',
      kyc: 'ఇ-కెవైసి స్థితి',
      status: 'ఖాతా స్థితి',
      actions: 'చర్యలు',
    },
    verifyBtn: 'ధృవీకరించండి',
    suspendBtn: 'తాత్కాలికంగా నిలిపివేయి',
    reactivateBtn: 'పునరుద్ధరించండి',
    viewDetailsBtn: 'వివరాలు చూడండి',
    noFarmersFound: 'ఎలాంటి రైతు ఖాతాలు కనుగొనబడలేదు.',
    kycVerified: 'ధృవీకరించబడింది',
    kycPending: 'పెండింగ్',
    statusActive: 'క్రియాశీలం',
    statusSuspended: 'నిలిపివేయబడింది',
  },
  buyersTab: {
    title: 'కొనుగోలుదారులు & వ్యాపారుల నిర్వహణ',
    subtitle: 'నమోదైన వ్యాపారులు, మిల్లులు మరియు టోకు కొనుగోలుదారుల నిర్వహణ',
    searchPlaceholder: 'కొనుగోలుదారు పేరు, వ్యాపారం, మొబైల్ లేదా ID ద్వారా వెతకండి...',
    filterAll: 'కొనుగోలుదారులందరూ',
    filterActive: 'క్రియాశీల కొనుగోలుదారులు',
    filterSuspended: 'నిలిపివేయబడిన కొనుగోలుదారులు',
    tableHeaders: {
      buyer: 'కొనుగోలుదారు / కంపెనీ',
      business: 'వ్యాపార రకం',
      contact: 'మొబైల్ నంబర్',
      location: 'మార్కెట్ యార్డ్ / చిరునామా',
      type: 'వర్గం',
      status: 'స్థితి',
      actions: 'చర్యలు',
    },
    suspendBtn: 'నిలిపివేయి',
    reactivateBtn: 'పునరుద్ధరించండి',
    viewProfileBtn: 'ప్రొఫైల్ చూడండి',
    noBuyersFound: 'కొనుగోలుదారు ఖాతాలు ఏవీ కనుగొనబడలేదు.',
    statusActive: 'క్రియాశీలం',
    statusSuspended: 'నిలిపివేయబడింది',
  },
  marketplaceTab: {
    title: 'మార్కెట్‌ప్లేస్ పంట జాబితా నియంత్రణ',
    subtitle: 'మార్కెట్‌లో అందుబాటులో ఉన్న పంటలు, నాణ్యతా గ్రేడ్‌లు మరియు ధరలను నిర్వహించండి',
    searchPlaceholder: 'పంట, రకం, రైతు పేరు లేదా జాబితా ID వెతకండి...',
    filterCropAll: 'అన్ని పంటలు',
    filterStatusAll: 'అన్ని స్థితులు',
    statusAvailable: 'అమ్మకానికి అందుబాటులో ఉంది',
    statusSold: 'విక్రయించబడింది',
    statusDisabled: 'నిష్క్రియం చేయబడింది',
    tableHeaders: {
      id: 'జాబితా ID',
      crop: 'పంట & రకం',
      farmer: 'రైతు',
      quantity: 'పరిమాణం',
      expectedRate: 'రైతు ధర',
      mandiRate: 'మార్కెట్ ధర',
      grade: 'గ్రేడ్',
      status: 'స్థితి',
      actions: 'చర్యలు',
    },
    setAvailable: 'అందుబాటులో ఉంచండి',
    setSold: 'అమ్మినట్లు గుర్తించండి',
    setDisabled: 'నిష్క్రియం చేయండి',
    deleteListing: 'శాశ్వతంగా తొలగించండి',
    noListingsFound: 'పంట జాబితాలు ఏవీ కనుగొనబడలేదు.',
  },
  ordersTab: {
    title: 'ఆర్డర్లు & చెల్లింపుల పర్యవేక్షణ',
    subtitle: 'రైతు మరియు కొనుగోలుదారు మధ్య ఆర్డర్ పురోగతి, వాహనం మరియు ఎస్క్రో చెల్లింపులు',
    searchPlaceholder: 'ఆర్డర్ నంబర్, కొనుగోలుదారు లేదా పంటను వెతకండి...',
    filterAll: 'అన్ని ఆర్డర్లు',
    tableHeaders: {
      orderNo: 'ఆర్డర్ నం.',
      buyer: 'కొనుగోలుదారు',
      farmer: 'రైతు',
      crop: 'పంట',
      quantity: 'పరిమాణం',
      totalAmount: 'మొత్తం సొమ్ము',
      status: 'స్థితి',
      date: 'తేదీ',
      actions: 'వివరాలు',
    },
    viewDetails: 'ఆర్డర్ వివరాలు',
    noOrdersFound: 'ఎలాంటి ఆర్డర్లు నమోదు కాలేదు.',
  },
  ticketsTab: {
    title: 'సహాయక టిక్కెట్లు & పరిష్కారాలు',
    subtitle: 'వినియోగదారుల విచారణలు మరియు సమస్యల నిర్వహణ',
    filterAll: 'అన్ని టిక్కెట్లు',
    filterOpen: 'ఓపెన్',
    filterInReview: 'సమీక్షలో ఉంది',
    filterEscalated: 'ఎస్కెలేట్ చేయబడింది',
    filterResolved: 'పరిష్కరించబడింది',
    tableHeaders: {
      ticketId: 'టికెట్ ID',
      subject: 'విషయం',
      user: 'వినియోగదారు',
      category: 'వర్గం',
      priority: 'ప్రాధాన్యత',
      status: 'స్థితి',
      date: 'నమోదైన సమయం',
      actions: 'చర్యలు',
    },
    resolveBtn: 'పరిష్కరించబడినట్లు గుర్తించండి',
    escalateBtn: 'ఎస్కెలేట్ చేయండి',
    respondBtn: 'సమాధానం పంపండి',
    noTicketsFound: 'టిక్కెట్లు ఏవీ కనుగొనబడలేదు.',
  },
  auditTab: {
    title: 'ఆడిట్ & భద్రతా లాగ్‌లు',
    subtitle: 'పరిపాలనా చర్యలు మరియు డేటాబేస్ మార్పుల రికార్డు',
    tableHeaders: {
      timestamp: 'సమయం',
      actor: 'నిర్వహించిన వ్యక్తి',
      role: 'పాత్ర',
      action: 'చర్య',
      details: 'వివరాలు',
    },
    noLogsFound: 'ఎలాంటి ఆడిట్ లాగ్‌లు అందుబాటులో లేవు.',
  },
  diagnosticsTab: {
    title: 'సిస్టమ్ విశ్లేషణ & ఆరోగ్యం',
    subtitle: 'సర్వర్ ప్రతిస్పందన, డేటాబేస్ మరియు API గేట్‌వేల స్థితి',
    systemStatus: 'సిస్టమ్ ఆరోగ్యం',
    allServicesOperational: 'అన్ని సేవలు సాధారణంగా పనిచేస్తున్నాయి',
    apiLatency: 'API ఆలస్యం',
    databaseHealth: 'డేటాబేస్ ఆరోగ్యం',
    smsGateway: 'SMS గేట్‌వే',
    aiEngine: 'AI ఇంజిన్',
    storageUsage: 'నిల్వ సామర్థ్యం',
    backupStatus: 'ఆటోమేటెడ్ బ్యాకప్',
  },
  common: {
    loading: 'డేటా లోడ్ అవుతోంది...',
    refreshSuccess: 'మొత్తం డేటా విజయవంతంగా రిఫ్రెష్ చేయబడింది.',
    actionSuccess: 'చర్య విజయవంతమైంది.',
    actionError: 'చర్య విఫలమైంది.',
    confirmAction: 'మీరు నిజంగా ఈ చర్యను కొనసాగించాలనుకుంటున్నారా?',
    close: 'మూసివేయి',
    save: 'సేవ్ చేయి',
    cancel: 'రద్దు చేయి',
    filter: 'ఫిల్టర్',
    search: 'వెతకండి',
    showing: 'చూపిస్తున్నవి',
    records: 'రికార్డులు',
    rupeeSymbol: '₹',
  },
};

// 6. TAMIL (தமிழ்)
const ta: AdminTranslationsDict = {
  header: {
    title: 'கிசான் சாதி நிர்வாகக் கட்டுப்பாட்டு மையம்',
    badge: 'முழுமையான மேற்பார்வை',
    subtitle: 'நிர்வாகக் கட்டுப்பாட்டு மையம் · விவசாயி மற்றும் வாங்குபவர் போர்ட்டல்களின் முழுமையான கண்காணிப்பு',
    refreshData: 'தரவை புதுப்பிக்கவும்',
    signOut: 'வெளியேறு',
  },
  navigation: {
    modulesHeading: 'கட்டுப்பாட்டுப் பிரிவுகள்',
    overview: 'கட்டுப்பாட்டு மேலோட்டம்',
    farmers: 'விவசாயிகள் & சரிபார்ப்பு',
    buyers: 'வாங்குபவர்கள் & வணிகர்கள்',
    marketplace: 'பயிர் பட்டியல் கட்டுப்பாடு',
    orders: 'ஆர்டர்கள் & பரிவர்த்தனைகள்',
    tickets: 'ஆதரவு டிக்கெட்டுகள்',
    auditLogs: 'தணிக்கை & பாதுகாப்பு பதிவுகள்',
    diagnostics: 'கணினி நிலை & சோதனை',
  },
  overview: {
    title: 'தள மேலோட்டம்',
    subtitle: 'கிசான் சாதி தளத்தின் தற்போதைய நிலை, பயன்பாட்டில் உள்ள பயனர்கள் மற்றும் அளவீடுகள்',
    stats: {
      totalFarmers: 'மொத்த பதிவுசெய்த விவசாயிகள்',
      verifiedFarmers: 'சரிபார்க்கப்பட்ட விவசாயிகள்',
      activeBuyers: 'செயலில் உள்ள வாங்குபவர்கள்',
      activeListings: 'செயலில் உள்ள பயிர் பட்டியல்கள்',
      totalOrders: 'மொத்த ஆர்டர்கள்',
      openTickets: 'திறந்திருக்கும் ஆதரவு டிக்கெட்டுகள்',
      systemHealth: 'கணினி ஆரோக்கியம்',
      auditLogsCount: 'மொத்த தணிக்கை பதிவுகள்',
    },
    quickActionsTitle: 'விரைவான நிர்வாக நடவடிக்கைகள்',
    recentActivityTitle: 'சமீபத்திய தள நடவடிக்கைகள்',
    recentActivitySub: 'விவசாயிகள், வாங்குபவர்கள் மற்றும் ஆர்டர்களின் நேரலை புதுப்பிப்புகள்',
    noRecentActivity: 'சமீபத்திய நடவடிக்கைகள் எதுவும் பதிவு செய்யப்படவில்லை.',
  },
  farmersTab: {
    title: 'விவசாயிகள் மேலாண்மை & சரிபார்ப்பு',
    subtitle: 'பதிவுசெய்த விவசாயிகள் பட்டியல், ஆதார் சரிபார்ப்பு நிலை மற்றும் கணக்கு கட்டுப்பாடு',
    searchPlaceholder: 'பெயர், மொபைல், மாவட்டம் அல்லது விவசாயி ID மூலம் தேடவும்...',
    filterAll: 'அனைத்து விவசாயிகள்',
    filterVerified: 'சரிபார்க்கப்பட்டவர்கள் மட்டும்',
    filterPending: 'சரிபார்ப்பு நிலுவையில் உள்ளது',
    filterSuspended: 'தற்காலிகமாக நிறுத்தப்பட்ட கணக்குகள்',
    tableHeaders: {
      farmer: 'விவசாயி பெயர்',
      contact: 'தொடர்பு விவரங்கள்',
      location: 'மாவட்டம் / மாநிலம்',
      land: 'விவசாய நிலம்',
      kyc: 'இ-கேஒய்சி நிலை',
      status: 'கணக்கு நிலை',
      actions: 'நடவடிக்கைகள்',
    },
    verifyBtn: 'சரிபார்க்கவும்',
    suspendBtn: 'நிறுத்திவைக்கவும்',
    reactivateBtn: 'மீண்டும் செயல்படுத்துக',
    viewDetailsBtn: 'விவரங்களைக் காண்க',
    noFarmersFound: 'விவசாயி கணக்குகள் எதுவும் கிடைக்கவில்லை.',
    kycVerified: 'சரிபார்க்கப்பட்டது',
    kycPending: 'நிலுவையில்',
    statusActive: 'செயலில்',
    statusSuspended: 'நிறுத்தப்பட்டது',
  },
  buyersTab: {
    title: 'வாங்குபவர்கள் & வணிகர்கள் மேலாண்மை',
    subtitle: 'பதிவுசெய்த வணிகர்கள், ஆலைகள் மற்றும் மொத்த கொள்முதல் நிறுவனங்களின் மேலாண்மை',
    searchPlaceholder: 'வாங்குபவர் பெயர், நிறுவனம், மொபைல் அல்லது ID மூலம் தேடவும்...',
    filterAll: 'அனைத்து வாங்குபவர்கள்',
    filterActive: 'செயலில் உள்ள வாங்குபவர்கள்',
    filterSuspended: 'நிறுத்தப்பட்ட வாங்குபவர்கள்',
    tableHeaders: {
      buyer: 'வாங்குபவர் / நிறுவனம்',
      business: 'வணிக வகை',
      contact: 'கைபேசி எண்',
      location: 'மண்டி / முகவரி',
      type: 'பிரிவு',
      status: 'நிலை',
      actions: 'நடவடிக்கைகள்',
    },
    suspendBtn: 'நிறுத்திவைக்கவும்',
    reactivateBtn: 'மீண்டும் செயல்படுத்துக',
    viewProfileBtn: 'சுயவிவரத்தைக் காண்க',
    noBuyersFound: 'வாங்குபவர் கணக்குகள் எதுவும் கிடைக்கவில்லை.',
    statusActive: 'செயலில்',
    statusSuspended: 'நிறுத்தப்பட்டது',
  },
  marketplaceTab: {
    title: 'சந்தை பயிர் பட்டியல் கட்டுப்பாடு',
    subtitle: 'சந்தையில் கிடைக்கும் பயிர்கள், தரநிலைகள் மற்றும் விலைகளைக் கண்காணிக்கவும்',
    searchPlaceholder: 'பயிர், ரகம், விவசாயி பெயர் அல்லது பட்டியல் ID தேடவும்...',
    filterCropAll: 'அனைத்து பயிர்கள்',
    filterStatusAll: 'அனைத்து நிலைகள்',
    statusAvailable: 'விற்பனைக்கு உள்ளது',
    statusSold: 'விற்கப்பட்டது',
    statusDisabled: 'முடக்கப்பட்டது',
    tableHeaders: {
      id: 'பட்டியல் ID',
      crop: 'பயிர் & ரகம்',
      farmer: 'விவசாயி',
      quantity: 'அளவு',
      expectedRate: 'விவசாயி விலை',
      mandiRate: 'மண்டி விலை',
      grade: 'தரம்',
      status: 'நிலை',
      actions: 'நடவடிக்கைகள்',
    },
    setAvailable: 'கிடைக்கச் செய்க',
    setSold: 'விற்றதாக குறிக்கவும்',
    setDisabled: 'முடக்குக',
    deleteListing: 'நிரந்தரமாக நீக்குக',
    noListingsFound: 'பயிர் பட்டியல்கள் எதுவும் கிடைக்கவில்லை.',
  },
  ordersTab: {
    title: 'ஆர்டர்கள் & பரிவர்த்தனைகள் கண்காணிப்பு',
    subtitle: 'விவசாயி மற்றும் வாங்குபவர் இடையேயான ஆர்டர் நகர்வு, வாகன கண்காணிப்பு மற்றும் பணம்',
    searchPlaceholder: 'ஆர்டர் எண், வாங்குபவர் அல்லது பயிரைத் தேடவும்...',
    filterAll: 'அனைத்து ஆர்டர்கள்',
    tableHeaders: {
      orderNo: 'ஆர்டர் எண்',
      buyer: 'வாங்குபவர்',
      farmer: 'விவசாயி',
      crop: 'பயிர்',
      quantity: 'அளவு',
      totalAmount: 'மொத்தத் தொகை',
      status: 'நிலை',
      date: 'தேதி',
      actions: 'விவரங்கள்',
    },
    viewDetails: 'ஆர்டர் விவரங்கள்',
    noOrdersFound: 'எந்த ஆர்டரும் பதிவு செய்யப்படவில்லை.',
  },
  ticketsTab: {
    title: 'ஆதரவு டிக்கெட்டுகள் & தீர்வுகள்',
    subtitle: 'பயனர் புகார்கள் மற்றும் தொழில்நுட்பச் சிக்கல்களின் மேலாண்மை',
    filterAll: 'அனைத்து டிக்கெட்டுகள்',
    filterOpen: 'திறந்திருக்கும்',
    filterInReview: 'மதிப்பாய்வில்',
    filterEscalated: 'மேலனுப்பப்பட்டது',
    filterResolved: 'தீர்க்கப்பட்டது',
    tableHeaders: {
      ticketId: 'டிக்கெட் எண்',
      subject: 'பொருள்',
      user: 'பயனர்',
      category: 'பிரிவு',
      priority: 'முன்னுரிமை',
      status: 'நிலை',
      date: 'பதிவு செய்த நேரம்',
      actions: 'நடவடிக்கைகள்',
    },
    resolveBtn: 'தீர்க்கப்பட்டதாகக் குறிக்கவும்',
    escalateBtn: 'மேலதிகாரிக்கு அனுப்புக',
    respondBtn: 'பதில் அனுப்புக',
    noTicketsFound: 'டிக்கெட்டுகள் எதுவும் கிடைக்கவில்லை.',
  },
  auditTab: {
    title: 'தணிக்கை & பாதுகாப்பு பதிவுகள்',
    subtitle: 'நிர்வாக நடவடிக்கைகள் மற்றும் தரவுத்தள மாற்றங்களின் நிரந்தர பதிவு',
    tableHeaders: {
      timestamp: 'நேரம்',
      actor: 'செய்தவர்',
      role: 'பங்கு',
      action: 'செயல்பாடு',
      details: 'விவரங்கள்',
    },
    noLogsFound: 'தணிக்கை பதிவுகள் எதுவும் இல்லை.',
  },
  diagnosticsTab: {
    title: 'கணினி பகுப்பாய்வு & நிலை',
    subtitle: 'சேவையக வேகம், தரவுத்தளம் மற்றும் API இணைப்புகளின் சோதனை',
    systemStatus: 'கணினி நிலை',
    allServicesOperational: 'அனைத்து சேவைகளும் சீராக இயங்குகின்றன',
    apiLatency: 'API வேகம்',
    databaseHealth: 'தரவுத்தள நிலை',
    smsGateway: 'SMS நுழைவாயில்',
    aiEngine: 'AI இயந்திரம்',
    storageUsage: 'சேமிப்பக அளவு',
    backupStatus: 'தானியங்கி காப்புநகல்',
  },
  common: {
    loading: 'தரவு ஏற்றப்படுகிறது...',
    refreshSuccess: 'அனைத்து தரவுகளும் வெற்றிகரமாக புதுப்பிக்கப்பட்டன.',
    actionSuccess: 'செயல்பாடு வெற்றிகரமாக முடிந்தது.',
    actionError: 'செயல்பாட்டில் பிழை ஏற்பட்டது.',
    confirmAction: 'இந்தச் செயல்பாட்டைத் தொடர விரும்புகிறீர்களா?',
    close: 'மூடு',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    filter: 'வடிகட்டு',
    search: 'தேடு',
    showing: 'காட்டப்படும்',
    records: 'பதிவுகள்',
    rupeeSymbol: '₹',
  },
};

export const adminTranslations: Record<LanguageCode, AdminTranslationsDict> = {
  hi,
  en,
  pa,
  hr,
  te,
  ta,
};

export function getAdminTranslations(lang: LanguageCode): AdminTranslationsDict {
  return adminTranslations[lang] || adminTranslations.hi;
}
