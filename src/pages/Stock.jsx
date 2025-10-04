import React, { useState, useEffect, useRef } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { IoQrCodeOutline, IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FaExchangeAlt, FaEdit, FaTrash, FaBarcode } from "react-icons/fa";

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  readOnly = false,
  required = false,
}) => (
  <div className="w-full">
    <label className="block text-xs mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      required={required}
      className="border rounded px-2 py-1 w-full"
    />
  </div>
);

const EditField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  readOnly = false,
  required = false,
}) => (
  <div className="w-full">
    <label className="block text-xs mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      required={required}
      className={`border rounded px-2 py-1 w-full ${
        readOnly ? "bg-gray-100" : ""
      }`}
    />
  </div>
);

const Stock = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 2000);
  };

  const handlePrintSelected = () => {
    if (selectedToPrint.length === 0) {
      showAlert("error", "Pilih setidaknya 1 produk untuk dicetak.");
      return;
    }

    const invalid = selectedToPrint.some(
      (item) => !item.jumlah || isNaN(item.jumlah) || item.jumlah <= 0
    );

    if (invalid) {
      showAlert(
        "error",
        "Isi jumlah cetak yang valid untuk semua produk yang dipilih."
      );
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showAlert("error", "Pop-up diblokir. Izinkan pop-up di browser Anda.");
      return;
    }

    const html = `
    <html>
    <head>
      <title>Cetak Barcode</title>
      <style>
        @media print {
          body {
            margin: 0;
            padding: 0;
            width: 58mm;
          }
        }

        body {
          font-family: sans-serif;
          padding: 4px;
          width: 58mm;
        }

        .barcode-item {
  text-align: center;
  margin-bottom: 6px;
  font-size: 11px;
  border: 1px dashed #000;
  padding: 6px 2px;
  border-radius: 4px;
}


        svg {
          width: 200px;
          height: 40px;
        }

        .harga {
          font-size: 11px;
          margin-top: 2px;
        }

        .nama {
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 2px;
        }
      </style>
    </head>
    <body>
      ${selectedToPrint
        .map((item) =>
          Array.from({ length: Number(item.jumlah) })
            .map(
              () => `
              <div class="barcode-item">
                <div class="nama">${item.nama_produk
                  .toLowerCase()
                  .replace(/(^|\s)\S/g, (l) => l.toUpperCase())}</div>
                <svg class="barcode" data-code="${item.barcode}"></svg>
                <div class="harga">Rp ${Number(item.harga_jual).toLocaleString(
                  "id-ID"
                )}</div>
              </div>
            `
            )
            .join("")
        )
        .join("")}

      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <script>
        window.onload = function() {
          document.querySelectorAll('svg.barcode').forEach(svg => {
            JsBarcode(svg, svg.dataset.code, {
              format: "CODE128",
              displayValue: false,
              width: 1.5,
              height: 40
            });
          });
          setTimeout(() => window.print(), 500);
        };
      </script>
    </body>
    </html>
  `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const [selectedToPrint, setSelectedToPrint] = useState([]);

  const handleCheckboxChange = (item) => {
    setSelectedToPrint((prev) => {
      const exists = prev.find((p) => p.id_stok === item.id_stok);
      if (exists) return prev.filter((p) => p.id_stok !== item.id_stok);
      return [...prev, { ...item, jumlah: "" }];
    });
  };

  // localStorage.clear();
  const role = localStorage.getItem("role");
  const userLokasi = localStorage.getItem("id_lokasi");

  ///const [lokasiList, setLokasiList] = useState([]);
  const [selectedLokasi, setSelectedLokasi] = useState(() => {
    const role = localStorage.getItem("role");
    const userLokasi = localStorage.getItem("id_lokasi");
    if (role === "admin") return "1";
    return userLokasi;
  });

  useEffect(() => {
    if (role === "admin") {
      api
        .get("/lokasi/", { headers: getAuthHeaders() })
        .then((res) => setLokasiList(res.data || []));
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      setReadOnly(true); // Set state readonly jika bukan admin
    }
  }, []);

  const [readOnly, setReadOnly] = useState(false);

  const [sortBy, setSortBy] = useState("stok"); // Default sort by nama_produk
  const [sortAsc, setSortAsc] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // State untuk data produk dari API
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data produk dari API saat mount
  useEffect(() => {
    setLoading(true);
    setError(null);

    const lokasiId = role === "admin" ? selectedLokasi : userLokasi;

    api
      .get("/stok/", {
        headers: getAuthHeaders(),
        params: lokasiId ? { id_lokasi: lokasiId } : {},
      })
      .then((res) => setData(res.data.data || []))
      .catch(() => setError("Gagal mengambil data produk"))
      .finally(() => setLoading(false));
  }, [selectedLokasi, role]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Modal handler
  const openEditModal = (item) => {
    setEditItem(item); // langsung pakai data dari tabel
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(
        `/stok/${editItem.id_stok}`,
        {
          id_produk: editItem.id_produk,
          id_lokasi: Number(selectedLokasi || userLokasi),
          nama_produk: editItem.nama_produk,
          barcode: editItem.barcode?.trim() || "", // boleh kosong
          kategori: editItem.kategori,
          satuan: editItem.satuan,
          harga_beli: Number(editItem.harga_beli),
          harga_jual: Number(editItem.harga_jual),
          expired_date:
            (editItem.expired_date || "").trim() === ""
              ? null
              : editItem.expired_date,
          stok_optimal:
            (editItem.stok_optimal || "").toString().trim() === ""
              ? 0
              : Number(editItem.stok_optimal),
          jumlah: Number(editItem.jumlah),
        },
        { headers: getAuthHeaders() }
      );

      // Ambil data terbaru
      const lokasiId = role === "admin" ? selectedLokasi : userLokasi;

      const res = await api.get("/stok/", {
        headers: getAuthHeaders(),
        params: lokasiId ? { id_lokasi: lokasiId } : {},
      });

      showAlert("success", "Barang berhasil di update");
      setData(res.data.data || []);
      closeModal();
    } catch (err) {
      showAlert(
        "error",
        "Gagal mengedit barang. Pastikan data sudah benar.\n\n" +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    nama_produk: "",
    barcode: "",
    kategori: "",
    satuan: "",
    harga_beli: "",
    harga_jual: "",
    expired_date: "",
    stok_optimal: "",
    jumlah: "",
  });

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]); // Tambah state untuk satuan

  // Fetch kategori dari API saat mount
  // useEffect(() => {
  //   api
  //     .get("/categories/")
  //     .then((res) => setCategories(res.data))
  //     .catch(() => setCategories([]));
  // }, []);

  // // Fetch satuan dari API saat mount
  // useEffect(() => {
  //   api
  //     .get("/units/")
  //     .then((res) => setUnits(res.data))
  //     .catch(() => setUnits([]));
  // }, []);

  // Handler untuk modal tambah
  const openAddModal = () => {
    setNewItem({
      nama_produk: "",
      barcode: "",
      kategori: "",
      satuan: "",
      harga_beli: "",
      harga_jual: "",
      expired_date: "",
      stok_optimal: "",
      jumlah: "",
    });
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Hindari submit ganda

    setIsSubmitting(true); // Mulai loading

    const trimmedBarcode = newItem.barcode.trim();

    if (
      trimmedBarcode !== "" &&
      data.some(
        (item) => item.barcode && item.barcode.trim() === trimmedBarcode
      )
    ) {
      showAlert("error", "barcode sudah terdaftar, cek kembali produk anda");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post(
        "/stok/",
        {
          id_produk: null,
          id_lokasi: Number(selectedLokasi || userLokasi),

          nama_produk: newItem.nama_produk,
          barcode: trimmedBarcode,
          kategori: newItem.kategori,
          satuan: newItem.satuan,
          harga_beli: Number(newItem.harga_beli),
          harga_jual: Number(newItem.harga_jual),
          expired_date:
            newItem.expired_date.trim() === "" ? null : newItem.expired_date,
          stok_optimal:
            newItem.stok_optimal.trim() === ""
              ? 0
              : Number(newItem.stok_optimal),
          jumlah: Number(newItem.jumlah),
        },
        { headers: getAuthHeaders() }
      );

      const lokasiId = role === "admin" ? selectedLokasi : userLokasi;
      const res = await api.get("/stok/", {
        headers: getAuthHeaders(),
        params: lokasiId ? { id_lokasi: lokasiId } : {},
      });

      showAlert("success", "Berhasil menambah barang");
      setData(res.data.data || []);
      closeAddModal();
    } catch (err) {
      showAlert("error", "Gagal menambah barang. Pastikan data sudah benar");
    } finally {
      setIsSubmitting(false); // Selesai loading
    }
  };

  // Sorting function
  const sortedData = [...data].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortAsc ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortAsc ? 1 : -1;
    return 0;
  });

  // Icon SVG
  const SortIcon = ({ active, asc }) => (
    <svg
      className={`w-3 h-3 ms-1.5 inline ${
        active ? "text-[#FF4778]" : "text-gray-400"
      }`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      style={{ transform: asc ? "rotate(0deg)" : "rotate(180deg)" }}
    >
      <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
    </svg>
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const [mutasiModalOpen, setMutasiModalOpen] = useState(false);
  const [mutasiForm, setMutasiForm] = useState({
    tanggal_awal: "",
    tanggal_akhir: "",
    id_lokasi_asal: "",
    id_lokasi_tujuan: "",
  });
  const [lokasiList, setLokasiList] = useState([]);

  // Fetch lokasi untuk dropdown
  useEffect(() => {
    if (mutasiModalOpen) {
      api
        .get("/lokasi/", { headers: getAuthHeaders() })
        .then((res) => setLokasiList(res.data || []))
        .catch(() => setLokasiList([]));
    }
  }, [mutasiModalOpen]);

  const openMutasiModal = () => {
    const currentLokasi = role === "admin" ? selectedLokasi : userLokasi;
    setMutasiForm((prev) => ({
      ...prev,
      id_lokasi_asal: currentLokasi || "", // otomatis isi lokasi asal
    }));
    setMutasiModalOpen(true);
  };

  const closeMutasiModal = () => setMutasiModalOpen(false);

  const handleMutasiChange = (e) => {
    const { name, value } = e.target;
    setMutasiForm((prev) => ({ ...prev, [name]: value }));
  };

  const [mutasiItems, setMutasiItems] = useState([]);

  // Handler untuk mengubah qty mutasi
  const handleMutasiQtyChange = (idx, value) => {
    setMutasiItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, qty: Number(value) } : item
      )
    );
  };

  // Handler untuk menghapus produk dari daftar mutasi
  const handleHapusMutasi = (idx) => {
    setMutasiItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Contoh: Tambahkan produk ke mutasiItems saat klik tombol "Mutasi" di tabel utama
  const handleAddToMutasi = (item) => {
    // Cegah duplikasi produk
    if (!mutasiItems.some((x) => x.id_stok === item.id_stok)) {
      setMutasiItems((prev) => [
        ...prev,
        {
          ...item,
          id_produk: item.id_produk, // gunakan id_produk jika ada, jika tidak gunakan id_stok
          qty: 1, // default qty mutasi
        },
      ]);
    }
  };

  // State untuk modal lihat data mutasi
  const [lihatMutasiOpen, setLihatMutasiOpen] = useState(false);
  const [filterMutasi, setFilterMutasi] = useState({
    tanggal_awal: "",
    tanggal_akhir: "",
    id_lokasi_asal: "",
    id_lokasi_tujuan: "",
    id_produk: "",
  });
  const [dataMutasi, setDataMutasi] = useState([]);
  const [loadingMutasi, setLoadingMutasi] = useState(false);
  const [produkList, setProdukList] = useState([]);

  // Fetch lokasi dan produk untuk filter saat modal dibuka
  useEffect(() => {
    if (lihatMutasiOpen) {
      api
        .get("/lokasi/", { headers: getAuthHeaders() })
        .then((res) => setLokasiList(res.data || []));
      api
        .get("/stok/", { headers: getAuthHeaders() })
        .then((res) => setProdukList(res.data.data || []));
    }
  }, [lihatMutasiOpen]);

  // Handler filter
  const handleFilterMutasiChange = (e) => {
    const { name, value } = e.target;
    setFilterMutasi((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch data mutasi dari endpoint baru
  useEffect(() => {
    if (lihatMutasiOpen) {
      setLoadingMutasi(true);
      api
        .get("/mutasi-stok/", {
          headers: getAuthHeaders(),
          params: {
            tanggal_awal: filterMutasi.tanggal_awal,
            tanggal_akhir: filterMutasi.tanggal_akhir,
            id_lokasi_asal: filterMutasi.id_lokasi_asal,
            id_lokasi_tujuan: filterMutasi.id_lokasi_tujuan,
            id_produk: filterMutasi.id_produk,
          },
        })
        .then((res) => setDataMutasi(res.data.data || []))
        .catch(() => setDataMutasi([]))
        .finally(() => setLoadingMutasi(false));
    }
  }, [
    lihatMutasiOpen,
    filterMutasi.tanggal_awal,
    filterMutasi.tanggal_akhir,
    filterMutasi.id_lokasi_asal,
    filterMutasi.id_lokasi_tujuan,
    filterMutasi.id_produk,
  ]);

  const openLihatMutasi = () => setLihatMutasiOpen(true);
  const closeLihatMutasi = () => setLihatMutasiOpen(false);

  const handleMutasiSubmit = async (e) => {
    e.preventDefault();
    // Validasi minimal 1 item dan field wajib
    if (
      !mutasiForm.id_lokasi_asal ||
      !mutasiForm.id_lokasi_tujuan ||
      mutasiItems.length === 0 ||
      mutasiItems.some(
        (item) =>
          item.id_produk === undefined ||
          item.id_produk === null ||
          item.qty === undefined ||
          item.qty === null ||
          item.keterangan === undefined ||
          item.keterangan.trim() === ""
      )
    ) {
      showAlert("error", "Lengkapi semua data mutasi dan keterangan produk!");
      return;
    }

    try {
      const payload = mutasiItems.map((item) => ({
        id_produk: Number(item.id_produk),
        id_lokasi_asal: Number(mutasiForm.id_lokasi_asal),
        id_lokasi_tujuan: Number(mutasiForm.id_lokasi_tujuan),
        qty: Number(item.qty),
        keterangan: item.keterangan,
      }));

      for (const item of mutasiItems) {
        await api.post(
          "/mutasi-stok/",
          {
            id_produk: Number(item.id_produk),
            id_lokasi_asal: Number(mutasiForm.id_lokasi_asal),
            id_lokasi_tujuan: Number(mutasiForm.id_lokasi_tujuan),
            qty: Number(item.qty),
            keterangan: item.keterangan,
          },
          { headers: getAuthHeaders() }
        );
      }

      setMutasiItems([]);
      closeMutasiModal();
      showAlert("success", "Mutasi berhasil dikirim!");
      window.location.reload(); // Refresh halaman setelah mut
    } catch (err) {
      showAlert("error", "Gagal melakukan mutasi stok.");
    }
  };

  // Tambahkan fungsi hapus di dalam komponen Stock
  const handleDelete = async (item) => {
    if (window.confirm(`Yakin ingin menghapus "${item.nama_produk}"?`)) {
      try {
        await api.delete(`/stok/${item.id_stok}`, {
          headers: getAuthHeaders(),
        });
        // Refresh data setelah hapus
        showAlert("success", "Barang berhasil dihapus");
        const res = await api.get("/stok/");
        setData(res.data.data);
      } catch (err) {
        showAlert("error", "Gagal menghapus barang.");
      }
    }
  };
  const scanInputRef = useRef(null);

  // Fokus otomatis ke input scan saat komponen dirender
  useEffect(() => {
    if (!addModalOpen && !modalOpen && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [addModalOpen, modalOpen]);

  // Tambahkan efek agar input barcode pada modal tambah otomatis terisi saat addModalOpen dan newItem.barcode berubah
  useEffect(() => {
    if (addModalOpen && newItem.barcode) {
      // Fokus ke input barcode jika ada barcode hasil scan
      const barcodeInput = document.querySelector('input[name="barcode"]');
      if (barcodeInput) {
        barcodeInput.focus();
        //barcodeInput.select();
      }
    }
  }, [addModalOpen, newItem.barcode]);

  // Tambahkan state dan fungsi search input di dalam komponen Stock
  const [search, setSearch] = useState("");

  // Fungsi untuk handle perubahan input search
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Filter data produk berdasarkan search (nama_produk, barcode, kategori, satuan)
  const filteredData = sortedData.filter(
    (item) =>
      (item.nama_produk &&
        item.nama_produk.toLowerCase().includes(search.toLowerCase())) ||
      (item.barcode &&
        item.barcode.toLowerCase().includes(search.toLowerCase())) ||
      (item.kategori &&
        item.kategori.toLowerCase().includes(search.toLowerCase())) ||
      (item.satuan && item.satuan.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="">
      {alert.show && (
        <div
          className={`fixed top-4 left-1/2 z-[9999] -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white text-sm font-semibold ${
            alert.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
          style={{ minWidth: 220, textAlign: "center" }}
        >
          {alert.message}
        </div>
      )}

      <h1 className="text-2xl font-bold pb-2">Stock</h1>
      <div className="bg-white rounded-[20px] py-4 px-6 shadow-md">
        <div className="flex items-center gap-4 mb-4">
          <p className="text-sm font-semibold">Daftar Stock Barang</p>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <IoQrCodeOutline size={20} className="text-[#FF4778]" />
            </span>
            <input
              ref={scanInputRef}
              type="text"
              placeholder="Scan/masukkan barcode..."
              className="border rounded-[10px] px-2 py-1.5 text-sm w-[210px] hover:border-[#FF4778] focus:outline-none focus:ring-2 focus:ring-[#FF4778] pl-8"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  const barcode = e.target.value.trim();
                  const existing = data.find(
                    (item) => item.barcode === barcode
                  );
                  if (existing) {
                    setEditItem(existing);
                    setModalOpen(true);
                  } else {
                    setNewItem((prev) => ({
                      ...prev,
                      barcode,
                    }));
                    setAddModalOpen(true);
                  }
                  e.target.value = "";
                }
              }}
            />
          </div>
          <form className="flex items-center gap-2">
            <label
              for="default-search"
              class="mb-2 text-sm font-medium text-gray-900 sr-only"
            >
              Search
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  class="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                class="block w-50 p-2 ps-10 text-sm text-gray-900 border border-[#FF4778] rounded-[15px] bg-gray-50 focus:ring-[#FF4778] focus:border-[#FF4778] "
                placeholder="Cari barang..."
                required
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            {role === "admin" && (
              <select
                value={selectedLokasi}
                onChange={(e) => setSelectedLokasi(e.target.value)}
                className="border border-[#FF4778] rounded-[15px] text-sm px-3 py-2 hover:border-[#FF4778] focus:outline-none focus:ring-2 focus:ring-[#FF4778]  capitalize"
              >
                {lokasiList.map((lokasi) => (
                  <option key={lokasi.id_lokasi} value={lokasi.id_lokasi}>
                    {lokasi.nama_lokasi}
                  </option>
                ))}
              </select>
            )}
          </form>
        </div>

        <div
          className="relative overflow-x-auto shadow-md sm:rounded-lg"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <table className="w-full text-[17px] text-left text-black">
              <thead className="text-md text-black uppercase bg-gray-50 z-50 sticky top-0">
                <tr>
                  <th className="px-0.5 py-0.5 text-center">No</th>
                  <th
                    className="px-0.5 py-0.5 cursor-pointer select-none"
                    onClick={() => handleSort("barcode")}
                  >
                    <div className="flex items-center">
                      Barcode
                      <SortIcon active={sortBy === "barcode"} asc={sortAsc} />
                    </div>
                  </th>
                  <th
                    className="px-0.5 py-0.5 cursor-pointer select-none"
                    onClick={() => handleSort("nama_produk")}
                  >
                    <div className="flex items-center">
                      Nama Barang
                      <SortIcon
                        active={sortBy === "nama_produk"}
                        asc={sortAsc}
                      />
                    </div>
                  </th>
                  <th className="px-0.5 py-0.5">Kategori</th>
                  <th className="px-0.5 py-0.5">Satuan</th>
                  <th className="px-0.5 py-0.5 text-center">Experied</th>
                  <th
                    className="px-0.5 py-0.5 cursor-pointer select-none"
                    onClick={() => handleSort("harga_beli")}
                  >
                    <div className="flex items-center">
                      Beli
                      <SortIcon
                        active={sortBy === "harga_beli"}
                        asc={sortAsc}
                      />
                    </div>
                  </th>
                  <th
                    className="px-1 py-0.5 cursor-pointer select-none"
                    onClick={() => handleSort("harga_jual")}
                  >
                    <div className="flex items-center">
                      Jual
                      <SortIcon
                        active={sortBy === "harga_jual"}
                        asc={sortAsc}
                      />
                    </div>
                  </th>

                  <th className="px-0.5 py-0.5 text-center">Optimal</th>
                  <th
                    className="px-1 py-0.5 cursor-pointer select-none"
                    onClick={() => handleSort("jumlah")}
                  >
                    <div className="flex items-center">
                      Stock
                      <SortIcon active={sortBy === "jumlah"} asc={sortAsc} />
                    </div>
                  </th>

                  <th className="px-0.5 py-0.5 text-center">Mutasi</th>
                  <th className="px-0.5 py-0.5 text-center">Edit</th>
                  <th className="px-0.5 py-0.5 text-center">Hapus</th>
                  <th className="px-0.5 py-0.5 text-center">Cetak</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr key={item.id || idx} className="bg-white border-b">
                      <td className="px-0.5 py-0.5 text-center">{idx + 1}</td>
                      <td className="px-0.5 py-0.5">{item.barcode}</td>
                      <td className="px-0.5 py-0.5 capitalize">
                        {item.nama_produk}
                      </td>
                      <td className="px-0.5 py-0.5 capitalize">
                        {item.kategori}
                      </td>
                      <td className="px-0.5 py-0.5 capitalize text-center">
                        {item.satuan}
                      </td>
                      <td className="px-0.5 py-0.5 text-center">
                        {item.expired_date
                          ? new Date(item.expired_date).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              }
                            )
                          : "-"}
                      </td>

                      <td className="px-1 py-1">
                        Rp.
                        {Number(item.harga_beli).toLocaleString("id-ID")}
                      </td>
                      <td className="px-0.5 py-0.5">
                        Rp.
                        {Number(item.harga_jual).toLocaleString("id-ID")}
                      </td>
                      <td className="px-0.5 py-0.5 text-center">
                        {item.stok_optimal}
                      </td>
                      <td
                        className={`px-0.5 py-0.5 text-center font-semibold ${
                          item.jumlah < item.stok_optimal
                            ? "text-red-600"
                            : "text-gray-700"
                        }`}
                      >
                        {item.jumlah}
                      </td>

                      {/* Kolom Mutasi */}
                      <td className="px-0.5 py-0.5 text-center">
                        {!readOnly && (
                          <button
                            className="bg-[#FF4778] hover:bg-[#FF87A7] text-white px-1 py-1 rounded-[10px] text-xs"
                            onClick={() => handleAddToMutasi(item)}
                            title="Mutasi"
                          >
                            <FaExchangeAlt />
                          </button>
                        )}
                      </td>

                      {/* Kolom Edit */}
                      <td className="px-0.5 py-0.5 text-center">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-1 py-1 rounded-[10px] text-xs"
                          onClick={() => openEditModal(item)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                      </td>

                      {/* Kolom Hapus */}
                      <td className="px-0.5 py-0.5 text-center">
                        {!readOnly && (
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-1 py-1 rounded-[10px] text-xs"
                            onClick={() => handleDelete(item)}
                            title="Hapus"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>

                      <td className="px-0.5 py-0.5">
                        <input
                          type="checkbox"
                          className="ml-1 mr-1"
                          checked={selectedToPrint.some(
                            (x) => x.id_stok === item.id_stok
                          )}
                          onChange={() => handleCheckboxChange(item)}
                        />

                        {selectedToPrint.find(
                          (x) => x.id_stok === item.id_stok
                        ) && (
                          <input
                            type="number"
                            min="1"
                            value={
                              selectedToPrint.find(
                                (x) => x.id_stok === item.id_stok
                              )?.jumlah ?? ""
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setSelectedToPrint((prev) =>
                                prev.map((x) =>
                                  x.id_stok === item.id_stok
                                    ? { ...x, jumlah: value }
                                    : x
                                )
                              );
                            }}
                            className="w-12 text-xs border rounded px-1"
                            placeholder="Qty"
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-2">
            <button
              className="bg-[#FF4778] p-2 rounded-[10px] text-xs text-white hover:bg-[#FF87A7]"
              onClick={openAddModal}
            >
              Tambah Stock Barang
            </button>

            {!readOnly && (
              <button
                className="bg-green-400 p-2 rounded-[10px] text-xs text-white hover:bg-green-600"
                onClick={openLihatMutasi}
              >
                Lihat Data Mutasi
              </button>
            )}
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded-[10px] text-sm hover:bg-blue-700"
              onClick={handlePrintSelected}
            >
              Cetak Barcode (Produk Dipilih)
            </button>
          </div>
        </div>
        <div className="bg-white border border-[#FF4778] rounded-lg p-2 shadow-md mt-4">
          <div
            className="relative overflow-x-auto"
            style={{ maxHeight: "170px", overflowY: "auto" }}
          >
            {mutasiItems.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                Produk yang dimutasi muncul disini
              </div>
            ) : (
              <>
                <table className="w-full text-sm text-left text-gray-500">
                  <thead>
                    <tr>
                      <th className="px-0.5 py-0.5">Nama Produk</th>
                      <th className="px-0.5 py-0.5">Qty Mutasi</th>
                      <th className="px-0.5 py-0.5">Satuan</th>
                      <th className="px-0.5 py-0.5">Harga Jual</th>
                      <th className="px-0.5 py-0.5">Keterangan</th>
                      <th className="px-0.5 py-0.5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mutasiItems.map((item, idx) => (
                      <tr key={idx} className="bg-gray-200">
                        <td className="px-0.5 py-0.5">{item.nama_produk}</td>
                        <td className="px-0.5 py-0.5">
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) =>
                              handleMutasiQtyChange(idx, e.target.value)
                            }
                            className="w-16 border rounded px-1 py-0.5 text-center"
                          />
                        </td>
                        <td className="px-0.5 py-0.5">{item.satuan}</td>
                        <td className="px-0.5 py-0.5">Rp.{item.harga_jual}</td>
                        <td className="px-0.5 py-0.5">
                          <input
                            type="text"
                            value={item.keterangan || ""}
                            onChange={(e) =>
                              setMutasiItems((prev) =>
                                prev.map((itm, i) =>
                                  i === idx
                                    ? { ...itm, keterangan: e.target.value }
                                    : itm
                                )
                              )
                            }
                            className="w-32 border rounded px-1 py-0.5"
                            placeholder="Keterangan"
                            required
                          />
                        </td>
                        <td className="px-0.5 py-0.5">
                          <button
                            className="bg-white hover:bg-gray-300 text-black px-2 py-1 rounded text-xs"
                            onClick={() => handleHapusMutasi(idx)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-2">
                  <button
                    className="bg-[#FF4778] hover:bg-green-600 text-white px-4 py-1 rounded text-xs"
                    onClick={openMutasiModal}
                  >
                    Kirim
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Tambah Stock Barang</h2>
            </div>
            <p className="text-xs mb-4 text-gray-400">
              Tambahkan detail barang
            </p>
            <form
              onSubmit={handleAddSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              <InputField
                label="Nama Barang"
                name="nama_produk"
                value={newItem.nama_produk}
                onChange={handleAddChange}
                required
              />
              <InputField
                label="Barcode"
                name="barcode"
                value={newItem.barcode}
                onChange={handleAddChange}
              />
              <InputField
                label="Kategori"
                name="kategori"
                value={newItem.kategori}
                onChange={handleAddChange}
                required
              />
              <InputField
                label="Satuan"
                name="satuan"
                value={newItem.satuan}
                onChange={handleAddChange}
                required
              />
              <InputField
                label="Harga Beli"
                name="harga_beli"
                type="number"
                value={newItem.harga_beli}
                onChange={handleAddChange}
                required
              />
              <InputField
                label="Harga Jual"
                name="harga_jual"
                type="number"
                value={newItem.harga_jual}
                onChange={handleAddChange}
                required
              />
              <InputField
                label="Expired Date"
                name="expired_date"
                type="date"
                value={newItem.expired_date}
                onChange={handleAddChange}
              />
              <InputField
                label="Stok Optimal"
                name="stok_optimal"
                type="number"
                value={newItem.stok_optimal}
                onChange={handleAddChange}
              />
              <InputField
                label="Jumlah Stock"
                name="jumlah"
                type="number"
                value={newItem.jumlah}
                onChange={handleAddChange}
                required
              />

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="text-sm px-4 py-1 rounded-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-sm rounded-[10px] bg-[#FF4778] hover:bg-green-600 text-white"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold">Edit Stock Barang</h2>
            <p className="text-xs mb-4 text-gray-400">Ubah detail barang</p>
            <form
              onSubmit={handleEditSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              <EditField
                label="Nama Barang"
                name="nama_produk"
                value={editItem.nama_produk}
                onChange={handleEditChange}
                readOnly={readOnly}
                required
              />
              <EditField
                label="Barcode"
                name="barcode"
                value={editItem.barcode}
                onChange={handleEditChange}
                readOnly={readOnly}
              />
              <EditField
                label="Kategori"
                name="kategori"
                value={editItem.kategori}
                onChange={handleEditChange}
                readOnly={readOnly}
                required
              />
              <EditField
                label="Satuan"
                name="satuan"
                value={editItem.satuan}
                onChange={handleEditChange}
                readOnly={readOnly}
                required
              />
              <EditField
                label="Harga Beli"
                name="harga_beli"
                type="number"
                value={editItem.harga_beli}
                onChange={handleEditChange}
                readOnly={readOnly}
                required
              />
              <EditField
                label="Harga Jual"
                name="harga_jual"
                type="number"
                value={editItem.harga_jual}
                onChange={handleEditChange}
                readOnly={readOnly}
                required
              />
              <EditField
                label="Expired Date"
                name="expired_date"
                type="date"
                value={editItem.expired_date}
                onChange={handleEditChange}
                readOnly={readOnly}
              />
              <EditField
                label="Stok Optimal"
                name="stok_optimal"
                type="number"
                value={editItem.stok_optimal}
                onChange={handleEditChange}
                readOnly={readOnly}
              />
              <EditField
                label="Jumlah Stock"
                name="jumlah"
                type="number"
                value={editItem.jumlah}
                onChange={handleEditChange}
                required
                readOnly={false}
              />

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-1 text-sm rounded-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-sm rounded-[10px] bg-[#FF4778] hover:bg-green-600 text-white"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mutasi Stock */}
      {mutasiModalOpen && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Mutasi Stock</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-xs mb-1">Lokasi Asal</label>
                <select
                  name="id_lokasi_asal"
                  value={mutasiForm.id_lokasi_asal}
                  onChange={handleMutasiChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                >
                  <option value="">Pilih Lokasi Asal</option>
                  {lokasiList.map((lokasi) => (
                    <option key={lokasi.id_lokasi} value={lokasi.id_lokasi}>
                      {lokasi.nama_lokasi}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Lokasi Tujuan</label>
                <select
                  name="id_lokasi_tujuan"
                  value={mutasiForm.id_lokasi_tujuan}
                  onChange={handleMutasiChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                >
                  <option value="">Pilih Lokasi Tujuan</option>
                  {lokasiList.map((lokasi) => (
                    <option key={lokasi.id_lokasi} value={lokasi.id_lokasi}>
                      {lokasi.nama_lokasi}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeMutasiModal}
                  className="text-sm px-4 py-1 rounded-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-sm rounded-[10px] bg-[#FF4778] hover:bg-green-600 text-white"
                  onClick={handleMutasiSubmit}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lihat Data Mutasi */}
      {lihatMutasiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Data Mutasi Stock</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closeLihatMutasi}
              >
                <IoClose size={24} />
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <input
                type="date"
                name="tanggal_awal"
                value={filterMutasi.tanggal_awal}
                onChange={handleFilterMutasiChange}
                className="border rounded px-2 py-1 text-xs"
                placeholder="Tanggal Awal"
              />
              <input
                type="date"
                name="tanggal_akhir"
                value={filterMutasi.tanggal_akhir}
                onChange={handleFilterMutasiChange}
                className="border rounded px-2 py-1 text-xs"
                placeholder="Tanggal Akhir"
              />
              <select
                name="id_lokasi_asal"
                value={filterMutasi.id_lokasi_asal}
                onChange={handleFilterMutasiChange}
                className="border rounded px-2 py-1 text-xs"
              >
                <option value="">Lokasi Asal</option>
                {lokasiList.map((lokasi) => (
                  <option key={lokasi.id_lokasi} value={lokasi.id_lokasi}>
                    {lokasi.nama_lokasi}
                  </option>
                ))}
              </select>
              <select
                name="id_lokasi_tujuan"
                value={filterMutasi.id_lokasi_tujuan}
                onChange={handleFilterMutasiChange}
                className="border rounded px-2 py-1 text-xs"
              >
                <option value="">Lokasi Tujuan</option>
                {lokasiList.map((lokasi) => (
                  <option key={lokasi.id_lokasi} value={lokasi.id_lokasi}>
                    {lokasi.nama_lokasi}
                  </option>
                ))}
              </select>
              <select
                name="id_produk"
                value={filterMutasi.id_produk}
                onChange={handleFilterMutasiChange}
                className="border rounded px-2 py-1 text-xs"
              >
                <option value="">Pilih Produk</option>
                {produkList.map((produk) => (
                  <option key={produk.id_produk} value={produk.id_produk}>
                    {produk.nama_produk}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="relative overflow-x-auto"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {loadingMutasi ? (
                <div className="text-center py-8">Memuat data mutasi...</div>
              ) : dataMutasi.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Tidak ada data mutasi
                </div>
              ) : (
                <table className="w-full text-sm text-left text-gray-500">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">Tanggal</th>
                      <th className="px-2 py-1">Nama Produk</th>
                      <th className="px-2 py-1">Qty</th>
                      <th className="px-2 py-1">Satuan</th>
                      <th className="px-2 py-1">Lokasi Asal</th>
                      <th className="px-2 py-1">Lokasi Tujuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataMutasi.map((item, idx) => (
                      <tr key={idx} className="bg-gray-100">
                        <td className="px-2 py-1">{item.tanggal}</td>
                        <td className="px-2 py-1">{item.nama_produk}</td>
                        <td className="px-2 py-1">{item.qty}</td>
                        <td className="px-2 py-1">{item.satuan}</td>
                        <td className="px-2 py-1">{item.lokasi_asal}</td>
                        <td className="px-2 py-1">{item.lokasi_tujuan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
