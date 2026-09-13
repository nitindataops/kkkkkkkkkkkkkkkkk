// Centralized translation dictionary for KisanSetu AI Support Assistant and Help Center
import { LanguageCode } from '../types';

export type SupportLanguage = LanguageCode;

export interface SupportTranslations {
  // Header
  headerTitle: string;
  headerBadge: string;
  headerSubtitle: string;
  voiceReplyEnabled: string;
  voiceReplyDisabled: string;
  closeAssistant: string;

  // Tabs
  tabAiChat: string;
  tabPhone: string;
  tabEmail: string;
  tabTickets: string;

  // Language selector
  languageLabel: string;
  langHindi: string;
  langEnglish: string;

  // Welcome & Initial
  welcomeMessage: string;
  quickActionCropListing: string;
  quickActionMandiRates: string;
  quickActionOrderTracking: string;
  quickActionPaymentEscrow: string;
  quickActionPhotoGrading: string;

  // Input & Controls
  inputPlaceholder: string;
  listeningActive: string;
  clickToSpeak: string;
  sendMessage: string;
  speechNotSupported: string;
  securityNotice: string;
  tollFreeHelpline: string;

  // AI State & Status
  aiAnalyzing: string;
  activeTicketBanner: string;
  escalatedToSeniorDesk: string;
  viewTicketDetails: string;
  readOutAudio: string;

  // Resolution & Feedback
  wasProblemSolved: string;
  yesProblemSolved: string;
  noProblemStillHaving: string;
  resolutionThankYou: string;
  escalationNotice: (ticketId: string) => string;
  ratingQuestion: string;
  ratingSubmitted: string;
  callHelplineAction: string;

  // Fallback & Errors
  serverErrorFallback: string;
  createTicketAction: string;
  ticketCreatedSystemMsg: (ticketId: string) => string;

  // Phone Helpline tab
  helplineTitle: string;
  helplineBadge: string;
  tollFreeDirectDial: string;
  helplineHours: string;
  simulatorTitle: string;
  simulatorBadge: string;
  simulatorDesc: string;
  callerQueryLabel: string;
  callerQueryPlaceholder: string;
  runVoiceEngine: string;
  samplePaymentQuery: string;
  sampleMandiQuery: string;
  helplineSpokenResponse: string;
  playAudio: string;
  ticketGenerated: string;

  // Email tab
  emailTitle: string;
  emailBadge: string;
  yourEmailLabel: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  messageBodyLabel: string;
  messageBodyPlaceholder: string;
  sendEmailBtn: string;
  sendingEmailBtn: string;
  emailTicketLogged: string;
  autoProcessedBadge: string;

  // Tickets tab
  myTicketsTitle: string;
  myTicketsSubtitle: string;
  refreshTickets: string;
  loadingTickets: string;
  noTicketsFound: string;
  noTicketsDesc: string;
  resolutionNote: string;
  assignedTo: string;
  category: string;
  language: string;
}

