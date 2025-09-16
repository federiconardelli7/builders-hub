"use client";

import { useViemChainStore } from "@/components/toolbox/stores/toolboxStore";
import { useWalletStore } from "@/components/toolbox/stores/walletStore";
import { useState } from "react";
import { Button } from "@/components/toolbox/components/Button";
import ProxyAdminABI from "@/contracts/openzeppelin-4.9/compiled/ProxyAdmin.json";
import TransparentUpgradeableProxyABI from "@/contracts/openzeppelin-4.9/compiled/TransparentUpgradeableProxy.json";
import { Container } from "@/components/toolbox/components/Container";
import { Steps, Step } from "fumadocs-ui/components/steps";
import { EVMAddressInput } from "@/components/toolbox/components/EVMAddressInput";
import { Callout } from "fumadocs-ui/components/callout";
import { CheckWalletRequirements } from "@/components/toolbox/components/CheckWalletRequirements";
import { WalletRequirementsConfigKey } from "@/components/toolbox/hooks/useWalletRequirements";
import { Checkbox } from "@/components/toolbox/components/Checkbox";
import useConsoleNotifications from "@/hooks/useConsoleNotifications";

const PROXYADMIN_SOURCE_URL = "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/proxy/transparent/ProxyAdmin.sol";
const TRANSPARENT_PROXY_SOURCE_URL = "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

