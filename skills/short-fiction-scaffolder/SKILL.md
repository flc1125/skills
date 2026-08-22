---
name: short-fiction-scaffolder
description: Scaffold a new Chinese commercial short-fiction project with versioned drafts, one maintained outline, publication metadata, revision notes, and optional cover artwork. Use when starting a new short-story repository or directory; do not use for drafting or revising an existing story.
metadata:
  name: 短篇小说骨架器
  description: 为中文商业短篇小说创建安全、版本化且可持续迭代的项目骨架。
---

# 短篇小说骨架器

为新的中文商业短篇小说创建一套可持续迭代的项目骨架。只初始化项目；不要代替用户编造人物、剧情、正文或宣传文案，也不要把初始化授权扩大为 Git 或 GitHub 操作。

## 收集输入

开始前取得两个必填项：

- 输出路径
- 作品名

以下内容可选；未提供时不要追问，除非用户明确表示它会影响当前初始化：

- 笔名
- 类型
- 目标字数或字数范围
- PNG 封面文件路径

优先从用户的自然语言中整理这些值，再调用确定性脚本。不要让用户为了使用脚本而改写成命令行参数。

## 初始化

运行本 Skill 的 `scripts/scaffold_project.py`：

```bash
python3 <skill-directory>/scripts/scaffold_project.py \
  --output <project-path> \
  --title <作品名> \
  [--pen-name <笔名>] \
  [--genre <类型>] \
  [--target-length <目标字数>] \
  [--cover <png-path>]
```

脚本只接受不存在或为空的目标目录。目标目录含有任何文件时，应保留现场并向用户说明，不要添加或模拟强制覆盖。提供封面时，脚本验证 PNG 格式并复制为 `assets/cover.png`；未提供封面时，README 不生成图片链接。

不要在初始化过程中执行 `git init`、创建远程仓库、提交或推送。用户随后明确要求这些操作时，将其作为独立任务处理并再次确认相应范围。

## 输出约定

生成结果必须保持以下关系：

- `README.md` 是项目入口，只指向当前推荐稿、大纲、发布资料和当前版本确实存在的修改说明。
- `docs/outline.md` 是唯一、持续维护的故事大纲。
- 正文使用 `docs/drafts/vN.md`；重大改写创建下一版本，不覆盖历史稿。
- 修改说明使用 `docs/revision-notes/vN.md` 并与正文版本一致；初始 `v1.md` 不创建修改说明。
- `docs/publication/metadata.md` 预留正式稿、宣传语、无剧透简介、标签、内容提示、署名和封面信息。
- 发布素材位于 `assets/`，主封面固定为 `assets/cover.png`。
- 不创建 `latest.md`、`current.md` 或其他重复的“当前版本”文件。

模板只建立结构和写作提示，不填入具体作品内容。Markdown 使用 UTF-8，每份文档只包含一个 H1；`---` 只用于正文中的场景或章节分隔。

## 完成检查

初始化后：

1. 列出生成文件，确认目录和可选字段符合用户输入。
2. 搜索未替换的 `{{TOKEN}}` 标记。
3. 确认 README 的所有本地链接均存在；无封面时确认不存在封面图片标签。
4. 若目标目录已经位于 Git 仓库中，可运行 `git diff --check`，但不要因此初始化、提交或推送仓库。

向用户报告生成路径、采用的可选信息和未执行的外部操作。
