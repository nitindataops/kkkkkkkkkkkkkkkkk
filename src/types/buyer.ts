export interface BuyerProfile {
  id: string;
  name: string;
  businessName: string;
  businessType: 'Retailer / Supermarket' | 'Food Processor / Mill' | 'Wholesaler / Trader' | 'Restaurant / Hotel' | 'Institutional Buyer';
  mobile: string;
  contactNumber?: string;
  email: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
  deliveryAddress: string;
  gstinMasked?: string;
  panMasked?: string;
  verified: boolean;
  memberSince: string;
  preferredCrops: string[];
  isDemoProfile?: boolean;
}

export interface BuyerCartItem {
  listingId: string;
  productId?: string;
  crop: string;
  variety: string;
  grade: 'PREMIUM' | 'STANDARD' | 'UNVERIFIED' | 'A+' | 'A' | 'B' | 'C' | string;
  qualityClassification?: 'PREMIUM' | 'STANDARD' | 'UNVERIFIED';
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  farmerVerified: boolean;
  pricePerKg: number;
  quantityKg: number;
  availableQuantityKg: number;
  imageUrl: string;
  minOrderQtyKg?: number;
  batchId?: string;
}

export interface BuyerOrder {
  id: string;
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  orderNumber?: string;
  orderDate?: string;
  createdAt?: string;
  crop?: string;
  variety?: string;
  grade?: string;
  farmerId?: string;
  farmerName?: string;
  farmerPhone?: string;
  quantityKg?: number;
  pricePerKg?: number;
  batchId?: string;
  productId?: string;
  listingId?: string;
  items?: {
    listingId: string;
    crop: string;
    variety: string;
    grade: string;
    farmerId: string;
    farmerName: string;
    farmerPhone?: string;
    quantityKg: number;
    pricePerKg: number;
    totalAmount: number;
    imageUrl: string;
  }[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'In Transit' | 'Delivered' | 'Cancelled' | 'pending' | 'confirmed' | 'in_transit' | 'delivered';
  deliveryAddress: string;
  paymentMethod?: 'Mandi Escrow' | 'UPI' | 'NEFT / RTGS' | 'Cash on Delivery';
  paymentStatus?: 'Pending Escrow' | 'In Escrow' | 'Released to Farmer';
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string | null;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  dispatchInfo?: {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    currentLocation: string;
    status?: string;
  };
  notes?: string;
}

export interface BuyerRequirement {
  id: string;
  requirementNumber?: string;
  crop?: string;
  cropName?: string;
  variety: string;
  grade?: 'A+' | 'A' | 'B' | 'Any' | string;
  requiredQuantityKg?: number;
  quantityRequired?: number;
  unit?: string;
  maxPricePerKg?: number;
  maxTargetPricePerUnit?: number;
  preferredLocation?: string;
  deliveryLocation?: string;
  maxDistanceKm?: number;
  deliveryDate?: string;
  targetDeliveryDate?: string;
  state?: string;
  district?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'Matching' | 'Pooled & Matched' | 'Fulfilled' | 'Closed' | 'ACTIVE' | string;
  matchedFarmersCount?: number;
  matchedQuantityKg?: number;
  matchScore?: number;
  matchedFarmers?: {
    farmerId: string;
    farmerName: string;
    location: string;
    distanceKm: number;
    availableQuantityKg: number;
    availableQtyKg?: number;
    pricePerKg: number;
    offeredPrice?: number;
    grade?: string;
    verified?: boolean;
    phone?: string;
    similarityScore?: number;
  }[];
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerCompany?: string;
  responsesCount?: number;
  userId?: string;
  quantityKg?: number;
  targetPrice?: number;
  specialInstructions?: string;
  allowFarmerPooling?: boolean;
}

export interface FutureDemandPost {
  id: string;
  crop: string;
  variety: string;
  expectedQuantityKg: number;
  totalQuantityKg?: number;
  expectedSeason: string;
  expectedProcurementMonth?: string;
  preferredQuality: string;
  preferredRegion: string;
  deliveryLocation?: string;
  targetPricePerKg?: number;
  postedDate: string;
  farmerInterestsCount: number;
  status: 'Active' | 'Fulfilled' | 'Closed';
  notes?: string;
}

export interface PriceLockProposal {
  id: string;
  crop: string;
  variety: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  quantityKg: number;
  lockedPricePerKg: number;
  agreedPricePerKg?: number;
  currentMandiRate: number;
  harvestWindow: string;
  expectedDeliveryDate: string;
  validTill?: string;
  terms?: string;
  status: 'Proposed by Buyer' | 'Accepted by Farmer' | 'Countered' | 'Active Lock' | 'Completed';
  contractReference: string;
  createdAt: string;
  notes?: string;
}

export interface BatchTraceabilityInfo {
  batchId: string;
  crop: string;
  variety: string;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  harvestDate: string;
  grade: string;
  quantityKg: number;
  qrCodeData: string;
  soilType?: string;
  irrigationType?: string;
  moistureContent?: string;
  storageFacility?: string;
  produceType?: 'raw' | 'processed';
  processingRecord?: {
    processingId: string;
    processingType: string;
    sourceCropName: string;
    sourceBatchId: string;
    inputQuantityKg: number;
    outputQuantityKg: number;
    processingYieldPercent: number;
    processingLossKg: number;
    facilityName?: string;
    processingDate?: string;
  };
  timeline: {
    stage: 'Crop Registered' | 'Harvested' | 'Quality Checked' | 'Packed' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Post-Harvest Processing';
    date: string;
    location: string;
    verifiedBy: string;
    completed: boolean;
    notes?: string;
    details?: string;
  }[];
}

export interface PriceWatchItem {
  id: string;
  crop: string;
  variety: string;
  currentPrice: number;
  targetPrice: number;
  alertActive: boolean;
  createdAt: string;
  nearestMandi: string;
}

export interface BuyerMessageThread {
  id: string;
  threadId?: string;
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerLocation?: string;
  farmerAvatar?: string;
  listingId?: string;
  cropContext?: string;
  cropName?: string;
  variety?: string;
  status?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageTime?: string;
  unread?: boolean;
  messages: {
    id: string;
    sender: 'buyer' | 'farmer';
    text: string;
    time?: string;
    timestamp?: string;
  }[];
  createdAt?: string;
}

export interface MarketplaceProduct {
  id: string;
  crop: string;
  variety: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Pulses' | 'Oilseeds';
  grade: 'PREMIUM' | 'STANDARD' | 'UNVERIFIED' | 'A+' | 'A' | 'B' | 'C' | string;
  qualityClassification?: 'PREMIUM' | 'STANDARD' | 'UNVERIFIED';
  pricePerKg: number;
  availableQuantityKg: number;
  quantityKg?: number;
  minOrderQtyKg: number;
  location: string;
  district: string;
  state: string;
  distanceKm?: number;
  farmerId: string;
  farmerName: string;
  farmerVerified: boolean;
  farmerRating?: number; // only if real
  farmerPhone?: string;
  nearestMandi?: string;
  completedDeals?: number;
  harvestDate?: string;
  createdAt?: string;
  createdTimestamp?: number;
  storageType?: string;
  moistureContent?: string;
  imageUrl: string;
  galleryImages: string[];
  description: string;
  isTimeSensitive?: boolean;
  discountReason?: string;
  expiryDays?: number;
  purchaseOpportunityScore?: number;
  smartBuySignal?: 'Favorable' | 'Neutral' | 'Wait';
  smartBuyRecommendation?: string;
  batchId?: string;
  produceType?: 'raw' | 'processed';
  processingType?: string;
  sourceCropName?: string;
  sourceCropVariety?: string;
  sourceBatchId?: string;
  processingDate?: string;
  processingCost?: number;
  processingYield?: number;
  processingFacility?: string;
}

export type BuyerTab =
  | 'home'
  | 'browse'
  | 'procurement'
  | 'orders'
  | 'messages'
  | 'cart'
  | 'profile'
  | 'smart-buy'
  | 'support';
