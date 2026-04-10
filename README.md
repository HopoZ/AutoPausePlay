🚀 SmartPause（纯前端版）

SmartPause 是一个智能语音控制工具，可以通过浏览器直接监听麦克风音量：
👉 当你说话时自动暂停视频或音乐
👉 当你停止说话后自动恢复播放

无需 Python、无需后端服务，开箱即用
✨ 功能特点

    🟢 智能语音检测：实时监听麦克风音量判断是否在说话

    ⏸️ 自动暂停：说话时自动暂停网页视频/音乐

    ▶️ 自动恢复：静音一段时间后自动恢复播放

    🌐 纯前端实现：无需 Python / WebSocket

    ⚡ 零依赖：只需浏览器 + 油猴脚本

    🔁 自动运行：进入页面自动生效

🧠 工作原理

麦克风 → Web Audio API → 音量分析 → 控制 video 标签

核心流程：

    获取麦克风输入

    分析实时音量（RMS）

    判断是否超过阈值

    控制视频播放/暂停

⚙️ 技术说明
技术	说明
getUserMedia	获取麦克风
AudioContext	音频处理核心
AnalyserNode	音量分析
RMS	音量计算方法
📦 项目结构

SmartPause/
├─ single_b.js   # 油猴脚本（核心）
└─ README.md

🔧 安装与使用
1️⃣ 安装油猴插件

推荐使用：

    Tampermonkey

2️⃣ 安装脚本

    打开 Tampermonkey

    新建脚本

    粘贴 single_b.js

    保存

3️⃣ 开始使用

    打开 B站视频页面

    浏览器会请求麦克风权限（必须允许）

    开始说话 → 视频自动暂停

    停止说话 → 视频自动恢复

⚙️ 配置参数

在脚本中可修改：

```JavaScript
const THRESHOLD = 0.02; // 音量阈值（越大越不敏感）
const DELAY = 2000;     // 恢复延迟（毫秒）
```