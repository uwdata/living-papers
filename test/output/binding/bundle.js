/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,e$2=Symbol(),n$3=new Map;class s$3{constructor(t,n){if(this._$cssResult$=!0,n!==e$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t;}get styleSheet(){let e=n$3.get(this.cssText);return t$1&&void 0===e&&(n$3.set(this.cssText,e=new CSSStyleSheet),e.replaceSync(this.cssText)),e}toString(){return this.cssText}}const o$3=t=>new s$3("string"==typeof t?t:t+"",e$2),r$2=(t,...n)=>{const o=1===t.length?t[0]:n.reduce(((e,n,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+t[s+1]),t[0]);return new s$3(o,e$2)},i$1=(e,n)=>{t$1?e.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((t=>{const n=document.createElement("style"),s=window.litNonce;void 0!==s&&n.setAttribute("nonce",s),n.textContent=t.cssText,e.appendChild(n);}));},S$1=t$1?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const n of t.cssRules)e+=n.cssText;return o$3(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var s$2;const e$1=window.trustedTypes,r$1=e$1?e$1.emptyScript:"",h$1=window.reactiveElementPolyfillSupport,o$2={toAttribute(t,i){switch(i){case Boolean:t=t?r$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},n$2=(t,i)=>i!==t&&(i==i||t==t),l$2={attribute:!0,type:String,converter:o$2,reflect:!1,hasChanged:n$2};class a$1 extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o();}static addInitializer(t){var i;null!==(i=this.l)&&void 0!==i||(this.l=[]),this.l.push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Eh(s,i);void 0!==e&&(this._$Eu.set(e,s),t.push(e));})),t}static createProperty(t,i=l$2){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$2}static finalize(){if(this.hasOwnProperty("finalized"))return !1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(S$1(i));}else void 0!==i&&s.push(S$1(i));return s}static _$Eh(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}o(){var t;this._$Ep=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Em(),this.requestUpdate(),null===(t=this.constructor.l)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$Eg)&&void 0!==i?i:this._$Eg=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$Eg)||void 0===i||i.splice(this._$Eg.indexOf(t)>>>0,1);}_$Em(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Et.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return i$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$ES(t,i,s=l$2){var e,r;const h=this.constructor._$Eh(t,s);if(void 0!==h&&!0===s.reflect){const n=(null!==(r=null===(e=s.converter)||void 0===e?void 0:e.toAttribute)&&void 0!==r?r:o$2.toAttribute)(i,s.type);this._$Ei=t,null==n?this.removeAttribute(h):this.setAttribute(h,n),this._$Ei=null;}}_$AK(t,i){var s,e,r;const h=this.constructor,n=h._$Eu.get(t);if(void 0!==n&&this._$Ei!==n){const t=h.getPropertyOptions(n),l=t.converter,a=null!==(r=null!==(e=null===(s=l)||void 0===s?void 0:s.fromAttribute)&&void 0!==e?e:"function"==typeof l?l:null)&&void 0!==r?r:o$2.fromAttribute;this._$Ei=n,this[n]=a(i,t.type),this._$Ei=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||n$2)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$Ei!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$Ep=this._$E_());}async _$E_(){this.isUpdatePending=!0;try{await this._$Ep;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach(((t,i)=>this[i]=t)),this._$Et=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$EU();}catch(t){throw i=!1,this._$EU(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$Eg)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$EU(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ep}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$ES(i,this[i],t))),this._$EC=void 0),this._$EU();}updated(t){}firstUpdated(t){}}a$1.finalized=!0,a$1.elementProperties=new Map,a$1.elementStyles=[],a$1.shadowRootOptions={mode:"open"},null==h$1||h$1({ReactiveElement:a$1}),(null!==(s$2=globalThis.reactiveElementVersions)&&void 0!==s$2?s$2:globalThis.reactiveElementVersions=[]).push("1.3.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t;const i=globalThis.trustedTypes,s$1=i?i.createPolicy("lit-html",{createHTML:t=>t}):void 0,e=`lit$${(Math.random()+"").slice(9)}$`,o$1="?"+e,n$1=`<${o$1}>`,l$1=document,h=(t="")=>l$1.createComment(t),r=t=>null===t||"object"!=typeof t&&"function"!=typeof t,d=Array.isArray,u=t=>{var i;return d(t)||"function"==typeof(null===(i=t)||void 0===i?void 0:i[Symbol.iterator])},c=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,a=/>/g,f=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,_=/'/g,m=/"/g,g=/^(?:script|style|textarea|title)$/i,p=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),$=p(1),b=Symbol.for("lit-noChange"),w=Symbol.for("lit-nothing"),T=new WeakMap,x=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new N(i.insertBefore(h(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l},A=l$1.createTreeWalker(l$1,129,null,!1),C=(t,i)=>{const o=t.length-1,l=[];let h,r=2===i?"<svg>":"",d=c;for(let i=0;i<o;i++){const s=t[i];let o,u,p=-1,$=0;for(;$<s.length&&(d.lastIndex=$,u=d.exec(s),null!==u);)$=d.lastIndex,d===c?"!--"===u[1]?d=v:void 0!==u[1]?d=a:void 0!==u[2]?(g.test(u[2])&&(h=RegExp("</"+u[2],"g")),d=f):void 0!==u[3]&&(d=f):d===f?">"===u[0]?(d=null!=h?h:c,p=-1):void 0===u[1]?p=-2:(p=d.lastIndex-u[2].length,o=u[1],d=void 0===u[3]?f:'"'===u[3]?m:_):d===m||d===_?d=f:d===v||d===a?d=c:(d=f,h=void 0);const y=d===f&&t[i+1].startsWith("/>")?" ":"";r+=d===c?s+n$1:p>=0?(l.push(o),s.slice(0,p)+"$lit$"+s.slice(p)+e+y):s+e+(-2===p?(l.push(void 0),i):y);}const u=r+(t[o]||"<?>")+(2===i?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return [void 0!==s$1?s$1.createHTML(u):u,l]};class E{constructor({strings:t,_$litType$:s},n){let l;this.parts=[];let r=0,d=0;const u=t.length-1,c=this.parts,[v,a]=C(t,s);if(this.el=E.createElement(v,n),A.currentNode=this.el.content,2===s){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(l=A.nextNode())&&c.length<u;){if(1===l.nodeType){if(l.hasAttributes()){const t=[];for(const i of l.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(e)){const s=a[d++];if(t.push(i),void 0!==s){const t=l.getAttribute(s.toLowerCase()+"$lit$").split(e),i=/([.?@])?(.*)/.exec(s);c.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?M:"?"===i[1]?H:"@"===i[1]?I:S});}else c.push({type:6,index:r});}for(const i of t)l.removeAttribute(i);}if(g.test(l.tagName)){const t=l.textContent.split(e),s=t.length-1;if(s>0){l.textContent=i?i.emptyScript:"";for(let i=0;i<s;i++)l.append(t[i],h()),A.nextNode(),c.push({type:2,index:++r});l.append(t[s],h());}}}else if(8===l.nodeType)if(l.data===o$1)c.push({type:2,index:r});else {let t=-1;for(;-1!==(t=l.data.indexOf(e,t+1));)c.push({type:7,index:r}),t+=e.length-1;}r++;}}static createElement(t,i){const s=l$1.createElement("template");return s.innerHTML=t,s}}function P(t,i,s=t,e){var o,n,l,h;if(i===b)return i;let d=void 0!==e?null===(o=s._$Cl)||void 0===o?void 0:o[e]:s._$Cu;const u=r(i)?void 0:i._$litDirective$;return (null==d?void 0:d.constructor)!==u&&(null===(n=null==d?void 0:d._$AO)||void 0===n||n.call(d,!1),void 0===u?d=void 0:(d=new u(t),d._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Cl)&&void 0!==l?l:h._$Cl=[])[e]=d:s._$Cu=d),void 0!==d&&(i=P(t,d._$AS(t,i.values),d,e)),i}class V{constructor(t,i){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:l$1).importNode(s,!0);A.currentNode=o;let n=A.nextNode(),h=0,r=0,d=e[0];for(;void 0!==d;){if(h===d.index){let i;2===d.type?i=new N(n,n.nextSibling,this,t):1===d.type?i=new d.ctor(n,d.name,d.strings,this,t):6===d.type&&(i=new L(n,this,t)),this.v.push(i),d=e[++r];}h!==(null==d?void 0:d.index)&&(n=A.nextNode(),h++);}return o}m(t){let i=0;for(const s of this.v)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class N{constructor(t,i,s,e){var o;this.type=2,this._$AH=w,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cg=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cg}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=P(this,t,i),r(t)?t===w||null==t||""===t?(this._$AH!==w&&this._$AR(),this._$AH=w):t!==this._$AH&&t!==b&&this.$(t):void 0!==t._$litType$?this.T(t):void 0!==t.nodeType?this.k(t):u(t)?this.S(t):this.$(t);}M(t,i=this._$AB){return this._$AA.parentNode.insertBefore(t,i)}k(t){this._$AH!==t&&(this._$AR(),this._$AH=this.M(t));}$(t){this._$AH!==w&&r(this._$AH)?this._$AA.nextSibling.data=t:this.k(l$1.createTextNode(t)),this._$AH=t;}T(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=E.createElement(e.h,this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.m(s);else {const t=new V(o,this),i=t.p(this.options);t.m(s),this.k(i),this._$AH=t;}}_$AC(t){let i=T.get(t.strings);return void 0===i&&T.set(t.strings,i=new E(t)),i}S(t){d(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new N(this.M(h()),this.M(h()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cg=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class S{constructor(t,i,s,e,o){this.type=1,this._$AH=w,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=w;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=P(this,t,i,0),n=!r(t)||t!==this._$AH&&t!==b,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=P(this,e[s+l],i,l),h===b&&(h=this._$AH[l]),n||(n=!r(h)||h!==this._$AH[l]),h===w?t=w:t!==w&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.C(t);}C(t){t===w?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class M extends S{constructor(){super(...arguments),this.type=3;}C(t){this.element[this.name]=t===w?void 0:t;}}const k=i?i.emptyScript:"";class H extends S{constructor(){super(...arguments),this.type=4;}C(t){t&&t!==w?this.element.setAttribute(this.name,k):this.element.removeAttribute(this.name);}}class I extends S{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=P(this,t,i,0))&&void 0!==s?s:w)===b)return;const e=this._$AH,o=t===w&&e!==w||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==w&&(e===w||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class L{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t);}}const z=window.litHtmlPolyfillSupport;null==z||z(E,N),(null!==(t=globalThis.litHtmlVersions)&&void 0!==t?t:globalThis.litHtmlVersions=[]).push("2.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var l,o;class s extends a$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=x(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!1);}render(){return b}}s.finalized=!0,s._$litElement$=!0,null===(l=globalThis.litElementHydrateSupport)||void 0===l||l.call(globalThis,{LitElement:s});const n=globalThis.litElementPolyfillSupport;null==n||n({LitElement:s});(null!==(o=globalThis.litElementVersions)&&void 0!==o?o:globalThis.litElementVersions=[]).push("3.2.0");

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const ERROR = 'error';

class CellView extends s {
  static get styles() {
    return r$2`
      .error {
        display: block;
        border: solid 1px red;
        padding: 1em;
        max-width: 800px;
      }
    `;
  }

  static get properties() {
    return {
      value: {state: true},
      status: {type: String, state: true}
    };
  }

  constructor() {
    super();
    this.status = PENDING;
    this.value = undefined;
    this.observer = {
      fulfilled: (value) => {
        this.status = FULFILLED;
        this.value = value;
        this.dispatchEvent(new Event('change'));
      },
      rejected: (error, name) => {
        this.status = ERROR;
        this.value = { error, name };
        this.dispatchEvent(new Event('change'));
      }
    };
  }

  createRenderRoot() {
    return this;
  }

  render() {
    switch (this.status) {
      case PENDING:
      case FULFILLED:
        return this.value;
      case ERROR:
        return error(this.value.error);
      default:
        return error(`Unrecognized status: ${this.status}.`);
    }
  }
}

function error(message) {
  return $`<span class="error">${message}</span>`;
}

class InputEvent extends Event {
  constructor(value) {
    super('input');
    this.value = value;
  }
}

class RangeText extends s {
  static get styles() {
    return r$2`
      :host {
        text-decoration: underline dashed #888;
        cursor: ew-resize;
      }
    `;
  }

  static get properties() {
    return {
      value: {type: Number},
      step: {type: Number},
      span: {type: Number},
      min: {type: Number},
      max: {type: Number},
      title: {type: String}
    };
  }

  constructor() {
    super();
    this.value = 0;
    this.step = 1;
    this.span = 1;
    this.min = -1000;
    this.max = +1000;
    this.title = 'Draggable text';
    this.addEventListener('click', e => e.stopPropagation());
    this.addEventListener('mousedown', e => this.onMouseDown(e));
  }

  onMouseDown(e) {
    e.stopImmediatePropagation();
    const mx = e.x;
    const mv = +this.value;

    const cursor = this.ownerDocument.body.style.cursor;
    this.ownerDocument.body.style.cursor = 'ew-resize';

    const select = this.style.MozUserSelect;
    this.style.MozUserSelect = 'none';

    const move = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const { step, span, min, max } = this;
      const dx = step * Math.round((e.x - mx) / span);
      const value = Math.max(Math.min(mv + dx, max), min);
      if (this.value !== value) {
        this.value = value;
        this.dispatchEvent(new InputEvent(value));
        this.requestUpdate();
      }
    };

    const up = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.ownerDocument.body.style.cursor = cursor;
      this.style.MozUserSelect = select;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  render() {
    return $`<span title=${this.title}>${this.value}</span>`;
  }
}

const {getPrototypeOf, getOwnPropertyDescriptors} = Object;
getPrototypeOf({});

var EOL = {},
    EOF = {},
    QUOTE = 34,
    NEWLINE = 10,
    RETURN = 13;

function objectConverter(columns) {
  return new Function("d", "return {" + columns.map(function(name, i) {
    return JSON.stringify(name) + ": d[" + i + "] || \"\"";
  }).join(",") + "}");
}

function customConverter(columns, f) {
  var object = objectConverter(columns);
  return function(row, i) {
    return f(object(row), i, columns);
  };
}

// Compute unique columns in order of discovery.
function inferColumns(rows) {
  var columnSet = Object.create(null),
      columns = [];

  rows.forEach(function(row) {
    for (var column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column);
      }
    }
  });

  return columns;
}

function pad(value, width) {
  var s = value + "", length = s.length;
  return length < width ? new Array(width - length + 1).join(0) + s : s;
}

function formatYear(year) {
  return year < 0 ? "-" + pad(-year, 6)
    : year > 9999 ? "+" + pad(year, 6)
    : pad(year, 4);
}

function formatDate(date) {
  var hours = date.getUTCHours(),
      minutes = date.getUTCMinutes(),
      seconds = date.getUTCSeconds(),
      milliseconds = date.getUTCMilliseconds();
  return isNaN(date) ? "Invalid Date"
      : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
      + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
      : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
      : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
      : "");
}

function dsv$1(delimiter) {
  var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
      DELIMITER = delimiter.charCodeAt(0);

  function parse(text, f) {
    var convert, columns, rows = parseRows(text, function(row, i) {
      if (convert) return convert(row, i - 1);
      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
    });
    rows.columns = columns || [];
    return rows;
  }

  function parseRows(text, f) {
    var rows = [], // output rows
        N = text.length,
        I = 0, // current character index
        n = 0, // current line number
        t, // current token
        eof = N <= 0, // current token followed by EOF?
        eol = false; // current token followed by EOL?

    // Strip the trailing newline.
    if (text.charCodeAt(N - 1) === NEWLINE) --N;
    if (text.charCodeAt(N - 1) === RETURN) --N;

    function token() {
      if (eof) return EOF;
      if (eol) return eol = false, EOL;

      // Unescape quotes.
      var i, j = I, c;
      if (text.charCodeAt(j) === QUOTE) {
        while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
        if ((i = I) >= N) eof = true;
        else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
        return text.slice(j + 1, i - 1).replace(/""/g, "\"");
      }

      // Find next delimiter or newline.
      while (I < N) {
        if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
        else if (c !== DELIMITER) continue;
        return text.slice(j, i);
      }

      // Return last token before EOF.
      return eof = true, text.slice(j, N);
    }

    while ((t = token()) !== EOF) {
      var row = [];
      while (t !== EOL && t !== EOF) row.push(t), t = token();
      if (f && (row = f(row, n++)) == null) continue;
      rows.push(row);
    }

    return rows;
  }

  function preformatBody(rows, columns) {
    return rows.map(function(row) {
      return columns.map(function(column) {
        return formatValue(row[column]);
      }).join(delimiter);
    });
  }

  function format(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
  }

  function formatBody(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return preformatBody(rows, columns).join("\n");
  }

  function formatRows(rows) {
    return rows.map(formatRow).join("\n");
  }

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(value) {
    return value == null ? ""
        : value instanceof Date ? formatDate(value)
        : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
        : value;
  }

  return {
    parse: parse,
    parseRows: parseRows,
    format: format,
    formatBody: formatBody,
    formatRows: formatRows,
    formatRow: formatRow,
    formatValue: formatValue
  };
}

var csv = dsv$1(",");

var csvParse = csv.parse;
var csvParseRows = csv.parseRows;

var tsv = dsv$1("\t");

var tsvParse = tsv.parse;
var tsvParseRows = tsv.parseRows;

function autoType(object) {
  for (var key in object) {
    var value = object[key].trim(), number, m;
    if (!value) value = null;
    else if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (value === "NaN") value = NaN;
    else if (!isNaN(number = +value)) value = number;
    else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
      if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
      value = new Date(value);
    }
    else continue;
    object[key] = value;
  }
  return object;
}

// https://github.com/d3/d3-dsv/issues/45
const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

const metas = new Map;
const queue$1 = [];
const map$2 = queue$1.map;
const some = queue$1.some;
const hasOwnProperty = queue$1.hasOwnProperty;
const origin = "https://cdn.jsdelivr.net/npm/";
const identifierRe = /^((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?(?:\/(.*))?$/;
const versionRe = /^\d+\.\d+\.\d+(-[\w-.+]+)?$/;
const extensionRe = /\.[^/]*$/;
const mains = ["unpkg", "jsdelivr", "browser", "main"];

class RequireError extends Error {
  constructor(message) {
    super(message);
  }
}

RequireError.prototype.name = RequireError.name;

function main(meta) {
  for (const key of mains) {
    const value = meta[key];
    if (typeof value === "string") {
      return extensionRe.test(value) ? value : `${value}.js`;
    }
  }
}

function parseIdentifier(identifier) {
  const match = identifierRe.exec(identifier);
  return match && {
    name: match[1],
    version: match[2],
    path: match[3]
  };
}

function resolveMeta(target) {
  const url = `${origin}${target.name}${target.version ? `@${target.version}` : ""}/package.json`;
  let meta = metas.get(url);
  if (!meta) metas.set(url, meta = fetch(url).then(response => {
    if (!response.ok) throw new RequireError("unable to load package.json");
    if (response.redirected && !metas.has(response.url)) metas.set(response.url, meta);
    return response.json();
  }));
  return meta;
}

async function resolve$1(name, base) {
  if (name.startsWith(origin)) name = name.substring(origin.length);
  if (/^(\w+:)|\/\//i.test(name)) return name;
  if (/^[.]{0,2}\//i.test(name)) return new URL(name, base == null ? location : base).href;
  if (!name.length || /^[\s._]/.test(name) || /\s$/.test(name)) throw new RequireError("illegal name");
  const target = parseIdentifier(name);
  if (!target) return `${origin}${name}`;
  if (!target.version && base != null && base.startsWith(origin)) {
    const meta = await resolveMeta(parseIdentifier(base.substring(origin.length)));
    target.version = meta.dependencies && meta.dependencies[target.name] || meta.peerDependencies && meta.peerDependencies[target.name];
  }
  if (target.path && !extensionRe.test(target.path)) target.path += ".js";
  if (target.path && target.version && versionRe.test(target.version)) return `${origin}${target.name}@${target.version}/${target.path}`;
  const meta = await resolveMeta(target);
  return `${origin}${meta.name}@${meta.version}/${target.path || main(meta) || "index.js"}`;
}

var require = requireFrom(resolve$1);

function requireFrom(resolver) {
  const cache = new Map;
  const requireBase = requireRelative(null);

  function requireAbsolute(url) {
    if (typeof url !== "string") return url;
    let module = cache.get(url);
    if (!module) cache.set(url, module = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.onload = () => {
        try { resolve(queue$1.pop()(requireRelative(url))); }
        catch (error) { reject(new RequireError("invalid module")); }
        script.remove();
      };
      script.onerror = () => {
        reject(new RequireError("unable to load module"));
        script.remove();
      };
      script.async = true;
      script.src = url;
      window.define = define;
      document.head.appendChild(script);
    }));
    return module;
  }

  function requireRelative(base) {
    return name => Promise.resolve(resolver(name, base)).then(requireAbsolute);
  }

  function requireAlias(aliases) {
    return requireFrom((name, base) => {
      if (name in aliases) {
        name = aliases[name], base = null;
        if (typeof name !== "string") return name;
      }
      return resolver(name, base);
    });
  }

  function require(name) {
    return arguments.length > 1
        ? Promise.all(map$2.call(arguments, requireBase)).then(merge)
        : requireBase(name);
  }

  require.alias = requireAlias;
  require.resolve = resolver;

  return require;
}

function merge(modules) {
  const o = {};
  for (const m of modules) {
    for (const k in m) {
      if (hasOwnProperty.call(m, k)) {
        if (m[k] == null) Object.defineProperty(o, k, {get: getter(m, k)});
        else o[k] = m[k];
      }
    }
  }
  return o;
}

function getter(object, name) {
  return () => object[name];
}

function isbuiltin(name) {
  name = name + "";
  return name === "exports" || name === "module";
}

function define(name, dependencies, factory) {
  const n = arguments.length;
  if (n < 2) factory = name, dependencies = [];
  else if (n < 3) factory = dependencies, dependencies = typeof name === "string" ? [] : name;
  queue$1.push(some.call(dependencies, isbuiltin) ? require => {
    const exports = {};
    const module = {exports};
    return Promise.all(map$2.call(dependencies, name => {
      name = name + "";
      return name === "exports" ? exports : name === "module" ? module : require(name);
    })).then(dependencies => {
      factory.apply(null, dependencies);
      return module.exports;
    });
  } : require => {
    return Promise.all(map$2.call(dependencies, require)).then(dependencies => {
      return typeof factory === "function" ? factory.apply(null, dependencies) : factory;
    });
  });
}

define.amd = {};

function dependency(name, version, main) {
  return {
    resolve(path = main) {
      return `https://cdn.jsdelivr.net/npm/${name}@${version}/${path}`;
    }
  };
}

const d3 = dependency("d3", "7.4.4", "dist/d3.min.js");
const inputs = dependency("@observablehq/inputs", "0.10.4", "dist/inputs.min.js");
const plot = dependency("@observablehq/plot", "0.4.3", "dist/plot.umd.min.js");
const graphviz = dependency("@observablehq/graphviz", "0.2.1", "dist/graphviz.min.js");
const highlight = dependency("@observablehq/highlight.js", "2.0.0", "highlight.min.js");
const katex = dependency("@observablehq/katex", "0.11.1", "dist/katex.min.js");
const lodash = dependency("lodash", "4.17.21", "lodash.min.js");
const htl = dependency("htl", "0.3.1", "dist/htl.min.js");
const jszip = dependency("jszip", "3.9.1", "dist/jszip.min.js");
const marked = dependency("marked", "0.3.12", "marked.min.js");
const sql = dependency("sql.js", "1.6.2", "dist/sql-wasm.js");
const vega = dependency("vega", "5.22.1", "build/vega.min.js");
const vegalite = dependency("vega-lite", "5.2.0", "build/vega-lite.min.js");
const vegaliteApi = dependency("vega-lite-api", "5.0.0", "build/vega-lite-api.min.js");
const arrow = dependency("apache-arrow", "4.0.1", "Arrow.es2015.min.js");
const arquero = dependency("arquero", "4.8.8", "dist/arquero.min.js");
const topojson = dependency("topojson-client", "3.1.0", "dist/topojson-client.min.js");
const exceljs = dependency("exceljs", "4.3.0", "dist/exceljs.min.js");
const mermaid$1 = dependency("mermaid", "9.0.0", "dist/mermaid.min.js");

async function sqlite(require) {
  const init = await require(sql.resolve());
  return init({locateFile: file => sql.resolve(`dist/${file}`)});
}

class SQLiteDatabaseClient {
  constructor(db) {
    Object.defineProperties(this, {
      _db: {value: db}
    });
  }
  static async open(source) {
    const [SQL, buffer] = await Promise.all([sqlite(require), Promise.resolve(source).then(load$1)]);
    return new SQLiteDatabaseClient(new SQL.Database(buffer));
  }
  async query(query, params) {
    return await exec(this._db, query, params);
  }
  async queryRow(query, params) {
    return (await this.query(query, params))[0] || null;
  }
  async explain(query, params) {
    const rows = await this.query(`EXPLAIN QUERY PLAN ${query}`, params);
    return element$1("pre", {className: "observablehq--inspect"}, [
      text$2(rows.map(row => row.detail).join("\n"))
    ]);
  }
  async describe(object) {
    const rows = await (object === undefined
      ? this.query(`SELECT name FROM sqlite_master WHERE type = 'table'`)
      : this.query(`SELECT * FROM pragma_table_info(?)`, [object]));
    if (!rows.length) throw new Error("Not found");
    const {columns} = rows;
    return element$1("table", {value: rows}, [
      element$1("thead", [element$1("tr", columns.map(c => element$1("th", [text$2(c)])))]),
      element$1("tbody", rows.map(r => element$1("tr", columns.map(c => element$1("td", [text$2(r[c])])))))
    ]);
  }
  async sql(strings, ...args) {
    return this.query(strings.join("?"), args);
  }
}
Object.defineProperty(SQLiteDatabaseClient.prototype, "dialect", {
  value: "sqlite"
});

function load$1(source) {
  return typeof source === "string" ? fetch(source).then(load$1)
    : source instanceof Response || source instanceof Blob ? source.arrayBuffer().then(load$1)
    : source instanceof ArrayBuffer ? new Uint8Array(source)
    : source;
}

async function exec(db, query, params) {
  const [result] = await db.exec(query, params);
  if (!result) return [];
  const {columns, values} = result;
  const rows = values.map(row => Object.fromEntries(row.map((value, i) => [columns[i], value])));
  rows.columns = columns;
  return rows;
}

function element$1(name, props, children) {
  if (arguments.length === 2) children = props, props = undefined;
  const element = document.createElement(name);
  if (props !== undefined) for (const p in props) element[p] = props[p];
  if (children !== undefined) for (const c of children) element.appendChild(c);
  return element;
}

function text$2(value) {
  return document.createTextNode(value);
}

class Workbook {
  constructor(workbook) {
    Object.defineProperties(this, {
      _: {value: workbook},
      sheetNames: {
        value: workbook.worksheets.map((s) => s.name),
        enumerable: true,
      },
    });
  }
  sheet(name, options) {
    const sname =
      typeof name === "number"
        ? this.sheetNames[name]
        : this.sheetNames.includes((name += ""))
        ? name
        : null;
    if (sname == null) throw new Error(`Sheet not found: ${name}`);
    const sheet = this._.getWorksheet(sname);
    return extract(sheet, options);
  }
}

function extract(sheet, {range, headers} = {}) {
  let [[c0, r0], [c1, r1]] = parseRange(range, sheet);
  const headerRow = headers ? sheet._rows[r0++] : null;
  let names = new Set(["#"]);
  for (let n = c0; n <= c1; n++) {
    const value = headerRow ? valueOf(headerRow.findCell(n + 1)) : null;
    let name = (value && value + "") || toColumn(n);
    while (names.has(name)) name += "_";
    names.add(name);
  }
  names = new Array(c0).concat(Array.from(names));

  const output = new Array(r1 - r0 + 1);
  for (let r = r0; r <= r1; r++) {
    const row = (output[r - r0] = Object.create(null, {"#": {value: r + 1}}));
    const _row = sheet.getRow(r + 1);
    if (_row.hasValues)
      for (let c = c0; c <= c1; c++) {
        const value = valueOf(_row.findCell(c + 1));
        if (value != null) row[names[c + 1]] = value;
      }
  }

  output.columns = names.filter(() => true); // Filter sparse columns
  return output;
}

function valueOf(cell) {
  if (!cell) return;
  const {value} = cell;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if (value.formula || value.sharedFormula) {
      return value.result && value.result.error ? NaN : value.result;
    }
    if (value.richText) {
      return richText(value);
    }
    if (value.text) {
      let {text} = value;
      if (text.richText) text = richText(text);
      return value.hyperlink && value.hyperlink !== text
        ? `${value.hyperlink} ${text}`
        : text;
    }
    return value;
  }
  return value;
}

function richText(value) {
  return value.richText.map((d) => d.text).join("");
}

function parseRange(specifier = ":", {columnCount, rowCount}) {
  specifier += "";
  if (!specifier.match(/^[A-Z]*\d*:[A-Z]*\d*$/))
    throw new Error("Malformed range specifier");
  const [[c0 = 0, r0 = 0], [c1 = columnCount - 1, r1 = rowCount - 1]] =
    specifier.split(":").map(fromCellReference);
  return [
    [c0, r0],
    [c1, r1],
  ];
}

// Returns the default column name for a zero-based column index.
// For example: 0 -> "A", 1 -> "B", 25 -> "Z", 26 -> "AA", 27 -> "AB".
function toColumn(c) {
  let sc = "";
  c++;
  do {
    sc = String.fromCharCode(64 + (c % 26 || 26)) + sc;
  } while ((c = Math.floor((c - 1) / 26)));
  return sc;
}

// Returns the zero-based indexes from a cell reference.
// For example: "A1" -> [0, 0], "B2" -> [1, 1], "AA10" -> [26, 9].
function fromCellReference(s) {
  const [, sc, sr] = s.match(/^([A-Z]*)(\d*)$/);
  let c = 0;
  if (sc)
    for (let i = 0; i < sc.length; i++)
      c += Math.pow(26, sc.length - i - 1) * (sc.charCodeAt(i) - 64);
  return [c ? c - 1 : undefined, sr ? +sr - 1 : undefined];
}

async function remote_fetch(file) {
  const response = await fetch(await file.url());
  if (!response.ok) throw new Error(`Unable to load file: ${file.name}`);
  return response;
}

async function dsv(file, delimiter, {array = false, typed = false} = {}) {
  const text = await file.text();
  return (delimiter === "\t"
      ? (array ? tsvParseRows : tsvParse)
      : (array ? csvParseRows : csvParse))(text, typed && autoType);
}

class AbstractFile {
  constructor(name) {
    Object.defineProperty(this, "name", {value: name, enumerable: true});
  }
  async blob() {
    return (await remote_fetch(this)).blob();
  }
  async arrayBuffer() {
    return (await remote_fetch(this)).arrayBuffer();
  }
  async text() {
    return (await remote_fetch(this)).text();
  }
  async json() {
    return (await remote_fetch(this)).json();
  }
  async stream() {
    return (await remote_fetch(this)).body;
  }
  async csv(options) {
    return dsv(this, ",", options);
  }
  async tsv(options) {
    return dsv(this, "\t", options);
  }
  async image(props) {
    const url = await this.url();
    return new Promise((resolve, reject) => {
      const i = new Image();
      if (new URL(url, document.baseURI).origin !== new URL(location).origin) {
        i.crossOrigin = "anonymous";
      }
      Object.assign(i, props);
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error(`Unable to load file: ${this.name}`));
      i.src = url;
    });
  }
  async arrow() {
    const [Arrow, response] = await Promise.all([require(arrow.resolve()), remote_fetch(this)]);
    return Arrow.Table.from(response);
  }
  async sqlite() {
    return SQLiteDatabaseClient.open(remote_fetch(this));
  }
  async zip() {
    const [JSZip, buffer] = await Promise.all([require(jszip.resolve()), this.arrayBuffer()]);
    return new ZipArchive(await JSZip.loadAsync(buffer));
  }
  async xml(mimeType = "application/xml") {
    return (new DOMParser).parseFromString(await this.text(), mimeType);
  }
  async html() {
    return this.xml("text/html");
  }
  async xlsx() {
    const [ExcelJS, buffer] = await Promise.all([require(exceljs.resolve()), this.arrayBuffer()]);
    return new Workbook(await new ExcelJS.Workbook().xlsx.load(buffer));
  }
}

class FileAttachment extends AbstractFile {
  constructor(url, name) {
    super(name);
    Object.defineProperty(this, "_url", {value: url});
  }
  async url() {
    return (await this._url) + "";
  }
}

function NoFileAttachments(name) {
  throw new Error(`File not found: ${name}`);
}

function FileAttachments(resolve) {
  return Object.assign(
    name => {
      const url = resolve(name += ""); // Returns a Promise, string, or null.
      if (url == null) throw new Error(`File not found: ${name}`);
      return new FileAttachment(url, name);
    },
    {prototype: FileAttachment.prototype} // instanceof
  );
}

class ZipArchive {
  constructor(archive) {
    Object.defineProperty(this, "_", {value: archive});
    this.filenames = Object.keys(archive.files).filter(name => !archive.files[name].dir);
  }
  file(path) {
    const object = this._.file(path += "");
    if (!object || object.dir) throw new Error(`file not found: ${path}`);
    return new ZipArchiveEntry(object);
  }
}

class ZipArchiveEntry extends AbstractFile {
  constructor(object) {
    super(object.name);
    Object.defineProperty(this, "_", {value: object});
    Object.defineProperty(this, "_url", {writable: true});
  }
  async url() {
    return this._url || (this._url = this.blob().then(URL.createObjectURL));
  }
  async blob() {
    return this._.async("blob");
  }
  async arrayBuffer() {
    return this._.async("arraybuffer");
  }
  async text() {
    return this._.async("text");
  }
  async json() {
    return JSON.parse(await this.text());
  }
}

function canvas(width, height) {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function context2d(width, height, dpi) {
  if (dpi == null) dpi = devicePixelRatio;
  var canvas = document.createElement("canvas");
  canvas.width = width * dpi;
  canvas.height = height * dpi;
  canvas.style.width = width + "px";
  var context = canvas.getContext("2d");
  context.scale(dpi, dpi);
  return context;
}

function download(value, name = "untitled", label = "Save") {
  const a = document.createElement("a");
  const b = a.appendChild(document.createElement("button"));
  b.textContent = label;
  a.download = name;

  async function reset() {
    await new Promise(requestAnimationFrame);
    URL.revokeObjectURL(a.href);
    a.removeAttribute("href");
    b.textContent = label;
    b.disabled = false;
  }

  a.onclick = async event => {
    b.disabled = true;
    if (a.href) return reset(); // Already saved.
    b.textContent = "Saving…";
    try {
      const object = await (typeof value === "function" ? value() : value);
      b.textContent = "Download";
      a.href = URL.createObjectURL(object); // eslint-disable-line require-atomic-updates
    } catch (ignore) {
      b.textContent = label;
    }
    if (event.eventPhase) return reset(); // Already downloaded.
    b.disabled = false;
  };

  return a;
}

var namespaces = {
  math: "http://www.w3.org/1998/Math/MathML",
  svg: "http://www.w3.org/2000/svg",
  xhtml: "http://www.w3.org/1999/xhtml",
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

function element(name, attributes) {
  var prefix = name += "", i = prefix.indexOf(":"), value;
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  var element = namespaces.hasOwnProperty(prefix) // eslint-disable-line no-prototype-builtins
      ? document.createElementNS(namespaces[prefix], name)
      : document.createElement(name);
  if (attributes) for (var key in attributes) {
    prefix = key, i = prefix.indexOf(":"), value = attributes[key];
    if (i >= 0 && (prefix = key.slice(0, i)) !== "xmlns") key = key.slice(i + 1);
    if (namespaces.hasOwnProperty(prefix)) element.setAttributeNS(namespaces[prefix], key, value); // eslint-disable-line no-prototype-builtins
    else element.setAttribute(key, value);
  }
  return element;
}

function input$1(type) {
  var input = document.createElement("input");
  if (type != null) input.type = type;
  return input;
}

function range$1(min, max, step) {
  if (arguments.length === 1) max = min, min = null;
  var input = document.createElement("input");
  input.min = min = min == null ? 0 : +min;
  input.max = max = max == null ? 1 : +max;
  input.step = step == null ? "any" : step = +step;
  input.type = "range";
  return input;
}

function select(values) {
  var select = document.createElement("select");
  Array.prototype.forEach.call(values, function(value) {
    var option = document.createElement("option");
    option.value = option.textContent = value;
    select.appendChild(option);
  });
  return select;
}

function svg$1(width, height) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", [0, 0, width, height]);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  return svg;
}

function text$1(value) {
  return document.createTextNode(value);
}

var count = 0;

function uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}

function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function() {
  return "url(" + this.href + ")";
};

var DOM = {
  canvas: canvas,
  context2d: context2d,
  download: download,
  element: element,
  input: input$1,
  range: range$1,
  select: select,
  svg: svg$1,
  text: text$1,
  uid: uid
};

function buffer(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader;
    reader.onload = function() { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function text(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader;
    reader.onload = function() { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function url(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader;
    reader.onload = function() { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

var Files = {
  buffer: buffer,
  text: text,
  url: url
};

function that() {
  return this;
}

function disposable(value, dispose) {
  let done = false;
  if (typeof dispose !== "function") {
    throw new Error("dispose is not a function");
  }
  return {
    [Symbol.iterator]: that,
    next: () => done ? {done: true} : (done = true, {done: false, value}),
    return: () => (done = true, dispose(value), {done: true}),
    throw: () => ({done: done = true})
  };
}

function* filter(iterator, test) {
  var result, index = -1;
  while (!(result = iterator.next()).done) {
    if (test(result.value, ++index)) {
      yield result.value;
    }
  }
}

function observe(initialize) {
  let stale = false;
  let value;
  let resolve;
  const dispose = initialize(change);

  if (dispose != null && typeof dispose !== "function") {
    throw new Error(typeof dispose.then === "function"
        ? "async initializers are not supported"
        : "initializer returned something, but not a dispose function");
  }

  function change(x) {
    if (resolve) resolve(x), resolve = null;
    else stale = true;
    return value = x;
  }

  function next() {
    return {done: false, value: stale
        ? (stale = false, Promise.resolve(value))
        : new Promise(_ => (resolve = _))};
  }

  return {
    [Symbol.iterator]: that,
    throw: () => ({done: true}),
    return: () => (dispose != null && dispose(), {done: true}),
    next
  };
}

function input(input) {
  return observe(function(change) {
    var event = eventof(input), value = valueof(input);
    function inputted() { change(valueof(input)); }
    input.addEventListener(event, inputted);
    if (value !== undefined) change(value);
    return function() { input.removeEventListener(event, inputted); };
  });
}

function valueof(input) {
  switch (input.type) {
    case "range":
    case "number": return input.valueAsNumber;
    case "date": return input.valueAsDate;
    case "checkbox": return input.checked;
    case "file": return input.multiple ? input.files : input.files[0];
    case "select-multiple": return Array.from(input.selectedOptions, o => o.value);
    default: return input.value;
  }
}

function eventof(input) {
  switch (input.type) {
    case "button":
    case "submit":
    case "checkbox": return "click";
    case "file": return "change";
    default: return "input";
  }
}

function* map$1(iterator, transform) {
  var result, index = -1;
  while (!(result = iterator.next()).done) {
    yield transform(result.value, ++index);
  }
}

function queue(initialize) {
  let resolve;
  const queue = [];
  const dispose = initialize(push);

  if (dispose != null && typeof dispose !== "function") {
    throw new Error(typeof dispose.then === "function"
        ? "async initializers are not supported"
        : "initializer returned something, but not a dispose function");
  }

  function push(x) {
    queue.push(x);
    if (resolve) resolve(queue.shift()), resolve = null;
    return x;
  }

  function next() {
    return {done: false, value: queue.length
        ? Promise.resolve(queue.shift())
        : new Promise(_ => (resolve = _))};
  }

  return {
    [Symbol.iterator]: that,
    throw: () => ({done: true}),
    return: () => (dispose != null && dispose(), {done: true}),
    next
  };
}

function* range(start, stop, step) {
  start = +start;
  stop = +stop;
  step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
  var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0;
  while (++i < n) {
    yield start + i * step;
  }
}

function valueAt(iterator, i) {
  if (!isFinite(i = +i) || i < 0 || i !== i | 0) return;
  var result, index = -1;
  while (!(result = iterator.next()).done) {
    if (++index === i) {
      return result.value;
    }
  }
}

function worker(source) {
  const url = URL.createObjectURL(new Blob([source], {type: "text/javascript"}));
  const worker = new Worker(url);
  return disposable(worker, () => {
    worker.terminate();
    URL.revokeObjectURL(url);
  });
}

var Generators = {
  disposable: disposable,
  filter: filter,
  input: input,
  map: map$1,
  observe: observe,
  queue: queue,
  range: range,
  valueAt: valueAt,
  worker: worker
};

function template(render, wrapper) {
  return function(strings) {
    var string = strings[0],
        parts = [], part,
        root = null,
        node, nodes,
        walker,
        i, n, j, m, k = -1;

    // Concatenate the text using comments as placeholders.
    for (i = 1, n = arguments.length; i < n; ++i) {
      part = arguments[i];
      if (part instanceof Node) {
        parts[++k] = part;
        string += "<!--o:" + k + "-->";
      } else if (Array.isArray(part)) {
        for (j = 0, m = part.length; j < m; ++j) {
          node = part[j];
          if (node instanceof Node) {
            if (root === null) {
              parts[++k] = root = document.createDocumentFragment();
              string += "<!--o:" + k + "-->";
            }
            root.appendChild(node);
          } else {
            root = null;
            string += node;
          }
        }
        root = null;
      } else {
        string += part;
      }
      string += strings[i];
    }

    // Render the text.
    root = render(string);

    // Walk the rendered content to replace comment placeholders.
    if (++k > 0) {
      nodes = new Array(k);
      walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null, false);
      while (walker.nextNode()) {
        node = walker.currentNode;
        if (/^o:/.test(node.nodeValue)) {
          nodes[+node.nodeValue.slice(2)] = node;
        }
      }
      for (i = 0; i < k; ++i) {
        if (node = nodes[i]) {
          node.parentNode.replaceChild(parts[i], node);
        }
      }
    }

    // Is the rendered content
    // … a parent of a single child? Detach and return the child.
    // … a document fragment? Replace the fragment with an element.
    // … some other node? Return it.
    return root.childNodes.length === 1 ? root.removeChild(root.firstChild)
        : root.nodeType === 11 ? ((node = wrapper()).appendChild(root), node)
        : root;
  };
}

var html = template(function(string) {
  var template = document.createElement("template");
  template.innerHTML = string.trim();
  return document.importNode(template.content, true);
}, function() {
  return document.createElement("span");
});

function md(require) {
  return require(marked.resolve()).then(function(marked) {
    return template(
      function(string) {
        var root = document.createElement("div");
        root.innerHTML = marked(string, {langPrefix: ""}).trim();
        var code = root.querySelectorAll("pre code[class]");
        if (code.length > 0) {
          require(highlight.resolve()).then(function(hl) {
            code.forEach(function(block) {
              function done() {
                hl.highlightBlock(block);
                block.parentNode.classList.add("observablehq--md-pre");
              }
              if (hl.getLanguage(block.className)) {
                done();
              } else {
                require(highlight.resolve("async-languages/index.js"))
                  .then(index => {
                    if (index.has(block.className)) {
                      return require(highlight.resolve("async-languages/" + index.get(block.className))).then(language => {
                        hl.registerLanguage(block.className, language);
                      });
                    }
                  })
                  .then(done, done);
              }
            });
          });
        }
        return root;
      },
      function() {
        return document.createElement("div");
      }
    );
  });
}

async function mermaid(require) {
  const mer = await require(mermaid$1.resolve());
  mer.initialize({securityLevel: "loose", theme: "neutral"});
  return function mermaid() {
    const root = document.createElement("div");
    root.innerHTML = mer.render(uid().id, String.raw.apply(String, arguments));
    return root.removeChild(root.firstChild);
  };
}

function Mutable(value) {
  let change;
  Object.defineProperties(this, {
    generator: {value: observe(_ => void (change = _))},
    value: {get: () => value, set: x => change(value = x)} // eslint-disable-line no-setter-return
  });
  if (value !== undefined) change(value);
}

function* now() {
  while (true) {
    yield Date.now();
  }
}

function delay(duration, value) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(value);
    }, duration);
  });
}

var timeouts = new Map;

function timeout(now, time) {
  var t = new Promise(function(resolve) {
    timeouts.delete(time);
    var delay = time - now;
    if (!(delay > 0)) throw new Error("invalid time");
    if (delay > 0x7fffffff) throw new Error("too long to wait");
    setTimeout(resolve, delay);
  });
  timeouts.set(time, t);
  return t;
}

function when(time, value) {
  var now;
  return (now = timeouts.get(time = +time)) ? now.then(() => value)
      : (now = Date.now()) >= time ? Promise.resolve(value)
      : timeout(now, time).then(() => value);
}

function tick(duration, value) {
  return when(Math.ceil((Date.now() + 1) / duration) * duration, value);
}

var Promises = {
  delay: delay,
  tick: tick,
  when: when
};

function resolve(name, base) {
  if (/^(\w+:)|\/\//i.test(name)) return name;
  if (/^[.]{0,2}\//i.test(name)) return new URL(name, base == null ? location : base).href;
  if (!name.length || /^[\s._]/.test(name) || /\s$/.test(name)) throw new Error("illegal name");
  return "https://unpkg.com/" + name;
}

function requirer(resolve) {
  return resolve == null ? require : requireFrom(resolve);
}

var svg = template(function(string) {
  var root = document.createElementNS("http://www.w3.org/2000/svg", "g");
  root.innerHTML = string.trim();
  return root;
}, function() {
  return document.createElementNS("http://www.w3.org/2000/svg", "g");
});

var raw = String.raw;

function style(href) {
  return new Promise(function(resolve, reject) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onerror = reject;
    link.onload = resolve;
    document.head.appendChild(link);
  });
}

function tex(require) {
  return Promise.all([
    require(katex.resolve()),
    style(katex.resolve("dist/katex.min.css"))
  ]).then(function(values) {
    var katex = values[0], tex = renderer();

    function renderer(options) {
      return function() {
        var root = document.createElement("div");
        katex.render(raw.apply(String, arguments), root, options);
        return root.removeChild(root.firstChild);
      };
    }

    tex.options = renderer;
    tex.block = renderer({displayMode: true});
    return tex;
  });
}

async function vl(require) {
  const [v, vl, api] = await Promise.all([vega, vegalite, vegaliteApi].map(d => require(d.resolve())));
  return api.register(v, vl);
}

function width() {
  return observe(function(change) {
    var width = change(document.body.clientWidth);
    function resized() {
      var w = document.body.clientWidth;
      if (w !== width) change(width = w);
    }
    window.addEventListener("resize", resized);
    return function() {
      window.removeEventListener("resize", resized);
    };
  });
}

var Library = Object.assign(function Library(resolver) {
  const require = requirer(resolver);
  Object.defineProperties(this, properties({
    FileAttachment: () => NoFileAttachments,
    Arrow: () => require(arrow.resolve()),
    Inputs: () => require(inputs.resolve()).then(Inputs => ({...Inputs, file: Inputs.fileOf(AbstractFile)})),
    Mutable: () => Mutable,
    Plot: () => require(plot.resolve()),
    SQLite: () => sqlite(require),
    SQLiteDatabaseClient: () => SQLiteDatabaseClient,
    _: () => require(lodash.resolve()),
    aq: () => require.alias({"apache-arrow": arrow.resolve()})(arquero.resolve()),
    d3: () => require(d3.resolve()),
    dot: () => require(graphviz.resolve()),
    htl: () => require(htl.resolve()),
    html: () => html,
    md: () => md(require),
    mermaid: () => mermaid(require),
    now,
    require: () => require,
    resolve: () => resolve,
    svg: () => svg,
    tex: () => tex(require),
    topojson: () => require(topojson.resolve()),
    vl: () => vl(require),
    width,

    // Note: these are namespace objects, and thus exposed directly rather than
    // being wrapped in a function. This allows library.Generators to resolve,
    // rather than needing module.value.
    DOM,
    Files,
    Generators,
    Promises
  }));
}, {resolve: require.resolve});

function properties(values) {
  return Object.fromEntries(Object.entries(values).map(property));
}

function property([key, value]) {
  return [key, ({value, writable: true, enumerable: true})];
}

function RuntimeError(message, input) {
  this.message = message + "";
  this.input = input;
}

RuntimeError.prototype = Object.create(Error.prototype);
RuntimeError.prototype.name = "RuntimeError";
RuntimeError.prototype.constructor = RuntimeError;

function generatorish(value) {
  return value
      && typeof value.next === "function"
      && typeof value.return === "function";
}

function load(notebook, library, observer) {
  if (typeof library == "function") observer = library, library = null;
  if (typeof observer !== "function") throw new Error("invalid observer");
  if (library == null) library = new Library();

  const {modules, id} = notebook;
  const map = new Map;
  const runtime = new Runtime(library);
  const main = runtime_module(id);

  function runtime_module(id) {
    let module = map.get(id);
    if (!module) map.set(id, module = runtime.module());
    return module;
  }

  for (const m of modules) {
    const module = runtime_module(m.id);
    let i = 0;
    for (const v of m.variables) {
      if (v.from) module.import(v.remote, v.name, runtime_module(v.from));
      else if (module === main) module.variable(observer(v, i, m.variables)).define(v.name, v.inputs, v.value);
      else module.define(v.name, v.inputs, v.value);
      ++i;
    }
  }

  return runtime;
}

var prototype = Array.prototype;
var map = prototype.map;
var forEach = prototype.forEach;

function constant(x) {
  return function() {
    return x;
  };
}

function identity(x) {
  return x;
}

function rethrow(e) {
  return function() {
    throw e;
  };
}

function noop() {}

var TYPE_NORMAL = 1; // a normal variable
var TYPE_IMPLICIT = 2; // created on reference
var TYPE_DUPLICATE = 3; // created on duplicate definition

var no_observer = {};

function Variable(type, module, observer) {
  if (!observer) observer = no_observer;
  Object.defineProperties(this, {
    _observer: {value: observer, writable: true},
    _definition: {value: variable_undefined, writable: true},
    _duplicate: {value: undefined, writable: true},
    _duplicates: {value: undefined, writable: true},
    _indegree: {value: NaN, writable: true}, // The number of computing inputs.
    _inputs: {value: [], writable: true},
    _invalidate: {value: noop, writable: true},
    _module: {value: module},
    _name: {value: null, writable: true},
    _outputs: {value: new Set, writable: true},
    _promise: {value: Promise.resolve(undefined), writable: true},
    _reachable: {value: observer !== no_observer, writable: true}, // Is this variable transitively visible?
    _rejector: {value: variable_rejector(this)},
    _type: {value: type},
    _value: {value: undefined, writable: true},
    _version: {value: 0, writable: true}
  });
}

Object.defineProperties(Variable.prototype, {
  _pending: {value: variable_pending, writable: true, configurable: true},
  _fulfilled: {value: variable_fulfilled, writable: true, configurable: true},
  _rejected: {value: variable_rejected, writable: true, configurable: true},
  define: {value: variable_define, writable: true, configurable: true},
  delete: {value: variable_delete, writable: true, configurable: true},
  import: {value: variable_import, writable: true, configurable: true}
});

function variable_attach(variable) {
  variable._module._runtime._dirty.add(variable);
  variable._outputs.add(this);
}

function variable_detach(variable) {
  variable._module._runtime._dirty.add(variable);
  variable._outputs.delete(this);
}

function variable_undefined() {
  throw variable_undefined;
}

function variable_rejector(variable) {
  return function(error) {
    if (error === variable_undefined) throw new RuntimeError(variable._name + " is not defined", variable._name);
    if (error instanceof Error && error.message) throw new RuntimeError(error.message, variable._name);
    throw new RuntimeError(variable._name + " could not be resolved", variable._name);
  };
}

function variable_duplicate(name) {
  return function() {
    throw new RuntimeError(name + " is defined more than once");
  };
}

function variable_define(name, inputs, definition) {
  switch (arguments.length) {
    case 1: {
      definition = name, name = inputs = null;
      break;
    }
    case 2: {
      definition = inputs;
      if (typeof name === "string") inputs = null;
      else inputs = name, name = null;
      break;
    }
  }
  return variable_defineImpl.call(this,
    name == null ? null : name + "",
    inputs == null ? [] : map.call(inputs, this._module._resolve, this._module),
    typeof definition === "function" ? definition : constant(definition)
  );
}

function variable_defineImpl(name, inputs, definition) {
  var scope = this._module._scope, runtime = this._module._runtime;

  this._inputs.forEach(variable_detach, this);
  inputs.forEach(variable_attach, this);
  this._inputs = inputs;
  this._definition = definition;
  this._value = undefined;

  // Is this an active variable (that may require disposal)?
  if (definition === noop) runtime._variables.delete(this);
  else runtime._variables.add(this);

  // Did the variable’s name change? Time to patch references!
  if (name !== this._name || scope.get(name) !== this) {
    var error, found;

    if (this._name) { // Did this variable previously have a name?
      if (this._outputs.size) { // And did other variables reference this variable?
        scope.delete(this._name);
        found = this._module._resolve(this._name);
        found._outputs = this._outputs, this._outputs = new Set;
        found._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(this)] = found; }, this);
        found._outputs.forEach(runtime._updates.add, runtime._updates);
        runtime._dirty.add(found).add(this);
        scope.set(this._name, found);
      } else if ((found = scope.get(this._name)) === this) { // Do no other variables reference this variable?
        scope.delete(this._name); // It’s safe to delete!
      } else if (found._type === TYPE_DUPLICATE) { // Do other variables assign this name?
        found._duplicates.delete(this); // This variable no longer assigns this name.
        this._duplicate = undefined;
        if (found._duplicates.size === 1) { // Is there now only one variable assigning this name?
          found = found._duplicates.keys().next().value; // Any references are now fixed!
          error = scope.get(this._name);
          found._outputs = error._outputs, error._outputs = new Set;
          found._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(error)] = found; });
          found._definition = found._duplicate, found._duplicate = undefined;
          runtime._dirty.add(error).add(found);
          runtime._updates.add(found);
          scope.set(this._name, found);
        }
      } else {
        throw new Error;
      }
    }

    if (this._outputs.size) throw new Error;

    if (name) { // Does this variable have a new name?
      if (found = scope.get(name)) { // Do other variables reference or assign this name?
        if (found._type === TYPE_DUPLICATE) { // Do multiple other variables already define this name?
          this._definition = variable_duplicate(name), this._duplicate = definition;
          found._duplicates.add(this);
        } else if (found._type === TYPE_IMPLICIT) { // Are the variable references broken?
          this._outputs = found._outputs, found._outputs = new Set; // Now they’re fixed!
          this._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(found)] = this; }, this);
          runtime._dirty.add(found).add(this);
          scope.set(name, this);
        } else { // Does another variable define this name?
          found._duplicate = found._definition, this._duplicate = definition; // Now they’re duplicates.
          error = new Variable(TYPE_DUPLICATE, this._module);
          error._name = name;
          error._definition = this._definition = found._definition = variable_duplicate(name);
          error._outputs = found._outputs, found._outputs = new Set;
          error._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(found)] = error; });
          error._duplicates = new Set([this, found]);
          runtime._dirty.add(found).add(error);
          runtime._updates.add(found).add(error);
          scope.set(name, error);
        }
      } else {
        scope.set(name, this);
      }
    }

    this._name = name;
  }

  runtime._updates.add(this);
  runtime._compute();
  return this;
}

