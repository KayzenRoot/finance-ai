// Whitelisted in-thread TypeScript/TSX loader for M04 synthetic tests only.
import {registerHooks} from "node:module";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import ts from "typescript";

const actionUrl=new URL("../../src/app/dashboard/debts/debt-actions.ts",import.meta.url).href;
const pageUrl=new URL("../../src/app/dashboard/debts/page.tsx",import.meta.url).href;
const runtimeUrl=new URL("./m04-synthetic-runtime.mjs",import.meta.url).href;
const alias=new Map([
 ["next/cache",runtimeUrl],["next/navigation",runtimeUrl],["next/link",runtimeUrl],
 ["@/lib/supabase/server",runtimeUrl],
 ["@/lib/finance/money.mjs",new URL("../../src/lib/finance/money.mjs",import.meta.url).href],
 ["@/lib/finance/debt-input.mjs",new URL("../../src/lib/finance/debt-input.mjs",import.meta.url).href]
]);
registerHooks({
 resolve(specifier,context,nextResolve){
  if(context.parentURL===actionUrl||context.parentURL===pageUrl){
   if(alias.has(specifier))return {url:alias.get(specifier),shortCircuit:true};
   if(context.parentURL===pageUrl&&specifier==="./debt-actions")
    return {url:actionUrl,shortCircuit:true};
  }
  return nextResolve(specifier,context);
 },
 load(url,context,nextLoad){
  if(url!==actionUrl&&url!==pageUrl)return nextLoad(url,context);
  const original=readFileSync(fileURLToPath(url),"utf8");
  const result=ts.transpileModule(original,{
   fileName:fileURLToPath(url),
   compilerOptions:{
    target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,
    jsx:ts.JsxEmit.ReactJSX,inlineSourceMap:true,inlineSources:true
   },
   reportDiagnostics:true
  });
  if(result.diagnostics?.some(item=>item.category===ts.DiagnosticCategory.Error))
   throw new Error("Synthetic TSX transpilation failed");
  return {format:"module",shortCircuit:true,source:result.outputText};
 }
});
