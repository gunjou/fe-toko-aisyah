import React, { useState, useEffect } from "react";
import api from "../utils/api";

const Hutang = () => {
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk rekap total hutang per pelanggan
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

  // Modal Tambah & Bayar Hutang
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

  // Tambahkan state untuk alert
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  // Fungsi untuk menampilkan alert
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 2000);
  };

  // Submit tambah hutang
  const handleSubmitTambahHutang = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // cegah double klik
    setIsSubmitting(true);
    setTambahHutangLoading(true);
    setTambahHutangResult(null);
    try {
      const res = await api.post(
        "/hutang/",
        {
          id_transaksi: null,
          id_pelanggan: modalTambahHutang.pelanggan.id_pelanggan,
          sisa_hutang: Number(tambahHutangValue),
          status_hutang: "belum lunas",
        },
        { headers: getAuthHeaders() }
      );
      setTambahHutangResult(res.data?.data);
      // Refresh data rekap total hutang
      const totalRes = await api.get("/hutang/total", {
        headers: getAuthHeaders(),
      });
      setTotalHutangList(totalRes.data?.data || []);
      setTambahHutangLoading(false);
      closeModalTambahHutang();
      showAlert("success", "Berhasil menambah hutang!");
    } catch (err) {
      setTambahHutangResult({ error: "Gagal menambah hutang" });
      setTambahHutangLoading(false);
      showAlert("error", "Gagal menambah hutang!");
    }
  };

  // Submit bayar hutang
  const handleSubmitBayarHutang = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // cegah double klik
    setIsSubmitting(true);
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
      closeModalBayarHutang();
      showAlert("success", "Berhasil membayar hutang!");
    } catch (err) {
      setBayarHutangResult({ error: "Gagal membayar hutang" });
      setBayarHutangLoading(false);
      showAlert("error", "Gagal membayar hutang!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tambahkan sorting ASC/DESC pada tabel rekap hutang pelanggan

  const [sortBy, setSortBy] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Tambahkan state untuk search di rekap hutang pelanggan
  const [searchRekap, setSearchRekap] = useState("");

  // Filter data berdasarkan search sebelum sorting
  const filteredTotalHutangList = totalHutangList.filter((item) => {
    const q = searchRekap.trim().toLowerCase();
    return (
      item.id_pelanggan?.toString().toLowerCase().includes(q) ||
      item.nama_pelanggan?.toLowerCase().includes(q) ||
      item.kontak?.toLowerCase().includes(q)
    );
  });

  // Sorting function untuk filteredTotalHutangList
  const sortedTotalHutangList = [...filteredTotalHutangList].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortAsc ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

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

  // State untuk modal tambah hutang baru (bukan dari tabel)
  const [modalTambahHutangBaru, setModalTambahHutangBaru] = useState(false);
  const [hutangBaruPelanggan, setHutangBaruPelanggan] = useState(null);
  const [hutangBaruValue, setHutangBaruValue] = useState("");
  const [hutangBaruLoading, setHutangBaruLoading] = useState(false);
  const [hutangBaruResult, setHutangBaruResult] = useState(null);

  // State untuk daftar pelanggan (ambil dari API)
  const [pelangganList, setPelangganList] = useState([]);
  const [pelangganLoading, setPelangganLoading] = useState(false);
  const [pelangganError, setPelangganError] = useState(null);

  // State untuk modal pilih kontak pelanggan
  const [modalPilihPelanggan, setModalPilihPelanggan] = useState(false);
  const [searchPelanggan, setSearchPelanggan] = useState("");

  // State untuk modal tambah pelanggan baru
  const [modalTambahPelanggan, setModalTambahPelanggan] = useState(false);
  const [namaPelangganBaru, setNamaPelangganBaru] = useState("");
  const [kontakPelangganBaru, setKontakPelangganBaru] = useState("");
  const [tambahPelangganLoading, setTambahPelangganLoading] = useState(false);

  // Ambil data pelanggan saat modal tambah hutang baru dibuka
  useEffect(() => {
    if (modalTambahHutangBaru) {
      setPelangganLoading(true);
      api
        .get("/pelanggan/", { headers: getAuthHeaders() })
        .then((res) => setPelangganList(res.data || []))
        .catch(() => setPelangganError("Gagal mengambil data pelanggan"))
        .finally(() => setPelangganLoading(false));
    }
  }, [modalTambahHutangBaru]);

  // Handler buka modal tambah hutang baru
  const openModalTambahHutangBaru = () => {
    setHutangBaruPelanggan(null);
    setHutangBaruValue("");
    setHutangBaruResult(null);
    setModalTambahHutangBaru(true);
  };
  const closeModalTambahHutangBaru = () => setModalTambahHutangBaru(false);

  // Handler submit tambah hutang baru
  const handleSubmitTambahHutangBaru = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // cegah double klik
    setIsSubmitting(true);
    if (!hutangBaruPelanggan || !hutangBaruPelanggan.id_pelanggan) {
      setHutangBaruResult({ error: "Pilih pelanggan terlebih dahulu!" });
      return;
    }
    setHutangBaruLoading(true);
    setHutangBaruResult(null);
    try {
      const res = await api.post(
        "/hutang/",
        {
          id_transaksi: null,
          id_pelanggan: hutangBaruPelanggan.id_pelanggan,
          sisa_hutang: Number(hutangBaruValue),
          status_hutang: "belum lunas",
        },
        { headers: getAuthHeaders() }
      );
      setHutangBaruResult(res.data?.data);
      setHutangBaruLoading(false);
      setTimeout(() => {
        closeModalTambahHutangBaru();
        // Refresh data hutang
        api
          .get("/hutang/total", { headers: getAuthHeaders() })
          .then((res) => setTotalHutangList(res.data?.data || []));
      }, 1200);
    } catch (err) {
      setHutangBaruResult({ error: "Gagal menambah hutang" });
      setHutangBaruLoading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler submit tambah pelanggan baru
  const handleSubmitTambahPelanggan = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // cegah double klik
    setIsSubmitting(true);
    setTambahPelangganLoading(true);
    try {
      await api.post(
        "/pelanggan/",
        {
          nama_pelanggan: namaPelangganBaru,
          kontak: kontakPelangganBaru,
        },
        { headers: getAuthHeaders() }
      );
      setModalTambahPelanggan(false);
      setNamaPelangganBaru("");
      setKontakPelangganBaru("");
      // Refresh data pelanggan
      setPelangganLoading(true);
      api
        .get("/pelanggan/", { headers: getAuthHeaders() })
        .then((res) => setPelangganList(res.data || []))
        .finally(() => setPelangganLoading(false));
    } catch (err) {
      showAlert("error", "Gagal menambah pelanggan!");
      setTambahPelangganLoading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tambahkan helper untuk format rupiah
  const formatRupiah = (value) => {
    if (!value) return "";
    const number = value.toString().replace(/[^0-9]/g, "");
    return number ? "Rp. " + Number(number).toLocaleString("id-ID") : "";
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold pb-2">Hutang</h1>

      {/* Modal Tambah Hutang Baru */}
      {modalTambahHutangBaru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Tambah Hutang Baru</h2>
            <form
              onSubmit={handleSubmitTambahHutangBaru}
              disabled={isSubmitting}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs mb-1">Pilih Pelanggan</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={
                      hutangBaruPelanggan
                        ? hutangBaruPelanggan.nama_pelanggan
                        : ""
                    }
                    className="border rounded-lg px-2 py-1 w-full pr-10 capitalize"
                    placeholder="Pilih pelanggan..."
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF4778] hover:text-[#FF87A7]"
                    title="Pilih dari daftar pelanggan"
                    onClick={() => setModalPilihPelanggan(true)}
                  >
                    Pilih
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1">Nominal Hutang</label>
                <input
                  type="text"
                  inputMode="numeric"
                  min={1}
                  className="border rounded px-2 py-1 w-full"
                  value={hutangBaruValue ? formatRupiah(hutangBaruValue) : ""}
                  onChange={(e) => {
                    const number = e.target.value.replace(/[^0-9]/g, "");
                    setHutangBaruValue(number);
                  }}
                  required
                />
              </div>
              {hutangBaruResult && hutangBaruResult.error && (
                <div className="text-red-500 text-sm">
                  {hutangBaruResult.error}
                </div>
              )}
              {hutangBaruResult && hutangBaruResult.sisa_hutang && (
                <div className="text-green-600 text-sm">
                  Berhasil menambah hutang. Sisa hutang: Rp.
                  {Number(hutangBaruResult.sisa_hutang).toLocaleString("id-ID")}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModalTambahHutangBaru}
                  className="text-sm px-4 py-1 rounded-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700"
                  disabled={hutangBaruLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-sm rounded-[10px] bg-[#FF4778] hover:bg-[#FF87A7] text-white"
                  disabled={hutangBaruLoading}
                >
                  {hutangBaruLoading ? "Menyimpan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
          {/* Modal Pilih Kontak Pelanggan */}
          {modalPilihPelanggan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                <h2 className="text-lg font-bold mb-4">Daftar Pelanggan</h2>
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
                    className="bg-green-400 hover:bg-green-500 text-white px-3 py-2 rounded-[10px] text-xs"
                    onClick={() => setModalTambahPelanggan(true)}
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
                  ) : pelangganList.filter((item) =>
                      item.nama_pelanggan
                        ?.toLowerCase()
                        .includes(searchPelanggan.trim().toLowerCase())
                    ).length === 0 ? (
                    <div className="text-center text-gray-400 py-4">
                      Tidak ada data pelanggan
                    </div>
                  ) : (
                    pelangganList
                      .filter((item) =>
                        item.nama_pelanggan
                          ?.toLowerCase()
                          .includes(searchPelanggan.trim().toLowerCase())
                      )
                      .slice(0, 10)
                      .map((item) => (
                        <div
                          key={item.id_pelanggan}
                          className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg px-4 py-3 shadow-sm bg-gray-50"
                        >
                          <div>
                            <div className="font-semibold text-sm capitalize">
                              {item.nama_pelanggan}
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.kontak || "Tidak ada kontak"}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="mt-2 md:mt-0 bg-[#FF4778] hover:bg-[#FF87A7] text-white px-4 py-1 rounded-[10px] text-xs"
                            onClick={() => {
                              setHutangBaruPelanggan(item);
                              setModalPilihPelanggan(false);
                            }}
                          >
                            Pilih
                          </button>
                        </div>
                      ))
                  )}
                  {pelangganList.filter((item) =>
                    item.nama_pelanggan
                      ?.toLowerCase()
                      .includes(searchPelanggan.trim().toLowerCase())
                  ).length > 10 && (
                    <div className="text-xs text-gray-400 text-center">
                      Menampilkan 10 data pertama dari{" "}
                      {
                        pelangganList.filter((item) =>
                          item.nama_pelanggan
                            ?.toLowerCase()
                            .includes(searchPelanggan.trim().toLowerCase())
                        ).length
                      }{" "}
                      hasil
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalPilihPelanggan(false)}
                    className="text-sm px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    Batal
                  </button>
                </div>
              </div>
              {/* Modal Tambah Pelanggan */}
              {modalTambahPelanggan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                    <h2 className="text-lg font-bold mb-4">Tambah Pelanggan</h2>
                    <form
                      onSubmit={handleSubmitTambahPelanggan}
                      disabled={isSubmitting}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs mb-1">
                          Nama Pelanggan
                        </label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          required
                          value={namaPelangganBaru}
                          onChange={(e) => setNamaPelangganBaru(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Kontak</label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          value={kontakPelangganBaru}
                          onChange={(e) =>
                            setKontakPelangganBaru(e.target.value)
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setModalTambahPelanggan(false)}
                          className="text-sm px-4 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1 text-sm rounded-lg bg-[#FF4778] hover:bg-green-600 text-white"
                          disabled={tambahPelangganLoading}
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
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
            <form
              onSubmit={handleSubmitTambahHutang}
              disabled={isSubmitting}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs mb-1">Nominal Hutang</label>
                <input
                  type="text"
                  inputMode="numeric"
                  min={1}
                  className="border rounded px-2 py-1 w-full"
                  value={
                    tambahHutangValue ? formatRupiah(tambahHutangValue) : ""
                  }
                  onChange={(e) => {
                    const number = e.target.value.replace(/[^0-9]/g, "");
                    setTambahHutangValue(number);
                  }}
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
                  className="px-4 py-1 text-sm rounded-lg bg-[#FF4778] hover:bg-[#FF87A7] text-white"
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
            <form
              onSubmit={handleSubmitBayarHutang}
              disabled={isSubmitting}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs mb-1">Nominal Pembayaran</label>
                <input
                  type="text"
                  inputMode="numeric"
                  min={1}
                  className="border rounded px-2 py-1 w-full"
                  value={bayarHutangValue ? formatRupiah(bayarHutangValue) : ""}
                  onChange={(e) => {
                    const number = e.target.value.replace(/[^0-9]/g, "");
                    setBayarHutangValue(number);
                  }}
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
                  className="text-sm px-4 py-1 rounded-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700"
                  disabled={bayarHutangLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-sm rounded-[10px] bg-yellow-500 hover:bg-yellow-600 text-white"
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
      <div className="">
        <div className="bg-white rounded-[20px] py-4 px-6 shadow-md">
          <div className="flex items-center justify-between space-x-2 mb-4">
            <p className="text-md font-semibold">Daftar Hutang Pelangggan</p>
            <form className="flex items-center gap-2">
              <label
                htmlFor="rekap-search"
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
                  id="rekap-search"
                  className="block w-50 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-[15px] bg-gray-50 focus:ring-green-500 focus:border-green-500"
                  placeholder="Cari..."
                  value={searchRekap}
                  onChange={(e) => setSearchRekap(e.target.value)}
                />
              </div>
            </form>
          </div>

          <div
            className="relative overflow-x-auto shadow-md sm:rounded-lg"
            style={{ maxHeight: "280px", overflowY: "auto" }}
          >
            {totalHutangLoading ? (
              <div className="text-center py-8">
                Memuat data total hutang...
              </div>
            ) : totalHutangError ? (
              <div className="text-center text-red-500 py-8">
                {totalHutangError}
              </div>
            ) : (
              <table className="w-full text-sm text-left text-black">
                <thead className="text-md text-black uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-1 py-2 text-center">No</th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("id_pelanggan")}
                    >
                      <div className="flex items-center">
                        Nama Pelanggan
                        <SortIcon
                          active={sortBy === "id_pelanggan"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th
                      className="px-1 py-2 cursor-pointer select-none"
                      onClick={() => handleSort("nama_pelanggan")}
                    >
                      <div className="flex items-center">
                        ID Pelanggan
                        <SortIcon
                          active={sortBy === "nama_pelanggan"}
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
                    <th
                      className="px-1 py-2 text-right cursor-pointer select-none"
                      onClick={() => handleSort("total_sisa_hutang")}
                    >
                      <div className="flex items-center">
                        Sisa Hutang
                        <SortIcon
                          active={sortBy === "total_sisa_hutang"}
                          asc={sortAsc}
                        />
                      </div>
                    </th>
                    <th className="px-1 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTotalHutangList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center text-gray-400 py-8"
                      >
                        Tidak ada data hutang
                      </td>
                    </tr>
                  ) : (
                    sortedTotalHutangList.map((item, idx) => {
                      return (
                        <tr
                          key={item.id_pelanggan || idx}
                          className="bg-white border-b"
                        >
                          <td className="px-1 py-1 text-center">{idx + 1}</td>
                          <td className="px-1 py-1 capitalize">
                            {item.nama_pelanggan}
                          </td>
                          <td className="px-1 py-1">{item.id_pelanggan}</td>

                          <td className="px-1 py-1">{item.kontak || "-"}</td>
                          <td className="px-1 py-1">
                            Rp.
                            {Number(item.total_sisa_hutang).toLocaleString(
                              "id-ID"
                            )}
                          </td>
                          <td className="px-1 py-1 text-center">
                            <button
                              className="bg-[#FF4778] hover:bg-[#FF87A7] text-white px-3 py-1 rounded-[10px] text-xs mr-2"
                              onClick={() => openModalTambahHutang(item)}
                            >
                              Tambah
                            </button>
                            <button
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-[10px] text-xs"
                              onClick={() => openModalBayarHutang(item)}
                            >
                              Bayar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex justify-left pt-4">
            <button
              className="bg-[#FF4778] hover:bg-[#FF87A7] text-white px-4 py-2 rounded-[10px] text-xs font-semibold"
              onClick={openModalTambahHutangBaru}
            >
              Tambah Hutang
            </button>
          </div>
        </div>
      </div>

      {/* Render alert di atas halaman */}
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
    </div>
  );
};

export default Hutang;
