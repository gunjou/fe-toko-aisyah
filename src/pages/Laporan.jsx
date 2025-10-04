import React, { useEffect, useState } from "react";
import { FaBoxOpen, FaClipboardList, FaShoppingCart } from "react-icons/fa";
import api from "../utils/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";

const Laporan = () => {
  const navigate = useNavigate(); // tambahkan ini
  const [activeTab, setActiveTab] = useState("item");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // State untuk data laporan
  const [dataItem, setDataItem] = useState([]);
  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [dataStok, setDataStok] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State filter
  const [lokasiList, setLokasiList] = useState([]);
  const [produkList, setProdukList] = useState([]);

  const [filterLokasi, setFilterLokasi] = useState("");
  const [filterProduk, setFilterProduk] = useState("");

  const [filterPeriode, setFilterPeriode] = useState("hari_ini");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");

  const [filterPeriodeTransaksi, setFilterPeriodeTransaksi] = useState("today");
  const [tanggalAwalTransaksi, setTanggalAwalTransaksi] = useState("");
  const [tanggalAkhirTransaksi, setTanggalAkhirTransaksi] = useState("");

  const [periodeKey, setPeriodeKey] = useState(0);
  const [periodeTransaksiKey, setPeriodeTransaksiKey] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState("nama_produk");
  const [sortAsc, setSortAsc] = useState(true);

  // Fetch data lokasi & produk untuk filter (sekali saja)
  useEffect(() => {
    api
      .get("/lokasi/", { headers: getAuthHeaders() })
      .then((res) => setLokasiList(res.data || []))
      .catch(() => setLokasiList([]));

    const produkEndpoint =
      activeTab === "stok"
        ? "/laporan/filter/produk-tersedia"
        : "/laporan/filter/produk-terjual";

    api
      .get(produkEndpoint, { headers: getAuthHeaders() })
      .then((res) => setProdukList(res.data.data || []))
      .catch(() => setProdukList([]));
  }, [activeTab]);

  // Fetch data sesuai tab & filter
  useEffect(() => {
    setLoading(true);
    setError(null);
    if (activeTab === "item") {
      let params = {};
      if (filterLokasi) params.id_lokasi = filterLokasi;
      if (filterProduk) params.id_produk = filterProduk;
      if (filterPeriode) params.periode = filterPeriode;
      if (tanggalAwal) params.start_date = tanggalAwal;
      if (tanggalAkhir) params.end_date = tanggalAkhir;

      api
        .get("/laporan/penjualan-item", { params, headers: getAuthHeaders() })
        .then((res) => {
          setDataItem(Array.isArray(res.data?.data) ? res.data.data : []);
          if (!res.data?.data || res.data.data.length === 0) {
            setError("Tidak ada data ditemukan");
          }
        })
        .catch(() => {
          setDataItem([]);
          setError("Gagal mengambil data");
        })
        .finally(() => setLoading(false));
    } else if (activeTab === "transaksi") {
      const params = {};
      if (filterPeriodeTransaksi) params.periode = filterPeriodeTransaksi;
      if (tanggalAwalTransaksi) params.start_date = tanggalAwalTransaksi;
      if (tanggalAkhirTransaksi) params.end_date = tanggalAkhirTransaksi;

      api
        .get("/laporan/transaksi", { params, headers: getAuthHeaders() })
        .then((res) => {
          setDataTransaksi(Array.isArray(res.data?.data) ? res.data.data : []);
          if (!res.data?.data || res.data.data.length === 0) {
            setError("Tidak ada data ditemukan");
          }
        })
        .catch(() => {
          setDataTransaksi([]);
          setError("Gagal mengambil data");
        })
        .finally(() => setLoading(false));
    } else if (activeTab === "stok") {
      const params = {};
      if (filterLokasi) params.id_lokasi = Number(filterLokasi);
      if (filterProduk) params.id_produk = Number(filterProduk);
      api
        .get("/laporan/stok", {
          params,
          headers: getAuthHeaders(),
        })
        .then((res) => {
          setDataStok(Array.isArray(res.data?.data) ? res.data.data : []);
          if (!res.data?.data || res.data.data.length === 0) {
            setError("Tidak ada data ditemukan");
          }
        })
        .catch(() => {
          setDataStok([]);
          setError("Gagal mengambil data");
        })
        .finally(() => setLoading(false));
    }
  }, [
    activeTab,
    filterLokasi,
    filterProduk,
    filterPeriode,
    tanggalAwal,
    tanggalAkhir,
    filterPeriodeTransaksi,
    tanggalAwalTransaksi,
    tanggalAkhirTransaksi,
    periodeKey,
    periodeTransaksiKey,
  ]);

  const periodeOptions = [
    { label: "Semua", value: "" },
    { label: "Hari Ini", value: "hari_ini" },
    { label: "Minggu Ini", value: "minggu_ini" },
    { label: "Bulan Ini", value: "bulan_ini" },
    { label: "Pilih Tanggal", value: "range" },
  ];

  const periodeTransaksiOptions = [
    { label: "Hari Ini", value: "today" },
    { label: "Minggu Ini", value: "this_week" },
    { label: "Bulan Ini", value: "this_month" },
    { label: "Pilih Tanggal", value: "range" },
  ];

  useEffect(() => {
    if (filterPeriode !== "range") {
      setTanggalAwal("");
      setTanggalAkhir("");
    }
  }, [filterPeriode]);

  useEffect(() => {
    if (filterPeriodeTransaksi !== "range") {
      setTanggalAwalTransaksi("");
      setTanggalAkhirTransaksi("");
    }
  }, [filterPeriodeTransaksi]);

  // Sorting function
  const filteredStok = dataStok.filter((item) => {
    const matchLokasi = !filterLokasi || item.id_lokasi === filterLokasi;
    const matchProduk = !filterProduk || item.id_produk === filterProduk;
    return matchLokasi && matchProduk;
  });

  const sortedData =
    activeTab === "stok"
      ? [...dataStok].sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return sortAsc ? -1 : 1;
          if (a[sortBy] > b[sortBy]) return sortAsc ? 1 : -1;
          return 0;
        })
      : activeTab === "item"
      ? [...dataItem].sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return sortAsc ? -1 : 1;
          if (a[sortBy] > b[sortBy]) return sortAsc ? 1 : -1;
          return 0;
        })
      : [...dataTransaksi].sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return sortAsc ? -1 : 1;
          if (a[sortBy] > b[sortBy]) return sortAsc ? 1 : -1;
          return 0;
        });

  // Icon SVG
  const SortIcon = ({ active, asc }) => (
    <svg
      className={`w-3 h-3 ms-1.5 inline ${
        active ? "text-[#344c36]" : "text-gray-400"
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

  // Handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  // Fungsi unduh PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    if (typeof doc.autoTable !== "function") {
      alert("jspdf-autotable belum terpasang dengan benar!");
      return;
    }

    const lokasiNama =
      lokasiList.find((l) => l.id_lokasi === filterLokasi)?.nama_lokasi ||
      "Semua Lokasi";
    const produkNama =
      produkList.find((p) => p.id_produk === filterProduk)?.nama_produk ||
      "Semua Produk";
    const periodeText =
      activeTab === "transaksi"
        ? periodeTransaksiOptions.find(
            (opt) => opt.value === filterPeriodeTransaksi
          )?.label || "-"
        : periodeOptions.find((opt) => opt.value === filterPeriode)?.label ||
          "-";

    let periodeDetail = `Periode: ${periodeText}`;
    if (
      (activeTab === "item" && filterPeriode === "range") ||
      (activeTab === "transaksi" && filterPeriodeTransaksi === "range")
    ) {
      const start = activeTab === "item" ? tanggalAwal : tanggalAwalTransaksi;
      const end = activeTab === "item" ? tanggalAkhir : tanggalAkhirTransaksi;
      periodeDetail += ` (${start || "-"} s/d ${end || "-"})`;
    }

    let title = "";
    let columns = [];
    let rows = [];
    let ringkasan = [];

    if (activeTab === "item") {
      title = "Laporan Penjualan Item";
      columns = [
        { header: "No", dataKey: "no" },
        { header: "Nama Produk", dataKey: "nama_produk" },
        { header: "Satuan", dataKey: "satuan" },
        // { header: "Lokasi", dataKey: "nama_lokasi" },
        { header: "Total Qty", dataKey: "total_qty" },
        { header: "Harga Beli", dataKey: "harga_beli" },
        { header: "Harga Jual", dataKey: "harga_jual" },
        { header: "SubTotal", dataKey: "subtotal" },
        { header: "Modal", dataKey: "modal" },
        { header: "Keuntungan", dataKey: "keuntungan" },
      ];
      rows = sortedData.map((item, idx) => ({
        no: idx + 1,
        nama_produk: item.nama_produk,
        satuan: item.satuan,
        //  nama_lokasi: item.nama_lokasi,
        total_qty: item.total_qty,
        harga_beli: `Rp. ${item.harga_beli?.toLocaleString("id-ID")}`,
        harga_jual: `Rp. ${item.harga_jual?.toLocaleString("id-ID")}`,
        subtotal: `Rp. ${item.subtotal?.toLocaleString("id-ID")}`,
        modal: `Rp. ${item.modal?.toLocaleString("id-ID")}`,
        keuntungan: `Rp. ${item.keuntungan?.toLocaleString("id-ID")}`,
      }));
      ringkasan = [
        ["Total Jenis Produk Terjual", `${sortedData.length} Produk`],
        [
          "Total Qty Terjual",
          `${sortedData.reduce(
            (a, b) => a + (Number(b.total_qty) || 0),
            0
          )} Produk`,
        ],
        [
          "Total Keuntungan",
          `Rp. ${sortedData
            .reduce((a, b) => a + (Number(b.keuntungan) || 0), 0)
            .toLocaleString("id-ID")}`,
        ],
      ];
    } else if (activeTab === "transaksi") {
      title = "Laporan Transaksi Penjualan";
      columns = [
        { header: "No", dataKey: "no" },
        { header: "Tanggal", dataKey: "tanggal" },
        { header: "Total", dataKey: "total" },
        { header: "Tunai", dataKey: "tunai" },
        { header: "Kembalian", dataKey: "kembalian" },
        { header: "Hutang", dataKey: "sisa_hutang" },
        { header: "Modal", dataKey: "modal" },
        { header: "Keuntungan", dataKey: "keuntungan" },
      ];
      rows = sortedData.map((item, idx) => ({
        no: idx + 1,
        tanggal: item.tanggal,
        total: `Rp. ${Number(item.total || 0).toLocaleString("id-ID")}`,
        tunai: `Rp. ${Number(item.tunai || 0).toLocaleString("id-ID")}`,
        kembalian: `Rp. ${Number(item.kembalian || 0).toLocaleString("id-ID")}`,
        sisa_hutang: `Rp. ${Number(item.sisa_hutang || 0).toLocaleString(
          "id-ID"
        )}`,
        modal: `Rp. ${Number(item.modal || 0).toLocaleString("id-ID")}`,
        keuntungan: `Rp. ${Number(item.keuntungan || 0).toLocaleString(
          "id-ID"
        )}`,
      }));
      ringkasan = [
        [
          "Total Transaksi",
          `Rp. ${sortedData
            .reduce((a, b) => a + (Number(b.total) || 0), 0)
            .toLocaleString("id-ID")}`,
        ],
        [
          "Total Hutang",
          `Rp. ${sortedData
            .reduce((a, b) => a + (Number(b.sisa_hutang) || 0), 0)
            .toLocaleString("id-ID")}`,
        ],
        [
          "Total Keuntungan",
          `Rp. ${sortedData
            .reduce((a, b) => a + (Number(b.keuntungan) || 0), 0)
            .toLocaleString("id-ID")}`,
        ],
      ];
    } else if (activeTab === "stok") {
      title = "Laporan Stok Barang";
      columns = [
        { header: "No", dataKey: "no" },
        { header: "Nama Produk", dataKey: "nama_produk" },
        { header: "Satuan", dataKey: "satuan" },
        { header: "Expired", dataKey: "expired_date" },
        { header: "Lokasi", dataKey: "nama_lokasi" },
        { header: "Harga Beli", dataKey: "harga_beli" },
        { header: "Harga Jual", dataKey: "harga_jual" },
        { header: "Stok Optimal", dataKey: "stok_optimal" },
        { header: "Sisa Stok", dataKey: "sisa_stok" },
        { header: "Nilai Modal", dataKey: "nilai_modal" },
        { header: "Potensi Keuntungan", dataKey: "potensi_keuntungan" },
      ];
      rows = sortedData.map((item, idx) => ({
        no: idx + 1,
        nama_produk: item.nama_produk,
        satuan: item.satuan,
        expired_date: item.expired_date,
        nama_lokasi: item.nama_lokasi,
        harga_beli: `Rp. ${Number(item.harga_beli || 0).toLocaleString(
          "id-ID"
        )}`,
        harga_jual: `Rp. ${Number(item.harga_jual || 0).toLocaleString(
          "id-ID"
        )}`,
        stok_optimal: `${Number(item.stok_optimal || 0).toLocaleString(
          "id-ID"
        )}`,
        sisa_stok: `${Number(item.sisa_stok || 0).toLocaleString("id-ID")}`,
        nilai_modal: `Rp. ${Number(item.nilai_modal || 0).toLocaleString(
          "id-ID"
        )}`,
        potensi_keuntungan: `Rp. ${Number(
          item.potensi_keuntungan || 0
        ).toLocaleString("id-ID")}`,
      }));
      ringkasan = [
        [
          "Total Modal",
          `Rp. ${sortedData
            .reduce((a, b) => a + (Number(b.nilai_modal) || 0), 0)
            .toLocaleString("id-ID")}`,
        ],
        [
          "Total Potensi Keuntungan",
          `Rp. ${sortedData
            .reduce((a, b) => a + (Number(b.potensi_keuntungan) || 0), 0)
            .toLocaleString("id-ID")}`,
        ],
      ];
    }

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.text(title, 14, 14);

    // Filter
    doc.setFontSize(10);
    doc.text(`Periode: ${periodeText}`, 14, 22);

    if (activeTab !== "transaksi") {
      doc.text(`Lokasi: ${lokasiNama}`, 14, 28);
      doc.text(`Produk: ${produkNama}`, 14, 34);
    }

    const startY = activeTab === "transaksi" ? 28 : 40;

    // Tabel
    doc.autoTable({
      startY,
      columns,
      body: rows,
      styles: { fontSize: 9, overflow: "linebreak", cellPadding: 2 },
      headStyles: { fillColor: [30, 104, 109] },
      theme: "grid",
    });

    // Ringkasan kanan bawah
    let finalY = doc.lastAutoTable.finalY + 10;
    const labelX = pageWidth - 100;
    const valueX = pageWidth - 20;

    doc.setFontSize(11);
    doc.text("", labelX, finalY);
    finalY += 6;

    ringkasan.forEach(([label, value]) => {
      doc.text(`${label}`, labelX, finalY);
      doc.text(`${value}`, valueX, finalY, { align: "right" });
      finalY += 6;
    });

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  };

  // Cek akses admin-only saat mount
  useEffect(() => {
    api.get("/auth/admin-only", { headers: getAuthHeaders() }).catch(() => {
      alert("Akses hanya untuk admin!");
      navigate("/kasir");
    });
  }, []);

  return (
    <div className="">
      <h1 className="text-2xl font-bold pb-2">Laporan</h1>
      <div className="flex gap-6 mb-6">
        {/* Card Laporan Item */}
        <div
          className={`flex-1 cursor-pointer rounded-xl shadow-md p-6 flex flex-col items-center transition border-2 ${
            activeTab === "item"
              ? "border-[#344c36] bg-[#e6f6f7]"
              : "border-gray-200 bg-white"
          }`}
          onClick={() => setActiveTab("item")}
        >
          <FaShoppingCart size={36} className="mb-2 text-[#344c36]" />
          <div className="font-semibold text-lg">Laporan Item</div>
          <div className="text-xs text-gray-500 text-center">
            Penjualan per produk
          </div>
        </div>
        {/* Card Laporan Transaksi */}
        <div
          className={`flex-1 cursor-pointer rounded-xl shadow-md p-6 flex flex-col items-center transition border-2 ${
            activeTab === "transaksi"
              ? "border-[#344c36] bg-[#e6f6f7]"
              : "border-gray-200 bg-white"
          }`}
          onClick={() => setActiveTab("transaksi")}
        >
          <FaClipboardList size={36} className="mb-2 text-[#344c36]" />
          <div className="font-semibold text-lg">Laporan Transaksi</div>
          <div className="text-xs text-gray-500 text-center">
            Rekap transaksi penjualan
          </div>
        </div>
        {/* Card Laporan Stok */}
        <div
          className={`flex-1 cursor-pointer rounded-xl shadow-md p-6 flex flex-col items-center transition border-2 ${
            activeTab === "stok"
              ? "border-[#344c36] bg-[#e6f6f7]"
              : "border-gray-200 bg-white"
          }`}
          onClick={() => setActiveTab("stok")}
        >
          <FaBoxOpen size={36} className="mb-2 text-[#344c36]" />
          <div className="font-semibold text-lg">Laporan Stok</div>
          <div className="text-xs text-gray-500 text-center">
            Stok barang terkini
          </div>
        </div>
      </div>

      {/* Tombol Unduh PDF */}
      <div className="flex justify-end mb-2">
        <button
          className="bg-[#344c36] hover:bg-[#2a3b29] text-white px-4 py-2 rounded-lg text-sm font-semibold"
          onClick={handleDownloadPDF}
        >
          Unduh PDF
        </button>
      </div>

      <div className="bg-white rounded-[20px] py-4 px-6 shadow-md">
        {activeTab === "item" && (
          <div>
            <div className="flex flex-wrap gap-4 mb-4">
              {/* Lokasi */}
              <div>
                <label className="block text-xs mb-1">Lokasi</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterLokasi}
                  onChange={(e) => setFilterLokasi(e.target.value)}
                >
                  <option value="">Semua Lokasi</option>
                  {lokasiList.map((lokasi) => (
                    <option key={lokasi.id_lokasi} value={lokasi.id_lokasi}>
                      {lokasi.nama_lokasi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Produk */}
              <div>
                <label className="block text-xs mb-1">Produk</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterProduk}
                  onChange={(e) => setFilterProduk(e.target.value)}
                >
                  <option value="">Semua Produk</option>
                  {produkList.map((produk) => (
                    <option key={produk.id_produk} value={produk.id_produk}>
                      {produk.nama_produk}
                    </option>
                  ))}
                </select>
              </div>

              {/* Periode */}
              <div>
                <label className="block text-xs mb-1">Periode</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterPeriode}
                  onChange={(e) => {
                    setFilterPeriode(e.target.value);
                    setPeriodeKey((prev) => prev + 1);
                  }}
                >
                  {periodeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal jika Range */}
              {filterPeriode === "range" && (
                <>
                  <div>
                    <label className="block text-xs mb-1">Tanggal Awal</label>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm"
                      value={tanggalAwal}
                      onChange={(e) => setTanggalAwal(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Tanggal Akhir</label>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm"
                      value={tanggalAkhir}
                      onChange={(e) => setTanggalAkhir(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Tabel Laporan Item */}
            <div
              className="relative overflow-x-auto shadow-md sm:rounded-lg border border-[#344c36]"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 z-50 sticky top-0">
                  <tr>
                    <th className="px-1 py-2 text-center">No</th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("nama_produk")}
                    >
                      <div className="flex items-center">
                        Nama Produk
                        <SortIcon
                          active={sortBy === "nama_produk"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("satuan")}
                    >
                      <div className="flex items-center">
                        Satuan
                        <SortIcon active={sortBy === "satuan"} asc={sortAsc} />
                      </div>
                    </th>

                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("total_qty")}
                    >
                      <div className="flex items-center">
                        Total Qty
                        <SortIcon
                          active={sortBy === "total_qty"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("harga_beli")}
                    >
                      <div className="flex items-center">
                        Harga Beli
                        <SortIcon
                          active={sortBy === "harga_beli"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("harga_jual")}
                    >
                      <div className="flex items-center">
                        Harga Jual
                        <SortIcon
                          active={sortBy === "harga_jual"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("subtotal")}
                    >
                      <div className="flex items-center">
                        SubTotal
                        <SortIcon
                          active={sortBy === "subtotal"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("modal")}
                    >
                      <div className="flex items-center">
                        Modal
                        <SortIcon active={sortBy === "modal"} asc={sortAsc} />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("keuntungan")}
                    >
                      <div className="flex items-center">
                        Keuntungan
                        <SortIcon
                          active={sortBy === "keuntungan"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-4 text-red-500 font-semibold"
                      >
                        Tidak ada data ditemukan
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((item, idx) => (
                      <tr key={idx} className="bg-white border-b">
                        <td className="px-1 py-1 text-center">{idx + 1}</td>
                        <td className="px-1 py-1 capitalize">
                          {item.nama_produk}
                        </td>
                        <td className="px-1 py-1 capitalize">{item.satuan}</td>
                        <td className="px-1 py-1">{item.total_qty}</td>
                        <td className="px-1 py-1">{`Rp. ${item.harga_beli?.toLocaleString(
                          "id-ID"
                        )}`}</td>
                        <td className="px-1 py-1">{`Rp. ${item.harga_jual?.toLocaleString(
                          "id-ID"
                        )}`}</td>
                        <td className="px-1 py-1">{`Rp. ${item.subtotal?.toLocaleString(
                          "id-ID"
                        )}`}</td>
                        <td className="px-1 py-1">{`Rp. ${item.modal?.toLocaleString(
                          "id-ID"
                        )}`}</td>
                        <td className="px-1 py-1">{`Rp. ${item.keuntungan?.toLocaleString(
                          "id-ID"
                        )}`}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Total Keuntungan & Ringkasan */}
            <div className="mt-3 flex justify-end">
              <table className="w-auto text-sm text-left">
                <tbody>
                  <tr>
                    <td className="pr-4 font-semibold">
                      Total Jenis Produk Terjual
                    </td>
                    <td>: </td>
                    <td className="font-bold">
                      {sortedData.length === 0 ? (
                        <span className="text-red-600">-</span>
                      ) : (
                        sortedData.length
                      )}{" "}
                      Produk
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-semibold">
                      Total Banyak Produk Terjual
                    </td>
                    <td>: </td>
                    <td className="font-bold">
                      {sortedData.reduce(
                        (acc, item) => acc + (Number(item.total_qty) || 0),
                        0
                      ) === 0 ? (
                        <span className="text-red-600">-</span>
                      ) : (
                        sortedData.reduce(
                          (acc, item) => acc + (Number(item.total_qty) || 0),
                          0
                        )
                      )}{" "}
                      Produk
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-semibold">Total Keuntungan</td>
                    <td>: </td>
                    <td className="font-bold">
                      {sortedData.reduce(
                        (acc, item) => acc + (Number(item.keuntungan) || 0),
                        0
                      ) === 0 ? (
                        <span className="text-red-600">-</span>
                      ) : (
                        "Rp. " +
                        sortedData
                          .reduce(
                            (acc, item) => acc + (Number(item.keuntungan) || 0),
                            0
                          )
                          .toLocaleString("id-ID")
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "transaksi" && (
          <div>
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-xs mb-1">Periode</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterPeriodeTransaksi}
                  onChange={(e) => {
                    setFilterPeriodeTransaksi(e.target.value);
                    setPeriodeTransaksiKey((prev) => prev + 1);
                  }}
                >
                  {periodeTransaksiOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {filterPeriodeTransaksi === "range" && (
                <>
                  <div>
                    <label className="block text-xs mb-1">Tanggal Awal</label>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm"
                      value={tanggalAwalTransaksi}
                      onChange={(e) => setTanggalAwalTransaksi(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Tanggal Akhir</label>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm"
                      value={tanggalAkhirTransaksi}
                      onChange={(e) => setTanggalAkhirTransaksi(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div
              className="relative overflow-x-auto shadow-md sm:rounded-lg border border-[#344c36]"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 z-50 sticky top-0">
                  <tr>
                    <th className="px-1 py-2 text-center">No</th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("tanggal")}
                    >
                      <div className="flex items-center">
                        Tanggal
                        <SortIcon active={sortBy === "tanggal"} asc={sortAsc} />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("total")}
                    >
                      <div className="flex items-center">
                        Total Belanja
                        <SortIcon active={sortBy === "total"} asc={sortAsc} />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("tunai")}
                    >
                      <div className="flex items-center">
                        Bayar
                        <SortIcon active={sortBy === "tunai"} asc={sortAsc} />
                      </div>
                    </th>
                    {/* <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("kembalian")}
                    >
                      <div className="flex items-center">
                        Kembalian
                        <SortIcon
                          active={sortBy === "kembalian"}
                          asc={sortAsc}
                        />
                      </div>
                    </th> */}
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("sisa_hutang")}
                    >
                      <div className="flex items-center">
                        Hutang
                        <SortIcon
                          active={sortBy === "sisa_hutang"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("modal")}
                    >
                      <div className="flex items-center">
                        Modal
                        <SortIcon active={sortBy === "modal"} asc={sortAsc} />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("keuntungan")}
                    >
                      <div className="flex items-center">
                        Keuntungan
                        <SortIcon
                          active={sortBy === "keuntungan"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-4 text-red-500 font-semibold"
                      >
                        Tidak ada data ditemukan
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((item, idx) => (
                      <tr key={idx} className="bg-white border-b">
                        <td className="px-1 py-1 text-center">{idx + 1}</td>
                        <td className="px-1 py-1">{item.tanggal}</td>
                        <td className="px-1 py-1">
                          {item.total === 0 ||
                          item.total === "0" ||
                          item.total === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(item.total).toLocaleString("id-ID")}`
                          )}
                        </td>
                        <td className="px-1 py-1">
                          {item.tunai === 0 ||
                          item.tunai === "0" ||
                          item.tunai === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(item.tunai).toLocaleString("id-ID")}`
                          )}
                        </td>
                        {/* <td className="px-1 py-1">
                          {item.kembalian === 0 ||
                          item.kembalian === "0" ||
                          item.kembalian === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(item.kembalian).toLocaleString(
                              "id-ID"
                            )}`
                          )}
                        </td> */}
                        <td className="px-1 py-1">
                          {item.sisa_hutang === 0 ||
                          item.sisa_hutang === "0" ||
                          item.sisa_hutang === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(item.sisa_hutang).toLocaleString(
                              "id-ID"
                            )}`
                          )}
                        </td>
                        <td className="px-1 py-1">
                          {item.modal === 0 ||
                          item.modal === "0" ||
                          item.modal === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(item.modal).toLocaleString("id-ID")}`
                          )}
                        </td>
                        <td className="px-1 py-1">
                          {item.keuntungan === 0 ||
                          item.keuntungan === "0" ||
                          item.keuntungan === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(item.keuntungan).toLocaleString(
                              "id-ID"
                            )}`
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Total Transaksi, Hutang, Keuntungan */}
            <div className="mt-3 flex justify-end">
              <table className="w-auto text-sm text-left">
                <tbody>
                  <tr>
                    <td className="pr-4 font-semibold">Total Transaksi</td>
                    <td>:</td>
                    <td className="font-bold">
                      {"Rp. " +
                        sortedData
                          .reduce(
                            (acc, item) => acc + (Number(item.total) || 0),
                            0
                          )
                          .toLocaleString("id-ID")}
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-semibold">Total Hutang</td>
                    <td>:</td>
                    <td className="font-bold">
                      {"Rp. " +
                        sortedData
                          .reduce(
                            (acc, item) =>
                              acc + (Number(item.sisa_hutang) || 0),
                            0
                          )
                          .toLocaleString("id-ID")}
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-semibold">Total Keuntungan</td>
                    <td>:</td>
                    <td className="font-bold">
                      {"Rp. " +
                        sortedData
                          .reduce(
                            (acc, item) => acc + (Number(item.keuntungan) || 0),
                            0
                          )
                          .toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "stok" && (
          <div>
            {/* Filter untuk Stok */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-xs mb-1">Lokasi</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterLokasi}
                  onChange={(e) => setFilterLokasi(e.target.value)}
                >
                  <option value="">Semua Lokasi</option>
                  {lokasiList.map((lokasi) => (
                    <option key={lokasi.id_lokasi} value={lokasi.id_lokasi}>
                      {lokasi.nama_lokasi}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Produk</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterProduk}
                  onChange={(e) => setFilterProduk(e.target.value)}
                >
                  <option value="">Semua Produk</option>
                  {produkList.map((produk) => (
                    <option key={produk.id_produk} value={produk.id_produk}>
                      {produk.nama_produk}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Tabel Laporan Stok */}
            <div
              className="relative overflow-x-auto shadow-md sm:rounded-lg border border-[#344c36]"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 z-50 sticky top-0">
                  <tr>
                    <th className="px-1 py-2 text-center">No</th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("nama_lokasi")}
                    >
                      <div className="flex items-center">
                        Lokasi
                        <SortIcon
                          active={sortBy === "nama_lokasi"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("nama_produk")}
                    >
                      <div className="flex items-center">
                        Nama Produk
                        <SortIcon
                          active={sortBy === "nama_produk"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("satuan")}
                    >
                      <div className="flex items-center">
                        Satuan
                        <SortIcon active={sortBy === "satuan"} asc={sortAsc} />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("expired_date")}
                    >
                      <div className="flex items-center">
                        Expired
                        <SortIcon
                          active={sortBy === "expired_date"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("harga_beli")}
                    >
                      <div className="flex items-center">
                        Harga Beli
                        <SortIcon
                          active={sortBy === "harga_beli"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("harga_jual")}
                    >
                      <div className="flex items-center">
                        Harga Jual
                        <SortIcon
                          active={sortBy === "harga_jual"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("stok_optimal")}
                    >
                      <div className="flex items-center">
                        Stok Optimal
                        <SortIcon
                          active={sortBy === "stok_optimal"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("sisa_stok")}
                    >
                      <div className="flex items-center">
                        Sisa Stok
                        <SortIcon
                          active={sortBy === "sisa_stok"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("nilai_modal")}
                    >
                      <div className="flex items-center">
                        Nilai Modal
                        <SortIcon
                          active={sortBy === "nilai_modal"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("potensi_keuntungan")}
                    >
                      <div className="flex items-center">
                        Potensi Keuntungan
                        <SortIcon
                          active={sortBy === "potensi_keuntungan"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-4 text-red-500 font-semibold"
                      >
                        Tidak ada data ditemukan
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((item, idx) => (
                      <tr key={idx} className="bg-white border-b">
                        <td className="px-1 py-1 text-center">{idx + 1}</td>
                        <td className="px-1 py-1 capitalize">
                          {item.nama_lokasi}
                        </td>
                        <td className="px-1 py-1">{item.nama_produk}</td>
                        <td className="px-1 py-1">{item.satuan}</td>
                        <td className="px-1 py-1">
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
                          {item.harga_beli === 0 ||
                          item.harga_beli === "0" ||
                          item.harga_beli === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(item.harga_beli).toLocaleString(
                              "id-ID"
                            )}`
                          )}
                        </td>
                        <td className="px-1 py-1">
                          {item.harga_jual === 0 ||
                          item.harga_jual === "0" ||
                          item.harga_jual === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(item.harga_jual).toLocaleString(
                              "id-ID"
                            )}`
                          )}
                        </td>
                        <td className="px-1 py-1">{item.stok_optimal}</td>

                        <td className="px-1 py-1">
                          {item.sisa_stok === 0 ||
                          item.sisa_stok === "0" ||
                          item.sisa_stok === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            Number(item.sisa_stok).toLocaleString("id-ID")
                          )}
                        </td>
                        <td className="px-1 py-1">
                          {item.nilai_modal === 0 ||
                          item.nilai_modal === "0" ||
                          item.nilai_modal === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(item.nilai_modal).toLocaleString(
                              "id-ID"
                            )}`
                          )}
                        </td>
                        <td className="px-1 py-1">
                          {item.potensi_keuntungan === 0 ||
                          item.potensi_keuntungan === "0" ||
                          item.potensi_keuntungan === null ? (
                            <span className="text-red-600 font-bold">-</span>
                          ) : (
                            `Rp. ${Number(
                              item.potensi_keuntungan
                            ).toLocaleString("id-ID")}`
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Total Modal & Potensi Keuntungan */}
            <div className="mt-3 flex justify-end">
              <table className="w-w-auto text-sm text-left">
                <tbody>
                  <tr>
                    <td className="pr-4 font-semibold">Total Modal</td>
                    <td>:</td>
                    <td className="font-bold">
                      {"Rp. " +
                        sortedData
                          .reduce(
                            (acc, item) =>
                              acc + (Number(item.nilai_modal) || 0),
                            0
                          )
                          .toLocaleString("id-ID")}
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-semibold">
                      Total Potensi Keuntungan
                    </td>
                    <td>:</td>
                    <td className="font-bold">
                      {"Rp. " +
                        sortedData
                          .reduce(
                            (acc, item) =>
                              acc + (Number(item.potensi_keuntungan) || 0),
                            0
                          )
                          .toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {loading && <div className="text-center py-8">Memuat data...</div>}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}
      </div>
    </div>
  );
};

export default Laporan;