const hi: SupportTranslations = {
  headerTitle: 'किसान साथी AI सहायता',
  headerBadge: 'रियल AI + कृषि विशेषज्ञ',
  headerSubtitle: 'कृषक एवं व्यापारी 24/7 रीयल-टाइम समाधान केंद्र',
  voiceReplyEnabled: 'वॉइस उत्तर सक्रिय है',
  voiceReplyDisabled: 'वॉइस उत्तर निष्क्रिय है',
  closeAssistant: 'बंद करें',

  tabAiChat: 'AI चैट सहायक',
  tabPhone: 'हेल्पलाइन / फोन',
  tabEmail: 'ईमेल सपोर्ट',
  tabTickets: 'मेरे टिकट',

  languageLabel: 'भाषा / Language:',
  langHindi: '🇮🇳 हिंदी',
  langEnglish: '🇬🇧 English',

  welcomeMessage:
    'नमस्ते! मैं किसान साथी AI सहायता सहायक हूँ। आपकी फसल लिस्टिंग, सरकारी मंडी भाव, फोटो AI ग्रेडिंग, पेमेंट या डिलीवरी में मैं आपकी क्या मदद कर सकता हूँ?',
  quickActionCropListing: 'मेरी फसल लिस्टिंग जांचें',
  quickActionMandiRates: 'नवीनतम मंडी भाव देखें',
  quickActionOrderTracking: 'ऑर्डर व डिलीवरी स्थिति',
  quickActionPaymentEscrow: 'पेमेंट व एस्क्रो सुरक्षा',
  quickActionPhotoGrading: 'फसल फोटो ग्रेडिंग सहायता',

  inputPlaceholder: 'अपनी समस्या बताएं (उदा. मेरी टमाटर की फसल, मंडी भाव, पेमेंट नहीं आई)...',
  listeningActive: 'सुन रहे हैं... रोकने के लिए क्लिक करें',
  clickToSpeak: 'बोलकर पूछें (वॉइस इनपुट)',
  sendMessage: 'संदेश भेजें',
  speechNotSupported: 'आपके ब्राउज़र में वॉइस स्पीच सपोर्ट उपलब्ध नहीं है। कृपया टेक्स्ट टाइप करें।',
  securityNotice: 'पासवर्ड, OTP या UPI पिन किसी से साझा न करें।',
  tollFreeHelpline: 'टोल-फ्री',

  aiAnalyzing: 'Kisan Saathi का डेटा चेक किया जा रहा है...',
  activeTicketBanner: 'सक्रिय सपोर्ट टिकट:',
  escalatedToSeniorDesk: 'वरिष्ठ कृषि सहायता डेस्क को भेजा गया',
  viewTicketDetails: 'विवरण देखें',
  readOutAudio: 'आवाज़ में सुनें',

  wasProblemSolved: 'क्या आपकी समस्या का समाधान हो गया?',
  yesProblemSolved: 'हाँ, समस्या हल हो गई',
  noProblemStillHaving: 'नहीं, अभी भी समस्या है',
  resolutionThankYou: 'बहुत बढ़िया! आपकी समस्या हल हो गई। 🙏 किसान साथी का उपयोग करने के लिए धन्यवाद।',
  escalationNotice: (ticketId: string) =>
    `कोई बात नहीं। मैंने आपकी समस्या Kisan Saathi विशेषज्ञ सहायता टीम तक भेज दी है। आपका टिकट नंबर है: ${ticketId}। हमारे वरिष्ठ कृषि अधिकारी जल्द ही आपसे संपर्क करेंगे।`,
  ratingQuestion: 'किसान साथी सहायता का आपका अनुभव कैसा रहा?',
  ratingSubmitted: 'प्रतिक्रिया दर्ज कर ली गई है। धन्यवाद!',
  callHelplineAction: 'हेल्पलाइन पर बात करें',

  serverErrorFallback:
    'माफ़ कीजिए, अभी AI सहायता सर्वर से कनेक्ट करने में कठिनाई आ रही है। आप टोल-फ्री हेल्पलाइन पर कॉल कर सकते हैं या सपोर्ट टिकट दर्ज कर सकते हैं।',
  createTicketAction: 'सपोर्ट टिकट बनाएं',
  ticketCreatedSystemMsg: (ticketId: string) =>
    `सपोर्ट टिकट दर्ज हो गया है: ${ticketId}। आप 'मेरे टिकट' टैब में इसकी लाइव स्थिति देख सकते हैं।`,

  helplineTitle: 'किसान साथी आधिकारिक हेल्पलाइन',
  helplineBadge: 'टोल-फ्री कृषक एवं व्यापार सहायता डेस्क',
  tollFreeDirectDial: 'सीधा हेल्पलाइन नंबर',
  helplineHours: 'सप्ताह के 6 दिन (सुबह 8:00 से रात 8:00 बजे) हिंदी, अंग्रेज़ी व स्थानीय भाषाओं में उपलब्ध',
  simulatorTitle: 'इंटरैक्टिव हेल्पलाइन व वॉइस सिम्युलेटर',
  simulatorBadge: 'वॉइस इंजन',
  simulatorDesc:
    'देखें कि कैसे फ़ोन कॉलर की बोली को AI पहचानता है, रीयल-टाइम डेटाबेस की जांच करता है और आवश्यकता पड़ने पर सपोर्ट टिकट बनाता है।',
  callerQueryLabel: 'कॉलर का प्रश्न / बोली (Hindi / English)',
  callerQueryPlaceholder: 'यहाँ लिखें जो कॉलर बोल रहा है...',
  runVoiceEngine: 'वॉइस कॉल प्रोसेसर चलाएं',
  samplePaymentQuery: 'पेमेंट स्थिति प्रश्न',
  sampleMandiQuery: 'मंडी भाव प्रश्न',
  helplineSpokenResponse: 'हेल्पलाइन द्वारा बोला गया उत्तर:',
  playAudio: 'आवाज़ सुनें',
  ticketGenerated: 'टिकट दर्ज हुआ:',

  emailTitle: 'किसान साथी ईमेल सपोर्ट डेस्क',
  emailBadge: 'त्वरित समाधान ईमेल टीम',
  yourEmailLabel: 'आपका ईमेल पता',
  subjectLabel: 'विषय',
  subjectPlaceholder: 'उदा. मेरी गेहूं फसल फोटो या टिकट KIS-SUP-1002',
  messageBodyLabel: 'समस्या का विस्तृत विवरण',
  messageBodyPlaceholder: 'अपनी समस्या हिंदी या अंग्रेज़ी में विस्तार से लिखें...',
  sendEmailBtn: 'सपोर्ट ईमेल भेजें',
  sendingEmailBtn: 'AI डेस्क द्वारा प्रोसेस हो रहा है...',
  emailTicketLogged: 'सपोर्ट टिकट दर्ज:',
  autoProcessedBadge: 'स्थिति: ऑटो-प्रोसेस्ड',

  myTicketsTitle: 'मेरे सपोर्ट टिकट्स',
  myTicketsSubtitle: 'आपकी सभी पूछताछों, रिपोर्टों और समाधानों की लाइव स्थिति',
  refreshTickets: 'ताज़ा करें',
  loadingTickets: 'सपोर्ट टिकट लोड हो रहे हैं...',
  noTicketsFound: 'कोई सपोर्ट टिकट नहीं मिला',
  noTicketsDesc: 'किसी भी प्रश्न या समस्या के लिए AI चैट सहायक टैब से मदद लें।',
  resolutionNote: 'समाधान विवरण:',
  assignedTo: 'असाइन किया गया:',
  category: 'श्रेणी:',
  language: 'भाषा:',
};

