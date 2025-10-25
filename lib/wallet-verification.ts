import { ethers } from 'ethers'

/**
 * Verifies that a wallet address can sign a message (proving ownership)
 * @param address - The wallet address to verify
 * @param message - The message that was signed
 * @param signature - The signature to verify
 * @returns boolean - true if the signature is valid for the address
 */
export async function verifyWalletOwnership(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature)
    
    // Check if the recovered address matches the provided address (case-insensitive)
    return recoveredAddress.toLowerCase() === address.toLowerCase()
  } catch (error) {
    console.error('Error verifying wallet ownership:', error)
    return false
  }
}

/**
 * Verifies a SIWE (Sign-In with Ethereum) message
 * @param message - The SIWE message
 * @param signature - The signature to verify
 * @param expectedAddress - The expected wallet address
 * @returns boolean - true if the SIWE message is valid
 */
export async function verifySiweMessage(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    // Parse the SIWE message to extract the address
    const addressMatch = message.match(/address: (0x[a-fA-F0-9]{40})/i)
    if (!addressMatch) {
      return false
    }
    
    const messageAddress = addressMatch[1].toLowerCase()
    const expectedAddressLower = expectedAddress.toLowerCase()
    
    // Verify the address in the message matches the expected address
    if (messageAddress !== expectedAddressLower) {
      return false
    }
    
    // Verify the signature
    return await verifyWalletOwnership(expectedAddress, message, signature)
  } catch (error) {
    console.error('Error verifying SIWE message:', error)
    return false
  }
}
