const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

app.use("/outputs", express.static("outputs"));

const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const format = req.body.format || "ogg";

  const outputFile = `outputs/output-${Date.now()}.${format}`;

  const command = `
    ffmpeg -i "${filePath}" -t 350 \
    -filter:a "atempo=2.0,atempo=1.15,volume=-4dB" \
    "${outputFile}"
  `;

  exec(command, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "FFmpeg error" });
    }

    // hapus file upload
    fs.unlinkSync(filePath);

    const backspeed = (1 / 2.3).toFixed(2);

    res.json({
      format,
      backspeed,
      url: `${req.protocol}://${req.get("host")}/${outputFile}`,
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));