# 元宵見聞冊 · 已確認總覽方向

## 素材與工具

- 生成方式：內建 image_gen，非 CLI。
- 已確認效果圖：`output/art-direction/lantern-journal/approved-overview-v1.png`。
- 正式使用插畫：`public/art/collectibles/lantern-journal-atlas-v1.png`，1536 × 1024，透明背景，三欄兩列，以 CSS 分別顯示六格。
- 插畫是依原畫製作的收藏摹繪，並非原畫掃描；閱讀畫作證據時維持原畫。
- 參考五張原畫局部：`detail-17.jpg`（立式花燈）、`detail-4.jpg`（魚形燈）、`detail-18.jpg`（貨郎擔）、`detail-10.jpg`（輪上童子與托輪者）、`detail-5.jpg`（裝扮）。
- 畫作背景使用網站原有長卷，沒有把生成效果圖當成原畫。

## 插畫完整提示詞

Use case: stylized-concept. Create a production PNG sprite atlas of exactly SIX isolated hand-painted collectible miniatures for a Chinese historical painting exploration game's collection journal. This is an asset sheet, NOT a UI screen.
Canvas 1536x1024, genuinely TRANSPARENT background. Exact regular 3 columns by 2 rows, each cell 512x512. Object centers: (256,256),(768,256),(1280,256),(256,768),(768,768),(1280,768). Each complete illustration stays inside its own cell with at least 60px transparent margin on all four sides. Equal visual weight, no overlap, no cell dividers, no text, labels, numbers, paper, shadows or glow.
References 1–5 are historical evidence for the actual items. Follow their visible shapes faithfully. Miniature style: thin controlled ink outline and quiet hand-painted mineral colors. All six miniatures must be in full subdued color (the application itself will make locked items gray).
Top-left cell: one slender ochre golden rising spark from a dark vermilion point, with only three nearby tiny ember flecks. Elegant flat hand-painted firelight, no glow, no tube.
Top-middle: the free-standing RED ROUND-FACED festival lantern from reference 1 (upper center of the source painting): rounded circular red lantern face decorated with seven white-blue circular discs, small green canopy, thin black side tassels, red carved standing pedestal with two outward feet. Preserve ROUND face and ornate STANDING base. Do NOT substitute a hexagonal hanging lantern.
Top-right: the FISH-SHAPED LANTERN in the lower-right of reference 2: pale cream squat fish, rounded forehead, open downturned mouth, scales and spreading tail, suspended by two fine dark strings meeting a small red bamboo pole. Fish only and short pole, no carrier/person. Preserve its recognizable original shape.
Bottom-left: the elaborate PEDDLER'S CARRYING STALL from reference 3: two red trays laden with toys, little lamps and pots beneath a purple scalloped parasol canopy, delicate wooden poles and support feet. Object only, no seller or surrounding children. Same structural character as original; not just two baskets.
Bottom-middle: the specific TWO-PERSON acrobatic act at upper-right of reference 4. Small child in dark blue patterned tunic balances upright atop a HORIZONTAL red spoked wheel, above a performer in green lying on a red table and supporting/turning the wheel with raised feet. Isolate the entire child+horizontal wheel+supporting performer+red table as ONE complete miniature. Do NOT show anyone riding a vertical wheel or a unicycle, no circus invention.
Bottom-right: the two actors at LOWER-RIGHT of reference 5. Two standing Ming costume performers, left taller in muted red robe and black cap carrying a long curved golden prop; right in muted green robe and headwrap holding a round bowl and thin red stick. Preserve the visible clothing and objects; do not replace with elaborate modern Chinese opera headgear.
All figures with traditional painted proportions, fine dry ink outline, slightly uneven brushwork, flat muted mineral pigment fills, moss green, faded vermilion, smoky indigo, pale silk cream and ochre. Like careful miniatures from a Ming painted handscroll. No scenery, trees, architecture, border, badges, coins, stars, lock symbols, 3D, shiny vector style. Alpha must be actual transparent pixels, not white or beige sheet.

## 已確認效果圖完整提示詞

