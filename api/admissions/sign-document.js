// api/admissions/sign-document.js
// Genera una URL firmada de vida corta para VER un documento del bucket privado.
// Sin pasar por aquí, el documento es inaccesible: el bucket no permite al rol anon.
//
// Valida sesión del usuario antes de firmar. La URL firmada dura 5 minutos:
// suficiente para abrir/descargar, pero no queda como enlace público permanente.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = 'admissions-documents';
const REST_API = `${SUPABASE_URL}/rest/v1`;
const STORAGE_API = `${SUPABASE_URL}/storage/v1`;

const EXPIRA_SEGUNDOS = 300; // 5 minutos

// ==========================================
// VALIDACIÓN DE SESIÓN
// ==========================================
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
    const u = filas[0];
    if (u.user_status && u.user_status !== 'active') return false;
    return true;
}

// Confirma que el documento existe en la tabla y devuelve su ruta real,
// para no firmar rutas arbitrarias que un cliente manipule.
async function rutaDelDocumento(applicantDocumentId) {
    const res = await fetch(
        `${REST_API}/aap_applicant_documents?select=file_path,file_name` +
        `&applicant_document_id=eq.${applicantDocumentId}&limit=1`,
        {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        }
    );
    if (!res.ok) return null;
    const filas = await res.json();
    if (!filas || filas.length === 0) return null;
    return filas[0];
}

// ==========================================
// FIRMA DE URL (con service key)
// ==========================================
async function firmarUrl(path) {
    const res = await fetch(`${STORAGE_API}/object/sign/${BUCKET}/${path}`, {
        method: 'POST',
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expiresIn: EXPIRA_SEGUNDOS })
    });
    if (!res.ok) {
        throw new Error(`Sign → ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    // La respuesta trae signedURL relativo: /object/sign/... → se antepone el dominio.
    return `${STORAGE_API}${data.signedURL.replace('/storage/v1', '')}`;
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
        const { user_id, applicant_document_id } = req.body || {};

        if (!applicant_document_id) {
            return res.status(400).json({ success: false, error: 'Falta el documento' });
        }

        // Ver documentos siempre requiere sesión válida (nunca es acción pública).
        const ok = await usuarioValido(user_id);
        if (!ok) {
            return res.status(401).json({ success: false, error: 'Sesión no válida' });
        }

        // La ruta se toma de la BD, no del cliente: no se firma nada arbitrario.
        const doc = await rutaDelDocumento(applicant_document_id);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Documento no encontrado' });
        }

        const signedUrl = await firmarUrl(doc.file_path);

        return res.status(200).json({
            success: true,
            url: signedUrl,
            file_name: doc.file_name,
            expira_en: EXPIRA_SEGUNDOS
        });

    } catch (error) {
        console.error('Error en sign-document:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
