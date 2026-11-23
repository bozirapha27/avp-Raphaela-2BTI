const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const dados = await response.json().catch(() => ({}));
  if (!response.ok) {
    const erro = new Error(dados.erro || dados.mensagem || "Não foi possível comunicar com a API.");
    erro.status = response.status;
    throw erro;
  }
  return dados;
}
