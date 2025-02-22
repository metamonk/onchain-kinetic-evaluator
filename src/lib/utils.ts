import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ethers } from "ethers";
import { PublicKey } from "@solana/web3.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const timestamps: { createdAt: true; updatedAt: true } = {
  createdAt: true,
  updatedAt: true,
};

export const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function categorizeWalletAddress(address: string): 'SOL' | 'EVM' | 'INVALID' {
  // Attempt to create a PublicKey to validate Solana address
  try {
    new PublicKey(address);
    return 'SOL';
  } catch (e) {
    console.log(`Address: ${address} is invalid for Solana.`);
  }

  // Check if the address is a valid Ethereum address
  if (ethers.isAddress(address)) {
    return 'EVM';
  }

  console.log(`Address: ${address} is invalid.`);
  return 'INVALID';
}