function variable_import(remote, name, module) {
  if (arguments.length < 3) module = name, name = remote;
  return variable_defineImpl.call(this, name + "", [module._resolve(remote + "")], identity);
}

function variable_delete() {
  return variable_defineImpl.call(this, null, [], noop);
}

function variable_pending() {
  if (this._observer.pending) this._observer.pending();
}

function variable_fulfilled(value) {
  if (this._observer.fulfilled) this._observer.fulfilled(value, this._name);
}

function variable_rejected(error) {
  if (this._observer.rejected) this._observer.rejected(error, this._name);
}

function Module(runtime, builtins = []) {
  Object.defineProperties(this, {
    _runtime: {value: runtime},
    _scope: {value: new Map},
    _builtins: {value: new Map([
      ["invalidation", variable_invalidation],
      ["visibility", variable_visibility],
      ...builtins
    ])},
    _source: {value: null, writable: true}
  });
}

Object.defineProperties(Module.prototype, {
  _copy: {value: module_copy, writable: true, configurable: true},
  _resolve: {value: module_resolve, writable: true, configurable: true},
  redefine: {value: module_redefine, writable: true, configurable: true},
  define: {value: module_define, writable: true, configurable: true},
  derive: {value: module_derive, writable: true, configurable: true},
  import: {value: module_import, writable: true, configurable: true},
  value: {value: module_value, writable: true, configurable: true},
  variable: {value: module_variable, writable: true, configurable: true},
  builtin: {value: module_builtin, writable: true, configurable: true}
});

