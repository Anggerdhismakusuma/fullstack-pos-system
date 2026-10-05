import PosClient from "./PostClient";

export default async function Home() {
  let products = [];
  try {
    const res = await fetch('http://127.0.0.1:8000/api/products', { cache: 'no-store' });
    const data = await res.json();
    products = data.data || [];
  } catch (error) {
    console.error("Gagal mengambil data produk dari Laravel");
  }

  return <PosClient products={products} />;
}