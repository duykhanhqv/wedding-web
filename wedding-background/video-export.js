"use strict";

// Deterministic frame encoding: rendering speed never changes video timestamps.
// Muxers are vendored locally; no network connection or backend is required.
window.WeddingVideoExport = (() => {
  const WIDTH = 1920;
  const HEIGHT = 1080;
  const FPS = 30;
  const MAX_FRAMES = 1800;
  const BATCH_SIZE = 8;
  const timestamp = (frame) => Math.round((frame * 1000000) / FPS);

  async function getSupport() {
    if (
      typeof VideoEncoder === "undefined" ||
      typeof VideoFrame === "undefined"
    )
      return null;
    const candidates = [
      {
        codec: "avc1.420028",
        muxerCodec: "avc",
        mime: "video/mp4",
        extension: "mp4",
        library: window.Mp4Muxer,
      },
      {
        codec: "vp09.00.40.08",
        muxerCodec: "V_VP9",
        mime: "video/webm",
        extension: "webm",
        library: window.WebMMuxer,
      },
      {
        codec: "vp8",
        muxerCodec: "V_VP8",
        mime: "video/webm",
        extension: "webm",
        library: window.WebMMuxer,
      },
    ];
    for (const candidate of candidates) {
      if (!candidate.library?.Muxer || !candidate.library?.ArrayBufferTarget)
        continue;
      const config = {
        codec: candidate.codec,
        width: WIDTH,
        height: HEIGHT,
        framerate: FPS,
        bitrate: 16000000,
        bitrateMode: "variable",
        latencyMode: "quality",
        hardwareAcceleration: "no-preference",
      };
      if (candidate.extension === "mp4") config.avc = { format: "avc" };
      try {
        const support = await VideoEncoder.isConfigSupported(config);
        if (support.supported) {
          const { library, ...description } = candidate;
          return { ...description, config: support.config };
        }
      } catch {
        // Some browsers expose WebCodecs but reject individual codec profiles.
      }
    }
    return null;
  }

  async function encode({
    renderer,
    settings,
    frames,
    support,
    onProgress = () => {},
    signal,
  }) {
    const abortError = () =>
      new DOMException("Đã hủy ghi video.", "AbortError");
    const checkAbort = () => {
      if (signal?.aborted) throw abortError();
    };
    checkAbort();
    const format = support || (await getSupport());
    checkAbort();
    if (!format)
      throw new Error(
        "Trình duyệt không hỗ trợ mã hóa video theo từng khung hình.",
      );
    if (!Number.isInteger(frames) || frames < 1)
      throw new Error("Số khung hình xuất video không hợp lệ.");
    if (frames > MAX_FRAMES)
      throw new Error("Video xuất tối đa 60 giây để tránh vượt bộ nhớ trình duyệt.");
    if (renderer.canvas.width !== WIDTH || renderer.canvas.height !== HEIGHT)
      throw new Error("Canvas ghi video phải có kích thước 1920 × 1080.");

    const library =
      format.extension === "mp4" ? window.Mp4Muxer : window.WebMMuxer;
    const target = new library.ArrayBufferTarget();
    const options = {
      target,
      video: {
        codec: format.muxerCodec,
        width: WIDTH,
        height: HEIGHT,
        frameRate: FPS,
      },
      firstTimestampBehavior: "strict",
    };
    if (format.extension === "mp4") options.fastStart = "in-memory";
    const muxer = new library.Muxer(options);
    let failure = null;
    let encodedFrames = 0;
    const seenTimestamps = new Set();
    const encoder = new VideoEncoder({
      output(chunk, metadata) {
        if (failure || signal?.aborted) return;
        try {
          const index = Math.round((chunk.timestamp * FPS) / 1000000);
          if (
            index < 0 ||
            index >= frames ||
            chunk.timestamp !== timestamp(index) ||
            seenTimestamps.has(chunk.timestamp)
          )
            throw new Error(
              "Bộ mã hóa trả về thời điểm khung hình không hợp lệ.",
            );
          seenTimestamps.add(chunk.timestamp);
          // Keep the final sample's duration exact even if an encoder omits it.
          const data = new Uint8Array(chunk.byteLength);
          chunk.copyTo(data);
          const normalized = new EncodedVideoChunk({
            type: chunk.type,
            timestamp: timestamp(index),
            duration: timestamp(index + 1) - timestamp(index),
            data,
          });
          muxer.addVideoChunk(normalized, metadata);
          encodedFrames++;
        } catch (error) {
          failure = error;
        }
      },
      error(error) {
        failure = error;
      },
    });
    const close = () => {
      if (encoder.state !== "closed") encoder.close();
    };
    signal?.addEventListener("abort", close, { once: true });
    try {
      encoder.configure(format.config);
      onProgress(0);
      for (let frame = 0; frame < frames; frame++) {
        checkAbort();
        if (failure) throw failure;
        if (renderer.lost || renderer.gl?.isContextLost())
          throw new Error("WebGL bị gián đoạn khi tạo video.");
        renderer.render(frame / frames, settings);
        const videoFrame = new VideoFrame(renderer.canvas, {
          timestamp: timestamp(frame),
          duration: timestamp(frame + 1) - timestamp(frame),
        });
        try {
          encoder.encode(videoFrame, { keyFrame: frame % (FPS * 2) === 0 });
        } finally {
          videoFrame.close();
        }
        // Flush bounded batches to avoid a growing queue or encoder frame loss.
        if ((frame + 1) % BATCH_SIZE === 0 || frame === frames - 1) {
          await encoder.flush();
          checkAbort();
          if (failure) throw failure;
          onProgress(encodedFrames / frames);
        }
        // Yield to input and visibility events; cancellation remains responsive.
        if ((frame + 1) % 2 === 0)
          await new Promise((resolve) => setTimeout(resolve, 0));
      }
      checkAbort();
      if (failure) throw failure;
      if (encodedFrames !== frames)
        throw new Error(
          `Video thiếu khung hình (${encodedFrames}/${frames}). Hãy thử lại bằng trình duyệt khác.`,
        );
      muxer.finalize();
      const blob = new Blob([target.buffer], { type: format.mime });
      if (!blob.size)
        throw new Error("Bộ mã hóa không tạo được dữ liệu video.");
      onProgress(1);
      return { blob, mime: format.mime, extension: format.extension };
    } catch (error) {
      if (signal?.aborted) throw abortError();
      throw failure || error;
    } finally {
      signal?.removeEventListener("abort", close);
      close();
    }
  }
  return { getSupport, encode };
})();
