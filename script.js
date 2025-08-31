// Variables globales
let musicFiles = [];
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffleActive = false;
let repeatMode = 0;
let audioElement = new Audio();
let musicFolderHandle = null;
let currentEditIndex = -1;
let appConfig = {};
let currentView = 'grid';
let musicDurations = {};
let currentRating = 0;
let currentLanguage = 'es';
let languageStrings = {};

// Elementos DOM
const musicLibrary = document.getElementById('music-library');
const nowPlayingArt = document.getElementById('now-playing-art');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingArtist = document.getElementById('now-playing-artist');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModalBtn = document.getElementById('close-settings-modal');
const editModal = document.getElementById('edit-modal');
const closeEditModalBtn = document.getElementById('close-edit-modal');
const folderInput = document.getElementById('folder-input');
const selectedFolder = document.getElementById('selected-folder');
const saveConfigBtn = document.getElementById('save-config');
const metadataForm = document.getElementById('metadata-form');
const coverPreviewContainer = document.getElementById('cover-preview-container');
const editCoverInput = document.getElementById('edit-cover');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const volumeBtn = document.getElementById('volume-btn');
const volumeSlider = document.getElementById('volume-slider');
const exportConfigBtn = document.getElementById('export-config');
const importConfigBtn = document.getElementById('import-config');
const configFileInput = document.getElementById('config-file-input');
const backgroundColorInput = document.getElementById('background-color');
const primaryColorInput = document.getElementById('primary-color');
const secondaryColorInput = document.getElementById('secondary-color');
const textColorInput = document.getElementById('text-color');
const vinylColor1Input = document.getElementById('vinyl-color-1');
const vinylColor2Input = document.getElementById('vinyl-color-2');
const uiOpacityInput = document.getElementById('ui-opacity');
const uiOpacityValue = document.getElementById('ui-opacity-value');
const cardOpacityInput = document.getElementById('card-opacity');
const cardOpacityValue = document.getElementById('card-opacity-value');
const buttonOpacityInput = document.getElementById('button-opacity');
const buttonOpacityValue = document.getElementById('button-opacity-value');
const borderRadiusInput = document.getElementById('border-radius');
const borderRadiusValue = document.getElementById('border-radius-value');
const backgroundImageInput = document.getElementById('background-image-input');
const backgroundImageBtn = document.getElementById('background-image-btn');
const removeBackgroundBtn = document.getElementById('remove-background');
const gridViewBtn = document.getElementById('grid-view-btn');
const listViewBtn = document.getElementById('list-view-btn');
const tableViewBtn = document.getElementById('table-view-btn');
const welcomeMessage = document.getElementById('welcome-message');
const selectFolderBtn = document.getElementById('select-folder-btn');
const appTitleInput = document.getElementById('app-title');
const appTitleElement = document.getElementById('app-title');
const playerElement = document.getElementById('player');
const editRatingInput = document.getElementById('edit-rating');
const editStars = document.querySelectorAll('.edit-star');
const languageSelect = document.getElementById('language-select');

// Cargar configuración desde archivo o localStorage
async function loadConfiguration() {
    try {
        // Cargar idioma primero
        await loadLanguage('es'); // Idioma por defecto
        
        // Intentar cargar configuración desde archivo externo
        const response = await fetch('config.json');
        if (response.ok) {
            appConfig = await response.json();
            
            // Cargar el idioma configurado
            if (appConfig.language) {
                await loadLanguage(appConfig.language);
                languageSelect.value = appConfig.language;
                currentLanguage = appConfig.language;
            }
            
            applyConfiguration();
            
            // Cargar metadatos desde archivo JSON
            await loadMetadataFromFile();
            
            // Cargar música de la carpeta guardada
            if (appConfig.musicFolderPath) {
                await loadMusicFromSavedFolder();
            }
        } else {
            throw new Error('No se encontró el archivo de configuración');
        }
    } catch (error) {
        console.log('Cargando configuración desde localStorage:', error);
        // Cargar desde localStorage si no hay archivo externo
        loadConfigFromLocalStorage();
    }
}

// Cargar cadenas de idioma desde archivo JSON
async function loadLanguage(langCode) {
    try {
        const response = await fetch(`languages/${langCode}.json`);
        if (response.ok) {
            languageStrings = await response.json();
            applyLanguage();
        } else {
            console.error('No se pudo cargar el archivo de idioma');
            // Cargar idioma por defecto (español)
            if (langCode !== 'es') {
                await loadLanguage('es');
            }
        }
    } catch (error) {
        console.error('Error cargando idioma:', error);
    }
}

// Aplicar idioma a la interfaz
function applyLanguage() {
    // Actualizar textos de la interfaz
    document.getElementById('app-title').textContent = languageStrings.appTitle || 'Eclipse';
    document.title = `${languageStrings.appTitle || 'Eclipse'} - ${languageStrings.musicPlayer || 'Reproductor de Música'}`;
    document.getElementById('settings-title').textContent = languageStrings.settingsTitle || 'Configuración Avanzada';
    document.getElementById('folder-section-title').textContent = languageStrings.folderSectionTitle || 'Seleccionar carpeta de música';
    document.getElementById('folder-section-desc').textContent = languageStrings.folderSectionDesc || 'Selecciona la carpeta donde tienes tu música';
    document.getElementById('folder-label').textContent = languageStrings.selectFolder || 'Seleccionar carpeta';
    document.getElementById('language-title').textContent = languageStrings.language || 'Idioma';
    
    // Actualizar más elementos según sea necesario...
}

