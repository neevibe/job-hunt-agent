/**
 * APPLICATION SUBMISSION VERIFICATION ENGINE
 * 
 * Analyzes submission responses, confirmation emails, confirmation IDs,
 * and page signals to accurately classify application state.
 */

import { db } from '@/db';
import { application, applicationEvent, agentActivity } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface VerificationResult {
  isVerified: boolean;
  status: 'submitted' | 'submission_unconfirmed' | 'failed';
  confirmationId?: string;
  evidence: string;
}

const SUCCESS_INDICATORS = [
  'thank you for applying',
  'application submitted',
  'application received',
  'we have received your application',
  'successfully submitted',
  'your application is in review',
  'confirmation number',
  'reference number',
];

const FAILURE_INDICATORS = [
  'error submitting',
  'something went wrong',
  'submission failed',
  'please fill in all required fields',
  'captcha failed',
  'session expired',
];

/**
 * Verifies application submission from web response text or confirmation details
 */
export function verifySubmissionText(responseText: string): VerificationResult {
  const normalized = responseText.toLowerCase();

  for (const failure of FAILURE_INDICATORS) {
    if (normalized.includes(failure)) {
      return {
        isVerified: false,
        status: 'failed',
        evidence: `Failure indicator found: "${failure}"`,
      };
    }
  }

  for (const success of SUCCESS_INDICATORS) {
    if (normalized.includes(success)) {
      // Try to extract confirmation ID
      const idMatch = responseText.match(/(?:confirmation|reference|application)\s*(?:#|id|number)?\s*[:\-]?\s*([a-zA-Z0-9_-]{6,30})/i);
      const confirmationId = idMatch ? idMatch[1] : undefined;

      return {
        isVerified: true,
        status: 'submitted',
        confirmationId,
        evidence: `Success indicator confirmed: "${success}"`,
      };
    }
  }

  return {
    isVerified: false,
    status: 'submission_unconfirmed',
    evidence: 'No explicit confirmation message detected; requires verification check.',
  };
}

/**
 * Record a verified application event in the database
 */
export async function recordApplicationOutcome(
  applicationId: number,
  verification: VerificationResult
): Promise<void> {
  await db
    .update(application)
    .set({
      status: verification.status === 'submitted' ? 'applied' : verification.status,
      appliedAt: verification.status === 'submitted' ? new Date() : undefined,
      lastUpdated: new Date(),
      notes: verification.evidence,
    })
    .where(eq(application.id, applicationId));

  await db.insert(applicationEvent).values({
    applicationId,
    eventType: `verification_${verification.status}`,
    eventData: {
      isVerified: verification.isVerified,
      confirmationId: verification.confirmationId,
      evidence: verification.evidence,
    },
    timestamp: new Date(),
  });

  await db.insert(agentActivity).values({
    agentName: 'VerificationAgent',
    actionType: 'verify',
    message: `Application ${applicationId} verification: ${verification.status}`,
    details: { verification },
    severity: verification.status === 'submitted' ? 'info' : 'warning',
    timestamp: new Date(),
  });
}
