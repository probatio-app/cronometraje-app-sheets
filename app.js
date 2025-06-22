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
                redirectTo: 'https://mcavallaro23.github.io/cronometraje-app-sheets/',                
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent', 
                    scope: 'https://www.googleapis.com/auth/spreadsheets'
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
    document.getElementById('logout-btn').classList.add('hidden');
}

// Ocultar pantalla de login
function hideLoginScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
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
        const { error } = await supabase
            .from('clubs')
            .delete()
            .eq('name', clubName)
            .eq('user_id', currentUser.id);
            
        if (error) {
            console.error('Error eliminando club:', error);
            return false;
        }
        
        console.log('Club eliminado de Supabase:', clubName);
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
        
        console.log('Division eliminada de Supabase:', divisionName, 'del club', clubName);
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
            .order('name');
            
        if (error) {
            console.error('Error cargando athletes:', error);
            return [];
        }
        
        // Convertir a array de nombres (formato que usa la app)
        const athletesArray = data.map(athlete => athlete.name);
        
        console.log(`Athletes cargados desde Supabase para ${clubName}-${divisionName}:`, athletesArray);
        return athletesArray;
    } catch (error) {
        console.error('Error cargando athletes:', error);
        return [];
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
            .order('created_at', { ascending: false })
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




document.addEventListener('DOMContentLoaded', async () => {  
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
                                    loadAthletesFromSupabase(clubName, divisionName).then(athletesArray => {
                                        data[clubName][divisionName] = athletesArray;
                                    })
                                ));
                            })
                        )).then(() => {
                            updateClubsDropdown();
                            updateChronoClubs();
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
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Inicialmente ocultar botón de logout
    logoutBtn.classList.add('hidden');
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

const timeToSeconds = (timeStr) => {
    if (typeof timeStr === 'number') return timeStr;
    
    // MANTENER DNF COMO TEXTO
    if (timeStr === 'DNF') return 'DNF';
    
    if (!timeStr || typeof timeStr !== 'string' || timeStr === '--' || timeStr === '') {
        return null;
    }
    
    const parts = timeStr.split('.');
    if (parts.length === 2) {
        return parseFloat(parts[0]) + (parseFloat(parts[1]) / 1000);
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
    //const currentAthleteEl = document.getElementById('current-athlete');
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
        const frame = `r${channel}`;
        const now = Date.now();
        // Usar el dead time del test seleccionado
        if (selectedTest && testConfig[selectedTest] && testConfig[selectedTest].deadTime) {
            DEAD_TIME = testConfig[selectedTest].deadTime * 1000; // Convertir a milisegundos
        }
        // Verificar tiempo muerto
        if (channelLastFired[channel]) {
            const timeSinceLastFire = now - channelLastFired[channel];
            if (timeSinceLastFire < DEAD_TIME) {
                const remaining = ((DEAD_TIME - timeSinceLastFire) / 1000).toFixed(1);
                console.log(`R${channel} IGNORED - Dead time (${remaining}s remaining)`);
                
                // Visual feedback: botón rojo temporalmente
                const btn = document.getElementById(`photocell-${channel}`);
                btn.style.backgroundColor = '#dc3545';
                setTimeout(() => {
                    btn.style.backgroundColor = '#28a745';
                }, 300);
                
                return; // Ignorar el disparo
            }
        }
        
        // Registrar el disparo
        channelLastFired[channel] = now;
        console.log(`Simulating bluetooth frame: ${frame}`);
        
        // Visual feedback: botón verde más brillante
        const btn = document.getElementById(`photocell-${channel}`);
        btn.style.backgroundColor = '#20c997';
        setTimeout(() => {
            btn.style.backgroundColor = '#28a745';
        }, 200);
        
        // Por ahora, comportamiento idéntico al botón START/TIME
        // TODO: Implementar lógica de fotocélulas con tiempo muerto
        const currentButtonText = startBtn.textContent;
        if (currentButtonText === "START") {
            startBtn.click(); // Simula click en START
        } else {
            startBtn.click(); // Simula click en TIME
        }
    };

    // ========================================
    // NUEVOS EVENT LISTENERS PARA FOTOCÉLULAS
    // ========================================
    
    // Event listeners para botones de fotocélulas
    document.getElementById('photocell-1').addEventListener('click', () => {
        simulatePhotocellFrame(1);
    });

    document.getElementById('photocell-2').addEventListener('click', () => {
        simulatePhotocellFrame(2);
    });

    document.getElementById('photocell-3').addEventListener('click', () => {
        simulatePhotocellFrame(3);
    });

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

    /*const showRepetition = () => {
        currentAthleteEl.textContent = `${currentAthlete} (${currentRepetition}/${totalRepetitions})`;
    };*/

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
    
    const totalTime = repResults.reduce((acc, time) => acc + time, 0);
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


    
    updateTestedDisplay();
    
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

    const updateTestedDisplay = () => {
        const last3 = testedAthletes.slice(0, 3);
        const displayNames = last3.map(result => 
            typeof result === 'string' ? result : result.name
        );
        
        for (let i = 1; i <= 3; i++) {
            const el = document.getElementById(`tested-${i}`);
            el.textContent = displayNames[i-1] || '--';
        }
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
        
        if (selectedAthlete && !testAlreadyFinished) {
            startBtn.disabled = false;
            startBtn.classList.add('enabled');
        } else {
            startBtn.disabled = true;
            startBtn.classList.remove('enabled');
        }
    };

    const updateSaveButton = () => {
        if (availableAthletes.length === 0 && testedAthletes.length > 0) {
            saveBtn.textContent = 'SHOW RESULTS';
            saveBtn.classList.add('results');
        } else {
            saveBtn.textContent = 'FINISH TEST';
            saveBtn.classList.remove('results');
        }
    };

    const updateTestConfig = (test) => {
        if (test && testConfig[test]) {
            const config = testConfig[test];
            document.getElementById('config-times').textContent = config.times;
            document.getElementById('config-repetitions').textContent = config.repetitions;
            document.getElementById('config-recovery').textContent = `${config.recovery} SECONDS`;
            document.getElementById('config-dead-time').textContent = `${config.deadTime || 2} SECONDS`;
            testConfigEl.classList.add('show');
        } else {
            testConfigEl.classList.remove('show');
        }
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
        }
    };

    // Event handlers del cronómetro
    testSelect.addEventListener('change', (e) => {
        selectedTest = e.target.value;
        updateTestConfig(selectedTest);
        
        chronoEl.textContent = '00.000';
        chronoEl.style.fontSize = '48px';
        chronoEl.style.color = '#fff';
        chronoEl.classList.remove('recovery');
        startBtn.classList.remove('timing');
        startBtn.classList.add('enabled');
        //currentAthleteEl.textContent = '--';
        resetDisplay();
        
        if (selectedClub && selectedDivision) {
            const testKey = `${selectedTest}-${selectedClub}-${selectedDivision}`;
            const testState = testStates[testKey];
            
            if (testState) {
                availableAthletes = testState.availableAthletes;
                testedAthletes = testState.testedAthletes;
                updateAthleteSelect();
                updateTestedDisplay();
            } else {
                const athletes = [...data[selectedClub][selectedDivision]];
                availableAthletes = athletes;
                testedAthletes = [];
                updateAthleteSelect();
                updateTestedDisplay();
            }
        }
        
        updateStartButton();
        updateSaveButton();
    });

    clubSelect.addEventListener('change', (e) => {
        selectedClub = e.target.value;
        currentClub = selectedClub;
        selectedDivision = '';
        selectedAthlete = '';
        availableAthletes = [];
        
        chronoEl.textContent = '00.000';
        chronoEl.style.fontSize = '48px';
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
        updateTestedDisplay();
        
        updateStartButton();
    });

    divisionSelect.addEventListener('change', (e) => {
        selectedDivision = e.target.value;
        currentDivision = selectedDivision;
        selectedAthlete = '';
        
        chronoEl.textContent = '00.000';
        chronoEl.style.fontSize = '48px';
        chronoEl.style.color = '#fff';
        chronoEl.classList.remove('recovery');
        startBtn.classList.remove('timing');
        startBtn.classList.add('enabled');
        //currentAthleteEl.textContent = '--';
        resetDisplay();
        
        athleteSelect.innerHTML = '<option value="">-- Choose --</option>';
        
        if (selectedDivision && selectedClub && data[selectedClub][selectedDivision]) {
            const testKey = `${selectedTest}-${selectedClub}-${selectedDivision}`;
            const testState = testStates[testKey];
            
            if (testState) {
                availableAthletes = testState.availableAthletes;
                athleteQueue = testState.availableAthletes;
                testedAthletes = testState.testedAthletes;
                updateTestedDisplay();
            } else {
                const athletes = [...data[selectedClub][selectedDivision]];
                availableAthletes = athletes;
                athleteQueue = athletes;
                testedAthletes = [];
                updateTestedDisplay();
            }
            
            updateAthleteSelect();
        } else {
            availableAthletes = [];
            testedAthletes = [];
            updateTestedDisplay();
        }
        
        updateStartButton();
        updateSaveButton();
    });

    athleteSelect.addEventListener('change', (e) => {
        selectedAthlete = e.target.value;
        if (selectedAthlete && testInProgress) {
            athleteInTest = true;
            athleteSelect.disabled = true;
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
       /*
       // CORREGIR: Display del atleta según tipo de test
       if (config.repetitions === 1 && config.recovery > 0) {
           // Para tests tipo RAST: mostrar tiempo actual / total tiempos
           currentAthleteEl.textContent = `${currentAthlete} (${impulses + 1}/${config.times})`;
       } else if (config.times > 1 && config.repetitions > 1) {
           // Para tests combinados: mostrar repetición actual / total repeticiones
           currentAthleteEl.textContent = `${currentAthlete} (${currentRepetition}/${config.repetitions})`;
       } else {
           // Para otros tests: usar lógica original
           currentAthleteEl.textContent = `${currentAthlete} (${impulses}/${config.times})`;
       }*/
       
       startBtn.textContent = "TIME";
       startBtn.classList.remove('enabled');
       startBtn.classList.add('timing');
       
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
                    console.log('Resultado guardado:', savedResults);
                    updateResultsList();
                   setTimeout(() => showTestCompleted(), 500);
               }
               
               updateStartButton();
               updateSaveButton();
               
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
           
           // Actualizar display para próximo tiempo en RAST
           //currentAthleteEl.textContent = `${currentAthlete} (${impulses + 1}/${config.times})`;
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
        result.athletes.forEach((athlete) => {
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
                <button class="export-result-btn" data-id="${result.id}">SHARE</button>
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
    
    // Procesar datos
    let position = 1;
    result.athletes.forEach((athlete) => {
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
};

const showSavedResult = (result) => {
    const resultsModal = document.getElementById('results-modal');
    const resultsTitle = document.getElementById('results-title');
    const resultsTable = document.getElementById('results-table');
    const testFooter = document.getElementById('test-footer');
    
    resultsTitle.textContent = `Results: ${result.test} - ${result.club} - ${result.division}`;
    
    const config = testConfig[result.test];
    const isCombiTest = config && config.times > 1 && config.repetitions > 1;
    
    // Header adaptado según tipo de test
    let headerHtml;
    if (isCombiTest) {
        headerHtml = `
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
        headerHtml = `
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
    
    resultsTable.innerHTML = headerHtml;
    
    // Procesar los atletas guardados
    const processedResults = [];
    
    result.athletes.forEach((athlete) => {
        if (isCombiTest && athlete.isCombiTest && athlete.allRepetitions) {
            // Para tests combinados
            athlete.allRepetitions.forEach((rep) => {
                // Fila SPLIT
                processedResults.push({
                    athlete: `${athlete.name} REP${rep.repetition} SPLIT`,
                    splits: rep.splits || ['--', '--', '--', '--', '--', '--'],
                    laps: ['', '', '', '', '', ''],
                    rawTime: athlete.totalTime,
                    repNumber: rep.repetition
                });
                
                // Fila LAP
                processedResults.push({
                    athlete: `${athlete.name} REP${rep.repetition} LAP`,
                    splits: ['', '', '', '', '', ''],
                    laps: rep.laps || ['--', '--', '--', '--', '--', '--'],
                    rawTime: athlete.totalTime,
                    repNumber: rep.repetition
                });
            });
        } else {
            // Para tests simples
            processedResults.push({
                athlete: `${athlete.name} SPLIT`,
                splits: athlete.splits || ['--', '--', '--', '--', '--', '--'],
                laps: ['', '', '', '', '', ''],
                rawTime: athlete.time || Infinity,
                showSplits: true
            });
            
            processedResults.push({
                athlete: `${athlete.name} LAP`,
                splits: ['', '', '', '', '', ''],
                laps: athlete.laps || ['--', '--', '--', '--', '--', '--'],
                rawTime: athlete.time || Infinity,
                showSplits: false
            });
        }
    });
    
    // Ordenar y agregar posiciones
    let position = 1;
    let lastTime = -1;
    
    processedResults.forEach((result, index) => {
        const isFirstRow = result.athlete.includes('SPLIT') && 
                          (result.athlete.includes('REP1') || !result.athlete.includes('REP'));
        
        if (isFirstRow && result.rawTime !== lastTime) {
            position = Math.floor(index / (isCombiTest ? (config.repetitions * 2) : 2)) + 1;
            lastTime = result.rawTime;
        }
        
        const row = document.createElement('div');
        row.className = `athlete-row ${index % 2 === 0 ? 'even' : 'odd'}`;
        
        const athleteName = result.athlete.split(' ')[0].replace('-DNF', '');
        const repNumber = result.repNumber || '';
        const typeText = result.athlete.includes('SPLIT') ? 'SPLIT' : 'LAP';
        const showName = isFirstRow;
        const showRep = (result.athlete.includes('SPLIT')) ? repNumber : '';
        const showPos = isFirstRow ? position : '';
        
        const dataToShow = typeText === 'LAP' ? result.laps : result.splits;
        
        if (isCombiTest) {
            row.innerHTML = `
                <div class="athlete-cell position">${showPos}</div>
                <div class="athlete-cell name">${showName ? athleteName : ''}</div>
                <div class="athlete-cell rep">${showRep}</div>
                <div class="athlete-cell type" style="color: ${typeText === 'SPLIT' ? '#4ecdc4' : '#ffa500'}">${typeText}</div>
                ${dataToShow.map((value, idx) => 
                    `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${value === 'DNF' ? '#ff6b6b' : value === '--' || value === '' ? '#666' : typeText === 'SPLIT' ? '#4ecdc4' : '#ffa500'}">${value}</div>`
                ).join('')}
            `;
        } else {
            row.innerHTML = `
                <div class="athlete-cell position">${showPos}</div>
                <div class="athlete-cell name">${showName ? athleteName : ''}</div>
                <div class="athlete-cell type" style="color: ${typeText === 'SPLIT' ? '#4ecdc4' : '#ffa500'}">${typeText}</div>
                ${dataToShow.map((value, idx) => 
                    `<div class="athlete-cell split ${idx === 5 ? 'no-border' : ''}" style="color: ${value === 'DNF' ? '#ff6b6b' : value === '--' || value === '' ? '#666' : typeText === 'SPLIT' ? '#4ecdc4' : '#ffa500'}">${value}</div>`
                ).join('')}
            `;
        }
        
        resultsTable.appendChild(row);
    });
    
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
    
    if (!times || times < 1 || times > 6) {
        alert('Times must be between 1 and 6');
        return false;
    }
    
    if (!repetitions || repetitions < 1 || repetitions > 10) {
        alert('Repetitions must be between 1 and 10');
        return false;
    }
    
    if (recovery < 0 || recovery > 300) {
        alert('Recovery must be between 0 and 300 seconds');
        return false;
    }
    
    if (times == 1 && repetitions > 1) {
        alert('Cannot have multiple repetitions when Times = 1');
        return false;
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
        
        newAddTestBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const nameValue = newTestName ? newTestName.value.trim() : '';
            
            if (!nameValue) {
                alert('Test name is required');
                return;
            }
            const newTestDeadTime = document.getElementById('new-test-dead-time');
            const success = addTest(
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
        alert('Athlete name is required');
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
    };

    // === BOTONES RESET Y SAVE ===
    resetBtn.addEventListener('click', () => {
        const resetModal = document.getElementById('reset-modal');
        const resetText = document.getElementById('reset-text');
        resetText.textContent = `Are you sure you want to reset ${selectedTest || 'TEST'} for ${selectedClub || 'CLUB'} - ${selectedDivision || 'DIVISION'}?`;
        resetModal.classList.add('show');
    });

    document.getElementById('cancel-reset').addEventListener('click', () => {
        document.getElementById('reset-modal').classList.remove('show');
    });

    document.getElementById('confirm-reset').addEventListener('click', () => {
        clearInterval(interval);
        clearInterval(recoveryInterval);
        chronoEl.textContent = '00.000';
        chronoEl.style.fontSize = '48px';
        chronoEl.style.color = '#fff';
        chronoEl.classList.remove('recovery');
        startBtn.textContent = 'START';
        // AGREGAR: Resetear clases del botón START
        startBtn.classList.remove('timing');
        startBtn.classList.add('enabled');
        //currentAthleteEl.textContent = '--';
        
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
        updateTestedDisplay();
        
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
        } else {
            selectedAthlete = '';
        }
        
        updateStartButton();
        updateSaveButton();
        
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
        chronoEl.style.fontSize = '48px';
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
        updateTestedDisplay();
        
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
        updateResultsList();
    });

    // === RESULTS MODAL ===
    const showResults = () => {
    const resultsModal = document.getElementById('results-modal');
    const resultsTitle = document.getElementById('results-title');
    const resultsTable = document.getElementById('results-table');
    const testFooter = document.getElementById('test-footer');
    
    resultsTitle.textContent = `Results: ${selectedTest} - ${selectedClub} - ${selectedDivision}`;
    
    const results = getCurrentResults();
    const config = testConfig[selectedTest];
    const isCombiTest = config && config.times > 1 && config.repetitions > 1;
    
    // Header adaptado según tipo de test
    let headerHtml;
    if (isCombiTest) {
        headerHtml = `
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
        headerHtml = `
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
    
    resultsTable.innerHTML = headerHtml;
    
    if (results.length === 0) {
        resultsTable.innerHTML += '<div class="no-results">No results available for this test</div>';
    } else {
        results.forEach((result, index) => {
            const row = document.createElement('div');
            row.className = `athlete-row ${index % 2 === 0 ? 'even' : 'odd'}`;
            
            // Estilos especiales para tests combinados
            let nameColor = '#fff';
            let posColor = '#4ecdc4';
            
            if (isCombiTest) {
                if (result.isTotal) {
                    nameColor = '#4ecdc4';
                    posColor = '#4ecdc4';
                    row.style.borderTop = '2px solid #555';
                    row.style.borderBottom = '2px solid #555';
                } else if (result.athlete.includes('SPLIT')) {
                    nameColor = '#ffa500';
                } else if (result.athlete.includes('LAP')) {
                    nameColor = '#ff6b6b';
                }
            }
            
            const dataToShow = (result.showSplits === false || result.athlete.includes('LAP')) ? result.laps : result.splits;
            
            // Extraer nombre y tipo
            // Extraer nombre limpio y número de repetición
            // Extraer nombre limpio y número de repetición
            let athleteName = result.athlete;
            let repNumber = '';

            if (result.athlete.includes('REP')) {
                // Para tests combinados: extraer nombre y repetición
                const parts = result.athlete.split(' ');
                athleteName = parts[0].replace('-DNF', ''); // Solo el nombre sin DNF
                repNumber = parts[1].replace('REP', ''); // Solo el número (1, 2, 3)
            } else if (result.athlete.includes('SPLIT')) {
                // Para tests simples: quitar " SPLIT"
                athleteName = result.athlete.replace(' SPLIT', '');
            } else if (result.athlete.includes('LAP')) {
                // Para tests simples: quitar " LAP"
                athleteName = result.athlete.replace(' LAP', '');
            }



            const typeText = result.athlete.includes('SPLIT') ? 'SPLIT' : 
                            result.athlete.includes('LAP') ? 'LAP' : 
                            result.showSplits === true ? 'SPLIT' : 
                            result.showSplits === false ? 'LAP' : '';

            // Mostrar nombre solo en primera fila de cada atleta (SPLIT)
           // Mostrar nombre solo en la primera fila SPLIT de cada atleta
            const isFirstSplitOfAthlete = (result.athlete.includes('SPLIT') || result.showSplits === true) && 
                                        (result.athlete.includes('REP1') || result.repNumber === 1 || !result.athlete.includes('REP'));
            const showName = isFirstSplitOfAthlete;
            // Mostrar REP solo en fila SPLIT para tests combinados
            const showRep = (result.athlete.includes('SPLIT')) ? repNumber : '';

            if (isCombiTest) {
    // Para tests combinados: con columna REP
                row.innerHTML = `
                    <div class="athlete-cell position" style="color: #fff">${result.position || ''}</div>
                    <div class="athlete-cell name" style="color: #fff">${showName ? athleteName : ''}</div>
                    <div class="athlete-cell rep" style="color: #fff">${showRep}</div>
                    <div class="athlete-cell type" style="color: ${typeText === 'SPLIT' ? '#4ecdc4' : '#ffa500'}">${typeText}</div>
                    ${dataToShow.map((value, valueIndex) => 
                        `<div class="athlete-cell split ${valueIndex === 5 ? 'no-border' : ''}" style="color: ${value === 'DNF' ? '#ff6b6b' : value === '--' || value === '' ? '#666' : (result.athlete.includes('SPLIT') || result.showSplits === true) ? '#4ecdc4' : '#ffa500'}">${value}</div>`
                    ).join('')}
                `;
            } else {
                // Para tests simples: SIN columna REP
                row.innerHTML = `
                    <div class="athlete-cell position" style="color: #fff">${result.position || ''}</div>
                    <div class="athlete-cell name" style="color: #fff">${showName ? athleteName : ''}</div>
                    <div class="athlete-cell type" style="color: ${typeText === 'SPLIT' ? '#4ecdc4' : '#ffa500'}">${typeText}</div>
                    ${dataToShow.map((value, valueIndex) => 
                        `<div class="athlete-cell split ${valueIndex === 5 ? 'no-border' : ''}" style="color: ${value === 'DNF' ? '#ff6b6b' : value === '--' || value === '' ? '#666' : (result.athlete.includes('SPLIT') || result.showSplits === true) ? '#4ecdc4' : '#ffa500'}">${value}</div>`
                    ).join('')}
                `;
            }
            
            resultsTable.appendChild(row);
        });
    }
    
    // Footer igual que antes
    const testState = testStates[getCurrentTestKey()];
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

    const getCurrentResults = () => {
    const testKey = getCurrentTestKey();
    const testState = testStates[testKey];
    
    if (!testState || !testState.testedAthletes.length) {
        return [];
    }
    
    const config = testConfig[selectedTest];
    const isCombiTest = config && config.times > 1 && config.repetitions > 1;
    
    if (isCombiTest) {
        // Para tests combinados
        const results = [];
        
        testState.testedAthletes.forEach((result) => {
            if (result.isCombiTest && result.allRepetitions) {
                // Agregar una fila por cada repetición (split + lap)
                result.allRepetitions.forEach((rep, repIndex) => {
                    // Fila SPLIT
                    const splitRow = {
                        athlete: `${result.name} REP${rep.repetition} SPLIT`,
                        time: result.formattedTime,
                        splits: rep.splits || ['--', '--', '--', '--', '--', '--'],
                        laps: ['', '', '', '', '', ''], // Vacío para fila de splits
                        rawTime: result.totalTime,
                        isAthleteRow: false,
                        repNumber: rep.repetition
                    };
                    
                    // Fila LAP
                    const lapRow = {
                        athlete: `${result.name} REP${rep.repetition} LAP`,
                        time: '',
                        splits: ['', '', '', '', '', ''], // Vacío para fila de laps
                        laps: rep.laps || ['--', '--', '--', '--', '--', '--'],
                        rawTime: result.totalTime,
                        isAthleteRow: false,
                        repNumber: rep.repetition
                    };
                    
                    results.push(splitRow, lapRow);
                });
            }
        });
        
        // Ordenar por tiempo total, manteniendo grupos de atletas juntos
        const athleteGroups = [];
        const athletes = [...new Set(results.map(r => r.athlete.split(' ')[0]))];
        
        athletes.forEach(athleteName => {
            const athleteRows = results.filter(r => r.athlete.startsWith(athleteName));
            const firstRow = athleteRows[0];
            athleteGroups.push({
                athlete: athleteName,
                rows: athleteRows,
                totalTime: firstRow ? firstRow.rawTime : Infinity
            });
        });
        
        athleteGroups.sort((a, b) => a.totalTime - b.totalTime);
        
        // Agregar posiciones y aplanar
        const finalResults = [];
        athleteGroups.forEach((group, groupIndex) => {
            group.rows.forEach((row, rowIndex) => {
                if (rowIndex === 0) {
                    row.position = groupIndex + 1;
                } else {
                    row.position = '';
                }
                finalResults.push(row);
            });
        });
        
        return finalResults;
        
    } else {
        // Para tests simples
        const results = [];
        
        testState.testedAthletes.forEach((result) => {
            let athleteData;
            
            if (typeof result === 'string') {
                athleteData = {
                    athlete: result.includes('-DNF') ? result.replace('-DNF', '') : result,
                    time: result.includes('-DNF') ? 'DNF' : 'N/A',
                    splits: ['--', '--', '--', '--', '--', '--'],
                    laps: ['--', '--', '--', '--', '--', '--'],
                    rawTime: result.includes('-DNF') ? Infinity : 0
                };
            } else {
                athleteData = {
                    athlete: result.name.includes('-DNF') ? result.name.replace('-DNF', '') : result.name,
                    time: result.status === 'DNF' ? 'DNF' : result.formattedTime,
                    splits: result.splits || ['--', '--', '--', '--', '--', '--'],
                    laps: result.laps || ['--', '--', '--', '--', '--', '--'],
                    rawTime: result.status === 'DNF' ? Infinity : result.time
                };
            }
            
            // Agregar fila SPLIT
            results.push({
                ...athleteData,
                athlete: `${athleteData.athlete} SPLIT`,
                showSplits: true
            });

            // Agregar fila LAP
            results.push({
                ...athleteData,
                athlete: `${athleteData.athlete} LAP`,
                showSplits: false
            });
        });
        
        // Ordenar manteniendo pares juntos
        const pairedResults = [];
        for (let i = 0; i < results.length; i += 2) {
            const splitRow = results[i];
            const lapRow = results[i + 1];
            pairedResults.push({ splitRow, lapRow, rawTime: splitRow.rawTime });
        }
        
        pairedResults.sort((a, b) => a.rawTime - b.rawTime);
        
        const finalResults = [];
        pairedResults.forEach((pair, index) => {
            pair.splitRow.position = index + 1;
            pair.lapRow.position = '';
            finalResults.push(pair.splitRow, pair.lapRow);
        });
        
        return finalResults;
    }
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
            
            allPages.forEach(pageId => {
                if (pageId !== currentPage) {
                    const button = document.createElement('button');
                    button.className = 'nav-btn';
                    button.textContent = pageNames[pageId];
                    button.dataset.target = pageId;
                    
                    if (testInProgress || athleteInTest) {
                        button.disabled = true;
                        button.style.opacity = '0.5';
                        button.style.cursor = 'not-allowed';
                    } else {
                        button.addEventListener('click', () => navigateToPage(pageId));
                    }
                    
                    navbar.appendChild(button);
                }
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
    updateTestedDisplay();

}); // End of DOMContentLoaded