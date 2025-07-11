// Wait for DOM to load
// Configuración de Supabase
const SUPABASE_URL = 'https://sdijawcsjbtzuddwvdnt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkaWphd2NzamJ0enVkZHd2ZG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDAxMjcsImV4cCI6MjA2NjExNjEyN30.rtZyHy2syXsm6ZwgNeJQvAbzhMeqW0VlQRjbEb28v2Q';
let supabase;



// Variables de autenticación
let currentUser = null;

// Función para login con Google
async function loginWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                //redirectTo: 'https://probatio-secure.vercel.app/',
                redirectTo: 'https://probatio-app.github.io/cronometraje-app-sheets/',
                queryParams: {
                    prompt: 'select_account'
                }
            }
        });
        
        if (error) {
            console.error('Error en login:', error);
            alert('Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error al iniciar sesión');
    }
}

// Función para logout
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error en logout:', error);
        } else {
            currentUser = null;
            showLoginScreen();
        }
    } catch (error) {
        console.error('Error en logout:', error);
    }
}

// Mostrar pantalla de login
function showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('user-info').classList.add('hidden');
}

// Ocultar pantalla de login
function hideLoginScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('user-info').classList.remove('hidden');
}
// ========================================
// FUNCIONES PARA CLUBS EN SUPABASE
// ========================================

// Cargar clubs del usuario desde Supabase
async function loadClubsFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('clubs')
            .select('*')
            .order('name');
            
        if (error) {
            console.error('Error cargando clubs:', error);
            return {};
        }
        
        // Convertir a formato que usa la app
        const clubsData = {};
        for (const club of data) {
            clubsData[club.name] = {}; // Por ahora vacío, después agregamos divisiones
        }
                
        return clubsData;
    } catch (error) {
        console.error('Error cargando clubs:', error);
        return {};
    }
}

// Crear club en Supabase
async function createClubInSupabase(clubName) {
    try {
        const { data, error } = await supabase
            .from('clubs')
            .insert([
                { 
                    name: clubName,
                    user_id: currentUser.id 
                }
            ])
            .select();
            
        if (error) {
            console.error('Error creando club:', error);
            return false;
        }
                
        return true;
    } catch (error) {
        console.error('Error creando club:', error);
        return false;
    }
}

// Eliminar club de Supabase
async function deleteClubFromSupabase(clubName) {
    try {
        // PRIMERO: Borrar todos los athletes de este club
        const { error: errorAthletes } = await supabase
            .from('athletes')
            .delete()
            .eq('club_name', clubName)
            .eq('user_id', currentUser.id);
            
        if (errorAthletes) {
            console.error('Error eliminando athletes del club:', errorAthletes);
            return false;
        }
        
        // SEGUNDO: Borrar todas las divisions de este club
        const { error: errorDivisions } = await supabase
            .from('divisions')
            .delete()
            .eq('club_name', clubName)
            .eq('user_id', currentUser.id);
            
        if (errorDivisions) {
            console.error('Error eliminando divisions del club:', errorDivisions);
            return false;
        }
        
        // TERCERO: Borrar el club
        const { error } = await supabase
            .from('clubs')
            .delete()
            .eq('name', clubName)
            .eq('user_id', currentUser.id);
            
        if (error) {
            console.error('Error eliminando club:', error);
            return false;
        }
        
        console.log('Club eliminado con cascada:', clubName);
        return true;
    } catch (error) {
        console.error('Error eliminando club:', error);
        return false;
    }
}

// ========================================
// FUNCIONES PARA DIVISIONS EN SUPABASE
// ========================================

// Cargar divisions de un club desde Supabase
async function loadDivisionsFromSupabase(clubName) {
    try {
        const { data, error } = await supabase
            .from('divisions')
            .select('*')
            .eq('club_name', clubName)
            .order('name');
            
        if (error) {
            console.error('Error cargando divisions:', error);
            return [];
        }
        
        // Convertir a array de nombres (formato que usa la app)
        const divisionsArray = data.map(division => division.name);
        
        console.log(`Divisions cargadas desde Supabase para ${clubName}:`, divisionsArray);
        return divisionsArray;
    } catch (error) {
        console.error('Error cargando divisions:', error);
        return [];
    }
}

// Crear division en Supabase
async function createDivisionInSupabase(clubName, divisionName) {
    try {
        const { data, error } = await supabase
            .from('divisions')
            .insert([
                { 
                    name: divisionName,
                    club_name: clubName,
                    user_id: currentUser.id 
                }
            ])
            .select();
            
        if (error) {
            console.error('Error creando division:', error);
            return false;
        }        
        
        return true;
    } catch (error) {
        console.error('Error creando division:', error);
        return false;
    }
}

// Eliminar division de Supabase
async function deleteDivisionFromSupabase(clubName, divisionName) {
    try {
        // PRIMERO: Borrar todos los athletes de esta division
        const { error: errorAthletes } = await supabase
            .from('athletes')
            .delete()
            .eq('club_name', clubName)
            .eq('division_name', divisionName)
            .eq('user_id', currentUser.id);
            
        if (errorAthletes) {
            console.error('Error eliminando athletes de la division:', errorAthletes);
            return false;
        }
        
        // SEGUNDO: Borrar la division
        const { error } = await supabase
            .from('divisions')
            .delete()
            .eq('name', divisionName)
            .eq('club_name', clubName)
            .eq('user_id', currentUser.id);
            
        if (error) {
            console.error('Error eliminando division:', error);
            return false;
        }
        
        console.log('Division eliminada con cascada:', divisionName, 'del club', clubName);
        return true;
    } catch (error) {
        console.error('Error eliminando division:', error);
        return false;
    }
}

// ========================================
// FUNCIONES PARA ATHLETES EN SUPABASE
// ========================================

// Cargar athletes de una division desde Supabase
async function loadAthletesFromSupabase(clubName, divisionName) {
    try {
        const { data, error } = await supabase
            .from('athletes')
            .select('*')
            .eq('club_name', clubName)
            .eq('division_name', divisionName)
            .order('position');
            
        if (error) {
            console.error('Error cargando athletes:', error);
            return { active: [], dns: [] };
        }
        
        // Separar por is_dns
        const activeAthletes = [];
        const dnsAthletes = [];
        
        data.forEach(athlete => {
            if (athlete.is_dns) {
                dnsAthletes.push(athlete.name);
            } else {
                activeAthletes.push(athlete.name);
            }
        });
        
        console.log(`Athletes activos: ${activeAthletes.length}, DNS: ${dnsAthletes.length}`);
        
        return {
            active: activeAthletes,
            dns: dnsAthletes
        };
    } catch (error) {
        console.error('Error cargando athletes:', error);
        return { active: [], dns: [] };
    }
}

// Crear athlete en Supabase
async function createAthleteInSupabase(clubName, divisionName, athleteName) {
    try {
        const { data, error } = await supabase
            .from('athletes')
            .insert([
                { 
                    name: athleteName,
                    club_name: clubName,
                    division_name: divisionName,
                    user_id: currentUser.id 
                }
            ])
            .select();
            
        if (error) {
            console.error('Error creando athlete:', error);
            return false;
        }
        
        console.log('Athlete creado en Supabase:', data[0]);
        return true;
    } catch (error) {
        console.error('Error creando athlete:', error);
        return false;
    }
}

// Eliminar athlete de Supabase
async function deleteAthleteFromSupabase(clubName, divisionName, athleteName) {
    try {
        const { error } = await supabase
            .from('athletes')
            .delete()
            .eq('name', athleteName)
            .eq('club_name', clubName)
            .eq('division_name', divisionName)
            .eq('user_id', currentUser.id);
            
        if (error) {
            console.error('Error eliminando athlete:', error);
            return false;
        }
        
        console.log('Athlete eliminado de Supabase:', athleteName, 'de', clubName, '-', divisionName);
        return true;
    } catch (error) {
        console.error('Error eliminando athlete:', error);
        return false;
    }
}


// ========================================
// FUNCIONES PARA RESULTS BACKUP EN SUPABASE
// ========================================





// ========================================
// FUNCIONES PARA TESTS EN SUPABASE
// ========================================

// Cargar tests del usuario desde Supabase

async function loadTestsFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('tests')
            .select('*')
            .order('name');
            
        if (error) {
            console.error('Error cargando tests:', error);
            return {};
        }
        
        // Convertir a formato testConfig que usa la app
        const testsData = {};
        for (const test of data) {
            testsData[test.name] = {
                times: test.times,
                repetitions: test.repetitions,
                recovery: test.recovery,
                distances: test.distances || "N/A",
                description: test.description || "",
                deadTime: test.dead_time || 2
            };
        }
        
       
        return testsData;
    } catch (error) {
        console.error('Error cargando tests:', error);
        return {};
    }
}


// Crear test en Supabase

async function createTestInSupabase(name, times, repetitions, recovery, distances, description, deadTime) {
    try {
        const { data, error } = await supabase
            .from('tests')
            .insert([
                { 
                    name: name,
                    times: times,
                    repetitions: repetitions,
                    recovery: recovery,
                    distances: distances || null,
                    description: description || null,
                    dead_time: deadTime,
                    user_id: currentUser.id 
                }
            ])
            .select();
            
        if (error) {
            console.error('Error creando test:', error);
            return false;
        }
        
        console.log('Test creado en Supabase:', data[0]);
        return true;
    } catch (error) {
        console.error('Error creando test:', error);
        return false;
    }
}


// Eliminar test de Supabase
async function deleteTestFromSupabase(testName) {
    try {
        const { error } = await supabase
            .from('tests')
            .delete()
            .eq('name', testName)
            .eq('user_id', currentUser.id);
            
        if (error) {
            console.error('Error eliminando test:', error);
            return false;
        }
        
        console.log('Test eliminado de Supabase:', testName);
        return true;
    } catch (error) {
        console.error('Error eliminando test:', error);
        return false;
    }
}

// Actualizar estado DNS de un atleta en Supabase
async function updateAthleteDnsStatus(clubName, divisionName, athleteName, isDns) {
    try {
        const { error } = await supabase
            .from('athletes')
            .update({ is_dns: isDns })
            .eq('name', athleteName)
            .eq('club_name', clubName)
            .eq('division_name', divisionName)
            .eq('user_id', currentUser.id);
            
        if (error) {
            console.error('Error actualizando DNS status:', error);
            return false;
        }
        
        console.log(`Atleta ${athleteName} actualizado: is_dns = ${isDns}`);
        return true;
    } catch (error) {
        console.error('Error actualizando DNS status:', error);
        return false;
    }
}


document.addEventListener('DOMContentLoaded', async () => {  
    // Funcionalidad para botones de CLUB y DIVISION
    const clubModalBtn = document.getElementById('club-modal-btn');
    const divisionModalBtn = document.getElementById('division-modal-btn');
    const clubModal = document.getElementById('club-selection-modal');
    const divisionModal = document.getElementById('division-selection-modal');
    const clubModalList = document.getElementById('club-modal-list');
    const divisionModalList = document.getElementById('division-modal-list');
    
    // Función para actualizar texto en botones
    const updateSelectionButtons = () => {
        const clubText = document.getElementById('selected-club-text');
        const divisionText = document.getElementById('selected-division-text');
        
        if (clubText) {
            clubText.textContent = selectedClub || '--';
        }
        if (divisionText) {
            divisionText.textContent = selectedDivision || '--';
        }
    };
    
    // Abrir modal de CLUB
    if (clubModalBtn) {
        clubModalBtn.addEventListener('click', () => {
            if (testInProgress || athleteInTest) return;
            
            clubModalList.innerHTML = '';
            Object.keys(data).forEach(club => {
                const item = document.createElement('div');
                item.className = 'modal-list-item';
                item.textContent = club;
                item.addEventListener('click', () => {
                    selectedClub = club;
                    clubSelect.value = club;
                    clubSelect.dispatchEvent(new Event('change'));
                    clubModal.classList.remove('show');
                    updateSelectionButtons();
                });
                clubModalList.appendChild(item);
            });
            clubModal.classList.add('show');
        });
    }
    
    // Abrir modal de DIVISION
    if (divisionModalBtn) {
        divisionModalBtn.addEventListener('click', () => {
            if (!selectedClub || testInProgress || athleteInTest) return;
            
            divisionModalList.innerHTML = '';
            if (data[selectedClub]) {
                Object.keys(data[selectedClub]).forEach(division => {
                    const item = document.createElement('div');
                    item.className = 'modal-list-item';
                    item.textContent = division;
                    item.addEventListener('click', () => {
                        selectedDivision = division;
                        divisionSelect.value = division;
                        divisionSelect.dispatchEvent(new Event('change'));
                        divisionModal.classList.remove('show');
                        updateSelectionButtons();
                    });
                    divisionModalList.appendChild(item);
                });
            }
            divisionModal.classList.add('show');
        });
    }
    
    // Cerrar modales
    document.getElementById('close-club-modal').addEventListener('click', () => {
        clubModal.classList.remove('show');
    });
    
    document.getElementById('close-division-modal').addEventListener('click', () => {
        divisionModal.classList.remove('show');
    });
    
    // Habilitar/deshabilitar botón de division
    const updateDivisionButton = () => {
        if (divisionModalBtn) {
            divisionModalBtn.disabled = !selectedClub || testInProgress || athleteInTest;
        }
    };     
    // Funcionalidad para botón TEST
    const testModalBtn = document.getElementById('test-modal-btn');
    const testModal = document.getElementById('test-selection-modal');
    const testModalList = document.getElementById('test-modal-list');
    
    // Actualizar texto del botón TEST
    const updateTestButton = () => {
        const testText = document.getElementById('selected-test-text');
        if (testText) {
            testText.textContent = selectedTest || '--';
        }
    };
    
    // Abrir modal de TEST
    if (testModalBtn) {
        testModalBtn.addEventListener('click', () => {
            if (testInProgress || athleteInTest) return;
            
            testModalList.innerHTML = '';
            Object.keys(testConfig).forEach(testName => {
                const item = document.createElement('div');
                item.className = 'modal-list-item';
                item.textContent = testName;
                item.addEventListener('click', () => {
                    selectedTest = testName;
                    testSelect.value = testName;
                    testSelect.dispatchEvent(new Event('change'));
                    testModal.classList.remove('show');
                    updateTestButton();
                });
                testModalList.appendChild(item);
            });
            testModal.classList.add('show');
        });
    }
    
    // Cerrar modal TEST
    document.getElementById('close-test-modal').addEventListener('click', () => {
        testModal.classList.remove('show');
    });
    // Esperar hasta que window.supabase esté disponible
    while (!window.supabase) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }  
   // Configurar listener de autenticación
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            currentUser = session.user;
            hideLoginScreen();        
            // Mostrar info del usuario
            const userAvatar = document.getElementById('user-avatar');
            const userName = document.getElementById('user-name');
            if (userAvatar && userName) {
                userAvatar.src = currentUser.user_metadata?.avatar_url || '';
                userName.textContent = currentUser.user_metadata?.name || currentUser.email || 'Usuario';
            }   
            // Verificar si hay backup de resultados  
                if (!window.backupChecked) {
                    window.backupChecked = true;
                    loadResultsBackupFromSupabase().then(backup => {
                        if (backup && backup.saved_results && backup.saved_results.length > 0) {
                            if (confirm(backup.saved_results.length + ' saved results found from previous session. Do you want to recover them?')) {
                                savedResults = backup.saved_results;
                                updateResultsList();
                                console.log('Resultados recuperados:', savedResults.length);
                            }
                        }
                    });
                }
            
            // Cargar clubs del usuario desde Supabase

        // SIN AWAIT - usando .then()
                loadClubsFromSupabase().then(clubsFromSupabase => {
                    data = clubsFromSupabase;
                    
                    loadTestsFromSupabase().then(testsFromSupabase => {
                        testConfig = testsFromSupabase;
                        updateTestSelect();
                        
                        // Cargar divisions para cada club
                        Promise.all(Object.keys(data).map(clubName => 
                            loadDivisionsFromSupabase(clubName).then(divisionsArray => {
                                data[clubName] = {};
                                return Promise.all(divisionsArray.map(divisionName =>
                                    loadAthletesFromSupabase(clubName, divisionName).then(athletesData => {
                                        // Guardar solo los activos en data (por compatibilidad)
                                        data[clubName][divisionName] = athletesData.active;
                                    })
                                ));
                            })
                        )).then(() => {
                            updateClubsDropdown();
                            updateChronoClubs();
                            // Re-setup athletes page para que funcionen los event listeners
                            if (document.getElementById('page-athletes')) {
                                setupAthletesPage();
                            }
                        });
                    });
                });



        } else {
            currentUser = null;
            showLoginScreen();
            console.log('Usuario deslogueado');
        }
    });

    // Configurar botón de login
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', loginWithGoogle);
    }

    // Configurar botón de logout
    const logoutBtn = document.getElementById('user-logout-area');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Configurar botón de Bug Report
    const bugReportBtn = document.getElementById('bug-report-btn');
    if (bugReportBtn) {
        bugReportBtn.addEventListener('click', () => {
            const userEmail = currentUser?.email || 'unknown';
            const version = 'v58.39';
            const subject = encodeURIComponent('PROBATIO - Bug Report');
            const body = encodeURIComponent(`Hi PROBATIO team,

    I found an issue in the app:

    [Describe the bug or improvement here]

    Steps to reproduce:
    1. 
    2. 
    3. 

    Expected behavior:


    Actual behavior:


    ---
    App Version: ${version}
    User: ${userEmail}
    Date: ${new Date().toLocaleString()}
    Browser: ${navigator.userAgent}`);
            
            window.location.href = `mailto:info@cronopic.es?subject=${subject}&body=${body}`;
        });
    }
    
    // Data mock - ahora modificable para agregar atletas/clubs/divisiones
    let data = {};

  
    // Test config se carga desde Supabase
    let testConfig = {};

    // Variables globales
    let selectedTest = '';
    let selectedClub = '';
    let selectedDivision = '';
    let selectedAthlete = '';
    let availableDivisions = [];
    let availableAthletes = [];
    let testInProgress = false;
    let athleteInTest = false;
    let testStates = {};    
    let testFinished = false;

    let savedResults = []; // Array para guardar todos los resultados completados

    // Guardar backup de resultados
async function saveResultsBackupToSupabase() {
    try {
        // Primero borrar backup anterior del usuario
        await supabase
            .from('results_backup')
            .delete()
            .eq('user_id', currentUser.id);
            
        // Guardar nuevo backup
        const { data, error } = await supabase
            .from('results_backup')
            .insert([
                { 
                    user_id: currentUser.id,
                    saved_results: savedResults
                }
            ])
            .select();
            
        if (error) {
            console.error('Error guardando backup:', error);
            return false;
        }
        
        console.log('Backup guardado en Supabase');
        return true;
    } catch (error) {
        console.error('Error guardando backup:', error);
        return false;
    }
}

