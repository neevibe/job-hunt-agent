/**
 * CANDIDATE DB SYNC
 * 
 * Ensures the candidate profile from candidate-dna.ts is persisted
 * into the PostgreSQL database so foreign keys and relations resolve cleanly.
 */

import { db } from '@/db';
import { candidate, experience, candidateSkill, autonomousConfig } from '@/db/schema';
import { getCandidateDNA } from '@/lib/candidate-dna';
import { eq } from 'drizzle-orm';

export async function ensureCandidateInDB(candidateId: number = 1) {
  try {
    const existing = await db.query.candidate.findFirst({
      where: (c, { eq }) => eq(c.id, candidateId),
    });

    if (existing) {
      return existing;
    }

    const dna = getCandidateDNA();
    const currentExp = dna.experiences[0];

    const [newCandidate] = await db
      .insert(candidate)
      .values({
        id: candidateId,
        name: dna.name,
        email: dna.email,
        phone: dna.phone,
        location: dna.location,
        linkedinUrl: dna.linkedinUrl,
        portfolioUrl: dna.portfolioUrl,
        githubUrl: dna.githubUrl,
        preferredLocations: dna.preferredLocations,
        remotePreference: dna.remotePreference,
        compensationMin: dna.compensationMin,
        compensationMax: dna.compensationMax,
        compensationCurrency: dna.compensationCurrency,
        noticePeriod: dna.noticePeriod,
      })
      .returning();

    // Seed autonomous config
    await db.insert(autonomousConfig).values({
      candidateId: newCandidate.id,
      isEnabled: true,
      dailyApplicationLimit: 100,
      minimumMatchScore: 75,
      autoApplyThreshold: 85,
      humanReviewThreshold: 65,
      targetLocations: ['Bengaluru', 'Mumbai', 'Hyderabad', 'Remote'],
      targetTitles: ['AI Product Manager', 'GenAI Product Manager', 'Product Manager AI', 'AI Product Lead'],
      autoSubmitEnabled: false,
    }).onConflictDoNothing();

    console.log('✅ Candidate synchronized to database.');
    return newCandidate;
  } catch (err) {
    console.warn('Candidate sync note:', err);
    return null;
  }
}
