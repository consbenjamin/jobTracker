const DEFAULT_BASE_URL = "https://job-tracker-tool.vercel.app";

function $(id) {
  return document.getElementById(id);
}

function setStatus(message, isError = false) {
  const el = $("status");
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? "#b91c1c" : "#065f46";
}

function loadOptions() {
  chrome.storage.sync.get(
    {
      jobtrackerBaseUrl: DEFAULT_BASE_URL,
      jobtrackerToken: "",
    },
    (items) => {
      const baseUrlInput = $("baseUrl");
      const tokenInput = $("token");
      if (baseUrlInput) baseUrlInput.value = items.jobtrackerBaseUrl || DEFAULT_BASE_URL;
      if (tokenInput) tokenInput.value = items.jobtrackerToken || "";
    }
  );
}

function saveOptions() {
  const baseUrlInput = $("baseUrl");
  const tokenInput = $("token");
  const baseUrl = baseUrlInput?.value.trim() || DEFAULT_BASE_URL;
  const token = tokenInput?.value.trim() || "";

  chrome.storage.sync.set(
    {
      jobtrackerBaseUrl: baseUrl,
      jobtrackerToken: token,
    },
    () => {
      setStatus("Saved. You can now use the extension on LinkedIn.");
    }
  );
}

function useLocalhost() {
  const origin = "http://localhost:3000/*";
  chrome.permissions.request(
    {
      origins: [origin],
    },
    (granted) => {
      if (!granted) {
        setStatus("Permission for localhost was not granted.", true);
        return;
      }
      const baseUrlInput = $("baseUrl");
      if (baseUrlInput) baseUrlInput.value = "http://localhost:3000";
      saveOptions();
      setStatus("Switched to http://localhost:3000. Make sure your dev server is running.");
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  loadOptions();
  const saveBtn = $("save");
  const prodBtn = $("useProd");
  const localBtn = $("useLocal");
  if (saveBtn) saveBtn.addEventListener("click", saveOptions);
  if (prodBtn)
    prodBtn.addEventListener("click", () => {
      const baseUrlInput = $("baseUrl");
      if (baseUrlInput) baseUrlInput.value = DEFAULT_BASE_URL;
      saveOptions();
      setStatus("Switched to production URL.");
    });
  if (localBtn) localBtn.addEventListener("click", useLocalhost);
});

