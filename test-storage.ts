import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function test() {
  try {
    const testRef = ref(storage, 'test.txt');
    const blob = new Blob(['test'], { type: 'text/plain' });
    await uploadBytes(testRef, blob);
    console.log('Upload successful');
  } catch (e) {
    console.error('Upload failed:', e);
  }
}
test();
