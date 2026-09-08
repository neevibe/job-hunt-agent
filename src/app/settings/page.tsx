'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Save, Loader2, Plus, X } from 'lucide-react';

export default function SettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
        } else {
          // Default state for Neeraj Prakash (AI PM)
          setConfig({
            enabled: false,
            dailyLimit: 100,
            minMatchScore: 75,
            autoApplyThreshold: 85,
            humanReviewThreshold: 65,
            autoSubmit: false,
            targetRoles: ['AI Product Manager', 'GenAI Product Manager', 'Product Manager AI', 'AI Product Lead', 'Technical PM AI'],
            targetLocations: ['Bengaluru', 'Mumbai', 'Hyderabad', 'Remote'],
            platforms: { linkedin: true, naukri: true, wellfound: true, instahyre: true, greenhouse: true, lever: true },
            companies: { preferred: ['Google', 'Razorpay', 'PhonePe', 'Databricks', 'OpenAI'], blacklisted: [] },
            remotePreference: 'Any',
            compensation: { min: 5000000, max: 8000000, currency: 'INR' }
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar activePath="/settings" />
      <main className="ml-64 flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Settings</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                saved ? 'bg-green-700 text-white shadow-lg shadow-green-500/20' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saved ? 'Saved! ✓' : 'Save Changes'}
            </button>
          </div>

          <div className="grid gap-6">
            <section className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">Autonomous Mode</h2>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Enable Autonomous Mode</label>
                  <p className="text-xs text-muted-foreground">Allow agent to search and apply automatically.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.enabled}
                  onChange={(e) => updateConfig('enabled', e.target.checked)}
                  className="toggle"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Application Limit ({config.dailyLimit})</label>
                <input 
                  type="range" 
                  min="1" max="200" 
                  value={config.dailyLimit}
                  onChange={(e) => updateConfig('dailyLimit', parseInt(e.target.value))}
                  className="w-full accent-green-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Match Score ({config.minMatchScore})</label>
                <input 
                  type="range" 
                  min="50" max="100" 
                  value={config.minMatchScore}
                  onChange={(e) => updateConfig('minMatchScore', parseInt(e.target.value))}
                  className="w-full accent-green-600"
                />
              </div>
            </section>

            <section className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">Target Roles & Locations</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Titles</label>
                <p className="text-xs text-muted-foreground">Roles to search for.</p>
                <div className="flex flex-wrap gap-2">
                  {config.targetRoles?.map((role: string, i: number) => (
                    <span key={i} className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {role}
                      <button onClick={() => updateConfig('targetRoles', config.targetRoles.filter((_: any, idx: number) => idx !== i))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">Preferences</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Remote Preference</label>
                <select 
                  value={config.remotePreference}
                  onChange={(e) => updateConfig('remotePreference', e.target.value)}
                  className="bg-secondary rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 w-full"
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                  <option>Any</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Salary</label>
                  <input 
                    type="number"
                    value={config.compensation?.min || ''}
                    onChange={(e) => updateConfig('compensation', { ...config.compensation, min: parseInt(e.target.value) })}
                    className="bg-secondary rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Salary</label>
                  <input 
                    type="number"
                    value={config.compensation?.max || ''}
                    onChange={(e) => updateConfig('compensation', { ...config.compensation, max: parseInt(e.target.value) })}
                    className="bg-secondary rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 w-full"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
