// ==UserScript==
// @name         B站语音控制-接收端
// @match        *://www.bilibili.com/video/*
// @match        *://www.bilibili.com/list/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let ws;

    // 日志函数
    const log = (level, msg) => {
        const colors = {
            "info": "color: blue",
            "warn": "color: orange",
            "error": "color: red",
            "voice": "color: green"
        };
        console.log(`%c[${level}][HopoZ] ${msg}`, colors[level] || "color: black");
    };

    // 建立 WebSocket 连接
    const connect = () => {
        ws = new WebSocket('ws://localhost:8765');

        ws.onopen = () => {
            log("info", "已连接到后端");
            document.title = "【已连麦】" + document.title;
        };

        ws.onmessage = (event) => {
            const video = document.querySelector('video');
            if (!video) return;

            if (event.data === "pause") {
                video.playbackRate = 0;
                video.pause();
                document.querySelector('.bpx-player-ctrl-play')?.classList.add('bpx-state-paused');
                log("voice", "暂停视频");
            } else if (event.data === "play") {
                video.playbackRate = 1;
                const playBtn = document.querySelector('.bpx-player-ctrl-play');
                if (video.paused && playBtn) {
                    playBtn.click();
                } else {
                    video.play();
                }
                log("voice", "播放视频");
            }
        };

        ws.onclose = () => {
            log("warn", "连接断开，3秒后重连");
            setTimeout(connect, 3000);
        };
    };

    connect();
})();