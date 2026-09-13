import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, getSupabaseClient, testSupabaseConnection } from './supabaseClient';
import { SupabaseRepo } from './supabaseRepository';

export interface MigrationReport {
  timestamp: string;
  success: boolean;
  status: 'completed' | 'skipped_no_credentials' | 'failed';
  message: string;
  sourceFilesFound: string[];
  counts: {
    usersJson: number;
    usersSupabase: number;
    cropListingsJson: number;
    cropListingsSupabase: number;
    ordersJson: number;
    ordersSupabase: number;
    requirementsJson: number;
    requirementsSupabase: number;
    messagesJson: number;
    messagesSupabase: number;
    propertiesJson: number;
    propertiesSupabase: number;
    landRecordsJson: number;
    landRecordsSupabase: number;
    processingRecordsJson: number;
    processingRecordsSupabase: number;
    cartJson: number;
    cartSupabase: number;
    favoritesJson: number;
    favoritesSupabase: number;
    auditLogsJson: number;
    auditLogsSupabase: number;
    mandiRecordsJson: number;
    mandiRecordsSupabase: number;
  };
  errors: string[];
}

/**
 * Executes a full, failure-safe, idempotent migration from JSON files to Supabase.
 */
export async function executeSupabaseMigration(): Promise<MigrationReport> {
  const report: MigrationReport = {
    timestamp: new Date().toISOString(),
    success: false,
    status: 'failed',
    message: '',
    sourceFilesFound: [],
    counts: {
      usersJson: 0,
      usersSupabase: 0,
      cropListingsJson: 0,
      cropListingsSupabase: 0,
      ordersJson: 0,
      ordersSupabase: 0,
      requirementsJson: 0,
      requirementsSupabase: 0,
      messagesJson: 0,
      messagesSupabase: 0,
      propertiesJson: 0,
      propertiesSupabase: 0,
      landRecordsJson: 0,
      landRecordsSupabase: 0,
      processingRecordsJson: 0,
      processingRecordsSupabase: 0,
      cartJson: 0,
      cartSupabase: 0,
      favoritesJson: 0,
      favoritesSupabase: 0,
      auditLogsJson: 0,
      auditLogsSupabase: 0,
      mandiRecordsJson: 0,
      mandiRecordsSupabase: 0,
    },
    errors: [],
  };

  if (!isSupabaseConfigured()) {
    report.status = 'skipped_no_credentials';
    report.message = 'Supabase credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY) are not configured. Existing JSON storage preserved safely.';
    return report;
  }

  const client = getSupabaseClient();
  if (!client) {
    report.message = 'Failed to initialize Supabase client.';
    return report;
  }

  const authStorePath = path.resolve(process.cwd(), '.data/kisansetu_auth_store.json');
  const landStorePath = path.resolve(process.cwd(), '.data/kisansetu_land_store.json');
  const mandiHistoryPath = path.resolve(process.cwd(), '.data/kisansetu_mandi_history.json');

  if (fs.existsSync(authStorePath)) report.sourceFilesFound.push(authStorePath);
  if (fs.existsSync(landStorePath)) report.sourceFilesFound.push(landStorePath);
  if (fs.existsSync(mandiHistoryPath)) report.sourceFilesFound.push(mandiHistoryPath);

  try {
    // Ensure Supabase connection and schema ready state are initialized
    const client = getSupabaseClient();
    if (!client) {
      report.message = 'Failed to initialize Supabase client.';
      return report;
    }
    const connTest = await testSupabaseConnection(true);
    if (!connTest.connected || !connTest.schemaReady) {
      report.message = `Supabase is not ready: ${connTest.message}`;
      report.errors.push(connTest.message);
      return report;
    }

    // ------------------------------------------------------------------------
    // 1. MIGRATE AUTH STORE
    // ------------------------------------------------------------------------
    if (fs.existsSync(authStorePath)) {
      const raw = fs.readFileSync(authStorePath, 'utf8');
      const authData = JSON.parse(raw);

      // 1A. Users and Profiles First (Establishes all farmer_profiles & buyer_profiles FKs)
      const userFarmerIdMap = new Map<string, string>();
      const userBuyerIdMap = new Map<string, string>();

      if (Array.isArray(authData.users)) {
        report.counts.usersJson = authData.users.length;
        for (const entry of authData.users) {
          const userRec = Array.isArray(entry) ? entry[1] : entry;
          if (userRec && userRec.id) {
            const ok = await SupabaseRepo.upsertUser(userRec);
            if (!ok) {
              report.errors.push(`Failed to upsert user ${userRec.id}`);
            } else {
              if (userRec.role === 'farmer' && userRec.farmerProfile) {
                const fid = userRec.farmerProfile.farmerId || `KISAN-UP-${userRec.id.slice(-4)}`;
                userFarmerIdMap.set(userRec.id, fid);
                userFarmerIdMap.set(fid, fid);
              }
              if (userRec.role === 'buyer' && userRec.buyerProfile) {
                const bid = (userRec.buyerProfile as any).buyerId || userRec.buyerProfile.id || `BUYER-UP-${userRec.id.slice(-4)}`;
                userBuyerIdMap.set(userRec.id, bid);
                userBuyerIdMap.set(bid, bid);
              }
            }
          }
        }
      }

      // 1B. Ensure known referenced farmers exist in farmer_profiles with valid user accounts
      const defaultFarmerId = userFarmerIdMap.get('usr_farmer_rajesh_8842') || 'KISAN-UP-2026-8842';

      // Suresh Patil (KISAN-MH-2026-3021)
      await client.from('users').upsert({
        id: 'usr_farmer_suresh_3021',
        role: 'farmer',
        identifier: '+919822012345',
        mobile_number: '+919822012345',
        mobile_verified: true,
        password_salt: 'salt_suresh_3021',
        password_hash: 'hash_suresh_3021',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      await client.from('farmer_profiles').upsert({
        farmer_id: 'KISAN-MH-2026-3021',
        user_id: 'usr_farmer_suresh_3021',
        full_name: 'Suresh Patil',
        mobile: '+91 98220 12345',
        state: 'Maharashtra',
        district: 'Nashik',
        tehsil: 'Niphad',
        village: 'Lasalgaon',
        pin_code: '422306',
        land_area_acres: 18.0,
        land_type: 'Fertile Plain',
        primary_crops: ['Yellow Hybrid Maize', 'Desi Chana Pulses'],
        aadhaar_masked: 'XXXX-XXXX-3021',
        e_kyc_status: 'VERIFIED ✓',
        is_approved_by_admin: true,
      }, { onConflict: 'farmer_id' });
      userFarmerIdMap.set('KISAN-MH-2026-3021', 'KISAN-MH-2026-3021');

      // Suresh Chandra Sharma (KISAN-UP-2026-1049)
      await client.from('users').upsert({
        id: 'usr_farmer_suresh_1049',
        role: 'farmer',
        identifier: '+919837155420',
        mobile_number: '+919837155420',
        mobile_verified: true,
        password_salt: 'salt_suresh_1049',
        password_hash: 'hash_suresh_1049',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      await client.from('farmer_profiles').upsert({
        farmer_id: 'KISAN-UP-2026-1049',
        user_id: 'usr_farmer_suresh_1049',
        full_name: 'Suresh Chandra Sharma',
        mobile: '+91 98371 55420',
        state: 'Uttar Pradesh',
        district: 'Meerut',
        tehsil: 'Mawana',
        village: 'Kalyanpur',
        pin_code: '250401',
        land_area_acres: 12.0,
        land_type: 'Irrigated Fertile',
        primary_crops: ['Sugarcane', 'Wheat'],
        aadhaar_masked: 'XXXX-XXXX-1049',
        e_kyc_status: 'VERIFIED ✓',
        is_approved_by_admin: true,
      }, { onConflict: 'farmer_id' });
      userFarmerIdMap.set('KISAN-UP-2026-1049', 'KISAN-UP-2026-1049');

      // Ramkishan Yadav (KISAN-UP-2026-4412)
      await client.from('users').upsert({
        id: 'usr_farmer_ramkishan_4412',
        role: 'farmer',
        identifier: '+919412077319',
        mobile_number: '+919412077319',
        mobile_verified: true,
        password_salt: 'salt_ramkishan_4412',
        password_hash: 'hash_ramkishan_4412',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      await client.from('farmer_profiles').upsert({
        farmer_id: 'KISAN-UP-2026-4412',
        user_id: 'usr_farmer_ramkishan_4412',
        full_name: 'Ramkishan Yadav',
        mobile: '+91 94120 77319',
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        tehsil: 'Pindra',
        village: 'Rampur',
        pin_code: '221206',
        land_area_acres: 6.5,
        land_type: 'Alluvial Loam',
        primary_crops: ['Wheat', 'Rice / Paddy'],
        aadhaar_masked: 'XXXX-XXXX-4412',
        e_kyc_status: 'VERIFIED ✓',
        is_approved_by_admin: true,
      }, { onConflict: 'farmer_id' });
      userFarmerIdMap.set('KISAN-UP-2026-4412', 'KISAN-UP-2026-4412');

      // 1C. Active Sessions
      if (Array.isArray(authData.activeSessions)) {
        for (const entry of authData.activeSessions) {
          const session = Array.isArray(entry) ? entry[1] : entry;
          if (session && session.token) {
            await SupabaseRepo.upsertSession(session);
          }
        }
      }

      // 1D. Farmer Crops (Canonical Crop Listings) - Deduplicated by crop id
      const uniqueCropsMap = new Map<string, any>();
      if (Array.isArray(authData.farmerCrops)) {
        for (const entry of authData.farmerCrops) {
          const [key, crops] = Array.isArray(entry) && Array.isArray(entry[1]) ? entry : ['', entry];
          if (Array.isArray(crops)) {
            for (const crop of crops) {
              if (crop && crop.id && !uniqueCropsMap.has(crop.id)) {
                const assignedFarmerId = crop.farmerId || userFarmerIdMap.get(key) || (key.startsWith('KISAN') ? key : defaultFarmerId);
                uniqueCropsMap.set(crop.id, {
                  ...crop,
                  farmerId: assignedFarmerId,
                });
              }
            }
          }
        }
      }
      report.counts.cropListingsJson = uniqueCropsMap.size;
      for (const crop of uniqueCropsMap.values()) {
        const ok = await SupabaseRepo.upsertCropListing(crop);
        if (!ok) report.errors.push(`Failed to upsert crop listing ${crop.id}`);
      }

      // 1E. Buyer Orders - Deduplicated by order id
      const uniqueOrdersMap = new Map<string, any>();
      if (Array.isArray(authData.buyerOrders)) {
        for (const entry of authData.buyerOrders) {
          const [key, orders] = Array.isArray(entry) && Array.isArray(entry[1]) ? entry : ['', entry];
          if (Array.isArray(orders)) {
            for (const order of orders) {
              if (order && order.id && !uniqueOrdersMap.has(order.id)) {
                const buyerId = order.buyerId || userBuyerIdMap.get(key) || (key.startsWith('BUYER') ? key : 'BUYER-UP-2026-7712');
                const farmerId = order.farmerId || (order.items && order.items[0]?.farmerId) || defaultFarmerId;
                const normalizedFarmerId = userFarmerIdMap.get(farmerId) || defaultFarmerId;
                uniqueOrdersMap.set(order.id, {
                  ...order,
                  buyerId,
                  farmerId: normalizedFarmerId,
                });
              }
            }
          }
        }
      }
      report.counts.ordersJson = uniqueOrdersMap.size;
      for (const order of uniqueOrdersMap.values()) {
        const ok = await SupabaseRepo.upsertOrder(order);
        if (!ok) report.errors.push(`Failed to upsert order ${order.id}`);
      }

      // 1F. Buyer Requirements - Deduplicated by requirement id
      const uniqueReqsMap = new Map<string, any>();
      if (Array.isArray(authData.buyerRequirements)) {
        for (const entry of authData.buyerRequirements) {
          const [key, reqs] = Array.isArray(entry) && Array.isArray(entry[1]) ? entry : ['', entry];
          if (Array.isArray(reqs)) {
            for (const req of reqs) {
              if (req && req.id && !uniqueReqsMap.has(req.id)) {
                const buyerId = req.buyerId || userBuyerIdMap.get(key) || (key.startsWith('BUYER') ? key : 'BUYER-UP-2026-7712');
                uniqueReqsMap.set(req.id, {
                  ...req,
                  buyerId,
                });
              }
            }
          }
        }
      }
      report.counts.requirementsJson = uniqueReqsMap.size;
      for (const req of uniqueReqsMap.values()) {
        const ok = await SupabaseRepo.upsertRequirement(req);
        if (!ok) report.errors.push(`Failed to upsert requirement ${req.id}`);
      }

      // 1G. Buyer Messages / Threads - Deduplicated by threadId
      const uniqueThreadsMap = new Map<string, any>();
      if (Array.isArray(authData.buyerMessages)) {
        for (const entry of authData.buyerMessages) {
          const [key, threads] = Array.isArray(entry) && Array.isArray(entry[1]) ? entry : ['', entry];
          if (Array.isArray(threads)) {
            for (const thread of threads) {
              const tid = thread.threadId || thread.id;
              if (tid && !uniqueThreadsMap.has(tid)) {
                const buyerId = thread.buyerId || userBuyerIdMap.get(key) || (key.startsWith('BUYER') ? key : 'BUYER-UP-2026-7712');
                const farmerId = thread.farmerId ? (userFarmerIdMap.get(thread.farmerId) || defaultFarmerId) : defaultFarmerId;
                uniqueThreadsMap.set(tid, {
                  ...thread,
                  threadId: tid,
                  buyerId,
                  farmerId,
                });
              }
            }
          }
        }
      }
      report.counts.messagesJson = uniqueThreadsMap.size;
      for (const thread of uniqueThreadsMap.values()) {
        const ok = await SupabaseRepo.upsertMessageThread(thread);
        if (!ok) report.errors.push(`Failed to upsert message thread ${thread.threadId || thread.id}`);
      }

      // 1H. Buyer Cart
      if (Array.isArray(authData.buyerCart)) {
        for (const entry of authData.buyerCart) {
          const [buyerId, items] = Array.isArray(entry) ? entry : [entry.buyerId, entry.items];
          if (buyerId && Array.isArray(items)) {
            report.counts.cartJson += items.length;
            await SupabaseRepo.setCart(buyerId, items);
          }
        }
      }

      // 1I. Buyer Favorites
      if (Array.isArray(authData.buyerFavorites)) {
        for (const entry of authData.buyerFavorites) {
          const [buyerId, listingIds] = Array.isArray(entry) ? entry : [entry.buyerId, entry.listingIds];
          if (buyerId && Array.isArray(listingIds)) {
            report.counts.favoritesJson += listingIds.length;
            await SupabaseRepo.setFavorites(buyerId, listingIds);
          }
        }
      }

      // 1J. Processing Records - Deduplicated by record id
      const uniqueProcMap = new Map<string, any>();
      if (Array.isArray(authData.processingRecords)) {
        for (const entry of authData.processingRecords) {
          const [key, records] = Array.isArray(entry) && Array.isArray(entry[1]) ? entry : ['', entry];
          if (Array.isArray(records)) {
            for (const rec of records) {
              if (rec && rec.id && !uniqueProcMap.has(rec.id)) {
                const farmerId = rec.farmerId || userFarmerIdMap.get(key) || (key.startsWith('KISAN') ? key : defaultFarmerId);
                uniqueProcMap.set(rec.id, {
                  ...rec,
                  farmerId,
                });
              }
            }
          }
        }
      }
      report.counts.processingRecordsJson = uniqueProcMap.size;
      for (const rec of uniqueProcMap.values()) {
        const ok = await SupabaseRepo.upsertProcessingRecord(rec);
        if (!ok) report.errors.push(`Failed to upsert processing record ${rec.id}`);
      }

      // 1K. Admin Audit Logs
      if (Array.isArray(authData.adminAuditLogs)) {
        report.counts.auditLogsJson = authData.adminAuditLogs.length;
        for (const log of authData.adminAuditLogs) {
          if (log && log.id) {
            await SupabaseRepo.insertAuditLog(log);
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // 2. MIGRATE LAND STORE
    // ------------------------------------------------------------------------
    if (fs.existsSync(landStorePath)) {
      const raw = fs.readFileSync(landStorePath, 'utf8');
      const landData = JSON.parse(raw);

      // Farmer Properties
      if (Array.isArray(landData.farmerProperties)) {
        report.counts.propertiesJson = landData.farmerProperties.length;
        for (const entry of landData.farmerProperties) {
          const prop = Array.isArray(entry) ? entry[1] : entry;
          if (prop && prop.id) {
            const ok = await SupabaseRepo.upsertProperty(prop);
            if (!ok) report.errors.push(`Failed to upsert property ${prop.id}`);
          }
        }
      }

      // Land Records
      if (Array.isArray(landData.landRecords)) {
        report.counts.landRecordsJson = landData.landRecords.length;
        for (const entry of landData.landRecords) {
          const rec = Array.isArray(entry) ? entry[1] : entry;
          if (rec && rec.id) {
            const ok = await SupabaseRepo.upsertLandRecord(rec);
            if (!ok) report.errors.push(`Failed to upsert land record ${rec.id}`);
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // 3. MIGRATE MANDI HISTORY (Official Cached Observations)
    // ------------------------------------------------------------------------
    if (fs.existsSync(mandiHistoryPath)) {
      const raw = fs.readFileSync(mandiHistoryPath, 'utf8');
      const mandiRecords = JSON.parse(raw);
      if (Array.isArray(mandiRecords)) {
        report.counts.mandiRecordsJson = mandiRecords.length;
        const inserted = await SupabaseRepo.insertMandiObservations(mandiRecords);
        report.counts.mandiRecordsSupabase = inserted;
      }
    }

    // ------------------------------------------------------------------------
    // 4. VERIFY COUNTS IN SUPABASE
    // ------------------------------------------------------------------------
    const supaUsers = await SupabaseRepo.getAllUsers();
    const supaCrops = await SupabaseRepo.getAllCropListings();
    const supaOrders = await SupabaseRepo.getAllOrders();
    const supaReqs = await SupabaseRepo.getAllRequirements();
    const supaThreads = await SupabaseRepo.getAllMessageThreads();
    const supaProps = await SupabaseRepo.getAllProperties();
    const supaLand = await SupabaseRepo.getAllLandRecords();
    const supaProc = await SupabaseRepo.getAllProcessingRecords();
    const supaLogs = await SupabaseRepo.getAllAuditLogs();

    report.counts.usersSupabase = supaUsers.length;
    report.counts.cropListingsSupabase = supaCrops.length;
    report.counts.ordersSupabase = supaOrders.length;
    report.counts.requirementsSupabase = supaReqs.length;
    report.counts.messagesSupabase = supaThreads.length;
    report.counts.propertiesSupabase = supaProps.length;
    report.counts.landRecordsSupabase = supaLand.length;
    report.counts.processingRecordsSupabase = supaProc.length;
    report.counts.auditLogsSupabase = supaLogs.length;

    report.success = report.errors.length === 0;
    report.status = report.success ? 'completed' : 'failed';
    report.message = report.success
      ? `Migration successfully completed. Migrated ${supaUsers.length} users, ${supaCrops.length} crop listings, ${supaOrders.length} orders.`
      : `Migration completed with ${report.errors.length} warnings/errors.`;

    return report;
  } catch (err: any) {
    report.status = 'failed';
    report.success = false;
    report.message = `Migration exception: ${err?.message || err}`;
    report.errors.push(err?.message || String(err));
    return report;
  }
}
