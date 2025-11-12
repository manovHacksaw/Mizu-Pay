'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDateForTable } from '@/lib/dateUtils';
import { formatAmountWithConversion } from '@/lib/currencyUtils';
import { useCurrencyStore } from '@/lib/currencyStore';

type SessionStatus = 'pending' | 'processing' | 'paid' | 'fulfilled' | 'expired' | 'failed' | 'email_failed' | string;

interface SessionDetailsResponse {
  sessionId: string;
  status: SessionStatus;
  store: string;
  amountUSD: number;
  createdAt: string;
  expiresAt: string | null;
  wallet: {
    address: string;
    type: string;
  } | null;
  user: {
    id: string;
    email: string | null;
  } | null;
  payment: {
    txHash: string | null;
    amountCrypto: number;
    token: string;
    status: SessionStatus;
    createdAt: string;
  } | null;
  giftCard: {
    store: string;
    currency: string;
    amountUSD: number;
  } | null;
  expired: boolean;
}

interface VerificationResponse {
  confirmations?: number;
  requiredConfirmations?: number;
  confirmationsComplete?: boolean;
}

const STORE_LOGOS = [
  { keywords: ['amazon'], src: '/store-logos/amazonjpg' },
  { keywords: ['myntra'], src: '/store-logos/myntra.webp' },
  { keywords: ['makemytrip', 'make my trip', 'mmt'], src: '/store-logos/makemytrip.webp' },
];

const getStoreLogo = (store: string) => {
  const lower = store.toLowerCase();
  for (const entry of STORE_LOGOS) {
    if (entry.keywords.some(keyword => lower.includes(keyword))) {
      return entry.src;
    }
  }
  return null;
};

const getStoreInitials = (store: string) => {
  const words = store.split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) return '–';
  return words.map(word => word[0]?.toUpperCase() || '').join('');
};

