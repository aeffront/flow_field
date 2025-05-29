// Your Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyA8RHWFk-cdw_Wci4p4PvSkkw59BLHaGzE",
      databaseURL: "https://crea-2b134-default-rtdb.europe-west1.firebasedatabase.app/",
      projectId: "crea-2b134",
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // ✅ Real-time listeners
    const buttons = ['button1', 'button2', 'button3', 'button4', 'button5'];

    buttons.forEach(button => {
      const buttonRef = database.ref(button);
      buttonRef.on('value', (snapshot) => {
        const value = snapshot.val();
        console.log(`Realtime update → ${button}: ${value}`);
        // You can update the UI here if needed
        console.log(`Button ${button} pressed: ${value}`);
        if(value == true) {
         window.dispatchEvent(new CustomEvent('buttonPressed', { detail: button }));
        }
      });
    });