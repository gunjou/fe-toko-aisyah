import React from "react";
import { SiGmail } from "react-icons/si";
import { FiMail } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Tentang = () => {
  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-2">Tentang</h1>
      <div className="bg-white rounded-lg border border-black p-4 shadow-md">
        <p className="text-gray-600 mb-4 text-justify">
          Sistem Kasir Online "Toko Yani" adalah aplikasi berbasis web yang
          membantu pengelolaan transaksi penjualan, stok barang, dan data
          pelanggan secara efisien dan mudah diakses.
        </p>
        <ul className="list-disc pl-5 text-gray-700 mb-4">
          <li>Mengelola transaksi penjualan secara real-time</li>
          <li>Memantau dan memperbarui stok barang</li>
          <li>Mencatat data pelanggan dan hutang</li>
          <li>Menyediakan laporan penjualan</li>
        </ul>
        <p>----------------</p>
        <p className=" text-sm">
          Dikembangkan oleh Outlook Project &copy; 2025
        </p>
        <p className="text-gray-500 text-xs">Contact us: </p>
        <div className="flex space-x-2 mt-2 text-[30px] text-black">
          <a
            href="https://wa.me/6281917250391"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500"
          >
            <FaWhatsapp size={25} />
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=outlookest2019@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500"
          >
            <FiMail size={25} />
          </a>
          <a
            href="https://www.instagram.com/outlookofficial_/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 mb-3"
          >
            <FaInstagram size={25} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Tentang;
