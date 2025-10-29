// Debug utility for login process
if (typeof window !== 'undefined') {
  (window as any).debugLogin = () => {
    console.log('🔍 [Debug] Current localStorage data:', localStorage.getItem("login"));
    console.log('🔍 [Debug] Current sessionStorage data:', sessionStorage.getItem("login"));
    console.log('🔍 [Debug] Current cookies:', document.cookie);
    
    // Check if user is logged in via Redux
    const reduxState = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.getState?.();
    console.log('🔍 [Debug] Redux state:', reduxState);
    
    // Check if there are any event listeners that might clear localStorage
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;
    
    let setItemCalls = 0;
    let removeItemCalls = 0;
    let clearCalls = 0;
    
    localStorage.setItem = function(key: string, value: string) {
      setItemCalls++;
      console.log(`📝 [Debug] localStorage.setItem called (${setItemCalls}):`, key, value);
      return originalSetItem.call(this, key, value);
    };
    
    localStorage.removeItem = function(key: string) {
      removeItemCalls++;
      console.log(`🗑️ [Debug] localStorage.removeItem called (${removeItemCalls}):`, key);
      return originalRemoveItem.call(this, key);
    };
    
    localStorage.clear = function() {
      clearCalls++;
      console.log(`🧹 [Debug] localStorage.clear called (${clearCalls})`);
      return originalClear.call(this);
    };
    
    console.log('🔍 [Debug] Monitoring localStorage changes...');
    
    // Restore original functions after 10 seconds
    setTimeout(() => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
      localStorage.clear = originalClear;
      console.log('🔍 [Debug] Stopped monitoring localStorage changes');
      console.log(`📊 [Debug] Summary: ${setItemCalls} setItem calls, ${removeItemCalls} removeItem calls, ${clearCalls} clear calls`);
    }, 10000);
  };
  
  console.log('🔧 [Debug] debugLogin() function available. Call it to debug login issues.');
}
