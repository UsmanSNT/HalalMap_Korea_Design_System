# Plan: HalalMap Korea — 31 Customer App Screens

## Context
Build a complete navigable 31-screen mobile app mockup for "HalalMap Korea" from a blank-slate Vite + React + Tailwind CSS v4 project. The deliverable is a Figma-style screen picker: left sidebar listing all 31 screens by section, center showing the current screen inside a 390×844px iPhone 14 Pro phone frame. Aesthetic: Korean food delivery app refinement (배달의민족/쿠팡이츠 style) + calm, modern Islamic identity — emerald/gold/cream palette, subtle zellige geometric pattern texture, no ornamental overload.

---

## File Structure

```
src/
  index.css                          ← fonts + CSS tokens + keyframe animations
  main.tsx                           ← unchanged
  App.tsx                            ← screen navigator (sidebar + phone frame)
  components/
    Shared.tsx                       ← GeometricPattern, StatusBar, BottomNav, reusable atoms
  screens/
    OnboardingScreens.tsx            ← Screens 1–5 (Splash, Onboarding, Signup, Login, Language)
    HomeScreens.tsx                  ← Screens 6–13 (Home, RestaurantList, RestaurantDetail, Menu, ItemDetail, Cart, Checkout, OrderConfirmation)
    SearchScreens.tsx                ← Screens 14–17 (Search, MapView, CitySelector, RestaurantMapDetail)
    MosqueScreens.tsx                ← Screens 18–21 (MosqueList, MosqueDetail, PrayerTimes, QiblaCompass)
    ScannerScreens.tsx               ← Screens 22–24 (Scanner, ScanResult, ScanHistory)
    OrderScreens.tsx                 ← Screens 25–27 (OrderTracking, OrderHistory, OrderDetail)
    ProfileScreens.tsx               ← Screens 28–31 (Profile, SavedPlaces, AddressManagement, Settings)
```

---

## `src/index.css` — Foundations

**Google Fonts (CSS @import must come FIRST, before `@import 'tailwindcss'`):**
- `Noto Sans KR` wght 300;400;500;700 — Korean text
- `Inter` wght 400;500;600;700 — Latin UI
- `Noto Naskh Arabic` wght 400;700 — Arabic accent "حلال"

**CSS Custom Properties on `:root`:**
```
--green: #1B6B4A        --green-dark: #14503A    --green-light: #E8F3ED
--gold: #C4883A         --gold-light: #FDF3E4
--cream: #FAF8F2        --surface: #FFFFFF
--charcoal: #1A1A18     --muted: #6B7280         --border: #E5E7E4
--rose: #E8D0C8         --danger: #D94F4F         --info: #2C7BE5
```

**Keyframe animations:**
- `pulse-ring` — blue ring expanding outward for user location pin
- `float-up` — card/content entrance (translateY 20→0, opacity 0→1)
- `slide-up` — bottom sheet entrance
- `spin-slow` (8s) — compass needle idle drift
- `fade-scale` — splash logo entrance
- `skeleton-shimmer` — loading skeleton gradient sweep

**Global:** `scrollbar-hide` utility class, `body` font-family: Noto Sans KR, Inter, sans-serif, `.font-arabic` class for Noto Naskh Arabic.

---

## `src/components/Shared.tsx` — Reusable Atoms

### GeometricPattern
Inline SVG using `<pattern>` element — 8-point zellige star tile (40×40px repeat). Two overlapping rotated squares + diagonal connecting lines. Stroke only, `currentColor`, 0.8px. Used as `opacity-[0.05]` overlay on green/cream sections.

### StatusBar
iOS-style status bar: "9:41" left, signal/wifi/battery right. White or dark variant.

### BottomNav
5 tabs: Home (house icon), Search (magnifier), Orders (bag), Prayer (crescent moon), Profile (person). Active tab in `--green`, inactive in `--muted`. Green active dot indicator. Accepts `activeTab` + `onTabChange` props.

### Reusable atoms (used across screens):
- `HalalBadge` — green pill "HALAL CERTIFIED" with shield icon, or gold "MUSLIM-OWNED", or sage "HALAL FRIENDLY"
- `StarRating` — gold star + numeric rating + review count
- `PriceTag` — ₩ formatted Korean won
- `RestaurantCard` — photo (200px h), name, HalalBadge, StarRating, distance, delivery time + fee. `16px` radius card, shadow-sm.
- `MosqueCard` — crescent icon in gold, name, distance, next prayer time pill
- `OrderStatusChip` — Pending (amber), Preparing (blue), Delivering (purple), Delivered (green)
- `SectionHeader` — section label + "더보기 ›" link

