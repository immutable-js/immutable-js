(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[479],{745:(e,t,s)=>{"use strict";var i=s(4089);s(8691);var n=s(1521),r=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(n),o=void 0!==i&&i.env&&!0,c=function(e){return"[object String]"===Object.prototype.toString.call(e)},d=function(){function e(e){var t=void 0===e?{}:e,s=t.name,i=void 0===s?"stylesheet":s,n=t.optimizeForSpeed,r=void 0===n?o:n;a(c(i),"`name` must be a string"),this._name=i,this._deletedRulePlaceholder="#"+i+"-deleted-rule____{}",a("boolean"==typeof r,"`optimizeForSpeed` must be a boolean"),this._optimizeForSpeed=r,this._serverSheet=void 0,this._tags=[],this._injected=!1,this._rulesCount=0;var d="undefined"!=typeof window&&document.querySelector('meta[property="csp-nonce"]');this._nonce=d?d.getAttribute("content"):null}var t=e.prototype;return t.setOptimizeForSpeed=function(e){a("boolean"==typeof e,"`setOptimizeForSpeed` accepts a boolean"),a(0===this._rulesCount,"optimizeForSpeed cannot be when rules have already been inserted"),this.flush(),this._optimizeForSpeed=e,this.inject()},t.isOptimizeForSpeed=function(){return this._optimizeForSpeed},t.inject=function(){var e=this;if(a(!this._injected,"sheet already injected"),this._injected=!0,"undefined"!=typeof window&&this._optimizeForSpeed){this._tags[0]=this.makeStyleTag(this._name),this._optimizeForSpeed="insertRule"in this.getSheet(),this._optimizeForSpeed||(o||console.warn("StyleSheet: optimizeForSpeed mode not supported falling back to standard mode."),this.flush(),this._injected=!0);return}this._serverSheet={cssRules:[],insertRule:function(t,s){return"number"==typeof s?e._serverSheet.cssRules[s]={cssText:t}:e._serverSheet.cssRules.push({cssText:t}),s},deleteRule:function(t){e._serverSheet.cssRules[t]=null}}},t.getSheetForTag=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]},t.getSheet=function(){return this.getSheetForTag(this._tags[this._tags.length-1])},t.insertRule=function(e,t){if(a(c(e),"`insertRule` accepts only strings"),"undefined"==typeof window)return"number"!=typeof t&&(t=this._serverSheet.cssRules.length),this._serverSheet.insertRule(e,t),this._rulesCount++;if(this._optimizeForSpeed){var s=this.getSheet();"number"!=typeof t&&(t=s.cssRules.length);try{s.insertRule(e,t)}catch(t){return o||console.warn("StyleSheet: illegal rule: \n\n"+e+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),-1}}else{var i=this._tags[t];this._tags.push(this.makeStyleTag(this._name,e,i))}return this._rulesCount++},t.replaceRule=function(e,t){if(this._optimizeForSpeed||"undefined"==typeof window){var s="undefined"!=typeof window?this.getSheet():this._serverSheet;if(t.trim()||(t=this._deletedRulePlaceholder),!s.cssRules[e])return e;s.deleteRule(e);try{s.insertRule(t,e)}catch(i){o||console.warn("StyleSheet: illegal rule: \n\n"+t+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),s.insertRule(this._deletedRulePlaceholder,e)}}else{var i=this._tags[e];a(i,"old rule at index `"+e+"` not found"),i.textContent=t}return e},t.deleteRule=function(e){if("undefined"==typeof window){this._serverSheet.deleteRule(e);return}if(this._optimizeForSpeed)this.replaceRule(e,"");else{var t=this._tags[e];a(t,"rule at index `"+e+"` not found"),t.parentNode.removeChild(t),this._tags[e]=null}},t.flush=function(){this._injected=!1,this._rulesCount=0,"undefined"!=typeof window?(this._tags.forEach(function(e){return e&&e.parentNode.removeChild(e)}),this._tags=[]):this._serverSheet.cssRules=[]},t.cssRules=function(){var e=this;return"undefined"==typeof window?this._serverSheet.cssRules:this._tags.reduce(function(t,s){return s?t=t.concat(Array.prototype.map.call(e.getSheetForTag(s).cssRules,function(t){return t.cssText===e._deletedRulePlaceholder?null:t})):t.push(null),t},[])},t.makeStyleTag=function(e,t,s){t&&a(c(t),"makeStyleTag accepts only strings as second parameter");var i=document.createElement("style");this._nonce&&i.setAttribute("nonce",this._nonce),i.type="text/css",i.setAttribute("data-"+e,""),t&&i.appendChild(document.createTextNode(t));var n=document.head||document.getElementsByTagName("head")[0];return s?n.insertBefore(i,s):n.appendChild(i),i},function(e,t){for(var s=0;s<t.length;s++){var i=t[s];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}(e.prototype,[{key:"length",get:function(){return this._rulesCount}}]),e}();function a(e,t){if(!e)throw Error("StyleSheet: "+t+".")}var l=function(e){for(var t=5381,s=e.length;s;)t=33*t^e.charCodeAt(--s);return t>>>0},u={};function h(e,t){if(!t)return"jsx-"+e;var s=String(t),i=e+s;return u[i]||(u[i]="jsx-"+l(e+"-"+s)),u[i]}function p(e,t){"undefined"==typeof window&&(t=t.replace(/\/style/gi,"\\/style"));var s=e+t;return u[s]||(u[s]=t.replace(/__jsx-style-dynamic-selector/g,e)),u[s]}var x=function(){function e(e){var t=void 0===e?{}:e,s=t.styleSheet,i=void 0===s?null:s,n=t.optimizeForSpeed,r=void 0!==n&&n;this._sheet=i||new d({name:"styled-jsx",optimizeForSpeed:r}),this._sheet.inject(),i&&"boolean"==typeof r&&(this._sheet.setOptimizeForSpeed(r),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),this._fromServer=void 0,this._indices={},this._instancesCounts={}}var t=e.prototype;return t.add=function(e){var t=this;void 0===this._optimizeForSpeed&&(this._optimizeForSpeed=Array.isArray(e.children),this._sheet.setOptimizeForSpeed(this._optimizeForSpeed),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),"undefined"==typeof window||this._fromServer||(this._fromServer=this.selectFromServer(),this._instancesCounts=Object.keys(this._fromServer).reduce(function(e,t){return e[t]=0,e},{}));var s=this.getIdAndRules(e),i=s.styleId,n=s.rules;if(i in this._instancesCounts){this._instancesCounts[i]+=1;return}var r=n.map(function(e){return t._sheet.insertRule(e)}).filter(function(e){return -1!==e});this._indices[i]=r,this._instancesCounts[i]=1},t.remove=function(e){var t=this,s=this.getIdAndRules(e).styleId;if(function(e,t){if(!e)throw Error("StyleSheetRegistry: "+t+".")}(s in this._instancesCounts,"styleId: `"+s+"` not found"),this._instancesCounts[s]-=1,this._instancesCounts[s]<1){var i=this._fromServer&&this._fromServer[s];i?(i.parentNode.removeChild(i),delete this._fromServer[s]):(this._indices[s].forEach(function(e){return t._sheet.deleteRule(e)}),delete this._indices[s]),delete this._instancesCounts[s]}},t.update=function(e,t){this.add(t),this.remove(e)},t.flush=function(){this._sheet.flush(),this._sheet.inject(),this._fromServer=void 0,this._indices={},this._instancesCounts={}},t.cssRules=function(){var e=this,t=this._fromServer?Object.keys(this._fromServer).map(function(t){return[t,e._fromServer[t]]}):[],s=this._sheet.cssRules();return t.concat(Object.keys(this._indices).map(function(t){return[t,e._indices[t].map(function(e){return s[e].cssText}).join(e._optimizeForSpeed?"":"\n")]}).filter(function(e){return!!e[1]}))},t.styles=function(e){var t,s;return t=this.cssRules(),void 0===(s=e)&&(s={}),t.map(function(e){var t=e[0],i=e[1];return r.default.createElement("style",{id:"__"+t,key:"__"+t,nonce:s.nonce?s.nonce:void 0,dangerouslySetInnerHTML:{__html:i}})})},t.getIdAndRules=function(e){var t=e.children,s=e.dynamic,i=e.id;if(s){var n=h(i,s);return{styleId:n,rules:Array.isArray(t)?t.map(function(e){return p(n,e)}):[p(n,t)]}}return{styleId:h(i),rules:Array.isArray(t)?t:[t]}},t.selectFromServer=function(){return Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]')).reduce(function(e,t){return e[t.id.slice(2)]=t,e},{})},e}(),m=n.createContext(null);m.displayName="StyleSheetContext";var j=r.default.useInsertionEffect||r.default.useLayoutEffect,g="undefined"!=typeof window?new x:void 0;function f(e){var t=g||n.useContext(m);return t&&("undefined"==typeof window?t.add(e):j(function(){return t.add(e),function(){t.remove(e)}},[e.id,String(e.dynamic)])),null}f.dynamic=function(e){return e.map(function(e){return h(e[0],e[1])}).join(" ")},t.style=f},1130:(e,t,s)=>{"use strict";e.exports=s(745).style},4366:(e,t,s)=>{"use strict";let i;s.d(t,{ImmutableConsole:()=>r});var n=s(1521);function r(e){let{version:t}=e;return(0,n.useEffect)(()=>{let e=s.g;if(i!==t){var n,r;i=t,(n=e,r=function(e){if("latest@main"===e)return"https://cdn.jsdelivr.net/gh/immutable-js/immutable-js@npm/dist/immutable.js";let t="v"===e[0]?e.slice(1):e;return"https://cdn.jsdelivr.net/npm/immutable@".concat(t,"/dist/immutable.js")}(t),new Promise(e=>{var t;let s=n.module={exports:n.exports={}},i=document.createElement("script"),o=document.getElementsByTagName("script")[0];i.src=r,i.addEventListener("load",()=>{n.module=void 0,n.exports=void 0,i.remove(),e(s.exports)},!1),null==o||null===(t=o.parentNode)||void 0===t||t.insertBefore(i,o)})).then(s=>{e.Immutable=s,console.log("\n   ▄▟████▙▄       _   __    __ __    __ _    _ _______       ____  _     _____ \n ▟██████████▙    | | |  \\  /  |  \\  /  | |  | |__   __|/\\   |  _ \\| |   |  ___|\n██████████████   | | |   \\/   |   \\/   | |  | |  | |  /  \\  | |_) | |   | |__   \n██████████████   | | | |\\  /| | |\\  /| | |  | |  | | / /\\ \\ |  _ <| |   |  __|  \n ▜██████████▛    | | | | \\/ | | | \\/ | | |__| |  | |/ ____ \\| |_) | |___| |___ \n   ▀▜████▛▀      |_| |_|    |_|_|    |_|\\____/   |_/_/    \\_\\____/|_____|_____|\n\n"+"Version: ".concat(t,"\n")+"> console.log(Immutable);"),console.log(s)})}},[t]),null}},7776:(e,t,s)=>{"use strict";let i;s.d(t,{Header:()=>p,HeaderLinks:()=>m,HeaderLogoLink:()=>x});var n=s(3365),r=s(1130),o=s.n(r),c=s(1521),d=s(9534),a=s.n(d);function l(e){let{style:t,children:s}=e;return(0,n.jsx)("svg",{className:"svg",style:t,viewBox:"0 0 300 42.2",children:s})}function u(e){let{opacity:t=1,inline:s,color:i}=e;return s?(0,n.jsxs)("g",{fill:i,style:{opacity:t},children:[(0,n.jsx)("path",{d:"M0,0l13.9,0v41.1H0L0,0z M7.8,36.2V4.9H6.2v31.3H7.8z"}),(0,n.jsx)("path",{d:"M18.2,0L29,0l10.7,15.8L50.4,0l10.9,0v41.1H48.1V26.3l-8.4,12.3l-8.4-12.3v14.8H18.2V0z M25.9,36.2V7.9 L39.7,28L53.5,7.9v28.3h1.6V4.9h-1.6L39.7,25.2L25.9,4.9h-1.6v31.3H25.9z"}),(0,n.jsx)("path",{d:"M65.5,0l10.9,0L87,15.8L97.7,0l10.9,0v41.1H95.4V26.3L87,38.7l-8.4-12.3v14.8H65.5V0z M73.2,36.2V7.9 L87,28l13.7-20.1v28.3h1.6V4.9h-1.6L87,25.2L73.2,4.9h-1.6v31.3H73.2z"}),(0,n.jsx)("path",{d:"M128.6,42.2c-2.6,0-4.9-0.3-7-1c-2.1-0.7-3.9-1.6-5.4-3c-1.5-1.3-2.6-3-3.4-5c-0.8-2-1.2-4.4-1.2-7.1V0 l13.1,0v25.6c0,1.4,0.3,2.5,0.9,3.3c0.6,0.8,1.6,1.1,3,1.1c1.4,0,2.4-0.4,3-1.1c0.6-0.8,0.9-1.9,0.9-3.3V0l13.2,0v26.1 c0,2.7-0.4,5.1-1.2,7.1c-0.8,2-2,3.7-3.5,5c-1.5,1.3-3.3,2.3-5.4,3C133.5,41.8,131.2,42.2,128.6,42.2z M128.6,34.8 c-6.2,0-9.2-3-9.2-9.1V4.9h-1.6v20.8c0,3.5,0.9,6.1,2.8,7.9c1.9,1.8,4.6,2.7,8,2.7c3.5,0,6.2-0.9,8.1-2.7c1.9-1.8,2.8-4.5,2.8-7.9 V4.9h-1.7v20.8C137.8,31.7,134.8,34.8,128.6,34.8z"}),(0,n.jsx)("path",{d:"M155.4,10.8h-7.6V0l28.7,0v10.8h-7.6v30.3h-13.6V10.8z M163,36.2V6.4h8.8V4.9h-19.2v1.5h8.8v29.8H163z"}),(0,n.jsx)("path",{d:"M186.4,0l9.9,0l15.6,41.1h-12.9l-1.4-3.7h-12.5l-1.4,3.7h-12.9L186.4,0z M180,36.2l1.2-3.1h20.3l1.2,3.1 h1.7L192.5,4.9h-2.3l-11.9,31.3H180z M191.3,6.4l9.6,25.2h-19.2L191.3,6.4z M194.1,28.4l-2.8-7.2l-2.8,7.2H194.1z"}),(0,n.jsx)("path",{d:"M212.9,0L229,0c2.1,0,3.9,0.2,5.6,0.7c1.7,0.5,3.2,1.2,4.4,2.1s2.2,2.1,2.8,3.5c0.7,1.4,1,3,1,4.8 c0,1.3-0.2,2.4-0.5,3.4c-0.3,0.9-0.7,1.7-1,2.3c-0.5,0.7-1,1.4-1.5,1.8c0.9,0.6,1.7,1.3,2.5,2.2c0.6,0.8,1.2,1.8,1.7,3 c0.5,1.2,0.8,2.7,0.8,4.4c0,2-0.3,3.8-1,5.4c-0.7,1.6-1.7,3-3,4.1c-1.3,1.1-2.9,2-4.7,2.6c-1.9,0.6-4,0.9-6.3,0.9h-16.8V0z M228,36.2c3.6,0,6.3-0.8,8-2.3c1.7-1.6,2.6-3.6,2.6-6.2c0-1.7-0.4-3-1.1-4c-0.7-1-1.5-1.8-2.3-2.4c-1-0.7-2.2-1.1-3.4-1.4 c1-0.3,1.9-0.7,2.7-1.4c0.7-0.5,1.3-1.3,1.9-2.2s0.8-2.1,0.8-3.5c0-2.6-0.8-4.5-2.5-5.9c-1.6-1.3-3.9-2-6.7-2h-8.9v31.3H228z M220.7,19.1V6.4l7.3,0c2.7,0,4.6,0.6,5.8,1.8c1.2,1.2,1.8,2.7,1.8,4.6c0,1.9-0.6,3.4-1.8,4.6c-1.2,1.2-3.1,1.8-5.8,1.8H220.7z M220.7,34.7V20.6h7.2c1.3,0,2.5,0.1,3.5,0.4c1.1,0.3,2,0.7,2.9,1.2c0.8,0.6,1.5,1.3,1.9,2.2c0.5,0.9,0.7,2,0.7,3.2 c0,2.5-0.8,4.3-2.5,5.4c-1.7,1.1-3.9,1.7-6.6,1.7H220.7z M230.2,12.5c0-1.9-1-2.8-3.1-2.8h-1.5v5.7h1.5 C229.2,15.4,230.2,14.4,230.2,12.5z M227.1,31.4c3.1,0,4.7-1.2,4.7-3.6c0-2.4-1.6-3.6-4.7-3.6h-1.5v7.2H227.1z"}),(0,n.jsx)("path",{d:"M248.3,0L262,0v30.3h11.3v10.8h-25V0z M269.9,36.2v-1.5h-13.8V4.9h-1.6v31.3H269.9z"}),(0,n.jsx)("path",{d:"M275.3,0l24.2,0v10.8h-11.1v4.6h10.9v10.2h-10.9v4.7H300v10.8h-24.7V0z M295.4,36.2v-1.5h-12.3V21.2h11.7 v-1.5h-11.7V6.4h12.3V4.9h-13.9v31.3H295.4z"})]}):(0,n.jsxs)("g",{fill:i,style:{opacity:t},children:[(0,n.jsx)("path",{d:"M0,0l13.9,0v41.1H0L0,0z"}),(0,n.jsx)("path",{d:"M18.2,0L29,0l10.7,15.8L50.4,0l10.9,0v41.1H48.1V26.3l-8.4,12.3l-8.4-12.3v14.8H18.2V0z"}),(0,n.jsx)("path",{d:"M65.5,0l10.9,0L87,15.8L97.7,0l10.9,0v41.1H95.4V26.3L87,38.7l-8.4-12.3v14.8H65.5V0z"}),(0,n.jsx)("path",{d:"M128.6,42.2c-2.6,0-4.9-0.3-7-1c-2.1-0.7-3.9-1.6-5.4-3c-1.5-1.3-2.6-3-3.4-5c-0.8-2-1.2-4.4-1.2-7.1V0 l13.1,0v25.6c0,1.4,0.3,2.5,0.9,3.3c0.6,0.8,1.6,1.1,3,1.1c1.4,0,2.4-0.4,3-1.1c0.6-0.8,0.9-1.9,0.9-3.3V0l13.2,0v26.1 c0,2.7-0.4,5.1-1.2,7.1c-0.8,2-2,3.7-3.5,5c-1.5,1.3-3.3,2.3-5.4,3C133.5,41.8,131.2,42.2,128.6,42.2z"}),(0,n.jsx)("path",{d:"M155.4,10.8h-7.6V0l28.7,0v10.8h-7.6v30.3h-13.6V10.8z"}),(0,n.jsx)("path",{d:"M186.4,0l9.9,0l15.6,41.1h-12.9l-1.4-3.7h-12.5l-1.4,3.7h-12.9L186.4,0z M194.1,28.4l-2.8-7.2l-2.8,7.2 H194.1z"}),(0,n.jsx)("path",{d:"M212.9,0L229,0c2.1,0,3.9,0.2,5.6,0.7c1.7,0.5,3.2,1.2,4.4,2.1s2.2,2.1,2.8,3.5c0.7,1.4,1,3,1,4.8 c0,1.3-0.2,2.4-0.5,3.4c-0.3,0.9-0.7,1.7-1,2.3c-0.5,0.7-1,1.4-1.5,1.8c0.9,0.6,1.7,1.3,2.5,2.2c0.6,0.8,1.2,1.8,1.7,3 c0.5,1.2,0.8,2.7,0.8,4.4c0,2-0.3,3.8-1,5.4c-0.7,1.6-1.7,3-3,4.1c-1.3,1.1-2.9,2-4.7,2.6c-1.9,0.6-4,0.9-6.3,0.9h-16.8V0z M230.2,12.5c0-1.9-1-2.8-3.1-2.8h-1.5v5.7h1.5C229.2,15.4,230.2,14.4,230.2,12.5z M227.1,31.4c3.1,0,4.7-1.2,4.7-3.6 c0-2.4-1.6-3.6-4.7-3.6h-1.5v7.2H227.1z"}),(0,n.jsx)("path",{d:"M248.3,0L262,0v30.3h11.3v10.8h-25V0z"}),(0,n.jsx)("path",{d:"M275.3,0l24.2,0v10.8h-11.1v4.6h10.9v10.2h-10.9v4.7H300v10.8h-24.7V0z"})]})}function h(){let[e,t]=(0,c.useState)(null);return(0,c.useEffect)(()=>{(function(e,t){let s=new XMLHttpRequest;s.onload=e=>{let s;if(!e.target||!("responseText"in e.target)||"string"!=typeof e.target.responseText)return null;try{s=JSON.parse(e.target.responseText)}catch(e){}t(s)},s.open("get",e,!0),s.send()})("https://api.github.com/repos/immutable-js/immutable-js",e=>{"object"==typeof e&&null!==e&&"stargazers_count"in e&&"number"==typeof e.stargazers_count&&t(e.stargazers_count)})},[]),(0,n.jsxs)("span",{className:"jsx-125d8cc3658d3131 github-btn",children:[(0,n.jsx)(o(),{id:"125d8cc3658d3131",children:'.github-btn.jsx-125d8cc3658d3131{margin-top:-10%;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-moz-box-orient:horizontal;-moz-box-direction:normal;-ms-flex-direction:row;flex-direction:row}.gh-ico.jsx-125d8cc3658d3131{float:left}.gh-btn.jsx-125d8cc3658d3131,.gh-count.jsx-125d8cc3658d3131{border:1px solid#bababa;border-bottom-color:#a6a6a6;-webkit-border-radius:6px;-moz-border-radius:6px;border-radius:6px;color:#212121;cursor:pointer;font-size:24px;font-weight:300;line-height:32px;padding:6px 14px 6px 12px;text-decoration:none;text-shadow:0 1px 0#fff;white-space:nowrap}.gh-btn.jsx-125d8cc3658d3131{background-color:#fafafa;background:-webkit-linear-gradient(#fafafa,#eaeaea);background:-moz-linear-gradient(#fafafa,#eaeaea);background:-o-linear-gradient(#fafafa,#eaeaea);background:linear-gradient(#fafafa,#eaeaea)}.gh-btn.jsx-125d8cc3658d3131:hover,.gh-btn.jsx-125d8cc3658d3131:focus,.gh-btn.jsx-125d8cc3658d3131:active{background-color:#3072b3;border-color:#518cc6#518cc6#2a65a0;color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,.25)}.gh-btn.jsx-125d8cc3658d3131:hover,.gh-btn.jsx-125d8cc3658d3131:focus{background-color:#599bdc;background:-webkit-linear-gradient(#599bdc,#3072b3);background:-moz-linear-gradient(#599bdc,#3072b3);background:-o-linear-gradient(#599bdc,#3072b3);background:linear-gradient(#599bdc,#3072b3)}.gh-btn.jsx-125d8cc3658d3131:active{background-image:none;-webkit-box-shadow:inset 0 2px 5px rgba(0,0,0,.1);-moz-box-shadow:inset 0 2px 5px rgba(0,0,0,.1);box-shadow:inset 0 2px 5px rgba(0,0,0,.1)}.gh-ico.jsx-125d8cc3658d3131{background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNy4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTMycHgiIGhlaWdodD0iNjZweCIgdmlld0JveD0iMCAwIDEzMiA2NiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTMyIDY2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjMzMzMzMzIiBkPSJNMzMsMS44Yy0xNy43LDAtMzIsMTQuMy0zMiwzMmMwLDE0LjEsOS4yLDI2LjEsMjEuOSwzMC40DQoJYzEuNiwwLjMsMi4yLTAuNywyLjItMS41YzAtMC44LDAtMi44LDAtNS40Yy04LjksMS45LTEwLjgtNC4zLTEwLjgtNC4zYy0xLjUtMy43LTMuNi00LjctMy42LTQuN2MtMi45LTIsMC4yLTEuOSwwLjItMS45DQoJYzMuMiwwLjIsNC45LDMuMyw0LjksMy4zYzIuOSw0LjksNy41LDMuNSw5LjMsMi43YzAuMy0yLjEsMS4xLTMuNSwyLTQuM2MtNy4xLTAuOC0xNC42LTMuNi0xNC42LTE1LjhjMC0zLjUsMS4yLTYuMywzLjMtOC42DQoJYy0wLjMtMC44LTEuNC00LjEsMC4zLTguNWMwLDAsMi43LTAuOSw4LjgsMy4zYzIuNi0wLjcsNS4zLTEuMSw4LTEuMWMyLjcsMCw1LjUsMC40LDgsMS4xYzYuMS00LjEsOC44LTMuMyw4LjgtMy4zDQoJYzEuNyw0LjQsMC42LDcuNywwLjMsOC41YzIuMSwyLjIsMy4zLDUuMSwzLjMsOC42YzAsMTIuMy03LjUsMTUtMTQuNiwxNS44YzEuMSwxLDIuMiwyLjksMi4yLDUuOWMwLDQuMywwLDcuNywwLDguOA0KCWMwLDAuOSwwLjYsMS45LDIuMiwxLjVDNTUuOCw1OS45LDY1LDQ3LjksNjUsMzMuOEM2NSwxNi4xLDUwLjcsMS44LDMzLDEuOHoiLz4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjRkZGRkZGIiBkPSJNOTksMS44Yy0xNy43LDAtMzIsMTQuMy0zMiwzMmMwLDE0LjEsOS4yLDI2LjEsMjEuOSwzMC40DQoJYzEuNiwwLjMsMi4yLTAuNywyLjItMS41YzAtMC44LDAtMi44LDAtNS40Yy04LjksMS45LTEwLjgtNC4zLTEwLjgtNC4zYy0xLjUtMy43LTMuNi00LjctMy42LTQuN2MtMi45LTIsMC4yLTEuOSwwLjItMS45DQoJYzMuMiwwLjIsNC45LDMuMyw0LjksMy4zYzIuOSw0LjksNy41LDMuNSw5LjMsMi43YzAuMy0yLjEsMS4xLTMuNSwyLTQuM2MtNy4xLTAuOC0xNC42LTMuNi0xNC42LTE1LjhjMC0zLjUsMS4yLTYuMywzLjMtOC42DQoJYy0wLjMtMC44LTEuNC00LjEsMC4zLTguNWMwLDAsMi43LTAuOSw4LjgsMy4zYzIuNi0wLjcsNS4zLTEuMSw4LTEuMWMyLjcsMCw1LjUsMC40LDgsMS4xYzYuMS00LjEsOC44LTMuMyw4LjgtMy4zDQoJYzEuNyw0LjQsMC42LDcuNywwLjMsOC41YzIuMSwyLjIsMy4zLDUuMSwzLjMsOC42YzAsMTIuMy03LjUsMTUtMTQuNiwxNS44YzEuMSwxLDIuMiwyLjksMi4yLDUuOWMwLDQuMywwLDcuNywwLDguOA0KCWMwLDAuOSwwLjYsMS45LDIuMiwxLjVjMTIuNy00LjIsMjEuOS0xNi4yLDIxLjktMzAuNEMxMzEsMTYuMSwxMTYuNywxLjgsOTksMS44eiIvPg0KPC9zdmc+DQo=);background-position:0 0;background-repeat:no-repeat;-webkit-background-size:56px 28px;-moz-background-size:56px 28px;-o-background-size:56px 28px;background-size:56px 28px;height:28px;margin:2px 6px 0 0;width:28px}.gh-btn.jsx-125d8cc3658d3131:hover .gh-ico.jsx-125d8cc3658d3131,.gh-btn.jsx-125d8cc3658d3131:focus .gh-ico.jsx-125d8cc3658d3131,.gh-btn.jsx-125d8cc3658d3131:active .gh-ico.jsx-125d8cc3658d3131{background-position:-28px 0}.gh-count.jsx-125d8cc3658d3131{background-color:#fafafa;display:block!important;display:none}.gh-count.jsx-125d8cc3658d3131:hover,.gh-count.jsx-125d8cc3658d3131:focus{color:#4183c4}.gh-triangle.jsx-125d8cc3658d3131{position:relative;margin-left:11px;margin-right:-1px}.gh-triangle.jsx-125d8cc3658d3131:before,.gh-triangle.jsx-125d8cc3658d3131:after{border-color:transparent;border-style:solid;content:"";position:absolute}.gh-triangle.jsx-125d8cc3658d3131:before{border-right-color:#fafafa;border-width:8px 8px 8px 0;left:-7px;margin-top:-8px;top:50%}.gh-triangle.jsx-125d8cc3658d3131:after{border-right-color:#bababa;border-width:9px 9px 9px 0;left:-8px;margin-top:-9px;top:50%;z-index:-1}@media only screen and (max-width:680px){.gh-btn.jsx-125d8cc3658d3131,.gh-count.jsx-125d8cc3658d3131{font-size:16px;line-height:21px;padding:4px 12px 4px 10px}.gh-ico.jsx-125d8cc3658d3131{-webkit-background-size:36px 18px;-moz-background-size:36px 18px;-o-background-size:36px 18px;background-size:36px 18px;height:18px;margin:1px 4px 0 0;width:18px}.gh-btn.jsx-125d8cc3658d3131:hover .gh-ico.jsx-125d8cc3658d3131,.gh-btn.jsx-125d8cc3658d3131:focus .gh-ico.jsx-125d8cc3658d3131,.gh-btn.jsx-125d8cc3658d3131:active .gh-ico.jsx-125d8cc3658d3131{background-position:-18px 0}}'}),(0,n.jsxs)("a",{id:"gh-btn",href:"https://github.com/immutable-js/immutable-js/",className:"jsx-125d8cc3658d3131 gh-btn",children:[(0,n.jsx)("span",{className:"jsx-125d8cc3658d3131 gh-ico"}),(0,n.jsx)("span",{className:"jsx-125d8cc3658d3131 gh-text",children:"Star"})]}),e&&(0,n.jsx)("span",{className:"jsx-125d8cc3658d3131 gh-triangle"}),e&&(0,n.jsx)("a",{href:"https://github.com/immutable-js/immutable-js/stargazers",className:"jsx-125d8cc3658d3131 gh-count",children:e})]})}function p(e){let{versions:t,currentVersion:s}=e,[r,o]=(0,c.useState)(0);(0,c.useEffect)(()=>{let e=!1;function t(){if(!e){let t=Math.min(800,Math.max(260,.7*document.documentElement.clientHeight));window.scrollY<t&&(e=!0,window.requestAnimationFrame(()=>{e=!1,o(window.scrollY)}))}}return window.addEventListener("scroll",t),()=>{window.removeEventListener("scroll",t)}},[]);let d=r<0?0:r,a=!function(){if(void 0===i){let e=window.matchMedia&&window.matchMedia("(max-device-width: 680px)");i=e&&e.matches}return i}()?70:35;return(0,n.jsxs)("div",{className:"header",children:[(0,n.jsx)("div",{className:"miniHeader",children:(0,n.jsxs)("div",{className:"miniHeaderContents",children:[(0,n.jsx)(x,{}),(0,n.jsx)(m,{versions:t,currentVersion:s})]})}),(0,n.jsx)("div",{className:"coverContainer",children:(0,n.jsx)("div",{className:"cover",children:(0,n.jsxs)("div",{className:"coverFixed",children:[(0,n.jsx)("div",{className:"filler",children:(0,n.jsx)("div",{className:"miniHeaderContents",children:(0,n.jsx)(m,{versions:t,currentVersion:s})})}),(0,n.jsx)("div",{className:"synopsis",children:(0,n.jsxs)("div",{className:"logo",children:[[0,0,0,0,0,0,0,0,0,0,0,0].map((e,t)=>{var s,i,r,o,c,h;return(0,n.jsxs)(l,{style:g((s=d,-(((i=t*a)<s?i:s)*.55)),Math.max(0,(r=d)>(o=t*a)?1-(r-o)/2e4:1)),children:[(0,n.jsx)(u,{color:"#c1c6c8"}),(0,n.jsx)(u,{color:"#6dbcdb",opacity:Math.max(0,(c=d)>(h=t*a)?1-(c-h)/350:1)})]},t)}),(0,n.jsxs)(l,{style:g(-.55*d,1),children:[(0,n.jsx)(u,{color:"#FC4349"}),(0,n.jsx)(u,{color:"#2C3E50",inline:!0})]})]})}),(0,n.jsx)("div",{className:"buttons",children:(0,n.jsx)(h,{})})]})})})]})}function x(){return(0,n.jsx)(a(),{href:"/",className:"miniLogo",children:(0,n.jsxs)(l,{children:[(0,n.jsx)(u,{color:"#FC4349"}),(0,n.jsx)(u,{color:"#2C3E50",inline:!0})]})})}function m(e){let{versions:t,currentVersion:s}=e;return(0,n.jsxs)("div",{className:"links",children:[(0,n.jsx)(j,{versions:t,currentVersion:s}),(0,n.jsx)(a(),{href:"/play",children:"Playground"}),(0,n.jsx)("a",{href:"https://stackoverflow.com/questions/tagged/immutable.js?sort=votes",target:"_blank",rel:"noopener",children:"Questions"}),(0,n.jsx)("a",{href:"https://github.com/immutable-js/immutable-js/",target:"_blank",rel:"noopener",children:"GitHub"})]})}function j(e){let{versions:t,currentVersion:s}=e;return(0,n.jsxs)("div",{className:"jsx-92e40c68c38a875d docsDropdown",children:[(0,n.jsx)(o(),{id:"92e40c68c38a875d",children:".docsDropdown.jsx-92e40c68c38a875d{display:inline-block;position:relative}.docsDropdown.jsx-92e40c68c38a875d>ul.jsx-92e40c68c38a875d{position:absolute;visibility:hidden;width:-webkit-max-content;width:-moz-max-content;width:max-content;top:100%;right:-.75rem;background:var(--header-bg-color);margin:0;padding:.25rem 0 .5rem;-webkit-box-shadow:0 2px 2px -1px rgba(0,0,0,.25);-moz-box-shadow:0 2px 2px -1px rgba(0,0,0,.25);box-shadow:0 2px 2px -1px rgba(0,0,0,.25)}.docsDropdown.jsx-92e40c68c38a875d:hover>ul.jsx-92e40c68c38a875d{visibility:visible}.docsDropdown.jsx-92e40c68c38a875d:hover>ul.jsx-92e40c68c38a875d>li.jsx-92e40c68c38a875d{display:block;padding:.25rem 1rem;text-align:left}"}),(0,n.jsx)("div",{className:"jsx-92e40c68c38a875d",children:(0,n.jsxs)(a(),{href:"/docs/".concat(s||t[0]),children:["Docs",s&&" (".concat(s,")")]})}),(0,n.jsx)("ul",{className:"jsx-92e40c68c38a875d",children:t.map(e=>(0,n.jsx)("li",{className:"jsx-92e40c68c38a875d",children:(0,n.jsx)(a(),{href:"/docs/".concat(e),children:e})},e))})]})}function g(e,t){return{transform:"translate3d(0, "+e+"px, 0) scale("+t+")"}}},8691:()=>{}}]);