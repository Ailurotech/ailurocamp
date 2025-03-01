'use client';

import { useState } from 'react';

// A generalized handler for adding either categories or levels
const handleAdd = async (
  e: React.FormEvent,
  inputValue: string,
  setInputValue: React.Dispatch<React.SetStateAction<string>>,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  endpoint: string,
  fieldName: string
) => {
  e.preventDefault();

  // Convert comma-separated string into an array and remove extra spaces.
  const values: string[] = inputValue
    .split(',')
    .map((val) => val.trim())
    .filter((val) => val.length > 0);

  if (values.length === 0) {
    setMessage(`Please enter at least one ${fieldName}.`);
    return;
  }

  // Send request to add category/level
  try {
    const res: Response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [fieldName]: values }),
    });

    if (res.ok) {
      setMessage(`${fieldName} saved successfully!`);
      setInputValue('');
    } else {
      setMessage(`Failed to add ${fieldName}, please try again.`);
    }
  } catch {
    setMessage(`Failed to add ${fieldName}, please try again.`);
  }
};

export default function Home() {
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [levelInput, setLevelInput] = useState('');
  const [levelMessage, setLevelMessage] = useState('');

  return (
    <div>
      <div style={{ padding: '2rem' }}>
        <h1>Add category</h1>
        <form
          onSubmit={(e: React.FormEvent) =>
            handleAdd(
              e,
              categoryInput,
              setCategoryInput,
              setCategoryMessage,
              '/api/category',
              'category'
            )
          }
        >
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
        <form
          onSubmit={(e: React.FormEvent) =>
            handleAdd(
              e,
              levelInput,
              setLevelInput,
              setLevelMessage,
              '/api/level',
              'level'
            )
          }
        >
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
