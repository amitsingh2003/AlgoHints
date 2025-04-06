import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import { getReview } from "../controllers/ai.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/get-review", getReview);

router.post("/ocr", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No image uploaded" });
    }

    const imagePath = req.file.path;

    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => console.log(m),
    });

    fs.unlinkSync(imagePath);

    return res.json({
      success: true,
      text: result.data.text,
    });
  } catch (error) {
    console.error("OCR error:", error);
    return res
      .status(500)
      .json({ success: false, error: "OCR processing failed" });
  }
});

export default router;
