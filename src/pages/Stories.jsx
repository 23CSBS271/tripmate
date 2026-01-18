import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Eye, Globe, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, storyId: null, title: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stories/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stories');

      const data = await response.json();
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stories/${deleteModal.storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete story');

      setStories(stories.filter(story => story._id !== deleteModal.storyId));
      setDeleteModal({ show: false, storyId: null, title: '' });
    } catch (error) {
      console.error('Error deleting story:', error);
      setErrorMessage('Failed to delete story');
      setShowErrorModal(true);
    }
  };

  const handlePublish = async (storyId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update story status');

      setStories(stories.map(story =>
        story._id === storyId ? { ...story, status: newStatus } : story
      ));
      // Refresh stories to get updated data
      fetchStories();
    } catch (error) {
      console.error('Error updating story status:', error);
      setErrorMessage('Failed to update story status');
      setShowErrorModal(true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContentPreview = (story) => {
    if (story.excerpt) return story.excerpt;
    return story.content.length > 150 ? story.content.substring(0, 150) + '...' : story.content;
  };

  if (loading) {
    return (
      <div className="min-h-screen page-background flex items-center justify-center">
        <div className="text-blue-600">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Travel Stories</h1>
            <p className="text-gray-600">Share your adventures with the world</p>
          </div>
          <Link
            to="/stories/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Story
          </Link>
        </div>

        {stories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-600 mb-6">Start writing your first travel story</p>
            <Link
              to="/stories/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Your First Story
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {stories.map((story) => (
              <div
                key={story._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row">
                  {(story.coverImage || (story.photos && story.photos.length > 0)) && (
                    <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={story.coverImage || story.photos[0].url}
                        alt={story.coverImage ? story.title : (story.photos[0].caption || story.title)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900">{story.title}</h2>
                          {story.status === 'draft' ? (
                            <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                              <FileText className="w-4 h-4" />
                              Draft
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                              <Globe className="w-4 h-4" />
                              Published
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{formatDate(story.createdAt)}</p>
                        <p className="text-gray-700 leading-relaxed">{getContentPreview(story)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/stories/edit/${story._id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => handlePublish(story._id, story.status)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                          story.status === 'draft'
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {story.status === 'draft' ? (
                          <>
                            <Globe className="w-4 h-4" />
                            Publish
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            Unpublish
                          </>
                        )}
                      </button>

                      {story.status === 'published' && (
                        <Link
                          to={`/story/${story._id}`}
                          target="_blank"
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                          View Public
                        </Link>
                      )}

                      <button
                        onClick={() => setDeleteModal({ show: true, storyId: story._id, title: story.title })}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, storyId: null, title: '' })}
        onConfirm={handleDelete}
        title="Delete Story"
        message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
      />

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 rounded-full p-3 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setShowErrorModal(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
