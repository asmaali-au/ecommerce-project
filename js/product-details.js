const SUPABASE_URL = "https://tojdxzcxpqyeaaqoysuy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvamR4emN4cHF5ZWFhcW95c3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTI2ODAsImV4cCI6MjEwNjQyODY4MH0.oK287ZVt1qergcbYHdVxuqn7mNVaKGiP6Kx_ANoWA6A";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
 
async function loadProduct() {
  const { data: product } = await supabaseClient
    .from("product")
    .select("*, category(category_name)")
    .eq("product_id", productId)
    .single();
 
  if (!product) {
    document.getElementById("detail").innerHTML = "<p>Product not found.</p>";
    return;
  }
  document.getElementById("detail").innerHTML = `
    <h2>${product.name}</h2>
    <p>${product.description}</p>
    <p>AED ${product.price}</p>
    <p>Category: ${product.category.category_name}</p>`;
}
loadProduct();