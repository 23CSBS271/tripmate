import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plane, Calendar, ArrowLeft, MapPin } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function PublicStory() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stories/public/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          navigate('/');
          return;
        }
        throw new Error('Failed to fetch story');
      }

      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Error fetching story:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-blue-600">Loading story...</div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <div className="min-h-screen page-background">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition">
              <Plane className="w-6 h-6" />
              <span className="font-semibold text-xl">TripMate</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all stories
        </Link>

        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {story.coverImage && (
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="p-8 md:p-12">
            <header className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time>{formatDate(story.createdAt)}</time>
                </div>
                {story.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{story.location}</span>
                  </div>
                )}
                {story.userId && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">By {story.userId.fullName}</span>
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                {story.title}
              </h1>
              {story.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed">{story.excerpt}</p>
              )}
            </header>

            <div className="prose prose-lg max-w-none mb-8">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                {story.content}
              </div>
            </div>

            {story.photos && story.photos.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Photo Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {story.photos.map((photo, index) => (
                    <figure key={index} className="space-y-2">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Read more stories
          </Link>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">
            Made with TripMate - Your Travel Planning Companion
          </p>
        </div>
      </footer>
    </div>
  );
}