Use case: ui-mockup.
Create ONE polished desktop web game interface mockup, 1536 × 864 landscape, of a redesigned collection journal overview for an existing Chinese historical painting exploration game. This is a static concept screen for design discussion, not implementation. No device frame, browser chrome or perspective.
Input image 1 is the ACTUAL EXISTING GAME screenshot, serving as the historical painting and visual grounding reference. Preserve its Ming court painting aesthetic, muted mineral pigments, silk paper, fine architectural lines and children setting off firecrackers. Remove its existing UI and text completely and rebuild the journal interface as described. Do not introduce a fantasy palace or new characters. Input image 2 is the previously created collectible spark illustration, serving as the unlocked collectible's visual reference; its black display area is transparency and must NOT appear as a black square.
Art direction: elegant contemporary museum exhibition design, quiet and tactile Chinese silk, deliberate typography, generous spacing, refined thin ink marks. Existing selected direction is painting on left and reading/collection margin on right. Keep this direction. No ornamental framed modal, no generic dashboard cards, no ornate border, no folded paper sticker, no open physical book.
Composition: left 42% remains an unobstructed, beautifully legible full bleed crop of the supplied historical painting, focusing on the children and firecrackers. Right 58% is a continuous light warm ivory silk surface subtly feathering into the painting at their junction. The reading surface must be opaque enough that railings NEVER run through the text or collectible illustrations. No top/bottom colored bands. Artwork covers the whole viewport behind the composition.
Right collection area: start at x≈730, top≈72. Small section label "畫中拾趣". Main heading "元宵見聞冊" in elegant readable regular-weight Traditional Chinese Song type, approximately 36px, dark warm ink. To the right of heading, quiet progress "已收下 1／6". A tiny close × at far upper right with adequate margin. One restrained introductory sentence beneath heading: "把偶然看見的細節，收成自己的元宵。", 18px, muted ink.
Exactly SIX collectible positions in a spacious 3 column × 2 row arrangement across right area, with about 190px width per position. All six positions align consistently, no rectangles, no enclosing cards, no circular badges. Each position contains a centered hand-painted object illustration about 100–125px high, then one short centered label below. Equal illustration heights and baseline spacing. Top row y≈300, bottom row y≈560. Keep plenty of breathing room.
First top-left slot: the slender golden-ochre and dark vermilion spark from image 2, increased in actual visible size so it feels treasured rather than a tiny UI icon. Label "一點元宵火光" in clear 19px dark ink. Small delicate vermilion seal-like text "已收下" below, not a pill badge.
Other FIVE locked slots: delicate low-opacity gray-brown ink silhouettes, visible enough to invite curiosity but without intricate detail or colorful revelation. They depict respectively: an upright court festival lantern, a fish-shaped lantern, a peddler's carrying pole with small wares, a small acrobat on a wheel, and two theatrical costume figures. Labels respectively: "一盞燈影", "一尾游魚", "一擔小物", "一場巧技", "一身戲裝". Muted but readable 18px Traditional Chinese, no padlock icons or question mark blobs.
Near bottom of right surface, one quiet line: "點選已收下的圖樣，回看畫中的發現。" 15–16px, with a restrained thin divider above if needed. No long explanations, no repeated historical thumbnail, no sources, no elaborate navigation. Bottom-left of painting: one understated text action "← 回到長卷" on a small light silk wash, 18px, no large dark green button.
Typography constraints: precisely render requested Traditional Chinese text. Body 18–20px feel, no gigantic headlines or hairline tiny text. Use at most two compatible Chinese font styles. Calm charcoal, warm ivory, muted moss and vermilion accents. Historical painting remains the protagonist while six collection illustrations feel intentional and inviting. This screen must immediately read as a beautiful in-game collection overview, with ONE unlocked finding and FIVE mysteries, not an informational article.
Avoid: center modal; cards inside cards; busy borders; dense paragraphs; giant paragraphs over painting; heavy gradient glow; saturated yellow; gold luxury decoration; fake 3D book; star ratings; points; timeline; thumbnail repetition; clipping; overlap; animated motion trails; extra text beyond the specified copy.

## 版面規格

原畫佔左半邊、絹色收藏區佔右半邊，柔和過渡在文字區前已達不透明。文字使用思源宋體標題、20px 文楷正文。主色為絹紙 #f1ead7、墨色 #383c30、次要文字 #727461、收藏朱色 #93513d。六件圖樣沒有卡片容器，按三欄兩列對齊；未收下以淡墨顯示，已收下恢復色彩及小印記。總覽優先呈現收藏與進度，不堆疊解說。

單件頁保留左側原畫，右側依序展示名稱、收藏圖樣、短觀察及解說。資料來源收在可展開的畫作資料內。總覽和詳情切換：文字先淡出 180ms、原畫位置交疊切換 440ms、停定後解說淡入。合冊恢復玩家原來鏡頭與凝神設定。窄屏以畫作在上、收藏在下呈現；減少動態偏好停用移動與轉場。