function module_redefine(name) {
  var v = this._scope.get(name);
  if (!v) throw new RuntimeError(name + " is not defined");
  if (v._type === TYPE_DUPLICATE) throw new RuntimeError(name + " is defined more than once");
  return v.define.apply(v, arguments);
}

function module_define() {
  var v = new Variable(TYPE_NORMAL, this);
  return v.define.apply(v, arguments);
}

function module_import() {
  var v = new Variable(TYPE_NORMAL, this);
  return v.import.apply(v, arguments);
}

function module_variable(observer) {
  return new Variable(TYPE_NORMAL, this, observer);
}

async function module_value(name) {
  var v = this._scope.get(name);
  if (!v) throw new RuntimeError(name + " is not defined");
  if (v._observer === no_observer) {
    v._observer = true;
    this._runtime._dirty.add(v);
  }
  await this._runtime._compute();
  return v._promise;
}

function module_derive(injects, injectModule) {
  var copy = new Module(this._runtime, this._builtins);
  copy._source = this;
  forEach.call(injects, function(inject) {
    if (typeof inject !== "object") inject = {name: inject + ""};
    if (inject.alias == null) inject.alias = inject.name;
    copy.import(inject.name, inject.alias, injectModule);
  });
  Promise.resolve().then(() => {
    const modules = new Set([this]);
    for (const module of modules) {
      for (const variable of module._scope.values()) {
        if (variable._definition === identity) { // import
          const module = variable._inputs[0]._module;
          const source = module._source || module;
          if (source === this) { // circular import-with!
            console.warn("circular module definition; ignoring"); // eslint-disable-line no-console
            return;
          }
          modules.add(source);
        }
      }
    }
    this._copy(copy, new Map);
  });
  return copy;
}

