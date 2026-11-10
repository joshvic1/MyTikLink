// Memory only: never persist private API responses or tokens to browser storage.
export function createReadCache({ttl=20000,max=40,now=Date.now}={}){
 let owner=null,generation=0;const values=new Map(),pending=new Map();
 const clear=()=>{generation++;values.clear();pending.clear();};
 function scope(token){if(owner!==token){clear();owner=token;}}
 return {clear,read(token,key,loader,{fresh=false}={}){scope(token);const cached=values.get(key);if(!fresh&&cached&&now()-cached.at<ttl)return Promise.resolve(cached.value);if(pending.has(key))return pending.get(key);const version=generation;const promise=Promise.resolve().then(loader).then(value=>{if(version===generation){values.delete(key);values.set(key,{value,at:now()});while(values.size>max)values.delete(values.keys().next().value);}return value;}).finally(()=>{if(pending.get(key)===promise)pending.delete(key);});pending.set(key,promise);return promise;}};
}