const en: SupportTranslations = {
  headerTitle: 'Kisan Saathi AI Support',
  headerBadge: 'Real AI + Human Desk',
  headerSubtitle: 'Farmer & Buyer 24/7 Real-Time Resolution Hub',
  voiceReplyEnabled: 'Voice reply enabled',
  voiceReplyDisabled: 'Voice reply disabled',
  closeAssistant: 'Close',

  tabAiChat: 'AI Assistant',
  tabPhone: 'Helpline / Phone',
  tabEmail: 'Email Support',
  tabTickets: 'My Tickets',

  languageLabel: 'Language / भाषा:',
  langHindi: '🇮🇳 हिंदी',
  langEnglish: '🇬🇧 English',

  welcomeMessage:
    'Namaste! I am the Kisan Saathi AI Support Assistant. How can I help you with crop listings, official AGMARKNET mandi rates, AI photo grading, escrow payment, or order delivery today?',
  quickActionCropListing: 'Check My Crop Listing',
  quickActionMandiRates: 'Live Mandi Price Rates',
  quickActionOrderTracking: 'Track Order & Delivery',
  quickActionPaymentEscrow: 'Payment & Escrow Protection',
  quickActionPhotoGrading: 'AI Photo Grading Guide',

  inputPlaceholder: 'Describe your issue (e.g. crop visibility, mandi rate, payment status)...',
  listeningActive: 'Listening... Click to stop',
  clickToSpeak: 'Click to speak (Voice input)',
  sendMessage: 'Send message',
  speechNotSupported: 'Live speech recognition is not supported in this browser. Please type your message.',
  securityNotice: 'Never share passwords, OTPs, or UPI PINs with anyone.',
  tollFreeHelpline: 'Toll-Free',

  aiAnalyzing: 'Checking Kisan Saathi data...',
  activeTicketBanner: 'Active Support Ticket:',
  escalatedToSeniorDesk: 'Escalated to Senior Agricultural Desk',
  viewTicketDetails: 'View Details',
  readOutAudio: 'Listen to response',

  wasProblemSolved: 'Was your problem solved?',
  yesProblemSolved: 'Yes, Solved',
  noProblemStillHaving: 'No, Still Having Problem',
  resolutionThankYou: 'Wonderful! Your issue has been resolved. 🙏 Thank you for choosing Kisan Saathi.',
  escalationNotice: (ticketId: string) =>
    `Understood. I have escalated this issue to our Senior Kisan Saathi Support Team. Your Ticket ID is: ${ticketId}. Our specialist will review it promptly.`,
  ratingQuestion: 'How was your Kisan Saathi support experience?',
  ratingSubmitted: 'Rating recorded. Thank you!',
  callHelplineAction: 'Call Helpline',

  serverErrorFallback:
    'Unable to connect to the AI Support engine. You can call our toll-free helpline or create a support ticket.',
  createTicketAction: 'Create Support Ticket',
  ticketCreatedSystemMsg: (ticketId: string) =>
    `Support ticket created: ${ticketId}. You can track its live progress in the 'My Tickets' tab.`,

  helplineTitle: 'Kisan Saathi Official Helpline',
  helplineBadge: 'Toll-Free Agricultural Support Desk',
  tollFreeDirectDial: 'Direct Dial Hotline',
  helplineHours: 'Available 6 Days a Week (8:00 AM – 8:00 PM) in Hindi, English & Regional Languages',
  simulatorTitle: 'Interactive Helpline Simulator',
  simulatorBadge: 'Voice Engine',
  simulatorDesc:
    'Experience how incoming caller queries are transcribed, diagnosed by the Kisan Saathi engine, and escalated into tickets.',
  callerQueryLabel: 'Simulated Caller Query / Speech (Hindi or English)',
  callerQueryPlaceholder: 'Enter what the caller speaks...',
  runVoiceEngine: 'Run Voice Call Processor',
  samplePaymentQuery: 'Sample Payment Query',
  sampleMandiQuery: 'Sample Mandi Query',
  helplineSpokenResponse: 'Helpline Spoken Response:',
  playAudio: 'Play Audio',
  ticketGenerated: 'Ticket Generated:',

  emailTitle: 'Kisan Saathi Email Support Desk',
  emailBadge: 'Automated Diagnostic Desk',
  yourEmailLabel: 'Your Email',
  subjectLabel: 'Subject',
  subjectPlaceholder: 'e.g. Issue with Wheat listing or KIS-SUP-1002',
  messageBodyLabel: 'Message Body',
  messageBodyPlaceholder: 'Describe your inquiry in detail...',
  sendEmailBtn: 'Send Support Email',
  sendingEmailBtn: 'Processing via AI Desk...',
  emailTicketLogged: 'Ticket Logged:',
  autoProcessedBadge: 'Status: Auto-Processed',

  myTicketsTitle: 'My Support Tickets',
  myTicketsSubtitle: 'Live status of your inquiries and escalations',
  refreshTickets: 'Refresh',
  loadingTickets: 'Loading support tickets...',
  noTicketsFound: 'No support tickets found',
  noTicketsDesc: 'Use the AI Assistant tab to ask any question or report an issue.',
  resolutionNote: 'Resolution Note:',
  assignedTo: 'Assigned To:',
  category: 'Category:',
  language: 'Language:',
};

