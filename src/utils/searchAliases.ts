/**
 * Arabic → catalog-spelling aliases for the destination pickers.
 *
 * Every destination catalog we ship is Latin-script only: cities500.json
 * stores "Dubai", airports.json (OurAirports) stores English airport and
 * municipality names. The UI labels are localised (`cities.*` in the locale
 * files), so an Arabic visitor sees "دبي" on a chip, types "دبي", and the
 * search scores it against "Dubai" — zero — and shows nothing at all.
 *
 * This module bridges the two: normalise the Arabic the way people actually
 * type it, then resolve it to the English spelling(s) the catalogs use. One
 * table serves hotel cities, flight airports and car locations, because they
 * all key off the same city names.
 *
 * Adding a destination = one line below. Values MUST match the catalog
 * spelling (city name in cities500.json / airport municipality); the drift
 * test in searchAliases.catalog.test.ts fails if one stops resolving.
 */

/**
 * Harakat (fatha…sukun), the hamza/maddah marks NFD leaves behind when it
 * decomposes أ / ئ / ؤ, superscript alef, and tatweel.
 */
const ARABIC_MARKS = /[ً-ْٓ-ٰٕـ]/g;

const ARABIC_SCRIPT = /[؀-ۿݐ-ݿ]/;

export const containsArabic = (value: string | null | undefined): boolean =>
  ARABIC_SCRIPT.test(value ?? "");

/**
 * Fold the spelling variants Arabic keyboards produce into one form:
 * diacritics dropped, alef/ya/hamza/ta-marbuta unified, and the definite
 * article "ال" removed so "الرياض" and "رياض" are the same query.
 */
export const normalizeArabicText = (value: string | null | undefined): string => {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFC") // recompose, then drop whatever marks are left over
    .replace(ARABIC_MARKS, "")
    .replace(/[أإآٱ]/g, "ا") // أ إ آ ٱ → ا
    .replace(/ى/g, "ي") // ى → ي
    .replace(/ؤ/g, "و") // ؤ → و
    .replace(/ئ/g, "ي") // ئ → ي
    .replace(/ة/g, "ه") // ة → ه
    .replace(/\s+/g, " ")
    .replace(/(^|\s)ال(?=\S\S)/g, "$1") // leading "ال"
    .trim();
};

const foldCache = new Map<string, string>();

/**
 * Fold a catalog string or query to plain lowercase ASCII-ish text:
 * diacritics removed, Turkish/Nordic letters mapped, punctuation reduced to
 * spaces. The catalogs are full of "Najrān", "Ta’if", "Şalālah" and
 * "İstanbul Airport", none of which a plain `toLowerCase()` comparison can
 * match — not from an Arabic alias and not from an English typist either.
 * Results are cached because the city catalog is 177k records.
 */
