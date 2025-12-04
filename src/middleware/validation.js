function requireFields(fields) {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return res.status(400).json({ error: "Missing required fields", fields: missing });
    }
    next();
  };
}

function parsePagination(req, _res, next) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "20", 10), 1), 100);
  req.pagination = {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
  next();
}

module.exports = {
  requireFields,
  parsePagination,
};


