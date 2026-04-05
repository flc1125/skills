#!/usr/bin/env python3
"""Generate images with Volcengine Ark using a local auth.json config.

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
import sys
import urllib.request
from pathlib import Path
from typing import Any

DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DEFAULT_T2I_MODEL = "doubao-seedream-5-0-lite-260128"
DEFAULT_I2I_MODEL = "doubao-seededit-3-0-i2i-250628"
CONFIG_ROOT = Path.home() / ".config" / "flc1125" / "skills" / "volcengine-ark-image-generator"
DEFAULT_AUTH_PATH = CONFIG_ROOT / "auth.json"


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
        help="Override auth.json api_key for this invocation only.",
    )
    parser.add_argument(
        "--auth-file",
        help=f"Override auth file path. Defaults to {DEFAULT_AUTH_PATH}.",
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


def load_auth_file(auth_path: Path) -> dict[str, Any]:
    if not auth_path.exists():
        example = {
            "version": 1,
            "api_key": "replace_with_your_ark_api_key",
            "base_url": DEFAULT_BASE_URL,
        }
        raise RuntimeError(
            "Missing auth config.\n"
            f"Expected: {auth_path}\n"
            "Create it with:\n"
            f"{json.dumps(example, ensure_ascii=False, indent=2)}"
        )

    try:
        raw = json.loads(auth_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid JSON in auth config: {auth_path}: {exc}") from exc

    if not isinstance(raw, dict):
        raise RuntimeError(f"Auth config must be a JSON object: {auth_path}")

    return raw


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


def build_url(base_url: str) -> str:
    return f"{base_url.rstrip('/')}/images/generations"


def post_json(url: str, api_key: str, payload: dict[str, Any]) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(request) as response:
        raw = response.read().decode("utf-8")

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Expected JSON response from Ark, got: {raw}") from exc


def execute(base_url: str, api_key: str, payload: dict[str, Any], output_path: str | None) -> None:
    if not api_key:
        raise RuntimeError("Missing api_key. Set it in auth.json or pass --api-key.")

    response = post_json(build_url(base_url), api_key, payload)

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
    args = parse_args()
    model = choose_model(args)
    payload = build_payload(args, model)
    base_url = args.base_url or DEFAULT_BASE_URL

    if not args.execute:
        preview(base_url, payload, args.output)
        return 0

    auth_path = Path(args.auth_file).expanduser() if args.auth_file else DEFAULT_AUTH_PATH
    auth = load_auth_file(auth_path)
    api_key = args.api_key or auth.get("api_key", "")
    base_url = args.base_url or auth.get("base_url") or DEFAULT_BASE_URL
    execute(base_url, api_key, payload, args.output)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover - user-facing CLI error path
        print(f"[ERROR] {exc}", file=sys.stderr)
        raise SystemExit(1)
