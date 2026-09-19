// Script de setup único: cria o bucket público "banners" no Supabase Storage
// (usado por /admin/banners para o upload das imagens do Hero). Rode com:
//   node scripts/criar-bucket-banners.mjs
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

function lerEnvLocal() {
  const conteudo = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const env = {};
  for (const linhaBruta of conteudo.split("\n")) {
    const linha = linhaBruta.trim();
    if (!linha || linha.startsWith("#") || !linha.includes("=")) continue;
    const idx = linha.indexOf("=");
    env[linha.slice(0, idx).trim()] = linha.slice(idx + 1).trim();
  }
  return env;
}

const env = lerEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: buckets, error: erroLista } = await supabase.storage.listBuckets();
if (erroLista) {
  console.error("Não foi possível listar buckets:", erroLista.message);
  process.exit(1);
}

if (buckets.some((b) => b.name === "banners")) {
  console.log('Bucket "banners" já existe — nada a fazer.');
  process.exit(0);
}

const { error } = await supabase.storage.createBucket("banners", {
  public: true,
  fileSizeLimit: 1024 * 1024 * 10,
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif"],
});

if (error) {
  console.error("Erro ao criar bucket:", error.message);
  process.exit(1);
}

console.log('Bucket "banners" criado com sucesso (público).');
