export default class ApiResponse {
  static success(res, { statusCode = 200, message, data, success = true } = {}) {
    return res.status(statusCode).json({
      success,
      message,
      data,
    });
  }

  static legacy(res, { statusCode = 200, success, msg, data }) {
    const body = { success, msg };
    if (data !== undefined) {
      body.data = data;
    }
    return res.status(statusCode).json(body);
  }

  static paginated(res, { data, page, limit, total }) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 0,
      },
    });
  }
}
