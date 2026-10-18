/* =====================================================
   GET ELEMENTS
===================================================== */

let galleryItems = Array.from(document.querySelectorAll(".gallery-item"));

galleryItems.forEach((item, index) => {
    item.dataset.id = `gallery-${index}`;
    item.dataset.addedAt = String(index);
});

const gallery = document.getElementById("gallery");

const filterButtons = document.querySelectorAll(".filter-btn");

const searchInput = document.getElementById("searchInput");

const clearSearch = document.getElementById("clearSearch");

const resultCount = document.getElementById("resultCount");

const emptyState = document.getElementById("emptyState");


/* =====================================================
   LIGHTBOX ELEMENTS
===================================================== */

const lightbox = document.getElementById("lightbox");

const lightboxImage = document.getElementById("lightboxImage");

const lightboxTitle = document.getElementById("lightboxTitle");

const lightboxCategory = document.getElementById("lightboxCategory");

const imageCounter = document.getElementById("imageCounter");

const closeBtn = document.getElementById("closeBtn");

const prevBtn = document.getElementById("prevBtn");

const nextBtn = document.getElementById("nextBtn");

const lightboxFavorite = document.getElementById("lightboxFavorite");

const downloadBtn = document.getElementById("downloadBtn");

const shareBtn = document.getElementById("shareBtn");


/* =====================================================
   THEME
===================================================== */

const themeBtn = document.getElementById("themeBtn");

const imageUpload = document.getElementById("imageUpload");

const uploadBtn = document.getElementById("uploadBtn");

const uploadCategory = document.getElementById("uploadCategory");

const uploadStatus = document.getElementById("uploadStatus");

/* =====================================================
   VARIABLES
===================================================== */

let currentIndex = 0;

let currentFilter = "all";

let visibleItems = [...galleryItems];

/* =====================================================
   FAVORITES
===================================================== */

const savedFavorites = JSON.parse(
    localStorage.getItem("galleryFavorites") || "[]"
);

let favorites = Array.isArray(savedFavorites)
    ? savedFavorites
        .map(favorite => {
            if (typeof favorite === "number") {
                return galleryItems[favorite]?.dataset.id;
            }

            return favorite;
        })
        .filter(favorite => typeof favorite === "string")
    : [];


/* =====================================================
   APPLY SAVED FAVORITES
===================================================== */

function applyFavorites() {

    galleryItems.forEach(item => {

        const favoriteBtn = item.querySelector(".favorite-btn");

        if (favorites.includes(item.dataset.id)) {

            favoriteBtn.classList.add("active");

            favoriteBtn.textContent = "♥";

            favoriteBtn.setAttribute(
                "aria-label",
                "Remove from favorites"
            );

        } else {

            favoriteBtn.classList.remove("active");

            favoriteBtn.textContent = "♡";

            favoriteBtn.setAttribute(
                "aria-label",
                "Add to favorites"
            );
        }

    });
}


/* =====================================================
   SAVE FAVORITES
===================================================== */

function saveFavorites() {

    localStorage.setItem(
        "galleryFavorites",
        JSON.stringify(favorites)
    );
}


/* =====================================================
   FILTER + SEARCH FUNCTION
===================================================== */

