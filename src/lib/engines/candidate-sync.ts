/**
 * CANDIDATE DB SYNC
 * 
 * Ensures the candidate profile from candidate-dna.ts is persisted
 * into the PostgreSQL database so foreign keys and relations resolve cleanly.
 */

import { db } from '@/db';
import { candidate, experience, achievement, candidateSkill, autonomousConfig } from '@/db/schema';
import { getCandidateDNA } from '@/lib/candidate-dna';
import { eq } from 'drizzle-orm';

export async function ensureCandidateInDB(candidateId: number = 1) {
  try {
    const dna = getCandidateDNA();

    let existing = await db.query.candidate.findFirst({
      where: (c, { eq }) => eq(c.id, candidateId),
    });

    if (!existing) {
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
      existing = newCandidate;
    }

    // Seed autonomous config
    await db.insert(autonomousConfig).values({
      candidateId,
      isEnabled: true,
      dailyApplicationLimit: 100,
      minimumMatchScore: 75,
      autoApplyThreshold: 85,
      humanReviewThreshold: 65,
      targetLocations: ['Bengaluru', 'Mumbai', 'Hyderabad', 'Remote'],
      targetTitles: ['AI Product Manager', 'GenAI Product Manager', 'Product Manager AI', 'AI Product Lead'],
      autoSubmitEnabled: false,
    }).onConflictDoNothing();

    // Check experiences in DB
    const existingExps = await db.query.experience.findMany({
      where: (e, { eq }) => eq(e.candidateId, candidateId),
    });

    if (existingExps.length < dna.experiences.length) {
      for (const exp of dna.experiences) {
        const alreadyHas = existingExps.some(e => e.company === exp.company);
        if (!alreadyHas) {
          const [insertedExp] = await db.insert(experience).values({
            candidateId,
            company: exp.company,
            jobTitle: exp.jobTitle,
            startDate: exp.startDate,
            endDate: exp.endDate,
            isCurrent: exp.isCurrent,
            responsibilities: exp.responsibilities,
            productsOwned: exp.productsOwned,
            problemsSolved: exp.problemsSolved,
            technologies: exp.technologies,
            aiExposure: exp.aiExposure,
            dataExposure: exp.dataExposure,
            leadership: exp.leadership,
            businessImpact: exp.businessImpact,
            productImpact: exp.productImpact,
          }).returning();

          if (exp.achievements && exp.achievements.length > 0) {
            for (const ach of exp.achievements) {
              await db.insert(achievement).values({
                experienceId: insertedExp.id,
                title: ach.title,
                situation: ach.situation,
                problem: ach.problem,
                action: ach.action,
                productOwnership: ach.productOwnership,
                technology: ach.technology,
                stakeholders: ach.stakeholders,
                metric: ach.metric,
                businessImpact: ach.businessImpact,
                userImpact: ach.userImpact,
                evidenceSource: ach.evidenceSource,
                isVerified: true,
              }).catch(() => {});
            }
          }
        }
      }
    }

    // Check skills in DB
    const existingSkills = await db.query.candidateSkill.findMany({
      where: (s, { eq }) => eq(s.candidateId, candidateId),
    });

    if (existingSkills.length === 0) {
      for (const sk of dna.skills) {
        await db.insert(candidateSkill).values({
          candidateId,
          skillName: sk.skillName,
          category: sk.category,
          proficiency: sk.proficiency,
          yearsExperience: sk.yearsExperience,
        }).catch(() => {});
      }
    }

    console.log('✅ Candidate profile, experiences, and skills synchronized to database.');
    return existing;
  } catch (err) {
    console.warn('Candidate sync note:', err);
    return null;
  }
}
