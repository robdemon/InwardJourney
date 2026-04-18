import { useRef, useState } from 'react';

export default function UploadZone({ onFile, status }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file) onFile(file);
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
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <div className="emoji">🧠</div>
      <div className="label" style={{ fontSize: 15, color: 'var(--text)' }}>
        {status?.message || 'Drop your Muse Mind Monitor CSV here, or click to browse'}
      </div>
      <div className="hint">Accepts .csv exports • All processing happens in your browser</div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
