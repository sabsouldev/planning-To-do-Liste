import { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";

// Reference de tous les jours de la semaine (pour pouvoir les restaurer)
const allDays = [
  { id: 1, name: "LUNDI",    color: "#4472C4" },
  { id: 2, name: "MARDI",    color: "#ED7D31" },
  { id: 3, name: "MERCREDI", color: "#70AD47" },
  { id: 4, name: "JEUDI",    color: "#9B59B6" },
  { id: 5, name: "VENDREDI", color: "#E74C3C" },
  { id: 6, name: "SAMEDI",   color: "#1ABC9C" },
  { id: 7, name: "DIMANCHE", color: "#F39C12" },
];

// Donnees initiales du planning hebdomadaire
const initialDays = [
  {
    id: 1, name: "LUNDI", color: "#4472C4",
    events: [
      { id: 1, time: "9h – 10h30", label: "Aide à domicile", type: "aide" },
      { id: 2, time: "14h – 16h", label: "Aide à domicile", type: "aide" },
      { id: 3, time: "", label: "// Travail", type: "travail" },
    ],
  },
  {
    id: 2, name: "MARDI", color: "#ED7D31",
    events: [
      { id: 1, time: "", label: "Sortie plaisir", type: "plaisir" },
      { id: 2, time: "", label: "OU", type: "note" },
      { id: 3, time: "", label: "Sortie plaisir", type: "plaisir" },
    ],
  },
  {
    id: 3, name: "MERCREDI", color: "#70AD47",
    events: [
      { id: 1, time: "", label: "Bain + Machine à laver", type: "maison" },
      { id: 2, time: "", label: "Travail", type: "travail" },
      { id: 3, time: "", label: "Machine à laver (Charlie présent)", type: "maison" },
    ],
  },
  {
    id: 4, name: "JEUDI", color: "#9B59B6",
    events: [
      { id: 1, time: "", label: "Travail", type: "travail" },
      { id: 2, time: "14h – 15h", label: "Elodie", type: "rdv" },
      { id: 3, time: "16h", label: "Restau du Cœur", type: "rdv" },
    ],
  },
  {
    id: 5, name: "VENDREDI", color: "#E74C3C",
    events: [
      { id: 1, time: "", label: "Machine à laver", type: "maison" },
      { id: 2, time: "10h – 11h", label: "AAD", type: "aide" },
      { id: 3, time: "11h15 – 12h45", label: "Aide à domicile", type: "aide" },
      { id: 4, time: "15h", label: "Benjamin → 16h AAD", type: "rdv" },
    ],
  },
  { id: 6, name: "SAMEDI", color: "#1ABC9C", events: [] },
];

// Taches initiales de la to-do list avec priorite
const initialTodos = [
  { id: 1, label: "Acheter du pain", type: "courses", time: "", done: false, priority: "moyenne" },
  { id: 2, label: "Appeler médecin", type: "rdv", time: "", done: false, priority: "haute" },
  { id: 3, label: "Lessive couleurs", type: "maison", time: "", done: false, priority: "basse" },
  { id: 4, label: "Sport 15 mins", type: "sport", time: "", done: false, priority: "moyenne" },
];

// Palette de couleurs par type d'activite/tache
const typeColors = {
  aide:    { bg: "#EBF5FB", border: "#2E86C1" },
  travail: { bg: "#EAFAF1", border: "#1E8449" },
  plaisir: { bg: "#FEF9E7", border: "#D4AC0D" },
  maison:  { bg: "#F4ECF7", border: "#7D3C98" },
  rdv:     { bg: "#FDEDEC", border: "#C0392B" },
  note:    { bg: "#F8F9FA", border: "#AEB6BF" },
  sport:   { bg: "#FEF0F0", border: "#E74C3C" },
  courses: { bg: "#FFF8E7", border: "#F39C12" },
  autre:   { bg: "#FDF2E9", border: "#E67E22" },
};

// Libelles affiches dans la legende et les selects
const typeLabels = {
  aide: "Aide", travail: "Travail", plaisir: "Plaisir",
  maison: "Maison", rdv: "Rendez-vous", note: "Note",
  sport: "Sport 🏃", courses: "Courses 🛒", autre: "Autre",
};

// Priorites avec couleurs et ordre de tri
const priorityConfig = {
  haute:   { label: "🔴 Haute",   color: "#E74C3C", order: 1 },
  moyenne: { label: "🟡 Moyenne", color: "#F39C12", order: 2 },
  basse:   { label: "🟢 Basse",  color: "#27AE60", order: 3 },
};

// Extrait l'heure de debut pour trier les evenements
const parseHour = (time) => {
  if (!time) return 99;
  const match = time.match(/(\d+)/);
  return match ? parseInt(match[1]) : 99;
};
// Trie les evenements d'un jour par heure croissante
const sortEvents = (events) => [...events].sort((a, b) => parseHour(a.time) - parseHour(b.time));

// Styles inline reutilisables
const inputStyle = {
  width: "100%", padding: "5px 8px", borderRadius: 6,
  border: "1px solid rgba(0,0,0,0.2)", fontSize: 12,
  boxSizing: "border-box", background: "#fff", color: "#2c3e50",
};
const btnSave = {
  flex: 1, padding: "5px 10px", background: "#27AE60",
  color: "#fff", border: "none", borderRadius: 6, cursor: "pointer",
  fontSize: 12, fontWeight: 600,
};
const btnCancel = {
  flex: 1, padding: "5px 10px", background: "rgba(0,0,0,0.15)",
  color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
};
const iconBtn = (bg) => ({
  background: bg, border: "none", borderRadius: 5,
  cursor: "pointer", fontSize: 11, padding: "2px 5px", lineHeight: 1,
});

// Charge les donnees depuis localStorage ou renvoie la valeur par defaut
const loadState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
};

