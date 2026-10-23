import assert from "node:assert/strict";
import test from "node:test";
import {money,percent,terms} from "../../src/lib/finance/debt-input.mjs";

const form=(params={})=>{const d=new FormData();for(const [key,val] of Object.entries(params))d.append(key,val);return d;};

test("M04: empty money remains NULL, exact BRL cents stay integral",()=>{
 assert.equal(money(""),null);
 assert.equal(money("0"),"0");
 assert.equal(money("0,01"),"1");
 assert.equal(money("1234,56"),"123456");
 assert.equal(money("90000000000000"),"9000000000000000");
});
test("M04: negative, imprecise and out-of-range amounts fail closed",()=>{
 for(const input of ["-0,01","-10","1,234","1.234,56","90000000000000,01","Infinity","NaN"])
  assert.throws(()=>money(input),Error,input);
});
test("M04: periods and rates remain explicit at eight-place precision",()=>{
 assert.equal(percent(""),null);
 assert.equal(percent("0"),"0");
 assert.equal(percent("2,125"),"2.125");
 assert.equal(percent("0.12345678"),"0.12345678");
 assert.equal(percent("10000"),"10000");
});
test("M04: rates reject overprecision, negative, symbols and exceeding max",()=>{
 for(const input of ["0.123456789","10000.00000001","10001","-1","1e2","1 000","1.2.3","1,2,3","123456","1."])
  assert.throws(()=>percent(input),Error,input);
});
test("M04: unknown interest and CET remain NULL rather than zero",()=>{
 assert.deepEqual(terms(form(),"interest"),{value:null,period:null,source:null});
 assert.deepEqual(terms(form(),"cet"),{value:null,period:null,source:null});
});
test("M04: monthly rate with provenance and annual CET stay distinct",()=>{
 const d=form({interest_percent:" 2,125 ",interest_period:"monthly",interest_source:" Contract A ",
  cet_percent:"31.75",cet_period:"annual",cet_source:"Disclosure B"});
 assert.deepEqual(terms(d,"interest"),{value:"2.125",period:"monthly",source:"Contract A"});
 assert.deepEqual(terms(d,"cet"),{value:"31.75",period:"annual",source:"Disclosure B"});
});
test("M04: rates including zero require period and provenance",()=>{
 for(const params of [
  {interest_percent:"2"},{interest_percent:"0",interest_period:"monthly"},
  {interest_percent:"1",interest_source:"Paper"},
  {interest_period:"annual",interest_source:"Paper"},
  {interest_percent:"2",interest_period:"quarterly",interest_source:"Paper"},
  {interest_percent:"2",interest_period:"monthly",interest_source:"x".repeat(241)}
 ])assert.throws(()=>terms(form(params),"interest"),Error,JSON.stringify(params));
});
test("M04: documented zero rate is not unknown, non-text fields fail",()=>{
 assert.deepEqual(terms(form({cet_percent:"0",cet_period:"daily",cet_source:"Statement"}),"cet"),
  {value:"0",period:"daily",source:"Statement"});
 const d=form({interest_percent:"1",interest_period:"monthly"});
 d.append("interest_source",new Blob(["synthetic"]));
 assert.throws(()=>terms(d,"interest"),Error);
});
