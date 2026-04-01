"use strict";var HawkLeads=(()=>{var st={idle:{INIT:"loading"},loading:{CONFIG_LOADED:"ready",FETCH_FAILED:"error",WIDGET_DISABLED:"disabled"},ready:{OPEN:"open"},open:{CLOSE:"ready",SUBMIT:"submitting"},submitting:{SUBMIT_SUCCESS:"complete",SUBMIT_FAILED:"error"},complete:{RESET:"ready",CLOSE:"ready"},error:{RETRY:"ready",CLOSE:"ready"},disabled:{}},T=class{constructor(){this.listeners=[];this.ctx={state:"idle",config:null,currentStepIndex:0,answers:[],contact:{name:"",email:""},errorMessage:"",loadedAt:0,resultTier:null}}getState(){return this.ctx.state}getContext(){return this.ctx}onChange(t){return this.listeners.push(t),()=>{let e=this.listeners.indexOf(t);e!==-1&&this.listeners.splice(e,1)}}emit(t){let e={...this.ctx};for(let i of this.listeners)try{i(e,t)}catch{}}transition(t){let e=this.ctx.state,i=st[e],n=i==null?void 0:i[t];if(!n)return!1;let s=e;return this.ctx.state=n,this.emit(s),!0}init(){return this.ctx.loadedAt=Date.now(),this.transition("INIT")}configLoaded(t){return this.ctx.config=t,this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.errorMessage="",this.ctx.resultTier=null,this.transition("CONFIG_LOADED")}fetchFailed(t){return this.ctx.errorMessage=t,this.transition("FETCH_FAILED")}widgetDisabled(){return this.transition("WIDGET_DISABLED")}open(){return this.ctx.resultTier!==null&&(this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.resultTier=null,this.ctx.errorMessage=""),this.transition("OPEN")}close(){return this.transition("CLOSE")}selectOption(t){var n;if(this.ctx.state!=="open")return;let e=this.ctx.answers.findIndex(s=>s.stepId===t.stepId);e!==-1?this.ctx.answers[e]=t:this.ctx.answers.push(t);let i=((n=this.ctx.config)==null?void 0:n.steps.length)??0;this.ctx.currentStepIndex<i-1&&this.ctx.currentStepIndex++,this.emit(this.ctx.state)}goBack(){this.ctx.state==="open"&&this.ctx.currentStepIndex>0&&(this.ctx.currentStepIndex--,this.emit(this.ctx.state))}isOnContactStep(){return this.ctx.config?this.ctx.answers.length>=this.ctx.config.steps.length:!1}setContact(t){this.ctx.contact=t}submit(){return this.transition("SUBMIT")}submitSuccess(t){return this.ctx.resultTier=t,this.transition("SUBMIT_SUCCESS")}submitFailed(t){return this.ctx.errorMessage=t,this.transition("SUBMIT_FAILED")}retry(){return this.ctx.errorMessage="",this.transition("RETRY")}reset(){return this.ctx.currentStepIndex=0,this.ctx.answers=[],this.ctx.contact={name:"",email:""},this.ctx.errorMessage="",this.ctx.resultTier=null,this.transition("RESET")}};var b=class extends Error{constructor(e,i,n){super(e);this.status=i;this.code=n;this.name="WidgetApiError"}};function U(r,t,e=15e3){let i=new AbortController,n=setTimeout(()=>i.abort(),e),s={...t,signal:i.signal};return fetch(r,s).finally(()=>clearTimeout(n))}function N(r,t){switch(r){case 402:return new b("This widget subscription has expired.",402,"EXPIRED");case 404:return new b("Widget not found. Please check your widget key.",404,"NOT_FOUND");case 409:return new b("You have already submitted a response.",409,"DUPLICATE");case 410:return new b("This widget is no longer active.",410,"INACTIVE");case 429:return new b("Too many requests. Please try again later.",429,"RATE_LIMITED");default:return new b(t||"An unexpected error occurred.",r,"SERVER_ERROR")}}async function F(r,t){let e=`${t}/api/v1/widget/${encodeURIComponent(r)}`,i;try{i=await U(e,{method:"GET",headers:{Accept:"application/json"}})}catch(s){throw s instanceof DOMException&&s.name==="AbortError"?new b("Request timed out. Please check your connection.",0,"TIMEOUT"):new b("Network error. Please check your connection.",0,"NETWORK_ERROR")}if(!i.ok){let s=await i.text().catch(()=>"");throw N(i.status,s)}return await i.json()}async function W(r,t){let e=`${t}/api/v1/submit`,i=async()=>{try{return await U(e,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(r)})}catch(a){throw a instanceof DOMException&&a.name==="AbortError"?new b("Request timed out. Please try again.",0,"TIMEOUT"):new b("Network error. Please try again.",0,"NETWORK_ERROR")}},n=await i();if(n.status>=500&&n.status<600&&(await new Promise(a=>setTimeout(a,2e3)),n=await i()),!n.ok){let a=await n.text().catch(()=>"");throw N(n.status,a)}return await n.json()}function ot(r){switch(r){case"serif":return'Georgia, "Times New Roman", Times, serif';case"sans":return'"Helvetica Neue", Helvetica, Arial, sans-serif';case"system":default:return'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}function at(r){let t=r.triggerOffsetX,e=r.triggerOffsetY;switch(r.position){case"bottom-left":return`bottom: ${e}px; left: ${t}px;`;case"bottom-center":return`bottom: ${e}px; left: 50%; transform: translateX(-50%);`;case"bottom-right":default:return`bottom: ${e}px; right: ${t}px;`}}function lt(r){let t=r.triggerOffsetX,e=r.triggerOffsetY+60;switch(r.position){case"bottom-left":return`bottom: ${e}px; left: ${t}px;`;case"bottom-center":return`bottom: ${e}px; left: 50%; transform: translateX(-50%);`;case"bottom-right":default:return`bottom: ${e}px; right: ${t}px;`}}function z(r,t){let e=r.replace("#",""),i=parseInt(e.substring(0,2),16),n=parseInt(e.substring(2,4),16),s=parseInt(e.substring(4,6),16);return isNaN(i)||isNaN(n)||isNaN(s)?r:`rgba(${i}, ${n}, ${s}, ${t})`}function q(r){let t=ot(r.fontFamily),e=r.borderRadius,i=r.panelWidth||400,n=r.mode==="dark"?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)",s=r.mode==="dark"?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)",a=r.mode==="dark"?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",p=r.mode==="dark"?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)";return`
/* \u2500\u2500 CSS Custom Properties \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
:host {
  --sb-primary: ${r.primaryColor};
  --sb-accent: ${r.accentColor};
  --sb-bg: ${r.backgroundColor};
  --sb-text: ${r.textColor};
  --sb-radius: ${e}px;
  --sb-font: ${t};
  --sb-panel-width: ${i}px;
  --sb-border: ${n};
  --sb-input-bg: ${s};
  --sb-input-border: ${a};
  --sb-hover-bg: ${p};
  --sb-accent-10: ${z(r.accentColor,.1)};
  --sb-accent-20: ${z(r.accentColor,.2)};

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
  ${at(r)}
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
  ${lt(r)}
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
`}var ct="(prefers-reduced-motion: reduce)";function M(){return typeof window<"u"&&window.matchMedia(ct).matches}function dt(r,t,e){if(r.classList.add(t),M()){r.classList.remove(t);return}setTimeout(()=>{r.classList.remove(t)},e)}function G(r){r.classList.remove("sb-panel--hidden","sb-panel--closing"),r.style.animation="none",r.offsetHeight,r.style.animation=""}function K(r,t){if(M()){r.classList.add("sb-panel--hidden"),t();return}r.classList.add("sb-panel--closing");let e=()=>{r.removeEventListener("animationend",e),r.classList.add("sb-panel--hidden"),r.classList.remove("sb-panel--closing"),t()};r.addEventListener("animationend",e,{once:!0}),setTimeout(()=>{r.classList.contains("sb-panel--hidden")||(r.removeEventListener("animationend",e),r.classList.add("sb-panel--hidden"),r.classList.remove("sb-panel--closing"),t())},300)}function V(r,t){let e=r.firstElementChild;if(!e||M()){r.textContent="";let n=t();r.appendChild(n);return}e.classList.add("sb-step--exit");let i=()=>{e.removeEventListener("animationend",i),r.textContent="";let n=t();r.appendChild(n)};e.addEventListener("animationend",i,{once:!0}),setTimeout(()=>{if(r.contains(e)){e.removeEventListener("animationend",i),r.textContent="";let n=t();r.appendChild(n)}},250)}function Y(r,t){if(M()){r.textContent="";let i=t();r.appendChild(i);return}r.textContent="";let e=t();e.classList.add("sb-step--back"),r.appendChild(e),setTimeout(()=>{e.classList.remove("sb-step--back")},350)}function j(r){dt(r,"sb-option--tapped",200)}function X(r){r.classList.remove("sb-trigger--hidden")}function Z(r){r.classList.add("sb-trigger--hidden")}function J(r){r.style.animation="none",r.offsetHeight,r.style.animation=""}function f(r,...t){let e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.setAttribute("viewBox",r),e.setAttribute("aria-hidden","true"),e.setAttribute("focusable","false");for(let i of t)i(e);return e}function k(r,t){return e=>{let i=document.createElementNS("http://www.w3.org/2000/svg","path");if(i.setAttribute("d",r),t)for(let[n,s]of Object.entries(t))i.setAttribute(n,s);e.appendChild(i)}}function y(r,t,e,i){return n=>{let s=document.createElementNS("http://www.w3.org/2000/svg","line");s.setAttribute("x1",r),s.setAttribute("y1",t),s.setAttribute("x2",e),s.setAttribute("y2",i),n.appendChild(s)}}function pt(r,t,e){return i=>{let n=document.createElementNS("http://www.w3.org/2000/svg","circle");n.setAttribute("cx",r),n.setAttribute("cy",t),n.setAttribute("r",e),i.appendChild(n)}}function ht(r){return t=>{let e=document.createElementNS("http://www.w3.org/2000/svg","polyline");e.setAttribute("points",r),t.appendChild(e)}}function gt(){return f("0 0 24 24",k("M5 12h14"),k("M12 5l7 7-7 7"))}function bt(){return f("0 0 24 24",k("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",{fill:"currentColor",stroke:"none"}))}function ut(){return f("0 0 24 24",y("12","5","12","19"),y("5","12","19","12"))}function mt(){return f("0 0 24 24",y("18","6","6","18"),y("6","6","18","18"))}function ft(){return f("0 0 24 24",ht("15 18 9 12 15 6"))}function xt(){return f("0 0 24 24",k("M5 13l4 4L19 7"))}function vt(){return f("0 0 24 24",pt("12","12","10"),y("12","8","12","12"),y("12","16","12.01","16"))}function yt(){return f("0 0 16 16",k("M8 8a3 3 0 100-6 3 3 0 000 6zM2 14s-1 0-1-1 1-4 7-4 7 3 7 4-1 1-1 1H2z",{fill:"currentColor",stroke:"none"}))}function wt(r){switch(r){case"arrow":return gt();case"chat":return bt();case"plus":return ut();case"none":default:return null}}function l(r,t,e){let i=document.createElement(r);if(t&&(i.className=t),e)for(let[n,s]of Object.entries(e))i.setAttribute(n,s);return i}var I=class{constructor(t,e){this.config=null;this.triggerEl=null;this.panelEl=null;this.progressBar=null;this.stepCounter=null;this.contentEl=null;this.backBtn=null;this.ariaLiveRegion=null;this.overlayEl=null;this.previousActiveElement=null;this.boundKeyHandler=null;this.host=t,this.callbacks=e,this.shadow=t.attachShadow({mode:"open"})}init(t){this.config=t,this.injectStyles(t.theme),this.renderTrigger(t)}injectStyles(t){let e=document.createElement("style");e.textContent=q(t),this.shadow.appendChild(e)}renderTrigger(t){let e=l("button","sb-trigger sb-trigger--hidden",{type:"button","aria-label":t.theme.triggerText||"Open widget"});t.theme.triggerType==="tab"&&e.classList.add("sb-trigger--tab");let i=wt(t.theme.triggerIcon);if(i){let s=l("span","sb-trigger__icon");s.appendChild(i),e.appendChild(s)}let n=document.createTextNode(t.theme.triggerText||"Get Started");e.appendChild(n),e.addEventListener("click",()=>{this.callbacks.onTriggerClick()}),this.shadow.appendChild(e),this.triggerEl=e,requestAnimationFrame(()=>{X(e)})}showTrigger(){this.triggerEl&&this.triggerEl.classList.remove("sb-trigger--hidden")}hideTrigger(){this.triggerEl&&Z(this.triggerEl)}openPanel(t,e){this.config&&(this.hideTrigger(),this.showOverlay(),this.panelEl||this.buildPanel(),this.panelEl&&(G(this.panelEl),this.updateProgress(t,e),this.enableFocusTrap()))}closePanel(){this.panelEl&&(K(this.panelEl,()=>{this.showTrigger(),this.hideOverlay()}),this.disableFocusTrap())}buildPanel(){var o;let t=l("div","sb-panel sb-panel--hidden",{role:"dialog","aria-label":"HawkLeads Widget","aria-modal":"true"}),e=l("div","sb-header"),i=l("div","sb-header__left"),n=l("button","sb-header__back",{type:"button","aria-label":"Go back",style:"visibility: hidden;"});n.appendChild(ft()),n.addEventListener("click",()=>this.callbacks.onBack()),this.backBtn=n,i.appendChild(n);let s=l("span","sb-header__step");s.textContent="",this.stepCounter=s,i.appendChild(s),e.appendChild(i);let a=l("button","sb-header__close",{type:"button","aria-label":"Close widget"});a.appendChild(mt()),a.addEventListener("click",()=>this.callbacks.onClose()),e.appendChild(a),t.appendChild(e);let p=l("div","sb-progress",{role:"progressbar","aria-valuemin":"0","aria-valuemax":"100","aria-valuenow":"0"}),h=l("div","sb-progress__bar");h.style.width="0%",p.appendChild(h),t.appendChild(p),this.progressBar=h;let c=l("div","sb-content");if(t.appendChild(c),this.contentEl=c,(o=this.config)!=null&&o.theme.showBranding){let g=l("div","sb-footer"),u=l("a","sb-footer__link",{href:"https://hawkleads.io?ref=widget",target:"_blank",rel:"noopener noreferrer"});u.textContent="Powered by HawkLeads",g.appendChild(u),t.appendChild(g)}let d=l("div","sb-sr-only",{"aria-live":"polite","aria-atomic":"true"});t.appendChild(d),this.ariaLiveRegion=d,t.addEventListener("keydown",g=>{let u=parseInt(g.key,10);if(u>=1&&u<=9){let m=t.querySelectorAll(".sb-option")[u-1];m&&(g.preventDefault(),m.click())}}),this.shadow.appendChild(t),this.panelEl=t}updateProgress(t,e){let i=e+1,n=t+1,s=Math.round(n/i*100);if(this.progressBar){this.progressBar.style.width=`${s}%`;let a=this.progressBar.parentElement;a&&a.setAttribute("aria-valuenow",String(s))}this.stepCounter&&(this.stepCounter.textContent=`Step ${n} of ${i}`),this.backBtn&&(this.backBtn.style.visibility=t>0?"visible":"hidden"),this.ariaLiveRegion&&(this.ariaLiveRegion.textContent=`Step ${n} of ${i}`)}renderStep(t,e,i,n="forward"){if(!this.contentEl)return;this.updateProgress(e,i);let s=()=>{var c;let a=l("div","sb-step"),p=l("h2","sb-question");if(p.textContent=t.question,a.appendChild(p),t.description){let d=l("p","sb-description");d.textContent=t.description,a.appendChild(d)}let h=l("div","sb-options",{role:"radiogroup","aria-label":t.question});for(let d=0;d<t.options.length;d++){let o=t.options[d],g=l("button","sb-option",{type:"button",role:"radio","aria-checked":"false","data-option-id":o.id}),u=l("span","sb-option__num");if(u.textContent=String(d+1),g.appendChild(u),o.icon){let m=l("span","sb-option__icon");m.textContent=o.icon,g.appendChild(m)}let w=l("span","sb-option__label");w.textContent=o.label,g.appendChild(w),g.addEventListener("click",()=>{j(g),setTimeout(()=>{this.callbacks.onOptionSelect(t.id,o.id,o.label,o.scoreWeight)},120)}),g.addEventListener("keydown",m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),g.click())}),h.appendChild(g)}if(a.appendChild(h),(c=this.config)!=null&&c.theme.showSocialProof&&e===0&&this.config.submissionCount>=this.config.socialProofMin){let d=l("div","sb-social-proof"),o=l("span","sb-social-proof__icon");o.appendChild(yt()),d.appendChild(o);let g=document.createTextNode(this.config.socialProofText.replace("{count}",String(this.config.submissionCount)));d.appendChild(g),a.appendChild(d)}return a};n==="backward"?Y(this.contentEl,s):V(this.contentEl,s)}renderContactForm(t,e={},i=!1,n){if(!this.contentEl||!this.config)return;this.updateProgress(t,t);let s=()=>{let a=l("div","sb-contact"),p=l("h2","sb-contact__title");p.textContent="Almost done!",a.appendChild(p);let h=l("p","sb-contact__subtitle");h.textContent="Enter your details to see your results.",a.appendChild(h);let c=l("form","",{novalidate:"true",autocomplete:"on"}),d=this.createField("name","Name","text",!0,"Your name",e.name,n==null?void 0:n.name);c.appendChild(d);let o=this.createField("email","Email","email",!0,"you@example.com",e.email,n==null?void 0:n.email);if(c.appendChild(o),this.config.contactShowPhone){let x=this.createField("phone","Phone","tel",this.config.contactPhoneRequired,"(555) 123-4567",e.phone,n==null?void 0:n.phone);c.appendChild(x)}if(this.config.contactShowMessage){let x=this.createTextareaField("message","Message",this.config.contactMessageRequired,this.config.contactMessagePlaceholder||"Tell us more...",e.message,n==null?void 0:n.message);c.appendChild(x)}let g=l("div","sb-hp"),u=l("label");u.textContent="Leave this empty";let w=l("input","",{type:"text",name:"website",tabindex:"-1",autocomplete:"off","aria-hidden":"true"});g.appendChild(u),g.appendChild(w),c.appendChild(g);let m=l("div","sb-consent"),L=l("label","sb-consent__label"),P=l("input","sb-consent__check",{type:"checkbox",name:"consent",required:"true"});L.appendChild(P);let R=l("span","sb-consent__text");R.textContent="I agree to the processing of my data and acknowledge the ";let H=l("a","sb-consent__link",{href:"/privacy",target:"_blank",rel:"noopener noreferrer"});H.textContent="Privacy Policy",R.appendChild(H),L.appendChild(R),m.appendChild(L);let C=l("p","sb-field__error sb-consent__error");C.style.display="none",C.textContent="You must agree before submitting.",m.appendChild(C),c.appendChild(m);let E=l("button","sb-submit",{type:"submit"});if(i){E.setAttribute("disabled","true");let x=l("span","sb-submit__spinner");E.appendChild(x);let v=document.createTextNode("Submitting...");E.appendChild(v)}else E.textContent=this.config.contactSubmitText||"See My Results";return c.appendChild(E),c.addEventListener("submit",x=>{if(x.preventDefault(),!P.checked){C.style.display="block",P.focus();return}C.style.display="none";let v=new FormData(c),_=D=>D.replace(/<[^>]*>?/g,"").trim(),O={name:_(v.get("name")||""),email:_(v.get("email")||"").toLowerCase()};if(this.config.contactShowPhone){let D=_(v.get("phone")||"");O.phone=D.replace(/[^+\d\s().-]/g,"")}this.config.contactShowMessage&&(O.message=_(v.get("message")||""));let rt=v.get("website")||"";this.callbacks.onContactSubmit(O,rt)}),a.appendChild(c),a};V(this.contentEl,s)}createField(t,e,i,n,s,a,p){let h=l("div","sb-field"),c=l("label","sb-field__label",{for:`sb-${t}`});if(c.textContent=e,n){let o=l("span","sb-field__required");o.textContent="*",c.appendChild(o)}h.appendChild(c);let d=l("input","sb-field__input",{type:i,name:t,id:`sb-${t}`,placeholder:s,autocomplete:t});if(n&&d.setAttribute("required","true"),p&&(d.value=p),i==="tel"&&(d.setAttribute("inputmode","tel"),d.addEventListener("input",()=>{let o=d.value.replace(/\D/g,"").slice(0,10);o.length===0?d.value="":o.length<=3?d.value=`(${o}`:o.length<=6?d.value=`(${o.slice(0,3)}) ${o.slice(3)}`:d.value=`(${o.slice(0,3)}) ${o.slice(3,6)}-${o.slice(6)}`})),a&&(d.classList.add("sb-field__input--error"),d.setAttribute("aria-invalid","true"),d.setAttribute("aria-describedby",`sb-${t}-error`)),h.appendChild(d),a){let o=l("div","sb-field__error",{id:`sb-${t}-error`,role:"alert"});o.textContent=a,h.appendChild(o)}return h}createTextareaField(t,e,i,n,s,a){let p=l("div","sb-field"),h=l("label","sb-field__label",{for:`sb-${t}`});if(h.textContent=e,i){let d=l("span","sb-field__required");d.textContent="*",h.appendChild(d)}p.appendChild(h);let c=l("textarea","sb-field__input sb-field__textarea",{name:t,id:`sb-${t}`,placeholder:n,rows:"3"});if(i&&c.setAttribute("required","true"),a&&(c.value=a),s&&(c.classList.add("sb-field__input--error"),c.setAttribute("aria-invalid","true"),c.setAttribute("aria-describedby",`sb-${t}-error`)),p.appendChild(c),s){let d=l("div","sb-field__error",{id:`sb-${t}-error`,role:"alert"});d.textContent=s,p.appendChild(d)}return p}renderConfirmation(t){if(!this.contentEl)return;if(this.backBtn&&(this.backBtn.style.visibility="hidden"),this.progressBar){this.progressBar.style.width="100%";let a=this.progressBar.parentElement;a&&a.setAttribute("aria-valuenow","100")}this.stepCounter&&(this.stepCounter.textContent="Complete"),this.contentEl.textContent="";let e=l("div","sb-confirmation"),i=l("div","sb-confirmation__check");i.appendChild(xt()),e.appendChild(i);let n=l("h2","sb-confirmation__headline");n.textContent=t.headline,e.appendChild(n);let s=l("p","sb-confirmation__body");if(s.textContent=t.body,e.appendChild(s),t.ctaText&&t.ctaUrl){let a=l("a","sb-confirmation__cta",{href:t.ctaUrl,target:"_blank",rel:"noopener noreferrer",role:"button"});a.textContent=t.ctaText,a.addEventListener("click",p=>{p.preventDefault(),this.callbacks.onCtaClick(t.ctaUrl)}),e.appendChild(a)}this.contentEl.appendChild(e),J(e),this.launchConfetti()}launchConfetti(){let t=document.createElement("canvas");t.style.cssText="position:fixed;inset:0;z-index:2147483647;pointer-events:none;width:100vw;height:100vh;",document.body.appendChild(t),t.width=window.innerWidth,t.height=window.innerHeight;let e=t.getContext("2d");if(!e){t.remove();return}let i=["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#F97316"],n=[],s=t.width,a=t.height;for(let o=0;o<40;o++){let g=Math.random()*Math.PI*2,u=2+Math.random()*5;n.push({x:s/2+(Math.random()-.5)*200,y:a/2+(Math.random()-.5)*100,w:8+Math.random()*10,h:5+Math.random()*10,vx:Math.cos(g)*u,vy:Math.sin(g)*u-3,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.15,color:i[Math.floor(Math.random()*i.length)]??"#3B82F6",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.02+Math.random()*.03,delay:0})}for(let o=0;o<30;o++){let g=o%2===0;n.push({x:g?-10:s+10,y:a*.7+Math.random()*a*.3,w:6+Math.random()*8,h:4+Math.random()*8,vx:(g?1:-1)*(3+Math.random()*5),vy:-(4+Math.random()*6),rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.2,color:i[Math.floor(Math.random()*i.length)]??"#10B981",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.015+Math.random()*.02,delay:30+Math.floor(Math.random()*20)})}for(let o=0;o<40;o++)n.push({x:Math.random()*s,y:-20-Math.random()*200,w:5+Math.random()*7,h:3+Math.random()*6,vx:(Math.random()-.5)*1.5,vy:.5+Math.random()*1.5,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.1,color:i[Math.floor(Math.random()*i.length)]??"#F59E0B",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.01+Math.random()*.02,delay:60+Math.floor(Math.random()*60)});let p=o=>{for(let g=0;g<5;g++)n.push({x:Math.random()*s,y:a+20,w:7+Math.random()*9,h:5+Math.random()*7,vx:(Math.random()-.5)*2,vy:-(3+Math.random()*4),rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.12,color:i[Math.floor(Math.random()*i.length)]??"#8B5CF6",life:1,shape:Math.floor(Math.random()*3),sway:Math.random()*Math.PI*2,swaySpeed:.01+Math.random()*.015,delay:o+Math.floor(Math.random()*30)})};p(240),p(480),p(720);let h=0,c=900,d=()=>{h++,e.clearRect(0,0,t.width,t.height);for(let o of n)h<o.delay||(o.sway+=o.swaySpeed,o.x+=o.vx+Math.sin(o.sway)*.5,o.vy+=.04,o.y+=o.vy,o.rot+=o.vr,o.vx*=.995,o.vr*=.998,h>c-80&&(o.life-=.0125),!(o.life<=0||o.y>t.height+20)&&(e.save(),e.translate(o.x,o.y),e.rotate(o.rot),e.globalAlpha=Math.max(0,o.life),e.fillStyle=o.color,o.shape===0?e.fillRect(-o.w/2,-o.h/2,o.w,o.h):o.shape===1?(e.beginPath(),e.arc(0,0,o.w/2,0,Math.PI*2),e.fill()):(e.beginPath(),e.moveTo(0,-o.h/2),e.lineTo(o.w/2,o.h/2),e.lineTo(-o.w/2,o.h/2),e.closePath(),e.fill()),e.restore()));h<c?requestAnimationFrame(d):t.remove()};requestAnimationFrame(d)}renderError(t){if(!this.contentEl)return;this.contentEl.textContent="";let e=l("div","sb-error"),i=l("div","sb-error__icon");i.appendChild(vt()),e.appendChild(i);let n=l("p","sb-error__message");n.textContent=t||"Something went wrong. Please try again.",e.appendChild(n);let s=l("button","sb-error__retry",{type:"button"});s.textContent="Try Again",s.addEventListener("click",()=>this.callbacks.onRetry()),e.appendChild(s),this.contentEl.appendChild(e)}renderLoading(){if(!this.contentEl)return;this.contentEl.textContent="";let t=l("div","sb-loading"),e=l("div","sb-loading__spinner"),i=l("span","sb-sr-only");i.textContent="Loading...",t.appendChild(e),t.appendChild(i),this.contentEl.appendChild(t)}renderDisabled(){for(;this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild)}renderExpiredFallback(){let t=this.shadow.querySelector("style");for(;this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild);t&&this.shadow.appendChild(t);let e=l("div","sb-panel",{role:"status",style:"position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; padding: 20px; max-width: 320px;"}),i=l("p","",{style:"font-size: 14px; opacity: 0.7; line-height: 1.5; text-align: center; margin: 0;"});i.textContent="Please contact us directly",e.appendChild(i),this.shadow.appendChild(e)}enableFocusTrap(){this.previousActiveElement=document.activeElement,this.boundKeyHandler=t=>{if(t.key==="Escape"){t.preventDefault(),this.callbacks.onClose();return}if(t.key==="Tab"&&this.panelEl){let e=this.getFocusableElements();if(e.length===0)return;let i=e[0],n=e[e.length-1];t.shiftKey?(this.shadow.activeElement===i||!this.panelEl.contains(this.shadow.activeElement))&&(t.preventDefault(),n.focus()):(this.shadow.activeElement===n||!this.panelEl.contains(this.shadow.activeElement))&&(t.preventDefault(),i.focus())}},document.addEventListener("keydown",this.boundKeyHandler,!0),requestAnimationFrame(()=>{let e=this.getFocusableElements()[0];e&&e.focus()})}disableFocusTrap(){this.boundKeyHandler&&(document.removeEventListener("keydown",this.boundKeyHandler,!0),this.boundKeyHandler=null),this.previousActiveElement&&this.previousActiveElement instanceof HTMLElement&&(this.previousActiveElement.focus(),this.previousActiveElement=null)}getFocusableElements(){if(!this.panelEl)return[];let e=this.panelEl.querySelectorAll('button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');return Array.from(e)}showOverlay(){if(this.overlayEl)return;let t=l("div","sb-overlay");t.addEventListener("click",()=>{this.callbacks.onClose()}),this.shadow.appendChild(t),this.overlayEl=t}hideOverlay(){this.overlayEl&&(this.overlayEl.remove(),this.overlayEl=null)}showTeaser(t){if(!this.triggerEl)return;let e=this.shadow.querySelector(".sb-teaser");e&&e.remove();let i=document.createElement("div");i.className="sb-teaser",i.setAttribute("role","status"),i.style.cssText=`
      position: fixed; bottom: 90px; right: 20px; z-index: 2147483646;
      background: #fff; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px; font-weight: 500; padding: 10px 16px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 240px;
      opacity: 0; transform: translateY(8px) scale(0.95);
      transition: opacity 200ms ease, transform 200ms ease;
      cursor: pointer; pointer-events: auto;
    `,i.textContent=t;let n=document.createElement("div");n.style.cssText=`
      position: absolute; bottom: -6px; right: 24px;
      width: 12px; height: 12px; background: #fff;
      transform: rotate(45deg); border-radius: 2px;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.08);
    `,i.appendChild(n),i.addEventListener("click",()=>{i.remove(),this.callbacks.onTriggerClick()}),this.shadow.appendChild(i),requestAnimationFrame(()=>{requestAnimationFrame(()=>{i.style.opacity="1",i.style.transform="translateY(0) scale(1)"})}),setTimeout(()=>{i.style.opacity="0",i.style.transform="translateY(8px) scale(0.95)",setTimeout(()=>i.remove(),200)},6e3)}pulseTrigger(){if(!this.triggerEl)return;let t=this.triggerEl,e=t.style.transform;t.style.transition="transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",t.style.transform="scale(1.15)",setTimeout(()=>{t.style.transform="scale(1)",setTimeout(()=>{t.style.transform="scale(1.1)",setTimeout(()=>{t.style.transform=e||"scale(1)",t.style.transition=""},300)},300)},300)}destroy(){for(this.disableFocusTrap();this.shadow.firstChild;)this.shadow.removeChild(this.shadow.firstChild);this.triggerEl=null,this.panelEl=null,this.progressBar=null,this.stepCounter=null,this.contentEl=null,this.backBtn=null,this.ariaLiveRegion=null}};var Ct=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,Et=/^[+\d\s().-]+$/;function Q(r,t){let e={},i=(r.name??"").trim();i?i.length>200&&(e.name="Name must be 200 characters or fewer."):e.name="Name is required.";let n=(r.email??"").trim();if(n?Ct.test(n)||(e.email="Please enter a valid email address."):e.email="Email is required.",t.contactShowPhone){let s=(r.phone??"").trim();t.contactPhoneRequired&&!s?e.phone="Phone number is required.":s&&!Et.test(s)?e.phone="Please enter a valid phone number.":s&&s.length>30&&(e.phone="Phone must be 30 characters or fewer.")}if(t.contactShowMessage){let s=(r.message??"").trim();t.contactMessageRequired&&!s?e.message="Message is required.":s&&s.length>2e3&&(e.message="Message must be 2000 characters or fewer.")}return e}function tt(r){return Object.keys(r).length>0}var B="sb_v";var et="sb_session";function it(){let r=new Uint8Array(8);return crypto.getRandomValues(r),Array.from(r).map(t=>t.toString(16).padStart(2,"0")).join("")}function nt(r){try{let t=`${r}=`,e=document.cookie.split(";");for(let i of e){let n=i.trim();if(n.startsWith(t))return decodeURIComponent(n.substring(t.length))}return null}catch{return null}}function kt(r,t,e){try{let i=new Date(Date.now()+e*864e5).toUTCString();document.cookie=`${r}=${encodeURIComponent(t)};expires=${i};path=/;SameSite=Lax`}catch{}}var A=class{constructor(t=["/pricing","/demo","/contact","/compare"]){this.pagesViewed=0;this.pageUrls=[];this.maxScrollDepth=0;this.widgetOpens=0;this.pricingPageViews=0;this.highIntentPageViews=0;this.scrollHandler=null;this.trackingBlocked=!1;this.highIntentPatterns=t,this.startedAt=Date.now();let e=nt(B);if(e){let n=e.split(":");this.fingerprint=n[0]??it(),this.sessionNumber=parseInt(n[1]??"0",10)+1}else this.fingerprint=it(),this.sessionNumber=1;kt(B,`${this.fingerprint}:${this.sessionNumber}`,90);let i=nt(B);this.trackingBlocked=i===null,this.trackCurrentPage(),this.startScrollTracking()}trackCurrentPage(){this.restoreSession(),this.pagesViewed++;let t=window.location.pathname;this.pageUrls.includes(t)||this.pageUrls.push(t),t.includes("/pricing")&&this.pricingPageViews++,this.highIntentPatterns.some(e=>t.includes(e))&&this.highIntentPageViews++,this.saveSession()}restoreSession(){try{let t=sessionStorage.getItem(et);if(!t)return;let e=JSON.parse(t);this.pagesViewed=e.pagesViewed??0,this.pageUrls=e.pageUrls??[],this.pricingPageViews=e.pricingPageViews??0,this.highIntentPageViews=e.highIntentPageViews??0,this.startedAt=e.startedAt??this.startedAt}catch{}}saveSession(){try{let t={pagesViewed:this.pagesViewed,pageUrls:this.pageUrls,pricingPageViews:this.pricingPageViews,highIntentPageViews:this.highIntentPageViews,startedAt:this.startedAt};sessionStorage.setItem(et,JSON.stringify(t))}catch{}}startScrollTracking(){this.scrollHandler=()=>{let t=document.documentElement.scrollHeight-window.innerHeight,e=Math.round(window.scrollY/Math.max(1,t)*100);e>this.maxScrollDepth&&(this.maxScrollDepth=e)},window.addEventListener("scroll",this.scrollHandler,{passive:!0})}recordWidgetOpen(){this.widgetOpens++}getFingerprint(){return this.fingerprint}isTrackingBlocked(){return this.trackingBlocked}getSessionData(){let t=Math.round((Date.now()-this.startedAt)/1e3);return{pagesViewed:this.pagesViewed,pageUrls:[...this.pageUrls],timeOnSiteSeconds:t,maxScrollDepth:this.maxScrollDepth,widgetOpens:this.widgetOpens,sessionNumber:this.sessionNumber,pricingPageViews:this.pricingPageViews,highIntentPageViews:this.highIntentPageViews}}destroy(){this.scrollHandler&&(window.removeEventListener("scroll",this.scrollHandler),this.scrollHandler=null)}};var St="https://hawkleads.io";async function _t(r,t){let e=Math.random().toString(36).substring(2,10),i=`${r}:${t}:${e}`,n=new TextEncoder,s=await crypto.subtle.digest("SHA-256",n.encode(i)),p=Array.from(new Uint8Array(s)).map(h=>h.toString(16).padStart(2,"0")).join("");return`sb_${r.slice(0,8)}_${p}`}function Tt(){try{let r=new URLSearchParams(window.location.search),t={},e=r.get("utm_source"),i=r.get("utm_medium"),n=r.get("utm_campaign");return e&&(t.utmSource=e),i&&(t.utmMedium=i),n&&(t.utmCampaign=n),t}catch{return{}}}function S(r,t,e,i,n,s){let a={widgetKey:t,event:e};i!==void 0&&(a.stepIndex=i),n&&(a.abTestId=n),s&&(a.abVariant=s);try{fetch(`${r}/api/v1/widget/track`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a),keepalive:!0}).catch(()=>{})}catch{}}var $=class{constructor(t,e){this.stepDirection="forward";this.validationErrors={};this.abVariant=null;this.abTestId=null;this.tracker=null;this.widgetKey=t,this.apiUrl=e,this.machine=new T}async start(){let t=`sb-root-${this.widgetKey}`;if(document.getElementById(t))return;let e=document.createElement("div");e.id=t,e.style.position="fixed",e.style.zIndex="2147483647",e.style.inset="0",e.style.overflow="visible",e.style.pointerEvents="none",document.body.appendChild(e),this.renderer=new I(e,{onTriggerClick:()=>this.handleTriggerClick(),onClose:()=>this.handleClose(),onOptionSelect:(i,n,s,a)=>this.handleOptionSelect(i,n,s,a),onBack:()=>this.handleBack(),onContactSubmit:(i,n)=>this.handleContactSubmit(i,n),onRetry:()=>this.handleRetry(),onCtaClick:i=>this.handleCtaClick(i)}),this.machine.init();try{let i=await F(this.widgetKey,this.apiUrl);if(i.abTest){this.abTestId=i.abTest.testId;let n=Math.random()*100;if(this.abVariant=n<i.abTest.trafficSplit?"a":"b",this.abVariant==="b"){let s=i.steps.findIndex(a=>{var p;return a.id===((p=i.abTest)==null?void 0:p.targetStepId)});if(s!==-1){let a=i.steps[s];if(a){let p={...a,question:i.abTest.variantB.question,options:i.abTest.variantB.options};i.steps[s]=p}}}}this.machine.configLoaded(i),this.renderer.init(i),S(this.apiUrl,this.widgetKey,"impression",void 0,this.abTestId,this.abVariant),this.tracker=new A,this.scheduleAttentionGrabbers()}catch(i){if(i instanceof b){if(i.code==="INACTIVE"){this.machine.widgetDisabled(),this.renderer.renderDisabled();return}if(i.code==="EXPIRED"){this.machine.widgetDisabled(),this.renderer.renderExpiredFallback();return}this.machine.fetchFailed(i.message)}else this.machine.fetchFailed("Failed to load widget configuration.")}}scheduleAttentionGrabbers(){let t=this.machine.getContext();if(!t.config)return;let e=t.config.attentionGrabber;if(!(!e||!e.enabled)){if(e.teaserText&&setTimeout(()=>{this.machine.getState()==="ready"&&this.renderer.showTeaser(e.teaserText)},e.teaserDelayMs),e.pulseDelayMs>0&&setTimeout(()=>{this.machine.getState()==="ready"&&this.renderer.pulseTrigger()},e.pulseDelayMs),e.scrollNudgeText&&e.scrollThreshold>0){let i=!1,n=e.scrollThreshold/100,s=e.scrollNudgeText,a=()=>{if(i||this.machine.getState()!=="ready")return;window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)>n&&(i=!0,this.renderer.showTeaser(s),window.removeEventListener("scroll",a))};window.addEventListener("scroll",a,{passive:!0})}if(e.exitIntentText){let i=!1,n=e.exitIntentText,s=a=>{i||this.machine.getState()!=="ready"||a.clientY<=0&&(i=!0,this.renderer.showTeaser(n),this.renderer.pulseTrigger(),document.removeEventListener("mouseleave",s))};document.addEventListener("mouseleave",s)}}}handleTriggerClick(){var n;let t=this.machine.getContext();if(t.state!=="ready")return;this.machine.open(),(n=this.tracker)==null||n.recordWidgetOpen(),S(this.apiUrl,this.widgetKey,"open",void 0,this.abTestId,this.abVariant);let e=t.config;if(!e||e.steps.length===0)return;let i=e.steps.length;this.renderer.openPanel(0,i),this.stepDirection="forward",S(this.apiUrl,this.widgetKey,"step_view",0,this.abTestId,this.abVariant),this.renderCurrentView()}handleClose(){let t=this.machine.getState();(t==="open"||t==="complete"||t==="error")&&(this.renderer.closePanel(),t==="complete"?this.machine.reset():t==="error"?this.machine.retry():this.machine.close())}handleOptionSelect(t,e,i,n){let s=this.machine.getContext();if(s.state!=="open"||!s.config)return;let a=s.config.steps.find(d=>d.id===t);if(!a)return;let p={stepId:t,optionId:e,question:a.question,label:i,scoreWeight:n};this.stepDirection="forward",this.machine.selectOption(p);let h=this.machine.getContext(),c=h.currentStepIndex;h.config&&c<h.config.steps.length?S(this.apiUrl,this.widgetKey,"step_view",c,this.abTestId,this.abVariant):S(this.apiUrl,this.widgetKey,"completion",void 0,this.abTestId,this.abVariant),this.renderCurrentView()}handleBack(){let t=this.machine.getContext();t.state==="open"&&(this.stepDirection="backward",this.machine.isOnContactStep()?t.answers.length>0&&this.machine.goBack():this.machine.goBack(),this.renderCurrentView())}async handleContactSubmit(t,e){var s,a;let i=this.machine.getContext();if(i.state!=="open"||!i.config)return;this.machine.setContact(t);let n=Q(t,i.config);if(this.validationErrors=n,tt(n)){this.renderer.renderContactForm(i.config.steps.length,n,!1,t);return}this.machine.submit(),this.renderer.renderContactForm(i.config.steps.length,{},!0,t);try{let p=await _t(this.widgetKey,i.loadedAt),h=Tt(),c={widgetKey:this.widgetKey,answers:i.answers.map(g=>({stepId:g.stepId,optionId:g.optionId})),visitorName:t.name.trim(),visitorEmail:t.email.trim(),challengeToken:p,loadedAt:i.loadedAt,sourceUrl:window.location.href,referrer:document.referrer||"",...h};(s=t.phone)!=null&&s.trim()&&(c.visitorPhone=t.phone.trim()),(a=t.message)!=null&&a.trim()&&(c.visitorMessage=t.message.trim()),e&&(c.honeypot=e),this.abTestId&&(c.abTestId=this.abTestId),this.abVariant&&(c.abVariant=this.abVariant),this.tracker&&(c.behavioralData=this.tracker.getSessionData(),c.visitorFingerprint=this.tracker.getFingerprint(),c.trackingBlocked=this.tracker.isTrackingBlocked());let d=await W(c,this.apiUrl);this.machine.submitSuccess(d.tier);let o=i.config.confirmation[d.tier];this.renderer.renderConfirmation(o)}catch(p){if(p instanceof b&&p.code==="DUPLICATE"){let c="warm";this.machine.submitSuccess(c);let d=i.config.confirmation[c];this.renderer.renderConfirmation(d);return}let h="Something went wrong. Please try again.";p instanceof b&&(h=p.message),this.machine.submitFailed(h),this.renderer.renderError(h)}}handleRetry(){let t=this.machine.getContext();if(t.state==="error")if(this.machine.retry(),t.config){this.machine.open();let e=t.config.steps.length;this.renderer.openPanel(0,e),this.stepDirection="forward",this.renderCurrentView()}else this.retryFetchConfig()}async retryFetchConfig(){this.machine.init();try{let t=await F(this.widgetKey,this.apiUrl);this.machine.configLoaded(t),this.renderer.init(t)}catch(t){if(t instanceof b){if(t.code==="INACTIVE"){this.machine.widgetDisabled(),this.renderer.renderDisabled();return}if(t.code==="EXPIRED"){this.machine.widgetDisabled(),this.renderer.renderExpiredFallback();return}this.machine.fetchFailed(t.message)}else this.machine.fetchFailed("Failed to load widget configuration.")}}handleCtaClick(t){try{let e=new URL(t);if(e.protocol!=="https:"&&e.protocol!=="http:")return;window.open(t,"_blank","noopener,noreferrer")}catch{}}renderCurrentView(){let t=this.machine.getContext();if(!t.config)return;let e=t.config.steps.length,i=t.currentStepIndex;if(this.machine.isOnContactStep()){this.renderer.updateProgress(e,e),this.renderer.renderContactForm(e,this.validationErrors,!1,t.contact);return}let n=t.config.steps[i];n&&this.renderer.renderStep(n,i,e,this.stepDirection)}};(function(){function r(){let e=document.querySelectorAll("script[data-widget-key]"),i=e[e.length-1];if(!i)return null;let n=i.getAttribute("data-widget-key");return n?{key:n,apiUrl:i.getAttribute("data-api-url")??""}:null}function t(){let e,i=St,n=window.HawkLeadsConfig;if(n!=null&&n.key){if(e=n.key,n.apiUrl)try{new URL(n.apiUrl).protocol==="https:"&&(i=n.apiUrl)}catch{}}else{let a=r();if(!a)return;if(e=a.key,a.apiUrl)try{new URL(a.apiUrl).protocol==="https:"&&(i=a.apiUrl)}catch{}}new $(e,i).start()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()})();})();
