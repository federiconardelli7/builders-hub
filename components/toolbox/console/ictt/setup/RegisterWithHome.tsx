"use client";

import {
  useL1ByChainId,
  useSelectedL1,
} from "@/components/toolbox/stores/l1ListStore";
import {
  useToolboxStore,
  useViemChainStore,
} from "@/components/toolbox/stores/toolboxStore";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/toolbox/components/Button";
import { Success } from "@/components/toolbox/components/Success";
import ERC20TokenRemoteABI from "@/contracts/icm-contracts/compiled/ERC20TokenRemote.json";
import ERC20TokenHomeABI from "@/contracts/icm-contracts/compiled/ERC20TokenHome.json";
import { Abi, createPublicClient, http, PublicClient, zeroAddress } from "viem";
import { Suggestion } from "@/components/toolbox/components/Input";
import { EVMAddressInput } from "@/components/toolbox/components/EVMAddressInput";
import { utils } from "@avalabs/avalanchejs";
import { ListContractEvents } from "@/components/toolbox/components/ListContractEvents";
import SelectBlockchainId from "@/components/toolbox/components/SelectBlockchainId";
import { generateConsoleToolGitHubUrl } from "@/components/toolbox/utils/github-url";
import useConsoleNotifications from "@/hooks/useConsoleNotifications";
import { useWalletStore } from "@/components/toolbox/stores/walletStore";
import { ConsoleToolMetadata, withConsoleToolMetadata } from "@/components/toolbox/components/WithConsoleToolMetadata";
import { WalletRequirementsConfigKey } from "@/components/toolbox/hooks/useWalletRequirements";

const metadata: ConsoleToolMetadata = {
  title: "Register Remote Contract with Home",
  description: "Register the remote contract with the home contract.",
  toolRequirements: [WalletRequirementsConfigKey.EVMChainBalance],
  githubUrl: generateConsoleToolGitHubUrl(import.meta.url)
};

