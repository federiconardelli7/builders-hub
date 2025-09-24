"use client";

import { CreateChain } from "./CreateChain";

/**
 * Wrapper component for CreateChain to be used in MDX files.
 * Sets the embedded prop to true to use single-column layout.
 */
export default function CreateChainMDX() {
    return <CreateChain embedded={true} />;
}
