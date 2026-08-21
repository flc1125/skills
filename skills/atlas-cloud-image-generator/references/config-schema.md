# Local Auth Configuration

Default path:

`~/.config/flc1125/skills/atlas-cloud-image-generator/auth.json`

Minimal shape:

```json
{
  "version": 1,
  "api_key": "replace_with_your_atlas_cloud_api_key"
}
```

Optional custom API origin:

```json
{
  "version": 1,
  "api_key": "replace_with_your_atlas_cloud_api_key",
  "base_url": "https://api.atlascloud.ai"
}
```

Keep this file outside the repository and restrict it to the current user. Prefer `ATLASCLOUD_API_KEY` when the surrounding environment already manages secrets securely.
