'use client'

import { useState, useEffect } from 'react'
import { X, Edit, Save, Heart, Tag, User, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Epiphany = Database['public']['Tables']['epiphanies']['Row']

interface EpiphanyModalProps {
  epiphany: Epiphany | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedEpiphany: Epiphany) => void
  onDelete: (id: string) => void
  isEditing: boolean
  onEditToggle: () => void
  user: any
}

export function EpiphanyModal({
  epiphany,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isEditing,
  onEditToggle,
  user
}: EpiphanyModalProps) {
  const [editForm, setEditForm] = useState<Partial<Epiphany>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (epiphany) {
      setEditForm({
        title: epiphany.title,
        content: epiphany.content,
        tags: epiphany.tags || []
      })
    }
  }, [epiphany])

  if (!isOpen || !epiphany) return null

  const handleSave = async () => {
    if (!editForm.title?.trim() || !editForm.content?.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('epiphanies')
        .update({
          title: editForm.title.trim(),
          content: editForm.content.trim(),
          tags: editForm.tags || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', epiphany.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating epiphany:', error)
        return
      }

      onUpdate(data)
      onEditToggle()
    } catch (error) {
      console.error('Error updating epiphany:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this epiphany?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('epiphanies')
        .delete()
        .eq('id', epiphany.id)

      if (error) {
        console.error('Error deleting epiphany:', error)
        return
      }

      onDelete(epiphany.id)
      onClose()
    } catch (error) {
      console.error('Error deleting epiphany:', error)
    }
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !editForm.tags?.includes(tag.trim())) {
      setEditForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-enlightenment-700">
            {isEditing ? 'Edit Epiphany' : epiphany.title}
          </h2>
          <div className="flex gap-2">
            {user && epiphany.author_id === user.id && (
              <>
                {!isEditing ? (
                  <button
                    onClick={onEditToggle}
                    className="p-2 text-enlightenment-600 hover:text-enlightenment-700 hover:bg-enlightenment-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Save"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Title</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="enlightenment-input"
                  placeholder="What did you discover?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Content</label>
                <textarea
                  value={editForm.content || ''}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="enlightenment-input min-h-[200px]"
                  placeholder="Share the details of your enlightenment..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editForm.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-enlightenment-100 text-enlightenment-700 px-3 py-1 rounded-full text-base flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-enlightenment-500 hover:text-enlightenment-700 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      addTag(target.value)
                      target.value = ''
                    }
                  }}
                  className="enlightenment-input"
                />
              </div>
            </div>
          ) : (
            // View Mode
            <>
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-enlightenment-100 flex items-center justify-center">
                  {epiphany.author_avatar ? (
                    <img
                      src={epiphany.author_avatar}
                      alt={epiphany.author_name || 'Author'}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-enlightenment-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{epiphany.author_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(epiphany.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {epiphany.content}
                </p>
              </div>

              {/* Tags */}
              {epiphany.tags && epiphany.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {epiphany.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-enlightenment-100 text-enlightenment-700 px-3 py-1 rounded-full text-base flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{epiphany.likes_count || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(epiphany.updated_at)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
