// Configuración del Sistema NEXT
// Creado: [pon la fecha de hoy]

const SUPABASE_URL = 'https://spjzvpcsgbewxupjvmfm.supabase.co';
const SUPABASE_ANON_KEY = 'tu_clave_aqui'; // Cambiar por tu clave real

const APP_CONFIG = {
    name: 'Sistema NEXT',
    version: '1.0.0',
    modules: ['security', 'indicators']
};

// Función para mostrar mensajes
function showMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
}
