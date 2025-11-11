'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';

export default function SettingsPage() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

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
        <h2 className="text-lg font-semibold dashboard-text-primary mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dashboard-text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email?.address || ''}
              disabled
              className="w-full px-4 py-2 dashboard-input-bg dashboard-card-border border rounded-lg dashboard-text-primary cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dashboard-text-secondary mb-2">
              User ID
            </label>
            <input
              type="text"
              value={user?.id || ''}
              disabled
              className="w-full px-4 py-2 dashboard-input-bg dashboard-card-border border rounded-lg dashboard-text-primary cursor-not-allowed font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Mizu Pay Wallet Section */}
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <h2 className="text-lg font-semibold dashboard-text-primary mb-4">
          Mizu Pay Wallet
        </h2>
        <div className="space-y-3">
          {embeddedWallets.length > 0 ? (
            embeddedWallets.map((wallet, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 dashboard-input-bg rounded-lg border dashboard-card-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                    <p className="text-sm font-medium dashboard-text-primary">
                      Mizu Pay Wallet
                    </p>
                    <p className="text-xs dashboard-text-muted font-mono">
                      {wallet.address
                        ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                        : 'No address'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  Connected
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm dashboard-text-secondary">No Mizu Pay wallet found</p>
          )}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <h2 className="text-lg font-semibold dashboard-text-primary mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium dashboard-text-primary">Email Notifications</p>
              <p className="text-xs dashboard-text-muted">
                Receive email updates about your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium dashboard-text-primary">Transaction Alerts</p>
              <p className="text-xs dashboard-text-muted">
                Get notified when transactions are completed
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

