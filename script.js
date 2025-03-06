document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("yearly-temperature-data.json");
    const data = await response.json();
    const countries = Object.keys(data).sort();
    const countrySelect = document.getElementById("countrySelect");

    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });

    document
      .getElementById("predictButton")
      .addEventListener("click", async () => {
        const country = countrySelect.value;
        const trainingMessage = document.getElementById("trainingMessage");

        try {
          trainingMessage.style.display = "block";
          const countryData = data[country];

          if (!countryData) {
            document.getElementById("predictionResult").textContent =
              "Country not found.";

            trainingMessage.style.display = "none";
            return;
          }

          //find the average years and average temperatures from data
          const years = countryData.map((item) => item.year);
          const temperatures = countryData.map((item) => item.average);

          //normalizing year data to make model training stabil and better preformance 
          const yearsMean = tf.mean(years);
          const yearsStd = tf.moments(years).variance.sqrt();
          const normalizedYears = tf.div(tf.sub(years, yearsMean), yearsStd);

          //normalizing temp data to make model training stabil and better preformance 
          const tempsMean = tf.mean(temperatures);
          const tempsStd = tf.moments(temperatures).variance.sqrt();
          const normalizedTemps = tf.div(
            tf.sub(temperatures, tempsMean),
            tempsStd
          );

          //creating tensors
          const xs = tf.tensor1d(await normalizedYears.array());
          const ys = tf.tensor1d(await normalizedTemps.array());

          //creating the model
          const model = tf.sequential();
          model.add(tf.layers.dense({ units: 16, activation: "relu", inputShape: [1] }));
          model.add(tf.layers.dense({ units: 8, activation: "relu" }));
          model.add(tf.layers.dense({ units: 1 }));

          const optimizer = tf.train.adam(0.005);
          model.compile({ optimizer: optimizer, loss: "meanSquaredError" });

          await model.fit(xs, ys, {
            epochs: 50,
            batchSize: 32,
            callbacks: {
              onEpochEnd: async (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}, Loss: ${logs.loss}`);
              },
            },
          });

          //prediction for 2050
          const normalizedPrediction2050 = model
            .predict(tf.div(tf.sub(tf.tensor1d([2050]), yearsMean), yearsStd))
            .dataSync()[0];

          const prediction2050 =
            normalizedPrediction2050 * tempsStd.dataSync()[0] +
            tempsMean.dataSync()[0];

          //prediction for 2025 (current year)
          const normalizedPrediction2025 = model
            .predict(tf.div(tf.sub(tf.tensor1d([2025]), yearsMean), yearsStd))
            .dataSync()[0];

          const prediction2025 =
            normalizedPrediction2025 * tempsStd.dataSync()[0] +
            tempsMean.dataSync()[0];

          document.getElementById(
            "predictionResult"
          ).innerHTML = `Predicted temperature in 2025 for ${country}: ${prediction2025.toFixed(
            2
          )} °C<br>Predicted temperature in 2050 for ${country}: ${prediction2050.toFixed(
            2
          )} °C`;

          //generate regression line data
          const regressionLine = [];

          for (let year of years) {
            const normalizedYear =
              (year - yearsMean.dataSync()[0]) / yearsStd.dataSync()[0];

            const normalizedTemp = model
              .predict(tf.tensor1d([normalizedYear]))
              .dataSync()[0];

            const temp =
              normalizedTemp * tempsStd.dataSync()[0] + tempsMean.dataSync()[0];

            regressionLine.push({ x: year, y: temp });
          }

          //create the chart
          const ctx = document
            .getElementById("temperatureChart")
            .getContext("2d");

          if (window.myChart) {
            window.myChart.destroy();
          }
          window.myChart = new Chart(ctx, {
            type: "scatter",

            data: {
              datasets: [
                {
                  label: "Yearly Averages",
                  data: years.map((year, index) => ({
                    x: year,
                    y: temperatures[index],
                  })),
                  backgroundColor: "rgba(54, 162, 235, 0.5)",
                  pointRadius: 5,
                },
                {
                  label: "Regression Line",
                  data: regressionLine,
                  type: "line",
                  borderColor: "rgba(255, 99, 132, 1)",
                  fill: false,
                },
              ],
            },
            options: {
              scales: {
                x: {
                  type: "linear",
                  position: "bottom",
                  title: {
                    display: true,
                    text: "Year",
                  },
                  ticks: {
                    callback: function (value, index, values) {
                      return value.toString();
                    },
                  },
                },
                y: {
                  beginAtZero: false,
                  title: {
                    display: true,
                    text: "Average Temperature (°C)",
                  },
                },
              },
            },
          });

          trainingMessage.style.display = "none";

          //dispose the tensors after being used to free up memory
          xs.dispose();
          ys.dispose();
          model.dispose();
          normalizedYears.dispose();
          normalizedTemps.dispose();
        } catch (error) {
          console.error("Error:", error);

          document.getElementById("predictionResult").textContent =
            "An error occurred.";
          trainingMessage.style.display = "none";
        }
      });
  } catch (error) {
    console.error("Error loading countries:", error);
  }
});