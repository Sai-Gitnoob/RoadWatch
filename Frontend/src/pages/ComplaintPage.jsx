import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import {
  AlertTriangle, Sparkles, MapPin, Tag, AlignLeft,
  Flame, Send, Loader2, Bot, Camera, Mic, User,
  RefreshCw, ChevronRight, X, CheckCircle
} from 'lucide-react';
import { db } from '../lib/firebase';
import useAppStore from '../store/useAppStore';
import { NarrowContainer } from '../components/layout/PageContainer';
import { Card, SectionHeader, PageHeader, StatusBadge } from '../components/ui';
import FormField from '../components/forms/FormField';
import RadioGroup from '../components/forms/RadioGroup';

const issueTypes = [
  'Pothole', 'Road Damage', 'Waterlogging', 'Broken Divider',
  'Missing Markings', 'Poor Lighting', 'Debris', 'Encroachment', 'Other',
];

const severityOptions = [
  { value: 'low', label: 'Low', color: 'oklch(var(--color-success))', desc: 'Minor' },
  { value: 'medium', label: 'Medium', color: 'oklch(var(--color-info))', desc: 'Noticeable' },
  { value: 'high', label: 'High', color: 'oklch(var(--color-warning))', desc: 'Safety Risk' },
  { value: 'critical', label: 'Critical', color: 'oklch(var(--color-danger))', desc: 'Urgent' },
];

function ManualForm({ prefillRoad }) {
  const { currentUser, addComplaint, setNotification } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    roadName: prefillRoad ? prefillRoad.name : '',
    landmark: prefillRoad ? prefillRoad.from : '',
    issueType: '',
    description: '',
    severity: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    setLoading(true);
    try {
      const payload = {
        ...form,
        location: `${form.roadName}, ${form.landmark}`,
        userId: currentUser?.uid || 'user123',
        status: 'pending',
        createdAt: new Date(),
      };
      await addDoc(collection(db, 'complaints'), payload);
      addComplaint({ id: `c-${Date.now()}`, ...payload });
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

function AIForm({ prefillRoad }) {
  const navigate = useNavigate();
  const { addComplaint, currentUser, setNotification } = useAppStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleUpload = () => {
    setLoading(true);
    // Simulate AI processing and extraction
    setTimeout(() => {
      setExtractedData({
        location: prefillRoad ? `${prefillRoad.name}, ${prefillRoad.from}` : 'Andheri West Link Road',
        issueType: 'Pothole',
        severity: 'high',
        description: 'Large pothole detected in the middle lane, spanning approximately 2 feet in width. High risk for two-wheelers. Immediate repair recommended.',
        confidence: 94
      });
      setStep(2);
      setLoading(false);
    }, 2500);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...extractedData,
        userId: currentUser?.uid || 'anonymous',
        status: 'pending',
        createdAt: new Date(),
        source: 'ai_detection'
      };
      await addDoc(collection(db, 'complaints'), payload);
      addComplaint({ id: `c-${Date.now()}`, ...payload });
      setNotification({ type: 'success', message: 'Smart report submitted successfully.' });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to submit report. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="bg-bg-surface rounded-3xl border border-border-subtle p-8 shadow-sm text-center max-w-xl mx-auto mt-4" style={{ padding: '32px' }}>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-sm">
          <Sparkles className="text-primary" size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-text-main tracking-tight mb-3">AI Complaint Assistant</h2>
        <p className="text-sm font-medium text-text-muted leading-relaxed mb-8 px-4">
          Upload a photo of the road hazard. Our AI will automatically detect the location, road name, issue type, and severity to file an instant report.
        </p>

        <div
          onClick={handleUpload}
          className={`relative overflow-hidden group border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer
            ${loading ? 'border-primary/50 bg-primary/5' : 'border-slate-300 hover:bg-bg-base hover:border-primary/50'}`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin z-10" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-main mb-1">Analyzing Image...</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Extracting geolocation & issue data</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-bg-base flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all shadow-sm">
                <Camera size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-main mb-1">Tap to upload or take photo</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Supports JPG, PNG, HEIC</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface rounded-3xl border border-border-subtle p-8 shadow-sm max-w-xl mx-auto mt-4" style={{ padding: '32px' }}>
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-subtle">
        <div>
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <CheckCircle className="text-success" size={20} /> Analysis Complete
          </h2>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-2">Review extracted information</p>
        </div>
        <div className="px-3 py-1.5 bg-success/10 text-success rounded-full text-[10px] font-bold border border-success/20 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <Sparkles size={12} /> {extractedData?.confidence}% Match
        </div>
      </div>

      <div className="space-y-5 mb-8">
        <div className="bg-bg-base rounded-2xl p-5 border border-border-subtle shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={14} /> Detected Location</p>
          <p className="text-sm font-bold text-text-main">{extractedData?.location}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-base rounded-2xl p-5 border border-border-subtle shadow-sm">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag size={14} /> Issue Type</p>
            <p className="text-sm font-bold text-text-main">{extractedData?.issueType}</p>
          </div>
          <div className="bg-bg-base rounded-2xl p-5 border border-border-subtle shadow-sm">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Flame size={14} /> Severity</p>
            <StatusBadge status={extractedData?.severity} className="inline-flex" />
          </div>
        </div>

        <div className="bg-bg-base rounded-2xl p-5 border border-border-subtle shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlignLeft size={14} /> AI Description</p>
          <p className="text-sm font-medium text-text-main leading-relaxed">{extractedData?.description}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(1)}
          disabled={loading}
          className="px-6 py-4 rounded-xl text-text-muted font-bold text-sm bg-bg-base hover:bg-bg-base/80 border border-border-subtle transition-all disabled:opacity-50"
        >
          Retake
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all bg-primary hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {loading ? 'Submitting...' : 'Submit Smart Report'}
        </button>
      </div>
    </div>
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
          className="!mb-[30px]"
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
