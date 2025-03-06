# Temperature Trend Prediction App ( School Project )

This app predicts future average temperatures using machine learning. This is a school project and

## Features

- Predicts temperatures for 2025 and 2050.
- Shows temperature trends with a chart.
- Runs in the browser.

## How to Use

1.  Open `index.html` in your browser.
2.  Pick a country.
3.  Click "Predict".

## Tech

- TensorFlow.js (machine learning)
- Chart.js (charts)
- JavaScript, HTML, CSS

## Data

The app uses `yearly-temperature-data.json`, which has been processed from `GlobalLandTemperaturesByCountry.csv`.

**Data Preparation (If you need to create a new data file):**

1.  **Install Node.js:** If you don't have it, install it from [nodejs.org](https://nodejs.org/).
2.  **Install csv-parser:** Open your terminal and run `npm install csv-parser`.
3.  **Run the data preparation script:** Execute `node data-prep.js` in your terminal. This will create a new `yearly-temperature-data.json` file.

**Note:** The provided `yearly-temperature-data.json` is ready to use, so you don't need to run the script unless you want to process a new dataset.

## Notes

- This is a school project från FEI - Företagsekonomiska Institutet YH-coures AI-engineering.
- **Data ends in 2013, predictions are estimates.**
