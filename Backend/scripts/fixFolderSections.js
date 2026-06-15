/**
 * One-time migration script.
 * Fixes folders/files that were saved with section:"home" due to the old
 * finalSection logic. They should be "myfile" since they weren't shared.
 *
 * Run once: node scripts/fixFolderSections.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Content  = require("../models/Content");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const result = await Content.updateMany(
    {
      section:        "home",
      sharedWithAll:  false,
      "sharedWith.0": { $exists: false },
    },
    { $set: { section: "myfile" } }
  );

  console.log(`Fixed ${result.modifiedCount} document(s) — section set to "myfile"`);
  await mongoose.disconnect();
})();