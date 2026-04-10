// ==UserScript==
// @name         B站语音控制-纯前端版
// @match        *://www.bilibili.com/video/*
// @match        *://www.bilibili.com/list/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const THRESHOLD = 0.01;   // 音量阈值
    const DELAY = 2000;       // 静音恢复延迟(ms)

    let isSpeaking = false;
    let lastVoiceTime = 0;

    const log = (msg, color = "green") => {
        console.log(`%c[VoiceCtrl] ${msg}`, `color:${color}`);
    };

    async function initMic() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;

            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.fftSize);

            function detect() {
                analyser.getByteTimeDomainData(dataArray);

                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    let val = (dataArray[i] - 128) / 128;
                    sum += val * val;
                }

                const volume = Math.sqrt(sum / dataArray.length);
                const now = Date.now();

                const video = document.querySelector('video');
                if (!video) {
                    requestAnimationFrame(detect);
                    return;
                }

                if (volume > THRESHOLD) {
                    if (!isSpeaking) {
                        isSpeaking = true;
                        video.pause();
                        log(`检测到说话 → 暂停 (${volume.toFixed(3)})`, "orange");
                    }
                    lastVoiceTime = now;
                } else {
                    if (isSpeaking && now - lastVoiceTime > DELAY) {
                        isSpeaking = false;
                        video.play();
                        log("恢复播放", "cyan");
                    }
                }

                requestAnimationFrame(detect);
            }

            detect();
            log("麦克风已启动", "blue");

        } catch (e) {
            log("麦克风权限失败: " + e.message, "red");
        }
    }

    // 等页面加载后执行
    window.addEventListener('load', () => {
        setTimeout(initMic, 2000);
    });

})();