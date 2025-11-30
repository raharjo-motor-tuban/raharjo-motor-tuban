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
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadUrl = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`;
        const response = await fetch(uploadUrl, { method: "POST", body: formData });
        const result = await response.json();

        // 🔥 tampilkan data mentah ImgBB di layar HP
        alert("DEBUG IMG DATA:\n\n" + JSON.stringify(result, null, 2));

        if (!result.success) return alert("Gagal upload foto ke ImgBB!");

        // sementara pakai apa saja, nanti saya cek dari JSON yang kamu kirim
        const imageUrl = result.data.url || result.data.display_url || result.data.image?.url;

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

        await db.collection("motor").add(data);
        alert("Motor berhasil di-upload!");

        form.reset();

    } catch (err) {
        alert("ERROR:\n" + err);
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
                    target="_blank">Hubungi via WA</a>
            `;

            productList.appendChild(card);
        });
    });
}

loadProducts();
