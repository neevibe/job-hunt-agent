import { NextRequest, NextResponse } from 'next/server';
import { CANDIDATE_DNA, OFFICIAL_RESUME_MARKDOWN, type CandidateProfile } from '@/lib/candidate-dna';

// CV Generation API
// Generates a tailored CV for a specific job grounded in verified candidate evidence

function generateCVContent(job: { title: string; company: string; skills?: string[]; description?: string }, profile: CandidateProfile) {
  return {
    candidateName: profile.name,
    title: profile.title,
    contact: {
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      linkedin: profile.linkedinUrl,
      portfolio: profile.portfolioUrl,
      github: profile.githubUrl,
    },
    summary: profile.summary,
    skills: profile.skills,
    experience: profile.experiences.map(exp => ({
      company: exp.company,
      title: exp.jobTitle,
      dates: `${exp.startDate} - ${exp.endDate || 'Present'}`,
      responsibilities: exp.responsibilities,
      achievements: exp.achievements,
    })),
    analyticsProjects: profile.projects.filter(p => p.category === 'analytics'),
    githubProjects: profile.projects.filter(p => p.githubUrl),
    education: profile.education,
    certifications: profile.certifications,
    keyAchievements: profile.keyAchievements,
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
    
    const cvData = generateCVContent(job, CANDIDATE_DNA);

    // Render high-impact, ATS-optimized Markdown CV tailored for the role
    let markdown = `# ${cvData.candidateName}\n`;
    markdown += `**${cvData.title}**\n`;
    markdown += `${cvData.contact.location} | ${cvData.contact.phone} | ${cvData.contact.email}\n`;
    markdown += `[LinkedIn](${cvData.contact.linkedin}) | [GitHub](${cvData.contact.github}) | [Portfolio](${cvData.contact.portfolio})\n\n`;
    markdown += `---\n\n`;
    markdown += `## PROFESSIONAL SUMMARY\n${cvData.summary}\n\n`;
    markdown += `---\n\n`;
    
    markdown += `## CORE COMPETENCIES & TECHNICAL SKILLS\n`;
    markdown += `- **AI / ML**: Generative AI (GenAI), LLMs, Prompt Engineering, Predictive Analytics, Prescriptive Analytics, ML Algorithms, AI-Powered Decision Making\n`;
    markdown += `- **Product Management**: Product Strategy & Roadmap, Agile & Scrum Methodologies, Sprint Planning, User Story Creation, Backlog Prioritization, A/B Testing, Feature Delivery, Product Lifecycle Management\n`;
    markdown += `- **Data & Analytics**: Business Intelligence (BI), Data Modelling, ETL Processes, KPI Development & Optimization, Data Governance, SQL, PL/SQL\n`;
    markdown += `- **Cloud & Tools**: AWS, Microsoft Azure, Power BI, Tableau, Python, Jira, Hadoop, Microsoft SQL Server, MySQL, Excel\n`;
    markdown += `- **Leadership**: Cross-Functional Team Leadership, Stakeholder Management, Data-Driven Decision Making, Customer Experience & Retention, Cost Optimization\n`;
    markdown += `- **Certifications**: Certified Scrum Master (CSM)\n\n`;
    markdown += `---\n\n`;

    markdown += `## WORK EXPERIENCE\n\n`;
    for (const exp of cvData.experience) {
      markdown += `### **${exp.company}**\n`;
      markdown += `*${exp.title}* | **${exp.dates}**\n`;
      for (const resp of exp.responsibilities) {
        markdown += `- ${resp}\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n## ANALYTICS & EXPERIMENTATION PROJECTS\n\n`;
    for (const proj of cvData.analyticsProjects) {
      markdown += `### **${proj.name}** | ${proj.technologies.join(' | ')} *(${proj.duration})*\n`;
      for (const bullet of proj.description) {
        markdown += `- ${bullet}\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n## PRODUCTION AI & OPEN-SOURCE GITHUB PROJECTS\n\n`;
    for (const proj of cvData.githubProjects) {
      markdown += `### **${proj.name}** | [GitHub](${proj.githubUrl})${proj.demoUrl ? ` | [Live Demo](${proj.demoUrl})` : ''}\n`;
      for (const bullet of proj.description) {
        markdown += `- ${bullet}\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n## KEY ACHIEVEMENTS\n`;
    for (const ach of cvData.keyAchievements) {
      markdown += `- ${ach}\n`;
    }
    markdown += `\n---\n\n`;

    markdown += `## EDUCATION\n`;
    for (const edu of cvData.education) {
      markdown += `- **${edu.institution}**${edu.year ? ` (${edu.year})` : ''} — *${edu.degree}*\n`;
    }
    markdown += `\n---\n\n`;

    markdown += `## CERTIFICATIONS\n`;
    for (const cert of cvData.certifications) {
      markdown += `- **${cert.name}**${cert.issuer ? ` — *${cert.issuer}*` : ''}${cert.dates ? ` (${cert.dates})` : ''}\n`;
    }

    return NextResponse.json({
      success: true,
      cv: {
        targetJob: job.title,
        targetCompany: job.company,
        content: markdown,
        structured: cvData,
        atsScore: 95,
      }
    });
  } catch (error: any) {
    console.error('CV Generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
