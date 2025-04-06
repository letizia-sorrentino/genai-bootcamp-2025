import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import FlashcardDeck from './components/FlashcardDeck'
import CategorySelector from './components/CategorySelector'
import LoadingScreen from './components/LoadingScreen'
import FavoritesView from './components/FavoritesView'
import NavBar from './components/NavBar'
import axios from 'axios'

function AppContent() {
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('colors')
  const navigate = useNavigate()
  
  // Function to generate flashcards
  const generateFlashcards = async () => {
    console.log('Starting flashcard generation for category:', selectedCategory);
    setLoading(true)
    try {
      console.log('Making request to:', 'http://localhost:3000/api/generate-flashcards');
      const response = await axios.post('http://localhost:3000/api/generate-flashcards', {
        category: selectedCategory
      })
      
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Flashcards array:', response.data.flashcards);
      
      if (!response.data.flashcards || !Array.isArray(response.data.flashcards)) {
        throw new Error('Invalid response format: flashcards array is missing or invalid');
      }
      
      // Log each flashcard's details
      response.data.flashcards.forEach((card, index) => {
        console.log(`Flashcard ${index + 1}:`, {
          word: card.word,
          translation: card.translation,
          imageUrl: card.imageUrl
        });
      });
      
      setFlashcards(response.data.flashcards)
      console.log('Flashcards state updated:', response.data.flashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert('Failed to generate flashcards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle navigation to home
  const handleNavigateHome = () => {
    setFlashcards([])
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="app-container">
      <main>
        <Routes>
          <Route path="/" element={
            loading ? (
              <LoadingScreen />
            ) : flashcards.length > 0 ? (
              <>
                {console.log('Rendering FlashcardDeck with:', { flashcards, category: selectedCategory })}
                <FlashcardDeck 
                  flashcards={flashcards} 
                  category={selectedCategory}
                />
              </>
            ) : (
              
              <div className="setup-container">
                <h1>Italian Flashcards</h1>
                <CategorySelector
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
            )
          } />
          <Route path="/favorites" element={<FavoritesView />} />
        </Routes>
      </main>
      <NavBar onHomeClick={handleNavigateHome} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
