// CreateBenchPopup.jsx
import { useEffect, useState } from 'react';
import './CreateBenchPopup.css';
import Ratings from './Ratings';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// props: open - boolean, draft - object {name, review, rating, lat, lng}, setDraft - function with useState, onClose - function with useState, onSubmit - function with useState)
export default function CreateBenchPopup({ 
  open,
  draft,
  setDraft,
  onClose,
  onSubmit,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]); // for storing the image file(s)
  const [selectedFileNames, setSelectedFileNames] = useState([]); // for displaying the file name(s) in the UI
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) { // reset file selection when popup is closed
      setSelectedFiles([]);
      setSelectedFileNames([]);
      setIsSubmitting(false);
    }
  }, [open]); 

  if (!open) return null;

  const updateField = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      try {
        const imageUrls = await Promise.all(
            selectedFiles.map(file => uploadToCloudinary(file))
        );
        
        await onSubmit({ ...draft, imageURL: imageUrls[0] || draft.imageURL });
      } finally {
        setIsSubmitting(false);
      }
  };
  const handleFileChange = (e) => {
      const files = Array.from(e.target.files || []);
      setSelectedFiles(files);
      setSelectedFileNames(files.map((file) => file.name));
  };

  return (
    <>
    <div style={{padding: '110px'}}/>
    <div className="modal-overlay" onClick={onClose}>
    
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <h2>Add a Bench</h2>
        
        <form onSubmit={handleSubmit} className="modal-form">
        
            <div>
                <label className="field-label">
                Name <span className="required">*</span>
                </label>
                <input
                type="text"
                placeholder="Cool Bench"
                value={draft.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                />
            </div>

            <div>
                <label className="field-label">
                Selected Location
                </label>
                <div className="selected-location-readout">
                  {draft.lat?.toFixed?.(6)}, {draft.lng?.toFixed?.(6)}
                </div>
            </div>

            <div className="review-block">
                <label className="field-label">
                Review <span className="required">*</span>
                </label>

                <div className="review-stars">
                    <Ratings
                      name="new-bench-rating"
                      value={draft.rating}
                      onChange={(rating) => updateField('rating', rating)}
                    />
                </div>

                <textarea
                placeholder="Food for thought... seating capacity, armrest, backrest, material, condition, shade level, noise level, scenic value, accessibility"
                value={draft.review}
                onChange={(e) => updateField('review', e.target.value)}
                rows={5}
                required
                />
            </div>

            <div className="upload-block">
                <label className="field-label">
                Attach Photo(s) <span className="optional">(optional)</span>
                </label>

                <div className="upload-dropzone">
                <p>
                    Choose a file or drag & drop it here
                    <br />
                    <span className="upload-subtext">
                    JPEG, PNG, and HEIC, up to 50MB
                    </span>
                </p>

                <label className="upload-button">
                    Browse Files
                    <input
                        className="upload-input"
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.heic"
                        onChange={handleFileChange}
                    />
                </label>

                {selectedFileNames.length > 0 && (
                  <div className="upload-file-list" aria-live="polite">
                    <div className="upload-file-status">
                      {selectedFileNames.length === 1
                        ? '1 file selected'
                        : `${selectedFileNames.length} files selected`}
                    </div>

                    {selectedFileNames.map((fileName) => (
                      <div className="upload-file-name" key={fileName}>
                        {fileName}
                      </div>
                    ))}
                  </div>
                )}
                </div>
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding Bench...' : 'Add Bench'}
            </button>
            </form>
      </div>
    </div>
  </>
  );
}
