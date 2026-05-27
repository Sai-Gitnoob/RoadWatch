import React, { useState, useCallback, useMemo, useRef, Fragment } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, CheckCircle, Clock, MapPin, ChevronRight, Navigation2, Layers } from 'lucide-react';
import roads from '../data/roads';
import useAppStore from '../store/useAppStore';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, SectionHeader } from '../components/ui';
import RippleMarker from '../components/map/RippleMarker';

const MUMBAI_CENTER = { lat: 19.0760, lng: 72.8777 };

const mapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d8e8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#d6d6d6' }] },
];

const DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

// Helper to determine severity color metadata based on complaints
const getSeverity = (complaints) => {
  if (complaints === null || complaints === undefined || isNaN(complaints) || complaints === 0) {
    return {
      label: "Good Condition",
      hex: "#64748b",
      bgColor: "rgba(100, 116, 139, 0.15)",
      textColor: "#64748b",
      icon: <CheckCircle size={14} className="text-slate-500" />
    };
  }
  if (complaints <= 4) {
    return {
      label: "Good Condition",
      hex: "#22c55e",
      bgColor: "rgba(34, 197, 94, 0.15)",
      textColor: "#22c55e",
      icon: <CheckCircle size={14} className="text-success" />
    };
  }
  if (complaints <= 8) {
    return {
      label: "Warning Condition",
      hex: "#eab308",
      bgColor: "rgba(234, 179, 8, 0.15)",
      textColor: "#eab308",
      icon: <Clock size={14} className="text-warning" />
    };
  }
  return {
    label: "Critical Condition",
    hex: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.15)",
    textColor: "#ef4444",
    icon: <AlertTriangle size={14} className="text-danger" />
  };
};

