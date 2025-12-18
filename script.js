// --- ELEMENTLER ---
const LOCAL_JSON_PATH = './movies.json';
const main = document.getElementById('movieGrid');
const form = document.getElementById('searchInput');
const startBtn = document.querySelector('.start-btn');
const container = document.querySelector('.container');

// Modal Elementleri
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.querySelector('.close-btn');
const modalTitle = document.getElementById('modal-title');
const modalImg = document.getElementById('modal-img');
const modalDesc = document.getElementById('modal-desc');
const modalRate = document.getElementById('modal-rating');
const modalCast = document.getElementById('modal-cast');
const favBtn = document.getElementById('fav-btn');

// Favori Sidebar Elementleri
const favSidebar = document.getElementById('fav-sidebar');
const openFavBtn = document.getElementById('open-fav-sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const favListContainer = document.getElementById('favorites-list-container');
const favCountLabel = document.getElementById('fav-count');

let allMovies = []; 
let currentMovie = null;



const filterToggle = document.querySelector('.filter-toggle');
const filterSidebar = document.querySelector('.filter-sidebar');
const yearFilter = document.getElementById('yearFilter');
const genreFilter = document.getElementById('genreFilter');
const ratingRange = document.getElementById('ratingRange');
const ratingValue = document.getElementById('ratingValue');
const ratingSort = document.getElementById('ratingSort');



// --- BAŞLATICI ---
getMovies();

async function getMovies() {
    try {
        const res = await fetch(LOCAL_JSON_PATH);
        const data = await res.json();
        allMovies = data; 
        showMovies(allMovies);
        populateFilters(allMovies);
        renderFavoritesSidebar(); // Sayfa açıldığında favorileri yükle
    } catch (error) {
        console.error("Hata:", error);
    }
}

// --- FAVORİ İŞLEMLERİ ---

function getFavorites() {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : [];
}

function updateFavButton() {
    if (!currentMovie) return;
    const favorites = getFavorites();
    const isFav = favorites.includes(currentMovie.title);

    if (isFav) {
        favBtn.innerHTML = '❌ Favorilerden Çıkar';
        favBtn.style.background = 'linear-gradient(90deg, #ff4e4e, #ff8a65)';
    } else {
        favBtn.innerHTML = '⭐ Favorilere Ekle';
        favBtn.style.background = 'linear-gradient(90deg, gold, orange)';
    }
}

function renderFavoritesSidebar() {
    const favorites = getFavorites();
    favCountLabel.innerText = favorites.length;
    favListContainer.innerHTML = '';

    if (favorites.length === 0) {
        favListContainer.innerHTML = '<p style="opacity:0.5; text-align:center;">Henüz favori yok.</p>';
        return;
    }

    favorites.forEach(title => {
        const movie = allMovies.find(m => m.title === title);
        if (movie) {
            const div = document.createElement('div');
            div.className = 'fav-item';
            div.innerHTML = `
                <img src="${movie.poster_path}" alt="">
                <div>
                    <h4>${movie.title}</h4>
                    <small style="color:var(--accent-yellow)">⭐ ${movie.vote_average}</small>
                </div>
            `;
            div.onclick = () => openModal(movie);
            favListContainer.appendChild(div);
        }
    });
}
//filtreleme için
function populateFilters(movies) {
    const years = [...new Set(movies.map(m => m.year))].sort((a,b) => b-a);
    const genres = [...new Set(movies.flatMap(m => m.genres))].sort();

    years.forEach(year => {
        const opt = document.createElement('option');
        opt.value = year;
        opt.textContent = year;
        yearFilter.appendChild(opt);
    });

    genres.forEach(genre => {
        const opt = document.createElement('option');
        opt.value = genre;
        opt.textContent = genre;
        genreFilter.appendChild(opt);
    });
}

function applyFilters() {
    let filtered = [...allMovies];

    // Yıl
    if (yearFilter.value !== 'all') {
        filtered = filtered.filter(m => m.year == yearFilter.value);
    }

    // Tür
    if (genreFilter.value !== 'all') {
        filtered = filtered.filter(m => m.genres.includes(genreFilter.value));
    }

    // IMDB Sıralama
    if (ratingSort.value === 'asc') {
        filtered.sort((a,b) => a.vote_average - b.vote_average);
    } else if (ratingSort.value === 'desc') {
        filtered.sort((a,b) => b.vote_average - a.vote_average);
    }

    showMovies(filtered);
}

yearFilter.addEventListener('change', applyFilters);
genreFilter.addEventListener('change', applyFilters);
ratingSort.addEventListener('change', applyFilters);



function populateFilters(movies) {
    const years = [...new Set(movies.map(m => m.year))].sort((a,b)=>b-a);
    const genres = [...new Set(movies.flatMap(m => m.genres))].sort();

    years.forEach(y => {
        yearFilter.innerHTML += `<option value="${y}">${y}</option>`;
    });

    genres.forEach(g => {
        genreFilter.innerHTML += `<option value="${g}">${g}</option>`;
    });
}


// --- Mevcut favBtn.addEventListener kısmını BUNUNLA DEĞİŞTİRİN ---

favBtn.addEventListener('click', () => {
    // 1. Tıklama Animasyonunu Başlat
    favBtn.classList.add('animating');
    // 400ms sonra (CSS'deki süreyle aynı) animasyon sınıfını kaldır
    setTimeout(() => favBtn.classList.remove('animating'), 400);

    // 2. Favori Ekleme/Çıkarma Mantığı
    let favorites = getFavorites();
    const movieTitle = currentMovie.title;

    if (favorites.includes(movieTitle)) {
        // Zaten varsa, silme fonksiyonunu çağır
        removeFavoriteMovie(movieTitle);
    } else {
        // Yoksa ekle
        favorites.push(movieTitle);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavButton();
        renderFavoritesSidebar();
    }
});
// --- script.js dosyasının en altına ekleyin ---

// Belirtilen başlığa sahip filmi favorilerden siler
function removeFavoriteMovie(title) {
    let favorites = getFavorites();
    favorites = favorites.filter(t => t !== title);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Sidebar'ı güncelle
    renderFavoritesSidebar();

    // Eğer şu an açık olan modal bu filme aitse, modalın içindeki butonu da güncelle
    if (currentMovie && currentMovie.title === title) {
        updateFavButton();
    }
}

// --- Mevcut renderFavoritesSidebar fonksiyonunuBUNUNLA DEĞİŞTİRİN ---

function renderFavoritesSidebar() {
    const favorites = getFavorites();
    favCountLabel.innerText = favorites.length;
    favListContainer.innerHTML = '';

    if (favorites.length === 0) {
        favListContainer.innerHTML = '<p style="opacity:0.5; text-align:center;">Henüz favori yok.</p>';
        return;
    }

    favorites.forEach(title => {
        const movie = allMovies.find(m => m.title === title);
        if (movie) {
            const div = document.createElement('div');
            div.className = 'fav-item';
            // HTML yapısına silme butonunu (span.remove-fav-item) ekledik
            div.innerHTML = `
                <img src="${movie.poster_path}" alt="">
                <div>
                    <h4>${movie.title}</h4>
                    <small style="color:var(--accent-yellow)">⭐ ${movie.vote_average}</small>
                </div>
                <span class="remove-fav-item" title="Listeden Çıkar">&times;</span>
            `;

            // --- TIKLAMA MANTIĞI ÖNEMLİ ---
            
            // 1. Silme butonuna tıklanırsa:
            const removeBtn = div.querySelector('.remove-fav-item');
            removeBtn.onclick = (e) => {
                // e.stopPropagation(): Tıklamanın üst elemente (div.fav-item) geçmesini engeller.
                // Böylece silme butonuna basınca modal AÇILMAZ.
                e.stopPropagation(); 
                removeFavoriteMovie(movie.title);
            };

            // 2. Kartın geri kalanına tıklanırsa (silme butonu hariç):
            div.onclick = () => {
                openModal(movie);
            };

            favListContainer.appendChild(div);
        }
    });
}

// --- DİĞER FONKSİYONLAR ---

function showMovies(movies) {
    main.innerHTML = '';
    movies.forEach((movie, index) => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card', 'show');
        movieEl.innerHTML = `
            <img src="${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span class="${getClassByRate(movie.vote_average)}">${movie.vote_average.toFixed(1)}</span>
            </div>
        `;
        movieEl.onclick = () => openModal(movie);
        main.appendChild(movieEl);
    });
}

