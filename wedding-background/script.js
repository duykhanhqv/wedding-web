"use strict";

const { SpaceRenderer, MAX_PARTICLES, distribution } = window.WeddingSpace;

(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "wedding-star-studio-v1";
  const TEXT_LABELS = {
    names: "Tên cô dâu & chú rể",
    date: "Ngày cưới",
  };
  const textItem = (content, font, size, x, y, spacing = 0) => ({
    content, font, size, color: "#e9e9f2", brightness: 0.92, glow: 7,
    spacing, x, y, visible: true,
  });
  const defaults = () => ({
    phase: 0, playing: true, renderDuration: 60,
    speed: 0.72, density: 0.86, centerConcentration: 0.5, fineDensity: 0.88,
    particleScale: 1.35, edgeDensity: 0.78, twinkle: 0.38, brightness: 0.98,
    fallingEnabled: true, fallingFrequency: 0.62,
    dropEnabled: true, dropFrequency: 0.85, rippleIntensity: 0.72,
    exportDuration: 30,
    texts: {
      names: textItem("Hồng Nhung & Duy Khánh", "bickham", 82, 50, 48),
      date: textItem("15.11.2026", "bickham", 42, 50, 59, 2),
    },
  });

  function mergeSaved(saved) {
    const base = defaults();
    if (!saved || typeof saved !== "object") return base;
    for (const key of ["speed","density","centerConcentration","fineDensity","particleScale","edgeDensity","twinkle","brightness","fallingEnabled","fallingFrequency","dropEnabled","dropFrequency","rippleIntensity","exportDuration"])
      if (saved[key] !== undefined) base[key] = saved[key];
    if (saved.fallingEnabled === undefined && saved.shootingEnabled !== undefined) base.fallingEnabled = saved.shootingEnabled;
    if (saved.fallingFrequency === undefined && saved.shootingFrequency !== undefined) base.fallingFrequency = saved.shootingFrequency;
    for (const key of Object.keys(base.texts))
      if (saved.texts?.[key]) Object.assign(base.texts[key], saved.texts[key]);
    for (const item of Object.values(base.texts)) item.font = "bickham";
    return base;
  }

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { localStorage.removeItem(STORAGE_KEY); }
  const state = mergeSaved(saved);
  let renderer = null, previousTime = 0, frameSupport = null, recording = null, downloadURL = null;
  const canvas = $("background-canvas");
  const showError = (message) => { $("error").textContent = message; $("error").hidden = !message; };
  const notice = (message) => { $("notice").textContent = message; $("notice").hidden = !message; };
  const render = () => renderer?.render(state.phase, state);

  function revokeDownload() {
    if (downloadURL) URL.revokeObjectURL(downloadURL);
    downloadURL = null;$("download").removeAttribute("href");$("download").hidden = true;
  }
  function changed() { revokeDownload(); updateUI(); render(); }

  const motionFields = [
    ["speed", "Tốc độ hạt", 0.2, 1.6, 0.05, "×"],
    ["density", "Mật độ tổng", 0.25, 1, 0.01, "%"],
    ["centerConcentration", "Độ tập trung vào tâm", 0, 1, 0.01, "%"],
    ["fineDensity", "Mật độ bụi mịn", 0.15, 1, 0.01, "%"],
    ["particleScale", "Kích thước & độ sáng hạt", 0.7, 1.7, 0.01, "×"],
    ["edgeDensity", "Mật độ hạt ở rìa", 0, 1, 0.01, "%"],
    ["twinkle", "Độ lấp lánh", 0, 1, 0.01, "%"],
    ["brightness", "Độ sáng", 0.45, 1.35, 0.01, "%"],
    ["fallingFrequency", "Tần suất hạt rơi", 0, 1, 0.01, "%"],
    ["dropFrequency", "Tần suất chạm tạo gợn", 0, 1, 0.01, "%"],
    ["rippleIntensity", "Cường độ gợn sóng", 0, 1.4, 0.01, "%"],
  ];
  for (const [key, label, min, max, step] of motionFields) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<label class="slider-label" for="${key}">${label}<output id="${key}-value"></output></label><input id="${key}" type="range" min="${min}" max="${max}" step="${step}">`;
    $("motion-controls").append(wrapper);
    $(key).addEventListener("input", (event) => { state[key] = Number(event.target.value); changed(); });
  }
  const effectToggles = document.createElement("div");
  effectToggles.className = "effect-toggles";
  effectToggles.innerHTML = `<label><input id="falling-enabled" type="checkbox"> Hạt rơi</label><label><input id="drop-enabled" type="checkbox"> Chạm & gợn sóng</label>`;
  $("motion-controls").append(effectToggles);
  for (const [id, key] of [["falling-enabled","fallingEnabled"],["drop-enabled","dropEnabled"]])
    $(id).addEventListener("change", (event) => { state[key] = event.target.checked;changed(); });

  function createTextEditors() {
    for (const [key, label] of Object.entries(TEXT_LABELS)) {
      const details = document.createElement("details");
      details.className = "text-editor";details.open = key === "names";
      details.innerHTML = `<summary><span>${label}</span><label class="visibility"><input type="checkbox" data-key="${key}" data-prop="visible"> Hiện</label></summary>
        <div class="editor-body">
          <label>Nội dung<input type="text" data-key="${key}" data-prop="content"></label>
          <label>Màu<input type="color" data-key="${key}" data-prop="color"></label>
          <div class="editor-ranges"></div>
        </div>`;
      const ranges = details.querySelector(".editor-ranges");
      for (const [prop, caption, min, max, step] of [
        ["size","Cỡ chữ",12,150,1],["brightness","Độ sáng",.2,1.4,.01],["glow","Quầng sáng",0,30,1],
        ["spacing","Khoảng cách chữ",-3,24,.5],["x","Vị trí ngang",0,100,.5],["y","Vị trí dọc",0,100,.5],
      ]) ranges.insertAdjacentHTML("beforeend", `<label class="slider-label">${caption}<output data-output="${key}-${prop}"></output></label><input type="range" min="${min}" max="${max}" step="${step}" data-key="${key}" data-prop="${prop}">`);
      $("text-editors").append(details);
    }
    $("text-editors").addEventListener("input", (event) => {
      const { key, prop } = event.target.dataset;if (!key || !prop) return;
      state.texts[key][prop] = event.target.type === "checkbox" ? event.target.checked : ["content","color"].includes(prop) ? event.target.value : Number(event.target.value);
      changed();
    });
  }
  createTextEditors();

  function updateUI() {
    $("play").textContent = state.playing ? "Ⅱ Tạm dừng" : "▶ Chạy";
    for (const [key,,, , ,suffix] of motionFields) {
      $(key).value = state[key];
      const value = suffix === "%" ? `${Math.round(state[key] * 100)}%` : `${state[key].toLocaleString("vi-VN")}${suffix}`;
      $(`${key}-value`).value = value;
    }
    $("falling-enabled").checked = state.fallingEnabled;$("drop-enabled").checked = state.dropEnabled;
    $("export-duration").value = state.exportDuration;
    for (const [key, item] of Object.entries(state.texts)) {
      for (const element of document.querySelectorAll(`[data-key="${key}"][data-prop]`)) {
        const prop = element.dataset.prop;element.type === "checkbox" ? element.checked = item[prop] : element.value = item[prop];
      }
      for (const prop of ["size","brightness","glow","spacing","x","y"]) {
        const output = document.querySelector(`[data-output="${key}-${prop}"]`);
        if (output) output.value = ["x","y"].includes(prop) ? `${item[prop]}%` : item[prop];
      }
    }
    const visibleParticles = MAX_PARTICLES * state.density * (0.06 + 0.94 * state.fineDensity);
    $("particle-count").textContent = Math.round(visibleParticles).toLocaleString("vi-VN");
    $("preview-state").textContent = recording ? "Đang xuất video" : state.playing ? "Đang chuyển động" : "Tạm dừng";
    $("export").disabled = !renderer || !frameSupport || Boolean(recording);
    $("export-info").textContent = frameSupport ? `1920 × 1080 · ${frameSupport.extension.toUpperCase()} · ${state.exportDuration} giây · nền và chữ` : "Trình duyệt này chưa hỗ trợ WebCodecs. Hãy dùng Chrome hoặc Edge bản mới.";
  }

  function resize() {
    if (!renderer) return;
    const bounds = canvas.getBoundingClientRect();const ratio = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * ratio));const height = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== width || canvas.height !== height) renderer.resize(width, height);render();
  }
  function tick(time) {
    if (state.playing && !document.hidden && !recording && previousTime) state.phase = (state.phase + (time - previousTime) / 60000) % 1;
    if (state.playing && !document.hidden && !recording) render();previousTime = time;requestAnimationFrame(tick);
  }

  $("play").addEventListener("click", () => { state.playing = !state.playing;previousTime = 0;updateUI(); });
  $("reset").addEventListener("click", () => { const fresh = defaults();Object.assign(state, fresh);state.texts = fresh.texts;changed();notice("Đã khôi phục cấu hình mặc định."); });
  $("export-duration").addEventListener("change", (event) => { state.exportDuration = Number(event.target.value);changed(); });
  $("save").addEventListener("click", () => {
    const stored = JSON.parse(JSON.stringify(state));delete stored.phase;delete stored.playing;delete stored.renderDuration;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));notice("Đã lưu cấu hình trên trình duyệt này.");
  });
  $("clear-save").addEventListener("click", () => { localStorage.removeItem(STORAGE_KEY);notice("Đã xóa cấu hình đã lưu."); });
  $("fullscreen").addEventListener("click", async () => { try { await $("stage").requestFullscreen(); } catch (error) { showError(`Không mở được toàn màn hình: ${error.message}`); } });
  document.addEventListener("fullscreenchange", resize);new ResizeObserver(resize).observe($("stage"));window.addEventListener("resize", resize);
  for (const tab of document.querySelectorAll(".tab")) tab.addEventListener("click", () => {
    document.querySelectorAll(".tab,.panel").forEach((element) => element.classList.remove("active"));tab.classList.add("active");$(tab.dataset.panel).classList.add("active");
  });

  function finishRecording(job) {
    job.renderer?.dispose();if (recording !== job) return;recording = null;$("recording-status").hidden = true;
    if (job.aborted) { updateUI();render();return; }
    const extension = job.result.extension;revokeDownload();downloadURL = URL.createObjectURL(job.result.blob);
    $("download").href = downloadURL;$("download").download = `wedding-star-background-${job.duration}s.${extension}`;
    $("download").textContent = `↓ Tải ${extension.toUpperCase()} · ${(job.result.blob.size / 1048576).toFixed(1)} MB`;$("download").hidden = false;
    notice(`Đã xuất ${job.duration} giây, 1920 × 1080, 30fps gồm nền và chữ.`);updateUI();render();
  }
  function abortRecording() { if (!recording) return;recording.aborted = true;recording.controller.abort();notice("Đã hủy xuất video."); }
  $("cancel-export").addEventListener("click", abortRecording);
  $("export").addEventListener("click", () => {
    if (!renderer || !frameSupport || recording) return;revokeDownload();showError("");notice("");
    const duration = state.exportDuration;const job = { duration, aborted: false, controller: new AbortController() };recording = job;updateUI();
    $("recording-status").hidden = false;$("record-progress").value = 0;$("record-label").textContent = "Đang chuẩn bị video…";
    try {
      const exportCanvas = document.createElement("canvas");exportCanvas.width = 1920;exportCanvas.height = 1080;
      job.renderer = new SpaceRenderer(exportCanvas, () => job.controller.abort());
      const settings = JSON.parse(JSON.stringify(state));settings.renderDuration = duration;settings.playing = false;
      WeddingVideoExport.encode({ renderer: job.renderer, settings, frames: duration * 30, support: frameSupport, signal: job.controller.signal,
        onProgress(progress) { if (job.aborted) return;$("record-progress").value = progress * 100;$("record-label").textContent = `Đang mã hóa ${Math.round(progress * 100)}% · ${Math.round(progress * duration * 30)} / ${duration * 30} khung hình`; },
      }).then((result) => { job.result = result;finishRecording(job); }).catch((error) => { const aborted = job.aborted;job.aborted = true;finishRecording(job);if (!aborted) showError(`Không thể xuất video: ${error.message}`); });
    } catch (error) { job.aborted = true;finishRecording(job);showError(`Không thể xuất video: ${error.message}`); }
  });

  async function start() {
    try {
      const loadedFonts = await document.fonts.load('64px "HLT Bickham Script Pro"');
      if (!loadedFonts.length) throw new Error("Không tải được font HLT Bickham Script Pro.");
      renderer = new SpaceRenderer(canvas, () => showError("WebGL bị gián đoạn. Hãy tải lại trang."));
      window.weddingApp = {
        state,
        get renderer() { return renderer; },
        render,
        SpaceRenderer,
        get exportSupport() { return frameSupport; },
        distribution,
      };
      frameSupport = await WeddingVideoExport.getSupport();resize();updateUI();requestAnimationFrame(tick);
    } catch (error) { showError(error.message || "Không thể khởi tạo không gian WebGL.");updateUI(); }
  }
  start();
})();
