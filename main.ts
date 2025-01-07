
const metadata = `---
title: Diário
author: "Airton Borges"
---`;

const caminhoPaginas = './paginas/';
const caminhoDiario = './paginas/diario.md';

const nomes = [];
const outrosArquivos = [];

// Read all files from the folder
for await (const item of Deno.readDir(caminhoPaginas)) {
  const nomeArquivo = item.name;

  if (nomeArquivo === 'diario.md')
    continue;

  if (!item.isFile)
    continue;

  if (nomeArquivo.endsWith('.md'))
    nomes.push(nomeArquivo.replace('.md', ''));
  else
    outrosArquivos.push(caminhoPaginas + nomeArquivo);
}

Deno.writeTextFileSync(caminhoDiario, metadata);

nomes.forEach((p) => {
  const filePath = `${caminhoPaginas}/${p}.md`;
  const fileContent = Deno.readTextFileSync(filePath);
  const text = `\n\n## ${p}\n\n${fileContent}`;
  Deno.writeTextFileSync(caminhoDiario, text, { append: true });
  console.log(text);
});
console.log(outrosArquivos);

const command = new Deno.Command('pandoc', {
  cwd: Deno.cwd(),
  args: [
    '-f', 'markdown',
    '-t', 'epub3',
    '-o', 'diario.epub',
    caminhoDiario,
    './paginas/shrek.jpg'
  ],
});

const { code, stdout, stderr } = await command.output();

if (code === 0) {
  console.log(new TextDecoder().decode(stdout));
} else {
  console.error(new TextDecoder().decode(stderr));
}
