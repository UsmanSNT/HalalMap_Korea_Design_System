const RESTAURANTS = [
  {
    id: "sindang-halal",
    name: "Sindang Halal Kitchen",
    nameKo: "신당 할랄 키친",
    category: "korean",
    halalStatus: "certified",
    certBody: "KMF",
    rating: 4.8,
    reviewCount: 3241,
    distance: "2.3km",
    deliveryTime: "25-35분",
    deliveryFee: 2000,
    minOrder: 15000,
    address: "서울특별시 중구 신당동 123-4",
    phone: "02-1234-5678",
    hours: "09:00-22:00",
    description: "이슬람 식품청 인증 할랄 한식 전문점. 돼지고기 및 알코올 완전 배제.",
    photo: "https://images.unsplash.com/photo-1498654896293-37c98e7f5fe4?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "itaewon-kebab",
    name: "Itaewon Kebab House",
    nameKo: "이태원 케밥 하우스",
    category: "turkish",
    halalStatus: "certified",
    certBody: "KMF",
    rating: 4.6,
    reviewCount: 1872,
    distance: "0.8km",
    deliveryTime: "15-25분",
    deliveryFee: 1500,
    minOrder: 12000,
    address: "서울특별시 용산구 이태원로 45-7",
    phone: "02-2345-6789",
    hours: "10:00-23:00",
    description: "정통 터키 케밥과 그릴 요리 전문점.",
    photo: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "uzbekistan-plov",
    name: "Uzbekistan Plov House",
    nameKo: "우즈베키스탄 플로프 하우스",
    category: "uzbek",
    halalStatus: "muslim-owned",
    certBody: null,
    rating: 4.7,
    reviewCount: 956,
    distance: "3.1km",
    deliveryTime: "30-40분",
    deliveryFee: 1500,
    minOrder: 13000,
    address: "서울특별시 용산구 한남동 67-2",
    phone: "02-3456-7890",
    hours: "11:00-22:00",
    description: "우즈베키스탄 전통 플로프와 중앙아시아 요리.",
    photo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "delhi-spice",
    name: "Delhi Spice",
    nameKo: "델리 스파이스",
    category: "indian",
    halalStatus: "halal-friendly",
    certBody: null,
    rating: 4.3,
    reviewCount: 687,
    distance: "4.2km",
    deliveryTime: "35-45분",
    deliveryFee: 2500,
    minOrder: 18000,
    address: "서울특별시 강남구 역삼동 88-3",
    phone: "02-4567-8901",
    hours: "11:00-21:30",
    description: "북인도 카레와 탄두리 전문점. 채식 메뉴 다수.",
    photo: "https://images.unsplash.com/photo-1565557623262-b51ff2a27b73?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "jakarta-nasigoreng",
    name: "Jakarta Nasi Goreng",
    nameKo: "자카르타 나시고렝",
    category: "indonesian",
    halalStatus: "certified",
    certBody: "MUI",
    rating: 4.6,
    reviewCount: 1124,
    distance: "2.8km",
    deliveryTime: "30-40분",
    deliveryFee: 2000,
    minOrder: 14000,
    address: "서울특별시 마포구 합정동 34-1",
    phone: "02-5678-9012",
    hours: "10:30-22:00",
    description: "인도네시아 정통 나시고렝과 동남아 할랄 요리.",
    photo: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "masjid-seoul-cafe",
    name: "Masjid Seoul Cafe",
    nameKo: "마스지드 서울 카페",
    category: "cafe",
    halalStatus: "muslim-owned",
    certBody: null,
    rating: 4.9,
    reviewCount: 2103,
    distance: "1.1km",
    deliveryTime: "20-30분",
    deliveryFee: 0,
    minOrder: 8000,
    address: "서울특별시 용산구 우사단로 12-5",
    phone: "02-6789-0123",
    hours: "08:00-20:00",
    description: "서울중앙성원 근처 무슬림 운영 카페. 할랄 디저트와 음료.",
    photo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&auto=format&q=80",
  },
];

