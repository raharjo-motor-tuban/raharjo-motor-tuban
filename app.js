// --- Ambil elemen ---
const uploadInput = document.getElementById("upload");
const titleInput = document.getElementById("titleInput");
const priceInput = document.getElementById("priceInput");
const uploadBtn = document.getElementById("uploadBtn");
const gallery = document.getElementById("gallery");

// --- Load data dari localStorage ---
let items = JSON.parse(localStorage.getItem("motorData")) || [];
renderGallery();


// =============== UPLOAD GAMBAR ===============
uploadBtn.addEventListener("click", () => {
    const file = uploadInput.files[0];
    const title = titleInput.value.trim();
    const price = priceInput.value.trim();

    if (!file) {
        alert("Pilih gambar dulu");
        return;
    }
    if (!title || !price) {
        alert("Judul & Harga harus diisi");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const newItem = {
            id: Date.now(),
            img: e.target.result, // base64
            title,
            price
        };

        items.push(newItem);
        saveData();
        renderGallery();

        uploadInput.value = "";
        titleInput.value = "";
        priceInput.value = "";
    };

    reader.readAsDataURL(file);
});


// =============== SIMPAN DATA ===============
function saveData() {
    localStorage.setItem("motorData", JSON.stringify(items));
}


// =============== TAMPILKAN DATA ===============
function renderGallery() {
    gallery.innerHTML = "";

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
            <img src="${item.img}" class="preview">
            <input class="editTitle" value="${item.title}">
            <input class="editPrice" value="${item.price}">
            <button class="deleteBtn">Hapus</button>
        `;

        // Edit Judul
        div.querySelector(".editTitle").addEventListener("input", e => {
            item.title = e.target.value;
            saveData();
        });

        // Edit Harga
        div.querySelector(".editPrice").addEventListener("input", e => {
            item.price = e.target.value;
            saveData();
        });

        // Hapus Item
        div.querySelector(".deleteBtn").addEventListener("click", () => {
            items = items.filter(i => i.id !== item.id);
            saveData();
            renderGallery();
        });

        gallery.appendChild(div);
    });
}
