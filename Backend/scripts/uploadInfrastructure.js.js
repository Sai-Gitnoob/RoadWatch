const xlsx = require("xlsx");
const path = require("path");

const { db } = require("../src/config/firebase");

const cleanRoadData = require(
  "./helpers/cleanRoadData"
);


// Excel File Path
const filePath = path.join(
  __dirname,
  "../data/roads.xlsx"
);


// Read Workbook
const workbook = xlsx.readFile(filePath);


// Sheet Mapping
const sheetCategories = {
  "Roads": "road",
  "Bridges & Flyovers": "bridge",
  "Linking Roads": "linking-road",
};


const uploadData = async () => {

  try {

    for (const sheetName in sheetCategories) {

      console.log(`\nProcessing Sheet: ${sheetName}`);

      const worksheet =
        workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const rows = xlsx.utils.sheet_to_json(
        worksheet,
        {
          range: 2, // Skip first 2 rows
        }
      );

      const category =
        sheetCategories[sheetName];

      for (const row of rows) {

        // Skip empty rows
        if (!row["Infrastructure Name"]) {
          continue;
        }

        const cleanedData =
          cleanRoadData(row, category);

        // Create Slug ID
        const slug = cleanedData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Upload to Firebase
        await db
          .collection("infrastructure")
          .doc(slug)
          .set(cleanedData);

        console.log(
          `Uploaded: ${cleanedData.name}`
        );
      }
    }

    console.log("\n Upload Completed");

  } catch (error) {

    console.error(
      "Upload Error:",
      error
    );
  }
};


uploadData();