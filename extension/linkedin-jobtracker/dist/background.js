"use strict";
function getConfig() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({
            jobtrackerBaseUrl: "https://job-tracker-tool.vercel.app",
            jobtrackerToken: "",
        }, (items) => {
            resolve({
                baseUrl: (items.jobtrackerBaseUrl || "https://job-tracker-tool.vercel.app").replace(/\/+$/, ""),
                token: items.jobtrackerToken || "",
            });
        });
    });
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object")
        return;
    if (message.type === "SAVE_JOB" && message.payload) {
        const payload = message.payload;
        (async () => {
            try {
                const { baseUrl, token } = await getConfig();
                if (!token || !baseUrl) {
                    sendResponse({
                        ok: false,
                        error: "JobTracker extension is not configured. Set base URL and token in the extension options.",
                    });
                    return;
                }
                const res = await fetch(`${baseUrl}/api/applications/import`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
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