export const foldForSearch = (value: string | null | undefined): string => {
  if (!value) return "";
  const cached = foldCache.get(value);
  if (cached !== undefined) return cached;
  const folded = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining marks left by NFD
    .replace(/[İıI]/g, "i")
    .replace(/[øØ]/g, "o")
    .replace(/[æÆ]/g, "ae")
    .replace(/[œŒ]/g, "oe")
    .replace(/[ßẞ]/g, "ss")
    .replace(/[đĐ]/g, "d")
    .replace(/[łŁ]/g, "l")
    .replace(/[’'`´ʻ]/g, "") // O’Hara → ohara, Ta’if → taif
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .toLowerCase()
    .trim();
  foldCache.set(value, folded);
  return folded;
};

/**
 * Arabic name → catalog spelling(s). Several English spellings are listed
 * where the catalogs disagree ("Mecca" vs "Makkah"), so whichever one the
 * data uses still matches.
 */
const ARABIC_CITY_ALIASES: Record<string, string[]> = {
  // ── Saudi Arabia ──────────────────────────────────────────────────────
  "الرياض": ["Riyadh"],
  "جدة": ["Jeddah"],
  "مكة": ["Mecca", "Makkah"],
  "مكة المكرمة": ["Mecca", "Makkah"],
  "المدينة": ["Medina", "Madinah"],
  "المدينة المنورة": ["Medina", "Madinah"],
  "الدمام": ["Dammam"],
  "الخبر": ["Khobar", "Al Khobar"],
  "الظهران": ["Dhahran"],
  "الطائف": ["Taif", "Ta’if"],
  "أبها": ["Abha"],
  "تبوك": ["Tabuk"],
  "بريدة": ["Buraydah", "Buraidah"],
  "عنيزة": ["Unaizah"],
  "حائل": ["Hail", "Ha’il"],
  "جازان": ["Jizan"],
  "نجران": ["Najran"],
  "ينبع": ["Yanbu"],
  "الجبيل": ["Al Jubayl", "Jubail"],
  "خميس مشيط": ["Khamis Mushait"],
  "الباحة": ["Al Bahah", "Baha"],
  "عرعر": ["Arar"],
  "سكاكا": ["Sakakah"],
  "القصيم": ["Buraydah", "Buraidah"],
  "الأحساء": ["Al Hufuf", "Hofuf"],
  "الهفوف": ["Al Hufuf", "Hofuf"],
  "العلا": ["Al Ula", "AlUla"],
  "رابغ": ["Rabigh"],
  "الخرج": ["Al Kharj"],
  "الجوف": ["Al-Jawf", "Sakakah"],
  "القطيف": ["Al Qatif", "Qatif"],
  "بيشة": ["Bisha"],
  "وادي الدواسر": ["Wadi Al Dawasir"],
  "شرورة": ["Sharurah"],
  "طريف": ["Turaif"],
  "الوجه": ["Al Wajh"],
  "دومة الجندل": ["Al-Jawf", "Sakakah"],

  // ── Gulf ──────────────────────────────────────────────────────────────
  "دبي": ["Dubai"],
  "أبوظبي": ["Abu Dhabi"],
  "أبو ظبي": ["Abu Dhabi"],
  "الشارقة": ["Sharjah"],
  "عجمان": ["Ajman City", "Ajman"],
  "رأس الخيمة": ["Ras Al Khaimah City", "Ras Al Khaimah"],
  "الفجيرة": ["Al Fujairah City", "Fujairah"],
  "العين": ["Al Ain City", "Al Ain"],
  "الدوحة": ["Doha"],
  "الكويت": ["Kuwait City", "Kuwait"],
  "المنامة": ["Manama"],
  "البحرين": ["Manama"],
  "مسقط": ["Muscat"],
  "صلالة": ["Salalah"],
  "صحار": ["Sohar"],
  "نزوى": ["Nizwa"],

  // ── Levant, Iraq, Egypt, Yemen ────────────────────────────────────────
  "القاهرة": ["Cairo"],
  "الإسكندرية": ["Alexandria"],
  "شرم الشيخ": ["Sharm el-Sheikh", "Sharm ash Shaykh"],
  "الغردقة": ["Hurghada"],
  "الأقصر": ["Luxor"],
  "أسوان": ["Aswan"],
  "العلمين": ["Al ‘Alamayn", "El Alamein"],
  "عمان": ["Amman"],
  "العقبة": ["Aqaba"],
  "بيروت": ["Beirut"],
  "طرابلس": ["Tripoli"],
  "دمشق": ["Damascus"],
  "حلب": ["Aleppo"],
  "بغداد": ["Baghdad"],
  "البصرة": ["Basrah", "Basra"],
  "أربيل": ["Erbil"],
  "النجف": ["Najaf"],
  "كربلاء": ["Karbala"],
  "السليمانية": ["Sulaymaniyah", "As Sulaymaniyah"],
  "القدس": ["Jerusalem"],
  "صنعاء": ["Sanaa", "Sana’a"],
  "عدن": ["Aden"],

  // ── North Africa ──────────────────────────────────────────────────────
  "الخرطوم": ["Khartoum"],
  "تونس": ["Tunis"],
  "الجزائر": ["Algiers"],
  "الدار البيضاء": ["Casablanca"],
  "مراكش": ["Marrakesh", "Marrakech"],
  "الرباط": ["Rabat"],
  "طنجة": ["Tangier"],
  "فاس": ["Fes", "Fez"],
  "أكادير": ["Agadir"],
  "نواكشوط": ["Nouakchott"],
  "مقديشو": ["Mogadishu"],
  "جيبوتي": ["Djibouti"],

  // ── Türkiye & Caucasus ────────────────────────────────────────────────
  "اسطنبول": ["Istanbul"],
  "إسطنبول": ["Istanbul"],
  "أنقرة": ["Ankara"],
  "أنطاليا": ["Antalya"],
  "طرابزون": ["Trabzon"],
  "إزمير": ["Izmir"],
  "بودروم": ["Bodrum"],
  "بورصة": ["Bursa"],
  "باكو": ["Baku"],
  "تبليسي": ["Tbilisi"],
  "باتومي": ["Batumi"],
  "يريفان": ["Yerevan"],

  // ── Europe ────────────────────────────────────────────────────────────
  "لندن": ["London"],
  "مانشستر": ["Manchester"],
  "برمنغهام": ["Birmingham"],
  "إدنبرة": ["Edinburgh"],
  "باريس": ["Paris"],
  "كان": ["Cannes"],
  "نيس": ["Nice"],
  "مرسيليا": ["Marseille"],
  "ليون": ["Lyon"],
  "جنيف": ["Geneva", "Genève"],
  "زيورخ": ["Zurich", "Zürich"],
  "برن": ["Bern"],
  "إنترلاكن": ["Interlaken"],
  "فيينا": ["Vienna", "Wien"],
  "سالزبورغ": ["Salzburg"],
  "برلين": ["Berlin"],
  "ميونخ": ["Munich", "München"],
  "فرانكفورت": ["Frankfurt am Main", "Frankfurt"],
  "هامبورغ": ["Hamburg"],
  "روما": ["Rome", "Roma"],
  "ميلانو": ["Milan", "Milano"],
  "البندقية": ["Venice", "Venezia"],
  "فلورنسا": ["Florence", "Firenze"],
  "نابولي": ["Naples", "Napoli"],
  "مدريد": ["Madrid"],
  "برشلونة": ["Barcelona"],
  "مالقة": ["Málaga", "Malaga"],
  "أمستردام": ["Amsterdam"],
  "بروكسل": ["Brussels", "Bruxelles"],
  "براغ": ["Prague", "Praha"],
  "بودابست": ["Budapest"],
  "وارسو": ["Warsaw", "Warszawa"],
  "أثينا": ["Athens", "Athina"],
  "لشبونة": ["Lisbon", "Lisboa"],
  "موسكو": ["Moscow", "Moskva"],
    "سراييفو": ["Sarajevo"],
  "بلغراد": ["Belgrade", "Beograd"],
  "بوخارست": ["Bucharest", "Bucureşti"],
  "صوفيا": ["Sofia"],
  "ستوكهولم": ["Stockholm"],
  "أوسلو": ["Oslo"],
  "كوبنهاغن": ["Copenhagen", "København"],
  "دبلن": ["Dublin"],

  // ── Asia ──────────────────────────────────────────────────────────────
  "كوالالمبور": ["Kuala Lumpur"],
  "لنكاوي": ["Kuah", "Langkawi"],
  "سنغافورة": ["Singapore"],
  "بانكوك": ["Bangkok"],
  "بوكيت": ["Phuket"],
  "جاكرتا": ["Jakarta"],
  "بالي": ["Denpasar"],
  "مانيلا": ["Manila"],
  "طوكيو": ["Tokyo"],
  "أوساكا": ["Osaka"],
  "سيول": ["Seoul"],
  "بكين": ["Beijing"],
  "شنغهاي": ["Shanghai"],
  "هونغ كونغ": ["Hong Kong"],
  "دلهي": ["Delhi"],
  "نيودلهي": ["New Delhi"],
  "مومباي": ["Mumbai"],
  "بنغالور": ["Bengaluru", "Bangalore"],
  "تشيناي": ["Chennai"],
  "حيدر أباد": ["Hyderabad"],
  "كوتشي": ["Kochi"],
  "غوا": ["Panaji", "Goa"],
  "كولكاتا": ["Kolkata"],
  "جايبور": ["Jaipur"],
  "أغرا": ["Agra"],
  "سريناغار": ["Srinagar"],
  "كولومبو": ["Colombo"],
  "ماليه": ["Male"],
  "المالديف": ["Male"],
  "كاتماندو": ["Kathmandu"],
  "دكا": ["Dhaka"],
  "كراتشي": ["Karachi"],
  "لاهور": ["Lahore"],
  "إسلام أباد": ["Islamabad"],
  "طشقند": ["Tashkent"],
  "ألماتي": ["Almaty"],
  "سمرقند": ["Samarkand"],

  // ── Americas & Oceania ────────────────────────────────────────────────
  "نيويورك": ["New York City", "New York"],
  "لوس أنجلوس": ["Los Angeles"],
  "سان فرانسيسكو": ["San Francisco"],
  "شيكاغو": ["Chicago"],
  "واشنطن": ["Washington"],
  "ميامي": ["Miami"],
  "بوسطن": ["Boston"],
  "هيوستن": ["Houston"],
  "تورونتو": ["Toronto"],
  "فانكوفر": ["Vancouver"],
  "مونتريال": ["Montreal", "Montréal"],
  "مكسيكو سيتي": ["Mexico City", "Ciudad de México"],
  "ساو باولو": ["São Paulo", "Sao Paulo"],
  "ريو دي جانيرو": ["Rio de Janeiro"],
  "بوينس آيرس": ["Buenos Aires"],
  "سيدني": ["Sydney"],
  "ملبورن": ["Melbourne"],
  "أوكلاند": ["Auckland"],

  // ── Sub-Saharan Africa & Indian Ocean ─────────────────────────────────
  "جوهانسبرغ": ["Johannesburg"],
  "كيب تاون": ["Cape Town"],
  "نيروبي": ["Nairobi"],
  "أديس أبابا": ["Addis Ababa"],
  "لاغوس": ["Lagos"],
  "أكرا": ["Accra"],
  "دار السلام": ["Dar es Salaam"],
  "زنجبار": ["Zanzibar"],
  "موريشيوس": ["Port Louis"],
  "سيشل": ["Victoria"],
};

const aliasIndex = (() => {
  const index = new Map<string, string[]>();
  for (const [arabic, targets] of Object.entries(ARABIC_CITY_ALIASES)) {
    const key = normalizeArabicText(arabic);
    if (!key) continue;
    index.set(key, [...new Set([...(index.get(key) ?? []), ...targets])]);
  }
  return index;
})();

/** Every Arabic destination in the table — used by the catalog drift test. */
export const arabicAliasKeys = (): string[] => Object.keys(ARABIC_CITY_ALIASES);

/**
 * The strings a picker should score a query against: the query itself, plus
 * the catalog spellings when the user typed a known Arabic destination.
 * Latin queries pass straight through, so existing ranking is untouched.
 */
export const expandSearchQuery = (query: string | null | undefined): string[] => {
  const raw = (query ?? "").trim();
  if (!raw) return [];
  if (!containsArabic(raw)) return [raw];
  const aliases = aliasIndex.get(normalizeArabicText(raw));
  return aliases?.length ? [raw, ...aliases] : [raw];
};
