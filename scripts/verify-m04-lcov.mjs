// Validate an LCOV report from actual Node test execution, without inventing coverage.
import {readFileSync} from "node:fs";
const path=process.argv[2]??"coverage/lcov.info";
const lcov=readFileSync(path,"utf8");
const records=lcov.split("end_of_record").map(x=>x.trim()).filter(Boolean);
const target="src/lib/finance/debt-input.mjs";
const record=records.find(x=>x.split("\n").some(y=>y.trim()==="SF:"+target));
if(!record)throw Error("Coverage report is missing actual execution of "+target);
const get=(name)=>Number(record.match(new RegExp("^"+name+":(\\d+)$","m"))?.[1]??NaN);
const covered=get("LH"),total=get("LF"),branches=get("BRF"),coveredBranches=get("BRH");
if(!Number.isInteger(total)||total<=0||!Number.isInteger(covered)||covered<=0||covered>total||
 !Number.isInteger(branches)||branches<=0||!Number.isInteger(coveredBranches)||coveredBranches<0||
 coveredBranches>branches)throw Error("LCOV counters are missing or inconsistent for "+target);
console.log("Verified measured M04 helper coverage: lines "+covered+"/"+total+
 ", branches "+coveredBranches+"/"+branches+" (not TSX or authenticated RPC coverage).");
