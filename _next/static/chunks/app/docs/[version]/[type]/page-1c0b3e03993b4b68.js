(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[609],{8035:function(e,n,s){Promise.resolve().then(s.bind(s,6556))},6665:function(e,n,s){"use strict";var r=s(319);s.o(r,"useRouter")&&s.d(n,{useRouter:function(){return r.useRouter}})},7065:function(e,n,s){"use strict";s.r(n),s.d(n,{DocSearch:function(){return a}});var r=s(984),t=s(208);function a(){let[e,n]=(0,t.useState)(null);return((0,t.useEffect)(()=>{var e,s;let r=document.createElement("script"),t=document.getElementsByTagName("script")[0];r.src="https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.js",r.addEventListener("load",()=>{window.docsearch?(window.docsearch({apiKey:"83f61f865ef4cb682e0432410c2f7809",indexName:"immutable_js",inputSelector:"#algolia-docsearch"}),n(!0)):n(!1)},!1),null==t||null===(e=t.parentNode)||void 0===e||e.insertBefore(r,t);let a=document.createElement("link"),i=document.getElementsByTagName("link")[0];a.rel="stylesheet",a.href="https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.css",null==i||null===(s=i.parentNode)||void 0===s||s.insertBefore(a,i)},[]),!1===e)?null:(0,r.jsx)("input",{id:"algolia-docsearch",className:"docSearch",type:"search",placeholder:"Search Immutable.js Documentation",disabled:!e})}},4303:function(e,n,s){"use strict";s.r(n),s.d(n,{MarkdownContent:function(){return i}});var r=s(984),t=s(208),a=s(6665);let i=(0,t.memo)(function(e){let{contents:n,className:s}=e,t=(0,a.useRouter)();return(0,r.jsx)("div",{className:"markdown "+(s||""),onClick:e=>{let n=e.target;"A"===n.tagName&&"_blank"!==n.target&&(e.preventDefault(),t.push(n.href))},dangerouslySetInnerHTML:{__html:n}})})},9698:function(e,n,s){"use strict";s.r(n),s.d(n,{SideBar:function(){return o}});var r=s(984),t=s(346),a=s(208),i=s(4237);function c(e){let{isActive:n}=e;return(0,r.jsx)("svg",{viewBox:"0 0 926.23699 573.74994",version:"1.1",x:"0px",y:"0px",width:"10",height:"10",className:"sideBar__Arrow ".concat(n?"sideBar__Arrow--active":""),children:(0,r.jsx)("g",{transform:"translate(904.92214,-879.1482)",children:(0,r.jsx)("path",{d:" m -673.67664,1221.6502 -231.2455,-231.24803 55.6165, -55.627 c 30.5891,-30.59485 56.1806,-55.627 56.8701,-55.627 0.6894, 0 79.8637,78.60862 175.9427,174.68583 l 174.6892,174.6858 174.6892, -174.6858 c 96.079,-96.07721 175.253196,-174.68583 175.942696, -174.68583 0.6895,0 26.281,25.03215 56.8701, 55.627 l 55.6165,55.627 -231.245496,231.24803 c -127.185,127.1864 -231.5279,231.248 -231.873,231.248 -0.3451,0 -104.688, -104.0616 -231.873,-231.248 z ",fill:"currentColor"})})})}function l(e){let{links:n,focus:s,showInGroups:i,showInherited:l}=e,[o,m]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{m(!1)},[null==s?void 0:s.label]),(0,r.jsxs)("div",{children:[(0,r.jsx)("h2",{children:"Immutable.js"}),n.map(e=>{let n=(null==s?void 0:s.label)===e.label,u=n&&!o;return(0,r.jsxs)(a.Fragment,{children:[(0,r.jsx)("div",{className:"sideBar__Link ".concat(u?"sideBar__Link--active":""),children:(0,r.jsxs)(t.default,{href:e.url,onClick:e=>{n&&(e.preventDefault(),m(!o))},children:[e.label,u&&((null==s?void 0:s.interface)||(null==s?void 0:s.functions))&&(0,r.jsxs)(r.Fragment,{children:[" ",(0,r.jsx)(c,{isActive:u})]})]})}),u&&(0,r.jsx)(d,{focus:s,showInherited:l,showInGroups:i})]},e.url)})]})}function d(e){let{focus:n,showInGroups:s,showInherited:a}=e;return n&&(n.interface||n.functions)?(0,r.jsxs)("div",{className:"members",children:[n.call&&(0,r.jsxs)("section",{children:[(0,r.jsx)("h4",{className:"groupTitle",children:"Construction"}),(0,r.jsx)("div",{children:(0,r.jsx)(t.default,{href:n.call.url,children:n.call.label})})]}),n.functions&&(0,r.jsxs)("section",{children:[(0,r.jsx)("h4",{className:"groupTitle",children:"Static Methods"}),Object.values(n.functions).map(e=>(0,r.jsx)("div",{children:(0,r.jsx)(t.default,{href:e.url,children:e.label})},e.id))]}),(0,r.jsx)("section",{children:(0,i.i)(n.interface,s,a).flatMap(e=>{let[n,s]=e;return 0===s.length?null:[(0,r.jsx)("h4",{className:"groupTitle",children:n||"Members"},n||"Members"),s.map(e=>(0,r.jsx)("div",{children:(0,r.jsx)(t.default,{href:e.url,children:e.label})},e.id))]})})]}):null}function o(e){let{links:n,focus:s,toggleShowInherited:t,toggleShowInGroups:a,showInherited:i,showInGroups:c}=e;return(0,r.jsxs)("div",{className:"sideBar",children:[(0,r.jsx)("div",{className:"sideBar__background"}),(0,r.jsxs)("div",{className:"scrollContent",children:[t&&a&&(0,r.jsxs)("div",{className:"toolBar",children:[(0,r.jsxs)("div",{onClick:a,onKeyPress:a,children:[(0,r.jsx)("span",{className:c?"selected":void 0,children:"Grouped"})," • ",(0,r.jsx)("span",{className:c?void 0:"selected",children:"Alphabetized"})]}),(0,r.jsxs)("div",{onClick:t,onKeyPress:t,children:[(0,r.jsx)("span",{className:i?"selected":void 0,children:"Inherited"})," • ",(0,r.jsx)("span",{className:i?void 0:"selected",children:"Defined"})]})]}),(0,r.jsx)(l,{links:n,focus:s,showInGroups:c,showInherited:i})]})]})}},6556:function(e,n,s){"use strict";s.r(n),s.d(n,{TypeDocumentation:function(){return F}});var r,t,a=s(984),i=s(208),c=s(346);function l(e){let{name:n,def:s}=e;return(0,a.jsxs)("span",{className:"t interfaceDef",children:[(0,a.jsx)("span",{className:"t keyword",children:"type "}),(0,a.jsx)("span",{className:"t typeName",children:n}),s.typeParams&&(0,a.jsxs)(a.Fragment,{children:["<",y(", ",s.typeParams.map((e,n)=>(0,a.jsx)("span",{className:"t typeParam",children:e},n))),">"]}),s.extends&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("span",{className:"t keyword",children:" extends "}),y(", ",s.extends.map((e,n)=>(0,a.jsx)(o,{type:e},n)))]}),s.implements&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("span",{className:"t keyword",children:" implements "}),y(", ",s.implements.map((e,n)=>(0,a.jsx)(o,{type:e},n)))]})]})}function d(e){let{name:n,callSig:s}=e,r=n.length+(s?j(s):2)>80;return(0,a.jsxs)("span",{className:"t callSig",children:[(0,a.jsx)("span",{className:"t fnName",children:n}),(null==s?void 0:s.typeParams)&&(0,a.jsxs)(a.Fragment,{children:["<",y(", ",s.typeParams.map((e,n)=>(0,a.jsx)("span",{className:"t typeParam",children:e},n))),">"]}),"(",s&&p(s.params,r),")",(null==s?void 0:s.type)&&(0,a.jsxs)(a.Fragment,{children:[": ",(0,a.jsx)(o,{type:s.type},"type")]})]})}function o(e){let{type:n,prefix:s}=e;switch(n.k){case t.Never:return m("primitive","never");case t.Any:return m("primitive","any");case t.Unknown:return m("primitive","unknown");case t.This:return m("primitive","this");case t.Undefined:return m("primitive","undefined");case t.Boolean:return m("primitive","boolean");case t.Number:return m("primitive","number");case t.String:return m("primitive","string");case t.Union:return m("union",y(" | ",n.types.map((e,n)=>(0,a.jsx)(o,{type:e},n))));case t.Intersection:return m("intersection",y(" & ",n.types.map((e,n)=>(0,a.jsx)(o,{type:e},n))));case t.Tuple:return m("tuple",(0,a.jsxs)(a.Fragment,{children:["[",y(", ",n.types.map((e,n)=>(0,a.jsx)(o,{type:e},n))),"]"]}));case t.Object:if(!n.members)return m("primitive","object");return m("object",(0,a.jsxs)(a.Fragment,{children:["{",y(", ",n.members.map((e,n)=>(0,a.jsx)(h,{member:e},n))),"}"]}));case t.Indexed:return m("indexed",(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(o,{type:n.type}),",","[",(0,a.jsx)(o,{type:n.index}),"]"]}));case t.Operator:return m("operator",(0,a.jsxs)(a.Fragment,{children:[m("primitive",n.operator)," ",(0,a.jsx)(o,{type:n.type})]}));case t.Array:return m("array",(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(o,{type:n.type}),"[]"]}));case t.Function:{let e=(s||0)+j(n)>78;return m("function",(0,a.jsxs)(a.Fragment,{children:[n.typeParams&&(0,a.jsxs)(a.Fragment,{children:["<",y(", ",n.typeParams.map((e,n)=>(0,a.jsx)("span",{className:"t typeParam",children:e},n))),">"]}),"(",p(n.params,e),") => ",(0,a.jsx)(o,{type:n.type})]}))}case t.Param:return m("typeParam",n.param);case t.Type:return m("type",(0,a.jsxs)(a.Fragment,{children:[n.url?(0,a.jsx)(c.default,{href:n.url,className:"t typeName",children:n.name}):(0,a.jsx)("span",{className:"t typeName",children:n.name}),n.args&&(0,a.jsxs)(a.Fragment,{children:["<",y(", ",n.args.map((e,n)=>(0,a.jsx)(o,{type:e},n))),">"]})]}))}throw Error("Type with unknown kind "+JSON.stringify(n))}function m(e,n){return(0,a.jsx)(u,{className:e,children:n})}function u(e){let{className:n,children:s}=e,[r,t]=(0,i.useState)(!1),c=(0,i.useCallback)(e=>{e.stopPropagation(),t(!0)},[t]),l=(0,i.useCallback)(()=>{t(!1)},[t]);return(0,a.jsx)("span",{className:"t "+(r?"over ":"")+n,onMouseOver:c,onFocus:c,onMouseOut:l,onBlur:l,children:s})}function h(e){let{member:n}=e;return(0,a.jsxs)("span",{className:"t member",children:[n.index?(0,a.jsxs)(a.Fragment,{children:["[",p(n.params,!1),"]"]}):(0,a.jsx)("span",{className:"t memberName",children:n.name}),n.type&&(0,a.jsxs)(a.Fragment,{children:[": ",(0,a.jsx)(o,{type:n.type})]})]})}function p(e,n){let s=y(n?(0,a.jsxs)(a.Fragment,{children:[",",(0,a.jsx)("br",{})]}):", ",(null!=e?e:[]).map((e,n)=>(0,a.jsxs)(i.Fragment,{children:[e.varArgs?"...":null,(0,a.jsx)("span",{className:"t param",children:e.name}),e.optional?"?: ":": ",(0,a.jsx)(o,{prefix:e.name.length+(e.varArgs?3:0)+(e.optional?3:2),type:e.type})]},n)));return n?(0,a.jsx)("div",{className:"t blockParams",children:s}):s}function j(e){return(e.typeParams?2+e.typeParams.join(", ").length:0)+2+(e.params?x(e.params):0)+(e.type?2+f(e.type):0)}function x(e){return e.reduce((e,n)=>e+(n.varArgs?3:0)+n.name.length+(n.optional?3:2)+f(n.type),(e.length-1)*2)}function f(e){if(!e)throw Error("Expected type");switch(e.k){case t.Never:return 5;case t.Any:return 3;case t.Unknown:return 7;case t.This:return 4;case t.Undefined:return 9;case t.Boolean:return 7;case t.Number:case t.String:return 6;case t.Union:case t.Intersection:return e.types.reduce((e,n)=>e+f(n),0)+(e.types.length-1)*3;case t.Tuple:return 2+e.types.reduce((e,n)=>e+f(n),0)+(e.types.length-1)*2;case t.Object:var n;return e.members?2+(n=e.members).reduce((e,n)=>e+(n.index?x(n.params||[])+2:n.name.length)+(n.type?f(n.type)+2:0),(n.length-1)*2):6;case t.Indexed:return 2+f(e.type)+f(e.index);case t.Operator:return 1+e.operator.length+f(e.type);case t.Array:return f(e.type)+2;case t.Function:return 2+j(e);case t.Param:return e.param.length;case t.Type:return e.name.length+(e.args?e.args.reduce((e,n)=>e+f(n),2*e.args.length):0)}throw Error("Type with unknown kind "+JSON.stringify(e))}function y(e,n){let s=[],r=0;for(let t of n)s.push(t,(0,a.jsx)(i.Fragment,{children:e},"b:".concat(r++)));return s.pop(),s}(r=t||(t={}))[r.Never=0]="Never",r[r.Any=1]="Any",r[r.Unknown=2]="Unknown",r[r.This=3]="This",r[r.Undefined=4]="Undefined",r[r.Boolean=5]="Boolean",r[r.Number=6]="Number",r[r.String=7]="String",r[r.Object=8]="Object",r[r.Array=9]="Array",r[r.Function=10]="Function",r[r.Param=11]="Param",r[r.Type=12]="Type",r[r.Union=13]="Union",r[r.Intersection=14]="Intersection",r[r.Tuple=15]="Tuple",r[r.Indexed=16]="Indexed",r[r.Operator=17]="Operator";var v=s(9698),g=s(4303);function N(e){var n,s;let{member:r}=e;return(0,a.jsxs)("div",{className:"interfaceMember",id:r.id,children:[(0,a.jsx)("h4",{className:"memberLabel",children:(0,a.jsx)(c.default,{href:r.url,children:r.label})}),(0,a.jsxs)("div",{className:"detail",children:[r.doc&&(0,a.jsx)(g.MarkdownContent,{className:"docSynopsis",contents:r.doc.synopsis}),r.signatures?(0,a.jsx)("code",{className:"codeBlock memberSignature",children:r.signatures.map((e,n)=>(0,a.jsxs)(i.Fragment,{children:[(0,a.jsx)(d,{name:r.name,callSig:e},n),"\n"]},n))}):(0,a.jsx)("code",{className:"codeBlock memberSignature",children:(0,a.jsx)(h,{member:{name:r.name,type:r.type}})}),r.inherited&&(0,a.jsxs)("section",{children:[(0,a.jsx)("h4",{className:"infoHeader",children:"Inherited from"}),(0,a.jsx)("code",{children:(0,a.jsxs)(c.default,{href:r.inherited.url,children:[r.inherited.interface,"#",r.inherited.label]})})]}),r.overrides&&(0,a.jsxs)("section",{children:[(0,a.jsx)("h4",{className:"infoHeader",children:"Overrides"}),(0,a.jsx)("code",{children:(0,a.jsxs)(c.default,{href:r.overrides.url,children:[r.overrides.interface,"#",r.overrides.label]})})]}),null===(n=r.doc)||void 0===n?void 0:n.notes.map((e,n)=>(0,a.jsxs)("section",{children:[(0,a.jsx)("h4",{className:"infoHeader",children:e.name}),"alias"===e.name?(0,a.jsx)("code",{children:(0,a.jsx)(d,{name:e.body})}):(0,a.jsx)(g.MarkdownContent,{className:"discussion",contents:e.body})]},n)),(null===(s=r.doc)||void 0===s?void 0:s.description)&&(0,a.jsxs)("section",{children:[(0,a.jsx)("h4",{className:"infoHeader",children:"<code"===r.doc.description.slice(0,5)?"Example":"Discussion"}),(0,a.jsx)(g.MarkdownContent,{className:"discussion",contents:r.doc.description})]})]},"detail")]})}var b=s(4237),k=s(7065);function w(){return(0,a.jsxs)("section",{className:"disclaimer",children:["This documentation is generated from"," ",(0,a.jsx)("a",{href:"https://github.com/immutable-js/immutable-js/blob/main/type-definitions/immutable.d.ts",target:"_blank",rel:"noopener",children:"immutable.d.ts"}),". Pull requests and"," ",(0,a.jsx)("a",{href:"https://github.com/immutable-js/immutable-js/issues",target:"_blank",rel:"noopener",children:"Issues"})," ","welcome."]})}function S(e){return!e}function F(e){let{def:n,sidebarLinks:s}=e,[r,t]=(0,i.useReducer)(S,!0),[c,l]=(0,i.useReducer)(S,!0);return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(v.SideBar,{links:s,focus:n,toggleShowInherited:t,toggleShowInGroups:l,showInGroups:c,showInherited:r}),(0,a.jsxs)("div",{className:"docContents",children:[(0,a.jsx)(k.DocSearch,{}),n.interface||n.functions||!n.call?(0,a.jsx)(I,{def:n,showInGroups:c,showInherited:r}):(0,a.jsx)(T,{def:n.call})]},n.qualifiedName)]})}function T(e){var n,s;let{def:r}=e;return(0,a.jsxs)("div",{children:[(0,a.jsx)("h1",{className:"typeHeader",children:r.label}),r.doc&&(0,a.jsx)(g.MarkdownContent,{className:"docSynopsis",contents:r.doc.synopsis}),(0,a.jsx)("code",{className:"codeBlock memberSignature",children:r.signatures.map((e,n)=>(0,a.jsxs)(i.Fragment,{children:[(0,a.jsx)(d,{name:r.name,callSig:e}),"\n"]},n))}),null===(n=r.doc)||void 0===n?void 0:n.notes.map((e,n)=>(0,a.jsxs)("section",{children:[(0,a.jsx)("h4",{className:"infoHeader",children:e.name}),"alias"===e.name?(0,a.jsx)(d,{name:e.body}):e.body]},n)),(null===(s=r.doc)||void 0===s?void 0:s.description)&&(0,a.jsxs)("section",{children:[(0,a.jsx)("h4",{className:"infoHeader",children:"<code"===r.doc.description.slice(0,5)?"Example":"Discussion"}),(0,a.jsx)(g.MarkdownContent,{className:"discussion",contents:r.doc.description})]}),(0,a.jsx)(w,{})]})}function I(e){var n,s;let{def:r,showInGroups:t,showInherited:i}=e,c=(0,b.i)(null==r?void 0:r.interface,t,i);return(0,a.jsxs)("div",{children:[(0,a.jsx)("h1",{className:"typeHeader",children:r.qualifiedName}),r.doc&&(0,a.jsx)(g.MarkdownContent,{className:"docSynopsis",contents:r.doc.synopsis}),r.interface&&(0,a.jsx)("code",{className:"codeBlock memberSignature",children:(0,a.jsx)(l,{name:r.qualifiedName,def:r.interface})}),null===(n=r.doc)||void 0===n?void 0:n.notes.map((e,n)=>(0,a.jsxs)("section",{children:[(0,a.jsx)("h4",{className:"infoHeader",children:e.name}),"alias"===e.name?(0,a.jsx)(d,{name:e.body}):e.body]},n)),(null===(s=r.doc)||void 0===s?void 0:s.description)&&(0,a.jsxs)("section",{children:[(0,a.jsx)("h4",{className:"infoHeader",children:"<code"===r.doc.description.slice(0,5)?"Example":"Discussion"}),(0,a.jsx)(g.MarkdownContent,{className:"discussion",contents:r.doc.description})]}),r.call&&(0,a.jsxs)("section",{children:[(0,a.jsx)("h3",{className:"groupTitle",children:"Construction"}),(0,a.jsx)(N,{member:r.call})]}),r.functions&&(0,a.jsxs)("section",{children:[(0,a.jsx)("h3",{className:"groupTitle",children:"Static methods"}),Object.values(r.functions).map(e=>(0,a.jsx)(N,{member:e},e.id))]}),(0,a.jsx)("section",{children:c.flatMap(e=>{let[n,s]=e;return 0===s.length?null:[(0,a.jsx)("h3",{className:"groupTitle",children:n||"Members"},n||"Members"),s.map(e=>(0,a.jsx)(N,{member:e},e.id))]})}),(0,a.jsx)(w,{})]})}},4237:function(e,n,s){"use strict";function r(e,n,s){let r={},t=(null==e?void 0:e.members)?Object.values(e.members):[];for(let e of(n||t.sort((e,n)=>e.id>n.id?1:-1),t)){let t=n&&e.group||"";(s||!e.inherited)&&(r[t]||(r[t]=[])).push(e)}return Object.entries(r)}s.d(n,{i:function(){return r}})}},function(e){e.O(0,[346,115,69,744],function(){return e(e.s=8035)}),_N_E=e.O()}]);