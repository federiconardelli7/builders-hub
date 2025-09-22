import { prisma } from '@/prisma/prisma';

const HUBSPOT_WEBHOOK_URL = process.env.HUBSPOT_LOGIN_WEBHOOK_URL || 'https://api-na1.hubapi.com/automation/v4/webhook-triggers/7522520/jKHKTkF';

export async function triggerLoginWebhook(userId: string, email: string, name: string, loginMethod: string = 'email_otp') {
  try {
    // Get additional user data if needed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      console.error('User not found for webhook trigger:', userId);
      return;
    }

    const webhookData = {
      recordId: parseInt(userId.replace(/\D/g, '').substring(0, 10)) || Date.now(), // Convert user ID to number
      eventType: 'user_login',
      timestamp: new Date().toISOString(),
      data: {
        name: name || user.name || 'User',
        email: email || user.email,
        action: 'login',
        userId: userId,
        loginMethod: loginMethod,
        ipAddress: '', // You would get this from the request context
        userAgent: '', // You would get this from the request headers
        accountCreated: user.createdAt.toISOString()
      }
    };

    const response = await fetch(HUBSPOT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      console.error('HubSpot webhook failed:', response.status, await response.text());
    } else {
      console.log('HubSpot login webhook triggered successfully for user:', email);
    }
  } catch (error) {
    // Don't throw - we don't want webhook failures to break login
    console.error('Error triggering HubSpot webhook:', error);
  }
}
