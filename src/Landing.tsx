import { useEffect, useRef } from 'react'
import './landing.css'

export type LandingDestination = 'Overview' | 'Testnet' | 'Swap' | 'Perps' | 'Lend' | 'Routes' | 'Portfolio' | 'Security' | 'Launch'
type Props = { onEnter: (destination?: LandingDestination) => void }

const a = {
  sky: 'https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png',
  four: 'https://raft-blast-61784561.figma.site/_assets/v11/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png',
  bazaar: 'https://raft-blast-61784561.figma.site/_assets/v11/864afe00e41e2fa20a5aa546e15cb807e0f81384.png',
  left: 'https://raft-blast-61784561.figma.site/_assets/v11/7536d7b60a1fce482cf6edf3f0bffd3bad5d0f8a.png',
  right: 'https://raft-blast-61784561.figma.site/_assets/v11/392db6a6a6b98e868bd7f8d3f55bb719d51e5028.png',
  bridge: 'https://raft-blast-61784561.figma.site/_assets/v11/c6a6d8ef49bca43f708aa852692942c45ec950d4.png',
  river: 'https://raft-blast-61784561.figma.site/_assets/v11/ba75252bab2b1c510987b74837770f7bc8a6b2d4.png',
  pin1: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png',
  pin2: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png',
  pin3: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png'
}
const sights: {kicker:string;title:string;description:string;icon:string;page:LandingDestination}[] = [
  { kicker:'Start here',title:'Overview',description:'Enter HOXO and explore the Beldex protocol workspace.',icon:a.pin1,page:'Overview' },
  { kicker:'Wallet connection',title:'Beldex Testnet',description:'Connect your wallet and explore native BDX testnet tools.',icon:a.pin2,page:'Testnet' },
  { kicker:'Development preview',title:'Swap',description:'Explore the swap design and current availability.',icon:a.pin3,page:'Swap' },
  { kicker:'Development preview',title:'Perpetuals',description:'Discover the proposed perpetual markets and risk design.',icon:a.pin1,page:'Perps' },
  { kicker:'Protocol transparency',title:'Security',description:'Review wallet permissions, safeguards, and live limitations.',icon:a.pin2,page:'Security' },
]
const clamp=(v:number,min=0,max=1)=>Math.min(max,Math.max(min,v))
const smoothstep=(e0:number,e1:number,v:number)=>{const x=clamp((v-e0)/(e1-e0));return x*x*(3-2*x)}
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t
const segment=(s:number,a:number,b:number,c:number,d:number)=>{
  const enter=smoothstep(a,b,s),exit=smoothstep(c,d,s)
  return {enter,exit,active:enter*(1-exit)}
}
export default function Landing({onEnter}:Props){
  const sectionRef=useRef<HTMLElement>(null)
  const trackRef=useRef<HTMLDivElement>(null)
  const controlsRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const section=sectionRef.current,track=trackRef.current,controls=controlsRef.current
    if(!section||!track||!controls)return
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
    const cards=Array.from(track.querySelectorAll<HTMLElement>('.sight-card'))
    const count=sights.length
    let active=count,targetMouseX=0,targetMouseY=0,mouseX=0,mouseY=0,targetScroll=0,smoothScroll=0
    let initialized=false,rafPending=false,frame=0,jump1=0,jump2=0
    const put=(key:string,value:string|number)=>section.style.setProperty(key,String(value))
    const f=(n:number)=>n.toFixed(4)
    const scrollDistance=()=>clamp(-section.getBoundingClientRect().top,0,section.offsetHeight-window.innerHeight)
    function updateSlider(){
      const width=cards[0]?.offsetWidth||0
      const gap=parseFloat(getComputedStyle(track!).columnGap||'0')||0
      put('--sights-shift',-(width+gap)*active+'px')
      cards.forEach((card,i)=>card.classList.toggle('is-active',i===active))
    }
    function jump(index:number){
      track!.classList.add('is-jumping')
      active=index;updateSlider()
      jump1=requestAnimationFrame(()=>{jump2=requestAnimationFrame(()=>track!.classList.remove('is-jumping'))})
    }
    function normalise(event:TransitionEvent){
      if(event.target!==track||event.propertyName!=='transform')return
      if(active>=count*2)jump(active-count)
      else if(active<count)jump(active+count)
    }
    const move=(dir:number)=>{active+=dir;updateSlider()}
    function activate(event:Event){
      if(!(event.target instanceof Element))return
      const card=event.target.closest<HTMLElement>('.sight-card')
      if(!card)return
      const index=Number(card.dataset.sightIndex)
      if(!Number.isFinite(index))return
      active=index;updateSlider()
    }
    function cardKeys(event:KeyboardEvent){
      if(event.key!=='Enter'&&event.key!==' ')return
      if(!(event.target instanceof Element)||!event.target.closest('.sight-card'))return
      event.preventDefault();activate(event)
    }
    const prev=controls.querySelector('.sight-prev'),next=controls.querySelector('.sight-next')
    const previous=()=>move(-1),following=()=>move(1)
    function update(){
      rafPending=false
      targetScroll=scrollDistance()
      if(!initialized||reduced.matches){smoothScroll=targetScroll;initialized=true}
      else smoothScroll=lerp(smoothScroll,targetScroll,.14)
      if(Math.abs(smoothScroll-targetScroll)<.08)smoothScroll=targetScroll
      mouseX=lerp(mouseX,targetMouseX,.12);mouseY=lerp(mouseY,targetMouseY,.12)
      const frame2=segment(smoothScroll,560,900,1300,1620)
      const frame3=segment(smoothScroll,1760,2140,2540,2700)
      const progress=clamp(smoothScroll/2700),introExit=smoothstep(90,650,smoothScroll)
      const sightsEnter=Math.pow(smoothstep(2760,3560,smoothScroll),1.55)
      const controlsEnter=smoothstep(3360,3660,smoothScroll)
      const blur=clamp(frame2.active+frame3.active),split=Math.pow(frame2.enter,1.5)
      const scale=.76+progress*.2+frame2.enter*.18+frame3.enter*.16
      const sharedY=progress*-74,sharedScale=progress*.23
      const screenTop=Math.min(220,Math.max(112,window.innerHeight*.19))-50
      const parentTop=window.innerHeight-(window.innerHeight-screenTop)/scale
      put('--mx',f(reduced.matches?0:mouseX));put('--my',f(reduced.matches?0:mouseY))
      put('--back-opacity',f(1-frame2.active*.06))
      put('--back-x',f(mouseX*-12)+'px');put('--back-y',f(mouseY*-4)+'px')
      put('--back-scale',f(scale));put('--four-y',f(10+progress*10)+'vh')
      put('--four-scale',f(.78+progress*.16));put('--bazaar-y',f(20-progress*8)+'vh')
      put('--blur-px',f(blur*14)+'px');put('--back-brightness',f(1-blur*.255))
      put('--bazaar-blur-px',f(frame2.active*14)+'px')
      put('--bazaar-brightness',f(1-frame2.active*.255-frame3.active*.06))
      put('--bazaar-saturation',f(1+frame3.active*.18))
      put('--shade-opacity','1');put('--shade-z',frame2.active>.02?'2':'0')
      put('--shade-top-alpha',f(blur*.465));put('--shade-mid-alpha',f(blur*.42))
      put('--shade-bottom-alpha',f(blur*.51))
      put('--title-y',f(introExit*-210)+'px');put('--title-scale',f(1-introExit*.08))
      put('--title-opacity',f(1-introExit))
      put('--bridge-x','calc(-50% + '+f(mouseX*18)+'px)')
      put('--bridge-y',f(mouseY*8+sharedY-frame2.exit*760)+'px')
      put('--bridge-bottom',f(5-frame2.enter*13)+'vh')
      put('--bridge-width',f(67.2+frame2.enter*37.8)+'vw')
      put('--bridge-scale',f(1.02+sharedScale+frame2.exit*.46))
      put('--split-left-x','calc(-50% + '+f(-split*46)+'vw + '+f(mouseX*22)+'px)')
      put('--split-left-y',f(mouseY*10+sharedY-split*180)+'px')
      put('--split-left-scale',f(1+sharedScale+frame2.enter*.74))
      put('--split-right-x','calc(-50% + '+f(split*46)+'vw + '+f(mouseX*22)+'px)')
      put('--split-right-y',f(mouseY*10+sharedY-split*180)+'px')
      put('--split-right-scale',f(1+sharedScale+frame2.enter*.74))
      put('--frame2-opacity',f(frame2.active*(1-frame3.enter)))
      put('--frame2-x','calc(-50% + '+f(mouseX*10)+'px)')
      put('--frame2-y','calc(-50% + '+f(mouseY*8-frame2.exit*150)+'px)')
      put('--frame2-scale',f(1.06+frame2.enter*.08+frame2.exit*.08))
      put('--intro-copy-y',f(introExit*90)+'px');put('--intro-copy-opacity',f(1-introExit))
      put('--panel2-opacity',f(frame2.active*(1-frame2.exit)))
      put('--panel2-y','calc(-50% + '+f(-frame2.exit*86+(1-frame2.enter)*58)+'px)')
      put('--panel3-opacity',f(frame3.active*(1-frame3.exit)))
      put('--panel3-y','calc(-50% + '+f(-frame3.exit*86+(1-frame3.enter)*58)+'px)')
      put('--sights-opacity',f(sightsEnter));put('--sights-controls-opacity',f(controlsEnter))
      controls!.classList.toggle('is-ready',controlsEnter>.98)
      put('--sights-visibility',sightsEnter>.01?'visible':'hidden')
      put('--sights-y','0px');put('--sights-enter-x',f((1-sightsEnter)*420)+'vw')
      put('--sights-scale',f(1/scale));put('--sights-top',f(parentTop)+'px')
      put('--sights-screen-top',f(screenTop)+'px')
      if(Math.abs(smoothScroll-targetScroll)>.08||Math.abs(mouseX-targetMouseX)>.001||
        Math.abs(mouseY-targetMouseY)>.001)tick()
    }
    function tick(){if(!rafPending){rafPending=true;frame=requestAnimationFrame(update)}}
    const onScroll=()=>tick(),onResize=()=>{updateSlider();tick()}
    const onMove=(e:PointerEvent)=>{targetMouseX=e.clientX/window.innerWidth-.5;targetMouseY=e.clientY/window.innerHeight-.5;tick()}
    const onMotion=()=>tick()
    track.addEventListener('transitionend',normalise)
    track.addEventListener('click',activate)
    track.addEventListener('keydown',cardKeys)
    prev?.addEventListener('click',previous);next?.addEventListener('click',following)
    window.addEventListener('scroll',onScroll,{passive:true})
    window.addEventListener('resize',onResize)
    window.addEventListener('pointermove',onMove,{passive:true})
    reduced.addEventListener('change',onMotion)
    updateSlider();tick()
    return ()=>{
      cancelAnimationFrame(frame);cancelAnimationFrame(jump1);cancelAnimationFrame(jump2)
      track.removeEventListener('transitionend',normalise)
      track.removeEventListener('click',activate);track.removeEventListener('keydown',cardKeys)
      prev?.removeEventListener('click',previous);next?.removeEventListener('click',following)
      window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onResize)
      window.removeEventListener('pointermove',onMove);reduced.removeEventListener('change',onMotion)
    }
  },[])
  return <main className="hoxo-cinema site-shell">
    <section className="cinema-scroll" id="cinema" ref={sectionRef} aria-label="HOXO cinematic Beldex homepage">
      <div className="stage">
        <div className="world">
          <img className="scene-img sky-img" src={a.sky} alt=""/>
          <header className="site-header" aria-label="Primary navigation">
            <a className="site-logo" href="#cinema" aria-label="HOXO home">HOXO <span>ON BELDEX</span></a>
            <nav className="site-nav" aria-label="Main menu">
              <a href="#cinema">Intro</a>
              <button type="button" onClick={()=>onEnter('Testnet')}>Testnet</button>
              <button type="button" onClick={()=>onEnter('Swap')}>Markets</button>
              <button type="button" onClick={()=>onEnter('Security')}>Security</button>
            </nav>
            <button className="language-switcher" type="button" onClick={()=>onEnter('Overview')} aria-label="Open HOXO app">
              <span>ENTER APP</span><span aria-hidden="true">↗</span>
            </button>
          </header>
          <div className="back-stack">
            <img className="scene-img back-img back-four" src={a.four} alt=""/>
            <section className="sights-slider" aria-label="Explore HOXO features">
              <div className="sights-track" ref={trackRef}>
                {[0,1,2].flatMap(set=>sights.map((sight,i)=>
                  <article key={set+'-'+i} className="sight-card" tabIndex={0} role="button"
                    data-sight-index={set*sights.length+i} aria-label={'Open '+sight.title+' section'}>
                    <span className="sight-kicker">{sight.kicker}</span>
                    <img className="sight-pin" src={sight.icon} alt=""/>
                    <h3>{sight.title}</h3><p>{sight.description}</p>
                  </article>))}
              </div>
            </section>
            <img className="scene-img back-img back-bazaar" src={a.bazaar} alt=""/>
          </div>
          <div className="sights-controls" ref={controlsRef} aria-label="Feature carousel controls">
            <button type="button" className="sight-nav sight-prev" aria-label="Previous feature">←</button>
            <button type="button" className="sight-nav sight-next" aria-label="Next feature">→</button>
          </div>
          <h1 className="hero-title">HOXO</h1>
          <img className="scene-img splitframe-img splitframe-left" src={a.left} alt=""/>
          <img className="scene-img splitframe-img splitframe-right" src={a.right} alt=""/>
          <img className="scene-img bridge-img" src={a.bridge} alt=""/>
          <img className="scene-img frame-two-img" src={a.river} alt=""/>
          <div className="shade" aria-hidden="true"/>
        </div>
        <section className="intro-copy" aria-label="HOXO introduction">
          <p>Explore a new perspective on decentralized markets. Built for Beldex, starting with the testnet.</p>
          <div className="hero-tags" aria-label="HOXO highlights">
            <span>Beldex</span><span>Wallet first</span><span>Testnet exploration</span>
          </div>
        </section>
        <section className="story-panel story-panel-bridge" aria-label="Beldex testnet details">
          <h2>A foundation for what comes next.</h2>
          <p>Explore native BDX testnet transfers through your own wallet. Every action requires your approval; wallet data is never simulated.</p>
          <dl className="facts">
            <div><dt>01</dt><dd>Connect a Beldex wallet</dd></div>
            <div><dt>02</dt><dd>Explore native BDX testnet tools</dd></div>
          </dl>
        </section>
        <section className="story-panel story-panel-bazaar" aria-label="HOXO markets roadmap">
          <h2>Markets, built with intention.</h2>
          <p>Swap, perpetuals, lending, and routes are in development. Discover the roadmap, the security model, and the tools available today.</p>
          <button type="button" className="note-button" onClick={()=>onEnter('Overview')}>
            <span aria-hidden="true">↗</span><span>Explore HOXO</span>
          </button>
        </section>
      </div>
    </section>
  </main>
}
