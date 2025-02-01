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
  apiKey: "AIzaSyAvrrQOW_D_wIrXKk8PaFHnbBmVxqY7sr8",
  authDomain: "hydroponic-9dad9.firebaseapp.com",
  databaseURL: "https://hydroponic-9dad9-default-rtdb.firebaseio.com",
  projectId: "hydroponic-9dad9",
  storageBucket: "hydroponic-9dad9.firebasestorage.app",
  messagingSenderId: "789295709091",
  appId: "1:789295709091:web:fd6e615f83dafec9c27816",
  measurementId: "G-KTKX1BKF6R",
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
        


        document.getElementById("Temperature").textContent = Temp + "    °C";
        document.getElementById("PersentageTemperature").style.width = Temp + "%";

        document.getElementById("TemperatureAir").textContent = TempAir + "    °C";
        document.getElementById("PersentageTemperatureAir").style.width = TempAir + "%";

        document.getElementById("Humidity").textContent = Hum + "    %";
        document.getElementById("PersentageHumidity").style.width = Hum + "%";

        document.getElementById("pH").textContent = pH + "    ";
        document.getElementById("TDS").textContent =  TDS + "   ppm";
        document.getElementById("ARUS").textContent = Arus + "    A"; 
        document.getElementById("Voltage").textContent = Voltage + "    V"; 


        
        
      })
    }
    setInterval(fetchData, interval);

    const tanggalInput = document.getElementById("tanggalInput");

      var tanggalFormatted = "";

      tanggalInput.addEventListener("change", function () {
        const tanggal = new Date(tanggalInput.value);
        const dd = String(tanggal.getDate()).padStart(2, "0");
        const mm = String(tanggal.getMonth() + 1).padStart(2, "0");
        const yyyy = tanggal.getFullYear();
        tanggalFormatted = `${dd}-${mm}-${yyyy}`;
        firebase.database().ref("Data/Input/Date").set(tanggalFormatted);
        location.reload();
      });

      // Mendapatkan referensi ke database Firebase
      var database = firebase.database();

      // Path yang akan diambil datanya
      var refDBInput = database.ref("Data/Input/Date");

        refDBInput.on(
          "value",
          function (snapshot) {
            var data = snapshot.val();
            
            
            const [dd, mm, yyyy] = data.split("-");
            tanggalInput.value = `${yyyy}-${mm}-${dd}`;
    
            var DBPathLog = "history/" + `${dd}-${mm}-${yyyy}`;
            console.log(DBPathLog);
            var RefDBLog = firebase.database().ref(DBPathLog);
    
            function createTable() {
              RefDBLog.orderByKey()
                .limitToLast(1000)
                .on("child_added", function (snapshot) {
                  if (snapshot.exists()) {
                    var jsonData = snapshot.val(); // Mengambil data dari snapshot
                    var date = jsonData.Date;
                    var Arus = jsonData.ARUS;
                    var Hum = jsonData.Hum;
                    var TDS = jsonData.TDS;
                    var Temp = jsonData.Temp;
                    var TempAir = jsonData.TempAIR;
                    var Voltage =jsonData.VOLTAGE;
                    var pH = jsonData.pH;
    
                    // Mengambil referensi ke elemen tabel
                    var table = $("#data-table").DataTable();
     
                    // Menambahkan data baru ke dalam tabel
                    table.row
                      .add([
                        date,
                        Temp,
                        TempAir,
                        Hum,
                        pH,
                        TDS,
                        Arus,
                        Voltage,
                      ])
                      .draw();
                  }
                });
            }
    
            // Memanggil fungsi createTable untuk pertama kali
            createTable();
          },
          function (error) {
            console.error("Error mengambil data:", error);
          }
        );

        var table = $("#data-table").DataTable({
          responsive: true,
          order: [[0, "desc"]],
          // dom: 'Bfrtip', // Add this line to enable Buttons
          buttons: [
              {
                  extend: 'excelHtml5',
                  className: 'buttons-excel'
              },
              {
                  extend: 'csvHtml5',
                  className: 'buttons-csv'
              },
              {
                  extend: 'pdfHtml5',
                  className: 'buttons-pdf'
              },
              {
                  extend: 'print',
                  className: 'buttons-print'
              }
          ]
        });
    
        $("#btnExcel").on("click", function () {
          table.button(".buttons-excel").trigger();
          Swal.fire({
              position: "center",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
              title: "Ekspor Excel Berhasil",
              showConfirmButton: false,
          });
      });
      
      $("#btnCsv").on("click", function () {
          table.button(".buttons-csv").trigger();
          Swal.fire({
              position: "center",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
              title: "Ekspor CSV Berhasil",
              showConfirmButton: false,
          });
      });
      
      $("#btnPDF").on("click", function () {
          table.button(".buttons-pdf").trigger();
          Swal.fire({
              position: "center",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
              title: "Ekspor PDF Berhasil",
              showConfirmButton: false,
          });
      });
      
      $("#btnPrint").on("click", function () {
          table.button(".buttons-print").trigger();
      });

    logoutButton.addEventLisgeIntener("click", logout); // Menambahkan event listener ke tombol logout
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
