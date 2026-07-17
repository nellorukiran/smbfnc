import { X, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FestivalBanner = () => {
  return (
    <div className="relative w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
      <div className="px-4 py-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Left Content */}
            <div className="text-center lg:text-left text-white">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <h2 className="text-lg md:text-xl font-bold">
                  🎉 Festival Season Special
                </h2>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 bg-yellow-400 text-orange-900 text-xs font-bold rounded-full">
                  LIMITED TIME
                </span>
              </div>
              <p className="text-sm md:text-base text-white/90">
                Get up to <span className="text-xl font-bold text-yellow-300">50% OFF</span> on all appliances!
              </p>
            </div>

            {/* Right Content - CTA */}
            <div className="flex flex-col items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 text-white/80 text-sm mb-2">
                <Gift className="h-4 w-4" />
                <span>Free processing + Instant approval</span>
              </div>
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-yellow-100 hover:text-orange-700 font-bold px-6 shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Claim Your Offer
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FestivalBanner;
