"use strict";var SignalBox=(()=>{var ee={idle:{INIT:"loading"},loading:{CONFIG_LOADED:"ready",FETCH_FAILED:"error",WIDGET_DISABLED:"disabled"},ready:{OPEN:"open"},open:{CLOSE:"ready",SUBMIT:"submitting"},submitting:{SUBMIT_SUCCESS:"complete",SUBMIT_FAILED:"error"},complete:{RESET:"ready",CLOSE:"ready"},error:{RETRY:"ready",CLOSE:"ready"},disabled:{}},T=class{constructor(){this.listeners=[];this.ctx={state:"idle",config:null,currentStepIndex:0,answers:[],contact:{name:"",email:""},errorMessage:"",loadedAt:0,resultTier:null}}getState(){return this.ctx.state}getContext(){return this.ctx}onChange(e){return this.listeners.push(e),()=>{let t=this.listeners.indexOf(e);t!==-1&&this.listeners.splice(t,1)}}emit(e){let t={...this.ctx};for(let n of this.listeners)try{n(t,e)}catch{}}transition(e){let t=this.ctx.state,n=ee[t],r=n==null?void 0:n[e];if(!r)return!1;let s=t;return this.ctx.state=r,this.emit(s),!0}init(){return this.ctx.loadedAt=Date.now(),this.transition("INIT")}configLoaded(e){return this.ctx.config=e,this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.errorMessage="",this.ctx.resultTier=null,this.transition("CONFIG_LOADED")}fetchFailed(e){return this.ctx.errorMessage=e,this.transition("FETCH_FAILED")}widgetDisabled(){return this.transition("WIDGET_DISABLED")}open(){return this.ctx.resultTier!==null&&(this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.resultTier=null,this.ctx.errorMessage=""),this.transition("OPEN")}close(){return this.transition("CLOSE")}selectOption(e){var r;if(this.ctx.state!=="open")return;let t=this.ctx.answers.findIndex(s=>s.stepId===e.stepId);t!==-1?this.ctx.answers[t]=e:this.ctx.answers.push(e);let n=((r=this.ctx.config)==null?void 0:r.steps.length)??0;this.ctx.currentStepIndex<n-1&&this.ctx.currentStepIndex++,this.emit(this.ctx.state)}goBack(){this.ctx.state==="open"&&this.ctx.currentStepIndex>0&&(this.ctx.currentStepIndex--,this.emit(this.ctx.state))}isOnContactStep(){return this.ctx.config?this.ctx.answers.length>=this.ctx.config.steps.length:!1}setContact(e){this.ctx.contact=e}submit(){return this.transition("SUBMIT")}submitSuccess(e){return this.ctx.resultTier=e,this.transition("SUBMIT_SUCCESS")}submitFailed(e){return this.ctx.errorMessage=e,this.transition("SUBMIT_FAILED")}retry(){return this.ctx.errorMessage="",this.transition("RETRY")}reset(){return this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.errorMessage="",this.ctx.resultTier=null,this.transition("RESET")}};var g=class extends Error{constructor(t,n,r){super(t);this.status=n;this.code=r;this.name="WidgetApiError"}};function H(i,e,t=15e3){let n=new AbortController,r=setTimeout(()=>n.abort(),t),s={...e,signal:n.signal};return fetch(i,s).finally(()=>clearTimeout(r))}function N(i,e){switch(i){case 402:return new g("This widget subscription has expired.",402,"EXPIRED");case 404:return new g("Widget not found. Please check your widget key.",404,"NOT_FOUND");case 409:return new g("You have already submitted a response.",409,"DUPLICATE");case 410:return new g("This widget is no longer active.",410,"INACTIVE");case 429:return new g("Too many requests. Please try again later.",429,"RATE_LIMITED");default:return new g(e||"An unexpected error occurred.",i,"SERVER_ERROR")}}async function O(i,e){let t=`${e}/api/v1/widget/${encodeURIComponent(i)}`,n;try{n=await H(t,{method:"GET",headers:{Accept:"application/json"}})}catch(s){throw s instanceof DOMException&&s.name==="AbortError"?new g("Request timed out. Please check your connection.",0,"TIMEOUT"):new g("Network error. Please check your connection.",0,"NETWORK_ERROR")}if(!n.ok){let s=await n.text().catch(()=>"");throw N(n.status,s)}return await n.json()}async function W(i,e){let t=`${e}/api/v1/submit`,n=async()=>{try{return await H(t,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(i)})}catch(l){throw l instanceof DOMException&&l.name==="AbortError"?new g("Request timed out. Please try again.",0,"TIMEOUT"):new g("Network error. Please try again.",0,"NETWORK_ERROR")}},r=await n();if(r.status>=500&&r.status<600&&(await new Promise(l=>setTimeout(l,2e3)),r=await n()),!r.ok){let l=await r.text().catch(()=>"");throw N(r.status,l)}return await r.json()}function te(i){switch(i){case"serif":return'Georgia, "Times New Roman", Times, serif';case"sans":return'"Helvetica Neue", Helvetica, Arial, sans-serif';case"system":default:return'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}function ne(i){let e=i.triggerOffsetX,t=i.triggerOffsetY;switch(i.position){case"bottom-left":return`bottom: ${t}px; left: ${e}px;`;case"bottom-center":return`bottom: ${t}px; left: 50%; transform: translateX(-50%);`;case"bottom-right":default:return`bottom: ${t}px; right: ${e}px;`}}function ie(i){let e=i.triggerOffsetX,t=i.triggerOffsetY+60;switch(i.position){case"bottom-left":return`bottom: ${t}px; left: ${e}px;`;case"bottom-center":return`bottom: ${t}px; left: 50%; transform: translateX(-50%);`;case"bottom-right":default:return`bottom: ${t}px; right: ${e}px;`}}function z(i,e){let t=i.replace("#",""),n=parseInt(t.substring(0,2),16),r=parseInt(t.substring(2,4),16),s=parseInt(t.substring(4,6),16);return isNaN(n)||isNaN(r)||isNaN(s)?i:`rgba(${n}, ${r}, ${s}, ${e})`}function U(i){let e=te(i.fontFamily),t=i.borderRadius,n=i.panelWidth||400,r=i.mode==="dark"?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)",s=i.mode==="dark"?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)",l=i.mode==="dark"?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",p=i.mode==="dark"?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)";return`
/* \u2500\u2500 CSS Custom Properties \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
:host {
  --sb-primary: ${i.primaryColor};
  --sb-accent: ${i.accentColor};
  --sb-bg: ${i.backgroundColor};
  --sb-text: ${i.textColor};
  --sb-radius: ${t}px;
  --sb-font: ${e};
  --sb-panel-width: ${n}px;
  --sb-border: ${r};
  --sb-input-bg: ${s};
  --sb-input-border: ${l};
  --sb-hover-bg: ${p};
  --sb-accent-10: ${z(i.accentColor,.1)};
  --sb-accent-20: ${z(i.accentColor,.2)};

  all: initial;
  font-family: var(--sb-font);
  color: var(--sb-text);
  line-height: 1.5;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* \u2500\u2500 Animations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
@keyframes sb-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sb-slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes sb-slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes sb-slideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-24px); }
}

@keyframes sb-scaleTap {
  0% { transform: scale(1); }
  50% { transform: scale(0.97); }
  100% { transform: scale(1); }
}

@keyframes sb-scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes sb-spin {
  to { transform: rotate(360deg); }
}

@keyframes sb-checkmark {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}

@keyframes sb-panelIn {
  from { opacity: 0; transform: translateY(100%) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes sb-panelOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(20px) scale(0.96); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* \u2500\u2500 Trigger Button \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-trigger {
  position: fixed;
  ${ne(i)}
  z-index: 2147483647;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 20px;
  border: none;
  border-radius: ${Math.min(i.borderRadius,12)}px;
  background: var(--sb-primary);
  color: #fff;
  font-family: var(--sb-font);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.01em;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  animation: sb-fadeIn 0.4s ease 1s both;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.sb-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.1);
}

.sb-trigger:active {
  transform: translateY(0);
}

.sb-trigger:focus-visible {
  outline: 2px solid var(--sb-accent);
  outline-offset: 2px;
}

.sb-trigger--hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
}

.sb-trigger__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sb-trigger__icon svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* \u2500\u2500 Tab-style Trigger \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-trigger--tab {
  border-radius: ${t}px ${t}px 0 0;
  padding: 0 24px;
  height: 40px;
}

/* \u2500\u2500 Panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-panel {
  position: fixed;
  ${ie(i)}
  z-index: 2147483647;
  width: var(--sb-panel-width);
  max-height: 640px;
  display: flex;
  flex-direction: column;
  background: var(--sb-bg);
  border-radius: 12px;
  border: 1px solid var(--sb-border);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  font-family: var(--sb-font);
  pointer-events: auto;
  animation: sb-panelIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.sb-panel--closing {
  animation: sb-panelOut 0.25s ease both;
}

.sb-panel--hidden {
  display: none;
}

/* \u2500\u2500 Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  position: relative;
}

.sb-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sb-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  color: var(--sb-text);
  opacity: 0.5;
  transition: opacity 0.15s, background 0.15s;
  padding: 0;
}

.sb-header__back:hover {
  opacity: 1;
  background: var(--sb-hover-bg);
}

.sb-header__back svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sb-header__step {
  font-size: 12px;
  opacity: 0.5;
  font-weight: 500;
}

.sb-header__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  color: var(--sb-text);
  opacity: 0.5;
  transition: opacity 0.15s, background 0.15s;
  padding: 0;
}

.sb-header__close:hover {
  opacity: 1;
  background: var(--sb-hover-bg);
}

.sb-header__close:focus-visible {
  outline: 2px solid var(--sb-accent);
  outline-offset: -2px;
}

.sb-header__close svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* \u2500\u2500 Progress Bar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-progress {
  height: 4px;
  background: var(--sb-border);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.sb-progress__bar {
  height: 100%;
  background: var(--sb-accent);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 2px 2px 0;
}

/* \u2500\u2500 Content Area \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 16px;
  min-height: 0;
}

.sb-content::-webkit-scrollbar {
  width: 4px;
}

.sb-content::-webkit-scrollbar-track {
  background: transparent;
}

.sb-content::-webkit-scrollbar-thumb {
  background: var(--sb-border);
  border-radius: 2px;
}

/* \u2500\u2500 Step View \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-step {
  animation: sb-slideInRight 0.3s ease both;
}

.sb-step--exit {
  animation: sb-slideOutLeft 0.2s ease both;
}

.sb-step--back {
  animation: sb-slideInRight 0.3s ease both;
  animation-direction: reverse;
}

.sb-question {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1.3;
  color: var(--sb-text);
}

.sb-description {
  font-size: 14px;
  opacity: 0.6;
  margin-bottom: 16px;
  line-height: 1.5;
}

/* \u2500\u2500 Option Cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.sb-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 12px 16px;
  border: 1.5px solid var(--sb-border);
  border-radius: var(--sb-radius);
  background: transparent;
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.sb-option:hover {
  border-color: var(--sb-accent);
  background: var(--sb-accent-10);
}

.sb-option:active {
  animation: sb-scaleTap 0.15s ease;
}

.sb-option:focus-visible {
  outline: 2px solid var(--sb-accent);
  outline-offset: -2px;
}

.sb-option__icon {
  font-size: 20px;
  flex-shrink: 0;
  line-height: 1;
}

.sb-option__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: var(--sb-border);
  color: var(--sb-text);
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.15s ease;
}

.sb-option:hover .sb-option__num {
  opacity: 0.8;
}

.sb-option__label {
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* \u2500\u2500 Social Proof \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-social-proof {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  padding: 8px 12px;
  background: var(--sb-accent-10);
  border-radius: 8px;
  font-size: 12px;
  color: var(--sb-text);
  opacity: 0.7;
}

.sb-social-proof__icon {
  flex-shrink: 0;
  display: flex;
}

.sb-social-proof__icon svg {
  width: 14px;
  height: 14px;
  fill: var(--sb-accent);
}

/* \u2500\u2500 Contact Form \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-contact {
  animation: sb-slideInRight 0.3s ease both;
}

.sb-contact__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--sb-text);
}

.sb-contact__subtitle {
  font-size: 14px;
  opacity: 0.6;
  margin-bottom: 20px;
}

.sb-field {
  margin-bottom: 14px;
}

.sb-field__label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--sb-text);
  opacity: 0.8;
}

.sb-field__required {
  color: #ef4444;
  margin-left: 2px;
}

.sb-field__input {
  display: block;
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1.5px solid var(--sb-input-border);
  border-radius: var(--sb-radius);
  background: var(--sb-input-bg);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.sb-field__input:focus {
  border-color: var(--sb-accent);
  box-shadow: 0 0 0 3px var(--sb-accent-20);
}

.sb-field__input--error {
  border-color: #ef4444;
}

.sb-field__input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.sb-field__textarea {
  height: 80px;
  padding: 10px 14px;
  resize: vertical;
  min-height: 60px;
  max-height: 160px;
}

.sb-field__error {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

/* \u2500\u2500 Consent Checkbox \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-consent {
  margin-top: 12px;
  margin-bottom: 4px;
}

.sb-consent__label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1.4;
  color: var(--sb-muted);
}

.sb-consent__check {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: var(--sb-accent);
  cursor: pointer;
}

.sb-consent__text {
  flex: 1;
}

.sb-consent__link {
  color: var(--sb-accent);
  text-decoration: underline;
  cursor: pointer;
}

.sb-consent__link:hover {
  opacity: 0.8;
}

.sb-consent__error {
  margin-top: 4px;
  margin-left: 24px;
}

/* \u2500\u2500 Honeypot \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-hp {
  display: none !important;
  position: absolute;
  left: -9999px;
  opacity: 0;
  height: 0;
  width: 0;
  overflow: hidden;
  tab-index: -1;
}

/* \u2500\u2500 Submit Button \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 52px;
  margin-top: 20px;
  border: none;
  border-radius: var(--sb-radius);
  background: var(--sb-primary);
  color: #fff;
  font-family: var(--sb-font);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.sb-submit:hover {
  opacity: 0.9;
}

.sb-submit:active {
  transform: scale(0.98);
}

.sb-submit:focus-visible {
  outline: 2px solid var(--sb-accent);
  outline-offset: 2px;
}

.sb-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sb-submit__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: sb-spin 0.7s linear infinite;
}

/* \u2500\u2500 Confirmation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-confirmation {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 8px 8px;
  animation: sb-scaleIn 0.35s ease both;
}

.sb-confirmation__check {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--sb-accent-10);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.sb-confirmation__check svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: var(--sb-accent);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sb-confirmation__check svg path {
  stroke-dasharray: 24;
  animation: sb-checkmark 0.5s ease 0.2s both;
}

.sb-confirmation__headline {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--sb-text);
}

.sb-confirmation__body {
  font-size: 14px;
  opacity: 0.7;
  line-height: 1.6;
  margin-bottom: 20px;
  max-width: 300px;
}

.sb-confirmation__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: var(--sb-radius);
  background: var(--sb-primary);
  color: #fff;
  font-family: var(--sb-font);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s;
}

.sb-confirmation__cta:hover {
  opacity: 0.9;
}

/* \u2500\u2500 Error State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 16px 16px;
  animation: sb-fadeIn 0.3s ease both;
}

.sb-error__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.sb-error__icon svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: #ef4444;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sb-error__message {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 16px;
  max-width: 280px;
  line-height: 1.5;
}

.sb-error__retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 24px;
  border: 1.5px solid var(--sb-border);
  border-radius: var(--sb-radius);
  background: transparent;
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.sb-error__retry:hover {
  border-color: var(--sb-accent);
  background: var(--sb-accent-10);
}

/* \u2500\u2500 Loading Spinner \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
}

.sb-loading__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--sb-border);
  border-top-color: var(--sb-accent);
  border-radius: 50%;
  animation: sb-spin 0.7s linear infinite;
}

/* \u2500\u2500 Footer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-footer {
  padding: 8px 16px 10px;
  text-align: center;
  flex-shrink: 0;
}

.sb-footer__link {
  font-size: 11px;
  opacity: 0.3;
  color: var(--sb-text);
  text-decoration: none;
  font-weight: 400;
  transition: opacity 0.15s;
}

.sb-footer__link:hover {
  opacity: 0.6;
}

/* \u2500\u2500 Disabled State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-disabled {
  display: none;
}

/* \u2500\u2500 Screen Reader Only \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* \u2500\u2500 Mobile Responsive \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
@media (max-width: 640px) {
  .sb-panel {
    width: 100% !important;
    max-width: 100%;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: auto !important;
    transform: none !important;
    border-radius: 16px 16px 0 0;
    max-height: 85vh;
    border-bottom: none;
  }

  .sb-panel--closing {
    animation-name: sb-panelOut;
  }

  .sb-content {
    padding: 8px 16px 16px;
  }
}
`}var re="(prefers-reduced-motion: reduce)";function M(){return typeof window<"u"&&window.matchMedia(re).matches}function oe(i,e,t){if(i.classList.add(e),M()){i.classList.remove(e);return}setTimeout(()=>{i.classList.remove(e)},t)}function q(i){i.classList.remove("sb-panel--hidden","sb-panel--closing"),i.style.animation="none",i.offsetHeight,i.style.animation=""}function V(i,e){if(M()){i.classList.add("sb-panel--hidden"),e();return}i.classList.add("sb-panel--closing");let t=()=>{i.removeEventListener("animationend",t),i.classList.add("sb-panel--hidden"),i.classList.remove("sb-panel--closing"),e()};i.addEventListener("animationend",t,{once:!0}),setTimeout(()=>{i.classList.contains("sb-panel--hidden")||(i.removeEventListener("animationend",t),i.classList.add("sb-panel--hidden"),i.classList.remove("sb-panel--closing"),e())},300)}function D(i,e){let t=i.firstElementChild;if(!t||M()){i.textContent="";let r=e();i.appendChild(r);return}t.classList.add("sb-step--exit");let n=()=>{t.removeEventListener("animationend",n),i.textContent="";let r=e();i.appendChild(r)};t.addEventListener("animationend",n,{once:!0}),setTimeout(()=>{if(i.contains(t)){t.removeEventListener("animationend",n),i.textContent="";let r=e();i.appendChild(r)}},250)}function G(i,e){if(M()){i.textContent="";let n=e();i.appendChild(n);return}i.textContent="";let t=e();t.classList.add("sb-step--back"),i.appendChild(t),setTimeout(()=>{t.classList.remove("sb-step--back")},350)}function K(i){oe(i,"sb-option--tapped",200)}function j(i){i.classList.remove("sb-trigger--hidden")}function Y(i){i.classList.add("sb-trigger--hidden")}function X(i){i.style.animation="none",i.offsetHeight,i.style.animation=""}function f(i,...e){let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox",i),t.setAttribute("aria-hidden","true"),t.setAttribute("focusable","false");for(let n of e)n(t);return t}function _(i,e){return t=>{let n=document.createElementNS("http://www.w3.org/2000/svg","path");if(n.setAttribute("d",i),e)for(let[r,s]of Object.entries(e))n.setAttribute(r,s);t.appendChild(n)}}function y(i,e,t,n){return r=>{let s=document.createElementNS("http://www.w3.org/2000/svg","line");s.setAttribute("x1",i),s.setAttribute("y1",e),s.setAttribute("x2",t),s.setAttribute("y2",n),r.appendChild(s)}}function se(i,e,t){return n=>{let r=document.createElementNS("http://www.w3.org/2000/svg","circle");r.setAttribute("cx",i),r.setAttribute("cy",e),r.setAttribute("r",t),n.appendChild(r)}}function ae(i){return e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","polyline");t.setAttribute("points",i),e.appendChild(t)}}function le(){return f("0 0 24 24",_("M5 12h14"),_("M12 5l7 7-7 7"))}function ce(){return f("0 0 24 24",_("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",{fill:"currentColor",stroke:"none"}))}function de(){return f("0 0 24 24",y("12","5","12","19"),y("5","12","19","12"))}function pe(){return f("0 0 24 24",y("18","6","6","18"),y("6","6","18","18"))}function he(){return f("0 0 24 24",ae("15 18 9 12 15 6"))}function be(){return f("0 0 24 24",_("M5 13l4 4L19 7"))}function ge(){return f("0 0 24 24",se("12","12","10"),y("12","8","12","12"),y("12","16","12.01","16"))}function me(){return f("0 0 16 16",_("M8 8a3 3 0 100-6 3 3 0 000 6zM2 14s-1 0-1-1 1-4 7-4 7 3 7 4-1 1-1 1H2z",{fill:"currentColor",stroke:"none"}))}function ue(i){switch(i){case"arrow":return le();case"chat":return ce();case"plus":return de();case"none":default:return null}}function a(i,e,t){let n=document.createElement(i);if(e&&(n.className=e),t)for(let[r,s]of Object.entries(t))n.setAttribute(r,s);return n}var L=class{constructor(e,t){this.config=null;this.triggerEl=null;this.panelEl=null;this.progressBar=null;this.stepCounter=null;this.contentEl=null;this.backBtn=null;this.ariaLiveRegion=null;this.previousActiveElement=null;this.boundKeyHandler=null;this.host=e,this.callbacks=t,this.shadow=e.attachShadow({mode:"open"})}init(e){this.config=e,this.injectStyles(e.theme),this.renderTrigger(e)}injectStyles(e){let t=document.createElement("style");t.textContent=U(e),this.shadow.appendChild(t)}renderTrigger(e){let t=a("button","sb-trigger sb-trigger--hidden",{type:"button","aria-label":e.theme.triggerText||"Open widget"});e.theme.triggerType==="tab"&&t.classList.add("sb-trigger--tab");let n=ue(e.theme.triggerIcon);if(n){let s=a("span","sb-trigger__icon");s.appendChild(n),t.appendChild(s)}let r=document.createTextNode(e.theme.triggerText||"Get Started");t.appendChild(r),t.addEventListener("click",()=>{this.callbacks.onTriggerClick()}),this.shadow.appendChild(t),this.triggerEl=t,requestAnimationFrame(()=>{j(t)})}showTrigger(){this.triggerEl&&this.triggerEl.classList.remove("sb-trigger--hidden")}hideTrigger(){this.triggerEl&&Y(this.triggerEl)}openPanel(e,t){this.config&&(this.hideTrigger(),this.panelEl||this.buildPanel(),this.panelEl&&(q(this.panelEl),this.updateProgress(e,t),this.enableFocusTrap()))}closePanel(){this.panelEl&&(V(this.panelEl,()=>{this.showTrigger()}),this.disableFocusTrap())}buildPanel(){var d;let e=a("div","sb-panel sb-panel--hidden",{role:"dialog","aria-label":"SignalBox Widget","aria-modal":"true"}),t=a("div","sb-header"),n=a("div","sb-header__left"),r=a("button","sb-header__back",{type:"button","aria-label":"Go back",style:"visibility: hidden;"});r.appendChild(he()),r.addEventListener("click",()=>this.callbacks.onBack()),this.backBtn=r,n.appendChild(r);let s=a("span","sb-header__step");s.textContent="",this.stepCounter=s,n.appendChild(s),t.appendChild(n);let l=a("button","sb-header__close",{type:"button","aria-label":"Close widget"});l.appendChild(pe()),l.addEventListener("click",()=>this.callbacks.onClose()),t.appendChild(l),e.appendChild(t);let p=a("div","sb-progress",{role:"progressbar","aria-valuemin":"0","aria-valuemax":"100","aria-valuenow":"0"}),h=a("div","sb-progress__bar");h.style.width="0%",p.appendChild(h),e.appendChild(p),this.progressBar=h;let c=a("div","sb-content");if(e.appendChild(c),this.contentEl=c,(d=this.config)!=null&&d.theme.showBranding){let b=a("div","sb-footer"),u=a("a","sb-footer__link",{href:"https://signalbox.io?ref=widget",target:"_blank",rel:"noopener noreferrer"});u.textContent="Powered by SignalBox",b.appendChild(u),e.appendChild(b)}let o=a("div","sb-sr-only",{"aria-live":"polite","aria-atomic":"true"});e.appendChild(o),this.ariaLiveRegion=o,e.addEventListener("keydown",b=>{let u=parseInt(b.key,10);if(u>=1&&u<=9){let m=e.querySelectorAll(".sb-option")[u-1];m&&(b.preventDefault(),m.click())}}),this.shadow.appendChild(e),this.panelEl=e}updateProgress(e,t){let n=t+1,r=e+1,s=Math.round(r/n*100);if(this.progressBar){this.progressBar.style.width=`${s}%`;let l=this.progressBar.parentElement;l&&l.setAttribute("aria-valuenow",String(s))}this.stepCounter&&(this.stepCounter.textContent=`Step ${r} of ${n}`),this.backBtn&&(this.backBtn.style.visibility=e>0?"visible":"hidden"),this.ariaLiveRegion&&(this.ariaLiveRegion.textContent=`Step ${r} of ${n}`)}renderStep(e,t,n,r="forward"){if(!this.contentEl)return;this.updateProgress(t,n);let s=()=>{var c;let l=a("div","sb-step"),p=a("h2","sb-question");if(p.textContent=e.question,l.appendChild(p),e.description){let o=a("p","sb-description");o.textContent=e.description,l.appendChild(o)}let h=a("div","sb-options",{role:"radiogroup","aria-label":e.question});for(let o=0;o<e.options.length;o++){let d=e.options[o],b=a("button","sb-option",{type:"button",role:"radio","aria-checked":"false","data-option-id":d.id}),u=a("span","sb-option__num");if(u.textContent=String(o+1),b.appendChild(u),d.icon){let m=a("span","sb-option__icon");m.textContent=d.icon,b.appendChild(m)}let w=a("span","sb-option__label");w.textContent=d.label,b.appendChild(w),b.addEventListener("click",()=>{K(b),setTimeout(()=>{this.callbacks.onOptionSelect(e.id,d.id,d.label,d.scoreWeight)},120)}),b.addEventListener("keydown",m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),b.click())}),h.appendChild(b)}if(l.appendChild(h),(c=this.config)!=null&&c.theme.showSocialProof&&t===0&&this.config.submissionCount>=this.config.socialProofMin){let o=a("div","sb-social-proof"),d=a("span","sb-social-proof__icon");d.appendChild(me()),o.appendChild(d);let b=document.createTextNode(this.config.socialProofText.replace("{count}",String(this.config.submissionCount)));o.appendChild(b),l.appendChild(o)}return l};r==="backward"?G(this.contentEl,s):D(this.contentEl,s)}renderContactForm(e,t={},n=!1,r){if(!this.contentEl||!this.config)return;this.updateProgress(e,e);let s=()=>{let l=a("div","sb-contact"),p=a("h2","sb-contact__title");p.textContent="Almost done!",l.appendChild(p);let h=a("p","sb-contact__subtitle");h.textContent="Enter your details to see your results.",l.appendChild(h);let c=a("form","",{novalidate:"true",autocomplete:"on"}),o=this.createField("name","Name","text",!0,"Your name",t.name,r==null?void 0:r.name);c.appendChild(o);let d=this.createField("email","Email","email",!0,"you@example.com",t.email,r==null?void 0:r.email);if(c.appendChild(d),this.config.contactShowPhone){let x=this.createField("phone","Phone","tel",this.config.contactPhoneRequired,"(555) 123-4567",t.phone,r==null?void 0:r.phone);c.appendChild(x)}if(this.config.contactShowMessage){let x=this.createTextareaField("message","Message",this.config.contactMessageRequired,this.config.contactMessagePlaceholder||"Tell us more...",t.message,r==null?void 0:r.message);c.appendChild(x)}let b=a("div","sb-hp"),u=a("label");u.textContent="Leave this empty";let w=a("input","",{type:"text",name:"website",tabindex:"-1",autocomplete:"off","aria-hidden":"true"});b.appendChild(u),b.appendChild(w),c.appendChild(b);let m=a("div","sb-consent"),I=a("label","sb-consent__label"),A=a("input","sb-consent__check",{type:"checkbox",name:"consent",required:"true"});I.appendChild(A);let P=a("span","sb-consent__text");P.textContent="I agree to the processing of my data and acknowledge the ";let B=a("a","sb-consent__link",{href:"/privacy",target:"_blank",rel:"noopener noreferrer"});B.textContent="Privacy Policy",P.appendChild(B),I.appendChild(P),m.appendChild(I);let C=a("p","sb-field__error sb-consent__error");C.style.display="none",C.textContent="You must agree before submitting.",m.appendChild(C),c.appendChild(m);let E=a("button","sb-submit",{type:"submit"});if(n){E.setAttribute("disabled","true");let x=a("span","sb-submit__spinner");E.appendChild(x);let v=document.createTextNode("Submitting...");E.appendChild(v)}else E.textContent=this.config.contactSubmitText||"See My Results";return c.appendChild(E),c.addEventListener("submit",x=>{if(x.preventDefault(),!A.checked){C.style.display="block",A.focus();return}C.style.display="none";let v=new FormData(c),S=F=>F.replace(/<[^>]*>?/g,"").trim(),R={name:S(v.get("name")||""),email:S(v.get("email")||"").toLowerCase()};if(this.config.contactShowPhone){let F=S(v.get("phone")||"");R.phone=F.replace(/[^+\d\s().-]/g,"")}this.config.contactShowMessage&&(R.message=S(v.get("message")||""));let Q=v.get("website")||"";this.callbacks.onContactSubmit(R,Q)}),l.appendChild(c),l};D(this.contentEl,s)}createField(e,t,n,r,s,l,p){let h=a("div","sb-field"),c=a("label","sb-field__label",{for:`sb-${e}`});if(c.textContent=t,r){let d=a("span","sb-field__required");d.textContent="*",c.appendChild(d)}h.appendChild(c);let o=a("input","sb-field__input",{type:n,name:e,id:`sb-${e}`,placeholder:s,autocomplete:e});if(r&&o.setAttribute("required","true"),p&&(o.value=p),n==="tel"&&(o.setAttribute("inputmode","tel"),o.addEventListener("input",()=>{let d=o.value.replace(/\D/g,"").slice(0,10);d.length===0?o.value="":d.length<=3?o.value=`(${d}`:d.length<=6?o.value=`(${d.slice(0,3)}) ${d.slice(3)}`:o.value=`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`})),l&&(o.classList.add("sb-field__input--error"),o.setAttribute("aria-invalid","true"),o.setAttribute("aria-describedby",`sb-${e}-error`)),h.appendChild(o),l){let d=a("div","sb-field__error",{id:`sb-${e}-error`,role:"alert"});d.textContent=l,h.appendChild(d)}return h}createTextareaField(e,t,n,r,s,l){let p=a("div","sb-field"),h=a("label","sb-field__label",{for:`sb-${e}`});if(h.textContent=t,n){let o=a("span","sb-field__required");o.textContent="*",h.appendChild(o)}p.appendChild(h);let c=a("textarea","sb-field__input sb-field__textarea",{name:e,id:`sb-${e}`,placeholder:r,rows:"3"});if(n&&c.setAttribute("required","true"),l&&(c.value=l),s&&(c.classList.add("sb-field__input--error"),c.setAttribute("aria-invalid","true"),c.setAttribute("aria-describedby",`sb-${e}-error`)),p.appendChild(c),s){let o=a("div","sb-field__error",{id:`sb-${e}-error`,role:"alert"});o.textContent=s,p.appendChild(o)}return p}renderConfirmation(e){if(!this.contentEl)return;if(this.backBtn&&(this.backBtn.style.visibility="hidden"),this.progressBar){this.progressBar.style.width="100%";let l=this.progressBar.parentElement;l&&l.setAttribute("aria-valuenow","100")}this.stepCounter&&(this.stepCounter.textContent="Complete"),this.contentEl.textContent="";let t=a("div","sb-confirmation"),n=a("div","sb-confirmation__check");n.appendChild(be()),t.appendChild(n);let r=a("h2","sb-confirmation__headline");r.textContent=e.headline,t.appendChild(r);let s=a("p","sb-confirmation__body");if(s.textContent=e.body,t.appendChild(s),e.ctaText&&e.ctaUrl){let l=a("a","sb-confirmation__cta",{href:e.ctaUrl,target:"_blank",rel:"noopener noreferrer",role:"button"});l.textContent=e.ctaText,l.addEventListener("click",p=>{p.preventDefault(),this.callbacks.onCtaClick(e.ctaUrl)}),t.appendChild(l)}this.contentEl.appendChild(t),X(t),this.launchConfetti()}launchConfetti(){let e=document.createElement("canvas");e.style.cssText="position:fixed;inset:0;z-index:2147483647;pointer-events:none;width:100vw;height:100vh;",document.body.appendChild(e),e.width=window.innerWidth,e.height=window.innerHeight;let t=e.getContext("2d");if(!t){e.remove();return}let n=["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#F97316"],r=[],s=e.width,l=e.height;for(let o=0;o<100;o++){let d=Math.random()*Math.PI*2,b=2+Math.random()*5;r.push({x:s/2+(Math.random()-.5)*200,y:l/2+(Math.random()-.5)*100,w:8+Math.random()*10,h:5+Math.random()*10,vx:Math.cos(d)*b,vy:Math.sin(d)*b-3,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.15,color:n[Math.floor(Math.random()*n.length)]??"#3B82F6",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.02+Math.random()*.03,delay:0})}for(let o=0;o<80;o++){let d=o%2===0;r.push({x:d?-10:s+10,y:l*.7+Math.random()*l*.3,w:6+Math.random()*8,h:4+Math.random()*8,vx:(d?1:-1)*(3+Math.random()*5),vy:-(4+Math.random()*6),rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.2,color:n[Math.floor(Math.random()*n.length)]??"#10B981",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.015+Math.random()*.02,delay:30+Math.floor(Math.random()*20)})}for(let o=0;o<120;o++)r.push({x:Math.random()*s,y:-20-Math.random()*200,w:5+Math.random()*7,h:3+Math.random()*6,vx:(Math.random()-.5)*1.5,vy:.5+Math.random()*1.5,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.1,color:n[Math.floor(Math.random()*n.length)]??"#F59E0B",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.01+Math.random()*.02,delay:60+Math.floor(Math.random()*60)});let p=0,h=400,c=()=>{p++,t.clearRect(0,0,e.width,e.height);for(let o of r)p<o.delay||(o.sway+=o.swaySpeed,o.x+=o.vx+Math.sin(o.sway)*.5,o.vy+=.04,o.y+=o.vy,o.rot+=o.vr,o.vx*=.995,o.vr*=.998,p>h-80&&(o.life-=.0125),!(o.life<=0||o.y>e.height+20)&&(t.save(),t.translate(o.x,o.y),t.rotate(o.rot),t.globalAlpha=Math.max(0,o.life),t.fillStyle=o.color,o.shape===0?t.fillRect(-o.w/2,-o.h/2,o.w,o.h):o.shape===1?(t.beginPath(),t.arc(0,0,o.w/2,0,Math.PI*2),t.fill()):(t.beginPath(),t.moveTo(0,-o.h/2),t.lineTo(o.w/2,o.h/2),t.lineTo(-o.w/2,o.h/2),t.closePath(),t.fill()),t.restore()));p<h?requestAnimationFrame(c):e.remove()};requestAnimationFrame(c)}renderError(e){if(!this.contentEl)return;this.contentEl.textContent="";let t=a("div","sb-error"),n=a("div","sb-error__icon");n.appendChild(ge()),t.appendChild(n);let r=a("p","sb-error__message");r.textContent=e||"Something went wrong. Please try again.",t.appendChild(r);let s=a("button","sb-error__retry",{type:"button"});s.textContent="Try Again",s.addEventListener("click",()=>this.callbacks.onRetry()),t.appendChild(s),this.contentEl.appendChild(t)}renderLoading(){if(!this.contentEl)return;this.contentEl.textContent="";let e=a("div","sb-loading"),t=a("div","sb-loading__spinner"),n=a("span","sb-sr-only");n.textContent="Loading...",e.appendChild(t),e.appendChild(n),this.contentEl.appendChild(e)}renderDisabled(){for(;this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild)}renderExpiredFallback(){let e=this.shadow.querySelector("style");for(;this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild);e&&this.shadow.appendChild(e);let t=a("div","sb-panel",{role:"status",style:"position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; padding: 20px; max-width: 320px;"}),n=a("p","",{style:"font-size: 14px; opacity: 0.7; line-height: 1.5; text-align: center; margin: 0;"});n.textContent="Please contact us directly",t.appendChild(n),this.shadow.appendChild(t)}enableFocusTrap(){this.previousActiveElement=document.activeElement,this.boundKeyHandler=e=>{if(e.key==="Escape"){e.preventDefault(),this.callbacks.onClose();return}if(e.key==="Tab"&&this.panelEl){let t=this.getFocusableElements();if(t.length===0)return;let n=t[0],r=t[t.length-1];e.shiftKey?(this.shadow.activeElement===n||!this.panelEl.contains(this.shadow.activeElement))&&(e.preventDefault(),r.focus()):(this.shadow.activeElement===r||!this.panelEl.contains(this.shadow.activeElement))&&(e.preventDefault(),n.focus())}},document.addEventListener("keydown",this.boundKeyHandler,!0),requestAnimationFrame(()=>{let t=this.getFocusableElements()[0];t&&t.focus()})}disableFocusTrap(){this.boundKeyHandler&&(document.removeEventListener("keydown",this.boundKeyHandler,!0),this.boundKeyHandler=null),this.previousActiveElement&&this.previousActiveElement instanceof HTMLElement&&(this.previousActiveElement.focus(),this.previousActiveElement=null)}getFocusableElements(){if(!this.panelEl)return[];let t=this.panelEl.querySelectorAll('button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');return Array.from(t)}showTeaser(e){if(!this.triggerEl)return;let t=this.shadow.querySelector(".sb-teaser");t&&t.remove();let n=document.createElement("div");n.className="sb-teaser",n.setAttribute("role","status"),n.style.cssText=`
      position: fixed; bottom: 90px; right: 20px; z-index: 2147483646;
      background: #fff; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px; font-weight: 500; padding: 10px 16px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 240px;
      opacity: 0; transform: translateY(8px) scale(0.95);
      transition: opacity 200ms ease, transform 200ms ease;
      cursor: pointer; pointer-events: auto;
    `,n.textContent=e;let r=document.createElement("div");r.style.cssText=`
      position: absolute; bottom: -6px; right: 24px;
      width: 12px; height: 12px; background: #fff;
      transform: rotate(45deg); border-radius: 2px;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.08);
    `,n.appendChild(r),n.addEventListener("click",()=>{n.remove(),this.callbacks.onTriggerClick()}),this.shadow.appendChild(n),requestAnimationFrame(()=>{requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0) scale(1)"})}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(8px) scale(0.95)",setTimeout(()=>n.remove(),200)},6e3)}pulseTrigger(){if(!this.triggerEl)return;let e=this.triggerEl,t=e.style.transform;e.style.transition="transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",e.style.transform="scale(1.15)",setTimeout(()=>{e.style.transform="scale(1)",setTimeout(()=>{e.style.transform="scale(1.1)",setTimeout(()=>{e.style.transform=t||"scale(1)",e.style.transition=""},300)},300)},300)}destroy(){for(this.disableFocusTrap();this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild);this.triggerEl=null,this.panelEl=null,this.progressBar=null,this.stepCounter=null,this.contentEl=null,this.backBtn=null,this.ariaLiveRegion=null}};var fe=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,xe=/^[+\d\s().-]+$/;function Z(i,e){let t={},n=(i.name??"").trim();n?n.length>200&&(t.name="Name must be 200 characters or fewer."):t.name="Name is required.";let r=(i.email??"").trim();if(r?fe.test(r)||(t.email="Please enter a valid email address."):t.email="Email is required.",e.contactShowPhone){let s=(i.phone??"").trim();e.contactPhoneRequired&&!s?t.phone="Phone number is required.":s&&!xe.test(s)?t.phone="Please enter a valid phone number.":s&&s.length>30&&(t.phone="Phone must be 30 characters or fewer.")}if(e.contactShowMessage){let s=(i.message??"").trim();e.contactMessageRequired&&!s?t.message="Message is required.":s&&s.length>2e3&&(t.message="Message must be 2000 characters or fewer.")}return t}function J(i){return Object.keys(i).length>0}var ve="https://signalbox.io";async function ye(i,e){let t=Math.random().toString(36).substring(2,10),n=`${i}:${e}:${t}`,r=new TextEncoder,s=await crypto.subtle.digest("SHA-256",r.encode(n)),p=Array.from(new Uint8Array(s)).map(h=>h.toString(16).padStart(2,"0")).join("");return`sb_${i.slice(0,8)}_${p}`}function we(){try{let i=new URLSearchParams(window.location.search),e={},t=i.get("utm_source"),n=i.get("utm_medium"),r=i.get("utm_campaign");return t&&(e.utmSource=t),n&&(e.utmMedium=n),r&&(e.utmCampaign=r),e}catch{return{}}}function k(i,e,t,n){let r={widgetKey:e,event:t};n!==void 0&&(r.stepIndex=n);try{fetch(`${i}/api/v1/widget/track`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r),keepalive:!0}).catch(()=>{})}catch{}}var $=class{constructor(e,t){this.stepDirection="forward";this.validationErrors={};this.widgetKey=e,this.apiUrl=t,this.machine=new T}async start(){let e=`sb-root-${this.widgetKey}`;if(document.getElementById(e))return;let t=document.createElement("div");t.id=e,t.style.position="fixed",t.style.zIndex="2147483647",t.style.inset="0",t.style.overflow="visible",t.style.pointerEvents="none",document.body.appendChild(t),this.renderer=new L(t,{onTriggerClick:()=>this.handleTriggerClick(),onClose:()=>this.handleClose(),onOptionSelect:(n,r,s,l)=>this.handleOptionSelect(n,r,s,l),onBack:()=>this.handleBack(),onContactSubmit:(n,r)=>this.handleContactSubmit(n,r),onRetry:()=>this.handleRetry(),onCtaClick:n=>this.handleCtaClick(n)}),this.machine.init();try{let n=await O(this.widgetKey,this.apiUrl);this.machine.configLoaded(n),this.renderer.init(n),k(this.apiUrl,this.widgetKey,"impression"),this.scheduleAttentionGrabbers()}catch(n){if(n instanceof g){if(n.code==="INACTIVE"){this.machine.widgetDisabled(),this.renderer.renderDisabled();return}if(n.code==="EXPIRED"){this.machine.widgetDisabled(),this.renderer.renderExpiredFallback();return}this.machine.fetchFailed(n.message)}else this.machine.fetchFailed("Failed to load widget configuration.")}}scheduleAttentionGrabbers(){if(!this.machine.getContext().config)return;setTimeout(()=>{this.machine.getState()==="ready"&&this.renderer.showTeaser("See how you qualify in 30 seconds")},3e3),setTimeout(()=>{this.machine.getState()==="ready"&&this.renderer.pulseTrigger()},8e3);let t=!1,n=()=>{if(t||this.machine.getState()!=="ready")return;window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)>.4&&(t=!0,this.renderer.showTeaser("Quick question before you go?"),window.removeEventListener("scroll",n))};window.addEventListener("scroll",n,{passive:!0});let r=!1,s=l=>{r||this.machine.getState()!=="ready"||l.clientY<=0&&(r=!0,this.renderer.showTeaser("Wait! Get a personalized recommendation"),this.renderer.pulseTrigger(),document.removeEventListener("mouseleave",s))};document.addEventListener("mouseleave",s)}handleTriggerClick(){let e=this.machine.getContext();if(e.state!=="ready")return;this.machine.open(),k(this.apiUrl,this.widgetKey,"open");let t=e.config;if(!t||t.steps.length===0)return;let n=t.steps.length;this.renderer.openPanel(0,n),this.stepDirection="forward",k(this.apiUrl,this.widgetKey,"step_view",0),this.renderCurrentView()}handleClose(){let e=this.machine.getState();(e==="open"||e==="complete"||e==="error")&&(this.renderer.closePanel(),e==="complete"?this.machine.reset():e==="error"?this.machine.retry():this.machine.close())}handleOptionSelect(e,t,n,r){let s=this.machine.getContext();if(s.state!=="open"||!s.config)return;let l=s.config.steps.find(o=>o.id===e);if(!l)return;let p={stepId:e,optionId:t,question:l.question,label:n,scoreWeight:r};this.stepDirection="forward",this.machine.selectOption(p);let h=this.machine.getContext(),c=h.currentStepIndex;h.config&&c<h.config.steps.length?k(this.apiUrl,this.widgetKey,"step_view",c):k(this.apiUrl,this.widgetKey,"completion"),this.renderCurrentView()}handleBack(){let e=this.machine.getContext();e.state==="open"&&(this.stepDirection="backward",this.machine.isOnContactStep()?e.answers.length>0&&this.machine.goBack():this.machine.goBack(),this.renderCurrentView())}async handleContactSubmit(e,t){var s,l;let n=this.machine.getContext();if(n.state!=="open"||!n.config)return;this.machine.setContact(e);let r=Z(e,n.config);if(this.validationErrors=r,J(r)){this.renderer.renderContactForm(n.config.steps.length,r,!1,e);return}this.machine.submit(),this.renderer.renderContactForm(n.config.steps.length,{},!0,e);try{let p=await ye(this.widgetKey,n.loadedAt),h=we(),c={widgetKey:this.widgetKey,answers:n.answers.map(b=>({stepId:b.stepId,optionId:b.optionId})),visitorName:e.name.trim(),visitorEmail:e.email.trim(),challengeToken:p,loadedAt:n.loadedAt,sourceUrl:window.location.href,referrer:document.referrer||"",...h};(s=e.phone)!=null&&s.trim()&&(c.visitorPhone=e.phone.trim()),(l=e.message)!=null&&l.trim()&&(c.visitorMessage=e.message.trim()),t&&(c.honeypot=t);let o=await W(c,this.apiUrl);this.machine.submitSuccess(o.tier);let d=n.config.confirmation[o.tier];this.renderer.renderConfirmation(d)}catch(p){if(p instanceof g&&p.code==="DUPLICATE"){let c="warm";this.machine.submitSuccess(c);let o=n.config.confirmation[c];this.renderer.renderConfirmation(o);return}let h="Something went wrong. Please try again.";p instanceof g&&(h=p.message),this.machine.submitFailed(h),this.renderer.renderError(h)}}handleRetry(){let e=this.machine.getContext();if(e.state==="error")if(this.machine.retry(),e.config){this.machine.open();let t=e.config.steps.length;this.renderer.openPanel(0,t),this.stepDirection="forward",this.renderCurrentView()}else this.retryFetchConfig()}async retryFetchConfig(){this.machine.init();try{let e=await O(this.widgetKey,this.apiUrl);this.machine.configLoaded(e),this.renderer.init(e)}catch(e){if(e instanceof g){if(e.code==="INACTIVE"){this.machine.widgetDisabled(),this.renderer.renderDisabled();return}if(e.code==="EXPIRED"){this.machine.widgetDisabled(),this.renderer.renderExpiredFallback();return}this.machine.fetchFailed(e.message)}else this.machine.fetchFailed("Failed to load widget configuration.")}}handleCtaClick(e){window.open(e,"_blank","noopener,noreferrer")}renderCurrentView(){let e=this.machine.getContext();if(!e.config)return;let t=e.config.steps.length,n=e.currentStepIndex;if(this.machine.isOnContactStep()){this.renderer.updateProgress(t,t),this.renderer.renderContactForm(t,this.validationErrors,!1,e.contact);return}let r=e.config.steps[n];r&&this.renderer.renderStep(r,n,t,this.stepDirection)}};(function(){function i(){let e=window.SignalBoxConfig;if(!e||!e.key)return;let t=e.apiUrl||ve;new $(e.key,t).start()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",i,{once:!0}):i()})();})();
