export function uploadWithProgress(url,{method,headers={},file,onProgress}){
 return new Promise((resolve,reject)=>{
  const xhr=new XMLHttpRequest();xhr.open(method,url);xhr.timeout=60000;
  for(const [key,value] of Object.entries(headers))xhr.setRequestHeader(key,value);
  xhr.upload.onprogress=e=>{if(e.lengthComputable&&e.total>0)onProgress(Math.min(100,Math.max(0,Math.round(e.loaded/e.total*100))));};
  xhr.onload=()=>resolve({ok:xhr.status>=200&&xhr.status<300,status:xhr.status});
  xhr.onerror=()=>reject(Error('Image upload failed. Please try again.'));
  xhr.ontimeout=()=>reject(Error('Image upload timed out. Please try again.'));
  xhr.onabort=()=>reject(Error('Image upload was cancelled.'));
  xhr.send(file);
 });
}
