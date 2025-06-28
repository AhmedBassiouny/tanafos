import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Fetch from our backend
    fetch('http://localhost:3001/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Error:', err))
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tanafos</h1>
      <p>Message from backend: {message || 'Loading...'}</p>
    </div>
  )
}

export default App