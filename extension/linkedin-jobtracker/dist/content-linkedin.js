"use strict";
function queryText(selector) {
    const el = document.querySelector(selector);
    const text = el?.innerText?.trim();
    return text || undefined;
}
function getJobFromLinkedIn() {
    // Estos selectores son aproximados y pueden requerir ajustes
    let title = queryText(".job-details-jobs-unified-top-card__job-title") ??
        queryText("h1");
    let company = queryText(".job-details-jobs-unified-top-card__company-name a") ??
        queryText(".job-details-jobs-unified-top-card__company-name");
    const location = queryText(".job-details-jobs-unified-top-card__primary-description") ??
        queryText(".jobs-unified-top-card__bullet");
    const descriptionEl = document.querySelector(".jobs-description-content__text");
    const description = descriptionEl?.innerText ?? "";
    const possibleKeywords = [
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Node",
        "Node.js",
        "Express",
        "NestJS",
        "PostgreSQL",
        "MongoDB",
        "AWS",
        "GCP",
        "Azure",
        "Docker",
        "Kubernetes",
    ];
    const foundStack = possibleKeywords
        .filter((kw) => description.toLowerCase().includes(kw.toLowerCase()))
        .join(", ");
    const lowerTitle = (title ?? "").toLowerCase();
    let seniority;
    if (lowerTitle.includes("senior"))
        seniority = "Senior";
    else if (lowerTitle.includes("semi") || lowerTitle.includes("mid"))
        seniority = "Semi Senior";
    else if (lowerTitle.includes("jr") || lowerTitle.includes("junior"))
        seniority = "Junior";
    return {
        title,
        company,
        seniority,
        stack: foundStack || undefined,
        location,
        description: description || undefined,
        url: window.location.href,
    };
}
function createSaveButton() {
    const btn = document.createElement("button");
    btn.textContent = "Guardar en JobTracker";
    btn.id = "jobtracker-save-button";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "999px";
    btn.style.border = "1px solid #0a66c2";
    btn.style.backgroundColor = "#0a66c2";
    btn.style.color = "#ffffff";
    btn.style.padding = "8px 18px";
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "600";
    btn.style.position = "fixed";
    btn.style.bottom = "24px";
    btn.style.left = "24px";
    btn.style.zIndex = "999999";
    return btn;
}
function showToast(message, type = "success") {
    const existing = document.getElementById("jobtracker-toast");
    if (existing)
        existing.remove();
    const toast = document.createElement("div");
    toast.id = "jobtracker-toast";
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.right = "24px";
    toast.style.zIndex = "999999";
    toast.style.padding = "12px 16px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "500";
    toast.style.boxShadow = "0 4px 14px rgba(0,0,0,0.3)";
    toast.style.color = "#ffffff";
    toast.style.backgroundColor = type === "success" ? "#16a34a" : "#dc2626";
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3500);
}
function insertButtonIfNeeded() {
    if (document.getElementById("jobtracker-save-button"))
        return;
    const btn = createSaveButton();
    btn.addEventListener("click", () => {
        const job = getJobFromLinkedIn();
        // Mientras LinkedIn cambia el DOM, permitimos guardar aunque falte
        // empresa o título; el backend validará y tú puedes completar luego.
        chrome.runtime.sendMessage({
            type: "SAVE_JOB",
            payload: job,
        }, (response) => {
            if (!response) {
                showToast("Error al comunicar con la extensión.", "error");
                return;
            }
            if (response.ok) {
                showToast("Oferta guardada en JobTracker.");
            }
            else {
                showToast(response.error || "No se pudo guardar en JobTracker.", "error");
            }
        });
    });
    document.body.appendChild(btn);
}
function setupObserver() {
    insertButtonIfNeeded();
    const observer = new MutationObserver(() => {
        insertButtonIfNeeded();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupObserver, 1000);
    });
}
else {
    setTimeout(setupObserver, 1000);
}
