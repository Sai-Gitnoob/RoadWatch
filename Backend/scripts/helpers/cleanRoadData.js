const cleanNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  // Convert to string
  let cleaned = String(value)
    .replace(/,/g, "")
    .replace(/~/g, "")
    .trim();

  // Handle cases like:
  // "221.45 (widening, 2012) / 415"
  // Extract first valid number
  const match = cleaned.match(/-?\d+(\.\d+)?/);

  if (!match) return null;

  const number = Number(match[0]);

  return isNaN(number) ? null : number;
};

const cleanRoadData = (row, category) => {
  return {
    name:
      row["Infrastructure Name"] || null,

    category,

    roadType:
      row["Road Type"] ||
      row["Structure Type"] ||
      null,

    contractor:
      row["Primary Contractor / Builder"] || null,

    authority:
      row["Responsible Authority"] || null,

    location:
      row["Area / Location"] || null,

    grievancePortal:
      row["Grievance Portal URL"] || null,

    source:
      row["Citation / Source"] || null,

    firstBudgetCr: cleanNumber(
      row["First Budget Sanctioned (INR Cr)"]
    ),

    latestBudgetCr: cleanNumber(
      row["Latest Budget Sanctioned (INR Cr)"]
    ),

    firstSpentCr: cleanNumber(
      row["First Allocation Spent (INR Cr)"]
    ),

    latestSpentCr: cleanNumber(
      row["Latest Allocation Spent (INR Cr)"]
    ),

    lastRepair:
      row["Last Repair / Maintenance"] ||
      row["Last Repair / Status"] ||
      null,

    createdAt: new Date(),
  };
};

module.exports = cleanRoadData;