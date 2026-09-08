# Halal App — ko‘rib chiqish uchun joriy holat

2026-09-08. Foydalanuvchi iltimosiga ko‘ra ish shu nuqtada to‘xtatilib, GitHub’ga ko‘rib chiqish uchun chiqarildi. Bu yakuniy production reliz emas.

1. **Aniqlanganlar:** 92 URL yo‘li, to‘rtta ish maydoni; 390px cheklovlar, kuryer telefon ramkasi, lokal navigatsiya va javobsiz boshqaruvlar bor edi.
2. **Oldingi ish:** API/session adapterlari, routing poydevori, favorites/cart fayllari va responsive o‘zgarishlar saqlandi. Oldindan staged bo‘lgan ish ham ushbu checkpoint tarkibida.
3. **Davom ettirilganlar:** ekranlararo holat, navigatsiya, mobil panellar, customer oqimlari, admin jadvallari va owner qoralamalari.
4. **Bog‘langan ekranlar:** katalog/detail/menu/item/cart/checkout/confirmation; qidiruv, saqlangan joylar, manzillar, tarix, profil, bo‘limlar menyusi; admin tanlangan yozuv detail’i; owner menyu va mavjudlik.
5. **Tugmalar:** favorites, savat miqdori, mahsulot qidiruvi, Grocery tab, menyu saqlash/tahrirlash, sozlamalar saqlash/bekor qilish, CSV eksport, saralash, sana filtri, kalendar oy almashishi, referral nusxalash. Tashqi xizmat talab qiluvchi ayrim tugmalar xizmat ulanmaganini bildiradi.
6. **Desktop:** HomeDesktop varianti katta ekranda; keng shell va sidebar. Desktop umumiy 390px ramkada emas. Barcha ichki ekranlarning yakuniy vizual auditi hali tugamagan.
7. **Mobile:** HomeScreen varianti, kenglikka mos shell, pastki navigatsiya, safe-area, yig‘iladigan ish paneli menyusi; admin KPI va owner grid’lari moslashtirildi. Kuryer 390×844 ramkasi olib tashlandi.
8. **Routing:** hash URL, history back/forward, deep-link, fallback va noto‘g‘ri yo‘l holati. Admin record IDlari query’da saqlanadi.
9. **Shared state:** foydalanuvchi scope’ida localStorage + useSyncExternalStore; cart, favorites, manzillar, notification preferences, menyu/sozlama qoralamalari. Offline namoz ma’lumoti mavjud API’dan kunlik kesimda saqlanadi. Server sinxronizatsiyasi deb ko‘rsatilmaydi.
10. **Android/iOS:** yagona React frontend saqlandi, xizmat adapterlari va safe-area tayyorlandi. Capacitor mosligi tekshirildi, ammo o‘rnatilmadi; native loyihalar, APK va iOS build hali yaratilmagan. [Rasmiy Capacitor yo‘riqnomasi](https://capacitorjs.com/docs/getting-started).
11. **Tekshiruvlar:** checkpoint TypeScript va production build o‘tdi. Asosiy bundle uchun 500 kB ogohlantirishi mavjud. Avvalgi versiya 92 yo‘l × 7 kenglik = 644 ochilish tekshiruvidan o‘tdi. Customer asosiy oqimlari, owner menyu saqlanishi, admin ID va offline kesh testlari o‘tdi. Offline test boshqariladigan API javobidan foydalanadi. JSON natijalar `plans/qa/` ichida; ular barcha tugmalar yoki pixel-perfect Figma mosligini isbotlamaydi.
12. **Qolganlar:** ekranlarning to‘liq vizual/interaction auditi, ayrim placeholder/no-op callbacklar, demo ma’lumot va success xabarlarini izchil belgilash, to‘liq tarjima, tashqi rasmlar yuklanishi, storage uchun chuqur schema tekshiruvi, native integratsiya. To‘lov, real buyurtma, SMS/OAuth, chat va ko‘plab admin amallari uchun backend/tashqi xizmat yo‘q. Hamma frontend ishini tugallangan deb hisoblamang.
13. **Backendga tayyorlik:** xizmat chegaralari va asosiy frontend oqimlari mavjud; backend shartnomalarini ishlab chiqish mumkin. Production’ga chiqishdan oldin qolgan frontend auditi va haqiqiy endpointlar bilan integratsion testlar kerak.

## Lokal ko‘rish

`npm run dev` → http://localhost:8443. Login sahifasidagi test akkauntlaridan foydalaning. Backend shu buyruq bilan 8787 portda ishga tushadi.

## Muhim skriptlar

- `scripts/check-routes.mjs`: yo‘llar va viewport smoke testi.
- `scripts/check-flows.mjs`: customer asosiy oqimlari.
- `scripts/check-owner-offline.mjs`: owner, admin ID va offline kesh.
- `scripts/audit-screens.mjs`: statik inventar; false positive/negative bo‘lishi mumkin.
- `connect-*.mjs`, `finish-*.mjs`, `refine-shared-flows.mjs`, `stabilize-shells.mjs`: bir marta bajarilgan tahrirlash skriptlari. **Qayta ishga tushirmang**, ayrimlari idempotent emas. Ilovani ishga tushirish uchun kerak emas.

Playwright testlari uchun `playwright` moduli va Chromium kerak; `PLAYWRIGHT_MODULE` orqali mavjud modul yo‘lini berish mumkin.
