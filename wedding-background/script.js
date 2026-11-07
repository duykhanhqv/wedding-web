"use strict";

const { TextureRenderer, prepareAsset } = window.WeddingMotion;

(() => {
  const $ = (id) => document.getElementById(id);
  const defaults = () => ({
    speed: 1,
    amplitude: 28,
    phase: 0,
    playing: false,
    original: false,
    top: {
      enabled: true,
      x: 0.5,
      y: 0.165,
      width: 1,
      height: 0.33,
      feather: 0.22,
    },
    bottom: {
      enabled: true,
      x: 0.5,
      y: 0.815,
      width: 1,
      height: 0.37,
      feather: 0.22,
    },
  });
  const state = { ...defaults(), image: null, motionAsset: null };
  let renderer = null,
    recording = null,
    raf = 0,
    previousTime = 0,
    loadVersion = 0,
    loading = false,
    downloadURL = null,
    pendingImage = null,
    frameSupport = null,
    checkingEncoder = true;
  const canvas = $("background-canvas");
  const showError = (message) => {
    $("error").textContent = message;
    $("error").hidden = !message;
  };
  const notice = (message) => {
    $("notice").textContent = message;
    $("notice").hidden = !message;
  };
  const duration = () => Math.round(900 / state.speed) / 30;
  const seconds = (number) => Number(number.toFixed(1)).toLocaleString("vi-VN");
  const ready = () =>
    Boolean(
      renderer &&
        !renderer.lost &&
        state.image &&
        state.motionAsset &&
        !loading,
    );
  const renderPreview = () => {
    if (renderer) renderer.render(state.phase, state);
  };

  for (const [name, title, caption] of [
    ["top", "Vùng phía trên", "DẢI SAO 01"],
    ["bottom", "Vùng phía dưới", "DẢI SAO 02"],
  ]) {
    const section = document.createElement("section");
    section.className = "mask";
    section.innerHTML = `<div class="mask-header"><label><input id="${name}-enabled" type="checkbox" checked>${title}</label><span class="mask-caption">${caption}</span></div><details><summary>Vị trí & phạm vi mặt nạ</summary><div class="mask-parameters"></div></details>`;
    const parameters = section.querySelector(".mask-parameters");
    for (const [key, label, min, max] of [
      ["y", "Tâm dọc", name === "top" ? 0 : 63, name === "top" ? 35 : 100],
      ["height", "Chiều cao", 2, 100],
      ["x", "Tâm ngang", 0, 100],
      ["width", "Chiều rộng", 2, 100],
      ["feather", "Độ mềm biên", 5, 80],
    ]) {
      const id = `${name}-${key}`;
      parameters.insertAdjacentHTML(
        "beforeend",
        `<label class="slider-label" for="${id}">${label}<output id="${id}-value" for="${id}"></output></label><input id="${id}" type="range" min="${min}" max="${max}" step="1" value="${Math.round(state[name][key] * 100)}">`,
      );
    }
    $("mask-controls").append(section);
    $(`${name}-enabled`).addEventListener("change", (event) => {
      state[name].enabled = event.target.checked;
      revokeDownload();
      renderPreview();
    });
    for (const key of ["x", "y", "width", "height", "feather"])
      $(`${name}-${key}`).addEventListener("input", (event) => {
        state[name][key] = Number(event.target.value) / 100;
        revokeDownload();
        updateUI();
        renderPreview();
      });
  }
  function updateUI() {
    $("settings").disabled = Boolean(recording);
    $("play").disabled = !ready();
    $("original").disabled = !ready();
    $("play").textContent = state.playing ? "Ⅱ Tạm dừng" : "▶ Chạy";
    $("original").setAttribute("aria-pressed", String(state.original));
    $("original").textContent = state.original
      ? "Về chuyển động"
      : "Xem ảnh gốc";
    $("speed").value = state.speed;
    $("amplitude").value = state.amplitude;
    $("speed-value").value = `${state.speed.toLocaleString("vi-VN")}×`;
    $("amplitude-value").value = `${state.amplitude} px`;
    $("loop-duration").textContent = `${seconds(duration())} giây / vòng`;
    for (const name of ["top", "bottom"]) {
      $(`${name}-enabled`).checked = state[name].enabled;
      for (const key of ["x", "y", "width", "height", "feather"]) {
        const value = Math.round(state[name][key] * 100);
        $(`${name}-${key}`).value = value;
        $(`${name}-${key}-value`).value = `${value}%`;
      }
    }
    $("preview-state").textContent = loading
      ? "Đang tải ảnh…"
      : !ready()
        ? "Chưa sẵn sàng"
        : recording
          ? "Đang ghi video"
          : state.original
            ? "Ảnh gốc"
            : state.playing
              ? "Đang chuyển động"
              : "Tạm dừng";
    $("export").disabled =
      !ready() || Boolean(recording) || checkingEncoder || !frameSupport;
    $("export-info").textContent = checkingEncoder
      ? "Đang kiểm tra định dạng xuất video…"
      : frameSupport
        ? `1920 × 1080 · ${frameSupport.extension.toUpperCase()} · ${seconds(duration())} giây. Mã hóa đủ 30 khung hình/giây; giữ tab hiển thị. Thời gian xử lý tùy máy.`
        : "Trình duyệt này chưa hỗ trợ xuất video 1080p30. Hãy dùng Chrome hoặc Edge bản mới, mở trực tiếp tệp, qua localhost hoặc HTTPS.";
    $("fullscreen").disabled =
      !ready() || Boolean(recording) || !$("stage").requestFullscreen;
  }
  function resizePreview() {
    if (!renderer) return;
    const bounds = canvas.getBoundingClientRect(),
      ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * ratio)),
      height = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== width || canvas.height !== height)
      renderer.resize(width, height);
    renderPreview();
  }
  function tick(time) {
    if (state.playing && !document.hidden && !recording && ready()) {
      if (previousTime)
        state.phase =
          (state.phase + (((time - previousTime) / 1000) * state.speed) / 30) %
          1;
      renderPreview();
    }
    previousTime = time;
    raf = requestAnimationFrame(tick);
  }
  const decodeImage = (src) =>
    new Promise((resolve, reject) => {
      if (src instanceof HTMLImageElement) {
        resolve(src);
        return;
      }
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(
          new Error(
            "Không đọc được ảnh. Hãy chọn tệp PNG, JPEG hoặc WebP hợp lệ từ máy.",
          ),
        );
      image.src = src;
    });
  async function loadImage(src, name, isDefault = false) {
    const version = ++loadVersion;
    loading = true;
    showError("");
    updateUI();
    try {
      let image = await decodeImage(src);
      if (version !== loadVersion) return;
      pendingImage = { image, name, version, isDefault };
      try {
        $("preview-state").textContent = "Đang phân tích các chấm…";
        let asset = await prepareAsset(image, (message) => {
          if (version === loadVersion) $("preview-state").textContent = message;
        });
        if (version !== loadVersion) return;
        renderer.setAsset(asset);
        state.motionAsset = asset;
      } catch (error) {
        if (!isDefault || location.protocol !== "file:") throw error;
        // Exact original PNG bytes, only loaded for browsers restricting file:// textures.
        await new Promise((resolve, reject) => {
          if (window.WEDDING_BACKGROUND_SOURCE) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src = "background-source.js";
          script.onload = resolve;
          script.onerror = () =>
            reject(
              new Error(
                "Không tải được ảnh mặc định khi mở trực tiếp. Chọn background.png bằng nút Chọn ảnh khác.",
              ),
            );
          document.head.append(script);
        });
        image = await decodeImage(window.WEDDING_BACKGROUND_SOURCE);
        if (version !== loadVersion) return;
        const asset = await prepareAsset(image, (message) => {
          if (version === loadVersion) $("preview-state").textContent = message;
        });
        if (version !== loadVersion) return;
        renderer.setAsset(asset);
        state.motionAsset = asset;
      }
      pendingImage = null;
      state.image = image;
      state.phase = 0;
      state.playing = false;
      state.original = false;
      revokeDownload();
      $("image-info").textContent =
        `${name} · ${image.naturalWidth} × ${image.naturalHeight} · ${state.motionAsset.stats.spriteCount.toLocaleString("vi-VN")} chấm`;
      notice("");
      renderPreview();
    } catch (error) {
      if (!renderer.lost && pendingImage?.version === version)
        pendingImage = null;
      if (version === loadVersion)
        showError(
          error.message || "Không tải được ảnh. Hãy chọn ảnh khác từ máy.",
        );
    } finally {
      if (version === loadVersion) {
        loading = false;
        updateUI();
      }
    }
  }
  $("play").addEventListener("click", () => {
    state.playing = !state.playing;
    previousTime = 0;
    updateUI();
  });
  $("original").addEventListener("click", () => {
    state.original = !state.original;
    updateUI();
    renderPreview();
  });
  $("speed").addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    revokeDownload();
    updateUI();
  });
  $("amplitude").addEventListener("input", (event) => {
    state.amplitude = Number(event.target.value);
    revokeDownload();
    updateUI();
    renderPreview();
  });
  $("reset").addEventListener("click", () => {
    Object.assign(state, defaults());
    revokeDownload();
    previousTime = 0;
    updateUI();
    renderPreview();
    notice("Đã đặt lại chuyển động và mặt nạ. Ảnh đang dừng ở đầu vòng lặp.");
  });
  $("image-upload").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file || recording) return;
    if (!renderer || renderer.lost) {
      showError(
        "WebGL chưa sẵn sàng. Hãy bật tăng tốc đồ họa và tải lại trang.",
      );
      return;
    }
    if (file.size > 64 * 1024 * 1024) {
      showError("Ảnh quá lớn (tối đa 64 MB). Hãy chọn ảnh nhẹ hơn.");
      event.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      await loadImage(url, file.name);
    } finally {
      URL.revokeObjectURL(url);
      event.target.value = "";
    }
  });
  $("fullscreen").addEventListener("click", async () => {
    try {
      await $("stage").requestFullscreen();
    } catch (error) {
      showError(`Không mở được toàn màn hình: ${error.message}`);
    }
  });
  document.addEventListener("fullscreenchange", resizePreview);
  new ResizeObserver(resizePreview).observe($("stage"));
  window.addEventListener("resize", resizePreview);

  function revokeDownload() {
    if (downloadURL) URL.revokeObjectURL(downloadURL);
    downloadURL = null;
    $("download").removeAttribute("href");
    $("download").hidden = true;
  }
  function finishRecording(job) {
    if (job.finished) return;
    job.finished = true;
    job.renderer?.dispose();
    if (recording === job) {
      recording = null;
      state.playing = job.wasPlaying;
      previousTime = 0;
      $("recording-status").hidden = true;
      updateUI();
      renderPreview();
    }
    if (job.aborted) return;
    const mime = job.result.mime;
    const extension = mime.toLowerCase().includes("mp4") ? "mp4" : "webm";
    const blob = job.result.blob;
    if (!blob.size) {
      showError(
        "Trình duyệt không tạo được dữ liệu video. Hãy thử lại bằng trình duyệt khác.",
      );
      return;
    }
    revokeDownload();
    downloadURL = URL.createObjectURL(blob);
    $("download").href = downloadURL;
    $("download").download = `wedding-background-1920x1080.${extension}`;
    $("download").textContent =
      `↓ Tải ${extension.toUpperCase()} · ${(blob.size / 1024 / 1024).toFixed(1)} MB`;
    $("download").hidden = false;
    notice(
      `Đã ghi xong một vòng ${seconds(job.frames / 30)} giây ở 1920 × 1080, 30 fps. Video chỉ chứa ảnh nền.`,
    );
  }
  function abortRecording(message, isError = false) {
    const job = recording;
    if (!job) return;
    job.aborted = true;
    if (job.controller) job.controller.abort();
    else finishRecording(job);
    if (isError) showError(message);
    else notice(message);
  }

  $("cancel-export").addEventListener("click", () =>
    abortRecording("Đã hủy ghi. Bạn có thể điều chỉnh và ghi lại."),
  );
  $("export").addEventListener("click", () => {
    if (!ready() || recording || checkingEncoder || !frameSupport) return;
    showError("");
    notice("");
    revokeDownload();
    const job = {
      wasPlaying: state.playing,
      frames: Math.round(900 / state.speed),
      aborted: false,
      finished: false,
    };
    recording = job;
    state.playing = false;
    updateUI();
    $("recording-status").hidden = false;
    $("record-progress").value = 0;
    $("record-label").textContent = "Đang chuẩn bị video…";
    try {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 1920;
      exportCanvas.height = 1080;
      job.renderer = new TextureRenderer(exportCanvas, () =>
        abortRecording(
          "Ghi video đã dừng vì WebGL bị gián đoạn. Hãy thử lại.",
          true,
        ),
      );
      job.renderer.setAsset(state.motionAsset);
      job.settings = {
        ...state,
        original: false,
        top: { ...state.top },
        bottom: { ...state.bottom },
      };
      job.renderer.render(0, job.settings);

      job.controller = new AbortController();
      window.WeddingVideoExport.encode({
        renderer: job.renderer,
        settings: job.settings,
        frames: job.frames,
        support: frameSupport,
        signal: job.controller.signal,
        onProgress: (progress) => {
          if (job.aborted) return;
          $("record-progress").value = progress * 100;
          $("record-label").textContent =
            `Đang mã hóa ${Math.round(progress * 100)}% · ${Math.round(progress * job.frames)} / ${job.frames} khung hình`;
          if (
            job.previewProgress === undefined ||
            progress - job.previewProgress >= 0.01
          ) {
            renderer.render(progress, job.settings);
            job.previewProgress = progress;
          }
        },
      })
        .then((result) => {
          job.result = result;
          finishRecording(job);
        })
        .catch((error) => {
          const wasAborted = job.aborted;
          job.aborted = true;
          finishRecording(job);
          if (!wasAborted)
            showError(`Không thể mã hóa video: ${error.message}`);
        });
    } catch (error) {
      abortRecording(`Không thể ghi video: ${error.message}`, true);
    }
  });
  document.addEventListener("visibilitychange", () => {
    previousTime = 0;
    if (document.hidden && recording)
      abortRecording(
        "Đã hủy ghi vì tab bị ẩn. Giữ tab này hiển thị trong suốt một vòng ghi.",
        true,
      );
  });
  window.addEventListener("pagehide", () => {
    if (recording) abortRecording("Đã dừng ghi khi rời trang.");
    cancelAnimationFrame(raf);
    revokeDownload();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      previousTime = 0;
      raf = requestAnimationFrame(tick);
    }
  });
  try {
    renderer = new TextureRenderer(
      canvas,
      () => {
        state.playing = false;
        if (recording)
          abortRecording("Đã dừng ghi vì kết nối WebGL bị mất.", true);
        showError(
          "Kết nối WebGL bị mất. Đang chờ trình duyệt khôi phục; nếu không tự phục hồi, hãy tải lại trang.",
        );
        updateUI();
      },
      () => {
        showError("");
        if (pendingImage && pendingImage.version === loadVersion) {
          const pending = pendingImage;
          pendingImage = null;
          // A file:// image may still require the embedded fallback on retry.
          loadImage(pending.image, pending.name, pending.isDefault);
        }
        resizePreview();
        updateUI();
        notice("WebGL đã khôi phục. Bạn có thể chạy chuyển động trở lại.");
      },
    );
    resizePreview();
    loadImage("background.png", "background.png", true);
  } catch (error) {
    showError(error.message);
    updateUI();
  }
  Promise.resolve()
    .then(() => window.WeddingVideoExport?.getSupport())
    .then((support) => {
      frameSupport = support || null;
    })
    .catch(() => {
      frameSupport = null;
    })
    .finally(() => {
      checkingEncoder = false;
      updateUI();
    });
  raf = requestAnimationFrame(tick);
  // Small diagnostics API: phases are turns, not seconds. render(0,state) is the original.
  window.weddingApp = {
    get renderer() {
      return renderer;
    },
    state,
    render: renderPreview,
    TextureRenderer,
    get recording() {
      return recording;
    },
    get exportSupport() {
      return frameSupport;
    },
    get asset() {
      return state.motionAsset;
    },
    get stats() {
      return state.motionAsset?.stats || null;
    },
    getSprite(id) {
      return renderer?.getSprite(id) || null;
    },
    getSpritePosition(id, phase, amplitude = state.amplitude) {
      return renderer?.getSpritePosition(id, phase, amplitude) || null;
    },
  };
})();
