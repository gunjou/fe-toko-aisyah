import React, { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { IoQrCodeOutline } from "react-icons/io5";
import api from "../utils/api";

const DaftarPelanggan = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 2000);
  };

  const [sortBy, setSortBy] = useState("nama_pelanggan");
  const [sortAsc, setSortAsc] = useState(true);

  // State untuk data pelanggan
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //fetch data pelanggan dari API
  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get("/pelanggan/")
      .then((res) => setData(res.data))
      .catch(() => setError("Gagal mengambil data produk"))
      .finally(() => setLoading(false));
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Modal handler
  const openEditModal = (item) => {
    setEditItem(item);
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
    if (isSubmitting) return; // cegah double klik
    setIsSubmitting(true);
    try {
      await api.put(`/pelanggan/${editItem.id_pelanggan}`, {
        nama_pelanggan: editItem.nama_pelanggan,
        kontak: editItem.kontak,
      });
      // Refresh data dari backend
      const res = await api.get("/pelanggan/");
      setData(res.data);
      closeModal();
      showAlert("success", "Pelanggan berhasil diedit");
    } catch (err) {
      showAlert(
        "error",
        "Gagal mengedit pelanggan. Pastikan data sudah benar."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    nama_pelanggan: "",
    kontak: "",
    //alamat: "",
  });

  // Handler untuk modal tambah
  const openAddModal = () => {
    setNewItem({
      nama_pelanggan: "",
      kontak: "",
      //alamat: "",
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
    if (isSubmitting) return; // cegah double klik
    setIsSubmitting(true);
    try {
      await api.post("/pelanggan/", {
        ...newItem,
      });
      // Refresh data dari backend
      const res = await api.get("/pelanggan/");
      setData(res.data);
      closeAddModal();
      showAlert("success", "Pelanggan berhasil ditambahkan");
    } catch (err) {
      showAlert(
        "error",
        "Gagal menambahkan pelanggan. Pastikan data sudah benar."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [search, setSearch] = useState("");

  // Filter data berdasarkan search sebelum sorting
  const filteredData = data.filter((item) => {
    const q = search.trim().toLowerCase();
    return (
      item.nama_pelanggan?.toLowerCase().includes(q) ||
      item.kontak?.toLowerCase().includes(q)
    );
  });

  // Sorting function untuk filteredData
  const sortedData = [...filteredData].sort((a, b) => {
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

  // Handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  // Tambahkan fungsi hapus di dalam komponen DaftarPelanggan
  const handleDelete = async (item) => {
    if (window.confirm(`Yakin ingin menghapus "${item.nama_pelanggan}"?`)) {
      try {
        await api.delete(`/pelanggan/${item.id_pelanggan}`);
        // Refresh data dari backend
        const res = await api.get("/pelanggan/");
        setData(res.data);
      } catch (err) {
        alert("Gagal menghapus pelanggan.");
      }
    }
  };

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
      <h1 className="text-2xl font-bold pb-2">Pelanggan</h1>
      <div className="bg-white rounded-[20px] py-4 px-6 shadow-md">
        <div className="flex items-center justify-between space-x-2 mb-4">
          <p className="text-sm font-semibold">Daftar Pelanggan</p>
          <form className="flex items-center gap-2">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block w-50 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-[15px] bg-gray-50 focus:ring-green-500 focus:border-green-500"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div
          className="relative overflow-x-auto shadow-md sm:rounded-lg"
          style={{ maxHeight: "280px", overflowY: "auto" }}
        >
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 z-50 sticky top-0">
              <tr>
                <th className="px-1 py-2 text-center">No</th>
                <th
                  className="px-1 py-2 cursor-pointer select-none"
                  onClick={() => handleSort("nama_pelanggan")}
                >
                  <div className="flex items-center">
                    Nama
                    <SortIcon
                      active={sortBy === "nama_pelanggan"}
                      asc={sortAsc}
                    />
                  </div>
                </th>
                <th
                  className="px-1 py-2 cursor-pointer select-none"
                  onClick={() => handleSort("id_pelanggan")}
                >
                  <div className="flex items-center">
                    Id Pelanggan
                    <SortIcon
                      active={sortBy === "id_pelanggan"}
                      asc={sortAsc}
                    />
                  </div>
                </th>

                <th
                  className="px-1 py-2 cursor-pointer select-none"
                  onClick={() => handleSort("kontak")}
                >
                  <div className="flex items-center">
                    Kontak
                    <SortIcon active={sortBy === "kontak"} asc={sortAsc} />
                  </div>
                </th>
                {/* <th
                  className="px-1 py-2 cursor-pointer select-none"
                  onClick={() => handleSort("alamat")}
                >
                  <div className="flex items-center">
                    Alamat
                    <SortIcon active={sortBy === "alamat"} asc={sortAsc} />
                  </div>
                </th> */}
                <th className="px-1 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, idx) => (
                <tr key={idx} className="bg-white border-b">
                  <td className="px-1 py-1 text-center">{idx + 1}</td>
                  <td className="px-1 py-1 capitalize">
                    {item.nama_pelanggan}
                  </td>
                  <td className="px-1 py-1 capitalize">{item.id_pelanggan}</td>
                  <td className="px-1 py-1">{item.kontak || "-"}</td>
                  {/* <td className="px-1 py-1">{item.alamat}</td> */}
                  <td className="px-1 py-1">
                    <button
                      className="bg-[#FF4778] hover:bg-[#FF87A7] text-white px-3 py-1 rounded-lg text-xs"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="ml-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-xs"
                      onClick={() => handleDelete(item)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button
            className="bg-[#FF4778] p-2 rounded-[10px] text-xs text-white font-semibold hover:bg-[#FF87A7]"
            onClick={openAddModal}
          >
            Tambah Pelanggan
          </button>
        </div>
      </div>

      {/* Modal Tambah */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Tambah Pelanggan</h2>
            <form
              onSubmit={handleAddSubmit}
              disabled={isSubmitting}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs">Nama</label>
                <input
                  type="text"
                  name="nama_pelanggan"
                  value={newItem.nama_pelanggan}
                  onChange={handleAddChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs">Telepon</label>
                <input
                  type="number"
                  name="kontak"
                  value={newItem.kontak}
                  onChange={handleAddChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              {/* <div>
                <label className="block text-xs">Alamat</label>
                <input
                  type="text"
                  name="alamat"
                  value={newItem.alamat}
                  onChange={handleAddChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div> */}
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
                  className="px-4 py-1 text-sm rounded-lg bg-[#FF4778] hover:bg-[#FF87A7] text-white"
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
            <h2 className="text-lg font-bold mb-4">Edit Pelanggan</h2>
            <form
              onSubmit={handleEditSubmit}
              disabled={isSubmitting}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs">Nama</label>
                <input
                  type="text"
                  name="nama_pelanggan"
                  value={editItem.nama_pelanggan}
                  onChange={handleEditChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs">Telepon</label>
                <input
                  type="number"
                  name="kontak"
                  value={editItem.kontak}
                  onChange={handleEditChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-sm rounded-lg bg-[#FF4778] hover:bg-[#FF87A7] text-white"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarPelanggan;
