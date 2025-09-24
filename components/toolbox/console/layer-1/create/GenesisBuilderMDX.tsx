"use client";

import { useState } from "react";
import { GenesisHighlightProvider } from "@/components/toolbox/components/genesis/GenesisHighlightContext";
import GenesisBuilder from "./GenesisBuilder";

/**
 * Wrapper component for GenesisBuilder to be used in MDX files.
 * Provides the necessary GenesisHighlightProvider context.
 */
export default function GenesisBuilderMDX() {
    const [genesisData, setGenesisData] = useState<string>("");
    
    return (
        <GenesisHighlightProvider>
            <GenesisBuilder
                genesisData={genesisData}
                setGenesisData={setGenesisData}
                initiallyExpandedSections={["chainParams"]}
            />
        </GenesisHighlightProvider>
    );
}
