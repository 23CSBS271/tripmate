import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Calendar, ArrowRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function PublishedStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedStories();
  }, []);

  const fetchPublishedStories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stories/published`);

      if (!response.ok) throw new Error('Failed to fetch published stories');

      const data = await response.json();
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching published stories:', error);
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

  const getContentPreview = (story) => {
    if (story.excerpt) return story.excerpt;
    return story.content.length > 200 ? story.content.substring(0, 200) + '...' : story.content;
  };

  if (loading) {
    return (
      <div className="min-h-screen page-background flex items-center justify-center">
        <div className="text-blue-600">Loading stories...</div>
      </div>
    );
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

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Travel Stories</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Adventures, experiences, and tales from around the world
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-600">Check back soon for travel stories and adventures</p>
          </div>
        ) : (
          <div className="space-y-12">
            {stories.map((story) => (
              <article
                key={story._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {story.coverImage && (
                  <Link to={`/story/${story._id}`}>
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="w-full h-72 object-cover hover:opacity-90 transition"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </Link>
                )}
                <div className="p-8">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    <time>{formatDate(story.createdAt)}</time>
                  </div>

                  <Link
                    to={`/story/${story._id}`}
                    className="group"
                  >
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition">
                      {story.title}
                    </h2>
                  </Link>

                  <p className="text-lg text-gray-700 leading-relaxed mb-6 font-serif">
                    {getContentPreview(story)}
                  </p>

                  <Link
                    to={`/story/${story._id}`}
                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition"
                  >
                    Read full story
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
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
