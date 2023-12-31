const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const connection = require('./koneksi');
const multer = require('multer');

const app = express();
const port = 3001;

app.use(cors());  
app.use(express.json());

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });


//get file pdf:
app.get('/getPdf/:id', (req, res) => {
  const { id } = req.params;

  try {
    connection.query('SELECT URL_DRAFT_SURAT FROM tb_master_nomor_surat WHERE ID = ?', [id], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil data dari database' });
      } else {
        if (results.length > 0) {
          const pdfPath = path.join(__dirname, 'uploads', results[0].URL_DRAFT_SURAT);
          res.sendFile(pdfPath);
        } else {
          res.status(404).json({ success: false, error: 'Data tidak ditemukan' });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
  }
});

app.get('/getKodeSurat', (req, res) => {
  try {
    connection.query('SELECT * FROM tb_kode_surat', (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil data dari database' });
      } else {
        res.json({ success: true, data: results });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
  }
});

app.post('/addKodeSurat', (req, res) => {
  try {
    const { KODE_SURAT, KETERANGAN } = req.body;
    // Query untuk menambahkan data baru ke dalam tabel
    const query = `
      INSERT INTO tb_kode_surat (
        KODE_SURAT,
        KETERANGAN
      ) VALUES (?, ?)
    `;

    // Parameter untuk query
    const values = [
      KODE_SURAT,
      KETERANGAN
    ];

    // Menjalankan query
    connection.query(query, values, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal menambahkan data ke database' });
      } else {
        res.json({ success: true, message: 'Data berhasil ditambahkan' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
  }
});

app.get('/getAllData', (req, res) => {
  try {
    connection.query('SELECT * FROM tb_master_nomor_surat', (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil data dari database' });
      } else {
        res.json({ success: true, data: results });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
  }
});

// app.get('/getData/:id', (req, res) => {
//   const { id } = req.params;
//   try {
//     connection.query('SELECT * FROM tb_master_nomor_surat WHERE ID = ?', [id], (error, results) => {
//       if (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Gagal mengambil data dari database' });
//       } else {
//         if (results.length > 0) {
//           res.json({ success: true, data: results[0] });
//         } else {
//           res.status(404).json({ success: false, error: 'Data tidak ditemukan' });
//         }
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
//   }
// });

//get data by id dengan file pdf:
app.get('/getData/:id', (req, res) => {
  const { id } = req.params;
  try {
    connection.query('SELECT * FROM tb_master_nomor_surat WHERE ID = ?', [id], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil data dari database' });
      } else {
        if (results.length > 0) {
          // Tambahkan properti 'pdf' ke objek results[0]
          results[0].PDF_URL = `http://localhost:3001/getPdf/${id}`; // Sesuaikan dengan endpoint yang digunakan untuk mengunduh PDF

          // Kirim respons dengan objek yang sudah diperbarui
          res.json({ success: true, data: results[0] });
        } else {
          res.status(404).json({ success: false, error: 'Data tidak ditemukan' });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
  }
});

app.get('/getLastNumber/:kodeSurat', (req, res) => {
  const { kodeSurat } = req.params;
  try {
    connection.query('SELECT NOMOR_SURAT FROM tb_master_nomor_surat WHERE KODE_SURAT = ? ORDER BY NOMOR_SURAT DESC LIMIT 1', [kodeSurat], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil data dari database' });
      } else {
        let lastNumber = results.length > 0 ? results[0].NOMOR_SURAT : 0;
        res.json({ success: true, lastNumber });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
  }
});


app.get('/getDataByCode/:kodeSurat', (req, res) => {
  const { kodeSurat } = req.params;
  try {
    connection.query('SELECT * FROM tb_master_nomor_surat WHERE KODE_SURAT = ?', [kodeSurat], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil data dari database' });
      } else {
        res.json({ success: true, data: results });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
  }
});


// app.post('/addData', (req, res) => {
//   try {
//     const { ID, NOMOR_SURAT, YANG_MENANDATANGANI, YANG_MENANDATANGANI_KODE, KODE_SURAT, BULAN, BULAN_ROMAWI, TAHUN, PERIHAL, UNIT_KERJA, STATUS, NOMOR_SURAT_LENGKAP, URL_DRAFT_SURAT, TANGGAL_PENGAJUAN, YANG_MEMBUBUHKAN_TTD, AUTHOR, NOMOR_WA_AUTHOR, EMAIL_AUTHOR, KETERANGAN, SERAHKAN_DOKUMEN } = req.body;
//     // Query untuk menambahkan data baru ke dalam tabel
//     const query = `
//       INSERT INTO tb_master_nomor_surat (
//         ID,
//         NOMOR_SURAT,
//         YANG_MENANDATANGANI,
//         YANG_MENANDATANGANI_KODE,
//         KODE_SURAT,
//         BULAN,
//         BULAN_ROMAWI,
//         TAHUN,
//         PERIHAL,
//         UNIT_KERJA,
//         STATUS,
//         NOMOR_SURAT_LENGKAP,
//         URL_DRAFT_SURAT,
//         TANGGAL_PENGAJUAN,
//         YANG_MEMBUBUHKAN_TTD,
//         AUTHOR,
//         NOMOR_WA_AUTHOR,
//         EMAIL_AUTHOR,
//         KETERANGAN,
//         SERAHKAN_DOKUMEN 
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     // Parameter untuk query
//     const values = [
//       ID,
//       NOMOR_SURAT,
//       YANG_MENANDATANGANI,
//       YANG_MENANDATANGANI_KODE,
//       KODE_SURAT,
//       BULAN,
//       BULAN_ROMAWI,
//       TAHUN,
//       PERIHAL,
//       UNIT_KERJA,
//       STATUS,
//       NOMOR_SURAT_LENGKAP,
//       URL_DRAFT_SURAT,
//       TANGGAL_PENGAJUAN,
//       YANG_MEMBUBUHKAN_TTD, 
//       AUTHOR, 
//       NOMOR_WA_AUTHOR, 
//       EMAIL_AUTHOR, 
//       KETERANGAN,
//       SERAHKAN_DOKUMEN
//     ];

//     // Menjalankan query
//     connection.query(query, values, (error, results) => {
//       if (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Gagal menambahkan data ke database' });
//       } else {
//         res.json({ success: true, message: 'Data berhasil ditambahkan' });
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
//   }
// });

app.post('/addData', upload.single('file'), (req, res) => {
  try {
    const {
      ID,
      NOMOR_SURAT,
      YANG_MENANDATANGANI,
      YANG_MENANDATANGANI_KODE,
      KODE_SURAT,
      BULAN,
      BULAN_ROMAWI,
      TAHUN,
      PERIHAL,
      UNIT_KERJA,
      STATUS,
      NOMOR_SURAT_LENGKAP,
      TANGGAL_PENGAJUAN,
      YANG_MEMBUBUHKAN_TTD,
      AUTHOR,
      NOMOR_WA_AUTHOR,
      EMAIL_AUTHOR,
      KETERANGAN,
      SERAHKAN_DOKUMEN
    } = req.body;

    const fileUrl = req.file ? req.file.originalname : null;

    const query = `
      INSERT INTO tb_master_nomor_surat (
        ID,
        NOMOR_SURAT,
        YANG_MENANDATANGANI,
        YANG_MENANDATANGANI_KODE,
        KODE_SURAT,
        BULAN,
        BULAN_ROMAWI,
        TAHUN,
        PERIHAL,
        UNIT_KERJA,
        STATUS,
        NOMOR_SURAT_LENGKAP,
        URL_DRAFT_SURAT,
        TANGGAL_PENGAJUAN,
        YANG_MEMBUBUHKAN_TTD,
        AUTHOR,
        NOMOR_WA_AUTHOR,
        EMAIL_AUTHOR,
        KETERANGAN,
        SERAHKAN_DOKUMEN 
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      ID,
      NOMOR_SURAT,
      YANG_MENANDATANGANI,
      YANG_MENANDATANGANI_KODE,
      KODE_SURAT,
      BULAN,
      BULAN_ROMAWI,
      TAHUN,
      PERIHAL,
      UNIT_KERJA,
      STATUS,
      NOMOR_SURAT_LENGKAP,
      fileUrl,  // Ganti dengan fileUrl sebagai URL_DRAFT_SURAT
      TANGGAL_PENGAJUAN,
      YANG_MEMBUBUHKAN_TTD, 
      AUTHOR, 
      NOMOR_WA_AUTHOR, 
      EMAIL_AUTHOR, 
      KETERANGAN,
      SERAHKAN_DOKUMEN
    ];

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal menambahkan data ke database' });
      } else {
        res.json({ success: true, message: 'Data berhasil ditambahkan' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
  }
});


app.put('/updateData/:id', upload.single('file'), (req, res) => {
  const { id } = req.params;

  try {
    const { NOMOR_SURAT, YANG_MENANDATANGANI, YANG_MENANDATANGANI_KODE, KODE_SURAT, BULAN, BULAN_ROMAWI, TAHUN, PERIHAL, UNIT_KERJA, STATUS, NOMOR_SURAT_LENGKAP, URL_DRAFT_SURAT, TANGGAL_PENGAJUAN, YANG_MEMBUBUHKAN_TTD, AUTHOR, NOMOR_WA_AUTHOR, EMAIL_AUTHOR, KETERANGAN, SERAHKAN_DOKUMEN } = req.body;
    const fileUrl = req.file ? req.file.originalname : URL_DRAFT_SURAT;
    // Query untuk memperbarui data dalam tabel
    const query = `
      UPDATE tb_master_nomor_surat
      SET
        NOMOR_SURAT = ?,
        YANG_MENANDATANGANI = ?,
        YANG_MENANDATANGANI_KODE = ?,
        KODE_SURAT = ?,
        BULAN = ?,
        BULAN_ROMAWI = ?,
        TAHUN = ?,
        PERIHAL = ?,
        UNIT_KERJA = ?,
        STATUS = ?,
        NOMOR_SURAT_LENGKAP = ?,
        URL_DRAFT_SURAT = ?,
        TANGGAL_PENGAJUAN = ?,
        YANG_MEMBUBUHKAN_TTD = ?, 
        AUTHOR = ?, 
        NOMOR_WA_AUTHOR = ?, 
        EMAIL_AUTHOR = ?, 
        KETERANGAN = ?,
        SERAHKAN_DOKUMEN = ?
      WHERE ID = ?
    `;

    // Parameter untuk query
    const values = [
      NOMOR_SURAT,
      YANG_MENANDATANGANI,
      YANG_MENANDATANGANI_KODE,
      KODE_SURAT,
      BULAN,
      BULAN_ROMAWI,
      TAHUN,
      PERIHAL,
      UNIT_KERJA,
      STATUS,
      NOMOR_SURAT_LENGKAP,
      fileUrl, // Ganti dengan fileUrl sebagai URL_DRAFT_SURAT  
      TANGGAL_PENGAJUAN, 
      YANG_MEMBUBUHKAN_TTD, 
      AUTHOR, 
      NOMOR_WA_AUTHOR, 
      EMAIL_AUTHOR, 
      KETERANGAN,
      SERAHKAN_DOKUMEN,
      id
    ];

    // Menjalankan query
    connection.query(query, values, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal memperbarui data di database' });
      } else {
        res.json({ success: true, message: 'Data berhasil diperbarui' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan' });
  }
});


// Endpoint PATCH untuk mengubah STATUS berdasarkan Kolom NO
app.patch('/updateStatus/:id', (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  try {
    // Query untuk mengubah STATUS berdasarkan ID
    const updateQuery = 'UPDATE tb_master_nomor_surat SET STATUS = ? WHERE ID = ?';

    // Parameter untuk query
    const updateValues = [newStatus, id];

    // Menjalankan query untuk mengubah STATUS di database
    connection.query(updateQuery, updateValues, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal memperbarui data di database' });
      } else {
        if (results.affectedRows > 0) {
          res.json({ success: true, message: 'Data berhasil diperbarui' });
        } else {
          res.status(404).json({ success: false, error: 'Data tidak ditemukan' });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Gagal memperbarui data' });
  }
});

// Endpoint DELETE untuk menghapus data berdasarkan ID
app.delete('/deleteData/:id', (req, res) => {
  const { id } = req.params;

  try {
    // Query untuk menghapus data berdasarkan ID
    const deleteQuery = 'DELETE FROM tb_master_nomor_surat WHERE ID = ?';

    // Parameter untuk query
    const deleteValues = [id];

    // Menjalankan query untuk menghapus data di database
    connection.query(deleteQuery, deleteValues, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal menghapus data di database' });
      } else {
        if (results.affectedRows > 0) {
          res.json({ success: true, message: 'Data berhasil dihapus' });
        } else {
          res.status(404).json({ success: false, error: 'Data tidak ditemukan' });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Gagal menghapus data' });
  }
});


app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});