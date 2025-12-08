# Fintech API

## Run Guide

### Start Project
1. Start the database container:
   ```bash
   docker start fintech-db
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Run Tests
To run all tests sequentially (recommended):
```bash
npm test -- --runInBand
```

### Stop Project
1. Stop the development server:
   Press `Ctrl + C` in the terminal running `npm run dev`.
2. Stop the database container:
   ```bash
   docker stop fintech-db
   ```
