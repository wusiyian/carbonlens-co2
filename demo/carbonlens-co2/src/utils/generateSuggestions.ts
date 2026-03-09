import type { OptimizationSuggestion } from '@/types';

/**
 * 根据输入参数生成优化建议数组（纯函数，无副作用）
 * @param bytes 传输总字节数
 * @param gramsCO2e 当前碳排放值（g）
 * @param hasImages 是否有图片资源
 * @param hasFonts 是否有字体资源
 * @param hasCSS 是否有 CSS 资源
 * @returns 排序后的优化建议数组
 */
export function generateOptimizationSuggestions(
    bytes: number,
    gramsCO2e: number,
    hasImages: boolean,
    hasFonts: boolean,
    hasCSS: boolean
): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 图片懒加载
    if (hasImages && bytes > 1500000) {
        suggestions.push({
            id: 'lazy-loading',
            title: '启用图片懒加载',
            description: '延迟加载屏幕外图片，减少首次传输量',
            estimatedSavings: Math.min(0.15, gramsCO2e * 0.3).toFixed(3),
            codeSnippet: `<img src="..." alt="..." loading="lazy" width="..." height="..." />`,
            priority: 1
        });
    }

    // WebP 转换
    if (hasImages && bytes > 800000) {
        suggestions.push({
            id: 'webp-conversion',
            title: '图片转换为 WebP 格式',
            description: 'WebP 压缩率高 25–35%，显著降低图片体积',
            estimatedSavings: Math.min(0.3, gramsCO2e * 0.4).toFixed(3),
            codeSnippet: `<picture><source srcset="..." type="image/webp" /><img src="..." /></picture>`,
            priority: 2
        });
    }

    // 代码分割
    if (bytes > 500000) {
        suggestions.push({
            id: 'code-splitting',
            title: '启用代码分割（React.lazy）',
            description: '延迟加载非首屏组件，减少首屏 JS 体积',
            estimatedSavings: Math.min(0.2, gramsCO2e * 0.25).toFixed(3),
            codeSnippet: `const Component = React.lazy(() => import('./Component'));\n<Suspense fallback={<div>加载中...</div>}><Component /></Suspense>`,
            priority: 3
        });
    }

    // 碳感知暗模式（总是显示）
    suggestions.push({
        id: 'carbon-dark-mode',
        title: '碳感知暗模式',
        description: '高碳电网或低电量时自动切换深色主题，节省显示能耗',
        estimatedSavings: Math.min(0.12, gramsCO2e * 0.15).toFixed(3),
        codeSnippet: `@media (prefers-color-scheme: dark) and (prefers-reduced-data: reduce) { body { background: #121212; color: #e0e0e0; } }`,
        priority: 4
    });

    // 字体子集化
    if (hasFonts && bytes > 1000000) {
        suggestions.push({
            id: 'font-subsetting',
            title: '启用字体子集化',
            description: '只加载页面实际使用字符，减少字体文件大小 50%~90%',
            estimatedSavings: Math.min(0.2, gramsCO2e * 0.5).toFixed(3),
            codeSnippet: `<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700&subset=latin&display=swap" rel="stylesheet">`,
            priority: 5
        });
    }

    // CSS压缩
    if (hasCSS && bytes > 500000) {
        suggestions.push({
            id: 'css-minification',
            title: '启用 CSS 压缩',
            description: '去除空格/注释，减少 CSS 体积 10%~30%',
            estimatedSavings: Math.min(0.1, gramsCO2e * 0.2).toFixed(3),
            codeSnippet: `// vite.config.ts\nimport cssnano from 'cssnano';\nexport default { plugins: [cssnano()] };`,
            priority: 6
        });
    }

    // JS异步加载
    // if (hasBlockingJS && bytes > 500000) {
    //   suggestions.push({
    //     id: 'js-async-loading',
    //     title: '启用 JS 异步加载',
    //     description: '使用 async/defer 减少阻塞时间 20%~50%',
    //     estimatedSavings: Math.min(0.15, gramsCO2e * 0.3).toFixed(3),
    //     codeSnippet: `<script src="script.js" async></script>\n<script src="script.js" defer></script>`,
    //     priority: 7
    //   });
    // }

    // 按优先级排序
    return suggestions.sort((a, b) => a.priority - b.priority);
}