const MENUS: Record<string, Array<{ id: string; category: string; name: string; description: string; price: number; photo: string | null }>> = {
  "sindang-halal": [
    { id: "m1", category: "인기메뉴", name: "할랄 갈비탕", description: "사골 육수와 소갈비", price: 13500, photo: null },
    { id: "m2", category: "인기메뉴", name: "비빔밥 (할랄)", description: "신선한 채소와 소고기", price: 11000, photo: null },
    { id: "m3", category: "인기메뉴", name: "된장찌개 세트", description: "된장찌개 + 밥 + 반찬", price: 12000, photo: null },
    { id: "m4", category: "인기메뉴", name: "할랄 삼계탕", description: "인삼 닭백숙", price: 16500, photo: null },
    { id: "m5", category: "한식", name: "불고기 정식", description: "양념 소불고기 + 반찬", price: 14000, photo: null },
    { id: "m6", category: "한식", name: "잡채밥", description: "잡채 + 밥", price: 10500, photo: null },
    { id: "m7", category: "세트", name: "2인 세트 A", description: "갈비탕 + 비빔밥 + 음료 2잔", price: 22000, photo: null },
    { id: "m8", category: "음료", name: "식혜", description: "전통 쌀 음료", price: 3000, photo: null },
    { id: "m9", category: "음료", name: "유자차", description: "뜨거운 유자차", price: 3500, photo: null },
  ],
  "itaewon-kebab": [
    { id: "k1", category: "인기메뉴", name: "되네르 케밥", description: "양고기 또는 닭고기 선택", price: 9500, photo: null },
    { id: "k2", category: "인기메뉴", name: "아다나 케밥", description: "매운 양고기 꼬치", price: 14000, photo: null },
    { id: "k3", category: "인기메뉴", name: "이스켄데르 케밥", description: "요거트 소스 케밥", price: 16000, photo: null },
    { id: "k4", category: "사이드", name: "후무스", description: "병아리콩 딥", price: 5000, photo: null },
    { id: "k5", category: "음료", name: "아이란", description: "터키 전통 요거트 음료", price: 3000, photo: null },
  ],
};

const MOSQUES = [
  {
    id: "seoul-central",
    name: "Seoul Central Mosque",
    nameKo: "서울중앙성원",
    subtitle: "이슬람 서울 센터",
    type: "mosque",
    address: "서울특별시 용산구 우사단로10길 39",
    distance: "1.2km",
    walkTime: "도보 15분",
    phone: "02-793-6908",
    facilities: ["우두 시설", "여성 기도실", "주차 가능", "영어 가능"],
    juma: "매주 금요일 12:30",
    photo: "https://images.unsplash.com/photo-1519817650134-7780eb40b2fb?w=400&h=250&fit=crop&auto=format&q=80",
  },
  {
    id: "itaewon-masjid",
    name: "Itaewon Masjid",
    nameKo: "이태원 마스지드",
    subtitle: null,
    type: "mosque",
    address: "서울특별시 용산구 이태원로 27",
    distance: "0.3km",
    walkTime: "도보 4분",
    phone: "02-795-1234",
    facilities: ["우두 시설", "주차 가능"],
    juma: "매주 금요일 13:00",
    photo: null,
  },
  {
    id: "coex-prayer",
    name: "COEX Prayer Room",
    nameKo: "코엑스 기도실",
    subtitle: null,
    type: "prayer-room",
    address: "서울특별시 강남구 삼성동 코엑스몰 B1",
    distance: "3.8km",
    walkTime: null,
    phone: null,
    facilities: ["우두 시설"],
    juma: null,
    photo: null,
  },
  {
    id: "suwon-mosque",
    name: "Suwon Islamic Center",
    nameKo: "수원 이슬람 성원",
    subtitle: null,
    type: "mosque",
    address: "경기도 수원시 팔달구 매산로 88",
    distance: "12km",
    walkTime: "차량 25분",
    phone: "031-242-5678",
    facilities: ["우두 시설", "여성 기도실", "주차 가능", "한국어 가능"],
    juma: "매주 금요일 12:30",
    photo: null,
  },
];

const PRAYER_TIMES = {
  hijriDate: "1448년 사파르 10일",
  gregorianDate: new Date().toISOString().split("T")[0],
  prayers: [
    { id: "fajr", name: "파즈르", nameEn: "Fajr", time: "04:47" },
    { id: "sunrise", name: "일출", nameEn: "Sunrise", time: "06:15" },
    { id: "dhuhr", name: "두흐르", nameEn: "Dhuhr", time: "12:15" },
    { id: "asr", name: "아스르", nameEn: "Asr", time: "14:32" },
    { id: "maghrib", name: "마그립", nameEn: "Maghrib", time: "17:48" },
    { id: "isha", name: "이샤", nameEn: "Isha", time: "19:21" },
  ],
};

