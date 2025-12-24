import React, { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

const CaptivePortalPreview = ({
  portalConfig,
  setShowPortalPreview,
  generateFreeTrial = null,
  onVoucherLogin = null
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isTrialLoading, setIsTrialLoading] = useState(false);

  const handleLogin = () => {
    try {
      if (voucherCode) {
        if (onVoucherLogin) {
          onVoucherLogin(voucherCode);
        }
        setLoginSuccess(true);
        setTimeout(() => {
          setLoginSuccess(false);
          setVoucherCode('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error handling login:', error);
    }
  };

  const handleFreeTrial = async () => {
    try {
      setIsTrialLoading(true);
      if (generateFreeTrial) {
        await generateFreeTrial();
      }
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        setIsTrialLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Error generating free trial:', error);
      setIsTrialLoading(false);
      // Show error state briefly
      setTimeout(() => setIsTrialLoading(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header with branding */}
        <div
          className="p-8 text-white text-center"
          style={{
            background: `linear-gradient(135deg, ${portalConfig.primaryColor} 0%, ${portalConfig.secondaryColor} 100%)`
          }}
        >
          <div className="text-6xl mb-4">{portalConfig.logo}</div>
          <h1 className="text-3xl font-bold mb-2">{portalConfig.companyName}</h1>
          <p className="text-lg opacity-90">{portalConfig.welcomeText}</p>
          <p className="text-sm opacity-75 mt-1">{portalConfig.description}</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          {!loginSuccess ? (
            <>
              {/* Voucher Code Section */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Enter Voucher Code
                </label>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 font-mono text-center text-lg"
                />
                <button
                  onClick={handleLogin}
                  className="w-full mt-3 py-3 rounded-lg font-bold text-white transition transform hover:scale-105"
                  style={{ backgroundColor: portalConfig.primaryColor }}
                  disabled={!voucherCode.trim()}
                >
                  Connect to WiFi
                </button>
              </div>

              {/* Free Trial Section */}
              {portalConfig.enableFreeTrial && (
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 border-dashed rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl mb-2">⏰</div>
                      <h3 className="text-lg font-bold text-green-800 mb-1">
                        Free {portalConfig.trialDuration || 1}-Hour Trial
                      </h3>
                      <p className="text-sm text-green-600 mb-3">
                        {portalConfig.trialMessage || 'Test our internet connection absolutely free!'}
                      </p>
                      <button
                        onClick={handleFreeTrial}
                        disabled={isTrialLoading}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white font-bold rounded-lg transition transform hover:scale-105 disabled:cursor-not-allowed"
                      >
                        {isTrialLoading ? 'Generating Trial...' : 'Get Free Trial'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {portalConfig.terms}
                </p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Need help? Contact: <span className="font-semibold">{portalConfig.contactInfo}</span>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Connected!</h3>
              <p className="text-gray-600">You now have internet access</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-8 py-4 text-center text-sm text-white"
          style={{ backgroundColor: portalConfig.secondaryColor }}
        >
          <p>Powered by {portalConfig.companyName} • Secure WiFi Network</p>
        </div>
      </div>

      <button
        onClick={() => setShowPortalPreview(false)}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

export default CaptivePortalPreview;