// Recuperar backup de resultados
async function loadResultsBackupFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('results_backup')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('updated_at', { ascending: false })
            .limit(1);
            
        if (error) {
            console.error('Error cargando backup:', error);
            return null;
        }
        
        if (data && data.length > 0) {
            return data[0];
        }
        
        return null;
    } catch (error) {
        console.error('Error cargando backup:', error);
        return null;
    }
}

    const timeToSeconds = (timeStr) => {
        // Obtener formato seleccionado
        const formatOption = document.querySelector('input[name="export-format"]:checked');
        const useMilliseconds = formatOption && formatOption.value === 'milliseconds';
        
        if (typeof timeStr === 'number') return timeStr;
        
        // MANTENER DNF COMO TEXTO
        if (timeStr === 'DNF') return 'DNF';
        
        if (!timeStr || typeof timeStr !== 'string' || timeStr === '--' || timeStr === '') {
            return null;
        }
        
        const parts = timeStr.split('.');
        if (parts.length === 2) {
            if (useMilliseconds) {
                // Retornar milisegundos como entero
                return parseInt(parts[0]) * 1000 + parseInt(parts[1]);
            } else {
                // Retornar segundos con decimales (formato original)
                return parseFloat(parts[0]) + (parseFloat(parts[1]) / 1000);
            }
        }
        return null;
    };

    // Estados del cronómetro 
    let currentClub = '';
    let currentDivision = '';
    let athleteQueue = [];
    let testedAthletes = [];
    let currentAthlete = '';
    let startTime = null;
    let interval = null;
    let laps = [];
    let impulses = 0;
    let impulseLimit = 0;
    let currentRepetition = 0;
    let totalRepetitions = 0;
    let isRecovering = false;
    let recoveryStartTime = null;
    let recoveryInterval = null;
    let recoveryDuration = 0;
    let repResults = [];
    let currentAthleteSplits = [];
    let currentAthleteLaps = [];
    let testCompletionTime = null;

    // DOM elements
    const testSelect = document.getElementById('test-select');
    const clubSelect = document.getElementById('club-select');
    const divisionSelect = document.getElementById('division-select');
    const athleteSelect = document.getElementById('athlete-select');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const saveBtn = document.getElementById('save-btn');    
    const chronoEl = document.getElementById('chrono');
    const testConfigEl = document.getElementById('test-config');

    // ========================================
    // NUEVAS FUNCIONES PARA FOTOCÉLULAS
    // ========================================
    
    // Sistema de tiempo muerto para fotocélulas
    let channelLastFired = {}; // {canal: timestamp}
    let DEAD_TIME = 2000; // Por defecto 2 segundos
    
    // Función para simular trama bluetooth de fotocélula
    const simulatePhotocellFrame = (channel) => {
        const now = Date.now();
        
        // Usar el dead time del test seleccionado
        if (selectedTest && testConfig[selectedTest] && testConfig[selectedTest].deadTime) {
            DEAD_TIME = testConfig[selectedTest].deadTime * 1000;
        }
        
        // El canal que llega es el número real del dispositivo
        let deviceName = `F${channel}`;
        
        // Verificar tiempo muerto
        if (channelLastFired[channel]) {
            const timeSinceLastFire = now - channelLastFired[channel];
            if (timeSinceLastFire < DEAD_TIME) {
                const remaining = ((DEAD_TIME - timeSinceLastFire) / 1000).toFixed(1);
                console.log(`❌ R${channel} IGNORADO - Dead time (${remaining}s restante)`);
                
               // SEMÁFORO ROJO
                const semaforo = document.getElementById('chrono-semaforo');
                const semaforoText = document.getElementById('semaforo-text');
                if (semaforo && semaforoText) {
                    semaforo.style.background = '#ff0000';
                    semaforo.style.borderColor = '#ff0000';
                    semaforoText.textContent = deviceName;
                    semaforoText.style.color = '#ccc';
                    // Volver a gris después del tiempo restante
                    setTimeout(() => {
                        semaforo.style.background = '#222';
                        semaforo.style.borderColor = '#444';
                        semaforoText.textContent = '';
                        semaforoText.style.color = '#ccc';
                    }, timeSinceLastFire + DEAD_TIME - now);
                } 
                return;
            }
        }
        
        // Registrar el disparo
        channelLastFired[channel] = now;
        console.log(`✅ R${channel} ACEPTADO - Disparando cronómetro`);
        
        // SEMÁFORO VERDE
        const semaforo = document.getElementById('chrono-semaforo');
        const semaforoText = document.getElementById('semaforo-text');
        if (semaforo && semaforoText) {
            semaforo.style.background = '#00ff00';
            semaforo.style.borderColor = '#00ff00';
            semaforoText.textContent = deviceName;
            semaforoText.style.color = '#333';
            // Volver a gris después del dead time
            setTimeout(() => {
                semaforo.style.background = '#222';
                semaforo.style.borderColor = '#444';
                semaforoText.textContent = '';
                semaforoText.style.color = '#ccc';
            }, DEAD_TIME);
        }
        
        // Buscar el botón START dentro del DOM
        const startButton = document.getElementById('start-btn');
        if (!startButton) {
            console.log('❌ ERROR: No se encuentra el botón START');
            return;
        }
        
        // Disparar el cronómetro directamente
        startButton.click();
    };

    

    // Funciones exactas del vanilla original
    const formatDateTime = () => {
        const now = new Date();
        const date = now.toLocaleDateString('es-AR');
        const time = now.toLocaleTimeString('es-AR', { hour12: false });
        return `${date} - ${time}`;
    };

    const showTestCompleted = () => {
        chronoEl.textContent = testCompletionTime;
        chronoEl.style.fontSize = '24px';
        chronoEl.style.color = '#4ecdc4';
        //currentAthleteEl.textContent = 'TEST COMPLETED';        
    };

    const formatTime = (ms) => {
    // Limitar a 999.999 segundos
        if (ms >= 999999) {
            return "999.999";
        }
        const s = Math.floor(ms / 1000);
        const millis = ms % 1000;
        return `${s.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
    };

    
    const updateCounters = () => {
    const repCounterEl = document.getElementById('rep-counter');
    if (repCounterEl) {
        const config = testConfig[selectedTest];
        
        if (config && config.times > 1 && config.repetitions > 1) {
            // Para tests combinados: mostrar repetición actual
            repCounterEl.textContent = `(${currentRepetition}/${config.repetitions})`;
        } else {
            // Para tests simples (RAST, SPRINT, AGILITY): repetición siempre es 1/1
            repCounterEl.textContent = `(1/1)`;
        }
    }     
    


    // CONTADOR TIMES (arriba del cronómetro) - SIEMPRE CON NOMBRE
    const timeCounterEl = document.getElementById('time-counter');
    if (timeCounterEl) {
        const config = testConfig[selectedTest];
        if (config && config.times > 1 && config.repetitions > 1) {
            // Para tests combinados: mostrar nombre + tiempos dentro de repetición
            timeCounterEl.textContent = `${currentAthlete} (${impulses}/${config.times})`;
        } else if (config && config.repetitions === 1 && config.recovery > 0) {
            // Para RAST: mostrar nombre + tiempo actual dentro de la secuencia  
            timeCounterEl.textContent = `${currentAthlete} (${impulses}/${config.times})`;
        } else {
            // Para SPRINT y AGILITY: mostrar nombre + progreso
            timeCounterEl.textContent = `${currentAthlete} (${impulses}/${Math.max(config.times, config.repetitions)})`;
        }
    }
};

    const formatFromMilliseconds = (ms) => {
        // Limitar a 999.999 segundos
        if (ms >= 999999) {
            return "999.999";
        }
        const s = Math.floor(ms / 1000);
        const millis = ms % 1000;
        return `${s.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
    };

    const updateChrono = () => {
        const now = Date.now();
        chronoEl.textContent = formatTime(now - startTime);
    };

    const resetDisplay = () => {
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`split-${i}`).textContent = '--';
            document.getElementById(`lap-${i}`).textContent = '--';
        }
    };

    const showRecovery = (seconds) => {
        if (seconds <= 0) {
            chronoEl.textContent = "00.000";
            chronoEl.classList.add('recovery');
            chronoEl.style.color = '#ff0000';
        } else {
            chronoEl.textContent = `RECOVERY: ${seconds}`;
            chronoEl.classList.remove('recovery');
            chronoEl.style.color = '#fff';
        }
    };

    const updateRecovery = () => {
        if (!isRecovering || !recoveryStartTime) return;
        
        const elapsed = Date.now() - recoveryStartTime;
        const remaining = Math.max(0, recoveryDuration - Math.floor(elapsed / 1000));
        
        if (remaining <= 0) {
            showRecovery(0);
            clearInterval(recoveryInterval);
        } else {
            showRecovery(remaining);
        }
    };
    

    const updateDisplay = () => {
        let cumulativeMs = 0;
        const splitsMs = [];
        
        for (let i = 0; i < repResults.length && i < 6; i++) {
            const repMs = repResults[i];
            cumulativeMs += repMs;
            splitsMs.push(cumulativeMs);
            
            document.getElementById(`split-${i + 1}`).textContent = formatFromMilliseconds(cumulativeMs);
            
            if (i === 0) {
                document.getElementById(`lap-${i + 1}`).textContent = formatFromMilliseconds(cumulativeMs);
            } else {
                const lapMs = cumulativeMs - splitsMs[i-1];
                document.getElementById(`lap-${i + 1}`).textContent = formatFromMilliseconds(lapMs);
            }
        }
    };


    const saveRepetitionData = (athleteName, repNumber, splits, laps) => {
        const testKey = getCurrentTestKey();
        
        if (!testStates[testKey]) {
            testStates[testKey] = {};
        }
        
        if (!testStates[testKey].athleteRepetitions) {
            testStates[testKey].athleteRepetitions = {};
        }
        
        if (!testStates[testKey].athleteRepetitions[athleteName]) {
            testStates[testKey].athleteRepetitions[athleteName] = [];
        }
        
        // Guardar datos de esta repetición
        testStates[testKey].athleteRepetitions[athleteName].push({
            repetition: repNumber,
            splits: [...splits],
            laps: [...laps]
        });
    };



    const addTested = (name) => {
        const config = testConfig[selectedTest];
        const isCombiTest = config.times > 1 && config.repetitions > 1;
        
        if (isCombiTest) {
        // GUARDAR la última repetición antes de procesar
        const testKey = getCurrentTestKey();
        if (!testStates[testKey]) testStates[testKey] = {};
        if (!testStates[testKey].athleteRepetitions) testStates[testKey].athleteRepetitions = {};
        if (!testStates[testKey].athleteRepetitions[name]) testStates[testKey].athleteRepetitions[name] = [];
        
        testStates[testKey].athleteRepetitions[name].push({
            repetition: currentRepetition,
            splits: [...currentAthleteSplits],
            laps: [...currentAthleteLaps]
        });

        // Para tests combinados: guardar datos de todas las repeticiones
        const athleteResult = {
            name: name,
            totalTime: 0, // Se calculará después
            formattedTime: '',
            allRepetitions: [], // NUEVO: guardar todas las repeticiones
            status: 'COMPLETED',
            isCombiTest: true,
            totalReps: totalRepetitions
        };
        
        // Obtener todas las repeticiones del testStates
        const testState = testStates[testKey];
        
        if (testState && testState.athleteRepetitions && testState.athleteRepetitions[name]) {
            athleteResult.allRepetitions = testState.athleteRepetitions[name];
            
            // Calcular tiempo total sumando todos los splits de todas las repeticiones
            let totalMs = 0;
            athleteResult.allRepetitions.forEach(rep => {
                if (rep.splits && rep.splits.length > 0) {
                    // Sumar el último split de cada repetición (tiempo total de esa rep)
                    const lastSplit = rep.splits[rep.splits.length - 1];
                    if (lastSplit !== '--' && lastSplit !== 'DNF') {
                        // Convertir "XX.XXX" a milisegundos
                        const parts = lastSplit.split('.');
                        totalMs += (parseInt(parts[0]) * 1000) + parseInt(parts[1]);
                    }
                }
            });
            
            athleteResult.totalTime = totalMs;
            athleteResult.formattedTime = formatTime(totalMs);
        }
        
        testedAthletes.unshift(athleteResult);
        
    } else {
        // Para tests simples: lógica original
        const splits = [...currentAthleteSplits];
        const lapsArr = [...currentAthleteLaps];
        
        while (splits.length < 6) splits.push('--');
        while (lapsArr.length < 6) lapsArr.push('--');
        
        // Detectar si es RAST (re=1 && ry>0)
        const config = testConfig[selectedTest];
        const isRAST = config.repetitions === 1 && config.recovery > 0;
        
        // Calcular tiempo total según el tipo de test
        const totalTime = isRAST 
            ? repResults.reduce((acc, time) => acc + time, 0)  // RAST: sumar todos los LAPS
            : repResults.length > 0 ? repResults[repResults.length - 1] : 0;  // SPRINT/AGILITY: último SPLIT
            
        const formattedTime = formatTime(totalTime);
        
        const athleteResult = {
            name: name,
            time: totalTime,
            formattedTime: formattedTime,
            splits: splits,
            laps: lapsArr,
            status: 'COMPLETED',
            isCombiTest: false
        };
        
        testedAthletes.unshift(athleteResult);
    }   
    
        
        const testKey = getCurrentTestKey();
        testStates[testKey] = {
            ...testStates[testKey],
            testedAthletes: [...testedAthletes],
            availableAthletes: availableAthletes.filter(athlete => athlete !== name),
            testFinished: false
        };
        
        currentAthleteSplits = [];
        currentAthleteLaps = [];
};   

    const getCurrentTestKey = () => {
        return `${selectedTest}-${selectedClub}-${selectedDivision}`;
    };

    const getCurrentTestState = () => {
        const testKey = getCurrentTestKey();
        return testStates[testKey] || {
            testedAthletes: [],
            availableAthletes: selectedClub && selectedDivision && data[selectedClub][selectedDivision] 
                ? [...data[selectedClub][selectedDivision]] 
                : []
        };
    };

    const updateStartButton = () => {
        const testKey = getCurrentTestKey();
        const testState = testStates[testKey];
        const testAlreadyFinished = testState && testState.testFinished;
        
        // AHORA requiere club, división Y test
        if (selectedAthlete && selectedClub && selectedDivision && selectedTest && !testAlreadyFinished) {
            startBtn.disabled = false;
            startBtn.classList.add('enabled');
        } else {
            startBtn.disabled = true;
            startBtn.classList.remove('enabled');
        }
    };

    const updateSaveButton = () => {
        const saveBtn = document.getElementById('save-btn'); // AGREGAR esta línea si no está
        if (!saveBtn) return; // AGREGAR esta línea si no está
        
        // Validación al principio
        if (!selectedClub || !selectedDivision || !selectedTest) {
            saveBtn.disabled = true;
            return;
        }
        
        // IMPORTANTE: habilitar el botón si pasa la validación
        saveBtn.disabled = false;
        
        // El resto del código sigue igual
        if (availableAthletes.length === 0 && testedAthletes.length > 0) {
            saveBtn.textContent = 'SHOW RESULTS';
            saveBtn.classList.add('results');
        } else {
            saveBtn.textContent = 'FINISH TEST';
            saveBtn.classList.remove('results');
        }
    };

    const updateResetButton = () => {
        const resetBtn = document.getElementById('reset-btn');
        if (!resetBtn) return;
        
        // Habilitar solo si hay test en progreso o atletas testeados
        if (testInProgress || athleteInTest || testedAthletes.length > 0) {
            resetBtn.disabled = false;
            resetBtn.style.opacity = '1';
            resetBtn.style.cursor = 'pointer';
        } else {
            resetBtn.disabled = true;
            resetBtn.style.opacity = '0.5';
            resetBtn.style.cursor = 'not-allowed';
        }
    };
    
    const updateSaveButtonState = () => {
        const saveBtn = document.getElementById('save-btn');
        if (!saveBtn) return;
        
        // Solo habilitar si hay club, división y test seleccionados
        if (!selectedClub || !selectedDivision || !selectedTest) {
            saveBtn.disabled = true;
        } else {
            saveBtn.disabled = false;
        }
    };

    const updateAthletesButton = () => {
        const athletesBtnCrono = document.getElementById('athletes-btn-cronometro');
        if (!athletesBtnCrono) return;
        
        // Deshabilitar si falta club, división o test
        if (!selectedClub || !selectedDivision || !selectedTest) {
            athletesBtnCrono.disabled = true;
            return;
        }
        
        // Deshabilitar durante test
        if (testInProgress || athleteInTest) {
            athletesBtnCrono.disabled = true;
        } else {
            athletesBtnCrono.disabled = false;
        }
    };

    const updateTestedButton = () => {
        const testedBtn = document.getElementById('tested-btn');
        if (!testedBtn) return;
        
        // Habilitar solo si hay test en progreso
        if (testInProgress || athleteInTest) {
            testedBtn.disabled = false;
        } else {
            testedBtn.disabled = true;
        }
    };

    const updateTestConfig = (test) => {
        if (test && testConfig[test]) {
            const config = testConfig[test];
            document.getElementById('config-times').textContent = config.times;
            document.getElementById('config-repetitions').textContent = config.repetitions;
            document.getElementById('config-recovery').textContent = `${config.recovery} sec`;
            document.getElementById('config-dead-time').textContent = `${config.deadTime || 2} sec`;
        } else {
            document.getElementById('config-times').textContent = '-';
            document.getElementById('config-repetitions').textContent = '-';
            document.getElementById('config-recovery').textContent = '- sec';
            document.getElementById('config-dead-time').textContent = '- sec';
        }
        testConfigEl.classList.add('show');
    };

    const updateAthleteSelect = () => {
        athleteSelect.innerHTML = '<option value="">-- Choose --</option>';
        
        if (availableAthletes.length > 0) {
            availableAthletes.forEach(athlete => {
                const option = document.createElement('option');
                option.value = athlete;
                option.textContent = athlete;
                athleteSelect.appendChild(option);
            });
            athleteSelect.disabled = athleteInTest;
            
            if (availableAthletes.length > 0 && !selectedAthlete) {
                selectedAthlete = availableAthletes[0];
                athleteSelect.value = selectedAthlete;
            }
        } else {
            athleteSelect.disabled = true;
            // Ocultar botón cuando no hay división
            document.getElementById('athletes-btn').style.display = 'none';
        }
    // Actualizar contador con el primer atleta
    if (availableAthletes.length > 0 && !testInProgress && !athleteInTest) {
            currentAthlete = availableAthletes[0];
            const timeCounterEl = document.getElementById('time-counter');
            if (timeCounterEl) {
                timeCounterEl.textContent = `${currentAthlete} (0/0)`;
            }
        }
    };

    // Event listener para botón ATHLETES
    const athletesBtn = document.getElementById('athletes-btn');
    if (athletesBtn) {
        athletesBtn.addEventListener('click', () => {
            const modal = document.getElementById('athletes-management-modal');
            if (modal) {
                populateAthletesModal(); // AGREGAR ESTA LÍNEA
                modal.classList.add('show');
            }
        });
    }

    // Event listener para el NUEVO botón ATHLETES del cronómetro
    const athletesBtnCrono = document.getElementById('athletes-btn-cronometro');
    if (athletesBtnCrono) {
        athletesBtnCrono.addEventListener('click', () => {
            const modal = document.getElementById('athletes-management-modal');
            if (modal) {
                populateAthletesModal();
                modal.classList.add('show');
            }
        });
    }

    // Event listeners para cerrar el modal
    const closeAthletesModal = document.getElementById('close-athletes-modal');
    if (closeAthletesModal) {
        closeAthletesModal.addEventListener('click', () => {
            document.getElementById('athletes-management-modal').classList.remove('show');
        });
    }

    const cancelAthletesModal = document.getElementById('cancel-athletes-modal');
    if (cancelAthletesModal) {
        cancelAthletesModal.addEventListener('click', () => {
            document.getElementById('athletes-management-modal').classList.remove('show');

        });
    }

    // Event listener para CONFIRM
    const confirmAthletesModal = document.getElementById('confirm-athletes-modal');
    if (confirmAthletesModal) {
        confirmAthletesModal.addEventListener('click', async () => {
            // Deshabilitar botón
            confirmAthletesModal.disabled = true;
            
            // Obtener listas actuales
            const activeList = document.getElementById('active-athletes-list');
            const dnsList = document.getElementById('dns-athletes-list');
            
            // Recolectar atletas de cada lista CON SU POSICIÓN
            const newActiveAthletes = [];
            const newDnsAthletes = [];
            
            activeList.querySelectorAll('.athlete-modal-item').forEach((item, index) => {
                newActiveAthletes.push({
                    name: item.dataset.athlete,
                    position: index
                });
            });
            
            dnsList.querySelectorAll('.athlete-modal-item').forEach((item, index) => {
                newDnsAthletes.push({
                    name: item.dataset.athlete,
                    position: index + 1000
                });
            });
            
            // NO ACTUALIZAR NADA LOCAL TODAVÍA
            
            // Actualizar en Supabase
            const updatePromises = [];
            
            newActiveAthletes.forEach(athlete => {
                updatePromises.push(
                    supabase
                        .from('athletes')
                        .update({ 
                            is_dns: false,
                            position: athlete.position 
                        })
                        .eq('name', athlete.name)
                        .eq('club_name', selectedClub)
                        .eq('division_name', selectedDivision)
                        .eq('user_id', currentUser.id)
                );
            });
            
            newDnsAthletes.forEach(athlete => {
                updatePromises.push(
                    supabase
                        .from('athletes')
                        .update({ 
                            is_dns: true,
                            position: athlete.position 
                        })
                        .eq('name', athlete.name)
                        .eq('club_name', selectedClub)
                        .eq('division_name', selectedDivision)
                        .eq('user_id', currentUser.id)
                );
            });
            
            // Esperar que TODOS los updates terminen
            const results = await Promise.all(updatePromises);
            
            // Verificar si hubo errores
            const hasErrors = results.some(result => result.error);
            if (hasErrors) {
                alert('Error updating athletes order');
                confirmAthletesModal.disabled = false;
                return;
            }
            
            console.log('Updates completados en Supabase');
            
            // AHORA SÍ - Recargar TODO desde Supabase (la fuente de verdad)
            const athletesData = await loadAthletesFromSupabase(selectedClub, selectedDivision);
            
            // Actualizar TODO con los datos frescos de Supabase
            availableAthletes = [...athletesData.active];
            data[selectedClub][selectedDivision] = [...athletesData.active];
            
            // Limpiar completamente el select y reconstruirlo
            const athleteSelect = document.getElementById('athlete-select');
            athleteSelect.innerHTML = '<option value="">-- Choose --</option>';
            
            availableAthletes.forEach(athlete => {
                const option = document.createElement('option');
                option.value = athlete;
                option.textContent = athlete;
                athleteSelect.appendChild(option);
            });
            
            // Seleccionar el primero si no hay ninguno seleccionado
            if (availableAthletes.length > 0) {
                selectedAthlete = availableAthletes[0];
                athleteSelect.value = selectedAthlete;
            } else {
                selectedAthlete = '';
            }
            
            updateStartButton();
            // Actualizar contador con el primer atleta
            if (availableAthletes.length > 0 && !testInProgress && !athleteInTest) {
                currentAthlete = availableAthletes[0];
                const timeCounterEl = document.getElementById('time-counter');
                if (timeCounterEl) {
                    timeCounterEl.textContent = `${currentAthlete} (0/0)`;
                }
            }
            // Re-habilitar botón
            confirmAthletesModal.disabled = false;
            
            // Cerrar modal
            document.getElementById('athletes-management-modal').classList.remove('show');
        });
    }

    // Función para llenar el modal de atletas
    async function populateAthletesModal() {
        const activeList = document.getElementById('active-athletes-list');
        const dnsList = document.getElementById('dns-athletes-list');
        
        if (!activeList || !dnsList) return;
        
        // Limpiar listas
        activeList.innerHTML = '';
        dnsList.innerHTML = '';
        
        // Limpiar selección
        selectedAthletesModal.active.clear();
        selectedAthletesModal.dns.clear();
        
        if (selectedClub && selectedDivision) {
            // Cargar atletas con estado DNS desde Supabase
            const athletesData = await loadAthletesFromSupabase(selectedClub, selectedDivision);
            
            // Llenar lista ACTIVE
            athletesData.active.forEach((athlete) => {
                const item = document.createElement('div');
                item.className = 'athlete-modal-item';
                item.textContent = athlete;
                item.dataset.athlete = athlete;
                item.dataset.list = 'active';
                activeList.appendChild(item);
            });
            
            // Llenar lista DNS
            athletesData.dns.forEach((athlete) => {
                const item = document.createElement('div');
                item.className = 'athlete-modal-item';
                item.textContent = athlete;
                item.dataset.athlete = athlete;
                item.dataset.list = 'dns';
                dnsList.appendChild(item);
            });
        }
    }

    // Variables para manejar selección
    let selectedAthletesModal = {
        active: new Set(),
        dns: new Set()
    };

    // Función para manejar clicks en atletas
    function handleAthleteClick(event) {
        const item = event.target;
        if (!item.classList.contains('athlete-modal-item')) return;
        
        const athlete = item.dataset.athlete;
        const list = item.dataset.list;
        const otherList = list === 'active' ? 'dns' : 'active';
        
        // Si hay selección en la otra lista, limpiarla
        if (selectedAthletesModal[otherList].size > 0) {
            selectedAthletesModal[otherList].clear();
            document.querySelectorAll(`.athlete-modal-item[data-list="${otherList}"]`).forEach(el => {
                el.classList.remove('selected');
            });
        }
        
        // Toggle selección
        if (selectedAthletesModal[list].has(athlete)) {
            selectedAthletesModal[list].delete(athlete);
            item.classList.remove('selected');
        } else {
            selectedAthletesModal[list].add(athlete);
            item.classList.add('selected');
        }
        
        // Actualizar botones
        updateIpodButtons();
    }

    // Función para actualizar estado de botones iPod
    function updateIpodButtons() {
        const upBtn = document.getElementById('ipod-up');
        const downBtn = document.getElementById('ipod-down');
        const leftBtn = document.getElementById('ipod-left');
        const rightBtn = document.getElementById('ipod-right');
        
        const activeSelected = selectedAthletesModal.active.size;
        const dnsSelected = selectedAthletesModal.dns.size;
        
        // Up/Down - lógica mejorada
        if (activeSelected === 1 && dnsSelected === 0) {
            // Un atleta seleccionado en ACTIVE
            const activeList = document.getElementById('active-athletes-list');
            const items = activeList.querySelectorAll('.athlete-modal-item');
            const selectedItem = activeList.querySelector('.athlete-modal-item.selected');
            
            if (items.length === 1) {
                // Solo hay un atleta, no se puede mover
                upBtn.disabled = true;
                downBtn.disabled = true;
            } else {
                // Verificar posición
                const index = Array.from(items).indexOf(selectedItem);
                upBtn.disabled = (index === 0);
                downBtn.disabled = (index === items.length - 1);
            }
        } else if (dnsSelected === 1 && activeSelected === 0) {
            // Un atleta seleccionado en DNS
            const dnsList = document.getElementById('dns-athletes-list');
            const items = dnsList.querySelectorAll('.athlete-modal-item');
            const selectedItem = dnsList.querySelector('.athlete-modal-item.selected');
            
            if (items.length === 1) {
                // Solo hay un atleta, no se puede mover
                upBtn.disabled = true;
                downBtn.disabled = true;
            } else {
                // Verificar posición
                const index = Array.from(items).indexOf(selectedItem);
                upBtn.disabled = (index === 0);
                downBtn.disabled = (index === items.length - 1);
            }
        } else {
            // Más de uno seleccionado o ninguno
            upBtn.disabled = true;
            downBtn.disabled = true;
        }
        
        // Left/Right según qué lista tiene selección
        leftBtn.disabled = dnsSelected === 0;
        rightBtn.disabled = activeSelected === 0;
    }

    // Event listeners para listas
    document.getElementById('active-athletes-list').addEventListener('click', handleAthleteClick);
    document.getElementById('dns-athletes-list').addEventListener('click', handleAthleteClick);

    // Event listener para CLEAR
    document.getElementById('ipod-clear').addEventListener('click', () => {
        selectedAthletesModal.active.clear();
        selectedAthletesModal.dns.clear();
        document.querySelectorAll('.athlete-modal-item').forEach(el => {
            el.classList.remove('selected');
        });
        updateIpodButtons();
    });

    document.getElementById('ipod-up').addEventListener('click', () => {
        if (selectedAthletesModal.active.size === 1) {
            const activeList = document.getElementById('active-athletes-list');
            const selectedItem = activeList.querySelector('.athlete-modal-item.selected');
            const previousItem = selectedItem.previousElementSibling;
            
            if (previousItem) {
                activeList.insertBefore(selectedItem, previousItem);
                updateIpodButtons();
            }
        } else if (selectedAthletesModal.dns.size === 1) {
            const dnsList = document.getElementById('dns-athletes-list');
            const selectedItem = dnsList.querySelector('.athlete-modal-item.selected');
            const previousItem = selectedItem.previousElementSibling;
            
            if (previousItem) {
                dnsList.insertBefore(selectedItem, previousItem);
                updateIpodButtons();
            }
        }
    });

    document.getElementById('ipod-down').addEventListener('click', () => {
        if (selectedAthletesModal.active.size === 1) {
            const activeList = document.getElementById('active-athletes-list');
            const selectedItem = activeList.querySelector('.athlete-modal-item.selected');
            const nextItem = selectedItem.nextElementSibling;
            
            if (nextItem) {
                activeList.insertBefore(nextItem, selectedItem);
                updateIpodButtons();
            }
        } else if (selectedAthletesModal.dns.size === 1) {
            const dnsList = document.getElementById('dns-athletes-list');
            const selectedItem = dnsList.querySelector('.athlete-modal-item.selected');
            const nextItem = selectedItem.nextElementSibling;
            
            if (nextItem) {
                dnsList.insertBefore(nextItem, selectedItem);
                updateIpodButtons();
            }
        }
    });

    document.getElementById('ipod-left').addEventListener('click', () => {
        if (selectedAthletesModal.dns.size === 0) return;
        
        const dnsList = document.getElementById('dns-athletes-list');
        const activeList = document.getElementById('active-athletes-list');
        
        // Mover de DNS a ACTIVE
        selectedAthletesModal.dns.forEach(athlete => {
            const item = dnsList.querySelector(`[data-athlete="${athlete}"]`);
            if (item) {
                item.dataset.list = 'active';
                activeList.appendChild(item);
            }
        });
        
        selectedAthletesModal.active = new Set([...selectedAthletesModal.active, ...selectedAthletesModal.dns]);
        selectedAthletesModal.dns.clear();
        updateIpodButtons();
    });

    document.getElementById('ipod-right').addEventListener('click', () => {
        if (selectedAthletesModal.active.size === 0) return;
        
        const activeList = document.getElementById('active-athletes-list');
        const dnsList = document.getElementById('dns-athletes-list');
        
        // Mover de ACTIVE a DNS
        selectedAthletesModal.active.forEach(athlete => {
            const item = activeList.querySelector(`[data-athlete="${athlete}"]`);
            if (item) {
                item.dataset.list = 'dns';
                dnsList.appendChild(item);
            }
        });
        
        selectedAthletesModal.dns = new Set([...selectedAthletesModal.dns, ...selectedAthletesModal.active]);
        selectedAthletesModal.active.clear();
        updateIpodButtons();
    });

    // Event handlers del cronómetro
    testSelect.addEventListener('change', (e) => {
        selectedTest = e.target.value;
        updateTestConfig(selectedTest);
        
        chronoEl.textContent = '00.000';
        chronoEl.style.fontSize = '28px';
        chronoEl.style.color = '#fff';
        chronoEl.classList.remove('recovery');
        startBtn.classList.remove('timing');
        startBtn.classList.add('enabled');
        //currentAthleteEl.textContent = '--';
        resetDisplay();
        
        if (selectedClub && selectedDivision) {
            const testKey = `${selectedTest}-${selectedClub}-${selectedDivision}`;
            const testState = testStates[testKey];
            const currentSelectedAthlete = selectedAthlete; // AGREGAR: Guardar atleta actual
            
            if (testState) {
                availableAthletes = testState.availableAthletes;
                testedAthletes = testState.testedAthletes;
                updateAthleteSelect();               
            } else {
                const athletes = [...data[selectedClub][selectedDivision]];
                availableAthletes = athletes;
                testedAthletes = [];
                updateAthleteSelect();                
            }
            
            // AGREGAR: Restaurar atleta si sigue disponible
            if (currentSelectedAthlete && availableAthletes.includes(currentSelectedAthlete)) {
                selectedAthlete = currentSelectedAthlete;
                athleteSelect.value = selectedAthlete;
            }
        }
        
        updateStartButton();
        updateSaveButton();        
        updateResetButton();
        updateAthletesButton();
        updateTestedButton()
        //updateSummary();
        updateTestButton();
    });

    clubSelect.addEventListener('change', (e) => {
        selectedClub = e.target.value;
        currentClub = selectedClub;
        selectedDivision = '';
        selectedAthlete = '';
        availableAthletes = [];
        
        chronoEl.textContent = '00.000';
        chronoEl.style.fontSize = '28px';
        chronoEl.style.color = '#fff';
        chronoEl.classList.remove('recovery');
        startBtn.classList.remove('timing');
        startBtn.classList.add('enabled');
        //currentAthleteEl.textContent = '--';
        resetDisplay();
        
        divisionSelect.innerHTML = '<option value="">-- Choose --</option>';
        divisionSelect.disabled = true;
        
        athleteSelect.innerHTML = '<option value="">-- Choose --</option>';
        athleteSelect.disabled = true;
        // Ocultar botón cuando no hay división
        document.getElementById('athletes-btn').style.display = 'none';
        
        if (selectedClub && data[selectedClub]) {
            availableDivisions = Object.keys(data[selectedClub]);
            availableDivisions.forEach(division => {
                const option = document.createElement('option');
                option.value = division;
                option.textContent = division;
                divisionSelect.appendChild(option);
            });
            divisionSelect.disabled = false;
        } else {
            availableDivisions = [];
        }
        
        testedAthletes = [];         
        updateStartButton();
        updateSaveButton();        
        updateResetButton();
        updateAthletesButton();
        updateTestedButton()
        //updateSummary();     
        updateSelectionButtons();
        updateDivisionButton();        
    });

    divisionSelect.addEventListener('change', (e) => {
        selectedDivision = e.target.value;
        currentDivision = selectedDivision;
        selectedAthlete = '';
        
        chronoEl.textContent = '00.000';
        chronoEl.style.fontSize = '28px';
        chronoEl.style.color = '#fff';
        chronoEl.classList.remove('recovery');
        startBtn.classList.remove('timing');
        startBtn.classList.add('enabled');
        //currentAthleteEl.textContent = '--';
        resetDisplay();
        
        athleteSelect.innerHTML = '<option value="">-- Choose --</option>';
        // Ocultar botón cuando no hay división
        document.getElementById('athletes-btn').style.display = 'none';
        if (selectedDivision && selectedClub && data[selectedClub][selectedDivision]) {
            const testKey = `${selectedTest}-${selectedClub}-${selectedDivision}`;
            const testState = testStates[testKey];
            
            if (testState) {
                availableAthletes = testState.availableAthletes;
                athleteQueue = testState.availableAthletes;
                testedAthletes = testState.testedAthletes;                
            } else {
                // Cargar atletas activos desde data
                const athletes = [...data[selectedClub][selectedDivision]];
                availableAthletes = athletes;
                athleteQueue = athletes;
                testedAthletes = [];                
            }            
            updateAthleteSelect();
            // Ocultar select y mostrar botón ATHLETES
            document.getElementById('athlete-select').style.display = 'none';
            //document.getElementById('athletes-btn').style.display = 'block';
            document.getElementById('athletes-btn').disabled = false;
        } else {
            availableAthletes = [];
            testedAthletes = [];           
        }
        
        updateStartButton();
        updateSaveButton();        
        updateResetButton();
        updateAthletesButton();
        updateTestedButton()
        //updateSummary();
        updateSelectionButtons();
    });

    athleteSelect.addEventListener('change', (e) => {
        selectedAthlete = e.target.value;
        if (selectedAthlete && testInProgress) {
            athleteInTest = true;
            athleteSelect.disabled = true;
            // Ocultar botón cuando no hay división
            document.getElementById('athletes-btn').style.display = 'none';
        }
        updateStartButton();
    });

        // START/TIME button handler - LÓGICA CORREGIDA MIGRADA DEL SIMULADOR
