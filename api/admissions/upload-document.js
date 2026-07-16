// api/admissions/upload-document.js
// Sube un documento de admisiones al bucket PRIVADO 'admissions-documents'.
// El navegador nunca toca la service key ni el bucket: todo pasa por aquí.
//
// Valida que quien sube tenga sesión válida en el sistema (user_id existente y activo).
// Nota de seguridad: el modelo de sesión de SchoolNet usa user_id plano (sin JWT),
// así que esto bloquea al público anónimo pero confía en la capa de sesión existente
// para los usuarios internos. Es coherente con el resto de la plataforma.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = 'admissions-documents';
const REST_API = `${SUPABASE_URL}/rest/v1`;
const STORAGE_API = `${SUPABASE_URL}/storage/v1`;

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MIME_PERMITIDOS = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
];

// ==========================================
// VALIDACIÓN DE SESIÓN
// ==========================================
// Confirma que el user_id corresponde a un usuario activo del sistema.
async function usuarioValido(userId) {
    if (!userId) return false;
    const res = await fetch(
        `${REST_API}/users?select=user_id,user_status&user_id=eq.${userId}&limit=1`,
        {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        }
    );
    if (!res.ok) return false;
    const filas = await res.json();
    if (!filas || filas.length === 0) return false;
    // Si la tabla users tiene un estado, exigir que esté activo.
    const u = filas[0];
    if (u.user_status && u.user_status !== 'active') return false;
    return true;
}

// Confirma que el aspirante exista (evita subir a rutas de aspirantes inexistentes).
async function aspiranteExiste(applicantId) {
    if (!applicantId) return false;
    const res = await fetch(
        `${REST_API}/aap_applicants?select=applicant_id&applicant_id=eq.${applicantId}&limit=1`,
        {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        }
    );
    if (!res.ok) return false;
    const filas = await res.json();
    return filas && filas.length > 0;
}

// ==========================================
// SUBIDA AL BUCKET (con service key)
// ==========================================
async function subirArchivo(path, buffer, contentType) {
    const res = await fetch(`${STORAGE_API}/object/${BUCKET}/${path}`, {
        method: 'POST',
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': contentType,
            'x-upsert': 'false'
        },
        body: buffer
    });
    if (!res.ok) {
        throw new Error(`Storage upload → ${res.status}: ${await res.text()}`);
    }
    return true;
}

// ==========================================
// REGISTRO EN aap_applicant_documents
// ==========================================
async function registrarDocumento(fila) {
    const res = await fetch(`${REST_API}/aap_applicant_documents`, {
        method: 'POST',
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(fila)
    });
    if (!res.ok) {
        throw new Error(`Insert documento → ${res.status}: ${await res.text()}`);
    }
    const filas = await res.json();
    return Array.isArray(filas) ? filas[0] : filas;
}

// ==========================================
// UTILIDADES
// ==========================================
function sanitizarNombre(nombre) {
    // Quita rutas y caracteres problemáticos; conserva la extensión.
    return String(nombre)
        .replace(/[/\\]/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 120);
}

// ==========================================
// HANDLER
// ==========================================
module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Método no permitido' });
    }

    if (!SERVICE_KEY) {
        return res.status(500).json({ success: false, error: 'Servidor sin configurar (falta service key)' });
    }

    try {
        const {
            user_id,
            applicant_id,
            file_base64,
            file_name,
            mime_type,
            document_id,          // opcional: id del catálogo (null = documento libre)
            free_document_name,   // opcional: nombre si es documento libre
            uploaded_by_family,   // bool
            is_post_final_submission // bool
        } = req.body || {};

        // 1. Validaciones de entrada
        if (!file_base64 || !file_name || !applicant_id) {
            return res.status(400).json({ success: false, error: 'Faltan datos obligatorios' });
        }

        if (mime_type && !MIME_PERMITIDOS.includes(mime_type)) {
            return res.status(400).json({ success: false, error: 'Tipo de archivo no permitido' });
        }

        // 2. Sesión: si lo sube la familia (portal público) no hay user_id;
        //    si lo sube el equipo, el user_id debe ser válido.
        const esFamilia = uploaded_by_family === true;
        if (!esFamilia) {
            const ok = await usuarioValido(user_id);
            if (!ok) {
                return res.status(401).json({ success: false, error: 'Sesión no válida' });
            }
        }

        // 3. El aspirante debe existir
        const existe = await aspiranteExiste(applicant_id);
        if (!existe) {
            return res.status(404).json({ success: false, error: 'Aspirante no encontrado' });
        }

        // 4. Decodificar y validar tamaño
        const buffer = Buffer.from(file_base64, 'base64');
        if (buffer.length > MAX_SIZE) {
            return res.status(400).json({ success: false, error: 'El archivo supera el límite de 10 MB' });
        }

        // 5. Ruta: {applicant_id}/{timestamp}_{nombre}
        const nombreLimpio = sanitizarNombre(file_name);
        const timestamp = Date.now();
        const path = `${applicant_id}/${timestamp}_${nombreLimpio}`;

        // 6. Subir al bucket privado
        await subirArchivo(path, buffer, mime_type || 'application/octet-stream');

        // 7. Registrar en la tabla
        const fila = await registrarDocumento({
            applicant_id,
            document_id: document_id || null,
            free_document_name: free_document_name || null,
            file_name: file_name,
            file_path: path,
            file_size: buffer.length,
            mime_type: mime_type || null,
            uploaded_by_family: esFamilia,
            uploaded_by: esFamilia ? null : user_id,
            is_post_final_submission: is_post_final_submission === true
        });

        return res.status(200).json({
            success: true,
            applicant_document_id: fila.applicant_document_id,
            file_path: path
        });

    } catch (error) {
        console.error('Error en upload-document:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
