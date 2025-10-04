import React, { useState, useEffect } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { IoQrCodeOutline, IoClose } from "react-icons/io5";
import { MdContactPage } from "react-icons/md";
import api from "../utils/api";

const dummyDetailHutang = [
  {
    pencatatan: "01 Maret 2025",
    utang: "Rp.1.000.000",
    membayarkan: "-",
  },
  {
    pencatatan: "02 Maret 2025",
    utang: "-",
    membayarkan: "Rp.200.000",
  },
  {
    pencatatan: "03 Maret 2025",
    utang: "Rp.400.000",
    membayarkan: "-",
  },
];

const Hutang = () => {
  const [sortBy, setSortBy] = useState("nama");
  const [sortAsc, setSortAsc] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // State untuk data hutang dari API
  const [data, setData] = useState([]);
  const [hutangLoading, setHutangLoading] = useState(false);
  const [hutangError, setHutangError] = useState(null);

  // Ambil data hutang dari API saat mount
  useEffect(() => {
    setHutangLoading(true);
    setHutangError(null);
    api
      .get("/hutang/", { headers: getAuthHeaders() })
      .then((res) => setData(res.data || []))
      .catch(() => setHutangError("Gagal mengambil data hutang"))
      .finally(() => setHutangLoading(false));
  }, []);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    nama_pelanggan: "",
    sisa_hutang: "",
    status_hutang: "",
  });

  // Handler untuk modal tambah
  const openAddModal = () => {
    setNewItem({
      nama_pelanggan: "",
      sisa_hutang: "",
      status_hutang: "",
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

  // Ganti handleAddSubmit agar menambah hutang baru ke endpoint /hutang/ (bukan per id)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pastikan id_pelanggan sudah terisi di newItem
      await api.post(
        "/hutang/",
        {
          id_transaksi: null,
          id_pelanggan: newItem.id_pelanggan,
          sisa_hutang: Number(newItem.sisa_hutang),
          status_hutang: "Belum Lunas",
        },
        {
          headers: getAuthHeaders(),
        }
      );
      setHutangLoading(true);
      const res = await api.get("/hutang/", { headers: getAuthHeaders() });
      setData(res.data || []);
      closeAddModal();
    } catch (err) {
      alert("Gagal menambah hutang");
      setHutangLoading(false);
    }
  };

  const [pencatatanModalOpen, setPencatatanModalOpen] = useState(false);

  // Handler untuk modal tambah
  const openPencatatanModal = () => {
    setNewItem({
      nama_pelanggan: "",
      sisa_hutang: "",
      status_hutang: "",
    });
    setPencatatanModalOpen(true);
  };

  const closePencatatanModal = () => {
    setPencatatanModalOpen(false);
  };

  const handlePencatatanChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handlePencatatanSubmit = (e) => {
    e.preventDefault();
    setData((prev) => [
      ...prev,
      {
        ...newItem,
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
      },
    ]);
    closePencatatanModal();
  };

  // Modal Pilih
  const [pilihModalOpen, setPilihModalOpen] = useState(false);

  // Handler untuk modal pilih
  const openPilihModal = () => {
    setPilihModalOpen(true);
  };
  const closePilihModal = () => {
    setPilihModalOpen(false);
  };

  // State untuk daftar pelanggan dari API
  const [pelangganList, setPelangganList] = useState([]);
  const [pelangganLoading, setPelangganLoading] = useState(false);
  const [pelangganError, setPelangganError] = useState(null);

  // Modal Pilih Kontak
  const [kontakModalOpen, setKontakModalOpen] = useState(false);

  // Ambil data pelanggan saat modal dibuka
  useEffect(() => {
    if (kontakModalOpen) {
      setPelangganLoading(true);
      setPelangganError(null);
      api
        .get("/pelanggan/", { headers: getAuthHeaders() })
        .then((res) => setPelangganList(res.data || []))
        .catch(() => setPelangganError("Gagal mengambil data pelanggan"))
        .finally(() => setPelangganLoading(false));
    }
  }, [kontakModalOpen]);

  // Handler untuk modal pilih kontak
  const openKontakModal = () => {
    setKontakModalOpen(true);
  };
  const closeKontakModal = () => {
    setKontakModalOpen(false);
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
        active ? "text-[#1E686D]" : "text-gray-400"
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

  const [selectedPelanggan, setSelectedPelanggan] = useState(null);

  const [searchPelanggan, setSearchPelanggan] = useState("");
  const [tambahPelangganModalOpen, setTambahPelangganModalOpen] =
    useState(false);

  const openTambahPelangganModal = () => setTambahPelangganModalOpen(true);
  // Filter pelanggan sesuai pencarian
  const filteredPelangganList = pelangganList.filter((item) =>
    item.nama_pelanggan
      ?.toLowerCase()
      .includes(searchPelanggan.trim().toLowerCase())
  );

  const hutangList = data;

  // Tambahkan state dan useEffect untuk data total hutang
  const [totalHutangList, setTotalHutangList] = useState([]);
  const [totalHutangLoading, setTotalHutangLoading] = useState(false);
  const [totalHutangError, setTotalHutangError] = useState(null);

  useEffect(() => {
    setTotalHutangLoading(true);
    setTotalHutangError(null);
    api
      .get("/hutang/total", { headers: getAuthHeaders() })
      .then((res) => setTotalHutangList(res.data?.data || []))
      .catch(() => setTotalHutangError("Gagal mengambil data total hutang"))
      .finally(() => setTotalHutangLoading(false));
  }, []);

  // Tambahkan state untuk modal tambah & bayar hutang
  const [modalTambahHutang, setModalTambahHutang] = useState({
    open: false,
    pelanggan: null,
  });
  const [modalBayarHutang, setModalBayarHutang] = useState({
    open: false,
    pelanggan: null,
  });
  const [tambahHutangValue, setTambahHutangValue] = useState("");
  const [bayarHutangValue, setBayarHutangValue] = useState("");
  const [tambahHutangLoading, setTambahHutangLoading] = useState(false);
  const [bayarHutangLoading, setBayarHutangLoading] = useState(false);
  const [tambahHutangResult, setTambahHutangResult] = useState(null);
  const [bayarHutangResult, setBayarHutangResult] = useState(null);

  // Handler buka modal tambah
  const openModalTambahHutang = (pelanggan) => {
    setTambahHutangValue("");
    setTambahHutangResult(null);
    setModalTambahHutang({ open: true, pelanggan });
  };
  // Handler buka modal bayar
  const openModalBayarHutang = (pelanggan) => {
    setBayarHutangValue("");
    setBayarHutangResult(null);
    setModalBayarHutang({ open: true, pelanggan });
  };
  // Handler tutup modal
  const closeModalTambahHutang = () =>
    setModalTambahHutang({ open: false, pelanggan: null });
  const closeModalBayarHutang = () =>
    setModalBayarHutang({ open: false, pelanggan: null });

  // Submit tambah hutang
  const handleSubmitTambahHutang = async (e) => {
    e.preventDefault();
    setTambahHutangLoading(true);
    setTambahHutangResult(null);
    try {
      const res = await api.post(
        "/hutang/",
        {
          id_transaksi: null, // Ganti dengan ID transaksi jika ada
          id_pelanggan: modalTambahHutang.pelanggan.id_pelanggan,
          sisa_hutang: Number(tambahHutangValue),
          status_hutang: "Belum Lunas",
        },
        { headers: getAuthHeaders() }
      );
      setTambahHutangResult(res.data?.data);
      // Refresh data
      const totalRes = await api.get("/hutang/total", {
        headers: getAuthHeaders(),
      });
      setTotalHutangList(totalRes.data?.data || []);
      setTambahHutangLoading(false);
    } catch (err) {
      setTambahHutangResult({ error: "Gagal menambah hutang" });
      setTambahHutangLoading(false);
    }
  };

  // Submit bayar hutang
  const handleSubmitBayarHutang = async (e) => {
    e.preventDefault();
    setBayarHutangLoading(true);
    setBayarHutangResult(null);
    try {
      const res = await api.post(
        "/hutang/bayar",
        {
          id_pelanggan: modalBayarHutang.pelanggan.id_pelanggan,
          jumlah_bayar: Number(bayarHutangValue),
        },
        { headers: getAuthHeaders() }
      );
      setBayarHutangResult(res.data.data);
      // Refresh data
      const totalRes = await api.get("/hutang/total", {
        headers: getAuthHeaders(),
      });
      setTotalHutangList(totalRes.data?.data || []);
      setBayarHutangLoading(false);
    } catch (err) {
      setBayarHutangResult({ error: "Gagal membayar hutang" });
      setBayarHutangLoading(false);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold pb-2">Hutang</h1>

      {/* Modal Tambah */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-0 w-full max-w-md shadow-lg relative overflow-hidden">
            {/* Pilihan Slide */}
            <div className="flex">
              <button
                className={`flex-1 py-3 font-semibold transition-all duration-200 ${
                  newItem.status_hutang !== "Bayar"
                    ? "bg-[#1E686D] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() =>
                  setNewItem((prev) => ({ ...prev, status_hutang: "" }))
                }
              >
                Tambah Hutang
              </button>
              <button
                className={`flex-1 py-3 font-semibold transition-all duration-200 ${
                  newItem.status_hutang === "Bayar"
                    ? "bg-[#1E686D] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() =>
                  setNewItem((prev) => ({ ...prev, status_hutang: "Bayar" }))
                }
              >
                Bayar Hutang
              </button>
            </div>
            {/* Konten Slide */}
            <div className="p-6">
              <h2 className="text-lg font-bold mb-4">
                {newItem.status_hutang === "Bayar"
                  ? "Form Bayar Hutang"
                  : "Form Tambah Hutang"}
              </h2>
              {/* Form Tambah Hutang */}
              {newItem.status_hutang !== "Bayar" && (
                <form onSubmit={handleAddSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs">Nama</label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        name="nama_pelanggan"
                        value={newItem.nama_pelanggan}
                        onChange={handleAddChange}
                        className="border rounded px-2 py-1 w-full pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1E686D] hover:text-green-600"
                        title="Pilih dari daftar pelanggan"
                        onClick={openKontakModal}
                      >
                        <MdContactPage size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs">Jumlah Hutang</label>
                    <input
                      type="text"
                      name="sisa_hutang"
                      value={newItem.sisa_hutang}
                      onChange={handleAddChange}
                      className="border rounded px-2 py-1 w-full"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeAddModal}
                      className="text-sm px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 text-sm rounded-lg bg-[#1E686D] hover:bg-green-600 text-white"
                    >
                      Tambah Hutang
                    </button>
                  </div>
                </form>
              )}
              {/* Form Bayar Hutang */}
              {newItem.status_hutang === "Bayar" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Simpan logika pembayaran hutang di sini
                    closeAddModal();
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs">Nama</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nama_pelanggan"
                        value={newItem.nama_pelanggan}
                        onChange={handleAddChange}
                        className="border rounded px-2 py-1 w-full pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1E686D] hover:text-green-600"
                        title="Pilih dari daftar pelanggan"
                        onClick={openKontakModal}
                      >
                        <MdContactPage size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs">Jumlah Pembayaran</label>
                    <input
                      type="text"
                      name="sisa_hutang"
                      value={newItem.sisa_hutang}
                      onChange={handleAddChange}
                      className="border rounded px-2 py-1 w-full"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeAddModal}
                      className="text-sm px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 text-sm rounded-lg bg-[#1E686D] hover:bg-green-600 text-white"
                    >
                      Simpan Pembayaran
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pilih */}
      {pilihModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] relative">
            <button
              className="absolute top-2 right-4 text-gray-500 hover:text-gray-700"
              onClick={closePilihModal}
              aria-label="Tutup"
            >
              <IoClose size={28} />
            </button>

            {/* Header Pelanggan */}
            <div className="mt-4 py-2 mb-2 px-2 shadow-md bg-[#1E686D] w-full h-full">
              <div className="flex justify-between ml-2">
                <h2 className="text-white text-lg font-bold">
                  {selectedPelanggan?.id_pelanggan || "-"}
                </h2>
                <button
                  type="button"
                  className="bg-green-500 text-xs text-white px-3 py-1 rounded-[20px] hover:bg-green-800 flex items-center"
                >
                  <i className="fa-solid fa-pen-to-square mr-1 text-xs"></i>{" "}
                  Ubah Nama Pelanggan
                </button>
              </div>
              <div className="bg-white rounded-lg justify-between mt-2">
                <div className="flex justify-between ml-2 text-xs">
                  <div>
                    <h3>Total utang Pelanggan :</h3>
                    <p className="text-red-600 font-semibold">
                      Rp.
                      {selectedPelanggan?.sisa_hutang?.toLocaleString(
                        "id-ID"
                      ) || "0"}
                    </p>
                  </div>
                  <button
                    type="button"
                    // onClick={}
                    className="bg-yellow-400 mr-2 text-xs text-white mt-2 mb-2 px-3 py-1 rounded-[20px] hover:bg-yellow-600 flex items-center"
                  >
                    <i className="fa-solid fa-pen-to-square mr-1 text-xs"></i>{" "}
                    Lunasi Utang
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-between ml-2">
              <table className="table-auto w-full text-sm divide-y divide-gray-200"></table>
            </div>
            {/* Tabel utama */}
            <div className="overflow-y-auto max-h-80">
              <table className="min-w-full bg-white border border-gray-300 rounded shadow">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-4 border-b text-center">
                      Pencatatan
                    </th>
                    <th className="py-2 px-4 border-b text-center">Hutang</th>
                    <th className="py-2 px-4 border-b text-center">
                      Membayarkan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dummyDetailHutang.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-4 border-b text-center">
                        {item.pencatatan}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {item.utang}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {item.membayarkan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closePilihModal}
                className="text-sm px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={openPencatatanModal}
                className="px-3 py-1 text-sm rounded-lg bg-[#1E686D] hover:bg-green-600 text-white"
              >
                Pencatatan Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pencatatan */}
      {pencatatanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-0 w-full max-w-md shadow-lg relative overflow-hidden">
            {/* Pilihan Slide */}
            <div className="flex">
              <button
                className={`flex-1 py-3 font-semibold transition-all duration-200 ${
                  newItem.status_hutang !== "Bayar"
                    ? "bg-[#1E686D] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() =>
                  setNewItem((prev) => ({ ...prev, status_hutang: "" }))
                }
              >
                Tambah Hutang
              </button>
              <button
                className={`flex-1 py-3 font-semibold transition-all duration-200 ${
                  newItem.status_hutang === "Bayar"
                    ? "bg-[#1E686D] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() =>
                  setNewItem((prev) => ({ ...prev, status_hutang: "Bayar" }))
                }
              >
                Bayar Hutang
              </button>
            </div>
            {/* Konten Slide */}
            <div className="p-6">
              {/* Form Tambah Hutang */}
              {newItem.status_hutang !== "Bayar" && (
                <form onSubmit={handlePencatatanSubmit} className="space-y-3">
                  <div className="block font-bold">Gibran</div>
                  <div>
                    <label className="block text-xs text-gray-500">
                      Nominal Hutang
                    </label>
                    <input
                      type="text"
                      name="sisa_hutang"
                      value={newItem.sisa_hutang}
                      onChange={handlePencatatanChange}
                      className="border rounded px-2 py-1 w-full"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closePencatatanModal}
                      className="text-sm px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 text-sm rounded-lg bg-[#1E686D] hover:bg-green-600 text-white"
                    >
                      Tambah Hutang
                    </button>
                  </div>
                </form>
              )}
              {/* Form Bayar Hutang */}
              {newItem.status_hutang === "Bayar" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Simpan logika pembayaran hutang di sini
                    closePencatatanModal();
                  }}
                  className="space-y-3"
                >
                  <div className="font-bold">Gibran</div>
                  <div>
                    <label className="block text-xs text-gray-500">
                      Nominal Pembayaran
                    </label>
                    <input
                      type="text"
                      name="sisa_hutang"
                      value={newItem.sisa_hutang}
                      onChange={handlePencatatanChange}
                      className="border rounded px-2 py-1 w-full"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closePencatatanModal}
                      className="text-sm px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 text-sm rounded-lg bg-[#1E686D] hover:bg-green-600 text-white"
                    >
                      Simpan Pembayaran
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {kontakModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Daftar Pelanggan</h2>
            {/* Search & Tambah Pelanggan */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="Cari pelanggan..."
                className="border rounded-lg px-2 py-1 w-full"
                value={searchPelanggan}
                onChange={(e) => setSearchPelanggan(e.target.value)}
              />
              <button
                type="button"
                className="bg-[#1E686D] hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs"
                onClick={openTambahPelangganModal}
              >
                Tambah
              </button>
            </div>
            <div
              className="space-y-3 mb-4"
              style={{ maxHeight: 300, overflowY: "auto" }}
            >
              {pelangganLoading ? (
                <div className="text-center py-4">Memuat data...</div>
              ) : pelangganError ? (
                <div className="text-center text-red-500 py-4">
                  {pelangganError}
                </div>
              ) : filteredPelangganList.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  Tidak ada data pelanggan
                </div>
              ) : (
                filteredPelangganList.slice(0, 10).map((item) => (
                  <div
                    key={item.id_pelanggan}
                    className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg px-4 py-3 shadow-sm bg-gray-50"
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        {item.nama_pelanggan}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mt-2 md:mt-0 bg-[#1E686D] hover:bg-green-600 text-white px-4 py-1 rounded text-xs"
                      onClick={() => {
                        setNewItem((prev) => ({
                          ...prev,
                          id_pelanggan: item.id_pelanggan,
                          nama_pelanggan: item.nama_pelanggan,
                        }));
                        setKontakModalOpen(false);
                      }}
                    >
                      Pilih
                    </button>
                  </div>
                ))
              )}
              {filteredPelangganList.length > 10 && (
                <div className="text-xs text-gray-400 text-center">
                  Menampilkan 10 data pertama dari{" "}
                  {filteredPelangganList.length} hasil
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeKontakModal}
                className="text-sm px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Hutang */}
      {modalTambahHutang.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Tambah Hutang</h2>
            <div className="mb-2">
              <div className="font-semibold">
                {modalTambahHutang.pelanggan.nama_pelanggan}
              </div>
              <div className="text-xs text-gray-500">
                {modalTambahHutang.pelanggan.kontak}
              </div>
            </div>
            <form onSubmit={handleSubmitTambahHutang} className="space-y-4">
              <div>
                <label className="block text-xs mb-1">Nominal Hutang</label>
                <input
                  type="number"
                  min={1}
                  className="border rounded px-2 py-1 w-full"
                  value={tambahHutangValue.sisa_hutang}
                  onChange={(e) => setTambahHutangValue(e.target.value)}
                  required
                />
              </div>
              {tambahHutangResult && tambahHutangResult.error && (
                <div className="text-red-500 text-sm">
                  {tambahHutangResult.error}
                </div>
              )}
              {tambahHutangResult && tambahHutangResult.sisa_hutang && (
                <div className="text-green-600 text-sm">
                  Berhasil menambah hutang. Sisa hutang: Rp.
                  {Number(tambahHutangResult.sisa_hutang).toLocaleString(
                    "id-ID"
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModalTambahHutang}
                  className="text-sm px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                  disabled={tambahHutangLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-sm rounded-lg bg-[#1E686D] hover:bg-green-600 text-white"
                  disabled={tambahHutangLoading}
                >
                  {tambahHutangLoading ? "Menyimpan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bayar Hutang */}
      {modalBayarHutang.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Bayar Hutang</h2>
            <div className="mb-2">
              <div className="font-semibold">
                {modalBayarHutang.pelanggan.nama_pelanggan}
              </div>
              <div className="text-xs text-gray-500">
                {modalBayarHutang.pelanggan.kontak}
              </div>
            </div>
            <form onSubmit={handleSubmitBayarHutang} className="space-y-4">
              <div>
                <label className="block text-xs mb-1">Nominal Pembayaran</label>
                <input
                  type="number"
                  min={1}
                  className="border rounded px-2 py-1 w-full"
                  value={bayarHutangValue}
                  onChange={(e) => setBayarHutangValue(e.target.value)}
                  required
                />
              </div>
              {bayarHutangResult && bayarHutangResult.error && (
                <div className="text-red-500 text-sm">
                  {bayarHutangResult.error}
                </div>
              )}
              {bayarHutangResult && bayarHutangResult.status === "success" && (
                <div className="text-green-600 text-sm">
                  {bayarHutangResult.message}
                  <br />
                  {bayarHutangResult.detail &&
                    bayarHutangResult.detail.map((d, i) => (
                      <div key={i}>
                        jumlah_bayar: Rp.
                        {Number(d.jumlah_bayar).toLocaleString("id-ID")} (
                        {d.status})
                      </div>
                    ))}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModalBayarHutang}
                  className="text-sm px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                  disabled={bayarHutangLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
                  disabled={bayarHutangLoading}
                >
                  {bayarHutangLoading ? "Menyimpan..." : "Bayar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rekap Total Hutang per Pelanggan */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">
          Rekap Total Hutang per Pelanggan
        </h2>
        <div
          className="relative overflow-x-auto shadow-md sm:rounded-lg"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {totalHutangLoading ? (
            <div className="text-center py-8">Memuat data total hutang...</div>
          ) : totalHutangError ? (
            <div className="text-center text-red-500 py-8">
              {totalHutangError}
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-1 py-2 text-center">No</th>
                  <th className="px-1 py-2">ID Pelanggan</th>
                  <th className="px-1 py-2">Nama Pelanggan</th>
                  <th className="px-1 py-2">Kontak</th>
                  <th className="px-1 py-2 text-right">Total Sisa Hutang</th>
                  <th className="px-1 py-2 text-center">Action</th>{" "}
                  {/* Tambah kolom Action */}
                </tr>
              </thead>
              <tbody>
                {totalHutangList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-8">
                      Tidak ada data hutang
                    </td>
                  </tr>
                ) : (
                  totalHutangList.map((item, idx) => (
                    <tr
                      key={item.id_pelanggan || idx}
                      className="bg-white border-b"
                    >
                      <td className="px-1 py-1 text-center">{idx + 1}</td>
                      <td className="px-1 py-1">{item.id_pelanggan}</td>
                      <td className="px-1 py-1 capitalize">
                        {item.nama_pelanggan}
                      </td>
                      <td className="px-1 py-1">{item.kontak}</td>
                      <td className="px-1 py-1 text-right">
                        Rp.
                        {Number(item.total_sisa_hutang).toLocaleString("id-ID")}
                      </td>

                      <td className="px-1 py-1 text-center">
                        <button
                          className="bg-[#1E686D] hover:bg-green-600 text-white px-3 py-1 rounded text-xs mr-2"
                          onClick={() => openModalTambahHutang(item)}
                        >
                          Tambah
                        </button>
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                          onClick={() => openModalBayarHutang(item)}
                        >
                          Bayar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hutang;