// Punjabi Support Dict
const pa: SupportTranslations = {
  headerTitle: 'ਕਿਸਾਨਸੇਤੂ AI ਸਹਾਇਤਾ',
  headerBadge: 'ਅਸਲ AI + ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ',
  headerSubtitle: 'ਤਤਕਾਲ ਖੇਤੀਬਾੜੀ ਸਹਾਇਤਾ, ਮੰਡੀ ਭਾਅ ਤੇ ਐਸਕਰੋ ਭੁਗਤਾਨ',
  voiceReplyEnabled: 'ਆਵਾਜ਼ ਜਵਾਬ ਚਾਲੂ ਹੈ (ਬੋਲ ਕੇ ਜਵਾਬ ਮਿਲੇਗਾ)',
  voiceReplyDisabled: 'ਆਵਾਜ਼ ਜਵਾਬ ਬੰਦ ਹੈ',
  closeAssistant: 'ਸਹਾਇਕ ਬੰਦ ਕਰੋ',

  tabAiChat: 'AI ਗੱਲਬਾਤ',
  tabPhone: 'ਫ਼ੋਨ ਹੈਲਪਲਾਈਨ',
  tabEmail: 'ਈਮੇਲ ਸਹਾਇਤਾ',
  tabTickets: 'ਮੇਰੀਆਂ ਟਿਕਟਾਂ',

  languageLabel: 'ਭਾਸ਼ਾ:',
  langHindi: '🇮🇳 हिंदी',
  langEnglish: '🇬🇧 English',

  welcomeMessage:
    'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨਸੇਤੂ AI ਸਹਾਇਕ ਹਾਂ। ਫਸਲ ਲਿਸਟਿੰਗ, ਮੰਡੀ ਭਾਅ, AI ਫੋਟੋ ਗ੍ਰੇਡਿੰਗ, ਪੇਮੈਂਟ ਜਾਂ ਡਿਲਿਵਰੀ ਸੰਬੰਧੀ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
  quickActionCropListing: '🌾 ਫਸਲ ਲਿਸਟਿੰਗ',
  quickActionMandiRates: '📊 ਮੰਡੀ ਭਾਅ',
  quickActionOrderTracking: '🚚 ਆਰਡਰ ਟਰੈਕਿੰਗ',
  quickActionPaymentEscrow: '💰 ਭੁਗਤਾਨ ਤੇ ਐਸਕਰੋ',
  quickActionPhotoGrading: '📸 ਫੋਟੋ ਕੁਆਲਿਟੀ ਗ੍ਰੇਡਿੰਗ',

  inputPlaceholder: 'ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸੋ (ਜਿਵੇਂ ਕਣਕ ਦਾ ਭਾਅ, ਪੇਮੈਂਟ ਨਹੀਂ ਆਈ)...',
  listeningActive: 'ਸੁਣ ਰਹੇ ਹਾਂ... ਹੁਣ ਬੋਲੋ',
  clickToSpeak: 'ਬੋਲ ਕੇ ਪੁੱਛੋ (ਵੌਇਸ)',
  sendMessage: 'ਸੁਨੇਹਾ ਭੇਜੋ',
  speechNotSupported: 'ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਵੌਇਸ ਰਿਕੋਗਨੀਸ਼ਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
  securityNotice: 'ਸਾਰੇ ਲੈਣ-ਦੇਣ ਅਤੇ ਡਾਟਾ ਕਿਸਾਨਸੇਤੂ ਐਸਕਰੋ ਸੁਰੱਖਿਅਤ ਹਨ।',
  tollFreeHelpline: 'ਮੁਫ਼ਤ ਹੈਲਪਲਾਈਨ: 1800-KISAN-SETU (1800-547-2673)',

  aiAnalyzing: 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਹੇ ਹਾਂ...',
  activeTicketBanner: 'ਸਰਗਰਮ ਸਹਾਇਤਾ ਟਿਕਟ:',
  escalatedToSeniorDesk: 'ਸੀਨੀਅਰ ਡੈਸਕ ਨੂੰ ਭੇਜਿਆ ਗਿਆ',
  viewTicketDetails: 'ਟਿਕਟ ਵੇਰਵਾ ਦੇਖੋ',
  readOutAudio: 'ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣੋ',

  wasProblemSolved: 'ਕੀ ਤੁਹਾਡੀ ਸਮੱਸਿਆ ਦਾ ਹੱਲ ਹੋ ਗਿਆ?',
  yesProblemSolved: 'ਹਾਂ, ਹੱਲ ਹੋ ਗਿਆ',
  noProblemStillHaving: 'ਨਹੀਂ, ਸਮੱਸਿਆ ਬਾਕੀ ਹੈ',
  resolutionThankYou: 'ਤੁਹਾਡੇ ਫੀਡਬੈਕ ਲਈ ਧੰਨਵਾਦ! ਕਿਸਾਨਸੇਤੂ ਹਮੇਸ਼ਾ ਤੁਹਾਡੇ ਨਾਲ ਹੈ।',
  escalationNotice: (ticketId: string) =>
    `ਸਮੱਸਿਆ ਸੀਨੀਅਰ ਮਾਹਿਰ ਟੀਮ ਨੂੰ ਭੇਜ ਦਿੱਤੀ ਗਈ ਹੈ। ਟਿਕਟ ਨੰਬਰ: ${ticketId}। ਜਲਦ ਹੱਲ ਮਿਲੇਗਾ।`,
  ratingQuestion: 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੀ AI ਸਹਾਇਤਾ ਨੂੰ ਰੇਟਿੰਗ ਦਿਓ:',
  ratingSubmitted: 'ਰੇਟਿੰਗ ਦਰਜ ਹੋ ਗਈ। ਧੰਨਵਾਦ!',
  callHelplineAction: 'ਹੈਲਪਲਾਈਨ ਮਿਲਾਓ',

  serverErrorFallback:
    'AI ਸਹਾਇਤਾ ਸਰਵਰ ਨਾਲ ਸੰਪਰਕ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਤੁਸੀਂ ਸਾਡੀ ਮੁਫ਼ਤ ਹੈਲਪਲਾਈਨ ਤੇ ਕਾਲ ਕਰ ਸਕਦੇ ਹੋ ਜਾਂ ਟਿਕਟ ਬਣਾ ਸਕਦੇ ਹੋ।',
  createTicketAction: 'ਸਹਾਇਤਾ ਟਿਕਟ ਬਣਾਓ',
  ticketCreatedSystemMsg: (ticketId: string) =>
    `ਸਹਾਇਤਾ ਟਿਕਟ ਬਣ ਗਈ: ${ticketId}। ਤੁਸੀਂ 'ਮੇਰੀਆਂ ਟਿਕਟਾਂ' ਵਿੱਚ ਇਸਦੀ ਸਥਿਤੀ ਦੇਖ ਸਕਦੇ ਹੋ।`,

  helplineTitle: 'ਕਿਸਾਨਸੇਤੂ ਅਧਿਕਾਰਤ ਹੈਲਪਲਾਈਨ',
  helplineBadge: 'ਟੋਲ-ਫ੍ਰੀ ਖੇਤੀਬਾੜੀ ਸਹਾਇਤਾ ਡੈਸਕ',
  tollFreeDirectDial: 'ਸਿੱਧਾ ਫ਼ੋਨ ਨੰਬਰ',
  helplineHours: 'ਹਫ਼ਤੇ ਦੇ 6 ਦਿਨ ਉਪਲਬਧ (ਸਵੇਰੇ 8:00 ਵਜੇ – ਸ਼ਾਮ 8:00 ਵਜੇ ਤੱਕ)',
  simulatorTitle: 'ਇੰਟਰਐਕਟਿਵ ਹੈਲਪਲਾਈਨ ਸਿਮੂਲੇਟਰ',
  simulatorBadge: 'ਵੌਇਸ ਇੰਜਣ',
  simulatorDesc: 'ਵੇਖੋ ਕਿ ਕਿਵੇਂ ਕਾਲਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੁੰਦਾ ਹੈ ਅਤੇ ਸਹਾਇਤਾ ਟਿਕਟਾਂ ਬਣਦੀਆਂ ਹਨ।',
  callerQueryLabel: 'ਸਿਮੂਲੇਟਿਡ ਕਾਲਰ ਸਵਾਲ',
  callerQueryPlaceholder: 'ਕਾਲਰ ਦਾ ਸਵਾਲ ਇੱਥੇ ਲਿਖੋ...',
  runVoiceEngine: 'ਵੌਇਸ ਪ੍ਰੋਸੈਸਰ ਚਲਾਓ',
  samplePaymentQuery: 'ਨਮੂਨਾ ਭੁਗਤਾਨ ਸਵਾਲ',
  sampleMandiQuery: 'ਨਮੂਨਾ ਮੰਡੀ ਸਵਾਲ',
  helplineSpokenResponse: 'ਹੈਲਪਲਾਈਨ ਜਵਾਬ:',
  playAudio: 'ਆਡੀਓ ਸੁਣੋ',
  ticketGenerated: 'ਟਿਕਟ ਬਣ ਗਈ:',

  emailTitle: 'ਕਿਸਾਨਸੇਤੂ ਈਮੇਲ ਸਹਾਇਤਾ ਡੈਸਕ',
  emailBadge: 'ਆਟੋਮੈਟਿਕ ਡਾਇਗਨੌਸਟਿਕ ਡੈਸਕ',
  yourEmailLabel: 'ਤੁਹਾਡਾ ਈਮੇਲ',
  subjectLabel: 'ਵਿਸ਼ਾ',
  subjectPlaceholder: 'ਜਿਵੇਂ ਕਣਕ ਲਿਸਟਿੰਗ ਜਾਂ ਭੁਗਤਾਨ ਸੰਬੰਧੀ',
  messageBodyLabel: 'ਸੁਨੇਹਾ',
  messageBodyPlaceholder: 'ਆਪਣੀ ਸਮੱਸਿਆ ਦਾ ਪੂਰਾ ਵੇਰਵਾ ਲਿਖੋ...',
  sendEmailBtn: 'ਸਹਾਇਤਾ ਈਮੇਲ ਭੇਜੋ',
  sendingEmailBtn: 'ਭੇਜ ਰਹੇ ਹਾਂ...',
  emailTicketLogged: 'ਟਿਕਟ ਦਰਜ ਹੋਈ:',
  autoProcessedBadge: 'ਸਥਿਤੀ: ਆਟੋ-ਪ੍ਰੋਸੈਸਡ',

  myTicketsTitle: 'ਮੇਰੀਆਂ ਸਹਾਇਤਾ ਟਿਕਟਾਂ',
  myTicketsSubtitle: 'ਤੁਹਾਡੀਆਂ ਸ਼ਿਕਾਇਤਾਂ ਅਤੇ ਪੁੱਛਗਿੱਛ ਦੀ ਲਾਈਵ ਸਥਿਤੀ',
  refreshTickets: 'ਰੀਫ੍ਰੈਸ਼ ਕਰੋ',
  loadingTickets: 'ਟਿਕਟਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...',
  noTicketsFound: 'ਕੋਈ ਸਹਾਇਤਾ ਟਿਕਟ ਨਹੀਂ ਮਿਲੀ',
  noTicketsDesc: 'ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛਣ ਜਾਂ ਸਮੱਸਿਆ ਦੱਸਣ ਲਈ AI ਅਸਿਸਟੈਂਟ ਟੈਬ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
  resolutionNote: 'ਹੱਲ ਨੋਟ:',
  assignedTo: 'ਜ਼ਿੰਮੇਵਾਰ ਮਾਹਿਰ:',
  category: 'ਸ਼੍ਰੇਣੀ:',
  language: 'ਭਾਸ਼ਾ:',
};