function module_copy(copy, map) {
  copy._source = this;
  map.set(this, copy);
  for (const [name, source] of this._scope) {
    var target = copy._scope.get(name);
    if (target && target._type === TYPE_NORMAL) continue; // injection
    if (source._definition === identity) { // import
      var sourceInput = source._inputs[0],
          sourceModule = sourceInput._module;
      copy.import(sourceInput._name, name, map.get(sourceModule)
        || (sourceModule._source
           ? sourceModule._copy(new Module(copy._runtime, copy._builtins), map) // import-with
           : sourceModule));
    } else {
      copy.define(name, source._inputs.map(variable_name), source._definition);
    }
  }
  return copy;
}

function module_resolve(name) {
  var variable = this._scope.get(name), value;
  if (!variable) {
    variable = new Variable(TYPE_IMPLICIT, this);
    if (this._builtins.has(name)) {
      variable.define(name, constant(this._builtins.get(name)));
    } else if (this._runtime._builtin._scope.has(name)) {
      variable.import(name, this._runtime._builtin);
    } else {
      try {
        value = this._runtime._global(name);
      } catch (error) {
        return variable.define(name, rethrow(error));
      }
      if (value === undefined) {
        this._scope.set(variable._name = name, variable);
      } else {
        variable.define(name, constant(value));
      }
    }
  }
  return variable;
}