function BottomSheet({ road, onClose, onRaiseComplaint, isDark }) {
  if (!road) return null;

  const cfg = getSeverity(road.complaints);
  const areaParts = road.area ? road.area.split(" to ") : [road.area || "Mumbai Area", ""];
  const from = areaParts[0] || "Mumbai Area";
  const to = areaParts[1] || "";

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl p-6 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] bg-bg-surface/80 backdrop-blur-2xl border-t border-border-subtle max-h-[85vh] overflow-y-auto"
    >
      <div className="w-12 h-1.5 rounded-full bg-slate-300/50 mx-auto mb-6" />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              style={{ background: cfg.bgColor, color: cfg.textColor, border: `1px solid ${cfg.hex}30` }}>
              {cfg.icon}
              {cfg.label}
            </div>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{road.authority}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-text-main tracking-tight leading-tight">{road.name}</h2>
          <div className="flex items-center gap-2 mt-2 text-text-muted text-sm font-semibold">
            <MapPin size={14} className="text-primary" />
            <span>{from}</span>
            {to && <ChevronRight size={14} className="text-slate-300" />}
            {to && <span>{to}</span>}
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 rounded-full bg-slate-100/50 hover:bg-slate-200/50 text-text-muted transition-colors backdrop-blur-sm">
          <X size={20} />
        </button>
      </div>

      {/* Bottom Sheet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Left Column: ROADWATCH UI / Complaint stats + Raise Complaint */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-bg-base/50 backdrop-blur-md rounded-2xl p-5 border border-border-subtle shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle size={14}/> Complaint Stats</span>
                <span className="text-xl font-bold text-text-main">{road.complaints} <span className="text-sm font-semibold text-text-muted">reports</span></span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${Math.min((road.complaints / 12) * 100, 100)}%` }}
                  className="h-full rounded-full" 
                  style={{ background: cfg.hex }} 
                />
              </div>
            </div>

            <div className="bg-bg-base/50 backdrop-blur-md rounded-2xl p-5 border border-border-subtle shadow-sm flex flex-col justify-center">
               <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1"><CheckCircle size={14}/> Repair Details</span>
                      <span className="text-sm font-bold text-text-main">Last Repaired</span>
                      <span className="text-xs font-semibold text-text-muted">{road.lastRepair || "Ongoing"}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock size={20} className="text-primary" />
                  </div>
               </div>
            </div>
          </div>

          <button
            onClick={onRaiseComplaint}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <AlertTriangle size={18} />
            Raise Complaint
          </button>
        </div>

        {/* Right Column: "Read More" Box for extra details */}
        <div className="md:col-span-5">
          <div className="bg-bg-base/80 backdrop-blur-md rounded-2xl p-5 border border-border-subtle shadow-md h-full flex flex-col">
            <h3 className="text-xs font-extrabold text-text-main uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-border-subtle pb-2">
              📋 Infrastructure specifications
            </h3>
            
            <div className="space-y-4 flex-1 text-xs overflow-y-auto max-h-[250px] scrollbar-hide pr-1">
              {road.complaintsContext && (
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/15 mb-2">
                  <p className="font-semibold text-primary mb-1">Context</p>
                  <p className="text-text-muted leading-relaxed font-medium">{road.complaintsContext}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Category</span>
                  <p className="font-bold text-text-main mt-0.5 capitalize">{road.category}</p>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Contractor</span>
                  <p className="font-bold text-text-main mt-0.5 truncate" title={road.contractor}>{road.contractor || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border-subtle/50 pt-2">
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">First Budget</span>
                  <p className="font-bold text-text-main mt-0.5">{road.firstBudgetSanctionedInr || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Latest Budget</span>
                  <p className="font-bold text-text-main mt-0.5">{road.latestBudgetSanctionedInr || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border-subtle/50 pt-2">
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">First Spent</span>
                  <p className="font-bold text-text-main mt-0.5">{road.firstSpent || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Latest Spent</span>
                  <p className="font-bold text-text-main mt-0.5">{road.latestSpent || "N/A"}</p>
                </div>
              </div>

              <div className="border-t border-border-subtle/50 pt-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Citation Source</span>
                <p className="font-bold text-text-main mt-0.5 truncate">{road.citation || "N/A"}</p>
              </div>

              {road.grievanceUrl && (
                <div className="border-t border-border-subtle/50 pt-2">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Verification Link</span>
                  <div className="mt-1">
                    <a 
                      href={road.grievanceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline font-semibold break-all"
                    >
                      Official Grievance Portal →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, selectedRoad, setSelectedRoad, clearSelectedRoad } = useAppStore();
  const mapRef = useRef(null);

  const isDark = darkMode;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isPlaceholder = !apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: isPlaceholder ? '' : apiKey,
  });

  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  const handleRaiseComplaint = () => {
    if (!selectedRoad) return;
    const areaParts = selectedRoad.area ? selectedRoad.area.split(" to ") : [selectedRoad.area || "Mumbai Area", ""];
    const prefillData = {
      ...selectedRoad,
      from: areaParts[0] || "Mumbai Area",
      to: areaParts[1] || ""
    };
    navigate('/complaint', { state: { road: prefillData } });
    clearSelectedRoad();
  };

  /* ── Search state ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  /* ── Filtered suggestions from dataset ── */
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return roads.filter(
      (road) =>
        road.name.toLowerCase().includes(q) ||
        (road.area && road.area.toLowerCase().includes(q))
    ).slice(0, 8); // cap at 8 results
  }, [searchQuery]);

  const handleRoadSelect = useCallback((road) => {
    setSelectedRoad(road);
    setSearchQuery("");
    setShowSuggestions(false);

    // Pan & zoom to the road's midpoint
    if (mapRef.current) {
      const midpoint = road.path[Math.floor(road.path.length / 2)];
      mapRef.current.panTo(midpoint);
      mapRef.current.setZoom(15);
    }
  }, [setSelectedRoad]);

  const handleRoadClick = useCallback((road) => {
    handleRoadSelect(road);
  }, [handleRoadSelect]);

  const handleCloseSheet = useCallback(() => {
    clearSelectedRoad();
    // Reset zoom after closing
    if (mapRef.current) {
      mapRef.current.panTo(MUMBAI_CENTER);
      mapRef.current.setZoom(12);
    }
  }, [clearSelectedRoad]);

  /* ── Theme-dependent classes ── */
  const glass = isDark ? "glass-dark" : "glass-light";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      styles: isDark ? DARK_STYLE : mapStyles,
      zoomControl: false,
      clickableIcons: false,
      gestureHandling: "greedy",
    }),
    [isDark]
  );

  if (loadError) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900 px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-red-400 font-bold text-sm uppercase tracking-widest mb-2">Map failed to load</p>
          <p className="text-slate-400 text-xs">Check your API key in <code className="text-amber-400">.env</code></p>
          <p className="text-slate-500 text-[10px] mt-2 break-all">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (isPlaceholder) {
    return (
      <PageContainer className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-2xl w-full">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm bg-primary/5 border border-primary/10">
            <Navigation2 size={36} className="text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-text-main mb-3 tracking-tight">Interactive Map</h1>
          <p className="text-text-muted font-medium max-w-lg mx-auto leading-relaxed mb-8">
            Connect your Google Maps API key to enable live road monitoring and infrastructure analysis.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-10 text-[11px] font-semibold text-primary uppercase tracking-wider">
            <Layers size={14} />
            Setup Required: VITE_GOOGLE_MAPS_API_KEY
          </div>

          <Card className="p-0 overflow-hidden text-left shadow-md" hover={false}>
            <div className="px-6 py-4 border-b border-border-subtle bg-slate-50/50 backdrop-blur-sm flex items-center justify-between dark:bg-slate-800/50">
              <SectionHeader title="Infrastructure Inventory" className="mb-0" />
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{roads.length} Segments Identified</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-border-subtle scrollbar-hide">
              {roads.map((road) => {
                const cfg = getSeverity(road.complaints);
                return (
                  <div key={road.id} className="group flex items-center justify-between py-4 px-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-default">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors truncate">{road.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin size={10} className="text-text-muted opacity-60" />
                        <p className="text-[10px] font-medium text-text-muted truncate">{road.area || "Mumbai"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-1 rounded-full text-[10px] font-bold border transition-transform group-hover:scale-105"
                        style={{ background: cfg.bgColor, color: cfg.hex, borderColor: `${cfg.hex}20` }}>
                        {cfg.label} ({road.complaints})
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Loading Infrastructure Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="map-page" className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-bg-base">
      
      {/* ── Google Map ── */}
      <GoogleMap
        id="google-map"
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={MUMBAI_CENTER}
        zoom={12}
        options={mapOptions}
        onLoad={onMapLoad}
        onClick={clearSelectedRoad}
      >
        {/* Render ONLY ripple markers at the midpoint of each road alignment, no polylines or dotted lines drawn */}
        {roads.map((road) => {
          const midpoint = road.path[Math.floor(road.path.length / 2)];
          return (
            <RippleMarker
              key={`ripple-${road.id}`}
              lat={midpoint.lat}
              lng={midpoint.lng}
              complaints={road.complaints}
              isHighlighted={selectedRoad?.id === road.id}
              onClick={() => handleRoadClick(road)}
            />
          );
        })}
      </GoogleMap>

      {/* ── Search Bar Overlay ── */}
      <div className="absolute top-0 left-0 right-0 md:right-auto z-30 px-4 pt-4 md:pl-6 md:pr-0 pointer-events-none w-full md:w-[420px]">
        <div className="pointer-events-auto relative w-full max-w-md mx-auto md:max-w-none md:mx-0">
          <div className={`${glass} rounded-2xl shadow-lg border border-white/5 flex items-center px-4 gap-3 transition-all ${showSuggestions && suggestions.length ? "rounded-b-none" : ""}`}>
            {/* Search Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="2.5" className="shrink-0">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Search roads, bridges, links..."
              className={`flex-1 bg-transparent py-3.5 text-sm font-semibold outline-none placeholder:font-medium ${isDark ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"}`}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                  searchInputRef.current?.focus();
                }}
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ${isDark ? "bg-white/10 active:bg-white/20" : "bg-slate-200 active:bg-slate-300"}`}
                aria-label="Clear search"
              >
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke={isDark ? "white" : "#334155"} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`${glass} rounded-b-2xl border border-t-0 border-white/5 shadow-2xl overflow-hidden`}>
              <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                {suggestions.map((road) => {
                  const catLabel =
                    road.category === "bridge"
                      ? "Bridge"
                      : road.category === "link"
                      ? "Link"
                      : "Road";
                  return (
                    <button
                      key={road.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleRoadSelect(road)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${isDark ? "hover:bg-white/5 active:bg-white/10" : "hover:bg-slate-100 active:bg-slate-200"}`}
                    >
                      {/* Category icon */}
                      <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${isDark ? "bg-cyan-500/15 text-cyan-400" : "bg-cyan-50 text-cyan-600"}`}>
                        {catLabel === "Bridge" ? "⌒" : catLabel === "Link" ? "┈" : "─"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                          {road.name}
                        </p>
                        <p className={`text-[10px] font-medium truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {road.area || "Mumbai"} · {catLabel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No results message */}
          {showSuggestions && searchQuery.trim() && suggestions.length === 0 && (
            <div className={`${glass} rounded-b-2xl border border-t-0 border-white/5 shadow-2xl px-4 py-4`}>
              <p className={`text-xs font-semibold text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                No roads found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile/Desktop Controls Overlay (Theme toggle + Legend) ── */}
      <div className="absolute top-20 left-0 right-0 md:top-auto md:bottom-6 md:left-6 md:right-auto z-20 px-4 md:px-0 pt-2 pb-4 md:py-0 pointer-events-none w-full md:w-auto">
        <div className="flex items-center justify-between md:flex-col md:items-start md:gap-3 pointer-events-auto">
          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={toggleDarkMode}
            className={`${glass} rounded-2xl w-12 h-12 flex items-center justify-center transition-all active:scale-90 shadow-lg`}
            aria-label={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Simplified Legend Overlay explaining ONLY complaint severity color meanings */}
          <div className={`${glass} rounded-2xl px-3.5 py-2.5 flex flex-col gap-1.5 shadow-lg max-w-[190px] border border-white/5`}>
            <p className={`text-[9px] font-extrabold uppercase tracking-wider mb-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Complaint Index
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-[0_0_6px_rgba(100,116,139,0.6)]" />
                <span className={`text-[9px] font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Grey = 0 complaints</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                <span className={`text-[9px] font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Green = 1–4 complaints</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]" />
                <span className={`text-[9px] font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Yellow = 4–8 complaints</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                <span className={`text-[9px] font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Red = 9–12+ complaints</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── API key warning ── */}
      {(!apiKey || apiKey.length < 10) && (
        <div className={`absolute bottom-24 left-6 right-6 z-30 ${glass} rounded-2xl px-6 py-4 text-center border-amber-500/50 border animate-bounce pointer-events-none`}>
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">⚠ API Key Missing</p>
          <p className={`${textSecondary} text-[10px]`}>Add VITE_GOOGLE_MAPS_API_KEY to .env</p>
        </div>
      )}

      {/* ── Bottom Sheet ── */}
      <AnimatePresence>
        {selectedRoad && (
          <BottomSheet 
            road={selectedRoad} 
            onClose={handleCloseSheet} 
            onRaiseComplaint={handleRaiseComplaint}
            isDark={isDark} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
