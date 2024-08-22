# Plot Drawing App

## Description

This app allows users to upload a CSV file and visualize the data as a line plot. Users can control the window of data points displayed and see aggregates for the displayed data.

## Features

- Upload CSV files for data visualization.
- Dynamic line plot rendering.
- Adjustable window size for data points.
- Real-time animation of data points.
- Display of aggregate statistics (min, max, average, variance).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Zaza-Managadze22/Interactive-Line-Plot.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Main branch is the default branch and contains the last stable release

## Usage

1. Start the app:
   ```bash
   npm run dev
   ```
2. Open localhost in your browser
3. Upload a CSV file containing exactly two columns that correspond to data series. Do not put column titles in your files.
4. Adjust the window size and start the animation. For large files and window sizes, allow a larger interval (T) parameter so the animation can take effect before processing the next window.
