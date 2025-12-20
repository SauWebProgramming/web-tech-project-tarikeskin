document.addEventListener('DOMContentLoaded', () => {
    //DOM Elements
    const movieGrid = document.getElementById('movieGrid');
    const searchInput = document.getElementById('searchInput'); 
    const yearFilter = document.getElementById('yearFilter');
    const genreFilter = document.getElementById('genreFilter');
    const ratingRange = document.getElementById('ratingRange');
    const ratingValue = document.getElementById('ratingValue');
    const ratingSort = document.getElementById('ratingSort');

    //Modal Elements
    const modal = document.getElementById('movie-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalRating = document.getElementById('modal-rating');
    const modalYear = document.getElementById('modal-year');
    const modalGenre = document.getElementById('modal-genre');
    const modalCast = document.getElementById('modal-cast');
    const modalDesc = document.getElementById('modal-desc');
    const favBtn = document.getElementById('fav-btn');

    //Sidebar Elements
    const favSidebar = document.getElementById('fav-sidebar');
    const openFavSidebarBtn = document.getElementById('open-fav-sidebar');
    const closeFavSidebarBtn = document.querySelector('.close-sidebar');
    const favListContainer = document.getElementById('favorites-list-container');
    const favCountSpan = document.getElementById('fav-count');

    //Navigation & Filter Elements
    const hero = document.querySelector('.hero');
    const filterSidebar = document.getElementById('filterSidebar');
    const filterToggleBtn = document.getElementById('filter-toggle');
    const closeFilterBtn = document.getElementById('closeFilterBtn');
    const startBtn = document.querySelector('.start-btn'); // For smooth scroll event check

    
    let allMovies = [];
    let favorites = JSON.parse(localStorage.getItem('mediaVerseFavs')) || [];

    //Initialization
    updateFavCount();
    renderFavorites();

    fetch('movies.json')
        .then(response => response.json())
        .then(data => {
            allMovies = data;
            populateFilters(allMovies);
            renderMovies(allMovies);
        })
        .catch(err => console.error('Error loading movies:', err));

    
    searchInput.addEventListener('input', filterMovies);
    yearFilter.addEventListener('change', filterMovies);
    genreFilter.addEventListener('change', filterMovies);
    ratingRange.addEventListener('input', (e) => {
        ratingValue.textContent = `${e.target.value}+`;
        filterMovies();
    });
    ratingSort.addEventListener('change', sortMovies);

    
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    
    openFavSidebarBtn.addEventListener('click', () => {
        favSidebar.classList.add('active');
    });

    closeFavSidebarBtn.addEventListener('click', () => {
        favSidebar.classList.remove('active');
    });

    // Sticky Header & Scroll Effects
    const heroHeight = hero.offsetHeight;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            hero.classList.add('sticky');
            document.body.style.paddingTop = heroHeight + 'px'; 
        } else {
            hero.classList.remove('sticky');
            document.body.style.paddingTop = '0';
        }
    });

    // Filter Sidebar Toggle
    const layout = document.querySelector('.layout');

    filterToggleBtn.addEventListener('click', () => {
        filterSidebar.classList.add('active');
        layout.classList.add('sidebar-active');
    });

    closeFilterBtn.addEventListener('click', () => {
        filterSidebar.classList.remove('active');
        layout.classList.remove('sidebar-active');
    });



    function populateFilters(movies) {
        // Years
        const years = [...new Set(movies.map(m => m.year))].sort((a, b) => b - a);
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        // Genres
        const genres = new Set();
        movies.forEach(movie => {
            movie.genres.forEach(g => genres.add(g));
        });
        [...genres].sort().forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }

    function renderMovies(movies) {
        movieGrid.innerHTML = '';
        if (movies.length === 0) {
            movieGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No movies found.</p>';
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement('article');
            card.classList.add('movie-card');
            card.innerHTML = `
                <img src="${movie.poster_path}" alt="${movie.title}" loading="lazy">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="movie-meta">
                        <span>${movie.year}</span>
                        <span class="rating">⭐ ${movie.vote_average}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openModal(movie));
            movieGrid.appendChild(card);
        });
    }

    function filterMovies() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedYear = yearFilter.value;
        const selectedGenre = genreFilter.value;
        const minRating = parseFloat(ratingRange.value);

        let filtered = allMovies.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
            const matchesYear = selectedYear === 'all' || movie.year == selectedYear;
            const matchesGenre = selectedGenre === 'all' || movie.genres.includes(selectedGenre);
            const matchesRating = movie.vote_average >= minRating;

            return matchesSearch && matchesYear && matchesGenre && matchesRating;
        });

        sortHelper(filtered);
    }

    function sortMovies() {
        filterMovies(); 
    }

    function sortHelper(moviesToList) {
        const sortType = ratingSort.value;

        if (sortType === 'desc') {
            moviesToList.sort((a, b) => b.vote_average - a.vote_average);
        } else if (sortType === 'asc') {
            moviesToList.sort((a, b) => a.vote_average - b.vote_average);
        }
        

        renderMovies(moviesToList);
    }

    function openModal(movie) {
        modalImg.src = movie.poster_path;
        modalTitle.textContent = movie.title;
        modalRating.textContent = `⭐ ${movie.vote_average}`;
        modalYear.textContent = movie.year;
        modalGenre.textContent = movie.genres.join(', ');
        modalDesc.textContent = movie.overview;

        modalCast.innerHTML = '';
        movie.cast.forEach(actor => {
            const li = document.createElement('li');
            li.textContent = actor;
            modalCast.appendChild(li);
        });

        updateFavButtonState(movie.title);

      
        favBtn.onclick = () => toggleFavorite(movie);

        modal.classList.add('active');
    }

    function updateFavButtonState(title) {
        const isFav = favorites.some(fav => fav.title === title);
        if (isFav) {
            favBtn.textContent = '❌ Favorilerden Çıkar';
            favBtn.classList.add('active');
        } else {
            favBtn.textContent = '⭐ Favorilere Ekle';
            favBtn.classList.remove('active');
        }
    }

    function toggleFavorite(movie) {
        const index = favorites.findIndex(fav => fav.title === movie.title);

        if (index === -1) {
            favorites.push(movie);
        } else {
            favorites.splice(index, 1);
        }

        localStorage.setItem('mediaVerseFavs', JSON.stringify(favorites));
        updateFavButtonState(movie.title);
        updateFavCount();
        renderFavorites();
    }

    function updateFavCount() {
        favCountSpan.textContent = favorites.length;
    }

    function renderFavorites() {
        favListContainer.innerHTML = '';
        if (favorites.length === 0) {
            favListContainer.innerHTML = '<p style="text-align:center; padding: 20px; opacity: 0.7;">Henüz favori eklemediniz.</p>';
            return;
        }

        favorites.forEach(movie => {
            const div = document.createElement('div');
            div.classList.add('fav-item');
            div.innerHTML = `
                <img src="${movie.poster_path}" alt="${movie.title}">
                <div class="fav-item-info">
                    <h4>${movie.title}</h4>
                    <span style="font-size:0.8rem; color:#ffd700;">⭐ ${movie.vote_average}</span>
                </div>
                <button class="remove-fav">&times;</button>
            `;

            // Remove button click
            div.querySelector('.remove-fav').addEventListener('click', (e) => {
                e.stopPropagation(); 
                toggleFavorite(movie);
            });

            // Make favorite item clickable to open details too
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-fav')) return;
                openModal(movie);
            });

            favListContainer.appendChild(div);
        });
    }
});
