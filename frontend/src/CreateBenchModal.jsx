// CreateBenchModal.jsx
import { useEffect, useState } from 'react';
import './CreateBenchModal.css';
import Ratings from './Ratings';

export default function CreateBenchModal({
  open,
  draft,
  setDraft,
  onClose,
  onSubmit,
}) {
  const [selectedFileNames, setSelectedFileNames] = useState([]);

  useEffect(() => {
    if (!open) {
      setSelectedFileNames([]);
    }
  }, [open]);

  if (!open) return null;

  const updateField = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(draft);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFileNames(files.map((file) => file.name));
  };

  return (
    <>
    <div style={{padding: '100px'}}/>
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

            <button type="submit">Add Bench</button>
            </form>
      </div>
    </div>
  </>
  );
}
