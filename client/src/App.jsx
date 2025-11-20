import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/projects";

function App() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Planned",
    dueDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      setLoading(true);
      setError("");

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request failed");

      setForm({ title: "", description: "", status: "Planned", dueDate: "" });
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      setError("Could not save project.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setForm({
      title: project.title,
      description: project.description || "",
      status: project.status || "Planned",
      dueDate: project.dueDate ? project.dueDate.substring(0, 10) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError("Could not delete project.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", description: "", status: "Planned", dueDate: "" });
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>College Project Manager</h1>
        <p>Track your project ideas, progress, and deadlines in one place.</p>
      </header>

      <main className="content-grid">
        <section className="card form-card">
          <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-group">
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. College Website in MERN"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Short summary of the project"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {editingId ? "Save Changes" : "Add Project"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card list-card">
          <div className="list-header">
            <h2>Your Projects</h2>
            <button className="ghost-btn" onClick={fetchProjects} disabled={loading}>
              Refresh
            </button>
          </div>
          {loading && <p className="muted">Loading...</p>}
          {!loading && projects.length === 0 && (
            <p className="muted">No projects yet. Add your first one above!</p>
          )}
          <div className="project-list">
            {projects.map((project) => (
              <article key={project._id} className="project-item">
                <div className="project-main">
                  <h3>{project.title}</h3>
                  {project.description && <p>{project.description}</p>}
                  <div className="tags-row">
                    <span className={`status-badge status-${project.status.replace(" ", "-")}`}>
                      {project.status}
                    </span>
                    {project.dueDate && (
                      <span className="due-date">
                        Due {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="project-actions">
                  <button onClick={() => handleEdit(project)}>Edit</button>
                  <button
                    className="danger-btn"
                    onClick={() => handleDelete(project._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <span>MERN Stack Demo  Perfect to showcase in your college project</span>
      </footer>
    </div>
  );
}

export default App;
