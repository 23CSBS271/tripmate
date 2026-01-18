import { useState } from 'react';
import { Image, Plus, Trash2, ExternalLink, Upload, AlertCircle } from 'lucide-react';

export default function StoryPhotoManager({ photos, onChange }) {
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addPhoto = () => {
    if (!newPhotoUrl.trim()) {
      setErrorMessage('Please enter a photo URL or upload a photo');
      setShowErrorModal(true);
      return;
    }

    const newPhoto = {
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || ''
    };

    onChange([...photos, newPhoto]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size for GIF files
      if (file.type === 'image/gif' && file.size > 5 * 1024 * 1024) { // 5MB limit for GIFs
        setErrorMessage('Uploaded file size is large');
        setShowErrorModal(true);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPhotoUrl(event.target?.result || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const suggestedPhotos = [
    {
      url: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg',
      caption: 'Mountain Landscape'
    },
    {
      url: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg',
      caption: 'Beach Sunset'
    },
    {
      url: 'https://images.pexels.com/photos/2929906/pexels-photo-2929906.jpeg',
      caption: 'City Street'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="flex items-start gap-4 mb-4">
          <Image className="w-6 h-6 text-gray-400 mt-2" />
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo URL or Upload
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Paste photo URL here or click Upload..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="file"
                  accept="image/*"
                  id="photoUpload"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('photoUpload')?.click()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 flex-shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption (optional)
              </label>
              <input
                type="text"
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                placeholder="Describe this photo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={addPhoto}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Photo
            </button>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4 mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Add from Pexels:</p>
          <div className="grid grid-cols-3 gap-2">
            {suggestedPhotos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNewPhotoUrl(photo.url);
                  setNewPhotoCaption(photo.caption);
                }}
                className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition group"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </button>
            ))}
          </div>
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
          >
            Browse more on Pexels
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Added Photos ({photos.length})
          </p>
          {photos.map((photo, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-white"
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Story photo'}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200?text=Image+Error';
                }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {photo.caption || 'No caption'}
                </p>
                <p className="text-xs text-gray-500 break-all">{photo.url}</p>
              </div>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

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
