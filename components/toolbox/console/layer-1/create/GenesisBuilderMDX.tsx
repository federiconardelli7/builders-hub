"use client";

import { useState } from "react";
import { GenesisHighlightProvider } from "@/components/toolbox/components/genesis/GenesisHighlightContext";
import GenesisBuilder from "./GenesisBuilder";
import { AllocationEntry } from "@/components/toolbox/components/genesis/types";

/**
 * Wrapper component for GenesisBuilder to be used in MDX files.
 * Provides the necessary GenesisHighlightProvider context.
 */
export default function GenesisBuilderMDX() {
    const [genesisData, setGenesisData] = useState<string>("");
    const [tokenAllocations, setTokenAllocations] = useState<AllocationEntry[]>([]);
    
    return (
        <GenesisHighlightProvider>
            <GenesisBuilder
                genesisData={genesisData}
                setGenesisData={setGenesisData}
                initiallyExpandedSections={["chainParams"]}
                tokenAllocations={tokenAllocations}
                setTokenAllocations={setTokenAllocations}
            />
        </GenesisHighlightProvider>
    );
}
