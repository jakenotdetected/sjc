// Mock Backend Interceptor for SJC Portals
// Intercepts fetch() to route /api/ requests to localStorage

(function() {
  const originalFetch = window.fetch;
  
  // Initialize mock DBs if missing
  if (!localStorage.getItem('sjc_db_students')) {
    localStorage.setItem('sjc_db_students', JSON.stringify([]));
  }
  if (!localStorage.getItem('sjc_db_notes')) {
    localStorage.setItem('sjc_db_notes', JSON.stringify([]));
  }
  if (!localStorage.getItem('sjc_db_categories')) {
    localStorage.setItem('sjc_db_categories', JSON.stringify([]));
  }
  if (!localStorage.getItem('sjc_appointments')) {
    localStorage.setItem('sjc_appointments', JSON.stringify([]));
  }

  const getDB = (key) => JSON.parse(localStorage.getItem('sjc_db_' + key) || '[]');
  const setDB = (key, val) => localStorage.setItem('sjc_db_' + key, JSON.stringify(val));
  const genId = () => Math.random().toString(36).substr(2, 9);

  window.fetch = async function(url, options = {}) {
    // Only intercept /api/ requests
    if (typeof url !== 'string' || !url.startsWith('/api/')) {
      return originalFetch.apply(this, arguments);
    }

    const method = (options.method || 'GET').toUpperCase();
    let body = null;
    if (options.body) {
      try { body = JSON.parse(options.body); } catch(e) { body = options.body; }
    }

    const jsonRes = (data, status = 200) => {
      return Promise.resolve(new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
      }));
    };

    const emptyRes = (status = 200) => {
      return Promise.resolve(new Response(null, { status }));
    };

    console.log(`[Mock API] ${method} ${url}`, body || '');

    // Delay to simulate network
    await new Promise(r => setTimeout(r, 100));

    // Routes
    const urlObj = new URL('http://localhost' + url);
    const path = urlObj.pathname;
    const parts = path.split('/').filter(Boolean);

    try {
      // /api/students
      if (parts[1] === 'students') {
        const students = getDB('students');
        
        // GET /api/students
        if (parts.length === 2 && method === 'GET') {
          return jsonRes(students);
        }
        
        // POST /api/students
        if (parts.length === 2 && method === 'POST') {
          const newStudent = { id: genId(), createdAt: new Date().toISOString(), ...body };
          students.push(newStudent);
          setDB('students', students);
          return jsonRes(newStudent, 201);
        }
        
        const sId = parts[2];
        const studentIdx = students.findIndex(s => s.id === sId);
        
        // GET /api/students/:id
        if (parts.length === 3 && method === 'GET') {
          if (studentIdx > -1) return jsonRes(students[studentIdx]);
          return jsonRes({error: 'Not found'}, 404);
        }
        
        // PUT /api/students/:id
        if (parts.length === 3 && method === 'PUT') {
          if (studentIdx > -1) {
            students[studentIdx] = { ...students[studentIdx], ...body };
            setDB('students', students);
            return jsonRes(students[studentIdx]);
          }
          return jsonRes({error: 'Not found'}, 404);
        }
        
        // DELETE /api/students/:id
        if (parts.length === 3 && method === 'DELETE') {
          if (studentIdx > -1) {
            students.splice(studentIdx, 1);
            setDB('students', students);
            // Delete associated notes
            const notes = getDB('notes').filter(n => n.studentId !== sId);
            setDB('notes', notes);
            return emptyRes(204);
          }
          return jsonRes({error: 'Not found'}, 404);
        }
        
        // /api/students/:id/notes
        if (parts.length >= 4 && parts[3] === 'notes') {
          const allNotes = getDB('notes');
          
          // GET /api/students/:id/notes
          if (parts.length === 4 && method === 'GET') {
            const sNotes = allNotes.filter(n => n.studentId === sId);
            return jsonRes(sNotes);
          }
          
          // POST /api/students/:id/notes
          if (parts.length === 4 && method === 'POST') {
            const newNote = { id: genId(), studentId: sId, createdAt: new Date().toISOString(), ...body };
            allNotes.push(newNote);
            setDB('notes', allNotes);
            return jsonRes(newNote, 201);
          }
          
          // DELETE /api/students/:id/notes/:noteId
          if (parts.length === 5 && method === 'DELETE') {
            const nId = parts[4];
            const noteIdx = allNotes.findIndex(n => n.id === nId && n.studentId === sId);
            if (noteIdx > -1) {
              allNotes.splice(noteIdx, 1);
              setDB('notes', allNotes);
              return emptyRes(204);
            }
            return jsonRes({error: 'Not found'}, 404);
          }
        }
        
        // /api/students/:id/summary
        if (parts.length >= 4 && parts[3] === 'summary') {
          if (method === 'GET') {
            return jsonRes({ summary: "This is a mock summary generated by the local browser interceptor." });
          }
          if (method === 'POST') {
            return jsonRes({ summary: "Mock AI Summary generated successfully based on local notes." });
          }
        }
      }

      // /api/categories
      if (parts[1] === 'categories') {
        const cats = getDB('categories');
        if (method === 'GET') return jsonRes(cats);
        if (method === 'POST') {
          if (cats.find(c => c.name.toLowerCase() === body.name.toLowerCase())) {
            return jsonRes({error: 'Conflict'}, 409);
          }
          const newCat = { id: genId(), name: body.name };
          cats.push(newCat);
          setDB('categories', cats);
          return jsonRes(newCat, 201);
        }
        if (method === 'DELETE' && parts.length === 3) {
          const catIdx = cats.findIndex(c => c.id === parts[2]);
          if (catIdx > -1) {
            cats.splice(catIdx, 1);
            setDB('categories', cats);
            return emptyRes(204);
          }
        }
      }

      // /api/appointments
      if (parts[1] === 'appointments') {
        const apts = JSON.parse(localStorage.getItem('sjc_appointments') || '[]');
        if (method === 'GET') {
          return jsonRes(apts);
        }
        if (method === 'POST') {
          const newApt = { id: genId(), createdAt: new Date().toISOString(), status: 'pending', ...body };
          apts.push(newApt);
          localStorage.setItem('sjc_appointments', JSON.stringify(apts));
          return jsonRes(newApt, 201);
        }
        if (method === 'PUT' && parts.length === 3) {
          const aptIdx = apts.findIndex(a => a.id === parts[2]);
          if (aptIdx > -1) {
            apts[aptIdx] = { ...apts[aptIdx], ...body };
            localStorage.setItem('sjc_appointments', JSON.stringify(apts));
            return jsonRes(apts[aptIdx]);
          }
          return jsonRes({error: 'Not found'}, 404);
        }
        if (method === 'DELETE' && parts.length === 3) {
          const aptIdx = apts.findIndex(a => a.id === parts[2]);
          if (aptIdx > -1) {
            apts.splice(aptIdx, 1);
            localStorage.setItem('sjc_appointments', JSON.stringify(apts));
            return emptyRes(204);
          }
          return jsonRes({error: 'Not found'}, 404);
        }
      }

      // /api/import/images
      if (parts[1] === 'import' && parts[2] === 'images') {
        const results = (body.images || []).map((img, i) => ({
          ok: true,
          data: { name: `Mock Scanned Student ${i+1}`, type: 'student', grade: '10', age: '15' }
        }));
        return jsonRes({ results });
      }

      // /api/transcribe
      if (parts[1] === 'transcribe') {
        return jsonRes({ text: "[Mock Voice Transcription] " + (body.audioBase64 ? "Audio processed." : "No audio.") });
      }
      
      // /api/ai/status
      if (parts[1] === 'ai' && parts[2] === 'status') {
        return jsonRes({ enabled: true });
      }

      console.warn('[Mock API] Unhandled route:', method, url);
      return jsonRes({error: 'Not implemented'}, 501);

    } catch(err) {
      console.error('[Mock API] Error:', err);
      return jsonRes({error: 'Internal Server Error'}, 500);
    }
  };
})();
