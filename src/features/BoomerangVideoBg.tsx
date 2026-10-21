import { useEffect, useRef, useState } from 'react'

export const BOOMERANG_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_090628_7052d8a6-a094-4341-a4a2-ad58493a67a9.mp4'

export const MAX_CAPTURE_WIDTH = 960
export const BOOMERANG_FPS = 30
export const FRAME_INTERVAL_MS = 1000 / BOOMERANG_FPS

/**
 * Plays the actual source video once, recording every rendered frame at up to
 * 960 pixels wide. Then displays those recorded frames on a canvas, forwarding
 * and reversing at 30 frames per second. No native video loop and no fake media.
 *
 * Intentionally keeps the video visible until a complete capture exists.
 * The original video remains visible if its source/decoding fails.
 */
export function BoomerangVideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const displayRef = useRef<HTMLCanvasElement>(null)
  const [canvasVisible, setCanvasVisible] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const display = displayRef.current
    if (!video || !display) return

    let disposed = false
    let frameCallbackId: number | null = null
    let rafId: number | null = null
    let intervalId: number | null = null
    let capturing = false
    let lastCapturedTime = -1
    const frames: HTMLCanvasElement[] = []
    let width = 0
    let height = 0

    function captureFrame() {
      if (disposed || !video || !width || !height) return
      const currentTime = video.currentTime
      if (!Number.isFinite(currentTime) || currentTime === lastCapturedTime) return
      const frame = document.createElement('canvas')
      frame.width = width
      frame.height = height
      const ctx = frame.getContext('2d')
      if (!ctx) return
      try {
        ctx.drawImage(video, 0, 0, width, height)
        frames.push(frame)
        lastCapturedTime = currentTime
      } catch {
        // A media decoding failure must not produce a blank hero.
      }
    }

    function videoFrameLoop() {
      if (disposed || !capturing || !video) return
      captureFrame()
      if (typeof video.requestVideoFrameCallback === 'function') {
        frameCallbackId = video.requestVideoFrameCallback(videoFrameLoop)
      } else {
        rafId = window.requestAnimationFrame(videoFrameLoop)
      }
    }

    function cancelCapture() {
      capturing = false
      if (frameCallbackId !== null && typeof video?.cancelVideoFrameCallback === 'function') {
        video.cancelVideoFrameCallback(frameCallbackId)
      }
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      frameCallbackId = null
      rafId = null
    }

    function startCapture() {
      if (disposed || !video || capturing) return
      if (!video.videoWidth || !video.videoHeight) return
      const ratio = Math.min(1, MAX_CAPTURE_WIDTH / video.videoWidth)
      width = Math.max(1, Math.round(video.videoWidth * ratio))
      height = Math.max(1, Math.round(video.videoHeight * ratio))
      capturing = true
      videoFrameLoop()
      void video.play().catch(() => {
        // Autoplay restrictions: leave the media itself visible.
      })
    }

    function finishCapture() {
      if (disposed || !video || !display) return
      captureFrame()
      cancelCapture()
      if (frames.length === 0) {
        // Do not switch to a blank canvas when the source cannot be decoded.
        return
      }
      display.width = width
      display.height = height
      const context = display.getContext('2d')
      if (!context) return
      let frameIndex = 0
      let direction = 1
      context.drawImage(frames[frameIndex], 0, 0)
      setCanvasVisible(true)
      intervalId = window.setInterval(() => {
        if (disposed || frames.length < 2) return
        frameIndex += direction
        if (frameIndex >= frames.length - 1) {
          frameIndex = frames.length - 1
          direction = -1
        } else if (frameIndex <= 0) {
          frameIndex = 0
          direction = 1
        }
        context.clearRect(0, 0, width, height)
        context.drawImage(frames[frameIndex], 0, 0)
      }, FRAME_INTERVAL_MS)
    }

    video.addEventListener('loadeddata', startCapture)
    video.addEventListener('ended', finishCapture)
    if (video.readyState >= 2) startCapture()

    return () => {
      disposed = true
      video.removeEventListener('loadeddata', startCapture)
      video.removeEventListener('ended', finishCapture)
      cancelCapture()
      if (intervalId !== null) window.clearInterval(intervalId)
      frames.length = 0
      video.pause()
    }
  }, [])

  return <div
    aria-hidden="true"
    className="halo-absolute halo-inset-0 halo-z-0 halo-origin-top halo-scale-[1.15] halo-overflow-hidden"
    data-boomerang-video
  >
    <video
      ref={videoRef}
      src={BOOMERANG_VIDEO_URL}
      muted
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      className="halo-h-full halo-w-full halo-object-cover halo-object-top"
      style={{ display: canvasVisible ? 'none' : 'block' }}
    />
    <canvas
      ref={displayRef}
      className="halo-h-full halo-w-full halo-object-cover halo-object-top"
      style={{ display: canvasVisible ? 'block' : 'none' }}
      aria-hidden="true"
    />
  </div>
}
