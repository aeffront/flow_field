// Import the required Firebase functions
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, update } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8RHWFk-cdw_Wci4p4PvSkkw59BLHaGzE",
  databaseURL: "https://crea-2b134-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "crea-2b134", // NOTE: Fixed typo here ("Ycrea" → "crea")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Set `button1` to false at the beginning
update(ref(database), {
  button1: false
}).then(() => {
  console.log("button1 set to false");
}).catch((error) => {
  console.error("Error updating button1:", error);
});

// Keydown event to set button to true
document.addEventListener("keydown", function(event) {
  const keyToButton = {
    'a': 'button1',
    'z': 'button2',
    'e': 'button3',
    'r': 'button4',
    't': 'button5'
  };

  const button = keyToButton[event.key];
  if (button) {
    const buttonRef = ref(database, button);
    set(buttonRef, true).then(() => {
      console.log(`${button} set to true`);
    }).catch((error) => {
      console.error(`Error updating ${button}:`, error);
    });
  }
});

// Keyup event to set button to false
document.addEventListener("keyup", function(event) {
  const keyToButton = {
    'a': 'button1',
    'z': 'button2',
    'e': 'button3',
    'r': 'button4',
    't': 'button5'
  };

  const button = keyToButton[event.key];
  if (button) {
    const buttonRef = ref(database, button);
    set(buttonRef, false).then(() => {
      console.log(`${button} set to false`);
    }).catch((error) => {
      console.error(`Error updating ${button}:`, error);
    });
  }
});
