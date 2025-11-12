'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useCurrencyStore, CURRENCIES } from '@/lib/currencyStore';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { selectedDisplayCurrency, setSelectedDisplayCurrency, formatAmount } = useCurrencyStore();
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Only show Mizu Pay (embedded) wallets, not external wallets
  const embeddedWallets = wallets?.filter(w => 
    w.walletClientType === 'privy' || 
    w.walletClientType === 'embedded' ||
    w.connectorType === 'privy'
  ) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold dashboard-text-primary">Settings</h1>
        <p className="text-sm dashboard-text-secondary mt-1">
          Manage your profile and account settings
        </p>
      </div>

      {/* Profile Section */}
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold dashboard-text-primary">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dashboard-text-secondary mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={user?.email?.address || ''}
                disabled
                className="w-full px-4 py-3 dashboard-input-bg dashboard-card-border border rounded-lg dashboard-text-primary cursor-not-allowed bg-gray-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 dashboard-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-xs dashboard-text-muted mt-1.5">
              Your email address is used for account verification and notifications
            </p>
          </div>
        </div>
      </div>

      {/* Mizu Pay Wallet Section */}
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold dashboard-text-primary">
            Wallet
          </h2>
        </div>
        <div className="space-y-3">
          {embeddedWallets.length > 0 ? (
            embeddedWallets.map((wallet, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 dashboard-input-bg rounded-xl border dashboard-card-border hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold dashboard-text-primary mb-1">
                      Mizu Pay Wallet
                    </p>
                    <p className="text-xs dashboard-text-muted font-mono">
                      {wallet.address
                        ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                        : 'No address'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full border border-green-200">
                  Connected
                </span>
              </div>
            ))
          ) : (
            <div className="p-5 text-center border dashboard-card-border rounded-xl">
              <p className="text-sm dashboard-text-secondary">No Mizu Pay wallet found</p>
            </div>
          )}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <h2 className="text-lg font-semibold dashboard-text-primary mb-6">Preferences</h2>
        <div className="space-y-6">
          {/* Currency Selection */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <p className="text-sm font-medium dashboard-text-primary mb-1">Display Currency</p>
              <p className="text-xs dashboard-text-muted">
                Choose your preferred currency for displaying amounts
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 dashboard-card-bg dashboard-card-border border rounded-lg dashboard-text-primary hover:bg-gray-50 transition-colors min-w-[140px] justify-between"
              >
                <span className="text-sm font-medium">
                  {CURRENCIES.find(c => c.code === selectedDisplayCurrency)?.code || 'USD'}
                </span>
                <svg 
                  className={`w-4 h-4 dashboard-text-muted transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCurrencyDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsCurrencyDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 dashboard-card-bg dashboard-card-border border rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      {CURRENCIES.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setSelectedDisplayCurrency(currency.code);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                            selectedDisplayCurrency === currency.code
                              ? 'bg-blue-50 text-blue-600'
                              : 'dashboard-text-primary hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{currency.name}</p>
                              <p className="text-xs dashboard-text-muted">{currency.code}</p>
                            </div>
                            <span className="text-sm font-medium">{currency.symbol}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-t dashboard-card-border"></div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <p className="text-sm font-medium dashboard-text-primary mb-1">Email Notifications</p>
              <p className="text-xs dashboard-text-muted">
                Receive email updates about your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Transaction Alerts */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <p className="text-sm font-medium dashboard-text-primary mb-1">Transaction Alerts</p>
              <p className="text-xs dashboard-text-muted">
                Get notified when transactions are completed
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

