const firebaseConfig = {
  apiKey: "AIzaSyAvrrQOW_D_wIrXKk8PaFHnbBmVxqY7sr8",
  authDomain: "hydroponic-9dad9.firebaseapp.com",
  databaseURL: "https://hydroponic-9dad9-default-rtdb.firebaseio.com",
  projectId: "hydroponic-9dad9",
  storageBucket: "hydroponic-9dad9.firebasestorage.app",
  messagingSenderId: "789295709091",
  appId: "1:789295709091:web:fd6e615f83dafec9c27816",
  measurementId: "G-KTKX1BKF6R"
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

        document.getElementById("pH").textContent = pH + "    ";
        document.getElementById("TDS").textContent = TDS + "   ppm";
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


    var RefStatus = firebase.database().ref("KONTROL/MODE");
    var KontrolCheckbox = document.getElementById("Kontrol");
    KontrolCheckbox.addEventListener("change", function () {
      RefStatus.set(KontrolCheckbox.checked ? 1 : 0);
    });

    RefStatus.on("value", function (snapshot) {
      var value = snapshot.val();
      document.getElementById("Kontrol").checked = value === 1;
      console.log(value);
      if (value == 1) {
        document.getElementById("WaterpumpCheckbox").disabled = true;
        document.getElementById("start-time").disabled = false;
        document.getElementById("end-time").disabled = false;
        document.getElementById("save-btn").disabled = false;
        firebase.database().ref("KONTROL/Waterpump").set(0);
      }
      else{
        document.getElementById("save-btn").disabled = true;
        document.getElementById("start-time").disabled = true;
        document.getElementById("end-time").disabled = true;
        document.getElementById("WaterpumpCheckbox").disabled = false;
        document.getElementById("WaterpumpCheckbox").disabled = false;
      }
    });

    var RefPWaterpump = firebase.database().ref("KONTROL/Waterpump");
    var WaterpumpCheckbox = document.getElementById("WaterpumpCheckbox");
    WaterpumpCheckbox.addEventListener("change", function () {
      RefPWaterpump.set(WaterpumpCheckbox.checked ? 1 : 0);
    });
    RefPWaterpump.on("value", function (snapshot) {
      var value = snapshot.val();
      document.getElementById("WaterpumpCheckbox").checked = value === 1;
      document.getElementById("StatusWaterpump").textContent =
        value === 1 ? "ON" : "OFF";
    });

    var TimeRef = firebase.database().ref("KONTROL");
    TimeRef.on("value", function (snapshot) {
      // Get the latest value from the database

      var datajadwal = snapshot.val();
      

      document.getElementById("start-time").value = datajadwal.Start_time;
      document.getElementById("end-time").value = datajadwal.End_time;
    });

    
    

    document.getElementById("save-btn").addEventListener("click", function() {
      var Start_time = document.getElementById("start-time").value;
      var End_time = document.getElementById("end-time").value;
   
      // Menampilkan konfirmasi SweetAlert
      Swal.fire({
         icon: 'question',
         title: 'Apakah Anda yakin?',
         text: 'Anda akan menyimpan data Start Time dan End Time ke Firebase.',
         showCancelButton: true,
         confirmButtonText: 'Ya, Simpan',
         cancelButtonText: 'Batal',
      }).then((result) => {
         if (result.isConfirmed) {
            // Jika pengguna memilih 'Ya, Simpan'
            firebase.database().ref("KONTROL/Start_time").set(Start_time);
            firebase.database().ref("KONTROL/End_time").set(End_time);
   
            var timeArray = Start_time.split(":");
            var hour = parseInt(timeArray[0]);
            var minute = parseInt(timeArray[1]);
   
            var timeArray2 = End_time.split(":");
            var hour2 = parseInt(timeArray2[0]);
            var minute2 = parseInt(timeArray2[1]);
   
            firebase.database().ref("KONTROL/Jam_Mulai").set(hour);
            firebase.database().ref("KONTROL/Menit_Mulai").set(minute);
   
            firebase.database().ref("KONTROL/Jam_Selesai").set(hour2);
            firebase.database().ref("KONTROL/Menit_Selesai").set(minute2);
   
            // Tampilkan konfirmasi bahwa data berhasil disimpan
            Swal.fire({
               icon: 'success',
               title: 'Data berhasil disimpan!',
               text: 'Start Time dan End Time telah berhasil disimpan ke Firebase.',
               confirmButtonText: 'OK'
            });
         } else {
            // Jika pengguna memilih 'Batal'
            Swal.fire({
               icon: 'info',
               title: 'Proses dibatalkan',
               text: 'Data tidak disimpan.',
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
