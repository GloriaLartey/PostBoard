const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ═════════════════════════════════════════════════════════════════════════════
//  GET USERS
//  GET /api/users?search=&page=&limit=
//  Returns all active users except the authenticated user.
//  Used by the Share modal to pick recipients.
// ═════════════════════════════════════════════════════════════════════════════
exports.getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 200 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {
      _id:      { $ne: req.user._id }, // exclude self
      isActive: true,
    };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email:    { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("_id username email avatar")
        .sort({ username: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return successResponse(res, "Users retrieved.", {
      users,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("getUsers error:", err);
    return errorResponse(res, "Failed to retrieve users.", 500);
  }
};