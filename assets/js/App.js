// convert epochtime to JavaScripte Date object
function epochToJsDate(epochTime) {
  return new Date(epochTime * 1000);
}

// convert time to human-readable format YYYY/MM/DD HH:MM:SS
function epochToDateTime(epochTime) {
  var epochDate = new Date(epochToJsDate(epochTime));

  var dateTime =
    epochDate.getDate() +
    "/" +
    ("00" + (epochDate.getMonth() + 1)).slice(-2) +
    "/" +
    ("00" + epochDate.getFullYear()).slice(-4) +
    " " +
    ("00" + epochDate.getHours()).slice(-2) +
    ":" +
    ("00" + epochDate.getMinutes()).slice(-2) +
    ":" +
    ("00" + epochDate.getSeconds()).slice(-2);

  return dateTime;
}

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


        var Arus = Number(jsonData.ARUS).toFixed(2);
        var Hum = jsonData.Hum;
        var TDS = Number(jsonData.TDS).toFixed(2);
        var Temp = jsonData.Temp;
        var TempAir = jsonData.TempAIR;
        var Voltage = Number(jsonData.VOLTAGE).toFixed(2);
        var pH = jsonData.pH;
        


        document.getElementById("Temperature").textContent = Temp + "    %";
        document.getElementById("PersentageTemperature").style.width = Temp + "%";

        document.getElementById("TemperatureAir").textContent = TempAir + "    %";
        document.getElementById("PersentageTemperatureAir").style.width = TempAir + "%";

        document.getElementById("Humidity").textContent = Hum + "    %";
        document.getElementById("PersentageHumidity").style.width = Hum + "%";

        document.getElementById("pH").textContent = pH + "    pph";
        document.getElementById("TDS").textContent =  TDS + "    ";
        document.getElementById("ARUS").textContent = Arus + "    A"; 
        document.getElementById("Voltage").textContent = Voltage + "    A"; 
        

        


        


        console.log(jsonData);
        
      })
    }
    setInterval(fetchData, interval);

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
