# Frontend Tests

This directory contains test files for the frontend application.

## Structure

- `html/`: Contains HTML test files that can be opened in a browser
- `ts/`: Contains TypeScript test files that are imported by the HTML test files

## Running Tests

To run these tests:

1. Start the development server:
   ```
   cd frontend
   npm run dev
   ```

2. Open any of the HTML test files in your browser:
   - Navigate to `http://localhost:5173/tests/html/test-api.html`
   - Navigate to `http://localhost:5173/tests/html/test-direct-fetch.html`
   - etc.

3. Check the browser console for test results

## Adding New Tests

To add a new test:

1. Create a new TypeScript test file in the `ts/` directory
2. Create a corresponding HTML file in the `html/` directory that imports the TypeScript file
3. Run the test as described above 