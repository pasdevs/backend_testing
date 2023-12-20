const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const connection = require('./koneksi');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, 'data', 'datasuratcsv.csv');

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

app.get('/getData/:id', (req, res) => {
  const { id } = req.params;
  try {
    connection.query('SELECT * FROM tb_master_nomor_surat WHERE ID = ?', [id], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil data dari database' });
      } else {
        if (results.length > 0) {
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


app.post('/addData', (req, res) => {
  try {
    const { ID, NOMOR_SURAT, YANG_MENANDATANGANI, YANG_MENANDATANGANI_KODE, KODE_SURAT, BULAN, BULAN_ROMAWI, TAHUN, PERIHAL, UNIT_KERJA, STATUS, NOMOR_SURAT_LENGKAP, URL_DRAFT_SURAT } = req.body;
    // Query untuk menambahkan data baru ke dalam tabel
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
        URL_DRAFT_SURAT
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Parameter untuk query
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
      URL_DRAFT_SURAT
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


app.put('/updateData/:id', (req, res) => {
  const { id } = req.params;

  try {
    const { NOMOR_SURAT, YANG_MENANDATANGANI, YANG_MENANDATANGANI_KODE, KODE_SURAT, BULAN, BULAN_ROMAWI, TAHUN, PERIHAL, UNIT_KERJA, STATUS, NOMOR_SURAT_LENGKAP, URL_DRAFT_SURAT } = req.body;
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
        URL_DRAFT_SURAT = ?
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
      URL_DRAFT_SURAT,
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


app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});