// Cargar metadatos desde archivo JSON
async function loadMetadataFromFile() {
    try {
        const response = await fetch('metadata.json');
        if (response.ok) {
            const metadata = await response.json();
            
            // Guardar metadatos en localStorage para compatibilidad
            for (const [filename, data] of Object.entries(metadata)) {
                localStorage.setItem(`metadata_${filename}`, JSON.stringify(data));
            }
            
            console.log('Metadatos cargados desde archivo');
        }
    } catch (error) {
        console.log('No se encontró archivo de metadatos, se usarán los existentes');
    }
}

// Guardar metadatos en archivo JSON
async function saveMetadataToFile() {
    try {
        // Recopilar todos los metadatos de localStorage
        const allMetadata = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('metadata_')) {
                const filename = key.replace('metadata_', '');
                allMetadata[filename] = JSON.parse(localStorage.getItem(key));
            }
        }
        
        // Crear un blob y descargarlo
        const dataStr = JSON.stringify(allMetadata, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        // Para simular la descarga, creamos un enlace temporal
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'metadata.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        console.log('Metadatos exportados a metadata.json');
    } catch (error) {
        console.error('Error guardando metadatos:', error);
    }
}

// Cargar música desde carpeta guardada
async function loadMusicFromSavedFolder() {
    if (!appConfig.musicFolderPath) return;
    
    try {
        // En un entorno real, esto usaría la File System API
        // Aquí simulamos la carga de archivos desde una ruta guardada
        console.log('Intentando cargar música desde:', appConfig.musicFolderPath);
        
        // En un navegador real, necesitaríamos permisos especiales
        // Para este ejemplo, pediremos al usuario que seleccione la carpeta nuevamente
        const folderInput = document.getElementById('folder-input');
        folderInput.click();
    } catch (error) {
        console.error('Error cargando carpeta guardada:', error);
    }
}

// Cargar configuración desde localStorage
function loadConfigFromLocalStorage() {
    const primaryColor = localStorage.getItem('primaryColor') || '#1db954';
    const secondaryColor = localStorage.getItem('secondaryColor') || '#191414';
    const backgroundColor = localStorage.getItem('backgroundColor') || '#121212';
    const textColor = localStorage.getItem('textColor') || '#ffffff';
    const vinylColor1 = localStorage.getItem('vinylColor1') || '#000000';
    const vinylColor2 = localStorage.getItem('vinylColor2') || '#333333';
    const backgroundImage = localStorage.getItem('backgroundImage') || 'none';
    const uiOpacity = localStorage.getItem('uiOpacity') || 0.9;
    const cardOpacity = localStorage.getItem('cardOpacity') || 0.8;
    const buttonOpacity = localStorage.getItem('buttonOpacity') || 0.9;
    const borderRadius = localStorage.getItem('borderRadius') || 8;
    const currentView = localStorage.getItem('currentView') || 'grid';
    const appTitle = localStorage.getItem('appTitle') || 'Eclipse';
    const musicFolder = localStorage.getItem('musicFolder') || '';
    const language = localStorage.getItem('language') || 'es';
    const musicFolderPath = localStorage.getItem('musicFolderPath') || '';

    appConfig = {
        colors: {
            primary: primaryColor,
            secondary: secondaryColor,
            background: backgroundColor,
            text: textColor
        },
        vinylColors: {
            color1: vinylColor1,
            color2: vinylColor2
        },
        backgroundImage: backgroundImage,
        uiOpacity: uiOpacity,
        cardOpacity: cardOpacity,
        buttonOpacity: buttonOpacity,
        borderRadius: borderRadius,
        currentView: currentView,
        appTitle: appTitle,
        musicFolder: musicFolder,
        musicFolderPath: musicFolderPath,
        volume: localStorage.getItem('volume') || 80,
        shuffle: localStorage.getItem('shuffleMode') === 'true',
        repeat: parseInt(localStorage.getItem('repeatMode') || '0'),
        sortBy: localStorage.getItem('sortBy') || 'title-asc',
        language: language
    };

    applyConfiguration();
}

