import React from 'react';
import { Globe, Palette } from 'lucide-react';

const CaptivePortalTab = ({ portalConfig, setPortalConfig, showPortalPreview, setShowPortalPreview }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 sm:p-6 animate-in fade-in duration-300 shadow-2xl shadow-slate-900/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Captive Portal Configuration</h2>
        <button
          onClick={() => setShowPortalPreview(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <Globe className="w-5 h-5" />
          Preview Portal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-blue-200 mb-2 font-semibold">Company Name</label>
                  <input
                    type="text"
                    value={portalConfig.companyName}
                    onChange={(e) => setPortalConfig({ ...portalConfig, companyName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                  />
          </div>

          <div>
            <label className="block text-blue-200 mb-2 font-semibold">Welcome Text</label>
            <input
              type="text"
              value={portalConfig.welcomeText}
              onChange={(e) => setPortalConfig({ ...portalConfig, welcomeText: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2 font-semibold">Description</label>
            <input
              type="text"
              value={portalConfig.description}
              onChange={(e) => setPortalConfig({ ...portalConfig, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2 font-semibold">Logo Emoji</label>
            <input
              type="text"
              value={portalConfig.logo}
              onChange={(e) => setPortalConfig({ ...portalConfig, logo: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 text-4xl text-center"
              maxLength="2"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2 font-semibold">Contact Info</label>
            <input
              type="text"
              value={portalConfig.contactInfo}
              onChange={(e) => setPortalConfig({ ...portalConfig, contactInfo: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-blue-200 mb-2 font-semibold">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={portalConfig.primaryColor}
                onChange={(e) => setPortalConfig({ ...portalConfig, primaryColor: e.target.value })}
                className="w-20 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={portalConfig.primaryColor}
                onChange={(e) => setPortalConfig({ ...portalConfig, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-200 mb-2 font-semibold">Secondary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={portalConfig.secondaryColor}
                onChange={(e) => setPortalConfig({ ...portalConfig, secondaryColor: e.target.value })}
                className="w-20 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={portalConfig.secondaryColor}
                onChange={(e) => setPortalConfig({ ...portalConfig, secondaryColor: e.target.value })}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-200 mb-2 font-semibold">Terms & Conditions</label>
            <textarea
              value={portalConfig.terms}
              onChange={(e) => setPortalConfig({ ...portalConfig, terms: e.target.value })}
              rows="6"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-blue-200 mb-2 font-semibold">Contact Information</label>
            <input
              type="text"
              value={portalConfig.contactInfo}
              onChange={(e) => setPortalConfig({ ...portalConfig, contactInfo: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Free Trial Settings */}
        <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <h3 className="font-bold mb-4 text-orange-300 flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            Free Trial Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableFreeTrial"
                checked={portalConfig.enableFreeTrial}
                onChange={(e) => setPortalConfig({ ...portalConfig, enableFreeTrial: e.target.checked })}
                className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500"
              />
              <label htmlFor="enableFreeTrial" className="text-orange-200 font-semibold">
                Enable Free Trial
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-orange-200 mb-2 font-semibold">Trial Duration (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={portalConfig.trialDuration}
                  onChange={(e) => setPortalConfig({ ...portalConfig, trialDuration: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-orange-200 mb-2 font-semibold">Trial Bandwidth (Mbps)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={portalConfig.trialBandwidth}
                  onChange={(e) => setPortalConfig({ ...portalConfig, trialBandwidth: parseInt(e.target.value) || 50 })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-orange-200 mb-2 font-semibold">Trial Message</label>
              <input
                type="text"
                value={portalConfig.trialMessage}
                onChange={(e) => setPortalConfig({ ...portalConfig, trialMessage: e.target.value })}
                placeholder="Custom message for free trial offer"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <h3 className="font-bold mb-2 text-green-300 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Portal Features:
        </h3>
        <ul className="text-sm space-y-1 text-green-100">
          <li>✓ Fully customizable DevTek branding</li>
          <li>✓ Voucher code authentication</li>
          <li>✓ Free trial system (configurable duration)</li>
          <li>✓ Responsive design for all devices</li>
          <li>✓ Terms & conditions display</li>
          <li>✓ Custom colors and logo</li>
          <li>✓ Professional guest WiFi experience</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h3 className="font-bold mb-2 text-blue-300">Deployment Instructions:</h3>
        <ol className="text-sm space-y-2 text-blue-100">
          <li><strong>1.</strong> Configure your portal branding and free trial settings above</li>
          <li><strong>2.</strong> Click "Preview Portal" to test the design and free trial feature</li>
          <li><strong>3.</strong> Deploy to MikroTik: <code className="bg-slate-800 px-2 py-1 rounded">/ip hotspot walled-garden add dst-host=your-portal-url</code></li>
          <li><strong>4.</strong> Upload HTML to router files or external web server</li>
          <li><strong>5.</strong> Configure hotspot to redirect to your portal</li>
          <li><strong>6.</strong> Free trial vouchers are automatically generated when users click "Get Free Trial"</li>
        </ol>
      </div>
    </div>
  );
};

export default CaptivePortalTab;
