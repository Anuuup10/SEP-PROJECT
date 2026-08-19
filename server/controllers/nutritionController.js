// server/controllers/nutritionController.js

/**
 * Scan food image
 */
export const scanFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a food image.',
      });
    }

    /*
     * TODO:
     * Put your existing AI/image-analysis logic here.
     *
     * For now, this returns a basic response so that
     * the API does not crash.
     */

    return res.status(200).json({
      success: true,
      message: 'Food image received successfully.',
      nutrition: {
        foodName: 'Unknown food',
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
      },
    });
  } catch (error) {
    console.error('[Nutrition] Scan error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to scan food.',
      error: error.message,
    });
  }
};


/**
 * Get nutrition history
 */
export const getNutritionHistory = async (req, res) => {
  try {
    /*
     * TODO:
     * Replace this with your database query.
     *
     * Example:
     * const history = await Nutrition.find(...)
     */

    const history = [];

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(
      '[Nutrition] History error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to get nutrition history.',
      error: error.message,
    });
  }
};