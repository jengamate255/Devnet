import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { db } from './config';

/**
 * Devnet Firebase Service
 * 
 * Handles all Firebase Firestore operations for:
 * - Router configurations
 * - Users
 * - Vouchers
 * - Traffic data
 * - Portal settings
 */

class DevnetFirebaseService {
    constructor(userId = 'default') {
        this.userId = userId;
        this.collections = {
            routerConfig: `users/${userId}/routerConfig`,
            users: `users/${userId}/users`,
            vouchers: `users/${userId}/vouchers`,
            traffic: `users/${userId}/traffic`,
            blockedUsers: `users/${userId}/blockedUsers`,
            portalConfig: `users/${userId}/portalConfig`,
            historicalData: `users/${userId}/historicalData`
        };
    }

    /**
     * Save router configuration
     */
    async saveRouterConfig(config) {
        try {
            const docRef = doc(db, this.collections.routerConfig, 'current');
            await setDoc(docRef, {
                ...config,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('Error saving router config:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load router configuration
     */
    async loadRouterConfig() {
        try {
            const docRef = doc(db, this.collections.routerConfig, 'current');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { success: true, data: docSnap.data() };
            }
            return { success: true, data: null };
        } catch (error) {
            console.error('Error loading router config:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save users list
     */
    async saveUsers(users) {
        try {
            const batch = [];
            for (const user of users) {
                const docRef = doc(db, this.collections.users, user.id);
                batch.push(setDoc(docRef, {
                    ...user,
                    updatedAt: new Date().toISOString()
                }));
            }
            await Promise.all(batch);
            return { success: true };
        } catch (error) {
            console.error('Error saving users:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load all users
     */
    async loadUsers() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.users));
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, data: users };
        } catch (error) {
            console.error('Error loading users:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Add or update single user
     */
    async saveUser(user) {
        try {
            const docRef = doc(db, this.collections.users, user.id);
            await setDoc(docRef, {
                ...user,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('Error saving user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        try {
            const docRef = doc(db, this.collections.users, userId);
            await deleteDoc(docRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save vouchers
     */
    async saveVouchers(vouchers) {
        try {
            const batch = [];
            for (const voucher of vouchers) {
                const docRef = doc(db, this.collections.vouchers, voucher.id);
                batch.push(setDoc(docRef, {
                    ...voucher,
                    updatedAt: new Date().toISOString()
                }));
            }
            await Promise.all(batch);
            return { success: true };
        } catch (error) {
            console.error('Error saving vouchers:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load vouchers
     */
    async loadVouchers() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.vouchers));
            const vouchers = [];
            querySnapshot.forEach((doc) => {
                vouchers.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, data: vouchers };
        } catch (error) {
            console.error('Error loading vouchers:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save traffic data
     */
    async saveTrafficData(trafficData) {
        try {
            const docRef = doc(db, this.collections.traffic, 'current');
            await setDoc(docRef, {
                data: trafficData,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('Error saving traffic data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load traffic data
     */
    async loadTrafficData() {
        try {
            const docRef = doc(db, this.collections.traffic, 'current');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { success: true, data: docSnap.data().data };
            }
            return { success: true, data: [] };
        } catch (error) {
            console.error('Error loading traffic data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save portal configuration
     */
    async savePortalConfig(config) {
        try {
            const docRef = doc(db, this.collections.portalConfig, 'current');
            await setDoc(docRef, {
                ...config,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('Error saving portal config:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load portal configuration
     */
    async loadPortalConfig() {
        try {
            const docRef = doc(db, this.collections.portalConfig, 'current');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { success: true, data: docSnap.data() };
            }
            return { success: true, data: null };
        } catch (error) {
            console.error('Error loading portal config:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save all data at once (backup/export)
     */
    async saveAll(data) {
        try {
            const promises = [
                this.saveRouterConfig(data.routerConfig),
                this.saveUsers(data.users),
                this.saveVouchers(data.vouchers),
                this.saveTrafficData(data.trafficData),
                this.savePortalConfig(data.portalConfig)
            ];

            await Promise.all(promises);
            return { success: true };
        } catch (error) {
            console.error('Error saving all data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load all data at once
     */
    async loadAll() {
        try {
            const [
                routerConfig,
                users,
                vouchers,
                trafficData,
                portalConfig
            ] = await Promise.all([
                this.loadRouterConfig(),
                this.loadUsers(),
                this.loadVouchers(),
                this.loadTrafficData(),
                this.loadPortalConfig()
            ]);

            return {
                success: true,
                data: {
                    routerConfig: routerConfig.data,
                    users: users.data || [],
                    vouchers: vouchers.data || [],
                    trafficData: trafficData.data || [],
                    portalConfig: portalConfig.data
                }
            };
        } catch (error) {
            console.error('Error loading all data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Real-time listener for users
     */
    subscribeToUsers(callback) {
        const q = collection(db, this.collections.users);
        return onSnapshot(q, (snapshot) => {
            const users = [];
            snapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            callback(users);
        });
    }

    /**
     * Real-time listener for router config
     */
    subscribeToRouterConfig(callback) {
        const docRef = doc(db, this.collections.routerConfig, 'current');
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            }
        });
    }
}

// Export singleton instance
export default new DevnetFirebaseService();
export { DevnetFirebaseService };
