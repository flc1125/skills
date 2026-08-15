import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSkillBySlug } from '@/lib/skills';
import { SkillMarkdown } from '@/components/SkillMarkdown';
import { SkillMetaPills } from '@/components/SkillMetaPills';
import { SkillInstallAction } from '@/components/SkillInstallAction';
import { SkillSourceLink } from '@/components/SkillSourceLink';

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
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: `${name} — Reusable workflow skill`,
        },
      ],
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
  const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
      />
      <div className="flex items-start justify-between gap-4">
        <h1 className="min-w-0 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {name}
        </h1>
        <SkillSourceLink url={sourceUrl} slug={slug} name={name} />
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
