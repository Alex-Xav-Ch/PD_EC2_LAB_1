import { useEffect, useState } from 'react'
import './App.css'

interface Usuario {
  id: number
  nombre: string
  email: string
  activo: boolean
}

const API = '/api/usuarios'

function App() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error()
      setUsuarios(await res.json())
    } catch {
      setError('No se pudo cargar la lista de usuarios')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  function openForm(usuario?: Usuario) {
    setEditingId(usuario?.id ?? null)
    setNombre(usuario?.nombre ?? '')
    setEmail(usuario?.email ?? '')
    setFormOpen(true)
    setError('')
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(editingId ? `${API}/${editingId}` : API, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email }),
    })
    if (!res.ok) {
      setError('No se pudo guardar el usuario')
      return
    }
    closeForm()
    load()
  }

  async function remove(usuario: Usuario) {
    if (!confirm(`¿Eliminar a ${usuario.nombre}?`)) return
    const res = await fetch(`${API}/${usuario.id}`, { method: 'DELETE' })
    if (!res.ok) {
      setError('No se pudo eliminar el usuario')
      return
    }
    load()
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Usuarios</h1>
        <button type="button" onClick={() => openForm()}>
          Agregar
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      {formOpen && (
        <form className="form" onSubmit={save}>
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">{editingId ? 'Actualizar' : 'Guardar'}</button>
          <button type="button" className="secondary" onClick={closeForm}>
            Cancelar
          </button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td className="actions">
                <button type="button" onClick={() => openForm(u)}>
                  Editar
                </button>
                <button type="button" className="danger" onClick={() => remove(u)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan={4}>Sin registros</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  )
}

export default App
