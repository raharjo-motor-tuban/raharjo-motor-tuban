// Init Firestore
const db = firebase.firestore();

const form = document.getElementById("uploadForm");
const productList = document.getElementById("product-list");

// === API KEY IMGBB ===
const imgbbApiKey = "1eb67c17f3cca1e60e3ee481ab5d205e";

// ================== UPLOAD MOTOR ==================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageFile = document.getElementById("image").files[0];
    if (!imageFile) return alert("Upload foto dulu!");

    // Upload ke ImgBB
    const formData = new FormData();
    formData.append("image", imageFile);

    const uploadUrl = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`;
    const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.success) {
        console.error(uploadResult);
        alert("Gagal upload gambar ke ImgBB!");
        return;
    }

    const imageUrl = uploadResult.data.url;

    // Ambil data lain
    const data = {
        brand: document.getElementById("brand").value,
        year: document.getElementById("year").value,
        km: document.getElementById("km").value,
        condition: document.getElementById("condition").value,
        price: document.getElementById("price").value,
        desc: document.getElementById("desc").value,
        sellerPhone: document.getElementById("sellerPhone").value,
        imageUrl: imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("motor").add(data);

    alert("Motor berhasil diupload!");
    form.reset();
});

// ================== LOAD PRODUK ==================
function loadProducts() {
    db.collection("motor").orderBy("createdAt", "desc").onSnapshot((snap) => {
        productList.innerHTML = "";
        snap.forEach((doc) => {
            const d = doc.data();

            const card = `
    <div class="card">
        <img src="${d.imageUrl}" alt="motor">
        <h3>${d.brand} (${d.year})</h3>
        <p>KM: ${d.km}</p>
        <p>Kondisi: ${d.condition}</p>
        <p>Harga: Rp ${d.price}</p>
        <p>${d.desc}</p>

        <a class="btn-wa" href="https://wa.me/${d.sellerPhone}?text=Halo,%20saya%20ingin%20tanya%20motor%20${d.brand}" target="_blank">
            Hubungi via WhatsApp
        </a>

        <div style="display:flex; gap:8px; margin:10px;">
            <button class="editBtn" data-id="${doc.id}">Edit</button>
            <button class="deleteBtn" data-id="${doc.id}" style="background:#d90429;">Hapus</button>
        </div>
    </div>
            `;

            productList.innerHTML += card;
        });
    });
}

loadProducts();

// ================== EDIT & HAPUS ==================
let currentEditId = null;

// Hapus motor
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("deleteBtn")) {
        const id = e.target.dataset.id;
        if (confirm("Yakin ingin menghapus motor ini?")) {
            await db.collection("motor").doc(id).delete();
            alert("Motor berhasil dihapus!");
        }
    }
});

// Edit motor
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("editBtn")) {
        const id = e.target.dataset.id;
        currentEditId = id;

        const docData = await db.collection("motor").doc(id).get();
        const d = docData.data();

        // Isi form upload dengan data lama (bisa diedit)
        document.getElementById("brand").value = d.brand;
        document.getElementById("year").value = d.year;
        document.getElementById("km").value = d.km;
        document.getElementById("condition").value = d.condition;
        document.getElementById("price").value = d.price;
        document.getElementById("desc").value = d.desc;
        document.getElementById("sellerPhone").value = d.sellerPhone;

        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert("Edit data motor, lalu klik tombol Upload untuk menyimpan perubahan.");

        // Override form submit untuk edit
        form.onsubmit = async (event) => {
            event.preventDefault();

            let imageUrl = d.imageUrl;
            const imageFile = document.getElementById("image").files[0];

            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);

                const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                    method: "POST",
                    body: formData
                });

                const uploadResult = await uploadResponse.json();
                if (!uploadResult.success) {
                    console.error(uploadResult);
                    alert("Gagal upload gambar ke ImgBB!");
                    return;
                }
                imageUrl = uploadResult.data.url;
            }

            // Update Firestore
            await db.collection("motor").doc(currentEditId).update({
                brand: document.getElementById("brand").value,
                year: document.getElementById("year").value,
                km: document.getElementById("km").value,
                condition: document.getElementById("condition").value,
                price: document.getElementById("price").value,
                desc: document.getElementById("desc").value,
                sellerPhone: document.getElementById("sellerPhone").value,
                imageUrl: imageUrl
            });

            alert("Motor berhasil diperbarui!");
            form.reset();
            form.onsubmit = null; // reset ke upload normal
        };
    }
});
