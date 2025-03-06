import fs from "fs";
import csv from "csv-parser";

const data = [];

//convert raw data and create JSON-file whit relevant data
fs.createReadStream("GlobalLandTemperaturesByCountry.csv")
  .pipe(csv())
  .on("data", (row) => {
    if (row.AverageTemperature && row.Country && row.dt) {
      data.push({
        country: row.Country,
        year: new Date(row.dt).getFullYear(),
        temperature: parseFloat(row.AverageTemperature),
      });
    }
  })
  .on("end", () => {
    //group temperature data by country and year to calculate yearly averages temperature
    const groupedData = {};
    data.forEach((item) => {
      if (!groupedData[item.country]) {
        groupedData[item.country] = {};
      }
      if (!groupedData[item.country][item.year]) {
        groupedData[item.country][item.year] = { sum: 0, count: 0 };
      }
      //sum temp and count readings for each country and year
      groupedData[item.country][item.year].sum += item.temperature;
      groupedData[item.country][item.year].count += 1;
    });

    //calculate the average temp for each country and year
    const countryYearlyAverages = {};
    for (const country in groupedData) {
      countryYearlyAverages[country] = [];
      for (const year in groupedData[country]) {
        const average =
          groupedData[country][year].sum /
          groupedData[country][year].count;
        countryYearlyAverages[country].push({
          year: parseInt(year),
          average: average,
        });
      }
      //sort yearly averages temp by year for data order
      countryYearlyAverages[country].sort((a, b) => a.year - b.year);
    }
    //creates JSON file in your directory with relevant data and structure 
    fs.writeFileSync(
      "yearly-temperature-data.json",
      JSON.stringify(countryYearlyAverages, null, 2)
    );
    console.log("Yearly averages generated and saved to yearly-temperature-data.json");
  });
