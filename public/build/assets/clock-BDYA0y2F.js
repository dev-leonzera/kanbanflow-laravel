import{j as s,r as l}from"./app-BaEa76u-.js";function O({className:e="h-8 w-auto",...t}){return s.jsxs("svg",{viewBox:"0 0 240 48",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:e,...t,children:[s.jsxs("g",{transform:"translate(4, 6)",children:[s.jsx("rect",{x:"0",y:"4",width:"9",height:"28",rx:"2.5",fill:"#38bdf8",fillOpacity:"0.8"}),s.jsx("rect",{x:"0",y:"8",width:"9",height:"6",rx:"1.5",fill:"#0284c7"}),s.jsx("rect",{x:"13",y:"0",width:"9",height:"36",rx:"2.5",fill:"#0ea5e9"}),s.jsx("rect",{x:"13",y:"5",width:"9",height:"10",rx:"1.5",fill:"#38bdf8"}),s.jsx("rect",{x:"13",y:"18",width:"9",height:"7",rx:"1.5",fill:"#0284c7"}),s.jsx("rect",{x:"26",y:"8",width:"9",height:"24",rx:"2.5",fill:"#0284c7",fillOpacity:"0.75"}),s.jsx("rect",{x:"26",y:"12",width:"9",height:"8",rx:"1.5",fill:"#38bdf8"})]}),s.jsxs("text",{x:"48",y:"31",fill:"currentColor",fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",fontSize:"22",fontWeight:"800",letterSpacing:"-0.5px",children:["Kanban",s.jsx("tspan",{fill:"#38bdf8",fontWeight:"600",children:"Flow"})]})]})}/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=e=>e==null?void 0:e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function E(e,t,i=[]){if(t==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:B(e),size:24,node:t,...i.length>0?{aliases:i}:{}}}/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=e=>{let t="",i=!1;for(const o of e){if(o==="-"||o==="_"||o<=" "){i=t.length>0;continue}t.length===0?t+=o.toLowerCase():t+=i?o.toUpperCase():o,i=!1}return t};/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=e=>{const t=I(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=(...e)=>e.filter((t,i,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===i).join(" ").trim();/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function S(e){return e!=null}function F(e,t={}){var k,w;const i=t.attributeNames??{},o=n=>i[n]??n,h=e.size??e.width??c.width,u=e.size??e.height??c.height,f=((k=e.aliases)==null?void 0:k.filter(n=>typeof n=="string"&&n.trim()!=="").map(n=>`lucide-${n}`))??[],x=[...e.name?[`lucide-${e.name}`]:[],...f],r=((w=t.className)==null?void 0:w.split(" ").filter(Boolean))??[],g=t.includeDefaultClasses===!1?j(...r):j("lucide",...x,...r),C=t.absoluteStrokeWidth?Number(t.strokeWidth??c["stroke-width"])*Number(e.size??e.width??c.width)/Number(t.size??t.width??c.width):t.strokeWidth??c["stroke-width"];return["svg",{...Object.entries(c).reduce((n,[a,d])=>(n[o(a)]=d,n),{}),..."color"in t&&t.color&&{[o("stroke")]:t.color},..."size"in t&&S(t.size)&&{[o("width")]:t.size,[o("height")]:t.size},..."width"in t&&S(t.width)&&{[o("width")]:t.width},..."height"in t&&S(t.height)&&{[o("height")]:t.height},[o("stroke-width")]:C,...g&&{[o("class")]:g},[o("viewBox")]:`0 0 ${h} ${u}`,...t.hasA11yProp===!1?{[o("aria-hidden")]:"true"}:{},..."attributes"in t&&t.attributes},e.node.map(n=>{const[a,d,b]=n,y=t.nonScalingStroke?{[o("vector-effect")]:"non-scaling-stroke",...d}:d;return b?[a,y,b]:[a,y]})]}/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function P(e,t={}){return F(e,{...t,attributeNames:{...t.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1},D=l.createContext({}),U=()=>l.useContext(D),_=l.forwardRef(({color:e,size:t,width:i,height:o,strokeWidth:h,absoluteStrokeWidth:u,nonScalingStroke:f,className:x="",children:r,iconNode:g=[],icon:C={node:g,aliases:[],size:24},...m},k)=>{const{size:w=24,strokeWidth:n=2,absoluteStrokeWidth:a=!1,nonScalingStroke:d=!1,color:b="currentColor",className:y=""}=U()??{},p=!!r||R(m),[A,W,v=[]]=P(C,{color:e??b,width:i??t??w,height:o??t??w,strokeWidth:h??n,absoluteStrokeWidth:u??a,nonScalingStroke:f??d,className:j(y,x),hasA11yProp:p,attributes:m});return l.createElement(A,{ref:k,...W},[...v.map(([z,L])=>l.createElement(z,L)),...Array.isArray(r)?r:[r]])});/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function K(e,t=[],i=[]){const o=typeof e=="string"?E(e,t,i):e,h=l.forwardRef(({className:u,...f},x)=>l.createElement(_,{ref:x,icon:o,className:u,...f}));return o.name&&(h.displayName=$(o.name)),h}/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N={name:"clock",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]};N.node;const q=K(N);export{O as A,q as C,K as c};
