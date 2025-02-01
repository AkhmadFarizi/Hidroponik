const firebaseConfig = {
  apiKey: "AIzaSyBdSkkP9_REoiETr511VoNXPnAmdrRBwKw",
  authDomain: "monitoring-294c3.firebaseapp.com",
  databaseURL: "https://monitoring-294c3-default-rtdb.firebaseio.com",
  projectId: "monitoring-294c3",
  storageBucket: "monitoring-294c3.appspot.com",
  messagingSenderId: "492002379636",
  appId: "1:492002379636:web:bbe14904a989e0431e4e21",
};
var logoutButton = document.getElementById("logoutButton");

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Import Library / Package firebase "firebase database"
var database = firebase.database();

// Import Library / Package firebase "firebase auth (Authentication)"
const auth = firebase.auth();

// Sebuah function authenticatian dan pengecekan status authetication dengan paramenter user
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    document.getElementById("username").textContent = user.email;
    var DBPathMonitoring = "/MONITORING";
    var RefDBMonitoring = firebase.database().ref(DBPathMonitoring);

   

    const interval = 1000; // 1 detik
    function fetchData() {
      RefDBMonitoring.on("value", (snapshot) => {
        const jsonData = snapshot.val();

        if (jsonData != null) {
          document.getElementById("loadingOverlay").style.display = "none";
          setTimeout(function () {
            document.getElementById("loadingOverlay").style.display = "none";
          }, 1000);
        } else {
          document.getElementById("loadingOverlay").style.display = "flex";
          setTimeout(function () {
            document.getElementById("loadingOverlay").style.display = "none";
          }, 1000);
        }
        var TDS = Number(jsonData.TDS).toFixed(2);
        var pH = jsonData.pH;

        document.getElementById("pH").textContent = pH + "    pph";
        document.getElementById("TDS").textContent = TDS + "    ";
      });
    }
    setInterval(fetchData, interval);

    var DBPathKontrol = "/KONTROL";
    var RefDBKontrol = firebase.database().ref(DBPathKontrol);

    RefDBKontrol.on("value", (snapshot)=>{
      const jsonData = snapshot.val();
      var setTDS = jsonData.SetTDS;
      var setpH = jsonData.SetpH;
      
      document.getElementById("pHInput").value = setpH;
      document.getElementById("TDSInput").value = setTDS;

    });



    document.getElementById("pHForm").addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent form from refreshing the page
      const pHValue = parseInt(document.getElementById("pHInput").value); // Convert to integer
  
      // Show confirmation alert
      Swal.fire({
          title: 'Are you sure?',
          text: `You are about to set the pH value to ${pHValue}.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, set it!',
          cancelButtonText: 'Cancel'
      }).then((result) => {
          if (result.isConfirmed) {
              // Proceed with setting the pH value in the database
              firebase.database().ref("KONTROL/SetpH").set(pHValue).then(() => {
                  Swal.fire({
                      icon: 'success',
                      title: 'pH Updated!',
                      text: `pH value has been set to ${pHValue}`,
                      confirmButtonText: 'OK'
                  });
              }).catch(error => {
                  Swal.fire({
                      icon: 'error',
                      title: 'Error!',
                      text: `There was an error setting the pH value: ${error.message}`,
                      confirmButtonText: 'OK'
                  });
              });
          }
      });
    });
    
    document.getElementById("TDSForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form from refreshing the page
        const TDSValue = parseInt(document.getElementById("TDSInput").value); // Convert to integer
    
        // Show confirmation alert
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to set the TDS value to ${TDSValue}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, set it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Proceed with setting the TDS value in the database
                firebase.database().ref("KONTROL/SetTDS").set(TDSValue).then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'TDS Updated!',
                        text: `TDS value has been set to ${TDSValue}`,
                        confirmButtonText: 'OK'
                    });
                }).catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: `There was an error setting the TDS value: ${error.message}`,
                        confirmButtonText: 'OK'
                    });
                });
            }
        });
    });
  



    logoutButton.addEventListener("click", logout); // Menambahkan event listener ke tombol logout
  } else {
    // Pengguna tidak sedang login, alihkan ke halaman login

    window.location.href = "Login.html";
  }
});

//function logout ini berfungsi untuk melakukan clear session fungsi pada logopout ini firebase.auth.singout
function logout() {
  Swal.fire({
    position: "center",

    icon: "warning",

    title: "You want to logout?",

    showConfirmButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        position: "center",

        icon: "success",

        title: "Logout Success",

        showConfirmButton: false,
      });

      setTimeout(function () {
        document.getElementById("loadingOverlay").style.display = "flex";
        setTimeout(function () {
          document.getElementById("loadingOverlay").style.display = "none";
        }, 1000);
        firebase
          .auth()
          .signOut()
          .then(function () {
            window.location.href = "login.html"; // Mengalihkan pengguna ke halaman login setelah jeda 1000ms (1 detik)

            console.log("User logged out");
          })
          .catch(function (error) {
            // Logout gagal

            console.error("Logout error:", error);

            Swal.fire({
              position: "center",

              icon: "error",

              title: "Logout Failed",

              text: error.message, // Menampilkan pesan kesalahan firebase (jika ada)
            });
          });
      }, 1000); // Jeda 1000ms (1 detik) sebelum mengarahkan ke halaman login
    }
  });
}