function module_builtin(name, value) {
  this._builtins.set(name, value);
}

function variable_name(variable) {
  return variable._name;
}

const frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setImmediate;

var variable_invalidation = {};
var variable_visibility = {};

function Runtime(builtins = new Library, global = window_global) {
  var builtin = this.module();
  Object.defineProperties(this, {
    _dirty: {value: new Set},
    _updates: {value: new Set},
    _precomputes: {value: [], writable: true},
    _computing: {value: null, writable: true},
    _init: {value: null, writable: true},
    _modules: {value: new Map},
    _variables: {value: new Set},
    _disposed: {value: false, writable: true},
    _builtin: {value: builtin},
    _global: {value: global}
  });
  if (builtins) for (var name in builtins) {
    (new Variable(TYPE_IMPLICIT, builtin)).define(name, [], builtins[name]);
  }
}

Object.defineProperties(Runtime, {
  load: {value: load, writable: true, configurable: true}
});

Object.defineProperties(Runtime.prototype, {
  _precompute: {value: runtime_precompute, writable: true, configurable: true},
  _compute: {value: runtime_compute, writable: true, configurable: true},
  _computeSoon: {value: runtime_computeSoon, writable: true, configurable: true},
  _computeNow: {value: runtime_computeNow, writable: true, configurable: true},
  dispose: {value: runtime_dispose, writable: true, configurable: true},
  module: {value: runtime_module, writable: true, configurable: true},
  fileAttachments: {value: FileAttachments, writable: true, configurable: true}
});

