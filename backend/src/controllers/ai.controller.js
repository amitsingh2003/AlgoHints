import generateHint from "../services/ai.service.js";

/**
 
 * @param {Object} req 
 * @param {Object} res 
 * @returns {Promise<void>}
 */
export async function getReview(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "A valid problem statement is required",
      });
    }

    console.log(
      `Processing hint request for problem: ${prompt.substring(0, 100)}...`
    );

    const response = await generateHint(prompt);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error in getReview controller:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate hints. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
