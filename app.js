// Firebase Config
const firebaseConfig = {
    apiKey: "69d0dfef34670e4f045bcad4aecb146f",
    authDomain: "raharjo-motor-tuban.firebaseapp.com",
    projectId: "raharjo-motor-tuban",
    storageBucket: "raharjo-motor-tuban.appspot.com",
    messagingSenderId: "392547240984",
    appId: "1:392547240984:web:8c7ec5f0b25225a066c76d"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Form Tambah
const form = document.getElementById("motorForm");
const list = document.getElementById("motorList");

// UPLOAD GAMBAR → STORAGE
async function uploadImage(file) {
    const filename = Date.now() + "_" + file.name;
    const ref = storage.ref("motor/" + filename);
    await ref.put(file);
    return await ref.getDownloadURL();
}

// SIMPAN MOTOR
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama").value;
    const harga = document.getElementById("harga").value;
    const tahun = document.getElementById("tahun").value;
    const wa = document.getElementById("wa").value;
    const file = document.getElementById("gambar").files[0];

    if (!file) {
        alert("Upload gambar dulu!");
        return;
    }

    const imageUrl = await uploadImage(file);

    await db.collection("motor").add({
        nama,
        harga,
        tahun,
        wa,
        imageUrl,
        createdAt: Date.now()
    });

    form.reset();
});

// TAMPILKAN LIST MOTOR
function loadMotor() {
    db.collection("motor").orderBy("createdAt", "desc").onSnapshot((res) => {
        list.innerHTML = "";
        res.forEach((doc) => {
            const data = doc.data();
            list.innerHTML += `
                <div class="item">
                    <img src="${data.imageUrl}" alt="${data.nama}" />
                    <h3>${data.nama}</h3>
                    <p>Harga: ${data.harga}</p>
                    <p>Tahun: ${data.tahun}</p>
                    <p>WA: ${data.wa}</p>

                    <button onclick="editMotor('${doc.id}')">Edit</button>
                    <button onclick="deleteMotor('${doc.id}', '${data.imageUrl}')">Hapus</button>
                </div>
            `;
        });
    });
}
loadMotor();

// EDIT MOTOR
function editMotor(id) {
    const newNama = prompt("Nama baru:");
    const newHarga = prompt("Harga baru:");
    const newTahun = prompt("Tahun baru:");
    const newWa = prompt("Nomor WA baru:");

    db.collection("motor").doc(id).update({
        nama: newNama,
        harga: newHarga,
        tahun: newTahun,
        wa: newWa
    });
}

// HAPUS MOTOR + HAPUS GAMBAR STORAGE
async function deleteMotor(id, imageUrl) {
    if (!confirm("Yakin hapus?")) return;

    await db.collection("motor").doc(id).delete();

    const pictureRef = storage.refFromURL(imageUrl);
    await pictureRef.delete();
}
