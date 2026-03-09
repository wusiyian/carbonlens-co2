// src/api/greenHosting.ts

interface GreenHostingResult {
    green: boolean;
    hosted_by: string | null;
    provider?: { name: string; green?: boolean | null };
    // 其他字段如 supporting_documents 等，根据需要扩展
}

/**
 * 调用官方绿电检测 v3 API
 * @param domain 域名（如 vercel.com）
 * @returns 检测结果
 */
export async function fetchGreenHosting(domain: string): Promise<GreenHostingResult | null> {
    try {
        const apiUrl = `https://api.thegreenwebfoundation.org/api/v3/greencheck/${domain}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`绿电检测 API 返回 ${response.status}`);
        }

        const data = await response.json();

        console.log('绿电检测 v3 API 返回：', data);

        return data;
    } catch (err) {
        console.warn('绿电检测失败:', err);
        return null;
    }
}