function updateGallery() {

    const searchText = searchInput.value
        .toLowerCase()
        .trim();

    visibleItems = [];

    galleryItems.forEach(item => {

        const category = item.dataset.category;

        const title = item.dataset.title.toLowerCase();

        const categoryMatch =
            currentFilter === "all" ||
            (
                currentFilter === "favorites"
                && favorites.includes(item.dataset.id)
            ) ||
            category === currentFilter;

        const searchMatch =
            title.includes(searchText) ||
            category.includes(searchText);

        if (categoryMatch && searchMatch) {

            item.classList.remove("hidden");

            visibleItems.push(item);

        } else {

            item.classList.add("hidden");
        }

    });

    renderGalleryOrder();

    /* =================================================
       EMPTY STATE
    ================================================= */

    if (visibleItems.length === 0) {

        emptyState.classList.add("show");

    } else {

        emptyState.classList.remove("show");
    }


    /* =================================================
       RESULT COUNT
    ================================================= */

    const count = visibleItems.length;

    if (searchText !== "") {

        resultCount.textContent =
            `Found ${count} image${count !== 1 ? "s" : ""}`;

    } else if (currentFilter === "favorites") {

        resultCount.textContent =
            `${count} favorite image${count !== 1 ? "s" : ""}`;

    } else if (currentFilter === "all") {

        resultCount.textContent =
            `Showing ${count} image${count !== 1 ? "s" : ""}`;

    } else {

        resultCount.textContent =
            `Showing ${count} ${currentFilter} image${count !== 1 ? "s" : ""}`;
    }

}


function renderGalleryOrder() {

    galleryItems.forEach(item => gallery.insertBefore(item, emptyState));
    gallery.append(emptyState);
}


/* =====================================================
   FILTER BUTTONS
===================================================== */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        currentFilter =
            button.dataset.category;

        updateGallery();

    });

});


/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener("input", () => {

    updateGallery();

});


/* =====================================================
   CLEAR SEARCH
===================================================== */

clearSearch.addEventListener("click", () => {

    searchInput.value = "";

    updateGallery();

    searchInput.focus();

});


/* =====================================================
   GALLERY ITEM EVENTS
===================================================== */

function bindGalleryItem(item) {

    const favoriteBtn = item.querySelector(".favorite-btn");

    favoriteBtn.addEventListener("click", event => {

        event.stopPropagation();

        const itemId = item.dataset.id;

        if (favorites.includes(itemId)) {

            favorites = favorites.filter(
                favorite => favorite !== itemId
            );

        } else {

            favorites.push(itemId);
        }

        saveFavorites();
        applyFavorites();
        updateGallery();

        if (
            lightbox.classList.contains("active") &&
            galleryItems[currentIndex] === item
        ) {
            updateLightboxFavorite();
        }
    });

    item.addEventListener("click", (event) => {

        if (
            event.target.classList.contains("favorite-btn")
        ) {
            return;
        }


        const index = galleryItems.indexOf(item);

        currentIndex = index;

        openLightbox();

    });

    const image = item.querySelector("img");
    image.addEventListener("load", () => {
        image.style.opacity = "1";
    });
    image.style.opacity = image.complete ? "1" : "0";
    image.style.transition = "opacity 0.5s ease";
}

galleryItems.forEach(bindGalleryItem);


/* =====================================================
   OPEN LIGHTBOX FUNCTION
===================================================== */

function openLightbox() {

    const item =
        galleryItems[currentIndex];


    if (!item) {
        return;
    }


    const image =
        item.querySelector("img");


    const title =
        item.dataset.title;


    const category =
        item.dataset.category;


    lightboxImage.src = image.src;

    lightboxImage.alt = image.alt;

    lightboxTitle.textContent = title;

    lightboxCategory.textContent =
        category;


    const visibleIndex = visibleItems.indexOf(item);
    imageCounter.textContent = visibleIndex >= 0
        ? `${visibleIndex + 1} / ${visibleItems.length}`
        : `${currentIndex + 1} / ${galleryItems.length}`;


    updateLightboxFavorite();


    downloadBtn.href = image.src;

    downloadBtn.download =
        `${title.replace(/\s+/g, "-").toLowerCase()}.jpg`;


    lightbox.classList.add("active");

    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow = "hidden";

}


/* =====================================================
   CLOSE LIGHTBOX
===================================================== */

function closeLightbox() {

    lightbox.classList.remove("active");

    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow = "";
}


function navigateLightbox(direction) {

    if (visibleItems.length === 0) {
        return;
    }

    const currentItem = galleryItems[currentIndex];
    const visibleIndex = visibleItems.indexOf(currentItem);
    const nextVisibleIndex = visibleIndex < 0
        ? (direction > 0 ? 0 : visibleItems.length - 1)
        : (
            visibleIndex + direction + visibleItems.length
        ) % visibleItems.length;

    currentIndex = galleryItems.indexOf(visibleItems[nextVisibleIndex]);
    openLightbox();
}


