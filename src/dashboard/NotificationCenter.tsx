import React, { useState } from "react";

interface DashNotif {
  id: number;
  type: "order" | "review" | "system" | "admin" | "cert";
  title: string;
  body: string;
  time: string;
  read: boolean;
  urgent?: boolean;
  cta?: string;
}

const ALL_NOTIFS: DashNotif[] = [
  { id: 1, type: "order", title: "신규 주문 #HMK-8851", body: "김민수 고객 · ₩49,500 · 할랄 갈비탕 외 2개", time: "방금", read: false, urgent: true, cta: "주문 보기" },
  { id: 2, type: "order", title: "신규 주문 #HMK-8850", body: "Ahmed K. 고객 · ₩38,000 · 케밥 플래터 2개", time: "2분 전", read: false, urgent: true, cta: "주문 보기" },
  { id: 3, type: "review", title: "새 리뷰 등록", body: "이*영 고객이 5★ 리뷰를 남겼습니다. '무슬림 친구와 함께 주문했는데...'", time: "15분 전", read: false, cta: "답변하기" },
  { id: 4, type: "order", title: "주문 취소 #HMK-8842", body: "나*희 고객이 주문을 취소했습니다. 사유: 배달 지연", time: "42분 전", read: false },
  { id: 5, type: "system", title: "평균 조리 시간 초과", body: "오늘 평균 조리 시간 28분 · 목표 20분 초과 중", time: "1시간 전", read: true, cta: "주문 보기" },
  { id: 6, type: "cert", title: "할랄 인증 만료 51일 전", body: "KMF 인증 (KMF-2024-08847) 2025년 1월 14일 만료 예정. 갱신을 준비하세요.", time: "2시간 전", read: true, cta: "인증 관리", urgent: false },
  { id: 7, type: "review", title: "새 리뷰 등록", body: "나*희 고객이 4★ 리뷰를 남겼습니다. '전반적으로 맛있었지만 배달이...'", time: "3시간 전", read: true, cta: "답변하기" },
  { id: 8, type: "admin", title: "HalalMap Korea 업데이트 v2.4", body: "새 기능: 그룹 주문 지원, 다국어 메뉴 자동 번역 개선, 성능 최적화", time: "어제", read: true },
  { id: 9, type: "system", title: "주말 피크타임 알림", body: "토요일 12시~14시 주문 폭증 예상. 조리 인력 배치를 준비하세요.", time: "어제", read: true },
  { id: 10, type: "order", title: "월간 정산 완료", body: "11월 3주차 정산이 완료되었습니다. 입금 예정: ₩4,284,500", time: "3일 전", read: true, cta: "내역 확인" },
];

const TYPE_CONFIG = {
  order:  { label: "주문",   color: "#1D4ED8", bg: "#EFF6FF", icon: "🛵" },
  review: { label: "리뷰",   color: "#D97706", bg: "#FFFBEB", icon: "⭐" },
  system: { label: "시스템", color: "#7C3AED", bg: "#F5F3FF", icon: "⚙️" },
  admin:  { label: "공지",   color: "var(--green)", bg: "var(--green-light)", icon: "📢" },
  cert:   { label: "인증",   color: "var(--danger)", bg: "#FEF2F2", icon: "🏅" },
};

type NotifType = DashNotif["type"];
const FILTERS: { id: NotifType | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "order", label: "주문" },
  { id: "review", label: "리뷰" },
  { id: "system", label: "시스템" },
  { id: "admin", label: "공지" },
  { id: "cert", label: "인증" },
];

export const NotificationCenter = ({ onNav }: { onNav: (s: string) => void }) => {
  const [notifs, setNotifs] = useState(ALL_NOTIFS);
  const [filter, setFilter] = useState<NotifType | "all">("all");

  const markRead = (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = filter === "all" ? notifs : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;
  const urgentNotifs = notifs.filter(n => n.urgent && !n.read);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Urgent banner */}
      {urgentNotifs.length > 0 && (
        <div className="flex items-center gap-3 px-6 py-3.5 flex-shrink-0" style={{ backgroundColor: "#EFF6FF", borderBottom: "2px solid #BFDBFE" }}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] animate-pulse" />
            </div>
            <p className="font-bold text-sm" style={{ color: "#1D4ED8" }}>
              🛵 신규 주문 {urgentNotifs.length}건이 수락을 기다리고 있습니다!
            </p>
          </div>
          <button onClick={() => onNav("order-board")}
            className="ml-auto px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1D4ED8" }}>
            주문 보드로 이동 →
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-3.5 border-b border-[var(--border)] bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-sm text-[#1A1A18]">알림 센터</h2>
          {unreadCount > 0 && (
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full text-white tabular-nums" style={{ backgroundColor: "var(--danger)" }}>
              {unreadCount}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTERS.map(f => {
            const count = f.id === "all" ? notifs.filter(n => !n.read).length : notifs.filter(n => n.type === f.id && !n.read).length;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: filter === f.id ? "var(--green)" : "transparent",
                  color: filter === f.id ? "white" : "var(--muted)",
                }}>
                {f.label}
                {count > 0 && (
                  <span className="font-mono text-[10px] font-bold px-1 rounded-full"
                    style={{ backgroundColor: filter === f.id ? "rgba(255,255,255,0.3)" : "var(--green-light)", color: filter === f.id ? "white" : "var(--green)" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button onClick={markAllRead} className="ml-auto text-xs font-semibold hover:underline" style={{ color: "var(--green)" }}>
          모두 읽음으로 표시
        </button>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-[var(--muted)]">
            <span className="text-3xl mb-2">🔔</span>
            <p className="text-sm font-medium">알림이 없습니다</p>
          </div>
        )}

        <div className="divide-y divide-[var(--border)]">
          {filtered.map(notif => {
            const typeCfg = TYPE_CONFIG[notif.type];
            return (
              <div key={notif.id}
                className="flex items-start gap-4 px-6 py-4 transition-colors cursor-pointer hover:bg-[var(--cream)]"
                style={{ backgroundColor: notif.read ? "white" : notif.urgent ? "#F0F7FF" : "#FDFCFB" }}
                onClick={() => markRead(notif.id)}>

                {/* Unread dot */}
                <div className="w-1.5 flex-shrink-0 mt-2">
                  {!notif.read && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: notif.urgent ? "#3B82F6" : "var(--green)" }} />}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: typeCfg.bg }}>
                  {typeCfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        {notif.urgent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white animate-pulse" style={{ backgroundColor: "#3B82F6" }}>긴급</span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: typeCfg.bg, color: typeCfg.color }}>
                          {typeCfg.label}
                        </span>
                      </div>
                      <p className={`text-sm leading-snug ${notif.read ? "text-[#1A1A18]" : "font-bold text-[#1A1A18]"}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{notif.body}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[11px] text-[var(--muted)] tabular-nums whitespace-nowrap">{notif.time}</p>
                    </div>
                  </div>

                  {notif.cta && (
                    <button
                      onClick={e => { e.stopPropagation(); markRead(notif.id); if (notif.cta === "주문 보기") onNav("order-board"); }}
                      className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                      style={{ backgroundColor: typeCfg.bg, color: typeCfg.color }}>
                      {notif.cta} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
