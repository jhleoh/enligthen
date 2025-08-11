'use client'

import { useState, useEffect } from 'react'
import { Heart, Tag, Plus, Edit, Trash2, Check, X, LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { UserProfile } from '@/components/user-profile'
import { EpiphanyModal } from '@/components/epiphany-modal'

type Epiphany = Database['public']['Tables']['epiphanies']['Row']

export default function Home() {
  const { user, signInWithGoogle, signOut } = useAuth()
  const [epiphanies, setEpiphanies] = useState<Epiphany[]>([])
  const [loading, setLoading] = useState(true)
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalEpiphany, setModalEpiphany] = useState<Epiphany | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalEditing, setIsModalEditing] = useState(false)

  useEffect(() => {
    fetchEpiphanies()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserLikes()
    } else {
      setUserLikes(new Set())
    }
  }, [user])

  const fetchUserLikes = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('likes')
        .select('epiphany_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching user likes:', error)
        return
      }

      const likedEpiphanyIds = new Set(data?.map(like => like.epiphany_id) || [])
      setUserLikes(likedEpiphanyIds)
    } catch (error) {
      console.error('Error fetching user likes:', error)
    }
  }

  const fetchEpiphanies = async () => {
    try {
      const supabase = createClient()
      
      // First, get all epiphanies
      const { data: epiphaniesData, error: epiphaniesError } = await supabase
        .from('epiphanies')
        .select('*')
        .order('created_at', { ascending: false })

      if (epiphaniesError) {
        console.error('Error fetching epiphanies:', epiphaniesError)
        return
      }

      // Then, get the actual likes count for each epiphany
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('epiphany_id')

      if (likesError) {
        console.error('Error fetching likes:', likesError)
        return
      }

      // Calculate actual likes count for each epiphany
      const likesCountMap = new Map<string, number>()
      likesData?.forEach(like => {
        const currentCount = likesCountMap.get(like.epiphany_id) || 0
        likesCountMap.set(like.epiphany_id, currentCount + 1)
      })

      // Update epiphanies with accurate likes count
      const epiphaniesWithAccurateCounts = epiphaniesData?.map(epiphany => ({
        ...epiphany,
        likes_count: likesCountMap.get(epiphany.id) || 0
      })) || []

      setEpiphanies(epiphaniesWithAccurateCounts)
    } catch (error) {
      console.error('Error fetching epiphanies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('epiphanies')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          author_id: user.id,
          author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
          author_avatar: user.user_metadata?.avatar_url || null,
          tags: formData.tags,
          likes_count: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating epiphany:', error)
        return
      }

      setEpiphanies([data, ...epiphanies])
      setFormData({ title: '', content: '', tags: [] })
    } catch (error) {
      console.error('Error creating epiphany:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (epiphany: Epiphany) => {
    if (!user) return

    try {
      const supabase = createClient()
      
      // Check if user already liked this epiphany
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('*')
        .eq('epiphany_id', epiphany.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking like status:', checkError)
        return
      }

      const isLiked = !!existingLike

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('epiphany_id', epiphany.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error removing like:', error)
          return
        }

        // Update user likes state
        setUserLikes(prev => {
          const newSet = new Set(prev)
          newSet.delete(epiphany.id)
          return newSet
        })
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            epiphany_id: epiphany.id,
            user_id: user.id
          })

        if (error) {
          console.error('Error adding like:', error)
          return
        }

        // Update user likes state
        setUserLikes(prev => new Set([...Array.from(prev), epiphany.id]))
      }

      // Refresh epiphanies to get accurate counts
      await fetchEpiphanies()
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  const handleUpdate = (updatedEpiphany: Epiphany) => {
    setEpiphanies(epiphanies.map(e => 
      e.id === updatedEpiphany.id ? updatedEpiphany : e
    ))
  }

  const handleDelete = (id: string) => {
    setEpiphanies(epiphanies.filter(e => e.id !== id))
    // Remove from user likes if it was liked
    setUserLikes(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const openModal = (epiphany: Epiphany, editing: boolean = false) => {
    setModalEpiphany(epiphany)
    setIsModalEditing(editing)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalEpiphany(null)
    setIsModalEditing(false)
  }

  const toggleModalEdit = () => {
    setIsModalEditing(!isModalEditing)
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-enlightenment-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enlightenments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <UserProfile />
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-enlightenment-700 mb-4">
            Enlighten
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your moments of clarity, epiphanies, and breakthroughs. 
            Connect with others through shared wisdom and insights.
          </p>
        </div>

        {/* Auth Section */}
        <div className="flex justify-center items-center gap-4 mb-8">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.full_name || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-enlightenment-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-enlightenment-600" />
                  </div>
                )}
                <span className="text-gray-700 font-medium">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="enlightenment-button flex items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
          )}
        </div>

        {/* Add New Epiphany Form */}
        {user && (
          <div className="enlightenment-card p-8 mb-12">
            <h2 className="text-2xl font-semibold text-enlightenment-700 mb-6">
              Share Your Epiphany
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Title</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-4">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="enlightenment-input min-h-[120px]"
                  placeholder="Share the details of your enlightenment..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
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
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="enlightenment-button flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                {isSubmitting ? 'Sharing...' : 'Share Epiphany'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Epiphanies List */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-enlightenment-700 mb-8 text-center">
          Recent Epiphanies
        </h2>
        
        {epiphanies.length === 0 ? (
          <div className="text-center py-12 col-span-full">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No epiphanies yet</h3>
            <p className="text-gray-500">
              {user ? 'Be the first to share your enlightenment!' : 'Sign in to share your first epiphany!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {epiphanies.map((epiphany) => (
              <div 
                key={epiphany.id} 
                className="enlightenment-card p-8 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                onClick={() => openModal(epiphany, false)}
              >
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-2xl font-semibold text-enlightenment-700 line-clamp-2">
                    {epiphany.title}
                  </h3>
                  {user && epiphany.author_id === user.id && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal(epiphany, true)
                        }}
                        className="p-2 text-enlightenment-600 hover:text-enlightenment-700 hover:bg-enlightenment-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-8 leading-relaxed text-lg line-clamp-4">
                  {epiphany.content}
                </p>
                
                {epiphany.tags && epiphany.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
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
                )}
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{epiphany.author_name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{formatDate(epiphany.created_at)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(epiphany)
                      }}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        userLikes.has(epiphany.id)
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${userLikes.has(epiphany.id) ? 'fill-current' : ''}`} />
                      {epiphany.likes_count}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <EpiphanyModal
        epiphany={modalEpiphany}
        isOpen={isModalOpen}
        onClose={closeModal}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isEditing={isModalEditing}
        onEditToggle={toggleModalEdit}
        user={user}
      />
    </div>
  )
}
