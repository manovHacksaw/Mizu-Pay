import { NextResponse } from "next/server";
import { fetchTransactionDetails } from "@/lib/paymentVerification";
import { decodeTransactionInput } from "@/lib/paymentVerification";
import { MIZU_PAY_CONTRACT } from "@/lib/contracts";
import { parseUnits } from "viem";

const BLOCKSCOUT_API_BASE = 'https://celo-sepolia.blockscout.com/api';
const REQUIRED_CONFIRMATIONS = 5;

/**
 * GET /api/payments/verify-progress
 * Check the progress of transaction verification with detailed steps
 * 
 * Query params:
 *   txHash: Transaction hash to check
 *   sessionId: Expected session ID (optional, for verification)
 *   expectedWalletAddress: Expected wallet address (optional, for verification)
 *   expectedAmountCrypto: Expected amount in crypto (optional, for verification)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txHash = searchParams.get("txHash");
    const sessionId = searchParams.get("sessionId");
    const expectedWalletAddress = searchParams.get("expectedWalletAddress");
    const expectedAmountCrypto = searchParams.get("expectedAmountCrypto");

    if (!txHash) {
      return NextResponse.json(
        { error: "Transaction hash is required" },
        { status: 400 }
      );
    }

    try {
      // Step 1: Fetch transaction details from Blockscout
      const url = `${BLOCKSCOUT_API_BASE}?module=transaction&action=gettxinfo&txhash=${txHash}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Initialize verification steps
      const verificationSteps = {
        transactionFound: false,
        transactionIncluded: false,
        contractVerified: false,
        walletVerified: false,
        sessionIdVerified: false,
        amountVerified: false,
        confirmationsComplete: false,
      };
      
      const stepMessages: Record<string, string> = {};
      
      if (!response.ok || data.status !== '1' || !data.result) {
        // Transaction not yet found
        return NextResponse.json({
          confirmed: false,
          confirmations: 0,
          requiredConfirmations: REQUIRED_CONFIRMATIONS,
          status: "pending",
          message: "Transaction sent, waiting for confirmation...",
          verificationSteps,
          stepMessages: {
            transactionFound: "Waiting for transaction to appear on blockchain...",
          },
        });
      }
      
      const txInfo = data.result;
      verificationSteps.transactionFound = true;
      stepMessages.transactionFound = "✓ Transaction found on blockchain";
      
      // Check if transaction is included in a block
      if (!txInfo.blockNumber) {
        return NextResponse.json({
          confirmed: false,
          confirmations: 0,
          requiredConfirmations: REQUIRED_CONFIRMATIONS,
          status: "pending",
          message: "Transaction sent, waiting to be included in a block...",
          verificationSteps,
          stepMessages: {
            ...stepMessages,
            transactionIncluded: "Waiting for transaction to be included in a block...",
          },
        });
      }
      
      verificationSteps.transactionIncluded = true;
      stepMessages.transactionIncluded = "✓ Transaction included in block";
      
      // Use Blockscout's confirmations field directly
      const confirmations = txInfo.confirmations 
        ? parseInt(txInfo.confirmations, 10) 
        : 0;
      
      const blockNumber = parseInt(txInfo.blockNumber, 10);
      const isConfirmed = confirmations >= REQUIRED_CONFIRMATIONS;
      const transactionStatus = txInfo.success === true ? 'success' : (txInfo.success === false ? 'failed' : 'pending');
      
      // If transaction failed, return early
      if (transactionStatus === 'failed') {
        return NextResponse.json({
          confirmed: false,
          confirmations,
          requiredConfirmations: REQUIRED_CONFIRMATIONS,
          status: "failed",
          message: "Transaction failed on-chain",
          verificationSteps,
          stepMessages: {
            ...stepMessages,
            transactionIncluded: "✗ Transaction failed on-chain",
          },
        });
      }
      
      // Step 2: Verify contract address (if we have transaction details)
      try {
        const txDetails = await fetchTransactionDetails(txHash);
        const contractAddressLower = MIZU_PAY_CONTRACT.toLowerCase();
        
        if (txDetails.to === contractAddressLower) {
          verificationSteps.contractVerified = true;
          stepMessages.contractVerified = "✓ Payment sent to correct contract";
        } else {
          stepMessages.contractVerified = `✗ Payment sent to wrong contract. Expected: ${MIZU_PAY_CONTRACT}`;
        }
        
        // Step 3: Verify wallet address (if provided)
        if (expectedWalletAddress) {
          const expectedWalletLower = expectedWalletAddress.toLowerCase();
          if (txDetails.from === expectedWalletLower) {
            verificationSteps.walletVerified = true;
            stepMessages.walletVerified = "✓ Payment sent from correct wallet";
          } else {
            stepMessages.walletVerified = `✗ Payment sent from wrong wallet. Expected: ${expectedWalletAddress}`;
          }
        } else {
          verificationSteps.walletVerified = true; // Skip if not provided
          stepMessages.walletVerified = "✓ Wallet verification skipped";
        }
        
        // Step 4 & 5: Verify sessionId and amount (if provided)
        if (sessionId && expectedAmountCrypto) {
          const amountWei = parseUnits(expectedAmountCrypto.toString(), 18).toString();
          const { sessionIdMatches, amountMatches, functionSelectorValid } = decodeTransactionInput(
            txDetails.input,
            sessionId,
            amountWei
          );
          
          if (functionSelectorValid && sessionIdMatches) {
            verificationSteps.sessionIdVerified = true;
            stepMessages.sessionIdVerified = "✓ Payment made for correct session";
          } else {
            stepMessages.sessionIdVerified = "✗ Payment session ID does not match";
          }
          
          if (functionSelectorValid && amountMatches) {
            verificationSteps.amountVerified = true;
            stepMessages.amountVerified = "✓ Correct amount paid";
          } else {
            stepMessages.amountVerified = `✗ Payment amount does not match. Expected: ${expectedAmountCrypto}`;
          }
        } else {
          // Skip verification if not provided
          verificationSteps.sessionIdVerified = true;
          verificationSteps.amountVerified = true;
          stepMessages.sessionIdVerified = "✓ Session verification skipped";
          stepMessages.amountVerified = "✓ Amount verification skipped";
        }
      } catch (verifyError) {
        // Continue with confirmations even if verification fails
      }
      
      // Step 6: Check confirmations
      if (isConfirmed) {
        verificationSteps.confirmationsComplete = true;
        stepMessages.confirmationsComplete = `✓ ${confirmations} block confirmations completed`;
      } else {
        stepMessages.confirmationsComplete = `Waiting for confirmations... (${confirmations}/${REQUIRED_CONFIRMATIONS})`;
      }
      

      return NextResponse.json({
        confirmed: isConfirmed,
        confirmations,
        requiredConfirmations: REQUIRED_CONFIRMATIONS,
        status: transactionStatus,
        blockNumber,
        transactionStatus: transactionStatus,
        message: isConfirmed 
          ? `Transaction verified with ${confirmations} block confirmations`
          : `Verifying transaction... (${confirmations}/${REQUIRED_CONFIRMATIONS} confirmations)`,
        verificationSteps,
        stepMessages,
      });
    } catch (error) {
      // If transaction not found, might not be confirmed yet
      if (error instanceof Error && (
        error.message.includes('not found') || 
        error.message.includes('not be confirmed') ||
        error.message.includes('Bad Request')
      )) {
        return NextResponse.json({
          confirmed: false,
          confirmations: 0,
          requiredConfirmations: REQUIRED_CONFIRMATIONS,
          status: "pending",
          message: "Transaction sent, waiting for confirmation...",
          verificationSteps: {
            transactionFound: false,
            transactionIncluded: false,
            contractVerified: false,
            walletVerified: false,
            sessionIdVerified: false,
            amountVerified: false,
            confirmationsComplete: false,
          },
          stepMessages: {
            transactionFound: "Waiting for transaction to appear on blockchain...",
          },
        });
      }
      
      throw error;
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

