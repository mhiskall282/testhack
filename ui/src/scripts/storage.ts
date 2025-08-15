import { LoanState, type Loan } from "@/types";

// Firebase configuration - only initialize if all required values are present
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FS_API_KEY,
    authDomain: import.meta.env.VITE_FS_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FS_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FS_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FS_MSG_SENDER_ID,
    appId: import.meta.env.VITE_FS_APP_ID,
    measurementId: import.meta.env.VITE_FS_MEASUREMENT_ID,
};

// Check if Firebase should be initialized
const shouldInitializeFirebase = firebaseConfig.projectId && 
                               firebaseConfig.apiKey && 
                               firebaseConfig.authDomain;

let app: any = null;
let db: any = null;

// Initialize Firebase only if configuration is available
if (shouldInitializeFirebase) {
    try {
        import("firebase/app").then(({ initializeApp }) => {
            app = initializeApp(firebaseConfig);
            
            import("firebase/firestore").then(({ getFirestore }) => {
                db = getFirestore(app);
                console.log("✅ Firebase Firestore initialized successfully");
            });
        });
    } catch (error) {
        console.warn("⚠️ Firebase failed to initialize:", error);
    }
} else {
    console.log("ℹ️ Firebase Firestore not initialized - missing configuration values");
}

const LOAN_COLLECTION: string = "loans";
const USERS_COLLECTION: string = "users";
const PI: number = 3.141592654;

// Helper function to check if Firebase is available
function isFirebaseAvailable(): boolean {
    return db !== null && app !== null;
}

export const listen = async (cb: () => void) => {
    if (!isFirebaseAvailable()) {
        console.log("ℹ️ Firebase not available - skipping listen operation");
        return;
    }

    try {
        const { collection, query, onSnapshot } = await import("firebase/firestore");
        const loansRef = collection(db, LOAN_COLLECTION);
        const q = query(loansRef);
        onSnapshot(q, () => { cb(); });
    } catch (error) {
        console.warn("⚠️ Firebase listen operation failed:", error);
    }
};

export const getAllLoans = async (suiAddress: string, ethAddress: string): Promise<Loan[]> => {
    if (!isFirebaseAvailable()) {
        console.log("ℹ️ Firebase not available - returning empty loans array");
        return [];
    }

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const loansRef = collection(db, LOAN_COLLECTION);
        const q = query(loansRef, where("sender", 'in', [suiAddress, ethAddress]));
        const querySnapshot = await getDocs(q);

        const loans: Loan[] = [];
        querySnapshot.forEach((doc) => {
            loans.push(doc.data() as Loan);
        });

        return loans;
    } catch (error) {
        console.warn("⚠️ Firebase getAllLoans operation failed:", error);
        return [];
    }
};

export const saveNewLoan = async (loan: Loan) => {
    if (!isFirebaseAvailable()) {
        console.log("ℹ️ Firebase not available - skipping saveNewLoan operation");
        return;
    }

    try {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, LOAN_COLLECTION, loan.fromHash!), loan, { merge: true });
    } catch (error) {
        console.warn("⚠️ Firebase saveNewLoan operation failed:", error);
    }
};

export const removeLoan = async (fromHash: string) => {
    if (!isFirebaseAvailable()) {
        console.log("ℹ️ Firebase not available - skipping removeLoan operation");
        return false;
    }

    try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, LOAN_COLLECTION, fromHash));
        return true;
    } catch (error) {
        console.warn("⚠️ Firebase removeLoan operation failed:", error);
        return false;
    }
};

export const setLoanAsSettled = async (fromHash: string) => {
    if (!isFirebaseAvailable()) {
        console.log("ℹ️ Firebase not available - skipping setLoanAsSettled operation");
        return;
    }

    try {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, LOAN_COLLECTION, fromHash!), { state: LoanState.SETTLED }, { merge: true });
    } catch (error) {
        console.warn("⚠️ Firebase setLoanAsSettled operation failed:", error);
    }
};

export const getUserPoints = async (suiAddress: string) => {
    if (!isFirebaseAvailable()) {
        console.log("ℹ️ Firebase not available - returning 0 points");
        return 0;
    }

    try {
        const { doc, getDoc } = await import("firebase/firestore");
        const result = await getDoc(doc(db, USERS_COLLECTION, suiAddress));
        if (result.exists().valueOf()) {
            const user = result.data();
            return (user?.points || 0);
        }
        return 0;
    } catch (error) {
        console.warn("⚠️ Firebase getUserPoints operation failed:", error);
        return 0;
    }
};

export const incrementPoints = async (suiAddress: string, worthUsd: number) => {
    if (!isFirebaseAvailable()) {
        console.log("ℹ️ Firebase not available - skipping incrementPoints operation");
        return;
    }

    try {
        const { doc, getDoc, setDoc } = await import("firebase/firestore");
        const result = await getDoc(doc(db, USERS_COLLECTION, suiAddress));

        const newPoints = (worthUsd * PI);
        if (result.exists().valueOf()) {
            const user = result.data();
            await setDoc(doc(db, USERS_COLLECTION, suiAddress), { 
                points: ((user?.points || 0) + newPoints) 
            }, { merge: true });
        } else {
            await setDoc(doc(db, USERS_COLLECTION, suiAddress), { points: newPoints }, { merge: true });
        }
    } catch (error) {
        console.warn("⚠️ Firebase incrementPoints operation failed:", error);
    }
};