import { useState } from 'react'
import './App.css'
import FlashcardDeck from './components/FlashcardDeck'
import ModelSelector from './components/ModelSelector'
import LoadingScreen from './components/LoadingScreen'
import axios from 'axios'

function App() {
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('greetings')
  
  // Function to generate flashcards
  const generateFlashcards = async () => {
    console.log('Generating flashcards for category:', selectedCategory);
    setLoading(true)
    try {
      console.log('Making request to:', 'http://localhost:3000/api/generate-flashcards');
      const response = await axios.post('http://localhost:3000/api/generate-flashcards', {
        category: selectedCategory
      })
      
      console.log('Response from server:', response.data);
      console.log('Flashcards data:', response.data.flashcards);
      
      // Log each flashcard's image URL
      response.data.flashcards.forEach((card, index) => {
        console.log(`Flashcard ${index + 1} image URL:`, card.imageUrl);
      });
      
      setFlashcards(response.data.flashcards)
    } catch (error) {
      console.error('Error generating flashcards:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert('Failed to generate flashcards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Function to go back to home
  const goBackToHome = () => {
    setFlashcards([])
  }
  
  return (
    <div className="app-container">
      {flashcards.length > 0 && (
        <button 
          className="back-button"
          onClick={goBackToHome}
        >
          ← Back to Home
        </button>
      )}
      <header>
        <h1>Italian Flashcards</h1>
      </header>
      
      <main>
        {loading ? (
          <LoadingScreen />
        ) : flashcards.length > 0 ? (
          <FlashcardDeck flashcards={flashcards} />
        ) : (
          <div className="setup-container">
            <ModelSelector 
              selectedModel={selectedCategory} 
              onModelChange={setSelectedCategory} 
            />
            <button 
              className="generate-button"
              onClick={generateFlashcards}
              disabled={loading}
            >
              Generate Flashcards
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
