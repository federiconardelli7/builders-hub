"use client";

import { CreateChain } from "./CreateChain";
import { CheckWalletRequirements } from "@/components/toolbox/components/CheckWalletRequirements";
import { WalletRequirementsConfigKey } from "@/components/toolbox/hooks/useWalletRequirements";

/**
 * Wrapper component for CreateChain to be used in MDX files.
 * Sets the embedded prop to true to use single-column layout.
 * Wraps with CheckWalletRequirements to provide the ConnectedWalletProvider.
 */
export default function CreateChainMDX() {
    return (
        <CheckWalletRequirements configKey={WalletRequirementsConfigKey.PChainBalance}>
            <CreateChain embedded={true} />
        </CheckWalletRequirements>
    );
}
