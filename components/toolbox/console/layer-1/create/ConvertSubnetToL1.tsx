"use client";

import { useCreateChainStore } from "@/components/toolbox/stores/createChainStore";
import { useWalletStore } from "@/components/toolbox/stores/walletStore";
import { useState, useEffect } from "react";
import { Button } from "@/components/toolbox/components/Button";
import { type ConvertToL1Validator } from "@/components/toolbox/components/ValidatorListInput";
import { ValidatorListInput } from "@/components/toolbox/components/ValidatorListInput";
import InputChainId from "@/components/toolbox/components/InputChainId";
import SelectSubnet, { SubnetSelection } from "@/components/toolbox/components/SelectSubnet";
import { Callout } from "fumadocs-ui/components/callout";
import { EVMAddressInput } from "@/components/toolbox/components/EVMAddressInput";
import { WalletRequirementsConfigKey } from "@/components/toolbox/hooks/useWalletRequirements";
import { BaseConsoleToolProps, ConsoleToolMetadata, withConsoleToolMetadata } from "../../../components/WithConsoleToolMetadata";
import { useConnectedWallet } from "@/components/toolbox/contexts/ConnectedWalletContext";
import useConsoleNotifications from "@/hooks/useConsoleNotifications";
import { generateConsoleToolGitHubUrl } from "@/components/toolbox/utils/github-url";

const metadata: ConsoleToolMetadata = {
    title: "Convert Subnet to L1",
    description: "Convert your existing Subnet to an L1 with validator management",
    toolRequirements: [
        WalletRequirementsConfigKey.PChainBalance
    ],
    githubUrl: generateConsoleToolGitHubUrl(import.meta.url)
};

function ConvertToL1({ onSuccess }: BaseConsoleToolProps) {
    const {
        subnetId: storeSubnetId,
        chainID: storeChainID,
        managerAddress: validatorManagerAddress,
        setManagerAddress: setValidatorManagerAddress,
        setConvertToL1TxId,
    } = useCreateChainStore()();

    const [selection, setSelection] = useState<SubnetSelection>({
        subnetId: storeSubnetId,
        subnet: null
    });
    const [validatorManagerChainID, setValidatorManagerChainID] = useState(storeChainID);
    const [validators, setValidators] = useState<ConvertToL1Validator[]>([]);

    const { pChainAddress, isTestnet } = useWalletStore();
    const pChainBalance = useWalletStore((s) => s.balances.pChain);
    const { coreWalletClient } = useConnectedWallet();

    const [isConverting, setIsConverting] = useState(false);
    
    const { sendCoreWalletNotSetNotification, notify } = useConsoleNotifications();

    async function handleConvertToL1() {
        setConvertToL1TxId("");
        setIsConverting(true);

        const convertSubnetToL1Tx = coreWalletClient.convertToL1({
            subnetId: selection.subnetId,
            chainId: validatorManagerChainID,
            managerAddress: validatorManagerAddress,
            subnetAuth: [0],
            validators
        });

        notify('convertToL1', convertSubnetToL1Tx);

        try {
            const txID = await convertSubnetToL1Tx;
            setConvertToL1TxId(txID);
            onSuccess?.();
        } finally {
            setIsConverting(false);
        }
    }

    return (
        <>
                <div className="space-y-4">
                    <SelectSubnet
                        value={selection.subnetId}
                        onChange={setSelection}
                        error={null}
                        onlyNotConverted={true}
                    />

                    <div>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Validator Manager</h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">With the conversion of the Subnet to an L1, the validator set of the L1 will be managed by a validator manager contract. This contract can implement Proof-of-Authority, Proof-of-Stake or any custom logic to determine the validator set. The contract can be deployed on a blockchain of the L1, the C-Chain or any other blockchain in the Avalanche network.</p>
                    </div>
                    <InputChainId
                        value={validatorManagerChainID}
                        onChange={setValidatorManagerChainID}
                        error={null}
                        label="Validator Manager Blockchain ID"
                        helperText="The ID of the blockchain where the validator manager contract is deployed. This can be a chain of the L1 itself, the C-Chain or any other blockchain in the Avalanche network."
                    />
                    <EVMAddressInput
                        value={validatorManagerAddress}
                        onChange={setValidatorManagerAddress}
                        label="Validator Manager Contract Address"
                        disabled={isConverting}
                        helperText="The address of the validator manager contract (or a proxy pointing for it) on the blockchain. This contract will manage the validator set of the L1. A chain created with the Toolbox will have a pre-deployed proxy contract at the address 0xfacade0000000000000000000000000000000000. After the conversion you can point this proxy to a reference implementation of the validator manager contract or a custom version of it."
                    />
                    <Callout type="info">
                        An <a href="https://docs.openzeppelin.com/contracts/4.x/api/proxy" target="_blank">OpenZeppelin TransparentUpgradeableProxy</a> contract is pre-deployed at the address <code>0xfacade...</code>. This proxy can be pointed to a reference implementation or customized version of the <a href="https://github.com/ava-labs/icm-contracts/tree/main/contracts/validator-manager" target="_blank">validator manager contract</a>.
                    </Callout>

                    <ValidatorListInput
                        validators={validators}
                        onChange={setValidators}
                        defaultAddress={pChainAddress}
                        label="Initial Validators"
                        description="Specify the initial validator set for the L1 below. You need to add at least one validator. If converting a pre-existing Subnet with validators, you must establish a completely new validator set for the L1 conversion. The existing Subnet validators cannot be transferred. For each new validator, you need to specify NodeID, the consensus weight, the initial balance and an address or a multi-sig that can deactivate the validator and that receives its remaining balance. The sum of the initial balances of the validators needs to be paid when issuing this transaction."
                        userPChainBalanceNavax={BigInt(pChainBalance * 1e9)}
                        selectedSubnetId={selection.subnetId}
                        isTestnet={isTestnet}
                    />

                    <Button
                        variant="primary"
                        onClick={handleConvertToL1}
                        disabled={!selection.subnetId || !validatorManagerAddress || validators.length === 0 || (selection.subnet?.isL1)}
                        loading={isConverting}
                    >
                        {selection.subnet?.isL1 ? "Subnet Already Converted to L1" : "Convert to L1"}
                    </Button>
                </div>

        </>
    );
}

export default withConsoleToolMetadata(ConvertToL1, metadata);
