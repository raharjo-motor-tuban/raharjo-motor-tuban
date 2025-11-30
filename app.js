// ===============================
// CONFIG FIREBASE
// ===============================
const firebaseConfig = {
    apiKey: "AIzaSyASx1L6_KVL_S0XJfb5Oh3FwM0cOYTronQ",
    authDomain: "raharjo-motor-tuban.firebaseapp.com",
    projectId: "raharjo-motor-tuban",
    storageBucket: "raharjo-motor-tuban.firebasestorage.app",
    messagingSenderId: "392547240984",
    appId: "1:392547240984:web:8c7ec5f0b25225a066c76d",
    measurementId: "G-WBPLNJ4ZGT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===============================
// API KEY IMGBB
// ===============================
const imgbbKey = "69d0dfef34670e4f045bcad4aecb146f";

// ===============================
// FUNGSI UPLOAD GAMBAR KE IMGBB
// ===============================
async function uploadImage(file) {
    const form = new FormData();
    form.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: "POST",
        body: form
    });

    const result = await res.json();

    if (!result.success) {
        alert("Upload gambar gagal!");
        return null;
    }

    // FIX: URL YANG BENAR
    return result.data.image.url;
}

// ===============================
// SIMPAN DATA MOTOR
// ===============================
document.getElementById("formMotor").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama").value;
    const tahun = document.getElementById("tahun").value;
    const harga = document.getElementById("harga").value;
    const wa = document.getElementById("wa").value;
    const file = document.getElementById("foto").files[0];

    let imageUrl = "";

    // Upload gambar bila ada
    if (file) {
        imageUrl = await uploadImage(file);
        if (!imageUrl) return;
    }

    await db.collection("motor").add({
        nama,
        tahun,
        harga,
        wa,
        foto: imageUrl,
        waktu: Date.now()
    });

    alert("Motor berhasil ditambahkan!");
    document.getElementById("formMotor").reset();
    loadMotor();
});

// ===============================
// LOAD DATA MOTOR
// ===============================
async function loadMotor() {
    const list = document.getElementById("listMotor");
    list.innerHTML = "Loading...";

    const snapshot = await db.collection("motor")
        .orderBy("waktu", "desc")
        .get();

    list.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();

        list.innerHTML += `
            <div class="card">
                <img src="${data.foto}" class="fotoMotor"/>
                <h3>${data.nama}</h3>
                <p>Tahun: ${data.tahun}</p>
                <p>Harga: ${data.harga}</p>
                <p>WA: ${data.wa}</p>

                <button onclick="editMotor('${doc.id}')">EDIT</button>
                <button onclick="hapusMotor('${doc.id}')">HAPUS</button>
            </div>
        `;
    });
}

// ===============================
// HAPUS MOTOR
// ===============================
function hapusMotor(id) {
    if (!confirm("Yakin hapus?")) return;

    db.collection("motor").doc(id).delete();
    alert("Motor dihapus!");
    loadMotor();
}

// ===============================
// EDIT MOTOR
// ===============================
async function editMotor(id) {
    const doc = await db.collection("motor").doc(id).get();
    const data = doc.data();

    document.getElementById("nama").value = data.nama;
    document.getElementById("tahun").value = data.tahun;
    document.getElementById("harga").value = data.harga;
    document.getElementById("wa").value = data.wa;

    document.getElementById("simpanBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "block";

    document.getElementById("updateBtn").onclick = async () => {

        const file = document.getElementById("foto").files[0];
        let imageUrl = data.foto;

        if (file) {
            imageUrl = await uploadImage(file);
        }

        await db.collection("motor").doc(id).update({
            nama: document.getElementById("nama").value,
            tahun: document.getElementById("tahun").value,
            harga: document.getElementById("harga").value,
            wa: document.getElementById("wa").value,
            foto: imageUrl
        });

        alert("Data diperbarui!");
        location.reload();
    };
}

// ===============================
loadMotor();