// Aplicar configuración cargada
function applyConfiguration() {
    // Aplicar colores
    document.documentElement.style.setProperty('--primary-color', appConfig.colors.primary);
    document.documentElement.style.setProperty('--secondary-color', appConfig.colors.secondary);
    document.documentElement.style.setProperty('--background-color', appConfig.colors.background);
    document.documentElement.style.setProperty('--text-color', appConfig.colors.text);
    document.documentElement.style.setProperty('--vinyl-color-1', appConfig.vinylColors.color1);
    document.documentElement.style.setProperty('--vinyl-color-2', appConfig.vinylColors.color2);

    // Aplicar imagen de fondo
    document.documentElement.style.setProperty('--background-image', appConfig.backgroundImage);

    // Aplicar opacidades
    document.documentElement.style.setProperty('--ui-opacity', appConfig.uiOpacity);
    document.documentElement.style.setProperty('--card-opacity', appConfig.cardOpacity);
    document.documentElement.style.setProperty('--button-opacity', appConfig.buttonOpacity);

    // Aplicar border radius
    document.documentElement.style.setProperty('--border-radius', `${appConfig.borderRadius}px`);

    // Aplicar título de la aplicación
    document.documentElement.style.setProperty('--app-title', `"${appConfig.appTitle}"`);
    document.title = `${appConfig.appTitle} - Reproductor de Música`;
    appTitleElement.textContent = appConfig.appTitle;
    appTitleInput.value = appConfig.appTitle;

    // Aplicar vista actual
    currentView = appConfig.currentView;
    updateViewButtons();

    // Aplicar valores a los controles
    primaryColorInput.value = appConfig.colors.primary;
    secondaryColorInput.value = appConfig.colors.secondary;
    backgroundColorInput.value = appConfig.colors.background;
    textColorInput.value = appConfig.colors.text;
    vinylColor1Input.value = appConfig.vinylColors.color1;
    vinylColor2Input.value = appConfig.vinylColors.color2;
    uiOpacityInput.value = appConfig.uiOpacity;
    uiOpacityValue.textContent = `${appConfig.uiOpacity * 100}%`;
    cardOpacityInput.value = appConfig.cardOpacity;
    cardOpacityValue.textContent = `${appConfig.cardOpacity * 100}%`;
    buttonOpacityInput.value = appConfig.buttonOpacity;
    buttonOpacityValue.textContent = `${appConfig.buttonOpacity * 100}%`;
    borderRadiusInput.value = appConfig.borderRadius;
    borderRadiusValue.textContent = `${appConfig.borderRadius}px`;
    languageSelect.value = appConfig.language || 'es';

    // Mostrar carpeta de música si existe
    if (appConfig.musicFolderPath) {
        selectedFolder.textContent = appConfig.musicFolderPath;
    }

    // Aplicar volumen
    audioElement.volume = appConfig.volume / 100;
    volumeSlider.value = appConfig.volume;
    updateVolumeIcon(appConfig.volume);

    // Aplicar modos de reproducción
    isShuffleActive = appConfig.shuffle;
    repeatMode = appConfig.repeat;
    updateShuffleButton();
    updateRepeatButton();

    // Aplicar ordenación
    sortSelect.value = appConfig.sortBy;

    // Actualizar botones con el color principal
    updateButtonColors();

    // Mostrar u ocultar mensaje de bienvenida
    toggleWelcomeMessage();
}

// Mostrar u ocultar mensaje de bienvenida
function toggleWelcomeMessage() {
    if (musicFiles.length === 0) {
        welcomeMessage.style.display = 'block';
    } else {
        welcomeMessage.style.display = 'none';
    }
}

// Actualizar colores de los botones
function updateButtonColors() {
    const buttons = document.querySelectorAll('.btn, .play-btn');
    buttons.forEach(button => {
        button.style.backgroundColor = `rgba(${hexToRgb(appConfig.colors.primary)}, ${appConfig.buttonOpacity})`;
    });
    
    const activeButtons = document.querySelectorAll('.btn-active');
    activeButtons.forEach(button => {
        button.style.color = appConfig.colors.primary;
    });
}

// Convertir hex a rgb
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '29, 185, 84';
}

// Guardar configuración
function saveConfiguration() {
    // Actualizar objeto de configuración
    appConfig.colors.primary = primaryColorInput.value;
    appConfig.colors.secondary = secondaryColorInput.value;
    appConfig.colors.background = backgroundColorInput.value;
    appConfig.colors.text = textColorInput.value;
    appConfig.vinylColors.color1 = vinylColor1Input.value;
    appConfig.vinylColors.color2 = vinylColor2Input.value;
    appConfig.uiOpacity = parseFloat(uiOpacityInput.value);
    appConfig.cardOpacity = parseFloat(cardOpacityInput.value);
    appConfig.buttonOpacity = parseFloat(buttonOpacityInput.value);
    appConfig.borderRadius = parseInt(borderRadiusInput.value);
    appConfig.currentView = currentView;
    appConfig.appTitle = appTitleInput.value;
    appConfig.volume = volumeSlider.value;
    appConfig.shuffle = isShuffleActive;
    appConfig.repeat = repeatMode;
    appConfig.sortBy = sortSelect.value;
    appConfig.language = languageSelect.value;

    // Guardar en localStorage
    localStorage.setItem('primaryColor', appConfig.colors.primary);
    localStorage.setItem('secondaryColor', appConfig.colors.secondary);
    localStorage.setItem('backgroundColor', appConfig.colors.background);
    localStorage.setItem('textColor', appConfig.colors.text);
    localStorage.setItem('vinylColor1', appConfig.vinylColors.color1);
    localStorage.setItem('vinylColor2', appConfig.vinylColors.color2);
    localStorage.setItem('backgroundImage', appConfig.backgroundImage);
    localStorage.setItem('uiOpacity', appConfig.uiOpacity);
    localStorage.setItem('cardOpacity', appConfig.cardOpacity);
    localStorage.setItem('buttonOpacity', appConfig.buttonOpacity);
    localStorage.setItem('borderRadius', appConfig.borderRadius);
    localStorage.setItem('currentView', appConfig.currentView);
    localStorage.setItem('appTitle', appConfig.appTitle);
    localStorage.setItem('musicFolder', appConfig.musicFolder);
    localStorage.setItem('musicFolderPath', appConfig.musicFolderPath);
    localStorage.setItem('volume', appConfig.volume);
    localStorage.setItem('shuffleMode', appConfig.shuffle);
    localStorage.setItem('repeatMode', appConfig.repeat);
    localStorage.setItem('sortBy', appConfig.sortBy);
    localStorage.setItem('language', appConfig.language);

    // Guardar en archivo config.json
    saveConfigToFile();
    
    // Aplicar cambios
    applyConfiguration();
    
    console.log('Configuración guardada correctamente');
}

