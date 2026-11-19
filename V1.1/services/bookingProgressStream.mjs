export async function readBookingProgress(response,onProgress){
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',result;
  const consume=line=>{if(!line.trim())return;const message=JSON.parse(line);if(message.error)throw Object.assign(new Error(message.error),{status:message.status});if(Number.isFinite(message.progress))onProgress(message.progress);if(message.booking)result={booking:message.booking};};
  while(true){const {done,value}=await reader.read();buffer+=decoder.decode(value,{stream:!done});let index;while((index=buffer.indexOf('\n'))!==-1){consume(buffer.slice(0,index));buffer=buffer.slice(index+1);}if(done)break;}
  if(buffer.trim())consume(buffer);if(!result)throw Error('The connection was interrupted. Retry to retrieve your booking.');return result;
}
