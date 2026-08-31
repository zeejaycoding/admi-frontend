import React, { useState, useEffect, useRef } from "react";
import { Calendar, MapPin } from "lucide-react";
import { API_BASE_URL } from "../../constants/api";

const EventsTicker = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
      fetch(`${API_BASE_URL}/events?size=50&includeInactive=true&sortBy=eventDate&sortDirection=asc`)
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled && res.success) {
          setEvents(res.data?.content || []);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => { cancelled = true; };
  }, []);

  if (error || events.length === 0) return null;

  const baseOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  const img = (url) => url?.startsWith("/") ? `${baseOrigin}${url}` : url;

  const items = events.map((e) => ({
    label: e.title,
    date: e.eventDate || e.date,
    location: e.location,
    thumb: e.thumbnailUrl,
  }));

  const tickerContent = [...items, ...items];

  return (
    <div className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 border-y border-primary-600/40 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-yellow-400 text-primary-900 font-bold text-sm px-4 py-3 z-10 flex items-center gap-2">
          <Calendar size={14} />
          EVENTS
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div
            ref={scrollRef}
            className="flex whitespace-nowrap animate-marquee"
            style={{ animationDuration: `${Math.max(20, tickerContent.length * 4)}s` }}
          >
            {tickerContent.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-white text-sm border-r border-primary-600/30">
                {item.thumb && (
                  <img
                    src={img(item.thumb)}
                    alt=""
                    className="w-9 h-9 rounded-md object-cover flex-shrink-0 border border-primary-500/40"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
                <span className="font-semibold truncate max-w-[180px]">{item.label}</span>
                {item.date && (
                  <span className="text-yellow-300 text-xs flex items-center gap-1 whitespace-nowrap">
                    <Calendar size={10} />{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
                {item.location && (
                  <span className="text-primary-200 text-xs flex items-center gap-1 whitespace-nowrap">
                    <MapPin size={10} />{item.location}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsTicker;