const statusStyles: Record<string, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
  fulfilled: { label: 'Fulfilled', className: 'bg-green-100 text-green-700' },
  succeeded: { label: 'Succeeded', className: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
  confirming: { label: 'Confirming', className: 'bg-blue-100 text-blue-700' },
  expired: { label: 'Expired', className: 'bg-gray-100 text-gray-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
  email_failed: { label: 'Email Failed', className: 'bg-orange-100 text-orange-700' },
};

function StatusBadge({ status }: { status: SessionStatus }) {
  const style = statusStyles[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.className}`}>
      {style.label}
    </span>
  );
}

export default function TransactionDetailsPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { sessionId } = params;
  const [details, setDetails] = useState<SessionDetailsResponse | null>(null);
  const [confirmations, setConfirmations] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedDisplayCurrency } = useCurrencyStore();

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Transaction not found' : 'Failed to load transaction');
        }
        const data: SessionDetailsResponse = await response.json();
        if (isMounted) {
          setDetails(data);
          setError(null);
        }

        if (data.payment?.txHash) {
          const verificationResponse = await fetch(`/api/payments/verify-progress?txHash=${data.payment.txHash}`);
          if (verificationResponse.ok) {
            const verificationData: VerificationResponse = await verificationResponse.json();
            if (isMounted) {
              setConfirmations(verificationData);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const purchaseAmount = useMemo(() => {
    if (!details) return null;
    return formatAmountWithConversion(details.amountUSD);
  }, [details, selectedDisplayCurrency]);

  const paidAmount = useMemo(() => {
    if (!details?.payment) return null;
    return formatAmountWithConversion(details.payment.amountCrypto);
  }, [details, selectedDisplayCurrency]);

  const extraPaid = useMemo(() => {
    if (!details?.payment) return null;
    const difference = details.payment.amountCrypto - details.amountUSD;
    const percentage = details.amountUSD > 0 ? (difference / details.amountUSD) * 100 : 0;
    const formatted = formatAmountWithConversion(Math.abs(difference));
    const sign = difference > 0 ? '+' : difference < 0 ? '-' : '';
    return {
      difference,
      percentage,
      formattedText: `${sign}${formatted.display} (${sign}${percentage.toFixed(1)}%)`,
    };
  }, [details, selectedDisplayCurrency]);

  const renderStoreAvatar = () => {
    if (!details) return null;
    const logo = getStoreLogo(details.store);
    if (logo) {
      return (
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          <Image src={logo} alt={details.store} fill className="object-cover" sizes="64px" />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-semibold">
        {getStoreInitials(details.store)}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <Link
          href="/dashboard/transactions"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          View all transactions
        </Link>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 p-6 dashboard-card-bg shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-24 rounded-2xl bg-gray-100" />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-6">
          <h2 className="text-lg font-semibold mb-2">Unable to load transaction</h2>
          <p className="text-sm">{error}</p>
        </div>
      ) : details ? (
        <div className="space-y-8">
          <div className="rounded-2xl border border-gray-200 p-6 dashboard-card-bg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                {renderStoreAvatar()}
                <div>
                  <h1 className="text-2xl font-bold dashboard-text-primary">{details.store}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <StatusBadge status={details.status} />
                    <span className="text-xs dashboard-text-secondary font-mono">Session ID: {details.sessionId}</span>
                  </div>
                  <p className="text-xs dashboard-text-muted mt-2">
                    Created on {formatDateForTable(details.createdAt)}
                    {details.expiresAt && ` · Expires ${formatDateForTable(details.expiresAt)}`}
                  </p>
                </div>
              </div>
              {details.payment?.txHash && (
                <Link
                  href={`https://celo-sepolia.blockscout.com/tx/${details.payment.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-xl dashboard-card-border dashboard-card-bg hover:border-blue-300 transition-colors">
                  View on Blockscout
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l0-5m0 0h-5m5 0L7 13m0 0H2m5 0v5" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 p-5 dashboard-card-bg shadow-sm">
              <p className="text-xs dashboard-text-secondary uppercase tracking-wide">Purchase Amount</p>
              <div className="mt-2 text-xl font-semibold dashboard-text-primary">
                {purchaseAmount?.display}
              </div>
              {purchaseAmount?.showUSDEquivalent && (
                <p className="text-xs dashboard-text-muted mt-1">{purchaseAmount.usdEquivalent}</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 dashboard-card-bg shadow-sm">
              <p className="text-xs dashboard-text-secondary uppercase tracking-wide">Paid Amount</p>
              <div className="mt-2 text-xl font-semibold dashboard-text-primary">
                {paidAmount ? paidAmount.display : '—'}
              </div>
              {paidAmount?.showUSDEquivalent && (
                <p className="text-xs dashboard-text-muted mt-1">≈ {paidAmount.usdEquivalent}</p>
              )}
              {details.payment && (
                <p className="text-xs dashboard-text-secondary mt-1">
                  {details.payment.amountCrypto.toFixed(4)} {details.payment.token}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 dashboard-card-bg shadow-sm">
              <p className="text-xs dashboard-text-secondary uppercase tracking-wide">Extra Paid</p>
              <div className="mt-2 text-xl font-semibold dashboard-text-primary">
                {extraPaid ? extraPaid.formattedText : '—'}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 dashboard-card-bg shadow-sm">
              <p className="text-xs dashboard-text-secondary uppercase tracking-wide">Confirmations</p>
              <div className="mt-2 text-xl font-semibold dashboard-text-primary">
                {details.payment?.txHash
                  ? `${confirmations?.confirmations ?? 0}/${confirmations?.requiredConfirmations ?? 5}`
                  : '—'}
              </div>
              {details.payment?.txHash && (
                <p className={`text-xs mt-1 ${confirmations?.confirmationsComplete ? 'text-green-600' : 'dashboard-text-secondary'}`}>
                  {confirmations?.confirmationsComplete ? 'Confirmations complete' : 'Waiting for confirmations'}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 p-6 dashboard-card-bg shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold dashboard-text-primary">Payment Details</h2>
                <StatusBadge status={details.payment?.status || details.status} />
              </div>
              {details.payment ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="dashboard-text-secondary">Status</span>
                    <span className="dashboard-text-primary capitalize">{details.payment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dashboard-text-secondary">Token</span>
                    <span className="dashboard-text-primary">{details.payment.token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dashboard-text-secondary">Amount (crypto)</span>
                    <span className="dashboard-text-primary">{details.payment.amountCrypto.toFixed(6)}</span>
                  </div>
                  {details.payment.txHash && (
                    <div className="flex justify-between">
                      <span className="dashboard-text-secondary">Transaction Hash</span>
                      <Link
                        href={`https://celo-sepolia.blockscout.com/tx/${details.payment.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-mono text-xs"
                      >
                        {details.payment.txHash.slice(0, 10)}...{details.payment.txHash.slice(-6)}
                      </Link>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="dashboard-text-secondary">Paid On</span>
                    <span className="dashboard-text-primary">{formatDateForTable(details.payment.createdAt)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm dashboard-text-secondary">This session has not received a payment yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 dashboard-card-bg shadow-sm space-y-4">
              <h2 className="text-lg font-semibold dashboard-text-primary">Session & Recipient</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="dashboard-text-secondary">Gift Card</span>
                  <span className="dashboard-text-primary">
                    {details.giftCard ? `${details.giftCard.store} · ${details.giftCard.currency}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dashboard-text-secondary">Wallet</span>
                  <span className="dashboard-text-primary font-mono text-xs">
                    {details.wallet?.address ? `${details.wallet.address.slice(0, 6)}...${details.wallet.address.slice(-4)}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dashboard-text-secondary">Wallet Type</span>
                  <span className="dashboard-text-primary">{details.wallet?.type || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dashboard-text-secondary">Customer</span>
                  <span className="dashboard-text-primary">{details.user?.email || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dashboard-text-secondary">Expires</span>
                  <span className="dashboard-text-primary">{details.expiresAt ? formatDateForTable(details.expiresAt) : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}



