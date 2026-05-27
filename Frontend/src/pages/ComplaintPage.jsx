import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Sparkles, MapPin, Tag, AlignLeft,
  Flame, Send, Loader2, Bot, Camera, Mic, User,
  RefreshCw, ChevronRight, X, CheckCircle
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { NarrowContainer } from '../components/layout/PageContainer';
import { Card, SectionHeader, PageHeader, StatusBadge } from '../components/ui';
import FormField from '../components/forms/FormField';
import RadioGroup from '../components/forms/RadioGroup';
import { complaintService } from '../services/complaintService';

const issueTypes = [
  'Pothole', 'Road Damage', 'Waterlogging', 'Broken Divider',
  'Missing Markings', 'Poor Lighting', 'Debris', 'Encroachment', 'Other',
];

const severityOptions = [
  { value: 'low', label: 'Low', color: 'oklch(var(--color-success))', desc: 'Minor' },
  { value: 'medium', label: 'Medium', color: 'oklch(var(--color-info))', desc: 'Noticeable' },
  { value: 'high', label: 'High', color: 'oklch(var(--color-warning))', desc: 'Safety Risk' },
];

function ManualForm({ prefillRoad }) {
  const { currentUser, token, addComplaint, fetchComplaints, setNotification } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    roadName: prefillRoad ? prefillRoad.name : '',
    landmark: prefillRoad ? prefillRoad.from : '',
    issueType: '',
    description: '',
    severity: '',
  });
  const [locationData, setLocationData] = useState({
    lat: prefillRoad?.path?.[0]?.lat || null,
    lng: prefillRoad?.path?.[0]?.lng || null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!prefillRoad && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
          setLocationData({ lat: 19.0760, lng: 72.8777 }); // Fallback to Mumbai center
        }
      );
    } else if (!prefillRoad) {
      setLocationData({ lat: 19.0760, lng: 72.8777 });
    }
  }, [prefillRoad]);

  const validate = () => {
    const e = {};
    if (!form.roadName.trim()) e.roadName = 'Required';
    if (!form.landmark.trim()) e.landmark = 'Required';
    if (!form.issueType) e.issueType = 'Required';
    if (!form.severity) e.severity = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!currentUser || !currentUser.uid) {
      setNotification({ type: 'error', message: 'You must be logged in to submit a report.' });
      return;
    }
    setLoading(true);
    try {
      const ticketId = `c-${Date.now()}`;
      const payload = {
        ticket_id: ticketId,
        road_name: form.roadName,
        issue_type: form.issueType,
        description: form.description || "No description provided.",
        severity: form.severity.charAt(0).toUpperCase() + form.severity.slice(1),
        location: `${form.roadName}, ${form.landmark}`,
        lat: locationData.lat || 19.0760,
        lng: locationData.lng || 72.8777,
        authority: prefillRoad?.authority || "BMC",
        user: {
          uid: currentUser.uid,
          userId: currentUser.uid,
          name: currentUser.name || "Unknown",
          username: currentUser.name || "Unknown",
          email: currentUser.email || "Unknown"
        }
      };

      const webhookUrl = import.meta.env.VITE_MANUAL_COMPLAINT_WEBHOOK_URL;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to submit to webhook");

      // Save to Firebase via Backend
      await complaintService.createComplaint({
        ticketId: ticketId,
        roadName: form.roadName || payload.location.split(',')[0],
        description: payload.description,
        location: payload.location,
        issueType: payload.issue_type,
        severity: form.severity,
        status: 'pending',
        source: 'manual',
        lat: locationData.lat || 19.0760,
        lng: locationData.lng || 72.8777,
        city: 'Mumbai'
      }, token);
      
      // Refetch complaints from backend
      await fetchComplaints();

      setNotification({ type: 'success', message: 'Report submitted successfully.' });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to submit report. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-bg-surface rounded-2xl border border-border-subtle p-8 shadow-sm space-y-5" style={{ padding: '32px' }}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Road Name" error={errors.roadName}>
            <input
              type="text"
              placeholder="Select a road"
              value={form.roadName}
              onChange={(e) => setForm({ ...form, roadName: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none focus:ring-4 focus:ring-primary/5
                ${errors.roadName ? 'border-danger/30 bg-danger/5' : 'border-border-subtle bg-bg-base focus:border-primary placeholder:text-slate-400'}`}
            />
          </FormField>

          <FormField label="Specific Location/Landmark" error={errors.landmark}>
            <input
              type="text"
              placeholder="e.g. Near Metro Station"
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none focus:ring-4 focus:ring-primary/5
                ${errors.landmark ? 'border-danger/30 bg-danger/5' : 'border-border-subtle bg-bg-base focus:border-primary placeholder:text-slate-400'}`}
            />
          </FormField>
        </div>

        <FormField label="Issue Type" error={errors.issueType}>
          <div className="flex flex-wrap gap-2">
            {issueTypes.map((type) => (
              <button key={type} type="button"
                onClick={() => setForm({ ...form, issueType: type })}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all
                  ${form.issueType === type
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-bg-surface border-border-subtle text-text-muted hover:border-primary/30 hover:text-text-main'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Severity" error={errors.severity}>
          <RadioGroup
            options={severityOptions}
            value={form.severity}
            onChange={(val) => setForm({ ...form, severity: val })}
          />
        </FormField>

        <FormField label="Description (Optional)" error={errors.description}>
          <textarea
            rows={4}
            placeholder="Provide any additional details..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none resize-none focus:ring-4 focus:ring-primary/5
              ${errors.description ? 'border-danger/30 bg-danger/5' : 'border-border-subtle bg-bg-base focus:border-primary placeholder:text-slate-400'}`}
          />
        </FormField>



        <div className="flex justify-center">
          <button type="submit" disabled={loading}
            className="w-fit px-4 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-3 shadow-md shadow-primary/20 transition-all bg-primary hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ComplaintPage() {
  const location = useLocation();
  const prefillRoad = location.state?.road ?? null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center pt-[20px] pb-12">
      <NarrowContainer className="!max-w-4xl w-full">
        <PageHeader
          title="File a Complaint"
          subtitle="Report road conditions to local authorities."
          className="!mb-[20px]"
        />

        <ManualForm prefillRoad={prefillRoad} />

        <div className="pt-4 text-center">
          <div className="flex items-center justify-center gap-4 opacity-40 grayscale filter">
            <h2 className="text-lg font-bold text-slate-600">RoadWatch</h2>
          </div>
          <p className="text-[10px] font-medium text-text-muted mt-2">
            Municipal Infrastructure Safety Standard • Ver 4.0
          </p>
        </div>
      </NarrowContainer>
    </div>
  );
}