// Guardar configuración en archivo JSON
async function saveConfigToFile() {
    try {
        const dataStr = JSON.stringify(appConfig, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        console.log('Configuración exportada a config.json');
    } catch (error) {
        console.error('Error guardando configuración:', error);
    }
}

// Exportar configuración a archivo JSON
function exportConfiguration() {
    const configStr = JSON.stringify(appConfig, null, 2);
    const blob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eclipse-player-config.json';
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    console.log('Configuración exportada correctamente');
}

// Importar configuración desde archivo JSON
function importConfiguration(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            appConfig = config;
            saveConfiguration();
            console.log('Configuración importada correctamente');
        } catch (error) {
            console.error('Error al importar la configuración:', error.message);
        }
    };
    reader.readAsText(file);
}

// Cambiar imagen de fondo
function changeBackgroundImage(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageUrl = `url('${event.target.result}')`;
        appConfig.backgroundImage = imageUrl;
        document.documentElement.style.setProperty('--background-image', imageUrl);
    };
    reader.readAsDataURL(file);
}

// Eliminar imagen de fondo
function removeBackgroundImage() {
    appConfig.backgroundImage = 'none';
    document.documentElement.style.setProperty('--background-image', 'none');
}

// Actualizar botones de vista
function updateViewButtons() {
    // Remover clase activa de todos los botones
    gridViewBtn.classList.remove('btn-active');
    listViewBtn.classList.remove('btn-active');
    tableViewBtn.classList.remove('btn-active');
    
    // Agregar clase activa al botón correspondiente
    if (currentView === 'grid') {
        gridViewBtn.classList.add('btn-active');
    } else if (currentView === 'list') {
        listViewBtn.classList.add('btn-active');
    } else if (currentView === 'table') {
        tableViewBtn.classList.add('btn-active');
    }
    
    // Volver a renderizar la lista de música
    if (musicFiles.length > 0) {
        filterAndSortMusic();
    }
}

// Cambiar vista
function changeView(view) {
    currentView = view;
    updateViewButtons();
    saveConfiguration();
}

// Obtener duración de un archivo de audio
function getAudioDuration(file, callback) {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    
    audio.addEventListener('loadedmetadata', function() {
        callback(audio.duration);
        URL.revokeObjectURL(url);
    });
    
    audio.addEventListener('error', function() {
        callback(0);
        URL.revokeObjectURL(url);
    });
    
    audio.src = url;
    audio.load();
}

// Formatear duración en segundos a MM:SS
function formatDuration(seconds) {
    if (isNaN(seconds) || seconds === 0) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Actualizar icono de volumen según el nivel
function updateVolumeIcon(volume) {
    let icon = 'fa-volume-up';
    if (volume == 0) {
        icon = 'fa-volume-mute';
    } else if (volume < 30) {
        icon = 'fa-volume-down';
    }
    volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
}

// Actualizar botón de shuffle
function updateShuffleButton() {
    if (isShuffleActive) {
        shuffleBtn.classList.add('btn-active');
    } else {
        shuffleBtn.classList.remove('btn-active');
    }
}

// Actualizar botón de repeat
function updateRepeatButton() {
    repeatBtn.classList.remove('btn-active');
    if (repeatMode === 1) {
        repeatBtn.classList.add('btn-active');
        repeatBtn.title = "Repetir toda la lista";
    } else if (repeatMode === 2) {
        repeatBtn.classList.add('btn-active');
        repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
        repeatBtn.title = "Repetir canción actual";
    } else {
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
        repeatBtn.title = "Repetir";
    }
}

// Filtrar y ordenar canciones
function filterAndSortMusic() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    
    let filteredMusic = musicFiles.map((file, index) => {
        const metadata = loadMetadata(file.name) || {};
        const duration = musicDurations[file.name] || 0;
        const rating = metadata.rating || 0;
        
        return {
            index,
            file,
            title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
            artist: metadata.artist || "Desconocido",
            genre: metadata.genre || "",
            year: metadata.year || "",
            collaborators: metadata.collaborators || "",
            duration: duration,
            rating: rating,
            dateAdded: metadata.dateAdded || new Date().toISOString()
        };
    });
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
        filteredMusic = filteredMusic.filter(item => 
            item.title.toLowerCase().includes(searchTerm) || 
            item.artist.toLowerCase().includes(searchTerm) ||
            item.genre.toLowerCase().includes(searchTerm) ||
            item.collaborators.toLowerCase().includes(searchTerm)
        );
    }
    
    // Aplicar ordenación
    switch(sortValue) {
        case 'title-asc':
            filteredMusic.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            filteredMusic.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'artist-asc':
            filteredMusic.sort((a, b) => a.artist.localeCompare(b.artist));
            break;
        case 'artist-desc':
            filteredMusic.sort((a, b) => b.artist.localeCompare(a.artist));
            break;
        case 'genre-asc':
            filteredMusic.sort((a, b) => a.genre.localeCompare(b.genre));
            break;
        case 'genre-desc':
            filteredMusic.sort((a, b) => b.genre.localeCompare(a.genre));
            break;
        case 'year-asc':
            filteredMusic.sort((a, b) => (a.year || 0) - (b.year || 0));
            break;
        case 'year-desc':
            filteredMusic.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case 'rating-desc':
            filteredMusic.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'rating-asc':
            filteredMusic.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            break;
        case 'date-added':
            filteredMusic.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
    }
    
    // Mostrar resultados
    renderMusicList(filteredMusic);
}

