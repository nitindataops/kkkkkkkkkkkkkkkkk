import {
  getSupabaseClient,
  isSupabaseConfigured,
  isSupabaseSchemaReady,
  setSupabaseSchemaReady,
  isSchemaMissingError,
} from './supabaseClient';
import type { UserRecord, AuthSession, AdminAuditLog } from '../authService';
import type { FarmerProfile, CropListing } from '../../types/farmer';
import type { BuyerProfile, BuyerOrder, BuyerRequirement, BuyerMessageThread } from '../../types/buyer';
import type { FarmerProperty, FarmerLandRecord } from '../../types/landVerification';
import type { ProcessingRecord } from '../../types/processing';
import type { SupportTicket } from '../../types/support';

/**
 * Checks if Supabase is configured and schema tables are confirmed created.
 */
function isReady(): boolean {
  return isSupabaseConfigured() && isSupabaseSchemaReady();
}

/**
 * Safely parses any date string (ISO, "October 2024", etc.) into a valid ISO-8601 string for PostgreSQL TIMESTAMPTZ
 */
export function toIsoDate(val: any, fallback?: string): string {
  if (!val) return fallback || new Date().toISOString();
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {}
  return fallback || new Date().toISOString();
}

/**
 * Maps snake_case DB row to UserRecord
 */
function rowToUserRecord(row: any): UserRecord {
  return {
    id: row.id,
    role: row.role,
    identifier: row.identifier,
    mobileNumber: row.mobile_number,
    mobileVerified: Boolean(row.mobile_verified),
    mobileVerifiedAt: row.mobile_verified_at || '',
    email: row.email || undefined,
    passwordSalt: row.password_salt,
    passwordHash: row.password_hash,
    status: row.status || 'active',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Maps snake_case DB row to CropListing
 */
function rowToCropListing(row: any): CropListing {
  return {
    id: row.id,
    farmerId: row.farmer_id,
    name: row.name,
    cropName: row.crop_name || row.name,
    variety: row.variety,
    category: row.category,
    quantityKg: Number(row.quantity_kg || 0),
    quantity: row.quantity || `${row.quantity_kg || 0} kg`,
    price: row.price ? Number(row.price) : Number(row.expected_price || 0),
    expectedPrice: Number(row.expected_price || 0),
    priceUnit: row.price_unit || '₹/kg',
    pricingType: row.pricing_type,
    harvestDate: row.harvest_date,
    processingYieldPercent: row.processing_yield_percent ? Number(row.processing_yield_percent) : undefined,
    grade: row.grade || 'STANDARD',
    qualityClassification: row.quality_classification || 'STANDARD',
    pricingTypeTier: row.pricing_type_tier || 'STANDARD',
    isManualClassification: Boolean(row.is_manual_classification),
    capturedViaCamera: Boolean(row.captured_via_camera),
    location: row.location,
    district: row.district,
    state: row.state || 'Uttar Pradesh',
    nearestMandi: row.nearest_mandi,
    currentMandiPrice: Number(row.current_mandi_price || 0),
    status: row.status || 'Available',
    imageUrl: row.image_url || '',
    images: Array.isArray(row.images) ? row.images : row.image_url ? [row.image_url] : [],
    organicCertified: Boolean(row.organic_certified),
    upBhulekhVerified: row.up_bhulekh_verified !== undefined ? Boolean(row.up_bhulekh_verified) : true,
    qualityScore: row.quality_score ? Number(row.quality_score) : 88.0,
    moisturePercent: row.moisture_percent ? Number(row.moisture_percent) : undefined,
    grainUniformityPercent: row.grain_uniformity_percent ? Number(row.grain_uniformity_percent) : undefined,
    description: row.description || '',
    batchId: row.batch_id,
    coordinates: row.coordinates || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    ...(row.extra_data || {}),
  };
}

/**
 * Maps snake_case DB row to BuyerOrder
 */
function rowToBuyerOrder(row: any): BuyerOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name,
    farmerId: row.farmer_id,
    farmerName: row.farmer_name,
    crop: row.crop,
    variety: row.variety,
    grade: row.grade,
    quantityKg: Number(row.quantity_kg || 0),
    pricePerKg: Number(row.price_per_kg || 0),
    totalAmount: Number(row.total_amount || 0),
    status: row.status,
    deliveryAddress: row.delivery_address,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    trackingNumber: row.tracking_number,
    vehicleNumber: row.vehicle_number,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    items: Array.isArray(row.items) ? row.items : [],
    orderDate: row.order_date || row.created_at,
    createdAt: row.created_at,
    estimatedDelivery: row.estimated_delivery,
    deliveredAt: row.delivered_at,
  };
}

// ============================================================================
// REPOSITORY METHODS (EXPOSED FOR KISANSETU PERSISTENCE)
// ============================================================================

