"use strict";var HawkLeads=(()=>{var at={idle:{INIT:"loading"},loading:{CONFIG_LOADED:"ready",FETCH_FAILED:"error",WIDGET_DISABLED:"disabled"},ready:{OPEN:"open"},open:{CLOSE:"ready",SUBMIT:"submitting"},submitting:{SUBMIT_SUCCESS:"complete",SUBMIT_FAILED:"error"},complete:{RESET:"ready",CLOSE:"ready"},error:{RETRY:"ready",CLOSE:"ready"},disabled:{}},A=class{constructor(){this.listeners=[];this.ctx={state:"idle",config:null,currentStepIndex:0,answers:[],contact:{name:"",email:""},errorMessage:"",loadedAt:0,resultTier:null}}getState(){return this.ctx.state}getContext(){return this.ctx}onChange(t){return this.listeners.push(t),()=>{let e=this.listeners.indexOf(t);e!==-1&&this.listeners.splice(e,1)}}emit(t){let e={...this.ctx};for(let n of this.listeners)try{n(e,t)}catch{}}transition(t){let e=this.ctx.state,n=at[e],i=n==null?void 0:n[t];if(!i)return!1;let s=e;return this.ctx.state=i,this.emit(s),!0}init(){return this.ctx.loadedAt=Date.now(),this.transition("INIT")}configLoaded(t){return this.ctx.config=t,this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.errorMessage="",this.ctx.resultTier=null,this.transition("CONFIG_LOADED")}fetchFailed(t){return this.ctx.errorMessage=t,this.transition("FETCH_FAILED")}widgetDisabled(){return this.transition("WIDGET_DISABLED")}open(){return this.ctx.resultTier!==null&&(this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.resultTier=null,this.ctx.errorMessage=""),this.transition("OPEN")}close(){return this.transition("CLOSE")}selectOption(t){var i;if(this.ctx.state!=="open")return;let e=this.ctx.answers.findIndex(s=>s.stepId===t.stepId);e!==-1?this.ctx.answers[e]=t:this.ctx.answers.push(t);let n=((i=this.ctx.config)==null?void 0:i.steps.length)??0;this.ctx.currentStepIndex<n-1&&this.ctx.currentStepIndex++,this.emit(this.ctx.state)}goBack(){this.ctx.state==="open"&&this.ctx.currentStepIndex>0&&(this.ctx.currentStepIndex--,this.emit(this.ctx.state))}isOnContactStep(){return this.ctx.config?this.ctx.answers.length>=this.ctx.config.steps.length:!1}setContact(t){this.ctx.contact=t}submit(){return this.transition("SUBMIT")}submitSuccess(t){return this.ctx.resultTier=t,this.transition("SUBMIT_SUCCESS")}submitFailed(t){return this.ctx.errorMessage=t,this.transition("SUBMIT_FAILED")}retry(){return this.ctx.errorMessage="",this.transition("RETRY")}reset(){return this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.errorMessage="",this.ctx.resultTier=null,this.transition("RESET")}};var u=class extends Error{constructor(e,n,i){super(e);this.status=n;this.code=i;this.name="WidgetApiError"}};function z(r,t,e=15e3){let n=new AbortController,i=setTimeout(()=>n.abort(),e),s={...t,signal:n.signal};return fetch(r,s).finally(()=>clearTimeout(i))}function W(r,t){switch(r){case 402:return new u("This widget subscription has expired.",402,"EXPIRED");case 404:return new u("Widget not found. Please check your widget key.",404,"NOT_FOUND");case 409:return new u("You have already submitted a response.",409,"DUPLICATE");case 410:return new u("This widget is no longer active.",410,"INACTIVE");case 429:return new u("Too many requests. Please try again later.",429,"RATE_LIMITED");default:return new u(t||"An unexpected error occurred.",r,"SERVER_ERROR")}}async function O(r,t){let e=`${t}/api/v1/widget/${encodeURIComponent(r)}`,n;try{n=await z(e,{method:"GET",headers:{Accept:"application/json"}})}catch(s){throw s instanceof DOMException&&s.name==="AbortError"?new u("Request timed out. Please check your connection.",0,"TIMEOUT"):new u("Network error. Please check your connection.",0,"NETWORK_ERROR")}if(!n.ok){let s=await n.text().catch(()=>"");throw W(n.status,s)}return await n.json()}async function q(r,t){let e=`${t}/api/v1/submit`,n=async()=>{try{return await z(e,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(r)})}catch(o){throw o instanceof DOMException&&o.name==="AbortError"?new u("Request timed out. Please try again.",0,"TIMEOUT"):new u("Network error. Please try again.",0,"NETWORK_ERROR")}},i=await n();if(i.status>=500&&i.status<600&&(await new Promise(o=>setTimeout(o,2e3)),i=await n()),!i.ok){let o=await i.text().catch(()=>"");throw W(i.status,o)}return await i.json()}function lt(r){switch(r){case"serif":return'Georgia, "Times New Roman", Times, serif';case"sans":return'"Helvetica Neue", Helvetica, Arial, sans-serif';case"system":default:return'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}function ct(r){let t=r.triggerOffsetX,e=r.triggerOffsetY;switch(r.position){case"bottom-left":return`bottom: ${e}px; left: ${t}px;`;case"bottom-center":return`bottom: ${e}px; left: 50%; transform: translateX(-50%);`;case"bottom-right":default:return`bottom: ${e}px; right: ${t}px;`}}function dt(r){let t=r.triggerOffsetX,e=r.triggerOffsetY+60;switch(r.position){case"bottom-left":return`bottom: ${e}px; left: ${t}px;`;case"bottom-center":return`bottom: ${e}px; left: 50%; transform: translateX(-50%);`;case"bottom-right":default:return`bottom: ${e}px; right: ${t}px;`}}function B(r,t){let e=r.replace("#",""),n=parseInt(e.substring(0,2),16),i=parseInt(e.substring(2,4),16),s=parseInt(e.substring(4,6),16);return isNaN(n)||isNaN(i)||isNaN(s)?r:`rgba(${n}, ${i}, ${s}, ${t})`}function G(r){let t=lt(r.fontFamily),e=r.borderRadius,n=r.panelWidth||400,i=r.mode==="dark"?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)",s=r.mode==="dark"?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)",o=r.mode==="dark"?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",p=r.mode==="dark"?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)";return`
/* \u2500\u2500 CSS Custom Properties \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
:host {
  --sb-primary: ${r.primaryColor};
  --sb-primary-ring: ${B(r.primaryColor,.4)};
  --sb-accent: ${r.accentColor};
  --sb-bg: ${r.backgroundColor};
  --sb-text: ${r.textColor};
  --sb-radius: ${e}px;
  --sb-font: ${t};
  --sb-panel-width: ${n}px;
  --sb-border: ${i};
  --sb-input-bg: ${s};
  --sb-input-border: ${o};
  --sb-hover-bg: ${p};
  --sb-accent-10: ${B(r.accentColor,.1)};
  --sb-accent-20: ${B(r.accentColor,.2)};

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
  ${ct(r)}
  z-index: 2147483647;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 20px;
  border: none;
  border-radius: ${Math.min(r.borderRadius,12)}px;
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

/* Gentle nudge: soft bounce + ring after 4s, plays once */
@keyframes sb-nudge {
  0%, 100% { transform: translateY(0); }
  15% { transform: translateY(-6px); }
  30% { transform: translateY(0); }
  45% { transform: translateY(-3px); }
  60% { transform: translateY(0); }
}
@keyframes sb-ring {
  0% { box-shadow: 0 0 0 0 var(--sb-primary-ring); }
  50% { box-shadow: 0 0 0 10px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
.sb-trigger--nudge {
  animation: sb-nudge 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both,
             sb-ring 1.2s ease-out both;
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
  ${dt(r)}
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

/* \u2500\u2500 Overlay (mobile only) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.sb-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  pointer-events: auto;
}

/* \u2500\u2500 Mobile Responsive \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
@media (max-width: 640px) {
  .sb-overlay {
    display: block;
    background: rgba(0, 0, 0, 0.5);
    animation: sb-fadeIn 200ms ease-out;
  }

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
`}var pt="(prefers-reduced-motion: reduce)";function L(){return typeof window<"u"&&window.matchMedia(pt).matches}function ht(r,t,e){if(r.classList.add(t),L()){r.classList.remove(t);return}setTimeout(()=>{r.classList.remove(t)},e)}function Y(r){r.classList.remove("sb-panel--hidden","sb-panel--closing"),r.style.animation="none",r.offsetHeight,r.style.animation=""}function K(r,t){if(L()){r.classList.add("sb-panel--hidden"),t();return}r.classList.add("sb-panel--closing");let e=()=>{r.removeEventListener("animationend",e),r.classList.add("sb-panel--hidden"),r.classList.remove("sb-panel--closing"),t()};r.addEventListener("animationend",e,{once:!0}),setTimeout(()=>{r.classList.contains("sb-panel--hidden")||(r.removeEventListener("animationend",e),r.classList.add("sb-panel--hidden"),r.classList.remove("sb-panel--closing"),t())},300)}function N(r,t){let e=r.firstElementChild;if(!e||L()){r.textContent="";let i=t();r.appendChild(i);return}e.classList.add("sb-step--exit");let n=()=>{e.removeEventListener("animationend",n),r.textContent="";let i=t();r.appendChild(i)};e.addEventListener("animationend",n,{once:!0}),setTimeout(()=>{if(r.contains(e)){e.removeEventListener("animationend",n),r.textContent="";let i=t();r.appendChild(i)}},250)}function j(r,t){if(L()){r.textContent="";let n=t();r.appendChild(n);return}r.textContent="";let e=t();e.classList.add("sb-step--back"),r.appendChild(e),setTimeout(()=>{e.classList.remove("sb-step--back")},350)}function X(r){ht(r,"sb-option--tapped",200)}function Z(r){r.classList.remove("sb-trigger--hidden")}function J(r){r.classList.add("sb-trigger--hidden")}function Q(r){r.style.animation="none",r.offsetHeight,r.style.animation=""}function f(r,...t){let e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.setAttribute("viewBox",r),e.setAttribute("aria-hidden","true"),e.setAttribute("focusable","false");for(let n of t)n(e);return e}function w(r,t){return e=>{let n=document.createElementNS("http://www.w3.org/2000/svg","path");if(n.setAttribute("d",r),t)for(let[i,s]of Object.entries(t))n.setAttribute(i,s);e.appendChild(n)}}function C(r,t,e,n){return i=>{let s=document.createElementNS("http://www.w3.org/2000/svg","line");s.setAttribute("x1",r),s.setAttribute("y1",t),s.setAttribute("x2",e),s.setAttribute("y2",n),i.appendChild(s)}}function gt(r,t,e){return n=>{let i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx",r),i.setAttribute("cy",t),i.setAttribute("r",e),n.appendChild(i)}}function ut(r){return t=>{let e=document.createElementNS("http://www.w3.org/2000/svg","polyline");e.setAttribute("points",r),t.appendChild(e)}}function bt(){return f("0 0 24 24",w("M5 12h14"),w("M12 5l7 7-7 7"))}function mt(){return f("0 0 24 24",w("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",{fill:"currentColor",stroke:"none"}))}function ft(){return f("0 0 24 24",C("12","5","12","19"),C("5","12","19","12"))}function xt(){return f("0 0 24 24",C("18","6","6","18"),C("6","6","18","18"))}function vt(){return f("0 0 24 24",ut("15 18 9 12 15 6"))}function yt(){return f("0 0 24 24",w("M5 13l4 4L19 7"))}function wt(){return f("0 0 24 24",gt("12","12","10"),C("12","8","12","12"),C("12","16","12.01","16"))}function Ct(){return f("0 0 16 16",w("M8 8a3 3 0 100-6 3 3 0 000 6zM2 14s-1 0-1-1 1-4 7-4 7 3 7 4-1 1-1 1H2z",{fill:"currentColor",stroke:"none"}))}function Et(r){switch(r){case"arrow":return bt();case"chat":return mt();case"plus":return ft();case"none":default:return null}}function V(r){let t=/^#([0-9a-f]{3,8})$/i.exec(r.trim());if(t){let n=t[1];if(!n)return null;if(n.length===3){let i=n.charAt(0),s=n.charAt(1),o=n.charAt(2),p=parseInt(i+i,16),h=parseInt(s+s,16),d=parseInt(o+o,16);return isNaN(p)||isNaN(h)||isNaN(d)?null:[p,h,d]}if(n.length>=6){let i=parseInt(n.substring(0,2),16),s=parseInt(n.substring(2,4),16),o=parseInt(n.substring(4,6),16);return isNaN(i)||isNaN(s)||isNaN(o)?null:[i,s,o]}return null}let e=/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(r);if(e){let n=parseInt(e[1]??"0",10),i=parseInt(e[2]??"0",10),s=parseInt(e[3]??"0",10);return isNaN(n)||isNaN(i)||isNaN(s)?null:[n,i,s]}return null}function kt(r){let t=/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*([\d.]+)\s*\)/i.exec(r);if(t&&t[1]!==void 0){let e=parseFloat(t[1]);return isNaN(e)?1:e}return r.trim().toLowerCase()==="transparent"?0:1}function tt(r,t,e){let[n,i,s]=[r,t,e].map(o=>{let p=o/255;return p<=.03928?p/12.92:Math.pow((p+.055)/1.055,2.4)});return .2126*(n??0)+.7152*(i??0)+.0722*(s??0)}function St(r,t){let e=Math.max(r,t),n=Math.min(r,t);return(e+.05)/(n+.05)}function Tt(r,t){try{let e=document.elementFromPoint(r,t);if(!e)return null;let n=e;for(;n&&n!==document.documentElement;){let o=getComputedStyle(n).backgroundColor;if(o&&o!=="transparent"&&o!=="rgba(0, 0, 0, 0)"&&kt(o)>.3)return V(o);n=n.parentElement}let i=getComputedStyle(document.body).backgroundColor;return i&&i!=="transparent"&&i!=="rgba(0, 0, 0, 0)"?V(i):[255,255,255]}catch{return null}}function l(r,t,e){let n=document.createElement(r);if(t&&(n.className=t),e)for(let[i,s]of Object.entries(e))n.setAttribute(i,s);return n}var P=class{constructor(t,e){this.config=null;this.triggerEl=null;this.panelEl=null;this.progressBar=null;this.stepCounter=null;this.contentEl=null;this.backBtn=null;this.ariaLiveRegion=null;this.overlayEl=null;this.previousActiveElement=null;this.boundKeyHandler=null;this.contrastAdapted=!1;this.resizeHandler=null;this.nudgeTimer=null;this.returnVisitor=!1;this.callbacks=e,this.shadow=t.attachShadow({mode:"open"})}init(t){this.config=t,this.injectStyles(t.theme),this.renderTrigger(t)}injectStyles(t){let e=document.createElement("style");e.textContent=G(t),this.shadow.appendChild(e)}renderTrigger(t){let e=l("button","sb-trigger sb-trigger--hidden",{type:"button","aria-label":t.theme.triggerText||"Open widget"});t.theme.triggerType==="tab"&&e.classList.add("sb-trigger--tab");let n=Et(t.theme.triggerIcon);if(n){let s=l("span","sb-trigger__icon");s.appendChild(n),e.appendChild(s)}let i=document.createTextNode(t.theme.triggerText||"Get Started");e.appendChild(i),e.addEventListener("click",()=>{this.callbacks.onTriggerClick()}),this.shadow.appendChild(e),this.triggerEl=e,requestAnimationFrame(()=>{Z(e)}),this.scheduleContrastDetection(),this.attachResizeListener(),this.scheduleNudge()}showTrigger(){this.triggerEl&&this.triggerEl.classList.remove("sb-trigger--hidden")}hideTrigger(){this.triggerEl&&J(this.triggerEl)}detectAndAdaptContrast(){if(!(!this.triggerEl||!this.config))try{let t=this.triggerEl,e=t.getBoundingClientRect();if(e.width===0||e.height===0)return;let n=e.left+e.width/2,i=e.top+e.height/2,s=this.shadow.host,o=s.style.pointerEvents,p=s.style.visibility;s.style.visibility="hidden",s.style.pointerEvents="none";let h=Tt(n,i);if(s.style.visibility=p,s.style.pointerEvents=o,!h)return;let d=V(this.config.theme.primaryColor);if(!d)return;let c=tt(h[0],h[1],h[2]),a=tt(d[0],d[1],d[2]);if(St(c,a)>=3){this.contrastAdapted&&(t.style.backgroundColor="",t.style.color="",this.contrastAdapted=!1);return}c<.5?(t.style.backgroundColor="#FFFFFF",t.style.color="#0F172A"):(t.style.backgroundColor="#0F172A",t.style.color="#FFFFFF"),this.contrastAdapted=!0}catch{}}scheduleContrastDetection(){requestAnimationFrame(()=>{requestAnimationFrame(()=>{this.detectAndAdaptContrast()})})}attachResizeListener(){let t=null;this.resizeHandler=()=>{t&&clearTimeout(t),t=setTimeout(()=>{this.detectAndAdaptContrast()},300)},window.addEventListener("resize",this.resizeHandler,{passive:!0})}scheduleNudge(){if(!this.triggerEl)return;let t=this.triggerEl;this.nudgeTimer=setTimeout(()=>{!t.classList.contains("sb-trigger--hidden")&&!this.panelEl&&(t.classList.add("sb-trigger--nudge"),setTimeout(()=>{t.classList.remove("sb-trigger--nudge")},1500))},4e3)}openPanel(t,e,n){this.config&&(n!==void 0&&(this.returnVisitor=n),this.hideTrigger(),this.showOverlay(),this.panelEl||this.buildPanel(),this.panelEl&&(Y(this.panelEl),this.updateProgress(t,e),this.enableFocusTrap()))}closePanel(){this.panelEl&&(K(this.panelEl,()=>{this.showTrigger(),this.hideOverlay()}),this.disableFocusTrap())}buildPanel(){var a;let t=l("div","sb-panel sb-panel--hidden",{role:"dialog","aria-label":"HawkLeads Widget","aria-modal":"true"}),e=l("div","sb-header"),n=l("div","sb-header__left"),i=l("button","sb-header__back",{type:"button","aria-label":"Go back",style:"visibility: hidden;"});i.appendChild(vt()),i.addEventListener("click",()=>this.callbacks.onBack()),this.backBtn=i,n.appendChild(i);let s=l("span","sb-header__step");s.textContent="",this.stepCounter=s,n.appendChild(s),e.appendChild(n);let o=l("button","sb-header__close",{type:"button","aria-label":"Close widget"});o.appendChild(xt()),o.addEventListener("click",()=>this.callbacks.onClose()),e.appendChild(o),t.appendChild(e);let p=l("div","sb-progress",{role:"progressbar","aria-valuemin":"0","aria-valuemax":"100","aria-valuenow":"0"}),h=l("div","sb-progress__bar");h.style.width="0%",p.appendChild(h),t.appendChild(p),this.progressBar=h;let d=l("div","sb-content");if(t.appendChild(d),this.contentEl=d,(a=this.config)!=null&&a.theme.showBranding){let g=l("div","sb-footer"),b=l("a","sb-footer__link",{href:"https://hawkleads.io?ref=widget",target:"_blank",rel:"noopener noreferrer"});b.textContent="Powered by HawkLeads",g.appendChild(b),t.appendChild(g)}let c=l("div","sb-sr-only",{"aria-live":"polite","aria-atomic":"true"});t.appendChild(c),this.ariaLiveRegion=c,t.addEventListener("keydown",g=>{let b=parseInt(g.key,10);if(b>=1&&b<=9){let x=t.querySelectorAll(".sb-option")[b-1];x&&(g.preventDefault(),x.click())}}),this.shadow.appendChild(t),this.panelEl=t}updateProgress(t,e){let n=e+1,i=t+1,s=Math.round(i/n*100);if(this.progressBar){this.progressBar.style.width=`${s}%`;let o=this.progressBar.parentElement;o&&o.setAttribute("aria-valuenow",String(s))}this.stepCounter&&(this.stepCounter.textContent=`Step ${i} of ${n}`),this.backBtn&&(this.backBtn.style.visibility=t>0?"visible":"hidden"),this.ariaLiveRegion&&(this.ariaLiveRegion.textContent=`Step ${i} of ${n}`)}renderStep(t,e,n,i="forward"){if(!this.contentEl)return;this.updateProgress(e,n);let s=()=>{var d;let o=l("div","sb-step");if(e===0&&this.returnVisitor){let c=l("p","sb-welcome-back");c.textContent="Welcome back!",c.style.cssText="font-size: 13px; color: #3B82F6; font-weight: 600; margin: 0 0 8px; padding: 0;",o.appendChild(c)}if(e===0&&this.config&&!this.config.isOpen&&this.config.offlineMessage){let c=l("div","sb-offline-msg");c.style.cssText="font-size: 13px; color: #92400E; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 6px; padding: 8px 12px; margin: 0 0 12px; line-height: 1.4;",c.textContent=this.config.offlineMessage,o.appendChild(c)}let p=l("h2","sb-question");if(p.textContent=t.question,o.appendChild(p),t.description){let c=l("p","sb-description");c.textContent=t.description,o.appendChild(c)}let h=l("div","sb-options",{role:"radiogroup","aria-label":t.question});for(let c=0;c<t.options.length;c++){let a=t.options[c];if(!a)continue;let g=l("button","sb-option",{type:"button",role:"radio","aria-checked":"false","data-option-id":a.id}),b=l("span","sb-option__num");if(b.textContent=String(c+1),g.appendChild(b),a.icon){let m=l("span","sb-option__icon");m.textContent=a.icon,g.appendChild(m)}let k=l("span","sb-option__label");k.textContent=a.label,g.appendChild(k);let x=a.id,S=a.label,T=a.scoreWeight;g.addEventListener("click",()=>{X(g),setTimeout(()=>{this.callbacks.onOptionSelect(t.id,x,S,T)},120)}),g.addEventListener("keydown",m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),g.click())}),h.appendChild(g)}if(o.appendChild(h),(d=this.config)!=null&&d.theme.showSocialProof&&e===0&&this.config.submissionCount>=this.config.socialProofMin){let c=l("div","sb-social-proof"),a=l("span","sb-social-proof__icon");a.appendChild(Ct()),c.appendChild(a);let g=document.createTextNode(this.config.socialProofText.replace("{count}",String(this.config.submissionCount)));c.appendChild(g),o.appendChild(c)}return o};i==="backward"?j(this.contentEl,s):N(this.contentEl,s)}renderContactForm(t,e={},n=!1,i){if(!this.contentEl||!this.config)return;this.updateProgress(t,t);let s=()=>{let o=l("div","sb-contact"),p=l("h2","sb-contact__title");p.textContent="Almost done!",o.appendChild(p);let h=l("p","sb-contact__subtitle");h.textContent="Enter your details to see your results.",o.appendChild(h);let d=l("form","",{novalidate:"true",autocomplete:"on"}),c=this.createField("name","Name","text",!0,"Your name",e.name,i==null?void 0:i.name);d.appendChild(c);let a=this.createField("email","Email","email",!0,"you@example.com",e.email,i==null?void 0:i.email);if(d.appendChild(a),this.config.contactShowPhone){let v=this.createField("phone","Phone","tel",this.config.contactPhoneRequired,"(555) 123-4567",e.phone,i==null?void 0:i.phone);d.appendChild(v)}if(this.config.contactShowMessage){let v=this.createTextareaField("message","Message",this.config.contactMessageRequired,this.config.contactMessagePlaceholder||"Tell us more...",e.message,i==null?void 0:i.message);d.appendChild(v)}let g=l("div","sb-hp"),b=l("label");b.textContent="Leave this empty";let k=l("input","",{type:"text",name:"website",tabindex:"-1",autocomplete:"off","aria-hidden":"true"});g.appendChild(b),g.appendChild(k),d.appendChild(g);let x=l("div","sb-consent"),S=l("label","sb-consent__label"),T=l("input","sb-consent__check",{type:"checkbox",name:"consent",required:"true"});S.appendChild(T);let m=l("span","sb-consent__text");m.textContent="I agree to the processing of my data and acknowledge the ";let U=l("a","sb-consent__link",{href:"/privacy",target:"_blank",rel:"noopener noreferrer"});U.textContent="Privacy Policy",m.appendChild(U),S.appendChild(m),x.appendChild(S);let _=l("p","sb-field__error sb-consent__error");_.style.display="none",_.textContent="You must agree before submitting.",x.appendChild(_),d.appendChild(x);let M=l("button","sb-submit",{type:"submit"});if(n){M.setAttribute("disabled","true");let v=l("span","sb-submit__spinner");M.appendChild(v);let y=document.createTextNode("Submitting...");M.appendChild(y)}else M.textContent=this.config.contactSubmitText||"See My Results";return d.appendChild(M),d.addEventListener("submit",v=>{if(v.preventDefault(),!T.checked){_.style.display="block",T.focus();return}_.style.display="none";let y=new FormData(d),I=D=>D.replace(/<[^>]*>?/g,"").trim(),R={name:I(y.get("name")||""),email:I(y.get("email")||"").toLowerCase()};if(this.config.contactShowPhone){let D=I(y.get("phone")||"");R.phone=D.replace(/[^+\d\s().-]/g,"")}this.config.contactShowMessage&&(R.message=I(y.get("message")||""));let ot=y.get("website")||"";this.callbacks.onContactSubmit(R,ot)}),o.appendChild(d),o};N(this.contentEl,s)}createField(t,e,n,i,s,o,p){let h=l("div","sb-field"),d=l("label","sb-field__label",{for:`sb-${t}`});if(d.textContent=e,i){let a=l("span","sb-field__required");a.textContent="*",d.appendChild(a)}h.appendChild(d);let c=l("input","sb-field__input",{type:n,name:t,id:`sb-${t}`,placeholder:s,autocomplete:t});if(i&&c.setAttribute("required","true"),p&&(c.value=p),n==="tel"&&(c.setAttribute("inputmode","tel"),c.addEventListener("input",()=>{let a=c.value.replace(/\D/g,"").slice(0,10);a.length===0?c.value="":a.length<=3?c.value=`(${a}`:a.length<=6?c.value=`(${a.slice(0,3)}) ${a.slice(3)}`:c.value=`(${a.slice(0,3)}) ${a.slice(3,6)}-${a.slice(6)}`})),o&&(c.classList.add("sb-field__input--error"),c.setAttribute("aria-invalid","true"),c.setAttribute("aria-describedby",`sb-${t}-error`)),h.appendChild(c),o){let a=l("div","sb-field__error",{id:`sb-${t}-error`,role:"alert"});a.textContent=o,h.appendChild(a)}return h}createTextareaField(t,e,n,i,s,o){let p=l("div","sb-field"),h=l("label","sb-field__label",{for:`sb-${t}`});if(h.textContent=e,n){let c=l("span","sb-field__required");c.textContent="*",h.appendChild(c)}p.appendChild(h);let d=l("textarea","sb-field__input sb-field__textarea",{name:t,id:`sb-${t}`,placeholder:i,rows:"3"});if(n&&d.setAttribute("required","true"),o&&(d.value=o),s&&(d.classList.add("sb-field__input--error"),d.setAttribute("aria-invalid","true"),d.setAttribute("aria-describedby",`sb-${t}-error`)),p.appendChild(d),s){let c=l("div","sb-field__error",{id:`sb-${t}-error`,role:"alert"});c.textContent=s,p.appendChild(c)}return p}renderConfirmation(t){if(!this.contentEl)return;if(this.backBtn&&(this.backBtn.style.visibility="hidden"),this.progressBar){this.progressBar.style.width="100%";let o=this.progressBar.parentElement;o&&o.setAttribute("aria-valuenow","100")}this.stepCounter&&(this.stepCounter.textContent="Complete"),this.contentEl.textContent="";let e=l("div","sb-confirmation"),n=l("div","sb-confirmation__check");n.appendChild(yt()),e.appendChild(n);let i=l("h2","sb-confirmation__headline");i.textContent=t.headline,e.appendChild(i);let s=l("p","sb-confirmation__body");if(s.textContent=t.body,e.appendChild(s),t.ctaText&&t.ctaUrl){let o=l("a","sb-confirmation__cta",{href:t.ctaUrl,target:"_blank",rel:"noopener noreferrer",role:"button"});o.textContent=t.ctaText,o.addEventListener("click",p=>{p.preventDefault(),this.callbacks.onCtaClick(t.ctaUrl)}),e.appendChild(o)}this.contentEl.appendChild(e),Q(e),this.launchConfetti()}launchConfetti(){let t=document.createElement("canvas");t.style.cssText="position:fixed;inset:0;z-index:2147483647;pointer-events:none;width:100vw;height:100vh;",document.body.appendChild(t),t.width=window.innerWidth,t.height=window.innerHeight;let e=t.getContext("2d");if(!e){t.remove();return}let n=["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#F97316"],i=[],s=t.width,o=t.height;for(let a=0;a<40;a++){let g=Math.random()*Math.PI*2,b=2+Math.random()*5;i.push({x:s/2+(Math.random()-.5)*200,y:o/2+(Math.random()-.5)*100,w:8+Math.random()*10,h:5+Math.random()*10,vx:Math.cos(g)*b,vy:Math.sin(g)*b-3,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.15,color:n[Math.floor(Math.random()*n.length)]??"#3B82F6",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.02+Math.random()*.03,delay:0})}for(let a=0;a<30;a++){let g=a%2===0;i.push({x:g?-10:s+10,y:o*.7+Math.random()*o*.3,w:6+Math.random()*8,h:4+Math.random()*8,vx:(g?1:-1)*(3+Math.random()*5),vy:-(4+Math.random()*6),rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.2,color:n[Math.floor(Math.random()*n.length)]??"#10B981",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.015+Math.random()*.02,delay:30+Math.floor(Math.random()*20)})}for(let a=0;a<40;a++)i.push({x:Math.random()*s,y:-20-Math.random()*200,w:5+Math.random()*7,h:3+Math.random()*6,vx:(Math.random()-.5)*1.5,vy:.5+Math.random()*1.5,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.1,color:n[Math.floor(Math.random()*n.length)]??"#F59E0B",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.01+Math.random()*.02,delay:60+Math.floor(Math.random()*60)});let p=a=>{for(let g=0;g<5;g++)i.push({x:Math.random()*s,y:o+20,w:7+Math.random()*9,h:5+Math.random()*7,vx:(Math.random()-.5)*2,vy:-(3+Math.random()*4),rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.12,color:n[Math.floor(Math.random()*n.length)]??"#8B5CF6",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.01+Math.random()*.015,delay:a+Math.floor(Math.random()*30)})};p(240),p(480),p(720);let h=0,d=900,c=()=>{h++,e.clearRect(0,0,t.width,t.height);for(let a of i)h<a.delay||(a.sway+=a.swaySpeed,a.x+=a.vx+Math.sin(a.sway)*.5,a.vy+=.04,a.y+=a.vy,a.rot+=a.vr,a.vx*=.995,a.vr*=.998,h>d-80&&(a.life-=.0125),!(a.life<=0||a.y>t.height+20)&&(e.save(),e.translate(a.x,a.y),e.rotate(a.rot),e.globalAlpha=Math.max(0,a.life),e.fillStyle=a.color,a.shape===0?e.fillRect(-a.w/2,-a.h/2,a.w,a.h):a.shape===1?(e.beginPath(),e.arc(0,0,a.w/2,0,Math.PI*2),e.fill()):(e.beginPath(),e.moveTo(0,-a.h/2),e.lineTo(a.w/2,a.h/2),e.lineTo(-a.w/2,a.h/2),e.closePath(),e.fill()),e.restore()));h<d?requestAnimationFrame(c):t.remove()};requestAnimationFrame(c)}renderError(t){if(!this.contentEl)return;this.contentEl.textContent="";let e=l("div","sb-error"),n=l("div","sb-error__icon");n.appendChild(wt()),e.appendChild(n);let i=l("p","sb-error__message");i.textContent=t||"Something went wrong. Please try again.",e.appendChild(i);let s=l("button","sb-error__retry",{type:"button"});s.textContent="Try Again",s.addEventListener("click",()=>this.callbacks.onRetry()),e.appendChild(s),this.contentEl.appendChild(e)}renderLoading(){if(!this.contentEl)return;this.contentEl.textContent="";let t=l("div","sb-loading"),e=l("div","sb-loading__spinner"),n=l("span","sb-sr-only");n.textContent="Loading...",t.appendChild(e),t.appendChild(n),this.contentEl.appendChild(t)}renderDisabled(){for(;this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild)}renderExpiredFallback(){let t=this.shadow.querySelector("style");for(;this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild);t&&this.shadow.appendChild(t);let e=l("div","",{role:"status",style:["position: fixed","bottom: 24px","right: 24px","z-index: 2147483647","width: 300px","background: #ffffff","border: 1px solid #E2E8F0","border-radius: 12px","box-shadow: 0 4px 12px rgba(0,0,0,0.08)","padding: 24px",'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',"text-align: center","pointer-events: auto"].join("; ")}),n=l("div","",{style:["width: 40px","height: 40px","margin: 0 auto 12px","background: #F1F5F9","border-radius: 50%","display: flex","align-items: center","justify-content: center"].join("; ")}),i=f("0 0 24 24",w("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",{fill:"none",stroke:"#64748B","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}));i.setAttribute("width","20"),i.setAttribute("height","20"),n.appendChild(i),e.appendChild(n);let s=l("p","",{style:"font-size: 15px; font-weight: 600; color: #1E293B; margin: 0 0 4px; line-height: 1.4;"});s.textContent="Widget temporarily unavailable",e.appendChild(s);let o=l("p","",{style:"font-size: 13px; color: #64748B; margin: 0; line-height: 1.5;"});o.textContent="Please contact us directly for assistance.",e.appendChild(o),this.shadow.appendChild(e)}enableFocusTrap(){this.previousActiveElement=document.activeElement,this.boundKeyHandler=t=>{if(t.key==="Escape"){t.preventDefault(),this.callbacks.onClose();return}if(t.key==="Tab"&&this.panelEl){let e=this.getFocusableElements();if(e.length===0)return;let n=e[0],i=e[e.length-1];t.shiftKey?(this.shadow.activeElement===n||!this.panelEl.contains(this.shadow.activeElement))&&(t.preventDefault(),i.focus()):(this.shadow.activeElement===i||!this.panelEl.contains(this.shadow.activeElement))&&(t.preventDefault(),n.focus())}},document.addEventListener("keydown",this.boundKeyHandler,!0),requestAnimationFrame(()=>{let e=this.getFocusableElements()[0];e&&e.focus()})}disableFocusTrap(){this.boundKeyHandler&&(document.removeEventListener("keydown",this.boundKeyHandler,!0),this.boundKeyHandler=null),this.previousActiveElement&&this.previousActiveElement instanceof HTMLElement&&(this.previousActiveElement.focus(),this.previousActiveElement=null)}getFocusableElements(){if(!this.panelEl)return[];let e=this.panelEl.querySelectorAll('button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');return Array.from(e)}showOverlay(){if(this.overlayEl)return;let t=l("div","sb-overlay");t.addEventListener("click",()=>{this.callbacks.onClose()}),this.shadow.appendChild(t),this.overlayEl=t}hideOverlay(){this.overlayEl&&(this.overlayEl.remove(),this.overlayEl=null)}showTeaser(t){if(!this.triggerEl)return;let e=this.shadow.querySelector(".sb-teaser");e&&e.remove();let n=document.createElement("div");n.className="sb-teaser",n.setAttribute("role","status"),n.style.cssText=`
      position: fixed; bottom: 90px; right: 20px; z-index: 2147483646;
      background: #fff; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px; font-weight: 500; padding: 10px 16px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 240px;
      opacity: 0; transform: translateY(8px) scale(0.95);
      transition: opacity 200ms ease, transform 200ms ease;
      cursor: pointer; pointer-events: auto;
    `,n.textContent=t;let i=document.createElement("div");i.style.cssText=`
      position: absolute; bottom: -6px; right: 24px;
      width: 12px; height: 12px; background: #fff;
      transform: rotate(45deg); border-radius: 2px;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.08);
    `,n.appendChild(i),n.addEventListener("click",()=>{n.remove(),this.callbacks.onTriggerClick()}),this.shadow.appendChild(n),requestAnimationFrame(()=>{requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0) scale(1)"})}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(8px) scale(0.95)",setTimeout(()=>n.remove(),200)},6e3)}pulseTrigger(){if(!this.triggerEl)return;let t=this.triggerEl,e=t.style.transform;t.style.transition="transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",t.style.transform="scale(1.15)",setTimeout(()=>{t.style.transform="scale(1)",setTimeout(()=>{t.style.transform="scale(1.1)",setTimeout(()=>{t.style.transform=e||"scale(1)",t.style.transition=""},300)},300)},300)}destroy(){for(this.disableFocusTrap(),this.nudgeTimer&&(clearTimeout(this.nudgeTimer),this.nudgeTimer=null),this.resizeHandler&&(window.removeEventListener("resize",this.resizeHandler),this.resizeHandler=null);this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild);this.triggerEl=null,this.panelEl=null,this.progressBar=null,this.stepCounter=null,this.contentEl=null,this.backBtn=null,this.ariaLiveRegion=null,this.contrastAdapted=!1}};var _t=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,Mt=/^[+\d\s().-]+$/;function et(r,t){let e={},n=(r.name??"").trim();n?n.length>200&&(e.name="Name must be 200 characters or fewer."):e.name="Name is required.";let i=(r.email??"").trim();if(i?_t.test(i)||(e.email="Please enter a valid email address."):e.email="Email is required.",t.contactShowPhone){let s=(r.phone??"").trim();t.contactPhoneRequired&&!s?e.phone="Phone number is required.":s&&!Mt.test(s)?e.phone="Please enter a valid phone number.":s&&s.length>30&&(e.phone="Phone must be 30 characters or fewer.")}if(t.contactShowMessage){let s=(r.message??"").trim();t.contactMessageRequired&&!s?e.message="Message is required.":s&&s.length>2e3&&(e.message="Message must be 2000 characters or fewer.")}return e}function nt(r){return Object.keys(r).length>0}var H="sb_v";var it="sb_session";function rt(){let r=new Uint8Array(8);return crypto.getRandomValues(r),Array.from(r).map(t=>t.toString(16).padStart(2,"0")).join("")}function st(r){try{let t=`${r}=`,e=document.cookie.split(";");for(let n of e){let i=n.trim();if(i.startsWith(t))return decodeURIComponent(i.substring(t.length))}return null}catch{return null}}function It(r,t,e){try{let n=new Date(Date.now()+e*864e5).toUTCString();document.cookie=`${r}=${encodeURIComponent(t)};expires=${n};path=/;SameSite=Lax`}catch{}}var F=class{constructor(t=["/pricing","/demo","/contact","/compare"]){this.pagesViewed=0;this.pageUrls=[];this.maxScrollDepth=0;this.widgetOpens=0;this.pricingPageViews=0;this.highIntentPageViews=0;this.scrollHandler=null;this.trackingBlocked=!1;this.highIntentPatterns=t,this.startedAt=Date.now();let e=st(H);if(e){let i=e.split(":");this.fingerprint=i[0]??rt(),this.sessionNumber=parseInt(i[1]??"0",10)+1}else this.fingerprint=rt(),this.sessionNumber=1;It(H,`${this.fingerprint}:${this.sessionNumber}`,90);let n=st(H);this.trackingBlocked=n===null,this.trackCurrentPage(),this.startScrollTracking()}trackCurrentPage(){this.restoreSession(),this.pagesViewed++;let t=window.location.pathname;this.pageUrls.includes(t)||this.pageUrls.push(t),t.includes("/pricing")&&this.pricingPageViews++,this.highIntentPatterns.some(e=>t.includes(e))&&this.highIntentPageViews++,this.saveSession()}restoreSession(){try{let t=sessionStorage.getItem(it);if(!t)return;let e=JSON.parse(t);this.pagesViewed=e.pagesViewed??0,this.pageUrls=e.pageUrls??[],this.pricingPageViews=e.pricingPageViews??0,this.highIntentPageViews=e.highIntentPageViews??0,this.startedAt=e.startedAt??this.startedAt}catch{}}saveSession(){try{let t={pagesViewed:this.pagesViewed,pageUrls:this.pageUrls,pricingPageViews:this.pricingPageViews,highIntentPageViews:this.highIntentPageViews,startedAt:this.startedAt};sessionStorage.setItem(it,JSON.stringify(t))}catch{}}startScrollTracking(){this.scrollHandler=()=>{let t=document.documentElement.scrollHeight-window.innerHeight,e=Math.round(window.scrollY/Math.max(1,t)*100);e>this.maxScrollDepth&&(this.maxScrollDepth=e)},window.addEventListener("scroll",this.scrollHandler,{passive:!0})}recordWidgetOpen(){this.widgetOpens++}getFingerprint(){return this.fingerprint}isTrackingBlocked(){return this.trackingBlocked}getSessionData(){let t=Math.min(86400,Math.round((Date.now()-this.startedAt)/1e3));return{pagesViewed:this.pagesViewed,pageUrls:[...this.pageUrls],timeOnSiteSeconds:t,maxScrollDepth:this.maxScrollDepth,widgetOpens:this.widgetOpens,sessionNumber:this.sessionNumber,pricingPageViews:this.pricingPageViews,highIntentPageViews:this.highIntentPageViews}}destroy(){this.scrollHandler&&(window.removeEventListener("scroll",this.scrollHandler),this.scrollHandler=null)}};var At="https://hawkleads.io";async function Lt(r,t){let e=Math.random().toString(36).substring(2,10),n=`${r}:${t}:${e}`,i=new TextEncoder,s=await crypto.subtle.digest("SHA-256",i.encode(n)),p=Array.from(new Uint8Array(s)).map(h=>h.toString(16).padStart(2,"0")).join("");return`sb_${r.slice(0,8)}_${p}`}function Pt(){try{let r=new URLSearchParams(window.location.search),t={},e=r.get("utm_source"),n=r.get("utm_medium"),i=r.get("utm_campaign");return e&&(t.utmSource=e),n&&(t.utmMedium=n),i&&(t.utmCampaign=i),t}catch{return{}}}function E(r,t,e,n,i,s){let o={widgetKey:t,event:e};n!==void 0&&(o.stepIndex=n),i&&(o.abTestId=i),s&&(o.abVariant=s);try{fetch(`${r}/api/v1/widget/track`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o),keepalive:!0}).catch(()=>{})}catch{}}var $=class{constructor(t,e){this.stepDirection="forward";this.validationErrors={};this.abVariant=null;this.abTestId=null;this.tracker=null;this.widgetKey=t,this.apiUrl=e,this.machine=new A}async start(){let t=`sb-root-${this.widgetKey}`;if(document.getElementById(t))return;let e=document.createElement("div");e.id=t,e.style.position="fixed",e.style.zIndex="2147483647",e.style.inset="0",e.style.overflow="visible",e.style.pointerEvents="none",document.body.appendChild(e),this.renderer=new P(e,{onTriggerClick:()=>this.handleTriggerClick(),onClose:()=>this.handleClose(),onOptionSelect:(n,i,s,o)=>this.handleOptionSelect(n,i,s,o),onBack:()=>this.handleBack(),onContactSubmit:(n,i)=>this.handleContactSubmit(n,i),onRetry:()=>this.handleRetry(),onCtaClick:n=>this.handleCtaClick(n)}),this.machine.init();try{let n=await O(this.widgetKey,this.apiUrl);if(n.abTest){this.abTestId=n.abTest.testId;let i=Math.random()*100;if(this.abVariant=i<n.abTest.trafficSplit?"a":"b",this.abVariant==="b"){let s=n.steps.findIndex(o=>{var p;return o.id===((p=n.abTest)==null?void 0:p.targetStepId)});if(s!==-1){let o=n.steps[s];if(o){let p={...o,question:n.abTest.variantB.question,options:n.abTest.variantB.options};n.steps[s]=p}}}}this.machine.configLoaded(n),this.renderer.init(n),E(this.apiUrl,this.widgetKey,"impression",void 0,this.abTestId,this.abVariant),this.tracker=new F,this.scheduleAttentionGrabbers()}catch(n){if(n instanceof u){if(n.code==="INACTIVE"){this.machine.widgetDisabled(),this.renderer.renderDisabled();return}if(n.code==="EXPIRED"){this.machine.widgetDisabled(),this.renderer.renderExpiredFallback();return}this.machine.fetchFailed(n.message)}else this.machine.fetchFailed("Failed to load widget configuration.")}}scheduleAttentionGrabbers(){let t=this.machine.getContext();if(!t.config)return;let e=t.config.attentionGrabber;if(!(!e||!e.enabled)){if(e.teaserText&&setTimeout(()=>{this.machine.getState()==="ready"&&this.renderer.showTeaser(e.teaserText)},e.teaserDelayMs),e.pulseDelayMs>0&&setTimeout(()=>{this.machine.getState()==="ready"&&this.renderer.pulseTrigger()},e.pulseDelayMs),e.scrollNudgeText&&e.scrollThreshold>0){let n=!1,i=e.scrollThreshold/100,s=e.scrollNudgeText,o=()=>{if(n||this.machine.getState()!=="ready")return;window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)>i&&(n=!0,this.renderer.showTeaser(s),window.removeEventListener("scroll",o))};window.addEventListener("scroll",o,{passive:!0})}if(e.exitIntentText){let n=!1,i=e.exitIntentText,s=o=>{n||this.machine.getState()!=="ready"||o.clientY<=0&&(n=!0,this.renderer.showTeaser(i),this.renderer.pulseTrigger(),document.removeEventListener("mouseleave",s))};document.addEventListener("mouseleave",s)}}}handleTriggerClick(){var s;let t=this.machine.getContext();if(t.state!=="ready")return;this.machine.open(),(s=this.tracker)==null||s.recordWidgetOpen(),E(this.apiUrl,this.widgetKey,"open",void 0,this.abTestId,this.abVariant);let e=t.config;if(!e||e.steps.length===0)return;let n=e.steps.length,i=this.tracker!==null&&this.tracker.getSessionData().sessionNumber>1;this.renderer.openPanel(0,n,i),this.stepDirection="forward",E(this.apiUrl,this.widgetKey,"step_view",0,this.abTestId,this.abVariant),this.renderCurrentView()}handleClose(){let t=this.machine.getState();if(t==="open"||t==="complete"||t==="error"){if(t==="open"){let e=this.machine.getContext();E(this.apiUrl,this.widgetKey,"step_abandon",e.currentStepIndex,this.abTestId,this.abVariant)}this.renderer.closePanel(),t==="complete"?this.machine.reset():t==="error"?this.machine.retry():this.machine.close()}}handleOptionSelect(t,e,n,i){let s=this.machine.getContext();if(s.state!=="open"||!s.config)return;let o=s.config.steps.find(c=>c.id===t);if(!o)return;let p={stepId:t,optionId:e,question:o.question,label:n,scoreWeight:i};this.stepDirection="forward",this.machine.selectOption(p);let h=this.machine.getContext(),d=h.currentStepIndex;h.config&&d<h.config.steps.length?E(this.apiUrl,this.widgetKey,"step_view",d,this.abTestId,this.abVariant):E(this.apiUrl,this.widgetKey,"completion",void 0,this.abTestId,this.abVariant),this.renderCurrentView()}handleBack(){let t=this.machine.getContext();t.state==="open"&&(this.stepDirection="backward",this.machine.isOnContactStep()?t.answers.length>0&&this.machine.goBack():this.machine.goBack(),this.renderCurrentView())}async handleContactSubmit(t,e){var s,o;let n=this.machine.getContext();if(n.state!=="open"||!n.config)return;this.machine.setContact(t);let i=et(t,n.config);if(this.validationErrors=i,nt(i)){this.renderer.renderContactForm(n.config.steps.length,i,!1,t);return}this.machine.submit(),this.renderer.renderContactForm(n.config.steps.length,{},!0,t);try{let p=await Lt(this.widgetKey,n.loadedAt),h=Pt(),d={widgetKey:this.widgetKey,answers:n.answers.map(g=>({stepId:g.stepId,optionId:g.optionId})),visitorName:t.name.trim(),visitorEmail:t.email.trim(),challengeToken:p,loadedAt:n.loadedAt,sourceUrl:window.location.href,referrer:document.referrer||"",...h};(s=t.phone)!=null&&s.trim()&&(d.visitorPhone=t.phone.trim()),(o=t.message)!=null&&o.trim()&&(d.visitorMessage=t.message.trim()),e&&(d.honeypot=e),this.abTestId&&(d.abTestId=this.abTestId),this.abVariant&&(d.abVariant=this.abVariant),this.tracker&&(d.behavioralData=this.tracker.getSessionData(),d.visitorFingerprint=this.tracker.getFingerprint(),d.trackingBlocked=this.tracker.isTrackingBlocked());let c=await q(d,this.apiUrl);this.machine.submitSuccess(c.tier);let a=n.config.confirmation[c.tier];this.renderer.renderConfirmation(a)}catch(p){if(p instanceof u&&p.code==="DUPLICATE"){let d="warm";this.machine.submitSuccess(d);let c=n.config.confirmation[d];this.renderer.renderConfirmation(c);return}let h="Something went wrong. Please try again.";p instanceof u&&(h=p.message),this.machine.submitFailed(h),this.renderer.renderError(h)}}handleRetry(){let t=this.machine.getContext();if(t.state==="error")if(this.machine.retry(),t.config){this.machine.open();let e=t.config.steps.length;this.renderer.openPanel(0,e),this.stepDirection="forward",this.renderCurrentView()}else this.retryFetchConfig()}async retryFetchConfig(){this.machine.init();try{let t=await O(this.widgetKey,this.apiUrl);this.machine.configLoaded(t),this.renderer.init(t)}catch(t){if(t instanceof u){if(t.code==="INACTIVE"){this.machine.widgetDisabled(),this.renderer.renderDisabled();return}if(t.code==="EXPIRED"){this.machine.widgetDisabled(),this.renderer.renderExpiredFallback();return}this.machine.fetchFailed(t.message)}else this.machine.fetchFailed("Failed to load widget configuration.")}}handleCtaClick(t){try{let e=new URL(t);if(e.protocol!=="https:"&&e.protocol!=="http:")return;window.open(t,"_blank","noopener,noreferrer")}catch{}}renderCurrentView(){let t=this.machine.getContext();if(!t.config)return;let e=t.config.steps.length,n=t.currentStepIndex;if(this.machine.isOnContactStep()){this.renderer.updateProgress(e,e),this.renderer.renderContactForm(e,this.validationErrors,!1,t.contact);return}let i=t.config.steps[n];i&&this.renderer.renderStep(i,n,e,this.stepDirection)}};(function(){function r(){let e=document.querySelectorAll("script[data-widget-key]"),n=e[e.length-1];if(!n)return null;let i=n.getAttribute("data-widget-key");return i?{key:i,apiUrl:n.getAttribute("data-api-url")??""}:null}function t(){let e,n=At,i=window.HawkLeadsConfig;if(i!=null&&i.key){if(e=i.key,i.apiUrl)try{new URL(i.apiUrl).protocol==="https:"&&(n=i.apiUrl)}catch{}}else{let o=r();if(!o)return;if(e=o.key,o.apiUrl)try{new URL(o.apiUrl).protocol==="https:"&&(n=o.apiUrl)}catch{}}new $(e,n).start()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()})();})();