startBtn.addEventListener('click', () => {
    const buttonText = startBtn.textContent;
    
    if (buttonText === "START") {
       currentAthlete = selectedAthlete;
       if (!currentAthlete) return;

       const test = selectedTest;
       const config = testConfig[test];
       
       if (!config) {
           console.error('Test config not found for:', test);
           alert(`Configuration not found for test: ${test}`);
           return;
       }
       
       // Detectar si es RAST (re=1 && ry>0)
       const isRAST = config.repetitions === 1 && config.recovery > 0;
       
       if (!isRecovering) {
           // Detectar si es una nueva repetición de tests combinados
          const isNewRepetition = currentRepetition > 0 && currentRepetition < totalRepetitions && config.times > 1 && config.repetitions > 1;
           
           if (isNewRepetition) {
               // NUEVA REPETICIÓN: incrementar, limpiar y actualizar
               currentRepetition++;
               impulses = 0;
               laps = [];
               resetDisplay();
               updateCounters();
           } else {
               // PRIMER START DEL TEST: configurar todo desde cero
               if (config.times > 1 && config.repetitions > 1) {
                   impulseLimit = config.times;
                   totalRepetitions = config.repetitions;
               } else {
                   let effectiveImpulses = Math.max(config.times, config.repetitions);
                   impulseLimit = config.times;
                   //totalRepetitions = effectiveImpulses;
                   totalRepetitions = config.repetitions;
               }
               
               currentRepetition = 1;
               impulses = 0;  // ASEGURAR que impulses esté en 0 antes de actualizar contadores
               updateCounters();
               
               impulses = 0;
               laps = [];
               repResults = [];
               resetDisplay();
               currentAthleteSplits = [];
               currentAthleteLaps = [];
               testInProgress = true;
               athleteInTest = true;
               recoveryDuration = config.recovery;
               
               testSelect.disabled = true;
               clubSelect.disabled = true;
               divisionSelect.disabled = true;
               
               updateNavbar();
           }
       } else {
           // Cancelar recovery y resetear cronómetro
           clearInterval(recoveryInterval);
           isRecovering = false;
           
           if (!isRAST && config.times > 1 && config.repetitions > 1) {
               // Para tests combinados: nueva repetición, limpiar pantalla
               currentRepetition++;
               impulses = 0;
               laps = [];
               
               // CORREGIR: Limpiar pantalla entre repeticiones
               resetDisplay();
           }
           // Para RAST: NO resetear impulses ni laps ni limpiar pantalla
           updateCounters();
        }
       
       
       startBtn.textContent = "TIME";
       startBtn.classList.remove('enabled');
       startBtn.classList.add('timing');
       updateResetButton(); // AGREGAR: Habilitar RESET cuando empieza a cronometrar
       updateAthletesButton();
       updateTestedButton()
       // AGREGAR: Plegar persiana automáticamente
        const selectionDropdowns = document.getElementById('selection-dropdowns');
        const expandBtn = document.getElementById('expand-btn');
        const selectionSummary = document.getElementById('selection-summary');

        if (selectionDropdowns && !selectionDropdowns.classList.contains('collapsed')) {
            selectionDropdowns.classList.add('collapsed');
            expandBtn.textContent = '▲';
            selectionSummary.style.display = 'flex';
        }        
       chronoEl.classList.remove('recovery');
       chronoEl.style.color = '#fff';
       
       startTime = Date.now();
       interval = setInterval(updateChrono, 50);
       
       updateNavbar();
       
   } else {
       // Capturar tiempo
       const now = Date.now();
       const elapsed = now - startTime;
       
       const config = testConfig[selectedTest];
       const isRAST = config.repetitions === 1 && config.recovery > 0;
       
       let splitTime, lapTime;
       
       if (isRAST) {
           // CASO RAST: Capturar LAP, calcular SPLIT sumando
           lapTime = elapsed;
           repResults.push(elapsed);
           
           // SPLIT = suma de todos los LAPs hasta ahora               
           splitTime = repResults.reduce((sum, lap) => sum + lap, 0);
           
           // Mostrar en pantalla usando impulses + 1 como índice
           document.getElementById(`split-${impulses + 1}`).textContent = formatFromMilliseconds(splitTime);
           document.getElementById(`lap-${impulses + 1}`).textContent = formatFromMilliseconds(lapTime);
           
           // Guardar para exports
           currentAthleteSplits[impulses] = formatFromMilliseconds(splitTime);
           currentAthleteLaps[impulses] = formatFromMilliseconds(lapTime);
           
       } else {
           // CASOS TESTS COMBINADOS y SPRINT/AGILITY: Capturar SPLIT, calcular LAP
           splitTime = elapsed;
           
           // LAP = diferencia entre SPLITs
           if (impulses === 0) {
               lapTime = splitTime; // Primer tiempo de la repetición
           } else {
               // LAP = diferencia con el tiempo anterior DE LA MISMA REPETICIÓN
               const previousSplitInRep = repResults[repResults.length - 1];
               lapTime = splitTime - previousSplitInRep;
           }
           
           repResults.push(splitTime);
           
           // CORREGIR: Para tests combinados, mostrar usando impulses + 1 (posición dentro de repetición)
           const displayIndex = impulses + 1;
           
           document.getElementById(`split-${displayIndex}`).textContent = formatFromMilliseconds(splitTime);
           document.getElementById(`lap-${displayIndex}`).textContent = formatFromMilliseconds(lapTime);
           
           // Guardar para exports
           currentAthleteSplits[displayIndex - 1] = formatFromMilliseconds(splitTime);
           currentAthleteLaps[displayIndex - 1] = formatFromMilliseconds(lapTime);
       }

       impulses++;
       updateCounters();
       
       // VERIFICAR SI COMPLETÓ LA REPETICIÓN
       if (impulses >= impulseLimit) {
           // Completó la repetición
           // IMPORTANTE: Actualizar cronómetro una última vez antes de detenerlo
            if (!isRAST) {
                const finalElapsed = Date.now() - startTime;
                chronoEl.textContent = formatTime(finalElapsed);
            }
           clearInterval(interval);
           
           if (currentRepetition >= totalRepetitions) {
               // COMPLETÓ TODAS LAS REPETICIONES - TEST TERMINADO
               chronoEl.textContent = "FINISHED";
               chronoEl.classList.remove('recovery');
               startBtn.textContent = "START";
               startBtn.classList.remove('timing');
               startBtn.classList.add('enabled');
               addTested(currentAthlete);
               
               const remaining = availableAthletes.filter(athlete => athlete !== currentAthlete);
               availableAthletes = remaining;
               updateAthleteSelect();
               
               if (remaining.length > 0) {
                   selectedAthlete = remaining[0];
                   athleteSelect.value = selectedAthlete;
                   athleteInTest = false;
                   athleteSelect.disabled = false;
               } else {
                   selectedAthlete = '';
                   testInProgress = false;
                   athleteInTest = false;
                   testFinished = true;
                   
                   testCompletionTime = formatDateTime();
                   
                   testSelect.disabled = false;
                   clubSelect.disabled = false;
                   divisionSelect.disabled = false;
                   
                   updateNavbar();
                   
                   const testKey = `${selectedTest}-${selectedClub}-${selectedDivision}`;
                   testStates[testKey] = {
                       ...testStates[testKey],
                       testFinished: true,
                       completionTime: testCompletionTime
                   };
                   // Guardar resultado en el historial cuando termina naturalmente
                    const resultData = {
                        id: Date.now(),
                        test: selectedTest,
                        club: selectedClub,
                        division: selectedDivision,
                        completionTime: testCompletionTime,
                        athletes: testedAthletes
                    };
                    savedResults.push(resultData);
                    // Guardar backup automáticamente
                    saveResultsBackupToSupabase();
                    console.log('Resultado guardado:', savedResults);
                    updateResultsList();                    
                   setTimeout(() => showTestCompleted(), 500);
               }
               
               updateStartButton();
               updateSaveButton();               
               updateResetButton();   
               updateAthletesButton();           
               updateTestedButton()
           } else {
               // QUEDAN MÁS REPETICIONES - GUARDAR datos de la repetición que acaba de terminar
    if (config.times > 1 && config.repetitions > 1) {
        saveRepetitionData(currentAthlete, currentRepetition, [...currentAthleteSplits], [...currentAthleteLaps]);
    }
    
    if (recoveryDuration > 0) {
        // CON RECOVERY: iniciar recovery entre repeticiones
        isRecovering = true;
        startBtn.textContent = "START";
        startBtn.classList.remove('timing');
        startBtn.classList.add('enabled');
        recoveryStartTime = Date.now();
        recoveryInterval = setInterval(updateRecovery, 100);
        updateRecovery();
    } else {
        // QUEDAN MÁS REPETICIONES - solo detener cronómetro
        startBtn.textContent = "START";
        startBtn.classList.remove('timing');
        startBtn.classList.add('enabled');
        
        // NO limpiar nada aquí - los tiempos se ven hasta que empiece nueva repetición
        // NO incrementar currentRepetition aquí
    }
           }
       } else if (isRAST && impulses < config.times) {
           // RAST: recovery intra-repetición
           clearInterval(interval);
           isRecovering = true;
           startBtn.textContent = "START";
           startBtn.classList.remove('timing');
           startBtn.classList.add('enabled');
           recoveryStartTime = Date.now();
           recoveryInterval = setInterval(updateRecovery, 100);
           updateRecovery();        
       }
   }


});



    // === FUNCIONES DE TESTS ===
    const updateTestSelect = () => {
        const currentValue = testSelect.value;
        testSelect.innerHTML = '<option value="">-- Choose --</option>';
        
        Object.keys(testConfig).forEach(testName => {
            const option = document.createElement('option');
            option.value = testName;
            option.textContent = testName;
            testSelect.appendChild(option);
        });
        
        if (currentValue && testConfig[currentValue]) {
            testSelect.value = currentValue;
        } else {
            selectedTest = '';
            testSelect.value = '';
            updateTestConfig('');
        }
    };

    const updateTestsList = () => {
    const testsList = document.querySelector('.tests-list');
    if (!testsList) return;
    
    testsList.innerHTML = '';
    
    Object.entries(testConfig).forEach(([testName, config]) => {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        
        const descriptionHtml = config.description ? 
            `<div class="test-description">${config.description}</div>` : '';
        
        testItem.innerHTML = `
            <div class="test-info">
                <div class="test-name">${testName}</div>
                <div class="test-details">Times: ${config.times} | Reps: ${config.repetitions} | Recovery: ${config.recovery}s | Distance: ${config.distances}m | Dead Time: ${config.deadTime || 2}s</div>
                ${descriptionHtml}
            </div>
            <button class="delete-test-btn" data-test="${testName}">DELETE</button>
        `;
        testsList.appendChild(testItem);
    });
    
    document.querySelectorAll('.delete-test-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const testName = e.target.dataset.test;
            deleteTest(testName);
        });
    });
};

