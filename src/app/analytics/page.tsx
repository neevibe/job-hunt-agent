'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const COLORS = ['#22c55e', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar activePath="/analytics" />
      <main className="ml-64 flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel */}
            <div className="glass rounded-xl p-6 h-[400px]">
              <h2 className="text-xl font-semibold mb-4">Application Funnel</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.funnel} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Pie */}
            <div className="glass rounded-xl p-6 h-[400px]">
              <h2 className="text-xl font-semibold mb-4">Platform Performance</h2>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.platformBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={80} outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.platformBreakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Trend */}
            <div className="glass rounded-xl p-6 h-[400px] lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Daily Application Trend (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="applications" stroke="#22c55e" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Role Performance Table */}
            <div className="glass rounded-xl p-6 lg:col-span-2 overflow-x-auto">
              <h2 className="text-xl font-semibold mb-4">Role Performance</h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground text-sm">
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium text-right">Applications</th>
                    <th className="pb-3 font-medium text-right">Interviews</th>
                    <th className="pb-3 font-medium text-right">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rolePerformance.map((role: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 last:border-0">
                      <td className="py-4 font-medium">{role.role}</td>
                      <td className="py-4 text-right">{role.applications}</td>
                      <td className="py-4 text-right">{role.interviews}</td>
                      <td className="py-4 text-right text-green-400">{role.conversion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
