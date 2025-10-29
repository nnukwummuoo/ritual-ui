// Utility to monitor localStorage changes for debugging
if (typeof window !== 'undefined') {
  let lastLoginData: string | null = null;
  
  const monitorLocalStorage = () => {
    const currentLoginData = localStorage.getItem('login');
    
    if (currentLoginData !== lastLoginData) {
      if (currentLoginData === null && lastLoginData !== null) {
        console.log('🗑️ [localStorage] login data was DELETED');
        console.log('🗑️ [localStorage] Previous data:', lastLoginData);
      } else if (lastLoginData === null && currentLoginData !== null) {
        console.log('💾 [localStorage] login data was SAVED');
        console.log('💾 [localStorage] New data:', currentLoginData);
      } else if (currentLoginData !== lastLoginData) {
        console.log('🔄 [localStorage] login data was UPDATED');
        console.log('🔄 [localStorage] Previous:', lastLoginData);
        console.log('🔄 [localStorage] Current:', currentLoginData);
      }
      
      lastLoginData = currentLoginData;
    }
  };
  
  // Monitor localStorage changes every 500ms
  setInterval(monitorLocalStorage, 500);
  
  // Initial check
  lastLoginData = localStorage.getItem('login');
  console.log('🔍 [localStorage] Initial data:', lastLoginData);
  
  // Expose function to window for manual testing
  (window as any).checkLocalStorage = () => {
    const data = localStorage.getItem('login');
    console.log('📊 [localStorage] Current data:', data);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('📊 [localStorage] Parsed data:', parsed);
      } catch (e) {
        console.error('❌ [localStorage] Failed to parse data:', e);
      }
    }
    return data;
  };
}
