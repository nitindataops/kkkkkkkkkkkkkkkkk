import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  X,
  MessageSquare,
  ThumbsUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LanguageCode } from '../../types';

interface TransactionRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  counterpartName: string;
  counterpartRole: 'farmer' | 'buyer';
  currentLanguage?: LanguageCode;
  onSubmitted?: (ratingData: any) => void;
}

export const TransactionRatingModal: React.FC<TransactionRatingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  counterpartName,
  counterpartRole,
  currentLanguage = 'hi',
  onSubmitted,
}) => {
  const isHi = currentLanguage === 'hi';
  const [stars, setStars] = useState<number>(5);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [punctualityRating, setPunctualityRating] = useState<number>(5);
  const [paymentRating, setPaymentRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reviewPayload = {
      orderId,
      counterpartName,
      counterpartRole,
      overallRating: stars,
      qualityRating,
      punctualityRating,
      paymentRating,
      comments,
      createdAt: new Date().toISOString(),
    };

    // Save locally or to backend
    try {
      const existingReviews = JSON.parse(localStorage.getItem('kisansaathi_reviews') || '[]');
      existingReviews.unshift(reviewPayload);
      localStorage.setItem('kisansaathi_reviews', JSON.stringify(existingReviews));
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onSubmitted?.(reviewPayload);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#D5DDD2] shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE6DC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#26332B]">
                {isHi ? 'लेनदेन रेटिंग एवं समीक्षा' : 'Transaction Rating & Trust Review'}
              </h3>
              <p className="text-[11px] text-[#68736B]">
                {isHi ? `ऑर्डर #${orderId} के लिए प्रमाणित रेटिंग` : `Authentic verified review for Order #${orderId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F0] hover:bg-[#EBE6DC] text-[#68736B] flex items-center justify-center font-bold text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-[#26332B]">
              {isHi ? 'रेटिंग सफलतापूर्वक दर्ज की गई!' : 'Rating Submitted Successfully!'}
            </h4>
            <p className="text-xs text-[#68736B]">
              {isHi
                ? 'आपकी निष्पक्ष समीक्षा से किसान साथी समुदाय में पारदर्शिता और विश्वास बढ़ता है।'
                : 'Your verified review strengthens transparency and trust in Kisan Saathi.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target party info */}
            <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E3DCB] flex items-center justify-between text-xs">
              <span className="text-[#68736B]">
                {counterpartRole === 'farmer'
                  ? isHi ? 'किसान:' : 'Farmer:'
                  : isHi ? 'खरीदार:' : 'Buyer:'}
              </span>
              <span className="font-bold text-[#26332B]">{counterpartName}</span>
            </div>

            {/* Main Stars */}
            <div className="text-center space-y-2">
              <label className="text-xs font-bold text-[#26332B]">
                {isHi ? 'समग्र अनुभव (Overall Experience)' : 'Overall Rating'}
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= stars ? 'fill-amber-400 text-amber-500' : 'text-[#D5DDD2]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Criteria */}
            <div className="space-y-2.5 pt-2 border-t border-[#EBE6DC] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#68736B]">
                  {isHi ? 'गुणवत्ता एवं वजन सटीकता:' : 'Quality & Weighment Accuracy:'}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setQualityRating(v)}
                      className={`w-6 h-6 rounded-md font-bold text-[10px] ${
                        qualityRating === v
                          ? 'bg-[#245C3A] text-white'
                          : 'bg-[#FAF7F0] text-[#68736B] hover:bg-[#EBE6DC]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#68736B]">
                  {isHi ? 'समय की पाबंदी (Punctuality):' : 'Punctuality:'}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPunctualityRating(v)}
                      className={`w-6 h-6 rounded-md font-bold text-[10px] ${
                        punctualityRating === v
                          ? 'bg-[#245C3A] text-white'
                          : 'bg-[#FAF7F0] text-[#68736B] hover:bg-[#EBE6DC]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#68736B]">
                  {isHi ? 'भुगतान एवं निष्पक्षता:' : 'Payment & Fairness:'}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPaymentRating(v)}
                      className={`w-6 h-6 rounded-md font-bold text-[10px] ${
                        paymentRating === v
                          ? 'bg-[#245C3A] text-white'
                          : 'bg-[#FAF7F0] text-[#68736B] hover:bg-[#EBE6DC]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-[#26332B]">
                {isHi ? 'अपनी टिप्पणी लिखें (वैकल्पिक):' : 'Your Comments (Optional):'}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={2}
                placeholder={isHi ? 'फसल की स्थिति, लोडिंग और लेनदेन कैसा रहा...' : 'Describe delivery, weight verification or transaction...'}
                className="w-full p-2.5 rounded-xl border border-[#D5DDD2] bg-[#FAF7F0] text-xs text-[#26332B] focus:outline-hidden focus:border-[#245C3A]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-[#245C3A] hover:bg-[#1E4D31] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (isHi ? 'दर्ज हो रहा है...' : 'Submitting...') : (isHi ? 'सत्यापित समीक्षा दर्ज करें' : 'Submit Verified Review')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
