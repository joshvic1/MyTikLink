export function lastQuestionIndex(messages){for(let i=messages.length-1;i>=0;i--)if(messages[i].role==='user')return i;return -1;}
export function turnScrollTop({scrollTop,viewportTop,questionTop,questionHeight,viewportHeight}){
 // Keep a short question and the response opening together. For very long
 // questions, show its final portion instead of hiding the entire answer.
 return Math.max(0,scrollTop+questionTop-viewportTop+Math.max(0,questionHeight-viewportHeight*.45)-12);
}
