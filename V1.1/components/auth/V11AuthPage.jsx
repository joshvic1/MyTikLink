import {Modal, Button} from "../UI";
import {safeAuthReturn} from '../../lib/authReturn';
import motion from "./AuthExperience.module.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, MailCheck, UserRound } from "lucide-react";
import { apiRequest } from "../../lib/api";
import styles from "../../styles/v11.module.css";

function Field({ icon: Icon, label, value, onChange, placeholder, type = "text", autoComplete, password = false }) {
  const [shown, setShown] = useState(false);
  return <label className={styles.v11AuthField}><span>{label}</span><div><Icon/><input required type={password && shown ? "text" : type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}/>{password && <button type="button" onClick={() => setShown((current) => !current)} aria-label={shown ? "Hide password" : "Show password"}>{shown ? <EyeOff/> : <Eye/>}</button>}</div></label>;
}

export function V11AuthPage({ mode }) {
  const router = useRouter(); const login = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "", marketingEmails: true, termsAccepted: false, registrationVersion: "v1-1" }), [busy, setBusy] = useState(false), [error, setError] = useState(""), [verification, setVerification] = useState(false), [code, setCode] = useState(["", "", "", ""]), [resendIn, setResendIn] = useState(0);
  const [googleOnly,setGoogleOnly]=useState(false), [passwordModal,setPasswordModal]=useState(false), [newPassword,setNewPassword]=useState(""), [confirmPassword,setConfirmPassword]=useState(""), [passwordError,setPasswordError]=useState(""), [passwordChallenge,setPasswordChallenge]=useState("");
  const refs = useRef([]);
  const verifying = useRef(false);
  const googleHandled = useRef(false);
  const [googleBusy,setGoogleBusy]=useState(false);
  useEffect(() => { if (verification && !busy) refs.current[0]?.focus(); }, [verification]);
  useEffect(() => { if (!resendIn) return; const timer = setTimeout(() => setResendIn((value) => value - 1), 1000); return () => clearTimeout(timer); }, [resendIn]);
  const finishAuthentication = (token, message) => { localStorage.setItem("token", token); sessionStorage.setItem("v11-auth-notice", message); const candidate=String(router.query.next||sessionStorage.getItem("v11-return-to")||"");sessionStorage.removeItem("v11-return-to");router.push(safeAuthReturn(candidate)); };
  useEffect(() => {
    if (!router.isReady || googleHandled.current) return;
    if (typeof router.query.googleToken === 'string' && router.query.googleToken) {
      googleHandled.current=true; setGoogleBusy(true);
      finishAuthentication(router.query.googleToken, login ? "Logged in successfully." : "Registration successful.");
    } else if (router.query.googleError) setError("Google sign-in could not be completed. Please try again or continue with email.");
  }, [router.isReady,router.query.googleToken,router.query.googleError]);
  const update = (key) => (event) => { setError(""); setGoogleOnly(false); setForm((current) => ({ ...current, [key]: event.target.value })); };
  const startPassword = async (event) => {
    event?.preventDefault(); if(busy)return;
    if(newPassword.length<8) {setPasswordError("Use at least 8 characters for your password.");return;}
    if(newPassword!==confirmPassword){setPasswordError("Your passwords do not match.");return;}
    setBusy(true);setPasswordError("");setError("");
    try {
      const result=await apiRequest("/auth/google-password/start",{method:"POST",body:JSON.stringify({email:form.email,password:newPassword,confirmPassword})});
      setPasswordChallenge(result.challengeId);setPasswordModal(false);setCode(["","","",""]);verifying.current=false;setVerification(true);setResendIn(60);
    } catch(err){setPasswordError(err.message);setError(err.message);} finally{setBusy(false);}
  };
  const sendCode = async () => { await apiRequest("/auth/send-code", { method: "POST", body: JSON.stringify(form) }); setCode(["", "", "", ""]); setVerification(true); setResendIn(60); requestAnimationFrame(() => refs.current[0]?.focus()); };
  const submit = async (event) => { event.preventDefault(); if (!login && !form.termsAccepted) { setError("Please accept the Terms and Privacy Policy to continue."); return; } setBusy(true); setError(""); try { if (login) { const result = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) }); finishAuthentication(result.token, "Logged in successfully."); } else await sendCode(); } catch (requestError) { setGoogleOnly(requestError.details?.code === "GOOGLE_PASSWORD_REQUIRED"); setError(requestError.message || "We could not continue. Please try again."); } finally { setBusy(false); } };
  const verifyCode = async (value) => {
    if (verifying.current || busy) return;
    if (!/^\d{4}$/.test(value)) return setError("Enter the four-digit code sent to your email.");
    verifying.current = true; setBusy(true); setError("");
    try {
      const result = await apiRequest(passwordChallenge ? "/auth/google-password/verify" : "/auth/verify-code", { method: "POST", body: JSON.stringify({ email: form.email, code: value, ...(passwordChallenge ? {challengeId:passwordChallenge} : {}) }) });
      setNewPassword("");setConfirmPassword(""); finishAuthentication(result.token, passwordChallenge ? "Password created. You are now signed in." : "Registration successful.");
    } catch (requestError) {
      verifying.current = false;
      setError(requestError.message || "That code is not valid.");
      refs.current[0]?.focus(); refs.current[0]?.select();
    } finally { setBusy(false); }
  };
  const verify = (event) => { event.preventDefault(); return verifyCode(code.join("")); };
  const deleteCode = (index) => {
    if (busy || verifying.current) return;
    const next = [...code];
    const target = next[index] ? index : Math.max(0, index - 1);
    next[target] = "";
    setCode(next); setError("");
    refs.current[Math.max(0, target - 1)]?.focus();
  };
  const enterCode = (index, raw) => {
    if (busy || verifying.current) return;
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    const next = [...code];
    const start = digits.length === 4 ? 0 : index;
    if (!digits) { deleteCode(index); return; }
    else [...digits].forEach((digit, offset) => { if (start + offset < 4) next[start + offset] = digit; });
    setCode(next); setError("");
    refs.current[Math.min(start + digits.length, 3)]?.focus();
    if (next.every(digit => /^\d$/.test(digit))) void verifyCode(next.join(""));
  };
  const google = () => { if(googleBusy)return; setGoogleBusy(true);setError(""); if(router.query.next)sessionStorage.setItem("v11-return-to",safeAuthReturn(router.query.next)); window.location.href = `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")}/auth/google?intent=${login ? "login" : "register"}&marketingEmails=true&returnTo=${login ? "/v1-1/login" : "/v1-1/register"}`; };
  const googleOption = <><button type="button" className={`${styles.v11GoogleButton} ${motion.google}`} disabled={googleBusy || busy} onClick={google}>{googleBusy && <LoaderCircle size={16}/>}<img src="/google.svg" alt=""/>{googleBusy ? "Connecting to Google…" : login ? "Continue with Google" : "Create with Google"}</button><div className={styles.v11AuthDivider}><span/>{login ? "or" : "or create with email"}<span/></div></>;
  const codeForm = <form className={styles.v11AuthForm} onSubmit={verify}><div className={styles.v11AuthCode}>{code.map((value, index) => <input key={index} ref={(node) => { refs.current[index] = node; if (node) node.onbeforeinput = event => { if (event.inputType === "deleteContentBackward" && event.cancelable) { event.preventDefault(); deleteCode(index); } }; }} inputMode="numeric" autoComplete={index ? "off" : "one-time-code"} aria-label={`Verification digit ${index + 1}`} autoFocus={index === 0} readOnly={busy} value={value} onFocus={event => event.target.select()} onChange={event => enterCode(index, event.target.value)} onPaste={event => { event.preventDefault(); enterCode(index, event.clipboardData.getData("text")); }} onKeyDown={event => { if (event.key === "Backspace") { event.preventDefault(); deleteCode(index); } }} />)}</div>{error && <p className={styles.v11AuthError}>{error}</p>}<button className={`${styles.v11AuthPrimary} ${motion.primary}`} disabled={busy}>{busy && <LoaderCircle/>}Verify and continue</button><button className={styles.v11AuthTextButton} type="button" disabled={busy || resendIn > 0} onClick={async () => { if(passwordChallenge){await startPassword();return;} setBusy(true); try { await sendCode(); } catch (requestError) { setError(requestError.message); } finally { setBusy(false); } }}>{resendIn ? `Resend code in ${resendIn}s` : "Resend code"}</button></form>;
  const authForm = <form className={styles.v11AuthForm} onSubmit={submit}>{!login && <Field icon={UserRound} label="Full name" value={form.name} onChange={update("name")} placeholder="Your name" autoComplete="name"/>}<Field icon={Mail} label="Email address" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" autoComplete="email"/><Field icon={LockKeyhole} label="Password" type="password" value={form.password} onChange={update("password")} placeholder={login ? "Enter your password" : "Create a password"} autoComplete={login ? "current-password" : "new-password"} password/>{login && <Link className={styles.v11ForgotLink} href="/v1-1/forgot-password">Forgot password?</Link>}{error && <p className={styles.v11AuthError}>{error}</p>}{login && googleOnly && <button type="button" className={styles.v11AuthTextButton} style={{textDecoration:"underline",alignSelf:"flex-start"}} onClick={()=>{setPasswordError("");setPasswordModal(true);}}>Set a password</button>}{!login&&<label className={motion.preference}><input type="checkbox" checked={form.termsAccepted} onChange={e=>{setForm(current=>({...current,termsAccepted:e.target.checked}));setError("");}} style={{width:16,height:16,flexShrink:0}}/><span>I agree to the <Link href="/terms" target="_blank">Terms</Link> and <Link href="/privacy" target="_blank">Privacy Policy</Link>.</span></label>}{!login&&<label className={motion.preference}><input type="checkbox" checked={form.marketingEmails===true} onChange={e=>setForm(current=>({...current,marketingEmails:e.target.checked}))} style={{width:16,height:16,flexShrink:0}}/>Send me personalized product tips, offers and updates. I can unsubscribe anytime.</label>}<button className={`${styles.v11AuthPrimary} ${motion.primary}`} disabled={busy}>{busy && <LoaderCircle/>}{login ? "Log in" : "Continue"}</button></form>;
  return <main className={`${styles.v11AuthScreen} ${motion.screen}`} data-auth-tone={verification ? "teal" : login ? "teal" : "purple"}><section className={styles.v11AuthShell}><Link href="/" className={styles.v11AuthBrand}><img src="/images/mytiklink-mark-black.png" alt=""/><b>MyTikLink</b></Link><div className={`${styles.v11AuthCard} ${motion.card}`}>{verification ? <><header className={motion.header}><button className={styles.v11AuthBack} type="button" disabled={busy} onClick={() => {setVerification(false);setPasswordChallenge("");setCode(["","","",""]);setError("");verifying.current=false;}}><ArrowLeft/> Back</button><div className={motion.headingRow}><span className={motion.headingIcon}><MailCheck aria-hidden="true"/></span><h1>Verify your email</h1></div><p>Enter the four-digit code we sent to <b>{form.email}</b>.</p></header>{codeForm}</> : <><header className={motion.header}><h1>{login ? "Welcome back" : "Create your account"}</h1><p>{login ? "Log in to manage your pages, products and orders." : "Start creating with MyTikLink in a few simple steps."}</p></header>{googleOption}{authForm}<p className={styles.v11AuthSwitch}>{login ? "New to MyTikLink?" : "Already have an account?"} <Link href={`${login ? "/v1-1/register" : "/v1-1/login"}${router.query.next ? "?next="+encodeURIComponent(safeAuthReturn(router.query.next)) : ""}`}>{login ? "Create an account" : "Log in"}</Link></p></>}</div></section>{passwordModal && <Modal title="Set a password" description="Create a password, then verify your email to sign in. You can still use Google." onClose={()=>{if(!busy){setPasswordModal(false);setNewPassword("");setConfirmPassword("");}}} footer={<Button type="submit" form="google-password-form" disabled={busy} style={{width:"100%"}}>{busy && <LoaderCircle size={16}/>}Continue</Button>}><form id="google-password-form" className={styles.v11AuthForm} onSubmit={startPassword}><Field icon={LockKeyhole} label="Create password" type="password" value={newPassword} onChange={e=>{setNewPassword(e.target.value);setPasswordError("");}} placeholder="At least 8 characters" autoComplete="new-password" password/><Field icon={LockKeyhole} label="Confirm password" type="password" value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value);setPasswordError("");}} placeholder="Enter your new password again" autoComplete="new-password" password/>{passwordError && <p role="alert" className={styles.v11AuthError}>{passwordError}</p>}</form></Modal>}</main>;
}
