import sounddevice as sd  # 音频库，用于获取麦克风输入，监听音量
import numpy as np
import asyncio
import websockets
import time
from colorama import (
    Fore,
    Style,
    init,
)  # github开源项目，控制台彩色输出，用于不同日志类型颜色区分

init(autoreset=True)  # 初始化colorama，自动重置颜色

# 配置参数
THRESHOLD = 0.01  # 音量阈值
DELAY = 2  # 静音恢复延迟,s

clients = set()
is_speaking = False
last_voice_time = 0
main_loop = None


# 日志函数
def log(level, msg, color=Fore.WHITE):
    now = time.strftime("%H:%M:%S")
    print(color + f"[{now}] [{level}] {msg}" + Style.RESET_ALL)


# 处理 WebSocket 客户端连接
async def handler(websocket):
    clients.add(websocket)
    log("Z连接", "浏览器已连接", Fore.GREEN)
    try:
        await websocket.wait_closed()
    finally:
        clients.discard(websocket)
        log("Z连接", "浏览器已断开", Fore.RED)


# 广播消息给所有客户端
async def broadcast(message):
    if clients:
        await asyncio.gather(*[client.send(message) for client in clients])


# 音频回调，检测说话/静音状态
def audio_callback(indata, frames, time_info, status):
    global is_speaking, last_voice_time

    # 计算音量
    volume_norm = np.linalg.norm(indata) * 10
    current_volume = volume_norm / frames
    current_time = time.time()

    # 判断说话状态
    if current_volume > THRESHOLD:
        if not is_speaking:
            is_speaking = True
            asyncio.run_coroutine_threadsafe(broadcast("pause"), main_loop)
            log(
                "Z语音",
                f"检测到说话 | 音量={current_volume:.2f} -> 暂停播放",
                Fore.YELLOW,
            )
        last_voice_time = current_time
    else:
        if is_speaking and (current_time - last_voice_time > DELAY):
            is_speaking = False
            asyncio.run_coroutine_threadsafe(broadcast("play"), main_loop)
            log("Z语音", "检测到静音 -> 恢复播放", Fore.CYAN)


# 主函数
async def main():
    global main_loop
    main_loop = asyncio.get_running_loop()

    log("Z系统", f"服务启动 | 阈值={THRESHOLD}, 延迟={DELAY}s", Fore.BLUE)

    try:
        server = await websockets.serve(handler, "localhost", 8765)

        def safe_callback(indata, frames, time, status):
            try:
                if status:
                    log("音频", f"状态异常: {status}", Fore.YELLOW)

                audio_callback(indata, frames, time, status)

            except Exception as e:
                log("音频", f"回调异常: {e}", Fore.RED)

        with sd.InputStream(callback=safe_callback):
            await server.wait_closed()

    except Exception as e:
        log("系统", f"音频流或服务器异常: {e}", Fore.RED)


# 程序入口
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log("Z系统", "收到停止信号，程序退出", Fore.RED)
