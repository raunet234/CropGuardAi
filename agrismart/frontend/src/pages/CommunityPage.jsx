import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getCommunityPosts, createPost, createReply, getReplies } from '../services/api'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function getInitials(name) {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name) {
  const colors = ['#2D6A2D', '#1a3d1a', '#4CAF50', '#8BC34A', '#689F38', '#33691E']
  let sum = 0
  for (const c of (name || '')) sum += c.charCodeAt(0)
  return colors[sum % colors.length]
}

export default function CommunityPage() {
  const { currentUser, userProfile } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [postContent, setPostContent] = useState('')
  const [postTags, setPostTags] = useState('')
  const [posting, setPosting] = useState(false)
  const [expandedPost, setExpandedPost] = useState(null)
  const [replies, setReplies] = useState({})
  const [replyInput, setReplyInput] = useState({})

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await getCommunityPosts()
      setPosts(res.data.posts || [])
    } catch { } finally {
      setLoading(false)
    }
  }

  async function handlePost() {
    if (!postContent.trim() || !currentUser) return
    setPosting(true)
    try {
      const tags = postTags.split(',').map(t => t.trim()).filter(Boolean)
      await createPost({
        userId: currentUser.uid,
        userName: userProfile?.fullName || currentUser.email,
        userRole: userProfile?.role || 'Farmer',
        content: postContent,
        tags,
      })
      setPostContent('')
      setPostTags('')
      await loadPosts()
    } catch { } finally {
      setPosting(false)
    }
  }

  async function loadReplies(postId) {
    if (expandedPost === postId) return setExpandedPost(null)
    setExpandedPost(postId)
    if (!replies[postId]) {
      try {
        const res = await getReplies(postId)
        setReplies(prev => ({ ...prev, [postId]: res.data.replies || [] }))
      } catch { }
    }
  }

  async function handleReply(postId) {
    const content = replyInput[postId]
    if (!content?.trim() || !currentUser) return
    try {
      await createReply({
        postId,
        userId: currentUser.uid,
        userName: userProfile?.fullName || currentUser.email,
        content,
      })
      setReplyInput(prev => ({ ...prev, [postId]: '' }))
      const res = await getReplies(postId)
      setReplies(prev => ({ ...prev, [postId]: res.data.replies || [] }))
    } catch { }
  }

  const initials = getInitials(userProfile?.fullName || currentUser?.email)

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👥 Community Forum</h1>
        <p className="text-gray-500 text-sm mt-1">Connect with fellow farmers, experts and agricultural advisors</p>
      </div>

      {/* Post Composer */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: getAvatarColor(userProfile?.fullName) }}>
            {initials}
          </div>
          <div className="flex-1">
            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Ask a question or share farming knowledge..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
            <div className="flex items-center gap-3 mt-2">
              <input
                value={postTags}
                onChange={e => setPostTags(e.target.value)}
                placeholder="Tags: rice, fertilizer, wheat..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                onClick={handlePost}
                disabled={!postContent.trim() || posting}
                className="px-5 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-gray-500">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: getAvatarColor(post.userName) }}>
                  {getInitials(post.userName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{post.userName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.userRole === 'Expert' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {post.userRole}
                    </span>
                    <span className="text-gray-400 text-xs ml-auto">{timeAgo(post.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">{post.content}</p>
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => loadReplies(post.id)}
                    className="text-green-600 text-xs font-semibold hover:underline"
                  >
                    💬 {post.replyCount || 0} {expandedPost === post.id ? 'Hide' : 'View'} Replies
                  </button>

                  {expandedPost === post.id && (
                    <div className="mt-3 pl-3 border-l-2 border-green-100">
                      {(replies[post.id] || []).map(reply => (
                        <div key={reply.id} className="flex gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: getAvatarColor(reply.userName) }}>
                            {getInitials(reply.userName)}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-700 text-xs">{reply.userName}</span>
                              <span className="text-gray-400 text-xs">{timeAgo(reply.createdAt)}</span>
                            </div>
                            <p className="text-gray-600 text-xs">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <input
                          value={replyInput[post.id] || ''}
                          onChange={e => setReplyInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Write a reply..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
                          onKeyDown={e => e.key === 'Enter' && handleReply(post.id)}
                        />
                        <button
                          onClick={() => handleReply(post.id)}
                          disabled={!replyInput[post.id]?.trim()}
                          className="px-3 py-2 bg-green-600 text-white rounded-xl text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
