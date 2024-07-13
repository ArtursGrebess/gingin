const sheetId = "1do2TOAURvOoBi9pyodLmJBa3IbiVXzeJ6-96gHiAMF8"; // Your actual Sheet ID
const apiKey = "AIzaSyDhqKzC7Da41TBGMPy5JKZ0k9hAbRf8M_0"; // Your actual API Key

// Event listener to start the process once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  fetchSheets(); // Fetch the list of sheets
});

// Function to fetch the list of sheets from the Google Sheets API
function fetchSheets() {
  document.getElementById("status").innerText = "Fetching sheet list..."; // Update status message

  fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`
  )
    .then((response) => response.json())
    .then((metadata) => {
      const sheets = metadata.sheets.map((sheet) => sheet.properties.title); // Extract sheet titles
      createLanguageBar(sheets); // Create the language bar with sheet titles
      document.getElementById("status").innerText =
        "Select a sheet to view data."; // Update status message
    })
    .catch((error) => {
      console.error("Error fetching sheet list:", error); // Log any errors
      document.getElementById("status").innerText = "Error fetching sheet list"; // Update status message on error
    });
}

// Function to create the language bar with sheet titles
function createLanguageBar(sheets) {
  const languageBar = document.getElementById("language-bar");
  languageBar.innerHTML = ""; // Clear any existing content

  sheets.forEach((sheet, index) => {
    const link = document.createElement("a"); // Create a new link element
    link.href = "#"; // Set the href attribute to "#"
    link.innerText = sheet; // Set the link text to the sheet title
    link.addEventListener("click", () => {
      document
        .querySelectorAll(".language-bar a")
        .forEach((a) => a.classList.remove("active")); // Remove "active" class from all links
      link.classList.add("active"); // Add "active" class to the clicked link
      fetchData(sheet); // Fetch data for the clicked sheet
    });
    languageBar.appendChild(link); // Add the link to the language bar

    // Automatically click the first tab to load its data initially
    if (index === 0) {
      link.click();
    }
  });
}

// Function to fetch and display data from a specific sheet
function fetchData(sheetName) {
  const range = `${sheetName}`; // Specify the range as the sheet name

  document.getElementById(
    "status"
  ).innerText = `Fetching data from "${sheetName}"...`; // Update status message
  document.getElementById("sheet-data").innerHTML = ""; // Clear any existing data

  fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      const rows = data.values; // Get the rows of data
      let html = ""; // Initialize an empty string for the HTML content
      if (rows && rows.length > 0) {
        rows.forEach((row, index) => {
          const [
            line,
            category,
            name,
            description,
            price,
            dietary,
            options,
            allergens,
          ] = row; // Destructure the row into variables
          if (index === 0) return; // Skip the header row
          if (category === "comments") {
            if (name) {
              html += `<div class="menu-note">${name}</div>`; // Add a menu note if category is "comments"
            }
          } else if (category) {
            const dietaryHtml = dietary ? ` <i>(${dietary})</i>` : "";
            const optionsHtml = options ? ` <i>(${options})</i>` : "";
            const allergensHtml = allergens ? ` <i>(${allergens})</i>` : "";
            html += `<div class="menu-item">
                            ${name}, ${description}${dietaryHtml}${optionsHtml}${allergensHtml} $${price}
                        </div>`; // Add the menu item to the HTML string
          }
        });
      }
      document.getElementById("sheet-data").innerHTML = html; // Set the HTML content
      document.getElementById("status").innerText = ""; // Clear the status message
    })
    .catch((error) => {
      console.error("Error fetching data:", error); // Log any errors
      document.getElementById("status").innerText = "Error fetching data"; // Update status message on error
    });
}
