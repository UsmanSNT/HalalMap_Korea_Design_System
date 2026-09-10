# Normal User frontend flow

Scope: existing React/Vite/Tailwind application, based on main `307f520`. Admin, Owner and Courier screens are preserved. No database/backend implementation or main merge.

## Inventory

47 routed screen IDs: 42 customer screens and 5 authentication/onboarding presentations. `login` is rendered by the unauthenticated session gate; an authenticated visitor sees Home. `HomeDesktop.tsx` and `HomeAndroid.tsx` are alternative design presentations, preserved but excluded from the normal mobile flow. Splash is an optional first-run presentation, not an extra destination in everyday navigation. No separate burger menu design exists; existing Home services and Profile rows expose secondary flows.

| URL after #/ | Component | Entry point |
|---|---|---|
| `login` | `LoginScreen (session gate)` | Session gate; Sign up → Login; Logout |
| `splash` | `SplashScreen` | First-run presentation (direct route) |
| `onboarding` | `OnboardingScreen` | Splash → onboarding slides |
| `signup` | `SignUpScreen` | Login → Sign up; onboarding CTA |
| `language` | `LanguageScreen` | Login / Profile / Settings |
| `home` | `HomeScreen` | Successful login; Home tab |
| `restaurant-list` | `RestaurantListScreen` | Home category / See all; Search category |
| `restaurant-detail` | `RestaurantDetailScreen` | Home / Search / restaurant list / saved places |
| `menu` | `MenuScreen` | Restaurant detail → View full menu |
| `item-detail` | `ItemDetailScreen` | Menu item title; restaurant item preview |
| `cart` | `CartScreen` | Menu cart button; Add to cart |
| `checkout` | `CheckoutScreen` | Cart → Place order |
| `order-confirmation` | `OrderConfirmationScreen` | Checkout → explicit sample order preview |
| `search` | `SearchScreen` | Search tab; Home search |
| `map-view` | `MapViewScreen` | Search → Map; Home nearby map |
| `city-selector` | `CitySelectorScreen` | Home location; map location |
| `restaurant-map-detail` | `RestaurantMapDetailScreen` | Map restaurant pin; restaurant detail map |
| `mosque-list` | `MosqueListScreen` | Prayer / map and mosque browsing |
| `mosque-detail` | `MosqueDetailScreen` | Home mosque card; mosque list; saved place; map pin |
| `prayer-times` | `PrayerTimesScreen` | Prayer tab; Home prayer banner |
| `qibla` | `QiblaScreen` | Prayer → Qibla |
| `scanner` | `ScannerScreen` | Home scanner service; Search scanner category |
| `scan-result` | `ScanResultScreen` | Scanner → sample; scan history item |
| `scan-history` | `ScanHistoryScreen` | Scanner history; Profile |
| `order-tracking` | `OrderTrackingScreen` | Order sample / active order preview |
| `order-history` | `OrderHistoryScreen` | Orders tab; Profile |
| `order-detail` | `OrderDetailScreen` | Order history card / receipt |
| `profile` | `ProfileScreen` | Profile tab |
| `saved-places` | `SavedPlacesScreen` | Profile → Saved places |
| `address` | `AddressScreen` | Profile → Delivery addresses; Checkout address |
| `settings` | `SettingsScreen` | Profile → Settings / edit button |
| `reviews` | `ReviewsScreen` | Restaurant detail → Reviews; order review |
| `community` | `CommunityScreen` | Ramadan → community |
| `share` | `ShareScreen` | Detail Share; community; travel; scanner |
| `ai-meal` | `AIMealScreen` | Home → AI meal |
| `group-order` | `GroupOrderScreen` | Home → Group order |
| `meal-plans` | `MealPlansScreen` | Profile → Meal plans |
| `grocery` | `GroceryScreen` | Home → Grocery |
| `travel-planner` | `TravelPlannerScreen` | Home → Travel; city selector |
| `offline-prayer` | `OfflinePrayerScreen` | Prayer → Offline prayer |
| `notifications` | `NotificationsScreen` | Home notification icon; Profile |
| `ramadan` | `RamadanScreen` | Home → Ramadan |
| `eid` | `EidScreen` | Profile → Eid; notifications |
| `loyalty` | `LoyaltyScreen` | Profile → Coupons and points |
| `referral` | `ReferralScreen` | Profile → Referral |
| `tutorial` | `TutorialScreen` | Profile → App guide |
| `multilingual` | `MultilingualScreen` | Profile → Multilingual preview |

## Navigation and demo behavior

Hash routes work on static hosting without a server rewrite. Every tab pushes history; in-app Back restores actual prior navigation, with a parent fallback for directly opened pages. Entity IDs are query parameters, retained through restaurant/menu/item/review/share routes. The normal shell remains mobile at 360, 390 and 430 px and is capped at 430 px on desktop.

The existing Normal User demo is `user@halalmap.test` / `User123!`. Only explicitly recognized test credentials grant a demo session. Wrong credentials do not silently become a user. Session restoration, logout and protected deep links are supported. Demo GET data is available without a database. Production mutations do not fall back to fake successes.

Cart quantities/options, coupon, address CRUD/default, profile name, saved places, search, selected city, notification preferences and trip selections are local demo data. A payment attempt shows an explicit backend-required dialog and stays at checkout. The existing confirmation/tracking designs remain clearly identified sample previews. The scanner result is explicitly sample data; it is not a certification or live product scan.

Korean, English and Uzbek namespace dictionaries are supplemented by a content dictionary for original Korean fixtures. Stable IDs/filter values stay independent of display translations. Language selection updates the current UI and persists across reload.

## Backend/integration boundaries

Real payment/order submission, account creation and social authentication, password reset, support contact, posted reviews/comments, referrals/reward redemption, subscription/group-order completion, camera/OCR, live map/geolocation/compass, scheduled push notifications and authoritative prayer updates still require integrations. Buttons for unavailable actions explain this rather than claiming success. Offline download, meal planning, map and tracking screens are demo presentations; they are not a production offline cache, live AI service or live tracking system. Existing remote images require internet access. Demo prayer times and halal statuses must not be treated as live verified information.

## Verification

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit`.
- Production: `node node_modules/vite/bin/vite.js build`.
- Native button audit: `node scripts/audit-customer.mjs` (handler-presence check, not a semantic test).
- Browser walkthrough: `node scripts/customer-walkthrough.cjs`.
- Route matrix: `node scripts/customer-routes.cjs`.

For browser checks, start Vite on `127.0.0.1:8443`, supply a Playwright installation through `PLAYWRIGHT_MODULE` (or install `playwright`), and have Microsoft Edge available. Tests write JSON/screenshots to ignored `artifacts/`. The walkthrough exercises real controls for login, language, tabs, restaurant identity/refresh, item/cart persistence, no fake payment, address save, mosque identity, search/back, scan identity, browser history and logout. The route matrix covers 47 route IDs × 3 languages × 3 widths = 423 render combinations, checking runtime errors, blank routes, missing translation keys, Korean display leakage and horizontal overflow. These checks are frontend coverage, not production integration certification.

No existing test suite was configured in package.json. The build has an existing large bundle warning; role applications are still in the same bundle.