// Haryanvi Support Dict
const hr: SupportTranslations = {
  headerTitle: 'किसान साथी AI सहायता',
  headerBadge: 'असली AI + खेती विशेषज्ञ',
  headerSubtitle: 'तुरंत खेती सहायता, मंडी भाव अर एस्क्रो पेमेंट',
  voiceReplyEnabled: 'आवाज़ म जवाब चालू सै',
  voiceReplyDisabled: 'आवाज़ म जवाब बंद सै',
  closeAssistant: 'सहायक बंद करो',

  tabAiChat: 'AI बातचीत',
  tabPhone: 'फोन हेल्पलाइन',
  tabEmail: 'ईमेल सपोर्ट',
  tabTickets: 'म्हारी टिकटें',

  languageLabel: 'भाषा:',
  langHindi: '🇮🇳 हिंदी',
  langEnglish: '🇬🇧 English',

  welcomeMessage:
    'राम-राम! मैं किसान साथी AI सहायक सूँ। फसल लिस्टिंग, सरकारी मंडी भाव, फोटो AI ग्रेडिंग, पेमेंट या डिलीवरी में थारी के मदद करूँ?',
  quickActionCropListing: '🌾 फसल लिस्टिंग',
  quickActionMandiRates: '📊 मंडी भाव',
  quickActionOrderTracking: '🚚 आर्डर ट्रैकिंग',
  quickActionPaymentEscrow: '💰 पेमेंट अर एस्क्रो',
  quickActionPhotoGrading: '📸 फोटो ग्रेडिंग',

  inputPlaceholder: 'अपणी समस्या बताओ (उदा. कनक का भाव, पेमेंट नहीं आई)...',
  listeningActive: 'सुण रहे सां... इब बोलो',
  clickToSpeak: 'बोल कै पूछो (वॉयस)',
  sendMessage: 'संदेश भेजो',
  speechNotSupported: 'थारे ब्राउज़र म वॉयस कोन्या चालै।',
  securityNotice: 'सारे सौदे अर डेटा किसान साथी एस्क्रो सुरक्षित सैं।',
  tollFreeHelpline: 'फ्री हेल्पलाइन: 1800-KISAN-SETU (1800-547-2673)',

  aiAnalyzing: 'जांच कर रहे सां...',
  activeTicketBanner: 'चालू सपोर्ट टिकट:',
  escalatedToSeniorDesk: 'बड़ी टीम पै भेजी गी',
  viewTicketDetails: 'टिकट का हाल देखो',
  readOutAudio: 'बोल कै सुणो',

  wasProblemSolved: 'के थारी समस्या निपट गी?',
  yesProblemSolved: 'हां, निपट गी',
  noProblemStillHaving: 'ना, इब भी दिक्कत सै',
  resolutionThankYou: 'थारे सुझाव खातर धन्यवाद! किसान साथी हमेशा थारे साथ सै।',
  escalationNotice: (ticketId: string) =>
    `मुद्दा बड़ी टीम पै भेज दिया सै। टिकट नंबर: ${ticketId}। जल्दी निपटारा होगा।`,
  ratingQuestion: 'म्हारी AI सहायता नै स्टार द्यो:',
  ratingSubmitted: 'रेटिंग दर्ज हो गी। धन्यवाद!',
  callHelplineAction: 'हेल्पलाइन मिलाओ',

  serverErrorFallback:
    'AI सहायता सर्वर सूं संपर्क कोन्या हो पा रह्या। थाम फ्री हेल्पलाइन पै फोन कर सको सो।',
  createTicketAction: 'सपोर्ट टिकट बणाओ',
  ticketCreatedSystemMsg: (ticketId: string) =>
    `सपोर्ट टिकट बणगी: ${ticketId}। 'म्हारी टिकटें' म जाकै हाल देख सको सो।`,

  helplineTitle: 'किसान साथी सरकारी हेल्पलाइन',
  helplineBadge: 'फ्री खेती सहायता डेस्क',
  tollFreeDirectDial: 'सीधा फोन नंबर',
  helplineHours: 'हफ्ते म 6 दिन चालू (सवेरे 8:00 बजे तै सांझ 8:00 बजे ताईं)',
  simulatorTitle: 'हेल्पलाइन सिम्युलेटर',
  simulatorBadge: 'वॉयस इंजन',
  simulatorDesc: 'देखो कि फोन पै बात की जांच किकण होवै सै।',
  callerQueryLabel: 'फोन करण आळे का सवाल',
  callerQueryPlaceholder: 'सवाल लिखो...',
  runVoiceEngine: 'वॉयस कॉल चलाओ',
  samplePaymentQuery: 'पेमेंट का सवाल',
  sampleMandiQuery: 'मंडी भाव का सवाल',
  helplineSpokenResponse: 'हेल्पलाइन का जवाब:',
  playAudio: 'आवाज़ सुणो',
  ticketGenerated: 'टिकट बणगी:',

  emailTitle: 'किसान साथी ईमेल सपोर्ट',
  emailBadge: 'ऑटो जांच डेस्क',
  yourEmailLabel: 'थारा ईमेल',
  subjectLabel: 'मुद्दा / विषय',
  subjectPlaceholder: 'उदा. कनक की लिस्टिंग या पेमेंट',
  messageBodyLabel: 'पूरी बात',
  messageBodyPlaceholder: 'अपणी समस्या विस्तार तै लिखो...',
  sendEmailBtn: 'ईमेल भेजो',
  sendingEmailBtn: 'भेज रहे सां...',
  emailTicketLogged: 'टिकट दर्ज हुई:',
  autoProcessedBadge: 'हाल: जांच पूरी',

  myTicketsTitle: 'म्हारी सपोर्ट टिकटें',
  myTicketsSubtitle: 'थारी शिकायतां का ताज़ा हाल',
  refreshTickets: 'ताज़ा करो',
  loadingTickets: 'टिकटें लोड होवै सैं...',
  noTicketsFound: 'कोई टिकट कोन्या मिली',
  noTicketsDesc: 'कोई भी सवाल पूछण खातर AI बातचीत टैब पै जावो।',
  resolutionNote: 'समाधान नोट:',
  assignedTo: 'अधिकारी:',
  category: 'श्रेणी:',
  language: 'भाषा:',
};