function runtime_dispose() {
  this._computing = Promise.resolve();
  this._disposed = true;
  this._variables.forEach(v => {
    v._invalidate();
    v._version = NaN;
  });
}

function runtime_module(define, observer = noop) {
  let module;
  if (define === undefined) {
    if (module = this._init) {
      this._init = null;
      return module;
    }
    return new Module(this);
  }
  module = this._modules.get(define);
  if (module) return module;
  this._init = module = new Module(this);
  this._modules.set(define, module);
  try {
    define(this, observer);
  } finally {
    this._init = null;
  }
  return module;
}

function runtime_precompute(callback) {
  this._precomputes.push(callback);
  this._compute();
}

function runtime_compute() {
  return this._computing || (this._computing = this._computeSoon());
}

function runtime_computeSoon() {
  return new Promise(frame).then(() => this._disposed ? undefined : this._computeNow());
}

async function runtime_computeNow() {
  var queue = [],
      variables,
      variable,
      precomputes = this._precomputes;

  // If there are any paused generators, resume them before computing so they
  // can update (if synchronous) before computing downstream variables.
  if (precomputes.length) {
    this._precomputes = [];
    for (const callback of precomputes) callback();
    await runtime_defer(3);
  }

  // Compute the reachability of the transitive closure of dirty variables.
  // Any newly-reachable variable must also be recomputed.
  // Any no-longer-reachable variable must be terminated.
  variables = new Set(this._dirty);
  variables.forEach(function(variable) {
    variable._inputs.forEach(variables.add, variables);
    const reachable = variable_reachable(variable);
    if (reachable > variable._reachable) {
      this._updates.add(variable);
    } else if (reachable < variable._reachable) {
      variable._invalidate();
    }
    variable._reachable = reachable;
  }, this);

  // Compute the transitive closure of updating, reachable variables.
  variables = new Set(this._updates);
  variables.forEach(function(variable) {
    if (variable._reachable) {
      variable._indegree = 0;
      variable._outputs.forEach(variables.add, variables);
    } else {
      variable._indegree = NaN;
      variables.delete(variable);
    }
  });

  this._computing = null;
  this._updates.clear();
  this._dirty.clear();

  // Compute the indegree of updating variables.
  variables.forEach(function(variable) {
    variable._outputs.forEach(variable_increment);
  });

  do {
    // Identify the root variables (those with no updating inputs).
    variables.forEach(function(variable) {
      if (variable._indegree === 0) {
        queue.push(variable);
      }
    });

    // Compute the variables in topological order.
    while (variable = queue.pop()) {
      variable_compute(variable);
      variable._outputs.forEach(postqueue);
      variables.delete(variable);
    }

    // Any remaining variables are circular, or depend on them.
    variables.forEach(function(variable) {
      if (variable_circular(variable)) {
        variable_error(variable, new RuntimeError("circular definition"));
        variable._outputs.forEach(variable_decrement);
        variables.delete(variable);
      }
    });
  } while (variables.size);

  function postqueue(variable) {
    if (--variable._indegree === 0) {
      queue.push(variable);
    }
  }
}

