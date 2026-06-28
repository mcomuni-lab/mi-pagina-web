"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Upload, Plus, Search, MoreVertical, Edit, Trash2, Eye, Check,
  X, Clock, Users, FileText, LayoutGrid, Settings, Bell,
  Image as ImageIcon, FolderOpen, Mail, Calendar, DollarSign,
  TrendingUp, Package
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

const mockUsers = [
  { id: "user-001", name: "John Smith", email: "john@company.com", plan: "Pro", templatesUsed: 3, joinedAt: "2024-01-05" },
  { id: "user-002", name: "Maria Garcia", email: "maria@restaurant.com", plan: "Basic", templatesUsed: 1, joinedAt: "2024-01-10" },
  { id: "user-003", name: "Alex Johnson", email: "alex@startup.io", plan: "Enterprise", templatesUsed: 8, joinedAt: "2023-12-15" },
  { id: "user-004", name: "Sarah Williams", email: "sarah@design.co", plan: "Pro", templatesUsed: 5, joinedAt: "2024-01-02" },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("templates")
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: "", category: "", description: "", price: "", previewImage: ""
  })

  const stats = [
    { label: "Total Templates", value: templates.length.toString(), icon: Package, change: "+2 this week" },
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

  const handleUploadTemplate = () => {
    console.log("Uploading template:", newTemplate)
    setShowUploadModal(false)
    setNewTemplate({ name: "", category: "", description: "", price: "", previewImage: "" })
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
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
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
                {templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map((template, index) => (
                  <motion.div key={template.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                    <Card className="bg-card/50 border-border/50 overflow-hidden group">
                      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="secondary"><Eye className="h-4 w-4 mr-1" />Preview</Button>
                          <Button size="sm" variant="secondary"><Edit className="h-4 w-4 mr-1" />Edit</Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">{template.category}</p>
                          </div>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">${template.price}</Badge>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            <span>{template.downloads} downloads</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Templates Used</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border/50 last:border-0">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">{user.name.split(" ").map(n => n[0]).join("")}</span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={
                              user.plan === "Enterprise" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                              user.plan === "Pro" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                              "bg-muted text-muted-foreground"
                            }>{user.plan}</Badge>
                          </td>
                          <td className="p-4 text-foreground">{user.templatesUsed}</td>
                          <td className="p-4 text-muted-foreground">{user.joinedAt}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                              <category.icon className="h-5 w-5 text-primary" />
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Upload New Template</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}><X className="h-5 w-5" /></Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Template Name</label>
                  <Input placeholder="e.g., Gym Pro" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} className="bg-background/50 border-border/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}>
                    <SelectTrigger className="bg-background/50 border-border/50"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                  <Textarea placeholder="Describe your template..." value={newTemplate.description} onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })} className="bg-background/50 border-border/50 min-h-[100px]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Price (USD)</label>
                  <Input type="number" placeholder="49" value={newTemplate.price} onChange={(e) => setNewTemplate({ ...newTemplate, price: e.target.value })} className="bg-background/50 border-border/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Preview Image</label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleUploadTemplate}><Upload className="h-4 w-4 mr-2" />Publish Template</Button>
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
    </div>
  )
}