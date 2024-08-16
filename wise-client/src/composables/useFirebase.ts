import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAnalytics, logEvent, setUserProperties, CustomParams } from "firebase/analytics";
import { getFirestore, DocumentReference, WhereFilterOp, QueryConstraint, OrderByDirection } from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { 
    getAuth, 
    onAuthStateChanged, 
    FacebookAuthProvider,
    GoogleAuthProvider, 
    signInWithRedirect, 
    getRedirectResult, 
    signOut, 
    updateProfile,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    updateEmail,
    sendPasswordResetEmail 
} from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, getBlob } from "firebase/storage";
import { ref } from 'vue'
import { 
    collection, 
    setDoc,
    addDoc, 
    getDoc,
    getDocs,
    deleteDoc, 
    doc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    limit, 
    startAfter
} from "firebase/firestore"; 

export type UserInfo = {
    id: string,
    displayName: string,
    email: string,
    photoURL: string
}

var firebaseApp: FirebaseApp | null = null;
const user = ref<UserInfo | null>(null);
const userId = ref<string | null>(null);

export default function useFirebase() {

    const initialize = (config: FirebaseOptions) => {
        firebaseApp = initializeApp(config);

        const auth = getFirebaseAuth();

        if (auth == null)
        {
            return;
        }

        onAuthStateChanged(auth, async(fbuser) => {
          setUser();
        });

        getRedirectResult(auth);
    }

    const setUser = () => {
        const auth = getFirebaseAuth();

        if (auth == null)
        {
            return;
        }

        if (auth.currentUser)
        {
            userId.value = auth.currentUser.uid;
            user.value = {
                id: auth.currentUser.uid,
                displayName: auth.currentUser?.displayName ?? "",
                email: auth.currentUser?.email ?? "",
                photoURL: auth.currentUser?.photoURL ?? ""
            }
        }
        else
        {
            userId.value = null;
            user.value = null;
        }
    }

    const updateProfileInfo = async(email: string | null, displayName: string, photo?: Blob) => {
        const auth = getFirebaseAuth();

        if (auth == null)
        {
            return;
        }

        if (auth.currentUser == null)
        {
            return;
        }

        if (email != null)
        {
            await updateEmail(auth.currentUser, email);
        }

        await updateProfile(auth.currentUser, { displayName: displayName });

        if (photo != null)
        {
            await setProfilePhoto(photo);     
        }

        setUser();
    };

    const setProfilePhoto = async(photo: Blob) => {
        if (firebaseApp == null || userId.value == null)
        {
            return;
        }

        const storage = getStorage(firebaseApp);
        const auth = getFirebaseAuth();

        if (auth == null)
        {
            return;
        }

        if (auth.currentUser == null)
        {
            return;
        }

        const sRef = storageRef(storage, 'profile-photos/' + userId.value);

        await uploadBytes(sRef, photo, {
            contentType: photo.type
        });

        const downloadurl = await getDownloadURL(sRef);

        await updateProfile(auth.currentUser, {
            photoURL: downloadurl
        });

        setUser();
    }

    const sendPasswordReset = async(email: string) => {
        const auth = getFirebaseAuth();

        if (auth == null)
        {
            return;
        }

        await sendPasswordResetEmail(auth, email);
    }

    const signInWithEmailPassword = async(email: string, password: string) => {
        const auth = getFirebaseAuth();

        if (auth == null)
        {
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            return {
                success: true,
                message: "Success!"
            };
            // Perform additional tasks after successful sign-in
        } catch (error: any) {
            // Handle specific error codes for "account doesn't exist" and "wrong password"
            switch (error.code) {
                case 'auth/user-not-found':
                    return {
                        success: false,
                        message: "Account does not exist, but it'd sure be cool if it did...Sign up now!"
                    };
                case 'auth/wrong-password':
                    return {
                        success: false,
                        message: "Incorrect password. Be gone, hacker!"
                    };
                default:
                    return {
                        success: false,
                        message: error.message
                    };
            }
        }
    }

    const signUpWithEmailPassword = async(email: string, password: string, displayName: string, photo?: Blob) => {
        const auth = getFirebaseAuth();

        if (auth == null)
        {
            return;
        }
        
        try {
            await createUserWithEmailAndPassword(auth, email, password);

            await updateProfileInfo(null, displayName, photo);

            return {
                success: true,
                message: "Success!"
            };
        } catch (error: any) {
            // Handle specific error codes for "account doesn't exist" and "wrong password"
            switch (error.code) {
                case 'auth/email-already-in-use':
                    return {
                        success: false,
                        message: "Bruh, you already have an account with this email. Sign in instead!"
                    };
                default:
                    return {
                        success: false,
                        message: error.message
                    };
            }
        }
    }

    const signInWithFacebook = async() => {
        const auth = getFirebaseAuth();

        if (auth == null)
        {
            return;
        }

        const provider = new FacebookAuthProvider();
        await signInWithRedirect(auth, provider);
    }

    const signInWithGoogle = async() => {
        const auth = getFirebaseAuth();

        if (auth == null)
        {
            return;
        }

        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    }
    
    const signUserOut = async() => {
        const auth = getFirebaseAuth();
        if (auth == null)
        {
            return;
        }

        await signOut(auth);
    }

    const getFirebaseAuth = () => {
        if (firebaseApp == null)
        {
            return;
        }

        return getAuth(firebaseApp);
    }

    // ---ANALYTICS---

    const logAnalyticsEvent = (event: string, data: any) => {
        const analytics = getAnalytics();
        logEvent(analytics, event, data);
    }

    const setAnalyticsUserProperties = (properties: CustomParams) => {
        const analytics = getAnalytics();
        setUserProperties(analytics, properties);
    }

    //---FIRESTORE---

    const getDocument = async(coll: string, docId: string) => {
        const db = getFirestore();
        const docSnap = await getDoc(doc(db, coll, docId));
        return docSnap.data();
    }

    const setDocument = async(coll: string, document: any) => {
        const db = getFirestore();
        if (document.id != null)
        {
            var documentCopy = JSON.parse(JSON.stringify(document));
            var id = document.id;
            delete documentCopy.id;
            await setDoc(doc(db, coll, id), documentCopy);
        }
        else
        {
            await addDoc(collection(db, coll), document);
        }
    }

    const deleteDocument = async(coll: string, id: string) => {
        const db = getFirestore();
        await deleteDoc(doc(db, coll, id));
    }

    const collectionSubscribe = (coll: string, 
        filters: [{ field: string, operator: WhereFilterOp, value: string}], 
        pagination: { limit: number, after: number }, order: { field: string, direction: OrderByDirection}, callback: Function) => {
        const db = getFirestore();
        const whereStatements: QueryConstraint[] = filters.map(f => {
            return where(f.field, f.operator, f.value)
        });

        if (pagination != null && pagination.limit > 0)
        {
            whereStatements.push(limit(pagination.limit));

            if (pagination.after > -1)
            {
                whereStatements.push(startAfter(pagination.after));
            }
        }

        if (order != null)
        {
            whereStatements.push(orderBy(order.field, order.direction));
        }

        const q = query(collection(db, coll), ...whereStatements);

        return onSnapshot(q, (querySnapshot) => {
            const dataArr: any[] = [];
            querySnapshot.forEach((doc) => {
                dataArr.push({...doc.data(), id: doc.id})
            });
            callback(dataArr);
        });
    }

    const documentSubscribe = (coll: string, docid: string, callback: Function) => {
        const db = getFirestore();

        return onSnapshot(doc(db, coll, docid), (doc) => {
            if (doc.exists())
            {
                callback({...doc.data(), id: doc.id});
            }
            else
            {
                callback(null);
            }
        });
    }

    const getDocuments = async(coll: string,  
        filters: [{ field: string, operator: WhereFilterOp, value: string}], 
        pagination: { limit: number, after: number }, 
        order: { field: string, direction: OrderByDirection}) => {
        const db = getFirestore();
        const whereStatements: QueryConstraint[] = filters.map(f => {
            return where(f.field, f.operator, f.value)
        });

        if (pagination != null && pagination.limit > 0)
        {
            whereStatements.push(limit(pagination.limit));

            if (pagination.after > -1)
            {
                whereStatements.push(startAfter(pagination.after));
            }
        }

        if (order != null)
        {
            whereStatements.push(orderBy(order.field, order.direction));
        }

        const q = query(collection(db, coll), ...whereStatements);

        const querySnapshot = await getDocs(q);
        const dataArr: any[] = [];
        querySnapshot.forEach((doc) => {
            dataArr.push({...doc.data(), id: doc.id})
        });

        return dataArr;
    }

    //---FUNCTIONS---

    const callFunction: any = async(fname: string, data: any) => {
        try {
            const functions = getFunctions();
            const func = httpsCallable(functions, fname);
            const result = await func(data);
            return result.data;
        } catch (err) {
            console.log(err);
            return {
                err: err
            }
        }
    }

    //---STORAGE---

    const getFileDownloadUrl = async(path: string) => {
        const storage = getStorage();
        const ref = storageRef(storage, path);
        return await getDownloadURL(ref);
    }

    return {
        user,
        userId,
        initialize,
        getFirebaseAuth,
        logAnalyticsEvent,
        setAnalyticsUserProperties,
        getDocument,
        getDocuments,
        setDocument,
        deleteDocument,
        collectionSubscribe,
        documentSubscribe,
        callFunction,
        signInWithEmailPassword,
        signUpWithEmailPassword,
        sendPasswordReset,
        signUserOut,
        signInWithGoogle,
        signInWithFacebook,
        setProfilePhoto,
        updateProfileInfo,
        getFileDownloadUrl
    }
}