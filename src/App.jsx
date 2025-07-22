import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [title, setTitle] = useState('My Painting');
  const [shapes, setShapes] = useState([]);
  const canvasRef = useRef(null);

  const shapeCounts = shapes.reduce(
    (acc, shape) => {
      acc[shape.type]++;
      return acc;
    },
    { circle: 0, square: 0, triangle: 0 }
  );


  const handleDrop = (e) => {
    e.preventDefault();
    const shapeType = e.dataTransfer.getData('shape');
    if (!shapeType) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newShape = {
      id: Date.now(),
      type: shapeType,
      x,
      y,
    };


    setShapes((prev) => [...prev, newShape]);
  };
  const handleDoubleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedShapes = shapes.filter((shape) => {
      const dist = Math.hypot(shape.x - x, shape.y - y);
      return dist > 30;
    });

    setShapes(updatedShapes);
  };

  const exportShapes = () => {
    const blob = new Blob([JSON.stringify(shapes, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');

    link.href = window.URL.createObjectURL(blob);
    link.download = `${title.trim() || 'painting'}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const importShapes = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (Array.isArray(imported)) {
        setShapes(imported);
      } else {
        alert('Invalid file format');
      }
    } catch (err) {
      alert('Failed to load shapes: ' + err.message);
    }
  };


  const drawShape = (ctx, shape) => {
    ctx.beginPath();
    ctx.fillStyle = '#333';

    const { x, y } = shape;
    const size = 40;

    if (shape.type === 'circle') {
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape.type === 'square') {
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    } else if (shape.type === 'triangle') {
      ctx.moveTo(x, y - 25);
      ctx.lineTo(x - 25, y + 20);
      ctx.lineTo(x + 25, y + 20);
      ctx.closePath();
      ctx.fill();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach((shape) => drawShape(ctx, shape));
  }, [shapes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '10px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{ padding: '8px', fontSize: '1rem', flexGrow: 1, marginRight: '10px' }}
        />
        <button onClick={exportShapes} style={{ padding: '8px 12px', marginRight: '10px' }}>Export</button>
        <input type="file" onChange={importShapes} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', background: '#ffffff' }}>
        {/* Canvas Area */}
        <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            style={{
              border: '2px solid #ccc',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              cursor: 'crosshair',
            }}
            onDoubleClick={handleDoubleClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          />
        </div>

        {/* Sidebar Tools */}
        <div style={{ width: '180px', padding: '20px', background: '#f0f0f0', borderLeft: '1px solid #ddd' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Tools</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            {/* Circle */}
            <div
              draggable
              onDragStart={(e) => e.dataTransfer.setData('shape', 'circle')}
              title="Drag circle"
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: '#6c757d',
                cursor: 'grab',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            ></div>

            {/* Square */}
            <div
              draggable
              onDragStart={(e) => e.dataTransfer.setData('shape', 'square')}
              title="Drag square"
              style={{
                width: 50,
                height: 50,
                backgroundColor: '#17a2b8',
                cursor: 'grab',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            ></div>

            {/* Triangle */}
            <div
              draggable
              onDragStart={(e) => e.dataTransfer.setData('shape', 'triangle')}
              title="Drag triangle"
              style={{
                width: 0,
                height: 0,
                borderLeft: '25px solid transparent',
                borderRight: '25px solid transparent',
                borderBottom: '50px solid #ffc107',
                cursor: 'grab',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px', background: '#f8f9fa', borderTop: '1px solid #ddd' }}>
        <strong>Shape Count:</strong>{' '}
        Circle: {shapeCounts.circle} | Square: {shapeCounts.square} | Triangle: {shapeCounts.triangle}
      </div>
    </div>
  );
}
