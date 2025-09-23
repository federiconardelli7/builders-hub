import { prisma } from '@/prisma/prisma';

const HUBSPOT_CERTIFICATE_WEBHOOK_URL = process.env.HUBSPOT_CERTIFICATE_WEBHOOK_URL || 'https://api-na1.hubapi.com/automation/v4/webhook-triggers/7522520/nELpaOw';

// Course name mapping to match what's in the certificate route
const courseNameMapping: Record<string, string> = {
  // Regular Academy courses
  'avalanche-fundamentals': 'Avalanche Fundamentals',
  'blockchain-fundamentals': 'Blockchain Fundamentals',
  'interchain-messaging': 'Interchain Messaging',
  'interchain-token-transfer': 'Interchain Token Transfer',
  'customizing-evm': 'Customizing EVM',
  'avacloudapis': 'AvaCloud APIs',
  'solidity-foundry': 'Solidity & Foundry',
  'icm-chainlink': 'ICM Chainlink',
  'l1-tokenomics': 'L1 Tokenomics',
  'l1-validator-management': 'L1 Validator Management',
  'permissioned-l1s': 'Permissioned L1s',
  'l1-native-tokenomics': 'L1 Native Tokenomics',
  'encrypted-erc': 'Encrypted ERC',
  // Codebase Entrepreneur courses
  'codebase-entrepreneur-foundations': 'Foundations of a Web3 Venture',
  'codebase-entrepreneur-go-to-market': 'Go-to-Market Strategist',
  'codebase-entrepreneur-community': 'Web3 Community Architect',
  'codebase-entrepreneur-fundraising': 'Fundraising & Finance Pro',
};

export async function triggerCertificateWebhook(
  userId: string, 
  email: string, 
  fullName: string,
  courseId: string
) {
  try {
    // Parse the full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Get the proper course name
    const courseName = courseNameMapping[courseId] || courseId;

    const webhookData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      courseName: courseName,
      courseCompletionDate: new Date().toISOString()
    };

    const response = await fetch(HUBSPOT_CERTIFICATE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      console.error('HubSpot certificate webhook failed:', response.status, await response.text());
    } else {
      console.log('HubSpot certificate webhook triggered successfully for:', email, 'Course:', courseName);
    }
  } catch (error) {
    // Don't throw - we don't want webhook failures to break certificate generation
    console.error('Error triggering HubSpot certificate webhook:', error);
  }
}
