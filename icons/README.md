# PWA Icons - 日式暖色風地圖圖標

## 圖標說明

本目錄包含為 PWA 生成的日式暖色風地圖圖標，採用以下設計元素：

- **風格**: 日式暖色調 (Japanese warm tone)
- **配色**:
  - 和紙色 (Washi paper) - `#F5F0E6` - 背景
  - 木色 (Wood color) - `#C4A574` - 地圖路徑
  - 朱色 (Vermilion) - `#C44536` - 主要地標標記
  - 櫻花色 (Sakura pink) - `#E8A0A0` - 裝飾花瓣
  - 竹綠 (Bamboo green) - `#8B9A6B` - 次要標記
- **設計元素**:
  - 圓角方形背景
  - 蜿蜒的地圖路徑線條
  - 三個不同顏色的地標標記
  - 櫻花花瓣裝飾

## 圖標列表

已生成的圖標文件：

| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| icon-72x72.png | 72x72 | 小尺寸設備 |
| icon-96x96.png | 96x96 | MDPI 設備 |
| icon-128x128.png | 128x128 | Chrome Web Store |
| icon-144x144.png | 144x144 | XHDPI 設備 |
| icon-152x152.png | 152x152 | iPad |
| icon-192x192.png | 192x192 | Android 主屏幕 |
| icon-384x384.png | 384x384 | XXHDPI 設備 |
| icon-512x512.png | 512x512 | PWA 安裝/商店 |

## 如何重新生成圖標

如果需要修改圖標設計，可以使用以下 Node.js 腳本重新生成：

```bash
# 安裝依賴
npm install canvas

# 運行生成腳本
node icons/generate_icon.js
```

## 設計建議

- 圖標採用簡潔的設計，確保在小尺寸時仍可識別
- 使用暖色調營造溫馨、親和的視覺感受
- 日式元素（櫻花、和紙色）體現品牌特色
- 地圖元素直觀表達應用的旅行規劃功能

## manifest.json 配置

圖標已在 `manifest.json` 中配置，支持 PWA 安裝功能。