// Telugu Support Dict
const te: SupportTranslations = {
  headerTitle: 'కిసాన్‌సేతు AI సహాయం',
  headerBadge: 'అసలైన AI + వ్యవసాయ నిపుణులు',
  headerSubtitle: 'తక్షణ వ్యవసాయ సహాయం, మార్కెట్ ధరలు మరియు ఎస్క్రో చెల్లింపులు',
  voiceReplyEnabled: 'వాయిస్ సమాధానం ప్రారంభించబడింది',
  voiceReplyDisabled: 'వాయిస్ సమాధానం ఆపివేయబడింది',
  closeAssistant: 'సహాయకుడిని మూసివేయి',

  tabAiChat: 'AI సంభాషణ',
  tabPhone: 'ఫోన్ హెల్ప్‌లైన్',
  tabEmail: 'ఈమెయిల్ సహాయం',
  tabTickets: 'నా టిక్కెట్లు',

  languageLabel: 'భాష:',
  langHindi: '🇮🇳 हिंदी',
  langEnglish: '🇬🇧 English',

  welcomeMessage:
    'నమస్తే! నేను కిసాన్‌సేతు AI సహాయకుడిని. పంటల జాబితా, మార్కెట్ ధరలు, AI ఫోటో గ్రేడింగ్, చెల్లింపులు లేదా డెలివరీలో నేను మీకు ఎలా సహాయపడగలను?',
  quickActionCropListing: '🌾 పంట జాబితా',
  quickActionMandiRates: '📊 మార్కెట్ ధరలు',
  quickActionOrderTracking: '🚚 ఆర్డర్ ట్రాకింగ్',
  quickActionPaymentEscrow: '💰 చెల్లింపు & ఎస్క్రో',
  quickActionPhotoGrading: '📸 ఫోటో క్వాలిటీ గ్రేడింగ్',

  inputPlaceholder: 'మీ సమస్యను వివరించండి (ఉదా. గోధుమ ధర, చెల్లింపు రాలేదు)...',
  listeningActive: 'వింటున్నాము... ఇప్పుడు మాట్లాడండి',
  clickToSpeak: 'మాట్లాడటానికి నొక్కండి',
  sendMessage: 'సందేశం పంపు',
  speechNotSupported: 'మీ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ అందుబాటులో లేదు.',
  securityNotice: 'అన్ని లావాదేవీలు కిసాన్‌సేతు ఎస్క్రో ద్వారా సురక్షితం.',
  tollFreeHelpline: 'టోల్ ఫ్రీ హెల్ప్‌లైన్: 1800-KISAN-SETU (1800-547-2673)',

  aiAnalyzing: 'విశ్లేషిస్తున్నాము...',
  activeTicketBanner: 'క్రియాశీల మద్దతు టికెట్:',
  escalatedToSeniorDesk: 'సీనియర్ డెస్క్‌కు బదిలీ చేయబడింది',
  viewTicketDetails: 'టికెట్ వివరాలు చూడండి',
  readOutAudio: 'వినండి',

  wasProblemSolved: 'మీ సమస్య పరిష్కారం అయిందా?',
  yesProblemSolved: 'అవును, పరిష్కారమైంది',
  noProblemStillHaving: 'కాదు, ఇంకా సమస్య ఉంది',
  resolutionThankYou: 'మీ అభిప్రాయానికి ధన్యవాదాలు! కిసాన్‌సేతు ఎల్లప్పుడూ మీతో ఉంటుంది.',
  escalationNotice: (ticketId: string) =>
    `సమస్య సీనియర్ నిపుణులకు బదిలీ చేయబడింది. టికెట్ ID: ${ticketId}। త్వరలో పరిష్కారం అందుతుంది.`,
  ratingQuestion: 'దయచేసి మా AI సేవలను రేట్ చేయండి:',
  ratingSubmitted: 'రేటింగ్ నమోదైంది. ధన్యవాదాలు!',
  callHelplineAction: 'హెల్ప్‌లైన్‌కు కాల్ చేయండి',

  serverErrorFallback:
    'AI సర్వర్‌కు కనెక్ట్ కాలేకపోయాము. మీరు మా టోల్-ఫ్రీ హెల్ప్‌లైన్‌కు కాల్ చేయవచ్చు లేదా టికెట్ సృష్టించవచ్చు.',
  createTicketAction: 'మద్దతు టికెట్ సృష్టించండి',
  ticketCreatedSystemMsg: (ticketId: string) =>
    `మద్దతు టికెట్ సృష్టించబడింది: ${ticketId}. 'నా టిక్కెట్లు' ట్యాబ్‌లో దీని స్థితిని చూడవచ్చు.`,

  helplineTitle: 'కిసాన్‌సేతు అధికారిక హెల్ప్‌లైన్',
  helplineBadge: 'టోల్-ఫ్రీ వ్యవసాయ సహాయక డెస్క్',
  tollFreeDirectDial: 'డైరెక్ట్ డయల్ నంబర్',
  helplineHours: 'వారానికి 6 రోజులు అందుబాటులో ఉంటుంది (ఉదయం 8:00 – రాత్రి 8:00 వరకు)',
  simulatorTitle: 'ఇంటరాక్టివ్ హెల్ప్‌లైన్ సిమ్యులేటర్',
  simulatorBadge: 'వాయిస్ ఇంజిన్',
  simulatorDesc: 'కాల్స్ ఎలా ప్రాసెస్ చేయబడతాయో మరియు టిక్కెట్లు ఎలా సృష్టించబడతాయో చూడండి.',
  callerQueryLabel: 'కాలర్ ప్రశ్న',
  callerQueryPlaceholder: 'ప్రశ్న నమోదు చేయండి...',
  runVoiceEngine: 'వాయిస్ కాల్ రన్ చేయండి',
  samplePaymentQuery: 'చెల్లింపు నమూనా ప్రశ్న',
  sampleMandiQuery: 'మార్కెట్ ధర నమూనా ప్రశ్న',
  helplineSpokenResponse: 'హెల్ప్‌లైన్ సమాధానం:',
  playAudio: 'ఆడియో వినండి',
  ticketGenerated: 'టికెట్ సృష్టించబడింది:',

  emailTitle: 'కిసాన్‌సేతు ఈమెయిల్ సహాయం',
  emailBadge: 'స్వయంచాలక విశ్లేషణ డెస్క్',
  yourEmailLabel: 'మీ ఈమెయిల్',
  subjectLabel: 'విషయం',
  subjectPlaceholder: 'ఉదా. పంట జాబితా లేదా చెల్లింపు సమస్య',
  messageBodyLabel: 'సందేశం',
  messageBodyPlaceholder: 'మీ సమస్యను వివరంగా రాయండి...',
  sendEmailBtn: 'ఈమెయిల్ పంపండి',
  sendingEmailBtn: 'పంపుతున్నాము...',
  emailTicketLogged: 'టికెట్ నమోదైంది:',
  autoProcessedBadge: 'స్థితి: ఆటో ప్రాసెస్ చేయబడింది',

  myTicketsTitle: 'నా మద్దతు టిక్కెట్లు',
  myTicketsSubtitle: 'మీ విచారణలు మరియు సమస్యల తాజా స్థితి',
  refreshTickets: 'రిఫ్రెష్ చేయండి',
  loadingTickets: 'టిక్కెట్లు లోడ్ అవుతున్నాయి...',
  noTicketsFound: 'ఎలాంటి టిక్కెట్లు కనుగొనబడలేదు',
  noTicketsDesc: 'సందేహాలు అడగడానికి లేదా సమస్యను నివేదించడానికి AI చాట్ ట్యాబ్ ఉపయోగించండి.',
  resolutionNote: 'పరిష్కార గమనిక:',
  assignedTo: 'కేటాయించిన అధికారి:',
  category: 'వర్గం:',
  language: 'భాష:',
};