// We want to give generators, if they’re defined synchronously, a chance to
// update before computing downstream variables. This creates a synchronous
// promise chain of the given depth that we’ll await before recomputing
// downstream variables.
function runtime_defer(depth = 0) {
  let p = Promise.resolve();
  for (let i = 0; i < depth; ++i) p = p.then(() => {});
  return p;
}

function variable_circular(variable) {
  const inputs = new Set(variable._inputs);
  for (const i of inputs) {
    if (i === variable) return true;
    i._inputs.forEach(inputs.add, inputs);
  }
  return false;
}

function variable_increment(variable) {
  ++variable._indegree;
}

function variable_decrement(variable) {
  --variable._indegree;
}

function variable_value(variable) {
  return variable._promise.catch(variable._rejector);
}

function variable_invalidator(variable) {
  return new Promise(function(resolve) {
    variable._invalidate = resolve;
  });
}

function variable_intersector(invalidation, variable) {
  let node = typeof IntersectionObserver === "function" && variable._observer && variable._observer._node;
  let visible = !node, resolve = noop, reject = noop, promise, observer;
  if (node) {
    observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting) && (promise = null, resolve()));
    observer.observe(node);
    invalidation.then(() => (observer.disconnect(), observer = null, reject()));
  }
  return function(value) {
    if (visible) return Promise.resolve(value);
    if (!observer) return Promise.reject();
    if (!promise) promise = new Promise((y, n) => (resolve = y, reject = n));
    return promise.then(() => value);
  };
}

function variable_compute(variable) {
  variable._invalidate();
  variable._invalidate = noop;
  variable._pending();

  const value0 = variable._value;
  const version = ++variable._version;

  // Lazily-constructed invalidation variable; only constructed if referenced as an input.
  let invalidation = null;

  // If the variable doesn’t have any inputs, we can optimize slightly.
  const promise = variable._promise = (variable._inputs.length
      ? Promise.all(variable._inputs.map(variable_value)).then(define)
      : new Promise(resolve => resolve(variable._definition.call(value0))))
    .then(generate);

  // Compute the initial value of the variable.
  function define(inputs) {
    if (variable._version !== version) return;

    // Replace any reference to invalidation with the promise, lazily.
    for (var i = 0, n = inputs.length; i < n; ++i) {
      switch (inputs[i]) {
        case variable_invalidation: {
          inputs[i] = invalidation = variable_invalidator(variable);
          break;
        }
        case variable_visibility: {
          if (!invalidation) invalidation = variable_invalidator(variable);
          inputs[i] = variable_intersector(invalidation, variable);
          break;
        }
      }
    }

    return variable._definition.apply(value0, inputs);
  }

  // If the value is a generator, then retrieve its first value, and dispose of
  // the generator if the variable is invalidated. Note that the cell may
  // already have been invalidated here, in which case we need to terminate the
  // generator immediately!
  function generate(value) {
    if (generatorish(value)) {
      if (variable._version !== version) return void value.return();
      (invalidation || variable_invalidator(variable)).then(variable_return(value));
      return variable_generate(variable, version, value);
    }
    return value;
  }

  promise.then((value) => {
    if (variable._version !== version) return;
    variable._value = value;
    variable._fulfilled(value);
  }, (error) => {
    if (variable._version !== version) return;
    variable._value = undefined;
    variable._rejected(error);
  });
}

