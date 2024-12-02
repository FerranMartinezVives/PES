import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, child } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyBhiPTKAfrr8bsomOc9rHeQzE4NBtwRpD0',
  authDomain: 'greenovation-6743e.firebaseapp.com',
  databaseURL: 'https://greenovation-6743e-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'greenovation-6743e',
  storageBucket: 'greenovation-6743e.appspot.com',
  messagingSenderId: '233656127943',
  appId: '1:233656127943:web:ad617cf6159ec7007e89e2',
  measurementId: 'G-L98BMS8JVE'
}

export const _ = initializeApp(firebaseConfig)
const db = getDatabase()
const dbRef = ref(db)

export const saveToken = async (userId: string, token: string): Promise<void> => {
  const values = (await get(child(dbRef, `userTokens/${userId}/`))).val() ?? {}
  const payload = { ...values, token }
  await set(ref(db, `userTokens/${userId}/`), payload)
}

export const getToken = async (userId: string): Promise<any> => {
  const values = (await get(child(dbRef, `userTokens/${userId}`))).val()
  return values ?? {}
}
