#!/usr/bin/env python3
"""Generate images with Volcengine Ark using the official Python SDK.

Supports:
- text-to-image via Seedream 5.0 lite by default
- single-reference image generation via SeedEdit 3.0 by default

The script defaults to preview mode. Pass --execute to send the request.
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.request
from pathlib import Path
from typing import Any

DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DEFAULT_T2I_MODEL = "doubao-seedream-5-0-lite-260128"
DEFAULT_I2I_MODEL = "doubao-seededit-3-0-i2i-250628"
SKILL_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ENV_PATH = SKILL_ROOT / ".env"


def load_env_file(env_path: Path) -> None:
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        separator_index = line.find("=")
        if separator_index <= 0:
            continue

        key = line[:separator_index].strip()
        value = line[separator_index + 1 :].strip()
        if not key or key in os.environ:
            continue

        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]

        os.environ[key] = value


def parse_bool(value: str) -> bool:
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "y"}:
        return True
    if normalized in {"0", "false", "no", "n"}:
        return False
    raise argparse.ArgumentTypeError(f"Expected a boolean-like value, got: {value}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate images with Volcengine Ark using a safe default workflow.",
    )
    parser.add_argument("--prompt", required=True, help="Prompt text for image generation")
    parser.add_argument(
        "--image",
        help="Optional single reference image. Accepts a URL, a data URI, or a local file path.",
    )
    parser.add_argument(
        "--model",
        help=(
            "Model ID override. Defaults to Seedream 5.0 lite for text-to-image and "
            "SeedEdit 3.0 for single-reference image generation."
        ),
    )
    parser.add_argument(
        "--size",
        help="Optional size override. Defaults to API/model defaults when omitted.",
    )
    parser.add_argument(
        "--response-format",
        choices=["url", "b64_json"],
        default="url",
        help="Requested response format. Defaults to url.",
    )
    parser.add_argument(
        "--output-format",
        choices=["jpeg", "png"],
        help="Optional output format. Use only with models that explicitly support it.",
    )
    parser.add_argument(
        "--watermark",
        type=parse_bool,
        help="Optional watermark flag. Use true or false.",
    )
    parser.add_argument(
        "--output",
        help=(
            "Optional output path. When response_format=url, the script downloads the first result "
            "to this path. When response_format=b64_json, the script decodes it into this path."
        ),
    )
    parser.add_argument(
        "--base-url",
        help=f"Override Ark base URL. Defaults to {DEFAULT_BASE_URL}.",
    )
    parser.add_argument(
        "--api-key",
        help="Override ARK_API_KEY for this invocation only.",
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Actually send the request. Preview mode is the default.",
    )
    return parser.parse_args()


def choose_model(args: argparse.Namespace) -> str:
    if args.model:
        return args.model
    if args.image:
        return DEFAULT_I2I_MODEL
    return DEFAULT_T2I_MODEL


def image_to_payload_value(image_value: str) -> str:
    if image_value.startswith(("http://", "https://", "data:")):
        return image_value

    image_path = Path(image_value).expanduser()
    if not image_path.is_absolute():
        image_path = Path.cwd() / image_path

    if not image_path.exists():
        raise FileNotFoundError(
            f"Reference image not found: {image_path}. Provide a URL, data URI, or existing file path."
        )

    mime_type = mimetypes.guess_type(image_path.name)[0] or "image/png"
    encoded = base64.b64encode(image_path.read_bytes()).decode("utf-8")
    return f"data:{mime_type};base64,{encoded}"


def build_payload(args: argparse.Namespace, model: str) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": model,
        "prompt": args.prompt,
        "response_format": args.response_format,
    }

    if args.image:
        payload["image"] = image_to_payload_value(args.image)

    if args.size:
        payload["size"] = args.size
    elif args.image and model == DEFAULT_I2I_MODEL:
        payload["size"] = "adaptive"

    if args.output_format:
        payload["output_format"] = args.output_format

    if args.watermark is not None:
        payload["watermark"] = args.watermark

    return payload


def preview(base_url: str, payload: dict[str, Any], output_path: str | None) -> None:
    print(
        json.dumps(
            {
                "mode": "preview",
                "base_url": base_url,
                "payload": payload,
                "output_path": output_path,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


def require_sdk() -> Any:
    try:
        from volcenginesdkarkruntime import Ark
    except ImportError as exc:  # pragma: no cover - import availability is env-dependent
        raise RuntimeError(
            "Missing dependency 'volcenginesdkarkruntime'. Install the official SDK with "
            "`pip install 'volcengine-python-sdk[ark]'`."
        ) from exc
    return Ark


def first_data_item(response: Any) -> Any:
    data = getattr(response, "data", None)
    if data is None and isinstance(response, dict):
        data = response.get("data")

    if not data:
        return None

    try:
        return data[0]
    except (TypeError, KeyError, IndexError):
        return None


def get_field(item: Any, key: str) -> Any:
    if item is None:
        return None
    if isinstance(item, dict):
        return item.get(key)
    return getattr(item, key, None)


def write_output(result_url: str | None, result_b64: str | None, output_path: str) -> str:
    destination = Path(output_path).expanduser()
    if not destination.is_absolute():
        destination = Path.cwd() / destination

    destination.parent.mkdir(parents=True, exist_ok=True)

    if result_b64:
        destination.write_bytes(base64.b64decode(result_b64))
        return str(destination)

    if result_url:
        with urllib.request.urlopen(result_url) as response:
            destination.write_bytes(response.read())
        return str(destination)

    raise RuntimeError("No image data available to write.")


def execute(base_url: str, api_key: str, payload: dict[str, Any], output_path: str | None) -> None:
    if not api_key:
        raise RuntimeError("Missing ARK_API_KEY. Set it in the environment, .env, or pass --api-key.")

    Ark = require_sdk()
    client = Ark(base_url=base_url, api_key=api_key)
    response = client.images.generate(**payload)

    item = first_data_item(response)
    result_url = get_field(item, "url")
    result_b64 = get_field(item, "b64_json")
    written_path = None

    if output_path:
        written_path = write_output(result_url, result_b64, output_path)

    response_summary = {
        "mode": "execute",
        "model": payload["model"],
        "response_format": payload.get("response_format"),
        "url": result_url,
        "output_path": written_path,
        "has_b64_json": bool(result_b64),
    }

    print(json.dumps(response_summary, ensure_ascii=False, indent=2))


def main() -> int:
    load_env_file(DEFAULT_ENV_PATH)
    args = parse_args()
    model = choose_model(args)
    base_url = args.base_url or os.getenv("ARK_BASE_URL") or DEFAULT_BASE_URL
    api_key = args.api_key or os.getenv("ARK_API_KEY", "")
    payload = build_payload(args, model)

    if not args.execute:
        preview(base_url, payload, args.output)
        return 0

    execute(base_url, api_key, payload, args.output)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover - user-facing CLI error path
        print(f"[ERROR] {exc}", file=sys.stderr)
        raise SystemExit(1)
