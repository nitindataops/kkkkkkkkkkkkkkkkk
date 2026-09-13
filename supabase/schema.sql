-- ============================================================================
-- KISANSETU SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Description: Canonical database schema for KisanSetu Agriculture Marketplace
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. UPDATED_AT TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. USERS TABLE
-- Root authentication and account identities (Farmer, Buyer, Admin)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY,
    role VARCHAR(32) NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
    identifier VARCHAR(255) NOT NULL UNIQUE,
    mobile_number VARCHAR(32) NOT NULL,
    mobile_verified BOOLEAN DEFAULT false,
    mobile_verified_at TIMESTAMPTZ,
    email VARCHAR(255),
    password_salt VARCHAR(64) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_identifier ON users(identifier);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. AUTH SESSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_sessions (
    token VARCHAR(256) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);

-- ----------------------------------------------------------------------------
-- 5. FARMER PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farmer_profiles (
    farmer_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    mobile VARCHAR(32),
    email VARCHAR(255),
    address TEXT,
    state VARCHAR(128) DEFAULT 'Uttar Pradesh',
    district VARCHAR(128) NOT NULL,
    tehsil VARCHAR(128) NOT NULL,
    village VARCHAR(128) NOT NULL,
    pin_code VARCHAR(16) NOT NULL,
    land_area_acres NUMERIC(10, 2) DEFAULT 0,
    land_type VARCHAR(64) DEFAULT 'Irrigated Fertile',
    soil_type VARCHAR(128),
    irrigation_source VARCHAR(128),
    primary_crops JSONB DEFAULT '["Wheat", "Rice / Paddy"]'::jsonb,
    aadhaar_masked VARCHAR(32) DEFAULT 'XXXX-XXXX-8492',
    e_kyc_status VARCHAR(64) DEFAULT 'VERIFIED ✓',
    kcc_status VARCHAR(64) DEFAULT 'Active',
    soil_health_status VARCHAR(64) DEFAULT 'Optimal (NPK Balanced)',
    bank_account_verified BOOLEAN DEFAULT false,
    bank_details JSONB,
    aadhaar_verified BOOLEAN DEFAULT false,
    aadhaar_number_masked VARCHAR(32),
    aadhaar_front_url TEXT,
    aadhaar_back_url TEXT,
    up_bhulekh_status VARCHAR(64) DEFAULT 'Verified',
    is_approved_by_admin BOOLEAN DEFAULT true,
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    farmer_registry_id VARCHAR(128),
    farmer_registry_document_url TEXT,
    farmer_registry_file_name VARCHAR(255),
    farmer_registry_ocr_status VARCHAR(64) DEFAULT 'pending',
    farmer_registry_verification_status VARCHAR(64) DEFAULT 'MATCHED',
    farmer_registry_ocr_data JSONB,
    farmer_registry_submitted_at TIMESTAMPTZ,
    extra_data JSONB DEFAULT '{}'::jsonb,
    member_since TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON farmer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_district ON farmer_profiles(district);

DROP TRIGGER IF EXISTS trg_farmer_profiles_updated_at ON farmer_profiles;
CREATE TRIGGER trg_farmer_profiles_updated_at
BEFORE UPDATE ON farmer_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. BUYER PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buyer_profiles (
    buyer_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(128) NOT NULL,
    mobile VARCHAR(32) NOT NULL,
    contact_number VARCHAR(32),
    email VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    state VARCHAR(128) DEFAULT 'Uttar Pradesh',
    district VARCHAR(128) NOT NULL,
    pincode VARCHAR(16) NOT NULL,
    delivery_address TEXT NOT NULL,
    gstin_masked VARCHAR(32),
    pan_masked VARCHAR(32),
    verified BOOLEAN DEFAULT false,
    preferred_crops JSONB DEFAULT '["Wheat", "Rice / Paddy"]'::jsonb,
    is_demo_profile BOOLEAN DEFAULT false,
    extra_data JSONB DEFAULT '{}'::jsonb,
    member_since TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user_id ON buyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_district ON buyer_profiles(district);

DROP TRIGGER IF EXISTS trg_buyer_profiles_updated_at ON buyer_profiles;
CREATE TRIGGER trg_buyer_profiles_updated_at
BEFORE UPDATE ON buyer_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 7. CROP VARIETIES REFERENCE TABLE
-- Preserves the active crops and approved varieties
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crop_varieties (
    id VARCHAR(64) PRIMARY KEY,
    crop_name VARCHAR(64) NOT NULL CHECK (crop_name IN ('Wheat', 'Rice / Paddy', 'Maize', 'Pulses / Chana')),
    crop_name_hi VARCHAR(64) NOT NULL,
    variety_name VARCHAR(128) NOT NULL,
    variety_name_hi VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Cereals / Grains', 'Pulses')),
    grade_reference VARCHAR(128),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (crop_name, variety_name)
);

CREATE INDEX IF NOT EXISTS idx_crop_varieties_crop ON crop_varieties(crop_name);
CREATE INDEX IF NOT EXISTS idx_crop_varieties_name ON crop_varieties(variety_name);

-- Seed Canonical Approved Crop Varieties
INSERT INTO crop_varieties (id, crop_name, crop_name_hi, variety_name, variety_name_hi, category, grade_reference)
VALUES
    -- Wheat (6 Approved Varieties)
    ('wht_sharbati', 'Wheat', 'गेहूं', 'Sharbati', 'शरबती', 'Cereals / Grains', 'Premium Luster Grain'),
    ('wht_pbw_550', 'Wheat', 'गेहूं', 'PBW 550', 'पीबीडब्ल्यू 550', 'Cereals / Grains', 'High Yield Mandi Standard'),
    ('wht_hd_2967', 'Wheat', 'गेहूं', 'HD 2967', 'एचडी 2967', 'Cereals / Grains', 'All-India Major Bread Wheat'),
    ('wht_lokwan', 'Wheat', 'गेहूं', 'Lokwan', 'लोकवान', 'Cereals / Grains', 'Golden Commercial Grade'),
    ('wht_wh_1105', 'Wheat', 'गेहूं', 'WH 1105', 'डब्ल्यूएच 1105', 'Cereals / Grains', 'Disease Resistant FAQ'),
    ('wht_kalyansona', 'Wheat', 'गेहूं', 'Kalyansona', 'कल्याणसोना', 'Cereals / Grains', 'Traditional High Quality'),

    -- Rice / Paddy (6 Approved Varieties)
    ('rice_basmati_1121', 'Rice / Paddy', 'धान / चावल', 'Basmati 1121', 'बासमती 1121', 'Cereals / Grains', 'Extra Long Aromatic Grain'),
    ('rice_pusa_1509', 'Rice / Paddy', 'धान / चावल', 'Pusa 1509', 'पूसा 1509', 'Cereals / Grains', 'Early Maturing Export Grade'),
    ('rice_pr_126', 'Rice / Paddy', 'धान / चावल', 'PR 126', 'पीआर 126', 'Cereals / Grains', 'High Milling FAQ Grade'),
    ('rice_sona_masoori', 'Rice / Paddy', 'धान / चावल', 'Sona Masoori', 'सोना मसूरी', 'Cereals / Grains', 'Delicate Table Grain'),
    ('rice_sharbati_paddy', 'Rice / Paddy', 'धान / चावल', 'Sharbati Paddy', 'शरबती धान', 'Cereals / Grains', 'Slender Grain Standard'),
    ('rice_govindobhog', 'Rice / Paddy', 'धान / चावल', 'Govindobhog', 'गोविंदभोग', 'Cereals / Grains', 'Heritage Sweet Aromatic'),

    -- Maize (5 Approved Varieties)
    ('mz_hqpm_1', 'Maize', 'मक्का', 'HQPM-1 Yellow', 'एचक्यूपीएम-1 पीला', 'Cereals / Grains', 'High Quality Protein Maize'),
    ('mz_african_tall', 'Maize', 'मक्का', 'African Tall', 'अफ्रीकन टॉल', 'Cereals / Grains', 'Fodder & Grain Hybrid'),
    ('mz_dhm_117', 'Maize', 'मक्का', 'DHM 117', 'डीएचएम 117', 'Cereals / Grains', 'Drought Tolerant Hybrid'),
    ('mz_pioneer_hybrid', 'Maize', 'मक्का', 'Pioneer Hybrid', 'पायनियर हाइब्रिड', 'Cereals / Grains', 'High Starch Industrial'),
    ('mz_sweet_corn_sugar_75', 'Maize', 'मक्का', 'Sweet Corn Sugar-75', 'स्वीट कॉर्न शुगर-75', 'Cereals / Grains', 'Speciality Food Grade'),

    -- Pulses / Chana (5 Approved Varieties)
    ('pls_desi_chana', 'Pulses / Chana', 'दालें / चना', 'Desi Chana (JG-11)', 'देसी चना (जेजी-11)', 'Pulses', 'Bold Seed Mandi Grade'),
    ('pls_kabuli_chana', 'Pulses / Chana', 'दालें / चना', 'Kabuli Chana (Dollar)', 'काबुली चना (डॉलर)', 'Pulses', 'Extra Bold Export Grade'),
    ('pls_moong', 'Pulses / Chana', 'दालें / चना', 'Moong (IPM 205-7)', 'मूंग (आईपीएम 205-7)', 'Pulses', 'Shiny Green High Protein'),
    ('pls_urad', 'Pulses / Chana', 'दालें / चना', 'Urad (Pant U-31)', 'उड़द (पंत यू-31)', 'Pulses', 'Black Gram Dal Quality'),
    ('pls_arhar_tur', 'Pulses / Chana', 'दालें / चना', 'Arhar/Tur (BDN-711)', 'अरहर/तूर (बीडीएन-711)', 'Pulses', 'Pigeon Pea Split Grade')
ON CONFLICT (crop_name, variety_name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. FARMER PROPERTIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farmer_properties (
    id VARCHAR(128) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmer_profiles(farmer_id) ON DELETE CASCADE,
    district VARCHAR(128) NOT NULL,
    tehsil VARCHAR(128) NOT NULL,
    village VARCHAR(128) NOT NULL,
    gata_number VARCHAR(64) NOT NULL,
    khatauni_number VARCHAR(64),
    land_area NUMERIC(10, 2) NOT NULL,
    land_area_unit VARCHAR(32) DEFAULT 'Acre',
    status VARCHAR(64) DEFAULT 'Not Verified',
    status_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farmer_properties_farmer_id ON farmer_properties(farmer_id);

DROP TRIGGER IF EXISTS trg_farmer_properties_updated_at ON farmer_properties;
CREATE TRIGGER trg_farmer_properties_updated_at
BEFORE UPDATE ON farmer_properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 9. LAND VERIFICATION RECORDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS land_verification_records (
    id VARCHAR(128) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmer_profiles(farmer_id) ON DELETE CASCADE,
    farmer_name VARCHAR(255) NOT NULL,
    farmer_mobile VARCHAR(32) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    district VARCHAR(128) NOT NULL,
    tehsil VARCHAR(128) NOT NULL,
    village VARCHAR(128) NOT NULL,
    khata_number VARCHAR(64) NOT NULL,
    khasra_number VARCHAR(64) NOT NULL,
    land_area NUMERIC(10, 2) NOT NULL,
    land_unit VARCHAR(32) DEFAULT 'Acres',
    owner_name_in_khatauni VARCHAR(255) NOT NULL,
    status VARCHAR(64) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Needs Correction', 'Rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(255),
    admin_notes TEXT,
    official_up_bhulekh_verified BOOLEAN DEFAULT false,
    verification_source VARCHAR(128) DEFAULT 'Admin Manual Review'
);

CREATE INDEX IF NOT EXISTS idx_land_verification_farmer_id ON land_verification_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_land_verification_status ON land_verification_records(status);

-- ----------------------------------------------------------------------------
-- 10. CROP LISTINGS TABLE
-- Canonical listing repository serving both Farmer and Buyer views
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crop_listings (
    id VARCHAR(128) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmer_profiles(farmer_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    crop_name VARCHAR(255),
    variety VARCHAR(128) NOT NULL,
    category VARCHAR(128) NOT NULL,
    quantity_kg NUMERIC(12, 2) NOT NULL CHECK (quantity_kg >= 0),
    quantity VARCHAR(64),
    price NUMERIC(10, 2),
    expected_price NUMERIC(10, 2) NOT NULL,
    price_unit VARCHAR(32) DEFAULT '₹/kg',
    pricing_type VARCHAR(64),
    harvest_date VARCHAR(64),
    processing_yield_percent NUMERIC(5, 2),
    grade VARCHAR(32) NOT NULL,
    quality_classification VARCHAR(32) DEFAULT 'STANDARD',
    pricing_type_tier VARCHAR(32) DEFAULT 'STANDARD',
    is_manual_classification BOOLEAN DEFAULT false,
    captured_via_camera BOOLEAN DEFAULT false,
    location VARCHAR(255) NOT NULL,
    district VARCHAR(128),
    state VARCHAR(128) DEFAULT 'Uttar Pradesh',
    nearest_mandi VARCHAR(128),
    current_mandi_price NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(64) DEFAULT 'Available',
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    organic_certified BOOLEAN DEFAULT false,
    up_bhulekh_verified BOOLEAN DEFAULT true,
    quality_score NUMERIC(5, 2) DEFAULT 88.0,
    moisture_percent NUMERIC(5, 2),
    grain_uniformity_percent NUMERIC(5, 2),
    description TEXT,
    batch_id VARCHAR(64),
    coordinates JSONB,
    produce_type VARCHAR(32) DEFAULT 'raw' CHECK (produce_type IN ('raw', 'processed')),
    processing_type VARCHAR(64),
    source_crop_id VARCHAR(128),
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_listings_farmer_id ON crop_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_listings_status ON crop_listings(status);
CREATE INDEX IF NOT EXISTS idx_crop_listings_category ON crop_listings(category);
CREATE INDEX IF NOT EXISTS idx_crop_listings_variety ON crop_listings(variety);
CREATE INDEX IF NOT EXISTS idx_crop_listings_district ON crop_listings(district);

DROP TRIGGER IF EXISTS trg_crop_listings_updated_at ON crop_listings;
CREATE TRIGGER trg_crop_listings_updated_at
BEFORE UPDATE ON crop_listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 11. POST-HARVEST PROCESSING RECORDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_harvest_records (
    id VARCHAR(128) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmer_profiles(farmer_id) ON DELETE CASCADE,
    crop_id VARCHAR(128) NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    crop_variety VARCHAR(128) NOT NULL,
    processing_type VARCHAR(128) NOT NULL,
    input_quantity_kg NUMERIC(10, 2) NOT NULL,
    output_quantity_kg NUMERIC(10, 2) NOT NULL,
    recovery_rate_percent NUMERIC(5, 2) NOT NULL,
    processing_date VARCHAR(64) NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    facility_location VARCHAR(255) NOT NULL,
    quality_score NUMERIC(5, 2) DEFAULT 90,
    notes TEXT,
    batch_number VARCHAR(64) NOT NULL,
    status VARCHAR(64) NOT NULL,
    published_to_listing_id VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_harvest_farmer_id ON post_harvest_records(farmer_id);

DROP TRIGGER IF EXISTS trg_post_harvest_updated_at ON post_harvest_records;
CREATE TRIGGER trg_post_harvest_updated_at
BEFORE UPDATE ON post_harvest_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 12. BUYER ORDERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buyer_orders (
    id VARCHAR(128) PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL UNIQUE,
    buyer_id VARCHAR(64) NOT NULL REFERENCES buyer_profiles(buyer_id) ON DELETE RESTRICT,
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(32),
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmer_profiles(farmer_id) ON DELETE RESTRICT,
    farmer_name VARCHAR(255),
    farmer_phone VARCHAR(32),
    crop VARCHAR(255),
    variety VARCHAR(128),
    grade VARCHAR(32),
    quantity_kg NUMERIC(10, 2),
    price_per_kg NUMERIC(10, 2),
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(64) DEFAULT 'Pending',
    delivery_address TEXT NOT NULL,
    payment_method VARCHAR(64) DEFAULT 'Mandi Escrow',
    payment_status VARCHAR(64) DEFAULT 'Pending Escrow',
    tracking_number VARCHAR(128),
    vehicle_number VARCHAR(64),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(32),
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    estimated_delivery VARCHAR(64),
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_orders_buyer_id ON buyer_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_orders_farmer_id ON buyer_orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_orders_status ON buyer_orders(status);

DROP TRIGGER IF EXISTS trg_buyer_orders_updated_at ON buyer_orders;
CREATE TRIGGER trg_buyer_orders_updated_at
BEFORE UPDATE ON buyer_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 13. ORDER ITEMS TABLE (Normalized Line Items)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(128) PRIMARY KEY,
    order_id VARCHAR(128) NOT NULL REFERENCES buyer_orders(id) ON DELETE CASCADE,
    listing_id VARCHAR(128) REFERENCES crop_listings(id) ON DELETE SET NULL,
    crop_name VARCHAR(255) NOT NULL,
    variety VARCHAR(128) NOT NULL,
    grade VARCHAR(32),
    batch_id VARCHAR(64),
    quantity_kg NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_listing_id ON order_items(listing_id);

-- ----------------------------------------------------------------------------
-- 14. BUYER REQUIREMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buyer_requirements (
    id VARCHAR(128) PRIMARY KEY,
    requirement_number VARCHAR(64) NOT NULL UNIQUE,
    buyer_id VARCHAR(64) NOT NULL REFERENCES buyer_profiles(buyer_id) ON DELETE CASCADE,
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(32),
    buyer_company VARCHAR(255),
    crop_name VARCHAR(255) NOT NULL,
    variety VARCHAR(128) NOT NULL,
    quantity_required NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(32) DEFAULT 'kg',
    max_target_price_per_unit NUMERIC(10, 2) NOT NULL,
    target_delivery_date VARCHAR(64),
    delivery_location TEXT NOT NULL,
    state VARCHAR(128) DEFAULT 'Uttar Pradesh',
    district VARCHAR(128) NOT NULL,
    status VARCHAR(64) DEFAULT 'ACTIVE',
    notes TEXT,
    responses_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_requirements_buyer_id ON buyer_requirements(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_status ON buyer_requirements(status);

DROP TRIGGER IF EXISTS trg_buyer_requirements_updated_at ON buyer_requirements;
CREATE TRIGGER trg_buyer_requirements_updated_at
BEFORE UPDATE ON buyer_requirements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 15. MESSAGE THREADS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_threads (
    thread_id VARCHAR(128) PRIMARY KEY,
    buyer_id VARCHAR(64) NOT NULL REFERENCES buyer_profiles(buyer_id) ON DELETE CASCADE,
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(32),
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmer_profiles(farmer_id) ON DELETE CASCADE,
    farmer_name VARCHAR(255),
    farmer_phone VARCHAR(32),
    listing_id VARCHAR(128) REFERENCES crop_listings(id) ON DELETE SET NULL,
    crop_name VARCHAR(255),
    variety VARCHAR(128),
    status VARCHAR(64) DEFAULT 'ACTIVE',
    messages JSONB DEFAULT '[]'::jsonb,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_threads_buyer_id ON message_threads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_farmer_id ON message_threads(farmer_id);

DROP TRIGGER IF EXISTS trg_message_threads_updated_at ON message_threads;
CREATE TRIGGER trg_message_threads_updated_at
BEFORE UPDATE ON message_threads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 16. THREAD MESSAGES TABLE (Normalized Messages)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS thread_messages (
    id VARCHAR(128) PRIMARY KEY,
    thread_id VARCHAR(128) NOT NULL REFERENCES message_threads(thread_id) ON DELETE CASCADE,
    sender VARCHAR(32) NOT NULL CHECK (sender IN ('buyer', 'farmer', 'system')),
    sender_name VARCHAR(255),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thread_messages_thread_id ON thread_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_messages_created_at ON thread_messages(created_at);

-- ----------------------------------------------------------------------------
-- 17. BUYER CART ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buyer_cart_items (
    id VARCHAR(128) PRIMARY KEY,
    buyer_id VARCHAR(64) NOT NULL REFERENCES buyer_profiles(buyer_id) ON DELETE CASCADE,
    listing_id VARCHAR(128) NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
    crop VARCHAR(255) NOT NULL,
    variety VARCHAR(128) NOT NULL,
    grade VARCHAR(32),
    farmer_id VARCHAR(64) NOT NULL,
    farmer_name VARCHAR(255),
    farmer_location VARCHAR(255),
    farmer_verified BOOLEAN DEFAULT true,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL,
    available_quantity_kg NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    min_order_qty_kg NUMERIC(10, 2) DEFAULT 50,
    batch_id VARCHAR(64),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_cart_items_buyer_id ON buyer_cart_items(buyer_id);

-- ----------------------------------------------------------------------------
-- 18. BUYER FAVORITES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buyer_favorites (
    buyer_id VARCHAR(64) NOT NULL REFERENCES buyer_profiles(buyer_id) ON DELETE CASCADE,
    listing_id VARCHAR(128) NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (buyer_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_buyer_favorites_buyer_id ON buyer_favorites(buyer_id);

-- ----------------------------------------------------------------------------
-- 19. ADMIN AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id VARCHAR(128) PRIMARY KEY,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(128) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(128) NOT NULL,
    target_name VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(64),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp ON admin_audit_logs(timestamp DESC);

-- ----------------------------------------------------------------------------
-- 20. SUPPORT TICKETS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(32) DEFAULT 'farmer',
    user_phone VARCHAR(32),
    user_email VARCHAR(255),
    channel VARCHAR(32) NOT NULL CHECK (channel IN ('WEB_CHAT', 'PHONE', 'EMAIL', 'WHATSAPP')),
    category VARCHAR(64) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    conversation_summary TEXT,
    priority VARCHAR(32) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(64) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'ESCALATED', 'RESOLVED', 'CLOSED')),
    assigned_to VARCHAR(255),
    language VARCHAR(32) DEFAULT 'hi-IN',
    messages JSONB DEFAULT '[]'::jsonb,
    resolution JSONB,
    satisfaction JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
BEFORE UPDATE ON support_tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 21. MANDI PRICE HISTORY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mandi_price_history (
    id BIGSERIAL PRIMARY KEY,
    observation_date VARCHAR(32) NOT NULL,
    arrival_date VARCHAR(32) NOT NULL,
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    market VARCHAR(128) NOT NULL,
    commodity VARCHAR(128) NOT NULL,
    variety VARCHAR(128),
    grade VARCHAR(64),
    min_price NUMERIC(10, 2) NOT NULL,
    max_price NUMERIC(10, 2) NOT NULL,
    modal_price NUMERIC(10, 2) NOT NULL,
    raw_date VARCHAR(32),
    display_date VARCHAR(64),
    timestamp BIGINT,
    source VARCHAR(255) DEFAULT 'AGMARKNET (DMI, GoI)',
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (observation_date, state, district, market, commodity, variety)
);

CREATE INDEX IF NOT EXISTS idx_mandi_history_commodity ON mandi_price_history(commodity, market, observation_date);

-- ----------------------------------------------------------------------------
-- 22. MANDI SYNC METADATA TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mandi_sync_metadata (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    last_successful_ingestion TIMESTAMPTZ,
    last_observation_date VARCHAR(32),
    records_in_latest_snapshot INT DEFAULT 0,
    total_historical_records INT DEFAULT 0,
    unique_observation_dates INT DEFAULT 0,
    oldest_observation_date VARCHAR(32),
    latest_observation_date VARCHAR(32),
    last_error TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 23. ATOMIC STORED PROCEDURE: INVENTORY DEDUCTION & ORDER CREATION
-- Prevents overselling during concurrent buyer checkouts
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION place_order_with_inventory_deduction(
    p_order_id VARCHAR(128),
    p_order_number VARCHAR(64),
    p_buyer_id VARCHAR(64),
    p_buyer_name VARCHAR(255),
    p_buyer_phone VARCHAR(32),
    p_farmer_id VARCHAR(64),
    p_farmer_name VARCHAR(255),
    p_farmer_phone VARCHAR(32),
    p_listing_id VARCHAR(128),
    p_quantity_kg NUMERIC(10, 2),
    p_price_per_kg NUMERIC(10, 2),
    p_total_amount NUMERIC(12, 2),
    p_delivery_address TEXT,
    p_items JSONB,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_qty NUMERIC(12, 2);
    v_crop_record RECORD;
BEGIN
    -- 1. Lock and fetch crop listing row to prevent race conditions
    SELECT * INTO v_crop_record FROM crop_listings WHERE id = p_listing_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Crop listing not found: ' || p_listing_id);
    END IF;

    -- 2. Validate quantity availability
    IF v_crop_record.quantity_kg < p_quantity_kg THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Insufficient inventory. Available: ' || v_crop_record.quantity_kg || ' kg, Requested: ' || p_quantity_kg || ' kg'
        );
    END IF;

    -- 3. Calculate remaining quantity
    v_current_qty := v_crop_record.quantity_kg - p_quantity_kg;

    -- 4. Deduct inventory and update status if depleted
    UPDATE crop_listings 
    SET 
        quantity_kg = v_current_qty,
        status = CASE WHEN v_current_qty <= 0 THEN 'Sold Out' ELSE status END,
        updated_at = NOW()
    WHERE id = p_listing_id;

    -- 5. Insert order
    INSERT INTO buyer_orders (
        id, order_number, buyer_id, buyer_name, buyer_phone,
        farmer_id, farmer_name, farmer_phone, crop, variety,
        grade, quantity_kg, price_per_kg, total_amount, status,
        delivery_address, payment_method, payment_status, notes,
        items, order_date, created_at, updated_at
    ) VALUES (
        p_order_id, p_order_number, p_buyer_id, p_buyer_name, p_buyer_phone,
        p_farmer_id, p_farmer_name, p_farmer_phone, v_crop_record.name, v_crop_record.variety,
        v_crop_record.grade, p_quantity_kg, p_price_per_kg, p_total_amount, 'Pending',
        p_delivery_address, 'Mandi Escrow', 'Pending Escrow', p_notes,
        p_items, NOW(), NOW(), NOW()
    );

    -- 6. Insert normalized line item
    INSERT INTO order_items (
        id, order_id, listing_id, crop_name, variety,
        grade, batch_id, quantity_kg, price_per_kg, line_total, created_at
    ) VALUES (
        'item_' || p_order_id, p_order_id, p_listing_id, v_crop_record.name, v_crop_record.variety,
        v_crop_record.grade, v_crop_record.batch_id, p_quantity_kg, p_price_per_kg, p_total_amount, NOW()
    );

    RETURN jsonb_build_object(
        'success', true, 
        'remaining_quantity_kg', v_current_qty,
        'order_id', p_order_id,
        'order_number', p_order_number
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 24. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_sync_metadata ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public Read Crop Listings" ON crop_listings FOR SELECT USING (true);
CREATE POLICY "Public Read Mandi History" ON mandi_price_history FOR SELECT USING (true);
CREATE POLICY "Public Read Crop Varieties" ON crop_varieties FOR SELECT USING (true);
CREATE POLICY "Public Read Mandi Metadata" ON mandi_sync_metadata FOR SELECT USING (true);

-- Backend Service Role Policies (Allows full operational access to backend services)
CREATE POLICY "Service Role All Access Users" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Auth Sessions" ON auth_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Farmer Profiles" ON farmer_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Buyer Profiles" ON buyer_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Properties" ON farmer_properties FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Land Verification" ON land_verification_records FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Crop Listings" ON crop_listings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Post Harvest" ON post_harvest_records FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Orders" ON buyer_orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Order Items" ON order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Requirements" ON buyer_requirements FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Messages" ON message_threads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Thread Messages" ON thread_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Cart" ON buyer_cart_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Favorites" ON buyer_favorites FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Audit Logs" ON admin_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Support Tickets" ON support_tickets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Mandi History" ON mandi_price_history FOR ALL TO service_role USING (true) WITH CHECK (true);
