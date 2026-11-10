export const HELP_DELAY=90000;
export const HELP_SESSION_KEY='mytiklink_help_hint_seen_v1';
export function helpEligible({seen,visible,hidden,typing,modal,helpOpen}){return !seen&&visible&&!hidden&&!typing&&!modal&&!helpOpen;}
// One timer, no polling; event listeners are owned and cleaned up by the component.
export function createIdleHelp({schedule,cancel,eligible,show,hide,delay=HELP_DELAY}){
 let timer,seen=false;
 const reset=()=>{cancel(timer);hide();if(!seen)timer=schedule(()=>{timer=null;if(eligible()){seen=true;show();}},delay);};
 return {reset,dismiss:()=>{cancel(timer);hide();},destroy:()=>cancel(timer)};
}
