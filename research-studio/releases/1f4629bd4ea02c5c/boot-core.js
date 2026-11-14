(function () {
  'use strict';
  const define = (target, name, value) => {
    if (typeof target[name] !== 'function') Object.defineProperty(target, name, { configurable: true, writable: true, value });
  };

  define(Array.prototype, 'at', function at(index) {
    const length = this.length >>> 0, position = Math.trunc(Number(index)) || 0;
    return this[position < 0 ? length + position : position];
  });
  define(String.prototype, 'at', function at(index) {
    const value = String(this), position = Math.trunc(Number(index)) || 0;
    return value.charAt(position < 0 ? value.length + position : position) || undefined;
  });
  define(Array.prototype, 'findLast', function findLast(predicate, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) if (predicate.call(thisArg, this[i], i, this)) return this[i];
    return undefined;
  });
  define(Array.prototype, 'findLastIndex', function findLastIndex(predicate, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) if (predicate.call(thisArg, this[i], i, this)) return i;
    return -1;
  });
  define(Array.prototype, 'flat', function flat(depth) {
    const limit = depth === undefined ? 1 : Math.max(0, Math.trunc(Number(depth)) || 0), result = [];
    const walk = (items, level) => { for (const item of items) { if (Array.isArray(item) && level < limit) walk(item, level + 1); else result.push(item); } };
    walk(this, 0); return result;
  });
  define(Array.prototype, 'flatMap', function flatMap(callback, thisArg) {
    return this.map(callback, thisArg).flat();
  });
  define(Object, 'hasOwn', function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(Object(object), key);
  });
  define(String.prototype, 'replaceAll', function replaceAll(search, replacement) {
    const value = String(this), pattern = search instanceof RegExp ? search : String(search);
    if (search instanceof RegExp) return value.replace(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'), replacement);
    return value.split(pattern).join(replacement);
  });
  if (typeof globalThis.structuredClone !== 'function') {
    globalThis.structuredClone = value => JSON.parse(JSON.stringify(value));
  }
  if (typeof CSS !== 'undefined' && typeof CSS.escape !== 'function') {
    CSS.escape = value => String(value).replace(/[^a-zA-Z0-9_-]/g, character => '\\' + character);
  }

  const dialogPrototype = typeof HTMLDialogElement === 'function' ? HTMLDialogElement.prototype : null;
  if (!dialogPrototype || typeof dialogPrototype.showModal !== 'function') {
    const prototype = dialogPrototype || HTMLElement.prototype;
    const setOpen = (element, open) => { if (open) element.setAttribute('open', ''); else element.removeAttribute('open'); };
    define(prototype, 'showModal', function showModal() {
      if (this.hasAttribute('open')) return;
      setOpen(this, true);
      this.setAttribute('data-modal', '');
      document.documentElement.classList.add('compat-modal-open');
    });
    define(prototype, 'show', function show() { setOpen(this, true); });
    define(prototype, 'close', function close(returnValue) {
      if (!this.hasAttribute('open')) return;
      setOpen(this, false);
      this.removeAttribute('data-modal');
      this.returnValue = returnValue === undefined ? '' : String(returnValue);
      if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('compat-modal-open');
      this.dispatchEvent(new Event('close'));
    });
    if (!('open' in document.createElement('dialog'))) {
      Object.defineProperty(HTMLElement.prototype, 'open', {
        configurable: true,
        get() { return this.hasAttribute('open'); },
        set(value) { setOpen(this, !!value); }
      });
    }
  }
})();

;
var supabase=(function(e){function t(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols==`function`)for(var i=0,r=Object.getOwnPropertySymbols(e);i<r.length;i++)t.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(e,r[i])&&(n[r[i]]=e[r[i]]);return n}function n(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})}let r=e=>e?(...t)=>e(...t):(...e)=>fetch(...e);var i=class extends Error{constructor(e,t=`FunctionsError`,n){super(e),this.name=t,this.context=n}toJSON(){return{name:this.name,message:this.message,context:this.context}}},a=class extends i{constructor(e){super(`Failed to send a request to the Edge Function`,`FunctionsFetchError`,e)}},o=class extends i{constructor(e){super(`Relay Error invoking the Edge Function`,`FunctionsRelayError`,e)}},s=class extends i{constructor(e){super(`Edge Function returned a non-2xx status code`,`FunctionsHttpError`,e)}},c;(function(e){e.Any=`any`,e.ApNortheast1=`ap-northeast-1`,e.ApNortheast2=`ap-northeast-2`,e.ApSouth1=`ap-south-1`,e.ApSoutheast1=`ap-southeast-1`,e.ApSoutheast2=`ap-southeast-2`,e.CaCentral1=`ca-central-1`,e.EuCentral1=`eu-central-1`,e.EuWest1=`eu-west-1`,e.EuWest2=`eu-west-2`,e.EuWest3=`eu-west-3`,e.SaEast1=`sa-east-1`,e.UsEast1=`us-east-1`,e.UsWest1=`us-west-1`,e.UsWest2=`us-west-2`})(c||={});var l=class{constructor(e,{headers:t={},customFetch:n,region:i=c.Any}={}){this.url=e,this.headers=t,this.region=i,this.fetch=r(n)}setAuth(e){this.headers.Authorization=`Bearer ${e}`}invoke(e){return n(this,arguments,void 0,function*(e,t={}){var n;let r,i,c;try{let{headers:n,method:l,body:u,signal:d,timeout:f}=t,p={},{region:m}=t;m||=this.region;let h=new URL(`${this.url}/${e}`);m&&m!==`any`&&(p[`x-region`]=m,h.searchParams.set(`forceFunctionRegion`,m));let g,ee=!!n&&Object.keys(n).some(e=>e.toLowerCase()===`content-type`);u&&!ee?typeof Blob<`u`&&u instanceof Blob||u instanceof ArrayBuffer?(p[`Content-Type`]=u.type||`application/octet-stream`,g=u):typeof u==`string`?(p[`Content-Type`]=`text/plain`,g=u):typeof FormData<`u`&&u instanceof FormData?g=u:(p[`Content-Type`]=`application/json`,g=JSON.stringify(u)):g=u&&typeof u!=`string`&&!(typeof Blob<`u`&&u instanceof Blob)&&!(u instanceof ArrayBuffer)&&!(typeof FormData<`u`&&u instanceof FormData)?JSON.stringify(u):u;let te=d;f&&(i=new AbortController,r=setTimeout(()=>i.abort(),f),d?(te=i.signal,c=()=>i.abort(),d.addEventListener(`abort`,c)):te=i.signal);let _=yield this.fetch(h.toString(),{method:l||`POST`,headers:Object.assign(Object.assign(Object.assign({},p),this.headers),n),body:g,signal:te}).catch(e=>{throw new a(e)}),ne=_.headers.get(`x-relay-error`);if(ne&&ne===`true`)throw new o(_);if(!_.ok)throw new s(_);let re=(_.headers.get(`Content-Type`)??`text/plain`).split(`;`)[0].trim().toLowerCase(),ie;return ie=re===`application/json`?yield _.json():re===`application/octet-stream`||re===`application/pdf`?yield _.blob():re===`text/event-stream`?_:re===`multipart/form-data`?yield _.formData():yield _.text(),{data:ie,error:null,response:_}}catch(e){return{data:null,error:e,response:e instanceof s||e instanceof o?e.context:void 0}}finally{r&&clearTimeout(r),c&&((n=t.signal)==null||n.removeEventListener(`abort`,c))}})}},u=class extends Error{constructor(e){super(e.message),this.name=`PostgrestError`,this.details=e.details,this.hint=e.hint,this.code=e.code}toJSON(){return{name:this.name,message:this.message,details:this.details,hint:this.hint,code:this.code}}};let d=e=>Math.min(1e3*2**e,3e4),f=[520,503],p=[`GET`,`HEAD`,`OPTIONS`];function m(e){"@babel/helpers - typeof";return m=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},m(e)}function h(e,t){if(m(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(m(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function g(e){var t=h(e,`string`);return m(t)==`symbol`?t:t+``}function ee(e,t,n){return(t=g(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function te(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function _(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?te(Object(n),!0).forEach(function(t){ee(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):te(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function ne(e,t){return new Promise(n=>{if(t?.aborted){n();return}let r=setTimeout(()=>{t?.removeEventListener(`abort`,i),n()},e);function i(){clearTimeout(r),n()}t?.addEventListener(`abort`,i)})}function re(e,t,n,r){return!(!r||n>=3||!p.includes(e)||!f.includes(t))}async function ie(e,t,n,r){let i=0;for(;;){let a=_({},n.headers);i>0&&(a[`X-Retry-Count`]=String(i));let o;try{o=await e(t,{method:n.method,headers:a,body:n.body,signal:n.signal})}catch(e){if(e?.name===`AbortError`||e?.code===`ABORT_ERR`||e?.name===`TimeoutError`&&n.signal?.aborted||!p.includes(n.method))throw e;if(r&&i<3){let e=d(i);i++,await ne(e,n.signal);continue}throw e}if(re(n.method,o.status,i,r)){let e=o.headers?.get(`Retry-After`)??null,t=e===null?d(i):Math.max(0,parseInt(e,10)||0)*1e3;await o.text(),i++,await ne(t,n.signal);continue}return o}}var ae=class{constructor(e){this.shouldThrowOnError=!1,this.retryEnabled=!0,this.method=e.method,this.url=e.url,this.headers=new Headers(e.headers),this.schema=e.schema,this.body=e.body,this.shouldThrowOnError=e.shouldThrowOnError??!1,this.signal=e.signal,this.isMaybeSingle=e.isMaybeSingle??!1,this.shouldStripNulls=e.shouldStripNulls??!1,this.urlLengthLimit=e.urlLengthLimit??8e3,this.retryEnabled=e.retry??!0,e.fetch?this.fetch=e.fetch:this.fetch=fetch}throwOnError(){return this.shouldThrowOnError=!0,this}stripNulls(){if(this.headers.get(`Accept`)===`text/csv`)throw Error(`stripNulls() cannot be used with csv()`);return this.shouldStripNulls=!0,this}setHeader(e,t){return this.headers=new Headers(this.headers),this.headers.set(e,t),this}retry(e){return this.retryEnabled=e,this}then(e,t){var n=this;if(this.schema===void 0||([`GET`,`HEAD`].includes(this.method)?this.headers.set(`Accept-Profile`,this.schema):this.headers.set(`Content-Profile`,this.schema)),this.method!==`GET`&&this.method!==`HEAD`&&this.headers.set(`Content-Type`,`application/json`),this.shouldStripNulls){let e=this.headers.get(`Accept`);e===`application/vnd.pgrst.object+json`?this.headers.set(`Accept`,`application/vnd.pgrst.object+json;nulls=stripped`):(!e||e===`application/json`)&&this.headers.set(`Accept`,`application/vnd.pgrst.array+json;nulls=stripped`)}let r=this.fetch,i=(async()=>{let e={};n.headers.forEach((t,n)=>{e[n]=t});let t=await ie(r,n.url.toString(),{method:n.method,headers:e,body:JSON.stringify(n.body,(e,t)=>typeof t==`bigint`?t.toString():t),signal:n.signal},n.retryEnabled);return await n.processResponse(t)})();return this.shouldThrowOnError||(i=i.catch(e=>{let t=``,n=``,r=``,i=e?.cause;if(i){let n=i?.message??``,r=i?.code??``;t=`${e?.name??`FetchError`}: ${e?.message}`,t+=`\n\nCaused by: ${i?.name??`Error`}: ${n}`,r&&(t+=` (${r})`),i?.stack&&(t+=`\n${i.stack}`)}else t=e?.stack??``;let a=this.url.toString().length;return e?.name===`AbortError`||e?.code===`ABORT_ERR`?(r=``,n=`Request was aborted (timeout or manual cancellation)`,a>this.urlLengthLimit&&(n+=`. Note: Your request URL is ${a} characters, which may exceed server limits. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [many IDs])), consider using an RPC function to pass values server-side.`)):(i?.name===`HeadersOverflowError`||i?.code===`UND_ERR_HEADERS_OVERFLOW`)&&(r=``,n=`HTTP headers exceeded server limits (typically 16KB)`,a>this.urlLengthLimit&&(n+=`. Your request URL is ${a} characters. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [200+ IDs])), consider using an RPC function instead.`)),{success:!1,error:{message:`${e?.name??`FetchError`}: ${e?.message}`,details:t,hint:n,code:r},data:null,count:null,status:0,statusText:``}})),i.then(e,t)}async processResponse(e){var t=this;let n=null,r=null,i=null,a=e.status,o=e.statusText;if(e.ok){if(t.method!==`HEAD`){let i=await e.text();if(i!==``)if(t.headers.get(`Accept`)===`text/csv`)r=i;else if(t.headers.get(`Accept`)&&t.headers.get(`Accept`)?.includes(`application/vnd.pgrst.plan+text`))r=i;else try{r=JSON.parse(i)}catch{if(n={message:i},r=null,t.shouldThrowOnError)throw new u({message:i,details:``,hint:``,code:``})}}let s=t.headers.get(`Prefer`)?.match(/count=(exact|planned|estimated)/),c=e.headers.get(`content-range`)?.split(`/`);if(s&&c&&c.length>1&&(i=parseInt(c[1])),t.isMaybeSingle&&Array.isArray(r))if(r.length>1){if(n={code:`PGRST116`,details:`Results contain ${r.length} rows, application/vnd.pgrst.object+json requires 1 row`,hint:null,message:`JSON object requested, multiple (or no) rows returned`},r=null,i=null,a=406,o=`Not Acceptable`,t.shouldThrowOnError)throw new u(_(_({},n),{},{hint:n.hint??``}))}else r=r.length===1?r[0]:null}else{let i=await e.text();try{n=JSON.parse(i),Array.isArray(n)&&e.status===404&&(r=[],n=null,a=200,o=`OK`)}catch{e.status===404&&i===``?(a=204,o=`No Content`):n={message:i}}if(n&&t.shouldThrowOnError)throw new u(n)}return{success:n===null,error:n,data:r,count:i,status:a,statusText:o}}returns(){return this}overrideTypes(){return this}},oe=class extends ae{throwOnError(){return super.throwOnError()}select(e){let t=!1,n=(e??`*`).split(``).map(e=>/\s/.test(e)&&!t?``:(e===`"`&&(t=!t),e)).join(``);return this.url.searchParams.set(`select`,n),this.headers.append(`Prefer`,`return=representation`),this}order(e,{ascending:t=!0,nullsFirst:n,foreignTable:r,referencedTable:i=r}={}){let a=i?`${i}.order`:`order`,o=this.url.searchParams.get(a);return this.url.searchParams.set(a,`${o?`${o},`:``}${e}.${t?`asc`:`desc`}${n===void 0?``:n?`.nullsfirst`:`.nullslast`}`),this}limit(e,{foreignTable:t,referencedTable:n=t}={}){let r=n===void 0?`limit`:`${n}.limit`;return this.url.searchParams.set(r,`${e}`),this}range(e,t,{foreignTable:n,referencedTable:r=n}={}){let i=r===void 0?`offset`:`${r}.offset`,a=r===void 0?`limit`:`${r}.limit`;return this.url.searchParams.set(i,`${e}`),this.url.searchParams.set(a,`${t-e+1}`),this}abortSignal(e){return this.signal=e,this}single(){return this.headers.set(`Accept`,`application/vnd.pgrst.object+json`),this}maybeSingle(){return this.isMaybeSingle=!0,this}csv(){return this.headers.set(`Accept`,`text/csv`),this}geojson(){return this.headers.set(`Accept`,`application/geo+json`),this}explain({analyze:e=!1,verbose:t=!1,settings:n=!1,buffers:r=!1,wal:i=!1,format:a=`text`}={}){let o=[e?`analyze`:null,t?`verbose`:null,n?`settings`:null,r?`buffers`:null,i?`wal`:null].filter(Boolean).join(`|`),s=this.headers.get(`Accept`)??`application/json`;return this.headers.set(`Accept`,`application/vnd.pgrst.plan+${a}; for="${s}"; options=${o};`),this}rollback(){return this.headers.append(`Prefer`,`tx=rollback`),this}returns(){return this}maxAffected(e){return this.headers.append(`Prefer`,`handling=strict`),this.headers.append(`Prefer`,`max-affected=${e}`),this}};let se=RegExp(`[,()]`);var ce=class extends oe{throwOnError(){return super.throwOnError()}eq(e,t){return this.url.searchParams.append(e,`eq.${t}`),this}neq(e,t){return this.url.searchParams.append(e,`neq.${t}`),this}gt(e,t){return this.url.searchParams.append(e,`gt.${t}`),this}gte(e,t){return this.url.searchParams.append(e,`gte.${t}`),this}lt(e,t){return this.url.searchParams.append(e,`lt.${t}`),this}lte(e,t){return this.url.searchParams.append(e,`lte.${t}`),this}like(e,t){return this.url.searchParams.append(e,`like.${t}`),this}likeAllOf(e,t){return this.url.searchParams.append(e,`like(all).{${t.join(`,`)}}`),this}likeAnyOf(e,t){return this.url.searchParams.append(e,`like(any).{${t.join(`,`)}}`),this}ilike(e,t){return this.url.searchParams.append(e,`ilike.${t}`),this}ilikeAllOf(e,t){return this.url.searchParams.append(e,`ilike(all).{${t.join(`,`)}}`),this}ilikeAnyOf(e,t){return this.url.searchParams.append(e,`ilike(any).{${t.join(`,`)}}`),this}regexMatch(e,t){return this.url.searchParams.append(e,`match.${t}`),this}regexIMatch(e,t){return this.url.searchParams.append(e,`imatch.${t}`),this}is(e,t){return this.url.searchParams.append(e,`is.${t}`),this}isDistinct(e,t){return this.url.searchParams.append(e,`isdistinct.${t}`),this}in(e,t){let n=Array.from(new Set(t)).map(e=>typeof e==`string`&&se.test(e)?`"${e}"`:`${e}`).join(`,`);return this.url.searchParams.append(e,`in.(${n})`),this}notIn(e,t){let n=Array.from(new Set(t)).map(e=>typeof e==`string`&&se.test(e)?`"${e}"`:`${e}`).join(`,`);return this.url.searchParams.append(e,`not.in.(${n})`),this}contains(e,t){return typeof t==`string`?this.url.searchParams.append(e,`cs.${t}`):Array.isArray(t)?this.url.searchParams.append(e,`cs.{${t.join(`,`)}}`):this.url.searchParams.append(e,`cs.${JSON.stringify(t)}`),this}containedBy(e,t){return typeof t==`string`?this.url.searchParams.append(e,`cd.${t}`):Array.isArray(t)?this.url.searchParams.append(e,`cd.{${t.join(`,`)}}`):this.url.searchParams.append(e,`cd.${JSON.stringify(t)}`),this}rangeGt(e,t){return this.url.searchParams.append(e,`sr.${t}`),this}rangeGte(e,t){return this.url.searchParams.append(e,`nxl.${t}`),this}rangeLt(e,t){return this.url.searchParams.append(e,`sl.${t}`),this}rangeLte(e,t){return this.url.searchParams.append(e,`nxr.${t}`),this}rangeAdjacent(e,t){return this.url.searchParams.append(e,`adj.${t}`),this}overlaps(e,t){return typeof t==`string`?this.url.searchParams.append(e,`ov.${t}`):this.url.searchParams.append(e,`ov.{${t.join(`,`)}}`),this}textSearch(e,t,{config:n,type:r}={}){let i=``;r===`plain`?i=`pl`:r===`phrase`?i=`ph`:r===`websearch`&&(i=`w`);let a=n===void 0?``:`(${n})`;return this.url.searchParams.append(e,`${i}fts${a}.${t}`),this}match(e){return Object.entries(e).filter(([e,t])=>t!==void 0).forEach(([e,t])=>{this.url.searchParams.append(e,`eq.${t}`)}),this}not(e,t,n){return this.url.searchParams.append(e,`not.${t}.${n}`),this}or(e,{foreignTable:t,referencedTable:n=t}={}){let r=n?`${n}.or`:`or`;return this.url.searchParams.append(r,`(${e})`),this}filter(e,t,n){return this.url.searchParams.append(e,`${t}.${n}`),this}},le=class{constructor(e,{headers:t={},schema:n,fetch:r,urlLengthLimit:i=8e3,retry:a}){this.url=e,this.headers=new Headers(t),this.schema=n,this.fetch=r,this.urlLengthLimit=i,this.retry=a}cloneRequestState(){return{url:new URL(this.url.toString()),headers:new Headers(this.headers)}}select(e,t){let{head:n=!1,count:r}=t??{},i=n?`HEAD`:`GET`,a=!1,o=(e??`*`).split(``).map(e=>/\s/.test(e)&&!a?``:(e===`"`&&(a=!a),e)).join(``),{url:s,headers:c}=this.cloneRequestState();return s.searchParams.set(`select`,o),r&&c.append(`Prefer`,`count=${r}`),new ce({method:i,url:s,headers:c,schema:this.schema,fetch:this.fetch,urlLengthLimit:this.urlLengthLimit,retry:this.retry})}insert(e,{count:t,defaultToNull:n=!0}={}){let{url:r,headers:i}=this.cloneRequestState();if(t&&i.append(`Prefer`,`count=${t}`),n||i.append(`Prefer`,`missing=default`),Array.isArray(e)){let t=e.reduce((e,t)=>e.concat(Object.keys(t)),[]);if(t.length>0){let e=[...new Set(t)].map(e=>`"${e}"`);r.searchParams.set(`columns`,e.join(`,`))}}return new ce({method:`POST`,url:r,headers:i,schema:this.schema,body:e,fetch:this.fetch??fetch,urlLengthLimit:this.urlLengthLimit,retry:this.retry})}upsert(e,{onConflict:t,ignoreDuplicates:n=!1,count:r,defaultToNull:i=!0}={}){let{url:a,headers:o}=this.cloneRequestState();if(o.append(`Prefer`,`resolution=${n?`ignore`:`merge`}-duplicates`),t!==void 0&&a.searchParams.set(`on_conflict`,t),r&&o.append(`Prefer`,`count=${r}`),i||o.append(`Prefer`,`missing=default`),Array.isArray(e)){let t=e.reduce((e,t)=>e.concat(Object.keys(t)),[]);if(t.length>0){let e=[...new Set(t)].map(e=>`"${e}"`);a.searchParams.set(`columns`,e.join(`,`))}}return new ce({method:`POST`,url:a,headers:o,schema:this.schema,body:e,fetch:this.fetch??fetch,urlLengthLimit:this.urlLengthLimit,retry:this.retry})}update(e,{count:t}={}){let{url:n,headers:r}=this.cloneRequestState();return t&&r.append(`Prefer`,`count=${t}`),new ce({method:`PATCH`,url:n,headers:r,schema:this.schema,body:e,fetch:this.fetch??fetch,urlLengthLimit:this.urlLengthLimit,retry:this.retry})}delete({count:e}={}){let{url:t,headers:n}=this.cloneRequestState();return e&&n.append(`Prefer`,`count=${e}`),new ce({method:`DELETE`,url:t,headers:n,schema:this.schema,fetch:this.fetch??fetch,urlLengthLimit:this.urlLengthLimit,retry:this.retry})}};function ue(e,t){try{let t=JSON.parse(e);if(t&&typeof t==`object`&&!Array.isArray(t))return new u({message:String(t.message??e),details:t.details??``,hint:t.hint??``,code:t.code??``})}catch{}return new u({message:e||t,details:``,hint:``,code:``})}function de(e,t,n){let r=e;return{success:!1,error:new u({message:`${r?.name??`FetchError`}: ${r?.message}`,details:``,hint:``,code:``}),data:null,count:null,status:t,statusText:n}}var fe=class e{constructor(e,{headers:t={},schema:n,fetch:r,timeout:i,urlLengthLimit:a=8e3,retry:o}={}){this.url=e,this.headers=new Headers(t),this.schemaName=n,this.urlLengthLimit=a;let s=r??globalThis.fetch;i!==void 0&&i>0?this.fetch=(e,t)=>{let n=new AbortController,r=setTimeout(()=>n.abort(),i),a=t?.signal;if(a){if(a.aborted)return clearTimeout(r),s(e,t);let i=()=>{clearTimeout(r),n.abort()};return a.addEventListener(`abort`,i,{once:!0}),s(e,_(_({},t),{},{signal:n.signal})).finally(()=>{clearTimeout(r),a.removeEventListener(`abort`,i)})}return s(e,_(_({},t),{},{signal:n.signal})).finally(()=>clearTimeout(r))}:this.fetch=s,this.retry=o}from(e){if(!e||typeof e!=`string`||e.trim()===``)throw Error(`Invalid relation name: relation must be a non-empty string.`);return new le(new URL(`${this.url}/${e}`),{headers:new Headers(this.headers),schema:this.schemaName,fetch:this.fetch,urlLengthLimit:this.urlLengthLimit,retry:this.retry})}schema(t){return new e(this.url,{headers:this.headers,schema:t,fetch:this.fetch,urlLengthLimit:this.urlLengthLimit,retry:this.retry})}async getOpenApiSpec(){var e=this;let t=new Headers(e.headers);t.set(`Accept`,`application/openapi+json`),e.schemaName&&t.set(`Accept-Profile`,e.schemaName);let n={};t.forEach((e,t)=>{n[t]=e});let r=e.fetch??globalThis.fetch,i;try{i=await ie(r,`${e.url}/`,{method:`GET`,headers:n},e.retry??!0)}catch(e){return de(e,0,``)}let a;try{a=await i.text()}catch(e){return de(e,i.status,i.statusText)}if(i.ok)try{return{success:!0,error:null,data:JSON.parse(a),count:null,status:i.status,statusText:i.statusText}}catch{}return{success:!1,error:ue(a,i.statusText),data:null,count:null,status:i.status,statusText:i.statusText}}rpc(e,t={},{head:n=!1,get:r=!1,count:i}={}){let a,o=new URL(`${this.url}/rpc/${e}`),s,c=e=>typeof e==`object`&&!!e&&(!Array.isArray(e)||e.some(c)),l=n&&Object.values(t).some(c);l?(a=`POST`,s=t):n||r?(a=n?`HEAD`:`GET`,Object.entries(t).filter(([e,t])=>t!==void 0).map(([e,t])=>[e,Array.isArray(t)?`{${t.join(`,`)}}`:`${t}`]).forEach(([e,t])=>{o.searchParams.append(e,t)})):(a=`POST`,s=t);let u=new Headers(this.headers);return l?u.set(`Prefer`,i?`count=${i},return=minimal`:`return=minimal`):i&&u.set(`Prefer`,`count=${i}`),new ce({method:a,url:o,headers:u,schema:this.schemaName,body:s,fetch:this.fetch??fetch,urlLengthLimit:this.urlLengthLimit,retry:this.retry})}},pe=class{constructor(){}static detectEnvironment(){if(typeof WebSocket<`u`)return{type:`native`,wsConstructor:WebSocket};let e=globalThis;if(typeof globalThis<`u`&&e.WebSocket!==void 0)return{type:`native`,wsConstructor:e.WebSocket};let t=typeof global<`u`?global:void 0;if(t&&t.WebSocket!==void 0)return{type:`native`,wsConstructor:t.WebSocket};if(typeof globalThis<`u`&&e.WebSocketPair!==void 0&&globalThis.WebSocket===void 0)return{type:`cloudflare`,error:`Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.`,workaround:`Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime.`};if(typeof globalThis<`u`&&e.EdgeRuntime||typeof navigator<`u`&&navigator.userAgent?.includes(`Vercel-Edge`))return{type:`unsupported`,error:`Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.`,workaround:`Use serverless functions or a different deployment target for WebSocket functionality.`};let n=globalThis.process;if(n){let e=n.versions;if(e&&e.node)return{type:`unsupported`,error:`Node.js detected but native WebSocket not found.`,workaround:`Ensure you are running Node.js 22+ or provide a WebSocket implementation via the transport option.`}}return{type:`unsupported`,error:`Unknown JavaScript runtime without WebSocket support.`,workaround:`Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation.`}}static getWebSocketConstructor(){let e=this.detectEnvironment();if(e.wsConstructor)return e.wsConstructor;let t=e.error||`WebSocket not supported in this environment.`;throw e.workaround&&(t+=`\n\nSuggested solution: ${e.workaround}`),Error(t)}static isWebSocketSupported(){try{return this.detectEnvironment().type===`native`}catch{return!1}}};let v={closed:`closed`,errored:`errored`,joined:`joined`,joining:`joining`,leaving:`leaving`},me={close:`phx_close`,error:`phx_error`,join:`phx_join`,reply:`phx_reply`,leave:`phx_leave`,access_token:`access_token`},he={connecting:`connecting`,open:`open`,closing:`closing`,closed:`closed`};var ge=class{constructor(e){this.HEADER_LENGTH=1,this.USER_BROADCAST_PUSH_META_LENGTH=6,this.KINDS={userBroadcastPush:3,userBroadcast:4},this.BINARY_ENCODING=0,this.JSON_ENCODING=1,this.BROADCAST_EVENT=`broadcast`,this.allowedMetadataKeys=[],this.allowedMetadataKeys=e??[]}encode(e,t){if(e.event===this.BROADCAST_EVENT&&!(e.payload instanceof ArrayBuffer)&&typeof e.payload.event==`string`)return t(this._binaryEncodeUserBroadcastPush(e));let n=[e.join_ref,e.ref,e.topic,e.event,e.payload];return t(JSON.stringify(n))}_binaryEncodeUserBroadcastPush(e){return this._isArrayBuffer(e.payload?.payload)?this._encodeBinaryUserBroadcastPush(e):this._encodeJsonUserBroadcastPush(e)}_encodeBinaryUserBroadcastPush(e){let t=e.payload?.payload??new ArrayBuffer(0);return this._encodeUserBroadcastPush(e,this.BINARY_ENCODING,t)}_encodeJsonUserBroadcastPush(e){let t=e.payload?.payload??{},n=new TextEncoder().encode(JSON.stringify(t)).buffer;return this._encodeUserBroadcastPush(e,this.JSON_ENCODING,n)}_encodeUserBroadcastPush(e,t,n){let r=new TextEncoder,i=r.encode(e.topic),a=r.encode(e.ref??``),o=r.encode(e.join_ref??``),s=r.encode(e.payload.event),c=this.allowedMetadataKeys?this._pick(e.payload,this.allowedMetadataKeys):{},l=r.encode(Object.keys(c).length===0?``:JSON.stringify(c));if(o.length>255)throw Error(`joinRef length ${o.length} exceeds maximum of 255`);if(a.length>255)throw Error(`ref length ${a.length} exceeds maximum of 255`);if(i.length>255)throw Error(`topic length ${i.length} exceeds maximum of 255`);if(s.length>255)throw Error(`userEvent length ${s.length} exceeds maximum of 255`);if(l.length>255)throw Error(`metadata length ${l.length} exceeds maximum of 255`);let u=this.USER_BROADCAST_PUSH_META_LENGTH+o.length+a.length+i.length+s.length+l.length,d=new ArrayBuffer(this.HEADER_LENGTH+u),f=new DataView(d),p=new Uint8Array(d),m=0;f.setUint8(m++,this.KINDS.userBroadcastPush),f.setUint8(m++,o.length),f.setUint8(m++,a.length),f.setUint8(m++,i.length),f.setUint8(m++,s.length),f.setUint8(m++,l.length),f.setUint8(m++,t),p.set(o,m),m+=o.length,p.set(a,m),m+=a.length,p.set(i,m),m+=i.length,p.set(s,m),m+=s.length,p.set(l,m),m+=l.length;var h=new Uint8Array(d.byteLength+n.byteLength);return h.set(new Uint8Array(d),0),h.set(new Uint8Array(n),d.byteLength),h.buffer}decode(e,t){if(this._isArrayBuffer(e))return t(this._binaryDecode(e));if(typeof e==`string`){let[n,r,i,a,o]=JSON.parse(e);return t({join_ref:n,ref:r,topic:i,event:a,payload:o})}return t({})}_binaryDecode(e){let t=new DataView(e),n=t.getUint8(0),r=new TextDecoder;switch(n){case this.KINDS.userBroadcast:return this._decodeUserBroadcast(e,t,r)}}_decodeUserBroadcast(e,t,n){let r=t.getUint8(1),i=t.getUint8(2),a=t.getUint8(3),o=t.getUint8(4),s=this.HEADER_LENGTH+4,c=n.decode(e.slice(s,s+r));s+=r;let l=n.decode(e.slice(s,s+i));s+=i;let u=n.decode(e.slice(s,s+a));s+=a;let d=e.slice(s,e.byteLength),f=o===this.JSON_ENCODING?JSON.parse(n.decode(d)):d,p={type:this.BROADCAST_EVENT,event:l,payload:f};return a>0&&(p.meta=JSON.parse(u)),{join_ref:null,ref:null,topic:c,event:this.BROADCAST_EVENT,payload:p}}_isArrayBuffer(e){return e instanceof ArrayBuffer||e?.constructor?.name===`ArrayBuffer`}_pick(e,t){return!e||typeof e!=`object`?{}:Object.fromEntries(Object.entries(e).filter(([e])=>t.includes(e)))}},y;(function(e){e.abstime=`abstime`,e.bool=`bool`,e.date=`date`,e.daterange=`daterange`,e.float4=`float4`,e.float8=`float8`,e.int2=`int2`,e.int4=`int4`,e.int4range=`int4range`,e.int8=`int8`,e.int8range=`int8range`,e.json=`json`,e.jsonb=`jsonb`,e.money=`money`,e.numeric=`numeric`,e.oid=`oid`,e.reltime=`reltime`,e.text=`text`,e.time=`time`,e.timestamp=`timestamp`,e.timestamptz=`timestamptz`,e.timetz=`timetz`,e.tsrange=`tsrange`,e.tstzrange=`tstzrange`})(y||={});let _e=(e,t,n={})=>{let r=n.skipTypes??[];return t?Object.keys(t).reduce((n,i)=>(n[i]=ve(i,e,t,r),n),{}):{}},ve=(e,t,n,r)=>{let i=t.find(t=>t.name===e)?.type,a=n[e];return i&&!r.includes(i)?ye(i,a):be(a)},ye=(e,t)=>{if(e.charAt(0)===`_`)return we(t,e.slice(1,e.length));switch(e){case y.bool:return xe(t);case y.float4:case y.float8:case y.int2:case y.int4:case y.int8:case y.numeric:case y.oid:return Se(t);case y.json:case y.jsonb:return Ce(t);case y.timestamp:return Te(t);case y.abstime:case y.date:case y.daterange:case y.int4range:case y.int8range:case y.money:case y.reltime:case y.text:case y.time:case y.timestamptz:case y.timetz:case y.tsrange:case y.tstzrange:return be(t);default:return be(t)}},be=e=>e,xe=e=>{switch(e){case`t`:return!0;case`f`:return!1;default:return e}},Se=e=>{if(typeof e==`string`){let t=parseFloat(e);if(!Number.isNaN(t))return t}return e},Ce=e=>{if(typeof e==`string`)try{return JSON.parse(e)}catch{return e}return e},we=(e,t)=>{if(typeof e!=`string`)return e;let n=e.length-1,r=e[n];if(e[0]===`{`&&r===`}`){let r,i=e.slice(1,n);try{r=JSON.parse(`[`+i+`]`)}catch{r=i?i.split(`,`):[]}return r.map(e=>ye(t,e))}return e},Te=e=>typeof e==`string`?e.replace(` `,`T`):e,Ee=e=>{let t=new URL(e);return t.protocol=t.protocol.replace(/^ws/i,`http`),t.pathname=t.pathname.replace(/\/+$/,``).replace(/\/socket\/websocket$/i,``).replace(/\/socket$/i,``).replace(/\/websocket$/i,``),t.pathname===``||t.pathname===`/`?t.pathname=`/api/broadcast`:t.pathname+=`/api/broadcast`,t.href};var b=e=>typeof e==`function`?e:function(){return e},De=typeof self<`u`?self:null,Oe=typeof window<`u`?window:null,x=De||Oe||globalThis,ke=`2.0.0`,Ae=1e4,je=1e3,Me=100,S={connecting:0,open:1,closing:2,closed:3},C={closed:`closed`,errored:`errored`,joined:`joined`,joining:`joining`,leaving:`leaving`},w={close:`phx_close`,error:`phx_error`,join:`phx_join`,reply:`phx_reply`,leave:`phx_leave`},Ne={longpoll:`longpoll`,websocket:`websocket`},Pe={complete:4},Fe=`base64url.bearer.phx.`,Ie=class{constructor(e,t,n,r){this.channel=e,this.event=t,this.payload=n||function(){return{}},this.receivedResp=null,this.timeout=r,this.timeoutTimer=null,this.recHooks=[],this.sent=!1,this.ref=void 0}resend(e){this.timeout=e,this.reset(),this.send()}send(){this.hasReceived(`timeout`)||(this.startTimeout(),this.sent=!0,this.channel.socket.push({topic:this.channel.topic,event:this.event,payload:this.payload(),ref:this.ref,join_ref:this.channel.joinRef()}))}receive(e,t){return this.hasReceived(e)&&t(this.receivedResp.response),this.recHooks.push({status:e,callback:t}),this}reset(){this.cancelRefEvent(),this.ref=null,this.refEvent=null,this.receivedResp=null,this.sent=!1}destroy(){this.cancelRefEvent(),this.cancelTimeout()}matchReceive({status:e,response:t,_ref:n}){this.recHooks.filter(t=>t.status===e).forEach(e=>e.callback(t))}cancelRefEvent(){this.refEvent&&this.channel.off(this.refEvent)}cancelTimeout(){clearTimeout(this.timeoutTimer),this.timeoutTimer=null}startTimeout(){this.timeoutTimer&&this.cancelTimeout(),this.ref=this.channel.socket.makeRef(),this.refEvent=this.channel.replyEventName(this.ref),this.channel.on(this.refEvent,e=>{this.cancelRefEvent(),this.cancelTimeout(),this.receivedResp=e,this.matchReceive(e)}),this.timeoutTimer=setTimeout(()=>{this.trigger(`timeout`,{})},this.timeout)}hasReceived(e){return this.receivedResp&&this.receivedResp.status===e}trigger(e,t){this.channel.trigger(this.refEvent,{status:e,response:t})}},Le=class{constructor(e,t){this.callback=e,this.timerCalc=t,this.timer=void 0,this.tries=0}reset(){this.tries=0,clearTimeout(this.timer)}scheduleTimeout(){clearTimeout(this.timer),this.timer=setTimeout(()=>{this.tries+=1,this.callback()},this.timerCalc(this.tries+1))}},Re=class{constructor(e,t,n){this.state=C.closed,this.topic=e,this.params=b(t||{}),this.socket=n,this.bindings=[],this.bindingRef=0,this.timeout=this.socket.timeout,this.joinedOnce=!1,this.joinPush=new Ie(this,w.join,this.params,this.timeout),this.pushBuffer=[],this.stateChangeRefs=[],this.rejoinTimer=new Le(()=>{this.socket.isConnected()&&this.rejoin()},this.socket.rejoinAfterMs),this.stateChangeRefs.push(this.socket.onError(()=>this.rejoinTimer.reset())),this.stateChangeRefs.push(this.socket.onOpen(()=>{this.rejoinTimer.reset(),this.isErrored()&&this.rejoin()})),this.joinPush.receive(`ok`,()=>{this.state=C.joined,this.rejoinTimer.reset(),this.pushBuffer.forEach(e=>e.send()),this.pushBuffer=[]}),this.joinPush.receive(`error`,e=>{this.state=C.errored,this.socket.hasLogger()&&this.socket.log(`channel`,`error ${this.topic}`,e),this.socket.isConnected()&&this.rejoinTimer.scheduleTimeout()}),this.onClose(()=>{this.rejoinTimer.reset(),this.socket.hasLogger()&&this.socket.log(`channel`,`close ${this.topic}`),this.state=C.closed,this.socket.remove(this)}),this.onError(e=>{this.socket.hasLogger()&&this.socket.log(`channel`,`error ${this.topic}`,e),this.isJoining()&&this.joinPush.reset(),this.state=C.errored,this.socket.isConnected()&&this.rejoinTimer.scheduleTimeout()}),this.joinPush.receive(`timeout`,()=>{this.socket.hasLogger()&&this.socket.log(`channel`,`timeout ${this.topic}`,this.joinPush.timeout),new Ie(this,w.leave,b({}),this.timeout).send(),this.state=C.errored,this.joinPush.reset(),this.socket.isConnected()&&this.rejoinTimer.scheduleTimeout()}),this.on(w.reply,(e,t)=>{this.trigger(this.replyEventName(t),e)})}join(e=this.timeout){if(this.joinedOnce)throw Error(`tried to join multiple times. 'join' can only be called a single time per channel instance`);return this.timeout=e,this.joinedOnce=!0,this.rejoin(),this.joinPush}teardown(){this.pushBuffer.forEach(e=>e.destroy()),this.pushBuffer=[],this.rejoinTimer.reset(),this.joinPush.destroy(),this.state=C.closed,this.bindings=[]}onClose(e){this.on(w.close,e)}onError(e){return this.on(w.error,t=>e(t))}on(e,t){let n=this.bindingRef++;return this.bindings.push({event:e,ref:n,callback:t}),n}off(e,t){this.bindings=this.bindings.filter(n=>!(n.event===e&&(t===void 0||t===n.ref)))}canPush(){return this.socket.isConnected()&&this.isJoined()}push(e,t,n=this.timeout){if(t||={},!this.joinedOnce)throw Error(`tried to push '${e}' to '${this.topic}' before joining. Use channel.join() before pushing events`);let r=new Ie(this,e,function(){return t},n);return this.canPush()?r.send():(r.startTimeout(),this.pushBuffer.push(r)),r}leave(e=this.timeout){this.rejoinTimer.reset(),this.joinPush.cancelTimeout(),this.state=C.leaving;let t=()=>{this.socket.hasLogger()&&this.socket.log(`channel`,`leave ${this.topic}`),this.trigger(w.close,`leave`)},n=new Ie(this,w.leave,b({}),e);return n.receive(`ok`,()=>t()).receive(`timeout`,()=>t()),n.send(),this.canPush()||n.trigger(`ok`,{}),n}onMessage(e,t,n){return t}filterBindings(e,t,n){return!0}isMember(e,t,n,r){return this.topic===e?r&&r!==this.joinRef()?(this.socket.hasLogger()&&this.socket.log(`channel`,`dropping outdated message`,{topic:e,event:t,payload:n,joinRef:r}),!1):!0:!1}joinRef(){return this.joinPush.ref}rejoin(e=this.timeout){this.isLeaving()||(this.socket.leaveOpenTopic(this.topic),this.state=C.joining,this.joinPush.resend(e))}trigger(e,t,n,r){let i=this.onMessage(e,t,n,r);if(t&&!i)throw Error(`channel onMessage callbacks must return the payload, modified or unmodified`);let a=this.bindings.filter(r=>r.event===e&&this.filterBindings(r,t,n));for(let e=0;e<a.length;e++)a[e].callback(i,n,r||this.joinRef())}replyEventName(e){return`chan_reply_${e}`}isClosed(){return this.state===C.closed}isErrored(){return this.state===C.errored}isJoined(){return this.state===C.joined}isJoining(){return this.state===C.joining}isLeaving(){return this.state===C.leaving}},ze=class{static request(e,t,n,r,i,a,o){if(x.XDomainRequest){let n=new x.XDomainRequest;return this.xdomainRequest(n,e,t,r,i,a,o)}else if(x.XMLHttpRequest){let s=new x.XMLHttpRequest;return this.xhrRequest(s,e,t,n,r,i,a,o)}else if(x.fetch&&x.AbortController)return this.fetchRequest(e,t,n,r,i,a,o);else throw Error(`No suitable XMLHttpRequest implementation found`)}static fetchRequest(e,t,n,r,i,a,o){let s={method:e,headers:n,body:r},c=null;return i&&(c=new AbortController,setTimeout(()=>c.abort(),i),s.signal=c.signal),x.fetch(t,s).then(e=>e.text()).then(e=>this.parseJSON(e)).then(e=>o&&o(e)).catch(e=>{e.name===`AbortError`&&a?a():o&&o(null)}),c}static xdomainRequest(e,t,n,r,i,a,o){return e.timeout=i,e.open(t,n),e.onload=()=>{let t=this.parseJSON(e.responseText);o&&o(t)},a&&(e.ontimeout=a),e.onprogress=()=>{},e.send(r),e}static xhrRequest(e,t,n,r,i,a,o,s){e.open(t,n,!0),e.timeout=a;for(let[t,n]of Object.entries(r))e.setRequestHeader(t,n);return e.onerror=()=>s&&s(null),e.onreadystatechange=()=>{e.readyState===Pe.complete&&s&&s(this.parseJSON(e.responseText))},o&&(e.ontimeout=o),e.send(i),e}static parseJSON(e){if(!e||e===``)return null;try{return JSON.parse(e)}catch{return console&&console.log(`failed to parse JSON response`,e),null}}static serialize(e,t){let n=[];for(var r in e){if(!Object.prototype.hasOwnProperty.call(e,r))continue;let i=t?`${t}[${r}]`:r,a=e[r];typeof a==`object`?n.push(this.serialize(a,i)):n.push(encodeURIComponent(i)+`=`+encodeURIComponent(a))}return n.join(`&`)}static appendParams(e,t){return Object.keys(t).length===0?e:`${e}${e.match(/\?/)?`&`:`?`}${this.serialize(t)}`}},Be=e=>{let t=``,n=new Uint8Array(e),r=n.byteLength;for(let e=0;e<r;e++)t+=String.fromCharCode(n[e]);return btoa(t)},Ve=class{constructor(e,t){t&&t.length===2&&t[1].startsWith(Fe)&&(this.authToken=atob(t[1].slice(Fe.length))),this.endPoint=null,this.token=null,this.skipHeartbeat=!0,this.reqs=new Set,this.awaitingBatchAck=!1,this.currentBatch=null,this.currentBatchTimer=null,this.batchBuffer=[],this.onopen=function(){},this.onerror=function(){},this.onmessage=function(){},this.onclose=function(){},this.pollEndpoint=this.normalizeEndpoint(e),this.readyState=S.connecting,setTimeout(()=>this.poll(),0)}normalizeEndpoint(e){return e.replace(`ws://`,`http://`).replace(`wss://`,`https://`).replace(RegExp(`(.*)/`+Ne.websocket),`$1/`+Ne.longpoll)}endpointURL(){return ze.appendParams(this.pollEndpoint,{token:this.token})}closeAndRetry(e,t,n){this.close(e,t,n),this.readyState=S.connecting}ontimeout(){this.onerror(`timeout`),this.closeAndRetry(1005,`timeout`,!1)}isActive(){return this.readyState===S.open||this.readyState===S.connecting}poll(){let e={Accept:`application/json`};this.authToken&&(e[`X-Phoenix-AuthToken`]=this.authToken),this.ajax(`GET`,e,null,()=>this.ontimeout(),e=>{if(e){var{status:t,token:n,messages:r}=e;if(t===410&&this.token!==null){this.onerror(410),this.closeAndRetry(3410,`session_gone`,!1);return}this.token=n}else t=0;switch(t){case 200:r.forEach(e=>{setTimeout(()=>this.onmessage({data:e}),0)}),this.poll();break;case 204:this.poll();break;case 410:this.readyState=S.open,this.onopen({}),this.poll();break;case 403:this.onerror(403),this.close(1008,`forbidden`,!1);break;case 0:case 500:this.onerror(500),this.closeAndRetry(1011,`internal server error`,500);break;default:throw Error(`unhandled poll status ${t}`)}})}send(e){typeof e!=`string`&&(e=Be(e)),this.currentBatch?this.currentBatch.push(e):this.awaitingBatchAck?this.batchBuffer.push(e):(this.currentBatch=[e],this.currentBatchTimer=setTimeout(()=>{this.batchSend(this.currentBatch),this.currentBatch=null},0))}batchSend(e,t=0){this.awaitingBatchAck=!0;let n=t+Me,r=e.slice(t,n);this.ajax(`POST`,{"Content-Type":`application/x-ndjson`},r.join(`
`),()=>this.onerror(`timeout`),t=>{!t||t.status!==200?(this.awaitingBatchAck=!1,this.onerror(t&&t.status),this.closeAndRetry(1011,`internal server error`,!1)):n<e.length?this.batchSend(e,n):this.batchBuffer.length>0?(this.batchSend(this.batchBuffer),this.batchBuffer=[]):this.awaitingBatchAck=!1})}close(e,t,n){for(let e of this.reqs)e.abort();this.readyState=S.closed;let r=Object.assign({code:1e3,reason:void 0,wasClean:!0},{code:e,reason:t,wasClean:n});this.batchBuffer=[],clearTimeout(this.currentBatchTimer),this.currentBatchTimer=null,typeof CloseEvent<`u`?this.onclose(new CloseEvent(`close`,r)):this.onclose(r)}ajax(e,t,n,r,i){let a;a=ze.request(e,this.endpointURL(),t,n,this.timeout,()=>{this.reqs.delete(a),r()},e=>{this.reqs.delete(a),this.isActive()&&i(e)}),this.reqs.add(a)}},He=class e{constructor(t,n={}){let r=n.events||{state:`presence_state`,diff:`presence_diff`};this.state=Object.create(null),this.pendingDiffs=[],this.channel=t,this.joinRef=null,this.caller={onJoin:function(){},onLeave:function(){},onSync:function(){}},this.channel.on(r.state,t=>{let{onJoin:n,onLeave:r,onSync:i}=this.caller;this.joinRef=this.channel.joinRef(),this.state=e.syncState(this.state,t,n,r),this.pendingDiffs.forEach(t=>{this.state=e.syncDiff(this.state,t,n,r)}),this.pendingDiffs=[],i()}),this.channel.on(r.diff,t=>{let{onJoin:n,onLeave:r,onSync:i}=this.caller;this.inPendingSyncState()?this.pendingDiffs.push(t):(this.state=e.syncDiff(this.state,t,n,r),i())})}onJoin(e){this.caller.onJoin=e}onLeave(e){this.caller.onLeave=e}onSync(e){this.caller.onSync=e}list(t){return e.list(this.state,t)}inPendingSyncState(){return!this.joinRef||this.joinRef!==this.channel.joinRef()}static syncState(e,t,n,r){let i=this.toNullProtoObj(this.clone(e));t=this.toNullProtoObj(t);let a=Object.create(null),o=Object.create(null);return this.map(i,(e,n)=>{t[e]||(o[e]=n)}),this.map(t,(e,t)=>{let n=i[e];if(n){let r=t.metas.map(e=>e.phx_ref),i=n.metas.map(e=>e.phx_ref),s=t.metas.filter(e=>i.indexOf(e.phx_ref)<0),c=n.metas.filter(e=>r.indexOf(e.phx_ref)<0);s.length>0&&(a[e]=t,a[e].metas=s),c.length>0&&(o[e]=this.clone(n),o[e].metas=c)}else a[e]=t}),this.syncDiff(i,{joins:a,leaves:o},n,r)}static syncDiff(e,t,n,r){e=this.toNullProtoObj(e);let{joins:i,leaves:a}=this.clone(t);return n||=function(){},r||=function(){},this.map(i,(t,r)=>{let i=e[t];if(e[t]=this.clone(r),i){let n=e[t].metas.map(e=>e.phx_ref),r=i.metas.filter(e=>n.indexOf(e.phx_ref)<0);e[t].metas.unshift(...r)}n(t,i,r)}),this.map(a,(t,n)=>{let i=e[t];if(!i)return;let a=n.metas.map(e=>e.phx_ref);i.metas=i.metas.filter(e=>a.indexOf(e.phx_ref)<0),r(t,i,n),i.metas.length===0&&delete e[t]}),e}static list(e,t){return t||=function(e,t){return t},this.map(e,(e,n)=>t(e,n))}static map(e,t){return Object.getOwnPropertyNames(e).map(n=>t(n,e[n]))}static toNullProtoObj(e){if(Object.getPrototypeOf(e)===null)return e;let t=Object.create(null);return Object.getOwnPropertyNames(e).forEach(n=>{t[n]=e[n]}),t}static clone(e){return JSON.parse(JSON.stringify(e))}},Ue={HEADER_LENGTH:1,META_LENGTH:4,KINDS:{push:0,reply:1,broadcast:2},encode(e,t){if(e.payload.constructor===ArrayBuffer)return t(this.binaryEncode(e));{let n=[e.join_ref,e.ref,e.topic,e.event,e.payload];return t(JSON.stringify(n))}},decode(e,t){if(e.constructor===ArrayBuffer)return t(this.binaryDecode(e));{let[n,r,i,a,o]=JSON.parse(e);return t({join_ref:n,ref:r,topic:i,event:a,payload:o})}},binaryEncode(e){let{join_ref:t,ref:n,event:r,topic:i,payload:a}=e,o=new TextEncoder,s=o.encode(t),c=o.encode(n),l=o.encode(i),u=o.encode(r);this.assertFieldSize(s.byteLength,`join_ref`),this.assertFieldSize(c.byteLength,`ref`),this.assertFieldSize(l.byteLength,`topic`),this.assertFieldSize(u.byteLength,`event`);let d=this.META_LENGTH+s.byteLength+c.byteLength+l.byteLength+u.byteLength,f=new ArrayBuffer(this.HEADER_LENGTH+d),p=new Uint8Array(f),m=new DataView(f),h=0;m.setUint8(h++,this.KINDS.push),m.setUint8(h++,s.byteLength),m.setUint8(h++,c.byteLength),m.setUint8(h++,l.byteLength),m.setUint8(h++,u.byteLength),p.set(s,h),h+=s.byteLength,p.set(c,h),h+=c.byteLength,p.set(l,h),h+=l.byteLength,p.set(u,h),h+=u.byteLength;var g=new Uint8Array(f.byteLength+a.byteLength);return g.set(p,0),g.set(new Uint8Array(a),f.byteLength),g.buffer},assertFieldSize(e,t){if(e>255)throw Error(`unable to convert ${t} to binary: must be less than or equal to 255 bytes, but is ${e} bytes`)},binaryDecode(e){let t=new DataView(e),n=t.getUint8(0),r=new TextDecoder;switch(n){case this.KINDS.push:return this.decodePush(e,t,r);case this.KINDS.reply:return this.decodeReply(e,t,r);case this.KINDS.broadcast:return this.decodeBroadcast(e,t,r)}},decodePush(e,t,n){let r=t.getUint8(1),i=t.getUint8(2),a=t.getUint8(3),o=this.HEADER_LENGTH+this.META_LENGTH-1,s=n.decode(e.slice(o,o+r));o+=r;let c=n.decode(e.slice(o,o+i));o+=i;let l=n.decode(e.slice(o,o+a));return o+=a,{join_ref:s,ref:null,topic:c,event:l,payload:e.slice(o,e.byteLength)}},decodeReply(e,t,n){let r=t.getUint8(1),i=t.getUint8(2),a=t.getUint8(3),o=t.getUint8(4),s=this.HEADER_LENGTH+this.META_LENGTH,c=n.decode(e.slice(s,s+r));s+=r;let l=n.decode(e.slice(s,s+i));s+=i;let u=n.decode(e.slice(s,s+a));s+=a;let d=n.decode(e.slice(s,s+o));s+=o;let f={status:d,response:e.slice(s,e.byteLength)};return{join_ref:c,ref:l,topic:u,event:w.reply,payload:f}},decodeBroadcast(e,t,n){let r=t.getUint8(1),i=t.getUint8(2),a=this.HEADER_LENGTH+2,o=n.decode(e.slice(a,a+r));a+=r;let s=n.decode(e.slice(a,a+i));return a+=i,{join_ref:null,ref:null,topic:o,event:s,payload:e.slice(a,e.byteLength)}}},We=class{constructor(e,t={}){this.stateChangeCallbacks={open:[],close:[],error:[],message:[]},this.channels=[],this.sendBuffer=[],this.ref=0,this.fallbackRef=null,this.timeout=t.timeout||Ae,this.transport=t.transport||x.WebSocket||Ve,this.conn=void 0,this.primaryPassedHealthCheck=!1,this.longPollFallbackMs=t.longPollFallbackMs,this.fallbackTimer=null;let n=null;try{n=x&&x.sessionStorage}catch{}this.sessionStore=t.sessionStorage||n,this.establishedConnections=0,this.defaultEncoder=Ue.encode.bind(Ue),this.defaultDecoder=Ue.decode.bind(Ue),this.closeWasClean=!0,this.disconnecting=!1,this.binaryType=t.binaryType||`arraybuffer`,this.connectClock=1,this.pageHidden=!1,this.encode=void 0,this.decode=void 0,this.transport===Ve?(this.encode=this.defaultEncoder,this.decode=this.defaultDecoder):(this.encode=t.encode||this.defaultEncoder,this.decode=t.decode||this.defaultDecoder);let r=null;Oe&&Oe.addEventListener&&(Oe.addEventListener(`pagehide`,e=>{this.conn&&(this.disconnect(),r=this.connectClock)}),Oe.addEventListener(`pageshow`,e=>{r===this.connectClock&&(r=null,this.connect())}),Oe.addEventListener(`visibilitychange`,()=>{document.visibilityState===`hidden`?this.pageHidden=!0:(this.pageHidden=!1,!this.isConnected()&&!this.closeWasClean&&this.teardown(()=>this.connect()))})),this.heartbeatIntervalMs=t.heartbeatIntervalMs||3e4,this.autoSendHeartbeat=t.autoSendHeartbeat??!0,this.heartbeatCallback=t.heartbeatCallback??(()=>{}),this.rejoinAfterMs=e=>t.rejoinAfterMs?t.rejoinAfterMs(e):[1e3,2e3,5e3][e-1]||1e4,this.reconnectAfterMs=e=>t.reconnectAfterMs?t.reconnectAfterMs(e):[10,50,100,150,200,250,500,1e3,2e3][e-1]||5e3,this.logger=t.logger||null,!this.logger&&t.debug&&(this.logger=(e,t,n)=>{console.log(`${e}: ${t}`,n)}),this.longpollerTimeout=t.longpollerTimeout||2e4,this.params=b(t.params||{}),this.endPoint=`${e}/${Ne.websocket}`,this.vsn=t.vsn||ke,this.heartbeatTimeoutTimer=null,this.heartbeatTimer=null,this.heartbeatSentAt=null,this.pendingHeartbeatRef=null,this.reconnectTimer=new Le(()=>{if(this.pageHidden){this.log(`Not reconnecting as page is hidden!`),this.teardown();return}this.teardown(async()=>{t.beforeReconnect&&await t.beforeReconnect(),this.connect()})},this.reconnectAfterMs),this.authToken=t.authToken&&b(t.authToken)}getLongPollTransport(){return Ve}replaceTransport(e){this.connectClock++,this.closeWasClean=!0,clearTimeout(this.fallbackTimer),this.reconnectTimer.reset(),this.conn&&=(this.conn.close(),null),this.transport=e}protocol(){return location.protocol.match(/^https/)?`wss`:`ws`}endPointURL(){let e=ze.appendParams(ze.appendParams(this.endPoint,this.params()),{vsn:this.vsn});return e.charAt(0)===`/`?e.charAt(1)===`/`?`${this.protocol()}:${e}`:`${this.protocol()}://${location.host}${e}`:e}disconnect(e,t,n){this.connectClock++,this.disconnecting=!0,this.closeWasClean=!0,clearTimeout(this.fallbackTimer),this.reconnectTimer.reset(),this.teardown(()=>{this.disconnecting=!1,e&&e()},t,n)}connect(e){e&&(console&&console.log(`passing params to connect is deprecated. Instead pass :params to the Socket constructor`),this.params=b(e)),!(this.conn&&!this.disconnecting)&&(this.longPollFallbackMs&&this.transport!==Ve?this.connectWithFallback(Ve,this.longPollFallbackMs):this.transportConnect())}log(e,t,n){this.logger&&this.logger(e,t,n)}hasLogger(){return this.logger!==null}onOpen(e){let t=this.makeRef();return this.stateChangeCallbacks.open.push([t,e]),t}onClose(e){let t=this.makeRef();return this.stateChangeCallbacks.close.push([t,e]),t}onError(e){let t=this.makeRef();return this.stateChangeCallbacks.error.push([t,e]),t}onMessage(e){let t=this.makeRef();return this.stateChangeCallbacks.message.push([t,e]),t}onHeartbeat(e){this.heartbeatCallback=e}ping(e){if(!this.isConnected())return!1;let t=this.makeRef(),n=Date.now();this.push({topic:`phoenix`,event:`heartbeat`,payload:{},ref:t});let r=this.onMessage(i=>{i.ref===t&&(this.off([r]),e(Date.now()-n))});return!0}transportName(e){switch(e){case Ve:return`LongPoll`;default:return e.name}}transportConnect(){this.connectClock++,this.closeWasClean=!1;let e;this.authToken&&(e=[`phoenix`,`${Fe}${btoa(this.authToken()).replace(/=/g,``)}`]),this.conn=new this.transport(this.endPointURL(),e),this.conn.binaryType=this.binaryType,this.conn.timeout=this.longpollerTimeout,this.conn.onopen=()=>this.onConnOpen(),this.conn.onerror=e=>this.onConnError(e),this.conn.onmessage=e=>this.onConnMessage(e),this.conn.onclose=e=>this.onConnClose(e)}getSession(e){return this.sessionStore&&this.sessionStore.getItem(e)}storeSession(e,t){this.sessionStore&&this.sessionStore.setItem(e,t)}connectWithFallback(e,t=2500){clearTimeout(this.fallbackTimer);let n=!1,r=!0,i,a=this.transportName(e),o=t=>{this.log(`transport`,`falling back to ${a}...`,t),this.off([void 0,i]),r=!1,this.replaceTransport(e),this.transportConnect()};if(this.getSession(`phx:fallback:${a}`))return o(`memorized`);this.fallbackTimer=setTimeout(o,t),i=this.onError(e=>{this.log(`transport`,`error`,e),r&&!n&&(clearTimeout(this.fallbackTimer),o(e))}),this.fallbackRef&&this.off([this.fallbackRef]),this.fallbackRef=this.onOpen(()=>{if(n=!0,!r){let t=this.transportName(e);return this.primaryPassedHealthCheck||this.storeSession(`phx:fallback:${t}`,`true`),this.log(`transport`,`established ${t} fallback`)}clearTimeout(this.fallbackTimer),this.fallbackTimer=setTimeout(o,t),this.ping(e=>{this.log(`transport`,`connected to primary after`,e),this.primaryPassedHealthCheck=!0,clearTimeout(this.fallbackTimer)})}),this.transportConnect()}clearHeartbeats(){clearTimeout(this.heartbeatTimer),clearTimeout(this.heartbeatTimeoutTimer)}onConnOpen(){this.hasLogger()&&this.log(`transport`,`connected to ${this.endPointURL()}`),this.closeWasClean=!1,this.disconnecting=!1,this.establishedConnections++,this.flushSendBuffer(),this.reconnectTimer.reset(),this.autoSendHeartbeat&&this.resetHeartbeat(),this.triggerStateCallbacks(`open`)}heartbeatTimeout(){if(this.pendingHeartbeatRef){this.pendingHeartbeatRef=null,this.heartbeatSentAt=null,this.hasLogger()&&this.log(`transport`,`heartbeat timeout. Attempting to re-establish connection`);try{this.heartbeatCallback(`timeout`)}catch(e){this.log(`error`,`error in heartbeat callback`,e)}this.triggerChanError(Error(`heartbeat timeout`)),this.closeWasClean=!1,this.teardown(()=>this.reconnectTimer.scheduleTimeout(),je,`heartbeat timeout`)}}resetHeartbeat(){this.conn&&this.conn.skipHeartbeat||(this.pendingHeartbeatRef=null,this.clearHeartbeats(),this.heartbeatTimer=setTimeout(()=>this.sendHeartbeat(),this.heartbeatIntervalMs))}teardown(e,t,n){if(!this.conn)return e&&e();let r=this.conn;this.waitForBufferDone(r,()=>{t?r.close(t,n||``):r.close(),this.waitForSocketClosed(r,()=>{this.conn===r&&(this.conn.onopen=function(){},this.conn.onerror=function(){},this.conn.onmessage=function(){},this.conn.onclose=function(){},this.conn=null),e&&e()})})}waitForBufferDone(e,t,n=1){if(n===5||!e.bufferedAmount){t();return}setTimeout(()=>{this.waitForBufferDone(e,t,n+1)},150*n)}waitForSocketClosed(e,t,n=1){if(n===5||e.readyState===S.closed){t();return}setTimeout(()=>{this.waitForSocketClosed(e,t,n+1)},150*n)}onConnClose(e){this.conn&&(this.conn.onclose=()=>{}),this.hasLogger()&&this.log(`transport`,`close`,e),this.triggerChanError(e),this.clearHeartbeats(),this.closeWasClean||this.reconnectTimer.scheduleTimeout(),this.triggerStateCallbacks(`close`,e)}onConnError(e){this.hasLogger()&&this.log(`transport`,`error`,e);let t=this.transport,n=this.establishedConnections;this.triggerStateCallbacks(`error`,e,t,n),(t===this.transport||n>0)&&this.triggerChanError(e)}triggerChanError(e){this.channels.forEach(t=>{t.isErrored()||t.isLeaving()||t.isClosed()||t.trigger(w.error,e)})}connectionState(){switch(this.conn&&this.conn.readyState){case S.connecting:return`connecting`;case S.open:return`open`;case S.closing:return`closing`;default:return`closed`}}isConnected(){return this.connectionState()===`open`}remove(e){this.off(e.stateChangeRefs),this.channels=this.channels.filter(t=>t!==e)}off(e){for(let t in this.stateChangeCallbacks)this.stateChangeCallbacks[t]=this.stateChangeCallbacks[t].filter(([t])=>e.indexOf(t)===-1)}channel(e,t={}){let n=new Re(e,t,this);return this.channels.push(n),n}push(e){if(this.hasLogger()){let{topic:t,event:n,payload:r,ref:i,join_ref:a}=e;this.log(`push`,`${t} ${n} (${a}, ${i})`,r)}this.isConnected()?this.encode(e,e=>this.conn.send(e)):this.sendBuffer.push(()=>this.encode(e,e=>this.conn.send(e)))}makeRef(){let e=this.ref+1;return e===this.ref?this.ref=0:this.ref=e,this.ref.toString()}sendHeartbeat(){if(!this.isConnected()){try{this.heartbeatCallback(`disconnected`)}catch(e){this.log(`error`,`error in heartbeat callback`,e)}return}if(this.pendingHeartbeatRef){this.heartbeatTimeout();return}this.pendingHeartbeatRef=this.makeRef(),this.heartbeatSentAt=Date.now(),this.push({topic:`phoenix`,event:`heartbeat`,payload:{},ref:this.pendingHeartbeatRef});try{this.heartbeatCallback(`sent`)}catch(e){this.log(`error`,`error in heartbeat callback`,e)}this.heartbeatTimeoutTimer=setTimeout(()=>this.heartbeatTimeout(),this.heartbeatIntervalMs)}flushSendBuffer(){this.isConnected()&&this.sendBuffer.length>0&&(this.sendBuffer.forEach(e=>e()),this.sendBuffer=[])}onConnMessage(e){this.decode(e.data,e=>{let{topic:t,event:n,payload:r,ref:i,join_ref:a}=e;if(i&&i===this.pendingHeartbeatRef){let e=this.heartbeatSentAt?Date.now()-this.heartbeatSentAt:void 0;this.clearHeartbeats();try{this.heartbeatCallback(r.status===`ok`?`ok`:`error`,e)}catch(e){this.log(`error`,`error in heartbeat callback`,e)}this.pendingHeartbeatRef=null,this.heartbeatSentAt=null,this.autoSendHeartbeat&&(this.heartbeatTimer=setTimeout(()=>this.sendHeartbeat(),this.heartbeatIntervalMs))}this.hasLogger()&&this.log(`receive`,`${r.status||``} ${t} ${n} ${i&&`(`+i+`)`||``}`.trim(),r);for(let e=0;e<this.channels.length;e++){let o=this.channels[e];o.isMember(t,n,r,a)&&o.trigger(n,r,i,a)}this.triggerStateCallbacks(`message`,e)})}triggerStateCallbacks(e,...t){try{this.stateChangeCallbacks[e].forEach(([n,r])=>{try{r(...t)}catch(t){this.log(`error`,`error in ${e} callback`,t)}})}catch(t){this.log(`error`,`error triggering ${e} callbacks`,t)}}leaveOpenTopic(e){let t=this.channels.find(t=>t.topic===e&&(t.isJoined()||t.isJoining()));t&&(this.hasLogger()&&this.log(`transport`,`leaving duplicate topic "${e}"`),t.leave())}},Ge=class e{constructor(t,n){let r=Je(n);this.presence=new He(t.getChannel(),r),this.presence.onJoin((n,r,i)=>{let a=e.onJoinPayload(n,r,i);t.getChannel().trigger(`presence`,a)}),this.presence.onLeave((n,r,i)=>{let a=e.onLeavePayload(n,r,i);t.getChannel().trigger(`presence`,a)}),this.presence.onSync(()=>{t.getChannel().trigger(`presence`,{event:`sync`})})}get state(){return e.transformState(this.presence.state)}static transformState(e){return e=qe(e),Object.getOwnPropertyNames(e).reduce((t,n)=>{let r=e[n];return t[n]=Ke(r),t},{})}static onJoinPayload(e,t,n){return{event:`join`,key:e,currentPresences:Ye(t),newPresences:Ke(n)}}static onLeavePayload(e,t,n){return{event:`leave`,key:e,currentPresences:Ye(t),leftPresences:Ke(n)}}};function Ke(e){return e.metas.map(e=>{let t=Object.getOwnPropertyDescriptors(e),n=Object.defineProperties({},t);return n.presence_ref=n.phx_ref,delete n.phx_ref,delete n.phx_ref_prev,n})}function qe(e){return JSON.parse(JSON.stringify(e))}function Je(e){return e?.events&&{events:e.events}}function Ye(e){return e?.metas?Ke(e):[]}var Xe;(function(e){e.SYNC=`sync`,e.JOIN=`join`,e.LEAVE=`leave`})(Xe||={});var Ze=class{get state(){return this.presenceAdapter.state}constructor(e,t){this.channel=e,this.presenceAdapter=new Ge(this.channel.channelAdapter,t)}};function Qe(e){if(e instanceof Error)return e;if(typeof e==`string`)return Error(e);if(e&&typeof e==`object`){let t=e;if(typeof t.code==`number`){let n=typeof t.reason==`string`&&t.reason?` (${t.reason})`:``;return Error(`socket closed: ${t.code}${n}`,{cause:e})}return Error(`channel error: transport failure`,{cause:e})}return Error(`channel error: connection lost`)}var $e=class{constructor(e,t,n){let r=et(n);this.channel=e.getSocket().channel(t,r),this.socket=e}get state(){return this.channel.state}set state(e){this.channel.state=e}get joinedOnce(){return this.channel.joinedOnce}get joinPush(){return this.channel.joinPush}get rejoinTimer(){return this.channel.rejoinTimer}on(e,t){return this.channel.on(e,t)}off(e,t){this.channel.off(e,t)}subscribe(e){return this.channel.join(e)}unsubscribe(e){return this.channel.leave(e)}teardown(){this.channel.teardown()}onClose(e){this.channel.onClose(e)}onError(e){return this.channel.onError(e)}push(e,t,n){let r;try{r=this.channel.push(e,t,n)}catch{throw Error(`tried to push '${e}' to '${this.channel.topic}' before joining. Use channel.subscribe() before pushing events`)}if(this.channel.pushBuffer.length>100){let e=this.channel.pushBuffer.shift();e.cancelTimeout(),this.socket.log(`channel`,`discarded push due to buffer overflow: ${e.event}`,e.payload())}return r}updateJoinPayload(e){let t=this.channel.joinPush.payload();this.channel.joinPush.payload=()=>Object.assign(Object.assign({},t),e)}canPush(){return this.socket.isConnected()&&this.state===v.joined}isJoined(){return this.state===v.joined}isJoining(){return this.state===v.joining}isClosed(){return this.state===v.closed}isLeaving(){return this.state===v.leaving}updateFilterBindings(e){this.channel.filterBindings=e}updatePayloadTransform(e){this.channel.onMessage=e}getChannel(){return this.channel}};function et(e){return{config:Object.assign({broadcast:{ack:!1,self:!1},presence:{key:``,enabled:!1},private:!1},e.config)}}let tt=/[,()"\\]/,nt=e=>tt.test(e)||e!==e.trim(),rt=e=>`"${e.replace(/\\/g,`\\\\`).replace(/"/g,`\\"`)}"`,it=e=>{let t=e===null?`null`:String(e);return nt(t)?rt(t):t},at=e=>e===null?`null`:String(e),ot=(e,t)=>{if(e===`in`){let e=Array.isArray(t)?t:[t];if(e.length===0)throw Error("Realtime `in` filter requires at least one value.");return`in.(${Array.from(new Set(e)).map(e=>it(e)).join(`,`)})`}return e===`is`?`is.${at(t)}`:`${e}.${it(t)}`};var st=class{constructor(){this.filters=[]}add(e,t,n,r=!1){let i=r?`not.`:``;return this.filters.push(`${e}=${i}${ot(t,n)}`),this}eq(e,t){return this.add(e,`eq`,t)}neq(e,t){return this.add(e,`neq`,t)}gt(e,t){return this.add(e,`gt`,t)}gte(e,t){return this.add(e,`gte`,t)}lt(e,t){return this.add(e,`lt`,t)}lte(e,t){return this.add(e,`lte`,t)}in(e,t){return this.add(e,`in`,t)}like(e,t){return this.add(e,`like`,t)}ilike(e,t){return this.add(e,`ilike`,t)}match(e,t){return this.add(e,`match`,t)}imatch(e,t){return this.add(e,`imatch`,t)}is(e,t){return this.add(e,`is`,t)}isDistinct(e,t){return this.add(e,`isdistinct`,t)}not(e,t,n){return this.add(e,t,n,!0)}build(){return this.filters.join(`,`)}toString(){return this.build()}};let ct=()=>new st;var lt;(function(e){e.ALL=`*`,e.INSERT=`INSERT`,e.UPDATE=`UPDATE`,e.DELETE=`DELETE`})(lt||={});var T;(function(e){e.BROADCAST=`broadcast`,e.PRESENCE=`presence`,e.POSTGRES_CHANGES=`postgres_changes`,e.SYSTEM=`system`})(T||={});var E;(function(e){e.SUBSCRIBED=`SUBSCRIBED`,e.TIMED_OUT=`TIMED_OUT`,e.CLOSED=`CLOSED`,e.CHANNEL_ERROR=`CHANNEL_ERROR`})(E||={});let ut=v;var dt=class e{get state(){return this.channelAdapter.state}set state(e){this.channelAdapter.state=e}get joinedOnce(){return this.channelAdapter.joinedOnce}get timeout(){return this.socket.timeout}get joinPush(){return this.channelAdapter.joinPush}get rejoinTimer(){return this.channelAdapter.rejoinTimer}constructor(e,t={config:{}},n){if(this.topic=e,this.params=t,this.socket=n,this.bindings={},this.subTopic=e.replace(/^realtime:/i,``),this.params.config=Object.assign({broadcast:{ack:!1,self:!1},presence:{key:``,enabled:!1},private:!1},t.config),this.channelAdapter=new $e(this.socket.socketAdapter,e,this.params),this.presence=new Ze(this),this._onClose(()=>{this.socket._remove(this)}),this._updateFilterTransform(),this.broadcastEndpointURL=Ee(this.socket.socketAdapter.endPointURL()),this.private=this.params.config.private||!1,!this.private&&this.params.config?.broadcast?.replay)throw Error(`tried to use replay on public channel '${this.topic}'. It must be a private channel.`)}subscribe(e,t=this.timeout){if(this.socket.isConnected()||this.socket.connect(),this.channelAdapter.isClosed()){let{config:{broadcast:n,presence:r,private:i,postgres_changes_options:a}}=this.params,o=this.bindings.postgres_changes?.map(e=>e.filter)??[],s=!!this.bindings[T.PRESENCE]&&this.bindings[T.PRESENCE].length>0||this.params.config.presence?.enabled===!0,c={},l=Object.assign({broadcast:n,presence:Object.assign(Object.assign({},r),{enabled:s}),postgres_changes:o,private:i},a?{postgres_changes_options:a}:{});this.socket.accessTokenValue&&(c.access_token=this.socket.accessTokenValue),this._onError(t=>{e?.(E.CHANNEL_ERROR,Qe(t))}),this._onClose(()=>e?.(E.CLOSED)),this.updateJoinPayload(Object.assign({config:l},c)),this._updateFilterMessage();let u=a?.wait&&o.length>0?Math.max(t,(a.timeout??15e3)+1e4):t;this.channelAdapter.subscribe(u).receive(`ok`,async({postgres_changes:t})=>{if(this.socket._isManualToken()||this.socket.setAuth(),t===void 0){e?.(E.SUBSCRIBED);return}this._updatePostgresBindings(t,e)}).receive(`error`,t=>{this.state=v.errored;let n=Object.values(t).join(`, `)||`error`;e?.(E.CHANNEL_ERROR,Error(n,{cause:t}))}).receive(`timeout`,()=>{e?.(E.TIMED_OUT)})}return this}_updatePostgresBindings(t,n){let r=this.bindings.postgres_changes,i=r?.length??0,a=[];for(let o=0;o<i;o++){let i=r[o],{filter:{event:s,schema:c,table:l,filter:u}}=i,d=t&&t[o];if(d&&d.event===s&&e.isFilterValueEqual(d.schema,c)&&e.isFilterValueEqual(d.table,l)&&e.isFilterValueEqual(d.filter,u))a.push(Object.assign(Object.assign({},i),{id:d.id}));else{this.unsubscribe(),this.state=v.errored,n?.(E.CHANNEL_ERROR,Error(`mismatch between server and client bindings for postgres changes`));return}}this.bindings.postgres_changes=a,this.state!=v.errored&&n&&n(E.SUBSCRIBED)}presenceState(){return this.presence.state}async track(e,t={}){return await this.send({type:`presence`,event:`track`,payload:e},t)}async untrack(e={}){return await this.send({type:`presence`,event:`untrack`},e)}on(e,t,n){let r=this.channelAdapter.isJoined()||this.channelAdapter.isJoining(),i=e===T.PRESENCE||e===T.POSTGRES_CHANGES;if(r&&i)throw this.socket.log(`channel`,`cannot add \`${e}\` callbacks for ${this.topic} after \`subscribe()\`.`),Error(`cannot add \`${e}\` callbacks for ${this.topic} after \`subscribe()\`.`);return this._on(e,t,n)}async httpSend(e,t,n={}){if(t==null)return Promise.reject(Error(`Payload is required for httpSend()`));let r=t instanceof ArrayBuffer||ArrayBuffer.isView(t),i={apikey:this.socket.apiKey?this.socket.apiKey:``,"Content-Type":r?`application/octet-stream`:`application/json`};this.socket.accessTokenValue&&(i.Authorization=`Bearer ${this.socket.accessTokenValue}`);let a=new URL(this.broadcastEndpointURL);a.pathname+=`/${encodeURIComponent(this.subTopic)}/events/${encodeURIComponent(e)}`,this.private&&a.searchParams.set(`private`,`true`);let o={method:`POST`,headers:i,body:r?t:JSON.stringify(t)},s=await this._fetchWithTimeout(a.toString(),o,n.timeout??this.timeout);if(s.status===202)return{success:!0};if(s.status===404)return Promise.reject(Error(`httpSend() requires Realtime server v2.97.0 or newer; the endpoint returned 404. Update your Supabase CLI to a recent version, or upgrade the Realtime server in your self-hosted setup. See https://github.com/supabase/supabase-js/blob/master/packages/core/realtime-js/migrations/httpsend-server-version.md`));let c=s.statusText;try{let e=await s.json();c=e.error||e.message||c}catch{}return Promise.reject(Error(c))}async send(e,t={}){if(!this.channelAdapter.canPush()&&e.type===`broadcast`){let n=`Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.`;this.socket.hasLogger()?this.socket.log(`channel`,n):console.warn(n);let{event:r,payload:i}=e,a={apikey:this.socket.apiKey?this.socket.apiKey:``,"Content-Type":`application/json`};this.socket.accessTokenValue&&(a.Authorization=`Bearer ${this.socket.accessTokenValue}`);let o={method:`POST`,headers:a,body:JSON.stringify({messages:[{topic:this.subTopic,event:r,payload:i,private:this.private}]})};try{let e=await this._fetchWithTimeout(this.broadcastEndpointURL,o,t.timeout??this.timeout);return await e.body?.cancel(),e.ok?`ok`:`error`}catch(e){return e instanceof Error&&e.name===`AbortError`?`timed out`:`error`}}else return new Promise(n=>{let r=this.channelAdapter.push(e.type,e,t.timeout||this.timeout);e.type===`broadcast`&&!this.params?.config?.broadcast?.ack&&n(`ok`),r.receive(`ok`,()=>n(`ok`)),r.receive(`error`,()=>n(`error`)),r.receive(`timeout`,()=>n(`timed out`))})}updateJoinPayload(e){this.channelAdapter.updateJoinPayload(e)}async unsubscribe(e=this.timeout){return new Promise(t=>{this.channelAdapter.unsubscribe(e).receive(`ok`,()=>t(`ok`)).receive(`timeout`,()=>t(`timed out`)).receive(`error`,()=>t(`error`))})}teardown(){this.channelAdapter.teardown()}async _fetchWithTimeout(e,t,n){let r=new AbortController,i=setTimeout(()=>r.abort(),n),a=await this.socket.fetch(e,Object.assign(Object.assign({},t),{signal:r.signal}));return clearTimeout(i),a}_on(t,n,r){let i=t.toLocaleLowerCase(),a=n?.filter;if((a instanceof st||typeof a==`object`&&a&&typeof a.build==`function`)&&(n=Object.assign(Object.assign({},n),{filter:a.build()})),i===T.POSTGRES_CHANGES&&this.bindings[i]?.find(t=>e.isSamePostgresFilter(t.filter,n)))return this.socket.log(`error`,`duplicate \`postgres_changes\` binding for ${this.topic} ignored`,n),this;let o=this.channelAdapter.on(t,r),s={type:i,filter:n,callback:r,ref:o};return this.bindings[i]?this.bindings[i].push(s):this.bindings[i]=[s],this._updateFilterMessage(),this}_onClose(e){this.channelAdapter.onClose(e)}_onError(e){this.channelAdapter.onError(e)}_updateFilterMessage(){this.channelAdapter.updateFilterBindings((e,t,n)=>{let r=e.event.toLocaleLowerCase();if(this._notThisChannelEvent(r,n))return!1;let i=this.bindings[r]?.find(t=>t.ref===e.ref);if(!i)return!0;if([`broadcast`,`presence`,`postgres_changes`].includes(r))if(`id`in i){let e=i.id,n=i.filter?.event;return e&&t.ids?.includes(e)&&(n===`*`||n?.toLocaleLowerCase()===t.data?.type.toLocaleLowerCase())}else{let e=(i?.filter?.event)?.toLocaleLowerCase();return e===`*`||e===(t?.event)?.toLocaleLowerCase()}else return i.type.toLocaleLowerCase()===r})}_notThisChannelEvent(e,t){let{close:n,error:r,leave:i,join:a}=me;return t&&[n,r,i,a].includes(e)&&t!==this.joinPush.ref}_updateFilterTransform(){this.channelAdapter.updatePayloadTransform((e,t,n)=>{if(typeof t==`object`&&`ids`in t){let e=t.data,{schema:n,table:r,commit_timestamp:i,type:a,errors:o}=e,s={schema:n,table:r,commit_timestamp:i,eventType:a,new:{},old:{},errors:o};return Object.assign(Object.assign({},s),this._getPayloadRecords(e))}return t})}copyBindings(e){if(this.joinedOnce)throw Error(`cannot copy bindings into joined channel`);for(let t in e.bindings)for(let n of e.bindings[t])this._on(n.type,n.filter,n.callback)}static isFilterValueEqual(e,t){return(e??void 0)===(t??void 0)}static isSamePostgresFilter(t,n){let r=(t?.select)?.join()??void 0,i=(n?.select)?.join()??void 0;return t?.event===n?.event&&e.isFilterValueEqual(t?.schema,n?.schema)&&e.isFilterValueEqual(t?.table,n?.table)&&e.isFilterValueEqual(t?.filter,n?.filter)&&r===i}_getPayloadRecords(e){let t={new:{},old:{}};return(e.type===`INSERT`||e.type===`UPDATE`)&&(t.new=_e(e.columns,e.record)),(e.type===`UPDATE`||e.type===`DELETE`)&&(t.old=_e(e.columns,e.old_record)),t}},ft=class{constructor(e,t){this.socket=new We(e,t)}get timeout(){return this.socket.timeout}get endPoint(){return this.socket.endPoint}get transport(){return this.socket.transport}get heartbeatIntervalMs(){return this.socket.heartbeatIntervalMs}get heartbeatCallback(){return this.socket.heartbeatCallback}set heartbeatCallback(e){this.socket.heartbeatCallback=e}get heartbeatTimer(){return this.socket.heartbeatTimer}get pendingHeartbeatRef(){return this.socket.pendingHeartbeatRef}get reconnectTimer(){return this.socket.reconnectTimer}get vsn(){return this.socket.vsn}get encode(){return this.socket.encode}get decode(){return this.socket.decode}get reconnectAfterMs(){return this.socket.reconnectAfterMs}get sendBuffer(){return this.socket.sendBuffer}get stateChangeCallbacks(){return this.socket.stateChangeCallbacks}connect(){this.socket.connect()}disconnect(e,t,n,r=1e4){return new Promise(i=>{setTimeout(()=>i(`timeout`),r),this.socket.disconnect(()=>{e(),i(`ok`)},t,n)})}push(e){this.socket.push(e)}log(e,t,n){this.socket.log(e,t,n)}hasLogger(){return this.socket.hasLogger()}makeRef(){return this.socket.makeRef()}onOpen(e){this.socket.onOpen(e)}onClose(e){this.socket.onClose(e)}onError(e){this.socket.onError(e)}onMessage(e){this.socket.onMessage(e)}isConnected(){return this.socket.isConnected()}isConnecting(){return this.socket.connectionState()==he.connecting}isDisconnecting(){return this.socket.connectionState()==he.closing}connectionState(){return this.socket.connectionState()}endPointURL(){return this.socket.endPointURL()}sendHeartbeat(){this.socket.sendHeartbeat()}getSocket(){return this.socket}};let pt={HEARTBEAT_INTERVAL:25e3,RECONNECT_DELAY:10,HEARTBEAT_TIMEOUT_FALLBACK:100},mt=[1e3,2e3,5e3,1e4];function ht(){let e=new Map;return{get length(){return e.size},clear(){e.clear()},getItem(t){return e.has(t)?e.get(t):null},key(t){return Array.from(e.keys())[t]??null},removeItem(t){e.delete(t)},setItem(t,n){e.set(t,String(n))}}}function gt(){try{if(typeof globalThis<`u`&&globalThis.sessionStorage)return globalThis.sessionStorage}catch{}return ht()}var _t=class{get endPoint(){return this.socketAdapter.endPoint}get timeout(){return this.socketAdapter.timeout}get transport(){return this.socketAdapter.transport}get heartbeatCallback(){return this.socketAdapter.heartbeatCallback}get heartbeatIntervalMs(){return this.socketAdapter.heartbeatIntervalMs}get heartbeatTimer(){return this.worker?this._workerHeartbeatTimer:this.socketAdapter.heartbeatTimer}get pendingHeartbeatRef(){return this.worker?this._pendingWorkerHeartbeatRef:this.socketAdapter.pendingHeartbeatRef}get reconnectTimer(){return this.socketAdapter.reconnectTimer}get vsn(){return this.socketAdapter.vsn}get encode(){return this.socketAdapter.encode}get decode(){return this.socketAdapter.decode}get reconnectAfterMs(){return this.socketAdapter.reconnectAfterMs}get sendBuffer(){return this.socketAdapter.sendBuffer}get stateChangeCallbacks(){return this.socketAdapter.stateChangeCallbacks}constructor(e,t){if(this.channels=[],this.accessTokenValue=null,this.accessToken=null,this.apiKey=null,this.httpEndpoint=``,this.headers={},this.params={},this.ref=0,this.serializer=new ge,this._manuallySetToken=!1,this._authPromise=null,this._authGeneration=0,this._workerHeartbeatTimer=void 0,this._pendingWorkerHeartbeatRef=null,this._pendingDisconnectTimer=null,this._disconnectOnEmptyChannelsAfterMs=0,this._resolveFetch=e=>e?(...t)=>e(...t):(...e)=>fetch(...e),!t?.params?.apikey)throw Error(`API key is required to connect to Realtime`);this.apiKey=t.params.apikey,this.socketAdapter=new ft(e,this._initializeOptions(t)),this.httpEndpoint=Ee(e),this.fetch=this._resolveFetch(t?.fetch)}connect(){if(!(this.isConnecting()||this.isDisconnecting()||this.isConnected())){this.accessToken&&!this._authPromise&&this._setAuthSafely(`connect`),this._setupConnectionHandlers();try{this.socketAdapter.connect()}catch(e){let t=e.message;throw Error(`WebSocket not available: ${t}`)}this._handleNodeJsRaceCondition()}}endpointURL(){return this.socketAdapter.endPointURL()}async disconnect(e,t){return this._cancelPendingDisconnect(),this.isDisconnecting()?`ok`:await this.socketAdapter.disconnect(()=>{clearInterval(this._workerHeartbeatTimer),this._terminateWorker()},e,t)}getChannels(){return this.channels}async removeChannel(e){let t=await e.unsubscribe();return t===`ok`&&e.teardown(),t}async removeAllChannels(){let e=this.channels.map(async e=>{let t=await e.unsubscribe();return e.teardown(),t}),t=await Promise.all(e);return await this.disconnect(),t}log(e,t,n){this.socketAdapter.log(e,t,n)}hasLogger(){return this.socketAdapter.hasLogger()}connectionState(){return this.socketAdapter.connectionState()||he.closed}isConnected(){return this.socketAdapter.isConnected()}isConnecting(){return this.socketAdapter.isConnecting()}isDisconnecting(){return this.socketAdapter.isDisconnecting()}channel(e,t={config:{}}){let n=`realtime:${e}`,r=this.getChannels().find(e=>e.topic===n);if(r)return r;{let n=new dt(`realtime:${e}`,t,this);return this._cancelPendingDisconnect(),this.channels.push(n),n}}push(e){this.socketAdapter.push(e)}async setAuth(e=null){let t=++this._authGeneration,n=this._performAuth(e,t);t===this._authGeneration&&(this._authPromise=n);try{await n}finally{this._authPromise===n&&(this._authPromise=null)}}_isManualToken(){return this._manuallySetToken}async sendHeartbeat(){this.socketAdapter.sendHeartbeat()}onHeartbeat(e){this.socketAdapter.heartbeatCallback=this._wrapHeartbeatCallback(e)}_makeRef(){return this.socketAdapter.makeRef()}_remove(e){this.channels=this.channels.filter(t=>t.topic!==e.topic),this.channels.length===0&&(this.log(`transport`,`no channels remaining, scheduling disconnect`),this._schedulePendingDisconnect())}_schedulePendingDisconnect(){if(this._cancelPendingDisconnect(),this._disconnectOnEmptyChannelsAfterMs===0){this.log(`transport`,`disconnecting immediately - no channels`),this.disconnect();return}this._pendingDisconnectTimer=setTimeout(()=>{this._pendingDisconnectTimer=null,this.channels.length===0&&(this.log(`transport`,`deferred disconnect fired - no channels, disconnecting`),this.disconnect())},this._disconnectOnEmptyChannelsAfterMs),this.log(`transport`,`deferred disconnect scheduled in ${this._disconnectOnEmptyChannelsAfterMs}ms`)}_cancelPendingDisconnect(){this._pendingDisconnectTimer!==null&&(this.log(`transport`,`pending disconnect cancelled - channel activity detected`),clearTimeout(this._pendingDisconnectTimer),this._pendingDisconnectTimer=null)}async _performAuth(e,t){let n,r=!1;if(e)n=e,r=!0;else if(this.accessToken)try{n=await this.accessToken()}catch(e){this.log(`error`,`Error fetching access token from callback`,e),n=this.accessTokenValue}else n=this.accessTokenValue;t===this._authGeneration&&(this.accessToken?this._manuallySetToken=!1:r&&(this._manuallySetToken=!0),this.accessTokenValue!=n&&(this.accessTokenValue=n,this.channels.forEach(e=>{let t={access_token:n,version:`realtime-js/2.118.0`};e.updateJoinPayload(t),e.joinedOnce&&e.channelAdapter.isJoined()&&e.channelAdapter.push(me.access_token,{access_token:n})})))}async _waitForAuthIfNeeded(){this._authPromise&&await this._authPromise}_setAuthSafely(e=`general`){this._isManualToken()||this.setAuth().catch(t=>{this.log(`error`,`Error setting auth in ${e}`,t)})}_setupConnectionHandlers(){this.socketAdapter.onOpen(()=>{(this._authPromise||(this.accessToken&&!this.accessTokenValue?this.setAuth():Promise.resolve())).catch(e=>{this.log(`error`,`error waiting for auth on connect`,e)}),this.worker&&!this.workerRef&&this._startWorkerHeartbeat()}),this.socketAdapter.onClose(()=>{this.worker&&this.workerRef&&this._terminateWorker()}),this.socketAdapter.onMessage(e=>{e.ref&&e.ref===this._pendingWorkerHeartbeatRef&&(this._pendingWorkerHeartbeatRef=null)})}_handleNodeJsRaceCondition(){this.socketAdapter.isConnected()&&this.socketAdapter.getSocket().onConnOpen()}_wrapHeartbeatCallback(e){return(t,n)=>{t!==`disconnected`&&(t==`sent`&&this._setAuthSafely(),e&&e(t,n))}}_startWorkerHeartbeat(){this.workerUrl?this.log(`worker`,`starting worker for from ${this.workerUrl}`):this.log(`worker`,`starting default worker`);let e=this._workerObjectUrl(this.workerUrl);this.workerRef=new Worker(e),this.workerRef.onerror=e=>{this.log(`worker`,`worker error`,e.message),this._terminateWorker(),this.disconnect()},this.workerRef.onmessage=e=>{e.data.event===`keepAlive`&&this.sendHeartbeat()},this.workerRef.postMessage({event:`start`,interval:this.heartbeatIntervalMs})}_terminateWorker(){this.workerRef&&=(this.log(`worker`,`terminating worker`),this.workerRef.terminate(),void 0)}_workerObjectUrl(e){let t;if(e)t=e;else{let e=new Blob([`
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`],{type:`application/javascript`});t=URL.createObjectURL(e)}return t}_initializeOptions(e){this.worker=e?.worker??!1,this.accessToken=e?.accessToken??null;let t={};t.timeout=e?.timeout??1e4,t.heartbeatIntervalMs=e?.heartbeatIntervalMs??pt.HEARTBEAT_INTERVAL,this._disconnectOnEmptyChannelsAfterMs=e?.disconnectOnEmptyChannelsAfterMs??2*(e?.heartbeatIntervalMs??pt.HEARTBEAT_INTERVAL),t.transport=e?.transport??pe.getWebSocketConstructor(),t.params=e?.params,t.logger=e?.logger,t.heartbeatCallback=this._wrapHeartbeatCallback(e?.heartbeatCallback),t.sessionStorage=e?.sessionStorage??gt(),t.reconnectAfterMs=e?.reconnectAfterMs??(e=>mt[e-1]||1e4);let n,r,i=e?.vsn??`2.0.0`;switch(i){case`1.0.0`:n=(e,t)=>t(JSON.stringify(e)),r=(e,t)=>t(JSON.parse(e));break;case`2.0.0`:n=this.serializer.encode.bind(this.serializer),r=this.serializer.decode.bind(this.serializer);break;default:throw Error(`Unsupported serializer version: ${t.vsn}`)}if(t.vsn=i,t.encode=e?.encode??n,t.decode=e?.decode??r,t.beforeReconnect=this._reconnectAuth.bind(this),(e?.logLevel||e?.log_level)&&(this.logLevel=e.logLevel||e.log_level,t.params=Object.assign(Object.assign({},t.params),{log_level:this.logLevel})),this.worker){if(typeof window<`u`&&!window.Worker)throw Error(`Web Worker is not supported`);this.workerUrl=e?.workerUrl,t.autoSendHeartbeat=!this.worker}return t}async _reconnectAuth(){await this._waitForAuthIfNeeded(),this.isConnected()||this.connect()}},vt=class extends Error{constructor(e,t){super(e),this.name=`IcebergError`,this.status=t.status,this.icebergType=t.icebergType,this.icebergCode=t.icebergCode,this.details=t.details,this.isCommitStateUnknown=t.icebergType===`CommitStateUnknownException`||[500,502,504].includes(t.status)&&t.icebergType?.includes(`CommitState`)===!0}isNotFound(){return this.status===404}isConflict(){return this.status===409}isAuthenticationTimeout(){return this.status===419}};function yt(e,t,n){let r=new URL(t,e);if(n)for(let[e,t]of Object.entries(n))t!==void 0&&r.searchParams.set(e,t);return r.toString()}async function bt(e){return!e||e.type===`none`?{}:e.type===`bearer`?{Authorization:`Bearer ${e.token}`}:e.type===`header`?{[e.name]:e.value}:e.type===`custom`?await e.getHeaders():{}}function xt(e){let t=e.fetchImpl??globalThis.fetch;return{async request({method:n,path:r,query:i,body:a,headers:o}){let s=yt(e.baseUrl,r,i),c=await bt(e.auth),l=await t(s,{method:n,headers:{...a?{"Content-Type":`application/json`}:{},...c,...o},body:a?JSON.stringify(a):void 0}),u=await l.text(),d=(l.headers.get(`content-type`)||``).includes(`application/json`),f=d&&u?JSON.parse(u):u;if(!l.ok){let e=d?f:void 0,t=e?.error;throw new vt(t?.message??`Request failed with status ${l.status}`,{status:l.status,icebergType:t?.type,icebergCode:t?.code,details:e})}return{status:l.status,headers:l.headers,data:f}}}}function St(e){return e.join(``)}var Ct=class{constructor(e,t=``){this.client=e,this.prefix=t}async listNamespaces(e){let t=e?{parent:St(e.namespace)}:void 0;return(await this.client.request({method:`GET`,path:`${this.prefix}/namespaces`,query:t})).data.namespaces.map(e=>({namespace:e}))}async createNamespace(e,t){let n={namespace:e.namespace,properties:t?.properties};return(await this.client.request({method:`POST`,path:`${this.prefix}/namespaces`,body:n})).data}async dropNamespace(e){await this.client.request({method:`DELETE`,path:`${this.prefix}/namespaces/${St(e.namespace)}`})}async loadNamespaceMetadata(e){return{properties:(await this.client.request({method:`GET`,path:`${this.prefix}/namespaces/${St(e.namespace)}`})).data.properties}}async namespaceExists(e){try{return await this.client.request({method:`HEAD`,path:`${this.prefix}/namespaces/${St(e.namespace)}`}),!0}catch(e){if(e instanceof vt&&e.status===404)return!1;throw e}}async createNamespaceIfNotExists(e,t){try{return await this.createNamespace(e,t)}catch(e){if(e instanceof vt&&e.status===409)return;throw e}}};function wt(e){return e.join(``)}var Tt=class{constructor(e,t=``,n){this.client=e,this.prefix=t,this.accessDelegation=n}async listTables(e){return(await this.client.request({method:`GET`,path:`${this.prefix}/namespaces/${wt(e.namespace)}/tables`})).data.identifiers}async createTable(e,t){let n={};return this.accessDelegation&&(n[`X-Iceberg-Access-Delegation`]=this.accessDelegation),(await this.client.request({method:`POST`,path:`${this.prefix}/namespaces/${wt(e.namespace)}/tables`,body:t,headers:n})).data.metadata}async updateTable(e,t){let n=await this.client.request({method:`POST`,path:`${this.prefix}/namespaces/${wt(e.namespace)}/tables/${e.name}`,body:t});return{"metadata-location":n.data[`metadata-location`],metadata:n.data.metadata}}async dropTable(e,t){await this.client.request({method:`DELETE`,path:`${this.prefix}/namespaces/${wt(e.namespace)}/tables/${e.name}`,query:{purgeRequested:String(t?.purge??!1)}})}async loadTable(e){let t={};return this.accessDelegation&&(t[`X-Iceberg-Access-Delegation`]=this.accessDelegation),(await this.client.request({method:`GET`,path:`${this.prefix}/namespaces/${wt(e.namespace)}/tables/${e.name}`,headers:t})).data.metadata}async tableExists(e){let t={};this.accessDelegation&&(t[`X-Iceberg-Access-Delegation`]=this.accessDelegation);try{return await this.client.request({method:`HEAD`,path:`${this.prefix}/namespaces/${wt(e.namespace)}/tables/${e.name}`,headers:t}),!0}catch(e){if(e instanceof vt&&e.status===404)return!1;throw e}}async createTableIfNotExists(e,t){try{return await this.createTable(e,t)}catch(n){if(n instanceof vt&&n.status===409)return await this.loadTable({namespace:e.namespace,name:t.name});throw n}}},Et=class{constructor(e){let t=`v1`;e.catalogName&&(t+=`/${e.catalogName}`),this.client=xt({baseUrl:e.baseUrl.endsWith(`/`)?e.baseUrl:`${e.baseUrl}/`,auth:e.auth,fetchImpl:e.fetch}),this.accessDelegation=e.accessDelegation?.join(`,`),this.namespaceOps=new Ct(this.client,t),this.tableOps=new Tt(this.client,t,this.accessDelegation)}async listNamespaces(e){return this.namespaceOps.listNamespaces(e)}async createNamespace(e,t){return this.namespaceOps.createNamespace(e,t)}async dropNamespace(e){await this.namespaceOps.dropNamespace(e)}async loadNamespaceMetadata(e){return this.namespaceOps.loadNamespaceMetadata(e)}async listTables(e){return this.tableOps.listTables(e)}async createTable(e,t){return this.tableOps.createTable(e,t)}async updateTable(e,t){return this.tableOps.updateTable(e,t)}async dropTable(e,t){await this.tableOps.dropTable(e,t)}async loadTable(e){return this.tableOps.loadTable(e)}async namespaceExists(e){return this.namespaceOps.namespaceExists(e)}async tableExists(e){return this.tableOps.tableExists(e)}async createNamespaceIfNotExists(e,t){return this.namespaceOps.createNamespaceIfNotExists(e,t)}async createTableIfNotExists(e,t){return this.tableOps.createTableIfNotExists(e,t)}};function Dt(e){"@babel/helpers - typeof";return Dt=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Dt(e)}function Ot(e,t){if(Dt(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(Dt(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function kt(e){var t=Ot(e,`string`);return Dt(t)==`symbol`?t:t+``}function At(e,t,n){return(t=kt(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function jt(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function D(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?jt(Object(n),!0).forEach(function(t){At(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):jt(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var Mt=class extends Error{constructor(e,t=`storage`,n,r){super(e),this.__isStorageError=!0,this.namespace=t,this.name=t===`vectors`?`StorageVectorsError`:`StorageError`,this.status=n,this.statusCode=r}toJSON(){return{name:this.name,message:this.message,status:this.status,statusCode:this.statusCode}}};function Nt(e){return typeof e==`object`&&!!e&&`__isStorageError`in e}var Pt=class extends Mt{constructor(e,t,n,r=`storage`,i){super(e,r,t,n),this.name=r===`vectors`?`StorageVectorsApiError`:`StorageApiError`,this.status=t,this.statusCode=n,this.code=i}toJSON(){return D(D({},super.toJSON()),{},{code:this.code})}},Ft=class extends Mt{constructor(e,t,n=`storage`){super(e,n),this.name=n===`vectors`?`StorageVectorsUnknownError`:`StorageUnknownError`,this.originalError=t}};function It(e,t,n){let r=D({},e),i=t.toLowerCase();for(let e of Object.keys(r))e.toLowerCase()===i&&delete r[e];return r[i]=n,r}function Lt(e){let t={};for(let[n,r]of Object.entries(e))t[n.toLowerCase()]=r;return t}let Rt=e=>e?(...t)=>e(...t):(...e)=>fetch(...e),zt=e=>{if(typeof e!=`object`||!e)return!1;let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype||Object.getPrototypeOf(t)===null)&&!(Symbol.toStringTag in e)&&!(Symbol.iterator in e)},Bt=e=>{if(Array.isArray(e))return e.map(e=>Bt(e));if(typeof e==`function`||e!==Object(e))return e;let t={};return Object.entries(e).forEach(([e,n])=>{let r=e.replace(/([-_][a-z])/gi,e=>e.toUpperCase().replace(/[-_]/g,``));t[r]=Bt(n)}),t},Vt=e=>!e||typeof e!=`string`||e.length===0||e.length>100||e.trim()!==e||e.includes(`/`)||e.includes(`\\`)?!1:/^[\w!.\*'() &$@=;:+,?-]+$/.test(e),Ht=e=>e.split(`/`).map(encodeURIComponent).join(`/`),Ut=e=>{if(typeof e==`object`&&e){let t=e;if(typeof t.msg==`string`)return t.msg;if(typeof t.message==`string`)return t.message;if(typeof t.error_description==`string`)return t.error_description;if(typeof t.error==`string`)return t.error;if(typeof t.error==`object`&&t.error!==null){let e=t.error;if(typeof e.message==`string`)return e.message}}return JSON.stringify(e)},Wt=async(e,t,n,r)=>{if(typeof e==`object`&&e&&`json`in e&&typeof e.json==`function`){let n=e,i=parseInt(String(n.status),10);Number.isFinite(i)||(i=500),n.json().then(e=>{let n=e?.statusCode||e?.code||i+``;t(new Pt(Ut(e),i,n,r,e?.code))}).catch(()=>{let e=i+``;t(new Pt(n.statusText||`HTTP ${i} error`,i,e,r))})}else t(new Ft(Ut(e),e,r))},Gt=(e,t,n,r)=>{let i={method:e,headers:t?.headers||{}};if(e===`GET`||e===`HEAD`||!r)return D(D({},i),n);if(zt(r)){let e=t?.headers||{},n;for(let[t,r]of Object.entries(e))t.toLowerCase()===`content-type`&&(n=r);i.headers=It(e,`Content-Type`,n??`application/json`),i.body=JSON.stringify(r)}else i.body=r;return t?.duplex&&(i.duplex=t.duplex),D(D({},i),n)};async function Kt(e,t,n,r,i,a,o){return new Promise((s,c)=>{e(n,Gt(t,r,i,a)).then(e=>{if(!e.ok)throw e;if(r?.noResolveJson)return e;if(o===`vectors`){let t=e.headers.get(`content-type`);if(e.headers.get(`content-length`)===`0`||e.status===204||!t||!t.includes(`application/json`))return{}}return e.json()}).then(e=>s(e)).catch(e=>Wt(e,c,r,o))})}function qt(e=`storage`){return{get:async(t,n,r,i)=>Kt(t,`GET`,n,r,i,void 0,e),post:async(t,n,r,i,a)=>Kt(t,`POST`,n,i,a,r,e),put:async(t,n,r,i,a)=>Kt(t,`PUT`,n,i,a,r,e),head:async(t,n,r,i)=>Kt(t,`HEAD`,n,D(D({},r),{},{noResolveJson:!0}),i,void 0,e),remove:async(t,n,r,i,a)=>Kt(t,`DELETE`,n,i,a,r,e)}}let{get:O,post:k,put:Jt,head:Yt,remove:A}=qt(`storage`),j=qt(`vectors`);var Xt=class{constructor(e,t={},n,r=`storage`){this.shouldThrowOnError=!1,this.url=e,this.headers=Lt(t),this.fetch=Rt(n),this.namespace=r}throwOnError(){return this.shouldThrowOnError=!0,this}setHeader(e,t){return this.headers=It(this.headers,e,t),this}async handleOperation(e){var t=this;try{return{data:await e(),error:null}}catch(e){if(t.shouldThrowOnError)throw e;if(Nt(e))return{data:null,error:e};throw e}}};let Zt;Zt=Symbol.toStringTag;var Qt=class{constructor(e,t){this.downloadFn=e,this.shouldThrowOnError=t,this[Zt]=`StreamDownloadBuilder`,this.promise=null}then(e,t){return this.getPromise().then(e,t)}catch(e){return this.getPromise().catch(e)}finally(e){return this.getPromise().finally(e)}getPromise(){return this.promise||=this.execute(),this.promise}async execute(){var e=this;try{return{data:(await e.downloadFn()).body,error:null}}catch(t){if(e.shouldThrowOnError)throw t;if(Nt(t))return{data:null,error:t};throw t}}};let $t;$t=Symbol.toStringTag;var en=class{constructor(e,t){this.downloadFn=e,this.shouldThrowOnError=t,this[$t]=`BlobDownloadBuilder`,this.promise=null}asStream(){return new Qt(this.downloadFn,this.shouldThrowOnError)}then(e,t){return this.getPromise().then(e,t)}catch(e){return this.getPromise().catch(e)}finally(e){return this.getPromise().finally(e)}getPromise(){return this.promise||=this.execute(),this.promise}async execute(){var e=this;try{return{data:await(await e.downloadFn()).blob(),error:null}}catch(t){if(e.shouldThrowOnError)throw t;if(Nt(t))return{data:null,error:t};throw t}}};let tn={limit:100,offset:0,sortBy:{column:`name`,order:`asc`}},nn={cacheControl:`3600`,contentType:`text/plain;charset=UTF-8`,upsert:!1};var rn=class extends Xt{constructor(e,t={},n,r){super(e,t,r,`storage`),this.bucketId=n}async uploadOrUpdate(e,t,n,r){var i=this;return i.handleOperation(async()=>{let a,o=D(D({},nn),r),s=D(D({},i.headers),e===`POST`&&{"x-upsert":String(o.upsert)}),c=o.metadata;if(typeof Blob<`u`&&n instanceof Blob||typeof FormData<`u`&&n instanceof FormData?a=i.prepareUploadFormData(n,o):(a=n,s[`cache-control`]=`max-age=${o.cacheControl}`,s[`content-type`]=o.contentType,o.contentEncoding&&(s[`content-encoding`]=o.contentEncoding),c&&(s[`x-metadata`]=i.toBase64(i.encodeMetadata(c))),(typeof ReadableStream<`u`&&a instanceof ReadableStream||a&&typeof a==`object`&&`pipe`in a&&typeof a.pipe==`function`)&&!o.duplex&&(o.duplex=`half`)),r?.headers)for(let[e,t]of Object.entries(r.headers))s=It(s,e,t);let l=i._removeEmptyFolders(t),u=i._getFinalPath(l),d=await(e==`PUT`?Jt:k)(i.fetch,`${i.url}/object/${u}`,a,D({headers:s},o?.duplex?{duplex:o.duplex}:{}));return{path:l,id:d.Id,fullPath:d.Key}})}async upload(e,t,n){return this.uploadOrUpdate(`POST`,e,t,n)}async uploadToSignedUrl(e,t,n,r){var i=this;let a=i._removeEmptyFolders(e),o=i._getFinalPath(a),s=new URL(i.url+`/object/upload/sign/${o}`);return s.searchParams.set(`token`,t),i.handleOperation(async()=>{let e,t=D(D({},nn),r),o=D(D({},i.headers),{"x-upsert":String(t.upsert)}),c=t.metadata;if(typeof Blob<`u`&&n instanceof Blob||typeof FormData<`u`&&n instanceof FormData?e=i.prepareUploadFormData(n,t):(e=n,o[`cache-control`]=`max-age=${t.cacheControl}`,o[`content-type`]=t.contentType,t.contentEncoding&&(o[`content-encoding`]=t.contentEncoding),c&&(o[`x-metadata`]=i.toBase64(i.encodeMetadata(c))),(typeof ReadableStream<`u`&&e instanceof ReadableStream||e&&typeof e==`object`&&`pipe`in e&&typeof e.pipe==`function`)&&!t.duplex&&(t.duplex=`half`)),r?.headers)for(let[e,t]of Object.entries(r.headers))o=It(o,e,t);return{path:a,fullPath:(await Jt(i.fetch,s.toString(),e,D({headers:o},t?.duplex?{duplex:t.duplex}:{}))).Key}})}async createSignedUploadUrl(e,t){var n=this;return n.handleOperation(async()=>{let r=n._getFinalPath(e),i=D({},n.headers);t?.upsert&&(i[`x-upsert`]=`true`);let a=await k(n.fetch,`${n.url}/object/upload/sign/${r}`,{},{headers:i}),o=new URL(n.url+a.url),s=o.searchParams.get(`token`);if(!s)throw new Mt(`No token returned by API`);return{signedUrl:o.toString(),path:e,token:s}})}async update(e,t,n){return this.uploadOrUpdate(`PUT`,e,t,n)}async move(e,t,n){var r=this;return r.handleOperation(async()=>await k(r.fetch,`${r.url}/object/move`,{bucketId:r.bucketId,sourceKey:e,destinationKey:t,destinationBucket:n?.destinationBucket,sourceVersionId:n?.sourceVersionId},{headers:r.headers}))}async copy(e,t,n){var r=this;return r.handleOperation(async()=>{let i=n;return{path:(await k(r.fetch,`${r.url}/object/copy`,{bucketId:r.bucketId,sourceKey:e,destinationKey:t,destinationBucket:n?.destinationBucket,sourceVersionId:n?.sourceVersionId,copyMetadata:typeof i?.copyMetadata==`boolean`?i.copyMetadata:void 0,metadata:i?.copyMetadata===!1?i.metadata:void 0},{headers:r.headers})).Key}})}async createSignedUrl(e,t,n){var r=this;return r.handleOperation(async()=>{let i=r._getFinalPath(e),a=typeof n?.transform==`object`&&n.transform!==null&&Object.keys(n.transform).length>0,o=await k(r.fetch,`${r.url}/object/sign/${i}`,D(D({expiresIn:t},a?{transform:n.transform}:{}),n?.versionId==null?{}:{versionId:n.versionId}),{headers:r.headers}),s=new URLSearchParams;n?.download&&s.set(`download`,n.download===!0?``:n.download),n?.cacheNonce!=null&&s.set(`cacheNonce`,String(n.cacheNonce));let c=s.toString();return{signedUrl:encodeURI(`${r.url}${o.signedURL}${c?`&${c}`:``}`)}})}async createSignedUrls(e,t,n){var r=this;return r.handleOperation(async()=>{let i=await k(r.fetch,`${r.url}/object/sign/${r.bucketId}`,{expiresIn:t,paths:e},{headers:r.headers}),a=new URLSearchParams;n?.download&&a.set(`download`,n.download===!0?``:n.download),n?.cacheNonce!=null&&a.set(`cacheNonce`,String(n.cacheNonce));let o=a.toString();return i.map(e=>D(D({},e),{},{signedUrl:e.signedURL?encodeURI(`${r.url}${e.signedURL}${o?`&${o}`:``}`):null}))})}download(e,t,n){let r=typeof t?.transform==`object`&&t.transform!==null&&Object.keys(t.transform).length>0?`render/image/authenticated`:`object`,i=new URLSearchParams;t?.transform&&this.applyTransformOptsToQuery(i,t.transform),t?.cacheNonce!=null&&i.set(`cacheNonce`,String(t.cacheNonce)),t?.versionId!=null&&i.set(`versionId`,String(t.versionId));let a=i.toString(),o=this._getFinalPath(e);return new en(()=>O(this.fetch,`${this.url}/${r}/${o}${a?`?${a}`:``}`,{headers:this.headers,noResolveJson:!0},n),this.shouldThrowOnError)}async info(e,t){var n=this;let r=n._getFinalPath(e),i=new URLSearchParams;t?.versionId!=null&&i.set(`versionId`,String(t.versionId));let a=i.toString();return n.handleOperation(async()=>Bt(await O(n.fetch,`${n.url}/object/info/${r}${a?`?${a}`:``}`,{headers:n.headers})))}async exists(e){var t=this;let n=t._getFinalPath(e);try{return await Yt(t.fetch,`${t.url}/object/${n}`,{headers:t.headers}),{data:!0,error:null}}catch(e){if(t.shouldThrowOnError)throw e;if(Nt(e)){let t=e instanceof Pt?e.status:e instanceof Ft?e.originalError?.status:void 0;if(t!==void 0&&[400,404].includes(t))return{data:!1,error:e}}throw e}}getPublicUrl(e,t){let n=this._getFinalPath(e),r=new URLSearchParams;t?.download&&r.set(`download`,t.download===!0?``:t.download),t?.transform&&this.applyTransformOptsToQuery(r,t.transform),t?.cacheNonce!=null&&r.set(`cacheNonce`,String(t.cacheNonce)),t?.versionId!=null&&r.set(`versionId`,String(t.versionId));let i=r.toString(),a=typeof t?.transform==`object`&&t.transform!==null&&Object.keys(t.transform).length>0?`render/image`:`object`;return{data:{publicUrl:encodeURI(`${this.url}/${a}/public/${n}`)+(i?`?${i}`:``)}}}async remove(e){var t=this;return t.handleOperation(async()=>await A(t.fetch,`${t.url}/object/${t.bucketId}`,{prefixes:e},{headers:t.headers}))}async purgeCache(e,t,n){var r=this;return r.handleOperation(async()=>{let i=Ht(r._getFinalPath(e)),a=new URLSearchParams;t?.transformations&&a.set(`transformations`,`true`);let o=a.toString();return await A(r.fetch,`${r.url}/cdn/${i}${o?`?${o}`:``}`,{},{headers:r.headers},n)})}async list(e,t,n){var r=this;return r.handleOperation(async()=>{let i=t?.sortBy?D(D({},tn.sortBy),t.sortBy):tn.sortBy,a=D(D(D({},tn),t),{},{sortBy:i,prefix:e||``});return await k(r.fetch,`${r.url}/object/list/${r.bucketId}`,a,{headers:r.headers},n)})}async listV2(e,t){var n=this;return n.handleOperation(async()=>{let r=D({},e);return await k(n.fetch,`${n.url}/object/list-v2/${n.bucketId}`,r,{headers:n.headers},t)})}prepareUploadFormData(e,t){let n=new FormData,r=[];e instanceof FormData?e.forEach((e,t)=>{typeof e==`string`?n.append(t,e):r.push([t,e])}):r.push([``,e]),n.has(`cacheControl`)||n.append(`cacheControl`,t.cacheControl),t.metadata&&!n.has(`metadata`)&&n.append(`metadata`,this.encodeMetadata(t.metadata)),t.contentEncoding&&!n.has(`contentEncoding`)&&n.append(`contentEncoding`,t.contentEncoding);for(let[e,t]of r)n.append(e,t);return n}encodeMetadata(e){return JSON.stringify(e)}toBase64(e){return typeof Buffer<`u`?Buffer.from(e).toString(`base64`):btoa(e)}_getFinalPath(e){return`${this.bucketId}/${e.replace(/^\/+/,``)}`}_removeEmptyFolders(e){return e.replace(/^\/|\/$/g,``).replace(/\/+/g,`/`)}applyTransformOptsToQuery(e,t){return t.width&&e.set(`width`,t.width.toString()),t.height&&e.set(`height`,t.height.toString()),t.resize&&e.set(`resize`,t.resize),t.format&&e.set(`format`,t.format),t.quality&&e.set(`quality`,t.quality.toString()),e}};let an={"X-Client-Info":`storage-js/2.118.0`};var on=class extends Xt{constructor(e,t={},n,r){let i=new URL(e);r?.useNewHostname&&/supabase\.(co|in|red)$/.test(i.hostname)&&!i.hostname.includes(`storage.supabase.`)&&(i.hostname=i.hostname.replace(`supabase.`,`storage.supabase.`));let a=i.href.replace(/\/$/,``),o=D(D({},an),t);super(a,o,n,`storage`)}async listBuckets(e){var t=this;return t.handleOperation(async()=>{let n=t.listBucketOptionsToQueryString(e);return await O(t.fetch,`${t.url}/bucket${n}`,{headers:t.headers})})}async getBucket(e){var t=this;return t.handleOperation(async()=>await O(t.fetch,`${t.url}/bucket/${e}`,{headers:t.headers}))}async createBucket(e,t={public:!1}){var n=this;return n.handleOperation(async()=>await k(n.fetch,`${n.url}/bucket`,{id:e,name:e,type:t.type,public:t.public,file_size_limit:t.fileSizeLimit,allowed_mime_types:t.allowedMimeTypes,versioning_status:t.versioningStatus},{headers:n.headers}))}async updateBucket(e,t){var n=this;return n.handleOperation(async()=>await Jt(n.fetch,`${n.url}/bucket/${e}`,{id:e,name:e,public:t.public,file_size_limit:t.fileSizeLimit,allowed_mime_types:t.allowedMimeTypes,versioning_status:t.versioningStatus},{headers:n.headers}))}async emptyBucket(e){var t=this;return t.handleOperation(async()=>await k(t.fetch,`${t.url}/bucket/${e}/empty`,{},{headers:t.headers}))}async deleteBucket(e){var t=this;return t.handleOperation(async()=>await A(t.fetch,`${t.url}/bucket/${e}`,{},{headers:t.headers}))}async getBucketLifecycle(e){var t=this;return t.handleOperation(async()=>await O(t.fetch,t.bucketLifecycleUrl(e),{headers:t.headers}))}async updateBucketLifecycle(e,t){var n=this;return n.handleOperation(async()=>await Jt(n.fetch,n.bucketLifecycleUrl(e),t,{headers:n.headers}))}async deleteBucketLifecycle(e){var t=this;return t.handleOperation(async()=>await A(t.fetch,t.bucketLifecycleUrl(e),{},{headers:t.headers}))}async purgeBucketCache(e,t,n){var r=this;return r.handleOperation(async()=>{let i=new URLSearchParams;t?.transformations&&i.set(`transformations`,`true`);let a=i.toString();return await A(r.fetch,`${r.url}/cdn/${Ht(e)}${a?`?${a}`:``}`,{},{headers:r.headers},n)})}bucketLifecycleUrl(e){return`${this.url}/bucket/${Ht(e)}/lifecycle`}listBucketOptionsToQueryString(e){let t={};return e&&(`limit`in e&&(t.limit=String(e.limit)),`offset`in e&&(t.offset=String(e.offset)),e.search&&(t.search=e.search),e.sortColumn&&(t.sortColumn=e.sortColumn),e.sortOrder&&(t.sortOrder=e.sortOrder)),Object.keys(t).length>0?`?`+new URLSearchParams(t).toString():``}},sn=class extends Xt{constructor(e,t={},n){let r=e.replace(/\/$/,``),i=D(D({},an),t);super(r,i,n,`storage`)}async createBucket(e){var t=this;return t.handleOperation(async()=>await k(t.fetch,`${t.url}/bucket`,{name:e},{headers:t.headers}))}async listBuckets(e){var t=this;return t.handleOperation(async()=>{let n=new URLSearchParams;e?.limit!==void 0&&n.set(`limit`,e.limit.toString()),e?.offset!==void 0&&n.set(`offset`,e.offset.toString()),e?.sortColumn&&n.set(`sortColumn`,e.sortColumn),e?.sortOrder&&n.set(`sortOrder`,e.sortOrder),e?.search&&n.set(`search`,e.search);let r=n.toString(),i=r?`${t.url}/bucket?${r}`:`${t.url}/bucket`;return await O(t.fetch,i,{headers:t.headers})})}async deleteBucket(e){var t=this;return t.handleOperation(async()=>await A(t.fetch,`${t.url}/bucket/${e}`,{},{headers:t.headers}))}from(e){var t=this;if(!Vt(e))throw new Mt(`Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.`);let n=new Et({baseUrl:this.url,catalogName:e,auth:{type:`custom`,getHeaders:async()=>t.headers},fetch:this.fetch}),r=this.shouldThrowOnError;return new Proxy(n,{get(e,t){let n=e[t];return typeof n==`function`?async(...t)=>{try{return{data:await n.apply(e,t),error:null}}catch(e){if(r)throw e;return{data:null,error:e}}}:n}})}},cn=class extends Xt{constructor(e,t={},n){let r=e.replace(/\/$/,``),i=D(D({},an),{},{"Content-Type":`application/json`},t);super(r,i,n,`vectors`)}async createIndex(e){var t=this;return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/CreateIndex`,e,{headers:t.headers})||{})}async getIndex(e,t){var n=this;return n.handleOperation(async()=>await j.post(n.fetch,`${n.url}/GetIndex`,{vectorBucketName:e,indexName:t},{headers:n.headers}))}async listIndexes(e){var t=this;return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/ListIndexes`,e,{headers:t.headers}))}async deleteIndex(e,t){var n=this;return n.handleOperation(async()=>await j.post(n.fetch,`${n.url}/DeleteIndex`,{vectorBucketName:e,indexName:t},{headers:n.headers})||{})}},ln=class extends Xt{constructor(e,t={},n){let r=e.replace(/\/$/,``),i=D(D({},an),{},{"Content-Type":`application/json`},t);super(r,i,n,`vectors`)}async putVectors(e){var t=this;if(e.vectors.length<1||e.vectors.length>500)throw Error(`Vector batch size must be between 1 and 500 items`);return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/PutVectors`,e,{headers:t.headers})||{})}async getVectors(e){var t=this;return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/GetVectors`,e,{headers:t.headers}))}async listVectors(e){var t=this;if(e.segmentCount!==void 0){if(e.segmentCount<1||e.segmentCount>16)throw Error(`segmentCount must be between 1 and 16`);if(e.segmentIndex!==void 0&&(e.segmentIndex<0||e.segmentIndex>=e.segmentCount))throw Error(`segmentIndex must be between 0 and ${e.segmentCount-1}`)}return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/ListVectors`,e,{headers:t.headers}))}async queryVectors(e){var t=this;return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/QueryVectors`,e,{headers:t.headers}))}async deleteVectors(e){var t=this;if(e.keys.length<1||e.keys.length>500)throw Error(`Keys batch size must be between 1 and 500 items`);return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/DeleteVectors`,e,{headers:t.headers})||{})}},un=class extends Xt{constructor(e,t={},n){let r=e.replace(/\/$/,``),i=D(D({},an),{},{"Content-Type":`application/json`},t);super(r,i,n,`vectors`)}async createBucket(e){var t=this;return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/CreateVectorBucket`,{vectorBucketName:e},{headers:t.headers})||{})}async getBucket(e){var t=this;return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/GetVectorBucket`,{vectorBucketName:e},{headers:t.headers}))}async listBuckets(e={}){var t=this;return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/ListVectorBuckets`,e,{headers:t.headers}))}async deleteBucket(e){var t=this;return t.handleOperation(async()=>await j.post(t.fetch,`${t.url}/DeleteVectorBucket`,{vectorBucketName:e},{headers:t.headers})||{})}},dn=class extends un{constructor(e,t={}){super(e,t.headers||{},t.fetch)}from(e){return new fn(this.url,this.headers,e,this.fetch)}async createBucket(e){var t=()=>super.createBucket,n=this;return t().call(n,e)}async getBucket(e){var t=()=>super.getBucket,n=this;return t().call(n,e)}async listBuckets(e={}){var t=()=>super.listBuckets,n=this;return t().call(n,e)}async deleteBucket(e){var t=()=>super.deleteBucket,n=this;return t().call(n,e)}},fn=class extends cn{constructor(e,t,n,r){super(e,t,r),this.vectorBucketName=n}async createIndex(e){var t=()=>super.createIndex,n=this;return t().call(n,D(D({},e),{},{vectorBucketName:n.vectorBucketName}))}async listIndexes(e={}){var t=()=>super.listIndexes,n=this;return t().call(n,D(D({},e),{},{vectorBucketName:n.vectorBucketName}))}async getIndex(e){var t=()=>super.getIndex,n=this;return t().call(n,n.vectorBucketName,e)}async deleteIndex(e){var t=()=>super.deleteIndex,n=this;return t().call(n,n.vectorBucketName,e)}index(e){return new pn(this.url,this.headers,this.vectorBucketName,e,this.fetch)}},pn=class extends ln{constructor(e,t,n,r,i){super(e,t,i),this.vectorBucketName=n,this.indexName=r}async putVectors(e){var t=()=>super.putVectors,n=this;return t().call(n,D(D({},e),{},{vectorBucketName:n.vectorBucketName,indexName:n.indexName}))}async getVectors(e){var t=()=>super.getVectors,n=this;return t().call(n,D(D({},e),{},{vectorBucketName:n.vectorBucketName,indexName:n.indexName}))}async listVectors(e={}){var t=()=>super.listVectors,n=this;return t().call(n,D(D({},e),{},{vectorBucketName:n.vectorBucketName,indexName:n.indexName}))}async queryVectors(e){var t=()=>super.queryVectors,n=this;return t().call(n,D(D({},e),{},{vectorBucketName:n.vectorBucketName,indexName:n.indexName}))}async deleteVectors(e){var t=()=>super.deleteVectors,n=this;return t().call(n,D(D({},e),{},{vectorBucketName:n.vectorBucketName,indexName:n.indexName}))}},mn=class extends on{constructor(e,t={},n,r){super(e,t,n,r)}from(e){return new rn(this.url,this.headers,e,this.fetch)}get vectors(){return new dn(this.url+`/vector`,{headers:this.headers,fetch:this.fetch})}get analytics(){return new sn(this.url+`/iceberg`,this.headers,this.fetch)}};let hn=``,gn;typeof Deno<`u`?(hn=`deno`,gn=Deno.version?.deno):typeof document<`u`?hn=`web`:typeof navigator<`u`&&navigator.product===`ReactNative`?hn=`react-native`:(hn=`node`,gn=globalThis.process?.version?.replace(/^v/,``));let _n=[`runtime=${hn}`];gn&&_n.push(`runtime-version=${gn}`);let vn={headers:{"X-Client-Info":`supabase-js/2.118.0; ${_n.join(`; `)}`}},yn={schema:`public`},bn={autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0,flowType:`implicit`},xn={},Sn={enabled:!1,respectSamplingDecision:!0};function Cn(e){if(!e||typeof e!=`string`)return null;let t=e.split(`-`);if(t.length!==4)return null;let[n,r,i,a]=t;if(n.length!==2||r.length!==32||i.length!==16||a.length!==2)return null;let o=/^[0-9a-f]+$/i;return!o.test(n)||!o.test(r)||!o.test(i)||!o.test(a)||r===`00000000000000000000000000000000`||i===`0000000000000000`?null:{version:n,traceId:r,parentId:i,traceFlags:a,isSampled:(parseInt(a,16)&1)==1}}function wn(e,t){if(!e||!t||t.length===0)return!1;let n;if(e instanceof URL)n=e;else try{n=new URL(e)}catch{return!1}for(let e of t)try{if(typeof e==`string`){if(Tn(n.hostname,e))return!0}else if(e instanceof RegExp){if(e.test(n.hostname))return!0}else if(typeof e==`function`&&e(n))return!0}catch{continue}return!1}function Tn(e,t){if(t===e)return!0;if(t.startsWith(`*.`)){let n=t.slice(2);if(e.endsWith(n)&&(e===n||e.endsWith(`.`+n)))return!0}return!1}function En(e){let t=[];try{let n=new URL(e);t.push(n.hostname)}catch{}return t.push(`*.supabase.co`,`*.supabase.in`),t.push(`localhost`,`127.0.0.1`,`[::1]`),t}let Dn=Symbol.for(`@supabase/supabase-js.traceContextExtractor`);function On(){return globalThis[Dn]}let kn=e=>e?(...t)=>e(...t):(...e)=>fetch(...e),An=()=>Headers,jn=e=>e.startsWith(`sb_publishable_`)||e.startsWith(`sb_secret_`),Mn=new Set,Nn=e=>{if(!e.startsWith(`sb_`)||jn(e)||e.startsWith(`sb_temp_`))return;let t=e.match(/^sb_[a-zA-Z0-9]+_/)?.[0]??`unknown`;Mn.has(t)||(Mn.add(t),console.warn(`@supabase/supabase-js: Unrecognized Supabase API key format. The client will proceed and send this key as-is; if you see authentication errors you may need to upgrade @supabase/supabase-js to a version that recognizes this key type.`))},Pn=(e,t,n,r,i,a)=>{let o=kn(r),s=An(),c=i?.enabled===!0,l=i?.respectSamplingDecision!==!1,u=c?En(t):null,d=!(a?.omitApiKeyAsBearer&&jn(e));return async(t,r)=>{let i=await n(),a=new s(r?.headers);if(a.has(`apikey`)||a.set(`apikey`,e),!a.has(`Authorization`)){let t=i??(d?e:null);t&&a.set(`Authorization`,`Bearer ${t}`)}if(u){let e=Ln(t,u,l);e&&(e.traceparent&&!a.has(`traceparent`)&&a.set(`traceparent`,e.traceparent),e.tracestate&&!a.has(`tracestate`)&&a.set(`tracestate`,e.tracestate),e.baggage&&!a.has(`baggage`)&&a.set(`baggage`,e.baggage))}return o(t,{...r,headers:a})}},Fn=!1,In=!1;function Ln(e,t,n){let r=On();if(!r)return Fn||(Fn=!0,console.warn("@supabase/supabase-js: tracePropagation is enabled but the tracing runtime is not loaded, so trace headers will not be attached. Add `import '@supabase/supabase-js/tracing'` at your application entry point (requires the OpenTelemetry API package to be installed). The CDN/UMD build does not support trace propagation.")),null;if(!wn(typeof e==`string`||e instanceof URL?e:e.url,t))return null;let i=r();if(!i||!i.traceparent){if(i?.carrierKeys?.length&&!In){In=!0;let e=i.carrierKeys.includes(`sentry-trace`)?" Sentry detected: set `propagateTraceparent: true` in Sentry.init() to emit it.":` Configure your tracing SDK to emit W3C trace context on outgoing requests.`;console.warn(`@supabase/supabase-js: tracePropagation is enabled and a tracing SDK is active, but its propagator wrote [${i.carrierKeys.join(`, `)}] and no W3C traceparent header, so trace headers will not be attached.`+e)}return null}if(n){let e=Cn(i.traceparent);if(e&&!e.isSampled)return{traceparent:i.traceparent}}return i}function Rn(e){return typeof e==`boolean`?{enabled:e}:e}function zn(e){return e.endsWith(`/`)?e:e+`/`}let Bn=!1;function Vn(e){Bn||typeof e!=`object`||!e||!(`schema`in e)||e.schema===void 0||(Bn=!0,console.warn(`@supabase/supabase-js: The "schema" option must be nested under "db", e.g. createClient(url, key, { db: { schema: 'myschema' } }). A top-level "schema" is ignored and queries go to the default schema.`))}function Hn(e,t){let{db:n,auth:r,realtime:i,global:a}=e,{db:o,auth:s,realtime:c,global:l}=t,u=Rn(e.tracePropagation),d=Rn(t.tracePropagation),f={db:{...o,...n},auth:{...s,...r},realtime:{...c,...i},storage:{},global:{...l,...a,headers:{...l?.headers??{},...a?.headers??{}}},tracePropagation:{enabled:u?.enabled??d?.enabled??!1,respectSamplingDecision:u?.respectSamplingDecision??d?.respectSamplingDecision??!0},accessToken:async()=>``};return e.accessToken?f.accessToken=e.accessToken:delete f.accessToken,f}function Un(e){let t=e?.trim();if(!t)throw Error(`supabaseUrl is required.`);if(!t.match(/^https?:\/\//i))throw Error(`Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.`);try{return new URL(zn(t))}catch{throw Error(`Invalid supabaseUrl: Provided URL is malformed.`)}}let Wn=`2.118.0`,M=30*1e3,Gn=3*M;2*M;let Kn={"X-Client-Info":`gotrue-js/${Wn}`},qn=`X-Supabase-Api-Version`,Jn={"2024-01-01":{timestamp:Date.parse(`2024-01-01T00:00:00.0Z`),name:`2024-01-01`}},Yn=/^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i,N=`sb_flow_id`;var Xn=class extends Error{constructor(e,t,n){super(e),this.__isAuthError=!0,this.name=`AuthError`,this.status=t,this.code=n}toJSON(){return{name:this.name,message:this.message,status:this.status,code:this.code}}};function P(e){return typeof e==`object`&&!!e&&`__isAuthError`in e}var Zn=class extends Xn{constructor(e,t,n){super(e,t,n),this.name=`AuthApiError`,this.status=t,this.code=n}};function Qn(e){return P(e)&&e.name===`AuthApiError`}var F=class extends Xn{constructor(e,t){super(e),this.name=`AuthUnknownError`,this.originalError=t}},I=class extends Xn{constructor(e,t,n,r){super(e,n,r),this.name=t,this.status=n}},L=class extends I{constructor(){super(`Auth session missing!`,`AuthSessionMissingError`,400,void 0)}};function $n(e){return P(e)&&e.name===`AuthSessionMissingError`}var R=class extends I{constructor(){super(`Auth session or user missing`,`AuthInvalidTokenResponseError`,500,void 0)}},er=class extends I{constructor(e){super(e,`AuthInvalidCredentialsError`,400,void 0)}},tr=class extends I{constructor(e,t=null){super(e,`AuthImplicitGrantRedirectError`,500,void 0),this.details=null,this.details=t}toJSON(){return Object.assign(Object.assign({},super.toJSON()),{details:this.details})}};function nr(e){return P(e)&&e.name===`AuthImplicitGrantRedirectError`}var rr=class extends I{constructor(e,t=null){super(e,`AuthPKCEGrantCodeExchangeError`,500,void 0),this.details=null,this.details=t}toJSON(){return Object.assign(Object.assign({},super.toJSON()),{details:this.details})}},ir=class extends I{constructor(){super(`PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.`,`AuthPKCECodeVerifierMissingError`,400,`pkce_code_verifier_not_found`)}};function ar(e){return P(e)&&e.name===`AuthPKCECodeVerifierMissingError`}var or=class extends I{constructor(e,t){super(e,`AuthRetryableFetchError`,t,void 0)}};function sr(e){return P(e)&&e.name===`AuthRetryableFetchError`}var cr=class extends I{constructor(e=`Refresh result discarded: session state changed mid-flight (e.g., concurrent signOut)`){super(e,`AuthRefreshDiscardedError`,409,void 0)}};function lr(e){return P(e)&&e.name===`AuthRefreshDiscardedError`}var ur=class extends I{constructor(e,t,n){super(e,`AuthWeakPasswordError`,t,`weak_password`),this.reasons=n}toJSON(){return Object.assign(Object.assign({},super.toJSON()),{reasons:this.reasons})}};function dr(e){return P(e)&&e.name===`AuthWeakPasswordError`}var fr=class extends I{constructor(e){super(e,`AuthInvalidJwtError`,400,`invalid_jwt`)}};let pr=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`.split(``),mr=` 	
\r=`.split(``),hr=(()=>{let e=Array(128);for(let t=0;t<e.length;t+=1)e[t]=-1;for(let t=0;t<mr.length;t+=1)e[mr[t].charCodeAt(0)]=-2;for(let t=0;t<pr.length;t+=1)e[pr[t].charCodeAt(0)]=t;return e})();function gr(e,t,n){if(e!==null)for(t.queue=t.queue<<8|e,t.queuedBits+=8;t.queuedBits>=6;)n(pr[t.queue>>t.queuedBits-6&63]),t.queuedBits-=6;else if(t.queuedBits>0)for(t.queue<<=6-t.queuedBits,t.queuedBits=6;t.queuedBits>=6;)n(pr[t.queue>>t.queuedBits-6&63]),t.queuedBits-=6}function _r(e,t,n){let r=hr[e];if(r>-1)for(t.queue=t.queue<<6|r,t.queuedBits+=6;t.queuedBits>=8;)n(t.queue>>t.queuedBits-8&255),t.queuedBits-=8;else if(r===-2)return;else throw Error(`Invalid Base64-URL character "${String.fromCharCode(e)}"`)}function vr(e){let t=[],n=e=>{t.push(String.fromCodePoint(e))},r={utf8seq:0,codepoint:0},i={queue:0,queuedBits:0},a=e=>{xr(e,r,n)};for(let t=0;t<e.length;t+=1)_r(e.charCodeAt(t),i,a);return t.join(``)}function yr(e,t){if(e<=127){t(e);return}else if(e<=2047){t(192|e>>6),t(128|e&63);return}else if(e<=65535){t(224|e>>12),t(128|e>>6&63),t(128|e&63);return}else if(e<=1114111){t(240|e>>18),t(128|e>>12&63),t(128|e>>6&63),t(128|e&63);return}throw Error(`Unrecognized Unicode codepoint: ${e.toString(16)}`)}function br(e,t){for(let n=0;n<e.length;n+=1){let r=e.charCodeAt(n);if(r>55295&&r<=56319){let t=(r-55296)*1024&65535;r=(e.charCodeAt(n+1)-56320&65535|t)+65536,n+=1}yr(r,t)}}function xr(e,t,n){if(t.utf8seq===0){if(e<=127){n(e);return}for(let n=1;n<6;n+=1)if(!(e>>7-n&1)){t.utf8seq=n;break}if(t.utf8seq===2)t.codepoint=e&31;else if(t.utf8seq===3)t.codepoint=e&15;else if(t.utf8seq===4)t.codepoint=e&7;else throw Error(`Invalid UTF-8 sequence`);--t.utf8seq}else if(t.utf8seq>0){if(e<=127)throw Error(`Invalid UTF-8 sequence`);t.codepoint=t.codepoint<<6|e&63,--t.utf8seq,t.utf8seq===0&&n(t.codepoint)}}function Sr(e){let t=[],n={queue:0,queuedBits:0},r=e=>{t.push(e)};for(let t=0;t<e.length;t+=1)_r(e.charCodeAt(t),n,r);return new Uint8Array(t)}function Cr(e){let t=[];return br(e,e=>t.push(e)),new Uint8Array(t)}function z(e){let t=[],n={queue:0,queuedBits:0},r=e=>{t.push(e)};return e.forEach(e=>gr(e,n,r)),gr(null,n,r),t.join(``)}function wr(e){return Math.round(Date.now()/1e3)+e}function Tr(){return Symbol(`auth-callback`)}let B=()=>typeof window<`u`&&typeof document<`u`,V={tested:!1,writable:!1},Er=()=>{if(!B())return!1;try{if(typeof globalThis.localStorage!=`object`)return!1}catch{return!1}if(V.tested)return V.writable;let e=`lswt-${Math.random()}${Math.random()}`;try{globalThis.localStorage.setItem(e,e),globalThis.localStorage.removeItem(e),V.tested=!0,V.writable=!0}catch{V.tested=!0,V.writable=!1}return V.writable};function Dr(e){let t={},n=new URL(e);if(n.hash&&n.hash[0]===`#`)try{new URLSearchParams(n.hash.substring(1)).forEach((e,n)=>{t[n]=e})}catch{}return n.searchParams.forEach((e,n)=>{t[n]=e}),t}let Or=e=>e?(...t)=>e(...t):(...e)=>fetch(...e),kr=e=>typeof e==`object`&&!!e&&`status`in e&&`ok`in e&&`json`in e&&typeof e.json==`function`,H=async(e,t,n)=>{await e.setItem(t,JSON.stringify(n))},U=async(e,t)=>{let n=await e.getItem(t);if(!n)return null;try{return JSON.parse(n)}catch{return null}},W=async(e,t)=>{await e.removeItem(t)};var Ar=class e{constructor(){this.promise=new e.promiseConstructor((e,t)=>{this.resolve=e,this.reject=t})}};Ar.promiseConstructor=Promise;function jr(e){let t=e.split(`.`);if(t.length!==3)throw new fr(`Invalid JWT structure`);for(let e=0;e<t.length;e++)if(!Yn.test(t[e]))throw new fr(`JWT not in base64url format`);return{header:JSON.parse(vr(t[0])),payload:JSON.parse(vr(t[1])),signature:Sr(t[2]),raw:{header:t[0],payload:t[1]}}}async function Mr(e){return await new Promise(t=>{setTimeout(()=>t(null),e)})}function Nr(e,t){return new Promise((n,r)=>{(async()=>{for(let i=0;i<1/0;i++)try{let r=await e(i);if(!t(i,null,r)){n(r);return}}catch(e){if(!t(i,e)){r(e);return}}})()})}function Pr(e){return(`0`+e.toString(16)).substr(-2)}function Fr(){let e=new Uint32Array(56);if(typeof crypto>`u`){let e=``;for(let t=0;t<56;t++)e+=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~`.charAt(Math.floor(Math.random()*66));return e}return crypto.getRandomValues(e),Array.from(e,Pr).join(``)}async function Ir(e){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t),r=new Uint8Array(n);return Array.from(r).map(e=>String.fromCharCode(e)).join(``)}async function Lr(e){if(!(typeof crypto<`u`&&crypto.subtle!==void 0&&typeof TextEncoder<`u`))return console.warn(`WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.`),e;let t=await Ir(e);return btoa(t).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}let Rr=/^[a-zA-Z0-9_-]{8,64}$/;function zr(e){return typeof e==`string`&&Rr.test(e)?e:null}function Br(){if(typeof crypto<`u`&&typeof crypto.getRandomValues==`function`){let e=new Uint8Array(16);return crypto.getRandomValues(e),Array.from(e,Pr).join(``)}let e=``;for(let t=0;t<32;t++)e+=Math.floor(Math.random()*16).toString(16);return e}let Vr=(e,t)=>`${e}-flow-${t}-code-verifier`,Hr=e=>`${e}-flows-code-verifier`;async function Ur(e,t){let n=await U(e,Hr(t));return Array.isArray(n)?n.filter(e=>zr(e)!==null):[]}async function Wr(e,t,n,r,i){await H(e,Vr(t,n),r);let a=(await Ur(e,t)).filter(e=>e!==n);for(a.push(n);a.length>5;){let n=a.shift();await W(e,Vr(t,n)),i?.(n)}await H(e,Hr(t),a),await H(e,`${t}-code-verifier`,r)}async function Gr(e,t,n){if(n){let r=await U(e,Vr(t,n));return{verifier:typeof r==`string`?r:null,flowId:n}}let r=await U(e,`${t}-code-verifier`);return{verifier:typeof r==`string`?r:null,flowId:null}}async function G(e,t,n){let r=`${t}-code-verifier`;if(!n){await W(e,r);return}let i=Vr(t,n),a=await U(e,i);await W(e,i);let o=await Ur(e,t),s=o.filter(e=>e!==n);s.length!==o.length&&(s.length>0?await H(e,Hr(t),s):await W(e,Hr(t))),a!=null&&a===await U(e,r)&&await W(e,r)}async function Kr(e,t){let n=await Ur(e,t);for(let r of n)await W(e,Vr(t,r));await W(e,Hr(t)),await W(e,`${t}-code-verifier`)}function qr(e,t){let n=e.indexOf(`#`),r=n===-1?e:e.slice(0,n),i=n===-1?``:e.slice(n),a=r.indexOf(`?`);if(a!==-1){let e=r.slice(0,a),t=r.slice(a+1).split(`&`).filter(e=>e!==``&&e!==N&&!e.startsWith(`${N}=`));r=t.length>0?`${e}?${t.join(`&`)}`:e}let o=r.includes(`?`)?`&`:`?`;return`${r}${o}${N}=${encodeURIComponent(t)}${i}`}async function Jr(e,t,n=!1,r){let i=Fr(),a=i;n&&(a+=`/recovery`);let o=Br();await Wr(e,t,o,a,r);let s=await Lr(i);return[s,i===s?`plain`:`s256`,o]}let Yr=/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;function Xr(e){let t=e.headers.get(qn);if(!t||!t.match(Yr))return null;try{return new Date(`${t}T00:00:00.0Z`)}catch{return null}}function Zr(e){if(!e)throw Error(`Missing exp claim`);if(e<=Math.floor(Date.now()/1e3))throw Error(`JWT has expired`)}function Qr(e){switch(e){case`RS256`:return{name:`RSASSA-PKCS1-v1_5`,hash:{name:`SHA-256`}};case`ES256`:return{name:`ECDSA`,namedCurve:`P-256`,hash:{name:`SHA-256`}};default:throw Error(`Invalid alg claim`)}}let $r=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;function K(e){if(!$r.test(e))throw Error(`@supabase/auth-js: Expected parameter to be UUID but is not`)}function ei(e){if(!e.recoveryCodes)throw Error("@supabase/auth-js: the MFA recovery codes API is experimental and disabled by default. Enable it by passing `auth: { experimental: { recoveryCodes: true } }` to createClient (or to the GoTrueClient constructor).")}function ti(){return new Proxy({},{get:(e,t)=>{if(t===`__isUserNotAvailableProxy`)return!0;if(typeof t==`symbol`){let e=t.toString();if(e===`Symbol(Symbol.toPrimitive)`||e===`Symbol(Symbol.toStringTag)`||e===`Symbol(util.inspect.custom)`)return}throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${t}" property of the session object is not supported. Please use getUser() instead.`)},set:(e,t)=>{throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`)},deleteProperty:(e,t)=>{throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`)}})}function ni(e,t){return new Proxy(e,{get:(e,n,r)=>{if(n===`__isInsecureUserWarningProxy`)return!0;if(typeof n==`symbol`){let t=n.toString();if(t===`Symbol(Symbol.toPrimitive)`||t===`Symbol(Symbol.toStringTag)`||t===`Symbol(util.inspect.custom)`||t===`Symbol(nodejs.util.inspect.custom)`)return Reflect.get(e,n,r)}return!t.value&&typeof n==`string`&&(console.warn(`Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.`),t.value=!0),Reflect.get(e,n,r)}})}function ri(e){return JSON.parse(JSON.stringify(e))}let q=e=>{if(typeof e==`object`&&e){let t=e;if(typeof t.msg==`string`)return t.msg;if(typeof t.message==`string`)return t.message;if(typeof t.error_description==`string`)return t.error_description;if(typeof t.error==`string`)return t.error}return JSON.stringify(e)},ii=[500,501,502,503,504,520,521,522,523,524,525,526,527,528,529,530];async function ai(e){if(!kr(e))throw new or(q(e),0);let t;try{t=await e.json()}catch(t){throw ii.includes(e.status)?new or(e.statusText||`HTTP ${e.status}`,e.status):new F(q(t),t)}if(ii.includes(e.status))throw new or(q(t),e.status);let n,r=Xr(e);if(r&&r.getTime()>=Jn[`2024-01-01`].timestamp&&typeof t==`object`&&t&&typeof t.code==`string`?n=t.code:typeof t==`object`&&t&&typeof t.error_code==`string`&&(n=t.error_code),n){if(n===`weak_password`)throw new ur(q(t),e.status,t.weak_password?.reasons||[]);if(n===`session_not_found`)throw new L}else if(typeof t==`object`&&t&&typeof t.weak_password==`object`&&t.weak_password&&Array.isArray(t.weak_password.reasons)&&t.weak_password.reasons.length&&t.weak_password.reasons.reduce((e,t)=>e&&typeof t==`string`,!0))throw new ur(q(t),e.status,t.weak_password.reasons);throw new Zn(q(t),e.status||500,n)}let oi=(e,t,n,r)=>{let i={method:e,headers:t?.headers||{}};return e===`GET`?i:(i.headers=Object.assign({"Content-Type":`application/json;charset=UTF-8`},t?.headers),i.body=JSON.stringify(r),Object.assign(Object.assign({},i),n))};async function J(e,t,n,r){let i=Object.assign({},r?.headers);i[qn]||(i[qn]=Jn[`2024-01-01`].name),r?.jwt&&(i.Authorization=`Bearer ${r.jwt}`);let a=r?.query??{};r?.redirectTo&&(a.redirect_to=r.redirectTo);let o=await si(e,t,n+(Object.keys(a).length?`?`+new URLSearchParams(a).toString():``),{headers:i,noResolveJson:r?.noResolveJson},{},r?.body);return r?.xform?r?.xform(o):{data:Object.assign({},o),error:null}}async function si(e,t,n,r,i,a){let o=oi(t,r,i,a),s;try{s=await e(n,Object.assign({},o))}catch(e){throw new or(q(e),0)}if(s.ok||await ai(s),r?.noResolveJson)return s;try{return await s.json()}catch(e){await ai(e)}}function Y(e){let t=null;fi(e)&&(t=Object.assign({},e),e.expires_at||(t.expires_at=wr(e.expires_in)));let n=e.user??(typeof e?.id==`string`?e:null);return{data:{session:t,user:n},error:null}}function ci(e){let t=Y(e);return!t.error&&e.weak_password&&typeof e.weak_password==`object`&&Array.isArray(e.weak_password.reasons)&&e.weak_password.reasons.length&&e.weak_password.message&&typeof e.weak_password.message==`string`&&e.weak_password.reasons.reduce((e,t)=>e&&typeof t==`string`,!0)&&(t.data.weak_password=e.weak_password),t}function X(e){return{data:{user:e.user??e},error:null}}function li(e){return{data:e,error:null}}function ui(e){let{action_link:n,email_otp:r,hashed_token:i,redirect_to:a,verification_type:o}=e,s=t(e,[`action_link`,`email_otp`,`hashed_token`,`redirect_to`,`verification_type`]);return{data:{properties:{action_link:n,email_otp:r,hashed_token:i,redirect_to:a,verification_type:o},user:Object.assign({},s)},error:null}}function di(e){return e}function fi(e){return!!e.access_token&&!!e.refresh_token&&!!e.expires_in}let pi=[`global`,`local`,`others`];var mi=class{constructor({url:e=``,headers:t={},fetch:n,experimental:r}){this.url=e,this.headers=t,this.fetch=Or(n),this.experimental=r??{},this.mfa={listFactors:this._listFactors.bind(this),deleteFactor:this._deleteFactor.bind(this)},this.oauth={listClients:this._listOAuthClients.bind(this),createClient:this._createOAuthClient.bind(this),getClient:this._getOAuthClient.bind(this),updateClient:this._updateOAuthClient.bind(this),deleteClient:this._deleteOAuthClient.bind(this),regenerateClientSecret:this._regenerateOAuthClientSecret.bind(this)},this.customProviders={listProviders:this._listCustomProviders.bind(this),createProvider:this._createCustomProvider.bind(this),getProvider:this._getCustomProvider.bind(this),updateProvider:this._updateCustomProvider.bind(this),deleteProvider:this._deleteCustomProvider.bind(this)},this.passkey={listPasskeys:this._adminListPasskeys.bind(this),deletePasskey:this._adminDeletePasskey.bind(this)}}async signOut(e,t=pi[0]){if(pi.indexOf(t)<0)throw Error(`@supabase/auth-js: Parameter scope must be one of ${pi.join(`, `)}`);try{return await J(this.fetch,`POST`,`${this.url}/logout?scope=${t}`,{headers:this.headers,jwt:e,noResolveJson:!0}),{data:null,error:null}}catch(e){if(P(e))return{data:null,error:e};throw e}}async inviteUserByEmail(e,t={}){try{return await J(this.fetch,`POST`,`${this.url}/invite`,{body:{email:e,data:t.data},headers:this.headers,redirectTo:t.redirectTo,xform:X})}catch(e){if(P(e))return{data:{user:null},error:e};throw e}}async generateLink(e){try{let{options:n}=e,r=t(e,[`options`]),i=Object.assign(Object.assign({},r),n);return`newEmail`in r&&(i.new_email=r?.newEmail,delete i.newEmail),await J(this.fetch,`POST`,`${this.url}/admin/generate_link`,{body:i,headers:this.headers,xform:ui,redirectTo:n?.redirectTo})}catch(e){if(P(e))return{data:{properties:null,user:null},error:e};throw e}}async createUser(e){try{return await J(this.fetch,`POST`,`${this.url}/admin/users`,{body:e,headers:this.headers,xform:X})}catch(e){if(P(e))return{data:{user:null},error:e};throw e}}async listUsers(e){try{let t={nextPage:null,lastPage:0,total:0},n=await J(this.fetch,`GET`,`${this.url}/admin/users`,{headers:this.headers,noResolveJson:!0,query:{page:(e?.page)?.toString()??``,per_page:(e?.perPage)?.toString()??``},xform:di});if(n.error)throw n.error;let r=await n.json(),i=n.headers.get(`x-total-count`)??0,a=n.headers.get(`link`)?.split(`,`)??[];return a.length>0&&(a.forEach(e=>{let n=parseInt(e.split(`;`)[0].split(`=`)[1].substring(0,1)),r=JSON.parse(e.split(`;`)[1].split(`=`)[1]);t[`${r}Page`]=n}),t.total=parseInt(i)),{data:Object.assign(Object.assign({},r),t),error:null}}catch(e){if(P(e))return{data:{users:[]},error:e};throw e}}async getUserById(e){K(e);try{return await J(this.fetch,`GET`,`${this.url}/admin/users/${e}`,{headers:this.headers,xform:X})}catch(e){if(P(e))return{data:{user:null},error:e};throw e}}async updateUserById(e,t){K(e);try{return await J(this.fetch,`PUT`,`${this.url}/admin/users/${e}`,{body:t,headers:this.headers,xform:X})}catch(e){if(P(e))return{data:{user:null},error:e};throw e}}async deleteUser(e,t=!1){K(e);try{return await J(this.fetch,`DELETE`,`${this.url}/admin/users/${e}`,{headers:this.headers,body:{should_soft_delete:t},xform:X})}catch(e){if(P(e))return{data:{user:null},error:e};throw e}}async _listFactors(e){K(e.userId);try{let{data:t,error:n}=await J(this.fetch,`GET`,`${this.url}/admin/users/${e.userId}/factors`,{headers:this.headers,xform:e=>({data:{factors:e},error:null})});return{data:t,error:n}}catch(e){if(P(e))return{data:null,error:e};throw e}}async _deleteFactor(e){K(e.userId),K(e.id);try{return{data:await J(this.fetch,`DELETE`,`${this.url}/admin/users/${e.userId}/factors/${e.id}`,{headers:this.headers}),error:null}}catch(e){if(P(e))return{data:null,error:e};throw e}}async _listOAuthClients(e){try{let t={nextPage:null,lastPage:0,total:0},n=await J(this.fetch,`GET`,`${this.url}/admin/oauth/clients`,{headers:this.headers,noResolveJson:!0,query:{page:(e?.page)?.toString()??``,per_page:(e?.perPage)?.toString()??``},xform:di});if(n.error)throw n.error;let r=await n.json(),i=n.headers.get(`x-total-count`)??0,a=n.headers.get(`link`)?.split(`,`)??[];return a.length>0&&(a.forEach(e=>{let n=parseInt(e.split(`;`)[0].split(`=`)[1].substring(0,1)),r=JSON.parse(e.split(`;`)[1].split(`=`)[1]);t[`${r}Page`]=n}),t.total=parseInt(i)),{data:Object.assign(Object.assign({},r),t),error:null}}catch(e){if(P(e))return{data:{clients:[]},error:e};throw e}}async _createOAuthClient(e){try{return await J(this.fetch,`POST`,`${this.url}/admin/oauth/clients`,{body:e,headers:this.headers,xform:e=>({data:e,error:null})})}catch(e){if(P(e))return{data:null,error:e};throw e}}async _getOAuthClient(e){try{return await J(this.fetch,`GET`,`${this.url}/admin/oauth/clients/${e}`,{headers:this.headers,xform:e=>({data:e,error:null})})}catch(e){if(P(e))return{data:null,error:e};throw e}}async _updateOAuthClient(e,t){try{return await J(this.fetch,`PUT`,`${this.url}/admin/oauth/clients/${e}`,{body:t,headers:this.headers,xform:e=>({data:e,error:null})})}catch(e){if(P(e))return{data:null,error:e};throw e}}async _deleteOAuthClient(e){try{return await J(this.fetch,`DELETE`,`${this.url}/admin/oauth/clients/${e}`,{headers:this.headers,noResolveJson:!0}),{data:null,error:null}}catch(e){if(P(e))return{data:null,error:e};throw e}}async _regenerateOAuthClientSecret(e){try{return await J(this.fetch,`POST`,`${this.url}/admin/oauth/clients/${e}/regenerate_secret`,{headers:this.headers,xform:e=>({data:e,error:null})})}catch(e){if(P(e))return{data:null,error:e};throw e}}async _listCustomProviders(e){try{let t={};return e?.type&&(t.type=e.type),await J(this.fetch,`GET`,`${this.url}/admin/custom-providers`,{headers:this.headers,query:t,xform:e=>({data:{providers:e?.providers??[]},error:null})})}catch(e){if(P(e))return{data:{providers:[]},error:e};throw e}}async _createCustomProvider(e){try{return await J(this.fetch,`POST`,`${this.url}/admin/custom-providers`,{body:e,headers:this.headers,xform:e=>({data:e,error:null})})}catch(e){if(P(e))return{data:null,error:e};throw e}}async _getCustomProvider(e){try{return await J(this.fetch,`GET`,`${this.url}/admin/custom-providers/${e}`,{headers:this.headers,xform:e=>({data:e,error:null})})}catch(e){if(P(e))return{data:null,error:e};throw e}}async _updateCustomProvider(e,t){try{return await J(this.fetch,`PUT`,`${this.url}/admin/custom-providers/${e}`,{body:t,headers:this.headers,xform:e=>({data:e,error:null})})}catch(e){if(P(e))return{data:null,error:e};throw e}}async _deleteCustomProvider(e){try{return await J(this.fetch,`DELETE`,`${this.url}/admin/custom-providers/${e}`,{headers:this.headers,noResolveJson:!0}),{data:null,error:null}}catch(e){if(P(e))return{data:null,error:e};throw e}}async _adminListPasskeys(e){K(e.userId);try{return await J(this.fetch,`GET`,`${this.url}/admin/users/${e.userId}/passkeys`,{headers:this.headers,xform:e=>({data:e,error:null})})}catch(e){if(P(e))return{data:null,error:e};throw e}}async _adminDeletePasskey(e){K(e.userId),K(e.passkeyId);try{return await J(this.fetch,`DELETE`,`${this.url}/admin/users/${e.userId}/passkeys/${e.passkeyId}`,{headers:this.headers,noResolveJson:!0}),{data:null,error:null}}catch(e){if(P(e))return{data:null,error:e};throw e}}};function hi(e={}){return{getItem:t=>e[t]||null,setItem:(t,n)=>{e[t]=n},removeItem:t=>{delete e[t]}}}let Z={debug:!!(globalThis&&Er()&&globalThis.localStorage&&globalThis.localStorage.getItem(`supabase.gotrue-js.locks.debug`)===`true`)};var gi=class extends Error{constructor(e){super(e),this.isAcquireTimeout=!0}},_i=class extends gi{},vi=class extends gi{};async function yi(e,t,n){Z.debug&&console.log(`@supabase/gotrue-js: navigatorLock: acquire lock`,e,t);let r=new globalThis.AbortController,i;t>0&&(i=setTimeout(()=>{r.abort(),Z.debug&&console.log(`@supabase/gotrue-js: navigatorLock acquire timed out`,e)},t)),await Promise.resolve();try{return await globalThis.navigator.locks.request(e,t===0?{mode:`exclusive`,ifAvailable:!0}:{mode:`exclusive`,signal:r.signal},async r=>{if(r){clearTimeout(i),Z.debug&&console.log(`@supabase/gotrue-js: navigatorLock: acquired`,e,r.name);try{return await n()}finally{Z.debug&&console.log(`@supabase/gotrue-js: navigatorLock: released`,e,r.name)}}else if(t===0)throw Z.debug&&console.log(`@supabase/gotrue-js: navigatorLock: not immediately available`,e),new _i(`Acquiring an exclusive Navigator LockManager lock "${e}" immediately failed`);else{if(Z.debug)try{let e=await globalThis.navigator.locks.query();console.log(`@supabase/gotrue-js: Navigator LockManager state`,JSON.stringify(e,null,`  `))}catch(e){console.warn(`@supabase/gotrue-js: Error when querying Navigator LockManager state`,e)}return console.warn(`@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request`),clearTimeout(i),await n()}})}catch(a){if(clearTimeout(i),typeof a==`object`&&a&&`name`in a&&a.name===`AbortError`){if(r.signal.aborted)return Z.debug&&console.log(`@supabase/gotrue-js: navigatorLock: acquire timeout, recovering by stealing lock`,e),console.warn(`@supabase/gotrue-js: Lock "${e}" was not released within ${t}ms. This may indicate an orphaned lock from a component unmount (e.g., React Strict Mode). Forcefully acquiring the lock to recover.`),await Promise.resolve().then(()=>globalThis.navigator.locks.request(e,{mode:`exclusive`,steal:!0},async t=>{if(t){Z.debug&&console.log(`@supabase/gotrue-js: navigatorLock: recovered (stolen)`,e,t.name);try{return await n()}finally{Z.debug&&console.log(`@supabase/gotrue-js: navigatorLock: released (stolen)`,e,t.name)}}else return console.warn(`@supabase/gotrue-js: Navigator LockManager returned null lock even with steal: true`),await n()}));throw Z.debug&&console.log(`@supabase/gotrue-js: navigatorLock: lock was stolen by another request`,e),new _i(`Lock "${e}" was released because another request stole it`)}throw a}}let bi={};async function xi(e,t,n){let r=bi[e]??Promise.resolve(),i=(async()=>{try{return await r,null}catch{return null}})(),a=(async()=>{let r=null;try{let n=t>=0?new Promise((n,i)=>{r=setTimeout(()=>{console.warn(`@supabase/gotrue-js: Lock "${e}" acquisition timed out after ${t}ms. This may be caused by another operation holding the lock. Consider increasing lockAcquireTimeout or checking for stuck operations.`),i(new vi(`Acquiring process lock with name "${e}" timed out`))},t)}):null;await Promise.race([i,n].filter(e=>e)),r!==null&&clearTimeout(r)}catch(e){if(r!==null&&clearTimeout(r),e instanceof gi)throw e}return await n()})();return bi[e]=(async()=>{try{return await a}catch(e){if(e instanceof gi){try{await r}catch{}return null}throw e}})(),await a}function Si(){if(typeof globalThis!=`object`)try{Object.defineProperty(Object.prototype,`__magic__`,{get:function(){return this},configurable:!0}),__magic__.globalThis=__magic__,delete Object.prototype.__magic__}catch{typeof self<`u`&&(self.globalThis=self)}}function Ci(e){if(!/^0x[a-fA-F0-9]{40}$/.test(e))throw Error(`@supabase/auth-js: Address "${e}" is invalid.`);return e.toLowerCase()}function wi(e){return parseInt(e,16)}function Ti(e){let t=new TextEncoder().encode(e);return`0x`+Array.from(t,e=>e.toString(16).padStart(2,`0`)).join(``)}function Ei(e){let{chainId:t,domain:n,expirationTime:r,issuedAt:i=new Date,nonce:a,notBefore:o,requestId:s,resources:c,scheme:l,uri:u,version:d}=e;if(!Number.isInteger(t))throw Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${t}`);if(!n)throw Error(`@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.`);if(a&&a.length<8)throw Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${a}`);if(!u)throw Error(`@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.`);if(d!==`1`)throw Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${d}`);if(e.statement?.includes(`
`))throw Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${e.statement}`);let f=Ci(e.address),p=`${l?`${l}://${n}`:n} wants you to sign in with your Ethereum account:\n${f}\n\n${e.statement?`${e.statement}\n`:``}`,m=`URI: ${u}\nVersion: ${d}\nChain ID: ${t}${a?`\nNonce: ${a}`:``}\nIssued At: ${i.toISOString()}`;if(r&&(m+=`\nExpiration Time: ${r.toISOString()}`),o&&(m+=`\nNot Before: ${o.toISOString()}`),s&&(m+=`\nRequest ID: ${s}`),c){let e=`
Resources:`;for(let t of c){if(!t||typeof t!=`string`)throw Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${t}`);e+=`\n- ${t}`}m+=e}return`${p}\n${m}`}var Q=class extends Error{constructor({message:e,code:t,cause:n,name:r}){super(e,{cause:n}),this.__isWebAuthnError=!0,this.name=r??(n instanceof Error?n.name:void 0)??`Unknown Error`,this.code=t}toJSON(){return{name:this.name,message:this.message,code:this.code}}},Di=class extends Q{constructor(e,t){super({code:`ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY`,cause:t,message:e}),this.name=`WebAuthnUnknownError`,this.originalError=t}};function Oi({error:e,options:t}){let{publicKey:n}=t;if(!n)throw Error(`options was missing required publicKey property`);if(e.name===`AbortError`){if(t.signal instanceof AbortSignal)return new Q({message:`Registration ceremony was sent an abort signal`,code:`ERROR_CEREMONY_ABORTED`,cause:e})}else if(e.name===`ConstraintError`){if(n.authenticatorSelection?.requireResidentKey===!0)return new Q({message:`Discoverable credentials were required but no available authenticator supported it`,code:`ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT`,cause:e});if(t.mediation===`conditional`&&n.authenticatorSelection?.userVerification===`required`)return new Q({message:`User verification was required during automatic registration but it could not be performed`,code:`ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE`,cause:e});if(n.authenticatorSelection?.userVerification===`required`)return new Q({message:`User verification was required but no available authenticator supported it`,code:`ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT`,cause:e})}else if(e.name===`InvalidStateError`)return new Q({message:`The authenticator was previously registered`,code:`ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED`,cause:e});else if(e.name===`NotAllowedError`)return new Q({message:e.message,code:`ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY`,cause:e});else if(e.name===`NotSupportedError`)return n.pubKeyCredParams.filter(e=>e.type===`public-key`).length===0?new Q({message:`No entry in pubKeyCredParams was of type "public-key"`,code:`ERROR_MALFORMED_PUBKEYCREDPARAMS`,cause:e}):new Q({message:`No available authenticator supported any of the specified pubKeyCredParams algorithms`,code:`ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG`,cause:e});else if(e.name===`SecurityError`){let t=window.location.hostname;if(Fi(t)){if(n.rp.id!==t)return new Q({message:`The RP ID "${n.rp.id}" is invalid for this domain`,code:`ERROR_INVALID_RP_ID`,cause:e})}else return new Q({message:`${window.location.hostname} is an invalid domain`,code:`ERROR_INVALID_DOMAIN`,cause:e})}else if(e.name===`TypeError`){if(n.user.id.byteLength<1||n.user.id.byteLength>64)return new Q({message:`User ID was not between 1 and 64 characters`,code:`ERROR_INVALID_USER_ID_LENGTH`,cause:e})}else if(e.name===`UnknownError`)return new Q({message:`The authenticator was unable to process the specified options, or could not create a new credential`,code:`ERROR_AUTHENTICATOR_GENERAL_ERROR`,cause:e});return new Q({message:`a Non-Webauthn related error has occurred`,code:`ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY`,cause:e})}function ki({error:e,options:t}){let{publicKey:n}=t;if(!n)throw Error(`options was missing required publicKey property`);if(e.name===`AbortError`){if(t.signal instanceof AbortSignal)return new Q({message:`Authentication ceremony was sent an abort signal`,code:`ERROR_CEREMONY_ABORTED`,cause:e})}else if(e.name===`NotAllowedError`)return new Q({message:e.message,code:`ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY`,cause:e});else if(e.name===`SecurityError`){let t=window.location.hostname;if(Fi(t)){if(n.rpId!==t)return new Q({message:`The RP ID "${n.rpId}" is invalid for this domain`,code:`ERROR_INVALID_RP_ID`,cause:e})}else return new Q({message:`${window.location.hostname} is an invalid domain`,code:`ERROR_INVALID_DOMAIN`,cause:e})}else if(e.name===`UnknownError`)return new Q({message:`The authenticator was unable to process the specified options, or could not create a new assertion signature`,code:`ERROR_AUTHENTICATOR_GENERAL_ERROR`,cause:e});return new Q({message:`a Non-Webauthn related error has occurred`,code:`ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY`,cause:e})}let Ai=new class{createNewAbortSignal(){if(this.controller){let e=Error(`Cancelling existing WebAuthn API call for new one`);e.name=`AbortError`,this.controller.abort(e)}let e=new AbortController;return this.controller=e,e.signal}cancelCeremony(){if(this.controller){let e=Error(`Manually cancelling existing WebAuthn API call`);e.name=`AbortError`,this.controller.abort(e),this.controller=void 0}}};function ji(e){if(!e)throw Error(`Credential creation options are required`);if(typeof PublicKeyCredential<`u`&&`parseCreationOptionsFromJSON`in PublicKeyCredential&&typeof PublicKeyCredential.parseCreationOptionsFromJSON==`function`)return PublicKeyCredential.parseCreationOptionsFromJSON(e);let{challenge:n,user:r,excludeCredentials:i}=e,a=t(e,[`challenge`,`user`,`excludeCredentials`]),o=Sr(n).buffer,s=Object.assign(Object.assign({},r),{id:Sr(r.id).buffer}),c=Object.assign(Object.assign({},a),{challenge:o,user:s});if(i&&i.length>0){c.excludeCredentials=Array(i.length);for(let e=0;e<i.length;e++){let t=i[e];c.excludeCredentials[e]=Object.assign(Object.assign({},t),{id:Sr(t.id).buffer,type:t.type||`public-key`,transports:t.transports})}}return c}function Mi(e){if(!e)throw Error(`Credential request options are required`);if(typeof PublicKeyCredential<`u`&&`parseRequestOptionsFromJSON`in PublicKeyCredential&&typeof PublicKeyCredential.parseRequestOptionsFromJSON==`function`)return PublicKeyCredential.parseRequestOptionsFromJSON(e);let{challenge:n,allowCredentials:r}=e,i=t(e,[`challenge`,`allowCredentials`]),a=Sr(n).buffer,o=Object.assign(Object.assign({},i),{challenge:a});if(r&&r.length>0){o.allowCredentials=Array(r.length);for(let e=0;e<r.length;e++){let t=r[e];o.allowCredentials[e]=Object.assign(Object.assign({},t),{id:Sr(t.id).buffer,type:t.type||`public-key`,transports:t.transports})}}return o}function Ni(e){if(`toJSON`in e&&typeof e.toJSON==`function`)return e.toJSON();let t=e;return{id:e.id,rawId:e.id,response:{attestationObject:z(new Uint8Array(e.response.attestationObject)),clientDataJSON:z(new Uint8Array(e.response.clientDataJSON))},type:`public-key`,clientExtensionResults:e.getClientExtensionResults(),authenticatorAttachment:t.authenticatorAttachment??void 0}}function Pi(e){if(`toJSON`in e&&typeof e.toJSON==`function`)return e.toJSON();let t=e,n=e.getClientExtensionResults(),r=e.response;return{id:e.id,rawId:e.id,response:{authenticatorData:z(new Uint8Array(r.authenticatorData)),clientDataJSON:z(new Uint8Array(r.clientDataJSON)),signature:z(new Uint8Array(r.signature)),userHandle:r.userHandle?z(new Uint8Array(r.userHandle)):void 0},type:`public-key`,clientExtensionResults:n,authenticatorAttachment:t.authenticatorAttachment??void 0}}function Fi(e){return e===`localhost`||/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(e)}function Ii(){return!!(B()&&`PublicKeyCredential`in window&&window.PublicKeyCredential&&`credentials`in navigator&&typeof(navigator==null?void 0:navigator.credentials)?.create==`function`&&typeof(navigator==null?void 0:navigator.credentials)?.get==`function`)}async function Li(e){try{let t=await navigator.credentials.create(e);return t?t instanceof PublicKeyCredential?{data:t,error:null}:{data:null,error:new Di(`Browser returned unexpected credential type`,t)}:{data:null,error:new Di(`Empty credential response`,t)}}catch(t){return{data:null,error:Oi({error:t,options:e})}}}async function Ri(e){try{let t=await navigator.credentials.get(e);return t?t instanceof PublicKeyCredential?{data:t,error:null}:{data:null,error:new Di(`Browser returned unexpected credential type`,t)}:{data:null,error:new Di(`Empty credential response`,t)}}catch(t){return{data:null,error:ki({error:t,options:e})}}}let zi={hints:[`security-key`],authenticatorSelection:{authenticatorAttachment:`cross-platform`,requireResidentKey:!1,userVerification:`preferred`,residentKey:`discouraged`},attestation:`direct`},Bi={userVerification:`preferred`,hints:[`security-key`],attestation:`direct`};function Vi(...e){let t=e=>typeof e==`object`&&!!e&&!Array.isArray(e),n=e=>e instanceof ArrayBuffer||ArrayBuffer.isView(e),r={};for(let i of e)if(i)for(let e in i){let a=i[e];if(a!==void 0)if(Array.isArray(a))r[e]=a;else if(n(a))r[e]=a;else if(t(a)){let n=r[e];t(n)?r[e]=Vi(n,a):r[e]=Vi(a)}else r[e]=a}return r}function Hi(e,t){return Vi(zi,e,t||{})}function Ui(e,t){return Vi(Bi,e,t||{})}var Wi=class{constructor(e){this.client=e,this.enroll=this._enroll.bind(this),this.challenge=this._challenge.bind(this),this.verify=this._verify.bind(this),this.authenticate=this._authenticate.bind(this),this.register=this._register.bind(this)}async _enroll(e){return this.client.mfa.enroll(Object.assign(Object.assign({},e),{factorType:`webauthn`}))}async _challenge({factorId:e,webauthn:t,friendlyName:n,signal:r},i){try{let{data:a,error:o}=await this.client.mfa.challenge({factorId:e,webauthn:t});if(!a)return{data:null,error:o};let s=r??Ai.createNewAbortSignal();if(a.webauthn.type===`create`){let{user:e}=a.webauthn.credential_options.publicKey;if(!e.name){let t=n;if(t)e.name=`${e.id}:${t}`;else{let t=(await this.client.getUser()).data.user,n=t?.user_metadata?.name||t?.email||t?.id||`User`;e.name=`${e.id}:${n}`}}e.displayName||=e.name}switch(a.webauthn.type){case`create`:{let{data:t,error:n}=await Li({publicKey:Hi(a.webauthn.credential_options.publicKey,i?.create),signal:s});return t?{data:{factorId:e,challengeId:a.id,webauthn:{type:a.webauthn.type,credential_response:t}},error:null}:{data:null,error:n}}case`request`:{let t=Ui(a.webauthn.credential_options.publicKey,i?.request),{data:n,error:r}=await Ri(Object.assign(Object.assign({},a.webauthn.credential_options),{publicKey:t,signal:s}));return n?{data:{factorId:e,challengeId:a.id,webauthn:{type:a.webauthn.type,credential_response:n}},error:null}:{data:null,error:r}}}}catch(e){return P(e)?{data:null,error:e}:{data:null,error:new F(`Unexpected error in challenge`,e)}}}async _verify({challengeId:e,factorId:t,webauthn:n}){return this.client.mfa.verify({factorId:t,challengeId:e,webauthn:n})}async _authenticate({factorId:e,webauthn:{rpId:t=typeof window<`u`?window.location.hostname:void 0,rpOrigins:n=typeof window<`u`?[window.location.origin]:void 0,signal:r}={}},i){if(!t)return{data:null,error:new Xn(`rpId is required for WebAuthn authentication`)};try{if(!Ii())return{data:null,error:new F(`Browser does not support WebAuthn`,null)};let{data:a,error:o}=await this.challenge({factorId:e,webauthn:{rpId:t,rpOrigins:n},signal:r},{request:i});if(!a)return{data:null,error:o};let{webauthn:s}=a;return this._verify({factorId:e,challengeId:a.challengeId,webauthn:{type:s.type,rpId:t,rpOrigins:n,credential_response:s.credential_response}})}catch(e){return P(e)?{data:null,error:e}:{data:null,error:new F(`Unexpected error in authenticate`,e)}}}async _register({friendlyName:e,webauthn:{rpId:t=typeof window<`u`?window.location.hostname:void 0,rpOrigins:n=typeof window<`u`?[window.location.origin]:void 0,signal:r}={}},i){if(!t)return{data:null,error:new Xn(`rpId is required for WebAuthn registration`)};try{if(!Ii())return{data:null,error:new F(`Browser does not support WebAuthn`,null)};let{data:a,error:o}=await this._enroll({friendlyName:e});if(!a)return await this.client.mfa.listFactors().then(t=>t.data?.all.find(t=>t.factor_type===`webauthn`&&t.friendly_name===e&&t.status===`unverified`)).then(e=>e?this.client.mfa.unenroll({factorId:e?.id}):void 0),{data:null,error:o};let{data:s,error:c}=await this._challenge({factorId:a.id,friendlyName:a.friendly_name,webauthn:{rpId:t,rpOrigins:n},signal:r},{create:i});return s?this._verify({factorId:a.id,challengeId:s.challengeId,webauthn:{rpId:t,rpOrigins:n,type:s.webauthn.type,credential_response:s.webauthn.credential_response}}):{data:null,error:c}}catch(e){return P(e)?{data:null,error:e}:{data:null,error:new F(`Unexpected error in register`,e)}}}};Si();let Gi={url:`http://localhost:9999`,storageKey:`supabase.auth.token`,autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0,headers:Kn,flowType:`implicit`,debug:!1,hasCustomAuthorizationHeader:!1,throwOnError:!1,lockAcquireTimeout:5e3,skipAutoInitialize:!1,experimental:{}},$={},Ki=!1;var qi=class e{get jwks(){return $[this.storageKey]?.jwks??{keys:[]}}set jwks(e){$[this.storageKey]=Object.assign(Object.assign({},$[this.storageKey]),{jwks:e})}get jwks_cached_at(){return $[this.storageKey]?.cachedAt??-(2**53-1)}set jwks_cached_at(e){$[this.storageKey]=Object.assign(Object.assign({},$[this.storageKey]),{cachedAt:e})}constructor(t){var n;this.userStorage=null,this.memoryStorage=null,this.stateChangeEmitters=new Map,this.autoRefreshTicker=null,this.autoRefreshTickTimeout=null,this.visibilityChangedCallback=null,this.refreshingDeferred=null,this.lastRefreshFailure=null,this._sessionRemovalEpoch=0,this.initializePromise=null,this._pendingInitNotifications=null,this.detectSessionInUrl=!0,this.hasCustomAuthorizationHeader=!1,this.suppressGetSessionWarning=!1,this.lock=null,this.lockAcquired=!1,this.pendingInLock=[],this.broadcastChannel=null,this.logger=console.log;let r=Object.assign(Object.assign({},Gi),t);if(this.storageKey=r.storageKey,this.instanceID=e.nextInstanceID[this.storageKey]??0,e.nextInstanceID[this.storageKey]=this.instanceID+1,this.logDebugMessages=!!r.debug,typeof r.debug==`function`&&(this.logger=r.debug),this.instanceID>0&&B()){let e=`${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;console.warn(e),this.logDebugMessages&&console.trace(e)}if(this.persistSession=r.persistSession,this.autoRefreshToken=r.autoRefreshToken,this.experimental=r.experimental??{},this.admin=new mi({url:r.url,headers:r.headers,fetch:r.fetch,experimental:this.experimental}),this.url=r.url,this.headers=r.headers,this.fetch=Or(r.fetch),this.detectSessionInUrl=r.detectSessionInUrl,this.flowType=r.flowType,this.hasCustomAuthorizationHeader=r.hasCustomAuthorizationHeader,this.throwOnError=r.throwOnError,this.lockAcquireTimeout=r.lockAcquireTimeout,r.lock!=null&&(this.lock=r.lock,Ki||(Ki=!0,console.warn(`${this._logPrefix()} The "lock" option is deprecated and will be removed in v3. The client now coordinates session refreshes without a lock, so most apps can drop the option. See https://github.com/supabase/supabase-js/blob/master/packages/core/auth-js/migrations/lockless-coordination.md`))),this.jwks||(this.jwks={keys:[]},this.jwks_cached_at=-(2**53-1)),this.mfa={verify:this._verify.bind(this),enroll:this._enroll.bind(this),unenroll:this._unenroll.bind(this),challenge:this._challenge.bind(this),listFactors:this._listFactors.bind(this),challengeAndVerify:this._challengeAndVerify.bind(this),getAuthenticatorAssuranceLevel:this._getAuthenticatorAssuranceLevel.bind(this),webauthn:new Wi(this),recoveryCodes:{getStatus:this._getRecoveryCodesStatus.bind(this),generate:this._generateRecoveryCodes.bind(this),verify:this._verifyRecoveryCode.bind(this),regenerate:this._regenerateRecoveryCodes.bind(this),unenroll:this._unenrollRecoveryCodes.bind(this)}},this.oauth={getAuthorizationDetails:this._getAuthorizationDetails.bind(this),approveAuthorization:this._approveAuthorization.bind(this),denyAuthorization:this._denyAuthorization.bind(this),listGrants:this._listOAuthGrants.bind(this),revokeGrant:this._revokeOAuthGrant.bind(this)},this.passkey={startRegistration:this._startPasskeyRegistration.bind(this),verifyRegistration:this._verifyPasskeyRegistration.bind(this),startAuthentication:this._startPasskeyAuthentication.bind(this),verifyAuthentication:this._verifyPasskeyAuthentication.bind(this),list:this._listPasskeys.bind(this),update:this._updatePasskey.bind(this),delete:this._deletePasskey.bind(this)},this.persistSession?(r.storage?this.storage=r.storage:Er()?this.storage=globalThis.localStorage:(this.memoryStorage={},this.storage=hi(this.memoryStorage)),r.userStorage&&(this.userStorage=r.userStorage)):(this.memoryStorage={},this.storage=hi(this.memoryStorage)),B()&&globalThis.BroadcastChannel&&this.persistSession&&this.storageKey){try{this.broadcastChannel=new globalThis.BroadcastChannel(this.storageKey)}catch(e){console.error(`Failed to create a new BroadcastChannel, multi-tab state changes will not be available`,e)}(n=this.broadcastChannel)==null||n.addEventListener(`message`,async e=>{this._debug(`received broadcast notification from other tab or client`,e),(e.data.event===`TOKEN_REFRESHED`||e.data.event===`SIGNED_IN`)&&(this.lastRefreshFailure=null);try{await this._notifyAllSubscribers(e.data.event,e.data.session,!1)}catch(e){this._debug(`#broadcastChannel`,`error`,e)}})}r.skipAutoInitialize||this.initialize().catch(e=>{this._debug(`#initialize()`,`error`,e)})}isThrowOnErrorEnabled(){return this.throwOnError}_returnResult(e){if(this.throwOnError&&e&&e.error)throw e.error;return e}_logPrefix(){return`GoTrueClient@${this.storageKey}:${this.instanceID} (${Wn}) ${new Date().toISOString()}`}_debug(...e){return this.logDebugMessages&&this.logger(this._logPrefix(),...e),this}async initialize(){if(this.initializePromise)return await this.initializePromise;this._pendingInitNotifications=[],this.initializePromise=(async()=>this.lock==null?await this._initialize():await this._acquireLock(this.lockAcquireTimeout,async()=>await this._initialize()))();let e=await this.initializePromise,t=this._pendingInitNotifications??[];this._pendingInitNotifications=null;for(let e of t)await this._notifyAllSubscribers(e.event,e.session,e.broadcast);return e}async _initialize(){try{let e={},t=`none`;if(B()&&(e=Dr(window.location.href),this._isImplicitGrantCallback(e)?t=`implicit`:await this._isPKCECallback(e)&&(t=`pkce`)),B()&&this.detectSessionInUrl&&t!==`none`){let{data:n,error:r}=await this._getSessionFromURL(e,t);if(r){if(this._debug(`#_initialize()`,`error detecting session from URL`,r),nr(r)){let e=r.details?.code;if(e===`identity_already_exists`||e===`identity_not_found`||e===`single_identity_not_deletable`)return{error:r}}return{error:r}}let{session:i,redirectType:a}=n;return this._debug(`#_initialize()`,`detected session in URL`,i,`redirect type`,a),await this._saveSession(i),setTimeout(async()=>{a===`recovery`?await this._notifyAllSubscribers(`PASSWORD_RECOVERY`,i):await this._notifyAllSubscribers(`SIGNED_IN`,i)},0),{error:null}}return await this._recoverAndRefresh(),{error:null}}catch(e){return P(e)?this._returnResult({error:e}):this._returnResult({error:new F(`Unexpected error during initialization`,e)})}finally{await this._handleVisibilityChange(),this._debug(`#_initialize()`,`end`)}}async signInAnonymously(e){try{let{data:t,error:n}=await J(this.fetch,`POST`,`${this.url}/signup`,{headers:this.headers,body:{data:e?.options?.data??{},gotrue_meta_security:{captcha_token:e?.options?.captchaToken}},xform:Y});if(n||!t)return this._returnResult({data:{user:null,session:null},error:n});let r=t.session,i=t.user;return t.session&&(await this._saveSession(t.session),await this._notifyAllSubscribers(`SIGNED_IN`,r)),this._returnResult({data:{user:i,session:r},error:null})}catch(e){if(P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async signUp(e){let t=null;try{let n;if(`email`in e){let{email:r,password:i,options:a}=e,o=null,s=null;this.flowType===`pkce`&&([o,s,t]=await this._getCodeChallengeAndMethod()),n=await J(this.fetch,`POST`,`${this.url}/signup`,{headers:this.headers,redirectTo:this._maybeAppendFlowIdToRedirect(a?.emailRedirectTo,t),body:{email:r,password:i,data:a?.data??{},gotrue_meta_security:{captcha_token:a?.captchaToken},code_challenge:o,code_challenge_method:s},xform:Y})}else if(`phone`in e){let{phone:t,password:r,options:i}=e;n=await J(this.fetch,`POST`,`${this.url}/signup`,{headers:this.headers,body:{phone:t,password:r,data:i?.data??{},channel:i?.channel??`sms`,gotrue_meta_security:{captcha_token:i?.captchaToken}},xform:Y})}else throw new er(`You must provide either an email or phone number and a password`);let{data:r,error:i}=n;if(i||!r)return await G(this.storage,this.storageKey,t),this._returnResult({data:{user:null,session:null},error:i});let a=r.session,o=r.user;return r.session&&(await this._saveSession(r.session),await this._notifyAllSubscribers(`SIGNED_IN`,a)),this._returnResult({data:{user:o,session:a},error:null})}catch(e){if(await G(this.storage,this.storageKey,t),P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async signInWithPassword(e){try{let t;if(`email`in e){let{email:n,password:r,options:i}=e;t=await J(this.fetch,`POST`,`${this.url}/token?grant_type=password`,{headers:this.headers,body:{email:n,password:r,gotrue_meta_security:{captcha_token:i?.captchaToken}},xform:ci})}else if(`phone`in e){let{phone:n,password:r,options:i}=e;t=await J(this.fetch,`POST`,`${this.url}/token?grant_type=password`,{headers:this.headers,body:{phone:n,password:r,gotrue_meta_security:{captcha_token:i?.captchaToken}},xform:ci})}else throw new er(`You must provide either an email or phone number and a password`);let{data:n,error:r}=t;if(r)return this._returnResult({data:{user:null,session:null},error:r});if(!n||!n.session||!n.user){let e=new R;return this._returnResult({data:{user:null,session:null},error:e})}return n.session&&(await this._saveSession(n.session),await this._notifyAllSubscribers(`SIGNED_IN`,n.session)),this._returnResult({data:Object.assign({user:n.user,session:n.session},n.weak_password?{weakPassword:n.weak_password}:null),error:r})}catch(e){if(P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async signInWithOAuth(e){return await this._handleProviderSignIn(e.provider,{redirectTo:e.options?.redirectTo,scopes:e.options?.scopes,queryParams:e.options?.queryParams,skipBrowserRedirect:e.options?.skipBrowserRedirect})}async exchangeCodeForSession(e,t){return await this.initializePromise,this.lock==null?this._exchangeCodeForSession(e,t):this._acquireLock(this.lockAcquireTimeout,async()=>this._exchangeCodeForSession(e,t))}async signInWithWeb3(e){let{chain:t}=e;switch(t){case`ethereum`:return await this.signInWithEthereum(e);case`solana`:return await this.signInWithSolana(e);default:throw Error(`@supabase/auth-js: Unsupported chain "${t}"`)}}async signInWithEthereum(e){let t,n;if(`message`in e)t=e.message,n=e.signature;else{let{chain:r,wallet:i,statement:a,options:o}=e,s;if(B())if(typeof i==`object`)s=i;else{let e=window;if(`ethereum`in e&&typeof e.ethereum==`object`&&`request`in e.ethereum&&typeof e.ethereum.request==`function`)s=e.ethereum;else throw Error(`@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.`)}else{if(typeof i!=`object`||!o?.url)throw Error(`@supabase/auth-js: Both wallet and url must be specified in non-browser environments.`);s=i}let c=new URL(o?.url??window.location.href),l=await s.request({method:`eth_requestAccounts`}).then(e=>e).catch(()=>{throw Error(`@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid`)});if(!l||l.length===0)throw Error(`@supabase/auth-js: No accounts available. Please ensure the wallet is connected.`);let u=Ci(l[0]),d=o?.signInWithEthereum?.chainId;d||=wi(await s.request({method:`eth_chainId`})),t=Ei({domain:c.host,address:u,statement:a,uri:c.href,version:`1`,chainId:d,nonce:o?.signInWithEthereum?.nonce,issuedAt:o?.signInWithEthereum?.issuedAt??new Date,expirationTime:o?.signInWithEthereum?.expirationTime,notBefore:o?.signInWithEthereum?.notBefore,requestId:o?.signInWithEthereum?.requestId,resources:o?.signInWithEthereum?.resources}),n=await s.request({method:`personal_sign`,params:[Ti(t),u]})}try{let{data:r,error:i}=await J(this.fetch,`POST`,`${this.url}/token?grant_type=web3`,{headers:this.headers,body:Object.assign({chain:`ethereum`,message:t,signature:n},e.options?.captchaToken?{gotrue_meta_security:{captcha_token:e.options?.captchaToken}}:null),xform:Y});if(i)throw i;if(!r||!r.session||!r.user){let e=new R;return this._returnResult({data:{user:null,session:null},error:e})}return r.session&&(await this._saveSession(r.session),await this._notifyAllSubscribers(`SIGNED_IN`,r.session)),this._returnResult({data:Object.assign({},r),error:i})}catch(e){if(P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async signInWithSolana(e){let t,n;if(`message`in e)t=e.message,n=e.signature;else{let{chain:r,wallet:i,statement:a,options:o}=e,s;if(B())if(typeof i==`object`)s=i;else{let e=window;if(`solana`in e&&typeof e.solana==`object`&&(`signIn`in e.solana&&typeof e.solana.signIn==`function`||`signMessage`in e.solana&&typeof e.solana.signMessage==`function`))s=e.solana;else throw Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`)}else{if(typeof i!=`object`||!o?.url)throw Error(`@supabase/auth-js: Both wallet and url must be specified in non-browser environments.`);s=i}let c=new URL(o?.url??window.location.href);if(`signIn`in s&&s.signIn){let e=await s.signIn(Object.assign(Object.assign(Object.assign({issuedAt:new Date().toISOString()},o?.signInWithSolana),{version:`1`,domain:c.host,uri:c.href}),a?{statement:a}:null)),r;if(Array.isArray(e)&&e[0]&&typeof e[0]==`object`)r=e[0];else if(e&&typeof e==`object`&&`signedMessage`in e&&`signature`in e)r=e;else throw Error(`@supabase/auth-js: Wallet method signIn() returned unrecognized value`);if(`signedMessage`in r&&`signature`in r&&(typeof r.signedMessage==`string`||r.signedMessage instanceof Uint8Array)&&r.signature instanceof Uint8Array)t=typeof r.signedMessage==`string`?r.signedMessage:new TextDecoder().decode(r.signedMessage),n=r.signature;else throw Error(`@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields`)}else{if(!(`signMessage`in s)||typeof s.signMessage!=`function`||!(`publicKey`in s)||typeof s!=`object`||!s.publicKey||!(`toBase58`in s.publicKey)||typeof s.publicKey.toBase58!=`function`)throw Error(`@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API`);t=[`${c.host} wants you to sign in with your Solana account:`,s.publicKey.toBase58(),...a?[``,a,``]:[``],`Version: 1`,`URI: ${c.href}`,`Issued At: ${o?.signInWithSolana?.issuedAt??new Date().toISOString()}`,...o?.signInWithSolana?.notBefore?[`Not Before: ${o.signInWithSolana.notBefore}`]:[],...o?.signInWithSolana?.expirationTime?[`Expiration Time: ${o.signInWithSolana.expirationTime}`]:[],...o?.signInWithSolana?.chainId?[`Chain ID: ${o.signInWithSolana.chainId}`]:[],...o?.signInWithSolana?.nonce?[`Nonce: ${o.signInWithSolana.nonce}`]:[],...o?.signInWithSolana?.requestId?[`Request ID: ${o.signInWithSolana.requestId}`]:[],...o?.signInWithSolana?.resources?.length?[`Resources`,...o.signInWithSolana.resources.map(e=>`- ${e}`)]:[]].join(`
`);let e=await s.signMessage(new TextEncoder().encode(t),`utf8`);if(!e||!(e instanceof Uint8Array))throw Error(`@supabase/auth-js: Wallet signMessage() API returned an recognized value`);n=e}}try{let{data:r,error:i}=await J(this.fetch,`POST`,`${this.url}/token?grant_type=web3`,{headers:this.headers,body:Object.assign({chain:`solana`,message:t,signature:z(n)},e.options?.captchaToken?{gotrue_meta_security:{captcha_token:e.options?.captchaToken}}:null),xform:Y});if(i)throw i;if(!r||!r.session||!r.user){let e=new R;return this._returnResult({data:{user:null,session:null},error:e})}return r.session&&(await this._saveSession(r.session),await this._notifyAllSubscribers(`SIGNED_IN`,r.session)),this._returnResult({data:Object.assign({},r),error:i})}catch(e){if(P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async _exchangeCodeForSession(e,t){let n=t?.flowId!=null,r=n?zr(t?.flowId):B()?zr(Dr(window.location.href)[N]):null;n&&!r&&this._debug(`#_exchangeCodeForSession()`,`provided flowId is not a valid flow id`,t?.flowId);let{verifier:i,flowId:a}=n&&!r?{verifier:null,flowId:null}:await Gr(this.storage,this.storageKey,r),[o,s]=(i??``).split(`/`);try{if(!o&&this.flowType===`pkce`)throw new ir;let{data:t,error:n}=await J(this.fetch,`POST`,`${this.url}/token?grant_type=pkce`,{headers:this.headers,body:{auth_code:e,code_verifier:o},xform:Y});if(await G(this.storage,this.storageKey,a),n)throw n;if(!t||!t.session||!t.user){let e=new R;return this._returnResult({data:{user:null,session:null,redirectType:null},error:e})}return t.session&&(await this._saveSession(t.session),await this._notifyAllSubscribers(s===`recovery`?`PASSWORD_RECOVERY`:`SIGNED_IN`,t.session)),this._returnResult({data:Object.assign(Object.assign({},t),{redirectType:s??null}),error:n})}catch(e){if(await G(this.storage,this.storageKey,a),P(e))return this._returnResult({data:{user:null,session:null,redirectType:null},error:e});throw e}}async signInWithIdToken(e){try{let{options:t,provider:n,token:r,access_token:i,nonce:a}=e,{data:o,error:s}=await J(this.fetch,`POST`,`${this.url}/token?grant_type=id_token`,{headers:this.headers,body:{provider:n,id_token:r,access_token:i,nonce:a,gotrue_meta_security:{captcha_token:t?.captchaToken}},xform:Y});if(s)return this._returnResult({data:{user:null,session:null},error:s});if(!o||!o.session||!o.user){let e=new R;return this._returnResult({data:{user:null,session:null},error:e})}return o.session&&(await this._saveSession(o.session),await this._notifyAllSubscribers(`SIGNED_IN`,o.session)),this._returnResult({data:o,error:s})}catch(e){if(P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async signInWithOtp(e){let t=null;try{if(`email`in e){let{email:n,options:r}=e,i=null,a=null;this.flowType===`pkce`&&([i,a,t]=await this._getCodeChallengeAndMethod());let{error:o}=await J(this.fetch,`POST`,`${this.url}/otp`,{headers:this.headers,body:{email:n,data:r?.data??{},create_user:r?.shouldCreateUser??!0,gotrue_meta_security:{captcha_token:r?.captchaToken},code_challenge:i,code_challenge_method:a},redirectTo:this._maybeAppendFlowIdToRedirect(r?.emailRedirectTo,t)});return this._returnResult({data:{user:null,session:null},error:o})}if(`phone`in e){let{phone:t,options:n}=e,{data:r,error:i}=await J(this.fetch,`POST`,`${this.url}/otp`,{headers:this.headers,body:{phone:t,data:n?.data??{},create_user:n?.shouldCreateUser??!0,gotrue_meta_security:{captcha_token:n?.captchaToken},channel:n?.channel??`sms`}});return this._returnResult({data:{user:null,session:null,messageId:r?.message_id},error:i})}throw new er(`You must provide either an email or phone number.`)}catch(e){if(await G(this.storage,this.storageKey,t),P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async verifyOtp(e){try{let t,n;`options`in e&&(t=e.options?.redirectTo,n=e.options?.captchaToken);let{data:r,error:i}=await J(this.fetch,`POST`,`${this.url}/verify`,{headers:this.headers,body:Object.assign(Object.assign({},e),{gotrue_meta_security:{captcha_token:n}}),redirectTo:t,xform:Y});if(i)throw i;if(!r)throw Error(`An error occurred on token verification.`);let a=r.session,o=r.user;return a?.access_token&&(await this._saveSession(a),await this._notifyAllSubscribers(e.type==`recovery`?`PASSWORD_RECOVERY`:`SIGNED_IN`,a)),this._returnResult({data:{user:o,session:a},error:null})}catch(e){if(P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async signInWithSSO(e){let t=null;try{let n=null,r=null;this.flowType===`pkce`&&([n,r,t]=await this._getCodeChallengeAndMethod());let i=await J(this.fetch,`POST`,`${this.url}/sso`,{body:Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},`providerId`in e?{provider_id:e.providerId}:null),`domain`in e?{domain:e.domain}:null),{redirect_to:this._maybeAppendFlowIdToRedirect(e.options?.redirectTo,t)}),e?.options?.captchaToken?{gotrue_meta_security:{captcha_token:e.options.captchaToken}}:null),{skip_http_redirect:!0,code_challenge:n,code_challenge_method:r}),headers:this.headers,xform:li});return i.data?.url&&B()&&!e.options?.skipBrowserRedirect&&window.location.assign(i.data.url),this._returnResult(i)}catch(e){if(await G(this.storage,this.storageKey,t),P(e))return this._returnResult({data:null,error:e});throw e}}async reauthenticate(){return await this.initializePromise,this.lock==null?await this._reauthenticate():await this._acquireLock(this.lockAcquireTimeout,async()=>await this._reauthenticate())}async _reauthenticate(){try{return await this._useSession(async e=>{let{data:{session:t},error:n}=e;if(n)throw n;if(!t)throw new L;let{error:r}=await J(this.fetch,`GET`,`${this.url}/reauthenticate`,{headers:this.headers,jwt:t.access_token});return this._returnResult({data:{user:null,session:null},error:r})})}catch(e){if(P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async resend(e){let t=null;try{let n=`${this.url}/resend`;if(`email`in e){let{email:r,type:i,options:a}=e,o=null,s=null;this.flowType===`pkce`&&([o,s,t]=await this._getCodeChallengeAndMethod());let{error:c}=await J(this.fetch,`POST`,n,{headers:this.headers,body:{email:r,type:i,gotrue_meta_security:{captcha_token:a?.captchaToken},code_challenge:o,code_challenge_method:s},redirectTo:this._maybeAppendFlowIdToRedirect(a?.emailRedirectTo,t)});return c&&await G(this.storage,this.storageKey,t),this._returnResult({data:{user:null,session:null},error:c})}else if(`phone`in e){let{phone:t,type:r,options:i}=e,{data:a,error:o}=await J(this.fetch,`POST`,n,{headers:this.headers,body:{phone:t,type:r,gotrue_meta_security:{captcha_token:i?.captchaToken}}});return this._returnResult({data:{user:null,session:null,messageId:a?.message_id},error:o})}throw new er(`You must provide either an email or phone number and a type`)}catch(e){if(await G(this.storage,this.storageKey,t),P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async getSession(){return await this.initializePromise,this.lock==null?await this._useSession(async e=>e):await this._acquireLock(this.lockAcquireTimeout,async()=>this._useSession(async e=>e))}async _acquireLock(e,t){this._debug(`#_acquireLock`,`begin`,e);try{if(this.lockAcquired){let e=this.pendingInLock.length?this.pendingInLock[this.pendingInLock.length-1]:Promise.resolve(),n=(async()=>(await e,await t()))();return this.pendingInLock.push((async()=>{try{await n}catch{}})()),n}return await this.lock(`lock:${this.storageKey}`,e,async()=>{this._debug(`#_acquireLock`,`lock acquired for storage key`,this.storageKey);try{this.lockAcquired=!0;let e=t();for(this.pendingInLock.push((async()=>{try{await e}catch{}})()),await e;this.pendingInLock.length;){let e=[...this.pendingInLock];await Promise.all(e),this.pendingInLock.splice(0,e.length)}return await e}finally{this._debug(`#_acquireLock`,`lock released for storage key`,this.storageKey),this.lockAcquired=!1}})}finally{this._debug(`#_acquireLock`,`end`)}}async _useSession(e){this._debug(`#_useSession`,`begin`);try{return await e(await this.__loadSession())}finally{this._debug(`#_useSession`,`end`)}}async __loadSession(){this._debug(`#__loadSession()`,`begin`),this.lock!=null&&!this.lockAcquired&&this._debug(`#__loadSession()`,`used outside of an acquired lock!`,Error().stack);try{let e=null,t=await U(this.storage,this.storageKey);if(this._debug(`#getSession()`,`session from storage`,t),t!==null&&(this._isValidSession(t)?e=t:(this._debug(`#getSession()`,`session from storage is not valid`),await this._removeSession())),!e)return{data:{session:null},error:null};let n=e.expires_at?e.expires_at*1e3-Date.now()<Gn:!1;if(this._debug(`#__loadSession()`,`session has${n?``:` not`} expired`,`expires_at`,e.expires_at),!n)return{data:{session:await this._hydrateSessionUser(e)},error:null};let{data:r,error:i}=await this._callRefreshToken(e.refresh_token);if(i){let e=await U(this.storage,this.storageKey);return e&&this._isValidSession(e)&&e.expires_at&&e.expires_at*1e3>Date.now()?this._returnResult({data:{session:await this._hydrateSessionUser(e)},error:null}):this._returnResult({data:{session:null},error:i})}return this._returnResult({data:{session:r},error:null})}finally{this._debug(`#__loadSession()`,`end`)}}async _hydrateSessionUser(e){if(this.userStorage){let t=await U(this.userStorage,this.storageKey+`-user`);e.user=t?.user?t.user:ti()}if(this.storage.isServer&&e.user&&!e.user.__isUserNotAvailableProxy){let t={value:this.suppressGetSessionWarning};e.user=ni(e.user,t),t.value&&(this.suppressGetSessionWarning=!0)}return e}async getUser(e){if(e)return await this._getUser(e);await this.initializePromise;let t;return t=this.lock==null?await this._getUser():await this._acquireLock(this.lockAcquireTimeout,async()=>await this._getUser()),t.data.user&&(this.suppressGetSessionWarning=!0),t}async _getUser(e){try{return e?await J(this.fetch,`GET`,`${this.url}/user`,{headers:this.headers,jwt:e,xform:X}):await this._useSession(async e=>{let{data:t,error:n}=e;if(n)throw n;return!t.session?.access_token&&!this.hasCustomAuthorizationHeader?{data:{user:null},error:new L}:await J(this.fetch,`GET`,`${this.url}/user`,{headers:this.headers,jwt:t.session?.access_token??void 0,xform:X})})}catch(e){if(P(e))return $n(e)&&await this._removeSession(),this._returnResult({data:{user:null},error:e});throw e}}async updateUser(e,t={}){return await this.initializePromise,this.lock==null?await this._updateUser(e,t):await this._acquireLock(this.lockAcquireTimeout,async()=>await this._updateUser(e,t))}async _updateUser(e,t={}){let n=null;try{return await this._useSession(async r=>{let{data:i,error:a}=r;if(a)throw a;if(!i.session)throw new L;let o=i.session,s=null,c=null;this.flowType===`pkce`&&e.email!=null&&([s,c,n]=await this._getCodeChallengeAndMethod());let{data:l,error:u}=await J(this.fetch,`PUT`,`${this.url}/user`,{headers:this.headers,redirectTo:this._maybeAppendFlowIdToRedirect(t?.emailRedirectTo,n),body:Object.assign(Object.assign({},e),{code_challenge:s,code_challenge_method:c}),jwt:o.access_token,xform:X});if(u)throw u;return o.user=l.user,await this._saveSession(o),await this._notifyAllSubscribers(`USER_UPDATED`,o),this._returnResult({data:{user:o.user},error:null})})}catch(e){if(await G(this.storage,this.storageKey,n),P(e))return this._returnResult({data:{user:null},error:e});throw e}}async setSession(e){return await this.initializePromise,this.lock==null?await this._setSession(e):await this._acquireLock(this.lockAcquireTimeout,async()=>await this._setSession(e))}async _setSession(e){try{if(!e.access_token||!e.refresh_token)throw new L;let t=Date.now()/1e3,n=t,r=!0,i=null,{payload:a}=jr(e.access_token);if(a.exp&&(n=a.exp,r=n<=t),r){let{data:t,error:n}=await this._callRefreshToken(e.refresh_token);if(n)return this._returnResult({data:{user:null,session:null},error:n});if(!t)return{data:{user:null,session:null},error:null};i=t}else{let{data:r,error:a}=await this._getUser(e.access_token);if(a)return this._returnResult({data:{user:null,session:null},error:a});i={access_token:e.access_token,refresh_token:e.refresh_token,user:r.user,token_type:`bearer`,expires_in:n-t,expires_at:n},await this._saveSession(i),await this._notifyAllSubscribers(`SIGNED_IN`,i)}return this._returnResult({data:{user:i.user,session:i},error:null})}catch(e){if(P(e))return this._returnResult({data:{session:null,user:null},error:e});throw e}}async refreshSession(e){return await this.initializePromise,this.lock==null?await this._refreshSession(e):await this._acquireLock(this.lockAcquireTimeout,async()=>await this._refreshSession(e))}async _refreshSession(e){try{return await this._useSession(async t=>{if(!e){let{data:n,error:r}=t;if(r)throw r;e=n.session??void 0}if(!e?.refresh_token)throw new L;let{data:n,error:r}=await this._callRefreshToken(e.refresh_token);return r?this._returnResult({data:{user:null,session:null},error:r}):n?this._returnResult({data:{user:n.user,session:n},error:null}):this._returnResult({data:{user:null,session:null},error:null})})}catch(e){if(P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async _getSessionFromURL(e,t){try{if(!B())throw new tr(`No browser detected.`);if(e.error||e.error_description||e.error_code)throw new tr(e.error_description||`Error in URL with unspecified error_description`,{error:e.error||`unspecified_error`,code:e.error_code||`unspecified_code`});switch(t){case`implicit`:if(this.flowType===`pkce`)throw new rr(`Not a valid PKCE flow url.`);break;case`pkce`:if(this.flowType===`implicit`)throw new tr(`Not a valid implicit grant flow url.`);break;default:}if(t===`pkce`){if(this._debug(`#_initialize()`,`begin`,`is PKCE flow`,!0),!e.code)throw new rr(`No code detected.`);let{data:t,error:n}=await this._exchangeCodeForSession(e.code,{flowId:e[N]});if(n)throw n;let r=new URL(window.location.href);return r.searchParams.delete(`code`),r.searchParams.delete(N),window.history.replaceState(window.history.state,``,r.toString()),{data:{session:t.session,redirectType:t.redirectType??null},error:null}}let{provider_token:n,provider_refresh_token:r,access_token:i,refresh_token:a,expires_in:o,expires_at:s,token_type:c}=e;if(!i||!o||!a||!c)throw new tr(`No session defined in URL`);let l=Math.round(Date.now()/1e3),u=parseInt(o),d=l+u;s&&(d=parseInt(s));let f=d-l;f*1e3<=M&&console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${f}s, should have been closer to ${u}s`);let p=d-u;l-p>=120?console.warn(`@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale`,p,d,l):l-p<0&&console.warn(`@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew`,p,d,l);let{data:m,error:h}=await this._getUser(i);if(h)throw h;let g={provider_token:n,provider_refresh_token:r,access_token:i,expires_in:u,expires_at:d,refresh_token:a,token_type:c,user:m.user};return window.location.hash=``,this._debug(`#_getSessionFromURL()`,`clearing window.location.hash`),this._returnResult({data:{session:g,redirectType:e.type},error:null})}catch(e){if(P(e))return this._returnResult({data:{session:null,redirectType:null},error:e});throw e}}_isImplicitGrantCallback(e){return typeof this.detectSessionInUrl==`function`?this.detectSessionInUrl(new URL(window.location.href),e):!!(e.access_token||e.error||e.error_description||e.error_code)}async _isPKCECallback(e){if(!e.code)return!1;let t=zr(e[N]);return t&&await U(this.storage,Vr(this.storageKey,t))?!0:!!await U(this.storage,`${this.storageKey}-code-verifier`)}async signOut(e={scope:`global`}){return await this.initializePromise,this.lock==null?await this._signOut(e):await this._acquireLock(this.lockAcquireTimeout,async()=>await this._signOut(e))}async _signOut({scope:e}={scope:`global`}){return await this._useSession(async t=>{let n=async()=>{await this._removeSession()},{data:r,error:i}=t;if(i&&!$n(i))return this._returnResult({error:i});let a=r.session?.access_token;if(a){let{error:t}=await this.admin.signOut(a,e);if(t&&!(Qn(t)&&(t.status===404||t.status===401||t.status===403)||$n(t)))return e!==`others`&&await n(),this._returnResult({error:t})}return e!==`others`&&await n(),this._returnResult({error:null})})}onAuthStateChange(e){let t=Tr(),n={id:t,callback:e,unsubscribe:()=>{this._debug(`#unsubscribe()`,`state change callback with id removed`,t),this.stateChangeEmitters.delete(t)}};return this._debug(`#onAuthStateChange()`,`registered callback with id`,t),this.stateChangeEmitters.set(t,n),(async()=>{await this.initializePromise,this.lock==null?await this._emitInitialSession(t):await this._acquireLock(this.lockAcquireTimeout,async()=>{this._emitInitialSession(t)})})(),{data:{subscription:n}}}async _emitInitialSession(e){return await this._useSession(async t=>{try{let{data:{session:n},error:r}=t;if(r)throw r;await this.stateChangeEmitters.get(e)?.callback(`INITIAL_SESSION`,n),this._debug(`INITIAL_SESSION`,`callback id`,e,`session`,n)}catch(t){if(await this.stateChangeEmitters.get(e)?.callback(`INITIAL_SESSION`,null),this._debug(`INITIAL_SESSION`,`callback id`,e,`error`,t),lr(t))return;$n(t)||sr(t)||Qn(t)&&(t.code===`refresh_token_not_found`||t.code===`refresh_token_already_used`||t.code===`session_expired`)?console.warn(t):console.error(t)}})}async resetPasswordForEmail(e,t={}){let n=null,r=null,i=null;this.flowType===`pkce`&&([n,r,i]=await this._getCodeChallengeAndMethod(!0));try{return await J(this.fetch,`POST`,`${this.url}/recover`,{body:{email:e,code_challenge:n,code_challenge_method:r,gotrue_meta_security:{captcha_token:t.captchaToken}},headers:this.headers,redirectTo:this._maybeAppendFlowIdToRedirect(t.redirectTo,i)})}catch(e){if(await G(this.storage,this.storageKey,i),P(e))return this._returnResult({data:null,error:e});throw e}}async getUserIdentities(){try{let{data:e,error:t}=await this.getUser();if(t)throw t;return this._returnResult({data:{identities:e.user.identities??[]},error:null})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async linkIdentity(e){return`token`in e?this.linkIdentityIdToken(e):this.linkIdentityOAuth(e)}async linkIdentityOAuth(e){let t=null;try{let{data:n,error:r}=await this._useSession(async n=>{let{data:r,error:i}=n;if(i)throw i;let{url:a,flowId:o}=await this._getUrlForProvider(`${this.url}/user/identities/authorize`,e.provider,{redirectTo:e.options?.redirectTo,scopes:e.options?.scopes,queryParams:e.options?.queryParams,skipBrowserRedirect:!0});return t=o,await J(this.fetch,`GET`,a,{headers:this.headers,jwt:r.session?.access_token??void 0})});if(r)throw r;return B()&&!e.options?.skipBrowserRedirect&&window.location.assign(n?.url),this._returnResult({data:{provider:e.provider,url:n?.url,flowId:t},error:null})}catch(n){if(P(n))return this._returnResult({data:{provider:e.provider,url:null,flowId:t},error:n});throw n}}async linkIdentityIdToken(e){return await this._useSession(async t=>{try{let{error:n,data:{session:r}}=t;if(n)throw n;let{options:i,provider:a,token:o,access_token:s,nonce:c}=e,{data:l,error:u}=await J(this.fetch,`POST`,`${this.url}/token?grant_type=id_token`,{headers:this.headers,jwt:r?.access_token??void 0,body:{provider:a,id_token:o,access_token:s,nonce:c,link_identity:!0,gotrue_meta_security:{captcha_token:i?.captchaToken}},xform:Y});return u?this._returnResult({data:{user:null,session:null},error:u}):!l||!l.session||!l.user?this._returnResult({data:{user:null,session:null},error:new R}):(l.session&&(await this._saveSession(l.session),await this._notifyAllSubscribers(`USER_UPDATED`,l.session)),this._returnResult({data:l,error:u}))}catch(e){if(await G(this.storage,this.storageKey,null),P(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}})}async unlinkIdentity(e){try{return await this._useSession(async t=>{let{data:n,error:r}=t;if(r)throw r;return await J(this.fetch,`DELETE`,`${this.url}/user/identities/${e.identity_id}`,{headers:this.headers,jwt:n.session?.access_token??void 0})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _refreshAccessToken(e){let t=`#_refreshAccessToken()`;this._debug(t,`begin`);try{let n=Date.now();return await Nr(async n=>(n>0&&await Mr(200*2**(n-1)),this._debug(t,`refreshing attempt`,n),await J(this.fetch,`POST`,`${this.url}/token?grant_type=refresh_token`,{body:{refresh_token:e},headers:this.headers,xform:Y})),(e,t)=>{let r=200*2**e;return t&&sr(t)&&Date.now()+r-n<M})}catch(e){if(this._debug(t,`error`,e),P(e))return this._returnResult({data:{session:null,user:null},error:e});throw e}finally{this._debug(t,`end`)}}_isValidSession(e){return typeof e==`object`&&!!e&&`access_token`in e&&`refresh_token`in e&&`expires_at`in e}async _handleProviderSignIn(e,t){let{url:n,flowId:r}=await this._getUrlForProvider(`${this.url}/authorize`,e,{redirectTo:t.redirectTo,scopes:t.scopes,queryParams:t.queryParams});return this._debug(`#_handleProviderSignIn()`,`provider`,e,`options`,t,`url`,n),B()&&!t.skipBrowserRedirect&&window.location.assign(n),{data:{provider:e,url:n,flowId:r},error:null}}async _recoverAndRefresh(){let e=`#_recoverAndRefresh()`;this._debug(e,`begin`);try{let t=await U(this.storage,this.storageKey);if(t&&this.userStorage){let e=await U(this.userStorage,this.storageKey+`-user`);!this.storage.isServer&&Object.is(this.storage,this.userStorage)&&!e&&(e={user:t.user},await H(this.userStorage,this.storageKey+`-user`,e)),t.user=e?.user??ti()}else if(t&&!t.user&&!t.user){let e=await U(this.storage,this.storageKey+`-user`);e&&e?.user?(t.user=e.user,await W(this.storage,this.storageKey+`-user`),await H(this.storage,this.storageKey,t)):t.user=ti()}if(this._debug(e,`session from storage`,t),!this._isValidSession(t)){this._debug(e,`session is not valid`),t!==null&&await this._removeSession();return}let n=(t.expires_at??1/0)*1e3-Date.now()<Gn;if(this._debug(e,`session has${n?``:` not`} expired with margin of ${Gn}s`),n){if(this.autoRefreshToken&&t.refresh_token){let{error:n}=await this._callRefreshToken(t.refresh_token);n&&(lr(n)?this._debug(e,`refresh discarded by commit guard`,n):this._debug(e,`refresh failed`,n))}}else if(t.user&&t.user.__isUserNotAvailableProxy===!0)try{let{data:n,error:r}=await this._getUser(t.access_token);!r&&n?.user?(t.user=n.user,await this._saveSession(t),await this._notifyAllSubscribers(`SIGNED_IN`,t)):this._debug(e,`could not get user data, skipping SIGNED_IN notification`)}catch(t){console.error(`Error getting user data:`,t),this._debug(e,`error getting user data, skipping SIGNED_IN notification`,t)}else await this._notifyAllSubscribers(`SIGNED_IN`,t)}catch(t){this._debug(e,`error`,t),sr(t)?console.warn(t):console.error(t);return}finally{this._debug(e,`end`)}}async _callRefreshToken(e){var t,n;if(!e)throw new L;if(this.refreshingDeferred)return this.refreshingDeferred.promise;if(this.lastRefreshFailure&&this.lastRefreshFailure.refreshToken===e&&Date.now()<this.lastRefreshFailure.expiresAt)return this._debug(`#_callRefreshToken()`,`returning cached failure (cooldown active)`),this.lastRefreshFailure.result;let r=`#_callRefreshToken()`;this._debug(r,`begin`);try{this.refreshingDeferred=new Ar,this.refreshingDeferred.promise.then(void 0,()=>{});let t=await U(this.storage,this.storageKey),{data:n,error:i}=await this._refreshAccessToken(e);if(i)throw i;if(!n.session)throw new L;let a=await U(this.storage,this.storageKey);if(t!==null&&(a===null||a.refresh_token!==t.refresh_token)){this._debug(r,`commit guard: storage changed since refresh started, discarding rotated tokens`,{startedWith:`present`,nowHolds:a?`replaced`:`cleared`});let e={data:null,error:new cr};return this.refreshingDeferred.resolve(e),e}let o=this._sessionRemovalEpoch;if(await this._saveSession(n.session),this._sessionRemovalEpoch!==o){this._debug(r,`commit guard (post-save): _removeSession ran during _saveSession, undoing write`),await W(this.storage,this.storageKey),this.userStorage&&await W(this.userStorage,this.storageKey+`-user`);let e={data:null,error:new cr};return this.refreshingDeferred.resolve(e),e}await this._notifyAllSubscribers(`TOKEN_REFRESHED`,n.session);let s={data:n.session,error:null};return this.lastRefreshFailure=null,this.refreshingDeferred.resolve(s),s}catch(i){if(this._debug(r,`error`,i),P(i)){let n={data:null,error:i};if(!sr(i)){let e=await U(this.storage,this.storageKey);e?.expires_at&&e.expires_at*1e3>Date.now()?this._debug(r,`proactive refresh failed, access token still valid — preserving session`):await this._removeSession()}return this.lastRefreshFailure={refreshToken:e,result:n,expiresAt:Date.now()+6e4},(t=this.refreshingDeferred)==null||t.resolve(n),n}throw(n=this.refreshingDeferred)==null||n.reject(i),i}finally{this.refreshingDeferred=null,this._debug(r,`end`)}}async _notifyAllSubscribers(e,t,n=!0){if(this._pendingInitNotifications!==null&&n){this._pendingInitNotifications.push({event:e,session:t,broadcast:n});return}let r=`#_notifyAllSubscribers(${e})`;this._debug(r,`begin`,t,`broadcast = ${n}`);try{this.broadcastChannel&&n&&this.broadcastChannel.postMessage({event:e,session:t});let r=[],i=Array.from(this.stateChangeEmitters.values()).map(async n=>{try{await n.callback(e,t)}catch(e){r.push(e)}});if(await Promise.all(i),r.length>0){for(let e=0;e<r.length;e+=1)console.error(r[e]);throw r[0]}}finally{this._debug(r,`end`)}}async _saveSession(e){this._debug(`#_saveSession()`,e),this.suppressGetSessionWarning=!0;let t=Object.assign({},e),n=t.user&&t.user.__isUserNotAvailableProxy===!0;if(this.userStorage){!n&&t.user&&await H(this.userStorage,this.storageKey+`-user`,{user:t.user});let e=Object.assign({},t);delete e.user;let r=ri(e);await H(this.storage,this.storageKey,r)}else{let e=ri(t);await H(this.storage,this.storageKey,e)}}async _removeSession(){this._sessionRemovalEpoch+=1,this._debug(`#_removeSession()`),this.lastRefreshFailure=null,this.suppressGetSessionWarning=!1,await W(this.storage,this.storageKey),await Kr(this.storage,this.storageKey),await W(this.storage,this.storageKey+`-user`),this.userStorage&&await W(this.userStorage,this.storageKey+`-user`),await this._notifyAllSubscribers(`SIGNED_OUT`,null)}_removeVisibilityChangedCallback(){this._debug(`#_removeVisibilityChangedCallback()`);let e=this.visibilityChangedCallback;this.visibilityChangedCallback=null;try{e&&B()&&window!=null&&window.removeEventListener&&window.removeEventListener(`visibilitychange`,e)}catch(e){console.error(`removing visibilitychange callback failed`,e)}}async _startAutoRefresh(){await this._stopAutoRefresh(),this._debug(`#_startAutoRefresh()`);let e=setInterval(()=>this._autoRefreshTokenTick(),M);this.autoRefreshTicker=e,e&&typeof e==`object`&&typeof e.unref==`function`?e.unref():typeof Deno<`u`&&typeof Deno.unrefTimer==`function`&&Deno.unrefTimer(e);let t=setTimeout(async()=>{await this.initializePromise,await this._autoRefreshTokenTick()},0);this.autoRefreshTickTimeout=t,t&&typeof t==`object`&&typeof t.unref==`function`?t.unref():typeof Deno<`u`&&typeof Deno.unrefTimer==`function`&&Deno.unrefTimer(t)}async _stopAutoRefresh(){this._debug(`#_stopAutoRefresh()`);let e=this.autoRefreshTicker;this.autoRefreshTicker=null,e&&clearInterval(e);let t=this.autoRefreshTickTimeout;this.autoRefreshTickTimeout=null,t&&clearTimeout(t)}async startAutoRefresh(){this._removeVisibilityChangedCallback(),await this._startAutoRefresh()}async stopAutoRefresh(){this._removeVisibilityChangedCallback(),await this._stopAutoRefresh()}async dispose(){var e;this._removeVisibilityChangedCallback(),await this._stopAutoRefresh(),(e=this.broadcastChannel)==null||e.close(),this.broadcastChannel=null,this.stateChangeEmitters.clear()}async _autoRefreshTokenTick(){if(this._debug(`#_autoRefreshTokenTick()`,`begin`),this.lock!=null){try{await this._acquireLock(0,async()=>{try{let e=Date.now();try{return await this._useSession(async t=>{let{data:{session:n}}=t;if(!n||!n.refresh_token||!n.expires_at){this._debug(`#_autoRefreshTokenTick()`,`no session`);return}let r=Math.floor((n.expires_at*1e3-e)/M);this._debug(`#_autoRefreshTokenTick()`,`access token expires in ${r} ticks, a tick lasts ${M}ms, refresh threshold is 3 ticks`),r<=3&&await this._callRefreshToken(n.refresh_token)})}catch(e){console.error(`Auto refresh tick failed with error. This is likely a transient error.`,e)}}finally{this._debug(`#_autoRefreshTokenTick()`,`end`)}})}catch(e){if(e instanceof gi)this._debug(`auto refresh token tick lock not available`);else throw e}return}if(this.refreshingDeferred!==null){this._debug(`#_autoRefreshTokenTick()`,`refresh already in flight, skipping`);return}try{let e=Date.now();try{await this._useSession(async t=>{let{data:{session:n}}=t;if(!n||!n.refresh_token||!n.expires_at){this._debug(`#_autoRefreshTokenTick()`,`no session`);return}let r=Math.floor((n.expires_at*1e3-e)/M);this._debug(`#_autoRefreshTokenTick()`,`access token expires in ${r} ticks, a tick lasts ${M}ms, refresh threshold is 3 ticks`),r<=3&&await this._callRefreshToken(n.refresh_token)})}catch(e){console.error(`Auto refresh tick failed with error. This is likely a transient error.`,e)}}finally{this._debug(`#_autoRefreshTokenTick()`,`end`)}}async _handleVisibilityChange(){if(this._debug(`#_handleVisibilityChange()`),!B()||!(window!=null&&window.addEventListener))return this.autoRefreshToken&&this.startAutoRefresh(),!1;try{this.visibilityChangedCallback=async()=>{try{await this._onVisibilityChanged(!1)}catch(e){this._debug(`#visibilityChangedCallback`,`error`,e)}},window==null||window.addEventListener(`visibilitychange`,this.visibilityChangedCallback),await this._onVisibilityChanged(!0)}catch(e){console.error(`_handleVisibilityChange`,e)}}async _onVisibilityChanged(e){let t=`#_onVisibilityChanged(${e})`;if(this._debug(t,`visibilityState`,document.visibilityState),document.visibilityState===`visible`){if(this.autoRefreshToken&&this._startAutoRefresh(),!e)if(await this.initializePromise,this.lock!=null)await this._acquireLock(this.lockAcquireTimeout,async()=>{if(document.visibilityState!==`visible`){this._debug(t,`acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting`);return}await this._recoverAndRefresh()});else{if(document.visibilityState!==`visible`){this._debug(t,`visibilityState is no longer visible, skipping recovery`);return}await this._recoverAndRefresh()}}else document.visibilityState===`hidden`&&this.autoRefreshToken&&this._stopAutoRefresh()}async _getUrlForProvider(e,t,n){let r=n?.redirectTo,i=null,a=null,o=null;this.flowType===`pkce`&&([i,a,o]=await this._getCodeChallengeAndMethod(),r=this._maybeAppendFlowIdToRedirect(r,o));let s=[`provider=${encodeURIComponent(t)}`];if(r&&s.push(`redirect_to=${encodeURIComponent(r)}`),n?.scopes&&s.push(`scopes=${encodeURIComponent(n.scopes)}`),i!=null&&a!=null){let e=new URLSearchParams({code_challenge:`${encodeURIComponent(i)}`,code_challenge_method:`${encodeURIComponent(a)}`});s.push(e.toString())}if(n?.queryParams){let e=new URLSearchParams(n.queryParams);s.push(e.toString())}return n?.skipBrowserRedirect&&s.push(`skip_http_redirect=${n.skipBrowserRedirect}`),{url:`${e}?${s.join(`&`)}`,flowId:o}}_maybeAppendFlowIdToRedirect(e,t){return!e||!t||!this.experimental.appendPkceFlowIdToRedirects?e??void 0:qr(e,t)}async _getCodeChallengeAndMethod(e=!1){return Jr(this.storage,this.storageKey,e,e=>this._debug(`#_getCodeChallengeAndMethod()`,`evicted oldest pending PKCE verifier slot`,e))}async _unenroll(e){try{return await this._useSession(async t=>{let{data:n,error:r}=t;return r?this._returnResult({data:null,error:r}):await J(this.fetch,`DELETE`,`${this.url}/factors/${e.factorId}`,{headers:this.headers,jwt:n?.session?.access_token})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _enroll(e){try{return await this._useSession(async t=>{let{data:n,error:r}=t;if(r)return this._returnResult({data:null,error:r});let i=Object.assign({friendly_name:e.friendlyName,factor_type:e.factorType},e.factorType===`phone`?{phone:e.phone}:e.factorType===`totp`?{issuer:e.issuer}:{}),{data:a,error:o}=await J(this.fetch,`POST`,`${this.url}/factors`,{body:i,headers:this.headers,jwt:n?.session?.access_token});return o?this._returnResult({data:null,error:o}):(e.factorType===`totp`&&a.type===`totp`&&a?.totp?.qr_code&&(a.totp.qr_code=`data:image/svg+xml;utf-8,${a.totp.qr_code}`),this._returnResult({data:a,error:null}))})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _verify(e){let t=async()=>{try{return await this._useSession(async t=>{let{data:n,error:r}=t;if(r)return this._returnResult({data:null,error:r});let i=Object.assign({challenge_id:e.challengeId},`webauthn`in e?{webauthn:Object.assign(Object.assign({},e.webauthn),{credential_response:e.webauthn.type===`create`?Ni(e.webauthn.credential_response):Pi(e.webauthn.credential_response)})}:{code:e.code}),{data:a,error:o}=await J(this.fetch,`POST`,`${this.url}/factors/${e.factorId}/verify`,{body:i,headers:this.headers,jwt:n?.session?.access_token});return o?this._returnResult({data:null,error:o}):(await this._saveSession(Object.assign({expires_at:Math.round(Date.now()/1e3)+a.expires_in},a)),await this._notifyAllSubscribers(`MFA_CHALLENGE_VERIFIED`,a),this._returnResult({data:a,error:o}))})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}};return this.lock==null?t():this._acquireLock(this.lockAcquireTimeout,t)}async _challenge(e){let t=async()=>{try{return await this._useSession(async t=>{let{data:n,error:r}=t;if(r)return this._returnResult({data:null,error:r});let i=await J(this.fetch,`POST`,`${this.url}/factors/${e.factorId}/challenge`,{body:e,headers:this.headers,jwt:n?.session?.access_token});if(i.error)return i;let{data:a}=i;if(a.type!==`webauthn`)return{data:a,error:null};switch(a.webauthn.type){case`create`:return{data:Object.assign(Object.assign({},a),{webauthn:Object.assign(Object.assign({},a.webauthn),{credential_options:Object.assign(Object.assign({},a.webauthn.credential_options),{publicKey:ji(a.webauthn.credential_options.publicKey)})})}),error:null};case`request`:return{data:Object.assign(Object.assign({},a),{webauthn:Object.assign(Object.assign({},a.webauthn),{credential_options:Object.assign(Object.assign({},a.webauthn.credential_options),{publicKey:Mi(a.webauthn.credential_options.publicKey)})})}),error:null}}})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}};return this.lock==null?t():this._acquireLock(this.lockAcquireTimeout,t)}async _challengeAndVerify(e){let{data:t,error:n}=await this._challenge({factorId:e.factorId});return n?this._returnResult({data:null,error:n}):await this._verify({factorId:e.factorId,challengeId:t.id,code:e.code})}async _listFactors(){let{data:{user:e},error:t}=await this.getUser();if(t)return{data:null,error:t};let n={all:[],phone:[],totp:[],webauthn:[],recovery_code:[]};for(let t of e?.factors??[])n.all.push(t),t.status===`verified`&&t.factor_type in n&&Array.isArray(n[t.factor_type])&&n[t.factor_type].push(t);return{data:n,error:null}}async _getAuthenticatorAssuranceLevel(e){if(e)try{let{payload:t}=jr(e),n=null;t.aal&&(n=t.aal);let r=n,{data:{user:i},error:a}=await this.getUser(e);if(a)return this._returnResult({data:null,error:a});((i?.factors)?.filter(e=>e.status===`verified`)??[]).length>0&&(r=`aal2`);let o=t.amr||[];return{data:{currentLevel:n,nextLevel:r,currentAuthenticationMethods:o},error:null}}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}let{data:{session:t},error:n}=await this.getSession();if(n)return this._returnResult({data:null,error:n});if(!t)return{data:{currentLevel:null,nextLevel:null,currentAuthenticationMethods:[]},error:null};let{payload:r}=jr(t.access_token),i=null;r.aal&&(i=r.aal);let a=i;(t.user.factors?.filter(e=>e.status===`verified`)??[]).length>0&&(a=`aal2`);let o=r.amr||[];return{data:{currentLevel:i,nextLevel:a,currentAuthenticationMethods:o},error:null}}async _getRecoveryCodesStatus(){ei(this.experimental);try{return await this._useSession(async e=>{let{data:t,error:n}=e;if(n)return this._returnResult({data:null,error:n});let{data:r,error:i}=await J(this.fetch,`GET`,`${this.url}/factors/recovery-codes`,{headers:this.headers,jwt:t?.session?.access_token});return i?this._returnResult({data:null,error:i}):this._returnResult({data:r,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _generateRecoveryCodes(e){ei(this.experimental);try{return await this._useSession(async t=>{let{data:n,error:r}=t;if(r)return this._returnResult({data:null,error:r});let{data:i,error:a}=await J(this.fetch,`POST`,`${this.url}/factors/recovery-codes`,{body:e?.friendlyName?{friendly_name:e.friendlyName}:void 0,headers:this.headers,jwt:n?.session?.access_token});return a?this._returnResult({data:null,error:a}):this._returnResult({data:i,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _verifyRecoveryCode(e){ei(this.experimental);let t=async()=>{try{return await this._useSession(async t=>{let{data:n,error:r}=t;if(r)return this._returnResult({data:null,error:r});let{data:i,error:a}=await J(this.fetch,`POST`,`${this.url}/factors/recovery-codes/verify`,{body:{code:e.code},headers:this.headers,jwt:n?.session?.access_token});if(a)return this._returnResult({data:null,error:a});let o=Object.assign({expires_at:wr(i.expires_in)},i);return await this._saveSession(o),await this._notifyAllSubscribers(`MFA_CHALLENGE_VERIFIED`,o),this._returnResult({data:i,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}};return this.lock==null?t():this._acquireLock(this.lockAcquireTimeout,t)}async _regenerateRecoveryCodes(){ei(this.experimental);try{return await this._useSession(async e=>{let{data:t,error:n}=e;if(n)return this._returnResult({data:null,error:n});let{data:r,error:i}=await J(this.fetch,`POST`,`${this.url}/factors/recovery-codes/regenerate`,{headers:this.headers,jwt:t?.session?.access_token});return i?this._returnResult({data:null,error:i}):this._returnResult({data:r,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _unenrollRecoveryCodes(){ei(this.experimental);try{return await this._useSession(async e=>{let{data:t,error:n}=e;if(n)return this._returnResult({data:null,error:n});let{data:r,error:i}=await J(this.fetch,`DELETE`,`${this.url}/factors/recovery-codes`,{headers:this.headers,jwt:t?.session?.access_token});return i?this._returnResult({data:null,error:i}):this._returnResult({data:r,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _getAuthorizationDetails(e){try{return await this._useSession(async t=>{let{data:{session:n},error:r}=t;return r?this._returnResult({data:null,error:r}):n?await J(this.fetch,`GET`,`${this.url}/oauth/authorizations/${e}`,{headers:this.headers,jwt:n.access_token,xform:e=>({data:e,error:null})}):this._returnResult({data:null,error:new L})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _approveAuthorization(e,t){try{return await this._useSession(async n=>{let{data:{session:r},error:i}=n;if(i)return this._returnResult({data:null,error:i});if(!r)return this._returnResult({data:null,error:new L});let a=await J(this.fetch,`POST`,`${this.url}/oauth/authorizations/${e}/consent`,{headers:this.headers,jwt:r.access_token,body:{action:`approve`},xform:e=>({data:e,error:null})});return a.data&&a.data.redirect_url&&B()&&!t?.skipBrowserRedirect&&window.location.assign(a.data.redirect_url),a})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _denyAuthorization(e,t){try{return await this._useSession(async n=>{let{data:{session:r},error:i}=n;if(i)return this._returnResult({data:null,error:i});if(!r)return this._returnResult({data:null,error:new L});let a=await J(this.fetch,`POST`,`${this.url}/oauth/authorizations/${e}/consent`,{headers:this.headers,jwt:r.access_token,body:{action:`deny`},xform:e=>({data:e,error:null})});return a.data&&a.data.redirect_url&&B()&&!t?.skipBrowserRedirect&&window.location.assign(a.data.redirect_url),a})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _listOAuthGrants(){try{return await this._useSession(async e=>{let{data:{session:t},error:n}=e;return n?this._returnResult({data:null,error:n}):t?await J(this.fetch,`GET`,`${this.url}/user/oauth/grants`,{headers:this.headers,jwt:t.access_token,xform:e=>({data:e,error:null})}):this._returnResult({data:null,error:new L})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _revokeOAuthGrant(e){try{return await this._useSession(async t=>{let{data:{session:n},error:r}=t;return r?this._returnResult({data:null,error:r}):n?(await J(this.fetch,`DELETE`,`${this.url}/user/oauth/grants`,{headers:this.headers,jwt:n.access_token,query:{client_id:e.clientId},noResolveJson:!0}),{data:{},error:null}):this._returnResult({data:null,error:new L})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async fetchJwk(e,t={keys:[]}){let n=t.keys.find(t=>t.kid===e);if(n)return n;let r=Date.now();if(n=this.jwks.keys.find(t=>t.kid===e),n&&this.jwks_cached_at+6e5>r)return n;let{data:i,error:a}=await J(this.fetch,`GET`,`${this.url}/.well-known/jwks.json`,{headers:this.headers});if(a)throw a;return!i.keys||i.keys.length===0||(this.jwks=i,this.jwks_cached_at=r,n=i.keys.find(t=>t.kid===e),!n)?null:n}async getClaims(e,t={}){try{let n=e;if(!n){let{data:e,error:t}=await this.getSession();if(t||!e.session)return this._returnResult({data:null,error:t});n=e.session.access_token}let{header:r,payload:i,signature:a,raw:{header:o,payload:s}}=jr(n);if(!t?.allowExpired)try{Zr(i.exp)}catch(e){throw new fr(e instanceof Error?e.message:`JWT validation failed`)}let c=!r.alg||r.alg.startsWith(`HS`)||!r.kid||!(`crypto`in globalThis&&`subtle`in globalThis.crypto)?null:await this.fetchJwk(r.kid,t?.keys?{keys:t.keys}:t?.jwks);if(!c){let{error:e}=await this.getUser(n);if(e)throw e;return{data:{claims:i,header:r,signature:a},error:null}}let l=Qr(r.alg),u=await crypto.subtle.importKey(`jwk`,c,l,!0,[`verify`]);if(!await crypto.subtle.verify(l,u,a,Cr(`${o}.${s}`)))throw new fr(`Invalid JWT signature`);return{data:{claims:i,header:r,signature:a},error:null}}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async signInWithPasskey(e){try{if(!Ii())return this._returnResult({data:null,error:new F(`Browser does not support WebAuthn`,null)});let{data:t,error:n}=await this._startPasskeyAuthentication({options:{captchaToken:e?.options?.captchaToken}});if(n||!t)return this._returnResult({data:null,error:n});let{data:r,error:i}=await Ri({publicKey:Mi(t.options),signal:e?.options?.signal??Ai.createNewAbortSignal(),mediation:e?.options?.mediation});if(i||!r)return this._returnResult({data:null,error:i??new F(`WebAuthn ceremony failed`,null)});let a=Pi(r);return this._verifyPasskeyAuthentication({challengeId:t.challenge_id,credential:a})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async registerPasskey(e){try{if(!Ii())return this._returnResult({data:null,error:new F(`Browser does not support WebAuthn`,null)});let{data:t,error:n}=await this._startPasskeyRegistration();if(n||!t)return this._returnResult({data:null,error:n});let{data:r,error:i}=await Li({publicKey:ji(t.options),signal:e?.options?.signal??Ai.createNewAbortSignal()});if(i||!r)return this._returnResult({data:null,error:i??new F(`WebAuthn ceremony failed`,null)});let a=Ni(r);return this._verifyPasskeyRegistration({challengeId:t.challenge_id,credential:a})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _startPasskeyRegistration(){try{return await this._useSession(async e=>{let{data:{session:t},error:n}=e;if(n)return this._returnResult({data:null,error:n});if(!t)return this._returnResult({data:null,error:new L});let{data:r,error:i}=await J(this.fetch,`POST`,`${this.url}/passkeys/registration/options`,{headers:this.headers,jwt:t.access_token,body:{}});return i?this._returnResult({data:null,error:i}):this._returnResult({data:r,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _verifyPasskeyRegistration(e){try{return await this._useSession(async t=>{let{data:{session:n},error:r}=t;if(r)return this._returnResult({data:null,error:r});if(!n)return this._returnResult({data:null,error:new L});let{data:i,error:a}=await J(this.fetch,`POST`,`${this.url}/passkeys/registration/verify`,{headers:this.headers,jwt:n.access_token,body:{challenge_id:e.challengeId,credential:e.credential}});return a?this._returnResult({data:null,error:a}):this._returnResult({data:i,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _startPasskeyAuthentication(e){try{let{data:t,error:n}=await J(this.fetch,`POST`,`${this.url}/passkeys/authentication/options`,{headers:this.headers,body:{gotrue_meta_security:{captcha_token:e?.options?.captchaToken}}});return n?this._returnResult({data:null,error:n}):this._returnResult({data:t,error:null})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _verifyPasskeyAuthentication(e){try{let{data:t,error:n}=await J(this.fetch,`POST`,`${this.url}/passkeys/authentication/verify`,{headers:this.headers,body:{challenge_id:e.challengeId,credential:e.credential},xform:Y});return n?this._returnResult({data:null,error:n}):(t.session&&(await this._saveSession(t.session),await this._notifyAllSubscribers(`SIGNED_IN`,t.session)),this._returnResult({data:t,error:null}))}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _listPasskeys(){try{return await this._useSession(async e=>{let{data:{session:t},error:n}=e;if(n)return this._returnResult({data:null,error:n});if(!t)return this._returnResult({data:null,error:new L});let{data:r,error:i}=await J(this.fetch,`GET`,`${this.url}/passkeys`,{headers:this.headers,jwt:t.access_token,xform:e=>({data:e,error:null})});return i?this._returnResult({data:null,error:i}):this._returnResult({data:r,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _updatePasskey(e){try{return await this._useSession(async t=>{let{data:{session:n},error:r}=t;if(r)return this._returnResult({data:null,error:r});if(!n)return this._returnResult({data:null,error:new L});let{data:i,error:a}=await J(this.fetch,`PATCH`,`${this.url}/passkeys/${e.passkeyId}`,{headers:this.headers,jwt:n.access_token,body:{friendly_name:e.friendlyName}});return a?this._returnResult({data:null,error:a}):this._returnResult({data:i,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}async _deletePasskey(e){try{return await this._useSession(async t=>{let{data:{session:n},error:r}=t;if(r)return this._returnResult({data:null,error:r});if(!n)return this._returnResult({data:null,error:new L});let{error:i}=await J(this.fetch,`DELETE`,`${this.url}/passkeys/${e.passkeyId}`,{headers:this.headers,jwt:n.access_token,noResolveJson:!0});return i?this._returnResult({data:null,error:i}):this._returnResult({data:null,error:null})})}catch(e){if(P(e))return this._returnResult({data:null,error:e});throw e}}};qi.nextInstanceID={};var Ji=qi,Yi=mi,Xi=Ji,Zi=class extends Xi{constructor(e){super(e)}},Qi=class{constructor(e,t,n){this.supabaseUrl=e,this.supabaseKey=t;let r=Un(e);if(!t)throw Error(`supabaseKey is required.`);Nn(t),Vn(n),this.realtimeUrl=new URL(`realtime/v1`,r),this.realtimeUrl.protocol=this.realtimeUrl.protocol.replace(`http`,`ws`),this.authUrl=new URL(`auth/v1`,r),this.storageUrl=new URL(`storage/v1`,r),this.functionsUrl=new URL(`functions/v1`,r);let i=`sb-${r.hostname.split(`.`)[0]}-auth-token`,a={db:yn,realtime:xn,auth:{...bn,storageKey:i},global:vn,tracePropagation:Sn},o=Hn(n??{},a);this.settings=o,this.storageKey=o.auth.storageKey??``,this.headers=o.global.headers??{},o.accessToken?(this.accessToken=o.accessToken,this.auth=new Proxy({},{get:(e,t)=>{throw Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(t)} is not possible`)}})):this.auth=this._initSupabaseAuthClient(o.auth??{},this.headers,o.global.fetch),this.fetch=Pn(t,e,this._getSessionToken.bind(this),o.global.fetch,o.tracePropagation),this.functionsFetch=Pn(t,e,this._getSessionToken.bind(this),o.global.fetch,o.tracePropagation,{omitApiKeyAsBearer:!0}),this.realtime=this._initRealtimeClient({headers:this.headers,accessToken:this._getAccessToken.bind(this),fetch:this.fetch,...o.realtime}),this.accessToken&&Promise.resolve(this.accessToken()).then(e=>this.realtime.setAuth(e)).catch(e=>console.warn(`Failed to set initial Realtime auth token:`,e)),this.rest=new fe(new URL(`rest/v1`,r).href,{headers:this.headers,schema:o.db.schema,fetch:this.fetch,timeout:o.db.timeout,urlLengthLimit:o.db.urlLengthLimit,retry:o.db.retry}),this.storage=new mn(this.storageUrl.href,this.headers,this.fetch,n?.storage),o.accessToken||this._listenForAuthEvents()}get functions(){return new l(this.functionsUrl.href,{headers:this.headers,customFetch:this.functionsFetch})}from(e){return this.rest.from(e)}schema(e){return this.rest.schema(e)}getOpenApiSpec(){return this.rest.getOpenApiSpec()}rpc(e,t={},n={head:!1,get:!1,count:void 0}){return this.rest.rpc(e,t,n)}channel(e,t={config:{}}){return this.realtime.channel(e,t)}getChannels(){return this.realtime.getChannels()}removeChannel(e){return this.realtime.removeChannel(e)}removeAllChannels(){return this.realtime.removeAllChannels()}async _getSessionToken(){if(this.accessToken)return await this.accessToken();let{data:e}=await this.auth.getSession();return e.session?.access_token??null}async _getAccessToken(){return await this._getSessionToken()??this.supabaseKey}_initSupabaseAuthClient({autoRefreshToken:e,persistSession:t,detectSessionInUrl:n,storage:r,userStorage:i,storageKey:a,flowType:o,lock:s,debug:c,throwOnError:l,experimental:u,lockAcquireTimeout:d,skipAutoInitialize:f},p,m){let h={Authorization:`Bearer ${this.supabaseKey}`,apikey:`${this.supabaseKey}`};return new Zi({url:this.authUrl.href,headers:{...h,...p},storageKey:a,autoRefreshToken:e,persistSession:t,detectSessionInUrl:n,storage:r,userStorage:i,flowType:o,lock:s,debug:c,throwOnError:l,experimental:u,fetch:m,lockAcquireTimeout:d,skipAutoInitialize:f,hasCustomAuthorizationHeader:Object.keys(this.headers).some(e=>e.toLowerCase()===`authorization`)})}_initRealtimeClient(e){return new _t(this.realtimeUrl.href,{...e,params:{apikey:this.supabaseKey,...e?.params}})}_listenForAuthEvents(){return this.auth.onAuthStateChange((e,t)=>{this._handleTokenChanged(e,`CLIENT`,t?.access_token)})}_handleTokenChanged(e,t,n){(e===`TOKEN_REFRESHED`||e===`SIGNED_IN`||e===`INITIAL_SESSION`)&&this.changedAccessToken!==n?(this.changedAccessToken=n,this.realtime.setAuth(n)):e===`SIGNED_OUT`&&(this.realtime.setAuth(),t==`STORAGE`&&this.auth.signOut(),this.changedAccessToken=void 0)}};let $i=(e,t,n)=>new Qi(e,t,n);function ea(){if(typeof window<`u`||globalThis.Deno!==void 0)return!1;let e=globalThis.process;if(!e)return!1;let t=e.version;if(t==null)return!1;let n=t.match(/^v(\d+)\./);return n?parseInt(n[1],10)<=20:!1}return ea()&&console.warn(`⚠️  Node.js 20 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 22 or later. For more information, visit: https://github.com/orgs/supabase/discussions/45715`),e.AuthAdminApi=Yi,e.AuthApiError=Zn,e.AuthClient=Xi,e.AuthError=Xn,e.AuthImplicitGrantRedirectError=tr,e.AuthInvalidCredentialsError=er,e.AuthInvalidJwtError=fr,e.AuthInvalidTokenResponseError=R,e.AuthPKCECodeVerifierMissingError=ir,e.AuthPKCEGrantCodeExchangeError=rr,e.AuthRefreshDiscardedError=cr,e.AuthRetryableFetchError=or,e.AuthSessionMissingError=L,e.AuthUnknownError=F,e.AuthWeakPasswordError=ur,e.CustomAuthError=I,Object.defineProperty(e,`FunctionRegion`,{enumerable:!0,get:function(){return c}}),e.FunctionsError=i,e.FunctionsFetchError=a,e.FunctionsHttpError=s,e.FunctionsRelayError=o,e.GoTrueAdminApi=mi,e.GoTrueClient=Ji,e.NavigatorLockAcquireTimeoutError=_i,e.PostgrestError=u,e.REALTIME_CHANNEL_STATES=ut,Object.defineProperty(e,`REALTIME_LISTEN_TYPES`,{enumerable:!0,get:function(){return T}}),Object.defineProperty(e,`REALTIME_POSTGRES_CHANGES_LISTEN_EVENT`,{enumerable:!0,get:function(){return lt}}),Object.defineProperty(e,`REALTIME_PRESENCE_LISTEN_EVENTS`,{enumerable:!0,get:function(){return Xe}}),Object.defineProperty(e,`REALTIME_SUBSCRIBE_STATES`,{enumerable:!0,get:function(){return E}}),e.RealtimeChannel=dt,e.RealtimeClient=_t,e.RealtimePostgresFilterBuilder=st,e.RealtimePresence=Ze,e.SIGN_OUT_SCOPES=pi,e.StorageApiError=Pt,e.SupabaseClient=Qi,e.WebSocketFactory=pe,e.createClient=$i,e.isAuthApiError=Qn,e.isAuthError=P,e.isAuthImplicitGrantRedirectError=nr,e.isAuthPKCECodeVerifierMissingError=ar,e.isAuthRefreshDiscardedError=lr,e.isAuthRetryableFetchError=sr,e.isAuthSessionMissingError=$n,e.isAuthWeakPasswordError=dr,e.lockInternals=Z,e.navigatorLock=yi,e.postgresChangesFilter=ct,e.processLock=xi,e})({});
;
window.FactorLabCloudConfig=Object.freeze({url:'https://uhmsxllsgwdjcnssbyxc.supabase.co',key:'sb_publishable_BZcH8Hy05fB96IvtKU1-sw_A6SPmG83',functionName:'swift-service',selfService:true});

;
(function(root){
  'use strict';
  async function withTimeout(task){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{return await task(controller.signal);}finally{clearTimeout(timer);}
  }
  const sdkFetch=(url,init={})=>init.signal?fetch(url,init):withTimeout(signal=>fetch(url,{...init,signal}));
  function normalizeStudioFields(envelope,state){
    const refs=envelope.evidenceRefs===undefined?[]:envelope.evidenceRefs;
    const evidence=root.FactorLabEvidence||(typeof require==='function'?require('../evidence-data.js'):null);
    const ledger=root.FactorLabLedger||(typeof require==='function'?require('../portfolio-ledger.js'):null);
    const simulation=root.FactorLabSimulation||(typeof require==='function'?require('../v2/simulation.js'):null);
    const view=state.ledger?ledger.createEngine(simulation).publicView(state):null;
    const records=view?evidence.buildEvidence(view):[];
    const allowed=new Set(['E1','E2','E3',...state.events.map(event=>event.id),...records.map(r=>r.id)]);
    if(!Array.isArray(refs)||refs.length>24||refs.some(id=>typeof id!=='string'||id.length>160||!allowed.has(id)&&!(view&&evidence.validateReference(view,id))))throw Error('invalid_save');
    const falsifierIf=envelope.falsifierIf===undefined?'':envelope.falsifierIf;
    if(typeof falsifierIf!=='string'||falsifierIf.length>500)throw Error('invalid_save');
    const progress=envelope.researchProgress===undefined?{hasRun:false,dirty:false,hasEfficacy:false,preferences:[25,25,25,25],resultPreferences:[25,25,25,25]}:envelope.researchProgress;
    if(!progress||typeof progress!=='object'||Array.isArray(progress)||['hasRun','dirty','hasEfficacy'].some(key=>typeof progress[key]!=='boolean'))throw Error('invalid_save');
    const resultPreferences=progress.resultPreferences===undefined?[25,25,25,25]:progress.resultPreferences;
    for(const values of [progress.preferences,resultPreferences])if(!Array.isArray(values)||values.length!==4||values.some(value=>!Number.isFinite(value)||value<0||value>100))throw Error('invalid_save');
    const resultTotal=resultPreferences.reduce((a,b)=>a+b,0),preferenceTotal=progress.preferences.reduce((a,b)=>a+b,0);
    if(!resultTotal||progress.hasEfficacy&&(!progress.hasRun||progress.dirty)||!progress.dirty&&!preferenceTotal||progress.hasRun&&!progress.dirty&&progress.preferences.some((value,i)=>Math.abs(value/preferenceTotal-resultPreferences[i]/resultTotal)>1e-9))throw Error('invalid_save');
    const extras={};
    if(envelope.evidenceSelections!==undefined){
      if(!Array.isArray(envelope.evidenceSelections)||envelope.evidenceSelections.length>24)throw Error('invalid_save');
      extras.evidenceSelections=envelope.evidenceSelections.map(ref=>{if(!view)throw Error('invalid_save');return evidence.resolveReference(view,ref);});
    }
    if(envelope.chat!==undefined){
      const chat=envelope.chat;
      if(!chat||chat.schema!==1||!Array.isArray(chat.messages)||chat.messages.length>40||!Array.isArray(chat.attachments)||chat.attachments.length>8||typeof chat.input!=='string'||chat.input.length>600||JSON.stringify(chat).length>300000)throw Error('invalid_save');
      if(chat.messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.summary!=='string'||m.summary.length>7000||!['zh-CN','en'].includes(m.lang)))throw Error('invalid_save');
      if(chat.attachments.some(ref=>!ref||typeof ref.id!=='string'||typeof ref.snapshotId!=='string'))throw Error('invalid_save');
      extras.chat=JSON.parse(JSON.stringify(chat));
    }
    return {...extras,evidenceRefs:[...new Set(refs)],falsifierIf,researchProgress:{hasRun:progress.hasRun,dirty:progress.dirty,hasEfficacy:progress.hasEfficacy,preferences:[...progress.preferences],resultPreferences:[...resultPreferences]}};
  }
  function create({client,config,engine,fetchImpl,recoveryClientFactory}){
    let saveEngine;
    function restore(raw){
      if(!saveEngine){
        const source=engine||root.FactorLabSimulation;
        saveEngine=source?.createSecuritiesEngine?source.createSecuritiesEngine():source?.createResearchStudioEngine?source.createResearchStudioEngine():source;
      }
      return saveEngine.restore(raw);
    }
    const error=(status,code)=>Object.assign(new Error(code),{status,code});
    let identity,epoch=0,recovery=null;const listeners=new Set();
    client.auth.onAuthStateChange((_event,session)=>{
      const id=session?.user?.id||null;
      if(identity!==id){identity=id;epoch++;setTimeout(()=>listeners.forEach(fn=>fn()),0);}
    });
    async function session(required=false){
      const {data,error:failure}=await client.auth.getSession();
      if(failure)throw error(401,'login_required');
      const value=data.session;
      if(required&&!value?.user)throw error(401,'login_required');
      if(identity===undefined)identity=value?.user?.id||null;
      return {value,epoch};
    }
    const guard=snapshot=>{if(snapshot.epoch!==epoch||(snapshot.value?.user?.id||null)!==identity)throw error(401,'session_changed');};
    const userView=user=>({enabled:true,user:user?{id:user.id,username:user.email||'Researcher'}:null,csrfToken:''});
    const authResult=result=>{if(result.error)throw error(result.error.status||503,result.error.code||'auth_unavailable');return result.data;};
    async function clearRecovery(){
      const previous=recovery;recovery=null;
      if(previous)try{await previous.client.auth.signOut({scope:'local'});}catch{}
    }
    async function selfService(path,body){
      if(config.selfService!==true)throw error(403,'registration_unavailable');
      if(path==='/api/auth/cancel'){await clearRecovery();return {ok:true};}
      const snapshot=await session();
      if(snapshot.value?.user){await clearRecovery();throw error(401,'session_changed');}
      const email=String(body.email||body.username||'').trim().toLowerCase();
      if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw error(422,'invalid_email');
      if(['/api/register','/api/auth/reset'].includes(path)&&(typeof body.password!=='string'||body.password.length<10||body.password.length>128))throw error(422,'weak_password');
      if(['/api/auth/verify','/api/auth/reset'].includes(path)&&!/^\d{6,10}$/.test(body.token||''))throw error(422,'invalid_otp');
      if(path==='/api/register'){
        const data=authResult(await client.auth.signUp({email,password:body.password}));
        if(data.session){await client.auth.signOut({scope:'local'});throw error(503,'email_confirmation_required');}
        guard(snapshot);return {verificationRequired:true};
      }
      if(path==='/api/auth/resend'){
        authResult(await client.auth.resend({type:'signup',email}));guard(snapshot);return {ok:true};
      }
      if(path==='/api/auth/verify'){
        const data=authResult(await client.auth.verifyOtp({email,token:body.token,type:'email'}));
        if(!data.session||!data.user)throw error(401,'otp_expired');
        return userView(data.user);
      }
      if(path==='/api/auth/recover'){
        await clearRecovery();authResult(await client.auth.resetPasswordForEmail(email));guard(snapshot);return {ok:true};
      }
      if(path==='/api/auth/reset'){
        if(recovery&&(recovery.email!==email||recovery.until<Date.now()))await clearRecovery();
        if(!recovery){
          if(!recoveryClientFactory)throw error(503,'auth_unavailable');
          const temporary=recoveryClientFactory();
          const data=authResult(await temporary.auth.verifyOtp({email,token:body.token,type:'recovery'}));
          if(!data.session||data.user?.email?.toLowerCase()!==email)throw error(401,'otp_expired');
          recovery={client:temporary,email,snapshot,until:Date.now()+300000};
        }
        try{guard(recovery.snapshot);}catch(failure){await clearRecovery();throw failure;}
        authResult(await recovery.client.auth.updateUser({password:body.password}));
        await clearRecovery();return {ok:true};
      }
      throw error(404,'not_found');
    }
    async function query(builder,snapshot){
      const result=await withTimeout(signal=>builder.abortSignal(signal));guard(snapshot);
      if(result.error){const code=result.error.code;throw error(code==='23505'?409:code==='42501'?403:code==='PGRST301'?401:422,code||'save_failed');}
      return result.data;
    }
    function validateEnvelope(envelope){
      try{if(envelope?.version!=='factorlab-ui-v3'||new TextEncoder().encode(JSON.stringify(envelope)).length>480000)throw Error();const state=restore(envelope.game);return {...envelope,...normalizeStudioFields(envelope,state)};}catch{throw error(422,'invalid_save');}
    }
    function metadata(row){
      let day='—',round='—',scenario='baseline';
      try{const s=restore(row.envelope?.game);day=s.day;round=s.round;scenario=s.scenario;}catch{}
      return {id:row.id,name:row.name,revision:row.revision,updatedAt:row.updated_at,day,round,scenario};
    }
    let primedSession;
    async function verifySession(){
      const snapshot=await session();
      guard(snapshot);
      if(!snapshot.value)return {view:userView(null),epoch:snapshot.epoch};
      const {data,error:failure}=await client.auth.getUser();
      guard(snapshot);
      if(failure)throw error(failure.status===401||failure.status===403?401:503,'session_unavailable');
      if(data.user?.id!==snapshot.value.user?.id)throw error(401,'session_changed');
      return {view:userView(data.user),epoch:snapshot.epoch};
    }
    function primeSession(){
      if(!primedSession)primedSession=verifySession().then(result=>({result}),failure=>({failure}));
    }
    async function request(path,options={}){
      const method=options.method||'GET',body=options.body?JSON.parse(options.body):{};
      if(path==='/api/register'||path.startsWith('/api/auth/'))return selfService(path,body);
      if(path==='/api/login'){
        const {data,error:failure}=await client.auth.signInWithPassword({email:body.username,password:body.password});
        if(failure)throw error(failure.status===429?429:401,failure.code||'invalid_credentials');
        return userView(data.user);
      }
      if(path==='/api/logout'){
        const {error:failure}=await client.auth.signOut({scope:'local'});if(failure)throw error(503,'logout_failed');return {ok:true};
      }
      if(path==='/api/session'){
        const prepared=primedSession;
        primedSession=undefined;
        if(prepared){
          const {result,failure}=await prepared;
          if(result?.epoch===epoch)return result.view;
          if(failure&&failure.code!=='session_changed')throw failure;
        }
        return (await verifySession()).view;
      }
      const s=await session(true),uid=s.value.user.id;
      const base=()=>client.from('factorlab_saves');
      if(path==='/api/saves'&&method==='GET'){
        const rows=await query(base().select('id,name,revision,updated_at,envelope,slot').eq('user_id',uid).order('slot').limit(12),s);
        return {saves:rows.map(metadata)};
      }
      if((path==='/api/saves'&&method==='POST')||(path.startsWith('/api/saves/')&&method==='PUT')){
        if(typeof body.name!=='string'||!body.name.trim()||body.name.trim().length>60)throw error(422,'invalid_name');
        body.envelope=validateEnvelope(body.envelope);
        if(method==='POST'){
          const rows=await query(base().select('slot').eq('user_id',uid).limit(12),s),used=new Set(rows.map(r=>r.slot));
          const slot=Array.from({length:12},(_,i)=>i+1).find(n=>!used.has(n));
          if(!slot)throw error(409,'save_limit');
          const inserted=await query(base().insert({slot,name:body.name.trim(),envelope:body.envelope}).select('id,name,revision,updated_at,envelope'),s);
          if(inserted.length!==1)throw error(422,'save_failed');return {save:metadata(inserted[0])};
        }
        if(!Number.isInteger(body.revision)||body.revision<1)throw error(422,'invalid_revision');
        const rows=await query(base().update({name:body.name.trim(),envelope:body.envelope}).eq('user_id',uid).eq('id',decodeURIComponent(path.slice(11))).eq('revision',body.revision).select('id,name,revision,updated_at,envelope'),s);
        if(rows.length!==1)throw error(409,'revision_conflict');return {save:metadata(rows[0])};
      }
      if(path.startsWith('/api/saves/')&&method==='GET'){
        const rows=await query(base().select('id,name,revision,updated_at,envelope').eq('user_id',uid).eq('id',decodeURIComponent(path.slice(11))).limit(1),s);
        if(rows.length!==1)throw error(404,'save_not_found');const envelope=validateEnvelope(rows[0].envelope);return {save:{...metadata(rows[0]),envelope}};
      }
      throw error(404,'not_found');
    }
    async function coach(body,signal){
      const s=await session(true);if(!s.value.user.email_confirmed_at)throw error(403,'verified_email_required');
      const response=await fetchImpl(config.url+'/functions/v1/'+config.functionName,{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+s.value.access_token,'Content-Type':'application/json'},body:JSON.stringify(body),signal});
      const value=await response.json();guard(s);if(!response.ok)throw error(response.status,value.error||'connection_failed');return value;
    }
    async function coachStream(body,signal,onEvent){
      const s=await session(true);if(!s.value.user.email_confirmed_at)throw error(403,'verified_email_required');
      const send=()=>{
        if(signal?.aborted)throw signal.reason??new DOMException('Request aborted','AbortError');
        return fetchImpl(config.url+'/functions/v1/'+config.functionName,{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+s.value.access_token,'Content-Type':'application/json'},body:JSON.stringify({...body,stream:true}),signal});
      };
      let response=await send();
      const retryAfter=Number(response.headers.get('retry-after'));
      if(!body.proactive&&response.status===429&&Number.isInteger(retryAfter)&&retryAfter>=1&&retryAfter<=10){
        void response.body?.cancel().catch(()=>{});
        guard(s);
        onEvent?.('cooldown',{seconds:retryAfter});
        await new Promise(resolve=>{
          if(signal?.aborted){resolve();return;}
          function finish(){clearTimeout(timer);signal?.removeEventListener('abort',finish);resolve();}
          const timer=setTimeout(finish,retryAfter*1000+100);
          signal?.addEventListener('abort',finish,{once:true});
        });
        if(signal?.aborted)throw signal.reason??new DOMException('Request aborted','AbortError');
        guard(s);
        onEvent?.('retry',{});
        response=await send();
      }
      const parser=root.FactorLabCoachStream||(typeof require==='function'?require('./coach-stream.js'):null);
      const result=await parser.consume(response,(type,value)=>{guard(s);onEvent?.(type,value);},signal);guard(s);return result;
    }
    let support,checkedAt=0;
    function supportsActivity(){
      if(!support||Date.now()-checkedAt>60000){
        checkedAt=Date.now();
        support=withTimeout(signal=>fetchImpl(config.url+'/functions/v1/'+config.functionName,{method:'OPTIONS',signal}))
          .then(response=>response.ok&&response.headers.get('x-factorlab-coach')==='action-context-v1')
          .catch(()=>false);
      }
      return support;
    }
    return {request,coach,coachStream,supportsActivity,primeSession,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={create,normalizeStudioFields};return;}
  if(!root.FactorLabCloudConfig||!root.supabase?.createClient)return;
  const config=root.FactorLabCloudConfig;
  const client=root.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'factorlab-supabase-session-v1'},global:{fetch:sdkFetch}});
  root.FactorLabCloud=create({client,config,fetchImpl:fetch,recoveryClientFactory:()=>root.supabase.createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'factorlab-recovery-memory'},global:{fetch:sdkFetch}})});
  if(root.document.getElementById('auth-loading'))root.FactorLabCloud.primeSession();
})(typeof window==='undefined'?globalThis:window);

;
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).i18next=t()}(this,function(){"use strict";const e=e=>"string"==typeof e,t=()=>{let e,t;const s=new Promise((s,i)=>{e=s,t=i});return s.resolve=e,s.reject=t,s},s=e=>null==e?"":String(e),i=/###/g,o=e=>e&&e.includes("###")?e.replace(i,"."):e,n=t=>!t||e(t),r=(t,s,i)=>{const r=e(s)?s.split("."):s;let a=0;for(;a<r.length-1;){if(n(t))return{};const e=o(r[a]);!t[e]&&i&&(t[e]=new i),t=Object.prototype.hasOwnProperty.call(t,e)?t[e]:{},++a}return n(t)?{}:{obj:t,k:o(r[a])}},a=(e,t,s)=>{const{obj:i,k:o}=r(e,t,Object);if(void 0!==i||1===t.length)return void(i[o]=s);let n=t[t.length-1],a=t.slice(0,t.length-1),l=r(e,a,Object);for(;void 0===l.obj&&a.length;)n=`${a[a.length-1]}.${n}`,a=a.slice(0,a.length-1),l=r(e,a,Object),l?.obj&&void 0!==l.obj[`${l.k}.${n}`]&&(l.obj=void 0);l.obj[`${l.k}.${n}`]=s},l=(e,t)=>{const{obj:s,k:i}=r(e,t);if(s&&Object.prototype.hasOwnProperty.call(s,i))return s[i]},c=(t,s,i)=>{for(const o in s)"__proto__"!==o&&"constructor"!==o&&(o in t?e(t[o])||t[o]instanceof String||e(s[o])||s[o]instanceof String?i&&(t[o]=s[o]):c(t[o],s[o],i):t[o]=s[o]);return t},h=e=>e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&"),u={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"},p=t=>e(t)?t.replace(/[&<>"'\/]/g,e=>u[e]):t;const g=[" ",",","?","!",";"],d=new class{constructor(e){this.capacity=e,this.regExpMap=new Map,this.regExpQueue=[]}getRegExp(e){const t=this.regExpMap.get(e);if(void 0!==t)return t;const s=new RegExp(e);return this.regExpQueue.length===this.capacity&&this.regExpMap.delete(this.regExpQueue.shift()),this.regExpMap.set(e,s),this.regExpQueue.push(e),s}}(20),f=(e,t,s=".")=>{if(!e)return;if(e[t]){if(!Object.prototype.hasOwnProperty.call(e,t))return;return e[t]}const i=t.split(s);let o=e;for(let e=0;e<i.length;){if(!o||"object"!=typeof o)return;let t,n="";for(let r=e;r<i.length;++r)if(r!==e&&(n+=s),n+=i[r],t=o[n],void 0!==t){if(["string","number","boolean"].includes(typeof t)&&r<i.length-1)continue;e+=r-e+1;break}o=t}return o},m=e=>e?.replace(/_/g,"-"),y={type:"logger",log(e){this.output("log",e)},warn(e){this.output("warn",e)},error(e){this.output("error",e)},output(e,t){console?.[e]?.apply?.(console,t)}};class v{constructor(e,t={}){this.init(e,t)}init(e,t={}){this.prefix=t.prefix||"i18next:",this.logger=e||y,this.options=t,this.debug=t.debug}log(...e){return this.forward(e,"log","",!0)}warn(...e){return this.forward(e,"warn","",!0)}error(...e){return this.forward(e,"error","")}deprecate(...e){return this.forward(e,"warn","WARNING DEPRECATED: ",!0)}forward(t,s,i,o){return o&&!this.debug?null:(e(t[0])&&(t[0]=`${i}${this.prefix} ${t[0]}`),this.logger[s](t))}create(e){return new v(this.logger,{prefix:`${this.prefix}:${e}:`,...this.options})}clone(e){return(e=e||this.options).prefix=e.prefix||this.prefix,new v(this.logger,e)}}var b=new v;class x{constructor(){this.observers={}}on(e,t){return e.split(" ").forEach(e=>{this.observers[e]||(this.observers[e]=new Map);const s=this.observers[e].get(t)||0;this.observers[e].set(t,s+1)}),this}off(e,t){this.observers[e]&&(t?this.observers[e].delete(t):delete this.observers[e])}once(e,t){const s=(...i)=>{t(...i),this.off(e,s)};return this.on(e,s),this}emit(e,...t){if(this.observers[e]){Array.from(this.observers[e].entries()).forEach(([e,s])=>{for(let i=0;i<s;i++)e(...t)})}if(this.observers["*"]){Array.from(this.observers["*"].entries()).forEach(([s,i])=>{for(let o=0;o<i;o++)s(e,...t)})}}}class k extends x{constructor(e,t={ns:["translation"],defaultNS:"translation"}){super(),this.data=e||{},this.options=t,void 0===this.options.keySeparator&&(this.options.keySeparator="."),void 0===this.options.ignoreJSONStructure&&(this.options.ignoreJSONStructure=!0)}addNamespaces(e){this.options.ns.includes(e)||this.options.ns.push(e)}removeNamespaces(e){const t=this.options.ns.indexOf(e);t>-1&&this.options.ns.splice(t,1)}getResource(t,s,i,o={}){const n=void 0!==o.keySeparator?o.keySeparator:this.options.keySeparator,r=void 0!==o.ignoreJSONStructure?o.ignoreJSONStructure:this.options.ignoreJSONStructure;let a;t.includes(".")?a=t.split("."):(a=[t,s],i&&(Array.isArray(i)?a.push(...i):e(i)&&n?a.push(...i.split(n)):a.push(i)));const c=l(this.data,a);return c||s||i||!t.includes(".")||(t=a[0],s=a[1],i=a.slice(2).join(".")),!c&&r&&e(i)?f(this.data?.[t]?.[s],i,n):c}addResource(e,t,s,i,o={silent:!1}){const n=void 0!==o.keySeparator?o.keySeparator:this.options.keySeparator;let r=[e,t];s&&(r=r.concat(n?s.split(n):s)),e.includes(".")&&(r=e.split("."),i=t,t=r[1]),this.addNamespaces(t),a(this.data,r,i),o.silent||this.emit("added",e,t,s,i)}addResources(t,s,i,o={silent:!1}){for(const o in i)(e(i[o])||Array.isArray(i[o]))&&this.addResource(t,s,o,i[o],{silent:!0});o.silent||this.emit("added",t,s,i)}addResourceBundle(e,t,s,i,o,n={silent:!1,skipCopy:!1}){let r=[e,t];e.includes(".")&&(r=e.split("."),i=s,s=t,t=r[1]),this.addNamespaces(t);let h=l(this.data,r)||{};n.skipCopy||(s=JSON.parse(JSON.stringify(s))),i?c(h,s,o):h={...h,...s},a(this.data,r,h),n.silent||this.emit("added",e,t,s)}removeResourceBundle(e,t){this.hasResourceBundle(e,t)&&delete this.data[e][t],this.removeNamespaces(t),this.emit("removed",e,t)}hasResourceBundle(e,t){return void 0!==this.getResource(e,t)}getResourceBundle(e,t){return t||(t=this.options.defaultNS),this.getResource(e,t)}getDataByLanguage(e){return this.data[e]}hasLanguageSomeTranslations(e){const t=this.getDataByLanguage(e);return!!(t&&Object.keys(t)||[]).find(e=>t[e]&&Object.keys(t[e]).length>0)}toJSON(){return this.data}}var S={processors:{},addPostProcessor(e){this.processors[e.name]=e},handle(e,t,s,i,o){return e.forEach(e=>{t=this.processors[e]?.process(t,s,i,o)??t}),t}};const L=Symbol("i18next/PATH_KEY");function w(e,t){const{[L]:s}=e(function(){const e=[],t=Object.create(null);let s;return t.get=(i,o)=>(s?.revoke?.(),o===L?e:(e.push(o),s=Proxy.revocable(i,t),s.proxy)),Proxy.revocable(Object.create(null),t).proxy}()),i=t?.keySeparator??".",o=t?.nsSeparator??":";if(s.length>1&&o){const e=t?.ns,n=Array.isArray(e)?e:null;if(n&&n.length>1&&n.slice(1).includes(s[0]))return`${s[0]}${o}${s.slice(1).join(i)}`}return s.join(i)}const $=t=>!e(t)&&"boolean"!=typeof t&&"number"!=typeof t;class O extends x{constructor(e,t={}){var s,i;super(),s=e,i=this,["resourceStore","languageUtils","pluralResolver","interpolator","backendConnector","i18nFormat","utils"].forEach(e=>{s[e]&&(i[e]=s[e])}),this.options=t,void 0===this.options.keySeparator&&(this.options.keySeparator="."),this.logger=b.create("translator"),this.checkedLoadedFor={}}changeLanguage(e){e&&(this.language=e)}exists(e,t={interpolation:{}}){const s={...t};if(null==e)return!1;const i=this.resolve(e,s);if(void 0===i?.res)return!1;const o=$(i.res);return!1!==s.returnObjects||!o}extractFromKey(t,s){let i=void 0!==s.nsSeparator?s.nsSeparator:this.options.nsSeparator;void 0===i&&(i=":");const o=void 0!==s.keySeparator?s.keySeparator:this.options.keySeparator;let n=s.ns||this.options.defaultNS||[];const r=i&&t.includes(i),a=!(this.options.userDefinedKeySeparator||s.keySeparator||this.options.userDefinedNsSeparator||s.nsSeparator||((e,t,s)=>{t=t||"",s=s||"";const i=g.filter(e=>!t.includes(e)&&!s.includes(e));if(0===i.length)return!0;const o=d.getRegExp(`(${i.map(e=>"?"===e?"\\?":e).join("|")})`);let n=!o.test(e);if(!n){const t=e.indexOf(s);t>0&&!o.test(e.substring(0,t))&&(n=!0)}return n})(t,i,o));if(r&&!a){const s=t.match(this.interpolator.nestingRegexp);if(s&&s.length>0)return{key:t,namespaces:e(n)?[n]:n};const r=t.split(i);(i!==o||i===o&&this.options.ns.includes(r[0]))&&(n=r.shift()),t=r.join(o)}return{key:t,namespaces:e(n)?[n]:n}}translate(t,s,i){let o="object"==typeof s?{...s}:s;if("object"!=typeof o&&this.options.overloadTranslationOptionHandler&&(o=this.options.overloadTranslationOptionHandler(arguments)),"object"==typeof o&&(o={...o}),o||(o={}),null==t)return"";"function"==typeof t&&(t=w(t,{...this.options,...o})),Array.isArray(t)||(t=[String(t)]),t=t.map(e=>"function"==typeof e?w(e,{...this.options,...o}):String(e));const n=void 0!==o.returnDetails?o.returnDetails:this.options.returnDetails,r=void 0!==o.keySeparator?o.keySeparator:this.options.keySeparator,{key:a,namespaces:l}=this.extractFromKey(t[t.length-1],o),c=l[l.length-1];let h=void 0!==o.nsSeparator?o.nsSeparator:this.options.nsSeparator;void 0===h&&(h=":");const u=o.lng||this.language,p=o.appendNamespaceToCIMode||this.options.appendNamespaceToCIMode;if("cimode"===u?.toLowerCase())return p?n?{res:`${c}${h}${a}`,usedKey:a,exactUsedKey:a,usedLng:u,usedNS:c,usedParams:this.getUsedParamsDetails(o)}:`${c}${h}${a}`:n?{res:a,usedKey:a,exactUsedKey:a,usedLng:u,usedNS:c,usedParams:this.getUsedParamsDetails(o)}:a;const g=this.resolve(t,o);let d=g?.res;const f=g?.usedKey||a,m=g?.exactUsedKey||a,y=void 0!==o.joinArrays?o.joinArrays:this.options.joinArrays,v=!this.i18nFormat||this.i18nFormat.handleAsObject,b=void 0!==o.count&&!e(o.count),x=O.hasDefaultValue(o),k=b?this.pluralResolver.getSuffix(u,o.count,o):"",S=o.ordinal&&b?this.pluralResolver.getSuffix(u,o.count,{ordinal:!1}):"",L=b&&!o.ordinal&&0===o.count,R=L&&o[`defaultValue${this.options.pluralSeparator}zero`]||o[`defaultValue${k}`]||o[`defaultValue${S}`]||o.defaultValue;let C=d;v&&!d&&x&&(C=R);const P=$(C),j=Object.prototype.toString.apply(C);if(!(v&&C&&P)||["[object Number]","[object Function]","[object RegExp]"].includes(j)||e(y)&&Array.isArray(C))if(v&&e(y)&&Array.isArray(d))d=d.join(y),d&&(d=this.extendTranslation(d,t,o,i));else{let e=!1,s=!1;!this.isValidLookup(d)&&x&&(e=!0,d=R),this.isValidLookup(d)||(s=!0,d=a);const n=(o.missingKeyNoValueFallbackToKey||this.options.missingKeyNoValueFallbackToKey)&&s?void 0:d,l=x&&R!==d&&this.options.updateMissing;if(s||e||l){if(this.logger.log(l?"updateKey":"missingKey",u,c,a,l?R:d),r){const e=this.resolve(a,{...o,keySeparator:!1});e&&e.res&&this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.")}let e=[];const t=this.languageUtils.getFallbackCodes(this.options.fallbackLng,o.lng||this.language);if("fallback"===this.options.saveMissingTo&&t&&t[0])for(let s=0;s<t.length;s++)e.push(t[s]);else"all"===this.options.saveMissingTo?e=this.languageUtils.toResolveHierarchy(o.lng||this.language):e.push(o.lng||this.language);const s=(e,t,s)=>{const i=x&&s!==d?s:n;this.options.missingKeyHandler?this.options.missingKeyHandler(e,c,t,i,l,o):this.backendConnector?.saveMissing&&this.backendConnector.saveMissing(e,c,t,i,l,o),this.emit("missingKey",e,c,t,d)};this.options.saveMissing&&(this.options.saveMissingPlurals&&b?e.forEach(e=>{const t=this.pluralResolver.getSuffixes(e,o);L&&o[`defaultValue${this.options.pluralSeparator}zero`]&&!t.includes(`${this.options.pluralSeparator}zero`)&&t.push(`${this.options.pluralSeparator}zero`),t.forEach(t=>{s([e],a+t,o[`defaultValue${t}`]||R)})}):s(e,a,R))}d=this.extendTranslation(d,t,o,g,i),s&&d===a&&this.options.appendNamespaceToMissingKey&&(d=`${c}${h}${a}`),(s||e)&&this.options.parseMissingKeyHandler&&(d=this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey?`${c}${h}${a}`:a,e?d:void 0,o))}else{if(!o.returnObjects&&!this.options.returnObjects){this.options.returnedObjectHandler||this.logger.warn("accessing an object - but returnObjects options is not enabled!");const e=this.options.returnedObjectHandler?this.options.returnedObjectHandler(f,C,{...o,ns:l}):`key '${a} (${this.language})' returned an object instead of string.`;return n?(g.res=e,g.usedParams=this.getUsedParamsDetails(o),g):e}if(r){const e=Array.isArray(C),t=e?[]:{},s=e?m:f;for(const e in C)if(Object.prototype.hasOwnProperty.call(C,e)){const i=`${s}${r}${e}`;t[e]=x&&!d?this.translate(i,{...o,defaultValue:$(R)?R[e]:void 0,joinArrays:!1,ns:l}):this.translate(i,{...o,joinArrays:!1,ns:l}),t[e]===i&&(t[e]=C[e])}d=t}}return n?(g.res=d,g.usedParams=this.getUsedParamsDetails(o),g):d}extendTranslation(t,s,i,o,n){if(this.i18nFormat?.parse)t=this.i18nFormat.parse(t,{...this.options.interpolation.defaultVariables,...i},i.lng||this.language||o.usedLng,o.usedNS,o.usedKey,{resolved:o});else if(!i.skipInterpolation){i.interpolation&&this.interpolator.init({...i,interpolation:{...this.options.interpolation,...i.interpolation}});const r=e(t)&&(void 0!==i?.interpolation?.skipOnVariables?i.interpolation.skipOnVariables:this.options.interpolation.skipOnVariables);let a;if(r){const e=t.match(this.interpolator.nestingRegexp);a=e&&e.length}let l=i.replace&&!e(i.replace)?i.replace:i;if(this.options.interpolation.defaultVariables&&(l={...this.options.interpolation.defaultVariables,...l}),t=this.interpolator.interpolate(t,l,i.lng||this.language||o.usedLng,i),r){const e=t.match(this.interpolator.nestingRegexp);a<(e&&e.length)&&(i.nest=!1)}!i.lng&&o&&o.res&&(i.lng=this.language||o.usedLng),!1!==i.nest&&(t=this.interpolator.nest(t,(...e)=>n?.[0]!==e[0]||i.context?this.translate(...e,s):(this.logger.warn(`It seems you are nesting recursively key: ${e[0]} in key: ${s[0]}`),null),i)),i.interpolation&&this.interpolator.reset()}const r=i.postProcess||this.options.postProcess,a=e(r)?[r]:r;return null!=t&&a?.length&&!1!==i.applyPostProcessor&&(t=S.handle(a,t,s,this.options&&this.options.postProcessPassResolved?{i18nResolved:{...o,usedParams:this.getUsedParamsDetails(i)},...i}:i,this)),t}resolve(t,s={}){let i,o,n,r,a;return e(t)&&(t=[t]),Array.isArray(t)&&(t=t.map(e=>"function"==typeof e?w(e,{...this.options,...s}):e)),t.forEach(t=>{if(this.isValidLookup(i))return;const l=this.extractFromKey(t,s),c=l.key;o=c;let h=l.namespaces;this.options.fallbackNS&&(h=h.concat(this.options.fallbackNS));const u=void 0!==s.count&&!e(s.count),p=u&&!s.ordinal&&0===s.count,g=void 0!==s.context&&(e(s.context)||"number"==typeof s.context)&&""!==s.context,d=s.lngs?s.lngs:this.languageUtils.toResolveHierarchy(s.lng||this.language,s.fallbackLng);h.forEach(e=>{this.isValidLookup(i)||(a=e,this.checkedLoadedFor[`${d[0]}-${e}`]||!this.utils?.hasLoadedNamespace||this.utils?.hasLoadedNamespace(a)||(this.checkedLoadedFor[`${d[0]}-${e}`]=!0,this.logger.warn(`key "${o}" for languages "${d.join(", ")}" won't get resolved as namespace "${a}" was not yet loaded`,"This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!")),d.forEach(t=>{if(this.isValidLookup(i))return;r=t;const o=[c];if(this.i18nFormat?.addLookupKeys)this.i18nFormat.addLookupKeys(o,c,t,e,s);else{let e;u&&(e=this.pluralResolver.getSuffix(t,s.count,s));const i=`${this.options.pluralSeparator}zero`,n=`${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;if(u&&(s.ordinal&&e.startsWith(n)&&o.push(c+e.replace(n,this.options.pluralSeparator)),o.push(c+e),p&&o.push(c+i)),g){const t=`${c}${this.options.contextSeparator||"_"}${s.context}`;o.push(t),u&&(s.ordinal&&e.startsWith(n)&&o.push(t+e.replace(n,this.options.pluralSeparator)),o.push(t+e),p&&o.push(t+i))}}let a;for(;a=o.pop();)this.isValidLookup(i)||(n=a,i=this.getResource(t,e,a,s))}))})}),{res:i,usedKey:o,exactUsedKey:n,usedLng:r,usedNS:a}}isValidLookup(e){return!(void 0===e||!this.options.returnNull&&null===e||!this.options.returnEmptyString&&""===e)}getResource(e,t,s,i={}){return this.i18nFormat?.getResource?this.i18nFormat.getResource(e,t,s,i):this.resourceStore.getResource(e,t,s,i)}getUsedParamsDetails(t={}){const s=["defaultValue","ordinal","context","replace","lng","lngs","fallbackLng","ns","keySeparator","nsSeparator","returnObjects","returnDetails","joinArrays","postProcess","interpolation"],i=t.replace&&!e(t.replace);let o=i?t.replace:t;if(i&&void 0!==t.count&&(o.count=t.count),this.options.interpolation.defaultVariables&&(o={...this.options.interpolation.defaultVariables,...o}),!i){o={...o};for(const e of s)delete o[e]}return o}static hasDefaultValue(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t)&&t.startsWith("defaultValue")&&void 0!==e[t])return!0;return!1}}class R{constructor(e){this.options=e,this.supportedLngs=this.options.supportedLngs||!1,this.logger=b.create("languageUtils")}getScriptPartFromCode(e){if(!(e=m(e))||!e.includes("-"))return null;const t=e.split("-");return 2===t.length?null:(t.pop(),"x"===t[t.length-1].toLowerCase()?null:this.formatLanguageCode(t.join("-")))}getLanguagePartFromCode(e){if(!(e=m(e))||!e.includes("-"))return e;const t=e.split("-");return this.formatLanguageCode(t[0])}formatLanguageCode(t){if(e(t)&&t.includes("-")){let e;try{e=Intl.getCanonicalLocales(t)[0]}catch(e){}return e&&this.options.lowerCaseLng&&(e=e.toLowerCase()),e||(this.options.lowerCaseLng?t.toLowerCase():t)}return this.options.cleanCode||this.options.lowerCaseLng?t.toLowerCase():t}isSupportedCode(e){return("languageOnly"===this.options.load||this.options.nonExplicitSupportedLngs)&&(e=this.getLanguagePartFromCode(e)),!this.supportedLngs||!this.supportedLngs.length||this.supportedLngs.includes(e)}getBestMatchFromCodes(e){if(!e)return null;let t;return e.forEach(e=>{if(t)return;const s=this.formatLanguageCode(e);this.options.supportedLngs&&!this.isSupportedCode(s)||(t=s)}),!t&&this.options.supportedLngs&&e.forEach(e=>{if(t)return;const s=this.getScriptPartFromCode(e);if(this.isSupportedCode(s))return t=s;const i=this.getLanguagePartFromCode(e);if(this.isSupportedCode(i))return t=i;t=this.options.supportedLngs.find(e=>e===i||!(!e.includes("-")&&!i.includes("-"))&&(!(!e.includes("-")||i.includes("-")||e.slice(0,e.indexOf("-"))!==i)||!!(e.startsWith(i)&&i.length>1)))}),t||(t=this.getFallbackCodes(this.options.fallbackLng)[0]),t}getFallbackCodes(t,s){if(!t)return[];if("function"==typeof t&&(t=t(s)),e(t)&&(t=[t]),Array.isArray(t))return t;if(!s)return t.default||[];let i=t[s];return i||(i=t[this.getScriptPartFromCode(s)]),i||(i=t[this.formatLanguageCode(s)]),i||(i=t[this.getLanguagePartFromCode(s)]),i||(i=t.default),i||[]}toResolveHierarchy(t,s){const i=this.getFallbackCodes((!1===s?[]:s)||this.options.fallbackLng||[],t),o=[],n=e=>{e&&(this.isSupportedCode(e)?o.push(e):this.logger.warn(`rejecting language code not found in supportedLngs: ${e}`))};return e(t)&&(t.includes("-")||t.includes("_"))?("languageOnly"!==this.options.load&&n(this.formatLanguageCode(t)),"languageOnly"!==this.options.load&&"currentOnly"!==this.options.load&&n(this.getScriptPartFromCode(t)),"currentOnly"!==this.options.load&&n(this.getLanguagePartFromCode(t))):e(t)&&n(this.formatLanguageCode(t)),i.forEach(e=>{o.includes(e)||n(this.formatLanguageCode(e))}),o}}const C={zero:0,one:1,two:2,few:3,many:4,other:5},P={select:e=>1===e?"one":"other",resolvedOptions:()=>({pluralCategories:["one","other"]})};class j{constructor(e,t={}){this.languageUtils=e,this.options=t,this.logger=b.create("pluralResolver"),this.pluralRulesCache={}}clearCache(){this.pluralRulesCache={}}getRule(e,t={}){const s=m("dev"===e?"en":e),i=t.ordinal?"ordinal":"cardinal",o=JSON.stringify({cleanedCode:s,type:i});if(o in this.pluralRulesCache)return this.pluralRulesCache[o];let n;try{n=new Intl.PluralRules(s,{type:i})}catch(s){if("undefined"==typeof Intl)return this.logger.error("No Intl support, please use an Intl polyfill!"),P;if(!e.match(/-|_/))return P;const i=this.languageUtils.getLanguagePartFromCode(e);n=this.getRule(i,t)}return this.pluralRulesCache[o]=n,n}needsPlural(e,t={}){let s=this.getRule(e,t);return s||(s=this.getRule("dev",t)),s?.resolvedOptions().pluralCategories.length>1}getPluralFormsOfKey(e,t,s={}){return this.getSuffixes(e,s).map(e=>`${t}${e}`)}getSuffixes(e,t={}){let s=this.getRule(e,t);return s||(s=this.getRule("dev",t)),s?s.resolvedOptions().pluralCategories.sort((e,t)=>C[e]-C[t]).map(e=>`${this.options.prepend}${t.ordinal?`ordinal${this.options.prepend}`:""}${e}`):[]}getSuffix(e,t,s={}){const i=this.getRule(e,s);return i?`${this.options.prepend}${s.ordinal?`ordinal${this.options.prepend}`:""}${i.select(t)}`:(this.logger.warn(`no plural rule found for: ${e}`),this.getSuffix("dev",t,s))}}const N=(t,s,i,o=".",n=!0)=>{let r=((e,t,s)=>{const i=l(e,s);return void 0!==i?i:l(t,s)})(t,s,i);return!r&&n&&e(i)&&(r=f(t,i,o),void 0===r&&(r=f(s,i,o))),r},E=e=>e.replace(/\$/g,"$$$$");class F{constructor(e={}){this.logger=b.create("interpolator"),this.options=e,this.format=e?.interpolation?.format||(e=>e),this.init(e)}init(e={}){e.interpolation||(e.interpolation={escapeValue:!0});const{escape:t,escapeValue:s,useRawValueToEscape:i,prefix:o,prefixEscaped:n,suffix:r,suffixEscaped:a,formatSeparator:l,unescapeSuffix:c,unescapePrefix:u,nestingPrefix:g,nestingPrefixEscaped:d,nestingSuffix:f,nestingSuffixEscaped:m,nestingOptionsSeparator:y,maxReplaces:v,alwaysFormat:b}=e.interpolation;this.escape=void 0!==t?t:p,this.escapeValue=void 0===s||s,this.useRawValueToEscape=void 0!==i&&i,this.prefix=o?h(o):n||"{{",this.suffix=r?h(r):a||"}}",this.formatSeparator=l||",",this.unescapePrefix=c?"":u||"-",this.unescapeSuffix=this.unescapePrefix?"":c||"",this.nestingPrefix=g?h(g):d||h("$t("),this.nestingSuffix=f?h(f):m||h(")"),this.nestingOptionsSeparator=y||",",this.maxReplaces=v||1e3,this.alwaysFormat=void 0!==b&&b,this.resetRegExp()}reset(){this.options&&this.init(this.options)}resetRegExp(){const e=(e,t)=>e?.source===t?(e.lastIndex=0,e):new RegExp(t,"g");this.regexp=e(this.regexp,`${this.prefix}(.+?)${this.suffix}`),this.regexpUnescape=e(this.regexpUnescape,`${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`),this.nestingRegexp=e(this.nestingRegexp,`${this.nestingPrefix}((?:[^()"']+|"[^"]*"|'[^']*'|\\((?:[^()]|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`)}interpolate(t,i,o,n){let r,a,l;const c=this.options&&this.options.interpolation&&this.options.interpolation.defaultVariables||{},h=e=>{if(!e.includes(this.formatSeparator)){const t=N(i,c,e,this.options.keySeparator,this.options.ignoreJSONStructure);return this.alwaysFormat?this.format(t,void 0,o,{...n,...i,interpolationkey:e}):t}const t=e.split(this.formatSeparator),s=t.shift().trim(),r=t.join(this.formatSeparator).trim();return this.format(N(i,c,s,this.options.keySeparator,this.options.ignoreJSONStructure),r,o,{...n,...i,interpolationkey:s})};this.resetRegExp();const u=n?.missingInterpolationHandler||this.options.missingInterpolationHandler,p=void 0!==n?.interpolation?.skipOnVariables?n.interpolation.skipOnVariables:this.options.interpolation.skipOnVariables;return[{regex:this.regexpUnescape,safeValue:e=>E(e)},{regex:this.regexp,safeValue:e=>this.escapeValue?E(this.escape(e)):E(e)}].forEach(i=>{for(l=0;r=i.regex.exec(t);){const o=r[1].trim();if(a=h(o),void 0===a)if("function"==typeof u){const s=u(t,r,n);a=e(s)?s:""}else if(n&&Object.prototype.hasOwnProperty.call(n,o))a="";else{if(p){a=r[0];continue}this.logger.warn(`missed to pass in variable ${o} for interpolating ${t}`),a=""}else e(a)||this.useRawValueToEscape||(a=s(a));const c=i.safeValue(a);if(t=t.replace(r[0],c),p?(i.regex.lastIndex+=a.length,i.regex.lastIndex-=r[0].length):i.regex.lastIndex=0,l++,l>=this.maxReplaces)break}}),t}nest(t,i,o={}){let n,r,a;const l=(e,t)=>{const s=this.nestingOptionsSeparator;if(!e.includes(s))return e;const i=e.split(new RegExp(`${h(s)}[ ]*{`));let o=`{${i[1]}`;e=i[0],o=this.interpolate(o,a);const n=o.match(/'/g),r=o.match(/"/g);((n?.length??0)%2==0&&!r||(r?.length??0)%2!=0)&&(o=o.replace(/'/g,'"'));try{a=JSON.parse(o),t&&(a={...t,...a})}catch(t){return this.logger.warn(`failed parsing options string in nesting for key ${e}`,t),`${e}${s}${o}`}return a.defaultValue&&a.defaultValue.includes(this.prefix)&&delete a.defaultValue,e};for(;n=this.nestingRegexp.exec(t);){let c=[];a={...o},a=a.replace&&!e(a.replace)?a.replace:a,a.applyPostProcessor=!1,delete a.defaultValue;const h=/{.*}/.test(n[1])?n[1].lastIndexOf("}")+1:n[1].indexOf(this.formatSeparator);if(-1!==h&&(c=n[1].slice(h).split(this.formatSeparator).map(e=>e.trim()).filter(Boolean),n[1]=n[1].slice(0,h)),r=i(l.call(this,n[1].trim(),a),a),r&&n[0]===t&&!e(r))return r;e(r)||(r=s(r)),r||(this.logger.warn(`missed to resolve ${n[1]} for nesting ${t}`),r=""),c.length&&(r=c.reduce((e,t)=>this.format(e,t,o.lng,{...o,interpolationkey:n[1].trim()}),r.trim())),t=t.replace(n[0],r),this.regexp.lastIndex=0}return t}}const T=e=>{const t={};return(s,i,o)=>{let n=o;o&&o.interpolationkey&&o.formatParams&&o.formatParams[o.interpolationkey]&&o[o.interpolationkey]&&(n={...n,[o.interpolationkey]:void 0});const r=i+JSON.stringify(n);let a=t[r];return a||(a=e(m(i),o),t[r]=a),a(s)}},V=e=>(t,s,i)=>e(m(s),i)(t);class I{constructor(e={}){this.logger=b.create("formatter"),this.options=e,this.init(e)}init(e,t={interpolation:{}}){this.formatSeparator=t.interpolation.formatSeparator||",";const s=t.cacheInBuiltFormats?T:V;this.formats={number:s((e,t)=>{const s=new Intl.NumberFormat(e,{...t});return e=>s.format(e)}),currency:s((e,t)=>{const s=new Intl.NumberFormat(e,{...t,style:"currency"});return e=>s.format(e)}),datetime:s((e,t)=>{const s=new Intl.DateTimeFormat(e,{...t});return e=>s.format(e)}),relativetime:s((e,t)=>{const s=new Intl.RelativeTimeFormat(e,{...t});return e=>s.format(e,t.range||"day")}),list:s((e,t)=>{const s=new Intl.ListFormat(e,{...t});return e=>s.format(e)})}}add(e,t){this.formats[e.toLowerCase().trim()]=t}addCached(e,t){this.formats[e.toLowerCase().trim()]=T(t)}format(e,t,s,i={}){const o=t.split(this.formatSeparator);if(o.length>1&&o[0].indexOf("(")>1&&!o[0].includes(")")&&o.find(e=>e.includes(")"))){const e=o.findIndex(e=>e.includes(")"));o[0]=[o[0],...o.splice(1,e)].join(this.formatSeparator)}return o.reduce((e,t)=>{const{formatName:o,formatOptions:n}=(e=>{let t=e.toLowerCase().trim();const s={};if(e.includes("(")){const i=e.split("(");t=i[0].toLowerCase().trim();const o=i[1].slice(0,-1);"currency"!==t||o.includes(":")?"relativetime"!==t||o.includes(":")?o.split(";").forEach(e=>{if(e){const[t,...i]=e.split(":"),o=i.join(":").trim().replace(/^'+|'+$/g,""),n=t.trim();s[n]||(s[n]=o),"false"===o&&(s[n]=!1),"true"===o&&(s[n]=!0),isNaN(o)||(s[n]=parseInt(o,10))}}):s.range||(s.range=o.trim()):s.currency||(s.currency=o.trim())}return{formatName:t,formatOptions:s}})(t);if(this.formats[o]){let t=e;try{const r=i?.formatParams?.[i.interpolationkey]||{},a=r.locale||r.lng||i.locale||i.lng||s;t=this.formats[o](e,a,{...n,...i,...r})}catch(e){this.logger.warn(e)}return t}return this.logger.warn(`there was no format function for ${o}`),e},e)}}class D extends x{constructor(e,t,s,i={}){super(),this.backend=e,this.store=t,this.services=s,this.languageUtils=s.languageUtils,this.options=i,this.logger=b.create("backendConnector"),this.waitingReads=[],this.maxParallelReads=i.maxParallelReads||10,this.readingCalls=0,this.maxRetries=i.maxRetries>=0?i.maxRetries:5,this.retryTimeout=i.retryTimeout>=1?i.retryTimeout:350,this.state={},this.queue=[],this.backend?.init?.(s,i.backend,i)}queueLoad(e,t,s,i){const o={},n={},r={},a={};return e.forEach(e=>{let i=!0;t.forEach(t=>{const r=`${e}|${t}`;!s.reload&&this.store.hasResourceBundle(e,t)?this.state[r]=2:this.state[r]<0||(1===this.state[r]?void 0===n[r]&&(n[r]=!0):(this.state[r]=1,i=!1,void 0===n[r]&&(n[r]=!0),void 0===o[r]&&(o[r]=!0),void 0===a[t]&&(a[t]=!0)))}),i||(r[e]=!0)}),(Object.keys(o).length||Object.keys(n).length)&&this.queue.push({pending:n,pendingCount:Object.keys(n).length,loaded:{},errors:[],callback:i}),{toLoad:Object.keys(o),pending:Object.keys(n),toLoadLanguages:Object.keys(r),toLoadNamespaces:Object.keys(a)}}loaded(e,t,s){const i=e.split("|"),o=i[0],n=i[1];t&&this.emit("failedLoading",o,n,t),!t&&s&&this.store.addResourceBundle(o,n,s,void 0,void 0,{skipCopy:!0}),this.state[e]=t?-1:2,t&&s&&(this.state[e]=0);const a={};this.queue.forEach(s=>{((e,t,s)=>{const{obj:i,k:o}=r(e,t,Object);i[o]=i[o]||[],i[o].push(s)})(s.loaded,[o],n),((e,t)=>{void 0!==e.pending[t]&&(delete e.pending[t],e.pendingCount--)})(s,e),t&&s.errors.push(t),0!==s.pendingCount||s.done||(Object.keys(s.loaded).forEach(e=>{a[e]||(a[e]={});const t=s.loaded[e];t.length&&t.forEach(t=>{void 0===a[e][t]&&(a[e][t]=!0)})}),s.done=!0,s.errors.length?s.callback(s.errors):s.callback())}),this.emit("loaded",a),this.queue=this.queue.filter(e=>!e.done)}read(e,t,s,i=0,o=this.retryTimeout,n){if(!e.length)return n(null,{});if(this.readingCalls>=this.maxParallelReads)return void this.waitingReads.push({lng:e,ns:t,fcName:s,tried:i,wait:o,callback:n});this.readingCalls++;const r=(r,a)=>{if(this.readingCalls--,this.waitingReads.length>0){const e=this.waitingReads.shift();this.read(e.lng,e.ns,e.fcName,e.tried,e.wait,e.callback)}r&&a&&i<this.maxRetries?setTimeout(()=>{this.read(e,t,s,i+1,2*o,n)},o):n(r,a)},a=this.backend[s].bind(this.backend);if(2!==a.length)return a(e,t,r);try{const s=a(e,t);s&&"function"==typeof s.then?s.then(e=>r(null,e)).catch(r):r(null,s)}catch(e){r(e)}}prepareLoading(t,s,i={},o){if(!this.backend)return this.logger.warn("No backend was added via i18next.use. Will not load resources."),o&&o();e(t)&&(t=this.languageUtils.toResolveHierarchy(t)),e(s)&&(s=[s]);const n=this.queueLoad(t,s,i,o);if(!n.toLoad.length)return n.pending.length||o(),null;n.toLoad.forEach(e=>{this.loadOne(e)})}load(e,t,s){this.prepareLoading(e,t,{},s)}reload(e,t,s){this.prepareLoading(e,t,{reload:!0},s)}loadOne(e,t=""){const s=e.split("|"),i=s[0],o=s[1];this.read(i,o,"read",void 0,void 0,(s,n)=>{s&&this.logger.warn(`${t}loading namespace ${o} for language ${i} failed`,s),!s&&n&&this.logger.log(`${t}loaded namespace ${o} for language ${i}`,n),this.loaded(e,s,n)})}saveMissing(e,t,s,i,o,n={},r=()=>{}){if(!this.services?.utils?.hasLoadedNamespace||this.services?.utils?.hasLoadedNamespace(t)){if(null!=s&&""!==s){if(this.backend?.create){const a={...n,isUpdate:o},l=this.backend.create.bind(this.backend);if(l.length<6)try{let o;o=5===l.length?l(e,t,s,i,a):l(e,t,s,i),o&&"function"==typeof o.then?o.then(e=>r(null,e)).catch(r):r(null,o)}catch(e){r(e)}else l(e,t,s,i,r,a)}e&&e[0]&&this.store.addResource(e[0],t,s,i)}}else this.logger.warn(`did not save key "${s}" as the namespace "${t}" was not yet loaded`,"This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!")}}const A=()=>({debug:!1,initAsync:!0,ns:["translation"],defaultNS:["translation"],fallbackLng:["dev"],fallbackNS:!1,supportedLngs:!1,nonExplicitSupportedLngs:!1,load:"all",preload:!1,keySeparator:".",nsSeparator:":",pluralSeparator:"_",contextSeparator:"_",partialBundledLanguages:!1,saveMissing:!1,updateMissing:!1,saveMissingTo:"fallback",saveMissingPlurals:!0,missingKeyHandler:!1,missingInterpolationHandler:!1,postProcess:!1,postProcessPassResolved:!1,returnNull:!1,returnEmptyString:!0,returnObjects:!1,joinArrays:!1,returnedObjectHandler:!1,parseMissingKeyHandler:!1,appendNamespaceToMissingKey:!1,appendNamespaceToCIMode:!1,overloadTranslationOptionHandler:t=>{let s={};if("object"==typeof t[1]&&(s=t[1]),e(t[1])&&(s.defaultValue=t[1]),e(t[2])&&(s.tDescription=t[2]),"object"==typeof t[2]||"object"==typeof t[3]){const e=t[3]||t[2];Object.keys(e).forEach(t=>{s[t]=e[t]})}return s},interpolation:{escapeValue:!0,prefix:"{{",suffix:"}}",formatSeparator:",",unescapePrefix:"-",nestingPrefix:"$t(",nestingSuffix:")",nestingOptionsSeparator:",",maxReplaces:1e3,skipOnVariables:!0},cacheInBuiltFormats:!0}),K=t=>(e(t.ns)&&(t.ns=[t.ns]),e(t.fallbackLng)&&(t.fallbackLng=[t.fallbackLng]),e(t.fallbackNS)&&(t.fallbackNS=[t.fallbackNS]),t.supportedLngs&&!t.supportedLngs.includes("cimode")&&(t.supportedLngs=t.supportedLngs.concat(["cimode"])),t),U=()=>{};class M extends x{constructor(e={},t){var s;if(super(),this.options=K(e),this.services={},this.logger=b,this.modules={external:[]},s=this,Object.getOwnPropertyNames(Object.getPrototypeOf(s)).forEach(e=>{"function"==typeof s[e]&&(s[e]=s[e].bind(s))}),t&&!this.isInitialized&&!e.isClone){if(!this.options.initAsync)return this.init(e,t),this;setTimeout(()=>{this.init(e,t)},0)}}init(s={},i){this.isInitializing=!0,"function"==typeof s&&(i=s,s={}),null==s.defaultNS&&s.ns&&(e(s.ns)?s.defaultNS=s.ns:s.ns.includes("translation")||(s.defaultNS=s.ns[0]));const o=A();this.options={...o,...this.options,...K(s)},this.options.interpolation={...o.interpolation,...this.options.interpolation},void 0!==s.keySeparator&&(this.options.userDefinedKeySeparator=s.keySeparator),void 0!==s.nsSeparator&&(this.options.userDefinedNsSeparator=s.nsSeparator),"function"!=typeof this.options.overloadTranslationOptionHandler&&(this.options.overloadTranslationOptionHandler=o.overloadTranslationOptionHandler);const n=e=>e?"function"==typeof e?new e:e:null;if(!this.options.isClone){let e;this.modules.logger?b.init(n(this.modules.logger),this.options):b.init(null,this.options),e=this.modules.formatter?this.modules.formatter:I;const t=new R(this.options);this.store=new k(this.options.resources,this.options);const s=this.services;s.logger=b,s.resourceStore=this.store,s.languageUtils=t,s.pluralResolver=new j(t,{prepend:this.options.pluralSeparator}),e&&(s.formatter=n(e),s.formatter.init&&s.formatter.init(s,this.options),this.options.interpolation.format=s.formatter.format.bind(s.formatter)),s.interpolator=new F(this.options),s.utils={hasLoadedNamespace:this.hasLoadedNamespace.bind(this)},s.backendConnector=new D(n(this.modules.backend),s.resourceStore,s,this.options),s.backendConnector.on("*",(e,...t)=>{this.emit(e,...t)}),this.modules.languageDetector&&(s.languageDetector=n(this.modules.languageDetector),s.languageDetector.init&&s.languageDetector.init(s,this.options.detection,this.options)),this.modules.i18nFormat&&(s.i18nFormat=n(this.modules.i18nFormat),s.i18nFormat.init&&s.i18nFormat.init(this)),this.translator=new O(this.services,this.options),this.translator.on("*",(e,...t)=>{this.emit(e,...t)}),this.modules.external.forEach(e=>{e.init&&e.init(this)})}if(this.format=this.options.interpolation.format,i||(i=U),this.options.fallbackLng&&!this.services.languageDetector&&!this.options.lng){const e=this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);e.length>0&&"dev"!==e[0]&&(this.options.lng=e[0])}this.services.languageDetector||this.options.lng||this.logger.warn("init: no languageDetector is used and no lng is defined");["getResource","hasResourceBundle","getResourceBundle","getDataByLanguage"].forEach(e=>{this[e]=(...t)=>this.store[e](...t)});["addResource","addResources","addResourceBundle","removeResourceBundle"].forEach(e=>{this[e]=(...t)=>(this.store[e](...t),this)});const r=t(),a=()=>{const e=(e,t)=>{this.isInitializing=!1,this.isInitialized&&!this.initializedStoreOnce&&this.logger.warn("init: i18next is already initialized. You should call init just once!"),this.isInitialized=!0,this.options.isClone||this.logger.log("initialized",this.options),this.emit("initialized",this.options),r.resolve(t),i(e,t)};if(this.languages&&!this.isInitialized)return e(null,this.t.bind(this));this.changeLanguage(this.options.lng,e)};return this.options.resources||!this.options.initAsync?a():setTimeout(a,0),r}loadResources(t,s=U){let i=s;const o=e(t)?t:this.language;if("function"==typeof t&&(i=t),!this.options.resources||this.options.partialBundledLanguages){if("cimode"===o?.toLowerCase()&&(!this.options.preload||0===this.options.preload.length))return i();const e=[],t=t=>{if(!t)return;if("cimode"===t)return;this.services.languageUtils.toResolveHierarchy(t).forEach(t=>{"cimode"!==t&&(e.includes(t)||e.push(t))})};if(o)t(o);else{this.services.languageUtils.getFallbackCodes(this.options.fallbackLng).forEach(e=>t(e))}this.options.preload?.forEach?.(e=>t(e)),this.services.backendConnector.load(e,this.options.ns,e=>{e||this.resolvedLanguage||!this.language||this.setResolvedLanguage(this.language),i(e)})}else i(null)}reloadResources(e,s,i){const o=t();return"function"==typeof e&&(i=e,e=void 0),"function"==typeof s&&(i=s,s=void 0),e||(e=this.languages),s||(s=this.options.ns),i||(i=U),this.services.backendConnector.reload(e,s,e=>{o.resolve(),i(e)}),o}use(e){if(!e)throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");if(!e.type)throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");return"backend"===e.type&&(this.modules.backend=e),("logger"===e.type||e.log&&e.warn&&e.error)&&(this.modules.logger=e),"languageDetector"===e.type&&(this.modules.languageDetector=e),"i18nFormat"===e.type&&(this.modules.i18nFormat=e),"postProcessor"===e.type&&S.addPostProcessor(e),"formatter"===e.type&&(this.modules.formatter=e),"3rdParty"===e.type&&this.modules.external.push(e),this}setResolvedLanguage(e){if(e&&this.languages&&!["cimode","dev"].includes(e)){for(let e=0;e<this.languages.length;e++){const t=this.languages[e];if(!["cimode","dev"].includes(t)&&this.store.hasLanguageSomeTranslations(t)){this.resolvedLanguage=t;break}}this.resolvedLanguage||this.languages.includes(e)||!this.store.hasLanguageSomeTranslations(e)||(this.resolvedLanguage=e,this.languages.unshift(e))}}changeLanguage(s,i){this.isLanguageChangingTo=s;const o=t();this.emit("languageChanging",s);const n=e=>{this.language=e,this.languages=this.services.languageUtils.toResolveHierarchy(e),this.resolvedLanguage=void 0,this.setResolvedLanguage(e)},r=(e,t)=>{t?this.isLanguageChangingTo===s&&(n(t),this.translator.changeLanguage(t),this.isLanguageChangingTo=void 0,this.emit("languageChanged",t),this.logger.log("languageChanged",t)):this.isLanguageChangingTo=void 0,o.resolve((...e)=>this.t(...e)),i&&i(e,(...e)=>this.t(...e))},a=t=>{s||t||!this.services.languageDetector||(t=[]);const i=e(t)?t:t&&t[0],o=this.store.hasLanguageSomeTranslations(i)?i:this.services.languageUtils.getBestMatchFromCodes(e(t)?[t]:t);o&&(this.language||n(o),this.translator.language||this.translator.changeLanguage(o),this.services.languageDetector?.cacheUserLanguage?.(o)),this.loadResources(o,e=>{r(e,o)})};return s||!this.services.languageDetector||this.services.languageDetector.async?!s&&this.services.languageDetector&&this.services.languageDetector.async?0===this.services.languageDetector.detect.length?this.services.languageDetector.detect().then(a):this.services.languageDetector.detect(a):a(s):a(this.services.languageDetector.detect()),o}getFixedT(t,s,i){const o=(e,t,...s)=>{let n;n="object"!=typeof t?this.options.overloadTranslationOptionHandler([e,t].concat(s)):{...t},n.lng=n.lng||o.lng,n.lngs=n.lngs||o.lngs,n.ns=n.ns||o.ns,""!==n.keyPrefix&&(n.keyPrefix=n.keyPrefix||i||o.keyPrefix);const r={...this.options,...n};"function"==typeof n.keyPrefix&&(n.keyPrefix=w(n.keyPrefix,r));const a=this.options.keySeparator||".";let l;return n.keyPrefix&&Array.isArray(e)?l=e.map(e=>("function"==typeof e&&(e=w(e,r)),`${n.keyPrefix}${a}${e}`)):("function"==typeof e&&(e=w(e,r)),l=n.keyPrefix?`${n.keyPrefix}${a}${e}`:e),this.t(l,n)};return e(t)?o.lng=t:o.lngs=t,o.ns=s,o.keyPrefix=i,o}t(...e){return this.translator?.translate(...e)}exists(...e){return this.translator?.exists(...e)}setDefaultNamespace(e){this.options.defaultNS=e}hasLoadedNamespace(e,t={}){if(!this.isInitialized)return this.logger.warn("hasLoadedNamespace: i18next was not initialized",this.languages),!1;if(!this.languages||!this.languages.length)return this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty",this.languages),!1;const s=t.lng||this.resolvedLanguage||this.languages[0],i=!!this.options&&this.options.fallbackLng,o=this.languages[this.languages.length-1];if("cimode"===s.toLowerCase())return!0;const n=(e,t)=>{const s=this.services.backendConnector.state[`${e}|${t}`];return-1===s||0===s||2===s};if(t.precheck){const e=t.precheck(this,n);if(void 0!==e)return e}return!!this.hasResourceBundle(s,e)||(!(this.services.backendConnector.backend&&(!this.options.resources||this.options.partialBundledLanguages))||!(!n(s,e)||i&&!n(o,e)))}loadNamespaces(s,i){const o=t();return this.options.ns?(e(s)&&(s=[s]),s.forEach(e=>{this.options.ns.includes(e)||this.options.ns.push(e)}),this.loadResources(e=>{o.resolve(),i&&i(e)}),o):(i&&i(),Promise.resolve())}loadLanguages(s,i){const o=t();e(s)&&(s=[s]);const n=this.options.preload||[],r=s.filter(e=>!n.includes(e)&&this.services.languageUtils.isSupportedCode(e));return r.length?(this.options.preload=n.concat(r),this.loadResources(e=>{o.resolve(),i&&i(e)}),o):(i&&i(),Promise.resolve())}dir(e){if(e||(e=this.resolvedLanguage||(this.languages?.length>0?this.languages[0]:this.language)),!e)return"rtl";try{const t=new Intl.Locale(e);if(t&&t.getTextInfo){const e=t.getTextInfo();if(e&&e.direction)return e.direction}}catch(e){}const t=this.services?.languageUtils||new R(A());return e.toLowerCase().indexOf("-latn")>1?"ltr":["ar","shu","sqr","ssh","xaa","yhd","yud","aao","abh","abv","acm","acq","acw","acx","acy","adf","ads","aeb","aec","afb","ajp","apc","apd","arb","arq","ars","ary","arz","auz","avl","ayh","ayl","ayn","ayp","bbz","pga","he","iw","ps","pbt","pbu","pst","prp","prd","ug","ur","ydd","yds","yih","ji","yi","hbo","men","xmn","fa","jpr","peo","pes","prs","dv","sam","ckb"].includes(t.getLanguagePartFromCode(e))||e.toLowerCase().indexOf("-arab")>1?"rtl":"ltr"}static createInstance(e={},t){const s=new M(e,t);return s.createInstance=M.createInstance,s}cloneInstance(e={},t=U){const s=e.forkResourceStore;s&&delete e.forkResourceStore;const i={...this.options,...e,isClone:!0},o=new M(i);void 0===e.debug&&void 0===e.prefix||(o.logger=o.logger.clone(e));if(["store","services","language"].forEach(e=>{o[e]=this[e]}),o.services={...this.services},o.services.utils={hasLoadedNamespace:o.hasLoadedNamespace.bind(o)},s){const e=Object.keys(this.store.data).reduce((e,t)=>(e[t]={...this.store.data[t]},e[t]=Object.keys(e[t]).reduce((s,i)=>(s[i]={...e[t][i]},s),e[t]),e),{});o.store=new k(e,i),o.services.resourceStore=o.store}if(e.interpolation){const t={...A().interpolation,...this.options.interpolation,...e.interpolation},s={...i,interpolation:t};o.services.interpolator=new F(s)}return o.translator=new O(o.services,i),o.translator.on("*",(e,...t)=>{o.emit(e,...t)}),o.init(i,t),o.translator.options=i,o.translator.backendConnector.services.utils={hasLoadedNamespace:o.hasLoadedNamespace.bind(o)},o}toJSON(){return{options:this.options,store:this.store,language:this.language,languages:this.languages,resolvedLanguage:this.resolvedLanguage}}}const H=M.createInstance();return H.keyFromSelector=w,H});

;
(function(root){
  'use strict';
  const VERSION='factorlab-daily-v2.0.0';
  const STUDIO_VERSION='factorlab-daily-v2.1.0';
  const SECTORS=['semiconductor','robotics','materials','energy','digital','cash'];
  const FACTOR_NAMES=['momentum','value','quality','lowVolatility'];
  const INITIAL_WEIGHTS=[.2,.2,.15,.15,.15,.15];
  const EXPOSURES=[[.5,0,.5,-.5],[0,.5,1,0],[-.5,1,0,.5],[-1,-.5,-.5,1],[1,-1,-1,-1]];
  const BETAS=[1.15,1.05,.9,.95,1.2];
  const DEFAULT_CONFIG={rounds:6,daysPerRound:20,dailyNoise:.004,macroNoise:.09,eventStrength:1,buyRate:.0013,sellRate:.0018,slowEvery:5,lagDays:5,cycleConfirmations:2,minCycleDays:10,rateReversion:.07,growthReversion:.045,inflationReversion:.035};
  const TEXTS={
    'zh-CN':{
      'sector.semiconductor':'半导体','sector.robotics':'机器人与工业自动化','sector.materials':'先进材料','sector.energy':'清洁能源装备','sector.digital':'AI 与数字基础设施','sector.cash':'Cash',
      'factor.momentum':'动量','factor.value':'价值','factor.quality':'质量','factor.lowVolatility':'低波动',
      'cycle.expansion':'扩张','cycle.overheating':'过热','cycle.stagflation':'滞胀','cycle.recession':'衰退','cycle.recovery':'复苏',
      'evidence.E1.title':'订单回来了，利润呢？','evidence.E1.body':'合成订单线索改善，但订单转化为收入与利润仍需后续披露。',
      'evidence.E2.title':'好消息可能已在价格里','evidence.E2.body':'需求改善与估值风险可以同时存在。当前价格不是未来收益保证。',
      'evidence.E3.title':'长期支持需要时间','evidence.E3.body':'政策影响先进入融资与需求，再传到盈利。保持长期锚，并说明短期偏移的理由。',
      'event.order.title':'订单传闻浮现','event.order.body':'产业链出现补库存传闻，经营改善尚未核实。市场情绪升温，证据仍有限。',
      'event.disclosure.title':'数据披露：收入与订单不同步','event.disclosure.body':'最新合成披露显示订单的兑现存在时滞。行业内部盈利差异开始扩大。',
      'event.disclosure.strong':'最新合成披露显示较多订单转化为收入；交付时滞仍存在，价格也可能已反映改善。',
      'event.disclosure.weak':'最新合成披露显示订单转化偏弱，部分交付延后。传闻与已确认收入需要重新区分。',
      'event.supply.title':'供应链与融资成本冲击','event.supply.body':'运输与设备交付承压，信用条件收紧。成本变化将持续多个交易日。',
      'event.divergence.title':'行业分化：利润率成为焦点','event.divergence.body':'自动化与材料的现金流表现出现差异。质量因子提供观察角度，但不会永久占优。',
      'event.profit.title':'盈利兑现进入检验期','event.profit.body':'订单开始转化为盈利，估值与资金成本仍影响价格。长期叙事与短期回报并不相同。',
      'event.resolution.title':'订单迷雾：本章证据收束','event.resolution.body':'本章已披露的信息进入最终复盘。检查当时的证据、风险与预测，而不只看盈亏。',
      'badge.reason':'判断有据','badge.evidence':'证据观察者','badge.diversified':'分散配置','badge.risk':'风险守护','badge.forecast':'预测复盘',
      'coach.synthetic':'本回答来自规则式教学提示，市场数据为合成模拟。','coach.risk':'先检查集中度、Cash 缓冲与已发生回撤，再区分需求改善和估值风险。',
      'coach.macro':'利率与信用条件通过融资成本和需求逐步传导；当前宏观指标不提供下一交易日价格。','coach.review':'把本轮结果与同一路径下的不交易组合比较，再检查当时理由是否仍成立。',
      'coach.detail':'因子权重只用于生成行业建议，不会再次投入本金。事件只使用当前已披露信息；未来价格未知。',
      'model.note':'原创、可配置的简化教学模型；未拟合真实市场，不能作为价格预测。',
      'model.benchmark':'五行业各 20%，每日再平衡，免交易成本；不含 Cash。','model.risk':'日收益；252 日年化；Sharpe 扣除各日开盘前已知政策利率百分值/100/252；样本标准差，n<2 时留空；超额收益零方差时仅 Sharpe 留空。'
    },
    en:{
      'sector.semiconductor':'Semiconductors','sector.robotics':'Robotics & automation','sector.materials':'Advanced materials','sector.energy':'Clean energy equipment','sector.digital':'AI & digital infrastructure','sector.cash':'Cash',
      'factor.momentum':'Momentum','factor.value':'Value','factor.quality':'Quality','factor.lowVolatility':'Low volatility',
      'cycle.expansion':'Expansion','cycle.overheating':'Overheating','cycle.stagflation':'Stagflation','cycle.recession':'Recession','cycle.recovery':'Recovery',
      'evidence.E1.title':'Orders are back. Are profits?','evidence.E1.body':'Synthetic order signals improve, but conversion into revenue and profit needs later disclosures.',
      'evidence.E2.title':'Good news may already be priced in','evidence.E2.body':'Improving demand and valuation risk can coexist. The current price cannot guarantee future returns.',
      'evidence.E3.title':'Long-term support takes time','evidence.E3.body':'Policy reaches financing and demand before profits. Retain a long-term anchor and explain tactical deviations.',
      'event.order.title':'An order rumor emerges','event.order.body':'Restocking rumors lift sentiment. Operating improvements remain unverified and evidence is limited.',
      'event.disclosure.title':'Disclosure: orders and revenue diverge','event.disclosure.body':'A synthetic disclosure reveals a lag in order conversion. Profit differences across industries widen.',
      'event.disclosure.strong':'The latest synthetic disclosure confirms stronger order conversion into revenue. Delivery lags remain, and improvement may already be priced in.',
      'event.disclosure.weak':'The latest synthetic disclosure shows weak order conversion and delayed delivery. Distinguish the earlier rumor from confirmed revenue.',
      'event.supply.title':'Supply and financing shock','event.supply.body':'Transport and equipment deliveries face disruption as credit tightens. Cost effects persist across trading days.',
      'event.divergence.title':'Sector divergence: margins in focus','event.divergence.body':'Automation and materials show different cash-flow outcomes. Quality is a useful lens, not a permanent winner.',
      'event.profit.title':'Profit delivery faces its test','event.profit.body':'Orders begin translating into profits while valuation and funding costs still affect prices. A long-term story is not a short-term return.',
      'event.resolution.title':'Order fog: the chapter closes','event.resolution.body':'Available evidence enters the final review. Evaluate the evidence, risk and forecast recorded at the time, as well as returns.',
      'badge.reason':'Reasoned decision','badge.evidence':'Evidence observer','badge.diversified':'Diversified','badge.risk':'Risk awareness','badge.forecast':'Forecast review',
      'coach.synthetic':'This is a rule-based teaching response using synthetic market data.','coach.risk':'Check concentration, the cash buffer and observed drawdown, then separate improving demand from valuation risk.',
      'coach.macro':'Rates and credit conditions transmit gradually through financing costs and demand; current indicators do not reveal the next trading-day price.','coach.review':'Compare this round with the no-trade portfolio on the same market path, then review whether your recorded reason still holds.',
      'coach.detail':'Factor weights only produce a sector suggestion; they do not invest a second budget. Events use disclosed information only; future prices remain unknown.',
      'model.note':'An original, configurable teaching model, not calibrated to actual markets and not a price forecast.',
      'model.benchmark':'Five sectors at 20% each, rebalanced daily without costs; no cash.','model.risk':'Daily returns; 252-day annualization; Sharpe subtracts the pre-day annual policy rate in percent /100/252; sample deviation. Statistics are blank when n<2; only Sharpe is blank for zero excess-return variance.'
    }
  };
  const EVENT_DEFINITIONS=[
    {id:'EVENT-ORDER',key:'order',at:7,duration:12,macro:{sentiment:.65,liquidity:.10},sector:[.0012,.0002,0,0,.0005],factor:[.00025,0,0,-.0001]},
    {id:'EVENT-DISCLOSURE',key:'disclosure',at:25,duration:15,macro:{growth:-.005,sentiment:-.45},sector:[-.0014,.0002,.0003,0,-.0004],factor:[-.0003,.0001,.0002,.0001]},
    {id:'EVENT-SUPPLY',key:'supply',at:46,duration:20,macro:{inflation:.018,credit:.35,liquidity:-.25},sector:[-.0008,-.0005,.0004,-.0006,-.0002],factor:[-.00015,.00005,.00015,.0002]},
    {id:'EVENT-DIVERGENCE',key:'divergence',at:72,duration:14,macro:{growth:.015,credit:-.18},sector:[.0002,.0008,.0005,-.0003,-.0004],factor:[.0001,.00015,.0001,-.0001]},
    {id:'EVENT-PROFIT',key:'profit',at:95,duration:16,macro:{growth:.012,sentiment:.35},sector:[.0007,.0002,-.0002,.0001,.0005],factor:[.0001,-.0001,.00005,-.00005]},
    {id:'EVENT-RESOLUTION',key:'resolution',at:116,duration:4,macro:{sentiment:-.1},sector:[-.0001,.0001,0,.0001,0],factor:[-.0001,.0001,0,0]}
  ];
  const clone=x=>JSON.parse(JSON.stringify(x));
  const sum=x=>x.reduce((a,b)=>a+b,0);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const fail=code=>{throw Error(code);};
  const emptyAttribution=()=>({market:0,factors:[0,0,0,0],sector:0,event:0,idiosyncratic:0,cash:0,cost:0});
  function validWeights(w){if(!Array.isArray(w)||w.length!==6||w.some(x=>!Number.isFinite(x)||x<0)||Math.abs(sum(w)-1)>1e-9)return 'invalidWeights';if(w.slice(0,5).some(x=>x>.4+1e-10))return 'sectorCap';return null;}
  function validFactors(w){return Array.isArray(w)&&w.length===4&&w.every(x=>Number.isFinite(x)&&x>=0)&&Math.abs(sum(w)-1)<=1e-9;}
  function configuration(raw={}){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))fail('invalidConfig');
    const c={...DEFAULT_CONFIG,...raw},ranges={rounds:[1,12],daysPerRound:[5,60],dailyNoise:[.0001,.03],macroNoise:[0,.5],eventStrength:[0,3],buyRate:[0,.02],sellRate:[0,.02],slowEvery:[1,20],lagDays:[1,30],cycleConfirmations:[1,5],minCycleDays:[5,30],rateReversion:[0,.3],growthReversion:[0,.3],inflationReversion:[0,.3]};
    for(const key of Object.keys(raw))if(!Object.hasOwn(ranges,key))fail('invalidConfig');
    for(const [key,[lo,hi]] of Object.entries(ranges))if(!Number.isFinite(c[key])||c[key]<lo||c[key]>hi)fail('invalidConfig');
    if(['rounds','daysPerRound','slowEvery','lagDays','cycleConfirmations','minCycleDays'].some(k=>!Number.isInteger(c[k])))fail('invalidConfig');return c;
  }
  function uniform(s){s.rng=(s.rng+0x6D2B79F5)>>>0;let n=s.rng;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;}
  function normal(s){return Math.sqrt(-2*Math.log(Math.max(1e-12,uniform(s))))*Math.cos(2*Math.PI*uniform(s));}
  function value(units,prices,cash){return sum(units.map((u,i)=>u*prices[i]))+cash;}
  function updateWeights(s){s.nav=value(s.units,s.prices,s.cash);s.weights=[...s.units.map((u,i)=>u*s.prices[i]/s.nav),s.cash/s.nav];}
  function initial({seed=20261013,scenario='baseline',config={}}={}){
    if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295)fail('invalidSeed');
    if(!['baseline','stress','recovery'].includes(scenario))fail('invalidScenario');
    const c=configuration(config),macro={rate:3.2,inflation:2.7,growth:3.2,liquidity:56,credit:22,sentiment:58,cycle:'expansion'};
    if(scenario==='stress')Object.assign(macro,{rate:5.5,inflation:5.2,growth:-1.2,liquidity:32,credit:62,sentiment:32,cycle:'stagflation'});
    if(scenario==='recovery')Object.assign(macro,{rate:2,inflation:1.4,growth:1.2,liquidity:66,credit:34,sentiment:57,cycle:'recovery'});
    const prices=[100,100,100,100,100],units=INITIAL_WEIGHTS.slice(0,5).map(w=>w*100000/100),cash=15000;
    const s={version:VERSION,seed,scenario,config:c,rng:seed,phase:'decision',day:0,round:1,daysPerRound:c.daysPerRound,macro,prices,units,cash,nav:100000,benchmarkNav:100000,anchorNav:100000,anchorUnits:[...units],anchorCash:cash,weights:[...INITIAL_WEIGHTS],factorWeights:[.25,.25,.25,.25],events:[],eventState:{},history:[],results:[],transactions:[],commands:[],seen:[],pendingCost:0,roundState:null,cycleCandidate:macro.cycle,cycleCount:0,cycleChanged:0};
    s.history.push({day:0,nav:100000,benchmarkNav:100000,anchorNav:100000,prices:[...prices],macro:clone(macro),sectorReturns:[0,0,0,0,0],factorReturns:[0,0,0,0],beforeNav:100000,holdingsBefore:units.map((u,i)=>u*prices[i]),cashBefore:cash,cashRate:macro.rate/100/252,attribution:emptyAttribution(),contributionReturns:[]});return s;
  }
  function preview(s,weights=s.weights){
    const error=validWeights(weights);if(error)return {ok:false,error};
    const holdings=s.units.map((u,i)=>u*s.prices[i]);
    const trades=after=>{let buys=0,sells=0;for(let i=0;i<5;i++){const d=weights[i]*after-holdings[i];if(d>=0)buys+=d;else sells-=d;}return {buys,sells,fee:buys*s.config.buyRate+sells*s.config.sellRate};};
    let lo=0,hi=s.nav;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(mid+trades(mid).fee>s.nav)hi=mid;else lo=mid;}
    const after=(lo+hi)/2,t=trades(after);return {ok:true,weights:[...weights],after,fee:t.fee,buys:t.buys,sells:t.sells,turnover:(t.buys+t.sells)/s.nav,cash:after*weights[5]};
  }
  function recommend(s,factorWeights,cashWeight=.15){
    if(!validFactors(factorWeights))fail('invalidFactors');if(!Number.isFinite(cashWeight)||cashWeight<0||cashWeight>1)fail('invalidWeights');
    const scores=EXPOSURES.map(row=>Math.exp(sum(row.map((v,i)=>v*factorWeights[i])))),w=[0,0,0,0,0,cashWeight];let free=[0,1,2,3,4],remaining=1-cashWeight;
    while(free.length){const total=sum(free.map(i=>scores[i])),capped=free.filter(i=>remaining*scores[i]/total>.4);if(!capped.length){for(const i of free)w[i]=remaining*scores[i]/total;break;}for(const i of capped){w[i]=.4;remaining-=.4;}free=free.filter(i=>!capped.includes(i));}return w;
  }
  function macroStep(s,impacts){
    const m=s.macro,lag=s.history[Math.max(0,s.history.length-1-s.config.lagDays)].macro,n=s.config.macroNoise;
    m.liquidity=clamp(m.liquidity+.05*(55-m.liquidity)-.08*(lag.rate-3)-.015*(lag.credit-25)+normal(s)*n*2,0,100);
    m.credit=clamp(m.credit+.025*(24-m.credit)+.045*(lag.rate-3)-.055*(lag.growth-2.5)+normal(s)*n,0,100);
    m.sentiment=clamp(m.sentiment+.055*(52-m.sentiment)+.08*(m.growth-2.5)+.012*(m.liquidity-50)-.018*(m.credit-25)+normal(s)*n*3,0,100);
    if(s.day%s.config.slowEvery===0){
      m.rate=clamp(m.rate+s.config.rateReversion*((2.5+.4*(lag.inflation-2)+.12*(lag.growth-2.5))-m.rate)+normal(s)*n*.12,0,15);
      m.growth=clamp(m.growth+s.config.growthReversion*(3-m.growth)-.035*(lag.rate-lag.inflation-1)-.005*(lag.credit-25)+.002*(lag.liquidity-50)+normal(s)*n,-8,10);
      m.inflation=clamp(m.inflation+s.config.inflationReversion*(2.3-m.inflation)+.02*(lag.growth-2.5)+normal(s)*n*.5,-3,16);
    }
    for(const [key,v] of Object.entries(impacts))m[key]+=v;
    for(const [key,lo,hi] of [['rate',0,15],['inflation',-3,16],['growth',-8,10],['liquidity',0,100],['credit',0,100],['sentiment',0,100]])m[key]=clamp(m[key],lo,hi);
    if(s.day%s.config.slowEvery===0){const candidate=cycleSignal(m);s.cycleCount=s.cycleCandidate===candidate?s.cycleCount+1:1;s.cycleCandidate=candidate;if(s.cycleCount>=s.config.cycleConfirmations&&s.day-s.cycleChanged>=s.config.minCycleDays&&m.cycle!==candidate){m.cycle=candidate;s.cycleChanged=s.day;}}
  }
  function trigger(s){
    const total=s.config.rounds*s.daysPerRound;
    const index=EVENT_DEFINITIONS.findIndex((e,i)=>Math.max(1,Math.round(e.at*total/120))<=s.day&&!s.events.some(old=>old.id===e.id)&&(i===0||s.events.some(old=>old.id===EVENT_DEFINITIONS[i-1].id)));
    const definition=EVENT_DEFINITIONS[index];
    if(!definition)return false;
    const orderConversion=index===0?.35+uniform(s)*.5:s.eventState['EVENT-ORDER'].hidden.orderConversion;
    const stress=clamp(1+(s.macro.credit-25)/100,.75,1.6),severity=(.7+uniform(s)*.6)*s.config.eventStrength*(index===2?stress:1);
    const event={id:definition.id,titleKey:`event.${definition.key}.title`,bodyKey:index===1?`event.disclosure.${orderConversion>=.6?'strong':'weak'}`:`event.${definition.key}.body`,predecessorId:index?EVENT_DEFINITIONS[index-1].id:null,startDay:s.day,duration:Math.max(2,Math.round(definition.duration*total/120)),severity,status:'active',trigger:'disclosure-node-and-predecessor',resolution:'duration-elapsed'};
    const sector=[...definition.sector];if(index===1)sector[0]+=(orderConversion-.6)*.009;if(index===4)sector[0]+=(orderConversion-.6)*.005;
    s.eventState[event.id]={macroImpact:clone(definition.macro),sectorImpact:sector,factorImpact:[...definition.factor],hidden:{orderConversion},followUpId:EVENT_DEFINITIONS[index+1]?.id||null};
    s.events.push(event);return true;
  }
  function eventImpacts(s){
    const macro={},sector=[0,0,0,0,0],factors=[0,0,0,0];
    for(const event of s.events){const age=s.day-event.startDay;if(age>=event.duration){event.status='resolved';continue;}const d=s.eventState[event.id],scale=event.severity*Math.exp(-age/event.duration);for(const [k,v] of Object.entries(d.macroImpact))macro[k]=(macro[k]||0)+v*scale;d.sectorImpact.forEach((v,i)=>sector[i]+=v*scale);d.factorImpact.forEach((v,i)=>factors[i]+=v*scale);}
    return {macro,sector,factors};
  }
  function marketStep(s,impact){
    const m=s.macro,prev=s.history.at(-1),noise=s.config.dailyNoise,risk=clamp(1+(m.credit-25)/90+(50-m.liquidity)/150,.65,2.5);
    const market=.00013+(m.growth-2.5)*.00013-(m.rate-3)*.00016-(m.inflation-2.5)*.00007+(m.liquidity-50)*.000006-(m.credit-25)*.000011+(m.sentiment-50)*.000004+normal(s)*noise*risk;
    const momentum=sum(prev.sectorReturns)/5;
    const factorReturns=[.10*momentum+(m.sentiment-50)*.000004+normal(s)*noise*.28,(m.rate-3)*.00007-(m.growth-3)*.00003+normal(s)*noise*.24,(m.credit-25)*.000006+(3-m.growth)*.000025+normal(s)*noise*.22,(m.credit-25)*.000005-(m.sentiment-50)*.000005+normal(s)*noise*.20];
    const contributionReturns=EXPOSURES.map((exposure,i)=>{
      const factors=exposure.map((v,j)=>v===0?0:v*factorReturns[j]),sector=(m.growth-2.5)*[.00007,.00009,.00005,.00006,.00004][i]-(m.inflation-2.5)*[.00004,.00006,-.00003,.00006,.00002][i];
      const event=impact.sector[i]+sum(exposure.map((v,j)=>v*impact.factors[j])),beta=BETAS[i]*market,rawIdio=normal(s)*noise*[.65,.5,.45,.6,.8][i],raw=beta+sum(factors)+sector+event+rawIdio;
      return {market:beta,factors,sector,event,idiosyncratic:rawIdio+clamp(raw,-.12,.12)-raw};
    });
    return {factorReturns,contributionReturns,sectorReturns:contributionReturns.map(c=>c.market+sum(c.factors)+c.sector+c.event+c.idiosyncratic)};
  }
  function daily(s){
    const previous=s.history.at(-1),holdings=s.units.map((u,i)=>u*s.prices[i]),cashBefore=s.cash,cashRate=s.macro.rate/100/252;
    s.day++;const occurred=trigger(s),impact=eventImpacts(s);macroStep(s,impact.macro);const returns=marketStep(s,impact),a=emptyAttribution();
    for(let i=0;i<5;i++){const c=returns.contributionReturns[i],amount=holdings[i];a.market+=amount*c.market;a.sector+=amount*c.sector;a.event+=amount*c.event;a.idiosyncratic+=amount*c.idiosyncratic;c.factors.forEach((r,j)=>a.factors[j]+=amount*r);s.prices[i]*=1+returns.sectorReturns[i];}
    a.cash=cashBefore*cashRate;a.cost=s.pendingCost?-s.pendingCost:0;s.cash+=a.cash;s.pendingCost=0;s.anchorCash*=1+cashRate;s.roundState.counterfactualCash*=1+cashRate;
    updateWeights(s);s.benchmarkNav*=1+sum(returns.sectorReturns)/5;s.anchorNav=value(s.anchorUnits,s.prices,s.anchorCash);
    s.history.push({day:s.day,nav:s.nav,benchmarkNav:s.benchmarkNav,anchorNav:s.anchorNav,prices:[...s.prices],macro:clone(s.macro),...returns,beforeNav:previous.nav,holdingsBefore:holdings,cashBefore,cashRate,attribution:a});
    if(occurred)s.phase='event';else if(s.day===s.round*s.daysPerRound)settleRound(s);
  }
  function aggregate(rows){const a=emptyAttribution();for(const h of rows){for(const k of ['market','sector','event','idiosyncratic','cash','cost'])a[k]+=h.attribution[k];h.attribution.factors.forEach((v,i)=>a.factors[i]+=v);}return a;}
  function settleRound(s){
    if(s.results.some(r=>r.round===s.round))return;
    const rs=s.roundState,returnValue=s.nav/rs.before-1,benchmarkReturn=s.benchmarkNav/rs.benchmarkBefore-1,rows=s.history.filter(h=>h.day>rs.startDay),counterfactualNav=value(rs.counterfactualUnits,s.prices,rs.counterfactualCash),realized=benchmarkReturn>.01?'up':benchmarkReturn<-.01?'down':'flat';
    const badges=[];if(rs.decisionPolicy==='studio'){if(rs.evidenceRefs.length&&rs.falsifierIf.trim())badges.push('badge.recordComplete');}else{if(rs.reason.trim())badges.push('badge.reason');if(s.seen.length)badges.push('badge.evidence');if(sum(rs.weights.map(w=>w*w))<=.26)badges.push('badge.diversified');if(rs.weights[5]>=.1&&metrics(s).maxDrawdown<=.12)badges.push('badge.risk');if(realized===rs.forecast)badges.push('badge.forecast');}
    s.results.push({id:`RESULT-R${s.round}`,round:s.round,day:s.day,before:rs.before,after:s.nav,returnValue,benchmarkReturn,anchorReturn:s.anchorNav/rs.anchorBefore-1,counterfactualNav,tacticalAmount:s.nav-counterfactualNav,anchorNav:s.anchorNav,attribution:aggregate(rows),forecast:rs.forecast,realizedForecast:realized,reason:rs.reason,weights:[...rs.weights],factorWeights:[...rs.factorWeights],reward:{points:badges.length*20,badges},synthetic:true});s.phase=s.round===s.config.rounds?'complete':'review';
    if(rs.cycleJudgment!==undefined)Object.assign(s.results.at(-1),{cycleAtDecision:rs.cycleAtDecision,cycleJudgment:rs.cycleJudgment,counterEvidence:rs.counterEvidence||''});
    if(s.version===STUDIO_VERSION)Object.assign(s.results.at(-1),{decisionPolicy:rs.decisionPolicy,evidenceRefs:[...rs.evidenceRefs],falsifierIf:rs.falsifierIf});
  }
  function reduce(s,a,options){
    if(!s||s.version!==VERSION)fail('invalidSave');return applyAction(s,a,'legacy',options?.optionalNotes===true);
  }
  function applyAction(s,a,decisionPolicy,optionalNotes=false){
    if(!s||![VERSION,STUDIO_VERSION].includes(s.version)||!a||typeof a!=='object')fail('invalidSave');if(s.commands.length>=4000)fail('invalidSave');
    const n=clone(s);let command;
    if(a.type==='lock'){
      const gate=decisionPolicy==='studio'?evaluateDecisionGate(s,a,optionalNotes):null;if(gate&&!gate.canConfirm)fail(gate.error);
      if(s.phase!=='decision')fail('invalidPhase');const p=preview(s,a.weights);if(!p.ok)fail(p.error);if(!validFactors(a.factorWeights))fail('invalidFactors');const reason=optionalNotes&&a.reason===undefined?'':a.reason;if(typeof reason!=='string'||reason.length>500||!optionalNotes&&!reason.trim())fail('invalidReason');if(!['up','flat','down'].includes(a.forecast))fail('invalidForecast');
      if(a.cycleJudgment!==undefined&&!['expansion','overheating','stagflation','recession','recovery','insufficient'].includes(a.cycleJudgment))fail('invalidCycleJudgment');
      if(a.counterEvidence!==undefined&&(typeof a.counterEvidence!=='string'||a.counterEvidence.length>500))fail('invalidCounterEvidence');
      n.roundState={startDay:s.day,before:s.nav,benchmarkBefore:s.benchmarkNav,anchorBefore:s.anchorNav,counterfactualUnits:[...s.units],counterfactualCash:s.cash,weights:[...a.weights],factorWeights:[...a.factorWeights],reason:reason.trim(),forecast:a.forecast,cycleAtDecision:s.macro.cycle,...(a.cycleJudgment!==undefined?{cycleJudgment:a.cycleJudgment}:{}),...(a.counterEvidence!==undefined?{counterEvidence:a.counterEvidence.trim()}:{})};
      n.units=a.weights.slice(0,5).map((w,i)=>p.after*w/n.prices[i]);n.cash=p.cash;n.factorWeights=[...a.factorWeights];n.pendingCost=p.fee;n.transactions.push({day:s.day,round:s.round,beforeNav:s.nav,afterNav:p.after,fee:p.fee,buys:p.buys,sells:p.sells,buyRate:s.config.buyRate,sellRate:s.config.sellRate,weights:[...a.weights]});updateWeights(n);n.phase='simulating';command={type:'lock',weights:[...a.weights],factorWeights:[...a.factorWeights],reason:reason.trim(),forecast:a.forecast,...(a.cycleJudgment!==undefined?{cycleJudgment:a.cycleJudgment}:{}),...(a.counterEvidence!==undefined?{counterEvidence:a.counterEvidence.trim()}:{})};
      if(s.version===STUDIO_VERSION){Object.assign(n.roundState,{decisionPolicy,evidenceRefs:gate?[...gate.evidenceRefs]:[],falsifierIf:gate?gate.falsifierIf:''});if(gate)Object.assign(command,{evidenceRefs:[...gate.evidenceRefs],falsifierIf:gate.falsifierIf});}
    }else if(a.type==='advance'){
      if(s.phase!=='simulating')fail('invalidPhase');if(!Number.isInteger(a.days)||a.days<1||a.days>720)fail('invalidDays');for(let d=0;d<a.days&&n.phase==='simulating';d++)daily(n);command={type:'advance',days:a.days};
    }else if(a.type==='resume'){
      if(s.phase!=='event')fail('invalidPhase');n.phase='simulating';if(n.day===n.round*n.daysPerRound)settleRound(n);command={type:'resume'};
    }else if(a.type==='next'){
      if(s.phase!=='review'||s.round>=s.config.rounds)fail('invalidPhase');n.round++;n.phase='decision';n.roundState=null;command={type:'next'};
    }else if(a.type==='read'){
      const ids=['E1','E2','E3',...s.events.map(e=>e.id)];if(!ids.includes(a.id))fail('unknownEvidence');if(s.seen.includes(a.id))return s;n.seen.push(a.id);command={type:'read',id:a.id};
    }else fail('invalidAction');n.commands.push(command);return n;
  }
  function serialize(s){return {version:VERSION,seed:s.seed,scenario:s.scenario,config:clone(s.config),commands:clone(s.commands)};}
  function restore(raw,options){
    let save;try{save=typeof raw==='string'?JSON.parse(raw):raw;}catch(_){fail('invalidSave');}
    if(!save||save.version!==VERSION||!Array.isArray(save.commands)||save.commands.length>4000)fail('invalidSave');let state=initial({seed:save.seed,scenario:save.scenario,config:save.config});for(const a of save.commands)state=reduce(state,a,options);return state;
  }
  function metrics(s){
    const rows=s.history.slice(1),dailyReturns=rows.map(h=>h.nav/h.beforeNav-1),excess=dailyReturns.map((r,i)=>r-rows[i].cashRate),n=rows.length,mean=n?sum(dailyReturns)/n:0,excessMean=n?sum(excess)/n:0;
    const variance=n>1?sum(dailyReturns.map(v=>(v-mean)**2))/(n-1):null,excessVariance=n>1?sum(excess.map(v=>(v-excessMean)**2))/(n-1):null;
    let peak=100000,maxDrawDown=0;for(const nav of [...s.history.map(h=>h.nav),s.nav]){peak=Math.max(peak,nav);maxDrawDown=Math.max(maxDrawDown,1-nav/peak);}
    return {returnValue:s.nav/100000-1,volatility:variance===null?null:Math.sqrt(variance*252),sharpe:excessVariance===null||excessVariance<1e-20?null:excessMean/Math.sqrt(excessVariance)*Math.sqrt(252),maxDrawdown:maxDrawDown,diversification:1-sum(s.weights.map(w=>w*w)),excessReturn:(s.nav-s.benchmarkNav)/100000,tacticalAmount:s.nav-s.anchorNav,observations:n,annualization:252,rf:'known-daily-policy-rate',attribution:aggregate(rows)};
  }
  const visibleMacro=macro=>{const out=clone(macro||{});delete out.cycle;return out;};
  const visibleHistory=rows=>clone(rows).map(row=>({...row,macro:visibleMacro(row?.macro)}));
  function publicView(s){
    const result={version:s.version,synthetic:true,phase:s.phase,day:s.day,round:s.round,rounds:s.config.rounds,daysPerRound:s.daysPerRound,macro:visibleMacro(s.macro),prices:[...s.prices],units:[...s.units],cash:s.cash,nav:s.nav,benchmarkNav:s.benchmarkNav,anchorNav:s.anchorNav,weights:[...s.weights],factorWeights:[...s.factorWeights],history:visibleHistory(s.history),results:clone(s.results),events:clone(s.events),seen:[...s.seen],metrics:metrics(s),evidence:['E1','E2','E3'].map(id=>({id,titleKey:`evidence.${id}.title`,bodyKey:`evidence.${id}.body`}))};return result;
  }
  function coachContext(s,lang='zh-CN'){
    const language=lang==='en'?'en':'zh-CN',t=TEXTS[language],v=publicView(s);
    return {version:VERSION,synthetic:true,language,phase:v.phase,day:v.day,round:v.round,model:t['model.note'],benchmark:t['model.benchmark'],riskDefinition:t['model.risk'],macro:{id:`MACRO-D${s.day}`,...v.macro},portfolio:{id:`PORTFOLIO-D${s.day}`,nav:v.nav,cash:v.cash,weights:v.weights,sectors:SECTORS.map(k=>t[`sector.${k}`]),factorWeights:v.factorWeights,factorNames:FACTOR_NAMES.map(k=>t[`factor.${k}`])},metrics:{id:`METRICS-D${s.day}`,...v.metrics},evidence:v.evidence.map(e=>({id:e.id,title:t[e.titleKey],body:t[e.bodyKey]})),events:v.events.map(e=>({id:e.id,title:t[e.titleKey],body:t[e.bodyKey],startDay:e.startDay,status:e.status})),results:v.results.map(r=>({id:r.id,round:r.round,returnValue:r.returnValue,benchmarkReturn:r.benchmarkReturn,tacticalAmount:r.tacticalAmount,forecast:r.forecast,realizedForecast:r.realizedForecast,reason:r.reason})),recentHistory:v.history.slice(-6).map(h=>({day:h.day,nav:h.nav,macro:h.macro,sectorReturns:h.sectorReturns}))};
  }
  function sampleReply(s,question='',lang='zh-CN'){
    const t=TEXTS[lang==='en'?'en':'zh-CN'],review=['review','complete'].includes(s.phase),key=review?'coach.review':/risk|drawdown|cash|风险|回撤|现金/i.test(question)?'coach.risk':'coach.macro';
    const references=[`MACRO-D${s.day}`,`PORTFOLIO-D${s.day}`];if(review&&s.results.length)references.push(s.results.at(-1).id);else if(s.events.length)references.push(s.events.at(-1).id);
    return {mode:'example',summary:t[key],detail:`${t['coach.detail']} ${t['coach.synthetic']}`,references};
  }
  function evaluateDecisionGate(s,draft,optionalNotes=false){
    const result={status:'blocked',canConfirm:false,recordComplete:false,error:null,evidenceRefs:[],falsifierIf:''};
    const blocked=error=>({...result,error});
    if(!s||s.phase!=='decision')return blocked('invalidPhase');
    if(!draft||typeof draft!=='object'||Array.isArray(draft))return blocked('invalidWeights');
    const refs=draft.evidenceRefs===undefined?[]:draft.evidenceRefs,available=['E1','E2','E3',...s.events.map(e=>e.id)];
    const refsValid=Array.isArray(refs)&&refs.length<=9&&Array.from(refs).every(id=>typeof id==='string'&&id.length>0&&id.length<=64&&available.includes(id));
    if(refsValid)result.evidenceRefs=[...new Set(refs)];
    const falsifier=draft.falsifierIf===undefined?'':draft.falsifierIf,falsifierValid=typeof falsifier==='string'&&falsifier.length<=500;
    if(falsifierValid)result.falsifierIf=falsifier.trim();
    const cycleJudgment=draft.cycleJudgment===undefined?null:draft.cycleJudgment,cycleValid=cycleJudgment===null||['expansion','overheating','stagflation','recession','recovery','insufficient'].includes(cycleJudgment);
    if(!cycleValid)return blocked('invalidCycleJudgment');
    const counterEvidence=draft.counterEvidence===undefined?'':draft.counterEvidence;
    if(typeof counterEvidence!=='string'||counterEvidence.length>500)return blocked('invalidCounterEvidence');
    if(draft.cycleJudgment!==undefined)result.cycleJudgment=cycleJudgment;if(draft.counterEvidence!==undefined)result.counterEvidence=counterEvidence.trim();
    const weightError=validWeights(draft.weights);if(weightError)return blocked(weightError);
    if(Array.from(draft.weights).some(w=>!Number.isFinite(w)))return blocked('invalidWeights');
    if(!validFactors(draft.factorWeights)||Array.from(draft.factorWeights).some(w=>!Number.isFinite(w)))return blocked('invalidFactors');
    const reason=optionalNotes&&draft.reason===undefined?'':draft.reason;
    if(typeof reason!=='string'||reason.length>500||!optionalNotes&&!reason.trim())return blocked('invalidReason');
    if(!['up','flat','down'].includes(draft.forecast))return blocked('invalidForecast');
    if(!refsValid)return blocked('invalidEvidenceRefs');
    if(!falsifierValid)return blocked('invalidFalsifier');
    if(!optionalNotes&&!result.evidenceRefs.length)return {...result,status:'need_evidence',error:'evidenceRequired'};
    result.recordComplete=!!result.evidenceRefs.length&&!!result.falsifierIf;
    return {...result,status:optionalNotes||result.recordComplete?'ready':'need_falsifier',canConfirm:true};
  }
  function studioInitial(options){return {...initial(options),version:STUDIO_VERSION,policyBoundary:0};}
  function studioReduce(s,a,optionalNotes){
    if(!s||s.version!==STUDIO_VERSION||!Number.isInteger(s.policyBoundary)||s.policyBoundary<0||s.policyBoundary>s.commands.length)fail('invalidSave');
    return applyAction(s,a,'studio',optionalNotes);
  }
  function studioSerialize(s){
    if(!s||s.version!==STUDIO_VERSION||!Number.isInteger(s.policyBoundary)||s.policyBoundary<0||s.policyBoundary>s.commands.length)fail('invalidSave');
    return {...serialize(s),version:STUDIO_VERSION,policyBoundary:s.policyBoundary};
  }
  function studioRestore(raw,optionalNotes){
    let save;try{save=typeof raw==='string'?JSON.parse(raw):raw;}catch(_){fail('invalidSave');}
    if(!save||![VERSION,STUDIO_VERSION].includes(save.version)||!Array.isArray(save.commands)||save.commands.length>4000)fail('invalidSave');
    const boundary=save.version===VERSION?save.commands.length:save.policyBoundary;
    if(!Number.isInteger(boundary)||boundary<0||boundary>save.commands.length)fail('invalidSave');
    let state=studioInitial({seed:save.seed,scenario:save.scenario,config:save.config});
    for(let i=0;i<save.commands.length;i++){
      const next=applyAction(state,save.commands[i],i<boundary?'legacy':'studio',optionalNotes);
      state=next===state?{...state,commands:[...state.commands,{type:'read',id:save.commands[i].id}]}:next;
    }
    state.policyBoundary=boundary;return state;
  }
  function decisionRecord(record){
    if(!record)return null;return {decisionPolicy:record.decisionPolicy,weights:[...record.weights],factorWeights:[...record.factorWeights],reason:record.reason,forecast:record.forecast,evidenceRefs:[...record.evidenceRefs],falsifierIf:record.falsifierIf,...(record.cycleJudgment!==undefined?{cycleAtDecision:record.cycleAtDecision,cycleJudgment:record.cycleJudgment,counterEvidence:record.counterEvidence||''}:{})};
  }
  function studioPublicView(s){return {...publicView(s),roundState:decisionRecord(s.roundState)};}
  function studioCoachContext(s,lang='zh-CN',draft,optionalNotes){
    const context=coachContext(s,lang),gate=draft===undefined?null:evaluateDecisionGate(s,draft,optionalNotes);
    context.version=STUDIO_VERSION;context.decision=decisionRecord(s.roundState);context.decisionGate=gate;
    if(draft!==undefined)context.decision={decisionPolicy:'studio',weights:Array.isArray(draft?.weights)?[...draft.weights]:[],factorWeights:Array.isArray(draft?.factorWeights)?[...draft.factorWeights]:[],reason:typeof draft?.reason==='string'?draft.reason.slice(0,500):'',forecast:['up','flat','down'].includes(draft?.forecast)?draft.forecast:null,evidenceRefs:[...gate.evidenceRefs],falsifierIf:gate.falsifierIf,cycleJudgment:['expansion','overheating','stagflation','recession','recovery','insufficient'].includes(draft?.cycleJudgment)?draft.cycleJudgment:null,counterEvidence:typeof draft?.counterEvidence==='string'?draft.counterEvidence.slice(0,500):''};
    if(context.decision&&!['review','complete'].includes(s.phase)){delete context.decision.cycleAtDecision;delete context.decision.cycleJudgment;delete context.decision.counterEvidence;}
    context.results=context.results.map((r,i)=>({...r,decisionPolicy:s.results[i].decisionPolicy,evidenceRefs:[...s.results[i].evidenceRefs],falsifierIf:s.results[i].falsifierIf,cycleAtDecision:s.results[i].cycleAtDecision,cycleJudgment:s.results[i].cycleJudgment,counterEvidence:s.results[i].counterEvidence}));return context;
  }
  function createResearchStudioEngine({optionalNotes=false}={}){
    const texts=clone(TEXTS);texts['zh-CN']['badge.recordComplete']='决策记录完整';texts.en['badge.recordComplete']='Decision record complete';
    return {...api,VERSION:STUDIO_VERSION,TEXTS:texts,initial:studioInitial,reduce:(s,a)=>studioReduce(s,a,optionalNotes),serialize:studioSerialize,restore:raw=>studioRestore(raw,optionalNotes),publicView:studioPublicView,coachContext:(s,lang,draft)=>studioCoachContext(s,lang,draft,optionalNotes),evaluateDecisionGate:(s,draft)=>evaluateDecisionGate(s,draft,optionalNotes)};
  }
  const cycleSignal=m=>m.growth<.5?(m.inflation>3.5?'stagflation':'recession'):m.growth>3.6&&m.inflation>3.3?'overheating':m.growth<2.2?'recovery':'expansion';
  const api={cycleSignal,VERSION,SECTORS,FACTOR_NAMES,INITIAL_WEIGHTS,EXPOSURES,BETAS,DEFAULT_CONFIG,TEXTS,initial,reduce,serialize,restore,publicView,coachContext,sampleReply,recommend,metrics,preview,createResearchStudioEngine};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactorLabSimulation=api;
})(typeof window==='undefined'?globalThis:window);

;
(function(root){
  'use strict';
  const VERSION='factorlab-securities-v3.0.0',SCHEMA=1,BASKET_VERSION='teaching-baskets-20261030.1';
  const SECTORS=['semiconductor','robotics','materials','energy','digital'];
  const entries=[
    ['SIM-SEMI-A',0,.4,80,'教学芯片设计 A','Teaching chip design A'],['SIM-SEMI-B',0,.3,60,'教学晶圆设备 B','Teaching wafer equipment B'],['SIM-SEMI-C',0,.3,40,'教学封测 C','Teaching packaging C'],
    ['SIM-ROBO-A',1,.6,50,'教学工业机器人 A','Teaching industrial robotics A'],['SIM-ROBO-B',1,.4,25,'教学自动化控制 B','Teaching automation B'],
    ['SIM-MAT-A',2,.5,30,'教学先进合金 A','Teaching advanced alloys A'],['SIM-MAT-B',2,.5,75,'教学电子材料 B','Teaching electronic materials B'],
    ['SIM-ENERGY-A',3,.55,45,'教学电力装备 A','Teaching power equipment A'],['SIM-ENERGY-B',3,.45,20,'教学储能设备 B','Teaching storage equipment B'],
    ['SIM-AI-A',4,.65,100,'教学算力设备 A','Teaching compute equipment A'],['SIM-AI-B',4,.35,35,'教学数据网络 B','Teaching data networks B']
  ];
  const INSTRUMENTS=entries.map(([id,sectorIndex,weight,initialPrice,zh,en])=>({id,symbol:id,sectorIndex,sectorId:SECTORS[sectorIndex],weight,initialPrice,name:{'zh-CN':zh,en},currency:'USD',type:'teaching-stock',dataMode:'synthetic',source:'FactorLab authored teaching issuer; not a listed security',sourceUrl:null}));
  const BASKETS=SECTORS.map((sectorId,i)=>({id:sectorId,version:BASKET_VERSION,dataMode:'synthetic',components:INSTRUMENTS.filter(x=>x.sectorIndex===i).map(x=>({instrumentId:x.id,weight:x.weight})),isETF:false}));
  const clone=x=>JSON.parse(JSON.stringify(x)),sum=xs=>xs.reduce((a,b)=>a+b,0),money=x=>Math.round(x*1e6)/1e6,shares=x=>Math.floor((x+1e-12)*1e6)/1e6;
  const fail=x=>{throw Error(x);};
  const asOf=day=>new Date(Date.UTC(2024,0,2+day,16)).toISOString();
  const time=(day,minutes)=>new Date(Date.parse(asOf(day))+minutes*60000).toISOString();
  const attribution=()=>({market:0,factors:[0,0,0,0],sector:0,event:0,idiosyncratic:0,cash:0,cost:0});
  const zeroContributions=()=>Object.fromEntries(INSTRUMENTS.map(x=>[x.id,0]));
  function hash(value){let h=2166136261;for(const c of JSON.stringify(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
  function weightError(w){return !Array.isArray(w)||w.length!==6||Array.from(w).some(v=>!Number.isFinite(v)||v<0||v>1)||Math.abs(sum(w)-1)>1e-9?'invalidWeights':w.slice(0,5).some(v=>v>.4+1e-10)?'sectorCap':null;}
  function refresh(ledger){
    ledger.asOf=asOf(ledger.day);ledger.invested=money(sum(ledger.holdings.map(h=>money(h.quantity*h.price))));ledger.nav=money(ledger.cash+ledger.invested);
    for(const h of ledger.holdings){h.marketValue=money(h.quantity*h.price);h.weight=h.marketValue/ledger.nav;h.priceTime=ledger.asOf;}
    ledger.snapshotId='P-'+hash([ledger.day,ledger.revision,ledger.cash,ledger.holdings.map(h=>[h.id,h.price,h.quantity])]);
    return ledger;
  }
  function snapshotRow(ledger,extra={}){return {day:ledger.day,asOf:ledger.asOf,nav:ledger.nav,cash:ledger.cash,beforeNav:ledger.nav,prices:Object.fromEntries(ledger.holdings.map(h=>[h.id,h.price])),quantities:Object.fromEntries(ledger.holdings.map(h=>[h.id,h.quantity])),contributions:zeroContributions(),cashContribution:0,fee:0,...extra};}
  function createLedger(weights){
    const holdings=INSTRUMENTS.map(x=>({...clone(x),quantity:shares(100000*weights[x.sectorIndex]*x.weight/x.initialPrice),price:x.initialPrice}));
    const ledger=refresh({schema:SCHEMA,engineVersion:VERSION,basketVersion:BASKET_VERSION,currency:'USD',dataMode:'synthetic',day:0,revision:0,cash:money(100000-sum(holdings.map(h=>money(h.quantity*h.price)))),holdings,baskets:clone(BASKETS),transactions:[],history:[],pendingFee:0,totalFees:0,buyRate:.0013,sellRate:.0018,precision:{moneyDecimals:6,shareDecimals:6,priceDecimals:6,displayDecimals:2},priceBasis:'synthetic-raw-no-splits-no-dividends',executionRule:'synthetic fixed quote at 16:02 UTC, after 16:00 signal and 16:01 decision; calendar-day teaching steps, not a real exchange calendar'});
    ledger.history.push(snapshotRow(ledger));return ledger;
  }
  function simulateAllocation(view,weights){
    const ledger=view.ledger||view,error=weightError(weights);if(error)return {ok:false,error};if(!ledger?.holdings)return {ok:false,error:'legacyLedger'};
    const calculate=capital=>{
      const rows=ledger.holdings.map(h=>{const targetWeight=weights[h.sectorIndex]*h.weightInBasket,quantity=targetWeight===0?0:Math.abs(capital*targetWeight-h.marketValue)<=h.price*1.0001e-6?h.quantity:shares(capital*targetWeight/h.price),targetAmount=money(quantity*h.price),deltaQuantity=money(quantity-h.quantity),delta=money(deltaQuantity*h.price),fee=money(Math.abs(delta)*(delta>=0?ledger.buyRate:ledger.sellRate));return {instrumentId:h.id,id:h.id,symbol:h.symbol,name:clone(h.name),sectorId:h.sectorId,sectorIndex:h.sectorIndex,type:h.type,currency:h.currency,targetWeight,requestedAmount:money(ledger.nav*targetWeight),targetAmount,quantity,price:h.price,priceTime:h.priceTime,currentQuantity:h.quantity,currentAmount:h.marketValue,deltaQuantity,delta,fee};});
      const buys=money(sum(rows.map(r=>Math.max(0,r.delta)))),sells=money(sum(rows.map(r=>Math.max(0,-r.delta)))),fee=money(sum(rows.map(r=>r.fee))),cash=money(ledger.cash+sells-buys-fee);return {rows,buys,sells,fee,cash,after:money(cash+sum(rows.map(r=>r.targetAmount)))};
    };
    let lo=0,hi=ledger.nav;for(let i=0;i<60;i++){const mid=(lo+hi)/2,p=calculate(mid);if(p.cash<0||mid+p.fee>ledger.nav)hi=mid;else lo=mid;}
    const p=calculate(lo);return {ok:true,...p,weights:[...weights],turnover:(p.buys+p.sells)/ledger.nav,revision:ledger.revision,snapshotId:ledger.snapshotId,basketVersion:BASKET_VERSION,signalTime:ledger.asOf,decisionTime:time(ledger.day,1),executionTime:time(ledger.day,2),assumptions:{currency:'USD',fractionalShares:6,synthetic:true,buyRate:ledger.buyRate,sellRate:ledger.sellRate}};
  }
  function createEngine(base){
    const legacy=base.createResearchStudioEngine({optionalNotes:true});
    function old(s){return s?.version!==VERSION;}
    function oldEngine(s){return s.version===base.VERSION?base:legacy;}
    function initial(options){
      const market=legacy.initial(options),ledger=createLedger(market.weights);ledger.buyRate=market.config.buyRate;ledger.sellRate=market.config.sellRate;
      for(const h of ledger.holdings)h.weightInBasket=INSTRUMENTS.find(x=>x.id===h.id).weight;
      const s={...clone(market),version:VERSION,_market:market,ledger,commands:[],results:[],transactions:[],seen:[],roundState:null,anchorHoldings:ledger.holdings.map(h=>h.quantity),anchorCash:ledger.cash,benchmarkNav:100000,anchorNav:100000};
      s.history=[{...clone(market.history[0]),nav:ledger.nav,cashBefore:ledger.cash,securityContributions:zeroContributions()}];return sync(s);
    }
    function sync(s){
      const l=refresh(s.ledger);s.nav=l.nav;s.cash=l.cash;s.day=s._market.day;s.round=s._market.round;s.phase=s._market.phase;s.macro=clone(s._market.macro);s.events=clone(s._market.events);s.prices=[...s._market.prices];
      const sectors=SECTORS.map((_,i)=>money(sum(l.holdings.filter(h=>h.sectorIndex===i).map(h=>h.marketValue))));s.units=sectors.map((x,i)=>x/s.prices[i]);s.weights=[...sectors.map(x=>x/l.nav),l.cash/l.nav];s.transactions=clone(l.transactions);return s;
    }
    function publicView(s){
      if(old(s))return {...oldEngine(s).publicView(s),legacy:true,ledger:null};
      const v=legacy.publicView({...s,version:legacy.VERSION});v.version=VERSION;v.legacy=false;v.ledger=clone(s.ledger);v.ledger.unpostedFee=v.ledger.pendingFee;delete v.ledger.pendingFee;v.asOf=s.ledger.asOf;v.decisionTime=time(s.day,1);v.snapshotId=s.ledger.snapshotId;v.revision=s.ledger.revision;v.transactions=clone(s.ledger.transactions);v.metrics=metrics(s);return v;
    }
    function evidenceAPI(){return root.FactorLabEvidence||(typeof require==='function'?(()=>{try{return require('./evidence-data.js');}catch{return null;}})():null);}
    function evaluateDecisionGate(s,draft){
      if(old(s))return legacy.evaluateDecisionGate(s,draft);
      const original=draft?.evidenceRefs===undefined?[]:draft.evidenceRefs;
      const gate=legacy.evaluateDecisionGate(s._market,{...draft,evidenceRefs:[]});
      if(!Array.isArray(original)||original.length>24||original.some(ref=>typeof ref!=='string'||ref.length>120))return {...gate,canConfirm:false,error:'invalidEvidenceRefs'};
      const available=[],api=evidenceAPI(),view=api?publicView(s):null;
      if(original.some(id=>!available.includes(id)&&!api?.validateReference(view,id)))return {...gate,canConfirm:false,error:'invalidEvidenceRefs'};
      if(draft?.evidenceSelections!==undefined){if(!Array.isArray(draft.evidenceSelections)||draft.evidenceSelections.length>24||draft.evidenceSelections.some(ref=>!api?.validateReference(view,ref)))return {...gate,canConfirm:false,error:'invalidEvidenceRefs'};}
      return {...gate,status:gate.canConfirm?'ready':gate.status,recordComplete:gate.canConfirm&&!!original.length&&!!gate.falsifierIf,evidenceRefs:[...new Set(original)]};
    }
    function preview(s,weights=s.weights){return old(s)?oldEngine(s).preview(s,weights):simulateAllocation(s,weights);}
    function settle(s){
      if(s.results.some(r=>r.round===s.round))return;
      const r=s.roundState,l=s.ledger,rows=l.history.filter(h=>h.day>r.startDay),securityContributions=zeroContributions();for(const h of rows)for(const id of Object.keys(securityContributions))securityContributions[id]=money(securityContributions[id]+h.contributions[id]);
      const cashContribution=money(sum(rows.map(h=>h.cashContribution))),fee=money(sum(rows.map(h=>h.fee))),benchmarkReturn=s.benchmarkNav/r.benchmarkBefore-1,recordComplete=!!r.evidenceRefs.length&&!!r.falsifierIf.trim(),counterfactualNav=money(r.counterfactualCash+sum(l.holdings.map((h,i)=>r.counterfactualQuantities[i]*h.price))),a=attribution();a.sector=money(sum(Object.values(securityContributions)));a.cash=cashContribution;a.cost=-fee;
      s.results.push({id:`RESULT-R${s.round}`,round:s.round,day:s.day,before:r.before,after:s.nav,returnValue:s.nav/r.before-1,benchmarkReturn,anchorReturn:s.anchorNav/r.anchorBefore-1,counterfactualNav,tacticalAmount:s.nav-counterfactualNav,anchorNav:s.anchorNav,attribution:a,securityContributions,cashContribution,fee,forecast:r.forecast,realizedForecast:benchmarkReturn>.01?'up':benchmarkReturn<-.01?'down':'flat',reason:r.reason,weights:[...r.weights],factorWeights:[...r.factorWeights],reward:{points:recordComplete?20:0,badges:recordComplete?['badge.recordComplete']:[]},decisionPolicy:'securities',evidenceRefs:clone(r.evidenceRefs),evidenceSelections:clone(r.evidenceSelections),falsifierIf:r.falsifierIf,...(r.cycleJudgment!==undefined?{cycleAtDecision:r.cycleAtDecision,cycleJudgment:r.cycleJudgment,counterEvidence:r.counterEvidence||''}:{}),synthetic:true,attributionKind:'accounting-not-causal'});
    }
    function markDay(s){
      const l=s.ledger,m=s._market.history.at(-1),beforeNav=s.history.at(-1).nav,cashBefore=l.cash,priorPrices=l.holdings.map(h=>h.price),contributions=zeroContributions(),fee=l.pendingFee;
      const sectorReturns=SECTORS.map(()=>0);
      l.holdings.forEach((h,i)=>{const individual=.0012*Math.sin((s._market.day+i*11+s.seed%97)*.73)*(i%2?1:-1),change=m.sectorReturns[h.sectorIndex]+individual;h.price=money(Math.max(.01,h.price*(1+change)));contributions[h.id]=money(h.quantity*(h.price-priorPrices[i]));sectorReturns[h.sectorIndex]+=h.weightInBasket*(h.price/priorPrices[i]-1);});
      const cashInterest=money(cashBefore*m.cashRate);l.cash=money(l.cash+cashInterest);l.pendingFee=0;l.day=s._market.day;l.revision++;refresh(l);s.anchorCash=money(s.anchorCash*(1+m.cashRate));s.roundState.counterfactualCash=money(s.roundState.counterfactualCash*(1+m.cashRate));s.anchorNav=money(s.anchorCash+sum(l.holdings.map((h,i)=>h.price*s.anchorHoldings[i])));s.benchmarkNav=money(s.benchmarkNav*(1+sum(sectorReturns)/5));
      const cashContribution=money(l.nav-beforeNav-sum(Object.values(contributions))+fee),a=attribution();a.sector=money(sum(Object.values(contributions)));a.cash=cashContribution;a.cost=-fee;
      l.history.push(snapshotRow(l,{beforeNav,contributions,cashContribution,interest:cashInterest,roundingAdjustment:money(cashContribution-cashInterest),fee}));
      s.history.push({...clone(m),nav:l.nav,beforeNav,benchmarkNav:s.benchmarkNav,anchorNav:s.anchorNav,cashBefore,holdingsBefore:SECTORS.map((_,j)=>money(sum(l.holdings.map((h,i)=>h.sectorIndex===j?h.quantity*priorPrices[i]:0)))),attribution:a,securityContributions:clone(contributions),sectorReturns,contributionReturns:[]});sync(s);
      if(['review','complete'].includes(s.phase))settle(s);
    }
    function reduce(s,a){
      if(old(s))return oldEngine(s).reduce(s,a,{optionalNotes:true});if(!a||typeof a!=='object'||s.commands.length>=4000)fail('invalidAction');
      const fields={lock:['type','weights','factorWeights','reason','forecast','evidenceRefs','evidenceSelections','falsifierIf','cycleJudgment','counterEvidence','revision','snapshotId','transactionId'],advance:['type','days'],read:['type','id'],resume:['type'],next:['type']}[a.type];
      if(!fields)fail('invalidAction');
      const command=Object.fromEntries(fields.filter(k=>a[k]!==undefined).map(k=>[k,clone(a[k])])),n=clone(s);
      if(a.type==='lock'&&a.transactionId){const tx=s.ledger.transactions.find(t=>t.id===a.transactionId);if(tx){if(tx.requestHash!==hash(command))fail('transactionConflict');return s;}}
      if(a.type==='lock'){
        const gate=evaluateDecisionGate(s,a);if(!gate.canConfirm)fail(gate.error);const p=preview(s,a.weights);if(!p.ok)fail(p.error);
        if(a.revision!==undefined&&a.revision!==p.revision||a.snapshotId!==undefined&&a.snapshotId!==p.snapshotId)fail('staleSnapshot');
        if(a.transactionId!==undefined&&(typeof a.transactionId!=='string'||a.transactionId.length>120||!a.transactionId))fail('invalidTransaction');
        n.roundState={startDay:s.day,before:s.nav,benchmarkBefore:s.benchmarkNav,anchorBefore:s.anchorNav,counterfactualQuantities:s.ledger.holdings.map(h=>h.quantity),counterfactualCash:s.cash,weights:[...a.weights],factorWeights:[...a.factorWeights],reason:typeof a.reason==='string'?a.reason.trim():'',forecast:a.forecast,decisionPolicy:'securities',evidenceRefs:gate.evidenceRefs,evidenceSelections:(a.evidenceSelections||[]).map(ref=>evidenceAPI().resolveReference(publicView(s),ref)),falsifierIf:gate.falsifierIf,cycleAtDecision:s.macro.cycle,...(a.cycleJudgment!==undefined?{cycleJudgment:a.cycleJudgment}:{}),...(a.counterEvidence!==undefined?{counterEvidence:a.counterEvidence.trim()}:{})};
        n._market=legacy.reduce(n._market,{...a,reason:n.roundState.reason||'allocation',evidenceRefs:['E1']});n.factorWeights=[...a.factorWeights];n.ledger.holdings.forEach((h,i)=>h.quantity=p.rows[i].quantity);n.ledger.cash=p.cash;n.ledger.pendingFee=p.fee;n.ledger.totalFees=money(n.ledger.totalFees+p.fee);n.ledger.revision++;
        n.ledger.transactions.push({id:a.transactionId||`TX-R${s.round}`,requestHash:hash(command),day:s.day,round:s.round,beforeNav:s.nav,afterNav:p.after,fee:p.fee,buys:p.buys,sells:p.sells,cashBefore:s.cash,cashAfter:p.cash,rows:p.rows,weights:[...a.weights],buyRate:n.ledger.buyRate,sellRate:n.ledger.sellRate,snapshotId:p.snapshotId,revision:p.revision,signalTime:p.signalTime,decisionTime:p.decisionTime,executionTime:p.executionTime});sync(n);
      }else if(a.type==='advance'){
        if(s.phase!=='simulating')fail('invalidPhase');if(!Number.isInteger(a.days)||a.days<1||a.days>720)fail('invalidDays');
        for(let i=0;i<a.days&&n.phase==='simulating';i++){n._market=legacy.reduce(n._market,{type:'advance',days:1});markDay(n);}
      }else if(a.type==='resume'){
        n._market=legacy.reduce(n._market,a);sync(n);if(['review','complete'].includes(n.phase))settle(n);
      }else if(a.type==='next'){
        n._market=legacy.reduce(n._market,a);n.roundState=null;sync(n);
      }else if(a.type==='read'){
        const api=evidenceAPI();if(!['E1','E2','E3',...s.events.map(x=>x.id)].includes(a.id)&&!api?.validateReference(publicView(s),a.id))fail('unknownEvidence');if(n.seen.includes(a.id))return s;n.seen.push(a.id);
      }else fail('invalidAction');
      n.commands.push(command);return n;
    }
    function serialize(s){if(old(s))return oldEngine(s).serialize(s);return {version:VERSION,schema:SCHEMA,basketVersion:BASKET_VERSION,seed:s.seed,scenario:s.scenario,config:clone(s.config),commands:clone(s.commands)};}
    function restore(raw){let save;try{save=typeof raw==='string'?JSON.parse(raw):raw;}catch{fail('invalidSave');}if(!save||typeof save!=='object')fail('invalidSave');if(save.version!==VERSION){if(![base.VERSION,legacy.VERSION].includes(save.version))fail('invalidSave');return oldEngine(save).restore(save,{optionalNotes:true});}if(save.schema!==SCHEMA||save.basketVersion!==BASKET_VERSION||!Array.isArray(save.commands)||save.commands.length>4000)fail('invalidSave');let s=initial({seed:save.seed,scenario:save.scenario,config:save.config});for(const a of save.commands)s=reduce(s,a);return s;}
    function metrics(s){if(old(s))return oldEngine(s).metrics(s);const result=base.metrics(s);result.attribution.cost=money(result.attribution.cost-s.ledger.pendingFee);return {...result,attributionKind:'accounting-not-causal'};}
    function coachContext(s,lang='zh-CN',draft){
      if(old(s))return oldEngine(s).coachContext(s,lang,draft);const v=publicView(s),en=lang==='en',context=legacy.coachContext({...s,version:legacy.VERSION},lang);context.riskDefinition=en?'Risk uses one synthetic calendar step per return and an illustrative 252-step annualization, not an observed exchange-day statistic. Fees are included; insufficient samples remain undefined.':'每个合成日步计算一次收益，252步年化是教学假设，不是真实交易日统计；计入费用，样本不足留空。';context.version=VERSION;context.asOf=v.asOf;context.decisionTime=v.decisionTime;context.portfolio={...context.portfolio,snapshotId:v.snapshotId,revision:v.revision,currency:'USD',holdings:v.ledger.holdings,totalFees:v.ledger.totalFees};context.model=en?'Synthetic security prices and fractional shares. Teaching issuers are fictional; no split or dividend events.':'合成证券价格与小数股；教学公司为虚构，无拆股或分红事件。';context.benchmark=en?'Five teaching sector baskets at 20% each; daily rebalance without fees.':'五个教学行业篮子各20%，每日再平衡、免费用。';context.decision=draft?clone(draft):clone(s.roundState);if(context.decision){delete context.decision.counterfactualQuantities;delete context.decision.counterfactualCash;if(!['review','complete'].includes(s.phase)){delete context.decision.cycleAtDecision;delete context.decision.cycleJudgment;delete context.decision.counterEvidence;}}context.decisionGate=draft?evaluateDecisionGate(s,draft):null;context.recentHistory=v.history.slice(-6).map(h=>({day:h.day,nav:h.nav,macro:h.macro,sectorReturns:h.sectorReturns}));return context;
    }
    const texts=clone(legacy.TEXTS);texts['zh-CN']['model.note']='虚构证券、小数股与合成价格的教学账本；不模拟真实交易所撮合、拆股或分红。';texts.en['model.note']='Teaching ledger with fictional securities, fractional shares and synthetic prices; no real exchange matching, splits or dividends.';
    return {...legacy,VERSION,TEXTS:texts,INSTRUMENTS:clone(INSTRUMENTS),BASKETS:clone(BASKETS),initial,reduce,preview,serialize,restore,publicView,coachContext,metrics,evaluateDecisionGate};
  }
  const api={VERSION,SCHEMA,BASKET_VERSION,INSTRUMENTS:clone(INSTRUMENTS),BASKETS:clone(BASKETS),createEngine,simulateAllocation,asOf};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else{root.FactorLabLedger=api;if(root.FactorLabSimulation)root.FactorLabSimulation.createSecuritiesEngine=()=>createEngine(root.FactorLabSimulation);}
})(typeof window==='undefined'?globalThis:window);

;
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FactorLabEvidence=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION='evidence-1.0', DAY=86400000, BASE=Date.parse('2024-01-02T16:00:00.000Z');
  const SOURCE='https://github.com/zhugeliang7512-eng/factorlab';
  const SOURCES={
    options:'https://www.optionseducation.org/referencelibrary/faq/general-information',
    volatility:'https://www.optionseducation.org/optionsoverview/options-pricing',
    secondary:'https://www.investor.gov/introduction-investing/investing-basics/glossary/secondary-market',
    validation:'https://rpc.cfainstitute.org/research/foundation/2024/investment-model-validation',
    ic:'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html',
    micron:'https://investors.micron.com/news/press-release/2024/Micron-Technology-Inc--Reports-Results-for-the-Second-Quarter-of-Fiscal-2024-03-20-2024/default.aspx'
  };
  const EXPLANATIONS={
    options:{'zh-CN':'OI 是未平仓合约数量，成交量是期间交易数量；每份合约同时有多空双方，OI 增加或 Call 活跃本身不能证明看涨。Bid/Ask 是报价，未保证成交。',en:'Open interest counts outstanding contracts; volume counts contracts traded during a period. Each contract has two sides: rising OI or active calls alone do not establish a bullish outlook. Bid/ask quotes do not guarantee execution.'},
    volatility:{'zh-CN':'IV 是由期权价格及定价模型反推的年化波动率，描述波动幅度而非方向；这里的 IV 是教学假设，不是市场估计。',en:'IV is an annualized volatility inferred from option prices through a pricing model. It concerns movement size, not direction; these IV figures are teaching assumptions, not market estimates.'},
    prices:{'zh-CN':'证券价格、组合资产金额、累计收益和成交额是不同口径。本图仅为教学证券报价；没有供应商资金流数据，不推断净流入。',en:'Security prices, portfolio value, cumulative return and turnover measure different things. This chart shows teaching security quotes only. No provider fund-flow data is available; no net inflow is inferred.'},
    fundamentals:{'zh-CN':'报告期不等于公布时间；只能使用决策时已经可得的数据。下面是虚构公司的教学财务报表，缺失值保留为空，不能当成真实公司估值。',en:'The reporting period is not the publication date. Use only information available at decision time. These are fictional-company teaching statements; missing values remain missing and are not real-company valuations.'},
    social:{'zh-CN':'发表记录只能证明观点被发表，不证明内容属实。核对作者、时间、原始出处及可验证主张；同源转载不是独立确认。',en:'A publication record establishes that a claim was made, not that it is true. Check author, time, original source and the specific claim; reposts are not independent confirmation.'},
    factors:{'zh-CN':'因子是可计算特征，不保证收益。样本不足时不报告有效性；没有真实基本面时 Value/Quality 未测。合成回测仅检验方法流程。',en:'Factors are measurable characteristics, not return guarantees. Insufficient samples do not establish efficacy. Value/Quality are untested without real fundamentals; synthetic backtests demonstrate a method only.'},
    allocation:{'zh-CN':'这里购买虚构教学证券，资金去向图表示组合敞口。现实二级市场交易发生在买卖双方之间，不能解释为资金直接进入发行公司的经营账户。',en:'You buy fictional teaching securities here; the allocation diagram describes portfolio exposure. Secondary-market transactions exchange existing securities between buyers and sellers, not direct operating funding for the issuer.'},
    backtest:{'zh-CN':'回测应按当时可得信息构建信号，并在信号可得之后执行。反复调参、存活样本及忽略费用可能夸大结果；一次盈利不证明能力。',en:'Build signals from information available at the time and execute only after availability. Repeated tuning, surviving-only samples and omitted costs can inflate results; one profitable outcome does not establish skill.'}
  };
  const copy=x=>JSON.parse(JSON.stringify(x));
  const iso=day=>new Date(BASE+day*DAY).toISOString();
  const round=(x,n=4)=>Number(x.toFixed(n));
  const priceEarnings=(price,eps)=>Number.isFinite(price)&&Number.isFinite(eps)&&eps>0?round(price/eps,2):null;
  const hash=value=>{let a=2166136261,b=5381;for(const c of JSON.stringify(value)){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0);}return (a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0');};
  function asOf(view){const day=view?.day;if(!Number.isInteger(day)||day<0||day>10000)throw Error('invalidEvidenceTime');return iso(day);}
  function explain(key,lang='zh-CN'){return EXPLANATIONS[key]?.[lang==='en'?'en':'zh-CN']||'';}
  function record(view,id,type,instrumentIds,title,data,options={}){
    const at=asOf(view),out={schema:1,id,type,instrumentIds,source:'FactorLab authored teaching scenario',sourceUrl:SOURCE,observedAt:at,publishedAt:at,availableAt:at,periodStart:at,periodEnd:at,dataMode:'synthetic',derivation:'authored-scenario',units:{},day:view.day,title,data,...options};
    out.snapshotId=VERSION+':'+hash(out);return out;
  }
  function buildEvidence(view,options={}){
    asOf(view);const legacyFundamentals=options?.legacyFundamentals===true,rows=[],holdings=view.ledger?.holdings||[],history=(view.ledger?.history||[]).filter(x=>Number.isInteger(x.day)&&x.day<=view.day),at=asOf(view);
    holdings.forEach(h=>{
      const points=history.filter(x=>Number.isFinite(x.prices?.[h.id])).map(x=>({day:x.day,time:iso(x.day),value:x.prices[h.id],origin:'ledger observation'}));
      if(!points.length&&Number.isFinite(h.price))points.push({day:view.day,time:at,value:h.price});
      const initial=history.find(x=>x.day===0)?.prices?.[h.id];
      if(Number.isFinite(initial))for(let day=-1;day>=-30;day--)points.unshift({day,time:iso(day),value:round(initial*(1+.025*Math.sin(day*.21)+.012*Math.sin(day*.73)),6),origin:'authored pre-start warmup'});
      rows.push(record(view,'PRICE-'+h.id+'-D'+view.day,'price',[h.id],{'zh-CN':h.symbol+' 教学价格',en:h.symbol+' teaching price'},{points,priceBasis:'unadjusted synthetic quote; no dividends or splits',warmup:{from:-30,to:-1,method:'authored trigonometric path anchored to initial quote; not market history or ledger performance'},volume:null,turnover:null,netFundFlow:null},{periodStart:points[0]?.time||at,units:{value:'USD/share'},derivation:'authored-prestart-warmup-then-ledger-prices',interpretation:{'zh-CN':EXPLANATIONS.prices['zh-CN']+' D−30 至 D−1 是独立编写的课前练习序列，D0 起与账本报价一致。',en:EXPLANATIONS.prices.en+' D−30 to D−1 are authored warmup observations; from D0 onward quotes match the ledger.'}}));
    });
    const underlyings=holdings.filter((h,i)=>holdings.findIndex(x=>x.sectorId===h.sectorId)===i);
    underlyings.forEach(h=>{
      const expiry=iso(view.day+30).slice(0,10),spot=h.price,optionRows=[];
      for(const ratio of [.9,1,1.1])for(const kind of ['Call','Put']){
        const strike=round(spot*ratio,2),intrinsic=Math.max(0,kind==='Call'?spot-strike:strike-spot),timeValue=spot*(ratio===1?.028:.016),mid=intrinsic+timeValue;
        const rowId=h.id+'-'+expiry+'-'+kind+'-'+strike;
        optionRows.push({id:rowId,contractId:rowId,underlying:h.id,expiry,kind,side:kind,strike,bid:round(mid*.96,2),ask:round(mid*1.04,2),volume:Math.round(240+(ratio===1?180:40)+view.day*3),openInterest:Math.round(1800+(ratio===1?900:300)+view.day*11),iv:round(.28+Math.abs(1-ratio)*.5,3),delta:null,observedAt:at,openInterestAsOf:iso(view.day-1),contractMultiplier:100});
      }
      rows.push(record(view,'OPTIONS-'+h.id+'-D'+view.day,'options',[h.id],{'zh-CN':h.symbol+' 期权教学快照',en:h.symbol+' teaching option snapshot'},{rows:optionRows,provider:'authored teaching snapshot',pricingMethod:'illustrative intrinsic value plus authored time value; IV not calibrated',tradable:false},{units:{strike:'USD/share',bid:'USD/share',ask:'USD/share',volume:'contracts/session',openInterest:'outstanding contracts',iv:'annual fraction'},interpretation:EXPLANATIONS.options,conceptSourceUrl:SOURCES.options}));
    });
    const reportDay=Math.floor(view.day/30)*30-4,periodEnd=iso(reportDay-15),periodStart=iso(reportDay-105),publishedAt=iso(reportDay),firstAvailableAt=iso(Math.max(0,reportDay+4));
    const fundamentals=holdings.map((h,i)=>{
      const revenue=round(90+i*17+Math.floor(view.day/30)*5,2),profit=i===holdings.length-1?null:round(revenue*(.06+(i%4)*.025),2),equity=round(80+i*12,2),eps=profit===null?null:round(profit/10,4);
      if(legacyFundamentals)return {id:h.id+'-REPORT-'+reportDay,instrumentId:h.id,name:h.name,symbol:h.symbol,revenue,profit,netProfit:profit,equity,sharesMillions:10,eps,pe:priceEarnings(h.price,eps),roe:profit===null?null:round(profit/equity,4),periodStart,periodEnd,publishedAt,reportAvailableAt:publishedAt,priceObservedAt:at,availableAt:at,missing:profit===null?['netProfit','eps','pe','roe']:[],roeBasis:'period net income / period-end equity; teaching proxy, not annualized',peBasis:'current teaching price / period EPS; not TTM'};
      return {id:h.id+'-REPORT-'+reportDay,instrumentId:h.id,name:h.name,symbol:h.symbol,revenue,profit,netProfit:profit,equity,sharesMillions:10,eps,pe:priceEarnings(h.price,eps),roe:profit===null?null:round(profit/equity,4),periodStart,periodEnd,publishedAt,firstAvailableAt,reportAvailableAt:firstAvailableAt,priceObservedAt:at,availableAt:firstAvailableAt,missing:profit===null?['netProfit','eps','pe','roe']:[],roeBasis:'period net income / period-end equity; teaching proxy, not annualized',peBasis:'current teaching price / period EPS; not TTM'};
    });
    rows.push(record(view,'FUNDAMENTALS-D'+view.day,'fundamentals',holdings.map(h=>h.id),{'zh-CN':'公司财务与估值 · 虚构教学报告',en:'Company financials & valuation · fictional reports'},{rows:fundamentals},legacyFundamentals?{periodStart,periodEnd,publishedAt,availableAt:at,derivation:'authored-report-values-and-ratios-calculated-with-current-visible-quote',units:{revenue:'USD million/period',netProfit:'USD million/period',equity:'USD million',eps:'USD/share/period',pe:'x, period EPS basis',roe:'fraction/period'},interpretation:EXPLANATIONS.fundamentals}:{periodStart,periodEnd,publishedAt,firstAvailableAt,derivation:'authored-report-values-and-ratios-calculated-with-current-visible-quote',units:{revenue:'USD million/period',netProfit:'USD million/period',equity:'USD million',eps:'USD/share/period',pe:'x, period EPS basis',roe:'fraction/period'},interpretation:EXPLANATIONS.fundamentals}));
    const first=holdings[0]?.id,related=first?[first]:[],report=fundamentals[0];
    rows.push(record(view,'NEWS-D'+view.day,'news',related,{'zh-CN':'教学资讯：财报数字与解读',en:'Teaching news: statement numbers and interpretation'},{author:{'zh-CN':'FactorLab 教学编辑（虚构）',en:'FactorLab teaching editor (fictional)'},text:{'zh-CN':report?'教学公司本期收入 '+report.revenue+' 百万美元，净利润 '+report.netProfit+' 百万美元。收入是经营规模指标，不能单独判断股票是否便宜。':'当前没有可用公司财务数据。',en:report?'The teaching company reports revenue of USD '+report.revenue+' million and net income of USD '+report.netProfit+' million for this period. Revenue alone cannot establish that a stock is cheap.':'No company statements are available.'},sourceStatus:'authored-teaching-material',verificationStatus:'fictional scenario, not a real publication',originId:'TEACHING-REPORT-'+reportDay,linkedEvidenceId:'FUNDAMENTALS-D'+view.day,sourceUrl:SOURCE},{interpretation:EXPLANATIONS.social}));
    rows.push(record(view,'SOCIAL-D'+view.day,'social',related,{'zh-CN':'教学社媒：待核查的订单说法',en:'Teaching social post: an unverified order claim'},{author:{'zh-CN':'练习账号 A（虚构，不对应真实人物）',en:'Practice account A (fictional, not a real person)'},text:{'zh-CN':'听说供应链订单可能改善。我尚未看到公司公告，需要核对订单是否变成收入，以及目前估值是否已反映乐观预期。',en:'I heard that supply-chain orders may improve. I have not seen a company announcement; check conversion into revenue and whether valuation already reflects optimism.'},sourceStatus:'authored-teaching-material',verificationStatus:'unverified claim within fictional scenario',originId:'TEACHING-RUMOR-'+Math.floor(view.day/30),sourceUrl:SOURCE,repostsAreIndependent:false},{interpretation:EXPLANATIONS.social}));
    const factorRows=holdings.map(h=>{
      const p=history.filter(x=>Number.isFinite(x.prices?.[h.id])).slice(-21),rs=p.slice(1).map((x,i)=>x.prices[h.id]/p[i].prices[h.id]-1),mean=rs.length?rs.reduce((a,b)=>a+b,0)/rs.length:0;
      return {id:h.id,instrumentId:h.id,momentum:p.length>=21?round(p.at(-1).prices[h.id]/p[0].prices[h.id]-1,6):null,lowVol:rs.length>=20?-Math.sqrt(rs.reduce((s,r)=>s+(r-mean)**2,0)/(rs.length-1)):null,value:null,quality:null,samples:rs.length,requiredSamples:20,status:'Value/Quality untested in this daily price-only panel; four-factor synthetic research is a separate dataset'};
    });
    for(const key of ['momentum','lowVol']){const valid=factorRows.filter(r=>Number.isFinite(r[key])).sort((a,b)=>b[key]-a[key]);valid.forEach(r=>{r[key+'Rank']=1+valid.filter(x=>x[key]>r[key]).length;});}
    rows.push(record(view,'FACTORS-D'+view.day,'factors',holdings.map(h=>h.id),{'zh-CN':'当前可见价格因子',en:'Factors from currently visible prices'},{rows:factorRows,window:20,frequency:'synthetic daily steps',valueStatus:'untested',qualityStatus:'untested'},{periodStart:iso(Math.max(0,view.day-20)),units:{momentum:'return fraction / 20 steps',lowVol:'negative daily sample standard deviation'},derivation:'computed-from-visible-prices',interpretation:EXPLANATIONS.factors,conceptSourceUrl:SOURCES.validation}));
    return rows;
  }
  function select(records,id,selection={}){
    const record=records.find(r=>r.id===id);if(!record)throw Error('evidenceUnavailable');
    if(!selection||Array.isArray(selection)||Object.keys(selection).some(k=>!['from','to','rowId'].includes(k)))throw Error('invalidEvidenceSelection');
    const ref={schema:1,id:record.id,snapshotId:record.snapshotId,day:record.day,selection:{},type:record.type,instrumentIds:copy(record.instrumentIds),title:copy(record.title),source:record.source,sourceUrl:record.sourceUrl,observedAt:record.observedAt,publishedAt:record.publishedAt,availableAt:record.availableAt,periodStart:record.periodStart,periodEnd:record.periodEnd,dataMode:record.dataMode,derivation:record.derivation,units:copy(record.units),data:copy(record.data)};
    if(selection.rowId!==undefined){
      if(selection.from!==undefined||selection.to!==undefined||typeof selection.rowId!=='string')throw Error('invalidEvidenceSelection');
      const row=record.data.rows?.find(r=>r.id===selection.rowId);if(!row)throw Error('invalidEvidenceSelection');ref.selection={rowId:row.id};ref.data={rows:[copy(row)]};
    }else if(selection.from!==undefined||selection.to!==undefined){
      const {from,to}=selection,points=record.data.points;
      if(!Number.isInteger(from)||!Number.isInteger(to)||from>to||!points?.some(p=>p.day===from)||!points.some(p=>p.day===to))throw Error('invalidEvidenceSelection');
      ref.selection={from,to};ref.data={points:copy(points.filter(p=>p.day>=from&&p.day<=to)),priceBasis:record.data.priceBasis};ref.periodStart=iso(from);ref.periodEnd=iso(to);
    }
    return ref;
  }
  function resolve(records,ref){
    if(!ref||ref.schema!==1||typeof ref.snapshotId!=='string')throw Error('invalidEvidenceReference');
    const original=records.find(r=>r.id===ref.id);if(!original||original.snapshotId!==ref.snapshotId)throw Error('staleEvidenceReference');
    return select(records,ref.id,ref.selection);
  }
  function viewAt(view,day){
    if(!Number.isInteger(day)||day<0||day>view.day)throw Error('evidenceUnavailable');
    const out={...view,day};if(!view.ledger)return out;
    const history=view.ledger.history.filter(r=>r.day<=day),last=history.at(-1);if(!last||last.day!==day)throw Error('evidenceUnavailable');
    out.ledger={...view.ledger,history,holdings:view.ledger.holdings.map(h=>({...h,price:last.prices[h.id]}))};return out;
  }
  function resolveReference(view,ref){
    const at=viewAt(view,ref.day);
    try{return resolve(buildEvidence(at),ref);}catch(error){if(String(ref?.id||'').startsWith('FUNDAMENTALS-'))return resolve(buildEvidence(at,{legacyFundamentals:true}),ref);throw error;}
  }
  function validateReference(view,ref){try{if(typeof ref==='string'){const day=Number(ref.match(/-D(\d+)$/)?.[1]);return buildEvidence(viewAt(view,day)).some(r=>r.id===ref);}resolveReference(view,ref);return true;}catch{return false;}}
  function importRecords(records,cutoff){
    if(!Array.isArray(records)||records.length>1000||!Number.isFinite(Date.parse(cutoff)))throw Error('invalidProviderData');
    const checkTimes=value=>{if(!value||typeof value!=='object')return;for(const [key,child] of Object.entries(value)){if(['observedAt','publishedAt','availableAt','openInterestAsOf'].includes(key)&&(!Number.isFinite(Date.parse(child))||Date.parse(child)>Date.parse(cutoff)))throw Error('invalidProviderData');if(child&&typeof child==='object')checkTimes(child);}};
    return records.map(r=>{
      const required=['id','type','instrumentIds','source','sourceUrl','observedAt','publishedAt','availableAt','dataMode','derivation','units','data','snapshotId'];
      if(!r||required.some(k=>!(k in r))||!['historical','delayed','realtime','synthetic'].includes(r.dataMode)||!Array.isArray(r.instrumentIds)||!/^https:\/\//.test(r.sourceUrl)||!['observedAt','publishedAt','availableAt'].every(k=>Number.isFinite(Date.parse(r[k]))&&Date.parse(r[k])<=Date.parse(cutoff))||Date.parse(r.availableAt)<Date.parse(r.publishedAt))throw Error('invalidProviderData');
      checkTimes(r.data);
      if(r.type==='options'&&(!Array.isArray(r.data.rows)||r.data.rows.some(x=>!['id','underlying','expiry','kind','strike','bid','ask','volume','openInterest','iv'].every(k=>k in x)||!['Call','Put'].includes(x.kind)||!['strike','bid','ask','volume','openInterest','iv'].every(k=>Number.isFinite(x[k])&&x[k]>=0)||x.bid>x.ask||x.strike===0)))throw Error('invalidProviderData');
      return copy(r);
    });
  }
  return {VERSION,SOURCES,EXPLANATIONS,asOf,explain,buildEvidence,select,resolve,resolveReference,validateReference,viewAt,importRecords,priceEarnings};
});

;
(function(root) {
  const zh={
  "actualCost": "已扣交易费",
  "forecastHint": "按本轮行业基准判断：超过 +1% 为上行，低于 −1% 为下行，其余为横盘。",
  "inspect": "查看证据",
  "inspected": "已查看",
  "factorLabel": "因子",
  "exposure": "组合对该因子的敏感程度",
  "factorReturn": "最近一日因子收益",
  "exposureHint": "因子暴露 = 当前行业权重 × 模型行业暴露；现金暴露为 0。",
  "skip": "跳至研究桌面",
  "edition": "高端制造与尖端科技行业配置",
  "settings": "设置",
  "desk": "行业研究",
  "portfolio": "本轮配置",
  "risk": "风险与来源",
  "journal": "决策复盘",
  "chapter": "行业配置练习",
  "chapterLabel": "长期定位与短期调整",
  "subtitle": "订单在改善。价格，是否已经走在前面？",
  "syntheticShort": "合成教学数据",
  "synthetic": "合成教学数据 · 不代表真实市场表现",
  "phaseDecision": "等待配置",
  "phaseSimulating": "模拟进行中",
  "phaseEvent": "新信息 · 已暂停",
  "phaseReview": "本轮复盘",
  "phaseComplete": "练习完成",
  "day": "第 {{day}} 个交易日",
  "round": "第 {{round}} / {{total}} 轮",
  "roundShort": "第 {{round}} 轮",
  "roundStage0": "传闻与事实",
  "roundStage1": "订单能否变成收入",
  "roundStage2": "成本与延迟",
  "roundStage3": "行业差异",
  "roundStage4": "盈利与价格",
  "roundStage5": "复核整段判断",
  "rate": "政策利率",
  "inflation": "通胀",
  "growth": "经济增长",
  "liquidity": "市场流动性",
  "credit": "信用压力",
  "sentiment": "市场情绪",
  "macroHint": "当前合成状态",
  "marketTitle": "资产与比较",
  "nav": "当前资产（虚拟）",
  "benchmark": "行业基准",
  "anchor": "长期持有参照",
  "benchmarkHint": "五行业各 20%，每日调回等权；免交易费。",
  "anchorHint": "开局配置一直持有，不交易。",
  "yourPortfolio": "你的组合",
  "chartHint": "共同市场路径 · 初始净值 100,000",
  "chartLabel": "组合、行业基准和长期持有参照的资产变化",
  "chartEmpty": "确认本轮配置后，开始模拟。",
  "sectorHeatmap": "行业温度",
  "sinceStart": "自开局累计涨跌",
  "sector0": "半导体",
  "sector1": "机器人与工业自动化",
  "sector2": "先进材料",
  "sector3": "清洁能源装备",
  "sector4": "AI 与数字基础设施",
  "sector5": "现金（Cash）",
  "sectorShort0": "半导体",
  "sectorShort1": "机器人",
  "sectorShort2": "先进材料",
  "sectorShort3": "清洁能源",
  "sectorShort4": "AI 基础设施",
  "cycleExpansion": "扩张",
  "cycleOverheating": "过热",
  "cycleStagflation": "滞胀",
  "cycleRecession": "衰退",
  "cycleRecovery": "复苏",
  "eventTitle": "当前证据",
  "publicOnly": "截至当前交易日",
  "eventInitialTitle": "订单改善，盈利仍待确认",
  "eventInitialBody": "订单增加不等于利润增长。先区分已披露的事实和市场预期。",
  "eventInitialKind": "开局简报 · 合成情境",
  "eventPauseHint": "先看新证据，再继续本轮；本轮持仓暂不能调整。",
  "resume": "继续本轮",
  "eventDay": "第 {{day}} 日",
  "eventActive": "影响仍在传导",
  "eventResolved": "该事件影响已结束",
  "riskTitle": "风险与收益来源",
  "method": "模型口径",
  "volatility": "年化波动率",
  "sharpe": "Sharpe",
  "maxDrawdown": "最大回撤",
  "diversification": "分散度",
  "riskFrequency": "基于已实现日收益；252 日年化，Sharpe 使用同期模拟 Cash 日利率。少于 2 个观测时留空；超额收益零方差时 Sharpe 留空。回撤包含初始净值。",
  "attributionTitle": "第 {{round}} 轮收益来源 · 虚拟金额",
  "attributionMarket": "市场整体影响（Beta）",
  "attributionSector": "行业自身影响",
  "attributionEvent": "已发生事件影响",
  "attributionIdiosyncratic": "其他模拟冲击",
  "attributionCash": "现金利息",
  "attributionCost": "交易费用",
  "factor0": "动量",
  "factor1": "价值",
  "factor2": "质量",
  "factor3": "低波动",
  "portfolioTitle": "本轮配置",
  "cap": "合计 100%；每行业最多 40%；不能为负。",
  "balanced": "均衡",
  "defensive": "防御",
  "growthStyle": "成长",
  "total": "合计",
  "estimatedCost": "预计费用",
  "current": "当前持仓",
  "target": "本轮目标",
  "factorsTitle": "从因子生成配置",
  "factorsHint": "因子用于选行业。应用后会改写配置草稿，确认前可再调整。",
  "applyFactors": "按因子生成配置草稿",
  "forecastTitle": "本轮市场会怎样？",
  "forecastUp": "上行",
  "forecastFlat": "横盘",
  "forecastDown": "下行",
  "reasonTitle": "这次配置最主要的理由是什么？",
  "reasonChoose": "选择一个主要理由",
  "reasonEvidence": "需求与公开证据",
  "reasonRisk": "控制风险、保留现金",
  "reasonAnchor": "维持长期配置",
  "reasonValuation": "价格与盈利预期",
  "notePlaceholder": "选填：哪条证据会让你改变判断？",
  "confirm": "确认配置，开始本轮",
  "decisionHint": "确认后执行一次调仓并扣费，随后推进本轮；轮内不能调仓。",
  "pauseAnimation": "暂停播放",
  "playAnimation": "继续播放",
  "fastForward": "快进到下一事件或结算",
  "simulationProgress": "本轮进度 {{day}} / {{total}} 个交易日",
  "reviewLabel": "本轮结果",
  "reviewTitle": "本轮结果",
  "completeTitle": "六轮练习完成",
  "roundReturn": "本轮收益",
  "counterfactual": "本轮调仓相对不调仓（虚拟金额）",
  "anchorDifference": "自开局相对长期持有（虚拟金额）",
  "reward": "学习积分",
  "rewardHint": "积分记录纪律与风险观察，不计入金融净值。",
  "forecastResult": "判断与结果",
  "forecastActual": "你的预判：{{forecast}}；本轮基准实际：{{actual}}",
  "nextRound": "进入下一轮研究",
  "replay": "选择新情境",
  "journalTitle": "决策复盘",
  "journalEmpty": "尚无已结算记录。完成一轮后，可在这里对照理由和结果。",
  "exportSave": "导出进度文件",
  "reflectionPrompt": "下一轮，你要核对哪条新证据？",
  "reflectionPromptComplete": "下次，你要检验哪条新证据？",
  "reflectionPlaceholder": "例如：后续收入是否支持订单改善的判断？",
  "coachTitle": "研究助手",
  "coachIntro": "解释证据，核对风险。",
  "questionMacro": "利率怎样影响这些行业？",
  "questionRisk": "我的配置有哪些风险？",
  "questionReview": "我该如何解释这次结果？",
  "questionLabel": "向研究助手提问",
  "questionPlaceholder": "问一条证据，或一个风险问题…",
  "coachBoundary": "只看已确认持仓与已公开信息，不替你调仓。",
  "send": "发送",
  "coachRule": "规则提示 · 可离线",
  "coachLive": "在线 AI · 只读",
  "coachFallback": "AI 暂不可用 · 规则提示",
  "coachThinking": "正在整理当前证据…",
  "messageYou": "你",
  "messageCoach": "研究助手",
  "messageLanguage": "此条回复保留生成时的语言。",
  "references": "查看依据",
  "footer": "高端制造 × 尖端科技 · 合成教学模拟 · 非投资建议",
  "designExport": "Figma 导入版",
  "close": "关闭",
  "language": "语言 / Language",
  "languageHint": "切换语言不会改变进度或计算结果。",
  "speed": "播放速度",
  "speedNormal": "标准",
  "speedFast": "快速",
  "saveNow": "保存到此浏览器",
  "importSave": "从文件导入进度",
  "newGame": "开始新情境",
  "originalEntry": "打开保留的原版调查章节",
  "newGameHint": "新情境会替换当前工作进度。需要保留时，请先导出进度。",
  "seed": "随机种子",
  "scenario": "经济起点",
  "scenarioBaseline": "基准情境",
  "scenarioStress": "信用承压",
  "scenarioRecovery": "需求复苏",
  "cancel": "取消",
  "startNew": "确认开始",
  "saved": "已保存到此浏览器",
  "memoryOnly": "尚未保存，关闭页面会丢失本次更改",
  "saveBlocked": "浏览器保存不可用。可继续练习，请导出进度备份。",
  "corruptSave": "浏览器存档无法读取，已停止自动覆盖。请先导出原存档备份。",
  "invalidSave": "导入失败：文件格式或重放校验未通过。当前进度未改变。",
  "invalidWeights": "请把合计调为 100%；每行业最多 40%，权重不能为负。",
  "invalidFactors": "请将至少一个因子偏好设为大于 0。",
  "missingReason": "请选择本次配置的主要理由。",
  "actionError": "本次未执行。请核对当前阶段和配置。",
  "imported": "进度已恢复",
  "pendingCoach": "研究助手正在回复，请稍候。",
  "methodTitle": "模拟如何运行",
  "modelDescription": "共 6 轮，每轮 20 个交易日。数据由教学模型生成，未用真实市场校准，不能用于预测。",
  "transmission": "利率通过滞后的融资成本和需求影响增长与估值；通胀、流动性、信用压力与情绪共同影响风险。周期使用持续确认规则，减少频繁切换。",
  "feesDescription": "每次确认配置时调仓并扣费，不重复扣款；结算后持仓比例会随价格变化。",
  "factorDescription": "模型把收益分为市场、四因子、行业、事件和其他冲击；现金单独计息，各项金额与资产变动对账。因子偏好不重复投入本金。",
  "forecastDescription": "上行、横盘、下行是你的预判，结算后再与模拟基准比较。",
  "benchmarkDescription": "行业基准：五行业等权、每日再平衡、免交易费。长期持有参照：开局配置不交易。本轮不交易参照：沿同一市场路径持有本轮原仓位。",
  "sector.cash": "现金（Cash）",
  "evidence.E1.title": "订单改善，盈利待确认",
  "evidence.E1.body": "合成订单线索改善；收入和利润是否跟上，仍需后续披露。",
  "evidence.E2.title": "好消息可能已反映在价格中",
  "evidence.E2.body": "需求改善，也可能买贵。当前价格不保证未来收益。",
  "evidence.E3.title": "政策支持需要时间",
  "evidence.E3.body": "政策先影响融资与需求，盈利可能更晚变化。调整配置前，说明本轮理由。",
  "event.order.title": "出现补库存传闻",
  "event.order.body": "产业链传出补库存消息，但经营改善尚未证实。市场情绪已升温。",
  "event.disclosure.title": "收入披露更新",
  "event.disclosure.body": "合成披露显示订单转为收入存在时滞，行业内部盈利出现差异。",
  "event.disclosure.strong": "合成披露：较多订单已转为收入，但仍有交付时滞；价格可能已反映改善。",
  "event.disclosure.weak": "合成披露：订单转为收入偏弱，部分交付延后。此前传闻尚未充分兑现。",
  "event.supply.title": "交付承压，融资收紧",
  "event.supply.body": "运输与设备交付承压，融资条件收紧；成本影响会持续多个交易日。",
  "event.divergence.title": "行业现金流出现差异",
  "event.divergence.body": "自动化与材料行业的现金流出现差异。质量因子可供观察，但不会一直占优。",
  "event.profit.title": "盈利开始兑现",
  "event.profit.body": "订单开始转为盈利，但估值和融资成本仍会影响价格。",
  "event.resolution.title": "进入最终复盘",
  "event.resolution.body": "回看每轮当时可见的证据，区分判断依据、承担的风险和最终盈亏。",
  "roundQuestion0": "后续披露能否证实需求改善？",
  "roundQuestion1": "新数据支持还是削弱了你原先的理由？",
  "roundQuestion2": "影响先出现在成本、收入，还是利润？",
  "roundQuestion3": "哪些经营差异值得在下一轮核对？",
  "roundQuestion4": "盈利改善，是否就意味着本轮价格一定上涨？",
  "roundQuestion5": "下次你会用哪条新证据检验自己的方法？"
};
  const en={
  "actualCost": "Charged trading cost",
  "forecastHint": "Round benchmark return: above +1% is up; below −1% is down; otherwise sideways.",
  "inspect": "Inspect evidence",
  "inspected": "Inspected",
  "factorLabel": "Factor",
  "exposure": "Portfolio sensitivity to the factor",
  "factorReturn": "Latest daily factor return",
  "exposureHint": "Exposure = current sector weights × synthetic sector exposures; Cash has zero exposure.",
  "skip": "Skip to research desk",
  "edition": "Advanced manufacturing and frontier technology allocation",
  "settings": "Settings",
  "desk": "Sector research",
  "portfolio": "Round allocation",
  "risk": "Risk & sources",
  "journal": "Decision review",
  "chapter": "Sector allocation practice",
  "chapterLabel": "Long-term positioning and short-term changes",
  "subtitle": "Orders are improving. Has the price already moved ahead?",
  "syntheticShort": "Synthetic teaching data",
  "synthetic": "Synthetic teaching data · Not actual market performance",
  "phaseDecision": "Awaiting allocation",
  "phaseSimulating": "Simulation in progress",
  "phaseEvent": "New information · Paused",
  "phaseReview": "Round review",
  "phaseComplete": "Practice complete",
  "day": "Trading day {{day}}",
  "round": "Round {{round}} / {{total}}",
  "roundShort": "Round {{round}}",
  "roundStage0": "Rumors and facts",
  "roundStage1": "Orders into revenue",
  "roundStage2": "Costs and delays",
  "roundStage3": "Sector differences",
  "roundStage4": "Earnings and price",
  "roundStage5": "Review your reasoning",
  "rate": "Policy rate",
  "inflation": "Inflation",
  "growth": "Economic growth",
  "liquidity": "Liquidity",
  "credit": "Credit stress",
  "sentiment": "Sentiment",
  "macroHint": "Current synthetic state",
  "marketTitle": "Assets & comparisons",
  "nav": "Current assets (virtual)",
  "benchmark": "Sector benchmark",
  "anchor": "Long-term holding reference",
  "benchmarkHint": "Five sectors at 20%; rebalanced daily without fees.",
  "anchorHint": "Initial allocation held without trading.",
  "yourPortfolio": "Your portfolio",
  "chartHint": "Same market path · Initial NAV 100,000",
  "chartLabel": "NAV paths for portfolio, benchmark and long-term anchor",
  "chartEmpty": "Confirm your allocation to start the market.",
  "sectorHeatmap": "Sector temperature",
  "sinceStart": "Cumulative change since start",
  "sector0": "Semiconductors",
  "sector1": "Robotics & industrial automation",
  "sector2": "Advanced materials",
  "sector3": "Clean-energy equipment",
  "sector4": "AI & digital infrastructure",
  "sector5": "Cash",
  "sectorShort0": "Semiconductors",
  "sectorShort1": "Robotics",
  "sectorShort2": "Materials",
  "sectorShort3": "Clean energy",
  "sectorShort4": "AI infrastructure",
  "cycleExpansion": "Expansion",
  "cycleOverheating": "Overheating",
  "cycleStagflation": "Stagflation",
  "cycleRecession": "Recession",
  "cycleRecovery": "Recovery",
  "eventTitle": "Current evidence",
  "publicOnly": "Disclosed by the current day",
  "eventInitialTitle": "Orders improve; profits remain unconfirmed",
  "eventInitialBody": "More orders do not guarantee higher profit. Separate disclosed facts from market expectations.",
  "eventInitialKind": "Opening brief · Synthetic scenario",
  "eventPauseHint": "New information is public. Positions remain locked. Observe the impact before continuing.",
  "resume": "Continue this round",
  "eventDay": "Day {{day}}",
  "eventActive": "Impact still transmitting",
  "eventResolved": "Event impact ended",
  "riskTitle": "Risk & return sources",
  "method": "Model notes",
  "volatility": "Annualized volatility",
  "sharpe": "Sharpe ratio",
  "maxDrawdown": "Maximum drawdown",
  "diversification": "Diversification",
  "riskFrequency": "Realized daily returns; 252-day annualization. Sharpe uses contemporaneous simulated Cash daily rates. Fewer than 2 observations: —. Sharpe is blank for zero excess-return variance. Drawdown includes initial NAV.",
  "attributionTitle": "Settled round {{round}} attribution · Virtual currency",
  "attributionMarket": "Market beta",
  "attributionSector": "Sector component",
  "attributionEvent": "Event shocks",
  "attributionIdiosyncratic": "Idiosyncratic shocks",
  "attributionCash": "Cash interest",
  "attributionCost": "Trading costs",
  "factor0": "Momentum",
  "factor1": "Value",
  "factor2": "Quality",
  "factor3": "Low volatility",
  "portfolioTitle": "This round’s allocation",
  "cap": "Total 100%; each sector at most 40%; no negative weights.",
  "balanced": "Balanced",
  "defensive": "Defensive",
  "growthStyle": "Growth",
  "total": "Total",
  "estimatedCost": "Est. cost",
  "current": "Current holding",
  "target": "Round target",
  "factorsTitle": "Generate an allocation from factors",
  "factorsHint": "Factors rank sectors. Applying them replaces the allocation draft, which you can edit before confirmation.",
  "applyFactors": "Generate allocation draft",
  "forecastTitle": "What will the market do this round?",
  "forecastUp": "Up",
  "forecastFlat": "Sideways",
  "forecastDown": "Down",
  "reasonTitle": "What supports this decision?",
  "reasonChoose": "Choose a reason",
  "reasonEvidence": "Demand and public evidence",
  "reasonRisk": "Risk control and Cash buffer",
  "reasonAnchor": "Long-term positioning",
  "reasonValuation": "Valuation and expectations",
  "notePlaceholder": "What evidence would change your view? (optional)",
  "confirm": "Confirm allocation & start round",
  "decisionHint": "Confirmation trades once and deducts fees, then starts the round. Positions cannot be changed during the round.",
  "pauseAnimation": "Pause playback",
  "playAnimation": "Resume playback",
  "fastForward": "Advance to next event or settlement",
  "simulationProgress": "{{day}} / {{total}} days this round",
  "reviewLabel": "Round result",
  "reviewTitle": "Round settled",
  "completeTitle": "Six-round practice complete",
  "roundReturn": "Round return",
  "counterfactual": "Round trade vs. no trade (virtual amount)",
  "anchorDifference": "Since start vs. long-term holding (virtual amount)",
  "reward": "Learning points",
  "rewardHint": "Points reflect discipline and risk awareness. They never change financial NAV.",
  "forecastResult": "Outlook & outcome",
  "forecastActual": "Your forecast: {{forecast}}; actual round benchmark: {{actual}}",
  "nextRound": "Research the next round",
  "replay": "Try another scenario",
  "journalTitle": "Decision review",
  "journalEmpty": "No settled records yet. Finish one round to compare your reasons and results.",
  "exportSave": "Export progress file",
  "reflectionPrompt": "What new evidence will you check next round?",
  "reflectionPromptComplete": "What new evidence will you test next time?",
  "reflectionPlaceholder": "For example: do later revenues support the improving-order thesis?",
  "coachTitle": "Research assistant",
  "coachIntro": "Explain evidence and check risks.",
  "questionMacro": "How do rates affect these sectors?",
  "questionRisk": "What is the main risk in my portfolio?",
  "questionReview": "How should I explain this outcome?",
  "questionLabel": "Ask your research partner",
  "questionPlaceholder": "Ask about one piece of evidence or a risk…",
  "coachBoundary": "Confirmed holdings and disclosed information only; no trading on your behalf.",
  "send": "Send",
  "coachRule": "Rule-based feedback · Offline ready",
  "coachLive": "Live AI · Read only",
  "coachFallback": "Rule-based fallback · AI unavailable",
  "coachThinking": "Analyzing the current evidence…",
  "messageYou": "You",
  "messageCoach": "Research assistant",
  "messageLanguage": "This reply keeps its original language",
  "references": "See the reasoning",
  "footer": "Advanced manufacturing × frontier technology · Synthetic learning simulation · Not investment advice",
  "designExport": "Figma import edition",
  "close": "Close",
  "language": "Language / 语言",
  "languageHint": "Changing language preserves progress, positions, seed and calculated outcomes.",
  "speed": "Playback speed",
  "speedNormal": "Standard",
  "speedFast": "Fast",
  "saveNow": "Save to this browser",
  "importSave": "Import progress from file",
  "newGame": "Start a new scenario",
  "originalEntry": "Open the preserved original chapter",
  "newGameHint": "A new scenario replaces your working progress. Export progress first if you need to keep it.",
  "seed": "Random seed",
  "scenario": "Economic starting point",
  "scenarioBaseline": "Baseline",
  "scenarioStress": "Credit stress",
  "scenarioRecovery": "Demand recovery",
  "cancel": "Cancel",
  "startNew": "Start scenario",
  "saved": "Saved to this browser",
  "memoryOnly": "Unsaved changes will be lost when this page closes",
  "saveBlocked": "Browser storage is unavailable. You can keep playing; export your save to preserve progress.",
  "corruptSave": "The save could not be read. Its original contents are preserved and automatic overwrite is disabled. Export it before starting a new scenario in Settings.",
  "invalidSave": "Import failed: invalid format or replay validation. Your current progress is unchanged.",
  "invalidWeights": "Weights must total 100%, stay non-negative and respect the 40% sector cap.",
  "invalidFactors": "At least one factor preference must be greater than zero.",
  "missingReason": "Record a reason before confirming.",
  "actionError": "Action unavailable. Check the current phase and allocation.",
  "imported": "Save restored.",
  "pendingCoach": "Your research partner is responding. Please wait.",
  "methodTitle": "How the simulation works",
  "modelDescription": "An original, reproducible, simplified learning model: 20 trading days per round, 6 rounds. Slow variables update periodically; fast variables move daily. Not calibrated to real market data and not a forecasting model.",
  "transmission": "Rates affect financing, demand and valuations with a lag. Inflation, liquidity, credit stress and sentiment shape risk. Cycles use sustained confirmation to avoid rapid switching.",
  "feesDescription": "Configured simulated buy and sell costs are charged on confirmation. Holdings then drift with prices. The preview and executed trade use the same calculation, with no duplicate charge.",
  "factorDescription": "Sector returns separate market beta, four factors, sector components, events and idiosyncratic shocks. Cash accrues interest separately. Monetary attribution reconciles with NAV. Factor preferences select sectors without allocating capital twice.",
  "forecastDescription": "Up, sideways and down record the player’s view. They are compared with the realized synthetic market direction at settlement, not presented as AI predictions.",
  "benchmarkDescription": "The teaching benchmark holds five equal-weight sectors, rebalanced daily without costs. The long-term anchor holds the initial allocation without trading. The round’s no-trade counterfactual shares the same market path.",
  "evidence.E1.title": "Orders improve; profits need confirmation",
  "evidence.E1.body": "Synthetic order signals improve. Later disclosures must show whether revenue and profit follow.",
  "evidence.E2.title": "Good news may already be in the price",
  "evidence.E2.body": "Demand can improve while the price is too high. The current price does not guarantee future returns.",
  "evidence.E3.title": "Policy support takes time",
  "evidence.E3.body": "Policy reaches financing and demand before profits. Explain this round’s reason before changing the allocation.",
  "event.order.title": "Restocking rumors emerge",
  "event.order.body": "Restocking rumors are spreading, but operating improvements remain unconfirmed. Sentiment is already rising.",
  "event.disclosure.title": "Revenue disclosure update",
  "event.disclosure.body": "Synthetic disclosures show delays in converting orders into revenue and differences in sector profits.",
  "event.disclosure.strong": "Synthetic disclosure: more orders have converted into revenue, but delivery lags remain. Prices may already reflect the improvement.",
  "event.disclosure.weak": "Synthetic disclosure: order conversion is weak and some deliveries are delayed. Earlier rumors have not fully materialized.",
  "event.supply.title": "Delivery pressure and tighter financing",
  "event.supply.body": "Transport and equipment deliveries face pressure while financing tightens. Cost effects last several trading days.",
  "event.divergence.title": "Sector cash flows diverge",
  "event.divergence.body": "Automation and materials show different cash flows. Quality helps frame the comparison but will not always outperform.",
  "event.profit.title": "Profits begin to materialize",
  "event.profit.body": "Orders begin turning into profits, while valuations and financing costs still influence prices.",
  "event.resolution.title": "Begin the final review",
  "event.resolution.body": "Review the evidence available in each round. Separate your reasons, risks and eventual profit or loss.",
  "roundQuestion0": "Can later disclosures confirm the demand improvement?",
  "roundQuestion1": "Does the new evidence support or weaken your original reason?",
  "roundQuestion2": "Will the impact appear first in costs, revenue or profit?",
  "roundQuestion3": "Which operating differences should you check next round?",
  "roundQuestion4": "Do improving profits guarantee a price rise this round?",
  "roundQuestion5": "What new evidence will you use to test your method next time?"
};
  root.FactorLabStrings={ 'zh-CN':zh,en };
  if(typeof module!=='undefined')module.exports=root.FactorLabStrings;
})(typeof window==='undefined'?globalThis:window);

;
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.InvestigationResearch = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FACTORS = [
    { id: 'Momentum', name: '动量', description: '过去六个模拟月累计收益；趋势可能反转。' },
    { id: 'Value', name: '价值', description: '虚拟篮子 E/P；便宜可能伴随经营风险。' },
    { id: 'Quality', name: '质量', description: '虚拟篮子 ROE；单一指标不能覆盖完整盈利质量。' },
    { id: 'LowVol', name: '低波动', description: '过去六个月样本波动率的负值；低波动不等于无风险。' }
  ];
  const SECTORS = [
    { id: 'semiconductors', name: '半导体' }, { id: 'robotics', name: '机器人' },
    { id: 'materials', name: '先进材料' }, { id: 'cleanenergy', name: '清洁能源' },
    { id: 'AI', name: 'AI 基础设施' }
  ];
  const REAL_CASE = {
    title: '现实档案 · 2024 年半导体供给与存储周期',
    facts: [
      { date: '2024-02-19', category: '政策', source: '美国商务部 / NIST',
        text: '美国商务部与 GlobalFoundries 公布无约束力的初步条款，拟提供约 15 亿美元直接资助，支持美国成熟制程产能。当日属于拟议支持，不是已拨款。',
        url: 'https://www.nist.gov/news-events/news/2024/02/biden-harris-administration-announces-preliminary-terms-globalfoundries' },
      { date: '2024-03-20', category: '企业经营', source: 'Micron FY2024 Q2 财报',
        text: 'Micron 披露截至 2024-02-29 的季度收入为 58.2 亿美元，上季为 47.3 亿美元，上年同期为 36.9 亿美元。这是单家公司披露，不能代替全行业表现。',
        url: 'https://investors.micron.com/news/press-release/2024/Micron-Technology-Inc--Reports-Results-for-the-Second-Quarter-of-Fiscal-2024-03-20-2024/default.aspx' },
      { date: '2024-03-20', category: '产品价格', source: 'Micron FY2024 Q2 投资者简报，第 11、18 页',
        text: 'Micron 披露该季度 DRAM 平均售价环比增长百分之十几的高段（high teens），NAND 平均售价环比增长超过 30%。这是存储产品售价，不是股票涨幅。',
        url: 'https://micron.gcs-web.com/static-files/c531bd08-22cd-4d6b-9540-f8aa72459716' }
    ],
    note: '真实历史只用于比较政策、经营和产品价格证据；不是模拟情景输入，不提供证券价格回测，也不能证明模型收益或现实因子有效。'
  };
  const METHODS = [
    { name: 'Spearman Rank IC：Reference；未安装或复制 SciPy 代码', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html' },
    { name: '平均秩处理并列：Reference', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.rankdata.html' }
  ];
  const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  function stdev(values) {
    if (values.length < 2) return null;
    const m = mean(values);
    return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1));
  }
  function ranks(values) {
    const ordered = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
    const result = [];
    for (let i = 0; i < ordered.length;) {
      let end = i + 1;
      while (end < ordered.length && ordered[end].value === ordered[i].value) end++;
      for (let j = i; j < end; j++) result[ordered[j].index] = (i + 1 + end) / 2;
      i = end;
    }
    return result;
  }
  function rankIC(scores, returns) {
    if (!Array.isArray(scores) || !Array.isArray(returns) || scores.length !== returns.length) throw new Error('IC 配对长度不一致');
    const pairs = scores.map((s, i) => [s, returns[i]]).filter(p => p.every(Number.isFinite));
    if (pairs.length < 3) return null;
    const x = ranks(pairs.map(p => p[0]));
    const y = ranks(pairs.map(p => p[1]));
    const mx = mean(x), my = mean(y);
    let numerator = 0, dx = 0, dy = 0;
    x.forEach((v, i) => { numerator += (v - mx) * (y[i] - my); dx += (v - mx) ** 2; dy += (y[i] - my) ** 2; });
    return dx === 0 || dy === 0 ? null : numerator / Math.sqrt(dx * dy);
  }
  function performance(returns) {
    const nav = [1];
    let peak = 1, maxDrawdown = 0;
    returns.forEach(r => {
      if (!Number.isFinite(r) || r <= -1) throw new Error('收益必须有限且大于 -100%');
      const next = nav[nav.length - 1] * (1 + r);
      nav.push(next); peak = Math.max(peak, next); maxDrawdown = Math.max(maxDrawdown, 1 - next / peak);
    });
    return { totalReturn: returns.length ? nav[nav.length - 1] - 1 : null, maxDrawdown: returns.length ? maxDrawdown : null, nav };
  }
  function normalizePreferences(input) {
    const defaults = Object.fromEntries(FACTORS.map(f => [f.id, 0.25]));
    if (input === undefined) return defaults;
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => !Object.hasOwn(defaults, k))) throw new Error('未知因子偏好');
    const values = FACTORS.map(f => Object.hasOwn(input, f.id) ? input[f.id] : 0);
    const total = values.reduce((a, b) => a + b, 0);
    if (values.some(v => !Number.isFinite(v) || v < 0) || !Number.isFinite(total) || total <= 0) throw new Error('因子偏好须非负，且至少一个大于零');
    return Object.fromEntries(FACTORS.map((f, i) => [f.id, values[i] / total]));
  }
  function createHistory() {
    return Array.from({ length: 42 }, (_, t) => {
      const returns = { Cash: 0.001 }, fundamentals = {};
      SECTORS.forEach((s, i) => {
        returns[s.id] = 0.006 + 0.035 * Math.sin(t * 0.67 + i * 1.3) + 0.025 * Math.cos(t * 1.17 - i * 0.9) + 0.009 * Math.sin(t * (i + 2));
        fundamentals[s.id] = { ep: 0.035 + i * 0.005 + 0.017 * Math.cos(t * 0.31 + i), roe: 0.11 + 0.018 * i + 0.055 * Math.sin(t * 0.23 + i * 1.5), observedAt: t + 1, availableAt: t + 1 };
      });
      return { month: t + 1, returns, fundamentals };
    });
  }
  function signals(history, monthIndex, input) {
    if (!Array.isArray(history) || !Number.isInteger(monthIndex) || monthIndex < 6 || monthIndex > history.length) throw new Error('需要六个月事前历史');
    const preferences = normalizePreferences(input);
    const rows = SECTORS.map(sector => {
      const prior = history.slice(monthIndex - 6, monthIndex).map(row => row.returns[sector.id]);
      if (prior.some(r => !Number.isFinite(r) || r <= -1)) throw new Error('事前收益不完整');
      let latest = null;
      for (let t = 0; t < monthIndex; t++) {
        const f = history[t].fundamentals[sector.id];
        if (f && Number.isFinite(f.observedAt) && Number.isFinite(f.availableAt) && f.observedAt <= f.availableAt && f.availableAt <= monthIndex && (!latest || f.observedAt > latest.observedAt)) latest = f;
      }
      return { id: sector.id, name: sector.name, availableAt: monthIndex, raw: {
        Momentum: prior.reduce((wealth, r) => wealth * (1 + r), 1) - 1,
        Value: latest && Number.isFinite(latest.ep) ? latest.ep : null,
        Quality: latest && Number.isFinite(latest.roe) ? latest.roe : null,
        LowVol: -stdev(prior)
      }, scores: {} };
    });
    FACTORS.forEach(f => {
      const valid = rows.filter(row => Number.isFinite(row.raw[f.id]));
      const ranked = ranks(valid.map(row => row.raw[f.id]));
      rows.forEach(row => { row.scores[f.id] = null; });
      valid.forEach((row, i) => { row.scores[f.id] = valid.length > 1 ? 100 * (ranked[i] - 1) / (valid.length - 1) : null; });
    });
    rows.forEach(row => { row.score = FACTORS.some(f => preferences[f.id] > 0 && row.scores[f.id] === null) ? null : FACTORS.reduce((sum, f) => sum + preferences[f.id] * (row.scores[f.id] || 0), 0); });
    return rows.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }
  function analyze(input, history = createHistory()) {
    const preferences = normalizePreferences(input);
    if (!Array.isArray(history) || history.length !== 42) throw new Error('历史必须为六个月预热与三十六个月回测；不得追加游戏未来');
    history.forEach((row, i) => {
      if (!row || row.month !== i + 1 || !row.returns || !row.fundamentals || SECTORS.some(s => !row.fundamentals[s.id] || !Number.isFinite(row.returns[s.id]) || row.returns[s.id] <= -1)) throw new Error('历史时序或数据无效');
    });
    const months = [];
    for (let t = 6; t < 42; t++) {
      const rankings = signals(history, t, preferences);
      if (rankings.some(row => row.score === null)) throw new Error('综合信号缺失，不能生成完整回测');
      const top = rankings.slice(0, 2).map(row => row.id), bottom = rankings.slice(-2).map(row => row.id);
      const forward = history[t].returns;
      const strategyReturn = mean(top.map(id => forward[id]));
      const ic = Object.fromEntries(FACTORS.map(f => [f.id, rankIC(rankings.map(row => row.scores[f.id]), rankings.map(row => forward[row.id]))]));
      months.push({ month: t - 5, decisionTime: t, rankings, top, bottom, forward: Object.fromEntries(SECTORS.map(s => [s.id, forward[s.id]])), tied: rankings.some((row, i) => i > 0 && row.score === rankings[i - 1].score), strategyReturn, benchmarkReturn: mean(SECTORS.map(s => forward[s.id])), spread: strategyReturn - mean(bottom.map(id => forward[id])), ic });
    }
    const strategy = performance(months.map(m => m.strategyReturn));
    const benchmark = performance(months.map(m => m.benchmarkReturn));
    return {
      label: '36 个月合成历史 · 方法练习', dataVersion: 'investigation-synthetic-v1', sampleCount: months.length, lookback: 6,
      preferences, strategy, benchmark, excessReturn: strategy.totalReturn - benchmark.totalReturn, meanSpread: mean(months.map(m => m.spread)), months,
      factors: FACTORS.map(f => { const valid = months.map(m => m.ic[f.id]).filter(Number.isFinite); return { id: f.id, name: f.name, meanIC: mean(valid), validMonths: valid.length, missingMonths: months.length - valid.length }; }),
      note: '六个月预热后逐月以事前综合分数选前二，各持有 50%；后两名仅用于 Top–Bottom 比较。基准为五板块每月等权，Cash 不参与排序。并列以 sectorId 排序，IC 用平均秩；交易成本为零。全部历史由固定公式合成，样本内反复调参有选择偏差，不报告显著性，也不证明现实有效。',
      methods: METHODS
    };
  }
  return { FACTORS, SECTORS, REAL_CASE, METHODS, createHistory, signals, analyze, normalizePreferences, rankIC, performance };
});

;
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.FactorLabResearchTools=factory(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const weightsSchema={type:'array',items:{type:'number'},minItems:6,maxItems:6,description:'Five sector weights then cash; fractions sum to 1; each sector <= 0.4.'};
  const definitions=[
    ['get_visible_evidence','Read only currently available versioned evidence.',{}],
    ['get_portfolio_snapshot','Read confirmed cash, securities, and revision.',{}],
    ['get_instrument_details','Read one teaching security and its related evidence.',{instrumentId:{type:'string'}}],
    ['run_backtest','Run the separate 36-month synthetic method exercise; does not change holdings.',{factorWeights:{type:'array',items:{type:'number'},minItems:4,maxItems:4}}],
    ['simulate_allocation','Calculate unconfirmed security amounts, quantities, cash and fees at the fixed current snapshot.',{weights:weightsSchema}],
    ['compare_scenarios','Compare two unconfirmed allocation plans at identical prices.',{weights:weightsSchema,alternative:weightsSchema}],
    ['propose_allocation_draft','Return an unconfirmed allocation draft for explicit learner application; never trades.',{weights:weightsSchema}]
  ].map(([name,description,properties])=>({type:'function',function:{name,description,parameters:{type:'object',properties,required:Object.keys(properties),additionalProperties:false}}}));
  for(const tool of definitions.filter(d=>['simulate_allocation','propose_allocation_draft'].includes(d.function.name))){tool.function.parameters.required=[];tool.function.parameters.properties.sectorId={type:'string',enum:['semiconductor','robotics','materials','energy','digital']};tool.function.parameters.properties.targetWeight={type:'number',minimum:0,maximum:.4};tool.function.parameters.properties.preset={type:'string',enum:['equal-sectors']};tool.function.parameters.properties.cashWeight={type:'number',minimum:0,maximum:1};tool.function.description+=' With no arguments use the learner current editing allocation. Prefer sectorId and targetWeight (fraction, e.g. 0.2) for one-sector changes, moving the difference to/from cash while preserving other edited sector weights. For an explicitly requested equal-sector example use preset equal-sectors and cashWeight. Alternatively supply six weights in order semiconductor, robotics, materials, energy, digital, cash.';}
  const comparisonDefinition=definitions.find(d=>d.function.name==='compare_scenarios').function;
  comparisonDefinition.parameters.required=[];comparisonDefinition.description+=' With no arguments compare actual confirmed holdings (no trade, zero fee) with the learner current editing allocation. Use explicit weights and alternative only when comparing two different proposed plans.';
  function validWeights(weights){return Array.isArray(weights)&&weights.length===6&&weights.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&weights.slice(0,5).every(v=>v<=.4+1e-10)&&Math.abs(weights.reduce((s,v)=>s+v,0)-1)<1e-7;}
  function material(record){
    if(!record.data?.points)return clone(record);
    const points=record.data.points,values=points.map(p=>p.value);
    return {...clone(record),data:{...record.data,points:points.length?[points[0],points.at(-1)]:[],rangeSummary:{samples:points.length,min:Math.min(...values),max:Math.max(...values),first:values[0],last:values.at(-1)},representation:'range endpoints and exact range summary; open the reference for every observation'}};
  }
  function card(result){
    if(result.error)return {error:result.error};
    if(result.instrument&&result.evidence)return {snapshotId:result.snapshotId,instrument:clone(result.instrument),references:result.evidence.map(r=>({id:r.id,snapshotId:r.snapshotId,day:r.day}))};
    if(result.preview)return {...result,preview:card(result.preview)};
    if(result.first)return {...clone(result),first:card(result.first),alternative:card(result.alternative)};
    if(result.records)return {snapshotId:result.snapshotId,asOf:result.asOf,evidenceCount:result.records.length,references:result.records.map(r=>({id:r.id,snapshotId:r.snapshotId,day:r.day}))};
    if(result.holdings)return {snapshotId:result.snapshotId,revision:result.revision,nav:result.nav,cash:result.cash,invested:result.invested,totalFees:result.totalFees,currency:result.currency,securityCount:result.holdings.length,sectorOrder:result.sectorOrder,sectorWeights:result.sectorWeights};
    if(result.rows)return Object.fromEntries(['ok','snapshotId','revision','weights','cash','fee','buys','sells','after','concentration','sectorChanges','assumptions'].filter(k=>k in result).map(k=>[k,clone(result[k])]));
    if(result.months)return {dataMode:result.dataMode,label:result.label,sampleCount:result.sampleCount,preferences:result.preferences,strategy:result.strategy,benchmark:result.benchmark,factors:result.factors,executionDifferences:result.executionDifferences};
    return clone(result);
  }
  function compactResult(answer){
    return {...clone(answer),...(answer.tools?{tools:answer.tools.map(t=>({...t,result:card(t.result||{})}))}:{}),...(answer.allocationDraft?{allocationDraft:card(answer.allocationDraft)}:{})};
  }
  function create({engine,evidence,research},body){
    const state=engine.restore(body.save),view=engine.publicView(state),records=evidence.buildEvidence(view);
    const attachments=(body.attachments||[]);
    if(!Array.isArray(attachments)||attachments.length>8)throw Error('attachments');
    const selected=attachments.map(ref=>{const canonical=evidence.resolveReference(view,ref);let hash=2166136261;for(const char of canonical.id+'|'+canonical.snapshotId+'|'+JSON.stringify(canonical.selection))hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;return {...canonical,token:'REF'+hash.toString(16).padStart(8,'0')};});
    const snapshotId=view.ledger?.snapshotId||'legacy-D'+view.day,revision=view.ledger?.revision??view.day;
    const editingWeights=body.decisionDraft?.weights===undefined?[...view.weights]:clone(body.decisionDraft.weights);
    const sectorIds=['semiconductor','robotics','materials','energy','digital'];
    function preview(weights){
      if(!validWeights(weights))throw Error('invalid_weights');
      if(view.phase!=='decision')throw Error('allocation_locked');
      const result=engine.preview(state,weights);
      if(result.ok===false)throw Error(result.error||'invalid_allocation');
      const sectorChanges=weights.slice(0,5).map((targetWeight,i)=>{
        const amount=result.rows?result.rows.filter(r=>r.sectorIndex===i).reduce((total,r)=>total+r.delta,0):targetWeight*result.after-view.units[i]*view.prices[i];
        return {sectorId:sectorIds[i],confirmedWeight:view.weights[i],targetWeight,weightChange:Math.round((targetWeight-view.weights[i])*1e6)/1e6,netTradeAmount:Math.round(amount*1e6)/1e6};
      });
      return {...clone(result),snapshotId,revision,weights:[...weights],concentration:Math.max(...weights.slice(0,5)),sectorChanges,assumptions:{dataMode:'synthetic',currency:view.ledger?.currency||'USD',prices:'fixed current teaching snapshot',tradeBaseline:'confirmed holdings, not the previous editing draft',futureReturns:'not estimated',status:'draft'}};
    }
    function requestedWeights(args){
      if(args.weights!==undefined){if(['sectorId','targetWeight','preset','cashWeight'].some(k=>args[k]!==undefined))throw Error('ambiguous_weights');return args.weights;}
      if(args.preset!==undefined){
        if(args.sectorId!==undefined||args.targetWeight!==undefined)throw Error('ambiguous_weights');
        if(args.preset!=='equal-sectors'||!Number.isFinite(args.cashWeight)||args.cashWeight<0||args.cashWeight>1)throw Error('invalid_preset');
        return [...Array(5).fill((1-args.cashWeight)/5),args.cashWeight];
      }
      if(args.cashWeight!==undefined)throw Error('invalid_preset');
      if(!validWeights(editingWeights))throw Error('invalid_weights');
      if(args.sectorId===undefined&&args.targetWeight===undefined)return [...editingWeights];
      const index=sectorIds.indexOf(args.sectorId);
      if(index<0||!Number.isFinite(args.targetWeight))throw Error('Provide sectorId and targetWeight as a fraction, or six fractional weights summing to 1');
      const weights=[...editingWeights];weights[5]+=weights[index]-args.targetWeight;weights[index]=args.targetWeight;return weights;
    }
    function execute(name,args={}){
      const definition=definitions.find(d=>d.function.name===name);
      if(!definition)throw Error('tool_not_allowed');
      if(!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(k=>!Object.hasOwn(definition.function.parameters.properties,k)))throw Error('invalid_arguments');
      if(definition.function.parameters.required.some(k=>!Object.hasOwn(args,k)))throw Error('invalid_arguments');
      if(name==='get_visible_evidence')return {snapshotId,asOf:view.asOf||view.ledger?.asOf,records:records.map(material),selected:selected.map(material)};
      if(name==='get_portfolio_snapshot')return clone(view.ledger?{...view.ledger,history:view.ledger.history.slice(-6),sectorOrder:[...sectorIds,'cash'],sectorWeights:view.weights,sectorAmounts:view.weights.map(w=>w*view.nav)}:{status:'legacy_read_only',nav:view.nav,cash:view.cash,weights:view.weights,sectorOrder:[...sectorIds,'cash']});
      if(name==='get_instrument_details'){
        if(typeof args.instrumentId!=='string'||args.instrumentId.length>80)throw Error('invalid_instrument');
        const row=view.ledger?.holdings?.find(r=>[r.instrumentId,r.id,r.symbol].includes(args.instrumentId));
        if(!row)throw Error('invalid_instrument');
        return clone({snapshotId,instrument:row,evidence:records.filter(r=>r.instrumentIds.includes(args.instrumentId))});
      }
      if(name==='run_backtest'){
        const f=args.factorWeights;
        if(!Array.isArray(f)||f.length!==4||f.some(v=>!Number.isFinite(v)||v<0||v>100)||!f.some(v=>v>0))throw Error('invalid_factors');
        const result=research.analyze(Object.fromEntries(['Momentum','Value','Quality','LowVol'].map((id,i)=>[id,f[i]])));
        return {dataMode:'synthetic',separateHistoricalExercise:true,executionDifferences:{sectorCap:.5,tradingFee:0},...result};
      }
      if(name==='simulate_allocation')return preview(requestedWeights(args));
      if(name==='compare_scenarios'){
        const first=args.weights===undefined?{ok:true,status:'confirmed',snapshotId,revision,weights:[...view.weights],cash:view.cash,fee:0,buys:0,sells:0,after:view.nav,concentration:Math.max(...view.weights.slice(0,5))}:preview(args.weights);
        const alternative=preview(args.alternative??requestedWeights({})),rounded=n=>Math.round(n*1e6)/1e6;
        return {snapshotId,first,alternative,changes:alternative.weights.map((w,i)=>rounded(w-first.weights[i])),cashChange:rounded(alternative.cash-first.cash),feeChange:rounded(alternative.fee-first.fee)};
      }
      if(!view.ledger)throw Error('legacy_read_only');
      const weights=requestedWeights(args);return {schema:1,status:'draft',snapshotId,revision,weights:[...weights],preview:preview(weights)};
    }
    return {view,records,selected,snapshotId,revision,editingWeights,transactions:state.transactions,execute};
  }
  const evidenceRef=r=>({schema:1,id:r.id,...(r.token?{token:r.token}:{}),snapshotId:r.snapshotId,day:r.day,selection:r.selection});
  function demo(body,deps){
    deps=deps||{engine:root.FactorLabLedger.createEngine(root.FactorLabSimulation),evidence:root.FactorLabEvidence,research:root.InvestigationResearch};
    const runner=create(deps,body),en=body.lang==='en',tools=[];
    const invoke=(name,args={})=>{const result=runner.execute(name,args);tools.push({id:'demo-'+tools.length,name,status:'complete',result:card(result)});return result;};
    const question=body.question||'',sectorPatterns=[/半导体|semicon/i,/机器人|robot/i,/材料|material/i,/能源|energy/i,/\bAI\b|人工智能|算力/i];
    const sector=sectorPatterns.findIndex(p=>p.test(question)),percent=question.match(/(\d+(?:\.\d+)?)\s*[%％]/);
    const sectorNames=en?['Semiconductors','Robotics','Advanced materials','Clean energy','AI infrastructure','Cash']:['半导体','机器人','先进材料','清洁能源','AI 算力','现金'];
    const money=v=>Number.isFinite(v)?v.toFixed(2):'—',pct=v=>(v*100).toFixed(1).replace(/\.0$/,'')+'%';
    const cashTarget=question.match(/(\d+(?:\.\d+)?)\s*[%％]\s*(?:的)?\s*(?:现金|cash)/i)||question.match(/(?:现金|cash)\s*(?:为|at|of|:)?\s*(\d+(?:\.\d+)?)\s*[%％]/i);
    let allocationDraft,summary='',detail='',allocationQuestion=false;
    const editable=!!runner.view.ledger&&runner.view.phase==='decision';
    if(editable&&/等额|等权|equal.sector/i.test(question)&&cashTarget){
      const cashWeight=Number(cashTarget[1])/100;
      allocationDraft=invoke('propose_allocation_draft',{preset:'equal-sectors',cashWeight});allocationQuestion=true;
      const p=allocationDraft.preview;
      summary=en?`An equal-sector example: each sector ${pct(allocationDraft.weights[0])}, cash ${pct(cashWeight)}. Estimated fees USD ${money(p.fee)}; cash after fees USD ${money(p.cash)}.`:`等额示例：五个行业各 ${pct(allocationDraft.weights[0])}，现金 ${pct(cashWeight)}。预计费用 $${money(p.fee)}，扣费后现金 $${money(p.cash)}。`;
      detail=en?'This is a starting example, not a forecast or a personalized recommendation. Apply it to the editor, adjust the percentages, and confirm separately when ready.':'这是供你调整的入门示例。可以先应用，再修改比例，最后由你确认成交。';
    }else if(editable&&sector>=0&&percent){
      const args={sectorId:['semiconductor','robotics','materials','energy','digital'][sector],targetWeight:Number(percent[1])/100};
      const p=invoke('simulate_allocation',args);allocationDraft=invoke('propose_allocation_draft',args);allocationQuestion=true;
      summary=en?`${sectorNames[sector]} becomes ${pct(args.targetWeight)}. Estimated fees USD ${money(p.fee)}; remaining cash USD ${money(p.cash)}.`:`${sectorNames[sector]}调整为 ${pct(args.targetWeight)}。预计费用 $${money(p.fee)}，剩余现金 $${money(p.cash)}。`;
      detail=en?'The other edited sectors stay unchanged; the difference goes to or comes from cash. These are current-price calculations, not future returns.':'其他正在编辑的行业比例保持不变，差额由现金补足或收回。金额按当前价格计算，不预测未来收益。';
    }else if(editable&&/比较|对比|compare/i.test(question)&&/配置|持仓|调整|allocation|portfolio|holding/i.test(question)){
      const comparison=invoke('compare_scenarios');allocationQuestion=true;
      const changes=comparison.changes.map((delta,i)=>Math.abs(delta)<1e-6?'':`${sectorNames[i]} ${delta>0?'+':''}${pct(delta)}`).filter(Boolean).join(en?', ':'、');
      summary=en?`${changes||'Your draft matches the confirmed allocation'}. Estimated fees USD ${money(comparison.alternative.fee)}; cash changes by USD ${money(comparison.cashChange)} to USD ${money(comparison.alternative.cash)}.`:`${changes||'当前草稿与已确认配置相同'}。预计费用 $${money(comparison.alternative.fee)}，现金变化 $${money(comparison.cashChange)}，调整后为 $${money(comparison.alternative.cash)}。`;
      detail=en?'Weight changes are percentage points. This compares keeping the confirmed holdings with executing your draft at the same current prices. No trade has been placed.':'比例变化按百分点计算。比较的是保持现有持仓与按当前价格执行草稿的差别，尚未成交。';
    }else if(editable&&/配置|持仓|费用|allocation|portfolio|holding|fees/i.test(question)){
      const p=invoke('simulate_allocation');allocationQuestion=true;
      const largest=p.weights.slice(0,5).reduce((best,w,i)=>w>p.weights[best]?i:best,0);
      summary=en?`Your largest sector is ${sectorNames[largest]} at ${pct(p.weights[largest])}; target cash is ${pct(p.weights[5])}. Estimated fees USD ${money(p.fee)} leave USD ${money(p.cash)} in cash.`:`当前草稿中${sectorNames[largest]}占比最高，为 ${pct(p.weights[largest])}；目标现金占 ${pct(p.weights[5])}。确认后的预计费用为 $${money(p.fee)}，剩余现金 $${money(p.cash)}。`;
      detail=en?'A sector combines several teaching companies. Cash is the uninvested part of your virtual budget. Changing the percentages changes where the budget goes; it does not predict returns.':'行业比例决定分给这一类公司的资金，现金是暂时没有买入证券的部分。你可以直接调整比例，下方金额会随之变化。';
    }
    if(!tools.length){
      const result=invoke(runner.selected.length?'get_visible_evidence':'get_portfolio_snapshot');
      summary=en?(runner.selected.length?'This material is attached. Ask about its price, option activity or assumptions.':`Your confirmed assets are USD ${money(result.nav)}, including USD ${money(result.cash)} cash.`):(runner.selected.length?'材料已带入对话，可以继续问其中的价格、期权数据或假设。':`已确认资产为 $${money(result.nav)}，其中现金 $${money(result.cash)}。`);
      detail=en?'Offline mode can calculate allocation changes. Try “semiconductors to 15%” or use the allocation shortcuts.':'离线助手可以计算配置变化。试试“半导体调到15%”，或使用配置页的快捷问题。';
    }
    const referenceRecords=allocationQuestion?[]:runner.selected.length?runner.selected:runner.records.slice(0,1);
    return {summary,detail,references:referenceRecords.map(r=>r.token||r.id),referenceSelections:referenceRecords.map(r=>evidenceRef(r)),mode:'example',tools,...(allocationDraft?{allocationDraft:card(allocationDraft)}:{})};
  }

  return {create,demo,definitions,validWeights,card,material,compactResult};
});

;
(function(root){
  'use strict';
  async function consume(response,onEvent=()=>{},signal){
    if(!response.ok){
      let value;
      try{value=await response.json();}catch{}
      const retryAfter=Number(response.headers.get('retry-after'));
      throw Object.assign(Error(value?.error||'connection_failed'),{
        code:value?.error,status:response.status,
        retryAfter:response.status===429&&Number.isInteger(retryAfter)&&retryAfter>=1&&retryAfter<=86400?retryAfter:undefined
      });
    }
    if(!(response.headers.get('content-type')||'').includes('text/event-stream')){const result=await response.json();onEvent('result',result);return result;}
    const limit=500000;
    let buffer='',result,finished=false,size=0;
    function checkAbort(){
      if(signal?.aborted)throw signal.reason??new DOMException('Request aborted','AbortError');
    }
    function readFrames(text){
      buffer=(buffer+text).replace(/\r\n/g,'\n');
      let boundary;
      while(!finished&&(boundary=buffer.indexOf('\n\n'))>=0){
        const frame=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);
        const event=frame.match(/^event:\s*(.+)$/m)?.[1]||'message',data=frame.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');
        if(!data)continue;
        checkAbort();
        const payload=JSON.parse(data);
        if(event==='error')throw Object.assign(Error(payload.error),{code:payload.error,traceId:payload.traceId});
        if(event==='result')result=payload;
        if(event==='done')finished=true;
        onEvent(event,payload);
      }
    }
    checkAbort();
    if(typeof TextDecoder!=='function'||typeof response.body?.getReader!=='function'){
      const text=await response.text();
      if(text.length>limit)throw Error('stream_size');
      readFrames(text);
    }else{
      const reader=response.body.getReader(),decoder=new TextDecoder();
      try{
        while(!finished){
          checkAbort();
          const {done,value}=await reader.read();
          if(done)break;
          size+=value.byteLength;if(size>limit)throw Error('stream_size');
          readFrames(decoder.decode(value,{stream:true}));
        }
      }finally{void reader.cancel().catch(()=>{});reader.releaseLock();}
    }
    if(!result||!finished)throw Error('stream_interrupted');
    return result;
  }
  const api={consume};if(typeof module==='object'&&module.exports)module.exports=api;else root.FactorLabCoachStream=api;
})(typeof globalThis!=='undefined'?globalThis:this);

;
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FactorMascot = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const actions = Object.freeze({ idle: 1, welcome: 2, thinking: 3, success: 4, growth: 4, milestone: 5, caution: 6 });
  const validId = id => (typeof id === 'string' && id.length > 0 && id.length <= 160) || (typeof id === 'number' && Number.isSafeInteger(id));

  function createController(options = {}) {
    const now = options.now || Date.now, later = options.setTimeout || setTimeout, cancel = options.clearTimeout || clearTimeout;
    const random = options.random || Math.random, onChange = options.onChange || (() => {});
    const context = options.context || 'login', seen = new Map(), requests = new Map();
    let active = null, token = 0, timer = null, latestRequest = null, busy = false, welcomeAt = -Infinity;
    let visible = options.visible !== false, enabled = options.enabled !== false, reduced = !!options.reducedMotion;
    let editing = false, failed = false, destroyed = false;
    const blocked = () => destroyed || !visible || !enabled || reduced || editing || failed;
    const snapshot = () => Object.freeze({ state: active?.state || 'static', token, video: active && active.state !== 'caution' ? active.state + '.mp4' : null, busyRequestId: busy ? latestRequest : null, blocked: blocked(), editing, visible, enabled, reducedMotion: reduced, failed, destroyed });
    function publish() { try { onChange(snapshot()); } catch {} }
    function clearTimer() { if (timer !== null) cancel(timer); timer = null; }
    function remember(map, key, value) {
      map.set(key, value);
      if (map.size > 256) map.delete(map.keys().next().value);
    }
    function schedule(delay, fn) { clearTimer(); timer = later(() => { timer = null; if (!destroyed) fn(); }, delay); }
    function rest() {
      clearTimer();
      if (active) { active = null; token++; }
      publish();
      if (blocked()) return;
      if (busy) schedule(700, () => { if (!blocked() && busy) start('thinking', latestRequest); });
      else if (context === 'login') schedule(12000 + Math.round(Math.max(0, Math.min(1, random())) * 8000), () => { if (!blocked() && !busy) start('idle'); });
    }
    function start(state, requestId) {
      clearTimer(); active = { state, requestId }; token++;
      const current = token;
      publish();
      if (active && token === current && !blocked()) schedule(state === 'caution' ? 1200 : 5000, () => state === 'caution' ? finish(current) : fail(current));
    }
    function finish(current) {
      if (destroyed || !active || current !== token) return false;
      rest(); return true;
    }
    function fail(current) {
      if (destroyed || !active || current !== token) return false;
      failed = true; rest(); return true;
    }
    function emit(state, event = {}) {
      if (destroyed || !Object.hasOwn(actions, state) || state === 'thinking') return false;
      if (event.requestId !== undefined && event.requestId !== latestRequest) return false;
      if (event.id !== undefined) {
        if (!validId(event.id) || (seen.get(event.id) || 0) >= actions[state]) return false;
        remember(seen, event.id, actions[state]);
      }
      if (blocked() || (active && actions[active.state] >= actions[state] && event.replace !== true)) return false;
      if (state === 'welcome' && now() - welcomeAt < 5000) return false;
      if (state === 'welcome') welcomeAt = now();
      start(state, event.requestId); return true;
    }
    function setBusy(id, value) {
      if (destroyed || !validId(id)) return false;
      if (value) {
        if (requests.has(id)) return false;
        remember(requests, id, true); latestRequest = id; busy = true;
        if (active?.state === 'thinking' || (active?.requestId !== undefined && active.requestId !== id)) { clearTimer(); active = null; token++; }
        if (!blocked() && (!active || actions[active.state] < actions.thinking)) start('thinking', id);
        else publish();
      } else {
        if (!busy || id !== latestRequest) return false;
        busy = false;
        if (!active || active.state === 'thinking') rest(); else publish();
      }
      return true;
    }
    function setRestriction(key, value) {
      if (destroyed) return;
      const current = key === 'editing' ? editing : key === 'visible' ? visible : key === 'enabled' ? enabled : reduced;
      value = !!value; if (current === value) return;
      if (key === 'editing') editing = value;
      else if (key === 'visible') visible = value;
      else if (key === 'enabled') enabled = value;
      else reduced = value;
      rest();
    }
    const api = {
      emit, setBusy, finish, fail, getState: snapshot,
      setEditing: value => setRestriction('editing', value),
      setVisible: value => setRestriction('visible', value),
      setEnabled: value => setRestriction('enabled', value),
      setReducedMotion: value => setRestriction('reduced', value),
      destroy() { if (!destroyed) { destroyed = true; busy = false; rest(); seen.clear(); requests.clear(); } }
    };
    rest();
    return api;
  }

  const words = {
    'zh-CN': { greet: '向研究伙伴打招呼', static: '研究助手', idle: '慢慢来，先看证据', welcome: '欢迎回来', thinking: '正在核对信息', success: '操作已完成', growth: '本轮资产增长', milestone: '研究里程碑已完成', caution: '请核对风险与证据', failed: '研究伙伴 · 静态显示' },
    en: { greet: 'Greet your research companion', static: 'Research companion', idle: 'Take your time. Check the evidence.', welcome: 'Welcome back', thinking: 'Checking information', success: 'Action completed', growth: 'Portfolio grew this round', milestone: 'Research milestone completed', caution: 'Review the risks and evidence', failed: 'Research companion · Still image' }
  };
  const mounted = new WeakMap(), instances = new Set();
  let motionEnabled = true;

  function petPicture(doc) {
    const picture = doc.createElement('picture');
    const source = doc.createElement('source'), image = doc.createElement('img');
    const base = new URL('releases/1f4629bd4ea02c5c/assets/pets/', doc.baseURI);
    picture.className = 'pet-picture';
    source.type = 'image/webp'; source.srcset = new URL('companions.webp', base).href;
    image.alt = ''; image.decoding = 'async'; image.draggable = false;
    image.src = new URL('companions.png', base).href;
    picture.append(source, image);
    const ready = () => {
      const reveal = () => {picture.dataset.ready='true';};
      if (image.decode) image.decode().then(reveal).catch(()=>{});
      else reveal();
    };
    image.addEventListener('load',ready,{once:true});
    if (image.complete && image.naturalWidth) ready();
    return picture;
  }

  function mount(host, options = {}) {
    if (!host?.ownerDocument) throw TypeError('A mascot host element is required');
    const existing = mounted.get(host);
    if (existing) { if (options.language) existing.setLanguage(options.language); return existing; }
    const doc = host.ownerDocument, view = doc.defaultView;
    const scope = options.focusRoot || host.closest('dialog') || host.parentElement;
    const media = view.matchMedia?.('(prefers-reduced-motion: reduce)');
    const removers = [];
    let language = options.language === 'en' ? 'en' : 'zh-CN', controller, latest, renderedToken = -1;
    let visible = options.visible !== false, pageVisible = true, manuallyEditing = false, composing = false, destroyed = false;
    let stopMedia = () => {}, cautionAnimation = null;
    const base = new URL(options.assetBase || 'releases/1f4629bd4ea02c5c/assets/mascot/', doc.baseURI).href.replace(/\/?$/, '/');
    const launcher = !!options.launcher, pet = options.pet ? petPicture(doc) : null;
    const button = launcher ? host : doc.createElement('button'), stage = doc.createElement('span');
    const poster = doc.createElement('img'), video = doc.createElement('video'), marker = doc.createElement('span'), caption = doc.createElement('p');
    host.classList.add('factor-mascot'); host.dataset.context = options.context || 'login';
    if (!launcher) button.className = 'mascot-greet';
    button.type = 'button'; stage.className = 'mascot-stage';
    poster.className = 'mascot-poster'; poster.alt = ''; poster.decoding = 'async';
    if (!pet) poster.src = base + 'poster.png';
    video.className = 'mascot-video'; video.muted = true; video.defaultMuted = true; video.playsInline = true;
    video.loop = false; video.preload = 'none'; video.hidden = true;
    if (!pet) video.poster = poster.src;
    video.setAttribute('aria-hidden', 'true'); video.setAttribute('tabindex', '-1'); video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
    marker.className = 'mascot-caution'; marker.textContent = '!'; marker.hidden = true; marker.setAttribute('aria-hidden', 'true');
    caption.className = 'mascot-caption'; caption.setAttribute('aria-live', 'off');
    if (pet) stage.append(pet);
    else stage.append(poster, video, marker);
    if (launcher) host.replaceChildren(stage);
    else { button.append(stage); host.replaceChildren(button, caption); }
    function listen(target, name, listener) {
      if (!target?.addEventListener) return;
      target.addEventListener(name, listener); removers.push(() => target.removeEventListener(name, listener));
    }
    function label() {
      const text = words[language];
      if (!launcher) button.setAttribute('aria-label', text.greet);
      caption.textContent = text[latest?.failed ? 'failed' : latest?.state === 'static' && latest.busyRequestId !== null ? 'thinking' : latest?.state || 'static'];
      host.lang = language;
    }
    function stop() {
      stopMedia(); stopMedia = () => {};
      if (pet) { delete pet.dataset.pose; return; }
      cautionAnimation?.cancel(); cautionAnimation = null;
      for (const animation of host.getAnimations?.({ subtree: true }) || []) animation.cancel();
      video.pause(); video.hidden = true; poster.hidden = false; marker.hidden = true;
      if (video.getAttribute('src') || video.src) { video.removeAttribute('src'); try { video.load(); } catch {} }
    }
    function render(state) {
      latest = state; host.dataset.state = state.state; host.dataset.blocked = String(state.blocked);
      host.dataset.editing = String(state.editing); label();
      if (state.token === renderedToken) { if (state.blocked) stop(); return; }
      renderedToken = state.token; stop();
      if (state.destroyed || state.blocked || state.state === 'static') return;
      const current = state.token;
      const active = () => !destroyed && controller?.getState().token === current;
      if (pet) {
        const pose = state.state;
        pet.dataset.pose = pose;
        const nextPose = pose === 'welcome' ? 'welcome-b' : pose === 'caution' ? 'failure' : '';
        const frame = nextPose ? view.setTimeout(() => {
          if (active()) pet.dataset.pose = nextPose;
        }, 280) : null;
        const end = pose === 'caution' ? null : view.setTimeout(() => {
          if (active()) controller.finish(current);
        }, pose === 'thinking' ? 1800 : 1100);
        stopMedia = () => { view.clearTimeout(frame); view.clearTimeout(end); };
        return;
      }
      if (state.state === 'caution') {
        marker.hidden = false;
        cautionAnimation = stage.animate?.([{ boxShadow: '0 0 0 0 rgba(184,188,195,0)' }, { boxShadow: '0 0 0 4px rgba(184,188,195,.45)', offset: .4 }, { boxShadow: '0 0 0 0 rgba(184,188,195,0)' }], { duration: 1200, iterations: 1 });
        return;
      }
      const playing = () => { if (active()) { video.hidden = false; poster.hidden = true; } };
      const ended = () => { if (active()) controller.finish(current); };
      const error = () => { if (active()) controller.fail(current); };
      video.addEventListener('playing', playing); video.addEventListener('ended', ended); video.addEventListener('error', error);
      stopMedia = () => { video.removeEventListener('playing', playing); video.removeEventListener('ended', ended); video.removeEventListener('error', error); };
      video.src = base + state.video;
      try { Promise.resolve(video.play()).catch(error); } catch { error(); }
    }
    controller = createController({
      context: options.context, visible: visible && !doc.hidden, enabled: motionEnabled && options.enabled !== false,
      reducedMotion: !!media?.matches, now: () => view.performance?.now() ?? Date.now(),
      setTimeout: view.setTimeout.bind(view), clearTimeout: view.clearTimeout.bind(view), onChange: render
    });
    const editable = node => !!node?.matches?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]');
    function updateEditing() {
      if (destroyed) return;
      controller.setEditing(manuallyEditing || composing || (editable(doc.activeElement) && !!scope?.contains(doc.activeElement)));
    }
    function updateVisibility() { if (!destroyed) controller.setVisible(visible && pageVisible && !doc.hidden); }
    if (!launcher) listen(button, 'click', () => controller.emit('welcome'));
    listen(scope, 'focusin', updateEditing);
    listen(scope, 'focusout', () => queueMicrotask(updateEditing));
    listen(scope, 'compositionstart', event => { if (editable(event.target)) { composing = true; updateEditing(); } });
    listen(scope, 'compositionend', () => { composing = false; updateEditing(); });
    listen(scope, 'input', updateEditing);
    listen(doc, 'visibilitychange', updateVisibility);
    listen(view, 'pagehide', () => { pageVisible = false; updateVisibility(); });
    listen(view, 'pageshow', () => { pageVisible = true; updateVisibility(); });
    if (media?.addEventListener) listen(media, 'change', () => controller.setReducedMotion(media.matches));
    else if (media?.addListener) { const changed = () => controller.setReducedMotion(media.matches); media.addListener(changed); removers.push(() => media.removeListener(changed)); }
    const api = {
      emit: controller.emit, setBusy: controller.setBusy, getState: controller.getState,
      setLanguage(value) { if (!destroyed) { language = value === 'en' ? 'en' : 'zh-CN'; label(); } },
      setEditing(value) { manuallyEditing = !!value; updateEditing(); },
      setVisible(value) { visible = !!value; updateVisibility(); },
      setEnabled(value) { controller.setEnabled(value); },
      destroy() {
        if (destroyed) return;
        destroyed = true; controller.destroy(); stop();
        for (const remove of removers.splice(0)) remove();
        host.replaceChildren(); mounted.delete(host); instances.delete(api);
      }
    };
    mounted.set(host, api); instances.add(api); updateEditing();
    return api;
  }

  return { createController, mount, petPicture, getEnabled: () => motionEnabled, setEnabled(value) { motionEnabled = !!value; for (const instance of instances) instance.setEnabled(motionEnabled); } };
});

;
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:767px)');
  const animations = new Map(), requests = new Map();
  let workspace, coach, dock, dockDrag, initialized = false, feedbackTimer, serial = 0, badge, badgeEpoch = 0;
  let enabled = true, focus = false;
  try { enabled = localStorage.getItem('factorlab-character-motion') !== 'off'; } catch {}
  const language = () => window.FactorLabApp?.getUI().lang || 'zh-CN';
  const words = {
    'zh-CN': {success:'操作已完成', account:'已登录，继续研究', save:'已保存到此浏览器', caution:'请查看本次提示', fallback:'规则提示已生成'},
    en: {success:'Operation complete', account:'All set. Continue your research.', save:'Progress saved', caution:'Review the notice and check the evidence', fallback:'Reply ready. Rule fallback is in use.'}
  };
  function stopMotion() {
    badgeEpoch++;
    for (const animation of animations.values()) animation.revert?.();
    animations.clear(); badge?.destroy(); badge = null;
  }
  function surface(root) {
    stopMotion();
    if (!root || reduced.matches || document.hidden || !window.anime?.animate) return;
    const targets = [...root.querySelectorAll('.panel, .review-stat, .backtest-summary, .cycle-evidence, .cycle-inference')].filter(el => el.getClientRects().length);
    const nodes = targets.length ? targets.slice(0, 8) : [root];
    const animation = anime.animate(nodes, {opacity:[.5,1], translateY:[8,0], duration:260, delay:anime.stagger(22), ease:'outCubic', onComplete:()=>animations.delete(root)});
    animations.set(root, animation);
  }
  function select(node) {
    if (reduced.matches || document.hidden || !window.anime?.animate) return;
    animations.get(node)?.revert?.();
    animations.set(node, anime.animate(node, {scale:[.98,1], duration:180, ease:'outQuad', onComplete:()=>animations.delete(node)}));
  }
  function showFeedback(key) {
    const node = $('companion-feedback'); if (!node) return;
    clearTimeout(feedbackTimer); node.dataset.message = key;
    node.textContent = words[language()][key] || words[language()].success; node.hidden = false;
    feedbackTimer = setTimeout(() => { node.hidden = true; }, 6500);
  }
  function researchBadge() {
    const epoch=++badgeEpoch;
    badge?.destroy(); badge=null;
    const status=$('backtest-status');
    if (!status || reduced.matches || !enabled || document.hidden) return;
    if (!window.lottie) { window.FactorLabEnhancements?.loadBadge().then(loaded=>{if(loaded&&epoch===badgeEpoch&&status.isConnected&&!focus)researchBadge();});return; }
    const host=document.createElement('span');host.className='research-badge';host.setAttribute('aria-hidden','true');status.prepend(host);
    const k=value=>({a:0,k:value});
    const keyframes=[{t:0,s:[0],e:[100],i:{x:[.67],y:[1]},o:{x:[.33],y:[0]}},{t:24,s:[100]}];
    const animationData={v:'5.13.0',fr:30,ip:0,op:30,w:48,h:48,nm:'Research completed',ddd:0,assets:[],layers:[{ddd:0,ind:1,ty:4,nm:'Evidence seal',sr:1,ks:{o:k(100),r:k(0),p:k([24,24,0]),a:k([0,0,0]),s:k([100,100,100])},ao:0,ip:0,op:30,st:0,bm:0,shapes:[{ty:'gr',it:[{ty:'el',p:k([0,0]),s:k([36,36]),d:1},{ty:'st',c:k([184/255,188/255,195/255,1]),o:k(100),w:k(2),lc:2,lj:2},{ty:'tm',s:k(0),e:{a:1,k:keyframes},o:k(0),m:1},{ty:'tr',p:k([0,0]),a:k([0,0]),s:k([100,100]),r:k(-90),o:k(100),sk:k(0),sa:k(0)}]},{ty:'gr',it:[{ty:'sh',ks:k({i:[[0,0],[0,0],[0,0]],o:[[0,0],[0,0],[0,0]],v:[[-9,0],[-2,7],[10,-7]],c:false})},{ty:'st',c:k([184/255,188/255,195/255,1]),o:k(100),w:k(3),lc:2,lj:2},{ty:'tm',s:k(0),e:{a:1,k:keyframes},o:k(0),m:1},{ty:'tr',p:k([0,0]),a:k([0,0]),s:k([100,100]),r:k(0),o:k(100),sk:k(0),sa:k(0)}]}]}]};
    badge=lottie.loadAnimation({container:host,renderer:'svg',loop:false,autoplay:true,animationData});
  }
  function bindDock(button, pet) {
    const viewport=window.visualViewport;
    const offsets={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    let position, drag, suppressClick=false;
    const move=(x,y)=>{
      const {width,height}=button.getBoundingClientRect(), margin=8;
      const left=(viewport?.offsetLeft??0)+margin, top=(viewport?.offsetTop??0)+margin;
      const right=(viewport?.width??window.innerWidth)+left-width-2*margin;
      const viewportBottom=(viewport?.height??window.innerHeight)+top-2*margin;
      const railTop=mobile.matches?document.querySelector('.sidebar').getBoundingClientRect().top:Infinity;
      const bottom=Math.min(viewportBottom,railTop-margin)-height;
      position={x:Math.max(left,Math.min(x,right)),y:Math.max(top,Math.min(y,bottom))};
      button.style.left=position.x+'px';
      button.style.top=position.y+'px';
      button.style.right=button.style.bottom='auto';
    };
    const clamp=()=>{if(position&&!button.hidden)move(position.x,position.y);};
    button.addEventListener('pointerdown',event=>{
      if(!event.isPrimary||event.button!==0)return;
      const {left,top}=button.getBoundingClientRect();
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,left,top,moved:false};
      suppressClick=false;
      button.setPointerCapture?.(event.pointerId);
    });
    button.addEventListener('pointermove',event=>{
      if(drag?.id!==event.pointerId||button.hidden)return;
      const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
      if(!drag.moved&&Math.hypot(dx,dy)<6)return;
      drag.moved=true;
      button.dataset.dragging='';
      move(drag.left+dx,drag.top+dy);
    });
    const endDrag=event=>{
      if(drag?.id!==event.pointerId)return;
      suppressClick=drag.moved;
      drag=null;
      delete button.dataset.dragging;
    };
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,endDrag);
    button.addEventListener('click',event=>{
      if(suppressClick&&event.detail!==0){event.preventDefault();event.stopPropagation();return;}
      pet.emit('welcome');
    });
    button.addEventListener('keydown',event=>{
      if(event.altKey||event.ctrlKey||event.metaKey||(!Object.hasOwn(offsets,event.key)&&event.key!=='Home'))return;
      event.preventDefault();
      if(event.key==='Home'){
        position=null;
        for(const edge of ['left','right','top','bottom'])button.style.removeProperty(edge);
      }else{
        const {left,top}=button.getBoundingClientRect();
        const offset=offsets[event.key];
        move(left+offset[0]*24,top+offset[1]*24);
      }
    });
    window.addEventListener('resize',clamp);
    viewport?.addEventListener('resize',clamp);
    viewport?.addEventListener('scroll',clamp);
    return {clamp,destroy(){
      window.removeEventListener('resize',clamp);
      viewport?.removeEventListener('resize',clamp);
      viewport?.removeEventListener('scroll',clamp);
    }};
  }
  function visible() {
    if (!initialized) return;
    const drawer=$('coach-drawer'), coachOpen=drawer.open;
    const modal=document.querySelector('dialog[open]');
    workspace.setVisible(!modal && $('mobile-coach').getClientRects().length>0);
    coach.setVisible(coachOpen&&$('coach-mascot').getClientRects().length>0);
    const coachModal=coachOpen&&(mobile.matches||drawer.hasAttribute('data-modal')||
      (window.CSS?.supports?.('selector(:modal)')&&drawer.matches(':modal')));
    const otherDialog=document.querySelector('dialog[open]:not(#coach-drawer)');
    const button=$('pet-dock'), hideDock=!!(focus||otherDialog||coachModal);
    if(button.hidden!==hideDock){
      button.hidden=hideDock;
      if(!hideDock)dockDrag.clamp();
    }
    dock.setVisible(!hideDock);
  }
  function react(state,id,includeDock=true) {
    visible();
    ($('coach-drawer').open?coach:workspace).emit(state,{id});
    if(includeDock)dock.emit(state==='growth'||state==='milestone'?'success':state,{id});
  }
  function labelDock() {
    const button=$('pet-dock'), en=language()==='en';
    button.setAttribute('aria-label',en?'Greet your companion':'问候桌宠');
    button.setAttribute('aria-description',en?'Use the arrow keys to move. Press Home to reset its position.':'方向键移动，Home 恢复位置。');
    dock.setLanguage(language());
  }
  function initialize() {
    if(initialized || !window.FactorLabApp || !window.FactorMascot) return;
    initialized=true;FactorMascot.setEnabled(enabled);
    const choice=$('research-pet');
    const petKey='factorlab-research-pet';
    try{if(localStorage.getItem(petKey)==='kurumi')choice.value='kurumi';}catch{}
    document.documentElement.dataset.researchPet=choice.value;
    $('pet-preview').append(FactorMascot.petPicture(document));
    choice.addEventListener('change',()=>{
      document.documentElement.dataset.researchPet=choice.value;
      try{localStorage.setItem(petKey,choice.value);}catch{}
    });
    workspace=FactorMascot.mount($('mobile-coach'),{context:'workspace',language:language(),pet:true,launcher:true});
    coach=FactorMascot.mount($('coach-mascot'),{context:'coach',language:language(),focusRoot:$('coach-drawer'),pet:true});
    const dockButton=$('pet-dock');
    dock=FactorMascot.mount(dockButton,{context:'workspace',language:language(),pet:true,launcher:true,focusRoot:dockButton});
    dockDrag=bindDock(dockButton,dock);
    labelDock();
    $('character-motion').checked=enabled;
    $('character-motion').addEventListener('change',()=>{
      enabled=$('character-motion').checked;FactorMascot.setEnabled(enabled);workspace.setEnabled(enabled&&!focus);coach.setEnabled(enabled&&!focus);if(!enabled){badge?.destroy();badge=null;}
      dock.setEnabled(enabled&&!focus);
      try{localStorage.setItem('factorlab-character-motion',enabled?'on':'off');}catch{}
    });
    for(const id of ['open-coach','mobile-coach'])$(id).addEventListener('click',()=>{visible();coach.emit('welcome');});
    const observer=new MutationObserver(visible);
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
    if($('coach-empty'))observer.observe($('coach-empty'),{attributes:true,attributeFilter:['hidden']});
    window.addEventListener('resize',visible);
    window.addEventListener('pagehide',event=>{stopMotion();clearTimeout(feedbackTimer);if(event.persisted)return;observer.disconnect();workspace.destroy();coach.destroy();dock.destroy();dockDrag.destroy();window.removeEventListener('resize',visible);});
    window.addEventListener('pageshow',visible);
    visible();
  }
  document.addEventListener('factorlab:render',()=>{
    initialize();if(!initialized)return;
    workspace.setLanguage(language());coach.setLanguage(language());labelDock();
    const notice=$('companion-feedback');if(!notice.hidden && notice.dataset.message !== 'guidance')notice.textContent=words[language()][notice.dataset.message];
  });
  document.addEventListener('factorlab:feedback',event=>{
    initialize();if(!initialized)return;
    const {kind,stage,id,returnValue,benchmarkReturn}=event.detail;
    if(kind==='backtest'){
      if(!focus){
        researchBadge();
        if(stage==='success'){visible();dock.emit('success');}
      }
      return;
    }
    if(kind==='allocation'||kind==='settlement'){
      if(stage==='success'){
        const belowBenchmark=kind==='settlement'&&Number.isFinite(returnValue)&&Number.isFinite(benchmarkReturn)&&returnValue<benchmarkReturn;
        visible();
        dock.emit(belowBenchmark?'caution':'success',{id:kind+':'+id,replace:true});
      }
      return;
    }
    const key=kind+':'+(id??++serial);
    if(['coach','check'].includes(kind)){
      if(stage==='start'){
        requests.set(kind,key);workspace.setBusy(key,true);if(kind==='coach')coach.setBusy(key,true);return;
      }
      if(requests.get(kind)!==key)return;
      requests.delete(kind);workspace.setBusy(key,false);if(kind==='coach')coach.setBusy(key,false);
      if(stage==='cancel')return;
    }
    let state=stage==='success'?'success':'caution',message=stage==='success'&&kind==='account'?'account':stage==='success'&&kind==='save'?'save':stage==='fallback'?'fallback':'caution';
    if(stage==='success' && !['account','save'].includes(kind))message='success';
    react(state,key);showFeedback(message);
  });
  document.addEventListener('factorlab:guidance',event=>{
    initialize();if(!initialized)return;
    const next=event.detail,notice=$('companion-feedback');focus=next.focus;
    workspace.setEnabled(enabled&&!focus);coach.setEnabled(enabled&&!focus);dock.setEnabled(enabled&&!focus);visible();
    if(focus){badge?.destroy();badge=null;}
    if(notice.dataset.message==='guidance'&&!notice.hidden){
      if(next.activeFeedback && (!focus || next.activeFeedback.necessary)) notice.textContent=next.activeFeedback.text;
      else notice.hidden=true;
    }
    const item=next.feedback;if(!item || (focus&&!item.necessary))return;
    if(item.motion)react(item.motion,item.key+':'+Date.now(),item.kind!=='completion');
    clearTimeout(feedbackTimer);notice.dataset.message='guidance';notice.textContent=item.text;notice.hidden=false;
    feedbackTimer=setTimeout(()=>{notice.hidden=true;},6500);
  });
  function resetFeedback(){
    badgeEpoch++;
    clearTimeout(feedbackTimer);if($('companion-feedback'))$('companion-feedback').hidden=true;
    for(const key of requests.values()){workspace?.setBusy(key,false);coach?.setBusy(key,false);}requests.clear();
    badge?.destroy();badge=null;
  }
  for(const name of ['factorlab:restore','factorlab:profile','factorlab:new'])document.addEventListener(name,resetFeedback);
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-preset], .sector-card, .reason-chip, #confirm, #apply-factors');
    if(target && !target.disabled)select(target);
  });
  document.addEventListener('factorlab:view',()=>{visible();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMotion();});
  const motionChanged=()=>{if(reduced.matches)stopMotion();};
  if(typeof reduced.addEventListener==='function')reduced.addEventListener('change',motionChanged);
  else reduced.addListener?.(motionChanged);
  window.FactorExperience={surface,getState:()=>({requests:[...requests.values()],enabled,workspace:workspace?.getState(),coach:coach?.getState()})};
  initialize();
})();

;
(function(){"use strict";const icons={"chart-line-up":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z\"/></svg>","squares-four":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z\"/></svg>","flask":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z\"/></svg>","sliders-horizontal":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z\"/></svg>","shield-check":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.26,47,25.53a8,8,0,0,0,4.2,0c1-.27,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Zm0,72c0,37.07-13.66,67.16-40.6,89.42A129.3,129.3,0,0,1,128,223.62a128.25,128.25,0,0,1-38.92-21.81C61.82,179.51,48,149.3,48,112l0-56,160,0ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z\"/></svg>","notebook":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M184,112a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h64A8,8,0,0,1,184,112Zm-8,24H112a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm48-88V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H72V48H48Zm160,0V48H88V208H208Z\"/></svg>","circles-three":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M172,76a44,44,0,1,0-44,44A44.05,44.05,0,0,0,172,76Zm-44,28a28,28,0,1,1,28-28A28,28,0,0,1,128,104Zm60,24a44,44,0,1,0,44,44A44.05,44.05,0,0,0,188,128Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,188,200ZM68,128a44,44,0,1,0,44,44A44.05,44.05,0,0,0,68,128Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,68,200Z\"/></svg>","book-open":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z\"/></svg>","sparkle":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z\"/></svg>","gear-six":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm109.94-52.79a8,8,0,0,0-3.89-5.4l-29.83-17-.12-33.62a8,8,0,0,0-2.83-6.08,111.91,111.91,0,0,0-36.72-20.67,8,8,0,0,0-6.46.59L128,41.85,97.88,25a8,8,0,0,0-6.47-.6A112.1,112.1,0,0,0,54.73,45.15a8,8,0,0,0-2.83,6.07l-.15,33.65-29.83,17a8,8,0,0,0-3.89,5.4,106.47,106.47,0,0,0,0,41.56,8,8,0,0,0,3.89,5.4l29.83,17,.12,33.62a8,8,0,0,0,2.83,6.08,111.91,111.91,0,0,0,36.72,20.67,8,8,0,0,0,6.46-.59L128,214.15,158.12,231a7.91,7.91,0,0,0,3.9,1,8.09,8.09,0,0,0,2.57-.42,112.1,112.1,0,0,0,36.68-20.73,8,8,0,0,0,2.83-6.07l.15-33.65,29.83-17a8,8,0,0,0,3.89-5.4A106.47,106.47,0,0,0,237.94,107.21Zm-15,34.91-28.57,16.25a8,8,0,0,0-3,3c-.58,1-1.19,2.06-1.81,3.06a7.94,7.94,0,0,0-1.22,4.21l-.15,32.25a95.89,95.89,0,0,1-25.37,14.3L134,199.13a8,8,0,0,0-3.91-1h-.19c-1.21,0-2.43,0-3.64,0a8.08,8.08,0,0,0-4.1,1l-28.84,16.1A96,96,0,0,1,67.88,201l-.11-32.2a8,8,0,0,0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.09,8.09,0,0,0-3-3.06l-28.6-16.29a90.49,90.49,0,0,1,0-28.26L61.67,97.63a8,8,0,0,0,3-3c.58-1,1.19-2.06,1.81-3.06a7.94,7.94,0,0,0,1.22-4.21l.15-32.25a95.89,95.89,0,0,1,25.37-14.3L122,56.87a8,8,0,0,0,4.1,1c1.21,0,2.43,0,3.64,0a8.08,8.08,0,0,0,4.1-1l28.84-16.1A96,96,0,0,1,188.12,55l.11,32.2a8,8,0,0,0,1.22,4.22c.62,1,1.23,2,1.8,3.06a8.09,8.09,0,0,0,3,3.06l28.6,16.29A90.49,90.49,0,0,1,222.9,142.12Z\"/></svg>","scan":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M224,40V80a8,8,0,0,1-16,0V48H176a8,8,0,0,1,0-16h40A8,8,0,0,1,224,40ZM80,208H48V176a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H80a8,8,0,0,0,0-16Zm136-40a8,8,0,0,0-8,8v32H176a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V176A8,8,0,0,0,216,168ZM40,88a8,8,0,0,0,8-8V48H80a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V80A8,8,0,0,0,40,88ZM80,72h96a8,8,0,0,1,8,8v96a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V80A8,8,0,0,1,80,72Zm8,96h80V88H88Z\"/></svg>","arrow-up-right":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z\"/></svg>","arrow-right":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z\"/></svg>","lock-key":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M128,112a28,28,0,0,0-8,54.83V184a8,8,0,0,0,16,0V166.83A28,28,0,0,0,128,112Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,128,152Zm80-72H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z\"/></svg>","arrow-left":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z\"/></svg>","info":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z\"/></svg>","flag-checkered":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M227.32,48.75A8,8,0,0,0,218.76,50c-28,24.22-51.72,12.48-79.21-1.13C111.07,34.76,78.78,18.79,42.76,50A8,8,0,0,0,40,56V224a8,8,0,0,0,16,0V179.77c26.79-21.16,49.87-9.75,76.45,3.41,28.49,14.09,60.77,30.06,96.79-1.13a8,8,0,0,0,2.76-6V56A8,8,0,0,0,227.32,48.75ZM216,71.6v40.65c-14,11.06-27,13.22-40,10.88V79.34A60.05,60.05,0,0,0,216,71.6Zm-56,3.76v43c-6.66-2.67-13.43-6-20.45-9.48-8.82-4.37-18-8.91-27.55-12.18v-43c6.66,2.66,13.43,6,20.45,9.48C141.27,67.55,150.46,72.09,160,75.36ZM96,48.91V92.69a60.06,60.06,0,0,0-40,7.75V59.78C70,48.72,83,46.57,96,48.91ZM86.58,152A60.06,60.06,0,0,0,56,160.43V119.78c14-11.06,27-13.22,40-10.88v43.8A65.61,65.61,0,0,0,86.58,152ZM112,156.67v-43c6.66,2.66,13.43,6,20.45,9.48,8.82,4.37,18,8.9,27.55,12.17v43c-6.66-2.67-13.43-6-20.45-9.48C130.73,164.47,121.54,159.94,112,156.67Zm64,26.45v-43.8a65.61,65.61,0,0,0,9.42.72A60.11,60.11,0,0,0,216,131.57v40.68C202,183.31,189,185.46,176,183.12Z\"/></svg>","download-simple":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z\"/></svg>","x":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z\"/></svg>","arrow-up":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"currentColor\"><path d=\"M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z\"/></svg>"};const atlasIcons = new Set(['research','factors','cycle','backtest','allocation','risk','journal','coach','evidence','account','save','settings','semiconductor','robotics','materials','energy','infrastructure','cash']);
const aliases = {
  'chart-line-up':'research', 'squares-four':'research', 'flask':'backtest',
  'sliders-horizontal':'allocation', 'shield-check':'risk', 'notebook':'journal',
  'circles-three':'cycle', 'book-open':'evidence', 'sparkle':'coach',
  'gear-six':'settings', 'scan':'cycle', 'flag-checkered':'journal'
};
const render = () => document.querySelectorAll('[data-icon]').forEach(el => {
  const name = el.dataset.icon, atlas = aliases[name] || (atlasIcons.has(name) ? name : null);
  if (atlas) {
    if (el.querySelector('.woodcut-icon')?.dataset.atlas !== atlas) el.innerHTML = '<span class="woodcut-icon" data-atlas="' + atlas + '" aria-hidden="true"></span>';
  } else {
    const svg = icons[name];
    if (svg && !el.querySelector('svg')) el.innerHTML = svg;
  }
});
window.FactorLabIcons={render};render();const atlasImage = new Image();
atlasImage.onload = () => {
  const ready = () => document.documentElement.setAttribute('data-icon-atlas-ready','');
  if (atlasImage.decode) atlasImage.decode().then(ready).catch(() => {});
  else ready();
};
atlasImage.src = new URL('assets/icons/woodcut-atlas.png',document.currentScript.src).href;
})();

;
(function(root) {
  'use strict';
  const topics = [
    ['backtest', /回测|backtest/i,
      '回测就是把一套选择规则放进历史数据，看看它当时会怎样表现。',
      '先选因子，再运行回测，最后把收益、最大回撤和基准一起看。这里使用合成教学数据，结果不能证明真实市场有效。',
      'Backtesting applies a selection rule to historical data to see how it would have behaved.',
      'Choose factors, run the backtest, then compare returns, maximum drawdown and the benchmark. This exercise uses synthetic data; it does not establish real-market effectiveness.'],
    ['factor', /因子|factor|动量|momentum|低波动|volatility|质量|quality|价值|value/i,
      '因子就是选行业时采用的观察角度。这里可以调整动量、价值、质量和低波动的重视程度。',
      '因子权重决定“怎么选”，行业配置决定“钱放在哪”。先选你能解释的角度，再用回测检查它是否稳定。',
      'A factor is a lens for comparing sectors. Here you can weight momentum, value, quality and low volatility.',
      'Factor weights describe how you rank sectors; allocation weights describe where the portfolio is invested. Start with a lens you can explain, then check its consistency in the backtest.'],
    ['ic', /(^|\W)ic(\W|$)|因子功效|相关系数|rank/i,
      'IC 用来检查：因子当时给出的高低排序，和之后实际收益的排序是否一致。',
      '不能只看某一次 IC。还要看样本数、不同时段是否稳定，以及回测中的收益和风险。这里的功效指标只针对合成样本。',
      'IC checks whether factor rankings agree with the returns observed afterwards.',
      'Do not judge a factor from one IC reading. Check the sample size, consistency over time, returns and risk. These results describe synthetic samples only.'],
    ['cycle', /周期|cycle|复苏|扩张|衰退|过热|滞胀/i,
      '行业周期描述经营环境正在改善还是转弱。订单、利润和融资条件可能不会同时转向。',
      '先确认当前已披露的线索，再想它会怎样传到收入、成本和盈利。游戏里的周期是简化教学判断，不是真实经济预测。',
      'A sector cycle describes improving or weakening business conditions. Orders, profits and financing can turn at different times.',
      'Check disclosed evidence first, then trace how it may affect revenue, costs and profits. The cycle labels here are simplified teaching signals, not economic forecasts.'],
    ['benchmark', /基准|benchmark|等权/i,
      '基准是一条对照线：用它检查你的配置是否比简单持有行业组合更好。',
      '本模拟的基准是五个行业各占 20%、每日再平衡、不计交易成本、不持有现金。比较时要留意这些假设与你的组合不同。',
      'A benchmark is a reference portfolio for comparing your allocation with a simple sector mix.',
      'This simulation uses five sectors at 20% each, daily rebalancing, no transaction costs and no cash. Those assumptions differ from your portfolio.'],
    ['risk', /风险|回撤|现金|risk|drawdown|cash|sharpe|夏普/i,
      '先看最集中的行业、现金缓冲，以及组合已经经历的最大回撤。',
      '最大回撤记录从此前高点跌落的幅度。少亏一些和赚得更多是不同目标；不要只盯收益，也不要把历史回撤当成未来上限。',
      'Start with the largest sector weight, the cash buffer and the drawdown already experienced.',
      'Maximum drawdown measures the fall from an earlier peak. Limiting losses and increasing returns are different aims; past drawdown is not a future loss limit.'],
    ['positioning', /长期|短期|战术|配置|allocation|tactical|long.term|position/i,
      '长期定位回答“为什么持续关注这个行业”，短期战术回答“这次新证据是否值得调整比例”。',
      '先写一个长期理由，再写清当前证据带来了什么变化。调整前检查总比例、单行业上限和现金；决定仍由你确认。',
      'Long-term positioning explains why a sector matters over time; tactical allocation responds to new evidence.',
      'Write the long-term reason first, then explain what changed. Check the total, sector limit and cash before you confirm a decision.'],
    ['orders', /订单|利润|盈利|order|profit|earning/i,
      '订单增加只是线索，还要看它能否变成收入和利润。',
      '可以顺着“订单 → 交付 → 收入 → 成本 → 利润”检查。需求改善与估值偏贵可能同时存在；只用当前已披露的材料判断。',
      'More orders are a clue; you still need to see whether they become revenue and profit.',
      'Follow orders, delivery, revenue, costs and profit. Improving demand and expensive valuations can coexist. Use only the evidence already disclosed.'],
    ['saving', /存档|保存|save|saving|sync|同步/i,
      '页面中的草稿保存在当前浏览器；账号存档需要进入账号窗口，明确保存为一条存档。',
      'GitHub Pages 版支持浏览器本地保存与导入导出。云端存档只有在服务器账号服务可用时才成立，保存成功后请检查存档列表。',
      'Browser drafts stay in this browser. An account save requires explicitly saving a named record in the account window.',
      'GitHub Pages supports browser-local data and import/export. Server saves require a working account service; check the save list after saving.'],
    ['chart', /走势|走线|图表|曲线|chart|line|curve/i,
      '先看图例，再看同一时间点的数值；一条线上升不代表所有行业都变好了。',
      '把曲线与事件时间对应起来，再区分已经观察到的变化和你对未来的猜测。图表中的市场路径是合成模拟。',
      'Start with the legend and compare values at the same date. One rising line does not mean every sector improved.',
      'Match the curve to disclosed events, then separate observations from expectations. The market path is synthetic.']
  ];
  const matchTopic = text => topics.find(topic => topic[1].test(text));
  const payrollTerm = /非农|\b(?:payrolls?|nfp)\b/i;

  function replayReply(question, lang = 'zh-CN', context = root.FactorLabReplayUI?.getContext()) {
    const en = lang === 'en';
    const tr = (zh, english) => en ? english : zh;
    const q = String(question || '').trim().slice(0, 1000);
    const archiveQuestion = /宏观回放|发布回放|2024[-\/]0?(?:6[-\/]0?7|7[-\/](?:0?5|11))|6\s*月\s*7\s*日|7\s*月\s*(?:5|11)\s*日|macro.{0,10}replay/i.test(q);
    const releaseSeries = payrollTerm.test(q) || /就业报告|失业率|\b(?:CPI|BLS|unemployment|employment (?:situation|report))\b/i.test(q);
    const releaseFigures = /实际值|公布值|数值|修订|是多少|多少人|headline number|actual (?:figure|reading|number)|revisions?/i.test(q);
    const refersToOpenRelease = context?.active && (
      !q || releaseSeries && releaseFigures || /^(?:修订|revisions?)[呢吗？?\s]*$|(?:这份|这条|本期).{0,6}(?:公告|报告|数据|数值|修订)|这次公布|发布前|公布前|本次修订|this (?:release|report)|before (?:the )?release/i.test(q)
    );
    if (!archiveQuestion && !refersToOpenRelease) return null;

    const replay = root.FactorLabReplay || (typeof module !== 'undefined' && module.exports ? require('./replay-data.js') : null);
    const release = replay?.releaseSnapshot(context?.releaseId, context?.revealed, lang);
    const answer = { mode: 'example', detail: '', references: [], sources: [] };
    if (!release) return { ...answer, summary: tr('打开宏观回放，先选择要核对的公告。', 'Open macro replay and select the release you want to check.') };
    if (!release.rows) return {
      ...answer,
      summary: tr('先区分发布前已知的信息与即将公布的数据。', 'Separate what was known beforehand from the upcoming release.'),
      detail: release.knownBefore.join(' ') + tr(' 点击“公布本期数据”后，再核对本期数值与修订。', ' Reveal this release to check the current figures and revisions.')
    };
    const asksAboutMarket = /超预期|涨跌|股市|利率|surprise|stock market|rates/i.test(q);
    return {
      ...answer,
      summary: asksAboutMarket ? release.caveat : release.guidance,
      detail: [release.releaseLocal, ...release.rows.map(([label, value]) => label + ' ' + value)].join(' · '),
      sources: [release.source]
    };
  }

  function payrollImpactReply(question, lang = 'zh-CN') {
    const q = String(question || '').trim().slice(0, 1000);
    const strongPrint = /过高|太高|偏高|偏强|强劲|高于.{0,4}预期|超.{0,3}预期|\b(?:strong(?:er)?|hot(?:ter)?|above expectations|higher than expected|beat expectations)\b/i.test(q);
    const specificOrMixed = /(?:我[的们]?|本局|本轮|这轮|当前).{0,10}(?:配置|组合|持仓|仓位|权重)|本月|最新|刚公布|今天|上个月|低于|弱于|偏弱|\b(?:my|our|current) (?:draft |simulated )?(?:portfolio|allocation|holdings)\b|\b(?:latest|today|this month|last month|weaker|below expectations)\b/i.test(q);
    if (!payrollTerm.test(q) || !strongPrint || specificOrMixed) return null;
    const en = lang === 'en';
    return {
      mode: 'guide', references: [],
      summary: en
        ? 'When nonfarm payroll gains beat market expectations, the labor market looks stronger than expected. If wage growth also surprises to the upside, investors may price in fewer near-term Fed rate cuts. Treasury yields can rise and richly valued growth stocks may come under pressure. Strong employment can also support consumer demand and corporate earnings, so stock prices depend on which effect dominates.'
        : '非农新增就业高于市场预期，通常说明劳动力市场比预想更强。如果平均时薪增速也超预期，市场可能减少对近期降息的押注，美债收益率可能上行，高估值成长股可能承压。另一方面，就业强劲也可能支撑消费和企业盈利，所以股市怎么走取决于哪种影响占主导。',
      detail: en
        ? 'Compare the release with the pre-release consensus, then check average hourly earnings, unemployment and revisions to the prior two months. Payrolls and unemployment come from different surveys. A high headline number by itself gives little guidance about the market reaction.'
        : '先对比公布值和发布前的市场预期，再一起看平均时薪、失业率和前两个月的修订。就业岗位数与失业率来自不同调查。要判断市场反应，还要看这些变化是否已经被价格反映。',
      sources: [
        { label: en ? 'BLS employment report technical note' : '美国劳工统计局就业报告技术说明', url: 'https://www.bls.gov/news.release/empsit.tn.htm' },
        { label: en ? 'Federal Reserve research on rates and asset prices' : '美联储关于利率与资产价格的研究', url: 'https://www.federalreserve.gov/econres/notes/feds-notes/are-rising-u-s-interest-rates-destabilizing-for-emerging-market-economies-20210623.html' }
      ]
    };
  }

  function offlineReply(state, question, lang = 'zh-CN', history = [], context) {
    const scoped = replayReply(question, lang, context) || payrollImpactReply(question, lang);
    if (scoped) return scoped;
    const en = lang === 'en', q = String(question || '').trim().slice(0, 1000);
    const answer = (summary, detail = '', references = [], sources = []) => ({ summary, detail, references, sources, mode: 'example' });
    if (/^(你好|您好|嗨|哈[喽啰]|早上好|晚上好|hello|hi|hey)[！!。.\s]*$/i.test(q)) return answer(en ? 'Hello! Would you like help getting started, or is there a term you want to unpack?' : '你好！想先了解怎么玩，还是有哪个词想让我讲明白？');
    if (/^(谢谢|多谢|感谢|thanks|thank you)[！!。.\s]*$/i.test(q)) return answer(en ? 'You are welcome. We can take the next step when you are ready.' : '不客气。准备好了，我们接着看下一步。');
    if (/你是谁|什么模型|连接|在线|who are you|which model|online|connected/i.test(q)) return answer(en ? 'I am the offline learning helper here. These replies are prepared guidance, not a live DeepSeek conversation.' : '现在是离线学习助手，回答来自预设教学提示；当前这条回复没有调用 DeepSeek。', en ? 'A live conversation needs the server-side AI connection. You can still ask about the workflow, backtests, factors or risk.' : '在线自由对话需要服务器接通 AI。这里仍可以解释流程、回测、因子和风险。');
    if (/开始|下一步|怎么玩|怎么做|怎么操作|从哪|what.*next|how.*start|getting started|walkthrough/i.test(q)) {
      const steps = {
        decision: ['到配置页调整比例，核对现金与费用后就能确认。引用证据、写理由和可推翻条件可留作复盘笔记。最终课程练习仍需完成回测与因子功效查看。', 'Adjust the weights, check cash and costs, then confirm. You can keep evidence, rationale and an invalidation condition in your review notes. The final course exercise still requires a backtest and efficacy review.'],
        simulating: ['你已经确认配置。继续推进模拟，遇到新事件时先读信息，再判断原来的理由是否还成立。', 'Your allocation is confirmed. Advance the simulation and review new events against your original reasoning.'],
        event: ['先读完本次事件，分清已确认事实和推测，再继续模拟。', 'Read the current event, separate confirmed facts from assumptions, then continue.'],
        review: ['先比较本轮结果和基准，再回看当时的理由。写下一条反思后进入下一轮。', 'Compare this round with the benchmark, revisit your original reason, and record one reflection before the next round.'],
        complete: ['六轮已结束。检查每轮理由与结果，整理长期定位、短期调整和你会改变的一点。', 'The six rounds are complete. Review reasons and results, then summarize positioning, tactical changes and one improvement.']
      };
      const step = steps[state?.phase] || steps.decision;
      return answer(step[en ? 1 : 0]);
    }
    if (/预测|必涨|稳赚|未来价格|下一.*涨|帮我买|帮我卖|guarantee|predict|future price|buy for me|sell for me/i.test(q)) return answer(en ? 'I cannot see future prices or place trades. We can examine the evidence available now and what would weaken your view.' : '我看不到未来价格，也不能替你交易。我们可以检查眼前的证据，以及什么新信息会推翻你的判断。');
    let topic = matchTopic(q);
    const followUp = /简单|举例|再讲|没懂|不懂|为什么|说清楚|什么意思|simpler|simply|simplify|plain language|example|explain again|why|what.*mean/i.test(q);
    if (!topic && followUp) {
      for (const item of (Array.isArray(history) ? history : []).slice(-12).reverse()) {
        if (item?.role === 'user' && typeof item.content === 'string' && (topic = matchTopic(item.content))) break;
      }
    }
    if (topic) {
      if (followUp && topic[0] === 'backtest') return answer(en ? 'Think of a rehearsal using the past: “If I had followed this rule then, what would have happened?”' : '把它想成用过去的数据彩排：“如果我当时按这个规则选，会发生什么？”', en ? 'A rehearsal helps test the rule; it cannot promise the same outcome next time.' : '彩排能帮助检查规则，但不能保证下一次也会一样。');
      if (followUp) return answer(topic[en ? 5 : 3], topic[en ? 4 : 2]);
      return answer(topic[en ? 4 : 2], topic[en ? 5 : 3]);
    }
    return answer(en ? 'The offline helper does not have a reliable answer to that yet. Is your question about evidence, backtesting, allocation or reviewing a result?' : '离线助手暂时无法可靠回答这个问题。你是在问证据、回测、配置，还是结果复盘？', en ? 'This is prepared local guidance. Open-ended conversation becomes available when the server AI service is connected.' : '这里是本地预设提示；服务器接通 AI 后才支持开放式多轮交流。');
  }
  const api = { offlineReply, replayReply, payrollImpactReply };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FactorLabAssistant = api;
})(typeof window === 'undefined' ? globalThis : window);

;
(function () {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gray = ['#202020', '#4b4b4b', '#777777', '#9e9e9e', '#bfbfbf', '#d8d8d8'];
  function curve(points) {
    if (!points.length) return '';
    let d = `M ${points[0][0]} ${points[0][1]}`;
    const slopes = points.slice(1).map((p, i) => (p[1] - points[i][1]) / (p[0] - points[i][0] || 1));
    const tangent = points.map((_, i) => i === 0 ? slopes[0] || 0 : i === points.length - 1 ? slopes[i - 1] || 0 : slopes[i - 1] * slopes[i] <= 0 ? 0 : 2 / (1 / slopes[i - 1] + 1 / slopes[i]));
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i], step = (b[0] - a[0]) / 3;
      d += ` C ${a[0] + step} ${a[1] + tangent[i - 1] * step},${b[0] - step} ${b[1] - tangent[i] * step},${b[0]} ${b[1]}`;
    }
    return d;
  }
  let serial = 0;
  const chartDefinitions = new WeakMap();
  const paintedDefinitions = new WeakMap();
  const chartHosts = new Set();
  function chartLayout(host) {
    const compact = host.clientWidth < 520, touch = matchMedia('(pointer: coarse)').matches;
    return {
      tooltip:{className:'factorlab-chart-tooltip',confine:true,triggerOn:'mousemove|click',textStyle:{fontSize:compact?12:14},extraCssText:'max-width:100%;white-space:normal;overflow-wrap:anywhere'},
      grid:{left:8,right:compact?10:24,top:24,bottom:compact?92:82,containLabel:true},
      xAxis:{axisLabel:{hideOverlap:true,fontSize:compact?11:12,formatter:value=>compact&&/^\d{4}-\d{2}-\d{2}$/.test(String(value))?String(value).slice(5):String(value)}},
      yAxis:{splitNumber:compact?3:5,axisLabel:{fontSize:compact?11:12}},
      legend:{bottom:0,type:'scroll',textStyle:{fontSize:compact?11:12}},
      dataZoom:[{type:'inside',disabled:touch,preventDefaultMouseMove:!touch},{type:'slider',bottom:compact?34:30,height:compact?26:18,handleSize:compact?'140%':'100%',moveHandleSize:compact?12:7,showDetail:!compact}]
    };
  }
  function drawBasicChart(host, definition, resizeOnly) {
    const {rows,series,label,format,xLabel,markLine} = definition;
    const width=Math.max(host.clientWidth||320,180),height=Math.max(host.clientHeight||260,150);
    const viewBox='0 0 '+width+' '+height;
    if (resizeOnly && host.querySelector('.factorlab-line-fallback')?.getAttribute('viewBox')===viewBox) return;
    const values=series.flatMap(item=>rows.map(row=>row[item.key])).filter(Number.isFinite);
    if (!values.length) { host.textContent='';return; }
    const min=Math.min(...values),max=Math.max(...values);
    const padding=(max-min)*.08 || Math.max(Math.abs(min)*.01,.001);
    const lower=min-padding,upper=max+padding;
    const yValues=[min,(min+max)/2,max];
    const left=Math.max(...yValues.map(value=>String(format(value)).length))*6+14;
    const right=width-12,top=16,bottom=height-34-series.length*17;
    if (right<=left || bottom<=top) return;
    const x=index=>rows.length===1?(left+right)/2:left+(right-left)*index/(rows.length-1);
    const y=value=>bottom-(bottom-top)*(value-lower)/(upper-lower);
    const grid=[...new Set(yValues)].map(value=>`<line x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}" stroke="#d6d0c5"/><text x="${left-6}" y="${y(value)+4}" text-anchor="end">${escape(format(value))}</text>`).join('');
    const ticks=[...new Set([0,Math.floor((rows.length-1)/2),rows.length-1])].map((index,i,all)=>{
      const anchor=all.length===1?'middle':i===0?'start':i===all.length-1?'end':'middle';
      return `<text x="${x(index)}" y="${bottom+17}" text-anchor="${anchor}">${escape(xLabel(rows[index]))}</text>`;
    }).join('');
    const boundary=markLine?rows.findIndex(row=>xLabel(row)===markLine.value):-1;
    const marker=boundary<0?'':`<line x1="${x(boundary)}" x2="${x(boundary)}" y1="${top}" y2="${bottom}" stroke="#9b744d" stroke-dasharray="3 3"><title>${escape(markLine.label)}</title></line>`;
    const traces=series.map(item=>{
      const parts=[];
      let points=[];
      const flush=()=>{
        if (points.length===1) {
          parts.push(`<circle cx="${points[0][0]}" cy="${points[0][1]}" r="3.4" fill="${escape(item.color)}"/>`);
        } else if (points.length>1) {
          parts.push(`<polyline fill="none" stroke="${escape(item.color)}" stroke-width="2" ${item.dash?'stroke-dasharray="5 4"':''} vector-effect="non-scaling-stroke" points="${points.map(point=>point.join(',')).join(' ')}"/>`);
        }
        points=[];
      };
      rows.forEach((row,index)=>{const value=row[item.key];if(Number.isFinite(value))points.push([x(index).toFixed(2),y(value).toFixed(2)]);else flush();});
      flush();
      return parts.join('');
    }).join('');
    const legend=series.map((item,i)=>{
      const position=bottom+36+i*17;
      return `<line x1="10" x2="27" y1="${position-4}" y2="${position-4}" stroke="${escape(item.color)}" stroke-width="2" ${item.dash?'stroke-dasharray="5 4"':''}/><text x="34" y="${position}">${escape(item.name)}</text>`;
    }).join('');
    host.innerHTML=`<svg class="factorlab-line-fallback" viewBox="${viewBox}" width="100%" height="100%" style="display:block" role="img" aria-label="${escape(label)}"><g fill="#62594e" font-size="11" font-family="sans-serif">${grid}${marker}${traces}${ticks}${legend}</g></svg>`;
  }
  function disposeChart(host) {
    try { window.echarts?.getInstanceByDom(host)?.dispose(); } catch {}
  }
  function drawChart(host, definition, resizeOnly=false) {
    if (!host.clientWidth || !host.clientHeight || !host.getClientRects().length) {
      if (!resizeOnly && !host.firstElementChild) {
        drawBasicChart(host,definition,false);
        paintedDefinitions.set(host,definition);
      }
      return;
    }
    const {rows,series,label,format,xLabel} = definition;
    const sameDefinition=paintedDefinitions.get(host)===definition;
    if (window.echarts) {
      try {
        const current=window.echarts.getInstanceByDom(host);
        const layout=chartLayout(host);
        const sizeChanged=current&&(current.getWidth()!==host.clientWidth||current.getHeight()!==host.clientHeight);
        if (sizeChanged) current.resize();
        if (resizeOnly && current && sameDefinition) {
          if (sizeChanged) current.setOption(layout);
          return;
        }
        if (!current) host.textContent='';
        const instance=current||window.echarts.init(host,null,{renderer:'svg'});
        const markLine=definition.markLine?{symbol:'none',silent:true,lineStyle:{color:'#9b744d',width:1,type:'dashed'},label:{formatter:definition.markLine.label||'',fontSize:11,color:'#6d6860'},data:[{xAxis:definition.markLine.value}]}:null;
        instance.setOption({...layout,animation:!reduced(),animationDuration:280,aria:{enabled:true,description:label},tooltip:{...layout.tooltip,trigger:'axis',valueFormatter:format},xAxis:{...layout.xAxis,type:'category',data:rows.map(xLabel)},yAxis:{...layout.yAxis,type:'value',scale:true},series:series.map((s,i)=>({name:s.name,type:'line',smooth:false,showSymbol:rows.length<3,data:rows.map(r=>r[s.key]),lineStyle:{color:s.color,width:2,type:s.dash?'dashed':'solid'},itemStyle:{color:s.color},...(i===0&&markLine?{markLine}:{})}))},true);
        if (!host.querySelector('svg')) throw Error('chartNotRendered');
        paintedDefinitions.set(host,definition);
        return;
      } catch {
        disposeChart(host);
      }
    }
    drawBasicChart(host,definition,resizeOnly&&sameDefinition);
    paintedDefinitions.set(host,definition);
  }
  const resizeCharts=()=>chartHosts.forEach(resizeChart);
  document.addEventListener('factorlab:charts-ready',resizeCharts);
  function releaseChart(host) {
    chartObserver?.unobserve(host);disposeChart(host);chartDefinitions.delete(host);paintedDefinitions.delete(host);chartHosts.delete(host);
  }
  function resizeChart(host) {
    if (!host.isConnected) { releaseChart(host);return; }
    const definition=chartDefinitions.get(host);
    if (definition) drawChart(host,definition,true);
  }
  const chartObserver = typeof ResizeObserver==='function'?new ResizeObserver(entries=>entries.forEach(entry=>resizeChart(entry.target))):null;
  document.addEventListener('factorlab:view',resizeCharts);
  if (!chartObserver) window.addEventListener('resize',resizeCharts);
  function chart(host, definition) {
    if (!host) return;
    chartHosts.forEach(previous=>{if(!previous.isConnected)releaseChart(previous);});
    host.style.touchAction='pan-y';host.setAttribute('aria-label',definition.label);host.tabIndex=0;
    chartDefinitions.set(host,definition);chartHosts.add(host);chartObserver?.observe(host);drawChart(host,definition);
  }

  function dial(host, weights, names) {
    if (!host) return;
    const center = [300,215], point = (v,r) => [center[0]+r*Math.cos(v*Math.PI*2-Math.PI/2),center[1]+r*Math.sin(v*Math.PI*2-Math.PI/2)];
    const pos = p => p.map(v=>v.toFixed(3)).join(' ');
    let start = 0;
    const sides = [[],[]];
    const paths = weights.map((value,i) => {
      const a=point(start,158),b=point(start+value,158),c=point(start+value,72),d=point(start,72);
      let path='';
      if(value>=1-1e-8)path=`M ${pos(a)} A 158 158 0 1 1 ${pos(point(start+.5,158))} A 158 158 0 1 1 ${pos(a)} L ${pos(d)} A 72 72 0 1 0 ${pos(point(start+.5,72))} A 72 72 0 1 0 ${pos(d)} Z`;
      else if(value>0)path=`M ${pos(a)} A 158 158 0 ${value>.5?1:0} 1 ${pos(b)} L ${pos(c)} A 72 72 0 ${value>.5?1:0} 0 ${pos(d)} Z`;
      const anchor=point(start+value/2,164),outer=point(start+value/2,181);
      if(value>0)sides[outer[0]<300?0:1].push({i,anchor,outer,y:outer[1]});
      start+=value;
      return `<path data-weight="${value}" d="${path}" fill="${gray[i]}" stroke="#eeede8" stroke-width="${value>=1-1e-8?0:Math.min(4,value*120)}" stroke-linejoin="round"><title>${escape(names[i])} ${(value*100).toFixed(1)}%</title></path>`;
    }).join('');
    const labels=sides.map((items,side)=>{
      items.sort((a,b)=>a.y-b.y);
      items.forEach((it,i)=>{it.y=Math.max(38,Math.min(390,it.y));if(i)it.y=Math.max(it.y,items[i-1].y+40);});
      if(items.length&&items.at(-1).y>390){items.at(-1).y=390;for(let i=items.length-2;i>=0;i--)items[i].y=Math.min(items[i].y,items[i+1].y-40);}
      return items.map(it=>`<path d="M ${pos(it.anchor)} L ${it.outer[0]} ${it.y} L ${side?530:70} ${it.y}" fill="none" stroke="#b8b7b2" stroke-width=".8"/><text x="${side?580:20}" y="${it.y-7}" text-anchor="${side?'end':'start'}">${escape(names[it.i])}</text><text class="dial-value" x="${side?580:20}" y="${it.y+12}" text-anchor="${side?'end':'start'}">${(weights[it.i]*100).toFixed(1).replace('.0','')}%</text>`).join('');
    }).join('');
    host.innerHTML=`<svg viewBox="0 0 600 430" role="img" aria-label="${escape(names.map((n,i)=>n+' '+(weights[i]*100).toFixed(1)+'%').join('，'))}">${paths}${labels}</svg>`;
  }
  document.addEventListener('toggle', event => {
    if (!(event.target instanceof HTMLDialogElement) || !event.target.open || reduced()) return;
    event.target.animate([{opacity:0,transform:'translateY(16px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});
  },true);
  window.FactorVisuals={curve,chart,dial};
})();

;
(function () {
  'use strict';
  let selectedId = '', compareId = '', range = 'all', scope = 'security', showWarmup = false, compareMode = false;

  function sliceRange(points) {
    const size = Number(range);
    return Number.isFinite(size) && size > 0 ? points.slice(-size) : points;
  }

  function dayLabel(point) {
    return point.day < 0 ? 'D−' + Math.abs(point.day) : 'D' + point.day;
  }

  function basketSeries(view, sector) {
    const ledger = view.ledger;
    const dates = new Map((ledger?.history || []).map(row => [row.day, row.asOf]));
    return (ledger?.baskets || []).map((basket, index) => {
      let level = 100;
      const points = [];
      for (const row of view.history) {
        if (row.day > view.day) break;
        if (row.day !== 0) {
          const dailyReturn = row.sectorReturns?.[index];
          if (!Number.isFinite(dailyReturn)) break;
          level *= 1 + dailyReturn;
        }
        points.push({day:row.day, time:dates.get(row.day), value:level});
      }
      return {id:'sector-' + index, name:sector ? sector(index) : basket.id, points};
    }).filter(item => item.points.length);
  }

  function summary(points, tr, num, unit) {
    if (points.length < 2) return `<p class="chart-empty-note">${tr('当前区间只有一个点，下一日才形成涨跌。','Only one point is available in this interval. A change forms on the next day.')}</p>`;
    const first = points[0], last = points.at(-1), change = first.value ? last.value / first.value - 1 : null;
    return `<div class="price-summary"><div><span>${tr('区间起点','Range start')}</span><strong>${num(first.value, 4)}</strong><small>${dayLabel(first)} · ${unit}</small></div><div><span>${tr('区间终点','Range end')}</span><strong>${num(last.value, 4)}</strong><small>${dayLabel(last)} · ${unit}</small></div><div><span>${tr('区间涨跌','Range change')}</span><strong class="${change < 0 ? 'negative' : change > 0 ? 'positive' : ''}">${Number.isFinite(change) ? (change > 0 ? '+' : '') + num(change * 100, 2) + '%' : '—'}</strong></div></div>`;
  }

  function render(root, ctx) {
    const {records, view, tr, esc, num, securityName, sector, meta, actions, bindActions, FactorVisuals} = ctx;
    if (!root || !view) return;
    const quotes = records.filter(record => record.type === 'price' && Array.isArray(record.data?.points))
      .map(record => {
        const id = record.instrumentIds[0];
        return {id, name:securityName(id), points:record.data.points, record};
      });
    const baskets = basketSeries(view, sector);
    if (!baskets.length) scope = 'security';
    const basketMode = scope === 'basket', includeWarmup = !basketMode && showWarmup;
    const series = basketMode ? baskets : quotes;
    if (!series.length) {
      root.innerHTML = `<h2>${tr('价格材料尚不可用','Price material unavailable')}</h2><p>${tr('当前快照未提供证券价格。','This snapshot does not contain security prices.')}</p>`;
      return;
    }
    const primary = series.find(item => item.id === selectedId) || series[0];
    selectedId = primary.id;
    const alternatives = series.filter(item => item.id !== selectedId);
    const secondary = alternatives.find(item => item.id === compareId) || alternatives[0];
    compareId = secondary?.id || '';
    const visible = item => sliceRange(item.points.filter(point => includeWarmup || point.day >= 0));
    const primaryPoints = visible(primary), secondaryPoints = secondary ? visible(secondary) : [];
    const secondaryByDay = new Map(secondaryPoints.map(point => [point.day, point.value]));
    const pairs = primaryPoints.filter(point => secondaryByDay.has(point.day));
    const baseA = pairs[0]?.value, baseB = secondaryByDay.get(pairs[0]?.day);
    const canCompare = compareMode && baseA > 0 && baseB > 0;
    const rows = canCompare ? pairs.map(point => ({day:point.day, primary:100 * (point.value / baseA), comparison:100 * (secondaryByDay.get(point.day) / baseB)}))
      : primaryPoints.map(point => ({day:point.day, primary:point.value}));
    const summaryPoints = canCompare ? rows.map(row => ({day:row.day, value:row.primary})) : primaryPoints;
    const latest = primaryPoints.at(-1);
    const change = primaryPoints.length > 1 ? latest.value / primaryPoints[0].value - 1 : null;
    const warmupVisible = includeWarmup && rows.some(point => point.day < 0);
    const selection = latest ? {from:primaryPoints[0].day, to:latest.day} : {};
    const unit = basketMode ? tr('点','points') : 'USD';
    const heading = basketMode ? tr('模拟行业篮子','Simulated sector baskets') : tr('证券价格与比较','Security prices & comparison');
    const normalized = tr('指数（起点 100）','Index (start 100)');
    const options = (items, selected) => items.map(item => `<option value="${esc(item.id)}" ${item.id === selected ? 'selected' : ''}>${esc(item.name)}</option>`).join('');
    const note = canCompare ? tr('区间第一个共同可见点设为 100，用于比较相对走势。','The first common observation is set to 100 to compare relative paths.')
      : basketMode ? tr('D0 为 100。按本局已发生的篮子收益逐日复利。','D0 starts at 100. The index compounds observed daily basket returns from this campaign.')
      : tr('教学证券报价，单位为美元/股。','Teaching security quotes in USD/share.');
    const provenance = basketMode ? `<details class="material-provenance"><summary>${tr('来源与计算口径','Source & method')}</summary><p>${tr('每日本行业篮子收益为成分证券报价收益按既定篮子权重加权，再逐日复利；不含现金、交易费或用户持仓影响。','Each basket’s daily return is the constituent price returns weighted by the fixed basket weights and then compounded. This excludes cash, fees, and user holdings.')}</p></details>`
      : `${meta(primary.record)}${actions(primary.record, selection)}<details class="evidence-explanation"><summary>${tr('如何解读','Interpretation')}</summary><p>${esc(primary.record.interpretation?.[document.documentElement.lang] || primary.record.interpretation?.en || '')}</p></details>`;

    root.innerHTML = `<div class="panel-head"><h2>${heading}</h2><span class="source-badge">${basketMode ? tr('模拟指数 · 点','Simulated index · points') : tr('模拟价格 · USD/股','Simulated price · USD/share')}</span></div>
      <div class="evidence-toolbar market-toolbar">
        ${baskets.length ? `<label>${tr('数据类型','Data type')} <select id="market-scope"><option value="security" ${basketMode ? '' : 'selected'}>${tr('个股价格','Security prices')}</option><option value="basket" ${basketMode ? 'selected' : ''}>${tr('行业篮子','Sector baskets')}</option></select></label>` : ''}
        <label>${basketMode ? tr('行业','Sector') : tr('证券','Security')} <select id="market-instrument">${options(series, selectedId)}</select></label>
        <label>${tr('区间','Range')} <select id="market-range"><option value="all" ${range === 'all' ? 'selected' : ''}>${includeWarmup ? tr('全部可见','All visible') : tr('开局至今','Since D0')}</option>${[10,30,90,365].map(size => `<option value="${size}" ${String(size) === String(range) ? 'selected' : ''}>${size}${tr(' 个观测',' observations')}</option>`).join('')}</select></label>
        <label class="market-toggle"><input id="market-compare" type="checkbox" ${compareMode ? 'checked' : ''} ${alternatives.length ? '' : 'disabled'}> ${tr('同起点比较','Compare from same start')}</label>
        ${basketMode ? '' : `<label class="market-toggle"><input id="market-warmup" type="checkbox" ${showWarmup ? 'checked' : ''}> ${tr('包含热身段','Include warm-up')}</label>`}
        ${compareMode && secondary ? `<label>${basketMode ? tr('对比行业','Compare sector') : tr('对比证券','Compare security')} <select id="market-compare-instrument">${options(alternatives, compareId)}</select></label>` : ''}
      </div>
      <div class="price-readout"><span>${basketMode ? tr('最近可见指数','Latest visible index') : tr('最近可见报价','Latest visible quote')}</span><strong>${num(latest?.value, 2)} <small>${unit}</small></strong><time>${latest ? esc(latest.time?.slice(0, 10) || '') + ' · ' + dayLabel(latest) : '—'}</time><span class="${change < 0 ? 'negative' : change > 0 ? 'positive' : ''}">${Number.isFinite(change) ? (change > 0 ? '+' : '') + num(change * 100, 2) + '%' : tr('下一日形成涨跌','Change forms next day')}</span></div>
      <p class="market-mode-note">${note}</p><button class="text-button price-data-jump" id="open-price-data">${tr('打开数据表','Open data table')}</button>
      ${warmupVisible ? `<p class="market-warmup-note">${tr('热身段 D−30 至 D−1 共用一条教学曲线，只用于熟悉界面；它不进入日频因子样本或组合收益。','Warm-up D−30 to D−1 shares one teaching curve for interface practice. It does not enter daily factor samples or portfolio returns.')}</p>` : ''}
      <div id="evidence-price-chart" class="standard-chart"></div><p id="price-chart-fallback" class="chart-fallback" hidden>${tr('当前为基础折线图，完整数据可在下表查看。','Showing the basic chart. Full values are available in the table below.')}</p>
      ${summary(summaryPoints, tr, num, canCompare ? tr('点','points') : unit)}
      <details class="price-data"><summary>${basketMode ? tr('查看指数数据','View index data') : tr('查看价格数据','View price data')} · ${rows.length}</summary><div class="table-scroll compact-table"><table><thead><tr><th>${tr('模拟日','Simulation day')}</th>${canCompare ? `<th>${esc(primary.name)} ${normalized}</th><th>${esc(secondary.name)} ${normalized}</th>` : `<th>${basketMode ? tr('指数点位','Index level') : tr('价格 USD','Price USD')}</th>`}</tr></thead><tbody>${rows.map(row => `<tr><td>${dayLabel(row)}</td><td>${num(row.primary, canCompare ? 3 : 4)}</td>${canCompare ? `<td>${num(row.comparison, 3)}</td>` : ''}</tr>`).join('')}</tbody></table></div></details>
      ${warmupVisible ? `<details class="warmup-explain"><summary>${tr('热身段是什么？','What is the warm-up?')}</summary><p>${tr('为熟悉界面而编写的 30 个观测，所有证券在热身段共用同一比例路径。','Thirty authored observations for interface practice. All securities share the same proportional path in the warm-up.')}</p></details>` : ''}
      ${provenance}`;

    const plot = [{key:'primary', name:primary.name, color:'#675c48'}];
    if (canCompare) plot.push({key:'comparison', name:secondary.name, color:'#496653', dash:true});
    FactorVisuals.chart(root.querySelector('#evidence-price-chart'), {
      rows, series:plot, label:canCompare ? tr('同起点归一价格比较','Normalized price comparison') : heading,
      format:value => num(value, canCompare ? 3 : 2), xLabel:dayLabel,
      markLine:warmupVisible ? {value:'D0', label:tr('D0 开局','D0 start')} : null
    });
    root.querySelector('#open-price-data').onclick = () => {
      const details = root.querySelector('.price-data');
      details.open = true;
      details.scrollIntoView({block:'start', behavior:'smooth'});
    };
    root.querySelector('#market-scope')?.addEventListener('change', event => {scope = event.target.value; render(root, ctx);});
    root.querySelector('#market-instrument').onchange = event => {
      selectedId = event.target.value;
      if (selectedId === compareId) compareId = primary.id;
      render(root, ctx);
    };
    root.querySelector('#market-range').onchange = event => {range = event.target.value; render(root, ctx);};
    root.querySelector('#market-compare').onchange = event => {compareMode = event.target.checked; render(root, ctx);};
    root.querySelector('#market-warmup')?.addEventListener('change', event => {showWarmup = event.target.checked; render(root, ctx);});
    root.querySelector('#market-compare-instrument')?.addEventListener('change', event => {compareId = event.target.value; render(root, ctx);});
    bindActions(root);
  }

  window.FactorLabMarketView = {render, reset() {selectedId = ''; compareId = ''; range = 'all'; scope = 'security'; showWarmup = false; compareMode = false;}};
})();

;
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FactorLabReplay = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const RELEASES = [
    {
      id: 'BLS-EMP-20240607',
      institution: 'U.S. Bureau of Labor Statistics',
      indicator: 'Employment Situation',
      period: 'May 2024',
      releaseAt: '2024-06-07T12:30:00.000Z',
      releaseLocal: '2024-06-07 08:30 America/New_York',
      timezone: 'America/New_York',
      units: { nonfarmPayrolls: 'thousand jobs, monthly change', unemploymentRate: 'percent' },
      seasonalAdjustment: 'Nonfarm payroll employment and unemployment rate are seasonally adjusted.',
      current: { nonfarmPayrolls: 272, unemploymentRate: 4.0 },
      previousPublished: { nonfarmPayrolls: 175, unemploymentRate: 3.9 },
      revision: { nonfarmPayrolls: 165 },
      earlierRevision: { month: { 'zh-CN': '3 月', en: 'March' }, before: 315, after: 310 },
      version: 'first print with prior-month revisions',
      sourceUrl: 'https://www.bls.gov/news.release/archives/empsit_06072024.htm',
      sourceLabel: 'BLS Employment Situation, June 7, 2024 archive',
      knownBefore: {
        'zh-CN': ['5 月 3 日公布的 4 月初报为新增非农就业 17.5 万、失业率 3.9%。', '非农岗位数来自机构调查，失业率来自住户调查。'],
        en: ['The May 3 release initially reported 175k added payrolls and 3.9% unemployment for April.', 'Payrolls come from the establishment survey. Unemployment comes from the household survey.']
      },
      practice: {
        question: { 'zh-CN': '哪些是 5 月本期初报？哪些是对 4 月和 3 月的修订？', en: 'Which figures are initial estimates for May, and which revise April and March?' },
        answer: { 'zh-CN': '新增非农就业和失业率是 5 月初报。4 月和 3 月新增非农就业是对之前月份的修订。引用时同时记录统计月份、公告日期和版本。', en: 'The current payroll change and unemployment rate are initial May estimates. The April and March changes revise earlier months. Cite the observation month, release date and data vintage together.' }
      },
      caveat: { 'zh-CN': '用这些数值解读就业。判断市场是否意外还需要可核验的发布前一致预期。', en: 'Use these figures to interpret employment. Identifying a market surprise requires a verifiable pre-release consensus.' }
    },
    {
      id: 'BLS-EMP-20240705',
      institution: 'U.S. Bureau of Labor Statistics',
      indicator: 'Employment Situation',
      period: 'June 2024',
      releaseAt: '2024-07-05T12:30:00.000Z',
      releaseLocal: '2024-07-05 08:30 America/New_York',
      timezone: 'America/New_York',
      units: { nonfarmPayrolls: 'thousand jobs, monthly change', unemploymentRate: 'percent' },
      seasonalAdjustment: 'Nonfarm payroll employment and unemployment rate are seasonally adjusted.',
      current: { nonfarmPayrolls: 206, unemploymentRate: 4.1 },
      previousPublished: { nonfarmPayrolls: 272, unemploymentRate: 4.0 },
      revision: { nonfarmPayrolls: 218 },
      earlierRevision: { month: { 'zh-CN': '4 月', en: 'April' }, before: 165, after: 108 },
      version: 'current release with prior-month revisions',
      sourceUrl: 'https://www.bls.gov/news.release/archives/empsit_07052024.htm',
      sourceLabel: 'BLS Employment Situation, July 5, 2024 archive',
      knownBefore: {
        'zh-CN': ['6 月 7 日已公布 5 月新增非农就业初报 27.2 万、失业率 4.0%。', '这次公告将发布 6 月数值，并可能调整先前月份的估计。'],
        en: ['The June 7 release initially reported 272k added payrolls and 4.0% unemployment for May.', 'This release will report June and may update estimates for earlier months.']
      },
      practice: {
        question: { 'zh-CN': '分别找出 6 月本期值、5 月上次公布值和 5 月本次修订值。', en: 'Find the June figure, the May first print and the revised May figure.' },
        answer: { 'zh-CN': '先区分统计月份。5 月的首次公布值和本次修订值是同一月份的两个版本。比较 5 月与 6 月时，请说明你用的是哪个版本。', en: 'Separate the observation months first. The first print and revised May value are two vintages of the same month. State which vintage you use when comparing May and June.' }
      },
      caveat: { 'zh-CN': '判断市场是否意外还需要可核验的发布前一致预期。判断股市表现需要对应日期的价格证据。', en: 'Identifying a surprise requires a verifiable pre-release consensus. Assessing the equity market requires price evidence from the relevant date.' }
    },
    {
      id: 'BLS-CPI-20240711',
      institution: 'U.S. Bureau of Labor Statistics',
      indicator: 'Consumer Price Index for All Urban Consumers (CPI-U)',
      period: 'June 2024',
      releaseAt: '2024-07-11T12:30:00.000Z',
      releaseLocal: '2024-07-11 08:30 America/New_York',
      timezone: 'America/New_York',
      units: { cpiMonthOverMonth: 'percent, seasonally adjusted', cpiYearOverYear: 'percent, not seasonally adjusted' },
      seasonalAdjustment: { 'zh-CN': '环比采用季调，同比采用未经季调的数值。', en: 'Month-over-month is seasonally adjusted. Year-over-year is unadjusted.' },
      current: { cpiMonthOverMonth: -0.1, cpiYearOverYear: 3.0 },
      version: 'first print',
      sourceUrl: 'https://www.bls.gov/news.release/archives/cpi_07112024.htm',
      sourceLabel: 'BLS CPI, July 11, 2024 archive',
      knownBefore: {
        'zh-CN': ['6 月 12 日公布的 5 月 CPI-U 季调环比持平，未季调同比上涨 3.3%。', '环比和同比各自对应不同的比较窗口。'],
        en: ['The June 12 release reported flat May CPI-U month-over-month after seasonal adjustment and 3.3% unadjusted year-over-year growth.', 'Month-over-month and year-over-year compare different time windows.']
      },
      practice: {
        question: { 'zh-CN': '为何本期环比可以下降，而同比仍然上涨？', en: 'How can prices decline month-over-month and still be higher year-over-year?' },
        answer: { 'zh-CN': '环比和同比采用不同基期。先区分一个月与十二个月的窗口，再核对季调口径。', en: 'The two measures use different reference periods. Distinguish one month from twelve months, then check the adjustment basis.' }
      },
      caveat: { 'zh-CN': '这份回放可用来理解物价变化。推断利率或股票表现还需要当时的预期与价格证据。', en: 'This release describes changes in consumer prices. Inferences about rates or equities require contemporaneous expectations and price evidence.' }
    }
  ];

  function releaseSnapshot(id, revealed, lang = 'zh-CN') {
    const release = byId(id);
    if (!release) return null;
    const locale = lang === 'en' ? 'en' : 'zh-CN';
    const visible = {
      id: release.id,
      institution: release.institution,
      indicator: release.indicator,
      period: release.period,
      releaseLocal: release.releaseLocal,
      knownBefore: release.knownBefore[locale],
      caveat: release.caveat[locale]
    };
    if (revealed !== true) return visible;
    const en = locale === 'en';
    const tr = (zh, english) => en ? english : zh;
    const payroll = value => en ? value + 'k' : (value / 10).toFixed(1) + ' 万';
    const percent = value => value.toFixed(1) + '%';
    const { current, previousPublished, revision, earlierRevision } = release;
    const rows = current.nonfarmPayrolls !== undefined ? [
      [tr('本期非农就业变动','Current payroll change'), payroll(current.nonfarmPayrolls)],
      [tr('本期失业率','Current unemployment rate'), percent(current.unemploymentRate)],
      [tr('上期首次公布（非农）','Prior first print (payrolls)'), payroll(previousPublished.nonfarmPayrolls)],
      [tr('上期本次修订（非农）','Prior payrolls revised in this release'), payroll(revision.nonfarmPayrolls)],
      [tr('再前一期修订（非农）','Earlier payroll revision'), earlierRevision.month[locale] + ' · ' + payroll(earlierRevision.before) + ' → ' + payroll(earlierRevision.after)]
    ] : [
      [tr('CPI 环比（季调）','CPI month over month (SA)'), percent(current.cpiMonthOverMonth)],
      [tr('CPI 同比（未季调）','CPI year over year (NSA)'), percent(current.cpiYearOverYear)],
      [tr('季调口径','Seasonal adjustment'), release.seasonalAdjustment[locale]]
    ];
    return {
      ...visible, rows,
      question: release.practice.question[locale],
      guidance: release.practice.answer[locale],
      source: { label: release.sourceLabel, url: release.sourceUrl }
    };
  }

  const OPTION_CASES = [
    {
      id: 'LUV-2022-FUEL-HEDGE',
      company: 'Southwest Airlines',
      year: 2022,
      title: { 'zh-CN': '航空公司为什么支付权利金做燃油套保？', en: 'Why would an airline pay premiums for fuel hedges?' },
      facts: [
        { 'zh-CN': '2022 年年报披露，燃油套保组合的现金结算收益约为每加仑 0.49 美元，权利金费用约为每加仑 0.04 美元。', en: 'The 2022 annual report disclosed a cash settlement gain from fuel hedges of about USD 0.49 per gallon and premium costs of about USD 0.04 per gallon.' },
        { 'zh-CN': '套保组合包含多种衍生工具，不能把全部收益归给一笔 Call。', en: 'The portfolio included multiple derivatives; the total gain cannot be attributed to a single call option.' }
      ],
      question: { 'zh-CN': '油价上涨时，航空公司为什么仍要考虑套保成本？', en: 'If fuel prices rise, why should the airline still consider hedging costs?' },
      answer: { 'zh-CN': '套保可以减少燃油成本上升的冲击，但权利金本身是成本；而且原油与航油价格存在基差，套保并非完全消除风险。', en: 'Hedging can reduce the impact of higher fuel costs, but premiums are a cost and jet-fuel basis risk remains; hedging does not eliminate risk.' },
      sourceUrl: 'https://www.sec.gov/Archives/edgar/data/92380/000009238023000010/luv-20221231.htm',
      sourceLabel: 'Southwest Airlines 2022 Form 10-K, Item 7 and Note 11'
    },
    {
      id: 'GME-2021-OPTIONS',
      company: 'GameStop',
      year: 2021,
      title: { 'zh-CN': '期权成交暴增是否足以证明做市商推高股价？', en: 'Does an options-volume surge prove market makers pushed the stock up?' },
      facts: [
        { 'zh-CN': 'SEC 工作人员报告记载，个人客户期权成交金额从 2021-01-21 的约 5,850 万美元增至 2021-01-27 的约 24 亿美元，增量主要来自买入 Put。', en: 'The SEC staff report recorded retail customer options trading value rising from about USD 58.5 million on 2021-01-21 to about USD 2.4 billion on 2021-01-27, with the increase mainly in purchased puts.' },
        { 'zh-CN': '工作人员在可得数据中未找到当月发生 gamma squeeze 的证据。', en: 'Staff did not find evidence in the available data of a gamma squeeze that month.' }
      ],
      question: { 'zh-CN': '看见期权成交暴增，还需要确认哪一方买入了什么合约？', en: 'After seeing an options-volume surge, what still needs to be established about who bought which contracts?' },
      answer: { 'zh-CN': '成交量只说明合约换手增加。要讨论方向性压力，必须区分买方/卖方、Call/Put、是否开仓，以及做市商对冲与后续价格反应。', en: 'Volume only shows more contracts traded. Directional pressure requires distinguishing buyer and seller, calls and puts, whether positions opened, and dealer hedging and subsequent price response.' },
      sourceUrl: 'https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf',
      sourceLabel: 'SEC Staff Report on Equity and Options Market Structure Conditions in Early 2021, section 3.4'
    }
  ];

  const INDUSTRY_CASES = [
    {
      id: 'semiconductor',
      name: { 'zh-CN': '半导体', en: 'Semiconductors' },
      longTerm: { 'zh-CN': '跟踪晶圆出货量、先进制程占比与资本开支；这些反映产能与产品结构。', en: 'Track wafer shipments, leading-edge process mix and capital spending; these show capacity and product mix.' },
      shortTerm: { 'zh-CN': '下一季订单、库存天数、产品售价与交付周期是否同步改善。', en: 'Check whether next-quarter orders, inventory days, product pricing and lead times improve together.' },
      counterExample: { 'zh-CN': '台积电 2024 年十二英寸等效晶圆出货量从上年约 1,200 万片增至 1,290 万片，7nm 及以下制程占晶圆收入比例从 58% 升至 69%。但同一轮需求变化，对代工、存储、设备的兑现时间可以不同。', en: 'TSMC increased 12-inch equivalent wafer shipments from about 12.0 million to 12.9 million in 2024, and the share of wafer revenue from 7nm and below rose from 58% to 69%. Yet the same demand change can reach foundry, memory and equipment earnings at different times.' },
      appliesTo: { 'zh-CN': '适用于代工与先进制程环节；不能直接套用到所有半导体公司。', en: 'Applies to foundry and leading-edge processes; not directly to every semiconductor company.' },
      sourceUrl: 'https://investor.tsmc.com/static/annualReports/2024/english/index.html',
      sourceLabel: 'TSMC 2024 Annual Report'
    },
    {
      id: 'robotics',
      name: { 'zh-CN': '机器人', en: 'Robotics' },
      longTerm: { 'zh-CN': '跟踪工业机器人年安装量、区域分布与自动化投资周期。', en: 'Track annual industrial-robot installations, regional mix and the automation investment cycle.' },
      shortTerm: { 'zh-CN': '订单、交付、市场份额与客户资本开支是否支持某家供应商下季收入。', en: 'Check orders, deliveries, market share and customer capex that would support a supplier’s next-quarter revenue.' },
      counterExample: { 'zh-CN': 'IFR 统计 2024 年全球工厂新装约 54.2 万台工业机器人，其中亚洲占 74%。安装量反映已落地的设备需求；推断某家供应商下季收入还需订单、市场份额与交付证据。', en: 'IFR recorded about 542,000 industrial robots installed in factories globally in 2024, with Asia at 74%. Installations reflect realized equipment demand; inferring a supplier’s next-quarter revenue still requires orders, share and delivery evidence.' },
      appliesTo: { 'zh-CN': '适用于工业自动化设备与集成环节。', en: 'Applies to industrial automation equipment and integration.' },
      sourceUrl: 'https://ifr.org/ifr-press-releases/news/global-robot-demand-in-factories-doubles-over-10-years',
      sourceLabel: 'IFR press release on 2024 robot installations'
    },
    {
      id: 'materials',
      name: { 'zh-CN': '先进材料', en: 'Advanced materials' },
      longTerm: { 'zh-CN': '跟踪终端需求、产能扩张、库存与材料价格；需求增长不等于售价上涨。', en: 'Track end demand, capacity additions, inventories and material prices; demand growth does not imply rising prices.' },
      shortTerm: { 'zh-CN': '现货价格、库存拐点、长协价格与客户补库是否改变利润。', en: 'Check spot prices, inventory inflection, contract prices and restocking that change margins.' },
      counterExample: { 'zh-CN': 'IEA 记录 2024 年锂需求增长近 30%，同时锂价自 2023 年以来跌逾 80%。需求增长与售价下跌可以同时发生；该案例适用于电池材料环节，不能直接套用到教学篮子中的先进合金。', en: 'The IEA recorded lithium demand growth of nearly 30% in 2024 while lithium prices fell more than 80% from 2023. Demand growth and falling prices can coexist; this applies to battery materials, not directly to the teaching basket’s advanced alloys.' },
      appliesTo: { 'zh-CN': '仅适用于电池材料等特定环节。', en: 'Only specific segments such as battery materials.' },
      sourceUrl: 'https://www.iea.org/reports/global-critical-minerals-outlook-2025/executive-summary',
      sourceLabel: 'IEA Global Critical Minerals Outlook 2025, executive summary'
    },
    {
      id: 'energy',
      name: { 'zh-CN': '清洁能源装备', en: 'Clean energy equipment' },
      longTerm: { 'zh-CN': '跟踪装机、产能利用率、组件价格与成本曲线。', en: 'Track installations, utilization, module prices and the cost curve.' },
      shortTerm: { 'zh-CN': '产能、售价、订单与原材料成本是否同向变化；装机扩张可能伴随设备企业利润承压。', en: 'Check whether capacity, prices, orders and input costs move together; installation growth can coincide with equipment-maker margin pressure.' },
      counterExample: { 'zh-CN': 'IEA 记录全球光伏组件价格自 2023 年初以来跌逾一半。装机扩张与设备企业利润可能背离，应同时观察产能、售价和成本；光伏案例不能代替储能或电网设备数据。', en: 'The IEA recorded global solar PV module prices falling by more than half since early 2023. Installation growth and equipment-maker profits can diverge; watch capacity, prices and costs. The solar case does not replace storage or grid-equipment data.' },
      appliesTo: { 'zh-CN': '仅适用于光伏组件等环节。', en: 'Only segments such as solar modules.' },
      sourceUrl: 'https://www.iea.org/reports/renewables-2024/executive-summary',
      sourceLabel: 'IEA Renewables 2024, executive summary'
    },
    {
      id: 'digital',
      name: { 'zh-CN': 'AI 基础设施', en: 'AI infrastructure' },
      longTerm: { 'zh-CN': '跟踪算力需求、云业务收入与毛利率、资本开支。', en: 'Track compute demand, cloud revenue and gross margin, and capital spending.' },
      shortTerm: { 'zh-CN': '算力投入支持设备需求，但会先增加云服务商成本；先确定分析的是设备商还是运营方。', en: 'Compute investment supports equipment demand but first raises cloud operators’ costs; decide whether you are analyzing equipment makers or operators.' },
      counterExample: { 'zh-CN': '微软 FY2025 云业务毛利率降至 69%，公司将下降部分归因于 AI 基础设施扩张。算力投入可支持设备需求，也会先增加云服务商成本。', en: 'Microsoft’s FY2025 cloud gross margin fell to 69%, with the company attributing part of the decline to AI infrastructure expansion. Compute investment can support equipment demand while first raising cloud operators’ costs.' },
      appliesTo: { 'zh-CN': '适用于区分设备商与云运营方的分析。', en: 'Applies when separating equipment makers from cloud operators.' },
      sourceUrl: 'https://www.microsoft.com/investor/reports/ar25/',
      sourceLabel: 'Microsoft FY2025 Annual Report'
    }
  ];

  const CONSUMER_CONFIDENCE = {
    title: { 'zh-CN': '消费者信心：两个不同指数', en: 'Consumer confidence: two different indices' },
    body: {
      'zh-CN': '密歇根大学消费者情绪指数（University of Michigan Surveys of Consumers）与 The Conference Board 消费者信心指数（Consumer Confidence Index）由不同机构编制，问题、样本和发布节奏不同。首版只提供概念和原始来源，待选定系列并核实转载条款后再加入数值回放。',
      en: 'The University of Michigan Surveys of Consumers and The Conference Board Consumer Confidence Index are produced by different organizations with different questions, samples and release schedules. This first version provides concepts and primary sources only; numeric replay awaits a selected series and verified redistribution terms.'
    },
    sources: [
      { label: 'University of Michigan data FAQ', url: 'https://data.sca.isr.umich.edu/faq.php' },
      { label: 'The Conference Board consumer confidence', url: 'https://www.conference-board.org/topics/consumer-confidence' }
    ]
  };

  const SOURCE_CHECK = {
    title: { 'zh-CN': '传闻该用哪份原始文件核对？', en: 'Which primary document should verify the rumor?' },
    claim: {
      'zh-CN': '社交媒体说：“供应链订单明显改善，公司下季收入一定会超预期。”',
      en: 'A social post says: “Supply-chain orders improved sharply, so next-quarter revenue will definitely beat expectations.”'
    },
    options: [
      { id: 'company', label: { 'zh-CN': '公司公告、财报与订单披露', en: 'Company filings and order disclosures' } },
      { id: 'bls', label: { 'zh-CN': '美国劳工统计局就业报告', en: 'BLS Employment Situation' } },
      { id: 'repost', label: { 'zh-CN': '同一说法的其他转载', en: 'Other reposts of the same claim' } }
    ],
    answer: 'company',
    feedback: {
      'zh-CN': '优先核对公司公告、财报和可验证的订单披露。BLS 就业报告不覆盖这家公司的订单；同源转载不是独立确认。即使订单改善，也还要看交付、收入和估值。',
      en: 'Check company filings and verifiable order disclosures first. The BLS employment report does not cover this company’s orders, and reposts are not independent confirmation. Even improving orders still require delivery, revenue and valuation evidence.'
    }
  };

  const RELEASE_NOTE = {
    'zh-CN': '真实宏观回放与合成教学账本分开。实际公告日期与游戏模拟日各自显示；这些数值不进入合成收益计算。',
    en: 'Real macro replay is separate from the synthetic teaching ledger. Actual release dates and simulation days are shown separately; these values do not enter synthetic returns.'
  };

  const byId = id => RELEASES.find(item => item.id === id) || null;
  return { RELEASES, OPTION_CASES, INDUSTRY_CASES, CONSUMER_CONFIDENCE, SOURCE_CHECK, RELEASE_NOTE, byId, releaseSnapshot };
});

;
(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const en = () => document.documentElement.lang === 'en';
  const tr = (zh, english) => en() ? english : zh;
  const data = () => window.FactorLabReplay;
  let releaseId = '', sourceChoice = '';
  const revealed = new Set();

  function getContext() {
    return {
      releaseId: releaseId || null,
      revealed: revealed.has(releaseId),
      active: !!document.getElementById('news-replay')?.getClientRects().length
    };
  }

  function reset() {
    releaseId = '';
    sourceChoice = '';
    revealed.clear();
    const host = document.getElementById('news-replay');
    if (host) renderNews(host, { day: window.FactorLabApp?.getState()?.day });
  }

  function renderNews(host, context) {
    const api = data();
    if (!host || !api) return;
    if (!releaseId || !api.byId(releaseId)) releaseId = api.RELEASES[0].id;
    const release = api.releaseSnapshot(releaseId, revealed.has(releaseId), en() ? 'en' : 'zh-CN');
    const isRevealed = !!release.rows;
    host.innerHTML = `<div class="panel-head"><h2>${tr('真实宏观发布回放','Real macro release replay')}</h2><span class="source-badge">${tr('真实历史 · 不进入合成收益','Real history · not in synthetic returns')}</span></div>
      <p class="replay-intro">${tr('三份历史公告、两类发布、三个核心指标。先看发布前已知，再点击公布本期数据；真实发布日期与游戏模拟日分开显示。','Three historical releases, two release types and three core indicators. Read what was known first, then reveal the release; actual dates and simulation days are shown separately.')}</p>
      <div class="release-tabs" role="tablist">${api.RELEASES.map(item => `<button data-release-id="${esc(item.id)}" aria-pressed="${item.id === release.id}">${esc(item.period)}<small>${esc(item.indicator.includes('CPI') ? 'CPI' : tr('就业报告','Employment'))}</small></button>`).join('')}</div>
      <article class="release-card">
        <div class="release-meta"><span>${esc(release.institution)}</span><span>${esc(release.period)}</span></div>
        <h3>${esc(release.indicator)}</h3>
        <div class="release-clock"><span>${tr('真实发布','Actual release')}: ${esc(release.releaseLocal)}</span><span>${tr('模拟日','Simulation day')}: D${Number(context?.day || 0)} ${tr('（与真实日期无映射）','(no mapping to real dates)')}</span></div>
        <div class="known-before"><strong>${tr('发布前已知','Known before release')}</strong><ul>${release.knownBefore.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>
        ${isRevealed ? `<table class="release-values"><tbody>${release.rows.map(([label, value]) => `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`).join('')}</tbody></table><div class="release-practice"><strong>${tr('核对练习','Check your reading')}</strong><p>${esc(release.question)}</p><details><summary>${tr('查看有依据的解释','View the evidence-based explanation')}</summary><p>${esc(release.guidance)}</p></details></div>` : `<button id="reveal-release" class="primary">${tr('公布本期数据','Reveal this release')}</button><p class="footnote">${tr('点击后可查看本期数值、同一次公告的修订和原始来源。','Reveal the release to see its current values, revisions and primary source.')}</p>`}
        <div class="expectation-note"><strong>${tr('市场预期','Market expectation')}:</strong> ${tr('暂无可核验数据。没有具备来源、发布时间和使用许可的一致预期，不判断“超预期”。','No verifiable data. Without sourced, timestamped and licensed consensus estimates, this page does not judge a “surprise”.')}</div>
        <p class="release-caveat">${esc(release.caveat)}</p>
        ${release.source ? `<a href="${esc(release.source.url)}" target="_blank" rel="noopener noreferrer">${esc(release.source.label)}</a>` : ''}
      </article>
      <details class="consumer-confidence"><summary>${esc(api.CONSUMER_CONFIDENCE.title[en() ? 'en' : 'zh-CN'])}</summary><p>${esc(api.CONSUMER_CONFIDENCE.body[en() ? 'en' : 'zh-CN'])}</p><p>${api.CONSUMER_CONFIDENCE.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>`).join(' · ')}</p></details>
      <article class="source-check"><h3>${esc(api.SOURCE_CHECK.title[en() ? 'en' : 'zh-CN'])}</h3><p class="source-claim">${esc(api.SOURCE_CHECK.claim[en() ? 'en' : 'zh-CN'])}</p><div class="source-options">${api.SOURCE_CHECK.options.map(option => `<label><input type="radio" name="source-check" value="${esc(option.id)}" ${sourceChoice === option.id ? 'checked' : ''}> ${esc(option.label[en() ? 'en' : 'zh-CN'])}</label>`).join('')}</div><button id="check-source" class="secondary">${tr('核对这份说法','Check this claim')}</button><p id="source-feedback" class="source-feedback" role="status"></p></article>
      <p class="replay-boundary">${esc(api.RELEASE_NOTE[en() ? 'en' : 'zh-CN'])}</p>`;
    host.querySelectorAll('[data-release-id]').forEach(button => button.onclick = () => { releaseId = button.dataset.releaseId; renderNews(host, context); });
    host.querySelector('#reveal-release')?.addEventListener('click', () => {
      if (revealed.has(release.id)) return;
      revealed.add(release.id);
      renderNews(host, context);
      document.dispatchEvent(new CustomEvent('factorlab:macro-reveal', { detail: { releaseId: release.id } }));
    });
    host.querySelectorAll('input[name="source-check"]').forEach(input => input.onchange = () => { sourceChoice = input.value; });
    host.querySelector('#check-source')?.addEventListener('click', () => {
      const feedback = host.querySelector('#source-feedback');
      if (!sourceChoice) { feedback.textContent = tr('先选择一个核对来源。','Choose a source first.'); return; }
      const correct = sourceChoice === api.SOURCE_CHECK.answer;
      feedback.dataset.result = correct ? 'correct' : 'retry';
      feedback.textContent = correct ? api.SOURCE_CHECK.feedback[en() ? 'en' : 'zh-CN'] : tr('这份材料不能直接核对公司订单。请选择公司公告、财报或可验证的订单披露。','That document cannot verify the company’s orders. Choose company filings or verifiable order disclosures.');
    });
  }

  function optionsIntro(quote) {
    const api = data();
    if (!api) return '';
    const cases = api.OPTION_CASES.map(item => `<article class="case-card"><span class="source-badge">${tr('真实案例','Real case')}</span><h3>${esc(item.title[en() ? 'en' : 'zh-CN'])}</h3>${item.facts.map(fact => `<p>${esc(fact[en() ? 'en' : 'zh-CN'])}</p>`).join('')}<p><strong>${esc(item.question[en() ? 'en' : 'zh-CN'])}</strong></p><details><summary>${tr('查看有依据的解释','View the evidence-based explanation')}</summary><p>${esc(item.answer[en() ? 'en' : 'zh-CN'])}</p></details><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.sourceLabel)}</a></article>`).join('');
    const quoteHTML = quote ? `<div class="option-quote-card"><span class="source-badge">${tr('教学报价','Teaching quote')}</span><h3>${esc(quote.kind)} · ${tr('行权价','Strike')} ${esc(quote.strike)} · ${esc(quote.expiry)}</h3><dl><div><dt>Bid</dt><dd>${esc(quote.bid)}</dd></div><div><dt>Ask</dt><dd>${esc(quote.ask)}</dd></div><div><dt>${tr('成交量','Volume')}</dt><dd>${esc(quote.volume)}</dd></div><div><dt>${tr('未平仓量 OI','Open interest')}</dt><dd>${esc(quote.openInterest)}</dd></div></dl><label for="option-spread">${tr('算一算：Spread = Ask − Bid','Calculate: Spread = Ask − Bid')} <input id="option-spread" inputmode="decimal" autocomplete="off" placeholder="USD"></label><button id="check-option-spread" class="secondary">${tr('核对价差','Check spread')}</button><p id="option-spread-feedback" class="source-feedback" role="status"></p></div>` : '';
    return `<div class="concept-card"><h3>${tr('先理解权利，再看报价','Understand the right before the quote')}</h3><p>${tr('期权买方支付权利金，取得按约定条件买入（Call）或卖出（Put）相关资产的权利，而不是义务。权利金是成本，不是保证金。','An option buyer pays a premium for the right, not the obligation, to buy (call) or sell (put) an underlying asset on agreed terms. The premium is a cost, not collateral.')}</p><p>${tr('Bid 是买方愿意支付的价格，Ask 是卖方愿意接受的价格；价差是交易成本的一部分。未平仓量 OI 统计尚未平仓的合约，每份合约同时有买方与卖方。成交活跃、Call 数量增加或 OI 上升，都不能单独确定涨跌。','Bid is what a buyer is willing to pay; ask is what a seller is willing to accept; the spread is part of trading cost. Open interest counts outstanding contracts, each with a buyer and a seller. Active trading, more calls or rising OI alone cannot determine direction.')}</p>${quoteHTML}</div><h3 class="replay-subhead">${tr('两个真实事件','Two real events')}</h3><div class="case-grid">${cases}</div>`;
  }

  function bindOptions(host, quote) {
    if (!host || !quote) return;
    const input = host.querySelector('#option-spread');
    host.querySelector('#check-option-spread')?.addEventListener('click', () => {
      const feedback = host.querySelector('#option-spread-feedback');
      const answer = Math.round(Number(quote.ask) * 100) - Math.round(Number(quote.bid) * 100);
      const typed = String(input?.value || '').trim();
      if (!/^(?:\d+(?:[.,]\d{1,2})?|[.,]\d{1,2})$/.test(typed)) {
        feedback.dataset.result = 'retry';
        feedback.textContent = tr('请输入美元金额，最多两位小数。', 'Enter a dollar amount with up to two decimal places.');
        return;
      }
      const cents = Math.round(Number(typed.replace(',', '.')) * 100);
      if (cents === answer) {
        feedback.dataset.result = 'correct';
        feedback.textContent = tr('计算正确，价差为 ', 'Correct. The spread is ') + (answer / 100).toFixed(2) + ' USD.';
      } else {
        feedback.dataset.result = 'retry';
        feedback.textContent = tr('再用 Ask 减去 Bid，算到分。', 'Subtract Bid from Ask again and give the exact amount in cents.');
      }
    });
  }

  function industryCards() {
    const api = data();
    if (!api) return '';
    return `<section class="industry-judgment"><div class="panel-head"><h2>${tr('五个行业：一个判断与一个反例','Five industries: one judgment and one counter-example')}</h2><span class="source-badge">${tr('真实案例 · 与虚构证券分栏','Real cases · separate from fictional securities')}</span></div><p class="replay-intro">${tr('先写下长期跟踪什么，再写什么新证据会改变短期配置；每个行业都配一个可能推翻简单推断的反例。','State what to track long term, then what new evidence would change the tactical allocation; each industry includes a counter-example that can overturn a simple inference.')}</p><div class="industry-grid">${api.INDUSTRY_CASES.map(item => `<article class="industry-card"><h3>${esc(item.name[en() ? 'en' : 'zh-CN'])}</h3><p><strong>${tr('长期跟踪','Long-term')}:</strong> ${esc(item.longTerm[en() ? 'en' : 'zh-CN'])}</p><p><strong>${tr('短期证据','Tactical evidence')}:</strong> ${esc(item.shortTerm[en() ? 'en' : 'zh-CN'])}</p><p><strong>${tr('反例','Counter-example')}:</strong> ${esc(item.counterExample[en() ? 'en' : 'zh-CN'])}</p><p class="footnote">${esc(item.appliesTo[en() ? 'en' : 'zh-CN'])}</p><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.sourceLabel)}</a></article>`).join('')}</div></section>`;
  }

  function fundamentalsTimeNote() {
    return `<div class="time-basis-note"><h3>${tr('四个时间不要混用','Do not mix four different dates')}</h3><ul><li><strong>${tr('报告期结束','Period end')}</strong>: ${tr('财务数字覆盖的期末。','The end of the period the numbers cover.')}</li><li><strong>${tr('对外公布','Published')}</strong>: ${tr('公告对外发布的日期。','The date the release was published.')}</li><li><strong>${tr('平台首次可见','First visible here')}</strong>: ${tr('本教学平台第一次能引用该报告的日期。','The first date this teaching platform can cite the report.')}</li><li><strong>${tr('估值报价','Price observed')}</strong>: ${tr('P/E 使用的当前教学股价日期。','The date of the teaching price used in P/E.')}</li></ul><p class="footnote">${tr('本页 P/E = 当前教学股价 ÷ 单期每股收益；ROE = 期间净利润 ÷ 期末权益。两者都不是 TTM 口径，缺失值保留为空。','P/E here = current teaching price ÷ period EPS; ROE = period net income ÷ ending equity. Neither is TTM; missing values stay empty.')}</p></div>`;
  }

  document.addEventListener('factorlab:restore', reset);
  document.addEventListener('factorlab:profile', reset);
  window.FactorLabReplayUI = { getContext, renderNews, optionsIntro, bindOptions, industryCards, fundamentalsTimeNote };
})();

;
(function (root) {
  'use strict';

  const languages = {
    'zh-CN': {
      title: '研究小结', intro: '汇总已发生的练习与当前反思，作为课程报告的素材。',
      download: '导出研究小结', reflect: '继续写反思', details: '查看小结与课程交付',
      downloaded: '已发起下载，请在浏览器下载列表查看。', failed: '下载未完成，请重试。',
      boundary: '合成数据教学练习；不证明真实市场有效性或学习效果，也不代表课程交付已完成。',
      sections: ['长期定位', '短期调整', '方法证据', '周期证据', '结果与反思', '课程交付'],
      sectors: ['半导体', '机器人', '先进材料', '清洁能源', 'AI 基础设施', '现金'],
      factors: ['动量', '价值', '质量', '低波动'],
      reasons: { evidence: '证据变化', risk: '风险控制', anchor: '长期定位', valuation: '估值判断' },
      noReflection: '尚未记录反思。请在上方写下你的判断和下一次要验证的问题。',
      noRounds: '尚无已结算轮次。', noBacktest: '本次会话尚未运行回测，或已恢复进度但没有保留运行记录。',
      dirtyBacktest: '因子偏好已修改，尚未重新运行回测；旧结果不计入本小结。',
      method: '独立的 36 个月合成历史实验，使用 6 个月预热；只用当时可得信息排序，前二行业各 50%，每月再平衡，零交易成本。五行业等权作为基准。它与配置练习的 40% 单行业上限和费用规则不同。',
      methodLimit: 'Rank IC 衡量因子排序与随后收益排序的关系。小样本、合成数据与反复调参不能证明现实有效性。',
      longPrompt: '待你补充：我持续看好哪些行业？哪些经营、竞争和周期证据支持长期定位？',
      shortPrompt: '待你补充：本轮为什么偏离长期定位？新证据、费用和集中度怎样影响取舍？',
      cyclePrompt: '待你补充：订单是否转为收入和利润？哪些信息仍是预期，下一轮要核对什么？',
      resultPrompt: '待你补充：结果来自市场、因子、行业还是事件？短期盈利不能直接证明判断正确。',
      ai: 'AI / 自动化：应用可自动回测与核算；在线 AI 是否连接以对话框状态为准。AI 输出仍需对照可见证据核验。',
      weekly: '每周过程：研究问题 → 证据与方法 → 交互实验 → 对照结果 → 反思与下周问题。请保留日期、版本、方法变化和实际反馈。',
      milestones: '课程计划：Week 7（10 月 26–30 日）集成功能；Week 8（11 月 2–6 日）冻结架构；Week 9（11 月 9–13 日）留存测试证据；Week 10（11 月 16–20 日）演示；Week 11（11 月 23–27 日）最终打包。以课程最新通知为准。',
      deliverables: '待人工核对：研究报告、方法与因子功效、周期证据与引用、演示记录、每周过程、个人反思、测试证据和最终版本。导出此文件不会自动提交作业。',
      partner: '伙伴背景：围绕证券研究、资产管理和风险管理说明可解释性、成本及仓位约束。课程原文的 CITIC Securities 与中文“中信建投证券股份有限公司”存在名称冲突，需向课程方核实；不据此声称真实合作或背书。',
      course: '子项目 B：高端制造与尖端科技行业配置，比较长期定位和短期战术。五行业 + 现金、四因子、六轮默认练习。',
      modelCycle: '周期为教学模型标签，不是现实市场判断。', noEvents: '尚无已披露事件。', noEvidence: '尚未打开证据卡。',
      units: '虚拟金额', missing: '—'
    },
    en: {
      title: 'Research summary', intro: 'Collect completed practice and your current reflection as material for the course report.',
      download: 'Export research summary', reflect: 'Continue reflection', details: 'Summary and course deliverables',
      downloaded: 'Download started. Check your browser downloads.', failed: 'Download did not complete. Please retry.',
      boundary: 'Synthetic teaching exercise. It does not establish market validity, learning outcomes or completion of course deliverables.',
      sections: ['Long-term positioning', 'Tactical adjustment', 'Method evidence', 'Cycle evidence', 'Results and reflection', 'Course deliverables'],
      sectors: ['Semiconductors', 'Robotics', 'Advanced materials', 'Clean energy', 'AI infrastructure', 'Cash'],
      factors: ['Momentum', 'Value', 'Quality', 'Low volatility'],
      reasons: { evidence: 'Changed evidence', risk: 'Risk control', anchor: 'Long-term positioning', valuation: 'Valuation' },
      noReflection: 'No reflection recorded. Use the field above to record your judgment and the next question to test.',
      noRounds: 'No settled rounds yet.', noBacktest: 'No explicit backtest run in this session, or restored progress has no retained run record.',
      dirtyBacktest: 'Factor preferences changed. Rerun the backtest; the previous result is excluded from this summary.',
      method: 'An independent 36-month synthetic-history exercise with six warm-up months. Rank only information available at each decision time. Hold the top two sectors at 50% each, rebalance monthly and assume zero costs. Compare with the equal-sector benchmark. These rules differ from the allocation exercise’s 40% sector cap and trading costs.',
      methodLimit: 'Rank IC compares factor rankings with subsequent return rankings. Synthetic small samples and repeated tuning do not establish real-world validity.',
      longPrompt: 'To write: Which sectors do I favour for the long term, and which operating, competitive and cycle evidence supports that position?',
      shortPrompt: 'To write: Why did I deviate from the long-term position? How did new evidence, costs and concentration affect the trade-off?',
      cyclePrompt: 'To write: Have orders turned into revenue and earnings? Which claims remain expectations, and what should I check next?',
      resultPrompt: 'To write: Did market, factor, sector or event effects explain the outcome? A short-term gain does not prove a sound judgment.',
      ai: 'AI / automation: The app computes backtests and accounting automatically. Check the conversation status for online AI availability. Verify AI claims against visible evidence.',
      weekly: 'Weekly process: question → evidence and method → interactive experiment → compare outcomes → reflection and next question. Retain dates, versions, method changes and actual feedback.',
      milestones: 'Course plan: Week 7 (Oct 26–30) integration; Week 8 (Nov 2–6) architecture freeze; Week 9 (Nov 9–13) test evidence; Week 10 (Nov 16–20) demo; Week 11 (Nov 23–27) final packaging. Confirm against the latest course notice.',
      deliverables: 'Check manually: research report, methods and factor validity, cycle evidence and citations, demo record, weekly process, personal reflection, test evidence and final version. Exporting this file does not submit coursework.',
      partner: 'Partner context: Explain interpretability, costs and position limits through securities research, asset management and risk management. The brief names CITIC Securities alongside the conflicting Chinese name 中信建投证券股份有限公司. Confirm the institution with the course team; no actual partnership or endorsement is asserted.',
      course: 'Subproject B: advanced manufacturing and frontier technology allocation, comparing long-term positioning with tactical choices. Five sectors plus cash, four factors and six default rounds.',
      modelCycle: 'The cycle is a teaching-model label, not a real-market assessment.', noEvents: 'No disclosed events yet.', noEvidence: 'No evidence cards opened yet.',
      units: 'virtual amount', missing: '—'
    }
  };

  function buildReport({ state = {}, envelope = {}, research = null, researchStatus = {}, lang = 'zh-CN', translate = key => key } = {}) {
    lang = lang === 'en' ? 'en' : 'zh-CN';
    const t = languages[lang], en = lang === 'en';
    const choose = (zh, english) => en ? english : zh;
    const number = (value, digits = 2) => Number.isFinite(value) ? value.toLocaleString(lang, {minimumFractionDigits: digits, maximumFractionDigits: digits}) : t.missing;
    const percent = value => Number.isFinite(value) ? number(value * 100) + '%' : t.missing;
    const weights = values => Array.isArray(values) ? t.sectors.map((name, index) => name + ' ' + percent(values[index])).join(' / ') : t.missing;
    const reason = value => {
      const parts = String(value || '').split(' · ');
      if (t.reasons[parts[0]]) parts[0] = t.reasons[parts[0]];
      return parts.join(' · ') || choose('尚未记录', 'Not recorded');
    };
    const rows = Array.isArray(state.results) ? state.results : [];
    const progress = choose(`已完成 ${rows.length} / ${state.rounds ?? 6} 轮 · 第 ${state.day ?? 0} 日`, `${rows.length} / ${state.rounds ?? 6} rounds settled · Day ${state.day ?? 0}`);
    const metrics = state.metrics || {};
    const first = state.history?.[0];
    const initial = first && Number.isFinite(first.nav) && first.nav > 0 ? [...first.holdingsBefore.map(value => value / first.nav), first.cashBefore / first.nav] : null;
    const long = [
      t.longPrompt,
      choose('开局长期持有参照：', 'Opening buy-and-hold reference: ') + weights(initial),
      choose('截至当前，相对长期持有参照的差额：', 'Current difference versus opening buy-and-hold: ') + number(state.nav - state.anchorNav) + ' (' + t.units + ')'
    ];
    const short = [
      t.shortPrompt,
      choose('当前实际仓位：', 'Current actual weights: ') + weights(state.weights)
    ];
    if (state.phase === 'decision') short.push(choose('未确认的配置草稿：', 'Unconfirmed allocation draft: ') + weights(envelope.draft));
    short.push(choose('当前记录的理由：', 'Current recorded reason: ') + reason(envelope.reason));
    if (envelope.note) short.push(choose('你的证据说明：', 'Your evidence note: ') + String(envelope.note));
    if(state.phase==='decision'){
      short.push(choose('草案引用：','Draft citations: ')+(envelope.evidenceRefs||[]).join(' / '));
      short.push(choose('草案反证条件：','Draft reconsideration condition: ')+(envelope.falsifierIf||choose('未记录','Not recorded')));
    }
    const method = [t.method, t.methodLimit];
    const ran = researchStatus.hasRun === true && researchStatus.dirty !== true && research;
    if (ran) {
      method.unshift(choose(`本次会话已运行回测：${research.sampleCount} 个月合成样本。`, `Backtest run in this session: ${research.sampleCount} synthetic months.`));
      method.push(choose('研究因子偏好：', 'Research factor preferences: ') + (research.factors || []).map((factor, index) => `${t.factors[index] || factor.id} ${percent(research.preferences?.[factor.id])}`).join(' / '));
      method.push(choose('合成策略收益：', 'Synthetic strategy return: ') + percent(research.strategy?.totalReturn) + choose('；基准收益：', '; benchmark return: ') + percent(research.benchmark?.totalReturn) + choose('；策略最大回撤：', '; strategy max drawdown: ') + percent(research.strategy?.maxDrawdown));
      for (const [index, factor] of (research.factors || []).entries()) method.push(`${t.factors[index] || factor.id} · Rank IC ${number(factor.meanIC, 3)} · ${factor.validMonths} / ${research.sampleCount} ${choose('有效月份', 'valid months')}`);
    } else method.unshift(researchStatus.dirty ? t.dirtyBacktest : t.noBacktest);
    const evidence = (state.evidence || []).filter(item => (state.seen || []).includes(item.id));
    const events = (state.events || []).filter(event => event.startDay <= (state.day ?? 0));
    const cycle = [t.cyclePrompt, t.modelCycle];
    cycle.push(evidence.length ? choose('已打开证据：', 'Opened evidence: ') + evidence.map(item => `${item.id} ${translate(item.titleKey)}`).join(' / ') : t.noEvidence);
    cycle.push(...(events.length ? events.map(event => choose(`第 ${event.startDay} 日：`, `Day ${event.startDay}: `) + translate(event.titleKey) + ' — ' + translate(event.bodyKey)) : [t.noEvents]));
    const results = [
      t.resultPrompt,
      choose('累计组合收益：', 'Cumulative portfolio return: ') + percent(metrics.returnValue),
      choose('累计最大回撤：', 'Cumulative max drawdown: ') + percent(metrics.maxDrawdown),
      choose('年化 Sharpe：', 'Annualized Sharpe: ') + number(metrics.sharpe) + choose('（日频，年化 252，rf 为当日模型政策利率；样本不足或零方差显示 —）', ' (daily observations, annualization 252, rf = daily model policy rate; insufficient or zero-variance samples show —)')
    ];
    if (!rows.length) results.push(t.noRounds);
    for (const row of rows) {
      results.push(choose(`第 ${row.round} 轮`, `Round ${row.round}`) + ' | ' + reason(row.reason) + ' | ' + choose('收益 ', 'return ') + percent(row.returnValue) + ' | ' + choose('相对本轮不调仓 ', 'vs no trade this round ') + number(row.tacticalAmount) + ' | ' + choose('该轮费用 ', 'round costs ') + number(Number.isFinite(row.attribution?.cost) ? -row.attribution.cost : null) + ' (' + t.units + ')');
      if(row.decisionPolicy==='studio'){
        results.push(choose('本轮引用：','Evidence cited this round: ')+(row.evidenceRefs||[]).join(' / '));
        results.push(choose('反证条件：','Reconsideration condition: ')+(row.falsifierIf||choose('未记录','Not recorded')));
        results.push((row.reward?.badges?.includes('badge.recordComplete')?choose('决策记录完整','Decision record complete'):choose('决策记录未完整','Decision record incomplete'))+choose('；过程记录不代表判断正确。','; recording the process does not validate the judgment.'));
      }else if(row.decisionPolicy==='legacy')results.push(choose('历史记录保留旧规则积分。','Historical record retains legacy points.'));
    }
    results.push(choose('你的反思：', 'Your reflection: ') + (String(envelope.reflection || '').trim() || t.noReflection));
    const course = [t.course, t.ai, t.weekly, t.milestones, t.deliverables, t.partner];
    const sections = [long, short, method, cycle, results, course].map((lines, index) => ({title: t.sections[index], lines}));
    return {
      title: t.title, progress, boundary: t.boundary, sections, hasRunBacktest: !!ran,
      text: [t.title, progress, t.boundary, ...sections.flatMap(section => ['', section.title, ...section.lines])].join('\n')
    };
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = {buildReport};
    return;
  }
  if (!root.document) return;
  let lastContent = '', scheduled = false;
  const $ = id => document.getElementById(id);
  const language = () => root.FactorLabApp?.getUI().lang === 'en' ? 'en' : 'zh-CN';
  function capture() {
    const lang = language(), source = root.FactorLabSimulation?.TEXTS?.[lang] || {};
    return buildReport({
      state: root.FactorLabApp.getState(),
      envelope: root.FactorLabApp.getEnvelope(),
      research: root.FactorLabWorkspace?.getResearch(),
      researchStatus: root.FactorLabWorkspace?.getResearchStatus?.() || {},
      lang, translate: key => source[key] || key
    });
  }
  function create() {
    const host = $('view-journal');
    if (!host || $('research-report')) return;
    const section = document.createElement('section');
    section.id = 'research-report';
    section.className = 'panel research-report';
    section.setAttribute('aria-labelledby', 'report-title');
    section.innerHTML = '<div class="panel-head"><h2 id="report-title"></h2><span class="source-tag" id="report-progress"></span></div><p id="report-intro"></p><div class="report-actions"><button id="export-report" class="secondary"></button><button id="report-reflect" class="text-button"></button></div><p id="report-feedback" class="footnote" role="status"></p><details id="report-details"><summary id="report-details-label"></summary><p id="report-boundary" class="footnote"></p><div class="report-sections" id="report-sections"></div></details>';
    host.append(section);
    $('report-reflect').addEventListener('click', () => {
      $('reflection')?.focus();
      $('reflection')?.scrollIntoView({block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    });
    $('export-report').addEventListener('click', () => {
      const t = languages[language()];
      let url;
      try {
        url = URL.createObjectURL(new Blob(['\uFEFF' + capture().text], {type: 'text/plain;charset=utf-8'}));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'FactorLab-research-summary-' + new Date().toISOString().slice(0, 10) + '.txt';
        document.body.append(link);
        link.click();
        link.remove();
        $('report-feedback').textContent = t.downloaded;
      } catch {
        $('report-feedback').textContent = t.failed;
      } finally {
        if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    });
  }
  function render() {
    scheduled = false;
    if (!root.FactorLabApp) return;
    create();
    if (!$('research-report')) return;
    const report = capture(), t = languages[language()];
    if (lastContent === report.text) return;
    lastContent = report.text;
    for (const [id, text] of Object.entries({
      'report-title': t.title, 'report-intro': t.intro, 'report-progress': report.progress,
      'export-report': t.download, 'report-reflect': t.reflect, 'report-details-label': t.details,
      'report-boundary': report.boundary, 'report-feedback': ''
    })) $(id).textContent = text;
    const fragment = document.createDocumentFragment();
    for (const section of report.sections) {
      const article = document.createElement('section'), heading = document.createElement('h3');
      heading.textContent = section.title; article.append(heading);
      for (const line of section.lines) {
        const p = document.createElement('p'); p.textContent = line; article.append(p);
      }
      fragment.append(article);
    }
    $('report-sections').replaceChildren(fragment);
  }
  function schedule() {
    if (!scheduled) { scheduled = true; queueMicrotask(render); }
  }
  for (const type of ['factorlab:render', 'factorlab:save', 'factorlab:profile', 'factorlab:restore', 'factorlab:view', 'factorlab:feedback']) document.addEventListener(type, schedule);
  document.addEventListener('input', event => { if (event.target.matches?.('[data-research-factor]')) schedule(); });
  document.addEventListener('click', event => { if (event.target.closest?.('#reset-backtest')) schedule(); });
  root.FactorLabReport = {build: capture, refresh: schedule};
  schedule();
})(typeof window === 'undefined' ? globalThis : window);

;
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const views = ['research', 'portfolio', 'backtest', 'risk', 'journal'];
  const hashView = () => ({evidence:'research',allocation:'portfolio',review:'journal'}[location.hash.replace(/^#\/?/, '')] || location.hash.replace(/^#\/?/, ''));
  const labels = {
    'zh-CN': {
      research: ['行情与资料', ''],
      portfolio: ['配置决策', ''],
      backtest: ['因子与回测', ''],
      risk: ['风险与归因', ''],
      journal: ['决策复盘', ''],
      factorNames: ['动量', '价值', '质量', '低波动'],
      factorHelp: ['动量：过去六个月的涨跌表现', '价值：盈利相对价格的水平（E/P）', '质量：股东投入资本的盈利水平（ROE）', '低波动：过去六个月波动较小'],
      weights: '你更看重哪些选行业线索？', run: '运行回测', reset: '四因子恢复等权', pending: '偏好已更改，请重新运行回测。', applied: '36 个月回测完成', invalid: '请将至少一个因子权重设为大于 0。',
      researchNote: '这里只做研究，调整偏好不会改变持仓。', strategy: '策略收益', benchmark: '五行业等权收益', drawdown: '最大回撤', spread: '前二与后二行业的月均收益差', sampleBadge: '合成教学回测 · 36 个月', specTitle: '实验口径（与日频快照分开）', specSample: '5 个行业；6 个月预热后逐月评估 36 个月', specFactors: '四个因子：动量、价值、质量、低波动', specRules: '前二行业各 50%，五行业等权基准；零交易费、不加杠杆', specNote: '上方证券日频快照只回答“当前可见价格能算哪些信号”；这里回答“四因子排序在这组合成历史中表现如何”。两者不能合并成一个结论。', monthPick: '选择一个样本月，亲自核对一次', monthDetail: '当时的因子排名 → 下一期收益 → 当月 IC', monthLabel: '样本月', sector: '行业', score: '综合分数', nextReturn: '下一期收益', icLabel: '当月 Rank IC', monthHint: '分数越高，事前排序越靠前；IC 衡量分数与随后收益的排序相关性，接近 0 表示关系弱。',
      preview: '等权示例已计算；运行回测后记录本次检验。', factorIntro: '因子是给行业打分的线索；权重越高，排序越重视它。',
      drawdownHelp: '最大回撤：资产从此前最高点下跌最多的幅度。',
      icHelp: '排序相关性越接近 1，打分高的行业随后越倾向涨得好；接近 0 表示关系弱，负值表示相反。',
      validityDetails: '查看差值与样本限制', sampleHelp: '可计算月份只表示数据足以计算，不能当作获利月份或胜率。', tuningHelp: '样本小、反复调参可能产生偶然结果。',
      macroDetails: '查看利率、需求与风险指标', noConclusion: '未披露的信息，暂不下结论。', positioning: '长期定位：你持续看好的行业；短期战术：因本轮新证据做的调整。',
      chartTitle: '36 个月合成历史', chartLabel: '事前因子策略与五行业等权基准净值', firstNav: '初始净值 1', months: '36 个月', factorValidity: '因子打分与随后收益的关系', factor: '因子', ic: '排序相关性（平均 Rank IC）', samples: '可计算月份',
      method: '查看回测规则和逐月结果', methodText: '先用 6 个月形成线索，再逐月用当时已知信息排序。前二行业各 50%，基准五行业各 20%；均每月调仓，免交易费、不加杠杆。',
      limitation: '合成回测，不证明真实市场有效。此实验每行业可达 50%、免交易费，与本轮配置规则不同。',
      month: '样本月', selected: '事前选择', monthlyStrategy: '策略收益', monthlyBenchmark: '基准收益', synthetic: '合成观测', inference: '根据证据判断',
      cycle: '周期观察', rate: '政策利率', growth: '经济增长', credit: '信用压力',
      cycleNote: '周期标签来自教学模型。',
      inferenceText: '看订单、库存和利润是否互相印证。只看价格上涨，不能确认行业复苏。',
      percent: '百分比', source: '来源与课程范围'
    },
    en: {
      research: ['Market & research', ''],
      portfolio: ['Allocation', ''],
      backtest: ['Factors & backtest', ''],
      risk: ['Risk & attribution', ''],
      journal: ['Decision review', ''],
      factorNames: ['Momentum', 'Value', 'Quality', 'Low volatility'],
      factorHelp: ['Prior six-month cumulative return', 'Synthetic E/P known at that time', 'Synthetic ROE known at that time', 'Negative prior six-month volatility'],
      weights: 'Research factor preferences', run: 'Run backtest', reset: 'Equal weights', pending: 'Preferences changed. Run the backtest to update results.', applied: '36-month replay complete', invalid: 'At least one factor weight must be positive',
      researchNote: 'This is a method exercise. These preferences do not change holdings.', strategy: 'Strategy return', benchmark: 'Equal-sector return', drawdown: 'Maximum drawdown', spread: 'Top two minus bottom two monthly mean', sampleBadge: 'Synthetic teaching backtest · 36 months', specTitle: 'Experiment specification (separate from the daily snapshot)', specSample: 'Five sectors; 6 warm-up months, then 36 monthly evaluations', specFactors: 'Four factors: momentum, value, quality, low volatility', specRules: 'Top two sectors 50% each; equal-sector benchmark; zero trading costs, no leverage', specNote: 'The daily security snapshot above only answers “which signals can current visible prices produce?” This experiment asks “how did the four-factor ranking behave in this synthetic history?” Do not merge them into one conclusion.', monthPick: 'Pick one sample month and check it yourself', monthDetail: 'Factor ranking then → next-period return → that month’s IC', monthLabel: 'Month', sector: 'Sector', score: 'Composite score', nextReturn: 'Next-period return', icLabel: 'Monthly Rank IC', monthHint: 'A higher score ranks earlier before the return. IC measures rank correlation between scores and subsequent returns; near zero means a weak relationship.',
      preview: 'Equal-weight example calculated; run a backtest to record your test.', factorIntro: 'Factors are clues used to score sectors. A higher weight gives a clue more influence.',
      drawdownHelp: 'Maximum drawdown is the largest decline from an earlier asset peak.',
      icHelp: 'Closer to 1 means higher-scored sectors tended to have higher subsequent returns; near 0 means a weak relationship, and a negative value means the reverse.',
      validityDetails: 'View spread and sample limits', sampleHelp: 'Calculable months are months with sufficient data. They are not winning months or a win rate.', tuningHelp: 'Small samples and repeated tuning can produce chance results.',
      macroDetails: 'View rates, demand and risk indicators', noConclusion: 'Do not conclude from information that has not been disclosed.', positioning: 'Long-term positioning is the sector case you maintain; short-term tactics are changes based on new evidence this round.',
      chartTitle: '36 months of synthetic history', chartLabel: 'Prior-information factor strategy versus equal-sector benchmark NAV', firstNav: 'Initial NAV 1', months: '36 months', factorValidity: 'Factor validity', factor: 'Factor', ic: 'Mean Rank IC', samples: 'Valid months',
      method: 'Method and monthly records', methodText: 'After six warm-up months, rank only information known at each decision time. The top two sectors receive 50% each. The benchmark holds 20% in each sector. Both rebalance monthly with zero costs and no leverage.',
      limitation: 'All history is synthetic. Small samples and repeated tuning cannot establish real-world validity. This method exercise differs from the simulation’s 40% sector cap and trading costs.',
      month: 'Month', selected: 'Prior selection', monthlyStrategy: 'Strategy return', monthlyBenchmark: 'Benchmark return', synthetic: 'Synthetic observation', inference: 'Interpretation',
      cycle: 'Macro conditions and sector judgment', rate: 'Policy rate', growth: 'Economic growth', credit: 'Credit pressure',
      cycleNote: 'The cycle label is produced by a teaching model. It is not a real-market assessment.',
      inferenceText: 'Check orders, inventories and earnings. Rising prices alone do not establish recovery.',
      percent: 'percent', source: 'Sources and course scope'
    }
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selectedEvidenceTab = 'market';
  let current = 'research', desired = current, phase = null, lang = 'zh-CN', initialized = false;
  let transition = null, settled = Promise.resolve(), preferences = [25, 25, 25, 25], researchResult = null, researchLanguage = null, researchDirty = false, researchRun = false, selectedMonth = 0;
  let resultPreferences = [25, 25, 25, 25], researchEfficacy = false, researchIdentity = null;
  const researchIds = ['Momentum', 'Value', 'Quality', 'LowVol'];
  const executionIds = {Momentum:'momentum', Value:'value', Quality:'quality', LowVol:'lowVol'};
  let researchChartSize = '';
  const researchChartObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => renderResearchChart()) : null;
  const text = () => labels[lang];
  const numeric = (value, digits = 2) => Number.isFinite(value) ? (Math.abs(value) < .5 * 10 ** -digits ? 0 : value).toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
  const pct = value => Number.isFinite(value) ? numeric(value * 100) + '%' : '—';

  function getResearchProgress() {
    return {hasRun:researchRun,dirty:researchDirty,hasEfficacy:researchEfficacy,preferences:[...preferences],resultPreferences:[...resultPreferences]};
  }
  function getResearch() {
    if (!researchResult && researchRun && window.InvestigationResearch) {
      researchResult = window.InvestigationResearch.analyze(Object.fromEntries(researchIds.map((id,i)=>[id,resultPreferences[i]])));
    }
    return researchResult;
  }
  function saveResearchProgress() {
    window.FactorLabApp?.setResearchProgress?.(getResearchProgress());
    renderHandoff();
  }
  function restoreResearchProgress() {
    const progress = window.FactorLabApp?.getUI().researchProgress || {};
    const valid = value => Array.isArray(value) && value.length === 4 && value.every(v=>Number.isFinite(v) && v >= 0 && v <= 100);
    preferences = valid(progress.preferences) ? [...progress.preferences] : [25,25,25,25];
    resultPreferences = valid(progress.resultPreferences) && progress.resultPreferences.some(v=>v>0) ? [...progress.resultPreferences] : [25,25,25,25];
    researchRun = progress.hasRun === true;
    researchDirty = progress.dirty === true || preferences.some((value,i)=>value !== resultPreferences[i]);
    researchEfficacy = progress.hasEfficacy === true && researchRun && !researchDirty;
    researchResult = null; researchLanguage = null;
    renderHandoff();
    if (current === 'backtest') renderResearch(true);
  }
  function renderHandoff() {
    const app = window.FactorLabApp, host = $('view-portfolio'); if (!host || !app) return;
    let root = $('allocation-handoff');
    if (!root) { root = document.createElement('details'); root.id = 'allocation-handoff'; root.className = 'allocation-handoff panel'; host.appendChild(root); }
    const en = lang === 'en', t = text(), ui = app.getUI();
    const status = !researchRun ? (en ? 'Not yet tested with your own backtest.' : '尚未运行自己的回测。') : researchDirty ? (en ? 'Preferences changed; displayed results are from the previous run.' : '偏好已更改；当前显示的是上次回测结果。') : (en ? 'Current preferences have a recorded synthetic backtest.' : '当前偏好已完成合成回测。');
    const summary = preferences.map((value,i)=>t.factorNames[i] + ' ' + value).join(en ? ' / ' : ' · ');
    const disabled = app.getState().phase !== 'decision' || ui.busy || !preferences.some(v=>v>0);
    const html = `<summary>${en ? 'Use factor preferences' : '按因子偏好配置'}</summary><a href="#/backtest" data-open-view="backtest">${en ? 'Edit factors' : '调整因子'}</a><p class="handoff-factors">${esc(summary)}</p><p id="handoff-status" role="status">${esc(status)}</p><p class="footnote">${en ? 'Research uses monthly top-two sectors at 50% each with no fees. Execution keeps your cash, caps each sector at 40% and charges trading costs. A draft remains editable until you confirm.' : '研究回测每月选前二行业、各占 50%、免交易费；本轮配置保留现金、单行业上限 40%，并计交易费。生成后仍是草案，须由你确认。'}</p><button id="apply-research-draft" class="secondary" ${disabled ? 'disabled' : ''}>${en ? 'Generate allocation draft from these factors' : '按这些因子生成配置草案'}</button>`;
    if (root.innerHTML === html) return;
    root.innerHTML = html;
    $('apply-research-draft').addEventListener('click',()=>{
      const factors = Object.fromEntries(researchIds.map((id,i)=>[executionIds[id],preferences[i]]));
      app.applyResearchDraft(factors);
    });
  }

  function animateSurface(root) {
    if (window.FactorExperience) return window.FactorExperience.surface(root);
    if (reduced() || !root || !window.Motion?.animate) return;
    const targets = [...root.querySelectorAll('.panel, .review-card, .backtest-controls, .backtest-summary, .cycle-evidence, .cycle-inference')].filter(el => el.getClientRects().length);
    if (!targets.length) targets.push(root);
    try { window.Motion.animate(targets, { opacity: [0.35, 1], y: [10, 0] }, { duration: .32, delay: window.Motion.stagger ? window.Motion.stagger(.025) : 0, ease: [0.22, 1, 0.36, 1] }); } catch {}
  }

  function updateEvidenceNavigation() {
    document.querySelectorAll('#evidence-tabs button').forEach(button => {
      const selected = current === 'backtest' ? button.dataset.openView === 'backtest' : current === 'research' && button.dataset.evidenceTab === selectedEvidenceTab;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
  }
  function setEvidenceTab(tab) {
    if (['market', 'options', 'fundamentals', 'news'].includes(tab)) selectedEvidenceTab = tab;
    updateEvidenceNavigation();
  }

  function updateLabels() {
    const t = text();
    if ($('view-title')) $('view-title').textContent = t[current][0];
    if ($('view-description')) { $('view-description').textContent = t[current][1]; $('view-description').hidden = !t[current][1]; }
    updateEvidenceNavigation();
    document.querySelectorAll('[data-view]').forEach(button => {
      const selected = button.dataset.view === (current==='backtest'?'research':current);
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      const label = button.querySelector('[data-nav-label]');
      if (label && t[button.dataset.view]) label.textContent = t[button.dataset.view][0];
    });
    document.querySelectorAll('[data-zh][data-en]').forEach(el => { el.textContent = lang === 'en' ? el.dataset.en : el.dataset.zh; });
  }

  function applyView(view, focus, historyMode = 'replace') {
    current = view;
    document.body.dataset.currentView = current;
    document.querySelectorAll('[data-view-panel]').forEach(panel => { panel.hidden = panel.dataset.viewPanel !== current; });
    const market = $('shared-market');
    const host = $(current === 'risk' ? 'market-host-risk' : 'market-host-research');
    if (market && host && market.parentElement !== host) host.appendChild(market);
    if ($('evidence-tabs')) $('evidence-tabs').hidden = !['research','backtest'].includes(current);
    updateLabels();
    if (current === 'backtest') renderResearch();
    const panel = document.querySelector(`[data-view-panel="${current}"]`);
    if (panel) panel.scrollTop = 0;
    if (window.scrollY) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (focus && $('view-title')) { $('view-title').setAttribute('tabindex', '-1'); $('view-title').focus({ preventScroll: true }); }
    try { if (historyMode !== 'none' && location.hash !== '#/' + current) history[historyMode === 'push' ? 'pushState' : 'replaceState'](null, '', '#/' + current); } catch {}
    document.dispatchEvent(new CustomEvent('factorlab:view', { detail: { view: current } }));
  }

  function go(view, options = {}) {
    if (!views.includes(view)) return settled;
    desired = view;
    const focus = options.focus === true;
    if (current === view && !transition) { if (location.hash !== '#/' + view) applyView(view, focus, options.history || 'push'); else updateLabels(); return settled; }
    if (transition) { transition.skipTransition(); return settled.then(() => go(desired, options)); }
    const apply = () => applyView(desired, focus, options.history || 'push');
    if (!reduced() && typeof document.startViewTransition === 'function' && options.animate !== false) {
      transition = document.startViewTransition(apply);
      settled = transition.finished.catch(() => {}).then(() => { transition = null; });
    } else {
      apply();
      if (options.animate !== false) animateSurface(document.querySelector(`[data-view-panel="${current}"]`));
      settled = Promise.resolve();
    }
    return settled;
  }

  function researchChart(result, width, height) {
    const t = text(), left = 56, right = 20, top = 22, bottom = 32;
    const values = result.strategy.nav.concat(result.benchmark.nav);
    let min = Math.min(...values), max = Math.max(...values);
    const pad = Math.max(.035, (max - min) * .12); min -= pad; max += pad;
    const y = value => top + (max - value) / (max - min) * (height - top - bottom);
    const points = values => values.map((value, i) => `${left + i / 36 * (width - left - right)},${y(value)}`).join(' ');
    const grid = [0, 1, 2].map(i => { const value = min + (max - min) * i / 2, yy = y(value); return `<line x1="${left}" x2="${width-right}" y1="${yy}" y2="${yy}" stroke="#444953"/><text x="${left-10}" y="${yy+5}" fill="#b8bcc3" font-size="14" text-anchor="end">${numeric(value)}</text>`; }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t.chartLabel)}" xmlns="http://www.w3.org/2000/svg">${grid}<polyline data-series="benchmarkNav" points="${points(result.benchmark.nav)}" stroke="#b8bcc3" stroke-width="2" stroke-dasharray="6 5" fill="none"/><polyline data-series="nav" points="${points(result.strategy.nav)}" stroke="#a8bfdb" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/><text x="${left}" y="${height-5}" fill="#b8bcc3" font-size="14">${esc(t.firstNav)}</text><text x="${width-right}" y="${height-5}" fill="#b8bcc3" font-size="14" text-anchor="end">${esc(t.months)}</text></svg>`;
  }

  function renderResearchChart(force = false) {
    const host = $('backtest-content')?.querySelector('.backtest-chart');
    if (!host || !researchResult || !host.getClientRects().length || !host.clientWidth || !host.clientHeight) return;
    const size = host.clientWidth + 'x' + host.clientHeight;
    if (!force && researchChartSize === size) return;
    FactorVisuals.chart(host,{rows:researchResult.strategy.nav.map((nav,i)=>({nav,benchmarkNav:researchResult.benchmark.nav[i],month:i})),series:[{key:'benchmarkNav',name:text().benchmark,color:'#54534e',dash:true},{key:'nav',name:text().strategy,color:'#814d68'}],label:text().chartLabel,format:v=>numeric(v,2),xLabel:r=>(lang==='en'?'Month ':'样本月 ')+(r?.month||0)});
    researchChartSize=size;
  }

  function renderResearch(force = false) {
    const root = $('backtest-content'), R = window.InvestigationResearch;
    if (!root || !R) return;
    if (researchResult && researchLanguage === lang && !force) return;
    const focusedControl = root.contains(document.activeElement) ? document.activeElement.id : null;
    const t = text();
    if (!researchResult) researchResult = R.analyze(Object.fromEntries(researchIds.map((id,i)=>[id,resultPreferences[i]])));
    researchLanguage = lang;
    const a = researchResult, sectorName = id => {
      const index = R.SECTORS.findIndex(sector => sector.id === id);
      return lang === 'en' ? ['Semiconductors', 'Robotics', 'Advanced materials', 'Clean energy', 'AI infrastructure'][index] : R.SECTORS[index]?.name || id;
    };
    const stats = [[t.strategy, pct(a.strategy.totalReturn)], [t.benchmark, pct(a.benchmark.totalReturn)], [t.drawdown, pct(a.strategy.maxDrawdown)]];
    researchChartObserver?.disconnect();
    researchChartSize = '';
    root.innerHTML = `<div class="backtest-layout"><section class="backtest-controls panel"><div class="panel-head"><h2>${esc(t.weights)}</h2><span class="source-tag">${esc(t.sampleBadge)}</span></div><p class="footnote">${esc(t.factorIntro)}</p>${preferences.map((value, i) => `<div class="backtest-factor"><label for="research-weight-${i}">${esc(t.factorNames[i])}</label><output id="research-output-${i}" for="research-weight-${i}">${value}</output><input id="research-weight-${i}" data-research-factor="${i}" type="range" min="0" max="100" step="5" value="${value}" aria-label="${esc(t.factorNames[i])}"><small>${esc(t.factorHelp[i])}</small></div>`).join('')}<div class="backtest-actions"><button id="run-backtest" class="primary">${esc(t.run)}</button><button id="reset-backtest">${esc(t.reset)}</button></div><p class="backtest-status" id="backtest-status" role="status">${esc(t.applied)}</p><p class="footnote">${esc(t.researchNote)}</p></section><div class="backtest-results"><section class="panel research-spec"><div class="panel-head"><h2>${esc(t.specTitle)}</h2><span class="source-tag">${esc(t.synthetic)}</span></div><dl><div><dt>${esc(t.samples)}</dt><dd>${esc(t.specSample)}</dd></div><div><dt>${esc(t.factor)}</dt><dd>${esc(t.specFactors)}</dd></div><div><dt>${esc(t.selected)}</dt><dd>${esc(t.specRules)}</dd></div></dl><p class="footnote">${esc(t.specNote)}</p></section><section class="backtest-summary">${stats.map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong>${label === t.drawdown ? `<small>${esc(t.drawdownHelp)}</small>` : ''}</div>`).join('')}</section><section class="panel"><div class="panel-head"><h2>${esc(t.chartTitle)}</h2><span class="source-tag">${esc(t.sampleBadge)}</span></div><div class="backtest-chart"></div><div class="chart-legend"><span class="legend portfolio-line">${esc(t.strategy)}</span><span class="legend benchmark-line">${esc(t.benchmark)}</span></div></section><section class="panel factor-validity"><h2>${esc(t.factorValidity)}</h2><p class="footnote">${esc(t.icHelp)}</p><table><thead><tr><th>${esc(t.factor)}</th><th>${esc(t.ic)}</th><th>${esc(t.samples)}</th></tr></thead><tbody>${a.factors.map((factor, i) => `<tr><td>${esc(t.factorNames[i])}</td><td>${numeric(factor.meanIC, 3)}</td><td>${factor.validMonths} / ${a.sampleCount}</td></tr>`).join('')}</tbody></table><p class="footnote">${esc(t.limitation)}</p><details class="factor-sample-details"><summary>${esc(t.validityDetails)}</summary><p>${esc(t.spread)}: <strong>${numeric(a.meanSpread * 100, 3)} ${lang === 'en' ? 'percentage points' : '个百分点'}</strong></p><p>${esc(t.sampleHelp)}</p><p>${esc(t.tuningHelp)}</p></details></section><section class="panel month-inspector"><div class="panel-head"><h2>${esc(t.monthPick)}</h2><span class="source-tag">${esc(t.synthetic)}</span></div><p class="footnote">${esc(t.monthDetail)}</p><label for="research-month">${esc(t.monthLabel)} <select id="research-month">${a.months.map((month, i) => `<option value="${i}" ${i === selectedMonth ? 'selected' : ''}>${i + 1} · ${esc(month.top.map(sectorName).join(lang === 'en' ? ' / ' : '、'))}</option>`).join('')}</select></label><div id="month-detail"></div></section></div></div><details class="backtest-method"><summary>${esc(t.method)}</summary><p>${esc(t.methodText)}</p><div class="backtest-months"><table><thead><tr><th>${esc(t.month)}</th><th>${esc(t.selected)}</th><th>${esc(t.monthlyStrategy)}</th><th>${esc(t.monthlyBenchmark)}</th></tr></thead><tbody>${a.months.map((month, i) => `<tr><td>${i+1}</td><td>${esc(month.top.map(sectorName).join(lang === 'en' ? ' / ' : '、'))}</td><td>${pct(month.strategyReturn)}</td><td>${pct(month.benchmarkReturn)}</td></tr>`).join('')}</tbody></table></div></details>`;
    renderResearchChart(true);
    const fillMonth = () => {
      const host = root.querySelector('#month-detail'); if (!host || !a.months.length) return;
      selectedMonth = Math.max(0, Math.min(a.months.length - 1, Number(selectedMonth) || 0));
      const month = a.months[selectedMonth];
      host.innerHTML = `<div class="month-summary"><span>${esc(t.monthLabel)} ${selectedMonth + 1}</span><span>${esc(t.strategy)} ${pct(month.strategyReturn)}</span><span>${esc(t.benchmark)} ${pct(month.benchmarkReturn)}</span></div><div class="table-scroll"><table><thead><tr><th>${esc(t.sector)}</th><th>${esc(t.score)}</th><th>${esc(t.factorNames[0])}</th><th>${esc(t.factorNames[1])}</th><th>${esc(t.factorNames[2])}</th><th>${esc(t.factorNames[3])}</th><th>${esc(t.nextReturn)}</th></tr></thead><tbody>${month.rankings.map(row => `<tr><td>${esc(sectorName(row.id))}</td><td>${numeric(row.score, 1)}</td>${['Momentum','Value','Quality','LowVol'].map(id => `<td>${row.raw[id] === null ? '—' : pct(row.raw[id])}</td>`).join('')}<td>${pct(month.forward[row.id])}</td></tr>`).join('')}</tbody></table></div><div class="month-ic"><strong>${esc(t.icLabel)}</strong>${Object.entries(month.ic).map(([id, value], i) => `<span>${esc(t.factorNames[i])} ${value === null ? '—' : numeric(value, 3)}</span>`).join('')}</div><p class="footnote">${esc(t.monthHint)}</p>`;
    };
    fillMonth();
    root.querySelector('#research-month')?.addEventListener('change', event => { selectedMonth = Number(event.target.value); fillMonth(); });
    if (researchChartObserver) researchChartObserver.observe(root.querySelector('.backtest-chart'));
    root.querySelectorAll('[data-research-factor]').forEach(input => input.addEventListener('input', () => {
      const i = Number(input.dataset.researchFactor); preferences[i] = Number(input.value); researchDirty = true; researchEfficacy = false;
      $('research-output-' + i).textContent = input.value;
      $('backtest-status').textContent = t.pending;
      const stale = root.querySelector('.backtest-stale'); if (stale) stale.hidden = false;
      saveResearchProgress();
    }));
    $('run-backtest').addEventListener('click', () => {
      try {
        researchResult = R.analyze(Object.fromEntries(researchIds.map((id, i) => [id, preferences[i]]))); resultPreferences = [...preferences]; researchDirty = false; researchRun = true; researchEfficacy = false;
        saveResearchProgress();
        renderResearch(true); animateSurface(root);
        document.dispatchEvent(new CustomEvent('factorlab:feedback', {detail:{kind:'backtest', stage:'success'}}));
      } catch { $('backtest-status').textContent = t.invalid; }
    });
    $('reset-backtest').addEventListener('click', () => { preferences = [25, 25, 25, 25]; researchDirty = true; researchEfficacy = false; saveResearchProgress(); renderResearch(true); animateSurface(root); });
    const stale = document.createElement('p'); stale.className = 'backtest-stale footnote'; stale.hidden = !researchDirty;
    stale.textContent = lang === 'en' ? 'These results use the previous factor preferences. Run the backtest again to test the changed preferences.' : '下方仍为上次偏好的结果。重新运行回测，才能检验刚修改的偏好。';
    root.querySelector('.backtest-results').prepend(stale);
    root.querySelector('.factor-sample-details').addEventListener('toggle',event=>{
      if (event.target.open && researchRun && !researchDirty && !researchEfficacy) { researchEfficacy = true; saveResearchProgress(); }
    });
    $('backtest-status').textContent = researchDirty ? t.pending : researchRun ? t.applied : t.preview;
    if (focusedControl && $(focusedControl)?.getClientRects().length) $(focusedControl).focus({ preventScroll: true });
  }

  function renderCycle(state) {
    const root = $('cycle-notes'); if (!root) return;
    const t = text(), macro = state.macro, wasOpen = root.querySelector('details')?.open;
    root.innerHTML = `<details class="cycle-evidence" ${wasOpen ? 'open' : ''}><summary>${esc(t.macroDetails)}</summary><span class="source-tag" title="${esc(t.cycleNote)}">${esc(t.synthetic)}</span><div class="cycle-row"><span>${esc(t.rate)} <strong>${numeric(macro.rate, 1)}%</strong></span><span>${esc(t.growth)} <strong>${numeric(macro.growth, 1)}%</strong></span><span>${esc(t.credit)} <strong>${numeric(macro.credit, 0)} / 100</strong></span></div><p class="footnote">${esc(t.positioning)}</p><p>${esc(t.inferenceText)}</p></details>`;
  }

  function sync() {
    const app = window.FactorLabApp; if (!app) return;
    const ui = app.getUI(), state = app.getState(), nextLang = ui.lang;
    const changedLanguage = nextLang !== lang;
    lang = nextLang;
    const identity = JSON.stringify([ui.profileId,ui.campaignEpoch]);
    if (researchIdentity !== identity) { researchIdentity = identity; restoreResearchProgress(); }
    updateLabels(); renderCycle(state);
    renderHandoff();
    if (changedLanguage && current === 'backtest') renderResearch(true);
    if (!initialized) {
      initialized = true; phase = state.phase;
      const requested = hashView();
      const initial = views.includes(requested) ? requested : ['review', 'complete'].includes(phase) ? 'journal' : phase === 'event' || state.day === 0 ? 'research' : 'portfolio';
      applyView(initial, false);
      animateSurface(document.querySelector(`[data-view-panel="${current}"]`));
      return;
    }
    if (state.phase !== phase) {
      const previous = phase; phase = state.phase;
      if (['review', 'complete'].includes(phase)) go('journal', { focus: true });
      else if (phase === 'event') go('research', { focus: true });
      else if (phase === 'simulating') go('portfolio', { focus: true });
      else if (phase === 'decision' && previous !== null) go('portfolio', { focus: true });
    }
  }

  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => go(button.dataset.view, { focus: true })));
  document.addEventListener('click', event => {
    const action = event.target.closest('[data-open-view]');
    if (action) { event.preventDefault(); go(action.dataset.openView, { focus: true }); }
  });
  window.addEventListener('hashchange', () => { const requested = hashView(); if (views.includes(requested)) go(requested, {history:'none'}); });
  for (const [openId, closeId, dialogId] of [['open-coach', 'close-coach', 'coach-drawer'], ['open-context', 'close-context', 'course-context']]) {
    $(openId)?.addEventListener('click', () => { document.dispatchEvent(new Event('factorlab:pause')); const dialog = $(dialogId); if(dialogId==='coach-drawer'){window.FactorLabStudio?.openChat();}else dialog.showModal(); animateSurface(dialog); });
    $(closeId)?.addEventListener('click', () => $(dialogId).close());
  }
  document.addEventListener('toggle', event => { if (event.target instanceof HTMLDetailsElement && event.target.open) animateSurface(event.target); }, true);
  document.addEventListener('factorlab:render', sync);
  document.addEventListener('factorlab:view', () => renderResearchChart());
  document.addEventListener('factorlab:profile', restoreResearchProgress);
  document.addEventListener('factorlab:restore', restoreResearchProgress);
  document.addEventListener('factorlab:new', restoreResearchProgress);
  if (!researchChartObserver) window.addEventListener('resize', () => renderResearchChart());
  window.FactorLabWorkspace = { go, setEvidenceTab, getView: () => current, get settled() { return settled; }, getResearch, getResearchStatus: getResearchProgress, getResearchProgress };
  sync();
})();

;
(function (root) {
  'use strict';
  const cues = {
    intro: {
      en: ['Welcome to FactorLab.', 'Practice allocating across advanced manufacturing and technology.', 'Start with one piece of evidence, then decide whether to keep or change your teaching allocation.'],
      zh: ['欢迎来到 FactorLab。', '在这里练习高端制造与尖端科技的行业配置。', '先看一条证据，再决定保留还是调整教学配置。']
    },
    evidence: {
      en: ['Start with one piece of evidence.', 'Separate what is confirmed from what still needs checking.'],
      zh: ['先看一条本轮证据。', '区分已经确认的事实，以及仍需核查的说法。']
    },
    confirm: {
      en: ['Check weights, cash and costs, then confirm.', 'Keeping the teaching allocation is also a choice.'],
      zh: ['核对比例、现金和费用后即可确认。', '保留教学配置也是一种选择。']
    },
    allocation: {
      en: ['Review the allocation and sector limits.', 'You can record evidence and reasoning in your decision notes.'],
      zh: ['检查配置比例与行业上限。', '可以在决策笔记中记录证据和判断。']
    },
    event: {
      en: ['A new market update has paused the simulation.', 'Check whether it changes your original reasoning, then continue. Holdings are locked for this round.'],
      zh: ['市场出现新消息，模拟已暂停。', '看看它是否改变了原来的判断，再继续本轮。本轮持仓已锁定。']
    },
    simulation: {
      en: ['Your allocation is confirmed.', 'The simulation will pause when a new update arrives.'],
      zh: ['本轮配置已确认。', '遇到新消息时，模拟会暂停。']
    },
    review: {
      en: ['Compare the result with the benchmark and costs.', 'Revisit your original evidence before starting the next round.'],
      zh: ['对照基准与费用查看本轮结果。', '回看当时的证据，再开始下一轮。']
    },
    course: {
      en: ['The six rounds are complete.', 'Finish a factor backtest and inspect efficacy, then complete your reflection.'],
      zh: ['六轮模拟已经结束。', '完成因子回测与功效查看，再整理最终反思。']
    },
    complete: {
      en: ['Review your course checklist.', 'Summarize long-term positioning, tactical changes and one improvement.'],
      zh: ['核对课程研究清单。', '总结长期定位、战术调整，以及下次想改进的一点。']
    }
  };
  const characters = ['knight','kurumi'];
  const clipFile = (key,character,language) => key+'-'+character+'-'+language+'.mp3';
  const audioFiles = Object.keys(cues).flatMap(key=>characters.flatMap(character=>['en','zh'].map(language=>clipFile(key,character,language))));
  const api = {cues,characters,clipFile,audioFiles};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FactorLabGuideContent = api;
})(typeof globalThis === 'undefined' ? this : globalThis);

;
(function (root) {
  'use strict';
  const content = typeof module === 'object' && module.exports ? require('./guide-content.js') : root.FactorLabGuideContent;
  function isNextStepQuestion(question) {
    const text=String(question).trim();
    if(text.length>100)return false;
    return /^(?:我(?:现在|接下来)?(?:该|应该)?(?:先)?(?:做|干)什么|(?:我该)?(?:从哪|怎么|如何)开始|(?:接下来|下一步)(?:该|应该|要)?(?:做什么|怎么做)?|怎么玩)[？?。!！\s]*$/.test(text)
      || /^(?:(?:what|where|how|which)\b.*(?:first|next|start|begin|step)|(?:getting started|next step|how to play|walk me through))[?.!\s]*$/i.test(text);
  }
  function derive(state = {}, ui = {}, progress = {}, lang = 'zh-CN') {
    const en = lang === 'en', round = state.round || 1;
    const make = (kind, zh, english, view, necessary = true) => ({kind, key:kind + ':' + round, text:en ? english : zh, view, necessary});
    let task;
    if (state.phase === 'event') task = make('event','市场有新消息，可以查看后继续。','A market update is available. Read it, then continue.','research');
    else if (state.phase === 'simulating') task = make('simulation','正在模拟本轮表现。','Simulating this round’s performance.','portfolio');
    else if (state.phase === 'review') task = make('review','本轮已结束，查看结果或开始下一轮。','Round complete. View the results or start the next round.','journal');
    else if (state.phase === 'complete') task = !progress.hasRun || progress.dirty || !progress.hasEfficacy
      ? make('course','六轮已结束。补齐课程要求的因子回测与功效查看，再整理最终反思。','Six rounds are complete. Finish the required course backtest and efficacy review, then complete your reflection.','backtest')
      : make('complete','六轮已结束。核对课程清单，整理长期定位、战术调整和最终反思。','Six rounds are complete. Check the course checklist and summarize positioning, tactical changes and your final reflection.','journal');
    else if (ui.gate?.canConfirm) task = make('confirm','核对比例、现金和费用后即可确认。','Check weights, cash and costs, then confirm.','portfolio');
    else task = make('allocation','在配置页检查比例与行业上限。证据和判断可记录在决策笔记中。','Check the allocation and sector limits. Evidence and rationale can go in your decision notes.','portfolio');
    const reminders = [task];
    if (progress.dirty) reminders.push(make('research-dirty','因子偏好已变化；当前图表仍是上次结果，重新回测后才能用于本次检验。','Factor preferences changed. The chart still shows the previous result; rerun the backtest for the current preferences.','backtest',false));
    if ((!progress.hasRun || !progress.hasEfficacy) && state.phase !== 'complete') reminders.push(make('course','本轮回测可选；最终课程练习仍需完成一次因子回测并查看功效。','Backtesting is optional each round. The final course exercise still requires a backtest and an efficacy review.','backtest',false));
    if (state.phase === 'decision' && ui.guide && !ui.guide.viewed && !ui.guide.skipped) {
      task = make('evidence', '', '', 'research');
      task.target = {evidenceId:state.evidence?.[0]?.id || 'E1'};
      reminders[0] = task;
    }
    if (state.phase === 'event') {
      task.target = {eventId:state.events?.at(-1)?.id};
      task.key += ':' + (task.target.eventId || state.day);
    }
    const copy = content?.cues[task.kind];
    if (copy) {
      task.en = copy.en.join(' ');
      task.zh = copy.zh.join('');
      task.text = en ? task.en : task.zh;
      task.clip = task.kind;
    }
    task.target ||= {};
    return {task,reminders};
  }

  function feedback(state, event, lang = 'zh-CN', progress) {
    if (event.round !== undefined && event.round !== state.round) return null;
    if (event.kind === 'backtest' && progress && (!progress.hasRun || progress.dirty || progress.hasEfficacy)) return null;
    const en = lang === 'en', kind = event.kind;
    let text, motion = null;
    if (kind === 'settlement') {
      const complete = state.phase === 'complete';
      text = complete ? (en ? 'Six rounds settled. Review the course checklist and final reflection.' : '六轮结算完成，请核对课程清单并整理最终反思。') : (en ? 'Round settled. Compare the result with the benchmark, costs and original evidence.' : '本轮已结算，请对照基准、费用与原来的证据复盘。');
      motion = complete ? 'milestone' : null;
    } else if (kind === 'citation') text = en ? 'Evidence references updated. Check whether they support your judgment.' : '证据引用已更新，请核对它是否支持你的判断。';
    else if (kind === 'draft') text = en ? 'Allocation draft updated. Review cash, sector limits and costs before confirming.' : '配置草案已更新，确认前请核对现金、行业上限与费用。';
    else if (kind === 'gate') { text = en ? 'Check the current task for the remaining decision requirements.' : '请按当前任务补齐决策记录。'; motion = 'caution'; }
    else if (kind === 'backtest') text = en ? 'Backtest updated. Review efficacy and sample limits before drawing a conclusion.' : '回测已更新，请查看因子功效和样本限制后再下结论。';
    else return null;
    const feedbackKind = kind === 'settlement' && state.phase === 'complete' ? 'completion' : kind;
    return {kind:feedbackKind,key:feedbackKind + ':' + state.round,text,motion,necessary:kind === 'gate',phase:state.phase,round:state.round};
  }

  function createSession() {
    let reminders = [];
    const shown = new Map();
    return {
      update(plan, now = Date.now(), focus = false) {
        const active = new Map(plan.reminders.map(item => [item.key,item]));
        reminders = reminders.filter(item => active.has(item.key)).map(item => ({...active.get(item.key),at:item.at}));
        for (const item of plan.reminders) {
          if (focus && !item.necessary) continue;
          if (reminders.some(old => old.key === item.key)) continue;
          if (now - (shown.get(item.kind) ?? -Infinity) < 60000) continue;
          shown.set(item.kind,now);
          reminders.push({...item,at:now});
        }
        reminders = reminders.slice(-5);
        return {task:plan.task,reminders:reminders.filter(item => !focus || item.necessary).map(item => ({...item})),focus};
      },
      dismiss(key) { reminders = reminders.filter(item => item.key !== key); },
      reset() { reminders = []; shown.clear(); }
    };
  }

  const api = {derive,feedback,createSession,isNextStepQuestion};
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  root.FactorLabGuidance = api;
  const $ = id => document.getElementById(id), session = createSession();
  let identity = null, focus = false, lastFeedback = null, lastFeedbackAt = 0, lastFeedbackEvent = null, snapshot = null;
  const feedbackShown = new Map();
  let guideViewed = false, guideSkipped = false;
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const preferenceKey = () => 'factorlab-guidance-focus:' + (root.FactorLabApp?.getUI().profileId ?? 'guest');
  function reset() {
    session.reset(); feedbackShown.clear(); lastFeedback = null; lastFeedbackEvent = null;
    guideViewed = false; guideSkipped = false;
    try { focus = localStorage.getItem(preferenceKey()) === 'on'; } catch { focus = false; }
  }
  function sync(event) {
    const app = root.FactorLabApp; if (!app) return;
    const state = app.getState(), ui = app.getUI(), lang = ui.lang, en = lang === 'en';
    if (event && ((event.campaignEpoch !== undefined && event.campaignEpoch !== ui.campaignEpoch) || (event.round !== undefined && event.round !== state.round))) return;
    const nextIdentity = JSON.stringify([ui.profileId,ui.campaignEpoch]);
    if (identity !== nextIdentity) { identity = nextIdentity; reset(); }
    const progress = root.FactorLabWorkspace?.getResearchProgress?.() || ui.researchProgress || {};
    const guide = {viewed:guideViewed || !!state.seen?.length || state.day > 0,skipped:guideSkipped};
    const plan = derive(state,{...ui,guide},progress,lang), now = Date.now();
    let announced = null;
    const candidate = event ? feedback(state,event,lang,progress) : null;
    if (candidate && now - (feedbackShown.get(candidate.kind) ?? -Infinity) >= 60000) {
      lastFeedbackEvent = event; lastFeedback = candidate; lastFeedbackAt = now;
      feedbackShown.set(candidate.kind,now); announced = lastFeedback;
    }
    if (lastFeedback && (lastFeedback.phase !== state.phase || lastFeedback.round !== state.round || now - lastFeedbackAt >= 60000)) { lastFeedback = null; lastFeedbackEvent = null; }
    if (lastFeedback) {
      lastFeedback = feedback(state,lastFeedbackEvent,lang,progress);
      if (lastFeedback && (lastFeedback.kind !== 'gate' || ui.gate?.status !== 'ready')) plan.reminders.push(lastFeedback);
      else { lastFeedback = null; lastFeedbackEvent = null; }
    }
    snapshot = session.update(plan,now,focus);
    document.body.dataset.partnerFocus = focus ? 'on' : 'off';
    if ($('partner-focus')) $('partner-focus').checked = focus;
    const task = $('partner-task');
    if (task) {
      task.hidden=state.phase==='decision';
      const html = `<span class="step-kicker">${en ? 'NEXT STEP' : '当前下一步'}</span><p>${esc(snapshot.task.text)}</p><div class="partner-actions"><button class="text-button" data-guide-action>${actionLabel(snapshot.task,lang)}</button><button class="text-button" data-open-partner>${en ? 'Ask the research helper' : '询问研究助手'}</button></div>`;
      if (task.innerHTML !== html) task.innerHTML = html;
    }
    const activity = $('coach-activity-text');
    if (activity) activity.textContent = snapshot.task.text;
    const activityBox=$('coach-activity');
    if(activityBox&&activityBox.dataset.task!==snapshot.task.key){
      activityBox.dataset.task=snapshot.task.key;
      if($('coach-activity-explanation'))$('coach-activity-explanation').hidden=true;
    }
    const button = $('coach-activity-action');
    if (button) button.textContent = actionLabel(snapshot.task,lang);
    const pin = $('coach-current-guide');
    if (pin && pin.dataset.task !== snapshot.task.key + lang) {
      pin.dataset.task=snapshot.task.key+lang;
      pin.innerHTML = `<p>${esc(snapshot.task.text)}</p><button class="text-button" data-guide-action>${actionLabel(snapshot.task,lang)}</button>`;
    }
    let firstStep = $('research-first-step');
    if (!firstStep) {
      firstStep = document.createElement('section');
      firstStep.id = 'research-first-step';
      firstStep.className = 'research-start';
      $('view-research')?.prepend(firstStep);
    }
    firstStep.hidden = state.day > 0 || state.phase !== 'decision';
    const firstEvidence = state.evidence?.[0];
    const heading = en ? 'Begin with the evidence you have' : '先看眼前这条证据';
    const title = firstEvidence ? root.FactorLabStrings?.[lang]?.[firstEvidence.titleKey] || root.FactorLabSimulation?.TEXTS?.[lang]?.[firstEvidence.titleKey] : '';
    const detail = en ? 'Read one observation, check its timing and decide what it supports. You can keep the initial weights or adjust them.' : '读一条观测，核对它在何时可见，再判断它支持什么。可以保留初始比例，也可以调整。';
    const firstStepHTML = `<h2>${heading}</h2>${title?`<p><strong>${esc(title)}</strong></p>`:''}<p>${detail}</p><div class="partner-actions"><button class="primary" data-guide-first-evidence>${en?'Read the evidence':'查看本轮证据'}</button><button class="text-button" data-guide-skip-evidence>${en?'Go straight to allocation':'直接配置'}</button></div>`;
    if(firstStep.innerHTML!==firstStepHTML)firstStep.innerHTML=firstStepHTML;
    const list = $('partner-reminders');
    if (list) {
      const html = snapshot.reminders.map(item=>`<li data-guidance-kind="${esc(item.kind)}"><p>${esc(item.text)}</p><button class="text-button" data-dismiss-guidance="${esc(item.key)}" aria-label="${en ? 'Dismiss reminder' : '收起这条提示'}">${en ? 'Dismiss' : '收起'}</button></li>`).join('');
      if (list.innerHTML !== html) list.innerHTML = html;
      list.hidden = !snapshot.reminders.length;
    }
    document.dispatchEvent(new CustomEvent('factorlab:guidance',{detail:{...snapshot,feedback:announced,activeFeedback:lastFeedback}}));
  }
  document.addEventListener('click',event=>{
    if (event.target.closest('[data-guide-first-evidence]')) root.FactorLabApp.openEvidence(root.FactorLabApp.getState().evidence?.[0]?.id || 'E1');
    if (event.target.closest('[data-guide-skip-evidence]')) {guideSkipped=true;sync();void root.FactorLabWorkspace.go('portfolio',{focus:true});}
    if (event.target.closest('[data-guide-action]')) void activate();
    if (event.target.closest('[data-open-partner]')) $('open-coach')?.click();
    const dismiss = event.target.closest('[data-dismiss-guidance]');
    if (dismiss) { session.dismiss(dismiss.dataset.dismissGuidance); sync(); }
  });
  function actionLabel(task,lang) {
    const en = lang === 'en';
    if (task.kind === 'evidence') return en ? 'Read one piece of evidence' : '查看本轮证据';
    if (task.kind === 'event') return en ? 'Open the new update' : '查看新证据';
    if (task.view === 'portfolio') return en ? 'Review allocation' : '制定本轮配置';
    if (task.view === 'backtest') return en ? 'Open factor backtest' : '查看因子回测';
    return en ? 'Go to task' : '前往当前任务';
  }
  async function activate() {
    if (!snapshot) return;
    root.FactorLabCompanionGuide?.dismiss();
    const task = snapshot.task;
    const epoch = root.FactorLabApp.getUI().campaignEpoch;
    if ($('coach-drawer')?.open) $('coach-drawer').close();
    await root.FactorLabWorkspace.go(task.view,{focus:true});
    if (epoch !== root.FactorLabApp.getUI().campaignEpoch || snapshot.task.key !== task.key) return;
    if (task.target.eventId) {
      const card = [...document.querySelectorAll('#events [data-event-id]')].find(el=>el.dataset.eventId===task.target.eventId);
      if (card) {
        card.tabIndex = -1;
        card.scrollIntoView({block:'center',behavior:'instant'});
        card.focus({preventScroll:true});
        card.classList.add('guide-target');
        setTimeout(()=>card.classList.remove('guide-target'),1800);
      }
    } else if (task.target.evidenceId) root.FactorLabApp.openEvidence(task.target.evidenceId);
  }
  document.addEventListener('factorlab:material-open',()=>{guideViewed=true;sync();});
  $('partner-focus')?.addEventListener('change',()=>{
    focus = $('partner-focus').checked;
    try { localStorage.setItem(preferenceKey(),focus ? 'on' : 'off'); } catch {}
    sync();
  });
  for (const name of ['factorlab:render','factorlab:research-progress','factorlab:view']) document.addEventListener(name,()=>sync());
  for (const name of ['factorlab:restore','factorlab:profile','factorlab:new']) document.addEventListener(name,()=>{reset();sync();});
  document.addEventListener('factorlab:decision-feedback',event=>sync(event.detail));
  document.addEventListener('factorlab:feedback',event=>{if(event.detail.kind === 'backtest') sync(event.detail);});
  api.getState = () => snapshot;
  api.activate = activate;
  api.actionLabel = actionLabel;
  api.skip = () => {guideSkipped=true;sync();};
  api.refresh = () => sync();
  sync();
})(typeof globalThis !== 'undefined' ? globalThis : this);

;
(function () {
  'use strict';
  const scriptBase = new URL('.', document.currentScript.src);
  const mediaBase = new URL('assets/guide/', scriptBase);
  const guideContent = window.FactorLabGuideContent;
  const content = guideContent.cues;
  const $ = id => document.getElementById(id);
  const selectedCharacter = () => $('research-pet')?.value === 'kurumi' ? 'kurumi' : 'knight';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const seenKey = 'factorlab-companion-introduction-v1';
  const soundKey = 'factorlab-companion-sound-v1';
  const voiceKey = 'factorlab-companion-voice-v1';
  const read = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key,value); } catch {} };
  const audio = new Audio();
  audio.preload = 'auto';
  let voice = read(voiceKey,'en');
  if (!['en','zh'].includes(voice)) voice = 'en';
  let sound = read(soundKey,'on') !== 'off', sessionMuted = false;
  let panel, dock, task, activeKey = '', subtitleIndex = -1, revision = 0;
  let opening = false, triedOpening = false, initialized = false, destroyed = false;
  let animation, positionFrame, metadata, identity, currentPhase, lastEventKey = '';
  let playbackCleanup = () => {};
  let metadataReady;
  function loadMetadata() {
    metadataReady ||= fetch(new URL('timings.json',mediaBase)).then(r=>r.ok?r.json():null).then(value=>metadata=value).catch(()=>null);
    return metadataReady;
  }

  function stopAudio() {
    revision++;
    playbackCleanup();
    playbackCleanup = () => {};
    audio.pause();
    activeKey = '';
    if (panel) panel.dataset.speaking = 'false';
  }
  function copy() { return content[opening ? 'intro' : task?.clip] || content.evidence; }
  function subtitle(index) {
    const lines = copy();
    const next = Math.max(0,Math.min(index,lines.en.length-1));
    if (subtitleIndex === next) return;
    subtitleIndex = next;
    $('guide-caption-en').textContent = lines.en[next];
    $('guide-caption-zh').textContent = lines.zh[next];
  }
  function showTaskText() {
    subtitleIndex = -1;
    if (opening) subtitle(0);
    else {
      $('guide-caption-en').textContent = task?.en || content.evidence.en.join(' ');
      $('guide-caption-zh').textContent = task?.zh || content.evidence.zh.join('');
    }
  }
  function position() {
    positionFrame = null;
    if (!panel || panel.hidden || dock.hidden) return;
    const rect = dock.getBoundingClientRect();
    const viewport = window.visualViewport;
    const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
    const top = viewport?.offsetTop || 0, left = viewport?.offsetLeft || 0;
    const mobile = width < 768;
    panel.style.maxWidth = Math.min(370,width-24)+'px';
    panel.style.left = (mobile ? left+12 : Math.min(rect.right+14,left+width-382))+'px';
    panel.style.bottom = (mobile ? Math.max(12,innerHeight-rect.top+10) : Math.max(18,innerHeight-rect.bottom))+'px';
    panel.style.maxHeight = Math.max(160,Math.min(height*.5,rect.top-top-12))+'px';
  }
  function queuePosition() {
    if (!positionFrame) positionFrame = requestAnimationFrame(position);
  }
  function labels() {
    const en = document.documentElement.lang === 'en';
    $('guide-title').textContent = en ? 'Your research companion' : '你的研究伙伴';
    $('guide-skip').textContent = en ? 'Skip' : '跳过';
    $('guide-close').setAttribute('aria-label',en?'Close introduction':'关闭引导');
    $('guide-mute').textContent = sound && !sessionMuted ? (en?'Mute':'静音') : (en?'Sound on':'开启声音');
    $('guide-mute').setAttribute('aria-pressed',String(!sound || sessionMuted));
    $('guide-read').textContent = en ? 'Play guidance' : '听引导';
    $('guide-direct').textContent = en ? 'Go straight to allocation' : '直接配置';
    $('guide-direct').hidden = task?.kind !== 'evidence';
    $('guide-action').textContent = window.FactorLabGuidance.actionLabel(task,document.documentElement.lang);
    $('guide-voice').value = voice;
    $('guide-audio-enabled').checked = sound;
  }
  function finishOpening() {
    if (!opening) return;
    opening = false;
    write(seenKey,'seen');
    document.body.removeAttribute('data-companion-intro');
    animation?.cancel();
    showTaskText();
    queuePosition();
  }
  async function speak() {
    stopAudio();
    if (!sound || document.hidden || panel.hidden || destroyed) return;
    const token = revision;
    void loadMetadata();
    const key = opening ? 'intro' : task.clip;
    const character = selectedCharacter();
    activeKey = key;
    subtitleIndex = -1;
    subtitle(0);
    $('guide-status').textContent = '';
    $('guide-read').hidden = false;
    const valid = () => token === revision && !panel.hidden && !document.hidden && !destroyed;
    const onTime = () => {
      if (!valid()) return;
      const clip = metadata?.clips[key]?.[character]?.[voice];
      if (clip) subtitle(Math.max(0,clip.segments.findLastIndex(s=>audio.currentTime>=s.start)));
    };
    const onPlaying = () => {
      if (!valid()) return;
      panel.dataset.speaking = 'true';
      $('guide-status').textContent = voice === 'en' ? (character === 'knight' ? 'US English · male voice · bilingual captions' : 'US English · cute female voice · bilingual captions') : (character === 'knight' ? '中文语音 · 男声 · 双语字幕' : '中文语音 · 女声 · 双语字幕');
      $('guide-read').hidden = true;
      document.dispatchEvent(new CustomEvent('factorlab:guide-speaking',{detail:{key,voice,character,at:performance.now()}}));
    };
    const onError = () => {
      if (!valid()) return;
      panel.dataset.speaking = 'false';
      $('guide-read').hidden = false;
      $('guide-status').textContent = document.documentElement.lang==='en'?'Audio unavailable. You can continue with the captions.':'语音暂不可用，可按字幕继续。';
      showTaskText();
    };
    const onEnded = () => {
      if (!valid()) return;
      panel.dataset.speaking = 'false';
      $('guide-read').hidden = false;
      if (opening) finishOpening(); else showTaskText();
    };
    for (const [name,fn] of [['timeupdate',onTime],['playing',onPlaying],['error',onError],['ended',onEnded]]) audio.addEventListener(name,fn);
    playbackCleanup = () => {
      for (const [name,fn] of [['timeupdate',onTime],['playing',onPlaying],['error',onError],['ended',onEnded]]) audio.removeEventListener(name,fn);
    };
    audio.src = new URL(guideContent.clipFile(key,character,voice),mediaBase);
    audio.currentTime = 0;
    const loading = setTimeout(()=>{
      if (valid() && audio.paused) $('guide-status').textContent = document.documentElement.lang==='en'?'Tap Play guidance to hear the introduction.':'点击“听引导”即可播放。';
    },1200);
    const clean = playbackCleanup;
    playbackCleanup = () => {clearTimeout(loading);clean();};
    try { await audio.play(); }
    catch (error) {
      if (!valid()) return;
      $('guide-read').hidden = false;
      $('guide-status').textContent = error.name==='NotAllowedError'
        ? (document.documentElement.lang==='en'?'Tap Play guidance to enable sound.':'点击“听引导”开启声音。')
        : (document.documentElement.lang==='en'?'Audio is unavailable. Captions remain available.':'语音暂不可用，字幕仍可使用。');
      showTaskText();
    }
  }
  function show(introduction = false, speakNow = false) {
    if (!initialized || document.hidden || document.querySelector('dialog[open]')) return;
    stopAudio();
    opening = introduction;
    panel.hidden = false;
    document.body.toggleAttribute('data-companion-intro',introduction);
    labels(); showTaskText(); position();
    if (introduction) {
      performance.mark('factorlab-guide-visible');
      document.dispatchEvent(new CustomEvent('factorlab:guide-visible',{detail:{at:performance.now()}}));
      if (!reduced.matches && $('character-motion').checked && dock.animate) {
        animation?.cancel();
        animation = dock.animate([
          {transform:'translateY(12px) scale(.6,.58)',opacity:.5,offset:0},
          {transform:'translateY(15px) scale(.67,.53)',opacity:1,offset:.15},
          {transform:'translateY(-24px) rotate(-5deg) scale(1.04)',offset:.52},
          {transform:'translateY(3px) rotate(2deg) scale(1.02,.97)',offset:.8},
          {transform:'translateY(0) rotate(0) scale(1)',offset:1}
        ],{duration:650,easing:'cubic-bezier(.22,.75,.3,1)'});
        panel.animate([{opacity:0,transform:'translateY(10px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:220,delay:300,fill:'backwards',easing:'ease-out'});
      }
    }
    if (speakNow && sound && !sessionMuted) void speak();
  }
  function close(muteSession = false) {
    if (!panel) return;
    if (muteSession) sessionMuted = true;
    stopAudio(); finishOpening();
    panel.hidden = true;
    document.body.removeAttribute('data-companion-intro');
    animation?.cancel();
  }
  function sync(snapshot) {
    if (!snapshot?.task || destroyed) return;
    task = snapshot.task;
    if (!initialized) return;
    labels();
    if (!panel.hidden && !opening && activeKey !== task.clip) {stopAudio();showTaskText();queuePosition();}
    const state = window.FactorLabApp.getState();
    const profile = window.FactorLabApp.getUI();
    const nextIdentity = JSON.stringify([profile.profileId,profile.campaignEpoch]);
    if (identity && identity !== nextIdentity) {close();triedOpening=false;lastEventKey='';}
    identity = nextIdentity;
    const newEvent = state.phase==='event' && task.key!==lastEventKey;
    if (newEvent && currentPhase !== undefined) {
      lastEventKey = task.key;
      if (!snapshot.focus) show(false,sound&&!sessionMuted);
    }
    currentPhase = state.phase;
    tryOpening();
  }
  function tryOpening() {
    if (!initialized || triedOpening || !window.FactorLabAccounts?.ready || document.documentElement.hasAttribute('data-auth-pending') || document.hidden) return;
    triedOpening = true;
    const state = window.FactorLabApp.getState();
    if (read(seenKey,'') || state.day>0 || state.seen?.length || state.phase!=='decision') return;
    show(true,true);
  }
  function initialize() {
    if (initialized || !window.FactorLabApp || !$('pet-dock')?.querySelector('.pet-picture') || !window.FactorLabGuidance.getState()) return;
    initialized = true;
    dock = $('pet-dock');
    panel = document.createElement('section');
    panel.id = 'companion-guide'; panel.hidden = true;
    panel.setAttribute('role','region'); panel.setAttribute('aria-labelledby','guide-title');
    panel.innerHTML = '<div class="guide-heading"><strong id="guide-title"></strong><button id="guide-close" class="guide-icon" type="button">×</button></div><div class="guide-captions"><p id="guide-caption-en" lang="en"></p><p id="guide-caption-zh" lang="zh-CN"></p></div><div class="guide-actions"><button id="guide-action" type="button" class="primary" data-guide-action></button><button id="guide-direct" type="button" class="text-button"></button></div><div class="guide-controls"><button id="guide-read" type="button"></button><button id="guide-mute" type="button"></button><select id="guide-voice" aria-label="Voice language 语音语言"><option value="en">English</option><option value="zh">中文</option></select><button id="guide-skip" type="button"></button></div><p id="guide-status" role="status"></p>';
    document.body.append(panel);
    $('guide-close').onclick = () => close(true);
    $('guide-skip').onclick = () => close(true);
    $('guide-action').onclick = () => close();
    $('guide-direct').onclick = () => {close();window.FactorLabGuidance.skip();void window.FactorLabWorkspace.go('portfolio',{focus:true});};
    $('guide-read').onclick = () => {sound=true;sessionMuted=false;write(soundKey,'on');labels();void speak();};
    $('guide-mute').onclick = () => {sound=!(sound&&!sessionMuted);sessionMuted=false;write(soundKey,sound?'on':'off');labels();if(sound)void speak();else{stopAudio();showTaskText();}};
    $('guide-voice').onchange = () => {voice=$('guide-voice').value;write(voiceKey,voice);if(sound&&!sessionMuted)void speak();};
    $('research-pet').addEventListener('change',()=>{if(panel.hidden)return;stopAudio();showTaskText();if(sound&&!sessionMuted)void speak();});
    $('replay-opening').onclick = () => {$('settings-dialog').close();sessionMuted=false;show(true,true);};
    $('guide-audio-enabled').onchange = event => {sound=event.target.checked;write(soundKey,sound?'on':'off');if(!sound)stopAudio();labels();};
    dock.addEventListener('click',()=>{if(dock.dataset.dragging)return;show(false,false);});
    sync(window.FactorLabGuidance.getState());
  }
  document.addEventListener('factorlab:guidance',event=>{initialize();sync(event.detail);});
  document.addEventListener('factorlab:render',()=>{initialize();tryOpening();});
  document.addEventListener('focusin',event=>{if(!panel?.contains(event.target)&&event.target.matches('input,textarea,[contenteditable="true"]'))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)close();else tryOpening();});
  const authObserver = new MutationObserver(()=>{initialize();tryOpening();});
  authObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-auth-pending']});
  const modalObserver = new MutationObserver(()=>{if(document.querySelector('dialog[open]'))close();});
  modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  window.addEventListener('resize',queuePosition);
  window.visualViewport?.addEventListener('resize',queuePosition);
  window.visualViewport?.addEventListener('scroll',queuePosition);
  reduced.addEventListener?.('change',()=>{animation?.cancel();});
  window.addEventListener('pagehide',event=>{
    close();
    if (event.persisted) return;
    destroyed=true;authObserver.disconnect();modalObserver.disconnect();cancelAnimationFrame(positionFrame);
    window.removeEventListener('resize',queuePosition);
    window.visualViewport?.removeEventListener('resize',queuePosition);
    window.visualViewport?.removeEventListener('scroll',queuePosition);
  });
  window.FactorLabCompanionGuide = {replay:()=>show(true,true),close:()=>close(true),dismiss:()=>close(),getState:()=>({opening,voice,character:selectedCharacter(),sound,sessionMuted,activeKey,visible:!!panel&&!panel.hidden,audioSource:audio.currentSrc||audio.src,audioTime:audio.currentTime,audioDuration:audio.duration,audioPaused:audio.paused})};
  initialize();
})();