const downloadExcel = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const exportAllResultsToExcel = () => {
    if (savedResults.length === 0) {
        alert('No hay resultados para exportar');
        return;        
    }
    // Guardar backup en Supabase antes de compartir/descargar
        saveResultsBackupToSupabase();
    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // Ordenar resultados del más viejo al más nuevo
    const sortedResults = [...savedResults].sort((a, b) => a.id - b.id);
    
    // Procesar cada resultado
    sortedResults.forEach((result, index) => {
        const config = testConfig[result.test];
        const isCombiTest = config && config.times > 1 && config.repetitions > 1;
        
        // Ordenar atletas por tiempo antes de procesar
        const sortedAthletes = [...result.athletes].sort((a, b) => {
            const timeA = a.totalTime || a.time || Infinity;
            const timeB = b.totalTime || b.time || Infinity;
            return timeA - timeB;
        });

        // Preparar datos para esta hoja
        const sheetData = [];
        
        // Título
        sheetData.push([`${result.test} - ${result.club} - ${result.division}`]);
        sheetData.push([`Completado: ${result.completionTime}`]);
        sheetData.push([]); // Línea vacía
        
        // Headers
        if (isCombiTest) {
            sheetData.push(['POS', 'ATHLETE', 'REP', 'TYPE', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
        } else {
            sheetData.push(['POS', 'ATHLETE', 'TYPE', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
        }
        
        // Datos de atletas
        let position = 1;
        //result.athletes.forEach((athlete) => {
        sortedAthletes.forEach((athlete) => {
            if (isCombiTest && athlete.isCombiTest && athlete.allRepetitions) {
                athlete.allRepetitions.forEach((rep) => {
                    const athleteName = athlete.name.replace('-DNF', '');
                    const isFirst = rep.repetition === 1;
                    
                    // Fila SPLIT
                    sheetData.push([
                        isFirst ? position : '',
                        isFirst ? athleteName : '',
                        rep.repetition,
                        'SPLIT',
                        ...(rep.splits || ['--', '--', '--', '--', '--', '--']).map(timeToSeconds)
                    ]);
                    
                    // Fila LAP
                    sheetData.push([
                        '',
                        '',
                        '',
                        'LAP',
                        ...(rep.laps || ['--', '--', '--', '--', '--', '--']).map(timeToSeconds)
                    ]);
                });
                if (athlete.allRepetitions[0].repetition === 1) position++;
            } else {
                const athleteName = athlete.name.replace('-DNF', '');
                
                // Fila SPLIT
                sheetData.push([
                    position,
                    athleteName,
                    'SPLIT',
                    ...(athlete.splits || ['--', '--', '--', '--', '--', '--']).map(timeToSeconds)
                ]);
                
                // Fila LAP
                sheetData.push([
                    '',
                    '',
                    'LAP',
                    ...(athlete.laps || ['--', '--', '--', '--', '--', '--']).map(timeToSeconds)
                ]);
                
                position++;
            }
        });
        
        // Config del test
        sheetData.push([]);
        sheetData.push(['Test Configuration']);
        sheetData.push(['Times:', config?.times || 'N/A']);
        sheetData.push(['Repetitions:', config?.repetitions || 'N/A']);
        sheetData.push(['Recovery:', config?.recovery || 'N/A', 'seconds']);
        sheetData.push(['Distances:', config?.distances || 'N/A', 'meters']);
        
        // Crear hoja
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        
        // Nombre de la hoja: número del 1 al N
        const sheetName = (index + 1).toString();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    
    // Generar archivo
    const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
    const blob = new Blob([wbout], {type:'application/octet-stream'});
    
    // Nombre del archivo
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10);
    const timeStr = date.toTimeString().slice(0, 5).replace(':', '-');
    const filename = `All_Results_${dateStr}_${timeStr}.xlsx`;
    
    // Intentar compartir
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] })) {
        const file = new File([blob], filename, { type: blob.type });
        navigator.share({
            files: [file],
            title: 'All Test Results',
            text: `All test results exported on ${dateStr}`
        }).catch(() => {
            downloadExcel(blob, filename);
        });
    } else {
        downloadExcel(blob, filename);
    }
};

const updateResultsList = () => {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    
    resultsList.innerHTML = '';
    
    if (savedResults.length === 0) {
        resultsList.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No test results yet</div>';
        return;
    }
    
    // Mostrar resultados del más reciente al más viejo
    savedResults.slice().reverse().forEach((result, index) => {
        const resultNumber = savedResults.length - index;
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        resultItem.innerHTML = `
        <div class="result-number">${resultNumber}</div>
        <div class="result-info">
            <div class="result-title">${result.test} - ${result.club} - ${result.division}</div>
            <div class="result-details">Completed: ${result.completionTime}</div>
        </div>
            <div class="result-buttons">
                <button class="view-result-btn" data-id="${result.id}">VIEW</button>
                <button class="export-result-btn" data-id="${result.id}">EXPORT</button>
                <button class="delete-result-btn" data-id="${result.id}">DELETE</button>
            </div>
        `;
        
        resultsList.appendChild(resultItem);
    });
    
    // Event listeners para los botones VIEW
    document.querySelectorAll('.view-result-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const resultId = parseInt(e.target.dataset.id);
            const result = savedResults.find(r => r.id === resultId);
            if (result) {
                showSavedResult(result);
            }
        });
    });
    
    const exportToExcelAndShare = (result) => {
    const config = testConfig[result.test];
    const isCombiTest = config && config.times > 1 && config.repetitions > 1;
    
    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // Preparar datos para Excel
    const excelData = [];
    
    // Headers
    if (isCombiTest) {
        excelData.push(['POS', 'ATHLETE', 'REP', 'TYPE', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
    } else {
        excelData.push(['POS', 'ATHLETE', 'TYPE', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
    }
    
    // Ordenar atletas por tiempo antes de procesar
    const sortedAthletes = [...result.athletes].sort((a, b) => {
        const timeA = a.totalTime || a.time || Infinity;
        const timeB = b.totalTime || b.time || Infinity;
        return timeA - timeB;
    });

    // Procesar datos
    let position = 1;
    //result.athletes.forEach((athlete) => {
    sortedAthletes.forEach((athlete) => {
        if (isCombiTest && athlete.isCombiTest && athlete.allRepetitions) {
            athlete.allRepetitions.forEach((rep) => {
                const athleteName = athlete.name.replace('-DNF', '');
                const isFirst = rep.repetition === 1;
                
                // Fila SPLIT
                if (isCombiTest) {
                    excelData.push([
                        isFirst ? position : '',
                        isFirst ? athleteName : '',
                        rep.repetition,
                        'SPLIT',
                        ...(rep.splits || ['--', '--', '--', '--', '--', '--']).map(timeToSeconds)
                    ]);
                }
                
                // Fila LAP
                if (isCombiTest) {
                    excelData.push([
                        '',
                        '',
                        '',
                        'LAP',
                        ...(rep.laps || ['--', '--', '--', '--', '--', '--']).map(timeToSeconds)
                    ]);
                }
            });
            if (athlete.allRepetitions[0].repetition === 1) position++;
        } else {
            const athleteName = athlete.name.replace('-DNF', '');
            
            // Fila SPLIT
            excelData.push([
                position,
                athleteName,
                'SPLIT',
                ...(athlete.splits || ['--', '--', '--', '--', '--', '--']).map(timeToSeconds)
            ]);
            
            // Fila LAP
            excelData.push([
                '',
                '',
                'LAP',
                ...(athlete.laps || ['--', '--', '--', '--', '--', '--']).map(timeToSeconds)
            ]);
            
            position++;
        }
    });
    
    // Agregar info del test
    excelData.push([]);
    excelData.push(['Test Configuration']);
    excelData.push(['Times:', config?.times || 'N/A']);
    excelData.push(['Repetitions:', config?.repetitions || 'N/A']);
    excelData.push(['Recovery:', config?.recovery || 'N/A', 'seconds']);
    excelData.push(['Distances:', config?.distances || 'N/A', 'meters']);
    excelData.push([]);
    excelData.push(['Completed:', result.completionTime]);
    
    // Crear hoja
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    
    // Generar archivo
    const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
    const blob = new Blob([wbout], {type:'application/octet-stream'});
    
    // Nombre del archivo
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10);
    const timeStr = date.toTimeString().slice(0, 5).replace(':', '-');
    const filename = `${result.test}_${result.club}_${result.division}_${dateStr}_${timeStr}.xlsx`;
    // Intentar compartir (MISMA LÓGICA QUE SHARE ALL)
if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] })) {
    const file = new File([blob], filename, { type: blob.type });
    navigator.share({
        files: [file],
        title: `Results: ${result.test}`,
        text: `Test results for ${result.test} - ${result.club} - ${result.division}`
    }).catch(() => {
        downloadExcel(blob, filename);
    });
} else {
    downloadExcel(blob, filename);
}
    
};




    // Event listeners para los botones SHARE
    document.querySelectorAll('.export-result-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
            const resultId = parseInt(e.target.dataset.id);
            const result = savedResults.find(r => r.id === resultId);
            if (result) {
                exportToExcelAndShare(result);
            }
        });
    });
// Event listener para SHARE ALL
const shareAllBtn = document.getElementById('share-all-btn');
if (shareAllBtn) {
    shareAllBtn.disabled = savedResults.length === 0;
    shareAllBtn.onclick = exportAllResultsToExcel;
}

// Event listeners para los botones DELETE
document.querySelectorAll('.delete-result-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const resultId = parseInt(e.target.dataset.id);
        if (confirm('Are you sure you want to delete this result?')) {
            // Eliminar del array
            savedResults = savedResults.filter(r => r.id !== resultId);
            // Actualizar backup
            saveResultsBackupToSupabase();
            // Actualizar vista
            updateResultsList();
        }
    });
});


// Event listener para DELETE ALL
const deleteAllBtn = document.getElementById('delete-all-btn');
if (deleteAllBtn) {
    deleteAllBtn.disabled = savedResults.length === 0;
    deleteAllBtn.onclick = () => {
        if (confirm('Are you sure you want to delete ALL results? This cannot be undone.')) {
            savedResults = [];
            saveResultsBackupToSupabase();
            updateResultsList();
        }
    };
}
};

