let pending=null;
export function setEditTarget(value){pending=value;}
export function consumeEditTarget(){const value=pending;pending=null;return value;}
