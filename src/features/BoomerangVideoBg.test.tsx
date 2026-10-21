import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { BoomerangVideoBg, BOOMERANG_VIDEO_URL, MAX_CAPTURE_WIDTH, BOOMERANG_FPS, FRAME_INTERVAL_MS } from './BoomerangVideoBg'
describe('Boomerang video background', () => {
  it('uses the exact supplied CloudFront video with crossorigin anonymous, no native loop', () => {
    const html = renderToStaticMarkup(<BoomerangVideoBg/>)
    expect(BOOMERANG_VIDEO_URL).toBe('https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_090628_7052d8a6-a094-4341-a4a2-ad58493a67a9.mp4')
    expect(html).toContain('crossorigin="anonymous"')
    expect(html).toContain('playsinline=""')
    expect(html).toContain('preload="auto"')
    expect(html).not.toContain(' loop=')
    expect(html).toContain('data-boomerang-video="true"')
    expect(html).toContain('<canvas')
  })
  it('captures a maximum 960px width and plays canvas ping-pong at 30fps', () => {
    expect(MAX_CAPTURE_WIDTH).toBe(960)
    expect(BOOMERANG_FPS).toBe(30)
    expect(FRAME_INTERVAL_MS).toBeCloseTo(33.3333333333)
  })
})