// Renderizar lista de música filtrada/ordenada
function renderMusicList(musicList) {
    // Limpiar la biblioteca
    musicLibrary.innerHTML = '';
    
    if (musicList.length === 0) {
        musicLibrary.innerHTML = '<div class="no-music"><p>No se encontraron canciones</p></div>';
        return;
    }
    
    let container;
    
    if (currentView === 'grid') {
        container = document.createElement('div');
        container.className = 'music-grid';
        
        // Crear tarjetas para vista de cuadrícula
        musicList.forEach(item => {
            const card = document.createElement('div');
            card.className = `music-card grid-view`;
            if (item.index === currentTrackIndex) {
                card.classList.add('active');
            }
            if (item.rating === 5) {
                card.classList.add('five-stars');
            }
            card.dataset.index = item.index;
            
            const metadata = loadMetadata(item.file.name);
            const hasCover = metadata && metadata.cover && metadata.cover !== "";
            
            card.innerHTML = `
                <div class="album-art-container">
                    ${hasCover ? 
                        `<img class="album-art ${item.rating === 5 ? 'golden-art' : ''}" src="${metadata.cover}" alt="Portada">` : 
                        `<div class="album-art ${item.rating === 5 ? 'golden-art' : ''}"><div class="vinyl-overlay ${item.rating === 5 ? 'golden-vinyl' : ''}">${item.title.substring(0, 10)}</div></div>`
                    }
                    <button class="edit-button"><i class="fas fa-edit"></i></button>
                </div>
                <div class="music-info">
                    <div class="music-title">${item.title}</div>
                    <div class="music-artist">${item.artist}</div>
                    ${item.rating > 0 ? `
                        <div class="star-rating">
                            ${Array(5).fill(0).map((_, i) => 
                                `<span class="star ${i < item.rating ? 'active' : ''}">★</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.edit-button')) {
                    playTrack(item.index);
                }
            });
            
            card.querySelector('.edit-button').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(item.index);
            });
            
            container.appendChild(card);
        });
        
    } else if (currentView === 'list') {
        container = document.createElement('div');
        container.className = 'music-list';
        
        // Crear tarjetas para vista de lista
        musicList.forEach(item => {
            const card = document.createElement('div');
            card.className = `music-card list-view`;
            if (item.index === currentTrackIndex) {
                card.classList.add('active');
            }
            if (item.rating === 5) {
                card.classList.add('five-stars');
            }
            card.dataset.index = item.index;
            
            const metadata = loadMetadata(item.file.name);
            const hasCover = metadata && metadata.cover && metadata.cover !== "";
            
            card.innerHTML = `
                <div class="album-art-container">
                    ${hasCover ? 
                        `<img class="album-art ${item.rating === 5 ? 'golden-art' : ''}" src="${metadata.cover}" alt="Portada">` : 
                        `<div class="album-art ${item.rating === 5 ? 'golden-art' : ''}"><div class="vinyl-overlay ${item.rating === 5 ? 'golden-vinyl' : ''}">${item.title.substring(0, 5)}</div></div>`
                    }
                    <button class="edit-button"><i class="fas fa-edit"></i></button>
                </div>
                <div class="music-info">
                    <div class="music-title">${item.title}</div>
                    <div class="music-artist">${item.artist}</div>
                    ${item.rating > 0 ? `
                        <div class="star-rating">
                            ${Array(5).fill(0).map((_, i) => 
                                `<span class="star ${i < item.rating ? 'active' : ''}">★</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.edit-button')) {
                    playTrack(item.index);
                }
            });
            
            card.querySelector('.edit-button').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(item.index);
            });
            
            container.appendChild(card);
        });
        
    } else if (currentView === 'table') {
        // Crear tabla para vista detallada
        const table = document.createElement('table');
        table.className = 'music-table';
        
        // Crear encabezados de tabla
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th></th>
                <th>Título</th>
                <th>Artista</th>
                <th>Colaboradores</th>
                <th>Género</th>
                <th>Año</th>
                <th>Puntuación</th>
                <th>Duración</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Crear cuerpo de tabla
        const tbody = document.createElement('tbody');
        
        musicList.forEach(item => {
            const metadata = loadMetadata(item.file.name);
            const hasCover = metadata && metadata.cover && metadata.cover !== "";
            const isActive = item.index === currentTrackIndex;
            
            const row = document.createElement('tr');
            if (isActive) {
                row.classList.add('active');
            }
            row.dataset.index = item.index;
            
            row.innerHTML = `
                <td class="table-image-cell">
                    <div class="table-image">
                        ${hasCover ? 
                            `<img src="${metadata.cover}" alt="Portada" style="width: 100%; height: 100%; object-fit: cover;">` : 
                            `<div class="table-vinyl ${item.rating === 5 ? 'golden-vinyl' : ''}">${item.title.substring(0, 3)}</div>`
                        }
                    </div>
                </td>
                <td>${item.title}</td>
                <td>${item.artist}</td>
                <td>${item.collaborators || '-'}</td>
                <td>${item.genre || '-'}</td>
                <td>${item.year || '-'}</td>
                <td>${item.rating > 0 ? 
                    Array(5).fill(0).map((_, i) => 
                        `<span class="star ${i < item.rating ? 'active' : ''}">★</span>`
                    ).join('') : '-'
                }</td>
                <td>${formatDuration(item.duration)}</td>
            `;
            
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.edit-button')) {
                    playTrack(item.index);
                }
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        container = table;
    }
    
    musicLibrary.appendChild(container);
    toggleWelcomeMessage();
}

