Extract ALL Italian vocabulary from the following text. For each word:
1. Identify the word
2. Determine its part of speech
3. Provide its English translation

Important rules:
- Extract EVERY word from the lyrics, including articles, prepositions, and conjunctions
- Each word should have a unique ID starting from 1
- For compound words or phrases, include them as separate entries
- For words with multiple meanings, include the most relevant translation for the context
- For verbs, include the infinitive form in the translation
- For nouns, include the singular form
- For adjectives, include the masculine singular form

Return the results in a structured format matching this example:
{
    "words": [
        {
            "id": 1,
            "italian": "ciao",
            "english": "hello",
            "parts": {"type": "greeting"}
        },
        {
            "id": 2,
            "italian": "il",
            "english": "the",
            "parts": {"type": "article"}
        }
    ]
}

Text:
{text} 