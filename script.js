// --- AYARLAR ---
const LOCAL_JSON_PATH = './movies.json';

// --- HTML ELEMENTLERİNİ SEÇME ---
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

let allMovies = []; 

// --- SCROLL ANIMASYONU İÇİN GÖZLEMCİ (INTERSECTION OBSERVER) ---

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {

        if (entry.isIntersecting) {
            entry.target.classList.add('show'); 
        }
    });
}, {
    threshold: 0.1 
});



getMovies();



async function getMovies() {
    try {
        const res = await fetch(LOCAL_JSON_PATH);
        if (!res.ok) throw new Error('Dosya bulunamadı');
        const data = await res.json();
        allMovies = data; 
        showMovies(allMovies);
    } catch (error) {
        console.error("Hata:", error);
        main.innerHTML = `<h3 style="color:white; grid-column:1/-1; text-align:center">Veriler yüklenemedi. Live Server kullandığından emin ol.</h3>`;
    }
}

function showMovies(movies) {
    main.innerHTML = '';

    if(movies.length === 0) {
        main.innerHTML = '<h3 style="color:white; grid-column: 1/-1; text-align:center;">Aradığınız film bulunamadı.</h3>';
        return;
    }

    movies.forEach((movie, index) => {
        const { title, poster_path, vote_average } = movie;

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card');

        // Gecikme (Stagger) Efekti:
        // Her kart bir öncekinden biraz daha geç gelsin (Sadece ilk yüklemede hoş durur)
        // Arama yaparken karışıklık olmasın diye bunu inline style ile ekliyoruz
        movieEl.style.transitionDelay = `${index * 50}ms`; // Her kart 50ms gecikmeli gelir

        movieEl.innerHTML = `
            <img 
                src="${poster_path}" 
                alt="${title}" 
                onerror="this.onerror=null; this.src='https://via.placeholder.com/500x750?text=Gorsel+Yok';"
            >
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(1)}</span>
            </div>
        `;
        
        movieEl.addEventListener('click', () => openModal(movie));

        main.appendChild(movieEl);

       
        observer.observe(movieEl);
    });
}

function openModal(movie) {
    modalTitle.innerText = movie.title;
    modalDesc.innerText = movie.overview;
    
    // Resim kontrolü
    const imgCheck = new Image();
    imgCheck.src = movie.poster_path;
    imgCheck.onload = function() { modalImg.src = movie.poster_path; };
    imgCheck.onerror = function() { modalImg.src = 'https://via.placeholder.com/500x750?text=Gorsel+Yok'; };

    modalRate.innerText = `IMDB: ${movie.vote_average}`;
    
    const rate = movie.vote_average;
    if (rate >= 8) modalRate.style.color = '#4eff8a'; 
    else if (rate >= 5) modalRate.style.color = '#ffce4e'; 
    else modalRate.style.color = '#ff4e4e'; 

    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function getClassByRate(vote) {
    if(vote >= 8) return 'green';
    else if(vote >= 5) return 'orange';
    else return 'red';
}

// --- EVENT LISTENERS ---

form.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredMovies = allMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm)
    );
    showMovies(filteredMovies);
});

// START EXPLORING BUTONU 
startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
   
    document.body.classList.add('scroll-active');

    
    if(container) {
        container.classList.add('active');
        
        // Yumuşakça aşağı kaydır
        setTimeout(() => {
            document.getElementById('movie-section').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
});

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});