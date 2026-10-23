// Test-only injection surface. Never imported by production code.
import React from "react";

let client=null;
export const trace={redirects:[],revalidations:[],rpc:[],queries:[]};
export function resetSynthetic(clientValue=null){
 client=clientValue;
 for(const key of Object.keys(trace))trace[key].length=0;
}
export async function createClient(){return client;}
export function revalidatePath(path){trace.revalidations.push(path);}
export function redirect(path){
 trace.redirects.push(path);
 const error=new Error("SYNTHETIC_NEXT_REDIRECT");
 error.destination=path;
 throw error;
}
export default function Link({href,children,...props}){
 return React.createElement("a",{href,...props},children);
}
export function syntheticDB({
 userId,owner=true,spaces=[],debts=[],observations=[],
 spaceError=null,debtError=null,rpcError=null
}={}){
 const tables={finance_spaces:spaces,finance_debt_latest:debts,finance_debt_observations:observations};
 function query(table){
  const querySpec={table,filters:[],sorts:[],limit:null};
  trace.queries.push(querySpec);
  const complete=()=>{
   const error=table==="finance_spaces"?spaceError:debtError;
   let data=[...(tables[table]??[])];
   for(const [field,value] of querySpec.filters)data=data.filter(row=>row[field]===value);
   if(querySpec.limit!==null)data=data.slice(0,querySpec.limit);
   return Promise.resolve({data,error});
  };
  const builder={
   select(){return builder;},
   eq(field,value){
    querySpec.filters.push([field,value]);
    return table==="finance_spaces"?complete():builder;
   },
   order(field,settings){querySpec.sorts.push([field,settings]);return builder;},
   limit(size){querySpec.limit=size;return complete();}
  };
  return builder;
 }
 return {
  auth:{async getUser(){return {data:{user:userId?{id:userId}:null},error:null};}},
  async rpc(name,args){
   trace.rpc.push({name,args});
   if(name==="finance_is_authorized_owner")return {data:owner,error:null};
   return {data:null,error:rpcError};
  },
  from:query
 };
}