// Cargar música desde una carpeta
async function loadMusicFromFolder(files) {
    musicFiles = Array.from(files).filter(file => 
        file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)
    );

    if (musicFiles.length === 0) {
        musicLibrary.innerHTML = '<div class="no-music"><p>No se encontraron archivos de música en la carpeta seleccionada</p></div>';
        toggleWelcomeMessage();
        return;
    }

    // Guardar ruta de la carpeta
    const path = files[0].webkitRelativePath;
    const folder = path.split('/')[0];
    appConfig.musicFolder = folder;
    appConfig.musicFolderPath = folder;
    selectedFolder.textContent = folder;

    // Obtener duraciones de las canciones
    const durationPromises = musicFiles.map(file => {
        return new Promise(resolve => {
            getAudioDuration(file, (duration) => {
                musicDurations[file.name] = duration;
                resolve();
            });
        });
    });

    // Esperar a que se carguen todas las duraciones
    await Promise.all(durationPromises);

    // Guardar fecha de agregado para nuevas canciones
    musicFiles.forEach(file => {
        const metadata = loadMetadata(file.name) || {};
        if (!metadata.dateAdded) {
            metadata.dateAdded = new Date().toISOString();
            saveMetadata(file.name, metadata);
        }
    });

    // Aplicar filtros y ordenación
    filterAndSortMusic();
    saveConfiguration();
    
    // Guardar metadatos en archivo
    saveMetadataToFile();
}

// Cargar metadatos desde localStorage
function loadMetadata(filename) {
    const metadata = localStorage.getItem(`metadata_${filename}`);
    return metadata ? JSON.parse(metadata) : null;
}

// Guardar metadatos en localStorage
function saveMetadata(filename, metadata) {
    localStorage.setItem(`metadata_${filename}`, JSON.stringify(metadata));
}

// Actualizar estrellas en el modal de edición
function updateEditStars(rating) {
    editStars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    editRatingInput.value = rating;
    currentRating = rating;
}

// Abrir modal de edición
function openEditModal(index) {
    currentEditIndex = index;
    const file = musicFiles[index];
    const metadata = loadMetadata(file.name) || {};
    const rating = metadata.rating || 0;
    
    document.getElementById('edit-title').value = metadata.title || file.name.replace(/\.[^/.]+$/, "");
    document.getElementById('edit-artist').value = metadata.artist || "Desconocido";
    document.getElementById('edit-genre').value = metadata.genre || "";
    document.getElementById('edit-year').value = metadata.year || "";
    document.getElementById('edit-collaborators').value = metadata.collaborators || "";
    
    updateEditStars(rating);
    
    const hasCover = metadata && metadata.cover && metadata.cover !== "";
    if (hasCover) {
        coverPreviewContainer.innerHTML = `<img id="cover-preview" class="cover-preview ${rating === 5 ? 'golden-art' : ''}" src="${metadata.cover}" alt="Vista previa de portada">`;
    } else {
        coverPreviewContainer.innerHTML = `
            <div class="cover-preview ${rating === 5 ? 'golden-art' : ''}" style="display: flex; align-items: center; justify-content: center; background: linear-gradient(45deg, #2a2a2a, #1a1a1a);">
                <div class="vinyl-overlay ${rating === 5 ? 'golden-vinyl' : ''}">${metadata.title || file.name.replace(/\.[^/.]+$/, "").substring(0, 10)}</div>
            </div>
        `;
    }
    
    editModal.style.display = 'flex';
}

