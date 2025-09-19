"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "@/components/toolbox/stores/walletStore";
import { Button } from "@/components/toolbox/components/Button";
import InputSubnetId from "@/components/toolbox/components/InputSubnetId";
import BlockchainDetailsDisplay from "@/components/toolbox/components/BlockchainDetailsDisplay";
import { getBlockchainInfo, getSubnetInfo } from "@/components/toolbox/coreViem/utils/glacier";
import { networkIDs } from "@avalabs/avalanchejs";
import { useManagedTestnetNodes } from "@/hooks/useManagedTestnetNodes";
import { NodeRegistration, RegisterSubnetResponse } from "./types";
import { useWallet } from "@/components/toolbox/hooks/useWallet";
import { Wallet } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/toolbox/components/AlertDialog";
import { Steps, Step } from 'fumadocs-ui/components/steps';
import Link from 'next/link';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import useConsoleNotifications from "@/hooks/useConsoleNotifications";

export default function CreateManagedTestnetNode() {
    const { avalancheNetworkID } = useWalletStore();
    const { createNode, fetchNodes, nodes } = useManagedTestnetNodes();
    const { addChain } = useWallet();
    const { notify } = useConsoleNotifications();

    const [subnetId, setSubnetId] = useState("");
    const [selectedBlockchainId, setSelectedBlockchainId] = useState("");
    const [subnet, setSubnet] = useState<any>(null);
    const [blockchainInfo, setBlockchainInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [subnetIdError, setSubnetIdError] = useState<string | null>(null);
    const [createdResponse, setCreatedResponse] = useState<RegisterSubnetResponse | null>(null);
    const [createdNode, setCreatedNode] = useState<NodeRegistration | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [secondsUntilWalletEnabled, setSecondsUntilWalletEnabled] = useState<number>(0);
    const [isConnecting, setIsConnecting] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorTitle, setErrorTitle] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setSubnetIdError(null);
        setSubnet(null);
        setBlockchainInfo(null);
        setSelectedBlockchainId("");
        if (!subnetId) return;

        const abortController = new AbortController();
        setIsLoading(true);

        const loadSubnetData = async () => {
            try {
                const subnetInfo = await getSubnetInfo(subnetId, abortController.signal);
                if (abortController.signal.aborted) return;
                setSubnet(subnetInfo);
                if (subnetInfo.blockchains && subnetInfo.blockchains.length > 0) {
                    const blockchainId = subnetInfo.blockchains[0].blockchainId;
                    setSelectedBlockchainId(blockchainId);
                    const chainInfo = await getBlockchainInfo(blockchainId, abortController.signal);
                    if (abortController.signal.aborted) return;
                    setBlockchainInfo(chainInfo);
                }
            } catch (error) {
                if (!abortController.signal.aborted) {
                    setSubnetIdError((error as Error).message);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadSubnetData();
        return () => abortController.abort();
    }, [subnetId]);

    useEffect(() => {
        if (createdResponse && nodes.length > 0) {
            const node = nodes.find(n => n.node_id === createdResponse.nodeID && n.subnet_id === subnetId);
            if (node) {
                setCreatedNode(node);
            }
        }
    }, [nodes, createdResponse, subnetId]);

    useEffect(() => {
        if (!createdNode) return;
        const createdAtMs = new Date(createdNode.created_at).getTime();
        const elapsedSeconds = Math.floor((Date.now() - createdAtMs) / 1000);
        const initialRemaining = Math.max(0, 10 - elapsedSeconds);
        setSecondsUntilWalletEnabled(initialRemaining);

        if (initialRemaining === 0) return;

        const intervalId = setInterval(() => {
            setSecondsUntilWalletEnabled(prev => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [createdNode]);

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            const createNodePromise = createNode(subnetId, selectedBlockchainId);
            notify({
                name: "Testnet Node Creation",
                type: "local"
            }, createNodePromise);
            const response = await createNodePromise
            setCreatedResponse(response);
            await fetchNodes();
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            setErrorTitle("Creation Failed");
            setErrorMessage(msg);
            setErrorOpen(true);
        } finally {
            setIsCreating(false);
        }
    };

    const handleAddToWallet = async () => {
        if (!createdNode) return;
        setIsConnecting(true);
        try {
            await addChain({
                rpcUrl: createdNode.rpc_url,
                allowLookup: false
            });
        } catch (error) {
            setErrorTitle("Add to Wallet Failed");
            setErrorMessage(error instanceof Error ? error.message : 'Failed to add to wallet');
            setErrorOpen(true);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-end mb-6">
                <Link href="/console/testnet-infra/nodes" className="text-blue-600 hover:underline">
                    View all managed nodes
                </Link>
            </div>
            <Steps>
                <Step>
                    <h2 className="text-lg font-semibold">Step 1: Select Subnet</h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Enter the Subnet ID of the blockchain you want to create a node for.
                    </p>
                    <InputSubnetId value={subnetId} onChange={setSubnetId} error={subnetIdError} />
                    {subnet && subnet.blockchains && subnet.blockchains.length > 0 && (
                        <div className="space-y-4 mt-6">
                            {subnet.blockchains.map((blockchain: any) => (
                                <BlockchainDetailsDisplay
                                    key={blockchain.blockchainId}
                                    blockchain={{ ...blockchain, isTestnet: avalancheNetworkID === networkIDs.FujiID }}
                                    isLoading={isLoading}
                                    customTitle={`${blockchain.blockchainName} Blockchain Details`}
                                />
                            ))}
                        </div>
                    )}
                </Step>

                <Step>
                    <h2 className="text-lg font-semibold">Step 2: Create Node</h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Review the details and create your managed testnet node.
                    </p>
                    <Button 
                        onClick={handleCreate} 
                        loading={isCreating}
                        disabled={!subnetId || !blockchainInfo || isCreating}
                    >
                        Create Node
                    </Button>
                </Step>

                <Step>
                    <h2 className="text-lg font-semibold">Step 3: Add to Wallet</h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Add the new node's RPC to your wallet.
                    </p>
                    {createdNode && (
                        <div className="mb-6">
                            <p className="mb-2">RPC URL:</p>
                            <CodeBlock allowCopy>
                                <Pre>{createdNode.rpc_url}</Pre>
                            </CodeBlock>
                        </div>
                    )}
                    <Button
                        onClick={handleAddToWallet}
                        disabled={!createdNode || secondsUntilWalletEnabled > 0 || isConnecting}
                        loading={isConnecting}
                    >
                        <Wallet className="mr-2 h-4 w-4" />
                        {secondsUntilWalletEnabled > 0
                            ? `Wait ${secondsUntilWalletEnabled}s`
                            : "Add to Wallet"}
                    </Button>
                </Step>
            </Steps>

            <AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{errorTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button onClick={() => setErrorOpen(false)}>OK</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
