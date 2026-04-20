import { useRef, useState } from 'react';

export default function UploadZone({ onFiles, status }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const list = Array.from(files || []);
    if (list.length) onFiles(list);
  };

  return (
    <div
      className={`uz${dragging ? ' drag' : ''}${status?.loaded ? ' loaded' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="emoji">🧠</div>
      <div className="label" style={{ fontSize: 15, color: 'var(--text)' }}>
        {status?.message || 'Drop one or more Muse Mind Monitor CSVs here, or click to browse'}
      </div>
      <div className="hint">Accepts .csv exports • Select multiple files to stitch them into a combined timeline</div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
