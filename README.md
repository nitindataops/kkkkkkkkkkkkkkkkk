# 🌾 Kisan Saathi

## Aapki Fasal, Aapka Bazaar

**Kisan Saathi** is a smart digital agriculture marketplace designed to
connect farmers directly with buyers, mills, and institutional
purchasers. It combines AI-assisted crop intelligence, government mandi
reference data, farmer verification, location-aware discovery, direct
communication, and digital order management in one farmer-friendly
platform.

> **Vision:** Connect the person who grows the crop directly with the
> person who needs it.

------------------------------------------------------------------------

## 🚜 Problem

Farmers can face limited direct access to reliable buyers, dependence on
intermediaries, difficulty comparing market prices, fragmented
communication, and challenges in presenting crop quality digitally.

Kisan Saathi addresses these problems by creating a direct digital
bridge:

**Farmer → Kisan Saathi → Buyer**

------------------------------------------------------------------------

## ✨ Key Features

### 👨‍🌾 Farmer Portal

-   Secure farmer registration and authentication
-   Farm and land details
-   Crop inventory and listing management
-   Camera-only crop photo capture
-   AI-assisted crop quality assessment
-   Premium / Standard / Unverified quality states
-   Government mandi-linked reference pricing
-   Buyer enquiries and messaging
-   Order management
-   Mandi-rate information
-   Multilingual, Hindi-first interface

### 🛒 Buyer Portal

-   Agriculture marketplace
-   Crop and variety discovery
-   Search, filters, and sorting
-   Farmer profiles
-   Product detail pages
-   Actual listing images
-   Location/GPS information where permitted
-   Mandi-linked price comparison
-   Similar lots and smart alternatives
-   Cart and Buy Now
-   Orders and procurement tracking
-   Direct messaging and favorites
-   Buyer requirements

### 🤖 AI & Smart Chatbot

Kisan Saathi separates crop-health analysis from produce-quality
grading.

Quality states: - **Premium** --- eligible for the defined
mandi-reference premium - **Standard** --- uses the defined
mandi-reference benchmark - **Unverified** --- used when AI cannot
reliably determine quality

The chatbot supports application actions such as viewing crops,
profiles, orders, listings, mandi rates, marketplace, messages,
settings, and language changes. Deterministic requests can bypass
unnecessary LLM calls for faster responses.

### 📷 Camera-First Crop Capture

The Add Crop workflow uses the device camera instead of gallery/file
uploads:

``` text
Open Camera → Live Preview → Capture → Review → Retake/Confirm → AI Analysis → Listing
```

### 💰 Transparent Pricing

-   **Standard:** government mandi reference rate
-   **Premium:** government mandi reference rate + 5%
-   **Unverified:** government mandi reference rate without an unearned
    quality premium

Unit normalization is handled where required between ₹/kg, ₹/quintal,
and ₹/tonne.

### 📊 Government Mandi Reference Data

The platform uses the Government of India mandi-price data available
through data.gov.in as a reference source. The application treats
returned government observations as daily market references, not as a
tick-by-tick trading feed.

### 🌐 Languages

-   Hindi
-   English
-   Punjabi
-   Haryanvi
-   Telugu
-   Tamil

### 🧑‍💼 Admin Portal

Centralized management for: - Farmers - Buyers - Crop listings -
Orders - Enquiries - Verifications - Locations - Reports - Settings -
System health

------------------------------------------------------------------------

## 🌱 Active Crop Categories

1.  Wheat
2.  Rice / Paddy
3.  Maize
4.  Pulses / Chana

The application uses a shared crop-to-variety registry so Farmer and
Buyer experiences remain consistent.

------------------------------------------------------------------------

## 🏗️ Architecture

``` text
                    ┌─────────────────────┐
                    │    Kisan Saathi     │
                    │    Web Platform     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌───────────┐    ┌───────────┐    ┌───────────┐
        │  Farmer   │    │   Buyer   │    │   Admin   │
        │  Portal   │    │  Portal   │    │  Portal   │
        └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
              └────────────────┼─────────────────┘
                               ▼
                     ┌──────────────────┐
                     │ Node/TypeScript  │
                     │ Backend Server   │
                     └────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
       ┌────────────┐  ┌────────────┐  ┌──────────────┐
       │  Supabase  │  │ AI Services│  │ Government   │
       │ DB/Storage │  │ / LLM      │  │ Mandi Data   │
       └────────────┘  └────────────┘  └──────────────┘
```

