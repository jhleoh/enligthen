'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { Lightbulb, Plus, Heart, User, Calendar, Tag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type Epiphany = Database['public']['Tables']['epiphanies']['Row']

export default function Dashboard() {
  const [epiphanies, setEpiphanies] = useState<Epiphany[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  })

  useEffect(() => {
    fetchEpiphanies()
  }, [])

  const fetchEpiphanies = async () => {
    try {
      const { data, error } = await supabase
        .from('epiphanies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEpiphanies(data || [])
    } catch (error) {
      console.error('Error fetching epiphanies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) return

    try {
      const { error } = await supabase
        .from('epiphanies')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          author_id: 'anonymous', // In a real app, this would be the authenticated user's ID
          author_name: 'Anonymous', // In a real app, this would be the authenticated user's name
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          likes_count: 0
        })

      if (error) throw error

      // Reset form and refresh data
      setFormData({ title: '', content: '', tags: '' })
      setShowForm(false)
      fetchEpiphanies()
    } catch (error) {
      console.error('Error creating epiphany:', error)
    }
  }

  const handleLike = async (epiphanyId: string) => {
    try {
      // In a real app, you'd check if the user already liked this
      const { error } = await supabase
        .from('epiphanies')
        .update({ likes_count: (epiphanies.find(e => e.id === epiphanyId)?.likes_count || 0) + 1 })
        .eq('id', epiphanyId)

      if (error) throw error
      fetchEpiphanies()
    } catch (error) {
      console.error('Error liking epiphany:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-enlightenment-500 mx-auto"></div>
          <p className="mt-4 text-enlightenment-600 text-lg">Loading enlightenments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Lightbulb className="h-12 w-12 text-enlightenment-500 mr-3 animate-glow" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-enlightenment-600 to-primary-600 bg-clip-text text-transparent">
              Enlighten
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your moments of enlightenment and epiphany with the world. 
            Every insight has the power to inspire others.
          </p>
        </div>
      </div>

      {/* Add New Epiphany Button */}
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="enlightenment-button inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Share Your Epiphany
        </button>
      </div>

      {/* New Epiphany Form */}
      {showForm && (
        <div className="max-w-2xl mx-auto mb-12 animate-slide-up">
          <div className="enlightenment-card p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Share Your Enlightenment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="enlightenment-input"
                  placeholder="What did you discover?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Epiphany *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="enlightenment-input min-h-[120px] resize-none"
                  placeholder="Share the insight that changed your perspective..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="enlightenment-input"
                  placeholder="wisdom, life, philosophy, science (comma separated)"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="enlightenment-button flex-1"
                >
                  Share Enlightenment
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Epiphanies Grid */}
      <div className="max-w-6xl mx-auto">
        {epiphanies.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No epiphanies yet</h3>
            <p className="text-gray-400">Be the first to share your enlightenment!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {epiphanies.map((epiphany) => (
              <div key={epiphany.id} className="enlightenment-card p-6 animate-fade-in">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 leading-tight">
                    {epiphany.title}
                  </h3>
                  <button
                    onClick={() => handleLike(epiphany.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">{epiphany.likes_count}</span>
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {epiphany.content}
                </p>
                
                {epiphany.tags && epiphany.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {epiphany.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-enlightenment-100 text-enlightenment-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{epiphany.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(epiphany.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
