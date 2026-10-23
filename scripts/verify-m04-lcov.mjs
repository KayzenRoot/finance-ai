// Only verify coverage collected at the fixed path by this CI runner.
import {readFileSync} from "node:fs";
const lcov=readFileSync("coverage/lcov.info","utf8");
const records=lcov.split("end_of_record").map(x=>x.trim()).filter(Boolean);
const targets=[
 "src/lib/finance/debt-input.mjs",
 "src/app/dashboard/debts/debt-actions.ts",
 "src/app/dashboard/debts/page.tsx"
];
for(const target of targets){
 const record=records.find(x=>x.split("\n").some(y=>y.trim()==="SF:"+target));
 if(!record)throw new Error("Missing real, source-mapped LCOV execution for "+target);
 const get=(name)=>{
  const row=record.split("\n").find(x=>x.startsWith(name+":"));
  return row===undefined?Number.NaN:Number(row.slice(name.length+1));
 };
 const covered=get("LH"),total=get("LF"),branches=get("BRF"),coveredBranches=get("BRH");
 if(!Number.isInteger(total)||total<=0||!Number.isInteger(covered)||covered<=0||covered>total||
  !Number.isInteger(branches)||branches<=0||!Number.isInteger(coveredBranches)||coveredBranches<0||
  coveredBranches>branches)throw new Error("Missing or inconsistent LCOV counters for "+target);
 console.log("Measured M04 (synthetic execution): "+target+
  " lines "+covered+"/"+total+", branches "+coveredBranches+"/"+branches);
}
console.log("These measurements do not include live Next runtime, browser hydration or Supabase production.");
