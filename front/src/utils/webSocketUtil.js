// src/utils/webSocketUtil.js

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

// Top-level export
export function connectWebSocket(onAisDataReceived) {
    const socketUrl = 'http://localhost:8080/ws';
    let isReconnecting = false;

    function createClient() {
        const socket = new SockJS(socketUrl);

        stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 0,
            onConnect: () => {
                console.log("✅ Connected to WebSocket server!");
                isReconnecting = false;
                stompClient.subscribe('/topic/ais-data', (msg) => {
                    try {
                        onAisDataReceived(JSON.parse(msg.body));
                    } catch {
                        console.error('❌ Invalid message format:', msg.body);
                    }
                });
            },
            onWebSocketClose: () => {
                console.warn("⚠️ WebSocket closed. Reconnecting...");
                if (!isReconnecting) {
                    isReconnecting = true;
                    tryReconnect();
                }
            },
            onStompError: (frame) => {
                console.error("❌ STOMP Error:", frame);
            }
        });

        stompClient.activate();
    }

    async function tryReconnect() {
        const retryInterval = 3000;
        const checkBackend = async () => {
            try {
                const res = await fetch("http://localhost:8080/actuator/health");
                return (await res.json()).status === "UP";
            } catch {
                return false;
            }
        };

        (function loop() {
            checkBackend().then(isUp => {
                if (isUp) {
                    console.log("✅ Backend is up again. Reconnecting...");
                    createClient();
                } else {
                    console.log("🔄 Waiting for backend...");
                    setTimeout(loop, retryInterval);
                }
            });
        })();
    }

    createClient();
}

// Top-level export
export function disconnectWebSocket() {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
        console.log('🛑 Disconnected from WebSocket');
    }
}