// Tamil Support Dict
const ta: SupportTranslations = {
  headerTitle: 'கிசான்சேது AI உதவி',
  headerBadge: 'உண்மையான AI + விவசாய நிபுணர்கள்',
  headerSubtitle: 'உடனடி விவசாய உதவி, மண்டி விலைகள் மற்றும் எஸ்க்ரோ பணம்',
  voiceReplyEnabled: 'குரல் பதில் இயக்கப்பட்டது',
  voiceReplyDisabled: 'குரல் பதில் முடக்கப்பட்டது',
  closeAssistant: 'உதவியாளரை மூடு',

  tabAiChat: 'AI உரையாடல்',
  tabPhone: 'தொலைபேசி உதவி',
  tabEmail: 'மின்னஞ்சல் உதவி',
  tabTickets: 'என் டிக்கெட்டுகள்',

  languageLabel: 'மொழி:',
  langHindi: '🇮🇳 हिंदी',
  langEnglish: '🇬🇧 English',

  welcomeMessage:
    'வணக்கம்! நான் கிசான்சேது AI உதவி உதவியாளர். பயிர் பட்டியல், மண்டி விலை, புகைப்பட கிரேடிங், பணம் செலுத்துதல் அல்லது டெலிவரியில் நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
  quickActionCropListing: '🌾 பயிர் பட்டியல்',
  quickActionMandiRates: '📊 மண்டி விலை',
  quickActionOrderTracking: '🚚 ஆர்டர் கண்காணிப்பு',
  quickActionPaymentEscrow: '💰 பணம் & எஸ்க்ரோ',
  quickActionPhotoGrading: '📸 புகைப்பட கிரேடிங்',

  inputPlaceholder: 'உங்கள் சிக்கலை விவரிக்கவும் (எ.கா. கோதுமை விலை, பணம் வரவில்லை)...',
  listeningActive: 'கேட்கிறது... இப்போது பேசுங்கள்',
  clickToSpeak: 'பேச கிளிக் செய்யவும்',
  sendMessage: 'செய்தி அனுப்பு',
  speechNotSupported: 'உங்கள் உலாவியில் குரல் அறிதல் கிடைக்கவில்லை.',
  securityNotice: 'அனைத்து பரிவர்த்தனைகளும் கிசான்சேது எஸ்க்ரோ பாதுகாக்கப்பட்டவை.',
  tollFreeHelpline: 'இலவச உதவி எண்: 1800-KISAN-SETU (1800-547-2673)',

  aiAnalyzing: 'பகுப்பாய்வு செய்கிறது...',
  activeTicketBanner: 'செயலில் உள்ள ஆதரவு டிக்கெட்:',
  escalatedToSeniorDesk: 'உயர் அதிகாரிக்கு அனுப்பப்பட்டது',
  viewTicketDetails: 'டிக்கெட் விவரங்களைக் காண்க',
  readOutAudio: 'கேட்கவும்',

  wasProblemSolved: 'உங்கள் பிரச்சனை தீர்க்கப்பட்டதா?',
  yesProblemSolved: 'ஆம், தீர்க்கப்பட்டது',
  noProblemStillHaving: 'இல்லை, இன்னும் சிக்கல் உள்ளது',
  resolutionThankYou: 'உங்கள் கருத்துக்கு நன்றி! கிசான்சேது எப்போதும் உங்களுடன் உள்ளது.',
  escalationNotice: (ticketId: string) =>
    `சிக்கல் மூத்த நிபுணரிடம் அனுப்பப்பட்டது. டிக்கெட் எண்: ${ticketId}। விரைவில் தீர்வு கிடைக்கும்.`,
  ratingQuestion: 'எங்கள் AI உதவியை மதிப்பிடுங்கள்:',
  ratingSubmitted: 'மதிப்பீடு பதிவானது. நன்றி!',
  callHelplineAction: 'உதவி எண்ணை அழைக்கவும்',

  serverErrorFallback:
    'AI சேவையகத்தை இணைக்க முடியவில்லை. எங்கள் இலவச உதவி எண்ணை அழைக்கலாம் அல்லது டிக்கெட் உருவாக்கலாம்.',
  createTicketAction: 'ஆதரவு டிக்கெட் உருவாக்கவும்',
  ticketCreatedSystemMsg: (ticketId: string) =>
    `ஆதரவு டிக்கெட் உருவாக்கப்பட்டது: ${ticketId}। 'என் டிக்கெட்டுகள்' பிரிவில் நிலையை அறியலாம்.`,

  helplineTitle: 'கிசான்சேது அதிகாரப்பூர்வ உதவி எண்',
  helplineBadge: 'கட்டணமில்லா விவசாய உதவி மையம்',
  tollFreeDirectDial: 'நேரடி அழைப்பு எண்',
  helplineHours: 'வாரத்தில் 6 நாட்கள் கிடைக்கும் (காலை 8:00 – இரவு 8:00 வரை)',
  simulatorTitle: 'உதவி எண் சிமுலேட்டர்',
  simulatorBadge: 'குரல் இயந்திரம்',
  simulatorDesc: 'அழைப்புகள் எவ்வாறு கையாளப்படுகின்றன மற்றும் டிக்கெட்டுகள் எவ்வாறு உருவாக்கப்படுகின்றன என்பதைப் பாருங்கள்.',
  callerQueryLabel: 'அழைப்பாளர் கேள்வி',
  callerQueryPlaceholder: 'கேள்வியை உள்ளிடவும்...',
  runVoiceEngine: 'குரல் அழைப்பை இயக்கவும்',
  samplePaymentQuery: 'பணம் பற்றிய மாதிரி கேள்வி',
  sampleMandiQuery: 'மண்டி விலை மாதிரி கேள்வி',
  helplineSpokenResponse: 'உதவி மைய பதில்:',
  playAudio: 'ஆடியோவை இயக்கவும்',
  ticketGenerated: 'டிக்கெட் உருவாக்கப்பட்டது:',

  emailTitle: 'கிசான்சேது மின்னஞ்சல் உதவி மையம்',
  emailBadge: 'தானியங்கி பகுப்பாய்வு மையம்',
  yourEmailLabel: 'உங்கள் மின்னஞ்சல்',
  subjectLabel: 'பொருள்',
  subjectPlaceholder: 'எ.கா. பயிர் பட்டியல் அல்லது பணம் பற்றிய சிக்கல்',
  messageBodyLabel: 'செய்தி',
  messageBodyPlaceholder: 'உங்கள் சிக்கலை விரிவாக எழுதவும்...',
  sendEmailBtn: 'மின்னஞ்சல் அனுப்புக',
  sendingEmailBtn: 'அனுப்பப்படுகிறது...',
  emailTicketLogged: 'டிக்கெட் பதிவானது:',
  autoProcessedBadge: 'நிலை: தானாக செயலாக்கப்பட்டது',

  myTicketsTitle: 'என் ஆதரவு டிக்கெட்டுகள்',
  myTicketsSubtitle: 'உங்கள் புகார்கள் மற்றும் விசாரணைகளின் நேரலை நிலை',
  refreshTickets: 'புதுப்பிக்கவும்',
  loadingTickets: 'டிக்கெட்டுகள் ஏற்றப்படுகின்றன...',
  noTicketsFound: 'ஆதரவு டிக்கெட்டுகள் எதுவும் கிடைக்கவில்லை',
  noTicketsDesc: 'கேள்விகள் கேட்க அல்லது சிக்கலைப் புகாரளிக்க AI அரட்டைப் பிரிவைப் பயன்படுத்தவும்.',
  resolutionNote: 'தீர்வு குறிப்பு:',
  assignedTo: 'நியமிக்கப்பட்ட அதிகாரி:',
  category: 'பிரிவு:',
  language: 'மொழி:',
};

