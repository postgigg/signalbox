"use strict";var SignalBox=(()=>{var q={idle:{INIT:"loading"},loading:{CONFIG_LOADED:"ready",FETCH_FAILED:"error",WIDGET_DISABLED:"disabled"},ready:{OPEN:"open"},open:{CLOSE:"ready",SUBMIT:"submitting"},submitting:{SUBMIT_SUCCESS:"complete",SUBMIT_FAILED:"error"},complete:{RESET:"ready",CLOSE:"ready"},error:{RETRY:"ready",CLOSE:"ready"},disabled:{}},k=class{constructor(){this.listeners=[];this.ctx={state:"idle",config:null,currentStepIndex:0,answers:[],contact:{name:"",email:""},errorMessage:"",loadedAt:0,resultTier:null}}getState(){return this.ctx.state}getContext(){return this.ctx}onChange(t){return this.listeners.push(t),()=>{let e=this.listeners.indexOf(t);e!==-1&&this.listeners.splice(e,1)}}emit(t){let e={...this.ctx};for(let i of this.listeners)try{i(e,t)}catch{}}transition(t){let e=this.ctx.state,i=q[e],r=i==null?void 0:i[t];if(!r)return!1;let s=e;return this.ctx.state=r,this.emit(s),!0}init(){return this.ctx.loadedAt=Date.now(),this.transition("INIT")}configLoaded(t){return this.ctx.config=t,this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.errorMessage="",this.ctx.resultTier=null,this.transition("CONFIG_LOADED")}fetchFailed(t){return this.ctx.errorMessage=t,this.transition("FETCH_FAILED")}widgetDisabled(){return this.transition("WIDGET_DISABLED")}open(){return this.ctx.resultTier!==null&&(this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.resultTier=null,this.ctx.errorMessage=""),this.transition("OPEN")}close(){return this.transition("CLOSE")}selectOption(t){var r;if(this.ctx.state!=="open")return;let e=this.ctx.answers.findIndex(s=>s.stepId===t.stepId);e!==-1?this.ctx.answers[e]=t:this.ctx.answers.push(t);let i=((r=this.ctx.config)==null?void 0:r.steps.length)??0;this.ctx.currentStepIndex<i-1&&this.ctx.currentStepIndex++,this.emit(this.ctx.state)}goBack(){this.ctx.state==="open"&&this.ctx.currentStepIndex>0&&(this.ctx.currentStepIndex--,this.emit(this.ctx.state))}isOnContactStep(){return this.ctx.config?this.ctx.answers.length>=this.ctx.config.steps.length:!1}setContact(t){this.ctx.contact=t}submit(){return this.transition("SUBMIT")}submitSuccess(t){return this.ctx.resultTier=t,this.transition("SUBMIT_SUCCESS")}submitFailed(t){return this.ctx.errorMessage=t,this.transition("SUBMIT_FAILED")}retry(){return this.ctx.errorMessage="",this.transition("RETRY")}reset(){return this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.errorMessage="",this.ctx.resultTier=null,this.transition("RESET")}};var g=class extends Error{constructor(e,i,r){super(e);this.status=i;this.code=r;this.name="WidgetApiError"}};function M(n,t,e=15e3){let i=new AbortController,r=setTimeout(()=>i.abort(),e),s={...t,signal:i.signal};return fetch(n,s).finally(()=>clearTimeout(r))}function R(n,t){switch(n){case 402:return new g("This widget subscription has expired.",402,"EXPIRED");case 404:return new g("Widget not found. Please check your widget key.",404,"NOT_FOUND");case 409:return new g("You have already submitted a response.",409,"DUPLICATE");case 410:return new g("This widget is no longer active.",410,"INACTIVE");case 429:return new g("Too many requests. Please try again later.",429,"RATE_LIMITED");default:return new g(t||"An unexpected error occurred.",n,"SERVER_ERROR")}}async function L(n,t){let e=`${t}/api/v1/widget/${encodeURIComponent(n)}`,i;try{i=await M(e,{method:"GET",headers:{Accept:"application/json"}})}catch(s){throw s instanceof DOMException&&s.name==="AbortError"?new g("Request timed out. Please check your connection.",0,"TIMEOUT"):new g("Network error. Please check your connection.",0,"NETWORK_ERROR")}if(!i.ok){let s=await i.text().catch(()=>"");throw R(i.status,s)}return await i.json()}async function P(n,t){let e=`${t}/api/v1/submit`,i=async()=>{try{return await M(e,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(n)})}catch(a){throw a instanceof DOMException&&a.name==="AbortError"?new g("Request timed out. Please try again.",0,"TIMEOUT"):new g("Network error. Please try again.",0,"NETWORK_ERROR")}},r=await i();if(r.status>=500&&r.status<600&&(await new Promise(a=>setTimeout(a,2e3)),r=await i()),!r.ok){let a=await r.text().catch(()=>"");throw R(r.status,a)}return await r.json()}function K(n){switch(n){case"serif":return'Georgia, "Times New Roman", Times, serif';case"sans":return'"Helvetica Neue", Helvetica, Arial, sans-serif';case"system":default:return'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}function j(n){let t=n.triggerOffsetX,e=n.triggerOffsetY;switch(n.position){case"bottom-left":return`bottom: ${e}px; left: ${t}px;`;case"bottom-center":return`bottom: ${e}px; left: 50%; transform: translateX(-50%);`;case"bottom-right":default:return`bottom: ${e}px; right: ${t}px;`}}function Y(n){let t=n.triggerOffsetX,e=n.triggerOffsetY+60;switch(n.position){case"bottom-left":return`bottom: ${e}px; left: ${t}px;`;case"bottom-center":return`bottom: ${e}px; left: 50%; transform: translateX(-50%);`;case"bottom-right":default:return`bottom: ${e}px; right: ${t}px;`}}function F(n,t){let e=n.replace("#",""),i=parseInt(e.substring(0,2),16),r=parseInt(e.substring(2,4),16),s=parseInt(e.substring(4,6),16);return isNaN(i)||isNaN(r)||isNaN(s)?n:`rgba(${i}, ${r}, ${s}, ${t})`}function O(n){let t=K(n.fontFamily),e=n.borderRadius,i=n.panelWidth||400,r=n.mode==="dark"?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)",s=n.mode==="dark"?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)",a=n.mode==="dark"?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",d=n.mode==="dark"?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)";return`
/* \u2500\u2500 CSS Custom Properties \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
:host {
  --sb-primary: ${n.primaryColor};
  --sb-accent: ${n.accentColor};
  --sb-bg: ${n.backgroundColor};
  --sb-text: ${n.textColor};
  --sb-radius: ${e}px;
  --sb-font: ${t};
  --sb-panel-width: ${i}px;
  --sb-border: ${r};
  --sb-input-bg: ${s};
  --sb-input-border: ${a};
  --sb-hover-bg: ${d};
  --sb-accent-10: ${F(n.accentColor,.1)};
  --sb-accent-20: ${F(n.accentColor,.2)};

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
  ${j(n)}
  z-index: 2147483647;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 20px;
  border: none;
  border-radius: ${Math.min(n.borderRadius,12)}px;
  background: var(--sb-primary);
  color: #fff;
  font-family: var(--sb-font);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.01em;
  cursor: pointer;
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
  border-radius: ${e}px ${e}px 0 0;
  padding: 0 24px;
  height: 40px;
}

/* \u2500\u2500 Panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-panel {
  position: fixed;
  ${Y(n)}
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
`}var X="(prefers-reduced-motion: reduce)";function _(){return typeof window<"u"&&window.matchMedia(X).matches}function Z(n,t,e){if(n.classList.add(t),_()){n.classList.remove(t);return}setTimeout(()=>{n.classList.remove(t)},e)}function D(n){n.classList.remove("sb-panel--hidden","sb-panel--closing"),n.style.animation="none",n.offsetHeight,n.style.animation=""}function $(n,t){if(_()){n.classList.add("sb-panel--hidden"),t();return}n.classList.add("sb-panel--closing");let e=()=>{n.removeEventListener("animationend",e),n.classList.add("sb-panel--hidden"),n.classList.remove("sb-panel--closing"),t()};n.addEventListener("animationend",e,{once:!0}),setTimeout(()=>{n.classList.contains("sb-panel--hidden")||(n.removeEventListener("animationend",e),n.classList.add("sb-panel--hidden"),n.classList.remove("sb-panel--closing"),t())},300)}function A(n,t){let e=n.firstElementChild;if(!e||_()){n.textContent="";let r=t();n.appendChild(r);return}e.classList.add("sb-step--exit");let i=()=>{e.removeEventListener("animationend",i),n.textContent="";let r=t();n.appendChild(r)};e.addEventListener("animationend",i,{once:!0}),setTimeout(()=>{if(n.contains(e)){e.removeEventListener("animationend",i),n.textContent="";let r=t();n.appendChild(r)}},250)}function B(n,t){if(_()){n.textContent="";let i=t();n.appendChild(i);return}n.textContent="";let e=t();e.classList.add("sb-step--back"),n.appendChild(e),setTimeout(()=>{e.classList.remove("sb-step--back")},350)}function H(n){Z(n,"sb-option--tapped",200)}function N(n){n.classList.remove("sb-trigger--hidden")}function W(n){n.classList.add("sb-trigger--hidden")}function U(n){n.style.animation="none",n.offsetHeight,n.style.animation=""}function m(n,...t){let e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.setAttribute("viewBox",n),e.setAttribute("aria-hidden","true"),e.setAttribute("focusable","false");for(let i of t)i(e);return e}function E(n,t){return e=>{let i=document.createElementNS("http://www.w3.org/2000/svg","path");if(i.setAttribute("d",n),t)for(let[r,s]of Object.entries(t))i.setAttribute(r,s);e.appendChild(i)}}function y(n,t,e,i){return r=>{let s=document.createElementNS("http://www.w3.org/2000/svg","line");s.setAttribute("x1",n),s.setAttribute("y1",t),s.setAttribute("x2",e),s.setAttribute("y2",i),r.appendChild(s)}}function J(n,t,e){return i=>{let r=document.createElementNS("http://www.w3.org/2000/svg","circle");r.setAttribute("cx",n),r.setAttribute("cy",t),r.setAttribute("r",e),i.appendChild(r)}}function Q(n){return t=>{let e=document.createElementNS("http://www.w3.org/2000/svg","polyline");e.setAttribute("points",n),t.appendChild(e)}}function tt(){return m("0 0 24 24",E("M5 12h14"),E("M12 5l7 7-7 7"))}function et(){return m("0 0 24 24",E("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",{fill:"currentColor",stroke:"none"}))}function it(){return m("0 0 24 24",y("12","5","12","19"),y("5","12","19","12"))}function nt(){return m("0 0 24 24",y("18","6","6","18"),y("6","6","18","18"))}function rt(){return m("0 0 24 24",Q("15 18 9 12 15 6"))}function st(){return m("0 0 24 24",E("M5 13l4 4L19 7"))}function ot(){return m("0 0 24 24",J("12","12","10"),y("12","8","12","12"),y("12","16","12.01","16"))}function at(){return m("0 0 16 16",E("M8 8a3 3 0 100-6 3 3 0 000 6zM2 14s-1 0-1-1 1-4 7-4 7 3 7 4-1 1-1 1H2z",{fill:"currentColor",stroke:"none"}))}function lt(n){switch(n){case"arrow":return tt();case"chat":return et();case"plus":return it();case"none":default:return null}}function o(n,t,e){let i=document.createElement(n);if(t&&(i.className=t),e)for(let[r,s]of Object.entries(e))i.setAttribute(r,s);return i}var S=class{constructor(t,e){this.config=null;this.triggerEl=null;this.panelEl=null;this.progressBar=null;this.stepCounter=null;this.contentEl=null;this.backBtn=null;this.ariaLiveRegion=null;this.previousActiveElement=null;this.boundKeyHandler=null;this.host=t,this.callbacks=e,this.shadow=t.attachShadow({mode:"open"})}init(t){this.config=t,this.injectStyles(t.theme),this.renderTrigger(t)}injectStyles(t){let e=document.createElement("style");e.textContent=O(t),this.shadow.appendChild(e)}renderTrigger(t){let e=o("button","sb-trigger sb-trigger--hidden",{type:"button","aria-label":t.theme.triggerText||"Open widget"});t.theme.triggerType==="tab"&&e.classList.add("sb-trigger--tab");let i=lt(t.theme.triggerIcon);if(i){let s=o("span","sb-trigger__icon");s.appendChild(i),e.appendChild(s)}let r=document.createTextNode(t.theme.triggerText||"Get Started");e.appendChild(r),e.addEventListener("click",()=>{this.callbacks.onTriggerClick()}),this.shadow.appendChild(e),this.triggerEl=e,requestAnimationFrame(()=>{N(e)})}showTrigger(){this.triggerEl&&this.triggerEl.classList.remove("sb-trigger--hidden")}hideTrigger(){this.triggerEl&&W(this.triggerEl)}openPanel(t,e){this.config&&(this.hideTrigger(),this.panelEl||this.buildPanel(),this.panelEl&&(D(this.panelEl),this.updateProgress(t,e),this.enableFocusTrap()))}closePanel(){this.panelEl&&($(this.panelEl,()=>{this.showTrigger()}),this.disableFocusTrap())}buildPanel(){var h;let t=o("div","sb-panel sb-panel--hidden",{role:"dialog","aria-label":"SignalBox Widget","aria-modal":"true"}),e=o("div","sb-header"),i=o("div","sb-header__left"),r=o("button","sb-header__back",{type:"button","aria-label":"Go back",style:"visibility: hidden;"});r.appendChild(rt()),r.addEventListener("click",()=>this.callbacks.onBack()),this.backBtn=r,i.appendChild(r);let s=o("span","sb-header__step");s.textContent="",this.stepCounter=s,i.appendChild(s),e.appendChild(i);let a=o("button","sb-header__close",{type:"button","aria-label":"Close widget"});a.appendChild(nt()),a.addEventListener("click",()=>this.callbacks.onClose()),e.appendChild(a),t.appendChild(e);let d=o("div","sb-progress",{role:"progressbar","aria-valuemin":"0","aria-valuemax":"100","aria-valuenow":"0"}),p=o("div","sb-progress__bar");p.style.width="0%",d.appendChild(p),t.appendChild(d),this.progressBar=p;let l=o("div","sb-content");if(t.appendChild(l),this.contentEl=l,(h=this.config)!=null&&h.theme.showBranding){let b=o("div","sb-footer"),u=o("a","sb-footer__link",{href:"https://signalbox.io?ref=widget",target:"_blank",rel:"noopener noreferrer"});u.textContent="Powered by SignalBox",b.appendChild(u),t.appendChild(b)}let c=o("div","sb-sr-only",{"aria-live":"polite","aria-atomic":"true"});t.appendChild(c),this.ariaLiveRegion=c,this.shadow.appendChild(t),this.panelEl=t}updateProgress(t,e){let i=e+1,r=t+1,s=Math.round(r/i*100);if(this.progressBar){this.progressBar.style.width=`${s}%`;let a=this.progressBar.parentElement;a&&a.setAttribute("aria-valuenow",String(s))}this.stepCounter&&(this.stepCounter.textContent=`Step ${r} of ${i}`),this.backBtn&&(this.backBtn.style.visibility=t>0?"visible":"hidden"),this.ariaLiveRegion&&(this.ariaLiveRegion.textContent=`Step ${r} of ${i}`)}renderStep(t,e,i,r="forward"){if(!this.contentEl)return;this.updateProgress(e,i);let s=()=>{var l;let a=o("div","sb-step"),d=o("h2","sb-question");if(d.textContent=t.question,a.appendChild(d),t.description){let c=o("p","sb-description");c.textContent=t.description,a.appendChild(c)}let p=o("div","sb-options",{role:"radiogroup","aria-label":t.question});for(let c=0;c<t.options.length;c++){let h=t.options[c],b=o("button","sb-option",{type:"button",role:"radio","aria-checked":"false","data-option-id":h.id});if(h.icon){let f=o("span","sb-option__icon");f.textContent=h.icon,b.appendChild(f)}let u=o("span","sb-option__label");u.textContent=h.label,b.appendChild(u),b.addEventListener("click",()=>{H(b),setTimeout(()=>{this.callbacks.onOptionSelect(t.id,h.id,h.label,h.scoreWeight)},120)}),b.addEventListener("keydown",f=>{(f.key==="Enter"||f.key===" ")&&(f.preventDefault(),b.click())}),p.appendChild(b)}if(a.appendChild(p),(l=this.config)!=null&&l.theme.showSocialProof&&e===0&&this.config.submissionCount>=this.config.socialProofMin){let c=o("div","sb-social-proof"),h=o("span","sb-social-proof__icon");h.appendChild(at()),c.appendChild(h);let b=document.createTextNode(this.config.socialProofText.replace("{count}",String(this.config.submissionCount)));c.appendChild(b),a.appendChild(c)}return a};r==="backward"?B(this.contentEl,s):A(this.contentEl,s)}renderContactForm(t,e={},i=!1,r){if(!this.contentEl||!this.config)return;this.updateProgress(t,t);let s=()=>{let a=o("div","sb-contact"),d=o("h2","sb-contact__title");d.textContent="Almost done!",a.appendChild(d);let p=o("p","sb-contact__subtitle");p.textContent="Enter your details to see your results.",a.appendChild(p);let l=o("form","",{novalidate:"true",autocomplete:"on"}),c=this.createField("name","Name","text",!0,"Your name",e.name,r==null?void 0:r.name);l.appendChild(c);let h=this.createField("email","Email","email",!0,"you@example.com",e.email,r==null?void 0:r.email);if(l.appendChild(h),this.config.contactShowPhone){let x=this.createField("phone","Phone","tel",this.config.contactPhoneRequired,"(555) 123-4567",e.phone,r==null?void 0:r.phone);l.appendChild(x)}if(this.config.contactShowMessage){let x=this.createTextareaField("message","Message",this.config.contactMessageRequired,this.config.contactMessagePlaceholder||"Tell us more...",e.message,r==null?void 0:r.message);l.appendChild(x)}let b=o("div","sb-hp"),u=o("label");u.textContent="Leave this empty";let f=o("input","",{type:"text",name:"website",tabindex:"-1",autocomplete:"off","aria-hidden":"true"});b.appendChild(u),b.appendChild(f),l.appendChild(b);let w=o("button","sb-submit",{type:"submit"});if(i){w.setAttribute("disabled","true");let x=o("span","sb-submit__spinner");w.appendChild(x);let v=document.createTextNode("Submitting...");w.appendChild(v)}else w.textContent=this.config.contactSubmitText||"See My Results";return l.appendChild(w),l.addEventListener("submit",x=>{x.preventDefault();let v=new FormData(l),T={name:v.get("name")||"",email:v.get("email")||""};this.config.contactShowPhone&&(T.phone=v.get("phone")||""),this.config.contactShowMessage&&(T.message=v.get("message")||"");let G=v.get("website")||"";this.callbacks.onContactSubmit(T,G)}),a.appendChild(l),a};A(this.contentEl,s)}createField(t,e,i,r,s,a,d){let p=o("div","sb-field"),l=o("label","sb-field__label",{for:`sb-${t}`});if(l.textContent=e,r){let h=o("span","sb-field__required");h.textContent="*",l.appendChild(h)}p.appendChild(l);let c=o("input","sb-field__input",{type:i,name:t,id:`sb-${t}`,placeholder:s,autocomplete:t});if(r&&c.setAttribute("required","true"),d&&(c.value=d),a&&(c.classList.add("sb-field__input--error"),c.setAttribute("aria-invalid","true"),c.setAttribute("aria-describedby",`sb-${t}-error`)),p.appendChild(c),a){let h=o("div","sb-field__error",{id:`sb-${t}-error`,role:"alert"});h.textContent=a,p.appendChild(h)}return p}createTextareaField(t,e,i,r,s,a){let d=o("div","sb-field"),p=o("label","sb-field__label",{for:`sb-${t}`});if(p.textContent=e,i){let c=o("span","sb-field__required");c.textContent="*",p.appendChild(c)}d.appendChild(p);let l=o("textarea","sb-field__input sb-field__textarea",{name:t,id:`sb-${t}`,placeholder:r,rows:"3"});if(i&&l.setAttribute("required","true"),a&&(l.value=a),s&&(l.classList.add("sb-field__input--error"),l.setAttribute("aria-invalid","true"),l.setAttribute("aria-describedby",`sb-${t}-error`)),d.appendChild(l),s){let c=o("div","sb-field__error",{id:`sb-${t}-error`,role:"alert"});c.textContent=s,d.appendChild(c)}return d}renderConfirmation(t){if(!this.contentEl)return;if(this.backBtn&&(this.backBtn.style.visibility="hidden"),this.progressBar){this.progressBar.style.width="100%";let a=this.progressBar.parentElement;a&&a.setAttribute("aria-valuenow","100")}this.stepCounter&&(this.stepCounter.textContent="Complete"),this.contentEl.textContent="";let e=o("div","sb-confirmation"),i=o("div","sb-confirmation__check");i.appendChild(st()),e.appendChild(i);let r=o("h2","sb-confirmation__headline");r.textContent=t.headline,e.appendChild(r);let s=o("p","sb-confirmation__body");if(s.textContent=t.body,e.appendChild(s),t.ctaText&&t.ctaUrl){let a=o("a","sb-confirmation__cta",{href:t.ctaUrl,target:"_blank",rel:"noopener noreferrer",role:"button"});a.textContent=t.ctaText,a.addEventListener("click",d=>{d.preventDefault(),this.callbacks.onCtaClick(t.ctaUrl)}),e.appendChild(a)}this.contentEl.appendChild(e),U(e)}renderError(t){if(!this.contentEl)return;this.contentEl.textContent="";let e=o("div","sb-error"),i=o("div","sb-error__icon");i.appendChild(ot()),e.appendChild(i);let r=o("p","sb-error__message");r.textContent=t||"Something went wrong. Please try again.",e.appendChild(r);let s=o("button","sb-error__retry",{type:"button"});s.textContent="Try Again",s.addEventListener("click",()=>this.callbacks.onRetry()),e.appendChild(s),this.contentEl.appendChild(e)}renderLoading(){if(!this.contentEl)return;this.contentEl.textContent="";let t=o("div","sb-loading"),e=o("div","sb-loading__spinner"),i=o("span","sb-sr-only");i.textContent="Loading...",t.appendChild(e),t.appendChild(i),this.contentEl.appendChild(t)}renderDisabled(){for(;this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild)}renderExpiredFallback(){let t=this.shadow.querySelector("style");for(;this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild);t&&this.shadow.appendChild(t);let e=o("div","sb-panel",{role:"status",style:"position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; padding: 20px; max-width: 320px;"}),i=o("p","",{style:"font-size: 14px; opacity: 0.7; line-height: 1.5; text-align: center; margin: 0;"});i.textContent="Please contact us directly",e.appendChild(i),this.shadow.appendChild(e)}enableFocusTrap(){this.previousActiveElement=document.activeElement,this.boundKeyHandler=t=>{if(t.key==="Escape"){t.preventDefault(),this.callbacks.onClose();return}if(t.key==="Tab"&&this.panelEl){let e=this.getFocusableElements();if(e.length===0)return;let i=e[0],r=e[e.length-1];t.shiftKey?(this.shadow.activeElement===i||!this.panelEl.contains(this.shadow.activeElement))&&(t.preventDefault(),r.focus()):(this.shadow.activeElement===r||!this.panelEl.contains(this.shadow.activeElement))&&(t.preventDefault(),i.focus())}},document.addEventListener("keydown",this.boundKeyHandler,!0),requestAnimationFrame(()=>{let e=this.getFocusableElements()[0];e&&e.focus()})}disableFocusTrap(){this.boundKeyHandler&&(document.removeEventListener("keydown",this.boundKeyHandler,!0),this.boundKeyHandler=null),this.previousActiveElement&&this.previousActiveElement instanceof HTMLElement&&(this.previousActiveElement.focus(),this.previousActiveElement=null)}getFocusableElements(){if(!this.panelEl)return[];let e=this.panelEl.querySelectorAll('button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');return Array.from(e)}showTeaser(t){if(!this.triggerEl)return;let e=this.shadow.querySelector(".sb-teaser");e&&e.remove();let i=document.createElement("div");i.className="sb-teaser",i.setAttribute("role","status"),i.style.cssText=`
      position: fixed; bottom: 90px; right: 20px; z-index: 2147483646;
      background: #fff; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px; font-weight: 500; padding: 10px 16px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 240px;
      opacity: 0; transform: translateY(8px) scale(0.95);
      transition: opacity 200ms ease, transform 200ms ease;
      cursor: pointer; pointer-events: auto;
    `,i.textContent=t;let r=document.createElement("div");r.style.cssText=`
      position: absolute; bottom: -6px; right: 24px;
      width: 12px; height: 12px; background: #fff;
      transform: rotate(45deg); border-radius: 2px;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.08);
    `,i.appendChild(r),i.addEventListener("click",()=>{i.remove(),this.callbacks.onTriggerClick()}),this.shadow.appendChild(i),requestAnimationFrame(()=>{requestAnimationFrame(()=>{i.style.opacity="1",i.style.transform="translateY(0) scale(1)"})}),setTimeout(()=>{i.style.opacity="0",i.style.transform="translateY(8px) scale(0.95)",setTimeout(()=>i.remove(),200)},6e3)}pulseTrigger(){if(!this.triggerEl)return;let t=this.triggerEl,e=t.style.transform;t.style.transition="transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",t.style.transform="scale(1.15)",setTimeout(()=>{t.style.transform="scale(1)",setTimeout(()=>{t.style.transform="scale(1.1)",setTimeout(()=>{t.style.transform=e||"scale(1)",t.style.transition=""},300)},300)},300)}destroy(){for(this.disableFocusTrap();this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild);this.triggerEl=null,this.panelEl=null,this.progressBar=null,this.stepCounter=null,this.contentEl=null,this.backBtn=null,this.ariaLiveRegion=null}};var ct=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;function z(n,t){let e={},i=(n.name??"").trim();i?i.length>200&&(e.name="Name must be 200 characters or fewer."):e.name="Name is required.";let r=(n.email??"").trim();if(r?ct.test(r)||(e.email="Please enter a valid email address."):e.email="Email is required.",t.contactShowPhone){let s=(n.phone??"").trim();t.contactPhoneRequired&&!s?e.phone="Phone number is required.":s&&s.length>30&&(e.phone="Phone must be 30 characters or fewer.")}if(t.contactShowMessage){let s=(n.message??"").trim();t.contactMessageRequired&&!s?e.message="Message is required.":s&&s.length>2e3&&(e.message="Message must be 2000 characters or fewer.")}return e}function V(n){return Object.keys(n).length>0}var dt="https://signalbox.io";async function pt(n,t){let e=Math.random().toString(36).substring(2,10),i=`${n}:${t}:${e}`,r=new TextEncoder,s=await crypto.subtle.digest("SHA-256",r.encode(i)),d=Array.from(new Uint8Array(s)).map(p=>p.toString(16).padStart(2,"0")).join("");return`sb_${n.slice(0,8)}_${d}`}function ht(){try{let n=new URLSearchParams(window.location.search),t={},e=n.get("utm_source"),i=n.get("utm_medium"),r=n.get("utm_campaign");return e&&(t.utmSource=e),i&&(t.utmMedium=i),r&&(t.utmCampaign=r),t}catch{return{}}}function C(n,t,e,i){let r={widgetKey:t,event:e};i!==void 0&&(r.stepIndex=i);try{fetch(`${n}/api/v1/widget/track`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r),keepalive:!0}).catch(()=>{})}catch{}}var I=class{constructor(t,e){this.stepDirection="forward";this.validationErrors={};this.widgetKey=t,this.apiUrl=e,this.machine=new k}async start(){let t=`sb-root-${this.widgetKey}`;if(document.getElementById(t))return;let e=document.createElement("div");e.id=t,e.style.position="fixed",e.style.zIndex="2147483647",e.style.top="0",e.style.left="0",e.style.width="0",e.style.height="0",e.style.overflow="visible",e.style.pointerEvents="none",document.body.appendChild(e),this.renderer=new S(e,{onTriggerClick:()=>this.handleTriggerClick(),onClose:()=>this.handleClose(),onOptionSelect:(i,r,s,a)=>this.handleOptionSelect(i,r,s,a),onBack:()=>this.handleBack(),onContactSubmit:(i,r)=>this.handleContactSubmit(i,r),onRetry:()=>this.handleRetry(),onCtaClick:i=>this.handleCtaClick(i)}),this.machine.init();try{let i=await L(this.widgetKey,this.apiUrl);this.machine.configLoaded(i),this.renderer.init(i),C(this.apiUrl,this.widgetKey,"impression"),this.scheduleAttentionGrabbers()}catch(i){if(i instanceof g){if(i.code==="INACTIVE"){this.machine.widgetDisabled(),this.renderer.renderDisabled();return}if(i.code==="EXPIRED"){this.machine.widgetDisabled(),this.renderer.renderExpiredFallback();return}this.machine.fetchFailed(i.message)}else this.machine.fetchFailed("Failed to load widget configuration.")}}scheduleAttentionGrabbers(){if(!this.machine.getContext().config)return;setTimeout(()=>{this.machine.getState()==="ready"&&this.renderer.showTeaser("See how you qualify in 30 seconds")},3e3),setTimeout(()=>{this.machine.getState()==="ready"&&this.renderer.pulseTrigger()},8e3);let e=!1,i=()=>{if(e||this.machine.getState()!=="ready")return;window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)>.4&&(e=!0,this.renderer.showTeaser("Quick question before you go?"),window.removeEventListener("scroll",i))};window.addEventListener("scroll",i,{passive:!0});let r=!1,s=a=>{r||this.machine.getState()!=="ready"||a.clientY<=0&&(r=!0,this.renderer.showTeaser("Wait! Get a personalized recommendation"),this.renderer.pulseTrigger(),document.removeEventListener("mouseleave",s))};document.addEventListener("mouseleave",s)}handleTriggerClick(){let t=this.machine.getContext();if(t.state!=="ready")return;this.machine.open(),C(this.apiUrl,this.widgetKey,"open");let e=t.config;if(!e||e.steps.length===0)return;let i=e.steps.length;this.renderer.openPanel(0,i),this.stepDirection="forward",C(this.apiUrl,this.widgetKey,"step_view",0),this.renderCurrentView()}handleClose(){let t=this.machine.getState();(t==="open"||t==="complete"||t==="error")&&(this.renderer.closePanel(),t==="complete"?this.machine.reset():t==="error"?this.machine.retry():this.machine.close())}handleOptionSelect(t,e,i,r){let s=this.machine.getContext();if(s.state!=="open"||!s.config)return;let a=s.config.steps.find(c=>c.id===t);if(!a)return;let d={stepId:t,optionId:e,question:a.question,label:i,scoreWeight:r};this.stepDirection="forward",this.machine.selectOption(d);let p=this.machine.getContext(),l=p.currentStepIndex;p.config&&l<p.config.steps.length?C(this.apiUrl,this.widgetKey,"step_view",l):C(this.apiUrl,this.widgetKey,"completion"),this.renderCurrentView()}handleBack(){let t=this.machine.getContext();t.state==="open"&&(this.stepDirection="backward",this.machine.isOnContactStep()?t.answers.length>0&&this.machine.goBack():this.machine.goBack(),this.renderCurrentView())}async handleContactSubmit(t,e){var s,a;let i=this.machine.getContext();if(i.state!=="open"||!i.config)return;this.machine.setContact(t);let r=z(t,i.config);if(this.validationErrors=r,V(r)){this.renderer.renderContactForm(i.config.steps.length,r,!1,t);return}this.machine.submit(),this.renderer.renderContactForm(i.config.steps.length,{},!0,t);try{let d=await pt(this.widgetKey,i.loadedAt),p=ht(),l={widgetKey:this.widgetKey,answers:i.answers.map(b=>({stepId:b.stepId,optionId:b.optionId})),visitorName:t.name.trim(),visitorEmail:t.email.trim(),challengeToken:d,loadedAt:i.loadedAt,sourceUrl:window.location.href,referrer:document.referrer||"",...p};(s=t.phone)!=null&&s.trim()&&(l.visitorPhone=t.phone.trim()),(a=t.message)!=null&&a.trim()&&(l.visitorMessage=t.message.trim()),e&&(l.honeypot=e);let c=await P(l,this.apiUrl);this.machine.submitSuccess(c.tier);let h=i.config.confirmation[c.tier];this.renderer.renderConfirmation(h)}catch(d){if(d instanceof g&&d.code==="DUPLICATE"){let l="warm";this.machine.submitSuccess(l);let c=i.config.confirmation[l];this.renderer.renderConfirmation(c);return}let p="Something went wrong. Please try again.";d instanceof g&&(p=d.message),this.machine.submitFailed(p),this.renderer.renderError(p)}}handleRetry(){let t=this.machine.getContext();if(t.state==="error")if(this.machine.retry(),t.config){this.machine.open();let e=t.config.steps.length;this.renderer.openPanel(0,e),this.stepDirection="forward",this.renderCurrentView()}else this.retryFetchConfig()}async retryFetchConfig(){this.machine.init();try{let t=await L(this.widgetKey,this.apiUrl);this.machine.configLoaded(t),this.renderer.init(t)}catch(t){if(t instanceof g){if(t.code==="INACTIVE"){this.machine.widgetDisabled(),this.renderer.renderDisabled();return}if(t.code==="EXPIRED"){this.machine.widgetDisabled(),this.renderer.renderExpiredFallback();return}this.machine.fetchFailed(t.message)}else this.machine.fetchFailed("Failed to load widget configuration.")}}handleCtaClick(t){window.open(t,"_blank","noopener,noreferrer")}renderCurrentView(){let t=this.machine.getContext();if(!t.config)return;let e=t.config.steps.length,i=t.currentStepIndex;if(this.machine.isOnContactStep()){this.renderer.updateProgress(e,e),this.renderer.renderContactForm(e,this.validationErrors,!1,t.contact);return}let r=t.config.steps[i];r&&this.renderer.renderStep(r,i,e,this.stepDirection)}};(function(){function n(){let t=window.SignalBoxConfig;if(!t||!t.key)return;let e=t.apiUrl||dt;new I(t.key,e).start()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n,{once:!0}):n()})();})();
