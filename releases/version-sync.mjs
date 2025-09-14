import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');
const manifestJsonPath = path.join(__dirname, '../manifest.json');

try {
  // 读取 package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  // 读取 manifest.json
  const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));

  // 更新 manifest.json 的版本号
  manifestJson.version = version;

  // 写回 manifest.json
  fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2) + '\n');

  console.log(`✅ 版本同步成功: ${version}`);
  console.log(`   package.json: ${version}`);
  console.log(`   manifest.json: ${version}`);
} catch (error) {
  console.error('❌ 版本同步失败:', error.message);
  process.exit(1);
}