export default function DeployProxyContract() {
    const [isDeployingProxyAdmin, setIsDeployingProxyAdmin] = useState(false);
    const [isDeployingProxy, setIsDeployingProxy] = useState(false);
    const [implementationAddress, setImplementationAddress] = useState<string>("");
    const [proxyAddress, setProxyAddress] = useState<string>("");
    const [proxyAdminAddress, setProxyAdminAddress] = useState<string>("");
    const viemChain = useViemChainStore();
    const [acknowledged, setAcknowledged] = useState(false);

    const { coreWalletClient, publicClient, walletEVMAddress } = useWalletStore();

    const { sendCoreWalletNotSetNotification, sendDeployProxyAdminNotifications, sendDeployTransparentProxyNotifications } = useConsoleNotifications();

    async function deployProxyAdmin() {
        if (!coreWalletClient) {
            sendCoreWalletNotSetNotification();
            return;
        }

        setIsDeployingProxyAdmin(true);
        setProxyAdminAddress("");

        const deployPromise = (async () => {
            if (!viemChain) throw new Error("Viem chain not found");
            await coreWalletClient.addChain({ chain: viemChain });
            await coreWalletClient.switchChain({ id: viemChain.id });
            const hash = await coreWalletClient.deployContract({
                abi: ProxyAdminABI.abi as any,
                bytecode: ProxyAdminABI.bytecode.object as `0x${string}`,
                chain: viemChain,
                account: walletEVMAddress as `0x${string}`
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            if (!receipt.contractAddress) {
                throw new Error('No contract address in receipt');
            }

            return { hash, address: receipt.contractAddress };
        })();

        sendDeployProxyAdminNotifications(deployPromise, viemChain!);

        try {
            const { address } = await deployPromise;
            setProxyAdminAddress(address);
        } finally {
            setIsDeployingProxyAdmin(false);
        }
    }

    async function deployTransparentProxy() {
        if (!coreWalletClient) {
            sendCoreWalletNotSetNotification();
            return;
        }

        setIsDeployingProxy(true);
        setProxyAddress("");

        const deployPromise = (async () => {
            if (!implementationAddress) throw new Error("Implementation address is required");
            if (!proxyAdminAddress) throw new Error("ProxyAdmin address is required");
            if (!viemChain) throw new Error("Viem chain not found");

            await coreWalletClient.addChain({ chain: viemChain });
            await coreWalletClient.switchChain({ id: viemChain.id });

            const hash = await coreWalletClient.deployContract({
                abi: TransparentUpgradeableProxyABI.abi as any,
                bytecode: TransparentUpgradeableProxyABI.bytecode.object as `0x${string}`,
                args: [implementationAddress, proxyAdminAddress, "0x"],
                chain: viemChain,
                account: walletEVMAddress as `0x${string}`
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            if (!receipt.contractAddress) {
                throw new Error('No contract address in receipt');
            }

            return { hash, address: receipt.contractAddress };
        })();

        sendDeployTransparentProxyNotifications(deployPromise, viemChain!);

        try {
            const { address } = await deployPromise;
            setProxyAddress(address);
        } finally {
            setIsDeployingProxy(false);
        }
    }

    return (
        <CheckWalletRequirements configKey={[
            WalletRequirementsConfigKey.EVMChainBalance,
        ]}>
            <Container
                title="Deploy Proxy Contracts"
                description="Deploy ProxyAdmin and TransparentUpgradeableProxy contracts to the EVM network."
            >
                <p className="my-3">
                    <a href="https://github.com/OpenZeppelin/openzeppelin-contracts/tree/release-v4.9/contracts/proxy/transparent"
                        target="_blank"
                        rel="noopener noreferrer">
                        OpenZeppelin's Transparent Proxy Pattern
                    </a> enables upgradeability of smart contracts while preserving state and contract addresses.
                </p>

                <p className="mb-3"><strong>How It Works:</strong> The proxy contract stores state and forwards function calls, while the implementation contract contains only the logic. The proxy admin manages implementation upgrades securely.</p>

                <Callout type="warn" className="mb-8">
                    <div className="space-y-3">
                        <p>
                            If you have created the L1 that you want to deploy the Validator Manager for with the Builder Console, a proxy contract is pre-deployed with the Genesis at the address <code>0xfacade...</code> and you can skip this step. You only need this tool if you want to use the validator manager on a different L1 or if you want to deploy a new proxy contract for any reason.
                        </p>
                        <Checkbox
                            label="I know what I'm doing"
                            checked={acknowledged}
                            onChange={setAcknowledged}
                        />
                    </div>
                </Callout>

                <Steps>
                    <Step>
                        <h2 className="text-lg font-semibold">Deploy Proxy Admin Contract</h2>
                        <p className="text-sm text-gray-500">
                            This will deploy the <code>ProxyAdmin</code> contract to the EVM network <code>{viemChain?.id}</code>. <code>ProxyAdmin</code> is used to manage upgrades to the implementation for the proxy contract. For production L1s this should be a multisig wallet, since it can take full control over the L1 validator set by arbitrarily changing the implementation of the ValidatorManager contract.
                        </p>
                        <p className="text-sm text-gray-500">
                            Contract source: <a href={PROXYADMIN_SOURCE_URL} target="_blank" rel="noreferrer">ProxyAdmin.sol</a> @ <code>v4.9.0</code>
                        </p>

                        <Button
                            variant="primary"
                            onClick={deployProxyAdmin}
                            loading={isDeployingProxyAdmin}
                            disabled={isDeployingProxyAdmin || !acknowledged}
                            className="mt-4"
                        >
                            Deploy Proxy Admin
                        </Button>

                        <p>Deployment Status: <code>{proxyAdminAddress || "Not deployed"}</code></p>
                    </Step>
                    <Step>
                        <h2 className="text-lg font-semibold">Deploy Transparent Proxy Contract</h2>
                        <p className="text-sm text-gray-500">
                            The proxy requires the <code>ProxyAdmin</code> contract at address: <code>{proxyAdminAddress || "Not deployed"}</code>
                        </p>
                        <p className="text-sm text-gray-500">
                            Contract source: <a href={TRANSPARENT_PROXY_SOURCE_URL} target="_blank" rel="noreferrer">TransparentUpgradeableProxy.sol</a> @ <code>v4.9.0</code>
                        </p>


                        <EVMAddressInput
                            label="Implementation Address"
                            value={implementationAddress}
                            onChange={setImplementationAddress}
                            placeholder="Enter implementation contract address (e.g. ValidatorManager or StakingManager)"
                            disabled={isDeployingProxy}
                        />

                        <Button
                            variant="primary"
                            onClick={deployTransparentProxy}
                            loading={isDeployingProxy}
                            disabled={isDeployingProxy || !proxyAdminAddress || !implementationAddress || !acknowledged}
                            className="mt-4"
                        >
                            Deploy Proxy Contract
                        </Button>
                        <p>Deployment Status: <code>{proxyAddress || "Not deployed"}</code></p>

                    </Step>
                </Steps>
            </Container>
        </CheckWalletRequirements>
    );
}
