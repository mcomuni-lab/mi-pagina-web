"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Trash2, X, AlertTriangle } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDelete = async () => {
    if (!userToDelete) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/users?id=${userToDelete.id}`, { method: "DELETE" })
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setUserToDelete(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
              <p className="text-muted-foreground mt-0.5">
                {loading ? "Cargando..." : `${users.length} usuario${users.length !== 1 ? "s" : ""} registrado${users.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card/50 border-border/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Correo</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        No hay usuarios registrados
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-4 text-muted-foreground text-sm font-mono">
                          #{user.id}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-sm font-semibold text-primary">
                                {user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{user.email}</td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setUserToDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setUserToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Eliminar usuario</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setUserToDelete(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="bg-background/50 rounded-xl p-4 mb-6 space-y-1">
                <p className="text-foreground font-medium">{userToDelete.name}</p>
                <p className="text-muted-foreground text-sm">{userToDelete.email}</p>
              </div>

              <p className="text-muted-foreground text-sm mb-6">
                Esta acción no se puede deshacer. El usuario será eliminado permanentemente de la base de datos.
              </p>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setUserToDelete(null)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Eliminando..." : "Sí, eliminar"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}