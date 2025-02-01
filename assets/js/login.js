

// Konfigurasi Firebase bisa dilihat di icon gear-> Project Setting
const firebaseConfig = {
  apiKey: "AIzaSyBdSkkP9_REoiETr511VoNXPnAmdrRBwKw",
  authDomain: "monitoring-294c3.firebaseapp.com",
  databaseURL: "https://monitoring-294c3-default-rtdb.firebaseio.com",
  projectId: "monitoring-294c3",
  storageBucket: "monitoring-294c3.appspot.com",
  messagingSenderId: "492002379636",
  appId: "1:492002379636:web:bbe14904a989e0431e4e21"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Import Library / Package firebase "firebase database"
var database = firebase.database();

// Import Library / Package firebase "firebase auth (Authentication)"
const auth = firebase.auth();

// pada program dibawah ini menunjukkan ketika form button di submit dihalaman login dengan button type submit pada 
// form id yang di beri nama loginform terdapat pada tag element halaman <form id="loginForm"></from> 
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    //mendapatkan nilai dari value dari field email dan password menggunakan "id" di setiap element input 
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    //perkondisian pengecekan dimana field email / field password tidak ada isi atau kosong 
    if (email.trim() === "" || password === "") { 
      //jika field password dan field email kosong maka akan menjalankan sebuah pop up screen notifikasi 
      // menggunakan Sweetalert "Harus dicantumkan link CDN dihalaman login"
      Swal.fire({      
        icon: "error",
        title: "Please fill in the email and password.",
        text: "Please check your email and password and try again",
      });
      //mengembalikan nilai true dan akan melakukan proses selanjutnya yaitu check user dengan database firebase
      return;
    }

    // Login dengan Firebase Authentication
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password) // signInWithEmailAndPassword bukan lah sebuah variable buatan sendiri
      .then(function (userCredential) {            // melainkan sebuah variable yang telah dibuat oleh firebase untuk menggunakan          
                                                   // email dan password (bukan email google) 
        Swal.fire({                                //popup notifikasi menggunakan sweet alert sleengkapnya bisa dilihat di webnya
          position: "center", 
          icon: "success",
          title: "Login Success",
          showConfirmButton: false,
        });

        setTimeout(function () {                    // memberi jeda selama 1000ms 
          window.location.href = "index.html";      // kepada user perpindahan dari halaman login.html menuju index html
        }, 1000);
      })

      // Ketika ada .then pasti ada .catch yang mana ca
      .catch(function (error) {
        // Login failed, display error message
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode === "auth/wrong-password") {
          Swal.fire({
            icon: "error",
            title: "Wrong password",
            text: "Please check your password and try again",
          });
        } else if (errorCode === "auth/internal-error") {
          Swal.fire({
            icon: "error",
            title: "User not found",
            text: "Please check your email and try again",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage,
          });
        }
      });

      //.then() digunakan untuk menentukan apa yang harus dilakukan setelah Promise terpenuhi (resolved). 
      // Fungsi yang diberikan ke .then() akan menerima hasil dari Promise jika berhasil.
      
      //.catch() digunakan untuk menangkap kesalahan jika Promise ditolak (rejected). 
      //Ini adalah cara untuk menangani error yang mungkin terjadi dalam promise atau dalam salah satu .then() yang mendahuluinya.

    function getErrorMessage(errorCode) {
      var errorMessage = "";
      switch (errorCode) {
        case "auth/internal-error":
          errorMessage = "User not found. check your email and try again.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many unsuccessful login attempts. Please try again later.";
          break;
        default:
          errorMessage =
            "An error occurred during login. Please try again later.";
          break;
      }

      return errorMessage;
    }
  });

  
