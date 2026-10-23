# 正式封存：簪花與封面導航 · 2026-10-23

使用者確認目前上線版本正式定稿，之後新增畫作沿用這套封面及底部導航。

## 版本識別

- 固定標記：`site-2026-10-23-zanhua-navigation`，對應已部署提交 `222747b2e999e09f666073460a58d80294123c35`。
- [GitHub Release 與下載](https://github.com/vincentttchan/chinese-wally/releases/tag/site-2026-10-23-zanhua-navigation) · [成功部署](https://github.com/vincentttchan/chinese-wally/actions/runs/39889538980) · [正式網站](https://vincentttchan.github.io/chinese-wally/#zanhua)。
- [改動及實際檢視紀錄](site-2026-10-23-zanhua-navigation.md)。封存紀錄提交只保存文件，不是另一份遊戲版本。
- 上一份 `site-2026-10-23`（`c9e99bfbc13322269c29d5d0d12071c739c3b828`）標記及附件完整保留。

## 定稿範圍與後續基準

目前六章的畫面、流程、動畫、對白、收藏、收尾及背景音樂依本版保存，包含最新簪花的收藏印與玩家篆體留印，以及六章簡化封面導航。沒有使用者明確的新修改要求，保留這份定稿；日後修改另存新版本。

新增畫作沿用原畫背景、淡絹漸層、直排章節題名、短引言、現行字體與留白、一個主要入畫操作，以及底部章節名稱導航。當前章節以朱色細線標示；窄畫面保留水平捲動。完成章節可留在畫中，也可「回到本章封面」再選另一幅畫。

詳細設計規則以[製作標準的封面與跨章導航](../historical-painting-chapter-standard.md#封面與跨章導航)為準；[新章節模板](../templates/historical-painting-chapter-template.md)已加入沿用來源、導航入口及收尾回封面的填寫欄位。案桌、藏卷架與獨立卡片目錄保留為設計歷程。

## 封存附件與還原

本機目錄：`output/releases/site-2026-10-23-zanhua-navigation/`；以下檔案亦保存於 GitHub Release：

- `github-pages-artifact.zip`：直接下載本次成功部署的官方產物，內含 `artifact.tar`；沒有重新建置。大小 541,634,427 bytes，SHA-256 `08351b5b830d0828e85abb8fea1aa87116d63d27b38e9422a3f1a077e130d01f`，與官方 artifact digest 一致。
- `archive-records.zip`：專案指示、製作標準、模板、發布與封存紀錄、音樂及篆體署名、修訂文件、代表畫面和檔案指紋。
- `release-record.json`：提交、標記、部署、六章入口、原有音樂指紋與沿用政策。
- `website-file-manifest.json`：部署包內全部 485 個一般檔案的相對路徑、大小與 SHA-256。
- `SHA256SUMS`：以上下載附件的校驗值。大型 ZIP 留在本機及 Release，不加入 Git 歷史。

還原時先核對 `SHA256SUMS`，再解出 ZIP 中的 `artifact.tar`，保持 `/chinese-wally/` 路徑與素材相對結構；原始碼由固定標記另開工作目錄取回。取回不代表獲准覆蓋線上版本。

本次只保存部署包、核對官方 ZIP 指紋、產生逐檔指紋並確認六章音樂與上一份封存相同，更新後續製作規範；沒有修改遊戲程式、重新建置、重新部署、重新通關或執行測試套件。既有發布檢視範圍與限制照實保留。