function RegisterWithHome() {
  const [criticalError, setCriticalError] = useState<Error | null>(null);
  const { erc20TokenRemoteAddress, nativeTokenRemoteAddress } =
    useToolboxStore();
  const [remoteAddress, setRemoteAddress] = useState("");
  const { coreWalletClient } = useWalletStore();
  const { notify } = useConsoleNotifications();
  const viemChain = useViemChainStore();
  const selectedL1 = useSelectedL1()();
  const [sourceChainId, setSourceChainId] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [lastTxId, setLastTxId] = useState<string>();
  const [localError, setLocalError] = useState("");
  const [homeContractAddress, setHomeContractAddress] = useState<string | null>(
    null
  );
  const [homeContractClient, setHomeContractClient] =
    useState<PublicClient | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);

  // Throw critical errors during render
  if (criticalError) {
    throw criticalError;
  }

  const sourceL1 = useL1ByChainId(sourceChainId)();

  let sourceChainError: string | undefined = undefined;
  if (!sourceChainId) {
    sourceChainError = "Please select a source chain";
  } else if (selectedL1?.id === sourceChainId) {
    sourceChainError = "Source and destination chains must be different";
  }

  // Move fetchSettings outside useEffect and wrap in useCallback for stable reference
  const fetchSettings = useCallback(async () => {
    if (isCheckingRegistration || !remoteAddress || !sourceChainId) return;
    setIsCheckingRegistration(true);
    try {
      if (!viemChain || !sourceL1?.rpcUrl || !selectedL1?.id) return;

      const remotePublicClient = createPublicClient({
        chain: viemChain,
        transport: http(viemChain.rpcUrls.default.http[0]),
      });

      const homePublicClient = createPublicClient({
        transport: http(sourceL1.rpcUrl),
      });

      setHomeContractClient(homePublicClient);

      const tokenHomeAddress = await remotePublicClient.readContract({
        address: remoteAddress as `0x${string}`,
        abi: ERC20TokenRemoteABI.abi,
        functionName: "getTokenHomeAddress",
      });

      setHomeContractAddress(tokenHomeAddress as string);

      // Convert CURRENT chain ID to hex for the contract call
      // This is where the remote contract is deployed
      const remoteBlockchainIDHex = utils.bufferToHex(
        utils.base58check.decode(selectedL1.id)
      );

      const remoteSettings = (await homePublicClient.readContract({
        address: tokenHomeAddress as `0x${string}`,
        abi: ERC20TokenHomeABI.abi,
        functionName: "getRemoteTokenTransferrerSettings",
        args: [remoteBlockchainIDHex, remoteAddress],
      })) as {
        registered: boolean;
        collateralNeeded: bigint;
        tokenMultiplier: bigint;
        multiplyOnRemote: boolean;
      };

      console.log({ remoteSettings });
      setIsRegistered(remoteSettings.registered);
    } catch (error: any) {
      console.error("Error fetching token home address:", error);
      setLocalError(
        `Error fetching token home address: ${
          error.shortMessage || error.message
        }`
      );
      setHomeContractAddress(null);
    } finally {
      setIsCheckingRegistration(false);
    }
  }, [
    remoteAddress,
    sourceChainId,
    viemChain?.id,
    sourceL1?.rpcUrl,
    selectedL1?.id,
  ]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleRegister() {
    setLocalError("");

    if (!coreWalletClient || !coreWalletClient.account) {
      setLocalError("Core wallet not found");
      return;
    }

    if (!remoteAddress) {
      setLocalError("Please enter a valid remote contract address");
      return;
    }

    if (!viemChain) {
      setLocalError("Current chain configuration is missing");
      return;
    }

    setIsRegistering(true);
    setLastTxId(undefined);

    try {
      const publicClient = createPublicClient({
        chain: viemChain,
        transport: http(viemChain.rpcUrls.default.http[0]),
      });

      const feeInfo: readonly [`0x${string}`, bigint] = [zeroAddress, 0n]; // feeTokenAddress, amount

      console.log(
        `Calling registerWithHome on ${remoteAddress} with feeInfo:`,
        feeInfo
      );

      // Simulate the transaction first
      const { request } = await publicClient.simulateContract({
        address: remoteAddress as `0x${string}`,
        abi: ERC20TokenRemoteABI.abi,
        functionName: "registerWithHome",
        args: [feeInfo],
        chain: viemChain,
        account: coreWalletClient.account,
      });

      // Send the transaction
      const writePromise = coreWalletClient.writeContract(request);
      notify(
        {
          type: "call",
          name: "Register With Home",
        },
        writePromise,
        viemChain ?? undefined
      );
      const hash = await writePromise;
      setLastTxId(hash);

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });
      setLocalError("");
    } catch (error: any) {
      console.error("Registration failed:", error);
      setLocalError(
        `Registration failed: ${error.shortMessage || error.message}`
      );
      setCriticalError(
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setIsRegistering(false);
    }
  }

  const remoteAddressSuggestions: Suggestion[] = useMemo(() => {
    const result: Suggestion[] = [];
    if (erc20TokenRemoteAddress) {
      result.push({
        title: erc20TokenRemoteAddress,
        value: erc20TokenRemoteAddress,
        description: "ERC20 Token Remote Address",
      });
    }
    if (nativeTokenRemoteAddress) {
      result.push({
        title: nativeTokenRemoteAddress,
        value: nativeTokenRemoteAddress,
        description: "Native Token Remote Address",
      });
    }
    return result;
  }, [erc20TokenRemoteAddress, nativeTokenRemoteAddress]);

  return (
    <>
      <div>
        <p className="mt-2">
          This will call the `registerWithHome` function on the remote contract
          on the current chain ({selectedL1?.name}). This links the remote
          bridge back to the home bridge on the source chain.
        </p>
      </div>

      <SelectBlockchainId
        label="Source Chain (where token home is deployed)"
        value={sourceChainId}
        onChange={(value) => setSourceChainId(value)}
        error={sourceChainError}
      />

      <EVMAddressInput
        label={`Remote Contract Address (on ${selectedL1?.name})`}
        value={remoteAddress}
        onChange={setRemoteAddress}
        disabled={isRegistering}
        suggestions={remoteAddressSuggestions}
        helperText={
          !remoteAddress ? "Please enter a remote contract address" : undefined
        }
      />

      {localError && (
        <div className="text-red-500 mt-2 p-2 border border-red-300 rounded">
          {localError}
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleRegister}
        loading={isRegistering}
        disabled={
          isRegistering ||
          !remoteAddress ||
          !sourceChainId ||
          !!sourceChainError ||
          isRegistered ||
          isCheckingRegistration
        }
      >
        Register Remote with Home
      </Button>

      {lastTxId && (
        <div className="space-y-2">
          <Success label="Registration Transaction ID" value={lastTxId ?? ""} />
        </div>
      )}

      {isCheckingRegistration && (
        <div className="text-gray-500">⏳ Checking registration status...</div>
      )}

      {!isCheckingRegistration && isRegistered && (
        <div>✅ Remote contract is registered with the Home contract</div>
      )}

      {!isCheckingRegistration &&
        !isRegistered &&
        sourceChainId &&
        remoteAddress && (
          <div>
            ⚠️ Remote contract is not yet registered with the Home contract. ICM
            message needs a few seconds to be processed.
            <button
              className="underline text-blue-500 px-1 py-0 h-auto"
              onClick={fetchSettings}
              disabled={isCheckingRegistration}
            >
              Refresh
            </button>
          </div>
        )}

      {homeContractAddress && homeContractClient && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <ListContractEvents
            contractAddress={homeContractAddress}
            contractABI={ERC20TokenHomeABI.abi as Abi}
            publicClient={homeContractClient}
            title={`Events from Home Contract (on ${sourceL1?.name})`}
          />
        </div>
      )}
    </>
  );
}

export default withConsoleToolMetadata(RegisterWithHome, metadata);