export const SUPPORT_I18N: Record<LanguageCode, SupportTranslations> = {
  hi,
  en,
  pa,
  hr,
  te,
  ta,
};

/**
 * Gets a localized support string from the centralized dictionary.
 */
export function getSupportText<K extends keyof SupportTranslations>(
  key: K,
  lang: LanguageCode = 'hi'
): SupportTranslations[K] {
  const selectedDict = SUPPORT_I18N[lang] || SUPPORT_I18N.hi;
  return selectedDict[key] ?? SUPPORT_I18N.hi[key];
}

/**
 * Detects default user language preference based on browser settings or stored value
 */
export function detectInitialSupportLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem('kisansetu_support_lang') || localStorage.getItem('kisansetu_language');
    if (saved && (saved === 'hi' || saved === 'en' || saved === 'pa' || saved === 'hr' || saved === 'te' || saved === 'ta')) {
      return saved as LanguageCode;
    }

    if (typeof navigator !== 'undefined') {
      const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
      if (browserLang.startsWith('pa')) return 'pa';
      if (browserLang.startsWith('te')) return 'te';
      if (browserLang.startsWith('ta')) return 'ta';
      if (browserLang.startsWith('en')) return 'en';
      if (browserLang.startsWith('hi') || browserLang.includes('in')) {
        return 'hi';
      }
    }
  } catch {
    // ignore
  }

  return 'hi'; // Default to Hindi as the primary language
}
