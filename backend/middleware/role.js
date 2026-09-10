const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'petugas' && req.user.petugas_role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Akses ditolak. Fitur ini hanya untuk Admin.' });
  }
};

module.exports = { isAdmin };