export const SupabaseRepo = {
  // --------------------------------------------------------------------------
  // USERS & PROFILES
  // --------------------------------------------------------------------------
  async getAllUsers(): Promise<UserRecord[]> {
    if (!isReady()) return [];
    const client = getSupabaseClient();
    if (!client) return [];

    const { data: userRows, error } = await client.from('users').select('*');
    if (error) {
      if (isSchemaMissingError(error)) {
        setSupabaseSchemaReady(false);
        return [];
      }
      console.warn('[SupabaseRepo] Warning fetching users:', error.message);
      return [];
    }
    if (!userRows) return [];

    // Fetch associated farmer and buyer profiles
    const { data: farmerProfiles, error: fErr } = await client.from('farmer_profiles').select('*');
    if (fErr && isSchemaMissingError(fErr)) setSupabaseSchemaReady(false);
    const { data: buyerProfiles, error: bErr } = await client.from('buyer_profiles').select('*');
    if (bErr && isSchemaMissingError(bErr)) setSupabaseSchemaReady(false);

    const farmerMap = new Map<string, any>();
    if (farmerProfiles) {
      for (const fp of farmerProfiles) {
        farmerMap.set(fp.user_id, fp);
      }
    }

    const buyerMap = new Map<string, any>();
    if (buyerProfiles) {
      for (const bp of buyerProfiles) {
        buyerMap.set(bp.user_id, bp);
      }
    }

    return userRows.map((row) => {
      const u = rowToUserRecord(row);
      const fp = farmerMap.get(row.id);
      if (fp) {
        u.farmerProfile = {
          id: fp.user_id,
          farmerId: fp.farmer_id,
          name: fp.full_name,
          fatherName: fp.father_name,
          mobile: fp.mobile || row.mobile_number,
          email: fp.email || row.email,
          address: fp.address || '',
          state: fp.state || 'Uttar Pradesh',
          district: fp.district,
          tehsil: fp.tehsil,
          village: fp.village,
          pincode: fp.pin_code,
          landAreaAcres: Number(fp.land_area_acres || 0),
          landType: fp.land_type || 'Irrigated Fertile',
          soilType: fp.soil_type,
          irrigationSource: fp.irrigation_source,
          primaryCrops: Array.isArray(fp.primary_crops) ? fp.primary_crops : ['Wheat', 'Rice / Paddy'],
          aadhaarMasked: fp.aadhaar_masked || 'XXXX-XXXX-8492',
          eKycStatus: fp.e_kyc_status || 'VERIFIED ✓',
          kccStatus: fp.kcc_status || 'Active',
          soilHealthStatus: fp.soil_health_status || 'Optimal (NPK Balanced)',
          memberSince: fp.member_since || row.created_at,
          bankDetails: fp.bank_details,
          bankAccountVerified: Boolean(fp.bank_account_verified),
          aadhaarVerified: Boolean(fp.aadhaar_verified),
          aadhaarNumberMasked: fp.aadhaar_number_masked,
          aadhaarFrontUrl: fp.aadhaar_front_url,
          aadhaarBackUrl: fp.aadhaar_back_url,
          upBhulekhStatus: fp.up_bhulekh_status || 'Verified',
          isApprovedByAdmin: fp.is_approved_by_admin !== undefined ? Boolean(fp.is_approved_by_admin) : true,
          approvedAt: fp.approved_at,
          farmerRegistryNumber: fp.farmer_registry_id,
          farmerRegistryDocumentUrl: fp.farmer_registry_document_url,
          farmerRegistryFileName: fp.farmer_registry_file_name,
          farmerRegistryOcrStatus: fp.farmer_registry_ocr_status,
          farmerRegistryVerificationStatus: fp.farmer_registry_verification_status,
          farmerRegistryOcrData: fp.farmer_registry_ocr_data,
          farmerRegistrySubmittedAt: fp.farmer_registry_submitted_at,
          ...(fp.extra_data || {}),
        };
      }

      const bp = buyerMap.get(row.id);
      if (bp) {
        u.buyerProfile = {
          id: bp.user_id,
          name: bp.full_name,
          businessName: bp.business_name || bp.company_name || 'Agro Trading Co.',
          businessType: bp.business_type || 'Wholesaler / Trader',
          mobile: bp.mobile || row.mobile_number,
          contactNumber: bp.contact_number,
          email: bp.email || row.email,
          location: bp.location,
          state: bp.state || 'Uttar Pradesh',
          district: bp.district,
          pincode: bp.pincode,
          deliveryAddress: bp.delivery_address,
          gstinMasked: bp.gstin_masked,
          panMasked: bp.pan_masked,
          verified: Boolean(bp.verified),
          preferredCrops: Array.isArray(bp.preferred_crops) ? bp.preferred_crops : ['Wheat', 'Rice / Paddy'],
          isDemoProfile: Boolean(bp.is_demo_profile),
          memberSince: bp.member_since || row.created_at,
          ...(bp.extra_data || {}),
        };
      }

      return u;
    });
  },

  async upsertUser(user: UserRecord): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      // 1. Upsert users table
      const { error: uErr } = await client.from('users').upsert({
        id: user.id,
        role: user.role,
        identifier: user.identifier,
        mobile_number: user.mobileNumber,
        mobile_verified: user.mobileVerified,
        mobile_verified_at: user.mobileVerifiedAt || null,
        email: user.email || null,
        password_salt: user.passwordSalt,
        password_hash: user.passwordHash,
        status: user.status || 'active',
        created_at: user.createdAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (uErr) {
        console.error('[SupabaseRepo] Failed to upsert user:', uErr.message);
        return false;
      }

      // 2. Upsert Farmer Profile if present
      if (user.role === 'farmer' && user.farmerProfile) {
        const fp = user.farmerProfile;
        const farmerId = fp.farmerId || `KISAN-UP-${user.id.slice(-4)}`;
        const { error: fErr } = await client.from('farmer_profiles').upsert({
          farmer_id: farmerId,
          user_id: user.id,
          full_name: fp.name,
          father_name: fp.fatherName || null,
          mobile: fp.mobile || user.mobileNumber,
          email: fp.email || user.email || null,
          address: fp.address || '',
          state: fp.state || 'Uttar Pradesh',
          district: fp.district || 'Bareilly',
          tehsil: fp.tehsil || 'Baheri',
          village: fp.village || 'Haridaspur',
          pin_code: fp.pincode || (fp as any).pin_code || '243201',
          land_area_acres: fp.landAreaAcres || 0,
          land_type: fp.landType || 'Irrigated Fertile',
          soil_type: fp.soilType || null,
          irrigation_source: fp.irrigationSource || null,
          primary_crops: fp.primaryCrops || ['Wheat', 'Rice / Paddy'],
          aadhaar_masked: fp.aadhaarMasked || 'XXXX-XXXX-8492',
          e_kyc_status: fp.eKycStatus || 'VERIFIED ✓',
          kcc_status: fp.kccStatus || 'Active',
          soil_health_status: fp.soilHealthStatus || 'Optimal (NPK Balanced)',
          bank_account_verified: fp.bankAccountVerified || false,
          bank_details: fp.bankDetails || null,
          aadhaar_verified: fp.aadhaarVerified || false,
          aadhaar_number_masked: fp.aadhaarNumberMasked || null,
          aadhaar_front_url: fp.aadhaarFrontUrl || null,
          aadhaar_back_url: fp.aadhaarBackUrl || null,
          up_bhulekh_status: fp.upBhulekhStatus || 'Verified',
          is_approved_by_admin: fp.isApprovedByAdmin !== undefined ? fp.isApprovedByAdmin : true,
          approved_at: fp.approvedAt || null,
          farmer_registry_id: fp.farmerRegistryNumber || null,
          farmer_registry_document_url: fp.farmerRegistryDocumentUrl || null,
          farmer_registry_file_name: fp.farmerRegistryFileName || null,
          farmer_registry_ocr_status: fp.farmerRegistryOcrStatus || 'pending',
          farmer_registry_verification_status: fp.farmerRegistryVerificationStatus || 'MATCHED',
          farmer_registry_ocr_data: fp.farmerRegistryOcrData || null,
          farmer_registry_submitted_at: fp.farmerRegistrySubmittedAt ? toIsoDate(fp.farmerRegistrySubmittedAt) : null,
          member_since: toIsoDate(fp.memberSince || user.createdAt),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'farmer_id' });
        if (fErr) {
          console.error(`[SupabaseRepo] Failed to upsert farmer_profile for ${farmerId}:`, fErr.message);
        }
      }

      // 3. Upsert Buyer Profile if present
      if (user.role === 'buyer' && user.buyerProfile) {
        const bp = user.buyerProfile;
        const buyerId = (bp as any).buyerId || bp.id || `BUYER-UP-${user.id.slice(-4)}`;
        const { error: bErr } = await client.from('buyer_profiles').upsert({
          buyer_id: buyerId,
          user_id: user.id,
          full_name: bp.name,
          business_name: bp.businessName || 'Agro Trading Co.',
          business_type: bp.businessType || 'Wholesaler / Trader',
          mobile: bp.mobile || user.mobileNumber,
          contact_number: bp.contactNumber || null,
          email: bp.email || user.email || null,
          location: bp.location || 'Bareilly, Uttar Pradesh',
          state: bp.state || 'Uttar Pradesh',
          district: bp.district || 'Bareilly',
          pincode: bp.pincode || '243001',
          delivery_address: bp.deliveryAddress || 'Central Mandi Complex',
          gstin_masked: bp.gstinMasked || null,
          pan_masked: bp.panMasked || null,
          verified: bp.verified || false,
          preferred_crops: bp.preferredCrops || ['Wheat', 'Rice / Paddy'],
          is_demo_profile: bp.isDemoProfile || false,
          member_since: toIsoDate(bp.memberSince || user.createdAt),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'buyer_id' });
        if (bErr) {
          console.error(`[SupabaseRepo] Failed to upsert buyer_profile for ${buyerId}:`, bErr.message);
        }
      }

      return true;
    } catch (err: any) {
      console.error('[SupabaseRepo] Exception in upsertUser:', err?.message || err);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // SESSIONS
  // --------------------------------------------------------------------------
  async getAllSessions(): Promise<AuthSession[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('auth_sessions').select('*');
    if (error || !data) return [];

    return data.map((r) => ({
      token: r.token,
      userId: r.user_id,
      role: r.role,
      createdAt: r.created_at,
      expiresAt: Number(r.expires_at),
    }));
  },

  async upsertSession(session: AuthSession): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('auth_sessions').upsert({
      token: session.token,
      user_id: session.userId,
      role: session.role,
      created_at: session.createdAt,
      expires_at: session.expiresAt,
    }, { onConflict: 'token' });

    return !error;
  },

  async deleteSession(token: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('auth_sessions').delete().eq('token', token);
    return !error;
  },

  // --------------------------------------------------------------------------
  // CROP LISTINGS (Canonical Farmer -> Buyer Marketplace)
  // --------------------------------------------------------------------------
  async getAllCropListings(): Promise<CropListing[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('crop_listings').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map(rowToCropListing);
  },

  async upsertCropListing(crop: CropListing): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const imagesArr = Array.isArray(crop.images) && crop.images.length > 0
      ? crop.images
      : crop.imageUrl ? [crop.imageUrl] : [];

    const { error } = await client.from('crop_listings').upsert({
      id: crop.id,
      farmer_id: crop.farmerId,
      name: crop.name,
      crop_name: crop.cropName || crop.name,
      variety: crop.variety,
      category: crop.category,
      quantity_kg: crop.quantityKg,
      quantity: crop.quantity || `${crop.quantityKg} kg`,
      price: crop.price || crop.expectedPrice,
      expected_price: crop.expectedPrice,
      price_unit: crop.priceUnit || '₹/kg',
      pricing_type: crop.pricingType || null,
      harvest_date: crop.harvestDate || null,
      processing_yield_percent: crop.processingYieldPercent || null,
      grade: crop.grade,
      quality_classification: crop.qualityClassification || 'STANDARD',
      pricing_type_tier: crop.pricingTypeTier || 'STANDARD',
      is_manual_classification: crop.isManualClassification || false,
      captured_via_camera: crop.capturedViaCamera || false,
      location: crop.location,
      district: crop.district || null,
      state: crop.state || 'Uttar Pradesh',
      nearest_mandi: crop.nearestMandi || null,
      current_mandi_price: crop.currentMandiPrice || 0,
      status: crop.status || 'Available',
      image_url: crop.imageUrl || (imagesArr[0] || null),
      images: imagesArr,
      organic_certified: crop.organicCertified || false,
      up_bhulekh_verified: crop.upBhulekhVerified !== undefined ? crop.upBhulekhVerified : true,
      quality_score: crop.qualityScore || 88.0,
      moisture_percent: crop.moisturePercent || null,
      grain_uniformity_percent: crop.grainUniformityPercent || null,
      description: crop.description || '',
      batch_id: crop.batchId || null,
      coordinates: crop.coordinates || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) {
      console.error('[SupabaseRepo] Failed to upsert crop listing:', error.message);
      return false;
    }
    return true;
  },

  async deleteCropListing(listingId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('crop_listings').delete().eq('id', listingId);
    return !error;
  },

  async updateCropQuantity(listingId: string, newQuantityKg: number): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const newStatus = newQuantityKg <= 0 ? 'Sold Out' : 'Available';
    const { error } = await client.from('crop_listings').update({
      quantity_kg: newQuantityKg,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', listingId);

    return !error;
  },

  // --------------------------------------------------------------------------
  // BUYER ORDERS & ATOMIC INVENTORY DEDUCTION
  // --------------------------------------------------------------------------
  async getAllOrders(): Promise<BuyerOrder[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('buyer_orders').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map(rowToBuyerOrder);
  },

  async upsertOrder(order: BuyerOrder): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('buyer_orders').upsert({
      id: order.id,
      order_number: order.orderNumber || order.id,
      buyer_id: order.buyerId,
      buyer_name: order.buyerName || null,
      buyer_phone: (order as any).buyerPhone || null,
      farmer_id: order.farmerId,
      farmer_name: order.farmerName || null,
      farmer_phone: (order as any).farmerPhone || null,
      crop: order.crop || null,
      variety: order.variety || null,
      grade: order.grade || null,
      quantity_kg: order.quantityKg || null,
      price_per_kg: order.pricePerKg || null,
      total_amount: order.totalAmount,
      status: order.status || 'Pending',
      delivery_address: order.deliveryAddress,
      payment_method: order.paymentMethod || 'Mandi Escrow',
      payment_status: order.paymentStatus || 'Pending Escrow',
      tracking_number: order.trackingNumber || null,
      vehicle_number: order.vehicleNumber || null,
      driver_name: order.driverName || null,
      driver_phone: order.driverPhone || null,
      items: order.items || [],
      order_date: toIsoDate(order.orderDate),
      estimated_delivery: order.estimatedDelivery || null,
      delivered_at: order.deliveredAt ? toIsoDate(order.deliveredAt) : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (!error) {
      try {
        if (Array.isArray(order.items) && order.items.length > 0) {
          for (let i = 0; i < order.items.length; i++) {
            const itm = order.items[i];
            await client.from('order_items').upsert({
              id: `${order.id}-item-${i + 1}`,
              order_id: order.id,
              listing_id: null,
              crop_name: itm.crop || order.crop || 'Crop',
              variety: itm.variety || order.variety || 'Standard',
              grade: itm.grade || order.grade || 'STANDARD',
              batch_id: (itm as any).batchId || order.batchId || null,
              quantity_kg: itm.quantityKg || 0,
              price_per_kg: itm.pricePerKg || 0,
              line_total: itm.totalAmount || ((itm.quantityKg || 0) * (itm.pricePerKg || 0)),
            }, { onConflict: 'id' });
          }
        } else if (order.crop) {
          await client.from('order_items').upsert({
            id: `${order.id}-item-1`,
            order_id: order.id,
            listing_id: null,
            crop_name: order.crop,
            variety: order.variety || 'Standard',
            grade: order.grade || 'STANDARD',
            batch_id: order.batchId || null,
            quantity_kg: order.quantityKg || 0,
            price_per_kg: order.pricePerKg || 0,
            line_total: order.totalAmount || ((order.quantityKg || 0) * (order.pricePerKg || 0)),
          }, { onConflict: 'id' });
        }
      } catch {}
    }

    return !error;
  },

  async placeOrderWithInventoryDeduction(params: {
    orderId: string;
    orderNumber: string;
    buyerId: string;
    buyerName: string;
    buyerPhone: string;
    farmerId: string;
    farmerName: string;
    farmerPhone: string;
    listingId: string;
    quantityKg: number;
    pricePerKg: number;
    totalAmount: number;
    deliveryAddress: string;
    items?: any[];
    notes?: string;
  }): Promise<{ success: boolean; remainingQuantityKg?: number; orderId?: string; orderNumber?: string; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Database not available' };

    try {
      const { data, error } = await client.rpc('place_order_with_inventory_deduction', {
        p_order_id: params.orderId,
        p_order_number: params.orderNumber,
        p_buyer_id: params.buyerId,
        p_buyer_name: params.buyerName,
        p_buyer_phone: params.buyerPhone,
        p_farmer_id: params.farmerId,
        p_farmer_name: params.farmerName,
        p_farmer_phone: params.farmerPhone,
        p_listing_id: params.listingId,
        p_quantity_kg: params.quantityKg,
        p_price_per_kg: params.pricePerKg,
        p_total_amount: params.totalAmount,
        p_delivery_address: params.deliveryAddress,
        p_items: params.items || [],
        p_notes: params.notes || null,
      });

      if (error) {
        console.warn('[SupabaseRepo] RPC place_order_with_inventory_deduction notice:', error.message);
        return { success: false, error: error.message };
      }
      return data || { success: true };
    } catch (rpcErr: any) {
      console.warn('[SupabaseRepo] RPC exception:', rpcErr?.message || rpcErr);
      return { success: false, error: rpcErr?.message || 'Inventory procedure execution error' };
    }
  },

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const payload: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (notes) payload.notes = notes;
    if (status.toLowerCase() === 'delivered') payload.delivered_at = new Date().toISOString();

    const { error } = await client.from('buyer_orders').update(payload).eq('id', orderId);
    return !error;
  },

  // --------------------------------------------------------------------------
  // BUYER REQUIREMENTS
  // --------------------------------------------------------------------------
  async getAllRequirements(): Promise<BuyerRequirement[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('buyer_requirements').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id,
      requirementNumber: r.requirement_number,
      buyerId: r.buyer_id,
      buyerName: r.buyer_name,
      buyerPhone: r.buyer_phone,
      buyerCompany: r.buyer_company,
      crop: r.crop_name,
      cropName: r.crop_name,
      variety: r.variety,
      grade: 'A',
      requiredQuantityKg: Number(r.quantity_required),
      quantityRequired: Number(r.quantity_required),
      unit: r.unit || 'kg',
      maxPricePerKg: Number(r.max_target_price_per_unit),
      maxTargetPricePerUnit: Number(r.max_target_price_per_unit),
      targetDeliveryDate: r.target_delivery_date,
      deliveryDate: r.target_delivery_date || '',
      preferredLocation: r.delivery_location || '',
      deliveryLocation: r.delivery_location,
      maxDistanceKm: 50,
      matchedFarmersCount: Number(r.responses_count || 0),
      matchedQuantityKg: 0,
      matchScore: 90,
      matchedFarmers: [],
      state: r.state || 'Uttar Pradesh',
      district: r.district,
      status: r.status,
      notes: r.notes || '',
      responsesCount: Number(r.responses_count || 0),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async upsertRequirement(req: BuyerRequirement): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('buyer_requirements').upsert({
      id: req.id,
      requirement_number: req.requirementNumber || req.id,
      buyer_id: req.buyerId || 'BUYER-DEFAULT',
      buyer_name: req.buyerName || null,
      buyer_phone: req.buyerPhone || null,
      buyer_company: req.buyerCompany || null,
      crop_name: req.cropName || req.crop || 'Produce',
      variety: req.variety,
      quantity_required: req.quantityRequired || req.requiredQuantityKg || 0,
      unit: req.unit || 'kg',
      max_target_price_per_unit: req.maxTargetPricePerUnit || req.maxPricePerKg || 0,
      target_delivery_date: req.targetDeliveryDate || req.deliveryDate || null,
      delivery_location: req.deliveryLocation || req.preferredLocation || 'Uttar Pradesh',
      state: req.state || 'Uttar Pradesh',
      district: req.district || 'Bareilly',
      status: req.status || 'ACTIVE',
      notes: req.notes || null,
      responses_count: req.responsesCount || req.matchedFarmersCount || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    return !error;
  },

  // --------------------------------------------------------------------------
  // MESSAGE THREADS
  // --------------------------------------------------------------------------
  async getAllMessageThreads(): Promise<BuyerMessageThread[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('message_threads').select('*').order('last_message_at', { ascending: false });
    if (error || !data) return [];

    return data.map((r) => ({
      id: r.thread_id,
      threadId: r.thread_id,
      buyerId: r.buyer_id,
      buyerName: r.buyer_name,
      buyerPhone: r.buyer_phone,
      farmerId: r.farmer_id,
      farmerName: r.farmer_name,
      farmerPhone: r.farmer_phone,
      listingId: r.listing_id,
      cropName: r.crop_name,
      cropContext: r.crop_name,
      variety: r.variety,
      status: r.status || 'ACTIVE',
      messages: Array.isArray(r.messages) ? r.messages : [],
      lastMessage: Array.isArray(r.messages) && r.messages.length > 0 ? r.messages[r.messages.length - 1].text : '',
      lastMessageAt: r.last_message_at || r.created_at,
      lastMessageTime: r.last_message_at || r.created_at,
      createdAt: r.created_at,
    }));
  },

  async upsertMessageThread(thread: BuyerMessageThread): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const threadId = thread.threadId || thread.id;
    const { error } = await client.from('message_threads').upsert({
      thread_id: threadId,
      buyer_id: thread.buyerId || 'BUYER-DEFAULT',
      buyer_name: thread.buyerName || null,
      buyer_phone: thread.buyerPhone || null,
      farmer_id: thread.farmerId,
      farmer_name: thread.farmerName || null,
      farmer_phone: thread.farmerPhone || null,
      listing_id: thread.listingId || null,
      crop_name: thread.cropName || thread.cropContext || null,
      variety: thread.variety || null,
      status: thread.status || 'ACTIVE',
      messages: thread.messages || [],
      last_message_at: thread.lastMessageAt || thread.lastMessageTime || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'thread_id' });

    if (!error && Array.isArray(thread.messages) && thread.messages.length > 0) {
      try {
        for (let i = 0; i < thread.messages.length; i++) {
          const msg = thread.messages[i];
          const msgId = msg.id || `${threadId}-msg-${i + 1}`;
          const sender = (msg.sender as string) === 'farmer' ? 'farmer' : (msg.sender as string) === 'system' ? 'system' : 'buyer';
          await client.from('thread_messages').upsert({
            id: msgId,
            thread_id: threadId,
            sender,
            sender_name: (msg as any).senderName || (sender === 'farmer' ? thread.farmerName : thread.buyerName) || sender,
            text: msg.text || '',
            created_at: toIsoDate(msg.timestamp || msg.time),
          }, { onConflict: 'id' });
        }
      } catch {}
    }

    return !error;
  },

  // --------------------------------------------------------------------------
  // BUYER CART & FAVORITES
  // --------------------------------------------------------------------------
  async getCart(buyerId: string): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('buyer_cart_items').select('*').eq('buyer_id', buyerId);
    if (error || !data) return [];

    return data.map((r) => ({
      listingId: r.listing_id,
      crop: r.crop,
      variety: r.variety,
      grade: r.grade,
      farmerId: r.farmer_id,
      farmerName: r.farmer_name,
      farmerLocation: r.farmer_location,
      farmerVerified: r.farmer_verified,
      pricePerKg: Number(r.price_per_kg),
      quantityKg: Number(r.quantity_kg),
      availableQuantityKg: Number(r.available_quantity_kg),
      imageUrl: r.image_url,
      minOrderQtyKg: r.min_order_qty_kg ? Number(r.min_order_qty_kg) : 50,
      batchId: r.batch_id,
    }));
  },

  async setCart(buyerId: string, items: any[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    // Delete existing cart items for buyer
    await client.from('buyer_cart_items').delete().eq('buyer_id', buyerId);

    if (items.length === 0) return true;

    const rows = items.map((item, idx) => ({
      id: `cart_${buyerId}_${item.listingId || idx}`,
      buyer_id: buyerId,
      listing_id: item.listingId || '',
      crop: item.crop || '',
      variety: item.variety || '',
      grade: item.grade || 'STANDARD',
      farmer_id: item.farmerId || '',
      farmer_name: item.farmerName || '',
      farmer_location: item.farmerLocation || '',
      farmer_verified: item.farmerVerified !== undefined ? item.farmerVerified : true,
      price_per_kg: item.pricePerKg || 0,
      quantity_kg: item.quantityKg || 0,
      available_quantity_kg: item.availableQuantityKg || 0,
      image_url: item.imageUrl || '',
      min_order_qty_kg: item.minOrderQtyKg || 50,
      batch_id: item.batchId || null,
      added_at: new Date().toISOString(),
    }));

    const { error } = await client.from('buyer_cart_items').insert(rows);
    return !error;
  },

  async getFavorites(buyerId: string): Promise<string[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('buyer_favorites').select('listing_id').eq('buyer_id', buyerId);
    if (error || !data) return [];

    return data.map((r) => r.listing_id);
  },

  async setFavorites(buyerId: string, listingIds: string[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    await client.from('buyer_favorites').delete().eq('buyer_id', buyerId);
    if (listingIds.length === 0) return true;

    const rows = listingIds.map((lid) => ({
      buyer_id: buyerId,
      listing_id: lid,
    }));

    const { error } = await client.from('buyer_favorites').insert(rows);
    return !error;
  },

  async getAllCartItems(): Promise<{ buyerId: string; items: any[] }[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('buyer_cart_items').select('*');
    if (error || !data) return [];

    const grouped = new Map<string, any[]>();
    for (const r of data) {
      const bId = r.buyer_id;
      const list = grouped.get(bId) || [];
      list.push({
        listingId: r.listing_id,
        crop: r.crop,
        variety: r.variety,
        grade: r.grade,
        farmerId: r.farmer_id,
        farmerName: r.farmer_name,
        farmerLocation: r.farmer_location,
        farmerVerified: r.farmer_verified,
        pricePerKg: Number(r.price_per_kg),
        quantityKg: Number(r.quantity_kg),
        availableQuantityKg: Number(r.available_quantity_kg),
        imageUrl: r.image_url,
        minOrderQtyKg: r.min_order_qty_kg ? Number(r.min_order_qty_kg) : 50,
        batchId: r.batch_id,
      });
      grouped.set(bId, list);
    }

    return Array.from(grouped.entries()).map(([buyerId, items]) => ({ buyerId, items }));
  },

  async getAllFavorites(): Promise<{ buyerId: string; favorites: string[] }[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('buyer_favorites').select('*');
    if (error || !data) return [];

    const grouped = new Map<string, string[]>();
    for (const r of data) {
      const bId = r.buyer_id;
      const list = grouped.get(bId) || [];
      if (r.listing_id) list.push(r.listing_id);
      grouped.set(bId, list);
    }

    return Array.from(grouped.entries()).map(([buyerId, favorites]) => ({ buyerId, favorites }));
  },

  // --------------------------------------------------------------------------
  // FARMER PROPERTIES & LAND RECORDS
  // --------------------------------------------------------------------------
  async getAllProperties(): Promise<FarmerProperty[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('farmer_properties').select('*');
    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id,
      farmerId: r.farmer_id,
      district: r.district,
      tehsil: r.tehsil,
      village: r.village,
      gataNumber: r.gata_number,
      khatauniNumber: r.khatauni_number,
      landArea: Number(r.land_area),
      landAreaUnit: r.land_area_unit,
      status: r.status,
      statusNotes: r.status_notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async upsertProperty(prop: FarmerProperty): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('farmer_properties').upsert({
      id: prop.id,
      farmer_id: prop.farmerId,
      district: prop.district,
      tehsil: prop.tehsil,
      village: prop.village,
      gata_number: prop.gataNumber,
      khatauni_number: prop.khatauniNumber || null,
      land_area: prop.landArea,
      land_area_unit: prop.landAreaUnit,
      status: prop.status,
      status_notes: prop.statusNotes || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    return !error;
  },

  async deleteProperty(propertyId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('farmer_properties').delete().eq('id', propertyId);
    return !error;
  },

  async getAllLandRecords(): Promise<FarmerLandRecord[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('land_verification_records').select('*');
    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id,
      farmerId: r.farmer_id,
      farmerName: r.farmer_name,
      farmerMobile: r.farmer_mobile,
      fatherName: r.father_name,
      district: r.district,
      tehsil: r.tehsil,
      village: r.village,
      khataNumber: r.khata_number,
      khasraNumber: r.khasra_number,
      landArea: Number(r.land_area),
      landUnit: r.land_unit,
      ownerNameInKhatauni: r.owner_name_in_khatauni,
      status: r.status,
      submittedAt: r.submitted_at,
      reviewedAt: r.reviewed_at,
      reviewedBy: r.reviewed_by,
      adminNotes: r.admin_notes,
      officialUpBhulekhVerified: Boolean(r.official_up_bhulekh_verified),
      verificationSource: r.verification_source,
    }));
  },

  async upsertLandRecord(rec: FarmerLandRecord): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('land_verification_records').upsert({
      id: rec.id,
      farmer_id: rec.farmerId,
      farmer_name: rec.farmerName,
      farmer_mobile: rec.farmerMobile,
      father_name: rec.fatherName,
      district: rec.district,
      tehsil: rec.tehsil,
      village: rec.village,
      khata_number: rec.khataNumber,
      khasra_number: rec.khasraNumber,
      land_area: rec.landArea,
      land_unit: rec.landUnit,
      owner_name_in_khatauni: rec.ownerNameInKhatauni,
      status: rec.status,
      submitted_at: rec.submittedAt || new Date().toISOString(),
      reviewed_at: rec.reviewedAt || null,
      reviewed_by: rec.reviewedBy || null,
      admin_notes: rec.adminNotes || null,
      official_up_bhulekh_verified: rec.officialUpBhulekhVerified || false,
      verification_source: rec.verificationSource || 'Admin Manual Review',
    }, { onConflict: 'id' });

    return !error;
  },

  // --------------------------------------------------------------------------
  // POST-HARVEST PROCESSING RECORDS
  // --------------------------------------------------------------------------
  async getAllProcessingRecords(): Promise<ProcessingRecord[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('post_harvest_records').select('*');
    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id,
      farmerId: r.farmer_id,
      farmerName: 'Verified Farmer',
      cropId: r.crop_id,
      sourceCropId: r.crop_id,
      cropName: r.crop_name,
      sourceCropName: r.crop_name,
      cropVariety: r.crop_variety,
      sourceCropVariety: r.crop_variety,
      sourceBatchId: r.batch_number || 'BATCH-01',
      processingType: r.processing_type as any,
      processingTypeId: r.processing_type || 'custom-processing',
      processingTypeName: r.processing_type || 'Custom Transformation',
      inputQuantityKg: Number(r.input_quantity_kg),
      outputQuantityKg: Number(r.output_quantity_kg),
      processingLossKg: Math.max(0, Number(r.input_quantity_kg) - Number(r.output_quantity_kg)),
      processingYieldPercent: Number(r.recovery_rate_percent),
      recoveryRatePercent: Number(r.recovery_rate_percent),
      availableProcessedQuantityKg: Number(r.output_quantity_kg),
      soldProcessedQuantityKg: 0,
      rawCropPricePerKg: 25,
      processingCostTotal: 0,
      processingCostPerKg: 0,
      targetSellingPricePerKg: 45,
      estimatedValueAdditionAmount: 0,
      processingMethod: 'self',
      processedProductName: r.crop_name,
      processedProductGrade: 'A+',
      processedBatchId: r.batch_number || 'BATCH-01',
      packagingType: 'Standard Grain Sacks',
      processingDate: r.processing_date,
      facilityName: r.facility_name,
      facilityLocation: r.facility_location,
      qualityScore: Number(r.quality_score || 90),
      notes: r.notes || '',
      batchNumber: r.batch_number,
      status: (r.status || 'PROCESSED_AVAILABLE') as any,
      isPublishedToMarketplace: Boolean(r.published_to_listing_id),
      publishedToListingId: r.published_to_listing_id || undefined,
      marketplaceListingId: r.published_to_listing_id || undefined,
      startDate: r.processing_date || r.created_at,
      expectedCompletionDate: r.processing_date || r.created_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async upsertProcessingRecord(rec: ProcessingRecord): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('post_harvest_records').upsert({
      id: rec.id,
      farmer_id: rec.farmerId,
      crop_id: rec.cropId || rec.sourceCropId,
      crop_name: rec.cropName || rec.sourceCropName || rec.processedProductName,
      crop_variety: rec.cropVariety || rec.sourceCropVariety || rec.processedProductVariety || 'Standard',
      processing_type: rec.processingType || rec.processingTypeName || rec.processingTypeId,
      input_quantity_kg: rec.inputQuantityKg,
      output_quantity_kg: rec.outputQuantityKg,
      recovery_rate_percent: rec.recoveryRatePercent || rec.processingYieldPercent,
      processing_date: rec.processingDate || rec.completedDate || rec.startDate || new Date().toISOString().split('T')[0],
      facility_name: rec.facilityName || rec.partnerFacilityName || 'On-Farm Facility',
      facility_location: rec.facilityLocation || 'Bareilly, UP',
      quality_score: rec.qualityScore || 90,
      notes: rec.notes || rec.description || null,
      batch_number: rec.batchNumber || rec.processedBatchId || rec.sourceBatchId || 'BATCH-01',
      status: rec.status,
      published_to_listing_id: rec.publishedToListingId || rec.marketplaceListingId || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    return !error;
  },

  // --------------------------------------------------------------------------
  // ADMIN AUDIT LOGS
  // --------------------------------------------------------------------------
  async getAllAuditLogs(): Promise<AdminAuditLog[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('admin_audit_logs').select('*').order('timestamp', { ascending: false }).limit(200);
    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id,
      adminEmail: r.admin_email,
      action: r.action,
      targetType: r.target_type as any,
      targetId: r.target_id,
      targetName: r.target_name || undefined,
      details: r.details || '',
      timestamp: r.timestamp,
    }));
  },

  async insertAuditLog(log: AdminAuditLog): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('admin_audit_logs').insert({
      id: log.id,
      admin_email: log.adminEmail,
      action: log.action,
      target_type: log.targetType,
      target_id: log.targetId,
      target_name: log.targetName || null,
      details: log.details || '',
      timestamp: log.timestamp || new Date().toISOString(),
    });

    return !error;
  },

  // --------------------------------------------------------------------------
  // SUPPORT TICKETS
  // --------------------------------------------------------------------------
  async getAllSupportTickets(): Promise<SupportTicket[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((r) => ({
      ticketId: r.ticket_id,
      userId: r.user_id,
      userName: r.user_name || '',
      userRole: r.user_role as any,
      userPhone: r.user_phone,
      userEmail: r.user_email,
      channel: r.channel as any,
      category: r.category as any,
      subject: r.subject,
      description: r.description || '',
      conversationSummary: r.conversation_summary || '',
      priority: r.priority as any,
      status: r.status as any,
      assignedTo: r.assigned_to,
      language: r.language as any,
      messages: Array.isArray(r.messages) ? r.messages : [],
      resolution: r.resolution,
      satisfaction: r.satisfaction,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async upsertSupportTicket(ticket: SupportTicket): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('support_tickets').upsert({
      ticket_id: ticket.ticketId,
      user_id: ticket.userId,
      user_name: ticket.userName || null,
      user_role: ticket.userRole || 'farmer',
      user_phone: ticket.userPhone || null,
      user_email: ticket.userEmail || null,
      channel: ticket.channel,
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      conversation_summary: ticket.conversationSummary || null,
      priority: ticket.priority,
      status: ticket.status,
      assigned_to: ticket.assignedTo || null,
      language: ticket.language || 'hi-IN',
      messages: ticket.messages || [],
      resolution: ticket.resolution || null,
      satisfaction: ticket.satisfaction || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'ticket_id' });

    return !error;
  },

  // --------------------------------------------------------------------------
  // MANDI PRICE HISTORY (Official cached government observations)
  // --------------------------------------------------------------------------
  async getMandiHistory(
    commodityOrOptions?: string | { limit?: number; commodity?: string; market?: string; days?: number },
    market?: string,
    days: number = 30
  ): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    let commodity = '';
    let marketFilter = market || '';
    let limit = days * 4;

    if (typeof commodityOrOptions === 'object' && commodityOrOptions !== null) {
      commodity = commodityOrOptions.commodity || '';
      marketFilter = commodityOrOptions.market || '';
      limit = commodityOrOptions.limit || 30;
    } else if (typeof commodityOrOptions === 'string') {
      commodity = commodityOrOptions;
    }

    let query = client.from('mandi_price_history').select('*');
    if (commodity) {
      query = query.ilike('commodity', `%${commodity}%`);
    }
    if (marketFilter) {
      query = query.ilike('market', `%${marketFilter}%`);
    }

    const { data, error } = await query
      .order('arrival_date', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((r) => ({
      observationDate: r.observation_date,
      arrivalDate: r.arrival_date,
      rawDate: r.raw_date || r.arrival_date,
      displayDate: r.display_date,
      timestamp: Number(r.timestamp || 0),
      modalPriceQuintal: Number(r.modal_price),
      modalPriceKg: Math.round(Number(r.modal_price) / 100),
      minPriceQuintal: Number(r.min_price),
      maxPriceQuintal: Number(r.max_price),
      minPriceKg: Number((Number(r.min_price) / 100).toFixed(1)),
      maxPriceKg: Number((Number(r.max_price) / 100).toFixed(1)),
      minPrice: Number(r.min_price),
      maxPrice: Number(r.max_price),
      modalPrice: Number(r.modal_price),
      variety: r.variety || '',
      market: r.market,
      district: r.district,
      state: r.state,
      commodity: r.commodity,
      source: r.source || 'AGMARKNET',
      sourceUrl: r.source_url,
    }));
  },

  async insertMandiObservations(records: any[]): Promise<number> {
    const client = getSupabaseClient();
    if (!client || records.length === 0) return 0;

    const rows = records.map((r) => ({
      observation_date: r.observationDate || r.arrivalDate,
      arrival_date: r.arrivalDate || r.observationDate,
      state: r.state,
      district: r.district,
      market: r.market,
      commodity: r.commodity,
      variety: r.variety || null,
      grade: r.grade || null,
      min_price: r.minPrice || r.minPriceQuintal || 0,
      max_price: r.maxPrice || r.maxPriceQuintal || 0,
      modal_price: r.modalPrice || r.modalPriceQuintal || 0,
      raw_date: r.rawDate || r.arrivalDate,
      display_date: r.displayDate || r.arrivalDate,
      timestamp: r.timestamp || Date.now(),
      source: r.source || 'AGMARKNET (DMI, GoI)',
      source_url: r.sourceUrl || null,
    }));

    // Insert in batches of 100 to avoid payload size limit
    let inserted = 0;
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await client.from('mandi_price_history').upsert(batch, {
        onConflict: 'observation_date,state,district,market,commodity,variety',
        ignoreDuplicates: true,
      });
      if (!error) {
        inserted += batch.length;
      }
    }
    return inserted;
  },

  async getMandiSyncMetadata(): Promise<any> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client.from('mandi_sync_metadata').select('*').eq('id', 1).maybeSingle();
    if (error || !data) return null;
    return {
      lastSuccessfulIngestion: data.last_successful_ingestion,
      lastObservationDate: data.last_observation_date,
      recordsInLatestSnapshot: Number(data.records_in_latest_snapshot || 0),
      totalHistoricalRecords: Number(data.total_historical_records || 0),
      uniqueObservationDates: Number(data.unique_observation_dates || 0),
      oldestObservationDate: data.oldest_observation_date,
      latestObservationDate: data.latest_observation_date,
      lastError: data.last_error,
    };
  },

  async saveMandiSyncMetadata(meta: any): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client.from('mandi_sync_metadata').upsert({
      id: 1,
      last_successful_ingestion: meta.lastSuccessfulIngestion,
      last_observation_date: meta.lastObservationDate,
      records_in_latest_snapshot: meta.recordsInLatestSnapshot,
      total_historical_records: meta.totalHistoricalRecords,
      unique_observation_dates: meta.uniqueObservationDates,
      oldest_observation_date: meta.oldestObservationDate,
      latest_observation_date: meta.latestObservationDate,
      last_error: meta.lastError || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    return !error;
  },
};