------------------------------------------------------------------------

## 🛠️ Technology Stack

**Frontend** - React - TypeScript - Vite - HTML/CSS

**Backend** - Node.js - TypeScript - esbuild

**Database & Storage** - Supabase - PostgreSQL-backed persistence -
Supabase Storage where configured

**AI** - AI/LLM integration - AI-assisted crop quality assessment -
Agricultural chatbot

**Government Data** - data.gov.in mandi-price dataset

**Deployment** - GitHub - Render

------------------------------------------------------------------------

## 🔐 Security

-   Sensitive API keys remain server-side.
-   Supabase service-role credentials must never be exposed to the
    frontend.
-   Admin credentials are server-side configuration.
-   Sensitive identity information is not unnecessarily logged.
-   Authenticated data is scoped to the relevant user.
-   AI failures do not result in fabricated quality classifications.
-   Production `.env` files and secrets must never be committed to
    GitHub.

------------------------------------------------------------------------

## ⚙️ Development

``` bash
npm install
npm run dev
```

Type-check:

``` bash
npm run lint
```

Production build:

``` bash
npm run build
```

Production start:

``` bash
npm start
```

### Render

Build command:

``` bash
npm install && npm run build
```

Start command:

``` bash
npm start
```

Configure required production environment variables in Render. Never
commit production secrets to GitHub.

------------------------------------------------------------------------

## 📈 Impact

### For Farmers

-   Direct access to buyers
-   Better visibility for available produce
-   Transparent market references
-   Digital crop management
-   AI-assisted quality communication
-   Easier buyer discovery

### For Buyers

-   Faster produce discovery
-   Direct farmer connectivity
-   Better crop and listing information
-   Government mandi-linked price reference
-   Digital procurement and tracking
-   Location-aware farmer discovery

### For the Agriculture Ecosystem

-   More transparent market communication
-   Better digital traceability
-   Data-driven agricultural support
-   Multilingual accessibility
-   Stronger farmer-buyer connectivity

------------------------------------------------------------------------

## 🏆 Why Kisan Saathi?

1.  **Direct Farmer-to-Buyer Connectivity** --- built around direct
    market access.
2.  **Camera-First Produce Capture** --- real camera capture for crop
    listings.
3.  **Honest AI** --- unreliable AI results become explicitly Unverified
    instead of being fabricated.
4.  **Government-Linked Reference Pricing** --- pricing is anchored to
    available government mandi observations.
5.  **Unified Ecosystem** --- Farmer, Buyer, and Admin workflows share
    the same core platform.
6.  **Accessible by Design** --- multilingual and Hindi-first
    experience.

------------------------------------------------------------------------

## 🧭 Core Journey

### Farmer

``` text
Register
  ↓
Profile / Verification
  ↓
Add Farm
  ↓
Add Crop
  ↓
Capture Image
  ↓
AI Quality Assessment
  ↓
Mandi-Linked Pricing
  ↓
Publish Listing
  ↓
Buyer Interest
  ↓
Order / Communication
```

### Buyer

``` text
Marketplace
  ↓
Search / Filter
  ↓
Product Details
  ↓
Farmer + Location + Price
  ↓
Cart / Buy Now
  ↓
Order
  ↓
Tracking
  ↓
Farmer Communication
```

------------------------------------------------------------------------

## 🧪 Quality & Reliability

The project includes checks covering: - TypeScript compilation -
Production build - Authentication - Supabase persistence - Marketplace
synchronization - AI quality states - Mandi-linked pricing -
Multilingual translations - Chatbot intent handling - Product details -
Buyer orders - Camera-based crop capture

External services can still be affected by network availability,
provider limits, permissions, or government-data availability.

------------------------------------------------------------------------

## 📌 Important Notes

-   Government mandi data represents available government daily
    observations, not a real-time exchange feed.
-   AI output is an assisted assessment and is not a substitute for
    official certification or laboratory testing.
-   Camera capture does not by itself prove crop authenticity.
-   Location features require appropriate device/browser permission.
-   Production secrets must be configured through the deployment
    environment.

------------------------------------------------------------------------

## 🌾 Kisan Saathi

### **Aapki Fasal, Aapka Bazaar**

A farmer-first digital agriculture ecosystem connecting **produce,
people, information, and markets** through technology.
