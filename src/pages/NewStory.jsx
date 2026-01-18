import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Globe, ArrowLeft, Image, MapPin, Compass, FileText, Eye, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StoryPhotoManager from '../components/StoryPhotoManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function NewStory() {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState('');
  const [tripId, setTripId] = useState('');
  const [trips, setTrips] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch trips');

      const data = await response.json();
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const handleSave = async (status) => {
    if (!title.trim()) {
      setErrorMessage('Please enter a title');
      setShowErrorModal(true);
      return;
    }

    if (!content.trim()) {
      setErrorMessage('Please enter some content');
      setShowErrorModal(true);
      return;
    }

    setSaving(true);

    try {
      const storyData = {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        coverImage: coverImage.trim() || null,
        photos: photos,
        location: location.trim() || null,
        tripId: tripId || null,
        status
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storyData)
      });

      if (!response.ok) throw new Error('Failed to create story');

      navigate('/stories');
    } catch (error) {
      console.error('Error creating story:', error);
      setErrorMessage('It\'s not possible to create the story. Please try again.');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const suggestedCoverImages = [
    'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg',
    'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
    'https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg'
  ];

  if (showPreview) {
    return (
      <div className="min-h-screen page-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Editor
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Globe className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>

          <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
            {coverImage && (
              <img
                src={coverImage}
                alt={title}
                className="w-full h-64 object-cover rounded-lg mb-8"
              />
            )}
            <header className="mb-8 pb-8 border-b border-gray-200">
              {location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4" />
                  {location}
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                {title || 'Untitled Story'}
              </h1>
              {excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed">{excerpt}</p>
              )}
            </header>

            <div className="prose prose-lg max-w-none mb-8">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                {content || 'No content yet...'}
              </div>
            </div>

            {photos.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Photo Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {photos.map((photo, index) => (
                    <figure key={index} className="space-y-2">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <figcaption className="text-sm text-gray-600 italic text-center">
                          {photo.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <button
            onClick={() => navigate('/stories')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Stories
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Create New Story</h1>
              <p className="text-gray-600 mt-2">Share your travel experiences with the world</p>
            </div>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition"
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Publishing</h3>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Draft:</strong> Only you can see it. Perfect for work-in-progress stories.
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Published:</strong> Anyone can view it at <code className="bg-blue-100 px-1 rounded">/published</code> without logging in - like a public blog post!
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Amazing Adventure in..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Summary (Excerpt)
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief preview of your story that appears in the list..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">This appears as a preview on the published stories page</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Cover Image URL
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.pexels.com/photos/..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="file"
                  accept="image/*"
                  id="coverImageUpload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setCoverImage(event.target?.result || '');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('coverImageUpload')?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Upload
                </button>
              </div>
            </div>
            {coverImage && (
              <img
                src={coverImage}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg mt-3 mb-3"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                }}
              />
            )}
            <div className="flex gap-2">
              {suggestedCoverImages.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(url)}
                  className="flex-1 aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition"
                >
                  <img src={url} alt="Suggested cover" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Paris, France"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Link to Trip (Optional)
              </label>
              <select
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No trip</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.destination}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story here... Share your adventures, experiences, and memories from your travels. What did you see? What did you learn? Who did you meet?"
              rows={18}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-serif leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Additional Photos
            </label>
            <StoryPhotoManager photos={photos} onChange={setPhotos} />
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Globe className="w-5 h-5" />
              {saving ? 'Publishing...' : 'Publish to Public'}
            </button>

            <button
              onClick={() => navigate('/stories')}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-red-200 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Unable to Create Story
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {errorMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="flex-shrink-0 text-gray-600 hover:text-gray-900 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-red-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl border-t border-red-100">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
