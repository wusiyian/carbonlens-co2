// src/api/lighthouse.ts

interface LighthouseResponse {
    success: boolean;
    bytes: number;
    hasImages: boolean;
    hasFonts: boolean;
    hasCSS: boolean;
    // hasBlockingJS?: boolean; // 如果删了就注释
    error?: string;
}

/**
 * 调用本地 Lighthouse 服务获取审计数据
 * @param url 输入的网址
 * @returns 审计结果（成功或失败）
 */
export async function fetchLighthouseAudit(url: string): Promise<LighthouseResponse> {
    try {
        const apiUrl = `http://localhost:3001/api/audit?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`后端返回 ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || '审计失败');
        }

        return {
            success: true,
            bytes: data.bytes,
            hasImages: data.hasImages || false,
            hasFonts: data.hasFonts || false,
            hasCSS: data.hasCSS || false,
            // hasBlockingJS: data.hasBlockingJS || false,
        };
    } catch (err: any) {
        console.error('Lighthouse 审计失败:', err);
        return {
            success: false,
            bytes: 0,
            hasImages: false,
            hasFonts: false,
            hasCSS: false,
            // hasBlockingJS: false,
            error: err.message || '未知错误',
        };
    }
}