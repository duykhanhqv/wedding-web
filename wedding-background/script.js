"use strict";

const { SpaceRenderer, MAX_PARTICLES } = window.WeddingSpace;

(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "wedding-star-studio-v1";
  const TEXT_LABELS = {
    monogram: "Monogram",
    title: "Tiêu đề nhỏ",
    names: "Tên cặp đôi",
    date: "Ngày cưới",
    message: "Lời nhắn",
    heart: "Biểu tượng trái tim",
  };
  const textItem = (content, font, size, x, y, spacing = 0) => ({
    content, font, size, color: "#e9e9f2", brightness: 0.92, glow: 7,
    spacing, x, y, visible: true,
  });
  const defaults = () => ({
    phase: 0, playing: true, renderDuration: 60,
    speed: 0.72, density: 0.72, twinkle: 0.45, brightness: 0.92,
    mode: "alternating", sceneOneSeconds: 6, sceneTwoSeconds: 4.5, fadeSeconds: 1.2,
    exportDuration: 30,
    texts: {
      monogram: textItem("HD", "script", 92, 50, 34),
      title: textItem("SAVE THE DATE", "serif", 20, 50, 42, 8),
      names: textItem("Hồng Nhung & Duy Khánh", "script", 68, 50, 50),
      date: textItem("15.11.2026", "serif", 19, 50, 58, 4),
      message: textItem("Cảm ơn bạn đã đến\nchung vui cùng chúng tôi", "serif", 32, 50, 49, 1),
      heart: textItem("♥", "serif", 30, 50, 59),
    },
  });

  function mergeSaved(saved) {
    const base = defaults();
    if (!saved || typeof saved !== "object") return base;
    for (const key of ["speed","density","twinkle","brightness","mode","sceneOneSeconds","sceneTwoSeconds","fadeSeconds","exportDuration"])
      if (saved[key] !== undefined) base[key] = saved[key];
    for (const key of Object.keys(base.texts))
      if (saved.texts?.[key]) Object.assign(base.texts[key], saved.texts[key]);
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
    ["density", "Mật độ", 0.25, 1, 0.01, "%"],
    ["twinkle", "Độ lấp lánh", 0, 1, 0.01, "%"],
    ["brightness", "Độ sáng", 0.45, 1.35, 0.01, "%"],
  ];
  for (const [key, label, min, max, step] of motionFields) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<label class="slider-label" for="${key}">${label}<output id="${key}-value"></output></label><input id="${key}" type="range" min="${min}" max="${max}" step="${step}">`;
    $("motion-controls").append(wrapper);
    $(key).addEventListener("input", (event) => { state[key] = Number(event.target.value); changed(); });
  }

  function createTextEditors() {
    for (const [key, label] of Object.entries(TEXT_LABELS)) {
      const details = document.createElement("details");
      details.className = "text-editor";details.open = key === "names";
      details.innerHTML = `<summary><span>${label}</span><label class="visibility"><input type="checkbox" data-key="${key}" data-prop="visible"> Hiện</label></summary>
        <div class="editor-body">
          <label>Nội dung${key === "message" ? `<textarea rows="3" data-key="${key}" data-prop="content"></textarea>` : `<input type="text" data-key="${key}" data-prop="content">`}</label>
          <div class="two-cols"><label>Font<select data-key="${key}" data-prop="font"><option value="script">Great Vibes</option><option value="serif">Georgia</option><option value="classic">Times</option><option value="sans">Arial</option></select></label><label>Màu<input type="color" data-key="${key}" data-prop="color"></label></div>
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
      state.texts[key][prop] = event.target.type === "checkbox" ? event.target.checked : ["content","font","color"].includes(prop) ? event.target.value : Number(event.target.value);
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
    $("mode").value = state.mode;$("scene-one").value = state.sceneOneSeconds;$("scene-two").value = state.sceneTwoSeconds;
    $("fade-seconds").value = state.fadeSeconds;$("fade-seconds-value").value = `${state.fadeSeconds.toLocaleString("vi-VN")} giây`;
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
    $("particle-count").textContent = Math.round(MAX_PARTICLES * state.density).toLocaleString("vi-VN");
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
  $("mode").addEventListener("change", (event) => { state.mode = event.target.value;changed(); });
  for (const [id, key] of [["scene-one","sceneOneSeconds"],["scene-two","sceneTwoSeconds"],["fade-seconds","fadeSeconds"]])
    $(id).addEventListener("input", (event) => { state[key] = Number(event.target.value);changed(); });
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
      await document.fonts.load('64px "Great Vibes"');
      renderer = new SpaceRenderer(canvas, () => showError("WebGL bị gián đoạn. Hãy tải lại trang."));
      window.weddingApp = {
        state,
        get renderer() { return renderer; },
        render,
        SpaceRenderer,
        get exportSupport() { return frameSupport; },
      };
      frameSupport = await WeddingVideoExport.getSupport();resize();updateUI();requestAnimationFrame(tick);
    } catch (error) { showError(error.message || "Không thể khởi tạo không gian WebGL.");updateUI(); }
  }
  start();
})();
