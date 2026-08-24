import React, { useState } from "react";
import { GeometricPattern, StatusBar, BackButton, HalalBadge, StarRating } from "../components/Shared";

// ── 1. Restaurant Reviews ──────────────────────────────────────────────────────
const ratingCategories = [
  { key: "taste", labelKo: "맛", labelEn: "Taste", score: 4.8 },
  { key: "halal", labelKo: "할랄 신뢰", labelEn: "Halal Trust", score: 4.9 },
  { key: "clean", labelKo: "청결도", labelEn: "Cleanliness", score: 4.6 },
  { key: "service", labelKo: "서비스", labelEn: "Service", score: 4.7 },
];

const reviews = [
  {
    user: "Ahmad M.",
    avatar: "👨‍🦱",
    date: "2024.11.20",
    rating: 5,
    text: "서울에서 이렇게 진한 갈비탕을 먹을 수 있다니 놀랍습니다. 할랄 인증도 확실하고, 돼지고기 냄새 전혀 없어요. 외국인 무슬림에게 강력 추천!",
    photos: ["1498654896293-37c98e7f5fe4", "1569050467447-ce54b3bbc37d"],
    helpful: 42,
    tags: ["할랄 신뢰", "맛있음"],
    verified: true,
  },
  {
    user: "Fatima S.",
    avatar: "👩‍🧕",
    date: "2024.11.15",
    rating: 4,
    text: "직원분들이 영어로도 잘 설명해 주십니다. 메뉴판에 할랄 표시가 명확하게 되어 있어서 좋아요. 다음에도 꼭 오겠습니다.",
    photos: ["1583394293214-b483ffd7e3f7"],
    helpful: 28,
    tags: ["친절한 직원", "할랄 표시 명확"],
    verified: false,
  },
  {
    user: "Muhammad R.",
    avatar: "🧔",
    date: "2024.11.08",
    rating: 5,
    text: "KMF 인증 식당이라 마음 놓고 먹을 수 있었습니다. 갈비탕이 정말 진하고 맛있어요. 가격 대비 양도 충분합니다.",
    photos: [],
    helpful: 19,
    tags: ["가성비 좋음", "KMF 인증"],
    verified: true,
  },
];

const ratingDist = [
  { stars: 5, pct: 68 },
  { stars: 4, pct: 20 },
  { stars: 3, pct: 7 },
  { stars: 2, pct: 3 },
  { stars: 1, pct: 2 },
];

