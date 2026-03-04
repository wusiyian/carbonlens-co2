// server.cjs （用 require）
const express = require('express');
const cors = require('cors');
const lighthouse = require('lighthouse').default || require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ==================== 自动创建专用临时目录（关键部分） ====================
const tempDir = path.join(__dirname, 'lighthouse-temp');

// 如果文件夹不存在就自动创建
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`✅ 已自动创建临时目录: ${tempDir}`);
} else {
    console.log(`✅ 使用现有临时目录: ${tempDir}`);
}

// 自动赋予完全权限（解决 EPERM）
try {
    fs.chmodSync(tempDir, 0o777);   // 给予所有人读写执行权限
    console.log('✅ 已自动赋予临时目录写入权限');
} catch (permErr) {
    console.warn('⚠️ 设置权限失败（可忽略）: ${permErr.message}');
}
// =====================================================================

app.get('/api/audit', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: '缺少 url 参数' });

    console.log(`🚀 开始 Lighthouse 审计: ${url}`);

    try {
        const chrome = await chromeLauncher.launch({
            chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
            userDataDir: tempDir
        });

        const runnerResult = await lighthouse(url, {
            port: chrome.port,
            output: 'json',
            logLevel: 'error',
            onlyCategories: ['performance'],
            settings: {
                throttlingMethod: 'simulate',
                formFactor: 'mobile',
                screenEmulation: { mobile: true }
            }
        });

        const lh = runnerResult.lhr;

        let bytes = lh.audits['total-byte-weight']?.numericValue || 0;

        if (bytes === 0 || bytes < 10000) {
            const items = lh.audits['resource-summary']?.details?.items || [];
            bytes = items.reduce((sum, item) => sum + (item.transferSize || 0), 0);
        }

        await chrome.kill();

        await new Promise(resolve => setTimeout(resolve, 2000));


        try {
            const files = fs.readdirSync(tempDir);
            for (const file of files) {
                const filePath = path.join(tempDir, file);
                fs.rmSync(filePath, { recursive: true, force: true });
            }
            console.log(`🗑️ 已自动删除临时目录: ${tempDir}`);
        } catch (cleanupErr) {
            retries++;
            console.warn(`⚠️ 清理临时目录失败: ${cleanupErr.message}（可忽略）`);
        }


        res.json({
            success: true,
            bytes: Math.round(bytes),
            url: url,
            performanceScore: Math.round(lh.categories.performance.score * 100)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lighthouse 审计失败', message: err.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Lighthouse 本地服务已启动 → http://localhost:${PORT}`);
    console.log(`临时目录位置: ${tempDir} （自动创建并赋予权限）`);
});