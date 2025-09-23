import { prisma } from '@/prisma/prisma';

const HUBSPOT_CERTIFICATE_WEBHOOK_URL = process.env.HUBSPOT_CERTIFICATE_WEBHOOK_URL;

if (!HUBSPOT_CERTIFICATE_WEBHOOK_URL) {
  throw new Error('HUBSPOT_CERTIFICATE_WEBHOOK_URL environment variable is not set');
}

// Course name mapping for Codebase Entrepreneur courses only
const courseNameMapping: Record<string, string> = {
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
    // Only send webhook for Codebase Entrepreneur courses
    if (!courseId.startsWith('codebase-entrepreneur-')) {
      console.log(`Skipping HubSpot webhook for non-Codebase course: ${courseId}`);
      return;
    }

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

    const response = await fetch(HUBSPOT_CERTIFICATE_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      console.error('HubSpot Codebase certificate webhook failed:', response.status, await response.text());
    } else {
      console.log('HubSpot Codebase certificate webhook triggered successfully for:', email, 'Course:', courseName);
    }
  } catch (error) {
    // Don't throw - we don't want webhook failures to break certificate generation
    console.error('Error triggering HubSpot certificate webhook:', error);
  }
}