const showSavedResult = (result) => {
    const resultsModal = document.getElementById('results-modal');
    const resultsTitle = document.getElementById('results-title');
    const resultsTable = document.getElementById('results-table');
    const testFooter = document.getElementById('test-footer');
    
    resultsTitle.textContent = `Results: ${result.test} - ${result.club} - ${result.division}`;
    
    const config = testConfig[result.test];
    const isCombiTest = config && config.times > 1 && config.repetitions > 1;
    
    // Ordenar atletas por tiempo (como en Excel)
    const sortedAthletes = [...result.athletes].sort((a, b) => {
        const timeA = a.totalTime || a.time || Infinity;
        const timeB = b.totalTime || b.time || Infinity;
        return timeA - timeB;
    });
    
    // Construir HTML
    let tableHTML = '';
    
    // Header
    if (isCombiTest) {
        tableHTML = `
            <div class="table-header">
                <div class="table-cell">POS</div>
                <div class="table-cell">ATHLETE</div>
                <div class="table-cell">REP</div>
                <div class="table-cell">TYPE</div>
                <div class="table-cell">T1</div>
                <div class="table-cell">T2</div>
                <div class="table-cell">T3</div>
                <div class="table-cell">T4</div>
                <div class="table-cell">T5</div>
                <div class="table-cell no-border">T6</div>
            </div>
        `;
    } else {
        tableHTML = `
            <div class="table-header">
                <div class="table-cell">POS</div>
                <div class="table-cell">ATHLETE</div>
                <div class="table-cell">TYPE</div>
                <div class="table-cell">T1</div>
                <div class="table-cell">T2</div>
                <div class="table-cell">T3</div>
                <div class="table-cell">T4</div>
                <div class="table-cell">T5</div>
                <div class="table-cell no-border">T6</div>
            </div>
        `;
    }
    
    // Procesar cada atleta
    let position = 1;
    let rowIndex = 0;
    
    sortedAthletes.forEach((athlete) => {
        if (isCombiTest && athlete.isCombiTest && athlete.allRepetitions) {
            athlete.allRepetitions.forEach((rep) => {
                const athleteName = athlete.name.replace('-DNF', '');
                const isFirst = rep.repetition === 1;
                
                // Fila SPLIT
                tableHTML += `
                    <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                        <div class="athlete-cell position">${isFirst ? position : ''}</div>
                        <div class="athlete-cell name">${isFirst ? athleteName : ''}</div>
                        <div class="athlete-cell rep">${rep.repetition}</div>
                        <div class="athlete-cell type" style="color: #4ecdc4">SPLIT</div>
                        ${(rep.splits || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                            `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNF' ? '#ff6b6b' : val === '--' ? '#666' : '#4ecdc4'}">${val}</div>`
                        ).join('')}
                    </div>
                `;
                rowIndex++;
                
                // Fila LAP
                tableHTML += `
                    <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                        <div class="athlete-cell position"></div>
                        <div class="athlete-cell name"></div>
                        <div class="athlete-cell rep"></div>
                        <div class="athlete-cell type" style="color: #ffa500">LAP</div>
                        ${(rep.laps || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                            `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNF' ? '#ff6b6b' : val === '--' ? '#666' : '#ffa500'}">${val}</div>`
                        ).join('')}
                    </div>
                `;
                rowIndex++;
            });
            if (athlete.allRepetitions[0].repetition === 1) position++;
        } else {
            const athleteName = athlete.name.replace('-DNF', '');
            
            // Fila SPLIT
            tableHTML += `
                <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                    <div class="athlete-cell position">${position}</div>
                    <div class="athlete-cell name">${athleteName}</div>
                    <div class="athlete-cell type" style="color: #4ecdc4">SPLIT</div>
                    ${(athlete.splits || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                        `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNF' ? '#ff6b6b' : val === '--' ? '#666' : '#4ecdc4'}">${val}</div>`
                    ).join('')}
                </div>
            `;
            rowIndex++;
            
            // Fila LAP
            tableHTML += `
                <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                    <div class="athlete-cell position"></div>
                    <div class="athlete-cell name"></div>
                    <div class="athlete-cell type" style="color: #ffa500">LAP</div>
                    ${(athlete.laps || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                        `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNF' ? '#ff6b6b' : val === '--' ? '#666' : '#ffa500'}">${val}</div>`
                    ).join('')}
                </div>
            `;
            rowIndex++;
            position++;
        }
    });
    
    resultsTable.innerHTML = tableHTML;
    
    // Footer
    testFooter.innerHTML = `
        <div><strong>Test Configuration:</strong></div>
        <div>Times: ${config?.times || 'N/A'}</div>
        <div>Repetitions: ${config?.repetitions || 'N/A'}</div>
        <div>Recovery: ${config?.recovery || 'N/A'} seconds</div>
        <div>Distances: ${config?.distances || 'N/A'} meters</div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #555;"><strong>Completed:</strong> ${result.completionTime}</div>
    `;
    
    resultsModal.classList.add('show');
};

const exportToExcel = (result) => {
    const config = testConfig[result.test];
    const isCombiTest = config && config.times > 1 && config.repetitions > 1;
    
    // Crear CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Título
    csvContent += `${result.test} - ${result.club} - ${result.division}\n`;
    csvContent += `Completed: ${result.completionTime}\n\n`;
    
    // Headers
    if (isCombiTest) {
        csvContent += "POS,ATHLETE,REP,TYPE,T1,T2,T3,T4,T5,T6\n";
    } else {
        csvContent += "POS,ATHLETE,TYPE,T1,T2,T3,T4,T5,T6\n";
    }
    
    // Procesar datos
    let position = 1;
    result.athletes.forEach((athlete, athleteIndex) => {
        if (isCombiTest && athlete.isCombiTest && athlete.allRepetitions) {
            athlete.allRepetitions.forEach((rep) => {
                const athleteName = athlete.name.replace('-DNF', '');
                const isFirst = rep.repetition === 1;
                
                // Fila SPLIT
                const splitRow = [
                    isFirst ? position : '',
                    isFirst ? athleteName : '',
                    rep.repetition,
                    'SPLIT',
                    ...(rep.splits || ['--', '--', '--', '--', '--', '--'])
                ];
                csvContent += splitRow.join(',') + '\n';
                
                // Fila LAP
                const lapRow = [
                    '',
                    '',
                    '',
                    'LAP',
                    ...(rep.laps || ['--', '--', '--', '--', '--', '--'])
                ];
                csvContent += lapRow.join(',') + '\n';
            });
            position++;
        } else {
            const athleteName = athlete.name.replace('-DNF', '');
            
            // Fila SPLIT
            const splitRow = [
                position,
                athleteName,
                'SPLIT',
                ...(athlete.splits || ['--', '--', '--', '--', '--', '--'])
            ];
            csvContent += splitRow.join(',') + '\n';
            
            // Fila LAP
            const lapRow = [
                '',
                '',
                'LAP',
                ...(athlete.laps || ['--', '--', '--', '--', '--', '--'])
            ];
            csvContent += lapRow.join(',') + '\n';
            
            position++;
        }
    });
    
    // Agregar configuración del test
    csvContent += `\n\nTest Configuration:\n`;
    csvContent += `Times: ${config?.times || 'N/A'}\n`;
    csvContent += `Repetitions: ${config?.repetitions || 'N/A'}\n`;
    csvContent += `Recovery: ${config?.recovery || 'N/A'} seconds\n`;
    csvContent += `Distances: ${config?.distances || 'N/A'} meters\n`;
    
    // Crear link de descarga
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    // Nombre del archivo con fecha
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10);
    const timeStr = date.toTimeString().slice(0, 5).replace(':', '-');
    link.setAttribute("download", `${result.test}_${result.club}_${result.division}_${dateStr}_${timeStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


    // REEMPLAZAR la función addTest con esta versión:
const addTest = async (name, times, repetitions, recovery, distances, description, deadTime) => {
    if (!name || name.trim() === '') {
        alert('Test name is required');
        return false;
    }
    
    const cleanName = name.trim().toUpperCase();
    
    if (testConfig[cleanName]) {
        alert('Test name already exists');
        return false;
    }
    
    // Usar valores por defecto si están vacíos
    if (!times || times === '') {
        times = 1;
    } else if (times < 1 || times > 6) {
        alert('Times must be between 1 and 6');
        return false;
    }

    if (!repetitions || repetitions === '') {
        repetitions = 1;
    } else if (repetitions < 1 || repetitions > 10) {
        alert('Repetitions must be between 1 and 10');
        return false;
    }
    
    if (!recovery || recovery === '') {
        recovery = 0;
    } else if (recovery < 0 || recovery > 300) {
        alert('Recovery must be between 0 and 300 seconds');
        return false;
    }
    
    if (times == 1 && repetitions > 1) {
        alert('Cannot have multiple repetitions when Times = 1');
        return false;
    }
    if (!deadTime || deadTime === '') {
        deadTime = 2;
    }
    // Crear test en Supabase
    const success = await createTestInSupabase(
        cleanName, 
        parseInt(times), 
        parseInt(repetitions), 
        parseInt(recovery), 
        distances.trim() || null, 
        description.trim() || null,
        parseInt(deadTime)
    );
    
    if (success) {
        // Actualizar testConfig local
        testConfig[cleanName] = {
            times: parseInt(times),
            repetitions: parseInt(repetitions),
            recovery: parseInt(recovery),
            distances: distances.trim() || "N/A",
            description: description.trim() || "",
            deadTime: parseInt(deadTime)
        };
        
        updateTestSelect();
        updateTestsList();
        
        console.log('Test added:', cleanName, testConfig[cleanName]);
        return true;
    } else {
        alert('Error creating test in database');
        return false;
    }
};

const deleteTest = async (testName) => {
    if (!window.confirm(`Are you sure you want to delete test "${testName}"?`)) {
        return;
    }
    
    // Eliminar test de Supabase
    const success = await deleteTestFromSupabase(testName);
    
    if (success) {
        if (selectedTest === testName) {
            selectedTest = '';
            testSelect.value = '';
            updateTestConfig('');
        }
        
        delete testConfig[testName];
        
        updateTestSelect();
        updateTestsList();
        
        console.log('Test deleted:', testName);
    } else {
        alert('Error deleting test from database');
    }
};

    

    const setupTestsPage = () => {
    const addTestBtn = document.getElementById('add-test-btn');
    const newTestName = document.getElementById('new-test-name');
    const newTestTimes = document.getElementById('new-test-times');
    const newTestRepetitions = document.getElementById('new-test-repetitions');
    const newTestRecovery = document.getElementById('new-test-recovery');
    const newTestDistances = document.getElementById('new-test-distances');
    const newTestDescription = document.getElementById('new-test-description');
    
    // VALIDACIÓN ÚNICA: si times=1, entonces repetitions=1 Y recovery=0
    if (newTestTimes) {
        newTestTimes.addEventListener('input', () => {
            const times = parseInt(newTestTimes.value);
            
            if (times === 1) {
                // Si ti=1, forzar re=1 y ry=0
                if (newTestRepetitions) {
                    newTestRepetitions.value = 1;
                    newTestRepetitions.max = 1;
                    newTestRepetitions.disabled = true;
                    newTestRepetitions.style.backgroundColor = '#444';
                    newTestRepetitions.style.color = '#888';
                }
                if (newTestRecovery) {
                    newTestRecovery.value = 0;
                    newTestRecovery.disabled = true;
                    newTestRecovery.style.backgroundColor = '#444';
                    newTestRecovery.style.color = '#888';
                }
            } else {
                // Si ti>1, permitir re hasta 20 y ry libre
                if (newTestRepetitions) {
                    newTestRepetitions.disabled = false;
                    newTestRepetitions.max = 20;
                    newTestRepetitions.style.backgroundColor = '#333';
                    newTestRepetitions.style.color = '#fff';
                }
                if (newTestRecovery) {
                    newTestRecovery.disabled = false;
                    newTestRecovery.style.backgroundColor = '#333';
                    newTestRecovery.style.color = '#fff';
                }
            }
        });
    }
    
    // Listener adicional para repetitions para double-check
    if (newTestRepetitions) {
        newTestRepetitions.addEventListener('input', function() {
            const times = parseInt(newTestTimes ? newTestTimes.value : 1);
            const reps = parseInt(this.value);
            
            if (times === 1 && reps > 1) {
                this.value = 1;
                alert('No se puede tener más de 1 repetición cuando TIMES=1');
            }
        });
    }
    
    // Listener adicional para recovery para double-check
    if (newTestRecovery) {
        newTestRecovery.addEventListener('input', function() {
            const times = parseInt(newTestTimes ? newTestTimes.value : 1);
            const recovery = parseInt(this.value);
            
            if (times === 1 && recovery > 0) {
                this.value = 0;
                alert('No se puede tener recovery > 0 cuando TIMES=1');
            }
        });
    }
    
    if (addTestBtn) {
        addTestBtn.replaceWith(addTestBtn.cloneNode(true));
        const newAddTestBtn = document.getElementById('add-test-btn');
        
        newAddTestBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const nameValue = newTestName ? newTestName.value.trim() : '';
            
            if (!nameValue) {
                alert('Test name is required');
                return;
            }
            const newTestDeadTime = document.getElementById('new-test-dead-time');
            const success = await addTest(
                nameValue,
                newTestTimes ? newTestTimes.value : '',
                newTestRepetitions ? newTestRepetitions.value : '',
                newTestRecovery ? newTestRecovery.value : '',
                newTestDistances ? newTestDistances.value : '',
                newTestDescription ? newTestDescription.value : '',
                newTestDeadTime ? newTestDeadTime.value : '2'


            );
            
            if (success) {
                alert(`Test "${nameValue}" created successfully!`);
                if (newTestName) newTestName.value = '';
                if (newTestTimes) newTestTimes.value = '';
                if (newTestRepetitions) {
                    newTestRepetitions.value = '';
                    newTestRepetitions.disabled = false;
                    newTestRepetitions.style.backgroundColor = '#333';
                    newTestRepetitions.style.color = '#fff';
                }
                if (newTestRecovery) {
                    newTestRecovery.value = '';
                    newTestRecovery.disabled = false;
                    newTestRecovery.style.backgroundColor = '#333';
                    newTestRecovery.style.color = '#fff';
                }
                if (newTestDistances) newTestDistances.value = '';
                if (newTestDescription) newTestDescription.value = '';
            }
        });
    }
    
    updateTestsList();
};

    // === FUNCIONES DE ATLETAS ===
    const deleteClub = async (clubName) => {
    if (!confirm(`Are you sure you want to delete club "${clubName}"?\n\nThis will delete ALL divisions and athletes in this club.`)) {
        return false;
    }

    if (!data[clubName]) {
        alert('Club not found');
        return false;
    }

    // Eliminar club de Supabase
    const success = await deleteClubFromSupabase(clubName);
    
    if (success) {
        delete data[clubName];
        console.log('Club deleted:', clubName);
        return true;
    } else {
        alert('Error deleting club');
        return false;
    }
};

    
const deleteDivision = async (club, divisionName) => {
    if (!confirm(`Are you sure you want to delete division "${divisionName}" from ${club}?\n\nThis will delete ALL athletes in this division.`)) {
        return false;
    }

    if (!data[club] || !data[club][divisionName]) {
        alert('Division not found');
        return false;
    }

    // Eliminar division de Supabase
    const success = await deleteDivisionFromSupabase(club, divisionName);
    
    if (success) {
        delete data[club][divisionName];
        console.log('Division deleted:', divisionName, 'from club', club);
        return true;
    } else {
        alert('Error deleting division');
        return false;
    }
};




    const addClub = async (clubName) => {
    if (!clubName || clubName.trim() === '') {
        alert('Club name is required');
        return false;
    }

    const cleanName = clubName.trim().toUpperCase();

    if (data[cleanName]) {
        alert('Club already exists');
        return false;
    }

    // Crear club en Supabase
    const success = await createClubInSupabase(cleanName);
    
    if (success) {
        data[cleanName] = {};
        console.log('Club added:', cleanName);
        return true;
    } else {
        alert('Error creating club');
        return false;
    }
};

    

const addDivision = async (club, divisionName) => {
    if (!divisionName || divisionName.trim() === '') {
        alert('Division name is required');
        return false;
    }

    const cleanName = divisionName.trim().toUpperCase();

    if (!club) {
        alert('Please select a club first');
        return false;
    }

    if (!data[club]) {
        alert('Invalid club');
        return false;
    }

    if (data[club][cleanName]) {
        alert('Division already exists in this club');
        return false;
    }

    // Crear division en Supabase
    const success = await createDivisionInSupabase(club, cleanName);
    
    if (success) {
        data[club][cleanName] = [];
        console.log('Division added:', cleanName, 'to club', club);
        return true;
    } else {
        alert('Error creating division');
        return false;
    }
};





   const addAthlete = async (club, division, athleteName) => {
    if (!athleteName || athleteName.trim() === '') {
        alert('Athlete alias/ID is required');
        return false;
    }

    const cleanName = athleteName.trim();

    if (!club || !division) {
        alert('Please select club and division first');
        return false;
    }

    if (!data[club] || !data[club][division]) {
        alert('Invalid club or division');
        return false;
    }

    if (data[club][division].includes(cleanName)) {
        alert('Athlete already exists in this division');
        return false;
    }

    // Crear athlete en Supabase
    const success = await createAthleteInSupabase(club, division, cleanName);
    
    if (success) {
        data[club][division].push(cleanName);
        console.log('Athlete added:', cleanName, 'to', club, '-', division);
        return true;
    } else {
        alert('Error creating athlete');
        return false;
    }
};

    const deleteAthlete = async (club, division, athleteName) => {
    if (!confirm(`Are you sure you want to delete athlete "${athleteName}" from ${club} - ${division}?`)) {
        return false;
    }

    if (!data[club] || !data[club][division]) {
        alert('Invalid club or division');
        return false;
    }

    const athleteIndex = data[club][division].indexOf(athleteName);
    if (athleteIndex === -1) {
        alert('Athlete not found');
        return false;
    }

    // Eliminar athlete de Supabase
    const success = await deleteAthleteFromSupabase(club, division, athleteName);
    
    if (success) {
        data[club][division].splice(athleteIndex, 1);
        console.log('Athlete deleted:', athleteName, 'from', club, '-', division);
        return true;
    } else {
        alert('Error deleting athlete');
        return false;
    }
};

    const updateAthletesList = (club, division) => {
        const athletesList = document.getElementById('athletes-list');
        if (!athletesList || !data[club] || !data[club][division]) return;

        athletesList.innerHTML = '';

        data[club][division].forEach(athlete => {
            const athleteItem = document.createElement('div');
            athleteItem.className = 'athlete-item';
            athleteItem.innerHTML = `
                <div class="athlete-name">${athlete}</div>
                <button class="delete-athlete-btn" data-club="${club}" data-division="${division}" data-athlete="${athlete}">DELETE</button>
            `;
            athletesList.appendChild(athleteItem);
        });

        document.querySelectorAll('.delete-athlete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const club = e.target.dataset.club;
                const division = e.target.dataset.division;
                const athlete = e.target.dataset.athlete;
                
                const success = await deleteAthlete(club, division, athlete);
                
                if (success) {
                    updateAthletesList(club, division);
                    updateChronoAthletes(club, division);
                    
                    if (selectedClub === club && selectedDivision === division && selectedAthlete === athlete) {
                        selectedAthlete = '';
                        if (athleteSelect) athleteSelect.value = '';
                        updateStartButton();
                    }
                }
            });
        });
    };

    const updateAddAthleteButtonState = () => {
        const addAthleteBtn = document.getElementById('add-athlete-btn');
        const athletesClubSelect = document.getElementById('athletes-club-select');
        const athletesDivisionSelect = document.getElementById('athletes-division-select');

        if (addAthleteBtn && athletesClubSelect && athletesDivisionSelect) {
            const hasClubAndDivision = athletesClubSelect.value && athletesDivisionSelect.value;
            addAthleteBtn.disabled = !hasClubAndDivision;
        }
    };

    const updateAddDivisionButtonState = () => {
        const addDivisionBtn = document.getElementById('add-division-btn');
        const athletesClubSelect = document.getElementById('athletes-club-select');

        if (addDivisionBtn && athletesClubSelect) {
            const hasClub = athletesClubSelect.value;
            addDivisionBtn.disabled = !hasClub;
        }
    };

    const updateDeleteButtonsState = () => {
        const deleteClubBtn = document.getElementById('delete-club-btn');
        const deleteDivisionBtn = document.getElementById('delete-division-btn');
        const athletesClubSelect = document.getElementById('athletes-club-select');
        const athletesDivisionSelect = document.getElementById('athletes-division-select');

        if (deleteClubBtn && athletesClubSelect) {
            deleteClubBtn.disabled = !athletesClubSelect.value;
        }

        if (deleteDivisionBtn && athletesClubSelect && athletesDivisionSelect) {
            deleteDivisionBtn.disabled = !(athletesClubSelect.value && athletesDivisionSelect.value);
        }
    };

    const updateDivisionsDropdown = (club) => {
        const athletesDivisionSelect = document.getElementById('athletes-division-select');
        if (!athletesDivisionSelect || !club || !data[club]) return;

        const currentDivision = athletesDivisionSelect.value;
        
        athletesDivisionSelect.innerHTML = '<option value="">-- Select Division --</option>';
        
        Object.keys(data[club]).forEach(division => {
            const option = document.createElement('option');
            option.value = division;
            option.textContent = division;
            athletesDivisionSelect.appendChild(option);
        });
        
        if (currentDivision && data[club][currentDivision]) {
            athletesDivisionSelect.value = currentDivision;
        }
    };

    const updateClubsDropdown = () => {
        const athletesClubSelect = document.getElementById('athletes-club-select');
        if (!athletesClubSelect) return;

        const currentClub = athletesClubSelect.value;
        
        athletesClubSelect.innerHTML = '<option value="">-- Select Club --</option>';
        
        Object.keys(data).forEach(club => {
            const option = document.createElement('option');
            option.value = club;
            option.textContent = club;
            athletesClubSelect.appendChild(option);
        });
        
        if (currentClub && data[currentClub]) {
            athletesClubSelect.value = currentClub;
            updateDivisionsDropdown(currentClub);
        } else {
            const athletesDivisionSelect = document.getElementById('athletes-division-select');
            if (athletesDivisionSelect) {
                athletesDivisionSelect.innerHTML = '<option value="">-- Select Division --</option>';
                athletesDivisionSelect.disabled = true;
            }
        }
    };

    const updateChronoClubs = () => {
        const clubSelect = document.getElementById('club-select');
        if (clubSelect) {
            const currentClub = clubSelect.value;
            
            clubSelect.innerHTML = '<option value="">-- Choose --</option>';
            
            Object.keys(data).forEach(club => {
                const option = document.createElement('option');
                option.value = club;
                option.textContent = club;
                clubSelect.appendChild(option);
            });
            
            if (currentClub && data[currentClub]) {
                clubSelect.value = currentClub;
            } else {
                const divisionSelect = document.getElementById('division-select');
                const athleteSelect = document.getElementById('athlete-select');
                if (divisionSelect) {
                    divisionSelect.innerHTML = '<option value="">-- Choose --</option>';
                    divisionSelect.disabled = true;
                }
                if (athleteSelect) {
                    athleteSelect.innerHTML = '<option value="">-- Choose --</option>';
                    athleteSelect.disabled = true;
                    // Ocultar botón cuando no hay división
                    document.getElementById('athletes-btn').style.display = 'none';
                }
            }
        }
    };

    const updateChronoDivisions = (club) => {
        if (selectedClub === club) {
            const divisionSelect = document.getElementById('division-select');
            if (divisionSelect) {
                const currentDivision = divisionSelect.value;
                
                divisionSelect.innerHTML = '<option value="">-- Choose --</option>';
                
                if (data[club]) {
                    Object.keys(data[club]).forEach(division => {
                        const option = document.createElement('option');
                        option.value = division;
                        option.textContent = division;
                        divisionSelect.appendChild(option);
                    });
                }
                
                if (currentDivision && data[club][currentDivision]) {
                    divisionSelect.value = currentDivision;
                }
            }
        }
    };

    const updateChronoAthletes = (club, division) => {
        if (selectedClub === club && selectedDivision === division) {
            const athletes = [...data[club][division]];
            availableAthletes = athletes;
            updateAthleteSelect();
            if (athletes.length > 0 && !selectedAthlete) {
                selectedAthlete = athletes[0];
                athleteSelect.value = selectedAthlete;
            }
            updateStartButton();
        }
    };
    
    // Función para borrar TODOS los datos del usuario
    async function deleteAllUserData() {
        try {
            console.log('Iniciando borrado de datos...');
            console.log('Usuario actual:', currentUser.id);
            
            // Borrar en orden inverso de dependencias
            // 1. Borrar todos los athletes
            const { error: errorAthletes } = await supabase
                .from('athletes')
                .delete()
                .eq('user_id', currentUser.id);
            if (errorAthletes) console.error('Error borrando athletes:', errorAthletes);
            else console.log('Athletes borrados');
                
            // 2. Borrar todas las divisions
            const { error: errorDivisions } = await supabase
                .from('divisions')
                .delete()
                .eq('user_id', currentUser.id);
            if (errorDivisions) console.error('Error borrando divisions:', errorDivisions);
            else console.log('Divisions borradas');
                
            // 3. Borrar todos los clubs
            const { error: errorClubs } = await supabase
                .from('clubs')
                .delete()
                .eq('user_id', currentUser.id);
            if (errorClubs) console.error('Error borrando clubs:', errorClubs);
            else console.log('Clubs borrados');
                
            // 4. Borrar todos los tests
            const { error: errorTests } = await supabase
                .from('tests')
                .delete()
                .eq('user_id', currentUser.id);
            if (errorTests) console.error('Error borrando tests:', errorTests);
            else console.log('Tests borrados');
                
            console.log('Todos los datos borrados exitosamente');
            // Limpiar datos locales
            data = {};
            testConfig = {};
            testStates = {};
            savedResults = [];

            // Limpiar dropdowns si estamos en la página
            if (document.getElementById('club-select')) {
                document.getElementById('club-select').innerHTML = '<option value="">-- Choose --</option>';
                document.getElementById('division-select').innerHTML = '<option value="">-- Choose --</option>';
                document.getElementById('athlete-select').innerHTML = '<option value="">-- Choose --</option>';
            }
            if (document.getElementById('test-select')) {
                document.getElementById('test-select').innerHTML = '<option value="">-- Choose --</option>';
            }

            console.log('Datos locales limpiados');
            return true;
        } catch (error) {
            console.error('Error general borrando datos:', error);
            return false;
        }
    }


    // Función para importar datos parseados a Supabase
    async function importParsedData(parsedAthletes, parsedTests) {
        try {
            // 1. Importar tests primero
            for (const test of parsedTests) {
                const { error } = await supabase
                    .from('tests')
                    .insert([{
                        name: test.name,
                        times: test.times,
                        repetitions: test.repetitions,
                        recovery: test.recovery,
                        distances: test.distances,
                        description: test.description,
                        dead_time: test.deadTime,
                        user_id: currentUser.id
                    }]);
                
                if (error) {
                    console.error('Error importando test:', test.name, error);
                } else {
                    // Actualizar testConfig local
                    testConfig[test.name] = {
                        times: test.times,
                        repetitions: test.repetitions,
                        recovery: test.recovery,
                        distances: test.distances,
                        description: test.description,
                        deadTime: test.deadTime
                    };
                }
            }
            console.log('Tests importados:', Object.keys(testConfig).length);
            
            // 2. Crear estructura de clubs y divisions
            const clubsToCreate = new Set();
            const divisionsToCreate = new Set();
            
            parsedAthletes.forEach(a => {
                clubsToCreate.add(a.club);
                divisionsToCreate.add(`${a.club}|${a.division}`);
            });
            
            // 3. Crear clubs
            for (const clubName of clubsToCreate) {
                const { error } = await supabase
                    .from('clubs')
                    .insert([{
                        name: clubName,
                        user_id: currentUser.id
                    }]);
                
                if (error) {
                    console.error('Error creando club:', clubName, error);
                } else {
                    data[clubName] = {};
                }
            }
            console.log('Clubs creados:', clubsToCreate.size);
            
            // 4. Crear divisions
            for (const divisionKey of divisionsToCreate) {
                const [clubName, divisionName] = divisionKey.split('|');
                
                const { error } = await supabase
                    .from('divisions')
                    .insert([{
                        name: divisionName,
                        club_name: clubName,
                        user_id: currentUser.id
                    }]);
                
                if (error) {
                    console.error('Error creando division:', divisionName, error);
                } else {
                    if (!data[clubName]) data[clubName] = {};
                    data[clubName][divisionName] = [];
                }
            }
            console.log('Divisions creadas:', divisionsToCreate.size);
            
            // 5. Crear athletes
            for (const athlete of parsedAthletes) {
                const { error } = await supabase
                    .from('athletes')
                    .insert([{
                        name: athlete.athlete,
                        club_name: athlete.club,
                        division_name: athlete.division,
                        user_id: currentUser.id
                    }]);
                
                if (error) {
                    console.error('Error creando athlete:', athlete.athlete, error);
                } else {
                    if (!data[athlete.club]) data[athlete.club] = {};
                    if (!data[athlete.club][athlete.division]) data[athlete.club][athlete.division] = [];
                    data[athlete.club][athlete.division].push(athlete.athlete);
                }
            }
            console.log('Athletes creados:', parsedAthletes.length);
            
            return true;
        } catch (error) {
            console.error('Error general importando:', error);
            return false;
        }
    }

    

    // Función para importar desde Google Sheets
    async function importFromGoogleSheets(sheetId) {
        try {
            // DEBUG 1
            alert('DEBUG 1: Starting import...');
            
            // Extraer ID si pegaron URL completa
            let spreadsheetId = sheetId;
            if (sheetId.includes('docs.google.com/spreadsheets')) {
                const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
                if (match && match[1]) {
                    spreadsheetId = match[1];
                    // DEBUG 2
                    alert('DEBUG 2: ID extracted: ' + spreadsheetId.substring(0, 10) + '...');
                } else {
                    alert('Could not extract ID from URL');
                    return;
                }
            }
            
            // DEBUG 3
            alert('DEBUG 3: GAPI ready = ' + window.gapiInited);
            
            // Verificar que gapi esté listo
            if (!window.gapiInited) {
                alert('Google API is not ready. Try again in a few seconds.');
                return;
            }
            
            // DEBUG 4
            alert('DEBUG 4: Reading Athletes sheet...');

            // DECLARAR VARIABLES FUERA DEL TRY
            let athletesResponse;
            let testsResponse;
            
            try {
                // Leer datos de ATHLETES
                athletesResponse = await gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: spreadsheetId,
                    range: 'Athletes!A:C'
                });
                
                // DEBUG 5
                alert('DEBUG 5: Athletes loaded. Reading Tests...');
                
                // Leer datos de TESTS
                testsResponse = await gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: spreadsheetId,
                    range: 'Tests!A:G'
                });
                
                // DEBUG 5.5
                alert('DEBUG 5.5: Tests loaded successfully!');
                
            } catch (sheetError) {
                // ERROR ESPECÍFICO DE SHEETS
                alert('ERROR reading sheet: ' + sheetError.message);
                if (sheetError.result && sheetError.result.error) {
                    alert('Details: ' + sheetError.result.error.message);
                }
                throw sheetError;
            }    
            
            // DEBUG 6
            alert('DEBUG 6: Processing data...');
            
            // Parsear datos - AHORA SÍ ESTÁN DEFINIDAS
            const athletesData = athletesResponse.result.values || [];
            const testsData = testsResponse.result.values || [];
            
            // Validar que hay datos
            if (athletesData.length < 2) {
                alert('The Athletes sheet is empty or has incorrect format');
                return;
            }
            
            if (testsData.length < 2) {
                alert('The Tests sheet is empty or has incorrect format');
                return;
            }
            
            // DEBUG 7
            alert('DEBUG 7: Data valid. Showing preview...');
            
            // Parsear athletes (ignorar header)
            const parsedAthletes = [];
            for (let i = 1; i < athletesData.length; i++) {
                const row = athletesData[i];
                if (row[0] && row[1] && row[2]) {
                    parsedAthletes.push({
                        club: row[0].trim().toUpperCase(),
                        division: row[1].trim().toUpperCase(),
                        athlete: row[2].trim()
                    });
                }
            }
            
            // Parsear tests (ignorar header)
            const parsedTests = [];
            for (let i = 1; i < testsData.length; i++) {
                const row = testsData[i];
                if (row[0] && row[1] && row[2]) {
                    parsedTests.push({
                        name: row[0].trim().toUpperCase(),
                        times: parseInt(row[1]) || 1,
                        repetitions: parseInt(row[2]) || 1,
                        recovery: parseInt(row[3]) || 0,
                        deadTime: parseInt(row[4]) || 2,
                        distances: row[5] || 'N/A',
                        description: row[6] || ''
                    });
                }
            }
            
            // Mostrar preview
            const previewModal = document.getElementById('import-preview-modal');
            const previewContent = document.getElementById('import-preview-content');

            let previewHTML = '<div style="padding: 20px;">';

            // Advertencia PRIMERO
            previewHTML += '<div style="margin-bottom: 20px; padding: 15px; background: #ff6b6b22; border: 1px solid #ff6b6b; border-radius: 5px;">';
            previewHTML += '<strong style="color: #ff6b6b;">⚠️ WARNING:</strong><br>';
            previewHTML += 'This will DELETE ALL current clubs, divisions, athletes and tests.';
            previewHTML += '</div>';

            previewHTML += '<h4 style="color: #4ecdc4;">📁 Athletes (aliases/IDs) found: ' + parsedAthletes.length + '</h4>';

            // Agrupar por club y división
            const grouped = {};
            parsedAthletes.forEach(a => {
                if (!grouped[a.club]) grouped[a.club] = {};
                if (!grouped[a.club][a.division]) grouped[a.club][a.division] = [];
                grouped[a.club][a.division].push(a.athlete);
            });

            for (const club in grouped) {
                previewHTML += `<div style="margin-bottom: 10px;"><strong style="color: #17a2b8;">${club}</strong>`;
                for (const division in grouped[club]) {
                    previewHTML += `<div style="margin-left: 20px; color: #ccc;">▸ ${division}: ${grouped[club][division].join(', ')}</div>`;
                }
                previewHTML += '</div>';
            }

            previewHTML += '</div>';

            previewHTML += '<h4 style="color: #4ecdc4;">🏃 Tests found: ' + parsedTests.length + '</h4>';
            previewHTML += '<div style="background: #333; padding: 10px; border-radius: 5px;">';
            parsedTests.forEach(t => {
                previewHTML += `<div style="margin-bottom: 5px; color: #ccc;">• ${t.name} (${t.times}x${t.repetitions}, rec: ${t.recovery}s)</div>`;
            });
            previewHTML += '</div>';                        
            previewHTML += '</div>';

            previewContent.innerHTML = previewHTML;
            previewModal.classList.add('show');

            // Setup botón confirmar
            document.getElementById('confirm-import-btn').onclick = async () => {
                previewModal.classList.remove('show');
                
                // Mostrar loading
                const loadingMsg = document.createElement('div');
                loadingMsg.innerHTML = '<h2 style="color: #17a2b8;">Importing data...</h2>';
                loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #222; padding: 30px; border-radius: 10px; z-index: 9999; border: 2px solid #17a2b8;';
                document.body.appendChild(loadingMsg);
                
                // Borrar todos los datos
                const deleted = await deleteAllUserData();
                if (!deleted) {
                    alert('Error al borrar datos actuales');
                    document.body.removeChild(loadingMsg);
                    return;
                }
                
                // Importar datos nuevos
                const imported = await importParsedData(parsedAthletes, parsedTests);

                document.body.removeChild(loadingMsg);

                if (imported) {
                    // Actualizar interfaces
                    updateTestSelect();
                    updateClubsDropdown();
                    updateChronoClubs();
                    
                    alert(`✅ Import successful!\n\n${parsedAthletes.length} athletes and ${parsedTests.length} tests imported.`);
                } else {
                    alert('❌ Error during import. Some data may not have been imported correctly.');
                }
            };
            
        } catch (error) {
            // DEBUG ERROR
            alert('DEBUG ERROR: ' + error.message);
            console.error('Error:', error);
            if (error.status === 400) {
                alert('Error: Verify that the Sheet has sheets named "Athletes" and "Tests"');
            } else {
                alert('Error: Could not access Sheet. Verify it is public.');
            }
        }
    }
    
    // Función para exportar todos los datos a Excel
    async function exportAllDataToExcel() {
        try {
            // Confirmar con advertencia sobre DNS
            if (!confirm('⚠️ WARNING: Only ACTIVE athletes will be exported.\n\nAthletes marked as DNS will NOT be included in the export.\n\nContinue?')) {
                return;
            }
            // Mostrar loading
            const loadingMsg = document.createElement('div');
            loadingMsg.innerHTML = '<h2 style="color: #17a2b8;">Exporting data...</h2>';
            loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #222; padding: 30px; border-radius: 10px; z-index: 9999; border: 2px solid #17a2b8;';
            document.body.appendChild(loadingMsg);
            
            // Crear workbook
            const wb = XLSX.utils.book_new();
            
            // HOJA 1: Athletes
            const athletesData = [['Club', 'Division', 'Athlete']]; // Header
            
            // Recolectar todos los atletas
            for (const clubName in data) {
                for (const divisionName in data[clubName]) {
                    const athletes = data[clubName][divisionName];
                    athletes.forEach(athlete => {
                        athletesData.push([clubName, divisionName, athlete]);
                    });
                }
            }
            
            const wsAthletes = XLSX.utils.aoa_to_sheet(athletesData);
            XLSX.utils.book_append_sheet(wb, wsAthletes, 'Athletes');
            
            // HOJA 2: Tests
            const testsData = [['Name', 'Times', 'Repetitions', 'Recovery', 'DeadTime', 'Distances', 'Description']]; // Header
            
            // Recolectar todos los tests
            for (const testName in testConfig) {
                const test = testConfig[testName];
                testsData.push([
                    testName,
                    test.times,
                    test.repetitions,
                    test.recovery,
                    test.deadTime || 2,
                    test.distances || '',
                    test.description || ''
                ]);
            }
            
            const wsTests = XLSX.utils.aoa_to_sheet(testsData);
            XLSX.utils.book_append_sheet(wb, wsTests, 'Tests');
            
            // Generar archivo
            const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
            const blob = new Blob([wbout], {type:'application/octet-stream'});
            
            // Nombre del archivo
            const date = new Date();
            const dateStr = date.toISOString().slice(0, 10);
            const timeStr = date.toTimeString().slice(0, 5).replace(':', '-');
            const filename = `PROBATIO_Data_Export_${dateStr}_${timeStr}.xlsx`;
            
            // Quitar loading
            document.body.removeChild(loadingMsg);
            
            // Intentar compartir o descargar
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] })) {
                const file = new File([blob], filename, { type: blob.type });
                navigator.share({
                    files: [file],
                    title: 'PROBATIO Data Export',
                    text: `All data exported on ${dateStr}`
                }).catch(() => {
                    downloadExcel(blob, filename);
                });
            } else {
                downloadExcel(blob, filename);
            }
            
            alert(`✅ Export successful!\n\nExported ${athletesData.length - 1} athletes and ${testsData.length - 1} tests.`);
            
        } catch (error) {
            console.error('Error exportando datos:', error);
            alert('Error exporting data: ' + error.message);
        }
    }

    const setupAthletesPage = () => {
        const athletesClubSelect = document.getElementById('athletes-club-select');
        const athletesDivisionSelect = document.getElementById('athletes-division-select');
        const athletesListSection = document.getElementById('athletes-list-section');
        const currentSelection = document.getElementById('current-selection');
        
        const addAthleteBtn = document.getElementById('add-athlete-btn');
        const newAthleteNameInput = document.getElementById('new-athlete-name');
        
        const addDivisionBtn = document.getElementById('add-division-btn');
        const newDivisionNameInput = document.getElementById('new-division-name');
        
        const addClubBtn = document.getElementById('add-club-btn');
        const newClubNameInput = document.getElementById('new-club-name');
        
        const deleteClubBtn = document.getElementById('delete-club-btn');
        const deleteDivisionBtn = document.getElementById('delete-division-btn');

        if (!athletesClubSelect || !athletesDivisionSelect) return;

        athletesClubSelect.addEventListener('change', (e) => {
            const selectedClub = e.target.value;
            
            athletesDivisionSelect.innerHTML = '<option value="">-- Select Division --</option>';
            athletesDivisionSelect.disabled = true;
            
            athletesListSection.style.display = 'none';
            
            updateAddAthleteButtonState();
            updateAddDivisionButtonState();
            updateDeleteButtonsState();
            
            if (selectedClub && data[selectedClub]) {
                Object.keys(data[selectedClub]).forEach(division => {
                    const option = document.createElement('option');
                    option.value = division;
                    option.textContent = division;
                    athletesDivisionSelect.appendChild(option);
                });
                athletesDivisionSelect.disabled = false;
            }
        });

        athletesDivisionSelect.addEventListener('change', (e) => {
            const selectedClub = athletesClubSelect.value;
            const selectedDivision = e.target.value;
            
            updateAddAthleteButtonState();
            updateAddDivisionButtonState();
            updateDeleteButtonsState();
            
            if (selectedClub && selectedDivision && data[selectedClub][selectedDivision]) {
                currentSelection.textContent = `${selectedClub} - ${selectedDivision}`;
                athletesListSection.style.display = 'block';
                
                updateAthletesList(selectedClub, selectedDivision);
            } else {
                athletesListSection.style.display = 'none';
            }
        });

        if (addClubBtn) {
            addClubBtn.replaceWith(addClubBtn.cloneNode(true));
            const newAddClubBtn = document.getElementById('add-club-btn');
            
            newAddClubBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const clubName = newClubNameInput ? newClubNameInput.value.trim() : '';

                if (!clubName) {
                    alert('Club name is required');
                    return;
                }

                const success = await addClub(clubName);

                if (success) {
                    alert(`Club "${clubName}" added successfully!`);
                    
                    if (newClubNameInput) newClubNameInput.value = '';
                    
                    updateClubsDropdown();
                    updateChronoClubs();
                }
            });
        }

        if (addDivisionBtn) {
            addDivisionBtn.replaceWith(addDivisionBtn.cloneNode(true));
            const newAddDivisionBtn = document.getElementById('add-division-btn');
            
            newAddDivisionBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const selectedClub = athletesClubSelect.value;
                const divisionName = newDivisionNameInput ? newDivisionNameInput.value.trim() : '';

                if (!divisionName) {
                    alert('Division name is required');
                    return;
                }

                const success = await addDivision(selectedClub, divisionName);

                if (success) {
                    alert(`Division "${divisionName}" added successfully!`);
                    
                    if (newDivisionNameInput) newDivisionNameInput.value = '';
                    
                    updateDivisionsDropdown(selectedClub);
                    updateChronoDivisions(selectedClub);
                }
            });
        }

        if (addAthleteBtn) {
            addAthleteBtn.replaceWith(addAthleteBtn.cloneNode(true));
            const newAddAthleteBtn = document.getElementById('add-athlete-btn');
            
            newAddAthleteBtn.addEventListener('click',  async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const selectedClub = athletesClubSelect.value;
                const selectedDivision = athletesDivisionSelect.value;
                const athleteName = newAthleteNameInput ? newAthleteNameInput.value.trim() : '';

                if (!athleteName) {
                    alert('Athlete name is required');
                    return;
                }

                const success = await addAthlete(selectedClub, selectedDivision, athleteName);

                if (success) {
                    alert(`Athlete "${athleteName}" added successfully!`);
                    
                    if (newAthleteNameInput) newAthleteNameInput.value = '';
                    
                    updateAthletesList(selectedClub, selectedDivision);
                    updateChronoAthletes(selectedClub, selectedDivision);
                }
            });
        }

        if (deleteClubBtn) {
            deleteClubBtn.replaceWith(deleteClubBtn.cloneNode(true));
            const newDeleteClubBtn = document.getElementById('delete-club-btn');
            
            newDeleteClubBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const selectedClub = athletesClubSelect.value;

                if (!selectedClub) {
                    alert('Please select a club first');
                    return;
                }

                const success = await deleteClub(selectedClub);

                if (success) {
                    athletesClubSelect.value = '';
                    athletesDivisionSelect.innerHTML = '<option value="">-- Select Division --</option>';
                    athletesDivisionSelect.disabled = true;
                    
                    const athletesListSection = document.getElementById('athletes-list-section');
                    if (athletesListSection) athletesListSection.style.display = 'none';
                    
                    updateClubsDropdown();
                    updateChronoClubs();
                    
                    updateDeleteButtonsState();
                    updateAddDivisionButtonState();
                    updateAddAthleteButtonState();
                }
            });
        }

        if (deleteDivisionBtn) {
            deleteDivisionBtn.replaceWith(deleteDivisionBtn.cloneNode(true));
            const newDeleteDivisionBtn = document.getElementById('delete-division-btn');
            
            newDeleteDivisionBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const selectedClub = athletesClubSelect.value;
                const selectedDivision = athletesDivisionSelect.value;

                if (!selectedClub || !selectedDivision) {
                    alert('Please select club and division first');
                    return;
                }

                const success = await deleteDivision(selectedClub, selectedDivision);

                if (success) {
                    athletesDivisionSelect.value = '';
                    
                    const athletesListSection = document.getElementById('athletes-list-section');
                    if (athletesListSection) athletesListSection.style.display = 'none';
                    
                    updateDivisionsDropdown(selectedClub);
                    updateChronoDivisions(selectedClub);
                    
                    updateDeleteButtonsState();
                    updateAddAthleteButtonState();
                }
            });
        }

        updateAddAthleteButtonState();
        updateAddDivisionButtonState();
        updateDeleteButtonsState();
    // Import from Google Sheets - listener directo
    const importBtn = document.getElementById('import-sheet-btn');
    if (importBtn) {
        importBtn.replaceWith(importBtn.cloneNode(true));
        const newImportBtn = document.getElementById('import-sheet-btn');
        
        newImportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const sheetId = document.getElementById('sheet-id').value.trim();
            
            if (!sheetId) {
                alert('Please paste the Google Sheet ID');
                return;
            }            
            importFromGoogleSheets(sheetId);
        });
        }
     // Export all data - listener
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.replaceWith(exportDataBtn.cloneNode(true));
        const newExportDataBtn = document.getElementById('export-data-btn');
        
        newExportDataBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await exportAllDataToExcel();
        });
    }   
    };

    // === BOTONES RESET Y SAVE ===
    resetBtn.addEventListener('click', () => {
        if (resetBtn.disabled) return; // AGREGAR: No hacer nada si está deshabilitado
        const resetModal = document.getElementById('reset-modal');
        const resetText = document.getElementById('reset-text');
        resetText.textContent = `Are you sure you want to reset ${selectedTest || 'TEST'} for ${selectedClub || 'CLUB'} - ${selectedDivision || 'DIVISION'}?`;
        resetModal.classList.add('show');
    });

    // Botón TESTED
    const testedBtn = document.getElementById('tested-btn');
    if (testedBtn) {
        testedBtn.addEventListener('click', () => {
            if (testedBtn.disabled) return;
            showTestedResults();
        });
    }

    document.getElementById('cancel-reset').addEventListener('click', () => {
        document.getElementById('reset-modal').classList.remove('show');
    });

    document.getElementById('confirm-reset').addEventListener('click', () => {
        clearInterval(interval);
        clearInterval(recoveryInterval);
        chronoEl.textContent = '00.000';
        chronoEl.style.fontSize = '28px';
        chronoEl.style.color = '#fff';
        chronoEl.classList.remove('recovery');
        startBtn.textContent = 'START';
        // AGREGAR: Resetear clases del botón START
        startBtn.classList.remove('timing');
        startBtn.classList.add('enabled');
        
        resetDisplay();
        
        const testKey = getCurrentTestKey();
        const originalAthletes = selectedClub && selectedDivision && data[selectedClub][selectedDivision] 
            ? [...data[selectedClub][selectedDivision]] 
            : [];
        
        testStates[testKey] = {
            testedAthletes: [],
            availableAthletes: originalAthletes
        };
        
        testedAthletes = [];        
        
        impulses = 0;
        impulseLimit = 0;
        currentRepetition = 0;
        totalRepetitions = 0;
        isRecovering = false;
        laps = [];
        repResults = [];
        startTime = null;
        recoveryStartTime = null;
        recoveryDuration = 0;
        currentAthleteSplits = [];
        currentAthleteLaps = [];
        
        testInProgress = false;
        athleteInTest = false;
        testSelect.disabled = false;
        clubSelect.disabled = false;
        divisionSelect.disabled = false;
        
        updateNavbar();
        
        availableAthletes = originalAthletes;
        updateAthleteSelect();
        if (originalAthletes.length > 0) {
            selectedAthlete = originalAthletes[0];
            athleteSelect.value = selectedAthlete;
            currentAthlete = selectedAthlete; // AGREGAR: Actualizar currentAthlete
        } else {
            selectedAthlete = '';
            currentAthlete = ''; // AGREGAR: Limpiar currentAthlete si no hay atletas
        }
        
        updateStartButton();
        updateSaveButton();        
        updateResetButton();
        updateAthletesButton();
        updateTestedButton()
        updateCounters(); // AGREGAR: Actualizar contadores para mostrar (0/X)        
        document.getElementById('reset-modal').classList.remove('show');
    });

    saveBtn.addEventListener('click', () => {
        if (availableAthletes.length === 0 && testedAthletes.length > 0) {
            showResults();
        } else if (availableAthletes.length > 0) {
            const saveModal = document.getElementById('save-modal');
            const saveText = document.getElementById('save-text');
            saveText.textContent = `There are still ${availableAthletes.length} athletes to be evaluated.`;
            saveModal.classList.add('show');
        }
    });

    document.getElementById('cancel-save').addEventListener('click', () => {
        document.getElementById('save-modal').classList.remove('show');
    });

    document.getElementById('confirm-save').addEventListener('click', () => {
        clearInterval(interval);
        clearInterval(recoveryInterval);
        
        testCompletionTime = formatDateTime();
        
        chronoEl.textContent = '00.000';
        chronoEl.style.fontSize = '28px';
        chronoEl.style.color = '#fff';
        chronoEl.classList.remove('recovery');
        startBtn.textContent = 'START';
        //currentAthleteEl.textContent = '--';
        
        resetDisplay();
        
        impulses = 0;
        impulseLimit = 0;
        currentRepetition = 0;
        updateCounters();
        totalRepetitions = 0;
        isRecovering = false;
        laps = [];
        repResults = [];
        startTime = null;
        recoveryStartTime = null;
        recoveryDuration = 0;
        currentAthlete = '';
        
        const config = testConfig[selectedTest];
        const isCombiTest = config && config.times > 1 && config.repetitions > 1;

        const dnfAthletes = availableAthletes.map(athlete => {
            if (isCombiTest) {
                return {
                    name: `${athlete}-DNF`,
                    totalTime: Infinity,
                    formattedTime: 'DNF',
                    allRepetitions: Array.from({length: config.repetitions}, (_, i) => ({
                        repetition: i + 1,
                        splits: Array(config.times).fill('DNF'),
                        laps: Array(config.times).fill('DNF')
                    })),
                    status: 'DNF',
                    isCombiTest: true,
                    totalReps: config.repetitions
                };
            } else {
                return {
                    name: `${athlete}-DNF`,
                    time: Infinity,
                    formattedTime: 'DNF',
                    splits: ['DNF', 'DNF', 'DNF', 'DNF', 'DNF', 'DNF'],
                    laps: ['DNF', 'DNF', 'DNF', 'DNF', 'DNF', 'DNF'],
                    status: 'DNF'
                };
            }
        });
        
        const newTestedList = [...testedAthletes, ...dnfAthletes];
        testedAthletes = newTestedList.slice(0, 3);        
        
        const testKey = getCurrentTestKey();
        testStates[testKey] = {
            ...testStates[testKey],
            testedAthletes: newTestedList,
            availableAthletes: [],
            testFinished: true,
            completionTime: testCompletionTime
        };
        
        availableAthletes = [];
        selectedAthlete = '';
        updateAthleteSelect();
        
        testInProgress = false;
        athleteInTest = false;
        testSelect.disabled = false;
        clubSelect.disabled = false;
        divisionSelect.disabled = false;
        
        updateStartButton();
        updateSaveButton();        
        updateResetButton();      
        updateAthletesButton(); 
        updateTestedButton()
        document.getElementById('save-modal').classList.remove('show');
        testFinished = true;
        
        setTimeout(() => showTestCompleted(), 500);
        
        updateNavbar();
        
        console.log('TEST FINISHED - Remaining athletes marked as DNF');
        // Guardar resultado en el historial
        const resultData = {
            id: Date.now(),
            test: selectedTest,
            club: selectedClub,
            division: selectedDivision,
            completionTime: testCompletionTime,
            athletes: newTestedList
        };
        savedResults.push(resultData);
        // Guardar backup automáticamente
        saveResultsBackupToSupabase();
        updateResultsList();
    });

    // === RESULTS MODAL ===
    const showResults = () => {
        const resultsModal = document.getElementById('results-modal');
        const resultsTitle = document.getElementById('results-title');
        const resultsTable = document.getElementById('results-table');
        const testFooter = document.getElementById('test-footer');
        
        resultsTitle.textContent = `Results: ${selectedTest} - ${selectedClub} - ${selectedDivision}`;
        
        // Obtener configuración del test
        const config = testConfig[selectedTest];
        const isCombiTest = config && config.times > 1 && config.repetitions > 1;
        
        // Obtener datos del test actual
        const testKey = getCurrentTestKey();
        const testState = testStates[testKey];
        
        if (!testState || !testState.testedAthletes || testState.testedAthletes.length === 0) {
            resultsTable.innerHTML = '<div class="no-results">No results available for this test</div>';
            resultsModal.classList.add('show');
            return;
        }
        
        // Ordenar atletas por tiempo (como en Excel)
        const sortedAthletes = [...testState.testedAthletes].sort((a, b) => {
            const timeA = a.totalTime || a.time || Infinity;
            const timeB = b.totalTime || b.time || Infinity;
            return timeA - timeB;
        });
        
        // Construir HTML igual que Excel construye filas
        let tableHTML = '';
        
        // Header
        if (isCombiTest) {
            tableHTML = `
                <div class="table-header">
                    <div class="table-cell">POS</div>
                    <div class="table-cell">ATHLETE</div>
                    <div class="table-cell">REP</div>
                    <div class="table-cell">TYPE</div>
                    <div class="table-cell">T1</div>
                    <div class="table-cell">T2</div>
                    <div class="table-cell">T3</div>
                    <div class="table-cell">T4</div>
                    <div class="table-cell">T5</div>
                    <div class="table-cell no-border">T6</div>
                </div>
            `;
        } else {
            tableHTML = `
                <div class="table-header">
                    <div class="table-cell">POS</div>
                    <div class="table-cell">ATHLETE</div>
                    <div class="table-cell">TYPE</div>
                    <div class="table-cell">T1</div>
                    <div class="table-cell">T2</div>
                    <div class="table-cell">T3</div>
                    <div class="table-cell">T4</div>
                    <div class="table-cell">T5</div>
                    <div class="table-cell no-border">T6</div>
                </div>
            `;
        }
        
        // Procesar cada atleta (IGUAL QUE EXCEL)
        let position = 1;
        let rowIndex = 0;
        
        sortedAthletes.forEach((athlete) => {
            if (isCombiTest && athlete.isCombiTest && athlete.allRepetitions) {
                // Tests combinados
                athlete.allRepetitions.forEach((rep) => {
                    const athleteName = athlete.name.replace('-DNF', '');
                    const isFirst = rep.repetition === 1;
                    
                    // Fila SPLIT
                    tableHTML += `
                        <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                            <div class="athlete-cell position">${isFirst ? position : ''}</div>
                            <div class="athlete-cell name">${isFirst ? athleteName : ''}</div>
                            <div class="athlete-cell rep">${rep.repetition}</div>
                            <div class="athlete-cell type" style="color: #4ecdc4">SPLIT</div>
                            ${(rep.splits || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                                `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNF' ? '#ff6b6b' : val === '--' ? '#666' : '#4ecdc4'}">${val}</div>`
                            ).join('')}
                        </div>
                    `;
                    rowIndex++;
                    
                    // Fila LAP
                    tableHTML += `
                        <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                            <div class="athlete-cell position"></div>
                            <div class="athlete-cell name"></div>
                            <div class="athlete-cell rep"></div>
                            <div class="athlete-cell type" style="color: #ffa500">LAP</div>
                            ${(rep.laps || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                                `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNF' ? '#ff6b6b' : val === '--' ? '#666' : '#ffa500'}">${val}</div>`
                            ).join('')}
                        </div>
                    `;
                    rowIndex++;
                });
                if (athlete.allRepetitions[0].repetition === 1) position++;
            } else {
                // Tests simples
                const athleteName = athlete.name.replace('-DNF', '');
                
                // Fila SPLIT
                tableHTML += `
                    <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                        <div class="athlete-cell position">${position}</div>
                        <div class="athlete-cell name">${athleteName}</div>
                        <div class="athlete-cell type" style="color: #4ecdc4">SPLIT</div>
                        ${(athlete.splits || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                            `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNF' ? '#ff6b6b' : val === '--' ? '#666' : '#4ecdc4'}">${val}</div>`
                        ).join('')}
                    </div>
                `;
                rowIndex++;
                
                // Fila LAP
                tableHTML += `
                    <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                        <div class="athlete-cell position"></div>
                        <div class="athlete-cell name"></div>
                        <div class="athlete-cell type" style="color: #ffa500">LAP</div>
                        ${(athlete.laps || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                            `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNF' ? '#ff6b6b' : val === '--' ? '#666' : '#ffa500'}">${val}</div>`
                        ).join('')}
                    </div>
                `;
                rowIndex++;
                position++;
            }
        });
        
        resultsTable.innerHTML = tableHTML;
        
        // Footer
        const completionTime = testState?.completionTime || 'N/A';
        testFooter.innerHTML = `
            <div><strong>Test Configuration:</strong></div>
            <div>Times: ${config?.times || 'N/A'}</div>
            <div>Repetitions: ${config?.repetitions || 'N/A'}</div>
            <div>Recovery: ${config?.recovery || 'N/A'} seconds</div>
            <div>Distances: ${config?.distances || 'N/A'} meters</div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #555;"><strong>Completed:</strong> ${completionTime}</div>
        `;
        
        resultsModal.classList.add('show');
    };

   const showTestedResults = () => {
        const resultsModal = document.getElementById('results-modal');
        const resultsTitle = document.getElementById('results-title');
        const resultsTable = document.getElementById('results-table');
        const testFooter = document.getElementById('test-footer');
        
        resultsTitle.textContent = `Current Results: ${selectedTest} - ${selectedClub} - ${selectedDivision}`;
        
        // Obtener configuración del test
        const config = testConfig[selectedTest];
        const isCombiTest = config && config.times > 1 && config.repetitions > 1;
        
        // Combinar testedAthletes con availableAthletes como DNS
        const allAthletes = [...testedAthletes];
        
        // Agregar atletas disponibles como DNS
        availableAthletes.forEach(athlete => {
            if (isCombiTest) {
                allAthletes.push({
                    name: `${athlete}-DNS`,
                    totalTime: Infinity,
                    formattedTime: 'DNS',
                    allRepetitions: Array.from({length: config.repetitions}, (_, i) => ({
                        repetition: i + 1,
                        splits: Array(config.times).fill('DNS'),
                        laps: Array(config.times).fill('DNS')
                    })),
                    status: 'DNS',
                    isCombiTest: true,
                    totalReps: config.repetitions
                });
            } else {
                allAthletes.push({
                    name: `${athlete}-DNS`,
                    time: Infinity,
                    formattedTime: 'DNS',
                    splits: ['DNS', 'DNS', 'DNS', 'DNS', 'DNS', 'DNS'],
                    laps: ['DNS', 'DNS', 'DNS', 'DNS', 'DNS', 'DNS'],
                    status: 'DNS'
                });
            }
        });
        
        // Ordenar por tiempo
        const sortedAthletes = allAthletes.sort((a, b) => {
            const timeA = a.totalTime || a.time || Infinity;
            const timeB = b.totalTime || b.time || Infinity;
            return timeA - timeB;
        });
        
        // Construir HTML igual que showResults()
        let tableHTML = '';
        
        // Header
        if (isCombiTest) {
            tableHTML = `
                <div class="table-header">
                    <div class="table-cell">POS</div>
                    <div class="table-cell">ATHLETE</div>
                    <div class="table-cell">REP</div>
                    <div class="table-cell">TYPE</div>
                    <div class="table-cell">T1</div>
                    <div class="table-cell">T2</div>
                    <div class="table-cell">T3</div>
                    <div class="table-cell">T4</div>
                    <div class="table-cell">T5</div>
                    <div class="table-cell no-border">T6</div>
                </div>
            `;
        } else {
            tableHTML = `
                <div class="table-header">
                    <div class="table-cell">POS</div>
                    <div class="table-cell">ATHLETE</div>
                    <div class="table-cell">TYPE</div>
                    <div class="table-cell">T1</div>
                    <div class="table-cell">T2</div>
                    <div class="table-cell">T3</div>
                    <div class="table-cell">T4</div>
                    <div class="table-cell">T5</div>
                    <div class="table-cell no-border">T6</div>
                </div>
            `;
        }
        
        // Procesar cada atleta
        let position = 1;
        let rowIndex = 0;
        
        sortedAthletes.forEach((athlete) => {
            if (isCombiTest && athlete.isCombiTest && athlete.allRepetitions) {
                athlete.allRepetitions.forEach((rep) => {
                    const athleteName = athlete.name.replace('-DNF', '').replace('-DNS', '');
                    const isFirst = rep.repetition === 1;
                    
                    // Fila SPLIT
                    tableHTML += `
                        <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                            <div class="athlete-cell position">${isFirst ? position : ''}</div>
                            <div class="athlete-cell name">${isFirst ? athleteName : ''}</div>
                            <div class="athlete-cell rep">${rep.repetition}</div>
                            <div class="athlete-cell type" style="color: #4ecdc4">SPLIT</div>
                            ${(rep.splits || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                                `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNS' ? '#ff6b6b' : val === '--' ? '#666' : '#4ecdc4'}">${val}</div>`
                            ).join('')}
                        </div>
                    `;
                    rowIndex++;
                    
                    // Fila LAP
                    tableHTML += `
                        <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                            <div class="athlete-cell position"></div>
                            <div class="athlete-cell name"></div>
                            <div class="athlete-cell rep"></div>
                            <div class="athlete-cell type" style="color: #ffa500">LAP</div>
                            ${(rep.laps || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                                `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNS' ? '#ff6b6b' : val === '--' ? '#666' : '#ffa500'}">${val}</div>`
                            ).join('')}
                        </div>
                    `;
                    rowIndex++;
                });
                if (athlete.allRepetitions[0].repetition === 1) position++;
            } else {
                const athleteName = athlete.name.replace('-DNF', '').replace('-DNS', '');
                
                // Fila SPLIT
                tableHTML += `
                    <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                        <div class="athlete-cell position">${position}</div>
                        <div class="athlete-cell name">${athleteName}</div>
                        <div class="athlete-cell type" style="color: #4ecdc4">SPLIT</div>
                        ${(athlete.splits || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                            `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNS' ? '#ff6b6b' : val === '--' ? '#666' : '#4ecdc4'}">${val}</div>`
                        ).join('')}
                    </div>
                `;
                rowIndex++;
                
                // Fila LAP
                tableHTML += `
                    <div class="athlete-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}">
                        <div class="athlete-cell position"></div>
                        <div class="athlete-cell name"></div>
                        <div class="athlete-cell type" style="color: #ffa500">LAP</div>
                        ${(athlete.laps || ['--', '--', '--', '--', '--', '--']).map((val, idx) => 
                            `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${val === 'DNS' ? '#ff6b6b' : val === '--' ? '#666' : '#ffa500'}">${val}</div>`
                        ).join('')}
                    </div>
                `;
                rowIndex++;
                position++;
            }
        });
        
        resultsTable.innerHTML = tableHTML;
        
        // Footer
        testFooter.innerHTML = `
            <div><strong>Test Configuration:</strong></div>
            <div>Times: ${config?.times || 'N/A'}</div>
            <div>Repetitions: ${config?.repetitions || 'N/A'}</div>
            <div>Recovery: ${config?.recovery || 'N/A'} seconds</div>
            <div>Distances: ${config?.distances || 'N/A'} meters</div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #555;"><strong>Status:</strong> Test in progress</div>
        `;
        
        resultsModal.classList.add('show');
    };

    const getCurrentTestedResults = () => {
        
    };




    const getCurrentResults = () => {
        
    };


    document.getElementById('close-results').addEventListener('click', () => {
        document.getElementById('results-modal').classList.remove('show');
    });

    document.getElementById('close-results-header').addEventListener('click', () => {
        document.getElementById('results-modal').classList.remove('show');
    });

    // === NAVEGACIÓN ===
    let currentPage = 'page-chrono';
    
    const allPages = ['page-chrono', 'page-athletes', 'page-tests', 'page-photocells', 'page-results'];
    const pageNames = {
                    'page-chrono': 'CHRONO',
                    'page-athletes': 'ATHLETES', 
                    'page-tests': 'TESTS',
                    'page-photocells': 'PHOTOCELLS',
                    'page-results': 'RESULTS'
    };

        const updateNavbar = () => {
            const navbar = document.getElementById('navbar');
            navbar.innerHTML = '';
            
            // SIEMPRE mostrar los 5 botones
            allPages.forEach(pageId => {
                const button = document.createElement('button');
                button.className = 'nav-btn';
                
                // Si es la página actual, agregar clase active
                if (pageId === currentPage) {
                    button.classList.add('active');
                }
                
                // Cambiar PHOTOCELLS por CELLS
                let buttonText = pageNames[pageId];
                if (buttonText === 'PHOTOCELLS') {
                    buttonText = 'CELLS';
                }
                
                button.textContent = buttonText;
                button.dataset.target = pageId;
                
                if (testInProgress || athleteInTest) {
                    button.disabled = true;
                    button.style.opacity = '0.5';
                    button.style.cursor = 'not-allowed';
                } else {
                    // Solo agregar listener si NO es la página actual
                    if (pageId !== currentPage) {
                        button.addEventListener('click', () => navigateToPage(pageId));
                    }
                }
                
                navbar.appendChild(button);
            });
        };



    const navigateToPage = (targetPageId) => {
        allPages.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) {
                page.classList.remove('active-page');
            }
        });
        
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.add('active-page');
            currentPage = targetPageId;
            updateNavbar();
          if (targetPageId === 'page-tests') {
                setupTestsPage();
            } else if (targetPageId === 'page-athletes') {
                setupAthletesPage();
            } else if (targetPageId === 'page-results') {
                updateResultsList();
            }  
            
        }
    };

    // Initialize
    updateNavbar();
    setupTestsPage();
    setupAthletesPage();
    updateStartButton();
    updateSaveButton();    
    updateResetButton();    
    updateAthletesButton();
    updateTestedButton()
    updateTestConfig('');
  // === BLUETOOTH BLE PARA PHOTOCELLS ===
const connectBleBtn = document.getElementById('connect-ble-btn');
const BLE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const BLE_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

let bleDevices = {}; // Cambiado para soportar F1-F9
let scanningDevices = new Set(); // Dispositivos detectados
let isScanning = false;

// Event listener para botón SCANNER
if (connectBleBtn) {
    connectBleBtn.addEventListener('click', async () => {
        if (isScanning) {
            console.log('Ya estamos escaneando...');
            return;
        }
        
        try {
            isScanning = true;
            connectBleBtn.textContent = 'SCANNING...';
            connectBleBtn.disabled = true;
            
            console.log('Iniciando escaneo BLE...');
            
            // Escanear dispositivos
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'CRONOPIC-F' }],
                optionalServices: [BLE_SERVICE_UUID]
            });
            
            const name = device.name || 'Unknown';
            console.log('Dispositivo encontrado:', name);
            
            // Extraer número del nombre (F1-F9)
            const match = name.match(/CRONOPIC-F([1-9])/);
            if (!match) {
                alert('Invalid device');
                return;
            }
            
            const deviceNumber = match[1];
            const deviceKey = `F${deviceNumber}`;
            // Crear tarjeta si es necesario
            createDeviceCard(deviceKey);
            // Marcar tarjeta como desconectada (lista para conectar)
            updateDeviceCard(deviceKey, 'disconnected', 'DISCONNECTED');
            scanningDevices.add(deviceKey);
            // Mostrar botón CONNECT ALL si hay dispositivos
            if (scanningDevices.size > 0) {
                const connectAllBtn = document.getElementById('connect-all-btn');
                if (connectAllBtn) connectAllBtn.style.display = 'inline-block';
            }
            // Guardar referencia temporal
            bleDevices[deviceKey] = { device, connected: false };

            // Agregar handler de desconexión desde el escaneo
            device.addEventListener('gattserverdisconnected', () => {
                console.log(`${deviceKey} se desconectó`);
                // SIEMPRE volver a amarillo cuando se desconecta
                updateDeviceCard(deviceKey, 'disconnected', 'DISCONNECTED');
                bleDevices[deviceKey].connected = false;
                // NO borrar de scanningDevices para poder reconectar
            });
            
        } catch (error) {
            console.error('Error BLE:', error);
            if (error.code !== 8) { // 8 = usuario canceló
                alert(`Error: ${error.message}`);
            }
        } finally {
            isScanning = false;
            connectBleBtn.textContent = 'ADD DEVICE';
            connectBleBtn.disabled = false;
        }
    });
}
// Event listener para CONNECT ALL
const connectAllBtn = document.getElementById('connect-all-btn');
if (connectAllBtn) {
    connectAllBtn.addEventListener('click', async () => {
        console.log('Conectando todos los dispositivos...');
        for (const deviceKey of scanningDevices) {
            const card = document.querySelector(`[data-device="${deviceKey}"]`);
            if (card && !bleDevices[deviceKey].connected) {
                card.click(); // Simular click en cada tarjeta
                await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre conexiones
            }
        }
    });
}

// Crear tarjeta de dispositivo dinámicamente
function createDeviceCard(deviceKey) {
    const devicesGrid = document.getElementById('devices-grid');
    if (!devicesGrid) return;
    
    // Verificar si ya existe
    if (document.querySelector(`[data-device="${deviceKey}"]`)) return;
    
    const card = document.createElement('div');
    card.className = 'device-card';
    card.dataset.device = deviceKey;
    
    card.innerHTML = `
        <div class="device-header">${deviceKey}</div>
        <div class="device-status">DISCONNECTED</div>
        <div class="device-info">Click to connect</div>
    `;
    
    devicesGrid.appendChild(card);
    
    // Agregar el event listener
    card.addEventListener('click', async () => {
        // Aquí va toda la lógica del click que ya existe
        const device = bleDevices[deviceKey];
        
        if (!device || !device.device) {
            console.log(`Device ${deviceKey} perdió referencia, no se puede reconectar`);
            updateDeviceCard(deviceKey, 'default', '');
            scanningDevices.delete(deviceKey);
            delete bleDevices[deviceKey];
            return;
        }
        
        if (device.connected) {
            // Desconectar
            if (device.server && device.server.connected) {
                device.server.disconnect();
            }
            device.connected = false;
            updateDeviceCard(deviceKey, 'disconnected', 'DISCONNECTED');
            console.log(`${deviceKey} desconectado`);
        } else if (scanningDevices.has(deviceKey) && !device.connected) {
            // Conectar - toda la lógica existente
            try {
                updateDeviceCard(deviceKey, 'default', 'Connecting...');
                if (device.gattHandler) {
                    device.device.removeEventListener('gattserverdisconnected', device.gattHandler);
                }
                const server = await device.device.gatt.connect();
                console.log(`${deviceKey} conectado a GATT`);
                
                const service = await server.getPrimaryService(BLE_SERVICE_UUID);
                const characteristic = await service.getCharacteristic(BLE_CHARACTERISTIC_UUID);
                
                await characteristic.startNotifications();
                characteristic.addEventListener('characteristicvaluechanged', (event) => {
                    const value = new TextDecoder().decode(event.target.value);
                    console.log(`${deviceKey}: ${value}`);
                    
                    const frameMatch = value.match(/r([1-9])/);
                    if (frameMatch) {
                        const channel = frameMatch[1];
                        const expectedChannel = deviceKey.substring(1);
                        
                        if (channel === expectedChannel) {
                            console.log(`✅ Fotocélula ${deviceKey} disparada! (canal ${channel})`);
                            
                            if (currentPage === 'page-photocells') {
                                const card = document.querySelector(`[data-device="${deviceKey}"]`);
                                if (card) {
                                    card.style.backgroundColor = '#00ff00';
                                    card.style.boxShadow = '0 0 20px #00ff00';
                                    setTimeout(() => {
                                        card.style.backgroundColor = '#1a3a1a';
                                        card.style.boxShadow = 'none';
                                    }, 300);
                                }
                            } else if (currentPage === 'page-chrono') {
                                simulatePhotocellFrame(parseInt(channel));
                            }
                        } else {
                            console.log(`❌ Canal no coincide para ${deviceKey}`);
                        }
                    }
                });
                
                device.server = server;
                device.characteristic = characteristic;
                device.connected = true;
                bleDevices[deviceKey] = device;
                
                device.gattHandler = () => {
                    console.log(`${deviceKey} perdió conexión GATT`);
                    device.connected = false;
                    updateDeviceCard(deviceKey, 'disconnected', 'DISCONNECTED');
                    scanningDevices.add(deviceKey);
                    if (!document.hidden) {
                        alert(`⚠️ Photocell ${deviceKey} lost connection`);
                    }
                };

                device.device.addEventListener('gattserverdisconnected', device.gattHandler);
                
                updateDeviceCard(deviceKey, 'connected', 'READY!!');
                
            } catch (error) {
                console.error(`Error conectando ${deviceKey}:`, error);
                if (device.connected === false) {
                    updateDeviceCard(deviceKey, 'disconnected', 'DISCONNECTED');
                } else {
                    updateDeviceCard(deviceKey, 'disconnected', 'DISCONNECTED');
                }
                alert(`Error connecting ${deviceKey}`);
            }
        }
    });
// Ordenar tarjetas después de agregar la nueva
sortDeviceCards();
}

// Ordenar tarjetas de dispositivos
function sortDeviceCards() {
    const devicesGrid = document.getElementById('devices-grid');
    if (!devicesGrid) return;
    
    // Obtener todas las tarjetas
    const cards = Array.from(devicesGrid.querySelectorAll('.device-card'));
    
    // Ordenar por número de dispositivo
    cards.sort((a, b) => {
        const numA = parseInt(a.dataset.device.substring(1));
        const numB = parseInt(b.dataset.device.substring(1));
        return numA - numB;
    });
    
    // Limpiar y re-agregar en orden
    devicesGrid.innerHTML = '';
    cards.forEach(card => devicesGrid.appendChild(card));
}


// Función para actualizar tarjeta de dispositivo
function updateDeviceCard(deviceKey, state, statusText) {
    const card = document.querySelector(`[data-device="${deviceKey}"]`);
    if (!card) return;
    
    // Limpiar TODAS las clases de estado
    card.classList.remove('available', 'connected', 'disconnected');
    
    // Limpiar estilos inline que puedan quedar
    card.style.backgroundColor = '';
    card.style.borderColor = '';
    
    // Agregar nueva clase
    if (state !== 'default') {
        card.classList.add(state);
    }
    
    // Forzar colores según estado
    if (state === 'disconnected') {
        card.style.backgroundColor = '#554400';
        card.style.borderColor = '#ffa500';
    } else if (state === 'connected') {
        card.style.backgroundColor = '#1a3a1a';
        card.style.borderColor = '#28a745';
    }
    
    // Actualizar texto de estado
    const statusEl = card.querySelector('.device-status');
    if (statusEl) {
        statusEl.textContent = statusText;
        statusEl.className = `device-status ${state === 'default' ? '' : state}`;
    }
}

}); // End of DOMContentLoaded

