export function historyState(present = []) { return { past: [], present, future: [] }; }
export function historyReducer(state, action) {
 if (action.type === 'reset') return historyState(action.value);
 if (action.type === 'undo') return state.past.length ? {past:state.past.slice(0,-1),present:state.past.at(-1),future:[state.present,...state.future]} : state;
 if (action.type === 'redo') return state.future.length ? {past:[...state.past,state.present],present:state.future[0],future:state.future.slice(1)} : state;
 if (action.type !== 'set') return state;
 const next=typeof action.value==='function'?action.value(state.present):action.value;
 if (JSON.stringify(next)===JSON.stringify(state.present)) return state;
 return {past:[...state.past,state.present].slice(-100),present:next,future:[]};
}
