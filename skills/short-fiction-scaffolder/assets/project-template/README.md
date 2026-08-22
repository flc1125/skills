# 《{{TITLE}}》

中文商业短篇小说创作项目。
{{COVER_BLOCK}}
## 当前版本

- 推荐阅读：[初稿正文](docs/drafts/v1.md)
- 故事大纲：[持续维护的大纲](docs/outline.md)
- 发布资料：[简介、标签与发布信息](docs/publication/metadata.md)

初始版本没有修改说明。后续重大改写创建 `docs/drafts/vN.md` 和同号的 `docs/revision-notes/vN.md`，再更新本节链接。

## 目录结构

```text
.
├── AGENTS.md
├── README.md
├── assets
{{ASSET_ENTRY}}
└── docs
    ├── outline.md
    ├── drafts
    │   └── v1.md
    ├── publication
    │   └── metadata.md
    └── revision-notes
        └── .gitkeep
```

## 版本约定

- `docs/outline.md` 是唯一故事大纲。
- 正文统一放在 `docs/drafts/`，使用 `vN.md` 命名。
- 重大改写保留旧稿，并为新版本创建同号修改说明。
- README 只指向当前推荐版本，不创建含义重复的“最新版”文件。