// Guardar metadatos editados
function saveEditedMetadata(e) {
    e.preventDefault();
    
    if (currentEditIndex === -1) return;
    
    const file = musicFiles[currentEditIndex];
    const title = document.getElementById('edit-title').value;
    const artist = document.getElementById('edit-artist').value;
    const genre = document.getElementById('edit-genre').value;
    const year = document.getElementById('edit-year').value;
    const collaborators = document.getElementById('edit-collaborators').value;
    const rating = currentRating;
    
    // Verificar si hay una nueva imagen de portada
    const coverPreview = document.getElementById('cover-preview');
    const coverSrc = coverPreview ? coverPreview.src : "";
    
    const metadata = {
        title,
        artist,
        genre,
        year,
        collaborators,
        rating,
        cover: coverSrc,
        dateAdded: loadMetadata(file.name)?.dateAdded || new Date().toISOString()
    };
    
    saveMetadata(file.name, metadata);
    
    // Actualizar la vista
    filterAndSortMusic();
    
    // Si es la canción actual, actualizar la UI del reproductor
    if (currentTrackIndex === currentEditIndex) {
        nowPlayingTitle.textContent = title;
        nowPlayingArtist.textContent = artist;
        
        if (coverSrc) {
            nowPlayingArt.innerHTML = `<img src="${coverSrc}" alt="Portada" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            nowPlayingArt.innerHTML = `<div class="vinyl-overlay ${rating === 5 ? 'golden-vinyl' : ''}">${title.substring(0, 10)}</div>`;
        }
        
        // Aplicar efectos dorados si tiene 5 estrellas
        updatePlayerAppearance(rating);
    }
    
    editModal.style.display = 'none';
    
    // Guardar metadatos en archivo
    saveMetadataToFile();
    
    console.log('Metadatos guardados correctamente');
}

// Actualizar apariencia del reproductor según la puntuación
function updatePlayerAppearance(rating) {
    if (rating === 5) {
        playerElement.classList.add('golden');
        nowPlayingArt.classList.add('golden');
    } else {
        playerElement.classList.remove('golden');
        nowPlayingArt.classList.remove('golden');
    }
}

// Cambiar la portada
function changeCover(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        coverPreviewContainer.innerHTML = `<img id="cover-preview" class="cover-preview ${currentRating === 5 ? 'golden-art' : ''}" src="${event.target.result}" alt="Vista previa de portada">`;
    };
    reader.readAsDataURL(file);
}

// Reproducir una pista
function playTrack(index) {
    if (index < 0 || index >= musicFiles.length) return;
    
    currentTrackIndex = index;
    const file = musicFiles[index];
    const url = URL.createObjectURL(file);
    
    audioElement.src = url;
    audioElement.load();
    audioElement.play();
    
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    // Cargar metadatos guardados
    const metadata = loadMetadata(file.name);
    const title = metadata?.title || file.name.replace(/\.[^/.]+$/, "");
    const artist = metadata?.artist || "Desconocido";
    const hasCover = metadata && metadata.cover && metadata.cover !== "";
    const rating = metadata?.rating || 0;
    
    // Actualizar información de la canción actual
    nowPlayingTitle.textContent = title;
    nowPlayingArtist.textContent = artist;
    
    if (hasCover) {
        nowPlayingArt.innerHTML = `<img src="${metadata.cover}" alt="Portada" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        nowPlayingArt.innerHTML = `<div class="vinyl-overlay ${rating === 5 ? 'golden-vinyl' : ''}">${title.substring(0, 10)}</div>`;
    }
    
    // Aplicar efectos dorados si tiene 5 estrellas
    updatePlayerAppearance(rating);
    
    // Resaltar la canción actual
    document.querySelectorAll('.music-card, .music-table tr').forEach(element => {
        element.classList.remove('active');
    });
    
    if (currentView === 'table') {
        const rows = document.querySelectorAll('.music-table tr');
        if (rows.length > index + 1) { // +1 porque la primera fila es el encabezado
            rows[index + 1].classList.add('active');
        }
    } else {
        const currentCard = document.querySelector(`.music-card[data-index="${index}"]`);
        if (currentCard) {
            currentCard.classList.add('active');
        }
    }
}

// Obtener el índice de la siguiente canción según el modo de reproducción
function getNextTrackIndex() {
    if (repeatMode === 2) return currentTrackIndex; // Repetir canción actual
    
    if (isShuffleActive) {
        // Modo aleatorio
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * musicFiles.length);
        } while (randomIndex === currentTrackIndex && musicFiles.length > 1);
        return randomIndex;
    } else {
        // Modo normal
        const nextIndex = currentTrackIndex + 1;
        if (nextIndex >= musicFiles.length) {
            return repeatMode === 1 ? 0 : -1; // Volver al inicio si está en modo repetir lista
        }
        return nextIndex;
    }
}

// Obtener el índice de la canción anterior
function getPrevTrackIndex() {
    if (isShuffleActive) {
        // Modo aleatorio
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * musicFiles.length);
        } while (randomIndex === currentTrackIndex && musicFiles.length > 1);
        return randomIndex;
    } else {
        // Modo normal
        const prevIndex = currentTrackIndex - 1;
        if (prevIndex < 0) {
            return repeatMode === 1 ? musicFiles.length - 1 : -1;
        }
        return prevIndex;
    }
}

// Pausar/reanudar reproducción
function togglePlayPause() {
    if (musicFiles.length === 0) return;
    
    if (isPlaying) {
        audioElement.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioElement.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    isPlaying = !isPlaying;
}

// Siguiente canción
function nextTrack() {
    const nextIndex = getNextTrackIndex();
    if (nextIndex >= 0) {
        playTrack(nextIndex);
    } else {
        // Fin de la lista
        audioElement.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Canción anterior
function prevTrack() {
    const prevIndex = getPrevTrackIndex();
    if (prevIndex >= 0) {
        playTrack(prevIndex);
    }
}

// Alternar modo aleatorio
function toggleShuffle() {
    isShuffleActive = !isShuffleActive;
    updateShuffleButton();
    saveConfiguration();
}

// Cambiar modo de repetición
function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    updateRepeatButton();
    saveConfiguration();
}

// Actualizar barra de progreso
function updateProgress() {
    const { currentTime, duration } = audioElement;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        
        // Actualizar tiempos
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
    }
}

// Formatear tiempo (segundos a MM:SS)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Establecer progreso al hacer clic en la barra
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioElement.duration;
    audioElement.currentTime = (clickX / width) * duration;
}

