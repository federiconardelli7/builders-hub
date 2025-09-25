import { Dispatch, SetStateAction } from 'react';
import { SectionWrapper } from '../SectionWrapper';
import AllowlistPrecompileConfigurator from '../AllowlistPrecompileConfigurator';
import { AllowlistPrecompileConfig } from '../types';

type PermissionsSectionProps = {
    deployerConfig: AllowlistPrecompileConfig;
    setDeployerConfig: Dispatch<SetStateAction<AllowlistPrecompileConfig>>;
    txConfig: AllowlistPrecompileConfig;
    setTxConfig: Dispatch<SetStateAction<AllowlistPrecompileConfig>>;
    isExpanded: boolean;
    toggleExpand: () => void;
    validationErrors: { [key: string]: string };
    compact?: boolean;
};

export const PermissionsSection = ({
    deployerConfig,
    setDeployerConfig,
    txConfig,
    setTxConfig,
    isExpanded,
    toggleExpand,
    validationErrors,
    compact
}: PermissionsSectionProps) => {
    return (
        <SectionWrapper
            title="Permissions"
            description={compact ? "" : "Optional permissioning for transaction submitters and contract deployers."}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            sectionId="permissions"
            compact={compact}
            variant="flat"
        >
            <div className="space-y-6">

                {/* Contract Deployer Allowlist */}

                <AllowlistPrecompileConfigurator
                    title="Contract Deployer Allowlist"
                    description={compact ? "" : "Restrict which addresses can deploy smart contracts. Configure Admin, Manager, and Enabled roles with different permission levels."}
                    precompileAction="deploy contracts"
                    config={deployerConfig}
                    onUpdateConfig={setDeployerConfig}
                    radioOptionFalseLabel="Anyone can deploy contracts."
                    radioOptionTrueLabel="Only approved addresses can deploy contracts."
                    validationError={validationErrors.contractDeployerAllowList}
                />


                {/* Transaction Allowlist */}

                <AllowlistPrecompileConfigurator
                    title="Transaction Allowlist"
                    description={compact ? "" : "Control which addresses can submit transactions. Assign Admin, Manager, and Enabled roles with varying permissions."}
                    precompileAction="submit transactions"
                    config={txConfig}
                    onUpdateConfig={setTxConfig}
                    radioOptionFalseLabel="Anyone can submit transactions."
                    radioOptionTrueLabel="Only approved addresses can submit transactions."
                    validationError={validationErrors.txAllowList}
                />

            </div>
        </SectionWrapper>
    );
}; 