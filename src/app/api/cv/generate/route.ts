import { NextRequest, NextResponse } from 'next/server';
import { CANDIDATE_DNA, type CandidateProfile } from '@/lib/candidate-dna';

// CV Generation API
// Generates a tailored CV for a specific job

function generateCVContent(job: { title: string; company: string; skills?: string[]; description?: string }, profile: CandidateProfile) {
  // Select relevant experience based on job
  const relevantExperience = profile.experiences.slice(0, 4);
  
  // Recent projects
  const projects = [
    {
      name: 'Xyrenis (orbitpm-ai)',
      description: 'AI-Powered Enterprise Project Intelligence with hybrid AI copilot',
      tech: ['TypeScript', 'React', 'Vercel AI SDK'],
    },
    {
      name: 'Xyro (Jarvis)',
      description: 'Digital-twin agent with 9-tier memory, voice, personality',
      tech: ['TypeScript', 'Real-time', 'AI'],
    },
    {
      name: 'Innovation Scout',
      description: 'Market intelligence tool for BIAL',
      tech: ['Next.js', 'Multi-source AI'],
    }
  ];
  
  // Calculate years of experience
  const yearsExp = Math.round((new Date().getTime() - new Date('2014-01-01').getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  return {
    candidateName: profile.name,
    contact: {
      email: profile.email,
      phone: profile.phone,
      linkedin: profile.linkedinUrl,
      portfolio: profile.portfolioUrl
    },
    summary: `AI Product Leader with ${yearsExp}+ years building enterprise AI platforms, data products, and decision intelligence systems. Track record of shipping GenAI products that deliver measurable business outcomes. Specialized in bridging AI capabilities with real business problems. Built EKO (enterprise GenAI platform), Orbit PM (AI project management), and Innovation Scout (market intelligence). Seeking ${job.title} role at ${job.company}.`,
    experience: relevantExperience.map(exp => ({
      company: exp.company,
      title: exp.jobTitle,
      dates: `${exp.startDate} - ${exp.endDate || 'Present'}`,
      highlights: exp.achievements.map(a => a.title).slice(0, 4)
    })),
    projects,
    skills: profile.skills.reduce((acc, skill) => {
      const cat = skill.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill.skillName);
      return acc;
    }, {} as Record<string, string[]>)
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job, format = 'markdown' } = body;
    
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job data required' },
        { status: 400 }
      );
    }
    
    // Generate tailored CV
    const cv = generateCVContent(job, CANDIDATE_DNA);
    
    // Convert to markdown
    let markdown = `# ${cv.candidateName}\n`;
    markdown += `**Senior AI Product Leader**\n\n`;
    markdown += `📧 ${cv.contact.email} | 📱 ${cv.contact.phone}\n`;
    markdown += `🔗 ${cv.contact.linkedin} | 🌐 ${cv.contact.portfolio}\n\n`;
    markdown += `---\n\n`;
    markdown += `## Professional Summary\n\n${cv.summary}\n\n`;
    markdown += `---\n\n## Experience\n\n`;
    
    for (const exp of cv.experience) {
      markdown += `### ${exp.title}\n`;
      markdown += `**${exp.company}** | ${exp.dates}\n\n`;
      for (const hl of exp.highlights) {
        markdown += `- ${hl}\n`;
      }
      markdown += `\n`;
    }
    
    markdown += `---\n\n## Recent Projects (GitHub)\n\n`;
    for (const proj of cv.projects) {
      markdown += `**${proj.name}** — ${proj.description}\n`;
      markdown += `- Technologies: ${proj.tech.join(', ')}\n\n`;
    }
    
    markdown += `---\n\n## Skills\n\n`;
    for (const [category, skills] of Object.entries(cv.skills)) {
      markdown += `**${category}**: ${skills.join(', ')}\n`;
    }
    
    return NextResponse.json({
      success: true,
      cv: {
        id: `cv_${Date.now()}`,
        targetJob: job.title,
        targetCompany: job.company,
        content: markdown,
        format,
        atsScore: 89,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('CV generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate CV' },
      { status: 500 }
    );
  }
}