export const ReviewsScreen = () => {
  const [sortBy, setSortBy] = useState("최신순");
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="font-bold text-lg">리뷰</h1>
            <p className="text-xs text-[var(--muted)]">신당 할랄 키친</p>
          </div>
          <button className="text-sm font-bold px-3 py-1.5 rounded-xl text-white" style={{ backgroundColor: "var(--green)" }}>
            리뷰 쓰기
          </button>
        </div>
      </div>

      <div className="flex-1 phone-scroll">
        {/* Summary */}
        <div className="bg-white px-5 py-5">
          <div className="flex gap-6 mb-5">
            {/* Overall */}
            <div className="flex flex-col items-center">
              <p className="font-bold text-5xl text-[#1A1A18]">4.8</p>
              <div className="flex gap-0.5 mt-1.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill={s <= 4 ? "#C4883A" : "#E5E7EB"}>
                    <path d="M7 1l1.6 3.3 3.7.5-2.7 2.6.6 3.6L7 9.3 3.8 11l.6-3.6L1.7 4.8l3.7-.5L7 1z"/>
                  </svg>
                ))}
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">3,241개 리뷰</p>
            </div>

            {/* Distribution */}
            <div className="flex-1 space-y-1.5">
              {ratingDist.map((r) => (
                <div key={r.stars} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)] w-3">{r.stars}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="#C4883A"><path d="M5 1l1.1 2.3 2.6.4-1.9 1.8.4 2.6L5 6.8l-2.2 1.3.4-2.6L1.3 3.7l2.6-.4L5 1z"/></svg>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[var(--cream)]">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.stars >= 4 ? "var(--gold)" : r.stars === 3 ? "#9CA3AF" : "#EF4444" }} />
                  </div>
                  <span className="text-[10px] text-[var(--muted)] w-6">{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Halal-specific categories */}
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-3">카테고리별 평가</p>
          <div className="grid grid-cols-2 gap-2">
            {ratingCategories.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--cream)" }}>
                <div>
                  <p className="text-xs font-bold text-[#1A1A18]">{cat.labelKo}</p>
                  <p className="text-[10px] text-[var(--muted)]">{cat.labelEn}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: cat.key === "halal" ? "var(--green)" : "#1A1A18" }}>{cat.score}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map(s => (
                      <div key={s} className="w-2 h-1 rounded-full" style={{ backgroundColor: s <= Math.round(cat.score) ? (cat.key === "halal" ? "var(--green)" : "var(--gold)") : "var(--border)" }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sort + filter */}
        <div className="flex items-center gap-2 px-4 py-3">
          {["최신순", "추천순", "사진만", "높은 평점"].map((s) => (
            <button key={s} onClick={() => setSortBy(s)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={{
                backgroundColor: sortBy === s ? "var(--green)" : "white",
                color: sortBy === s ? "white" : "var(--muted)",
                borderColor: sortBy === s ? "var(--green)" : "var(--border)",
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        <div className="space-y-3 px-4 pb-6">
          {reviews.map((rev, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              {/* User row */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--cream)] flex items-center justify-center text-xl flex-shrink-0">
                  {rev.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-[#1A1A18]">{rev.user}</p>
                    {rev.verified && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--green)" }}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><path d="M1 3l2 2 4-4"/></svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)]">{rev.date}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill={s <= rev.rating ? "#C4883A" : "#E5E7EB"}>
                      <path d="M6 1l1.2 2.5 2.8.4-2 2 .5 2.7L6 7.3 3.5 8.6l.5-2.7-2-2 2.8-.4L6 1z"/>
                    </svg>
                  ))}
                </div>
              </div>

              {/* Review text */}
              <p className="text-sm text-[#1A1A18] leading-relaxed">{rev.text}</p>

              {/* Photos */}
              {rev.photos.length > 0 && (
                <div className="flex gap-2">
                  {rev.photos.map((id, pi) => (
                    <div key={pi} className="w-20 h-20 rounded-xl overflow-hidden bg-[#E8E6E1]">
                      <img src={`https://images.unsplash.com/photo-${id}?w=120&h=120&fit=crop&auto=format&q=80`} alt="review" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {rev.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}>{tag}</span>
                ))}
              </div>

              {/* Helpful */}
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted)]">도움이 되었나요?</p>
                <button
                  onClick={() => setHelpful(h => ({ ...h, [i]: !h[i] }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
                  style={{
                    borderColor: helpful[i] ? "var(--green)" : "var(--border)",
                    backgroundColor: helpful[i] ? "var(--green-light)" : "white",
                    color: helpful[i] ? "var(--green)" : "var(--muted)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 5V10M4 5L7 2a1 1 0 011 1v1h2a1 1 0 011 1l-.5 4A1 1 0 019.5 10H4M4 5H2a1 1 0 00-1 1v3a1 1 0 001 1h2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  도움됨 {rev.helpful + (helpful[i] ? 1 : 0)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── 2. Community Board ─────────────────────────────────────────────────────────
const posts = [
  {
    user: "Ibrahim K.",
    avatar: "👨‍🦲",
    badge: "베테랑 탐색가",
    badgeColor: "#5B21B6",
    time: "2시간 전",
    category: "레스토랑 발견",
    title: "홍대 근처 숨은 할랄 식당 발견! 🎉",
    body: "홍대입구 2번 출구에서 도보 3분 거리에 파키스탄인이 운영하는 할랄 식당을 찾았습니다. 카라히 치킨이 일품이에요. 아직 앱에 등록이 안 되어 있어서 제보합니다!",
    likes: 87,
    comments: 23,
    image: "1617196034183-421b4040d6fd",
    pinned: true,
  },
  {
    user: "Aisha R.",
    avatar: "👩",
    badge: "할랄 탐정",
    badgeColor: "var(--green)",
    time: "5시간 전",
    category: "식료품 정보",
    title: "이마트 할랄 섹션 업데이트 — 11월 신제품",
    body: "성수점 이마트에 새로운 할랄 제품이 입고되었습니다. 인도네시아산 인도미 할랄 라면, 말레이시아 치킨 소시지 등. 사진으로 확인하세요!",
    likes: 54,
    comments: 11,
    image: "1567620905572-d1d0d6ca9ea0",
    pinned: false,
  },
  {
    user: "Yusuf A.",
    avatar: "🧔‍♂️",
    badge: "신규 회원",
    badgeColor: "#6B7280",
    time: "어제",
    category: "생활 팁",
    title: "한국에서 무슬림으로 살기 — 1년 경험담",
    body: "안녕하세요! 우즈베키스탄에서 온 유수프입니다. 한국에서 무슬림으로 1년 살면서 느낀 점과 꿀팁들을 공유합니다. 이 앱 덕분에 정말 많이 편해졌어요.",
    likes: 312,
    comments: 67,
    image: null,
    pinned: false,
  },
  {
    user: "Nurul H.",
    avatar: "👩‍🧕",
    badge: "검증된 기여자",
    badgeColor: "var(--gold)",
    time: "2일 전",
    category: "모스크 정보",
    title: "부산 해운대 기도실 위치 업데이트 🕌",
    body: "해운대 쇼핑센터 4층에 새로운 기도실이 생겼습니다. 남녀 구역 분리, 우두 시설 완비. 주말에 직접 다녀왔어요.",
    likes: 43,
    comments: 8,
    image: null,
    pinned: false,
  },
];

const categories = ["전체", "레스토랑 발견", "식료품 정보", "모스크 정보", "생활 팁", "할랄 스캔"];

export const CommunityScreen = () => {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-bold text-xl text-[#1A1A18]">커뮤니티</h1>
              <p className="text-xs text-[var(--muted)]">한국 무슬림 할랄 생활 정보</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "var(--green)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>
              글쓰기
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                style={{
                  backgroundColor: activeCategory === c ? "var(--green)" : "white",
                  color: activeCategory === c ? "white" : "var(--muted)",
                  borderColor: activeCategory === c ? "var(--green)" : "var(--border)",
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-3 space-y-3">
        {posts.map((post, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {post.pinned && (
              <div className="px-4 pt-2.5 pb-0 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--gold)"><path d="M6 1l1.1 2.3L10 3.7 8 5.7l.5 3L6 7.5 3.5 8.7 4 5.7 2 3.7l2.9-.4L6 1z"/></svg>
                <span className="text-[10px] font-bold text-[var(--gold)]">고정 게시글</span>
              </div>
            )}
            <div className="p-4 space-y-3">
              {/* User */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[var(--cream)] flex items-center justify-center text-lg flex-shrink-0">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-xs text-[#1A1A18]">{post.user}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: post.badgeColor }}>
                      {post.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--muted)]">{post.time}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}>
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-bold text-sm text-[#1A1A18] mb-1.5">{post.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3">{post.body}</p>
              </div>

              {/* Image */}
              {post.image && (
                <div className="h-36 rounded-xl overflow-hidden bg-[#E8E6E1]">
                  <img src={`https://images.unsplash.com/photo-${post.image}?w=360&h=180&fit=crop&auto=format&q=80`} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-1 border-t border-[var(--border)]">
                <button
                  onClick={() => setLiked(l => ({ ...l, [i]: !l[i] }))}
                  className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  style={{ color: liked[i] ? "var(--danger)" : "var(--muted)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill={liked[i] ? "var(--danger)" : "none"} stroke="currentColor" strokeWidth="1.6">
                    <path d="M7 12S1 8 1 4.5C1 2.5 2.7 1 4.5 1c.9 0 1.8.4 2.5 1C7.7 1.4 8.6 1 9.5 1 11.3 1 13 2.5 13 4.5 13 8 7 12 7 12Z" strokeLinecap="round"/>
                  </svg>
                  {post.likes + (liked[i] ? 1 : 0)}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M1 2.5C1 1.7 1.7 1 2.5 1h9A1.5 1.5 0 0113 2.5v6A1.5 1.5 0 0111.5 10H8L5 13v-3H2.5A1.5 1.5 0 011 8.5v-6z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {post.comments}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] ml-auto">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="11" cy="3" r="1.5"/><circle cx="3" cy="7" r="1.5"/><circle cx="11" cy="11" r="1.5"/>
                    <line x1="9.5" y1="4" x2="4.5" y2="6"/><line x1="9.5" y1="10" x2="4.5" y2="8"/>
                  </svg>
                  공유
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="h-4" />
      </div>
    </div>
  );
};

// ── 3. Share Restaurant / Mosque ───────────────────────────────────────────────
const shareTargets = [
  { icon: "💬", label: "카카오톡", color: "#FEE500", textColor: "#1A1A18" },
  { icon: "📷", label: "인스타그램", color: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", textColor: "white" },
  { icon: "🟢", label: "WhatsApp", color: "#25D366", textColor: "white" },
  { icon: "✉️", label: "이메일", color: "#6B7280", textColor: "white" },
  { icon: "🔗", label: "링크 복사", color: "var(--cream)", textColor: "var(--charcoal)" },
  { icon: "📨", label: "더보기", color: "var(--cream)", textColor: "var(--charcoal)" },
];

export const ShareScreen = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      <div className="bg-white border-b border-[var(--border)] flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-4 pb-3">
          <BackButton />
          <h1 className="font-bold text-lg">공유하기</h1>
        </div>
      </div>

      <div className="flex-1 phone-scroll px-4 py-4 space-y-4">
        {/* Deep link card preview */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">공유 카드 미리보기</p>
          {/* KakaoTalk card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-[var(--border)]">
            <div className="h-40 bg-[#D8D4CC] relative">
              <img src="https://images.unsplash.com/photo-1498654896293-37c98e7f5fe4?w=390&h=180&fit=crop&auto=format&q=80" alt="restaurant" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <HalalBadge variant="certified" />
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--green)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5ZM8 7.5C7.2 7.5 6.5 6.8 6.5 6C6.5 5.2 7.2 4.5 8 4.5C8.8 4.5 9.5 5.2 9.5 6C9.5 6.8 8.8 7.5 8 7.5Z"/>
                </svg>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-base text-[#1A1A18]">신당 할랄 키친</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={4.8} count={3241} />
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">📍 서울 용산구 · 2.3km · ₩2,000 배달비</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "var(--cream)" }}>
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: "var(--green)" }}>
                  <p className="font-arabic text-[10px] font-bold text-white">ح</p>
                </div>
                <p className="text-xs text-[var(--muted)]">HalalMap Korea에서 찾은 할랄 식당</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Stories preview */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">인스타그램 스토리</p>
          <div className="relative h-48 rounded-2xl overflow-hidden shadow-md" style={{ background: "linear-gradient(160deg, var(--green) 0%, #0A3D28 100%)" }}>
            <GeometricPattern color="white" opacity={0.06} />
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div>
                <p className="font-arabic text-2xl font-bold" style={{ color: "var(--gold)" }}>حلال</p>
                <p className="text-white font-bold text-sm mt-1">HalalMap Korea</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3">
                <p className="text-white font-bold text-base">신당 할랄 키친</p>
                <div className="flex items-center gap-2 mt-1">
                  <HalalBadge variant="certified" />
                  <span className="text-white/70 text-xs">⭐ 4.8 · 2.3km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/20" />
                <p className="text-white/50 text-[10px]">halalmap.kr/restaurant/sindang</p>
                <div className="flex-1 h-px bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Share targets grid */}
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-3">앱으로 공유</p>
          <div className="grid grid-cols-3 gap-3">
            {shareTargets.map((t) => (
              <button key={t.label} onClick={t.label === "링크 복사" ? handleCopy : undefined}
                className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-[var(--border)] transition-all active:scale-95">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: t.color, color: t.textColor }}
                >
                  {t.icon}
                </div>
                <p className="text-xs font-semibold text-[#1A1A18]">{t.label === "링크 복사" && copied ? "복사됨! ✓" : t.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Deep link */}
        <div className="bg-white rounded-2xl p-4 border border-[var(--border)] space-y-2">
          <p className="text-xs font-semibold text-[var(--muted)]">직접 링크</p>
          <div className="flex items-center gap-2 bg-[var(--cream)] rounded-xl px-3 py-2.5">
            <p className="flex-1 text-xs text-[#1A1A18] font-mono truncate">halalmap.kr/r/sindang-halal</p>
            <button onClick={handleCopy} className="text-xs font-bold flex-shrink-0" style={{ color: "var(--green)" }}>
              {copied ? "복사됨!" : "복사"}
            </button>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
};
