import{r as c}from"./app-DF_3VF3d.js";/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=t=>t==null?void 0:t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function I(t,e,n=[]){if(e==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:E(t),size:24,node:e,...n.length>0?{aliases:n}:{}}}/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=t=>{let e="",n=!1;for(const o of t){if(o==="-"||o==="_"||o<=" "){n=e.length>0;continue}e.length===0?e+=o.toLowerCase():e+=n?o.toUpperCase():o,n=!1}return e};/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=t=>{const e=$(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=(...t)=>t.filter((e,n,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===n).join(" ").trim();/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function N(t){return t!=null}function P(t,e={}){var b,k;const n=e.attributeNames??{},o=i=>n[i]??i,l=t.size??t.width??r.width,a=t.size??t.height??r.height,h=((b=t.aliases)==null?void 0:b.filter(i=>typeof i=="string"&&i.trim()!=="").map(i=>`lucide-${i}`))??[],f=[...t.name?[`lucide-${t.name}`]:[],...h],s=((k=e.className)==null?void 0:k.split(" ").filter(Boolean))??[],w=e.includeDefaultClasses===!1?S(...s):S("lucide",...f,...s),x=e.absoluteStrokeWidth?Number(e.strokeWidth??r["stroke-width"])*Number(t.size??t.width??r.width)/Number(e.size??e.width??r.width):e.strokeWidth??r["stroke-width"];return["svg",{...Object.entries(r).reduce((i,[u,d])=>(i[o(u)]=d,i),{}),..."color"in e&&e.color&&{[o("stroke")]:e.color},..."size"in e&&N(e.size)&&{[o("width")]:e.size,[o("height")]:e.size},..."width"in e&&N(e.width)&&{[o("width")]:e.width},..."height"in e&&N(e.height)&&{[o("height")]:e.height},[o("stroke-width")]:x,...w&&{[o("class")]:w},[o("viewBox")]:`0 0 ${l} ${a}`,...e.hasA11yProp===!1?{[o("aria-hidden")]:"true"}:{},..."attributes"in e&&e.attributes},t.node.map(i=>{const[u,d,g]=i,C=e.nonScalingStroke?{[o("vector-effect")]:"non-scaling-stroke",...d}:d;return g?[u,C,g]:[u,C]})]}/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function p(t,e={}){return P(t,{...e,attributeNames:{...e.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},R=c.createContext({}),_=()=>c.useContext(R),F=c.forwardRef(({color:t,size:e,width:n,height:o,strokeWidth:l,absoluteStrokeWidth:a,nonScalingStroke:h,className:f="",children:s,iconNode:w=[],icon:x={node:w,aliases:[],size:24},...m},b)=>{const{size:k=24,strokeWidth:i=2,absoluteStrokeWidth:u=!1,nonScalingStroke:d=!1,color:g="currentColor",className:C=""}=_()??{},z=!!s||D(m),[A,W,v=[]]=p(x,{color:t??g,width:n??e??k,height:o??e??k,strokeWidth:l??i,absoluteStrokeWidth:a??u,nonScalingStroke:h??d,className:S(C,f),hasA11yProp:z,attributes:m});return c.createElement(A,{ref:b,...W},[...v.map(([L,B])=>c.createElement(L,B)),...Array.isArray(s)?s:[s]])});/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function U(t,e=[],n=[]){const o=typeof t=="string"?I(t,e,n):t,l=c.forwardRef(({className:a,...h},f)=>c.createElement(F,{ref:f,icon:o,className:a,...h}));return o.name&&(l.displayName=j(o.name)),l}/**
 * @license lucide-react v1.60.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y={name:"clock",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]};y.node;const H=U(y);export{H as C,U as c};