export default function App() {
  // Etats principaux de l'application (persistés dans localStorage)
  const [days, setDays] = useState(() => loadState("planning-days", initialDays));
  const [todos, setTodos] = useState(() => loadState("planning-todos", initialTodos));
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({ time: "", label: "", type: "autre" });
  const [deletingDay, setDeletingDay] = useState(null);
  const [newTodo, setNewTodo] = useState({ label: "", time: "", type: "courses", priority: "moyenne" });
  const [addingTodo, setAddingTodo] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const draggingTodo = useRef(null);
  const planningRef = useRef(null);

  // Sauvegarde automatique dans localStorage
  useEffect(() => { localStorage.setItem("planning-days", JSON.stringify(days)); }, [days]);
  useEffect(() => { localStorage.setItem("planning-todos", JSON.stringify(todos)); }, [todos]);

  // Export PDF
  const handleExportPDF = () => {
    const element = planningRef.current;
    if (!element) return;
    const opt = {
      margin: [5, 5, 5, 5],
      filename: "planning-semaine.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#1a1a2e" },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };
    html2pdf().set(opt).from(element).save();
  };

  // Ouvre le mode edition pour un evenement
  const handleEditEvent = (dayId, event) => {
    setEditingEvent({ dayId, eventId: event.id });
    setEditForm({ time: event.time, label: event.label, type: event.type });
  };

  const handleSaveEdit = () => {
    setDays(days.map(day =>
      day.id === editingEvent.dayId
        ? { ...day, events: sortEvents(day.events.map(ev => ev.id === editingEvent.eventId ? { ...ev, ...editForm } : ev)) }
        : day
    ));
    setEditingEvent(null);
  };

  // Supprime un evenement d'un jour
  const handleDeleteEvent = (dayId, eventId) => {
    setDays(days.map(day =>
      day.id === dayId ? { ...day, events: day.events.filter(ev => ev.id !== eventId) } : day
    ));
    if (editingEvent?.dayId === dayId && editingEvent?.eventId === eventId) setEditingEvent(null);
  };

  // Supprime une colonne/jour complete
  const handleDeleteDay = (dayId) => {
    setDays(days.filter(d => d.id !== dayId));
    setDeletingDay(null);
  };

  // Restaure un jour supprime (vide, a sa bonne position dans la semaine)
  const handleRestoreDay = (dayRef) => {
    setDays(prev => {
      const updated = [...prev, { ...dayRef, events: [] }];
      return updated.sort((a, b) => a.id - b.id);
    });
  };

  // Jours actuellement absents du planning
  const missingDays = allDays.filter(d => !days.some(existing => existing.id === d.id));

  // Ajoute une nouvelle tache dans la to-do list
  const handleAddTodo = () => {
    if (!newTodo.label.trim()) return;
    setTodos([...todos, { id: Date.now(), ...newTodo, done: false }]);
    setNewTodo({ label: "", time: "", type: "courses", priority: "moyenne" });
    setAddingTodo(false);
  };

  const handleToggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const handleDeleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  // Memorise la tache en cours de drag
  const handleDragStart = (todo) => { draggingTodo.current = todo; };

  // Depose une tache sur un jour et la transforme en evenement
  const handleDrop = (dayId) => {
    const todo = draggingTodo.current;
    if (!todo) return;
    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, events: sortEvents([...day.events, { id: Date.now(), time: todo.time || "", label: todo.label, type: todo.type }]) }
        : day
    ));
    setTodos(todos.filter(t => t.id !== todo.id));
    draggingTodo.current = null;
    setDragOver(null);
  };

  // Separation visuelle entre taches actives et taches terminees
  const activeTodos = todos.filter(t => !t.done);
  const doneTodos = todos.filter(t => t.done);

  // Taches triees par priorite pour le panneau Notes
  const sortedByPriority = [...activeTodos].sort(
    (a, b) => (priorityConfig[a.priority]?.order || 99) - (priorityConfig[b.priority]?.order || 99)
  );

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", fontFamily: "'Segoe UI', sans-serif", padding: "20px 16px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: "12px 28px", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <span style={{ fontSize: 26 }}>📅</span>
          <div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>PLANNING DE LA SEMAINE</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: 3, marginTop: 2 }}>ÉDITABLE · INTERACTIF</div>
          </div>
          <button
            onClick={handleExportPDF}
            style={{
              marginLeft: 16, background: "linear-gradient(135deg, #E74C3C, #C0392B)",
              color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px",
              cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: 1,
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 4px 15px rgba(231,76,60,0.4)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Sport banner */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <span style={{ background: "linear-gradient(90deg, #E74C3C, #C0392B)", color: "#fff", borderRadius: 30, padding: "6px 24px", fontSize: 13, fontWeight: 700, letterSpacing: 2, boxShadow: "0 4px 15px rgba(231,76,60,0.4)" }}>
          ⟵ &nbsp; SPORT : 15 MINS &nbsp; ⟶
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 }}>
        {Object.entries(typeLabels).map(([key, label]) => (
          <span key={key} style={{ background: typeColors[key].bg, border: `1.5px solid ${typeColors[key].border}`, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600, color: typeColors[key].border }}>
            {label}
          </span>
        ))}
      </div>

      {/* Zone exportable en PDF */}
      <div ref={planningRef} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1400, margin: "0 auto" }}>

        {/* Planning grid + Panneau Notes */}
        <div style={{ display: "flex", gap: 12 }}>

          {/* Grille des jours (Lundi-Samedi) */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {days.map(day => (
              <div
                key={day.id}
                onDragOver={e => { e.preventDefault(); setDragOver(day.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(day.id)}
                style={{
                  background: dragOver === day.id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  border: dragOver === day.id ? `2px solid ${day.color}` : "1px solid rgba(255,255,255,0.1)",
                  overflow: "hidden",
                  backdropFilter: "blur(6px)",
                  transition: "all 0.2s",
                  boxShadow: dragOver === day.id ? `0 0 20px ${day.color}55` : "none",
                }}
              >
                <div style={{ background: day.color, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: 2 }}>{day.name}</span>
                  <button onClick={() => setDeletingDay(day.id)} style={{ background: "rgba(0,0,0,0.2)", border: "none", borderRadius: "50%", width: 20, height: 20, color: "#fff", cursor: "pointer", fontSize: 11 }}>✕</button>
                </div>

                {dragOver === day.id && (
                  <div style={{ background: `${day.color}22`, borderBottom: `1px dashed ${day.color}`, padding: "6px", textAlign: "center", color: day.color, fontSize: 11, fontWeight: 700 }}>
                    ⬇ Déposer ici
                  </div>
                )}

                <div style={{ padding: "10px 10px 6px" }}>
                  {day.events.length === 0 && dragOver !== day.id && (
                    <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center", padding: "12px 0", fontStyle: "italic" }}>Glisser une tâche ici</div>
                  )}
                  {day.events.map(event => {
                    const tc = typeColors[event.type] || typeColors.autre;
                    const isEditing = editingEvent?.dayId === day.id && editingEvent?.eventId === event.id;
                    return (
                      <div key={event.id} style={{ background: tc.bg, border: `1.5px solid ${tc.border}`, borderRadius: 10, marginBottom: 7, padding: "7px 9px" }}>
                        {isEditing ? (
                          <div>
                            <input value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} placeholder="Horaire" style={inputStyle} />
                            <input value={editForm.label} onChange={e => setEditForm({ ...editForm, label: e.target.value })} placeholder="Événement" style={{ ...inputStyle, marginTop: 4 }} />
                            <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} style={{ ...inputStyle, marginTop: 4 }}>
                              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                              <button onClick={handleSaveEdit} style={btnSave}>✓</button>
                              <button onClick={() => setEditingEvent(null)} style={btnCancel}>✕</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              {event.time && <div style={{ color: tc.border, fontWeight: 700, fontSize: 10, marginBottom: 2 }}>{event.time}</div>}
                              <div style={{ color: "#2c3e50", fontSize: 12, fontWeight: 600 }}>{event.label}</div>
                            </div>
                            <div style={{ display: "flex", gap: 3, marginLeft: 4 }}>
                              <button onClick={() => handleEditEvent(day.id, event)} style={iconBtn("rgba(0,0,0,0.1)")}>✏️</button>
                              <button onClick={() => handleDeleteEvent(day.id, event.id)} style={iconBtn("rgba(231,76,60,0.15)")}>🗑</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Boutons pour restaurer les jours supprimés */}
          {missingDays.length > 0 && (
            <div style={{
              display: "flex", flexDirection: "column", gap: 6,
              justifyContent: "flex-start", alignSelf: "flex-start",
            }}>
              {missingDays.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleRestoreDay(d)}
                  style={{
                    background: `${d.color}22`, border: `1.5px dashed ${d.color}`,
                    borderRadius: 10, color: d.color, fontSize: 11, fontWeight: 700,
                    padding: "8px 14px", cursor: "pointer", letterSpacing: 1,
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${d.color}44`; e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${d.color}22`; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  + {d.name}
                </button>
              ))}
            </div>
          )}

          {/* Panneau Notes & Priorites (remplace Dimanche) */}
          <div style={{
            width: 260, minWidth: 240, flexShrink: 0,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden",
            backdropFilter: "blur(6px)",
          }}>
            <div style={{
              background: "linear-gradient(135deg, #F39C12, #E67E22)",
              padding: "10px 12px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>📌</span>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: 2 }}>NOTES & PRIORITÉS</span>
            </div>

            <div style={{ padding: "12px 10px" }}>
              {sortedByPriority.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>
                  Aucune tâche en cours
                </div>
              ) : (
                sortedByPriority.map((todo, index) => {
                  const tc = typeColors[todo.type] || typeColors.autre;
                  const pc = priorityConfig[todo.priority] || priorityConfig.moyenne;
                  return (
                    <div key={todo.id} style={{
                      background: tc.bg, border: `1.5px solid ${tc.border}`,
                      borderRadius: 10, marginBottom: 8, padding: "8px 10px",
                      borderLeft: `4px solid ${pc.color}`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: pc.color,
                          background: `${pc.color}18`, borderRadius: 6, padding: "1px 6px",
                          letterSpacing: 1,
                        }}>
                          {pc.label}
                        </span>
                        <span style={{ color: "rgba(0,0,0,0.3)", fontSize: 10, fontWeight: 700 }}>#{index + 1}</span>
                      </div>
                      <div style={{ color: "#2c3e50", fontSize: 12, fontWeight: 600 }}>{todo.label}</div>
                      {todo.time && <div style={{ color: tc.border, fontSize: 10, fontWeight: 700, marginTop: 2 }}>{todo.time}</div>}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <span style={{
                          fontSize: 9, color: tc.border, background: `${tc.border}15`,
                          borderRadius: 4, padding: "1px 5px", fontWeight: 600,
                        }}>
                          {typeLabels[todo.type] || "Autre"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Legende des priorites */}
              <div style={{
                marginTop: 12, paddingTop: 10,
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>PRIORITÉS</div>
                {Object.entries(priorityConfig).map(([key, cfg]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>{cfg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* TO-DO LIST en bas pleine largeur */}
        <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", backdropFilter: "blur(10px)" }}>
          <div style={{ background: "linear-gradient(135deg, #2c3e50, #34495e)", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: 2 }}>📋 TO-DO LIST</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 3 }}>Glisse une tâche vers un jour du planning</div>
          </div>

          <div style={{ padding: "12px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>

            {activeTodos.length === 0 && !addingTodo && (
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontStyle: "italic" }}>Aucune tâche en cours</div>
            )}

            {activeTodos.map(todo => {
              const tc = typeColors[todo.type] || typeColors.autre;
              const pc = priorityConfig[todo.priority] || priorityConfig.moyenne;
              return (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={() => handleDragStart(todo)}
                  style={{
                    background: tc.bg, border: `1.5px solid ${tc.border}`,
                    borderRadius: 10, padding: "8px 10px",
                    borderLeft: `4px solid ${pc.color}`,
                    cursor: "grab", display: "flex", alignItems: "center",
                    gap: 8, userSelect: "none", transition: "transform 0.15s",
                    minWidth: 160,
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span style={{ color: tc.border, fontSize: 16, opacity: 0.5 }}>⠿</span>
                  <input type="checkbox" checked={todo.done} onChange={() => handleToggleTodo(todo.id)} style={{ cursor: "pointer", accentColor: tc.border, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#2c3e50", fontSize: 12, fontWeight: 600 }}>{todo.label}</div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                      {todo.time && <span style={{ color: tc.border, fontSize: 10, fontWeight: 700 }}>{todo.time}</span>}
                      <span style={{ fontSize: 9, color: pc.color, fontWeight: 700 }}>{pc.label}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTodo(todo.id)} style={{ ...iconBtn("rgba(231,76,60,0.15)"), flexShrink: 0 }}>🗑</button>
                </div>
              );
            })}

            {addingTodo ? (
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, border: "1.5px dashed rgba(255,255,255,0.3)", minWidth: 220 }}>
                <input
                  value={newTodo.label}
                  onChange={e => setNewTodo({ ...newTodo, label: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleAddTodo()}
                  placeholder="Nouvelle tâche *"
                  style={inputStyle}
                  autoFocus
                />
                <input
                  value={newTodo.time}
                  onChange={e => setNewTodo({ ...newTodo, time: e.target.value })}
                  placeholder="Horaire (optionnel, ex: 9h-10h)"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
                <select value={newTodo.type} onChange={e => setNewTodo({ ...newTodo, type: e.target.value })} style={{ ...inputStyle, marginTop: 4 }}>
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={newTodo.priority} onChange={e => setNewTodo({ ...newTodo, priority: e.target.value })} style={{ ...inputStyle, marginTop: 4 }}>
                  {Object.entries(priorityConfig).map(([k, cfg]) => <option key={k} value={k}>{cfg.label}</option>)}
                </select>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button onClick={handleAddTodo} style={btnSave}>+ Ajouter</button>
                  <button onClick={() => setAddingTodo(false)} style={btnCancel}>✕</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingTodo(true)}
                style={{ minWidth: 150, background: "rgba(255,255,255,0.06)", border: "1.5px dashed rgba(255,255,255,0.25)", borderRadius: 10, color: "rgba(255,255,255,0.45)", fontSize: 12, padding: "8px 16px", cursor: "pointer" }}
                onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.color = "rgba(255,255,255,0.45)"; }}
              >+ Nouvelle tâche</button>
            )}

            {doneTodos.length > 0 && (
              <div style={{ width: "100%", marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>✓ TERMINÉES :</span>
                {doneTodos.map(todo => (
                  <div key={todo.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "4px 8px" }}>
                    <input type="checkbox" checked={todo.done} onChange={() => handleToggleTodo(todo.id)} style={{ cursor: "pointer" }} />
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textDecoration: "line-through" }}>{todo.label}</span>
                    <button onClick={() => handleDeleteTodo(todo.id)} style={iconBtn("rgba(231,76,60,0.1)")}>🗑</button>
                  </div>
                ))}
                <button
                  onClick={() => setTodos(todos.filter(t => !t.done))}
                  style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 8, color: "rgba(231,76,60,0.7)", fontSize: 11, padding: "4px 10px", cursor: "pointer" }}
                >🗑 Vider</button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation suppression jour */}
      {deletingDay && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#1a1a2e", borderRadius: 16, padding: 28, border: "1px solid rgba(255,255,255,0.15)", textAlign: "center", maxWidth: 320 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Supprimer ce jour ?</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 20 }}>Tous les événements seront perdus.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => handleDeleteDay(deletingDay)} style={{ ...btnSave, background: "#E74C3C", padding: "8px 20px" }}>Supprimer</button>
              <button onClick={() => setDeletingDay(null)} style={{ ...btnCancel, padding: "8px 20px" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
