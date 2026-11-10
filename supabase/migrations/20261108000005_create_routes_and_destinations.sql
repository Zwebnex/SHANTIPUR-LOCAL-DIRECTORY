-- ==============================================================================
-- Migration: 20261108000005_create_routes_and_destinations.sql
-- Description: Shantipur Heritage Route Discovery & GIS Navigation Database
-- Tables: public.destinations, public.festival_event_venues, public.curated_routes
-- Security: Strict Row Level Security (RLS) with Owner-Only Admin Mutation Policies
-- ==============================================================================

-- 1. Create Destinations Table
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bengali_name TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'temple', 
        'cultural_event_venue', 
        'vaishnava_heritage', 
        'historic_landmark', 
        'historic_ghat', 
        'handloom_hub'
    )),
    address TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    google_place_id TEXT,
    google_maps_url TEXT,
    plus_code TEXT,
    description TEXT NOT NULL,
    description_bn TEXT,
    historical_significance TEXT,
    historical_significance_bn TEXT,
    image_url TEXT,
    image_verification_status TEXT DEFAULT 'verified' CHECK (image_verification_status IN ('verified', 'pending_verification', 'placeholder')),
    location_verification_status TEXT DEFAULT 'verified' CHECK (location_verification_status IN ('verified', 'approximate', 'pending_confirmation')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create Festival Event Venues Table (Allows annual shifts without modifying permanent temple locations)
CREATE TABLE IF NOT EXISTS public.festival_event_venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    festival_year INT NOT NULL,
    permanent_sanctum_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    active_venue_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    historical_crossing_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    venue_shift_rationale TEXT,
    crowd_management_notes TEXT,
    is_current_venue BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create Curated Routes Table
CREATE TABLE IF NOT EXISTS public.curated_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    bengali_title TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    description_bn TEXT,
    total_distance_km NUMERIC(5, 2),
    estimated_duration_minutes INT,
    stops_order JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Enable Row Level Security (RLS) on all 3 tables
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival_event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_routes ENABLE ROW LEVEL SECURITY;

-- 5. Public Read Policies
DROP POLICY IF EXISTS "Public can view active destinations" ON public.destinations;
CREATE POLICY "Public can view active destinations"
    ON public.destinations
    FOR SELECT
    USING (is_active = true OR app_security.is_admin());

DROP POLICY IF EXISTS "Public can view active festival venues" ON public.festival_event_venues;
CREATE POLICY "Public can view active festival venues"
    ON public.festival_event_venues
    FOR SELECT
    USING (is_current_venue = true OR app_security.is_admin());

DROP POLICY IF EXISTS "Public can view active curated routes" ON public.curated_routes;
CREATE POLICY "Public can view active curated routes"
    ON public.curated_routes
    FOR SELECT
    USING (is_active = true OR app_security.is_admin());

-- 6. Admin Mutation Policies (Strictly restricted to verified project owner)
DROP POLICY IF EXISTS "Admins can insert destinations" ON public.destinations;
CREATE POLICY "Admins can insert destinations"
    ON public.destinations
    FOR INSERT
    TO authenticated
    WITH CHECK (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can update destinations" ON public.destinations;
CREATE POLICY "Admins can update destinations"
    ON public.destinations
    FOR UPDATE
    TO authenticated
    USING (app_security.is_admin())
    WITH CHECK (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can delete destinations" ON public.destinations;
CREATE POLICY "Admins can delete destinations"
    ON public.destinations
    FOR DELETE
    TO authenticated
    USING (app_security.is_admin());

-- Festival Event Venues Admin Policies
DROP POLICY IF EXISTS "Admins can insert festival venues" ON public.festival_event_venues;
CREATE POLICY "Admins can insert festival venues"
    ON public.festival_event_venues
    FOR INSERT
    TO authenticated
    WITH CHECK (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can update festival venues" ON public.festival_event_venues;
CREATE POLICY "Admins can update festival venues"
    ON public.festival_event_venues
    FOR UPDATE
    TO authenticated
    USING (app_security.is_admin())
    WITH CHECK (app_security.is_admin());

-- Curated Routes Admin Policies
DROP POLICY IF EXISTS "Admins can insert curated routes" ON public.curated_routes;
CREATE POLICY "Admins can insert curated routes"
    ON public.curated_routes
    FOR INSERT
    TO authenticated
    WITH CHECK (app_security.is_admin());

DROP POLICY IF EXISTS "Admins can update curated routes" ON public.curated_routes;
CREATE POLICY "Admins can update curated routes"
    ON public.curated_routes
    FOR UPDATE
    TO authenticated
    USING (app_security.is_admin())
    WITH CHECK (app_security.is_admin());

-- 7. Seed Initial Verified Destinations (Geographically Audited)
INSERT INTO public.destinations (slug, name, bengali_name, category, address, latitude, longitude, plus_code, google_maps_url, description, description_bn, historical_significance, image_url, image_verification_status, location_verification_status)
VALUES
    ('bejpara-ground', 'Bejpara Maath (Bejpara Ground)', 'বেজপাড়া মাঠ', 'cultural_event_venue', 'Bejpara Ground, Bejpara / Char Jijira, Shantipur, Nadia, West Bengal - 741404', 23.232778, 88.438889, '6CVQ+4H Shantipur', 'https://maps.app.goo.gl/duNTyatQ7nMmSxYc6', 'Designated 2026 performance ground where the renowned Shantipur Bama Kali immersion dance and festive gatherings take place.', 'শান্তিপুরের ঐতিহ্যবাহী বামা কালী নৃত্য ও বিসর্জনের সাম্প্রতিক প্রশস্ত ময়দান।', 'Venue shifted from the narrow Barabazar More junction for crowd safety, medical barricading, and CCTV monitoring.', '/images/santipur/festivals/santipur-bamakali-night-immersion-01.png', 'verified', 'verified'),
    ('bama-kali-temple', 'Maa Bamakali Sanctum Shrine', 'মা বামা কালী মন্দির', 'temple', 'Bamakali Tala, Sutragarh (near K.C. Das Road, Ward 19), Shantipur, Nadia - 741404', 23.243889, 88.421667, '6CPG+HV Shantipur', NULL, 'Revered 500-year-old permanent sanctum of Maa Bamakali. Consecrated with the left foot forward.', '৫০০ বছরের জাগ্রত আদি বামা কালী মন্দির। দেবী এখানে বাম পদ সম্মুখে রেখে অধিষ্ঠিতা।', 'The permanent religious shrine where the deity is sculpted and consecrated before the dancing procession.', '/images/santipur/maa-kali/santipur-maa-bamakali-idol-01.png', 'verified', 'verified'),
    ('barabazar-more', 'Barabazar More (Historic Dance Crossing)', 'বড়বাজার মোড়', 'cultural_event_venue', 'Barabazar Chowrasta, Ward 8, Shantipur, Nadia - 741404', 23.258611, 88.437500, '7C5P+C2 Shantipur', NULL, 'Traditional central commercial crossing where the Bama Kali immersion dance took place for over 56 years.', 'ঐতিহাসিক বড়বাজার মোড়, যেখানে দীর্ঘ ৫৬ বছর ধরে বামা কালীর বিখ্যাত বিসর্জন নৃত্য অনুষ্ঠিত হতো।', 'Centuries-old market intersection that hosted historic dance performances before shifting to Bejpara Ground in 2026.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified'),
    ('boro-goswami-bari', 'Sri Sri Radha Raman Jiu (Boro Goswami Bari)', 'শ্রী শ্রী রাধারমণ জিউ (বড় গোস্বামী বাড়ি)', 'vaishnava_heritage', 'Goswami Bari Street, Radharaman Jiu Complex, Shantipur, Nadia - 741404', 23.250000, 88.440833, '7C2R+79 Shantipur', NULL, 'Ancestral seat of Sri Advaita Acharya lineage established in 1484 CE (~540 years). Epicenter of Bhanga Rash.', '১৪৮৪ খ্রিষ্টাব্দে প্রতিষ্ঠিত শ্রী অদ্বৈত আচার্য প্রভুর আদি ভিটা ও রাধারমণ জিউর মন্দির।', 'Historic Shakta-Vaishnava truce site. In colonial records, "Jiu" was frequently Anglicized phonetically as "Jews".', '/images/santipur/vaishnava-heritage/santipur-sri-radha-raman-jiu-01.jpg', 'verified', 'verified'),
    ('choto-goswami-bari', 'Choto Goswami Bari (Chakfera / Sitanather Bari)', 'ছোট গোস্বামী বাড়ি (চাকফেরা)', 'vaishnava_heritage', 'Chakfera, Goswami Para, Shantipur, Nadia - 741404', 23.249167, 88.439444, '6CWQ+MQ Shantipur', NULL, 'Revered junior branch of Advaita Acharyas family lineage, consecrated to Sri Sri Radha Vallabh Jiu.', 'শ্রী অদ্বৈত আচার্য প্রভুর অনুজ শাখা এবং শ্রী শ্রী রাধাবল্লভ জিউর ঐতিহ্যবাহী সেবা কেন্দ্র।', 'Cherished for ornate Gaudiya rituals, rotating Rasamandal wheel (Chak-fera), and Vaishnava padavali kirtan.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified'),
    ('madan-gopal-bari', 'Sri Sri Radha Madan Gopal Jiu (Madan Gopal Bari)', 'শ্রী শ্রী রাধামদনগোপাল জিউ মন্দির', 'vaishnava_heritage', 'Madangopal Para (near Municipality / Dakghar More), Shantipur, Nadia - 741404', 23.250000, 88.430000, '7C2J+22 Shantipur', NULL, 'Centuries-old Vaishnava sanctum housing Sri Sri Radha Madan Gopal Jiu, originally brought by Advaita Acharya.', 'শ্রী অদ্বৈত আচার্য প্রভুর দ্বারা আনীত শ্রী শ্রী রাধামদনগোপাল জিউর ঐতিহাসিক মন্দির।', 'Madangopal Para takes its name from this revered shrine adjacent to the Municipality; prominent Rash Parikrama stop.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified'),
    ('jaleswar-shiva-temple', 'Jaleswar Shiva Temple (ASI Protected)', 'শ্রী জলেশ্বর মহাদেব মন্দির (এএসআই চারচালা)', 'temple', 'Jaleswartala, near Motiganj / old NH-34, Shantipur, Nadia - 741404', 23.239106, 88.433381, '6CQM+J9 Shantipur', NULL, 'Protected Monument (ASI N-WB-54-d) erected in early 18th century by Maharaja Raghuram Roy of Nadia.', 'নদিয়ার মহারাজ রঘুরাম রায় নির্মিত সুপ্রাচীন চারচালা টেরাকোটা শিব মন্দির (এএসআই সংরক্ষিত)।', 'Houses self-manifested Swayambhu Shiva Linga with puranic terracotta panels; clarifies local Jora Mandir traditions.', '/images/santipur/temples/santipur-jaleswar-shiva-temple-01.jpg', 'verified', 'verified'),
    ('shyamchand-mandir', 'Shyamchand Mandir (1726 CE, ASI S-WB-96)', 'শ্রী শ্যামচাঁদ জিউ মন্দির (১৭২৬ খ্রি.)', 'temple', 'Shyamchand Bagan Lane, Barabazar, Shantipur - 741404', 23.239703, 88.441490, '6CQR+VJJ Shantipur', NULL, 'Grand 1726 CE Atchala (eight-roofed) terracotta brick temple erected by merchant Ramgopal Khan Chowdhury.', '১৭২৬ সালে বস্ত্রবণিক রামগোপাল খাঁ চৌধুরী নির্মিত বাংলার অন্যতম শ্রেষ্ঠ আটচালা মন্দির।', 'Architectural monument of Shantipur handloom wealth (ASI S-WB-96, Wikidata Q66439262).', '/images/santipur/temples/santipur-shyamchand-temple-atchala-01.jpg', 'verified', 'verified'),
    ('topkhana-mosque', 'Topkhana Mosque & Panchpota Landmark (1703 CE)', 'তোপখানা মসজিদ ও পঞ্চপোতা সৌধ', 'historic_landmark', 'Topkhana, Panchpota, Shantipur, Nadia - 741404', 23.237306, 88.424800, '6CPF+WW Shantipur', NULL, 'Mughal-era heritage site commissioned in 1703 CE by Faujdar Gazi Mohammad Yar Khan under Emperor Aurangzeb.', 'মুঘল আমলে ফৌজদার গাজী মহম্মদ ইয়ার খান নির্মিত ঐতিহাসিক তোপখানা মসজিদ ও সৌধ।', 'West Bengal Heritage Commission recognized site (Wikidata Q67501531); exemplary Indo-Islamic brick architecture.', '/images/santipur/historical-landmarks/santipur-panchpota-historic-mosque-01.jpg', 'verified', 'verified'),
    ('advaita-pat-babaji-ghat', 'Advaita Pat (Babla Aditya-Path Ashram)', 'শ্রী অদ্বৈত পাঠ (বাবলা আদিত্য-পাঠ আশ্রম)', 'vaishnava_heritage', 'Babla (Bablagobindapur), Shantipur, Nadia - 741404', 23.265000, 88.445556, '7C8W+26 Shantipur', NULL, 'Sacred meditation site and hermitage of Sri Advaita Acharya in Babla, where Chaitanya Mahaprabhu visited.', 'বাবলা গোবিন্দপুরে শ্রী অদ্বৈত প্রভুর পবিত্র সাধনপীঠ ও মহাপ্রভুর পুণ্য মিলনস্থল।', 'Major Gaudiya Vaishnava Sripat and ashram in Bablagobindapur north of Shantipur town.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified'),
    ('maa-agameswari', 'Maa Agameswari Tala', 'মা আগমেশ্বরী তলা', 'temple', 'Agameswari Tala, Ward 12, Shantipur, Nadia - 741404', 23.249444, 88.443333, '6CVV+Q8 Shantipur', NULL, '420-year-old Tantric shrine established by Pandit Krishnananda Agambagish, author of Brihat Tantrasara.', 'বৃহৎ তন্ত্রসার প্রণেতা তন্ত্রসাধক পণ্ডিত কৃষ্ণানন্দ আগমবাগীশ দ্বারা প্রতিষ্ঠিত ৪২০ বছরের মহাতীর্থ।', 'Consolidated through the historic alliance between Advaita Acharyas descendant and Sarvabhauma Agambagish (Wikimapia 23249051).', '/images/santipur/maa-kali/santipur-maa-agameswari-idol-01.png', 'verified', 'verified'),
    ('maa-mahishkhagi', 'Maa Mahishkhagi (Mahishkhagi Para)', 'মা মহিষখাগী (মহিষখাগী পাড়া)', 'temple', 'Bhabani Para Street / Mahishkhagi, Ward 8, Shantipur, Nadia - 741404', 23.245833, 88.436667, '6CWQ+8M Shantipur', NULL, '500-year-old deity celebrated for unique Vedic marriage rituals and traditional shoulder-borne immersion.', 'পাঁচ শতাব্দীরও বেশি পূর্বে প্রতিষ্ঠিত অনন্য কালী, যাঁকে হিন্দু বৈদিক বিবাহ রীতিতে বরণ করা হয়।', 'Devotees carry the immense idol solely on bare shoulders across the town.', '/images/santipur/maa-kali/santipur-maa-mahishkhagi-procession-01.jpg', 'verified', 'verified'),
    ('siddheswari-kali', 'Siddheswari Kali Mandir (Sutragarh)', 'সিদ্ধেশ্বরী কালী মন্দির (সূত্রাগড়)', 'temple', 'K.C. Das Road, Sutragarh (near Sutragarh M.N. High School), Shantipur, Nadia - 741404', 23.244444, 88.422778, '6CPG+R5 Shantipur', NULL, '380-year-old temple consecrated by Sutragarhs master weavers as the guardian deity of the weaving community.', 'সূত্রাগড়ের তাঁতি সমাজ ও পণ্ডিতবর্গের দ্বারা শান্তিপুরের কারুশিল্প ঐতিহ্যের রক্ষাকর্ত্রী রূপে প্রতিষ্ঠিত।', 'Anchors the spiritual heritage of Shantipurs eastern handloom corridors.', '/images/santipur/maa-kali/santipur-siddheswari-kali-idol-01.png', 'verified', 'verified'),
    ('shantipur-railway-station', 'Shantipur Junction Railway Station (STB)', 'শান্তipur জংশন রেলওয়ে স্টেশন', 'historic_landmark', 'Station Road, Shantipur, Nadia - 741404', 23.263496, 88.435688, '7C7P+97 Shantipur', NULL, 'Historic railway portal opened in 1862 during British Bengal railway expansion; connects Kolkata and Sealdah.', '১৮৬২ সালে প্রতিষ্ঠিত ঐতিহ্যবাহী রেল স্টেশন, যা কলকাতা ও রানাঘাটের সঙ্গে শান্তিপুরের সংযোগ ঘটায়।', 'Primary transit arrival hub for tourists, pilgrims, and textile merchants arriving from Sealdah (Wikidata Q59155478).', '/images/santipur/institutions/santipur-railway-station-01.jpg', 'verified', 'verified'),
    ('ranir-ghat', 'Motigunj Ghat / Bhagirathi Riverfront', 'মতিগঞ্জ ঘাট ও ভাগীরথী নদীতীর', 'historic_ghat', 'Motigunj Ghat Road, Motiganj, Shantipur, Nadia - 741404', 23.238056, 88.432778, '6CQM+64 Shantipur', NULL, 'Historic river trade and ferry ghat along the Bhagirathi river dating back to the 18th century.', 'মতিগঞ্জে ভাগীরথীর তীরে অবস্থিত প্রাচীন ঘাট, যেখান থেকে শান্তিপুরী শাড়ি নদীপথে বিভিন্ন অঞ্চলে যেত।', 'Offers expansive views of the sacred river and sunsets; key riverway stop on historic trade routes.', '/images/santipur/om-placeholder.svg', 'placeholder', 'verified')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    bengali_name = EXCLUDED.bengali_name,
    category = EXCLUDED.category,
    address = EXCLUDED.address,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    plus_code = EXCLUDED.plus_code,
    google_maps_url = EXCLUDED.google_maps_url,
    description = EXCLUDED.description,
    description_bn = EXCLUDED.description_bn,
    historical_significance = EXCLUDED.historical_significance,
    image_url = EXCLUDED.image_url,
    updated_at = NOW();

-- 8. Seed Curated Routes
INSERT INTO public.curated_routes (slug, title, bengali_title, category, description, description_bn, total_distance_km, estimated_duration_minutes, stops_order)
VALUES
    ('shakti-heritage-trail', 'Shakti Heritage Trail', 'শক্তি ঐতিহ্য পরিক্রমা', 'Shakta Heritage', 'Explore five centuries of Tantric Kali worship, the iconic Bama Kali dance venue shift, and historic immersion routes.', '৫০০ বছরের শাক্ত ঐতিহ্য, বামা কালীর ঐতিহাসিক বিসর্জন নৃত্য এবং জাগ্রত সাধনাপীঠ পরিক্রমা।', 4.60, 58, '["bama-kali-temple", "siddheswari-kali", "maa-mahishkhagi", "maa-agameswari", "barabazar-more", "bejpara-ground"]'::jsonb),
    ('vaishnava-heritage-trail', 'Vaishnava Heritage Trail', 'শ্রীচৈতন্য ও অদ্বৈত বৈষ্ণব পরিক্রমা', 'Vaishnava Heritage', 'Walk the path of Sri Advaita Acharya, 1484 CE Goswami ancestral seats, Atchala terracotta temples, and holy river ghats.', 'শ্রী অদ্বৈত প্রভু ও মহাপ্রভুর স্মৃতিবিজড়িত ১৪৮৪ সালের আদি গোস্বামী ভিটা, টেরাকোটা মন্দির ও পুণ্য ভাগীরথী ঘাট।', 4.10, 50, '["advaita-pat-babaji-ghat", "boro-goswami-bari", "choto-goswami-bari", "madan-gopal-bari", "shyamchand-mandir"]'::jsonb),
    ('historic-shantipur-trail', 'Historic Shantipur Trail', 'ঐতিহাসিক শান্তিপুর নগর পরিক্রমা', 'Heritage & Architecture', 'Discover syncretic Mughal-era monuments, ASI-protected Shaiva architecture, colonial transit gateways, and river trade ghats.', 'মুঘল আমলের তোপখানা সৌধ, এএসআই চারচালা শিব মন্দির, প্রাচীন রেল ঐতিহ্য ও নদীতীরবর্তী বাণিজ্য ঘাট।', 5.30, 68, '["shantipur-railway-station", "topkhana-mosque", "ranir-ghat", "jaleswar-shiva-temple", "shyamchand-mandir"]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    bengali_title = EXCLUDED.bengali_title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    description_bn = EXCLUDED.description_bn,
    total_distance_km = EXCLUDED.total_distance_km,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    stops_order = EXCLUDED.stops_order,
    updated_at = NOW();
