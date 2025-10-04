const checkAppVersion = async () => {
  console.log("Menjalankan pengecekan versi aplikasi...");

  try {
    const res = await fetch(`/version.json?ts=${Date.now()}`);
    if (!res.ok) throw new Error("Respon version.json tidak OK");

    const { version: serverVersion } = await res.json();
    const localVersion = localStorage.getItem("app_version");
    const alreadyRefreshed = sessionStorage.getItem("version_refreshed");

    if (!serverVersion) {
      console.warn("Versi dari server tidak ditemukan!");
      return;
    }

    // Pertama kali pengguna membuka aplikasi
    if (!localVersion) {
      console.log("Versi lokal belum ada, simpan dan reload.");
      localStorage.setItem("app_version", serverVersion);
      sessionStorage.setItem("version_refreshed", "true");
      window.location.reload(true);
      return;
    }

    // Jika versi berubah dan belum di-refresh sebelumnya
    if (localVersion !== serverVersion && !alreadyRefreshed) {
      console.log("Versi berubah, paksa reload.");
      localStorage.setItem("app_version", serverVersion);
      sessionStorage.setItem("version_refreshed", "true");
      window.location.reload(true);
    } else {
      console.log("Versi sama, tidak perlu reload.");
    }
  } catch (error) {
    console.error("Gagal mengambil version.json:", error);
  }
};

export default checkAppVersion;
