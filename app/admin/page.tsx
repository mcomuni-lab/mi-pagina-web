"use client"

import { useState, useRef, useEffect, type ElementType } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Upload, Plus, Search, MoreVertical, Edit, Trash2, Eye, Check,
  X, Clock, Users, FileText, LayoutGrid, Settings, Bell,
  Image as ImageIcon, FolderOpen, Mail, Calendar, DollarSign,
  TrendingUp, Package, CheckCircle2, AlertCircle, Loader2
} from "lucide-react"
import { templates, categories } from "@/lib/templates"

interface ClientRequest {
  id: string
  clientName: string
  clientEmail: string
  templateName: string
  templateId: string
  status: "pending" | "in-progress" | "completed" | "rejected"
  submittedAt: string
  configuration: {
    colors: Record<string, string>
    content: Record<string, string>
    typography: Record<string, string>
  }
}

const mockRequests: ClientRequest[] = [
  {
    id: "req-001",
    clientName: "John Smith",
    clientEmail: "john@company.com",
    templateName: "Gym Pro",
    templateId: "gym-fitness",
    status: "pending",
    submittedAt: "2024-01-15T10:30:00Z",
    configuration: {
      colors: { primary: "#8B5CF6", background: "#0A0A0A" },
      content: { businessName: "FitLife Gym", tagline: "Transform Your Body" },
      typography: { fontFamily: "Inter", fontSize: "16px" }
    }
  },
  {
    id: "req-002",
    clientName: "Maria Garcia",
    clientEmail: "maria@restaurant.com",
    templateName: "Restaurant Elite",
    templateId: "restaurant-elite",
    status: "in-progress",
    submittedAt: "2024-01-14T15:45:00Z",
    configuration: {
      colors: { primary: "#EF4444", background: "#0F0F0F" },
      content: { businessName: "La Casa Bella", tagline: "Fine Italian Dining" },
      typography: { fontFamily: "Playfair Display", fontSize: "18px" }
    }
  },
  {
    id: "req-003",
    clientName: "Tech Solutions Inc",
    clientEmail: "info@techsolutions.com",
    templateName: "Tech Starter",
    templateId: "tech-startup",
    status: "completed",
    submittedAt: "2024-01-10T09:00:00Z",
    configuration: {
      colors: { primary: "#3B82F6", background: "#0A0A0A" },
      content: { businessName: "InnovateTech", tagline: "Future of Technology" },
      typography: { fontFamily: "Space Grotesk", fontSize: "16px" }
    }
  }
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("templates")
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: "", category: "", description: "", price: "", previewUrl: ""
  })

  useEffect(() => {
    cargarPlantillas()
  }, [])

  const cargarPlantillas = async () => {
    try {
      const res = await fetch("/api/plantillas")
      const data = await res.json()
      setTemplatesDB(data)
    } catch (error) {
      console.error(error)
    }
  }

  const [zipFile, setZipFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const [templatesDB, setTemplatesDB] = useState<any[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [previewImage, setPreviewImage] = useState<File | null>(null)
  const [editPreviewImage, setEditPreviewImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stats = [
    { label: "Total Templates", value: templatesDB.length.toString(), icon: Package, change: "+2 this week" },
    { label: "Active Users", value: "1,247", icon: Users, change: "+12% this month" },
    { label: "Pending Requests", value: mockRequests.filter(r => r.status === "pending").length.toString(), icon: Clock, change: "3 new today" },
    { label: "Revenue", value: "$12,450", icon: DollarSign, change: "+8% this month" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "in-progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected": return "bg-red-500/20 text-red-400 border-red-500/30"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const handleZipSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".zip")) {
      setZipFile(file)
      setUploadStatus("idle")
      setUploadMessage("")
    }
  }

  const handleUploadTemplate = async () => {
    if (
  !newTemplate.name ||
  !newTemplate.category ||
  !newTemplate.price ||
  !zipFile ||
  !previewImage
) {
  setUploadStatus("error");
  setUploadMessage("Completa todos los campos, selecciona un ZIP y una imagen preview.");
  return;
}

    setUploading(true)
    setUploadStatus("idle")

    try {
      const formData = new FormData()
      formData.append("name", newTemplate.name)
      formData.append("category", newTemplate.category)
      formData.append("description", newTemplate.description)
      formData.append("price", newTemplate.price)
      formData.append("file", zipFile)

      if (previewImage) {
        formData.append("image", previewImage)
      }

      const res = await fetch("/api/admin/upload-template", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al subir")

      setUploadStatus("success")
      setUploadMessage(`¡Plantilla "${newTemplate.name}" publicada correctamente!`)
      setTimeout(() => {
        setShowUploadModal(false)
        setNewTemplate({ name: "", category: "", description: "", price: "", previewUrl: "" })
        setZipFile(null)
        setPreviewImage(null)
        setUploadStatus("idle")
        setUploadMessage("")
        cargarPlantillas()
      }, 2000)
    } catch (err: any) {
      setUploadStatus("error")
      setUploadMessage(err.message || "Error inesperado")
    } finally {
      setUploading(false)
    }
  }

  const abrirEditar = (template: any) => {
    setEditingTemplate(template)
    setEditPreviewImage(null)
    setShowEditModal(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground mt-1">Manage templates, requests, and users</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground">3</span>
              </Button>
              <Button onClick={() => setShowUploadModal(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Upload Template
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                        <p className="text-xs text-primary mt-1">{stat.change}</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/50 border border-border/50 p-1">
              <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LayoutGrid className="h-4 w-4 mr-2" />Templates
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />Requests
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4 mr-2" />Users
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FolderOpen className="h-4 w-4 mr-2" />Categories
              </TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search templates..." className="pl-10 bg-card/50 border-border/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px] bg-card/50 border-border/50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templatesDB
                  .filter((t) =>
                    t.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((template, index) => (
                    <motion.div key={template.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                      <Card className="bg-card/50 border-border/50 overflow-hidden group">
                        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                          {template.image_url ? (
                            <img
                              src={template.image_url}
                              alt={template.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="sm" variant="secondary"><Eye className="h-4 w-4 mr-1" />Preview</Button>
                            <Button size="sm" variant="secondary"><Edit className="h-4 w-4 mr-1" />Edit</Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {template.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {template.category}
                              </p>
                            </div>

                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/30"
                            >
                              ${template.price}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <TrendingUp className="h-4 w-4" />
                              <span>0 downloads</span>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => abrirEditar(template)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={async () => {
                                    if (confirm(`¿Seguro que quieres eliminar "${template.name}"?`)) {
                                      const res = await fetch(`/api/plantillas/${template.id}`, {
                                        method: "DELETE",
                                      });
                                      if (res.ok) {
                                        cargarPlantillas();
                                      } else {
                                        alert("Error al eliminar");
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <div className="space-y-4">
                {mockRequests.map((request, index) => (
                  <motion.div key={request.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-foreground">{request.clientName}</h3>
                                <Badge className={getStatusColor(request.status)}>{request.status.replace("-", " ")}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">Template: <span className="text-foreground">{request.templateName}</span></p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{request.clientEmail}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(request.submittedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}><Eye className="h-4 w-4 mr-1" />View Config</Button>
                            {request.status === "pending" && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-1" />Accept</Button>
                                <Button size="sm" variant="destructive"><X className="h-4 w-4 mr-1" />Reject</Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Ve a <span className="text-primary font-medium">Usuarios</span> en el menú lateral para gestionar usuarios.
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              {(() => {
                                const CategoryIcon = category.icon as ElementType

                                return (
                                  <CategoryIcon className="h-5 w-5 text-primary" />
                                )
                              })()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">{templates.filter(t => t.category === category.name).length} templates</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Upload Template Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !uploading && setShowUploadModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Subir Nueva Plantilla</h2>
                <Button variant="ghost" size="icon" onClick={() => !uploading && setShowUploadModal(false)}><X className="h-5 w-5" /></Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Nombre de la plantilla *</label>
                  <Input placeholder="ej. Gym Pro" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} className="bg-background/50 border-border/50" disabled={uploading} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Categoría *</label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })} disabled={uploading}>
                    <SelectTrigger className="bg-background/50 border-border/50"><SelectValue placeholder="Selecciona categoría" /></SelectTrigger>
                    <SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Descripción</label>
                  <Textarea placeholder="Describe tu plantilla..." value={newTemplate.description} onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })} className="bg-background/50 border-border/50 min-h-[80px]" disabled={uploading} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Precio (USD) *</label>
                  <Input type="number" placeholder="49" value={newTemplate.price} onChange={(e) => setNewTemplate({ ...newTemplate, price: e.target.value })} className="bg-background/50 border-border/50" disabled={uploading} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Imagen de Preview
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPreviewImage(e.target.files[0])
                      }
                    }}
                    className="bg-background/50 border-border/50"
                    disabled={uploading}
                  />
                  {previewImage && (
                    <p className="text-xs text-primary mt-1">{previewImage.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Archivo ZIP de la plantilla *</label>
                  <input ref={fileInputRef} type="file" accept=".zip" onChange={handleZipSelect} className="hidden" />
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${zipFile ? "border-primary/70 bg-primary/5" : "border-border/50 hover:border-primary/50"}`}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    {zipFile ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-foreground font-medium">{zipFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p className="text-xs text-primary mt-1">Clic para cambiar</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Clic para seleccionar archivo ZIP</p>
                        <p className="text-xs text-muted-foreground mt-1">Solo archivos .zip</p>
                      </>
                    )}
                  </div>
                </div>

                {uploadStatus !== "idle" && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${uploadStatus === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {uploadStatus === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    {uploadMessage}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => !uploading && setShowUploadModal(false)} disabled={uploading}>Cancelar</Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleUploadTemplate} disabled={uploading}>
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Subiendo...</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" />Publicar Plantilla</>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Configuration Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRequest(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Client Configuration</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedRequest(null)}><X className="h-5 w-5" /></Button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Client Info</h3>
                  <div className="bg-background/50 rounded-xl p-4 space-y-2">
                    <p className="text-foreground"><span className="text-muted-foreground">Name:</span> {selectedRequest.clientName}</p>
                    <p className="text-foreground"><span className="text-muted-foreground">Email:</span> {selectedRequest.clientEmail}</p>
                    <p className="text-foreground"><span className="text-muted-foreground">Template:</span> {selectedRequest.templateName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedRequest(null)}>Close</Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90"><Settings className="h-4 w-4 mr-2" />Start Development</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Template Modal */}
      <AnimatePresence>
        {showEditModal && editingTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Editar plantilla</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)}><X className="h-5 w-5" /></Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Nombre de la plantilla *</label>
                  <Input
                    placeholder="ej. Gym Pro"
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        name: e.target.value
                      })
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Categoría *</label>
                  <Select
                    value={editingTemplate.category || ""}
                    onValueChange={(value) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        category: value
                      })
                    }
                  >
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Descripción</label>
                  <Textarea
                    placeholder="Describe tu plantilla..."
                    value={editingTemplate.description || ""}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        description: e.target.value
                      })
                    }
                    className="bg-background/50 border-border/50 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Precio (USD) *</label>
                  <Input
                    type="number"
                    placeholder="49"
                    value={editingTemplate.price}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        price: e.target.value
                      })
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Imagen de Preview
                  </label>
                  {editingTemplate.image_url && !editPreviewImage && (
                    <img
                      src={editingTemplate.image_url}
                      alt={editingTemplate.name}
                      className="w-full h-32 object-cover rounded-lg mb-2 border border-border/50"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditPreviewImage(e.target.files[0])
                      }
                    }}
                    className="bg-background/50 border-border/50"
                  />
                  {editPreviewImage && (
                    <p className="text-xs text-primary mt-1">{editPreviewImage.name}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </Button>

                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={async () => {
                      const formData = new FormData()

                      formData.append("name", editingTemplate.name)
                      formData.append("category", editingTemplate.category)
                      formData.append("description", editingTemplate.description)
                      formData.append("price", editingTemplate.price)

                      if (editPreviewImage) {
                        formData.append("image", editPreviewImage)
                      }

                      const res = await fetch(`/api/plantillas/${editingTemplate.id}`, {
                        method: "PUT",
                        body: formData,
                      })

                      if (res.ok) {
                        setShowEditModal(false)
                        setEditPreviewImage(null)
                        cargarPlantillas()
                      } else {
                        alert("Error al actualizar")
                      }
                    }}
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}