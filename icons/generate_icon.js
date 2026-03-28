/**
 * Generate Japanese-style warm-toned map icon for PWA
 * 日式暖色風地圖圖標生成器
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Japanese warm color palette (日式暖色配色)
const COLORS = {
    bgLight: '#F5F0E6',      // 和紙色 (washi paper - light cream)
    bgDark: '#E8E0D0',       // 淺米色 (light beige)
    mapLine: '#C4A574',      // 木色 (wood color - light brown)
    mapFill: '#D4C4A8',      // 竹色 (bamboo - muted gold)
    accentRed: '#C44536',    // 朱色 (vermilion - torii gate red)
    accentPink: '#E8A0A0',   // 櫻花色 (sakura pink)
    accentGreen: '#8B9A6B',  // 竹綠 (bamboo green)
    marker: '#A0522D',       // 茶色 (tea brown)
    path: '#B8860B',         // 金色 (golden path)
    text: '#5C4B37',         // 墨色 (sumi ink - dark brown)
};

function createJapaneseMapIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Scale factor
    const scale = size / 512;
    
    // Center point
    const cx = Math.floor(size / 2);
    const cy = Math.floor(size / 2);
    
    // 1. Draw rounded square background (和風背景)
    const margin = Math.floor(20 * scale);
    const bgRadius = Math.floor(60 * scale);
    const bgSize = size - margin * 2;
    
    // Main background
    ctx.fillStyle = COLORS.bgLight;
    ctx.beginPath();
    ctx.roundRect(margin, margin, bgSize, bgSize, bgRadius);
    ctx.fill();
    
    // Inner shadow/border
    const innerMargin = margin + Math.floor(8 * scale);
    ctx.strokeStyle = COLORS.bgDark;
    ctx.lineWidth = Math.floor(4 * scale);
    ctx.beginPath();
    ctx.roundRect(innerMargin, innerMargin, size - innerMargin * 2, size - innerMargin * 2, bgRadius - Math.floor(10 * scale));
    ctx.stroke();
    
    // 2. Draw stylized map elements (地圖元素)
    const mapMargin = Math.floor(80 * scale);
    const lineColor = COLORS.mapLine;
    const lineWidth = Math.floor(3 * scale);
    
    // Curved path lines (蜿蜒路徑) - using bezier curves
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth + Math.floor(2 * scale);
    ctx.lineCap = 'round';
    
    // Top path
    ctx.beginPath();
    ctx.moveTo(mapMargin, cy - Math.floor(60 * scale));
    ctx.bezierCurveTo(
        cx - Math.floor(40 * scale), cy - Math.floor(80 * scale),
        cx + Math.floor(40 * scale), cy - Math.floor(40 * scale),
        size - mapMargin, cy - Math.floor(60 * scale)
    );
    ctx.stroke();
    
    // Bottom path
    ctx.beginPath();
    ctx.moveTo(mapMargin, cy + Math.floor(60 * scale));
    ctx.bezierCurveTo(
        cx - Math.floor(40 * scale), cy + Math.floor(40 * scale),
        cx + Math.floor(40 * scale), cy + Math.floor(80 * scale),
        size - mapMargin, cy + Math.floor(60 * scale)
    );
    ctx.stroke();
    
    // 3. Draw location markers (地標標記)
    const markerSize = Math.floor(25 * scale);
    
    // Main marker (center-top, prominent) - red torii-style
    const marker1X = cx - Math.floor(30 * scale);
    const marker1Y = cy - Math.floor(20 * scale);
    
    // Marker pin shape
    ctx.fillStyle = COLORS.accentRed;
    ctx.beginPath();
    ctx.arc(marker1X, marker1Y - Math.floor(5 * scale), markerSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Marker inner circle (white dot)
    ctx.fillStyle = COLORS.bgLight;
    ctx.beginPath();
    ctx.arc(marker1X, marker1Y - Math.floor(5 * scale), markerSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary marker (bottom-right) - green
    const marker2X = cx + Math.floor(50 * scale);
    const marker2Y = cy + Math.floor(40 * scale);
    ctx.fillStyle = COLORS.accentGreen;
    ctx.beginPath();
    ctx.arc(marker2X, marker2Y, markerSize - Math.floor(5 * scale), 0, Math.PI * 2);
    ctx.fill();
    
    // Third marker (top-left) - pink sakura
    const marker3X = cx - Math.floor(60 * scale);
    const marker3Y = cy - Math.floor(50 * scale);
    const smallMarkerSize = markerSize - Math.floor(8 * scale);
    ctx.fillStyle = COLORS.accentPink;
    ctx.beginPath();
    ctx.arc(marker3X, marker3Y, smallMarkerSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 4. Add decorative elements (裝飾元素)
    // Sakura petal hints (櫻花花瓣暗示)
    const petalColor = COLORS.accentPink;
    const petalSize = Math.floor(8 * scale);
    
    const petals = [
        { x: cx + Math.floor(80 * scale), y: cy - Math.floor(80 * scale), rotation: Math.PI / 6 },
        { x: cx - Math.floor(80 * scale), y: cy + Math.floor(70 * scale), rotation: -Math.PI / 4 },
        { x: cx + Math.floor(60 * scale), y: cy + Math.floor(80 * scale), rotation: Math.PI / 3 },
    ];
    
    ctx.fillStyle = petalColor;
    petals.forEach(petal => {
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, petalSize, petalSize / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
    
    // 5. Add subtle map-like details
    // Small dots for points of interest
    const dotColor = COLORS.mapFill;
    const dotSize = Math.floor(4 * scale);
    
    const dots = [
        { x: cx + Math.floor(20 * scale), y: cy - Math.floor(60 * scale) },
        { x: cx - Math.floor(50 * scale), y: cy + Math.floor(30 * scale) },
        { x: cx + Math.floor(70 * scale), y: cy + Math.floor(10 * scale) },
        { x: cx - Math.floor(20 * scale), y: cy + Math.floor(60 * scale) },
    ];
    
    ctx.fillStyle = dotColor;
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
    });
    
    return canvas;
}

function main() {
    const iconsDir = __dirname;
    
    // PWA standard icon sizes
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    sizes.forEach(size => {
        const canvas = createJapaneseMapIcon(size);
        const buffer = canvas.toBuffer('image/png');
        const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
        fs.writeFileSync(outputPath, buffer);
        console.log(`Created: ${outputPath} (${size}x${size})`);
    });
    
    console.log('\nAll icons generated successfully!');
    console.log('日式暖色風地圖圖標已生成完成！');
}

main();