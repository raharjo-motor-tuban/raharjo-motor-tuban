// Init Firestore
const db = firebase.firestore();

const form = document.getElementById("uploadForm");
const productList = document.getElementById("product-list");

// API Key ImgBB
const imgbbApiKey = "1eb67c17f3cca1e60e3ee481ab5d205e";

// Upload Motor
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageFile = document.getElementById("image").files[0];
    if (!imageFile) return alert("Upload foto dulu!");

    try {
        // Upload gambar ke ImgBB
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadUrl = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`;
        const response = await fetch(uploadUrl, { method: "POST", body: formData });
        const result = await response.json();

        if (!result.success) return alert("Gagal upload foto ke ImgBB!");

        // Pakai display_url (PERBAIKAN TERPENTING)
        const imageUrl = result.data.display_url;

        // Data motor
        const data = {
            brand: document.getElementById("brand").value,
            year: document.getElementById("year").value,
            km: document.getElementById("km").value,
            condition: document.getElementById("condition").value,
            price: parseInt(document.getElementById("price").value),
            desc: document.getElementById("desc").value,
            sellerPhone: document.getElementById("sellerPhone").value,
            imageUrl: imageUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Simpan ke Firestore
        await db.collection("motor").add(data);

        alert("Motor berhasil di-upload!");
        form.reset();

    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat upload.");
    }
});

// Load produk
function loadProducts() {
    db.collection("motor").orderBy("createdAt", "desc").onSnapshot((snap) => {
        productList.innerHTML = "";

        snap.forEach((doc) => {
            const d = doc.data();
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <img src="${d.imageUrl}" alt="motor">
                <h3>${d.brand} (${d.year})</h3>
                <p>KM: ${d.km}</p>
                <p>Kondisi: ${d.condition}</p>
                <p>Harga: Rp ${d.price.toLocaleString("id-ID")}</p>
                <p>${d.desc}</p>

                <a class="btn-wa" 
                    href="https://wa.me/${d.sellerPhone}?text=${encodeURIComponent(`Halo, saya ingin tanya motor ${d.brand}`)}"
                    target="_blank">
                    Hubungi via WhatsApp
                </a>

                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Hapus</button>
            `;

            productList.appendChild(card);

            // Tombol Edit
            card.querySelector(".edit-btn").addEventListener("click", async () => {
                const newBrand = prompt("Ubah Merek Motor:", d.brand);
                if (newBrand) {
                    await db.collection("motor").doc(doc.id).update({ brand: newBrand });
                }
            });

            // Tombol Hapus
            card.querySelector(".delete-btn").addEventListener("click", async () => {
                if (confirm("Yakin ingin menghapus motor ini?")) {
                    await db.collection("motor").doc(doc.id).delete();
                }
            });
        });
    });
}

loadProducts();
