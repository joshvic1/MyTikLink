export function createMediaQueue(limit=2){
 let active=0;const waiting=[];
 const pump=()=>{while(active<limit&&waiting.length){const job=waiting.shift();if(job.cancelled)continue;active++;job.started=true;job.start(job.release);}};
 return {enqueue(start){const job={start,cancelled:false,started:false,done:false};job.release=()=>{if(job.done)return;job.done=true;if(job.started)active--;pump();};waiting.push(job);pump();return()=>{job.cancelled=true;job.release();};}};
}
export const mediaQueue=createMediaQueue(2);
