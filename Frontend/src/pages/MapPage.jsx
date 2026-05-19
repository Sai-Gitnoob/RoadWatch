import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, CheckCircle, Clock, MapPin, ChevronRight, Navigation2, Layers } from 'lucide-react';
import { mumbaiRoads, conditionConfig, mumbaiCenter } from '../data/mumbaiRoads';
import useAppStore from '../store/useAppStore';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, SectionHeader, PageHeader } from '../components/ui';

const mapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d8e8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#d6d6d6' }] },
];

const mapContainerStyle = { width: '100%', height: '100%' };
const options = { styles: mapStyles, disableDefaultUI: true, zoomControl: false, clickableIcons: false };

const conditionIcons = {
  good:     <CheckCircle size={14} className="text-success" />,
  warning:  <Clock size={14} className="text-warning" />,
  critical: <AlertTriangle size={14} className="text-danger" />,
};

function Legend() {
  return (
    <div className="absolute top-4 right-4 z-10 rounded-xl p-4 shadow-md bg-white/90 backdrop-blur-md border border-border-subtle">
      <SectionHeader title="Road Condition" className="mb-3" />
      {Object.entries(conditionConfig).map(([key, cfg]) => (
        <div key={key} className="flex items-center gap-3 mb-2 last:mb-0">
          <div className="w-6 h-1.5 rounded-full" style={{ background: cfg.hex }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{cfg.label}</span>
        </div>
      ))}
    </div>
  );
}



function BottomSheet({ road, onClose, onRaiseComplaint }) {
  const cfg = conditionConfig[road.condition];
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl p-6 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] bg-bg-surface/80 backdrop-blur-2xl border-t border-border-subtle max-h-[85vh] overflow-y-auto"
    >
      <div className="w-12 h-1.5 rounded-full bg-slate-300/50 mx-auto mb-6" />

      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              style={{ background: cfg.bgColor, color: cfg.textColor, border: `1px solid ${cfg.hex}30` }}>
              {conditionIcons[road.condition]}
              {cfg.label}
            </div>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{road.authority}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-text-main tracking-tight">{road.name}</h2>
          <div className="flex items-center gap-2 mt-2 text-text-muted text-sm font-semibold">
            <MapPin size={14} className="text-primary" />
            <span>{road.from}</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span>{road.to}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 rounded-full bg-slate-100/50 hover:bg-slate-200/50 text-text-muted transition-colors backdrop-blur-sm">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-bg-base/50 backdrop-blur-md rounded-2xl p-5 border border-border-subtle shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle size={14}/> Complaint Stats</span>
            <span className="text-xl font-bold text-text-main">{road.complaints} <span className="text-sm font-semibold text-text-muted">reports</span></span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${Math.min((road.complaints / 100) * 100, 100)}%` }}
              className="h-full rounded-full" 
              style={{ background: cfg.hex }} 
            />
          </div>
        </div>

        <div className="bg-bg-base/50 backdrop-blur-md rounded-2xl p-5 border border-border-subtle shadow-sm flex flex-col justify-center">
           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1"><CheckCircle size={14}/> Repair Details</span>
                  <span className="text-sm font-bold text-text-main">Last Inspected</span>
                  <span className="text-xs font-semibold text-text-muted">{new Date(road.lastInspected).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
    </motion.div>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const { selectedRoad, setSelectedRoad, clearSelectedRoad } = useAppStore();
  const mapRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isPlaceholder = !apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: isPlaceholder ? '' : apiKey,
  });

  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  const handleRaiseComplaint = () => {
    navigate('/complaint', { state: { road: selectedRoad } });
    clearSelectedRoad();
  };

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
            <div className="px-6 py-4 border-b border-border-subtle bg-slate-50/50 backdrop-blur-sm flex items-center justify-between">
              <SectionHeader title="Infrastructure Inventory" className="mb-0" />
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{mumbaiRoads.length} Segments Identified</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-border-subtle scrollbar-hide">
              {mumbaiRoads.map((road) => {
                const cfg = conditionConfig[road.condition];
                return (
                  <div key={road.id} className="group flex items-center justify-between py-4 px-6 hover:bg-slate-50 transition-all cursor-default">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors truncate">{road.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin size={10} className="text-text-muted opacity-60" />
                        <p className="text-[10px] font-medium text-text-muted truncate">{road.from} → {road.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-1 rounded-full text-[10px] font-bold border transition-transform group-hover:scale-105"
                        style={{ background: `${cfg.hex}10`, color: cfg.hex, borderColor: `${cfg.hex}20` }}>
                        Score {road.score}
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
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden bg-bg-base">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mumbaiCenter}
        zoom={12}
        options={options}
        onLoad={onMapLoad}
        onClick={clearSelectedRoad}
      >
        {mumbaiRoads.map((road) => {
          const cfg = conditionConfig[road.condition];
          const isSelected = selectedRoad?.id === road.id;
          return (
            <React.Fragment key={road.id}>
              {/* Glow effect */}
              <Polyline
                path={road.path}
                options={{
                  strokeColor: cfg.hex,
                  strokeOpacity: isSelected ? 0.4 : 0.15,
                  strokeWeight: isSelected ? 16 : 10,
                  strokeLineCap: 'round',
                  strokeLineJoin: 'round',
                  zIndex: isSelected ? 9 : 0,
                  clickable: false,
                }}
              />
              {/* Main line */}
              <Polyline
                path={road.path}
                options={{
                  strokeColor: cfg.hex,
                  strokeOpacity: isSelected ? 1 : 0.8,
                  strokeWeight: isSelected ? 6 : 4,
                  strokeLineCap: 'round',
                  strokeLineJoin: 'round',
                  zIndex: isSelected ? 10 : 1,
                }}
                onClick={() => setSelectedRoad(road)}
              />
            </React.Fragment>
          );
        })}

        {selectedRoad && (
          <Marker
            position={selectedRoad.path[Math.floor(selectedRoad.path.length / 2)]}
            options={{ icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: 'var(--color-primary)', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 } }}
          />
        )}
      </GoogleMap>


      <Legend />

      <AnimatePresence>
        {selectedRoad && (
          <BottomSheet
            road={selectedRoad}
            onClose={clearSelectedRoad}
            onRaiseComplaint={handleRaiseComplaint}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
