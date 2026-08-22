#!/usr/bin/env python3
"""Create a version-preserving Chinese short-fiction project skeleton."""

from __future__ import annotations

import argparse
import html
import os
from pathlib import Path
import re
import shutil
import struct
import sys
import tempfile
from typing import Dict, Optional, Tuple


TEMPLATE_ROOT = Path(__file__).resolve().parent.parent / "assets" / "project-template"
TOKEN_PATTERN = re.compile(r"\{\{[A-Z0-9_]+\}\}")
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


class ScaffoldError(Exception):
    """Raised when input or destination safety checks fail."""


def single_line(value: Optional[str], label: str, required: bool = False) -> Optional[str]:
    if value is None:
        if required:
            raise ScaffoldError(f"Missing {label}")
        return None

    normalized = value.strip()
    if required and not normalized:
        raise ScaffoldError(f"{label} must not be empty")
    if not normalized:
        return None
    if "\n" in normalized or "\r" in normalized:
        raise ScaffoldError(f"{label} must be a single line")
    return normalized


def inspect_png(path: Path) -> Tuple[int, int]:
    if not path.is_file():
        raise ScaffoldError(f"Cover does not exist or is not a regular file: {path}")

    with path.open("rb") as source:
        header = source.read(24)

    if len(header) < 24 or header[:8] != PNG_SIGNATURE or header[12:16] != b"IHDR":
        raise ScaffoldError(f"Cover must be a valid PNG file: {path}")

    return struct.unpack(">II", header[16:24])


def validate_destination(output: Path) -> None:
    if output.is_symlink():
        raise ScaffoldError(f"Target path must not be a symbolic link: {output}")
    if not output.exists():
        return
    if not output.is_dir():
        raise ScaffoldError(f"Target exists and is not a directory: {output}")
    if any(output.iterdir()):
        raise ScaffoldError(f"Target directory is not empty; stopped safely: {output}")


def render_template(source: Path, destination: Path, values: Dict[str, str]) -> None:
    content = source.read_text(encoding="utf-8")
    for key, value in values.items():
        content = content.replace("{{" + key + "}}", value)

    unresolved = sorted(set(TOKEN_PATTERN.findall(content)))
    if unresolved:
        raise ScaffoldError(
            f"Template {source.relative_to(TEMPLATE_ROOT)} has unresolved markers: {', '.join(unresolved)}"
        )

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(content, encoding="utf-8")


def build_values(
    title: str,
    pen_name: Optional[str],
    genre: Optional[str],
    target_length: Optional[str],
    cover_size: Optional[Tuple[int, int]],
) -> Dict[str, str]:
    work_info_lines = []
    if genre:
        work_info_lines.append(f"- 类型：{genre}")
    if target_length:
        work_info_lines.append(f"- 目标字数：{target_length}")
    work_info_block = ""
    if work_info_lines:
        work_info_block = "## 作品信息\n\n" + "\n".join(work_info_lines) + "\n"

    cover_block = ""
    asset_entry = "│   └── .gitkeep"
    cover_metadata = (
        "当前未配置封面。添加封面时使用 `assets/cover.png`，并在 README 中增加图片展示。"
    )
    if cover_size:
        width, height = cover_size
        cover_block = (
            "\n<p align=\"center\">\n"
            f"  <img src=\"assets/cover.png\" alt=\"《{html.escape(title, quote=True)}》封面\" width=\"300\">\n"
            "</p>\n"
        )
        asset_entry = "│   └── cover.png"
        cover_metadata = (
            "- 文件：`assets/cover.png`\n"
            "- 格式：PNG\n"
            f"- 尺寸：{width} × {height} 像素"
        )

    return {
        "TITLE": title,
        "COVER_BLOCK": cover_block,
        "ASSET_ENTRY": asset_entry,
        "GENRE_LINE": f"- 类型：{genre}" if genre else "",
        "TARGET_LENGTH_LINE": (
            f"- 目标字数：{target_length}" if target_length else ""
        ),
        "WORK_INFO_BLOCK": work_info_block,
        "PEN_NAME_LINE": (
            f"- 署名：{pen_name}"
            if pen_name
            else "- 署名：通过发布平台的作者字段维护"
        ),
        "COVER_METADATA": cover_metadata,
    }


def materialize(destination: Path, values: Dict[str, str], cover: Optional[Path]) -> None:
    if not TEMPLATE_ROOT.is_dir():
        raise ScaffoldError(f"Project template not found: {TEMPLATE_ROOT}")

    for source in sorted(TEMPLATE_ROOT.rglob("*")):
        relative = source.relative_to(TEMPLATE_ROOT)
        target = destination / relative
        if source.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            render_template(source, target, values)

    if cover:
        keep_file = destination / "assets" / ".gitkeep"
        if keep_file.exists():
            keep_file.unlink()
        shutil.copy2(cover, destination / "assets" / "cover.png")


def scaffold(args: argparse.Namespace) -> Path:
    title = single_line(args.title, "work title", required=True)
    output_value = single_line(args.output, "output path", required=True)
    pen_name = single_line(args.pen_name, "pen name")
    genre = single_line(args.genre, "genre")
    target_length = single_line(args.target_length, "target length")
    assert title is not None and output_value is not None

    output = Path(output_value).expanduser()
    cover = Path(args.cover).expanduser() if args.cover else None
    cover_size = inspect_png(cover) if cover else None

    validate_destination(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    values = build_values(title, pen_name, genre, target_length, cover_size)

    with tempfile.TemporaryDirectory(prefix=f".{output.name}-", dir=output.parent) as temp_dir:
        staged = Path(temp_dir) / "project"
        staged.mkdir()
        materialize(staged, values, cover)

        if output.exists():
            output.rmdir()
        os.replace(staged, output)

    return output.resolve()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a versioned project skeleton for Chinese commercial short fiction."
    )
    parser.add_argument("--output", required=True, help="output directory for the new project")
    parser.add_argument("--title", required=True, help="work title")
    parser.add_argument("--pen-name", help="optional pen name")
    parser.add_argument("--genre", help="optional genre")
    parser.add_argument("--target-length", help="optional target length or range")
    parser.add_argument("--cover", help="optional PNG cover path")
    return parser.parse_args()


def main() -> int:
    try:
        output = scaffold(parse_args())
    except (OSError, ScaffoldError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    print(f"Created short-fiction project: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
