#!/usr/bin/env python3
"""Initialize project-local memory files and AGENTS.md guidance."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import textwrap


DEFAULT_MEMORY_DIR = ".agents/memories"
DEFAULT_AGENT_FILE = "AGENTS.md"
START_MARKER = "<!-- project-memory:start -->"
END_MARKER = "<!-- project-memory:end -->"


def clean_multiline(value: str) -> str:
    return textwrap.dedent(value).strip() + "\n"


def display_memory_dir(memory_dir: str) -> str:
    return memory_dir.strip().rstrip("/")


def template_files(memory_dir: str) -> dict[str, str]:
    memory_dir = display_memory_dir(memory_dir)
    return {
        "README.md": clean_multiline(
            f"""
            # Project Memories

            This directory stores durable, reusable project knowledge for future agents.

            Memory belongs here when it is project-specific and likely to help across multiple tasks. Do not store one-off task notes, temporary debugging details, raw chat logs, secrets, credentials, tokens, or private keys.

            ## How To Use

            1. Read `index.md` before non-trivial work.
            2. Open only the memory files relevant to the current task.
            3. Update memories when the user requests memory maintenance or when the current task explicitly includes maintaining reusable project knowledge.
            4. Recommend a memory update instead of editing memory files when memory maintenance is outside the current task scope.
            5. Keep entries concise, actionable, and easy to review in git.
            6. Update `index.md` when adding, removing, renaming, or materially changing memory files.

            ## Default Files

            - `project.md`: stable project context, conventions, and structure.
            - `workflows.md`: reusable commands, release steps, CI routines, and maintenance procedures.
            - `lessons.md`: pitfalls, verified fixes, and reusable debugging lessons.

            Memory directory: `{memory_dir}`
            """
        ),
        "index.md": clean_multiline(
            """
            # Memory Index

            Use this index to decide which memory files are relevant before starting work.

            | File | Purpose | Read When |
            | --- | --- | --- |
            | `project.md` | Stable project context, conventions, and structure. | You need repository orientation, naming rules, layout notes, or durable project preferences. |
            | `workflows.md` | Reusable commands, release steps, CI routines, and maintenance procedures. | You need to run, validate, release, debug CI, or perform repeated maintenance. |
            | `lessons.md` | Pitfalls, verified fixes, and reusable debugging lessons. | You hit a recurring issue or need prior lessons before changing behavior. |

            When adding a new memory file, add a row here with its purpose and when to read it.
            """
        ),
        "project.md": clean_multiline(
            """
            # Project Memory

            Store stable, reusable project context here.

            ## Conventions

            - Add durable coding, naming, directory, branching, or review conventions as they are confirmed.

            ## Structure

            - Add stable repository layout notes that help future agents find the right files quickly.

            ## Decisions

            - Add long-lived technical or product decisions with brief rationale.
            """
        ),
        "workflows.md": clean_multiline(
            """
            # Workflow Memory

            Store reusable project workflows here.

            ## Validation

            - Add verified test, lint, build, and local validation commands.

            ## Maintenance

            - Add repeated maintenance routines, release steps, dependency update handling, and CI triage procedures.
            """
        ),
        "lessons.md": clean_multiline(
            """
            # Lessons Memory

            Store reusable lessons and pitfalls here.

            ## Pitfalls

            - Add recurring failure modes, environment constraints, and gotchas with verified workarounds.

            ## Fix Patterns

            - Add fixes that are likely to apply again, with the conditions that made them valid.
            """
        ),
    }


def project_memory_section(memory_dir: str) -> str:
    memory_dir = display_memory_dir(memory_dir)
    return clean_multiline(
        f"""
        {START_MARKER}
        ## Project Memory

        Reusable project memory lives in `{memory_dir}/`.

        Before non-trivial work, read `{memory_dir}/index.md` and then open only the memory files relevant to the task.

        Update memories when the user requests memory maintenance or when the current task explicitly includes maintaining reusable project knowledge. If memory maintenance is outside the current task scope, recommend the update instead of editing memory files. Do not store one-off task notes, temporary debugging details, raw chat logs, secrets, credentials, or conversation-specific context.

        When changing memories, keep entries concise and actionable. Update `{memory_dir}/index.md` when adding, removing, renaming, or materially changing memory files.
        {END_MARKER}
        """
    )


def resolve_inside(root: Path, relative_path: str, option_name: str) -> Path:
    if not relative_path or not relative_path.strip():
        raise SystemExit(f"{option_name} must not be empty")
    if any(char in relative_path for char in ("\0", "\n", "\r")):
        raise SystemExit(f"{option_name} must not contain control characters")

    candidate = Path(relative_path)
    if candidate.is_absolute():
        raise SystemExit(f"{option_name} must be relative to the project root")
    reject_symlink_components(root, candidate, option_name)

    resolved = (root / candidate).resolve()
    try:
        resolved.relative_to(root)
    except ValueError as exc:
        raise SystemExit(f"{option_name} must stay inside the project root") from exc
    return resolved


def reject_symlink_components(root: Path, relative_path: Path, option_name: str) -> None:
    current = root
    for part in relative_path.parts:
        if part in ("", "."):
            continue
        if part == "..":
            current = current.parent
            try:
                current.relative_to(root)
            except ValueError:
                return
            continue

        current = current / part
        try:
            display_path = current.relative_to(root)
        except ValueError:
            return

        if current.is_symlink():
            raise SystemExit(f"{option_name} must not contain symlinks: {display_path}")
        if not current.exists():
            return


def ensure_regular_output_file(root: Path, path: Path) -> None:
    try:
        path.parent.resolve().relative_to(root)
    except ValueError as exc:
        raise SystemExit(f"Output path must stay inside the project root: {path}") from exc

    if path.is_symlink():
        raise SystemExit(f"Refusing to write through symlink: {path.relative_to(root)}")
    if path.exists() and not path.is_file():
        raise SystemExit(f"Output path is not a regular file: {path.relative_to(root)}")


def write_missing_memory_files(root: Path, memory_dir: str) -> list[str]:
    target = resolve_inside(root, memory_dir, "--memory-dir")
    if target == root:
        raise SystemExit("--memory-dir must not be the project root")
    if target.exists() and not target.is_dir():
        raise SystemExit(f"--memory-dir exists but is not a directory: {target.relative_to(root)}")
    target.mkdir(parents=True, exist_ok=True)

    actions: list[str] = []
    for name, content in template_files(memory_dir).items():
        path = target / name
        ensure_regular_output_file(root, path)
        if path.exists():
            actions.append(f"kept {path.relative_to(root)}")
            continue
        path.write_text(content, encoding="utf-8")
        actions.append(f"created {path.relative_to(root)}")
    return actions


def upsert_agent_section(root: Path, agent_file: str, memory_dir: str) -> list[str]:
    path = resolve_inside(root, agent_file, "--agent-file")
    section = project_memory_section(memory_dir)

    if path.exists() and not path.is_file():
        raise SystemExit(f"--agent-file exists but is not a file: {path.relative_to(root)}")
    if path.is_symlink():
        raise SystemExit(f"Refusing to write through symlink: {path.relative_to(root)}")

    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("# Agent Instructions\n\n" + section, encoding="utf-8")
        return [f"created {path.relative_to(root)}"]

    original = path.read_text(encoding="utf-8")
    if not original:
        path.write_text(section, encoding="utf-8")
        return [f"appended Project Memory section to {path.relative_to(root)}"]

    marker_pattern = re.compile(
        rf"{re.escape(START_MARKER)}.*?{re.escape(END_MARKER)}\n?",
        re.DOTALL,
    )
    marker_match = marker_pattern.search(original)
    if marker_match:
        trailing = marker_pattern.sub("", original[marker_match.end() :])
        updated = original[: marker_match.start()] + section + trailing
        path.write_text(updated, encoding="utf-8")
        return [f"updated managed Project Memory block in {path.relative_to(root)}"]

    heading_pattern = re.compile(
        r"^## Project Memor(?:y|ies)(?:\n|\Z).*?(?=^## |\Z)",
        re.DOTALL | re.MULTILINE,
    )
    if heading_pattern.search(original):
        separator = "" if original.endswith("\n\n") else "\n" if original.endswith("\n") else "\n\n"
        path.write_text(original + separator + section, encoding="utf-8")
        return [f"appended managed Project Memory block to preserve existing section in {path.relative_to(root)}"]

    separator = "" if original.endswith("\n\n") else "\n" if original.endswith("\n") else "\n\n"
    path.write_text(original + separator + section, encoding="utf-8")
    return [f"appended Project Memory section to {path.relative_to(root)}"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Initialize project memory files and AGENTS.md guidance.",
    )
    parser.add_argument(
        "project_root",
        nargs="?",
        default=".",
        help="Project root to initialize. Defaults to the current directory.",
    )
    parser.add_argument(
        "--memory-dir",
        default=DEFAULT_MEMORY_DIR,
        help=f"Memory directory relative to the project root. Defaults to {DEFAULT_MEMORY_DIR}.",
    )
    parser.add_argument(
        "--agent-file",
        default=DEFAULT_AGENT_FILE,
        help=f"Agent instruction file relative to the project root. Defaults to {DEFAULT_AGENT_FILE}.",
    )
    parser.add_argument(
        "--skip-agent",
        action="store_true",
        help="Create memory files without creating or updating the agent instruction file.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.project_root).expanduser().resolve()
    if not root.exists():
        raise SystemExit(f"Project root does not exist: {root}")
    if not root.is_dir():
        raise SystemExit(f"Project root is not a directory: {root}")

    actions = write_missing_memory_files(root, args.memory_dir)
    if not args.skip_agent:
        actions.extend(upsert_agent_section(root, args.agent_file, args.memory_dir))

    print(f"Initialized project memory in {root}")
    for action in actions:
        print(f"- {action}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
