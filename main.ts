
const metadata = `---
title: Diário
author: "Airton Borges"
missing-images: |
  ![shrek](./paginas/shrek.jpg)
---`;

const caminhoPaginas = './paginas';
const nomes = [];

// Read all files from the folder
for await (const item of Deno.readDir(caminhoPaginas)) {
  const nomeArquivo = item.name;

  if (nomeArquivo === 'diario.md')
    continue;

  if (!item.isFile)
    continue;

  if (nomeArquivo.endsWith('.md'))
    nomes.push(nomeArquivo.replace('.md', ''));
}

Deno.writeTextFileSync('./paginas/diario.md', metadata);

nomes.forEach((fileName) => {
  const filePath = `${caminhoPaginas}/${fileName}.md`;
  const fileContent = Deno.readTextFileSync(filePath);
  const text = `\n\n## ${fileName}\n\n${fileContent}`;
  Deno.writeTextFileSync('./paginas/diario.md', text, { append: true });
  console.log(text);
});

const command = new Deno.Command('pandoc', {
  cwd: Deno.cwd(),
  args: [
    '-f', 'markdown',
    '-t', 'epub3',
    '-o', 'diario.epub',
    './paginas/diario.md',
  ],
});

const { code, stdout, stderr } = await command.output();

if (code === 0) {
  console.log("Pandoc command executed successfully!");
  console.log(new TextDecoder().decode(stdout));
} else {
  console.error("Error executing Pandoc command.");
  console.error(new TextDecoder().decode(stderr));
}
