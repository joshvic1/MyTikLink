export const followupCommands=['storefront_upgrade','storefront_add_products','storefront_ready'];
export function slashAt(value,cursor){
 const prefix=value.slice(0,cursor),match=prefix.match(/(?:^|\s)\/([a-z0-9_]*)$/i);
 return match?{start:cursor-match[1].length-1,end:cursor,query:match[1]}:null;
}
export function insertCommand(value,match,command){
 if(!match||!followupCommands.includes(command))return {value,cursor:match?.end||0};
 const text='/'+command+' ';
 return {value:value.slice(0,match.start)+text+value.slice(match.end),cursor:match.start+text.length};
}
