'use client';

import { useState } from 'react';

export default function Home() {
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [levelInput, setLevelInput] = useState('');
  const [levelMessage, setLevelMessage] = useState('');

  // Handle add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert comma-separated string into an array and remove extra spaces.
    const category: string[] = categoryInput
      .split(',')
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0);

    console.log('category', category);
    console.log(JSON.stringify({ category }));

    if (category.length === 0) {
      setCategoryInput('Please enter at least one category.');
      return;
    }

    // Send request to add category
    try {
      const res: Response = await fetch('/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });

      // const data = await res.json();
      if (res.ok) {
        setCategoryMessage('category saved successfully!');
        setCategoryInput('');
      } else {
        setCategoryMessage('Failed to add category, please try again.');
      }
    } catch (error: unknown) {
      console.error('Error adding category:', error);
      setCategoryMessage('Failed to add category, please try again.');
    }
  };

  // Handle add level
  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert comma-separated string into an array and remove extra spaces.
    const level: string[] = levelInput
      .split(',')
      .map((lel) => lel.trim())
      .filter((lel) => lel.length > 0);

    if (level.length === 0) {
      setLevelMessage('Please enter at least one level.');
      return;
    }

    // Send request to add level
    try {
      const res = await fetch('/api/level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level }),
      });

      // const data = await res.json();
      if (res.ok) {
        setLevelMessage('level saved successfully!');
        setLevelInput('');
      } else {
        setLevelMessage('Failed to add level, please try again.');
      }
    } catch (error: unknown) {
      console.error('Error adding level:', error);
      setLevelMessage('Failed to add level, please try again.');
    }
  };

  return (
    <div>
      <div style={{ padding: '2rem' }}>
        <h1>Add category</h1>
        <form onSubmit={handleAddCategory}>
          <input
            type="text"
            placeholder="Enter category separated by commas"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            style={{ padding: '0.5rem', width: '300px', marginRight: '0.5rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem' }}>
            Save
          </button>
        </form>
        {categoryMessage && <p className="text-blue-400">{categoryMessage}</p>}
      </div>

      <div style={{ padding: '2rem' }}>
        <h1>Add level</h1>
        <form onSubmit={handleAddLevel}>
          <input
            type="text"
            placeholder="Enter level separated by commas"
            value={levelInput}
            onChange={(e) => setLevelInput(e.target.value)}
            style={{ padding: '0.5rem', width: '300px', marginRight: '0.5rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem' }}>
            Save
          </button>
        </form>
        {levelMessage && <p className="text-blue-400">{levelMessage}</p>}
      </div>
    </div>
  );
}
