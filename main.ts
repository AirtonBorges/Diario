
const nomeLivro = 'diario';
const caminhoPaginas = 'C:/Obsidian/DailyNotes';
const nomes: string[] = [];
const nomeArquivosIgnorar = ['excalidraw', 'sync'];
const nomeArquivosParaConsiderar = ['diario', 'diário', 'Diário', 'journal', 'jornal', 'Journal', 'Page', 'page'];

const metadata = `---
title: Diário
author: "Airton Borges"
---`;

console.log();

await sanitizaArquivos(caminhoPaginas);

Deno.writeTextFileSync(`${caminhoPaginas}/${nomeLivro}.md`, metadata);

nomes.forEach((fileName) => {
  const filePath = `${fileName}.md`;
  const fileContent = Deno.readTextFileSync(filePath);
  const titulo = fileName.split('/').pop();
  const text = `\n\n## ${titulo}\n\n${fileContent}`;
  const textoFinal = sanitizar(text);

  Deno.writeTextFileSync(`${caminhoPaginas}/${nomeLivro}.md`, textoFinal, { append: true });
});

function sanitizar(texto: string) {
  const retorno = texto.replace(/!\[\[(.*)\]\]/g, '\!\[$1\]\($1\)');
  return retorno;
}
const command = new Deno.Command('pandoc', {
  cwd: Deno.cwd(),
  args: [
    '-f', 'markdown',
    '-t', 'epub3',
    '--resource-path', './recursos',
    '-o', `./${nomeLivro}.epub`,
    `${caminhoPaginas}/${nomeLivro}.md`,
  ],
});

const { code, stdout, stderr } = await command.output();

if (code === 0) {
  // console.log(new TextDecoder().decode(stdout));
} else {
  // console.error(new TextDecoder().decode(stderr));
}

async function sanitizaArquivos(caminho: string) {
  for await (const item of Deno.readDir(caminho)) {
    const nomeArquivo = `${caminho}/${item.name}`;

    if (item.isDirectory)
      await sanitizaArquivos(`${nomeArquivo}`);

    if (!item.isFile)
      continue;

    // [sync] - 2021-08-01.sync.md
    if (nomeArquivosIgnorar.some((p) => nomeArquivo.includes(p)))
      continue;

    if (nomeArquivo.endsWith('.md')) {

      // [diario] - 2021-08-01.diario.md
      if (!nomeArquivosParaConsiderar.some(p => nomeArquivo.includes(p))) {
        continue;
      }
      console.log(item.name);

      nomes.push(nomeArquivo.replace('.md', ''));
    }
    else {
      Deno.copyFileSync(nomeArquivo, `./recursos/${item.name}`);
    }
  }
}
