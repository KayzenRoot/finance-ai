// Pure M04 finance validation invoked by Server Actions; no session or database access.
import {parseBrlCents} from "./money.mjs";

/** @param {FormData} v @param {string} k @returns {string} */
const field=(v,k)=>{const x=v.get(k);return typeof x==="string"?x.trim():"";};

/** @param {string} x @returns {string|null} */
export function money(x){
 if(!x)return null;
 const cents=parseBrlCents(x);if(BigInt(cents)<BigInt(0))throw Error("negative");
 return cents;
}

/** @param {string} x @returns {string|null} */
export function percent(x){
 if(!x)return null;
 const s=x.replace(",",".");
 if(!/^\d{1,5}(\.\d{1,8})?$/.test(s))throw Error("rate format");
 const [whole,frac=""]=s.split(".");
 if(BigInt(whole)*BigInt(100000000)+BigInt(frac.padEnd(8,"0"))>BigInt(1000000000000))throw Error("rate too high");
 return s;
}

/** @param {FormData} v @param {string} key */
export function terms(v,key){
 const value=percent(field(v,key+"_percent")),period=field(v,key+"_period")||null,
 source=field(v,key+"_source")||null;
 if((value===null)!==(period===null)||(value===null)!==(source===null)||
 (period!==null&& !["daily","monthly","annual"].includes(period))||
 (source!==null&&source.length>240))throw Error("incomplete rate provenance");
 return {value,period,source};
}
