// api/admissions/delete-document.js
// Borra un documento del aspirante: del bucket privado y de la tabla.
// Requiere sesión (user_id). Regla (v0.12 §7.3): no se pueden borrar documentos
// previos al envío final del Paso 4; sí los agregados después
// (is_post_final_submission = true). Patrón CommonJS + fetch, igual que los cron.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'admissions-documents';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Método no permitido' });
    }
    if (!SUPABASE_URL || !SERVICE_KEY) {
        return res.status(500).json({ success: false, error: 'Servidor sin configurar (falta service key)' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const { user_id, applicant_document_id } = body;

        // Ver/borrar documentos SIEMPRE requiere sesión (usuario interno).
        if (!user_id) {
            return res.status(401).json({ success: false, error: 'Esta acción requiere sesión.' });
        }
        if (!applicant_document_id) {
            return res.status(400).json({ success: false, error: 'Falta applicant_document_id.' });
        }

        // REST necesita ambos headers; Storage solo Authorization.
        const restHeaders = {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
        };

        // 1. Leer la ruta del archivo, el flag y el estado de envío del aspirante.
        const getUrl = `${SUPABASE_URL}/rest/v1/aap_applicant_documents` +
            `?select=file_path,is_post_final_submission,aap_applicants(step4_submitted_at)` +
            `&applicant_document_id=eq.${applicant_document_id}&limit=1`;
        const getResp = await fetch(getUrl, { headers: restHeaders });
        if (!getResp.ok) {
            const t = await getResp.text();
            return res.status(500).json({ success: false, error: 'Error al leer el documento: ' + t });
        }
        const rows = await getResp.json();
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Documento no encontrado.' });
        }
        const doc = rows[0];

        // 2. Regla de bloqueo: tras el envío final, los documentos previos no se borran.
        const yaEnviado = doc.aap_applicants && doc.aap_applicants.step4_submitted_at;
        if (yaEnviado && doc.is_post_final_submission === false) {
            return res.status(403).json({
                success: false,
                error: 'No se puede eliminar un documento previo al envío final del proceso en línea.'
            });
        }

        // 3. Borrar el objeto del bucket privado (Storage API: SOLO Authorization).
        if (doc.file_path) {
            const delObjUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${doc.file_path}`;
            const delObjResp = await fetch(delObjUrl, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${SERVICE_KEY}` }
            });
            // Si el objeto ya no existe (404), continuamos: igual limpiamos la fila.
            if (!delObjResp.ok && delObjResp.status !== 404) {
                const t = await delObjResp.text();
                return res.status(500).json({ success: false, error: 'Error al borrar el archivo: ' + t });
            }
        }

        // 4. Borrar la fila (REST: ambos headers, con filtro).
        const delRowUrl = `${SUPABASE_URL}/rest/v1/aap_applicant_documents` +
            `?applicant_document_id=eq.${applicant_document_id}`;
        const delRowResp = await fetch(delRowUrl, { method: 'DELETE', headers: restHeaders });
        if (!delRowResp.ok) {
            const t = await delRowResp.text();
            return res.status(500).json({ success: false, error: 'Error al borrar el registro: ' + t });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
