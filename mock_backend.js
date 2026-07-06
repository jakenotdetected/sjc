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

    // Pass admin routes, scheduling, and public appointment requests to the real server
    // (real server enforces the per-device booking limit and sends confirmation email)
    if (url.startsWith('/api/admin/') || url === '/api/schedule-appointment' ||
        (url === '/api/appointments' && method === 'POST')) {
      return originalFetch.apply(this, arguments);
    }

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
          // Forward to real server: saves to appointments.json + sends confirmation email
          originalFetch.call(this, '/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, id: newApt.id, createdAt: newApt.createdAt, status: 'pending' })
          }).catch(e => console.warn('[Mock] Server forward failed:', e.message));
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

      // /api/admin/send-email
      if (parts[1] === 'admin' && parts[2] === 'send-email') {
        // Log to sent store so inbox/sent show it
        if (body && body.to) {
          const sent = JSON.parse(localStorage.getItem('sjc_sent_emails') || '[]');
          sent.unshift({
            uid: Date.now(),
            subject: body.subject || '(no subject)',
            from: 'sjc.counselling.anuradhpura@gmail.com',
            to: body.to,
            date: new Date().toISOString(),
            snippet: (body.body || '').slice(0, 160),
            body: body.body || '',
            isHtml: false
          });
          localStorage.setItem('sjc_sent_emails', JSON.stringify(sent));
        }
        return jsonRes({ success: true });
      }

      // /api/admin/emails/inbox
      if (parts[1] === 'admin' && parts[2] === 'emails' && parts[3] === 'inbox') {
        const mockInbox = JSON.parse(localStorage.getItem('sjc_mock_inbox') || '[]');
        if (!mockInbox.length) {
          // Seed with sample emails so the inbox isn't empty
          const seed = [
            { uid: 1001, subject: 'Counselling Appointment Request', from: 'parent.silva@gmail.com', to: 'sjc.counselling.anuradhpura@gmail.com', date: new Date(Date.now()-3600000).toISOString(), snippet: 'Dear Sir, My son Kavindu is in Grade 10A. He has been experiencing some issues...', body: 'Dear Sir,\n\nMy son Kavindu is in Grade 10A. He has been experiencing some issues with his studies and social life. I would like to request a counselling appointment at your earliest convenience.\n\nThank you.\nMrs. Silva', isHtml: false },
            { uid: 1002, subject: 'Re: Session Follow-up', from: 'teacher.fernando@sjc.lk', to: 'sjc.counselling.anuradhpura@gmail.com', date: new Date(Date.now()-86400000).toISOString(), snippet: 'Good morning, Just following up on the session we had with Nimasha last week...', body: 'Good morning,\n\nJust following up on the session we had with Nimasha last week. She seems to be doing much better in class. Thank you for your support.\n\nMr. Fernando\nClass Teacher, 11B', isHtml: false },
            { uid: 1003, subject: 'Student Wellbeing Concern', from: 'admin@sjc.lk', to: 'sjc.counselling.anuradhpura@gmail.com', date: new Date(Date.now()-172800000).toISOString(), snippet: 'Please review the attached concern raised by the form teacher regarding a student in Grade 9...', body: 'Please review the attached concern raised by the form teacher regarding a student in Grade 9C.\n\nThe student has been absent frequently and the teacher is concerned about family issues.\n\nPrincipal\'s Office\nSt. Joseph\'s College', isHtml: false }
          ];
          localStorage.setItem('sjc_mock_inbox', JSON.stringify(seed));
          return jsonRes(seed);
        }
        if (parts[4] === 'message' && parts[5]) {
          const uid = parseInt(parts[5]);
          const msg = mockInbox.find(m => m.uid === uid);
          return msg ? jsonRes(msg) : jsonRes({error:'Not found'}, 404);
        }
        return jsonRes(mockInbox);
      }

      // /api/admin/emails/sent
      if (parts[1] === 'admin' && parts[2] === 'emails' && parts[3] === 'sent') {
        const sent = JSON.parse(localStorage.getItem('sjc_sent_emails') || '[]');
        if (parts[4] === 'message' && parts[5]) {
          const uid = parseInt(parts[5]);
          const msg = sent.find(m => m.uid === uid || m.timestamp === uid);
          return msg ? jsonRes(msg) : jsonRes({error:'Not found'}, 404);
        }
        return jsonRes(sent);
      }

      // /api/admin/appointments (GET)
      if (parts[1] === 'admin' && parts[2] === 'appointments' && method === 'GET') {
        const apts = JSON.parse(localStorage.getItem('sjc_appointments') || '[]');
        return jsonRes(apts);
      }

      console.warn('[Mock API] Unhandled route:', method, url);
      return jsonRes({error: 'Not implemented'}, 501);

    } catch(err) {
      console.error('[Mock API] Error:', err);
      return jsonRes({error: 'Internal Server Error'}, 500);
    }
  };
})();
