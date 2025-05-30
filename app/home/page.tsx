'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Item = {
  slug: string;
};

const ModernUI = () => {
    const [input, setInput] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [generatedDescriptions, setGeneratedDescriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [timeElapsed, setTimeElapsed] = useState('');
    const [finalTime, setFinalTime] = useState('');

  const router = useRouter();

  const handleAdd = () => {
    if (input.trim() !== '') {
      setItems([...items, { slug: input }]);
      setInput('');
    }
  };

  const handleEdit = (index: number) => {
    const newSlug = prompt('Edit the item', items[index].slug);
    if (newSlug) {
      const updatedItems = [...items];
      updatedItems[index].slug = newSlug;
      setItems(updatedItems);
    }
  };

  const handleDelete = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && startTime !== null) {
      interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        const formatted =
          seconds < 60
            ? `${seconds}s`
            : seconds < 3600
            ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
            : `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;

        setTimeElapsed(formatted);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isLoading, startTime]);

  const handleGenerate = async () => {
    try {
      const slugs = items.map(item => item.slug);
      setIsLoading(true);
      setStartTime(Date.now());
      setTimeElapsed('0s');

      const response = await fetch('/api/mistral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs }),
      });

      const result = await response.json();
      console.log('result',result)
      if (response.ok) {
        setGeneratedDescriptions(result.results);
      } else {
        alert(result.error || 'Something went wrong');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      if (startTime !== null) {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        const formatted =
          seconds < 60
            ? `${seconds}s`
            : seconds < 3600
            ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
            : `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    
        setFinalTime(formatted);
      }
    }
    
  };

  const handlePreview = () => {
    localStorage.setItem('generatedDescriptions', JSON.stringify(generatedDescriptions));
    router.push('/preview');
  };
  console.log('finalTime',finalTime)
  return (
    <div className="modern-container">
      <h1 className="modern-title">Tour Description JSON Generator</h1>

      <div className="modern-input-group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter item slug"
          className="modern-input"
        />
        <button onClick={handleAdd} className="modern-button add">Add</button>
      </div>

      <div className="modern-items">
        {items.length > 0 ? (
          [...items].reverse().map((item, reverseIndex) => {
            const originalIndex = items.length - 1 - reverseIndex;
            return (
              <div key={reverseIndex} className="modern-item">
                <span className="modern-item-slug">{originalIndex + 1}. {item.slug}</span>

                <div>
                  <button onClick={() => handleEdit(originalIndex)} className="modern-button edit">Edit</button>
                  <button onClick={() => handleDelete(originalIndex)} className="modern-button delete">Delete</button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="modern-empty">No items added yet.</p>
        )}
      </div>

      <div className="modern-actions">
      <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`modern-button generate ${isLoading ? 'disabled' : ''}`}
        >
          {isLoading
    ? `Generating... (${timeElapsed})`
    : finalTime
    ? `Generate (Last: ${finalTime})`
    : `Generate (Last: ${finalTime})`}

        </button>
        {generatedDescriptions.length > 0 && (
          <button onClick={handlePreview} className="modern-button preview">Preview</button>
        )}
      </div>
    </div>
  );
};

export default ModernUI;