const ORDERS = [
  {
    id: "order-1", restaurant: "신당 할랄 키친", restaurantId: "sindang-halal",
    date: "2024.11.20", total: 34500, items: "할랄 갈비탕 외 2개", status: "delivered", rated: false,
    orderNumber: "#HMK-20241120-7731", orderDate: "2024년 11월 20일 오후 2:15", deliveredDate: "2024년 11월 20일 오후 3:02",
    orderItems: [
      { name: "할랄 갈비탕", option: "보통", price: 13500, qty: 1 },
      { name: "비빔밥 (할랄)", option: "기본", price: 11000, qty: 2 },
      { name: "오이무침", option: "사이드", price: 3000, qty: 1 },
    ],
    subtotal: 38500, deliveryFee: 2000, couponDiscount: 6000, tip: 0,
    paymentMethod: "신한카드 ····4521", deliveryAddress: "서울특별시 용산구 이태원로 123, 501호",
    courier: { name: "김민준", rating: 4.9, deliveries: 8241 },
  },
  { id: "order-2", restaurant: "이스탄불 케밥 & 피데", restaurantId: "itaewon-kebab", date: "2024.11.15", total: 21000, items: "케밥 세트 외 1개", status: "delivered", rated: true },
  { id: "order-3", restaurant: "우즈베키스탄 플로프 하우스", restaurantId: "uzbekistan-plov", date: "2024.11.10", total: 18500, items: "플로프 + 라그만", status: "delivered", rated: true },
  { id: "order-4", restaurant: "델리 스파이스 하우스", restaurantId: "delhi-spice", date: "2024.11.05", total: 27000, items: "버터 치킨 커리 외 2개", status: "cancelled", rated: false },
];

const SAVED_PLACES = {
  restaurants: [
    { id: "sindang-halal", name: "신당 할랄 키친", halalStatus: "certified", rating: 4.8, reviewCount: 3241, imageId: "1498654896293-37c98e7f5fe4" },
    { id: "itaewon-kebab", name: "이스탄불 케밥 & 피데", halalStatus: "certified", rating: 4.5, reviewCount: 2110, imageId: "1529042410759-befb1204b468" },
    { id: "masjid-seoul-cafe", name: "마스지드 서울 카페", halalStatus: "muslim-owned", rating: 4.9, reviewCount: 940, imageId: "1414235077428-338989a2e8c0" },
  ],
  mosques: [
    { id: "seoul-central", name: "서울중앙성원", nameEn: "Seoul Central Mosque", distance: "1.2km" },
    { id: "itaewon-masjid", name: "이태원 마스지드", nameEn: "Itaewon Masjid", distance: "0.3km" },
  ],
};

const PROFILE = {
  id: 1, email: "demo@halalmap.kr", name: "김무함마드", role: "user",
  initials: "김", membership: "일반 회원", points: 3200,
  stats: { orders: 12, reviews: 8, saved: 5 },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockResponses: Record<string, (params?: Record<string, string>) => any> = {
  "/api/restaurants": (params) => {
    let filtered = RESTAURANTS;
    if (params?.category) filtered = filtered.filter((r) => r.category === params.category);
    if (params?.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter((r) => r.name.toLowerCase().includes(q) || r.nameKo.includes(q) || r.category.includes(q));
    }
    return { restaurants: filtered };
  },
  "/api/mosques": (params) => {
    let filtered = MOSQUES;
    if (params?.type) filtered = filtered.filter((m) => m.type === params.type);
    return { mosques: filtered };
  },
  "/api/prayer-times": () => ({ prayerTimes: PRAYER_TIMES, location: "이태원동, 서울" }),
  "/api/profile": () => ({ profile: PROFILE }),
  "/api/orders": () => ({ orders: ORDERS }),
  "/api/saved-places": () => ({ savedPlaces: SAVED_PLACES }),
  "/api/auth/login": () => ({ token: "demo-token", user: PROFILE }),
  "/api/auth/me": () => ({ user: PROFILE }),
};

export function getMockResponse<T>(path: string): T | null {
  const [basePath, queryString] = path.split("?");
  const params: Record<string, string> = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((v, k) => { params[k] = v; });
  }

  if (mockResponses[basePath]) return mockResponses[basePath](params) as T;

  const restaurantMatch = basePath.match(/^\/api\/restaurants\/([^/]+)$/);
  if (restaurantMatch) {
    const r = RESTAURANTS.find((x) => x.id === restaurantMatch[1]);
    return r ? ({ restaurant: r } as T) : null;
  }

  const menuMatch = basePath.match(/^\/api\/restaurants\/([^/]+)\/menu$/);
  if (menuMatch) {
    const id = menuMatch[1];
    const r = RESTAURANTS.find((x) => x.id === id);
    return { restaurant: { id, name: r?.name ?? id }, menu: MENUS[id] ?? [] } as T;
  }

  const mosqueMatch = basePath.match(/^\/api\/mosques\/([^/]+)$/);
  if (mosqueMatch) {
    const m = MOSQUES.find((x) => x.id === mosqueMatch[1]);
    return m ? ({ mosque: m } as T) : null;
  }

  const orderMatch = basePath.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch) {
    const o = ORDERS.find((x) => x.id === orderMatch[1]);
    return o ? ({ order: o } as T) : null;
  }

  return null;
}
