'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2, CheckCircle2, XCircle, Edit } from 'lucide-react';

export default function ReviewPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/queue?status=human_review');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'queued' | 'skipped') => {
    try {
      await fetch('/api/queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId: id, newStatus: action })
      });
      setItems((prev) => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar activePath="/review" />
      <main className="ml-64 flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Human Review Queue</h1>
          <p className="text-sm text-muted-foreground mb-6">Applications that need your manual approval or edits.</p>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-medium">All caught up!</h3>
              <p className="text-muted-foreground">No items need your review at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item.id} className="glass rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-semibold">{item.jobTitle || 'Unknown Job'}</h3>
                    <p className="text-sm text-muted-foreground">{item.company || 'Unknown Company'} • Score: <span className="text-green-400">{item.matchScore || 0}%</span></p>
                    <p className="text-xs bg-secondary/50 p-2 rounded inline-block mt-2">
                      {item.reviewReason || 'Manual review required.'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleAction(item.id, 'skipped')}
                      className="flex-1 md:flex-none bg-secondary hover:bg-secondary/80 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <XCircle className="h-4 w-4" /> Skip
                    </button>
                    <button 
                      className="flex-1 md:flex-none bg-secondary hover:bg-secondary/80 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                    <button 
                      onClick={() => handleAction(item.id, 'queued')}
                      className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
