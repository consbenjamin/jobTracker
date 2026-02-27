"use strict";
// URL base fija de tu JobTracker en desarrollo.
// No usamos process.env aquí porque el service worker corre en el navegador,
// no en Node, y rompería el script.
const JOBTRACKER_BASE_URL = "http://localhost:3000";
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object")
        return;
    if (message.type === "SAVE_JOB" && message.payload) {
        const payload = message.payload;
        (async () => {
            try {
                const res = await fetch(`${JOBTRACKER_BASE_URL}/api/applications/import`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ job: payload }),
                });
                if (!res.ok) {
                    const errorText = await res.text().catch(() => "");
                    sendResponse({
                        ok: false,
                        status: res.status,
                        error: errorText || "Error al guardar en JobTracker",
                    });
                    return;
                }
                const data = await res.json().catch(() => ({}));
                sendResponse({ ok: true, data });
            }
            catch (error) {
                sendResponse({
                    ok: false,
                    error: error instanceof Error
                        ? error.message
                        : "Error de red al llamar a JobTracker",
                });
            }
        })();
        // Indica a Chrome que la respuesta será asíncrona
        return true;
    }
});
