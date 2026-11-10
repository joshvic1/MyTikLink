// Queue an explicit open request until the lazily loaded assistant subscribes.
let pending=false;const listeners=new Set();
export function requestAssistant(){pending=true;listeners.forEach(fn=>fn());}
export function subscribeAssistant(fn){const consume=()=>{if(pending){pending=false;fn();}};listeners.add(consume);consume();return()=>listeners.delete(consume);}