// Ajustar volumen
function setVolume() {
    const volume = volumeSlider.value / 100;
    audioElement.volume = volume;
    updateVolumeIcon(volumeSlider.value);
    saveConfiguration();
}

// Silenciar/activar sonido
function toggleMute() {
    if (audioElement.volume > 0) {
        audioElement.volume = 0;
        volumeSlider.value = 0;
        updateVolumeIcon(0);
    } else {
        audioElement.volume = volumeSlider.value / 100;
        updateVolumeIcon(volumeSlider.value);
    }
    saveConfiguration();
}

// Actualizar valores de los sliders en tiempo real
function updateSliderValues() {
    uiOpacityValue.textContent = `${Math.round(uiOpacityInput.value * 100)}%`;
    cardOpacityValue.textContent = `${Math.round(cardOpacityInput.value * 100)}%`;
    buttonOpacityValue.textContent = `${Math.round(buttonOpacityInput.value * 100)}%`;
    borderRadiusValue.textContent = `${borderRadiusInput.value}px`;
}

// Manejador de atajos de teclado
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignorar si estamos en un campo de entrada
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (e.ctrlKey) {
                    // Avanzar 10 segundos
                    audioElement.currentTime = Math.min(audioElement.currentTime + 10, audioElement.duration);
                } else {
                    nextTrack();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (e.ctrlKey) {
                    // Retroceder 10 segundos
                    audioElement.currentTime = Math.max(audioElement.currentTime - 10, 0);
                } else {
                    prevTrack();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                // Aumentar volumen
                volumeSlider.value = Math.min(parseInt(volumeSlider.value) + 10, 100);
                setVolume();
                break;
            case 'ArrowDown':
                e.preventDefault();
                // Disminuir volumen
                volumeSlider.value = Math.max(parseInt(volumeSlider.value) - 10, 0);
                setVolume();
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
            case 'KeyS':
                e.preventDefault();
                toggleShuffle();
                break;
            case 'KeyR':
                e.preventDefault();
                toggleRepeat();
                break;
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Configurar atajos de teclado
    setupKeyboardShortcuts();
    
    // Cargar configuración
    await loadConfiguration();
    
    // Evento para cambiar idioma
    languageSelect.addEventListener('change', async () => {
        await loadLanguage(languageSelect.value);
        saveConfiguration();
    });
    
    // Eventos de botones de control
    playBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // Eventos de selección de vista
    gridViewBtn.addEventListener('click', () => changeView('grid'));
    listViewBtn.addEventListener('click', () => changeView('list'));
    tableViewBtn.addEventListener('click', () => changeView('table'));
    
    // Eventos de la barra de progreso
    audioElement.addEventListener('timeupdate', updateProgress);
    progressBar.addEventListener('click', setProgress);
    
    // Eventos de final de canción
    audioElement.addEventListener('ended', nextTrack);
    
    // Eventos de volumen
    volumeSlider.addEventListener('input', setVolume);
    volumeBtn.addEventListener('click', toggleMute);
    
    // Eventos de búsqueda y ordenación
    searchInput.addEventListener('input', filterAndSortMusic);
    sortSelect.addEventListener('change', () => {
        filterAndSortMusic();
        saveConfiguration();
    });
    
    // Eventos del modal de configuración
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });
    
    closeSettingsModalBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
    
    // Guardar configuración
    saveConfigBtn.addEventListener('click', saveConfiguration);
    
    // Selector de imagen de fondo
    backgroundImageBtn.addEventListener('click', () => {
        backgroundImageInput.click();
    });
    
    backgroundImageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            changeBackgroundImage(e.target.files[0]);
        }
    });
    
    removeBackgroundBtn.addEventListener('click', removeBackgroundImage);
    
    // Actualizar valores de sliders
    uiOpacityInput.addEventListener('input', updateSliderValues);
    cardOpacityInput.addEventListener('input', updateSliderValues);
    buttonOpacityInput.addEventListener('input', updateSliderValues);
    borderRadiusInput.addEventListener('input', updateSliderValues);
    
    // Selección de carpeta
    folderInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            loadMusicFromFolder(files);
        }
    });
    
    // Botón de selección de carpeta desde welcome message
    selectFolderBtn.addEventListener('click', () => {
        folderInput.click();
    });
    
    // Eventos del modal de edición
    closeEditModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });
    
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Eventos de estrellas en el modal de edición
    editStars.forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = parseInt(e.target.getAttribute('data-rating'));
            updateEditStars(rating);
        });
    });
    
    metadataForm.addEventListener('submit', saveEditedMetadata);
    editCoverInput.addEventListener('change', changeCover);
    
    // Eventos de importación/exportación de configuración
    exportConfigBtn.addEventListener('click', exportConfiguration);
    importConfigBtn.addEventListener('click', () => {
        configFileInput.click();
    });
    
    configFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importConfiguration(e.target.files[0]);
        }
    });
});