---

## Screen Implementation Details

### ONBOARDING & AUTH (5 screens)

**1. Splash** (`SplashScreen`)
- Full `--green` background with GeometricPattern at 5% opacity
- Center: Arabic "حلال" in Noto Naskh Arabic (56px, gold), below it "HalalMap Korea" in white Inter 700
- Crescent + map pin combined logo SVG (emerald/gold duotone)
- `animate-fade-scale` on logo
- Loading bar at bottom (green→gold gradient, animating width)

**2. Onboarding** (`OnboardingScreen`)
- State: `slide` 0/1/2
- Slide 1: Illustration (food bowls + halal badge SVG), "주변 할랄 음식을 찾아보세요" / "Find Halal Food Near You"
- Slide 2: Mosque illustration, "근처 모스크와 기도실 안내" / "Locate Nearby Mosques & Prayer Rooms"
- Slide 3: Barcode scanner illustration, "제품 할랄 성분 스캔" / "Scan Products for Halal Status"
- Dot indicators, Next / Skip buttons, final slide shows "Get Started" (green fill) + "Log In"

**3. Sign Up** (`SignUpScreen`)
- Green header with GeometricPattern, logo small
- Toggle: "이메일" / "전화번호" (phone)
- Floating label inputs: 이름 (Name), 이메일/전화번호, 비밀번호
- Social login divider "또는 소셜로 로그인"
- KakaoTalk button (yellow #FEE500, black text "카카오로 시작하기"), Google (white, colored G), Apple (black)
- Terms agreement checkbox
- "회원가입" primary green button

**4. Login** (`LoginScreen`)
- Clean cream background, logo top center
- Floating label: 이메일 or 전화번호, 비밀번호
- "비밀번호 찾기" text link
- Primary "로그인" button
- Divider + same 3 social buttons
- "계정이 없으신가요? 회원가입" bottom link
- Green accent on focused inputs

**5. Language Selection** (`LanguageScreen`)
- "언어 선택 / Select Language" header
- 6 rows with flag emoji + language name (native) + script sample:
  - 🇰🇷 한국어 · Korean
  - 🇺🇸 English
  - 🇺🇿 O'zbek · Uzbek
  - 🇸🇦 العربية · Arabic (RTL text)
  - 🇮🇩 Bahasa Indonesia
  - 🇧🇩 বাংলা · Bengali
- Checkmark on selected (default: 한국어)
- "계속하기 / Continue" green button at bottom

### HOME & DISCOVERY (8 screens)

**6. Home** (`HomeScreen`)
- StatusBar white-on-green
- Sticky header: location pill "📍 이태원동, 용산구 ▾", notification bell
- **Prayer time banner**: green gradient card, crescent icon, "다음 기도: 아스르 Asr · 2시간 14분 후", progress bar
- Search bar (cream rounded, magnifier icon, "할랄 음식 검색...")
- Category horizontal scroll: Korean Halal 🍖, Turkish 🥙, Uzbek 🍽, Indian 🍛, Arabic 🥗, Pakistani, Indonesian — each as pill chip
- Section: "인기 할랄 식당" horizontal scroll of 3 RestaurantCards
  - "신당 할랄 키친" 4.8★ · 2.3km · 25-35분 · ₩2,000
  - "이태원 케밥 하우스" 4.6★ · 0.8km · 15-25분 · ₩1,500
  - "마스지드 서울 카페" 4.9★ · 1.1km · 20-30분 · 무료
- Section: "근처 모스크" horizontal scroll of 2 MosqueCards
  - "서울중앙성원" 1.2km · 다음 기도 아스르 14:32
  - "이태원 마스지드" 0.3km · 다음 기도 아스르 14:35
- Promo banner (gold gradient, "첫 주문 ₩3,000 할인")
- BottomNav active: Home

**7. Restaurant List** (`RestaurantListScreen`)
- Back arrow + "할랄 레스토랑" title + filter icon
- Filter chips horizontal scroll: 거리순, ⭐ 평점, 배달비, 인증유형, 음식종류
- Sort bottom pill: "빠른배달 순" with chevron
- Vertical list of 5 RestaurantCards (full-width style, horizontal layout):
  - Photo left (100×100px), name + badges, rating, distance + ETA + fee right
  - "신당 할랄 키친" HALAL CERTIFIED · 4.8★ (3,241) · 2.3km · 25분 · ₩2,000
  - "우즈베키스탄 플로프 하우스" MUSLIM-OWNED · 4.7★ · 3.1km · 30분 · ₩1,500
  - "이스탄불 케밥" HALAL CERTIFIED · 4.5★ · 0.8km · 20분 · 무료
  - "델리 스파이스" HALAL FRIENDLY · 4.3★ · 4.2km · 40분 · ₩2,500
  - "자카르타 나시고렝" HALAL CERTIFIED · 4.6★ · 2.8km · 35분 · ₩2,000

**8. Restaurant Detail** (`RestaurantDetailScreen`)
- Hero photo (full width 220px, Unsplash food image)
- Sticky floating back button on photo
- Info card: Name "신당 할랄 키친", HalalBadge, StarRating, distance + delivery time + min order
- Horizontal info row: icons for hours (09:00–22:00), phone, share
- Description: "이슬람 식품청 인증 할랄 한식 전문점. 돼지고기 및 알코올 완전 배제."
- Tab bar: 전체메뉴 · 인기메뉴 · 리뷰 (active state)
- Menu category section headers + 3 item rows each

**9. Menu** (`MenuScreen`)
- Sticky header: restaurant name + cart icon with badge count
- Category tabs horizontal: 인기메뉴 · 한식 · 세트 · 음료 · 사이드
- Section: "🔥 인기메뉴" with 4 items:
  - Horizontal row: photo 80×80, name, description snippet, ₩price, + button
  - "할랄 갈비탕" · 사골 육수와 소갈비 · ₩13,500
  - "비빔밥 (할랄)" · ₩11,000
  - "된장찌개 세트" · ₩12,000
  - "할랄 삼계탕" · ₩16,500
- Section "한식" with more items
- Bottom bar: "장바구니 보기 · 2개 · ₩24,500" green button

**10. Item Detail** (`ItemDetailScreen`)
- Large hero photo (full width, 280px)
- Name "할랄 갈비탕", ₩13,500, HalalBadge
- Description paragraph
- "옵션 선택" sections:
  - 사이즈: 보통 / 대 (+₩2,000) — radio selection
  - 추가 반찬: 깍두기, 배추김치, 오이무침 — checkbox
  - 맵기: 안맵게 / 보통 / 맵게 — radio
- 특별 요청사항 text input
- Bottom bar: quantity stepper (−/+) + "장바구니 담기 · ₩13,500" green button

**11. Cart** (`CartScreen`)
- "장바구니" header with item count
- Restaurant name header row
- 3 cart items with photo, name, options, price, quantity stepper
  - "할랄 갈비탕 × 1 · ₩13,500"
  - "비빔밥 (할랄) × 2 · ₩22,000"
- "다른 메뉴 추가" text link
- Divider
- 쿠폰/할인코드 input with "적용" button
- 주문 메모 textarea
- Price breakdown: 소계 ₩35,500 / 배달비 ₩2,000 / 할인 -₩3,000 / **합계 ₩34,500**
- Minimum order notice if applicable
- "주문하기" green button (full width, sticky)

**12. Checkout** (`CheckoutScreen`)
- "결제" header
- Section "배달 주소": map thumbnail + "서울특별시 용산구 이태원로 123, 501호" + pencil icon
- Section "배달 시간": "최대한 빨리" (selected) / "시간 지정" options
- Section "결제 수단": 카드 radio rows (신한카드 ····4521, KakaoPay, Toss), "+ 결제수단 추가"
- Section "팁 선택": ₩0 (selected) / ₩500 / ₩1,000 / ₩2,000 pill selection
- 영수증: itemized with final total ₩34,500
- "₩34,500 결제하기" green button sticky bottom

**13. Order Confirmation** (`OrderConfirmationScreen`)
- Emerald green background full screen
- Animated checkmark circle (CSS stroke-dashoffset animation)
- "주문이 접수되었습니다! 🎉" white headline
- Order number "주문번호 #HMK-20241124-8847"
- Estimated time card: "예상 배달 시간 35–45분"
- Status timeline: Confirmed ✓ → Preparing (active spinner) → Picked Up → Delivered
- "주문 추적하기" white outlined button, "홈으로" white fill button

### SEARCH & LOCATION (4 screens)

**14. Search** (`SearchScreen`)
- Search bar (focused state, cursor blinking CSS)
- "최근 검색" section: list of recent queries with clock icon + ✕ dismiss
  - "이태원 할랄", "케밥", "모스크 근처 식당"
- "인기 검색어" section: numbered list 1–8 with trending fire icon
- Category quick filters grid (2×3): 한식 할랄 / 터키 / 우즈베크 / 인도 / 아랍 / 스캐너
- Voice search button (microphone, green circle)
- BottomNav active: Search

**15. Map View** (`MapViewScreen`)
- Fake full-screen map (cream/sage color blocks suggesting roads + blocks, SVG-based)
- Road grid lines in cream/beige on sage green blocks (simplified Seoul Itaewon area suggestion)
- 4 restaurant green map pins + 2 mosque gold map pins plotted on the SVG map
- Blue pulsing circle for current location
- Search bar overlay at top: "이 지역 검색" pill button
- Current location button (circle, bottom right)
- Bottom sheet (partial, 30% up): "주변 결과 8개" header, horizontal scroll of 2 RestaurantCards
- Filter chips: 레스토랑 (active) / 모스크 / 기도실

**16. City/Area Selector** (`CitySelectorScreen`)
- "방문 도시 선택" header with back button
- Search bar: "도시 또는 지역 검색..."
- "저장된 위치" section: 2 saved cities with heart icon
  - "서울 이태원" · "부산 서면"
- "인기 도시" grid (2 cols): Seoul, Busan, Incheon, Jeju, Daegu, Gyeongju — each card with city photo thumbnail
- "다음주 부산역 근처 할랄 식당 보기" suggestion banner in gold

**17. Restaurant Map Detail** (`RestaurantMapDetailScreen`)
- Full-screen map (same style as MapView but zoomed in, one restaurant selected)
- Selected restaurant green pin (larger, with popup label)
- Overlay card at bottom (white, 200px tall slide-up):
  - Restaurant photo + name + HalalBadge + rating + distance
  - "메뉴 보기" green button + "길 찾기" outlined button

### MOSQUE & PRAYER (4 screens)

**18. Mosque List** (`MosqueListScreen`)
- "근처 모스크 · 기도실" header
- Toggle tabs: 모스크 / 기도실 (mall/station prayer rooms)
- List of 4 mosque cards (full width):
  - Photo thumbnail 72×72, name, address, distance, next prayer pill, walking time
  - "서울중앙성원 (이슬람 서울 센터)" · 이태원로 · 1.2km · 아스르 14:32 · 도보 15분
  - "이태원 마스지드" · 0.3km · 도보 4분
  - "코엑스 기도실" (prayer room icon) · 삼성동 · 3.8km
  - "수원 이슬람 성원" · 12km · 차량 25분
- Map toggle button top right
- BottomNav active: Prayer

**19. Mosque Detail** (`MosqueDetailScreen`)
- Hero photo mosque
- "서울중앙성원" title, "이슬람 서울 센터" subtitle
- Address: "서울특별시 용산구 우사단로10길 39"
- Prayer times table (today's date, Hijri date):
  - Fajr 04:47 / Sunrise 06:15 / Dhuhr 12:15 / Asr 14:32 / Maghrib 17:48 / Isha 19:21
  - Next: Asr highlighted in green
- Juma: "매주 금요일 12:30"
- Facilities chips: 우두 시설 · 여성 기도실 · 주차 가능 · 영어 가능
- "길 찾기" (green) + "공유하기" (outlined) buttons

**20. Prayer Times** (`PrayerTimesScreen`)
- Hijri date: "1446년 주마다 알아왈 22일" + Gregorian
- Location: "이태원동, 서울"
- **Countdown card** (green gradient): "다음 기도까지" · "아스르 Asr" · "01 : 47 : 23" large numerals
- Today's 5 prayers table with icons:
  - 파즈르 Fajr 04:47 (passed — muted)
  - 두흐르 Dhuhr 12:15 (passed — muted)
  - 아스르 Asr 14:32 (NEXT — green highlight pill)
  - 마그립 Maghrib 17:48
  - 이샤 Isha 19:21
- Monthly mini calendar (small, current day highlighted in green)
- Notification settings: toggle per prayer (Fajr: ON, Dhuhr: OFF, Asr: ON...)

**21. Qibla Compass** (`QiblaScreen`)
- Dark navy/charcoal background
- Full-screen compass rose (SVG circle, degree markings, N/S/E/W)
- Gold needle pointing to Qibla direction
- Islamic 8-point star border decorating the compass ring
- "키블라 방향" center text + "서울에서 292.4°" below
- Current bearing "현재 방향: 147°" small pill
- Calibration instructions at bottom in muted text

### HALAL SCANNER (3 screens)

**22. Scanner** (`ScannerScreen`)
- Dark background (camera viewfinder)
- White corner-bracket scan frame (animated corner glow)
- "바코드 또는 성분표를 스캔하세요" instruction in white pill
- Flash toggle (⚡) top right, gallery import (🖼) top left
- Scan beam animation (thin green line sweeping top to bottom)
- Previous: "최근 스캔: 오리온 초코파이" small chip at bottom

**23. Scan Result** (`ScanResultScreen`)
- Product: "오리온 초코파이 정 (12개입)"
- Product photo (Unsplash packaged food or placeholder)
- Big verdict badge: "✅ HALAL" (green) — or show HARAM variant in red, MASHBOOH in amber
- "인증 기관: 한국이슬람교중앙회 (KMF)"
- Ingredient list with flagged items:
  - ✅ 밀가루, ✅ 설탕, ✅ 팜유, ✅ 코코아 → all green
  - "돼지 젤라틴 없음 ✓" positive note
- Source: "데이터베이스: KMF · 2024년 10월 업데이트"
- "오류 신고" text link + "공유" icon
- "다시 스캔" green button

**24. Scan History** (`ScanHistoryScreen`)
- "스캔 기록" header
- List of past scans (date + product + verdict chip):
  - 오리온 초코파이 · 오늘 · HALAL (green)
  - 농심 새우깡 · 어제 · MASHBOOH (amber)
  - Lotte 빼빼로 · 11월 20일 · HALAL
  - CJ 스팸 · 11월 19일 · HARAM (red)
- "전체 삭제" small text button top right
- Empty state placeholder if no items

### ORDERS & TRACKING (3 screens)

**25. Order Tracking** (`OrderTrackingScreen`)
- Fake map at 50% screen height (same SVG style, showing route dots)
- Courier location moving dot (animated slightly)
- Bottom sheet (50% up):
  - "도착까지 약 18분" countdown large
  - Status stepper: 주문접수 ✓ → 조리중 (spinning) → 픽업완료 → 배달중 (active) → 배달완료
  - Courier card: avatar + "김민준 · ⭐ 4.9 · 배달 #8,241회" + call/chat buttons
  - Progress: green fill on stepper

**26. Order History** (`OrderHistoryScreen`)
- "주문 내역" header
- Tab: 진행중 (1) / 완료 (12)
- Past order cards:
  - Restaurant name, date, total, item summary
  - "신당 할랄 키친 · 2024.11.20 · ₩34,500 · 할랄 갈비탕 외 2개"
  - Buttons: "재주문" (outlined green) + "영수증" (ghost)
  - Star rating prompt: ⭐ ⭐ ⭐ ⭐ ⭐ "리뷰 남기기"
- BottomNav active: Orders

**27. Order Detail** (`OrderDetailScreen`)
- "주문 상세" header
- Status chip "DELIVERED" green + date/time
- Order #HMK-20241120-7731
- Items list with prices
- Divider
- Payment breakdown: 소계 / 배달비 / 할인 / 합계
- Delivery address + Courier name
- "영수증 보기" PDF-style button

### PROFILE & SETTINGS (4 screens)

**28. Profile** (`ProfileScreen`)
- Green header with geometric pattern, avatar circle (initials or photo), name, email
- Menu list rows with right chevrons:
  - 📦 주문 내역
  - 🏠 배달 주소 관리
  - 💳 결제 수단
  - ❤️ 저장된 식당 · 모스크
  - 🔔 알림 설정
  - 🌐 언어 설정
  - 🎟 쿠폰 · 포인트
  - ❓ 고객센터
  - ⚙️ 설정
- Version "v1.0.0 · HalalMap Korea"
- "로그아웃" danger text at bottom
- BottomNav active: Profile

**29. Saved Places** (`SavedPlacesScreen`)
- "저장된 장소" header
- Toggle tabs: 식당 / 모스크
- 식당 tab: 3 saved restaurants with heart icon, name, badge, rating, "주문하기" button
- 모스크 tab: 2 saved mosques with gold crescent icon

**30. Address Management** (`AddressScreen`)
- "배달 주소" header
- 3 saved addresses:
  - 🏠 집 · 서울 용산구 이태원로 123, 501호 (default green pill)
  - 🏢 회사 · 서울 강남구 테헤란로 456, 12층
  - 🕌 모스크 · 서울 용산구 우사단로10길 39
- "+ 새 주소 추가" outlined button
- Each row: edit pencil + trash icon
- "기본 주소로 설정" on tap

**31. Settings** (`SettingsScreen`)
- "설정" header
- Section "알림":
  - 주문 업데이트 (toggle ON)
  - 기도 시간 알림 (toggle ON, per-prayer expand)
  - 프로모션 (toggle OFF)
- Section "앱":
  - 언어 → 한국어 (chevron)
  - 테마 → 라이트 / 다크 / 자동 (segment control)
  - 할랄 인증 기관 설정 (chevron → KMF, JAKIM, etc.)
- Section "계정":
  - 개인정보 변경
  - 비밀번호 변경
  - 데이터 삭제 요청 (danger red text)
- Section "정보":
  - 이용약관, 개인정보처리방침, 앱 버전 1.0.0

---

## App.tsx — Screen Navigator

**Layout**: Fixed left sidebar (260px) + main content area.

**Sidebar**:
- "HalalMap Korea" logo + "حلال" arabic at top (green bg)
- Scrollable list of all 31 screens grouped into 7 sections
- Active screen: green bg pill
- Section headers in uppercase muted text

**Main area**:
- Off-white desktop bg (subtle dot grid)
- Centered phone frame: 390px wide × 844px tall, black rounded border (iPhone 14 Pro shape), home indicator at bottom
- White/cream inner area with overflow-y scroll (scrollbar-hide)
- Screen components rendered inside the frame

**Screen registry** (defines order, id, label, section):
```typescript
const SCREEN_GROUPS = [
  { section: 'Onboarding & Auth', screens: [splash, onboarding, signup, login, language] },
  { section: 'Home & Discovery', screens: [home, restaurant-list, restaurant-detail, menu, item-detail, cart, checkout, order-confirmation] },
  { section: 'Search & Location', screens: [search, map-view, city-selector, restaurant-map-detail] },
  { section: 'Mosque & Prayer', screens: [mosque-list, mosque-detail, prayer-times, qibla] },
  { section: 'Halal Scanner', screens: [scanner, scan-result, scan-history] },
  { section: 'Orders & Tracking', screens: [order-tracking, order-history, order-detail] },
  { section: 'Profile & Settings', screens: [profile, saved-places, address, settings] },
]
```

---

## Unsplash Photo IDs to Use
- Korean food bowl: `1498654896293-37c98e7f5fe4`
- Korean BBQ: `1569050467447-ce54b3bbc37d`
- Kebab: `1529042410759-befb1204b468`
- Mosque exterior: `1519817650134-7780eb40b2fb`
- Restaurant interior: `1517248135467-4c7edcad34c4`
- Food platter: `1414235077428-338989a2e8c0`
- Biryani/curry: `1565557623262-b51ff2a27b73`
- Seoul city: `1540608408-6f1b-4a30-b985-4555ab4b4086`
- Person at mosque: `1564769625905-50e93615e769`
- Packaged snacks: `1567620905572-d1d0d6ca9ea0`

Format: `https://images.unsplash.com/photo-{ID}?w={W}&h={H}&fit=crop&auto=format&q=80`

---

## Verification
1. Vite hot reload should show no compile errors after each file is written
2. Screen navigator renders 31 screens switchable from sidebar
3. All interactive state works: tab switching, carousel dots, toggles
4. Fonts render correctly (Korean: Noto Sans KR, Arabic accent: Noto Naskh Arabic)
5. GeometricPattern renders at low opacity on green/cream sections
6. BottomNav highlights correct tab per screen
7. All screens fit in the 390px phone frame width (no horizontal overflow)
