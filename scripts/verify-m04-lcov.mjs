// Only verify coverage generated at the fixed path by the local CI runner.
import {readFileSync} from "node:fs";
const lcov=readFileSync("coverage/lcov.info","utf8");
const records=lcov.split("end_of_record").map(x=>x.trim()).filter(Boolean);
const target="src/lib/finance/debt-input.mjs";
const record=records.find(x=>x.split("\n").some(y=>y.trim()==="SF:"+target));
if(!record)throw new Error("Coverage report is missing actual execution of "+target);
const get=(name)=>{
 const row=record.split("\n").find(x=>x.startsWith(name+":"));
 return row===undefined?Number.NaN:Number(row.slice(name.length+1));
};
const covered=get("LH"),total=get("LF"),branches=get("BRF"),coveredBranches=get("BRH");
if(!Number.isInteger(total)||total<=0||!Number.isInteger(covered)||covered<=0||covered>total||
 !Number.isInteger(branches)||branches<=0||!Number.isInteger(coveredBranches)||coveredBranches<0||
 coveredBranches>branches)throw new Error("LCOV counters are missing or inconsistent for "+target);
console.log("Verified measured M04 helper coverage: lines "+covered+"/"+total+
 ", branches "+coveredBranches+"/"+branches+" (not TSX or authenticated RPC coverage).");
