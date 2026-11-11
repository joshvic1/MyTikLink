export function adminBackend(req){
 const local=process.env.NODE_ENV!=='production'&&/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host||'');
 return (local?'http://127.0.0.1:5002':process.env.ADMIN_API_URL||process.env.STAFF_API_URL||process.env.NEXT_PUBLIC_API_URL||'').replace(/\/$/,'').replace(/\/api$/,'');
}
export function sameOrigin(req){try{return new URL(req.headers.origin).host===req.headers.host;}catch{return false;}}
export function sessionCookie(res,token){res.setHeader('Set-Cookie',`control_session=${token}; HttpOnly; SameSite=Lax; Path=/api/staff; Max-Age=${token?43200:0}${process.env.NODE_ENV==='production'?'; Secure':''}`);}
export function sessionHeaders(req){const token=req.cookies.control_session||req.cookies.staff_session;return token?{Authorization:'Bearer '+token}:{};}