function variable_generate(variable, version, generator) {
  const runtime = variable._module._runtime;

  // Retrieve the next value from the generator; if successful, invoke the
  // specified callback. The returned promise resolves to the yielded value, or
  // to undefined if the generator is done.
  function compute(onfulfilled) {
    return new Promise(resolve => resolve(generator.next())).then(({done, value}) => {
      return done ? undefined : Promise.resolve(value).then(onfulfilled);
    });
  }

  // Retrieve the next value from the generator; if successful, fulfill the
  // variable, compute downstream variables, and schedule the next value to be
  // pulled from the generator at the start of the next animation frame. If not
  // successful, reject the variable, compute downstream variables, and return.
  function recompute() {
    const promise = compute((value) => {
      if (variable._version !== version) return;
      postcompute(value, promise).then(() => runtime._precompute(recompute));
      variable._fulfilled(value);
      return value;
    });
    promise.catch((error) => {
      if (variable._version !== version) return;
      postcompute(undefined, promise);
      variable._rejected(error);
    });
  }

  // After the generator fulfills or rejects, set its current value, promise,
  // and schedule any downstream variables for update.
  function postcompute(value, promise) {
    variable._value = value;
    variable._promise = promise;
    variable._outputs.forEach(runtime._updates.add, runtime._updates);
    return runtime._compute();
  }

  // When retrieving the first value from the generator, the promise graph is
  // already established, so we only need to queue the next pull.
  return compute((value) => {
    if (variable._version !== version) return;
    runtime._precompute(recompute);
    return value;
  });
}

function variable_error(variable, error) {
  variable._invalidate();
  variable._invalidate = noop;
  variable._pending();
  ++variable._version;
  variable._indegree = NaN;
  (variable._promise = Promise.reject(error)).catch(noop);
  variable._value = undefined;
  variable._rejected(error);
}

function variable_return(generator) {
  return function() {
    generator.return();
  };
}

function variable_reachable(variable) {
  if (variable._observer !== no_observer) return true; // Directly reachable.
  var outputs = new Set(variable._outputs);
  for (const output of outputs) {
    if (output._observer !== no_observer) return true;
    output._outputs.forEach(outputs.add, outputs);
  }
  return false;
}

function window_global(name) {
  return window[name];
}

class ObservableRuntime {
  constructor() {
    this.runtime = new Runtime();
    this.main = this.runtime.module();
  }

  redefine(name, defn, inputs = []) {
    this.main.redefine(name, inputs, defn);
  }

  variable(name, defn, inputs = [], observer) {
    this.main.variable(observer).define(name, inputs, defn);
  }

  module(define, inject) {
    const mod = this.runtime.module(define);
    return inject ? mod.derive(inject, this.main) : mod;
  }

  import(from, name, alias = name) {
    this.main.import(name, alias, from);
  }

  value(name) {
    return this.main.value(name);
  }

  define(defs, observer) {
    const mods = new Map;
    defs.forEach(def => {
      if (def.module) {
        const [id, define, inject] = def.module;
        mods.set(id, this.module(define, inject));
      } else if (def.import) {
        const [id, name, alias] = def.import;
        this.import(mods.get(id), name, alias);
      } else if (def.define) {
        const [name, inputs, defn] = def.define;
        this.variable(name, defn, inputs, observer(def));
      }
    });
  }

  handler(id) {
    return async (e) => {
      // retrieve handler and variables from runtime
      const [handler, vars] = await this.value(id);
      const values = await Promise.all(vars.map(name => this.value(name)));

      // populate proxy object with variable values
      const proxy = Object.create(null);
      values.forEach((value, i) => proxy[vars[i]] = value);

      // invoke event handler
      await handler(proxy)(e);

      // propagate proxied assignments back to the runtime
      values.forEach((value, i) => {
        const name = vars[i];
        if (value !== proxy[name]) {
          this.redefine(name, proxy[name]);
        }
      });
    }
  }
}

async function binding(runtime, name) {
  return new Binding(runtime, name, await runtime.value(name));
}

class Binding {
  constructor(runtime, name, value) {
    this.runtime = runtime;
    this.name = name;
    this.value = value;
    this.enabled = true;
    this.inputs = new Map;

    // observe changes to the variable within the runtime
    runtime.variable(null, x => x, [name], {
      fulfilled: value => {
        if (this.enabled) this.update(value);
        else this.enabled = true;
      }
    });
  }

  /**
   * Add an input to the binding group.
   */
  add(input, event = _eventof(input), valueof = _valueof) {
    // set input value to shared variable value
    valueof(input, this.value);

    // register bindings
    const listener = () => this.enabled && this.update(valueof(input));
    this.inputs.set(input, { input, event, listener, valueof });
    input.addEventListener(event, listener);
    return this;
  }

  /**
   * Add a changeable cell value to the binding group.
   */
  addCell(cell, event, valueof) {
    let prev;
    cell.addEventListener('change', async () => {
      const next = cell.value;
      if (next === prev) return;
      if (prev) this.delete(prev);
      this.add(prev = next, event, valueof);
    });
    return this;
  }

  /**
   * Delete an input from the binding group.
   */
  delete(input) {
    const { event, listener } = this.inputs.get(input);
    input.removeEventListener(event, listener);
    this.inputs.delete(input);
  }

  /**
   * Update the value of the binding group.
   */
  update(value) {
    if (this.value === value) {
      return;
    }

    // update bound inputs as needed
    for (const { input, event, valueof } of this.inputs.values()) {
      if (valueof(input) !== value) {
        this.enabled = false;
        valueof(input, value);
        input.dispatchEvent(new Event(event));
        this.enabled = true;
      }
    }

    // update shared variable
    this.enabled = false;
    this.value = value;
    this.runtime.redefine(this.name, value);
  }
}

/**
 * Get/set the state value of an input element.
 */
function _valueof(input, value) {
  if (arguments.length > 1) {
    switch (input.type) {
      case 'date': return (input.valueAsDate = value);
      case 'checkbox': return (input.checked = value);
      default: return (input.value = value);
    }
  } else {
    switch (input.type) {
      case 'range':
      case 'number': return input.valueAsNumber;
      case 'date': return input.valueAsDate;
      case 'checkbox': return input.checked;
      default: return input.value;
    }
  }
}

/**
 * Get the update event type for an input element.
 */
function _eventof(input) {
  switch (input.type) {
    case 'button':
    case 'submit':
    case 'checkbox': return 'click';
    default: return 'input';
  }
}

const CELL_VIEW = 'cell-view';
const DATA_ATTR = 'data-attr';
const DATA_CELL = 'data-cell';
const DATA_BIND = 'data-bind';

function hydrate(runtime, root, module, bind = {}) {
  const {
    cells = () => [],
    attrs = () => [],
    event = () => []
  } = module;

  const resolve = resolver(root);
  runtime.define(cells(), observeCells(root));
  runtime.define(attrs(), observeAttrs(resolve, bind.attrs));
  runtime.define(event(), observeEvent(resolve, bind.events, runtime));
  createBindings(root, runtime);
}

function resolver(root) {
  const map = new Map;
  root.querySelectorAll(`[${DATA_ATTR}]`).forEach(node => {
    map.set(node.getAttribute(DATA_ATTR), node);
  });
  return el => typeof el === 'object' ? el : map.get(el);
}

function observeCells(root) {
  const map = new Map;
  root.querySelectorAll(CELL_VIEW).forEach(node => {
    map.set(+node.getAttribute(DATA_CELL), node.observer);
  });
  return def => map.get(def.cell);
}

function observeAttrs(resolve, attrs) {
  return def => {
    const [target, name] = attrs[def.cell];
    const node = resolve(target);
    return {
      fulfilled(value) {
        node.setAttribute(name, value);
      },
      rejected(err) {
        console.error(err);
      }
    };
  };
}

function observeEvent(resolve, event, runtime) {
  return def => {
    const { define: [id], cell } = def;
    const [source, name] = event[cell];
    const node = resolve(source);
    node.addEventListener(name, runtime.handler(id));
    return {
      rejected(err) {
        console.error(err);
      }
    };
  };
}

function createBindings(root, runtime) {
  // collect input elements with declared bindings
  const bind = new Map;
  root.querySelectorAll(`[${DATA_BIND}]`).forEach(el => {
    const name = el.getAttribute(DATA_BIND);
    bind.has(name) ? bind.get(name).push(el) : bind.set(name, [el]);
  });

  // instantiate bindings
  const add = (b, el) => {
    el.tagName.toLowerCase() === CELL_VIEW ? b.addCell(el) : b.add(el);
  };
  bind.forEach((list, name) => {
    binding(runtime, name).then(b => {
      list.forEach(el => add(b, el));
    });
  });
}

function cells() {
function _1(){return(
128
)}

function _2(Inputs){return(
Inputs.range([0, 255], {step: 1})
)}

function _3(Inputs){return(
Inputs.range([0, 255], {step: 1})
)}

return [
  {define:["x", [], _1], cell:0},
  {define:["viewof a", ["Inputs"], _2], cell:1},
  {define:["a", ["Generators","viewof a"], (G, _) => G.input(_)]},
  {define:["viewof b", ["Inputs"], _3], cell:2},
  {define:["b", ["Generators","viewof b"], (G, _) => G.input(_)]}
];
}

function event() {
function _1(){return([
__proxy__ => {return(
(event) => {__proxy__.x = 0;}
)},
["x"]
])}

return [
  {define:["__eventundefined__", [], _1], cell:0}
];
}

var module = /*#__PURE__*/Object.freeze({
  __proto__: null,
  cells: cells,
  event: event
});

window.customElements.define('cell-view', CellView);
window.customElements.define('range-text', RangeText);
window.addEventListener('DOMContentLoaded', () => {
  hydrate(
    new ObservableRuntime,
    document.querySelector('article'),
    module,
    {"_id":1,"attrs":[],"events":[["1","click",0]]}
  );
});
