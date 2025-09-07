import { BookOpen, ArrowLeftRight, Layers, Coins, Code } from 'lucide-react';

export interface CourseNode {
    id: string;
    name: string;
    description: string;
    slug: string;
    category: string;
    position: { x: number; y: number };
    dependencies?: string[];
    mobileOrder: number;
}

export const avalancheLearningPaths: CourseNode[] = [
    // Foundation Layer
    {
        id: "blockchain-fundamentals",
        name: "Blockchain Fundamentals",
        description: "Start here to learn about blockchain and solidity basics",
        slug: "blockchain-fundamentals",
        category: "Fundamentals",
        position: { x: 50, y: 0 },
        mobileOrder: 1
    },

    // Second Layer - Avalanche Fundamentals
    {
        id: "avalanche-fundamentals",
        name: "Avalanche Fundamentals",
        description: "Learn about Avalanche Consensus, Multi-Chain Architecture, and VMs",
        slug: "avalanche-fundamentals",
        category: "Fundamentals",
        dependencies: ["blockchain-fundamentals"],
        position: { x: 50, y: 150 },
        mobileOrder: 2
    },
    {
        id: "customizing-evm",
        name: "Customizing the EVM",
        description: "Add custom precompiles and configure the EVM",
        slug: "customizing-evm",
        category: "VM Customization",
        dependencies: ["avalanche-fundamentals"],
        position: { x: 85, y: 150 },
        mobileOrder: 6
    },

    // Third Layer - Branching paths
    {
        id: "interchain-messaging",
        name: "Interchain Messaging",
        description: "Build apps leveraging Avalanche's Interchain Messaging",
        slug: "interchain-messaging",
        category: "Interoperability",
        dependencies: ["avalanche-fundamentals"],
        position: { x: 15, y: 350 },
        mobileOrder: 3
    },
    {
        id: "l1-native-tokens",
        name: "L1 Native Tokens",
        description: "Design L1 economics with transaction fees and staking",
        slug: "l1-tokenomics",
        category: "L1 Tokenomics",
        dependencies: ["avalanche-fundamentals"],
        position: { x: 50, y: 350 },
        mobileOrder: 4
    },
    {
        id: "permissioned-l1s",
        name: "Permissioned L1s",
        description: "Create and manage permissioned blockchains with Proof of Authority",
        slug: "permissioned-l1s",
        category: "L1 Development",
        dependencies: ["avalanche-fundamentals"],
        position: { x: 85, y: 350 },
        mobileOrder: 7
    },
    // Fourth Layer - Advanced topics
    {
        id: "erc-20-bridging",
        name: "ERC-20 Bridging",
        description: "Transfer assets between chains using Interchain Messaging",
        slug: "interchain-token-transfer",
        category: "Interoperability",
        dependencies: ["interchain-messaging"],
        position: { x: 5, y: 550 },
        mobileOrder: 7
    },
    {
        id: "cross-chain-l1-native-tokens",
        name: "Cross-Chain L1 Native Tokens",
        description: "Bridge native tokens between L1 chains",
        slug: "interchain-token-transfer",
        category: "Interoperability",
        dependencies: ["erc-20-bridging", "l1-native-tokens"],
        position: { x: 20, y: 750 },
        mobileOrder: 8
    },
    {
        id: "permissionless-l1s",
        name: "Permissionless L1s",
        description: "Create and manage permissionless blockchains",
        slug: "permissioned-l1s",
        category: "L1 Development",
        dependencies: ["l1-native-tokens", "permissioned-l1s"],
        position: { x: 62, y: 550 },
        mobileOrder: 9
    },
    {
        id: "access-restriction",
        name: "Access Restriction",
        description: "Implement access control mechanisms for L1s",
        slug: "permissioned-l1s",
        category: "L1 Development",
        dependencies: ["permissioned-l1s"],
        position: { x: 95, y: 550 },
        mobileOrder: 10
    },
];

export const avalancheCategoryStyles = {
    "Fundamentals": {
        gradient: "from-blue-500 to-blue-600",
        icon: BookOpen,
        lightBg: "bg-blue-50",
        darkBg: "dark:bg-blue-950/30"
    },
    "Interoperability": {
        gradient: "from-purple-500 to-purple-600",
        icon: ArrowLeftRight,
        lightBg: "bg-purple-50",
        darkBg: "dark:bg-purple-950/30"
    },
    "L1 Development": {
        gradient: "from-emerald-500 to-emerald-600",
        icon: Layers,
        lightBg: "bg-emerald-50",
        darkBg: "dark:bg-emerald-950/30"
    },
    "L1 Tokenomics": {
        gradient: "from-red-400 to-red-500",
        icon: Coins,
        lightBg: "bg-red-50",
        darkBg: "dark:bg-red-950/30"
    },
    "VM Customization": {
        gradient: "from-orange-500 to-orange-600",
        icon: Code,
        lightBg: "bg-orange-50",
        darkBg: "dark:bg-orange-950/30"
    }
};
