import { notFound } from 'next/navigation';
import { getSkillBySlug } from '@/lib/skills';
import { SkillModal } from '@/components/SkillModal';

interface InterceptedSkillModalProps {
  params: Promise<{ slug: string }>;
}

export default async function InterceptedSkillModal({ params }: InterceptedSkillModalProps) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  return <SkillModal skill={skill} />;
}
