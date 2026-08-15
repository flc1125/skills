import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { getSkillBySlug } from '@/lib/skills';
import { SkillMarkdown } from '@/components/SkillMarkdown';
import { SkillMetaPills } from '@/components/SkillMetaPills';
import { SkillInstallAction } from '@/components/SkillInstallAction';

interface SkillPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SkillPageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return {};
  }

  const name = skill.metadata?.name ?? skill.name;
  const description = skill.metadata?.description ?? skill.description;
  const url = `https://skills.flc.io/${slug}`;

  return {
    title: `${name} · Flc's Skills`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: name,
      description,
      url,
      type: 'article',
      siteName: "Flc's Skills",
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
    },
  };
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  const name = skill.metadata?.name ?? skill.name;
  const description = skill.metadata?.description ?? skill.description;
  const sourceUrl = `https://github.com/flc1125/skills/blob/main/skills/${skill.path}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: name,
    description,
    url: `https://skills.flc.io/${slug}`,
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex items-start justify-between gap-4">
        <h1 className="min-w-0 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {name}
        </h1>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          aria-label="View source on GitHub"
          title="View source on GitHub"
        >
          <ExternalLink size={16} strokeWidth={1.8} />
        </a>
      </div>
      <SkillMetaPills skill={skill} />
      <div className="mt-5">
        <SkillMarkdown skill={skill} />
      </div>
      <div className="mt-8">
        <SkillInstallAction skill={skill} />
      </div>
    </div>
  );
}
