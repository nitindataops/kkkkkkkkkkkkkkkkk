import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  WifiOff,
  CloudUpload,
  Layers,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';
import {
  SyncStatusState,
  subscribeToSyncStatus,
  processOfflineQueue,
  getOfflineDrafts,
  getPendingQueue,
  deleteCropDraft,
  clearPendingQueue,
} from '../../services/offlineSyncService';
import { LanguageCode } from '../../types';

interface SyncStatusBadgeProps {
  currentLanguage?: LanguageCode;
  className?: string;
  onOpenDraft?: (draftId: string) => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  currentLanguage = 'hi',
  className = '',
  onOpenDraft,
}) => {
  const isHi = currentLanguage === 'hi';
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>('synced');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [drafts, setDrafts] = useState(() => getOfflineDrafts());
  const [queue, setQueue] = useState(() => getPendingQueue());

  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus((status, count) => {
      setSyncStatus(status);
      setPendingCount(count);
      setDrafts(getOfflineDrafts());
      setQueue(getPendingQueue());
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await processOfflineQueue();
      setDrafts(getOfflineDrafts());
      setQueue(getPendingQueue());
    } finally {
      setIsSyncing(false);
    }
  };

  const renderBadgeContent = () => {
    if (syncStatus === 'offline') {
      return (
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs transition-colors cursor-pointer">
          <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>{isHi ? 'ऑफ़लाइन मोड' : 'Offline'}</span>
          {pendingCount > 0 && (
            <span className="ml-1 bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingCount}
            </span>
          )}
        </div>
      );
    }

    if (syncStatus === 'syncing' || isSyncing) {
      return (
        <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs">
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          <span>{isHi ? 'सिंक हो रहा है...' : 'Syncing...'}</span>
        </div>
      );
    }

    if (pendingCount > 0 || syncStatus === 'pending') {
      return (
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{isHi ? `पेंडिंग सिंक (${pendingCount})` : `Pending sync (${pendingCount})`}</span>
        </div>
      );
    }

    return (
      <div
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>{isHi ? 'डेटा सिंक' : 'Synced'}</span>
      </div>
    );
  };

  return (
    <>
      <div className={`inline-flex items-center ${className}`}>
        {renderBadgeContent()}
      </div>

      {/* Sync Queue & Offline Manager Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#D5DDD2] shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE6DC]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#245C3A]/10 text-[#245C3A] flex items-center justify-center">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#26332B]">
                    {isHi ? 'किसान साथी ऑफलाइन सिंक' : 'Kisan Saathi Offline Sync Manager'}
                  </h3>
                  <p className="text-xs text-[#68736B]">
                    {isHi ? 'खेत में बिना इंटरनेट भी कार्य करें' : 'Work uninterrupted in remote fields'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F0] hover:bg-[#EBE6DC] text-[#68736B] flex items-center justify-center font-bold text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Summary Banner */}
            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E3DCB] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#68736B]">
                  {isHi ? 'नेटवर्क स्थिति:' : 'Network Status:'}
                </div>
                <div className="text-sm font-black text-[#26332B] flex items-center gap-2 mt-0.5">
                  {syncStatus === 'offline' ? (
                    <>
                      <WifiOff className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700">{isHi ? 'ऑफ़लाइन (कैश्ड मोड)' : 'Offline (Cached Mode)'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">{isHi ? 'ऑनलाइन कनेक्टेड' : 'Online Connected'}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleManualSync}
                disabled={isSyncing || syncStatus === 'offline'}
                className="px-3 py-1.5 rounded-xl bg-[#245C3A] hover:bg-[#1E4D31] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isHi ? 'अभी सिंक करें' : 'Sync Now'}</span>
              </button>
            </div>

            {/* Pending Queue Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#26332B]">
                <span>{isHi ? 'कतारबद्ध कार्य (Pending Actions)' : 'Pending Sync Queue'} ({queue.length})</span>
                {queue.length > 0 && (
                  <button
                    onClick={() => {
                      clearPendingQueue();
                      setQueue([]);
                    }}
                    className="text-red-600 hover:underline text-[11px]"
                  >
                    {isHi ? 'कतार साफ करें' : 'Clear Queue'}
                  </button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isHi
                      ? 'कोई पेंडिंग सिंक नहीं है। सभी डेटा सर्वर के साथ पूर्णतः सिंक है।'
                      : 'All offline actions and crop records are fully synchronized with the server.'}
                  </span>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white border border-[#D5DDD2] text-xs flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <div>
                          <div className="font-bold text-[#26332B]">
                            {item.type === 'SAVE_CROP' || item.type === 'CREATE_DRAFT'
                              ? `${item.payload.cropName || 'Crop'} (${item.payload.variety || 'Variety'})`
                              : item.type}
                          </div>
                          <div className="text-[10px] text-[#68736B]">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {isHi ? 'पेंडिंग' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Offline Saved Drafts */}
            <div className="space-y-3 pt-2 border-t border-[#EBE6DC]">
              <div className="text-xs font-bold text-[#26332B] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#245C3A]" />
                <span>{isHi ? 'सहेजे गए ऑफ़लाइन ड्राफ्ट' : 'Saved Offline Drafts'} ({drafts.length})</span>
              </div>

              {drafts.length === 0 ? (
                <p className="text-xs text-[#68736B] italic">
                  {isHi ? 'कोई ऑफ़लाइन ड्राफ्ट नहीं है।' : 'No offline drafts currently saved.'}
                </p>
              ) : (
                <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                  {drafts.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E3DCB] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-black text-[#26332B]">{d.cropName} - {d.variety}</div>
                        <div className="text-[10px] text-[#68736B]">
                          {d.quantityKg.toLocaleString()} kg • ₹{d.expectedPrice}/kg • {d.storageLocation}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {onOpenDraft && (
                          <button
                            onClick={() => {
                              setIsModalOpen(false);
                              onOpenDraft(d.id);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#245C3A] text-white text-[11px] font-bold hover:bg-[#1E4D31]"
                          >
                            {isHi ? 'खोलें' : 'Open'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            deleteCropDraft(d.id);
                            setDrafts(getOfflineDrafts());
                          }}
                          className="text-red-600 hover:text-red-700 text-[11px] font-bold p-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Close */}
            <div className="pt-3 border-t border-[#EBE6DC] flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#EBE6DC] hover:bg-[#D5DDD2] text-[#26332B] text-xs font-bold"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
