
interface LoginData {
    userID: string;
    refreshtoken?: string;
    accesstoken?: string;
    username?: string;
    email?: string;
    // Add other known fields if necessary
}

// Increment this version when you make breaking changes to localStorage structure
const CURRENT_SCHEMA_VERSION = '1.0.3';

export const migrateLocalStorage = () => {
    if (typeof window === 'undefined') return;

    const schemaVersion = localStorage.getItem('schema_version');

    // If version mismatch or not set, run migration
    if (schemaVersion !== CURRENT_SCHEMA_VERSION) {
        console.log('📦 Migrating localStorage from', schemaVersion, 'to', CURRENT_SCHEMA_VERSION);

        try {
            // 1. Validate 'login' data
            const loginRaw = localStorage.getItem('login');

            if (loginRaw) {
                try {
                    const loginData: LoginData = JSON.parse(loginRaw);

                    // Basic validation: must have userID
                    if (!loginData.userID) {
                        console.warn('⚠️ Invalid login data (missing userID), clearing...');
                        localStorage.removeItem('login');
                    }

                    // You could add more specific validation here

                } catch (e) {
                    console.error('❌ Error parsing login data, clearing...', e);
                    localStorage.removeItem('login');
                }
            }

            // 2. Clean up deprecated keys
            // Add any keys that were used in previous versions but are no longer needed
            const deprecatedKeys = [
                'old_messages',
                'temp_data',
                'cached_profiles',
                'persist:root', // If moving away from redux-persist or changing config
                'mmeko_temp_cache'
            ];

            deprecatedKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    console.log('🗑️ Removing deprecated key:', key);
                    localStorage.removeItem(key);
                }
            });

            // 3. Clear Redux Persist if needed (optional, effectively a "hard" reset for Redux)
            // If you are using redux-persist and want to force a clear on this version bump:
            // localStorage.removeItem('persist:root'); 

            // Update schema version
            localStorage.setItem('schema_version', CURRENT_SCHEMA_VERSION);
            console.log('✅ localStorage migration complete');

        } catch (error) {
            console.error('❌ localStorage migration failed:', error);
            // Safety net: don't clear everything unless critical, 
            // but ensure we update version to avoid infinite loop attempts if it's a logic error
            localStorage.setItem('schema_version', CURRENT_SCHEMA_VERSION);
        }
    }
};
