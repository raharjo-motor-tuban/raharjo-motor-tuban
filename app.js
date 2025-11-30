// =======================================
// PREVIEW FOTO
// =======================================
document.getElementById("image").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const preview = document.createElement("img");
        preview.src = URL.createObjectURL(file);
        preview.style.width = "100%";
        preview.style.borderRadius = "10px";
        preview.style.marginTop = "10px";

        const old = document.getElementById("previewImg");
        if (old) old.remove();

        preview.id = "previewImg";
        this.insertAdjacentElement("afterend", preview);
    }
});


// =======================================
// UPLOAD MOTOR
// =======================================
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = document.getElementById("image").files[0];
    if (!file) return alert("Pilih foto motor dulu!");

    const apiKey = "69d0dfef34670e4f045bcad4aecb146f";
    const form = new FormData();
    form.append("image", file);

    const upload = await fetch("https://api.imgbb.com/1/upload?key=" + apiKey, {
        method: "POST",
        body: form
    });

    const result = await upload.json();

    console.log(result); // DEBUG (biar kelihatan isi realnya)

    // gunakan display_url (paling stabil)
    const imageUrl = result?.data?.display_url;

    if (!imageUrl) {
        return alert("Gagal upload gambar!");
    }

    // Ambil data form
    const data = {
        brand: document.getElementById("brand").value,
        year: document.getElementById("year").value,
        km: document.getElementById("km").value,
        condition: document.getElementById("condition").value,
        price: document.getElementById("price").value,
        desc: document.getElementById("desc").value,
        sellerPhone: document.getElementById("sellerPhone").value,
        image: imageUrl,
        time: Date.now()
    };

    await db.collection("products").add(data);

    alert("Motor berhasil diupload!");
    location.reload();
});


// =======================================
// LIST MOTOR
// =======================================
db.collection("products")
    .orderBy("time", "desc")
    .onSnapshot((snap) => {
        const list = document.getElementById("product-list");
        list.innerHTML = "";

        snap.forEach((doc) => {
            const m = doc.data();

            list.innerHTML += `
                <div class="card">
                    <img src="${m.image}" style="width:100%;border-radius:10px;">
                    <h3>${m.brand} (${m.year})</h3>
                    <p><strong>KM:</strong> ${m.km}</p>
                    <p><strong>Kondisi:</strong> ${m.condition}</p>
                    <p><strong>Harga:</strong> Rp ${m.price}</p>
                    <p>${m.desc}</p>
                    <a href="https://wa.me/${m.sellerPhone}" class="btn-wa">Hubungi Penjual</a>
                </div>
            `;
        });
    });