function openModal(movie) {
    currentMovie = movie;
    modalTitle.innerText = movie.title;
    modalDesc.innerText = movie.overview;
    modalImg.src = movie.poster_path;
    modalRate.innerText = `IMDB: ${movie.vote_average}`;
    
    // Oyuncuları listele (Hata düzeltildi)
    modalCast.innerHTML = '';
    movie.cast.forEach(actor => {
        const li = document.createElement('li');
        li.textContent = actor;
        modalCast.appendChild(li);
    });

    updateFavButton();
    modal.classList.add('active');
}

function getClassByRate(vote) {
    if(vote >= 8) return 'green';
    else if(vote >= 5) return 'orange';
    else return 'red';
}

// --- SCROLL ANIMASYONU KONTROLÜ ---

window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    // Eğer kullanıcı 100px'den fazla kaydırdıysa animasyonu başlat
    if (window.scrollY > 100) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

// "Start Exploring" butonuna tıklandığında kaydırmayı başlatırken 
// animasyonun devreye girmesi için mevcut startBtn kodunu şu şekilde güncelleyebilirsin:
startBtn.addEventListener('click', (e) => {
    e.preventDefault();

    document.body.classList.add('scroll-active');
    container.classList.add('active');

    // filtreleri aktif et
    document.body.classList.add('filters-active');

    document.getElementById('movie-section')
        .scrollIntoView({ behavior: 'smooth' });
});

const layout = document.querySelector('.layout');

filterToggle.addEventListener('click', () => {
    layout.classList.toggle('filters-open');
});



// --- EVENT LISTENERS ---
openFavBtn.onclick = () => favSidebar.classList.add('active');
closeSidebar.onclick = () => favSidebar.classList.remove('active');
closeModalBtn.onclick = () => modal.classList.remove('active');
form.oninput = (e) => {
    const filtered = allMovies.filter(m => m.title.toLowerCase().includes(e.target.value.toLowerCase()));
    showMovies(filtered);
};
startBtn.onclick = (e) => {
    e.preventDefault();
    document.body.classList.add('scroll-active');
    container.classList.add('active');
    document.getElementById('movie-section').scrollIntoView({ behavior: 'smooth' });
};