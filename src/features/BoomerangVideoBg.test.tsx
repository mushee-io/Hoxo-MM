import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  BoomerangVideoBg, BOOMERANG_VIDEO_URL, MAX_CAPTURE_WIDTH,
  BOOMERANG_FPS, FRAME_INTERVAL_MS, nextPingPongFrame,
} from './BoomerangVideoBg'

describe('Boomerang live-video capture and canvas playback', () => {
  it('references the exact video, one forward play, and distinct hidden canvas', () => {
    const html = renderToStaticMarkup(<BoomerangVideoBg/>)
    expect(BOOMERANG_VIDEO_URL).toBe('https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_090628_7052d8a6-a094-4341-a4a2-ad58493a67a9.mp4')
    expect(html).toContain('crossOrigin="anonymous"')
    expect(html.toLowerCase()).toContain('playsinline=""')
    expect(html).toContain('preload="auto"')
    expect(html).toContain('muted=""')
    expect(html).not.toContain('loop=""')
    expect(html).toContain('data-boomerang-video')
    expect(html).toContain('<canvas')
    expect(html).toContain('display:none')
  })
  it('uses a maximum 960px capture and a real 30fps canvas interval', () => {
    expect(MAX_CAPTURE_WIDTH).toBe(960)
    expect(BOOMERANG_FPS).toBe(30)
    expect(FRAME_INTERVAL_MS).toBeCloseTo(1000 / 30)
  })
  it('moves from start to end and reverses back forever without end-frame overshoot', () => {
    let state = {index:0, direction:1 as 1|-1}
    const observed:number[] = []
    for (let i=0;i<10;i++){
      observed.push(state.index)
      state=nextPingPongFrame(state,4)
    }
    expect(observed).toEqual([0,1,2,3,2,1,0,1,2,3])
    expect(nextPingPongFrame({index:0,direction:1},1)).toEqual({index:0,direction:1})
  })
})