/* =====================================================
   CLOSE BUTTON
===================================================== */

closeBtn.addEventListener("click", () => {

    closeLightbox();

});


/* =====================================================
   PREVIOUS IMAGE
===================================================== */

prevBtn.addEventListener("click", () => navigateLightbox(-1));


/* =====================================================
   NEXT IMAGE
===================================================== */

nextBtn.addEventListener("click", () => navigateLightbox(1));


/* =====================================================
   CLICK OUTSIDE IMAGE
===================================================== */

lightbox.addEventListener("click", (event) => {

    if (event.target === lightbox) {

        closeLightbox();

    }

});


/* =====================================================
   KEYBOARD CONTROLS
===================================================== */

document.addEventListener("keydown", (event) => {

    if (!lightbox.classList.contains("active")) {

        return;
    }


    if (event.key === "Escape") {

        closeLightbox();

    }


    if (event.key === "ArrowLeft") {

        navigateLightbox(-1);

    }


    if (event.key === "ArrowRight") {

        navigateLightbox(1);

    }

});


/* =====================================================
   LIGHTBOX FAVORITE
===================================================== */

lightboxFavorite.addEventListener("click", () => {

    const item =
        galleryItems[currentIndex];


    if (!item) {
        return;
    }


    const itemId = item.dataset.id;

    if (favorites.includes(itemId)) {

        favorites =
            favorites.filter(
                favorite => favorite !== itemId
            );

    } else {

        favorites.push(itemId);
    }


    saveFavorites();

    applyFavorites();

    updateLightboxFavorite();

    updateGallery();

});


/* =====================================================
   UPDATE LIGHTBOX FAVORITE
===================================================== */

function updateLightboxFavorite() {

    if (favorites.includes(galleryItems[currentIndex]?.dataset.id)) {

        lightboxFavorite.textContent =
            "♥ Favorited";

        lightboxFavorite.classList.add("active");

    } else {

        lightboxFavorite.textContent =
            "♡ Favorite";

        lightboxFavorite.classList.remove("active");
    }

}


/* =====================================================
   UPLOAD AND PERSIST LOCAL IMAGES
===================================================== */

function openUploadDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open("image-gallery-db", 1);

        request.onupgradeneeded = () => {

            const database = request.result;

            if (!database.objectStoreNames.contains("uploads")) {
                database.createObjectStore("uploads", {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


function saveUploadedImage(database, record) {

    return new Promise((resolve, reject) => {

        const transaction = database.transaction("uploads", "readwrite");

        transaction.objectStore("uploads").put(record);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(
            transaction.error || new Error("Image storage was interrupted.")
        );
    });
}


function loadUploadedImages(database) {

    return new Promise((resolve, reject) => {

        const request = database
            .transaction("uploads", "readonly")
            .objectStore("uploads")
            .getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


function addUploadedImage(record) {

    const item = document.createElement("article");
    item.className = "gallery-item";
    item.dataset.id = record.id;
    item.dataset.category = record.category;
    item.dataset.title = record.title;
    item.dataset.addedAt = String(record.addedAt);

    const image = document.createElement("img");
    image.src = URL.createObjectURL(record.blob);
    image.alt = record.title;
    image.loading = "lazy";

    const favoriteButton = document.createElement("button");
    favoriteButton.className = "favorite-btn";
    favoriteButton.type = "button";
    favoriteButton.setAttribute("aria-label", "Add to favorites");
    favoriteButton.title = "Add to favorites";
    favoriteButton.textContent = "♡";

    const info = document.createElement("div");
    info.className = "image-info";

    const title = document.createElement("h3");
    title.textContent = record.title;

    const category = document.createElement("span");
    category.textContent = record.category;

    info.append(title, category);
    item.append(image, favoriteButton, info);
    gallery.insertBefore(item, emptyState);

    galleryItems.push(item);
    bindGalleryItem(item);
    applyFavorites();
    updateGallery();
}


async function restoreUploadedImages() {

    const database = await openUploadDatabase();
    const records = await loadUploadedImages(database);

    records
        .sort((first, second) => first.addedAt - second.addedAt)
        .forEach(addUploadedImage);
}


uploadBtn.addEventListener("click", () => imageUpload.click());

imageUpload.addEventListener("change", async () => {

    const selectedFiles = Array.from(imageUpload.files || []);
    const validFiles = selectedFiles.filter(file =>
        file.type.startsWith("image/")
    );
    const invalidCount = selectedFiles.length - validFiles.length;

    if (validFiles.length === 0) {
        if (invalidCount > 0) {
            uploadStatus.textContent = "Please choose valid image files.";
        }

        imageUpload.value = "";
        return;
    }

    uploadBtn.disabled = true;
    uploadStatus.textContent = "Saving images...";

    try {

        const database = await openUploadDatabase();
        let savedCount = 0;
        let failedCount = invalidCount;

        for (const file of validFiles) {

            const title = file.name
                .replace(/\.[^.]+$/, "")
                .replace(/[-_]+/g, " ")
                .trim() || "Uploaded Image";

            const record = {
                id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                title,
                category: uploadCategory.value,
                blob: file,
                addedAt: Date.now()
            };

            try {
                await saveUploadedImage(database, record);
                addUploadedImage(record);
                savedCount++;
            } catch (error) {
                console.error("Unable to save uploaded image.", error);
                failedCount++;
            }
        }

        const statusParts = [];
        if (savedCount > 0) {
            statusParts.push(`Added ${savedCount} image${savedCount === 1 ? "" : "s"}.`);
        }
        if (failedCount > 0) {
            statusParts.push(`Could not add ${failedCount} file${failedCount === 1 ? "" : "s"}.`);
        }
        uploadStatus.textContent = statusParts.join(" ");

    } catch (error) {

        console.error("Unable to access image storage.", error);
        uploadStatus.textContent =
            "Image storage is unavailable. Please try again in a supported browser.";

    } finally {

        uploadBtn.disabled = false;
        imageUpload.value = "";
    }
});


/* =====================================================
   SHARE IMAGE
===================================================== */

shareBtn.addEventListener("click", async () => {

    const item =
        galleryItems[currentIndex];


    if (!item) {
        return;
    }


    const title =
        item.dataset.title;


    const imageURL =
        item.querySelector("img").src;


    if (navigator.share) {

        try {

            await navigator.share({

                title: title,

                text: `Check out this image: ${title}`,

                url: imageURL

            });

        } catch (error) {

            console.log(
                "Share cancelled."
            );

        }

    } else {

        try {

            await navigator.clipboard.writeText(
                imageURL
            );

            alert(
                "Image link copied to clipboard!"
            );

        } catch (error) {

            alert(
                "Unable to copy image link."
            );

        }

    }

});


/* =====================================================
   THEME - DARK / LIGHT
===================================================== */

const savedTheme =
    localStorage.getItem("galleryTheme");


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

} else {

    themeBtn.textContent = "🌙";

}


/* =====================================================
   THEME BUTTON
===================================================== */

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");


    const darkMode =
        document.body.classList.contains("dark");


    if (darkMode) {

        themeBtn.textContent = "☀️";

        localStorage.setItem(
            "galleryTheme",
            "dark"
        );

    } else {

        themeBtn.textContent = "🌙";

        localStorage.setItem(
            "galleryTheme",
            "light"
        );

    }

});


/* =====================================================
   INITIAL SETUP
===================================================== */

applyFavorites();

updateGallery();

restoreUploadedImages().catch(error => {
    console.error("Unable to restore saved images.", error);
    uploadStatus.textContent =
        "Saved images could not be loaded from this browser.";
});