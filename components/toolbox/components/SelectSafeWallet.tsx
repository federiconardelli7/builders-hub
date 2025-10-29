import { Input, type Suggestion } from "./Input";
import { useMemo, useState, useEffect } from "react";
import { useWalletStore } from "../stores/walletStore";
import { useViemChainStore } from "../stores/toolboxStore";
import { useSafeAPI, SafesByOwnerResponse, AllSafesInfoResponse } from "../hooks/useSafeAPI";

export type SafeSelection = {
  safeAddress: string;
  threshold: number;
  owners: string[];
}

/**
 * SelectSafeWallet Component
 * 
 * A component for selecting an Ash Wallet (Safe) address with integrated suggestions.
 * Automatically fetches Ash Wallet accounts owned by the current wallet address.
 * 
 * @example
 * // Basic usage
 * const [selection, setSelection] = useState<SafeSelection>({ 
 *   safeAddress: '', 
 *   threshold: 0, 
 *   owners: [] 
 * });
 * 
 * <SelectSafeWallet 
 *   value={selection.safeAddress}
 *   onChange={setSelection}
 * />
 * 
 * @example
 * // With error handling
 * <SelectSafeWallet
 *   value={selection.safeAddress}
 *   onChange={setSelection}
 *   error={safeAddressError}
 * />
 * 
 * @param props
 * @param props.value - Current Ash Wallet address value
 * @param props.onChange - Callback function that receives an object with safeAddress, threshold, and owners
 * @param props.error - Optional error message to display
 */
export default function SelectSafeWallet({
  value,
  onChange,
  error
}: {
  value: string,
  onChange: (selection: SafeSelection) => void,
  error?: string | null
}) {
  const { walletEVMAddress } = useWalletStore();
  const viemChain = useViemChainStore();
  const { callSafeAPI } = useSafeAPI();
  const [safes, setSafes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [safeDetails, setSafeDetails] = useState<Record<string, SafeSelection>>({});
  const [isFetchingManualAddress, setIsFetchingManualAddress] = useState(false);

  // Fetch Ash Wallet accounts from the backend API
  useEffect(() => {
    const fetchSafes = async () => {
      if (!walletEVMAddress || !viemChain) return;

      setIsLoading(true);
      try {
        // Get Ash Wallet accounts owned by the current address
        const safesByOwner = await callSafeAPI<SafesByOwnerResponse>('getSafesByOwner', {
          chainId: viemChain.id.toString(),
          ownerAddress: walletEVMAddress
        });

        const safeAddresses = safesByOwner.safes || [];
        setSafes(safeAddresses);

        // Fetch details for all Ash Wallets in a single call
        if (safeAddresses.length > 0) {
          const allSafesInfo = await callSafeAPI<AllSafesInfoResponse>('getAllSafesInfo', {
            chainId: viemChain.id.toString(),
            safeAddresses: safeAddresses
          });

          const details: Record<string, SafeSelection> = {};
          for (const safeAddress of safeAddresses) {
            const safeInfo = allSafesInfo.safeInfos[safeAddress];
            if (safeInfo) {
              details[safeAddress] = {
                safeAddress,
                threshold: safeInfo.threshold,
                owners: safeInfo.owners
              };
            } else if (allSafesInfo.errors?.[safeAddress]) {
              console.warn(`Failed to fetch details for Ash Wallet ${safeAddress}:`, allSafesInfo.errors[safeAddress]);
            }
          }
          setSafeDetails(details);
        }

      } catch (error) {
        console.error("Error fetching Ash Wallet accounts:", error);
        setSafes([]);
        setSafeDetails({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafes();
  }, [walletEVMAddress, viemChain?.id]);

  // Fetch details for manually entered Safe address
  useEffect(() => {
    const fetchManualSafeDetails = async () => {
      // Only fetch if:
      // 1. We have a value
      // 2. It looks like an address (starts with 0x and has reasonable length)
      // 3. We don't already have details for this address
      // 4. We're not currently loading the owned safes
      if (!value || !viemChain || safeDetails[value] || isLoading) return;
      if (!value.startsWith('0x') || value.length !== 42) return;

      setIsFetchingManualAddress(true);
      try {
        const allSafesInfo = await callSafeAPI<AllSafesInfoResponse>('getAllSafesInfo', {
          chainId: viemChain.id.toString(),
          safeAddresses: [value]
        });

        const safeInfo = allSafesInfo.safeInfos[value];
        if (safeInfo) {
          setSafeDetails(prev => ({
            ...prev,
            [value]: {
              safeAddress: value,
              threshold: safeInfo.threshold,
              owners: safeInfo.owners
            }
          }));
          // Trigger onChange with the fetched details
          onChange({
            safeAddress: value,
            threshold: safeInfo.threshold,
            owners: safeInfo.owners
          });
        } else if (allSafesInfo.errors?.[value]) {
          console.warn(`Failed to fetch details for manually entered Ash Wallet ${value}:`, allSafesInfo.errors[value]);
        }
      } catch (error) {
        console.error("Error fetching manually entered Ash Wallet details:", error);
      } finally {
        setIsFetchingManualAddress(false);
      }
    };

    fetchManualSafeDetails();
  }, [value, viemChain?.id, isLoading]);

  const safeSuggestions: Suggestion[] = useMemo(() => {
    const result: Suggestion[] = [];

    for (const safeAddress of safes) {
      const details = safeDetails[safeAddress];
      if (details) {
        const isSelected = safeAddress === value;
        const ownersCount = details.owners.length;
        const threshold = details.threshold;

        result.push({
          title: `${safeAddress}${isSelected ? " ✓" : ""}`,
          value: safeAddress,
          description: `${threshold}/${ownersCount} multisig${isSelected ? " (Selected)" : ""}`
        });
      } else {
        // Fallback if details aren't loaded yet
        result.push({
          title: safeAddress,
          value: safeAddress,
          description: "Loading details..."
        });
      }
    }

    return result;
  }, [safes, safeDetails, value]);

  // Handle value change
  const handleValueChange = (newValue: string) => {
    const details = safeDetails[newValue];
    if (details) {
      onChange(details);
    } else {
      // If details aren't available yet, provide basic structure
      onChange({
        safeAddress: newValue,
        threshold: 0,
        owners: []
      });
    }
  };

  return <Input
    label="Ash Wallet Address"
    value={value}
    onChange={handleValueChange}
    suggestions={safeSuggestions}
    error={error}
    placeholder={
      isLoading 
        ? "Loading Ash Wallet accounts..." 
        : isFetchingManualAddress 
        ? "Loading Safe details..." 
        : "Enter Ash Wallet address or select from your accounts"
    }
  />
} 
