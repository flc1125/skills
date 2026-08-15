import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Skill } from '@/lib/skills';

const GITHUB_BLOB_BASE_URL = 'https://github.com/flc1125/skills/blob/main/skills';

function normalizeGithubPathParts(parts: string[]) {
  const normalized: string[] = [];

  for (const part of parts) {
    if (!part || part === '.') {
      continue;
    }

    if (part === '..') {
      normalized.pop();
      continue;
    }

    normalized.push(part);
  }

  return normalized;
}

function resolveSkillContentLink(skill: Skill, href?: string) {
  if (!href) {
    return href;
  }

  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  ) {
    return href;
  }

  const [pathname, hash = ''] = href.split('#');
  const baseDir = skill.path.split('/').slice(0, -1);
  const targetParts = pathname.split('/');
  const resolvedPath = normalizeGithubPathParts([...baseDir, ...targetParts]).join('/');

  return `${GITHUB_BLOB_BASE_URL}/${resolvedPath}${hash ? `#${hash}` : ''}`;
}

export function SkillMarkdown({ skill }: { skill: Skill }) {
  return (
    <div className="prose max-w-none text-[var(--foreground)] dark:prose-invert
      prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[var(--foreground)] prose-h1:text-2xl prose-h2:text-xl
      prose-p:max-w-[65ch] prose-p:text-sm prose-p:leading-7 prose-p:text-[var(--muted)] prose-li:text-sm prose-li:leading-7 prose-li:text-[var(--muted)] prose-a:font-semibold prose-a:text-[var(--accent)] prose-a:underline prose-a:decoration-[color-mix(in_srgb,var(--accent)_45%,transparent)] prose-a:underline-offset-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="!my-0 w-full min-w-max text-sm">
                  {children}
                </table>
              </div>
            )
          },
          th({ children, node: _node, ...props }) {
            return (
              <th {...props} className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-left font-display text-xs font-bold text-[var(--foreground)]">
                {children}
              </th>
            )
          },
          td({ children, node: _node, ...props }) {
            return (
              <td {...props} className="border-b border-[var(--border)] px-3.5 py-2.5 align-top text-[var(--muted)] [&_tr:last-child>&]:border-b-0">
                {children}
              </td>
            )
          },
          pre({ children }) {
            return (
              <pre className="my-4 overflow-x-auto rounded-xl bg-[var(--surface-muted)] p-4 text-xs text-[var(--foreground)]">
                {children}
              </pre>
            )
          },
          code(props) {
            const { children, className, ...codeProps } = props;
            const { node: _node, inline: _inline, ...rest } = codeProps as typeof codeProps & {
              inline?: boolean;
              node?: unknown;
            };
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <code className={className} {...rest}>
                {children}
              </code>
            ) : (
              <code className="mx-0.5 rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 font-semibold text-[var(--foreground)] before:content-none after:content-none" {...rest}>
                {children}
              </code>
            )
          },
          a({ href, children, ...props }) {
            const resolvedHref = resolveSkillContentLink(skill, href);
            const isExternal = resolvedHref?.startsWith('http://') || resolvedHref?.startsWith('https://');

            return (
              <a
                href={resolvedHref}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          }
        }}
      >
        {skill.content}
      </ReactMarkdown>
    </div>
  );
}
